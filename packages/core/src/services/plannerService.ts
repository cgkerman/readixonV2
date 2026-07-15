import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { StoryPlanner, ChapterPlanner } from '../types/planner';

/**
 * Hikaye genel planını (Modül A, C, D) getirir.
 */
export async function getStoryPlanner(storyId: string): Promise<StoryPlanner | null> {
  const plannerRef = doc(db, 'stories', storyId, 'planner', 'main');
  const snap = await getDoc(plannerRef);
  if (!snap.exists()) return null;
  return snap.data() as StoryPlanner;
}

/**
 * Hikaye genel planını günceller veya oluşturur.
 */
export async function updateStoryPlanner(storyId: string, data: Partial<StoryPlanner>): Promise<void> {
  const plannerRef = doc(db, 'stories', storyId, 'planner', 'main');
  await setDoc(plannerRef, {
    ...data,
    storyId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Bölüm planını (Modül B) getirir.
 */
export async function getChapterPlanner(storyId: string, chapterId: string): Promise<ChapterPlanner | null> {
  const plannerRef = doc(db, 'stories', storyId, 'chapters', chapterId, 'planner', 'main');
  const snap = await getDoc(plannerRef);
  if (!snap.exists()) return null;
  return snap.data() as ChapterPlanner;
}

/**
 * Bölüm planını günceller veya oluşturur.
 */
export async function updateChapterPlanner(storyId: string, chapterId: string, data: Partial<ChapterPlanner>): Promise<void> {
  const plannerRef = doc(db, 'stories', storyId, 'chapters', chapterId, 'planner', 'main');
  await setDoc(plannerRef, {
    ...data,
    storyId,
    chapterId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
