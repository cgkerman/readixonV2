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
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { slugify } from '../utils/slugify';
import { createNotification } from './notificationService';
import type {
  ColumnArticle,
  ColumnCategory,
  ColumnStatus,
  ColumnistApplication,
  ApplicationStatus,
  CreateColumnInput,
  CreateApplicationInput,
  User,
} from '../types';

const COLUMNS_COLLECTION = 'columns';
const APPLICATIONS_COLLECTION = 'columnist_applications';
const USERS_COLLECTION = 'users';

function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const plainText = content.replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
}

// ─────────────────────────────────────────────────────────────
// 1. Köşe Yazarlığı Başvuru İşlemleri (Columnist Applications)
// ─────────────────────────────────────────────────────────────

/**
 * Kullanıcı yazar stüdyosundan köşe yazarlığı başvurusu yapar
 */
export async function submitColumnistApplication(
  userId: string,
  input: CreateApplicationInput
): Promise<string> {
  if (!userId) throw new Error('Kullanıcı kimliği bulunamadı.');

  // Halihazırda bekleyen başvuru var mı?
  const existingQ = query(
    collection(db, APPLICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('status', '==', 'pending'),
    limit(1)
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    throw new Error('Zaten inceleme aşamasında bir başvurunuz bulunmaktadır.');
  }

  // Kullanıcı profilini çek
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as User | undefined;

  const plainSampleText = input.sampleContent.replace(/<[^>]+>/g, '').trim();
  const sampleWordCount = plainSampleText ? plainSampleText.split(/\s+/).filter(Boolean).length : 0;

  const appRef = doc(collection(db, APPLICATIONS_COLLECTION));
  const newApp: ColumnistApplication = {
    id: appRef.id,
    userId,

    // 1. Kişisel Bilgiler
    fullName: input.fullName?.trim() || userData?.displayName || 'Yazar',
    username: userData?.username || '',
    email: (userData as any)?.email || auth?.currentUser?.email || '',
    penName: input.penName?.trim() || '',
    bio: input.bio?.trim() || userData?.bio || '',
    portfolioUrl: input.portfolioUrl?.trim() || '',
    userAvatar: userData?.avatarUrl || '',

    // 2. Köşe Yazarlığı Bilgileri
    targetCategories: input.targetCategories || [],
    motivation: input.motivation?.trim() || '',
    hasPriorExperience: Boolean(input.hasPriorExperience),
    priorWorkLinks: input.priorWorkLinks?.trim() || '',
    publishingFrequency: input.publishingFrequency || 'weekly_once',
    preferredTitle: input.preferredTitle?.trim() || 'Köşe Yazarı',

    // 3. Örnek Köşe Yazısı
    sampleTitle: input.sampleTitle?.trim() || '',
    sampleCategory: input.sampleCategory || 'literature',
    sampleSummary: input.sampleSummary?.trim() || '',
    sampleContent: input.sampleContent?.trim() || '',
    sampleWordCount,

    // 4. Beyan ve Onaylar
    accuracyConfirmed: Boolean(input.accuracyConfirmed),
    originalityConfirmed: Boolean(input.originalityConfirmed),
    editorialGuidelinesAccepted: Boolean(input.editorialGuidelinesAccepted),
    noGuaranteedAcceptanceAcknowledged: Boolean(input.noGuaranteedAcceptanceAcknowledged),
    kvkkAccepted: Boolean(input.kvkkAccepted),

    // Geriye dönük uyumluluk alanları
    userName: input.fullName?.trim() || userData?.displayName || 'Yazar',
    userUsername: userData?.username || '',
    userBio: input.bio?.trim() || userData?.bio || '',
    expertiseArea: (input.targetCategories && input.targetCategories.length > 0)
      ? input.targetCategories.join(', ')
      : (input.expertiseArea || 'Edebiyat'),

    status: 'pending',
    createdAt: serverTimestamp() as any,
  };

  await setDoc(appRef, newApp);
  return appRef.id;
}

/**
 * Kullanıcının son köşe yazarlığı başvurusunu getirir
 */
export async function getMyColumnistApplication(userId: string): Promise<ColumnistApplication | null> {
  if (!userId) return null;
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('userId', '==', userId),
      limit(5)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    // En son tarihi olanı al (composite index gereksinimini hafifletmek için client-sort)
    const apps = snap.docs.map(d => ({ id: d.id, ...d.data() } as ColumnistApplication));
    apps.sort((a, b) => {
      const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : ((a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0);
      const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : ((b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0);
      return tB - tA;
    });

    return apps[0];
  } catch (err) {
    console.error('getMyColumnistApplication error:', err);
    return null;
  }
}

/**
 * Admin: Tüm köşe yazarlığı başvurularını listeler
 */
export async function getAllColumnistApplicationsAdmin(
  statusFilter?: ApplicationStatus
): Promise<ColumnistApplication[]> {
  try {
    let q = query(collection(db, APPLICATIONS_COLLECTION), limit(100));
    if (statusFilter) {
      q = query(collection(db, APPLICATIONS_COLLECTION), where('status', '==', statusFilter), limit(100));
    }
    const snap = await getDocs(q);
    const apps = snap.docs.map(d => ({ id: d.id, ...d.data() } as ColumnistApplication));
    apps.sort((a, b) => {
      const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : ((a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0);
      const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : ((b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0);
      return tB - tA;
    });
    return apps;
  } catch (err) {
    console.error('getAllColumnistApplicationsAdmin error:', err);
    return [];
  }
}

/**
 * Admin: Başvuruyu onaylar ve kullanıcıya isColumnist yetkisini tanımlar
 */
export async function approveColumnistApplicationAdmin(
  applicationId: string,
  assignedTitle: string,
  adminId: string
): Promise<void> {
  const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) throw new Error('Başvuru bulunamadı.');

  const appData = appSnap.data() as ColumnistApplication;
  const finalTitle = assignedTitle.trim() || appData.preferredTitle || 'Köşe Yazarı';

  // 1. Başvuru kaydını güncelle
  await updateDoc(appRef, {
    status: 'approved',
    assignedTitle: finalTitle,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
  });

  // 2. Kullanıcıyı köşe yazarı yap
  const userRef = doc(db, USERS_COLLECTION, appData.userId);
  await updateDoc(userRef, {
    isColumnist: true,
    columnistTitle: finalTitle,
    columnistApprovedAt: serverTimestamp(),
  });

  // 3. Kullanıcıya bildirim gönder
  try {
    await createNotification({
      userId: appData.userId,
      actorId: adminId,
      actorName: 'Readixon Editör Masası',
      type: 'system_message',
      entityTitle: 'Köşe Yazarlığı Başvurusu',
      message: 'Tebrikler! Köşe yazarlığı başvurunuz onaylandı. Artık Yazar Stüdyosu\'ndan Gündem için köşe yazıları kaleme alabilirsiniz.',
      entityId: applicationId,
    });
  } catch (notifErr) {
    console.warn('Notification error on columnist approve:', notifErr);
  }
}

/**
 * Admin: Başvuruyu reddeder
 */
export async function rejectColumnistApplicationAdmin(
  applicationId: string,
  reason: string,
  adminId: string
): Promise<void> {
  const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) throw new Error('Başvuru bulunamadı.');

  const appData = appSnap.data() as ColumnistApplication;

  await updateDoc(appRef, {
    status: 'rejected',
    rejectReason: reason.trim() || 'Başvurunuz mevcut yayın kriterleri doğrultusunda şu an için onaylanamamıştır.',
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
  });

  try {
    await createNotification({
      userId: appData.userId,
      actorId: adminId,
      actorName: 'Readixon Editör Masası',
      type: 'system_message',
      entityTitle: 'Köşe Yazarlığı Başvurusu',
      message: `Başvurunuz editörlerimiz tarafından incelenmiş ve geri bildirim verilmiştir. Gerekçe: ${reason}`,
      entityId: applicationId,
    });
  } catch (notifErr) {
    console.warn('Notification error on columnist reject:', notifErr);
  }
}

// ─────────────────────────────────────────────────────────────
// 2. Köşe Yazısı İşlemleri (Column Articles)
// ─────────────────────────────────────────────────────────────

/**
 * Yazar yeni bir köşe yazısı oluşturur (varsayılan: draft)
 */
export async function createColumnArticle(
  authorId: string,
  input: CreateColumnInput
): Promise<string> {
  if (!authorId) throw new Error('Yazar kimliği bulunamadı.');

  // Yazarın profil bilgilerini al
  const userRef = doc(db, USERS_COLLECTION, authorId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as User | undefined;

  const colRef = doc(collection(db, COLUMNS_COLLECTION));
  const baseSlug = slugify(input.title) || 'kose-yazisi';
  const slug = `${baseSlug}-${colRef.id.slice(0, 6)}`;
  const readingTime = calculateReadingTime(input.content);

  const newArticle: ColumnArticle = {
    id: colRef.id,
    slug,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || '',
    content: input.content,
    authorId,
    authorName: userData?.displayName || 'Yazar',
    authorAvatar: userData?.avatarUrl || '',
    authorUsername: userData?.username || '',
    authorTitle: userData?.columnistTitle || 'Köşe Yazarı',
    coverImage: input.coverImage || '',
    category: input.category || 'culture',
    tags: input.tags || [],
    status: input.status || 'draft',
    readingTime,
    isFeatured: false,
    stats: {
      views: 0,
      likes: 0,
      likedBy: [],
      commentCount: 0,
    },
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  await setDoc(colRef, newArticle);
  return colRef.id;
}

/**
 * Köşe yazısını günceller
 */
export async function updateColumnArticle(
  articleId: string,
  authorId: string,
  input: Partial<CreateColumnInput> & { status?: ColumnStatus }
): Promise<void> {
  const colRef = doc(db, COLUMNS_COLLECTION, articleId);
  const colSnap = await getDoc(colRef);
  if (!colSnap.exists()) throw new Error('Köşe yazısı bulunamadı.');

  const existing = colSnap.data() as ColumnArticle;
  if (existing.authorId !== authorId) {
    throw new Error('Bu yazıyı düzenleme yetkiniz yok.');
  }

  const updates: any = {
    updatedAt: serverTimestamp(),
  };

  if (input.title !== undefined) {
    updates.title = input.title.trim();
    const baseSlug = slugify(input.title) || 'kose-yazisi';
    updates.slug = `${baseSlug}-${articleId.slice(0, 6)}`;
  }
  if (input.subtitle !== undefined) updates.subtitle = input.subtitle.trim();
  if (input.content !== undefined) {
    updates.content = input.content;
    updates.readingTime = calculateReadingTime(input.content);
  }
  if (input.coverImage !== undefined) updates.coverImage = input.coverImage;
  if (input.category !== undefined) updates.category = input.category;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.status !== undefined) updates.status = input.status;

  await updateDoc(colRef, updates);
}

/**
 * Köşe yazısını editör onayına gönderir (status: pending)
 */
export async function submitColumnForReview(articleId: string, authorId: string): Promise<void> {
  await updateColumnArticle(articleId, authorId, { status: 'pending' });
}

/**
 * Köşe yazısını siler
 */
export async function deleteColumnArticle(articleId: string, authorId: string, isAdmin = false): Promise<void> {
  const colRef = doc(db, COLUMNS_COLLECTION, articleId);
  const colSnap = await getDoc(colRef);
  if (!colSnap.exists()) return;

  const existing = colSnap.data() as ColumnArticle;
  if (!isAdmin && existing.authorId !== authorId) {
    throw new Error('Bu yazıyı silme yetkiniz yok.');
  }

  await deleteDoc(colRef);
}

/**
 * Yazarın kendi köşe yazılarını getirir
 */
export async function getMyColumnArticles(authorId: string): Promise<ColumnArticle[]> {
  if (!authorId) return [];
  try {
    const q = query(
      collection(db, COLUMNS_COLLECTION),
      where('authorId', '==', authorId),
      limit(50)
    );
    const snap = await getDocs(q);
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() } as ColumnArticle));
    articles.sort((a, b) => {
      const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : ((a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0);
      const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : ((b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0);
      return tB - tA;
    });
    return articles;
  } catch (err) {
    console.error('getMyColumnArticles error:', err);
    return [];
  }
}

/**
 * Tek bir köşe yazısını ID ile çeker
 */
export async function getColumnArticleById(articleId: string): Promise<ColumnArticle | null> {
  if (!articleId) return null;
  try {
    const colRef = doc(db, COLUMNS_COLLECTION, articleId);
    const colSnap = await getDoc(colRef);
    if (!colSnap.exists()) return null;
    return { id: colSnap.id, ...colSnap.data() } as ColumnArticle;
  } catch (err) {
    console.error('getColumnArticleById error:', err);
    return null;
  }
}

/**
 * Tek bir köşe yazısını slug ile çeker (Okuma sayfası için)
 */
export async function getColumnArticleBySlug(slug: string): Promise<ColumnArticle | null> {
  if (!slug) return null;
  try {
    // Önce doğrudan slug ile dene
    const q = query(
      collection(db, COLUMNS_COLLECTION),
      where('slug', '==', slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() } as ColumnArticle;
    }

    // Slug bulunamadıysa ve ID parçası içeriyorsa ID ile fallback dene
    const parts = slug.split('-');
    const potentialId = parts[parts.length - 1];
    if (potentialId && potentialId.length >= 5) {
      const colRef = doc(db, COLUMNS_COLLECTION, potentialId);
      const colSnap = await getDoc(colRef);
      if (colSnap.exists()) {
        return { id: colSnap.id, ...colSnap.data() } as ColumnArticle;
      }
    }

    return null;
  } catch (err) {
    console.error('getColumnArticleBySlug error:', err);
    return null;
  }
}

/**
 * Gündem sayfası için yayındaki köşe yazılarını getirir
 */
export async function getPublishedColumns(options?: {
  category?: ColumnCategory;
  limitCount?: number;
}): Promise<ColumnArticle[]> {
  try {
    const maxLimit = options?.limitCount || 12;
    let q = query(
      collection(db, COLUMNS_COLLECTION),
      where('status', '==', 'published'),
      limit(maxLimit * 2)
    );

    if (options?.category) {
      q = query(
        collection(db, COLUMNS_COLLECTION),
        where('status', '==', 'published'),
        where('category', '==', options.category),
        limit(maxLimit * 2)
      );
    }

    const snap = await getDocs(q);
    if (snap.empty) return [];

    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() } as ColumnArticle));
    
    // Yayın tarihine göre sırala (yeni -> eski)
    articles.sort((a, b) => {
      const tA = (a.publishedAt as any)?.toMillis ? (a.publishedAt as any).toMillis() : ((a.publishedAt as any)?.seconds ? (a.publishedAt as any).seconds * 1000 : 0);
      const tB = (b.publishedAt as any)?.toMillis ? (b.publishedAt as any).toMillis() : ((b.publishedAt as any)?.seconds ? (b.publishedAt as any).seconds * 1000 : 0);
      return tB - tA;
    });

    return articles.slice(0, maxLimit);
  } catch (err) {
    console.error('getPublishedColumns error:', err);
    return [];
  }
}

