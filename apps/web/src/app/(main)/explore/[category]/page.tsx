"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, StoryCard, HorizontalStoryCard } from '@readixon/ui';
import { 
  getRecentStoriesPaginated, 
  getTopStoriesPaginated, 
  getRecommendedStories, 
  getCompletedStories, 
  getMostLikedStories,
  getRecentlyUpdatedStories,
  getTrendingDiscussions,
  getInteractiveStoriesPaginated,
  getShortStoriesPaginated,
  getChatStoriesPaginated,
  getEditorialReviews,
  getStoriesByIds,
  searchStories,
  MAIN_GENRES,
  POPULAR_TAGS,
  toggleStoryLike,
  generateStorySlug,
  useAuthStore
} from '@readixon/core';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Heart, 
  CheckCircle, 
  ArrowLeft, 
  RotateCcw,
  MessageCircle,
  Flame,
  Award,
  Gamepad2,
  Feather,
  MessageSquare,
  Compass,
  BookOpen
} from 'lucide-react';

interface CategoryConfigItem {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  queryKey: string;
  getStories: (limit: number, pageParam: any, userProfile?: any) => Promise<{ stories: any[]; lastDoc?: any }>;
}

const CATEGORY_CONFIG: Record<string, CategoryConfigItem> = {
  'recent': {
    title: 'Yeni Çıkanlar',
    subtitle: 'Platforma yeni eklenen, keşfedilmeyi bekleyen taze hikayeler.',
    icon: <Clock className="text-blue-500" size={32} />,
    queryKey: 'recent',
    getStories: (limit, pageParam) => getRecentStoriesPaginated(limit, pageParam)
  },
  'recently-updated': {
    title: 'Taze Çıkanlar',
    subtitle: 'Yazarlarından yepyeni bölümlerle güncellenen hikayeler.',
    icon: <RotateCcw className="text-primary" size={32} />,
    queryKey: 'recentlyUpdated',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null };
      const stories = await getRecentlyUpdatedStories(50);
      return { stories: stories || [], lastDoc: true };
    }
  },
  'top': {
    title: 'Haftanın En Çok Okunanları',
    subtitle: 'Bu hafta okurlarımızın elinden düşüremediği başyapıtlar.',
    icon: <TrendingUp className="text-orange-500" size={32} />,
    queryKey: 'top',
    getStories: (limit, pageParam) => getTopStoriesPaginated(limit, pageParam)
  },
  'recommended': {
    title: 'Sana Özel / Günün Trendleri',
    subtitle: 'Okuma geçmişiniz ve favori türlerinize göre özel seçilmiş hikayeler.',
    icon: <Sparkles className="text-yellow-400" size={32} />,
    queryKey: 'recommended',
    getStories: async (limit, pageParam, userProfile) => {
      if (pageParam) return { stories: [], lastDoc: null }; 
      const stories = await getRecommendedStories(userProfile?.preferredGenres, 50);
      return { stories: stories || [], lastDoc: true };
    }
  },
  'completed': {
    title: 'Kısa ve Öz (Tamamlanmış)',
    subtitle: 'Yeni bölüm beklemeden başından sonuna kadar tek solukta bitirebileceğiniz tamamlanmış eserler.',
    icon: <CheckCircle className="text-emerald-500" size={32} />,
    queryKey: 'completed',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null }; 
      const stories = await getCompletedStories(50);
      return { stories: stories || [], lastDoc: true };
    }
  },
  'most-liked': {
    title: 'Kalplerin Efendileri',
    subtitle: 'Okurlarımızdan en çok beğeni alan ve sevilen popüler hikayeler.',
    icon: <Heart className="text-pink-500" size={32} />,
    queryKey: 'mostLiked',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null }; 
      const stories = await getMostLikedStories(50);
      return { stories: stories || [], lastDoc: true };
    }
  },
  'trending': {
    title: 'Günün Trendleri',
    subtitle: 'Okurlarımızın şu an en çok etkileşime girdiği favori popüler hikayeler.',
    icon: <Flame className="text-orange-500" size={32} />,
    queryKey: 'trending',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null };
      const stories = await getMostLikedStories(50);
      return { stories: stories || [], lastDoc: true };
    }
  },
  'discussions': {
    title: 'Son Tartışılanlar',
    subtitle: 'Topluluğun şu an en çok konuştuğu, yorumlaştığı ve tartıştığı eserler.',
    icon: <MessageCircle className="text-primary" size={32} />,
    queryKey: 'discussions',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null };
      const stories = await getTrendingDiscussions(50);
      return { stories: stories || [], lastDoc: true };
    }
  },
  'editor-picks': {
    title: 'Editörün Seçimi',
    subtitle: 'Editörlerimiz tarafından özenle incelenmiş ve mutlaka okunması tavsiye edilen başyapıtlar.',
    icon: <Award className="text-amber-500" size={32} />,
    queryKey: 'editorPicks',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null };
      try {
        const reviews = await getEditorialReviews(50);
        if (!reviews || reviews.length === 0) return { stories: [], lastDoc: null };
        const storyIds = reviews.map((r: any) => r.storyId).filter(Boolean);
        const stories = await getStoriesByIds(storyIds);
        return { stories: stories.filter(s => s.status !== 'draft') || [], lastDoc: null };
      } catch (err) {
        console.error("Editor picks fetch error:", err);
        return { stories: [], lastDoc: null };
      }
    }
  },
  'interactive': {
    title: 'Kaderini Sen Seç: İnteraktif Hikayeler',
    subtitle: 'Kararlarınla dallanan kurgular, alternatif yollar ve çoklu sonlar! Hikayenin sonunu sen belirle.',
    icon: <Gamepad2 className="text-indigo-400" size={32} />,
    queryKey: 'interactive',
    getStories: (limit, pageParam) => getInteractiveStoriesPaginated(limit, pageParam)
  },
  'short-stories': {
    title: 'Tek Oturuşta Biten Kısa Hikayeler',
    subtitle: 'Zamanınız az mı? Tek bir bölümde tamamlanan, vurucu ve sürükleyici kısa romanlar.',
    icon: <Feather className="text-amber-400" size={32} />,
    queryKey: 'shortStories',
    getStories: (limit, pageParam) => getShortStoriesPaginated(limit, pageParam)
  },
  'chat-stories': {
    title: 'Mesaj Hikayeleri: Dokunarak Oku',
    subtitle: 'WhatsApp konuşması gibi akan, ekrana her dokunuşunda yeni bir mesajın belirdiği sohbet kurguları.',
    icon: <MessageSquare className="text-emerald-400" size={32} />,
    queryKey: 'chatStories',
    getStories: (limit, pageParam) => getChatStoriesPaginated(limit, pageParam)
  },
  'all': {
    title: 'Tüm Hikayeler & Kitap Kataloğu',
    subtitle: 'Readixon\'daki tüm orijinal kurguları, romanları ve serileri keşfedin.',
    icon: <Compass className="text-primary" size={32} />,
    queryKey: 'all',
    getStories: (limit, pageParam) => getRecentStoriesPaginated(limit, pageParam)
  }
};

