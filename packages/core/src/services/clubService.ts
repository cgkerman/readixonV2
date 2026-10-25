import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Club,
  ClubMember,
  ClubMemberRole,
  ClubJourney,
  ClubChannel,
  ClubMessage,
  ClubBookArchive,
  ClubActiveBook,
} from '../types/club';
import { getUserProfile } from './userService';
import { createNotification } from './notificationService';
import { slugify } from '../utils/slugify';

const CLUBS_COLLECTION = 'clubs';

// ─────────────────────────────────────────────────────────────────
// 1. KULÜP CRUD İŞLEMLERİ
// ─────────────────────────────────────────────────────────────────

export interface CreateClubInput {
  name: string;
  description: string;
  coverUrl?: string;
  avatarUrl?: string;
  tags?: string[];
  isPrivate?: boolean;
  isAuthorOfficial?: boolean;
  linkedAuthorId?: string;
  linkedUniverseId?: string;
  linkedUniverseName?: string;
}

/**
 * Yeni bir kitap kulübü oluşturur ve oluşturan kişiyi 'owner' rolüyle üye yapar.
 * Varsayılan olarak "Genel Sohbet" kanalını da başlatır.
 */
export async function createClub(creatorId: string, input: CreateClubInput): Promise<Club> {
  const profile = await getUserProfile(creatorId);
  if (!profile) {
    throw new Error('Kullanıcı profili bulunamadı.');
  }

  const baseSlug = slugify(input.name) || 'kulup';
  let finalSlug = baseSlug;

  // Slug çakışması kontrolü
  const existingWithSlug = await getClubBySlug(finalSlug);
  if (existingWithSlug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    finalSlug = `${baseSlug}-${randomSuffix}`;
  }

  const clubRef = doc(collection(db, CLUBS_COLLECTION));
  const clubId = clubRef.id;

  const now = Timestamp.now();

  const newClub: Club = {
    id: clubId,
    slug: finalSlug,
    name: input.name.trim(),
    description: input.description.trim(),
    coverUrl: input.coverUrl || '',
    avatarUrl: input.avatarUrl || '',
    tags: input.tags || [],
    isPrivate: !!input.isPrivate,
    creatorId,
    creatorName: profile.displayName || profile.username || 'Okur',
    creatorUsername: profile.username || '',
    creatorAvatar: profile.avatarUrl || '',
    isAuthorOfficial: !!input.isAuthorOfficial,
    linkedAuthorId: input.linkedAuthorId || '',
    linkedUniverseId: input.linkedUniverseId || '',
    linkedUniverseName: input.linkedUniverseName || '',
    stats: {
      membersCount: 1,
      completedBooksCount: 0,
      activeJourneysCount: 0,
      discussionsCount: 1,
    },
    createdAt: now,
    updatedAt: now,
  };

  // 1. Kulüp ana belgesini yaz
  await setDoc(clubRef, newClub);

  // 2. Kurucuyu üye alt koleksiyonuna ekle (Owner)
  const memberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', creatorId);
  const ownerMember: ClubMember = {
    id: creatorId,
    clubId,
    userId: creatorId,
    userName: newClub.creatorName,
    userUsername: newClub.creatorUsername,
    userAvatar: newClub.creatorAvatar,
    role: 'owner',
    joinedAt: now,
    currentChapterIndex: 0,
    completedActiveBook: false,
    lastActiveAt: now,
  };
  await setDoc(memberRef, ownerMember);

  // 3. Varsayılan "Genel Sohbet" kanalını oluştur
  const generalChannelRef = doc(collection(db, CLUBS_COLLECTION, clubId, 'channels'));
  const generalChannel: ClubChannel = {
    id: generalChannelRef.id,
    clubId,
    title: 'Genel Sohbet',
    description: 'Kulüp üyeleri ile serbest sohbet ve tanışma alanı.',
    type: 'general',
    requiredChapterIndex: 0,
    isLocked: false,
    messagesCount: 0,
    createdAt: now,
  };
  await setDoc(generalChannelRef, generalChannel);

  return newClub;
}

/**
 * ID ile kulüp bilgilerini getirir.
 */
