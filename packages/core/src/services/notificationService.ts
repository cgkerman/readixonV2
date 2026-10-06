import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  updateDoc,
  serverTimestamp,
  writeBatch,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { USERS_COLLECTION } from './userService';
import type { AppNotification } from '../types';

/**
 * Creates a new notification for a specific user.
 */
export async function createNotification(
  data: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>
): Promise<string | null> {
  // Do not notify if actor is the same as the user receiving the notification
  if (data.userId === data.actorId) {
    return null;
  }

  try {
    const notificationsRef = collection(db, USERS_COLLECTION, data.userId, 'notifications');
    const newNotifRef = doc(notificationsRef);
    
    const notification: AppNotification = {
      ...data,
      id: newNotifRef.id,
      isRead: false,
      createdAt: serverTimestamp() as any,
    };

    await setDoc(newNotifRef, notification);

    // FCM Push Bildirimi tetikle (telefon kapalı/kilitli olsa dahi anında iletilir)
    if (typeof window !== 'undefined') {
      const actor = data.actorName || data.actorUsername || 'Readixon';
      let bodyText = 'Yeni bir bildirim aldınız.';
      let route = '/notifications';

      switch (data.type) {
        case 'follow':
          bodyText = `${actor} seni takip etmeye başladı.`;
          route = data.actorUsername ? `/profile/${data.actorUsername}` : '/notifications';
          break;
        case 'story_like':
          bodyText = data.entityTitle ? `${actor} "${data.entityTitle}" hikayeni beğendi.` : `${actor} hikayeni beğendi.`;
          route = data.entityId ? `/read/${data.entityId}` : '/notifications';
          break;
        case 'chapter_like':
          bodyText = data.subEntityTitle ? `${actor} "${data.subEntityTitle}" bölümünü beğendi.` : `${actor} bir bölümünü beğendi.`;
          route = data.entityId && data.subEntityId ? `/read/${data.entityId}/${data.subEntityId}` : '/notifications';
          break;
        case 'story_comment':
          bodyText = data.entityTitle ? `${actor} "${data.entityTitle}" hikayene yorum yaptı.` : `${actor} hikayene yorum yaptı.`;
          route = data.entityId ? `/read/${data.entityId}` : '/notifications';
          break;
        case 'paragraph_comment':
          bodyText = `${actor} bir cümlene yorum bıraktı.`;
          route = data.entityId && data.subEntityId ? `/read/${data.entityId}/${data.subEntityId}` : '/notifications';
          break;
        case 'readix_like':
          bodyText = `${actor} Readix gönderini beğendi.`;
          route = '/readix';
          break;
        case 'readix_comment':
          bodyText = `${actor} Readix gönderine yorum yaptı.`;
          route = '/readix';
          break;
        case 'readix_mention':
          bodyText = `${actor} bir Readix gönderisinde senden bahsetti.`;
          route = '/readix';
          break;
        case 'new_chapter':
          bodyText = data.subEntityTitle ? `${actor} yeni bir bölüm yayınladı: "${data.subEntityTitle}"` : `${actor} yeni bir bölüm yayınladı.`;
          route = data.entityId && data.subEntityId ? `/read/${data.entityId}/${data.subEntityId}` : '/notifications';
          break;
        case 'duel_challenge':
          bodyText = `${actor} seni bir edebi düelloya davet etti!`;
          route = data.entityId ? `/arena/duel/${data.entityId}` : '/arena';
          break;
        default:
          bodyText = `${actor} sana bir bildirim gönderdi.`;
      }

      const baseUrl = window.location.origin.includes('http') && !window.location.origin.includes('localhost')
        ? window.location.origin
        : 'https://www.readixon.com';

      fetch(`${baseUrl}/api/notifications/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.userId,
          title: 'Readixon',
          body: bodyText,
          route,
          data: {
            type: data.type,
            notificationId: newNotifRef.id,
            actorId: data.actorId,
            targetUserId: data.userId,
          },
        }),
      }).catch((err) => console.warn('[FCM] Etkileşim bildirimi gönderilemedi:', err));
    }

    return newNotifRef.id;
  } catch (error) {
    console.error("Bildirim oluşturulurken hata:", error);
    return null;
  }
}

/**
 * Fetches recent notifications for a user (paginated/limited).
 */
export async function getNotifications(userId: string, limitCount = 50): Promise<AppNotification[]> {
  if (!userId) return [];
  
  try {
    const q = query(
      collection(db, USERS_COLLECTION, userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
  } catch (error) {
    console.error("Bildirimleri çekerken hata:", error);
    return [];
  }
}

/**
 * Marks a single notification as read.
 */
export async function markAsRead(userId: string, notificationId: string): Promise<boolean> {
  if (!userId || !notificationId) return false;

  try {
    const notifRef = doc(db, USERS_COLLECTION, userId, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
    return true;
  } catch (error) {
    console.error("Bildirim okundu olarak işaretlenirken hata:", error);
    return false;
  }
}

/**
 * Marks all unread notifications for a user as read.
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const unreadQuery = query(
      collection(db, USERS_COLLECTION, userId, 'notifications'),
      where('isRead', '==', false)
    );
    
    const snap = await getDocs(unreadQuery);
    if (snap.empty) return true;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { isRead: true });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Tüm bildirimleri okundu olarak işaretlerken hata:", error);
    return false;
  }
}

/**
 * Subscribes to the unread notifications count for real-time badge updates.
 */
export function onUnreadNotificationsCount(
  userId: string, 
  callback: (count: number) => void
): () => void {
  if (!userId) {
    callback(0);
    return () => {};
  }

  const unreadQuery = query(
    collection(db, USERS_COLLECTION, userId, 'notifications'),
    where('isRead', '==', false)
  );

  return onSnapshot(
    unreadQuery,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error("Okunmamış bildirim sayısı dinlenirken hata:", error);
      callback(0);
    }
  );
}
