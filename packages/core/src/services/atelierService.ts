import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  AuthorSite, 
  AuthorBlogPost, 
  AuthorSubscriber 
} from '../types/atelier';
import { createDefaultAuthorSite } from '../types/atelier';

const SITES_COLLECTION = 'author_sites';

/**
 * Kullanıcı kimliğine (userId) göre yazar web sitesi konfigürasyonunu getirir.
 */
export async function getAuthorSiteByUserId(userId: string): Promise<AuthorSite | null> {
  if (!userId) return null;
  try {
    const siteRef = doc(db, SITES_COLLECTION, userId);
    const snap = await getDoc(siteRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as AuthorSite;
  } catch (err) {
    console.error('[atelierService] getAuthorSiteByUserId hatası:', err);
    return null;
  }
}

/**
 * Kullanıcı adına veya slug'a göre kamuya açık yazar sitesini getirir.
 * "@username" veya "username" formatlarını otomatik temizler.
 */
export async function getAuthorSiteByUsername(rawUsername: string): Promise<AuthorSite | null> {
  if (!rawUsername) return null;
  const cleanUsername = rawUsername.replace(/^@/, '').trim().toLowerCase();

  try {
    // 1. Önce doğrudan slug ile eşleşen siteyi ara
    const slugQ = query(
      collection(db, SITES_COLLECTION),
      where('slug', '==', cleanUsername),
      limit(1)
    );
    const slugSnap = await getDocs(slugQ);
    if (!slugSnap.empty) {
      const docData = slugSnap.docs[0];
      return { id: docData.id, ...docData.data() } as AuthorSite;
    }

    // 2. Slug bulunamazsa username ile ara
    const userQ = query(
      collection(db, SITES_COLLECTION),
      where('username', '==', cleanUsername),
      limit(1)
    );
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      const docData = userSnap.docs[0];
      return { id: docData.id, ...docData.data() } as AuthorSite;
    }

    // 3. Doğrudan id (userId) olarak girilmiş olabilir mi?
    const directRef = doc(db, SITES_COLLECTION, rawUsername);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      return { id: directSnap.id, ...directSnap.data() } as AuthorSite;
    }

    return null;
  } catch (err) {
    console.error('[atelierService] getAuthorSiteByUsername hatası:', err);
    return null;
  }
}

/**
 * Yazar sitesi ayarlarını kaydeder (varsa günceller, yoksa oluşturur).
 */
export async function saveAuthorSite(
  siteData: Partial<AuthorSite> & { userId: string }
): Promise<void> {
  if (!siteData.userId) throw new Error('Yazar kimliği eksik.');

  const siteRef = doc(db, SITES_COLLECTION, siteData.userId);
  const snap = await getDoc(siteRef);

  const payload: any = {
    ...siteData,
    id: siteData.userId,
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    payload.createdAt = serverTimestamp();
    if (payload.isPublished) {
      payload.publishedAt = serverTimestamp();
    }
  }

  await setDoc(siteRef, payload, { merge: true });
}

/**
 * Yazar sitesini yayına alır veya yayından kaldırır.
 */
export async function setAuthorSitePublishedStatus(
  userId: string,
  isPublished: boolean
): Promise<void> {
  if (!userId) throw new Error('Yazar kimliği eksik.');

  const siteRef = doc(db, SITES_COLLECTION, userId);
  const snap = await getDoc(siteRef);

  const updates: any = {
    userId,
    isPublished,
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    updates.id = userId;
    updates.createdAt = serverTimestamp();
    if (isPublished) {
      updates.publishedAt = serverTimestamp();
    }
  } else {
    const existingData = snap.data();
    if (isPublished && !existingData?.publishedAt) {
      updates.publishedAt = serverTimestamp();
    }
  }

  await setDoc(siteRef, updates, { merge: true });
}

/**
 * Ziyaretçinin yazar bültenine abone olmasını sağlar.
 */
export async function subscribeToAuthorNewsletter(
  siteId: string,
  email: string,
  source: 'site_footer' | 'hero_cta' | 'blog_post' | 'direct' = 'direct'
): Promise<{ success: boolean; message: string }> {
  if (!siteId || !email) {
    return { success: false, message: 'Geçersiz parametreler.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  // Temel e-posta doğrulama
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Lütfen geçerli bir e-posta adresi girin.' };
  }

  try {
    const subId = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const subRef = doc(db, SITES_COLLECTION, siteId, 'subscribers', subId);
    const existing = await getDoc(subRef);

    if (existing.exists() && existing.data().status === 'active') {
      return { success: true, message: 'Zaten bu yazarın bültenine abonesiniz!' };
    }

    await setDoc(subRef, {
      id: subId,
      email: cleanEmail,
      createdAt: serverTimestamp(),
      status: 'active',
      source,
    });

    // Ana dokümandaki abone sayacını artır
    const siteRef = doc(db, SITES_COLLECTION, siteId);
    await updateDoc(siteRef, {
      'analytics.subscribersCount': increment(1),
    }).catch(() => {});

    return { success: true, message: 'Yazarın bültenine başarıyla abone oldunuz!' };
  } catch (err: any) {
    console.error('[atelierService] subscribeToAuthorNewsletter hatası:', err);
    return { success: false, message: 'Abonelik sırasında bir sorun oluştu.' };
  }
}

/**
 * Site görüntülenme veya kitap tıklama telemetrisini artırır.
 */
export async function trackSiteEvent(
  siteId: string,
  event: 'view' | 'book_click'
): Promise<void> {
  if (!siteId) return;

  try {
    const siteRef = doc(db, SITES_COLLECTION, siteId);
    if (event === 'view') {
      await updateDoc(siteRef, {
        'analytics.totalViews': increment(1),
      });
    } else if (event === 'book_click') {
      await updateDoc(siteRef, {
        'analytics.bookClicks': increment(1),
      });
    }
  } catch (err) {
    // Analytics hataları kullanıcı deneyimini bozmamalı
  }
}

/**
 * Yazarın bülten abonelerini listeler (CSV dışa aktarım veya stüdyo paneli için).
 */
export async function getAuthorSubscribers(siteId: string): Promise<AuthorSubscriber[]> {
  if (!siteId) return [];
  try {
    const subsQ = query(
      collection(db, SITES_COLLECTION, siteId, 'subscribers'),
      orderBy('createdAt', 'desc'),
      limit(250)
    );
    const snap = await getDocs(subsQ);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuthorSubscriber));
  } catch (err) {
    console.error('[atelierService] getAuthorSubscribers hatası:', err);
    return [];
  }
}

