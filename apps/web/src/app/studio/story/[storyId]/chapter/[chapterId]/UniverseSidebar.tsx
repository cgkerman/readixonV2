'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Input } from '@readixon/ui';
import { 
  getUniverseByStoryId, 
  getUniverseCharacters, 
  getUniverseLocations, 
  getUniverseGlossary, 
  getUniverseLoreList,
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
  getUniverseTimelineEvents,
  createUniverseCharacter,
  createUniverseLocation,
  createUniverseGlossaryTerm,
  addPlotThreadClue,
  extractMentionedEntities,
  type InlineUniverseEntity,
  type UniverseTimelineEvent,
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
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronRight,
  Shield,
  Heart,
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
  Plus,
  Sparkles,
  Clock,
  Compass,
  Wand2,
  BookOpen,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { InteractiveWorldMap } from '@/components/InteractiveWorldMap';
import { InteractiveRelationshipGraph } from '@/components/InteractiveRelationshipGraph';

interface UniverseSidebarProps {
  storyId: string;
  chapterId: string;
  chapterTitle?: string;
  chapterOrder?: number;
  currentContent?: string;
  onInsertText?: (text: string) => void;
  onOpenPlanner?: () => void;
  onClose: () => void;
}

function toArr(val?: string | string[] | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

type TabType = 
  | 'mentioned' 
  | 'ai_audit' 
  | 'timeline' 
  | 'characters' 
  | 'relationships' 
  | 'races' 
  | 'creatures' 
  | 'cultures' 
  | 'locations' 
  | 'maps' 
  | 'organizations' 
  | 'items' 
  | 'powers' 
  | 'glossary' 
  | 'lore' 
  | 'media' 
  | 'soundtracks' 
  | 'canon_rules' 
  | 'plot_threads';

export function UniverseSidebar({
  storyId,
  chapterId,
  chapterTitle,
  chapterOrder,
  currentContent = '',
  onInsertText,
  onOpenPlanner,
  onClose,
}: UniverseSidebarProps) {
  const [universe, setUniverse] = useState<Universe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('mentioned');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

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
  const [timelineEvents, setTimelineEvents] = useState<UniverseTimelineEvent[]>([]);
  const [activeThreadForClue, setActiveThreadForClue] = useState<UniversePlotThread | null>(null);
  const [newClueText, setNewClueText] = useState('');
  const [isSavingClue, setIsSavingClue] = useState(false);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<UniverseMedia | null>(null);

  // Hızlı Varlık Ekleme Modalı
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<'character' | 'location' | 'glossary'>('character');
  const [quickName, setQuickName] = useState('');
  const [quickRoleOrType, setQuickRoleOrType] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [isCreatingQuick, setIsCreatingQuick] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const loadUniverseData = async () => {
      setLoading(true);
      try {
        const u = await getUniverseByStoryId(storyId);
        setUniverse(u);

        if (u) {
          const [
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
            threadData,
            timelineData
          ] = await Promise.all([
            getUniverseCharacters(u.universeId),
            getUniverseLocations(u.universeId),
            getUniverseGlossary(u.universeId),
            getUniverseLoreList(u.universeId),
            getUniverseMaps(u.universeId),
            getUniverseOrganizations(u.universeId),
            getUniverseItems(u.universeId),
            getUniversePowerSystems(u.universeId),
            getUniverseRaces(u.universeId),
            getUniverseCreatures(u.universeId),
            getUniverseCultures(u.universeId),
            getUniverseMedia(u.universeId),
            getUniverseSoundtracks(u.universeId),
            getUniverseCanonRules(u.universeId),
            getUniversePlotThreads(u.universeId),
            getUniverseTimelineEvents(u.universeId),
          ]);
          setCharacters(chars);
          setLocations(locs);
          setGlossary(terms);
          setLoreList(lores);
          setMaps(mapList);
          setOrganizations(orgs);
          setItems(itemsList);
          setPowerSystems(powers);
          setRaces(raceList);
          setCreatures(creatureList);
          setCultures(cultureList);
          setMediaList(mediaData);
          setSoundtracks(trackData);
          setCanonRules(canonData);
          setPlotThreads(threadData);
          setTimelineEvents(timelineData);
          if (mapList.length > 0) setSelectedMapId(mapList[0].id);
        }
      } catch (err) {
        console.error('Evren paneli veri yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUniverseData();
  }, [storyId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`"${text}" panoya kopyalandı!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const handleAddClueInline = async (threadId: string) => {
    if (!newClueText.trim() || !universe) return;
    setIsSavingClue(true);
    try {
      await addPlotThreadClue(universe.universeId, threadId, {
        chapterOrder: chapterOrder,
        storyTitle: chapterTitle || '',
        note: newClueText.trim(),
      });
      toast.success('Bölüm ipucu düğüme eklendi!');
      setNewClueText('');
      setActiveThreadForClue(null);
      setPlotThreads(await getUniversePlotThreads(universe.universeId));
    } catch (err) {
      console.error(err);
      toast.error('İpucu eklenemedi.');
    } finally {
      setIsSavingClue(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!universe || !quickName.trim()) return;
    setIsCreatingQuick(true);
    try {
      if (quickCreateType === 'character') {
        await createUniverseCharacter(universe.universeId, {
          name: quickName.trim(),
          role: (quickRoleOrType as any) || 'supporting',
          occupation: quickDesc.trim(),
          universeId: universe.universeId,
        });
        const updatedChars = await getUniverseCharacters(universe.universeId);
        setCharacters(updatedChars);
        toast.success(`"${quickName.trim()}" karakteri evrene eklendi.`);
      } else if (quickCreateType === 'location') {
        await createUniverseLocation(universe.universeId, {
          name: quickName.trim(),
          type: (quickRoleOrType as any) || 'city',
          description: quickDesc.trim(),
          universeId: universe.universeId,
        });
        const updatedLocs = await getUniverseLocations(universe.universeId);
        setLocations(updatedLocs);
        toast.success(`"${quickName.trim()}" mekânı evrene eklendi.`);
      } else if (quickCreateType === 'glossary') {
        await createUniverseGlossaryTerm(universe.universeId, {
          term: quickName.trim(),
          category: quickRoleOrType.trim() || 'Genel',
          meaning: quickDesc.trim(),
          universeId: universe.universeId,
        });
        const updatedGloss = await getUniverseGlossary(universe.universeId);
        setGlossary(updatedGloss);
        toast.success(`"${quickName.trim()}" terimi sözlüğe eklendi.`);
      }
      setQuickName('');
      setQuickRoleOrType('');
      setQuickDesc('');
      setIsQuickCreateOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Varlık eklenirken bir hata oluştu.');
    } finally {
      setIsCreatingQuick(false);
    }
  };

  // Tüm Evren Varlıklarını Satır İçi Denetim Listesi Haline Getir
  const inlineEntities: InlineUniverseEntity[] = useMemo(() => {
    if (!universe) return [];
    const list: InlineUniverseEntity[] = [];

    for (const c of characters) {
      if (c.name) {
        list.push({
          id: c.id,
          name: c.name,
          type: 'character',
          roleOrType: c.role === 'protagonist' ? 'Ana Karakter' : c.role === 'antagonist' ? 'Karşıt' : 'Yan Karakter',
          shortDescription: c.occupation || c.coreMotivation || '',
          avatarUrl: c.avatarUrl,
          universeId: universe.universeId,
        });
      }
    }

    for (const l of locations) {
      if (l.name) {
        list.push({
          id: l.id,
          name: l.name,
          type: 'location',
          roleOrType: l.type,
          shortDescription: l.description || '',
          avatarUrl: l.imageUrl,
          universeId: universe.universeId,
        });
      }
    }

    for (const g of glossary) {
      if (g.term) {
        list.push({
          id: g.id,
          name: g.term,
          type: 'glossary',
          roleOrType: g.category,
          shortDescription: g.meaning || '',
          universeId: universe.universeId,
        });
      }
    }

    for (const i of items) {
      if (i.name) {
        list.push({
          id: i.id,
          name: i.name,
          type: 'item',
          roleOrType: i.type,
          shortDescription: i.description || '',
          avatarUrl: i.imageUrl,
          universeId: universe.universeId,
        });
      }
    }

    for (const cr of creatures) {
      if (cr.name) {
        list.push({
          id: cr.id,
          name: cr.name,
          type: 'creature',
          roleOrType: cr.creatureType || cr.type || '',
          shortDescription: cr.appearance || cr.behavior || '',
          avatarUrl: cr.imageUrl,
          universeId: universe.universeId,
        });
      }
    }

    for (const org of organizations) {
      if (org.name) {
        list.push({
          id: org.id,
          name: org.name,
          type: 'organization',
          roleOrType: org.type,
          shortDescription: org.description || '',
          avatarUrl: org.symbolUrl,
          universeId: universe.universeId,
        });
      }
    }

    return list;
  }, [universe, characters, locations, glossary, items, creatures, organizations]);

  // Metinde Tespit Edilen Evren Varlıkları
  const mentionedEntities = useMemo(() => {
    if (!currentContent) return [];
    return extractMentionedEntities(currentContent, inlineEntities);
  }, [currentContent, inlineEntities]);

  // AI Evren ve Kurgusal Tutarlılık Denetimleri (PRD Bölüm 34)
  const consistencyAudits = useMemo(() => {
    interface AuditItem {
      id: string;
      type: 'flaw_warning' | 'canon_rule' | 'plot_thread' | 'relationship_dynamic';
      severity: 'high' | 'medium' | 'info';
      title: string;
      description: string;
      relatedEntityName?: string;
    }

    const audits: AuditItem[] = [];
    if (!currentContent) return audits;

    const lowerContent = currentContent.toLowerCase();

    // 1. Karakter Zaafı ve Yazar Notu Uyarıları
    for (const ent of mentionedEntities) {
      if (ent.type === 'character') {
        const charObj = characters.find((c) => c.id === ent.id);
        if (charObj) {
          if (charObj.characterArc?.flawOrLack) {
            audits.push({
              id: `flaw_${charObj.id}`,
              type: 'flaw_warning',
              severity: 'medium',
              title: `Zaaf Sınaması: ${charObj.name}`,
              description: `${charObj.name} bu bölümde geçiyor. Tanımlı zaafı: "${charObj.characterArc.flawOrLack}". Karakterin bu sahnede zaafına uygun veya onu aşmaya yönelik davranış sergilediğinden emin olun.`,
              relatedEntityName: charObj.name,
            });
          }
          if (charObj.authorNotes) {
            audits.push({
              id: `note_${charObj.id}`,
              type: 'flaw_warning',
              severity: 'info',
              title: `Gizli Not: ${charObj.name}`,
              description: charObj.authorNotes,
              relatedEntityName: charObj.name,
            });
          }
        }
      }
    }

    // 2. Sahne İçi Karakter İlişki Dinamikleri
    const mentionedCharIds = new Set(
      mentionedEntities.filter((e) => e.type === 'character').map((e) => e.id)
    );

    for (const c of characters) {
      if (mentionedCharIds.has(c.id) && c.relationships && c.relationships.length > 0) {
        for (const rel of c.relationships) {
          if (rel.targetCharacterId && mentionedCharIds.has(rel.targetCharacterId)) {
            const targetChar = characters.find((tc) => tc.id === rel.targetCharacterId);
            const targetName = targetChar ? targetChar.name : rel.targetCharacterName;
            audits.push({
              id: `rel_${c.id}_${rel.targetCharacterId}`,
              type: 'relationship_dynamic',
              severity: 'high',
              title: `Karakter Bağı: ${c.name} & ${targetName}`,
              description: `Aralarındaki bağ: "${rel.relationshipType}" ${rel.isSecret ? '(Gizli İlişki)' : ''}. ${rel.description || 'Bu sahnede aralarındaki çatışma veya müttefiklik dengesi korunuyor mu?'}`,
              relatedEntityName: `${c.name} & ${targetName}`,
            });
          }
        }
      }
    }

    // 3. Kesin Canon Kuralları
    for (const rule of canonRules) {
      const titleMatch = lowerContent.includes(rule.title.toLowerCase());
      const ruleStrict = rule.isStrict;
      if (titleMatch || ruleStrict) {
        audits.push({
          id: `canon_${rule.id}`,
          type: 'canon_rule',
          severity: ruleStrict ? 'high' : 'info',
          title: `${ruleStrict ? '⚠️ Kesin Canon Kuralı' : '📜 Evren Kuralı'}: ${rule.title}`,
          description: rule.description || 'Bu kurgusal evren kuralının ihlal edilmediğinden emin olun.',
          relatedEntityName: rule.title,
        });
      }
    }

    // 4. Açık Kurgu Düğümleri
    for (const thread of plotThreads) {
      if (thread.status === 'open' || thread.status === 'clues_planted') {
        const threadInText = lowerContent.includes(thread.title.toLowerCase());
        if (threadInText || thread.importance === 'major') {
          audits.push({
            id: `thread_${thread.id}`,
            type: 'plot_thread',
            severity: thread.importance === 'major' ? 'high' : 'medium',
            title: `Gizem / Kurgu Düğümü: ${thread.title}`,
            description: thread.description || 'Bu gizeme dair bölüme bir ipucu veya gelişme ekleyebilirsiniz.',
            relatedEntityName: thread.title,
          });
        }
      }
    }

    return audits;
  }, [currentContent, mentionedEntities, characters, canonRules, plotThreads]);

  // Arama filtreleri
  const filteredMentioned = mentionedEntities.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.roleOrType && m.roleOrType.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.shortDescription && m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTimeline = timelineEvents.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.era && t.era.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.customDate && t.customDate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-card/95 backdrop-blur-xl border-l border-border/70 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Üst Başlık & Kapat */}
      <div className="p-3.5 border-b border-border/50 bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <Layers size={16} />
          </div>
          <div className="min-w-0">
            <Typography variant="h3" className="font-extrabold text-sm text-foreground truncate">
              {universe ? universe.title : 'Evren Paneli'}
            </Typography>
            <span className="text-[10px] text-muted block truncate">
              {chapterTitle ? `Bölüm: ${chapterTitle}` : 'Yazar Çalışma & Referans Rehberi'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenPlanner && (
            <button
              type="button"
              onClick={onOpenPlanner}
              className="px-2 py-1 rounded-lg text-primary hover:bg-primary/10 border border-primary/20 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Kurgu Sihirbazı & Bölüm Planlayıcı"
            >
              <Wand2 size={13} />
              <span className="hidden sm:inline">Kurgu</span>
            </button>
          )}

          {universe && (
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(true)}
              className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 flex items-center gap-1 transition-colors shadow-sm"
              title="Evrene Hızlı Varlık Ekle"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Hızlı Ekle</span>
            </button>
          )}

          {universe && (
            <Link
              href={`/studio/universes/${universe.universeId}`}
              target="_blank"
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/15 transition-colors"
              title="Evren Stüdyosunu Yeni Sekmede Aç"
            >
              <ExternalLink size={15} />
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/15 transition-colors"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted">
          <Loader2 size={28} className="animate-spin text-primary mb-2" />
          <p className="text-xs">Evren verileri yükleniyor...</p>
        </div>
      ) : !universe ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/15 flex items-center justify-center text-muted mx-auto">
            <Layers size={24} />
          </div>
          <Typography variant="h4" className="font-bold text-sm text-foreground">
            Evren Bağlantısı Yok
          </Typography>
          <p className="text-xs text-muted leading-relaxed">
            Bu eser henüz bir kurgusal evrene bağlı değil. Eserinizi bir evrene bağladığınızda; karakterler, mekânlar ve sözlük buraya gelecektir.
          </p>
          <Link
            href="/studio/universes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-colors"
          >
            Evren Stüdyosuna Git
          </Link>
        </div>
      ) : (
        <>
          {/* Sekmeler */}
          <div className="flex items-center border-b border-border/40 px-2 bg-muted/10 shrink-0 overflow-x-auto scrollbar-none">
            {/* 1. BU BÖLÜMDE (MENTIONED) */}
            <button
              onClick={() => setActiveTab('mentioned')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'mentioned'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Sparkles size={13} className={mentionedEntities.length > 0 ? 'text-amber-400' : ''} />
              <span>Bu Bölümde</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                mentionedEntities.length > 0 ? 'bg-primary/20 text-primary font-bold' : 'bg-muted/20'
              }`}>
                {mentionedEntities.length}
              </span>
            </button>

            {/* 2. AI TUTARLILIK (AI AUDIT) */}
            <button
              onClick={() => setActiveTab('ai_audit')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ai_audit'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <ShieldAlert size={13} className={consistencyAudits.length > 0 ? 'text-rose-400' : ''} />
              <span>AI Tutarlılık</span>
              {consistencyAudits.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                  {consistencyAudits.length}
                </span>
              )}
            </button>

            {/* 3. ZAMAN ÇİZELGESİ (TIMELINE) */}
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'timeline'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Clock size={13} />
              <span>Zaman</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/20">{timelineEvents.length}</span>
            </button>

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
                placeholder="Ara..."
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
            
            {/* 0. BU BÖLÜMDE GEÇEN VARLIKLAR (MENTIONED) */}
            {activeTab === 'mentioned' && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Bu Bölümde Tespit Edilenler
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {mentionedEntities.length} Varlık
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Bölüm metniniz taranarak geçen evren varlıkları canlı olarak listelenir.
                  </p>
                </div>

                {filteredMentioned.length === 0 ? (
                  <div className="p-6 text-center space-y-3 bg-muted/5 rounded-2xl border border-dashed border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-muted/20 text-muted flex items-center justify-center mx-auto">
                      <Search size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {searchQuery ? 'Aramaya Uygun Varlık Bulunamadı' : 'Henüz Varlık Tespit Edilmedi'}
                      </h4>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">
                        {searchQuery
                          ? 'Arama kriterlerinizi değiştirip tekrar deneyin.'
                          : 'Bölüm metnine evreninizdeki karakterlerin, mekânların veya terimlerin isimlerini yazdıkça burada otomatik listelenecektir.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuickCreateOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs font-bold transition-colors"
                    >
                      <Plus size={13} />
                      <span>Hızlı Varlık Ekle</span>
                    </button>
                  </div>
                ) : (
                  filteredMentioned.map((m) => {
                    const isExpanded = expandedItemId === `m_${m.id}`;
                    return (
                      <div
                        key={`m_${m.id}`}
                        className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                      >
                        <div
                          onClick={() => toggleExpand(`m_${m.id}`)}
                          className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {m.avatarUrl ? (
                              <img src={m.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border/40" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-foreground truncate">{m.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  m.type === 'character' ? 'bg-indigo-500/15 text-indigo-400' :
                                  m.type === 'location' ? 'bg-emerald-500/15 text-emerald-400' :
                                  m.type === 'glossary' ? 'bg-amber-500/15 text-amber-400' :
                                  m.type === 'item' ? 'bg-purple-500/15 text-purple-400' :
                                  m.type === 'creature' ? 'bg-rose-500/15 text-rose-400' :
                                  'bg-blue-500/15 text-blue-400'
                                }`}>
                                  {m.type === 'character' ? 'Karakter' :
                                   m.type === 'location' ? 'Mekân' :
                                   m.type === 'glossary' ? 'Sözlük' :
                                   m.type === 'item' ? 'Eşya' :
                                   m.type === 'creature' ? 'Yaratık' : 'Örgüt'}
                                </span>
                              </div>
                              {m.roleOrType && (
                                <span className="text-[10px] text-muted truncate block mt-0.5">
                                  {m.roleOrType}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {onInsertText && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onInsertText(m.name);
                                }}
                                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Bölüm Metnine Ekle"
                              >
                                <Plus size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(m.name, `m_${m.id}`);
                              }}
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="İsmi Kopyala"
                            >
                              {copiedId === `m_${m.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                            <div className="text-muted p-1">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-1.5 text-muted animate-in fade-in duration-150">
                            {m.shortDescription && (
                              <p className="leading-relaxed text-foreground/90">{m.shortDescription}</p>
                            )}
                            <div className="pt-1 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (m.type === 'character') setActiveTab('characters');
                                  else if (m.type === 'location') setActiveTab('locations');
                                  else if (m.type === 'glossary') setActiveTab('glossary');
                                  else if (m.type === 'item') setActiveTab('items');
                                  else if (m.type === 'creature') setActiveTab('creatures');
                                  else if (m.type === 'organization') setActiveTab('organizations');
                                  setSearchQuery(m.name);
                                }}
                                className="text-[10px] text-primary hover:underline font-semibold"
                              >
                                Detaylı kartına git →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* AI TUTARLILIK VE DENETİM (AI AUDIT) */}
            {activeTab === 'ai_audit' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-400" />
                      AI Evren & Kurgu Tutarlılık Asistanı
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      consistencyAudits.length > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {consistencyAudits.length} Madde
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Bölüm içeriğiniz taranarak karakter zaafları, gizli notlar, sahne içi ilişkiler ve kesin canon kuralları gerçek zamanlı analiz edilir.
                  </p>
                </div>

                {consistencyAudits.length === 0 ? (
                  <div className="p-6 text-center space-y-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={20} />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Tüm Kontroller Kusursuz!</h4>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Bu bölüm metninde tespit edilen evren kuralları veya açık kurgu çelişkisi bulunmuyor.
                    </p>
                  </div>
                ) : (
                  consistencyAudits.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all space-y-2 ${
                        item.severity === 'high'
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : item.severity === 'medium'
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-indigo-500/5 border-indigo-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {item.type === 'flaw_warning' && <AlertTriangle size={14} className="text-amber-400 shrink-0" />}
                          {item.type === 'relationship_dynamic' && <Heart size={14} className="text-purple-400 shrink-0" />}
                          {item.type === 'canon_rule' && <Scale size={14} className="text-rose-400 shrink-0" />}
                          {item.type === 'plot_thread' && <HelpCircle size={14} className="text-blue-400 shrink-0" />}
                          <span className="text-xs font-bold text-foreground">{item.title}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                          item.severity === 'high' ? 'bg-rose-500/20 text-rose-300' :
                          item.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {item.severity === 'high' ? 'Önemli' : item.severity === 'medium' ? 'Dikkat' : 'Bilgi'}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>

                      {item.type === 'plot_thread' && (
                        <div className="pt-1 flex items-center justify-between border-t border-border/30">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('plot_threads');
                              setSearchQuery(item.relatedEntityName || '');
                            }}
                            className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                          >
                            <Lightbulb size={11} />
                            <span>İpucu Ekle / Yönet →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ZAMAN ÇİZELGESİ (TIMELINE) */}
            {activeTab === 'timeline' && (
              filteredTimeline.length === 0 ? (
                <div className="text-center py-8 text-muted space-y-2">
                  <Clock size={24} className="mx-auto text-muted/60" />
                  <p className="text-xs">Zaman çizelgesi olayı bulunamadı.</p>
                </div>
              ) : (
                filteredTimeline.map((ev) => {
                  const isExpanded = expandedItemId === ev.id;
                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(ev.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Clock size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{ev.title}</span>
                              {ev.era && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                                  {ev.era}
                                </span>
                              )}
                              {ev.customDate && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-bold">
                                  {ev.customDate}
                                </span>
                              )}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted/20 text-muted font-bold">
                                {ev.eventType === 'universe_history' ? 'Evren Tarihi' : 'Hikâye Kronolojisi'}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted truncate block mt-0.5">{ev.summary}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onInsertText && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInsertText(ev.title);
                              }}
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Bölüm Metnine Ekle"
                            >
                              <Plus size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(ev.title, ev.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Başlığı Kopyala"
                          >
                            {copiedId === ev.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          <p className="leading-relaxed text-foreground/90">{ev.summary}</p>
                          {ev.detailedDescription && (
                            <p className="leading-relaxed whitespace-pre-wrap">{ev.detailedDescription}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* 1. SEKME: KARAKTERLER */}
            {activeTab === 'characters' && (
              filteredCharacters.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Karakter bulunamadı.</p>
              ) : (
                filteredCharacters.map((c) => {
                  const isExpanded = expandedItemId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div 
                        onClick={() => toggleExpand(c.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border/40" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground truncate block">{c.name}</span>
                            <span className="text-[10px] text-muted truncate block capitalize">
                              {c.role === 'protagonist' ? 'Ana Karakter' : c.role === 'antagonist' ? 'Karşıt' : 'Yan Karakter'}
                              {c.occupation ? ` • ${c.occupation}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onInsertText && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInsertText(c.name);
                              }}
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Bölüm Metnine Ekle"
                            >
                              <Plus size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(c.name, c.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === c.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {/* Genişletilmiş Yazar Referans Kartı */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {c.coreMotivation && (
                            <div>
                              <strong className="text-foreground block text-[10px] uppercase font-bold">Motivasyon:</strong>
                              <p className="mt-0.5 leading-relaxed">{c.coreMotivation}</p>
                            </div>
                          )}

                          {c.characterArc?.flawOrLack && (
                            <div>
                              <strong className="text-blue-400 block text-[10px] uppercase font-bold">Karakter Zaafı:</strong>
                              <p className="mt-0.5 leading-relaxed">{c.characterArc.flawOrLack}</p>
                            </div>
                          )}

                          {c.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{c.authorNotes}</p>
                            </div>
                          )}

                          {(c.relationships?.length || 0) > 0 && (
                            <div>
                              <strong className="text-purple-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Heart size={10} /> İlişkiler:
                              </strong>
                              <ul className="mt-1 space-y-0.5">
                                {c.relationships?.map((r, i) => (
                                  <li key={i} className="text-[10px]">
                                    • <span className="font-semibold text-foreground">{r.targetCharacterName}</span>: {r.relationshipType} {r.isSecret ? '(Gizli)' : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
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
                  const isExpanded = expandedItemId === r.id;
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(r.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                            <Dna size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{r.name}</span>
                              {r.lifespan && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 font-bold">
                                  {r.lifespan}
                                </span>
                              )}
                              {r.isSpoiler && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5" title={`Bölüm ${r.spoilerThresholdChapter || 1}+ Spoiler`}>
                                  <Lock size={9} /> B.{r.spoilerThresholdChapter || 1}+
                                </span>
                              )}
                            </div>
                            {r.origin && (
                              <span className="text-[10px] text-muted truncate block mt-0.5">Köken: {r.origin}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(r.name, r.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === r.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {r.altNames && r.altNames.length > 0 && (
                            <div>
                              <strong className="text-foreground block text-[10px] font-bold">Diğer İsimler:</strong>
                              <p className="mt-0.5 text-muted">{r.altNames.join(', ')}</p>
                            </div>
                          )}
                          {r.physicalTraits && (
                            <div>
                              <strong className="text-teal-400 block text-[10px] uppercase font-bold">Fiziksel Özellikler:</strong>
                              <p className="mt-0.5 leading-relaxed text-foreground/90">{r.physicalTraits}</p>
                            </div>
                          )}
                          {r.cultureAndTraditions && (
                            <div>
                              <strong className="text-foreground block text-[10px] uppercase font-bold">Kültür & Gelenek:</strong>
                              <p className="mt-0.5 leading-relaxed">{r.cultureAndTraditions}</p>
                            </div>
                          )}
                          {toArr(r.strengths).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {toArr(r.strengths).map((s, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                                  + {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {toArr(r.weaknesses).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {toArr(r.weaknesses).map((w, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-medium">
                                  - {w}
                                </span>
                              ))}
                            </div>
                          )}
                          {r.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{r.authorNotes}</p>
                            </div>
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
                  const isExpanded = expandedItemId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(c.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="w-7 h-7 rounded-lg object-cover border border-border/50 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                              <Skull size={14} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{c.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-bold">
                                {c.dangerLevel}
                              </span>
                              {c.isSpoiler && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5" title={`Bölüm ${c.spoilerThresholdChapter || 1}+ Spoiler`}>
                                  <Lock size={9} /> B.{c.spoilerThresholdChapter || 1}+
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted truncate block mt-0.5">{c.creatureType}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(c.name, c.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === c.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {c.appearance && (
                            <p className="leading-relaxed">{c.appearance}</p>
                          )}
                          {c.behavior && (
                            <div>
                              <strong className="text-rose-400 block text-[10px] uppercase font-bold">Davranış:</strong>
                              <p className="mt-0.5 leading-relaxed text-foreground/90">{c.behavior}</p>
                            </div>
                          )}
                          {toArr(c.abilities).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {toArr(c.abilities).map((a, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-medium">
                                  ⚡ {a}
                                </span>
                              ))}
                            </div>
                          )}
                          {toArr(c.dropMaterials || c.dropsOrMaterials).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {toArr(c.dropMaterials || c.dropsOrMaterials).map((m, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 font-medium">
                                  💎 {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {c.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{c.authorNotes}</p>
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
                filteredLocations.map((l) => {
                  const isExpanded = expandedItemId === l.id;
                  return (
                    <div
                      key={l.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div 
                        onClick={() => toggleExpand(l.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">{l.name}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                              {l.type}
                            </span>
                          </div>
                          {l.atmosphere && (
                            <span className="text-[10px] text-muted truncate block mt-0.5">{l.atmosphere}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onInsertText && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInsertText(l.name);
                              }}
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Bölüm Metnine Ekle"
                            >
                              <Plus size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(l.name, l.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === l.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {l.description && (
                            <p className="leading-relaxed">{l.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            {l.climate && <div><strong>İklim:</strong> {l.climate}</div>}
                            {l.geography && <div><strong>Coğrafya:</strong> {l.geography}</div>}
                          </div>
                          {l.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{l.authorNotes}</p>
                            </div>
                          )}
                        </div>
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
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── ORGANİZASYONLAR ── */}
            {activeTab === 'organizations' && (
              filteredOrganizations.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Organizasyon veya hanedan bulunamadı.</p>
              ) : (
                filteredOrganizations.map((org) => {
                  const isExpanded = expandedItemId === org.id;
                  return (
                    <div
                      key={org.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(org.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {org.symbolUrl ? (
                            <img
                              src={org.symbolUrl}
                              alt={org.name}
                              className="w-7 h-7 rounded-lg object-cover border border-border/50 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Building2 size={14} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{org.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                                {org.type}
                              </span>
                              {org.isSpoiler && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5" title={`Bölüm ${org.spoilerThresholdChapter || 1}+ Spoiler`}>
                                  <Lock size={9} /> B.{org.spoilerThresholdChapter || 1}+
                                </span>
                              )}
                            </div>
                            {org.motto ? (
                              <span className="text-[10px] text-muted italic truncate block mt-0.5">"{org.motto}"</span>
                            ) : org.ideology ? (
                              <span className="text-[10px] text-muted truncate block mt-0.5">{org.ideology}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(org.name, org.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === org.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {org.description && (
                            <p className="leading-relaxed">{org.description}</p>
                          )}
                          {org.ideology && (
                            <div>
                              <strong className="text-primary block text-[10px] uppercase font-bold">İdeoloji & Amaç:</strong>
                              <p className="mt-0.5 leading-relaxed text-foreground/90">{org.ideology}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                            {org.leaderCharacterName && (
                              <div>
                                <strong className="text-amber-400 block font-bold">👑 Lider:</strong>
                                <span className="text-foreground">{org.leaderCharacterName}</span>
                              </div>
                            )}
                            {org.headquartersLocationName && (
                              <div>
                                <strong className="text-emerald-400 block font-bold">📍 Merkez:</strong>
                                <span className="text-foreground">{org.headquartersLocationName}</span>
                              </div>
                            )}
                          </div>
                          {org.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{org.authorNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* ── KÜLTÜR, İNANÇ & DÜNYA DÜZENİ ── */}
            {activeTab === 'cultures' && (
              filteredCultures.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Kültür veya dünya düzeni kaydı bulunamadı.</p>
              ) : (
                filteredCultures.map((cu) => {
                  const isExpanded = expandedItemId === cu.id;
                  return (
                    <div
                      key={cu.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(cu.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                            <Landmark size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{cu.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-bold">
                                {cu.category}
                              </span>
                              {cu.isSpoiler && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5" title={`Bölüm ${cu.spoilerThresholdChapter || 1}+ Spoiler`}>
                                  <Lock size={9} /> B.{cu.spoilerThresholdChapter || 1}+
                                </span>
                              )}
                            </div>
                            {cu.governanceSystem ? (
                              <span className="text-[10px] text-muted truncate block mt-0.5">{cu.governanceSystem}</span>
                            ) : cu.currency ? (
                              <span className="text-[10px] text-muted truncate block mt-0.5">Para: {cu.currency}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(cu.name, cu.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === cu.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {cu.traditions && (
                            <div>
                              <strong className="text-foreground block text-[10px] uppercase font-bold">Gelenekler:</strong>
                              <p className="mt-0.5 leading-relaxed">{cu.traditions}</p>
                            </div>
                          )}
                          {cu.taboos && (
                            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                              <strong className="block text-[10px] uppercase font-bold">⚠️ Tabular:</strong>
                              <p className="mt-0.5 leading-relaxed">{cu.taboos}</p>
                            </div>
                          )}
                          {toArr(cu.deitiesOrFigures || cu.deitiesAndFigures).length > 0 && (
                            <div>
                              <strong className="text-purple-400 block text-[10px] uppercase font-bold">Tanrılar & Figürler:</strong>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {toArr(cu.deitiesOrFigures || cu.deitiesAndFigures).map((d, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300">
                                    ✨ {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {toArr(cu.holyPlaces || cu.sacredPlacesAndTexts).length > 0 && (
                            <div>
                              <strong className="text-emerald-400 block text-[10px] uppercase font-bold">Kutsal Yerler:</strong>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {toArr(cu.holyPlaces || cu.sacredPlacesAndTexts).map((p, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300">
                                    📍 {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {cu.creationMyth && (
                            <div>
                              <strong className="text-foreground block text-[10px] uppercase font-bold">Yaratılış Miti:</strong>
                              <p className="mt-0.5 leading-relaxed">{cu.creationMyth}</p>
                            </div>
                          )}
                          {cu.laws && (
                            <div>
                              <strong className="text-blue-400 block text-[10px] uppercase font-bold">Hukuk & Yasalar:</strong>
                              <p className="mt-0.5 leading-relaxed">{cu.laws}</p>
                            </div>
                          )}
                          {cu.currency && (
                            <div className="text-[10px]">
                              <strong>Para Birimi:</strong> <span className="text-foreground">{cu.currency}</span>
                            </div>
                          )}
                          {toArr(cu.socialClasses).length > 0 && (
                            <div className="text-[10px]">
                              <strong>Sınıflar:</strong> <span className="text-foreground">{toArr(cu.socialClasses).join(', ')}</span>
                            </div>
                          )}
                          {cu.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{cu.authorNotes}</p>
                            </div>
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
                <p className="text-xs text-muted text-center py-8">Eşya veya artefakt bulunamadı.</p>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(item.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-7 h-7 rounded-lg object-cover border border-border/50 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                              <Sword size={14} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                                {item.type || 'Artefakt'}
                              </span>
                              {item.isSpoiler && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5" title={`Bölüm ${item.spoilerThresholdChapter || 1}+ Spoiler`}>
                                  <Lock size={9} /> B.{item.spoilerThresholdChapter || 1}+
                                </span>
                              )}
                            </div>
                            {item.currentOwnerName ? (
                              <span className="text-[10px] text-muted truncate block mt-0.5">Sahip: {item.currentOwnerName}</span>
                            ) : item.origin ? (
                              <span className="text-[10px] text-muted truncate block mt-0.5">Köken: {item.origin}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onInsertText && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInsertText(item.name);
                              }}
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Bölüm Metnine Ekle"
                            >
                              <Plus size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.name, item.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === item.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {item.description && (
                            <p className="leading-relaxed">{item.description}</p>
                          )}
                          {item.powersAndAbilities && (
                            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
                              <strong className="block text-[10px] uppercase font-bold">✨ Güç & Nitelikler:</strong>
                              <p className="mt-0.5 leading-relaxed">{item.powersAndAbilities}</p>
                            </div>
                          )}
                          {item.limitationsAndCosts && (
                            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                              <strong className="block text-[10px] uppercase font-bold">⚠️ Sınır & Bedel:</strong>
                              <p className="mt-0.5 leading-relaxed">{item.limitationsAndCosts}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                            {item.creatorCharacterName && (
                              <div>
                                <strong className="text-muted block font-bold">Üretici / Usta:</strong>
                                <span className="text-foreground">{item.creatorCharacterName}</span>
                              </div>
                            )}
                            {item.origin && (
                              <div>
                                <strong className="text-muted block font-bold">Köken / Mekân:</strong>
                                <span className="text-foreground">{item.origin}</span>
                              </div>
                            )}
                          </div>
                          {item.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{item.authorNotes}</p>
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
                <p className="text-xs text-muted text-center py-8">Güç veya büyü sistemi bulunamadı.</p>
              ) : (
                filteredPowerSystems.map((ps) => {
                  const isExpanded = expandedItemId === ps.id;
                  return (
                    <div
                      key={ps.id}
                      className="rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleExpand(ps.id)}
                        className="p-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                            <Zap size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{ps.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-bold">
                                {ps.type || 'Sistem'}
                              </span>
                              {ps.isSpoiler && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold flex items-center gap-0.5" title={`Bölüm ${ps.spoilerThresholdChapter || 1}+ Spoiler`}>
                                  <Lock size={9} /> B.{ps.spoilerThresholdChapter || 1}+
                                </span>
                              )}
                            </div>
                            {ps.sourceOfPower && (
                              <span className="text-[10px] text-muted truncate block mt-0.5">Kaynak: {ps.sourceOfPower}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(ps.name, ps.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="İsmi Kopyala"
                          >
                            {copiedId === ps.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <div className="text-muted p-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/5 text-[11px] space-y-2 text-muted animate-in fade-in duration-150">
                          {ps.corePrinciples && (
                            <div>
                              <strong className="text-indigo-400 block text-[10px] uppercase font-bold">Temel Prensipler:</strong>
                              <p className="mt-0.5 leading-relaxed text-foreground/90">{ps.corePrinciples}</p>
                            </div>
                          )}
                          {ps.rulesAndLimits && (
                            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                              <strong className="block text-[10px] uppercase font-bold">Kurallar & Sınırlar:</strong>
                              <p className="mt-0.5 leading-relaxed">{ps.rulesAndLimits}</p>
                            </div>
                          )}
                          {ps.costsAndRisks && (
                            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                              <strong className="block text-[10px] uppercase font-bold">Bedel & Yan Etkiler:</strong>
                              <p className="mt-0.5 leading-relaxed">{ps.costsAndRisks}</p>
                            </div>
                          )}
                          {ps.tiers && ps.tiers.length > 0 && (
                            <div>
                              <strong className="text-foreground block text-[10px] uppercase font-bold mb-1">Seviyeler & Rütbeler:</strong>
                              <div className="space-y-1">
                                {ps.tiers.map((t, idx) => (
                                  <div key={idx} className="p-1.5 rounded-lg bg-background/80 border border-border/30 text-[10px] flex items-start gap-1.5">
                                    <span className="font-bold text-amber-400 shrink-0">#{t.rank || idx + 1}</span>
                                    <div>
                                      <span className="font-semibold text-foreground">{t.title}</span>
                                      {t.description && <p className="text-muted text-[9px] mt-0.5">{t.description}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {ps.authorNotes && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <strong className="block text-[10px] uppercase font-bold flex items-center gap-1">
                                <Lock size={10} /> Gizli Yazar Notu:
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{ps.authorNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* 3. SEKME: SÖZLÜK */}
            {activeTab === 'glossary' && (
              filteredGlossary.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Terim bulunamadı.</p>
              ) : (
                filteredGlossary.map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all flex items-start justify-between gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{g.term}</span>
                        {g.category && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted/20 text-muted font-medium">
                            {g.category}
                          </span>
                        )}
                        {g.pronunciation && (
                          <span className="text-[10px] text-muted italic">/{g.pronunciation}/</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">{g.meaning}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onInsertText && (
                        <button
                          type="button"
                          onClick={() => onInsertText(g.term)}
                          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Bölüm Metnine Ekle"
                        >
                          <Plus size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(g.term, g.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Terimi Kopyala"
                      >
                        {copiedId === g.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* 4. SEKME: LORE */}
            {activeTab === 'lore' && (
              filteredLore.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Lore kaydı bulunamadı.</p>
              ) : (
                filteredLore.map((lore) => (
                  <div
                    key={lore.id}
                    className="p-3 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">{lore.title}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-bold">
                          {lore.category}
                        </span>
                        {onInsertText && (
                          <button
                            type="button"
                            onClick={() => onInsertText(lore.title)}
                            className="p-1 rounded text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Bölüm Metnine Ekle"
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                      {lore.content}
                    </p>
                    {lore.secretContent && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                        <strong>Sır:</strong> {lore.secretContent}
                      </div>
                    )}
                  </div>
                ))
              )
            )}

            {/* 5. SEKME: GÖRSEL ARŞİV (MOODBOARD) */}
            {activeTab === 'media' && (
              filteredMedia.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Görsel bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border/50 bg-background/60 overflow-hidden flex flex-col justify-between group"
                    >
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
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white">
                            {item.category}
                          </span>
                          {item.isAuthorOnly && (
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-purple-600/90 text-white">
                              Yazar Özel
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 space-y-1.5">
                        <h5 className="font-bold text-xs text-foreground truncate">{item.title}</h5>
                        {item.colorPalette && item.colorPalette.length > 0 && (
                          <div className="flex items-center gap-1">
                            {item.colorPalette.slice(0, 4).map((c, cIdx) => (
                              <span key={cIdx} className="w-2.5 h-2.5 rounded-full border border-border/50 shrink-0" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.imageUrl);
                            toast.success('Görsel URL kopyalandı!');
                          }}
                          className="w-full text-[10px] py-1 rounded-lg bg-muted/20 hover:bg-muted/30 text-muted hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                        >
                          <Copy size={10} />
                          <span>URL Kopyala</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 6. SEKME: MÜZİK & YAZMA AMBİYANSI */}
            {activeTab === 'soundtracks' && (
              filteredSoundtracks.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Müzik kaydı bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {filteredSoundtracks.map((track) => {
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
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* 15. SEKME: CANON KURALLARI (BIBLE) */}
            {activeTab === 'canon_rules' && (
              filteredCanonRules.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Canon kuralı bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {filteredCanonRules.map((rule) => {
                    const isExpanded = expandedItemId === rule.id;

                    return (
                      <div
                        key={rule.id}
                        className="rounded-2xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                      >
                        <div
                          onClick={() => toggleExpand(rule.id)}
                          className="p-3 flex items-start justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                {CANON_RULE_CATEGORY_LABELS[rule.category] || rule.category}
                              </span>
                              {rule.isStrict ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 flex items-center gap-1">
                                  <ShieldAlert size={9} /> Kesin Yasa
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400">
                                  Rehber
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-foreground block truncate">{rule.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(rule.title, rule.id);
                              }}
                              className="p-1 rounded-md text-muted hover:text-foreground hover:bg-muted/20 transition-colors"
                              title="Kural Başlığını Kopyala"
                            >
                              {copiedId === rule.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                            {isExpanded ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2 text-xs">
                            <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-[11px]">
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

                            {rule.authorNotes && (
                              <div className="text-[10px] text-muted italic bg-card/60 p-2 rounded-lg">
                                <span className="font-bold not-italic text-foreground/70">Yazar Notu:</span> {rule.authorNotes}
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

            {/* 16. SEKME: AÇIK GİZEMLER & DÜĞÜMLER */}
            {activeTab === 'plot_threads' && (
              filteredPlotThreads.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Kurgu düğümü bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {filteredPlotThreads.map((thread) => {
                    const isExpanded = expandedItemId === thread.id;
                    const isAddingClue = activeThreadForClue?.id === thread.id;

                    return (
                      <div
                        key={thread.id}
                        className="rounded-2xl border border-border/50 bg-background/60 hover:border-primary/40 transition-all overflow-hidden"
                      >
                        <div
                          onClick={() => toggleExpand(thread.id)}
                          className="p-3 flex items-start justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                thread.importance === 'critical'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : thread.importance === 'major'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {PLOT_THREAD_IMPORTANCE_LABELS[thread.importance]}
                              </span>

                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                thread.status === 'resolved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : thread.status === 'clues_planted'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {PLOT_THREAD_STATUS_LABELS[thread.status]}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-foreground block truncate">{thread.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(thread.title, thread.id);
                              }}
                              className="p-1 rounded-md text-muted hover:text-foreground hover:bg-muted/20 transition-colors"
                              title="Düğüm Başlığını Kopyala"
                            >
                              {copiedId === thread.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                            {isExpanded ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2.5 text-xs">
                            <p className="text-foreground/85 leading-relaxed whitespace-pre-line text-[11px]">
                              {thread.description}
                            </p>

                            {thread.resolutionSummary && (
                              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] space-y-0.5">
                                <span className="font-bold flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Çözüm Özeti:
                                </span>
                                <p className="leading-relaxed text-emerald-200/90">{thread.resolutionSummary}</p>
                              </div>
                            )}

                            {/* İpuçları Listesi */}
                            <div className="p-2.5 rounded-xl bg-card/60 border border-border/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                                  <Lightbulb size={11} className="text-amber-400" /> İpuçları ({thread.clues?.length || 0})
                                </span>
                                <button
                                  onClick={() => setActiveThreadForClue(isAddingClue ? null : thread)}
                                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                >
                                  <Plus size={10} /> Bu Bölüme İpucu Ekle
                                </button>
                              </div>

                              {/* Hızlı İpucu Ekleme Formu */}
                              {isAddingClue && (
                                <div className="p-2 rounded-xl bg-background border border-primary/40 space-y-2">
                                  <textarea
                                    value={newClueText}
                                    onChange={(e) => setNewClueText(e.target.value)}
                                    placeholder="Bu bölümde ekilen ipucu notunu girin..."
                                    rows={2}
                                    className="w-full bg-transparent border border-border/50 rounded-lg p-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => setActiveThreadForClue(null)}
                                      className="px-2 py-1 text-[10px] rounded text-muted hover:text-foreground"
                                    >
                                      İptal
                                    </button>
                                    <button
                                      disabled={isSavingClue || !newClueText.trim()}
                                      onClick={() => handleAddClueInline(thread.id)}
                                      className="px-2.5 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground disabled:opacity-50"
                                    >
                                      {isSavingClue ? 'Ekleniyor...' : 'İpucunu Kaydet'}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {thread.clues && thread.clues.length > 0 ? (
                                <div className="space-y-1">
                                  {thread.clues.map((clue, idx) => (
                                    <div key={clue.id || idx} className="text-[10px] text-muted pl-2 border-l border-primary/30">
                                      <span className="font-semibold text-foreground/80">#{idx + 1}: </span>
                                      {clue.note}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted italic block">Henüz ipucu eklenmemiş.</span>
                              )}
                            </div>

                            {thread.authorNotes && (
                              <div className="text-[10px] text-muted italic bg-card/60 p-2 rounded-lg">
                                <span className="font-bold not-italic text-foreground/70">Yazar Notu:</span> {thread.authorNotes}
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

          {/* Alt Bilgi */}
          <div className="p-3 border-t border-border/40 bg-card text-center text-[10px] text-muted shrink-0">
            Karakter veya terim isimlerine basarak panoya kopyalayabilir, yazarken doğrudan kullanabilirsiniz.
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

      {/* ── Hızlı Varlık Ekleme Modalı ── */}
      {isQuickCreateOpen && universe && (
        <div 
          className="fixed inset-0 z-70 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsQuickCreateOpen(false)}
        >
          <div 
            className="bg-card border border-border/70 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Hızlı Evren Varlığı Ekle</h3>
                  <p className="text-[10px] text-muted">Bölüm editöründen ayrılmadan evrene ekleyin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="text-muted hover:text-foreground p-1.5 rounded-lg hover:bg-muted/15 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tip Seçimi */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/15 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setQuickCreateType('character')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  quickCreateType === 'character' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
                }`}
              >
                <Users size={13} />
                <span>Karakter</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickCreateType('location')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  quickCreateType === 'location' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
                }`}
              >
                <MapPin size={13} />
                <span>Mekân</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickCreateType('glossary')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  quickCreateType === 'glossary' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
                }`}
              >
                <BookA size={13} />
                <span>Sözlük</span>
              </button>
            </div>

            {/* Form Alanları */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  {quickCreateType === 'character' ? 'Karakter Adı' : quickCreateType === 'location' ? 'Mekân Adı' : 'Terim Adı'} *
                </label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder={quickCreateType === 'character' ? 'Örn: Leyla Arslan' : quickCreateType === 'location' ? 'Örn: Zümrüt Kulesi' : 'Örn: Aether'}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              {quickCreateType === 'character' && (
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">Rol</label>
                  <select
                    value={quickRoleOrType || 'supporting'}
                    onChange={(e) => setQuickRoleOrType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="protagonist">Ana Karakter</option>
                    <option value="antagonist">Karşıt Karakter</option>
                    <option value="supporting">Yan Karakter</option>
                    <option value="minor">Figüran / Önemsiz</option>
                  </select>
                </div>
              )}

              {quickCreateType === 'location' && (
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">Mekân Türü</label>
                  <select
                    value={quickRoleOrType || 'city'}
                    onChange={(e) => setQuickRoleOrType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="city">Şehir / Yerleşim</option>
                    <option value="building">Bina / Yapı</option>
                    <option value="wilderness">Yaban / Doğa</option>
                    <option value="dungeon">Zindan / Mağara</option>
                    <option value="country">Ülke / Krallık</option>
                    <option value="continent">Kıta</option>
                    <option value="planet">Gezegen / Diyar</option>
                  </select>
                </div>
              )}

              {quickCreateType === 'glossary' && (
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">Kategori / Alan</label>
                  <input
                    type="text"
                    value={quickRoleOrType}
                    onChange={(e) => setQuickRoleOrType(e.target.value)}
                    placeholder="Örn: Büyü / Teknoloji / Argo"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  {quickCreateType === 'character' ? 'Meslek / Kısa Not' : quickCreateType === 'location' ? 'Açıklama / Atmosfer' : 'Anlamı / Tanım'}
                </label>
                <textarea
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  rows={2}
                  placeholder={quickCreateType === 'character' ? 'Örn: Başbüyücü, hırslı ve ketum' : quickCreateType === 'location' ? 'Örn: Sisler içinde kadim bir kütüphane kulesi' : 'Örn: Saf büyü enerjisi kaynağı'}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-foreground transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={!quickName.trim() || isCreatingQuick}
                onClick={handleQuickCreate}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
              >
                {isCreatingQuick && <Loader2 size={13} className="animate-spin" />}
                <span>{isCreatingQuick ? 'Ekleniyor...' : 'Evrene Ekle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
