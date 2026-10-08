'use client';

import React from 'react';
import { Typography } from '@readixon/ui';
import { Zap, Clock, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AcademyLesson } from '../types';

interface QuickLessonsSectionProps {
  lessons: AcademyLesson[];
  completedLessonIds: string[];
  onOpenLesson: (lesson: AcademyLesson) => void;
}

export default function QuickLessonsSection({
  lessons,
  completedLessonIds,
  onOpenLesson
}: QuickLessonsSectionProps) {
  const quickLessons = lessons.filter((l) => l.isQuickLesson || l.durationMinutes <= 7);

  return (
    <div className="space-y-5 mb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-500 mb-1">
            <Zap size={14} className="fill-amber-500" />
            <span>HIZLI ÖĞREN</span>
          </div>
          <h2 className="text-2xl font-black text-text tracking-tight">
            Bugün 10 Dakikada Öğren
          </h2>
          <p className="text-sm text-muted">
            Vaktin kısıtlı mı? Tek bir edebi kavramı veya tekniği hemen kavra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLessons.slice(0, 6).map((lesson) => {
          const isDone = completedLessonIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              onClick={() => onOpenLesson(lesson)}
              className="rounded-3xl border border-border/50 bg-card hover:border-amber-500/40 hover:bg-card/90 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                    {lesson.level}
                  </span>

                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {lesson.durationMinutes} dk
                    </span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      <Sparkles size={11} /> +{lesson.xp}
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-text text-base group-hover:text-amber-500 transition-colors line-clamp-2">
                  {lesson.title}
                </h3>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {lesson.summary}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-border/30 flex items-center justify-between text-xs font-bold">
                {isDone ? (
                  <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={14} /> Okundu
                  </span>
                ) : (
                  <span className="text-muted group-hover:text-amber-500 transition-colors flex items-center gap-1">
                    Dersi Aç <ChevronRight size={14} />
                  </span>
                )}
                
                <span className="text-[11px] text-muted/70 font-normal">
                  {lesson.category.split('&')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
