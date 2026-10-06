'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Typography, Button } from '@readixon/ui';
import { collection, getDocs, limit, orderBy, query, where, onSnapshot } from 'firebase/firestore';
import { db, getTopStories, getActiveAdminPolls, voteAdminPoll, AdminPoll, getActiveQuote, AdminQuote, useAuthStore, slugify } from '@readixon/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, TrendingUp, BookOpen, Newspaper, Quote as QuoteIcon, Vote, ChevronRight, ChevronLeft, Eye, Heart, Layers, Star, Clock, Calendar, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { AgendaFooter } from './components/AgendaFooter';
import { PlatformFeedback } from './components/PlatformFeedback';
import { ExcellentStoriesSection } from './components/ExcellentStoriesSection';

function formatNewsDate(createdAt: any): string {
  if (!createdAt) return 'Yeni';
  try {
    const date = createdAt.toDate 
      ? createdAt.toDate() 
      : (createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt));
    if (isNaN(date.getTime())) return 'Yeni';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Bugün';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 5) return 'Az önce';
    if (diffMinutes < 60) return `${diffMinutes} dk önce`;
    if (diffHours < 24) return `${diffHours} sa önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return 'Yeni';
  }
}

function getEstimatedReadTime(content?: string): string {
  if (!content) return '2 dk okuma';
  const plainText = content.replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} dk okuma`;
}

