'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, BlockEditor, Input, ContentRenderer } from '@readixon/ui';
import { ArrowLeft, Save, PlusCircle, CheckCircle, FileText, Globe, Calendar, GripVertical, Trash2, Sparkles, Wand2, Eye, EyeOff, Info, X } from 'lucide-react';
import { fetchChapter, updateChapter, compressImage, fetchChapters, createChapter, deleteChapter, createNotification, getUserFollowerIds, getStoryById, useAuthStore, trackWordCount, trackInteraction, type Chapter } from '@readixon/core';
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

      {/* ── Mobil için Üst Bar (Sidebar yerine) ── */}
      <div className="lg:hidden w-full p-4 border-b border-border/50 bg-card/30 flex items-center justify-between">
         <Button variant="ghost" onPress={() => router.push(`/studio/story/${storyId}`)} className="-ml-2">
          <ArrowLeft className="mr-2" size={18} /> Geri
        </Button>
        <Typography variant="body" className="font-bold truncate">{chapter.title || 'Bölüm Düzenle'}</Typography>
        <Button variant="ghost" className="p-2 text-primary" onPress={handleCreateNewChapter}>
            <PlusCircle size={20} />
        </Button>
      </div>

      {/* ── Main Content (Sağ Sütun) ── */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Typography variant="h2" className="mb-2">Bölüm Düzenle</Typography>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Select UI */}
              <div className="bg-card border border-border/40 rounded-full flex items-center p-1 shadow-sm">
                <button 
                  onClick={() => setChapter({ ...chapter, status: 'draft' })}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-bold transition-all ${chapter.status === 'draft' ? 'bg-muted text-background' : 'text-muted hover:bg-muted/10'}`}
                >
                  <FileText size={14} /> Taslak
                </button>
                <button 
                  onClick={() => setChapter({ ...chapter, status: 'published' })}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-bold transition-all ${chapter.status === 'published' ? 'bg-green-500 text-white shadow-md' : 'text-muted hover:bg-muted/10'}`}
                >
                  <Globe size={14} /> Yayınla
                </button>
                <button 
                  onClick={() => setChapter({ ...chapter, status: 'scheduled' })}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-bold transition-all ${chapter.status === 'scheduled' ? 'bg-blue-500 text-white shadow-md' : 'text-muted hover:bg-muted/10'}`}
                >
                  <Calendar size={14} /> Planlı
                </button>
              </div>

              <Button variant="ghost" onPress={handleDeleteChapter} className="rounded-full p-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors">
                <Trash2 size={20} />
              </Button>

              <Button 
                variant="outline" 
                onPress={() => setIsPlannerOpen(!isPlannerOpen)} 
                className="rounded-full px-4 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
              >
                <Wand2 size={16} className="mr-2 hidden md:inline-block" /> 
                Plan Notlarım
              </Button>

              <Button 
                variant="outline" 
                onPress={() => setIsAIAssistantOpen(true)} 
                className="rounded-full px-4 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
              >
                <Sparkles size={16} className="mr-2" /> AI Asistan
              </Button>

              <Button 
                variant="outline" 
                onPress={() => setIsPreviewMode(!isPreviewMode)} 
                className={`rounded-full px-4 transition-colors ${isPreviewMode ? 'bg-primary/10 border-primary text-primary' : 'border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40'}`}
              >
                {isPreviewMode ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                {isPreviewMode ? 'Düzenle' : 'Ön İzleme'}
              </Button>

              <Button variant="primary" onPress={() => handleSave(true)} disabled={saving || autoSaveStatus === 'saving'} className="rounded-full px-6">
                <Save size={16} className="mr-2 hidden md:inline-block" /> Kaydet
              </Button>
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

          <div className="bg-card p-4 md:p-8 rounded-2xl border border-border/20 shadow-sm mb-8">
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

          <div className="mb-4 flex items-center justify-between">
            <div>
              <Typography variant="h3" className="mb-1 flex items-center gap-2">
                <FileText className="text-primary" /> İçerik Editörü
                <button 
                  onClick={() => setIsInfoModalOpen(true)} 
                  className="text-muted/60 hover:text-primary hover:bg-primary/10 p-1 rounded-full transition-all"
                  title="Editör Özelliklerini Görüntüle"
                >
                  <Info size={18} />
                </button>
              </Typography>
              <Typography variant="caption" className="text-muted">Blokları ekleyip sürükleyerek sıralarını değiştirebilirsiniz.</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography variant="caption" className="text-primary bg-primary/10 px-3 py-1 rounded-full font-bold">
                {getWordCount()} Kelime
              </Typography>
              <Typography variant="caption" className="text-primary bg-primary/10 px-3 py-1 rounded-full font-bold">
                {chapter.contentBlocks.length} Blok
              </Typography>
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border/30 shadow-inner p-2 md:p-6 min-h-[500px] mb-24">
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
          
        </div>
      </main>

      {/* ── Sticky Toolbar for AutoSave Indicator ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] flex items-center bg-background/90 backdrop-blur-md shadow-2xl rounded-full border border-border/20 px-6 py-3 min-w-[200px] justify-center pointer-events-none">
        {autoSaveStatus === 'saving' && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
            <Typography variant="caption" className="text-muted font-bold tracking-wide">Otomatik Kaydediliyor...</Typography>
          </div>
        )}
        {autoSaveStatus === 'saved' && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <CheckCircle size={16} className="text-green-500" />
            <Typography variant="caption" className="text-green-500 font-bold tracking-wide">Buluta Kaydedildi</Typography>
          </div>
        )}
        {autoSaveStatus === 'idle' && (
          <div className="flex items-center gap-2 opacity-50">
            <CheckCircle size={16} className="text-muted" />
            <Typography variant="caption" className="text-muted font-bold tracking-wide">Güncel</Typography>
          </div>
        )}
      </div>

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
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button variant="primary" onPress={() => setIsInfoModalOpen(false)} className="px-6 rounded-full">Anladım</Button>
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
