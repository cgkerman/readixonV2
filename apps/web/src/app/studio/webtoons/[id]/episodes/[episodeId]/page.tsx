'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { ArrowLeft, Save, PlusCircle, Trash2, ArrowUp, ArrowDown, GripVertical, Image as ImageIcon, Sparkles, HelpCircle, BarChart2, X, Plus, CheckCircle, Clock } from 'lucide-react';
import { 
  getStoryById, 
  fetchChapter, 
  updateChapter, 
  sliceAndCompressWebtoonImage,
  type Story, 
  type Chapter,
  type ContentBlock
} from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

type WebtoonImage = {
  id: string; // unique local ID
  url?: string; // from server
  file?: File; // newly uploaded
  previewUrl?: string; // object URL for newly uploaded
};

export default function WebtoonEpisodeEditor() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  const episodeId = params.episodeId as string;
  const queryClient = useQueryClient();

  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [images, setImages] = useState<WebtoonImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!storyId || !episodeId) return;

    const fetchData = async () => {
      try {
        const [fetchedStory, fetchedChapter] = await Promise.all([
          getStoryById(storyId),
          fetchChapter(storyId, episodeId)
        ]);

        if (fetchedStory) setStory(fetchedStory);
        if (fetchedChapter) {
          setChapter(fetchedChapter);
          
          // Map existing content blocks
          const existingImages = fetchedChapter.contentBlocks
            .filter(b => b.type === 'image' && b.url)
            .map((b: any, i: number) => ({
              id: `existing_${i}_${Date.now()}`,
              url: b.url
            }));
          setImages(existingImages);
        }
      } catch (err) {
        console.error(err);
        toast.error("Veriler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storyId, episodeId]);

  const [isSlicing, setIsSlicing] = useState(false);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setIsSlicing(true);
    const selectedFiles = Array.from(e.target.files);
    const newImagesList: WebtoonImage[] = [];

    try {
      for (let f = 0; f < selectedFiles.length; f++) {
        const file = selectedFiles[f];
        // Slice the image if it's too tall
        const slices = await sliceAndCompressWebtoonImage(file);
        
        for (let s = 0; s < slices.length; s++) {
          const sliceFile = slices[s];
          newImagesList.push({
            id: `new_${Date.now()}_${f}_${s}`,
            file: sliceFile,
            previewUrl: URL.createObjectURL(sliceFile)
          });
        }
      }

      setImages(prev => [...prev, ...newImagesList]);
    } catch (err) {
      console.error(err);
      toast.error("Görseller işlenirken bir hata oluştu.");
    } finally {
      setIsSlicing(false);
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    
    setImages(newImages);
  };

  const handleSave = async (targetStatus: 'draft' | 'published' = 'published') => {
    if (!chapter) return;
    setSaving(true);
    
    try {
      const finalBlocks: ContentBlock[] = [];
      
      // Upload new images and keep existing URLs
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.url) {
          finalBlocks.push({ type: 'image', url: img.url });
        } else if (img.file) {
          // It's already sliced and compressed, just upload
          const path = `stories/${storyId}/episodes/${episodeId}/${Date.now()}_${i}.webp`;
          const uploadedUrl = await uploadFile(img.file, path);
          finalBlocks.push({ type: 'image', url: uploadedUrl });
        }
      }

      await updateChapter(storyId, episodeId, {
        contentBlocks: finalBlocks,
        endActivity: chapter.endActivity,
        status: targetStatus
      });

      // Clear frontend cache so new chapter count shows up immediately
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['webtoons'] });

      toast.success("Episod başarıyla kaydedildi.");
      router.push(`/studio/webtoons/${storyId}`);
    } catch (err) {
      console.error(err);
      toast.error("Episod kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-background text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <Typography variant="body" className="text-muted">Yükleniyor...</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border/20 bg-card z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/studio/webtoons/${storyId}`)}
            className="p-2 rounded-full hover:bg-muted/10 transition-colors text-muted hover:text-text"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <Typography variant="h3" className="font-bold">{chapter?.title || 'Episod'}</Typography>
            <Typography variant="caption" className="text-muted">{story?.title}</Typography>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {chapter?.status === 'published' && (
            <div className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle size={14} />
              Yayında
            </div>
          )}
          {chapter?.status === 'draft' && (
            <div className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full flex items-center gap-1">
              <Clock size={14} />
              Taslak
            </div>
          )}
          <Button 
            variant="outline" 
            onPress={() => handleSave('draft')} 
            disabled={saving}
          >
            Taslak Kaydet
          </Button>
          <Button 
            variant="primary" 
            onPress={() => handleSave('published')} 
            disabled={saving || images.length === 0}
            className="flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Save size={18} />
            {saving ? 'Kaydediliyor...' : 'Yayınla'}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-card border border-border/20 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <Typography variant="h3" className="mb-1">Kesitleri (Slicelar) Yükle</Typography>
              <Typography variant="body" className="text-muted text-sm max-w-lg">
                Webtoon epizodları dikey kesitlerin uç uca eklenmesiyle oluşur. 
                Görselleri çoklu seçebilir, sonrasında oklarla sırasını ayarlayabilirsiniz.
                Platform görselleri optimize edecek ve WebP'ye dönüştürecektir.
              </Typography>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFilesSelect} 
            />
            <Button 
              variant="outline" 
              className="shrink-0 flex items-center gap-2 shadow-lg"
              onPress={() => fileInputRef.current?.click()}
            >
              <PlusCircle size={20} />
              Görsel Seç / Ekle
            </Button>
          </div>

          <div className="space-y-4">
            {isSlicing ? (
              <div className="py-24 text-center border-2 border-dashed border-primary/50 rounded-2xl bg-primary/5 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <Typography variant="h3" className="mb-2">Görselleriniz İşleniyor</Typography>
                <Typography variant="body" className="text-muted max-w-md mx-auto">Çok uzun dikey görseller analiz edilip webtoon standardına uygun olarak dilimleniyor (Slice) ve WebP formatına dönüştürülüyor...</Typography>
              </div>
            ) : images.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-border/20 rounded-2xl bg-card/10">
                <ImageIcon size={48} className="mx-auto text-muted/30 mb-4" />
                <Typography variant="h3" className="mb-2">Görsel Yok</Typography>
                <Typography variant="body" className="text-muted mb-4 max-w-sm mx-auto">PNG, JPG, BMP veya WebP. Çok uzun dikey görseller (örn: 800x15000px) arka planda otomatik olarak dilimlere ayrılır.</Typography>
                <Button variant="outline" onPress={() => fileInputRef.current?.click()}>
                  Görsel Yükle
                </Button>
              </div>
            ) : (
              images.map((img, idx) => (
                <div key={img.id} className="flex items-stretch bg-card border border-border/30 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                  
                  {/* Sorting Handle & Info */}
                  <div className="w-16 bg-muted/5 border-r border-border/10 flex flex-col items-center justify-center gap-4 py-4 text-muted shrink-0">
                    <button 
                      onClick={() => moveImage(idx, 'up')} 
                      disabled={idx === 0}
                      className="hover:text-primary disabled:opacity-30 disabled:hover:text-muted transition-colors"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <Typography variant="caption" className="font-bold opacity-50">{idx + 1}</Typography>
                    <button 
                      onClick={() => moveImage(idx, 'down')} 
                      disabled={idx === images.length - 1}
                      className="hover:text-primary disabled:opacity-30 disabled:hover:text-muted transition-colors"
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>

                  {/* Image Preview */}
                  <div className="flex-1 p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
                    <img 
                      src={img.url || img.previewUrl} 
                      alt={`slice-${idx}`} 
                      className="max-h-[300px] object-contain rounded shadow-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="w-16 border-l border-border/10 flex flex-col items-center justify-center py-4 shrink-0">
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-400/10 p-3 rounded-full transition-colors"
                      title="Kesiti Sil"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
          
          {images.length > 0 && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onPress={() => fileInputRef.current?.click()}
                className="rounded-full shadow-md"
              >
                + Kesit Ekle
              </Button>
            </div>
          )}

        </div>

        {/* Bölüm Sonu Aktivitesi */}
        <div className="max-w-4xl mx-auto mt-8 bg-card p-4 md:p-8 rounded-2xl border border-border/20 shadow-sm mb-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="h3" className="mb-1 flex items-center gap-2">
                <Sparkles className="text-primary" /> Episod Sonu Aktivitesi
              </Typography>
              <Typography variant="caption" className="text-muted">Okuyucularla etkileşimi artırmak için episod sonuna bir soru veya anket ekleyin.</Typography>
            </div>
            {chapter?.endActivity && (
              <Button 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10"
                onPress={() => setChapter(chapter ? { ...chapter, endActivity: undefined } : null)}
              >
                <Trash2 size={16} className="mr-2" /> Kaldır
              </Button>
            )}
          </div>

          {!chapter?.endActivity ? (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 py-8 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
                onPress={() => setChapter(chapter ? { ...chapter, endActivity: { type: 'question', question: '' } } : null)}
              >
                <HelpCircle size={28} className="text-primary" />
                <Typography variant="body" className="font-bold">Açık Uçlu Soru Ekle</Typography>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 py-8 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
                onPress={() => setChapter(chapter ? { ...chapter, endActivity: { type: 'poll', question: '', options: ['', ''] } } : null)}
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
                  onChangeText={(val) => setChapter(chapter ? { ...chapter, endActivity: { ...chapter.endActivity!, question: val } } : null)}
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
                            if (!chapter) return;
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
                              if (!chapter) return;
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
                        if (!chapter) return;
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
      </main>
    </div>
  );
}
