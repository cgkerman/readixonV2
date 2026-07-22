import { collection, query, where, orderBy, getDocs, limit, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import type { Announcement, AdminPoll, AdminQuote } from '../types';

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
export const getAllAnnouncementsAdmin = async (): Promise<Announcement[]> => {
  try {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const announcements: Announcement[] = [];
    
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data()
      } as Announcement);
    });

    return announcements;
  } catch (error) {
    console.error("Admin duyuruları çekilirken hata:", error);
    return [];
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
    // Eğer aktif ediliyorsa diğerlerini kapatmak iyi olabilir, ama şimdilik sadece kendi statüsünü güncelleyelim
    if (isActive) {
      const activePollsQ = query(collection(db, 'admin_polls'), where('isActive', '==', true));
      const activeSnaps = await getDocs(activePollsQ);
      const updatePromises = activeSnaps.docs.map(d => updateDoc(doc(db, 'admin_polls', d.id), { isActive: false }));
      await Promise.all(updatePromises);
    }
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
