/**
 * Readixon — Kullanıcı Servisi (Firestore)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Firestore `/users` koleksiyonundaki kullanıcı dokümanlarını yönetir.
 * Mimari doküman referansı (Bölüm 3.1. Kullanıcılar):
 *
 * {
 *   "uid": "user123",
 *   "username": "kitapkurdu",
 *   "displayName": "Ayşe Yılmaz",
 *   "avatarUrl": "gs://...",
 *   "bio": "Bilim kurgu aşığı.",
 *   "preferredGenres": ["sci-fi", "dystopian"],
 *   "stats": { "followers": 1540, "following": 120, "totalReads": 50000 },
 *   "createdAt": "TIMESTAMP"
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  increment,
  DocumentSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';

import { db, auth } from '../firebase';
import { deleteUser } from 'firebase/auth';
import type { User, CreateUserInput } from '../types';
import { createNotification } from './notificationService';

// ─────────────────────────────────────────────
// Sabitler
// ─────────────────────────────────────────────

export const USERS_COLLECTION = 'users' as const;

// ─────────────────────────────────────────────
// Kullanıcı Profili Oluşturma
// ─────────────────────────────────────────────

/**
 * Yeni kayıt olan kullanıcı için Firestore dokümanı oluşturur.
 * Mimari JSON şemasına birebir uygundur.
 *
 * Bu fonksiyon `authService.signUpWithEmail` ve
 * `authService.signInWithGoogleCredential` (yeni kullanıcı) tarafından
 * otomatik olarak çağrılır.
 *
 * @param input - uid ve displayName zorunlu, diğerleri opsiyonel
 */
export async function createUserProfile(input: CreateUserInput): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, input.uid);

  // Doküman zaten varsa üzerine yazma (idempotent davranış)
  const existing: DocumentSnapshot = await getDoc(userRef);
  if (existing.exists()) {
    return;
  }

  const newUser: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: input.uid,
    username: input.username ?? '',          // Aşama 3'te kullanıcı seçecek
    displayName: input.displayName,
    avatarUrl: input.avatarUrl ?? '',
    bio: input.bio ?? '',
    preferredGenres: input.preferredGenres ?? [], // Aşama 3'te onboarding ile doldurulacak
    stats: {
      followers: 0,
      following: 0,
      totalReads: 0,
    },
    createdAt: serverTimestamp(),
    isAuthor: false,
  };

  await setDoc(userRef, newUser);
}

// ─────────────────────────────────────────────
// Kullanıcı Profili Getirme
// ─────────────────────────────────────────────

/**
 * Belirtilen UID'ye sahip kullanıcının Firestore profilini getirir.
 *
 * @param uid - Firebase Auth UID
 * @returns User dokümanı veya null (bulunamazsa)
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot: DocumentSnapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { uid: snapshot.id, ...snapshot.data() } as User;
}

// ─────────────────────────────────────────────
// Kullanıcı Profili Güncelleme
// ─────────────────────────────────────────────

/**
 * Kullanıcının düzenleyebileceği profil alanlarını günceller.
 *
 * Güvenlik kuralları (Firestore Security Rules) gereği:
 * - Kullanıcılar yalnızca kendi (uid eşleşen) dokümanlarını güncelleyebilir.
 * - `uid`, `stats` ve `createdAt` alanları değiştirilemez.
 *
 * @param uid - Güncelleme yapılacak kullanıcının UID'si
 * @param data - Güncellenecek alanlar (kısmi)
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<User, 'username' | 'displayName' | 'avatarUrl' | 'bio' | 'preferredGenres'>>,
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, data);
}

// ─────────────────────────────────────────────
// Kullanıcıyı Yazar Yapma (Become Author)
// ─────────────────────────────────────────────

/**
 * Kullanıcının isAuthor bayrağını true yapar.
 *
 * @param uid - Güncelleme yapılacak kullanıcının UID'si
 */
export async function becomeAuthor(uid: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { isAuthor: true });
}

// ─────────────────────────────────────────────
// Kullanıcı Adı (Username) ile Profil Getirme
// ─────────────────────────────────────────────

