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
  useAuthStore,
  type Club,
  type ClubMember,
  type ClubChannel,
  type ClubJourney,
  type ClubMessage,
} from '@readixon/core';
import { toast } from 'sonner';
import { LivingJourneyBar } from '@/components/clubs/LivingJourneyBar';
import { SpoilerGate } from '@/components/clubs/SpoilerGate';
import { StartJourneyModal } from '@/components/clubs/StartJourneyModal';

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
  const [activeTab, setActiveTab] = useState<'discussions' | 'members' | 'archive'>('discussions');

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
      });

      setMessageText('');
      setIsSpoilerMessage(false);
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

  if (isLoading || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center space-y-3">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const isLeader = membership?.role === 'owner' || membership?.role === 'admin' || membership?.role === 'moderator';

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
          <div className="shrink-0 flex items-center gap-3">
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
        />

        {/* Discord/Slack Style Dual-Pane Community Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── LEFT PANE: Channels & Rooms (4 Cols) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-card border border-border/70 p-4 shadow-sm space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Tartışma Odaları
              </span>
              <span className="text-[11px] text-muted font-medium">
                {channels.length} Oda
              </span>
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
            <div className="p-4 md:p-5 border-b border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {isChannelLocked ? (
                    <Lock size={18} className="text-amber-500" />
                  ) : activeChannel?.type === 'author_ama' ? (
                    <Feather size={18} className="text-amber-500" />
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
                  </div>
                  <p className="text-[11px] text-muted truncate">
                    {activeChannel?.description || 'Tartışma ve fikir paylaşımı alanı.'}
                  </p>
                </div>
              </div>

              {activeChannel?.requiredChapterIndex ? (
                <span className="text-[11px] px-2.5 py-1 rounded-xl bg-muted/15 text-muted font-semibold shrink-0">
                  🔒 {activeChannel.requiredChapterIndex}. Bölüm Eşiği
                </span>
              ) : null}
            </div>

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
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-2">
                        <MessageSquare size={32} className="text-muted/40" />
                        <h4 className="font-bold text-sm text-foreground">Henüz Mesaj Yok</h4>
                        <p className="text-xs text-muted max-w-xs">
                          İlk soruyu sen sor veya düşüncelerini paylaşarak tartışmayı başlat!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const hasUpvoted = msg.upvoterIds?.includes(firebaseUser?.uid || '');
                        return (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              msg.isAuthorOfficial || msg.isAuthorReply
                                ? 'bg-amber-500/5 border-amber-500/30'
                                : 'bg-muted/5 border-border/50'
                            }`}
                          >
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
                                  {msg.isAuthorOfficial || msg.isAuthorReply ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-black">
                                      Yazar
                                    </span>
                                  ) : msg.senderRole === 'owner' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-black">
                                      Lider
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              {/* Upvote Button (Particularly prominent in AMA) */}
                              <button
                                type="button"
                                onClick={() => handleToggleUpvote(msg.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                  hasUpvoted
                                    ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                                    : 'bg-muted/10 text-muted hover:text-foreground border border-border/40'
                                }`}
                              >
                                <Heart size={13} className={hasUpvoted ? 'fill-red-500 text-red-500' : ''} />
                                <span>{msg.upvotesCount || 0}</span>
                              </button>
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
                  <div className="p-4 border-t border-border/60 bg-card/80">
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
                              💡 Yazara soru gönderiyorsunuz
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
                                ? 'Yazarımıza merak ettiğin soruyu ilet...'
                                : 'Düşüncelerini veya teorilerini paylaş...'
                            }
                            className="flex-1 px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-xs focus:border-primary focus:outline-none transition-colors"
                          />
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSending || !messageText.trim()}
                            className="px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 active:scale-95"
                          >
                            <Send size={14} />
                            <span>Gönder</span>
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
      </div>

      {/* ── Start Living Journey Modal ── */}
      <StartJourneyModal
        clubId={club.id}
        isOpen={isStartJourneyOpen}
        onClose={() => setIsStartJourneyOpen(false)}
        onSuccess={fetchClubData}
      />
    </div>
  );
}
