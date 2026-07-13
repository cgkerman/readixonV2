'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Bookmark, Loader2, Compass } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { StoryCard } from '@readixon/ui';
import { useAuthStore, getUserReadingProgress, getSavedStories, getStoriesByIds, generateStorySlug, getUserProfile } from '@readixon/core';
import type { Story } from '@readixon/core';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'reading' | 'saved'>('reading');
  const [loading, setLoading] = useState(true);
  const [readingStories, setReadingStories] = useState<(Story & { progress?: number })[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  
  const { firebaseUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!firebaseUser?.uid) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        if (activeTab === 'reading') {
          const progresses = await getUserReadingProgress(firebaseUser.uid);
          if (progresses.length > 0) {
            const storyIds = progresses.map(p => p.storyId);
            const stories = await getStoriesByIds(storyIds);
            
            // Eksik yazar bilgilerini tamamla
            for (let story of stories) {
              if (!story.authorName) {
                const authorProfile = await getUserProfile(story.authorId);
                if (authorProfile) {
                  story.authorName = authorProfile.displayName;
                  story.authorUsername = authorProfile.username;
                }
              }
            }
            
            // İlerlemeyi birleştir
            const merged = stories.map(story => {
              const prog = progresses.find(p => p.storyId === story.storyId);
              return {
                ...story,
                progress: prog ? prog.scrollPercentage : 0
              };
            });
            setReadingStories(merged);
          } else {
            setReadingStories([]);
          }
        } else {
          const savedIds = await getSavedStories(firebaseUser.uid);
          if (savedIds.length > 0) {
            const stories = await getStoriesByIds(savedIds);
            
            // Eksik yazar bilgilerini tamamla
            for (let story of stories) {
              if (!story.authorName) {
                const authorProfile = await getUserProfile(story.authorId);
                if (authorProfile) {
                  story.authorName = authorProfile.displayName;
                  story.authorUsername = authorProfile.username;
                }
              }
            }
            
            setSavedStories(stories);
          } else {
            setSavedStories([]);
          }
        }
      } catch (error) {
        console.error('Kütüphane verileri çekilirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLibraryData();
  }, [firebaseUser, activeTab]);

  if (!firebaseUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center mb-6">
          <BookOpen size={48} className="text-muted/50" />
        </div>
        <Typography variant="h2" className="mb-2">Kütüphanenize Erişin</Typography>
        <Typography variant="body" className="text-muted max-w-md mx-auto mb-8">
          Okumaya başladığınız ve daha sonra okumak için kaydettiğiniz hikayeleri görebilmek için giriş yapmalısınız.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/login')} className="px-8 rounded-full">
          Giriş Yap
        </Button>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center p-12 mt-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      );
    }

    const items = activeTab === 'reading' ? readingStories : savedStories;

    if (items.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center mt-8">
          <div className="w-24 h-24 rounded-full bg-muted/5 flex items-center justify-center mb-6">
            {activeTab === 'reading' ? (
              <BookOpen size={40} className="text-muted/40" />
            ) : (
              <Bookmark size={40} className="text-muted/40" />
            )}
          </div>
          <Typography variant="h3" className="mb-3 text-text/90 tracking-tight">Burada Henüz Bir Şey Yok</Typography>
          <Typography variant="body" className="text-muted max-w-sm mx-auto mb-8">
            {activeTab === 'reading' 
              ? 'Henüz okumaya başladığınız bir hikaye bulunmuyor. Yeni dünyalar keşfetmeye hemen başlayın.' 
              : 'Daha sonra okumak için henüz hiçbir hikayeyi kaydetmemişsiniz.'}
          </Typography>
          <Button variant="primary" onPress={() => router.push('/feed')} className="rounded-full px-6">
            <Compass size={18} className="mr-2" /> Keşfetmeye Başla
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {items.map((story) => {
          const progress = 'progress' in story ? (story as any).progress : undefined;
          
          return (
            <div key={story.storyId} className="relative group">
              <StoryCard
                title={story.title}
                authorName={story.authorName || `Yazar: ${story.authorId.substring(0, 6)}`}
                authorUsername={story.authorUsername}
                coverImage={story.coverImage}
                views={story.stats?.views || 0}
                likes={story.stats?.likes || 0}
                tags={story.tags || []}
                onPress={() => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              />
              {/* Progress Bar for Reading Tab */}
              {activeTab === 'reading' && progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-background overflow-hidden rounded-b-xl z-20">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <Typography variant="h1" className="font-bold tracking-tight mb-2 text-text">Kütüphanem</Typography>
        <Typography variant="body" className="text-muted">Okuduklarınız ve okumak istedikleriniz.</Typography>
      </div>

      <div className="flex items-center gap-6 border-b border-border/50 pb-px">
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 py-4 border-b-2 transition-all ${
            activeTab === 'reading' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <BookOpen size={18} />
          Okuduklarım
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-4 border-b-2 transition-all ${
            activeTab === 'saved' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Bookmark size={18} />
          Kaydedilenler
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