export async function getClubById(clubId: string): Promise<Club | null> {
  const snap = await getDoc(doc(db, CLUBS_COLLECTION, clubId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Club;
}

/**
 * Slug ile kulüp bilgilerini getirir.
 */
export async function getClubBySlug(slug: string): Promise<Club | null> {
  const q = query(collection(db, CLUBS_COLLECTION), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const firstDoc = snap.docs[0];
  return { ...firstDoc.data(), id: firstDoc.id } as Club;
}

/**
 * Kulüpleri filtreleyerek listeler.
 */
export async function getClubs(options?: {
  tag?: string;
  isAuthorOfficial?: boolean;
  limitCount?: number;
}): Promise<Club[]> {
  const maxLimit = options?.limitCount || 30;
  const clubsRef = collection(db, CLUBS_COLLECTION);

  try {
    let q = query(clubsRef, orderBy('createdAt', 'desc'), limit(maxLimit));

    if (options?.tag) {
      q = query(clubsRef, where('tags', 'array-contains', options.tag), limit(maxLimit));
    } else if (options?.isAuthorOfficial !== undefined) {
      q = query(clubsRef, where('isAuthorOfficial', '==', options.isAuthorOfficial), limit(maxLimit));
    }

    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as Club));
  } catch (err) {
    console.warn('getClubs indexed query hatası, fallback uygulanıyor:', err);
    try {
      const fallbackSnap = await getDocs(clubsRef);
      let list = fallbackSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Club));
      if (options?.tag) {
        list = list.filter((c) => c.tags?.includes(options.tag!));
      }
      if (options?.isAuthorOfficial !== undefined) {
        list = list.filter((c) => Boolean(c.isAuthorOfficial) === options.isAuthorOfficial);
      }
      return list.slice(0, maxLimit);
    } catch (fallbackErr) {
      console.error('getClubs fallback hatası:', fallbackErr);
      return [];
    }
  }
}


// ─────────────────────────────────────────────────────────────────
// 2. ÜYELİK İŞLEMLERİ (MEMBERSHIP)
// ─────────────────────────────────────────────────────────────────

/**
 * Kulübe katılır.
 */
export async function joinClub(clubId: string, userId: string): Promise<ClubMember> {
  const club = await getClubById(clubId);
  if (!club) {
    throw new Error('Kulüp bulunamadı.');
  }

  const memberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', userId);
  const snap = await getDoc(memberRef);
  if (snap.exists()) {
    return { ...snap.data(), id: snap.id } as ClubMember;
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('Kullanıcı profili bulunamadı.');
  }

  const now = Timestamp.now();
  const newMember: ClubMember = {
    id: userId,
    clubId,
    userId,
    userName: profile.displayName || profile.username || 'Okur',
    userUsername: profile.username || '',
    userAvatar: profile.avatarUrl || '',
    role: 'member',
    joinedAt: now,
    currentChapterIndex: 0,
    completedActiveBook: false,
    lastActiveAt: now,
  };

  await setDoc(memberRef, newMember);

  // Kulüp üye sayısını artır
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    'stats.membersCount': increment(1),
    updatedAt: serverTimestamp(),
  });

  return newMember;
}

/**
 * Kulüpten ayrılır. (Kurucu kulüpten ayrılamaz).
 */
