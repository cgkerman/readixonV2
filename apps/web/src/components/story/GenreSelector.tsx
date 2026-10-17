'use client';

import React, { useState, useMemo } from 'react';
import { 
  MAIN_GENRES, 
  getMainGenreById, 
  type MainGenreItem, 
  type SubGenreItem 
} from '@readixon/core';
import { 
  Search, 
  Check, 
  X, 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw,
  Layers,
  BookOpen
} from 'lucide-react';
import { getGenreIcon } from './genreIcons';
import { GenreFinderModal } from './GenreFinderModal';

interface GenreSelectorProps {
  selectedMainGenre?: string;
  selectedSubGenres?: string[];
  onChange: (mainGenre: string | undefined, subGenres: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedMainGenre,
  selectedSubGenres = [],
  onChange,
  className = '',
  disabled = false,
}) => {
  const [mainSearch, setMainSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [isChangingMain, setIsChangingMain] = useState(!selectedMainGenre);
  const [hoveredSubGenre, setHoveredSubGenre] = useState<SubGenreItem | null>(null);
  const [showFinder, setShowFinder] = useState(false);

  const currentMainGenre = useMemo<MainGenreItem | undefined>(() => {
    return getMainGenreById(selectedMainGenre);
  }, [selectedMainGenre]);

  // Filtrelenmiş Ana Türler
  const filteredMainGenres = useMemo(() => {
    if (!mainSearch.trim()) return MAIN_GENRES;
    const q = mainSearch.toLowerCase().trim();
    return MAIN_GENRES.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.subGenres.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [mainSearch]);

  // Filtrelenmiş Alt Türler
  const filteredSubGenres = useMemo(() => {
    if (!currentMainGenre) return [];
    if (!subSearch.trim()) return currentMainGenre.subGenres;
    const q = subSearch.toLowerCase().trim();
    return currentMainGenre.subGenres.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [currentMainGenre, subSearch]);

  const handleSelectMainGenre = (genreId: string) => {
    if (disabled) return;
    if (genreId === selectedMainGenre) {
      setIsChangingMain(false);
      return;
    }

    // Ana tür değiştiğinde alt türleri sıfırla (Kural gereği)
    onChange(genreId, []);
    setIsChangingMain(false);
    setSubSearch('');
  };

  const handleToggleSubGenre = (subGenreId: string) => {
    if (disabled || !selectedMainGenre) return;
    const exists = selectedSubGenres.includes(subGenreId);
    let nextSubGenres: string[];
    if (exists) {
      nextSubGenres = selectedSubGenres.filter((id) => id !== subGenreId);
    } else {
      nextSubGenres = [...selectedSubGenres, subGenreId];
    }
    onChange(selectedMainGenre, nextSubGenres);
  };

  const handleClearSubGenres = () => {
    if (disabled || !selectedMainGenre) return;
    onChange(selectedMainGenre, []);
  };

  const CurrentIcon = currentMainGenre ? getGenreIcon(currentMainGenre.id) : BookOpen;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* ── 1. ANA TÜR SEÇİMİ ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <label className="text-xs sm:text-sm font-bold text-foreground tracking-wide flex items-center gap-1.5">
              <span>Ana Tür</span>
              <span className="text-[10px] text-muted-foreground bg-muted/20 border border-border/50 px-2 py-0.5 rounded-full font-semibold">
                Zorunlu • 1 Adet
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFinder(true)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/25 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              title="Soruları cevaplayarak hikâyenize en uygun türü belirleyin"
            >
              <Sparkles size={12} className="text-primary" />
              <span>Türümü Bul</span>
            </button>

            {currentMainGenre && !isChangingMain && (
              <button
                type="button"
                onClick={() => setIsChangingMain(true)}
                disabled={disabled}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} />
                <span>Türü Değiştir</span>
              </button>
            )}
          </div>
        </div>

        {/* Seçili Ana Tür Kartı (Değiştirme modu kapalıysa) */}
        {currentMainGenre && !isChangingMain ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CurrentIcon size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {currentMainGenre.name}
                  </span>
                  <span className="text-[10px] font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full">
                    {currentMainGenre.subGenres.length} Alt Tür
                  </span>
                </div>
                <p className="text-[11px] text-muted truncate max-w-sm sm:max-w-md mt-0.5">
                  {currentMainGenre.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChangingMain(true)}
              disabled={disabled}
              className="text-xs font-semibold text-primary hover:text-primary/80 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
            >
              Değiştir
            </button>
          </div>
        ) : (
          /* Ana Tür Seçici Çipleri / Arama */
          <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="30 Ana Tür arasından ara (örn: Fantastik, Bilim Kurgu, Asya...)"
                value={mainSearch}
                onChange={(e) => setMainSearch(e.target.value)}
                disabled={disabled}
                className="w-full pl-8 pr-8 py-2 bg-muted/15 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-all"
              />
              {mainSearch && (
                <button
                  type="button"
                  onClick={() => setMainSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredMainGenres.map((g) => {
                const isSelected = selectedMainGenre === g.id;
                const GenreIcon = getGenreIcon(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectMainGenre(g.id)}
                    disabled={disabled}
                    className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                        : 'bg-card/70 hover:bg-card border-border/60 hover:border-primary/40 text-foreground hover:text-primary'
                    }`}
                    title={g.description}
                  >
                    <GenreIcon
                      size={13}
                      strokeWidth={2}
                      className={isSelected ? 'text-white' : 'text-primary/70 group-hover:text-primary shrink-0'}
                    />
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>

            {filteredMainGenres.length === 0 && (
              <p className="text-center text-xs text-muted py-3">
                Aramanızla eşleşen ana tür bulunamadı.
              </p>
            )}

            {currentMainGenre && isChangingMain && (
              <div className="flex justify-end pt-1.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsChangingMain(false)}
                  className="text-xs font-medium text-muted hover:text-foreground px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. ALT TÜR SEÇİMİ ── */}
      {currentMainGenre && (
        <div className="space-y-3 pt-3 border-t border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-bold text-foreground tracking-wide flex items-center gap-1.5">
                <span>Alt Türler ({currentMainGenre.name})</span>
                <span className="text-[10px] text-muted bg-muted/20 border border-border/40 px-2 py-0.5 rounded-full font-medium">
                  Sınırsız Seçim
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">
                {selectedSubGenres.length} seçildi
              </span>
              {selectedSubGenres.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSubGenres}
                  disabled={disabled}
                  className="text-[11px] text-muted hover:text-red-400 transition-colors cursor-pointer"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Alt Tür Arama */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder={`${currentMainGenre.name} alt türleri içinde ara...`}
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              disabled={disabled}
              className="w-full pl-8 pr-8 py-2 bg-muted/10 border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-all"
            />
            {subSearch && (
              <button
                type="button"
                onClick={() => setSubSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Alt Tür Çipleri */}
          <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto p-1">
            {filteredSubGenres.map((sub) => {
              const isSelected = selectedSubGenres.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleToggleSubGenre(sub.id)}
                  onMouseEnter={() => setHoveredSubGenre(sub)}
                  onMouseLeave={() => setHoveredSubGenre(null)}
                  disabled={disabled}
                  className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs border border-primary font-semibold'
                      : 'bg-card/70 hover:bg-muted/30 border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                  title={sub.description}
                >
                  {isSelected && <Check size={11} className="shrink-0 stroke-[2.5]" />}
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>

          {filteredSubGenres.length === 0 && (
            <p className="text-center text-xs text-muted py-3">
              Aramanızla eşleşen alt tür bulunamadı.
            </p>
          )}

          {/* Canlı Açıklama Önizleme Çubuğu */}
          <div className="min-h-[34px] px-3 py-2 rounded-lg bg-muted/10 border border-border/40 text-[11px] text-muted flex items-start gap-2">
            <HelpCircle size={13} className="text-primary/70 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              {hoveredSubGenre ? (
                <>
                  <strong className="text-foreground mr-1.5">
                    {hoveredSubGenre.name}:
                  </strong>
                  <span>{hoveredSubGenre.description}</span>
                </>
              ) : (
                <span className="text-muted/60 italic">
                  Bir alt türün üzerine gelerek açıklamasını inceleyebilirsiniz.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TÜR BULUCU SİHİRBAZ MODALI ── */}
      <GenreFinderModal
        isOpen={showFinder}
        onClose={() => setShowFinder(false)}
        onApply={(mainGenreId, subGenreIds) => {
          onChange(mainGenreId, subGenreIds);
          setIsChangingMain(false);
        }}
      />
    </div>
  );
};