export default function AgendaPage() {
  const queryClient = useQueryClient();
  const [trendingTags, setTrendingTags] = useState<{ id: string, count: number }[]>([]);
  const [votingState, setVotingState] = useState<{ pollId: string, optionIndex: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { userProfile } = useAuthStore();

  const handleCopyQuote = async (quote: AdminQuote) => {
    const textToCopy = `"${quote.text}" — ${quote.author} (Readixon)`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
    } catch {
      // Fallback if document not focused or clipboard permission denied
    }
    setIsCopied(true);
    toast.success('Alıntı panoya kopyalandı!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const popularScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!popularScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = popularScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollPopular = (direction: 'left' | 'right') => {
    if (!popularScrollRef.current) return;
    const scrollAmount = popularScrollRef.current.clientWidth * 0.75;
    popularScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // 1. Gerçek Zamanlı Trend Etiketler (Yalnızca veritabanındaki gerçek etiketler)
  useEffect(() => {
    const tagsQ = query(collection(db, 'tags'), orderBy('count', 'desc'), limit(10));
    const unsubscribeTags = onSnapshot(tagsQ, (snapshot) => {
      if (snapshot.empty) {
        setTrendingTags([]);
      } else {
        setTrendingTags(snapshot.docs.map(d => ({ id: d.id, count: d.data().count })));
      }
    }, (error) => {
      console.error("Trend etiketler çekilirken hata:", error);
      setTrendingTags([]);
    });

    return () => unsubscribeTags();
  }, []);

  // 2. Kültür & Sanat Haberleri (TanStack Query - Sadece gerçek duyuru/haberler)
  const { data: cultureNews = [], isLoading: newsLoading } = useQuery<any[]>({
    queryKey: ['announcements', 'culture'],
    queryFn: async () => {
      try {
        const newsQ = query(
          collection(db, 'announcements'),
          where('category', '==', 'culture'),
          where('isActive', '==', true),
          limit(15)
        );
        const newsSnap = await getDocs(newsQ);
        if (newsSnap.empty) return [];
        const docs = newsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a: any, b: any) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return tB - tA;
        });
        return docs;
      } catch (err) {
        console.error("Culture news fetch error:", err);
        return [];
      }
    }
  });

  // 3. Popüler Eserler (Sadece platformdaki gerçek eserler)
  const { data: popularBooks = [], isLoading: booksLoading } = useQuery<any[]>({
    queryKey: ['agenda', 'popular_stories'],
    queryFn: async () => {
      try {
        const topStories = await getTopStories(10);
        if (!topStories || topStories.length === 0) return [];
        return topStories;
      } catch (err) {
        console.error("Popular books fetch error:", err);
        return [];
      }
    }
  });

  // 4. Okur Anketleri
  const { data: adminPolls = [], isLoading: pollsLoading } = useQuery({
    queryKey: ['admin_polls', 'active'],
    queryFn: () => getActiveAdminPolls(),
  });

  // 5. Günün Alıntısı
  const { data: adminQuote, isLoading: quoteLoading } = useQuery({
    queryKey: ['admin_quote', 'active'],
    queryFn: () => getActiveQuote(),
  });

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!userProfile?.uid) {
      toast.error('Oy vermek için giriş yapmalısınız!');
      return;
    }
    const pollIndex = adminPolls.findIndex(p => p.id === pollId);
    if (pollIndex === -1) return;

    setVotingState({ pollId, optionIndex });
    try {
      await voteAdminPoll(pollId, optionIndex, userProfile.uid);
      queryClient.setQueryData(['admin_polls', 'active'], (oldPolls: AdminPoll[] | undefined) => {
        if (!oldPolls) return oldPolls;
        return oldPolls.map(p => {
          if (p.id !== pollId) return p;
          const updatedOptions = [...p.options];
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            votes: updatedOptions[optionIndex].votes + 1
          };
          return {
            ...p,
            options: updatedOptions,
            votedUsers: [...(p.votedUsers || []), userProfile.uid]
          };
        });
      });
      toast.success('Oyunuz kaydedildi!');
    } catch (err: any) {
      toast.error(err.message || 'Oy verirken bir hata oluştu');
    } finally {
      setVotingState(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section (Anında Görünür) */}
      <div className="relative pt-12 pb-20 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 z-0" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-text mb-4 tracking-tight">
              Gündem
            </Typography>
            <Typography variant="body" className="text-lg text-muted/80 max-w-xl leading-relaxed">
              Edebiyat dünyasındaki son gelişmeleri, günün öne çıkan sözünü, trend etiketleri ve okur anketlerini buradan takip edin.
            </Typography>
          </div>

          {/* Right Column: Widgets */}
          <div className="w-full md:w-2/5 shrink-0 flex flex-col gap-6">
            {/* Quote of the Day in Hero */}
            {quoteLoading ? (
              <div className="bg-card/40 border border-white/10 rounded-[2rem] p-8 animate-pulse shadow-lg">
                <div className="h-3 w-24 bg-primary/20 rounded mb-4" />
                <div className="h-4 w-full bg-card/60 rounded mb-2" />
                <div className="h-4 w-3/4 bg-card/60 rounded mb-4" />
                <div className="h-3 w-20 bg-card/40 rounded ml-auto" />
              </div>
            ) : adminQuote ? (
              <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                {/* Top Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <QuoteIcon size={14} className="text-primary" />
                    <Typography variant="caption" className="text-primary font-bold tracking-widest uppercase text-xs block">Günün Alıntısı</Typography>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyQuote(adminQuote)}
                    className="text-xs font-semibold text-muted hover:text-foreground transition-all flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 shadow-xs cursor-pointer active:scale-95"
                    title="Alıntıyı panoya kopyala"
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-emerald-500 text-[11px] font-bold">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span className="text-[11px]">Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-text italic font-serif text-base sm:text-lg leading-relaxed relative z-10 selection:bg-primary/20">
                  "{adminQuote.text}"
                </p>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/30 relative z-10">
                  <Typography variant="caption" className="text-muted-foreground text-right font-medium italic text-sm">
                    — {adminQuote.author}
                  </Typography>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-12 flex flex-col gap-16">

        {/* Culture News Section */}
        {(newsLoading || cultureNews.length > 0) && (
          <section className="w-full">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <Newspaper size={22} />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-text text-lg sm:text-2xl">Kültür & Sanat Gündemi</Typography>
                  <p className="text-xs text-muted mt-0.5">Edebiyat ve sanat dünyasından seçki haberler</p>
                </div>
              </div>
            </div>

            {newsLoading ? (
              <div className="flex flex-col gap-6">
                <div className="w-full aspect-[16/10] sm:aspect-video md:aspect-[21/9] rounded-[2rem] bg-card/60 border border-border/50 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-full aspect-[16/10] sm:aspect-video rounded-3xl bg-card/60 border border-border/50 animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* İlk Haber (Hero - En Büyük) */}
                {cultureNews.length > 0 && (
                  <Link
                    href={`/news/${slugify(cultureNews[0].title)}-${cultureNews[0].id}`}
                    className="group cursor-pointer rounded-[2rem] overflow-hidden relative transition-all duration-300 border border-border/50 hover:border-primary/40 shadow-sm hover:shadow-2xl w-full aspect-[16/10] sm:aspect-video md:aspect-[21/9]"
                  >
                    {cultureNews[0].imageUrl ? (
                      <>
                        <img
                          src={cultureNews[0].imageUrl}
                          alt={cultureNews[0].title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                          decoding="async"
                        />
                        {/* Çok katmanlı zengin kontrast koruma (Açık ve koyu görsellerde yüksek okunabilirlik) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-60" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-purple-900/90 to-background" />
                    )}

                    <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-end z-10">
                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        <span className="bg-primary text-primary-foreground text-xs md:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md">
                          Günün Öne Çıkanı
                        </span>
                        <span className="bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" />
                          {getEstimatedReadTime(cultureNews[0].content)}
                        </span>
                        <span className="bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 hidden sm:flex items-center gap-1.5">
                          <Calendar size={12} className="text-white/70" />
                          {formatNewsDate(cultureNews[0].createdAt)}
                        </span>
                      </div>

                      <Typography
                        variant="h2"
                        className="font-extrabold text-white mb-3 sm:mb-4 group-hover:text-primary-foreground/90 transition-colors line-clamp-2 md:line-clamp-3 text-2xl sm:text-3xl md:text-5xl leading-tight drop-shadow-sm"
                      >
                        {cultureNews[0].title}
                      </Typography>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-white/80 text-xs sm:text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                            <span className="text-[10px] sm:text-xs font-bold text-white">R</span>
                          </div>
                          <span>Readixon Kültür Sanat</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-white/40 sm:inline-block" />
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Clock size={14} className="text-white/60" />
                          <span>{formatNewsDate(cultureNews[0].createdAt)}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:inline-block" />
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Eye size={15} className="text-white/60" />
                          <span>{cultureNews[0].views?.toLocaleString('tr-TR') || cultureNews[0].stats?.views?.toLocaleString('tr-TR') || 0} okuma</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Diğer Haberler (3'lü Grid) */}
                {cultureNews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cultureNews.slice(1).map((news) => (
                      <Link
                        href={`/news/${slugify(news.title)}-${news.id}`}
                        key={news.id}
                        className="group cursor-pointer rounded-3xl overflow-hidden relative transition-all duration-300 border border-border/50 hover:border-primary/40 shadow-sm hover:shadow-xl aspect-[16/10] sm:aspect-video w-full flex flex-col justify-end"
                      >
                        {news.imageUrl ? (
                          <>
                            <img
                              src={news.imageUrl}
                              alt={news.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-purple-900/80 to-background" />
                        )}

                        {/* Top Badge: Okuma süresi ve zaman */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                          <span className="bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                            <Clock size={11} className="text-primary" />
                            {getEstimatedReadTime(news.content)}
                          </span>
                          <span className="bg-black/40 backdrop-blur-md text-white/80 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                            {formatNewsDate(news.createdAt)}
                          </span>
                        </div>

                        <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end">
                          <Typography
                            variant="h4"
                            className="font-bold text-white mb-3 group-hover:text-primary-foreground/90 transition-colors line-clamp-2 text-lg sm:text-xl leading-snug drop-shadow-sm"
                          >
                            {news.title}
                          </Typography>

                          <div className="flex items-center justify-between w-full text-white/75 text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-white font-bold">R</span>
                              </div>
                              <span>Readixon</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/70">
                              <Eye size={13} />
                              <span>{news.views?.toLocaleString('tr-TR') || news.stats?.views?.toLocaleString('tr-TR') || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Üstün Nitelikli Eserler (Editör Değerlendirmeleri 8.0+) */}
        <ExcellentStoriesSection />

        {/* Popular Books Section (Touch Slider / Carousel) */}
        {popularBooks.length > 0 && (
          <section className="w-full">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <BookOpen size={22} />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-text text-lg sm:text-2xl">Popüler Eserler</Typography>
                  <p className="text-xs text-muted mt-0.5">En çok okunan ve beğenilen haftalık eserler</p>
                </div>
              </div>

              {/* Desktop Scroll Nav Arrows */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollPopular('left')}
                  disabled={!canScrollLeft}
                  className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Sola Kaydır"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollPopular('right')}
                  disabled={!canScrollRight}
                  className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Sağa Kaydır"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Touch / Momentum Slider Container */}
            <div
              ref={popularScrollRef}
              onScroll={checkScroll}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-4 pt-1 px-1 -mx-4 sm:mx-0 px-4 sm:px-1"
            >
              {popularBooks.map((book: any, idx) => (
                <Link 
                  href={`/story/${book.storyId || book.id}`} 
                  key={book.storyId || book.id || idx} 
                  className="snap-start shrink-0 w-[290px] sm:w-[320px] md:w-[350px] group bg-card/40 hover:bg-card/80 border border-border/50 hover:border-primary/40 rounded-3xl p-4 sm:p-5 transition-all duration-300 flex items-stretch gap-4 sm:gap-5 shadow-xs hover:shadow-xl active:scale-[0.99]"
                >
                  {/* 3D Book Mockup */}
                  <div className="relative shrink-0 w-24 sm:w-28 md:w-32 h-36 sm:h-40 md:h-48 rounded-r-xl rounded-l-sm shadow-2xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:rotate-1 group-hover:shadow-primary/30 self-center">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-r-xl rounded-l-sm"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 rounded-r-xl rounded-l-sm flex items-center justify-center text-primary">
                        <BookOpen size={24} />
                      </div>
                    )}
                    {/* Spine shadow */}
                    <div className="absolute inset-y-0 left-0 w-3 sm:w-4 bg-gradient-to-r from-black/50 via-black/10 to-transparent mix-blend-multiply rounded-l-sm pointer-events-none" />
                    {/* Edge highlights */}
                    <div className="absolute inset-0 rounded-r-xl rounded-l-sm shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-2px_0_5px_rgba(0,0,0,0.3)] pointer-events-none" />

                    {/* Rank Badge */}
                    <div className={`absolute -top-2.5 -left-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 border-background shadow-md z-20 group-hover:scale-110 transition-transform ${
                      idx === 0 
                        ? 'bg-amber-400 text-black' 
                        : idx === 1 
                          ? 'bg-slate-300 text-black' 
                          : idx === 2 
                            ? 'bg-orange-400 text-black' 
                            : 'bg-primary text-background'
                    }`}>
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Right: Book Details & Stats */}
                  <div className="flex flex-col min-w-0 flex-1 py-1">
                    <Typography variant="body" className="font-extrabold text-base sm:text-lg text-text group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                      {book.title}
                    </Typography>

                    <Typography variant="caption" className="text-muted/80 font-medium line-clamp-1 mb-3 text-xs sm:text-sm">
                      {book.authorName}
                    </Typography>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-2 sm:gap-y-2.5 gap-x-2 mt-auto pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Eye size={13} className="text-primary/70" />
                        <span>{book.stats?.views?.toLocaleString('tr-TR') || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Heart size={13} className="text-rose-500/80" />
                        <span>{book.stats?.likes?.toLocaleString('tr-TR') || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Layers size={13} className="text-purple-500/80" />
                        <span>{book.stats?.chapterCount || 0} Bölüm</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Star size={13} className="text-yellow-500/80" />
                        <span>{book.stats?.rating ? book.stats.rating.toFixed(1) : '-'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Tags Section (Modern Compact Grid) */}
        {trendingTags.length > 0 && (
          <section className="w-full">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-text text-lg sm:text-2xl">Türkiye'de Trend</Typography>
                  <p className="text-xs text-muted mt-0.5">Topluluğun ve hikayelerin en çok konuştuğu etiketler</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 hidden sm:inline-block">
                Canlı Gündem
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {trendingTags.map((tag, idx) => (
                <Link
                  key={tag.id}
                  href={`/readix?hashtag=${tag.id}`}
                  className="group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-card/40 hover:bg-card/80 border border-border/50 hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 ${
                    idx === 0 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : idx === 1 
                        ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' 
                        : idx === 2 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                          : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      #{tag.id}
                    </h4>
                    <span className="text-[11px] text-muted font-medium block truncate">
                      {tag.count.toLocaleString('tr-TR')} Gönderi
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Poll Section */}
        {adminPolls.length > 0 && (
          <section className="w-full mt-4">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <Vote size={22} />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-text text-lg sm:text-2xl">Okur Anketleri</Typography>
                  <p className="text-xs text-muted mt-0.5">Topluluğun nabzını tutan haftalık edebiyat ve kültür anketleri</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminPolls.map((poll) => {
                const hasVoted = userProfile?.uid && poll.votedUsers?.includes(userProfile.uid);
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

                return (
                  <div key={poll.id} className="w-full bg-card/40 backdrop-blur-sm border border-border/60 hover:border-border rounded-3xl p-6 sm:p-7 relative overflow-hidden group flex flex-col shadow-xs hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                    {/* Top Status Strip */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 shrink-0">
                        <Vote size={12} />
                        {totalVotes.toLocaleString('tr-TR')} Oy
                      </span>
                      {hasVoted && (
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                          <Check size={12} />
                          Oyunuz Kaydedildi
                        </span>
                      )}
                    </div>

                    <Typography variant="body" className="font-bold text-base sm:text-lg mb-5 leading-snug flex-1 text-foreground">
                      {poll.question}
                    </Typography>

                    <div className="flex flex-col gap-3">
                      {poll.options.map((opt, idx) => {
                        if (hasVoted) {
                          const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                          return (
                            <div key={idx} className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/10 p-3.5 sm:p-4 text-sm transition-all">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary/20 to-purple-500/20 transition-all duration-1000 ease-out"
                                style={{ width: `${percent}%` }}
                              />
                              <div className="relative z-10 flex justify-between items-center gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                  <span className="font-medium text-text line-clamp-2">{opt.text}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-muted/70 font-normal">({opt.votes} oy)</span>
                                  <span className="font-extrabold text-base text-foreground font-mono">%{percent}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const isVotingThisOption = votingState?.pollId === poll.id && votingState?.optionIndex === idx;
                        const isVotingAny = votingState !== null;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleVote(poll.id, idx)}
                            disabled={isVotingAny}
                            className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group/btn text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                          >
                            <span className="group-hover/btn:text-primary transition-colors font-medium text-foreground">{opt.text}</span>
                            {isVotingThisOption ? (
                              <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                            ) : (
                              <ChevronRight size={16} className="text-muted group-hover/btn:text-primary transition-colors opacity-0 group-hover/btn:opacity-100 transform -translate-x-2 group-hover/btn:translate-x-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <PlatformFeedback />

      </div>

      <AgendaFooter />
    </div>
  );
}
