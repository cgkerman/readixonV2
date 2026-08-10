'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Bookmark, Loader2, Compass, Quote, Trash2, MessageCircle } from 'lucide-react';
import { Typography, Button, StoryCard, ReadixCard } from '@readixon/ui';
import { useAuthStore, getUserReadingProgress, getSavedStories, getStoriesByIds, generateStorySlug, getUserProfile, getUserQuotes, deleteSavedQuote, getBookmarkedReadixes, toggleReadixBookmark, toggleReadixLike } from '@readixon/core';
import type { Story, SavedQuote, Readix, User } from '@readixon/core';
import { toast } from 'sonner';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'reading' | 'saved' | 'quotes' | 'readixes'>('reading');
  const [readingSubTab, setReadingSubTab] = useState<'novels' | 'webtoons'>('novels');
  const [savedSubTab, setSavedSubTab] = useState<'novels' | 'webtoons'>('novels');
  const [loading, setLoading] = useState(true);
  const [readingStories, setReadingStories] = useState<(Story & { progress?: number })[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [savedReadixes, setSavedReadixes] = useState<Readix[]>([]);
  const [readixAuthors, setReadixAuthors] = useState<Record<string, User>>({});
  
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
        } else if (activeTab === 'readixes') {
          const readixes = await getBookmarkedReadixes(firebaseUser.uid);
          setSavedReadixes(readixes);
          
          const authorsMap: Record<string, User> = {};
          for (const r of readixes) {
            if (!authorsMap[r.authorId]) {
              const profile = await getUserProfile(r.authorId);
              if (profile) authorsMap[r.authorId] = profile as User;
            }
            if (r.originalReadix && !authorsMap[r.originalReadix.authorId]) {
              const profile = await getUserProfile(r.originalReadix.authorId);
              if (profile) authorsMap[r.originalReadix.authorId] = profile as User;
            }
          }
          setReadixAuthors(authorsMap);
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

    let items: any[] = [];
    if (activeTab === 'reading') {
      items = readingStories.filter(s => readingSubTab === 'webtoons' ? s.format === 'webtoon' : s.format !== 'webtoon');
    } else if (activeTab === 'saved') {
      items = savedStories.filter(s => savedSubTab === 'webtoons' ? s.format === 'webtoon' : s.format !== 'webtoon');
    } else if (activeTab === 'readixes') {
      items = savedReadixes;
    } else {
      items = savedQuotes;
    }

    if (items.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center mt-8">
          <div className="w-24 h-24 rounded-full bg-muted/5 flex items-center justify-center mb-6">
            {activeTab === 'reading' ? (
              <BookOpen size={40} className="text-muted/40" />
            ) : activeTab === 'saved' ? (
              <Bookmark size={40} className="text-muted/40" />
            ) : activeTab === 'readixes' ? (
              <MessageCircle size={40} className="text-muted/40" />
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
                : activeTab === 'readixes'
                ? 'Henüz hiçbir Readix gönderisini kaydetmemişsiniz.'
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

    if (activeTab === 'readixes') {
      return (
        <div className="flex flex-col gap-4 mt-8 max-w-2xl mx-auto">
          {savedReadixes.map(readix => {
            const isRepost = !!readix.originalReadix;
            const targetReadix = isRepost ? readix.originalReadix! : readix;
            const reposter = isRepost ? readixAuthors[readix.authorId] : null;
            const author = readixAuthors[targetReadix.authorId];
            
            return (
              <ReadixCard
                key={readix.id}
                linkedStory={targetReadix.linkedStory}
                authorName={author?.displayName || 'Bilinmeyen Kullanıcı'}
                authorUsername={author?.username || 'user'}
                authorAvatarUrl={author?.avatarUrl}
                repostOfAuthorName={reposter?.displayName}
                content={targetReadix.content}
                mediaUrls={targetReadix.mediaUrls}
                createdAtStr={targetReadix.createdAt ? new Date((targetReadix.createdAt as any).seconds ? (targetReadix.createdAt as any).seconds * 1000 : (targetReadix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'}
                likesCount={targetReadix.stats?.likes || 0}
                commentsCount={targetReadix.stats?.comments || 0}
                repostsCount={targetReadix.stats?.reposts || 0}
                bookmarksCount={targetReadix.stats?.bookmarks || 0}
                poll={targetReadix.poll as any}
                isOwner={firebaseUser?.uid === readix.authorId}
                currentUserId={firebaseUser?.uid}
                isBookmarked={true}
                onAuthorPress={() => author?.username && router.push(`/profile/@${author.username}`)}
                onLikePress={async () => {
                  if (!firebaseUser) return;
                  await toggleReadixLike(firebaseUser.uid, targetReadix.id);
                  toast.success("Beğeni güncellendi.");
                }}
                onBookmarkPress={async () => {
                  if (!firebaseUser) return;
                  const newStatus = await toggleReadixBookmark(firebaseUser.uid, targetReadix.id);
                  if (!newStatus) {
                    setSavedReadixes(prev => prev.filter(r => r.id !== readix.id));
                    toast.success("Gönderi kaydedilenlerden çıkarıldı.");
                  }
                }}
                onCommentPress={() => toast('Detaylı etkileşim için Readix sayfasına gidin.')}
                onSharePress={() => toast('Detaylı etkileşim için Readix sayfasına gidin.')}
                onRepostPress={() => toast('Detaylı etkileşim için Readix sayfasına gidin.')}
                onPress={() => toast('Detaylı etkileşim için Readix sayfasına gidin.')}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6 mt-8">
        {items.map((item) => {
          const story = item as Story;
          const progress = 'progress' in story ? (story as any).progress : undefined;
          
          return (
            <div key={story.storyId} className="relative group transition-transform duration-300 hover:-translate-y-2">
              <StoryCard
                title={story.title}
                authorName={story.authorName || `Yazar: ${story.authorId.substring(0, 6)}`}
                authorUsername={story.authorUsername}
                authorAvatarUrl={story.authorAvatarUrl}
                coverImage={story.coverImage}
                views={story.stats?.views || 0}
                likes={story.stats?.likes || 0}
                tags={story.tags || []}
                isWebtoon={story.format === 'webtoon'}
                status={story.status}
                chapterCount={story.stats?.chapterCount}
                progress={activeTab === 'reading' ? progress : undefined}
                onPress={() => {
                  const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                  router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                }}
              />
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
        <button
          onClick={() => setActiveTab('readixes')}
          className={`flex items-center gap-2 py-4 border-b-2 transition-all ${
            activeTab === 'readixes' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <MessageCircle size={18} />
          Gönderiler
        </button>
      </div>

      {(activeTab === 'reading' || activeTab === 'saved') && (
        <div className="flex items-center gap-2 mt-6">
          <Button 
            variant={activeTab === 'reading' ? (readingSubTab === 'novels' ? 'primary' : 'outline') : (savedSubTab === 'novels' ? 'primary' : 'outline')}
            onPress={() => activeTab === 'reading' ? setReadingSubTab('novels') : setSavedSubTab('novels')}
            className="rounded-full text-sm py-1.5 px-4"
          >
            Hikayeler
          </Button>
          <Button 
            variant={activeTab === 'reading' ? (readingSubTab === 'webtoons' ? 'primary' : 'outline') : (savedSubTab === 'webtoons' ? 'primary' : 'outline')}
            onPress={() => activeTab === 'reading' ? setReadingSubTab('webtoons') : setSavedSubTab('webtoons')}
            className="rounded-full text-sm py-1.5 px-4"
          >
            Çizgi Romanlar
          </Button>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
