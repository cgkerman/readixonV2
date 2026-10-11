'use client';

import React from 'react';
import Link from 'next/link';
import type { Series } from '@readixon/core';
import { 
  Layers, 
  BookOpen, 
  Eye, 
  Heart, 
  ChevronRight, 
  Crown,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SeriesCardProps {
  series: Series;
  className?: string;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, className = '' }) => {
  const destUrl = `/series/${series.slug || series.seriesId}`;
  const bookCount = series.stats?.bookCount || series.books?.length || 0;
  const isCompleted = series.status === 'completed';

  return (
    <Link
      href={destUrl}
      className={`group relative flex flex-col justify-between rounded-3xl bg-card border border-border/60 hover:border-amber-500/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 cursor-pointer ${className}`}
    >
      {/* ── Üst Kapak Alanı (Kitap Serisi Estetiği) ── */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-amber-950/20 via-background to-card flex items-center justify-center p-3">
        {series.coverImage ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Karartma */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          </div>
        ) : (
          /* Görsel yoksa şık 3D Seri Cilt Efekti */
          <div className="relative w-28 h-36 rounded-xl bg-gradient-to-tr from-amber-900/60 via-amber-700/40 to-amber-950/80 border border-amber-500/30 shadow-lg flex flex-col items-center justify-center p-3 text-center transform group-hover:scale-105 transition-transform duration-300">
            <Layers size={28} className="text-amber-400 mb-1 filter drop-shadow-md" />
            <span className="text-[10px] font-black text-amber-200 line-clamp-2 uppercase tracking-wider">
              {series.title}
            </span>
            <span className="text-[9px] text-amber-300/80 mt-1 font-bold">
              {bookCount} Kitap
            </span>
          </div>
        )}

        {/* Sol Üst: Seri Rozeti */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-background/85 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-xs">
            <Crown size={12} className="text-amber-400" />
            <span>{bookCount} Kitaplık Seri</span>
          </span>
        </div>

        {/* Sağ Üst: Tamamlandı / Devam Ediyor Rozeti */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
            isCompleted 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
              : 'bg-primary/15 text-primary border-primary/30'
          }`}>
            {isCompleted ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            <span>{isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}</span>
          </span>
        </div>

        {/* Evren Bağlantısı Rozeti (varsa) */}
        {series.universeTitle && (
          <div className="absolute bottom-2 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted bg-background/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/50">
              <Sparkles size={10} className="text-primary" />
              <span className="truncate max-w-[140px]">{series.universeTitle}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Gövde İçeriği ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-foreground group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
            {series.title}
          </h3>

          <p className="text-muted text-xs line-clamp-2 mt-1.5 leading-relaxed">
            {series.description || 'Bu serinin henüz bir tanıtım özeti girilmedi.'}
          </p>
        </div>

        {/* İstatistik & Detay Şeridi */}
        <div className="mt-4 pt-3.5 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <BookOpen size={13} className="text-amber-400" />
                <span>{bookCount} Cilt</span>
              </span>
              <span className="flex items-center gap-1" title="Toplam Okunma">
                <Eye size={13} />
                <span>{(series.stats?.totalViews || 0).toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1" title="Toplam Beğeni">
                <Heart size={13} />
                <span>{(series.stats?.totalLikes || 0).toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Alt Kısım: Yazar & Aksiyon */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {series.authorAvatarUrl ? (
                <img
                  src={series.authorAvatarUrl}
                  alt={series.authorName || 'Yazar'}
                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-amber-500/30"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {(series.authorName || 'Y').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-medium text-muted truncate">
                {series.authorName || 'Anonim Yazar'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold group-hover:translate-x-1 transition-transform shrink-0">
              <span>Seriyi İncele</span>
              <ChevronRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