/**
 * Günün / Haftanın öne çıkan köşe yazısını getirir
 */
export async function getFeaturedColumn(): Promise<ColumnArticle | null> {
  try {
    // 1. Önce isFeatured == true olanı ara
    const featuredQ = query(
      collection(db, COLUMNS_COLLECTION),
      where('status', '==', 'published'),
      where('isFeatured', '==', true),
      limit(1)
    );
    const snap = await getDocs(featuredQ);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as ColumnArticle;
    }

    // 2. Yoksa en son yayınlanan yazıyı döndür
    const latest = await getPublishedColumns({ limitCount: 1 });
    return latest.length > 0 ? latest[0] : null;
  } catch (err) {
    console.error('getFeaturedColumn error:', err);
    return null;
  }
}

/**
 * Aktif köşe yazarlarını getirir (Gündem sayfası portre bandı için)
 */
export async function getActiveColumnists(limitCount = 12): Promise<User[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isColumnist', '==', true),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
  } catch (err) {
    console.error('getActiveColumnists error:', err);
    return [];
  }
}

/**
 * Admin: Tüm köşe yazılarını listeler (Onay havuzu için)
 */
export async function getAllColumnsAdmin(statusFilter?: ColumnStatus): Promise<ColumnArticle[]> {
  try {
    let q = query(collection(db, COLUMNS_COLLECTION), limit(100));
    if (statusFilter) {
      q = query(collection(db, COLUMNS_COLLECTION), where('status', '==', statusFilter), limit(100));
    }
    const snap = await getDocs(q);
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() } as ColumnArticle));
    articles.sort((a, b) => {
      const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : ((a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0);
      const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : ((b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0);
      return tB - tA;
    });
    return articles;
  } catch (err) {
    console.error('getAllColumnsAdmin error:', err);
    return [];
  }
}

