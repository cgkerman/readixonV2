"use client";

import React, { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, StoryCard } from '@readixon/ui';
import { 
  getRecentStoriesPaginated, 
  getTopStoriesPaginated, 
  getRecommendedStories, 
  getCompletedStories, 
  getMostLikedStories,
  toggleStoryLike,
  generateStorySlug,
  useAuthStore
} from '@readixon/core';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Clock, Heart, CheckCircle, ArrowLeft } from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { title: string; icon: React.ReactNode; queryKey: string; getStories: (limit: number, pageParam: any, userProfile?: any) => Promise<{ stories: any[]; lastDoc?: any }> }> = {
  'recent': {
    title: 'Yeni Çıkanlar',
    icon: <Clock className="text-blue-500" size={32} />,
    queryKey: 'recent',
    getStories: (limit, pageParam) => getRecentStoriesPaginated(limit, pageParam)
  },
  'top': {
    title: 'Haftanın En Çok Okunanları',
    icon: <TrendingUp className="text-orange-500" size={32} />,
    queryKey: 'top',
    getStories: (limit, pageParam) => getTopStoriesPaginated(limit, pageParam)
  },
  'recommended': {
    title: 'Sana Özel / Günün Trendleri',
    icon: <Sparkles className="text-yellow-400" size={32} />,
    queryKey: 'recommended',
    getStories: async (limit, pageParam, userProfile) => {
      if (pageParam) return { stories: [], lastDoc: null }; 
      const stories = await getRecommendedStories(userProfile?.preferredGenres, 50);
      return { stories, lastDoc: true };
    }
  },
  'completed': {
    title: 'Kısa ve Öz (Tamamlanmış)',
    icon: <CheckCircle className="text-emerald-500" size={32} />,
    queryKey: 'completed',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null }; 
      const stories = await getCompletedStories(50);
      return { stories, lastDoc: true };
    }
  },
  'most-liked': {
    title: 'Kalplerin Efendileri',
    icon: <Heart className="text-pink-500" size={32} />,
    queryKey: 'mostLiked',
    getStories: async (limit, pageParam) => {
      if (pageParam) return { stories: [], lastDoc: null }; 
      const stories = await getMostLikedStories(50);
      return { stories, lastDoc: true };
    }
  }
};

export default function ExploreCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];
  
  const queryClient = useQueryClient();
  const { firebaseUser, userProfile } = useAuthStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  if (!config) {
    return (
      <div className="p-8 text-center mt-20">
        <Typography variant="h2">Kategori bulunamadı.</Typography>
        <button onClick={() => router.back()} className="mt-4 text-primary font-medium hover:underline">Geri Dön</button>
      </div>
    );
  }

  const { 
    data, 
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: ['explore', config.queryKey],
    queryFn: ({ pageParam }) => config.getStories(20, pageParam, userProfile),
    getNextPageParam: (lastPage: any) => lastPage.lastDoc || null,
    initialPageParam: null as any
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
  };

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-6 mb-8 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-card transition-colors text-muted hover:text-text"
        >
          <ArrowLeft size={24} />
        </button>
        {config.icon}
        <Typography variant="h2" className="font-bold text-2xl md:text-3xl">{config.title}</Typography>
      </div>

      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {stories.map((story) => (
                <div key={story.storyId} className="w-full transition-transform duration-300 hover:-translate-y-2">
                  <StoryCard
                    title={story.title}
                    authorName={story.authorName || 'Bilinmiyor'}
                    authorUsername={story.authorUsername} 
                    coverImage={story.coverImage}
                    views={story.stats?.views || 0}
                    likes={story.stats?.likes || 0}
                    tags={story.tags || []}
                    onPress={() => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
                    onLikePress={(e) => handleLikePress(e, story.storyId)}
                  />
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
