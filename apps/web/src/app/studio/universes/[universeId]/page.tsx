'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  BookOpen, 
  Layers, 
  MapPin, 
  Clock, 
  BookA, 
  Scroll, 
  Users, 
  User,
  Plus, 
  Trash2, 
  ExternalLink, 
  X, 
  Upload, 
  Loader2, 
  ChevronRight,
  Globe,
  Mountain,
  AlertTriangle,
  Eye,
  Lock,
  Brain,
  Activity,
  Fingerprint,
  Image as ImageIcon,
  Heart,
  Shield,
  EyeOff,
  Edit3,
  Map as MapIcon,
  Share2,
  Building2,
  Sword,
  Zap,
  Gem,
  Crown,
  ShieldAlert,
  Dna,
  Skull,
  Landmark,
  Compass,
  Coins,
  Palette,
  Music,
  Volume2,
  Play,
  Pause,
  Tag,
  BookmarkCheck,
  HelpCircle,
  CheckCircle2,
  ListChecks,
  Scale,
  FileText,
  Lightbulb,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Search
} from 'lucide-react';
import { InteractiveWorldMap } from '@/components/InteractiveWorldMap';
import { InteractiveRelationshipGraph } from '@/components/InteractiveRelationshipGraph';
import { UniverseSearchDrawer, type UniverseSearchResultItem } from '@/components/UniverseSearchDrawer';
import { UniverseOnboardingChecklist } from '@/components/UniverseOnboardingChecklist';
import { UniverseNavigationTabs } from './UniverseNavigationTabs';
import { 
  useAuthStore, 
  getUniverseById, 
  updateUniverse, 
  deleteUniverse, 
  linkStoryToUniverse, 
  unlinkStoryFromUniverse,
  linkSeriesToUniverse,
  unlinkSeriesFromUniverse,
  getUniverseLocations,
  createUniverseLocation,
  updateUniverseLocation,
  deleteUniverseLocation,
  getUniverseTimelineEvents,
  createUniverseTimelineEvent,
  deleteUniverseTimelineEvent,
  getUniverseGlossary,
  createUniverseGlossaryTerm,
  deleteUniverseGlossaryTerm,
  getUniverseLoreList,
  createUniverseLore,
  deleteUniverseLore,
  getUniverseCharacters,
  createUniverseCharacter,
  updateUniverseCharacter,
  deleteUniverseCharacter,
  addUniverseCharacterRelationship,
  deleteUniverseCharacterRelationship,
  getUniverseMaps,
  createUniverseMap,
  deleteUniverseMap,
  addMapMarker,
  updateMapMarker,
  deleteMapMarker,
  getUniverseOrganizations,
  createUniverseOrganization,
  updateUniverseOrganization,
  deleteUniverseOrganization,
  getUniverseItems,
  createUniverseItem,
  updateUniverseItem,
  deleteUniverseItem,
  getUniversePowerSystems,
  createUniversePowerSystem,
  updateUniversePowerSystem,
  deleteUniversePowerSystem,
  getUniverseRaces,
  createUniverseRace,
  updateUniverseRace,
  deleteUniverseRace,
  getUniverseCreatures,
  createUniverseCreature,
  updateUniverseCreature,
  deleteUniverseCreature,
  getUniverseCultures,
  createUniverseCulture,
  updateUniverseCulture,
  deleteUniverseCulture,
  getUniverseMedia,
  createUniverseMedia,
  updateUniverseMedia,
  deleteUniverseMedia,
  getUniverseSoundtracks,
  createUniverseSoundtrack,
  updateUniverseSoundtrack,
  deleteUniverseSoundtrack,
  getUniverseCanonRules,
  createUniverseCanonRule,
  updateUniverseCanonRule,
  deleteUniverseCanonRule,
  getUniversePlotThreads,
  createUniversePlotThread,
  updateUniversePlotThread,
  deleteUniversePlotThread,
  addPlotThreadClue,
  CANON_RULE_CATEGORY_LABELS,
  PLOT_THREAD_STATUS_LABELS,
  PLOT_THREAD_IMPORTANCE_LABELS,
  compressToWebP,
  parseAudioTrack,
  getAudioPlatformLabel,
  getStoryById,
  getSeriesById,
  subscribeToAuthorStories,
  getSeriesByAuthorId,
  LOCATION_TYPE_LABELS,
  getCharacterRoleLabel,
  type Universe, 
  type UniverseGenre, 
  type UniverseVisibility, 
  type UniverseLocation, 
  type LocationType, 
  type UniverseTimelineEvent, 
  type UniverseGlossaryTerm, 
  type UniverseLore, 
  type Character,
  type CharacterArc,
  type CharacterRelationship,
  type CharacterPNGGallery,
  type CharacterRPGStats,
  type UniverseMap,
  type UniverseMapMarker,
  type UniverseOrganization,
  type OrganizationType,
  type UniverseItem,
  type UniversePowerSystem,
  type UniverseRace,
  type UniverseCreature,
  type CreatureType,
  type CreatureDangerLevel,
  type UniverseCulture,
  type CultureCategory,
  type UniverseMedia,
  type MediaCategory,
  type UniverseSoundtrack,
  type SoundtrackTheme,
  type UniverseCanonRule,
  type CanonRuleCategory,
  type UniversePlotThread,
  type PlotThreadStatus,
  type PlotThreadImportance,
  type PlotThreadClue,
  type Story,
  type Series,
  addUniverseMember,
  updateUniverseMemberRole,
  removeUniverseMember,
  searchUsersByQuery,
  getUserUniverseRole,
  canManageUniverseMembers,
  canEditUniverseLore,
  canManageUniverseStories,
  canManageUniverseMedia,
  UNIVERSE_MEMBER_ROLE_CONFIG,
  type UniverseMember,
  type UniverseMemberRole
} from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { toast } from 'sonner';

const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  kingdom: 'Krallık',
  empire: 'İmparatorluk',
  guild: 'Lonca',
  school: 'Akademi / Okul',
  cult: 'Tarikat / Kült',
  corporation: 'Şirket / Konsorsiyum',
  family: 'Hanedan / Soy / Aile',
  secret_society: 'Gizli Örgüt',
  army: 'Ordu / Birlik',
  other: 'Organizasyon',
};

