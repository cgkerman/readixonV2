"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@readixon/core/src/store/useAuthStore';
import { getUserChapterReactions, toggleChapterReaction } from '@readixon/core/src/services/storyService';
import Image from 'next/image';
import { Typography } from '@readixon/ui';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Heart, 
  Zap, 
  MessageSquareQuote,
  Star,
  LayoutGrid
} from 'lucide-react';

interface ChapterReactionsProps {
  storyId: string;
  chapterId: string;
  initialCounts?: Record<string, number>;
}

const AVAILABLE_REACTIONS = [
  // Pozitif / Eğlenceli
  'legendary', 'admired', 'like', 'excited', 'laughing',
  // Duygusal / Sevimli
  'touched', 'hug', 'blushed',
  // Şaşırtıcı / Düşündürücü
  'thoughtful', 'twisted', 'shocked', 'confused',
  // Nötr / Sıkıcı
  'average', 'cliche', 'bored',
  // Negatif / Üzücü
  'sad', 'failed', 'annoyed', 'dislike', 'angry'
];

const REACTION_LABELS: Record<string, string> = {
  admired: 'Hayran',
  angry: 'Kızgın',
  annoyed: 'Bıkkın',
  average: 'Sıradan',
  blushed: 'Utanmış',
  bored: 'Sıkıcı',
  cliche: 'Klişe',
  confused: 'Şaşkın',
  dislike: 'Peh',
  excited: 'Heyecanlı',
  failed: 'Hüsran',
  hug: 'Sarıl',
  laughing: 'Koptum',
  legendary: 'Efsane',
  like: 'Güzel',
  sad: 'Üzgün',
  shocked: 'Şokta',
  thoughtful: 'Düşündürücü',
  touched: 'Duygulandım',
  twisted: 'Ters Köşe'
};

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: Sparkles, reactions: AVAILABLE_REACTIONS },
  { id: 'positive', label: 'Pozitif', icon: Flame, reactions: ['legendary', 'admired', 'like', 'excited', 'laughing'] },
  { id: 'emotional', label: 'Duygusal', icon: Heart, reactions: ['touched', 'hug', 'blushed'] },
  { id: 'surprise', label: 'Şaşırtıcı', icon: Zap, reactions: ['thoughtful', 'twisted', 'shocked', 'confused'] },
  { id: 'critical', label: 'Eleştirel', icon: MessageSquareQuote, reactions: ['average', 'cliche', 'bored', 'sad', 'failed', 'annoyed', 'dislike', 'angry'] }
];

