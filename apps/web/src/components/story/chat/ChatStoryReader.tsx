'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Sparkles, 
  Check, 
  CheckCheck, 
  Layers, 
  X, 
  Send, 
  Maximize2, 
  Zap, 
  FastForward,
  Award,
  BookOpen,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import type { 
  Story, 
  Chapter, 
  ChatStoryCharacter, 
  ChatStoryMessage,
  Comment
} from '@readixon/core';
import { 
  generateStorySlug, 
  toggleChapterLike, 
  getAllChapterComments, 
  addChapterComment,
  syncReadingProgress,
  useAuthStore
} from '@readixon/core';
import { useBackButton } from '@/hooks/useBackButton';

interface ChatStoryReaderProps {
  story: Story;
  chapter: Chapter;
  allChapters?: Chapter[];
  onNavigateChapter?: (chapterId: string) => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  commentsCount?: number;
}

// Mesaj Hikayesi Otomatik Oynatma Hızları
export const PLAY_SPEEDS = [
  { value: 0.25, label: '0.25x', title: 'Çok Yavaş', desc: 'Derin okuma & detaylı inceleme' },
  { value: 0.5, label: '0.50x', title: 'Yavaş', desc: 'Rahat ve sindirerek okuma' },
  { value: 0.75, label: '0.75x', title: 'Sakin', desc: 'Huzurlu ve telaşsız tempo' },
  { value: 1, label: '1x', title: 'Normal', desc: 'Standart sohbet akış hızı' },
  { value: 1.5, label: '1.5x', title: 'Hızlı', desc: 'Seri ve tempolu akış' },
  { value: 2, label: '2x', title: 'Çok Hızlı', desc: 'Maksimum hızda hızlıca geçiş' },
] as const;

// Mobil dokunmatik titreşim (Haptic Feedback) tetikleyici
const triggerHaptic = (duration = 8) => {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    // Cihaz desteklemiyorsa sessizce geç
  }
};

// Web Audio API ile pıt / mesaj sesi sentezleyici
const playPopSound = (isSystem = false) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isSystem) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch {
    // Ses sentezi desteklenmiyorsa sessizce geç
  }
};

const DEFAULT_CHARACTERS: ChatStoryCharacter[] = [
  { id: 'c1', name: 'Ben', isSelf: true, color: '#10b981' },
  { id: 'c2', name: 'Gizemli Kişi', isSelf: false, color: '#6366f1' }
];

