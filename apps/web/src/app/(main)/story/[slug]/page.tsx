"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Typography, Button, Input, ReadixCard, StoryCard } from '@readixon/ui';
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
  db
} from '@readixon/core';
import type { Story, User, Chapter, Review, Character } from '@readixon/core';
import { 
  BookOpen, Heart, Eye, List, Play, BookmarkPlus, BookmarkCheck, 
  ArrowLeft, Loader2, Star, MessageSquare, Users, Award, PenTool, Hash,
  Lock, Calendar, Bell, Info, X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const [showCharacterBookInfo, setShowCharacterBookInfo] = useState(false);
  const [visibleChaptersCount, setVisibleChaptersCount] = useState(20);

  // Metin Genişletme Durumları
  const [isForewordExpanded, setIsForewordExpanded] = useState(false);
  const [isBackCoverExpanded, setIsBackCoverExpanded] = useState(false);

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

        // Yazar, bölümler ve incelemeleri paralel çek
        const [fetchedAuthor, fetchedChapters, fetchedReviews, fetchedCharacters] = await Promise.all([
          getUserProfile(fetchedStory.authorId),
          getPublishedChapters(storyId),
          getReviews(storyId),
          getCharacters(storyId).catch(err => {
            console.warn("Karakterler yüklenirken Firebase izin hatası:", err);
            return [];
          })
        ]);
        
        setAuthor(fetchedAuthor);
        setChapters(fetchedChapters);
        setReviews(fetchedReviews);
        setCharacters(fetchedCharacters);
        setLoading(false); // <-- Performans: Ana içerik yüklendi, sayfayı göster

        // Benzer kitapları getir (Arka planda yüklenir)
        if (fetchedStory.tags && fetchedStory.tags.length > 0) {
          try {
            const storiesRef = collection(db, 'stories');
            // Firestore array-contains-any can take up to 10 elements
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
            // Beğeniye göre sırala
            similar.sort((a, b) => (b.stats?.likes || 0) - (a.stats?.likes || 0));
            const top5 = similar.slice(0, 5);

            // Yazarları çek
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
      // Geçici olarak UI'a ekle
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
      
      // Hikaye puanını geçici olarak güncelle
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
      
      const likeDelta = nowLiked ? 1 : -1;
      
      // Update story stats optimistically
      setStory({
        ...story,
        stats: {
          ...story.stats,
          likes: (story.stats?.likes || 0) + likeDelta
        }
      });
      
      // Keşfet (Feed) sayfasındaki önbelleği güncelle ki anında yansısın
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-24 h-24 rounded-full bg-red-950/30 flex items-center justify-center mb-6">
          <BookOpen size={40} className="text-red-400" />
        </div>
        <Typography variant="h2" className="text-text mb-2">Eyvah!</Typography>
        <Typography variant="body" className="text-muted mb-6">{error}</Typography>
        <Button variant="outline" onPress={() => router.back()}>Geri Dön</Button>
      </div>
    );
  }

  const isPremiumOrAdmin = userProfile?.status === 'premium' || userProfile?.isAdmin === true;
  const isStoryAuthor = firebaseUser?.uid === story.authorId;
  const canViewCharacters = isPremiumOrAdmin || isStoryAuthor;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-20 overflow-x-hidden">
      
      {/* Karakter Defteri Bilgi Modalı */}
      {showCharacterBookInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowCharacterBookInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-muted transition-colors"
            >
              <X size={20} />
            </button>
            <Typography variant="h2" className="text-2xl font-black text-text mb-4">Karakter Defteri</Typography>
            <div className="space-y-4 text-muted">
              <p>Karakter defteri, hikayedeki tüm karakterlerin fiziksel, psikolojik ve geçmişe dair derinlemesine bilgilerinin yer aldığı özel bir ansiklopedidir.</p>
              <p>Yazarlar bu bölümü kullanarak okuyucularına karakterlerin bilinmeyen yönlerini sunabilir. Bu özellik sadece <strong className="text-yellow-500">Premium</strong> üyelere özeldir.</p>
            </div>
            <div className="mt-8 flex justify-end">
              <Button variant="primary" onPress={() => setShowCharacterBookInfo(false)} className="rounded-full px-6">
                Anladım
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Alanı (Kapak & Temel Bilgiler) ── */}
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

        {/* Arka Plan Bulanık Kapak (Webtoon Tarzı) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${story.coverImage})` }}
          />
          {/* Overlay Gradients & Blur */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-8 flex flex-col lg:flex-row gap-10 items-center lg:items-end">
          {/* Kapak Resmi */}
          <div className="w-48 md:w-64 flex-shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-text/10">
            {story.coverImage ? (
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                <BookOpen size={48} className="text-muted/50" />
              </div>
            )}
          </div>

          {/* Kitap Bilgileri */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up">
            
            {/* Status & Puan Rozetleri */}
            <div className="flex flex-wrap gap-2 mb-3 justify-center lg:justify-start">
              <span className="px-3 py-1 bg-background/80 backdrop-blur-md text-text text-xs font-bold rounded-full border border-border/50 shadow-sm">
                {story.status === 'completed' ? 'Tamamlandı' : story.status === 'ongoing' ? 'Devam Ediyor' : 'Taslak'}
              </span>
              <span className="px-3 py-1 bg-background/80 backdrop-blur-md text-text text-xs font-bold rounded-full border border-border/50 shadow-sm flex items-center gap-1">
                <Star size={12} className="text-amber-500" /> {story.stats?.rating?.toFixed(1) || '0.0'}
              </span>
            </div>

            <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl font-black text-text mb-2 leading-tight drop-shadow-lg">
              {story.title}
            </Typography>
            
            {author && (
              <Link href={`/profile/@${author.username}`} className="group flex items-center gap-3 mt-1 mb-3 hover:opacity-80 transition-opacity">
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
              <div className="flex flex-wrap gap-1.5 mb-4 justify-center lg:justify-start max-w-sm lg:max-w-none">
                {story.tags.map(t => (
                  <Link href={`/search?tag=${t}`} key={t}>
                    <span className="px-2.5 py-1 bg-background/50 backdrop-blur-md border border-border/20 text-text hover:bg-primary hover:text-primary-foreground hover:border-primary/50 transition-all rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm block">
                      #{t}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* İstatistikler */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-8">
              <div className="flex items-center gap-1.5 text-text/80 bg-background/30 border border-border/20 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm cursor-default" title="Okunma Sayısı">
                <Eye size={14} /> <span>{story.stats?.views?.toLocaleString('tr-TR') || '0'}</span>
              </div>
              <button 
                onClick={handleToggleLike}
                disabled={isLikeLoading}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm transition-colors disabled:opacity-50
                  ${isLiked ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-background/30 border-border/20 text-text/80 hover:bg-white/10'}
                `}
                title="Beğen"
              >
                <Heart size={14} className={isLiked ? "fill-primary text-primary" : ""} /> 
                <span>{story.stats?.likes || 0}</span>
              </button>
              <div className="flex items-center gap-1.5 text-text/80 bg-background/30 border border-border/20 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm cursor-default" title="Bölüm Sayısı">
                <List size={14} /> <span>{chapters.length} Bölüm</span>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mt-2 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              <Button 
                variant="primary" 
                onPress={() => chapters.length > 0 && router.push(`/read/${storyId}/${chapters[0].chapterId}`)} 
                className="w-full md:w-auto shadow-lg shadow-primary/20 text-base md:px-8 py-3"
                disabled={chapters.length === 0}
              >
                <BookOpen size={20} className="mr-2" /> {chapters.length === 0 ? 'Bölüm Yok' : 'İlk Bölümü Oku'}
              </Button>
              
              <Button 
                variant="outline" 
                onPress={() => router.push(`/readix?hashtag=${encodeURIComponent(story.title.replace(/\s+/g, ''))}`)}
                className="w-full md:w-auto bg-background/80 border-border/50 hover:bg-muted text-text shadow-sm backdrop-blur-md text-base md:px-6 py-3 h-[52px]"
              >
                <Hash size={20} className="mr-2 text-primary" /> Readixle
              </Button>

              <button 
                onClick={handleToggleSave} 
                disabled={saving}
                className="w-full md:w-auto h-[52px] bg-background/80 border border-border/50 hover:bg-muted text-text shadow-sm backdrop-blur-md rounded-xl flex items-center justify-center px-4 md:px-5 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : (
                  isSaved ? <BookmarkCheck size={18} className="text-primary" /> : <BookmarkPlus size={18} />
                )}
                <span className="ml-2 font-medium whitespace-nowrap text-sm">{isSaved ? 'Kütüphanede' : 'Kütüphaneye Ekle'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alt İçerik Alanı (3 Sütunlu Yapı) ── */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 w-full animate-fade-in grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-10 pb-20 mt-10">
        
        {/* ================================== */}
        {/* SÜTUN 1: HAKKINDA & KARAKTERLER   */}
        {/* ================================== */}
        <div className="xl:col-span-1 flex flex-col gap-10">
          
          <div className="space-y-10">
              
              {/* Kitap Fragmanı (Video) */}
              {story.trailerVideoUrl && (
                <div className="bg-black/90 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 relative group animate-fade-in-up">
                  <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                    <Typography variant="caption" className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-[10px]">
                      <Play size={12} className="text-primary fill-current" /> Fragmanı İzle
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

              {/* Özet */}
              <div className="bg-card/30 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                <Typography variant="h3" className="text-xl font-bold mb-4 text-text flex items-center gap-2 relative z-10">
                  <BookOpen size={20} className="text-primary" /> Hikaye Özeti
                </Typography>
                <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-line text-lg relative z-10">
                  {story.summary || 'Bu kitap için henüz bir özet girilmemiş.'}
                </Typography>
              </div>

              {/* Önsöz (Varsa) */}
              {story.foreword && (
                <div className="bg-card/30 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                  <Typography variant="h3" className="text-xl font-bold mb-4 text-text flex items-center gap-2 relative z-10">
                    Önsöz
                  </Typography>
                  <Typography variant="body" className={`text-muted leading-relaxed whitespace-pre-line text-lg italic relative z-10 ${!isForewordExpanded ? 'line-clamp-4' : ''}`}>
                    "{story.foreword}"
                  </Typography>
                  {story.foreword.length > 200 && (
                    <button 
                      onClick={() => setIsForewordExpanded(!isForewordExpanded)}
                      className="text-primary font-semibold text-sm hover:underline mt-2 transition-all relative z-10"
                    >
                      {isForewordExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
                    </button>
                  )}
                </div>
              )}

              {/* Arka Kapak Yazısı (Varsa) */}
              {story.backCover && (
                <div className="bg-card/30 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <Typography variant="h3" className="text-lg font-bold mb-3 text-text/90">Arka Kapak Yazısı</Typography>
                    <Typography variant="body" className={`text-muted/90 leading-relaxed whitespace-pre-line ${!isBackCoverExpanded ? 'line-clamp-4' : ''}`}>
                      {story.backCover}
                    </Typography>
                    {story.backCover.length > 200 && (
                      <button 
                        onClick={() => setIsBackCoverExpanded(!isBackCoverExpanded)}
                        className="text-primary font-semibold text-sm hover:underline mt-2 transition-all"
                      >
                        {isBackCoverExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Karakterler */}
          {characters.length > 0 && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <Typography variant="h2" className="text-2xl font-black text-text">Karakterler</Typography>
                  <button 
                    onClick={() => setShowCharacterBookInfo(true)}
                    className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Karakter Defteri Nedir?"
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>

            {!canViewCharacters ? (
              <div className="text-center py-20 bg-card/50 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6 border border-yellow-500/30">
                    <Lock size={32} className="text-yellow-500" />
                  </div>
                  <Typography variant="h3" className="mb-2 text-text font-bold text-center">Premium Özellik</Typography>
                  <Typography variant="body" className="text-muted text-center max-w-md mx-auto mb-8 px-4">
                    Karakter defteri özelliği sadece Premium üyelere ve Adminlere özeldir. Hikayedeki karakterlerin derinliklerini keşfetmek için Premium'a geçin.
                  </Typography>
                  <Button onPress={() => router.push('/premium')} variant="primary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none px-8 py-3 rounded-full font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all">
                    Premium'a Yükselt
                  </Button>
                </div>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-20 bg-card/50 rounded-3xl border border-white/5">
                <Users size={64} className="mx-auto text-muted/30 mb-6" />
                <Typography variant="h3" className="mb-2 text-text/80 text-center">Karakterler Gizli</Typography>
                <Typography variant="body" className="text-muted text-center max-w-md mx-auto px-4">
                  Yazar henüz bu hikaye için karakter defterini paylaşmamış veya karakterler gizli tutuluyor.
                </Typography>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {characters.map(char => (
                  <div key={char.id} className="bg-card border border-border/40 hover:border-primary/50 rounded-3xl overflow-hidden transition-all group flex flex-col shadow-lg shadow-black/5 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-64 w-full bg-muted/10 overflow-hidden">
                      {char.avatarUrl ? (
                        <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <Users size={48} className="text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-border/50">
                        <span className="text-[10px] font-bold text-text">{
                          char.role === 'protagonist' ? 'Baş Karakter' :
                          char.role === 'antagonist' ? 'Düşman' :
                          char.role === 'supporting' ? 'Yan Karakter' : 'Figüran'
                        }</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <Typography variant="h3" className="font-black text-text mb-1 group-hover:text-primary transition-colors text-lg">
                        {char.name}
                      </Typography>
                      <Typography variant="caption" className="text-muted font-medium mb-3 block text-xs">
                        {char.occupation || 'Meslek Belirtilmedi'} • {char.age || '?'} Yaşında
                      </Typography>
                      
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {char.personalityTraits?.slice(0, 2).map((trait: string, i: number) => (
                          <span key={i} className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                            {trait}
                          </span>
                        ))}
                        {(char.personalityTraits?.length || 0) > 2 && (
                          <span className="bg-muted/10 text-muted text-[9px] font-bold px-2 py-1 rounded-md">
                            +{(char.personalityTraits?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
        </div>

        {/* ================================== */}
        {/* SÜTUN 2: BÖLÜMLER                 */}
        {/* ================================== */}
        <div className="xl:col-span-2 flex flex-col gap-10">
          <div className="w-full">
            <div className="bg-card/30 border border-white/5 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h2" className="text-2xl font-bold">İçindekiler</Typography>
                <span className="text-muted bg-text/5 px-4 py-1.5 rounded-full text-sm font-medium border border-text/10">
                  {chapters.length} Bölüm
                </span>
              </div>
              
              <div className="space-y-2">
                {chapters.length > 0 ? (
                  <>
                    {chapters.slice(0, visibleChaptersCount).map((chapter, index) => {
                      let isScheduled = false;
                      let publishDateObj = null;
                      if (chapter.status === 'scheduled' && chapter.publishDate) {
                        publishDateObj = chapter.publishDate.toDate ? chapter.publishDate.toDate() : new Date(chapter.publishDate as any);
                        if (publishDateObj > new Date()) {
                          isScheduled = true;
                        }
                      }

                      return (
                        <div
                          key={chapter.chapterId}
                          className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 border rounded-xl transition-all group relative overflow-hidden ${
                            isScheduled 
                              ? 'bg-background/50 border-border/10 opacity-80 cursor-default' 
                              : 'bg-card border-border/20 hover:border-primary/50 hover:shadow-md cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isScheduled) router.push(`/read/${storyId}?chapterId=${chapter.chapterId}`);
                          }}
                        >
                          <div className="flex items-center gap-4 mb-3 md:mb-0 flex-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner text-lg font-black ${
                              isScheduled 
                                ? 'bg-muted/10 text-muted' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {isScheduled ? <Lock size={18} /> : index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-2">
                              <Typography variant="body" className={`font-bold text-base md:text-lg line-clamp-2 md:line-clamp-1 ${
                                isScheduled ? 'text-text/70' : 'group-hover:text-primary transition-colors'
                              }`}>
                                {chapter.title}
                              </Typography>
                            </div>
                          </div>

                          {!isScheduled ? (
                            <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 text-xs md:text-sm text-muted md:border-none border-t border-border/10 pt-3 md:pt-0 shrink-0">
                              <span className="flex items-center gap-1.5"><Calendar size={14} className="md:w-4 md:h-4"/> {chapter.publishDate ? (chapter.publishDate as any)?.seconds ? new Date((chapter.publishDate as any).seconds * 1000).toLocaleDateString('tr-TR') : new Date(chapter.publishDate as any).toLocaleDateString('tr-TR') : Date.now()}</span>
                              <div className="flex items-center gap-3 md:gap-5">
                                <span className="flex items-center gap-1.5"><Eye size={14} className="md:w-4 md:h-4"/> {(chapter.stats?.views || 0).toLocaleString()}</span>
                                <span className="flex items-center gap-1.5"><Heart size={14} className="md:w-4 md:h-4"/> {(chapter.stats?.likes || 0).toLocaleString()}</span>
                                <span className="flex items-center gap-1.5"><MessageSquare size={14} className="md:w-4 md:h-4"/> {(chapter.stats?.commentCount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            publishDateObj && (
                              <div className="flex flex-col md:items-end justify-between md:justify-end gap-2 md:gap-1 text-xs md:text-sm text-muted md:border-none border-t border-border/10 pt-3 md:pt-0 shrink-0">
                                <span className="text-blue-400/80 font-medium flex items-center gap-1.5 md:self-end">
                                  <Calendar size={14} /> Planlı: {publishDateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <Button 
                                  variant="outline" 
                                  className="w-full md:w-auto text-[10px] md:text-xs py-1 h-7 md:h-8 rounded-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex items-center justify-center gap-1.5"
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleToggleReminder(chapter.chapterId);
                                  }}
                                >
                                  <Bell size={12} /> Bildirimleri Aç
                                </Button>
                              </div>
                            )
                          )}
                          
                          {/* Hover indicator overlay */}
                          {!isScheduled && (
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                    
                    {visibleChaptersCount < chapters.length && (
                      <button 
                        onClick={() => setVisibleChaptersCount(prev => prev + 20)}
                        className="w-full mt-4 py-4 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <List size={18} /> Sonraki Bölümleri Yükle ({chapters.length - visibleChaptersCount} kaldı)
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen size={48} className="mx-auto text-muted/20 mb-4" />
                    <Typography variant="h3" className="text-muted mb-2">Henüz Bölüm Yok</Typography>
                    <Typography variant="body" className="text-muted/60">Yazar henüz bu kitap için bir bölüm yayınlamadı.</Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================================== */}
        {/* SÜTUN 3: SAĞ PANEL (İncelemeler)  */}
        {/* ================================== */}
        <div className="xl:col-span-1 flex flex-col gap-10">
          
          {/* Katkıda Bulunanlar (Ekip) */}
          {story.contributors && story.contributors.length > 0 && (
            <div className="bg-card/50 border border-white/5 p-6 md:p-8 rounded-3xl">
              <Typography variant="h3" className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users size={20} className="text-primary" /> Ekip
              </Typography>
              <div className="space-y-2">
                {story.contributors.map((contributor, i) => {
                  const isString = typeof contributor === 'string';
                  const role = isString ? 'Katkıda Bulunan' : contributor.role;
                  const name = isString ? contributor : contributor.name;
                  
                  return (
                    <div key={i} className="flex flex-col mb-3 bg-text/5 border border-white/5 rounded-2xl p-4 hover:bg-text/10 transition-colors">
                      <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1.5">{role}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-inner">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-text/90 font-semibold">{name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-10">
            {/* İnceleme Yazma Formu */}
            <div className="bg-card/50 border border-primary/20 p-6 md:p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              
              <Typography variant="h3" className="text-xl font-bold mb-2">Kendi İncelemeni Yaz</Typography>
              <Typography variant="body" className="text-muted mb-6">Kitabı değerlendirerek diğer okurlara ve yazara destek olabilirsin.</Typography>
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-text/80">Puanın (1-10):</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseFloat(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="font-black text-2xl text-yellow-500 w-12 text-center">{reviewRating}</span>
                </div>
                
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Düşüncelerini buraya yaz..."
                  className="w-full bg-background border border-text/10 rounded-2xl p-5 text-text focus:outline-none focus:border-primary resize-y min-h-[120px]"
                />
                
                <div className="flex justify-end">
                  <Button 
                    variant="primary" 
                    onPress={handleSubmitReview} 
                    disabled={submittingReview || !reviewText.trim()}
                    className="px-8 rounded-full"
                  >
                    {submittingReview ? 'Gönderiliyor...' : 'İncelemeyi Gönder'}
                  </Button>
                </div>
              </div>
            </div>

            {/* İnceleme Listesi */}
            <div className="space-y-6">
              <Typography variant="h3" className="text-2xl font-bold mb-6 flex items-center gap-2">
                Topluluk İncelemeleri <span className="text-muted text-lg font-normal">({reviews.length})</span>
              </Typography>

              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.reviewId} className="bg-card/20 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row gap-6">
                    {/* Sol taraf avatar vb. eklenebilir. Şimdilik sade */}
                    <div className="w-12 h-12 rounded-full bg-text/10 flex-shrink-0 flex items-center justify-center font-bold text-lg text-text/50 overflow-hidden">
                      {review.authorAvatarUrl ? (
                        <img src={review.authorAvatarUrl} alt={review.authorName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        (review.authorName ? review.authorName.substring(0,2) : review.userId.substring(0,2)).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-text">{review.authorName || `Kullanıcı ${review.userId.substring(0,6)}`}</span>
                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-sm font-bold">
                          <Star size={14} className="fill-current" /> {review.rating}/10
                        </div>
                      </div>
                      <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-line">
                        {review.text}
                      </Typography>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-card/10 rounded-3xl border border-dashed border-text/10">
                  <MessageSquare size={40} className="mx-auto text-muted/30 mb-4" />
                  <Typography variant="h3" className="text-text/60 mb-2">Henüz İnceleme Yok</Typography>
                  <Typography variant="body" className="text-muted">İlk incelemeyi yapan sen ol!</Typography>
                </div>
              )}
            </div>
          </div>

          {/* BAHSEDİLENLER */}
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border/20">
            <Typography variant="h3" className="font-bold mb-4 flex items-center gap-2">
              <Hash size={18} className="text-primary" /> Bahsedilenler
            </Typography>
            
            {mentionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : mentions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {mentions.slice(0, visibleMentionsCount).map((readix) => {
                  const author = mentionsAuthors[readix.authorId] || userProfile;
                  return (
                    <ReadixCard
                      key={readix.id}
                      linkedStory={readix.linkedStory}
                      authorName={author?.displayName || 'Bilinmiyor'}
                      authorUsername={author?.username || 'user'}
                      authorAvatarUrl={author?.avatarUrl}
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
                    className="w-full mt-2 text-primary text-sm py-1"
                    onPress={() => setVisibleMentionsCount(prev => prev + 5)}
                  >
                    Daha Fazla Göster ({mentions.length - visibleMentionsCount})
                  </Button>
                )}
              </div>
            ) : (
              <Typography variant="caption" className="text-muted italic text-center block">
                Henüz bu kitaptan bahsedilen bir Readix paylaşılmamış.
              </Typography>
            )}
          </div>

        </div>

      </div>

      {/* BUNLARI DA SEVEBİLİRSİNİZ */}
      {similarStories.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 w-full mt-12 pb-20 animate-fade-in-up border-t border-white/5 pt-12">
          <Typography variant="h2" className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Heart size={24} className="text-primary" /> Bunları Da Seveceksiniz
          </Typography>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {similarStories.map(sim => (
              <div key={sim.storyId} className="w-[130px] md:w-[150px] flex-shrink-0 transition-transform duration-300 hover:-translate-y-2">
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
  );
}
