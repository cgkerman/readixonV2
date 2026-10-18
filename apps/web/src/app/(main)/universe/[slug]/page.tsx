'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  getUniverseBySlug, 
  updateUniverse,
  getStoryById, 
  getSeriesById,
  getUniverseLocations,
  getUniverseTimelineEvents,
  getUniverseGlossary,
  getUniverseLoreList,
  getUniverseCharacters,
  getUniverseMaps,
  getUniverseOrganizations,
  getUniverseItems,
  getUniversePowerSystems,
  getUniverseRaces,
  getUniverseCreatures,
  getUniverseCultures,
  getUniverseMedia,
  getUniverseSoundtracks,
  getUniverseCanonRules,
  getUniversePlotThreads,
  LOCATION_TYPE_LABELS,
  CANON_RULE_CATEGORY_LABELS,
  PLOT_THREAD_STATUS_LABELS,
  PLOT_THREAD_IMPORTANCE_LABELS,
  parseAudioTrack,
  getAudioPlatformLabel,
  generateStorySlug,
  generateSeriesSlug,
  getUserReadingProgress,
  useAuthStore,
  type Universe, 
  type Story, 
  type Series,
  type UniverseLocation,
  type UniverseTimelineEvent,
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
  type UniverseCanonRule,
  type CanonRuleCategory,
  type UniversePlotThread,
  type PlotThreadStatus,
  type Character,
  UNIVERSE_MEMBER_ROLE_CONFIG
} from '@readixon/core';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Globe, 
  BookOpen, 
  Layers, 
  Users, 
  MapPin, 
  Clock, 
  BookA, 
  Scroll, 
  ChevronRight, 
  ArrowLeft, 
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
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
  Disc,
  ExternalLink,
  X,
  Scale,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Search,
  Filter
} from 'lucide-react';
import { InteractiveWorldMap } from '@/components/InteractiveWorldMap';
import { InteractiveRelationshipGraph } from '@/components/InteractiveRelationshipGraph';
import { Character3DCard } from '@/components/Character3DCard';
import { CharacterReaderModal } from '@/components/CharacterReaderModal';
import { SocialShareModal, type SocialCardType } from '@/components/SocialShareModal';
import { UniverseSearchDrawer, type UniverseSearchResultItem } from '@/components/UniverseSearchDrawer';

type ReaderUniverseTab = 'works' | 'characters' | 'relationships' | 'races' | 'creatures' | 'cultures' | 'locations' | 'maps' | 'organizations' | 'items' | 'powers' | 'timeline' | 'glossary' | 'lore' | 'media' | 'soundtracks' | 'canon_rules' | 'plot_threads' | 'credits';

