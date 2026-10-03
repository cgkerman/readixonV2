'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Bookmark, Loader2, Compass, Quote, Trash2, MessageCircle, ListMusic, Plus } from 'lucide-react';
import { Typography, Button, StoryCard, ReadixCard } from '@readixon/ui';
import { 
  useAuthStore, 
  getUserReadingProgress, 
  getSavedStories, 
  getStoriesByIds, 
  generateStorySlug, 
  getUserProfile, 
  getUserQuotes, 
  deleteSavedQuote, 
  getBookmarkedReadixes, 
  toggleReadixBookmark, 
  toggleReadixLike,
  getUserReadingLists,
  getUserLikedReadingLists,
  ReadingList,
} from '@readixon/core';
import type { Story, SavedQuote, Readix, User } from '@readixon/core';
import { ReadingListCard } from '@/components/reading-list/ReadingListCard';
import { CreateReadingListModal } from '@/components/reading-list/CreateReadingListModal';
import { toast } from 'sonner';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'reading' | 'saved' | 'lists' | 'quotes' | 'readixes'>('reading');
  const [readingSubTab, setReadingSubTab] = useState<'novels' | 'webtoons'>('novels');
  const [savedSubTab, setSavedSubTab] = useState<'novels' | 'webtoons'>('novels');
  const [listsSubTab, setListsSubTab] = useState<'myLists' | 'likedLists'>('myLists');
  const [loading, setLoading] = useState(true);
  const [readingStories, setReadingStories] = useState<(Story & { progress?: number })[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [savedReadixes, setSavedReadixes] = useState<Readix[]>([]);
  const [readixAuthors, setReadixAuthors] = useState<Record<string, User>>({});
  const [userLists, setUserLists] = useState<ReadingList[]>([]);
  const [likedLists, setLikedLists] = useState<ReadingList[]>([]);
  const [listCovers, setListCovers] = useState<Record<string, string[]>>({});
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  
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
        } else if (activeTab === 'lists') {
          const [myLists, liked] = await Promise.all([
            getUserReadingLists(firebaseUser.uid),
            getUserLikedReadingLists(firebaseUser.uid),
          ]);
          setUserLists(myLists);
          setLikedLists(liked);

          const allLists = [...myLists, ...liked];
          const allStoryIds = Array.from(new Set(allLists.flatMap(l => (l.storyIds || []).slice(0, 4))));
          if (allStoryIds.length > 0) {
            try {
              const fetchedStories = await getStoriesByIds(allStoryIds);
              const coverMap: Record<string, string> = {};
              fetchedStories.forEach(s => {
                const cover = s.coverImage || (s as any).coverUrl;
                if (cover) coverMap[s.storyId] = cover;
              });
              const listCoversMap: Record<string, string[]> = {};
              allLists.forEach(l => {
                listCoversMap[l.id] = (l.storyIds || [])
                  .slice(0, 4)
                  .map(id => coverMap[id])
                  .filter(Boolean);
              });
              setListCovers(listCoversMap);
            } catch (coverErr) {
              console.error('Liste kapakları alınamadı:', coverErr);
            }
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center pb-32">
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

    if (activeTab === 'lists') {
      const displayedLists = listsSubTab === 'myLists' ? userLists : likedLists;

      return (
        <div className="mt-6">
          {/* Üst Çubuk: Alt Sekmeler ve "+ Yeni Liste" Butonu */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setListsSubTab('myLists')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  listsSubTab === 'myLists'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                Oluşturduklarım ({userLists.length})
              </button>
              <button
                onClick={() => setListsSubTab('likedLists')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  listsSubTab === 'likedLists'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                Beğendiklerim ({likedLists.length})
              </button>
            </div>

            <button
              onClick={() => setIsCreateListOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-xs sm:text-sm transition-colors border border-primary/25 shadow-sm"
            >
              <Plus size={16} /> Yeni Liste Oluştur
            </button>
          </div>

          {displayedLists.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <ListMusic size={36} />
              </div>
              <Typography variant="h3" className="mb-2 text-text font-bold">
                {listsSubTab === 'myLists' ? 'Henüz Bir Okuma Listeniz Yok' : 'Henüz Beğendiğiniz Bir Liste Yok'}
              </Typography>
              <Typography variant="body" className="text-muted max-w-md mx-auto mb-6 text-xs sm:text-sm">
                {listsSubTab === 'myLists'
                  ? 'Hikayeleri Spotify çalma listeleri gibi bir araya getirin, özel kapaklarla derleyin ve herkesle paylaşın!'
                  : 'Beğendiğiniz veya takip ettiğiniz herkese açık listeler burada görünecektir.'}
              </Typography>
              {listsSubTab === 'myLists' && (
                <button
                  onClick={() => setIsCreateListOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-lg shadow-primary/25"
                >
                  <Plus size={16} /> İlk Listeni Oluştur
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {displayedLists.map(list => (
                <ReadingListCard
                  key={list.id}
                  list={list}
                  covers={listCovers[list.id]}
                  isOwner={list.userId === firebaseUser?.uid}
                />
              ))}
            </div>
          )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {savedQuotes.map(quote => (
            <div key={quote.id} className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative">
              <div>
                <Quote size={22} className="text-primary/40 mb-3" />
                <Typography variant="body" className="text-text font-serif italic text-base sm:text-lg leading-relaxed mb-5">
                  &ldquo;{quote.text}&rdquo;
                </Typography>
              </div>
              
              <div className="flex items-center justify-between border-t border-border/30 pt-3.5 mt-auto">
                <div 
                  className="cursor-pointer group/title min-w-0 flex-1 pr-2"
                  onClick={() => router.push(`/read/${quote.storyId}/${quote.chapterId}`)}
                >
                  <Typography variant="h4" className="text-xs sm:text-sm font-bold group-hover/title:text-primary transition-colors truncate">
                    {quote.storyTitle}
                  </Typography>
                  <Typography variant="body" className="text-[11px] sm:text-xs text-muted mt-0.5 truncate">
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
                className="absolute top-3.5 right-3.5 p-2 text-muted-foreground hover:text-red-500 bg-background/70 backdrop-blur opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all rounded-full"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
        {items.map((item) => {
          const story = item as Story;
          const progress = 'progress' in story ? (story as any).progress : undefined;
          
          return (
            <div key={story.storyId} className="relative group transition-transform duration-300 hover:-translate-y-1.5 active:scale-[0.98]">
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
    <div className="flex-1 px-4 sm:px-6 lg:p-10 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden pb-32 sm:pb-36 lg:pb-16">
      <div className="mb-6 sm:mb-8">
        <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 text-text">Kütüphanem</Typography>
        <Typography variant="body" className="text-xs sm:text-sm text-muted">Okuduklarınız ve okumak istedikleriniz.</Typography>
      </div>

      {/* ── Sekmeler (Mobilde Sayfa Taşmasını Önleyen Yatay Kaydırmalı Tab Bar) ── */}
      <div className="border-b border-border/50 max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-6 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('reading')}
            className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-base shrink-0 transition-all ${
              activeTab === 'reading' 
                ? 'border-primary text-primary shadow-[0_1px_0_0_currentColor]' 
                : 'border-transparent text-muted hover:text-text opacity-70 hover:opacity-100'
            }`}
          >
            <BookOpen size={17} className="shrink-0" />
            <span>Okuduklarım</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-base shrink-0 transition-all ${
              activeTab === 'saved' 
                ? 'border-primary text-primary shadow-[0_1px_0_0_currentColor]' 
                : 'border-transparent text-muted hover:text-text opacity-70 hover:opacity-100'
            }`}
          >
            <Bookmark size={17} className="shrink-0" />
            <span>Kaydedilenler</span>
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-base shrink-0 transition-all ${
              activeTab === 'lists' 
                ? 'border-primary text-primary shadow-[0_1px_0_0_currentColor]' 
                : 'border-transparent text-muted hover:text-text opacity-70 hover:opacity-100'
            }`}
          >
            <ListMusic size={17} className="shrink-0" />
            <span>Listelerim</span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-base shrink-0 transition-all ${
              activeTab === 'quotes' 
                ? 'border-primary text-primary shadow-[0_1px_0_0_currentColor]' 
                : 'border-transparent text-muted hover:text-text opacity-70 hover:opacity-100'
            }`}
          >
            <Quote size={17} className="shrink-0" />
            <span>Alıntılar</span>
          </button>
          <button
            onClick={() => setActiveTab('readixes')}
            className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-base shrink-0 transition-all ${
              activeTab === 'readixes' 
                ? 'border-primary text-primary shadow-[0_1px_0_0_currentColor]' 
                : 'border-transparent text-muted hover:text-text opacity-70 hover:opacity-100'
            }`}
          >
            <MessageCircle size={17} className="shrink-0" />
            <span>Gönderiler</span>
          </button>
        </div>
      </div>

      {(activeTab === 'reading' || activeTab === 'saved') && (
        <div className="flex items-center gap-2 mt-4 sm:mt-6 overflow-x-auto scrollbar-hide py-1 max-w-full">
          <Button 
            variant={activeTab === 'reading' ? (readingSubTab === 'novels' ? 'primary' : 'outline') : (savedSubTab === 'novels' ? 'primary' : 'outline')}
            onPress={() => activeTab === 'reading' ? setReadingSubTab('novels') : setSavedSubTab('novels')}
            className="rounded-full text-xs sm:text-sm py-1.5 px-4 shrink-0 shadow-sm"
          >
            Hikayeler
          </Button>
          <Button 
            variant={activeTab === 'reading' ? (readingSubTab === 'webtoons' ? 'primary' : 'outline') : (savedSubTab === 'webtoons' ? 'primary' : 'outline')}
            onPress={() => activeTab === 'reading' ? setReadingSubTab('webtoons') : setSavedSubTab('webtoons')}
            className="rounded-full text-xs sm:text-sm py-1.5 px-4 shrink-0 shadow-sm"
          >
            Çizgi Romanlar
          </Button>
        </div>
      )}

      {renderContent()}

      {/* Yeni Liste Oluşturma Modalı */}
      {firebaseUser && (
        <CreateReadingListModal
          isOpen={isCreateListOpen}
          onClose={() => setIsCreateListOpen(false)}
          userId={firebaseUser.uid}
          onSuccess={(created) => {
            setUserLists(prev => [created, ...prev]);
          }}
        />
      )}
    </div>
  );
}
