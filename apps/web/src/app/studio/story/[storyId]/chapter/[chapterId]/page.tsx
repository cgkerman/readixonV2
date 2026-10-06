'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, BlockEditor, Input, ContentRenderer } from '@readixon/ui';
import { ArrowLeft, Save, PlusCircle, CheckCircle, FileText, Globe, Calendar, GripVertical, Trash2, Sparkles, Wand2, Eye, EyeOff, Info, X, HelpCircle, BarChart2, Plus, Music, Volume2, ExternalLink, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { fetchChapter, updateChapter, compressImage, fetchChapters, createChapter, deleteChapter, createNotification, getUserFollowerIds, getStoryById, updateStory, useAuthStore, trackWordCount, trackInteraction, parseAudioTrack, getAudioPlatformLabel, type Chapter, type ChapterAudioTrack } from '@readixon/core';
import { ReadixonAIAssistant } from '@/components/ReadixonAIAssistant';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { toast } from "sonner";
import Link from 'next/link';
import { PlannerSidebar } from './PlannerSidebar';

export default function ChapterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;
  const chapterId = params.chapterId as string;

  const { userProfile } = useAuthStore();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAudioSectionOpen, setIsAudioSectionOpen] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(false);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  
  const isInitialLoad = useRef(true);
  const publishedRef = useRef(false);
  const initialWordCountRef = useRef<number | null>(null);

  useEffect(() => {
    loadData();
  }, [storyId, chapterId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, chaps] = await Promise.all([
        fetchChapter(storyId, chapterId),
        fetchChapters(storyId)
      ]);
      
      setAllChapters(chaps || []);

      if (data) {
        if (!data.status) data.status = 'draft';
        if (data.status === 'published') publishedRef.current = true;
        setChapter(data);
      } else {
        setChapter({
          chapterId,
          title: 'Yeni Bölüm',
          order: chaps.length + 1,
          contentBlocks: [],
          status: 'draft',
          publishDate: new Date().toISOString() as any
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDatetimeLocal = (timestamp: any) => {
    if (!timestamp) return '';
    if (timestamp.toDate) {
      const d = timestamp.toDate();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    }
    if (typeof timestamp === 'string' || timestamp instanceof Date) {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    }
    return '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (!dateStr) return;
    const date = new Date(dateStr);
    setChapter(prev => prev ? { ...prev, publishDate: date as any } : null);
  };

  const handleSave = async (manual = false) => {
    if (!chapter) return;
    
    // Check if status changed from draft to published
    const isPublishingNow = chapter.status === 'published';
    const shouldNotify = !publishedRef.current && isPublishingNow;

    if (shouldNotify) {
      publishedRef.current = true;
    }

    if (manual) setSaving(true);
    else setAutoSaveStatus('saving');
    
    try {
      await updateChapter(storyId, chapterId, chapter);

      if (shouldNotify && userProfile) {
        const storyData = await getStoryById(storyId);
        if (storyData) {
          if (storyData.status === 'draft') {
            await updateStory(storyId, { status: 'ongoing' });
            toast.success("Hikaye taslaktan çıkartılıp 'Devam Ediyor' olarak işaretlendi.");
          }
          const followerIds = await getUserFollowerIds(userProfile.uid);
          const notificationsPromises = followerIds.map(fId => 
            createNotification({
              userId: fId,
              actorId: userProfile.uid,
              actorName: userProfile.displayName || userProfile.username,
              actorAvatar: userProfile.avatarUrl,
              actorUsername: userProfile.username,
              type: 'new_chapter',
              entityId: storyId,
              entityTitle: `${storyData.title}`
            }).catch(e => console.error("Notification send error", e))
          );
          await Promise.all(notificationsPromises);
          if (followerIds.length > 0) {
            toast.success("Takipçilerinize yeni bölüm bildirimi gönderildi.");
          }
        }
      }

      if (manual) {
        toast.success('Bölüm başarıyla kaydedildi!');
      } else {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
      
      // Update local chapters list to reflect title changes instantly
      setAllChapters(prev => prev.map(c => c.chapterId === chapterId ? { ...c, title: chapter.title, status: chapter.status } : c));

      if (userProfile) {
        if (shouldNotify) {
          trackInteraction(userProfile.uid, 'chapter_published').catch(e => console.error("Badge error:", e));
        }
        
        if (manual) {
          const currentWords = getWordCount();
          if (initialWordCountRef.current !== null && currentWords > initialWordCountRef.current) {
            const addedWords = currentWords - initialWordCountRef.current;
            trackWordCount(userProfile.uid, addedWords).catch(e => console.error("Word tracking error:", e));
            initialWordCountRef.current = currentWords; // Reset to new baseline
          }
        }
      }
    } catch (error) {
      if (manual) toast.error('Kaydetme başarısız oldu.');
      else setAutoSaveStatus('idle');
    } finally {
      if (manual) setSaving(false);
    }
  };

  // Auto-Save Effect
  useEffect(() => {
    if (isInitialLoad.current) {
      if (!loading && chapter) {
        isInitialLoad.current = false;
        if (initialWordCountRef.current === null) {
          initialWordCountRef.current = getWordCount();
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      handleSave(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [chapter, loading]);

  const handleCreateNewChapter = async () => {
    try {
      const newChapId = await createChapter(storyId, {
        title: `Bölüm ${allChapters.length + 1}`,
        order: allChapters.length + 1,
        contentBlocks: [],
        status: 'draft'
      });
      router.push(`/studio/story/${storyId}/chapter/${newChapId}`);
    } catch (e) {
      toast.error("Yeni bölüm oluşturulamadı.");
    }
  };

  const handleDeleteChapter = async () => {
    if (!window.confirm("Bu bölümü kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    try {
      await deleteChapter(storyId, chapterId);
      toast.success("Bölüm başarıyla silindi.");
      
      const remainingChapters = allChapters.filter(c => c.chapterId !== chapterId);
      if (remainingChapters.length > 0) {
        router.push(`/studio/story/${storyId}/chapter/${remainingChapters[0].chapterId}`);
      } else {
        router.push(`/studio/story/${storyId}`);
      }
    } catch (e) {
      toast.error("Bölüm silinemedi. Lütfen yetkilerinizi kontrol edin.");
    }
  };

  const handleUploadImage = async (file: File) => {
    const compressedFile = await compressImage(file, 1200, 1200, 0.85);
    return await uploadFile(compressedFile, `stories/${storyId}/${chapterId}-${Date.now()}`);
  };

  const getWordCount = () => {
    if (!chapter?.contentBlocks) return 0;
    return chapter.contentBlocks.reduce((acc, block) => {
      if (!block.text) return acc;
      // Strip HTML tags for accurate word count
      const plainText = block.text.replace(/<[^>]*>?/gm, '');
      const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
      return acc + words.length;
    }, 0);
  };

  if (loading || !chapter) {
    return <div className="p-8 text-center"><Typography variant="body">Yükleniyor...</Typography></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] w-full bg-background">
      
      {/* ── Sidebar (Sol Sütun) ── */}
      <aside className="w-full lg:w-80 flex-shrink-0 border-r border-border/50 bg-card/30 p-6 flex flex-col hidden lg:flex">
        <Button variant="ghost" onPress={() => router.push(`/studio/story/${storyId}`)} className="mb-6 self-start -ml-2">
          <ArrowLeft className="mr-2" size={18} /> Hikayeye Dön
        </Button>
        
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h3" className="font-bold">Bölümler ({allChapters.length})</Typography>
          <Button variant="ghost" className="p-2 text-primary" onPress={handleCreateNewChapter}>
            <PlusCircle size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {allChapters.sort((a,b) => a.order - b.order).map(c => {
            const isActive = c.chapterId === chapterId;
            return (
              <Link key={c.chapterId} href={`/studio/story/${storyId}/chapter/${c.chapterId}`}>
                <div className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isActive ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card border-border/40 hover:border-primary/50'}`}>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <Typography variant="body" className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-text'}`}>
                      {c.title || 'İsimsiz Bölüm'}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Typography variant="caption" className="text-muted">Bölüm {c.order}</Typography>
                      <span className="text-muted/30">•</span>
                      <Typography variant="caption" className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${c.status === 'published' ? 'bg-green-500/10 text-green-500' : c.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted/20 text-muted'}`}>
                        {c.status === 'published' ? 'YAYINDA' : c.status === 'scheduled' ? 'PLANLI' : 'TASLAK'}
                      </Typography>
                    </div>
                  </div>
                  <GripVertical size={16} className="text-muted/30" />
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* ── Mobil için Üst Bar (Hızlı Bölüm Seçici Entegre) ── */}
      <div className="lg:hidden w-full px-3 py-2.5 border-b border-border/50 bg-card/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-2">
        <Button 
          variant="ghost" 
          onPress={() => router.push(`/studio/story/${storyId}`)} 
          className="p-2 -ml-1 text-muted hover:text-text cursor-pointer shrink-0"
          aria-label="Hikayeye Dön"
        >
          <ArrowLeft size={18} />
        </Button>

        {/* Tıklanabilir Hızlı Bölüm Seçici Hapı */}
        <button
          type="button"
          onClick={() => setIsChapterDrawerOpen(true)}
          className="flex-1 min-w-0 max-w-[240px] mx-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/15 hover:bg-muted/25 border border-border/60 transition-all cursor-pointer active:scale-95"
          aria-label="Bölüm Değiştir"
        >
          <span className="font-bold text-xs text-text truncate">
            {chapter.title || `Bölüm ${chapter.order}`}
          </span>
          <ChevronDown size={14} className="text-muted shrink-0" />
        </button>

        <Button 
          variant="ghost" 
          className="p-2 text-primary hover:bg-primary/10 rounded-full cursor-pointer shrink-0" 
          onPress={handleCreateNewChapter}
          aria-label="Yeni Bölüm Ekle"
        >
          <PlusCircle size={20} />
        </Button>
      </div>

      {/* ── Main Content (Sağ Sütun) ── */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 lg:p-12 pb-32 md:pb-16 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
                    {/* ── Üst Aksiyon & Kontrol Barı (Modern & Responsive 2 Katman) ── */}
          <div className="bg-card/70 border border-border/60 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs backdrop-blur-sm space-y-3">
            
            {/* 1. Satır: Yayın Durumu Seçici + Otomatik Kayıt + Kaydet Butonu + Sil */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Yayın Durumu Segment Seçici */}
              <div className="bg-muted/15 border border-border/60 rounded-xl flex items-center p-0.5 shadow-inner">
                <button 
                  type="button"
                  onClick={() => setChapter({ ...chapter, status: 'draft' })}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chapter.status === 'draft' 
                      ? 'bg-card text-foreground shadow-xs' 
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <FileText size={13} />
                  <span>Taslak</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setChapter({ ...chapter, status: 'published' })}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chapter.status === 'published' 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Globe size={13} />
                  <span>Yayınla</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setChapter({ ...chapter, status: 'scheduled' })}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chapter.status === 'scheduled' 
                      ? 'bg-sky-500 text-white shadow-xs' 
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Planlı</span>
                </button>
              </div>

              {/* Sağ: Otomatik Kayıt Durumu + Kaydet Butonu + Silme */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Otomatik Kayıt Göstergesi */}
                <div className="hidden sm:flex items-center text-xs mr-1">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-muted flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border-2 border-muted border-t-primary rounded-full animate-spin" />
                      Kaydediliyor...
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in duration-200">
                      <CheckCircle size={13} /> Kaydedildi
                    </span>
                  )}
                  {autoSaveStatus === 'idle' && (
                    <span className="text-muted/50 text-[11px]">Güncel</span>
                  )}
                </div>

                {/* Manuel Kaydet Butonu */}
                <Button 
                  variant="primary" 
                  onPress={() => handleSave(true)} 
                  disabled={saving || autoSaveStatus === 'saving'} 
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Save size={14} />
                  <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </Button>

                {/* Bölümü Sil Butonu */}
                <button 
                  type="button"
                  onClick={handleDeleteChapter} 
                  className="w-8 h-8 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Bölümü Sil"
                  aria-label="Bölümü Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* 2. Satır: Yazar Araçları Şeridi (AI Asistan, Plan Notlarım, Ön İzleme, Sayaçlar) */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 shrink-0">
                {/* AI Asistan Butonu */}
                <button 
                  type="button"
                  onClick={() => setIsAIAssistantOpen(true)} 
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/25 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>AI Asistan</span>
                </button>

                {/* Plan Notlarım Butonu */}
                <button 
                  type="button"
                  onClick={() => setIsPlannerOpen(!isPlannerOpen)} 
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isPlannerOpen 
                      ? 'border-primary bg-primary/15 text-primary font-semibold' 
                      : 'border-border/60 hover:border-primary/40 text-muted hover:text-text'
                  }`}
                >
                  <BookOpen size={13} />
                  <span>Plan Notlarım</span>
                </button>

                {/* Ön İzleme Butonu */}
                <button 
                  type="button"
                  onClick={() => setIsPreviewMode(!isPreviewMode)} 
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isPreviewMode 
                      ? 'border-primary bg-primary text-black font-semibold shadow-xs' 
                      : 'border-border/60 hover:border-primary/40 text-muted hover:text-text'
                  }`}
                >
                  {isPreviewMode ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{isPreviewMode ? 'Düzenle' : 'Ön İzleme'}</span>
                </button>
              </div>

              {/* Sağ: Canlı Sayaçlar */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {getWordCount()} Kelime
                </span>
                <span className="text-[11px] font-medium text-muted bg-muted/15 px-2 py-1 rounded-full hidden sm:inline-block">
                  {chapter.contentBlocks.length} Blok
                </span>
              </div>
            </div>
          </div>


          {chapter.status === 'scheduled' && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-blue-500">
                <Calendar size={24} />
                <div>
                  <Typography variant="body" className="font-bold">Yayınlanma Tarihi</Typography>
                  <Typography variant="caption" className="opacity-80">Bu bölüm belirlediğiniz tarih ve saatte otomatik olarak yayınlanacaktır.</Typography>
                </div>
              </div>
              <input 
                type="datetime-local" 
                className="bg-background border border-border/50 text-foreground text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 md:ml-auto outline-none transition-all"
                value={getDatetimeLocal(chapter.publishDate)}
                onChange={handleDateChange}
              />
            </div>
          )}

          <div className="bg-card p-4 md:p-8 rounded-2xl border border-border/20 shadow-sm mb-4">
            <Typography variant="caption" className="text-muted uppercase font-bold tracking-wider mb-2 block">
              Bölüm Başlığı
            </Typography>
            <Input 
              value={chapter.title} 
              onChangeText={(title) => setChapter({ ...chapter, title })} 
              placeholder="Örn: Bölüm 1 - Yeni Başlangıçlar"
              className="text-lg md:text-xl font-bold bg-transparent border-b-2 border-border/50 focus:border-primary rounded-none px-0 pb-2 shadow-none"
            />
          </div>

          {/* Bölüm Fon Müziği (Soundtrack) Accordion */}
          <div className="bg-card rounded-2xl border border-border/20 shadow-sm mb-6 transition-all overflow-hidden">
            {/* Accordion Trigger */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setIsAudioSectionOpen(!isAudioSectionOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsAudioSectionOpen(!isAudioSectionOpen);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 md:p-4 cursor-pointer hover:bg-muted/10 transition-colors select-none text-left"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  chapter.audioTrack?.url 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  <Music size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">
                      Bölüm Fon Müziği
                    </span>
                    {chapter.audioTrack?.url ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {getAudioPlatformLabel(chapter.audioTrack.platform || 'other')}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted/10 text-muted shrink-0">
                        İsteğe bağlı
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {chapter.audioTrack?.url 
                      ? (chapter.audioTrack.title ? `Aktif: ${chapter.audioTrack.title}` : chapter.audioTrack.url)
                      : 'Okuyucuya bölüm boyunca çalacak YouTube veya Spotify atmosfer müziği ekleyin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-xs text-muted hidden sm:inline-block font-medium">
                  {isAudioSectionOpen ? 'Daralt' : (chapter.audioTrack?.url ? 'Düzenle' : 'Müzik Ekle')}
                </span>
                <div className={`p-1.5 rounded-lg bg-muted/10 text-muted transition-transform duration-200 ${
                  isAudioSectionOpen ? 'rotate-180 text-foreground' : ''
                }`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Accordion Body */}
            {isAudioSectionOpen && (
              <div className="p-4 md:p-6 pt-2 border-t border-border/10 space-y-4">
                <div className="flex items-center justify-between gap-3 text-xs text-muted">
                  <p>
                    Okuyucu bu bölüme girdiğinde üst çubukta çalacak fon müziğini link ile ekleyebilirsiniz.
                  </p>
                  {chapter.audioTrack?.url && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChapter({ ...chapter, audioTrack: undefined });
                        setPreviewAudio(false);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors shrink-0 font-medium py-1 px-2 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 size={13} /> Müziği Kaldır
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="h-5 flex items-center mb-1.5">
                      <Typography variant="caption" className="text-muted uppercase font-bold tracking-wider text-[11px] truncate">
                        Müzik Bağlantısı (URL)
                      </Typography>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        value={chapter.audioTrack?.url || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          if (!url.trim()) {
                            setChapter({ ...chapter, audioTrack: undefined });
                            return;
                          }
                          const parsed = parseAudioTrack(url);
                          setChapter({
                            ...chapter,
                            audioTrack: {
                              url,
                              title: chapter.audioTrack?.title || '',
                              platform: parsed.platform
                            }
                          });
                        }}
                        placeholder="YouTube, Spotify veya MP3 linki yapıştırın..."
                        className="w-full bg-background border border-border/40 focus:border-primary rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="h-5 flex items-center mb-1.5">
                      <Typography variant="caption" className="text-muted uppercase font-bold tracking-wider text-[11px] truncate">
                        Parça / Müzik Başlığı (İsteğe Bağlı)
                      </Typography>
                    </div>
                    <input
                      type="text"
                      value={chapter.audioTrack?.title || ''}
                      onChange={(e) => {
                        const title = e.target.value;
                        if (!chapter.audioTrack?.url) {
                          setChapter({
                            ...chapter,
                            audioTrack: { url: '', title, platform: 'other' }
                          });
                        } else {
                          setChapter({
                            ...chapter,
                            audioTrack: { ...chapter.audioTrack, title }
                          });
                        }
                      }}
                      placeholder="Örn: Ludovico Einaudi - Nuvole Bianche"
                      className="w-full bg-background border border-border/40 focus:border-primary rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Önizleme Alanı */}
                {chapter.audioTrack?.url && (
                  <div className="mt-3 p-3.5 bg-background/80 rounded-xl border border-border/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                        <Volume2 size={14} className="text-primary" /> Önizleme Player
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewAudio(!previewAudio)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {previewAudio ? 'Önizlemeyi Gizle' : 'Önizlemeyi Göster ve Test Et'}
                      </button>
                    </div>

                    {previewAudio && (() => {
                      const parsed = parseAudioTrack(chapter.audioTrack.url);
                      if (parsed.platform === 'youtube' && parsed.id) {
                        return (
                          <div className="aspect-video max-w-sm rounded-lg overflow-hidden border border-border/30 bg-black mt-2">
                            <iframe
                              src={`https://www.youtube.com/embed/${parsed.id}`}
                              title="YouTube Preview"
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      if (parsed.platform === 'spotify' && parsed.embedUrl) {
                        return (
                          <div className="max-w-md rounded-xl overflow-hidden mt-2">
                            <iframe
                              src={parsed.embedUrl}
                              width="100%"
                              height="80"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            />
                          </div>
                        );
                      }
                      if (parsed.platform === 'direct') {
                        return (
                          <div className="mt-2">
                            <audio src={chapter.audioTrack.url} controls className="w-full max-w-md" />
                          </div>
                        );
                      }
                      return (
                        <p className="text-xs text-muted mt-1">
                          Bağlantı geçerli bir formatta algılanamadı, ancak okuyucu sayfasında çalınması denenecektir.
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div>
              <Typography variant="h3" className="mb-1 flex items-center gap-2 text-base md:text-xl">
                <FileText className="text-primary" size={20} /> İçerik Editörü
                <button 
                  onClick={() => setIsInfoModalOpen(true)} 
                  className="text-muted/60 hover:text-primary hover:bg-primary/10 p-1.5 rounded-full transition-all"
                  title="Editör Özelliklerini Görüntüle"
                >
                  <Info size={16} />
                </button>
              </Typography>
              <Typography variant="caption" className="text-muted text-xs md:text-sm">Blokları ekleyip sürükleyerek sıralarını değiştirebilirsiniz.</Typography>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Typography variant="caption" className="text-primary bg-primary/10 px-3 py-1 rounded-full font-bold">
                {getWordCount()} Kelime
              </Typography>
              <Typography variant="caption" className="text-primary bg-primary/10 px-3 py-1 rounded-full font-bold">
                {chapter.contentBlocks.length} Blok
              </Typography>
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border/30 shadow-inner p-2 sm:p-4 md:p-6 min-h-[450px] mb-8 md:mb-12">
            {isPreviewMode ? (
              <div className="max-w-3xl mx-auto py-8">
                <ContentRenderer blocks={chapter.contentBlocks} />
              </div>
            ) : (
              <BlockEditor 
                initialBlocks={chapter.contentBlocks}
                onChange={(blocks) => setChapter({ ...chapter, contentBlocks: blocks })}
                onUploadImage={handleUploadImage}
              />
            )}
          </div>
          
          {/* Bölüm Sonu Aktivitesi */}
          <div className="bg-card p-4 md:p-8 rounded-2xl border border-border/20 shadow-sm mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Typography variant="h3" className="mb-1 flex items-center gap-2">
                  <Sparkles className="text-primary" /> Bölüm Sonu Aktivitesi
                </Typography>
                <Typography variant="caption" className="text-muted">Okuyucularla etkileşimi artırmak için bölüm sonuna bir soru veya anket ekleyin.</Typography>
              </div>
              {chapter.endActivity && (
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:bg-destructive/10"
                  onPress={() => setChapter({ ...chapter, endActivity: undefined })}
                >
                  <Trash2 size={16} className="mr-2" /> Kaldır
                </Button>
              )}
            </div>

            {!chapter.endActivity ? (
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 py-8 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
                  onPress={() => setChapter({ ...chapter, endActivity: { type: 'question', question: '' } })}
                >
                  <HelpCircle size={28} className="text-primary" />
                  <Typography variant="body" className="font-bold">Açık Uçlu Soru Ekle</Typography>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-8 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
                  onPress={() => setChapter({ ...chapter, endActivity: { type: 'poll', question: '', options: ['', ''] } })}
                >
                  <BarChart2 size={28} className="text-primary" />
                  <Typography variant="body" className="font-bold">Anket Ekle</Typography>
                </Button>
              </div>
            ) : (
              <div className="mt-6 p-6 rounded-xl bg-background border border-border/50">
                <div className="mb-4">
                  <Typography variant="caption" className="font-bold text-muted mb-2 block">
                    {chapter.endActivity.type === 'question' ? 'Sorunuz' : 'Anket Sorusu'}
                  </Typography>
                  <Input 
                    value={chapter.endActivity.question}
                    onChangeText={(val) => setChapter({ ...chapter, endActivity: { ...chapter.endActivity!, question: val } })}
                    placeholder={chapter.endActivity.type === 'question' ? 'Okuyucularınıza ne sormak istersiniz?' : 'Anket sorusunu buraya yazın...'}
                    className="bg-card border-border/50"
                  />
                </div>

                {chapter.endActivity.type === 'poll' && chapter.endActivity.options && (
                  <div className="mt-6">
                    <Typography variant="caption" className="font-bold text-muted mb-3 block">Anket Şıkları</Typography>
                    <div className="flex flex-col gap-3">
                      {chapter.endActivity.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <Input 
                            value={opt}
                            onChangeText={(val) => {
                              const newOptions = [...chapter.endActivity!.options!];
                              newOptions[idx] = val;
                              setChapter({ ...chapter, endActivity: { ...chapter.endActivity!, options: newOptions } });
                            }}
                            placeholder={`${idx + 1}. Şık`}
                            className="bg-card border-border/50 flex-1"
                          />
                          {chapter.endActivity!.options!.length > 2 && (
                            <Button 
                              variant="ghost" 
                              className="text-muted hover:text-destructive hover:bg-destructive/10 p-2 shrink-0"
                              onPress={() => {
                                const newOptions = chapter.endActivity!.options!.filter((_, i) => i !== idx);
                                setChapter({ ...chapter, endActivity: { ...chapter.endActivity!, options: newOptions } });
                              }}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {chapter.endActivity.options.length < 5 && (
                      <Button 
                        variant="ghost" 
                        className="mt-4 text-primary hover:bg-primary/10 w-full"
                        onPress={() => {
                          const newOptions = [...chapter.endActivity!.options!, ''];
                          setChapter({ ...chapter, endActivity: { ...chapter.endActivity!, options: newOptions } });
                        }}
                      >
                        <Plus size={16} className="mr-2" /> Şık Ekle
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </main>

      {/* ── Planner Sidebar (Sağ Sütun) ── */}
      {isPlannerOpen && (
        <PlannerSidebar 
          storyId={storyId} 
          chapterId={chapterId} 
          onClose={() => setIsPlannerOpen(false)} 
        />
      )}

      {/* ── Info Modal (Editör Rehberi) ── */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 custom-scrollbar">
            <button 
              onClick={() => setIsInfoModalOpen(false)} 
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground hover:bg-muted/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <Typography variant="h2" className="mb-6 flex items-center gap-2">
              <Info className="text-primary" /> Editör Rehberi
            </Typography>
            
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <Typography variant="h4" className="text-primary mb-2 flex items-center gap-2">1. Akıllı Kopyala & Yapıştır (Tavsiye Edilen)</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Google Docs, Word veya internet üzerindeki uzun metinlerinizi kopyalayıp editöre doğrudan <b>(Ctrl+V)</b> yapıştırabilirsiniz. Metinlerinizdeki paragraflar ve listeler otomatik olarak algılanıp ayrı bloklara bölünür. Her blokla tek tek uğraşmanıza gerek kalmaz.
                </Typography>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <Typography variant="h4" className="text-foreground mb-2">2. Word (.docx) Dosyası Yükleme</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Ekranın altındaki <b>Word Yükle</b> butonunu kullanarak bilgisayarınızdaki .docx uzantılı belgeleri sisteme aktarabilirsiniz. Belge içindeki yazılar saniyeler içinde bloklara dönüşerek editöre eklenir.
                </Typography>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <Typography variant="h4" className="text-foreground mb-2">3. Anında Ön İzleme</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Sağ üstteki <b>Ön İzleme</b> butonuna basarak, yazdığınız bölümün okuyucularınıza uygulamanın içinde tam olarak nasıl görüneceğini test edebilirsiniz. İşiniz bitince tekrar <b>Düzenle</b> moduna dönebilirsiniz.
                </Typography>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <Typography variant="h4" className="text-foreground mb-2">4. Odak Modu (Tam Ekran)</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Herhangi bir paragraf bloğunun sağ üst köşesindeki <b>Genişlet</b> ikonuna tıkladığınızda, o blok tüm ekranı kaplar. Bu sayede dikkatiniz dağılmadan içeriğinize odaklanabilirsiniz (Çıkmak için ESC).
                </Typography>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <Typography variant="h4" className="text-foreground mb-2">5. AI Asistan Desteği</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Yazarken tıkandığınızda sağ üstteki <b>AI Asistan</b> butonuna tıklayarak yapay zekadan fikir alabilir, bölümü devam ettirmesini veya metninizi düzenlemesini isteyebilirsiniz.
                </Typography>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <Typography variant="h4" className="text-foreground mb-2">6. Plan Notlarım</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Bölümünüzün kurgusu, karakterler veya olay örgüsüyle ilgili aldığınız notlara hızlıca göz atmak isterseniz sağ üstteki <b>Plan Notlarım</b> butonuna tıklayarak sağ tarafta açılan defterinizi kullanabilirsiniz.
                </Typography>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <Typography variant="h4" className="text-foreground mb-2">7. Bölüm Sonu Aktiviteleri</Typography>
                <Typography variant="body" className="text-muted text-sm leading-relaxed">
                  Sayfanın en altındaki alandan bölümünüze anket veya açık uçlu soru ekleyebilirsiniz. Okuyucuların verdiği yanıtları hikaye panelindeki <b>Bölüm Aktiviteleri</b> sekmesinden takip edebilirsiniz.
                </Typography>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button variant="primary" onPress={() => setIsInfoModalOpen(false)} className="px-6 rounded-full">Anladım</Button>
            </div>
          </div>
        </div>
      )}

            {/* ── Mobil Hızlı Bölüm Değiştirici Çekmecesi (Bottom Sheet) ── */}
      {isChapterDrawerOpen && (
        <div 
          onClick={() => setIsChapterDrawerOpen(false)}
          className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-h-[82vh] flex flex-col bg-card border-t border-border/70 rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobil Çekme Tutacağı */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Çekmece Başlığı */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <Typography variant="h3" className="font-bold text-base text-text">
                  Bölümler
                </Typography>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {allChapters.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onPress={() => {
                    setIsChapterDrawerOpen(false);
                    handleCreateNewChapter();
                  }}
                  className="text-xs px-2.5 py-1 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                >
                  <PlusCircle size={14} className="mr-1" /> Yeni Bölüm
                </Button>
                <button
                  type="button"
                  onClick={() => setIsChapterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted/10 hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Bölüm Listesi */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 scrollbar-thin pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              {allChapters.sort((a, b) => a.order - b.order).map(c => {
                const isActive = c.chapterId === chapterId;
                return (
                  <div
                    key={c.chapterId}
                    onClick={() => {
                      setIsChapterDrawerOpen(false);
                      if (!isActive) {
                        router.push(`/studio/story/${storyId}/chapter/${c.chapterId}`);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-primary/15 border-primary shadow-sm ring-1 ring-primary/40' 
                        : 'bg-muted/5 border-border/50 hover:border-primary/40 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive 
                          ? 'bg-primary text-black' 
                          : 'bg-muted/20 text-muted'
                      }`}>
                        #{c.order}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-text'}`}>
                          {c.title || 'İsimsiz Bölüm'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            c.status === 'published' 
                              ? 'bg-green-500/15 text-green-400' 
                              : c.status === 'scheduled' 
                                ? 'bg-blue-500/15 text-blue-400' 
                                : 'bg-muted/20 text-muted'
                          }`}>
                            {c.status === 'published' ? 'YAYINDA' : c.status === 'scheduled' ? 'PLANLI' : 'TASLAK'}
                          </span>
                          {c.audioTrack?.url && (
                            <span className="text-[10px] text-primary flex items-center gap-0.5 font-medium">
                              <Music size={10} /> Müzikli
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-primary text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 shrink-0">
                        Şu Anki
                      </span>
                    ) : (
                      <ChevronRight size={16} className="text-muted shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      <ReadixonAIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
        currentContent={chapter.contentBlocks?.map((b: any) => b.text).join('\n') || ''} 
      />
    </div>
  );
}
