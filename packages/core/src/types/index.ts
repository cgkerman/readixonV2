/**
 * Readixon â€” Merkezi Tip TanÄ±mlarÄ±
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Bu dosya, readixon_architecture.md dokÃ¼manÄ±ndaki Firestore JSON ÅŸemalarÄ±na
 * birebir karÅŸÄ±lÄ±k gelen TypeScript tiplerini tanÄ±mlar.
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

import type { Timestamp } from 'firebase/firestore';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.1. KullanÄ±cÄ±lar (/users)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UserStats {
  followers: number;
  following: number;
  totalReads: number;
  arenaScore?: number;
}

export interface UserAchievements {
  // --- Yazar İstatistikleri ---
  totalWordsWritten: number; // Editörde yazılan toplam kelime
  consecutiveWriteDays: number; // Peş peşe yazılan gün sayısı
  lastWriteDate?: string; // Son yazılan tarih (YYYY-MM-DD)
  
  wordImports: number; // Dışarıdan dosya (docx/txt vs.) aktarma sayısı
  publishedChapters: number; // Yayına alınan bölüm sayısı
  completedStories: number; // Tamamlandı işaretlenen hikaye sayısı
  commentsReplied: number; // Okuyucu yorumlarına verilen cevap sayısı

  // --- Okur İstatistikleri ---
  chaptersRead: number; // Okunan toplam bölüm sayısı
  consecutiveReadDays: number; // Peş peşe okunan gün sayısı
  lastReadDate?: string; // Son okunan tarih (YYYY-MM-DD)
  
  storiesInLibrary: number; // Kütüphaneye eklenen hikaye sayısı
  commentsGiven: number; // Yapılan toplam yorum sayısı
  likesGiven: number; // Verilen toplam beğeni/oy sayısı
  
  earnedBadges: string[]; // Kazanılan rozetlerin ID'leri
}

export interface User {
  uid: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  preferredGenres: string[];
  stats: UserStats;
  createdAt: Timestamp;
  isAuthor?: boolean;
  isAdmin?: boolean;
  status?: 'free' | 'premium' | 'pro'; // Premium status for features like Character Book
  rxPoints?: number; // Virtual currency balance
  termsAcceptedAt?: Timestamp; // Yasal onay timestamp
  privacyAcceptedAt?: Timestamp; // Gizlilik onay timestamp
  aiUsage?: {
    date: string; // YYYY-MM-DD
    requestCount: number;
  };
  blockedUsers?: string[];
  readixPoints?: number; // Edebi Arena puanları
  hasUsedFreeWizard?: boolean; // Freemium wizard hakkını kullandı mı?
  freeCharacterBookStoryId?: string; // Hangi hikaye için karakter defterini ücretsiz açtığı
  achievements?: UserAchievements; // Kullanıcı başarımları ve rozetleri
}

/** Yeni kullanÄ±cÄ± oluÅŸturulurken kullanÄ±lan kÄ±smi tip */
export type CreateUserInput = Pick<User, 'uid' | 'displayName'> &
  Partial<Pick<User, 'username' | 'avatarUrl' | 'bio' | 'preferredGenres' | 'termsAcceptedAt' | 'privacyAcceptedAt'>>;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.2. Hikayeler (/stories)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type StoryStatus = 'ongoing' | 'completed' | 'draft';

export interface StoryStats {
  views: number;
  likes: number;
  chapterCount: number;
  rating?: number;       // 10 üzerinden ortalama puan (Örn: 8.5)
  reviewCount?: number;  // Toplam inceleme sayısı
  commentCount?: number; // Toplam bölüm ve satır arası yorum sayısı
}

export interface Contributor {
  role: string;
  name: string;
}

export interface Story {
  storyId: string;
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  title: string;
  summary: string;
  coverImage: string;
  tags: string[];
  isAdultContent?: boolean;
  stats: StoryStats;
  
  // YayÄ±nevi/Platform Ek DetaylarÄ±
  foreword?: string;          // Ã–nsÃ¶z
  backCover?: string;         // Arka Kapak YazÄ±sÄ±
  contributors?: Contributor[]; // KatkÄ±da Bulunanlar (EditÃ¶r, Ã§izer vs.)

