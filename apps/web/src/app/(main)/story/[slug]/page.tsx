"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Typography, Button, Input } from '@readixon/ui';
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
  useAuthStore
} from '@readixon/core';
import type { Story, User, Chapter, Review } from '@readixon/core';
import { 
  BookOpen, Heart, Eye, List, Play, BookmarkPlus, BookmarkCheck, 
  ArrowLeft, Loader2, Star, MessageSquare, Users, Award, PenTool, Hash,
  Lock, Calendar, Bell
} from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { firebaseUser, isInitialized } = useAuthStore();
  
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

  // Sekmeler
  const [activeTab, setActiveTab] = useState<'about' | 'chapters' | 'reviews'>('about');

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

  const handleToggleSave = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    setSaving(true);
    try {
      const nowSaved = await toggleSaveStory(firebaseUser.uid, storyId);
      setIsSaved(nowSaved);
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
        rating: reviewRating,
        text: reviewText,
        createdAt: new Date() as any,
      }, ...prev]);
      setReviewText('');
      setReviewRating(10);
      
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

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-20 overflow-x-hidden">
      
      {/* ── Üst Bar (Geri Butonu vb.) ── */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => router.back()}
          className="pointer-events-auto w-10 h-10 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center border border-text/10 hover:bg-background/80 transition-colors"
        >
          <ArrowLeft size={20} className="text-text" />
        </button>
      </div>

      {/* ── Hero Alanı (Kapak & Temel Bilgiler) ── */}
      <div className="relative w-full">
        {/* Arka Plan Bulanık Kapak */}
        <div className="absolute inset-0 h-[60vh] md:h-[50vh] z-0 overflow-hidden">
          {story.coverImage ? (
            <img src={story.coverImage} alt="Background" className="w-full h-full object-cover opacity-20 blur-2xl scale-125" />
          ) : (
            <div className="w-full h-full bg-primary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-8 flex flex-col md:flex-row gap-10 items-center md:items-end">
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
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left animate-fade-in-up">
            
            {/* Puan Rozeti */}
            <div className="mb-4 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-1.5 rounded-full backdrop-blur-md font-bold text-sm">
              <Star size={16} className="fill-current" /> 
              <span>Readixon Score: {story.stats?.rating ? `${story.stats.rating}/10` : 'Puanlanmamış'}</span>
              <span className="text-yellow-500/50 font-normal ml-1">({story.stats?.reviewCount || 0} İnceleme)</span>
            </div>

            <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl font-black text-text mb-2 leading-tight drop-shadow-lg">
              {story.title}
            </Typography>
            
            <div className="flex items-center gap-2 mb-6 text-text/80 hover:text-text transition-colors text-lg">
              <span>Eser Sahibi:</span>
              <Link href={author?.username ? `/profile/@${author.username}` : '#'} className="font-bold text-primary hover:underline drop-shadow-md">
                {author?.displayName || 'Bilinmeyen Yazar'}
              </Link>
            </div>

            {/* İstatistikler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              <div className="flex items-center gap-1.5 text-text/90 bg-text/10 border border-text/10 px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg">
                <Eye size={16} /> <span className="font-medium">{story.stats?.views || 0} Okunma</span>
              </div>
              <button 
                onClick={handleToggleLike}
                disabled={isLikeLoading}
                className={`flex items-center gap-1.5 border px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg transition-colors disabled:opacity-50
                  ${isLiked ? 'bg-red-500/20 border-red-500/40 text-red-100' : 'bg-text/10 border-text/10 text-text/90 hover:bg-white/20'}
                `}
              >
                <Heart size={16} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-text'}`} /> 
                <span className="font-medium">{story.stats?.likes || 0} Beğeni</span>
              </button>
              <div className="flex items-center gap-1.5 text-text/90 bg-text/10 border border-text/10 px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg">
                <List size={16} /> <span className="font-medium">{chapters.length} Bölüm</span>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-wrap gap-4 w-full justify-center md:justify-start">
              <Button 
                variant="primary" 
                className="rounded-full px-8 py-4 text-lg shadow-primary/30 shadow-lg font-bold flex items-center gap-2"
                onPress={() => router.push(`/read/${storyId}`)}
                disabled={chapters.length === 0}
              >
                <Play size={20} className="fill-current" />
                {chapters.length === 0 ? 'Bölüm Yok' : 'Hemen Oku'}
              </Button>
              <Button 
                variant="secondary" 
                className="rounded-full px-8 py-4 text-lg shadow-blue-500/20 shadow-lg font-bold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-text border-none"
                onPress={() => router.push(`/readix?hashtag=${encodeURIComponent(story.title.replace(/\s+/g, ''))}`)}
              >
                <Hash size={20} />
                Readixle
              </Button>
              <Button 
                variant="secondary" 
                className="rounded-full px-8 py-4 text-lg font-semibold bg-text/10 hover:bg-white/20 text-text border border-text/20 backdrop-blur-md"
                onPress={handleToggleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isSaved ? (
                  <><BookmarkCheck size={20} className="text-primary" /> Kaydedildi</>
                ) : (
                  <><BookmarkPlus size={20} /> Kütüphaneye Ekle</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sekme (Tab) Menüsü ── */}
      <div className="max-w-6xl mx-auto w-full px-6 mt-8 mb-8">
        <div className="flex items-center gap-8 border-b border-text/10 overflow-x-auto custom-scrollbar pb-px">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 py-4 text-lg font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <BookOpen size={20} /> Hakkında
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 py-4 text-lg font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'chapters' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <List size={20} /> Bölümler <span className="bg-text/10 text-xs px-2 py-0.5 rounded-full">{chapters.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 py-4 text-lg font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <MessageSquare size={20} /> İncelemeler <span className="bg-text/10 text-xs px-2 py-0.5 rounded-full">{reviews.length}</span>
          </button>
        </div>
      </div>

      {/* ── Alt İçerik Alanı ── */}
      <div className="max-w-6xl mx-auto px-6 w-full animate-fade-in">
        
        {/* TAB: HAKKINDA */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              
              {/* Önsöz (Varsa) */}
              {story.foreword && (
                <div className="bg-card/30 border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                  <Typography variant="h3" className="text-xl font-bold mb-4 text-text flex items-center gap-2 relative z-10">
                    Önsöz
                  </Typography>
                  <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-line text-lg italic relative z-10">
                    "{story.foreword}"
                  </Typography>
                </div>
              )}

              {/* Özet */}
              <div>
                <Typography variant="h3" className="text-xl font-bold mb-4 text-text flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" /> Hikaye Özeti
                </Typography>
                <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-line text-lg">
                  {story.summary || 'Bu kitap için henüz bir özet girilmemiş.'}
                </Typography>
              </div>

              {/* Arka Kapak Yazısı (Varsa) */}
              {story.backCover && (
                <div className="border-l-4 border-primary pl-6 py-2">
                  <Typography variant="h3" className="text-lg font-bold mb-3 text-text/90">Arka Kapak Yazısı</Typography>
                  <Typography variant="body" className="text-muted/90 leading-relaxed whitespace-pre-line">
                    {story.backCover}
                  </Typography>
                </div>
              )}
            </div>

            {/* Sağ Kolon (Metadata) */}
            <div className="lg:col-span-1 space-y-8">
              {/* Katkıda Bulunanlar */}
              {story.contributors && story.contributors.length > 0 && (
                <div className="bg-card/50 border border-white/5 p-6 rounded-2xl">
                  <Typography variant="h3" className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users size={18} className="text-primary" /> Ekip
                  </Typography>
                  <div className="space-y-1">
                    {story.contributors.map((contributor, i) => {
                      const isString = typeof contributor === 'string';
                      const role = isString ? 'Katkıda Bulunan' : contributor.role;
                      const name = isString ? contributor : contributor.name;
                      
                      return (
                        <div key={i} className="flex flex-col mb-3 bg-text/5 border border-white/5 rounded-xl p-3 hover:bg-text/10 transition-colors">
                          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1">{role}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-inner">
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

              {/* Kategoriler */}
              <div className="bg-card/50 border border-white/5 p-6 rounded-2xl">
                <Typography variant="h3" className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award size={18} className="text-primary" /> Etiketler
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {story.tags && story.tags.length > 0 ? (
                    story.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg bg-text/5 border border-text/10 text-muted text-sm cursor-pointer hover:bg-primary hover:text-text hover:border-primary transition-all">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted text-sm italic">Etiket bulunmuyor</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BÖLÜMLER */}
        {activeTab === 'chapters' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/30 border border-white/5 rounded-3xl p-6 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h2" className="text-2xl font-bold">İçindekiler</Typography>
                <span className="text-muted bg-text/5 px-4 py-1.5 rounded-full text-sm font-medium border border-text/10">
                  {chapters.length} Bölüm
                </span>
              </div>
              
              <div className="space-y-2">
                {chapters.length > 0 ? (
                  chapters.map((chapter, index) => {
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
                        className={`w-full text-left p-4 md:p-5 rounded-2xl transition-colors group flex flex-col md:flex-row md:items-center gap-4 border ${isScheduled ? 'bg-background/50 border-white/5 opacity-80 cursor-default' : 'hover:bg-primary/10 border-transparent hover:border-primary/20 cursor-pointer'}`}
                        onClick={() => {
                          if (!isScheduled) router.push(`/read/${storyId}?chapterId=${chapter.chapterId}`);
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1 w-full">
                          <div className={`w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center font-bold transition-colors ${isScheduled ? 'bg-text/5 text-muted' : 'bg-text/5 group-hover:bg-primary/20 text-muted group-hover:text-primary'}`}>
                            {isScheduled ? <Lock size={16} /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-bold text-lg block mb-1 truncate ${isScheduled ? 'text-text/70' : 'text-text/90 group-hover:text-primary'}`}>
                              {chapter.title}
                            </span>
                            <div className="text-muted/60 text-sm flex items-center gap-4 mt-1">
                              {!isScheduled ? (
                                <>
                                  <span className="flex items-center gap-1.5"><Eye size={14}/> {chapter.stats?.views || 0}</span>
                                  <span className="flex items-center gap-1.5"><Heart size={14} className={chapter.stats?.likes ? "text-red-400/70" : ""} /> {chapter.stats?.likes || 0}</span>
                                  <span className="flex items-center gap-1.5"><MessageSquare size={14}/> {chapter.stats?.commentCount || 0}</span>
                                </>
                              ) : (
                                <span className="text-blue-400/80 font-medium flex items-center gap-1.5">
                                  <Calendar size={14} /> Planlı
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {!isScheduled ? (
                            <Play size={20} className="text-muted/30 group-hover:text-primary transition-colors hidden md:block" />
                          ) : null}
                        </div>
                        
                        {isScheduled && publishDateObj && (
                          <div className="flex flex-col md:items-end w-full md:w-auto mt-3 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-0">
                            <Typography variant="caption" className="text-muted text-xs mb-2 md:mb-1">
                              {publishDateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} yayında
                            </Typography>
                            <Button 
                              variant="outline" 
                              className="w-full md:w-auto text-xs py-1 h-8 rounded-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex items-center justify-center gap-1.5"
                              onPress={(e) => {
                                e.stopPropagation();
                                handleToggleReminder(chapter.chapterId);
                              }}
                            >
                              <Bell size={12} /> Bildirimleri Aç
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
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
        )}

        {/* TAB: İNCELEMELER */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto space-y-10">
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
        )}

      </div>
    </div>
  );
}
