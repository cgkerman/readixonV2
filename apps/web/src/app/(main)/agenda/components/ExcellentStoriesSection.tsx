'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import { useQuery } from '@tanstack/react-query';
import {
  getEditorialReviews,
  getStoriesByIds,
  generateStorySlug,
  type EditorialReview,
  type Story
} from '@readixon/core';
import {
  Award,
  Star,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Calendar,
  ExternalLink
} from 'lucide-react';

function calculateOverallScore(scores?: EditorialReview['scores']): number | null {
  if (!scores) return null;
  const values = Object.values(scores).map(v => Number(v) || 0).filter(v => v > 0);
  if (values.length === 0) return null;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / values.length).toFixed(1));
}

function getScoreBadgeInfo(score: number | null) {
  if (score === null) {
    return {
      text: 'İncelendi',
      bg: 'bg-primary/10 text-primary border-primary/20',
    };
  }
  if (score >= 9.0) {
    return {
      text: 'Kusursuz Başyapıt',
      bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    };
  }
  if (score >= 8.0) {
    return {
      text: 'Şiddetle Tavsiye',
      bg: 'bg-primary/10 text-primary border-primary/30',
    };
  }
  return {
    text: 'Öne Çıkan Eser',
    bg: 'bg-card/80 text-muted border-border/50',
  };
}

