import type { Timestamp } from 'firebase/firestore';

export type UniverseVisibility = 'private' | 'team' | 'draft' | 'unlisted' | 'partially_public' | 'public';

export type UniverseGenre = 
  | 'fantasy'
  | 'sci-fi'
  | 'real_world'
  | 'alternate_history'
  | 'dystopia'
  | 'utopia'
  | 'contemporary'
  | 'historical'
  | 'mythological'
  | 'post_apocalyptic'
  | 'hybrid'
  | 'custom';

export interface UniverseStats {
  characterCount: number;
  locationCount: number;
  eventCount: number;
  storyCount: number;
  seriesCount?: number;
  views?: number;
  likes?: number;
}

export interface Universe {
  universeId: string;
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  bannerImage?: string;
  genre: UniverseGenre;
  tags: string[];
  visibility: UniverseVisibility;
  
  // Bağlı Eserler ve Seriler
  connectedStoryIds: string[];
  connectedSeriesIds?: string[];
  
  stats: UniverseStats;
  
  // Çoklu Yazar & Ekip Üyeleri (PRD Bölüm 32, 66)
  members?: UniverseMember[];
  collaboratorIds?: string[]; // Query / Security rules için: [userId1, userId2, ...]

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Karakter Defteri 2.0 İleri Düzey Alanları
// ─────────────────────────────────────────────────────────────────

export interface CharacterArc {
  startingState?: string;       // 1. Başlangıç Durumu
  flawOrLack?: string;          // 2. Eksiklik / Zaaf
  incitingIncident?: string;    // 3. Tetikleyici Olay
  firstChange?: string;         // 4. İlk Değişim
  majorShift?: string;          // 5. Büyük Kırılma
  crisis?: string;              // 6. Kriz
  climaxDecision?: string;      // 7. Son Karar
  finalState?: string;          // 8. Final Durumu
}

export interface CharacterRelationship {
  targetCharacterId: string;
  targetCharacterName?: string;
  targetCharacterAvatar?: string;
  relationshipType: string;     // anne, dost, düşman, mentor, müttefik, rakip vb.
  description?: string;
  isReciprocal?: boolean;       // Karşılıklı mı?
  isSecret?: boolean;           // Gizli ilişki mi?
  spoilerThresholdChapter?: number; // Hangi bölümden sonra görünür?
}

export interface CharacterPNGGallery {
  portraitUrl?: string;         // Ana vesikalık portre
  transparentPngUrl?: string;   // Şeffaf PNG (3D ve Parallax vitrin için)
  fullBodyUrl?: string;         // Tam vücut çizimi
  alternateCostumeUrls?: string[];
}

// ─────────────────────────────────────────────────────────────────
// Mekân Defteri (Location)
// ─────────────────────────────────────────────────────────────────

export type LocationType = 
  | 'world'
  | 'continent'
  | 'country'
  | 'region'
  | 'city'
  | 'district'
  | 'building'
  | 'room'
  | 'special';

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  world: 'Dünya / Evren',
  continent: 'Kıta',
  country: 'Ülke / Krallık',
  region: 'Bölge',
  city: 'Şehir / Başkent',
  district: 'Mahalle / Semt',
  building: 'Bina / Kale / Tapınak',
  room: 'Oda / Özel Alan',
  special: 'Özel / Boyutsal Alan',
};

export interface UniverseLocation {
  id: string;
  universeId: string;
  name: string;
  type: LocationType;
  parentLocationId?: string;    // Üst mekân bağlantısı (Hiyerarşi: Dünya -> Kıta -> Ülke -> Şehir -> Bina vb.)
  description: string;          // Kısa tanım
  detailedDescription?: string; // Detaylı dünya kurma anlatısı
  imageUrl?: string;            // Manzara, konsept çizim veya harita görseli
  
  // Coğrafya, İklim & Atmosfer
  climate?: string;             // İklim (örn: Sert karasal, tropik muson)
  geography?: string;           // Coğrafya (örn: Uçurumlar, derin vadiler, volkanik topraklar)
  atmosphere?: string;          // Atmosfer / Hissiyat (örn: Kasvetli sis, neon ışıklar, kadim büyü kokusu)
  
