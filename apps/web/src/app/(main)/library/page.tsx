'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Bookmark, Loader2, Compass, Quote, Trash2 } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { StoryCard } from '@readixon/ui';
import { useAuthStore, getUserReadingProgress, getSavedStories, getStoriesByIds, generateStorySlug, getUserProfile, getUserQuotes, deleteSavedQuote } from '@readixon/core';
import type { Story, SavedQuote } from '@readixon/core';
import { toast } from 'sonner';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'reading' | 'saved' | 'quotes'>('reading');
  const [loading, setLoading] = useState(true);
  const [readingStories, setReadingStories] = useState<(Story & { progress?: number })[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  
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
            // Sadece yayınlanmış hikayeleri filtrele
            const publishedStories = stories.filter(s => s.status !== 'draft');
            
            // Eksik yazar bilgilerini tamamla
            for (let story of publishedStories) {
              if (!story.authorName) {
                const authorProfile = await getUserProfile(story.authorId);
                if (authorProfile) {
                  story.authorName = authorProfile.displayName;
                  story.authorUsername = authorProfile.username;
                }
              }
            }
            
            // İlerlemeyi birleştir
            const merged = publishedStories.map(story => {
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
          } else if (activeTab === 'saved') {
          const savedIds = await getSavedStories(firebaseUser.uid);
          if (savedIds.length > 0) {
            const stories = await getStoriesByIds(savedIds);
            
            // Sadece yayınlanmış hikayeleri filtrele
            const publishedSavedStories = stories.filter(s => s.status !== 'draft');
            
            // Eksik yazar bilgilerini tamamla
            for (let story of publishedSavedStories) {
              if (!story.authorName) {
                const authorProfile = await getUserProfile(story.authorId);
                if (authorProfile) {
                  story.authorName = authorProfile.displayName;
                  story.authorUsername = authorProfile.username;
                }
              }
            }
            
            setSavedStories(publishedSavedStories);
          } else {
            setSavedStories([]);
          }
        } else if (activeTab === 'quotes') {
          const quotes = await getUserQuotes(firebaseUser.uid);
          setSavedQuotes(quotes);
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

    const items = activeTab === 'reading' ? readingStories : activeTab === 'saved' ? savedStories : savedQuotes;

    if (items.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center mt-8">
          <div className="w-24 h-24 rounded-full bg-muted/5 flex items-center justify-center mb-6">
            {activeTab === 'reading' ? (
              <BookOpen size={40} className="text-muted/40" />
            ) : activeTab === 'saved' ? (
              <Bookmark size={40} className="text-muted/40" />
            ) : (
              <Quote size={40} className="text-muted/40" />
            )}
          </div>
          <Typography variant="h3" className="mb-3 text-text/90 tracking-tight">Burada Henüz Bir Şey Yok</Typography>
          <Typography variant="body" className="text-muted max-w-sm mx-auto mb-8">
            {activeTab === 'reading' 
              ? 'Henüz okumaya başladığınız bir hikaye bulunmuyor. Yeni dünyalar keşfetmeye hemen başlayın.' 
              : activeTab === 'saved' 
                ? 'Daha sonra okumak için henüz hiçbir hikayeyi kaydetmemişsiniz.'
                : 'Okurken altını çizdiğiniz veya kaydettiğiniz hiçbir alıntı bulunmuyor.'}
          </Typography>
          <Button variant="primary" onPress={() => router.push('/feed')} className="rounded-full px-6">
            <Compass size={18} className="mr-2" /> Keşfetmeye Başla
          </Button>
        </div>
      );
    }

    if (activeTab === 'quotes') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {savedQuotes.map(quote => (
            <div key={quote.id} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative">
              <div>
                <Quote size={24} className="text-primary/40 mb-4" />
                <Typography variant="body" className="text-text font-serif italic text-lg leading-relaxed mb-6">
                  "{quote.text}"
                </Typography>
              </div>
              
              <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-auto">
                <div 
                  className="cursor-pointer group/title"
                  onClick={() => router.push(`/read/${quote.storyId}/${quote.chapterId}`)}
                >
                  <Typography variant="h4" className="text-sm font-bold group-hover/title:text-primary transition-colors line-clamp-1">
                    {quote.storyTitle}
                  </Typography>
                  <Typography variant="body" className="text-xs text-muted mt-0.5">
                    {quote.authorName} {quote.authorUsername && `@${quote.authorUsername}`}
                  </Typography>
                </div>
              </div>
              
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!firebaseUser) return;
                  if (confirm('Bu alıntıyı silmek istediğinize emin misiniz?')) {
                    try {
                      await deleteSavedQuote(firebaseUser.uid, quote.id);
                      setSavedQuotes(prev => prev.filter(q => q.id !== quote.id));
                      toast.success("Alıntı silindi.");
                    } catch(err) {
                      toast.error("Alıntı silinemedi.");
                    }
                  }
                }}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 bg-background/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-all rounded-full"
                title="Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {items.map((item) => {
          const story = item as Story;
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
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 py-4 border-b-2 transition-all ${
            activeTab === 'quotes' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Quote size={18} />
          Alıntılar
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
