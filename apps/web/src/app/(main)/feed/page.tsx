"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, StoryCard, Button, HorizontalStoryCard } from '@readixon/ui';
import { 
  getRecentStoriesPaginated, 
  getTopStoriesPaginated, 
  getFeaturedAuthors, 
  getAdvancedPersonalizedStories, 
  getCompletedStories, 
  getMostLikedStories, 
  getRecentlyUpdatedStories, 
  getActiveAnnouncements, 
  getActiveHeroBanners, 
  getUserReadingProgress, 
  getStoriesByIds, 
  getTrendingDiscussions, 
  getWebtoonsPaginated, 
  getInteractiveStoriesPaginated,
  getShortStoriesPaginated,
  getChatStoriesPaginated,
  getEditorialReviews, 
  getPublicUniverses,
  getPublicSeries,
  POPULAR_TAGS, 
  MAIN_GENRES,
  getMainGenreName,
  getMainGenreById,
  type MainGenreItem,
  generateStorySlug, 
  toggleStoryLike, 
  followUser, 
  unfollowUser, 
  useAuthStore, 
  sanitizeHtml, 
  type Story, 
  type User, 
  type Announcement,
  type Universe,
  type Series
} from '@readixon/core';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Flame, Sparkles, TrendingUp, Clock, ChevronRight, ChevronLeft, ChevronDown, Play, Users, Heart, CheckCircle, BellRing, BookOpen, MessageCircle, RotateCcw, Gem, Award, GalleryVertical,
  Rocket, Wand2, Eye, Ghost, Compass, ShieldAlert, Smile, Feather, Swords, Theater, Laugh, Moon, Skull, Brain, PenTool, Zap, Hourglass,
  GraduationCap, Coffee, Cpu, Crown, Fingerprint, FileText, Globe, Layers, Gamepad2, MessageSquare
} from 'lucide-react';
import { AuthorCard } from '@readixon/ui';
import { toast } from "sonner";
import { AppDownloadBanner } from '@/components/AppDownloadBanner';
import { UniverseCard } from '@/components/UniverseCard';
import { SeriesCard } from '@/components/SeriesCard';
import { SiteFooter } from '@/components/SiteFooter';
import { getGenreIcon } from '@/components/story/genreIcons';

// Tür ikonları eşleştirmesi (Tüm kategoriler için özel ikonlar)
const TAG_ICONS: Record<string, React.ElementType> = {
  'webtoon': GalleryVertical,
  'fantasy': Wand2,
  'sci-fi': Rocket,
  'action': Swords,
  'romance': Heart,
  'isekai': RotateCcw,
  'system': Cpu,
  'martial-arts': Flame,
  'thriller': Zap,
  'mystery': Eye,
  'adventure': Compass,
  'supernatural': Moon,
  'dark-fantasy': Skull,
  'horror': Ghost,
  'dystopian': ShieldAlert,
  'cyberpunk': Cpu,
  'post-apocalyptic': ShieldAlert,
  'mythology': Crown,
  'crime': Fingerprint,
  'drama': Theater,
  'comedy': Laugh,
  'young-adult': Smile,
  'school': GraduationCap,
  'slice-of-life': Coffee,
  'psychological': Brain,
  'historical': Hourglass,
  'literary-fiction': Feather,
  'fanfiction': FileText,
  'paranormal': Sparkles,
  'vampire': Skull,
  'short-story': BookOpen,
  'poetry': PenTool,
  'adult': Flame,
};

