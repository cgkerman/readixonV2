'use client';

import React from 'react';
import { Typography } from '@readixon/ui';
import { Wand2, Sparkles, Trophy, Search, Flame, BookOpen, Layers } from 'lucide-react';

interface AcademyHeroProps {
  totalXp: number;
  completedCount: number;
  totalLessons: number;
  streakDays: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: 'overview' | 'paths' | 'lessons' | 'badges';
  onTabChange: (tab: 'overview' | 'paths' | 'lessons' | 'badges') => void;
}

export default function AcademyHero({
  totalXp,
  completedCount,
  totalLessons,
  streakDays,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange
}: AcademyHeroProps) {
  // Seviye hesaplama
  const getLevelInfo = (xp: number) => {
    if (xp < 150) return { level: 1, title: 'Acemi Kalem', nextXp: 150, currentThreshold: 0 };
    if (xp < 350) return { level: 2, title: 'Hikâye Yolcusu', nextXp: 350, currentThreshold: 150 };
    if (xp < 650) return { level: 3, title: 'Kalem Ustası', nextXp: 650, currentThreshold: 350 };
    if (xp < 1000) return { level: 4, title: 'Hikâye Mimarı', nextXp: 1000, currentThreshold: 650 };
    return { level: 5, title: 'Usta Yazar', nextXp: 2000, currentThreshold: 1000 };
  };

  const levelInfo = getLevelInfo(totalXp);
  const progressPercent = Math.min(
    100,
    Math.round(((totalXp - levelInfo.currentThreshold) / (levelInfo.nextXp - levelInfo.currentThreshold)) * 100)
  );

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-card/80 to-card border border-border/60 p-6 sm:p-8 shadow-sm overflow-hidden mb-8">
      {/* Arka plan ışık efekti */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Sol: Başlık ve Vizyon */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide">
            <Wand2 size={14} />
            <span>READIXON YAZAR AKADEMİSİ</span>
          </div>

          <Typography variant="h1" className="text-2xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight">
            Daha iyi hikâyeler kur. Karakterlerini derinleştir. Eserini büyüt.
          </Typography>

          <Typography variant="body" className="text-muted text-sm sm:text-base leading-relaxed">
            Roman, webtoon ve seri üretirken ihtiyacın olan profesyonel yazarlık sanatını adım adım keşfet.
          </Typography>

          {/* Hızlı Arama */}
          <div className="pt-2 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ders, kavram veya kurgu terimi ara (ör: cliffhanger, hook, webtoon)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-background/80 border border-border/80 focus:border-primary focus:outline-hidden text-sm text-text placeholder:text-muted/70 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Sağ: İlerleme & Seviye Kartı */}
        <div className="w-full lg:w-80 shrink-0 bg-background/60 backdrop-blur-md rounded-2xl border border-border/70 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">YAZAR SEVİYESİ</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Trophy size={16} className="text-amber-500" />
                <span className="font-extrabold text-text text-sm sm:text-base">
                  Seviye {levelInfo.level}: {levelInfo.title}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20">
              <Flame size={14} className="fill-orange-500" />
              <span>{streakDays} Gün</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted">
              <span>{totalXp} XP</span>
              <span>{levelInfo.nextXp} XP Hedefi</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* İstatistik Satırı */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-center">
            <div className="p-2 rounded-xl bg-card/60">
              <span className="text-[11px] text-muted block">Tamamlanan</span>
              <span className="text-sm font-black text-text">{completedCount} / {totalLessons} Ders</span>
            </div>
            <div className="p-2 rounded-xl bg-card/60">
              <span className="text-[11px] text-muted block">Kazanılan XP</span>
              <span className="text-sm font-black text-primary">+{totalXp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasyon Sekmeleri */}
      <div className="mt-8 pt-4 border-t border-border/40 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          Genel Bakış
        </button>

        <button
          onClick={() => onTabChange('paths')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'paths'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          Öğrenme Yolları
        </button>

        <button
          onClick={() => onTabChange('lessons')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'lessons'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          Tüm Dersler Kataloğu
        </button>

        <button
          onClick={() => onTabChange('badges')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'badges'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted hover:text-text hover:bg-muted/10'
          }`}
        >
          Başarılar & Rozetler
        </button>
      </div>
    </div>
  );
}
