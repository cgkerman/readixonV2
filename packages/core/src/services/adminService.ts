import { collection, getCountFromServer, query, orderBy, limit, getDocs, startAfter, onSnapshot, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserProfile } from './userService';
import type { User, Story } from '../types';

export interface PlatformStats {
  totalUsers: number;
  totalStories: number;
  totalDuels: number;
  totalReadixes: number;
}

/**
 * Platform geneli istatistikleri çeker.
 * Admin paneli dashboard'unda gösterilmek üzere.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const usersColl = collection(db, 'users');
    const storiesColl = collection(db, 'stories');
    const duelsColl = collection(db, 'duels');
    const readixesColl = collection(db, 'readixes');

    const [usersSnap, storiesSnap, duelsSnap, readixesSnap] = await Promise.all([
      getCountFromServer(usersColl),
      getCountFromServer(storiesColl),
      getCountFromServer(duelsColl),
      getCountFromServer(readixesColl)
    ]);

    return {
      totalUsers: usersSnap.data().count,
      totalStories: storiesSnap.data().count,
      totalDuels: duelsSnap.data().count,
      totalReadixes: readixesSnap.data().count,
    };
  } catch (error) {
    console.error('getPlatformStats hatası:', error);
    // Hata durumunda default değerler döner
    return {
      totalUsers: 0,
      totalStories: 0,
      totalDuels: 0,
      totalReadixes: 0,
    };
  }
}

export interface PaginatedAdminResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
}

/**
 * Admin paneli için kullanıcı listesini getirir.
 */
export async function getAdminUsers(limitCount = 50, lastDoc?: DocumentSnapshot | null): Promise<PaginatedAdminResult<User>> {
  try {
    let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (lastDoc) {
      q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
    }

    const snap = await getDocs(q);
    const data = snap.docs.map(doc => doc.data() as User);
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { data, lastDoc: newLastDoc };
  } catch (error) {
    console.error('getAdminUsers hatası:', error);
    return { data: [], lastDoc: null };
  }
}

/**
 * Admin paneli için hikaye listesini getirir.
 */
export async function getAdminStories(limitCount = 50, lastDoc?: DocumentSnapshot | null): Promise<PaginatedAdminResult<Story>> {
  try {
    let q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (lastDoc) {
      q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
    }

    const snap = await getDocs(q);
    const docsData = snap.docs.map(doc => ({ storyId: doc.id, ...doc.data() } as Story));

    const authorCache: Record<string, Partial<Story>> = {};

    const data = await Promise.all(docsData.map(async (story) => {
      if (story.authorId && (!story.authorName || !story.authorAvatarUrl)) {
        if (!authorCache[story.authorId]) {
          const profile = await getUserProfile(story.authorId);
          if (profile) {
            authorCache[story.authorId] = {
              authorName: profile.displayName || profile.username,
              authorUsername: profile.username,
              authorAvatarUrl: profile.avatarUrl
            };
          } else {
            authorCache[story.authorId] = { authorName: 'Bilinmeyen Yazar' };
          }
        }
        const cached = authorCache[story.authorId];
        return {
          ...story,
          authorName: story.authorName || cached.authorName,
          authorUsername: story.authorUsername || cached.authorUsername,
          authorAvatarUrl: story.authorAvatarUrl || cached.authorAvatarUrl
        };
      }
      return story;
    }));

    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { data, lastDoc: newLastDoc };
  } catch (error) {
    console.error('getAdminStories hatası:', error);
    return { data: [], lastDoc: null };
  }
}

export interface ActivityDataPoint {
  date: string; // YYYY-MM-DD
  newUsers: number;
  newStories: number;
}

/**
 * Performanslı anlık aktivite dinleyicisi.
 * Sadece en son eklenen kısıtlı sayıdaki belgeyi dinler ve günlere göre gruplar.
 */
export function listenToRecentActivity(
  limitCount = 100, 
  onUpdate: (data: ActivityDataPoint[]) => void
) {
  const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
  const storiesQ = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(limitCount));

  let latestUsers: any[] = [];
  let latestStories: any[] = [];

  const processAndTriggerUpdate = () => {
    // Son 14 günü oluştur (boş değerlerle)
    const dataMap = new Map<string, ActivityDataPoint>();
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dataMap.set(dateStr, { date: dateStr, newUsers: 0, newStories: 0 });
    }

    // Kullanıcıları grupla
    latestUsers.forEach(u => {
      if (u.createdAt) {
        const dateStr = new Date(u.createdAt.seconds * 1000).toISOString().split('T')[0];
        if (dataMap.has(dateStr)) {
          const item = dataMap.get(dateStr)!;
          item.newUsers += 1;
        }
      }
    });

    // Hikayeleri grupla
    latestStories.forEach(s => {
      if (s.createdAt) {
        const dateStr = new Date(s.createdAt.seconds * 1000).toISOString().split('T')[0];
        if (dataMap.has(dateStr)) {
          const item = dataMap.get(dateStr)!;
          item.newStories += 1;
        }
      }
    });

    // Sadece formatı düzgün olması için (Örn: "05 Tem") tarihi kısaltabiliriz ama grafikte yaparız
    onUpdate(Array.from(dataMap.values()));
  };

  const unsubUsers = onSnapshot(usersQ, (snap) => {
    latestUsers = snap.docs.map(doc => doc.data());
    processAndTriggerUpdate();
  });

  const unsubStories = onSnapshot(storiesQ, (snap) => {
    latestStories = snap.docs.map(doc => doc.data());
    processAndTriggerUpdate();
  });

  // Dinlemeyi durdurmak için temizlik fonksiyonu döner
  return () => {
    unsubUsers();
    unsubStories();
  };
}
