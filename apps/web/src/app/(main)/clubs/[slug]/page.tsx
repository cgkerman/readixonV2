'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  MessageSquare,
  Lock,
  Unlock,
  Send,
  Feather,
  Sparkles,
  ChevronLeft,
  Calendar,
  Share2,
  Heart,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  Award,
  Loader2,
  ShieldAlert,
  Reply,
  Flame,
  Clock,
  X,
  Crown,
  Shield,
  UserMinus,
  Search,
  Check,
  UserCog,
  Trash2,
  Settings,
} from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import {
  getClubBySlug,
  getClubMembership,
  getClubChannels,
  getActiveClubJourney,
  subscribeToClubMessages,
  sendClubMessage,
  toggleUpvoteClubMessage,
  joinClub,
  leaveClub,
  checkUserSpoilerAccess,
  getClubMembers,
  updateClubMemberRole,
  removeClubMember,
  getClubArchives,
  deleteClubMessage,
  deleteClubChannel,
  transferClubOwnership,
  useAuthStore,
  type Club,
  type ClubMember,
  type ClubMemberRole,
  type ClubChannel,
  type ClubJourney,
  type ClubMessage,
  type ClubBookArchive,
} from '@readixon/core';
import { toast } from 'sonner';
import { LivingJourneyBar } from '@/components/clubs/LivingJourneyBar';
import { SpoilerGate } from '@/components/clubs/SpoilerGate';
import { StartJourneyModal } from '@/components/clubs/StartJourneyModal';
import { AdminDeleteClubModal } from '@/components/clubs/AdminDeleteClubModal';
import { DeleteClubModal } from '@/components/clubs/DeleteClubModal';
import { ArchiveJourneyModal } from '@/components/clubs/ArchiveJourneyModal';
import { EditClubModal } from '@/components/clubs/EditClubModal';
import { CreateChannelModal } from '@/components/clubs/CreateChannelModal';

