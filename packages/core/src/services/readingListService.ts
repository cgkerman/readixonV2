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
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ReadingList } from '../types';
import { getUserProfile } from './userService';

const COLLECTION_NAME = 'readingLists';

/**
 * Yeni bir okuma listesi oluşturur.
 */
export const createReadingList = async (
  userId: string,
  data: {
    title: string;
    description?: string;
    isPublic?: boolean;
    storyIds?: string[];
    coverUrl?: string;
  }
): Promise<ReadingList> => {
  if (!titleOrFallback(data.title)) {
    throw new Error('Okuma listesi için bir başlık gereklidir.');
  }

  const listRef = doc(collection(db, COLLECTION_NAME));
  const listId = listRef.id;

  // Kullanıcı profil bilgilerini çek
  let authorName = 'Okur';
  let authorUsername = '';
  let authorAvatar = '';
  try {
    const profile = await getUserProfile(userId);
    if (profile) {
      authorName = profile.displayName || profile.username || 'Okur';
      authorUsername = profile.username || '';
      authorAvatar = profile.avatarUrl || '';
    }
  } catch (err) {
    console.error('Kullanıcı profili alınamadı:', err);
  }

  const newList: ReadingList = {
    id: listId,
    userId,
    userName: authorName,
    userUsername: authorUsername,
    userAvatar: authorAvatar,
    title: data.title.trim(),
    description: data.description?.trim() || '',
    storyIds: data.storyIds || [],
    coverUrl: data.coverUrl || '',
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    likesCount: 0,
    viewsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(listRef, newList);
  return {
    ...newList,
    id: listId,
    createdAt: { seconds: Math.floor(Date.now() / 1000) } as any,
    updatedAt: { seconds: Math.floor(Date.now() / 1000) } as any,
  };
};

/**
 * Okuma listesini günceller (Sadece liste sahibi).
 */
export const updateReadingList = async (
  listId: string,
  userId: string,
  updates: Partial<Pick<ReadingList, 'title' | 'description' | 'isPublic' | 'coverUrl' | 'storyIds'>>
): Promise<void> => {
  const listRef = doc(db, COLLECTION_NAME, listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) {
    throw new Error('Okuma listesi bulunamadı.');
  }

  const existing = snap.data() as ReadingList;
  if (existing.userId !== userId) {
    throw new Error('Bu okuma listesini düzenleme yetkiniz yok.');
  }

  const payload: any = {
    updatedAt: serverTimestamp(),
  };

  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.isPublic !== undefined) payload.isPublic = updates.isPublic;
  if (updates.coverUrl !== undefined) payload.coverUrl = updates.coverUrl;
  if (updates.storyIds !== undefined) payload.storyIds = updates.storyIds;

  await updateDoc(listRef, payload);
};

/**
 * Okuma listesini siler (Sadece liste sahibi).
 */
export const deleteReadingList = async (listId: string, userId: string): Promise<void> => {
  const listRef = doc(db, COLLECTION_NAME, listId);
  const snap = await getDoc(listRef);
  if (!snap.exists()) return;

  const existing = snap.data() as ReadingList;
  if (existing.userId !== userId) {
    throw new Error('Bu okuma listesini silme yetkiniz yok.');
  }

  await deleteDoc(listRef);
};

/**
 * ID'ye göre tek bir okuma listesi getirir.
 */
export const getReadingListById = async (listId: string): Promise<ReadingList | null> => {
  try {
    const listRef = doc(db, COLLECTION_NAME, listId);
    const snap = await getDoc(listRef);
    if (!snap.exists()) return null;

    const data = snap.data() as ReadingList;
    return {
      ...data,
      id: snap.id,
      storyIds: Array.isArray(data.storyIds) ? data.storyIds : [],
    };
  } catch (error) {
    console.error('getReadingListById error:', error);
    return null;
  }
};

/**
 * Belirli bir kullanıcının oluşturduğu tüm okuma listelerini getirir (Gizliler dahil, kendi profili için).
 */
export const getUserReadingLists = async (userId: string): Promise<ReadingList[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      ...(d.data() as ReadingList),
      id: d.id,
      storyIds: Array.isArray(d.data().storyIds) ? d.data().storyIds : [],
    }));
  } catch (error) {
    // Firestore index hatası durumunda fallback (orderBy olmadan)
    try {
      const fallbackQuery = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const fallbackSnap = await getDocs(fallbackQuery);
      const results = fallbackSnap.docs.map(d => ({
        ...(d.data() as ReadingList),
        id: d.id,
        storyIds: Array.isArray(d.data().storyIds) ? d.data().storyIds : [],
      }));
      return results.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } catch (fallbackError) {
      console.error('getUserReadingLists error:', fallbackError);
      return [];
    }
  }
};

