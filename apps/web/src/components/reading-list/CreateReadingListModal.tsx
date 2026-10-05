'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Lock, Globe, Loader2, UploadCloud, Trash2, Crop, Info, ZoomIn } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { createReadingList, updateReadingList, compressImage, uploadFile, getCroppedImg } from '@readixon/core';
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

  // Kırpma (Cropper) Durumları
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Düzenleme modunda props değişirse senkronize et
  useEffect(() => {
    if (editingList) {
      setTitle(editingList.title);
      setDescription(editingList.description || '');
      setIsPublic(editingList.isPublic);
      setCoverPreview(editingList.coverUrl || null);
      setCoverFile(null);
      setRawImageSrc(editingList.coverUrl || null);
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(true);
      setCoverPreview(null);
      setCoverFile(null);
      setRawImageSrc(null);
    }
    setCropImageSrc(null);
  }, [editingList, isOpen]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cropImageSrc) {
          setCropImageSrc(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else if (!loading) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, cropImageSrc, loading]);

  const onCropComplete = useCallback((_croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  if (!isOpen) return null;

  const handleCropSave = async () => {
    if (cropImageSrc && croppedAreaPixels) {
      try {
        const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
        if (croppedFile) {
          setCoverFile(croppedFile);
          const objectUrl = URL.createObjectURL(croppedFile);
          setCoverPreview(objectUrl);
          toast.success('Kapak görseli 1:1 kare formatında kırpıldı.');
        }
      } catch (err) {
        console.error('Kırpma hatası:', err);
        toast.error('Görsel kırpılamadı.');
      }
    }
    setCropImageSrc(null);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Görsel boyutu en fazla 10 MB olabilir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setRawImageSrc(src);
      setCropImageSrc(src);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCropper = () => {
    if (rawImageSrc) {
      setCropImageSrc(rawImageSrc);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else if (coverPreview) {
      setCropImageSrc(coverPreview);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
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
    setRawImageSrc(null);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-5 sm:p-7 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted/30 hover:bg-muted/60 text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-sm"
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
          {/* Liste Kapağı Alanı (Özel Kapak Yükleme, Kırpma & Optimizasyon) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Liste Kapağı <span className="normal-case font-normal text-[11px] text-muted-foreground/70">(İsteğe bağlı)</span>
              </label>
              <span className="text-[11px] text-primary font-medium">Önerilen: 800×800 px (1:1 Kare)</span>
            </div>

            {/* Bilgilendirme Kartı */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 mb-3 text-[11px] text-muted-foreground leading-relaxed">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <span>
                Kapak görselinizin basık veya ezilmiş görünmemesi için kare (1:1) format önerilir. Yüklediğinizde açılan ekrandan istediğiniz alanı kolayca kırpabilirsiniz.
              </span>
            </div>

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
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Yükleme & Kırpma Butonları */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all hover:border-primary"
                  >
                    <UploadCloud size={15} />
                    <span>{coverPreview ? 'Görseli Değiştir' : 'Özel Kapak Yükle'}</span>
                  </button>

                  {/* Kırp Butonu (Kullanıcı seçtiği görseli yeniden kırpmak isterse) */}
                  {(rawImageSrc || (coverPreview && coverPreview !== DEFAULT_COVER_PATH)) && (
                    <button
                      type="button"
                      onClick={handleOpenCropper}
                      title="Görseli Yeniden Kırp"
                      className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 text-foreground text-xs font-semibold transition-colors"
                    >
                      <Crop size={14} className="text-primary" />
                      <span>Kırp</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground/75 leading-relaxed">
                  {coverPreview ? (
                    <span className="text-emerald-500 font-medium">✓ 1:1 kare formatında hazırlandı.</span>
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

      {/* ── 1:1 Kare Kırpma (Cropper) Modalı ── */}
      {cropImageSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCropImageSrc(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          }}
        >
          <div
            className="bg-card w-full max-w-lg rounded-3xl border border-border/50 flex flex-col overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Crop size={16} className="text-primary" />
                  Kapak Görselini Kırp (1:1 Kare)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fotoğrafın basık görünmemesi için kare alanı ayarlayın.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCropImageSrc(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="w-9 h-9 rounded-full bg-muted/30 hover:bg-muted/60 text-foreground flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="Kapat"
              >
                <X size={17} />
              </button>
            </div>

            <div className="relative w-full h-[50vh] min-h-[300px] bg-black/90">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 bg-card/95">
              <div className="flex items-center gap-2">
                <ZoomIn size={15} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Yakınlaştır:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCropImageSrc(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer"
                >
                  Kırp ve Kullan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
