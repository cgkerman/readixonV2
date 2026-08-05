import { collection, query, where, orderBy, getDocs, getDoc, limit, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { db } from '../firebase';
import type { Announcement, AdminPoll, AdminQuote, HeroBanner } from '../types';

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
        // Kültür duyurularını ana akışta (general) gösterme
        if (data.category === 'culture') {
          return;
        }
        
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
export const getAllAnnouncementsAdmin = async (categoryFilter?: string): Promise<Announcement[]> => {
  try {
    let q;
    if (categoryFilter === 'platform') {
      // Platform duyuruları: "platform", "general" ve kategorisi hiç atanmamış (eski) kayıtları kapsar.
      q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    } else if (categoryFilter) {
      q = query(
        collection(db, 'announcements'),
        where('category', '==', categoryFilter),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const announcements: Announcement[] = [];
    
    snapshot.forEach((doc) => {
      const docData = doc.data();
      
      // Client-side filtering for 'platform' to catch legacy docs missing the category field
      if (categoryFilter === 'platform') {
        const cat = docData.category;
        if (cat === 'culture') {
          return; // 'culture' olanları atla (Editör panele ait olanlar)
        }
      }

      announcements.push({
        id: doc.id,
        ...docData
      } as Announcement);
    });

    return announcements;
  } catch (error) {
    console.error("Admin duyuruları çekilirken hata:", error);
    return [];
  }
};

/**
 * ID'ye göre tek bir duyuru getirir.
 */
export const getAnnouncementById = async (id: string): Promise<Announcement | null> => {
  try {
    const docRef = doc(db, 'announcements', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Announcement;
    }
    return null;
  } catch (error) {
    console.error("Duyuru detayı çekilirken hata:", error);
    return null;
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
      views: 0,
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

/**
 * Duyuru görüntülenme sayısını 1 artırır.
 */
export const incrementAnnouncementViews = async (id: string): Promise<void> => {
  try {
    const ref = doc(db, 'announcements', id);
    await updateDoc(ref, {
      views: increment(1)
    });
  } catch (error) {
    console.error("Duyuru görüntülenme sayısı artırılırken hata:", error);
  }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN POLLS (Günün Okur Anketi)
// ─────────────────────────────────────────────────────────────────

/**
 * Tüm anketleri getirir (Admin panelinde listelemek için).
 */
export const getAllAdminPolls = async (): Promise<AdminPoll[]> => {
  try {
    const q = query(collection(db, 'admin_polls'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminPoll));
  } catch (error) {
    console.error("Admin anketleri çekilirken hata:", error);
    return [];
  }
};

/**
 * Aktif anketi getirir (Sağ panelde göstermek için).
 */
export const getActiveAdminPoll = async (): Promise<AdminPoll | null> => {
  try {
    const q = query(
      collection(db, 'admin_polls'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AdminPoll;
  } catch (error) {
    console.error("Aktif anket çekilirken hata:", error);
    return null;
  }
};

/**
 * Tüm aktif anketleri getirir (Gündem sayfasında listelemek için).
 */
export const getActiveAdminPolls = async (): Promise<AdminPoll[]> => {
  try {
    const q = query(
      collection(db, 'admin_polls'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminPoll));
  } catch (error) {
    console.error("Aktif anketler çekilirken hata:", error);
    return [];
  }
};

/**
 * Yeni anket oluşturur. (İsteğe bağlı olarak mevcut aktif anketleri pasife çekebiliriz)
 */
export const createAdminPoll = async (
  question: string,
  optionsText: string[],
  deactivateOthers: boolean = true
): Promise<void> => {
  try {
    if (deactivateOthers) {
      // Aktif olanları bul ve pasif yap
      const activePollsQ = query(collection(db, 'admin_polls'), where('isActive', '==', true));
      const activeSnaps = await getDocs(activePollsQ);
      const updatePromises = activeSnaps.docs.map(d => updateDoc(doc(db, 'admin_polls', d.id), { isActive: false }));
      await Promise.all(updatePromises);
    }

    const newRef = doc(collection(db, 'admin_polls'));
    const options = optionsText.map(t => ({ text: t, votes: 0 }));
    await setDoc(newRef, {
      question,
      options,
      votedUsers: [],
      isActive: true,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Anket oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Mevcut anketin aktif/pasif durumunu günceller.
 */
export const toggleAdminPollStatus = async (pollId: string, isActive: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, 'admin_polls', pollId), { isActive });
  } catch (error) {
    console.error("Anket statüsü güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Anketi siler.
 */
export const deleteAdminPoll = async (pollId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'admin_polls', pollId));
  } catch (error) {
    console.error("Anket silinirken hata:", error);
    throw error;
  }
};

/**
 * Ankete oy verir (Transaction ile güvenlik ve çakışma önleme).
 */
export const voteAdminPoll = async (pollId: string, optionIndex: number, userId: string): Promise<void> => {
  if (!userId) throw new Error("Oy vermek için giriş yapmalısınız.");
  
  const pollRef = doc(db, 'admin_polls', pollId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) {
        throw new Error("Anket bulunamadı.");
      }
      
      const data = pollDoc.data() as Omit<AdminPoll, 'id'>;
      
      if (data.votedUsers && data.votedUsers.includes(userId)) {
        throw new Error("Bu ankete zaten oy verdiniz.");
      }
      
      if (optionIndex < 0 || optionIndex >= data.options.length) {
        throw new Error("Geçersiz seçenek.");
      }
      
      // Oy ekle
      const newOptions = [...data.options];
      newOptions[optionIndex].votes += 1;
      
      const newVotedUsers = data.votedUsers ? [...data.votedUsers, userId] : [userId];
      
      transaction.update(pollRef, {
        options: newOptions,
        votedUsers: newVotedUsers
      });
    });
  } catch (error) {
    console.error("Oy verme işlemi başarsız:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN QUOTE OF THE DAY
// ─────────────────────────────────────────────────────────────────

export const getAllQuotes = async (): Promise<AdminQuote[]> => {
  try {
    const q = query(collection(db, 'admin_quotes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminQuote));
  } catch (error) {
    console.error("Admin alıntıları çekilirken hata:", error);
    return [];
  }
};

export const getActiveQuote = async (): Promise<AdminQuote | null> => {
  try {
    const q = query(
      collection(db, 'admin_quotes'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AdminQuote;
  } catch (error) {
    console.error("Aktif alıntı çekilirken hata:", error);
    return null;
  }
};

export const createQuote = async (
  text: string,
  author: string,
  deactivateOthers: boolean = true
): Promise<void> => {
  try {
    if (deactivateOthers) {
      const activeQuotesQ = query(collection(db, 'admin_quotes'), where('isActive', '==', true));
      const activeSnaps = await getDocs(activeQuotesQ);
      const updatePromises = activeSnaps.docs.map(d => updateDoc(doc(db, 'admin_quotes', d.id), { isActive: false }));
      await Promise.all(updatePromises);
    }

    const newRef = doc(collection(db, 'admin_quotes'));
    await setDoc(newRef, {
      text,
      author,
      isActive: true,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Alıntı oluşturulurken hata:", error);
    throw error;
  }
};

export const toggleQuoteStatus = async (quoteId: string, isActive: boolean): Promise<void> => {
  try {
    if (isActive) {
      const activeQuotesQ = query(collection(db, 'admin_quotes'), where('isActive', '==', true));
      const activeSnaps = await getDocs(activeQuotesQ);
      const updatePromises = activeSnaps.docs.map(d => updateDoc(doc(db, 'admin_quotes', d.id), { isActive: false }));
      await Promise.all(updatePromises);
    }
    await updateDoc(doc(db, 'admin_quotes', quoteId), { isActive });
  } catch (error) {
    console.error("Alıntı statüsü güncellenirken hata:", error);
    throw error;
  }
};

export const deleteQuote = async (quoteId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'admin_quotes', quoteId));
  } catch (error) {
    console.error("Alıntı silinirken hata:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────
// HERO BANNERS (Ana Sayfa Manşetleri)
// ─────────────────────────────────────────────────────────────────

export const getActiveHeroBanners = async (): Promise<HeroBanner[]> => {
  try {
    const q = query(
      collection(db, 'hero_banners'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroBanner));
  } catch (error) {
    console.error("Aktif manşetler çekilirken hata:", error);
    return [];
  }
};

export const getAllHeroBannersAdmin = async (): Promise<HeroBanner[]> => {
  try {
    const q = query(collection(db, 'hero_banners'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroBanner));
  } catch (error) {
    console.error("Manşetler çekilirken hata:", error);
    return [];
  }
};

export const getHeroBannerById = async (id: string): Promise<HeroBanner | null> => {
  try {
    const docRef = doc(db, 'hero_banners', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HeroBanner;
    }
    return null;
  } catch (error) {
    console.error("Manşet çekilirken hata:", error);
    return null;
  }
};

export const createHeroBanner = async (data: Omit<HeroBanner, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const newRef = doc(collection(db, 'hero_banners'));
    await setDoc(newRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    return newRef.id;
  } catch (error) {
    console.error("Manşet oluşturulurken hata:", error);
    throw error;
  }
};

export const updateHeroBanner = async (id: string, data: Partial<HeroBanner>): Promise<void> => {
  try {
    const ref = doc(db, 'hero_banners', id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Manşet güncellenirken hata:", error);
    throw error;
  }
};

export const deleteHeroBanner = async (id: string): Promise<void> => {
  try {
    const ref = doc(db, 'hero_banners', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Manşet silinirken hata:", error);
    throw error;
  }
};

/**
 * Platform değerlendirme geri bildirimini Firestore'a kaydeder.
 */
export const submitPlatformFeedback = async (
  rating: number,
  comment: string,
  userId?: string | null
): Promise<void> => {
  try {
    const newRef = doc(collection(db, 'platform_feedbacks'));
    await setDoc(newRef, {
      rating,
      comment,
      userId: userId || 'anonymous',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Değerlendirme kaydedilirken hata:", error);
    throw error;
  }
};

/**
 * Tüm platform değerlendirmelerini (feedbacks) getirir.
 */
export const getPlatformFeedbacks = async (): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'platform_feedbacks'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Değerlendirmeler çekilirken hata:", error);
    return [];
  }
};
