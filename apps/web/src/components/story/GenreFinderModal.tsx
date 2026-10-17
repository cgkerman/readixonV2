'use client';

import React, { useState, useMemo } from 'react';
import { 
  GENRE_FINDER_QUESTIONS, 
  calculateGenreMatches, 
  type GenreFinderResult 
} from '@readixon/core';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Check, 
  Compass, 
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react';
import { getGenreIcon } from './genreIcons';
import { toast } from 'sonner';

interface GenreFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (mainGenreId: string, subGenreIds: string[]) => void;
}

export const GenreFinderModal: React.FC<GenreFinderModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<GenreFinderResult | null>(null);

  // Seçili ana tür ve seçili alt türler (Sonuç ekranında düzenlenebilir)
  const [selectedMainGenreId, setSelectedMainGenreId] = useState<string>('');
  const [selectedSubGenreIds, setSelectedSubGenreIds] = useState<string[]>([]);
  const [hoveredSubGenreDesc, setHoveredSubGenreDesc] = useState<string | null>(null);

  const questions = GENRE_FINDER_QUESTIONS;
  const currentQuestion = questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  // Aktif seçili ana türün nesnesi (Hook'lar en başta olmalı)
  const activeMainMatch = useMemo(() => {
    if (!result) return null;
    if (result.topMatch.mainGenre.id === selectedMainGenreId) {
      return result.topMatch;
    }
    const alt = result.alternatives.find((a) => a.mainGenre.id === selectedMainGenreId);
    return alt || result.topMatch;
  }, [result, selectedMainGenreId]);

  if (!isOpen) return null;

  const currentAnswer = answers[currentQuestion?.id];

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;

    if (currentQuestion.multiSelect) {
      const currentList = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (currentList.includes(optionId)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: currentList.filter((id) => id !== optionId),
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...currentList, optionId],
        });
      }
    } else {
      // Tekli seçim
      setAnswers({
        ...answers,
        [currentQuestion.id]: optionId,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tüm sorular bitti, analizi hesapla
      finishQuiz();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const finishQuiz = () => {
    const calculatedResult = calculateGenreMatches(answers);
    setResult(calculatedResult);
    setSelectedMainGenreId(calculatedResult.topMatch.mainGenre.id);
    
    // Varsayılan olarak en yüksek eşleşen ilk 3 alt türü işaretle
    const defaultSubs = calculatedResult.topMatch.recommendedSubGenres
      .slice(0, 3)
      .map((s) => s.id);
    setSelectedSubGenreIds(defaultSubs);

    setIsCompleted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setResult(null);
    setSelectedMainGenreId('');
    setSelectedSubGenreIds([]);
  };

  const handleToggleSubGenre = (subId: string) => {
    if (selectedSubGenreIds.includes(subId)) {
      setSelectedSubGenreIds(selectedSubGenreIds.filter((id) => id !== subId));
    } else {
      setSelectedSubGenreIds([...selectedSubGenreIds, subId]);
    }
  };

  const handleApplyToStory = () => {
    if (!selectedMainGenreId) return;

    onApply(selectedMainGenreId, selectedSubGenreIds);
    toast.success('🎉 Türler hikâyenize başarıyla uygulandı!');
    onClose();
  };

  const ActiveIcon = activeMainMatch ? getGenreIcon(activeMainMatch.mainGenre.id) : Compass;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── ÜST BAR / PROGRESS ── */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Compass size={17} strokeWidth={2.2} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <span>Edebi Pusula: Türümü Bul</span>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                    Akıllı Sihirbaz
                  </span>
                </h3>
                <p className="text-xs text-muted">
                  {isCompleted 
                    ? 'Analiz tamamlandı • Eseriniz için önerilen edebi türler' 
                    : `Soru ${currentStep + 1} / ${questions.length} • Hikâye mimarinize en uygun türü belirliyoruz`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>

          {/* İlerleme Çubuğu */}
          {!isCompleted && (
            <div className="w-full h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* ── İÇERİK ALANI ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isCompleted && currentQuestion ? (
            /* SORU VE ŞIKLAR GÖRÜNÜMÜ */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  {currentQuestion.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  {currentQuestion.subtitle}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.multiSelect
                    ? Array.isArray(currentAnswer) && currentAnswer.includes(option.id)
                    : currentAnswer === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-primary/15 border-primary shadow-xs ring-1 ring-primary/40'
                          : 'bg-muted/10 hover:bg-muted/20 border-border/60 hover:border-primary/40 text-foreground'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-border/80 bg-background text-transparent'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </span>

                      <div className="flex-1 min-w-0">
                        <span className={`block text-xs sm:text-sm font-semibold ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="block text-xs text-muted mt-0.5 leading-relaxed">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isCompleted && result && activeMainMatch ? (
            /* ANALİZ VE SONUÇ GÖRÜNÜMÜ */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Birincil Öneri Kartı */}
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/30 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <span className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                      <ActiveIcon size={22} strokeWidth={2.2} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Önerilen Ana Tür
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-white shadow-xs">
                          %{activeMainMatch.percentage} Eşleşme
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-extrabold text-foreground mt-0.5">
                        {activeMainMatch.mainGenre.name}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed mt-1 max-w-xl">
                        {activeMainMatch.mainGenre.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Önerilen Alt Türler */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span>Önerilen Alt Türler (İstediklerinizi Seçin)</span>
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    {selectedSubGenreIds.length} alt tür işaretlendi
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeMainMatch.recommendedSubGenres.map((sub) => {
                    const isChecked = selectedSubGenreIds.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleToggleSubGenre(sub.id)}
                        onMouseEnter={() => {
                          const item = activeMainMatch.mainGenre.subGenres.find((s) => s.id === sub.id);
                          setHoveredSubGenreDesc(item ? `${item.name}: ${item.description}` : null);
                        }}
                        onMouseLeave={() => setHoveredSubGenreDesc(null)}
                        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-primary text-white border border-primary shadow-xs'
                            : 'bg-card hover:bg-muted/30 border border-border/70 text-foreground hover:border-primary/50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'border-white bg-white/20 text-white'
                            : 'border-border/80 bg-background text-transparent'
                        }`}>
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span>{sub.name}</span>
                        <span className={`text-[10px] ${isChecked ? 'text-white/80' : 'text-primary'}`}>
                          %{sub.percentage}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Alt Tür Canlı Açıklama İpucu */}
                <div className="min-h-[32px] px-3 py-2 rounded-lg bg-muted/15 border border-border/40 text-[11px] text-muted flex items-start gap-2">
                  <HelpCircle size={13} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">
                    {hoveredSubGenreDesc ? (
                      <span>{hoveredSubGenreDesc}</span>
                    ) : (
                      <span className="text-muted/70 italic">
                        Alt türlerin üzerine gelerek açıklamalarını okuyabilir, istediklerinizi seçip kaldırabilirsiniz.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Diğer Güçlü Adaylar (Alternatifler) */}
              {result.alternatives.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block">
                    Diğer Güçlü Tür Adayları:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {result.alternatives.map((alt) => {
                      const AltIcon = getGenreIcon(alt.mainGenre.id);
                      const isChosen = selectedMainGenreId === alt.mainGenre.id;
                      return (
                        <button
                          key={alt.mainGenre.id}
                          type="button"
                          onClick={() => {
                            setSelectedMainGenreId(alt.mainGenre.id);
                            setSelectedSubGenreIds(alt.recommendedSubGenres.slice(0, 3).map((s) => s.id));
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-primary/15 border-primary ring-1 ring-primary/40'
                              : 'bg-muted/10 hover:bg-muted/20 border-border/60 hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AltIcon size={14} className="text-primary shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate">
                              {alt.mainGenre.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-primary ml-1 shrink-0">
                            %{alt.percentage}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* ── ALT BUTON BAR ── */}
        <div className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2">
          {!isCompleted ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft size={15} />
                <span>Önceki Soru</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestion?.multiSelect && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-3 py-2 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    Atla
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!currentQuestion?.multiSelect && !currentAnswer}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentStep === questions.length - 1 ? 'Sonuçları Gör' : 'Devam Et'}</span>
                  {currentStep === questions.length - 1 ? (
                    <Sparkles size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Yeniden Test Et</span>
              </button>

              <button
                type="button"
                onClick={handleApplyToStory}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check size={16} strokeWidth={2.5} />
                <span>Bu Türleri Eserime Uygula</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
