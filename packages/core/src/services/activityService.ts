import { doc, collection, setDoc, getDocs, query, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { ActivityAnswer, ChapterActivityType } from '../types';
import { createNotification } from './notificationService';
import { getUserProfile } from './userService';

/**
 * Submit an answer for a chapter's end activity.
 * If the activity is a 'question', it triggers a notification to the author.
 */
export const submitActivityAnswer = async (
  storyId: string,
  chapterId: string,
  authorId: string,
  userId: string,
  type: ChapterActivityType,
  answerData: { answer?: string; selectedOptionIndex?: number }
) => {
  try {
    // 1. Get user profile for denormalization
    const userProfile = await getUserProfile(userId);
    if (!userProfile) throw new Error("User profile not found");

    // 2. Prepare the answer record
    const answerRef = doc(db, 'stories', storyId, 'chapters', chapterId, 'activity_answers', userId);
    
    const newAnswer: Partial<ActivityAnswer> = {
      userId,
      type,
      ...answerData,
      createdAt: serverTimestamp() as any,
      userDisplayName: userProfile.displayName,
      userUsername: userProfile.username,
      userAvatarUrl: userProfile.avatarUrl || undefined, // use undefined if null to avoid firestore issues
    };

    // 3. Save to Firestore
    await setDoc(answerRef, newAnswer, { merge: true });

    // 4. If it's a question, notify the author (skip if author is answering their own)
    if (type === 'question' && authorId !== userId) {
      await createNotification({
        userId: authorId,
        type: 'chapter_activity', // Reusing comment type for notification UI
        actorId: userId,
        actorName: userProfile.displayName,
        actorAvatar: userProfile.avatarUrl || undefined,
        entityId: storyId,
        subEntityId: chapterId,
        message: `Bölüm sorunuza bir yanıt bıraktı: "${answerData.answer?.substring(0, 50)}${answerData.answer?.length! > 50 ? '...' : ''}"`
      });
    }

    return true;
  } catch (error) {
    console.error("Error submitting activity answer:", error);
    throw error;
  }
};

/**
 * Fetch a specific user's answer for a chapter's activity.
 */
export const getUserActivityAnswer = async (storyId: string, chapterId: string, userId: string): Promise<ActivityAnswer | null> => {
  try {
    const answerRef = doc(db, 'stories', storyId, 'chapters', chapterId, 'activity_answers', userId);
    const snap = await getDoc(answerRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ActivityAnswer;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user activity answer:", error);
    return null;
  }
};

/**
 * Fetch all activity answers for a specific chapter (used in Studio).
 */
export const getChapterActivityAnswers = async (storyId: string, chapterId: string): Promise<ActivityAnswer[]> => {
  try {
    const answersRef = collection(db, 'stories', storyId, 'chapters', chapterId, 'activity_answers');
    const q = query(answersRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityAnswer[];
  } catch (error) {
    console.error("Error fetching chapter activity answers:", error);
    return [];
  }
};
