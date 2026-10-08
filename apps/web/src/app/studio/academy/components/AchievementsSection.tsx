'use client';

import React from 'react';
import { Typography } from '@readixon/ui';
import { 
  Trophy, Award, Sparkles, Flame, CheckCircle2, Lock, 
  GraduationCap, Share2, Download
} from 'lucide-react';
import { AcademyBadge } from '../types';

interface AchievementsSectionProps {
  totalXp: number;
  completedLessonCount: number;
  streakDays: number;
  badges: AcademyBadge[];
}

export default function AchievementsSection({
  totalXp,
  completedLessonCount,
  streakDays,
  badges
}: AchievementsSectionProps) {
  const isBadgeUnlocked = (badge: AcademyBadge) => {
    if (badge.requiredLessonCount && completedLessonCount >= badge.requiredLessonCount) return true;
    if (badge.requiredXp && totalXp >= badge.requiredXp) return true;
    return false;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Üst İstatistik Özeti */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl border border-border/60 bg-card/60 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            <Trophy size={28} />
          </div>
          <div>
            <span className="text-xs text-muted block font-bold">TOPLAM AKADEMİ PUANI</span>
            <span className="text-2xl font-black text-text">{totalXp} XP</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border/60 bg-card/60 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <span className="text-xs text-muted block font-bold">TAMAMLANAN EĞİTİM</span>
            <span className="text-2xl font-black text-text">{completedLessonCount} Ders</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border/60 bg-card/60 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500 shrink-0">
            <Flame size={28} />
          </div>
          <div>
            <span className="text-xs text-muted block font-bold">ÖĞRENME SERİSİ</span>
            <span className="text-2xl font-black text-text">{streakDays} Gün</span>
          </div>
        </div>
      </div>

      {/* Rozetler Listesi */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-text">Kazanılabilir Rozetler</h3>
          <p className="text-xs sm:text-sm text-muted">
            Akademide ders tamamladıkça ve testleri çözdükçe yazar profiline eklenen özel rozetler.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const unlocked = isBadgeUnlocked(badge);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                  unlocked
                    ? 'border-amber-500/30 bg-amber-500/5 shadow-xs'
                    : 'border-border/40 bg-card/40 opacity-70'
                }`}
              >
                <div className={`p-3.5 rounded-2xl shrink-0 ${
                  unlocked ? 'bg-amber-500/20 text-amber-500' : 'bg-muted/10 text-muted'
                }`}>
                  {unlocked ? <Award size={24} /> : <Lock size={24} />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-text text-base truncate">
                      {badge.title}
                    </h4>
                    {unlocked && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        Kazanıldı
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dijital Sertifika Vitrini */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
            <GraduationCap size={15} />
            <span>RESMİ READIXON SERTİFİKASI</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-text">
            Yazar Akademisi Mezuniyet Programı
          </h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Roman veya Webtoon öğrenme yollarını tamamladığında doğrulanmış dijital yazar sertifikan hazır olacak. Sertifikanı yazar profiline ekleyebilir ve sosyal medyada paylaşabilirsin.
          </p>
          <div className="pt-2 flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-muted">
            <CheckCircle2 size={15} className="text-primary" />
            <span>{completedLessonCount >= 5 ? 'İlk Yol Tamamlandı' : '5 Ders Tamamlandığında Aktifleşir'}</span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex justify-center">
          <div className="w-56 h-36 rounded-2xl border-2 border-primary/40 bg-card/90 shadow-xl p-4 flex flex-col justify-between items-center text-center relative rotate-2 hover:rotate-0 transition-transform">
            <GraduationCap size={28} className="text-primary mt-1" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">READIXON AKADEMİ</span>
              <span className="text-xs font-black text-text block">Başarı Sertifikası</span>
            </div>
            <span className="text-[10px] font-semibold text-primary/80">Onaylı Yazar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
