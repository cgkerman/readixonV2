import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SitePopup } from '../types';

const COLLECTION_NAME = 'site_popups';

/**
 * Kullanıcıların siteyi açtığında göreceği aktif pop-up'ı çeker.
 * isActive == true olan ve expireAt süresi dolmamış en güncel pop-up döner.
 */
export const getActiveSitePopup = async (): Promise<SitePopup | null> => {
  try {
    // Sadece isActive filtreleyerek composite index zorunluluğunu kaldırıyoruz
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const popups: SitePopup[] = [];
    const now = Date.now();

    for (const docSnap of snapshot.docs) {
      const data = { id: docSnap.id, ...docSnap.data() } as SitePopup;
      if (data.expireAt) {
        const expireMs = data.expireAt.toMillis ? data.expireAt.toMillis() : (data.expireAt as any).seconds * 1000;
        if (expireMs < now) {
          continue; // Süresi geçmiş
        }
      }
      popups.push(data);
    }

    if (popups.length === 0) return null;

    // En güncel olanı istemci tarafında sırala
    popups.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
      return timeB - timeA;
    });

    return popups[0];
  } catch (error) {
    console.error("Aktif site pop-up çekilirken hata:", error);
    return null;
  }
};

/**
 * Admin paneli için tüm pop-up'ları listeler.
 */
export const getAllSitePopupsAdmin = async (): Promise<SitePopup[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as SitePopup));
  } catch (error) {
    console.error("Pop-up'lar çekilirken hata:", error);
    return [];
  }
};

/**
 * ID'ye göre tekil pop-up çeker.
 */
export const getSitePopupById = async (id: string): Promise<SitePopup | null> => {
  try {
    const ref = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as SitePopup;
    }
    return null;
  } catch (error) {
    console.error("Pop-up çekilirken hata:", error);
    return null;
  }
};

/**
 * Yeni bir pop-up oluşturur.
 */
export const createSitePopup = async (
  data: Omit<SitePopup, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const newRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(newRef, {
      ...data,
      id: newRef.id,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    });
    return newRef.id;
  } catch (error) {
    console.error("Pop-up oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Mevcut pop-up'ı günceller.
 */
export const updateSitePopup = async (
  id: string,
  data: Partial<SitePopup>
): Promise<void> => {
  try {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    });
  } catch (error) {
    console.error("Pop-up güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Pop-up aktif/pasif durumunu hızlıca değiştirir.
 */
export const toggleSitePopupActive = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  try {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      isActive,
      updatedAt: serverTimestamp() as Timestamp,
    });
  } catch (error) {
    console.error("Pop-up durumu değiştirilirken hata:", error);
    throw error;
  }
};

/**
 * Pop-up'ı kalıcı olarak siler.
 */
export const deleteSitePopup = async (id: string): Promise<void> => {
  try {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Pop-up silinirken hata:", error);
    throw error;
  }
};