  // Toplum, Kültür & Yönetim
  population?: string;          // Nüfus ve yaşayan halk (örn: 250.000, çoğunlukla Elfler ve Cüceler)
  languages?: string;           // Konuşulan diller / lehçeler (örn: Yüksek Elfçe, Ortak Dil)
  culture?: string;             // Kültür, gelenekler ve yaşam tarzı
  governance?: string;          // Yönetim biçimi ve lider / hükümdar
  economy?: string;             // Ekonomi, ticaret, ana üretim ve para birimi
  security?: string;            // Güvenlik, askeri güç, surlar ve savunma durumu
  history?: string;             // Tarihçe ve kuruluş efsanesi
  
  // Özel Kurallar & Tehlikeler
  specialRules?: string;        // Özel kurallar ve yasalar (örn: Büyü kullanımı yasak)
  dangers?: string;             // Tehlikeler, yaratıklar, zehirli alanlar ve tehditler
  
  // Bağlantılar (İlişkili Varlıklar)
  importantCharacterIds?: string[];     // Bu mekânda yaşayan / doğan önemli karakterler
  relatedEventIds?: string[];           // Mekânda gerçekleşen önemli tarihsel olaylar
  relatedOrganizationIds?: string[];    // Mekânda bulunan loncalar, tarikatlar veya haneler
  
  // Iceberg Dünya Kurma & Görünürlük
  authorNotes?: string;         // Yalnızca yazar notu (Görünmeyen derin katman)
  readerNotes?: string;         // Okuyucuya açık bilgi
  secretLore?: string;          // Gizli gerçek (Plot twist / iceberg'in altı)
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Olaylar ve Zaman Çizelgesi (Timeline Event)
// ─────────────────────────────────────────────────────────────────

export type TimelineEventType = 'universe_history' | 'story_timeline';

export interface UniverseTimelineEvent {
  id: string;
  universeId: string;
  title: string;
  summary: string;
  detailedDescription?: string;
  eventType: TimelineEventType; // Evren Tarihi mi yoksa Hikâye Kronolojisi mi?
  
  // Kurmaca Takvim
  era?: string;                 // Örn: "3. Çağ", "Mühürden Sonra"
  customDate?: string;          // Örn: "Yıl 450", "Büyük Savaştan 12 yıl sonra"
  chronologicalOrder: number;   // Sayısal kronolojik sıralama değeri
  
