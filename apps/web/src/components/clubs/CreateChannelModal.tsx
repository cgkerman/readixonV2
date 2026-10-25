'use client';

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Feather,
  Sparkles,
  BookOpen,
  Lock,
  Plus,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@readixon/ui';
import {
  createClubChannel,
  useAuthStore,
  type ClubChannel,
  type ClubChannelType,
} from '@readixon/core';
import { toast } from 'sonner';

interface CreateChannelModalProps {
  clubId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (channel: ClubChannel) => void;
  maxChapterCount?: number;
}

interface ChannelTypeOption {
  type: ClubChannelType;
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  badgeClass: string;
  defaultTitle: string;
  defaultDescription: string;
}

const CHANNEL_TYPES: ChannelTypeOption[] = [
  {
    type: 'general',
    title: 'Serbest Sohbet',
    description: 'Genel muhabbet, tanışma ve günlük fikir alışverişi.',
    icon: MessageSquare,
    colorClass: 'text-primary border-primary/30 bg-primary/10',
    badgeClass: 'bg-primary/20 text-primary',
    defaultTitle: 'Günlük Kitap Sohbeti',
    defaultDescription: 'Kulüp üyeleri için serbest sohbet ve tanışma alanı.',
  },
  {
    type: 'author_ama',
    title: 'Yazarla Soru-Cevap (AMA)',
    description: 'Okurların yazar için soru bıraktığı, en çok upvote alanların yanıtlandığı alan.',
    icon: Feather,
    colorClass: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    badgeClass: 'bg-amber-500/20 text-amber-500',
    defaultTitle: 'Yazarla Canlı Soru-Cevap (AMA)',
    defaultDescription: 'Yazarımıza merak ettiğiniz soruları sorun; soruları oylayarak öne çıkarın!',
  },
  {
    type: 'theories',
    title: 'Teoriler & Tahminler',
    description: 'Olay örgüsü, gizemler ve gelecek bölümlere dair tahminler.',
    icon: Sparkles,
    colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    badgeClass: 'bg-purple-500/20 text-purple-400',
    defaultTitle: 'Büyük Gizemler & Gelecek Teorileri',
    defaultDescription: 'Kurgudaki ipuçları, gizli detaylar ve final tahminleri.',
  },
  {
    type: 'chapter_discussion',
    title: 'Bölüm Tartışması',
    description: 'Belirli bir bölüm veya dönüm noktasına özel derinlemesine inceleme.',
    icon: BookOpen,
    colorClass: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    badgeClass: 'bg-blue-500/20 text-blue-400',
    defaultTitle: 'Özel Bölüm Değerlendirmesi',
    defaultDescription: 'Bu bölümde yaşanan kilit gelişmeler ve karakter analizleri.',
  },
];

export function CreateChannelModal({
  clubId,
  isOpen,
  onClose,
  onSuccess,
  maxChapterCount = 100,
}: CreateChannelModalProps) {
  const { firebaseUser } = useAuthStore();

  const [selectedType, setSelectedType] = useState<ClubChannelType>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasSpoilerLock, setHasSpoilerLock] = useState(false);
  const [requiredChapterIndex, setRequiredChapterIndex] = useState<number>(1);
  const [isAMAActive, setIsAMAActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectType = (opt: ChannelTypeOption) => {
    setSelectedType(opt.type);
    if (!title.trim() || CHANNEL_TYPES.some((c) => c.defaultTitle === title)) {
      setTitle(opt.defaultTitle);
    }
    if (!description.trim() || CHANNEL_TYPES.some((c) => c.defaultDescription === description)) {
      setDescription(opt.defaultDescription);
    }
    if (opt.type === 'chapter_discussion') {
      setHasSpoilerLock(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error('Oda oluşturmak için giriş yapmalısınız.');
      return;
    }
    if (!title.trim()) {
      toast.error('Lütfen oda için bir başlık girin.');
      return;
    }

    try {
      setIsSubmitting(true);

      const newChannel = await createClubChannel(clubId, firebaseUser.uid, {
        title: title.trim(),
        description: description.trim() || undefined,
        type: selectedType,
        requiredChapterIndex: hasSpoilerLock ? requiredChapterIndex : 0,
        isAMAActive: selectedType === 'author_ama' ? isAMAActive : undefined,
      });

      toast.success(`"${newChannel.title}" odası başarıyla açıldı!`);
      onSuccess(newChannel);
      onClose();
    } catch (err: any) {
      console.error('Kanal oluşturma hatası:', err);
      toast.error(err.message || 'Tartışma odası açılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-border/50 flex items-center justify-between shrink-0 bg-gradient-to-r from-primary/10 to-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Yeni Tartışma Odası Aç</h3>
              <p className="text-xs text-muted">
                Kulüp üyelerinin etkileşime gireceği yeni bir sohbet veya soru-cevap alanı oluşturun.
              </p>
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Oda Türü Seçimi */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted block">
              1. Oda Türünü Seçin
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHANNEL_TYPES.map((opt) => {
                const isSelected = selectedType === opt.type;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleSelectType(opt)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2.5 active:scale-98 ${
                      isSelected
                        ? `${opt.colorClass} shadow-md`
                        : 'border-border/60 bg-muted/5 hover:bg-muted/15 text-foreground/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="text-xs font-bold">{opt.title}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${opt.badgeClass}`}>
                        {opt.type === 'author_ama' ? 'Özel' : 'Standart'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-tight">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Başlık ve Açıklama */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                Oda Başlığı *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yazarla Canlı Soru-Cevap veya 5. Bölüm Tartışması"
                required
                className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                Açıklama veya Yönerge (İsteğe Bağlı)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu odada neyin tartışılacağını veya kuralları kısaca belirtin..."
                rows={2}
                className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2 text-xs text-foreground outline-hidden transition-all resize-none"
              />
            </div>
          </div>

          {/* STEP 3: Yazar AMA Özelliği */}
          {selectedType === 'author_ama' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Feather size={16} className="text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-500 block">
                    Canlı Soru-Cevap Modu Aktif
                  </span>
                  <span className="text-[11px] text-muted block">
                    Okurlar soru bırakabilir ve soruları oylayabilir; siz ve yazar rozetli yanıt verebilirsiniz.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAMAActive}
                onChange={(e) => setIsAMAActive(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          )}

          {/* STEP 4: Spoiler Kilidi / Bölüm Eşiği */}
          <div className="p-3.5 rounded-2xl bg-muted/10 border border-border/60 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock size={15} className={hasSpoilerLock ? 'text-amber-500' : 'text-muted'} />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Spoiler Koruması (Bölüm Eşiği)
                  </span>
                  <span className="text-[11px] text-muted block">
                    {hasSpoilerLock
                      ? 'Belirtilen bölüme ulaşmayan okurlara içerik kilitli görünür.'
                      : 'Oda tüm kulüp üyelerine anında açık olur.'}
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={hasSpoilerLock}
                onChange={(e) => setHasSpoilerLock(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {hasSpoilerLock && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-semibold text-muted">
                  Giriş için gerekli minimum bölüm:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={maxChapterCount}
                    value={requiredChapterIndex}
                    onChange={(e) => setRequiredChapterIndex(Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-background border border-border/80 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs font-bold text-center text-foreground outline-hidden"
                  />
                  <span className="text-xs font-bold text-muted">. Bölüm</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onPress={onClose}
              disabled={isSubmitting}
              className="text-xs font-medium"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-primary hover:bg-primary/90 text-background text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Oda Açılıyor...
                </>
              ) : (
                <>
                  <Plus size={14} /> Tartışma Odasını Aç
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