/**
 * Belirli bir kullanıcının herkese açık okuma listelerini getirir (Dışarıdan bakanlar için).
 */
export const getPublicUserReadingLists = async (userId: string): Promise<ReadingList[]> => {
  try {
    const lists = await getUserReadingLists(userId);
    return lists.filter(l => l.isPublic);
  } catch (error) {
    console.error('getPublicUserReadingLists error:', error);
    return [];
  }
};

/**
 * Bir hikayeyi okuma listesine ekler.
 */
export const addStoryToReadingList = async (listId: string, storyId: string): Promise<void> => {
  const listRef = doc(db, COLLECTION_NAME, listId);
  await updateDoc(listRef, {
    storyIds: arrayUnion(storyId),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Bir hikayeyi okuma listesinden çıkarır.
 */
export const removeStoryFromReadingList = async (listId: string, storyId: string): Promise<void> => {
  const listRef = doc(db, COLLECTION_NAME, listId);
  await updateDoc(listRef, {
    storyIds: arrayRemove(storyId),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Kullanıcının listelerinden hangilerinin belirli bir hikayeyi içerdiğini döner.
 * Modal içinde checkboxları işaretlemek için kullanılır.
 */
export const getReadingListsContainingStory = async (
  userId: string,
  storyId: string
): Promise<string[]> => {
  try {
    const lists = await getUserReadingLists(userId);
    return lists.filter(l => l.storyIds && l.storyIds.includes(storyId)).map(l => l.id);
  } catch (error) {
    console.error('getReadingListsContainingStory error:', error);
    return [];
  }
};

/**
 * Okuma listesini beğen / beğenmekten vazgeç (Toggle).
 */
export const toggleLikeReadingList = async (userId: string, listId: string): Promise<boolean> => {
  const likeDocRef = doc(db, 'users', userId, 'likedLists', listId);
  const listRef = doc(db, COLLECTION_NAME, listId);

  const likeSnap = await getDoc(likeDocRef);
  if (likeSnap.exists()) {
    // Beğeniyi kaldır
    await deleteDoc(likeDocRef);
    await updateDoc(listRef, {
      likesCount: increment(-1),
    }).catch(() => {});
    return false;
  } else {
    // Beğen
    await setDoc(likeDocRef, {
      listId,
      likedAt: serverTimestamp(),
    });
    await updateDoc(listRef, {
      likesCount: increment(1),
    }).catch(() => {});
    return true;
  }
};

/**
 * Kullanıcının listeyi beğenip beğenmediğini kontrol eder.
 */
export const checkIfReadingListLiked = async (userId: string, listId: string): Promise<boolean> => {
  try {
    const likeDocRef = doc(db, 'users', userId, 'likedLists', listId);
    const snap = await getDoc(likeDocRef);
    return snap.exists();
  } catch (error) {
    console.error('checkIfReadingListLiked error:', error);
    return false;
  }
};

/**
 * Kullanıcının beğendiği / kaydettiği tüm listeleri getirir.
 */
export const getUserLikedReadingLists = async (userId: string): Promise<ReadingList[]> => {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'likedLists'));
    const listIds = snap.docs.map(d => d.id);
    if (listIds.length === 0) return [];

    const fetchedLists: ReadingList[] = [];
    for (const id of listIds) {
      const list = await getReadingListById(id);
      if (list && list.isPublic) {
        fetchedLists.push(list);
      }
    }
    return fetchedLists;
  } catch (error) {
    console.error('getUserLikedReadingLists error:', error);
    return [];
  }
};

/**
 * Popüler / Trend olan herkese açık okuma listelerini getirir.
 */
export const getPopularReadingLists = async (limitCount: number = 8): Promise<ReadingList[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isPublic', '==', true),
      orderBy('likesCount', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      ...(d.data() as ReadingList),
      id: d.id,
      storyIds: Array.isArray(d.data().storyIds) ? d.data().storyIds : [],
    }));
  } catch (error) {
    // Fallback: orderBy olmadan
    try {
      const fallbackQuery = query(
        collection(db, COLLECTION_NAME),
        where('isPublic', '==', true),
        limit(limitCount)
      );
      const snap = await getDocs(fallbackQuery);
      return snap.docs.map(d => ({
        ...(d.data() as ReadingList),
        id: d.id,
        storyIds: Array.isArray(d.data().storyIds) ? d.data().storyIds : [],
      }));
    } catch (e) {
      console.error('getPopularReadingLists error:', e);
      return [];
    }
  }
};

function titleOrFallback(title: string | undefined): boolean {
  return typeof title === 'string' && title.trim().length > 0;
}