export default function FeedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile, followingIds, toggleFollowingId } = useAuthStore();

  // Veri çekimi - Infinite Query ile
  const {
    data: recentData,
    isLoading: recentLoading,
    fetchNextPage: fetchNextRecent,
    hasNextPage: hasNextRecent
  } = useInfiniteQuery({
    queryKey: ['stories', 'recent'],
    queryFn: ({ pageParam }) => getRecentStoriesPaginated(10, pageParam as any),
    getNextPageParam: (lastPage: any) => lastPage.lastDoc || null,
    initialPageParam: null as any
  });

  const {
    data: topData,
    isLoading: topLoading,
    fetchNextPage: fetchNextTop,
    hasNextPage: hasNextTop
  } = useInfiniteQuery({
    queryKey: ['stories', 'top'],
    queryFn: ({ pageParam }) => getTopStoriesPaginated(10, pageParam as any),
    getNextPageParam: (lastPage: any) => lastPage.lastDoc || null,
    initialPageParam: null as any
  });

  const { data: featuredAuthors = [], isLoading: authorsLoading } = useQuery({
    queryKey: ['authors', 'featured'],
    queryFn: () => getFeaturedAuthors(10),
  });

  const { data: recommendedStories = [], isLoading: recLoading } = useQuery({
    queryKey: ['stories', 'recommended', userProfile?.uid],
    queryFn: () => getAdvancedPersonalizedStories(firebaseUser?.uid, userProfile?.preferredGenres, 10),
  });

  const { data: completedStories = [], isLoading: compLoading } = useQuery({
    queryKey: ['stories', 'completed'],
    queryFn: () => getCompletedStories(10),
  });

  const { data: mostLikedStories = [], isLoading: likedLoading } = useQuery({
    queryKey: ['stories', 'mostLiked'],
    queryFn: () => getMostLikedStories(10),
  });

  const { data: webtoonsData, isLoading: webtoonsLoading } = useQuery({
    queryKey: ['stories', 'webtoons', 'feed'],
    queryFn: () => getWebtoonsPaginated(10),
  });
  const webtoons = webtoonsData?.stories || [];

  const { data: interactiveData, isLoading: interactiveLoading } = useQuery({
    queryKey: ['stories', 'interactive', 'feed'],
    queryFn: () => getInteractiveStoriesPaginated(10),
  });
  const interactiveStories = interactiveData?.stories || [];

  const { data: shortStoriesData, isLoading: shortStoriesLoading } = useQuery({
    queryKey: ['stories', 'short_story', 'feed'],
    queryFn: () => getShortStoriesPaginated(10),
  });
  const shortStories = shortStoriesData?.stories || [];

  const { data: chatStoriesData, isLoading: chatStoriesLoading } = useQuery({
    queryKey: ['stories', 'chat', 'feed'],
    queryFn: () => getChatStoriesPaginated(10),
  });
  const chatStories = chatStoriesData?.stories || [];

  const { data: recentlyUpdatedStories = [], isLoading: recentlyUpdatedLoading } = useQuery({
    queryKey: ['stories', 'recentlyUpdated'],
    queryFn: () => getRecentlyUpdatedStories(10),
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: () => getActiveAnnouncements(3),
  });

  const { data: heroBanners = [], isLoading: heroBannersLoading } = useQuery({
    queryKey: ['hero_banners', 'active'],
    queryFn: () => getActiveHeroBanners(),
  });

  const { data: readingHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['stories', 'readingProgress', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser?.uid) return [];
      const history = await getUserReadingProgress(firebaseUser.uid);
      if (!history || history.length === 0) return [];

      const storyIds = history.map(h => h.storyId);
      const stories = await getStoriesByIds(storyIds);

      // Hikayeleri bul ve ilerlemeyi eşleştir (Sadece yayınlanmış olan romanları göster)
      return history.map(h => {
        const story = stories.find(s => s.storyId === h.storyId && s.status !== 'draft' && s.format !== 'webtoon');
        return story ? { story, progress: h.scrollPercentage || 0, chapterId: h.currentChapterId } : null;
      }).filter(Boolean) as { story: Story; progress: number; chapterId: string }[];
    },
    enabled: !!firebaseUser?.uid
  });

  const { data: trendingDiscussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['stories', 'trendingDiscussions'],
    queryFn: () => getTrendingDiscussions(10),
  });

  const { data: editorPicks = [], isLoading: editorPicksLoading } = useQuery({
    queryKey: ['stories', 'editorPicks'],
    queryFn: async () => {
      const reviews = await getEditorialReviews(10);
      if (!reviews || reviews.length === 0) return [];
      const storyIds = reviews.map((r: any) => r.storyId);
      const stories = await getStoriesByIds(storyIds);
      return stories.filter(s => s.status !== 'draft');
    }
  });

  // Kurgusal Evrenler & Kitap Serileri (PRD Bölüm 39 & Seri Kitap Faz 4)
  const { data: publicUniverses = [] } = useQuery({
    queryKey: ['universes', 'public', 'feed'],
    queryFn: () => getPublicUniverses(10),
  });

  const { data: publicSeries = [] } = useQuery({
    queryKey: ['series', 'public', 'feed'],
    queryFn: () => getPublicSeries(10),
  });

  const recentStories = recentData?.pages.flatMap((p: any) => p.stories) || [];
  const topStories = topData?.pages.flatMap((p: any) => p.stories) || [];

  // Veriler sayfayı kilitlemeden aşamalı (progressive) olarak yüklenir

  // Öne Çıkan Slaytlar (Carousel Verisi)
  const slides = useMemo(() => {
    const arr: any[] = [];

    // Dinamik Manşetler (Admin panelinden eklenenler)
    heroBanners.forEach(banner => {
      arr.push({
        id: `slide-banner-${banner.id}`,
        type: 'announcement',
        badge: banner.badge,
        badgeIcon: Sparkles, // Standart ikon
        title: banner.title,
        summary: banner.summary,
        image: banner.imageUrl,
        primaryLabel: banner.primaryLabel,
        primaryAction: () => {
          if (banner.primaryLink?.startsWith('http')) {
            window.open(banner.primaryLink, '_blank');
          } else if (banner.primaryLink) {
            router.push(banner.primaryLink);
          }
        },
      });
    });

    if (topStories.length > 0) {
      arr.push({
        id: `slide-top-${topStories[0].storyId}`,
        type: 'story',
        badge: 'Günün Öne Çıkanı',
        badgeIcon: Sparkles,
        title: topStories[0].title,
        summary: topStories[0].summary,
        image: topStories[0].coverImage,
        primaryLabel: 'Hemen Oku',
        primaryAction: () => router.push(`/read/${topStories[0].storyId}`),
        secondaryLabel: 'Detaylar',
        secondaryAction: () => {
          const slug = (topStories[0] as any).slug || generateStorySlug(topStories[0].title, topStories[0].storyId);
          router.push(topStories[0].format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
        }
      });
    }
    if (mostLikedStories.length > 0 && mostLikedStories[0].storyId !== topStories[0]?.storyId) {
      arr.push({
        id: `slide-liked-${mostLikedStories[0].storyId}`,
        type: 'story',
        badge: 'En Çok Beğenilen',
        badgeIcon: Heart,
        title: mostLikedStories[0].title,
        summary: mostLikedStories[0].summary,
        image: mostLikedStories[0].coverImage,
        primaryLabel: 'Hemen Oku',
        primaryAction: () => router.push(`/read/${mostLikedStories[0].storyId}`),
        secondaryLabel: 'Detaylar',
        secondaryAction: () => {
          const slug = (mostLikedStories[0] as any).slug || generateStorySlug(mostLikedStories[0].title, mostLikedStories[0].storyId);
          router.push(mostLikedStories[0].format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
        }
      });
    }
    if (topStories.length > 1) {
      arr.push({
        id: `slide-week-${topStories[1].storyId}`,
        type: 'story',
        badge: 'Haftanın En İyisi',
        badgeIcon: Flame,
        title: topStories[1].title,
        summary: topStories[1].summary,
        image: topStories[1].coverImage,
        primaryLabel: 'Hemen Oku',
        primaryAction: () => router.push(`/read/${topStories[1].storyId}`),
        secondaryLabel: 'Detaylar',
        secondaryAction: () => {
          const slug = (topStories[1] as any).slug || generateStorySlug(topStories[1].title, topStories[1].storyId);
          router.push(topStories[1].format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
        }
      });
    }
    if (featuredAuthors.length > 0) {
      const author = featuredAuthors[0];
      arr.push({
        id: `slide-author-${author.uid}`,
        type: 'author',
        badge: 'En Sevilen Yazar',
        badgeIcon: Users,
        title: author.displayName || 'Bilinmeyen Yazar',
        summary: author.bio || 'Muhteşem hikayeleriyle platformda fırtınalar estiriyor. Yazarın tüm eserlerini keşfetmek için profiline göz atın!',
        image: author.avatarUrl,
        primaryLabel: 'Profile Git',
        primaryAction: () => router.push(`/profile/@${author.username || author.uid}`)
      });
    }
    return arr;
  }, [topStories, mostLikedStories, featuredAuthors, heroBanners, router]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  // Dokunmatik Swipe (Kaydırma) Desteği
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);

  // Genel akış için 30 Ana Tür (Yeni Taksonomi)
  const feedCategories = MAIN_GENRES;

  const handleNextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 1) {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchMoveX(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 1) {
      setTouchMoveX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchMoveX === null) return;
    const distance = touchStartX - touchMoveX;
    const minSwipeDistance = 45; // 45px eşik değeri
    if (distance > minSwipeDistance) {
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide();
    }
    setTouchStartX(null);
    setTouchMoveX(null);
  };

  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const announcementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slides.length <= 1 || isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 saniyede bir dön, mouse üzerindeyse duraksar
    return () => clearInterval(interval);
  }, [slides.length, isHeroHovered]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => {
        const next = (prev + 1) % announcements.length;
        if (announcementsRef.current) {
          const el = announcementsRef.current;
          el.scrollTo({
            left: next * (el.scrollWidth / announcements.length),
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 10000); // 10 saniyede bir dön
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Pull-to-refresh listener
  useEffect(() => {
    const handlePullRefresh = () => {
      queryClient.resetQueries({ queryKey: ['stories', 'recent'] });
      queryClient.resetQueries({ queryKey: ['stories', 'top'] });
      queryClient.refetchQueries({ type: 'active' });
    };
    window.addEventListener('readixon:refresh', handlePullRefresh);
    return () => window.removeEventListener('readixon:refresh', handlePullRefresh);
  }, [queryClient]);

  const activeSlide = slides[currentSlideIndex] || null;

  const handleLikePress = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    try {
      const nowLiked = await toggleStoryLike(storyId, firebaseUser.uid);
      const likeDelta = nowLiked ? 1 : -1;

      // Update cache optimistically for infinite query structure
      queryClient.setQueryData(['stories', 'recent'], (oldData: any) => {
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
      queryClient.setQueryData(['stories', 'top'], (oldData: any) => {
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

      // Update regular array caches (recommended, mostLiked, completed)
      const updateArrayCache = (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((s: any) =>
          s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
        );
      };

      queryClient.setQueryData(['stories', 'recommended', userProfile?.uid], updateArrayCache);
      queryClient.setQueryData(['stories', 'completed'], updateArrayCache);
      queryClient.setQueryData(['stories', 'mostLiked'], updateArrayCache);
    } catch (error) {
      console.error("Beğeni hatası:", error);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent, targetUserId: string) => {
    e.stopPropagation();
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    const isCurrentlyFollowing = followingIds.includes(targetUserId);

    // Optimistic update
    toggleFollowingId(targetUserId);

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(firebaseUser.uid, targetUserId);
      } else {
        await followUser(firebaseUser.uid, targetUserId);
      }
    } catch (error) {
      console.error("Takip işlemi başarısız:", error);
      // Revert on error
      toggleFollowingId(targetUserId);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-10 bg-background overflow-x-hidden">

      {/* ── 1. Hero Showcase (Lüks & Sinematik Carousel) ── */}
      <section className="relative w-full px-4 sm:px-6 md:px-16 pt-2 sm:pt-3 md:pt-6 mb-8 md:mb-12">
        <div
          className="relative w-full rounded-3xl overflow-hidden border border-border/70 bg-card/60 backdrop-blur-2xl shadow-2xl transition-all duration-500 group touch-pan-y"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Ambient Arka Plan Görseli & Sinematik Gradyan Perdesi */}
          {activeSlide?.image ? (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                key={`bg-${activeSlide.id}`}
                src={activeSlide.image}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover opacity-35 dark:opacity-25 blur-2xl md:blur-3xl scale-110 md:scale-125 transition-all duration-1000"
              />
              {/* Mobil için alttan & üstten sinematik karartma perdeleri */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/95 dark:from-background/60 dark:to-background/95" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/60 to-transparent dark:from-background dark:via-background/80" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-card/90 via-card/60 to-transparent dark:from-background dark:via-background/70" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card/50 to-card/90 dark:via-background/50 dark:to-background/90" />
          )}

          {/* ─────────────────────────────────────────────────────────────
              DESKTOP LAYOUT (>= 768px): Sabit Yükseklikli İki Kolonlu Sahne
              ───────────────────────────────────────────────────────────── */}
          <div className="hidden md:flex relative z-10 p-8 md:p-10 lg:p-12 flex-row items-center justify-between gap-8 lg:gap-14 h-[390px] md:h-[410px] overflow-hidden">
            {/* Sol: Metinler & Aksiyon Butonları */}
            <div className="flex-1 flex flex-col justify-center items-start text-left max-w-2xl h-full py-1">
              <div className="h-7 flex items-center gap-2.5 mb-2.5 flex-wrap shrink-0">
                {activeSlide?.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25 shadow-sm">
                    {activeSlide.badgeIcon && <activeSlide.badgeIcon size={13} className="shrink-0" />}
                    <span>{activeSlide.badge}</span>
                  </span>
                )}
                {activeSlide?.type === 'story' && (
                  <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Öne Çıkan Eser
                  </span>
                )}
              </div>

              <div className="h-[74px] lg:h-[82px] flex items-center mb-2 overflow-hidden">
                <Typography
                  variant="h1"
                  className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-text tracking-tight leading-[1.2] line-clamp-2 drop-shadow-sm"
                >
                  {activeSlide?.title || "Okunmaya Değer Başyapıtlar"}
                </Typography>
              </div>

              <div className="h-[52px] mb-5 overflow-hidden">
                <Typography
                  variant="body"
                  className="text-xs md:text-sm lg:text-base text-muted/90 leading-relaxed line-clamp-2 max-w-xl"
                >
                  {activeSlide?.summary || "Farklı dünyalara yelken açmak ve yeni serüvenlere atılmak için binlerce hikaye arasından sizin için seçtiklerimizi keşfedin."}
                </Typography>
              </div>

              <div className="h-12 flex items-center gap-3 shrink-0">
                {activeSlide?.primaryLabel && (
                  <Button
                    variant="primary"
                    className="rounded-full px-6 py-2.5 h-11 text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    onPress={activeSlide.primaryAction}
                  >
                    {activeSlide.type === 'story' && <Play size={15} className="fill-current" />}
                    <span>{activeSlide.primaryLabel}</span>
                  </Button>
                )}
                {activeSlide?.secondaryLabel && (
                  <Button
                    variant="secondary"
                    className="rounded-full px-5 py-2.5 h-11 text-sm font-medium bg-background/50 hover:bg-background/80 text-text border border-border/80 backdrop-blur-md hover:-translate-y-0.5 transition-all"
                    onPress={activeSlide.secondaryAction}
                  >
                    <span>{activeSlide.secondaryLabel}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Sağ: 3D Taşan / Gölgeli Kapak (Sabit Boyutlu Konteynır) */}
            <div className="shrink-0 flex items-center justify-center h-full w-52 lg:w-60">
              <div
                className={`relative group/cover transform hover:scale-[1.02] transition-transform duration-500 shadow-[0_22px_45px_-10px_rgba(0,0,0,0.45)] border border-border/50 overflow-hidden flex items-center justify-center ${
                  activeSlide?.type === 'author'
                    ? 'w-48 h-48 lg:w-52 lg:h-52 rounded-full ring-4 ring-primary/20'
                    : activeSlide?.type === 'announcement'
                      ? 'w-48 h-48 lg:w-56 lg:h-56 rounded-2xl'
                      : 'h-[270px] lg:h-[290px] aspect-[2/3] rounded-2xl'
                }`}
              >
                {activeSlide?.image ? (
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <Typography variant="body" className="text-muted/50 text-xs">Görsel Yok</Typography>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              MOBILE LAYOUT (< 768px): Sinematik Poster & Vitrin (Webtoon / Netflix Stili)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex md:hidden relative z-10 flex-col justify-between h-[385px] sm:h-[415px] p-4.5 sm:p-5 pb-6 select-none overflow-hidden">
            {/* Üst Kısım: Rozet (Sol) & Slayt Sayacı (Sağ) */}
            <div className="flex items-center justify-between w-full z-10">
              {activeSlide?.badge ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-background/80 dark:bg-card/85 text-primary border border-primary/25 backdrop-blur-md shadow-sm">
                  {activeSlide.badgeIcon && <activeSlide.badgeIcon size={12} className="shrink-0 text-primary" />}
                  <span className="truncate max-w-[190px]">{activeSlide.badge}</span>
                </span>
              ) : (
                <div />
              )}
              {slides.length > 1 && (
                <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-background/70 dark:bg-card/75 text-text/80 backdrop-blur-md border border-border/60 shadow-sm">
                  {currentSlideIndex + 1} / {slides.length}
                </span>
              )}
            </div>

            {/* Orta Kısım: 3D Derinlikli Öne Çıkan Görsel (Story / Author / Banner) */}
            <div className="my-auto py-1 flex items-center justify-center z-10">
              {activeSlide?.type === 'author' ? (
                <div className="relative group cursor-pointer" onClick={activeSlide.primaryAction}>
                  <div className="absolute -inset-2 bg-primary/25 rounded-full blur-xl opacity-75" />
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-primary/40 overflow-hidden shadow-2xl border-2 border-primary/40">
                    {activeSlide.image ? (
                      <img
                        key={`img-${activeSlide.id}`}
                        src={activeSlide.image}
                        alt={activeSlide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/20 flex items-center justify-center text-xs text-muted">Avatar</div>
                    )}
                  </div>
                </div>
              ) : activeSlide?.type === 'announcement' ? (
                <div className="relative group cursor-pointer" onClick={activeSlide.primaryAction}>
                  <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl opacity-60" />
                  <div className="relative w-44 sm:w-52 h-28 sm:h-32 rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                    {activeSlide.image ? (
                      <img
                        key={`img-${activeSlide.id}`}
                        src={activeSlide.image}
                        alt={activeSlide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/20 flex items-center justify-center text-xs text-muted">Duyuru</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative group cursor-pointer" onClick={activeSlide?.primaryAction}>
                  {/* Kapak arkası renkli ortam ışıması */}
                  <div className="absolute -inset-2 bg-primary/30 rounded-2xl blur-xl opacity-70 transform scale-95" />
                  {/* 3D Hafif Açılı Kitap Kapağı */}
                  <div className="relative w-[115px] sm:w-[130px] h-[165px] sm:h-[185px] rounded-xl overflow-hidden shadow-[0_18px_35px_-8px_rgba(0,0,0,0.65)] border border-border/50 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    {activeSlide?.image ? (
                      <img
                        key={`img-${activeSlide.id}`}
                        src={activeSlide.image}
                        alt={activeSlide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/20 flex items-center justify-center text-xs text-muted">Kapak Yok</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Alt Kısım: Başlık, Özet ve Aksiyon Butonları */}
            <div className="flex flex-col items-center text-center w-full z-10">
              <h2 className="text-lg sm:text-xl font-extrabold text-text tracking-tight line-clamp-1 drop-shadow-sm mb-1 px-2">
                {activeSlide?.title || "Öne Çıkan Eser"}
              </h2>
              <p className="text-xs sm:text-sm text-muted/90 line-clamp-2 leading-relaxed max-w-sm mb-3 px-3">
                {activeSlide?.summary || "Readixon'da keşfedilecek yeni bir serüven."}
              </p>

              {/* Butonlar */}
              <div className="flex items-center gap-2.5 w-full max-w-xs justify-center">
                {activeSlide?.primaryLabel && (
                  <Button
                    variant="primary"
                    className="rounded-full flex-1 h-10 text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    onPress={activeSlide.primaryAction}
                  >
                    {activeSlide.type === 'story' && <Play size={13} className="fill-current" />}
                    <span className="truncate">{activeSlide.primaryLabel}</span>
                  </Button>
                )}
                {activeSlide?.secondaryLabel && (
                  <Button
                    variant="secondary"
                    className="rounded-full flex-1 h-10 text-xs font-semibold bg-background/80 hover:bg-background text-text border border-border/80 backdrop-blur-md active:scale-95 transition-all"
                    onPress={activeSlide.secondaryAction}
                  >
                    <span className="truncate">{activeSlide.secondaryLabel}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Hover Okları */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border text-text items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20 cursor-pointer"
                aria-label="Önceki Slayt"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border text-text items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20 cursor-pointer"
                aria-label="Sonraki Slayt"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* İlerleme Göstergeleri (Dots / Pill) */}
          {slides.length > 1 && (
            <div className="absolute bottom-2 md:bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'w-7 bg-primary'
                      : 'w-2 bg-text/25 hover:bg-text/50'
                  }`}
                  aria-label={`Slayt ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Hızlı Kategori Filtreleri ("Neler Okumak İstersin?" - Geniş Açı) ── */}
      <section className="relative w-full px-4 sm:px-6 md:px-16 mb-8 md:mb-12">
        {/* Başlık ve Gezinme Kontrolleri */}
        {/* Başlık ve Gezinme Kontrolleri */}
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs shrink-0">
              <Compass size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-text leading-tight truncate">
                  Neler Okumak İstersin?
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {MAIN_GENRES.length} Ana Tür
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted truncate mt-0.5">
                İlgi alanına uygun ana türü seç ve hemen keşfet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-card hover:bg-card/80 border border-border/70 text-xs font-semibold text-primary hover:text-primary flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer select-none"
          >
            <span>{isCategoriesExpanded ? 'Daralt' : 'Tümü'}</span>
            <ChevronRight size={13} className={`transition-transform duration-200 ${isCategoriesExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* ── MOBİL GÖRÜNÜM: Kapalıyken 1 Sıra Yatay Kaydırma (Pill Chips), Açıkken Grid (sm:hidden) ── */}
        <div className="sm:hidden">
          {!isCategoriesExpanded ? (
            <div className="overflow-x-auto pb-1 scrollbar-hide snap-x scroll-smooth -mx-4 px-4">
              <div className="flex items-center gap-2 w-max py-0.5">
                {MAIN_GENRES.map((genre) => {
                  const GenreIcon = getGenreIcon(genre.id);
                  return (
                    <button
                      key={`mob-${genre.id}`}
                      onClick={() => router.push(`/search?genre=${genre.id}`)}
                      className="group snap-start h-9 shrink-0 flex items-center gap-2 px-3.5 rounded-xl bg-card/85 hover:bg-card border border-border/80 hover:border-primary/50 text-text transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer select-none"
                      title={genre.description}
                    >
                      <span className="w-5 h-5 rounded-md bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                        <GenreIcon size={12} strokeWidth={2} />
                      </span>
                      <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors whitespace-nowrap">
                        {genre.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 py-1">
              {MAIN_GENRES.map((genre) => {
                const GenreIcon = getGenreIcon(genre.id);
                return (
                  <button
                    key={`mob-exp-${genre.id}`}
                    onClick={() => router.push(`/search?genre=${genre.id}`)}
                    className="group h-10 flex items-center gap-2.5 px-3 rounded-xl bg-card/85 hover:bg-card border border-border/80 hover:border-primary/50 text-text transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer select-none text-left"
                    title={genre.description}
                  >
                    <span className="w-6 h-6 rounded-md bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <GenreIcon size={13} strokeWidth={2} />
                    </span>
                    <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors truncate flex-1">
                      {genre.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── MASAÜSTÜ / TABLET GÖRÜNÜM: İlk Sıra / Genişletilebilir Grid (hidden sm:grid) ── */}
        <div
          className={`hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
            isCategoriesExpanded ? 'max-h-[900px] opacity-100' : 'max-h-[46px]'
          }`}
        >
          {MAIN_GENRES.map((genre) => {
            const GenreIcon = getGenreIcon(genre.id);
            return (
              <button
                key={`desk-${genre.id}`}
                onClick={() => router.push(`/search?genre=${genre.id}`)}
                className="group w-full h-[44px] flex items-center gap-2.5 px-3 rounded-xl bg-card/60 hover:bg-card border border-border/70 hover:border-primary/50 text-text transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer text-left shrink-0"
                title={genre.description}
              >
                <span className="w-6 h-6 rounded-md bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <GenreIcon size={13} strokeWidth={2} />
                </span>
                <span className="text-xs lg:text-[13px] font-semibold text-text group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                  {genre.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Şık Açılır / Kapanır Aşağı Oku Butonu */}
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 hover:bg-card border border-border/80 hover:border-primary/40 text-muted hover:text-primary transition-all duration-200 shadow-xs hover:shadow text-xs font-semibold cursor-pointer select-none"
            aria-label={isCategoriesExpanded ? "Daha az göster" : "Tüm kategorileri göster"}
          >
            <span>{isCategoriesExpanded ? 'Daha Az Göster' : `Tüm Ana Türleri Gör (${MAIN_GENRES.length})`}</span>
            <span className={`w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 ${
              isCategoriesExpanded ? 'rotate-180 bg-primary text-white' : 'group-hover:translate-y-0.5'
            }`}>
              <ChevronDown size={11} />
            </span>
          </button>
        </div>
      </section>

      {/* ── 3. Editör Değerlendirmeleri Banner ── */}
      <div className="px-6 md:px-16 mb-12">
        <div className="bg-gradient-to-r from-primary/15 via-card to-card border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden relative">
          <div className="flex items-start md:items-center gap-5 sm:gap-6 relative z-10 w-full md:w-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">Gold Standart</span>
              </div>
              <Typography variant="h2" className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-text">Editör Değerlendirmeleri</Typography>
              <Typography variant="body" className="text-muted text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">Platformdaki eserlerin profesyonel editörlerimiz tarafından yapılan detaylı ve bağımsız incelemelerini keşfedin.</Typography>
            </div>
          </div>

          <Button
            onPress={() => router.push('/reviews')}
            className="w-full md:w-auto shrink-0 z-10 rounded-full px-6 py-2.5 font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            <span>İncelemeleri Gör</span>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* ── 4. Yatay Kaydırmalı Listeler (Carousels) & Duyurular ── */}
      <div className="flex flex-col gap-12 px-6 md:px-16">

          {/* Duyurular Bloğu */}
          {announcements.length > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <BellRing className="text-primary" size={24} />
                <Typography variant="h2" className="text-2xl font-bold">Platform Duyuruları</Typography>
                {announcements.length > 1 && (
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => {
                        const next = currentAnnouncementIndex === 0 ? announcements.length - 1 : currentAnnouncementIndex - 1;
                        setCurrentAnnouncementIndex(next);
                        if (announcementsRef.current) {
                          const el = announcementsRef.current;
                          el.scrollTo({ left: next * (el.scrollWidth / announcements.length), behavior: 'smooth' });
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border/50 hover:bg-primary/10 text-muted transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        const next = (currentAnnouncementIndex + 1) % announcements.length;
                        setCurrentAnnouncementIndex(next);
                        if (announcementsRef.current) {
                          const el = announcementsRef.current;
                          el.scrollTo({ left: next * (el.scrollWidth / announcements.length), behavior: 'smooth' });
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border/50 hover:bg-primary/10 text-muted transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
              <div ref={announcementsRef} className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x w-full snap-mandatory">
                {announcements.map(announcement => {
                  const hasImage = !!announcement.imageUrl;
                  return (
                    <div
                      key={announcement.id}
                      className="relative w-full shrink-0 snap-center flex flex-col md:flex-row p-6 md:p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all gap-8 md:gap-12 items-center"
                    >
                      {/* Sol Taraf: Görsel veya İkon */}
                      <div className="w-full md:w-64 lg:w-72 shrink-0 flex items-center justify-center">
                        {hasImage ? (
                          <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-muted/20 shadow-md">
                            <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <BellRing size={56} className="opacity-80" />
                          </div>
                        )}
                      </div>

                      {/* Sağ Taraf: Metinler */}
                      <div className="flex-1 flex flex-col text-center md:text-left h-full justify-center">
                        <Typography variant="h3" className="font-black text-xl md:text-2xl mb-3">{announcement.title}</Typography>
                        <div
                          className="text-muted text-sm md:text-base mb-6 leading-relaxed whitespace-pre-wrap [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-2 [&>strong]:font-bold [&>em]:italic [&_*]:!text-inherit [&_*]:!bg-transparent"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.content || '') }}
                        />
                        {announcement.link && (
                          <Button
                            variant="primary"
                            className="w-full sm:w-auto self-center md:self-start mt-auto shadow-lg shadow-primary/20"
                            onPress={() => window.open(announcement.link, '_blank')}
                          >
                            Daha Fazla Bilgi
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1. Sana Özel / Günün Trendleri */}
          {recLoading ? (
            <CarouselRowSkeleton 
              title={firebaseUser ? "Sana Özel" : "Günün Trendleri"}
              subtitle={firebaseUser ? "Okuma geçmişiniz ve favori türlerinize göre sizin için özel seçildi." : "Platformdaki en trend hikayeler."}
              icon={<Sparkles className="text-primary" size={24} />}
            />
          ) : recommendedStories.length > 0 ? (
            <CarouselRow
              title={firebaseUser ? "Sana Özel" : "Günün Trendleri"}
              subtitle={firebaseUser ? "Okuma geçmişiniz ve favori türlerinize göre sizin için özel seçildi." : "Platformdaki en trend hikayeler."}
              icon={<Sparkles className="text-primary" size={24} />}
              stories={recommendedStories}
              seeAllHref="/explore/recommended"
              size="small"
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          ) : null}

          {/* Okumaya Devam Et Bloğu */}
          {readingHistory.length > 0 && (
            <CarouselRow
              title="Okumaya Devam Et"
              subtitle="Kaldığınız yerden okumaya devam edin."
              icon={<BookOpen className="text-primary" size={24} />}
              stories={readingHistory.map(h => h.story)}
              progresses={readingHistory.reduce((acc, h) => ({ ...acc, [h.story.storyId]: h.progress }), {})}
              size="small"
              onStoryClick={(story) => {
                const historyItem = readingHistory.find(h => h.story.storyId === story.storyId);
                if (historyItem?.chapterId) {
                  router.push(`/read/${story.storyId}/${historyItem.chapterId}`);
                } else {
                  const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                  router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                }
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* Taze Çıkanlar (Yeni Bölüm Eklenenler) */}
          {recentlyUpdatedLoading ? (
            <CarouselRowSkeleton 
              title="Taze Çıkanlar"
              subtitle="Yazarlarından yepyeni bölümlerle güncellenen hikayeler."
              icon={<RotateCcw className="text-primary" size={24} />}
            />
          ) : recentlyUpdatedStories.length > 0 ? (
            <HorizontalCarouselRow
              title="Taze Çıkanlar"
              subtitle="Yazarlarından yepyeni bölümlerle güncellenen hikayeler."
              icon={<RotateCcw className="text-primary" size={24} />}
              stories={recentlyUpdatedStories}
              seeAllHref="/explore/recently-updated"
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              getBadgeText={(story) => story.latestChapter?.order ? `${story.latestChapter.order}. Bölüm Yayında` : 'Yeni Güncellendi'}
            />
          ) : null}

          {/* ── Kurgusal Evrenler Vitrini (PRD Bölüm 39) ── */}
          <UniverseShowcaseRow universes={publicUniverses} />

          {/* ── Sürükleyici Kitap Serileri Vitrini (Seri Kitap Faz 4) ── */}
          <SeriesShowcaseRow seriesList={publicSeries} />

          {/* 1.5 Son Tartışılanlar */}
          {trendingDiscussions.length > 0 && (
            <CarouselRow
              title="Son Tartışılanlar"
              subtitle="Topluluğun şu an en çok konuştuğu eserler."
              icon={<MessageCircle className="text-primary" size={24} />}
              stories={trendingDiscussions}
              seeAllHref="/explore/discussions"
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* Günün Trendleri (En Çok Beğenilenler) */}
          {mostLikedStories.length > 0 && (
            <CarouselRow
              title="Günün Trendleri"
              subtitle="Okurlarımızın en çok etkileşime girdiği favori hikayeler."
              icon={<Flame className="text-primary" size={24} />}
              stories={mostLikedStories}
              seeAllHref="/explore/trending"
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* Editörün Seçimi */}
          {editorPicks.length > 0 && (
            <CarouselRow
              title="Editörün Seçimi"
              subtitle="Editörlerimiz tarafından özenle seçilmiş ve mutlaka okumanız gereken başyapıtlar."
              icon={<Award className="text-primary" size={24} />}
              stories={editorPicks}
              seeAllHref="/reviews"
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* Webtoons / Çizgilerin Gücü */}
          {webtoons.length > 0 && (
            <CarouselRow
              title="Çizgilerin Gücü: Yeni Webtoonlar"
              subtitle="Kelimenin bittiği, çizginin konuştuğu en yeni manga ve webtoon serileri."
              icon={<GalleryVertical className="text-primary" size={24} />}
              stories={webtoons}
              seeAllHref="/webtoons"
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* İnteraktif Hikayeler / Kaderini Sen Seç (Bandersnatch) */}
          {interactiveStories.length > 0 && (
            <CarouselRow
              title="Kaderini Sen Seç: İnteraktif Hikayeler"
              subtitle="Kararlarınla dallanan kurgular, alternatif yollar ve çoklu sonlar! Hikayenin sonunu sen belirle."
              icon={<Gamepad2 className="text-indigo-400" size={24} />}
              stories={interactiveStories}
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* Kısa Hikayeler (Tek Oturuşta Bitenler) */}
          {shortStoriesLoading ? (
            <CarouselRowSkeleton 
              title="Tek Oturuşta Biten Kısa Hikayeler"
              subtitle="Zamanınız az mı? Tek bir bölümde tamamlanan, vurucu ve sürükleyici kısa romanlar."
              icon={<Feather className="text-amber-400" size={24} />}
            />
          ) : shortStories.length > 0 ? (
            <CarouselRow
              title="Tek Oturuşta Biten Kısa Hikayeler"
              subtitle="Zamanınız az mı? Tek bir bölümde tamamlanan, vurucu ve sürükleyici kısa romanlar."
              icon={<Feather className="text-amber-400" size={24} />}
              stories={shortStories}
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          ) : (
            <div className="relative group/section rounded-3xl bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/20 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Feather size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground">Tek Oturuşta Biten Kısa Hikayeler</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      Yeni Vitrin
                    </span>
                  </div>
                  <p className="text-muted text-xs mt-0.5">Zamanın kısıtlı mı? Tek bir bölümle sınırlandırılmış, tek nefeste biten sürükleyici kısa romanlar ve öyküler.</p>
                </div>
              </div>
              <Link href="/studio" className="shrink-0">
                <Button variant="primary" className="rounded-xl text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black">
                  İlk Kısa Hikayeni Yaz
                </Button>
              </Link>
            </div>
          )}

          {/* ── Mesaj Hikayeleri: Dokunarak Oku (WhatsApp Tarzı Kurgular) ── */}
          {chatStoriesLoading ? (
            <CarouselRowSkeleton 
              title="Mesaj Hikayeleri: Dokunarak Oku"
              subtitle="WhatsApp konuşması gibi akan, ekrana her dokunuşunda yeni bir mesajın belirdiği sürükleyici sohbet kurguları."
              icon={<MessageSquare className="text-emerald-400" size={24} />}
            />
          ) : chatStories.length > 0 ? (
            <CarouselRow
              title="Mesaj Hikayeleri: Dokunarak Oku"
              subtitle="WhatsApp konuşması gibi akan, ekrana her dokunuşunda yeni bir mesajın belirdiği sürükleyici sohbet kurguları."
              icon={<MessageSquare className="text-emerald-400" size={24} />}
              stories={chatStories}
              onStoryClick={(story) => {
                const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                router.push(`/story/${slug}`);
              }}
              onLikePress={handleLikePress}
            />
          ) : (
            <div className="relative group/section rounded-3xl bg-gradient-to-r from-emerald-500/10 via-card to-card border border-emerald-500/20 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground">Mesaj Hikayeleri: Dokunarak Oku</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      Yeni Format
                    </span>
                  </div>
                  <p className="text-muted text-xs mt-0.5">WhatsApp konuşması okur gibi ilerleyen, ekrana her dokunduğunda yeni bir mesajın açıldığı yenilikçi sohbet kurguları.</p>
                </div>
              </div>
              <Link href="/studio" className="shrink-0">
                <Button variant="primary" className="rounded-xl text-xs font-bold px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black">
                  İlk Mesaj Hikayeni Yaz
                </Button>
              </Link>
            </div>
          )}

          {/* Gizli Hazineler (Yakında) */}
          <ComingSoonBlock
            title="Gizli Hazineler"
            subtitle="Henüz çok keşfedilmemiş ama okuyanların hayran kaldığı edebi şaheserler."
            icon={<Gem className="text-primary" size={24} />}
          />

          {/* 2. En Çok Okunanlar */}
          {topLoading ? (
            <CarouselRowSkeleton 
              title="Haftanın En Çok Okunanları"
              subtitle="Bu hafta okurlarımızın elinden düşüremediği başyapıtlar."
              icon={<TrendingUp className="text-primary" size={24} />}
            />
          ) : topStories.length > 0 ? (
            <CarouselRow
              title="Haftanın En Çok Okunanları"
              subtitle="Bu hafta okurlarımızın elinden düşüremediği başyapıtlar."
              icon={<TrendingUp className="text-primary" size={24} />}
              stories={topStories}
              seeAllHref="/explore/top"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
              onEndReached={() => {
                if (hasNextTop) fetchNextTop();
              }}
            />
          ) : null}

          {/* 3. Yeni Çıkanlar */}
          {recentStories.length > 0 && (
            <CarouselRow
              title="Yeni Çıkanlar"
              subtitle="Platforma yeni eklenen, keşfedilmeyi bekleyen taze hikayeler."
              icon={<Clock className="text-primary" size={24} />}
              stories={recentStories}
              seeAllHref="/explore/recent"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
              onEndReached={() => {
                if (hasNextRecent) fetchNextRecent();
              }}
            />
          )}

          {/* 4. Öne Çıkan Yazarlar */}
          {featuredAuthors.length > 0 && (
            <AuthorCarouselRow
              title="Öne Çıkan Yazarlar"
              subtitle="Kalemiyle büyüleyen, platformun en sevilen kalemleri."
              icon={<Users className="text-primary" size={24} />}
              authors={featuredAuthors}
              seeAllHref="/explore/authors"
              onAuthorClick={(author) => {
                if (author.username) {
                  router.push(`/profile/@${author.username}`);
                } else {
                  toast('Bu yazar henüz bir kullanıcı adı belirlememiş.');
                }
              }}
              followingIds={followingIds}
              onFollowToggle={handleFollowToggle}
            />
          )}

          {/* 5. En Çok Beğenilenler */}
          {mostLikedStories.length > 0 && (
            <CarouselRow
              title="Kalplerin Efendileri"
              icon={<Heart className="text-primary" size={24} />}
              stories={mostLikedStories}
              seeAllHref="/explore/most-liked"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
            />
          )}

          {/* 6. Kısa & Öz (Tamamlanmış) */}
          {completedStories.length > 0 && (
            <CarouselRow
              title="Kısa ve Öz (Tamamlanmış)"
              icon={<CheckCircle className="text-emerald-500" size={24} />}
              stories={completedStories}
              seeAllHref="/explore/completed"
              size="small"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
            />
          )}

          {/* 7. Readixon Mobil Uygulama İndirme Bölümü */}
          <AppDownloadBanner />

        </div>

      {/* 8. Alt Bilgi (Footer) */}
      <SiteFooter />
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Carousel Row Skeleton
// ─────────────────────────────────────────────

function CarouselRowSkeleton({ title, subtitle, icon }: { title?: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="relative animate-pulse mb-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {icon}
            <div className="h-7 w-48 sm:w-64 bg-card/60 border border-border/40 rounded-xl" />
          </div>
          {subtitle && (
            <div className="h-4 w-40 sm:w-80 bg-card/30 rounded-lg mt-2" />
          )}
        </div>
      </div>
      <div className="flex gap-6 overflow-hidden pb-8 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-[180px] md:w-[220px] flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl bg-card/40 border border-border/30 mb-3" />
            <div className="h-4 w-3/4 bg-card/50 rounded mb-2" />
            <div className="h-3 w-1/2 bg-card/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Carousel Row
// ─────────────────────────────────────────────

interface CarouselRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stories: Story[];
  progresses?: Record<string, number>;
  seeAllHref?: string;
  size?: 'default' | 'small' | 'large';
  onStoryClick?: (story: Story) => void;
  onLikePress?: (e: React.MouseEvent, storyId: string, currentStatus: boolean) => void;
  onEndReached?: () => void;
  getBadgeText?: (story: Story) => string | undefined;
}

function CarouselRow({ title, subtitle, icon, stories, progresses, seeAllHref, size = 'default', onStoryClick, onLikePress, onEndReached, getBadgeText }: CarouselRowProps) {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowLeftArrow(target.scrollLeft > 0);
    setShowRightArrow(target.scrollLeft < target.scrollWidth - target.clientWidth - 10);

    // Sonsuz kaydırma tetikleyici (sondan 100px önce)
    if (onEndReached && target.scrollLeft > target.scrollWidth - target.clientWidth - 100) {
      onEndReached();
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {icon}
            <Typography variant="h2" className="text-2xl font-bold">{title}</Typography>
          </div>
          {subtitle && (
            <Typography variant="body" className="text-muted text-sm mt-1">{subtitle}</Typography>
          )}
        </div>
        {seeAllHref && (
          <button onClick={() => router.push(seeAllHref)} className="text-primary text-sm font-semibold hover:underline flex items-center">
            Tümünü Gör <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Sol-Sağ Oklar (Sadece Desktop) */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-24px] top-[55%] -translate-y-1/2 z-20 w-12 h-12 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-24px] top-[55%] -translate-y-1/2 z-20 w-12 h-12 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {stories.map((story) => (
          <div key={story.storyId} className={`${size === 'small' ? 'w-[130px] md:w-[150px]' : 'w-[180px] md:w-[220px]'} flex-shrink-0 snap-start transition-transform duration-300 hover:-translate-y-2`}>
            <StoryCard
              title={story.title}
              authorName={story.authorName || 'Bilinmiyor'}
              authorUsername={story.authorUsername}
              authorAvatarUrl={story.authorAvatarUrl}
              coverImage={story.coverImage}
              views={story.stats?.views || 0}
              likes={story.stats?.likes || 0}
              tags={story.tags || []}
              isLiked={!!userProfile?.likedStoryIds?.includes(story.storyId)}
              progress={progresses?.[story.storyId]}
              isWebtoon={story.format === 'webtoon'}
              status={story.status}
              chapterCount={story.stats?.chapterCount}
              onPress={() => onStoryClick?.(story)}
              onLikePress={(e) => onLikePress?.(e, story.storyId, !!userProfile?.likedStoryIds?.includes(story.storyId))}
              badgeText={
                getBadgeText
                  ? getBadgeText(story)
                  : story.mainGenre && getMainGenreById(story.mainGenre)
                    ? getMainGenreById(story.mainGenre)!.name
                    : story.tags?.find((t: string) => getMainGenreById(t))
                      ? getMainGenreById(story.tags.find((t: string) => getMainGenreById(t))!)?.name
                      : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Horizontal Carousel Row
// ─────────────────────────────────────────────

interface HorizontalCarouselRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stories: any[]; // StoryWithLatestChapter[]
  seeAllHref?: string;
  onStoryClick?: (story: any) => void;
  getBadgeText?: (story: any) => string | undefined;
}

function HorizontalCarouselRow({ title, subtitle, icon, stories, seeAllHref, onStoryClick, getBadgeText }: HorizontalCarouselRowProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [stories]);

  return (
    <div className="relative group/section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {icon}
            <Typography variant="h2" className="text-2xl font-bold">{title}</Typography>
          </div>
          {subtitle && (
            <Typography variant="body" className="text-muted text-sm mt-1">{subtitle}</Typography>
          )}
        </div>
        {seeAllHref && (
          <button onClick={() => router.push(seeAllHref)} className="text-primary text-sm font-semibold hover:underline flex items-center">
            Tümünü Gör <ChevronRight size={16} />
          </button>
        )}
      </div>

      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-24px] top-[55%] -translate-y-1/2 z-20 w-12 h-12 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {showRightArrow && stories.length > 2 && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-24px] top-[55%] -translate-y-1/2 z-20 w-12 h-12 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {stories.map((story) => (
          <div key={story.storyId} className="w-[320px] md:w-[380px] lg:w-[420px] flex-shrink-0 snap-start transition-transform duration-300 hover:-translate-y-2">
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
              badgeText={
                getBadgeText
                  ? getBadgeText(story)
                  : story.mainGenre && getMainGenreById(story.mainGenre)
                    ? getMainGenreById(story.mainGenre)!.name
                    : story.tags?.find((t: string) => getMainGenreById(t))
                      ? getMainGenreById(story.tags.find((t: string) => getMainGenreById(t))!)?.name
                      : undefined
              }
              seriesTitle={story.seriesTitle}
              seriesOrder={story.seriesOrder}
              onPress={() => onStoryClick?.(story)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Author Carousel Row
// ─────────────────────────────────────────────

interface AuthorCarouselRowProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  authors: User[];
  seeAllHref?: string;
  onAuthorClick: (author: User) => void;
  followingIds: string[];
  onFollowToggle: (e: React.MouseEvent, userId: string) => void;
}

function AuthorCarouselRow({ title, subtitle, icon, authors, seeAllHref, onAuthorClick, followingIds, onFollowToggle }: AuthorCarouselRowProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowLeftArrow(target.scrollLeft > 0);
    setShowRightArrow(target.scrollLeft < target.scrollWidth - target.clientWidth - 10);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {icon}
            <Typography variant="h2" className="text-2xl font-bold">{title}</Typography>
          </div>
          {subtitle && (
            <Typography variant="body" className="text-muted text-sm mt-1">{subtitle}</Typography>
          )}
        </div>
        {seeAllHref && (
          <button onClick={() => router.push(seeAllHref)} className="text-primary text-sm font-semibold hover:underline flex items-center">
            Tümünü Gör <ChevronRight size={16} />
          </button>
        )}
      </div>

      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-24px] top-[55%] -translate-y-1/2 z-20 w-12 h-12 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-24px] top-[55%] -translate-y-1/2 z-20 w-12 h-12 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {authors.map((author) => (
          <div key={author.uid} className="w-[180px] md:w-[200px] flex-shrink-0 snap-start transition-transform duration-300 hover:-translate-y-2">
            <AuthorCard
              name={author.displayName || 'İsimsiz Yazar'}
              username={author.username || 'yazar'}
              avatarUrl={author.avatarUrl}
              followers={author.stats?.followers || 0}
              onPress={() => onAuthorClick(author)}
              isFollowing={followingIds.includes(author.uid)}
              isPremium={author.status === 'premium'}
              onFollowPress={(e) => onFollowToggle(e, author.uid)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Coming Soon Block (Yakında)
// ─────────────────────────────────────────────

function ComingSoonBlock({ title, subtitle, icon }: { title: string, subtitle: string, icon: React.ReactNode }) {
  return (
    <div className="relative group/section opacity-80 mt-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            {icon}
            <Typography variant="h2" className="text-2xl font-bold flex items-center gap-2">
              {title}
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1">Yakında</span>
            </Typography>
          </div>
          {subtitle && (
            <Typography variant="body" className="text-muted text-sm mt-1">{subtitle}</Typography>
          )}
        </div>
      </div>
      <div className="h-32 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center bg-card/10 gap-2">
        <Typography variant="body" className="text-muted font-medium flex items-center gap-2">
          <Sparkles size={16} />
          Burası yakında çok şenlenecek!
        </Typography>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Kurgusal Evrenler Vitrini (PRD Bölüm 39)
// ─────────────────────────────────────────────
interface UniverseShowcaseRowProps {
  universes: Universe[];
}

function UniverseShowcaseRow({ universes }: UniverseShowcaseRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  if (!universes || universes.length === 0) {
    return (
      <div className="relative group/section rounded-3xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-foreground">Kurgusal Evrenler Atlası</h3>
            <p className="text-muted text-xs mt-0.5">Platformda ilk kurgusal evrenini sen kur, karakterlerini ve haritanı okurlarla buluştur.</p>
          </div>
        </div>
        <Link href="/studio/universes" className="shrink-0">
          <Button variant="primary" className="rounded-xl text-xs font-bold px-4 py-2">
            İlk Evreni Kur
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative group/section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Globe size={20} />
            </div>
            <div>
              <Typography variant="h2" className="text-2xl font-bold flex items-center gap-2">
                <span>Kurgusal Evrenler</span>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                  Evren Atlası
                </span>
              </Typography>
            </div>
          </div>
          <Typography variant="body" className="text-muted text-sm mt-1">
            Tek bir kitapla yetinmeyin; haritaları, karakter ağları ve derin kurgusuyla yaşayan dünyalara adım atın.
          </Typography>
        </div>

        <Link
          href="/universe"
          className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 group"
        >
          <span>Tüm Evrenleri Gör</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-20px] top-[55%] -translate-y-1/2 z-20 w-11 h-11 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {showRightArrow && universes.length > 2 && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-20px] top-[55%] -translate-y-1/2 z-20 w-11 h-11 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-primary shadow-xl hover:bg-primary/10 hover:scale-110 transition-all cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {universes.map((universe) => (
          <div
            key={universe.universeId}
            className="w-[280px] sm:w-[320px] md:w-[340px] flex-shrink-0 snap-start"
          >
            <UniverseCard universe={universe} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Sürükleyici Kitap Serileri Vitrini (Seri Kitap Faz 4)
// ─────────────────────────────────────────────
interface SeriesShowcaseRowProps {
  seriesList: Series[];
}

function SeriesShowcaseRow({ seriesList }: SeriesShowcaseRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  if (!seriesList || seriesList.length === 0) {
    return (
      <div className="relative group/section rounded-3xl bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/20 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-foreground">Sürükleyici Kitap Serileri</h3>
            <p className="text-muted text-xs mt-0.5">Birden fazla kitabını bir seride topla, okurlarına soluksuz binge-read keyfi sun.</p>
          </div>
        </div>
        <Link href="/studio/series" className="shrink-0">
          <Button variant="primary" className="rounded-xl text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black">
            İlk Seriyi Başlat
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative group/section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
              <Layers size={20} />
            </div>
            <div>
              <Typography variant="h2" className="text-2xl font-bold flex items-center gap-2">
                <span>Sürükleyici Kitap Serileri</span>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  Binge-Read
                </span>
              </Typography>
            </div>
          </div>
          <Typography variant="body" className="text-muted text-sm mt-1">
            Birbirine bağlı ciltler, destansı kurgular ve tek solukta bitirilecek kitap serileri.
          </Typography>
        </div>

        <Link
          href="/series"
          className="text-amber-400 text-sm font-semibold hover:underline flex items-center gap-1 group"
        >
          <span>Tüm Serileri Gör</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-20px] top-[55%] -translate-y-1/2 z-20 w-11 h-11 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-amber-500 shadow-xl hover:bg-amber-500/10 hover:scale-110 transition-all cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {showRightArrow && seriesList.length > 2 && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-20px] top-[55%] -translate-y-1/2 z-20 w-11 h-11 bg-card/90 backdrop-blur-md border border-border/50 rounded-full items-center justify-center text-amber-500 shadow-xl hover:bg-amber-500/10 hover:scale-110 transition-all cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {seriesList.map((series) => (
          <div
            key={series.seriesId}
            className="w-[260px] sm:w-[290px] md:w-[320px] flex-shrink-0 snap-start"
          >
            <SeriesCard series={series} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