export default function ClubDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { firebaseUser, userProfile } = useAuthStore();

  const [club, setClub] = useState<Club | null>(null);
  const [membership, setMembership] = useState<ClubMember | null>(null);
  const [channels, setChannels] = useState<ClubChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [journey, setJourney] = useState<ClubJourney | null>(null);
  const [messages, setMessages] = useState<ClubMessage[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSpoilerMessage, setIsSpoilerMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Spoiler Override Bypass state per channel
  const [bypassedChannels, setBypassedChannels] = useState<Record<string, boolean>>({});

  // Modals & Tabs
  const [isStartJourneyOpen, setIsStartJourneyOpen] = useState(false);
  const [isArchiveJourneyOpen, setIsArchiveJourneyOpen] = useState(false);
  const [isEditClubOpen, setIsEditClubOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isAdminDeleteOpen, setIsAdminDeleteOpen] = useState(false);
  const [isDeleteClubOpen, setIsDeleteClubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'discussions' | 'members' | 'archive'>('discussions');

  // Members & Roles State
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | ClubMemberRole>('all');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Archive State
  const [archives, setArchives] = useState<ClubBookArchive[]>([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);

  // Room Customization & AMA State
  const [amaSortMode, setAmaSortMode] = useState<'top' | 'newest'>('top');
  const [replyingToMessage, setReplyingToMessage] = useState<ClubMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load
  const fetchClubData = async () => {
    if (!slug) return;
    try {
      setIsLoading(true);
      const clubData = await getClubBySlug(slug);
      if (!clubData) {
        toast.error('Kulüp bulunamadı.');
        router.push('/clubs');
        return;
      }
      setClub(clubData);

      const [channelsData, journeyData] = await Promise.all([
        getClubChannels(clubData.id),
        getActiveClubJourney(clubData.id),
      ]);

      setChannels(channelsData);
      setJourney(journeyData);

      if (channelsData.length > 0 && !activeChannelId) {
        setActiveChannelId(channelsData[0].id);
      }

      if (firebaseUser) {
        const memberData = await getClubMembership(clubData.id, firebaseUser.uid);
        setMembership(memberData);
      }
    } catch (err) {
      console.error('Kulüp yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Members
  const fetchMembers = async () => {
    if (!club) return;
    try {
      setIsLoadingMembers(true);
      const data = await getClubMembers(club.id, 100);
      setMembers(data);
    } catch (err) {
      console.error('Kulüp üyeleri yüklenemedi:', err);
      toast.error('Üye listesi yüklenemedi.');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch Archives
  const fetchArchives = async () => {
    if (!club) return;
    try {
      setIsLoadingArchives(true);
      const data = await getClubArchives(club.id);
      setArchives(data);
    } catch (err) {
      console.error('Sefer arşivi yüklenemedi:', err);
    } finally {
      setIsLoadingArchives(false);
    }
  };

  // Switch tabs & fetch on demand
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'archive') {
      fetchArchives();
    }
  }, [activeTab, club?.id]);

  useEffect(() => {
    fetchClubData();
  }, [slug, firebaseUser]);

  // 2. Realtime Messages Listener for Active Channel
  useEffect(() => {
    if (!club || !activeChannelId) return;

    const unsubscribe = subscribeToClubMessages(club.id, activeChannelId, (newMessages) => {
      setMessages(newMessages);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [club?.id, activeChannelId]);

  // Handle Join / Leave
  const handleToggleMembership = async () => {
    if (!firebaseUser) {
      toast.error('Kulübe katılmak için giriş yapmalısınız.');
      return;
    }
    if (!club) return;

    try {
      setIsJoining(true);
      if (membership) {
        await leaveClub(club.id, firebaseUser.uid);
        setMembership(null);
        setClub((prev: Club | null) =>
          prev
            ? { ...prev, stats: { ...prev.stats, membersCount: Math.max(0, prev.stats.membersCount - 1) } }
            : null
        );
        toast.success('Kulüpten ayrıldınız.');
      } else {
        const newMember = await joinClub(club.id, firebaseUser.uid);
        setMembership(newMember);
        setClub((prev: Club | null) =>
          prev
            ? { ...prev, stats: { ...prev.stats, membersCount: (prev.stats.membersCount || 0) + 1 } }
            : null
        );
        toast.success(`"${club.name}" kulübüne hoş geldiniz! 🎉`);
      }
    } catch (err: any) {
      toast.error(err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !club || !activeChannelId) return;
    if (!messageText.trim()) return;

    try {
      setIsSending(true);
      await sendClubMessage(club.id, activeChannelId, firebaseUser.uid, {
        text: messageText.trim(),
        isSpoiler: isSpoilerMessage,
        replyToId: replyingToMessage?.id,
        replyToSnippet: replyingToMessage?.text ? replyingToMessage.text.slice(0, 100) : undefined,
        replyToSenderName: replyingToMessage?.senderName,
      });

      setMessageText('');
      setIsSpoilerMessage(false);
      setReplyingToMessage(null);
    } catch (err: any) {
      toast.error(err.message || 'Mesaj gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Upvote
  const handleToggleUpvote = async (messageId: string) => {
    if (!firebaseUser || !club || !activeChannelId) {
      toast.error('Oy vermek için giriş yapmalısınız.');
      return;
    }

    try {
      await toggleUpvoteClubMessage(club.id, activeChannelId, messageId, firebaseUser.uid);
    } catch (err: any) {
      toast.error(err.message || 'Oy verilemedi.');
    }
  };

  // Handle Role Change
  const handleRoleChange = async (targetUserId: string, targetName: string, newRole: ClubMemberRole) => {
    if (!club || !firebaseUser) return;
    try {
      setUpdatingMemberId(targetUserId);
      await updateClubMemberRole(club.id, firebaseUser.uid, targetUserId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.userId === targetUserId ? { ...m, role: newRole } : m))
      );
      if (membership && membership.userId === targetUserId) {
        setMembership({ ...membership, role: newRole });
      }
      toast.success(`${targetName} için yetki "${getRoleLabel(newRole)}" olarak güncellendi.`);
    } catch (err: any) {
      console.error('Rol güncelleme hatası:', err);
      toast.error(err.message || 'Yetki güncellenirken bir hata oluştu.');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Handle Kick Member
  const handleKickMember = async (targetUserId: string, targetName: string) => {
    if (!club || !firebaseUser) return;
    const confirmed = window.confirm(`${targetName} adlı üyeyi kulüpten çıkarmak istediğinize emin misiniz?`);
    if (!confirmed) return;

    try {
      setUpdatingMemberId(targetUserId);
      await removeClubMember(club.id, firebaseUser.uid, targetUserId);
      setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
      setClub((prev) =>
        prev
          ? { ...prev, stats: { ...prev.stats, membersCount: Math.max(0, prev.stats.membersCount - 1) } }
          : null
      );
      toast.success(`${targetName} kulüpten çıkarıldı.`);
    } catch (err: any) {
      console.error('Üye çıkarma hatası:', err);
      toast.error(err.message || 'Üye çıkarılırken bir hata oluştu.');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (channelId: string, messageId: string) => {
    if (!club || !firebaseUser) return;
    const confirmed = window.confirm('Bu mesajı silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      await deleteClubMessage(club.id, channelId, messageId, firebaseUser.uid);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, messagesCount: Math.max(0, (c.messagesCount || 1) - 1) } : c))
      );
      toast.success('Mesaj silindi.');
    } catch (err: any) {
      console.error('Mesaj silme hatası:', err);
      toast.error(err.message || 'Mesaj silinirken bir hata oluştu.');
    }
  };

  // Handle Delete Channel
  const handleDeleteChannel = async (channelId: string, channelTitle: string) => {
    if (!club || !firebaseUser) return;
    const confirmed = window.confirm(`"${channelTitle}" odasını ve içindeki tüm mesajları silmek istediğinize emin misiniz?`);
    if (!confirmed) return;

    try {
      await deleteClubChannel(club.id, channelId, firebaseUser.uid);
      setChannels((prev) => prev.filter((c) => c.id !== channelId));
      if (activeChannelId === channelId) {
        const remaining = channels.filter((c) => c.id !== channelId);
        if (remaining.length > 0) setActiveChannelId(remaining[0].id);
      }
      setClub((prev) =>
        prev
          ? { ...prev, stats: { ...prev.stats, discussionsCount: Math.max(0, (prev.stats.discussionsCount || 1) - 1) } }
          : null
      );
      toast.success(`"${channelTitle}" odası silindi.`);
    } catch (err: any) {
      console.error('Oda silme hatası:', err);
      toast.error(err.message || 'Oda silinirken bir hata oluştu.');
    }
  };

  // Handle Transfer Ownership
  const handleTransferOwnership = async (targetUserId: string, targetName: string) => {
    if (!club || !firebaseUser) return;
    const confirmed = window.confirm(
      `Kulüp liderliğini "${targetName}" adlı üyeye devretmek istediğinize emin misiniz? Bu işlemden sonra kulüp kurucusu siz olmayacaksınız (yönetici olarak kalacaksınız).`
    );
    if (!confirmed) return;

    try {
      setUpdatingMemberId(targetUserId);
      await transferClubOwnership(club.id, firebaseUser.uid, targetUserId);
      setMembers((prev) =>
        prev.map((m) => {
          if (m.userId === targetUserId) return { ...m, role: 'owner' };
          if (m.userId === firebaseUser.uid) return { ...m, role: 'admin' };
          return m;
        })
      );
      if (membership) {
        setMembership({ ...membership, role: 'admin' });
      }
      setClub((prev) => (prev ? { ...prev, creatorId: targetUserId, creatorName: targetName } : null));
      toast.success(`Kulüp liderliği "${targetName}" adlı üyeye devredildi.`);
    } catch (err: any) {
      console.error('Liderlik devir hatası:', err);
      toast.error(err.message || 'Liderlik devredilirken bir hata oluştu.');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Handle Share Club
  const handleShareClub = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    toast.success('Kulüp bağlantısı panoya kopyalandı! 📋');
  };

  // Role permissions checker
  const canOperatorManageMember = (targetMember: ClubMember): boolean => {
    if (!firebaseUser || !membership) return false;
    if (targetMember.userId === firebaseUser.uid) return false;
    if (targetMember.role === 'owner') return false;
    if (membership.role === 'owner') return true;
    if (membership.role === 'admin' && targetMember.role !== 'admin') return true;
    return false;
  };

  const getRoleLabel = (role: ClubMemberRole) => {
    switch (role) {
      case 'owner':
        return 'Kurucu';
      case 'admin':
        return 'Yönetici';
      case 'moderator':
        return 'Moderatör';
      default:
        return 'Okur';
    }
  };

  const getRoleBadge = (role: ClubMemberRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Crown size={10} className="stroke-[2.5]" />
            <span>Kurucu</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Shield size={10} />
            <span>Yönetici</span>
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles size={10} />
            <span>Moderatör</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/15 text-muted border border-border/40">
            <Users size={10} />
            <span>Okur</span>
          </span>
        );
    }
  };

  const formatJoinedDate = (timestamp: any) => {
    if (!timestamp) return 'Bilinmiyor';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Bilinmiyor';
    }
  };

  if (isLoading || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center space-y-3">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const isLeader = membership?.role === 'owner' || membership?.role === 'admin' || membership?.role === 'moderator';
  const isAuthorOfClub = Boolean(
    (club.isAuthorOfficial && club.linkedAuthorId === firebaseUser?.uid) ||
    (userProfile?.isAuthor && club.creatorId === firebaseUser?.uid)
  );
  const isCreator = Boolean(
    club.creatorId === firebaseUser?.uid ||
    (club.isAuthorOfficial && club.linkedAuthorId === firebaseUser?.uid) ||
    membership?.role === 'owner'
  );

  // Sorted Messages based on room type & filter
  const sortedMessages = [...messages].sort((a, b) => {
    if (activeChannel?.type === 'author_ama' && amaSortMode === 'top') {
      const diff = (b.upvotesCount || 0) - (a.upvotesCount || 0);
      if (diff !== 0) return diff;
    }
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return timeA - timeB;
  });

  // Spoiler Check for Active Channel
  const spoilerAccess = checkUserSpoilerAccess(
    activeChannel?.requiredChapterIndex,
    membership?.currentChapterIndex || 0
  );
  const isChannelLocked = !spoilerAccess.hasAccess && !bypassedChannels[activeChannel?.id || ''];

  return (
    <div className="min-h-screen pb-20">
      {/* ── Top Hero / Banner ── */}
      <div className="relative h-64 md:h-80 w-full bg-muted/20 overflow-hidden border-b border-border/50">
        <img
          src={
            club.coverUrl ||
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&auto=format&fit=crop&q=80'
          }
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back navigation */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-background/80 text-foreground backdrop-blur-md border border-border/40 hover:bg-background transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Kulüplere Dön</span>
          </Link>
        </div>

        {/* Club Details Overlay */}
        <div className="absolute bottom-6 left-6 right-6 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-card border-2 border-border shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
              {club.avatarUrl ? (
                <img src={club.avatarUrl} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-amber-500/20 flex items-center justify-center font-black text-3xl text-primary">
                  {club.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                {club.isAuthorOfficial ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black shadow-md">
                    <Feather size={13} className="stroke-[2.5]" />
                    <span>Resmi Yazar Kulübü</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/20 text-primary border border-primary/30">
                    <Sparkles size={12} />
                    <span>Okur Kulübü</span>
                  </span>
                )}
                <span className="text-xs text-muted font-medium">
                  Kurucu: <strong className="text-foreground">{club.creatorName}</strong>
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
                {club.name}
              </h1>

              <p className="text-xs md:text-sm text-muted mt-1 max-w-xl line-clamp-2">
                {club.description}
              </p>
            </div>
          </div>

          {/* Membership Actions */}
          <div className="shrink-0 flex items-center gap-2.5">
            <Button
              variant="outline"
              onPress={handleShareClub}
              className="px-3.5 py-3 rounded-2xl text-xs font-bold border-border/60 hover:bg-muted/10 active:scale-95 transition-all flex items-center gap-1.5"
              title="Kulübü Paylaş"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Paylaş</span>
            </Button>

            {Boolean(userProfile?.isAdmin) && (
              <Button
                variant="outline"
                onPress={() => setIsAdminDeleteOpen(true)}
                className="px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ShieldAlert size={14} />
                <span>Kulübü Kapat (Admin)</span>
              </Button>
            )}

            {isCreator && (
              <>
                <Button
                  variant="outline"
                  onPress={() => setIsEditClubOpen(true)}
                  className="px-3.5 py-3 rounded-2xl text-xs font-bold border-border/60 hover:bg-muted/10 active:scale-95 transition-all flex items-center gap-1.5"
                  title="Kulüp Bilgilerini Düzenle"
                >
                  <Settings size={14} />
                  <span>Düzenle</span>
                </Button>

                <Button
                  variant="outline"
                  onPress={() => setIsDeleteClubOpen(true)}
                  className="px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                  title="Kulübü Tamamen Sil"
                >
                  <Trash2 size={14} />
                  <span>Kulübü Sil</span>
                </Button>
              </>
            )}

            <Button
              variant={membership ? 'outline' : 'primary'}
              disabled={isJoining}
              onPress={handleToggleMembership}
              className="px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all"
            >
              {membership ? (
                membership.role === 'owner' ? (
                  'Lider (Kurucu)'
                ) : (
                  'Kulüpten Ayrıl'
                )
              ) : (
                '+ Kulübe Katıl'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 space-y-6">
        {/* Living Reading Journey Banner */}
        <LivingJourneyBar
          journey={journey}
          userMembership={membership}
          isLeader={isLeader}
          onStartNewJourney={() => setIsStartJourneyOpen(true)}
          onArchiveJourney={() => setIsArchiveJourneyOpen(true)}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('discussions')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'discussions'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <MessageSquare size={15} />
            <span>Tartışma Odaları</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'discussions' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
              }`}
            >
              {channels.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <Users size={15} />
            <span>Kulüp Üyeleri</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'members' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
              }`}
            >
              {club.stats?.membersCount || members.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'archive'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <Award size={15} />
            <span>Sefer Arşivi</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'archive' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
              }`}
            >
              {archives.length}
            </span>
          </button>
        </div>

        {/* ── 1. DISCUSSIONS TAB: Dual-Pane Community Layout ── */}
        {activeTab === 'discussions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── LEFT PANE: Channels & Rooms (4 Cols) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-card border border-border/70 p-4 shadow-sm space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Tartışma Odaları
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted font-medium">
                  {channels.length} Oda
                </span>
                {isLeader && (
                  <button
                    type="button"
                    onClick={() => setIsCreateChannelOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-black text-xs font-bold transition-all shadow-xs active:scale-95"
                    title="Yeni Tartışma Odası Aç"
                  >
                    <Plus size={13} className="stroke-[2.5]" />
                    <span>Oda Aç</span>
                  </button>
                )}
              </div>
            </div>

            {/* Channels List */}
            <div className="space-y-1.5">
              {channels.map((channel) => {
                const isSelected = channel.id === activeChannelId;
                const access = checkUserSpoilerAccess(
                  channel.requiredChapterIndex,
                  membership?.currentChapterIndex || 0
                );
                const isLocked = !access.hasAccess && !bypassedChannels[channel.id];

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm font-bold'
                        : 'text-foreground/80 hover:bg-muted/10 hover:text-foreground font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isLocked ? (
                        <Lock size={15} className="text-amber-500 shrink-0" />
                      ) : channel.type === 'author_ama' ? (
                        <Feather size={15} className="text-amber-500 shrink-0" />
                      ) : channel.type === 'theories' ? (
                        <Sparkles size={15} className="text-purple-400 shrink-0" />
                      ) : channel.type === 'chapter_discussion' ? (
                        <BookOpen size={15} className="text-blue-400 shrink-0" />
                      ) : (
                        <MessageSquare size={15} className={isSelected ? 'text-primary shrink-0' : 'text-muted shrink-0'} />
                      )}

                      <div className="min-w-0">
                        <span className="text-xs block truncate">{channel.title}</span>
                        {channel.requiredChapterIndex ? (
                          <span className="text-[10px] text-muted block truncate font-normal">
                            Bölüm {channel.requiredChapterIndex}+ Eşiği
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                          Kilitli
                        </span>
                      )}
                      <span className="text-[11px] text-muted font-semibold">
                        {channel.messagesCount || 0}
                      </span>
                      {isLeader && channel.type !== 'general' && channel.title !== 'Genel Sohbet' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(channel.id, channel.title);
                          }}
                          className="p-1 rounded-md text-muted/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all ml-1"
                          title="Odayı Sil"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Club Info Card */}
            <div className="pt-4 border-t border-border/60 px-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                Kulüp Kültürü
              </span>
              <div className="text-xs text-muted space-y-2">
                <p>
                  🛡️ <strong>Spoiler Kuralı:</strong> İlerideki bölümlerden bahsederken mesajınızı "Spoiler İçerir" olarak işaretleyin.
                </p>
                <p>
                  ⭐ <strong>Yazar Odası:</strong> Yazarımız katıldığında en çok upvote alan sorular canlı olarak yanıtlanır.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANE: Active Room / Discussion Stream (8 Cols) ── */}
          <div className="lg:col-span-8 rounded-3xl bg-card border border-border/70 flex flex-col min-h-[600px] shadow-sm overflow-hidden">
            {/* Room Header */}
            {/* Room Header */}
            <div className="p-4 md:p-5 border-b border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {isChannelLocked ? (
                    <Lock size={18} className="text-amber-500" />
                  ) : activeChannel?.type === 'author_ama' ? (
                    <Feather size={18} className="text-amber-500" />
                  ) : activeChannel?.type === 'theories' ? (
                    <Sparkles size={18} className="text-purple-400" />
                  ) : activeChannel?.type === 'chapter_discussion' ? (
                    <BookOpen size={18} className="text-blue-400" />
                  ) : (
                    <MessageSquare size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm md:text-base text-foreground truncate">
                      {activeChannel?.title}
                    </h2>
                    {activeChannel?.type === 'author_ama' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        Yazar Buluşması / AMA
                      </span>
                    )}
                    {activeChannel?.type === 'theories' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Teoriler & Gizemler
                      </span>
                    )}
                    {activeChannel?.type === 'chapter_discussion' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Bölüm Tartışması
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted truncate">
                    {activeChannel?.description || 'Tartışma ve fikir paylaşımı alanı.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeChannel?.requiredChapterIndex ? (
                  <span className="text-[11px] px-2.5 py-1 rounded-xl bg-muted/15 text-muted font-semibold shrink-0">
                    🔒 {activeChannel.requiredChapterIndex}. Bölüm Eşiği
                  </span>
                ) : null}
                {isLeader && activeChannel?.type !== 'general' && activeChannel?.title !== 'Genel Sohbet' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteChannel(activeChannel.id, activeChannel.title)}
                    className="p-1.5 rounded-xl text-muted hover:text-rose-500 hover:bg-rose-500/10 border border-border/40 hover:border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-medium"
                    title="Bu Odayı Sil"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Odayı Sil</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── ROOM CONCEPT BANNERS (Oda Türüne Özel Üst Alan) ── */}
            {activeChannel?.type === 'author_ama' && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Feather size={16} />
                  </div>
                  <div className="text-xs min-w-0">
                    <strong className="text-amber-400 font-bold block">Canlı Yazar Soru-Cevap (AMA) Alanı</strong>
                    <span className="text-muted text-[11px]">
                      Yazarımıza iletmek istediğiniz soruları paylaşın; en çok oy alan sorular öne çıkar.
                    </span>
                  </div>
                </div>

                {/* AMA Question Sorting Filter */}
                <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/60 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAmaSortMode('top')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      amaSortMode === 'top'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <Flame size={12} />
                    <span>En Çok Oylananlar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmaSortMode('newest')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      amaSortMode === 'newest'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <Clock size={12} />
                    <span>En Yeniler</span>
                  </button>
                </div>
              </div>
            )}

            {activeChannel?.type === 'theories' && (
              <div className="p-3.5 bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent border-b border-purple-500/20 flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-purple-300 font-bold block">Kurgusal Gizemler & Teori Tahtası</strong>
                  <span className="text-muted text-[11px]">
                    Gelecek bölümler, karakterlerin gizli motifleri ve ipuçları üzerine tahminlerinizi paylaşın.
                  </span>
                </div>
              </div>
            )}

            {activeChannel?.type === 'chapter_discussion' && (
              <div className="p-3.5 bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border-b border-blue-500/20 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="text-xs min-w-0">
                    <strong className="text-blue-300 font-bold block">Bölüm Odaklı Tartışma Odası</strong>
                    <span className="text-muted text-[11px] truncate block">
                      {activeChannel?.description || 'Bu bölümdeki kilit sahneler, dönüm noktaları ve karakter gelişimleri.'}
                    </span>
                  </div>
                </div>
                {activeChannel?.requiredChapterIndex ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                    {activeChannel.requiredChapterIndex}. Bölüm Eşiği
                  </span>
                ) : null}
              </div>
            )}

            {/* Room Body: Spoiler Gate OR Message Stream */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {isChannelLocked ? (
                <SpoilerGate
                  requiredChapterIndex={activeChannel?.requiredChapterIndex || 0}
                  userChapterIndex={membership?.currentChapterIndex || 0}
                  storyTitle={journey?.storyTitle || club.activeBook?.title || 'Eser'}
                  storySlug={club.activeBook?.slug}
                  onBypassUnlock={() =>
                    setBypassedChannels((prev) => ({ ...prev, [activeChannel.id]: true }))
                  }
                />
              ) : (
                <>
                  {/* Messages Stream */}
                  <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-h-[500px]">
                    {sortedMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-2">
                        {activeChannel?.type === 'author_ama' ? (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1">
                              <Feather size={24} />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">Yazarımıza Henüz Soru Sorulmadı</h4>
                            <p className="text-xs text-muted max-w-xs">
                              Yazarımıza merak ettiğiniz ilk soruyu sorun veya topluluğun oylarına sunun!
                            </p>
                          </>
                        ) : activeChannel?.type === 'theories' ? (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1">
                              <Sparkles size={24} />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">Henüz Bir Teori Paylaşılmadı</h4>
                            <p className="text-xs text-muted max-w-xs">
                              Olay örgüsündeki gizemleri çöz ve ilk teoriyi sen ortaya at!
                            </p>
                          </>
                        ) : activeChannel?.type === 'chapter_discussion' ? (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
                              <BookOpen size={24} />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">Bu Bölüm Hakkında Yorum Yok</h4>
                            <p className="text-xs text-muted max-w-xs">
                              Bölümdeki çarpıcı sahneler ve kilit gelişmeler hakkında ilk düşünceni paylaş!
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                              <MessageSquare size={24} />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">Henüz Mesaj Yok</h4>
                            <p className="text-xs text-muted max-w-xs">
                              İlk mesajı yazarak kulüp üyeleriyle sohbeti başlat!
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      sortedMessages.map((msg) => {
                        const hasUpvoted = msg.upvoterIds?.includes(firebaseUser?.uid || '');
                        const isAuthorMsg = msg.isAuthorOfficial || msg.isAuthorReply;

                        return (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isAuthorMsg
                                ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                                : 'bg-muted/5 border-border/50'
                            }`}
                          >
                            {/* Replying Quote Bubble */}
                            {msg.replyToSnippet && (
                              <div className="mb-2.5 p-2 rounded-xl bg-background/60 border-l-2 border-primary/60 text-[11px] text-muted flex items-start gap-2">
                                <Reply size={12} className="shrink-0 mt-0.5 text-primary" />
                                <div className="min-w-0">
                                  <span className="font-bold text-foreground block">
                                    @{msg.replyToSenderName || 'Üye'}
                                  </span>
                                  <p className="line-clamp-1 italic text-muted">
                                    "{msg.replyToSnippet}"
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Message Header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-xs font-bold text-primary">
                                  {msg.senderAvatar ? (
                                    <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                                  ) : (
                                    msg.senderName?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-foreground">
                                    {msg.senderName}
                                  </span>
                                  {isAuthorMsg ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black shadow-xs">
                                      <Feather size={10} className="stroke-[2.5]" />
                                      <span>Yazar</span>
                                    </span>
                                  ) : msg.senderRole === 'owner' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-black">
                                      Lider
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Reply Action Button */}
                                {membership && (
                                  <button
                                    type="button"
                                    onClick={() => setReplyingToMessage(msg)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-muted/15 transition-all"
                                    title="Bu mesaja yanıt ver"
                                  >
                                    <Reply size={12} />
                                    <span>
                                      {(isAuthorOfClub || isLeader) && activeChannel?.type === 'author_ama'
                                        ? 'Yazar Olarak Yanıtla'
                                        : 'Yanıtla'}
                                    </span>
                                  </button>
                                )}

                                {/* Upvote Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleUpvote(msg.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                    hasUpvoted
                                      ? activeChannel?.type === 'author_ama'
                                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs'
                                        : 'bg-red-500/15 text-red-500 border border-red-500/30'
                                      : 'bg-muted/10 text-muted hover:text-foreground border border-border/40'
                                  }`}
                                  title="Beğen / Oy Ver"
                                >
                                  <Heart
                                    size={13}
                                    className={
                                      hasUpvoted
                                        ? activeChannel?.type === 'author_ama'
                                          ? 'fill-amber-500 text-amber-500'
                                          : 'fill-red-500 text-red-500'
                                        : ''
                                    }
                                  />
                                  <span>{msg.upvotesCount || 0}</span>
                                </button>

                                {/* Delete Message (Sender or Leader) */}
                                {(msg.senderId === firebaseUser?.uid || isLeader) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(activeChannel.id, msg.id)}
                                    className="p-1.5 rounded-xl text-muted/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                    title="Mesajı Sil"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Message Text / Spoiler blur if flagged */}
                            {msg.isSpoiler ? (
                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 flex items-center gap-2 mb-1.5">
                                <AlertTriangle size={13} />
                                <span className="font-bold">Spoiler İçerir</span>
                              </div>
                            ) : null}

                            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </p>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <div className="p-4 border-t border-border/60 bg-card/80 space-y-2">
                    {/* Replying Banner */}
                    {replyingToMessage && (
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 min-w-0">
                          <Reply size={14} className="text-primary shrink-0" />
                          <span className="text-muted truncate">
                            <strong className="text-foreground">@{replyingToMessage.senderName}</strong>{' '}
                            kişisine yanıt veriyorsunuz:{' '}
                            <span className="italic">"{replyingToMessage.text.slice(0, 50)}..."</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingToMessage(null)}
                          className="w-5 h-5 rounded-full hover:bg-muted/20 flex items-center justify-center text-muted hover:text-foreground shrink-0"
                          title="Yanıtlamayı iptal et"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {membership ? (
                      <form onSubmit={handleSendMessage} className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-muted px-1">
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground">
                            <input
                              type="checkbox"
                              checked={isSpoilerMessage}
                              onChange={(e) => setIsSpoilerMessage(e.target.checked)}
                              className="w-3.5 h-3.5 accent-amber-500 rounded"
                            />
                            <span>Mesajım spoiler içeriyor</span>
                          </label>

                          {activeChannel?.type === 'author_ama' && (
                            <span className="text-amber-500 font-semibold">
                              {replyingToMessage
                                ? '✍️ Seçilen soruya yanıt yazıyorsunuz'
                                : '💡 Yazara soru gönderiyorsunuz'}
                            </span>
                          )}
                          {activeChannel?.type === 'theories' && (
                            <span className="text-purple-400 font-semibold">
                              🔮 Teori ve tahmin alanı
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={
                              activeChannel?.type === 'author_ama'
                                ? replyingToMessage
                                  ? (isAuthorOfClub || isLeader)
                                    ? 'Yazar olarak bu soruyu yanıtlayın...'
                                    : 'Bu soruya cevabınızı yazın...'
                                  : 'Yazarımıza merak ettiğiniz soruyu iletin...'
                                : activeChannel?.type === 'theories'
                                ? 'Kurgusal teorinizi ve dayandığı ipuçlarını paylaşın...'
                                : activeChannel?.type === 'chapter_discussion'
                                ? 'Bu bölüm hakkındaki düşüncelerinizi paylaşın...'
                                : 'Bir mesaj yazın...'
                            }
                            className="flex-1 px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-xs focus:border-primary focus:outline-none transition-colors"
                          />
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSending || !messageText.trim()}
                            className="px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 active:scale-95 shrink-0"
                          >
                            <Send size={14} />
                            <span>
                              {activeChannel?.type === 'author_ama'
                                ? replyingToMessage
                                  ? 'Yanıtı Gönder'
                                  : 'Soruyu Gönder'
                                : activeChannel?.type === 'theories'
                                ? 'Teoriyi Paylaş'
                                : activeChannel?.type === 'chapter_discussion'
                                ? 'Yorum Gönder'
                                : 'Gönder'}
                            </span>
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 text-center rounded-2xl bg-muted/10 border border-border/60 flex items-center justify-between">
                        <span className="text-xs text-muted">
                          Bu kanalda tartışmaya katılmak için kulübe üye olmalısınız.
                        </span>
                        <Button
                          variant="primary"
                          onPress={handleToggleMembership}
                          className="text-xs font-bold px-4 py-2 rounded-xl"
                        >
                          Kulübe Katıl
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        )}

        {/* ── 2. MEMBERS TAB: Kulüp Üyeleri & Yetki Yönetimi ── */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Header & Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-muted font-medium block">Toplam Okur</span>
                  <strong className="text-xl font-black text-foreground">
                    {members.length || club.stats?.membersCount || 0}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Crown size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-muted font-medium block">Yönetim Ekibi</span>
                  <strong className="text-xl font-black text-foreground">
                    {members.filter((m) => m.role !== 'member').length}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-muted font-medium block">Seferi Tamamlayan</span>
                  <strong className="text-xl font-black text-foreground">
                    {members.filter((m) => m.completedActiveBook).length}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-muted font-medium block">Aktif Kitap</span>
                  <strong className="text-sm font-bold text-foreground truncate block max-w-[140px]">
                    {journey?.storyTitle || club.activeBook?.title || 'Sefer Yok'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="İsim veya kullanıcı adı ile üye ara..."
                  className="w-full bg-background border border-border/60 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:border-primary transition-all"
                />
                {memberSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMemberSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  { key: 'all', label: `Tümü (${members.length})` },
                  { key: 'owner', label: '👑 Kurucu' },
                  { key: 'admin', label: '🛡️ Yönetici' },
                  { key: 'moderator', label: '⚔️ Moderatör' },
                  { key: 'member', label: '👤 Okurlar' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMemberRoleFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      memberRoleFilter === tab.key
                        ? 'bg-foreground text-background font-bold shadow-xs'
                        : 'bg-muted/10 text-muted hover:text-foreground hover:bg-muted/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Member List */}
            {isLoadingMembers ? (
              <div className="p-16 text-center rounded-3xl bg-card border border-border/70 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={28} />
                <span className="text-xs text-muted font-medium">Kulüp üyeleri listeleniyor...</span>
              </div>
            ) : members.filter((m) => {
                const matchesSearch =
                  m.userName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                  (m.userUsername && m.userUsername.toLowerCase().includes(memberSearchQuery.toLowerCase()));
                if (!matchesSearch) return false;
                if (memberRoleFilter === 'all') return true;
                return m.role === memberRoleFilter;
              }).length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-card border border-border/70 flex flex-col items-center justify-center gap-3">
                <Users className="text-muted/50" size={36} />
                <h4 className="font-bold text-sm text-foreground">Eşleşen Üye Bulunamadı</h4>
                <p className="text-xs text-muted max-w-sm">
                  Arama kriterlerinize veya seçilen role uygun kulüp üyesi bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {members
                  .filter((m) => {
                    const matchesSearch =
                      m.userName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                      (m.userUsername && m.userUsername.toLowerCase().includes(memberSearchQuery.toLowerCase()));
                    if (!matchesSearch) return false;
                    if (memberRoleFilter === 'all') return true;
                    return m.role === memberRoleFilter;
                  })
                  .map((member) => {
                    const totalChapters = journey?.totalChapters || club.activeBook?.totalChapters || 0;
                    const currentChapters = member.currentChapterIndex || 0;
                    const progressPercent =
                      totalChapters > 0
                        ? member.completedActiveBook
                          ? 100
                          : Math.min(100, Math.round((currentChapters / totalChapters) * 100))
                        : 0;
                    const canManage = canOperatorManageMember(member);
                    const isCurrentUser = member.userId === firebaseUser?.uid;

                    return (
                      <div
                        key={member.id}
                        className="p-4 rounded-3xl bg-card border border-border/70 hover:border-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        {/* Member Profile Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-muted/20 border border-border/60 overflow-hidden flex items-center justify-center">
                              {member.userAvatar ? (
                                <img src={member.userAvatar} alt={member.userName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="font-black text-sm text-foreground/80">
                                  {member.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            {member.role === 'owner' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xs">
                                <Crown size={11} className="stroke-[2.5]" />
                              </div>
                            )}
                            {member.role === 'admin' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                                <Shield size={11} />
                              </div>
                            )}
                            {member.role === 'moderator' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-xs">
                                <Sparkles size={11} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground truncate">
                                {member.userName}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                                  Siz
                                </span>
                              )}
                              {getRoleBadge(member.role)}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                              {member.userUsername && <span>@{member.userUsername}</span>}
                              <span>•</span>
                              <span>Katıldı: {formatJoinedDate(member.joinedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Reading Progress */}
                        <div className="flex-1 max-w-xs px-2">
                          {totalChapters > 0 ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted font-medium flex items-center gap-1.5">
                                  <BookOpen size={12} />
                                  <span>Sefer İlerlemesi</span>
                                </span>
                                {member.completedActiveBook ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                    <CheckCircle2 size={13} />
                                    <span>Tamamladı 🏆</span>
                                  </span>
                                ) : (
                                  <span className="font-semibold text-foreground text-[11px]">
                                    {currentChapters} / {totalChapters} Bölüm ({progressPercent}%)
                                  </span>
                                )}
                              </div>
                              <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    member.completedActiveBook
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                      : 'bg-primary'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted italic">Aktif okuma seferi yok</span>
                          )}
                        </div>

                        {/* Right: Role Management & Moderation Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          {canManage ? (
                            <>
                              <div className="relative">
                                <select
                                  value={member.role}
                                  disabled={updatingMemberId === member.userId}
                                  onChange={(e) =>
                                    handleRoleChange(member.userId, member.userName, e.target.value as ClubMemberRole)
                                  }
                                  className="bg-background border border-border/70 hover:border-primary text-foreground text-xs font-semibold rounded-xl pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-hidden focus:border-primary transition-all disabled:opacity-50"
                                >
                                  {membership?.role === 'owner' && (
                                    <option value="admin">🛡️ Yönetici</option>
                                  )}
                                  <option value="moderator">⚔️ Moderatör</option>
                                  <option value="member">👤 Okur (Üye)</option>
                                </select>
                                <UserCog size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                              </div>

                              <button
                                type="button"
                                disabled={updatingMemberId === member.userId}
                                onClick={() => handleKickMember(member.userId, member.userName)}
                                className="p-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all disabled:opacity-50"
                                title="Kulüpten Çıkar"
                              >
                                {updatingMemberId === member.userId ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <UserMinus size={15} />
                                )}
                              </button>

                              {membership?.role === 'owner' && (
                                <button
                                  type="button"
                                  disabled={updatingMemberId === member.userId}
                                  onClick={() => handleTransferOwnership(member.userId, member.userName)}
                                  className="p-2 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 active:scale-95 transition-all disabled:opacity-50"
                                  title="Kulüp Liderliğini Bu Üyeye Devret"
                                >
                                  <Crown size={15} />
                                </button>
                              )}
                            </>
                          ) : member.role === 'owner' ? (
                            <span className="text-xs font-semibold text-amber-500/90 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <Crown size={13} />
                              <span>Kulüp Lideri</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── 3. ARCHIVE TAB: Sefer Arşivi & Tamamlanan Kitaplar ── */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <span>Kulüp Sefer Arşivi & Tamamlanan Kitaplar</span>
                </h3>
                <p className="text-xs text-muted mt-1">
                  Kulübün geçmişte başarıyla tamamladığı okuma seferleri, katılımcı istatistikleri ve kazanılan başarılar.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  🏆 Toplam {archives.length} Sefer Arşivlendi
                </span>
              </div>
            </div>

            {isLoadingArchives ? (
              <div className="p-16 text-center rounded-3xl bg-card border border-border/70 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={28} />
                <span className="text-xs text-muted font-medium">Arşiv yükleniyor...</span>
              </div>
            ) : archives.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-card border border-border/70 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-muted/20 text-muted flex items-center justify-center">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-foreground">Henüz Tamamlanmış Bir Sefer Bulunmuyor</h4>
                  <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                    Kulüp bir kitabı ve Living Journey seferini başarıyla bitirdiğinde, o kitaba ait okuma istatistikleri ve okuyucu rozetleri buradaki şeref arşivine kalıcı olarak kaydedilir.
                  </p>
                </div>
                {journey && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    <Sparkles size={14} />
                    <span>Aktif Sefer Devam Ediyor: {journey.storyTitle}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {archives.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl bg-card border border-border/70 overflow-hidden shadow-sm hover:border-primary/50 transition-all flex flex-col"
                  >
                    <div className="relative h-44 w-full bg-muted/20">
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-muted">
                          Kapak Yok
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1 border border-amber-500/30">
                        <span>⭐</span>
                        <span>{item.averageRating || '5.0'}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-black text-base text-foreground truncate">{item.title}</h4>
                        <p className="text-xs text-muted mt-0.5">Yazar: {item.authorName}</p>
                        {item.summaryNotes && (
                          <p className="text-xs text-muted mt-2 line-clamp-2 italic">
                            "{item.summaryNotes}"
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted">
                        <span className="flex items-center gap-1 font-medium">
                          <Users size={13} />
                          <span>{item.totalParticipants} Okur</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>{formatJoinedDate(item.completedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Start Living Journey Modal ── */}
      <StartJourneyModal
        club={club}
        isOpen={isStartJourneyOpen}
        onClose={() => setIsStartJourneyOpen(false)}
        onSuccess={fetchClubData}
      />

      {/* ── Create Channel Modal ── */}
      <CreateChannelModal
        clubId={club.id}
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        maxChapterCount={journey?.totalChapters || club.activeBook?.totalChapters || 100}
        onSuccess={(newChannel) => {
          setChannels((prev) => [...prev, newChannel]);
          setActiveChannelId(newChannel.id);
        }}
      />

      {/* ── Admin Delete Club Modal ── */}
      {Boolean(userProfile?.isAdmin) && (
        <AdminDeleteClubModal
          isOpen={isAdminDeleteOpen}
          onClose={() => setIsAdminDeleteOpen(false)}
          clubId={club.id}
          clubName={club.name}
          creatorName={club.creatorName}
          membersCount={club.stats?.membersCount || 1}
          adminId={firebaseUser?.uid || ''}
          adminName={userProfile?.displayName || userProfile?.username || 'Admin'}
          onSuccess={() => {
            router.push('/clubs');
          }}
        />
      )}

      {/* ── Author / Founder Delete Club Modal ── */}
      {isCreator && (
        <DeleteClubModal
          isOpen={isDeleteClubOpen}
          onClose={() => setIsDeleteClubOpen(false)}
          clubId={club.id}
          clubName={club.name}
          userId={firebaseUser?.uid || ''}
          onSuccess={() => {
            router.push('/clubs');
          }}
        />
      )}

      {/* ── Archive Journey Modal ── */}
      {isArchiveJourneyOpen && (
        <ArchiveJourneyModal
          isOpen={isArchiveJourneyOpen}
          onClose={() => setIsArchiveJourneyOpen(false)}
          clubId={club.id}
          userId={firebaseUser?.uid || ''}
          journey={journey}
          activeBook={club.activeBook}
          participantsCount={club.stats?.membersCount || 1}
          onSuccess={() => {
            fetchClubData();
            fetchArchives();
            setActiveTab('archive');
          }}
        />
      )}

      {/* ── Edit Club Modal ── */}
      {isCreator && isEditClubOpen && (
        <EditClubModal
          isOpen={isEditClubOpen}
          onClose={() => setIsEditClubOpen(false)}
          club={club}
          userId={firebaseUser?.uid || ''}
          onSuccess={(updatedClub) => {
            setClub((prev) => (prev ? { ...prev, ...updatedClub } : null));
          }}
        />
      )}
    </div>
  );
}
