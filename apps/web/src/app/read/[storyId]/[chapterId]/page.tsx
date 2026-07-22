'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { fetchChapter, getPublishedChapters, syncReadingProgress, incrementChapterView, checkChapterLiked, toggleChapterLike, addChapterComment, getAllChapterComments, getStoryById, saveQuote, getUserProfile, trackInteraction, toggleChapterCommentLike } from '@readixon/core';
import type { Chapter, Comment, Story, User } from '@readixon/core';
import { useReaderStore } from '@readixon/core/src/store/useReaderStore';
import { useAuthStore } from '@readixon/core/src/store/useAuthStore';
import { ContentRenderer, ReadingSettingsPanel, Button, Typography } from '@readixon/ui';
import { ArrowLeft, Settings, List, ChevronLeft, ChevronRight, CheckCircle, X, Heart, MessageSquare, Eye, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { ChapterEndActivity } from '@/components/ChapterEndActivity';

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const storyId = params.storyId as string;
  const chapterId = params.chapterId as string;

  const { firebaseUser, isInitialized } = useAuthStore();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Etkileşim State'leri
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [chapterComments, setChapterComments] = useState<Comment[]>([]);
  const [paragraphComments, setParagraphComments] = useState<Record<number, Comment[]>>({});
  const [paragraphCommentCounts, setParagraphCommentCounts] = useState<Record<number, number>>({});
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Satır Arası Yorum (Side Panel) State
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  const [selectedParagraphText, setSelectedParagraphText] = useState('');
  const [paragraphCommentText, setParagraphCommentText] = useState('');
  const [submittingParagraphComment, setSubmittingParagraphComment] = useState(false);

  // Yanıt (Reply) State'leri
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null);
  const [replyingToParagraphComment, setReplyingToParagraphComment] = useState<Comment | null>(null);

  const { theme, fontSize, setTheme, setFontSize } = useReaderStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [chaps, chap, fetchedComments, storyData] = await Promise.all([
        getPublishedChapters(storyId),
        fetchChapter(storyId, chapterId),
        getAllChapterComments(storyId, chapterId),
        getStoryById(storyId)
      ]);

      if (chap && chap.status === 'scheduled' && chap.publishDate) {
        const pubDate = chap.publishDate.toDate ? chap.publishDate.toDate() : new Date(chap.publishDate as any);
        if (pubDate > new Date()) {
          // Check if user is the author
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
      
      if (storyData) {
        if (!storyData.authorName) {
          try {
            const author = await getUserProfile(storyData.authorId);
            if (author) {
              storyData.authorName = author.displayName;
              storyData.authorUsername = author.username;
            }
          } catch (e) {
            console.error("Yazar bilgisi alınamadı", e);
          }
        }
        setStory(storyData as Story);
      }
      
      // Yorumları ayır
      const chapComments = fetchedComments.filter(c => c.type === 'chapter' || !c.type);
      const parComments = fetchedComments.filter(c => c.type === 'paragraph' && c.paragraphIndex >= 0);
      
      setChapterComments(chapComments);
      setComments(chapComments); // Geriye dönük uyumluluk için, tartışma kısmında chapter comments görünür
      
      const counts: Record<number, number> = {};
      const groupedPar: Record<number, Comment[]> = {};
      
      parComments.forEach(c => {
        counts[c.paragraphIndex] = (counts[c.paragraphIndex] || 0) + 1;
        if (!groupedPar[c.paragraphIndex]) groupedPar[c.paragraphIndex] = [];
        groupedPar[c.paragraphIndex].push(c);
      });
      
      setParagraphCommentCounts(counts);
      setParagraphComments(groupedPar);
      
      setLoading(false);
    };
    if (storyId && chapterId && isInitialized) {
      if (!firebaseUser) {
        router.replace('/login');
        return;
      }
      loadData();
    }
  }, [storyId, chapterId, firebaseUser, isInitialized, router]);

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
      
      if (nowLiked) {
        trackInteraction(firebaseUser.uid, 'like_given').catch(console.error);
      }
      
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
      const newComment = await addChapterComment(storyId, chapterId, firebaseUser.uid, commentText, 'chapter', -1, replyingToComment?.commentId);
      setChapterComments(prev => [newComment, ...prev]);
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setReplyingToComment(null);
      trackInteraction(firebaseUser.uid, 'comment_given').catch(console.error);
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleParagraphCommentSubmit = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!paragraphCommentText.trim() || selectedParagraphIndex === null) return;

    setSubmittingParagraphComment(true);
    try {
      const newComment = await addChapterComment(
        storyId, 
        chapterId, 
        firebaseUser.uid, 
        paragraphCommentText, 
        'paragraph', 
        selectedParagraphIndex,
        replyingToParagraphComment?.commentId
      );
      
      setParagraphComments(prev => ({
        ...prev,
        [selectedParagraphIndex]: [newComment, ...(prev[selectedParagraphIndex] || [])]
      }));
      
      setParagraphCommentCounts(prev => ({
        ...prev,
        [selectedParagraphIndex]: (prev[selectedParagraphIndex] || 0) + 1
      }));
      
      setParagraphCommentText('');
      setReplyingToParagraphComment(null);
      trackInteraction(firebaseUser.uid, 'comment_given').catch(console.error);
    } catch (error) {
      console.error("Paragraf yorumu eklenirken hata:", error);
    } finally {
      setSubmittingParagraphComment(false);
    }
  };

  const handleCommentLike = async (commentId: string, currentLikes: number, isParagraph = false) => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    
    // Optimistic Update
    if (isParagraph) {
      setParagraphComments(prev => {
        const newGroup = { ...prev };
        for (const index in newGroup) {
          newGroup[index] = newGroup[index].map(c => c.commentId === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c);
        }
        return newGroup;
      });
    } else {
      setComments(prev => prev.map(c => c.commentId === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c));
      setChapterComments(prev => prev.map(c => c.commentId === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c));
    }

    try {
      const liked = await toggleChapterCommentLike(firebaseUser.uid, storyId, chapterId, commentId);
      if (!liked) {
        // Geri al
        if (isParagraph) {
          setParagraphComments(prev => {
            const newGroup = { ...prev };
            for (const index in newGroup) {
              newGroup[index] = newGroup[index].map(c => c.commentId === commentId ? { ...c, likes: Math.max(0, currentLikes - 1) } : c);
            }
            return newGroup;
          });
        } else {
          setComments(prev => prev.map(c => c.commentId === commentId ? { ...c, likes: Math.max(0, currentLikes - 1) } : c));
          setChapterComments(prev => prev.map(c => c.commentId === commentId ? { ...c, likes: Math.max(0, currentLikes - 1) } : c));
        }
      }
    } catch (e) {
      console.error(e);
      // Hata durumunda da geri al
      if (isParagraph) {
        setParagraphComments(prev => {
          const newGroup = { ...prev };
          for (const index in newGroup) {
            newGroup[index] = newGroup[index].map(c => c.commentId === commentId ? { ...c, likes: currentLikes } : c);
          }
          return newGroup;
        });
      } else {
        setComments(prev => prev.map(c => c.commentId === commentId ? { ...c, likes: currentLikes } : c));
        setChapterComments(prev => prev.map(c => c.commentId === commentId ? { ...c, likes: currentLikes } : c));
      }
    }
  };

  const openParagraphComments = (index: number, text: string) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    let displayText = cleanText;
    if (displayText.length > 100) {
      displayText = '...' + displayText.substring(displayText.length - 100);
    }
    
    setSelectedParagraphIndex(index);
    setSelectedParagraphText(displayText);
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
        <Button variant="primary" onPress={() => router.replace(`/read/${storyId}`)} className="mt-4">Geri Dön</Button>
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

  // Yorumları Gruplama
  const rootComments = comments.filter(c => !c.replyToId);
  const repliesMap = comments.filter(c => c.replyToId).reduce((acc, reply) => {
    if (!acc[reply.replyToId!]) acc[reply.replyToId!] = [];
    acc[reply.replyToId!].push(reply);
    return acc;
  }, {} as Record<string, Comment[]>);

  const renderComment = (comment: Comment, isReply = false, isParagraph = false) => (
    <div key={comment.commentId} className={`bg-black/5 border border-border/10 p-5 rounded-2xl flex gap-4 ${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0 overflow-hidden">
        {comment.authorAvatarUrl ? (
          <img src={comment.authorAvatarUrl} alt={comment.authorName || 'User'} className="w-full h-full object-cover" />
        ) : (
          (comment.authorName ? comment.authorName.substring(0,2) : comment.userId.substring(0,2)).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold" style={{ color: currentThemeStyle.text }}>{comment.authorName || `Kullanıcı ${comment.userId.substring(0,6)}`}</span>
          <span className="text-sm opacity-50" style={{ color: currentThemeStyle.text }}>
            {new Date(comment.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('tr-TR')}
          </span>
        </div>
        <Typography variant="body" style={{ color: currentThemeStyle.text }} className="whitespace-pre-line leading-relaxed mb-3">
          {comment.text}
        </Typography>
        <div className="flex items-center gap-4 text-xs font-medium">
          <button onClick={() => handleCommentLike(comment.commentId, comment.likes || 0, isParagraph)} className="flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-red-500 transition-colors" style={{ color: currentThemeStyle.text }}>
            <Heart size={16} />
            <span>{comment.likes || 0}</span>
          </button>
          <button onClick={() => isParagraph ? setReplyingToParagraphComment(comment) : setReplyingToComment(comment)} className="flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-blue-500 transition-colors" style={{ color: currentThemeStyle.text }}>
            <Reply size={16} />
            <span>Yanıtla</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: currentThemeStyle.bg, color: currentThemeStyle.text }}
    >
      {/* Top Navbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/10 bg-opacity-90 backdrop-blur"
           style={{ backgroundColor: `${currentThemeStyle.bg}E6` }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onPress={() => router.replace(`/read/${storyId}`)} className="rounded-full p-2">
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
        <ContentRenderer 
          blocks={chapter.contentBlocks} 
          fontSize={fontSize} 
          textColor={currentThemeStyle.text}
          onParagraphCommentClick={openParagraphComments}
          paragraphCommentCounts={paragraphCommentCounts}
          onQuoteShare={(text) => {
            if (!story) return;
            const hashtag = story.title.replace(/[^\p{L}\p{N}]/gu, '');
            const mention = story.authorUsername ? `@${story.authorUsername}` : '';
            const content = `${text}\n\n#${hashtag} ${mention}`;
            router.push(`/readix?quote=${encodeURIComponent(content)}`);
          }}
          onQuoteSave={async (text) => {
            if (!firebaseUser || !story || !chapter) {
              toast.error("Alıntı kaydetmek için giriş yapmalısınız.");
              return;
            }
            try {
              await saveQuote(
                firebaseUser.uid,
                text,
                storyId,
                chapterId,
                story.title,
                story.authorName || 'Bilinmeyen Yazar',
                story.authorUsername
              );
              toast.success("Alıntı kütüphanenize kaydedildi.");
            } catch (error) {
              console.error(error);
              toast.error("Alıntı kaydedilemedi.");
            }
          }}
        />

        {/* Bölüm Sonu Aktivitesi */}
        {chapter.endActivity && (
          <ChapterEndActivity 
            activity={chapter.endActivity} 
            storyId={storyId} 
            chapterId={chapterId} 
            authorId={story?.authorId || ''} 
            userId={firebaseUser?.uid} 
            textColor={currentThemeStyle.text}
          />
        )}
        
        {/* Bölüm Beğeni ve Tartışma Alanı */}
        <div className="mt-20 pt-8 border-t border-border/20">
          <div className="flex flex-col items-center justify-center mb-16 space-y-4">
            <div className="flex items-center gap-6 mb-4 opacity-70" style={{ color: currentThemeStyle.text }}>
              <div className="flex items-center gap-2" title="Okunma">
                <Eye size={20} />
                <span className="font-bold">{chapter.stats?.views || 0}</span>
              </div>
              <div className="flex items-center gap-2" title="Yorum">
                <MessageSquare size={20} />
                <span className="font-bold">{comments.length + Object.values(paragraphComments).flat().length}</span>
              </div>
            </div>
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

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center my-12 pt-8 border-t border-border/20">
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

          <div className="mb-12">
            <Typography variant="h3" className="mb-6 flex items-center gap-2" style={{ color: currentThemeStyle.text }}>
              <MessageSquare size={20} /> Bölüm Yorumları ({comments.length})
            </Typography>

            <div className="mb-8">
              {replyingToComment && (
                <div className="flex items-center justify-between text-xs opacity-70 px-2 mb-2" style={{ color: currentThemeStyle.text }}>
                  <span><strong>{replyingToComment.authorName || 'Kullanıcı'}</strong>'na yanıt veriliyor...</span>
                  <button onClick={() => setReplyingToComment(null)} className="hover:underline">İptal</button>
                </div>
              )}
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingToComment ? "Yanıtınızı yazın..." : "Bölüm hakkındaki düşüncelerini paylaş..."}
                className="w-full bg-black/5 border border-border/20 rounded-xl p-4 focus:outline-none focus:border-primary resize-y min-h-[100px]"
                style={{ color: currentThemeStyle.text }}
              />
              <div className="flex justify-end mt-3">
                <Button variant="primary" onPress={handleSubmitComment} disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? 'Gönderiliyor...' : (replyingToComment ? 'Yanıtla' : 'Yorum Yap')}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {comments.length > 0 ? (
                rootComments.map(c => {
                  const renderTree = (comment: Comment, depth: number): React.ReactNode => (
                    <div key={`tree-${comment.commentId}`}>
                      {renderComment(comment, depth > 0, false)}
                      {repliesMap[comment.commentId] && repliesMap[comment.commentId].map(reply => renderTree(reply, depth + 1))}
                    </div>
                  );
                  return renderTree(c, 0);
                })
              ) : (
                <div className="text-center py-8 opacity-50">
                  <Typography variant="body" style={{ color: currentThemeStyle.text }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</Typography>
                </div>
              )}
            </div>
          </div>
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

      {/* Paragraph Comments Side Panel (Drawer) */}
      {selectedParagraphIndex !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setSelectedParagraphIndex(null)}>
          <div 
            className="w-full max-w-md h-full bg-card overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: currentThemeStyle.bg, color: currentThemeStyle.text }}
          >
            <div className="p-6 flex items-center justify-between border-b border-border/10">
              <Typography variant="h3" style={{ color: currentThemeStyle.text }}>Satır Arası Yorumlar</Typography>
              <Button variant="ghost" onPress={() => setSelectedParagraphIndex(null)} className="p-2 rounded-full">
                <X size={24} color={currentThemeStyle.text} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const parComments = paragraphComments[selectedParagraphIndex] || [];
                if (parComments.length === 0) {
                  return (
                    <div className="text-center py-8 opacity-50">
                      <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                      <Typography variant="body" style={{ color: currentThemeStyle.text }}>
                        Bu satıra henüz yorum yapılmamış. İlk sen yorum yap!
                      </Typography>
                    </div>
                  );
                }
                const parRootComments = parComments.filter(c => !c.replyToId);
                const parRepliesMap = parComments.filter(c => c.replyToId).reduce((acc, reply) => {
                  if (!acc[reply.replyToId!]) acc[reply.replyToId!] = [];
                  acc[reply.replyToId!].push(reply);
                  return acc;
                }, {} as Record<string, Comment[]>);

                return parRootComments.map(c => (
                  <div key={c.commentId}>
                    {renderComment(c, false, true)}
                    {parRepliesMap[c.commentId] && parRepliesMap[c.commentId].map(reply => renderComment(reply, true, true))}
                  </div>
                ));
              })()}
            </div>
            
            <div className="p-4 border-t border-border/10 bg-background">
              {replyingToParagraphComment && (
                <div className="flex items-center justify-between text-xs opacity-70 px-2 mb-2" style={{ color: currentThemeStyle.text }}>
                  <span><strong>{replyingToParagraphComment.authorName || 'Kullanıcı'}</strong>'na yanıt veriliyor...</span>
                  <button onClick={() => setReplyingToParagraphComment(null)} className="hover:underline">İptal</button>
                </div>
              )}
              <textarea 
                value={paragraphCommentText}
                onChange={(e) => setParagraphCommentText(e.target.value)}
                placeholder={replyingToParagraphComment ? "Yanıtınızı yazın..." : "Düşüncelerini paylaş..."}
                className="w-full bg-black/5 border border-border/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-y min-h-[80px]"
                style={{ color: currentThemeStyle.text }}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  variant="primary" 
                  onPress={handleParagraphCommentSubmit} 
                  disabled={submittingParagraphComment || !paragraphCommentText.trim()}
                  className="py-1.5 px-4 text-sm"
                >
                  {submittingParagraphComment ? 'Gönderiliyor...' : (replyingToParagraphComment ? 'Yanıtla' : 'Yorum Yap')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
