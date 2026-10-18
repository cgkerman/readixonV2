'use client';

import React, { useEffect, useState } from 'react';
import { Typography } from '@readixon/ui';
import { 
  getUniverseCharacters, 
  getUniverseLocations, 
  getUniverseGlossary, 
  getUniverseLoreList,
  getUniverseById,
  getUniverseMaps,
  getUniverseOrganizations,
  getUniverseItems,
  getUniversePowerSystems,
  getUniverseRaces,
  getUniverseCreatures,
  getUniverseCultures,
  getUniverseMedia,
  getUniverseSoundtracks,
  parseAudioTrack,
  getAudioPlatformLabel,
  type Universe,
  type Character,
  type UniverseLocation,
  type UniverseGlossaryTerm,
  type UniverseLore,
  type UniverseMap,
  type UniverseOrganization,
  type UniverseItem,
  type UniversePowerSystem,
  type UniverseRace,
  type UniverseCreature,
  type UniverseCulture,
  type UniverseMedia,
  type UniverseSoundtrack,
  getUniverseCanonRules,
  getUniversePlotThreads,
  CANON_RULE_CATEGORY_LABELS,
  PLOT_THREAD_STATUS_LABELS,
  PLOT_THREAD_IMPORTANCE_LABELS,
  type UniverseCanonRule,
  type UniversePlotThread
} from '@readixon/core';
import { 
  Layers, 
  X, 
  Loader2, 
  Users, 
  MapPin, 
  BookA, 
  Scroll, 
  Search, 
  Lock, 
  Unlock, 
  Eye, 
  Heart, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Map as MapIcon,
  Share2,
  Building2,
  Sword,
  Zap,
  Crown,
  Dna,
  Skull,
  Landmark,
  Image as ImageIcon,
  Music,
  Headphones,
  Volume2,
  Scale,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { InteractiveWorldMap } from '@/components/InteractiveWorldMap';
import { InteractiveRelationshipGraph } from '@/components/InteractiveRelationshipGraph';

export type ReaderUniverseTabType = 'characters' | 'relationships' | 'races' | 'creatures' | 'cultures' | 'locations' | 'maps' | 'organizations' | 'items' | 'powers' | 'glossary' | 'lore' | 'media' | 'soundtracks' | 'canon_rules' | 'plot_threads';

export interface ReaderUniverseDrawerProps {
  universeId: string;
  universeTitle?: string;
  currentChapterOrder: number;
  initialTab?: ReaderUniverseTabType;
  initialSearch?: string;
  onClose: () => void;
}

function toArr(val?: string | string[] | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

type TabType = ReaderUniverseTabType;

export function ReaderUniverseDrawer({
  universeId,
  universeTitle,
  currentChapterOrder,
  initialTab,
  initialSearch,
  onClose,
}: ReaderUniverseDrawerProps) {
  const [universe, setUniverse] = useState<Universe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'characters');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialTab, initialSearch]);
  
  // Manuel spoiler açma (Okuyucunun kendi kararıyla kilidi açtığı id'ler)
  const [unlockedSpoilers, setUnlockedSpoilers] = useState<Record<string, boolean>>({});

  // Veriler
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<UniverseLocation[]>([]);
  const [glossary, setGlossary] = useState<UniverseGlossaryTerm[]>([]);
  const [loreList, setLoreList] = useState<UniverseLore[]>([]);
  const [maps, setMaps] = useState<UniverseMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [organizations, setOrganizations] = useState<UniverseOrganization[]>([]);
  const [items, setItems] = useState<UniverseItem[]>([]);
  const [powerSystems, setPowerSystems] = useState<UniversePowerSystem[]>([]);
  const [races, setRaces] = useState<UniverseRace[]>([]);
  const [creatures, setCreatures] = useState<UniverseCreature[]>([]);
  const [cultures, setCultures] = useState<UniverseCulture[]>([]);
  const [mediaList, setMediaList] = useState<UniverseMedia[]>([]);
  const [soundtracks, setSoundtracks] = useState<UniverseSoundtrack[]>([]);
  const [canonRules, setCanonRules] = useState<UniverseCanonRule[]>([]);
  const [plotThreads, setPlotThreads] = useState<UniversePlotThread[]>([]);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<UniverseMedia | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          u, 
          chars, 
          locs, 
          terms, 
          lores, 
          mapList, 
          orgs, 
          itemsList, 
          powers, 
          raceList, 
          creatureList, 
          cultureList, 
          mediaData, 
          trackData,
          canonData,
          threadData
        ] = await Promise.all([
          getUniverseById(universeId),
          getUniverseCharacters(universeId),
          getUniverseLocations(universeId),
          getUniverseGlossary(universeId),
          getUniverseLoreList(universeId),
          getUniverseMaps(universeId),
          getUniverseOrganizations(universeId),
          getUniverseItems(universeId),
          getUniversePowerSystems(universeId),
          getUniverseRaces(universeId),
          getUniverseCreatures(universeId),
          getUniverseCultures(universeId),
          getUniverseMedia(universeId),
          getUniverseSoundtracks(universeId),
          getUniverseCanonRules(universeId),
          getUniversePlotThreads(universeId),
        ]);
        setUniverse(u);
        setCharacters(chars);
        setLocations(locs);
        setGlossary(terms);
        setLoreList(lores);
        setOrganizations(orgs);
        setItems(itemsList);
        setPowerSystems(powers);
        setRaces(raceList);
        setCreatures(creatureList);
        setCultures(cultureList);
        setMediaList(mediaData.filter((m) => !m.isAuthorOnly));
        setSoundtracks(trackData);
        setCanonRules(canonData.filter((r) => r.isPublic !== false));
        setPlotThreads(threadData.filter((t) => t.isPublic === true));
        const publicMaps = mapList.filter((m) => !m.isSpoiler || (m.spoilerThresholdChapter || 0) <= currentChapterOrder);
        setMaps(publicMaps);
        if (publicMaps.length > 0) setSelectedMapId(publicMaps[0].id);
      } catch (err) {
        console.error('Okuyucu evren rehberi yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [universeId]);

  const toggleUnlockSpoiler = (id: string) => {
    setUnlockedSpoilers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Spoiler Kontrolü: Eğer spoiler ise ve bölüm eşiği henüz geçilmediyse VE okur elle açmadıysa
  const isItemSpoilerLocked = (isSpoiler?: boolean, threshold?: number, id?: string) => {
    if (!isSpoiler) return false;
    if (id && unlockedSpoilers[id]) return false;
    if (!threshold) return false;
    return threshold > currentChapterOrder;
  };

  // Filtreler
  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.occupation && c.occupation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRaces = races.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.origin && r.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.altNames && r.altNames.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredCreatures = creatures.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.creatureType || c.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.behavior && c.behavior.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOrganizations = organizations.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    o.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCultures = cultures.filter(cu =>
    cu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cu.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cu.traditions && cu.traditions.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (i.type && i.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPowerSystems = powerSystems.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.corePrinciples && p.corePrinciples.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGlossary = glossary.filter(g =>
    g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLore = loreList.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedia = mediaList.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.tags && m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredSoundtracks = soundtracks.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.artist && s.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCanonRules = canonRules.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((r.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPlotThreads = plotThreads.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((t.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-card/95 backdrop-blur-2xl border-l border-border/70 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Üst Bar */}
      <div className="p-4 border-b border-border/50 bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <Layers size={16} />
          </div>
          <div className="min-w-0">
            <Typography variant="h3" className="font-extrabold text-sm text-foreground truncate">
              {universe?.title || universeTitle || 'Evren Rehberi'}
            </Typography>
            <span className="text-[10px] text-muted block">
              Bölüm {currentChapterOrder} • Spoiler Korumalı
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/15 transition-colors"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted">
          <Loader2 size={28} className="animate-spin text-primary mb-2" />
          <p className="text-xs">Evren rehberi açılıyor...</p>
        </div>
      ) : (
        <>
          {/* Sekmeler */}
          <div className="flex items-center border-b border-border/40 px-2 bg-muted/10 shrink-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('characters')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'characters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Users size={13} />
              <span>Karakter</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{characters.length}</span>
            </button>

            {characters.length > 0 && (
              <button
                onClick={() => setActiveTab('relationships')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'relationships'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Share2 size={13} />
                <span>İlişki</span>
              </button>
            )}

            {races.length > 0 && (
              <button
                onClick={() => setActiveTab('races')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'races'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Dna size={13} />
                <span>Irk</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{races.length}</span>
              </button>
            )}

            {creatures.length > 0 && (
              <button
                onClick={() => setActiveTab('creatures')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'creatures'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Skull size={13} />
                <span>Yaratık</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{creatures.length}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('locations')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'locations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <MapPin size={13} />
              <span>Mekân</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{locations.length}</span>
            </button>

            {maps.length > 0 && (
              <button
                onClick={() => setActiveTab('maps')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'maps'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <MapIcon size={13} />
                <span>Harita</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{maps.length}</span>
              </button>
            )}

            {organizations.length > 0 && (
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'organizations'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Building2 size={13} />
                <span>Örgüt</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{organizations.length}</span>
              </button>
            )}

            {cultures.length > 0 && (
              <button
                onClick={() => setActiveTab('cultures')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'cultures'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Landmark size={13} />
                <span>Kültür</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{cultures.length}</span>
              </button>
            )}

            {items.length > 0 && (
              <button
                onClick={() => setActiveTab('items')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'items'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Sword size={13} />
                <span>Eşya</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{items.length}</span>
              </button>
            )}

            {powerSystems.length > 0 && (
              <button
                onClick={() => setActiveTab('powers')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'powers'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Zap size={13} />
                <span>Güç</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{powerSystems.length}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('glossary')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'glossary'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <BookA size={13} />
              <span>Sözlük</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{glossary.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('lore')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'lore'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Scroll size={13} />
              <span>Lore</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{loreList.length}</span>
            </button>

            {mediaList.length > 0 && (
              <button
                onClick={() => setActiveTab('media')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'media'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <ImageIcon size={13} />
                <span>Görsel</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{mediaList.length}</span>
              </button>
            )}

            {soundtracks.length > 0 && (
              <button
                onClick={() => setActiveTab('soundtracks')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'soundtracks'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Music size={13} />
                <span>Müzik</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{soundtracks.length}</span>
              </button>
            )}

            {canonRules.length > 0 && (
              <button
                onClick={() => setActiveTab('canon_rules')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'canon_rules'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Scale size={13} />
                <span>Canon</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{canonRules.length}</span>
              </button>
            )}

            {plotThreads.length > 0 && (
              <button
                onClick={() => setActiveTab('plot_threads')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'plot_threads'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <HelpCircle size={13} />
                <span>Gizemler</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{plotThreads.length}</span>
              </button>
            )}
          </div>

          {/* Arama Barı */}
          <div className="p-3 border-b border-border/30 bg-card shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Evrende ara..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background border border-border/50 text-xs text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Liste İçeriği */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            
            {/* 1. SEKME: KARAKTERLER */}
            {activeTab === 'characters' && (
              filteredCharacters.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Karakter bulunamadı.</p>
              ) : (
                filteredCharacters.map((c) => {
                  const isLocked = isItemSpoilerLocked(c.isSpoiler, c.spoilerThresholdChapter, c.id);
                  const openRelationships = (c.relationships || []).filter(r => !r.isSecret);

                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-border/40 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{c.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-semibold capitalize">
                              {c.role === 'protagonist' ? 'Ana Karakter' : c.role === 'antagonist' ? 'Karşıt' : 'Yan Karakter'}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted block mt-0.5">
                            {c.occupation || 'Unvan Belirtilmedi'}
                            {c.age ? ` • ${c.age} yaş` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Spoiler Koruması */}
                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Lock size={12} className="shrink-0" />
                            <span>Bölüm {c.spoilerThresholdChapter}+ sonrasına ait spoiler içerir.</span>
                          </div>
                          <button
                            onClick={() => toggleUnlockSpoiler(c.id)}
                            className="text-[10px] font-bold underline shrink-0 hover:text-amber-300"
                          >
                            Yine de Aç
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Okuyucu Biyografisi */}
                          {(c.readerNotes || c.coreMotivation) && (
                            <p className="text-[11px] text-muted leading-relaxed">
                              {c.readerNotes || c.coreMotivation}
                            </p>
                          )}

                          {/* Açık İlişkiler */}
                          {openRelationships.length > 0 && (
                            <div className="pt-1.5 border-t border-border/30 flex flex-wrap gap-1">
                              {openRelationships.map((r, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/15 text-muted flex items-center gap-1">
                                  <Heart size={9} className="text-purple-400" />
                                  <strong className="text-foreground">{r.targetCharacterName}</strong>: {r.relationshipType}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── İLİŞKİLER ── */}
            {activeTab === 'relationships' && (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border/40 shadow-xl">
                  <InteractiveRelationshipGraph
                    characters={characters}
                    locations={locations}
                    isEditable={false}
                    initialLayout={universe?.characterGraphLayout}
                    currentChapterOrder={currentChapterOrder}
                  />
                </div>
              </div>
            )}

            {/* ── IRKLAR & TÜRLER ── */}
            {activeTab === 'races' && (
              filteredRaces.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Irk veya tür bulunamadı.</p>
              ) : (
                filteredRaces.map((r) => {
                  const isLocked = isItemSpoilerLocked(r.isSpoiler, r.spoilerThresholdChapter, r.id);
                  return (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                            <Dna size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">{r.name}</span>
                            {r.lifespan && (
                              <span className="text-[10px] text-teal-400 font-semibold">Ömür: {r.lifespan}</span>
                            )}
                          </div>
                        </div>

                        {r.isSpoiler && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5">
                            <Lock size={9} /> B.{r.spoilerThresholdChapter || 1}+
                          </span>
                        )}
                      </div>

                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock size={12} /> Bu ırkın detayları Bölüm {r.spoilerThresholdChapter}+ sonrasında açılır.
                          </span>
                          <button onClick={() => toggleUnlockSpoiler(r.id)} className="underline font-bold shrink-0 ml-2">
                            Aç
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px]">
                          {r.origin && (
                            <p className="text-muted"><strong className="text-foreground">Köken:</strong> {r.origin}</p>
                          )}
                          {r.physicalTraits && (
                            <p className="text-muted leading-relaxed">{r.physicalTraits}</p>
                          )}
                          {r.cultureAndTraditions && (
                            <p className="text-muted leading-relaxed"><strong className="text-foreground">Kültür:</strong> {r.cultureAndTraditions}</p>
                          )}
                          {toArr(r.strengths).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {toArr(r.strengths).map((s, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                                  + {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {toArr(r.weaknesses).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {toArr(r.weaknesses).map((w, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400">
                                  - {w}
                                </span>
                              ))}
                            </div>
                          )}
                          {r.language && (
                            <span className="text-[10px] text-muted block pt-1 border-t border-border/30">
                              Dil: <strong className="text-foreground">{r.language}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── YARATIKLAR ── */}
            {activeTab === 'creatures' && (
              filteredCreatures.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Yaratık bulunamadı.</p>
              ) : (
                filteredCreatures.map((c) => {
                  const isLocked = isItemSpoilerLocked(c.isSpoiler, c.spoilerThresholdChapter, c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-border/50 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                              <Skull size={16} />
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-foreground block">{c.name}</span>
                            <span className="text-[10px] text-rose-400 font-semibold uppercase">{c.dangerLevel} • {c.creatureType}</span>
                          </div>
                        </div>

                        {c.isSpoiler && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5">
                            <Lock size={9} /> B.{c.spoilerThresholdChapter || 1}+
                          </span>
                        )}
                      </div>

                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock size={12} /> Bu canavarın detayları Bölüm {c.spoilerThresholdChapter}+ sonrasında açılır.
                          </span>
                          <button onClick={() => toggleUnlockSpoiler(c.id)} className="underline font-bold shrink-0 ml-2">
                            Aç
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px]">
                          {c.habitatNames && c.habitatNames.length > 0 && (
                            <p className="text-[10px] text-muted">📍 Habitat: <strong className="text-foreground">{c.habitatNames.join(', ')}</strong></p>
                          )}
                          {c.appearance && (
                            <p className="text-muted leading-relaxed">{c.appearance}</p>
                          )}
                          {c.behavior && (
                            <p className="text-muted leading-relaxed"><strong className="text-foreground">Davranış:</strong> {c.behavior}</p>
                          )}
                          {toArr(c.abilities).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {toArr(c.abilities).map((a, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                                  ⚡ {a}
                                </span>
                              ))}
                            </div>
                          )}
                          {toArr(c.dropMaterials || c.dropsOrMaterials).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {toArr(c.dropMaterials || c.dropsOrMaterials).map((m, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300">
                                  💎 {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* 2. SEKME: MEKÂNLAR */}
            {activeTab === 'locations' && (
              filteredLocations.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Mekân bulunamadı.</p>
              ) : (
                filteredLocations.map((loc) => {
                  const isLocked = isItemSpoilerLocked(loc.isSpoiler, loc.spoilerThresholdChapter, loc.id);
                  return (
                    <div
                      key={loc.id}
                      className="p-3 rounded-2xl border border-border/50 bg-background/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground">{loc.name}</span>
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                          {loc.type}
                        </span>
                      </div>

                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Lock size={12} className="shrink-0" />
                            <span>Bölüm {loc.spoilerThresholdChapter}+ sonrasına aittir.</span>
                          </div>
                          <button
                            onClick={() => toggleUnlockSpoiler(loc.id)}
                            className="text-[10px] font-bold underline shrink-0 hover:text-amber-300"
                          >
                            Aç
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-[11px] text-muted leading-relaxed">
                            {loc.readerNotes || loc.description || 'Açıklama bulunmuyor.'}
                          </p>
                          {(loc.climate || loc.geography || loc.atmosphere) && (
                            <div className="flex flex-wrap gap-1 text-[10px] text-muted pt-1">
                              {loc.climate && <span className="bg-muted/15 px-1.5 py-0.5 rounded">{loc.climate}</span>}
                              {loc.geography && <span className="bg-muted/15 px-1.5 py-0.5 rounded">{loc.geography}</span>}
                              {loc.atmosphere && <span className="bg-muted/15 px-1.5 py-0.5 rounded">{loc.atmosphere}</span>}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── DÜNYA HARİTASI ── */}
            {activeTab === 'maps' && (
              <div className="space-y-3">
                {maps.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {maps.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMapId(m.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                          (selectedMapId || maps[0]?.id) === m.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/20 text-muted hover:text-foreground'
                        }`}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                )}
                {(() => {
                  const currentMap = maps.find((m) => m.id === selectedMapId) || maps[0];
                  if (!currentMap) return <p className="text-xs text-muted text-center py-8">Harita bulunamadı.</p>;
                  return (
                    <div className="rounded-2xl overflow-hidden border border-border/40 shadow-xl">
                      <InteractiveWorldMap
                        map={currentMap}
                        locations={locations}
                        isEditable={false}
                        currentChapterOrder={currentChapterOrder}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── ORGANİZASYONLAR ── */}
            {activeTab === 'organizations' && (
              filteredOrganizations.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Organizasyon bulunamadı.</p>
              ) : (
                filteredOrganizations.map((org) => {
                  const isLocked = isItemSpoilerLocked(org.isSpoiler, org.spoilerThresholdChapter, org.id);
                  const leader = characters.find((c) => c.id === org.leaderCharacterId);
                  const hq = locations.find((l) => l.id === org.headquarterLocationId);

                  return (
                    <div
                      key={org.id}
                      className="p-3.5 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {org.symbolUrl ? (
                            <img src={org.symbolUrl} alt={org.name} className="w-8 h-8 rounded-lg object-cover border border-border/50 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Building2 size={16} />
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-foreground block">{org.name}</span>
                            <span className="text-[10px] text-primary font-semibold uppercase">{org.type}</span>
                          </div>
                        </div>

                        {org.isSpoiler && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5">
                            <Lock size={9} /> B.{org.spoilerThresholdChapter || 1}+
                          </span>
                        )}
                      </div>

                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock size={12} /> Bu örgütün detayları Bölüm {org.spoilerThresholdChapter}+ sonrasında açılır.
                          </span>
                          <button onClick={() => toggleUnlockSpoiler(org.id)} className="underline font-bold shrink-0 ml-2">
                            Aç
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px]">
                          {org.description && (
                            <p className="text-muted leading-relaxed">{org.description}</p>
                          )}
                          {org.ideology && (
                            <p className="italic text-foreground/80">"{org.ideology}"</p>
                          )}
                          <div className="pt-1.5 border-t border-border/30 flex flex-wrap gap-x-3 gap-y-1 text-muted text-[10px]">
                            {leader && <span>👑 Lider: <strong className="text-foreground">{leader.name}</strong></span>}
                            {hq && <span>📍 Merkez: <strong className="text-foreground">{hq.name}</strong></span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── KÜLTÜR & DÜNYA DÜZENİ ── */}
            {activeTab === 'cultures' && (
              filteredCultures.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Kültür veya inanç kaydı bulunamadı.</p>
              ) : (
                filteredCultures.map((cu) => {
                  const isLocked = isItemSpoilerLocked(cu.isSpoiler, cu.spoilerThresholdChapter, cu.id);
                  return (
                    <div
                      key={cu.id}
                      className="p-3.5 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                            <Landmark size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">{cu.name}</span>
                            <span className="text-[10px] text-amber-400 font-semibold uppercase">{cu.category}</span>
                          </div>
                        </div>

                        {cu.isSpoiler && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5">
                            <Lock size={9} /> B.{cu.spoilerThresholdChapter || 1}+
                          </span>
                        )}
                      </div>

                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock size={12} /> Bu inanç veya düzenin detayları Bölüm {cu.spoilerThresholdChapter}+ sonrasında açılır.
                          </span>
                          <button onClick={() => toggleUnlockSpoiler(cu.id)} className="underline font-bold shrink-0 ml-2">
                            Aç
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px]">
                          {cu.traditions && (
                            <p className="text-muted leading-relaxed"><strong className="text-foreground">Gelenekler:</strong> {cu.traditions}</p>
                          )}
                          {cu.taboos && (
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-300 text-[10px]">
                              <strong>⚠️ Tabu & Yasak:</strong> {cu.taboos}
                            </div>
                          )}
                          {toArr(cu.deitiesOrFigures || cu.deitiesAndFigures).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {toArr(cu.deitiesOrFigures || cu.deitiesAndFigures).map((d, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300">
                                  ✨ {d}
                                </span>
                              ))}
                            </div>
                          )}
                          {toArr(cu.holyPlaces || cu.sacredPlacesAndTexts).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {toArr(cu.holyPlaces || cu.sacredPlacesAndTexts).map((p, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300">
                                  📍 {p}
                                </span>
                              ))}
                            </div>
                          )}
                          {cu.governanceSystem && (
                            <p className="text-[10px] text-muted"><strong className="text-foreground">Yönetim:</strong> {cu.governanceSystem}</p>
                          )}
                          {cu.currency && (
                            <p className="text-[10px] text-muted"><strong className="text-foreground">Para Birimi:</strong> {cu.currency}</p>
                          )}
                          {cu.laws && (
                            <p className="text-muted leading-relaxed text-[10px]"><strong className="text-foreground">Yasalar:</strong> {cu.laws}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── EŞYALAR ── */}
            {activeTab === 'items' && (
              filteredItems.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Eşya bulunamadı.</p>
              ) : (
                filteredItems.map((item) => {
                  const isLocked = isItemSpoilerLocked(item.isSpoiler, item.spoilerThresholdChapter, item.id);
                  const owner = characters.find((c) => c.id === item.currentOwnerId);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-border/50 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                              <Sword size={16} />
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-foreground block">{item.name}</span>
                            <span className="text-[10px] text-indigo-400 font-semibold">{item.type || 'Artefakt'}</span>
                          </div>
                        </div>

                        {item.isSpoiler && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5">
                            <Lock size={9} /> B.{item.spoilerThresholdChapter || 1}+
                          </span>
                        )}
                      </div>

                      {isLocked ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock size={12} /> Bu eşyanın gücü Bölüm {item.spoilerThresholdChapter}+ sonrasında açılır.
                          </span>
                          <button onClick={() => toggleUnlockSpoiler(item.id)} className="underline font-bold shrink-0 ml-2">
                            Aç
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px]">
                          {item.description && (
                            <p className="text-muted leading-relaxed">{item.description}</p>
                          )}
                          {item.powerDescription && (
                            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-300 text-[10px]">
                              <strong>✨ Güç:</strong> {item.powerDescription}
                            </div>
                          )}
                          {item.limitation && (
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 text-[10px]">
                              <strong>⚠️ Bedel:</strong> {item.limitation}
                            </div>
                          )}
                          {owner && (
                            <div className="pt-1 text-[10px] text-muted">
                              Sahibi: <strong className="text-foreground">{owner.name}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── GÜÇ SİSTEMLERİ ── */}
            {activeTab === 'powers' && (
              filteredPowerSystems.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Güç sistemi bulunamadı.</p>
              ) : (
                filteredPowerSystems.map((power) => (
                  <div
                    key={power.id}
                    className="p-3.5 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{power.name}</span>
                        {power.source && (
                          <span className="text-[10px] text-muted">Kaynak: {power.source}</span>
                        )}
                      </div>
                    </div>

                    {power.corePrinciples && (
                      <p className="text-[11px] text-muted leading-relaxed">{power.corePrinciples}</p>
                    )}

                    {power.rulesAndLimits && (
                      <div className="p-2 rounded-xl bg-background/50 border border-border/40 text-[10px] text-muted">
                        <strong className="text-foreground block mb-0.5">Kurallar ve Sınırlar:</strong>
                        {power.rulesAndLimits}
                      </div>
                    )}

                    {power.costAndRisks && (
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300">
                        <strong className="block mb-0.5">🔥 Bedel & Tehlike:</strong>
                        {power.costAndRisks}
                      </div>
                    )}

                    {power.levelsOrTiers && power.levelsOrTiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {power.levelsOrTiers.map((tier, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                            {tier}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )
            )}

            {/* 3. SEKME: SÖZLÜK */}
            {activeTab === 'glossary' && (
              filteredGlossary.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Terim bulunamadı.</p>
              ) : (
                filteredGlossary.map((g) => {
                  const isLocked = isItemSpoilerLocked(g.isSpoiler, g.spoilerThresholdChapter, g.id);
                  return (
                    <div
                      key={g.id}
                      className="p-3 rounded-2xl border border-border/50 bg-background/60 space-y-1"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{g.term}</span>
                        {g.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/20 text-muted">
                            {g.category}
                          </span>
                        )}
                        {g.pronunciation && (
                          <span className="text-[10px] text-muted italic">/{g.pronunciation}/</span>
                        )}
                      </div>

                      {isLocked ? (
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] flex items-center justify-between">
                          <span>🔒 İlerleyen bölümlerde keşfedilecek.</span>
                          <button onClick={() => toggleUnlockSpoiler(g.id)} className="underline font-bold">Aç</button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted leading-relaxed mt-0.5">{g.meaning}</p>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* 4. SEKME: LORE */}
            {activeTab === 'lore' && (
              filteredLore.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Lore kaydı bulunamadı.</p>
              ) : (
                filteredLore.map((lore) => {
                  const isLocked = isItemSpoilerLocked(lore.isSpoiler, lore.spoilerThresholdChapter, lore.id);
                  return (
                    <div
                      key={lore.id}
                      className="p-3 rounded-2xl border border-border/50 bg-background/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground">{lore.title}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-bold">
                          {lore.category}
                        </span>
                      </div>

                      {isLocked ? (
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] flex items-center justify-between">
                          <span>🔒 Bölüm {lore.spoilerThresholdChapter}+ sonrasına aittir.</span>
                          <button onClick={() => toggleUnlockSpoiler(lore.id)} className="underline font-bold">Aç</button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted leading-relaxed">
                          {lore.readerContent || lore.content}
                        </p>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* 5. SEKME: GÖRSELLER (MOODBOARD) */}
            {activeTab === 'media' && (
              filteredMedia.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Görsel bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredMedia.map((item) => {
                    const isLocked = isItemSpoilerLocked(item.isSpoiler, item.spoilerThresholdChapter, item.id);
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border/50 bg-background/60 overflow-hidden flex flex-col justify-between group"
                      >
                        {isLocked ? (
                          <div className="p-3 text-center space-y-2 py-6">
                            <span className="text-xl">🔒</span>
                            <p className="text-[10px] text-amber-400 leading-tight">
                              Bölüm {item.spoilerThresholdChapter}+ sonrasına aittir.
                            </p>
                            <button
                              onClick={() => toggleUnlockSpoiler(item.id)}
                              className="text-[10px] text-primary underline font-bold"
                            >
                              Görseli Göster
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => setSelectedLightboxMedia(item)}
                              className="relative aspect-square bg-muted/20 cursor-pointer overflow-hidden"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                              <div className="absolute top-1.5 left-1.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            <div className="p-2.5 space-y-1">
                              <h5 className="font-bold text-xs text-foreground truncate">{item.title}</h5>
                              {item.colorPalette && item.colorPalette.length > 0 && (
                                <div className="flex items-center gap-1 pt-1">
                                  {item.colorPalette.slice(0, 4).map((c, cIdx) => (
                                    <span key={cIdx} className="w-2.5 h-2.5 rounded-full border border-border/50 shrink-0" style={{ backgroundColor: c }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* 6. SEKME: MÜZİK & SOUNDTRACK */}
            {activeTab === 'soundtracks' && (
              filteredSoundtracks.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Müzik kaydı bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {filteredSoundtracks.map((track) => {
                    const isLocked = isItemSpoilerLocked(track.isSpoiler, track.spoilerThresholdChapter, track.id);
                    const parsed = parseAudioTrack(track.url);
                    const platformLabel = getAudioPlatformLabel(parsed.platform);

                    return (
                      <div
                        key={track.id}
                        className="p-3 rounded-2xl border border-border/50 bg-background/60 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 font-bold block mb-1">
                              {track.themeType || track.theme || 'ambient'}
                            </span>
                            <span className="text-xs font-bold text-foreground block truncate">{track.title}</span>
                            {track.artist && (
                              <span className="text-[10px] text-muted block truncate">Sanatçı: {track.artist}</span>
                            )}
                          </div>
                          <span className="text-[9px] text-muted bg-card px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                            {platformLabel}
                          </span>
                        </div>

                        {track.description && (
                          <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{track.description}</p>
                        )}

                        {isLocked ? (
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] flex items-center justify-between">
                            <span>🔒 Bölüm {track.spoilerThresholdChapter}+ sonrasına aittir.</span>
                            <button onClick={() => toggleUnlockSpoiler(track.id)} className="underline font-bold">Aç</button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-border/40">
                            {parsed.platform === 'spotify' && parsed.embedUrl ? (
                              <iframe
                                src={parsed.embedUrl}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded-xl border border-border/40"
                              />
                            ) : parsed.platform === 'direct' ? (
                              <audio controls src={track.url} className="w-full h-8 accent-primary" />
                            ) : parsed.platform === 'youtube' && parsed.embedUrl ? (
                              <iframe
                                src={parsed.embedUrl}
                                width="100%"
                                height="140"
                                title={track.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-xl w-full border border-border/40"
                              />
                            ) : (
                              <a
                                href={track.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                              >
                                <Headphones size={13} />
                                <span>Dinle ({platformLabel})</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── CANON KURALLARI (BIBLE) ── */}
            {activeTab === 'canon_rules' && (
              filteredCanonRules.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <Scale size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Kayıtlı canon kuralı bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCanonRules.map((rule) => {
                    const isLocked = isItemSpoilerLocked(rule.isSpoiler, rule.spoilerChapterOrder, rule.id);

                    return (
                      <div
                        key={rule.id}
                        className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {CANON_RULE_CATEGORY_LABELS[rule.category] || rule.category}
                          </span>
                          {rule.isStrict ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 flex items-center gap-1">
                              <ShieldAlert size={10} /> Bükülemez Yasa
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400">
                              Rehber Kural
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-foreground">{rule.title}</h4>

                        {isLocked ? (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[10px] flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Lock size={11} /> Bölüm {rule.spoilerChapterOrder}+ sonrası için kural detayı gizlendi.
                            </span>
                            <button
                              onClick={() => toggleUnlockSpoiler(rule.id)}
                              className="underline font-bold hover:text-amber-300"
                            >
                              Aç
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-muted leading-relaxed whitespace-pre-line text-[11px]">
                              {rule.description}
                            </p>

                            {rule.consequences && (
                              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] space-y-0.5">
                                <span className="font-bold flex items-center gap-1">
                                  <AlertTriangle size={10} /> İhlal Bedeli:
                                </span>
                                <p className="leading-relaxed text-amber-200/90">{rule.consequences}</p>
                              </div>
                            )}

                            {rule.exceptions && (
                              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] space-y-0.5">
                                <span className="font-bold flex items-center gap-1">
                                  <Sparkles size={10} /> İstisnalar:
                                </span>
                                <p className="leading-relaxed text-blue-200/90">{rule.exceptions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── GİZEMLER & AÇIK KURGU DÜĞÜMLERİ ── */}
            {activeTab === 'plot_threads' && (
              filteredPlotThreads.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <HelpCircle size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Kayıtlı açık gizem bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPlotThreads.map((thread) => {
                    const isLocked = isItemSpoilerLocked(thread.isSpoiler, thread.spoilerChapterOrder, thread.id);

                    return (
                      <div
                        key={thread.id}
                        className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            thread.importance === 'critical'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : thread.importance === 'major'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {PLOT_THREAD_IMPORTANCE_LABELS[thread.importance]}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            thread.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : thread.status === 'clues_planted'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {PLOT_THREAD_STATUS_LABELS[thread.status]}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-foreground">{thread.title}</h4>

                        {isLocked ? (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[10px] flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Lock size={11} /> Bölüm {thread.spoilerChapterOrder}+ sonrası için gizem detayı gizlendi.
                            </span>
                            <button
                              onClick={() => toggleUnlockSpoiler(thread.id)}
                              className="underline font-bold hover:text-amber-300"
                            >
                              Aç
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-muted leading-relaxed whitespace-pre-line text-[11px]">
                              {thread.description}
                            </p>

                            {thread.status === 'resolved' && (
                              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                                <span>Bu gizem çözülmüştür! Hikayeyi okumaya devam ederek cevabı keşfedebilirsiniz.</span>
                              </div>
                            )}

                            {thread.clues && thread.clues.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 space-y-1.5">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                                  <Lightbulb size={11} className="text-amber-400" />
                                  <span>Keşfedilen İpuçları ({thread.clues.length})</span>
                                </div>
                                <div className="space-y-1">
                                  {thread.clues.map((clue, idx) => (
                                    <div key={clue.id || idx} className="text-[10px] text-muted pl-2 border-l border-primary/30">
                                      <span className="font-semibold text-foreground/80">#{idx + 1}: </span>
                                      {clue.note}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Alt Footer */}
          <div className="p-3 border-t border-border/40 bg-card text-center text-[10px] text-muted shrink-0">
            Okuduğunuz bölüme ({currentChapterOrder}. Bölüm) göre spoiler koruması otomatik uygulanmıştır.
          </div>
        </>
      )}

      {/* ── Görsel Önizleme (Lightbox) ── */}
      {selectedLightboxMedia && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLightboxMedia(null)}
        >
          <div
            className="relative max-w-lg w-full bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLightboxMedia(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            <div className="bg-black flex items-center justify-center max-h-[50vh] overflow-hidden">
              <img
                src={selectedLightboxMedia.imageUrl}
                alt={selectedLightboxMedia.title}
                className="max-h-[50vh] max-w-full object-contain"
              />
            </div>

            <div className="p-4 space-y-2 overflow-y-auto">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block">
                {selectedLightboxMedia.category}
              </span>
              <h4 className="font-extrabold text-sm text-foreground">{selectedLightboxMedia.title}</h4>
              {selectedLightboxMedia.description && (
                <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{selectedLightboxMedia.description}</p>
              )}
              {selectedLightboxMedia.colorPalette && selectedLightboxMedia.colorPalette.length > 0 && (
                <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                  {selectedLightboxMedia.colorPalette.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border/40 text-[10px] font-mono">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col }} />
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
