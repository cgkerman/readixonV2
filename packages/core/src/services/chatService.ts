import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Chat, Message, ChatParticipant } from '../types';
import { getUserProfile } from './userService';

const CHATS_COLLECTION = 'chats';

/**
 * Creates a unique chat ID between two users.
 */
export function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

/**
 * Creates or retrieves an existing chat between two users.
 */
export async function createOrGetChat(currentUserId: string, targetUserId: string): Promise<string> {
  const chatId = getChatId(currentUserId, targetUserId);
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  
  const snap = await getDoc(chatRef);
  if (snap.exists()) {
    return chatId;
  }

  // Create new chat
  const [currentUser, targetUser] = await Promise.all([
    getUserProfile(currentUserId),
    getUserProfile(targetUserId)
  ]);

  if (!currentUser || !targetUser) {
    throw new Error('User profiles not found');
  }

  const newChat: Omit<Chat, 'id'> = {
    participants: [currentUserId, targetUserId],
    participantDetails: {
      [currentUserId]: {
        uid: currentUserId,
        displayName: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl
      },
      [targetUserId]: {
        uid: targetUserId,
        displayName: targetUser.displayName,
        username: targetUser.username,
        avatarUrl: targetUser.avatarUrl
      }
    },
    lastMessage: '',
    lastMessageAt: null,
    unreadCounts: {
      [currentUserId]: 0,
      [targetUserId]: 0
    },
    status: 'pending',
    requestedBy: currentUserId,
    createdAt: serverTimestamp() as Timestamp
  };

  await setDoc(chatRef, newChat);
  return chatId;
}

/**
 * Subscribes to all chats for a given user.
 * Separates them into 'accepted' and 'pending' in the UI.
 */
export function subscribeToChats(uid: string, callback: (chats: Chat[]) => void): () => void {
  const chatsQuery = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(chatsQuery, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];
    
    // Sort chats with empty lastMessageAt to the bottom, but newly created pending chats to top
    chats.sort((a, b) => {
      const timeA = a.lastMessageAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const timeB = b.lastMessageAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });

    callback(chats);
  });
}

/**
 * Subscribes to messages within a specific chat.
 */
export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
  const messagesQuery = query(
    collection(db, `${CHATS_COLLECTION}/${chatId}/messages`),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
}

/**
 * Sends a new message in a chat.
 */
export async function sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const chatSnap = await getDoc(chatRef);
  
  if (!chatSnap.exists()) return;
  
  const chatData = chatSnap.data() as Chat;
  const receiverId = chatData.participants.find(id => id !== senderId);
  
  if (!receiverId) return;

  const messagesRef = collection(db, `${CHATS_COLLECTION}/${chatId}/messages`);
  
  // 1. Add message
  await addDoc(messagesRef, {
    senderId,
    text,
    isRead: false,
    createdAt: serverTimestamp()
  });

  // 2. Update chat metadata
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCounts.${receiverId}`]: increment(1)
  });
}

/**
 * Marks a chat as read for a specific user.
 */
export async function markChatAsRead(chatId: string, uid: string): Promise<void> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    [`unreadCounts.${uid}`]: 0
  });
}

/**
 * Accepts a pending chat request.
 */
export async function acceptChatRequest(chatId: string): Promise<void> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    status: 'accepted'
  });
}

/**
 * Declines and deletes a pending chat request.
 */
export async function declineChatRequest(chatId: string): Promise<void> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  
  // Delete all messages inside subcollection first
  const messagesSnap = await getDocs(collection(db, `${CHATS_COLLECTION}/${chatId}/messages`));
  const deletePromises = messagesSnap.docs.map(messageDoc => deleteDoc(messageDoc.ref));
  await Promise.all(deletePromises);
  
  // Delete chat document
  await deleteDoc(chatRef);
}
