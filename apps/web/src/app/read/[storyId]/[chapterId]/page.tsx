'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { fetchChapter, fetchChapters, syncReadingProgress, incrementChapterView, checkChapterLiked, toggleChapterLike, addChapterComment, getChapterComments } from '@readixon/core';
import type { Chapter, Comment } from '@readixon/core';
import { useReaderStore } from '@readixon/core/src/store/useReaderStore';
import { useAuthStore } from '@readixon/core/src/store/useAuthStore';
import { ContentRenderer, ReadingSettingsPanel, Button, Typography } from '@readixon/ui';
import { ArrowLeft, Settings, List, ChevronLeft, ChevronRight, CheckCircle, X, Heart, MessageSquare } from 'lucide-react';

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const storyId = params.storyId as string;
  const chapterId = params.chapterId as string;

  const { firebaseUser, isInitialized } = useAuthStore();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Etkileşim State'leri
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const { theme, fontSize, setTheme, setFontSize } = useReaderStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [chaps, chap, fetchedComments] = await Promise.all([
        fetchChapters(storyId),
        fetchChapter(storyId, chapterId),
        getChapterComments(storyId, chapterId)
      ]);

      if (chap && chap.status === 'scheduled' && chap.publishDate) {
        const pubDate = chap.publishDate.toDate ? chap.publishDate.toDate() : new Date(chap.publishDate as any);
        if (pubDate > new Date()) {
          // Check if user is the author
          const { getStoryById } = await import('@readixon/core');
          const storyData = await getStoryById(storyId);
          if (!firebaseUser || storyData?.authorId !== firebaseUser.uid) {
            toast.error("Bu bölüm henüz yayınlanmadı.");
            router.push(`/story/${storyId}`);
            return;
          }
        }
      }
      
      // View sayısını 1 artır (Arka planda çalışsın, beklemeye gerek yok)
      incrementChapterView(storyId, chapterId);
      
      if (firebaseUser) {
        const liked = await checkChapterLiked(storyId, chapterId, firebaseUser.uid);
        setIsLiked(liked);
      }
      
      setChapters(chaps);
      setChapter(chap);
      setComments(fetchedComments);
      setLoading(false);
    };
    if (storyId && chapterId && isInitialized) {
      loadData();
    }
  }, [storyId, chapterId, firebaseUser, isInitialized]);

  const handleToggleLike = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (isLikeLoading || !chapter) return;
    
    setIsLikeLoading(true);
    try {
      const nowLiked = await toggleChapterLike(storyId, chapterId, firebaseUser.uid);
      setIsLiked(nowLiked);
      
      const likeDelta = nowLiked ? 1 : -1;
      
      setChapter({
        ...chapter,
        stats: {
          ...chapter.stats,
          likes: (chapter.stats?.likes || 0) + likeDelta,
          views: chapter.stats?.views || 0,
          commentCount: chapter.stats?.commentCount || 0
        }
      });
      
      // Update story lists cache so feed/explore pages reflect total story likes
      const updateStoryLikes = (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              stories: page.stories ? page.stories.map((s: any) => 
                s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
              ) : []
            }))
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((s: any) => 
            s.storyId === storyId ? { ...s, stats: { ...s.stats, likes: (s.stats?.likes || 0) + likeDelta } } : s
          );
        }
        return oldData;
      };

      queryClient.setQueryData(['stories', 'recent'], updateStoryLikes);
      queryClient.setQueryData(['stories', 'top'], updateStoryLikes);
      
    } catch (err) {
      console.error("Beğeni işlemi başarısız:", err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await addChapterComment(storyId, chapterId, firebaseUser.uid, commentText);
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      setScrollProgress(Math.min(100, Math.max(0, Math.round(scrollPercent * 100))));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync reading progress to Firestore
  useEffect(() => {
    if (!firebaseUser || loading || !chapter) return;
    
    const timeoutId = setTimeout(() => {
      const isCompleted = scrollProgress > 95;
      syncReadingProgress(
        firebaseUser.uid,
        storyId,
        chapterId,
        scrollProgress,
        isCompleted
      );
    }, 2000); // 2 saniye debounce

    return () => clearTimeout(timeoutId);
  }, [scrollProgress, firebaseUser, loading, chapterId, storyId, chapter]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Typography variant="h3">Yükleniyor...</Typography>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Typography variant="h3">Bölüm bulunamadı.</Typography>
        <Button variant="primary" onPress={() => router.back()} className="mt-4">Geri Dön</Button>
      </div>
    );
  }

  // Find next and prev chapters
  const currentIndex = chapters.findIndex(c => c.chapterId === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Theme Styles
  const themeStyles = {
    light: { bg: '#ffffff', text: '#000000' },
    dark: { bg: '#121212', text: '#ffffff' },
    sepia: { bg: '#f4ecd8', text: '#5b4636' }
  };
  const currentThemeStyle = themeStyles[theme];

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: currentThemeStyle.bg, color: currentThemeStyle.text }}
    >
      {/* Top Navbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/10 bg-opacity-90 backdrop-blur"
           style={{ backgroundColor: `${currentThemeStyle.bg}E6` }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onPress={() => router.back()} className="rounded-full p-2">
            <ArrowLeft size={24} color={currentThemeStyle.text} />
          </Button>
          <Typography variant="h3" style={{ color: currentThemeStyle.text }}>
            {chapter.title}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onPress={() => setShowChapterList(true)} className="rounded-full p-2">
            <List size={24} color={currentThemeStyle.text} />
          </Button>
          <Button 
            variant="ghost" 
            onPress={() => setShowSettings(!showSettings)} 
            className="rounded-full p-2"
          >
            <Settings size={24} color={currentThemeStyle.text} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-[73px] left-0 w-full h-1 bg-border/20 z-10">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <ContentRenderer blocks={chapter.contentBlocks} fontSize={fontSize} textColor={currentThemeStyle.text} />
        
        {/* Bölüm Beğeni ve Tartışma Alanı */}
        <div className="mt-20 pt-8 border-t border-border/20">
          <div className="flex flex-col items-center justify-center mb-16 space-y-4">
            <Typography variant="h3" style={{ color: currentThemeStyle.text }}>Bu bölümü nasıl buldunuz?</Typography>
            <button 
              onClick={handleToggleLike}
              disabled={isLikeLoading}
              className={`flex items-center gap-2 border px-6 py-3 rounded-full text-lg shadow-lg transition-colors disabled:opacity-50
                ${isLiked ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-transparent border-border/30 hover:bg-black/5'}
              `}
              style={{ color: isLiked ? '#ef4444' : currentThemeStyle.text }}
            >
              <Heart size={24} className={`transition-colors ${isLiked ? 'fill-current' : ''}`} /> 
              <span className="font-bold">{chapter.stats?.likes || 0} Beğeni</span>
            </button>
          </div>

          <div className="mb-12">
            <Typography variant="h3" className="mb-6 flex items-center gap-2" style={{ color: currentThemeStyle.text }}>
              <MessageSquare size={20} /> Tartışma ({comments.length})
            </Typography>

            <div className="mb-8">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Bölüm hakkındaki düşüncelerini paylaş..."
                className="w-full bg-black/5 border border-border/20 rounded-xl p-4 focus:outline-none focus:border-primary resize-y min-h-[100px]"
                style={{ color: currentThemeStyle.text }}
              />
              <div className="flex justify-end mt-3">
                <Button variant="primary" onPress={handleSubmitComment} disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? 'Gönderiliyor...' : 'Yorum Yap'}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.commentId} className="bg-black/5 border border-border/10 p-5 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0 overflow-hidden">
                      {comment.authorAvatarUrl ? (
                        <img src={comment.authorAvatarUrl} alt={comment.authorName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        (comment.authorName ? comment.authorName.substring(0,2) : comment.userId.substring(0,2)).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: currentThemeStyle.text }}>{comment.authorName || `Kullanıcı ${comment.userId.substring(0,6)}`}</span>
                        <span className="text-sm opacity-50" style={{ color: currentThemeStyle.text }}>
                          {new Date(comment.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <Typography variant="body" style={{ color: currentThemeStyle.text }} className="whitespace-pre-line leading-relaxed">
                        {comment.text}
                      </Typography>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-50">
                  <Typography variant="body" style={{ color: currentThemeStyle.text }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</Typography>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-16 pt-8 border-t border-border/20">
          {prevChapter ? (
            <Button 
              variant="outline" 
              onPress={() => router.push(`/read/${storyId}/${prevChapter.chapterId}`)}
              className="flex-1 mr-2 flex flex-row justify-center items-center gap-2"
            >
              <ChevronLeft size={20} />
              Önceki Bölüm
            </Button>
          ) : <div className="flex-1 mr-2" />}
          
          {nextChapter ? (
            <Button 
              variant="primary" 
              onPress={() => router.push(`/read/${storyId}/${nextChapter.chapterId}`)}
              className="flex-1 ml-2 flex flex-row justify-center items-center gap-2"
            >
              Sonraki Bölüm
              <ChevronRight size={20} />
            </Button>
          ) : <div className="flex-1 ml-2" />}
        </div>
      </main>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <ReadingSettingsPanel 
              theme={theme}
              fontSize={fontSize}
              onThemeChange={setTheme}
              onFontSizeChange={setFontSize}
            />
          </div>
        </div>
      )}

      {/* Chapter List Modal/Sidebar */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setShowChapterList(false)}>
          <div 
            className="w-full max-w-xs h-full bg-card overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: currentThemeStyle.bg, color: currentThemeStyle.text }}
          >
            <div className="p-6 flex items-center justify-between border-b border-border/10">
              <Typography variant="h3" style={{ color: currentThemeStyle.text }}>Bölümler</Typography>
              <Button variant="ghost" onPress={() => setShowChapterList(false)} className="p-2 rounded-full">
                <X size={24} color={currentThemeStyle.text} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chapters.map((chap) => {
                const isActive = chap.chapterId === chapterId;
                return (
                  <div 
                    key={chap.chapterId}
                    onClick={() => {
                      setShowChapterList(false);
                      router.push(`/read/${storyId}/${chap.chapterId}`);
                    }}
                    className={`p-4 border-b border-border/5 cursor-pointer hover:bg-black/5 transition-colors flex justify-between items-center ${isActive ? 'bg-primary/10' : ''}`}
                  >
                    <div>
                      <Typography variant="body" className={isActive ? 'font-bold text-primary' : ''} style={{ color: isActive ? '' : currentThemeStyle.text }}>
                        {chap.title}
                      </Typography>
                    </div>
                    {isActive && <CheckCircle size={16} className="text-primary" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