export const ExcellentStoriesSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [storiesMap, setStoriesMap] = useState<Record<string, Story>>({});

  // Yalnızca gerçek Firestore değerlendirmelerini çek (Sahte/mock veri kesinlikle yok)
  const { data: reviews = [], isLoading } = useQuery<EditorialReview[]>({
    queryKey: ['agenda', 'excellent_reviewed_stories'],
    queryFn: async () => {
      try {
        const allReviews = await getEditorialReviews(30);
        if (!allReviews || allReviews.length === 0) return [];

        // Yalnızca 8.0 ve üzeri skora ulaşmış "Üstün Nitelikli Eserler" seviyesini filtrele
        const qualified = allReviews.filter((r) => {
          const score = calculateOverallScore(r.scores);
          return score !== null && score >= 8.0;
        });

        // Puana göre azalan sırada sırala (En yüksek puanlı başyapıtlar önde)
        qualified.sort((a, b) => {
          const scoreA = calculateOverallScore(a.scores) || 0;
          const scoreB = calculateOverallScore(b.scores) || 0;
          return scoreB - scoreA;
        });

        // İlgili hikayelerin detay ve slug bilgilerini çek
        const storyIds = Array.from(new Set(qualified.map(r => r.storyId).filter(Boolean)));
        if (storyIds.length > 0) {
          try {
            const stories = await getStoriesByIds(storyIds);
            const map: Record<string, Story> = {};
            stories.forEach(s => {
              if (s.storyId) map[s.storyId] = s;
            });
            setStoriesMap(map);
          } catch (storyErr) {
            console.error('Excellent stories getStoriesByIds error:', storyErr);
          }
        }

        return qualified;
      } catch (err) {
        console.error('Excellent stories fetch error:', err);
        return [];
      }
    },
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowRightArrow(scrollWidth > clientWidth + 20);
    }
  }, [reviews]);

  // Eğer gerçek veri yoksa veya henüz yüklenmediyse render etme (sahte veri basılmaz)
  if (isLoading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="w-full relative">
      {/* Başlık ve Gezinme Linki */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-primary/15 to-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/5 group-hover:scale-110 group-hover:border-amber-400 transition-all duration-300">
            <Award size={24} className="text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Typography variant="h3" className="font-extrabold text-xl sm:text-2xl text-text">
                Üstün Nitelikli Eserler
              </Typography>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30 text-amber-500 shadow-sm">
                <Star size={11} className="fill-amber-500 text-amber-500" />
                <span>8.0+ Readixon Gold</span>
              </span>
            </div>
            <Typography variant="caption" className="text-muted text-xs sm:text-sm">
              Editörlerimizin 8 temel edebi kritere göre incelediği ve en yüksek puanı alan başyapıtlar.
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Link
            href="/reviews"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span>Tüm Değerlendirmeleri Gör</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {reviews.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!showLeftArrow}
                aria-label="Önceki Eserler"
                className="w-8 h-8 rounded-xl bg-card border border-border/60 hover:border-primary/50 text-text hover:text-primary flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!showRightArrow}
                aria-label="Sonraki Eserler"
                className="w-8 h-8 rounded-xl bg-card border border-border/60 hover:border-primary/50 text-text hover:text-primary flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kaydırmalı / Carousel Konteyner */}
      <div className="relative group/carousel">
        {/* Masaüstü Sol Ok Butonu */}
        {showLeftArrow && reviews.length > 1 && (
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Önceki"
            className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-card/90 backdrop-blur-md border border-border/60 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Masaüstü Sağ Ok Butonu */}
        {showRightArrow && reviews.length > 1 && (
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Sonraki"
            className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-card/90 backdrop-blur-md border border-border/60 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Yatay Kaydırma Şeridi */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {reviews.map((review) => {
            const overallScore = calculateOverallScore(review.scores);
            const badgeInfo = getScoreBadgeInfo(overallScore);
            const cardStory = storiesMap[review.storyId];
            const cardAuthor = review.authorName || cardStory?.authorName;
            const cardStorySlug = (cardStory as any)?.slug || generateStorySlug(review.storyTitle || 'kitap', review.storyId);
            const formattedDate = review.createdAt?.seconds
              ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
              : (review.createdAt?.toMillis
                ? new Date(review.createdAt.toMillis()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                : '');

            return (
              <div
                key={review.id}
                className="w-[85vw] max-w-[340px] sm:w-[360px] md:w-[380px] shrink-0 snap-start flex flex-col"
              >
                {/* /reviews Sayfası ile Birebir Kart Yapısı */}
                <div className="h-full bg-card/40 hover:bg-card/80 border border-border/50 hover:border-amber-500/40 transition-all duration-300 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm group">
                  {/* Üst Bölüm: Kapak & Kitap Künyesi */}
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      {/* 2:3 En-Boy Oranlı Kitap Kapağı */}
                      <Link href={`/reviews/${review.id}`} className="shrink-0">
                        <div className="w-24 aspect-[2/3] bg-muted/20 rounded-xl overflow-hidden shadow-md relative group-hover:shadow-xl transition-all border border-border/30">
                          {review.storyCover ? (
                            <img
                              src={review.storyCover}
                              alt={review.storyTitle || 'Kitap Kapağı'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <BookOpen size={24} />
                            </div>
                          )}
                          <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                      </Link>

                      {/* Başlık, Skor & Yazar/Editör Bilgisi */}
                      <div className="flex-1 min-w-0">
                        {/* Genel Skor Rozeti */}
                        {overallScore !== null && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black mb-2 shadow-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                            <Star size={11} className="fill-black" />
                            <span>{overallScore} / 10</span>
                          </div>
                        )}

                        <Link href={`/reviews/${review.id}`}>
                          <h3 className="font-extrabold text-lg text-text group-hover:text-primary transition-colors line-clamp-2 mb-1.5 leading-snug">
                            {review.storyTitle || 'İsimsiz Eser'}
                          </h3>
                        </Link>

                        {/* Yazar Bilgisi */}
                        {cardAuthor && (
                          <div className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
                            <PenTool size={11} className="text-primary shrink-0" />
                            <span className="truncate">Yazar: <strong className="text-text font-semibold">{cardAuthor}</strong></span>
                          </div>
                        )}

                        {/* Editör Bilgisi */}
                        <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                          <div className="w-4 h-4 rounded-full overflow-hidden bg-primary/20 shrink-0">
                            {review.editorAvatar ? (
                              <img src={review.editorAvatar} alt={review.editorName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-primary">
                                {review.editorName?.charAt(0) || 'E'}
                              </div>
                            )}
                          </div>
                          <span className="truncate">Editör: <strong className="text-primary font-semibold">{review.editorName}</strong></span>
                        </div>

                        {formattedDate && (
                          <div className="text-[11px] text-muted flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formattedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alıntı / Kısa Değerlendirme */}
                    <p className="text-xs sm:text-sm text-text/80 line-clamp-3 leading-relaxed mb-4">
                      {review.firstImpression || review.about}
                    </p>

                    {/* 4 Boyutlu Puanlama Kutucukları */}
                    {review.scores && (
                      <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-border/40 mb-4">
                        <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                          <span className="text-muted">Hikâye:</span>
                          <span className="font-bold text-text">{review.scores.storyStructure || 0}/10</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                          <span className="text-muted">Karakter:</span>
                          <span className="font-bold text-text">{review.scores.characters || 0}/10</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                          <span className="text-muted">Dil:</span>
                          <span className="font-bold text-text">{review.scores.languageAndStyle || 0}/10</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                          <span className="text-muted">Özgünlük:</span>
                          <span className="font-bold text-text">{review.scores.originality || 0}/10</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kart Alt Aksiyonları */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeInfo.bg} truncate max-w-[120px]`}>
                      {badgeInfo.text}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/story/${cardStorySlug}`}
                        title="Kitap Sayfasına Git"
                        className="p-1.5 rounded-lg bg-background hover:bg-muted/20 border border-border/50 text-muted hover:text-text transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>

                      <Link
                        href={`/reviews/${review.id}`}
                        className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                      >
                        <span>İnceleme</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
