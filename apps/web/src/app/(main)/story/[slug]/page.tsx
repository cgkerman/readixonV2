"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Typography, Button, ReadixCard, StoryCard } from '@readixon/ui';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { 
  getStoryById, 
  getUserProfile, 
  getPublishedChapters, 
  extractStoryIdFromSlug,
  toggleSaveStory,
  getSavedStories,
  getReviews,
  addReview,
  checkStoryLiked,
  toggleStoryLike,
  incrementStoryView,
  useAuthStore,
  getCharacters,
  trackInteraction,
  getReadixesByStoryId,
  Readix,
  db,
  getEditorialReviewByStoryId,
  getReadingProgress
} from '@readixon/core';
import type { Story, User, Chapter, Review, Character, EditorialReview, ReadingProgress } from '@readixon/core';
import { 
  BookOpen, Heart, Eye, List, Play, BookmarkPlus, BookmarkCheck, 
  ArrowLeft, Loader2, Star, MessageSquare, Users, Hash,
  Lock, Calendar, Bell, Info, X, Sparkles, ChevronRight, Bookmark, Check,
  ListPlus, Share2, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";
import { AddToReadingListModal } from '@/components/reading-list/AddToReadingListModal';

type ActiveTab = 'about' | 'chapters' | 'reviews' | 'characters';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { firebaseUser, isInitialized, userProfile } = useAuthStore();
  
  const slug = params.slug as string;
  const storyId = extractStoryIdFromSlug(slug);

  const [story, setStory] = useState<Story | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editorialReview, setEditorialReview] = useState<EditorialReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);

  const [showCharacterBookInfo, setShowCharacterBookInfo] = useState(false);
  const [visibleChaptersCount, setVisibleChaptersCount] = useState(20);

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');
  const [chapterSortOrder, setChapterSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Metin Genişletme Durumları
  const [isForewordExpanded, setIsForewordExpanded] = useState(false);
  const [isBackCoverExpanded, setIsBackCoverExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Bahsedilenler
  const [mentions, setMentions] = useState<Readix[]>([]);
  const [mentionsLoading, setMentionsLoading] = useState(false);
  const [mentionsAuthors, setMentionsAuthors] = useState<Record<string, User>>({});
  const [visibleMentionsCount, setVisibleMentionsCount] = useState(3);

  // Benzer Kitaplar
  const [similarStories, setSimilarStories] = useState<Story[]>([]);

  // İnceleme Formu
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(10);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [isAddToReadingListOpen, setIsAddToReadingListOpen] = useState(false);

  // Floating Bar için hem <main>, document hem window scroll dinleyicisi
  useEffect(() => {
    if (loading) return;

    const handleScroll = (e?: any) => {
      const targetScroll = e?.target?.scrollTop ?? 0;
      const mainEl = document.querySelector('main');
      const scrollPos = Math.max(
        targetScroll,
        window.scrollY || 0,
        window.pageYOffset || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0,
        mainEl?.scrollTop || 0
      );
      setShowStickyBar(scrollPos > 180);
    };

    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    handleScroll();

    return () => {
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true } as any);
    };
  }, [story, loading]);

  useEffect(() => {
    // Load reminders from local storage
    try {
      const stored = localStorage.getItem('chapterReminders');
      if (stored) setReminders(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleToggleReminder = (chapterId: string) => {
    const isCurrentlyReminded = reminders.includes(chapterId);

    setReminders(prev => {
      const newReminders = prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId];
      localStorage.setItem('chapterReminders', JSON.stringify(newReminders));
      return newReminders;
    });

    if (!isCurrentlyReminded) {
      toast.success("Bildirimler açıldı! Bölüm yayınlandığında haber vereceğiz.");
    } else {
      toast.info("Bu bölüm için bildirimler kapatıldı.");
    }
  };

  useEffect(() => {
    const fetchStoryData = async () => {
      if (!storyId) return;
      
      try {
        const fetchedStory = await getStoryById(storyId);
        if (!fetchedStory) {
          setError('Hikaye bulunamadı veya yayından kaldırılmış olabilir.');
          setLoading(false);
          return;
        }

        setStory(fetchedStory);
        
        // Görüntülenmeyi artır (Sadece bir kere)
        incrementStoryView(storyId);

        // Yazar, bölümler, incelemeler ve editoryal değerlendirmeyi paralel çek
        const [fetchedAuthor, fetchedChapters, fetchedReviews, fetchedCharacters, fetchedEditorialReview] = await Promise.all([
          getUserProfile(fetchedStory.authorId),
          getPublishedChapters(storyId),
          getReviews(storyId),
          getCharacters(storyId).catch(err => {
            console.warn("Karakterler yüklenirken Firebase izin hatası:", err);
            return [];
          }),
          getEditorialReviewByStoryId(storyId).catch(err => {
            console.warn("Editoryal inceleme çekilirken hata:", err);
            return null;
          })
        ]);
        
        setAuthor(fetchedAuthor);
        setChapters(fetchedChapters);
        setReviews(fetchedReviews);
        setCharacters(fetchedCharacters);
        setEditorialReview(fetchedEditorialReview);
        setLoading(false);

        // Benzer kitapları getir (Arka planda yüklenir)
        if (fetchedStory.tags && fetchedStory.tags.length > 0) {
          try {
            const storiesRef = collection(db, 'stories');
            const similarQuery = query(
              storiesRef,
              where('tags', 'array-contains-any', fetchedStory.tags.slice(0, 10)),
              limit(20)
            );
            const similarSnapshot = await getDocs(similarQuery);
            const similar: Story[] = [];
            similarSnapshot.forEach(doc => {
              if (doc.id !== storyId) {
                const data = doc.data() as Story;
                if ((data.status === 'ongoing' || data.status === 'completed') && data.format !== 'webtoon') {
                  similar.push({ ...data, storyId: doc.id });
                }
              }
            });
            
            similar.sort((a, b) => (b.stats?.likes || 0) - (a.stats?.likes || 0));
            const top5 = similar.slice(0, 6);

            const enrichedTop5 = await Promise.all(top5.map(async (sim) => {
              if (sim.authorId) {
                const user = await getUserProfile(sim.authorId);
                return {
                  ...sim,
                  authorName: user?.displayName || sim.authorName || 'Bilinmeyen Yazar',
                  authorUsername: user?.username || sim.authorUsername,
                  authorAvatarUrl: user?.avatarUrl || sim.authorAvatarUrl,
                };
              }
              return sim;
            }));

            setSimilarStories(enrichedTop5);
          } catch (e) {
            console.error("Benzer kitaplar yüklenirken hata:", e);
          }
        }
      } catch (err) {
        console.error("Hikaye yüklenirken hata:", err);
        setError('Bir hata oluştu, lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [storyId]);

  useEffect(() => {
    const checkUserStates = async () => {
      if (isInitialized && firebaseUser && storyId) {
        const savedIds = await getSavedStories(firebaseUser.uid);
        setIsSaved(savedIds.includes(storyId));
        
        const liked = await checkStoryLiked(storyId, firebaseUser.uid);
        setIsLiked(liked);

        try {
          const progress = await getReadingProgress(firebaseUser.uid, storyId);
          setReadingProgress(progress);
        } catch (e) {
          console.error("Okuma ilerlemesi alınamadı:", e);
        }
      }
    };
    checkUserStates();
  }, [firebaseUser, isInitialized, storyId]);

  useEffect(() => {
    if (mentions.length === 0 && !mentionsLoading) {
      const fetchMentions = async () => {
        if (!storyId) return;
        setMentionsLoading(true);
        try {
          const res = await getReadixesByStoryId(storyId);
          setMentions(res.readixes);
          
          const authorsMap: Record<string, User> = { ...mentionsAuthors };
          for (const r of res.readixes) {
            if (!authorsMap[r.authorId]) {
              const u = await getUserProfile(r.authorId);
              if (u) authorsMap[r.authorId] = u;
            }
          }
          setMentionsAuthors(authorsMap);
        } catch (e) {
          console.error(e);
        } finally {
          setMentionsLoading(false);
        }
      };
      fetchMentions();
    }
  }, [storyId]);

  const handleToggleSave = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    setSaving(true);
    try {
      const nowSaved = await toggleSaveStory(firebaseUser.uid, storyId);
      setIsSaved(nowSaved);
      if (nowSaved) {
        toast.success("Kitap kütüphanene eklendi!");
        trackInteraction(firebaseUser.uid, 'story_library_added').catch(console.error);
      } else {
        toast.info("Kitap kütüphanenden çıkarıldı.");
      }
    } catch (err) {
      console.error("Kaydetme işlemi başarısız:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || 'Readixon Kitabı',
          text: `${story?.title} hikayesini Readixon'da keşfet!`,
          url,
        });
        return;
      } catch (e) {
        // İptal edildi veya desteklenmiyor
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Kitap bağlantısı panoya kopyalandı!");
    } catch (e) {
      toast.error("Bağlantı kopyalanamadı.");
    }
  };

  const handleSubmitReview = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await addReview(storyId, firebaseUser.uid, reviewRating, reviewText);
      setReviews(prev => [{
        reviewId: Date.now().toString(),
        storyId,
        userId: firebaseUser.uid,
        authorName: userProfile?.displayName,
        authorUsername: userProfile?.username,
        authorAvatarUrl: userProfile?.avatarUrl,
        rating: reviewRating,
        text: reviewText,
        createdAt: new Date().toISOString() as any
      }, ...prev]);
      setReviewText('');
      setReviewRating(10);
      toast.success("İncelemeniz başarıyla yayınlandı!");
      trackInteraction(firebaseUser.uid, 'comment_given').catch(console.error);
      
      if (story) {
        const newCount = (story.stats?.reviewCount || 0) + 1;
        const currentTotal = (story.stats?.rating || 0) * (story.stats?.reviewCount || 0);
        const newRating = (currentTotal + reviewRating) / newCount;
        setStory({
          ...story,
          stats: {
            ...story.stats,
            reviewCount: newCount,
            rating: Math.round(newRating * 10) / 10
          }
        });
      }
    } catch (error) {
      console.error("İnceleme gönderilirken hata:", error);
      toast.error("İnceleme gönderilemedi.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleLike = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (isLikeLoading || !story) return;
    
    setIsLikeLoading(true);
    try {
      const nowLiked = await toggleStoryLike(storyId, firebaseUser.uid);
      setIsLiked(nowLiked);
      
      const likeDelta = nowLiked ? 1 : -1;
      
      setStory({
        ...story,
        stats: {
          ...story.stats,
          likes: (story.stats?.likes || 0) + likeDelta
        }
      });
      
      queryClient.setQueryData(['stories', 'recent'], (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              stories: page.stories.map((s: any) => 
                s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
              )
            }))
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((s: any) => 
            s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
          );
        }
        return oldData;
      });

      queryClient.setQueryData(['stories', 'top'], (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              stories: page.stories.map((s: any) => 
                s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
              )
            }))
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((s: any) => 
            s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
          );
        }
        return oldData;
      });
      
    } catch (err) {
      console.error("Beğeni işlemi başarısız:", err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Hedef Bölüm Hesabı (Kaldığı yer veya ilk bölüm)
  const targetChapterId = useMemo(() => {
    if (chapters.length === 0) return null;
    if (!readingProgress) return chapters[0]?.chapterId;
    if (readingProgress.currentChapterId && !readingProgress.completedChapters?.includes(readingProgress.currentChapterId)) {
      return readingProgress.currentChapterId;
    }
    const nextUnread = chapters.find(c => !readingProgress.completedChapters?.includes(c.chapterId));
    return nextUnread?.chapterId || readingProgress.currentChapterId || chapters[0]?.chapterId;
  }, [chapters, readingProgress]);

  const targetChapterTitle = useMemo(() => {
    if (!targetChapterId) return null;
    const chap = chapters.find(c => c.chapterId === targetChapterId);
    return chap?.title || null;
  }, [chapters, targetChapterId]);

  // Sıralanmış bölümler
  const sortedChapters = useMemo(() => {
    if (chapterSortOrder === 'desc') {
      return [...chapters].reverse();
    }
    return chapters;
  }, [chapters, chapterSortOrder]);

  const hasReadingHistory = Boolean(
    readingProgress?.currentChapterId || (readingProgress?.completedChapters && readingProgress.completedChapters.length > 0)
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center mb-5">
          <BookOpen size={36} className="text-red-400" />
        </div>
        <Typography variant="h2" className="text-text mb-2 font-black text-xl">Eyvah!</Typography>
        <Typography variant="body" className="text-muted mb-6 text-sm max-w-sm">{error}</Typography>
        <Button variant="outline" onPress={() => router.push('/feed')}>Akışa Dön</Button>
      </div>
    );
  }

  const isPremiumOrAdmin = userProfile?.status === 'premium' || userProfile?.isAdmin === true;
  const isStoryAuthor = firebaseUser?.uid === story.authorId;
  const canViewCharacters = isPremiumOrAdmin || isStoryAuthor;

  const editorialAverageScore = editorialReview?.scores 
    ? (Object.values(editorialReview.scores).reduce((a, b) => a + b, 0) / Object.values(editorialReview.scores).length).toFixed(1)
    : '9.0';

  const handleStartReading = () => {
    if (targetChapterId) {
      router.push(`/read/${storyId}/${targetChapterId}`);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/feed');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-32 overflow-x-hidden selection:bg-primary/20">
      
      {/* ── Karakter Defteri Bilgi Modalı ── */}
      {showCharacterBookInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowCharacterBookInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/20 text-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <Users size={22} className="text-primary" />
              <Typography variant="h2" className="text-xl font-black text-text">Karakter Defteri</Typography>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-muted leading-relaxed">
              <p>Karakter defteri, hikayedeki kahramanların fiziksel, psikolojik ve geçmişe dair derinlemesine bilgilerinin yer aldığı özel bir kurgu ansiklopedisidir.</p>
              <p>Yazarlar bu bölümü kullanarak okuyucularına karakterlerin bilinmeyen yönlerini sunabilir. Bu özellik <strong className="text-amber-500 font-bold">Premium</strong> üyelere ve hikaye sahibine açıktır.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" onPress={() => setShowCharacterBookInfo(false)} className="rounded-xl px-5 text-xs font-bold">
                Anladım
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. HERO ALANI (Kapak, Başlık, İstatistikler, Hızlı Aksiyonlar) ── */}
      <div className="relative w-full">
        
        {/* Arka Plan Bulanık Kapak */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 filter blur-3xl opacity-35"
            style={{ backgroundImage: `url(${story.coverImage})` }}
          />
          <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>

        {/* Üst Bar: Geri Dönüş & Paylaş */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between">
          <button 
            onClick={handleGoBack}
            className="p-2.5 rounded-full bg-card/60 hover:bg-card/90 active:scale-95 backdrop-blur-md border border-border/50 text-text transition-all shadow-sm cursor-pointer"
            title="Geri Dön"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              disabled={isLikeLoading}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isLiked 
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-500' 
                  : 'bg-card/60 hover:bg-card/90 border-border/50 text-text/80'
              }`}
              title="Beğen"
            >
              <Heart size={18} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
              <span>{story.stats?.likes || 0}</span>
            </button>

            <button 
              onClick={handleShare}
              className="p-2.5 rounded-full bg-card/60 hover:bg-card/90 active:scale-95 backdrop-blur-md border border-border/50 text-text transition-all shadow-sm cursor-pointer"
              title="Kitabı Paylaş"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Hero İçeriği */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
          
          {/* Kapak Resmi (Mobilde 136px, Geniş ekranda 220px) */}
          <div className="w-36 sm:w-44 md:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-border/60 relative group">
            {story.coverImage ? (
              <img 
                src={story.coverImage} 
                alt={story.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full bg-muted/10 flex items-center justify-center">
                <BookOpen size={44} className="text-muted/40" />
              </div>
            )}
          </div>

          {/* Kitap Bilgileri & Başlık */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
            
            {/* Status & Puan Rozetleri */}
            <div className="flex flex-wrap gap-2 mb-2.5 justify-center md:justify-start items-center">
              <span className="px-3 py-1 bg-card/80 backdrop-blur-md text-text text-[11px] font-bold rounded-full border border-border/50 shadow-xs">
                {story.status === 'completed' ? 'Tamamlandı' : story.status === 'ongoing' ? 'Devam Ediyor' : 'Taslak'}
              </span>

              <span className="px-3 py-1 bg-card/80 backdrop-blur-md text-text text-[11px] font-bold rounded-full border border-border/50 shadow-xs flex items-center gap-1">
                <Star size={12} className="text-amber-500 fill-amber-500" /> {story.stats?.rating?.toFixed(1) || '0.0'}
              </span>

              {editorialReview && (
                <Link href={`/reviews/${editorialReview.id}`} className="group inline-flex items-center">
                  <span className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 text-[11px] font-bold rounded-full border border-amber-500/30 shadow-xs flex items-center gap-1.5 transition-all">
                    <Sparkles size={12} className="text-amber-500 animate-pulse" /> Editör Puanı: {editorialAverageScore}/10
                  </span>
                </Link>
              )}
            </div>

            {/* Başlık */}
            <Typography 
              variant="h1" 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text mb-2 leading-tight tracking-tight drop-shadow-md break-words max-w-2xl"
            >
              {story.title}
            </Typography>
            
            {/* Yazar */}
            {author && (
              <Link 
                href={`/profile/@${author.username}`} 
                className="group flex items-center gap-2.5 mt-0.5 mb-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border/60 shadow-xs overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                  {author.avatarUrl ? (
                    <img 
                      src={author.avatarUrl} 
                      alt={author.displayName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-primary uppercase">
                      {author.displayName?.charAt(0) || author.username?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-left">
                  <span className="text-xs sm:text-sm font-bold text-text group-hover:text-primary transition-colors">
                    {author.displayName}
                  </span>
                  <span className="text-[11px] text-muted font-medium">@{author.username}</span>
                </div>
              </Link>
            )}

            {/* Etiketler (Tags) */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center md:justify-start max-w-md md:max-w-none">
                {story.tags.slice(0, 5).map(t => (
                  <Link href={`/search?tag=${t}`} key={t}>
                    <span className="px-2.5 py-0.5 bg-card/60 backdrop-blur-md border border-border/40 text-muted hover:text-text hover:border-primary/40 transition-all rounded-md text-[10px] font-bold uppercase tracking-wider block">
                      #{t}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* İstatistik Rozetleri */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-5 text-xs text-muted">
              <div className="flex items-center gap-1.5" title="Okunma Sayısı">
                <Eye size={14} className="text-sky-400" />
                <span className="font-bold text-text">{story.stats?.views?.toLocaleString('tr-TR') || '0'}</span> Okunma
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5" title="Beğeni Sayısı">
                <Heart size={14} className="text-rose-400" />
                <span className="font-bold text-text">{story.stats?.likes || 0}</span> Beğeni
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5" title="Bölüm Sayısı">
                <List size={14} className="text-primary" />
                <span className="font-bold text-text">{chapters.length}</span> Bölüm
              </div>
            </div>

            {/* ── Hero Aksiyonları (Ana CTA + Kompakt 4'lü Bar) ── */}
            <div className="w-full max-w-md md:max-w-lg space-y-2.5">
              
              {/* 1. Satır: Ana Okuma Butonu (Full Width) */}
              <Button 
                variant="primary" 
                onPress={handleStartReading} 
                className="w-full shadow-lg shadow-primary/25 text-sm sm:text-base font-bold py-3.5 rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
                disabled={chapters.length === 0}
              >
                {hasReadingHistory ? (
                  <>
                    <Bookmark size={18} className="mr-2 fill-current shrink-0" />
                    <span>Kaldığın Yerden Devam Et {targetChapterTitle ? `(${targetChapterTitle})` : ''}</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={18} className="mr-2 shrink-0" />
                    <span>{chapters.length === 0 ? 'Henüz Bölüm Yok' : 'İlk Bölümü Oku'}</span>
                  </>
                )}
              </Button>

              {/* 2. Satır: Kompakt Yatay Aksiyon Barı (Grid 4-Col) */}
              <div className="grid grid-cols-4 gap-2 w-full">
                
                {/* Kitaplığa Ekle */}
                <button 
                  onClick={handleToggleSave} 
                  disabled={saving}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center p-1 border transition-all text-center select-none active:scale-95 cursor-pointer ${
                    isSaved 
                      ? 'bg-primary/15 border-primary/40 text-primary' 
                      : 'bg-card/70 hover:bg-card border-border/50 text-text/80'
                  }`}
                  title="Kitaplığa Ekle"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck size={16} className="text-primary" />
                  ) : (
                    <BookmarkPlus size={16} />
                  )}
                  <span className="text-[10px] font-bold mt-0.5 truncate w-full">
                    {isSaved ? 'Kitaplıkta' : 'Kitaplık'}
                  </span>
                </button>

                {/* Readixle */}
                <button 
                  onClick={() => router.push(`/readix?hashtag=${encodeURIComponent(story.title.replace(/\s+/g, ''))}`)}
                  className="h-11 rounded-xl flex flex-col items-center justify-center p-1 bg-card/70 hover:bg-card border border-border/50 text-text/80 transition-all text-center select-none active:scale-95 cursor-pointer"
                  title="Kitap hakkında Readix paylaş"
                >
                  <Hash size={16} className="text-primary" />
                  <span className="text-[10px] font-bold mt-0.5 truncate w-full">Readixle</span>
                </button>

                {/* Listeye Ekle */}
                <button 
                  onClick={() => {
                    if (!firebaseUser) {
                      toast.info('Okuma listelerine eklemek için giriş yapmalısınız.');
                      router.push('/login');
                      return;
                    }
                    setIsAddToReadingListOpen(true);
                  }}
                  className="h-11 rounded-xl flex flex-col items-center justify-center p-1 bg-card/70 hover:bg-card border border-border/50 text-text/80 transition-all text-center select-none active:scale-95 cursor-pointer"
                  title="Okuma Listesine Ekle"
                >
                  <ListPlus size={16} className="text-amber-500" />
                  <span className="text-[10px] font-bold mt-0.5 truncate w-full">Listeye Ekle</span>
                </button>

                {/* Paylaş */}
                <button 
                  onClick={handleShare}
                  className="h-11 rounded-xl flex flex-col items-center justify-center p-1 bg-card/70 hover:bg-card border border-border/50 text-text/80 transition-all text-center select-none active:scale-95 cursor-pointer"
                  title="Paylaş"
                >
                  <Share2 size={16} className="text-sky-400" />
                  <span className="text-[10px] font-bold mt-0.5 truncate w-full">Paylaş</span>
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. SEKME BARI (Segmented Tabs - Stüdyo Tarzı) ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-y border-border/60 py-2.5 px-4 mb-6 transition-all shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          
          {/* Sekme: Hakkında */}
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-primary text-black shadow-md shadow-primary/20 font-bold'
                : 'text-muted hover:text-text hover:bg-muted/10'
            }`}
          >
            <BookOpen size={16} />
            <span>Hakkında</span>
          </button>

          {/* Sekme: Bölümler */}
          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-primary text-black shadow-md shadow-primary/20 font-bold'
                : 'text-muted hover:text-text hover:bg-muted/10'
            }`}
          >
            <List size={16} />
            <span>Bölümler</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'chapters' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
            }`}>
              {chapters.length}
            </span>
          </button>

          {/* Sekme: Yorumlar & İncelemeler */}
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-primary text-black shadow-md shadow-primary/20 font-bold'
                : 'text-muted hover:text-text hover:bg-muted/10'
            }`}
          >
            <MessageSquare size={16} />
            <span>Yorumlar</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'reviews' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
            }`}>
              {reviews.length}
            </span>
          </button>

          {/* Sekme: Karakterler (Hikayede varsa gösterilir) */}
          {characters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('characters')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'characters'
                  ? 'bg-primary text-black shadow-md shadow-primary/20 font-bold'
                  : 'text-muted hover:text-text hover:bg-muted/10'
              }`}
            >
              <Users size={16} />
              <span>Karakterler</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'characters' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
              }`}>
                {characters.length}
              </span>
            </button>
          )}

        </div>
      </div>

      {/* ── 3. SEKME İÇERİKLERİ ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full animate-fade-in">
        
        {/* ==================================================== */}
        {/* SEKME 1: HAKKINDA (Özet, Önsöz, Arka Kapak, Ekip vb.)*/}
        {/* ==================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sol / Ana Kolon: Özet, Önsöz, Arka Kapak */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Hikaye Özeti */}
                <div className="bg-card/50 border border-border/50 p-5 sm:p-7 rounded-2xl relative shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={18} className="text-primary" />
                    <Typography variant="h3" className="text-base sm:text-lg font-bold text-text">
                      Hikaye Özeti
                    </Typography>
                  </div>

                  <Typography 
                    variant="body" 
                    className={`text-muted leading-relaxed whitespace-pre-line text-sm sm:text-base ${
                      !isSummaryExpanded && story.summary && story.summary.length > 360 ? 'line-clamp-4' : ''
                    }`}
                  >
                    {story.summary || 'Bu kitap için henüz bir özet girilmemiş.'}
                  </Typography>

                  {story.summary && story.summary.length > 360 && (
                    <button 
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="text-primary font-bold text-xs sm:text-sm hover:underline mt-2.5 cursor-pointer block"
                    >
                      {isSummaryExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
                    </button>
                  )}
                </div>

                {/* Önsöz (Varsa) */}
                {story.foreword && (
                  <div className="bg-card/50 border border-border/50 p-5 sm:p-7 rounded-2xl shadow-xs">
                    <Typography variant="h3" className="text-base sm:text-lg font-bold mb-3 text-text">
                      Yazarın Önsözü
                    </Typography>
                    <Typography 
                      variant="body" 
                      className={`text-muted leading-relaxed whitespace-pre-line text-sm italic font-serif ${
                        !isForewordExpanded && story.foreword.length > 220 ? 'line-clamp-3' : ''
                      }`}
                    >
                      "{story.foreword}"
                    </Typography>
                    {story.foreword.length > 220 && (
                      <button 
                        onClick={() => setIsForewordExpanded(!isForewordExpanded)}
                        className="text-primary font-bold text-xs sm:text-sm hover:underline mt-2.5 cursor-pointer block"
                      >
                        {isForewordExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
                      </button>
                    )}
                  </div>
                )}

                {/* Arka Kapak Yazısı (Varsa) */}
                {story.backCover && (
                  <div className="bg-card/50 border border-border/50 p-5 sm:p-7 rounded-2xl shadow-xs">
                    <div className="border-l-4 border-primary pl-4 py-1">
                      <Typography variant="h3" className="text-base sm:text-lg font-bold mb-2 text-text">
                        Arka Kapak Yazısı
                      </Typography>
                      <Typography 
                        variant="body" 
                        className={`text-muted leading-relaxed whitespace-pre-line text-sm ${
                          !isBackCoverExpanded && story.backCover.length > 220 ? 'line-clamp-3' : ''
                        }`}
                      >
                        {story.backCover}
                      </Typography>
                      {story.backCover.length > 220 && (
                        <button 
                          onClick={() => setIsBackCoverExpanded(!isBackCoverExpanded)}
                          className="text-primary font-bold text-xs sm:text-sm hover:underline mt-2.5 cursor-pointer block"
                        >
                          {isBackCoverExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Sağ Kolon: Editör İncelemesi, Fragman, Ekip */}
              <div className="space-y-6">
                
                {/* Editör Değerlendirmesi Kartı */}
                {editorialReview && (
                  <Link href={`/reviews/${editorialReview.id}`} className="block group">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/30 via-card to-card border border-amber-500/30 hover:border-amber-500/60 p-5 transition-all duration-300 shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles size={11} className="animate-pulse" />
                          Editör Notu
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-xs font-black shadow-xs">
                          <Star size={11} className="fill-black text-black" />
                          {editorialAverageScore} / 10
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-text/90 italic leading-relaxed mb-3 line-clamp-3 font-serif">
                        "{editorialReview.firstImpression || editorialReview.finalWord || editorialReview.about || 'Bu eser Readixon editoryal heyeti tarafından incelenmiştir.'}"
                      </p>

                      <div className="flex items-center justify-between pt-2.5 border-t border-amber-500/15 text-xs">
                        <span className="text-muted text-[11px] font-medium truncate max-w-[150px]">
                          Editör: <strong className="text-text">{editorialReview.editorName}</strong>
                        </span>
                        <span className="text-amber-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs">
                          İncele <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Fragman Videosu */}
                {story.trailerVideoUrl && (
                  <div className="bg-black/90 rounded-2xl overflow-hidden shadow-md border border-border/50 relative group">
                    <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 pointer-events-none">
                      <Typography variant="caption" className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                        <Play size={10} className="text-primary fill-current" /> Fragman
                      </Typography>
                    </div>
                    <video 
                      src={story.trailerVideoUrl} 
                      controls 
                      className="w-full aspect-video object-contain"
                      controlsList="nodownload"
                      poster={story.coverImage}
                    />
                  </div>
                )}

                {/* Ekip & Katkıda Bulunanlar */}
                {story.contributors && story.contributors.length > 0 && (
                  <div className="bg-card/50 border border-border/50 p-5 rounded-2xl shadow-xs">
                    <Typography variant="h3" className="text-sm font-bold mb-3 flex items-center gap-2 text-text">
                      <Users size={16} className="text-primary" /> Ekip & Katkıda Bulunanlar
                    </Typography>
                    <div className="space-y-2">
                      {story.contributors.map((contributor, i) => {
                        const isString = typeof contributor === 'string';
                        const role = isString ? 'Katkıda Bulunan' : contributor.role;
                        const name = isString ? contributor : contributor.name;
                        
                        return (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-muted/10 rounded-xl border border-border/40 text-xs">
                            <span className="font-semibold text-text">{name}</span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {role}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Bunları Da Seveceksiniz (Benzer Kitaplar) */}
            {similarStories.length > 0 && (
              <div className="pt-6 border-t border-border/40">
                <Typography variant="h2" className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart size={20} className="text-primary" /> Bunları Da Seveceksiniz
                </Typography>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
                  {similarStories.map(sim => (
                    <div key={sim.storyId} className="w-[125px] sm:w-[145px] shrink-0 transition-transform duration-200 hover:-translate-y-1">
                      <StoryCard 
                        title={sim.title}
                        authorName={sim.authorName || ''}
                        authorUsername={sim.authorUsername || ''}
                        authorAvatarUrl={sim.authorAvatarUrl}
                        coverImage={sim.coverImage}
                        views={sim.stats?.views || 0}
                        likes={sim.stats?.likes || 0}
                        tags={sim.tags}
                        isWebtoon={sim.format === 'webtoon'}
                        onPress={() => router.push(`/story/${sim.storyId}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* SEKME 2: BÖLÜMLER (İçindekiler & Sıralama Filtresi) */}
        {/* ==================================================== */}
        {activeTab === 'chapters' && (
          <div className="space-y-4">
            
            {/* Kontrol Barı: Bölüm Sayısı + Sıralama Butonu */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50">
              <div className="flex items-center gap-2.5">
                <span className="text-xs sm:text-sm font-bold text-text">Bölüm Listesi</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/25">
                  {chapters.length} Bölüm
                </span>
              </div>

              {/* Sıralama Toggle'ı */}
              <button
                type="button"
                onClick={() => setChapterSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/10 hover:bg-muted/20 border border-border/50 text-text transition-colors cursor-pointer select-none"
                title="Bölüm sıralamasını tersine çevir"
              >
                <ArrowUpDown size={13} className="text-primary" />
                <span>{chapterSortOrder === 'asc' ? '1 → Son' : 'Son → 1'}</span>
              </button>
            </div>

            {/* Bölüm Kartları */}
            <div className="space-y-2.5">
              {sortedChapters.length > 0 ? (
                <>
                  {sortedChapters.slice(0, visibleChaptersCount).map((chapter, index) => {
                    let isScheduled = false;
                    let publishDateObj = null;
                    if (chapter.status === 'scheduled' && chapter.publishDate) {
                      publishDateObj = chapter.publishDate.toDate ? chapter.publishDate.toDate() : new Date(chapter.publishDate as any);
                      if (publishDateObj > new Date()) {
                        isScheduled = true;
                      }
                    }

                    const isCompleted = Boolean(readingProgress?.completedChapters?.includes(chapter.chapterId));
                    const isCurrent = !isCompleted && readingProgress?.currentChapterId === chapter.chapterId;
                    const chapterIndexDisplay = chapterSortOrder === 'asc' ? index + 1 : chapters.length - index;

                    return (
                      <div
                        key={chapter.chapterId}
                        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden flex items-start gap-3 sm:gap-4 ${
                          isScheduled 
                            ? 'bg-card/25 border border-border/20 opacity-70 cursor-default' 
                            : isCurrent
                            ? 'bg-primary/[0.08] border border-primary/45 shadow-[0_0_20px_rgba(99,102,241,0.12)] cursor-pointer'
                            : isCompleted
                            ? 'bg-card/40 border border-primary/20 hover:border-primary/40 hover:bg-card/70 cursor-pointer shadow-xs'
                            : 'bg-card/40 border border-border/40 hover:border-primary/40 hover:bg-card/80 hover:shadow-md cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isScheduled) router.push(`/read/${storyId}/${chapter.chapterId}`);
                        }}
                      >
                        {/* Aktif İndikatör Çizgisi */}
                        {isCurrent && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-primary rounded-l-2xl shadow-[0_0_12px_var(--color-primary)]" />
                        )}

                        {/* Sol Sayı / Durum Rozeti */}
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs sm:text-sm transition-all duration-200 self-start mt-0.5 ${
                          isScheduled 
                            ? 'bg-muted/10 text-muted border border-border/20' 
                            : isCurrent
                            ? 'bg-primary text-black border border-primary shadow-sm font-black'
                            : isCompleted
                            ? 'bg-primary/10 text-primary border border-primary/25 shadow-xs'
                            : 'bg-muted/15 text-muted-foreground border border-border/20 group-hover:border-primary/30 group-hover:text-primary group-hover:bg-primary/10'
                        }`}>
                          {isScheduled ? (
                            <Lock size={15} />
                          ) : isCurrent ? (
                            <Bookmark size={16} className="fill-black" />
                          ) : isCompleted ? (
                            <Check size={16} className="text-primary" strokeWidth={2.5} />
                          ) : (
                            chapterIndexDisplay
                          )}
                        </div>

                        {/* İçerik Alanı: Başlık ve İstatistikler */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          
                          {/* 1. Satır: Bölüm Başlığı */}
                          <div className="flex items-start justify-between gap-2">
                            <Typography 
                              variant="body" 
                              className={`font-bold text-sm sm:text-base text-foreground break-words leading-snug transition-colors flex-1 ${
                                isScheduled ? 'text-text/70' : isCurrent ? 'text-primary' : 'group-hover:text-primary'
                              }`}
                            >
                              {chapter.title}
                            </Typography>

                            {!isScheduled && (
                              <ChevronRight size={16} className="text-muted/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                            )}
                          </div>

                          {/* 2. Satır: İstatistikler ve Durum Rozeti */}
                          <div className="flex items-center justify-between gap-x-3 gap-y-1.5 flex-wrap pt-0.5">
                            {!isScheduled ? (
                              <div className="flex items-center gap-2.5 sm:gap-3.5 text-[11px] text-muted/70 flex-wrap">
                                {chapter.publishDate && (
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Calendar size={11} className="opacity-70" />
                                    {(chapter.publishDate as any)?.seconds
                                      ? new Date((chapter.publishDate as any).seconds * 1000).toLocaleDateString('tr-TR')
                                      : new Date(chapter.publishDate as any).toLocaleDateString('tr-TR')}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 shrink-0">
                                  <Eye size={11} className="opacity-70" />
                                  {(chapter.stats?.views || 0).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                  <Heart size={11} className="opacity-70" />
                                  {(chapter.stats?.likes || 0).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                  <MessageSquare size={11} className="opacity-70" />
                                  {(chapter.stats?.commentCount || 0).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              publishDateObj && (
                                <div className="flex items-center gap-1 text-[11px] text-blue-400">
                                  <Calendar size={12} />
                                  <span>Planlandı: {publishDateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              )
                            )}

                            {/* Sağ Rozet */}
                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                  Şu An Okunuyor
                                </span>
                              )}
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
                                  <Check size={11} strokeWidth={2.5} />
                                  Okundu
                                </span>
                              )}
                              {isScheduled && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleReminder(chapter.chapterId);
                                  }}
                                  className="text-[10px] py-0.5 h-6 px-2.5 rounded-full border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Bell size={11} /> Bildir
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                  
                  {visibleChaptersCount < chapters.length && (
                    <button 
                      onClick={() => setVisibleChaptersCount(prev => prev + 20)}
                      className="w-full mt-3 py-3.5 bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <List size={16} /> Sonraki Bölümleri Yükle ({chapters.length - visibleChaptersCount} kaldı)
                    </button>
                  )}
                </>
              ) : (
                <div className="py-12 text-center bg-card/40 rounded-2xl border border-dashed border-border/40">
                  <BookOpen size={40} className="mx-auto text-muted/30 mb-3" />
                  <Typography variant="h3" className="text-muted text-sm font-bold mb-1">Henüz Bölüm Yok</Typography>
                  <Typography variant="body" className="text-muted/60 text-xs">Yazar henüz bu kitap için bir bölüm yayınlamadı.</Typography>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* SEKME 3: YORUMLAR (İncelemeler, Form & Bahsedilenler)*/}
        {/* ==================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sol / Ana Alan: İnceleme Yaz + İnceleme Listesi */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* İnceleme Yazma Formu */}
                <div className="bg-card/50 border border-primary/25 p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-xs">
                  <Typography variant="h3" className="text-base sm:text-lg font-bold mb-1">Kendi İncelemeni Yaz</Typography>
                  <Typography variant="body" className="text-muted text-xs mb-4">Kitabı puanlayıp düşüncelerini diğer okurlarla paylaş.</Typography>
                  
                  <div className="flex flex-col gap-3.5 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-xs text-text/80">Puanın:</span>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="0.5" 
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseFloat(e.target.value))}
                        className="flex-1 accent-primary cursor-pointer"
                      />
                      <span className="font-black text-lg text-amber-500 w-10 text-center flex items-center justify-end gap-1">
                        <Star size={14} className="fill-amber-500" /> {reviewRating}
                      </span>
                    </div>
                    
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Kitap hakkındaki düşüncelerin, beğendiğin kısımlar..."
                      className="w-full bg-background/80 border border-border/60 rounded-xl p-3.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary resize-y min-h-[90px]"
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="primary" 
                        onPress={handleSubmitReview} 
                        disabled={submittingReview || !reviewText.trim()}
                        className="px-6 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {submittingReview ? 'Gönderiliyor...' : 'İncelemeyi Gönder'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* İnceleme Listesi */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h3" className="text-base font-bold flex items-center gap-2">
                      Topluluk İncelemeleri <span className="text-muted text-xs font-normal">({reviews.length})</span>
                    </Typography>
                  </div>

                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.reviewId} className="bg-card/40 border border-border/50 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center font-bold text-xs text-primary overflow-hidden">
                          {review.authorAvatarUrl ? (
                            <img src={review.authorAvatarUrl} alt={review.authorName || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            (review.authorName ? review.authorName.substring(0,2) : review.userId.substring(0,2)).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs sm:text-sm text-text">
                              {review.authorName || `Kullanıcı ${review.userId.substring(0,6)}`}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md text-xs font-bold">
                              <Star size={11} className="fill-current" /> {review.rating}/10
                            </div>
                          </div>
                          <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                            {review.text}
                          </Typography>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-card/20 rounded-2xl border border-dashed border-border/40">
                      <MessageSquare size={36} className="mx-auto text-muted/30 mb-2" />
                      <Typography variant="h3" className="text-text/70 text-xs font-bold mb-1">Henüz İnceleme Yok</Typography>
                      <Typography variant="body" className="text-muted text-xs">Bu kitabı ilk inceleyen sen ol!</Typography>
                    </div>
                  )}
                </div>

              </div>

              {/* Sağ Kolon: Bahsedilen Readixler */}
              <div className="space-y-4">
                <div className="bg-card/50 p-4 sm:p-5 rounded-2xl border border-border/50">
                  <Typography variant="h3" className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Hash size={16} className="text-primary" /> Bahsedilenler
                  </Typography>
                  
                  {mentionsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin text-primary" size={20} />
                    </div>
                  ) : mentions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {mentions.slice(0, visibleMentionsCount).map((readix) => {
                        const rAuthor = mentionsAuthors[readix.authorId] || userProfile;
                        return (
                          <ReadixCard
                            key={readix.id}
                            linkedStory={readix.linkedStory}
                            authorName={rAuthor?.displayName || 'Bilinmiyor'}
                            authorUsername={rAuthor?.username || 'user'}
                            authorAvatarUrl={rAuthor?.avatarUrl}
                            content={readix.content}
                            mediaUrls={readix.mediaUrls}
                            createdAtStr={readix.createdAt ? new Date((readix.createdAt as any).seconds ? (readix.createdAt as any).seconds * 1000 : (readix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'}
                            likesCount={readix.stats?.likes || 0}
                            commentsCount={readix.stats?.comments || 0}
                            repostsCount={readix.stats?.reposts || 0}
                            readOnlyStats={true}
                            onPress={() => router.push(`/readix?id=${readix.id}`)}
                          />
                        );
                      })}
                      {visibleMentionsCount < mentions.length && (
                        <Button 
                          variant="ghost" 
                          className="w-full mt-1 text-primary text-xs py-1"
                          onPress={() => setVisibleMentionsCount(prev => prev + 5)}
                        >
                          Daha Fazla Göster ({mentions.length - visibleMentionsCount})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Typography variant="caption" className="text-muted italic text-center block text-xs py-4">
                      Henüz bu kitaptan bahsedilen bir Readix paylaşılmamış.
                    </Typography>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* SEKME 4: KARAKTERLER (Karakter Defteri Ansiklopedisi) */}
        {/* ==================================================== */}
        {activeTab === 'characters' && characters.length > 0 && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Typography variant="h2" className="text-lg font-bold text-text">Karakter Defteri</Typography>
                <button 
                  onClick={() => setShowCharacterBookInfo(true)}
                  className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  title="Karakter Defteri Nedir?"
                >
                  <Info size={15} />
                </button>
              </div>
            </div>

            {!canViewCharacters ? (
              <div className="text-center py-16 bg-card/50 rounded-2xl border border-amber-500/20 relative overflow-hidden group p-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mb-4 mx-auto border border-amber-500/30">
                  <Lock size={28} className="text-amber-500" />
                </div>
                <Typography variant="h3" className="mb-2 text-text font-bold text-base">Premium Özellik</Typography>
                <Typography variant="body" className="text-muted text-xs text-center max-w-md mx-auto mb-6">
                  Karakter defteri özelliği sadece Premium üyelere ve hikaye sahibine özeldir. Hikayedeki karakterlerin derinliklerini keşfetmek için Premium'a geçebilirsiniz.
                </Typography>
                <Button 
                  onPress={() => router.push('/premium')} 
                  variant="primary" 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black border-none px-6 py-2.5 rounded-full font-bold shadow-md cursor-pointer text-xs"
                >
                  Premium'a Yükselt
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {characters.map(char => (
                  <div key={char.id} className="bg-card/50 border border-border/50 hover:border-primary/50 rounded-2xl overflow-hidden transition-all group flex flex-col shadow-xs hover:-translate-y-0.5">
                    
                    <div className="relative h-52 w-full bg-muted/10 overflow-hidden">
                      {char.avatarUrl ? (
                        <img 
                          src={char.avatarUrl} 
                          alt={char.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <Users size={40} className="text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-border/50">
                        <span className="text-[9px] font-bold text-text">{
                          char.role === 'protagonist' ? 'Baş Karakter' :
                          char.role === 'antagonist' ? 'Düşman' :
                          char.role === 'supporting' ? 'Yan Karakter' : 'Figüran'
                        }</span>
                      </div>
                    </div>

                    <div className="p-3.5">
                      <Typography variant="h3" className="font-bold text-text mb-0.5 group-hover:text-primary transition-colors text-base truncate">
                        {char.name}
                      </Typography>
                      <Typography variant="caption" className="text-muted font-medium mb-2.5 block text-xs">
                        {char.occupation || 'Meslek Belirtilmedi'} • {char.age || '?'} Yaşında
                      </Typography>
                      
                      <div className="flex flex-wrap gap-1">
                        {char.personalityTraits?.slice(0, 3).map((trait: string, i: number) => (
                          <span key={i} className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── 4. YÜZEN HIZLI OKUMA ÇUBUĞU (Scroll Edilince Mobilde Beliren Bar) ── */}
      {showStickyBar && chapters.length > 0 && (
        <aside 
          aria-label="Hızlı Okuma Çubuğu"
          className="xl:hidden fixed bottom-[74px] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-40 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="rounded-2xl bg-card/95 backdrop-blur-2xl border border-primary/30 p-2.5 px-3 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
              <div className="w-8 h-11 shrink-0 rounded-lg overflow-hidden border border-border/50 shadow-xs">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <BookOpen size={12} className="text-muted" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text truncate leading-tight">{story.title}</p>
                <p className="text-[10px] text-muted truncate">
                  {hasReadingHistory 
                    ? `Devam et: ${targetChapterTitle || 'Bölüm'}` 
                    : `${chapters.length} Bölüm`}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onPress={handleStartReading}
              className="px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={12} className="fill-current" />
              <span>{hasReadingHistory ? 'Devam Et' : 'Oku'}</span>
            </Button>

          </div>
        </aside>
      )}

      {/* ── Okuma Listesine Ekle Modalı ── */}
      {firebaseUser && (
        <AddToReadingListModal
          isOpen={isAddToReadingListOpen}
          onClose={() => setIsAddToReadingListOpen(false)}
          userId={firebaseUser.uid}
          storyId={storyId}
          storyTitle={story?.title}
        />
      )}

    </div>
  );
}