  // İlişkili Bağlantılar
  relatedCharacterIds?: string[];
  relatedLocationIds?: string[];
  relatedStoryIds?: string[];
  relatedChapterIds?: string[];
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Organizasyonlar & Hanedanlar
// ─────────────────────────────────────────────────────────────────

export type OrganizationType = 
  | 'kingdom'
  | 'empire'
  | 'guild'
  | 'school'
  | 'cult'
  | 'corporation'
  | 'family'
  | 'secret_society'
  | 'army'
  | 'other';

export interface UniverseOrganization {
  id: string;
  universeId: string;
  name: string;
  type: OrganizationType;
  description: string;
  symbolUrl?: string;
  motto?: string;
  leaderCharacterId?: string;
  leaderCharacterName?: string;
  memberCharacterIds?: string[];
  headquarterLocationId?: string;
  headquartersLocationName?: string;
  ideology?: string;
  authorNotes?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Eşyalar & Artefaktlar
// ─────────────────────────────────────────────────────────────────

export interface UniverseItem {
  id: string;
  universeId: string;
  name: string;
  type: string;                 // Silah, tılsım, kitap, teknoloji, anahtar vb.
  description: string;
  origin?: string;              // Kökeni / Yaratanı
  creatorCharacterName?: string;
  currentOwnerId?: string;      // Mevcut Sahibi
  currentOwnerName?: string;
  powerDescription?: string;    // Gücü / İşlevi
  powersAndAbilities?: string;
  limitation?: string;          // Sınırı / Bedeli
  limitationsAndCosts?: string;
  imageUrl?: string;
  authorNotes?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Güç / Büyü / Teknoloji Sistemleri
// ─────────────────────────────────────────────────────────────────

export interface PowerTier {
  rank?: number;
  title: string;
  description?: string;
}

export interface UniversePowerSystem {
  id: string;
  universeId: string;
  name: string;                 // Örn: "Mavi Enerji", "Rün Büyüsü", "Sibernetik Geliştirme"
  type?: string;                // magic, technology, etc.
  corePrinciples: string;       // Temel Prensip
  source?: string;              // Kaynağı (Nereden beslenir?)
  sourceOfPower?: string;
  whoCanUse?: string;           // Kimler kullanabilir?
  rulesAndLimits: string;       // Kurallar ve Sınırlar
  costAndRisks?: string;        // Bedeli ve Riskleri
  costsAndRisks?: string;
  levelsOrTiers?: string[];     // Seviyeler / Rütbeler
  tiers?: PowerTier[];
  authorNotes?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Diller & Sözlük (Glossary)
// ─────────────────────────────────────────────────────────────────

export interface UniverseGlossaryTerm {
  id: string;
  universeId: string;
  term: string;                 // Terim adı
  pronunciation?: string;       // Telaffuz
  meaning: string;              // Anlamı / Açıklaması
  category?: string;            // Büyü, Coğrafya, Argo, Unvan vb.
  firstAppearedChapterId?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Lore / Dünya Bilgisi
// ─────────────────────────────────────────────────────────────────

export type LoreCategory = 
  | 'history'
  | 'legend'
  | 'myth'
  | 'secret'
  | 'prophecy'
  | 'rule'
  | 'science'
  | 'custom';

export interface UniverseLore {
  id: string;
  universeId: string;
  title: string;
  category: LoreCategory;
  content: string;              // Ana yazar içeriği
  readerContent?: string;       // Okuyucuya açık özet
  secretContent?: string;       // Açılmamış gizli gerçek
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Dünya Haritası ve İnteraktif İşaretçiler (World Map & Pins)
// ─────────────────────────────────────────────────────────────────

export type MapType = 
  | 'world'
  | 'continent'
  | 'country'
  | 'region'
  | 'city'
  | 'building'
  | 'custom';

export type MapMarkerIcon = 
  | 'city'
  | 'village'
  | 'castle'
  | 'mountain'
  | 'forest'
  | 'port'
  | 'ruins'
  | 'battlefield'
  | 'secret'
  | 'temple'
  | 'cave'
  | 'portal'
  | 'other';

export interface UniverseMapMarker {
  id: string;
  title: string;
  description?: string;
  icon: MapMarkerIcon;
  color?: string;               // Marker rengi (ör. hex: '#6366f1')
  x: number;                    // 0 ile 100 arasında X koordinatı (%)
  y: number;                    // 0 ile 100 arasında Y koordinatı (%)
  
  // Bağlantılar (PRD 12.4)
  locationId?: string;          // Bağlı Mekân
  locationName?: string;
  eventId?: string;             // Bağlı Olay
  eventName?: string;
  characterId?: string;         // Bağlı Karakter
  characterName?: string;
  