/**
 * Belirtilen kullanıcı adına (username) sahip kullanıcının Firestore profilini getirir.
 * 
 * @param username - Aranacak kullanıcı adı (örn: "kitapkurdu")
 * @returns User dokümanı veya null (bulunamazsa)
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', username),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docSnap = querySnapshot.docs[0];
    return { uid: docSnap.id, ...docSnap.data() } as User;
} catch (error) {
    console.error("Kullanıcı adı ile profil getirilirken hata:", error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Öne Çıkan Yazarları (Featured Authors) Getirme
// ─────────────────────────────────────────────

/**
 * İsAuthor flag'i true olan kullanıcıları getirir. 
 * Takipçi sayısına göre sıralar (Firebase composite index gerektirebilir).
 * 
 * @param limitCount - Getirilecek yazar sayısı
 */
export async function getFeaturedAuthors(limitCount: number = 10): Promise<User[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isAuthor', '==', true),
      // orderBy('stats.followers', 'desc'), // Bu composite index gerektirir. Şimdilik sadece isAuthor filtresiyle çekelim.
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const authors: User[] = [];
    
    querySnapshot.forEach((docSnap) => {
      authors.push({ uid: docSnap.id, ...docSnap.data() } as User);
    });
    
    // Geçici olarak client-side'da takipçiye göre sıralayalım (Eğer orderBy aktif edilmezse)
    return authors.sort((a, b) => (b.stats?.followers || 0) - (a.stats?.followers || 0));
  } catch (error) {
    console.error("Öne çıkan yazarlar getirilirken hata:", error);
    
    // Eğer composite index hatası olursa (örneğin orderBy aktifse), indexsiz fallback:
    try {
      const qFallback = query(
        collection(db, USERS_COLLECTION),
        where('isAuthor', '==', true),
        limit(limitCount)
      );
      const fallbackSnap = await getDocs(qFallback);
      const authors: User[] = [];
      fallbackSnap.forEach((docSnap) => {
        authors.push({ uid: docSnap.id, ...docSnap.data() } as User);
      });
      return authors;
    } catch (e) {
      return [];
    }
  }
}

// ─────────────────────────────────────────────
// Sosyal Ağ (Takip) İşlemleri
// ─────────────────────────────────────────────

/**
 * Kullanıcının (followerId) hedef kullanıcıyı (targetUserId) takip etmesini sağlar.
 * Batch (transactional) işlem ile istatistikleri ve dokümanları günceller.
 */
export async function followUser(followerId: string, targetUserId: string): Promise<boolean> {
  if (!followerId || !targetUserId || followerId === targetUserId) return false;

  try {
    const batch = writeBatch(db);

    // 1. Hedef kullanıcının followers alt koleksiyonuna takipçiyi ekle
    const followerRef = doc(db, USERS_COLLECTION, targetUserId, 'followers', followerId);
    batch.set(followerRef, { followedAt: serverTimestamp() });

    // 2. Takip edenin following alt koleksiyonuna hedefi ekle
    const followingRef = doc(db, USERS_COLLECTION, followerId, 'following', targetUserId);
    batch.set(followingRef, { followedAt: serverTimestamp() });

    // 3. Hedef kullanıcının toplam takipçi sayısını (stats.followers) artır
    const targetUserRef = doc(db, USERS_COLLECTION, targetUserId);
    batch.update(targetUserRef, { 'stats.followers': increment(1) });

    // 4. Takip edenin toplam takip ettiği kişi sayısını (stats.following) artır
    const currentUserRef = doc(db, USERS_COLLECTION, followerId);
    batch.update(currentUserRef, { 'stats.following': increment(1) });

    await batch.commit();

    // Takip bildirimini gönder
    const followerProfile = await getUserProfile(followerId);
    if (followerProfile) {
      await createNotification({
        userId: targetUserId,
        actorId: followerId,
        actorName: followerProfile.displayName,
        actorAvatar: followerProfile.avatarUrl,
        actorUsername: followerProfile.username,
        type: 'follow'
      });
    }

    return true;
  } catch (error) {
    console.error("Takip etme işleminde hata:", error);
    return false;
  }
}

/**
 * Kullanıcının (followerId) hedef kullanıcıyı (targetUserId) takipten çıkmasını sağlar.
 */
export async function unfollowUser(followerId: string, targetUserId: string): Promise<boolean> {
  if (!followerId || !targetUserId || followerId === targetUserId) return false;

  try {
    const batch = writeBatch(db);

    // 1. Alt koleksiyonlardan kayıtları sil
    const followerRef = doc(db, USERS_COLLECTION, targetUserId, 'followers', followerId);
    batch.delete(followerRef);

    const followingRef = doc(db, USERS_COLLECTION, followerId, 'following', targetUserId);
    batch.delete(followingRef);

    // 2. İstatistikleri azalt
    const targetUserRef = doc(db, USERS_COLLECTION, targetUserId);
    batch.update(targetUserRef, { 'stats.followers': increment(-1) });

    const currentUserRef = doc(db, USERS_COLLECTION, followerId);
    batch.update(currentUserRef, { 'stats.following': increment(-1) });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Takipten çıkma işleminde hata:", error);
    return false;
  }
}

