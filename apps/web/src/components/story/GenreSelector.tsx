'use client';

import React, { useState, useMemo } from 'react';
import { 
  MAIN_GENRES, 
  getMainGenreById, 
  type MainGenreItem, 
  type SubGenreItem,
  MAX_SECONDARY_GENRES,
  MAX_CUSTOM_SUB_GENRES
} from '@readixon/core';
import { 
  Search, 
  Check, 
  X, 
  Sparkles, 
  HelpCircle, 
  RefreshCw,
  Plus,
  Crown,
  Layers,
  BookOpen,
  Tag,
  AlertCircle
} from 'lucide-react';
import { getGenreIcon } from './genreIcons';
import { GenreFinderModal } from './GenreFinderModal';

export interface GenreSelectorProps {
  /** Birincil (Zorunlu) Ana Tür */
  selectedMainGenre?: string;
  /** İkincil (Opsiyonel) Ana Türler (Max 2 adet) */
  selectedSecondaryGenres?: string[];
  /** Seçilen Resmi Alt Türler */
  selectedSubGenres?: string[];
  /** Yazar Tanımlı Özel Alt Türler / Trope'lar */
  customSubGenres?: string[];
  /** Değişiklik Callback'i (Geriye dönük uyumlu) */
  onChange: (
    mainGenre: string | undefined,
    subGenres: string[],
    secondaryGenres?: string[],
    customSubGenres?: string[]
  ) => void;
  className?: string;
  disabled?: boolean;
  maxSecondaryGenres?: number;
  maxCustomSubGenres?: number;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedMainGenre,
  selectedSecondaryGenres = [],
  selectedSubGenres = [],
  customSubGenres = [],
  onChange,
  className = '',
  disabled = false,
  maxSecondaryGenres = MAX_SECONDARY_GENRES,
  maxCustomSubGenres = MAX_CUSTOM_SUB_GENRES,
}) => {
  // Arama durumları
  const [mainSearch, setMainSearch] = useState('');
  const [secondarySearch, setSecondarySearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Modlar & Açılır pencereler
  const [isChangingPrimary, setIsChangingPrimary] = useState(!selectedMainGenre);
  const [isAddingSecondary, setIsAddingSecondary] = useState(false);
  const [showFinder, setShowFinder] = useState(false);

  // Aktif alt tür sekmesi: 'all' veya spesifik genreId
  const [activeTabGenreId, setActiveTabGenreId] = useState<string>('all');

  // Özel alt tür metin girişi
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Üzerine gelinen alt tür (hover açıklaması için)
  const [hoveredSubGenre, setHoveredSubGenre] = useState<SubGenreItem | null>(null);

  // 1. Birincil Ana Tür Nesnesi
  const currentPrimaryGenre = useMemo<MainGenreItem | undefined>(() => {
    return getMainGenreById(selectedMainGenre);
  }, [selectedMainGenre]);

  // 2. İkincil Ana Tür Nesneleri
  const currentSecondaryGenres = useMemo<MainGenreItem[]>(() => {
    return selectedSecondaryGenres
      .map((id) => getMainGenreById(id))
      .filter((g): g is MainGenreItem => Boolean(g));
  }, [selectedSecondaryGenres]);

  // 3. Seçili TÜM Ana Türler (Birincil + İkinciller)
  const allSelectedMainGenres = useMemo<MainGenreItem[]>(() => {
    const list: MainGenreItem[] = [];
    if (currentPrimaryGenre) list.push(currentPrimaryGenre);
    for (const sec of currentSecondaryGenres) {
      if (!list.some((g) => g.id === sec.id)) {
        list.push(sec);
      }
    }
    return list;
  }, [currentPrimaryGenre, currentSecondaryGenres]);

  // Filtrelenmiş Birincil Ana Türler Listesi
  const filteredPrimaryGenres = useMemo(() => {
    if (!mainSearch.trim()) return MAIN_GENRES;
    const q = mainSearch.toLowerCase().trim();
    return MAIN_GENRES.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.subGenres.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [mainSearch]);

  // İkincil Tür için seçilebilir liste (Birincil ve zaten seçili olanlar hariç)
  const availableForSecondary = useMemo(() => {
    const excludedIds = new Set([
      selectedMainGenre,
      ...selectedSecondaryGenres
    ].filter(Boolean));

    let list = MAIN_GENRES.filter((g) => !excludedIds.has(g.id));
    if (!secondarySearch.trim()) return list;

    const q = secondarySearch.toLowerCase().trim();
    return list.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.subGenres.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [selectedMainGenre, selectedSecondaryGenres, secondarySearch]);

  // Alt Türler: Seçili ana türlerin tüm alt türleri (veya aktif sekmeye göre)
  const availableSubGenres = useMemo(() => {
    if (allSelectedMainGenres.length === 0) return [];

    let targetMains: MainGenreItem[] = [];
    if (activeTabGenreId === 'all') {
      targetMains = allSelectedMainGenres;
    } else {
      const found = allSelectedMainGenres.find((g) => g.id === activeTabGenreId);
      targetMains = found ? [found] : allSelectedMainGenres;
    }

    // Alt türleri topla (ID çakışmasını engellemek için Map)
    const map = new Map<string, SubGenreItem>();
    targetMains.forEach((m) => {
      m.subGenres.forEach((s) => {
        if (!map.has(s.id)) {
          map.set(s.id, s);
        }
      });
    });

    const allSubs = Array.from(map.values());
    if (!subSearch.trim()) return allSubs;

    const q = subSearch.toLowerCase().trim();
    return allSubs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [allSelectedMainGenres, activeTabGenreId, subSearch]);

  // ─── ACTION HANDLERS ──────────────────────────────────────

  // Birincil Türü Seç
  const handleSelectPrimary = (genreId: string) => {
    if (disabled) return;
    if (genreId === selectedMainGenre) {
      setIsChangingPrimary(false);
      return;
    }

    // Eğer yeni seçilen birincil tür daha önce ikincil türler arasındaysa onu oradan çıkar
    const nextSecondary = selectedSecondaryGenres.filter((id) => id !== genreId);

    // Kural: Yeni birincil ve kalan ikincillerin kapsadığı alt türleri koru
    const validGenreIds = new Set([genreId, ...nextSecondary]);
    const validSubIds = new Set<string>();
    validGenreIds.forEach((mId) => {
      const g = getMainGenreById(mId);
      g?.subGenres.forEach((s) => validSubIds.add(s.id));
    });

    const nextSubGenres = selectedSubGenres.filter((sId) => validSubIds.has(sId));

    onChange(genreId, nextSubGenres, nextSecondary, customSubGenres);
    setIsChangingPrimary(false);
    setActiveTabGenreId('all');
  };

  // İkincil Tür Ekle
  const handleAddSecondary = (genreId: string) => {
    if (disabled) return;
    if (selectedSecondaryGenres.includes(genreId)) return;
    if (selectedSecondaryGenres.length >= maxSecondaryGenres) return;

    const nextSecondary = [...selectedSecondaryGenres, genreId];
    onChange(selectedMainGenre, selectedSubGenres, nextSecondary, customSubGenres);
    setIsAddingSecondary(false);
    setSecondarySearch('');
  };

  // İkincil Türü Kaldır
  const handleRemoveSecondary = (genreId: string) => {
    if (disabled) return;
    const nextSecondary = selectedSecondaryGenres.filter((id) => id !== genreId);

    // Kalan türlerde geçerli alt türleri tut
    const validGenreIds = new Set([selectedMainGenre, ...nextSecondary].filter(Boolean));
    const validSubIds = new Set<string>();
    validGenreIds.forEach((mId) => {
      const g = getMainGenreById(mId);
      g?.subGenres.forEach((s) => validSubIds.add(s.id));
    });

    const nextSubGenres = selectedSubGenres.filter((sId) => validSubIds.has(sId));

    if (activeTabGenreId === genreId) {
      setActiveTabGenreId('all');
    }

    onChange(selectedMainGenre, nextSubGenres, nextSecondary, customSubGenres);
  };

  // Resmi Alt Türü Aç/Kapat
  const handleToggleSubGenre = (subGenreId: string) => {
    if (disabled || !selectedMainGenre) return;
    const exists = selectedSubGenres.includes(subGenreId);
    let nextSubGenres: string[];
    if (exists) {
      nextSubGenres = selectedSubGenres.filter((id) => id !== subGenreId);
    } else {
      nextSubGenres = [...selectedSubGenres, subGenreId];
    }
    onChange(selectedMainGenre, nextSubGenres, selectedSecondaryGenres, customSubGenres);
  };

  // Yazar Özel Alt Tür Ekle
  const handleAddCustomSubGenre = () => {
    if (disabled) return;
    const trimmed = customInput.trim();
    setCustomError(null);

    if (!trimmed) return;
    if (trimmed.length < 2) {
      setCustomError('Alt tür en az 2 karakter olmalıdır.');
      return;
    }
    if (trimmed.length > 35) {
      setCustomError('Alt tür en fazla 35 karakter olabilir.');
      return;
    }
    if (customSubGenres.length >= maxCustomSubGenres) {
      setCustomError(`En fazla ${maxCustomSubGenres} adet özel alt tür ekleyebilirsiniz.`);
      return;
    }

    // Küçük harf karşılaştırmasıyla çakışma kontrolü
    const lower = trimmed.toLowerCase();
    const alreadyInCustom = customSubGenres.some((c) => c.toLowerCase() === lower);
    if (alreadyInCustom) {
      setCustomError('Bu özel alt tür zaten listenizde ekli.');
      return;
    }

    const nextCustom = [...customSubGenres, trimmed];
    onChange(selectedMainGenre, selectedSubGenres, selectedSecondaryGenres, nextCustom);
    setCustomInput('');
  };

  // Yazar Özel Alt Türü Kaldır
  const handleRemoveCustomSubGenre = (tagToRemove: string) => {
    if (disabled) return;
    const nextCustom = customSubGenres.filter((c) => c !== tagToRemove);
    onChange(selectedMainGenre, selectedSubGenres, selectedSecondaryGenres, nextCustom);
  };

  // Alt Türleri Temizle
  const handleClearAllSubs = () => {
    if (disabled || !selectedMainGenre) return;
    onChange(selectedMainGenre, [], selectedSecondaryGenres, []);
  };

  const PrimaryIcon = currentPrimaryGenre ? getGenreIcon(currentPrimaryGenre.id) : BookOpen;
  const canAddMoreSecondary = selectedSecondaryGenres.length < maxSecondaryGenres;

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. ANA TÜRLER BÖLÜMÜ (BİRİNCİL + İKİNCİL SEÇİMİ)          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Başlık ve Butonlar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-xs" />
            <label className="text-xs sm:text-sm font-black text-foreground tracking-wide flex items-center gap-2">
              <span>Ana Tür & Eser Rafları</span>
              <span className="text-[10px] text-muted-foreground bg-muted/30 border border-border/60 px-2.5 py-0.5 rounded-full font-semibold">
                1 Birincil (Zorunlu) + Max 2 İkincil
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowFinder(true)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/25 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              title="Soruları cevaplayarak hikâyenize en uygun türleri belirleyin"
            >
              <Sparkles size={13} className="text-primary animate-pulse" />
              <span>Türümü Bul</span>
            </button>
          </div>
        </div>

        {/* Seçili Ana Türler Kart Listesi */}
        {currentPrimaryGenre && !isChangingPrimary ? (
          <div className="space-y-2.5">
            {/* 👑 BİRİNCİL ANA TÜR KARTI */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border-2 border-primary/40 hover:border-primary/60 transition-all shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-primary text-black flex items-center justify-center shrink-0 shadow-xs font-black">
                  <PrimaryIcon size={18} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-foreground truncate">
                      {currentPrimaryGenre.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-950 dark:text-amber-200 bg-amber-400/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      <Crown size={10} className="text-amber-500" />
                      Birincil Raf
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                      {currentPrimaryGenre.subGenres.length} Alt Tür
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate max-w-sm sm:max-w-xl mt-0.5">
                    {currentPrimaryGenre.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChangingPrimary(true)}
                disabled={disabled}
                className="text-xs font-bold text-primary hover:text-primary/80 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                title="Birincil ana türü değiştir"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Değiştir</span>
              </button>
            </div>

            {/* ✨ İKİNCİL ANA TÜRLER LİSTESİ */}
            {currentSecondaryGenres.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentSecondaryGenres.map((secGenre) => {
                  const SecIcon = getGenreIcon(secGenre.id);
                  return (
                    <div
                      key={secGenre.id}
                      className="flex items-center justify-between gap-2.5 p-2.5 px-3 rounded-xl bg-card/80 border border-border/70 hover:border-border transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                          <SecIcon size={14} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">
                              {secGenre.name}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                              İkincil
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {secGenre.subGenres.length} Alt Tür
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSecondary(secGenre.id)}
                        disabled={disabled}
                        className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="İkincil türü kaldır"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* + İkincil Tür Ekle Butonu veya Seçici Çubuğu */}
            {canAddMoreSecondary && !isAddingSecondary && (
              <button
                type="button"
                onClick={() => setIsAddingSecondary(true)}
                disabled={disabled}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-border/80 hover:border-primary/60 bg-muted/5 hover:bg-primary/5 text-xs font-bold text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>
                  + İkincil Ana Tür Ekle ({selectedSecondaryGenres.length}/{maxSecondaryGenres})
                </span>
                <span className="text-[10px] font-normal text-muted-foreground/80">
                  (Örn: Romantik, Gerilim veya Bilimkurgu)
                </span>
              </button>
            )}

            {/* İkincil Tür Seçim Paneli (Açıkken) */}
            {isAddingSecondary && (
              <div className="p-3.5 rounded-2xl bg-card border border-indigo-500/30 space-y-3 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-400" />
                    <span className="text-xs font-black text-foreground">
                      İkincil Tür Seç ({selectedSecondaryGenres.length + 1}/{maxSecondaryGenres})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSecondary(false);
                      setSecondarySearch('');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="İkincil tür ara (örn: Romantik, Gizem, Distopya...)"
                    value={secondarySearch}
                    onChange={(e) => setSecondarySearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-muted/15 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-400 transition-all"
                  />
                  {secondarySearch && (
                    <button
                      type="button"
                      onClick={() => setSecondarySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {availableForSecondary.map((g) => {
                    const GIcon = getGenreIcon(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleAddSecondary(g.id)}
                        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 hover:border-indigo-500/50 bg-card hover:bg-indigo-500/10 text-xs font-medium text-foreground hover:text-indigo-400 transition-all cursor-pointer"
                        title={g.description}
                      >
                        <GIcon size={12} className="text-indigo-400 shrink-0" />
                        <span>{g.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BİRİNCİL ANA TÜR SEÇİCİ IZGARASI */
          <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                <Crown size={14} className="text-amber-500" />
                <span>Birincil (Ana) Türünüzü Belirleyin</span>
              </div>
              {currentPrimaryGenre && (
                <button
                  type="button"
                  onClick={() => setIsChangingPrimary(false)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Vazgeç
                </button>
              )}
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="30 Ana Tür arasından ara (örn: Fantastik, Bilim Kurgu, Asya...)"
                value={mainSearch}
                onChange={(e) => setMainSearch(e.target.value)}
                disabled={disabled}
                className="w-full pl-8 pr-8 py-2 bg-muted/15 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all"
              />
              {mainSearch && (
                <button
                  type="button"
                  onClick={() => setMainSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredPrimaryGenres.map((g) => {
                const isSelected = selectedMainGenre === g.id;
                const GenreIcon = getGenreIcon(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectPrimary(g.id)}
                    disabled={disabled}
                    className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-black border-primary shadow-xs font-black'
                        : 'bg-card/70 hover:bg-card border-border/60 hover:border-primary/40 text-foreground hover:text-primary'
                    }`}
                    title={g.description}
                  >
                    <GenreIcon
                      size={13}
                      strokeWidth={2}
                      className={isSelected ? 'text-black' : 'text-primary/70 group-hover:text-primary shrink-0'}
                    />
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>

            {filteredPrimaryGenres.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-3">
                Aramanızla eşleşen ana tür bulunamadı.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. RESMİ ALT TÜRLER BÖLÜMÜ (SEÇİLEN TÜRLERE GÖRE)         */}
      {/* ────────────────────────────────────────────────────────── */}
      {currentPrimaryGenre && (
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-black text-foreground tracking-wide flex items-center gap-2">
                <span>Resmi Alt Türler</span>
                <span className="text-[10px] text-muted-foreground bg-muted/30 border border-border/50 px-2 py-0.5 rounded-full font-semibold">
                  Seçili Türlerin Alt Kümeleri
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">
                {selectedSubGenres.length} adet seçildi
              </span>
              {selectedSubGenres.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange(selectedMainGenre, [], selectedSecondaryGenres, customSubGenres)}
                  disabled={disabled}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                >
                  Sıfırla
                </button>
              )}
            </div>
          </div>

          {/* Birden Fazla Ana Tür Varsa: Kategori Sekmeleri */}
          {allSelectedMainGenres.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTabGenreId('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTabGenreId === 'all'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'bg-muted/15 text-muted-foreground hover:text-foreground hover:bg-muted/25'
                }`}
              >
                Tümü (Tüm Seçili Türler)
              </button>
              {allSelectedMainGenres.map((g) => {
                const isPrimary = g.id === selectedMainGenre;
                const count = g.subGenres.filter((s) => selectedSubGenres.includes(s.id)).length;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveTabGenreId(g.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTabGenreId === g.id
                        ? 'bg-primary text-black shadow-xs'
                        : 'bg-muted/15 text-muted-foreground hover:text-foreground hover:bg-muted/25'
                    }`}
                  >
                    <span>{g.name}</span>
                    {count > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/20 text-current font-black">
                        {count}
                      </span>
                    )}
                    {isPrimary && <Crown size={10} className="text-amber-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Alt Tür Arama Girişi */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Alt türler içinde ara (örn: Epik, Grimdark, Düşmandan Aşığa...)"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              disabled={disabled}
              className="w-full pl-8 pr-8 py-2 bg-muted/10 border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all"
            />
            {subSearch && (
              <button
                type="button"
                onClick={() => setSubSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Alt Tür Çip Listesi */}
          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1">
            {availableSubGenres.map((sub) => {
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
                      ? 'bg-primary text-black shadow-xs border border-primary font-bold'
                      : 'bg-card/70 hover:bg-muted/30 border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                  title={sub.description}
                >
                  {isSelected && <Check size={12} className="shrink-0 stroke-[2.5]" />}
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>

          {availableSubGenres.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-3">
              Aramanızla eşleşen alt tür bulunamadı.
            </p>
          )}

          {/* Canlı Açıklama Önizleme Kutusu */}
          <div className="min-h-[36px] px-3 py-2 rounded-xl bg-muted/10 border border-border/40 text-[11px] text-muted-foreground flex items-start gap-2">
            <HelpCircle size={14} className="text-primary/70 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              {hoveredSubGenre ? (
                <>
                  <strong className="text-foreground mr-1.5">
                    {hoveredSubGenre.name}:
                  </strong>
                  <span>{hoveredSubGenre.description}</span>
                </>
              ) : (
                <span className="text-muted-foreground/70 italic">
                  Bir alt türün üzerine gelerek resmi tanımını ve edebi açıklamasını inceleyebilirsiniz.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. YAZAR ÖZEL ALT TÜRLERİ & TROPE'LAR                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {currentPrimaryGenre && (
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-purple-400" />
              <label className="text-xs sm:text-sm font-black text-foreground tracking-wide flex items-center gap-2">
                <span>Özel Alt Türler & Edebi Trope'lar</span>
                <span className="text-[10px] text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  Yazar Tanımlı ({customSubGenres.length}/{maxCustomSubGenres})
                </span>
              </label>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Listede bulamadığınız niş bir alt türü veya eserinize özgü trope'ları ekleyin (örn: LitRPG, Zaman Döngüsü, Cozy Fantasy, Sahte Nişanlılık).
          </p>

          {/* Input ve Ekle Butonu */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Özel alt tür yazın ve Enter'a basın..."
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (customError) setCustomError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSubGenre();
                  }
                }}
                disabled={disabled || customSubGenres.length >= maxCustomSubGenres}
                className="w-full px-3 py-2 bg-muted/10 border border-border/60 focus:border-purple-500 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomSubGenre}
              disabled={disabled || !customInput.trim() || customSubGenres.length >= maxCustomSubGenres}
              className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Ekle</span>
            </button>
          </div>

          {/* Hata Bildirimi */}
          {customError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={13} />
              <span>{customError}</span>
            </div>
          )}

          {/* Eklenen Özel Alt Tür Çipleri */}
          {customSubGenres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customSubGenres.map((customTag) => (
                <span
                  key={customTag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-bold shadow-2xs group"
                >
                  <Sparkles size={11} className="text-purple-400" />
                  <span>{customTag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomSubGenre(customTag)}
                    disabled={disabled}
                    className="p-0.5 hover:bg-purple-500/30 rounded text-purple-300/70 hover:text-white transition-colors cursor-pointer"
                    title="Kaldır"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. TÜM SEÇİMLER ÖZET BARI                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {currentPrimaryGenre && (
        <div className="p-3 rounded-2xl bg-muted/15 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground">Kayıt Özeti:</span>
            <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary font-bold">
              {currentPrimaryGenre.name}
            </span>
            {currentSecondaryGenres.map((s) => (
              <span key={s.id} className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium">
                +{s.name}
              </span>
            ))}
            {(selectedSubGenres.length > 0 || customSubGenres.length > 0) && (
              <span className="text-muted-foreground font-medium">
                ({selectedSubGenres.length} Resmi + {customSubGenres.length} Özel Alt Tür)
              </span>
            )}
          </div>

          {(selectedSubGenres.length > 0 || customSubGenres.length > 0) && (
            <button
              type="button"
              onClick={handleClearAllSubs}
              disabled={disabled}
              className="text-[11px] font-bold text-muted-foreground hover:text-red-400 transition-colors self-end sm:self-auto cursor-pointer"
            >
              Alt Türleri Temizle
            </button>
          )}
        </div>
      )}

      {/* ── TÜR BULUCU SİHİRBAZ MODALI ── */}
      <GenreFinderModal
        isOpen={showFinder}
        onClose={() => setShowFinder(false)}
        onApply={(mainGenreId, subGenreIds) => {
          onChange(mainGenreId, subGenreIds, selectedSecondaryGenres, customSubGenres);
          setIsChangingPrimary(false);
          setActiveTabGenreId('all');
        }}
      />
    </div>
  );
};
