'use client';

import React from 'react';
import { Typography } from '@readixon/ui';
import { Play, Clock, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { AcademyLesson } from '../types';

interface ContinueCardProps {
  lesson: AcademyLesson;
  isCompleted: boolean;
  onOpenLesson: (lesson: AcademyLesson) => void;
}

export default function ContinueCard({
  lesson,
  isCompleted,
  onOpenLesson
}: ContinueCardProps) {
  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/15 transition-all" />

      <div className="relative z-10 space-y-2 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/15">
            {isCompleted ? 'TEKRAR GÖZDEN GEÇİR' : 'KALDIĞIN YERDEN DEVAM ET'}
          </span>
          <span className="text-xs text-muted flex items-center gap-1 font-medium">
            <Clock size={13} /> {lesson.durationMinutes} dk
          </span>
          <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
            <Sparkles size={13} /> +{lesson.xp} XP
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-text group-hover:text-primary transition-colors">
          {lesson.title}
        </h3>

        <p className="text-xs sm:text-sm text-muted line-clamp-2">
          {lesson.summary}
        </p>
      </div>

      <div className="relative z-10 shrink-0">
        <button
          onClick={() => onOpenLesson(lesson)}
          className="w-full md:w-auto px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={17} />
              <span>Dersi İncele</span>
            </>
          ) : (
            <>
              <Play size={17} className="fill-primary-foreground" />
              <span>Dersine Devam Et</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