/**
 * Admin: Köşe yazısını onaylar ve yayına alır
 */
export async function approveAndPublishColumnAdmin(
  articleId: string,
  adminId: string,
  options?: { isFeatured?: boolean }
): Promise<void> {
  const colRef = doc(db, COLUMNS_COLLECTION, articleId);
  const snap = await getDoc(colRef);
  if (!snap.exists()) throw new Error('Köşe yazısı bulunamadı.');

  const article = snap.data() as ColumnArticle;

  // Eğer bu yazı öne çıkarılacaksa, diğer öne çıkanları kaldır
  if (options?.isFeatured) {
    try {
      const otherFeatured = query(
        collection(db, COLUMNS_COLLECTION),
        where('isFeatured', '==', true),
        limit(5)
      );
      const otherSnap = await getDocs(otherFeatured);
      for (const d of otherSnap.docs) {
        if (d.id !== articleId) {
          await updateDoc(d.ref, { isFeatured: false });
        }
      }
    } catch {
      // ignore
    }
  }

  await updateDoc(colRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    isFeatured: options?.isFeatured || false,
    updatedAt: serverTimestamp(),
  });

  // Yazara bildirim gönder
  try {
    await createNotification({
      userId: article.authorId,
      actorId: adminId,
      actorName: 'Readixon Editör Masası',
      type: 'system_message',
      entityTitle: article.title,
      message: `"${article.title}" başlıklı köşe yazınız editör onayından geçti ve Gündem sayfasında yayına alındı.`,
      entityId: articleId,
    });
  } catch (notifErr) {
    console.warn('Notification error on column publish:', notifErr);
  }
}

