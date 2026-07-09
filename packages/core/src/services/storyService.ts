import { collection, query, orderBy, limit, startAfter, getDocs, DocumentSnapshot, doc, setDoc, updateDoc, serverTimestamp, where, getDoc, onSnapshot, deleteDoc, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import type { Story, Chapter, ReadingProgress, Review } from '../types';
import { getUserProfile } from './userService';


/**
 * Hikayeleri Firestore'dan çeker.
 * @param limitCount Çekilecek hikaye sayısı (varsayılan: 10)
 * @param lastDoc Sayfalama (pagination) için son döküman referansı (isteğe bağlı)
 * @returns Çekilen hikayeler ve sayfalama için son döküman snapshot'ı
 */
export const fetchStories = async (limitCount: number = 10, lastDoc?: DocumentSnapshot) => {
  const storiesRef = collection(db, 'stories');
  
  // Sadece yayında (ongoing veya completed) olan hikayeleri getir.
  let q = query(
    storiesRef,
    where('status', 'in', ['ongoing', 'completed']),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  let querySnapshot;
  try {
    querySnapshot = await getDocs(q);
  } catch (error: any) {
    console.error("fetchStories Firebase error:", error.message);
    return {
      stories: [],
      lastDoc: undefined,
    };
  }
  
  const stories: Story[] = [];
  querySnapshot.forEach((doc) => {
    stories.push({
      storyId: doc.id,
      ...doc.data()
    } as Story);
  });

  const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined;

  return {
    stories,
    lastDoc: lastVisible,
  };
};

/**
 * Belirli bir hikayenin bölümlerini Firestore'dan çeker.
 */
export const fetchChapters = async (storyId: string) => {
  try {
    const chaptersRef = collection(db, 'stories', storyId, 'chapters');
    const q = query(chaptersRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const chapters: Chapter[] = [];
    querySnapshot.forEach((doc) => {
      chapters.push({
        chapterId: doc.id,
        ...doc.data()
      } as Chapter);
    });

    if (chapters.length === 0) {
      return [];
    }

    return chapters;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
};

/**
 * Belirli bir bölümün detayını getirir (içerik blokları dahil).
 */
export const fetchChapter = async (storyId: string, chapterId: string) => {
  try {
    // In a real app, you might fetch a specific doc: getDoc(doc(db, 'stories', storyId, 'chapters', chapterId))
    // For now, we reuse fetchChapters since they are small
    const chapters = await fetchChapters(storyId);
    return chapters.find(c => c.chapterId === chapterId) || null;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return null;
  }
};

// ─────────────────────────────────────────────
// STUDIO (YAZAR) OPERASYONLARI
// ─────────────────────────────────────────────

/**
 * Belirli bir hikayeyi Firestore'dan çeker.
 */
export const getStoryById = async (storyId: string) => {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { storyId: snap.id, ...snap.data() } as Story;
    }
    return null;
  } catch (error) {
    console.error("Hikaye çekilirken hata:", error);
    return null;
  }
};

/**
 * Belirli bir yazarın kendi hikayelerini gerçek zamanlı (real-time) olarak getirir.
 */
export const subscribeToAuthorStories = (authorId: string, onUpdate: (stories: Story[]) => void) => {
  const q = query(
    collection(db, 'stories'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  
  // onSnapshot returns an unsubscribe function
  return onSnapshot(q, (querySnapshot) => {
    const stories: Story[] = [];
    querySnapshot.forEach((docSnap) => {
      stories.push({ storyId: docSnap.id, ...docSnap.data() } as Story);
    });
    onUpdate(stories);
  }, (error) => {
    console.error("Yazarın hikayeleri gerçek zamanlı dinlenirken hata:", error);
    onUpdate([]);
  });
};

/**
 * Belirli bir yazarın sadece YAYINDA olan hikayelerini gerçek zamanlı getirir.
 * Bu, Firestore güvenlik kurallarından geçmesi için profil sayfasında kullanılır.
 */
export const subscribeToPublishedAuthorStories = (authorId: string, onUpdate: (stories: Story[]) => void) => {
  const q = query(
    collection(db, 'stories'),
    where('authorId', '==', authorId),
    where('status', 'in', ['ongoing', 'completed']),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const stories: Story[] = [];
    querySnapshot.forEach((docSnap) => {
      stories.push({ storyId: docSnap.id, ...docSnap.data() } as Story);
    });
    onUpdate(stories);
  }, (error) => {
    console.error("Yazarın yayındaki hikayeleri dinlenirken hata:", error);
    onUpdate([]);
  });
};

/**
 * Belirli bir yazarın kendi hikayelerini getirir.
 */
export const getAuthorStories = async (authorId: string) => {
  try {
    const q = query(
      collection(db, 'stories'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    querySnapshot.forEach((docSnap) => {
      stories.push({ storyId: docSnap.id, ...docSnap.data() } as Story);
    });
    
    if (stories.length === 0) {
      return [];
    }
    
    return stories;
  } catch (error) {
    console.error("Yazarın hikayeleri çekilirken hata:", error);
    return [];
  }
};

/**
 * Yeni bir hikaye taslağı oluşturur.
 */
export const createStory = async (authorId: string, data: Partial<Story>) => {
  try {
    const newStoryRef = doc(collection(db, 'stories'));
    const newStory = {
      ...data,
      storyId: newStoryRef.id,
      authorId,
      status: data.status || 'draft',
      stats: { views: 0, likes: 0, chapterCount: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(newStoryRef, newStory);
    return newStoryRef.id;
  } catch (error) {
    console.error("Hikaye oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Hikaye detaylarını günceller.
 */
export const updateStory = async (storyId: string, data: Partial<Story>) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Hikaye güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Yeni bölüm oluşturur.
 */
export const createChapter = async (storyId: string, data: Partial<Chapter>) => {
  try {
    const newChapterRef = doc(collection(db, 'stories', storyId, 'chapters'));
    const newChapter = {
      ...data,
      chapterId: newChapterRef.id,
      publishDate: serverTimestamp(),
    };
    await setDoc(newChapterRef, newChapter);
    
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);
    if (storySnap.exists()) {
      const stats = storySnap.data().stats;
      await updateDoc(storyRef, {
        'stats.chapterCount': (stats?.chapterCount || 0) + 1,
        updatedAt: serverTimestamp()
      });
    }

    return newChapterRef.id;
  } catch (error) {
    console.error("Bölüm oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Bölüm içeriğini günceller.
 */
export const updateChapter = async (storyId: string, chapterId: string, data: Partial<Chapter>) => {
  try {
    const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    await updateDoc(chapterRef, data);
  } catch (error) {
    console.error("Bölüm güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Bölümü tamamen siler.
 */
export const deleteChapter = async (storyId: string, chapterId: string) => {
  try {
    const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    await deleteDoc(chapterRef);
    
    // Hikayedeki chapterCount değerini güncelle
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);
    if (storySnap.exists()) {
      const stats = storySnap.data().stats;
      await updateDoc(storyRef, {
        'stats.chapterCount': Math.max(0, (stats?.chapterCount || 0) - 1),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Bölüm silinirken hata:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// BÖLÜM (CHAPTER) İŞLEMLERİ
// ─────────────────────────────────────────────

/**
 * Hikayenin yayında olan tüm bölümlerini getirir.
 */
export const getPublishedChapters = async (storyId: string): Promise<Chapter[]> => {
  try {
    // order alanına göre orderBy yaparsak, order alanı olmayan bölümler Firestore tarafından elenir.
    // Bu yüzden tüm bölümleri çekip istemcide sıralıyoruz.
    const q = collection(db, 'stories', storyId, 'chapters');
    const snap = await getDocs(q);
    const chapters: Chapter[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Chapter;
      // Eski bölümlerde status alanı yoksa veya "published" veya "scheduled" ise listeye ekle
      if (!data.status || data.status === 'published' || data.status === 'scheduled') {
        chapters.push({ ...data, chapterId: docSnap.id });
      }
    });
    
    // Client-side sıralama (önce order, yoksa publishDate veya oluşturma sırası)
    chapters.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
    
    return chapters;
  } catch (error) {
    console.error("Bölümler çekilirken hata:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// OKUMA İLERLEMESİ (READING PROGRESS)
// ─────────────────────────────────────────────

/**
 * Kullanıcının hikayedeki okuma ilerlemesini kaydeder veya günceller.
 */
export const syncReadingProgress = async (
  userId: string,
  storyId: string,
  currentChapterId: string,
  scrollPercentage: number,
  isChapterCompleted: boolean
) => {
  try {
    const progressRef = doc(db, 'users', userId, 'readingProgress', storyId);
    const snap = await getDoc(progressRef);
    
    let completedChapters: string[] = [];
    if (snap.exists()) {
      const data = snap.data() as ReadingProgress;
      completedChapters = data.completedChapters || [];
    }
    
    if (isChapterCompleted && !completedChapters.includes(currentChapterId)) {
      completedChapters.push(currentChapterId);
    }
    
    const progressData: ReadingProgress = {
      userId,
      storyId,
      currentChapterId,
      scrollPercentage,
      completedChapters,
      updatedAt: serverTimestamp() as any,
    };
    
    await setDoc(progressRef, progressData, { merge: true });
  } catch (error) {
    console.error("Okuma ilerlemesi kaydedilirken hata:", error);
  }
};

/**
 * Kullanıcının hikayedeki ilerleme bilgisini getirir.
 */
export const getReadingProgress = async (userId: string, storyId: string): Promise<ReadingProgress | null> => {
  try {
    const progressRef = doc(db, 'users', userId, 'readingProgress', storyId);
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      return snap.data() as ReadingProgress;
    }
    return null;
  } catch (error) {
    console.error("Okuma ilerlemesi çekilirken hata:", error);
    return null;
  }
};

/**
 * Yetişkin içerik okuma onayını veritabanına kaydeder.
 */
export const acceptAdultContent = async (userId: string, storyId: string) => {
  try {
    const progressRef = doc(db, 'users', userId, 'readingProgress', storyId);
    await setDoc(progressRef, {
      userId,
      storyId,
      isAdultContentAccepted: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Yetişkin içerik onayı kaydedilirken hata:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// KÜTÜPHANE (LIBRARY) OPERASYONLARI
// ─────────────────────────────────────────────

/**
 * Kullanıcının okumakta olduğu tüm hikayelerin ID'lerini ve okuma ilerlemelerini getirir.
 */
export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'readingProgress'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const progressList: ReadingProgress[] = [];
    querySnapshot.forEach((docSnap) => {
      progressList.push(docSnap.data() as ReadingProgress);
    });
    return progressList;
  } catch (error) {
    console.error("Kullanıcı okuma ilerlemeleri çekilirken hata:", error);
    return [];
  }
};

/**
 * Verilen hikaye ID'lerine göre hikayeleri getirir.
 */
export const getStoriesByIds = async (storyIds: string[]): Promise<Story[]> => {
  if (!storyIds || storyIds.length === 0) return [];
  
  try {
    // Firestore 'in' query requires batches of at most 30
    const batches = [];
    for (let i = 0; i < storyIds.length; i += 30) {
      batches.push(storyIds.slice(i, i + 30));
    }

    const stories: Story[] = [];
    for (const batch of batches) {
      const q = query(collection(db, 'stories'), where(documentId(), 'in', batch));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        stories.push({ storyId: docSnap.id, ...docSnap.data() } as Story);
      });
    }

    return stories;
  } catch (error) {
    console.error("ID bazlı hikayeler çekilirken hata:", error);
    return [];
  }
};

/**
 * Kullanıcının hikayeyi kütüphanesine kaydedip kaydetmediğini kontrol eder.
 */
export const checkIfStorySaved = async (userId: string, storyId: string): Promise<boolean> => {
  try {
    const savedRef = doc(db, 'users', userId, 'savedStories', storyId);
    const snap = await getDoc(savedRef);
    return snap.exists();
  } catch (error) {
    console.error("Kaydedilme durumu kontrol edilirken hata:", error);
    return false;
  }
};

/**
 * Hikayeyi "Daha Sonra Oku" listesine kaydeder veya çıkarır (Toggle).
 */
export const toggleSaveStory = async (userId: string, storyId: string): Promise<boolean> => {
  try {
    const savedRef = doc(db, 'users', userId, 'savedStories', storyId);
    const snap = await getDoc(savedRef);
    
    if (snap.exists()) {
      await deleteDoc(savedRef);
      return false; // Removed
    } else {
      await setDoc(savedRef, {
        storyId,
        savedAt: serverTimestamp()
      });
      return true; // Saved
    }
  } catch (error) {
    console.error("Hikaye kaydedilirken hata:", error);
    throw error;
  }
};

/**
 * Kullanıcının kaydettiği tüm hikayelerin ID'lerini getirir.
 */
export const getSavedStories = async (userId: string): Promise<string[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'savedStories'), orderBy('savedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const savedStoryIds: string[] = [];
    querySnapshot.forEach((docSnap) => {
      savedStoryIds.push(docSnap.id);
    });
    return savedStoryIds;
  } catch (error) {
    console.error("Kaydedilen hikayeler çekilirken hata:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// ARAMA (SEARCH) OPERASYONLARI
// ─────────────────────────────────────────────

/**
 * Hikayeleri etiketlere (tags) göre Firestore'dan çeker ve gerekirse başlığa göre yerel (client-side) filtreler.
 * Algolia gibi bir tam-metin arama motoru entegre edilene kadar MVP arama çözümü olarak kullanılır.
 */
export const searchStories = async (searchTerm: string = '', selectedTags: string[] = []): Promise<Story[]> => {
  try {
    const storiesRef = collection(db, 'stories');
    
    // Yalnızca yayındaki hikayeler
    let q = query(
      storiesRef,
      where('status', 'in', ['ongoing', 'completed']),
      orderBy('createdAt', 'desc')
    );

    // Etiket seçildiyse array-contains-any kullan
    if (selectedTags.length > 0) {
      // Firebase array-contains-any en fazla 10 eleman destekler
      const tagsToSearch = selectedTags.slice(0, 10);
      q = query(q, where('tags', 'array-contains-any', tagsToSearch));
    }

    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    
    querySnapshot.forEach((docSnap) => {
      stories.push({ storyId: docSnap.id, ...docSnap.data() } as Story);
    });

    // Metin araması varsa lokal olarak filtrele
    const term = searchTerm.trim().toLowerCase();
    if (term.length > 0) {
      return stories.filter(story => 
        story.title.toLowerCase().includes(term) ||
        story.summary?.toLowerCase().includes(term) ||
        (story as any).authorName?.toLowerCase().includes(term)
      );
    }

    return stories;
  } catch (error) {
    console.error("Hikaye aranırken hata:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Yardımcı Fonksiyon: Hikayeleri Zenginleştir (Eksik Yazar İsimlerini Tamamla)
// ─────────────────────────────────────────────
const enrichStories = async (docs: any[]): Promise<Story[]> => {
  const authorCache: Record<string, string> = {};
  return Promise.all(docs.map(async (docSnap) => {
    const data = docSnap.data();
    let authorName = data.authorName;
    if (!authorName && data.authorId) {
      if (authorCache[data.authorId]) {
        authorName = authorCache[data.authorId];
      } else {
        const profile = await getUserProfile(data.authorId);
        authorName = profile?.displayName || profile?.username || 'Bilinmiyor';
        authorCache[data.authorId] = authorName;
      }
    }
    return { storyId: docSnap.id, ...data, authorName } as Story;
  }));
};

// ─────────────────────────────────────────────
// KEŞFET (FEED) OPERASYONLARI
// ─────────────────────────────────────────────

/**
 * En son eklenen hikayeleri getirir.
 */
export const getRecentStories = async (limitCount: number = 10): Promise<Story[]> => {
  try {
    const q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    return stories;
  } catch (error) {
    console.error("Yeni hikayeler çekilirken hata:", error);
    return [];
  }
};

/**
 * En son eklenen hikayeleri sayfalama ile getirir.
 */
export const getRecentStoriesPaginated = async (limitCount: number = 10, lastDoc?: DocumentSnapshot): Promise<{ stories: Story[], lastDoc?: DocumentSnapshot }> => {
  try {
    let q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : undefined;
    
    return { stories, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Yeni hikayeler sayfalamayla çekilirken hata:", error);
    return { stories: [] };
  }
};


/**
 * En çok okunan (görüntülenen) hikayeleri getirir.
 */
export const getTopStories = async (limitCount: number = 10): Promise<Story[]> => {
  try {
    // Not: where(in) ve orderBy('stats.views') kompozit indeks gerektirecektir.
    const q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      orderBy('stats.views', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    return stories;
  } catch (error) {
    console.error("Popüler hikayeler çekilirken hata (Kompozit indeks eksik olabilir):", error);
    // Eğer index hatası alınırsa, sadece son eklenenleri döndürerek fallback yapalım
    return getRecentStories(limitCount);
  }
};

/**
 * En çok okunan hikayeleri sayfalama ile getirir.
 */
export const getTopStoriesPaginated = async (limitCount: number = 10, lastDoc?: DocumentSnapshot): Promise<{ stories: Story[], lastDoc?: DocumentSnapshot }> => {
  try {
    let q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      orderBy('stats.views', 'desc'),
      limit(limitCount)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : undefined;
    
    return { stories, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Popüler hikayeler sayfalamayla çekilirken hata:", error);
    return getRecentStoriesPaginated(limitCount, lastDoc);
  }
};

// ─────────────────────────────────────────────
// YENİ KEŞFET ALGORİTMALARI
// ─────────────────────────────────────────────

/**
 * Kullanıcının favori türlerine (preferredGenres) göre hikayeler önerir.
 * Eğer türler boşsa veya kullanıcı yoksa en çok okunanları getirir.
 */
export const getRecommendedStories = async (preferredGenres?: string[], limitCount: number = 10): Promise<Story[]> => {
  try {
    if (!preferredGenres || preferredGenres.length === 0) {
      return getTopStories(limitCount);
    }
    
    // Sadece ilk 10 türü alabiliriz (Firebase in/array-contains-any limiti 10'dur)
    const genresToQuery = preferredGenres.slice(0, 10);
    
    const q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      where('tags', 'array-contains-any', genresToQuery),
      limit(limitCount)
    );
    
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    
    // Eğer önerilen hiç hikaye yoksa, yine en popülerleri dön
    if (stories.length === 0) {
      return getTopStories(limitCount);
    }
    
    return stories;
  } catch (error) {
    console.error("Önerilen hikayeler çekilirken hata:", error);
    return getTopStories(limitCount);
  }
};

/**
 * Kısa ve Öz: Sadece tamamlanmış hikayeleri getirir.
 */
export const getCompletedStories = async (limitCount: number = 10): Promise<Story[]> => {
  try {
    const q = query(
      collection(db, 'stories'),
      where('status', '==', 'completed'),
      orderBy('stats.views', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    return stories;
  } catch (error) {
    console.error("Tamamlanmış hikayeler çekilirken hata:", error);
    return [];
  }
};

/**
 * En Çok Beğenilen Hikayeleri getirir.
 */
export const getMostLikedStories = async (limitCount: number = 10): Promise<Story[]> => {
  try {
    const q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      orderBy('stats.likes', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const stories = await enrichStories(snap.docs);
    return stories;
  } catch (error) {
    console.error("En çok beğenilen hikayeler çekilirken hata:", error);
    // Index hatası durumunda fallback
    return getTopStories(limitCount);
  }
};

// ─────────────────────────────────────────────
// İNCELEMELER / YORUMLAR (REVIEWS)
// ─────────────────────────────────────────────

/**
 * Kitaba yeni bir inceleme/puan ekler.
 * Hikayenin ortalama puanını ve inceleme sayısını da günceller.
 */
export const addReview = async (storyId: string, userId: string, rating: number, text: string): Promise<string> => {
  try {
    const userProfile = await getUserProfile(userId);
    const reviewRef = doc(collection(db, 'stories', storyId, 'reviews'));
    const newReview: Review = {
      reviewId: reviewRef.id,
      storyId,
      userId,
      authorName: userProfile?.displayName,
      authorUsername: userProfile?.username,
      authorAvatarUrl: userProfile?.avatarUrl,
      rating,
      text,
      createdAt: serverTimestamp() as any,
    };
    await setDoc(reviewRef, newReview);

    // Hikayenin genel stats alanını güncelle
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);
    if (storySnap.exists()) {
      const stats = storySnap.data().stats || {};
      const currentCount = stats.reviewCount || 0;
      const currentRating = stats.rating || 0;
      
      const newCount = currentCount + 1;
      // Yeni ortalamayı hesapla (eski toplam + yeni puan / yeni sayı)
      const newRating = ((currentRating * currentCount) + rating) / newCount;
      
      await updateDoc(storyRef, {
        'stats.reviewCount': newCount,
        // Tek ondalık basamağa yuvarla
        'stats.rating': Math.round(newRating * 10) / 10,
        updatedAt: serverTimestamp()
      });
    }

    return reviewRef.id;
  } catch (error) {
    console.error("İnceleme eklenirken hata:", error);
    throw error;
  }
};

/**
 * Kitabın tüm incelemelerini getirir (En yeniden eskiye).
 */
export const getReviews = async (storyId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'stories', storyId, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const reviews: Review[] = [];
    snap.forEach((docSnap) => {
      reviews.push({ ...docSnap.data(), reviewId: docSnap.id } as Review);
    });
    return reviews;
  } catch (error) {
    console.error("İncelemeler çekilirken hata:", error);
    return [];
  }
};