export default function ExploreCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = (params.category as string) || '';

  const config = useMemo(() => {
    if (CATEGORY_CONFIG[category]) return CATEGORY_CONFIG[category];

    // 1. Ana tür kontrolü (MAIN_GENRES)
    const genre = MAIN_GENRES.find(
      g => g.id.toLowerCase() === category.toLowerCase() || 
           g.name.toLowerCase() === category.toLowerCase()
    );
    if (genre) {
      return {
        title: `${genre.name} Hikayeleri`,
        subtitle: genre.description || `${genre.name} türündeki en sürükleyici ve popüler eserler.`,
        icon: <BookOpen className="text-primary" size={32} />,
        queryKey: `genre_${genre.id}`,
        getStories: async (limitCount: number, pageParam: any) => {
          if (pageParam) return { stories: [], lastDoc: null };
          const result = await searchStories('', [], 50, genre.id);
          return { stories: result || [], lastDoc: null };
        }
      };
    }

    // 2. Popüler etiket kontrolü (POPULAR_TAGS)
    const tag = POPULAR_TAGS.find(
      t => t.id.toLowerCase() === category.toLowerCase() || 
           t.label.toLowerCase() === category.toLowerCase()
    );
    if (tag) {
      return {
        title: `${tag.label} Hikayeleri`,
        subtitle: `${tag.label} temalı en taze ve popüler kurguları keşfedin.`,
        icon: <Sparkles className="text-primary" size={32} />,
        queryKey: `tag_${tag.id}`,
        getStories: async (limitCount: number, pageParam: any) => {
          if (pageParam) return { stories: [], lastDoc: null };
          const result = await searchStories('', [tag.id], 50);
          return { stories: result || [], lastDoc: null };
        }
      };
    }

    return null;
  }, [category]);
  
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile } = useAuthStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sayfa ilk yüklendiğinde veya kategori değiştiğinde daima en tepeye kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [category]);

  const { 
    data, 
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: ['explore', config?.queryKey || category],
    queryFn: ({ pageParam }) => config ? config.getStories(20, pageParam, userProfile) : Promise.resolve({ stories: [], lastDoc: null }),
    getNextPageParam: (lastPage: any) => lastPage?.lastDoc || null,
    initialPageParam: null as any,
    enabled: !!config
  });

  const stories = data?.pages.flatMap((p: any) => p.stories) || [];

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLikePress = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    const nowLiked = await toggleStoryLike(storyId, firebaseUser.uid);
    const likeDelta = nowLiked ? 1 : -1;
    
    if (config) {
      queryClient.setQueryData(['explore', config.queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            stories: page.stories.map((s: any) =>
              s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
            )
          }))
        };
      });
    }
  };

  if (!config) {
    return (
      <div className="w-full min-h-screen bg-background pb-20 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-muted mb-4 shadow-inner">
          <Compass size={32} className="text-muted/60" />
        </div>
        <Typography variant="h2" className="text-xl sm:text-2xl font-bold mb-2">
          Kategori bulunamadı
        </Typography>
        <p className="text-muted text-sm max-w-md mb-6 leading-relaxed">
          Aradığınız vitrin veya tür kategorisi mevcut değil ya da kaldırılmış olabilir.
        </p>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/feed')} 
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Keşfete Dön
          </button>
          <button 
            onClick={() => router.push('/search')} 
            className="px-5 py-2.5 rounded-full bg-card hover:bg-card/80 border border-border/80 text-text font-bold text-xs transition-all cursor-pointer"
          >
            Arama Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/50 px-6 py-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-card transition-colors text-muted hover:text-text cursor-pointer shrink-0"
            title="Geri Dön"
            aria-label="Geri Dön"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="shrink-0">{config.icon}</div>
          <div className="min-w-0">
            <Typography variant="h2" className="font-extrabold text-xl sm:text-2xl md:text-3xl leading-tight truncate">
              {config.title}
            </Typography>
            {config.subtitle && (
              <p className="text-muted text-xs sm:text-sm mt-0.5 line-clamp-1">
                {config.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          /* Boş Kategori Durumu (Empty State) */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-muted mb-4 shadow-inner">
              <Compass size={32} className="text-muted/60" />
            </div>
            <Typography variant="h3" className="font-extrabold text-lg sm:text-xl mb-1.5 text-text">
              Bu vitrinde henüz eser bulunmuyor
            </Typography>
            <p className="text-muted text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
              Yazarlarımız bu kategoriye henüz yeni bir eser eklemedi veya kurgular güncelleniyor.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/feed')}
                className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Keşfete Dön
              </button>
              <button
                onClick={() => router.push('/search')}
                className="px-5 py-2.5 rounded-full bg-card hover:bg-card/80 border border-border/80 text-text font-bold text-xs transition-all cursor-pointer"
              >
                Filtreli Arama Yap
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={
              config.queryKey === 'recentlyUpdated' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            }>
              {stories.map((story) => (
                <div key={story.storyId} className="w-full transition-transform duration-300 hover:-translate-y-2">
                  {config.queryKey === 'recentlyUpdated' ? (
                    <HorizontalStoryCard
                      title={story.title}
                      authorName={story.authorName || 'Bilinmiyor'}
                      authorUsername={story.authorUsername} 
                      authorAvatarUrl={story.authorAvatarUrl}
                      coverImage={story.coverImage}
                      views={story.stats?.views || 0}
                      likes={story.stats?.likes || 0}
                      latestChapterTitle={story.latestChapter?.title}
                      latestChapterExcerpt={story.latestChapter?.excerpt}
                      badgeText={story.latestChapter?.order ? `${story.latestChapter.order}. Bölüm Yayında` : 'Yeni Güncellendi'}
                      onPress={() => {
                        const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                        router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                      }}
                    />
                  ) : (
                    <StoryCard
                      title={story.title}
                      authorName={story.authorName || 'Bilinmiyor'}
                      authorUsername={story.authorUsername} 
                      authorAvatarUrl={story.authorAvatarUrl}
                      coverImage={story.coverImage}
                      views={story.stats?.views || 0}
                      likes={story.stats?.likes || 0}
                      tags={story.tags || []}
                      isWebtoon={story.format === 'webtoon'}
                      onPress={() => {
                        const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                        router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                      }}
                      onLikePress={(e) => handleLikePress(e, story.storyId)}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="w-full py-12 flex justify-center items-center">
              {isFetchingNextPage && (
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
              {!hasNextPage && stories.length > 0 && (
                <Typography variant="caption" className="text-muted">Daha fazla hikaye yok.</Typography>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
