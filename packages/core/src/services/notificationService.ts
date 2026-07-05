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
