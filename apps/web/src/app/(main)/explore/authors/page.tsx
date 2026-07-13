"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, AuthorCard } from '@readixon/ui';
import { getFeaturedAuthors, followUser, unfollowUser, useAuthStore } from '@readixon/core';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

export default function ExploreAuthorsPage() {
  const router = useRouter();

  const { data: authors = [], isLoading } = useQuery({
    queryKey: ['explore', 'authors'],
    queryFn: () => getFeaturedAuthors(50),
  });

  const { firebaseUser, followingIds, toggleFollowingId } = useAuthStore();

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
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-6 mb-8 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-card transition-colors text-muted hover:text-text"
        >
          <ArrowLeft size={24} />
        </button>
        <Users className="text-purple-500" size={32} />
        <Typography variant="h2" className="font-bold text-2xl md:text-3xl">Öne Çıkan Yazarlar</Typography>
      </div>

      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {authors.map((author) => (
              <div key={author.uid} className="w-full transition-transform duration-300 hover:-translate-y-2 cursor-pointer" onClick={() => {
                if (author.username) {
                  router.push(`/profile/@${author.username}`);
                } else {
                  toast('Bu yazar henüz bir kullanıcı adı belirlememiş.');
                }
              }}>
                <AuthorCard
                  name={author.displayName}
                  username={author.username || 'bilinmiyor'}
                  avatarUrl={author.avatarUrl}
                  followers={author.stats?.followers || 0}
                  isFollowing={followingIds.includes(author.uid)}
                  isPremium={author.status === 'premium'}
                  onFollowPress={(e) => handleFollowToggle(e, author.uid)}
                />
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && authors.length === 0 && (
          <div className="w-full py-12 flex justify-center items-center">
            <Typography variant="caption" className="text-muted">Henüz yazar bulunmuyor.</Typography>
          </div>
        )}
      </div>
    </div>
  );
}
