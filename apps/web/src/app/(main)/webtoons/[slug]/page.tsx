"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, ReadixCard } from '@readixon/ui';
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
  trackInteraction,
  getReadixesByStoryId,
  Readix
} from '@readixon/core';
import type { Story, User, Chapter, Review } from '@readixon/core';
import { 
  BookOpen, Heart, Eye, List, Play, BookmarkPlus, BookmarkCheck, 
  ArrowLeft, Loader2, Star, MessageSquare, Users, Award, PenTool, Hash,
  Lock, Calendar, Bell, Info
} from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";

export default function WebtoonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, isInitialized, userProfile } = useAuthStore();
  
  const slug = params.slug as string;
  const storyId = extractStoryIdFromSlug(slug);

  const [story, setStory] = useState<Story | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const [mentions, setMentions] = useState<Readix[]>([]);
  const [mentionsLoading, setMentionsLoading] = useState(false);
  const [mentionsAuthors, setMentionsAuthors] = useState<Record<string, User>>({});

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(10);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  useEffect(() => {
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
        if (!fetchedStory || fetchedStory.format !== 'webtoon') {
          setError('Webtoon bulunamadı veya bu bir roman.');
          setLoading(false);
          return;
        }

        setStory(fetchedStory);
        incrementStoryView(storyId);

        const [fetchedAuthor, fetchedChapters, fetchedReviews] = await Promise.all([
          getUserProfile(fetchedStory.authorId),
          getPublishedChapters(storyId),
          getReviews(storyId)
        ]);
        
        setAuthor(fetchedAuthor);
        setChapters(fetchedChapters);
        setReviews(fetchedReviews);
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
      }
    };
    checkUserStates();
  }, [firebaseUser, isInitialized, storyId]);

  useEffect(() => {
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
        trackInteraction(firebaseUser.uid, 'story_library_added').catch(console.error);
      }
    } catch (err) {
      console.error("Kaydetme işlemi başarısız:", err);
    } finally {
      setSaving(false);
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
      trackInteraction(firebaseUser.uid, 'comment_given').catch(console.error);
      
      if (story) {
        const newCount = (story.stats.reviewCount || 0) + 1;
        const currentTotal = (story.stats.rating || 0) * (story.stats.reviewCount || 0);
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
      
      setStory(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          likes: nowLiked ? (prev.stats.likes || 0) + 1 : Math.max(0, (prev.stats.likes || 0) - 1)
        }
      } : null);
      if (nowLiked) {
        trackInteraction(firebaseUser.uid, 'like_given').catch(console.error);
      }
    } catch (err) {
      console.error("Beğenme işlemi başarısız:", err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="text-primary animate-spin mb-4" />
        <Typography variant="body" className="text-muted">Webtoon Yükleniyor...</Typography>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <Typography variant="h2" className="mb-4">Oops!</Typography>
        <Typography variant="body" className="text-muted max-w-md">{error}</Typography>
        <Button variant="outline" onPress={() => router.push('/feed')} className="mt-8">
          Keşfet'e Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-12">
      {/* Cinematic Header (Blur Background) */}
      <div className="relative w-full">
        {/* Back Button */}
        <div className="absolute top-4 md:top-8 left-4 md:left-8 z-50 flex pointer-events-none">
          <button 
            onClick={() => router.back()}
            className="pointer-events-auto p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${story.coverImage})` }}
          />
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-8 flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-6 md:gap-8">
          {/* Main Cover Image */}
          <div className="w-40 md:w-64 shrink-0 rounded-xl overflow-hidden border-4 border-background shadow-2xl relative aspect-[2/3] bg-muted">
            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
              Webtoon
            </div>
          </div>
          
          <div className="flex-1 pb-2 w-full flex flex-col items-center md:items-start">
            <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-background/80 backdrop-blur-md text-text text-xs font-bold rounded-full border border-border/50 shadow-sm">
                {story.status === 'completed' ? 'Tamamlandı' : story.status === 'ongoing' ? 'Devam Ediyor' : 'Taslak'}
              </span>
              <span className="px-3 py-1 bg-background/80 backdrop-blur-md text-text text-xs font-bold rounded-full border border-border/50 shadow-sm flex items-center gap-1">
                <Star size={12} className="text-amber-500" /> {story.stats.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            
            <Typography variant="h1" className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 text-text drop-shadow-md">
              {story.title}
            </Typography>
            
            {author && (
              <Link href={`/profile/${author.username}`} className="group flex items-center gap-3 mt-1 mb-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background/50 shadow-sm overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                  {author.avatarUrl ? (
                    <img 
                      src={author.avatarUrl} 
                      alt={author.displayName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm md:text-base font-bold text-primary uppercase">
                      {author.displayName?.charAt(0) || author.username?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm md:text-base font-bold text-text group-hover:text-primary transition-colors">{author.displayName}</span>
                  <span className="text-xs text-muted-foreground font-medium">@{author.username}</span>
                </div>
              </Link>
            )}

            {/* Tags / Genres */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 justify-center md:justify-start max-w-sm md:max-w-none">
                {story.tags.map(t => (
                  <Link href={`/search?tag=${t}`} key={t}>
                    <span className="px-2.5 py-1 bg-background/50 backdrop-blur-md border border-border/20 text-text hover:bg-primary hover:text-primary-foreground hover:border-primary/50 transition-all rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm block">
                      #{t}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-6 w-full max-w-sm mx-auto md:mx-0 md:max-w-none">
              <Button variant="primary" onPress={() => chapters.length > 0 && router.push(`/read/${storyId}/${chapters[0].chapterId}`)} className="w-full md:w-auto shadow-lg shadow-primary/20 text-base md:px-8 py-3">
                <BookOpen size={20} className="mr-2" /> İlk Episodu Oku
              </Button>
              
              <div className="grid grid-cols-3 md:flex items-center gap-2 w-full md:w-auto h-[52px]">
                <button 
                  onClick={handleToggleSave} 
                  disabled={saving}
                  className="w-full h-full bg-background/80 border border-border/50 hover:bg-muted text-text shadow-sm backdrop-blur-md rounded-xl flex items-center justify-center px-0 md:px-5 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : (
                    isSaved ? <BookmarkCheck size={18} className="text-primary" /> : <BookmarkPlus size={18} />
                  )}
                  <span className="hidden md:inline ml-2 font-medium whitespace-nowrap text-sm">{isSaved ? 'Kütüphanede' : 'Kütüphaneye Ekle'}</span>
                </button>
                
                <button 
                  onClick={handleToggleLike} 
                  disabled={isLikeLoading}
                  className="w-full h-full bg-background/80 border border-border/50 hover:bg-muted text-text shadow-sm backdrop-blur-md rounded-xl flex items-center justify-center px-0 md:px-5 transition-colors disabled:opacity-50"
                >
                  <Heart size={18} className={isLiked ? "fill-primary text-primary" : ""} />
                  <span className="ml-1.5 font-semibold text-sm">{story.stats.likes}</span>
                </button>

                <div className="w-full h-full flex items-center justify-center px-0 md:px-5 bg-background/80 border border-border/50 text-text shadow-sm backdrop-blur-md rounded-xl cursor-default" title="Okunma Sayısı">
                  <Eye size={18} className="text-muted-foreground" />
                  <span className="ml-1.5 font-semibold text-sm">{story.stats.views.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Left Column (Content) */}
        <div className="flex-1 flex flex-col gap-12">
          
          {/* About Section */}
          <section className="bg-card/40 md:bg-transparent md:p-0 p-6 rounded-3xl md:rounded-none border border-border/10 md:border-none relative overflow-hidden">
            <Typography variant="h3" className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <Info size={24} className="text-primary" /> Hakkında
            </Typography>
            
            <div className={`relative transition-all duration-300 ${!isAboutExpanded ? 'max-h-[140px] md:max-h-none overflow-hidden' : ''}`}>
              <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                {story.summary || "Bu webtoon için henüz bir açıklama girilmemiş."}
              </Typography>
              
              {!isAboutExpanded && (story.summary && story.summary.length > 200) && (
                <div className="md:hidden absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card via-card/80 to-transparent flex items-end justify-center pb-2">
                  <button 
                    onClick={() => setIsAboutExpanded(true)}
                    className="bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full text-primary font-bold text-sm shadow-sm border border-primary/20 hover:bg-primary hover:text-white transition-all"
                  >
                    Devamını Oku
                  </button>
                </div>
              )}
            </div>
            
            {isAboutExpanded && (
              <div className="md:hidden mt-4 flex justify-center">
                <button 
                  onClick={() => setIsAboutExpanded(false)}
                  className="text-muted-foreground text-sm font-medium hover:text-text transition-colors"
                >
                  Daha Az Göster
                </button>
              </div>
            )}
          </section>

          {/* Ekip (Contributors) */}
          <section className="mt-4 mb-4">
            <Typography variant="h3" className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              <Users size={24} className="text-primary" /> Ekip
            </Typography>
            
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Main Author / Publisher */}
              <Link href={`/profile/${author?.username || author?.uid}`} className="shrink-0 snap-start w-36 md:w-44 group relative overflow-hidden rounded-2xl bg-card border border-border/20 p-5 hover:border-primary/50 transition-all flex flex-col items-center text-center shadow-sm hover:shadow-md">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-background shadow-lg">
                  {author?.avatarUrl ? (
                    <img src={author.avatarUrl} alt="Author" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <Typography variant="body" className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-1 w-full">
                  {author?.displayName || author?.username || 'Yazar'}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground text-[10px] font-black uppercase tracking-widest bg-muted/50 px-2.5 py-1 rounded-md">
                  Yayınlayan
                </Typography>
              </Link>

              {/* Show other contributors */}
              {story.contributors && story.contributors.length > 0 && story.contributors.map((c, i) => (
                <div key={i} className="shrink-0 snap-start w-36 md:w-44 group relative overflow-hidden rounded-2xl bg-card/40 border border-border/10 p-5 flex flex-col items-center text-center shadow-sm">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-background shadow-lg flex items-center justify-center bg-muted/30 text-muted">
                    <PenTool size={24} />
                  </div>
                  <Typography variant="body" className="font-bold text-sm mb-1.5 line-clamp-1 w-full">{c.name}</Typography>
                  <Typography variant="caption" className="text-muted-foreground text-[10px] font-black uppercase tracking-widest bg-muted/50 px-2.5 py-1 rounded-md">
                    {c.role}
                  </Typography>
                </div>
              ))}
            </div>
          </section>

          {/* Episodes List */}
          <section>
            <Typography variant="h3" className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              <List size={24} className="text-primary" /> Episodlar ({chapters.length})
            </Typography>
            
            {chapters.length === 0 ? (
              <div className="p-8 text-center bg-card border border-border/20 rounded-2xl">
                <Typography variant="body" className="text-muted">Henüz yayınlanmış bir episod bulunmuyor.</Typography>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {chapters.map((chap, idx) => (
                  <div 
                    key={chap.chapterId} 
                    onClick={() => router.push(`/read/${storyId}/${chap.chapterId}`)}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 bg-card border border-border/20 rounded-xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 shadow-inner text-lg">
                        {idx + 1}
                      </div>
                      <Typography variant="body" className="font-bold group-hover:text-primary transition-colors text-base md:text-lg line-clamp-2 md:line-clamp-1">
                        {chap.title}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 text-xs md:text-sm text-muted md:border-none border-t border-border/10 pt-3 md:pt-0 shrink-0">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="md:w-4 md:h-4"/> {new Date((chap.publishDate as any)?.seconds * 1000 || Date.now()).toLocaleDateString('tr-TR')}</span>
                      <div className="flex items-center gap-3 md:gap-5">
                        <span className="flex items-center gap-1.5"><Eye size={14} className="md:w-4 md:h-4"/> {(chap.stats?.views || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><Heart size={14} className="md:w-4 md:h-4"/> {(chap.stats?.likes || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Hover indicator overlay */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                  </div>
                ))}
              </div>
            )}
          </section>



        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-8">
          




          {/* Reviews */}
          <div className="bg-card p-6 rounded-2xl border border-border/20">
            <Typography variant="h3" className="font-bold mb-4 flex items-center gap-2">
              <Star size={18} className="text-primary" /> İncelemeler
            </Typography>
            
            {/* Review Form */}
            {firebaseUser ? (
              <div className="mb-6 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <Typography variant="caption" className="font-medium">Puanınız:</Typography>
                  <span className="font-black text-amber-500">{reviewRating}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1"
                  value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full h-2 bg-muted/20 rounded-lg appearance-none cursor-pointer mb-2 accent-primary"
                />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Bu webtoon hakkında ne düşünüyorsunuz?"
                  className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-y min-h-[80px]"
                />
                <Button variant="primary" onPress={handleSubmitReview} disabled={submittingReview || !reviewText.trim()} className="mt-1 w-full text-sm py-2">
                  {submittingReview ? 'Gönderiliyor...' : 'İnceleme Gönder'}
                </Button>
              </div>
            ) : (
              <div className="bg-muted/10 rounded-xl p-4 text-center mb-6 border border-border/20">
                <Typography variant="caption" className="text-muted block mb-2">İnceleme yazmak için giriş yapmalısınız.</Typography>
                <Link href="/login">
                  <Button variant="outline" className="w-full py-1 text-sm">Giriş Yap</Button>
                </Link>
              </div>
            )}

            {/* Review List */}
            <div className="flex flex-col gap-4">
              {reviews.length === 0 ? (
                <Typography variant="caption" className="text-muted italic text-center block">Henüz inceleme yok. İlk yazan siz olun!</Typography>
              ) : (
                reviews.slice(0, 5).map(review => (
                  <div key={review.reviewId} className="border-b border-border/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                          {review.authorAvatarUrl ? <img src={review.authorAvatarUrl} className="w-full h-full object-cover"/> : null}
                        </div>
                        <Typography variant="caption" className="font-bold">{review.authorName || review.authorUsername}</Typography>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <Star size={10} className="fill-amber-500"/> {review.rating}
                      </span>
                    </div>
                    <Typography variant="caption" className="text-muted line-clamp-4 leading-relaxed">{review.text}</Typography>
                  </div>
                ))
              )}
              
              {reviews.length > 5 && (
                <Button variant="ghost" className="w-full mt-2 text-primary text-sm py-1">Tümünü Gör</Button>
              )}
            </div>
          </div>

          {/* Mentions (Bahsedilenler) */}
          <div className="bg-card p-6 rounded-2xl border border-border/20">
            <Typography variant="h3" className="font-bold mb-4 flex items-center gap-2">
              <Hash size={18} className="text-primary" /> Bahsedilenler
            </Typography>
            
            {mentionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : mentions.length === 0 ? (
              <Typography variant="caption" className="text-muted italic text-center block">
                Henüz bu webtoondan bahsedilen bir Readix paylaşılmamış.
              </Typography>
            ) : (
              <div className="flex flex-col gap-4">
                {mentions.map((mention) => {
                  const mentionAuthor = mentionsAuthors[mention.authorId];
                  return (
                    <ReadixCard 
                      key={mention.id} 
                      content={mention.content}
                      mediaUrls={mention.mediaUrls}
                      createdAtStr={new Date((mention.createdAt as any)?.seconds * 1000).toLocaleDateString('tr-TR')}
                      likesCount={mention.stats?.likes || 0}
                      commentsCount={mention.stats?.comments || 0}
                      repostsCount={mention.stats?.reposts || 0}
                      authorName={mentionAuthor?.displayName || mentionAuthor?.username || 'Kullanıcı'}
                      authorAvatarUrl={mentionAuthor?.avatarUrl}
                      authorUsername={mentionAuthor?.username || 'user'}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
