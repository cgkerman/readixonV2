/**
 * Readixon — Merkezi Tip Tanımları
 * ─────────────────────────────────────────────────────────────────────────────
 * Bu dosya, readixon_architecture.md dokümanındaki Firestore JSON şemalarına
 * birebir karşılık gelen TypeScript tiplerini tanımlar.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Timestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────
// 3.1. Kullanıcılar (/users)
// ─────────────────────────────────────────────

export interface UserStats {
  followers: number;
  following: number;
  totalReads: number;
  arenaScore?: number;
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
  termsAcceptedAt?: Timestamp; // Yasal onay timestamp
  privacyAcceptedAt?: Timestamp; // Gizlilik onay timestamp
  aiUsage?: {
    date: string; // YYYY-MM-DD
    requestCount: number;
  };
  blockedUsers?: string[];
  readixPoints?: number; // Edebi Arena puanları
}

/** Yeni kullanıcı oluşturulurken kullanılan kısmi tip */
export type CreateUserInput = Pick<User, 'uid' | 'displayName'> &
  Partial<Pick<User, 'username' | 'avatarUrl' | 'bio' | 'preferredGenres' | 'termsAcceptedAt' | 'privacyAcceptedAt'>>;

// ─────────────────────────────────────────────
// 3.2. Hikayeler (/stories)
// ─────────────────────────────────────────────

export type StoryStatus = 'ongoing' | 'completed' | 'draft';

export interface StoryStats {
  views: number;
  likes: number;
  chapterCount: number;
  rating?: number;       // 10 üzerinden ortalama puan (Örn: 8.5)
  reviewCount?: number;  // Toplam inceleme sayısı
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
  
  // Yayınevi/Platform Ek Detayları
  foreword?: string;          // Önsöz
  backCover?: string;         // Arka Kapak Yazısı
  contributors?: Contributor[]; // Katkıda Bulunanlar (Editör, çizer vs.)

