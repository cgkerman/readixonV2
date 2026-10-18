'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { 
  fetchChapter, 
  getPublishedChapters, 
  syncReadingProgress, 
  incrementChapterView, 
  checkChapterLiked, 
  toggleChapterLike, 
  addChapterComment, 
  getAllChapterComments, 
  getStoryById, 
  getReadingProgress,
  saveQuote, 
  getUserProfile, 
  trackInteraction, 
  toggleChapterCommentLike, 
  generateStorySlug, 
  getSeriesById, 
  generateSeriesSlug,
  getUniverseCharacters,
  getUniverseLocations,
  getUniverseGlossary,
  getUniverseItems,
  getUniverseCreatures,
  getUniversePlotThreads,
  extractMentionedEntities,
  type InlineUniverseEntity,
  type UniversePlotThread
} from '@readixon/core';
import type { Chapter, Comment, Story, User, Series, ReadingProgress, ChapterChoice, ChapterEndingType } from '@readixon/core';
import { useReaderStore, useAuthStore } from '@readixon/core';
import { ContentRenderer, ReadingSettingsPanel, Button, Typography } from '@readixon/ui';
import { ArrowLeft, Settings, List, ChevronLeft, ChevronRight, ChevronDown, CheckCircle, X, Heart, MessageSquare, Eye, Reply, Clock, Sparkles, Star, Award, BookOpen, Layers, Globe, PencilLine, GitFork, Trophy, Skull, Compass, Gamepad2, Undo2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ChapterEndActivity } from '@/components/ChapterEndActivity';
import { ChapterReactions } from '@/components/ChapterReactions';
import { ChapterMusicPlayer } from '@/components/ChapterMusicPlayer';
import { useBackButton } from '@/hooks/useBackButton';
import { ReaderUniverseDrawer, type ReaderUniverseTabType } from './ReaderUniverseDrawer';
import { InlineLorePopover } from './InlineLorePopover';
import { ChapterUniverseRecap } from './ChapterUniverseRecap';