export async function leaveClub(clubId: string, userId: string): Promise<void> {
  const memberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', userId);
  const snap = await getDoc(memberRef);
  if (!snap.exists()) return;

  const member = snap.data() as ClubMember;
  if (member.role === 'owner') {
    throw new Error('Kulüp kurucusu kulüpten ayrılamaz. Önce liderliği devretmelisiniz.');
  }

  await deleteDoc(memberRef);

  // Üye sayısını azalt
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    'stats.membersCount': increment(-1),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Kullanıcının kulüp üyeliğini sorgular.
 */
export async function getClubMembership(clubId: string, userId: string): Promise<ClubMember | null> {
  const memberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', userId);
  const snap = await getDoc(memberRef);
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as ClubMember;
}

/**
 * Kulüp üyelerini listeler.
 */
export async function getClubMembers(clubId: string, limitCount = 50): Promise<ClubMember[]> {
  const membersRef = collection(db, CLUBS_COLLECTION, clubId, 'members');
  const q = query(membersRef, orderBy('joinedAt', 'asc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as ClubMember));
}

/**
 * Kulüp üyesinin rolünü günceller (Yalnızca Kurucu / Admin).
 */
export async function updateClubMemberRole(
  clubId: string,
  operatorUserId: string,
  targetUserId: string,
  newRole: ClubMemberRole
): Promise<void> {
  const operatorMembership = await getClubMembership(clubId, operatorUserId);
  if (!operatorMembership || (operatorMembership.role !== 'owner' && operatorMembership.role !== 'admin')) {
    throw new Error('Üye rolü değiştirme yetkiniz yok.');
  }

  // Kurucunun rolü değiştirilemez
  const targetMemberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', targetUserId);
  const targetSnap = await getDoc(targetMemberRef);
  if (!targetSnap.exists()) {
    throw new Error('Üye bulunamadı.');
  }

  const targetData = targetSnap.data() as ClubMember;
  if (targetData.role === 'owner') {
    throw new Error('Kulüp kurucusunun yetkisi değiştirilemez.');
  }

  // Adminler başka birini owner yapamaz veya başka adminin rolünü değiştiremez
  if (operatorMembership.role === 'admin' && (newRole === 'owner' || targetData.role === 'admin')) {
    throw new Error('Yöneticiler diğer yöneticilerin rolünü değiştiremez veya liderlik atayamaz.');
  }

  await updateDoc(targetMemberRef, {
    role: newRole,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Üyeyi kulüpten çıkarır (Yalnızca Kurucu / Admin).
 */
export async function removeClubMember(
  clubId: string,
  operatorUserId: string,
  targetUserId: string
): Promise<void> {
  const operatorMembership = await getClubMembership(clubId, operatorUserId);
  if (!operatorMembership || (operatorMembership.role !== 'owner' && operatorMembership.role !== 'admin')) {
    throw new Error('Üye çıkarma yetkiniz yok.');
  }

  const targetMemberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', targetUserId);
  const targetSnap = await getDoc(targetMemberRef);
  if (!targetSnap.exists()) return;

  const targetData = targetSnap.data() as ClubMember;
  if (targetData.role === 'owner') {
    throw new Error('Kulüp kurucusu kulüpten çıkarılamaz.');
  }

  if (operatorMembership.role === 'admin' && targetData.role === 'admin') {
    throw new Error('Yöneticiler diğer yöneticileri kulüpten çıkaramaz.');
  }

  await deleteDoc(targetMemberRef);

  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    'stats.membersCount': increment(-1),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Üyenin aktif kitaptaki ilerlemesini günceller (Okuyucu ile entegre çalışır).
 */
export async function updateMemberProgress(
  clubId: string,
  userId: string,
  chapterIndex: number,
  isBookCompleted = false
): Promise<void> {
  const memberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', userId);
  await updateDoc(memberRef, {
    currentChapterIndex: chapterIndex,
    completedActiveBook: isBookCompleted,
    lastActiveAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────────
// 3. YAŞAYAN OKUMA YOLCULUĞU (LIVING JOURNEY)
// ─────────────────────────────────────────────────────────────────

export interface CreateJourneyInput {
  storyId: string;
  storyTitle: string;
  storyCoverUrl?: string;
  authorName?: string;
  authorId?: string;
  totalChapters: number;
  title: string;
  description?: string;
  startDate: any;
  endDate: any;
  milestones: Array<{
    dayNumber: number;
    targetChapterIndex: number;
    targetChapterTitle: string;
    discussionTopic?: string;
    unlockDate: string;
  }>;
}

/**
 * Kulüp için yeni bir okuma seferi (Living Journey) başlatır.
 * Aynı zamanda kulübün aktif kitabını günceller ve ilgili kilometre taşı tartışma kanallarını otomatik açar.
 */
export async function createClubJourney(
  clubId: string,
  userId: string,
  input: CreateJourneyInput
): Promise<ClubJourney> {
  const [membership, clubSnap] = await Promise.all([
    getClubMembership(clubId, userId),
    getDoc(doc(db, CLUBS_COLLECTION, clubId)),
  ]);

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin' && membership.role !== 'moderator')) {
    throw new Error('Yalnızca kulüp yöneticileri yeni bir okuma yolculuğu başlatabilir.');
  }

  const club = clubSnap.exists() ? (clubSnap.data() as Club) : null;

  // Yazar kendi hikayelerine sadece bunu yapabilmeli. Diğer hikayelere yapmamalı koruması
  const storySnap = await getDoc(doc(db, 'stories', input.storyId));
  if (!storySnap.exists()) {
    throw new Error('Seçilen eser bulunamadı.');
  }
  const storyData = storySnap.data();

  if (club?.isAuthorOfficial) {
    const targetAuthorId = club.linkedAuthorId || club.creatorId;
    if (storyData.authorId !== targetAuthorId && storyData.authorId !== userId) {
      throw new Error('Resmi yazar kulübünde yalnızca yazarın kendi yayınlanmış eserleri için okuma seferi başlatılabilir.');
    }
  } else {
    // Normal kulüpte de seferi başlatan yazar yalnızca kendi eserini seçebilmeli
    if (storyData.authorId !== userId && storyData.authorId !== club?.creatorId) {
      throw new Error('Yalnızca kendi yayınlanmış eserleriniz için okuma seferi başlatabilirsiniz. Başka yazarların eserlerine sefer başlatılamaz.');
    }
  }

  const now = Timestamp.now();
  const journeyRef = doc(collection(db, CLUBS_COLLECTION, clubId, 'journeys'));
  const journeyId = journeyRef.id;

  const newJourney: ClubJourney = {
    id: journeyId,
    clubId,
    storyId: input.storyId,
    storyTitle: input.storyTitle,
    storyCoverUrl: input.storyCoverUrl || '',
    totalChapters: input.totalChapters,
    title: input.title,
    description: input.description || '',
    startDate: input.startDate,
    endDate: input.endDate,
    milestones: input.milestones,
    status: 'active',
    participantsCount: 1,
    createdAt: now,
  };

  await setDoc(journeyRef, newJourney);

  // Kulübün aktif kitabını güncelle
  const activeBook: ClubActiveBook = {
    storyId: input.storyId,
    title: input.storyTitle,
    coverUrl: input.storyCoverUrl || '',
    totalChapters: input.totalChapters,
    authorName: input.authorName || '',
    authorId: input.authorId || '',
    startedAt: now,
  };

  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    activeBook,
    'stats.activeJourneysCount': increment(1),
    updatedAt: serverTimestamp(),
  });

  // Kilometre taşları için otomatik tartışma kanalları oluştur
  for (const milestone of input.milestones) {
    const channelRef = doc(collection(db, CLUBS_COLLECTION, clubId, 'channels'));
    const channel: ClubChannel = {
      id: channelRef.id,
      clubId,
      title: `${milestone.dayNumber}. Gün: ${milestone.targetChapterTitle}`,
      description: milestone.discussionTopic || `${milestone.targetChapterIndex}. bölüme kadar olan tartışmalar ve teoriler.`,
      type: 'chapter_discussion',
      requiredChapterIndex: milestone.targetChapterIndex,
      isLocked: false,
      messagesCount: 0,
      createdAt: now,
    };
    await setDoc(channelRef, channel);
  }

  return newJourney;
}

/**
 * Kulübün şu anki aktif okuma yolculuğunu getirir.
 */
export async function getActiveClubJourney(clubId: string): Promise<ClubJourney | null> {
  const journeysRef = collection(db, CLUBS_COLLECTION, clubId, 'journeys');
  const q = query(journeysRef, where('status', '==', 'active'), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const firstDoc = snap.docs[0];
  return { ...firstDoc.data(), id: firstDoc.id } as ClubJourney;
}

/**
 * Kulübün tüm okuma yolculuklarını getirir.
 */
export async function getClubJourneys(clubId: string): Promise<ClubJourney[]> {
  const journeysRef = collection(db, CLUBS_COLLECTION, clubId, 'journeys');
  const q = query(journeysRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as ClubJourney));
}

// ─────────────────────────────────────────────────────────────────
// 4. TARTIŞMA KANALLARI & SPOİLER KORUMA MOTORU
// ─────────────────────────────────────────────────────────────────

/**
 * Spoiler Erişim Kontrolü:
 * Kullanıcının okuma ilerlemesi (userChapterIndex) ile kanalın gereksinimini (requiredChapterIndex) kıyaslar.
 */
export function checkUserSpoilerAccess(
  requiredChapterIndex?: number,
  userChapterIndex?: number
): { hasAccess: boolean; remainingChapters: number } {
  if (!requiredChapterIndex || requiredChapterIndex <= 0) {
    return { hasAccess: true, remainingChapters: 0 };
  }
  const current = userChapterIndex ?? 0;
  const hasAccess = current >= requiredChapterIndex;
  return {
    hasAccess,
    remainingChapters: Math.max(0, requiredChapterIndex - current),
  };
}

/**
 * Kulüp için yeni bir tartışma veya AMA kanalı oluşturur.
 */
export async function createClubChannel(
  clubId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    type: ClubChannel['type'];
    requiredChapterIndex?: number;
    guestAuthorId?: string;
    guestAuthorName?: string;
    isAMAActive?: boolean;
  }
): Promise<ClubChannel> {
  const membership = await getClubMembership(clubId, userId);
  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin' && membership.role !== 'moderator')) {
    throw new Error('Kanal oluşturma yetkiniz yok.');
  }

  const channelRef = doc(collection(db, CLUBS_COLLECTION, clubId, 'channels'));
  const now = Timestamp.now();

  const channel: ClubChannel = {
    id: channelRef.id,
    clubId,
    title: data.title.trim(),
    description: data.description?.trim() || '',
    type: data.type,
    requiredChapterIndex: data.requiredChapterIndex || 0,
    guestAuthorId: data.guestAuthorId || '',
    guestAuthorName: data.guestAuthorName || '',
    isAMAActive: !!data.isAMAActive,
    isLocked: false,
    messagesCount: 0,
    createdAt: now,
  };

  await setDoc(channelRef, channel);

  // Kulüp tartışma sayısını artır
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    'stats.discussionsCount': increment(1),
    updatedAt: serverTimestamp(),
  });

  return channel;
}

/**
 * Kulübün tüm tartışma kanallarını listeler.
 */
export async function getClubChannels(clubId: string): Promise<ClubChannel[]> {
  const channelsRef = collection(db, CLUBS_COLLECTION, clubId, 'channels');
  const q = query(channelsRef, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as ClubChannel));
}

// ─────────────────────────────────────────────────────────────────
// 5. MESAJLAŞMA & YAZAR SORU-CEVAP (AMA) İŞLEMLERİ
// ─────────────────────────────────────────────────────────────────

export interface SendMessageInput {
  text: string;
  isSpoiler?: boolean;
  spoilerChapterIndex?: number;
  replyToId?: string;
  replyToSnippet?: string;
  replyToSenderName?: string;
}

/**
 * Kanala yeni bir mesaj gönderir.
 * Spoiler kuralları doğrulanır.
 */
export async function sendClubMessage(
  clubId: string,
  channelId: string,
  userId: string,
  input: SendMessageInput
): Promise<ClubMessage> {
  const [membership, channelSnap] = await Promise.all([
    getClubMembership(clubId, userId),
    getDoc(doc(db, CLUBS_COLLECTION, clubId, 'channels', channelId)),
  ]);

  if (!membership) {
    throw new Error('Mesaj göndermek için kulüp üyesi olmalısınız.');
  }

  if (!channelSnap.exists()) {
    throw new Error('Kanal bulunamadı.');
  }

  const channel = channelSnap.data() as ClubChannel;

  // Spoiler Kontrolü: Eğer kanal bir bölüm eşiği gerektiriyorsa ve üye henüz o bölüme ulaşmadıysa engelle
  const access = checkUserSpoilerAccess(channel.requiredChapterIndex, membership.currentChapterIndex);
  if (!access.hasAccess) {
    throw new Error(
      `Bu kanala mesaj göndermek için ${channel.requiredChapterIndex}. bölümü tamamlamalısınız (Kalan: ${access.remainingChapters} bölüm).`
    );
  }

  const clubSnap = await getDoc(doc(db, CLUBS_COLLECTION, clubId));
  const club = clubSnap.data() as Club;

  const isAuthor = club?.isAuthorOfficial && club?.linkedAuthorId === userId;

  const messagesRef = collection(db, CLUBS_COLLECTION, clubId, 'channels', channelId, 'messages');
  const messageDocRef = doc(messagesRef);
  const now = Timestamp.now();

  const newMessage: ClubMessage = {
    id: messageDocRef.id,
    clubId,
    channelId,
    senderId: userId,
    senderName: membership.userName,
    senderUsername: membership.userUsername,
    senderAvatar: membership.userAvatar,
    senderRole: membership.role,
    isAuthorOfficial: isAuthor,
    text: input.text.trim(),
    isSpoiler: !!input.isSpoiler,
    spoilerChapterIndex: input.spoilerChapterIndex || channel.requiredChapterIndex || 0,
    upvotesCount: 0,
    upvoterIds: [],
    isAuthorReply: isAuthor,
    replyToId: input.replyToId,
    replyToSnippet: input.replyToSnippet,
    replyToSenderName: input.replyToSenderName,
    createdAt: now,
  };

  await setDoc(messageDocRef, newMessage);

  // Kanalın son mesaj bilgilerini ve mesaj sayısını güncelle
  const channelRef = doc(db, CLUBS_COLLECTION, clubId, 'channels', channelId);
  await updateDoc(channelRef, {
    messagesCount: increment(1),
    lastMessageAt: now,
    lastMessageSnippet: input.text.slice(0, 80),
  });

  return newMessage;
}

/**
 * Kanal mesajlarını gerçek zamanlı dinler (Realtime Subscription).
 */
export function subscribeToClubMessages(
  clubId: string,
  channelId: string,
  onUpdate: (messages: ClubMessage[]) => void,
  limitCount = 50
): Unsubscribe {
  const messagesRef = collection(db, CLUBS_COLLECTION, clubId, 'channels', channelId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(limitCount));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as ClubMessage));
    onUpdate(messages);
  });
}

