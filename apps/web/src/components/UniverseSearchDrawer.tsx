'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  type Character, 
  type UniverseLocation, 
  type UniverseTimelineEvent, 
  type UniverseGlossaryTerm, 
  type UniverseLore, 
  type UniverseItem, 
  type UniverseOrganization, 
  type UniversePowerSystem, 
  type UniverseRace, 
  type UniverseCreature, 
  type UniverseCulture, 
  type UniverseCanonRule, 
  type UniversePlotThread, 
  type UniverseSpell,
  type UniverseDivinationSystem,
  type UniverseProphecy,
  type UniverseRitual,
  type Story, 
  type Series,
  getCharacterRoleLabel
} from '@readixon/core';
import { 
  Search, 
  X, 
  Sparkles, 
  User, 
  Users, 
  MapPin, 
  Clock, 
  BookA, 
  Scroll, 
  Sword, 
  Building2, 
  Zap, 
  Dna, 
  Skull, 
  Landmark, 
  Scale, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  Lock, 
  Plus, 
  CornerDownLeft, 
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Compass,
  Wand2,
  Flame,
  Eye
} from 'lucide-react';

export type SearchCategoryKey = 
  | 'all'
  | 'character' 
  | 'location' 
  | 'event' 
  | 'glossary' 
  | 'lore' 
  | 'item' 
  | 'organization' 
  | 'power' 
  | 'race' 
  | 'creature' 
  | 'culture' 
  | 'canon_rule' 
  | 'plot_thread' 
  | 'spell'
  | 'divination'
  | 'prophecy'
  | 'ritual'
  | 'story'
  | 'series';

export interface UniverseSearchResultItem {
  id: string;
  category: SearchCategoryKey;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  imageUrl?: string;
  targetTab?: string;
  payload?: any;
}

