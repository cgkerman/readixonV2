'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Star, 
  Images, 
  Sparkles,
  Award,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { subscribeToAuthorStories, getPublishedChapters, useAuthStore, type Story } from '@readixon/core';

// Kompakt sayı formatlayıcı (Örn: 15400 -> 15.4B)
const formatCompact = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'B';
  return num.toLocaleString('tr-TR');
};

export default function StudioStats() {
  const { firebaseUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [realCommentCounts, setRealCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!firebaseUser) return;
    
    setLoading(true);
    // Real-time subscription to author's stories
    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      setStories(updatedStories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  useEffect(() => {
    const fetchCommentCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        stories.map(async (story) => {
          try {
            const chapters = await getPublishedChapters(story.storyId);
            const total = chapters.reduce((sum, chap) => sum + (chap.stats?.commentCount || 0), 0);
            counts[story.storyId] = Math.max(story.stats?.commentCount || 0, total);
          } catch (e) {
            counts[story.storyId] = story.stats?.commentCount || 0;
          }
        })
      );
      setRealCommentCounts(counts);
    };

    if (stories.length > 0) {
      fetchCommentCounts();
    }
  }, [stories]);

  // Aggregated Stats
  const { totalViews, totalLikes, totalReviews, totalNovels, totalWebtoons, avgRating, ratedStoriesCount } = useMemo(() => {
    let views = 0;
    let likes = 0;
    let reviews = 0;
    let totalRating = 0;
    let ratedCount = 0;
    let novels = 0;
    let webtoons = 0;

    stories.forEach(story => {
      views += story.stats.views || 0;
      likes += story.stats.likes || 0;
      reviews += story.stats.reviewCount || 0;
      
      if (story.stats.rating) {
        totalRating += story.stats.rating;
        ratedCount += 1;
      }
      if (story.format === 'webtoon') webtoons++;
      else novels++;
    });

    return {
      totalViews: views,
      totalLikes: likes,
      totalReviews: reviews,
      totalNovels: novels,
      totalWebtoons: webtoons,
      ratedStoriesCount: ratedCount,
      avgRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '0.0'
    };
  }, [stories]);

  const globalTotalComments = useMemo(() => {
    return stories.reduce((sum, story) => {
      const realCount = realCommentCounts[story.storyId];
      return sum + (realCount !== undefined ? realCount : (story.stats?.commentCount || 0));
    }, 0);
  }, [stories, realCommentCounts]);

  // Top performing stories (sorted by views)
  const topStories = useMemo(() => {
    return [...stories].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0)).slice(0, 5);
  }, [stories]);

  return (
    <div className="px-4 py-5 sm:p-6 md:p-8 max-w-6xl mx-auto w-full relative min-h-[calc(100vh-4rem)] pb-28 xl:pb-8">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in-up">
        <Typography variant="h1" className="text-2xl sm:text-3xl font-black mb-1.5 flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <BarChart3 size={20} />
          </div>
          <span>İstatistikler</span>
        </Typography>
        <Typography variant="body" className="text-xs sm:text-sm text-muted">
          Eserlerinizin okunma, beğeni ve okuyucu etkileşimlerini anlık takip edin.
        </Typography>
      </div>

      {loading ? (
        <div className="flex justify-center py-24 sm:py-32">
          <div className="w-9 h-9 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in-up">
          
          {/* ── 1. Ana KPI Kartları (Mobil: 2 Kolon, Tablet/Masaüstü: 3 / 6 Kolon) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            <StatCard 
              icon={<Eye size={18} className="text-primary" />} 
              label="Toplam Okunma" 
              value={formatCompact(totalViews)} 
              raw={totalViews.toLocaleString('tr-TR')}
              bgColor="bg-primary/10 border-primary/20"
            />
            <StatCard 
              icon={<Heart size={18} className="text-pink-400" />} 
              label="Toplam Beğeni" 
              value={formatCompact(totalLikes)} 
              raw={totalLikes.toLocaleString('tr-TR')}
              bgColor="bg-pink-500/10 border-pink-500/20"
            />
            <StatCard 
              icon={<MessageSquare size={18} className="text-sky-400" />} 
              label="Yorum & İnceleme" 
              value={formatCompact(totalReviews + globalTotalComments)} 
              raw={(totalReviews + globalTotalComments).toLocaleString('tr-TR')}
              bgColor="bg-sky-500/10 border-sky-500/20"
              href="/studio/stats/reviews"
            />
            <StatCard 
              icon={<Star size={18} className="text-amber-400 fill-amber-400" />} 
              label="Ortalama Puan" 
              value={avgRating} 
              raw={`${avgRating} / 5.0 (${ratedStoriesCount} Eser)`}
              bgColor="bg-amber-500/10 border-amber-500/20"
            />
            <StatCard 
              icon={<BookOpen size={18} className="text-indigo-400" />} 
              label="Romanlarım" 
              value={totalNovels.toString()} 
              raw={`${totalNovels} Roman`}
              bgColor="bg-indigo-500/10 border-indigo-500/20"
            />
            <StatCard 
              icon={<Images size={18} className="text-emerald-400" />} 
              label="Webtoonlarım" 
              value={totalWebtoons.toString()} 
              raw={`${totalWebtoons} Webtoon`}
              bgColor="bg-emerald-500/10 border-emerald-500/20"
            />
          </div>

          {/* ── 2. En İyi Eserler & Yan Paneller ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Sol / Üst: En İyi Performans Gösterenler */}
            <div className="lg:col-span-2">
              <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-primary" size={19} />
                    <Typography variant="h3" className="font-bold text-base sm:text-lg">
                      En İyi Performans Gösterenler
                    </Typography>
                  </div>
                  <span className="text-[11px] font-semibold text-muted bg-muted/10 px-2.5 py-1 rounded-full">
                    Top {topStories.length}
                  </span>
                </div>
                
                {topStories.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-border/40 rounded-2xl bg-muted/5 text-muted text-xs sm:text-sm">
                    Henüz yayınlanmış bir eseriniz bulunmuyor.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {topStories.map((story, idx) => (
                      <div 
                        key={story.storyId} 
                        className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-background/50 hover:bg-card/70 border border-border/30 hover:border-primary/40 transition-all group"
                      >
                        {/* Sıralama Numarası */}
                        <div className="w-6 h-6 rounded-lg bg-card border border-border/50 flex items-center justify-center font-black text-xs text-muted/70 shrink-0">
                          {idx + 1}
                        </div>

                        {/* Kapak Görseli */}
                        <div className="w-10 h-14 sm:w-11 sm:h-15 rounded-xl overflow-hidden bg-muted/20 border border-border/40 shrink-0">
                          {story.coverImage ? (
                            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted/40">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>

                        {/* Detaylar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="font-bold text-xs sm:text-sm text-text truncate group-hover:text-primary transition-colors">
                              {story.title}
                            </h4>
                            <span className="px-1.5 py-0.2 text-[9px] font-black rounded bg-primary/10 text-primary uppercase shrink-0 border border-primary/20">
                              {story.format === 'webtoon' ? 'Webtoon' : 'Roman'}
                            </span>
                          </div>

                          {/* İstatistik Göstergeleri (Wrap ile mobilde asla taşmaz) */}
                          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-muted mt-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${story.status === 'ongoing' || story.status === 'completed' ? 'bg-emerald-400' : 'bg-muted'}`} />
                              <span className="text-[10px] text-muted">{story.status === 'ongoing' || story.status === 'completed' ? 'Yayında' : 'Taslak'}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-semibold text-text/80" title="Okunma">
                              <Eye size={13} className="text-primary shrink-0" />
                              <span>{formatCompact(story.stats.views || 0)}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-semibold text-text/80" title="Beğeni">
                              <Heart size={13} className="text-pink-400 shrink-0" />
                              <span>{formatCompact(story.stats.likes || 0)}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-semibold text-text/80" title="Yorum">
                              <MessageSquare size={13} className="text-sky-400 shrink-0" />
                              <span>{formatCompact(realCommentCounts[story.storyId] !== undefined ? realCommentCounts[story.storyId] : (story.stats.commentCount || 0))}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-semibold text-text/80" title="Puan">
                              <Star size={13} className="text-amber-400 shrink-0 fill-amber-400" />
                              <span>{story.stats.rating ? story.stats.rating.toFixed(1) : '0.0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sağ / Alt: Etkileşim & Özet Panelleri */}
            <div className="flex flex-col gap-4 sm:gap-5">
              
              {/* Ortalama Puan Vitrini */}
              <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 shadow-sm">
                  <Star size={24} className="fill-amber-400" />
                </div>
                <Typography variant="h2" className="text-3xl sm:text-4xl font-black mb-1 text-foreground">
                  {avgRating}
                </Typography>
                <Typography variant="body" className="text-xs text-muted font-medium mb-2">
                  Ortalama Eser Puanı
                </Typography>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted/15 text-muted">
                  {ratedStoriesCount > 0 ? `${ratedStoriesCount} eser oylandı` : 'Henüz oylama yok'}
                </span>
              </div>

              {/* Okuyucu Etkileşimi İpucu */}
              <div className="bg-gradient-to-br from-primary/15 via-card/50 to-primary/5 border border-primary/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <Typography variant="h3" className="font-bold text-sm sm:text-base text-text">
                    Okuyucu Etkileşimi
                  </Typography>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  İstatistikleriniz gerçek zamanlı olarak güncellenir. Okuyucu yorumlarına bölüm altından yanıt vererek sadık bir okur kitlesi oluşturabilirsiniz.
                </p>
                <div className="mt-3">
                  <Link
                    href="/studio/stats/reviews"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 text-xs font-bold border border-sky-500/20 transition-all active:scale-95"
                  >
                    <MessageSquare size={14} />
                    <span>Tüm Yorum ve İncelemeleri Yönet</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ── Yardımcı KPI Kart Bileşeni (Responsive & Dokunmatik Uyumlu) ──
function StatCard({ 
  icon, 
  label, 
  value, 
  raw, 
  bgColor,
  href
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  raw: string; 
  bgColor: string; 
  href?: string;
}) {
  const content = (
    <div 
      className={`p-3 sm:p-3.5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md flex items-center gap-2.5 sm:gap-3 shadow-2xs transition-all relative group ${
        href ? 'cursor-pointer hover:border-sky-500/50 hover:bg-card/90 hover:shadow-md active:scale-[0.98]' : 'hover:bg-card/80'
      }`}
      title={raw}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 ${bgColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] sm:text-[11px] text-muted font-medium block truncate leading-tight">
          {label}
        </span>
        <span className="text-base sm:text-lg font-black text-foreground block truncate leading-snug">
          {value}
        </span>
      </div>
      {href && (
        <ChevronRight 
          size={16} 
          className="text-muted/40 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" 
        />
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