/**
 * Mesajı / Soru-Cevap (AMA) sorusunu Upvote eder (veya kaldırır).
 */
export async function toggleUpvoteClubMessage(
  clubId: string,
  channelId: string,
  messageId: string,
  userId: string
): Promise<{ upvoted: boolean }> {
  const messageRef = doc(db, CLUBS_COLLECTION, clubId, 'channels', channelId, 'messages', messageId);
  const snap = await getDoc(messageRef);
  if (!snap.exists()) {
    throw new Error('Mesaj bulunamadı.');
  }

  const message = snap.data() as ClubMessage;
  const upvoterIds = message.upvoterIds || [];
  const hasUpvoted = upvoterIds.includes(userId);

  if (hasUpvoted) {
    await updateDoc(messageRef, {
      upvoterIds: arrayRemove(userId),
      upvotesCount: increment(-1),
    });
    return { upvoted: false };
  } else {
    await updateDoc(messageRef, {
      upvoterIds: arrayUnion(userId),
      upvotesCount: increment(1),
    });
    return { upvoted: true };
  }
}

// ─────────────────────────────────────────────────────────────────
// 6. KULÜP OKUMA ARŞİVİ (CLUB LEGACY)
// ─────────────────────────────────────────────────────────────────

/**
 * Tamamlanan bir eseri kulübün geçmiş arşivine ekler.
 */
