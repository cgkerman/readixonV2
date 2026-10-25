'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Feather, Image as ImageIcon, Lock, Globe } from 'lucide-react';
import { Button } from '@readixon/ui';
import { createClub, getAuthorPublishedStories, useAuthStore } from '@readixon/core';
import { toast } from 'sonner';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = ['Bilim Kurgu', 'Fantastik', 'Polisiye & Gizem', 'Korku / Gerilim', 'Klasikler', 'Distopya', 'Felsefe'];

export function CreateClubModal({ isOpen, onClose }: CreateClubModalProps) {
  const router = useRouter();
  const { firebaseUser, userProfile } = useAuthStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isAuthorOfficial, setIsAuthorOfficial] = useState(false);
  const [hasAuthorStories, setHasAuthorStories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !firebaseUser) return;
    getAuthorPublishedStories(firebaseUser.uid)
      .then((stories) => {
        if (stories.length > 0) setHasAuthorStories(true);
      })
      .catch(() => {});
  }, [isOpen, firebaseUser]);

  const isAuthor = Boolean(userProfile?.isAuthor || hasAuthorStories);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error('Kulüp oluşturmak için giriş yapmalısınız.');
      return;
    }
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
      const newClub = await createClub(firebaseUser.uid, {
        name: name.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim() || undefined,
        tags: selectedTags,
        isPrivate,
        isAuthorOfficial: isAuthor ? isAuthorOfficial : false,
        linkedAuthorId: (isAuthor && isAuthorOfficial) ? firebaseUser.uid : undefined,
      });

      toast.success('Kitap Kulübü başarıyla kuruldu!');
      onClose();
      router.push(`/clubs/${newClub.slug}`);
    } catch (err: any) {
      console.error('Kulüp kurma hatası:', err);
      toast.error(err.message || 'Kulüp oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Yeni Kitap Kulübü Kur</h2>
              <p className="text-xs text-muted">Kendi okuma topluluğunu oluştur ve yönet.</p>
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
              className="w-full px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
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
              className="w-full px-4 py-3 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              maxLength={300}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Kapak Görseli URL'si (Opsiyonel)
            </label>
            <div className="relative">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-xs focus:border-primary focus:outline-none transition-colors"
              />
              <ImageIcon size={15} className="absolute left-3.5 top-3 text-muted" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">
              Tür & Odak Etiketleri
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary text-black font-bold shadow-sm'
                        : 'bg-muted/10 text-muted hover:text-foreground border border-border/60'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Yazar Özel Rozeti */}
          {isAuthor && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Feather size={16} className="text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Resmi Yazar Kulübü Olarak İşaretle
                  </span>
                  <span className="text-[11px] text-muted block">
                    Bu kulüp yazar profiliniz ve eserleriniz ile doğrudan bağlanır.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAuthorOfficial}
                onChange={(e) => setIsAuthorOfficial(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          )}

          {/* Gizlilik */}
          <div className="p-3.5 rounded-2xl bg-muted/10 border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isPrivate ? <Lock size={16} className="text-primary" /> : <Globe size={16} className="text-muted" />}
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {isPrivate ? 'Özel Kulüp' : 'Herkese Açık Kulüp'}
                </span>
                <span className="text-[11px] text-muted block">
                  {isPrivate
                    ? 'Sadece onaylanan veya davet edilen üyeler girebilir.'
                    : 'Tüm Readixon okurları anında katılıp tartışabilir.'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              Vazgeç
            </button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Kuruluyor...' : 'Kulübü Kur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
