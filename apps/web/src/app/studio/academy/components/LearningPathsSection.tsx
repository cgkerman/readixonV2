'use client';

import React, { useState } from 'react';
import { Typography } from '@readixon/ui';
import { 
  BookOpen, Compass, Layers, Sparkles, ChevronRight, CheckCircle2, 
  Clock, ArrowRight, Play
} from 'lucide-react';
import { LearningPath, AcademyLesson } from '../types';

interface LearningPathsSectionProps {
  paths: LearningPath[];
  lessons: AcademyLesson[];
  completedLessonIds: string[];
  onOpenLesson: (lesson: AcademyLesson) => void;
}

export default function LearningPathsSection({
  paths,
  lessons,
  completedLessonIds,
  onOpenLesson
}: LearningPathsSectionProps) {
  const [expandedPathId, setExpandedPathId] = useState<string | null>(null);

  const getPathIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass size={24} className="text-blue-500" />;
      case 'BookOpen':
        return <BookOpen size={24} className="text-amber-500" />;
      case 'Layers':
        return <Layers size={24} className="text-teal-500" />;
      case 'Sparkles':
      default:
        return <Sparkles size={24} className="text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary block mb-1">
            ANA MÜFREDAT
          </span>
          <h2 className="text-2xl font-black text-text tracking-tight">
            Öğrenme Yolları
          </h2>
          <p className="text-sm text-muted">
            Hedefine uygun yolu seç; sıfırdan profesyonel bir esere adım adım ilerle.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paths.map((path) => {
          const pathLessons = lessons.filter((l) => path.lessonIds.includes(l.id));
          const completedCount = pathLessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const progressPercent = pathLessons.length > 0
            ? Math.round((completedCount / pathLessons.length) * 100)
            : 0;
          const isExpanded = expandedPathId === path.id;

          return (
            <div
              key={path.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                isExpanded
                  ? 'border-primary/60 bg-card shadow-xl ring-1 ring-primary/20'
                  : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-card hover:shadow-md'
              }`}
            >
              {/* Üst Kısım: Başlık & İlerleme */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="p-3.5 rounded-2xl bg-muted/10 border border-border/40 shrink-0">
                    {getPathIcon(path.iconName)}
                  </div>

                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {path.badge}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted/90 block">
                    {path.tagline}
                  </span>
                  <h3 className="text-xl font-black text-text mt-0.5">
                    {path.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                    {path.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">
                      {completedCount} / {pathLessons.length} Ders Tamamlandı
                    </span>
                    <span className="text-primary font-bold">%{progressPercent}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Genişletilmiş Ders Listesi */}
              {isExpanded && (
                <div className="border-t border-border/40 bg-muted/5 p-4 sm:p-6 space-y-2.5 animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">
                    MÜFREDAT DERSLERİ ({pathLessons.length})
                  </span>

                  {pathLessons.map((lesson, idx) => {
                    const isLessonDone = completedLessonIds.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onOpenLesson(lesson)}
                        className="p-3.5 rounded-2xl border border-border/40 hover:border-primary/50 bg-card hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isLessonDone 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-muted/20 text-muted group-hover:bg-primary/10 group-hover:text-primary'
                          }`}>
                            {isLessonDone ? <CheckCircle2 size={15} /> : idx + 1}
                          </div>

                          <div className="min-w-0">
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors truncate block">
                              {lesson.title}
                            </span>
                            <span className="text-[11px] text-muted flex items-center gap-1.5">
                              <Clock size={11} /> {lesson.durationMinutes} dk · +{lesson.xp} XP
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <span>Başla</span>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Alt Buton Barı */}
              <div className="p-4 bg-muted/10 border-t border-border/40 flex items-center justify-between">
                <button
                  onClick={() => setExpandedPathId(isExpanded ? null : path.id)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>{isExpanded ? 'Ders Listesini Gizle' : 'Dersleri Göster'}</span>
                  <ChevronRight size={14} className={isExpanded ? '-rotate-90 transition-transform' : 'rotate-90 transition-transform'} />
                </button>

                {pathLessons.length > 0 && (
                  <button
                    onClick={() => {
                      // İlk tamamlanmamış dersi veya ilk dersi aç
                      const nextLesson = pathLessons.find((l) => !completedLessonIds.includes(l.id)) || pathLessons[0];
                      onOpenLesson(nextLesson);
                    }}
                    className="px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Yola Başla</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
