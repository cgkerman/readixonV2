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
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Series, SeriesBookItem, SeriesStats } from '../types';
import { generateSeriesSlug, extractSeriesIdFromSlug } from '../utils/slug';
import { getUserProfile } from './userService';

/**
 * Yeni bir Kitap Serisi oluşturur.
 */
export const createSeries = async (authorId: string, data: Partial<Series>): Promise<string> => {
  const seriesRef = collection(db, 'series');
  const newDocRef = doc(seriesRef);
  const seriesId = newDocRef.id;

  const author = await getUserProfile(authorId);
  const title = (data.title || 'İsimsiz Seri').trim();
  const slug = generateSeriesSlug(title, seriesId);

  const newSeries: Series = {
    seriesId,
    universeId: data.universeId || undefined,
    universeTitle: data.universeTitle || undefined,
    authorId,
    authorName: author?.displayName || data.authorName || '',
    authorUsername: author?.username || data.authorUsername || '',
    authorAvatarUrl: author?.avatarUrl || data.authorAvatarUrl || '',
    title,
    slug,
    description: data.description || '',
    coverImage: data.coverImage || '',
    tags: data.tags || [],
    status: data.status || 'ongoing',
    books: data.books || [],
    stats: {
      totalViews: 0,
      totalLikes: 0,
      bookCount: data.books?.length || 0,
    },
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const batch = writeBatch(db);
  batch.set(newDocRef, newSeries);

  // Eğer başlangıçta kitaplar verildiyse her bir Story dokümanını güncelle
  if (data.books && data.books.length > 0) {
    for (const book of data.books) {
      const storyRef = doc(db, 'stories', book.storyId);
      batch.update(storyRef, {
        seriesId,
        seriesTitle: title,
        seriesOrder: book.order,
        seriesLabel: book.customLabel || null,
        updatedAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();

  // İstatistikleri güncel kitaplardan toparla
  if (data.books && data.books.length > 0) {
    await recalculateSeriesStats(seriesId);
  }

  return seriesId;
};

/**
 * Var olan bir seriyi günceller.
 */
export const updateSeries = async (seriesId: string, data: Partial<Series>): Promise<void> => {
  const docRef = doc(db, 'series', seriesId);
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.title) {
    updateData.slug = generateSeriesSlug(data.title.trim(), seriesId);
  }

  await updateDoc(docRef, updateData);

  // Başlık değiştiyse bağlı kitaplardaki seriesTitle'ı da güncelle
  if (data.title) {
    const seriesSnap = await getDoc(docRef);
    if (seriesSnap.exists()) {
      const s = seriesSnap.data() as Series;
      if (s.books && s.books.length > 0) {
        const batch = writeBatch(db);
        for (const b of s.books) {
          batch.update(doc(db, 'stories', b.storyId), {
            seriesTitle: data.title.trim(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    }
  }
};

/**
 * Seriyi siler (Bağlı kitapları silmez, sadece seriden ayırır).
 */
export const deleteSeries = async (seriesId: string): Promise<void> => {
  const docRef = doc(db, 'series', seriesId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const series = snap.data() as Series;
    const batch = writeBatch(db);

    // Bağlı kitaplardan seriyi temizle
    if (series.books && series.books.length > 0) {
      for (const book of series.books) {
        const storyRef = doc(db, 'stories', book.storyId);
        batch.update(storyRef, {
          seriesId: null,
          seriesTitle: null,
          seriesOrder: null,
          seriesLabel: null,
          updatedAt: serverTimestamp(),
        });
      }
    }

    batch.delete(docRef);
    await batch.commit();
  }
};

/**
 * Seri ID ile detay getirir.
 */
export const getSeriesById = async (seriesId: string): Promise<Series | null> => {
  const docRef = doc(db, 'series', seriesId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as Series;
  }
  return null;
};

/**
 * Slug ile seri detayını getirir.
 */
export const getSeriesBySlug = async (slug: string): Promise<Series | null> => {
  const seriesId = extractSeriesIdFromSlug(slug);
  return getSeriesById(seriesId);
};

/**
 * Bir yazarın oluşturduğu tüm serileri getirir.
 */
export const getSeriesByAuthorId = async (authorId: string): Promise<Series[]> => {
  const seriesRef = collection(db, 'series');
  const q = query(seriesRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const seriesList: Series[] = [];
  snapshot.forEach((docSnap) => {
    seriesList.push(docSnap.data() as Series);
  });
  return seriesList;
};

/**
 * Bir kitabın bağlı olduğu seriyi getirir (varsa).
 */
export const getSeriesByStoryId = async (storyId: string): Promise<Series | null> => {
  const storyRef = doc(db, 'stories', storyId);
  const storySnap = await getDoc(storyRef);
  if (!storySnap.exists()) return null;

  const storyData = storySnap.data();
  if (!storyData.seriesId) return null;

  return getSeriesById(storyData.seriesId);
};

/**
 * Seriye yeni bir kitap ekler.
 */
export const addStoryToSeries = async (
  seriesId: string,
  storyId: string,
  customLabel?: string
): Promise<void> => {
  const seriesRef = doc(db, 'series', seriesId);
  const storyRef = doc(db, 'stories', storyId);

  const [seriesSnap, storySnap] = await Promise.all([getDoc(seriesRef), getDoc(storyRef)]);
  if (!seriesSnap.exists() || !storySnap.exists()) {
    throw new Error('Seri veya Hikaye bulunamadı.');
  }

  const seriesData = seriesSnap.data() as Series;
  const currentBooks = seriesData.books || [];

  // Zaten seride varsa ekleme
  if (currentBooks.some((b) => b.storyId === storyId)) {
    return;
  }

  const newOrder = currentBooks.length + 1;
  const newBookItem: SeriesBookItem = {
    storyId,
    order: newOrder,
    customLabel: customLabel || undefined,
  };

  const updatedBooks = [...currentBooks, newBookItem];

  const batch = writeBatch(db);
  batch.update(seriesRef, {
    books: updatedBooks,
    'stats.bookCount': updatedBooks.length,
    updatedAt: serverTimestamp(),
  });

  batch.update(storyRef, {
    seriesId,
    seriesTitle: seriesData.title,
    seriesOrder: newOrder,
    seriesLabel: customLabel || null,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  await recalculateSeriesStats(seriesId);
};

/**
 * Bir kitabı seriden çıkarır.
 */
export const removeStoryFromSeries = async (seriesId: string, storyId: string): Promise<void> => {
  const seriesRef = doc(db, 'series', seriesId);
  const seriesSnap = await getDoc(seriesRef);
  if (!seriesSnap.exists()) return;

  const seriesData = seriesSnap.data() as Series;
  const currentBooks = seriesData.books || [];

  const remainingBooks = currentBooks
    .filter((b) => b.storyId !== storyId)
    .map((b, idx) => ({
      ...b,
      order: idx + 1, // Sıralamayı yeniden normalize et
    }));

  const batch = writeBatch(db);
  batch.update(seriesRef, {
    books: remainingBooks,
    'stats.bookCount': remainingBooks.length,
    updatedAt: serverTimestamp(),
  });

  // Çıkarılan kitabın serisini temizle
  batch.update(doc(db, 'stories', storyId), {
    seriesId: null,
    seriesTitle: null,
    seriesOrder: null,
    seriesLabel: null,
    updatedAt: serverTimestamp(),
  });

  // Kalan kitapların sıralamalarını güncelle
  for (const b of remainingBooks) {
    batch.update(doc(db, 'stories', b.storyId), {
      seriesOrder: b.order,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  await recalculateSeriesStats(seriesId);
};

/**
 * Serideki kitapların sırasını yeniden düzenler.
 */
export const reorderStoriesInSeries = async (
  seriesId: string,
  orderedItems: { storyId: string; customLabel?: string }[]
): Promise<void> => {
  const seriesRef = doc(db, 'series', seriesId);
  const seriesSnap = await getDoc(seriesRef);
  if (!seriesSnap.exists()) return;

  const newBooks: SeriesBookItem[] = orderedItems.map((item, idx) => ({
    storyId: item.storyId,
    order: idx + 1,
    customLabel: item.customLabel || undefined,
  }));

  const batch = writeBatch(db);
  batch.update(seriesRef, {
    books: newBooks,
    updatedAt: serverTimestamp(),
  });

  for (const b of newBooks) {
    batch.update(doc(db, 'stories', b.storyId), {
      seriesOrder: b.order,
      seriesLabel: b.customLabel || null,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
};

/**
 * Seriye bağlı tüm kitapların toplam okunma ve beğeni sayılarını hesaplar.
 */
export const recalculateSeriesStats = async (seriesId: string): Promise<SeriesStats> => {
  const seriesRef = doc(db, 'series', seriesId);
  const seriesSnap = await getDoc(seriesRef);
  if (!seriesSnap.exists()) {
    return { totalViews: 0, totalLikes: 0, bookCount: 0 };
  }

  const seriesData = seriesSnap.data() as Series;
  const books = seriesData.books || [];

  let totalViews = 0;
  let totalLikes = 0;

  for (const b of books) {
    const storySnap = await getDoc(doc(db, 'stories', b.storyId));
    if (storySnap.exists()) {
      const s = storySnap.data();
      totalViews += s.stats?.views || 0;
      totalLikes += s.stats?.likes || 0;
    }
  }

  const newStats: SeriesStats = {
    totalViews,
    totalLikes,
    bookCount: books.length,
  };

  await updateDoc(seriesRef, {
    stats: newStats,
    updatedAt: serverTimestamp(),
  });

  return newStats;
};

/**
 * Keşfet ve Feed için popüler/yayındaki serileri getirir.
 */
export const getPublicSeries = async (limitCount: number = 20): Promise<Series[]> => {
  const seriesRef = collection(db, 'series');
  const q = query(seriesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);

  const list: Series[] = [];
  snap.forEach((d) => {
    const item = d.data() as Series;
    // En az 1 kitabı olan serileri göster
    if (item.books && item.books.length > 0) {
      list.push(item);
    }
  });

  // Eğer kitap bağlı seri yoksa veya erken aşamadaysa mevcut serileri listele
  if (list.length === 0) {
    snap.forEach((d) => {
      list.push(d.data() as Series);
    });
  }

  return list;
};

/**
 * Admin ve Editör paneli için platformdaki tüm serileri getirir.
 */
export const getAllSeries = async (limitCount: number = 100): Promise<Series[]> => {
  const seriesRef = collection(db, 'series');
  const q = query(seriesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);

  const list: Series[] = [];
  snap.forEach((d) => {
    list.push(d.data() as Series);
  });

  return list;
};
