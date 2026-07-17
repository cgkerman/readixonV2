import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { USERS_COLLECTION } from './userService';
import { BADGES } from '../constants/badges';
import { createNotification } from './notificationService';
import type { User, UserAchievements } from '../types';

/**
 * Ensures the user has an achievements object.
 * If they don't, it initializes one with zeroed values.
 */
async function ensureAchievements(uid: string, currentData?: UserAchievements): Promise<UserAchievements> {
  if (currentData) return currentData;

  const defaultAchievements: UserAchievements = {
    totalWordsWritten: 0,
    consecutiveWriteDays: 0,
    wordImports: 0,
    publishedChapters: 0,
    completedStories: 0,
    commentsReplied: 0,
    chaptersRead: 0,
    consecutiveReadDays: 0,
    storiesInLibrary: 0,
    commentsGiven: 0,
    likesGiven: 0,
    earnedBadges: [],
  };

  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { achievements: defaultAchievements });

  return defaultAchievements;
}

/**
 * Helper to update achievements with a partial payload.
 */
async function updateAchievements(uid: string, updates: Partial<UserAchievements>) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  
  // Flatten the updates into dot notation for firestore
  const firestoreUpdates: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    firestoreUpdates[`achievements.${key}`] = value;
  }
  
  await updateDoc(userRef, firestoreUpdates);
}

/**
 * Checks all conditions based on the current achievements state and awards badges.
 * @returns Array of newly awarded badge IDs.
 */
export async function evaluateBadges(uid: string): Promise<string[]> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  const newlyEarned: string[] = [];
  const currentEarned = new Set(achievements.earnedBadges || []);

  const award = (badgeId: string) => {
    if (!currentEarned.has(badgeId) && BADGES[badgeId]) {
      currentEarned.add(badgeId);
      newlyEarned.push(badgeId);
    }
  };

  // --- 1. Üretim ve İstikrar (Yazarlar İçin) ---
  if (achievements.totalWordsWritten >= 500) award('first_spark');
  if (achievements.totalWordsWritten >= 10000) award('keyboard_breaker_bronze');
  if (achievements.totalWordsWritten >= 50000) award('keyboard_breaker_silver');
  if (achievements.totalWordsWritten >= 100000) award('keyboard_breaker_gold');
  
  if (achievements.consecutiveWriteDays >= 3) award('steady_pen_3');
  if (achievements.consecutiveWriteDays >= 7) award('steady_pen_7');
  if (achievements.consecutiveWriteDays >= 30) award('steady_pen_30');

  if (achievements.wordImports >= 1) award('magic_touch');

  // --- 2. Yayınlama ve Kilometre Taşları (Yazarlar İçin) ---
  if (achievements.publishedChapters >= 1) award('stage_dust');
  if (achievements.publishedChapters >= 10) award('serial_producer_10');
  if (achievements.publishedChapters >= 20) award('serial_producer_20');
  if (achievements.publishedChapters >= 30) award('serial_producer_30');
  if (achievements.publishedChapters >= 40) award('serial_producer_40');
  if (achievements.publishedChapters >= 50) award('serial_producer_50');

  if (achievements.completedStories >= 1) award('finalist');
  if (achievements.commentsReplied >= 50) award('silver_tongue');

  // --- 3. Tüketim ve Keşif (Okurlar İçin) ---
  if (achievements.chaptersRead >= 1) award('first_page');
  if (achievements.chaptersRead >= 10) award('bookworm_1');
  if (achievements.chaptersRead >= 50) award('bookworm_2');
  if (achievements.chaptersRead >= 100) award('bookworm_3');

  if (achievements.storiesInLibrary >= 10) award('librarian');

  // --- 4. Etkileşim ve Sadakat (Okurlar İçin) ---
  if (achievements.commentsGiven >= 50) award('critic');
  if (achievements.likesGiven >= 100) award('generous_reader');

  if (achievements.consecutiveReadDays >= 7) award('addicted');
  if (achievements.consecutiveReadDays >= 30) award('readixon_veteran');

  // Not: Binge_reader, night_watch, night_shift, first_voice, authors_favorite, first_crowd 
  // rozetleri daha anlık durumlardır ve ayrı spesifik tetikleyicilerde de verilebilir.
  // evaluateBadges temel ve sayısal istatistikleri yakalar.

  if (newlyEarned.length > 0) {
    await updateAchievements(uid, {
      earnedBadges: Array.from(currentEarned),
    });

    for (const badgeId of newlyEarned) {
      const badge = BADGES[badgeId as keyof typeof BADGES];
      if (badge) {
        await createNotification({
          userId: uid,
          actorId: 'system',
          actorName: 'Readixon',
          type: 'badge_earned',
          entityId: badgeId,
          entityTitle: badge.title,
        }).catch((e) => console.error("Rozet bildirimi gönderilemedi:", e));
      }
    }
  }

  return newlyEarned;
}

