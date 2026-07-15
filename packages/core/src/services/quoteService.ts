import { collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { SavedQuote } from '../types';

/**
 * Kullanıcının kütüphanesine yeni bir alıntı kaydeder.
 */
export async function saveQuote(
  userId: string,
  text: string,
  storyId: string,
  chapterId: string,
  storyTitle: string,
  authorName: string,
  authorUsername?: string
): Promise<SavedQuote> {
  const quoteRef = doc(collection(db, 'users', userId, 'saved_quotes'));
  const newQuote: SavedQuote = {
    id: quoteRef.id,
    text,
    storyId,
    chapterId,
    storyTitle,
    authorName,
    authorUsername: authorUsername || null,
    createdAt: serverTimestamp() as Timestamp
  };

  await setDoc(quoteRef, newQuote);
  return {
    ...newQuote,
    createdAt: Timestamp.now()
  };
}

/**
 * Kullanıcının kütüphanesine kaydettiği alıntıları getirir.
 */
export async function getUserQuotes(userId: string, limitCount = 50): Promise<SavedQuote[]> {
  try {
    const q = query(
      collection(db, 'users', userId, 'saved_quotes'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as SavedQuote);
  } catch (error) {
    console.error("Alıntılar getirilirken hata:", error);
    return [];
  }
}

/**
 * Kaydedilmiş bir alıntıyı siler.
 */
export async function deleteSavedQuote(userId: string, quoteId: string): Promise<void> {
  try {
    const quoteRef = doc(db, 'users', userId, 'saved_quotes', quoteId);
    await deleteDoc(quoteRef);
  } catch (error) {
    console.error("Alıntı silinirken hata:", error);
    throw error;
  }
}
