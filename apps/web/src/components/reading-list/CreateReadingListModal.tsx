'use client';

import React, { useState } from 'react';
import { X, Sparkles, Lock, Globe, Loader2 } from 'lucide-react';
import { createReadingList, updateReadingList } from '@readixon/core';
import type { ReadingList } from '@readixon/core';
import { toast } from 'sonner';

interface CreateReadingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialStoryId?: string;
  editingList?: ReadingList | null;
  onSuccess?: (createdOrUpdatedList: ReadingList) => void;
}

export const CreateReadingListModal: React.FC<CreateReadingListModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialStoryId,
  editingList = null,
  onSuccess,
}) => {
  const [title, setTitle] = useState(editingList?.title || '');
  const [description, setDescription] = useState(editingList?.description || '');
  const [isPublic, setIsPublic] = useState(editingList ? editingList.isPublic : true);
  const [loading, setLoading] = useState(false);

  // Düzenleme modunda props değişirse senkronize et
  React.useEffect(() => {
    if (editingList) {
      setTitle(editingList.title);
      setDescription(editingList.description || '');
      setIsPublic(editingList.isPublic);
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(true);
    }
  }, [editingList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Lütfen okuma listesi için bir başlık yazın.');
      return;
    }

    setLoading(true);
    try {
      if (editingList) {
        await updateReadingList(editingList.id, userId, {
          title: title.trim(),
          description: description.trim(),
          isPublic,
        });
        toast.success('Okuma listesi güncellendi.');
        if (onSuccess) {
          onSuccess({
            ...editingList,
            title: title.trim(),
            description: description.trim(),
            isPublic,
          });
        }
      } else {
        const created = await createReadingList(userId, {
          title: title.trim(),
          description: description.trim(),
          isPublic,
          storyIds: initialStoryId ? [initialStoryId] : [],
        });
        toast.success('Yeni okuma listesi oluşturuldu!');
        if (onSuccess) {
          onSuccess(created);
        }
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-6 sm:p-7">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>

        {/* Modal Başlığı */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {editingList ? 'Listeyi Düzenle' : 'Yeni Okuma Listesi'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hikayelerini Spotify albümü gibi derle ve paylaş.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Başlık Alanı */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Liste Başlığı *
            </label>
            <input
              type="text"
              required
              maxLength={80}
              placeholder="Örn: Yağmurlu Günlerde Ağlatan Hikayeler"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary transition-colors shadow-inner"
            />
          </div>

          {/* Açıklama Alanı */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              rows={3}
              maxLength={250}
              placeholder="Bu listede ne tür hikayeler var? Okuyuculara bir ipucu ver..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/40 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary transition-colors resize-none shadow-inner"
            />
            <span className="text-[10px] text-muted-foreground/60 float-right mt-1">
              {description.length}/250
            </span>
          </div>

          {/* Gizlilik Seçimi (Public / Private) */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Görünürlük
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  isPublic
                    ? 'bg-primary/10 border-primary text-primary shadow-sm font-semibold'
                    : 'bg-muted/10 border-border/30 text-muted-foreground hover:bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Globe size={14} /> Herkese Açık
                </div>
                <span className="text-[10px] opacity-75">Bağlantıyı herkes görebilir</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  !isPublic
                    ? 'bg-primary/10 border-primary text-primary shadow-sm font-semibold'
                    : 'bg-muted/10 border-border/30 text-muted-foreground hover:bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Lock size={14} /> Gizli
                </div>
                <span className="text-[10px] opacity-75">Sadece sen görebilirsin</span>
              </button>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/15 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Kaydediliyor...</span>
                </div>
              ) : editingList ? (
                'Güncelle'
              ) : (
                'Liste Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
