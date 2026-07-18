import { collection, query, where, orderBy, getDocs, limit, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Announcement } from '../types';

/**
 * Yayında olan duyuruları getirir.
 * Feed ve anasayfa gibi yerlerde kullanıcıları bilgilendirmek için kullanılır.
 * @param limitCount Çekilecek duyuru sayısı (varsayılan: 5)
 */
export const getActiveAnnouncements = async (limitCount: number = 5): Promise<Announcement[]> => {
  try {
    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const announcements: Announcement[] = [];
    const now = new Date();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      let isValid = true;

      if (data.publishAt && data.publishAt.toDate() > now) {
        isValid = false;
      }
      if (data.expireAt && data.expireAt.toDate() < now) {
        isValid = false;
      }

      if (isValid) {
        announcements.push({
          id: doc.id,
          ...data
        } as Announcement);
      }
    });

    return announcements;
  } catch (error) {
    console.error("Duyurular çekilirken hata:", error);
    return [];
  }
};

/**
 * Admin paneli için tüm duyuruları getirir (aktif/pasif).
 */
export const getAllAnnouncementsAdmin = async (): Promise<Announcement[]> => {
  try {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const announcements: Announcement[] = [];
    
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data()
      } as Announcement);
    });

    return announcements;
  } catch (error) {
    console.error("Admin duyuruları çekilirken hata:", error);
    return [];
  }
};

/**
 * Yeni bir duyuru oluşturur.
 */
export const createAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const newRef = doc(collection(db, 'announcements'));
    const docData = {
      ...data,
      id: newRef.id,
      createdAt: serverTimestamp()
    };
    await setDoc(newRef, docData);
    return newRef.id;
  } catch (error) {
    console.error("Duyuru oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Var olan duyuruyu günceller.
 */
export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<void> => {
  try {
    const ref = doc(db, 'announcements', id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Duyuru güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Duyuruyu siler.
 */
export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    const ref = doc(db, 'announcements', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Duyuru silinirken hata:", error);
    throw error;
  }
};