  /** 'ongoing' | 'completed' | 'draft' */
  status: StoryStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.3. BÃ¶lÃ¼mler (/stories/{storyId}/chapters/{chapterId})
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ContentBlockType = 'paragraph' | 'quote' | 'image' | 'divider' | 'end_of_chapter' | 'end_of_story';

/**
 * BÃ¶lÃ¼m iÃ§eriÄŸi JSON blok formatÄ±nda tutulur.
 * React Native'de kolay render edilebilir; HTML baÄŸÄ±mlÄ±lÄ±ÄŸÄ± yoktur.
 */
export interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  url?: string; // image bloklarÄ± iÃ§in
  textStyle?: 'normal' | 'bold' | 'italic';
}

export interface ChapterStats {
  views: number;
  likes: number;
  commentCount: number;
}

export interface Chapter {
  chapterId: string;
  title: string;
  order: number;
  contentBlocks: ContentBlock[];
  publishDate: Timestamp;
  status?: 'draft' | 'published' | 'scheduled';
  stats?: ChapterStats;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.4. Yorumlar (/comments)
// SatÄ±r-arasÄ± (inline) yorum desteÄŸi: paragraphIndex ile hangi
// paragrafa ait olduÄŸu tutulur.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Comment {
  commentId: string;
  storyId: string;
  chapterId: string;
  type?: 'chapter' | 'paragraph';
  paragraphIndex: number; // -1 for chapter level
  userId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  text: string;
  likes?: number;
  replyToId?: string;
  createdAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.5. Ä°ncelemeler / Yorumlar (Reviews) (/stories/{storyId}/reviews/{reviewId})
// KitabÄ±n geneline yapÄ±lan deÄŸerlendirmeler ve 10 Ã¼zerinden puanlama.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Review {
  reviewId: string;
  storyId: string;
  userId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  rating: number; // 1-10 arasÄ±
  text: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.5. Okuma Ä°lerlemesi (/users/{userId}/readingProgress/{storyId})
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ReadingProgress {
  userId: string;
  storyId: string;
  currentChapterId: string;
  scrollPercentage: number; // 0-100
  completedChapters: string[]; // Tamamlanan bÃ¶lÃ¼m ID'leri
  isAdultContentAccepted?: boolean; // YetiÅŸkin iÃ§erik okuma onayÄ±
  updatedAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.6. Readix GÃ¶nderileri (Sosyal AkÄ±ÅŸ) (/readixes/{readixId})
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ReadixStats {
  likes: number;
  comments: number;
  shares: number;
}

export interface Readix {
  id: string;
  authorId: string;
  content: string; // GÃ¶nderi metni
  mediaUrls?: string[]; // Varsa gÃ¶rseller
  linkedStoryId?: string; // GÃ¶nderiye konu olan kitap/hikaye
  tags?: string[]; // Metinden Ã§Ä±karÄ±lan hashtagler
  mentions?: string[]; // Bahsedilen kullanÄ±cÄ±lar (@kullaniciadi)
  stats: ReadixStats;
  createdAt: Timestamp;
}

export interface ReadixComment {
  id: string;
  readixId: string;
  authorId: string;
  content: string;
  likes?: number; // Yorum beÄŸeni sayÄ±sÄ±
  replyToId?: string; // Hangi yoruma yanÄ±t verildiÄŸi (null ise ana yorum)
  createdAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.7. Bildirimler (/users/{userId}/notifications/{notificationId})
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type NotificationType = 
  | 'follow' 
  | 'story_like' 
  | 'chapter_like'
  | 'story_comment' 
  | 'paragraph_comment'
  | 'readix_like' 
  | 'readix_comment' 
  | 'readix_mention'
  | 'new_chapter'
  | 'duel_challenge'
  | 'duel_accepted'
  | 'duel_rejected'
  | 'system_message'
  | 'badge_earned';

export interface AppNotification {
  id: string;
  userId: string; // The user receiving the notification
  actorId: string; // The user who performed the action
  actorName: string; // Display name
  actorAvatar?: string; // Avatar URL
  actorUsername?: string; 
  type: NotificationType;
  entityId?: string; // e.g. storyId or readixId
  entityTitle?: string; // optional context, e.g. "Yüzüklerin Efendisi"
  subEntityId?: string; // e.g. chapterId
  subEntityTitle?: string; // e.g. chapter title
  message?: string; // System message content
  isRead: boolean;
  createdAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.8. MesajlaÅŸma (Direct Messaging)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ChatParticipant {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl: string;
}

export interface PaymentTransaction {
  id: string; // Firestore document ID (also used as merchant_oid)
  userId: string;
  type: 'rx_points' | 'premium_subscription' | 'pro_subscription';
  status: 'pending' | 'completed' | 'failed';
  amount: number; // in TL (e.g., 19.90)
  rxAmount?: number; // Only for RX Points purchase
  createdAt: Timestamp;
  updatedAt: Timestamp;
  paytrResponse?: any;
}

export type ChatStatus = 'pending' | 'accepted';

export interface Chat {
  id: string;
  participants: string[]; // UIDs
  participantDetails: Record<string, ChatParticipant>; // uid -> Participant details
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  unreadCounts: Record<string, number>; // uid -> unread count
  status: ChatStatus;
  requestedBy: string; // UID of the user who initiated the chat
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Genel YardÄ±mcÄ± Tipler
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** TÃ¼r (genre) listesi â€” preferredGenres ve tags iÃ§in kullanÄ±lÄ±r */
export type Genre =
  | 'sci-fi'
  | 'dystopian'
  | 'fantasy'
  | 'romance'
  | 'thriller'
  | 'horror'
  | 'mystery'
  | 'adventure'
  | 'historical'
  | 'literary-fiction'
  | 'young-adult'
  | string; // Ã–zel etiketlere izin ver

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.8. Arena (DÃ¼ellolar)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type DuelStatus = 'pending' | 'active' | 'voting' | 'completed';

export interface DuelAuthor {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl: string;
}

export interface Duel {
  id: string; // Document ID (Opsiyonel olarak saklayabiliriz, genelde doc.id kullanÄ±lÄ±yor)
  title?: string; // Hikayenin Ã¶zel adÄ±
  prompt: string; // DÃ¼ellonun konusu/ilhamÄ±
  authorA: DuelAuthor; // Meydan okuyan (OdayÄ± kuran)
  authorB: DuelAuthor; // Meydan okunan
  status: DuelStatus;
  currentTurnUid: string; // Åu an yazma sÄ±rasÄ± kimde
  turnCount: number; // Toplam kaÃ§ tur oynandÄ±
  turnTimeLimitMinutes?: number; // Tur baÅŸÄ±na verilen sÃ¼re (dk)
  embargoedWords: string[]; // GeÃ§erli turda yasaklanan kelimeler
  winnerUid?: string; // Oylama bitince kazanan
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp; // EÄŸer aktifse sÄ±ra sÃ¼resi
  votingEndsAt?: Timestamp; // Oylama bitiÅŸ zamanÄ±
  scores?: {
    [authorUid: string]: {
      totalScore: number;
      voteCount: number;
      average: number;
    }
  };
  voters?: string[]; // Oy kullanan okurlarÄ±n UID'leri
}

export interface DuelTurn {
  id?: string;
  duelId: string;
  authorUid: string;
  content: string; // YazarÄ±n bu turda yazdÄ±ÄŸÄ± metin
  wordCount: number;
  embargoWordsSet: string[]; // Rakibe bir sonraki tur iÃ§in koyduÄŸu yasaklar
  createdAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.9. Åikayetler (Reports)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type ReportTargetType = 'readix' | 'story' | 'user' | 'comment';

export interface Report {
  id: string;
  targetId: string;
  targetType: ReportTargetType;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.10. Yazar Lobisi (Edebi Arena)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type LobbyStatus = 'waiting' | 'active' | 'voting' | 'completed';

export interface LobbyRoom {
  id: string;
  title: string;
  theme: string; // YazÄ± konusu/temasÄ±
  status: LobbyStatus;
  entryFee: number; // KatÄ±lÄ±m Ã¼creti (puan)
  winnerPrize: number; // Kazanan Ã¶dÃ¼lÃ¼ (puan)
  minParticipants: number; // Min katÄ±lÄ±mcÄ± sayÄ±sÄ± (Ã¶rn: 2)
  maxParticipants: number; // Max katÄ±lÄ±mcÄ± sayÄ±sÄ± (Ã¶rn: 20)
  wordLimit: number; // Kelime sÄ±nÄ±rÄ± (Ã¶rn: 1000)
  durationMinutes: number; // YazÄ±m sÃ¼resi (dk) (Ã¶rn: 120)
  
  participantIds: string[]; // HÄ±zlÄ± sorgulama iÃ§in katÄ±lÄ±mcÄ± ID'leri
  
  createdBy: string; // OdayÄ± kuran adminin UID'si
  createdAt: Timestamp;
  startedAt?: Timestamp; // Oyun baÅŸladÄ±ÄŸÄ±nda atanÄ±r
  votingEndsAt?: Timestamp; // OylamanÄ±n biteceÄŸi zaman
  winners?: string[]; // Kazanan(lar) - Beraberlik durumunda birden fazla olabilir
}

export interface LobbyParticipant {
  roomId: string; // Parent collection ID veya Document ID
  uid: string;
  joinedAt: Timestamp;
  hasSubmitted: boolean;
}

export interface LobbySubmission {
  id: string;
  roomId: string;
  authorUid: string; // KÃ¶r oylama iÃ§in dÄ±ÅŸarÄ±ya kapalÄ± tutulacak (sadece server/admin)
  content: string;
  wordCount: number;
  createdAt: Timestamp;
}

export interface LobbyVote {
  id: string;
  roomId: string;
  submissionId: string;
  voterUid: string;
  topicScore: number;      // 1-5
  languageScore: number;   // 1-5
  creativityScore: number; // 1-5
  totalScore: number;      // Toplam puan
  createdAt: Timestamp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3.11. SÃ¼rpriz KÄ±rÄ±lma (Curveball) OdalarÄ±
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CurveballType = 'taboo_word' | 'forced_injection' | 'punctuation_boycott';

export interface CurveballConfig {
  type: CurveballType;
  payload: string[]; // YasaklÄ± kelimeler, zorunlu cÃ¼mle veya noktalama iÅŸaretleri
  triggerPercentage: number; // SÃ¼renin son % kaÃ§Ä±nda patlayacak (Ã–rn: 25)
}

export type CurveballStatus = 'waiting' | 'active' | 'voting' | 'completed';

export interface CurveballRoom {
  id: string;
  title: string;
  theme: string;
  status: CurveballStatus;
  entryFee: number;
  winnerPrize: number;
  minParticipants: number;
  maxParticipants: number;
  wordLimit: number;
  durationMinutes: number;
  
  curveball: CurveballConfig;
  
  participantIds: string[];
  createdBy: string;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  votingEndsAt?: Timestamp;
  winners?: string[];
}

export interface CurveballParticipant {
  roomId: string;
  uid: string;
  joinedAt: Timestamp;
  hasSubmitted: boolean;
}

export interface CurveballSubmission {
  id: string;
  roomId: string;
  authorUid: string;
  content: string;
  wordCount: number;
  createdAt: Timestamp;
}

export interface CurveballVote {
  id: string;
  roomId: string;
  submissionId: string;
  voterUid: string;
  topicScore: number;
  languageScore: number;
  creativityScore: number;
  totalScore: number;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.5. Alıntılar (Quotes)
// ─────────────────────────────────────────────

export interface SavedQuote {
  id: string;
  text: string;
  storyId: string;
  chapterId: string;
  storyTitle: string;
  authorName: string;
  authorUsername?: string | null;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.6. Etkileşimler (Beğeni / Dislike vs)r Notebook)
// ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦
// 3.12. Karakter Defteri (Character Notebook)
// ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor';

export interface CharacterRPGStats {
  intelligence: number; // 1-10
  strength: number;     // 1-10
  charisma: number;     // 1-10
  agility: number;      // 1-10
  empathy: number;      // 1-10
}

export interface Character {
  id: string;
  storyId: string;
  name: string;
  role: CharacterRole;
  
  // Basic Info
  age?: string;
  gender?: string;
  occupation?: string;
  
  // Visual
  avatarUrl?: string;
  
  // Physical Appearance
  bodyType?: string;
  eyeColor?: string;
  hairColor?: string;
  clothingStyle?: string;
  distinguishingFeatures?: string; // Scars, tattoos, etc.
  
  // Psychology
  personalityTraits?: string[]; // e.g. ['Brave', 'Introverted']
  greatestFear?: string;
  secretDesire?: string;
  flaws?: string;
  
  // Story Arc
  startingState?: string;
  endingState?: string;
  coreMotivation?: string;
  
  // Stats
  rpgStats?: CharacterRPGStats;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
