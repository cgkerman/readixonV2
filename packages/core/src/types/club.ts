import type { Timestamp } from 'firebase/firestore';

/**
 * Kulüp Üye Rolleri
 */
export type ClubMemberRole = 'owner' | 'admin' | 'moderator' | 'member';

/**
 * Kulüp İstatistikleri
 */
export interface ClubStats {
  membersCount: number;
  completedBooksCount: number;
  activeJourneysCount: number;
  discussionsCount: number;
}

/**
 * Kulüpte Şu Anda Okunan Aktif Kitap
 */
export interface ClubActiveBook {
  storyId: string;
  title: string;
  slug?: string;
  coverUrl?: string;
  totalChapters: number;
  authorName: string;
  authorId?: string;
  startedAt?: any;
}

/**
 * Kulüp Ana Veri Modeli
 */
export interface Club {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverUrl?: string;
  avatarUrl?: string;
  tags: string[]; // ['Bilim Kurgu', 'Gerilim', 'Klasikler']
  isPrivate: boolean;
  
  creatorId: string;
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  
  // Yazar Odaklı Özellikler
  isAuthorOfficial: boolean; // Yazarın resmi kulübü mü?
  linkedAuthorId?: string;
  linkedUniverseId?: string;
  linkedUniverseName?: string;
  
  // Aktif Okuma & İlerleme
  activeBook?: ClubActiveBook;
  
  stats: ClubStats;
  createdAt: any;
  updatedAt: any;
}

/**
 * Kulüp Üyesi
 */
export interface ClubMember {
  id: string; // doc.id = userId
  clubId: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar?: string;
  role: ClubMemberRole;
  joinedAt: any;
  
  // Aktif Kitap İlerlemesi
  currentChapterIndex: number;
  completedActiveBook: boolean;
  lastActiveAt?: any;
}

/**
 * Yaşayan Okuma Yolculuğu Kilometre Taşı (Milestone)
 */
export interface ClubJourneyMilestone {
  dayNumber: number;
  targetChapterIndex: number;
  targetChapterTitle: string;
  discussionTopic?: string;
  unlockDate: string; // YYYY-MM-DD
}

/**
 * Yaşayan Okuma Yolculuğu (Living Reading Journey)
 */
export interface ClubJourney {
  id: string;
  clubId: string;
  storyId: string;
  storyTitle: string;
  storyCoverUrl?: string;
  totalChapters: number;
  
  title: string; // Örn: "7 Günlük Geçit Oteli Okuma Seferi"
  description?: string;
  startDate: any; // Timestamp or ISO string
  endDate: any;
  
  milestones: ClubJourneyMilestone[];
  status: 'upcoming' | 'active' | 'completed';
  participantsCount: number;
  createdAt: any;
}

/**
 * Kulüp Tartışma Kanalı Tipleri
 */
export type ClubChannelType = 
  | 'general'             // Serbest sohbet ve tanışma
  | 'chapter_discussion'  // Bölüm bazlı tartışma (Spoiler kilitli)
  | 'theories'            // Teoriler ve tahminler (Spoiler kilitli)
  | 'author_ama'          // Yazarla Soru-Cevap (Canlı veya Asenkron)
  | 'archive';            // Kitap sonu genel değerlendirme

/**
 * Kulüp Kanalı
 */
export interface ClubChannel {
  id: string;
  clubId: string;
  title: string;
  description?: string;
  type: ClubChannelType;
  
  // Spoiler Kilidi Eşiği
  requiredChapterIndex?: number; // Örn: 5 ise kullanıcı 5. bölüme gelmeden göremez/yazamaz
  
  // Yazar Buluşması / AMA Ayarları
  isAMAActive?: boolean;
  guestAuthorId?: string;
  guestAuthorName?: string;
  
  isLocked?: boolean;
  messagesCount: number;
  lastMessageAt?: any;
  lastMessageSnippet?: string;
  createdAt: any;
}

/**
 * Kulüp Mesajı
 */
export interface ClubMessage {
  id: string;
  clubId: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderAvatar?: string;
  senderRole: ClubMemberRole;
  isAuthorOfficial?: boolean;
  
  text: string;
  isSpoiler: boolean;
  spoilerChapterIndex?: number;
  
  // Yazar Soru-Cevap (AMA) için Upvote
  upvotesCount: number;
  upvoterIds?: string[];
  isAuthorReply?: boolean;
  
  // Yanıtlama (Reply)
  replyToId?: string;
  replyToSnippet?: string;
  replyToSenderName?: string;
  
  createdAt: any;
}

/**
 * Kulübün Okuma Arşivi (Club Legacy / Geçmiş Kitaplar)
 */
export interface ClubBookArchive {
  id: string;
  clubId: string;
  storyId: string;
  title: string;
  coverUrl?: string;
  authorName: string;
  authorId?: string;
  completedAt: any;
  totalParticipants: number;
  averageRating: number;
  summaryNotes?: string;
}
