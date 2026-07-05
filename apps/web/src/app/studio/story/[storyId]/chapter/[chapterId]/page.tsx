'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, BlockEditor, Input } from '@readixon/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchChapter, updateChapter, type Chapter } from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { toast } from "sonner";

export default function ChapterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChapter();
  }, [storyId, chapterId]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const data = await fetchChapter(storyId, chapterId);
      if (data) {
        setChapter(data);
      } else {
        // Yeni bir bölüm ise mock state oluşturalım
        setChapter({
          chapterId,
          title: 'Yeni Bölüm',
          order: 1,
          contentBlocks: [],
          publishDate: new Date().toISOString() as any
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chapter) return;
    setSaving(true);
    try {
      await updateChapter(storyId, chapterId, chapter);
      toast.success('Bölüm başarıyla kaydedildi!');
    } catch (error) {
      toast.error('Kaydetme başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    return await uploadFile(file, `stories/${storyId}/${chapterId}-${Date.now()}`);
  };

  if (loading || !chapter) {
    return <div className="p-8 text-center"><Typography variant="body">Yükleniyor...</Typography></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onPress={() => router.back()} className="-ml-4">
          <ArrowLeft className="mr-2" /> Geri Dön
        </Button>
        <Button variant="primary" onPress={handleSave} disabled={saving}>
          <Save size={18} className="mr-2" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border/20 mb-8">
        <Typography variant="caption" className="text-muted uppercase font-bold tracking-wider mb-2 block">
          Bölüm Başlığı
        </Typography>
        <Input 
          value={chapter.title} 
          onChangeText={(title) => setChapter({ ...chapter, title })} 
          placeholder="Örn: Bölüm 1 - Yeni Başlangıçlar"
        />
      </div>

      <div className="mb-4">
        <Typography variant="h3" className="mb-2">İçerik Editörü</Typography>
        <Typography variant="caption" className="text-muted">Blokları ekleyip sürükleyerek sıralarını değiştirebilirsiniz.</Typography>
      </div>

      <BlockEditor 
        initialBlocks={chapter.contentBlocks}
        onChange={(blocks) => setChapter({ ...chapter, contentBlocks: blocks })}
        onUploadImage={handleUploadImage}
      />
    </div>
  );
}
