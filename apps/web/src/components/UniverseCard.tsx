'use client';

import React from 'react';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import type { Universe, UniverseGenre } from '@readixon/core';
import { 
  Globe, 
  BookOpen, 
  Users, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Shield 
} from 'lucide-react';

const GENRE_EMOJIS: Record<UniverseGenre, string> = {
  fantasy: '🏰',
  'sci-fi': '🚀',
  real_world: '🌍',
  alternate_history: '⏳',
  dystopia: '🏙️',
  utopia: '🕊️',
  contemporary: '☕',
  historical: '⚔️',
  mythological: '⚡',
  post_apocalyptic: '☢️',
  hybrid: '🔮',
  custom: '✨',
};

const GENRE_NAMES: Record<UniverseGenre, string> = {
  fantasy: 'Fantastik',
  'sci-fi': 'Bilimkurgu',
  real_world: 'Gerçek Dünya',
  alternate_history: 'Alternatif Tarih',
  dystopia: 'Distopya',
  utopia: 'Ütopya',
  contemporary: 'Çağdaş',
  historical: 'Tarihi Kurgu',
  mythological: 'Mitolojik',
  post_apocalyptic: 'Kıyamet Sonrası',
  hybrid: 'Hibrit Evren',
  custom: 'Özel Kurgu',
};

interface UniverseCardProps {
  universe: Universe;
  className?: string;
}

export const UniverseCard: React.FC<UniverseCardProps> = ({ universe, className = '' }) => {
  const genreEmoji = GENRE_EMOJIS[universe.genre] || '✨';
  const genreLabel = GENRE_NAMES[universe.genre] || 'Kurgu';
  const destUrl = `/universe/${universe.slug || universe.universeId}`;

  const storyCount = universe.connectedStoryIds?.length || universe.stats?.storyCount || 0;
  const characterCount = universe.stats?.characterCount || 0;
  const locationCount = universe.stats?.locationCount || 0;

  return (
    <Link
      href={destUrl}
      className={`group relative flex flex-col justify-between rounded-3xl bg-card border border-border/60 hover:border-primary/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 cursor-pointer ${className}`}
    >
      {/* ── Üst Kapak / Banner Alanı ── */}
      <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-card">
        {universe.coverImage || universe.bannerImage ? (
          <img
            src={universe.coverImage || universe.bannerImage}
            alt={universe.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-card via-primary/10 to-card">
            <span className="text-4xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
              {genreEmoji}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">
              Kurgusal Evren
            </span>
          </div>
        )}

        {/* Karartma Gradyanı */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

        {/* Tür Rozeti */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-background/80 backdrop-blur-md text-foreground border border-border/60 shadow-xs">
            <span>{genreEmoji}</span>
            <span>{genreLabel}</span>
          </span>
        </div>

        {/* Durum / Açıklık Rozeti */}
        {universe.visibility === 'public' && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <Globe size={10} />
              <span>Canlı</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Gövde İçeriği ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {universe.title}
          </h3>

          <p className="text-muted text-xs line-clamp-2 mt-1.5 leading-relaxed">
            {universe.description || 'Bu evrenin henüz bir tanıtım özeti girilmedi.'}
          </p>
        </div>

        {/* İstatistik & Detay Şeridi */}
        <div className="mt-4 pt-3.5 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-foreground" title="Bağlı Eserler">
                <BookOpen size={13} className="text-primary" />
                <span>{storyCount} Eser</span>
              </span>
              {characterCount > 0 && (
                <span className="flex items-center gap-1" title="Karakterler">
                  <Users size={13} />
                  <span>{characterCount}</span>
                </span>
              )}
              {locationCount > 0 && (
                <span className="flex items-center gap-1" title="Mekânlar">
                  <MapPin size={13} />
                  <span>{locationCount}</span>
                </span>
              )}
            </div>
          </div>

          {/* Alt Kısım: Yazar & Aksiyon */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {universe.authorAvatarUrl ? (
                <img
                  src={universe.authorAvatarUrl}
                  alt={universe.authorName || 'Yazar'}
                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-primary/30"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                  {(universe.authorName || 'Y').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-medium text-muted truncate">
                {universe.authorName || 'Anonim Yazar'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-primary text-xs font-bold group-hover:translate-x-1 transition-transform shrink-0">
              <span>Evrene Gir</span>
              <ChevronRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
