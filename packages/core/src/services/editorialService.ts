import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { EditorialReview, Story, User } from '../types';

const COLLECTION_NAME = 'editorialReviews';

export const createEditorialReview = async (reviewData: Omit<EditorialReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const reviewsRef = collection(db, COLLECTION_NAME);
  const newReviewRef = doc(reviewsRef);

  const review: EditorialReview = {
    ...reviewData,
    id: newReviewRef.id,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(newReviewRef, review);
  return newReviewRef.id;
};

export const getEditorialReviews = async (limitCount = 20): Promise<EditorialReview[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as EditorialReview);
  } catch (error) {
    console.error('getEditorialReviews hatası:', error);
    return [];
  }
};

export const getEditorialReviewById = async (id: string): Promise<EditorialReview | null> => {
  try {
    const reviewRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(reviewRef);
    if (snap.exists()) {
      return snap.data() as EditorialReview;
    }
    return null;
  } catch (error) {
    console.error('getEditorialReviewById hatası:', error);
    return null;
  }
};

export const getEditorialReviewByStoryId = async (storyId: string): Promise<EditorialReview | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('storyId', '==', storyId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as EditorialReview;
    }
    return null;
  } catch (error) {
    console.error('getEditorialReviewByStoryId hatası:', error);
    return null;
  }
};

export const updateEditorialReview = async (id: string, updates: Partial<Omit<EditorialReview, 'id' | 'storyId' | 'editorId' | 'createdAt'>>): Promise<void> => {
  const reviewRef = doc(db, COLLECTION_NAME, id);
  await setDoc(reviewRef, {
    ...updates,
    updatedAt: serverTimestamp() as Timestamp,
  }, { merge: true });
};

export const deleteEditorialReview = async (id: string): Promise<void> => {
  const { deleteDoc } = await import('firebase/firestore');
  const reviewRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(reviewRef);
};
