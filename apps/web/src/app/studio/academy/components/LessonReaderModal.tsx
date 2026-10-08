'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  X, CheckCircle2, Bookmark, Clock, Award, Sparkles, Lightbulb, 
  ArrowRight, ArrowLeft, Check, HelpCircle, AlertCircle, ExternalLink,
  ChevronRight, BookOpen
} from 'lucide-react';
import { AcademyLesson } from '../types';

interface LessonReaderModalProps {
  lesson: AcademyLesson;
  onClose: () => void;
  isCompleted: boolean;
  isBookmarked: boolean;
  onToggleComplete: (lessonId: string) => void;
  onToggleBookmark: (lessonId: string) => void;
  onSelectNextLesson?: () => void;
  onSelectPrevLesson?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function LessonReaderModal({
  lesson,
  onClose,
  isCompleted,
  isBookmarked,
  onToggleComplete,
  onToggleBookmark,
  onSelectNextLesson,
  onSelectPrevLesson,
  hasNext,
  hasPrev
}: LessonReaderModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (hasSubmittedQuiz) return;
    setSelectedOption(index);
    setHasSubmittedQuiz(true);
  };

  const isQuizCorrect = lesson.quiz && selectedOption === lesson.quiz.correctAnswerIndex;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl h-[92vh] rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/40 flex items-center justify-between bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <BookOpen size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                  {lesson.category}
                </span>
                <span className="text-xs text-muted flex items-center gap-1 font-medium">
                  <Clock size={13} /> {lesson.durationMinutes} dk okuma
                </span>
                <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                  <Sparkles size={13} /> +{lesson.xp} XP
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-text truncate mt-1">
                {lesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(lesson.id)}
              className={`p-2.5 rounded-2xl border transition-all ${
                isBookmarked 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                  : 'border-border/60 text-muted hover:text-text hover:bg-muted/10'
              }`}
              title={isBookmarked ? 'Kaydedilenlerden Çıkar' : 'Daha Sonra Öğren'}
            >
              <Bookmark size={18} className={isBookmarked ? 'fill-amber-500' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl border border-border/60 text-muted hover:text-text hover:bg-muted/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar">
          
          {/* Giriş & Özet */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary p-5 rounded-2xl">
            <Typography variant="body" className="text-text font-medium leading-relaxed italic text-base">
              "{lesson.introduction}"
            </Typography>
          </div>

          {/* Ana Konseptler */}
          <div className="space-y-6">
            {lesson.coreConcepts.map((concept, idx) => (
              <div key={idx} className="space-y-2">
                <Typography variant="h3" className="font-bold text-text text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {concept.heading}
                </Typography>
                <Typography variant="body" className="text-muted leading-relaxed text-[15px]">
                  {concept.body}
                </Typography>
              </div>
            ))}
          </div>

          {/* İyi Örnek vs Zayıf Örnek Karşılaştırması */}
          {lesson.comparison && (
            <div className="border border-border/50 rounded-3xl p-5 sm:p-6 bg-muted/5 space-y-4">
              <div className="flex items-center gap-2 text-text font-bold text-base">
                <Sparkles size={18} className="text-primary" />
                <span>Uygulama: İyi Örnek vs. Zayıf Örnek</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zayıf Örnek */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide">
                    <AlertCircle size={15} />
                    <span>{lesson.comparison.weakTitle || 'Zayıf / Klişe Yaklaşım'}</span>
                  </div>
                  <p className="text-sm text-text/90 italic leading-relaxed">
                    "{lesson.comparison.weak}"
                  </p>
                </div>

                {/* Güçlü Örnek */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wide">
                    <CheckCircle2 size={15} />
                    <span>{lesson.comparison.strongTitle || 'Güçlü / Profesyonel Yaklaşım'}</span>
                  </div>
                  <p className="text-sm text-text/90 italic leading-relaxed">
                    "{lesson.comparison.strong}"
                  </p>
                </div>
              </div>

              {/* Neden? */}
              <div className="bg-card/70 border border-border/40 p-4 rounded-2xl">
                <span className="text-xs font-bold text-primary block mb-1">NEDEN BÖYLE?</span>
                <p className="text-sm text-muted leading-relaxed">
                  {lesson.comparison.reason}
                </p>
              </div>
            </div>
          )}

          {/* Profesyonel İpucu (Pro-Tip) */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
              <Lightbulb size={20} />
            </div>
            <div>
              <span className="font-bold text-amber-500 text-sm block mb-1">PROFESYONEL İPUCU</span>
              <p className="text-sm text-text leading-relaxed font-medium">
                {lesson.proTip}
              </p>
            </div>
          </div>

          {/* Readixon Studio Görevi */}
          {lesson.studioTask && (
            <div className="border border-primary/30 bg-primary/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-primary uppercase tracking-wider block">
                  READIXON STÜDYO GÖREVİ
                </span>
                <h4 className="font-bold text-text text-base">
                  {lesson.studioTask.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted max-w-xl">
                  {lesson.studioTask.description}
                </p>
              </div>
              <Link
                href={lesson.studioTask.actionUrl}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 hover:bg-primary/90 transition-transform active:scale-95 shadow-sm shadow-primary/20"
              >
                <span>{lesson.studioTask.actionLabel}</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          )}

          {/* Mini Test (Quiz) */}
          {lesson.quiz && (
            <div className="border border-border/50 rounded-3xl p-6 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-text text-base">
                  <HelpCircle size={18} className="text-primary" />
                  <span>Bilgini Test Et (+20 XP)</span>
                </div>
                {hasSubmittedQuiz && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isQuizCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {isQuizCorrect ? 'Doğru Cevap!' : 'Tekrar Düşün'}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-text">
                {lesson.quiz.question}
              </p>

              <div className="space-y-2">
                {lesson.quiz.options.map((option, idx) => {
                  let stateStyle = 'border-border/60 hover:border-primary/50 hover:bg-muted/10';
                  if (hasSubmittedQuiz) {
                    if (idx === lesson.quiz?.correctAnswerIndex) {
                      stateStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold';
                    } else if (idx === selectedOption) {
                      stateStyle = 'border-red-500 bg-red-500/10 text-red-600';
                    } else {
                      stateStyle = 'opacity-50 border-border/40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasSubmittedQuiz}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-sm flex items-center justify-between ${stateStyle}`}
                    >
                      <span>{option}</span>
                      {hasSubmittedQuiz && idx === lesson.quiz?.correctAnswerIndex && (
                        <Check size={16} className="text-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasSubmittedQuiz && (
                <div className="p-4 rounded-2xl bg-muted/10 text-xs text-muted leading-relaxed">
                  <strong className="text-text block mb-1">Açıklama:</strong>
                  {lesson.quiz.explanation}
                </div>
              )}
            </div>
          )}

          {/* Anahtar Çıkarımlar */}
          <div className="border border-border/40 rounded-3xl p-6 bg-card space-y-3">
            <h4 className="font-bold text-text text-sm uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>Dersin Özeti</span>
            </h4>
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 border-t border-border/40 bg-card/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {hasPrev && (
              <button
                onClick={onSelectPrevLesson}
                className="px-3.5 py-2 rounded-2xl border border-border/60 text-xs font-semibold text-muted hover:text-text hover:bg-muted/10 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} /> Önceki
              </button>
            )}
            {hasNext && (
              <button
                onClick={onSelectNextLesson}
                className="px-3.5 py-2 rounded-2xl border border-border/60 text-xs font-semibold text-muted hover:text-text hover:bg-muted/10 flex items-center gap-1.5 transition-colors"
              >
                Sonraki <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleComplete(lesson.id)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              <CheckCircle2 size={17} />
              <span>{isCompleted ? 'Ders Tamamlandı ✓' : 'Dersi Tamamla (+50 XP)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