/**
 * Admin: Köşe yazısını reddeder
 */
export async function rejectColumnAdmin(
  articleId: string,
  reason: string,
  adminId: string
): Promise<void> {
  const colRef = doc(db, COLUMNS_COLLECTION, articleId);
  const snap = await getDoc(colRef);
  if (!snap.exists()) throw new Error('Köşe yazısı bulunamadı.');

  const article = snap.data() as ColumnArticle;

  await updateDoc(colRef, {
    status: 'rejected',
    rejectReason: reason.trim() || 'Köşe yazınız yayın politikalarımıza uygun görülmemiştir.',
    updatedAt: serverTimestamp(),
  });

  try {
    await createNotification({
      userId: article.authorId,
      actorId: adminId,
      actorName: 'Readixon Editör Masası',
      type: 'system_message',
      entityTitle: article.title,
      message: `"${article.title}" başlıklı yazınız incelendi. Editör notu: ${reason}`,
      entityId: articleId,
    });
  } catch (notifErr) {
    console.warn('Notification error on column reject:', notifErr);
  }
}

/**
 * Admin: Bir yazıyı öne çıkan (featured) yapar veya kaldırır
 */
export async function setFeaturedColumnAdmin(articleId: string, isFeatured: boolean): Promise<void> {
  const colRef = doc(db, COLUMNS_COLLECTION, articleId);
  if (isFeatured) {
    // Önce diğer featured'ları kaldır
    const otherFeatured = query(
      collection(db, COLUMNS_COLLECTION),
      where('isFeatured', '==', true),
      limit(5)
    );
    const otherSnap = await getDocs(otherFeatured);
    for (const d of otherSnap.docs) {
      if (d.id !== articleId) {
        await updateDoc(d.ref, { isFeatured: false });
      }
    }
  }
  await updateDoc(colRef, { isFeatured });
}