const MEDIA_CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  character: { label: 'Karakter & Portre', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  location: { label: 'Mekân & Çevre', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  architecture: { label: 'Mimari & Yapı', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  costume: { label: 'Kostüm & Moda', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  atmosphere: { label: 'Ambiyans & Mood', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  color_palette: { label: 'Renk Paleti', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  item: { label: 'Eşya & Teçhizat', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  other: { label: 'Diğer Konsept', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const SOUNDTRACK_THEME_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  main_theme: { label: 'Ana Tema', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  location: { label: 'Mekân & Bölge', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  battle: { label: 'Savaş & Aksiyon', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  character: { label: 'Karakter Teması', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  emotional: { label: 'Duygusal / Dramatik', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ambient: { label: 'Ambiyans / Doğa', color: 'text-teal-400', bg: 'bg-teal-500/10' },
};

const CREATURE_DANGER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  harmless: { label: 'Zararsız', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  low: { label: 'Düşük Tehdit', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  medium: { label: 'Orta Tehdit', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  high: { label: 'Yüksek Tehlike', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  deadly: { label: 'Ölümcül', color: 'text-rose-500', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  calamity: { label: 'Afet / Felaket', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40' },
};

const CREATURE_TYPE_LABELS: Record<string, string> = {
  monster: 'Canavar',
  mythological: 'Mitolojik Varlık',
  beast: 'Doğal Yırtıcı / Hayvan',
  artificial: 'Yapay / Golem / Büyülü',
  alien: 'Dünya Dışı / Yabancı',
  spiritual: 'Ruhani / Astral',
};

const CULTURE_CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  culture: { label: 'Kültür & Gelenek', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  religion: { label: 'İnanç & Mitoloji', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  politics: { label: 'Siyaset & Yönetim', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  economy: { label: 'Ekonomi & Ticaret', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function PublicUniversePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { firebaseUser, userProfile } = useAuthStore();

  const [universe, setUniverse] = useState<Universe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReaderUniverseTab>('works');

  // Bağlı içerikler
  const [stories, setStories] = useState<Story[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [userMaxChapter, setUserMaxChapter] = useState<number>(0);
  const [isAuthorPreview, setIsAuthorPreview] = useState<boolean>(false);
  const [characterRoleFilter, setCharacterRoleFilter] = useState<string>('all');
  const [characterSearch, setCharacterSearch] = useState<string>('');
  const [selectedCharacterIdForModal, setSelectedCharacterIdForModal] = useState<string | null>(null);

  // Sosyal Paylaşım Vitrini Modalı (PRD Bölüm 55 & 57)
  const [showSocialShareModal, setShowSocialShareModal] = useState<boolean>(false);
  const [socialShareCardType, setSocialShareCardType] = useState<SocialCardType>('universe');
  const [socialShareCharacter, setSocialShareCharacter] = useState<Character | null>(null);

  // Global Evren Arama Çekmecesi (PRD Bölüm 50 & 51)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSelectSearchResult = (item: UniverseSearchResultItem) => {
    if (item.targetTab) {
      setActiveTab(item.targetTab as ReaderUniverseTab);
    }
    if (item.category === 'character' && item.payload) {
      const char = item.payload as Character;
      const isUnlocked = isAuthorPreview || !char.isSpoiler || (char.spoilerThresholdChapter || 0) <= userMaxChapter;
      if (isUnlocked) {
        setSelectedCharacterIdForModal(char.id);
      }
    }
  };

  const [locations, setLocations] = useState<UniverseLocation[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<UniverseTimelineEvent[]>([]);
  const [glossary, setGlossary] = useState<UniverseGlossaryTerm[]>([]);
  const [lore, setLore] = useState<UniverseLore[]>([]);
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
  const [selectedMediaCategory, setSelectedMediaCategory] = useState<string>('all');
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<UniverseMedia | null>(null);
  const [canonRules, setCanonRules] = useState<UniverseCanonRule[]>([]);
  const [plotThreads, setPlotThreads] = useState<UniversePlotThread[]>([]);
  const [selectedCanonCategory, setSelectedCanonCategory] = useState<string>('all');
  const [selectedThreadStatus, setSelectedThreadStatus] = useState<string>('all');

  useEffect(() => {
    if (!slug) return;
    loadUniverse();

    // Sekmeler arası geçiş yapıldığında en güncel evren verilerini ve grafiği arka planda tazele
    const handleFocus = () => {
      getUniverseBySlug(slug).then((u) => {
        if (u) {
          setUniverse(u);
        }
      }).catch(console.error);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [slug]);

  const loadUniverse = async () => {
    setLoading(true);
    try {
      const u = await getUniverseBySlug(slug);
      if (!u) {
        setLoading(false);
        return;
      }
      setUniverse(u);

      const uId = u.universeId;

      // Eserleri ve modül verilerini paralel çek
      const [
        storyProms, 
        serProms, 
        chars, 
        locs, 
        events, 
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
        Promise.all((u.connectedStoryIds || []).map((id) => getStoryById(id))),
        Promise.all((u.connectedSeriesIds || []).map((id) => getSeriesById(id))),
        getUniverseCharacters(uId),
        getUniverseLocations(uId),
        getUniverseTimelineEvents(uId),
        getUniverseGlossary(uId),
        getUniverseLoreList(uId),
        getUniverseMaps(uId),
        getUniverseOrganizations(uId),
        getUniverseItems(uId),
        getUniversePowerSystems(uId),
        getUniverseRaces(uId),
        getUniverseCreatures(uId),
        getUniverseCultures(uId),
        getUniverseMedia(uId),
        getUniverseSoundtracks(uId),
        getUniverseCanonRules(uId),
        getUniversePlotThreads(uId),
      ]);

      setStories(storyProms.filter(Boolean) as Story[]);
      setSeriesList(serProms.filter(Boolean) as Series[]);
      setAllCharacters(chars);
      // Geriye dönük uyumluluk ve diğer sekmeler için (örn: İlişki haritası)
      setCharacters(chars.filter((c) => !c.isSpoiler));
      setLocations(locs.filter((l) => !l.isSpoiler));
      setTimelineEvents(events.filter((e) => !e.isSpoiler));
      setGlossary(terms.filter((t) => !t.isSpoiler));
      setLore(lores.filter((lr) => !lr.isSpoiler));
      setOrganizations(orgs.filter((o) => !o.isSpoiler));
      setItems(itemsList.filter((i) => !i.isSpoiler));
      setPowerSystems(powers);
      setRaces(raceList.filter((r) => !r.isSpoiler));
      setCreatures(creatureList.filter((c) => !c.isSpoiler));
      setCultures(cultureList.filter((cu) => !cu.isSpoiler));
      setMediaList(mediaData.filter((m) => !m.isAuthorOnly && !m.isSpoiler));
      setSoundtracks(trackData.filter((s) => !s.isSpoiler));
      setCanonRules(canonData.filter((r) => r.isPublic !== false && !r.isSpoiler));
      setPlotThreads(threadData.filter((t) => t.isPublic === true && !t.isSpoiler));
      const publicMaps = mapList.filter((m) => !m.isSpoiler);
      setMaps(publicMaps);
      if (publicMaps.length > 0) {
        setSelectedMapId(publicMaps[0].id);
      }

      // Okuyucu ilerlemesini kontrol et (PRD Bölüm 37 & 38)
      if (firebaseUser) {
        try {
          const progresses = await getUserReadingProgress(firebaseUser.uid);
          const connectedStoryIds = u.connectedStoryIds || [];
          let highestChapter = 0;
          for (const prog of progresses) {
            if (connectedStoryIds.includes(prog.storyId)) {
              if (prog.completedChapters && prog.completedChapters.length > highestChapter) {
                highestChapter = Math.max(highestChapter, prog.completedChapters.length);
              }
            }
          }
          setUserMaxChapter(highestChapter);
        } catch (e) {
          console.error('Okuma ilerlemesi alınamadı:', e);
        }
      }
    } catch (error) {
      console.error('Evren yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAuthor = Boolean(
    firebaseUser &&
    (universe?.authorId === firebaseUser.uid ||
      universe?.collaboratorIds?.includes(firebaseUser.uid) ||
      userProfile?.isAdmin)
  );

  const handleSaveGraphLayout = async (positions: Record<string, { x: number; y: number }>) => {
    if (!universe) return;
    try {
      await updateUniverse(universe.universeId, { characterGraphLayout: positions });
      setUniverse((prev) => (prev ? { ...prev, characterGraphLayout: positions } : prev));
      toast.success('İlişki ağı yerleşimi kaydedildi!');
    } catch (err) {
      console.error('İlişki ağı yerleşimi kaydedilemedi:', err);
      toast.error('İlişki ağı yerleşimi kaydedilemedi.');
      throw err;
    }
  };

  // Karakter filtresi & spoiler durumları (PRD Bölüm 38)
  const processedCharacters = React.useMemo(() => {
    return allCharacters.map((c) => {
      const threshold = c.spoilerThresholdChapter;
      const hasThreshold = threshold !== undefined && threshold > 0;
      
      let isUnlocked = true;
      let isDiscovered = false;

      if (isAuthorPreview) {
        isUnlocked = true;
        isDiscovered = Boolean(c.isSpoiler);
      } else if (c.isSpoiler) {
        if (hasThreshold && userMaxChapter >= threshold) {
          isUnlocked = true;
          isDiscovered = true;
        } else {
          isUnlocked = false;
          isDiscovered = false;
        }
      }

      return {
        character: c,
        isUnlocked,
        isDiscovered,
        threshold,
      };
    });
  }, [allCharacters, isAuthorPreview, userMaxChapter]);

  // Rol eşleştirme yardımcısı (büyük/küçük harf ve eşanlamlı destekli)
  const isRoleMatch = React.useCallback((charRole?: string, filterKey?: string) => {
    if (!filterKey || filterKey === 'all') return true;
    const c = (charRole || '').toLowerCase().trim();
    const f = filterKey.toLowerCase().trim();
    if (f === 'protagonist') return ['protagonist', 'baş kahraman', 'ana karakter', 'baskahraman'].includes(c);
    if (f === 'antagonist') return ['antagonist', 'düşman', 'kötü karakter'].includes(c);
    if (f === 'deuteragonist') return ['deuteragonist', 'ikincil', 'ikincil kahraman'].includes(c);
    if (f === 'mentor') return ['mentor', 'usta', 'rehber'].includes(c);
    if (f === 'love interest' || f === 'love_interest') return ['love interest', 'love_interest', 'aşk ilgisi', 'ask ilgisi'].includes(c);
    if (f === 'side character' || f === 'supporting') return ['side character', 'supporting', 'yan karakter', 'side', 'destekleyici'].includes(c);
    return c === f;
  }, []);

  // Rol bazlı canlı karakter sayıları
  const roleCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: processedCharacters.length,
      Protagonist: 0,
      Antagonist: 0,
      Deuteragonist: 0,
      Mentor: 0,
      'Love Interest': 0,
      'Side Character': 0,
    };
    processedCharacters.forEach(({ character }) => {
      const c = (character.role || '').toLowerCase().trim();
      if (['protagonist', 'baş kahraman', 'ana karakter', 'baskahraman'].includes(c)) counts.Protagonist++;
      else if (['antagonist', 'düşman', 'kötü karakter'].includes(c)) counts.Antagonist++;
      else if (['deuteragonist', 'ikincil', 'ikincil kahraman'].includes(c)) counts.Deuteragonist++;
      else if (['mentor', 'usta', 'rehber'].includes(c)) counts.Mentor++;
      else if (['love interest', 'love_interest', 'aşk ilgisi', 'ask ilgisi'].includes(c)) counts['Love Interest']++;
      else counts['Side Character']++;
    });
    return counts;
  }, [processedCharacters]);

  // Filtrelenmiş karakterler
  const filteredCharacters = React.useMemo(() => {
    return processedCharacters.filter(({ character }) => {
      if (!isRoleMatch(character.role, characterRoleFilter)) {
        return false;
      }
      if (characterSearch.trim()) {
        const q = characterSearch.toLowerCase();
        const matchesName = character.name.toLowerCase().includes(q);
        const matchesOcc = character.occupation?.toLowerCase().includes(q);
        const matchesRole = character.role?.toLowerCase().includes(q);
        if (!matchesName && !matchesOcc && !matchesRole) return false;
      }
      return true;
    });
  }, [processedCharacters, characterRoleFilter, characterSearch, isRoleMatch]);

  const discoveredCount = processedCharacters.filter((p) => p.isUnlocked).length;
  const totalCharacterCount = processedCharacters.length;

  const selectedCharacterForModal = React.useMemo(() => {
    if (!selectedCharacterIdForModal) return null;
    return allCharacters.find((c) => c.id === selectedCharacterIdForModal) || null;
  }, [allCharacters, selectedCharacterIdForModal]);

  const totalLoreCount = React.useMemo(() => {
    return (
      races.length +
      creatures.length +
      organizations.length +
      cultures.length +
      items.length +
      powerSystems.length +
      canonRules.length +
      lore.length
    );
  }, [races, creatures, organizations, cultures, items, powerSystems, canonRules, lore]);

  const currentMainTab = React.useMemo<'works' | 'characters' | 'world' | 'lore' | 'media' | 'credits'>(() => {
    if (['characters', 'relationships', 'races', 'creatures', 'organizations'].includes(activeTab)) {
      return 'characters';
    }
    if (['locations', 'maps', 'cultures'].includes(activeTab)) {
      return 'world';
    }
    if (['lore', 'timeline', 'glossary', 'powers', 'items', 'canon_rules', 'plot_threads'].includes(activeTab)) {
      return 'lore';
    }
    if (['media', 'soundtracks'].includes(activeTab)) {
      return 'media';
    }
    if (activeTab === 'credits') {
      return 'credits';
    }
    return 'works';
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <Typography variant="body" className="text-muted text-sm">Evren haritası ve kayıtları yükleniyor...</Typography>
      </div>
    );
  }

  if (!universe) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <Sparkles size={40} className="text-muted/40 mb-3" />
        <Typography variant="h2" className="text-xl font-bold mb-2">Evren Bulunamadı</Typography>
        <Typography variant="body" className="text-muted text-sm mb-6">
          Aradığınız kurgusal evren mevcut değil veya yayından kaldırılmış olabilir.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/feed')} className="rounded-xl text-xs font-bold">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  // Taslak / Gizli Evren Erişim Koruması: Yazar veya ekip üyesi değilse erişimi engelle
  const isDraftOrPrivate = universe.visibility === 'draft' || universe.visibility === 'private';
  if (isDraftOrPrivate && !isAuthor) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
          <Lock size={28} />
        </div>
        <Typography variant="h2" className="text-xl font-black mb-2 text-foreground">
          Bu Evren Taslak Aşamasında
        </Typography>
        <Typography variant="body" className="text-muted text-xs sm:text-sm mb-6 leading-relaxed">
          Yazar bu evreni henüz okurlara açmadı veya taslak olarak düzenliyor. Yalnızca evren sahibi ve izinli ekip üyeleri bu sayfayı görüntüleyebilir.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/feed')} className="rounded-xl text-xs font-bold px-5">
          Keşfete Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      {/* ── Taslak / Liste Dışı Yazar Önizleme Bildirimi ── */}
      {universe.visibility === 'draft' && isAuthor && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-400 font-semibold flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <EyeOff size={16} className="shrink-0 text-amber-400" />
            <span className="truncate">
              <strong>Taslak Önizleme Modu:</strong> Bu evren şu anda <em>Taslak</em> durumundadır ve yalnızca siz/ekibiniz görebilir. Okurlar bu sayfayı görüntüleyemez.
            </span>
          </div>
          <Link href={`/studio/universes/${universe.universeId}`}>
            <Button variant="outline" className="text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/20 py-1 px-3 font-bold shrink-0">
              Stüdyoda Yayına Al
            </Button>
          </Link>
        </div>
      )}

      {universe.visibility === 'unlisted' && isAuthor && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2 text-xs text-cyan-400 font-semibold flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Lock size={15} className="shrink-0 text-cyan-400" />
            <span className="truncate">
              <strong>Liste Dışı Evren:</strong> Bu evren keşfet atlasında listelenmez, yalnızca doğrudan bu linke sahip okurlar görüntüleyebilir.
            </span>
          </div>
          <Link href={`/studio/universes/${universe.universeId}`}>
            <Button variant="ghost" className="text-xs text-cyan-400 hover:text-cyan-300 underline py-1 px-2 h-auto shrink-0">
              Stüdyoya Dön
            </Button>
          </Link>
        </div>
      )}

      {/* ── 1. Hero Afiş Alanı ── */}
      <div className="relative w-full overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/15 via-card/50 to-background pt-6 pb-10 sm:pb-14">
        {/* Arka plan bulanık evren kapağı (Ambient Glow) */}
        {universe.coverImage && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-125 filter blur-3xl opacity-20 dark:opacity-30"
              style={{ backgroundImage: `url(${universe.coverImage})` }}
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Üst Bar: Geri Dön & Arama & Paylaşım Vitrini */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Geri Dön</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Global Arama Butonu (PRD Bölüm 50 & 51) */}
              <button
                type="button"
                onClick={() => setIsGlobalSearchOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card/80 hover:bg-card border border-border/60 hover:border-primary/50 text-xs text-muted hover:text-foreground transition-all shadow-xs group cursor-pointer backdrop-blur-md"
              >
                <Search size={14} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="font-semibold hidden sm:inline">Evrende Ara...</span>
                <span className="font-semibold sm:hidden">Ara</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background border border-border/60 text-[10px] font-mono text-muted">
                  ⌘K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSocialShareCardType('universe');
                  setSocialShareCharacter(characters.length > 0 ? characters[0] : null);
                  setShowSocialShareModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold transition-all shadow-xs hover:shadow-primary/10 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Share2 size={14} />
                <span>📢 Paylaş & Afiş Üret</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
            {/* Evren Kapağı */}
            <div className="w-36 sm:w-48 aspect-[3/4] rounded-2xl bg-card border border-border/60 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0 relative flex items-center justify-center group">
              {universe.coverImage ? (
                <img 
                  src={universe.coverImage} 
                  alt={universe.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              ) : (
                <div className="p-4 text-center text-primary/40">
                  <Globe size={44} strokeWidth={1.5} className="mx-auto mb-2" />
                  <span className="text-xs font-bold block">{universe.title}</span>
                </div>
              )}
            </div>

            {/* Evren Bilgileri */}
            <div className="flex-1 min-w-0 w-full">
              {/* Tür & Kurgusal Evren Rozetleri */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary tracking-wider">
                  Hikâye Evreni
                </span>
                {universe.genre && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-card/80 border border-border/60 text-muted backdrop-blur-md">
                    {universe.genre}
                  </span>
                )}
              </div>

              {/* Başlık */}
              <Typography variant="h1" className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-2.5 leading-tight tracking-tight">
                {universe.title}
              </Typography>

              {/* Evren Mimarı Çipi & Katkıda Bulunanlar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-3.5">
                {universe.authorName && (
                  <Link
                    href={universe.authorUsername ? `/profile/@${universe.authorUsername}` : '#'}
                    className="inline-flex items-center gap-2 p-1 pr-3 rounded-full bg-card/70 hover:bg-card border border-border/60 hover:border-primary/40 backdrop-blur-md transition-all group shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden shrink-0">
                      {universe.authorAvatarUrl ? (
                        <img src={universe.authorAvatarUrl} alt={universe.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{universe.authorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-muted">Mimar:</span>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {universe.authorName}
                      </span>
                    </div>
                  </Link>
                )}
                {universe.members && universe.members.length > 0 && (
                  <button
                    onClick={() => setActiveTab('credits')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/25 text-xs font-semibold text-indigo-400 transition-colors cursor-pointer"
                  >
                    <Users size={12} />
                    <span>+{universe.members.length} Katkıda Bulunan</span>
                  </button>
                )}
              </div>

              {/* Evren Açıklaması */}
              <Typography variant="body" className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl mb-5 whitespace-pre-line">
                {universe.description || 'Bu evrenin kuralları ve dünyası hakkında özet.'}
              </Typography>

              {/* ── Akıllı İstatistik & Hızlı Atlama Barı (Smart Metric Dock) ── */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('works')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer group ${
                    activeTab === 'works'
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-card/70 hover:bg-card border-border/60 text-foreground'
                  }`}
                >
                  <BookOpen size={14} className="text-primary group-hover:scale-110 transition-transform" />
                  <span>{stories.length} Eser</span>
                  {seriesList.length > 0 && (
                    <span className="text-[10px] text-muted font-normal">({seriesList.length} Seri)</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('characters')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer group ${
                    activeTab === 'characters'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-card/70 hover:bg-card border-border/60 text-foreground'
                  }`}
                >
                  <Users size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>{allCharacters.length} Karakter</span>
                </button>

                {(locations.length > 0 || maps.length > 0) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(maps.length > 0 ? 'maps' : 'locations')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer group ${
                      activeTab === 'locations' || activeTab === 'maps'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-card/70 hover:bg-card border-border/60 text-foreground'
                    }`}
                  >
                    <MapPin size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span>{locations.length} Mekân</span>
                    {maps.length > 0 && (
                      <span className="text-[10px] text-muted font-normal">• {maps.length} Harita</span>
                    )}
                  </button>
                )}

                {totalLoreCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('lore')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer group ${
                      activeTab === 'lore'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                        : 'bg-card/70 hover:bg-card border-border/60 text-foreground'
                    }`}
                  >
                    <Sparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>{totalLoreCount} Lore Kaydı</span>
                  </button>
                )}
              </div>

              {/* ── Okur Odaklı Ana Aksiyonlar (Action Row) ── */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                {stories.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const firstStorySlug = (stories[0] as any).slug || generateStorySlug(stories[0].title, stories[0].storyId);
                      router.push(`/story/${firstStorySlug}`);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <BookOpen size={16} />
                    <span>{stories.length === 1 ? 'Kitabı Oku' : 'İlk Eseri Oku'} ({stories[0].title})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('characters')}
                    className="px-5 py-2.5 rounded-xl bg-primary text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Users size={16} />
                    <span>Karakterleri İncele</span>
                  </button>
                )}

                {allCharacters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('characters')}
                    className="px-4 py-2.5 rounded-xl bg-card/80 hover:bg-card border border-border/60 hover:border-primary/40 text-foreground font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Users size={15} className="text-primary" />
                    <span>Karakter Atlası</span>
                  </button>
                )}

                {userMaxChapter > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSocialShareCardType('discovery');
                      setShowSocialShareModal(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>Keşif Kartı (#{userMaxChapter})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Ana Sekmeler (Segmented Bar - Sıfır Kaydırma Çubuğu, Minimal & Modern) ── */}
      <div id="universe-tabs-bar" className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-y border-border/40 py-2.5 px-4 mb-6 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-card/70 border border-border/60 backdrop-blur-xl shadow-xs flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            {/* 1. Eserler */}
            <button
              type="button"
              onClick={() => setActiveTab('works')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentMainTab === 'works'
                  ? 'bg-primary text-black shadow-md font-extrabold'
                  : 'text-muted hover:text-foreground hover:bg-card/70'
              }`}
            >
              <BookOpen size={15} />
              <span>Eserler ({stories.length})</span>
            </button>

            {/* 2. Karakterler & Topluluk */}
            <button
              type="button"
              onClick={() => setActiveTab('characters')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentMainTab === 'characters'
                  ? 'bg-primary text-black shadow-md font-extrabold'
                  : 'text-muted hover:text-foreground hover:bg-card/70'
              }`}
            >
              <Users size={15} />
              <span>Karakterler ({allCharacters.length})</span>
            </button>

            {/* 3. Dünya & Coğrafya */}
            {(locations.length > 0 || maps.length > 0 || cultures.length > 0) && (
              <button
                type="button"
                onClick={() => setActiveTab(maps.length > 0 ? 'maps' : locations.length > 0 ? 'locations' : 'cultures')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentMainTab === 'world'
                    ? 'bg-primary text-black shadow-md font-extrabold'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                <MapPin size={15} />
                <span>Dünya & Harita</span>
              </button>
            )}

            {/* 4. Lore & Ansiklopedi */}
            {totalLoreCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  const firstLoreTab: ReaderUniverseTab =
                    lore.length > 0
                      ? 'lore'
                      : timelineEvents.length > 0
                      ? 'timeline'
                      : glossary.length > 0
                      ? 'glossary'
                      : powerSystems.length > 0
                      ? 'powers'
                      : items.length > 0
                      ? 'items'
                      : canonRules.length > 0
                      ? 'canon_rules'
                      : 'plot_threads';
                  setActiveTab(firstLoreTab);
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentMainTab === 'lore'
                    ? 'bg-primary text-black shadow-md font-extrabold'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                <Scroll size={15} />
                <span>Lore & Ansiklopedi</span>
              </button>
            )}

            {/* 5. Galeri & Medya (Varsa) */}
            {(mediaList.length > 0 || soundtracks.length > 0) && (
              <button
                type="button"
                onClick={() => setActiveTab(mediaList.length > 0 ? 'media' : 'soundtracks')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentMainTab === 'media'
                    ? 'bg-primary text-black shadow-md font-extrabold'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                <ImageIcon size={15} />
                <span>Galeri & Medya</span>
              </button>
            )}

            {/* 6. Ekip (Varsa) */}
            {universe.members && universe.members.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('credits')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentMainTab === 'credits'
                    ? 'bg-primary text-black shadow-md font-extrabold'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                <Crown size={15} />
                <span>Ekip</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. İçerik Alanı & İkincil Alt Modül Çubuğu (Sub-Navigation) ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Karakterler Alt Menüsü */}
        {currentMainTab === 'characters' && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-card/50 border border-border/50 backdrop-blur-md flex-wrap items-center justify-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('characters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'characters'
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                👥 Karakterler ({allCharacters.length})
              </button>
              {characters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('relationships')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'relationships'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🕸️ İlişki Ağı
                </button>
              )}
              {races.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('races')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'races'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🧬 Irklar & Türler ({races.length})
                </button>
              )}
              {creatures.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('creatures')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'creatures'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  💀 Yaratıklar ({creatures.length})
                </button>
              )}
              {organizations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('organizations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'organizations'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🏛️ Örgütler ({organizations.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Coğrafya Alt Menüsü */}
        {currentMainTab === 'world' && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-card/50 border border-border/50 backdrop-blur-md flex-wrap items-center justify-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('locations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'locations'
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                📍 Mekânlar ({locations.length})
              </button>
              {maps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('maps')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'maps'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🗺️ İnteraktif Harita ({maps.length})
                </button>
              )}
              {cultures.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('cultures')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'cultures'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🏛️ Kültür & Düzen ({cultures.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lore Alt Menüsü */}
        {currentMainTab === 'lore' && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-card/50 border border-border/50 backdrop-blur-md flex-wrap items-center justify-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('lore')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'lore'
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                    : 'text-muted hover:text-foreground hover:bg-card/70'
                }`}
              >
                📜 Efsaneler & Mitler ({lore.length})
              </button>
              {timelineEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  ⏳ Zaman Çizelgesi ({timelineEvents.length})
                </button>
              )}
              {glossary.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('glossary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'glossary'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  📖 Sözlük ({glossary.length})
                </button>
              )}
              {powerSystems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('powers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'powers'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  ⚡ Güç Sistemleri ({powerSystems.length})
                </button>
              )}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('items')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'items'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🗡️ Eşyalar ({items.length})
                </button>
              )}
              {canonRules.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('canon_rules')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'canon_rules'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  ⚖️ Canon Kuralları ({canonRules.length})
                </button>
              )}
              {plotThreads.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('plot_threads')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'plot_threads'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🔍 Açık Gizemler ({plotThreads.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Galeri & Medya Alt Menüsü */}
        {currentMainTab === 'media' && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-card/50 border border-border/50 backdrop-blur-md flex-wrap items-center justify-center gap-1 shadow-xs">
              {mediaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'media'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🖼️ Görseller ({mediaList.length})
                </button>
              )}
              {soundtracks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('soundtracks')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'soundtracks'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-card/70'
                  }`}
                >
                  🎵 Müzikler ({soundtracks.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── ESERLER & SERİLER ── */}
        {activeTab === 'works' && (
          <div className="space-y-8">
            {/* Seriler */}
            {seriesList.length > 0 && (
              <div>
                <Typography variant="h2" className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-amber-500" />
                  <span>Bu Evrende Geçen Seriler</span>
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {seriesList.map((ser) => {
                    const seriesSlug = ser.slug || generateSeriesSlug(ser.title, ser.seriesId);
                    return (
                      <div
                        key={ser.seriesId}
                        onClick={() => router.push(`/series/${seriesSlug}`)}
                        className="p-4 rounded-2xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-16 rounded-xl bg-background border border-border/60 overflow-hidden shrink-0">
                            {ser.coverImage ? (
                              <img src={ser.coverImage} alt={ser.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted">
                                <Layers size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors block truncate">
                              {ser.title}
                            </span>
                            <span className="text-xs text-muted block mt-0.5">
                              {ser.books?.length || 0} Kitaplık Seri
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Eserler (Kitaplar & Webtoonlar) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h2" className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <span>Bu Evrende Geçen Eserler ({stories.length})</span>
                </Typography>
              </div>

              {stories.length === 0 ? (
                <div className="p-8 text-center bg-card/40 border border-border/50 rounded-2xl text-muted text-xs">
                  Bu evrene henüz bir kitap bağlanmamış.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stories.map((st) => {
                    const storySlug = (st as any).slug || generateStorySlug(st.title, st.storyId);
                    return (
                      <div
                        key={st.storyId}
                        onClick={() => router.push(`/story/${storySlug}`)}
                        className="p-4 rounded-2xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all cursor-pointer flex gap-4 group shadow-xs hover:shadow-md"
                      >
                        {/* Kapak */}
                        <div className="w-16 sm:w-20 aspect-[2/3] rounded-xl bg-background border border-border/60 overflow-hidden shrink-0 shadow-sm relative">
                          {st.coverImage ? (
                            <img 
                              src={st.coverImage} 
                              alt={st.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>

                        {/* Bilgiler */}
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {st.format === 'webtoon' ? 'Webtoon' : 'Roman'}
                              </span>
                              <span className="text-[10px] text-muted font-medium">
                                {st.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                              </span>
                            </div>
                            <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors block truncate">
                              {st.title}
                            </span>
                            {st.summary && (
                              <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                                {st.summary}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-border/40 mt-2 text-xs">
                            <span className="text-muted text-[11px] font-medium">
                              {st.stats?.chapterCount || 0} Bölüm
                            </span>
                            <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs">
                              <span>İncele & Oku</span>
                              <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── KARAKTERLER (PRD BÖLÜM 10, 38, 42) ── */}
        {activeTab === 'characters' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Üst Keşif & Spoiler Kontrol Paneli */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-card/90 via-card/70 to-card/90 border border-border/60 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Karakter Defteri 2.0
                    </span>
                    {userMaxChapter > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        📚 Okunan: Bölüm #{userMaxChapter}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    Evren Karakterleri & Biyografi Vitrini
                  </h3>
                  <p className="text-xs text-muted mt-0.5 max-w-xl leading-relaxed">
                    Şeffaf PNG 3D derinlik vitrini ile karakterlerin psikolojik profillerini, 8 aşamalı ark eğrilerini ve gizli sırlarını keşfedin.
                  </p>
                </div>

                {/* Yazar / Editör Görünüm Toggle'ı */}
                {isAuthor && (
                  <button
                    type="button"
                    onClick={() => setIsAuthorPreview(!isAuthorPreview)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 ${
                      isAuthorPreview
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-500/20'
                        : 'bg-card border-border/60 text-muted hover:text-foreground'
                    }`}
                  >
                    {isAuthorPreview ? (
                      <>
                        <Eye size={14} className="text-purple-400" />
                        <span>Yazar Önizlemesi (Tüm Sırlar Açık)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        <span>Okuyucu Modu (Spoiler Korumalı)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Keşif İlerleme Çubuğu (PRD Bölüm 38) */}
              {totalCharacterCount > 0 && (
                <div className="pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                    <span className="flex items-center gap-1.5 text-foreground text-xs">
                      <Sparkles size={13} className="text-amber-400" />
                      Keşfedilen Karakterler
                    </span>
                    <span className="text-muted text-[11px]">
                      <strong className="text-primary font-black">{discoveredCount}</strong> / {totalCharacterCount} Açıldı
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-background/80 border border-border/40 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-emerald-400 to-amber-400 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round((discoveredCount / totalCharacterCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Arama & Rol Filtreleme Barı (Sıfır Kaydırma, Modern & Minimal) */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-6">
              {/* Rol Filtre Hapları */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {[
                  { key: 'all', label: 'Tümü', count: roleCounts.all },
                  { key: 'Protagonist', label: 'Baş Kahraman', count: roleCounts.Protagonist },
                  { key: 'Antagonist', label: 'Antagonist', count: roleCounts.Antagonist },
                  { key: 'Deuteragonist', label: 'İkincil', count: roleCounts.Deuteragonist },
                  { key: 'Mentor', label: 'Mentor', count: roleCounts.Mentor },
                  { key: 'Love Interest', label: 'Aşk İlgisi', count: roleCounts['Love Interest'] },
                  { key: 'Side Character', label: 'Yan Karakter', count: roleCounts['Side Character'] },
                ].map((role) => {
                  const isActive = characterRoleFilter === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setCharacterRoleFilter(role.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-2xs ${
                        isActive
                          ? 'bg-primary text-black shadow-xs font-black'
                          : 'bg-card hover:bg-muted/20 border border-border/70 text-foreground/80 hover:text-foreground'
                      }`}
                    >
                      <span>{role.label}</span>
                      {role.count !== undefined && role.count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                            isActive
                              ? 'bg-black/20 text-black'
                              : 'bg-muted/40 text-foreground/80'
                          }`}
                        >
                          {role.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Arama Kutusu */}
              <div className="relative sm:w-64 shrink-0">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={characterSearch}
                  onChange={(e) => setCharacterSearch(e.target.value)}
                  placeholder="Karakter veya meslek ara..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-card/80 border border-border/60 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all shadow-2xs"
                />
                {characterSearch && (
                  <button
                    onClick={() => setCharacterSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* 3D Karakter Kartları Grid Vitrini */}
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-card/30 border border-border/40 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted/15 text-muted flex items-center justify-center mx-auto">
                  <Users size={24} />
                </div>
                <h4 className="font-bold text-sm text-foreground">
                  Eşleşen karakter bulunamadı
                </h4>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Arama kriterlerinizi değiştirerek veya filtreleri sıfırlayarak tekrar deneyin.
                </p>
                {(characterSearch || characterRoleFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setCharacterSearch('');
                      setCharacterRoleFilter('all');
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredCharacters.map(({ character, isUnlocked, isDiscovered, threshold }) => (
                  <Character3DCard
                    key={character.id}
                    character={character}
                    isUnlocked={isUnlocked}
                    isDiscovered={isDiscovered}
                    spoilerThresholdChapter={threshold}
                    onSelect={() => setSelectedCharacterIdForModal(character.id)}
                    onShare={(char) => {
                      setSocialShareCardType('character');
                      setSocialShareCharacter(char);
                      setShowSocialShareModal(true);
                    }}
                    isAuthorView={isAuthorPreview}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── İLİŞKİLER ── */}
        {activeTab === 'relationships' && (
          <div className="space-y-4">
            <InteractiveRelationshipGraph
              characters={allCharacters.length > 0 ? allCharacters : characters}
              locations={locations}
              isEditable={isAuthor}
              initialLayout={universe?.characterGraphLayout}
              onSaveLayout={isAuthor ? handleSaveGraphLayout : undefined}
              currentChapterOrder={userMaxChapter}
            />
          </div>
        )}

        {/* ── IRKLAR & TÜRLER ── */}
        {activeTab === 'races' && (
          <div>
            {races.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz açık bir ırk veya tür kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {races.map((race) => {
                  const altNames = Array.isArray(race.altNames) ? race.altNames : (race.alternativeNames ? race.alternativeNames.split(',').map(s => s.trim()).filter(Boolean) : []);
                  const strengths = Array.isArray(race.strengths) ? race.strengths : (race.strengths ? [race.strengths] : []);
                  const weaknesses = Array.isArray(race.weaknesses) ? race.weaknesses : (race.weaknesses ? [race.weaknesses] : []);

                  return (
                    <div key={race.id} className="p-5 rounded-2xl bg-card/60 border border-border/50 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-foreground">{race.name}</h3>
                            {race.lifespan && (
                              <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                                Ömür: {race.lifespan}
                              </span>
                            )}
                          </div>
                          {altNames.length > 0 && (
                            <span className="text-[11px] text-muted block mt-0.5">
                              Diğer İsimler: {altNames.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                          <Dna size={16} />
                        </div>
                      </div>

                      {race.origin && (
                        <p className="text-xs text-muted leading-relaxed">
                          <strong className="text-foreground font-semibold">Köken: </strong>
                          {race.origin}
                        </p>
                      )}

                      {race.physicalTraits && (
                        <div className="p-3 rounded-xl bg-background/50 border border-border/40 text-xs space-y-1">
                          <span className="font-bold text-foreground block text-[11px]">Fiziksel Özellikler & Biyoloji:</span>
                          <p className="text-muted leading-relaxed whitespace-pre-wrap">{race.physicalTraits}</p>
                        </div>
                      )}

                      {(race.cultureAndTraditions || race.culture) && (
                        <div className="text-xs text-muted leading-relaxed">
                          <strong className="text-foreground font-semibold">Kültür ve Gelenekler: </strong>
                          {race.cultureAndTraditions || race.culture}
                        </div>
                      )}

                      {strengths.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-400">Güçlü Yönler:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {strengths.map((s, idx) => (
                              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                + {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {weaknesses.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-rose-400">Zayıf Yönler:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {weaknesses.map((w, idx) => (
                              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                                - {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {race.language && (
                        <div className="text-[11px] text-muted pt-2 border-t border-border/40">
                          Konuşulan Dil: <strong className="text-foreground">{race.language}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── YARATIKLAR & CANAVARLAR ── */}
        {activeTab === 'creatures' && (
          <div>
            {creatures.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz açık bir yaratık veya canavar kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creatures.map((c) => {
                  const danger = CREATURE_DANGER_CONFIG[c.dangerLevel] || CREATURE_DANGER_CONFIG.medium;
                  const creatureTypeKey = c.creatureType || c.type || 'monster';
                  const habitatNames = Array.isArray(c.habitatNames) ? c.habitatNames : (c.habitatLocationName ? [c.habitatLocationName] : []);
                  const abilities = Array.isArray(c.abilities) ? c.abilities : (c.abilities ? [c.abilities] : []);
                  const drops = Array.isArray(c.dropMaterials) ? c.dropMaterials : (c.dropsOrMaterials ? c.dropsOrMaterials.split(',').map(s => s.trim()).filter(Boolean) : []);

                  return (
                    <div key={c.id} className="p-5 rounded-2xl bg-card/60 border border-border/50 flex flex-col justify-between space-y-3">
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                              <Skull size={22} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-foreground truncate">{c.name}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${danger.bg} ${danger.color} ${danger.border}`}>
                                {danger.label}
                              </span>
                              <span className="text-[10px] text-muted font-medium bg-background px-1.5 py-0.5 rounded border border-border/40">
                                {CREATURE_TYPE_LABELS[creatureTypeKey] || creatureTypeKey}
                              </span>
                            </div>
                          </div>
                        </div>

                        {habitatNames.length > 0 && (
                          <div className="text-[11px] text-muted flex items-center gap-1.5">
                            <MapPin size={12} className="text-emerald-400 shrink-0" />
                            <span className="truncate">Habitat: <strong className="text-foreground">{habitatNames.join(', ')}</strong></span>
                          </div>
                        )}

                        {c.appearance && (
                          <p className="text-xs text-muted leading-relaxed line-clamp-3">{c.appearance}</p>
                        )}

                        {c.behavior && (
                          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 text-[11px] text-muted leading-relaxed">
                            <strong className="text-foreground block text-[10px] font-bold uppercase mb-0.5">Davranış & Tehdit:</strong>
                            {c.behavior}
                          </div>
                        )}

                        {abilities.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase">Yetenekler:</span>
                            <div className="flex flex-wrap gap-1">
                              {abilities.map((ab, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                                  ⚡ {ab}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {drops.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Düşen Materyaller:</span>
                            <div className="flex flex-wrap gap-1">
                              {drops.map((mat, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                                  💎 {mat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MEKÂNLAR ── */}
        {activeTab === 'locations' && (
          <div>
            {locations.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz açık bir mekân kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => {
                  const parentLoc = locations.find((l) => l.id === loc.parentLocationId);
                  const childLocs = locations.filter((l) => l.parentLocationId === loc.id);

                  return (
                    <div key={loc.id} className="rounded-2xl bg-card border border-border/60 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
                      {/* Görsel / Başlık */}
                      <div className="w-full h-36 relative bg-muted/30 overflow-hidden">
                        {loc.imageUrl ? (
                          <img
                            src={loc.imageUrl}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-muted/20 to-background text-muted-foreground/40">
                            <MapPin size={32} className="mb-1 text-muted-foreground/50" />
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
                              {LOCATION_TYPE_LABELS[loc.type] || loc.type}
                            </span>
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-bold uppercase text-primary bg-background/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-border/60 shadow-xs">
                            {LOCATION_TYPE_LABELS[loc.type] || loc.type}
                          </span>
                        </div>

                        {childLocs.length > 0 && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] font-bold text-foreground bg-background/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-border/60 shadow-xs">
                              {childLocs.length} Alt Mekân
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                        <div>
                          {parentLoc && (
                            <div className="flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground mb-1">
                              <MapPin size={11} className="text-primary shrink-0" />
                              <span className="truncate">Üst Mekân: {parentLoc.name} ({LOCATION_TYPE_LABELS[parentLoc.type] || parentLoc.type})</span>
                            </div>
                          )}

                          <h4 className="font-bold text-sm text-foreground">{loc.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                            {loc.description || loc.readerNotes || 'Açıklama bulunmuyor.'}
                          </p>

                          {loc.detailedDescription && (
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-1.5 italic">
                              "{loc.detailedDescription}"
                            </p>
                          )}
                        </div>

                        {/* Çipler */}
                        <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                          {loc.climate && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 truncate max-w-[150px]">
                              🌤 {loc.climate}
                            </span>
                          )}
                          {loc.atmosphere && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 truncate max-w-[150px]">
                              🌫 {loc.atmosphere}
                            </span>
                          )}
                          {loc.population && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 truncate max-w-[130px]">
                              👥 {loc.population}
                            </span>
                          )}
                          {loc.governance && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 truncate max-w-[150px]">
                              👑 {loc.governance}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DÜNYA HARİTASI ── */}
        {activeTab === 'maps' && (
          <div className="space-y-4">
            {maps.length > 1 && (
              <div className="flex items-center gap-2 bg-card/60 p-2 rounded-2xl border border-border/40 overflow-x-auto">
                {maps.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMapId(m.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      (selectedMapId || maps[0]?.id) === m.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                    }`}
                  >
                    <span>{m.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/20 uppercase font-bold">
                      {m.mapType}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {(() => {
              const currentMap = maps.find((m) => m.id === selectedMapId) || maps[0];
              if (!currentMap) {
                return (
                  <p className="text-xs text-muted text-center py-12">
                    Bu evrene ait henüz bir harita eklenmemiş.
                  </p>
                );
              }
              return (
                <InteractiveWorldMap
                  map={currentMap}
                  locations={locations}
                  events={timelineEvents}
                  isEditable={false}
                />
              );
            })()}
          </div>
        )}

        {/* ── ORGANİZASYONLAR ── */}
        {activeTab === 'organizations' && (
          <div>
            {organizations.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz açık bir organizasyon kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => {
                  const leader = characters.find((c) => c.id === org.leaderCharacterId);
                  const hq = locations.find((l) => l.id === org.headquarterLocationId);

                  return (
                    <div key={org.id} className="p-5 rounded-2xl bg-card/60 border border-border/50 flex flex-col justify-between space-y-3">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          {org.symbolUrl ? (
                            <img src={org.symbolUrl} alt={org.name} className="w-10 h-10 rounded-xl object-cover border border-border/50 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Building2 size={20} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{org.name}</h4>
                            <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                              {org.type}
                            </span>
                          </div>
                        </div>

                        {org.description && (
                          <p className="text-xs text-muted leading-relaxed line-clamp-3">{org.description}</p>
                        )}

                        {org.ideology && (
                          <div className="p-2 rounded-xl bg-background/50 border border-border/40 text-[11px] text-foreground/80 italic">
                            "{org.ideology}"
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/40 space-y-1 text-[11px] text-muted">
                          {leader && (
                            <div className="flex items-center gap-1.5">
                              <Crown size={12} className="text-amber-400 shrink-0" />
                              <span>Lider: <strong className="text-foreground">{leader.name}</strong></span>
                            </div>
                          )}
                          {hq && (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span>Merkez: <strong className="text-foreground">{hq.name}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── KÜLTÜR, İNANÇ & DÜNYA DÜZENİ ── */}
        {activeTab === 'cultures' && (
          <div>
            {cultures.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz açık bir kültür veya inanç kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cultures.map((cu) => {
                  const cat = CULTURE_CATEGORY_LABELS[cu.category] || CULTURE_CATEGORY_LABELS.culture;
                  const deities = Array.isArray(cu.deitiesOrFigures) ? cu.deitiesOrFigures : (cu.deitiesAndFigures ? cu.deitiesAndFigures.split(',').map(s => s.trim()).filter(Boolean) : []);
                  const holyPlaces = Array.isArray(cu.holyPlaces) ? cu.holyPlaces : (cu.sacredPlacesAndTexts ? cu.sacredPlacesAndTexts.split(',').map(s => s.trim()).filter(Boolean) : []);
                  const socialClasses = Array.isArray(cu.socialClasses) ? cu.socialClasses : (cu.socialClasses ? [cu.socialClasses] : []);

                  return (
                    <div key={cu.id} className="p-5 rounded-2xl bg-card/60 border border-border/50 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                            <Landmark size={16} />
                          </div>
                          <h4 className="font-bold text-base text-foreground">{cu.name}</h4>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                      </div>

                      {(cu.traditions || cu.traditionsAndCustoms) && (
                        <div className="text-xs text-muted leading-relaxed">
                          <strong className="text-foreground font-semibold">Gelenekler & Ritüeller: </strong>
                          {cu.traditions || cu.traditionsAndCustoms}
                        </div>
                      )}

                      {(cu.taboos || cu.valuesAndTaboos) && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                          <strong className="block text-[10px] font-bold uppercase mb-0.5">⚠️ Tabular ve Yasaklar:</strong>
                          {cu.taboos || cu.valuesAndTaboos}
                        </div>
                      )}

                      {deities.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Tanrılar & Kutsal Figürler:</span>
                          <div className="flex flex-wrap gap-1">
                            {deities.map((d, idx) => (
                              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                                ✨ {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {holyPlaces.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Kutsal Mekânlar:</span>
                          <div className="flex flex-wrap gap-1">
                            {holyPlaces.map((p, idx) => (
                              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                                📍 {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(cu.creationMyth || cu.creationMythAndAfterlife) && (
                        <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 text-xs space-y-1">
                          <span className="font-bold text-foreground block text-[10px] uppercase">Yaratılış Miti:</span>
                          <p className="text-muted leading-relaxed whitespace-pre-wrap">{cu.creationMyth || cu.creationMythAndAfterlife}</p>
                        </div>
                      )}

                      {(cu.governanceSystem || cu.governmentSystem) && (
                        <div className="text-xs text-muted">
                          <strong className="text-foreground font-semibold">Yönetim Biçimi: </strong>
                          {cu.governanceSystem || cu.governmentSystem}
                        </div>
                      )}

                      {(cu.currency || cu.currencyAndTrade) && (
                        <div className="text-xs text-muted">
                          <strong className="text-foreground font-semibold">Para Birimi: </strong>
                          {cu.currency || cu.currencyAndTrade}
                        </div>
                      )}

                      {(cu.laws || cu.lawsAndSuccession) && (
                        <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 text-xs text-muted leading-relaxed">
                          <strong className="text-foreground block text-[10px] font-bold uppercase mb-0.5">Hukuk & Yasalar:</strong>
                          {cu.laws || cu.lawsAndSuccession}
                        </div>
                      )}

                      {socialClasses.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Toplumsal Sınıflar:</span>
                          <div className="flex flex-wrap gap-1">
                            {socialClasses.map((sc, idx) => (
                              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                                🏛️ {sc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── EŞYALAR & ARTEFAKTLAR ── */}
        {activeTab === 'items' && (
          <div>
            {items.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz açık bir eşya kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const owner = characters.find((c) => c.id === item.currentOwnerId);

                  return (
                    <div key={item.id} className="p-5 rounded-2xl bg-card/60 border border-border/50 flex flex-col justify-between space-y-3">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-border/50 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                              <Sword size={20} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full">
                              {item.type || 'Artefakt'}
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-muted leading-relaxed line-clamp-3">{item.description}</p>
                        )}

                        {item.powerDescription && (
                          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-foreground/90 space-y-0.5">
                            <span className="font-bold text-violet-400 flex items-center gap-1">
                              <Sparkles size={11} /> Güç / İşlev:
                            </span>
                            <p className="line-clamp-2 text-muted">{item.powerDescription}</p>
                          </div>
                        )}

                        {item.limitation && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-foreground/90 space-y-0.5">
                            <span className="font-bold text-amber-400 flex items-center gap-1">
                              ⚠️ Sınır & Bedel:
                            </span>
                            <p className="line-clamp-2 text-muted">{item.limitation}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/40 space-y-1 text-[11px] text-muted">
                          {owner && (
                            <div>Sahibi: <strong className="text-foreground">{owner.name}</strong></div>
                          )}
                          {item.origin && (
                            <div>Köken: <strong className="text-foreground">{item.origin}</strong></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── GÜÇ SİSTEMLERİ ── */}
        {activeTab === 'powers' && (
          <div>
            {powerSystems.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene ait henüz bir güç sistemi kaydı bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {powerSystems.map((power) => (
                  <div key={power.id} className="p-5 rounded-2xl bg-card/60 border border-border/50 space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Zap size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{power.name}</h4>
                        {power.source && (
                          <span className="text-[11px] text-muted">Kaynak: {power.source}</span>
                        )}
                      </div>
                    </div>

                    {power.corePrinciples && (
                      <div>
                        <span className="text-[11px] font-bold text-muted block mb-0.5">Temel Prensip:</span>
                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{power.corePrinciples}</p>
                      </div>
                    )}

                    {power.rulesAndLimits && (
                      <div className="p-3 rounded-xl bg-background/50 border border-border/40 text-xs space-y-1">
                        <span className="font-bold text-foreground block text-[11px]">Kurallar ve Sınırlar:</span>
                        <p className="text-muted leading-relaxed whitespace-pre-wrap">{power.rulesAndLimits}</p>
                      </div>
                    )}

                    {power.costAndRisks && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                        <span className="font-bold text-rose-400 block text-[11px]">Bedel ve Riskler:</span>
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{power.costAndRisks}</p>
                      </div>
                    )}

                    {power.levelsOrTiers && power.levelsOrTiers.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-muted block">Kademeler / Seviyeler:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {power.levelsOrTiers.map((tier, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary">
                              {tier}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ZAMAN ÇİZELGESİ ── */}
        {activeTab === 'timeline' && (
          <div>
            {timelineEvents.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Henüz kayıtlı bir zaman çizelgesi olayı yok.</p>
            ) : (
              <div className="space-y-3">
                {timelineEvents.map((ev, idx) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-card/60 border border-border/50 flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground">{ev.title}</span>
                        {ev.era && (
                          <span className="text-[10px] font-semibold text-muted bg-background px-2 py-0.5 rounded-md border border-border/50">
                            {ev.era}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{ev.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SÖZLÜK ── */}
        {activeTab === 'glossary' && (
          <div>
            {glossary.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Sözlük terimi henüz eklenmemiş.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {glossary.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-card/60 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-foreground">{t.term}</span>
                      {t.category && (
                        <span className="text-[10px] font-semibold text-muted bg-background px-2 py-0.5 rounded-md border border-border/40">
                          {t.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{t.meaning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LORE ── */}
        {activeTab === 'lore' && (
          <div>
            {lore.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Lore ve efsane kayıtları henüz eklenmemiş.</p>
            ) : (
              <div className="space-y-4">
                {lore.map((l) => (
                  <div key={l.id} className="p-5 rounded-2xl bg-card/60 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base text-foreground">{l.title}</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md capitalize">
                        {l.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{l.readerContent || l.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GÖRSEL ARŞİV & MOODBOARD ── */}
        {activeTab === 'media' && (
          <div>
            {/* Kategori Filtresi */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
              <button
                onClick={() => setSelectedMediaCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMediaCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted hover:text-foreground border border-border/50'
                }`}
              >
                Tümü ({mediaList.length})
              </button>
              {Object.entries(MEDIA_CATEGORY_CONFIG).map(([catKey, conf]) => {
                const count = mediaList.filter((m) => m.category === catKey).length;
                if (count === 0) return null;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedMediaCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedMediaCategory === catKey
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-card text-muted hover:text-foreground border border-border/50'
                    }`}
                  >
                    <span>{conf.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/50">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Galeri Grid */}
            {mediaList.filter((m) => selectedMediaCategory === 'all' || m.category === selectedMediaCategory).length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu kategoride görsel bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList
                  .filter((m) => selectedMediaCategory === 'all' || m.category === selectedMediaCategory)
                  .map((item) => {
                    const catConf = MEDIA_CATEGORY_CONFIG[item.category] || { label: 'Diğer', color: 'text-muted', bg: 'bg-muted/10' };
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveLightboxMedia(item)}
                        className="group bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col shadow-xs hover:shadow-md"
                      >
                        <div className="relative aspect-4/3 w-full bg-muted/20 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${catConf.color} ${catConf.bg} border border-border/40`}>
                              {catConf.label}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-border/30 flex items-center justify-between gap-2">
                            {/* Renk Paleti Noktaları */}
                            {item.colorPalette && item.colorPalette.length > 0 ? (
                              <div className="flex items-center gap-1 shrink-0">
                                {item.colorPalette.slice(0, 5).map((color, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="w-3.5 h-3.5 rounded-full border border-border/50 shrink-0"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span />
                            )}

                            {/* Etiketler */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex items-center gap-1 overflow-hidden shrink-0">
                                {item.tags.slice(0, 2).map((tag, tIdx) => (
                                  <span key={tIdx} className="text-[9px] text-muted bg-background px-1.5 py-0.5 rounded border border-border/40 truncate max-w-[80px]">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── MÜZİKLER & SOUNDTRACK ── */}
        {activeTab === 'soundtracks' && (
          <div>
            {soundtracks.length === 0 ? (
              <p className="text-xs text-muted text-center py-12">Bu evrene henüz müzik veya soundtrack eklenmemiş.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {soundtracks.map((track) => {
                  const themeKey = track.themeType || track.theme || 'ambient';
                  const themeConf = SOUNDTRACK_THEME_CONFIG[themeKey] || { label: 'Ambiyans', color: 'text-teal-400', bg: 'bg-teal-500/10' };
                  const parsed = parseAudioTrack(track.url);
                  const platformLabel = getAudioPlatformLabel(parsed.platform);

                  return (
                    <div
                      key={track.id}
                      className="p-5 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mb-1.5 capitalize ${themeConf.color} ${themeConf.bg}`}>
                              {themeConf.label}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{track.title}</h4>
                            {track.artist && (
                              <p className="text-xs text-muted mt-0.5">Sanatçı: {track.artist}</p>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-muted bg-background/80 px-2 py-1 rounded-lg border border-border/40 shrink-0">
                            {platformLabel}
                          </span>
                        </div>

                        {track.description && (
                          <p className="text-xs text-muted mb-4 leading-relaxed">{track.description}</p>
                        )}
                      </div>

                      {/* Ses Çalar / Entegrasyon */}
                      <div className="mt-3 pt-3 border-t border-border/40">
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
                          <audio controls src={track.url} className="w-full h-9 accent-primary" />
                        ) : parsed.platform === 'youtube' && parsed.embedUrl ? (
                          <div className="space-y-2">
                            <iframe
                              src={parsed.embedUrl}
                              width="100%"
                              height="180"
                              title={track.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="rounded-xl w-full border border-border/40"
                            />
                            <div className="flex justify-end">
                              <a
                                href={track.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                              >
                                <span>YouTube'da Aç</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors w-full justify-center"
                          >
                            <Headphones size={15} />
                            <span>Parçayı Dinle ({platformLabel})</span>
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CANON KURALLARI (BIBLE) ── */}
        {activeTab === 'canon_rules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
              <div>
                <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                  <Scale className="text-primary" size={18} /> Evren Canon Kuralları
                </Typography>
                <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                  Bu evrenin değişmez fizik, büyü, doğaüstü ve kozmoloji kanunları. Tüm hikayeler ve kahramanlar bu kuralların çerçevesinde hareket eder.
                </p>
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCanonCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCanonCategory === 'all'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                }`}
              >
                Tümü ({canonRules.length})
              </button>
              {(Object.keys(CANON_RULE_CATEGORY_LABELS) as CanonRuleCategory[]).map((catKey) => {
                const count = canonRules.filter((r) => r.category === catKey).length;
                if (count === 0) return null;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCanonCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCanonCategory === catKey
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                    }`}
                  >
                    {CANON_RULE_CATEGORY_LABELS[catKey]} ({count})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canonRules
                .filter((r) => selectedCanonCategory === 'all' || r.category === selectedCanonCategory)
                .map((rule) => (
                  <div
                    key={rule.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {CANON_RULE_CATEGORY_LABELS[rule.category] || rule.category}
                        </span>
                        {rule.isStrict ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <ShieldAlert size={10} /> Bükülemez Yasa
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            Rehber Kural
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-foreground">{rule.title}</h4>
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                        {rule.description}
                      </p>

                      {rule.consequences && (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-300">
                            <AlertTriangle size={12} /> Çiğnenirse Bedeli
                          </div>
                          <p className="text-[11px] text-amber-200/90 whitespace-pre-line">
                            {rule.consequences}
                          </p>
                        </div>
                      )}

                      {rule.exceptions && (
                        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-300">
                            <Sparkles size={12} /> İstisnalar
                          </div>
                          <p className="text-[11px] text-blue-200/90 whitespace-pre-line">
                            {rule.exceptions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── GİZEMLER & AÇIK KURGU DÜĞÜMLERİ ── */}
        {activeTab === 'plot_threads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
              <div>
                <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                  <HelpCircle className="text-primary" size={18} /> Açık Gizemler & Keşif Düğümleri
                </Typography>
                <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                  Evrende cevabı aranan büyük sırlar, kadim kehanetler ve kahramanların peşinden koştuğu kurgu düğümleri.
                </p>
              </div>
            </div>

            {/* Durum Filtresi */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedThreadStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedThreadStatus === 'all'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                }`}
              >
                Tümü ({plotThreads.length})
              </button>
              {(Object.keys(PLOT_THREAD_STATUS_LABELS) as PlotThreadStatus[]).map((stKey) => {
                const count = plotThreads.filter((t) => t.status === stKey).length;
                if (count === 0) return null;
                return (
                  <button
                    key={stKey}
                    onClick={() => setSelectedThreadStatus(stKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedThreadStatus === stKey
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                    }`}
                  >
                    {PLOT_THREAD_STATUS_LABELS[stKey]} ({count})
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {plotThreads
                .filter((t) => selectedThreadStatus === 'all' || t.status === selectedThreadStatus)
                .map((thread) => (
                  <div
                    key={thread.id}
                    className="p-5 sm:p-6 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              thread.importance === 'critical'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : thread.importance === 'major'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {PLOT_THREAD_IMPORTANCE_LABELS[thread.importance]}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              thread.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : thread.status === 'clues_planted'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {PLOT_THREAD_STATUS_LABELS[thread.status]}
                          </span>

                          {thread.introducedInStoryTitle && (
                            <span className="text-[10px] text-muted bg-background/50 px-2 py-0.5 rounded-md border border-border/40">
                              📖 {thread.introducedInStoryTitle}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-base text-foreground">{thread.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
                      {thread.description}
                    </p>

                    {/* Çözüldüyse Çözüldü Bildirimi (Spoiler Korumalı) */}
                    {thread.status === 'resolved' && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                        <div>
                          <span className="font-bold block">Bu Gizem Çözüldü</span>
                          <span className="text-[11px] text-emerald-200/80">
                            {thread.resolvedInStoryTitle
                              ? `${thread.resolvedInStoryTitle} eserinde çözüme kavuştu. Sayfaları okuyarak cevabı keşfedebilirsiniz!`
                              : 'İlgili eserin ilerleyen bölümlerinde cevaba ulaşıldı.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* İpuçları Alanı */}
                    {thread.clues && thread.clues.length > 0 && (
                      <div className="p-4 rounded-2xl bg-background/50 border border-border/40 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="text-amber-400" size={14} />
                          <span className="text-xs font-bold text-foreground">
                            Keşfedilen İpuçları ({thread.clues.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {thread.clues.map((clue, idx) => (
                            <div
                              key={clue.id || idx}
                              className="flex items-start gap-2 p-2.5 rounded-xl bg-card/60 border border-border/30 text-xs"
                            >
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary/15 text-primary mt-0.5">
                                #{idx + 1}
                              </span>
                              <div className="space-y-0.5">
                                {clue.storyTitle && (
                                  <span className="text-[10px] font-bold text-foreground/75 block">
                                    {clue.storyTitle} {clue.chapterOrder ? `(Bölüm ${clue.chapterOrder})` : ''}
                                  </span>
                                )}
                                <p className="text-[11px] text-foreground/90 leading-relaxed whitespace-pre-line">
                                  {clue.note}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── EKİP & KATKIDA BULUNANLAR (PRD 32 & 66) ── */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
              <Typography variant="h2" className="text-base sm:text-lg font-bold mb-1.5 flex items-center gap-2 text-foreground">
                <Users size={20} className="text-primary" />
                <span>Evren Ekibi & Katkıda Bulunanlar</span>
              </Typography>
              <p className="text-xs text-muted leading-relaxed max-w-2xl">
                Bu kurgusal dünyanın hikâyelerine, efsanelerine, kurallarına ve görsel tasarımlarına hayat veren yaratıcı kadro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evren Mimarı (Asıl Yaratıcı) */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-card via-card to-purple-500/10 border border-purple-500/30 flex items-start gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-base shrink-0 shadow-inner">
                  <Crown size={22} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">
                      {universe.authorName || 'Evren Mimarı'}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      Evren Mimarı & Kurucu
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Evrenin temel kurgusal yapısını, kanunlarını ve hikâye bağlamını oluşturan asıl yazar.
                  </p>
                </div>
              </div>

              {/* Ortak Çalışanlar / Katkıda Bulunanlar */}
              {universe.members?.map((member) => {
                const conf = UNIVERSE_MEMBER_ROLE_CONFIG[member.role] || UNIVERSE_MEMBER_ROLE_CONFIG.viewer;
                return (
                  <div
                    key={member.userId}
                    className="p-5 rounded-2xl bg-card/60 hover:bg-card border border-border/40 transition-all flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border/60 overflow-hidden flex items-center justify-center text-foreground font-bold text-sm shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{member.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground truncate">
                          {member.displayName}
                        </span>
                        {member.username && (
                          <span className="text-xs text-muted truncate">
                            @{member.username}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color} ${conf.border}`}>
                          {conf.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        {conf.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      {activeLightboxMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxMedia(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Üst Kapat Butonu */}
            <button
              onClick={() => setActiveLightboxMedia(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            {/* Görsel Alanı */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden max-h-[60vh] min-h-[250px]">
              <img
                src={activeLightboxMedia.imageUrl}
                alt={activeLightboxMedia.title}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>

            {/* Bilgi Alanı */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                  {MEDIA_CATEGORY_CONFIG[activeLightboxMedia.category]?.label || 'Konsept Görsel'}
                </span>
                {activeLightboxMedia.tags && activeLightboxMedia.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeLightboxMedia.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] text-muted bg-background px-2 py-0.5 rounded-md border border-border/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-foreground mb-1">
                {activeLightboxMedia.title}
              </h3>

              {activeLightboxMedia.description && (
                <p className="text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-wrap mt-2">
                  {activeLightboxMedia.description}
                </p>
              )}

              {/* Renk Paleti */}
              {activeLightboxMedia.colorPalette && activeLightboxMedia.colorPalette.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <span className="text-xs font-bold text-foreground block mb-2">Konsept Renk Paleti</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeLightboxMedia.colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-background border border-border/50 text-xs font-mono text-foreground"
                      >
                        <span className="w-4 h-4 rounded-full border border-border/40 shrink-0" style={{ backgroundColor: color }} />
                        <span>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── OKUYUCU KARAKTER PROFİLİ MODALI (PRD BÖLÜM 42) ── */}
      {selectedCharacterForModal && (
        <CharacterReaderModal
          character={selectedCharacterForModal}
          allCharacters={allCharacters}
          locations={locations}
          items={items}
          stories={stories}
          userMaxChapter={userMaxChapter}
          isAuthorView={isAuthorPreview}
          onClose={() => setSelectedCharacterIdForModal(null)}
          onSelectOtherCharacter={(targetId) => setSelectedCharacterIdForModal(targetId)}
          onShareCharacter={(char) => {
            setSocialShareCardType('character');
            setSocialShareCharacter(char);
            setShowSocialShareModal(true);
          }}
        />
      )}

      {/* ── SOSYAL PAYLAŞIM VE TANITIM VİTRİNİ MODALI (PRD BÖLÜM 55 & 57) ── */}
      {showSocialShareModal && universe && (
        <SocialShareModal
          universe={universe}
          characters={characters}
          locations={locations}
          plotThreads={plotThreads}
          stories={stories}
          initialCardType={socialShareCardType}
          initialCharacter={socialShareCharacter}
          userChapterOrder={userMaxChapter}
          onClose={() => setShowSocialShareModal(false)}
        />
      )}

      {/* ── GLOBAL EVREN İÇİ ARAMA & HIZLI GEZİNME (PRD BÖLÜM 50 & 51) ── */}
      {isGlobalSearchOpen && universe && (
        <UniverseSearchDrawer
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          universeTitle={universe.title}
          isAuthorMode={isAuthorPreview}
          userMaxChapter={userMaxChapter}
          characters={characters}
          locations={locations}
          timelineEvents={timelineEvents}
          glossary={glossary}
          lore={lore}
          items={items}
          organizations={organizations}
          powerSystems={powerSystems}
          races={races}
          creatures={creatures}
          cultures={cultures}
          canonRules={canonRules}
          plotThreads={plotThreads}
          stories={stories}
          seriesList={seriesList}
          onSelectResult={handleSelectSearchResult}
        />
      )}
    </div>
  );
}