export interface UniverseSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  universeTitle: string;
  isAuthorMode?: boolean;
  userMaxChapter?: number;
  // Veri Kümeleri
  characters?: Character[];
  locations?: UniverseLocation[];
  timelineEvents?: UniverseTimelineEvent[];
  glossary?: UniverseGlossaryTerm[];
  lore?: UniverseLore[];
  items?: UniverseItem[];
  organizations?: UniverseOrganization[];
  powerSystems?: UniversePowerSystem[];
  races?: UniverseRace[];
  creatures?: UniverseCreature[];
  cultures?: UniverseCulture[];
  canonRules?: UniverseCanonRule[];
  plotThreads?: UniversePlotThread[];
  spells?: UniverseSpell[];
  divinations?: UniverseDivinationSystem[];
  prophecies?: UniverseProphecy[];
  rituals?: UniverseRitual[];
  stories?: Story[];
  seriesList?: Series[];
  // Yönlendirme ve Hızlı Eylem Geri Çağrımları
  onSelectResult: (item: UniverseSearchResultItem) => void;
  onQuickAdd?: (category: 'character' | 'location' | 'event' | 'glossary' | 'lore' | 'item' | 'organization') => void;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  character: { label: 'Karakter', icon: User, color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
  location: { label: 'Mekân', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  event: { label: 'Olay', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  glossary: { label: 'Sözlük', icon: BookA, color: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30' },
  lore: { label: 'Lore & Sır', icon: Scroll, color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
  item: { label: 'Eşya', icon: Sword, color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  organization: { label: 'Organizasyon', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  power: { label: 'Güç Sistemi', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  race: { label: 'Irk / Tür', icon: Dna, color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30' },
  creature: { label: 'Yaratık', icon: Skull, color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  culture: { label: 'Kültür & Din', icon: Landmark, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  canon_rule: { label: 'Canon Kuralı', icon: Scale, color: 'text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
  plot_thread: { label: 'Kurgu Düğümü', icon: HelpCircle, color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  spell: { label: 'Büyü Kitabı', icon: Wand2, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  divination: { label: 'Fal & Deste', icon: Compass, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  prophecy: { label: 'Kehanet', icon: Eye, color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
  ritual: { label: 'Ritüel / Lanet', icon: Flame, color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  story: { label: 'Bağlı Eser', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/15', border: 'border-primary/30' },
  series: { label: 'Seri', icon: Layers, color: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/30' },
};

export const UniverseSearchDrawer: React.FC<UniverseSearchDrawerProps> = ({
  isOpen,
  onClose,
  universeTitle,
  isAuthorMode = false,
  userMaxChapter = 0,
  characters = [],
  locations = [],
  timelineEvents = [],
  glossary = [],
  lore = [],
  items = [],
  organizations = [],
  powerSystems = [],
  races = [],
  creatures = [],
  cultures = [],
  canonRules = [],
  plotThreads = [],
  spells = [],
  divinations = [],
  prophecies = [],
  rituals = [],
  stories = [],
  seriesList = [],
  onSelectResult,
  onQuickAdd,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<SearchCategoryKey>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Otomatik odaklanma ve klavye kısayolu (Cmd+K / Ctrl+K & ESC)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // ESC ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tüm Veri Havuzunu Arama Listesine Dönüştürme
  const allItems = useMemo<UniverseSearchResultItem[]>(() => {
    const list: UniverseSearchResultItem[] = [];

    // 1. Karakterler
    characters.forEach((c) => {
      const isSpoiler = !isAuthorMode && !!c.isSpoiler && (c.spoilerThresholdChapter || 0) > userMaxChapter;
      const roleLabel = getCharacterRoleLabel(c.role);
      list.push({
        id: c.id,
        category: 'character',
        title: isSpoiler ? `Gizli Karakter (#${c.spoilerThresholdChapter})` : c.name,
        subtitle: isSpoiler ? 'Henüz keşfedilmemiş karakter' : (roleLabel || 'Karakter'),
        description: isSpoiler ? 'Bu karakterin kilidi ilgili bölüm okunduğunda açılacaktır.' : (c.coreMotivation || c.readerNotes || c.occupation || ''),
        badge: isSpoiler ? `🔒 Bölüm #${c.spoilerThresholdChapter}` : roleLabel,
        isSpoiler,
        spoilerThresholdChapter: c.spoilerThresholdChapter,
        imageUrl: isSpoiler ? undefined : (c.pngGallery?.transparentPngUrl || c.avatarUrl),
        targetTab: 'characters',
        payload: c,
      });
    });

    // 2. Mekânlar
    locations.forEach((l) => {
      list.push({
        id: l.id,
        category: 'location',
        title: l.name,
        subtitle: l.type ? `${l.type} Mekânı` : 'Evren Konumu',
        description: l.description || l.climate || '',
        badge: l.type || 'Mekân',
        targetTab: 'locations',
        payload: l,
      });
    });

    // 3. Olaylar
    timelineEvents.forEach((ev) => {
      list.push({
        id: ev.id,
        category: 'event',
        title: ev.title,
        subtitle: ev.era ? `Dönem: ${ev.era}` : `Sıra #${ev.chronologicalOrder || 1}`,
        description: ev.summary || '',
        badge: ev.era || 'Zaman Çizelgesi',
        targetTab: 'timeline',
        payload: ev,
      });
    });

    // 4. Sözlük
    glossary.forEach((term) => {
      list.push({
        id: term.id,
        category: 'glossary',
        title: term.term,
        subtitle: term.category ? `Kategori: ${term.category}` : 'Sözlük Kavramı',
        description: term.meaning || '',
        badge: term.category || 'Sözlük',
        targetTab: 'glossary',
        payload: term,
      });
    });

    // 5. Lore
    lore.forEach((lor) => {
      const isSpoiler = !isAuthorMode && !!lor.isSpoiler && (lor.spoilerThresholdChapter || 0) > userMaxChapter;
      list.push({
        id: lor.id,
        category: 'lore',
        title: isSpoiler ? `Gizli Evren Sırrı (#${lor.spoilerThresholdChapter})` : lor.title,
        subtitle: isSpoiler ? 'Kilitli Bilgi' : (lor.category || 'Lore & Efsane'),
        description: isSpoiler ? 'Okuma ilerlemeniz bu bölüme ulaştığında detaylar görüntülenecektir.' : lor.content,
        badge: isSpoiler ? `🔒 Bölüm #${lor.spoilerThresholdChapter}` : (lor.category || 'Efsane'),
        isSpoiler,
        spoilerThresholdChapter: lor.spoilerThresholdChapter,
        targetTab: 'lore',
        payload: lor,
      });
    });

    // 6. Eşyalar
    items.forEach((it) => {
      const isSpoiler = !isAuthorMode && !!it.isSpoiler && (it.spoilerThresholdChapter || 0) > userMaxChapter;
      list.push({
        id: it.id,
        category: 'item',
        title: isSpoiler ? `Gizli Artefakt (#${it.spoilerThresholdChapter})` : it.name,
        subtitle: isSpoiler ? 'Kilitli Eşya' : (it.type || 'Artefakt'),
        description: isSpoiler ? 'İlerleyen bölümlerde keşfedilecek eşya.' : (it.description || it.powerDescription || ''),
        badge: isSpoiler ? `🔒 Bölüm #${it.spoilerThresholdChapter}` : (it.type || 'Eşya'),
        isSpoiler,
        spoilerThresholdChapter: it.spoilerThresholdChapter,
        imageUrl: isSpoiler ? undefined : it.imageUrl,
        targetTab: 'items',
        payload: it,
      });
    });

    // 7. Organizasyonlar
    organizations.forEach((org) => {
      const isSpoiler = !isAuthorMode && !!org.isSpoiler && (org.spoilerThresholdChapter || 0) > userMaxChapter;
      list.push({
        id: org.id,
        category: 'organization',
        title: isSpoiler ? `Gizli Organizasyon (#${org.spoilerThresholdChapter})` : org.name,
        subtitle: isSpoiler ? 'Kilitli Oluşum' : (org.type || 'Organizasyon'),
        description: isSpoiler ? 'Gelişmelerle açılacak kurum.' : (org.description || org.ideology || ''),
        badge: isSpoiler ? `🔒 Bölüm #${org.spoilerThresholdChapter}` : (org.type || 'Topluluk'),
        isSpoiler,
        spoilerThresholdChapter: org.spoilerThresholdChapter,
        imageUrl: isSpoiler ? undefined : org.symbolUrl,
        targetTab: 'organizations',
        payload: org,
      });
    });

    // 8. Güç Sistemleri
    powerSystems.forEach((pw) => {
      list.push({
        id: pw.id,
        category: 'power',
        title: pw.name,
        subtitle: pw.source ? `Kaynak: ${pw.source}` : 'Büyü & Güç Sistemi',
        description: pw.corePrinciples || pw.rulesAndLimits || '',
        badge: pw.source || 'Güç Sistemi',
        targetTab: 'powers',
        payload: pw,
      });
    });

    // 9. Irklar
    races.forEach((rc) => {
      list.push({
        id: rc.id,
        category: 'race',
        title: rc.name,
        subtitle: rc.homelandRegionName ? `Anavatan: ${rc.homelandRegionName}` : 'Irk / Tür',
        description: rc.culture || rc.physicalTraits || rc.origin || '',
        badge: rc.homelandRegionName || 'Tür',
        targetTab: 'races',
        payload: rc,
      });
    });

    // 10. Yaratıklar
    creatures.forEach((cr) => {
      list.push({
        id: cr.id,
        category: 'creature',
        title: cr.name,
        subtitle: cr.habitatLocationName ? `Yaşam Alanı: ${cr.habitatLocationName}` : 'Fauna & Canavar',
        description: cr.appearance || cr.behavior || cr.lore || '',
        badge: cr.dangerLevel ? `Tehdit: ${cr.dangerLevel}` : 'Yaratık',
        targetTab: 'creatures',
        payload: cr,
      });
    });

    // 11. Kültürler
    cultures.forEach((cl) => {
      list.push({
        id: cl.id,
        category: 'culture',
        title: cl.name,
        subtitle: cl.category || 'Kültür & İnanç',
        description: cl.description || '',
        badge: cl.category || 'Kültür',
        targetTab: 'cultures',
        payload: cl,
      });
    });

    // 12. Canon Kuralları
    canonRules.forEach((rule) => {
      list.push({
        id: rule.id,
        category: 'canon_rule',
        title: rule.title,
        subtitle: rule.category ? `Kategori: ${rule.category}` : 'Evren Kuralı',
        description: rule.ruleDescription || rule.description || '',
        badge: rule.category || 'Canon',
        targetTab: 'canon_rules',
        payload: rule,
      });
    });

    // 13. Kurgu Düğümleri / Gizemler
    plotThreads.forEach((th) => {
      list.push({
        id: th.id,
        category: 'plot_thread',
        title: th.title,
        subtitle: th.status ? `Durum: ${th.status}` : 'Açık Sır / Gizem',
        description: th.description || th.resolutionSummary || '',
        badge: th.importance ? `Önem: ${th.importance}` : 'Düğüm',
        targetTab: 'plot_threads',
        payload: th,
      });
    });

    // 13.1 Büyüler
    spells.forEach((sp) => {
      const isSpoiler = !isAuthorMode && !!sp.isSpoiler && (sp.spoilerThresholdChapter || 0) > userMaxChapter;
      list.push({
        id: sp.id,
        category: 'spell',
        title: isSpoiler ? `Gizli Büyü (#${sp.spoilerThresholdChapter})` : sp.name,
        subtitle: isSpoiler ? 'Kilitli Büyü' : `${sp.school} • ${sp.tier}`,
        description: isSpoiler ? 'Bu büyü hikayenin ilerleyen bölümlerinde açığa çıkar.' : sp.effects,
        badge: isSpoiler ? `🔒 B.${sp.spoilerThresholdChapter}+` : sp.tier,
        isSpoiler,
        spoilerThresholdChapter: sp.spoilerThresholdChapter,
        targetTab: 'mystic_arts',
        payload: sp,
      });
    });

    // 13.2 Fal & Kehanet Sistemleri
    divinations.forEach((dv) => {
      list.push({
        id: dv.id,
        category: 'divination',
        title: dv.name,
        subtitle: dv.type,
        description: dv.description,
        badge: 'Fal & Deste',
        targetTab: 'mystic_arts',
        payload: dv,
      });
    });

    // 13.3 Büyük Kehanetler
    prophecies.forEach((pr) => {
      list.push({
        id: pr.id,
        category: 'prophecy',
        title: pr.title,
        subtitle: pr.seerName ? `Kahin: ${pr.seerName}` : 'Kadim Kehanet',
        description: pr.prophecyText,
        badge: pr.status,
        targetTab: 'mystic_arts',
        payload: pr,
      });
    });

    // 13.4 Ritüeller
    rituals.forEach((rt) => {
      list.push({
        id: rt.id,
        category: 'ritual',
        title: rt.name,
        subtitle: 'Kadim Ayin / Lanet',
        description: rt.purpose,
        badge: 'Ritüel',
        targetTab: 'mystic_arts',
        payload: rt,
      });
    });

    // 14. Eserler
    stories.forEach((st) => {
      list.push({
        id: st.storyId,
        category: 'story',
        title: st.title,
        subtitle: 'Bağlı Eser',
        description: st.summary || '',
        badge: st.stats?.chapterCount ? `${st.stats.chapterCount} Bölüm` : 'Eser',
        imageUrl: st.coverImage,
        targetTab: 'works',
        payload: st,
      });
    });

    // 15. Seriler
    seriesList.forEach((sr) => {
      list.push({
        id: sr.seriesId,
        category: 'series',
        title: sr.title,
        subtitle: `${sr.books?.length || 0} Bağlı Kitap`,
        description: sr.description || '',
        badge: 'Seri',
        imageUrl: sr.coverImage,
        targetTab: 'works',
        payload: sr,
      });
    });

    return list;
  }, [
    characters,
    locations,
    timelineEvents,
    glossary,
    lore,
    items,
    organizations,
    powerSystems,
    races,
    creatures,
    cultures,
    canonRules,
    plotThreads,
    spells,
    divinations,
    prophecies,
    rituals,
    stories,
    seriesList,
    isAuthorMode,
    userMaxChapter,
  ]);

  // Arama Sorgusu ve Filtre Uygulaması
  const filteredResults = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');

    let pool = allItems;
    if (selectedFilter !== 'all') {
      pool = pool.filter((it) => it.category === selectedFilter);
    }

    if (!q) {
      // Sorgu boşsa ilk 25 popüler/öncelikli öğeyi veya tümünü listele
      return pool.slice(0, 30);
    }

    return pool.filter((it) => {
      const matchTitle = it.title.toLocaleLowerCase('tr-TR').includes(q);
      const matchSubtitle = (it.subtitle || '').toLocaleLowerCase('tr-TR').includes(q);
      const matchDesc = (it.description || '').toLocaleLowerCase('tr-TR').includes(q);
      const matchBadge = (it.badge || '').toLocaleLowerCase('tr-TR').includes(q);
      return matchTitle || matchSubtitle || matchDesc || matchBadge;
    });
  }, [allItems, query, selectedFilter]);

  // Sonuçları Kategoriye Göre Gruplandırma
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: UniverseSearchResultItem[] } = {};
    filteredResults.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredResults]);

  // Klavye ile Gezinme Kontrolü (ArrowUp / ArrowDown / Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        onSelectResult(target);
        onClose();
      }
    }
  };

  // Sonuç sayısı hesaplama
  const totalCount = filteredResults.length;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 md:pt-20 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl max-h-[85vh] bg-card border border-border/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* ── 1. ARAMA GİRİŞİ (Spotlight Bar) ── */}
        <div className="relative p-4 sm:p-5 border-b border-border/50 bg-gradient-to-r from-card via-card/80 to-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Search size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={`"${universeTitle}" evreninde karakter, mekân, sır, kural veya terim ara...`}
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-foreground placeholder:text-muted/60 focus:outline-none"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-xl hover:bg-muted/15 text-muted hover:text-foreground transition-colors"
              title="Temizle"
            >
              <X size={16} />
            </button>
          )}

          <div className="flex items-center gap-1.5 pl-2 border-l border-border/50 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-background border border-border/60 text-[10px] font-mono text-muted">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted/15 text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── 2. KATEGORİ FİLTRE HAPLARI & HIZLI EKLEME BUTONLARI ── */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-border/40 bg-background/50 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold">
            {[
              { key: 'all', label: `Tümü (${allItems.length})` },
              { key: 'character', label: `Karakterler (${characters.length})` },
              { key: 'location', label: `Mekânlar (${locations.length})` },
              { key: 'event', label: `Olaylar (${timelineEvents.length})` },
              { key: 'lore', label: `Lore & Sırlar (${lore.length})` },
              { key: 'glossary', label: `Sözlük (${glossary.length})` },
              { key: 'item', label: `Eşyalar (${items.length})` },
              { key: 'organization', label: `Organizasyonlar (${organizations.length})` },
              { key: 'power', label: `Güçler (${powerSystems.length})` },
              { key: 'plot_thread', label: `Gizemler (${plotThreads.length})` },
              { key: 'canon_rule', label: `Canon (${canonRules.length})` },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setSelectedFilter(f.key as SearchCategoryKey);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                  selectedFilter === f.key
                    ? 'bg-primary text-black font-black shadow-xs'
                    : 'bg-card/60 hover:bg-card border border-border/50 text-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Stüdyo Modunda: Hızlı Ekleme Menüsü (PRD Bölüm 51) */}
          {isAuthorMode && onQuickAdd && (
            <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-border/40">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider hidden sm:inline mr-1">
                + Hızlı Ekle:
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAdd('character');
                }}
                className="px-2 py-0.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[11px] font-bold transition-colors"
                title="Yeni Karakter Ekle"
              >
                + Karakter
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAdd('location');
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors"
                title="Yeni Mekân Ekle"
              >
                + Mekân
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAdd('lore');
                }}
                className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-colors"
                title="Yeni Lore Notu Ekle"
              >
                + Lore
              </button>
            </div>
          )}
        </div>

        {/* ── 3. ARAMA SONUÇLARI LİSTESİ ── */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {totalCount === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/10 text-muted flex items-center justify-center mx-auto">
                <Search size={22} />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                "{query}" ile eşleşen sonuç bulunamadı
              </h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Farklı bir anahtar kelime deneyebilir veya kategori filtresini temizleyebilirsiniz.
              </p>
              {isAuthorMode && onQuickAdd && (
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onQuickAdd('character');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-black font-bold text-xs"
                  >
                    + Yeni Karakter Olarak Ekle
                  </button>
                </div>
              )}
            </div>
          ) : (
            Object.keys(groupedResults).map((categoryKey) => {
              const meta = CATEGORY_META[categoryKey] || {
                label: categoryKey,
                icon: Sparkles,
                color: 'text-primary',
                bg: 'bg-primary/10',
                border: 'border-primary/20',
              };
              const CategoryIcon = meta.icon;
              const itemsInGroup = groupedResults[categoryKey];

              return (
                <div key={categoryKey} className="space-y-2">
                  {/* Grup Başlığı */}
                  <div className="flex items-center justify-between text-xs font-bold text-muted pb-1 border-b border-border/30">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CategoryIcon size={14} className={meta.color} />
                      <span className={meta.color}>{meta.label}</span>
                      <span className="text-muted/60">({itemsInGroup.length})</span>
                    </span>
                  </div>

                  {/* Grup Öğeleri */}
                  <div className="space-y-1.5">
                    {itemsInGroup.map((item) => {
                      // Genel listedeki index'i bul
                      const globalIndex = filteredResults.findIndex((x) => x.id === item.id && x.category === item.category);
                      const isFocused = globalIndex === selectedIndex;

                      return (
                        <div
                          key={`${item.category}-${item.id}`}
                          onClick={() => {
                            onSelectResult(item);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                            isFocused
                              ? 'bg-primary/10 border-primary/50 shadow-sm translate-x-1'
                              : 'bg-card/60 hover:bg-card border-border/40 hover:border-border/80'
                          }`}
                        >
                          {/* Sol Görsel veya İkon */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {item.imageUrl ? (
                              <div className="w-10 h-10 rounded-xl bg-background border border-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg} ${meta.border} ${meta.color}`}>
                                <CategoryIcon size={18} />
                              </div>
                            )}

                            {/* Başlık ve Açıklama */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className={`text-xs sm:text-sm font-black transition-colors ${
                                  isFocused ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                }`}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                    item.isSpoiler 
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                      : `${meta.bg} ${meta.border} ${meta.color}`
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {item.description && (
                                <p className="text-[11px] text-muted line-clamp-1 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Sağ Aksiyon İpuçları */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isFocused && (
                              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background border border-primary/40 text-[10px] font-mono text-primary animate-in fade-in">
                                <span>Git</span>
                                <CornerDownLeft size={10} />
                              </kbd>
                            )}
                            <ChevronRight size={16} className={`transition-transform ${
                              isFocused ? 'text-primary translate-x-0.5' : 'text-muted group-hover:text-foreground'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── 4. ALT BİLGİ VE KLAVYE KISAYOLLARI (Footer) ── */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-border/40 bg-background/70 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/60 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/60 font-mono text-[9px]">↓</kbd>
              <span className="hidden sm:inline">Gezin</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/60 font-mono text-[9px]">↵</kbd>
              <span className="hidden sm:inline">Seç</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/60 font-mono text-[9px]">ESC</kbd>
              <span className="hidden sm:inline">Kapat</span>
            </span>
          </div>

          <div className="font-bold text-foreground">
            Toplam <span className="text-primary">{totalCount}</span> sonuç
          </div>
        </div>
      </div>
    </div>
  );
};
