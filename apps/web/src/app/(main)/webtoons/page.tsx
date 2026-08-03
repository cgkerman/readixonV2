'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, StoryCard } from '@readixon/ui';
import { getWebtoonsPaginated } from '@readixon/core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { GalleryVertical, Sparkles } from 'lucide-react';

export default function WebtoonsPage() {
  const router = useRouter();

  const {
    data: webtoonsData,
    isLoading: webtoonsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['webtoons', 'recent'],
    queryFn: ({ pageParam }) => getWebtoonsPaginated(12, pageParam as any),
    getNextPageParam: (lastPage: any) => lastPage.lastDoc || null,
    initialPageParam: null as any
  });

  const webtoons = webtoonsData?.pages.flatMap((p: any) => p.stories) || [];

  if (webtoonsLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      
      {/* Banner / Header */}
      <section className="w-full relative py-20 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay z-0" />
        
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4">
            <GalleryVertical size={40} />
          </div>
          <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold mb-4">
            Çizgilerin <span className="text-primary">Gücü</span>
          </Typography>
          <Typography variant="body" className="text-lg text-muted">
            En yeni ve popüler çizgi romanları, mangaları ve webtoonları keşfedin. Hikayeler artık sadece kelimelerde değil, çizgilerde de hayat buluyor.
          </Typography>
        </div>
      </section>

      {/* Webtoons Grid */}
      <section className="w-full max-w-[1600px] px-6 lg:px-12 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-primary" size={28} />
          <Typography variant="h2">Tüm Webtoonlar</Typography>
        </div>

        {webtoons.length === 0 ? (
          <div className="text-center py-20 text-muted">
            Henüz webtoon bulunmuyor. İlk webtoonu oluşturan sen ol!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {webtoons.map(story => (
              <StoryCard
                key={story.storyId}
                title={story.title}
                authorName={story.authorName || 'Bilinmeyen Yazar'}
                authorAvatarUrl={story.authorAvatarUrl}
                coverImage={story.coverImage}
                views={story.stats?.views || 0}
                likes={story.stats?.likes || 0}
                isWebtoon={true}
                status={story.status}
                onPress={() => router.push(`/webtoons/${(story as any).slug || story.storyId}`)}
              />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => fetchNextPage()} 
              disabled={isFetchingNextPage}
              className="px-8 py-3 bg-card border border-border/50 rounded-full font-bold text-text hover:border-primary/50 transition-colors shadow-sm disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Göster'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