export const ChapterReactions = ({ storyId, chapterId, initialCounts = {} }: ChapterReactionsProps) => {
  const { firebaseUser: user } = useAuthStore();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [justSelectedReaction, setJustSelectedReaction] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setCounts(prev => ({ ...initialCounts, ...prev }));
  }, [initialCounts]);

  useEffect(() => {
    const fetchUserReactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const reactions = await getUserChapterReactions(storyId, chapterId, user.uid);
        setUserReactions(reactions);
      } catch (e) {
        console.error("Error fetching user reactions:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReactions();
  }, [storyId, chapterId, user]);

  // Popüler tepkiler (sayısı > 0 olanlar, çoktan aza)
  const popularReactions = useMemo(() => {
    return Object.entries(counts)
      .filter(([reaction, count]) => count > 0 && AVAILABLE_REACTIONS.includes(reaction))
      .sort((a, b) => b[1] - a[1])
      .map(([reaction]) => reaction);
  }, [counts]);

  // Dinamik kategoriler listesi (popüler tepkiler varsa Popüler sekmesi eklenir)
  const categoriesList = useMemo(() => {
    if (popularReactions.length >= 2) {
      return [
        { id: 'all', label: 'Tümü', icon: Sparkles, reactions: AVAILABLE_REACTIONS },
        { id: 'popular', label: 'Popüler', icon: Star, reactions: popularReactions },
        ...CATEGORIES.slice(1)
      ];
    }
    return CATEGORIES;
  }, [popularReactions]);

  // Aktif filtrelenmiş tepkiler
  const filteredReactions = useMemo(() => {
    const cat = categoriesList.find(c => c.id === activeCategory);
    return cat ? cat.reactions : AVAILABLE_REACTIONS;
  }, [activeCategory, categoriesList]);

  // Yatay scroll durumu kontrolü
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [filteredReactions, isExpanded]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.max(220, scrollContainerRef.current.clientWidth * 0.7);
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleReactionClick = async (reaction: string) => {
    if (!user) {
      toast.error('Tepki vermek için giriş yapmalısınız.');
      return;
    }

    const isSelected = userReactions.includes(reaction);
    
    if (!isSelected && userReactions.length >= 5) {
      toast.error('En fazla 5 tepki seçebilirsiniz.');
      return;
    }

    if (isUpdating) return;

    // Seçim animasyonu tetikleme
    if (!isSelected) {
      setJustSelectedReaction(reaction);
      setTimeout(() => {
        setJustSelectedReaction(prev => (prev === reaction ? null : prev));
      }, 1000);
    }

    setIsUpdating(true);
    const newSelected = isSelected 
      ? userReactions.filter(r => r !== reaction) 
      : [...userReactions, reaction];
      
    setUserReactions(newSelected);
    
    setCounts(prev => ({
      ...prev,
      [reaction]: Math.max(0, (prev[reaction] || 0) + (isSelected ? -1 : 1))
    }));

    try {
      const result = await toggleChapterReaction(storyId, chapterId, user.uid, reaction);
      if (!result.success) {
        setUserReactions(userReactions);
        setCounts(counts);
        toast.error('Tepkiniz kaydedilemedi, tekrar deneyin.');
      } else if (result.newCounts) {
        setCounts(prev => ({ ...prev, ...result.newCounts }));
      }
    } catch (e) {
      setUserReactions(userReactions);
      setCounts(counts);
    } finally {
      setIsUpdating(false);
    }
  };

  // Tekil tepki butonu bileşeni
  const renderReactionButton = (reaction: string, isCompactRail: boolean) => {
    const isSelected = userReactions.includes(reaction);
    const isBursting = justSelectedReaction === reaction;
    const count = counts[reaction] || 0;
    const hasCount = count > 0;

    return (
      <motion.button
        key={reaction}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: isSelected ? [0, -3, 0] : 0 
        }}
        transition={{
          y: isSelected ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" } : { type: "spring", stiffness: 350, damping: 18 },
          opacity: { duration: 0.2 }
        }}
        whileHover={{ 
          scale: 1.1, 
          y: -4, 
          transition: { type: "spring", stiffness: 400, damping: 12 } 
        }}
        whileTap={{ 
          scale: 0.88, 
          transition: { type: "spring", stiffness: 500, damping: 15 } 
        }}
        onClick={() => handleReactionClick(reaction)}
        className={`relative shrink-0 flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-200 select-none ${
          isCompactRail 
            ? 'w-[72px] sm:w-[82px] min-h-[92px] sm:min-h-[102px] snap-start' 
            : 'w-full max-w-[84px] min-h-[96px] sm:min-h-[108px]'
        } ${
          isSelected 
            ? 'bg-primary/15 border-2 border-primary/80 shadow-[0_4px_16px_rgba(var(--primary),0.25)] grayscale-0 opacity-100 ring-2 ring-primary/20' 
            : 'bg-current/[0.03] hover:bg-current/[0.08] border border-current/10 grayscale-[55%] hover:grayscale-0 opacity-70 hover:opacity-100'
        }`}
      >
        {/* Maskot İkonu */}
        <div className={`relative ${isCompactRail ? 'w-11 h-11 sm:w-14 sm:h-14' : 'w-12 h-12 sm:w-15 sm:h-15'} z-10 transition-transform`}>
          <Image
            src={`/images/reactions/mascot-${reaction}.png`}
            alt={REACTION_LABELS[reaction] || reaction}
            fill
            quality={95}
            className="object-contain drop-shadow-sm"
            sizes="64px"
          />
        </div>

        {/* Tepki İsmi */}
        <span className={`text-[10px] sm:text-[11px] font-bold mt-1 z-10 text-center leading-tight truncate w-full transition-colors ${
          isSelected ? 'text-primary font-black' : 'text-foreground/80'
        }`}>
          {REACTION_LABELS[reaction] || reaction}
        </span>

        {/* Sayı Rozeti */}
        <div className="min-h-[18px] flex items-center justify-center mt-0.5 z-10">
          <AnimatePresence mode="wait">
            {hasCount ? (
              <motion.span
                key={`count-${count}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full leading-tight transition-colors ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-current/[0.08] text-foreground font-bold'
                }`}
              >
                {count}
              </motion.span>
            ) : (
              <span className="text-[10px] opacity-0 select-none">0</span>
            )}
          </AnimatePresence>
        </div>

        {/* Tıklama Anı (Burst) Efekti - Mobil Dostu & Boyutu Optimize Edilmiş */}
        <AnimatePresence>
          {isBursting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible">
              {/* Şok Dalgası */}
              <motion.div
                initial={{ scale: 0.2, opacity: 1, borderWidth: "6px" }}
                animate={{ scale: 3.5, opacity: 0, borderWidth: "0px" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute w-16 h-16 rounded-full border-primary"
              />
              
              {/* İkinci iç dalga */}
              <motion.div
                initial={{ scale: 0.2, opacity: 1, borderWidth: "4px" }}
                animate={{ scale: 2.5, opacity: 0, borderWidth: "0px" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                className="absolute w-12 h-12 rounded-full border-primary/60"
              />

              {/* Partiküller */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const distance = i % 2 === 0 ? 55 : 40;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                return (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)] ${
                      i % 2 === 0 ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary' : 'w-1.5 h-1.5 bg-primary/80'
                    }`}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{ x, y, scale: [0, 1.6, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut", delay: i % 2 === 0 ? 0 : 0.03 }}
                  />
                );
              })}
              
              {/* Yükselen Hayalet Maskot */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.95, y: 0, rotate: 0 }}
                animate={{ scale: 2.2, opacity: 0, y: -75, rotate: 10 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute z-50 w-12 h-12 sm:w-14 sm:h-14 pointer-events-none"
              >
                <Image
                  src={`/images/reactions/mascot-${reaction}.png`}
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_0_12px_rgba(var(--primary),0.8)]"
                  sizes="64px"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 sm:my-10 px-2 sm:px-6">
      {/* Kart Kapsayıcısı: Reader Temasına Otomatik Uyumlu */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-current/10 bg-current/[0.02] p-3.5 sm:p-6 backdrop-blur-sm shadow-sm transition-all">
        
        {/* Üst Başlık & Durum Çubuğu */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Typography variant="h4" className="font-bold tracking-tight text-sm sm:text-base" style={{ color: 'inherit' }}>
                  Bölüme Tepki Ver
                </Typography>
                <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  userReactions.length > 0 
                    ? 'bg-primary/15 text-primary border border-primary/25' 
                    : 'bg-current/[0.06] text-foreground/70'
                }`}>
                  {userReactions.length}/5
                </span>
              </div>
              <p className="text-[11px] sm:text-xs opacity-65 leading-none mt-0.5" style={{ color: 'inherit' }}>
                {userReactions.length === 5 ? 'Maksimum sınıra ulaştınız' : 'En fazla 5 duygu seçebilirsiniz'}
              </p>
            </div>
          </div>

          {/* Mobilde Görünüm Değiştirici (Izgara / Yatay Ray) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-current/[0.05] hover:bg-current/[0.1] border border-current/10 text-foreground transition-all shrink-0"
            title={isExpanded ? "Kompakt yatay kaydırmaya geç" : "Tümünü genişlet"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-primary" />
                <span>Kompakt</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span>Tümü ({filteredReactions.length})</span>
              </>
            )}
          </button>
        </div>

        {/* Seçilen Tepkiler Hızlı Çubuğu (Varsa Gösterilir) */}
        <AnimatePresence>
          {userReactions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-primary/[0.08] border border-primary/20">
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary mr-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Seçtikleriniz:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {userReactions.map((reaction) => (
                    <button
                      key={`selected-${reaction}`}
                      onClick={() => handleReactionClick(reaction)}
                      className="group inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 hover:bg-destructive/20 text-foreground transition-all"
                      title="Tepkiyi kaldır"
                    >
                      <div className="relative w-4 h-4">
                        <Image
                          src={`/images/reactions/mascot-${reaction}.png`}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="16px"
                        />
                      </div>
                      <span>{REACTION_LABELS[reaction]}</span>
                      <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duygu Kategori Filtre Sekmeleri */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-2 sm:mb-4">
          {categoriesList.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40' 
                    : 'bg-current/[0.04] hover:bg-current/[0.08] border border-current/10 opacity-75 hover:opacity-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className={`text-[10px] ml-0.5 px-1 py-0.2 rounded-full ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-current/[0.08] opacity-70'
                  }`}>
                    {cat.reactions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tepkiler Alanı */}
        {isExpanded ? (
          /* Genişletilmiş Görünüm (Mobil Açık veya Masaüstü Seçeneği) */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3 justify-items-center py-2"
          >
            {filteredReactions.map(reaction => renderReactionButton(reaction, false))}
          </motion.div>
        ) : (
          /* Kompakt Yatay Kaydırma Rayı (Mobilde varsayılan & az yer kaplar) */
          <div className="relative w-full group/carousel">
            {/* Masaüstü Sol Kaydırma Butonu */}
            {canScrollLeft && (
              <button
                onClick={() => handleScroll('left')}
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card/90 border border-border shadow-md items-center justify-center text-foreground hover:bg-card hover:scale-105 transition-all"
                aria-label="Sola kaydır"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Sol Geçiş Maskesi */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-card/80 to-transparent sm:block hidden" />
            )}

            {/* Yatay Kaydırılabilir Maskot Listesi */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-2 px-1 snap-x scroll-smooth overscroll-x-contain"
            >
              {filteredReactions.map(reaction => renderReactionButton(reaction, true))}
            </div>

            {/* Sağ Geçiş Maskesi */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-card/80 to-transparent sm:block hidden" />
            )}

            {/* Masaüstü Sağ Kaydırma Butonu */}
            {canScrollRight && (
              <button
                onClick={() => handleScroll('right')}
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card/90 border border-border shadow-md items-center justify-center text-foreground hover:bg-card hover:scale-105 transition-all"
                aria-label="Sağa kaydır"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Masaüstü için Izgara Görünümü (sm ve üzeri ekranlarda şık bir flex-wrap / grid gösterimi sağlamak için) */}
        <div className="hidden sm:block">
          {/* Masaüstünde yatay kaydırmaya alternatif alt bilgi veya kompakt ipucu */}
          <div className="flex items-center justify-between text-[11px] opacity-60 mt-3 pt-2 border-t border-current/10">
            <span>Tepkileri kaydırabilir veya kategorilere tıklayarak filtreleyebilirsiniz.</span>
            <span className="font-medium">Readixon Reactions</span>
          </div>
        </div>

      </div>
    </div>
  );
};
