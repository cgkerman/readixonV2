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
  Heart
} from 'lucide-react';
import {
  getStoryById,
  updateStory,
  createChapter,
  fetchChapters,
  type Story,
  type Chapter,
  type StoryStatus,
  type Contributor,
  compressImage
} from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
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
  const [activeTab, setActiveTab] = useState<'chapters' | 'details'>('chapters');
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<StoryStatus>('draft');
  const [foreword, setForeword] = useState('');
  const [backCover, setBackCover] = useState('');
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [trailerVideoUrl, setTrailerVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

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
        setCoverImage(realStory.coverImage || '');
        setStatus(realStory.status || 'draft');
        setForeword(realStory.foreword || '');
        setBackCover(realStory.backCover || '');
        setTrailerVideoUrl(realStory.trailerVideoUrl || '');

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
      const validContributors = contributors.filter(c => c.name.trim().length > 0);
      await updateStory(storyId, {
        title,
        summary,
        coverImage,
        status,
        foreword,
        backCover,
        trailerVideoUrl,
        contributors: validContributors
      });
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
      await updateStory(storyId, {
        title,
        summary,
        coverImage,
        status,
        foreword,
        backCover,
        trailerVideoUrl,
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
  }, [title, summary, coverImage, status, foreword, backCover, contributors, trailerVideoUrl, loading, story]);

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
    try {
      const titlePrefix = story?.format === 'webtoon' ? 'Episod' : 'Bölüm';
      const newChapId = await createChapter(storyId, {
        title: `${titlePrefix} ${chapters.length + 1}`,
        order: chapters.length + 1,
        contentBlocks: []
      });
      if (story?.format === 'webtoon') {
        router.push(`/studio/webtoons/${storyId}/episodes/${newChapId}`);
      } else {
        router.push(`/studio/story/${storyId}/chapter/${newChapId}`);
      }
    } catch (e) {
      toast.error("Bölüm oluşturulamadı.");
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
    switch (s) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Yayında (Devam Ediyor)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <CheckCircle size={12} />
            Tamamlandı
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
            <h1 className="text-xl sm:text-2xl font-bold text-text truncate">
              {title || 'İsimsiz Hikaye'}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Hikayenizin bölümlerini, vitrinini ve yazar araçlarını yönetin.
            </p>
          </div>

          {/* İstatistik Rozetleri */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-muted/10 px-3.5 py-2 rounded-xl border border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <BookOpen size={14} className="text-primary" />
              <span className="font-bold text-text">{chapters.length}</span> Bölüm
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

      {/* ── 4. Sekme Barı (Bölümler vs. Kitap Bilgileri) ── */}
      <div className="flex items-center gap-2 border-b border-border/60 mb-6 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('chapters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'chapters'
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          <BookOpen size={16} />
          <span>{story?.format === 'webtoon' ? 'Episodlar & Kurgu' : 'Bölümler & Kurgu'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'chapters' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
          }`}>
            {chapters.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          <Settings size={16} />
          <span>Kitap Bilgileri & Vitrin</span>
        </button>
      </div>

      {/* ── 5. Sekme: Bölümler ve Yazar Araçları ── */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          {/* Bölüm Listesi Kartı */}
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border/60 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <Typography variant="h3" className="font-bold text-base sm:text-lg">
                  {story?.format === 'webtoon' ? 'Episod Listesi' : 'Bölüm Listesi'}
                </Typography>
                <p className="text-xs text-muted mt-0.5">
                  Yazmak veya düzenlemek istediğiniz bölüme dokunun.
                </p>
              </div>
              <Button 
                variant="primary" 
                onPress={handleAddChapter} 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 px-4 cursor-pointer font-semibold shadow-md shadow-primary/20"
              >
                <PlusCircle size={16} />
                <span>{story?.format === 'webtoon' ? 'Yeni Episod Ekle' : 'Yeni Bölüm Ekle'}</span>
              </Button>
            </div>

            {/* Bölümler veya Boş Durum */}
            {chapters.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-border/40 rounded-xl bg-muted/5 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <BookOpen size={24} />
                </div>
                <h4 className="font-semibold text-text text-sm sm:text-base">
                  {story?.format === 'webtoon' ? 'Henüz episod eklenmemiş' : 'Henüz hiç bölüm eklenmemiş'}
                </h4>
                <p className="text-xs text-muted max-w-sm mt-1 mb-4">
                  Hikayenizin ilk bölümünü oluşturarak yazmaya hemen başlayabilirsiniz.
                </p>
                <Button 
                  variant="outline" 
                  onPress={handleAddChapter}
                  className="text-xs cursor-pointer"
                >
                  <PlusCircle size={14} className="mr-1.5" /> İlk Bölümü Oluştur
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
                      </div>
                      <p className="text-xs text-muted mt-0.5">Düzenlemek için dokunun</p>
                    </div>
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
              {/* Kurgu Sihirbazı */}
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
                <Typography variant="caption" className="font-bold text-muted uppercase block mb-2">
                  Yayın Durumu
                </Typography>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-muted/10 border border-border/60 rounded-xl p-3 text-xs sm:text-sm text-text focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="draft">Taslak (Sadece siz görebilirsiniz)</option>
                    <option value="ongoing">Yayında (Devam Ediyor)</option>
                    <option value="completed">Yayında (Tamamlandı)</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-muted">
                    <ChevronDown size={18} />
                  </div>
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
    </div>
  );
}