export async function archiveCompletedBook(
  clubId: string,
  userId: string,
  data: {
    journeyId?: string;
    storyId: string;
    title: string;
    coverUrl?: string;
    authorName: string;
    authorId?: string;
    totalParticipants: number;
    averageRating: number;
    summaryNotes?: string;
  }
): Promise<ClubBookArchive> {
  const membership = await getClubMembership(clubId, userId);
  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    throw new Error('Yalnızca yöneticiler tamamlanan kitabı arşive taşıyabilir.');
  }

  const archiveRef = doc(collection(db, CLUBS_COLLECTION, clubId, 'archive'));
  const now = Timestamp.now();

  const archiveItem: ClubBookArchive = {
    id: archiveRef.id,
    clubId,
    storyId: data.storyId,
    title: data.title,
    coverUrl: data.coverUrl || '',
    authorName: data.authorName,
    authorId: data.authorId || '',
    completedAt: now,
    totalParticipants: data.totalParticipants,
    averageRating: data.averageRating,
    summaryNotes: data.summaryNotes || '',
  };

  await setDoc(archiveRef, archiveItem);

  // Eğer bir journeyId varsa sefer durumunu 'completed' yap
  if (data.journeyId) {
    try {
      const journeyRef = doc(db, CLUBS_COLLECTION, clubId, 'journeys', data.journeyId);
      await updateDoc(journeyRef, {
        status: 'completed',
        completedAt: now,
      });
    } catch (err) {
      console.warn('Sefer durumu güncellenemedi:', err);
    }
  }

  // Kulüp istatistiklerini güncelle (Tamamlanan kitap sayısı +1, aktif kitabı sıfırla)
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    'stats.completedBooksCount': increment(1),
    'stats.activeJourneysCount': increment(-1),
    activeBook: null,
    updatedAt: serverTimestamp(),
  });

  return archiveItem;
}