function ChapterTitleMarquee({ title, storyTitle, textColor }: { title: string; storyTitle?: string; textColor: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  return (
    <div className="min-w-0 flex-1 overflow-hidden">
      <div ref={containerRef} className="overflow-hidden relative w-full select-none">
        {isOverflowing ? (
          <div className="flex w-max animate-reader-marquee gap-8">
            <span ref={textRef} className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap shrink-0 leading-tight" style={{ color: textColor }}>
              {title}
            </span>
            <span className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap shrink-0 opacity-80 leading-tight" style={{ color: textColor }}>
              {title}
            </span>
          </div>
        ) : (
          <span ref={textRef} className="text-sm sm:text-base md:text-lg font-bold truncate block leading-tight" style={{ color: textColor }}>
            {title}
          </span>
        )}
      </div>
      {storyTitle && (
        <span className="text-[11px] sm:text-xs opacity-60 truncate block leading-tight mt-0.5" style={{ color: textColor }}>
          {storyTitle}
        </span>
      )}
    </div>
  );
}

// Okuma sayfasına özel izole tema konfigürasyonu (Genel site temasından etkilenmez)
const readerThemeStyles: Record<string, {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  navBg: string;
  isDark: boolean;
}> = {
  light: {
    bg: '#ffffff',
    card: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    border: 'rgba(0,0,0,0.08)',
    navBg: 'rgba(255,255,255,0.96)',
    isDark: false
  },
  sepia: {
    bg: '#f4ecd8',
    card: '#ede3cb',
    text: '#433422',
    muted: '#7d6653',
    border: 'rgba(91,70,54,0.18)',
    navBg: 'rgba(244,236,216,0.96)',
    isDark: false
  },
  dark: {
    bg: '#121214',
    card: '#1a1a1e',
    text: '#f4f4f5',
    muted: '#a1a1aa',
    border: 'rgba(255,255,255,0.08)',
    navBg: 'rgba(18,18,20,0.95)',
    isDark: true
  },
  oled: {
    bg: '#000000',
    card: '#0a0a0c',
    text: '#ffffff',
    muted: '#71717a',
    border: 'rgba(255,255,255,0.12)',
    navBg: 'rgba(0,0,0,0.98)',
    isDark: true
  }
};

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
  const [showUniverseDrawer, setShowUniverseDrawer] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Seri ve Sonraki Kitap Bilgileri
  const [series, setSeries] = useState<Series | null>(null);
  const [nextSeriesBook, setNextSeriesBook] = useState<{ story: Story; order: number; customLabel?: string } | null>(null);

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
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>(undefined);
  const [selectedParagraphSnippet, setSelectedParagraphSnippet] = useState<string>('');
  const [paragraphCommentText, setParagraphCommentText] = useState('');
  const [submittingParagraphComment, setSubmittingParagraphComment] = useState(false);

  // Revizyon & Şeffaflık State'leri
  const [showRevisionNoticeBanner, setShowRevisionNoticeBanner] = useState(false);
  const [showRevisionDetails, setShowRevisionDetails] = useState(false);

  // Yanıt (Reply) State'leri
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null);
  const [replyingToParagraphComment, setReplyingToParagraphComment] = useState<Comment | null>(null);

  // Evren ve Akıllı Dipnot State'leri (PRD Bölüm 40, 41)
  const [universeEntities, setUniverseEntities] = useState<InlineUniverseEntity[]>([]);
  const [universePlotThreads, setUniversePlotThreads] = useState<UniversePlotThread[]>([]);
  const [activePopoverEntity, setActivePopoverEntity] = useState<InlineUniverseEntity | null>(null);
  const [popoverAnchorRect, setPopoverAnchorRect] = useState<DOMRect | null>(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState<ReaderUniverseTabType>('characters');
  const [drawerInitialSearch, setDrawerInitialSearch] = useState<string>('');
  const [enableLoreAnnotations, setEnableLoreAnnotations] = useState(true);

  // İnteraktif Hikaye (CYOA / Bandersnatch) State'leri
  const [readingProgressData, setReadingProgressData] = useState<ReadingProgress | null>(null);

  const {
    theme,
    fontSize,
    fontFamily,
    lineHeight,
    textAlign,
    paddingX,
    setTheme,
    setFontSize,
    setFontFamily,
    setLineHeight,
    setTextAlign,
    setPaddingX
  } = useReaderStore();

  // Mobil Cihaz Geri Tuşu Davranışları
  // 1. Okuma Ayarları açıkken geri tuşu sadece ayarları kapatsın
  useBackButton(() => {
    setShowSettings(false);
    return true;
  }, showSettings);

  // 2. Bölüm listesi açıkken geri tuşu sadece listeyi kapatsın
  useBackButton(() => {
    setShowChapterList(false);
    return true;
  }, showChapterList);

  // 3. Satır arası yorumlar açıkken geri tuşu sadece yorum panelini kapatsın
  useBackButton(() => {
    setSelectedParagraphIndex(null);
    return true;
  }, selectedParagraphIndex !== null);

  // 4. Akıllı Lore Popover açıkken geri tuşu sadece popover'ı kapatsın
  useBackButton(() => {
    setActivePopoverEntity(null);
    return true;
  }, activePopoverEntity !== null);

  // 5. Evren rehberi açıkken geri tuşu sadece evren rehberini kapatsın
  useBackButton(() => {
    setShowUniverseDrawer(false);
    return true;
  }, showUniverseDrawer);

  // 6. Hiçbir modal açık değilken okuma sayfasında geri tuşuna basılırsa doğrudan hikaye detayına dönsün (uygulamadan çıkmasın!)
  useBackButton(() => {
    if (story) {
      const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
      router.replace(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
    } else {
      router.back();
    }
    return true;
  }, !showSettings && !showChapterList && !showUniverseDrawer && selectedParagraphIndex === null && activePopoverEntity === null);

  // Kelime sayısı ve tahmini okuma süresi hesaplama (~200 kelime/dk)
  const wordCount = React.useMemo(() => {
    if (!chapter?.contentBlocks) return 0;
    return chapter.contentBlocks.reduce((acc, block) => {
      if (block.type === 'paragraph' && block.text) {
        const clean = block.text.replace(/<[^>]*>/g, ' ').trim();
        if (!clean) return acc;
        return acc + clean.split(/\s+/).filter(Boolean).length;
      }
      return acc;
    }, 0);
  }, [chapter]);

  const readingTimeMinutes = React.useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Evren Varlıklarını Arka Planda Yükle (PRD Bölüm 40, 41)
  useEffect(() => {
    if (!story?.universeId) return;
    const uId = story.universeId;

    const loadUniverseLore = async () => {
      try {
        const [chars, locs, terms, itemsList, creatureList, threadList] = await Promise.all([
          getUniverseCharacters(uId),
          getUniverseLocations(uId),
          getUniverseGlossary(uId),
          getUniverseItems(uId),
          getUniverseCreatures(uId),
          getUniversePlotThreads(uId),
        ]);

        const combinedEntities: InlineUniverseEntity[] = [
          ...chars.map((c) => ({
            id: c.id,
            name: c.name,
            type: 'character' as const,
            roleOrType: c.role,
            shortDescription: c.readerNotes || c.occupation || (c.personalityTraits ? c.personalityTraits.join(', ') : undefined),
            avatarUrl: c.avatarUrl,
            isSpoiler: c.isSpoiler,
            spoilerChapterOrder: c.spoilerThresholdChapter,
            universeId: uId,
          })),
          ...locs.map((l) => ({
            id: l.id,
            name: l.name,
            type: 'location' as const,
            roleOrType: l.type,
            shortDescription: l.description || l.readerNotes,
            avatarUrl: l.imageUrl,
            isSpoiler: l.isSpoiler,
            spoilerChapterOrder: l.spoilerThresholdChapter,
            universeId: uId,
          })),
          ...terms.map((g) => ({
            id: g.id,
            name: g.term,
            type: 'glossary' as const,
            roleOrType: g.category,
            shortDescription: g.meaning,
            isSpoiler: g.isSpoiler,
            spoilerChapterOrder: g.spoilerThresholdChapter,
            universeId: uId,
          })),
          ...itemsList.map((it) => ({
            id: it.id,
            name: it.name,
            type: 'item' as const,
            roleOrType: it.type,
            shortDescription: it.description || it.powerDescription,
            avatarUrl: it.imageUrl,
            isSpoiler: it.isSpoiler,
            spoilerChapterOrder: it.spoilerThresholdChapter,
            universeId: uId,
          })),
          ...creatureList.map((cr) => ({
            id: cr.id,
            name: cr.name,
            type: 'creature' as const,
            roleOrType: cr.dangerLevel,
            shortDescription: cr.appearance || cr.lore || cr.behavior,
            avatarUrl: cr.imageUrl,
            isSpoiler: cr.isSpoiler,
            spoilerChapterOrder: cr.spoilerThresholdChapter,
            universeId: uId,
          })),
        ];

        setUniverseEntities(combinedEntities);
        setUniversePlotThreads(threadList);
      } catch (err) {
        console.error("Evren dipnot verileri yüklenirken hata:", err);
      }
    };

    loadUniverseLore();
  }, [story?.universeId]);

  // Bu bölümde geçen evren varlıklarını tespit et
  const chapterFullText = React.useMemo(() => {
    if (!chapter?.contentBlocks) return '';
    return chapter.contentBlocks
      .filter((b) => b.type === 'paragraph' && b.text)
      .map((b) => b.text)
      .join(' ');
  }, [chapter?.contentBlocks]);

  const chapterMentionedEntities = React.useMemo(() => {
    if (!chapterFullText || universeEntities.length === 0) return [];
    return extractMentionedEntities(chapterFullText, universeEntities);
  }, [chapterFullText, universeEntities]);

  // Bölüm geçişi (doğrudan ve sayfa başı sıfırlama ile)
  const handleNavigateChapter = (targetChapterId: string) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    router.push(`/read/${storyId}/${targetChapterId}`);
  };

  // İnteraktif Hikaye Karar ve Dallanma Eylemleri
  const handleSelectChoice = async (choice: ChapterChoice) => {
    if (firebaseUser) {
      const currentHistory = readingProgressData?.pathHistory || [];
      const updatedHistory = [...currentHistory];
      if (updatedHistory[updatedHistory.length - 1] !== chapterId) {
        updatedHistory.push(chapterId);
      }
      updatedHistory.push(choice.targetChapterId);

      syncReadingProgress(
        firebaseUser.uid,
        storyId,
        choice.targetChapterId,
        0,
        true,
        {
          pathHistoryStep: choice.targetChapterId
        }
      );
      setReadingProgressData(prev => prev ? {
        ...prev,
        currentChapterId: choice.targetChapterId,
        pathHistory: updatedHistory
      } : null);
    }
    handleNavigateChapter(choice.targetChapterId);
  };

  const handleRewind = async () => {
    const history = readingProgressData?.pathHistory || [];
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevStepChapterId = newHistory[newHistory.length - 1];
      
      if (firebaseUser) {
        syncReadingProgress(
          firebaseUser.uid,
          storyId,
          prevStepChapterId,
          0,
          false,
          {
            resetPathHistory: newHistory
          }
        );
        setReadingProgressData(prev => prev ? {
          ...prev,
          currentChapterId: prevStepChapterId,
          pathHistory: newHistory
        } : null);
      }
      toast.info("Önceki karar noktasına dönüldü.");
      handleNavigateChapter(prevStepChapterId);
    } else {
      const firstChap = chapters[0]?.chapterId;
      if (firstChap && firstChap !== chapterId) {
        toast.info("Hikayenin başına dönüldü.");
        handleNavigateChapter(firstChap);
      } else {
        toast.info("Zaten ilk karar noktasındasınız.");
      }
    }
  };

  const handleRestartAdventure = async () => {
    const firstChap = chapters[0]?.chapterId;
    if (!firstChap) return;
    if (firebaseUser) {
      syncReadingProgress(
        firebaseUser.uid,
        storyId,
        firstChap,
        0,
        false,
        {
          resetPathHistory: [firstChap]
        }
      );
      setReadingProgressData(prev => prev ? {
        ...prev,
        currentChapterId: firstChap,
        pathHistory: [firstChap]
      } : null);
    }
    toast.success("Macera sıfırlandı, baştan başlıyorsun!");
    handleNavigateChapter(firstChap);
  };

  // Bölüm değiştiğinde sayfa başına dön
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [chapterId]);

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
        const [liked, userProgress] = await Promise.all([
          checkChapterLiked(storyId, chapterId, firebaseUser.uid),
          getReadingProgress(firebaseUser.uid, storyId)
        ]);
        setIsLiked(liked);
        setReadingProgressData(userProgress);
        if (userProgress && chap?.isRevised && userProgress.completedChapters?.includes(chapterId)) {
          setShowRevisionNoticeBanner(true);
        }
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

        // Seri ve Serideki Sonraki Kitap Kontrolü
        if (storyData.seriesId) {
          try {
            const s = await getSeriesById(storyData.seriesId);
            if (s) {
              setSeries(s);
              if (s.books && s.books.length > 0) {
                const sortedBooks = [...s.books].sort((a, b) => a.order - b.order);
                const currentBookIndex = sortedBooks.findIndex(b => b.storyId === storyId);
                if (currentBookIndex >= 0 && currentBookIndex < sortedBooks.length - 1) {
                  const nextItem = sortedBooks[currentBookIndex + 1];
                  const nextStory = await getStoryById(nextItem.storyId);
                  if (nextStory) {
                    setNextSeriesBook({
                      story: nextStory,
                      order: nextItem.order,
                      customLabel: nextItem.customLabel,
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error("Seri bilgisi alınamadı", e);
          }
        }
      }

      // Yorumları ayır ve akıllı blok/revizyon eşleştirmesi yap
      const chapComments = fetchedComments.filter(c => c.type === 'chapter' || !c.type);
      const rawParComments = fetchedComments.filter(c => c.type === 'paragraph' && c.paragraphIndex >= 0);

      setChapterComments(chapComments);
      setComments(chapComments); // Geriye dönük uyumluluk için, tartışma kısmında chapter comments görünür

      const counts: Record<number, number> = {};
      const groupedPar: Record<number, Comment[]> = {};

      rawParComments.forEach(c => {
        let targetIndex = c.paragraphIndex;
        let isOutdated = Boolean(c.isOutdated);

        // 1. Blok ID eşleştirmesi: Eğer yorumda blockId varsa, o bloğun güncel index'ini bul
        if (c.blockId && chap?.contentBlocks) {
          const foundBlockIdx = chap.contentBlocks.findIndex(b => b.id === c.blockId);
          if (foundBlockIdx !== -1) {
            targetIndex = foundBlockIdx;
            // Eğer bloğun metni değiştiyse ve targetSnippet ile uyuşmuyorsa, eski sürüme ait olarak işaretle
            const currentBlockText = (chap.contentBlocks[foundBlockIdx].text || '').replace(/<[^>]+>/g, '').trim();
            if (c.targetSnippet && !currentBlockText.startsWith(c.targetSnippet.slice(0, 30))) {
              isOutdated = true;
            }
          } else {
            // Blok yazar tarafından tamamen silinmiş!
            isOutdated = true;
          }
        } else if (chap?.isRevised && chap?.revisedAt && c.createdAt) {
          // Legacy yorumlar için: Bölüm revizyon tarihinden önce atılmışsa
          const commentTime = (c.createdAt as any).seconds ? (c.createdAt as any).seconds * 1000 : new Date(c.createdAt as any).getTime();
          const revisedTime = (chap.revisedAt as any).seconds ? (chap.revisedAt as any).seconds * 1000 : new Date(chap.revisedAt as any).getTime();
          if (commentTime < revisedTime) {
            isOutdated = true;
          }
        }

        const processedComment: Comment = {
          ...c,
          paragraphIndex: targetIndex,
          isOutdated
        };

        counts[targetIndex] = (counts[targetIndex] || 0) + 1;
        if (!groupedPar[targetIndex]) groupedPar[targetIndex] = [];
        groupedPar[targetIndex].push(processedComment);
      });

      setParagraphCommentCounts(counts);
      setParagraphComments(groupedPar);

      setLoading(false);
    };
    if (storyId && chapterId && isInitialized) {
      loadData();
    }
  }, [storyId, chapterId, firebaseUser, isInitialized, router]);

  // Sayfa başlığını tarayıcı sekmesinde dinamik olarak güncelle
  useEffect(() => {
    if (chapter?.title && story?.title) {
      document.title = `${chapter.title} - ${story.title} | Readixon`;
    }
  }, [chapter?.title, story?.title]);

  // Okuma sayfasındayken genel site temasından tamamen izole ol: Sadece seçili okuyucu temasını yansıt
  useEffect(() => {
    const config = readerThemeStyles[theme] || readerThemeStyles.light;
    const prevDataTheme = document.documentElement.getAttribute('data-theme');
    const wasDark = document.documentElement.classList.contains('dark');

    document.documentElement.classList.toggle('dark', config.isDark);
    document.documentElement.setAttribute('data-theme', config.isDark ? 'dark' : 'light');

    document.documentElement.style.setProperty('--color-background', config.bg);
    document.documentElement.style.setProperty('--color-card', config.card);
    document.documentElement.style.setProperty('--color-text', config.text);
    document.documentElement.style.setProperty('--color-muted', config.muted);
    document.documentElement.style.setProperty('--color-border', config.border);

    return () => {
      // Sayfadan çıkıldığında orijinal site temasını geri yükle
      if (prevDataTheme) {
        document.documentElement.setAttribute('data-theme', prevDataTheme);
      }
      document.documentElement.classList.toggle('dark', wasDark);
      document.documentElement.style.removeProperty('--color-background');
      document.documentElement.style.removeProperty('--color-card');
      document.documentElement.style.removeProperty('--color-text');
      document.documentElement.style.removeProperty('--color-muted');
      document.documentElement.style.removeProperty('--color-border');
    };
  }, [theme]);

  const handleToggleLike = async () => {
    if (!firebaseUser) {
      toast.info("Beğenmek için giriş yapmalısınız.");
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
        replyingToParagraphComment?.commentId,
        selectedBlockId,
        selectedParagraphSnippet
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

  const openParagraphComments = (index: number, text: string, blockId?: string) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    let displayText = cleanText;
    if (displayText.length > 100) {
      displayText = '...' + displayText.substring(displayText.length - 100);
    }

    setSelectedParagraphIndex(index);
    setSelectedParagraphText(displayText);
    setSelectedBlockId(blockId);
    setSelectedParagraphSnippet(cleanText.slice(0, 60));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      setScrollProgress(Math.min(100, Math.max(0, Math.round(scrollPercent * 100))));

      // Zen / Odak Modu: Aşağı kaydırınca üst bar yumuşakça gizlenir, yukarı kaydırınca belirir
      if (scrollTop > lastScrollY.current + 8 && scrollTop > 90) {
        setIsNavbarVisible(false);
      } else if (scrollTop < lastScrollY.current - 8 || scrollTop <= 90) {
        setIsNavbarVisible(true);
      }
      lastScrollY.current = scrollTop;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync reading progress to Firestore
  useEffect(() => {
    if (!firebaseUser || loading || !chapter) return;

    const timeoutId = setTimeout(() => {
      const isCompleted = scrollProgress > 90 || Boolean(chapter.isEnding);
      syncReadingProgress(
        firebaseUser.uid,
        storyId,
        chapterId,
        scrollProgress,
        isCompleted,
        story?.format === 'interactive'
          ? {
              pathHistoryStep: chapterId,
              discoveredEndingId: chapter.isEnding ? chapterId : undefined
            }
          : undefined
      );
    }, 2000); // 2 saniye debounce

    return () => clearTimeout(timeoutId);
  }, [scrollProgress, firebaseUser, loading, chapterId, storyId, chapter, story?.format]);

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
        <Button variant="primary" onPress={() => {
          if (story) {
            const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
            router.replace(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
          } else {
            router.replace('/feed');
          }
        }} className="mt-4">Geri Dön</Button>
      </div>
    );
  }

  // Find next and prev chapters
  const currentIndex = chapters.findIndex(c => c.chapterId === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Theme Styles
  const currentThemeStyle = readerThemeStyles[theme] || readerThemeStyles.dark;

  // Ekrana tek dokunuşla barları gizle / göster (Zen Modu)
  const handleReaderTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [role="button"], .no-zen-toggle')) {
      return;
    }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
      return;
    }
    setIsNavbarVisible(prev => !prev);
  };

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
          (comment.authorName ? comment.authorName.substring(0, 2) : comment.userId.substring(0, 2)).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-bold" style={{ color: currentThemeStyle.text }}>{comment.authorName || `Kullanıcı ${comment.userId.substring(0, 6)}`}</span>
          <span className="text-sm opacity-50" style={{ color: currentThemeStyle.text }}>
            {new Date(comment.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('tr-TR')}
          </span>
          {comment.isOutdated && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 font-semibold flex items-center gap-1"
              title="Bu yorum satır/bölüm düzenlenmeden önce yapılmıştır."
            >
              <PencilLine size={10} />
              Önceki sürüme ait
            </span>
          )}
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
      className="min-h-screen transition-colors duration-300 overflow-x-hidden w-full max-w-full relative"
      style={{
        backgroundColor: currentThemeStyle.bg,
        color: currentThemeStyle.text,
        ['--color-background' as any]: currentThemeStyle.bg,
        ['--color-card' as any]: currentThemeStyle.card,
        ['--color-text' as any]: currentThemeStyle.text,
        ['--color-muted' as any]: currentThemeStyle.muted,
        ['--color-border' as any]: currentThemeStyle.border,
      }}
    >
      {/* ── 1. Üst Bar (Top Navbar - Sabit, Çentik & Safe Area Uyumlu, Ergonomik Butonlar) ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          backgroundColor: currentThemeStyle.navBg,
          borderColor: currentThemeStyle.border
        }}
      >
        <div className="flex items-center justify-between px-3.5 sm:px-5 pt-[calc(0.85rem+env(safe-area-inset-top,0px))] pb-3.5 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                if (story) {
                  const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                  router.replace(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                } else {
                  router.back();
                }
              }}
              className="w-11 h-11 rounded-2xl bg-muted/15 hover:bg-muted/25 active:scale-90 flex items-center justify-center shrink-0 transition-all border border-border/40 shadow-sm"
              style={{ color: currentThemeStyle.text }}
              aria-label="Geri"
            >
              <ArrowLeft size={24} />
            </button>

            {/* Kayan Bölüm Başlığı (Marquee) */}
            <ChapterTitleMarquee
              title={chapter.title}
              storyTitle={story?.title}
              textColor={currentThemeStyle.text}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {chapter.audioTrack?.url && (
              <ChapterMusicPlayer
                audioTrack={chapter.audioTrack}
                textColor={currentThemeStyle.text}
                autoPlay={true}
              />
            )}
            {story?.universeId && (
              <button
                type="button"
                onClick={() => {
                  setDrawerInitialTab('characters');
                  setDrawerInitialSearch('');
                  setShowUniverseDrawer(true);
                }}
                className="h-11 px-3 sm:px-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 active:scale-95 flex items-center gap-1.5 transition-all shadow-sm group"
                title={story.universeTitle ? `${story.universeTitle} Rehberi` : 'Evren Rehberi'}
                aria-label="Evren Rehberi"
              >
                <Globe size={18} className="transition-transform group-hover:rotate-45" />
                <span className="hidden sm:inline text-xs font-bold tracking-wide">Evren</span>
                {chapterMentionedEntities.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse ml-0.5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowChapterList(true)}
              className="w-11 h-11 rounded-2xl bg-muted/15 hover:bg-muted/25 active:scale-90 flex items-center justify-center transition-all border border-border/40 shadow-sm"
              style={{ color: currentThemeStyle.text }}
              title="Bölümler Listesi"
              aria-label="Bölümler"
            >
              <List size={23} />
            </button>
            {story?.format !== 'webtoon' && (
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="w-11 h-11 rounded-2xl bg-muted/15 hover:bg-muted/25 active:scale-90 flex items-center justify-center transition-all border border-border/40 shadow-sm"
                style={{ color: currentThemeStyle.text }}
                title="Okuma Tercihleri"
                aria-label="Ayarlar"
              >
                <Settings size={23} />
              </button>
            )}
          </div>
        </div>

        {/* ── Okuma İlerleme Çizgisi (Navbar açıkken navbarın tam altında) ── */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-border/20 pointer-events-none">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* ── Okuma İlerleme Çizgisi (Navbar gizliyken ekranın en tepesinde ince çizgi) ── */}
      <div
        className={`fixed top-0 left-0 right-0 h-[3px] bg-border/20 z-30 pointer-events-none transition-opacity duration-200 ${
          isNavbarVisible ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── 2. Ana Metin Alanı (Main Content - Zen Modu Tap Listener & Dinamik Kenar Boşluğu) ── */}
      <main
        onClick={handleReaderTap}
        className={`${
          story?.format === 'webtoon'
            ? 'max-w-3xl w-full px-0 pt-[calc(4.5rem+env(safe-area-inset-top,0px))]'
            : `max-w-2xl ${
                paddingX === 'compact' ? 'px-3 sm:px-4' : paddingX === 'wide' ? 'px-6 sm:px-10' : 'px-4 sm:px-6'
              } pt-[calc(6rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] pb-32`
        } mx-auto relative cursor-pointer`}
      >
        {/* Daha önce okumuş kullanıcılara özel güncelleme bildirimi banner'ı */}
        {showRevisionNoticeBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 no-zen-toggle cursor-auto">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-500">
                  Bu bölüm son okumanızdan sonra güncellendi
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Yazar kurguda bazı yenilikler yaptı. İsterseniz bölüme yeniden göz atabilir veya aşağıdaki yazar revizyon notunu inceleyebilirsiniz.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRevisionNoticeBanner(false)}
              className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
              title="Kapat"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Bölüm Başlığı & Okuma Süresi Rozeti (Webtoon olmayan romanlar için) */}
        {story?.format !== 'webtoon' && (
          <div className="mb-8 pb-6 border-b border-border/15 no-zen-toggle cursor-auto">
            <div className="flex items-center gap-2 text-xs font-medium opacity-60 mb-2.5 flex-wrap" style={{ color: currentThemeStyle.text }}>
              {story?.title && (
                <>
                  <span className="font-semibold">{story.title}</span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Clock size={13} /> ~{readingTimeMinutes} dk okuma
              </span>
              <span>•</span>
              <span>{wordCount.toLocaleString()} kelime</span>
            </div>
            <Typography
              variant="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
              style={{ color: currentThemeStyle.text }}
            >
              {chapter.title}
            </Typography>

            {/* Revizyon Rozeti ve Notu */}
            {chapter.isRevised && (
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionDetails(prev => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Yazar bu bölümde düzenleme yaptı. Detayları görmek için tıklayın."
                >
                  <PencilLine size={13} />
                  <span>Yazar Tarafından Düzenlendi</span>
                  {chapter.revisedAt && (
                    <span className="opacity-75 font-normal">
                      • {new Date((chapter.revisedAt as any).seconds ? (chapter.revisedAt as any).seconds * 1000 : chapter.revisedAt as any).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showRevisionDetails ? 'rotate-180' : ''}`} />
                </button>

                {showRevisionDetails && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-foreground/90 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="font-bold flex items-center gap-1.5 text-amber-500">
                      <Sparkles size={13} />
                      <span>Yazarın Revizyon Notu</span>
                    </div>
                    <p className="leading-relaxed opacity-90">
                      {chapter.revisionNote || 'Yazar bu bölümün kurgusunda ve diyaloglarında okuma deneyimini güçlendiren güncellemeler yapmıştır.'}
                    </p>
                  </div>
                )}
              </div>
            )}
            {story?.universeId && (
              <div className="mt-3 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerInitialTab('characters');
                    setDrawerInitialSearch('');
                    setShowUniverseDrawer(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Globe size={13} />
                  <span>{story.universeTitle ? `${story.universeTitle} Rehberi` : 'Kurgusal Evren Rehberi'}</span>
                  <span className="text-[10px] bg-indigo-500/25 px-1.5 py-0.5 rounded-md font-bold ml-0.5">İncele</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="cursor-auto">
          <ContentRenderer
            blocks={chapter.contentBlocks}
            isWebtoon={story?.format === 'webtoon'}
            fontSize={fontSize}
            fontFamily={fontFamily}
            lineHeight={lineHeight}
            textAlign={textAlign}
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
            inlineEntities={universeEntities}
            enableLoreAnnotations={enableLoreAnnotations}
            onEntityClick={(ent, rect) => {
              setActivePopoverEntity(ent);
              setPopoverAnchorRect(rect);
            }}
          />
        </div>

        {/* Bölüm Sonu Evren Özeti (PRD Bölüm 40.4) */}
        {story?.universeId && (chapterMentionedEntities.length > 0 || universePlotThreads.length > 0) && (
          <ChapterUniverseRecap
            universeTitle={story.universeTitle}
            entities={chapterMentionedEntities}
            plotThreads={universePlotThreads}
            currentChapterOrder={chapter?.order || 1}
            onSelectEntity={(ent, rect) => {
              setActivePopoverEntity(ent);
              setPopoverAnchorRect(rect);
            }}
            onOpenDrawer={(tab, search) => {
              setDrawerInitialTab(tab);
              setDrawerInitialSearch(search || '');
              setShowUniverseDrawer(true);
            }}
          />
        )}

        {/* Bölüm Sonu Aktivitesi */}
        {chapter.endActivity && (
          <div className="no-zen-toggle cursor-auto">
            <ChapterEndActivity
              activity={chapter.endActivity}
              storyId={storyId}
              chapterId={chapterId}
              authorId={story?.authorId || ''}
              userId={firebaseUser?.uid}
              textColor={currentThemeStyle.text}
            />
          </div>
        )}

        {/* Maskot Tepkileri */}
        <div className="no-zen-toggle cursor-auto">
          <ChapterReactions
            storyId={storyId}
            chapterId={chapterId}
            initialCounts={chapter.reactionCounts || {}}
          />
        </div>

        {/* ── İnteraktif Hikaye Karar veya Final Alanı ── */}
        {story?.format === 'interactive' && (
          <div id="interactive-choices-section" className="my-10 no-zen-toggle cursor-auto">
            {chapter.isEnding ? (
              /* 🏁 Final / Son Ekranı */
              <div className={`relative rounded-3xl p-6 sm:p-10 border overflow-hidden shadow-2xl bg-gradient-to-b text-center transition-all animate-fade-in ${
                chapter.endingType === 'good'
                  ? 'from-emerald-950/40 via-card to-card border-emerald-500/40 shadow-emerald-500/10'
                  : chapter.endingType === 'bad'
                    ? 'from-rose-950/40 via-card to-card border-rose-500/40 shadow-rose-500/10'
                    : chapter.endingType === 'secret'
                      ? 'from-purple-950/40 via-card to-card border-purple-500/40 shadow-purple-500/10'
                      : 'from-blue-950/40 via-card to-card border-blue-500/40 shadow-blue-500/10'
              }`}>
                {/* Glow ambient background effect */}
                <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25 ${
                  chapter.endingType === 'good'
                    ? 'bg-emerald-500'
                    : chapter.endingType === 'bad'
                      ? 'bg-rose-500'
                      : chapter.endingType === 'secret'
                        ? 'bg-purple-500'
                        : 'bg-blue-500'
                }`} />

                {/* Ending Pill */}
                <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border shadow-sm">
                  {chapter.endingType === 'good' && (
                    <span className="text-emerald-400 border-emerald-500/30 bg-emerald-500/15 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <Trophy size={14} /> Zafer / Mutlu Son
                    </span>
                  )}
                  {chapter.endingType === 'bad' && (
                    <span className="text-rose-400 border-rose-500/30 bg-rose-500/15 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <Skull size={14} /> Trajik / Kötü Son
                    </span>
                  )}
                  {chapter.endingType === 'secret' && (
                    <span className="text-purple-400 border-purple-500/30 bg-purple-500/15 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <Sparkles size={14} /> Gizli / Alternatif Son
                    </span>
                  )}
                  {(!chapter.endingType || chapter.endingType === 'neutral') && (
                    <span className="text-blue-400 border-blue-500/30 bg-blue-500/15 flex items-center gap-1.5 px-3 py-1 rounded-full">
                      <Compass size={14} /> Nötr / Belirsiz Son
                    </span>
                  )}
                </div>

                {/* Ending Title */}
                <h3 className="relative text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">
                  {chapter.endingTitle || 'Kaderine Ulaştın'}
                </h3>
                <p className="relative text-sm text-muted max-w-lg mx-auto mb-6 leading-relaxed">
                  Yaptığın seçimler seni bu noktaya getirdi. Hikayenin bu kolunu tamamladın ve son profilinde kaydedildi.
                </p>

                {/* Stats Row */}
                <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/15 border border-border/30 text-xs font-semibold text-foreground">
                    <Trophy size={14} className="text-amber-400" />
                    <span>Keşfedilen Son: {readingProgressData?.discoveredEndings?.length || 1} / {story.stats?.endingCount || 1}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/15 border border-border/30 text-xs font-semibold text-foreground">
                    <GitFork size={14} className="text-indigo-400" />
                    <span>{readingProgressData?.pathHistory?.length || 1} Karar Adımı</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRewind}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Undo2 size={16} />
                    <span>Son Karara Geri Dön (Rewind)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestartAdventure}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-muted/20 hover:bg-muted/30 border border-border/50 text-foreground font-semibold text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw size={15} />
                    <span>Baştan Başla</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                      router.push(`/story/${slug}`);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-black font-extrabold text-sm shadow-lg shadow-primary/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Award size={16} />
                    <span>Kitap Sayfası & Değerlendir</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 🔀 Karar Noktası / Dallanma Kartları */
              <div className="rounded-3xl p-5 sm:p-8 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 via-card to-card shadow-xl shadow-indigo-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Gamepad2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                      Kaderini Belirle
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                        Bandersnatch
                      </span>
                    </h3>
                    <p className="text-xs text-muted">
                      Hikaye burada kollara ayrılıyor. Bir sonraki adımını dikkatli seç!
                    </p>
                  </div>
                </div>

                {chapter.choices && chapter.choices.length > 0 ? (
                  <div className="space-y-3 mt-5">
                    {chapter.choices.map((choice, idx) => (
                      <button
                        key={choice.id || idx}
                        type="button"
                        onClick={() => handleSelectChoice(choice)}
                        className="w-full group p-4 sm:p-5 rounded-2xl border border-indigo-500/30 hover:border-indigo-400 bg-card/60 hover:bg-indigo-950/30 transition-all duration-200 text-left flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-black text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 transition-colors">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            {choice.badge && (
                              <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                                {choice.badge}
                              </span>
                            )}
                            <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {choice.text}
                            </h4>
                            {choice.description && (
                              <p className="text-xs text-muted mt-0.5 line-clamp-1">
                                {choice.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-muted/15 group-hover:bg-primary group-hover:text-black text-muted flex items-center justify-center shrink-0 transition-all group-hover:translate-x-1">
                          <ChevronRight size={18} />
                        </div>
                      </button>
                    ))}

                    {(readingProgressData?.pathHistory?.length || 0) > 1 && (
                      <div className="pt-3 text-center">
                        <button
                          type="button"
                          onClick={handleRewind}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-indigo-400 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-indigo-500/10"
                        >
                          <Undo2 size={13} />
                          <span>Kararından pişman mısın? Son Karara Geri Dön</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-border/40 rounded-2xl bg-muted/5 mt-4">
                    <p className="text-sm font-semibold text-foreground mb-1">Hikaye henüz bu kolda devam etmiyor.</p>
                    <p className="text-xs text-muted mb-4">Yazar bu dal için henüz yeni bir bölüm eklememiş.</p>
                    <button
                      type="button"
                      onClick={handleRewind}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-500 transition-all"
                    >
                      <Undo2 size={14} />
                      <span>Önceki Karara Geri Dön</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bölüm Beğeni ve Tartışma Alanı */}
        <div className="mt-12 pt-8 border-t border-border/20 no-zen-toggle cursor-auto">
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

          {/* Navigation Buttons (Sayfa İçi - Sadece Standart Roman ise) */}
          {story?.format !== 'interactive' && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 my-12 pt-8 border-t border-border/20">
              {prevChapter ? (
                <Button
                  variant="outline"
                  onPress={() => handleNavigateChapter(prevChapter.chapterId)}
                  className="w-full sm:flex-1 flex flex-row justify-center items-center gap-2 py-3"
                >
                  <ChevronLeft size={18} />
                  Önceki Bölüm
                </Button>
              ) : <div className="hidden sm:block flex-1" />}

              {nextChapter ? (
                <Button
                  variant="primary"
                  onPress={() => handleNavigateChapter(nextChapter.chapterId)}
                  className="w-full sm:flex-1 flex flex-row justify-center items-center gap-2 py-3 shadow-lg shadow-primary/25"
                >
                  Sonraki Bölüm
                  <ChevronRight size={18} />
                </Button>
              ) : nextSeriesBook ? (
                <Button
                  variant="primary"
                  onPress={() => {
                    const slug = (nextSeriesBook.story as any).slug || generateStorySlug(nextSeriesBook.story.title, nextSeriesBook.story.storyId);
                    router.push(nextSeriesBook.story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                  }}
                  className="w-full sm:flex-1 flex flex-row justify-center items-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-lg shadow-amber-500/25"
                >
                  <span>Serinin {nextSeriesBook.order}. Kitabına Geç</span>
                  <ChevronRight size={18} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onPress={() => {
                    if (story) {
                      const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                      router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                    } else {
                      router.push('/feed');
                    }
                  }}
                  className="w-full sm:flex-1 flex flex-row justify-center items-center gap-2 py-3 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30"
                >
                  <Award size={18} />
                  Kitabı Tamamladın! Değerlendir
                </Button>
              )}
            </div>
          )}

          {/* Serinin Sonraki Kitabına Devam Kartı */}
          {!nextChapter && nextSeriesBook && (
            <div className="mb-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/15 via-card/80 to-card border border-amber-500/30 text-left relative overflow-hidden shadow-xl animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 sm:w-24 aspect-[2/3] rounded-xl bg-background border border-amber-500/30 overflow-hidden shrink-0 shadow-lg relative">
                  {nextSeriesBook.story.coverImage ? (
                    <img src={nextSeriesBook.story.coverImage} alt={nextSeriesBook.story.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500">
                      <BookOpen size={24} />
                    </div>
                  )}
                  <span className="absolute top-1 left-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    #{nextSeriesBook.order}
                  </span>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-extrabold uppercase mb-1.5 border border-amber-500/20">
                    <Sparkles size={12} />
                    <span>Seri Devam Ediyor: {series?.title || 'Kitap Serisi'}</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-foreground mb-1 line-clamp-1">
                    {nextSeriesBook.story.title}
                  </h4>
                  <p className="text-xs text-muted mb-4 line-clamp-2">
                    {nextSeriesBook.story.summary || 'Bu kitap serinin bir sonraki cildidir. Maceraya ara vermeden hemen devam edin!'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Button
                      variant="primary"
                      onPress={() => {
                        const slug = (nextSeriesBook.story as any).slug || generateStorySlug(nextSeriesBook.story.title, nextSeriesBook.story.storyId);
                        router.push(nextSeriesBook.story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/25 flex items-center gap-2 rounded-xl text-xs sm:text-sm"
                    >
                      <span>Sıradaki Kitaba Başla</span>
                      <ChevronRight size={16} />
                    </Button>
                    {series && (
                      <Button
                        variant="outline"
                        onPress={() => {
                          const sSlug = series.slug || generateSeriesSlug(series.title, series.seriesId);
                          router.push(`/series/${sSlug}`);
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold"
                      >
                        Seri Sayfasına Bak
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Son Bölüm Sonu Tebrik ve Yönlendirme Kartı */}
          {!nextChapter && (
            <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/15 via-card/50 to-card border border-primary/30 text-center relative overflow-hidden shadow-xl animate-fade-in">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: currentThemeStyle.text }}>
                Tebrikler, Bu Kitabı Bitirdiniz!
              </h3>
              <p className="text-sm opacity-70 max-w-md mx-auto mb-6" style={{ color: currentThemeStyle.text }}>
                Tüm bölümleri tamamladınız. Yazarımıza destek olmak için kitabın ana sayfasından bir inceleme yazabilir veya puan verebilirsiniz.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onPress={() => {
                    if (story) {
                      const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                      router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}#reviews`);
                    }
                  }}
                  className="px-6 py-2.5 shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                  <Star size={16} className="fill-current" /> Kitabı Değerlendir
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    if (story) {
                      const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                      router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                    }
                  }}
                  className="px-6 py-2.5"
                >
                  Kitap Detayına Dön
                </Button>
              </div>
            </div>
          )}

          {/* Bölüm Yorumları (Hedef Anchor id'si) */}
          <div id="chapter-comments-section" className="mb-12 scroll-mt-24">
            <Typography variant="h3" className="mb-6 flex items-center gap-2" style={{ color: currentThemeStyle.text }}>
              <MessageSquare size={20} /> Bölüm Yorumları ({comments.length})
            </Typography>

            <div className="mb-8">
              {replyingToComment && (
                <div className="flex items-center justify-between text-xs opacity-70 px-2 mb-2" style={{ color: currentThemeStyle.text }}>
                  <span><strong>{replyingToComment.authorName || 'Kullanıcı'}</strong>&apos;na yanıt veriliyor...</span>
                  <button onClick={() => setReplyingToComment(null)} className="hover:underline font-semibold">İptal</button>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingToComment ? "Yanıtınızı yazın..." : "Bölüm hakkındaki düşüncelerini paylaş..."}
                className="w-full bg-black/5 border border-border/20 rounded-2xl p-4 focus:outline-none focus:border-primary resize-y min-h-[100px]"
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

      {/* ── 3. Hızlı Okuma Alt Çubuğu (Quick Bottom Dock - Tek Elle Gezinti, Geniş Dokunmatik Hedefler) ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-20 border-t transition-transform duration-300 backdrop-blur-md select-none ${
          isNavbarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: currentThemeStyle.navBg,
          borderColor: currentThemeStyle.border
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {/* Bölüm İçi Hızlı Kaydırıcı (Scrubber Slider - Kalın, Kolay Tutulur) */}
          <div className="flex items-center gap-3.5">
            <span className="text-xs font-mono font-bold opacity-80 shrink-0 min-w-[36px]" style={{ color: currentThemeStyle.text }}>
              %{scrollProgress}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={scrollProgress}
              onChange={(e) => {
                const targetPercent = Number(e.target.value);
                setScrollProgress(targetPercent);
                const docHeight = document.body.scrollHeight;
                const winHeight = window.innerHeight;
                const targetScrollY = (targetPercent / 100) * (docHeight - winHeight);
                window.scrollTo({ top: targetScrollY, behavior: 'auto' });
              }}
              className="flex-1 h-2.5 bg-muted/30 rounded-lg appearance-none cursor-pointer accent-primary shadow-inner"
            />
            <span className="text-xs font-semibold opacity-80 shrink-0" style={{ color: currentThemeStyle.text }}>
              ~{readingTimeMinutes} dk
            </span>
          </div>

          {/* Alt Hızlı Eylemler (Daha Büyük & Dolgun Butonlar) */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              disabled={!prevChapter}
              onClick={() => prevChapter && handleNavigateChapter(prevChapter.chapterId)}
              className="h-11 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 disabled:opacity-25 disabled:pointer-events-none bg-muted/15 hover:bg-muted/25 border border-border/40 active:scale-95 transition-all shadow-sm shrink-0"
              style={{ color: currentThemeStyle.text }}
            >
              <ChevronLeft size={20} />
              <span className="hidden xs:inline">Önceki</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChapterList(true)}
                className="w-11 h-11 rounded-2xl bg-muted/15 hover:bg-muted/25 border border-border/40 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                style={{ color: currentThemeStyle.text }}
                title="Bölümler Listesi"
                aria-label="Bölümler Listesi"
              >
                <List size={22} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const section = document.getElementById('chapter-comments-section');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="h-11 px-3.5 rounded-2xl bg-muted/15 hover:bg-muted/25 border border-border/40 flex items-center gap-1.5 text-xs sm:text-sm font-bold active:scale-90 transition-all shadow-sm"
                style={{ color: currentThemeStyle.text }}
                title="Bölüm Yorumları"
                aria-label="Bölüm Yorumları"
              >
                <MessageSquare size={19} />
                <span>{comments.length + Object.values(paragraphComments).flat().length}</span>
              </button>

              {story?.format !== 'webtoon' && (
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="w-11 h-11 rounded-2xl bg-muted/15 hover:bg-muted/25 border border-border/40 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                  style={{ color: currentThemeStyle.text }}
                  title="Okuma Tercihleri"
                  aria-label="Okuma Tercihleri"
                >
                  <span className="font-serif font-black text-base">Aa</span>
                </button>
              )}
            </div>

            {story?.format === 'interactive' ? (
              chapter.isEnding ? (
                <button
                  type="button"
                  onClick={handleRewind}
                  className="h-11 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/25 shrink-0"
                  title="Son Karara Geri Dön"
                >
                  <Undo2 size={16} />
                  <span className="hidden xs:inline">Geri Dön</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('interactive-choices-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-11 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/30 shrink-0"
                >
                  <GitFork size={16} />
                  <span>Seçim Yap</span>
                </button>
              )
            ) : nextChapter ? (
              <button
                type="button"
                onClick={() => handleNavigateChapter(nextChapter.chapterId)}
                className="h-11 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-primary text-black hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 shrink-0"
              >
                <span className="hidden xs:inline">Sonraki</span>
                <ChevronRight size={20} />
              </button>
            ) : nextSeriesBook ? (
              <button
                type="button"
                onClick={() => {
                  const slug = (nextSeriesBook.story as any).slug || generateStorySlug(nextSeriesBook.story.title, nextSeriesBook.story.storyId);
                  router.push(nextSeriesBook.story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                }}
                className="h-11 px-3 sm:px-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/25 shrink-0"
                title={`Serinin ${nextSeriesBook.order}. Kitabına Geç: ${nextSeriesBook.story.title}`}
              >
                <span>Kitap #{nextSeriesBook.order}</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-11 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 opacity-25 pointer-events-none bg-primary text-black shrink-0"
              >
                <span className="hidden xs:inline">Sonraki</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Okuma Tercihleri Paneli (Modern Bottom Sheet) ── */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={e => e.stopPropagation()}
          >
            <ReadingSettingsPanel
              theme={theme}
              fontSize={fontSize}
              fontFamily={fontFamily}
              lineHeight={lineHeight}
              textAlign={textAlign}
              paddingX={paddingX}
              onThemeChange={setTheme}
              onFontSizeChange={setFontSize}
              onFontFamilyChange={setFontFamily}
              onLineHeightChange={setLineHeight}
              onTextAlignChange={setTextAlign}
              onPaddingXChange={setPaddingX}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}

      {/* ── 5. Bölüm Listesi (Responsive Bottom Sheet / Drawer) ── */}
      {showChapterList && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowChapterList(false)}
        >
          <div
            className="w-full sm:max-w-xs h-[75vh] sm:h-full bg-card rounded-t-3xl sm:rounded-none overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: currentThemeStyle.bg, color: currentThemeStyle.text }}
          >
            <div className="w-12 h-1 rounded-full bg-muted/40 mx-auto mt-3 sm:hidden" />
            <div className="p-4 sm:p-6 flex items-center justify-between border-b border-border/10">
              <Typography variant="h3" style={{ color: currentThemeStyle.text }}>Bölümler ({chapters.length})</Typography>
              <Button variant="ghost" onPress={() => setShowChapterList(false)} className="p-2 rounded-full">
                <X size={22} color={currentThemeStyle.text} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              {chapters.map((chap) => {
                const isActive = chap.chapterId === chapterId;
                return (
                  <div
                    key={chap.chapterId}
                    onClick={() => {
                      setShowChapterList(false);
                      handleNavigateChapter(chap.chapterId);
                    }}
                    className={`p-4 border-b border-border/5 cursor-pointer hover:bg-black/5 active:scale-[0.99] transition-all flex justify-between items-center gap-3 ${isActive ? 'bg-primary/10' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <Typography variant="body" className={`break-words text-sm sm:text-base ${isActive ? 'font-bold text-primary' : ''}`} style={{ color: isActive ? '' : currentThemeStyle.text }}>
                        {chap.title}
                      </Typography>
                    </div>
                    {isActive && <CheckCircle size={16} className="text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Satır Arası Yorumlar (Responsive Bottom Sheet / Drawer) ── */}
      {selectedParagraphIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedParagraphIndex(null)}
        >
          <div
            className="w-full sm:max-w-md h-[82vh] sm:h-full bg-card rounded-t-3xl sm:rounded-none overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: currentThemeStyle.bg, color: currentThemeStyle.text }}
          >
            <div className="w-12 h-1 rounded-full bg-muted/40 mx-auto mt-3 sm:hidden" />
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border/10">
              <div className="min-w-0 flex-1 pr-2">
                <Typography variant="h3" className="text-base sm:text-lg font-bold" style={{ color: currentThemeStyle.text }}>
                  Satır Arası Yorumlar
                </Typography>
                {selectedParagraphText && (
                  <p className="text-[11px] opacity-60 truncate italic mt-0.5" style={{ color: currentThemeStyle.text }}>
                    &ldquo;{selectedParagraphText}&rdquo;
                  </p>
                )}
              </div>
              <Button variant="ghost" onPress={() => setSelectedParagraphIndex(null)} className="p-1.5 rounded-full shrink-0">
                <X size={20} color={currentThemeStyle.text} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {(() => {
                const parComments = paragraphComments[selectedParagraphIndex] || [];
                if (parComments.length === 0) {
                  return (
                    <div className="text-center py-10 opacity-50 space-y-2">
                      <MessageSquare size={36} className="mx-auto opacity-50" />
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

            <div
              className="p-3 sm:p-4 border-t border-border/10 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shrink-0"
              style={{ backgroundColor: `${currentThemeStyle.bg}` }}
            >
              {replyingToParagraphComment && (
                <div className="flex items-center justify-between text-xs opacity-70 px-1 mb-1.5" style={{ color: currentThemeStyle.text }}>
                  <span><strong>{replyingToParagraphComment.authorName || 'Kullanıcı'}</strong>&apos;na yanıt veriliyor...</span>
                  <button onClick={() => setReplyingToParagraphComment(null)} className="hover:underline font-semibold">İptal</button>
                </div>
              )}
              <textarea
                value={paragraphCommentText}
                onChange={(e) => setParagraphCommentText(e.target.value)}
                placeholder={replyingToParagraphComment ? "Yanıtınızı yazın..." : "Bu satır hakkındaki düşünceniz..."}
                className="w-full bg-black/5 border border-border/20 rounded-2xl p-3 text-sm focus:outline-none focus:border-primary resize-none min-h-[70px]"
                style={{ color: currentThemeStyle.text }}
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="primary"
                  onPress={handleParagraphCommentSubmit}
                  disabled={submittingParagraphComment || !paragraphCommentText.trim()}
                  className="py-2 px-5 text-xs font-bold rounded-xl shadow-md"
                >
                  {submittingParagraphComment ? 'Gönderiliyor...' : (replyingToParagraphComment ? 'Yanıtla' : 'Yorum Yap')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Evren Rehberi Drawer ── */}
      {showUniverseDrawer && story?.universeId && (
        <ReaderUniverseDrawer
          universeId={story.universeId}
          universeTitle={story.universeTitle}
          currentChapterOrder={chapter?.order || 1}
          initialTab={drawerInitialTab}
          initialSearch={drawerInitialSearch}
          onClose={() => setShowUniverseDrawer(false)}
        />
      )}

      {/* ── İnteraktif Akıllı Lore Popover Mini Kartı (PRD 40.1, 40.2, 40.3) ── */}
      {activePopoverEntity && (
        <InlineLorePopover
          entity={activePopoverEntity}
          anchorRect={popoverAnchorRect}
          currentChapterOrder={chapter?.order || 1}
          onClose={() => setActivePopoverEntity(null)}
          onOpenInUniverseDrawer={(tab, search) => {
            setActivePopoverEntity(null);
            setDrawerInitialTab(tab);
            setDrawerInitialSearch(search);
            setShowUniverseDrawer(true);
          }}
        />
      )}
    </div>
  );
}