export const ChatStoryReader: React.FC<ChatStoryReaderProps> = ({
  story,
  chapter,
  allChapters = [],
  onNavigateChapter,
  isLiked: initialIsLiked = false,
  onToggleLike,
  commentsCount: initialCommentsCount = 0
}) => {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();

  const characters: ChatStoryCharacter[] = 
    story.chatCharacters && story.chatCharacters.length > 0 
      ? story.chatCharacters 
      : DEFAULT_CHARACTERS;

  const messages: ChatStoryMessage[] = chapter.chatMessages || [];
  
  // Dokunarak Açığa Çıkarılan Mesaj Sayısı (En az 1 mesajla başlar, eğer mesaj varsa)
  const [revealedCount, setRevealedCount] = useState<number>(messages.length > 0 ? 1 : 0);

  // Otomatik Oynatma & Hız (0.25x - 2x)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // Varsayılan 1x
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [speedToast, setSpeedToast] = useState<{ label: string; title: string } | null>(null);
  const speedToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSpeedObj = useMemo(() => {
    return PLAY_SPEEDS.find(s => s.value === playSpeed) || PLAY_SPEEDS[3];
  }, [playSpeed]);

  const currentSpeedLabel = currentSpeedObj.label;

  const handleSpeedSelect = useCallback((item: (typeof PLAY_SPEEDS)[number]) => {
    setPlaySpeed(item.value);
    setIsSpeedMenuOpen(false);
    triggerHaptic(10);
    setSpeedToast({ label: item.label, title: item.title });
    if (speedToastTimerRef.current) clearTimeout(speedToastTimerRef.current);
    speedToastTimerRef.current = setTimeout(() => {
      setSpeedToast(null);
    }, 1300);
  }, []);

  useEffect(() => {
    return () => {
      if (speedToastTimerRef.current) clearTimeout(speedToastTimerRef.current);
    };
  }, []);

  // Ses Durumu
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Görsel Lightbox Modalı
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Bölüm İçi Yorumlar Çekmecesi
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likes, setLikes] = useState(chapter.stats?.likes || 0);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  // Bölüm Listesi Çekmecesi
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Mobil Android / Capacitor Geri Tuşu Davranışları (LIFO) ──
  // 1. Görsel Lightbox açıkken geri tuşu sadece Lightbox'ı kapatsın
  useBackButton(() => {
    setLightboxImage(null);
    return true;
  }, lightboxImage !== null);

  // 2. Hız menüsü açıkken geri tuşu menüyü kapatsın
  useBackButton(() => {
    setIsSpeedMenuOpen(false);
    return true;
  }, isSpeedMenuOpen);

  // 3. Yorumlar açıkken geri tuşu sadece yorumları kapatsın
  useBackButton(() => {
    setIsCommentsOpen(false);
    return true;
  }, isCommentsOpen);

  // 4. Bölümler çekmecesi açıkken geri tuşu sadece bölümleri kapatsın
  useBackButton(() => {
    setIsChapterDrawerOpen(false);
    return true;
  }, isChapterDrawerOpen);

  // 5. Hiçbir modal açık değilken ve otomatik oynatma aktifken geri tuşu önce oynatmayı durdursun
  useBackButton(() => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return true;
    }
    // Geri tuşu hikaye detayına dönsün (uygulamadan çıkmasın)
    const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
    router.push(`/story/${slug}`);
    return true;
  }, !isCommentsOpen && !isChapterDrawerOpen && !isSpeedMenuOpen && lightboxImage === null);

  // Karakter Eşleştirme Yardımcıları
  const getCharacter = useCallback((id?: string) => {
    return characters.find(c => c.id === id) || {
      id: id || 'unknown',
      name: 'Bilinmeyen',
      isSelf: false,
      color: '#64748b'
    };
  }, [characters]);

  // Bu bölümdeki aktif konuşmacılar (Sistem mesajları hariç)
  const activeSenderIds = useMemo(() => {
    const ids = new Set<string>();
    messages.forEach(m => {
      if (m.type !== 'system' && m.senderId) ids.add(m.senderId);
    });
    return ids;
  }, [messages]);

  // Karşı taraftaki (non-self) aktif konuşmacılar
  const activePartners = useMemo(() => {
    const list = characters.filter(c => !c.isSelf && activeSenderIds.has(c.id));
    if (list.length > 0) return list;
    // Eğer bu bölümde henüz mesaj yoksa hikayedeki diğer konuşmacılara bak
    const allNonSelf = characters.filter(c => !c.isSelf);
    return allNonSelf;
  }, [characters, activeSenderIds]);

  const isGroupChat = activePartners.length > 1;
  const singlePartner = activePartners[0] || characters.find(c => !c.isSelf) || characters[0];

  // Gelecek mesaj konuşmacısı (typing animasyonu için)
  const nextMessage = messages[revealedCount];
  const nextSenderChar = nextMessage && nextMessage.type !== 'system' && nextMessage.senderId 
    ? getCharacter(nextMessage.senderId) 
    : null;
  const isNextMessageFromPartner = Boolean(nextSenderChar && !nextSenderChar.isSelf);

  // Yeni mesaj açığa çıktığında yumuşak kaydır
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [revealedCount]);

  // Bölüm değiştiğinde state'i sıfırla
  useEffect(() => {
    setRevealedCount(messages.length > 0 ? 1 : 0);
    setIsAutoPlaying(false);
    setIsLiked(initialIsLiked);
    setLikes(chapter.stats?.likes || 0);
  }, [chapter.chapterId, messages.length]);

  // Son mesaja ulaşıldığında okuma ilerlemesini kaydet
  useEffect(() => {
    if (messages.length > 0 && revealedCount >= messages.length && firebaseUser) {
      syncReadingProgress(firebaseUser.uid, story.storyId, chapter.chapterId, 100, true);
      triggerHaptic(20);
    }
  }, [revealedCount, messages.length, firebaseUser, story.storyId, chapter.chapterId]);

  // Dokunarak sonraki mesajı açığa çıkarma
  const handleRevealNext = useCallback(() => {
    if (revealedCount < messages.length) {
      const nextIdx = revealedCount;
      const nextMsg = messages[nextIdx];
      setRevealedCount(prev => prev + 1);

      if (soundEnabled) {
        playPopSound(nextMsg?.type === 'system');
      }
      triggerHaptic(nextMsg?.type === 'system' ? 14 : 8);
    } else {
      // Tüm mesajlar bittiğinde autoplay'i durdur
      setIsAutoPlaying(false);
    }
  }, [revealedCount, messages, soundEnabled]);

  // Otomatik Oynatma Zamanlayıcısı
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      return;
    }

    if (revealedCount >= messages.length) {
      setIsAutoPlaying(false);
      return;
    }

    // Mesaj uzunluğuna göre dinamik bekleme süresi (Hızlı tempolu, akıcı)
    const currentMsg = messages[revealedCount];
    const baseDuration = currentMsg?.type === 'image' ? 2400 : Math.max(1200, ((currentMsg?.text?.length || 10) * 45));
    const delay = Math.round(baseDuration / playSpeed);

    autoPlayTimerRef.current = setTimeout(() => {
      handleRevealNext();
    }, delay);

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, revealedCount, messages, playSpeed, handleRevealNext]);

  // Klavye Kontrolleri (Spacebar, Sağ/Aşağı Ok, P, M, -/+, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Escape') {
        if (isSpeedMenuOpen) {
          setIsSpeedMenuOpen(false);
          return;
        }
        if (lightboxImage) {
          setLightboxImage(null);
          return;
        }
        if (isCommentsOpen) {
          setIsCommentsOpen(false);
          return;
        }
        if (isChapterDrawerOpen) {
          setIsChapterDrawerOpen(false);
          return;
        }
      }

      if (e.code === 'Space' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleRevealNext();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsAutoPlaying(prev => !prev);
        triggerHaptic(10);
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled(prev => !prev);
        triggerHaptic(8);
      } else if (e.key === '+' || e.key === '=' || e.key === ']' || e.key === '>') {
        e.preventDefault();
        const currentIdx = PLAY_SPEEDS.findIndex(s => s.value === playSpeed);
        if (currentIdx < PLAY_SPEEDS.length - 1) {
          handleSpeedSelect(PLAY_SPEEDS[currentIdx + 1]);
        }
      } else if (e.key === '-' || e.key === '_' || e.key === '[' || e.key === '<') {
        e.preventDefault();
        const currentIdx = PLAY_SPEEDS.findIndex(s => s.value === playSpeed);
        if (currentIdx > 0) {
          handleSpeedSelect(PLAY_SPEEDS[currentIdx - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRevealNext, lightboxImage, isCommentsOpen, isChapterDrawerOpen, isSpeedMenuOpen, playSpeed, handleSpeedSelect]);

  // Yorumları Yükleme
  const handleOpenComments = async () => {
    setIsCommentsOpen(true);
    triggerHaptic(10);
    try {
      const fetched = await getAllChapterComments(story.storyId, chapter.chapterId);
      setComments(fetched || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !firebaseUser) {
      if (!firebaseUser) toast.error('Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await addChapterComment(
        story.storyId, 
        chapter.chapterId, 
        firebaseUser.uid, 
        commentText.trim()
      );
      setCommentText('');
      const fetched = await getAllChapterComments(story.storyId, chapter.chapterId);
      setComments(fetched || []);
      toast.success('Yorumunuz paylaşıldı.');
      triggerHaptic(15);
    } catch {
      toast.error('Yorum gönderilemedi.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    triggerHaptic(15);
    if (onToggleLike) {
      onToggleLike();
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
      return;
    }

    if (!firebaseUser) {
      toast.error('Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      const newStatus = await toggleChapterLike(story.storyId, chapter.chapterId, firebaseUser.uid);
      setIsLiked(newStatus);
      setLikes(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
    } catch {
      toast.error('Beğeni işlemi başarısız oldu.');
    }
  };

  // Sonraki / Önceki Bölüm Bulma
  const currentChapterIndex = allChapters.findIndex(c => c.chapterId === chapter.chapterId);
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  const isCompleted = messages.length > 0 && revealedCount >= messages.length;
  const progressPercent = messages.length > 0 ? Math.round((revealedCount / messages.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1317] text-zinc-100 flex flex-col overflow-hidden select-none touch-manipulation">
      {/* ── ARKA PLAN IŞILTISI / ATMOSFER ── */}
      <div className="absolute inset-0 bg-radial from-emerald-950/20 via-[#0c1317] to-[#080d10] pointer-events-none" />

      {/* ── ÜST BAR: KULLANICI / SOHBET BAŞLIĞI & AYARLAR (SAFE-AREA UYUMLU) ── */}
      <header className="relative z-30 pt-[calc(0.65rem+env(safe-area-inset-top,0px))] pb-2.5 px-3 sm:px-6 bg-[#162127]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 shadow-lg min-h-[60px]">
        {/* Sol: Geri Dön Butonu & Partner Profil Bilgisi */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
              router.push(`/story/${slug}`);
            }}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90 shrink-0"
            title="Kitap Detayına Dön"
            aria-label="Geri Dön"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Partner / Grup Avatarı & Bilgisi */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 min-w-0 cursor-pointer active:opacity-80" 
            onClick={() => {
              setIsChapterDrawerOpen(true);
              triggerHaptic(8);
            }}
          >
            <div className="relative shrink-0">
              {isGroupChat ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shadow-sm">
                  <Users size={18} />
                </div>
              ) : singlePartner?.avatarUrl ? (
                <img
                  src={singlePartner.avatarUrl}
                  alt={singlePartner.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-500/50 shadow-sm"
                />
              ) : (
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-sm border border-white/15"
                  style={{ backgroundColor: singlePartner?.color || '#10b981' }}
                >
                  {singlePartner?.name?.slice(0, 1).toUpperCase() || 'S'}
                </div>
              )}
              {/* Online / Canlı Gösterge */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-[#162127]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-base font-extrabold text-white truncate max-w-[110px] xs:max-w-[140px] sm:max-w-xs leading-tight">
                  {isGroupChat ? (chapter.title || story.title) : (singlePartner?.name || story.title)}
                </h2>
                {isGroupChat && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {activePartners.length} Kişi
                  </span>
                )}
                {!isGroupChat && chapter.title && (
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 truncate max-w-[120px]">
                    {chapter.title}
                  </span>
                )}
              </div>
              
              {/* Durum: "yazıyor..." veya "çevrimiçi / katılımcılar" */}
              <p className="text-[10px] sm:text-xs truncate transition-all leading-tight">
                {isNextMessageFromPartner && !isCompleted ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>{isGroupChat ? `${nextSenderChar?.name} yazıyor` : 'yazıyor'}</span>
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </span>
                ) : isGroupChat ? (
                  <span className="text-zinc-400 truncate block">
                    {activePartners.map(p => p.name).join(', ')}
                  </span>
                ) : (
                  <span className="text-zinc-400">çevrimiçi • {story.title}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Sağ: Ergonomik Kontroller (Birleşik Oynatıcı Kapsülü, Ses, Bölümler, Yorumlar) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* ── Birleşik Otomatik Oynat & Hız Kapsülü (Responsive UX Pill) ── */}
          <div className="relative">
            <div className={`flex items-center rounded-full p-0.5 border transition-all duration-200 ${
              isAutoPlaying
                ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-white/10 border-white/15 hover:border-white/25'
            }`}>
              {/* Oynat / Durdur Butonu */}
              <button
                type="button"
                onClick={() => {
                  setIsAutoPlaying(prev => !prev);
                  triggerHaptic(10);
                }}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isAutoPlaying
                    ? 'bg-emerald-500 text-black shadow-xs font-black'
                    : 'text-zinc-200 hover:text-white hover:bg-white/10'
                }`}
                title={isAutoPlaying ? 'Otomatik Oynatmayı Durdur (Kısayol: P)' : 'Otomatik Oynat (Kısayol: P)'}
                aria-label="Otomatik Oynat"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause size={13} className="fill-current animate-pulse" />
                    <span className="hidden xs:inline text-[11px] font-black">Durdur</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current text-emerald-400" />
                    <span className="hidden xs:inline text-[11px] font-extrabold">Otomatik</span>
                  </>
                )}
              </button>

              {/* Ayrıcı Çizgi */}
              <div className={`w-[1px] h-3.5 mx-0.5 ${isAutoPlaying ? 'bg-emerald-500/30' : 'bg-white/15'}`} />

              {/* Hız Seçici & Menü Açıcı Buton */}
              <button
                type="button"
                onClick={() => {
                  setIsSpeedMenuOpen(prev => !prev);
                  triggerHaptic(8);
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95 ${
                  isSpeedMenuOpen
                    ? 'bg-emerald-400 text-black shadow-xs'
                    : isAutoPlaying
                    ? 'text-emerald-300 hover:bg-emerald-500/20'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                title={`Oynatma Hızı: ${currentSpeedLabel} (Tıkla veya [-] / [+] tuşları)`}
                aria-label="Oynatma Hızı"
              >
                <span>{currentSpeedLabel}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${isSpeedMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* ── MASAÜSTÜ & TABLET POPOVER MENÜSÜ (sm ve üzerinde açılır) ── */}
            {isSpeedMenuOpen && (
              <div className="hidden sm:block">
                {/* Arka plan tıklama yakalayıcı */}
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsSpeedMenuOpen(false)}
                />

                {/* Lüks Açılır Hız Menüsü */}
                <div className="absolute top-full right-0 mt-2 z-50 bg-zinc-950/95 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl min-w-[270px] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Zap size={12} className="text-emerald-400" />
                      <span>Oynatma Hızı</span>
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded">
                      Kısayollar: [ - ] [ + ]
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {PLAY_SPEEDS.map(speedItem => {
                      const isSelected = playSpeed === speedItem.value;
                      return (
                        <button
                          key={speedItem.value}
                          type="button"
                          onClick={() => handleSpeedSelect(speedItem)}
                          className={`px-3 py-2 rounded-xl text-left transition-all flex flex-col cursor-pointer border ${
                            isSelected
                              ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm font-black'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">{speedItem.label}</span>
                            {isSelected && <Check size={12} className="stroke-[3]" />}
                          </div>
                          <span className={`text-[10px] font-semibold leading-tight mt-0.5 ${isSelected ? 'text-black/85' : 'text-zinc-400'}`}>
                            {speedItem.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ses Aç / Kapat */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(prev => !prev);
              triggerHaptic(8);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            aria-label="Ses Kontrolü"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-zinc-500" />}
          </button>

          {/* Bölümler Butonu */}
          {allChapters.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setIsChapterDrawerOpen(true);
                triggerHaptic(8);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90"
              title="Bölümler"
              aria-label="Bölüm Listesi"
            >
              <Layers size={15} />
            </button>
          )}

          {/* Yorumlar Butonu */}
          <button
            type="button"
            onClick={handleOpenComments}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90"
            title="Yorumlar"
            aria-label="Yorumları Gör"
          >
            <MessageSquare size={15} />
            {(initialCommentsCount > 0 || comments.length > 0) && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center shadow-xs">
                {comments.length > 0 ? comments.length : initialCommentsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── İNCE İLERLEME ÇUBUĞU (Progress Bar) ── */}
      <div className="relative z-30 h-1 bg-white/10 w-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── ANA SOHBET AKIŞI ALANI (TAP TO REVEAL CANVAS) ── */}
      <main
        ref={chatContainerRef}
        onClick={handleRevealNext}
        className="relative flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8 flex flex-col justify-start items-center cursor-pointer select-none pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]"
        style={{
          touchAction: 'manipulation',
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 60%)`
        }}
      >
        <div className="w-full max-w-xl flex flex-col gap-3">
          {/* Sohbet Başlangıç Rozeti */}
          <div className="flex flex-col items-center justify-center my-2.5 text-center">
            <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider shadow-sm">
              🔒 Uçtan Uca Şifreli Mesaj Hikayesi
            </span>
            <span className="text-[11px] sm:text-xs text-zinc-500 mt-1">
              Devam etmek için ekrana dokunun
            </span>
          </div>

          {/* AÇIĞA ÇIKARILAN MESAJLAR */}
          {messages.slice(0, revealedCount).map((msg) => {
            // Sistem Olayı / Zaman Ayracı
            if (msg.type === 'system') {
              return (
                <div
                  key={msg.id}
                  className="flex items-center justify-center my-2.5 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs text-zinc-300 font-medium text-center shadow-sm max-w-md">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const sender = getCharacter(msg.senderId);
            const isSelf = sender.isSelf;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-1.5 sm:gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  isSelf ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Sol Profil Avatarı (Yalnızca diğer kişiler için) */}
                {!isSelf && (
                  <div className="shrink-0 mb-1">
                    {sender.avatarUrl ? (
                      <img
                        src={sender.avatarUrl}
                        alt={sender.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white/15 shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: sender.color || '#6366f1' }}
                      >
                        {sender.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* Mesaj Baloncuğu */}
                {msg.type === 'image' && msg.mediaUrl ? (
                  <div
                    className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl overflow-hidden shadow-lg group cursor-pointer select-none transition-all ${
                      isSelf ? 'rounded-br-xs' : 'rounded-bl-xs'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(msg.mediaUrl || null);
                      triggerHaptic(10);
                    }}
                    title="Büyük görmek için dokunun"
                  >
                    {/* Grup Konuşmasında Gönderen İsmi */}
                    {!isSelf && characters.filter(c => !c.isSelf).length > 1 && (
                      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none">
                        <p
                          className="text-[10px] sm:text-[11px] font-extrabold"
                          style={{ color: sender.color || '#38bdf8' }}
                        >
                          {sender.name}
                        </p>
                      </div>
                    )}

                    {/* Fotoğraf (Çerçevesiz, Doğal WhatsApp/Telegram Görünümü) */}
                    <img
                      src={msg.mediaUrl}
                      alt="Sohbet Fotoğrafı"
                      className="w-full max-h-80 sm:max-h-96 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />

                    {/* Büyütme İpucu Hover Efekti */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-2.5 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md">
                        <Maximize2 size={18} />
                      </span>
                    </div>

                    {/* Saat & Okundu Bilgisi (Görsel üstü şık yarı saydam rozet) */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-mono flex items-center gap-1 shadow-sm select-none z-10">
                      <span>{msg.time || '12:00'}</span>
                      {isSelf && <CheckCheck size={11} className="text-sky-300 inline" />}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`relative max-w-[85%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl shadow-md text-xs sm:text-sm transition-all ${
                      isSelf
                        ? 'bg-[#005c4b] text-white rounded-br-xs border border-emerald-500/20'
                        : 'bg-[#202c33] text-zinc-100 rounded-bl-xs border border-white/10'
                    }`}
                  >
                    {/* Grup Konuşmasında Gönderen İsmi */}
                    {!isSelf && characters.filter(c => !c.isSelf).length > 1 && (
                      <p
                        className="text-[10px] sm:text-[11px] font-extrabold mb-1"
                        style={{ color: sender.color || '#38bdf8' }}
                      >
                        {sender.name}
                      </p>
                    )}

                    {/* Metin İçeriği */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-normal break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* Saat & Okundu Bilgisi */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isSelf ? 'text-emerald-200/70' : 'text-zinc-400'
                      }`}
                    >
                      <span>{msg.time || '12:00'}</span>
                      {isSelf && <CheckCheck size={12} className="text-sky-400 ml-0.5" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── CANLI "YAZIYOR..." BALONCUĞU ── */}
          {/* Bir sonraki mesaj karşı taraftan geliyorsa ve henüz tıklanmadıysa gerçekçi yazma efekti */}
          {!isCompleted && isNextMessageFromPartner && nextSenderChar && (
            <div className="flex items-end gap-1.5 sm:gap-2 w-full justify-start animate-in fade-in duration-200">
              <div className="shrink-0 mb-1">
                {nextSenderChar.avatarUrl ? (
                  <img
                    src={nextSenderChar.avatarUrl}
                    alt={nextSenderChar.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white/15"
                  />
                ) : (
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: nextSenderChar.color || '#6366f1' }}
                  >
                    {nextSenderChar.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-xs bg-[#202c33] border border-white/10 shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* ── BÖLÜMÜ BİTİRME / SON KARTI ── */}
          {isCompleted && (
            <div 
              className="mt-8 p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-[#162127] via-[#1a262d] to-[#121c22] border border-emerald-500/30 shadow-2xl text-center animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <Sparkles size={24} className="sm:w-7 sm:h-7" />
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Sohbet Tamamlandı
              </span>

              <h3 className="text-lg sm:text-2xl font-black text-white mt-3 mb-1">
                {chapter.title || 'Bölümün Sonu'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-5 sm:mb-6 leading-relaxed">
                Tüm mesajları okudunuz ({messages.length} mesaj). Yazarımıza destek olmak için bölümü beğenebilirsiniz.
              </p>

              {/* Beğen Butonu */}
              <div className="flex justify-center mb-5 sm:mb-6">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-lg active:scale-95 ${
                    isLiked
                      ? 'bg-rose-500 text-white shadow-rose-500/30'
                      : 'bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/15'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span>{likes} Beğeni</span>
                </button>
              </div>

              {/* Navigasyon Aksiyonları */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                {nextChapter ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      if (onNavigateChapter) {
                        onNavigateChapter(nextChapter.chapterId);
                      } else {
                        router.push(`/read/${story.storyId}/${nextChapter.chapterId}`);
                      }
                    }}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Sonraki Sohbet ({nextChapter.title})</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                      router.push(`/story/${slug}`);
                    }}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <Award size={18} />
                    <span>Hikayeyi Tamamladın! Değerlendir</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setRevealedCount(1);
                    setIsAutoPlaying(false);
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Sohbeti Baştan Oku"
                >
                  <RotateCcw size={14} />
                  <span>Baştan Oku</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── YÜZEN "DOKUN VE İLERLE" İPUCU (BOTTOM TAP HINT - SAFE AREA UYUMLU) ── */}
        {!isCompleted && !isAutoPlaying && (
          <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/90 text-black text-xs font-black shadow-lg shadow-emerald-500/30 backdrop-blur-md">
              <Zap size={14} className="fill-current" />
              <span>Dokun ve İlerle ({revealedCount}/{messages.length})</span>
            </div>
          </div>
        )}

        {/* ── OTOMATİK OYNATMA AKTİFKEN ALT DURUM BİLGİSİ (SAFE AREA UYUMLU) ── */}
        {isAutoPlaying && !isCompleted && (
          <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[11px] font-bold shadow-lg shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Otomatik Oynatılıyor ({currentSpeedLabel} • {currentSpeedObj.title})</span>
            </div>
          </div>
        )}
      </main>

      {/* ── EKRAN ÜSTÜ HIZ BİLGİLENDİRME HUD ROZETİ (SPEED TOAST) ── */}
      {speedToast && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-150">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-extrabold">{speedToast.label}</span>
            <span className="text-zinc-500">•</span>
            <span>{speedToast.title}</span>
          </div>
        </div>
      )}

      {/* ── MOBİL HIZ SEÇİMİ ALT ÇEKMECESİ (BOTTOM SHEET - sm altında açılır) ── */}
      {isSpeedMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Karartma arka planı */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsSpeedMenuOpen(false)}
          />

          {/* Alt Çekmece */}
          <div 
            className="relative w-full bg-zinc-950/95 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] px-5 z-10 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tutamaç */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

            {/* Başlık & Kapat */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Zap size={16} className="text-emerald-400" />
                  <span>Otomatik Oynatma Hızı</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Mesaj akış temposunu okuma alışkanlığınıza göre seçin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSpeedMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90 shrink-0 ml-2"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {/* 6 Hız Seçeneği Listesi (Rahat dokunma kartları) */}
            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto py-1">
              {PLAY_SPEEDS.map(speedItem => {
                const isSelected = playSpeed === speedItem.value;
                return (
                  <button
                    key={speedItem.value}
                    type="button"
                    onClick={() => handleSpeedSelect(speedItem)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-14 py-1.5 rounded-xl text-center text-xs font-black shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white/10 text-zinc-200'
                      }`}>
                        {speedItem.label}
                      </span>
                      <div className="text-left">
                        <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {speedItem.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                          {speedItem.desc}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
                        <Check size={14} className="stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜMLER LİSTESİ ÇEKMECESİ (DRAWER - SAFE AREA UYUMLU) ── */}
      {isChapterDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsChapterDrawerOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-[#162127] border-l border-white/10 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] px-4 sm:px-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Bölümler</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChapterDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all cursor-pointer"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {allChapters.map((chap, idx) => {
                const isActive = chap.chapterId === chapter.chapterId;
                return (
                  <button
                    key={chap.chapterId}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setIsChapterDrawerOpen(false);
                      if (onNavigateChapter) {
                        onNavigateChapter(chap.chapterId);
                      } else {
                        router.push(`/read/${story.storyId}/${chap.chapterId}`);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-semibold text-zinc-400">Sohbet {idx + 1}</p>
                      <p className="text-sm truncate text-white">{chap.title}</p>
                    </div>
                    {isActive && <Check size={16} className="text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM YORUMLARI ÇEKMECESİ (DRAWER - SAFE AREA UYUMLU) ── */}
      {isCommentsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsCommentsOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-[#162127] border-l border-white/10 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] px-4 sm:px-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Yorumlar ({comments.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all cursor-pointer"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Yorumlar Listesi */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  İlk yorumu siz yapın!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.commentId} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {c.authorName?.slice(0, 1).toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-bold text-white">{c.authorName || 'Okuyucu'}</span>
                    </div>
                    <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Yorum Gönder Girişi (Mobil klavye & Safe-Area uyumlu) */}
            <div className="pt-3 border-t border-white/10 shrink-0 flex items-center gap-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendComment();
                }}
                placeholder="Bu sohbet hakkında bir şey yaz..."
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSendComment}
                disabled={isSubmittingComment || !commentText.trim()}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center font-bold disabled:opacity-50 transition-all cursor-pointer shrink-0 active:scale-95"
                aria-label="Gönder"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GÖRSEL BÜYÜTME (LIGHTBOX - SAFE AREA UYUMLU) ── */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Üst Bar: Geri Sohbete Dön & Kapat Butonları */}
          <div className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 sm:right-6 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="px-3.5 py-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-sm shadow-sm"
              aria-label="Sohbete Dön"
            >
              <ArrowLeft size={16} />
              <span>Sohbete Dön</span>
            </button>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
              aria-label="Görseli Kapat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Görsel Konteyneri */}
          <div 
            className="max-w-4xl max-h-[85vh] p-2 flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Detay"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
