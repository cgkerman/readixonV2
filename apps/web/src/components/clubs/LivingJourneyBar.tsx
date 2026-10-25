'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, Flag, CheckCircle2, ChevronRight, Sparkles, Plus, Award } from 'lucide-react';
import type { ClubJourney, ClubMember, ClubJourneyMilestone } from '@readixon/core';

interface LivingJourneyBarProps {
  journey: ClubJourney | null;
  userMembership: ClubMember | null;
  isLeader: boolean;
  onStartNewJourney?: () => void;
  onArchiveJourney?: () => void;
}

export function LivingJourneyBar({
  journey,
  userMembership,
  isLeader,
  onStartNewJourney,
  onArchiveJourney,
}: LivingJourneyBarProps) {
  if (!journey) {
    return (
      <div className="rounded-3xl bg-card border border-border/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Aktif Bir Okuma Seferi Yok</h4>
            <p className="text-xs text-muted mt-0.5">
              Kulüp şu anda ortak bir kitap maratonunda değil.
            </p>
          </div>
        </div>

        {isLeader && onStartNewJourney && (
          <button
            type="button"
            onClick={onStartNewJourney}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/10 active:scale-95"
          >
            <Plus size={15} />
            <span>Yeni Sefer Başlat</span>
          </button>
        )}
      </div>
    );
  }

  const userChapter = userMembership?.currentChapterIndex || 0;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-card via-card/90 to-primary/5 border border-primary/20 p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-14 rounded-xl bg-muted/40 overflow-hidden shrink-0 shadow-md border border-border/60">
            {journey.storyCoverUrl ? (
              <img src={journey.storyCoverUrl} alt={journey.storyTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary font-bold text-[10px] tracking-wide uppercase">
                Canlı Okuma Seferi
              </span>
              <span className="text-xs text-muted font-medium flex items-center gap-1">
                <Calendar size={12} />
                {journey.milestones?.length || 0} Durak
              </span>
            </div>
            <h3 className="font-extrabold text-base md:text-lg text-foreground mt-0.5">
              {journey.title}
            </h3>
            <p className="text-xs text-muted">
              Okunan Eser: <strong className="text-foreground">{journey.storyTitle}</strong> ({journey.totalChapters} Bölüm)
            </p>
          </div>
        </div>

        {isLeader && (
          <div className="flex items-center gap-2.5 shrink-0">
            {onArchiveJourney && (
              <button
                type="button"
                onClick={onArchiveJourney}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-500 hover:text-black font-bold text-xs transition-all shadow-xs active:scale-95 border border-amber-500/30"
                title="Seferi Tamamla ve Arşive Taşı"
              >
                <Award size={13} />
                <span>Seferi Tamamla & Arşivle</span>
              </button>
            )}

            {onStartNewJourney && (
              <button
                type="button"
                onClick={onStartNewJourney}
                className="text-xs font-semibold text-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Seferi Güncelle</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Milestones Track / Roadmap */}
      <div className="pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {journey.milestones?.map((milestone: ClubJourneyMilestone, idx: number) => {
            const isCompletedByUser = userChapter >= milestone.targetChapterIndex;
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  isCompletedByUser
                    ? 'bg-primary/10 border-primary/40 shadow-sm'
                    : 'bg-muted/10 border-border/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {milestone.dayNumber}. Gün
                  </span>
                  {isCompletedByUser ? (
                    <CheckCircle2 size={14} className="text-primary" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-border" />
                  )}
                </div>

                <p className="font-bold text-xs text-foreground truncate">
                  {milestone.targetChapterTitle}
                </p>

                <div className="flex items-center justify-between text-[11px] text-muted mt-2 pt-1.5 border-t border-border/40">
                  <span>Hedef: B.{milestone.targetChapterIndex}</span>
                  {isCompletedByUser && (
                    <span className="font-bold text-primary text-[10px]">Tamamlandı</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