/**
 * Köşe yazısını beğenme / beğeniden vazgeçme
 */
export async function toggleColumnLike(articleId: string, userId: string): Promise<boolean> {
  if (!userId) throw new Error('Giriş yapmalısınız.');
  const colRef = doc(db, COLUMNS_COLLECTION, articleId);
  const snap = await getDoc(colRef);
  if (!snap.exists()) throw new Error('Yazı bulunamadı.');

  const data = snap.data() as ColumnArticle;
  const likedBy = data.stats?.likedBy || [];
  const isLiked = likedBy.includes(userId);

  if (isLiked) {
    await updateDoc(colRef, {
      'stats.likes': increment(-1),
      'stats.likedBy': arrayRemove(userId),
    });
    return false;
  } else {
    await updateDoc(colRef, {
      'stats.likes': increment(1),
      'stats.likedBy': arrayUnion(userId),
    });
    return true;
  }
}

/**
 * Köşe yazısı okunma/görüntülenme sayısını artırır
 */
export async function incrementColumnViews(articleId: string): Promise<void> {
  if (!articleId) return;
  try {
    const colRef = doc(db, COLUMNS_COLLECTION, articleId);
    await updateDoc(colRef, {
      'stats.views': increment(1),
    });
  } catch (err) {
    // Non-critical, ignore
  }
}