/**
 * Kulübün tamamladığı kitap arşivini getirir.
 */
export async function getClubArchives(clubId: string): Promise<ClubBookArchive[]> {
  const archivesRef = collection(db, CLUBS_COLLECTION, clubId, 'archive');
  const q = query(archivesRef, orderBy('completedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as ClubBookArchive));
}

// ─────────────────────────────────────────────────────────────────
// 7. OKUYUCU (READER) OTOMATİK KİLİT AÇMA & İLERLEME SENKRONİZASYONU
// ─────────────────────────────────────────────────────────────────

export interface ClubUnlockResult {
  unlocked: boolean;
  clubId: string;
  clubName: string;
  clubSlug: string;
  channelTitle: string;
  channelId: string;
  requiredChapterIndex: number;
}

/**
 * Kullanıcı okuyucuda bir bölümü tamamladığında üyesi olduğu kulüplerdeki ilerlemesini senkronize eder.
 * Eğer bu bölümle birlikte yeni bir spoiler korumalı odanın kilidi açıldıysa bunu bildirir.
 */
export async function syncClubReadingProgress(
  userId: string,
  storyId: string,
  completedChapterIndex: number,
  isBookCompleted = false
): Promise<ClubUnlockResult[]> {
  try {
    const clubsRef = collection(db, CLUBS_COLLECTION);
    const q = query(clubsRef, where('activeBook.storyId', '==', storyId));
    const snap = await getDocs(q);

    if (snap.empty) return [];

    const unlockedResults: ClubUnlockResult[] = [];

    for (const clubDoc of snap.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data() as Club;

      // Kullanıcının bu kulüpte üyeliği var mı kontrol et
      const memberRef = doc(db, CLUBS_COLLECTION, clubId, 'members', userId);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) continue;

      const member = memberSnap.data() as ClubMember;
      const previousChapter = member.currentChapterIndex || 0;

      // Eğer ilerleme arttıysa güncelle
      if (completedChapterIndex > previousChapter) {
        await updateMemberProgress(clubId, userId, completedChapterIndex, isBookCompleted);

        // Kilitli kanalları kontrol et (Daha önce kilitli olup şimdi açılanlar)
        const channels = await getClubChannels(clubId);
        for (const channel of channels) {
          if (
            channel.requiredChapterIndex &&
            channel.requiredChapterIndex > previousChapter &&
            channel.requiredChapterIndex <= completedChapterIndex
          ) {
            unlockedResults.push({
              unlocked: true,
              clubId,
              clubName: clubData.name,
              clubSlug: clubData.slug,
              channelTitle: channel.title,
              channelId: channel.id,
              requiredChapterIndex: channel.requiredChapterIndex,
            });

            // Kullanıcıya in-app bildirim oluştur
            createNotification({
              userId,
              actorId: 'system',
              actorName: clubData.name,
              actorUsername: clubData.slug,
              type: 'club_room_unlocked',
              entityId: clubId,
              entityTitle: clubData.name,
              subEntityId: channel.id,
              subEntityTitle: channel.title,
            }).catch(() => {});
          }
        }
      }
    }

    return unlockedResults;
  } catch (err) {
    console.error('syncClubReadingProgress hatası:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// 9. KULÜP SİLME & ADMIN YÖNETİMİ
// ─────────────────────────────────────────────────────────────────

/**
 * Tüm kulüpleri listeler (Admin paneli için).
 */
export async function getAllClubs(): Promise<Club[]> {
  try {
    const q = query(collection(db, CLUBS_COLLECTION), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Club));
  } catch (err) {
    console.error('getAllClubs hatası:', err);
    return [];
  }
}

/**
 * Normal kulüp kurucusu tarafından kulübün silinmesi.
 */
export async function deleteClub(clubId: string, userId: string): Promise<void> {
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  const clubSnap = await getDoc(clubRef);

  if (!clubSnap.exists()) {
    throw new Error('Kulüp bulunamadı.');
  }

  const club = clubSnap.data() as Club;
  const membership = await getClubMembership(clubId, userId);
  const isCreatorOrAuthor =
    club.creatorId === userId ||
    (club.isAuthorOfficial && club.linkedAuthorId === userId) ||
    membership?.role === 'owner';

  if (!isCreatorOrAuthor) {
    throw new Error('Yalnızca kulüp kurucusu veya yazar kulübü silebilir.');
  }

  await deleteDoc(clubRef);
}

/**
 * Admin tarafından kulübün gerekçe belirtilerek kapatılması/silinmesi.
 * Kulüp sahibine ve tüm üyelere kapanma gerekçesini içeren resmi sistem bildirimi gönderir.
 */
export async function adminDeleteClub(
  clubId: string,
  adminId: string,
  adminName: string,
  reason: string
): Promise<void> {
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  const clubSnap = await getDoc(clubRef);

  if (!clubSnap.exists()) {
    throw new Error('Silinecek kulüp bulunamadı.');
  }

  const club = clubSnap.data() as Club;

  // 1. Kulübün tüm üyelerini çek
  const membersRef = collection(db, CLUBS_COLLECTION, clubId, 'members');
  const membersSnap = await getDocs(membersRef);
  const memberUserIds = membersSnap.docs.map(d => d.id);

  // Kurucuyu ve üyeleri tekilleştir
  const targetUserIds = Array.from(new Set([...memberUserIds, club.creatorId]));

  // 2. Her bir üyeye ve kulüp kurucusuna resmi kapatma bildirimi gönder
  const notificationPromises = targetUserIds.map((targetUserId) => {
    // Admin kendi kendine bildirim göndermesin
    if (targetUserId === adminId) return Promise.resolve(null);

    return createNotification({
      userId: targetUserId,
      actorId: adminId,
      actorName: 'Readixon Yönetimi',
      actorUsername: 'admin',
      type: 'club_deleted',
      entityId: club.id,
      entityTitle: club.name,
      message: reason.trim(),
    }).catch((notifErr) => {
      console.warn(`Kulüp kapatma bildirimi gönderilemedi (${targetUserId}):`, notifErr);
    });
  });

  await Promise.allSettled(notificationPromises);

  // 3. Kulüp ana belgesini sil
  await deleteDoc(clubRef);
}

/**
 * Kulüp bilgilerini günceller (Yalnızca Kurucu / İlgili Yazar).
 */
export async function updateClub(
  clubId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    coverUrl?: string;
    avatarUrl?: string;
    tags?: string[];
    isPrivate?: boolean;
  }
): Promise<Club> {
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  const snap = await getDoc(clubRef);
  if (!snap.exists()) {
    throw new Error('Kulüp bulunamadı.');
  }

  const club = snap.data() as Club;
  const membership = await getClubMembership(clubId, userId);
  const isCreatorOrAuthor =
    club.creatorId === userId ||
    (club.isAuthorOfficial && club.linkedAuthorId === userId) ||
    membership?.role === 'owner';

  if (!isCreatorOrAuthor) {
    throw new Error('Yalnızca kulüp kurucusu veya yazar kulüp bilgilerini düzenleyebilir.');
  }

  const updates: any = {
    updatedAt: serverTimestamp(),
  };

  if (data.name !== undefined && data.name.trim()) {
    updates.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updates.description = data.description.trim();
  }
  if (data.coverUrl !== undefined) {
    updates.coverUrl = data.coverUrl.trim();
  }
  if (data.avatarUrl !== undefined) {
    updates.avatarUrl = data.avatarUrl.trim();
  }
  if (data.tags !== undefined) {
    updates.tags = data.tags;
  }
  if (data.isPrivate !== undefined) {
    updates.isPrivate = data.isPrivate;
  }

  await updateDoc(clubRef, updates);

  return {
    ...club,
    ...updates,
  };
}

/**
 * Tartışma mesajını siler.
 * Mesajı gönderen kişi veya kulüp yöneticisi/moderatörü silebilir.
 */
export async function deleteClubMessage(
  clubId: string,
  channelId: string,
  messageId: string,
  operatorUserId: string
): Promise<void> {
  const messageRef = doc(db, CLUBS_COLLECTION, clubId, 'channels', channelId, 'messages', messageId);
  const msgSnap = await getDoc(messageRef);
  if (!msgSnap.exists()) return;

  const msgData = msgSnap.data();
  const membership = await getClubMembership(clubId, operatorUserId);

  const isOwnMessage = msgData.senderId === operatorUserId;
  const isLeader =
    membership &&
    (membership.role === 'owner' || membership.role === 'admin' || membership.role === 'moderator');

  if (!isOwnMessage && !isLeader) {
    throw new Error('Bu mesajı silme yetkiniz yok.');
  }

  await deleteDoc(messageRef);

  // Kanal mesaj sayısını azalt
  const channelRef = doc(db, CLUBS_COLLECTION, clubId, 'channels', channelId);
  await updateDoc(channelRef, {
    messagesCount: increment(-1),
  });
}

/**
 * Tartışma odasını siler (Genel Sohbet hariç).
 * Yalnızca Kurucu ve Yöneticiler silebilir.
 */
export async function deleteClubChannel(
  clubId: string,
  channelId: string,
  operatorUserId: string
): Promise<void> {
  const membership = await getClubMembership(clubId, operatorUserId);
  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    throw new Error('Tartışma odasını silme yetkiniz yok.');
  }

  const channelRef = doc(db, CLUBS_COLLECTION, clubId, 'channels', channelId);
  const channelSnap = await getDoc(channelRef);
  if (!channelSnap.exists()) return;

  const channelData = channelSnap.data() as ClubChannel;
  if (channelData.type === 'general' || channelData.title === 'Genel Sohbet') {
    throw new Error('Varsayılan Genel Sohbet odası silinemez.');
  }

  await deleteDoc(channelRef);

  // Kulüp tartışma sayısını azalt
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    'stats.discussionsCount': increment(-1),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Kulüp liderliğini başka bir üyeye devreder (Yalnızca Mevcut Kurucu).
 */
export async function transferClubOwnership(
  clubId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  if (currentOwnerId === newOwnerId) {
    throw new Error('Zaten kulüp kurucususunuz.');
  }

  const currentMembership = await getClubMembership(clubId, currentOwnerId);
  if (!currentMembership || currentMembership.role !== 'owner') {
    throw new Error('Yalnızca mevcut kulüp kurucusu liderliği devredebilir.');
  }

  const newOwnerRef = doc(db, CLUBS_COLLECTION, clubId, 'members', newOwnerId);
  const newOwnerSnap = await getDoc(newOwnerRef);
  if (!newOwnerSnap.exists()) {
    throw new Error('Liderliğin devredileceği üye bulunamadı.');
  }

  const newOwnerProfile = await getUserProfile(newOwnerId);
  const currentOwnerRef = doc(db, CLUBS_COLLECTION, clubId, 'members', currentOwnerId);

  // 1. Yeni lideri 'owner' yap
  await updateDoc(newOwnerRef, {
    role: 'owner',
    updatedAt: serverTimestamp(),
  });

  // 2. Eski lideri 'admin' (yönetici) yap
  await updateDoc(currentOwnerRef, {
    role: 'admin',
    updatedAt: serverTimestamp(),
  });

  // 3. Kulüp ana belgesindeki kurucu bilgilerini güncelle
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);
  await updateDoc(clubRef, {
    creatorId: newOwnerId,
    creatorName: newOwnerProfile?.displayName || newOwnerProfile?.username || 'Lider',
    creatorUsername: newOwnerProfile?.username || '',
    creatorAvatar: newOwnerProfile?.avatarUrl || '',
    updatedAt: serverTimestamp(),
  });
}


