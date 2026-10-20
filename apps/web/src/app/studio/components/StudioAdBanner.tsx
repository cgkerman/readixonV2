'use client';

import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

interface StudioAdBannerProps {
  className?: string;
}

export const StudioAdBanner: React.FC<StudioAdBannerProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full rounded-2xl border-2 border-dashed border-border/60 bg-gradient-to-r from-card/70 via-card/40 to-card/70 backdrop-blur-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden group hover:border-primary/40 transition-all ${className}`}
    >
      {/* Arka plan ışıltısı */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sol: Reklam Etiketi & Bilgilendirme */}
      <div className="flex items-center gap-3.5 z-10 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
          <Tag size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-muted/20 text-muted border border-border/40">
              Reklam Alanı
            </span>
            <span className="text-[11px] text-muted/80 font-medium hidden sm:inline">
              Sponsorlu İçerik
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Bu alan reklam ve sponsor iş birlikleri gösterimleri için ayrılmıştır.
          </p>
        </div>
      </div>

      {/* Sağ: Mock Boyut / Hazırlık Göstergesi */}
      <div className="flex items-center gap-2 z-10 shrink-0 self-end sm:self-center">
        <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-background/60 border border-border/40 text-muted/75">
          Responsive Banner (728x90)
        </span>
        <div className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" title="Hazırda bekliyor" />
      </div>
    </div>
  );
};
