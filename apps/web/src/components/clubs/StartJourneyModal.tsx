'use client';

import React, { useState } from 'react';
import { X, BookOpen, Calendar, Flag, Sparkles } from 'lucide-react';
import { Button } from '@readixon/ui';
import { createClubJourney, useAuthStore } from '@readixon/core';
import { toast } from 'sonner';

interface StartJourneyModalProps {
  clubId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StartJourneyModal({ clubId, isOpen, onClose, onSuccess }: StartJourneyModalProps) {
  const { firebaseUser } = useAuthStore();

  const [storyTitle, setStoryTitle] = useState('');
  const [storyId, setStoryId] = useState('');
  const [totalChapters, setTotalChapters] = useState(10);
  const [journeyTitle, setJourneyTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!storyTitle.trim()) {
      toast.error('Lütfen okunacak kitabın adını girin.');
      return;
    }

    try {
      setIsSubmitting(true);

      const title = journeyTitle.trim() || `${storyTitle.trim()} Okuma Seferi`;
      const chapters = Number(totalChapters) || 10;

      // 4 Aşamalı Kilometre Taşlarını Hesapla
      const q1 = Math.max(1, Math.round(chapters * 0.25));
      const q2 = Math.max(q1 + 1, Math.round(chapters * 0.5));
      const q3 = Math.max(q2 + 1, Math.round(chapters * 0.75));
      const q4 = chapters;

      const milestones = [
        {
          dayNumber: 1,
          targetChapterIndex: q1,
          targetChapterTitle: `1-${q1}. Bölüm Tartışması`,
          discussionTopic: 'İlk izlenimler, evrenin tanıtımı ve karakterler.',
          unlockDate: new Date().toISOString().split('T')[0],
        },
        {
          dayNumber: 3,
          targetChapterIndex: q2,
          targetChapterTitle: `${q1 + 1}-${q2}. Bölüm Tartışması`,
          discussionTopic: 'Olaylar gelişiyor! İlk büyük dönüm noktası.',
          unlockDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        },
        {
          dayNumber: 5,
          targetChapterIndex: q3,
          targetChapterTitle: `${q2 + 1}-${q3}. Bölüm Tartışması`,
          discussionTopic: 'Büyük sırlar açığa çıkıyor, teorileriniz neler?',
          unlockDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        },
        {
          dayNumber: 7,
          targetChapterIndex: q4,
          targetChapterTitle: `Büyük Final: ${q3 + 1}-${q4}. Bölüm`,
          discussionTopic: 'Kitabın sonu, final değerlendirmesi ve ortak puanlama!',
          unlockDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        },
      ];

      await createClubJourney(clubId, firebaseUser.uid, {
        storyId: storyId.trim() || `story-${Date.now()}`,
        storyTitle: storyTitle.trim(),
        totalChapters: chapters,
        title,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        milestones,
      });

      toast.success('Yeni Okuma Seferi ve tartışma odaları başlatıldı!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Sefer başlatma hatası:', err);
      toast.error(err.message || 'Sefer başlatılırken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Yeni Okuma Seferi Başlat</h3>
              <p className="text-xs text-muted">Birlikte okunacak kitabı ve durakları belirle.</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Okunacak Kitabın Adı <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="Örn: Geçit Oteli"
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Toplam Bölüm Sayısı
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalChapters}
                onChange={(e) => setTotalChapters(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Sefer Süresi
              </label>
              <div className="px-4 py-2.5 rounded-2xl bg-muted/10 border border-border/80 text-xs font-semibold text-muted flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <span>7 Günlük Maraton</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Sefer Başlığı (Opsiyonel)
            </label>
            <input
              type="text"
              value={journeyTitle}
              onChange={(e) => setJourneyTitle(e.target.value)}
              placeholder="Örn: 7 Günlük Geçit Oteli Seferi"
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/10 border border-border/80 text-foreground text-xs focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-1">
            <span className="font-bold text-primary block">Otomatik Spoiler Odaları:</span>
            <p className="text-muted text-[11px] leading-relaxed">
              Bu sefer başladığında kulübünüzde 4 aşamalı bölüm tartışma odaları otomatik açılacak ve üyeler okudukça kilitleri sırayla açılacaktır.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              Vazgeç
            </button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Başlatılıyor...' : 'Seferi Başlat'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
