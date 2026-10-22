'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Clock, 
  PenTool, 
  ChevronRight, 
  Milestone,
  Flame,
  Award
} from 'lucide-react';
import { type PlatformWordStats } from '@readixon/core';

interface PowerOfWordsBannerProps {
  stats?: PlatformWordStats | null;
  isLoading?: boolean;
}

export function PowerOfWordsBanner({ stats, isLoading }: PowerOfWordsBannerProps) {
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const targetCount = stats?.totalWords ?? 0;

  // Sayı tırmanma (Roll-up / Odometer) animasyonu
  useEffect(() => {
    if (isLoading || hasAnimated) return;

    if (targetCount === 0) {
      setDisplayCount(0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          const duration = 1400; // 1.4 saniye
          const startTimestamp = performance.now();

          const step = (timestamp: number) => {
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // EaseOutExpo eğrisi
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplayCount(Math.floor(easeProgress * targetCount));

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayCount(targetCount);
            }
          };

          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [targetCount, isLoading, hasAnimated]);

  if (isLoading) {
    return (
      <div className="w-full rounded-3xl h-36 bg-card/60 border border-border/70 animate-pulse flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="text-xs text-muted font-medium">Edebi arşiv verileri hesaplanıyor...</span>
        </div>
      </div>
    );
  }

  const tier = stats?.tier || {
    tierLevel: 1,
    tierName: 'İlk Satırlar',
    prevMilestone: 0,
    nextMilestone: 1000,
    progressPercent: 0,
    wordsRemaining: 1000,
  };

  const readingTimeText = stats?.totalReadingHours && stats.totalReadingHours >= 1
    ? `${stats.totalReadingHours.toLocaleString('tr-TR')} Saat`
    : `${stats?.totalReadingMinutes ?? 0} Dk`;

  return (
    <div 
      ref={containerRef}
      className="relative w-full rounded-3xl bg-card border border-border/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      {/* İnce Arka Plan Işıltısı (Hem Açık hem Koyu Modda Kontrastı Bozmaz) */}
      <div className="absolute top-0 right-0 w-80 h-36 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-10" />
      <div className="absolute bottom-0 left-0 w-64 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-8" />

      <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-4">
        
        {/* ── 1. ÜST BİLGİ BANDI (BAŞLIK, CANLI NABIZ & SEVİYE ETİKETİ) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Sparkles size={16} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-text">
                Kelimelerin Gücü
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Canlı Kolektif Arşiv</span>
              </span>
            </div>
          </div>

          {/* Sağ: Otomatik Kademeli Aşama Rozeti */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs">
              <Award size={13} className="text-amber-600 dark:text-amber-400" />
              <span>Seviye {tier.tierLevel}: {tier.tierName}</span>
            </span>

            <button
              onClick={() => router.push('/studio')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer active:scale-95"
            >
              <PenTool size={12} />
              <span>Kelimeni Ekle</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* ── 2. ORTA BÖLÜM: BÜYÜK SAYAÇ & ÖZET METRİKLER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Ana Sayaç */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-text">
              {(hasAnimated ? displayCount : targetCount).toLocaleString('tr-TR')}
            </span>
            <span className="text-lg sm:text-xl font-serif font-bold text-amber-600 dark:text-amber-400">
              Kelime
            </span>
            <span className="text-xs text-muted ml-1 hidden lg:inline">
              (yazarlarımızın yayındaki tüm eserlerinden anlık toplanır)
            </span>
          </div>

          {/* Gerçek İstatistik Hapları (Pills) */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            
            {/* Aktif Eser Sayısı */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/15 dark:bg-muted/20 border border-border/60 text-text/80 font-medium">
              <BookOpen size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{stats?.totalPublishedStories ?? 0} Eser</span>
            </div>

            {/* Bölüm Sayısı */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/15 dark:bg-muted/20 border border-border/60 text-text/80 font-medium">
              <Layers size={13} className="text-primary shrink-0" />
              <span>{stats?.totalChapters ?? 0} Bölüm</span>
            </div>

            {/* Okuma Süresi */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/15 dark:bg-muted/20 border border-border/60 text-text/80 font-medium">
              <Clock size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{readingTimeText} Okuma</span>
            </div>

            {/* Edebi Kıyaslama */}
            {stats?.literaryComparison && (
              <div 
                title={stats.literaryComparison.description}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-300 font-semibold cursor-help"
              >
                <Flame size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{stats.literaryComparison.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. KADEMELİ İLERLEME ÇUBUĞU (OTOMATİK BİR SONRAKİ EŞİK) ── */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-medium flex items-center gap-1.5">
              <Milestone size={13} className="text-amber-600 dark:text-amber-400" />
              <span>
                Hedef: <strong className="text-text">{tier.nextMilestone.toLocaleString('tr-TR')}</strong> Kelime
              </span>
            </span>

            <span className="text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 font-mono">
              %{tier.progressPercent} tamamlandı ({tier.wordsRemaining.toLocaleString('tr-TR')} kelime kaldı)
            </span>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="w-full h-2 sm:h-2.5 rounded-full bg-muted/25 dark:bg-muted/30 border border-border/40 overflow-hidden relative">
            <div 
              style={{ width: `${Math.min(100, Math.max(tier.progressPercent > 0 ? 3 : 0, tier.progressPercent))}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-xs transition-all duration-1000 relative"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
