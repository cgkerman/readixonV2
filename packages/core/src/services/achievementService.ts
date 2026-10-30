import { doc, getDoc, updateDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { USERS_COLLECTION } from './userService';
import { BADGES } from '../constants/badges';
import { createNotification } from './notificationService';
import type { User, UserAchievements } from '../types';

/**
 * Kullanıcıda achievements nesnesinin eksiksiz olmasını sağlar.
 */
async function ensureAchievements(uid: string, currentData?: UserAchievements): Promise<UserAchievements> {
  const defaultAchievements: UserAchievements = {
    totalWordsWritten: 0,
    consecutiveWriteDays: 0,
    lastWriteDate: '',
    wordImports: 0,
    publishedChapters: 0,
    publishedShortStories: 0,
    completedStories: 0,
    maxChaptersInStory: 0,
    commentsReplied: 0,
    nightWritingHours: 0,
    dailyWords: {},
    chaptersRead: 0,
    shortStoriesRead: 0,
    consecutiveReadDays: 0,
    lastReadDate: '',
    nightChaptersRead: 0,
    bingeMaxCount: 0,
    lastReadStoryId: '',
    currentStoryBingeCount: 0,
    interactiveRewindsMade: 0,
    maxInteractiveEndingsInStory: 0,
    maxClubMembers: 0,
    storiesInLibrary: 0,
    commentsGiven: 0,
    likesGiven: 0,

    // Yeni Özellik Başarımları
    universesCreated: 0,
    charactersCreated: 0,
    codexEntriesCreated: 0,
    interactiveChoicesMade: 0,
    interactiveEndingsFound: 0,
    publishedWebtoons: 0,
    webtoonChaptersRead: 0,
    soundtrackChaptersPublished: 0,
    audioChaptersRead: 0,
    quotesShared: 0,
    publishedColumns: 0,
    curatedListLikes: 0,
    clubsOwned: 0,
    clubMessagesSent: 0,
    morningChaptersRead: 0,
    reviewsGiven: 0,

    earnedBadges: [],
    badgeEarnedDates: {},
  };

  if (!currentData) {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { achievements: defaultAchievements }).catch(() => {});
    return defaultAchievements;
  }

  // Eksik alanları varsayılanlarla doldur
  return {
    ...defaultAchievements,
    ...currentData,
    earnedBadges: currentData.earnedBadges || [],
    badgeEarnedDates: currentData.badgeEarnedDates || {},
    dailyWords: currentData.dailyWords || {},
  };
}

/**
 * Firestore'a dot-notation ile kısmi güncelleme yapar.
 */
async function updateAchievements(uid: string, updates: Partial<UserAchievements>) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const firestoreUpdates: Record<string, any> = {};

  for (const [key, value] of Object.entries(updates)) {
    firestoreUpdates[`achievements.${key}`] = value;
  }

  await updateDoc(userRef, firestoreUpdates);
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Mevcut başarımlara göre tüm rozet koşullarını değerlendirir ve hak edilenleri verir.
 * @returns Yeni kazanılan rozetlerin ID dizisi
 */
