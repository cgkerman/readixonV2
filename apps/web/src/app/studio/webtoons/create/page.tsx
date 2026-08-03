'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { ArrowLeft, X, GalleryVertical } from 'lucide-react';
import { createStory, useAuthStore, POPULAR_TAGS } from '@readixon/core';
import { toast } from "sonner";
import Link from 'next/link';

export default function CreateWebtoonPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const toggleTag = (tagId: string) => {
    setNewTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCreate = async () => {
    if (!firebaseUser || !newTitle.trim()) return;

    setIsCreating(true);
    try {
      const newStoryId = await createStory(firebaseUser.uid, {
        title: newTitle.trim(),
        summary: '',
        coverImage: '',
        tags: newTags,
        isAdultContent,
        status: 'draft',
        format: 'webtoon' // Explicitly set format as webtoon
      });
      toast.success("Webtoon serisi başarıyla oluşturuldu!");
      router.push(`/studio/webtoons/${newStoryId}`);
    } catch (error) {
      console.error("Webtoon oluşturulamadı:", error);
      toast.error("Seri oluşturulamadı.");
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <Link href="/studio/webtoons" className="inline-flex items-center gap-2 text-muted hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={20} />
        <span className="font-medium">Webtoonlarıma Dön</span>
      </Link>

      <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <GalleryVertical size={32} />
          </div>
          <div>
            <Typography variant="h1" className="text-3xl">Yeni Webtoon Serisi</Typography>
            <Typography variant="body" className="text-muted mt-1">
              Okuyucularınızı çizeceğiniz dünyalara davet etme vakti.
            </Typography>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <Input
              label="Serinin Adı"
              placeholder="Örn: Solo Leveling"
              value={newTitle}
              onChangeText={setNewTitle}
              className="text-lg"
            />
          </div>

          <div>
            <Typography variant="body" className="font-medium text-text ml-1 mb-3">Kategoriler (En fazla 3 adet)</Typography>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map(tag => {
                const isSelected = newTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    disabled={!isSelected && newTags.length >= 3}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-background text-muted hover:text-text border border-border/50 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-border/50">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="pt-1">
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                  isAdultContent ? 'bg-primary border-primary' : 'bg-background border-border group-hover:border-primary/50'
                }`}>
                  {isAdultContent && <X size={16} className="text-primary-foreground" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={isAdultContent}
                  onChange={(e) => setIsAdultContent(e.target.checked)}
                />
              </div>
              <div>
                <span className="font-bold text-text text-lg block group-hover:text-primary transition-colors">Yetişkin İçerik (+18)</span>
                <Typography variant="caption" className="text-muted mt-1 block">
                  Bu webtoon yoğun argo, kanlı şiddet sahneleri veya yetişkinlere yönelik temalar içeriyor mu?
                </Typography>
              </div>
            </label>
          </div>

          <div className="pt-8 flex justify-end">
            <Button 
              variant="primary" 
              onPress={handleCreate} 
              disabled={!newTitle.trim() || isCreating}
              className="px-8 py-3 text-lg rounded-xl shadow-xl shadow-primary/20"
            >
              {isCreating ? 'Oluşturuluyor...' : 'Seriyi Oluştur'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
