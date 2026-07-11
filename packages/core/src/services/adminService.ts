import { collection, getCountFromServer, query, orderBy, limit, getDocs, startAfter, onSnapshot, type DocumentSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserProfile } from './userService';
import { createNotification } from './notificationService';
import type { User, Story, Readix, Report, ReportStatus } from '../types';

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

/**
 * Admin paneli için Readix gönderileri listesini getirir.
 */
export async function getAdminReadixes(limitCount = 50, lastDoc?: DocumentSnapshot | null): Promise<PaginatedAdminResult<Readix>> {
  try {
    let q = query(collection(db, 'readixes'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (lastDoc) {
      q = query(collection(db, 'readixes'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
    }

    const snap = await getDocs(q);
    const docsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Readix));

    const authorCache: Record<string, Partial<User>> = {};

    const data = await Promise.all(docsData.map(async (readix) => {
      if (readix.authorId) {
        if (!authorCache[readix.authorId]) {
          const profile = await getUserProfile(readix.authorId);
          if (profile) {
            authorCache[readix.authorId] = profile;
          } else {
            authorCache[readix.authorId] = { displayName: 'Bilinmeyen Yazar', username: 'unknown' } as User;
          }
        }
        const profile = authorCache[readix.authorId];
        return {
          ...readix,
          authorName: profile.displayName,
          authorUsername: profile.username,
          authorAvatarUrl: profile.avatarUrl
        } as Readix & { authorName?: string; authorUsername?: string; authorAvatarUrl?: string; };
      }
      return readix;
    }));

    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { data, lastDoc: newLastDoc };
  } catch (error) {
    console.error('getAdminReadixes hatası:', error);
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

// ─────────────────────────────────────────────
// Admin Paneli - Şikayet (Report) İşlemleri
// ─────────────────────────────────────────────

export async function getAdminReports(limitCount = 50, lastDoc?: DocumentSnapshot | null): Promise<PaginatedAdminResult<Report>> {
  try {
    let q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (lastDoc) {
      q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
    }

    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { data, lastDoc: newLastDoc };
  } catch (error) {
    console.error('getAdminReports hatası:', error);
    return { data: [], lastDoc: null };
  }
}

export async function resolveReport(reportId: string, status: ReportStatus): Promise<void> {
  const reportRef = doc(db, 'reports', reportId);
  
  // Şikayeti gönderen kişiye bildirim göndermek için şikayet detayını çek
  const reportSnap = await getDoc(reportRef);
  
  await updateDoc(reportRef, { status, resolvedAt: new Date() });

  if (reportSnap.exists()) {
    const reportData = reportSnap.data() as Report;
    
    let message = '';
    if (status === 'resolved') {
      message = 'Şikayet ettiğiniz içerik incelendi ve işlem yapıldı. Topluluğumuzu güvende tuttuğunuz için teşekkür ederiz.';
    } else if (status === 'dismissed') {
      message = 'Şikayet ettiğiniz içerik incelendi ancak kurallarımıza aykırı bir durum tespit edilemedi.';
    }
    
    if (message && reportData.reporterId) {
      await createNotification({
        userId: reportData.reporterId,
        actorId: 'system',
        actorName: 'Readixon Yönetimi',
        type: 'system_message',
        message,
        entityId: reportData.targetId
      }).catch(e => console.error('Şikayet bildirimi gönderilemedi:', e));
    }
  }
}

export async function deleteReportTarget(targetId: string, targetType: string): Promise<void> {
  let targetRef;
  if (targetType === 'readix') {
    targetRef = doc(db, 'readixes', targetId);
  } else if (targetType === 'story') {
    targetRef = doc(db, 'stories', targetId);
  } else if (targetType === 'user') {
    targetRef = doc(db, 'users', targetId);
  }
  
  if (targetRef) {
    await deleteDoc(targetRef);
  }
}
