'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Award, BookOpen, Star, Loader2, X, Users, Sparkles } from 'lucide-react';
import { Button } from '@readixon/ui';
import { archiveCompletedBook, type ClubJourney, type ClubActiveBook } from '@readixon/core';

interface ArchiveJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  userId: string;
  journey: ClubJourney | null;
  activeBook?: ClubActiveBook | null;
  participantsCount?: number;
  onSuccess?: () => void;
}

export function ArchiveJourneyModal({
  isOpen,
  onClose,
  clubId,
  userId,
  journey,
  activeBook,
  participantsCount = 1,
  onSuccess,
}: ArchiveJourneyModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const storyId = journey?.storyId || activeBook?.storyId || '';
  const title = journey?.storyTitle || activeBook?.title || 'Bilinmeyen Eser';
  const coverUrl = journey?.storyCoverUrl || activeBook?.coverUrl || '';
  const authorName = activeBook?.authorName || 'Bilinmeyen Yazar';
  const authorId = activeBook?.authorId || '';

  const handleArchive = async () => {
    if (!storyId) {
      toast.error('Arşivlenecek aktif eser bulunamadı.');
      return;
    }

    setSubmitting(true);
    try {
      await archiveCompletedBook(clubId, userId, {
        journeyId: journey?.id,
        storyId,
        title,
        coverUrl,
        authorName,
        authorId,
        totalParticipants: participantsCount || journey?.participantsCount || 1,
        averageRating: rating,
        summaryNotes: summaryNotes.trim(),
      });

      toast.success(`🏆 "${title}" seferi başarıyla tamamlandı ve kulüp arşivine eklendi!`);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Seferi arşivleme hatası:', err);
      toast.error(err.message || 'Sefer arşivlenirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card border border-amber-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Seferi Tamamla ve Arşivle</h2>
              <span className="text-xs text-amber-400/90 font-medium">Kulüp Başarı Kürsüsü</span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Book Preview Card */}
          <div className="p-4 rounded-2xl bg-muted/10 border border-border/60 flex items-center gap-4">
            <div className="w-14 h-20 rounded-xl bg-muted/30 overflow-hidden shrink-0 shadow-md border border-border/60">
              {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted font-bold text-xs">
                  <BookOpen size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                Tamamlanan Eser
              </span>
              <h4 className="font-bold text-sm text-foreground truncate mt-0.5">{title}</h4>
              <p className="text-xs text-muted truncate">Yazar: {authorName}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                <span className="flex items-center gap-1 font-medium">
                  <Users size={12} />
                  <span>{participantsCount} Okur Katıldı</span>
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Kulüp Değerlendirme Puanı
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 active:scale-95 transition-transform"
                >
                  <Star
                    size={24}
                    className={
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted/40 hover:text-muted'
                    }
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-foreground ml-2">
                {rating} / 5 Yıldız
              </span>
            </div>
          </div>

          {/* Summary / Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Kulüp Değerlendirmesi & Kapanış Notu <span className="text-muted font-normal">(Opsiyonel)</span>
            </label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Kitap kulübümüz için nasıl bir deneyimdi? Tartışmalar, karakterler veya final hakkındaki kulüp kanaati nedir?"
              rows={3}
              disabled={submitting}
              className="w-full bg-background border border-border/80 focus:border-amber-500 rounded-2xl p-3.5 text-xs text-foreground placeholder:text-muted focus:outline-hidden transition-colors resize-none"
              maxLength={400}
            />
          </div>

          {/* Info Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Bu işlem aktif okuma seferini başarıyla tamamlayacak, aktif kitap alanını sıfırlayacak ve bu eseri <strong>"Sefer Arşivi"</strong> sekmesinde kalıcı başarı olarak listeleyecektir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 bg-muted/5 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            disabled={submitting}
            onPress={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Vazgeç
          </Button>
          <Button
            variant="primary"
            disabled={submitting}
            onPress={handleArchive}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Arşivleniyor...</span>
              </>
            ) : (
              <>
                <Award size={14} />
                <span>Seferi Tamamla ve Arşivle</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
