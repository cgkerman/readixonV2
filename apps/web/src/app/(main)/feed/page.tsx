"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, StoryCard, Button } from '@readixon/ui';
import { getRecentStoriesPaginated, getTopStoriesPaginated, getFeaturedAuthors, getRecommendedStories, getCompletedStories, getMostLikedStories, getActiveAnnouncements, getUserReadingProgress, getStoriesByIds, getTrendingDiscussions, POPULAR_TAGS, generateStorySlug, toggleStoryLike, followUser, unfollowUser, useAuthStore, type Story, type User, type Announcement } from '@readixon/core';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Sparkles, TrendingUp, Clock, ChevronRight, ChevronLeft, Play, Users, Heart, CheckCircle, BellRing, BookOpen, MessageCircle } from 'lucide-react';
import { AuthorCard } from '@readixon/ui';
import { toast } from "sonner";

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
    queryFn: () => getRecommendedStories(userProfile?.preferredGenres, 10),
  });

  const { data: completedStories = [], isLoading: compLoading } = useQuery({
    queryKey: ['stories', 'completed'],
    queryFn: () => getCompletedStories(10),
  });

  const { data: mostLikedStories = [], isLoading: likedLoading } = useQuery({
    queryKey: ['stories', 'mostLiked'],
    queryFn: () => getMostLikedStories(10),
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: () => getActiveAnnouncements(3),
  });

  const { data: readingHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['stories', 'readingProgress', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser?.uid) return [];
      const history = await getUserReadingProgress(firebaseUser.uid);
      if (!history || history.length === 0) return [];

      const storyIds = history.map(h => h.storyId);
      const stories = await getStoriesByIds(storyIds);

      // Hikayeleri bul ve ilerlemeyi eşleştir (Sadece yayınlanmış olanları göster)
      return history.map(h => {
        const story = stories.find(s => s.storyId === h.storyId && s.status !== 'draft');
        return story ? { story, progress: h.scrollPercentage || 0, chapterId: h.currentChapterId } : null;
      }).filter(Boolean) as { story: Story; progress: number; chapterId: string }[];
    },
    enabled: !!firebaseUser?.uid
  });

  const { data: trendingDiscussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['stories', 'trendingDiscussions'],
    queryFn: () => getTrendingDiscussions(10),
  });

  const recentStories = recentData?.pages.flatMap((p: any) => p.stories) || [];
  const topStories = topData?.pages.flatMap((p: any) => p.stories) || [];

  const isLoading = recentLoading || topLoading || authorsLoading || recLoading || compLoading || likedLoading || historyLoading || discussionsLoading;

  // Öne Çıkan Slaytlar (Carousel Verisi)
  const slides = useMemo(() => {
    const arr: any[] = [];

    // Readixon V1 Announcement Slide (Her zaman ilk sırada)
    arr.push({
      id: 'slide-readixon-v1',
      type: 'announcement',
      badge: 'YENİ NESİL OKUMA DENEYİMİ',
      badgeIcon: Sparkles,
      title: 'Readixon V1 Yayında!',
      summary: 'Alışılmış platformları unutun. Readix ile yazarlarla etkileşime geçin, hikayenin gidişatını oylayın, RPG karakter istatistiklerini keşfedin ve yazar düellolarına şahit olun. Okuma deneyimi baştan yazılıyor!',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80', // Kozmik/Yıldızlı bir arkaplan
      primaryLabel: 'Hemen Keşfet',
      primaryAction: () => router.push('/about'),
    });

    // Beta Uyarı & Destek Slide
    arr.push({
      id: 'slide-beta-announcement',
      type: 'announcement',
      badge: 'BETA SÜRÜMÜNDEYİZ',
      badgeIcon: CheckCircle, // veya uygun bir ikon
      title: 'Dürüst Olalım: Hatalar Çıkabilir',
      summary: 'Platformumuz henüz çok yeni ve taze! Geliştirme sürecimizde karşınıza ufak tefek hatalar veya pürüzler çıkabilir. Karşılaştığınız sorunları çözebilmemiz ve deneyimi iyileştirmemiz için bize doğrudan yazın.',
      image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80', // Cozy reading/writing theme
      primaryLabel: 'Hata Bildir / Destek',
      primaryAction: () => router.push('/support'),
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
        secondaryAction: () => router.push(`/story/${generateStorySlug(topStories[0].title, topStories[0].storyId)}`)
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
        secondaryAction: () => router.push(`/story/${generateStorySlug(mostLikedStories[0].title, mostLikedStories[0].storyId)}`)
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
        secondaryAction: () => router.push(`/story/${generateStorySlug(topStories[1].title, topStories[1].storyId)}`)
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
  }, [topStories, mostLikedStories, featuredAuthors, router]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 saniyede bir dön
    return () => clearInterval(interval);
  }, [slides.length]);

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

      {/* ── 1. Hero Banner (Carousel) ── */}
      <div className="relative w-full min-h-[65vh] md:min-h-[70vh] flex flex-col justify-center mb-16 overflow-hidden">
        {/* Bulanık Arka Plan Görseli */}
        {activeSlide?.image ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              key={`bg-${activeSlide.id}`}
              src={activeSlide.image}
              alt="Background"
              className="w-full h-full object-cover opacity-20 blur-3xl scale-125 animate-in fade-in duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        )}

        {/* Hero İçerik (Kapak Resmi + Metinler) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-24 md:py-24 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

          {/* Sol/Üst Kısım: Net Kapak Resmi */}
          <div
            key={`img-${activeSlide?.id}`}
            className={`flex-shrink-0 shadow-2xl shadow-black/50 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700 ${activeSlide?.type === 'author'
              ? 'w-40 h-40 md:w-64 md:h-64 rounded-full object-cover'
              : activeSlide?.type === 'announcement'
                ? 'w-40 md:w-72 aspect-square rounded-2xl object-cover'
                : 'w-40 md:w-72 aspect-[2/3] rounded-xl'
              } overflow-hidden`}
          >
            {activeSlide?.image ? (
              <img src={activeSlide.image} alt={activeSlide.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                <Typography variant="body" className="text-muted/50">Görsel Yok</Typography>
              </div>
            )}
          </div>

          {/* Sağ/Alt Kısım: Metinler ve Butonlar */}
          <div key={`content-${activeSlide?.id}`} className="flex-1 flex flex-col items-center md:items-start text-center md:text-left animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              {activeSlide?.badge && (
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-primary/30 shadow-lg">
                  {activeSlide.badgeIcon && <activeSlide.badgeIcon size={14} />}
                  {activeSlide.badge}
                </span>
              )}
            </div>

            <Typography variant="h1" className="text-3xl md:text-5xl lg:text-6xl font-black text-text mb-4 leading-tight drop-shadow-2xl">
              {activeSlide?.title || "Okunmaya Değer Başyapıtlar"}
            </Typography>

            <Typography variant="body" className="text-sm md:text-lg lg:text-xl text-text/80 mb-8 line-clamp-4 drop-shadow-md max-w-2xl">
              {activeSlide?.summary || "Farklı dünyalara yelken açmak ve yeni serüvenlere atılmak için binlerce hikaye arasından sizin için seçtiklerimizi keşfedin."}
            </Typography>

            <div className="flex flex-row flex-wrap justify-center md:justify-start gap-3 md:gap-4 w-full">
              {activeSlide?.primaryLabel && (
                <Button
                  variant="primary"
                  className="rounded-full flex-1 md:flex-none min-w-[140px] px-6 py-3.5 md:py-6 text-sm md:text-lg shadow-primary/30 shadow-lg font-bold flex items-center justify-center gap-2"
                  onPress={activeSlide.primaryAction}
                >
                  {activeSlide.type === 'story' && <Play size={20} className="fill-current" />}
                  {activeSlide.primaryLabel}
                </Button>
              )}
              {activeSlide?.secondaryLabel && (
                <Button
                  variant="secondary"
                  className="rounded-full flex-1 md:flex-none min-w-[140px] px-6 py-3.5 md:py-6 text-sm md:text-lg font-semibold bg-text/5 hover:bg-text/10 text-text border border-text/20 backdrop-blur-md transition-colors"
                  onPress={activeSlide.secondaryAction}
                >
                  {activeSlide.secondaryLabel}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Indicators (Dots) */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlideIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                aria-label={`Slayt ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* ── 2. Hızlı Kategori Filtreleri ── */}
      {!isLoading && (
        <div className="px-6 md:px-16 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Typography variant="h3" className="font-semibold">Neler Okumak İstersin?</Typography>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x">
            {POPULAR_TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => router.push(`/search?tag=${tag.id}`)}
                className="snap-start flex-shrink-0 px-5 py-2.5 rounded-full bg-card/50 border border-border/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all text-sm font-medium whitespace-nowrap"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Yatay Kaydırmalı Listeler (Carousels) & Duyurular ── */}
      {!isLoading && (
        <div className="flex flex-col gap-12 px-6 md:px-16">

          {/* Duyurular Bloğu */}
          {announcements.length > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <BellRing className="text-primary" size={24} />
                <Typography variant="h2" className="text-2xl font-bold">Platform Duyuruları</Typography>
              </div>
              <div className="flex flex-col gap-6 items-center w-full">
                {announcements.map(announcement => {
                  const hasImage = !!announcement.imageUrl;
                  return (
                    <div
                      key={announcement.id}
                      className="relative w-full flex flex-col md:flex-row p-6 md:p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all gap-8 md:gap-12 items-center"
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
                        <Typography variant="body" className="text-muted text-sm md:text-base mb-6 leading-relaxed whitespace-pre-wrap">
                          {announcement.content}
                        </Typography>
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

          {/* Okumaya Devam Et Bloğu */}
          {readingHistory.length > 0 && (
            <CarouselRow
              title="Okumaya Devam Et"
              icon={<BookOpen className="text-primary" size={24} />}
              stories={readingHistory.map(h => h.story)}
              progresses={readingHistory.reduce((acc, h) => ({ ...acc, [h.story.storyId]: h.progress }), {})}
              onStoryClick={(story) => {
                const historyItem = readingHistory.find(h => h.story.storyId === story.storyId);
                if (historyItem?.chapterId) {
                  router.push(`/read/${story.storyId}/${historyItem.chapterId}`);
                } else {
                  router.push(`/story/${generateStorySlug(story.title, story.storyId)}`);
                }
              }}
              onLikePress={handleLikePress}
            />
          )}

          {/* 1. Sana Özel / Günün Trendleri */}
          {recommendedStories.length > 0 && (
            <CarouselRow
              title={firebaseUser && userProfile?.preferredGenres?.length ? "Sana Özel" : "Günün Trendleri"}
              icon={<Sparkles className="text-primary" size={24} />}
              stories={recommendedStories}
              seeAllHref="/explore/recommended"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
            />
          )}

          {/* 1.5 Son Tartışılanlar */}
          {trendingDiscussions.length > 0 && (
            <CarouselRow
              title="Son Tartışılanlar"
              icon={<MessageCircle className="text-primary" size={24} />}
              stories={trendingDiscussions}
              seeAllHref="/explore/discussions"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
            />
          )}

          {/* 2. En Çok Okunanlar */}
          {topStories.length > 0 && (
            <CarouselRow
              title="Haftanın En Çok Okunanları"
              icon={<TrendingUp className="text-primary" size={24} />}
              stories={topStories}
              seeAllHref="/explore/top"
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
              onEndReached={() => {
                if (hasNextTop) fetchNextTop();
              }}
            />
          )}

          {/* 3. Yeni Çıkanlar */}
          {recentStories.length > 0 && (
            <CarouselRow
              title="Yeni Çıkanlar"
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
              onStoryClick={(story) => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              onLikePress={handleLikePress}
            />
          )}

        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Yardımcı Bileşen: Carousel Row
// ─────────────────────────────────────────────

interface CarouselRowProps {
  title: string;
  icon: React.ReactNode;
  stories: Story[];
  progresses?: Record<string, number>;
  seeAllHref?: string;
  onStoryClick: (story: Story) => void;
  onLikePress: (e: React.MouseEvent, storyId: string) => void;
  onEndReached?: () => void;
}

function CarouselRow({ title, icon, stories, progresses, seeAllHref, onStoryClick, onLikePress, onEndReached }: CarouselRowProps) {
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
        <div className="flex items-center gap-3">
          {icon}
          <Typography variant="h2" className="text-2xl font-bold">{title}</Typography>
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
          <div key={story.storyId} className="w-[180px] md:w-[220px] flex-shrink-0 snap-start transition-transform duration-300 hover:-translate-y-2">
            <StoryCard
              title={story.title}
              authorName={story.authorName || 'Bilinmiyor'}
              authorUsername={story.authorUsername}
              coverImage={story.coverImage}
              views={story.stats?.views || 0}
              likes={story.stats?.likes || 0}
              tags={story.tags || []}
              isLiked={userProfile?.likedStoryIds?.includes(story.storyId)}
              progress={progresses?.[story.storyId]}
              onPress={() => onStoryClick(story)}
              onLikePress={(e) => onLikePress(e, story.storyId)}
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
  icon: React.ReactNode;
  authors: User[];
  seeAllHref?: string;
  onAuthorClick: (author: User) => void;
  followingIds: string[];
  onFollowToggle: (e: React.MouseEvent, userId: string) => void;
}

function AuthorCarouselRow({ title, icon, authors, seeAllHref, onAuthorClick, followingIds, onFollowToggle }: AuthorCarouselRowProps) {
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
        <div className="flex items-center gap-3">
          {icon}
          <Typography variant="h2" className="text-2xl font-bold">{title}</Typography>
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