// ─────────────────────────────────────────────
// Tetikleyiciler
// ─────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  // YYYY-MM-DD local time
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function trackWordCount(uid: string, sessionWords: number): Promise<string[]> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  
  const today = getTodayString();
  let newConsecutive = achievements.consecutiveWriteDays;
  let newLastDate = achievements.lastWriteDate;

  if (today !== achievements.lastWriteDate) {
    // Check if yesterday was the last write date
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
    
    if (achievements.lastWriteDate === yesterday) {
      // Kept the streak
      newConsecutive += 1;
    } else {
      // Broken streak
      newConsecutive = 1;
    }
    newLastDate = today;
  }

  await updateAchievements(uid, {
    totalWordsWritten: achievements.totalWordsWritten + sessionWords,
    consecutiveWriteDays: newConsecutive,
    lastWriteDate: newLastDate,
  });

  return evaluateBadges(uid);
}

export async function trackRead(uid: string): Promise<string[]> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  
  const today = getTodayString();
  let newConsecutive = achievements.consecutiveReadDays;
  let newLastDate = achievements.lastReadDate;

  if (today !== achievements.lastReadDate) {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
    
    if (achievements.lastReadDate === yesterday) {
      newConsecutive += 1;
    } else {
      newConsecutive = 1;
    }
    newLastDate = today;
  }

  await updateAchievements(uid, {
    chaptersRead: achievements.chaptersRead + 1,
    consecutiveReadDays: newConsecutive,
    lastReadDate: newLastDate,
  });

  return evaluateBadges(uid);
}

export async function trackInteraction(
  uid: string, 
  type: 'comment_given' | 'like_given' | 'story_library_added' | 'word_import' | 'chapter_published' | 'story_completed' | 'comment_replied'
): Promise<string[]> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  
  const updates: Partial<UserAchievements> = {};
  
  switch (type) {
    case 'comment_given':
      updates.commentsGiven = achievements.commentsGiven + 1;
      break;
    case 'like_given':
      updates.likesGiven = achievements.likesGiven + 1;
      break;
    case 'story_library_added':
      updates.storiesInLibrary = achievements.storiesInLibrary + 1;
      break;
    case 'word_import':
      updates.wordImports = achievements.wordImports + 1;
      break;
    case 'chapter_published':
      updates.publishedChapters = achievements.publishedChapters + 1;
      break;
    case 'story_completed':
      updates.completedStories = achievements.completedStories + 1;
      break;
    case 'comment_replied':
      updates.commentsReplied = achievements.commentsReplied + 1;
      break;
  }

  if (Object.keys(updates).length > 0) {
    await updateAchievements(uid, updates);
  }

  return evaluateBadges(uid);
}

/**
 * Manually award a specific badge (e.g. for binge reading or night watch).
 */
export async function awardBadge(uid: string, badgeId: string): Promise<boolean> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  const currentEarned = achievements.earnedBadges || [];

  if (!currentEarned.includes(badgeId) && BADGES[badgeId]) {
    currentEarned.push(badgeId);
    await updateAchievements(uid, { earnedBadges: currentEarned });
    return true; // Newly awarded
  }

  return false;
}