/**
 * Takip durumunu kontrol eder.
 */
export async function checkIsFollowing(followerId: string, targetUserId: string): Promise<boolean> {
  if (!followerId || !targetUserId || followerId === targetUserId) return false;
  
  try {
    const followingRef = doc(db, USERS_COLLECTION, followerId, 'following', targetUserId);
    const snap = await getDoc(followingRef);
    return snap.exists();
  } catch (error) {
    console.error("Takip kontrolü sırasında hata:", error);
    return false;
  }
}

/**
 * Kullanıcının takip ettiği kişilerin ID listesini döndürür.
 */
export async function getUserFollowingIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const followingSnapshot = await getDocs(
      collection(db, `${USERS_COLLECTION}/${userId}/following`)
    );
    return followingSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Takip edilenleri çekerken hata:", error);
    return [];
  }
}

/**
 * Kullanıcı arama (displayName alanında prefix arama yapar).
 */
export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    const term = searchTerm.trim();
    if (!term) return [];
    
    const lowerTerm = term.toLowerCase();
    const capitalizedTerm = term.charAt(0).toUpperCase() + lowerTerm.slice(1);

    // 1. Search by username (always lowercase)
    const q1 = query(
      collection(db, USERS_COLLECTION),
      where('username', '>=', lowerTerm),
      where('username', '<=', lowerTerm + '\uf8ff'),
      limit(10)
    );
    
    // 2. Search by raw displayName
    const q2 = query(
      collection(db, USERS_COLLECTION),
      where('displayName', '>=', term),
      where('displayName', '<=', term + '\uf8ff'),
      limit(10)
    );

    // 3. Search by capitalized displayName (common case in Firebase)
    const q3 = query(
      collection(db, USERS_COLLECTION),
      where('displayName', '>=', capitalizedTerm),
      where('displayName', '<=', capitalizedTerm + '\uf8ff'),
      limit(10)
    );
    
    const [snap1, snap2, snap3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);
    
    const usersMap = new Map<string, User>();
    
    const addToMap = (snap: any) => {
      snap.forEach((doc: any) => {
        if (!usersMap.has(doc.id)) {
          usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as User);
        }
      });
    };

    addToMap(snap1);
    addToMap(snap2);
    addToMap(snap3);
    
    return Array.from(usersMap.values());
  } catch (error) {
    console.error("Kullanıcı arama sırasında hata:", error);
    return [];
  }
}

// ─────────────────────────────────────────────
// Kullanıcı Hesabı Silme (Delete Account)
// ─────────────────────────────────────────────

/**
 * Kullanıcının hesabını ve ilişkili tüm verilerini (kitaplar, bölümler, readixler, yorumlar) siler.
 */
export async function deleteUserAccount(): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  const uid = currentUser.uid;

  try {
    const batch = writeBatch(db);

    // 1. Kullanıcının Readix'lerini bul ve sil
    const readixesQuery = query(collection(db, 'readixes'), where('authorId', '==', uid));
    const readixesSnap = await getDocs(readixesQuery);
    for (const docSnap of readixesSnap.docs) {
      batch.delete(docSnap.ref);
    }

    // 2. Kullanıcının Yorumlarını bul ve sil
    const storiesQuery = query(collection(db, 'stories'), where('authorId', '==', uid));
    const storiesSnap = await getDocs(storiesQuery);
    for (const docSnap of storiesSnap.docs) {
      batch.delete(docSnap.ref);
      const chaptersQuery = query(collection(db, 'stories', docSnap.id, 'chapters'));
      const chaptersSnap = await getDocs(chaptersQuery);
      chaptersSnap.forEach(ch => batch.delete(ch.ref));
    }

    // 3. Kullanıcının Profil Dokümanını Sil
    const userRef = doc(db, USERS_COLLECTION, uid);
    batch.delete(userRef);

    // Commit changes
    await batch.commit();

    // 4. Firebase Auth'dan sil
    await deleteUser(currentUser);
    return true;
  } catch (error) {
    console.error('Hesap silme işlemi başarısız:', error);
    return false;
  }
}
