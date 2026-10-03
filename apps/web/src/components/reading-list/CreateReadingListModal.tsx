'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Lock, Globe, Loader2, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';
import { createReadingList, updateReadingList, compressImage, uploadFile } from '@readixon/core';
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

const DEFAULT_COVER_PATH = '/images/default-reading-list.jpg';

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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(editingList?.coverUrl || null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Düzenleme modunda props değişirse senkronize et
  useEffect(() => {
    if (editingList) {
      setTitle(editingList.title);
      setDescription(editingList.description || '');
      setIsPublic(editingList.isPublic);
      setCoverPreview(editingList.coverUrl || null);
      setCoverFile(null);
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(true);
      setCoverPreview(null);
      setCoverFile(null);
    }
  }, [editingList, isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Görsel boyutu en fazla 10 MB olabilir.');
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Lütfen okuma listesi için bir başlık yazın.');
      return;
    }

    setLoading(true);
    try {
      let finalCoverUrl = coverPreview || DEFAULT_COVER_PATH;

      // Kullanıcı yeni bir görsel yüklediyse optimize et ve Firebase Storage'a yükle
      if (coverFile) {
        try {
          const compressed = await compressImage(coverFile, 800, 800, 0.85);
          const uploadPath = `readingLists/${userId}/cover_${Date.now()}.jpg`;
          finalCoverUrl = await uploadFile(compressed, uploadPath);
        } catch (uploadErr: any) {
          console.error('Kapak resmi yükleme hatası:', uploadErr);
          toast.error('Görsel yüklenemedi, varsayılan kapak kullanılacak.');
          finalCoverUrl = DEFAULT_COVER_PATH;
        }
      }

      if (editingList) {
        await updateReadingList(editingList.id, userId, {
          title: title.trim(),
          description: description.trim(),
          isPublic,
          coverUrl: finalCoverUrl,
        });
        toast.success('Okuma listesi güncellendi.');
        if (onSuccess) {
          onSuccess({
            ...editingList,
            title: title.trim(),
            description: description.trim(),
            isPublic,
            coverUrl: finalCoverUrl,
          });
        }
      } else {
        const created = await createReadingList(userId, {
          title: title.trim(),
          description: description.trim(),
          isPublic,
          coverUrl: finalCoverUrl,
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
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
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
          {/* Liste Kapağı Alanı (Özel Kapak Yükleme & Optimizasyon) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Liste Kapağı <span className="normal-case font-normal text-[11px] text-muted-foreground/70">(İsteğe bağlı)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              {/* Kapak Önizleme */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-border/50 bg-background/80 shrink-0 shadow-md group">
                <img
                  src={coverPreview || DEFAULT_COVER_PATH}
                  alt="Liste Kapağı"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {coverPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    title="Kapağı Kaldır (Varsayılana Dön)"
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Yükleme Butonu & Bilgilendirme */}
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all hover:border-primary"
                >
                  <UploadCloud size={16} />
                  <span>{coverPreview ? 'Görseli Değiştir' : 'Özel Kapak Yükle'}</span>
                </button>

                <p className="text-[11px] text-muted-foreground/75 leading-relaxed">
                  {coverPreview ? (
                    <span className="text-emerald-500 font-medium">✓ Özel kapak seçildi (yüklenirken otomatik optimize edilir).</span>
                  ) : (
                    <span>Görsel seçmezseniz Readixon'ın estetik varsayılan kapağı kullanılır.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

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
