"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, StoryCard, Button } from '@readixon/ui';
import { getRecentStoriesPaginated, getTopStoriesPaginated, getFeaturedAuthors, getRecommendedStories, getCompletedStories, getMostLikedStories, POPULAR_TAGS, generateStorySlug, toggleStoryLike, followUser, unfollowUser, useAuthStore, type Story, type User } from '@readixon/core';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Sparkles, TrendingUp, Clock, ChevronRight, ChevronLeft, Play, Users, Heart, CheckCircle } from 'lucide-react';
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

  const recentStories = recentData?.pages.flatMap((p: any) => p.stories) || [];
  const topStories = topData?.pages.flatMap((p: any) => p.stories) || [];

  const isLoading = recentLoading || topLoading || authorsLoading || recLoading || compLoading || likedLoading;

  // Öne Çıkan Hikaye (Hero) - Şimdilik en popüler ilk hikayeyi alıyoruz
  const heroStory = topStories.length > 0 ? topStories[0] : null;

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
      
      {/* ── 1. Hero Banner ── */}
      <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center mb-12">
        {/* Bulanık Arka Plan Görseli */}
        {heroStory?.coverImage ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src={heroStory.coverImage} alt="Background" className="w-full h-full object-cover opacity-20 blur-3xl scale-125" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        )}

        {/* Hero İçerik (Kapak Resmi + Metinler) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Sol/Üst Kısım: Net Kapak Resmi */}
          <div className="w-48 md:w-72 flex-shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 animate-fade-in-up">
            {heroStory?.coverImage ? (
              <img src={heroStory.coverImage} alt={heroStory.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                <Typography variant="body" className="text-muted/50">Kapak Yok</Typography>
              </div>
            )}
          </div>

          {/* Sağ/Alt Kısım: Metinler ve Butonlar */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 border border-primary/30 shadow-lg">
                <Sparkles size={12} />
                Günün Öne Çıkanı
              </span>
            </div>
            
            <Typography variant="h1" className="text-3xl md:text-5xl lg:text-6xl font-black text-text mb-4 leading-tight drop-shadow-2xl">
              {heroStory?.title || "Okunmaya Değer Başyapıtlar"}
            </Typography>
            
            <Typography variant="body" className="text-base md:text-lg lg:text-xl text-text/80 mb-8 line-clamp-4 drop-shadow-md max-w-2xl">
              {heroStory?.summary || "Farklı dünyalara yelken açmak ve yeni serüvenlere atılmak için binlerce hikaye arasından sizin için seçtiklerimizi keşfedin."}
            </Typography>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Button 
                variant="primary" 
                className="rounded-full px-8 py-4 md:py-6 text-base md:text-lg shadow-primary/30 shadow-lg font-bold flex items-center gap-2"
                onPress={() => heroStory && router.push(`/read/${heroStory.storyId}`)}
              >
                <Play size={20} className="fill-current" />
                Hemen Oku
              </Button>
              <Button 
                variant="secondary" 
                className="rounded-full px-8 py-4 md:py-6 text-base md:text-lg font-semibold bg-text/5 hover:bg-text/10 text-text border border-text/20 backdrop-blur-md transition-colors"
                onPress={() => heroStory && router.push(`/story/${generateStorySlug(heroStory.title, heroStory.storyId)}`)}
              >
                Detaylar
              </Button>
            </div>
          </div>
        </div>
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

      {/* ── 3. Yatay Kaydırmalı Listeler (Carousels) ── */}
      {!isLoading && (
        <div className="flex flex-col gap-12 px-6 md:px-16">
          
          {/* Öne Çıkan Yazarlar */}
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

          {/* Sana Özel / Günün Trendleri */}
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

          {/* En Çok Beğenilenler */}
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

          {/* En Çok Okunanlar */}
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

          {/* Yeni Çıkanlar */}
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

          {/* Kısa & Öz (Tamamlanmış) */}
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
  seeAllHref?: string;
  onStoryClick: (story: Story) => void;
  onLikePress: (e: React.MouseEvent, storyId: string) => void;
  onEndReached?: () => void;
}

function CarouselRow({ title, icon, stories, seeAllHref, onStoryClick, onLikePress, onEndReached }: CarouselRowProps) {
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
              onFollowPress={(e) => onFollowToggle(e, author.uid)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
