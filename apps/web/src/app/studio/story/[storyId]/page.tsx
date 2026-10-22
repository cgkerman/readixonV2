'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { 
  ArrowLeft, 
  PlusCircle, 
  Save, 
  CheckCircle, 
  Wand2, 
  Info, 
  MessageSquare, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Music,
  BookOpen,
  Settings,
  Eye,
  Heart,
  Layers,
  Sparkles,
  Trash2,
  Play,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  Film,
  Pencil,
  Feather,
  Check
} from 'lucide-react';
import {
  getStoryById,
  updateStory,
  createChapter,
  deleteChapter,
  fetchChapters,
  syncStoryChapterCount,
  getSeriesByAuthorId,
  getUniversesByAuthorId,
  addStoryToSeries,
  removeStoryFromSeries,
  linkStoryToUniverse,
  unlinkStoryFromUniverse,
  type Story,
  type StoryHighlight,
  type Chapter,
  type StoryStatus,
  type Contributor,
  type Series,
  type Universe,
  compressImage
} from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { StoryHighlightsModal } from '@/components/story/StoryHighlightsModal';
import { GenreSelector } from '@/components/story/GenreSelector';
import { toast } from "sonner";

export default function StoryDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isInitialLoad = React.useRef(true);

  // Tab & UI state
  const [activeTab, setActiveTab] = useState<'chapters' | 'details' | 'highlights'>('chapters');
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [mainGenre, setMainGenre] = useState<string | undefined>(undefined);
  const [subGenres, setSubGenres] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<StoryStatus>('draft');
  const [foreword, setForeword] = useState('');
  const [backCover, setBackCover] = useState('');
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [trailerVideoUrl, setTrailerVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  // Öne Çıkanlar (Story / Dikey Teaser) Durumları
  const [highlights, setHighlights] = useState<StoryHighlight[]>([]);
  const [isAddHighlightOpen, setIsAddHighlightOpen] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightChapterId, setNewHighlightChapterId] = useState<string>('');
  const [newHighlightFile, setNewHighlightFile] = useState<File | null>(null);
  const [newHighlightDuration, setNewHighlightDuration] = useState<number>(0);
  const [newHighlightCoverBlob, setNewHighlightCoverBlob] = useState<Blob | null>(null);
  const [newHighlightCoverPreview, setNewHighlightCoverPreview] = useState<string>('');
  const [highlightUploading, setHighlightUploading] = useState(false);
  const [highlightUploadProgress, setHighlightUploadProgress] = useState(0);
  const [previewModalIndex, setPreviewModalIndex] = useState<number | null>(null);
  const highlightVideoInputRef = React.useRef<HTMLInputElement>(null);

  // Öne Çıkan Düzenleme Durumları
  const [editingHighlight, setEditingHighlight] = useState<StoryHighlight | null>(null);
  const [editHighlightTitle, setEditHighlightTitle] = useState('');
  const [editHighlightChapterId, setEditHighlightChapterId] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Seri & Evren Bağlantıları
  const [authorSeriesList, setAuthorSeriesList] = useState<Series[]>([]);
  const [authorUniverseList, setAuthorUniverseList] = useState<Universe[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [selectedUniverseId, setSelectedUniverseId] = useState<string>('');
  const [seriesLabel, setSeriesLabel] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [storyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const realStory = await getStoryById(storyId);
      const chaps = await fetchChapters(storyId);

      setChapters(chaps);

      if (realStory) {
        setStory(realStory);
        setTitle(realStory.title || '');
        setSummary(realStory.summary || '');
        setMainGenre(realStory.mainGenre);
        setSubGenres(realStory.subGenres || []);
        setCoverImage(realStory.coverImage || '');
        const initialStatus = (realStory.format === 'short_story' && realStory.status === 'ongoing') ? 'completed' : (realStory.status || 'draft');
        setStatus(initialStatus);
        setForeword(realStory.foreword || '');
        setBackCover(realStory.backCover || '');
        setTrailerVideoUrl(realStory.trailerVideoUrl || '');
        setHighlights(realStory.highlights || []);
        setSelectedSeriesId(realStory.seriesId || '');
        setSelectedUniverseId(realStory.universeId || '');
        setSeriesLabel(realStory.seriesLabel || '');

        // Bölüm sayacını gerçek veritabanı durumuyla senkronize et (Self-Healing)
        syncStoryChapterCount(storyId).catch(() => {});

        if (realStory.authorId) {
          try {
            const [sList, uList] = await Promise.all([
              getSeriesByAuthorId(realStory.authorId),
              getUniversesByAuthorId(realStory.authorId)
            ]);
            setAuthorSeriesList(sList);
            setAuthorUniverseList(uList);
          } catch (listErr) {
            console.error("Seri/Evren listesi alınamadı:", listErr);
          }
        }

        // Geriye dönük uyumluluk: eski string dizisi ise nesneye çevir
        const rawContributors = realStory.contributors || [];
        if (rawContributors.length > 0 && typeof rawContributors[0] === 'string') {
          setContributors((rawContributors as any[]).map(c => ({ role: 'Katkıda Bulunan', name: c })));
        } else {
          setContributors(rawContributors as Contributor[]);
        }
      } else {
        toast.error("Hikaye bulunamadı.");
        router.push('/studio');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Seri bağlantısı güncellendiyse
      if (selectedSeriesId !== (story?.seriesId || '')) {
        if (story?.seriesId) {
          await removeStoryFromSeries(story.seriesId, storyId);
        }
        if (selectedSeriesId) {
          await addStoryToSeries(selectedSeriesId, storyId, seriesLabel.trim() || undefined);
        }
      }

      // Evren bağlantısı güncellendiyse
      if (selectedUniverseId !== (story?.universeId || '')) {
        if (story?.universeId) {
          await unlinkStoryFromUniverse(story.universeId, storyId);
        }
        if (selectedUniverseId) {
          await linkStoryToUniverse(selectedUniverseId, storyId);
        }
      }

      const validContributors = contributors.filter(c => c.name.trim().length > 0);
      const combinedTags = Array.from(new Set([mainGenre, ...(subGenres || [])])).filter(Boolean) as string[];
      await updateStory(storyId, {
        title,
        summary,
        mainGenre,
        subGenres,
        tags: combinedTags,
        coverImage,
        status: (story?.format === 'short_story' && status === 'ongoing') ? 'completed' : status,
        foreword,
        backCover,
        trailerVideoUrl,
        highlights,
        contributors: validContributors,
        seriesLabel: seriesLabel.trim() || undefined
      });

      if (story) {
        if (story.format === 'short_story' && (status === 'ongoing' || status === 'completed') && story.status === 'draft') {
          const { trackInteraction } = await import('@readixon/core');
          trackInteraction(story.authorId, 'short_story_published').catch(() => {});
        }
        if (status === 'completed' && story.status !== 'completed') {
          const { trackInteraction } = await import('@readixon/core');
          trackInteraction(story.authorId, 'story_completed').catch(() => {});
        }
      }

      toast.success('Kaydedildi');
    } catch (e) {
      toast.error('Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      const validContributors = contributors.filter(c => c.name.trim().length > 0);
      const combinedTags = Array.from(new Set([mainGenre, ...(subGenres || [])])).filter(Boolean) as string[];
      await updateStory(storyId, {
        title,
        summary,
        mainGenre,
        subGenres,
        tags: combinedTags,
        coverImage,
        status: (story?.format === 'short_story' && status === 'ongoing') ? 'completed' : status,
        foreword,
        backCover,
        trailerVideoUrl,
        highlights,
        contributors: validContributors
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setAutoSaveStatus('idle');
    }
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      if (!loading && story) {
        isInitialLoad.current = false;
      }
      return;
    }

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, summary, mainGenre, subGenres, coverImage, status, foreword, backCover, contributors, trailerVideoUrl, highlights, loading, story]);

  // ── Öne Çıkanlar (Story / Dikey Teaser) Metotları ──
  const handleSelectHighlightVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Öne çıkan video boyutu en fazla 25MB olabilir.');
      if (highlightVideoInputRef.current) highlightVideoInputRef.current.value = '';
      return;
    }

    // Mobil için anında geri bildirim ve önizleme
    const previewUrl = URL.createObjectURL(file);
    setNewHighlightFile(file);
    setNewHighlightCoverPreview(previewUrl);

    // Otomatik başlık öner
    if (!newHighlightTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();
      setNewHighlightTitle(cleanName.slice(0, 25) || 'Tanıtım Teaser');
    }

    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.playsInline = true;
    videoEl.muted = true;
    
    // Mobil WebView zaman aşımı güvencesi (metadata gecikirse donmayı engeller)
    let isHandled = false;
    const fallbackTimer = setTimeout(() => {
      if (!isHandled) {
        isHandled = true;
        setNewHighlightDuration(15);
      }
    }, 2500);

    const onMetadata = () => {
      if (isHandled) return;
      isHandled = true;
      clearTimeout(fallbackTimer);

      let dur = videoEl.duration;
      // Android / Chrome Infinity veya NaN süresi kontrolü
      if (!isFinite(dur) || isNaN(dur) || dur <= 0) {
        dur = 15;
      }

      if (dur > 22) { // 2 saniye toleransla 20 saniye
        toast.error(`Video süresi en fazla 20 saniye olmalıdır. (Seçilen: ${Math.round(dur)} sn)`);
        setNewHighlightFile(null);
        setNewHighlightCoverPreview('');
        setNewHighlightDuration(0);
        if (highlightVideoInputRef.current) highlightVideoInputRef.current.value = '';
        return;
      }

      setNewHighlightDuration(dur);

      // Otomatik kare yakalama (Canvas mobilde hata verirse akışı durdurmaz)
      try {
        videoEl.currentTime = Math.min(0.5, dur / 2);
        videoEl.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(videoEl.videoWidth || 720, 720);
            canvas.height = Math.min(videoEl.videoHeight || 1280, 1280);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              canvas.toBlob(blob => {
                if (blob) {
                  setNewHighlightCoverBlob(blob);
                  setNewHighlightCoverPreview(URL.createObjectURL(blob));
                }
              }, 'image/jpeg', 0.85);
            }
          } catch (cErr) {
            console.warn('Canvas thumbnail yakalanamadı, video önizlemesi kullanılacak', cErr);
          }
        };
      } catch (seekErr) {
        console.warn('Seek hatası', seekErr);
      }
    };

    videoEl.onloadedmetadata = onMetadata;
    videoEl.onerror = () => {
      if (isHandled) return;
      isHandled = true;
      clearTimeout(fallbackTimer);
      setNewHighlightDuration(15);
    };

    videoEl.src = previewUrl;
    try {
      videoEl.load();
    } catch (e) {}
  };

  const handleSaveHighlight = async () => {
    if (!newHighlightFile) {
      toast.error('Lütfen dikey bir video dosyası seçin.');
      return;
    }
    if (!newHighlightTitle.trim()) {
      toast.error('Lütfen öne çıkan için bir başlık girin.');
      return;
    }
    if (highlights.length >= 6) {
      toast.error('Bir hikaye için en fazla 6 adet öne çıkan story ekleyebilirsiniz.');
      return;
    }

    setHighlightUploading(true);
    setHighlightUploadProgress(15);

    try {
      const timestamp = Date.now();
      const videoPath = `stories/${storyId}/highlights/video_${timestamp}.mp4`;
      const videoUrl = await uploadFile(newHighlightFile, videoPath, {
        allowVideo: true,
        onProgress: (p) => setHighlightUploadProgress(Math.min(85, Math.round(p * 0.85)))
      });

      let coverUrl: string | undefined = undefined;
      if (newHighlightCoverBlob) {
        const coverPath = `stories/${storyId}/highlights/cover_${timestamp}.jpg`;
        coverUrl = await uploadFile(newHighlightCoverBlob, coverPath);
      } else if (story?.coverImage) {
        coverUrl = story.coverImage;
      }

      setHighlightUploadProgress(95);

      const selectedChap = chapters.find(c => c.chapterId === newHighlightChapterId);
      const newHighlight: StoryHighlight = {
        id: `hl_${timestamp}`,
        title: newHighlightTitle.trim(),
        videoUrl,
        coverUrl,
        duration: Math.round(newHighlightDuration * 10) / 10,
        order: highlights.length + 1,
        chapterId: newHighlightChapterId || undefined,
        chapterTitle: selectedChap ? (selectedChap.title || `Bölüm ${chapters.indexOf(selectedChap) + 1}`) : undefined,
        createdAt: new Date().toISOString()
      };

      const updatedHighlights = [...highlights, newHighlight];
      setHighlights(updatedHighlights);

      await updateStory(storyId, {
        highlights: updatedHighlights
      });

      toast.success('Öne çıkan story başarıyla eklendi!');
      setIsAddHighlightOpen(false);
      setNewHighlightFile(null);
      setNewHighlightTitle('');
      setNewHighlightChapterId('');
      setNewHighlightCoverBlob(null);
      setNewHighlightCoverPreview('');
      setNewHighlightDuration(0);
      if (highlightVideoInputRef.current) highlightVideoInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      toast.error('Öne çıkan kaydedilirken bir hata oluştu.');
    } finally {
      setHighlightUploading(false);
      setHighlightUploadProgress(0);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    if (!window.confirm('Bu öne çıkanı silmek istediğinize emin misiniz?')) return;

    try {
      const updatedHighlights = highlights
        .filter(h => h.id !== id)
        .map((h, idx) => ({ ...h, order: idx + 1 }));
      setHighlights(updatedHighlights);

      await updateStory(storyId, {
        highlights: updatedHighlights
      });
      toast.success('Öne çıkan silindi.');
    } catch (err) {
      console.error(err);
      toast.error('Silinirken hata oluştu.');
    }
  };

  const handleOpenEditHighlight = (h: StoryHighlight) => {
    setEditingHighlight(h);
    setEditHighlightTitle(h.title);
    setEditHighlightChapterId(h.chapterId || '');
  };

  const handleSaveEditHighlight = async () => {
    if (!editingHighlight) return;
    if (!editHighlightTitle.trim()) {
      toast.error('Lütfen öne çıkan için bir başlık girin.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const selectedChap = chapters.find(c => c.chapterId === editHighlightChapterId);
      const updatedHighlights = highlights.map(h => {
        if (h.id === editingHighlight.id) {
          const updated: StoryHighlight = {
            ...h,
            title: editHighlightTitle.trim(),
          };
          if (editHighlightChapterId) {
            updated.chapterId = editHighlightChapterId;
            updated.chapterTitle = selectedChap ? (selectedChap.title || `Bölüm ${chapters.indexOf(selectedChap) + 1}`) : undefined;
          } else {
            delete updated.chapterId;
            delete updated.chapterTitle;
          }
          return updated;
        }
        return h;
      });

      setHighlights(updatedHighlights);
      await updateStory(storyId, {
        highlights: updatedHighlights
      });

      toast.success('Öne çıkan başarıyla güncellendi!');
      setEditingHighlight(null);
    } catch (err) {
      console.error(err);
      toast.error('Öne çıkan güncellenirken bir hata oluştu.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleMoveHighlight = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= highlights.length) return;

    const list = [...highlights];
    const item = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = item;

    const reordered = list.map((h, idx) => ({ ...h, order: idx + 1 }));
    setHighlights(reordered);

    try {
      await updateStory(storyId, {
        highlights: reordered
      });
      toast.success('Sıralama güncellendi.');
    } catch (err) {
      console.error(err);
      toast.error('Sıralama kaydedilemedi.');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video boyutu en fazla 50MB olabilir.');
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    
    videoElement.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoElement.src);
      if (videoElement.duration > 32) {
        toast.error('Video süresi en fazla 30 saniye olabilir.');
        return;
      }

      setVideoUploading(true);
      try {
        const path = `stories/${storyId}/trailer_${Date.now()}.mp4`;
        const url = await uploadFile(file, path);
        setTrailerVideoUrl(url);
        toast.success('Video başarıyla yüklendi.');
      } catch (err) {
        console.error(err);
        toast.error('Video yüklenirken hata oluştu.');
      } finally {
        setVideoUploading(false);
      }
    };

    videoElement.src = URL.createObjectURL(file);
  };

  const handleAddChapter = async () => {
    if (story?.format === 'short_story' && chapters.length >= 1) {
      toast.info("Kısa hikayeler yalnızca tek bir bölümden oluşabilir.");
      return;
    }
    try {
      const titlePrefix = story?.format === 'webtoon' ? 'Episod' : story?.format === 'short_story' ? 'Kısa Hikaye' : story?.format === 'chat' ? 'Sohbet' : 'Bölüm';
      const newChapId = await createChapter(storyId, {
        title: story?.format === 'short_story' ? 'Tek Bölüm' : `${titlePrefix} ${chapters.length + 1}`,
        order: chapters.length + 1,
        contentBlocks: [],
        chatMessages: story?.format === 'chat' ? [] : undefined
      });
      if (story?.format === 'webtoon') {
        router.push(`/studio/webtoons/${storyId}/episodes/${newChapId}`);
      } else {
        router.push(`/studio/story/${storyId}/chapter/${newChapId}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Bölüm oluşturulamadı.");
    }
  };

  const handleDeleteStory = async () => {
    const isConfirmed = window.confirm(
      "DİKKAT: Bu hikayeyi, tüm bölümlerini, planlama notlarını ve yorumlarını kalıcı olarak silmek üzeresiniz!\n\nBu işlemin hiçbir geri dönüşü YOKTUR. Silmek istediğinize emin misiniz?"
    );
    if (!isConfirmed) return;

    setSaving(true);
    try {
      const { deleteStoryCompletely } = await import('@readixon/core');
      await deleteStoryCompletely(storyId);
      toast.success("Hikaye kalıcı olarak silindi.");
      router.push('/studio');
    } catch (e) {
      console.error(e);
      toast.error("Hikaye silinirken bir hata oluştu.");
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setSaving(true);
        const originalFile = e.target.files[0];
        // Sıkıştırma: Max 800x1200, %80 kalite
        const compressedFile = await compressImage(originalFile);

        const url = await uploadFile(compressedFile, `covers/${storyId}-${Date.now()}`);
        setCoverImage(url);
      } catch (err) {
        toast.error("Görsel yüklenemedi");
      } finally {
        setSaving(false);
      }
    }
  };

  const getStatusBadge = (s: StoryStatus) => {
    const isShortStory = story?.format === 'short_story';
    switch (s) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isShortStory ? 'Yayında (Tek Bölüm)' : 'Yayında (Devam Ediyor)'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <CheckCircle size={12} />
            {isShortStory ? 'Yayında (Tek Bölüm / Tamamlandı)' : 'Tamamlandı'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
            Taslak
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 sm:p-12 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted">Hikaye bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-28 sm:pb-12">
      
      {/* ── 1. Üst Navigasyon & Aksiyon Barı ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button 
            variant="ghost" 
            onPress={() => router.push('/studio')} 
            className="p-2 -ml-2 text-muted hover:text-text cursor-pointer shrink-0 rounded-xl"
            aria-label="Stüdyo'ya Dön"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline ml-1 text-sm font-medium">Stüdyo'ya Dön</span>
          </Button>
          <div className="h-4 w-px bg-border/60 hidden sm:block" />
          <div className="flex items-center shrink-0">
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Kaydetme Butonu & Otomatik Kaydetme Durumu */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs hidden sm:block">
            {autoSaveStatus === 'saving' && (
              <span className="text-muted flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border-2 border-muted border-t-primary rounded-full animate-spin" />
                Kaydediliyor...
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in duration-200">
                <CheckCircle size={13} /> Otomatik Kaydedildi
              </span>
            )}
          </div>

          <Button 
            variant="primary" 
            onPress={handleSave} 
            disabled={saving || autoSaveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 font-semibold text-xs sm:text-sm shadow-md shadow-primary/20 cursor-pointer rounded-xl"
          >
            <Save size={15} />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Hikaye Başlığı & İstatistikler ── */}
      <div className="bg-card border border-border/60 rounded-2xl p-4 sm:p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text truncate">
                {title || 'İsimsiz Hikaye'}
              </h1>
              {story?.format === 'short_story' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                  <Feather size={11} /> Kısa Hikaye
                </span>
              )}
              {story?.format === 'chat' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                  <MessageSquare size={11} /> Mesaj Hikayesi
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Hikayenizin bölümlerini, vitrinini ve yazar araçlarını yönetin.
            </p>
          </div>

          {/* İstatistik Rozetleri */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-muted/10 px-3.5 py-2 rounded-xl border border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <BookOpen size={14} className="text-primary" />
              <span className="font-bold text-text">
                {story?.format === 'short_story' ? `${chapters.length}/1 (Tek Bölüm)` : story?.format === 'chat' ? `${chapters.length} Sohbet` : `${chapters.length} Bölüm`}
              </span>
            </div>
            <div className="w-px h-3.5 bg-border/60" />
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Eye size={14} className="text-sky-400" />
              <span className="font-bold text-text">{story?.stats?.views || 0}</span> Okunma
            </div>
            <div className="w-px h-3.5 bg-border/60" />
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Heart size={14} className="text-rose-400" />
              <span className="font-bold text-text">{story?.stats?.likes || 0}</span> Beğeni
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Açılır / Kapanır Stüdyo Rehberi (Yapay Zeka Bilgisi Olmadan) ── */}
      <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2.5 text-primary">
            <Info size={18} className="shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Stüdyo Yönetim Rehberi & İpuçları</span>
          </div>
          <div className="text-primary flex items-center gap-1 text-xs">
            <span>{infoExpanded ? 'Gizle' : 'Göster'}</span>
            {infoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {infoExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-primary/20 text-xs sm:text-sm text-text/90 space-y-2 animate-in fade-in duration-200">
            <ul className="list-disc ml-4 space-y-2 text-muted leading-relaxed">
              <li>
                <strong className="text-text font-semibold">Bölümler ve Planlama:</strong> Hikayenizin gidişatını buradan yönetirsiniz. "Yeni Bölüm Ekle" butonuna veya bir bölüme dokunarak zengin içerik editörüne geçip yazmaya başlayabilirsiniz.
              </li>
              <li>
                <strong className="text-text font-semibold">Kurgu Sihirbazı:</strong> Açılış kancanızı, karakter özelliklerinizi, plot twist ve final adımlarınızı yapılandırılmış bir iskelet halinde adım adım planlayabilirsiniz.
              </li>
              <li>
                <strong className="text-text font-semibold">Kapak ve Detaylar:</strong> Okurların göreceği kapak görselini, özeti, önsözü, arka kapak yazısını ve yayın durumunu "Kitap Bilgileri" sekmesinden düzenleyebilirsiniz.
              </li>
              <li>
                <strong className="text-text font-semibold">Bölüm Aktiviteleri:</strong> Bölüm sonlarına eklediğiniz anketlerin ve soruların okuyucu yanıtlarını buradan takip edebilirsiniz.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* ── 4. Sekme Barı: Mobilde 2 Üst + 1 Alt (Story), Masaüstünde 3 Yan Yana ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-1.5 sm:p-2 bg-muted/15 border border-border/50 rounded-2xl mb-6 select-none shadow-xs">
        {/* Sekme 1: Bölümler & Kurgu */}
        <button
          type="button"
          onClick={() => setActiveTab('chapters')}
          className={`col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
            activeTab === 'chapters'
              ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.01]'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          <BookOpen size={16} className="shrink-0" />
          <span className="leading-tight">
            {story?.format === 'webtoon' ? 'Episodlar & Kurgu' : 'Bölümler & Kurgu'}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
            activeTab === 'chapters' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
          }`}>
            {chapters.length}
          </span>
        </button>

        {/* Sekme 2: Kitap Bilgileri & Vitrin */}
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
            activeTab === 'details'
              ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.01]'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          <Settings size={16} className="shrink-0" />
          <span className="leading-tight">Kitap Bilgileri & Vitrin</span>
        </button>

        {/* Sekme 3: Öne Çıkanlar (Story / Teaser) - Mobilde Altta Tam Genişlik */}
        <button
          type="button"
          onClick={() => setActiveTab('highlights')}
          className={`col-span-2 md:col-span-1 relative flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
            activeTab === 'highlights'
              ? 'bg-gradient-to-r from-amber-400 via-primary to-amber-500 text-black shadow-md shadow-amber-500/20 scale-[1.01]'
              : 'text-muted hover:text-text bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          <Sparkles size={16} className={`shrink-0 ${activeTab === 'highlights' ? 'text-black' : 'text-amber-500 animate-pulse'}`} />
          <span>Öne Çıkanlar (Story / Teaser)</span>

          {highlights.length > 0 ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
              activeTab === 'highlights' ? 'bg-black/20 text-black' : 'bg-primary/20 text-primary'
            }`}>
              {highlights.length}
            </span>
          ) : (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 uppercase tracking-wider ${
              activeTab === 'highlights' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
            }`}>
              YENİ
            </span>
          )}
        </button>
      </div>

      {/* ── 5. Sekme: Bölümler ve Yazar Araçları ── */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          {/* Bölüm Listesi Kartı */}
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border/60 shadow-xs">
            {story?.format === 'short_story' && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-500 font-medium">
                <Feather size={16} className="shrink-0" />
                <span>
                  <strong>Kısa Hikaye (Tek Bölümlü Eser):</strong> Bu hikaye yapısı gereği tek bölümle sınırlandırılmıştır. İkinci bir bölüm eklenemez.
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <Typography variant="h3" className="font-bold text-base sm:text-lg">
                  {story?.format === 'webtoon' ? 'Episod Listesi' : story?.format === 'short_story' ? 'Kısa Hikaye Bölümü' : story?.format === 'chat' ? 'Sohbet Listesi' : 'Bölüm Listesi'}
                </Typography>
                <p className="text-xs text-muted mt-0.5">
                  Yazmak veya düzenlemek istediğiniz bölüme dokunun.
                </p>
              </div>
              {story?.format === 'short_story' && chapters.length >= 1 ? (
                <div 
                  className="flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold select-none shadow-xs"
                  title="Kısa hikayeler tek bölümle sınırlıdır. İkinci bir bölüm eklenemez."
                >
                  <Check size={14} className="text-amber-500" />
                  <span>Tek Bölüm Tamamlandı (1/1)</span>
                </div>
              ) : (
                <Button 
                  variant="primary" 
                  onPress={handleAddChapter} 
                  className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 px-4 cursor-pointer font-semibold shadow-md shadow-primary/20"
                >
                  <PlusCircle size={16} />
                  <span>
                    {story?.format === 'webtoon' 
                      ? 'Yeni Episod Ekle' 
                      : story?.format === 'short_story' 
                        ? 'Tek Bölümü Oluştur' 
                        : story?.format === 'chat'
                          ? 'Yeni Sohbet Ekle'
                          : 'Yeni Bölüm Ekle'}
                  </span>
                </Button>
              )}
            </div>

            {/* Bölümler veya Boş Durum */}
            {chapters.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-border/40 rounded-xl bg-muted/5 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <BookOpen size={24} />
                </div>
                <h4 className="font-semibold text-text text-sm sm:text-base">
                  {story?.format === 'webtoon' ? 'Henüz episod eklenmemiş' : story?.format === 'chat' ? 'Henüz sohbet eklenmemiş' : 'Henüz hiç bölüm eklenmemiş'}
                </h4>
                <p className="text-xs text-muted max-w-sm mt-1 mb-4">
                  Hikayenizin ilk bölümünü oluşturarak yazmaya hemen başlayabilirsiniz.
                </p>
                <Button 
                  variant="outline" 
                  onPress={handleAddChapter}
                  className="text-xs cursor-pointer"
                >
                  <PlusCircle size={14} className="mr-1.5" /> {story?.format === 'short_story' ? 'Tek Bölümü Oluştur' : story?.format === 'chat' ? 'İlk Sohbeti Oluştur' : 'İlk Bölümü Oluştur'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {chapters.map(chap => (
                  <div
                    key={chap.chapterId}
                    onClick={() => {
                      if (story?.format === 'webtoon') {
                        router.push(`/studio/webtoons/${storyId}/episodes/${chap.chapterId}`);
                      } else {
                        router.push(`/studio/story/${storyId}/chapter/${chap.chapterId}`);
                      }
                    }}
                    className="flex items-center gap-3 p-3.5 sm:p-4 bg-muted/10 hover:bg-muted/20 border border-border/50 hover:border-primary/40 rounded-xl transition-all cursor-pointer group shadow-xs active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-card text-muted group-hover:text-primary group-hover:bg-primary/10 flex items-center justify-center font-bold text-xs shrink-0 transition-colors border border-border/50">
                      #{chap.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-text group-hover:text-primary transition-colors truncate">
                          {chap.title}
                        </h4>
                        {chap.audioTrack?.url && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0" title="Fon Müziği Eklendi">
                            <Music size={11} /> Müzikli
                          </span>
                        )}
                        {story?.format === 'chat' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                            <MessageSquare size={11} />
                            {chap.chatMessages && chap.chatMessages.length > 0 ? `${chap.chatMessages.length} Mesaj` : 'Henüz mesaj yok'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5">Düzenlemek için dokunun</p>
                    </div>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm(`"${chap.title}" başlıklı bölümü kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
                        try {
                          await deleteChapter(storyId, chap.chapterId);
                          setChapters(prev => prev.filter(c => c.chapterId !== chap.chapterId));
                          toast.success("Bölüm başarıyla silindi.");
                        } catch {
                          toast.error("Bölüm silinemedi.");
                        }
                      }}
                      className="w-8 h-8 rounded-lg text-muted/50 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                      title="Bölümü Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={18} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Yazar Araçları Kısayol Kartları */}
          <div>
            <Typography variant="h3" className="font-bold text-base sm:text-lg mb-3">
              Yazar Araçları
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kurgu Sihirbazı - Kısa hikayelerde sihirbaz gösterilmez */}
              {story?.format !== 'short_story' && (
                <div
                  onClick={() => router.push(`/studio/story/${storyId}/planner`)}
                  className="bg-card p-4 sm:p-5 rounded-2xl border border-primary/20 hover:border-primary/50 cursor-pointer hover:bg-primary/5 transition-all group flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Wand2 size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase">
                        Planlama
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-text group-hover:text-primary transition-colors mb-1">
                      Kurgu Sihirbazı
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Açılış kancası, karakterler, plot twistler ve final adımlarını adım adım planlayın.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-4">
                    <span>Planlayıcıya Git</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              )}

              {/* Bölüm Aktiviteleri */}
              <div
                onClick={() => router.push(`/studio/story/${storyId}/activities`)}
                className="bg-card p-4 sm:p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 cursor-pointer hover:bg-amber-500/5 transition-all group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MessageSquare size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 uppercase">
                      Etkileşim
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-text group-hover:text-amber-500 transition-colors mb-1">
                    Bölüm Aktiviteleri
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Bölüm sonlarına eklenen anketlerin ve açık uçlu soruların okuyucu yanıtlarını inceleyin.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 mt-4">
                  <span>Aktiviteleri Gör</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Sekme: Kitap Bilgileri & Vitrin ── */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sol Kolon: Kapak & Medya & Durum */}
            <div className="lg:col-span-1 space-y-6">
              {/* Kapak Görseli */}
              <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/60 shadow-xs">
                <Typography variant="h3" className="font-bold text-sm sm:text-base mb-3">
                  Kapak Görseli
                </Typography>
                
                <div className="w-full aspect-[2/3] max-w-[220px] mx-auto bg-muted/10 rounded-xl overflow-hidden border-2 border-dashed border-border/60 flex flex-col items-center justify-center relative mb-3 group hover:border-primary transition-colors">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <PlusCircle size={28} className="mx-auto mb-2 text-muted/60" />
                      <span className="text-xs text-muted block">Görsel Seç</span>
                      <span className="text-[10px] text-muted/60 block mt-0.5">2:3 oran önerilir</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Görsel Yükle"
                  />
                </div>

                {coverImage && (
                  <Input
                    value={coverImage}
                    onChangeText={setCoverImage}
                    placeholder="Görsel URL'si"
                    className="text-xs"
                  />
                )}
              </div>

              {/* Yayın Durumu */}
              <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/60 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="caption" className="font-bold text-muted uppercase">
                    Yayın Durumu
                  </Typography>
                  {story?.format === 'short_story' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      Tek Bölümlük Eser
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={story?.format === 'short_story' && status === 'ongoing' ? 'completed' : status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-muted/10 border border-border/60 rounded-xl p-3 text-xs sm:text-sm text-text focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {story?.format === 'short_story' ? (
                      <>
                        <option value="draft">Taslak (Yalnızca siz görebilirsiniz)</option>
                        <option value="completed">Yayında (Tek Bölüm / Tamamlandı)</option>
                      </>
                    ) : (
                      <>
                        <option value="draft">Taslak (Sadece siz görebilirsiniz)</option>
                        <option value="ongoing">Yayında (Devam Ediyor)</option>
                        <option value="completed">Yayında (Tamamlandı)</option>
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-muted">
                    <ChevronDown size={18} />
                  </div>
                </div>
                {story?.format === 'short_story' && (
                  <p className="text-[11px] text-muted mt-2 leading-relaxed">
                    💡 Kısa hikayeler tek bölümlük olduğu için &ldquo;Devam Ediyor&rdquo; durumu bulunmaz. Yayına aldığınızda doğrudan tamamlanmış bir eser olarak okuyuculara sunulur.
                  </p>
                )}
              </div>

              {/* Seri & Evren Bağlantısı */}
              <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/60 shadow-xs space-y-3">
                <Typography variant="caption" className="font-bold text-muted uppercase block">
                  Seri & Evren Bağlantısı
                </Typography>

                {/* Seri Dropdown */}
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">Kitap Serisi</label>
                  <select
                    value={selectedSeriesId}
                    onChange={(e) => setSelectedSeriesId(e.target.value)}
                    className="w-full bg-muted/10 border border-border/60 rounded-xl p-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Bağımsız (Seriye Bağlı Değil)</option>
                    {authorSeriesList.map((ser) => (
                      <option key={ser.seriesId} value={ser.seriesId}>
                        📚 {ser.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seri Etiketi */}
                {selectedSeriesId && (
                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Özel Seri Etiketi (Opsiyonel)</label>
                    <Input
                      value={seriesLabel}
                      onChangeText={setSeriesLabel}
                      placeholder="Örn: 1. Kitap, Başlangıç, Prequel"
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Evren Dropdown */}
                <div className="pt-2 border-t border-border/40">
                  <label className="text-[11px] font-bold text-muted block mb-1">Kurgusal Evren</label>
                  <select
                    value={selectedUniverseId}
                    onChange={(e) => setSelectedUniverseId(e.target.value)}
                    className="w-full bg-muted/10 border border-border/60 rounded-xl p-2.5 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Bağımsız (Evrene Bağlı Değil)</option>
                    {authorUniverseList.map((u) => (
                      <option key={u.universeId} value={u.universeId}>
                        🌌 {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kitap Fragmanı (Video) */}
              <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/60 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <Typography variant="caption" className="font-bold text-muted uppercase">
                    Kitap Fragmanı (Video)
                  </Typography>
                  {trailerVideoUrl && (
                    <button 
                      type="button"
                      onClick={() => setTrailerVideoUrl('')} 
                      className="text-red-400 text-xs font-medium hover:text-red-300 cursor-pointer"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted leading-relaxed mb-3">
                  Okuyucuların kitabınızı keşfetmesi için maks. 30 saniyelik tanıtım videosu ekleyebilirsiniz (Maks 50MB).
                </p>
                
                {trailerVideoUrl ? (
                  <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border/40 shadow-inner">
                    <video src={trailerVideoUrl} controls className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div 
                    onClick={() => !videoUploading && videoInputRef.current?.click()}
                    className={`w-full aspect-video border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 ${videoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                    {videoUploading ? (
                      <>
                        <Loader2 size={24} className="text-primary animate-spin" />
                        <span className="text-xs text-muted">Video Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={24} className="text-muted/50" />
                        <span className="text-xs text-muted font-medium">Video Seç (Maks 30sn)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Kolon: Form Bilgileri */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border/60 shadow-xs space-y-5">
                <div>
                  <Typography variant="h3" className="font-bold text-sm sm:text-base mb-3">
                    Temel Bilgiler
                  </Typography>
                  <Input
                    label="Hikaye Başlığı"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Hikaye Başlığı"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Hikaye Özeti
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Hikaye Özeti (Kitabın okurlara hitap eden genel tanıtımı)"
                    className="w-full bg-muted/5 border border-border/60 rounded-xl p-3.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary resize-y min-h-[120px]"
                  />
                </div>

                {/* Readixon Tür Defteri: 1 Ana Tür + Sınırsız Alt Tür */}
                <div className="pt-2 border-t border-border/40">
                  <GenreSelector
                    selectedMainGenre={mainGenre}
                    selectedSubGenres={subGenres}
                    onChange={(m, s) => {
                      setMainGenre(m);
                      setSubGenres(s);
                    }}
                  />
                </div>

                <div>
                  <Typography variant="h3" className="font-bold text-sm sm:text-base mb-3">
                    Yayın & Kitap Detayları
                  </Typography>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Önsöz (İsteğe bağlı)
                      </label>
                      <textarea
                        value={foreword}
                        onChange={(e) => setForeword(e.target.value)}
                        placeholder="Yazarın okurlarına notu, ithaf veya önsöz..."
                        className="w-full bg-muted/5 border border-border/60 rounded-xl p-3.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary resize-y min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Arka Kapak Yazısı (İsteğe bağlı)
                      </label>
                      <textarea
                        value={backCover}
                        onChange={(e) => setBackCover(e.target.value)}
                        placeholder="Kitabın arka kapağında yer alacak çarpıcı alıntı veya paragraf..."
                        className="w-full bg-muted/5 border border-border/60 rounded-xl p-3.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary resize-y min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Ekip & Katkıda Bulunanlar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="caption" className="font-bold text-muted uppercase">
                      Ekip & Katkıda Bulunanlar
                    </Typography>
                    <button
                      type="button"
                      onClick={() => setContributors([...contributors, { role: 'Editör', name: '' }])}
                      className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <PlusCircle size={14} /> Kişi Ekle
                    </button>
                  </div>

                  {contributors.length === 0 ? (
                    <p className="text-xs text-muted/60 italic py-2">Henüz katkıda bulunan eklenmedi.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {contributors.map((contributor, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 p-2.5 bg-muted/10 rounded-xl border border-border/40">
                          <select
                            value={contributor.role}
                            onChange={(e) => {
                              const newC = [...contributors];
                              newC[idx].role = e.target.value;
                              setContributors(newC);
                            }}
                            className="bg-card border border-border/60 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                          >
                            <option value="Editör">Editör</option>
                            <option value="Çevirmen">Çevirmen</option>
                            <option value="Kapak Tasarımı">Kapak Tasarımı</option>
                            <option value="Çizer">Çizer</option>
                            <option value="Son Okuma">Son Okuma</option>
                            <option value="Katkıda Bulunan">Diğer</option>
                          </select>
                          <input
                            type="text"
                            value={contributor.name}
                            onChange={(e) => {
                              const newC = [...contributors];
                              newC[idx].name = e.target.value;
                              setContributors(newC);
                            }}
                            placeholder="İsim Soyisim"
                            className="flex-1 bg-card border border-border/60 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setContributors(contributors.filter((_, i) => i !== idx));
                            }}
                            className="text-red-400 hover:text-red-300 p-2 text-xs font-semibold self-end sm:self-center cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tehlikeli Bölge (Sayfanın ve Detayların En Altında) */}
          <div className="bg-red-500/5 p-4 sm:p-6 rounded-2xl border border-red-500/20">
            <Typography variant="h3" className="text-red-500 mb-2 font-bold text-sm sm:text-base">
              Tehlikeli Bölge
            </Typography>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Bu hikayeyi ve altındaki tüm bölümleri, notları kalıcı olarak silmek istiyorsanız aşağıdaki butonu kullanabilirsiniz. Veritabanından tamamen silinecektir ve <strong>bu işlemin hiçbir geri dönüşü yoktur.</strong>
            </p>
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-500 hover:bg-red-500/10 w-full sm:w-auto cursor-pointer text-xs sm:text-sm" 
              onPress={handleDeleteStory}
            >
              Hikayeyi Kalıcı Olarak Sil
            </Button>
          </div>
        </div>
      )}

      {/* ── 6. Sekme: Öne Çıkanlar (Story / Dikey Teaser) ── */}
      {activeTab === 'highlights' && (
        <div className="space-y-6">
          {/* Tanıtım & Bilgilendirme Kartı */}
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border/60 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={20} />
                  <Typography variant="h3" className="font-bold text-base sm:text-lg">
                    Öne Çıkanlar (Story / Dikey Teaser)
                  </Typography>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {highlights.length} / 6
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                  Instagram Story Highlights gibi; kitabınızın tanıtımı, karakterleri veya duyuruları için <strong>9:16 dikey</strong> ve <strong>en fazla 20 saniyelik</strong> kısa video hikayeleri yayınlayın. Okurlar kitap detay sayfanızda parıltılı dairelere dokunarak bunları izleyebilir.
                </p>
              </div>

              <Button
                variant="primary"
                onPress={() => setIsAddHighlightOpen(true)}
                disabled={highlights.length >= 6}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm py-3 sm:py-2.5 px-4 cursor-pointer font-bold shadow-md shadow-primary/20 shrink-0 w-full sm:w-auto"
              >
                <PlusCircle size={16} />
                <span>Yeni Öne Çıkan Ekle</span>
              </Button>
            </div>

            {/* Liste Boş Durumu */}
            {highlights.length === 0 ? (
              <div className="text-center py-10 sm:py-12 px-4 rounded-xl border border-dashed border-border/70 bg-muted/5 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/20 via-fuchsia-500/20 to-amber-500/20 border border-primary/30 flex items-center justify-center mb-4 text-primary shadow-inner">
                  <Film size={28} />
                </div>
                <h4 className="text-sm font-bold text-text mb-1">Henüz öne çıkan story eklenmedi</h4>
                <p className="text-xs text-muted max-w-md mb-5 leading-relaxed">
                  Kitabınızı okuyuculara daha çekici kılmak için dikey video teaser'ları (max 20 saniye) yükleyin.
                </p>
                <Button
                  variant="primary"
                  onPress={() => setIsAddHighlightOpen(true)}
                  className="text-xs py-2.5 px-5 font-bold cursor-pointer w-full sm:w-auto"
                >
                  <PlusCircle size={15} className="mr-1.5" />
                  İlk Story'ni Yükle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {highlights.map((h, idx) => (
                  <div
                    key={h.id || idx}
                    className="relative bg-muted/10 border border-border/60 hover:border-border rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all group"
                  >
                    {/* Üst Bilgi: Sıra & Süre */}
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-card border border-border/60 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-text shrink-0">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-text truncate">
                          {h.title}
                        </h4>
                      </div>
                      <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30 shrink-0">
                        {h.duration ? `${Math.round(h.duration)} sn` : 'Story'}
                      </span>
                    </div>

                    {/* İlişkili Bölüm Rozeti */}
                    <div className="flex items-center gap-1 text-[10px] font-medium truncate mb-2">
                      {h.chapterTitle ? (
                        <span className="inline-flex items-center gap-1 text-primary truncate">
                          <BookOpen size={11} className="shrink-0" />
                          <span className="truncate">{h.chapterTitle}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted/80 truncate">
                          <Sparkles size={11} className="shrink-0 text-amber-500/70" />
                          <span>Genel Tanıtım</span>
                        </span>
                      )}
                    </div>

                    {/* 9:16 Video / Thumbnail Önizleme Konteyneri */}
                    <div
                      onClick={() => setPreviewModalIndex(idx)}
                      className="relative w-full aspect-[9/15] bg-zinc-950 rounded-xl overflow-hidden border border-border/40 group-hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center mb-2.5"
                    >
                      {h.coverUrl ? (
                        <img
                          src={h.coverUrl}
                          alt={h.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <video
                          src={h.videoUrl}
                          playsInline
                          muted
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      )}

                      {/* Oynat Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 group-hover:bg-black/20 transition-all">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                          <Play size={18} className="translate-x-0.5 fill-current" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-white/90 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          Önizle
                        </span>
                      </div>
                    </div>

                    {/* Eylemler: Sıralama & Silme */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border/40">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveHighlight(idx, 'up')}
                          disabled={idx === 0}
                          className={`p-1 sm:p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/20 cursor-pointer ${
                            idx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Yukarı Taşı"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveHighlight(idx, 'down')}
                          disabled={idx === highlights.length - 1}
                          className={`p-1 sm:p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/20 cursor-pointer ${
                            idx === highlights.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Aşağı Taşı"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewModalIndex(idx)}
                          className="px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Play size={11} />
                          <span className="hidden sm:inline">Önizle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditHighlight(h)}
                          className="p-1 sm:p-1.5 text-muted hover:text-text hover:bg-muted/20 rounded-lg transition-colors cursor-pointer"
                          title="Başlık ve Bölümü Düzenle"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHighlight(h.id)}
                          className="p-1 sm:p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Yeni Öne Çıkan Ekleme Modalı (Mobil Uyumlu Bottom-Sheet) ── */}
      {isAddHighlightOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-card border-t sm:border border-border/60 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:pb-7 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
          >
            {/* Mobil Çekmece Göstergesi */}
            <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

            <button
              onClick={() => {
                if (highlightUploading) return;
                setIsAddHighlightOpen(false);
                setNewHighlightFile(null);
                setNewHighlightCoverBlob(null);
                setNewHighlightCoverPreview('');
                setNewHighlightTitle('');
                setNewHighlightChapterId('');
                if (highlightVideoInputRef.current) highlightVideoInputRef.current.value = '';
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/20 text-muted transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-amber-500" />
              <Typography variant="h3" className="text-base sm:text-lg font-bold text-text">
                Yeni Öne Çıkan Story Ekle
              </Typography>
            </div>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Dikey formatlı (9:16) ve en fazla 20 saniyelik tanıtım videonuzu seçin. Dilerseniz bu tanıtımı belirli bir bölüme bağlayabilirsiniz.
            </p>

            <div className="space-y-4">
              {/* Video Seçim Alanı */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Dikey Video Dosyası (Maks. 20 sn, maks. 25MB)
                </label>
                
                <input
                  ref={highlightVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleSelectHighlightVideo}
                  disabled={highlightUploading}
                  className="hidden"
                  id="highlight-video-picker"
                />

                {!newHighlightFile ? (
                  <button
                    type="button"
                    onClick={() => highlightVideoInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-border/80 hover:border-primary/80 rounded-2xl bg-muted/5 hover:bg-primary/5 transition-all cursor-pointer text-center group active:scale-[0.99]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-text block">Dikey Video Seç</span>
                      <span className="text-xs text-muted">Galeriden veya dosyalardan seçin (Maks. 20 sn)</span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/10 border border-border/60 rounded-2xl">
                    {/* Canlı Video Önizleme */}
                    <div className="w-14 h-20 bg-zinc-950 rounded-xl overflow-hidden shrink-0 border border-border/60 flex items-center justify-center relative">
                      {newHighlightCoverPreview ? (
                        <video
                          src={newHighlightCoverPreview}
                          playsInline
                          muted
                          autoPlay
                          loop
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <Film size={20} className="text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-text truncate">{newHighlightFile.name}</p>
                      <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        Süre: {newHighlightDuration > 0 ? `${Math.round(newHighlightDuration * 10) / 10} sn` : 'Hesaplanıyor...'} (Uygun ✓)
                      </p>
                      <p className="text-[10px] text-muted">
                        Boyut: {(newHighlightFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewHighlightFile(null);
                        setNewHighlightCoverBlob(null);
                        setNewHighlightCoverPreview('');
                        setNewHighlightDuration(0);
                        if (highlightVideoInputRef.current) highlightVideoInputRef.current.value = '';
                      }}
                      disabled={highlightUploading}
                      className="p-2 text-muted hover:text-red-400 cursor-pointer active:scale-95"
                      title="Değiştir"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Başlık Alanı */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Öne Çıkan Başlığı (Daire Altında Görünür)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={newHighlightTitle}
                  onChange={(e) => setNewHighlightTitle(e.target.value)}
                  placeholder="Örn: Fragman, Karakterler, Bölüm 1..."
                  disabled={highlightUploading}
                  className="w-full bg-card border border-border/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-muted block text-right mt-1">
                  {newHighlightTitle.length} / 30
                </span>
              </div>

              {/* İlişkili Bölüm Seçimi (Opsiyonel) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    İlişkili Bölüm (Opsiyonel)
                  </label>
                  <span className="text-[10px] text-primary font-medium">
                    Story butonuna basınca bu bölüme yönlendirir
                  </span>
                </div>
                <select
                  value={newHighlightChapterId}
                  onChange={(e) => setNewHighlightChapterId(e.target.value)}
                  disabled={highlightUploading}
                  className="w-full bg-card border border-border/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="">-- Kitap Başı / Genel Tanıtım (Bölüme Bağlama) --</option>
                  {chapters.map((chap, i) => (
                    <option key={chap.chapterId} value={chap.chapterId}>
                      {chap.title ? `Bölüm ${i + 1}: ${chap.title}` : `Bölüm ${i + 1}`}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted mt-1">
                  {newHighlightChapterId 
                    ? `Okuyucu bu story'yi izlerken alttaki buton "${chapters.find(c => c.chapterId === newHighlightChapterId)?.title || 'Bu'} Bölümünü Oku" olarak değişecek.` 
                    : 'Bölüm seçmezseniz buton okuyucunun kaldığı yere veya ilk bölüme yönlendirir.'}
                </p>
              </div>

              {/* Yükleme İlerlemesi */}
              {highlightUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-muted">
                    <span>Yükleniyor ve işleniyor...</span>
                    <span>{highlightUploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${highlightUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Aksiyon Butonları (Mobilde Alt Alta, Kolay Dokunma) */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3">
                <Button
                  variant="ghost"
                  onPress={() => {
                    setIsAddHighlightOpen(false);
                    setNewHighlightFile(null);
                    setNewHighlightCoverBlob(null);
                    setNewHighlightCoverPreview('');
                    setNewHighlightTitle('');
                    setNewHighlightChapterId('');
                    if (highlightVideoInputRef.current) highlightVideoInputRef.current.value = '';
                  }}
                  disabled={highlightUploading}
                  className="text-xs font-semibold py-3 sm:py-2 px-4 w-full sm:w-auto"
                >
                  Vazgeç
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSaveHighlight}
                  disabled={highlightUploading || !newHighlightFile || !newHighlightTitle.trim()}
                  className="text-xs font-bold py-3.5 sm:py-2 px-6 cursor-pointer shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  {highlightUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Yükleniyor ({highlightUploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Öne Çıkaranlara Ekle</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Öne Çıkan Düzenleme Modalı ── */}
      {editingHighlight && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-card border-t sm:border border-border/60 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:pb-7 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
          >
            {/* Mobil Çekmece Göstergesi */}
            <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

            <button
              onClick={() => {
                if (isSavingEdit) return;
                setEditingHighlight(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/20 text-muted transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Pencil size={20} className="text-primary" />
              <Typography variant="h3" className="text-base sm:text-lg font-bold text-text">
                Öne Çıkanı Düzenle
              </Typography>
            </div>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Öne çıkan başlığını veya iliştirilen bölümü dilediğiniz gibi güncelleyin.
            </p>

            <div className="space-y-4">
              {/* Mevcut Video Önizleme */}
              <div className="flex items-center gap-3 p-3 bg-muted/10 border border-border/60 rounded-2xl">
                <div className="w-14 h-20 bg-zinc-950 rounded-xl overflow-hidden shrink-0 border border-border/60 flex items-center justify-center relative">
                  {editingHighlight.coverUrl ? (
                    <img
                      src={editingHighlight.coverUrl}
                      alt={editingHighlight.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={editingHighlight.videoUrl}
                      playsInline
                      muted
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text truncate">{editingHighlight.title}</p>
                  <p className="text-[11px] text-muted font-semibold mt-0.5">
                    Süre: {editingHighlight.duration ? `${Math.round(editingHighlight.duration)} sn` : 'Story'}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold inline-block mt-1">
                    #{editingHighlight.order}. Sıradaki Öne Çıkan
                  </span>
                </div>
              </div>

              {/* Başlık Alanı */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Öne Çıkan Başlığı
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={editHighlightTitle}
                  onChange={(e) => setEditHighlightTitle(e.target.value)}
                  placeholder="Örn: Fragman, Karakterler, Bölüm 1..."
                  disabled={isSavingEdit}
                  className="w-full bg-card border border-border/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-muted block text-right mt-1">
                  {editHighlightTitle.length} / 30
                </span>
              </div>

              {/* İlişkili Bölüm Seçimi (Opsiyonel) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    İlişkili Bölüm (Opsiyonel)
                  </label>
                  <span className="text-[10px] text-primary font-medium">
                    Story butonuna basınca bu bölüme yönlendirir
                  </span>
                </div>
                <select
                  value={editHighlightChapterId}
                  onChange={(e) => setEditHighlightChapterId(e.target.value)}
                  disabled={isSavingEdit}
                  className="w-full bg-card border border-border/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text focus:outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="">-- Genel Tanıtım (Bölüme Bağlama / Buton Çıkmaz) --</option>
                  {chapters.map((chap, i) => (
                    <option key={chap.chapterId} value={chap.chapterId}>
                      {chap.title ? `Bölüm ${i + 1}: ${chap.title}` : `Bölüm ${i + 1}`}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted mt-1">
                  {editHighlightChapterId 
                    ? `Okuyucu bu story'yi izlerken alttaki buton "${chapters.find(c => c.chapterId === editHighlightChapterId)?.title || 'Bu'} Bölümünü Oku" olarak görünecektir.` 
                    : 'Genel Tanıtım seçildiğinde story izlenirken alttaki bölüm oku butonu görünmeyecektir.'}
                </p>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3">
                <Button
                  variant="ghost"
                  onPress={() => setEditingHighlight(null)}
                  disabled={isSavingEdit}
                  className="text-xs font-semibold py-3 sm:py-2 px-4 w-full sm:w-auto"
                >
                  Vazgeç
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSaveEditHighlight}
                  disabled={isSavingEdit || !editHighlightTitle.trim()}
                  className="text-xs font-bold py-3.5 sm:py-2 px-6 cursor-pointer shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stüdyo İçi Önizleme Modalı ── */}
      {previewModalIndex !== null && highlights[previewModalIndex] && (
        <StoryHighlightsModal
          isOpen={previewModalIndex !== null}
          onClose={() => setPreviewModalIndex(null)}
          highlights={highlights}
          initialIndex={previewModalIndex}
          storyTitle={title || 'Hikaye Tanıtımı'}
          authorName={story?.authorName || 'Yazar'}
          authorAvatar={story?.coverImage || story?.authorAvatarUrl}
          onReadStory={(chapterId) => {
            const targetId = chapterId || (chapters.length > 0 ? chapters[0].chapterId : null);
            if (targetId) {
              window.open(`/read/${storyId}/${targetId}`, '_blank');
            } else {
              toast.info('Önizleme modu: Henüz bir bölüm bulunmuyor.');
            }
          }}
        />
      )}
    </div>
  );
}