  // Görünürlük & Spoiler (PRD 12.6, 73, 78)
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  fogOfWar?: boolean;           // Sis perdesi / Henüz keşfedilmedi mi?
}

export interface UniverseMapRoute {
  id: string;
  title: string;                // Örn: "Boris'in Yolculuğu"
  description?: string;
  color?: string;
  markerIds: string[];          // Sıralı marker id listesi
  spoilerThresholdChapter?: number;
}

export interface UniverseMap {
  id: string;
  universeId: string;
  title: string;
  description?: string;
  mapType: MapType;
  imageUrl: string;
  markers: UniverseMapMarker[];
  routes?: UniverseMapRoute[];
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Irklar ve Türler (PRD Bölüm 18)
// ─────────────────────────────────────────────────────────────────

export interface UniverseRace {
  id: string;
  universeId: string;
  name: string;                         // Örn: "Elfler", "Kadimler", "Gölge Yürüyenler"
  alternativeNames?: string;            // Örn: "Sidhe, Orman Halkı"
  altNames?: string[];                  // Alternatif isimler listesi
  origin?: string;                      // Köken / Yaratılış efsanesi
  physicalTraits?: string;              // Boy, ten, göz, kanat, boynuz vb.
  lifespan?: string;                    // Yaşam süresi (Örn: "800 - 1000 yıl", "Ölümsüz")
  biology?: string;                     // Biyolojik yapısı, metabolizma
  culture?: string;                     // Toplumsal ve kültürel yapı
  cultureAndTraditions?: string;
  language?: string;                    // Konuştukları ana dil
  homelandRegionId?: string;            // Anavatan / Bağlı mekân ID
  homelandRegionName?: string;
  strengths?: string | string[];        // Güçlü yönler
  weaknesses?: string | string[];       // Zayıf yönler
  relationshipsWithOtherRaces?: string; // Diğer ırklarla ilişkiler
  history?: string;                     // Kısa tarihçe
  notableCharacterIds?: string[];       // Bilinen önemli karakterler
  imageUrl?: string;
  authorNotes?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Yaratıklar ve Canavarlar (PRD Bölüm 19)
// ─────────────────────────────────────────────────────────────────

export type CreatureType = 
  | 'monster'       // Canavar
  | 'mythological'  // Mitolojik Varlık
  | 'beast'         // Efsanevi Hayvan
  | 'artificial'    // Yapay Yaşam Formu / Golem / Sibernetik
  | 'alien'         // Uzaylı Organizma
  | 'spiritual'     // Spiritüel / Ruhani Varlık
  | 'other';

export type CreatureDangerLevel = 
  | 'harmless'   // Zararsız / Evcil
  | 'low'        // Düşük Tehlike
  | 'medium'     // Orta Tehlike
  | 'high'       // Yüksek Tehlike
  | 'deadly'     // Ölümcül
  | 'calamity';   // Felaket / Efsanevi Yıkım

export interface UniverseCreature {
  id: string;
  universeId: string;
  name: string;                         // Örn: "Kızıl Ejderha", "Gölge Kurdu"
  type: CreatureType;
  creatureType?: CreatureType;          // Alias
  dangerLevel: CreatureDangerLevel;
  appearance?: string;                  // Görünüş, boyut, pullar, kanatlar
  behavior?: string;                    // Davranış, sürü mü yalnız mı?
  habitatLocationId?: string;           // Habitat / Bağlı Mekân ID
  habitatLocationName?: string;
  habitatNames?: string[];              // Alias
  diet?: string;                        // Beslenme (Etçil, otçul, büyü emici vb.)
  abilities?: string | string[];        // Özel yetenekler
  weaknesses?: string | string[];       // Zayıf noktaları
  dropsOrMaterials?: string;            // Düşen materyaller / Simya malzemeleri
  dropMaterials?: string[];             // Alias
  lore?: string;                        // Mitoloji, avcı hikâyeleri
  relatedEventIds?: string[];           // Bağlı tarihsel olaylar
  imageUrl?: string;
  authorNotes?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Kültür, İnanç, Mitoloji & Dünya Düzeni (PRD Bölüm 21, 22, 23, 24)
// ─────────────────────────────────────────────────────────────────

export type CultureCategory = 
  | 'culture'   // Kültür, Gelenek & Toplum (PRD Bölüm 21)
  | 'religion'  // İnanç & Mitoloji (PRD Bölüm 22)
  | 'politics'  // Siyaset & Yönetim (PRD Bölüm 23)
  | 'economy';  // Ekonomi & Ticaret (PRD Bölüm 24)

export interface UniverseCulture {
  id: string;
  universeId: string;
  name: string;                         // Örn: "Işık Dini ve Tapınak Düzeni", "Kuzey Bozkır Kültürü"
  category: CultureCategory;
  description?: string;
  associatedRaces?: string;             // Bağlı ırklar / halklar
  associatedRegions?: string;           // Bağlı coğrafya / bölgeler
  
  // Kültür Alanları (PRD 21)
  traditionsAndCustoms?: string;        // Gelenekler, bayramlar, ritüeller
  traditions?: string;                  // Alias
  valuesAndTaboos?: string;             // Ahlaki değerler, tabular, yasaklar
  taboos?: string;                      // Alias
  