export async function evaluateBadges(uid: string): Promise<string[]> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  const newlyEarned: string[] = [];
  const currentEarned = new Set(achievements.earnedBadges || []);
  const earnedDates = { ...(achievements.badgeEarnedDates || {}) };

  const award = (badgeId: string) => {
    if (!currentEarned.has(badgeId) && BADGES[badgeId]) {
      currentEarned.add(badgeId);
      newlyEarned.push(badgeId);
      earnedDates[badgeId] = new Date().toISOString();
    }
  };

  // ─────────────────────────────────────────────
  // 1. Üretim ve İstikrar (Yazarlar İçin)
  // ─────────────────────────────────────────────
  if (achievements.totalWordsWritten >= 500) award('first_spark');
  if (achievements.totalWordsWritten >= 10000) award('keyboard_breaker_bronze');
  if (achievements.totalWordsWritten >= 50000) award('keyboard_breaker_silver');
  if (achievements.totalWordsWritten >= 100000) award('keyboard_breaker_gold');
  if (achievements.totalWordsWritten >= 500000) award('million_words_author');

  if (achievements.consecutiveWriteDays >= 3) award('steady_pen_3');
  if (achievements.consecutiveWriteDays >= 7) award('steady_pen_7');
  if (achievements.consecutiveWriteDays >= 30) award('steady_pen_30');

  if ((achievements.nightWritingHours || 0) >= 1) award('night_shift_writer');
  if (achievements.wordImports >= 1) award('magic_touch');

  // Evren & Dünya İnşası
  if ((achievements.universesCreated || 0) >= 1) award('universe_architect');
  if ((achievements.charactersCreated || 0) >= 5) award('character_alchemist');
  if ((achievements.codexEntriesCreated || 0) >= 10) award('codex_master');
  if ((achievements.soundtrackChaptersPublished || 0) >= 1) award('soundtrack_maestro');

  // ─────────────────────────────────────────────
  // 2. Yayınlama ve Kilometre Taşları (Yazarlar İçin)
  // ─────────────────────────────────────────────
  if (achievements.publishedChapters >= 1) award('stage_dust');

  // Tek hikayedeki maksimum bölüm veya toplam bölüm
  const maxStoryChapters = Math.max(achievements.maxChaptersInStory || 0, achievements.publishedChapters || 0);
  if (maxStoryChapters >= 10) award('serial_producer_10');
  if (maxStoryChapters >= 20) award('serial_producer_20');
  if (maxStoryChapters >= 30) award('serial_producer_30');
  if (maxStoryChapters >= 40) award('serial_producer_40');
  if (maxStoryChapters >= 50) award('serial_producer_50');

  if (achievements.completedStories >= 1) award('finalist');
  if (achievements.commentsReplied >= 50) award('silver_tongue');
  if ((achievements.publishedShortStories || 0) >= 1) award('short_story_debut');
  if ((achievements.publishedShortStories || 0) >= 3) award('short_story_master');
  if ((achievements.publishedWebtoons || 0) >= 1) award('webtoonist');
  if ((achievements.maxInteractiveEndingsInStory || 0) >= 3) award('labyrinth_master');
  if ((achievements.publishedColumns || 0) >= 1) award('editorial_pen');

  // ─────────────────────────────────────────────
  // 3. Tüketim ve Keşif (Okurlar İçin)
  // ─────────────────────────────────────────────
  if (achievements.chaptersRead >= 1) award('first_page');
  if (achievements.chaptersRead >= 10) award('bookworm_1');
  if (achievements.chaptersRead >= 50) award('bookworm_2');
  if (achievements.chaptersRead >= 100) award('bookworm_3');

  if ((achievements.bingeMaxCount || 0) >= 5) award('binge_reader');
  if (achievements.storiesInLibrary >= 10) award('librarian');
  if ((achievements.nightChaptersRead || 0) >= 3) award('night_watch');
  if ((achievements.morningChaptersRead || 0) >= 2) award('early_bird');

  if ((achievements.shortStoriesRead || 0) >= 1) award('short_story_reader_1');
  if ((achievements.shortStoriesRead || 0) >= 5) award('short_story_collector');

  // İnteraktif, Webtoon & Müzikli Okuma
  if ((achievements.interactiveChoicesMade || 0) >= 1) award('fate_weaver');
  if ((achievements.interactiveEndingsFound || 0) >= 3) award('butterfly_effect');
  if ((achievements.interactiveRewindsMade || 0) >= 1 || (achievements.interactiveChoicesMade || 0) >= 2) award('time_traveler');
  if ((achievements.webtoonChaptersRead || 0) >= 25) award('panel_hunter');
  if ((achievements.audioChaptersRead || 0) >= 5) award('rhythm_reader');

  // ─────────────────────────────────────────────
  // 4. Etkileşim ve Sadakat (Okurlar İçin)
  // ─────────────────────────────────────────────
  if (achievements.commentsGiven >= 50) award('critic');
  if (achievements.likesGiven >= 100) award('generous_reader');

  if (achievements.consecutiveReadDays >= 7) award('addicted');
  if (achievements.consecutiveReadDays >= 30) award('readixon_veteran');
  if (achievements.consecutiveReadDays >= 100) award('century_streak');

  if ((achievements.quotesShared || 0) >= 10) award('quote_hunter');
  if ((achievements.curatedListLikes || 0) >= 10) award('master_curator');
  if ((achievements.maxClubMembers || 0) >= 5) award('club_leader');
  if ((achievements.clubMessagesSent || 0) >= 20) award('campfire_chat');
  if ((achievements.reviewsGiven || 0) >= 5) award('master_critic');

  if (newlyEarned.length > 0) {
    await updateAchievements(uid, {
      earnedBadges: Array.from(currentEarned),
      badgeEarnedDates: earnedDates,
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

/**
 * Yazılan kelime sayısını kaydeder, gece mesaisini ve günlük seriyi günceller.
 */
export async function trackWordCount(uid: string, sessionWords: number): Promise<string[]> {
  if (!uid || sessionWords <= 0) return [];

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const dailyWords = { ...(achievements.dailyWords || {}) };
  const todayWords = (dailyWords[today] || 0) + sessionWords;
  dailyWords[today] = todayWords;

  // Gece 00:00 - 04:00 kontrolü (Gece Mesaisi)
  const currentHour = new Date().getHours();
  let nightWritingHours = achievements.nightWritingHours || 0;
  if (currentHour >= 0 && currentHour < 4) {
    nightWritingHours += 1;
  }

  // İstikrarlı Kalem serisi: Her gün en az 300 kelime
  let newConsecutive = achievements.consecutiveWriteDays || 0;
  let newLastDate = achievements.lastWriteDate;

  if (todayWords >= 300 && achievements.lastWriteDate !== today) {
    if (achievements.lastWriteDate === yesterday) {
      newConsecutive += 1;
    } else {
      newConsecutive = 1;
    }
    newLastDate = today;
  }

  await updateAchievements(uid, {
    totalWordsWritten: (achievements.totalWordsWritten || 0) + sessionWords,
    consecutiveWriteDays: newConsecutive,
    lastWriteDate: newLastDate,
    dailyWords,
    nightWritingHours,
  });

  return evaluateBadges(uid);
}

/**
 * Okunan bölümü kaydeder, gece nöbeti, sabah okuması, webtoon ve müzik serilerini günceller.
 */
export async function trackRead(
  uid: string, 
  options?: { 
    storyId?: string; 
    isWebtoon?: boolean; 
    hasAudio?: boolean 
  }
): Promise<string[]> {
  if (!uid) return [];

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);

  const today = getTodayString();
  const yesterday = getYesterdayString();
  let newConsecutive = achievements.consecutiveReadDays || 0;
  let newLastDate = achievements.lastReadDate;

  if (today !== achievements.lastReadDate) {
    if (achievements.lastReadDate === yesterday) {
      newConsecutive += 1;
    } else {
      newConsecutive = 1;
    }
    newLastDate = today;
  }

  const currentHour = new Date().getHours();
  let nightChaptersRead = achievements.nightChaptersRead || 0;
  let morningChaptersRead = achievements.morningChaptersRead || 0;

  // Gece 00:00 - 04:00 (Gece Nöbeti)
  if (currentHour >= 0 && currentHour < 4) {
    nightChaptersRead += 1;
  }

  // Sabah 05:00 - 08:00 (Günün İlk Işığı)
  if (currentHour >= 5 && currentHour < 8) {
    morningChaptersRead += 1;
  }

  // Webtoon & Müzik takibi
  const webtoonChaptersRead = options?.isWebtoon 
    ? (achievements.webtoonChaptersRead || 0) + 1 
    : (achievements.webtoonChaptersRead || 0);

  const audioChaptersRead = options?.hasAudio 
    ? (achievements.audioChaptersRead || 0) + 1 
    : (achievements.audioChaptersRead || 0);

  // Tek oturuşta / seride okuma sayacı
  const currentStoryId = options?.storyId;
  let currentBinge = achievements.currentStoryBingeCount || 0;
  if (currentStoryId && currentStoryId === achievements.lastReadStoryId) {
    currentBinge += 1;
  } else {
    currentBinge = 1;
  }
  const bingeMaxCount = Math.max(achievements.bingeMaxCount || 0, currentBinge);

  await updateAchievements(uid, {
    chaptersRead: (achievements.chaptersRead || 0) + 1,
    consecutiveReadDays: newConsecutive,
    lastReadDate: newLastDate,
    lastReadStoryId: currentStoryId || achievements.lastReadStoryId || '',
    currentStoryBingeCount: currentBinge,
    bingeMaxCount,
    nightChaptersRead,
    morningChaptersRead,
    webtoonChaptersRead,
    audioChaptersRead,
  });

  return evaluateBadges(uid);
}

/**
 * Kullanıcı etkileşimlerini (yorum, beğeni, yayın, import, alıntı, inceleme vb.) takip eder.
 */
export async function trackInteraction(
  uid: string,
  type: 
    | 'comment_given' 
    | 'like_given' 
    | 'story_library_added' 
    | 'word_import' 
    | 'chapter_published' 
    | 'story_completed' 
    | 'comment_replied' 
    | 'short_story_published' 
    | 'short_story_read'
    | 'first_voice'
    | 'authors_favorite'
    | 'first_crowd_100'
    | 'first_crowd_1000'
    | 'controversial'
    | 'quote_shared'
    | 'column_published'
    | 'webtoon_published'
    | 'soundtrack_published'
    | 'interactive_choice'
    | 'interactive_ending'
    | 'club_message_sent'
    | 'club_created'
    | 'review_given'
    | 'curated_list_liked'
    | 'universe_created'
    | 'character_created'
    | 'codex_created'
    | 'interactive_rewind'
    | 'interactive_story_published'
    | 'club_member_joined'
    | 'viral_voice',
  metadata?: {
    storyChapterCount?: number;
    [key: string]: any;
  }
): Promise<string[]> {
  if (!uid) return [];

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);

  // Doğrudan rozet kazandıran özel etkileşimler
  const directBadges: Record<string, string> = {
    first_voice: 'first_voice',
    authors_favorite: 'authors_favorite',
    first_crowd_100: 'first_crowd_100',
    first_crowd_1000: 'first_crowd_1000',
    controversial: 'controversial',
    viral_voice: 'viral_voice',
  };

  if (directBadges[type]) {
    await awardBadge(uid, directBadges[type]);
    return [directBadges[type]];
  }

  const updates: Partial<UserAchievements> = {};

  switch (type) {
    case 'comment_given':
      updates.commentsGiven = (achievements.commentsGiven || 0) + 1;
      break;
    case 'like_given':
      updates.likesGiven = (achievements.likesGiven || 0) + 1;
      break;
    case 'story_library_added':
      updates.storiesInLibrary = (achievements.storiesInLibrary || 0) + 1;
      break;
    case 'word_import':
      updates.wordImports = (achievements.wordImports || 0) + 1;
      break;
    case 'chapter_published':
      updates.publishedChapters = (achievements.publishedChapters || 0) + 1;
      if (metadata?.storyChapterCount) {
        updates.maxChaptersInStory = Math.max(
          achievements.maxChaptersInStory || 0,
          metadata.storyChapterCount
        );
      }
      break;
    case 'short_story_published':
      updates.publishedShortStories = (achievements.publishedShortStories || 0) + 1;
      break;
    case 'story_completed':
      updates.completedStories = (achievements.completedStories || 0) + 1;
      break;
    case 'comment_replied':
      updates.commentsReplied = (achievements.commentsReplied || 0) + 1;
      break;
    case 'short_story_read':
      updates.shortStoriesRead = (achievements.shortStoriesRead || 0) + 1;
      break;
    case 'quote_shared':
      updates.quotesShared = (achievements.quotesShared || 0) + 1;
      break;
    case 'column_published':
      updates.publishedColumns = (achievements.publishedColumns || 0) + 1;
      break;
    case 'webtoon_published':
      updates.publishedWebtoons = (achievements.publishedWebtoons || 0) + 1;
      break;
    case 'soundtrack_published':
      updates.soundtrackChaptersPublished = (achievements.soundtrackChaptersPublished || 0) + 1;
      break;
    case 'interactive_choice':
      updates.interactiveChoicesMade = (achievements.interactiveChoicesMade || 0) + 1;
      break;
    case 'interactive_ending':
      updates.interactiveEndingsFound = (achievements.interactiveEndingsFound || 0) + 1;
      break;
    case 'club_message_sent':
      updates.clubMessagesSent = (achievements.clubMessagesSent || 0) + 1;
      break;
    case 'club_created':
      updates.clubsOwned = (achievements.clubsOwned || 0) + 1;
      break;
    case 'review_given':
      updates.reviewsGiven = (achievements.reviewsGiven || 0) + 1;
      break;
    case 'curated_list_liked':
      updates.curatedListLikes = (achievements.curatedListLikes || 0) + 1;
      break;
    case 'universe_created':
      updates.universesCreated = (achievements.universesCreated || 0) + 1;
      break;
    case 'character_created':
      updates.charactersCreated = (achievements.charactersCreated || 0) + 1;
      break;
    case 'codex_created':
      updates.codexEntriesCreated = (achievements.codexEntriesCreated || 0) + 1;
      break;
    case 'interactive_rewind':
      updates.interactiveRewindsMade = (achievements.interactiveRewindsMade || 0) + 1;
      break;
    case 'interactive_story_published':
      if (metadata?.endingCount) {
        updates.maxInteractiveEndingsInStory = Math.max(
          achievements.maxInteractiveEndingsInStory || 0,
          metadata.endingCount
        );
      }
      break;
    case 'club_member_joined':
      if (metadata?.memberCount) {
        updates.maxClubMembers = Math.max(
          achievements.maxClubMembers || 0,
          metadata.memberCount
        );
      }
      break;
  }

  if (Object.keys(updates).length > 0) {
    await updateAchievements(uid, updates);
  }

  return evaluateBadges(uid);
}

/**
 * Belirli bir rozeti doğrudan kullanıcıya tanımlar.
 */
export async function awardBadge(uid: string, badgeId: string): Promise<boolean> {
  if (!uid || !BADGES[badgeId]) return false;

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;

  const user = snap.data() as User;
  const achievements = await ensureAchievements(uid, user.achievements);
  const currentEarned = achievements.earnedBadges || [];

  if (!currentEarned.includes(badgeId)) {
    const updatedBadges = [...currentEarned, badgeId];
    const earnedDates = {
      ...(achievements.badgeEarnedDates || {}),
      [badgeId]: new Date().toISOString(),
    };

    await updateAchievements(uid, {
      earnedBadges: updatedBadges,
      badgeEarnedDates: earnedDates,
    });

    const badge = BADGES[badgeId];
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

    return true;
  }

  return false;
}

/**
 * RETROAKTİF SENKRONİZASYON MOTORU:
 * Kullanıcının Firestore'daki tüm gerçek verilerini (yayınlanan hikayeler, bölümler,
 * evrenler, karakterler, köşe yazıları, kütüphane, okuma kayıtları vb.) tarar ve tüm başarımları günceller.
 */
export async function syncUserAchievements(uid: string): Promise<{
  newlyEarned: string[];
  achievements: UserAchievements;
}> {
  if (!uid) throw new Error("UID gereklidir.");

  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("Kullanıcı bulunamadı.");

  const user = userSnap.data() as User;
  const currentAchievements = await ensureAchievements(uid, user.achievements);

  let realPublishedChapters = 0;
  let realPublishedShortStories = 0;
  let realPublishedWebtoons = 0;
  let realCompletedStories = 0;
  let realMaxChaptersInStory = 0;
  let realSoundtrackChapters = 0;
  let realTotalWords = currentAchievements.totalWordsWritten || 0;
  let realMaxInteractiveEndings = currentAchievements.maxInteractiveEndingsInStory || 0;
  let calculatedStoryWords = 0;
  let reached100Reads = false;
  let reached1000Reads = false;
  let reached20CommentsOnChapter = false;

  // 1. Kullanıcının yayınladığı hikayeleri tara
  try {
    const storiesQ = query(
      collection(db, 'stories'),
      where('authorId', '==', uid)
    );
    const storiesSnap = await getDocs(storiesQ);

    storiesSnap.forEach(sDoc => {
      const data = sDoc.data();
      const isPublished = data.status === 'ongoing' || data.status === 'completed' || data.status === 'published';
      const readsCount = data.stats?.views || data.stats?.readsCount || 0;

      if (readsCount >= 100) reached100Reads = true;
      if (readsCount >= 1000) reached1000Reads = true;
      if ((data.stats?.commentCount || 0) >= 20) reached20CommentsOnChapter = true;

      // Kelime sayısı toplamı
      if (typeof data.stats?.totalWords === 'number' && data.stats.totalWords > 0) {
        calculatedStoryWords += data.stats.totalWords;
      }

      if (data.status === 'completed') {
        realCompletedStories += 1;
      }

      if (data.format === 'short_story') {
        if (isPublished) {
          realPublishedShortStories += 1;
          realPublishedChapters += 1;
        }
      } else if (data.format === 'webtoon') {
        if (isPublished) {
          realPublishedWebtoons += 1;
          const chapCount = data.stats?.chapterCount || data.stats?.chaptersCount || data.chaptersCount || 0;
          realPublishedChapters += chapCount;
        }
      } else if (data.format === 'interactive') {
        const chapCount = data.stats?.chapterCount || data.stats?.chaptersCount || data.chaptersCount || 0;
        if (isPublished) {
          realPublishedChapters += chapCount;
          if (chapCount > realMaxChaptersInStory) {
            realMaxChaptersInStory = chapCount;
          }
        }
        const endingCount = data.stats?.endingCount || 0;
        if (endingCount > realMaxInteractiveEndings) {
          realMaxInteractiveEndings = endingCount;
        }
      } else {
        const chapCount = data.stats?.chapterCount || data.stats?.chaptersCount || data.chaptersCount || 0;
        if (isPublished) {
          realPublishedChapters += chapCount;
          if (chapCount > realMaxChaptersInStory) {
            realMaxChaptersInStory = chapCount;
          }
        }
      }
    });
    realTotalWords = Math.max(realTotalWords, calculatedStoryWords);
  } catch (err) {
    console.warn("Hikaye istatistikleri senkronize edilemedi:", err);
  }

  // 2. Kullanıcının Evrenlerini ve Karakterlerini tara
  let realUniversesCount = currentAchievements.universesCreated || 0;
  let realCharactersCount = currentAchievements.charactersCreated || 0;
  let realCodexCount = currentAchievements.codexEntriesCreated || 0;

  try {
    const universesQ = query(
      collection(db, 'universes'),
      where('authorId', '==', uid)
    );
    const universesSnap = await getDocs(universesQ);
    let validUniverses = 0;

    universesSnap.forEach(uDoc => {
      const uData = uDoc.data();
      const storyIds = uData.connectedStoryIds || uData.storyIds || [];
      if (storyIds.length >= 2) {
        validUniverses += 1;
      }
      const charCount = typeof uData.stats?.characterCount === 'number'
        ? uData.stats.characterCount
        : (Array.isArray(uData.characters) ? uData.characters.length : 0);
      realCharactersCount += charCount;

      const codexCount = (uData.stats?.glossaryCount || 0) + (uData.stats?.loreCount || 0) + (uData.stats?.locationCount || 0);
      if (codexCount > 0) {
        realCodexCount += codexCount;
      } else if (Array.isArray(uData.codexEntries || uData.codex)) {
        realCodexCount += (uData.codexEntries || uData.codex).length;
      }
    });

    realUniversesCount = Math.max(realUniversesCount, validUniverses);
  } catch (uErr) {
    console.warn("Evren istatistikleri senkronize edilemedi:", uErr);
  }

  // 3. Kullanıcının Köşe Yazılarını (Columns) tara
  let realColumnsCount = currentAchievements.publishedColumns || 0;
  try {
    const columnsQ = query(
      collection(db, 'columns'),
      where('authorId', '==', uid),
      where('status', '==', 'published')
    );
    const colSnap = await getDocs(columnsQ);
    realColumnsCount = Math.max(realColumnsCount, colSnap.size);
  } catch {
    // Mevcut sayacı koru
  }

  // 4. Kütüphanedeki gerçek kayıt sayısını al
  let realLibraryCount = currentAchievements.storiesInLibrary || 0;
  try {
    const savedCol = collection(db, 'users', uid, 'savedStories');
    const savedCountSnap = await getCountFromServer(savedCol);
    realLibraryCount = Math.max(realLibraryCount, savedCountSnap.data().count);
  } catch {
    // Mevcut sayacı koru
  }

  // 5. Okunan toplam bölümleri ve interaktif sonları senkronize et
  let realChaptersRead = currentAchievements.chaptersRead || 0;
  let realInteractiveEndings = currentAchievements.interactiveEndingsFound || 0;
  let realInteractiveChoices = currentAchievements.interactiveChoicesMade || 0;

  try {
    const progressCol = collection(db, 'users', uid, 'readingProgress');
    const progressSnap = await getDocs(progressCol);
    let totalCompletedChaps = 0;

    progressSnap.forEach(pDoc => {
      const pData = pDoc.data();
      if (Array.isArray(pData.completedChapters)) {
        totalCompletedChaps += pData.completedChapters.length;
      }
      if (Array.isArray(pData.discoveredEndings)) {
        realInteractiveEndings = Math.max(realInteractiveEndings, pData.discoveredEndings.length);
      }
      if (Array.isArray(pData.pathHistory)) {
        realInteractiveChoices = Math.max(realInteractiveChoices, pData.pathHistory.length);
      }
    });
    realChaptersRead = Math.max(realChaptersRead, totalCompletedChaps);
  } catch {
    // Mevcut sayacı koru
  }

  // 6. Kaydedilen Alıntıları Senkronize Et
  let realQuotesCount = currentAchievements.quotesShared || 0;
  try {
    const quotesCol = collection(db, 'users', uid, 'saved_quotes');
    const quotesSnap = await getCountFromServer(quotesCol);
    realQuotesCount = Math.max(realQuotesCount, quotesSnap.data().count);
  } catch {
    // Mevcut sayacı koru
  }

  // 7. Okuma serisi kontrolü (Kopuksa sıfırla)
  const today = getTodayString();
  const yesterday = getYesterdayString();
  let currentReadStreak = currentAchievements.consecutiveReadDays || 0;
  if (currentAchievements.lastReadDate && currentAchievements.lastReadDate !== today && currentAchievements.lastReadDate !== yesterday) {
    currentReadStreak = 0;
  }

  const updates: Partial<UserAchievements> = {
    totalWordsWritten: Math.max(currentAchievements.totalWordsWritten || 0, realTotalWords),
    publishedChapters: Math.max(currentAchievements.publishedChapters || 0, realPublishedChapters),
    publishedShortStories: Math.max(currentAchievements.publishedShortStories || 0, realPublishedShortStories),
    publishedWebtoons: Math.max(currentAchievements.publishedWebtoons || 0, realPublishedWebtoons),
    completedStories: Math.max(currentAchievements.completedStories || 0, realCompletedStories),
    maxChaptersInStory: Math.max(currentAchievements.maxChaptersInStory || 0, realMaxChaptersInStory),
    maxInteractiveEndingsInStory: Math.max(currentAchievements.maxInteractiveEndingsInStory || 0, realMaxInteractiveEndings),
    storiesInLibrary: realLibraryCount,
    chaptersRead: realChaptersRead,
    quotesShared: realQuotesCount,
    consecutiveReadDays: currentReadStreak,
    universesCreated: realUniversesCount,
    charactersCreated: Math.max(currentAchievements.charactersCreated || 0, realCharactersCount),
    codexEntriesCreated: Math.max(currentAchievements.codexEntriesCreated || 0, realCodexCount),
    publishedColumns: realColumnsCount,
    interactiveEndingsFound: realInteractiveEndings,
    interactiveChoicesMade: realInteractiveChoices,
  };

  await updateAchievements(uid, updates);

  // Özel tekil okuma & yorum başarımlarını tanımla
  if (reached100Reads) await awardBadge(uid, 'first_crowd_100');
  if (reached1000Reads) await awardBadge(uid, 'first_crowd_1000');
  if (reached20CommentsOnChapter) await awardBadge(uid, 'controversial');

  // Tüm kuralları tekrar değerlendir
  const newlyEarned = await evaluateBadges(uid);

  // Güncel veriyi al ve döndür
  const updatedUserSnap = await getDoc(userRef);
  const updatedUser = updatedUserSnap.data() as User;
  const updatedAchievements = await ensureAchievements(uid, updatedUser.achievements);

  return {
    newlyEarned,
    achievements: updatedAchievements,
  };
}