  /** 'ongoing' | 'completed' | 'draft' */
  status: StoryStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.3. Bölümler (/stories/{storyId}/chapters/{chapterId})
// ─────────────────────────────────────────────

export type ContentBlockType = 'paragraph' | 'quote' | 'image' | 'divider' | 'end_of_chapter';

/**
 * Bölüm içeriği JSON blok formatında tutulur.
 * React Native'de kolay render edilebilir; HTML bağımlılığı yoktur.
 */
export interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  url?: string; // image blokları için
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

// ─────────────────────────────────────────────
// 3.4. Yorumlar (/comments)
// Satır-arası (inline) yorum desteği: paragraphIndex ile hangi
// paragrafa ait olduğu tutulur.
// ─────────────────────────────────────────────

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
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.5. İncelemeler / Yorumlar (Reviews) (/stories/{storyId}/reviews/{reviewId})
// Kitabın geneline yapılan değerlendirmeler ve 10 üzerinden puanlama.
// ─────────────────────────────────────────────

export interface Review {
  reviewId: string;
  storyId: string;
  userId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  rating: number; // 1-10 arası
  text: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────
// 3.5. Okuma İlerlemesi (/users/{userId}/readingProgress/{storyId})
// ─────────────────────────────────────────────

export interface ReadingProgress {
  userId: string;
  storyId: string;
  currentChapterId: string;
  scrollPercentage: number; // 0-100
  completedChapters: string[]; // Tamamlanan bölüm ID'leri
  isAdultContentAccepted?: boolean; // Yetişkin içerik okuma onayı
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.6. Readix Gönderileri (Sosyal Akış) (/readixes/{readixId})
// ─────────────────────────────────────────────

export interface ReadixStats {
  likes: number;
  comments: number;
  shares: number;
}

export interface Readix {
  id: string;
  authorId: string;
  content: string; // Gönderi metni
  mediaUrls?: string[]; // Varsa görseller
  linkedStoryId?: string; // Gönderiye konu olan kitap/hikaye
  tags?: string[]; // Metinden çıkarılan hashtagler
  mentions?: string[]; // Bahsedilen kullanıcılar (@kullaniciadi)
  stats: ReadixStats;
  createdAt: Timestamp;
}

export interface ReadixComment {
  id: string;
  readixId: string;
  authorId: string;
  content: string;
  likes?: number; // Yorum beğeni sayısı
  replyToId?: string; // Hangi yoruma yanıt verildiği (null ise ana yorum)
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.7. Bildirimler (/users/{userId}/notifications/{notificationId})
// ─────────────────────────────────────────────

export type NotificationType = 
  | 'follow' 
  | 'story_like' 
  | 'story_comment' 
  | 'readix_like' 
  | 'readix_comment' 
  | 'readix_mention'
  | 'new_chapter'
  | 'duel_challenge'
  | 'duel_accepted'
  | 'duel_rejected'
  | 'system_message';

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
  subEntityTitle?: string; // e.g. chapter title
  message?: string; // System message content
  isRead: boolean;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.8. Mesajlaşma (Direct Messaging)
// ─────────────────────────────────────────────

export interface ChatParticipant {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl: string;
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

// ─────────────────────────────────────────────
// Genel Yardımcı Tipler
// ─────────────────────────────────────────────

/** Tür (genre) listesi — preferredGenres ve tags için kullanılır */
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
  | string; // Özel etiketlere izin ver

// ─────────────────────────────────────────────
// 3.8. Arena (Düellolar)
// ─────────────────────────────────────────────

export type DuelStatus = 'pending' | 'active' | 'voting' | 'completed';

export interface DuelAuthor {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl: string;
}

export interface Duel {
  id: string; // Document ID (Opsiyonel olarak saklayabiliriz, genelde doc.id kullanılıyor)
  title?: string; // Hikayenin özel adı
  prompt: string; // Düellonun konusu/ilhamı
  authorA: DuelAuthor; // Meydan okuyan (Odayı kuran)
  authorB: DuelAuthor; // Meydan okunan
  status: DuelStatus;
  currentTurnUid: string; // Şu an yazma sırası kimde
  turnCount: number; // Toplam kaç tur oynandı
  turnTimeLimitMinutes?: number; // Tur başına verilen süre (dk)
  embargoedWords: string[]; // Geçerli turda yasaklanan kelimeler
  winnerUid?: string; // Oylama bitince kazanan
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp; // Eğer aktifse sıra süresi
  votingEndsAt?: Timestamp; // Oylama bitiş zamanı
  scores?: {
    [authorUid: string]: {
      totalScore: number;
      voteCount: number;
      average: number;
    }
  };
  voters?: string[]; // Oy kullanan okurların UID'leri
}

export interface DuelTurn {
  id?: string;
  duelId: string;
  authorUid: string;
  content: string; // Yazarın bu turda yazdığı metin
  wordCount: number;
  embargoWordsSet: string[]; // Rakibe bir sonraki tur için koyduğu yasaklar
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// 3.9. Şikayetler (Reports)
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 3.10. Yazar Lobisi (Edebi Arena)
// ─────────────────────────────────────────────

export type LobbyStatus = 'waiting' | 'active' | 'voting' | 'completed';

export interface LobbyRoom {
  id: string;
  title: string;
  theme: string; // Yazı konusu/teması
  status: LobbyStatus;
  entryFee: number; // Katılım ücreti (puan)
  winnerPrize: number; // Kazanan ödülü (puan)
  minParticipants: number; // Min katılımcı sayısı (örn: 2)
  maxParticipants: number; // Max katılımcı sayısı (örn: 20)
  wordLimit: number; // Kelime sınırı (örn: 1000)
  durationMinutes: number; // Yazım süresi (dk) (örn: 120)
  
  participantIds: string[]; // Hızlı sorgulama için katılımcı ID'leri
  
  createdBy: string; // Odayı kuran adminin UID'si
  createdAt: Timestamp;
  startedAt?: Timestamp; // Oyun başladığında atanır
  votingEndsAt?: Timestamp; // Oylamanın biteceği zaman
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
  authorUid: string; // Kör oylama için dışarıya kapalı tutulacak (sadece server/admin)
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