  // İnanç & Mitoloji Alanları (PRD 22)
  deitiesAndFigures?: string;           // Tanrılar, peygamberler, kutsal kişiler
  deitiesOrFigures?: string[];          // Alias
  sacredPlacesAndTexts?: string;        // Kutsal yerler, tapınaklar, kutsal metinler
  holyPlaces?: string[];                // Alias
  creationMythAndAfterlife?: string;    // Yaratılış anlatısı, ölüm sonrası inanç
  creationMyth?: string;                // Alias
  
  // Siyaset & Yönetim Alanları (PRD 23)
  governmentSystem?: string;            // Yönetim biçimi, diplomasi, yasalar
  governanceSystem?: string;            // Alias
  lawsAndSuccession?: string;           // Veraset, mahkeme, krizler
  laws?: string;                        // Alias
  
  // Ekonomi & Toplum Alanları (PRD 24)
  currencyAndTrade?: string;            // Para birimi, ana ticaret yolları, loncalar
  currency?: string;                    // Alias
  socialClasses?: string | string[];    // Toplumsal sınıflar
  
  imageUrl?: string;
  authorNotes?: string;
  
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Görsel Arşiv, Galeri & Moodboard (PRD Bölüm 46)
// ─────────────────────────────────────────────────────────────────

export type MediaCategory = 
  | 'character'     // Karakter referansları
  | 'location'      // Mekânlar & Doğa
  | 'architecture'  // Mimari & Yapılar
  | 'costume'       // Kostümler, Zırhlar & Kıyafet
  | 'atmosphere'    // Atmosfer & Işık
  | 'color_palette' // Renk Paleti
  | 'item'          // Eşyalar & Objeler
  | 'other';        // Diğer

export interface UniverseMedia {
  id: string;
  universeId: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: MediaCategory;
  description?: string;
  tags?: string[];
  colorPalette?: string[];      // Hex renk kodları örn: ['#1e293b', '#3b82f6']
  isAuthorOnly?: boolean;       // True ise yalnızca yazara özel (moodboard), false ise okuyucuya açık galeri
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  authorNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Evren Müzikleri, Soundtrack & Ambiyans (PRD Bölüm 29 & Audio Atmosphere)
// ─────────────────────────────────────────────────────────────────

export type SoundtrackTheme = 
  | 'main_theme'    // Ana Evren Teması
  | 'location'      // Bölge / Mekân Ambiyansı
  | 'battle'        // Savaş / Aksiyon Teması
  | 'character'     // Karakter Teması
  | 'emotional'     // Duygusal / Hüzünlü Sahne
  | 'ambient';      // Doğa / Arka Plan Ambiyansı

export interface UniverseSoundtrack {
  id: string;
  universeId: string;
  title: string;
  artist?: string;
  url: string;                   // Spotify, YouTube, doğrudan mp3
  platform?: 'youtube' | 'spotify' | 'direct' | 'other';
  themeType: SoundtrackTheme;
  theme?: SoundtrackTheme;       // Alias for themeType
  description?: string;
  targetLocationName?: string;
  targetCharacterName?: string;
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  authorNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Seri Bible & Değişmez Evren Kuralları (PRD Bölüm 30)
// ─────────────────────────────────────────────────────────────────

export type CanonRuleCategory =
  | 'magic_system'   // Büyü & Doğaüstü Kanunları (örn: Ölüler diriltilemez)
  | 'cosmology'      // Fizik, Uzay & Zaman (örn: Zaman yolculuğu imkansızdır)
  | 'biological'     // Irk & Biyoloji Sınırları
  | 'historical'     // Değiştirilemez Tarihsel Olaylar (Canon Tarih)
  | 'societal'       // Toplum, Kültür & Tabular
  | 'do_not_repeat'; // Tekrar Edilmemesi Gereken Kurgusal Durumlar / Yasaklı Klişeler

export interface UniverseCanonRule {
  id: string;
  universeId: string;
  title: string;
  category: CanonRuleCategory;
  ruleDescription?: string;
  description?: string;         // Alias
  consequences?: string;        // Bu kural çiğnenirse veya ihlal edilirse ne olur?
  exceptions?: string;          // Bilinen tek istisna veya efsanevi açık kapı
  affectedStories?: string[];   // Kuralın geçerli olduğu eser id'leri (boş ise tüm evren)
  isStrict: boolean;            // true: Kesin / Mutlak Kanun, false: Esnetilebilir / İstisnalı
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  spoilerChapterOrder?: number; // Alias
  isPublic?: boolean;           // Okuyucu evren keşfinde görüntülensin mi?
  authorNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// Açık Kurgu Düğümleri, Gizemler & Çözülen Konular (PRD Bölüm 31)
// ─────────────────────────────────────────────────────────────────

export type PlotThreadStatus =
  | 'open'           // Açık / Çözülmeyi bekleyen düğüm
  | 'clues_planted'  // İpuçları verildi / İlerleme aşamasında
  | 'resolved'       // Çözüldü / Açığa kavuştu
  | 'abandoned';     // Rafa kaldırıldı / İptal edildi

export type PlotThreadImportance =
  | 'critical'       // Ana Evren Gizemi (Evreni şekillendiren düğüm)
  | 'major'          // Ana Kurgu Düğümü (Kitabın ana çatışması)
  | 'minor'          // Alt Kurgu / Karakter Gizemi
  | 'side_mystery';  // Arka Plan Detayı / Yan Gizem

export interface PlotThreadClue {
  id: string;
  chapterOrder?: number;
  storyTitle?: string;
  note: string;
  createdAt: Timestamp;
}

export interface UniversePlotThread {
  id: string;
  universeId: string;
  title: string;                       // Örn: "Kral Eldrin'in Katili Kim?"
  description?: string;
  status: PlotThreadStatus;
  importance: PlotThreadImportance;
  introducedInStoryTitle?: string;
  introducedInChapterOrder?: number;
  resolvedInStoryTitle?: string;
  resolvedInChapterOrder?: number;
  resolutionSummary?: string;          // Çözümün ne olduğu / nihai gerçek
  clues?: PlotThreadClue[];            // Bırakılan ipuçları ve bölümleri
  relatedCharacterIds?: string[];
  relatedLocationIds?: string[];
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  spoilerChapterOrder?: number;        // Alias
  isPublic?: boolean;                  // Okurlara keşif sayfasında gösterilsin mi?
  authorNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const CANON_RULE_CATEGORY_LABELS: Record<CanonRuleCategory, string> = {
  magic_system: 'Büyü & Doğaüstü Kanunları',
  cosmology: 'Fizik, Kozmoloji & Zaman',
  biological: 'Biyoloji & Irk Sınırları',
  historical: 'Değişmez Canon Tarihi',
  societal: 'Toplum & Kültür Tabuları',
  do_not_repeat: 'Tekrar Edilmeyecek Kurgular',
};

export const PLOT_THREAD_STATUS_LABELS: Record<PlotThreadStatus, string> = {
  open: 'Açık / Çözülmemiş',
  clues_planted: 'İpuçları Verildi',
  resolved: 'Çözüldü',
  abandoned: 'Rafa Kaldırıldı',
};

export const PLOT_THREAD_IMPORTANCE_LABELS: Record<PlotThreadImportance, string> = {
  critical: 'Ana Evren Gizemi',
  major: 'Ana Kurgu Düğümü',
  minor: 'Alt Kurgu / Karakter Sırrı',
  side_mystery: 'Yan Gizem / Detay',
};

// ─────────────────────────────────────────────────────────────────
// Okuma Ekranı Metin İçi Akıllı Lore Dipnotları (PRD Bölüm 40, 41)
// ─────────────────────────────────────────────────────────────────

export type InlineEntityType = 
  | 'character' 
  | 'location' 
  | 'glossary' 
  | 'item' 
  | 'creature' 
  | 'culture' 
  | 'organization';

export interface InlineUniverseEntity {
  id: string;
  name: string;
  type: InlineEntityType;
  roleOrType?: string;
  shortDescription?: string;
  avatarUrl?: string;
  isSpoiler?: boolean;
  spoilerChapterOrder?: number;
  universeId: string;
}

// ─────────────────────────────────────────────────────────────────
// Çoklu Yazar & Rol Bazlı İzin Sistemi (PRD Bölüm 32, 66)
// ─────────────────────────────────────────────────────────────────

export type UniverseMemberRole = 
  | 'owner' 
  | 'co_author' 
  | 'lore_master' 
  | 'illustrator' 
  | 'viewer';

export interface UniverseMember {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: UniverseMemberRole;
  addedAt?: Timestamp | string | any;
}

export const UNIVERSE_MEMBER_ROLE_CONFIG: Record<
  UniverseMemberRole | 'none', 
  { label: string; description: string; color: string; bg: string; border: string }
> = {
  owner: {
    label: 'Evren Kurucusu',
    description: 'Evrenin mülkiyetine, tüm silme, ayar ve üye yönetimi haklarına sahiptir.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  co_author: {
    label: 'Ortak Yazar',
    description: 'Eser ve serileri bağlayabilir; karakter, mekân ve bölüm kurgusu ekleyip düzenleyebilir.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  lore_master: {
    label: 'Lore Master (Evren Bekçisi)',
    description: 'Canon kuralları, sözlük, mitoloji, yaratıklar, harita ve zaman çizelgesini yönetir.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  illustrator: {
    label: 'Çizer & Görsel Sanatçı',
    description: 'Harita işaretçileri, PNG vitrini, görsel arşiv ve medya galerisini yönetir.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  viewer: {
    label: 'Ekip Gözlemcisi',
    description: 'Ekip içi taslakları, gizli notları ve henüz yayınlanmamış evren defterini okuyabilir.',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
  none: {
    label: 'Ziyaretçi',
    description: 'Evrende kayıtlı bir üyeliği bulunmuyor.',
    color: 'text-muted',
    bg: 'bg-muted/10',
    border: 'border-border/30',
  },
};

/**
 * Kullanıcının verilen evrendeki rolünü tespit eder
 */
export function getUserUniverseRole(
  universe?: Universe | null, 
  userId?: string | null
): UniverseMemberRole | 'none' {
  if (!universe || !userId) return 'none';
  if (universe.authorId === userId) return 'owner';
  
  if (universe.members && universe.members.length > 0) {
    const member = universe.members.find((m) => m.userId === userId);
    if (member) return member.role;
  }
  
  return 'none';
}

/**
 * Kullanıcının evren üyelerini yönetme yetkisini kontrol eder (Sadece kurucu)
 */
export function canManageUniverseMembers(
  target: Universe | UniverseMemberRole | 'none' | null | undefined,
  userId?: string | null
): boolean {
  const role = typeof target === 'string' ? target : getUserUniverseRole(target, userId);
  return role === 'owner';
}

/**
 * Kullanıcının genel evren lore'unu düzenleme yetkisini kontrol eder
 */
export function canEditUniverseLore(
  target: Universe | UniverseMemberRole | 'none' | null | undefined,
  userId?: string | null
): boolean {
  const role = typeof target === 'string' ? target : getUserUniverseRole(target, userId);
  return role === 'owner' || role === 'co_author' || role === 'lore_master';
}

/**
 * Kullanıcının eser bağlama ve kurgu düğümü düzenleme yetkisini kontrol eder
 */
export function canManageUniverseStories(
  target: Universe | UniverseMemberRole | 'none' | null | undefined,
  userId?: string | null
): boolean {
  const role = typeof target === 'string' ? target : getUserUniverseRole(target, userId);
  return role === 'owner' || role === 'co_author';
}

/**
 * Kullanıcının medya ve harita yönetme yetkisini kontrol eder
 */
export function canManageUniverseMedia(
  target: Universe | UniverseMemberRole | 'none' | null | undefined,
  userId?: string | null
): boolean {
  const role = typeof target === 'string' ? target : getUserUniverseRole(target, userId);
  return (
    role === 'owner' ||
    role === 'co_author' ||
    role === 'lore_master' ||
    role === 'illustrator'
  );
}