const CREATURE_DANGER_CONFIG: Record<CreatureDangerLevel, { label: string; color: string }> = {
  harmless: { label: 'Zararsız / Evcil', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  low: { label: 'Düşük Tehlike', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  medium: { label: 'Orta Tehlike', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  high: { label: 'Yüksek Tehlike', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  deadly: { label: 'Ölümcül', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  calamity: { label: 'Felaket / Efsanevi', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
};

const CREATURE_TYPE_LABELS: Record<CreatureType, string> = {
  monster: 'Canavar',
  mythological: 'Mitolojik Varlık',
  beast: 'Efsanevi Hayvan',
  artificial: 'Yapay Yaşam / Golem',
  alien: 'Uzaylı Organizma',
  spiritual: 'Ruhani Varlık',
  other: 'Diğer',
};

const CULTURE_CATEGORY_LABELS: Record<CultureCategory, string> = {
  culture: 'Kültür & Gelenek',
  religion: 'İnanç & Mitoloji',
  politics: 'Siyaset & Yönetim',
  economy: 'Ekonomi & Ticaret',
};

const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  character: 'Karakter Referansı',
  location: 'Mekân & Doğa',
  architecture: 'Mimari & Yapı',
  costume: 'Kostüm & Zırh',
  atmosphere: 'Atmosfer & Işık',
  color_palette: 'Renk Paleti',
  item: 'Eşya & Obje',
  other: 'Diğer',
};

const SOUNDTRACK_THEME_LABELS: Record<SoundtrackTheme, string> = {
  main_theme: 'Ana Evren Teması',
  location: 'Mekân / Bölge Ambiyansı',
  battle: 'Savaş / Aksiyon Teması',
  character: 'Karakter Teması',
  emotional: 'Duygusal / Hüzünlü',
  ambient: 'Doğa / Arka Plan Ambiyansı',
};

const CANON_RULE_CATEGORY_CONFIG: Record<CanonRuleCategory, { label: string; color: string; bg: string }> = {
  magic_system: { label: 'Büyü & Doğaüstü Kanunları', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  cosmology: { label: 'Fizik, Uzay & Zaman', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  biological: { label: 'Irk & Biyoloji Sınırları', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  historical: { label: 'Değiştirilemez Tarihsel Olaylar', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  societal: { label: 'Toplum, Kültür & Tabular', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  do_not_repeat: { label: 'Yasaklı Klişeler & Durumlar', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const PLOT_THREAD_STATUS_CONFIG: Record<PlotThreadStatus, { label: string; color: string; bg: string; border: string }> = {
  open: { label: 'Açık Düğüm', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  clues_planted: { label: 'İpuçları Verildi', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  resolved: { label: 'Çözüldü', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  abandoned: { label: 'Rafa Kaldırıldı', color: 'text-muted', bg: 'bg-muted/10', border: 'border-muted/30' },
};

const PLOT_THREAD_IMPORTANCE_CONFIG: Record<PlotThreadImportance, { label: string; color: string; bg: string }> = {
  critical: { label: 'Ana Evren Gizemi', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  major: { label: 'Ana Kurgu Düğümü', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  minor: { label: 'Alt Kurgu / Karakter', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  side_mystery: { label: 'Yan Gizem Detayı', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

type ActiveUniverseTab = 
  | 'overview' 
  | 'characters' 
  | 'relationships' 
  | 'races'
  | 'creatures'
  | 'locations' 
  | 'maps' 
  | 'organizations' 
  | 'items' 
  | 'powers' 
  | 'cultures'
  | 'media'
  | 'soundtracks'
  | 'canon_rules'
  | 'plot_threads'
  | 'timeline' 
  | 'glossary' 
  | 'lore'
  | 'members';

export default function UniverseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const universeId = params.universeId as string;
  const { firebaseUser } = useAuthStore();

  const [universe, setUniverse] = useState<Universe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveUniverseTab>('overview');

  // Global Evren Arama Çekmecesi (PRD Bölüm 50 & 51)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

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
      setActiveTab(item.targetTab as ActiveUniverseTab);
    }
    if (item.category === 'character' && item.payload) {
      openCharDetail(item.payload);
    } else if (item.category === 'item' && item.payload) {
      openEditItemModal(item.payload);
    } else if (item.category === 'organization' && item.payload) {
      openEditOrgModal(item.payload);
    }
  };

  const handleQuickAdd = (category: 'character' | 'location' | 'event' | 'glossary' | 'lore' | 'item' | 'organization') => {
    if (category === 'character') {
      setActiveTab('characters');
      setIsCharModalOpen(true);
    } else if (category === 'location') {
      setActiveTab('locations');
      setIsLocationModalOpen(true);
    } else if (category === 'event') {
      setActiveTab('timeline');
      setIsEventModalOpen(true);
    } else if (category === 'glossary') {
      setActiveTab('glossary');
      setIsTermModalOpen(true);
    } else if (category === 'lore') {
      setActiveTab('lore');
      setIsLoreModalOpen(true);
    } else if (category === 'item') {
      setActiveTab('items');
      openCreateItemModal();
    } else if (category === 'organization') {
      setActiveTab('organizations');
      openCreateOrgModal();
    }
  };

  // Form Alanları
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [genre, setGenre] = useState<UniverseGenre>('fantasy');
  const [visibility, setVisibility] = useState<UniverseVisibility>('draft');
  const [coverUploading, setCoverUploading] = useState(false);

  // Bağlı Eserler ve Seriler
  const [connectedStories, setConnectedStories] = useState<Story[]>([]);
  const [connectedSeries, setConnectedSeries] = useState<Series[]>([]);
  const [authorStories, setAuthorStories] = useState<Story[]>([]);
  const [authorSeries, setAuthorSeries] = useState<Series[]>([]);

  // Modül Verileri
  const [locations, setLocations] = useState<UniverseLocation[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<UniverseTimelineEvent[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<UniverseGlossaryTerm[]>([]);
  const [loreList, setLoreList] = useState<UniverseLore[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [maps, setMaps] = useState<UniverseMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [organizations, setOrganizations] = useState<UniverseOrganization[]>([]);
  const [items, setItems] = useState<UniverseItem[]>([]);
  const [powerSystems, setPowerSystems] = useState<UniversePowerSystem[]>([]);
  const [races, setRaces] = useState<UniverseRace[]>([]);
  const [creatures, setCreatures] = useState<UniverseCreature[]>([]);
  const [cultures, setCultures] = useState<UniverseCulture[]>([]);

  // Yeni Harita Modalı
  const [isCreateMapModalOpen, setIsCreateMapModalOpen] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState('');
  const [newMapDesc, setNewMapDesc] = useState('');
  const [newMapType, setNewMapType] = useState<any>('world');
  const [newMapImageUrl, setNewMapImageUrl] = useState('');
  const [isUploadingMapImage, setIsUploadingMapImage] = useState(false);

  // Modallar
  const [isLinkStoryModalOpen, setIsLinkStoryModalOpen] = useState(false);
  const [isLinkSeriesModalOpen, setIsLinkSeriesModalOpen] = useState(false);
  const [selectedStoryToLink, setSelectedStoryToLink] = useState('');
  const [selectedSeriesToLink, setSelectedSeriesToLink] = useState('');

  // Yeni Mekan Modalı
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState<LocationType>('city');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocClimate, setNewLocClimate] = useState('');
  const [newLocParentId, setNewLocParentId] = useState('');

  // Mekân Defteri 2.0 Detay / Düzenleme Modalı
  const [selectedLocForDetail, setSelectedLocForDetail] = useState<UniverseLocation | null>(null);
  const [isLocDetailModalOpen, setIsLocDetailModalOpen] = useState(false);
  const [locDetailTab, setLocDetailTab] = useState<'basic' | 'geography' | 'society' | 'lore' | 'connections'>('basic');
  const [editingLocData, setEditingLocData] = useState<Partial<UniverseLocation>>({});
  const [isSavingLocDetail, setIsSavingLocDetail] = useState(false);
  const [isUploadingLocImage, setIsUploadingLocImage] = useState(false);

  // Mekân Arama & Filtreleme
  const [locSearchQuery, setLocSearchQuery] = useState('');
  const [locTypeFilter, setLocTypeFilter] = useState<string>('all');

  // Yeni Timeline Olayı Modalı
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventEra, setNewEventEra] = useState('');
  const [newEventSummary, setNewEventSummary] = useState('');
  const [newEventOrder, setNewEventOrder] = useState<number>(1);

  // Yeni Terim Modalı
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [newTermWord, setNewTermWord] = useState('');
  const [newTermMeaning, setNewTermMeaning] = useState('');
  const [newTermCategory, setNewTermCategory] = useState('');

  // Yeni Lore Modalı
  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);
  const [newLoreTitle, setNewLoreTitle] = useState('');
  const [newLoreCategory, setNewLoreCategory] = useState<any>('history');
  const [newLoreContent, setNewLoreContent] = useState('');

  // Yeni Karakter Modalı
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState<any>('protagonist');
  const [newCharOccupation, setNewCharOccupation] = useState('');
  const [newCharMotivation, setNewCharMotivation] = useState('');

  // Karakter Defteri 2.0 Detay / Düzenleme Modalı
  const [selectedCharForDetail, setSelectedCharForDetail] = useState<Character | null>(null);
  const [isCharDetailModalOpen, setIsCharDetailModalOpen] = useState(false);
  const [charDetailTab, setCharDetailTab] = useState<'profile' | 'arc' | 'relationships' | 'iceberg' | 'stats'>('profile');
  const [editingCharData, setEditingCharData] = useState<Partial<Character>>({});
  const [isSavingCharDetail, setIsSavingCharDetail] = useState(false);
  const [isUploadingCharImage, setIsUploadingCharImage] = useState(false);

  // İlişki Ekleme Form State
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState('dost');
  const [relDesc, setRelDesc] = useState('');
  const [relIsSecret, setRelIsSecret] = useState(false);
  const [relSpoilerThreshold, setRelSpoilerThreshold] = useState<string>('');

  // Organizasyon Modalı State
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<UniverseOrganization | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('guild');
  const [orgDesc, setOrgDesc] = useState('');
  const [orgIdeology, setOrgIdeology] = useState('');
  const [orgLeaderId, setOrgLeaderId] = useState('');
  const [orgHeadquarterId, setOrgHeadquarterId] = useState('');
  const [orgSymbolUrl, setOrgSymbolUrl] = useState('');
  const [orgIsSpoiler, setOrgIsSpoiler] = useState(false);
  const [orgSpoilerChapter, setOrgSpoilerChapter] = useState<string>('');
  const [isUploadingOrgSymbol, setIsUploadingOrgSymbol] = useState(false);

  // Eşya Modalı State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UniverseItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Silah');
  const [itemDesc, setItemDesc] = useState('');
  const [itemOrigin, setItemOrigin] = useState('');
  const [itemOwnerId, setItemOwnerId] = useState('');
  const [itemPower, setItemPower] = useState('');
  const [itemLimitation, setItemLimitation] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemIsSpoiler, setItemIsSpoiler] = useState(false);
  const [itemSpoilerChapter, setItemSpoilerChapter] = useState<string>('');
  const [isUploadingItemImage, setIsUploadingItemImage] = useState(false);

  // Güç Sistemi Modalı State
  const [isPowerModalOpen, setIsPowerModalOpen] = useState(false);
  const [editingPower, setEditingPower] = useState<UniversePowerSystem | null>(null);
  const [powerName, setPowerName] = useState('');
  const [powerPrinciples, setPowerPrinciples] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [powerWhoCanUse, setPowerWhoCanUse] = useState('');
  const [powerRules, setPowerRules] = useState('');
  const [powerRisks, setPowerRisks] = useState('');
  const [powerTiersInput, setPowerTiersInput] = useState('');

  // Irk / Tür Modalı State
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<UniverseRace | null>(null);
  const [raceName, setRaceName] = useState('');
  const [raceAlternativeNames, setRaceAlternativeNames] = useState('');
  const [raceOrigin, setRaceOrigin] = useState('');
  const [racePhysicalTraits, setRacePhysicalTraits] = useState('');
  const [raceLifespan, setRaceLifespan] = useState('');
  const [raceBiology, setRaceBiology] = useState('');
  const [raceCulture, setRaceCulture] = useState('');
  const [raceLanguage, setRaceLanguage] = useState('');
  const [raceHomelandId, setRaceHomelandId] = useState('');
  const [raceStrengths, setRaceStrengths] = useState('');
  const [raceWeaknesses, setRaceWeaknesses] = useState('');
  const [raceRelationships, setRaceRelationships] = useState('');
  const [raceHistory, setRaceHistory] = useState('');
  const [raceImageUrl, setRaceImageUrl] = useState('');
  const [raceIsSpoiler, setRaceIsSpoiler] = useState(false);
  const [raceSpoilerChapter, setRaceSpoilerChapter] = useState('');
  const [raceAuthorNotes, setRaceAuthorNotes] = useState('');
  const [isUploadingRaceImage, setIsUploadingRaceImage] = useState(false);

  // Yaratık / Canavar Modalı State
  const [isCreatureModalOpen, setIsCreatureModalOpen] = useState(false);
  const [editingCreature, setEditingCreature] = useState<UniverseCreature | null>(null);
  const [creatureName, setCreatureName] = useState('');
  const [creatureType, setCreatureType] = useState<CreatureType>('monster');
  const [creatureDangerLevel, setCreatureDangerLevel] = useState<CreatureDangerLevel>('medium');
  const [creatureAppearance, setCreatureAppearance] = useState('');
  const [creatureBehavior, setCreatureBehavior] = useState('');
  const [creatureHabitatId, setCreatureHabitatId] = useState('');
  const [creatureDiet, setCreatureDiet] = useState('');
  const [creatureAbilities, setCreatureAbilities] = useState('');
  const [creatureWeaknesses, setCreatureWeaknesses] = useState('');
  const [creatureDrops, setCreatureDrops] = useState('');
  const [creatureLore, setCreatureLore] = useState('');
  const [creatureImageUrl, setCreatureImageUrl] = useState('');
  const [creatureIsSpoiler, setCreatureIsSpoiler] = useState(false);
  const [creatureSpoilerChapter, setCreatureSpoilerChapter] = useState('');
  const [creatureAuthorNotes, setCreatureAuthorNotes] = useState('');
  const [isUploadingCreatureImage, setIsUploadingCreatureImage] = useState(false);

  // Kültür, İnanç & Dünya Düzeni Modalı State
  const [isCultureModalOpen, setIsCultureModalOpen] = useState(false);
  const [editingCulture, setEditingCulture] = useState<UniverseCulture | null>(null);
  const [cultureName, setCultureName] = useState('');
  const [cultureCategory, setCultureCategory] = useState<CultureCategory>('culture');
  const [cultureDesc, setCultureDesc] = useState('');
  const [cultureAssociatedRaces, setCultureAssociatedRaces] = useState('');
  const [cultureAssociatedRegions, setCultureAssociatedRegions] = useState('');
  const [cultureTraditions, setCultureTraditions] = useState('');
  const [cultureValuesTaboos, setCultureValuesTaboos] = useState('');
  const [cultureDeities, setCultureDeities] = useState('');
  const [cultureSacredPlaces, setCultureSacredPlaces] = useState('');
  const [cultureCreationMyth, setCultureCreationMyth] = useState('');
  const [cultureGovernment, setCultureGovernment] = useState('');
  const [cultureLaws, setCultureLaws] = useState('');
  const [cultureCurrency, setCultureCurrency] = useState('');
  const [cultureSocialClasses, setCultureSocialClasses] = useState('');
  const [cultureImageUrl, setCultureImageUrl] = useState('');
  const [cultureIsSpoiler, setCultureIsSpoiler] = useState(false);
  const [cultureSpoilerChapter, setCultureSpoilerChapter] = useState('');
  const [cultureAuthorNotes, setCultureAuthorNotes] = useState('');
  const [isUploadingCultureImage, setIsUploadingCultureImage] = useState(false);

  // Medya & Moodboard Modalı State (PRD 46)
  const [mediaList, setMediaList] = useState<UniverseMedia[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<UniverseMedia | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaImageUrl, setMediaImageUrl] = useState('');
  const [mediaCategory, setMediaCategory] = useState<MediaCategory>('character');
  const [mediaDesc, setMediaDesc] = useState('');
  const [mediaTagsInput, setMediaTagsInput] = useState('');
  const [mediaColorPaletteInput, setMediaColorPaletteInput] = useState('');
  const [mediaIsAuthorOnly, setMediaIsAuthorOnly] = useState(false);
  const [mediaIsSpoiler, setMediaIsSpoiler] = useState(false);
  const [mediaSpoilerChapter, setMediaSpoilerChapter] = useState('');
  const [mediaAuthorNotes, setMediaAuthorNotes] = useState('');
  const [isUploadingMediaImage, setIsUploadingMediaImage] = useState(false);

  // Müzik & Soundtrack Modalı State (PRD 29)
  const [soundtracks, setSoundtracks] = useState<UniverseSoundtrack[]>([]);
  const [isSoundtrackModalOpen, setIsSoundtrackModalOpen] = useState(false);
  const [editingSoundtrack, setEditingSoundtrack] = useState<UniverseSoundtrack | null>(null);
  const [soundtrackTitle, setSoundtrackTitle] = useState('');
  const [soundtrackArtist, setSoundtrackArtist] = useState('');
  const [soundtrackUrl, setSoundtrackUrl] = useState('');
  const [soundtrackTheme, setSoundtrackTheme] = useState<SoundtrackTheme>('main_theme');
  const [soundtrackDesc, setSoundtrackDesc] = useState('');
  const [soundtrackLocation, setSoundtrackLocation] = useState('');
  const [soundtrackCharacter, setSoundtrackCharacter] = useState('');
  const [soundtrackIsSpoiler, setSoundtrackIsSpoiler] = useState(false);
  const [soundtrackSpoilerChapter, setSoundtrackSpoilerChapter] = useState('');
  const [soundtrackAuthorNotes, setSoundtrackAuthorNotes] = useState('');

  // Seri Bible & Canon Kuralları State (PRD 30)
  const [canonRules, setCanonRules] = useState<UniverseCanonRule[]>([]);
  const [isCanonModalOpen, setIsCanonModalOpen] = useState(false);
  const [editingCanonRule, setEditingCanonRule] = useState<UniverseCanonRule | null>(null);
  const [canonTitle, setCanonTitle] = useState('');
  const [canonCategory, setCanonCategory] = useState<CanonRuleCategory>('magic_system');
  const [canonRuleDesc, setCanonRuleDesc] = useState('');
  const [canonConsequences, setCanonConsequences] = useState('');
  const [canonExceptions, setCanonExceptions] = useState('');
  const [canonIsStrict, setCanonIsStrict] = useState(true);
  const [canonIsPublic, setCanonIsPublic] = useState(true);
  const [canonIsSpoiler, setCanonIsSpoiler] = useState(false);
  const [canonSpoilerChapter, setCanonSpoilerChapter] = useState('');
  const [canonAuthorNotes, setCanonAuthorNotes] = useState('');
  const [canonCategoryFilter, setCanonCategoryFilter] = useState<string>('all');

  // Açık Kurgu Düğümleri & Gizemler State (PRD 31)
  const [plotThreads, setPlotThreads] = useState<UniversePlotThread[]>([]);
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<UniversePlotThread | null>(null);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadDesc, setThreadDesc] = useState('');
  const [threadStatus, setThreadStatus] = useState<PlotThreadStatus>('open');
  const [threadImportance, setThreadImportance] = useState<PlotThreadImportance>('major');
  const [threadIntroStory, setThreadIntroStory] = useState('');
  const [threadIntroChapter, setThreadIntroChapter] = useState('');
  const [threadResolvedStory, setThreadResolvedStory] = useState('');
  const [threadResolvedChapter, setThreadResolvedChapter] = useState('');
  const [threadResolutionSummary, setThreadResolutionSummary] = useState('');
  const [threadIsSpoiler, setThreadIsSpoiler] = useState(false);
  const [threadSpoilerChapter, setThreadSpoilerChapter] = useState('');
  const [threadIsPublic, setThreadIsPublic] = useState(false);
  const [threadAuthorNotes, setThreadAuthorNotes] = useState('');
  const [threadStatusFilter, setThreadStatusFilter] = useState<string>('all');

  // İpucu Ekleme Modalı State
  const [isAddClueModalOpen, setIsAddClueModalOpen] = useState(false);
  const [clueThreadId, setClueThreadId] = useState<string | null>(null);
  const [clueNote, setClueNote] = useState('');
  const [clueChapterOrder, setClueChapterOrder] = useState('');
  const [clueStoryTitle, setClueStoryTitle] = useState('');

  // Ekip & İzinler (PRD 32 & 66)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUserToInvite, setSelectedUserToInvite] = useState<any | null>(null);
  const [selectedInviteRole, setSelectedInviteRole] = useState<UniverseMemberRole>('co_author');
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [updatingMemberUserId, setUpdatingMemberUserId] = useState<string | null>(null);

  // Rol ve İzin Kontrolleri
  const currentUserRole = useMemo(() => {
    return getUserUniverseRole(universe, firebaseUser?.uid);
  }, [universe, firebaseUser?.uid]);

  const isOwner = currentUserRole === 'owner';
  const canManageMembers = useMemo(() => {
    return canManageUniverseMembers(universe, firebaseUser?.uid);
  }, [universe, firebaseUser?.uid]);

  const canEditLore = useMemo(() => {
    return canEditUniverseLore(universe, firebaseUser?.uid);
  }, [universe, firebaseUser?.uid]);

  // Kullanıcı Arama Debounce (Canlı Arama)
  useEffect(() => {
    if (!memberSearchQuery.trim() || memberSearchQuery.trim().length < 2) {
      setMemberSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const results = await searchUsersByQuery(memberSearchQuery.trim(), 6);
        const existingIds = new Set([
          universe?.authorId,
          ...(universe?.members?.map((m) => m.userId) || [])
        ]);
        setMemberSearchResults(results.filter((u) => !existingIds.has(u.uid)));
      } catch (err) {
        console.error('Kullanıcı arama hatası:', err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [memberSearchQuery, universe]);

  useEffect(() => {
    if (!universeId || !firebaseUser) return;
    loadAllData();
  }, [universeId, firebaseUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const u = await getUniverseById(universeId);
      if (!u) {
        toast.error('Evren bulunamadı.');
        router.push('/studio/universes');
        return;
      }

      setUniverse(u);
      setTitle(u.title || '');
      setDescription(u.description || '');
      setCoverImage(u.coverImage || '');
      setGenre(u.genre || 'fantasy');
      setVisibility(u.visibility || 'draft');

      // Bağlı hikayeleri yükle
      if (u.connectedStoryIds && u.connectedStoryIds.length > 0) {
        const sPromises = u.connectedStoryIds.map((id) => getStoryById(id));
        const sRes = await Promise.all(sPromises);
        setConnectedStories(sRes.filter(Boolean) as Story[]);
      } else {
        setConnectedStories([]);
      }

      // Bağlı serileri yükle
      if (u.connectedSeriesIds && u.connectedSeriesIds.length > 0) {
        const serPromises = u.connectedSeriesIds.map((id) => getSeriesById(id));
        const serRes = await Promise.all(serPromises);
        setConnectedSeries(serRes.filter(Boolean) as Series[]);
      } else {
        setConnectedSeries([]);
      }

      // Modül verilerini paralel çek
      const [
        locs, 
        events, 
        terms, 
        lores, 
        chars, 
        mapList, 
        orgList, 
        itemList, 
        powerList, 
        raceList, 
        creatureList, 
        cultureList,
        mediaRes,
        soundtrackRes,
        canonRes,
        threadsRes
      ] = await Promise.all([
        getUniverseLocations(universeId),
        getUniverseTimelineEvents(universeId),
        getUniverseGlossary(universeId),
        getUniverseLoreList(universeId),
        getUniverseCharacters(universeId),
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

      setLocations(locs);
      setTimelineEvents(events);
      setGlossaryTerms(terms);
      setLoreList(lores);
      setCharacters(chars);
      setMaps(mapList);
      setOrganizations(orgList);
      setItems(itemList);
      setPowerSystems(powerList);
      setRaces(raceList);
      setCreatures(creatureList);
      setCultures(cultureList);
      setMediaList(mediaRes);
      setSoundtracks(soundtrackRes);
      setCanonRules(canonRes);
      setPlotThreads(threadsRes);
      if (mapList.length > 0 && !selectedMapId) {
        setSelectedMapId(mapList[0].id);
      }

      // Yazarın diğer hikayelerini ve serilerini al
      if (firebaseUser) {
        const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (stories) => {
          setAuthorStories(stories);
        });
        const serList = await getSeriesByAuthorId(firebaseUser.uid);
        setAuthorSeries(serList);
      }

      // Yazar Akademisi Köprüsü (PRD Bölüm 53)
      const paramTab = searchParams.get('tab');
      const paramAction = searchParams.get('action');
      const paramSubTab = searchParams.get('subTab');

      if (paramTab) {
        setActiveTab(paramTab as ActiveUniverseTab);
        if (paramAction === 'new') {
          setTimeout(() => {
            if (paramTab === 'powers') {
              openCreatePowerModal();
            } else if (paramTab === 'canon_rules') {
              openCreateCanonModal();
            } else if (paramTab === 'plot_threads') {
              openCreateThreadModal();
            } else if (paramTab === 'characters') {
              if (paramSubTab === 'arc' && chars.length > 0) {
                openCharDetail(chars[0]);
                setCharDetailTab('arc');
              } else {
                setIsCharModalOpen(true);
              }
            }
          }, 150);
        }
      }
    } catch (error) {
      console.error('Evren veri yükleme hatası:', error);
      toast.error('Evren detayları alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  // Genel Bilgileri Kaydet
  const handleSaveOverview = async () => {
    if (!title.trim()) {
      toast.error('Evren adı boş olamaz.');
      return;
    }

    setSaving(true);
    try {
      await updateUniverse(universeId, {
        title: title.trim(),
        description: description.trim(),
        coverImage,
        genre,
        visibility,
      });
      setUniverse((prev) => prev ? ({
        ...prev,
        title: title.trim(),
        description: description.trim(),
        coverImage,
        genre,
        visibility,
      }) : prev);
      toast.success('Evren bilgileri güncellendi.');
    } catch (error: any) {
      console.error('Evren güncelleme hatası:', error);
      toast.error(error?.message || 'Güncelleme kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  // Hızlı Yayına Al / Taslağa Çek
  const handleTogglePublish = async () => {
    const nextVisibility: UniverseVisibility = visibility === 'public' ? 'draft' : 'public';
    setSaving(true);
    try {
      await updateUniverse(universeId, {
        visibility: nextVisibility,
      });
      setVisibility(nextVisibility);
      setUniverse((prev) => prev ? ({ ...prev, visibility: nextVisibility }) : prev);
      if (nextVisibility === 'public') {
        toast.success('🚀 Evren başarıyla yayınlandı! Artık okurlar ve keşfet atlası bu evrene erişebilir.');
      } else {
        toast.success('📝 Evren taslağa alındı. Yalnızca siz ve ekibiniz görüntüleyebilir.');
      }
    } catch (error: any) {
      console.error('Görünürlük değiştirme hatası:', error);
      toast.error(error?.message || 'Görünürlük güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  // Kapak Resmi Yükle (WebP sıkıştırmalı)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    setCoverUploading(true);
    try {
      const compressed = await compressToWebP(file, 1600, 1600, 0.85);
      const path = `universes/${universeId}/cover_${Date.now()}.webp`;
      const url = await uploadFile(compressed, path);
      setCoverImage(url);
      await updateUniverse(universeId, { coverImage: url });
      toast.success('Kapak görseli WebP formatında optimize edilerek yüklendi.');
    } catch (error: any) {
      console.error('Kapak yükleme hatası:', error);
      toast.error(error?.message || 'Kapak yüklenemedi.');
    } finally {
      setCoverUploading(false);
    }
  };

  // Eser Bağla / Ayır
  const handleLinkStory = async () => {
    if (!selectedStoryToLink) return;
    try {
      await linkStoryToUniverse(universeId, selectedStoryToLink);
      toast.success('Eser evrene bağlandı.');
      setIsLinkStoryModalOpen(false);
      setSelectedStoryToLink('');
      await loadAllData();
    } catch (error: any) {
      console.error('Eser bağlama hatası:', error);
      toast.error(error?.message || 'Eser bağlanamadı.');
    }
  };

  const handleUnlinkStory = async (storyId: string) => {
    try {
      await unlinkStoryFromUniverse(universeId, storyId);
      toast.success('Eser evrenden ayrıldı.');
      await loadAllData();
    } catch (error: any) {
      console.error('Eser ayırma hatası:', error);
      toast.error(error?.message || 'İşlem başarısız.');
    }
  };

  // Seri Bağla / Ayır
  const handleLinkSeries = async () => {
    if (!selectedSeriesToLink) return;
    try {
      await linkSeriesToUniverse(universeId, selectedSeriesToLink);
      toast.success('Seri evrene bağlandı.');
      setIsLinkSeriesModalOpen(false);
      setSelectedSeriesToLink('');
      await loadAllData();
    } catch (error: any) {
      console.error('Seri bağlama hatası:', error);
      toast.error(error?.message || 'Seri bağlanamadı.');
    }
  };

  const handleUnlinkSeries = async (seriesId: string) => {
    try {
      await unlinkSeriesFromUniverse(universeId, seriesId);
      toast.success('Seri evrenden ayrıldı.');
      await loadAllData();
    } catch (error: any) {
      console.error('Seri ayırma hatası:', error);
      toast.error(error?.message || 'İşlem başarısız.');
    }
  };

  // Yeni Mekan Ekle / Sil & Mekân Defteri 2.0
  const handleCreateLocation = async () => {
    if (!newLocName.trim()) {
      toast.error('Mekân adı gerekli.');
      return;
    }
    try {
      await createUniverseLocation(universeId, {
        name: newLocName.trim(),
        type: newLocType,
        description: newLocDesc.trim(),
        climate: newLocClimate.trim(),
        parentLocationId: newLocParentId || undefined,
      });
      toast.success('Mekân eklendi.');
      setIsLocationModalOpen(false);
      setNewLocName('');
      setNewLocDesc('');
      setNewLocClimate('');
      setNewLocParentId('');
      setLocations(await getUniverseLocations(universeId));
    } catch (error: any) {
      console.error('Mekân oluşturma hatası:', error);
      toast.error(error?.message || 'Mekân oluşturulamadı.');
    }
  };

  const openLocationDetail = (loc: UniverseLocation) => {
    setSelectedLocForDetail(loc);
    setEditingLocData({
      ...loc,
      importantCharacterIds: loc.importantCharacterIds || [],
      relatedEventIds: loc.relatedEventIds || [],
      relatedOrganizationIds: loc.relatedOrganizationIds || [],
    });
    setLocDetailTab('basic');
    setIsLocDetailModalOpen(true);
  };

  const handleSaveLocationDetail = async () => {
    if (!selectedLocForDetail) return;
    setIsSavingLocDetail(true);
    try {
      await updateUniverseLocation(universeId, selectedLocForDetail.id, editingLocData);
      toast.success('Mekân Defteri 2.0 güncellendi!');
      setLocations(await getUniverseLocations(universeId));
      setIsLocDetailModalOpen(false);
      setSelectedLocForDetail(null);
    } catch (error: any) {
      console.error('Mekân güncelleme hatası:', error);
      toast.error(error?.message || 'Güncelleme kaydedilemedi.');
    } finally {
      setIsSavingLocDetail(false);
    }
  };

  const handleLocImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLocForDetail) return;
    setIsUploadingLocImage(true);
    try {
      const compressed = await compressToWebP(file, 1600, 1000, 0.85);
      const path = `universes/${universeId}/locations/${selectedLocForDetail.id}/cover_${Date.now()}.webp`;
      const url = await uploadFile(compressed, path);
      setEditingLocData((prev) => ({ ...prev, imageUrl: url }));
      toast.success('Mekân görseli WebP formatında optimize edildi ve yüklendi.');
    } catch (err: any) {
      toast.error('Mekân görseli yüklenemedi.');
    } finally {
      setIsUploadingLocImage(false);
    }
  };

  const handleRemoveLocImage = () => {
    setEditingLocData((prev) => ({ ...prev, imageUrl: undefined }));
    toast.info('Görsel kaldırıldı. Değişikliği kaydetmeyi unutmayın.');
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Bu mekânı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseLocation(universeId, id);
      setLocations(await getUniverseLocations(universeId));
      toast.success('Mekân silindi.');
    } catch (error: any) {
      console.error('Mekân silme hatası:', error);
      toast.error(error?.message || 'Mekân silinemedi.');
    }
  };

  // Yeni Olay Ekle / Sil
  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) {
      toast.error('Olay başlığı gerekli.');
      return;
    }
    try {
      await createUniverseTimelineEvent(universeId, {
        title: newEventTitle.trim(),
        era: newEventEra.trim(),
        summary: newEventSummary.trim(),
        chronologicalOrder: Number(newEventOrder) || 1,
      });
      toast.success('Olay zaman çizelgesine eklendi.');
      setIsEventModalOpen(false);
      setNewEventTitle('');
      setNewEventEra('');
      setNewEventSummary('');
      setTimelineEvents(await getUniverseTimelineEvents(universeId));
    } catch (error: any) {
      console.error('Olay ekleme hatası:', error);
      toast.error(error?.message || 'Olay eklenemedi.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Bu olayı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseTimelineEvent(universeId, id);
      setTimelineEvents(await getUniverseTimelineEvents(universeId));
      toast.success('Olay silindi.');
    } catch (error: any) {
      console.error('Olay silme hatası:', error);
      toast.error(error?.message || 'Olay silinemedi.');
    }
  };

  // Yeni Terim Ekle / Sil
  const handleCreateTerm = async () => {
    if (!newTermWord.trim() || !newTermMeaning.trim()) {
      toast.error('Terim ve anlamı gereklidir.');
      return;
    }
    try {
      await createUniverseGlossaryTerm(universeId, {
        term: newTermWord.trim(),
        meaning: newTermMeaning.trim(),
        category: newTermCategory.trim(),
      });
      toast.success('Sözlük terimi eklendi.');
      setIsTermModalOpen(false);
      setNewTermWord('');
      setNewTermMeaning('');
      setNewTermCategory('');
      setGlossaryTerms(await getUniverseGlossary(universeId));
    } catch (error: any) {
      console.error('Terim ekleme hatası:', error);
      toast.error(error?.message || 'Terim eklenemedi.');
    }
  };

  const handleDeleteTerm = async (id: string) => {
    if (!window.confirm('Bu terimi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseGlossaryTerm(universeId, id);
      setGlossaryTerms(await getUniverseGlossary(universeId));
      toast.success('Terim silindi.');
    } catch (error: any) {
      console.error('Terim silme hatası:', error);
      toast.error(error?.message || 'Terim silinemedi.');
    }
  };

  // Yeni Lore Ekle / Sil
  const handleCreateLore = async () => {
    if (!newLoreTitle.trim() || !newLoreContent.trim()) {
      toast.error('Başlık ve içerik gereklidir.');
      return;
    }
    try {
      await createUniverseLore(universeId, {
        title: newLoreTitle.trim(),
        category: newLoreCategory,
        content: newLoreContent.trim(),
      });
      toast.success('Lore kaydı eklendi.');
      setIsLoreModalOpen(false);
      setNewLoreTitle('');
      setNewLoreContent('');
      setLoreList(await getUniverseLoreList(universeId));
    } catch (error: any) {
      console.error('Lore ekleme hatası:', error);
      toast.error(error?.message || 'Lore eklenemedi.');
    }
  };

  const handleDeleteLore = async (id: string) => {
    if (!window.confirm('Bu lore kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseLore(universeId, id);
      setLoreList(await getUniverseLoreList(universeId));
      toast.success('Lore silindi.');
    } catch (error: any) {
      console.error('Lore silme hatası:', error);
      toast.error(error?.message || 'Lore silinemedi.');
    }
  };

  // ── Organizasyon İşlemleri ──
  const openCreateOrgModal = () => {
    setEditingOrg(null);
    setOrgName('');
    setOrgType('guild');
    setOrgDesc('');
    setOrgIdeology('');
    setOrgLeaderId('');
    setOrgHeadquarterId('');
    setOrgSymbolUrl('');
    setOrgIsSpoiler(false);
    setOrgSpoilerChapter('');
    setIsOrgModalOpen(true);
  };

  const openEditOrgModal = (org: UniverseOrganization) => {
    setEditingOrg(org);
    setOrgName(org.name);
    setOrgType(org.type);
    setOrgDesc(org.description || '');
    setOrgIdeology(org.ideology || '');
    setOrgLeaderId(org.leaderCharacterId || '');
    setOrgHeadquarterId(org.headquarterLocationId || '');
    setOrgSymbolUrl(org.symbolUrl || '');
    setOrgIsSpoiler(!!org.isSpoiler);
    setOrgSpoilerChapter(org.spoilerThresholdChapter ? String(org.spoilerThresholdChapter) : '');
    setIsOrgModalOpen(true);
  };

  const handleSaveOrg = async () => {
    if (!orgName.trim()) {
      toast.error('Organizasyon adı gerekli.');
      return;
    }
    try {
      const data: Partial<UniverseOrganization> = {
        name: orgName.trim(),
        type: orgType,
        description: orgDesc.trim(),
        ideology: orgIdeology.trim(),
        leaderCharacterId: orgLeaderId || undefined,
        headquarterLocationId: orgHeadquarterId || undefined,
        symbolUrl: orgSymbolUrl.trim() || undefined,
        isSpoiler: orgIsSpoiler,
        spoilerThresholdChapter: orgSpoilerChapter ? Number(orgSpoilerChapter) : undefined,
      };

      if (editingOrg) {
        await updateUniverseOrganization(universeId, editingOrg.id, data);
        toast.success('Organizasyon güncellendi.');
      } else {
        await createUniverseOrganization(universeId, data);
        toast.success('Organizasyon oluşturuldu.');
      }
      setIsOrgModalOpen(false);
      setOrganizations(await getUniverseOrganizations(universeId));
    } catch (err: any) {
      console.error(err);
      toast.error('Organizasyon kaydedilemedi.');
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!window.confirm('Bu organizasyonu silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseOrganization(universeId, id);
      toast.success('Organizasyon silindi.');
      setOrganizations(await getUniverseOrganizations(universeId));
    } catch (err) {
      toast.error('Organizasyon silinemedi.');
    }
  };

  const handleUploadOrgSymbol = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingOrgSymbol(true);
    try {
      const url = await uploadFile(file, `universes/${universeId}/orgs/${Date.now()}_${file.name}`);
      setOrgSymbolUrl(url);
      toast.success('Organizasyon arması yüklendi.');
    } catch (err) {
      toast.error('Arma yüklenemedi.');
    } finally {
      setIsUploadingOrgSymbol(false);
    }
  };

  // ── Eşya & Artefakt İşlemleri ──
  const openCreateItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemType('Silah');
    setItemDesc('');
    setItemOrigin('');
    setItemOwnerId('');
    setItemPower('');
    setItemLimitation('');
    setItemImageUrl('');
    setItemIsSpoiler(false);
    setItemSpoilerChapter('');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: UniverseItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemType(item.type || 'Silah');
    setItemDesc(item.description || '');
    setItemOrigin(item.origin || '');
    setItemOwnerId(item.currentOwnerId || '');
    setItemPower(item.powerDescription || '');
    setItemLimitation(item.limitation || '');
    setItemImageUrl(item.imageUrl || '');
    setItemIsSpoiler(!!item.isSpoiler);
    setItemSpoilerChapter(item.spoilerThresholdChapter ? String(item.spoilerThresholdChapter) : '');
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      toast.error('Eşya adı gerekli.');
      return;
    }
    try {
      const data: Partial<UniverseItem> = {
        name: itemName.trim(),
        type: itemType.trim(),
        description: itemDesc.trim(),
        origin: itemOrigin.trim(),
        currentOwnerId: itemOwnerId || undefined,
        powerDescription: itemPower.trim(),
        limitation: itemLimitation.trim(),
        imageUrl: itemImageUrl.trim() || undefined,
        isSpoiler: itemIsSpoiler,
        spoilerThresholdChapter: itemSpoilerChapter ? Number(itemSpoilerChapter) : undefined,
      };

      if (editingItem) {
        await updateUniverseItem(universeId, editingItem.id, data);
        toast.success('Eşya güncellendi.');
      } else {
        await createUniverseItem(universeId, data);
        toast.success('Eşya eklendi.');
      }
      setIsItemModalOpen(false);
      setItems(await getUniverseItems(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Eşya kaydedilemedi.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Bu eşyayı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseItem(universeId, id);
      toast.success('Eşya silindi.');
      setItems(await getUniverseItems(universeId));
    } catch (err) {
      toast.error('Eşya silinemedi.');
    }
  };

  const handleUploadItemImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingItemImage(true);
    try {
      const url = await uploadFile(file, `universes/${universeId}/items/${Date.now()}_${file.name}`);
      setItemImageUrl(url);
      toast.success('Eşya görseli yüklendi.');
    } catch (err) {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingItemImage(false);
    }
  };

  // ── Güç Sistemleri İşlemleri ──
  const openCreatePowerModal = () => {
    setEditingPower(null);
    setPowerName('');
    setPowerPrinciples('');
    setPowerSource('');
    setPowerWhoCanUse('');
    setPowerRules('');
    setPowerRisks('');
    setPowerTiersInput('');
    setIsPowerModalOpen(true);
  };

  const openEditPowerModal = (p: UniversePowerSystem) => {
    setEditingPower(p);
    setPowerName(p.name);
    setPowerPrinciples(p.corePrinciples || '');
    setPowerSource(p.source || '');
    setPowerWhoCanUse(p.whoCanUse || '');
    setPowerRules(p.rulesAndLimits || '');
    setPowerRisks(p.costAndRisks || '');
    setPowerTiersInput((p.levelsOrTiers || []).join('\n'));
    setIsPowerModalOpen(true);
  };

  const handleSavePower = async () => {
    if (!powerName.trim()) {
      toast.error('Güç sistemi adı gerekli.');
      return;
    }
    try {
      const tiers = powerTiersInput
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const data: Partial<UniversePowerSystem> = {
        name: powerName.trim(),
        corePrinciples: powerPrinciples.trim(),
        source: powerSource.trim(),
        whoCanUse: powerWhoCanUse.trim(),
        rulesAndLimits: powerRules.trim(),
        costAndRisks: powerRisks.trim(),
        levelsOrTiers: tiers,
      };

      if (editingPower) {
        await updateUniversePowerSystem(universeId, editingPower.id, data);
        toast.success('Güç sistemi güncellendi.');
      } else {
        await createUniversePowerSystem(universeId, data);
        toast.success('Güç sistemi oluşturuldu.');
      }
      setIsPowerModalOpen(false);
      setPowerSystems(await getUniversePowerSystems(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Güç sistemi kaydedilemedi.');
    }
  };

  const handleDeletePower = async (id: string) => {
    if (!window.confirm('Bu güç sistemini silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniversePowerSystem(universeId, id);
      toast.success('Güç sistemi silindi.');
      setPowerSystems(await getUniversePowerSystems(universeId));
    } catch (err) {
      toast.error('Güç sistemi silinemedi.');
    }
  };

  // ── Irk / Tür İşlemleri ──
  const openCreateRaceModal = () => {
    setEditingRace(null);
    setRaceName('');
    setRaceAlternativeNames('');
    setRaceOrigin('');
    setRacePhysicalTraits('');
    setRaceLifespan('');
    setRaceBiology('');
    setRaceCulture('');
    setRaceLanguage('');
    setRaceHomelandId('');
    setRaceStrengths('');
    setRaceWeaknesses('');
    setRaceRelationships('');
    setRaceHistory('');
    setRaceImageUrl('');
    setRaceIsSpoiler(false);
    setRaceSpoilerChapter('');
    setRaceAuthorNotes('');
    setIsRaceModalOpen(true);
  };

  const openEditRaceModal = (r: UniverseRace) => {
    setEditingRace(r);
    setRaceName(r.name);
    setRaceAlternativeNames(r.alternativeNames || (Array.isArray(r.altNames) ? r.altNames.join(', ') : ''));
    setRaceOrigin(r.origin || '');
    setRacePhysicalTraits(r.physicalTraits || '');
    setRaceLifespan(r.lifespan || '');
    setRaceBiology(r.biology || '');
    setRaceCulture(r.culture || '');
    setRaceLanguage(r.language || '');
    setRaceHomelandId(r.homelandRegionId || '');
    setRaceStrengths(Array.isArray(r.strengths) ? r.strengths.join(', ') : (r.strengths || ''));
    setRaceWeaknesses(Array.isArray(r.weaknesses) ? r.weaknesses.join(', ') : (r.weaknesses || ''));
    setRaceRelationships(r.relationshipsWithOtherRaces || '');
    setRaceHistory(r.history || '');
    setRaceImageUrl(r.imageUrl || '');
    setRaceIsSpoiler(!!r.isSpoiler);
    setRaceSpoilerChapter(r.spoilerThresholdChapter ? String(r.spoilerThresholdChapter) : '');
    setRaceAuthorNotes(r.authorNotes || '');
    setIsRaceModalOpen(true);
  };

  const handleSaveRace = async () => {
    if (!raceName.trim()) {
      toast.error('Irk / Tür adı gereklidir.');
      return;
    }
    try {
      const homeland = locations.find((l) => l.id === raceHomelandId);
      const data: Partial<UniverseRace> = {
        name: raceName.trim(),
        alternativeNames: raceAlternativeNames.trim(),
        origin: raceOrigin.trim(),
        physicalTraits: racePhysicalTraits.trim(),
        lifespan: raceLifespan.trim(),
        biology: raceBiology.trim(),
        culture: raceCulture.trim(),
        language: raceLanguage.trim(),
        homelandRegionId: raceHomelandId || undefined,
        homelandRegionName: homeland?.name || undefined,
        strengths: raceStrengths.trim(),
        weaknesses: raceWeaknesses.trim(),
        relationshipsWithOtherRaces: raceRelationships.trim(),
        history: raceHistory.trim(),
        imageUrl: raceImageUrl.trim() || undefined,
        isSpoiler: raceIsSpoiler,
        spoilerThresholdChapter: raceSpoilerChapter ? Number(raceSpoilerChapter) : undefined,
        authorNotes: raceAuthorNotes.trim() || undefined,
      };

      if (editingRace) {
        await updateUniverseRace(universeId, editingRace.id, data);
        toast.success('Irk / Tür güncellendi.');
      } else {
        await createUniverseRace(universeId, data);
        toast.success('Irk / Tür eklendi.');
      }
      setIsRaceModalOpen(false);
      setRaces(await getUniverseRaces(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Irk kaydedilemedi.');
    }
  };

  const handleDeleteRace = async (id: string) => {
    if (!window.confirm('Bu ırkı / türü silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseRace(universeId, id);
      toast.success('Irk silindi.');
      setRaces(await getUniverseRaces(universeId));
    } catch (err) {
      toast.error('Irk silinemedi.');
    }
  };

  const handleUploadRaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingRaceImage(true);
    try {
      const compressed = await compressToWebP(file, 1200, 1200, 0.85);
      const url = await uploadFile(compressed, `universes/${universeId}/races/${Date.now()}.webp`);
      setRaceImageUrl(url);
      toast.success('Irk görseli WebP formatında optimize edilerek yüklendi.');
    } catch (err) {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingRaceImage(false);
    }
  };

  // ── Yaratık / Canavar İşlemleri ──
  const openCreateCreatureModal = () => {
    setEditingCreature(null);
    setCreatureName('');
    setCreatureType('monster');
    setCreatureDangerLevel('medium');
    setCreatureAppearance('');
    setCreatureBehavior('');
    setCreatureHabitatId('');
    setCreatureDiet('');
    setCreatureAbilities('');
    setCreatureWeaknesses('');
    setCreatureDrops('');
    setCreatureLore('');
    setCreatureImageUrl('');
    setCreatureIsSpoiler(false);
    setCreatureSpoilerChapter('');
    setCreatureAuthorNotes('');
    setIsCreatureModalOpen(true);
  };

  const openEditCreatureModal = (c: UniverseCreature) => {
    setEditingCreature(c);
    setCreatureName(c.name);
    setCreatureType((c.type || c.creatureType || 'monster') as any);
    setCreatureDangerLevel(c.dangerLevel || 'medium');
    setCreatureAppearance(c.appearance || '');
    setCreatureBehavior(c.behavior || '');
    setCreatureHabitatId(c.habitatLocationId || '');
    setCreatureDiet(c.diet || '');
    setCreatureAbilities(Array.isArray(c.abilities) ? c.abilities.join(', ') : (c.abilities || ''));
    setCreatureWeaknesses(Array.isArray(c.weaknesses) ? c.weaknesses.join(', ') : (c.weaknesses || ''));
    setCreatureDrops(Array.isArray(c.dropsOrMaterials) ? c.dropsOrMaterials.join(', ') : (c.dropsOrMaterials || (Array.isArray(c.dropMaterials) ? c.dropMaterials.join(', ') : '')));
    setCreatureLore(c.lore || '');
    setCreatureImageUrl(c.imageUrl || '');
    setCreatureIsSpoiler(!!c.isSpoiler);
    setCreatureSpoilerChapter(c.spoilerThresholdChapter ? String(c.spoilerThresholdChapter) : '');
    setCreatureAuthorNotes(c.authorNotes || '');
    setIsCreatureModalOpen(true);
  };

  const handleSaveCreature = async () => {
    if (!creatureName.trim()) {
      toast.error('Yaratık adı gereklidir.');
      return;
    }
    try {
      const habitat = locations.find((l) => l.id === creatureHabitatId);
      const data: Partial<UniverseCreature> = {
        name: creatureName.trim(),
        type: creatureType,
        dangerLevel: creatureDangerLevel,
        appearance: creatureAppearance.trim(),
        behavior: creatureBehavior.trim(),
        habitatLocationId: creatureHabitatId || undefined,
        habitatLocationName: habitat?.name || undefined,
        diet: creatureDiet.trim(),
        abilities: creatureAbilities.trim(),
        weaknesses: creatureWeaknesses.trim(),
        dropsOrMaterials: creatureDrops.trim(),
        lore: creatureLore.trim(),
        imageUrl: creatureImageUrl.trim() || undefined,
        isSpoiler: creatureIsSpoiler,
        spoilerThresholdChapter: creatureSpoilerChapter ? Number(creatureSpoilerChapter) : undefined,
        authorNotes: creatureAuthorNotes.trim() || undefined,
      };

      if (editingCreature) {
        await updateUniverseCreature(universeId, editingCreature.id, data);
        toast.success('Yaratık güncellendi.');
      } else {
        await createUniverseCreature(universeId, data);
        toast.success('Yaratık eklendi.');
      }
      setIsCreatureModalOpen(false);
      setCreatures(await getUniverseCreatures(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Yaratık kaydedilemedi.');
    }
  };

  const handleDeleteCreature = async (id: string) => {
    if (!window.confirm('Bu yaratığı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseCreature(universeId, id);
      toast.success('Yaratık silindi.');
      setCreatures(await getUniverseCreatures(universeId));
    } catch (err) {
      toast.error('Yaratık silinemedi.');
    }
  };

  const handleUploadCreatureImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingCreatureImage(true);
    try {
      const compressed = await compressToWebP(file, 1200, 1200, 0.85);
      const url = await uploadFile(compressed, `universes/${universeId}/creatures/${Date.now()}.webp`);
      setCreatureImageUrl(url);
      toast.success('Yaratık görseli WebP formatında optimize edilerek yüklendi.');
    } catch (err) {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingCreatureImage(false);
    }
  };

  // ── Kültür, İnanç & Dünya Düzeni İşlemleri ──
  const openCreateCultureModal = () => {
    setEditingCulture(null);
    setCultureName('');
    setCultureCategory('culture');
    setCultureDesc('');
    setCultureAssociatedRaces('');
    setCultureAssociatedRegions('');
    setCultureTraditions('');
    setCultureValuesTaboos('');
    setCultureDeities('');
    setCultureSacredPlaces('');
    setCultureCreationMyth('');
    setCultureGovernment('');
    setCultureLaws('');
    setCultureCurrency('');
    setCultureSocialClasses('');
    setCultureImageUrl('');
    setCultureIsSpoiler(false);
    setCultureSpoilerChapter('');
    setCultureAuthorNotes('');
    setIsCultureModalOpen(true);
  };

  const openEditCultureModal = (c: UniverseCulture) => {
    setEditingCulture(c);
    setCultureName(c.name);
    setCultureCategory(c.category || 'culture');
    setCultureDesc(c.description || '');
    setCultureAssociatedRaces(Array.isArray(c.associatedRaces) ? c.associatedRaces.join(', ') : (c.associatedRaces || ''));
    setCultureAssociatedRegions(Array.isArray(c.associatedRegions) ? c.associatedRegions.join(', ') : (c.associatedRegions || ''));
    setCultureTraditions(c.traditionsAndCustoms || c.traditions || '');
    setCultureValuesTaboos(c.valuesAndTaboos || c.taboos || '');
    setCultureDeities(Array.isArray(c.deitiesAndFigures) ? c.deitiesAndFigures.join(', ') : (c.deitiesAndFigures || (Array.isArray(c.deitiesOrFigures) ? c.deitiesOrFigures.join(', ') : '')));
    setCultureSacredPlaces(Array.isArray(c.sacredPlacesAndTexts) ? c.sacredPlacesAndTexts.join(', ') : (c.sacredPlacesAndTexts || (Array.isArray(c.holyPlaces) ? c.holyPlaces.join(', ') : '')));
    setCultureCreationMyth(c.creationMythAndAfterlife || c.creationMyth || '');
    setCultureGovernment(c.governmentSystem || c.governanceSystem || '');
    setCultureLaws(c.lawsAndSuccession || c.laws || '');
    setCultureCurrency(c.currencyAndTrade || c.currency || '');
    setCultureSocialClasses(Array.isArray(c.socialClasses) ? c.socialClasses.join(', ') : (c.socialClasses || ''));
    setCultureImageUrl(c.imageUrl || '');
    setCultureIsSpoiler(!!c.isSpoiler);
    setCultureSpoilerChapter(c.spoilerThresholdChapter ? String(c.spoilerThresholdChapter) : '');
    setCultureAuthorNotes(c.authorNotes || '');
    setIsCultureModalOpen(true);
  };

  const handleSaveCulture = async () => {
    if (!cultureName.trim()) {
      toast.error('Kültür / İnanç adı gereklidir.');
      return;
    }
    try {
      const data: Partial<UniverseCulture> = {
        name: cultureName.trim(),
        category: cultureCategory,
        description: cultureDesc.trim(),
        associatedRaces: cultureAssociatedRaces.trim(),
        associatedRegions: cultureAssociatedRegions.trim(),
        traditionsAndCustoms: cultureTraditions.trim(),
        valuesAndTaboos: cultureValuesTaboos.trim(),
        deitiesAndFigures: cultureDeities.trim(),
        sacredPlacesAndTexts: cultureSacredPlaces.trim(),
        creationMythAndAfterlife: cultureCreationMyth.trim(),
        governmentSystem: cultureGovernment.trim(),
        lawsAndSuccession: cultureLaws.trim(),
        currencyAndTrade: cultureCurrency.trim(),
        socialClasses: cultureSocialClasses.trim(),
        imageUrl: cultureImageUrl.trim() || undefined,
        isSpoiler: cultureIsSpoiler,
        spoilerThresholdChapter: cultureSpoilerChapter ? Number(cultureSpoilerChapter) : undefined,
        authorNotes: cultureAuthorNotes.trim() || undefined,
      };

      if (editingCulture) {
        await updateUniverseCulture(universeId, editingCulture.id, data);
        toast.success('Kültür / İnanç kaydı güncellendi.');
      } else {
        await createUniverseCulture(universeId, data);
        toast.success('Kültür / İnanç kaydı eklendi.');
      }
      setIsCultureModalOpen(false);
      setCultures(await getUniverseCultures(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Kayıt yapılamadı.');
    }
  };

  const handleDeleteCulture = async (id: string) => {
    if (!window.confirm('Bu kültürel / dini kaydı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseCulture(universeId, id);
      toast.success('Kayıt silindi.');
      setCultures(await getUniverseCultures(universeId));
    } catch (err) {
      toast.error('Kayıt silinemedi.');
    }
  };

  const handleUploadCultureImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingCultureImage(true);
    try {
      const compressed = await compressToWebP(file, 1200, 1200, 0.85);
      const url = await uploadFile(compressed, `universes/${universeId}/cultures/${Date.now()}.webp`);
      setCultureImageUrl(url);
      toast.success('Kültür görseli WebP formatında optimize edilerek yüklendi.');
    } catch (err) {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingCultureImage(false);
    }
  };

  // ── Medya & Moodboard İşlemleri (PRD 46) ──
  const openCreateMediaModal = () => {
    setEditingMedia(null);
    setMediaTitle('');
    setMediaImageUrl('');
    setMediaCategory('character');
    setMediaDesc('');
    setMediaTagsInput('');
    setMediaColorPaletteInput('');
    setMediaIsAuthorOnly(false);
    setMediaIsSpoiler(false);
    setMediaSpoilerChapter('');
    setMediaAuthorNotes('');
    setIsMediaModalOpen(true);
  };

  const openEditMediaModal = (m: UniverseMedia) => {
    setEditingMedia(m);
    setMediaTitle(m.title);
    setMediaImageUrl(m.imageUrl);
    setMediaCategory(m.category);
    setMediaDesc(m.description || '');
    setMediaTagsInput(Array.isArray(m.tags) ? m.tags.join(', ') : '');
    setMediaColorPaletteInput(Array.isArray(m.colorPalette) ? m.colorPalette.join(', ') : '');
    setMediaIsAuthorOnly(!!m.isAuthorOnly);
    setMediaIsSpoiler(!!m.isSpoiler);
    setMediaSpoilerChapter(m.spoilerThresholdChapter ? String(m.spoilerThresholdChapter) : '');
    setMediaAuthorNotes(m.authorNotes || '');
    setIsMediaModalOpen(true);
  };

  const handleSaveMedia = async () => {
    if (!mediaTitle.trim()) {
      toast.error('Görsel başlığı gereklidir.');
      return;
    }
    if (!mediaImageUrl.trim()) {
      toast.error('Lütfen bir görsel yükleyin.');
      return;
    }
    try {
      const data: Partial<UniverseMedia> = {
        title: mediaTitle.trim(),
        imageUrl: mediaImageUrl.trim(),
        category: mediaCategory,
        description: mediaDesc.trim() || undefined,
        tags: mediaTagsInput ? mediaTagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
        colorPalette: mediaColorPaletteInput ? mediaColorPaletteInput.split(',').map((c) => c.trim()).filter(Boolean) : [],
        isAuthorOnly: mediaIsAuthorOnly,
        isSpoiler: mediaIsSpoiler,
        spoilerThresholdChapter: mediaSpoilerChapter ? Number(mediaSpoilerChapter) : undefined,
        authorNotes: mediaAuthorNotes.trim() || undefined,
      };

      if (editingMedia) {
        await updateUniverseMedia(universeId, editingMedia.id, data);
        toast.success('Görsel kaydı güncellendi.');
      } else {
        await createUniverseMedia(universeId, data);
        toast.success('Görsel galeriye eklendi.');
      }
      setIsMediaModalOpen(false);
      setMediaList(await getUniverseMedia(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Görsel kaydedilemedi.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Bu görseli silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseMedia(universeId, id);
      toast.success('Görsel silindi.');
      setMediaList(await getUniverseMedia(universeId));
    } catch (err) {
      toast.error('Görsel silinemedi.');
    }
  };

  const handleUploadMediaImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingMediaImage(true);
    try {
      const compressed = await compressToWebP(file, 1600, 1600, 0.85);
      const url = await uploadFile(compressed, `universes/${universeId}/media/${Date.now()}.webp`);
      setMediaImageUrl(url);
      toast.success('Görsel WebP formatında sıkıştırılarak yüklendi.');
    } catch (err) {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingMediaImage(false);
    }
  };

  // ── Müzik & Soundtrack İşlemleri (PRD 29) ──
  const openCreateSoundtrackModal = () => {
    setEditingSoundtrack(null);
    setSoundtrackTitle('');
    setSoundtrackArtist('');
    setSoundtrackUrl('');
    setSoundtrackTheme('main_theme');
    setSoundtrackDesc('');
    setSoundtrackLocation('');
    setSoundtrackCharacter('');
    setSoundtrackIsSpoiler(false);
    setSoundtrackSpoilerChapter('');
    setSoundtrackAuthorNotes('');
    setIsSoundtrackModalOpen(true);
  };

  const openEditSoundtrackModal = (s: UniverseSoundtrack) => {
    setEditingSoundtrack(s);
    setSoundtrackTitle(s.title);
    setSoundtrackArtist(s.artist || '');
    setSoundtrackUrl(s.url);
    setSoundtrackTheme(s.themeType || 'main_theme');
    setSoundtrackDesc(s.description || '');
    setSoundtrackLocation(s.targetLocationName || '');
    setSoundtrackCharacter(s.targetCharacterName || '');
    setSoundtrackIsSpoiler(!!s.isSpoiler);
    setSoundtrackSpoilerChapter(s.spoilerThresholdChapter ? String(s.spoilerThresholdChapter) : '');
    setSoundtrackAuthorNotes(s.authorNotes || '');
    setIsSoundtrackModalOpen(true);
  };

  const handleSaveSoundtrack = async () => {
    if (!soundtrackTitle.trim()) {
      toast.error('Parça başlığı gereklidir.');
      return;
    }
    if (!soundtrackUrl.trim()) {
      toast.error('Lütfen bir müzik bağlantısı girin.');
      return;
    }
    try {
      const parsed = parseAudioTrack(soundtrackUrl.trim());
      const data: Partial<UniverseSoundtrack> = {
        title: soundtrackTitle.trim(),
        artist: soundtrackArtist.trim() || undefined,
        url: soundtrackUrl.trim(),
        platform: parsed.platform,
        themeType: soundtrackTheme,
        description: soundtrackDesc.trim() || undefined,
        targetLocationName: soundtrackLocation.trim() || undefined,
        targetCharacterName: soundtrackCharacter.trim() || undefined,
        isSpoiler: soundtrackIsSpoiler,
        spoilerThresholdChapter: soundtrackSpoilerChapter ? Number(soundtrackSpoilerChapter) : undefined,
        authorNotes: soundtrackAuthorNotes.trim() || undefined,
      };

      if (editingSoundtrack) {
        await updateUniverseSoundtrack(universeId, editingSoundtrack.id, data);
        toast.success('Müzik parçası güncellendi.');
      } else {
        await createUniverseSoundtrack(universeId, data);
        toast.success('Müzik parçası eklendi.');
      }
      setIsSoundtrackModalOpen(false);
      setSoundtracks(await getUniverseSoundtracks(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Müzik kaydedilemedi.');
    }
  };

  const handleDeleteSoundtrack = async (id: string) => {
    if (!window.confirm('Bu müzik parçasını silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseSoundtrack(universeId, id);
      toast.success('Müzik parçası silindi.');
      setSoundtracks(await getUniverseSoundtracks(universeId));
    } catch (err) {
      toast.error('Müzik silinemedi.');
    }
  };

  // Seri Bible & Canon Kuralları Handlers (PRD 30)
  const openCreateCanonModal = () => {
    setEditingCanonRule(null);
    setCanonTitle('');
    setCanonCategory('magic_system');
    setCanonRuleDesc('');
    setCanonConsequences('');
    setCanonExceptions('');
    setCanonIsStrict(true);
    setCanonIsPublic(true);
    setCanonIsSpoiler(false);
    setCanonSpoilerChapter('');
    setCanonAuthorNotes('');
    setIsCanonModalOpen(true);
  };

  const openEditCanonModal = (rule: UniverseCanonRule) => {
    setEditingCanonRule(rule);
    setCanonTitle(rule.title);
    setCanonCategory(rule.category);
    setCanonRuleDesc(rule.description || '');
    setCanonConsequences(rule.consequences || '');
    setCanonExceptions(rule.exceptions || '');
    setCanonIsStrict(rule.isStrict ?? true);
    setCanonIsPublic(rule.isPublic ?? true);
    setCanonIsSpoiler(rule.isSpoiler ?? false);
    setCanonSpoilerChapter(rule.spoilerChapterOrder ? String(rule.spoilerChapterOrder) : '');
    setCanonAuthorNotes(rule.authorNotes || '');
    setIsCanonModalOpen(true);
  };

  const handleSaveCanonRule = async () => {
    if (!canonTitle.trim()) {
      toast.error('Kural başlığı zorunludur.');
      return;
    }
    if (!canonRuleDesc.trim()) {
      toast.error('Kural açıklaması zorunludur.');
      return;
    }

    try {
      const data: Partial<UniverseCanonRule> = {
        title: canonTitle.trim(),
        category: canonCategory,
        description: canonRuleDesc.trim(),
        consequences: canonConsequences.trim() || undefined,
        exceptions: canonExceptions.trim() || undefined,
        isStrict: canonIsStrict,
        isPublic: canonIsPublic,
        isSpoiler: canonIsSpoiler,
        spoilerChapterOrder: canonSpoilerChapter ? parseInt(canonSpoilerChapter, 10) : undefined,
        authorNotes: canonAuthorNotes.trim() || undefined,
      };

      if (editingCanonRule) {
        await updateUniverseCanonRule(universeId, editingCanonRule.id, data);
        toast.success('Canon kuralı güncellendi.');
      } else {
        await createUniverseCanonRule(universeId, data as any);
        toast.success('Yeni canon kuralı eklendi.');
      }
      setIsCanonModalOpen(false);
      setCanonRules(await getUniverseCanonRules(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Canon kuralı kaydedilemedi.');
    }
  };

  const handleDeleteCanonRule = async (id: string) => {
    if (!window.confirm('Bu canon kuralını silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseCanonRule(universeId, id);
      toast.success('Canon kuralı silindi.');
      setCanonRules(await getUniverseCanonRules(universeId));
    } catch (err) {
      toast.error('Canon kuralı silinemedi.');
    }
  };

  // Açık Kurgu Düğümleri Handlers (PRD 31)
  const openCreateThreadModal = () => {
    setEditingThread(null);
    setThreadTitle('');
    setThreadDesc('');
    setThreadStatus('open');
    setThreadImportance('major');
    setThreadIntroStory('');
    setThreadIntroChapter('');
    setThreadResolvedStory('');
    setThreadResolvedChapter('');
    setThreadResolutionSummary('');
    setThreadIsSpoiler(false);
    setThreadSpoilerChapter('');
    setThreadIsPublic(false);
    setThreadAuthorNotes('');
    setIsThreadModalOpen(true);
  };

  const openEditThreadModal = (thread: UniversePlotThread) => {
    setEditingThread(thread);
    setThreadTitle(thread.title);
    setThreadDesc(thread.description || '');
    setThreadStatus(thread.status);
    setThreadImportance(thread.importance);
    setThreadIntroStory(thread.introducedInStoryTitle || '');
    setThreadIntroChapter(thread.introducedInChapterOrder ? String(thread.introducedInChapterOrder) : '');
    setThreadResolvedStory(thread.resolvedInStoryTitle || '');
    setThreadResolvedChapter(thread.resolvedInChapterOrder ? String(thread.resolvedInChapterOrder) : '');
    setThreadResolutionSummary(thread.resolutionSummary || '');
    setThreadIsSpoiler(thread.isSpoiler ?? false);
    setThreadSpoilerChapter(thread.spoilerChapterOrder ? String(thread.spoilerChapterOrder) : '');
    setThreadIsPublic(thread.isPublic ?? false);
    setThreadAuthorNotes(thread.authorNotes || '');
    setIsThreadModalOpen(true);
  };

  const handleSaveThread = async () => {
    if (!threadTitle.trim()) {
      toast.error('Gizem / düğüm başlığı zorunludur.');
      return;
    }
    if (!threadDesc.trim()) {
      toast.error('Düğüm açıklaması zorunludur.');
      return;
    }

    try {
      const data: Partial<UniversePlotThread> = {
        title: threadTitle.trim(),
        description: threadDesc.trim(),
        status: threadStatus,
        importance: threadImportance,
        introducedInStoryTitle: threadIntroStory.trim() || undefined,
        introducedInChapterOrder: threadIntroChapter ? parseInt(threadIntroChapter, 10) : undefined,
        resolvedInStoryTitle: threadResolvedStory.trim() || undefined,
        resolvedInChapterOrder: threadResolvedChapter ? parseInt(threadResolvedChapter, 10) : undefined,
        resolutionSummary: threadResolutionSummary.trim() || undefined,
        isSpoiler: threadIsSpoiler,
        spoilerChapterOrder: threadSpoilerChapter ? parseInt(threadSpoilerChapter, 10) : undefined,
        isPublic: threadIsPublic,
        authorNotes: threadAuthorNotes.trim() || undefined,
      };

      if (editingThread) {
        await updateUniversePlotThread(universeId, editingThread.id, data);
        toast.success('Kurgu düğümü güncellendi.');
      } else {
        await createUniversePlotThread(universeId, data as any);
        toast.success('Yeni kurgu düğümü eklendi.');
      }
      setIsThreadModalOpen(false);
      setPlotThreads(await getUniversePlotThreads(universeId));
    } catch (err) {
      console.error(err);
      toast.error('Kurgu düğümü kaydedilemedi.');
    }
  };

  const handleDeleteThread = async (id: string) => {
    if (!window.confirm('Bu kurgu düğümünü silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniversePlotThread(universeId, id);
      toast.success('Kurgu düğümü silindi.');
      setPlotThreads(await getUniversePlotThreads(universeId));
    } catch (err) {
      toast.error('Kurgu düğümü silinemedi.');
    }
  };

  const handleToggleThreadStatus = async (thread: UniversePlotThread) => {
    try {
      const nextStatus: PlotThreadStatus = thread.status === 'resolved' ? 'open' : 'resolved';
      await updateUniversePlotThread(universeId, thread.id, { status: nextStatus });
      toast.success(nextStatus === 'resolved' ? 'Düğüm çözüldü olarak işaretlendi.' : 'Düğüm yeniden açıldı.');
      setPlotThreads(await getUniversePlotThreads(universeId));
    } catch (err) {
      toast.error('Durum güncellenemedi.');
    }
  };

  const openAddClueModal = (thread: UniversePlotThread) => {
    setClueThreadId(thread.id);
    setClueNote('');
    setClueChapterOrder('');
    setClueStoryTitle('');
    setIsAddClueModalOpen(true);
  };

  const handleSaveClue = async () => {
    if (!clueThreadId) return;
    if (!clueNote.trim()) {
      toast.error('İpucu notu zorunludur.');
      return;
    }

    try {
      await addPlotThreadClue(universeId, clueThreadId, {
        note: clueNote.trim(),
        chapterOrder: clueChapterOrder ? parseInt(clueChapterOrder, 10) : undefined,
        storyTitle: clueStoryTitle.trim() || undefined,
      });
      toast.success('İpucu eklendi!');
      setIsAddClueModalOpen(false);
      setPlotThreads(await getUniversePlotThreads(universeId));
    } catch (err) {
      console.error(err);
      toast.error('İpucu eklenemedi.');
    }
  };

  // Yeni Karakter Ekle / Sil / 2.0 Detay
  const handleCreateChar = async () => {
    if (!newCharName.trim()) {
      toast.error('Karakter adı gereklidir.');
      return;
    }
    try {
      const newCharId = await createUniverseCharacter(universeId, {
        name: newCharName.trim(),
        role: newCharRole,
        occupation: newCharOccupation.trim(),
        coreMotivation: newCharMotivation.trim(),
      });
      toast.success('Evren karakteri oluşturuldu.');
      setIsCharModalOpen(false);
      setNewCharName('');
      setNewCharOccupation('');
      setNewCharMotivation('');
      const updatedChars = await getUniverseCharacters(universeId);
      setCharacters(updatedChars);
      const createdChar = updatedChars.find((c) => c.id === newCharId);
      if (createdChar) {
        openCharDetail(createdChar);
      }
    } catch (error: any) {
      console.error('Karakter oluşturma hatası:', error);
      toast.error(error?.message || 'Karakter oluşturulamadı.');
    }
  };

  const openCharDetail = (char: Character) => {
    setSelectedCharForDetail(char);
    setEditingCharData({
      ...char,
      characterArc: char.characterArc || {},
      relationships: char.relationships || [],
      pngGallery: char.pngGallery || {},
      rpgStats: char.rpgStats || { intelligence: 5, strength: 5, charisma: 5, agility: 5, empathy: 5 },
    });
    setCharDetailTab('profile');
    setIsCharDetailModalOpen(true);
  };

  const handleSaveCharDetail = async () => {
    if (!selectedCharForDetail) return;
    setIsSavingCharDetail(true);
    try {
      await updateUniverseCharacter(universeId, selectedCharForDetail.id, editingCharData);
      toast.success('Karakter Defteri 2.0 güncellendi!');
      setCharacters(await getUniverseCharacters(universeId));
      setIsCharDetailModalOpen(false);
      setSelectedCharForDetail(null);
    } catch (error: any) {
      console.error('Karakter 2.0 güncelleme hatası:', error);
      toast.error(error?.message || 'Güncelleme kaydedilemedi.');
    } finally {
      setIsSavingCharDetail(false);
    }
  };

  const handleAddRelationship = () => {
    if (!relTargetId) {
      toast.error('Lütfen ilişkili karakteri seçin.');
      return;
    }
    const targetChar = characters.find((c) => c.id === relTargetId);
    const newRel: CharacterRelationship = {
      targetCharacterId: relTargetId,
      targetCharacterName: targetChar?.name || 'Karakter',
      relationshipType: relType,
      description: relDesc.trim(),
      isSecret: relIsSecret,
      spoilerThresholdChapter: relSpoilerThreshold ? Number(relSpoilerThreshold) : undefined,
    };
    const currentRels = editingCharData.relationships || [];
    setEditingCharData({
      ...editingCharData,
      relationships: [...currentRels, newRel],
    });
    setRelTargetId('');
    setRelDesc('');
    setRelIsSecret(false);
    setRelSpoilerThreshold('');
    toast.success('İlişki eklendi.');
  };

  const handleRemoveRelationship = (index: number) => {
    const currentRels = [...(editingCharData.relationships || [])];
    currentRels.splice(index, 1);
    setEditingCharData({
      ...editingCharData,
      relationships: currentRels,
    });
  };

  const handleCharImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'avatar' | 'transparentPng' | 'fullBody') => {
    const file = e.target.files?.[0];
    if (!file || !selectedCharForDetail) return;
    setIsUploadingCharImage(true);
    try {
      const compressed = await compressToWebP(file, 1200, 1600, 0.85);
      const path = `universes/${universeId}/characters/${selectedCharForDetail.id}/${imageType}_${Date.now()}.webp`;
      const url = await uploadFile(compressed, path);
      if (imageType === 'avatar') {
        setEditingCharData((prev) => ({ ...prev, avatarUrl: url }));
      } else if (imageType === 'transparentPng') {
        setEditingCharData((prev) => ({
          ...prev,
          pngGallery: { ...(prev.pngGallery || {}), transparentPngUrl: url },
        }));
      } else if (imageType === 'fullBody') {
        setEditingCharData((prev) => ({
          ...prev,
          pngGallery: { ...(prev.pngGallery || {}), fullBodyUrl: url },
        }));
      }
      toast.success('Karakter görseli WebP formatında optimize edildi ve yüklendi.');
    } catch (err: any) {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingCharImage(false);
    }
  };

  const handleRemoveCharImage = (imageType: 'avatar' | 'transparentPng' | 'fullBody') => {
    if (imageType === 'avatar') {
      setEditingCharData((prev) => ({ ...prev, avatarUrl: undefined }));
    } else if (imageType === 'transparentPng') {
      setEditingCharData((prev) => ({
        ...prev,
        pngGallery: { ...(prev.pngGallery || {}), transparentPngUrl: undefined },
      }));
    } else if (imageType === 'fullBody') {
      setEditingCharData((prev) => ({
        ...prev,
        pngGallery: { ...(prev.pngGallery || {}), fullBodyUrl: undefined },
      }));
    }
    toast.info('Görsel kaldırıldı. Değişikliği kaydetmeyi unutmayın.');
  };

  const handleDeleteChar = async (id: string) => {
    if (!window.confirm('Bu karakteri evrenden silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseCharacter(universeId, id);
      setCharacters(await getUniverseCharacters(universeId));
      toast.success('Karakter silindi.');
    } catch (error: any) {
      console.error('Karakter silme hatası:', error);
      toast.error(error?.message || 'Karakter silinemedi.');
    }
  };

  // ── İlişki Ağı İşlemleri ──
  const handleAddGraphRelationship = async (sourceId: string, rel: CharacterRelationship) => {
    try {
      await addUniverseCharacterRelationship(universeId, sourceId, rel);
      const updatedChars = await getUniverseCharacters(universeId);
      setCharacters(updatedChars);
    } catch (err) {
      console.error('İlişki ekleme hatası:', err);
      toast.error('İlişki eklenemedi.');
    }
  };

  const handleDeleteGraphRelationship = async (sourceId: string, targetId: string) => {
    try {
      await deleteUniverseCharacterRelationship(universeId, sourceId, targetId);
      const updatedChars = await getUniverseCharacters(universeId);
      setCharacters(updatedChars);
    } catch (err) {
      console.error('İlişki silme hatası:', err);
      toast.error('İlişki silinemedi.');
    }
  };

  const handleSaveGraphLayout = async (positions: Record<string, { x: number; y: number }>) => {
    try {
      await updateUniverse(universeId, { characterGraphLayout: positions });
      setUniverse((prev) => (prev ? { ...prev, characterGraphLayout: positions } : prev));
    } catch (err) {
      console.error('İlişki ağı yerleşimi kaydedilemedi:', err);
      toast.error('İlişki ağı yerleşimi kaydedilemedi.');
      throw err;
    }
  };

  // ── Harita İşlemleri ──
  const handleCreateMap = async () => {
    if (!newMapTitle.trim()) {
      toast.error('Harita başlığı boş olamaz.');
      return;
    }
    if (!newMapImageUrl.trim()) {
      toast.error('Lütfen bir harita görseli yükleyin veya URL girin.');
      return;
    }

    try {
      const mapId = await createUniverseMap(universeId, {
        title: newMapTitle.trim(),
        description: newMapDesc.trim() || undefined,
        mapType: newMapType,
        imageUrl: newMapImageUrl.trim(),
        markers: [],
      });
      toast.success('Harita başarıyla oluşturuldu.');
      setIsCreateMapModalOpen(false);
      setNewMapTitle('');
      setNewMapDesc('');
      setNewMapImageUrl('');
      const updatedMaps = await getUniverseMaps(universeId);
      setMaps(updatedMaps);
      setSelectedMapId(mapId);
    } catch (err) {
      console.error('Harita oluşturma hatası:', err);
      toast.error('Harita oluşturulurken bir hata oluştu.');
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    if (!window.confirm('Bu haritayı ve üzerindeki tüm işaretçileri silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUniverseMap(universeId, mapId);
      toast.success('Harita silindi.');
      const updatedMaps = await getUniverseMaps(universeId);
      setMaps(updatedMaps);
      if (selectedMapId === mapId) {
        setSelectedMapId(updatedMaps[0]?.id || '');
      }
    } catch (err) {
      console.error(err);
      toast.error('Harita silinemedi.');
    }
  };

  const handleAddMapMarker = async (markerData: Omit<UniverseMapMarker, 'id'>) => {
    if (!selectedMapId) return;
    const newMarker: UniverseMapMarker = {
      ...markerData,
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    await addMapMarker(universeId, selectedMapId, newMarker);
    const updatedMaps = await getUniverseMaps(universeId);
    setMaps(updatedMaps);
  };

  const handleUpdateMapMarker = async (markerId: string, updatedData: Partial<UniverseMapMarker>) => {
    if (!selectedMapId) return;
    await updateMapMarker(universeId, selectedMapId, markerId, updatedData);
    const updatedMaps = await getUniverseMaps(universeId);
    setMaps(updatedMaps);
  };

  const handleDeleteMapMarker = async (markerId: string) => {
    if (!selectedMapId) return;
    await deleteMapMarker(universeId, selectedMapId, markerId);
    const updatedMaps = await getUniverseMaps(universeId);
    setMaps(updatedMaps);
  };

  const handleMapImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    setIsUploadingMapImage(true);
    try {
      const url = await uploadFile(file, `universes/${universeId}/maps/${Date.now()}_${file.name}`);
      setNewMapImageUrl(url);
      toast.success('Harita görseli yüklendi.');
    } catch (err) {
      console.error(err);
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingMapImage(false);
    }
  };

  // ── Ekip & İzinler Yönetimi (PRD 32 & 66) ──
  const handleAddMember = async () => {
    if (!universe || !selectedUserToInvite) return;
    if (!canManageMembers) {
      toast.error('Üye ekleme yetkiniz yok.');
      return;
    }
    setIsInvitingMember(true);
    try {
      const newMember: UniverseMember = {
        userId: selectedUserToInvite.uid,
        username: selectedUserToInvite.username || '',
        displayName: selectedUserToInvite.displayName || selectedUserToInvite.username || 'Kullanıcı',
        avatarUrl: selectedUserToInvite.photoURL || selectedUserToInvite.avatarUrl || '',
        role: selectedInviteRole,
        addedAt: new Date().toISOString(),
      };
      await addUniverseMember(universe.universeId, newMember);
      setUniverse((prev) => {
        if (!prev) return prev;
        const currentMembers = prev.members || [];
        return {
          ...prev,
          members: [...currentMembers, newMember],
          collaboratorIds: [...(prev.collaboratorIds || []), newMember.userId],
        };
      });
      toast.success(`${newMember.displayName} evren ekibine eklendi!`);
      setIsAddMemberModalOpen(false);
      setSelectedUserToInvite(null);
      setMemberSearchQuery('');
    } catch (err: any) {
      console.error('Üye ekleme hatası:', err);
      toast.error('Üye eklenirken hata oluştu.');
    } finally {
      setIsInvitingMember(false);
    }
  };

  const handleUpdateMemberRole = async (targetUserId: string, newRole: UniverseMemberRole) => {
    if (!universe || !canManageMembers) {
      toast.error('Rol düzenleme yetkiniz yok.');
      return;
    }
    setUpdatingMemberUserId(targetUserId);
    try {
      await updateUniverseMemberRole(universe.universeId, targetUserId, newRole);
      setUniverse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: (prev.members || []).map((m) =>
            m.userId === targetUserId ? { ...m, role: newRole } : m
          ),
        };
      });
      toast.success('Üye rolü güncellendi.');
    } catch (err) {
      console.error('Rol güncelleme hatası:', err);
      toast.error('Rol güncellenemedi.');
    } finally {
      setUpdatingMemberUserId(null);
    }
  };

  const handleRemoveMember = async (targetUserId: string, memberName: string) => {
    if (!universe || !canManageMembers) {
      toast.error('Üye çıkarma yetkiniz yok.');
      return;
    }
    if (!window.confirm(`${memberName} isimli üyeyi evren ekibinden çıkarmak istediğinize emin misiniz?`)) return;
    try {
      await removeUniverseMember(universe.universeId, targetUserId);
      setUniverse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: (prev.members || []).filter((m) => m.userId !== targetUserId),
          collaboratorIds: (prev.collaboratorIds || []).filter((id) => id !== targetUserId),
        };
      });
      toast.success(`${memberName} ekipten çıkarıldı.`);
    } catch (err) {
      console.error('Üye çıkarma hatası:', err);
      toast.error('Üye çıkarılamadı.');
    }
  };

  // Evreni Sil
  const handleDeleteUniverse = async () => {
    if (!isOwner) {
      toast.error('Yalnızca evren sahibi evreni silebilir.');
      return;
    }
    if (!window.confirm('Bu evreni silmek istediğinize emin misiniz? Bağlı kitaplar silinmez, yalnızca evren bağı kaldırılır.')) return;
    try {
      await deleteUniverse(universeId);
      toast.success('Evren silindi.');
      router.push('/studio/universes');
    } catch (error) {
      toast.error('Evren silinemedi.');
    }
  };

  // 8 Adımlı Onboarding Rehberi Modal Yönlendirmeleri (PRD Bölüm 61)
  const handleOpenOnboardingModal = (
    modalType: 'link_story' | 'character' | 'location' | 'event' | 'canon_rule' | 'power'
  ) => {
    switch (modalType) {
      case 'link_story':
        setIsLinkStoryModalOpen(true);
        break;
      case 'character':
        setActiveTab('characters');
        setIsCharModalOpen(true);
        break;
      case 'location':
        setActiveTab('locations');
        setIsLocationModalOpen(true);
        break;
      case 'event':
        setActiveTab('timeline');
        setIsEventModalOpen(true);
        break;
      case 'canon_rule':
        setActiveTab('canon_rules');
        setIsCanonModalOpen(true);
        break;
      case 'power':
        setActiveTab('powers');
        setIsPowerModalOpen(true);
        break;
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <Typography variant="body" className="text-muted text-sm">Evren verileri yükleniyor...</Typography>
      </div>
    );
  }

  if (!universe) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full pb-24">
      {/* ── Üst Başlık & Geri Dön ── */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 flex-wrap">
        <Link
          href="/studio/universes"
          className="flex items-center gap-2 text-muted hover:text-foreground text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Evrenlerime Dön</span>
        </Link>

        {/* Global Arama Tetikleyici (PRD Bölüm 50 & 51) */}
        <button
          type="button"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-card hover:bg-card/90 border border-border/60 hover:border-primary/50 text-xs text-muted hover:text-foreground transition-all shadow-xs group cursor-pointer"
        >
          <Search size={14} className="text-primary group-hover:scale-110 transition-transform" />
          <span className="font-semibold hidden sm:inline">Evrende Ara & Gezin...</span>
          <span className="font-semibold sm:hidden">Ara...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background border border-border/60 text-[10px] font-mono text-muted">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          {visibility === 'draft' ? (
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={saving}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Globe size={14} />
              <span>Yayına Al</span>
            </button>
          ) : visibility === 'public' ? (
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={saving}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <EyeOff size={14} />
              <span>Taslağa Çek</span>
            </button>
          ) : null}

          <Button
            variant="primary"
            onPress={handleSaveOverview}
            disabled={saving}
            className="flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs shadow-md"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? 'Kaydediliyor...' : 'Evreni Kaydet'}</span>
          </Button>
        </div>
      </div>

      {/* ── Evren Başlık Banner Alanı ── */}
      <div className="relative rounded-3xl bg-gradient-to-tr from-primary/15 via-card to-card border border-border/50 p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-2xl bg-background border border-border/60 overflow-hidden shrink-0 shadow-md flex items-center justify-center relative group">
              {coverImage ? (
                <img src={coverImage} alt={title} className="w-full h-full object-cover" />
              ) : (
                <Globe size={32} className="text-primary/40" />
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                <Upload size={18} />
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={coverUploading} />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase">
                  {genre}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border/60 text-muted">
                  {visibility === 'public' ? 'Herkese Açık' : visibility === 'unlisted' ? 'Liste Dışı' : 'Taslak'}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${UNIVERSE_MEMBER_ROLE_CONFIG[currentUserRole].bg} ${UNIVERSE_MEMBER_ROLE_CONFIG[currentUserRole].color} ${UNIVERSE_MEMBER_ROLE_CONFIG[currentUserRole].border}`}>
                  {UNIVERSE_MEMBER_ROLE_CONFIG[currentUserRole].label}
                </span>
              </div>
              <Typography variant="h1" className="text-xl sm:text-2xl font-black text-foreground">
                {title}
              </Typography>
              <Typography variant="body" className="text-muted text-xs sm:text-sm line-clamp-2 mt-1 max-w-xl">
                {description || 'Henüz bir evren açıklaması eklenmedi.'}
              </Typography>
            </div>
          </div>

          {/* Hızlı İstatistikler */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold self-start sm:self-auto bg-background/50 border border-border/50 px-3.5 py-2.5 rounded-2xl overflow-x-auto max-w-full">
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{(universe.members?.length || 0) + 1}</span>
              <span className="text-[10px] text-muted">Ekip</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{connectedStories.length}</span>
              <span className="text-[10px] text-muted">Eser</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{characters.length}</span>
              <span className="text-[10px] text-muted">Karakter</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{locations.length}</span>
              <span className="text-[10px] text-muted">Mekân</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{organizations.length}</span>
              <span className="text-[10px] text-muted">Örgüt</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{items.length}</span>
              <span className="text-[10px] text-muted">Eşya</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{powerSystems.length}</span>
              <span className="text-[10px] text-muted">Güç</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{races.length}</span>
              <span className="text-[10px] text-muted">Irk</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{creatures.length}</span>
              <span className="text-[10px] text-muted">Yaratık</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{cultures.length}</span>
              <span className="text-[10px] text-muted">Kültür</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{mediaList.length}</span>
              <span className="text-[10px] text-muted">Galeri</span>
            </div>
            <div className="w-px h-6 bg-border/60" />
            <div className="text-center">
              <span className="block text-primary font-black text-sm">{soundtracks.length}</span>
              <span className="text-[10px] text-muted">Müzik</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 8 Adımlı Evren Onboarding Kontrol Listesi (PRD Bölüm 52, 61, 64) ── */}
      <UniverseOnboardingChecklist
        universe={universe}
        characters={characters}
        locations={locations}
        timelineEvents={timelineEvents}
        canonRules={canonRules}
        powerSystems={powerSystems}
        stories={connectedStories}
        onNavigateTab={(tab) => setActiveTab(tab as ActiveUniverseTab)}
        onOpenCreateModal={handleOpenOnboardingModal}
        onPreviewPublicPortal={() => {
          const dest = universe.slug ? `/universe/${universe.slug}` : `/universe/${universe.universeId}`;
          window.open(dest, '_blank');
        }}
      />

      {/* ── Akıllı Kategori Filtreli & Canlı Sayaçlı Tab Bar Navigasyonu ── */}
      <UniverseNavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={{
          overview: connectedStories.length,
          characters: characters.length,
          relationships: characters.reduce((acc, c) => acc + (c.relationships?.length || 0), 0),
          races: races.length,
          creatures: creatures.length,
          locations: locations.length,
          maps: maps.length,
          organizations: organizations.length,
          items: items.length,
          powers: powerSystems.length,
          cultures: cultures.length,
          media: mediaList.length,
          soundtracks: soundtracks.length,
          canon_rules: canonRules.length,
          plot_threads: plotThreads.length,
          timeline: timelineEvents.length,
          glossary: glossaryTerms.length,
          lore: loreList.length,
          members: (universe.members?.length || 0) + 1,
        }}
      />

      {/* ── 1. SEKME: Genel & Eserler ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evren Ayarları */}
            <div className="p-5 sm:p-6 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm space-y-4">
              <Typography variant="h3" className="font-bold text-base">Evren Temel Ayarları</Typography>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Evren Başlığı *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Evren Açıklaması</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/60 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Tür</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as UniverseGenre)}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="fantasy">Fantastik</option>
                    <option value="sci-fi">Bilimkurgu</option>
                    <option value="dystopia">Distopya</option>
                    <option value="historical">Tarihi Kurgu</option>
                    <option value="mythological">Mitolojik</option>
                    <option value="real_world">Gerçek Dünya</option>
                    <option value="custom">Özel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Görünürlük & Yayın Durumu</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as UniverseVisibility)}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="draft">Taslak (Yalnızca siz ve ekibiniz)</option>
                    <option value="unlisted">Liste Dışı (Bağlantı ile erişim)</option>
                    <option value="public">Herkese Açık (Keşfet atlasında yayında)</option>
                  </select>
                  <p className="text-[11px] text-muted mt-1 leading-tight">
                    {visibility === 'draft' && '🔒 Taslak: Okurlar ve arama vitrinleri erişemez. Yalnızca siz ve ekip üyeleriniz görebilir.'}
                    {visibility === 'unlisted' && '🔗 Liste Dışı: Keşfet atlasında çıkmaz, yalnızca linki verdiğiniz okurlar okuyabilir.'}
                    {visibility === 'public' && '🌐 Yayında: Tüm okurlar evren atlasında, aramalarda ve ana sayfa vitrininde evreninizi keşfedebilir.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bağlı Eserler ve Seriler */}
            <div className="p-5 sm:p-6 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm space-y-6">
              {/* Eserler */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="h3" className="font-bold text-base">Bağlı Roman & Webtoonlar</Typography>
                  <Button variant="ghost" onPress={() => setIsLinkStoryModalOpen(true)} className="text-xs font-bold text-primary">
                    + Eser Bağla
                  </Button>
                </div>

                {connectedStories.length === 0 ? (
                  <p className="text-xs text-muted">Bu evrene henüz bir roman veya webtoon bağlanmadı.</p>
                ) : (
                  <div className="space-y-2">
                    {connectedStories.map((st) => (
                      <div key={st.storyId} className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                        <div className="flex items-center gap-2.5">
                          <BookOpen size={15} className="text-primary" />
                          <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{st.title}</span>
                        </div>
                        <button onClick={() => handleUnlinkStory(st.storyId)} className="text-muted hover:text-destructive p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seriler */}
              <div className="pt-4 border-t border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="h3" className="font-bold text-base">Bağlı Kitap Serileri</Typography>
                  <Button variant="ghost" onPress={() => setIsLinkSeriesModalOpen(true)} className="text-xs font-bold text-primary">
                    + Seri Bağla
                  </Button>
                </div>

                {connectedSeries.length === 0 ? (
                  <p className="text-xs text-muted">Bu evrene henüz bir kitap serisi bağlanmadı.</p>
                ) : (
                  <div className="space-y-2">
                    {connectedSeries.map((ser) => (
                      <div key={ser.seriesId} className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                        <div className="flex items-center gap-2.5">
                          <Layers size={15} className="text-amber-500" />
                          <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{ser.title}</span>
                        </div>
                        <button onClick={() => handleUnlinkSeries(ser.seriesId)} className="text-muted hover:text-destructive p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tehlike Bölgesi */}
          {isOwner && (
            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-destructive block">Evreni Sil</span>
                <span className="text-[10px] text-muted">Bağlı eserler ve seriler silinmez, yalnızca evren bağı kaldırılır.</span>
              </div>
              <button onClick={handleDeleteUniverse} className="p-2 rounded-xl text-destructive hover:bg-destructive/10">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 2. SEKME: Karakterler ── */}
      {activeTab === 'characters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3" className="font-bold text-base">Evren Karakterleri</Typography>
            <Button variant="primary" onPress={() => setIsCharModalOpen(true)} className="text-xs font-bold py-2 px-3.5 rounded-xl">
              <Plus size={14} className="mr-1" /> Karakter Ekle
            </Button>
          </div>

          {characters.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card/40 border border-border/40 text-center">
              <Users size={32} className="text-muted/40 mx-auto mb-2" />
              <p className="text-xs text-muted">Bu evrene ait henüz bir karakter oluşturmadınız.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {characters.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => openCharDetail(c)}
                  className="p-4 rounded-2xl bg-card/60 hover:bg-card/90 border border-border/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-extrabold flex items-center justify-center shrink-0 text-base">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{c.name}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChar(c.id);
                          }} 
                          className="text-muted hover:text-destructive p-1 rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <span className="text-[11px] text-muted block capitalize mt-0.5">
                        {c.role === 'protagonist' ? 'Ana Karakter' : c.role === 'antagonist' ? 'Karşıt Karakter' : c.role === 'supporting' ? 'Yan Karakter' : 'Arka Plan'} • {c.occupation || 'Unvan yok'}
                      </span>
                    </div>
                  </div>

                  {/* 2.0 Rozetleri */}
                  <div className="pt-3 mt-3 border-t border-border/40 flex flex-wrap gap-1.5 items-center justify-between">
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {c.characterArc?.startingState && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium">📈 Ark</span>
                      )}
                      {(c.relationships?.length || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-medium">🕸️ {c.relationships?.length} İlişki</span>
                      )}
                      {(c.secretLore || c.isSpoiler) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-medium">🧊 Sır</span>
                      )}
                      {c.pngGallery?.transparentPngUrl && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">✨ Vitrin</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Defteri Aç <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2.5 SEKME: Karakter İlişki Ağı (Network Graph) ── */}
      {activeTab === 'relationships' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Share2 size={18} className="text-primary" />
                <span>Karakter İlişki Ağı (Interactive Graph)</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Dostluklar, düşmanlıklar, aile bağları ve gizli entrikaları görsel ağ tuvalinde yönetin.
              </p>
            </div>
          </div>

          {characters.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-3 max-w-md mx-auto">
              <Users size={32} className="text-muted/40 mx-auto" />
              <p className="text-xs text-muted">
                İlişki haritasını kullanabilmek için önce Karakterler sekmesinden karakter ekleyin.
              </p>
            </div>
          ) : (
            <InteractiveRelationshipGraph
              characters={characters}
              locations={locations}
              isEditable={true}
              initialLayout={universe?.characterGraphLayout}
              onSaveLayout={handleSaveGraphLayout}
              onAddRelationship={handleAddGraphRelationship}
              onDeleteRelationship={handleDeleteGraphRelationship}
              onSelectCharacter={(char) => openCharDetail(char)}
            />
          )}
        </div>
      )}

      {/* ── 2.6 SEKME: Irklar & Türler ── */}
      {activeTab === 'races' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Dna size={18} className="text-primary" />
                <span>Irklar & Türler</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Kurgusal evrenin insansı halkları, kadim ırkları, biyolojileri ve kültürel bağları.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateRaceModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Irk / Tür Ekle
            </Button>
          </div>

          {races.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Dna size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir ırk veya tür tanımlanmadı.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Elfler, Cüceler, Siborglar, Kadim Melezler veya kendi yarattığınız benzersiz bir halkı evrene ekleyin.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateRaceModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Irkı Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {races.map((race) => {
                const homeland = locations.find((l) => l.id === race.homelandRegionId);

                return (
                  <div
                    key={race.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {race.imageUrl ? (
                            <img
                              src={race.imageUrl}
                              alt={race.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-border/60 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Dna size={22} />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-sm text-foreground block group-hover:text-primary transition-colors">
                              {race.name}
                            </span>
                            {race.alternativeNames && (
                              <span className="text-[10px] text-muted italic block">
                                {race.alternativeNames}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditRaceModal(race)}
                            className="p-1.5 rounded-xl hover:bg-background text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRace(race.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {race.origin && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {race.origin}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {race.lifespan && (
                          <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                            <span className="text-[9px] text-muted uppercase font-bold block">Ömür:</span>
                            <span className="font-semibold text-foreground">{race.lifespan}</span>
                          </div>
                        )}
                        {homeland && (
                          <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                            <span className="text-[9px] text-muted uppercase font-bold block">Anavatan:</span>
                            <span className="font-semibold text-primary truncate block">{homeland.name}</span>
                          </div>
                        )}
                      </div>

                      {race.strengths && (
                        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <strong className="text-emerald-400 block text-[10px] uppercase font-bold">✨ Güçlü Yönler:</strong>
                          <p className="text-foreground/90 mt-0.5 leading-relaxed">{race.strengths}</p>
                        </div>
                      )}

                      {race.weaknesses && (
                        <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                          <strong className="text-rose-400 block text-[10px] uppercase font-bold">⚠️ Zayıflıklar:</strong>
                          <p className="text-foreground/90 mt-0.5 leading-relaxed">{race.weaknesses}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {race.isSpoiler ? (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Lock size={10} /> Bölüm {race.spoilerThresholdChapter || 1}+
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Herkese Açık
                        </span>
                      )}
                      <span>{new Date(race.createdAt?.seconds ? race.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 2.7 SEKME: Yaratıklar & Canavarlar ── */}
      {activeTab === 'creatures' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Skull size={18} className="text-primary" />
                <span>Yaratıklar & Canavarlar (Bestiary)</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Mitolojik canavarlar, tehlikeli yırtıcılar, efsanevi hayvanlar ve yaşam alanları.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateCreatureModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Yaratık Ekle
            </Button>
          </div>

          {creatures.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Skull size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir yaratık kaydedilmedi.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Zindan canavarlarını, ejderhaları, deniz ifritlerini veya orman avcılarını tehlike seviyeleriyle listeleyin.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateCreatureModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Yaratığı Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creatures.map((creature) => {
                const dangerConfig = CREATURE_DANGER_CONFIG[creature.dangerLevel] || CREATURE_DANGER_CONFIG.medium;
                const habitat = locations.find((l) => l.id === creature.habitatLocationId);

                return (
                  <div
                    key={creature.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {creature.imageUrl ? (
                            <img
                              src={creature.imageUrl}
                              alt={creature.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-border/60 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                              <Skull size={22} />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-sm text-foreground block group-hover:text-primary transition-colors">
                              {creature.name}
                            </span>
                            <span className="text-[10px] text-muted block">
                              {CREATURE_TYPE_LABELS[creature.type] || creature.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditCreatureModal(creature)}
                            className="p-1.5 rounded-xl hover:bg-background text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCreature(creature.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Tehlike Seviyesi Rozeti */}
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${dangerConfig.color}`}>
                          <ShieldAlert size={10} /> {dangerConfig.label}
                        </span>
                      </div>

                      {creature.appearance && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {creature.appearance}
                        </p>
                      )}

                      {habitat && (
                        <div className="p-2 rounded-xl bg-background/50 border border-border/40 text-[11px] flex items-center gap-1.5">
                          <MapPin size={12} className="text-primary shrink-0" />
                          <span className="text-muted">Habitat: <strong className="text-foreground">{habitat.name}</strong></span>
                        </div>
                      )}

                      {creature.abilities && (
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                          <strong className="text-amber-400 block text-[10px] uppercase font-bold">⚡ Yetenekler:</strong>
                          <p className="text-foreground/90 mt-0.5 leading-relaxed">{creature.abilities}</p>
                        </div>
                      )}

                      {creature.weaknesses && (
                        <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                          <strong className="text-rose-400 block text-[10px] uppercase font-bold">🎯 Zayıf Nokta:</strong>
                          <p className="text-foreground/90 mt-0.5 leading-relaxed">{creature.weaknesses}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {creature.isSpoiler ? (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Lock size={10} /> Bölüm {creature.spoilerThresholdChapter || 1}+
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Herkese Açık
                        </span>
                      )}
                      <span>{new Date(creature.createdAt?.seconds ? creature.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. SEKME: Mekân Defteri 2.0 ── */}
      {activeTab === 'locations' && (() => {
        const filteredLocations = locations.filter((loc) => {
          const q = locSearchQuery.toLowerCase().trim();
          const matchesSearch = !q || 
            loc.name.toLowerCase().includes(q) ||
            (loc.description && loc.description.toLowerCase().includes(q)) ||
            (loc.climate && loc.climate.toLowerCase().includes(q)) ||
            (loc.governance && loc.governance.toLowerCase().includes(q));
          const matchesType = locTypeFilter === 'all' || loc.type === locTypeFilter;
          return matchesSearch && matchesType;
        });

        return (
          <div className="space-y-4">
            {/* Üst Başlık & Ekleme */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <Typography variant="h3" className="font-extrabold text-base flex items-center gap-2">
                  Mekân Defteri 2.0
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {locations.length} Mekân
                  </span>
                </Typography>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Evreninizin kıtaları, krallıkları, şehirleri, tapınakları ve hiyerarşik coğrafyası.
                </p>
              </div>
              <Button variant="primary" onPress={() => setIsLocationModalOpen(true)} className="text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Plus size={14} /> Yeni Mekân Ekle
              </Button>
            </div>

            {/* Arama ve Tür Filtreleme Çubuğu */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Mekân adı, iklim veya açıklama ara..."
                  value={locSearchQuery}
                  onChange={(e) => setLocSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border/60 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <select
                value={locTypeFilter}
                onChange={(e) => setLocTypeFilter(e.target.value)}
                className="bg-card border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">Tüm Mekân Türleri ({locations.length})</option>
                {Object.entries(LOCATION_TYPE_LABELS).map(([k, label]) => {
                  const count = locations.filter((l) => l.type === k).length;
                  return (
                    <option key={k} value={k}>
                      {label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Liste Durumu */}
            {filteredLocations.length === 0 ? (
              <div className="p-12 rounded-2xl bg-card/40 border border-border/40 text-center space-y-2">
                <MapPin size={36} className="text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-foreground">
                  {locations.length === 0 ? 'Henüz kayıtlı bir mekân yok.' : 'Arama kriterlerine uygun mekân bulunamadı.'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {locations.length === 0 ? 'Evreninize kıta, krallık, başkent veya özel bir yapı ekleyerek başlayın.' : 'Arama terimini veya filtreyi değiştirin.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((loc) => {
                  const parentLoc = locations.find((l) => l.id === loc.parentLocationId);
                  const childCount = locations.filter((l) => l.parentLocationId === loc.id).length;
                  const charCount = loc.importantCharacterIds?.length || 0;

                  return (
                    <div
                      key={loc.id}
                      onClick={() => openLocationDetail(loc)}
                      className="rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden group cursor-pointer shadow-xs hover:shadow-md"
                    >
                      {/* Görsel / Başlık Bandı */}
                      <div className="w-full h-32 relative bg-muted/30 overflow-hidden">
                        {loc.imageUrl ? (
                          <img
                            src={loc.imageUrl}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-muted/20 to-background text-muted-foreground/40">
                            <Landmark size={28} className="mb-1 text-muted-foreground/50" />
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
                              {LOCATION_TYPE_LABELS[loc.type] || loc.type}
                            </span>
                          </div>
                        )}

                        {/* Tür Rozeti */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-bold uppercase text-primary bg-background/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-border/60 shadow-xs">
                            {LOCATION_TYPE_LABELS[loc.type] || loc.type}
                          </span>
                        </div>

                        {/* Spoiler & Alt Mekân Rozetleri */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                          {loc.isSpoiler && (
                            <span className="text-[10px] font-bold text-amber-500 bg-background/90 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-0.5 shadow-xs">
                              <Lock size={10} /> Bölüm {loc.spoilerThresholdChapter || 1}+
                            </span>
                          )}
                          {childCount > 0 && (
                            <span className="text-[10px] font-bold text-foreground bg-background/90 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-border/60 shadow-xs">
                              {childCount} Alt Mekân
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Kart Gövdesi */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                        <div>
                          {/* Hiyerarşik Üst Mekân Gösterimi */}
                          {parentLoc && (
                            <div className="flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground mb-1">
                              <MapPin size={11} className="text-primary shrink-0" />
                              <span className="truncate">Üst: {parentLoc.name} ({LOCATION_TYPE_LABELS[parentLoc.type] || parentLoc.type})</span>
                            </div>
                          )}

                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                            <span>{loc.name}</span>
                            <Edit3 size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                            {loc.description || 'Açıklama girilmedi.'}
                          </p>
                        </div>

                        {/* Alt Özellik Çipleri */}
                        <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                          {loc.climate && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 truncate max-w-[140px]">
                              🌤 {loc.climate}
                            </span>
                          )}
                          {loc.population && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 truncate max-w-[120px]">
                              👥 {loc.population}
                            </span>
                          )}
                          {charCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              👤 {charCount} Karakter
                            </span>
                          )}
                        </div>

                        {/* Alt Butonlar */}
                        <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold text-primary group-hover:underline">
                            Defteri Aç & Düzenle →
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLocation(loc.id);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Mekânı Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── 4. SEKME: Zaman Çizelgesi ── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3" className="font-bold text-base">Zaman Çizelgesi & Olaylar</Typography>
            <Button variant="primary" onPress={() => setIsEventModalOpen(true)} className="text-xs font-bold py-2 px-3.5 rounded-xl">
              <Plus size={14} className="mr-1" /> Olay Ekle
            </Button>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card/40 border border-border/40 text-center">
              <Clock size={32} className="text-muted/40 mx-auto mb-2" />
              <p className="text-xs text-muted">Henüz kaydedilmiş bir tarihsel olay yok.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {timelineEvents.map((ev, idx) => (
                <div key={ev.id} className="p-4 rounded-2xl bg-card/60 border border-border/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{ev.title}</span>
                        {ev.era && (
                          <span className="text-[10px] font-semibold text-muted bg-background px-2 py-0.5 rounded-md border border-border/50">
                            {ev.era}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">{ev.summary}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEvent(ev.id)} className="text-muted hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5. SEKME: Sözlük ── */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3" className="font-bold text-base">Evren Sözlüğü & Terimler</Typography>
            <Button variant="primary" onPress={() => setIsTermModalOpen(true)} className="text-xs font-bold py-2 px-3.5 rounded-xl">
              <Plus size={14} className="mr-1" /> Terim Ekle
            </Button>
          </div>

          {glossaryTerms.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card/40 border border-border/40 text-center">
              <BookA size={32} className="text-muted/40 mx-auto mb-2" />
              <p className="text-xs text-muted">Evrene ait büyü, coğrafya veya kurgusal sözlük terimleri ekleyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {glossaryTerms.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-card/60 border border-border/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{t.term}</span>
                      {t.category && (
                        <span className="text-[10px] font-semibold text-muted bg-background px-2 py-0.5 rounded-md border border-border/40">
                          {t.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">{t.meaning}</p>
                  </div>
                  <div className="pt-2 mt-2 flex justify-end">
                    <button onClick={() => handleDeleteTerm(t.id)} className="text-muted hover:text-destructive p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6. SEKME: Lore ── */}
      {activeTab === 'lore' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3" className="font-bold text-base">Dünya Bilgisi & Efsaneler</Typography>
            <Button variant="primary" onPress={() => setIsLoreModalOpen(true)} className="text-xs font-bold py-2 px-3.5 rounded-xl">
              <Plus size={14} className="mr-1" /> Lore Ekle
            </Button>
          </div>

          {loreList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card/40 border border-border/40 text-center">
              <Scroll size={32} className="text-muted/40 mx-auto mb-2" />
              <p className="text-xs text-muted">Mitoloji, kadim sırlar ve dünya kurallarını belgeleyin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loreList.map((lore) => (
                <div key={lore.id} className="p-4 rounded-2xl bg-card/60 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground">{lore.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md capitalize">
                        {lore.category}
                      </span>
                      <button onClick={() => handleDeleteLore(lore.id)} className="text-muted hover:text-destructive p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{lore.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 7. SEKME: Dünya Haritası ── */}
      {activeTab === 'maps' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <MapIcon size={18} className="text-primary" />
                <span>İnteraktif Dünya Haritası</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Kıtalarınızı, şehirlerinizi ve gizli bölgelerinizi harita üzerinde işaretleyin.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={() => setIsCreateMapModalOpen(true)}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md"
            >
              <Plus size={14} className="mr-1.5" /> Yeni Harita Ekle
            </Button>
          </div>

          {maps.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <MapIcon size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Dünyanın sınırlarını çizmek zorunda değilsin.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Elindeki dünya, kıta veya şehir haritasını yükleyerek evreninin coğrafyasını hemen canlandırmaya başla.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={() => setIsCreateMapModalOpen(true)}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Haritanı Yükle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Çoklu Harita Seçici Bar */}
              <div className="flex items-center justify-between gap-3 bg-card/60 p-2 rounded-2xl border border-border/40 overflow-x-auto">
                <div className="flex items-center gap-1.5">
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

                {selectedMapId && (
                  <button
                    onClick={() => handleDeleteMap(selectedMapId)}
                    className="text-xs text-muted hover:text-destructive p-2 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                    title="Bu Haritayı Sil"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Haritayı Sil</span>
                  </button>
                )}
              </div>

              {/* Aktif Harita Bileşeni */}
              {(() => {
                const currentMap = maps.find((m) => m.id === selectedMapId) || maps[0];
                if (!currentMap) return null;

                return (
                  <InteractiveWorldMap
                    map={currentMap}
                    locations={locations}
                    events={timelineEvents}
                    isEditable={true}
                    onAddMarker={handleAddMapMarker}
                    onUpdateMarker={handleUpdateMapMarker}
                    onDeleteMarker={handleDeleteMapMarker}
                  />
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── 8. SEKME: Organizasyonlar & Hanedanlar ── */}
      {activeTab === 'organizations' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                <span>Organizasyonlar, Hanedanlar & Aileler</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Krallıklar, imparatorluklar, loncalar, okullar, tarikatlar ve hanedan soyları.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateOrgModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Organizasyon Ekle
            </Button>
          </div>

          {organizations.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Building2 size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir organizasyon veya hanedan tanımlanmadı.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Evrenindeki krallıkları, büyü akademilerini, gizli cemiyetleri veya köklü hanedan ailelerini oluşturarak güç dengesini kur.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateOrgModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Organizasyonu Kur
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map((org) => {
                const leader = characters.find((c) => c.id === org.leaderCharacterId);
                const hq = locations.find((l) => l.id === org.headquarterLocationId);

                return (
                  <div
                    key={org.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {org.symbolUrl ? (
                            <img
                              src={org.symbolUrl}
                              alt={org.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-border/50 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-sm">
                              {org.type === 'family' || org.type === 'kingdom' || org.type === 'empire' ? (
                                <Crown size={20} />
                              ) : (
                                <Building2 size={20} />
                              )}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {org.name}
                            </h4>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mt-0.5">
                              {ORG_TYPE_LABELS[org.type] || org.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditOrgModal(org)}
                            className="p-1.5 rounded-xl hover:bg-background/80 text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrg(org.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {org.description && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-3">
                          {org.description}
                        </p>
                      )}

                      {org.ideology && (
                        <div className="p-2.5 rounded-2xl bg-background/50 border border-border/40 text-[11px] text-foreground/90 italic flex items-start gap-1.5">
                          <span className="font-bold text-primary not-italic shrink-0">İdeoloji:</span>
                          <span className="line-clamp-2">"{org.ideology}"</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/40 space-y-1.5 text-[11px]">
                        {leader && (
                          <div className="flex items-center gap-2 text-muted">
                            <Crown size={12} className="text-amber-400 shrink-0" />
                            <span className="font-semibold text-foreground/80">Lider:</span>
                            <span className="text-foreground truncate">{leader.name}</span>
                          </div>
                        )}

                        {hq && (
                          <div className="flex items-center gap-2 text-muted">
                            <MapPin size={12} className="text-primary shrink-0" />
                            <span className="font-semibold text-foreground/80">Merkez:</span>
                            <span className="text-foreground truncate">{hq.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {org.isSpoiler ? (
                        <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Lock size={10} /> Bölüm {org.spoilerThresholdChapter || 1}+ Spoiler
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Herkese Açık
                        </span>
                      )}
                      <span>{new Date(org.createdAt?.seconds ? org.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 9. SEKME: Eşyalar & Artefaktlar ── */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Sword size={18} className="text-primary" />
                <span>Eşyalar, Artefaktlar & Kalıntılar</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Efsanevi silahlar, büyülü nesneler, grimoire'lar, kadim teknolojiler ve tılsımlar.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateItemModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Eşya Ekle
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Sword size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir eşya veya artefakt eklenmedi.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Karakterlerin taşıdığı büyülü kılıçları, kadim yüzükleri veya kaderi değiştiren mühürlü kitapları kaydedin.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateItemModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Eşyayı Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const owner = characters.find((c) => c.id === item.currentOwnerId);

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-border/50 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0 shadow-sm">
                              <Sword size={20} />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                              {item.type || 'Artefakt'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditItemModal(item)}
                            className="p-1.5 rounded-xl hover:bg-background/80 text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {/* Güç & İşlev */}
                      {item.powerDescription && (
                        <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-foreground/90 space-y-0.5">
                          <span className="font-bold text-violet-400 flex items-center gap-1">
                            <Sparkles size={11} /> Güç / İşlev:
                          </span>
                          <p className="line-clamp-2 text-muted">{item.powerDescription}</p>
                        </div>
                      )}

                      {/* Sınır & Bedel */}
                      {item.limitation && (
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-foreground/90 space-y-0.5">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <AlertTriangle size={11} /> Sınır & Bedel:
                          </span>
                          <p className="line-clamp-2 text-muted">{item.limitation}</p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/40 space-y-1.5 text-[11px]">
                        {owner && (
                          <div className="flex items-center gap-2 text-muted">
                            <User size={12} className="text-primary shrink-0" />
                            <span className="font-semibold text-foreground/80">Sahibi:</span>
                            <span className="text-foreground truncate">{owner.name}</span>
                          </div>
                        )}

                        {item.origin && (
                          <div className="flex items-center gap-2 text-muted">
                            <Gem size={12} className="text-indigo-400 shrink-0" />
                            <span className="font-semibold text-foreground/80">Köken:</span>
                            <span className="text-foreground truncate">{item.origin}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {item.isSpoiler ? (
                        <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Lock size={10} /> Bölüm {item.spoilerThresholdChapter || 1}+ Spoiler
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Herkese Açık
                        </span>
                      )}
                      <span>{new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 10. SEKME: Güç Sistemleri ── */}
      {activeTab === 'powers' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                <span>Güç / Büyü / Teknoloji Sistemleri</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Enerji kaynakları, büyü kuralları, kullanım bedelleri, tehlikeler ve seviye rütbeleri.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreatePowerModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Güç Sistemi Ekle
            </Button>
          </div>

          {powerSystems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Zap size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir güç veya büyü sistemi tanımlanmadı.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Evrenindeki büyü prensiplerini, kimlerin kullanabildiğini ve kullanımın ölümcül bedellerini belirle.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreatePowerModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Güç Sistemini Kur
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {powerSystems.map((power) => (
                <div
                  key={power.id}
                  className="p-6 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 shadow-sm">
                            <Zap size={18} />
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {power.name}
                            </h4>
                            {power.source && (
                              <span className="text-[11px] text-muted">
                                Kaynak: <span className="text-foreground/90 font-semibold">{power.source}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditPowerModal(power)}
                          className="p-1.5 rounded-xl hover:bg-background/80 text-muted hover:text-foreground transition-colors"
                          title="Düzenle"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePower(power.id)}
                          className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Temel Prensip */}
                    {power.corePrinciples && (
                      <div>
                        <span className="text-[11px] font-bold text-muted block mb-0.5">Temel Prensip:</span>
                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {power.corePrinciples}
                        </p>
                      </div>
                    )}

                    {/* Kimler Kullanabilir */}
                    {power.whoCanUse && (
                      <div className="p-2.5 rounded-2xl bg-background/50 border border-border/40 text-xs text-muted flex items-center gap-2">
                        <User size={13} className="text-primary shrink-0" />
                        <span>Kullananlar: <strong className="text-foreground">{power.whoCanUse}</strong></span>
                      </div>
                    )}

                    {/* Kurallar & Sınırlar */}
                    {power.rulesAndLimits && (
                      <div className="p-3 rounded-2xl bg-background/60 border border-border/50 text-xs space-y-1">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                          <Shield size={12} className="text-blue-400" /> Kurallar ve Sınırlar
                        </span>
                        <p className="text-muted leading-relaxed whitespace-pre-wrap">{power.rulesAndLimits}</p>
                      </div>
                    )}

                    {/* Bedel & Riskler */}
                    {power.costAndRisks && (
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                        <span className="font-bold text-rose-400 flex items-center gap-1.5 text-[11px]">
                          <AlertTriangle size={12} /> Bedel ve Tehlikeli Riskler
                        </span>
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{power.costAndRisks}</p>
                      </div>
                    )}

                    {/* Seviyeler / Rütbeler */}
                    {power.levelsOrTiers && power.levelsOrTiers.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-muted block">Kademeler & Seviyeler:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {power.levelsOrTiers.map((tier, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {tier}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                    <span className="text-primary font-bold">{power.levelsOrTiers?.length || 0} Kademe</span>
                    <span>{new Date(power.createdAt?.seconds ? power.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 10.5 SEKME: Kültür, İnanç, Mitoloji & Toplum Düzeni ── */}
      {activeTab === 'cultures' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Landmark size={18} className="text-primary" />
                <span>Kültür, İnanç & Dünya Düzeni</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Kurgusal gelenekler, tapınak ve mitoloji sistemleri, siyasi rejimler ve ticaret yapıları.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateCultureModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Kültür / İnanç Ekle
            </Button>
          </div>

          {cultures.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Landmark size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz kültürel veya dini bir sistem eklenmedi.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Evreninizin inançlarını, kutsal tapınaklarını, geleneklerini, para birimlerini veya siyasi yapısını kaydedin.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateCultureModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Sistemi Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cultures.map((cult) => {
                return (
                  <div
                    key={cult.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {cult.imageUrl ? (
                            <img
                              src={cult.imageUrl}
                              alt={cult.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-border/60 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                              <Landmark size={22} />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-sm text-foreground block group-hover:text-primary transition-colors">
                              {cult.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {CULTURE_CATEGORY_LABELS[cult.category] || cult.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditCultureModal(cult)}
                            className="p-1.5 rounded-xl hover:bg-background text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCulture(cult.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {cult.description && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-3">
                          {cult.description}
                        </p>
                      )}

                      {/* Değerler / Ritüeller */}
                      {cult.traditionsAndCustoms && (
                        <div className="p-2.5 rounded-2xl bg-background/60 border border-border/50 text-xs space-y-1">
                          <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                            <Sparkles size={12} className="text-amber-400" /> Gelenekler & Ritüeller
                          </span>
                          <p className="text-muted leading-relaxed">{cult.traditionsAndCustoms}</p>
                        </div>
                      )}

                      {/* Tanrılar / İnanç Figürleri */}
                      {cult.deitiesAndFigures && (
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
                          <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-[11px]">
                            <Compass size={12} /> Kutsal Varlıklar & Figürler
                          </span>
                          <p className="text-foreground/90 leading-relaxed">{cult.deitiesAndFigures}</p>
                        </div>
                      )}

                      {/* Siyaset / Yönetim / Ekonomi */}
                      {(cult.governmentSystem || cult.currencyAndTrade) && (
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {cult.governmentSystem && (
                            <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                              <span className="text-muted font-bold block">Yönetim:</span>
                              <span className="text-foreground font-semibold">{cult.governmentSystem}</span>
                            </div>
                          )}
                          {cult.currencyAndTrade && (
                            <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                              <span className="text-muted font-bold block">Para / Ticaret:</span>
                              <span className="text-foreground font-semibold">{cult.currencyAndTrade}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {cult.isSpoiler ? (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Lock size={10} /> Bölüm {cult.spoilerThresholdChapter || 1}+
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Herkese Açık
                        </span>
                      )}
                      <span>{new Date(cult.createdAt?.seconds ? cult.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 10.6 SEKME: Görsel Arşiv, Galeri & Moodboard (PRD 46) ── */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Palette size={18} className="text-primary" />
                <span>Görsel Arşiv, Galeri & Moodboard</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Karakter eskizleri, mimari referanslar, kostümler, atmosfer paletleri ve yazar moodboard&apos;u.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateMediaModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Görsel / Eskiz Ekle
            </Button>
          </div>

          {mediaList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Palette size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir görsel veya konsept çizimi eklenmedi.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Evreninizin karakter portrelerini, kostüm eskizlerini veya mekân moodboard&apos;larını WebP formatında optimize ederek yükleyin.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateMediaModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Görseli Yükle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mediaList.map((m) => {
                return (
                  <div
                    key={m.id}
                    className="rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Görsel Alanı */}
                      <div className="relative aspect-[4/3] bg-background/80 overflow-hidden">
                        <img
                          src={m.imageUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-background/85 backdrop-blur-md text-foreground border border-border/40 shadow-sm">
                            {MEDIA_CATEGORY_LABELS[m.category] || m.category}
                          </span>
                          {m.isAuthorOnly && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                              <Lock size={10} /> Sadece Yazar
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md rounded-xl p-1 border border-border/40">
                          <button
                            onClick={() => openEditMediaModal(m)}
                            className="p-1 rounded-lg hover:bg-card text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(m.id)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Başlık ve Detaylar */}
                      <div className="px-4 space-y-2">
                        <span className="font-extrabold text-sm text-foreground block group-hover:text-primary transition-colors truncate">
                          {m.title}
                        </span>
                        {m.description && (
                          <p className="text-xs text-muted leading-relaxed line-clamp-2">
                            {m.description}
                          </p>
                        )}

                        {/* Renk Paleti Noktaları */}
                        {m.colorPalette && m.colorPalette.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            {m.colorPalette.map((color, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        )}

                        {/* Etiketler */}
                        {m.tags && m.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {m.tags.slice(0, 3).map((t, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                                #{t}
                              </span>
                            ))}
                            {m.tags.length > 3 && (
                              <span className="text-[9px] text-muted">+{m.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {m.isSpoiler ? (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Lock size={10} /> Bölüm {m.spoilerThresholdChapter || 1}+
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {m.isAuthorOnly ? 'Gizli' : 'Okuyucuya Açık'}
                        </span>
                      )}
                      <span>{new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 10.7 SEKME: Evren Müzikleri, Soundtrack & Ambiyans (PRD 29) ── */}
      {activeTab === 'soundtracks' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                <Music size={18} className="text-primary" />
                <span>Evren Müzikleri & Ambiyans Parçaları</span>
              </Typography>
              <p className="text-xs text-muted mt-0.5">
                Spotify, YouTube ve doğrudan ses bağlantılarıyla evren temaları ve okuma ambiyansları.
              </p>
            </div>

            <Button
              variant="primary"
              onPress={openCreateSoundtrackModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Yeni Parça Ekle
            </Button>
          </div>

          {soundtracks.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/40 border border-border/40 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Music size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir müzik veya ambiyans parçası eklenmedi.
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Evreninizin ana temasını, krallıkların fon müziklerini veya savaş ambiyanslarını bağlayın.
                </p>
              </div>
              <Button
                variant="primary"
                onPress={openCreateSoundtrackModal}
                className="text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg"
              >
                <Plus size={14} className="mr-1.5" /> İlk Parçayı Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {soundtracks.map((s) => {
                const parsed = parseAudioTrack(s.url);
                return (
                  <div
                    key={s.id}
                    className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                            <Music size={22} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-sm text-foreground block group-hover:text-primary transition-colors truncate">
                              {s.title}
                            </span>
                            {s.artist && (
                              <span className="text-xs text-muted block truncate">
                                {s.artist}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block">
                                {SOUNDTRACK_THEME_LABELS[s.themeType] || s.themeType}
                              </span>
                              <span className="text-[9px] font-semibold text-muted bg-background px-1.5 py-0.5 rounded-md border border-border/40">
                                {getAudioPlatformLabel(parsed.platform)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditSoundtrackModal(s)}
                            className="p-1.5 rounded-xl hover:bg-background text-muted hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSoundtrack(s.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {s.description && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {s.description}
                        </p>
                      )}

                      {/* Bağlantı Önizlemesi */}
                      <div className="pt-2">
                        {parsed.platform === 'direct' ? (
                          <audio controls src={parsed.embedUrl} className="w-full h-8" />
                        ) : parsed.platform === 'spotify' ? (
                          <iframe
                            src={parsed.embedUrl}
                            width="100%"
                            height="80"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-xl border border-border/40"
                          />
                        ) : parsed.platform === 'youtube' ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/50 text-xs text-primary hover:bg-primary/5 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 font-bold">
                              <Volume2 size={14} /> YouTube&apos;da Dinle
                            </span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/50 text-xs text-primary hover:bg-primary/5 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 font-bold">
                              <ExternalLink size={14} /> Bağlantıyı Aç
                            </span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                      {s.isSpoiler ? (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Lock size={10} /> Bölüm {s.spoilerThresholdChapter || 1}+
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Herkese Açık
                        </span>
                      )}
                      <span>{new Date(s.createdAt?.seconds ? s.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 15. SEKME: Seri Bible & Canon Kuralları (PRD 30) ── */}
      {activeTab === 'canon_rules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2">
                <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                  <Scale className="text-primary" size={18} /> Seri Bible & Canon Kuralları
                </Typography>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {canonRules.length} Kural
                </span>
              </div>
              <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                Evrenin çiğnenemez temel kuralları: büyü limitleri, fizik ve doğaüstü yasalar, kesinleşmiş tarihsel olaylar ve yazarların çelişkiye düşmesini önleyen kısıtlamalar.
              </p>
            </div>
            <Button
              variant="primary"
              onPress={openCreateCanonModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus size={14} /> Yeni Canon Kuralı Ekle
            </Button>
          </div>

          {/* Kategori Filtresi */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setCanonCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                canonCategoryFilter === 'all'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
              }`}
            >
              Tümü ({canonRules.length})
            </button>
            {(Object.keys(CANON_RULE_CATEGORY_LABELS) as CanonRuleCategory[]).map((catKey) => {
              const count = canonRules.filter((r) => r.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setCanonCategoryFilter(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    canonCategoryFilter === catKey
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                  }`}
                >
                  {CANON_RULE_CATEGORY_LABELS[catKey]} ({count})
                </button>
              );
            })}
          </div>

          {/* Kurallar Listesi */}
          {canonRules.filter((r) => canonCategoryFilter === 'all' || r.category === canonCategoryFilter).length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card/40 border border-dashed border-border/60">
              <Scale className="mx-auto text-muted/40 mb-3" size={40} />
              <Typography variant="h4" className="font-bold text-sm text-foreground/80 mb-1">
                Kayıtlı Canon Kuralı Bulunamadı
              </Typography>
              <p className="text-xs text-muted max-w-sm mx-auto mb-4">
                Bu kategoride henüz bir süreklilik kuralı tanımlanmadı. Yazarlarınızın ve hikayelerinizin tutarlı kalması için ilk kuralınızı belirleyin.
              </p>
              <Button variant="primary" onPress={openCreateCanonModal} className="text-xs font-bold py-2 px-4 rounded-xl">
                <Plus size={14} /> Kural Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canonRules
                .filter((r) => canonCategoryFilter === 'all' || r.category === canonCategoryFilter)
                .map((rule) => {
                  return (
                    <div
                      key={rule.id}
                      className="p-5 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm group backdrop-blur-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
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
                                Esnek / Rehber
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditCanonModal(rule)}
                              className="p-1.5 text-muted hover:text-foreground hover:bg-background/80 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteCanonRule(rule.id)}
                              className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-foreground mb-1.5">{rule.title}</h4>
                          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                            {rule.description}
                          </p>
                        </div>

                        {/* İhlal Bedeli (Consequences) */}
                        {rule.consequences && (
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-300">
                              <AlertTriangle size={13} /> İhlal Edilirse Ne Olur? (Bedel)
                            </div>
                            <p className="text-[11px] leading-relaxed text-amber-200/90 whitespace-pre-line">
                              {rule.consequences}
                            </p>
                          </div>
                        )}

                        {/* İstisnalar (Exceptions) */}
                        {rule.exceptions && (
                          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-300">
                              <Sparkles size={13} /> İstisnai Durumlar
                            </div>
                            <p className="text-[11px] leading-relaxed text-blue-200/90 whitespace-pre-line">
                              {rule.exceptions}
                            </p>
                          </div>
                        )}

                        {rule.authorNotes && (
                          <div className="text-[11px] text-muted italic bg-background/40 p-2.5 rounded-xl border border-border/30">
                            <span className="font-bold not-italic text-foreground/70">Yazar Notu:</span> {rule.authorNotes}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-4 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                        <div className="flex items-center gap-2">
                          {rule.isPublic ? (
                            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Okuyucuya Açık
                            </span>
                          ) : (
                            <span className="text-muted bg-card px-2 py-0.5 rounded-md border border-border/40 flex items-center gap-1">
                              <Lock size={10} /> Yazar Odası (Gizli)
                            </span>
                          )}
                          {rule.isSpoiler && (
                            <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                              <EyeOff size={10} /> Bölüm {rule.spoilerChapterOrder || 1}+
                            </span>
                          )}
                        </div>
                        <span>{new Date(rule.createdAt?.seconds ? rule.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── 16. SEKME: Açık Kurgu Düğümleri & Gizem Takipçisi (PRD 31) ── */}
      {activeTab === 'plot_threads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2">
                <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                  <HelpCircle className="text-primary" size={18} /> Açık Kurgu Düğümleri & Gizem Takipçisi
                </Typography>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {plotThreads.length} Düğüm
                </span>
              </div>
              <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                Eserlerde ortaya atılan gizemler, çözülmemiş sırlar, ekilen ipuçları (clues) ve kapanmamış olay örgüleri. Hepsini takip edin ve seriler arasında unutulmuş düğüm bırakmayın.
              </p>
            </div>
            <Button
              variant="primary"
              onPress={openCreateThreadModal}
              className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus size={14} /> Yeni Gizem / Düğüm Ekle
            </Button>
          </div>

          {/* Durum Filtresi */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setThreadStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                threadStatusFilter === 'all'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
              }`}
            >
              Tümü ({plotThreads.length})
            </button>
            {(Object.keys(PLOT_THREAD_STATUS_LABELS) as PlotThreadStatus[]).map((stKey) => {
              const count = plotThreads.filter((t) => t.status === stKey).length;
              return (
                <button
                  key={stKey}
                  onClick={() => setThreadStatusFilter(stKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    threadStatusFilter === stKey
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                  }`}
                >
                  {PLOT_THREAD_STATUS_LABELS[stKey]} ({count})
                </button>
              );
            })}
          </div>

          {/* Düğümler Listesi */}
          {plotThreads.filter((t) => threadStatusFilter === 'all' || t.status === threadStatusFilter).length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card/40 border border-dashed border-border/60">
              <HelpCircle className="mx-auto text-muted/40 mb-3" size={40} />
              <Typography variant="h4" className="font-bold text-sm text-foreground/80 mb-1">
                Kayıtlı Kurgu Düğümü Bulunamadı
              </Typography>
              <p className="text-xs text-muted max-w-sm mx-auto mb-4">
                Bu filtrede açık veya çözülmüş bir kurgu düğümü bulunmuyor. Eserlerinizdeki merak uyandırıcı soruları kaydetmeye başlayın.
              </p>
              <Button variant="primary" onPress={openCreateThreadModal} className="text-xs font-bold py-2 px-4 rounded-xl">
                <Plus size={14} /> Düğüm Ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {plotThreads
                .filter((t) => threadStatusFilter === 'all' || t.status === threadStatusFilter)
                .map((thread) => {
                  return (
                    <div
                      key={thread.id}
                      className="p-5 sm:p-6 rounded-3xl bg-card/70 border border-border/60 hover:border-primary/40 transition-all shadow-sm group backdrop-blur-sm space-y-4"
                    >
                      {/* Üst Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Önem */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                thread.importance === 'critical'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : thread.importance === 'major'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : thread.importance === 'minor'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}
                            >
                              {PLOT_THREAD_IMPORTANCE_LABELS[thread.importance]}
                            </span>

                            {/* Durum */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                thread.status === 'resolved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : thread.status === 'clues_planted'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : thread.status === 'abandoned'
                                  ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              {PLOT_THREAD_STATUS_LABELS[thread.status]}
                            </span>

                            {/* Giriş Bilgisi */}
                            {thread.introducedInStoryTitle && (
                              <span className="text-[10px] text-muted flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded-md border border-border/40">
                                📖 {thread.introducedInStoryTitle}
                                {thread.introducedInChapterOrder && ` (Bölüm ${thread.introducedInChapterOrder})`}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-base text-foreground">{thread.title}</h4>
                        </div>

                        {/* Aksiyonlar */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => handleToggleThreadStatus(thread)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                              thread.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-background/80 text-foreground border-border/60 hover:bg-primary/10 hover:border-primary/40'
                            }`}
                            title="Çözüm durumunu değiştir"
                          >
                            <CheckCircle2 size={13} />
                            <span>{thread.status === 'resolved' ? 'Çözüldü' : 'Çözüldü Olarak İşaretle'}</span>
                          </button>
                          <button
                            onClick={() => openEditThreadModal(thread)}
                            className="p-2 text-muted hover:text-foreground hover:bg-background/80 rounded-xl transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteThread(thread.id)}
                            className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Açıklama */}
                      <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
                        {thread.description}
                      </p>

                      {/* Çözüm Özeti (Resolved Banner) */}
                      {thread.resolutionSummary && (
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-300">
                            <CheckCircle2 size={13} /> Gizemin Çözümü
                            {thread.resolvedInStoryTitle && (
                              <span className="text-[10px] text-emerald-400/80 font-normal">
                                ({thread.resolvedInStoryTitle} - Bölüm {thread.resolvedInChapterOrder || '?'})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-emerald-200/95 whitespace-pre-line">
                            {thread.resolutionSummary}
                          </p>
                        </div>
                      )}

                      {/* İpuçları (Clues) Alanı */}
                      <div className="p-4 rounded-2xl bg-background/50 border border-border/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="text-amber-400" size={14} />
                            <span className="text-xs font-bold text-foreground">
                              Ekilen İpuçları & Keşifler ({thread.clues?.length || 0})
                            </span>
                          </div>
                          <Button
                            variant="secondary"
                            onPress={() => openAddClueModal(thread)}
                            className="text-[11px] font-bold py-1 px-2.5 rounded-lg border border-border/50 hover:bg-primary/10 flex items-center gap-1"
                          >
                            <Plus size={11} /> İpucu Ekle
                          </Button>
                        </div>

                        {(!thread.clues || thread.clues.length === 0) ? (
                          <p className="text-[11px] text-muted italic">
                            Henüz bu düğümle ilgili bir ipucu eklenmedi. Bölümler yazıldıkça yazarın bıraktığı izleri buraya ekleyebilirsiniz.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {thread.clues.map((clue, idx) => (
                              <div
                                key={clue.id || idx}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card/60 border border-border/30 text-xs"
                              >
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary/15 text-primary whitespace-nowrap mt-0.5">
                                  #{idx + 1}
                                </span>
                                <div className="flex-1 space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    {(clue.storyTitle || clue.chapterOrder) && (
                                      <span className="text-[10px] font-bold text-foreground/80">
                                        {clue.storyTitle ? clue.storyTitle : ''} {clue.chapterOrder ? `Bölüm ${clue.chapterOrder}` : ''}
                                      </span>
                                    )}
                                    <span className="text-[9px] text-muted">
                                      {new Date(clue.createdAt?.seconds ? clue.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-foreground/90 whitespace-pre-line leading-relaxed">
                                    {clue.note}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {thread.authorNotes && (
                        <div className="text-[11px] text-muted italic bg-background/40 p-2.5 rounded-xl border border-border/30">
                          <span className="font-bold not-italic text-foreground/70">Gizli Yazar Notu:</span> {thread.authorNotes}
                        </div>
                      )}

                      {/* Alt Bar */}
                      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted font-semibold">
                        <div className="flex items-center gap-2">
                          {thread.isPublic ? (
                            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Okuyucuya Açık Gizem
                            </span>
                          ) : (
                            <span className="text-muted bg-card px-2 py-0.5 rounded-md border border-border/40 flex items-center gap-1">
                              <Lock size={10} /> Yazar Odası (Gizli)
                            </span>
                          )}
                          {thread.isSpoiler && (
                            <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                              <EyeOff size={10} /> Bölüm {thread.spoilerChapterOrder || 1}+ Sonrası
                            </span>
                          )}
                        </div>
                        <span>{new Date(thread.createdAt?.seconds ? thread.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}


      {/* ── 17. SEKME: Ekip & İzinler (PRD 32 & 66) ── */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Üst Bilgi & Aksiyon Kartı */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2.5">
                <Typography variant="h3" className="font-bold text-base sm:text-lg flex items-center gap-2 text-foreground">
                  <Users className="text-primary" size={20} />
                  <span>Çoklu Yazar & Ekip Yönetimi</span>
                </Typography>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {(universe.members?.length || 0) + 1} Kişilik Ekip
                </span>
              </div>
              <p className="text-xs text-muted mt-1.5 max-w-2xl leading-relaxed">
                Ortak yazarlarınız (co-authors), evren kurallarını denetleyen Lore Master'lar ve illüstratörlerle birlikte ortak kurgusal evreninizi inşa edin.
              </p>
            </div>

            {canManageMembers ? (
              <Button
                variant="primary"
                onPress={() => setIsAddMemberModalOpen(true)}
                className="text-xs font-bold py-2.5 px-4 rounded-xl shadow-md whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto active:scale-95 transition-transform"
              >
                <UserPlus size={15} />
                <span>+ Üye Davet Et</span>
              </Button>
            ) : (
              <span className="text-xs text-muted italic bg-background/50 px-3 py-1.5 rounded-xl border border-border/40 self-start sm:self-auto">
                Üye davet yetkisi yalnızca evren sahibine aittir.
              </span>
            )}
          </div>

          {/* Rol & İzin Rehberi Kartı */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xs space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-primary" />
              Rol İzinleri & Yetki Matrisi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.entries(UNIVERSE_MEMBER_ROLE_CONFIG) as [UniverseMemberRole, any][])
                .filter(([roleKey]) => roleKey !== 'owner')
                .map(([roleKey, conf]) => (
                  <div
                    key={roleKey}
                    className="p-3 rounded-xl bg-background/50 border border-border/30 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color} ${conf.border}`}>
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      {conf.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Üye Listesi */}
          <div className="space-y-3">
            <Typography variant="h3" className="font-bold text-sm text-foreground">
              Ekip Üyeleri ({(universe.members?.length || 0) + 1})
            </Typography>

            <div className="space-y-2.5">
              {/* 1. Kurucu / Asıl Yazar (Değiştirilemez) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-card via-card/80 to-purple-500/5 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0 shadow-inner">
                    <Crown size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">
                        {universe.authorId === firebaseUser?.uid ? 'Sen (Evren Kurucusu)' : 'Evren Kurucusu'}
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        {UNIVERSE_MEMBER_ROLE_CONFIG.owner.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      {UNIVERSE_MEMBER_ROLE_CONFIG.owner.description}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span className="text-[11px] text-muted bg-background/60 px-3 py-1 rounded-xl border border-border/40 font-medium">
                    Asıl Yaratıcı
                  </span>
                </div>
              </div>

              {/* 2. Ortak Çalışanlar */}
              {universe.members && universe.members.length > 0 ? (
                universe.members.map((member) => {
                  const roleConfig = UNIVERSE_MEMBER_ROLE_CONFIG[member.role] || UNIVERSE_MEMBER_ROLE_CONFIG.viewer;
                  const isUpdatingThis = updatingMemberUserId === member.userId;

                  return (
                    <div
                      key={member.userId}
                      className="p-4 sm:p-5 rounded-2xl bg-card/60 hover:bg-card border border-border/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-background border border-border/60 overflow-hidden flex items-center justify-center text-foreground font-bold text-sm shrink-0">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{member.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground">
                              {member.displayName}
                            </span>
                            {member.username && (
                              <span className="text-xs text-muted">
                                @{member.username}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}>
                              {roleConfig.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted mt-0.5">
                            {roleConfig.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {canManageMembers ? (
                          <>
                            <select
                              value={member.role}
                              disabled={isUpdatingThis}
                              onChange={(e) => handleUpdateMemberRole(member.userId, e.target.value as UniverseMemberRole)}
                              className="bg-background border border-border/60 text-foreground text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-primary/50 cursor-pointer disabled:opacity-50"
                            >
                              <option value="co_author">Ortak Yazar</option>
                              <option value="lore_master">Lore Master</option>
                              <option value="illustrator">İllüstratör</option>
                              <option value="viewer">Gözlemci</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.userId, member.displayName)}
                              title="Ekipten Çıkar"
                              className="p-2 rounded-xl text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted">
                            {member.addedAt
                              ? (typeof member.addedAt?.toDate === 'function'
                                  ? member.addedAt.toDate().toLocaleDateString('tr-TR')
                                  : member.addedAt?.seconds
                                  ? new Date(member.addedAt.seconds * 1000).toLocaleDateString('tr-TR')
                                  : new Date(member.addedAt).toLocaleDateString('tr-TR'))
                              : 'Ekip Üyesi'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 sm:p-12 rounded-2xl bg-card/30 border border-dashed border-border/60 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Users size={24} />
                  </div>
                  <Typography variant="h3" className="font-bold text-sm mb-1 text-foreground">
                    Henüz ortak çalışan davet edilmedi
                  </Typography>
                  <p className="text-xs text-muted max-w-sm mb-4 leading-relaxed">
                    Bu evreni tek başınıza yönetiyorsunuz. Diğer yazarları ortak yazar veya Lore Master olarak ekleyerek ortak eserler üretebilirsiniz.
                  </p>
                  {canManageMembers && (
                    <Button
                      variant="secondary"
                      onPress={() => setIsAddMemberModalOpen(true)}
                      className="text-xs font-bold py-2 px-4 rounded-xl border border-border/60 hover:bg-primary/10"
                    >
                      <UserPlus size={14} className="mr-1.5" /> İlk Üyeyi Davet Et
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Üye Davet Et (PRD 32 & 66) ── */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setSelectedUserToInvite(null);
                setMemberSearchQuery('');
              }}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div>
              <Typography variant="h3" className="font-bold text-base text-foreground flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                Evrene Yeni Ekip Üyesi Davet Et
              </Typography>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Readixon platformundaki bir yazarı veya üyeyi arayın ve evren rolünü belirleyin.
              </p>
            </div>

            {/* Arama Alanı */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted block">Kullanıcı Ara (@kullanıcıadı veya isim)</label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Örn: ahmet, @yazar..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-8 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
                {isSearchingUsers && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                )}
              </div>
            </div>

            {/* Arama Sonuçları */}
            {memberSearchResults.length > 0 && !selectedUserToInvite && (
              <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 bg-background/50 border border-border/40 rounded-xl scrollbar-thin">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block px-1">
                  Sonuçlar ({memberSearchResults.length})
                </span>
                {memberSearchResults.map((user) => (
                  <div
                    key={user.uid}
                    onClick={() => {
                      setSelectedUserToInvite(user);
                      setMemberSearchQuery(user.displayName || user.username || '');
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-card cursor-pointer transition-colors border border-transparent hover:border-border/40"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {user.displayName || 'İsimsiz Yazar'}
                      </span>
                      {user.username && (
                        <span className="text-[10px] text-muted block truncate">
                          @{user.username}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      Seç
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Seçilen Kullanıcı Özeti */}
            {selectedUserToInvite && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                    {selectedUserToInvite.photoURL ? (
                      <img src={selectedUserToInvite.photoURL} alt={selectedUserToInvite.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserCheck size={16} />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {selectedUserToInvite.displayName || 'Kullanıcı'}
                    </span>
                    {selectedUserToInvite.username && (
                      <span className="text-[10px] text-muted block">
                        @{selectedUserToInvite.username}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserToInvite(null)}
                  className="text-muted hover:text-foreground text-xs p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Rol Seçimi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted block">Evren Rolü & Yetki Düzeyi</label>
              <select
                value={selectedInviteRole}
                onChange={(e) => setSelectedInviteRole(e.target.value as UniverseMemberRole)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="co_author">✍️ Ortak Yazar (Co-Author) - Eser bağlama ve dünya inşası</option>
                <option value="lore_master">📜 Lore Master - Kurallar, canon kuralları ve ansiklopedi</option>
                <option value="illustrator">🎨 İllüstratör - Haritalar ve görsel moodboard</option>
                <option value="viewer">👁️ Gözlemci (Viewer) - Salt okunur inceleme</option>
              </select>
            </div>

            {/* Butonlar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                onPress={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedUserToInvite(null);
                  setMemberSearchQuery('');
                }}
                className="text-xs"
              >
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleAddMember}
                disabled={!selectedUserToInvite || isInvitingMember}
                className="text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                {isInvitingMember && <Loader2 size={13} className="animate-spin" />}
                <span>{isInvitingMember ? 'Ekleniyor...' : 'Ekibe Ekle'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Eser Bağla ── */}
      {isLinkStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsLinkStoryModalOpen(false)} className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-3">Evrene Eser Bağla</Typography>
            <select
              value={selectedStoryToLink}
              onChange={(e) => setSelectedStoryToLink(e.target.value)}
              className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground mb-4"
            >
              <option value="">Bir eser seçin...</option>
              {authorStories.filter((s) => !universe.connectedStoryIds?.includes(s.storyId)).map((st) => (
                <option key={st.storyId} value={st.storyId}>📖 {st.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onPress={() => setIsLinkStoryModalOpen(false)} className="text-xs">Vazgeç</Button>
              <Button variant="primary" onPress={handleLinkStory} className="text-xs font-bold">Bağla</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Seri Bağla ── */}
      {isLinkSeriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsLinkSeriesModalOpen(false)} className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-3">Evrene Seri Bağla</Typography>
            <select
              value={selectedSeriesToLink}
              onChange={(e) => setSelectedSeriesToLink(e.target.value)}
              className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground mb-4"
            >
              <option value="">Bir seri seçin...</option>
              {authorSeries.filter((s) => !universe.connectedSeriesIds?.includes(s.seriesId)).map((ser) => (
                <option key={ser.seriesId} value={ser.seriesId}>📚 {ser.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onPress={() => setIsLinkSeriesModalOpen(false)} className="text-xs">Vazgeç</Button>
              <Button variant="primary" onPress={handleLinkSeries} className="text-xs font-bold">Bağla</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yeni Harita Oluştur ── */}
      {isCreateMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsCreateMapModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MapIcon size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                Yeni Dünya Haritası Ekle
              </Typography>
            </div>

            {/* Başlık */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Harita Adı *
              </label>
              <input
                type="text"
                value={newMapTitle}
                onChange={(e) => setNewMapTitle(e.target.value)}
                placeholder="Örn: Orta Kıta, Aeryon Krallığı, Dünya Haritası"
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Tür */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Harita Kapsamı
              </label>
              <select
                value={newMapType}
                onChange={(e) => setNewMapType(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="world">Tüm Dünya (Global)</option>
                <option value="continent">Kıta Haritası</option>
                <option value="country">Ülke / Krallık</option>
                <option value="region">Bölge Haritası</option>
                <option value="city">Şehir / Yerleşim</option>
                <option value="building">Bina / Kale / Zindan</option>
                <option value="custom">Özel Harita</option>
              </select>
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <textarea
                value={newMapDesc}
                onChange={(e) => setNewMapDesc(e.target.value)}
                placeholder="Bu harita evrenin hangi dönemini veya bölgesini gösteriyor?"
                rows={2}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Görsel Yükleme / URL */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Harita Görseli (JPG, PNG, WebP) *
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMapImageUpload}
                  disabled={isUploadingMapImage}
                  className="w-full text-xs text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <div className="text-[11px] text-muted text-center">— veya doğrudan görsel linki girin —</div>
                <input
                  type="url"
                  value={newMapImageUrl}
                  onChange={(e) => setNewMapImageUrl(e.target.value)}
                  placeholder="https://.../harita-gorseli.jpg"
                  className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Görsel Önizleme */}
              {newMapImageUrl && (
                <div className="mt-2.5 rounded-xl overflow-hidden border border-border/40 max-h-32 bg-black/20 flex items-center justify-center">
                  <img src={newMapImageUrl} alt="Harita Önizleme" className="max-h-32 w-auto object-contain" />
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
              <Button
                variant="ghost"
                onPress={() => setIsCreateMapModalOpen(false)}
                className="text-xs"
              >
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleCreateMap}
                disabled={isUploadingMapImage || !newMapTitle.trim() || !newMapImageUrl.trim()}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingMapImage ? 'Yükleniyor...' : 'Haritayı Oluştur'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Yeni Mekân Ekle
            </Typography>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-muted mb-1 block">Mekân Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Minas Tirith, Rivendell, Arrakis"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-muted mb-1 block">Mekân Türü</label>
                  <select
                    value={newLocType}
                    onChange={(e) => setNewLocType(e.target.value as LocationType)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {Object.entries(LOCATION_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted mb-1 block">Bağlı Üst Mekân</label>
                  <select
                    value={newLocParentId}
                    onChange={(e) => setNewLocParentId(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Bağımsız / Ana --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{LOCATION_TYPE_LABELS[l.type] || l.type}] {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted mb-1 block">İklim / Coğrafya</label>
                <input
                  type="text"
                  placeholder="Örn: Sert karasal, ılıman vadi, çöl"
                  value={newLocClimate}
                  onChange={(e) => setNewLocClimate(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted mb-1 block">Kısa Tanım</label>
                <textarea
                  rows={3}
                  placeholder="Mekânın kurgudaki yeri ve temel özellikleri..."
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onPress={() => setIsLocationModalOpen(false)} className="text-xs">Vazgeç</Button>
                <Button variant="primary" onPress={handleCreateLocation} className="text-xs font-bold">Mekânı Kaydet</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yeni Olay ── */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsEventModalOpen(false)} className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-4">Zaman Çizelgesine Olay Ekle</Typography>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Olay Başlığı *"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <input
                type="text"
                placeholder="Çağ / Tarih (Örn: Mühürden Sonra 12. Yıl)"
                value={newEventEra}
                onChange={(e) => setNewEventEra(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <textarea
                rows={3}
                placeholder="Olayın özeti, sebepleri ve sonuçları..."
                value={newEventSummary}
                onChange={(e) => setNewEventSummary(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onPress={() => setIsEventModalOpen(false)} className="text-xs">Vazgeç</Button>
                <Button variant="primary" onPress={handleCreateEvent} className="text-xs font-bold">Ekle</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yeni Terim ── */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsTermModalOpen(false)} className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-4">Sözlük Terimi Ekle</Typography>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Terim *"
                value={newTermWord}
                onChange={(e) => setNewTermWord(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <input
                type="text"
                placeholder="Kategori (Büyü, Coğrafya, Argo vb.)"
                value={newTermCategory}
                onChange={(e) => setNewTermCategory(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <textarea
                rows={3}
                placeholder="Anlamı ve okuyucuya açıklaması *"
                value={newTermMeaning}
                onChange={(e) => setNewTermMeaning(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onPress={() => setIsTermModalOpen(false)} className="text-xs">Vazgeç</Button>
                <Button variant="primary" onPress={handleCreateTerm} className="text-xs font-bold">Ekle</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yeni Lore ── */}
      {isLoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsLoreModalOpen(false)} className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-4">Dünya Bilgisi (Lore) Ekle</Typography>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Başlık *"
                value={newLoreTitle}
                onChange={(e) => setNewLoreTitle(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <select
                value={newLoreCategory}
                onChange={(e) => setNewLoreCategory(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              >
                <option value="history">Tarih</option>
                <option value="legend">Efsane</option>
                <option value="myth">Mitoloji</option>
                <option value="secret">Sır</option>
                <option value="prophecy">Kehanet</option>
                <option value="rule">Dünya Kuralı</option>
              </select>
              <textarea
                rows={4}
                placeholder="Lore içeriği ve detaylar *"
                value={newLoreContent}
                onChange={(e) => setNewLoreContent(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onPress={() => setIsLoreModalOpen(false)} className="text-xs">Vazgeç</Button>
                <Button variant="primary" onPress={handleCreateLore} className="text-xs font-bold">Ekle</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yeni Karakter ── */}
      {isCharModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsCharModalOpen(false)} className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <Typography variant="h3" className="font-bold text-base mb-4">Yeni Evren Karakteri</Typography>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Karakter Adı *"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <select
                value={newCharRole}
                onChange={(e) => setNewCharRole(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              >
                <option value="protagonist">Ana Karakter</option>
                <option value="antagonist">Karşıt Karakter</option>
                <option value="supporting">Destek / Yan Karakter</option>
                <option value="minor">Önemsiz / Arka Plan</option>
              </select>
              <input
                type="text"
                placeholder="Meslek / Unvan"
                value={newCharOccupation}
                onChange={(e) => setNewCharOccupation(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
              />
              <textarea
                rows={3}
                placeholder="Temel motivasyon veya kurgudaki rolü..."
                value={newCharMotivation}
                onChange={(e) => setNewCharMotivation(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onPress={() => setIsCharModalOpen(false)} className="text-xs">Vazgeç</Button>
                <Button variant="primary" onPress={handleCreateChar} className="text-xs font-bold">Karakteri Kur</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal: Karakter Defteri 2.0 (Detaylı Düzenleme) ── */}
      {isCharDetailModalOpen && selectedCharForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 max-w-4xl w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
            
            {/* Üst Başlık & Kapat */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                {editingCharData.avatarUrl ? (
                  <img src={editingCharData.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-border/50" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary font-bold flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
                <div>
                  <Typography variant="h3" className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    {editingCharData.name || 'İsimsiz Karakter'}
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      Karakter Defteri 2.0
                    </span>
                  </Typography>
                  <p className="text-[11px] text-muted">
                    Çok boyutlu karakter eğrisi, ilişkiler matrisi, sırlar ve vitrin
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCharDetailModalOpen(false)} 
                className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-background/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sekme Butonları */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-border/40 scrollbar-none">
              {[
                { id: 'profile', label: 'Profil & PNG', icon: <Fingerprint size={14} /> },
                { id: 'arc', label: 'Karakter Arkı (8 Adım)', icon: <Activity size={14} /> },
                { id: 'relationships', label: `İlişkiler (${editingCharData.relationships?.length || 0})`, icon: <Heart size={14} /> },
                { id: 'iceberg', label: 'Iceberg & Sırlar', icon: <Shield size={14} /> },
                { id: 'stats', label: 'Psikoloji & Nitelikler', icon: <Brain size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCharDetailTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    charDetailTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted hover:text-foreground hover:bg-background/60'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sekme İçerikleri (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              
              {/* SEKME 1: Profil & PNG Vitrini */}
              {charDetailTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">Karakter Adı *</label>
                      <input
                        type="text"
                        value={editingCharData.name || ''}
                        onChange={(e) => setEditingCharData({ ...editingCharData, name: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">Kurgudaki Rolü</label>
                      <select
                        value={editingCharData.role || 'supporting'}
                        onChange={(e) => setEditingCharData({ ...editingCharData, role: e.target.value as any })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                      >
                        <option value="protagonist">Ana Karakter (Protagonist)</option>
                        <option value="antagonist">Karşıt Karakter (Antagonist)</option>
                        <option value="supporting">Destek / Yan Karakter</option>
                        <option value="minor">Önemsiz / Figüran</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">Meslek / Unvan</label>
                      <input
                        type="text"
                        placeholder="Örn: Kuzey Muhafızı, Başbüyücü, Hacker"
                        value={editingCharData.occupation || ''}
                        onChange={(e) => setEditingCharData({ ...editingCharData, occupation: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">Yaş & Cinsiyet</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Yaş (örn: 24)"
                          value={editingCharData.age || ''}
                          onChange={(e) => setEditingCharData({ ...editingCharData, age: e.target.value })}
                          className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Cinsiyet"
                          value={editingCharData.gender || ''}
                          onChange={(e) => setEditingCharData({ ...editingCharData, gender: e.target.value })}
                          className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Görsel ve PNG Vitrini Bölümü (Yazar Rehberi & Boyutlar) */}
                  <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3.5">
                    {/* Kurumsal Bilgilendirme Çubuğu */}
                    <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={14} className="text-muted-foreground/80 shrink-0" />
                        <span>Karakter vitrinlerinde en dengeli görünüm için <strong>dikey dikdörtgen (2:3 veya 3:4)</strong> formatlar önerilir.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-muted-foreground/70">AI Prompt Parametresi:</span>
                        <code className="font-mono bg-background text-foreground border border-border/70 px-1.5 py-0.5 rounded font-semibold text-[10px]">--ar 2:3</code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* 1. Portre & Atlas */}
                      <div className="p-3.5 rounded-xl bg-muted/15 border border-border/60 hover:border-border transition-all flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-foreground">Portre & Atlas</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">2:3 / 3:4</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Atlas kartı, ilişki ağı ve okuma dipnotları
                          </p>
                        </div>

                        <div className="w-full h-36 rounded-xl bg-muted/20 border border-dashed border-border/80 flex items-center justify-center overflow-hidden relative group">
                          {editingCharData.avatarUrl ? (
                            <>
                              <img src={editingCharData.avatarUrl} alt="" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => handleRemoveCharImage('avatar')}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                                title="Kaldır"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <div className="text-center p-3 text-muted-foreground/70">
                              <Upload size={18} className="mx-auto mb-1 text-muted-foreground/50" />
                              <span className="text-[11px] font-medium block text-foreground/80">Portre Yükle</span>
                              <span className="text-[10px] text-muted-foreground/60">800×1200 px</span>
                            </div>
                          )}
                        </div>

                        <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border/50 hover:border-border transition-all cursor-pointer text-center">
                          <Upload size={13} /> {editingCharData.avatarUrl ? 'Görseli Değiştir' : 'Portre Yükle'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCharImageUpload(e, 'avatar')} />
                        </label>
                      </div>

                      {/* 2. Şeffaf PNG Vitrini */}
                      <div className="p-3.5 rounded-xl bg-muted/15 border border-border/60 hover:border-border transition-all flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-foreground">3D Vitrin (Şeffaf)</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">Şeffaf PNG</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            3D kart derinlik efekti & afiş tasarımı
                          </p>
                        </div>

                        <div className="w-full h-36 rounded-xl bg-muted/20 border border-dashed border-border/80 flex items-center justify-center overflow-hidden relative group">
                          {editingCharData.pngGallery?.transparentPngUrl ? (
                            <>
                              <img src={editingCharData.pngGallery.transparentPngUrl} alt="" className="w-full h-full object-contain filter drop-shadow-sm" />
                              <button
                                type="button"
                                onClick={() => handleRemoveCharImage('transparentPng')}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                                title="Kaldır"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <div className="text-center p-3 text-muted-foreground/70">
                              <Sparkles size={18} className="mx-auto mb-1 text-muted-foreground/50" />
                              <span className="text-[11px] font-medium block text-foreground/80">Arka Plansız PNG</span>
                              <span className="text-[10px] text-muted-foreground/60">1000×1500 px</span>
                            </div>
                          )}
                        </div>

                        <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border/50 hover:border-border transition-all cursor-pointer text-center">
                          <Upload size={13} /> {editingCharData.pngGallery?.transparentPngUrl ? 'PNG Değiştir' : 'Şeffaf PNG Yükle'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCharImageUpload(e, 'transparentPng')} />
                        </label>
                      </div>

                      {/* 3. Tam Boy Çizim */}
                      <div className="p-3.5 rounded-xl bg-muted/15 border border-border/60 hover:border-border transition-all flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-foreground">Tam Boy / Konsept</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">9:16 Dikey</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Detaylı kostüm & gardırop incelemesi
                          </p>
                        </div>

                        <div className="w-full h-36 rounded-xl bg-muted/20 border border-dashed border-border/80 flex items-center justify-center overflow-hidden relative group">
                          {editingCharData.pngGallery?.fullBodyUrl ? (
                            <>
                              <img src={editingCharData.pngGallery.fullBodyUrl} alt="" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => handleRemoveCharImage('fullBody')}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                                title="Kaldır"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <div className="text-center p-3 text-muted-foreground/70">
                              <User size={18} className="mx-auto mb-1 text-muted-foreground/50" />
                              <span className="text-[11px] font-medium block text-foreground/80">Tam Boy Çizim</span>
                              <span className="text-[10px] text-muted-foreground/60">1080×1920 px</span>
                            </div>
                          )}
                        </div>

                        <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border/50 hover:border-border transition-all cursor-pointer text-center">
                          <Upload size={13} /> {editingCharData.pngGallery?.fullBodyUrl ? 'Görseli Değiştir' : 'Tam Boy Yükle'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCharImageUpload(e, 'fullBody')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEKME 2: 8 Aşamalı Karakter Eğrisi (Arc) */}
              {charDetailTab === 'arc' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px]">
                    <strong>8 Aşamalı Karakter Eğrisi:</strong> Karakterinizin hikâye boyunca yaşadığı içsel ve dışsal dönüşümün yol haritası.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">1. Başlangıç Durumu</label>
                      <textarea
                        rows={2}
                        placeholder="Hikâye başlarken karakter kimdi, nasıl bir hayatı vardı?"
                        value={editingCharData.characterArc?.startingState || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), startingState: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">2. Eksiklik / Zaaf (Fatal Flaw)</label>
                      <textarea
                        rows={2}
                        placeholder="Karakterin kör noktası veya aşamadığı zayıflığı neydi?"
                        value={editingCharData.characterArc?.flawOrLack || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), flawOrLack: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">3. Tetikleyici Olay</label>
                      <textarea
                        rows={2}
                        placeholder="Onu konfor alanından çıkaran ilk büyük olay ne oldu?"
                        value={editingCharData.characterArc?.incitingIncident || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), incitingIncident: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">4. İlk Değişim</label>
                      <textarea
                        rows={2}
                        placeholder="Yeni dünyada veya olaylar karşısında benimsediği ilk tutum..."
                        value={editingCharData.characterArc?.firstChange || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), firstChange: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">5. Büyük Kırılma</label>
                      <textarea
                        rows={2}
                        placeholder="Geri dönüşü olmayan eşik veya inanç sarsıntısı..."
                        value={editingCharData.characterArc?.majorShift || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), majorShift: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">6. Kriz / Ruhun Karanlık Gecesi</label>
                      <textarea
                        rows={2}
                        placeholder="Her şeyin kaybedildiği hissi ve en büyük yenilgi..."
                        value={editingCharData.characterArc?.crisis || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), crisis: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">7. Doruk Noktası / Karar</label>
                      <textarea
                        rows={2}
                        placeholder="Eski zaafından vazgeçip aldığı kader belirleyici karar..."
                        value={editingCharData.characterArc?.climaxDecision || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), climaxDecision: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">8. Final Durumu</label>
                      <textarea
                        rows={2}
                        placeholder="Dönüşüm tamamlandıktan sonra karakter artık kim?"
                        value={editingCharData.characterArc?.finalState || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          characterArc: { ...(editingCharData.characterArc || {}), finalState: e.target.value }
                        })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEKME 3: İlişkiler Matrisi */}
              {charDetailTab === 'relationships' && (
                <div className="space-y-4">
                  {/* Mevcut İlişkiler */}
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-foreground block">Tanımlı İlişkiler ({editingCharData.relationships?.length || 0})</span>
                    {(!editingCharData.relationships || editingCharData.relationships.length === 0) ? (
                      <div className="p-4 rounded-xl bg-background/50 border border-border/40 text-center text-muted">
                        Henüz başka bir karakterle bağ kurulmadı.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editingCharData.relationships.map((rel, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-xs">{rel.targetCharacterName || 'Karakter'}</span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold text-[10px] capitalize">
                                  {rel.relationshipType}
                                </span>
                                {rel.isSecret && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] flex items-center gap-0.5">
                                    <Lock size={10} /> Gizli
                                  </span>
                                )}
                                {rel.spoilerThresholdChapter && (
                                  <span className="text-[10px] text-muted">Bölüm {rel.spoilerThresholdChapter}+</span>
                                )}
                              </div>
                              {rel.description && (
                                <p className="text-[11px] text-muted mt-1">{rel.description}</p>
                              )}
                            </div>
                            <button onClick={() => handleRemoveRelationship(idx)} className="text-muted hover:text-destructive p-1">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Yeni İlişki Ekleme Formu */}
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-3">
                    <span className="font-bold text-xs text-foreground block">Yeni İlişki Tanımla</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-muted mb-1 block">İlişkili Karakter *</label>
                        <select
                          value={relTargetId}
                          onChange={(e) => setRelTargetId(e.target.value)}
                          className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                        >
                          <option value="">Seçiniz...</option>
                          {characters
                            .filter((c) => c.id !== selectedCharForDetail.id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>{c.name} ({getCharacterRoleLabel(c.role)})</option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted mb-1 block">İlişki Türü</label>
                        <select
                          value={relType}
                          onChange={(e) => setRelType(e.target.value)}
                          className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                        >
                          <option value="dost">Dost / Arkadaş</option>
                          <option value="düşman">Baş Düşman</option>
                          <option value="rakip">Rakip / Rival</option>
                          <option value="aile">Aile / Akraba</option>
                          <option value="aşık">Aşık / Partner</option>
                          <option value="mentor">Usta / Mentor</option>
                          <option value="öğrenci">Öğrenci / Çırak</option>
                          <option value="müttefik">Müttefik</option>
                          <option value="eski_dost">Eski Dost (Şimdi Düşman)</option>
                          <option value="diğer">Diğer</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted mb-1 block">İlişki Detayı / Geçmişi</label>
                      <input
                        type="text"
                        placeholder="Örn: Çocukluktan beri birlikte büyüdüler, ancak taht kavgası yüzünden ayrıldılar."
                        value={relDesc}
                        onChange={(e) => setRelDesc(e.target.value)}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={relIsSecret}
                            onChange={(e) => setRelIsSecret(e.target.checked)}
                            className="rounded border-border"
                          />
                          <span className="text-[11px] text-muted">Gizli İlişki (Okuyucudan gizle)</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Spoiler Eşik Bölüm"
                          value={relSpoilerThreshold}
                          onChange={(e) => setRelSpoilerThreshold(e.target.value)}
                          className="w-36 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                        />
                      </div>
                      <Button variant="primary" onPress={handleAddRelationship} className="text-xs font-bold py-1.5 px-3">
                        İlişkiyi Ekle
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* SEKME 4: Iceberg & Gizli Sırlar */}
              {charDetailTab === 'iceberg' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px]">
                    <strong>Iceberg Modeli:</strong> Yazarın bildiği sırlar ile okuyucunun görebileceği bilgileri ayrıştırın.
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted mb-1 block">Yazarın Özel Notları (Gizli)</label>
                    <textarea
                      rows={3}
                      placeholder="Yalnızca sizin görebileceğiniz notlar. Karakterin arkasındaki gizli amaçlar, planlar..."
                      value={editingCharData.authorNotes || ''}
                      onChange={(e) => setEditingCharData({ ...editingCharData, authorNotes: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted mb-1 block">Okuyucu Biyografisi (Açık)</label>
                    <textarea
                      rows={3}
                      placeholder="Evrene giren okuyucuların göreceği resmi biyografi..."
                      value={editingCharData.readerNotes || ''}
                      onChange={(e) => setEditingCharData({ ...editingCharData, readerNotes: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted mb-1 block">Gizli Gerçek (Secret Lore)</label>
                    <textarea
                      rows={3}
                      placeholder="Örn: Aslında kraliyet ailesinin kayıp varisi, fakat kendisi henüz bilmiyor..."
                      value={editingCharData.secretLore || ''}
                      onChange={(e) => setEditingCharData({ ...editingCharData, secretLore: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-background/50 border border-border/50 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCharData.isSpoiler || false}
                        onChange={(e) => setEditingCharData({ ...editingCharData, isSpoiler: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-xs font-bold text-foreground">Bu karakter spoiler içerir</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted">Kaçıncı bölümden sonra açılsın:</span>
                      <input
                        type="number"
                        placeholder="Örn: 15"
                        value={editingCharData.spoilerThresholdChapter || ''}
                        onChange={(e) => setEditingCharData({
                          ...editingCharData,
                          spoilerThresholdChapter: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="w-20 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEKME 5: Psikoloji & Yetkinlik Puanları */}
              {charDetailTab === 'stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">En Büyük Korkusu</label>
                      <input
                        type="text"
                        placeholder="Örn: Yalnız kalmak, başarısızlık"
                        value={editingCharData.greatestFear || ''}
                        onChange={(e) => setEditingCharData({ ...editingCharData, greatestFear: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted mb-1 block">Gizli Arzusu</label>
                      <input
                        type="text"
                        placeholder="Örn: Kabul görmek, intikam almak"
                        value={editingCharData.secretDesire || ''}
                        onChange={(e) => setEditingCharData({ ...editingCharData, secretDesire: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                      />
                    </div>
                  </div>

                  {/* RPG Nitelik Puanları */}
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-3">
                    <span className="font-bold text-xs text-foreground block">Yetkinlik & Nitelik Puanları (1 - 10)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'intelligence', label: 'Zekâ (Intelligence)', desc: 'Strateji ve akıl yürütme' },
                        { key: 'strength', label: 'Fiziksel Güç (Strength)', desc: 'Kas gücü ve dayanıklılık' },
                        { key: 'charisma', label: 'Karizma (Charisma)', desc: 'Liderlik ve ikna kabiliyeti' },
                        { key: 'agility', label: 'Çeviklik (Agility)', desc: 'Hız ve refleksler' },
                        { key: 'empathy', label: 'Empati (Empathy)', desc: 'İçgörü ve duygu anlama' },
                      ].map((stat) => {
                        const val = (editingCharData.rpgStats as any)?.[stat.key] ?? 5;
                        return (
                          <div key={stat.key} className="p-3 rounded-xl bg-card border border-border/40">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[11px] text-foreground">{stat.label}</span>
                              <span className="font-extrabold text-xs text-primary">{val} / 10</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={val}
                              onChange={(e) => {
                                const newStats = { ...(editingCharData.rpgStats || { intelligence: 5, strength: 5, charisma: 5, agility: 5, empathy: 5 }), [stat.key]: Number(e.target.value) };
                                setEditingCharData({ ...editingCharData, rpgStats: newStats });
                              }}
                              className="w-full accent-primary cursor-pointer"
                            />
                            <span className="text-[10px] text-muted">{stat.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Alt İşlem Butonları */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button variant="ghost" onPress={() => setIsCharDetailModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button 
                variant="primary" 
                onPress={handleSaveCharDetail} 
                disabled={isSavingCharDetail || isUploadingCharImage}
                className="text-xs font-bold py-2 px-5 rounded-xl flex items-center gap-1.5"
              >
                {isSavingCharDetail ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Karakter Defteri 2.0'ı Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Mekân Defteri 2.0 (Detaylı Düzenleme) ── */}
      {isLocDetailModalOpen && selectedLocForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 max-w-4xl w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
            
            {/* Üst Başlık & Kapat */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                {editingLocData.imageUrl ? (
                  <img src={editingLocData.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={22} />
                  </div>
                )}
                <div>
                  <Typography variant="h3" className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    {editingLocData.name || 'İsimsiz Mekân'}
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                      Mekân Defteri 2.0
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full">
                      {LOCATION_TYPE_LABELS[editingLocData.type || 'city'] || editingLocData.type}
                    </span>
                  </Typography>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hiyerarşik dünya kurma, coğrafya, toplum, yönetim, sırlar ve harita entegrasyonu
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLocDetailModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sekme Butonları */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-border/40 scrollbar-none">
              {[
                { id: 'basic', label: 'Temel & Görsel', icon: <Compass size={14} /> },
                { id: 'geography', label: 'Coğrafya & İklim', icon: <Mountain size={14} /> },
                { id: 'society', label: 'Toplum & Yönetim', icon: <Crown size={14} /> },
                { id: 'lore', label: 'Kurallar & Tehlikeler', icon: <ShieldAlert size={14} /> },
                { id: 'connections', label: `Bağlantılar & Iceberg (${(editingLocData.importantCharacterIds?.length || 0) + (editingLocData.relatedEventIds?.length || 0)})`, icon: <Sparkles size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLocDetailTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    locDetailTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sekme İçerikleri (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              
              {/* SEKME 1: Temel & Görsel */}
              {locDetailTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Mekân Adı *</label>
                      <input
                        type="text"
                        value={editingLocData.name || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, name: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Mekân Türü</label>
                      <select
                        value={editingLocData.type || 'city'}
                        onChange={(e) => setEditingLocData({ ...editingLocData, type: e.target.value as LocationType })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      >
                        {Object.entries(LOCATION_TYPE_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Bağlı Üst Mekân (Hiyerarşi)</label>
                      <select
                        value={editingLocData.parentLocationId || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, parentLocationId: e.target.value || undefined })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="">-- Üst Mekân Yok (Ana / Bağımsız) --</option>
                        {locations
                          .filter((l) => l.id !== selectedLocForDetail.id)
                          .map((l) => (
                            <option key={l.id} value={l.id}>
                              [{LOCATION_TYPE_LABELS[l.type] || l.type}] {l.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Kısa Tanım (Özet)</label>
                    <input
                      type="text"
                      placeholder="Mekânın kurgudaki rolü ve tek cümlelik özeti..."
                      value={editingLocData.description || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, description: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Detaylı Kurgusal Anlatı</label>
                    <textarea
                      rows={4}
                      placeholder="Mekânın mimarisi, sokakları, tarihi binaları, atmosferi ve detaylı kurgusal tasviri..."
                      value={editingLocData.detailedDescription || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, detailedDescription: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* Mekân Görseli / Manzara Çizimi Kutusu */}
                  <div className="p-4 rounded-2xl bg-muted/15 border border-border/60 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={15} className="text-muted-foreground" />
                        <span className="font-bold text-xs text-foreground">Mekân Görseli & Manzara Çizimi</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Önerilen: 16:9 yatay manzara (1200×675 px) veya 4:3 konsept çizim
                      </span>
                    </div>

                    <div className="w-full h-44 rounded-xl bg-muted/20 border border-dashed border-border/80 flex items-center justify-center overflow-hidden relative group">
                      {editingLocData.imageUrl ? (
                        <>
                          <img src={editingLocData.imageUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRemoveLocImage}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                            title="Görseli Kaldır"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground/70">
                          <Upload size={22} className="mx-auto mb-1.5 text-muted-foreground/50" />
                          <span className="text-xs font-semibold block text-foreground/80">Manzara veya Konsept Görseli Yükle</span>
                          <span className="text-[10px] text-muted-foreground/60">JPG, PNG veya WebP</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border/50 hover:border-border transition-all cursor-pointer text-center">
                      <Upload size={13} /> {editingLocData.imageUrl ? 'Görseli Değiştir' : 'Mekân Görseli Yükle'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLocImageUpload} disabled={isUploadingLocImage} />
                    </label>
                  </div>
                </div>
              )}

              {/* SEKME 2: Coğrafya & İklim */}
              {locDetailTab === 'geography' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">İklim Koşulları</label>
                      <input
                        type="text"
                        placeholder="Örn: Sert karasal, kışları -30°C dondurucu fırtınalar"
                        value={editingLocData.climate || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, climate: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Atmosfer & Hissiyat</label>
                      <input
                        type="text"
                        placeholder="Örn: Kasvetli sis, kadim büyü kokusu, daimi alacakaranlık"
                        value={editingLocData.atmosphere || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, atmosphere: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Coğrafi Yapı & Doğal Unsurlar</label>
                    <textarea
                      rows={4}
                      placeholder="Dağ silsileleri, nehirler, vadiler, kanyonlar, bataklıklar ve doğal koruganlar..."
                      value={editingLocData.geography || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, geography: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SEKME 3: Toplum & Yönetim */}
              {locDetailTab === 'society' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Nüfus & Yaşayan Halk</label>
                      <input
                        type="text"
                        placeholder="Örn: 250.000 (Çoğunluğu İnsanlar, %15 Cüceler)"
                        value={editingLocData.population || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, population: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Konuşulan Diller & Lehçeler</label>
                      <input
                        type="text"
                        placeholder="Örn: Ortak Dil, Kuzey Lehçesi, Kadim Elfçe"
                        value={editingLocData.languages || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, languages: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Yönetim Biçimi & Lider</label>
                      <input
                        type="text"
                        placeholder="Örn: Kraliyet Konseyi, Kral Elessar"
                        value={editingLocData.governance || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, governance: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Ekonomi & Ticaret</label>
                      <input
                        type="text"
                        placeholder="Örn: Maden ihracatı, ipek ticareti, altın sikke"
                        value={editingLocData.economy || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, economy: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Güvenlik & Savunma</label>
                      <input
                        type="text"
                        placeholder="Örn: 3 kademeli beyaz surlar, 5.000 Muhafız"
                        value={editingLocData.security || ''}
                        onChange={(e) => setEditingLocData({ ...editingLocData, security: e.target.value })}
                        className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Kültür, Gelenekler & Yaşam Tarzı</label>
                    <textarea
                      rows={3}
                      placeholder="Mekânın bayramları, inanç ritüelleri, yemek kültürü ve toplumsal sınıfları..."
                      value={editingLocData.culture || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, culture: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SEKME 4: Kurallar & Tehlikeler */}
              {locDetailTab === 'lore' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Tarihçe & Kuruluş Efsanesi</label>
                    <textarea
                      rows={3}
                      placeholder="Bu mekân ne zaman, kim tarafından kuruldu? Yaşadığı büyük savaşlar veya felaketler..."
                      value={editingLocData.history || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, history: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Özel Yasalar, Kurallar & Yasaklar</label>
                    <textarea
                      rows={3}
                      placeholder="Örn: Büyü kullanımı idamla cezalandırılır; gün batımından sonra şehir kapıları mühürlenir..."
                      value={editingLocData.specialRules || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, specialRules: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Tehlikeler, Tehditler & Canavarlar</label>
                    <textarea
                      rows={3}
                      placeholder="Örn: Çevredeki ormanda yaşayan kurt adamlar, zehirli bataklık gazı, gölge suikastçıları..."
                      value={editingLocData.dangers || ''}
                      onChange={(e) => setEditingLocData({ ...editingLocData, dangers: e.target.value })}
                      className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SEKME 5: Bağlantılar & Iceberg */}
              {locDetailTab === 'connections' && (
                <div className="space-y-4">
                  {/* İlişkili Karakterler Seçici */}
                  <div className="p-4 rounded-2xl bg-muted/15 border border-border/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Users size={14} className="text-primary" /> Bu Mekânda Yaşayan / İlişkili Karakterler
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {editingLocData.importantCharacterIds?.length || 0} seçili
                      </span>
                    </div>
                    {characters.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">Evrende henüz kayıtlı karakter bulunmuyor.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {characters.map((c) => {
                          const isSelected = editingLocData.importantCharacterIds?.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                const curr = editingLocData.importantCharacterIds || [];
                                const updated = isSelected ? curr.filter((id) => id !== c.id) : [...curr, c.id];
                                setEditingLocData({ ...editingLocData, importantCharacterIds: updated });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                  : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/40'
                              }`}
                            >
                              <span>{c.name}</span>
                              <span className="text-[10px] opacity-70">({getCharacterRoleLabel(c.role)})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* İlişkili Olaylar Seçici */}
                  <div className="p-4 rounded-2xl bg-muted/15 border border-border/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Clock size={14} className="text-primary" /> Mekânda Gerçekleşen Tarihsel Olaylar
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {editingLocData.relatedEventIds?.length || 0} seçili
                      </span>
                    </div>
                    {timelineEvents.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">Evrende henüz zaman çizelgesi olayı bulunmuyor.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {timelineEvents.map((ev) => {
                          const isSelected = editingLocData.relatedEventIds?.includes(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => {
                                const curr = editingLocData.relatedEventIds || [];
                                const updated = isSelected ? curr.filter((id) => id !== ev.id) : [...curr, ev.id];
                                setEditingLocData({ ...editingLocData, relatedEventIds: updated });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                  : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/40'
                              }`}
                            >
                              <span>{ev.title}</span>
                              {ev.era && <span className="text-[10px] opacity-70">({ev.era})</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Iceberg Dünya Kurma Katmanları */}
                  <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
                    <span className="font-bold text-xs text-foreground block">
                      Iceberg Dünya Kurma Katmanları (PRD Bölüm 28)
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10.5px] font-bold text-muted-foreground mb-1 block">
                          1. Yazar Notu (Yalnızca yazar görür — Taslak & Arka Plan)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Bu mekânı kurgularken aldığınız şahsi notlar..."
                          value={editingLocData.authorNotes || ''}
                          onChange={(e) => setEditingLocData({ ...editingLocData, authorNotes: e.target.value })}
                          className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-bold text-muted-foreground mb-1 block">
                          2. Okuyucu Açıklaması (Okur vitrininde görünen katman)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Okuyucunun doğrudan evren atlasında göreceği genel bilgi..."
                          value={editingLocData.readerNotes || ''}
                          onChange={(e) => setEditingLocData({ ...editingLocData, readerNotes: e.target.value })}
                          className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-bold text-primary mb-1 block">
                          3. Gizli Gerçek / Sır (Iceberg'in su altındaki katmanı — Plot Twist)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Örn: Bu kalenin altındaki zindanda kadim bir tanrı uyumaktadır..."
                          value={editingLocData.secretLore || ''}
                          onChange={(e) => setEditingLocData({ ...editingLocData, secretLore: e.target.value })}
                          className="w-full bg-background border border-primary/30 rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Spoiler ve Bölüm Eşiği */}
                  <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingLocData.isSpoiler || false}
                        onChange={(e) => setEditingLocData({ ...editingLocData, isSpoiler: e.target.checked })}
                        className="rounded border-border accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-bold text-foreground">Bu mekân spoiler içerir (Okurlara gizle)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Kaçıncı bölümden sonra açılsın:</span>
                      <input
                        type="number"
                        placeholder="Örn: 10"
                        value={editingLocData.spoilerThresholdChapter || ''}
                        onChange={(e) => setEditingLocData({
                          ...editingLocData,
                          spoilerThresholdChapter: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="w-20 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Alt İşlem Butonları */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button variant="ghost" onPress={() => setIsLocDetailModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button 
                variant="primary" 
                onPress={handleSaveLocationDetail} 
                disabled={isSavingLocDetail || isUploadingLocImage}
                className="text-xs font-bold py-2 px-5 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                {isSavingLocDetail ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Mekân Defteri 2.0'ı Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Organizasyon Ekle / Düzenle ── */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsOrgModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingOrg ? 'Organizasyonu Düzenle' : 'Yeni Organizasyon / Hanedan Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Organizasyon Adı *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Örn: Demir Muhafızlar, Aeryon Hanedanı, Gizli Konsey"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Organizasyon Türü
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="kingdom">Krallık</option>
                    <option value="empire">İmparatorluk</option>
                    <option value="guild">Lonca</option>
                    <option value="school">Akademi / Okul</option>
                    <option value="cult">Tarikat / Kült</option>
                    <option value="corporation">Şirket / Konsorsiyum</option>
                    <option value="family">Hanedan / Soy / Aile</option>
                    <option value="secret_society">Gizli Örgüt</option>
                    <option value="army">Ordu / Askeri Birlik</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Merkez Mekân
                  </label>
                  <select
                    value={orgHeadquarterId}
                    onChange={(e) => setOrgHeadquarterId(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">(Seçilmedi)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>📍 {loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Lider Karakter
                </label>
                <select
                  value={orgLeaderId}
                  onChange={(e) => setOrgLeaderId(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">(Seçilmedi)</option>
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>👑 {char.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Açıklama / Tarihçe
                </label>
                <textarea
                  value={orgDesc}
                  onChange={(e) => setOrgDesc(e.target.value)}
                  placeholder="Bu organizasyonun evrendeki rolü, tarihi ve nüfuzu..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  İdeoloji, Doktrin veya Slogan
                </label>
                <input
                  type="text"
                  value={orgIdeology}
                  onChange={(e) => setOrgIdeology(e.target.value)}
                  placeholder='Örn: "Bilgi Güçtür", "Kral İçin Şeref", "Karanlıkta Işık Ol"'
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Arma / Sembol Görseli
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadOrgSymbol}
                    disabled={isUploadingOrgSymbol}
                    className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <input
                    type="url"
                    value={orgSymbolUrl}
                    onChange={(e) => setOrgSymbolUrl(e.target.value)}
                    placeholder="https://.../symbol.png"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Spoiler Ayarı */}
              <div className="p-3 rounded-2xl bg-background/60 border border-border/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={orgIsSpoiler}
                    onChange={(e) => setOrgIsSpoiler(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {orgIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra okuyucuya açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={orgSpoilerChapter}
                      onChange={(e) => setOrgSpoilerChapter(e.target.value)}
                      placeholder="Örn: 15"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsOrgModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveOrg}
                disabled={isUploadingOrgSymbol}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingOrgSymbol ? 'Yükleniyor...' : editingOrg ? 'Güncelle' : 'Organizasyonu Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Eşya Ekle / Düzenle ── */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsItemModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sword size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingItem ? 'Eşyayı / Artefaktı Düzenle' : 'Yeni Eşya & Artefakt Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Eşya Adı *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Örn: Ay Işığı Kılıcı, Mühür Kitabı, Ruh Kristali"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Eşya Türü
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Silah">Silah</option>
                    <option value="Zırh">Zırh / Kalkan</option>
                    <option value="Büyülü Obje">Büyülü Obje</option>
                    <option value="Mücevher / Yüzük">Mücevher / Yüzük</option>
                    <option value="Kitap / Grimoire">Kitap / Grimoire</option>
                    <option value="Teknoloji">Teknolojik Cihaz</option>
                    <option value="Anahtar / Tılsım">Anahtar / Tılsım</option>
                    <option value="Taşıt">Taşıt / Binek Donanımı</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Mevcut Sahibi
                  </label>
                  <select
                    value={itemOwnerId}
                    onChange={(e) => setItemOwnerId(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">(Sahipsiz / Bilinmiyor)</option>
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>👤 {char.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Kökeni / Üreticisi
                </label>
                <input
                  type="text"
                  value={itemOrigin}
                  onChange={(e) => setItemOrigin(e.target.value)}
                  placeholder="Örn: Kadim Cüce Demircileri, 3. Çağ Simyacısı Elandor"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Açıklama & Görünüm
                </label>
                <textarea
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Eşyanın fiziksel görünümü ve hikâyedeki yeri..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  ✨ Gücü / İşlevi
                </label>
                <textarea
                  value={itemPower}
                  onChange={(e) => setItemPower(e.target.value)}
                  placeholder="Eşyanın bahşettiği özel yetenekler veya büyü etkileri..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  ⚠️ Sınırı / Bedeli (Yan Etkiler)
                </label>
                <textarea
                  value={itemLimitation}
                  onChange={(e) => setItemLimitation(e.target.value)}
                  placeholder="Kullanıcının ödemesi gereken bedel, soğuma süresi veya kırılabilirlik..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Eşya Görseli
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadItemImage}
                    disabled={isUploadingItemImage}
                    className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <input
                    type="url"
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    placeholder="https://.../item.png"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Spoiler Ayarı */}
              <div className="p-3 rounded-2xl bg-background/60 border border-border/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemIsSpoiler}
                    onChange={(e) => setItemIsSpoiler(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {itemIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra okuyucuya açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={itemSpoilerChapter}
                      onChange={(e) => setItemSpoilerChapter(e.target.value)}
                      placeholder="Örn: 20"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsItemModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveItem}
                disabled={isUploadingItemImage}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingItemImage ? 'Yükleniyor...' : editingItem ? 'Güncelle' : 'Eşyayı Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Güç Sistemi Ekle / Düzenle ── */}
      {isPowerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsPowerModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingPower ? 'Güç Sistemini Düzenle' : 'Yeni Güç / Büyü Sistemi Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Sistem Adı *
                </label>
                <input
                  type="text"
                  value={powerName}
                  onChange={(e) => setPowerName(e.target.value)}
                  placeholder="Örn: Mavi Mana Akışı, Rün Simyası, Sibernetik Modülasyon"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Enerji Kaynağı
                  </label>
                  <input
                    type="text"
                    value={powerSource}
                    onChange={(e) => setPowerSource(e.target.value)}
                    placeholder="Örn: Doğal kristaller, Ruh enerjisi, Yıldız tozu"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Kimler Kullanabilir?
                  </label>
                  <input
                    type="text"
                    value={powerWhoCanUse}
                    onChange={(e) => setPowerWhoCanUse(e.target.value)}
                    placeholder="Örn: Doğuştan yetenekliler, Yalnızca elfler, Herkes"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Temel Prensip & İşleyiş *
                </label>
                <textarea
                  value={powerPrinciples}
                  onChange={(e) => setPowerPrinciples(e.target.value)}
                  placeholder="Bu gücün veya büyünün temel doğa kuralı nedir? Nasıl açığa çıkar?"
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Kurallar ve Sınırlar
                </label>
                <textarea
                  value={powerRules}
                  onChange={(e) => setPowerRules(e.target.value)}
                  placeholder="Bu güçle ne yapılamaz? Hangi yasaklar veya evren sınırları geçerlidir?"
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Bedeli ve Tehlikeli Riskleri
                </label>
                <textarea
                  value={powerRisks}
                  onChange={(e) => setPowerRisks(e.target.value)}
                  placeholder="Aşırı kullanımda bedende veya zihinde ne hasar oluşur? Geri tepme riski nedir?"
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Kademeler / Rütbeler (Her satıra bir seviye)
                </label>
                <textarea
                  value={powerTiersInput}
                  onChange={(e) => setPowerTiersInput(e.target.value)}
                  placeholder={"1. Kademe: Çırak\n2. Kademe: Usta\n3. Kademe: Başbüyücü"}
                  rows={3}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none font-mono"
                />
                <span className="text-[10px] text-muted block mt-0.5">
                  Her satıra yazdığınız seviye, kart üzerinde aşama rozeti olarak gösterilir.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsPowerModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSavePower}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {editingPower ? 'Güncelle' : 'Güç Sistemini Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Irk / Tür Ekle / Düzenle ── */}
      {isRaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsRaceModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Dna size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingRace ? 'Irkı / Türü Düzenle' : 'Yeni Irk & Tür Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Irk / Tür Adı *
                </label>
                <input
                  type="text"
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  placeholder="Örn: Elfler, Kadimler, Siborglar, Gölge Yürüyenler"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Alternatif İsimler / Lakaplar
                </label>
                <input
                  type="text"
                  value={raceAlternativeNames}
                  onChange={(e) => setRaceAlternativeNames(e.target.value)}
                  placeholder="Örn: İlk Doğanlar, Orman Halkı, Sidhe"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Ortalama Yaşam Süresi
                  </label>
                  <input
                    type="text"
                    value={raceLifespan}
                    onChange={(e) => setRaceLifespan(e.target.value)}
                    placeholder="Örn: 800 - 1000 yıl / Ölümsüz"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Anavatan / Bölge
                  </label>
                  <select
                    value={raceHomelandId}
                    onChange={(e) => setRaceHomelandId(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Seçilmedi</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>📍 {loc.name} ({loc.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Fiziksel Özellikler & Görünüş
                </label>
                <textarea
                  value={racePhysicalTraits}
                  onChange={(e) => setRacePhysicalTraits(e.target.value)}
                  placeholder="Boy ortalaması, ten ve göz renkleri, sivri kulaklar, kanatlar, boynuzlar..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Konuştukları Dil
                  </label>
                  <input
                    type="text"
                    value={raceLanguage}
                    onChange={(e) => setRaceLanguage(e.target.value)}
                    placeholder="Örn: Kadim Elfçe"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Köken / Efsane
                  </label>
                  <input
                    type="text"
                    value={raceOrigin}
                    onChange={(e) => setRaceOrigin(e.target.value)}
                    placeholder="Nereden türediler?"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1 text-emerald-400">
                    ✨ Güçlü Yönler
                  </label>
                  <textarea
                    value={raceStrengths}
                    onChange={(e) => setRaceStrengths(e.target.value)}
                    placeholder="Doğuştan büyü yatkınlığı, gece görüşü..."
                    rows={2}
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1 text-rose-400">
                    ⚠️ Zayıf Noktalar
                  </label>
                  <textarea
                    value={raceWeaknesses}
                    onChange={(e) => setRaceWeaknesses(e.target.value)}
                    placeholder="Demire alerji, yavaş üreme..."
                    rows={2}
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Kültür & Toplumsal Yapı
                </label>
                <textarea
                  value={raceCulture}
                  onChange={(e) => setRaceCulture(e.target.value)}
                  placeholder="Gelenekler, yönetim anlayışı, kastlar..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                />
              </div>

              {/* Görsel Yükleme */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Portre / Konsept Görseli
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadRaceImage}
                    disabled={isUploadingRaceImage}
                    className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <input
                    type="url"
                    value={raceImageUrl}
                    onChange={(e) => setRaceImageUrl(e.target.value)}
                    placeholder="https://.../irk-gorseli.jpg"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Gizli Yazar Notu */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Lock size={12} /> Yalnızca Yazarın Göreceği Gizli Not
                </label>
                <textarea
                  value={raceAuthorNotes}
                  onChange={(e) => setRaceAuthorNotes(e.target.value)}
                  placeholder="Bu ırk hakkında okuyucunun asla bilmemesi gereken sırlar..."
                  rows={2}
                  className="w-full bg-background/80 border border-amber-500/30 rounded-xl p-2 text-xs text-foreground resize-none"
                />
              </div>

              {/* Spoiler Koruması */}
              <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={raceIsSpoiler}
                    onChange={(e) => setRaceIsSpoiler(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {raceIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={raceSpoilerChapter}
                      onChange={(e) => setRaceSpoilerChapter(e.target.value)}
                      placeholder="Örn: 20"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsRaceModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveRace}
                disabled={isUploadingRaceImage}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingRaceImage ? 'Yükleniyor...' : editingRace ? 'Güncelle' : 'Irkı Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yaratık / Canavar Ekle / Düzenle ── */}
      {isCreatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsCreatureModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Skull size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingCreature ? 'Yaratığı Düzenle' : 'Yeni Yaratık & Canavar Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Yaratık Adı *
                </label>
                <input
                  type="text"
                  value={creatureName}
                  onChange={(e) => setCreatureName(e.target.value)}
                  placeholder="Örn: Kızıl Ejderha, Gölge Kurdu, Çöl Solucanı"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Varlık Türü
                  </label>
                  <select
                    value={creatureType}
                    onChange={(e) => setCreatureType(e.target.value as CreatureType)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="monster">Canavar</option>
                    <option value="mythological">Mitolojik Varlık</option>
                    <option value="beast">Efsanevi Hayvan</option>
                    <option value="artificial">Yapay Yaşam / Golem</option>
                    <option value="alien">Uzaylı Organizma</option>
                    <option value="spiritual">Spiritüel / Ruhani</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tehlike Seviyesi
                  </label>
                  <select
                    value={creatureDangerLevel}
                    onChange={(e) => setCreatureDangerLevel(e.target.value as CreatureDangerLevel)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="harmless">Zararsız / Evcil</option>
                    <option value="low">Düşük Tehlike</option>
                    <option value="medium">Orta Tehlike</option>
                    <option value="high">Yüksek Tehlike</option>
                    <option value="deadly">Ölümcül</option>
                    <option value="calamity">Felaket / Efsanevi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Habitat / Yaşam Alanı
                </label>
                <select
                  value={creatureHabitatId}
                  onChange={(e) => setCreatureHabitatId(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Seçilmedi</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>📍 {loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Görünüş, Boyut & Özellikler
                </label>
                <textarea
                  value={creatureAppearance}
                  onChange={(e) => setCreatureAppearance(e.target.value)}
                  placeholder="Boyut, pullar, kanatlar, dişler, zırh..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Davranış & Avlanma
                  </label>
                  <input
                    type="text"
                    value={creatureBehavior}
                    onChange={(e) => setCreatureBehavior(e.target.value)}
                    placeholder="Sürü halinde, pusu kurarak..."
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Beslenme
                  </label>
                  <input
                    type="text"
                    value={creatureDiet}
                    onChange={(e) => setCreatureDiet(e.target.value)}
                    placeholder="Etçil, büyü emici..."
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1 text-amber-400">
                    ⚡ Özel Yetenekler
                  </label>
                  <textarea
                    value={creatureAbilities}
                    onChange={(e) => setCreatureAbilities(e.target.value)}
                    placeholder="Alev üfleme, taşlaştırma, kamuflaj..."
                    rows={2}
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1 text-rose-400">
                    🎯 Zayıf Nokta
                  </label>
                  <textarea
                    value={creatureWeaknesses}
                    onChange={(e) => setCreatureWeaknesses(e.target.value)}
                    placeholder="Gözleri hassas, soğuktan kaçar..."
                    rows={2}
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Düşen Parçalar / Değerli Materyaller
                </label>
                <input
                  type="text"
                  value={creatureDrops}
                  onChange={(e) => setCreatureDrops(e.target.value)}
                  placeholder="Ejderha pulu, zehir kesesi, elmas diş..."
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                />
              </div>

              {/* Görsel Yükleme */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Yaratık Görseli
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCreatureImage}
                    disabled={isUploadingCreatureImage}
                    className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <input
                    type="url"
                    value={creatureImageUrl}
                    onChange={(e) => setCreatureImageUrl(e.target.value)}
                    placeholder="https://.../yaratik.jpg"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Gizli Yazar Notu */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Lock size={12} /> Yalnızca Yazarın Göreceği Gizli Not
                </label>
                <textarea
                  value={creatureAuthorNotes}
                  onChange={(e) => setCreatureAuthorNotes(e.target.value)}
                  placeholder="Bu yaratık hakkındaki gizli sırlar..."
                  rows={2}
                  className="w-full bg-background/80 border border-amber-500/30 rounded-xl p-2 text-xs text-foreground resize-none"
                />
              </div>

              {/* Spoiler Koruması */}
              <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={creatureIsSpoiler}
                    onChange={(e) => setCreatureIsSpoiler(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {creatureIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={creatureSpoilerChapter}
                      onChange={(e) => setCreatureSpoilerChapter(e.target.value)}
                      placeholder="Örn: 10"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsCreatureModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveCreature}
                disabled={isUploadingCreatureImage}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingCreatureImage ? 'Yükleniyor...' : editingCreature ? 'Güncelle' : 'Yaratığı Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Kültür / İnanç Ekle / Düzenle ── */}
      {isCultureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsCultureModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Landmark size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingCulture ? 'Kayıt Düzenle' : 'Yeni Kültür / İnanç / Düzen Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Başlık / Sistem Adı *
                </label>
                <input
                  type="text"
                  value={cultureName}
                  onChange={(e) => setCultureName(e.target.value)}
                  placeholder="Örn: Işık Dini & Tapınak Düzeni, Kuzey Bozkır Kültürü, İmparatorluk Kanunları"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Kategori *
                </label>
                <select
                  value={cultureCategory}
                  onChange={(e) => setCultureCategory(e.target.value as CultureCategory)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="culture">Kültür, Gelenek & Toplum (PRD Bölüm 21)</option>
                  <option value="religion">İnanç & Mitoloji (PRD Bölüm 22)</option>
                  <option value="politics">Siyaset & Yönetim (PRD Bölüm 23)</option>
                  <option value="economy">Ekonomi & Ticaret (PRD Bölüm 24)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Genel Açıklama *
                </label>
                <textarea
                  value={cultureDesc}
                  onChange={(e) => setCultureDesc(e.target.value)}
                  placeholder="Temel felsefe, köken ve toplumsal yaygınlık..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Bağlı Irk / Halklar
                  </label>
                  <input
                    type="text"
                    value={cultureAssociatedRaces}
                    onChange={(e) => setCultureAssociatedRaces(e.target.value)}
                    placeholder="Örn: Elfler, Dağ İnsanları"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Bağlı Bölge / Şehirler
                  </label>
                  <input
                    type="text"
                    value={cultureAssociatedRegions}
                    onChange={(e) => setCultureAssociatedRegions(e.target.value)}
                    placeholder="Örn: Kuzey Krallığı, Kutsal Vadi"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Kategoriye Özel Alanlar */}
              {cultureCategory === 'culture' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Gelenekler, Bayramlar & Ritüeller
                    </label>
                    <textarea
                      value={cultureTraditions}
                      onChange={(e) => setCultureTraditions(e.target.value)}
                      placeholder="Düğünler, cenazeler, mevsimlik kutlamalar, yemek ve giyim..."
                      rows={2}
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Değerler & Tabular
                    </label>
                    <input
                      type="text"
                      value={cultureValuesTaboos}
                      onChange={(e) => setCultureValuesTaboos(e.target.value)}
                      placeholder="Onur, misafirperverlik, yasak sayılan davranışlar..."
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                </>
              )}

              {cultureCategory === 'religion' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Tanrılar, Peygamberler & Kutsal Figürler
                    </label>
                    <input
                      type="text"
                      value={cultureDeities}
                      onChange={(e) => setCultureDeities(e.target.value)}
                      placeholder="Örn: Güneş Tanrısı Solas, İlk Rehber Aeryon"
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Kutsal Yerler & Kutsal Metinler
                    </label>
                    <input
                      type="text"
                      value={cultureSacredPlaces}
                      onChange={(e) => setCultureSacredPlaces(e.target.value)}
                      placeholder="Örn: Yüce Katedral, Işık Parşömenleri"
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Yaratılış Miti & Ölüm Sonrası İnanç
                    </label>
                    <textarea
                      value={cultureCreationMyth}
                      onChange={(e) => setCultureCreationMyth(e.target.value)}
                      placeholder="Dünya nasıl var oldu? Ruhlar nereye gider?"
                      rows={2}
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                    />
                  </div>
                </>
              )}

              {cultureCategory === 'politics' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Yönetim Biçimi & Liderlik
                    </label>
                    <input
                      type="text"
                      value={cultureGovernment}
                      onChange={(e) => setCultureGovernment(e.target.value)}
                      placeholder="Örn: Teokratik Monarşi, Tüccar Konseyi, Kabile Birliği"
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Veraset, Yasalar & Mahkemeler
                    </label>
                    <textarea
                      value={cultureLaws}
                      onChange={(e) => setCultureLaws(e.target.value)}
                      placeholder="Taht kime kalır? Suçlular nasıl yargılanır?"
                      rows={2}
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                    />
                  </div>
                </>
              )}

              {cultureCategory === 'economy' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Para Birimi & Ticaret Rotaları
                    </label>
                    <input
                      type="text"
                      value={cultureCurrency}
                      onChange={(e) => setCultureCurrency(e.target.value)}
                      placeholder="Örn: Altın Duka, İpek Yolu, Kristal Takası"
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Toplumsal Sınıflar & Zenginlik Dağılımı
                    </label>
                    <textarea
                      value={cultureSocialClasses}
                      onChange={(e) => setCultureSocialClasses(e.target.value)}
                      placeholder="Soylular, loncalar, serfler, tüccarlar..."
                      rows={2}
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground resize-none"
                    />
                  </div>
                </>
              )}

              {/* Görsel Yükleme */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Sembol / İllüstrasyon Görseli
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCultureImage}
                    disabled={isUploadingCultureImage}
                    className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <input
                    type="url"
                    value={cultureImageUrl}
                    onChange={(e) => setCultureImageUrl(e.target.value)}
                    placeholder="https://.../kultur.jpg"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Gizli Yazar Notu */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Lock size={12} /> Yalnızca Yazarın Göreceği Gizli Not
                </label>
                <textarea
                  value={cultureAuthorNotes}
                  onChange={(e) => setCultureAuthorNotes(e.target.value)}
                  placeholder="Gizli gerçekler ve yazar hatırlatıcıları..."
                  rows={2}
                  className="w-full bg-background/80 border border-amber-500/30 rounded-xl p-2 text-xs text-foreground resize-none"
                />
              </div>

              {/* Spoiler Koruması */}
              <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cultureIsSpoiler}
                    onChange={(e) => setCultureIsSpoiler(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {cultureIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={cultureSpoilerChapter}
                      onChange={(e) => setCultureSpoilerChapter(e.target.value)}
                      placeholder="Örn: 10"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsCultureModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveCulture}
                disabled={isUploadingCultureImage}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingCultureImage ? 'Yükleniyor...' : editingCulture ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Görsel / Medya Ekle / Düzenle (PRD 46) ── */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Palette size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingMedia ? 'Görseli Düzenle' : 'Yeni Görsel / Konsept Eskizi Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              {/* Görsel Yükleme (Otomatik WebP Sıkıştırma) */}
              <div className="p-3.5 rounded-2xl bg-background/60 border border-dashed border-border/70 text-center space-y-2">
                {mediaImageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={mediaImageUrl}
                      alt="Önizleme"
                      className="max-h-48 mx-auto rounded-xl object-contain border border-border/50 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaImageUrl('')}
                      className="text-[11px] text-destructive hover:underline font-bold"
                    >
                      Görseli Kaldır
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer block space-y-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-bold text-foreground block">
                        {isUploadingMediaImage ? 'WebP formatında optimize ediliyor...' : 'Görsel Seç veya Sürükle'}
                      </span>
                      <span className="text-[10px] text-muted block">
                        Yüksek boyutlu fotoğraflar otomatik olarak optimize WebP formatına dönüştürülür.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadMediaImage}
                        disabled={isUploadingMediaImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Görsel Başlığı *
                </label>
                <input
                  type="text"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="Örn: Boris Kadim Zırhı Konsepti, Kuzey Kalesi Gün Batımı"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Kategori
                  </label>
                  <select
                    value={mediaCategory}
                    onChange={(e) => setMediaCategory(e.target.value as MediaCategory)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {Object.entries(MEDIA_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Görünürlük İzni
                  </label>
                  <select
                    value={mediaIsAuthorOnly ? 'private' : 'public'}
                    onChange={(e) => setMediaIsAuthorOnly(e.target.value === 'private')}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="public">🌐 Okuyucuya Açık Galeri</option>
                    <option value="private">🔒 Sadece Yazara Özel Moodboard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Açıklama / Notlar
                </label>
                <textarea
                  value={mediaDesc}
                  onChange={(e) => setMediaDesc(e.target.value)}
                  placeholder="Bu görsel neyi anlatıyor? Çizim detayları veya sahne bağlamı..."
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Etiketler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={mediaTagsInput}
                  onChange={(e) => setMediaTagsInput(e.target.value)}
                  placeholder="Örn: zırh, boris, kuzey, kış, eskiz"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Renk Paleti (Hex kodları virgülle, örn: #1e293b, #3b82f6)
                </label>
                <input
                  type="text"
                  value={mediaColorPaletteInput}
                  onChange={(e) => setMediaColorPaletteInput(e.target.value)}
                  placeholder="#1e293b, #3b82f6, #f59e0b"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                />
              </div>

              {/* Spoiler Koruması */}
              <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mediaIsSpoiler}
                    onChange={(e) => setMediaIsSpoiler(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {mediaIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={mediaSpoilerChapter}
                      onChange={(e) => setMediaSpoilerChapter(e.target.value)}
                      placeholder="Örn: 5"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsMediaModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveMedia}
                disabled={isUploadingMediaImage}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {isUploadingMediaImage ? 'Yükleniyor...' : editingMedia ? 'Güncelle' : 'Galeriye Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Müzik & Soundtrack Ekle / Düzenle (PRD 29) ── */}
      {isSoundtrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsSoundtrackModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Music size={18} />
              </div>
              <Typography variant="h3" className="font-bold text-base">
                {editingSoundtrack ? 'Parçayı Düzenle' : 'Yeni Evren Müziği / Ambiyans Ekle'}
              </Typography>
            </div>

            <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Müzik Bağlantısı (URL) *
                </label>
                <input
                  type="url"
                  value={soundtrackUrl}
                  onChange={(e) => setSoundtrackUrl(e.target.value)}
                  placeholder="https://open.spotify.com/... veya https://youtube.com/... veya .mp3"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                />
                {soundtrackUrl.trim() && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-primary">
                    <span className="font-bold">Tespit Edilen Platform:</span>
                    <span className="px-1.5 py-0.2 rounded bg-primary/10 font-bold">
                      {getAudioPlatformLabel(parseAudioTrack(soundtrackUrl).platform)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Parça Adı *
                  </label>
                  <input
                    type="text"
                    value={soundtrackTitle}
                    onChange={(e) => setSoundtrackTitle(e.target.value)}
                    placeholder="Örn: Kuzey Krallığı Ambiyansı"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Sanatçı / Besteci
                  </label>
                  <input
                    type="text"
                    value={soundtrackArtist}
                    onChange={(e) => setSoundtrackArtist(e.target.value)}
                    placeholder="Örn: Jeremy Soule, Hans Zimmer"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Tema Türü
                </label>
                <select
                  value={soundtrackTheme}
                  onChange={(e) => setSoundtrackTheme(e.target.value as SoundtrackTheme)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  {Object.entries(SOUNDTRACK_THEME_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Açıklama / Okuyucuya Not
                </label>
                <textarea
                  value={soundtrackDesc}
                  onChange={(e) => setSoundtrackDesc(e.target.value)}
                  placeholder="Bu parça hikâyede hangi sahneleri veya hissi temsil ediyor?"
                  rows={2}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    İlişkili Mekân (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={soundtrackLocation}
                    onChange={(e) => setSoundtrackLocation(e.target.value)}
                    placeholder="Örn: Buz Kalesi"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    İlişkili Karakter (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={soundtrackCharacter}
                    onChange={(e) => setSoundtrackCharacter(e.target.value)}
                    placeholder="Örn: Boris"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Spoiler Koruması */}
              <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundtrackIsSpoiler}
                    onChange={(e) => setSoundtrackIsSpoiler(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {soundtrackIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={soundtrackSpoilerChapter}
                      onChange={(e) => setSoundtrackSpoilerChapter(e.target.value)}
                      placeholder="Örn: 8"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsSoundtrackModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveSoundtrack}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {editingSoundtrack ? 'Güncelle' : 'Parçayı Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Canon Kuralı Ekle / Düzenle (PRD 30) ── */}
      {isCanonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCanonModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <Scale className="text-primary" size={20} />
              <Typography variant="h3" className="font-bold text-base">
                {editingCanonRule ? 'Canon Kuralını Düzenle' : 'Yeni Canon Kuralı Ekle'}
              </Typography>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Kural Başlığı *</label>
                <input
                  type="text"
                  value={canonTitle}
                  onChange={(e) => setCanonTitle(e.target.value)}
                  placeholder="Örn: Ruh Çağırmanın Geri Tepme Yasası"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Kategori *</label>
                <select
                  value={canonCategory}
                  onChange={(e) => setCanonCategory(e.target.value as CanonRuleCategory)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  {(Object.keys(CANON_RULE_CATEGORY_LABELS) as CanonRuleCategory[]).map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {CANON_RULE_CATEGORY_LABELS[catKey]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Kural Tanımı ve İşleyişi *</label>
                <textarea
                  value={canonRuleDesc}
                  onChange={(e) => setCanonRuleDesc(e.target.value)}
                  rows={4}
                  placeholder="Bu kural evrende nasıl işler? Hangi fiziksel veya mistik mekanizma geçerlidir? Yazarlar hikaye yazarken buna nasıl uymalıdır?"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> İhlal Bedeli (Kural Çiğnenirse Ne Olur?)
                </label>
                <textarea
                  value={canonConsequences}
                  onChange={(e) => setCanonConsequences(e.target.value)}
                  rows={2}
                  placeholder="Örn: Büyücünün zihni yanar, kanı zehirlenir veya evrensel denge bozulur..."
                  className="w-full bg-background border border-amber-500/30 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-400 block mb-1 flex items-center gap-1">
                  <Sparkles size={12} /> İstisnalar (Var mı?)
                </label>
                <textarea
                  value={canonExceptions}
                  onChange={(e) => setCanonExceptions(e.target.value)}
                  rows={2}
                  placeholder="Örn: Yalnızca kadim tanrıların soyundan gelenler bu sınırlamayı aşabilir..."
                  className="w-full bg-background border border-blue-500/30 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Yazar İpuçları & Özel Notlar</label>
                <input
                  type="text"
                  value={canonAuthorNotes}
                  onChange={(e) => setCanonAuthorNotes(e.target.value)}
                  placeholder="Yazarlar arası gizli not..."
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-2xl bg-background/50 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canonIsStrict}
                    onChange={(e) => setCanonIsStrict(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Bükülemez / Kesin Yasa</span>
                    <span className="text-[10px] text-muted">Tüm seriler ve yazarlar uymak zorundadır</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-2xl bg-background/50 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canonIsPublic}
                    onChange={(e) => setCanonIsPublic(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Okuyucuya Açık</span>
                    <span className="text-[10px] text-muted">Evren sayfasında ve okuma çekmecesinde gösterilir</span>
                  </div>
                </label>
              </div>

              {/* Spoiler Koruması */}
              <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canonIsSpoiler}
                    onChange={(e) => setCanonIsSpoiler(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-foreground">Okuyucuya Karşı Spoiler Maskele</span>
                </label>
                {canonIsSpoiler && (
                  <div className="pl-6">
                    <label className="text-[11px] text-muted block mb-1">Kaçıncı bölümden sonra açılsın?</label>
                    <input
                      type="number"
                      min="1"
                      value={canonSpoilerChapter}
                      onChange={(e) => setCanonSpoilerChapter(e.target.value)}
                      placeholder="Örn: 5"
                      className="w-28 bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsCanonModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveCanonRule}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {editingCanonRule ? 'Güncelle' : 'Kuralı Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Kurgu Düğümü Ekle / Düzenle (PRD 31) ── */}
      {isThreadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsThreadModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <HelpCircle className="text-primary" size={20} />
              <Typography variant="h3" className="font-bold text-base">
                {editingThread ? 'Kurgu Düğümünü Düzenle' : 'Yeni Kurgu Düğümü / Gizem Ekle'}
              </Typography>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Gizem / Düğüm Başlığı *</label>
                <input
                  type="text"
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="Örn: Kralın Gerçek Katili Kimdi?"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Önem Derecesi *</label>
                  <select
                    value={threadImportance}
                    onChange={(e) => setThreadImportance(e.target.value as PlotThreadImportance)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {(Object.keys(PLOT_THREAD_IMPORTANCE_LABELS) as PlotThreadImportance[]).map((impKey) => (
                      <option key={impKey} value={impKey}>
                        {PLOT_THREAD_IMPORTANCE_LABELS[impKey]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Mevcut Durum *</label>
                  <select
                    value={threadStatus}
                    onChange={(e) => setThreadStatus(e.target.value as PlotThreadStatus)}
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {(Object.keys(PLOT_THREAD_STATUS_LABELS) as PlotThreadStatus[]).map((stKey) => (
                      <option key={stKey} value={stKey}>
                        {PLOT_THREAD_STATUS_LABELS[stKey]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Gizemin Açıklaması ve Kapsamı *</label>
                <textarea
                  value={threadDesc}
                  onChange={(e) => setThreadDesc(e.target.value)}
                  rows={3}
                  placeholder="Bu düğüm nedir? Hangi olay sonucunda doğdu? Hangi karakterler bu sırrın peşinde?"
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-background/40 border border-border/40">
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">İlk Ortaya Çıktığı Eser</label>
                  <input
                    type="text"
                    value={threadIntroStory}
                    onChange={(e) => setThreadIntroStory(e.target.value)}
                    placeholder="Örn: Gölgelerin Efendisi"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">İlk Bölüm No</label>
                  <input
                    type="number"
                    min="1"
                    value={threadIntroChapter}
                    onChange={(e) => setThreadIntroChapter(e.target.value)}
                    placeholder="Örn: 3"
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Çözüldüyse Çözüm Alanı */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 block">Çözüm Bilgileri (Çözüldüyse)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted block mb-1">Çözüldüğü Eser</label>
                    <input
                      type="text"
                      value={threadResolvedStory}
                      onChange={(e) => setThreadResolvedStory(e.target.value)}
                      placeholder="Örn: Son Savaş Kitabı"
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted block mb-1">Çözüldüğü Bölüm</label>
                    <input
                      type="number"
                      min="1"
                      value={threadResolvedChapter}
                      onChange={(e) => setThreadResolvedChapter(e.target.value)}
                      placeholder="Örn: 24"
                      className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted block mb-1">Gizemin Çözüm Özeti (Yazar Arşivi)</label>
                  <textarea
                    value={threadResolutionSummary}
                    onChange={(e) => setThreadResolutionSummary(e.target.value)}
                    rows={2}
                    placeholder="Katilin vezir olduğu ve zehri kadehe koyduğu ortaya çıktı..."
                    className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Yazar Notları</label>
                <input
                  type="text"
                  value={threadAuthorNotes}
                  onChange={(e) => setThreadAuthorNotes(e.target.value)}
                  placeholder="Gelecek kitapta çözülecek, ipucu 5. bölümde verilecek..."
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-2xl bg-background/50 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={threadIsPublic}
                    onChange={(e) => setThreadIsPublic(e.target.checked)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Okuyucuya Açık Gizem</span>
                    <span className="text-[10px] text-muted">Okurlar bu sorunun peşinden gitsin</span>
                  </div>
                </label>

                <div className="p-3 rounded-2xl bg-background/50 border border-border/40 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={threadIsSpoiler}
                      onChange={(e) => setThreadIsSpoiler(e.target.checked)}
                      className="accent-primary rounded w-4 h-4"
                    />
                    <span className="text-xs font-bold text-foreground">Spoiler Maskele</span>
                  </label>
                  {threadIsSpoiler && (
                    <input
                      type="number"
                      min="1"
                      value={threadSpoilerChapter}
                      onChange={(e) => setThreadSpoilerChapter(e.target.value)}
                      placeholder="Bölüm eşiği (örn 4)"
                      className="w-full bg-background border border-border/60 rounded-xl p-1.5 text-xs text-foreground"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsThreadModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveThread}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                {editingThread ? 'Güncelle' : 'Düğümü Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: İpucu Ekle ── */}
      {isAddClueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsAddClueModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <Lightbulb className="text-amber-400" size={20} />
              <Typography variant="h3" className="font-bold text-base">
                Gizeme Yeni İpucu Ekle
              </Typography>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Eser Adı</label>
                  <input
                    type="text"
                    value={clueStoryTitle}
                    onChange={(e) => setClueStoryTitle(e.target.value)}
                    placeholder="Örn: 1. Kitap"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Bölüm No</label>
                  <input
                    type="number"
                    min="1"
                    value={clueChapterOrder}
                    onChange={(e) => setClueChapterOrder(e.target.value)}
                    placeholder="Örn: 7"
                    className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Ekilen İpucu / Keşif Notu *</label>
                <textarea
                  value={clueNote}
                  onChange={(e) => setClueNote(e.target.value)}
                  rows={3}
                  placeholder="Karakter kütüphanede yanmış bir mektup parçası buldu. Üzerinde mavi balmumu mührü vardı..."
                  className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="ghost" onPress={() => setIsAddClueModalOpen(false)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveClue}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-md"
              >
                İpucu Ekle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL EVREN İÇİ ARAMA & HIZLI GEZİNME (PRD BÖLÜM 50 & 51) ── */}
      {isGlobalSearchOpen && universe && (
        <UniverseSearchDrawer
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          universeTitle={title || universe.title}
          isAuthorMode={true}
          characters={characters}
          locations={locations}
          timelineEvents={timelineEvents}
          glossary={glossaryTerms}
          lore={loreList}
          items={items}
          organizations={organizations}
          powerSystems={powerSystems}
          races={races}
          creatures={creatures}
          cultures={cultures}
          canonRules={canonRules}
          plotThreads={plotThreads}
          stories={connectedStories}
          seriesList={connectedSeries}
          onSelectResult={handleSelectSearchResult}
          onQuickAdd={handleQuickAdd}
        />
      )}
    </div>
  );
}
