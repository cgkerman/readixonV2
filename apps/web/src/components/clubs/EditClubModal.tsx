'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Image, Tag, Lock, Globe, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from '@readixon/ui';
import { updateClub, type Club } from '@readixon/core';

interface EditClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club;
  userId: string;
  onSuccess?: (updatedClub: Club) => void;
}

const POPULAR_TAGS = ['Bilim Kurgu', 'Fantastik', 'Polisiye & Gizem', 'Korku / Gerilim', 'Klasikler', 'Distopya', 'Felsefe'];

export function EditClubModal({
  isOpen,
  onClose,
  club,
  userId,
  onSuccess,
}: EditClubModalProps) {
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description);
  const [coverUrl, setCoverUrl] = useState(club.coverUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(club.avatarUrl || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(club.tags || []);
  const [isPrivate, setIsPrivate] = useState(Boolean(club.isPrivate));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(club.name);
      setDescription(club.description);
      setCoverUrl(club.coverUrl || '');
      setAvatarUrl(club.avatarUrl || '');
      setSelectedTags(club.tags || []);
      setIsPrivate(Boolean(club.isPrivate));
    }
  }, [isOpen, club]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Lütfen kulüp için bir isim girin.');
      return;
    }
    if (!description.trim()) {
      toast.error('Lütfen kulüp hakkında kısa bir açıklama yazın.');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updateClub(club.id, userId, {
        name: name.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        tags: selectedTags,
        isPrivate,
      });

      toast.success('Kulüp bilgileri başarıyla güncellendi!');
      onClose();
      if (onSuccess) {
        onSuccess(updated);
      }
    } catch (err: any) {
      console.error('Kulüp güncelleme hatası:', err);
      toast.error(err.message || 'Kulüp güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground">Kulübü Düzenle</h3>
              <p className="text-xs text-muted">Kulüp detaylarını ve temasını güncelleyin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted/15 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Kulüp Adı <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Gece Yarısı Kurguları Kulübü"
              className="w-full px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-sm focus:border-primary focus:outline-hidden transition-colors"
              maxLength={60}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Kulüp Açıklaması & Manifestosu <span className="text-primary">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu kulüpte neler okunur, ne tür tartışmalar yapılır?"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-sm focus:border-primary focus:outline-hidden transition-colors resize-none"
              maxLength={300}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Image size={14} className="text-muted" />
              <span>Kapak Görseli URL</span>
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-xs focus:border-primary focus:outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Image size={14} className="text-muted" />
              <span>Kulüp Avatarı URL</span>
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... (Kare avatar görseli)"
              className="w-full px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-xs focus:border-primary focus:outline-hidden transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-muted" />
              <span>Odak Türler & Etiketler</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary text-black font-bold shadow-xs'
                        : 'bg-muted/10 text-muted hover:text-foreground hover:bg-muted/20'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Switch */}
          <div className="pt-2 border-t border-border/60">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/10 border border-border/60 cursor-pointer">
              <div className="flex items-center gap-3">
                {isPrivate ? <Lock size={18} className="text-amber-500" /> : <Globe size={18} className="text-primary" />}
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {isPrivate ? 'Özel Kulüp' : 'Herkese Açık Kulüp'}
                  </span>
                  <span className="text-[11px] text-muted">
                    {isPrivate ? 'Sadece davet edilen veya onaylanan üyeler katılabilir' : 'Platformdaki tüm okuyucular anında katılabilir'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onPress={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <span>Değişiklikleri Kaydet</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
