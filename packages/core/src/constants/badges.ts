import { 
  Flame, 
  Keyboard, 
  Moon, 
  PenTool, 
  Wand2, 
  Theater, 
  Layers, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  CornerDownRight, 
  BookOpen, 
  Library, 
  Clock, 
  Star, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Calendar,
  Award,
  Feather,
  Zap,
  Globe,
  Scroll,
  GitFork,
  RotateCcw,
  Compass,
  Eye,
  Music,
  Headphones,
  Quote,
  TrendingUp,
  FolderHeart,
  Shield,
  Sun,
  Trophy,
  Crown,
  Sparkles,
  Newspaper,
  Workflow
} from 'lucide-react';
import type { UserAchievements } from '../types';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'special';
export type BadgeCategory = 'writer_production' | 'writer_publishing' | 'reader_consumption' | 'reader_interaction';

export interface BadgeConfig {
  id: string;
  title: string;
  description: string;
  icon: any; // Lucide icon component
  tier: BadgeTier;
  category: BadgeCategory;
  conditionDescription: string;
  maxProgress?: number;
  progressMetric?: string;
}

export const BADGE_CATEGORIES: { id: BadgeCategory; label: string }[] = [
  { id: 'writer_production', label: 'Yazar: Üretim' },
  { id: 'writer_publishing', label: 'Yazar: Yayıncılık' },
  { id: 'reader_consumption', label: 'Okur: Keşif' },
  { id: 'reader_interaction', label: 'Topluluk & Sadakat' },
];

export const BADGES: Record<string, BadgeConfig> = {
  // ─────────────────────────────────────────────
  // 1. Üretim ve İstikrar (Yazarlar İçin)
  // ─────────────────────────────────────────────
  first_spark: {
    id: 'first_spark',
    title: 'İlk Kıvılcım',
    description: 'Yazarlık serüvenindeki ilk adımı attın.',
    icon: Flame,
    tier: 'special',
    category: 'writer_production',
    conditionDescription: 'Editörde ilk 500 kelimeyi yazma.',
    maxProgress: 500,
    progressMetric: 'kelime',
  },
  keyboard_breaker_bronze: {
    id: 'keyboard_breaker_bronze',
    title: 'Klavye Aşındıran (Bronz)',
    description: 'Kelimeler parmaklarından dökülüyor.',
    icon: Keyboard,
    tier: 'bronze',
    category: 'writer_production',
    conditionDescription: 'Editörde toplam 10.000 kelimeye ulaşma.',
    maxProgress: 10000,
    progressMetric: 'kelime',
  },
  keyboard_breaker_silver: {
    id: 'keyboard_breaker_silver',
    title: 'Klavye Aşındıran (Gümüş)',
    description: 'Artık klavyen senin bir parçan oldu.',
    icon: Keyboard,
    tier: 'silver',
    category: 'writer_production',
    conditionDescription: 'Editörde toplam 50.000 kelimeye ulaşma.',
    maxProgress: 50000,
    progressMetric: 'kelime',
  },
  keyboard_breaker_gold: {
    id: 'keyboard_breaker_gold',
    title: 'Klavye Aşındıran (Altın)',
    description: 'Roman ustası kıvamına geldin.',
    icon: Keyboard,
    tier: 'gold',
    category: 'writer_production',
    conditionDescription: 'Editörde toplam 100.000 kelimeye ulaşma.',
    maxProgress: 100000,
    progressMetric: 'kelime',
  },
  million_words_author: {
    id: 'million_words_author',
    title: 'Milyoner Kalem',
    description: 'Bir edebiyat anıtı: Platformda toplamda tam 500.000 kelimeye ulaştın!',
    icon: Crown,
    tier: 'diamond',
    category: 'writer_production',
    conditionDescription: 'Editörde toplam 500.000 kelimeye ulaşma.',
    maxProgress: 500000,
    progressMetric: 'kelime',
  },
  night_shift_writer: {
    id: 'night_shift_writer',
    title: 'Gece Mesaisi',
    description: 'Gece herkes uyurken sen dünyalar yaratıyorsun.',
    icon: Moon,
    tier: 'silver',
    category: 'writer_production',
    conditionDescription: 'Gece 00:00 ile 04:00 saatleri arasında editörde yazı yazma.',
    maxProgress: 1,
    progressMetric: 'seans',
  },
  steady_pen_3: {
    id: 'steady_pen_3',
    title: 'İstikrarlı Kalem (3 Gün)',
    description: 'Alışkanlıklar 3 günde başlar.',
    icon: PenTool,
    tier: 'bronze',
    category: 'writer_production',
    conditionDescription: 'Peş peşe 3 gün boyunca her gün en az 300 kelime yazma.',
    maxProgress: 3,
    progressMetric: 'gün',
  },
  steady_pen_7: {
    id: 'steady_pen_7',
    title: 'İstikrarlı Kalem (7 Gün)',
    description: 'Sarsılmaz bir yazma ritmi tutturdun.',
    icon: PenTool,
    tier: 'silver',
    category: 'writer_production',
    conditionDescription: 'Peş peşe 7 gün boyunca her gün en az 300 kelime yazma.',
    maxProgress: 7,
    progressMetric: 'gün',
  },
  steady_pen_30: {
    id: 'steady_pen_30',
    title: 'İstikrarlı Kalem (30 Gün)',
    description: 'Sen gerçek bir yazarsın.',
    icon: PenTool,
    tier: 'gold',
    category: 'writer_production',
    conditionDescription: 'Peş peşe 30 gün boyunca her gün en az 300 kelime yazma.',
    maxProgress: 30,
    progressMetric: 'gün',
  },
  magic_touch: {
    id: 'magic_touch',
    title: 'Sihirli Dokunuş',
    description: 'Dış dünyadaki kelimelerini platforma taşıdın.',
    icon: Wand2,
    tier: 'bronze',
    category: 'writer_production',
    conditionDescription: 'Dışarıdan bir Word belgesini veya metni sisteme aktarma.',
    maxProgress: 1,
    progressMetric: 'belge',
  },
  universe_architect: {
    id: 'universe_architect',
    title: 'Evren Mimarı',
    description: 'Readixon\'da çoklu hikayelere ev sahipliği yapan devasa bir evren kurdun.',
    icon: Globe,
    tier: 'gold',
    category: 'writer_production',
    conditionDescription: 'En az 1 adet Evren (Universe) oluşturup içine en az 2 hikaye bağlama.',
    maxProgress: 2,
    progressMetric: 'hikaye',
  },
  character_alchemist: {
    id: 'character_alchemist',
    title: 'Karakter Simyacısı',
    description: 'Karakterlerin arasında derin bağlar ve çatışmalar ördün.',
    icon: Workflow,
    tier: 'silver',
    category: 'writer_production',
    conditionDescription: 'Bir evrene en az 5 detaylı karakter ekleyip ilişki ağı tanımlama.',
    maxProgress: 5,
    progressMetric: 'karakter',
  },
  codex_master: {
    id: 'codex_master',
    title: 'Ansiklopedist',
    description: 'Yarattığın dünyanın tarihini, terimlerini ve kültürünü kaydettin.',
    icon: Scroll,
    tier: 'bronze',
    category: 'writer_production',
    conditionDescription: 'Evrenin Codex sayfasına en az 10 adet terim, yer veya fraksiyon maddesi ekleme.',
    maxProgress: 10,
    progressMetric: 'madde',
  },
  soundtrack_maestro: {
    id: 'soundtrack_maestro',
    title: 'Melodi Ustası',
    description: 'Hikayeni sadece okunan değil, dinlenen ve hissedilen bir atmosfere dönüştürdün.',
    icon: Music,
    tier: 'bronze',
    category: 'writer_production',
    conditionDescription: 'Bölümlerine müzik/ambiyans (Audio Track) ekleyerek yayınlama.',
    maxProgress: 1,
    progressMetric: 'bölüm',
  },

  // ─────────────────────────────────────────────
  // 2. Yayınlama ve Kilometre Taşları (Yazarlar İçin)
  // ─────────────────────────────────────────────
  stage_dust: {
    id: 'stage_dust',
    title: 'Sahne Tozu',
    description: 'İlk eserini okurlarla buluşturdun.',
    icon: Theater,
    tier: 'special',
    category: 'writer_publishing',
    conditionDescription: 'Platformda ilk bölümü herkese açık olarak yayınlama.',
    maxProgress: 1,
    progressMetric: 'bölüm',
  },
  serial_producer_10: {
    id: 'serial_producer_10',
    title: 'Seri Üretici (10)',
    description: 'Hikayen şekillenmeye başladı.',
    icon: Layers,
    tier: 'bronze',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayede 10. bölüme ulaşma.',
    maxProgress: 10,
    progressMetric: 'bölüm',
  },
  serial_producer_20: {
    id: 'serial_producer_20',
    title: 'Seri Üretici (20)',
    description: 'İstikrarlı bir şekilde ilerliyorsun.',
    icon: Layers,
    tier: 'bronze',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayede 20. bölüme ulaşma.',
    maxProgress: 20,
    progressMetric: 'bölüm',
  },
  serial_producer_30: {
    id: 'serial_producer_30',
    title: 'Seri Üretici (30)',
    description: 'Kurgun derinleşiyor.',
    icon: Layers,
    tier: 'silver',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayede 30. bölüme ulaşma.',
    maxProgress: 30,
    progressMetric: 'bölüm',
  },
  serial_producer_40: {
    id: 'serial_producer_40',
    title: 'Seri Üretici (40)',
    description: 'Kusursuz bir ritim.',
    icon: Layers,
    tier: 'silver',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayede 40. bölüme ulaşma.',
    maxProgress: 40,
    progressMetric: 'bölüm',
  },
  serial_producer_50: {
    id: 'serial_producer_50',
    title: 'Seri Üretici (50)',
    description: 'Devasa bir destan yazıyorsun.',
    icon: Layers,
    tier: 'gold',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayede 50. bölüme ulaşma.',
    maxProgress: 50,
    progressMetric: 'bölüm',
  },
  finalist: {
    id: 'finalist',
    title: 'Finalist',
    description: 'Her güzel şeyin bir sonu vardır. İlk serini bitirdin.',
    icon: CheckCircle2,
    tier: 'gold',
    category: 'writer_publishing',
    conditionDescription: 'Platformda ilk kez bir hikayenin durumunu "Tamamlandı" olarak işaretleme.',
    maxProgress: 1,
    progressMetric: 'hikaye',
  },
  first_crowd_100: {
    id: 'first_crowd_100',
    title: 'İlk Kalabalık (100)',
    description: 'Eserin 100 farklı okura ulaştı.',
    icon: Users,
    tier: 'bronze',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayenin 100 tekil okumaya ulaşması.',
    maxProgress: 100,
    progressMetric: 'okuma',
  },
  first_crowd_1000: {
    id: 'first_crowd_1000',
    title: 'İlk Kalabalık (1000)',
    description: 'Eserin dev bir kitleye ulaştı.',
    icon: Users,
    tier: 'gold',
    category: 'writer_publishing',
    conditionDescription: 'Bir hikayenin 1.000 tekil okumaya ulaşması.',
    maxProgress: 1000,
    progressMetric: 'okuma',
  },
  controversial: {
    id: 'controversial',
    title: 'Tartışma Yaratan',
    description: 'Yazdıkların insanları konuşturuyor.',
    icon: MessageSquare,
    tier: 'silver',
    category: 'writer_publishing',
    conditionDescription: 'Yayınlanan tek bir bölümün 20\'den fazla yorum alması.',
    maxProgress: 20,
    progressMetric: 'yorum',
  },
  silver_tongue: {
    id: 'silver_tongue',
    title: 'Söz Gümüşse',
    description: 'Okurlarınla arandaki bağ çok güçlü.',
    icon: CornerDownRight,
    tier: 'silver',
    category: 'writer_publishing',
    conditionDescription: 'Okuyucularından gelen yorumlara 50 kez yanıt verme.',
    maxProgress: 50,
    progressMetric: 'yanıt',
  },
  short_story_debut: {
    id: 'short_story_debut',
    title: 'Kısa & Vurucu',
    description: 'İlk tek bölümlük kısa hikayeni başarıyla okurlarla buluşturdun.',
    icon: Feather,
    tier: 'bronze',
    category: 'writer_publishing',
    conditionDescription: 'Platformda en az 1 adet kısa hikaye yayınlama.',
    maxProgress: 1,
    progressMetric: 'öykü',
  },
  short_story_master: {
    id: 'short_story_master',
    title: 'Kısa Kurgu Ustası',
    description: 'Az kelimeyle derin dünyalar kurma sanatında ustalaştın.',
    icon: Award,
    tier: 'silver',
    category: 'writer_publishing',
    conditionDescription: 'En az 3 farklı kısa hikaye yayınlama.',
    maxProgress: 3,
    progressMetric: 'öykü',
  },
  webtoonist: {
    id: 'webtoonist',
    title: 'Çizgi Romancı',
    description: 'Kelimeleri görsellerle harmanlayıp platformda Webtoon formatında eser yayınladın.',
    icon: Layers,
    tier: 'bronze',
    category: 'writer_publishing',
    conditionDescription: 'Platformda en az 1 adet Webtoon formatında eser yayınlama.',
    maxProgress: 1,
    progressMetric: 'eser',
  },
  labyrinth_master: {
    id: 'labyrinth_master',
    title: 'Labirent Ustası',
    description: 'Okurları büyüleyen çok dallı, devasa bir interaktif kurgu yarattın.',
    icon: Compass,
    tier: 'gold',
    category: 'writer_publishing',
    conditionDescription: 'En az 5 farklı kararı ve en az 3 farklı sonu olan interaktif bir hikaye yayınlama.',
    maxProgress: 3,
    progressMetric: 'son',
  },
  editorial_pen: {
    id: 'editorial_pen',
    title: 'Günün Kalemi',
    description: 'Edebi birikimini ve derin fikirlerini köşe yazısıyla okurlara aktardın.',
    icon: Newspaper,
    tier: 'special',
    category: 'writer_publishing',
    conditionDescription: 'Gündem & Köşe Yazıları kategorisinde en az 1 köşe yazısı yayınlama.',
    maxProgress: 1,
    progressMetric: 'yazı',
  },

  // ─────────────────────────────────────────────
  // 3. Tüketim ve Keşif (Okurlar İçin)
  // ─────────────────────────────────────────────
  first_page: {
    id: 'first_page',
    title: 'İlk Sayfa',
    description: 'Readixon dünyasına ilk adım.',
    icon: BookOpen,
    tier: 'special',
    category: 'reader_consumption',
    conditionDescription: 'Bir hikayenin ilk bölümünü sonuna kadar okuma.',
    maxProgress: 1,
    progressMetric: 'bölüm',
  },
  bookworm_1: {
    id: 'bookworm_1',
    title: 'Kitap Kurdu (Seviye 1)',
    description: 'Sayfalar arasında kaybolmaya başladın.',
    icon: BookOpen,
    tier: 'bronze',
    category: 'reader_consumption',
    conditionDescription: 'Toplamda 10 farklı bölüm okuma.',
    maxProgress: 10,
    progressMetric: 'bölüm',
  },
  bookworm_2: {
    id: 'bookworm_2',
    title: 'Kitap Kurdu (Seviye 2)',
    description: 'Okumak senin için bir yaşam tarzı.',
    icon: BookOpen,
    tier: 'silver',
    category: 'reader_consumption',
    conditionDescription: 'Toplamda 50 farklı bölüm okuma.',
    maxProgress: 50,
    progressMetric: 'bölüm',
  },
  bookworm_3: {
    id: 'bookworm_3',
    title: 'Kitap Kurdu (Seviye 3)',
    description: 'Platformun en saygın okurlarından biri oldun.',
    icon: BookOpen,
    tier: 'gold',
    category: 'reader_consumption',
    conditionDescription: 'Toplamda 100 farklı bölüm okuma.',
    maxProgress: 100,
    progressMetric: 'bölüm',
  },
  binge_reader: {
    id: 'binge_reader',
    title: 'Maratoncu',
    description: 'Sürükleyici kurgudan kopamıyorsun.',
    icon: Star,
    tier: 'silver',
    category: 'reader_consumption',
    conditionDescription: 'Aynı hikayenin peş peşe en az 5 bölümünü okuma.',
    maxProgress: 5,
    progressMetric: 'bölüm',
  },
  librarian: {
    id: 'librarian',
    title: 'Kütüphaneci',
    description: 'Kişisel kütüphanen giderek büyüyor.',
    icon: Library,
    tier: 'bronze',
    category: 'reader_consumption',
    conditionDescription: 'Okuma listesine veya kütüphanesine 10 farklı hikaye ekleme.',
    maxProgress: 10,
    progressMetric: 'hikaye',
  },
  night_watch: {
    id: 'night_watch',
    title: 'Gece Nöbeti',
    description: 'Gerçek okurlar geceleri yaşar.',
    icon: Clock,
    tier: 'silver',
    category: 'reader_consumption',
    conditionDescription: 'Gece 00:00 ile 04:00 saatleri arasında en az 3 bölüm okuma.',
    maxProgress: 3,
    progressMetric: 'bölüm',
  },
  early_bird: {
    id: 'early_bird',
    title: 'Günün İlk Işığı',
    description: 'Güne kelimelerle başladın; sabahın sessizliğinde kitap okudun.',
    icon: Sun,
    tier: 'bronze',
    category: 'reader_consumption',
    conditionDescription: 'Sabah 05:00 - 08:00 saatleri arasında en az 2 bölüm okuma.',
    maxProgress: 2,
    progressMetric: 'bölüm',
  },
  short_story_reader_1: {
    id: 'short_story_reader_1',
    title: 'Tek Nefeste',
    description: 'İlk kısa hikayeyi tek bir oturuşta baştan sona bitirdin.',
    icon: Zap,
    tier: 'bronze',
    category: 'reader_consumption',
    conditionDescription: '1 kısa hikayeyi sonuna kadar okuma.',
    maxProgress: 1,
    progressMetric: 'öykü',
  },
  short_story_collector: {
    id: 'short_story_collector',
    title: 'Öykü Koleksiyoneri',
    description: 'Hızlı ve vurucu kurguların tadını çıkarıyorsun.',
    icon: Star,
    tier: 'silver',
    category: 'reader_consumption',
    conditionDescription: 'En az 5 farklı kısa hikayeyi tamamlayarak okuma.',
    maxProgress: 5,
    progressMetric: 'öykü',
  },
  fate_weaver: {
    id: 'fate_weaver',
    title: 'Kader Çizen',
    description: 'Karakterin kaderini kendi ellerinle belirledin.',
    icon: GitFork,
    tier: 'bronze',
    category: 'reader_consumption',
    conditionDescription: 'İnteraktif bir hikayede ilk kez bir seçim yaparak farklı bir yola geçme.',
    maxProgress: 1,
    progressMetric: 'seçim',
  },
  butterfly_effect: {
    id: 'butterfly_effect',
    title: 'Kelebek Etkisi',
    description: 'Zamanın ve seçimlerin tüm olasılıklarına tanık oldun.',
    icon: Sparkles,
    tier: 'gold',
    category: 'reader_consumption',
    conditionDescription: 'Bir interaktif hikayedeki en az 3 farklı sonu keşfetme.',
    maxProgress: 3,
    progressMetric: 'son',
  },
  time_traveler: {
    id: 'time_traveler',
    title: 'Zaman Yolcusu',
    description: 'Aynı hikayede farklı bir kaderi yaşamak için geçmişe döndün.',
    icon: RotateCcw,
    tier: 'silver',
    category: 'reader_consumption',
    conditionDescription: 'Bir interaktif hikayede geri dönerek en az 2 farklı yolu deneyimleme.',
    maxProgress: 2,
    progressMetric: 'yol',
  },
  panel_hunter: {
    id: 'panel_hunter',
    title: 'Kare Avcısı',
    description: 'Görsel anlatımın büyüleyici dünyasında kayboldun.',
    icon: Eye,
    tier: 'silver',
    category: 'reader_consumption',
    conditionDescription: 'Toplamda 25 farklı Webtoon bölümü okuma.',
    maxProgress: 25,
    progressMetric: 'bölüm',
  },
  rhythm_reader: {
    id: 'rhythm_reader',
    title: 'Ritimle Okuyan',
    description: 'Müziğin ritmiyle kelimelerin ahengini birleştirdin.',
    icon: Headphones,
    tier: 'bronze',
    category: 'reader_consumption',
    conditionDescription: 'Arka plan müziği olan en az 5 bölümü tamamlayarak okuma.',
    maxProgress: 5,
    progressMetric: 'bölüm',
  },

  // ─────────────────────────────────────────────
  // 4. Etkileşim ve Sadakat (Okurlar İçin)
  // ─────────────────────────────────────────────
  first_voice: {
    id: 'first_voice',
    title: 'İlk Ses',
    description: 'Bölümü ilk sen okudun ve ilk sen yorumladın.',
    icon: MessageCircle,
    tier: 'special',
    category: 'reader_interaction',
    conditionDescription: 'Yeni yayınlanan bir bölüme ilk yorumu atan kişi olma.',
    maxProgress: 1,
    progressMetric: 'yorum',
  },
  critic: {
    id: 'critic',
    title: 'Eleştirmen',
    description: 'Yazarlara değer katan düşüncelerin var.',
    icon: MessageSquare,
    tier: 'silver',
    category: 'reader_interaction',
    conditionDescription: 'Farklı hikayelere toplamda 50 yapıcı yorum bırakma.',
    maxProgress: 50,
    progressMetric: 'yorum',
  },
  generous_reader: {
    id: 'generous_reader',
    title: 'Cömert Okur',
    description: 'Emeğe saygın sonsuz, desteklerini esirgemiyorsun.',
    icon: Heart,
    tier: 'gold',
    category: 'reader_interaction',
    conditionDescription: 'Okuduğu bölümlere toplamda 100 kez beğeni/oy verme.',
    maxProgress: 100,
    progressMetric: 'beğeni',
  },
  authors_favorite: {
    id: 'authors_favorite',
    title: 'Yazarın Gözdesi',
    description: 'Yazar senin yorumunu özel buldu.',
    icon: UserPlus,
    tier: 'diamond',
    category: 'reader_interaction',
    conditionDescription: 'Yaptığı bir yorumun bölümün yazarı tarafından beğenilmesi veya yanıtlanması.',
    maxProgress: 1,
    progressMetric: 'etkileşim',
  },
  addicted: {
    id: 'addicted',
    title: 'Müptela',
    description: 'Readixon artık günlük rutinin.',
    icon: Calendar,
    tier: 'silver',
    category: 'reader_interaction',
    conditionDescription: 'Peş peşe 7 gün boyunca her gün en az 1 bölüm okuma.',
    maxProgress: 7,
    progressMetric: 'gün',
  },
  readixon_veteran: {
    id: 'readixon_veteran',
    title: 'Readixon Gediklisi',
    description: 'Platformun demirbaşı oldun.',
    icon: Award,
    tier: 'gold',
    category: 'reader_interaction',
    conditionDescription: '30 günlük kesintisiz okuma serisine ulaşma.',
    maxProgress: 30,
    progressMetric: 'gün',
  },
  century_streak: {
    id: 'century_streak',
    title: 'Maraton Canavarı',
    description: 'Sarsılmaz irade: Tam 100 gün boyunca kesintisiz her gün okuma serisi!',
    icon: Trophy,
    tier: 'diamond',
    category: 'reader_interaction',
    conditionDescription: '100 günlük kesintisiz okuma serisine (streak) ulaşma.',
    maxProgress: 100,
    progressMetric: 'gün',
  },
  quote_hunter: {
    id: 'quote_hunter',
    title: 'Alıntı Ustası',
    description: 'Etkileyici cümleleri yakalayıp Readix akışında toplulukla paylaştın.',
    icon: Quote,
    tier: 'silver',
    category: 'reader_interaction',
    conditionDescription: 'Kitap okurken satır arasından en az 10 alıntıyı Readix veya kaydedilenlere aktarma.',
    maxProgress: 10,
    progressMetric: 'alıntı',
  },
  viral_voice: {
    id: 'viral_voice',
    title: 'Trend Yaratan',
    description: 'Düşüncelerin toplulukta yankı buldu ve büyük etkileşim aldı.',
    icon: TrendingUp,
    tier: 'gold',
    category: 'reader_interaction',
    conditionDescription: 'Paylaştığın bir Readix gönderisinin en az 25 beğeni veya yanıt alması.',
    maxProgress: 25,
    progressMetric: 'etkileşim',
  },
  master_curator: {
    id: 'master_curator',
    title: 'Usta Küratör',
    description: 'Hazırladığın okuma listeleri diğer okurlara rehber oldu.',
    icon: FolderHeart,
    tier: 'silver',
    category: 'reader_interaction',
    conditionDescription: 'Oluşturduğun bir Okuma Listesinin en az 10 kez kaydedilmesi veya beğenilmesi.',
    maxProgress: 10,
    progressMetric: 'beğeni',
  },
  club_leader: {
    id: 'club_leader',
    title: 'Kulüp Lideri',
    description: 'Edebiyat severleri bir araya toplayıp canlı bir kitap kulübü kurdun.',
    icon: Shield,
    tier: 'gold',
    category: 'reader_interaction',
    conditionDescription: 'Bir Kitap Kulübü kurup en az 5 üyeye ulaşmak.',
    maxProgress: 5,
    progressMetric: 'üye',
  },
  campfire_chat: {
    id: 'campfire_chat',
    title: 'Ateş Başı Sohbeti',
    description: 'Kulüp kanallarında fikirlerini paylaşarak tartışmaları zenginleştirdin.',
    icon: Flame,
    tier: 'bronze',
    category: 'reader_interaction',
    conditionDescription: 'Kitap Kulübü kanallarında veya tartışmalarında en az 20 mesaj paylaşmak.',
    maxProgress: 20,
    progressMetric: 'mesaj',
  },
  master_critic: {
    id: 'master_critic',
    title: 'Yıldız Avcısı',
    description: 'Hikayeleri derinlemesine tahlil edip yapıcı incelemeler yazdın.',
    icon: Star,
    tier: 'gold',
    category: 'reader_interaction',
    conditionDescription: 'Farklı hikayelere en az 5 adet detaylı inceleme (Review) bırakma.',
    maxProgress: 5,
    progressMetric: 'inceleme',
  },
};

/**
 * Kullanıcı başarımlarına göre ilgili rozetin ilerleme oranını ve sayısal değerini hesaplar.
 */
export function getBadgeProgress(
  badge: BadgeConfig, 
  achievements?: UserAchievements | null
): { current: number; max: number; percentage: number; label: string } {
  const max = badge.maxProgress || 1;
  const isUnlocked = achievements?.earnedBadges?.includes(badge.id) || false;
  
  if (isUnlocked) {
    return {
      current: max,
      max,
      percentage: 100,
      label: `${max.toLocaleString()} / ${max.toLocaleString()} ${badge.progressMetric || ''}`.trim(),
    };
  }

  if (!achievements) {
    return {
      current: 0,
      max,
      percentage: 0,
      label: `0 / ${max.toLocaleString()} ${badge.progressMetric || ''}`.trim(),
    };
  }

  let current = 0;

  switch (badge.id) {
    case 'first_spark':
    case 'keyboard_breaker_bronze':
    case 'keyboard_breaker_silver':
    case 'keyboard_breaker_gold':
    case 'million_words_author':
      current = achievements.totalWordsWritten || 0;
      break;
    case 'steady_pen_3':
    case 'steady_pen_7':
    case 'steady_pen_30':
      current = achievements.consecutiveWriteDays || 0;
      break;
    case 'night_shift_writer':
      current = achievements.nightWritingHours || 0;
      break;
    case 'magic_touch':
      current = achievements.wordImports || 0;
      break;
    case 'universe_architect':
      current = achievements.universesCreated || 0;
      break;
    case 'character_alchemist':
      current = achievements.charactersCreated || 0;
      break;
    case 'codex_master':
      current = achievements.codexEntriesCreated || 0;
      break;
    case 'soundtrack_maestro':
      current = achievements.soundtrackChaptersPublished || 0;
      break;
    case 'stage_dust':
      current = achievements.publishedChapters || 0;
      break;
    case 'serial_producer_10':
    case 'serial_producer_20':
    case 'serial_producer_30':
    case 'serial_producer_40':
    case 'serial_producer_50':
      current = achievements.maxChaptersInStory || achievements.publishedChapters || 0;
      break;
    case 'finalist':
      current = achievements.completedStories || 0;
      break;
    case 'short_story_debut':
    case 'short_story_master':
      current = achievements.publishedShortStories || 0;
      break;
    case 'webtoonist':
      current = achievements.publishedWebtoons || 0;
      break;
    case 'labyrinth_master':
      current = achievements.maxInteractiveEndingsInStory || 0;
      break;
    case 'editorial_pen':
      current = achievements.publishedColumns || 0;
      break;
    case 'first_page':
    case 'bookworm_1':
    case 'bookworm_2':
    case 'bookworm_3':
      current = achievements.chaptersRead || 0;
      break;
    case 'binge_reader':
      current = achievements.bingeMaxCount || 0;
      break;
    case 'librarian':
      current = achievements.storiesInLibrary || 0;
      break;
    case 'night_watch':
      current = achievements.nightChaptersRead || 0;
      break;
    case 'early_bird':
      current = achievements.morningChaptersRead || 0;
      break;
    case 'short_story_reader_1':
    case 'short_story_collector':
      current = achievements.shortStoriesRead || 0;
      break;
    case 'fate_weaver':
      current = achievements.interactiveChoicesMade || 0;
      break;
    case 'butterfly_effect':
      current = achievements.interactiveEndingsFound || 0;
      break;
    case 'time_traveler':
      current = (achievements.interactiveRewindsMade || 0) > 0 
        ? Math.max(achievements.interactiveRewindsMade || 0, 2) 
        : Math.min(achievements.interactiveChoicesMade || 0, 2);
      break;
    case 'panel_hunter':
      current = achievements.webtoonChaptersRead || 0;
      break;
    case 'rhythm_reader':
      current = achievements.audioChaptersRead || 0;
      break;
    case 'critic':
      current = achievements.commentsGiven || 0;
      break;
    case 'generous_reader':
      current = achievements.likesGiven || 0;
      break;
    case 'silver_tongue':
      current = achievements.commentsReplied || 0;
      break;
    case 'addicted':
    case 'readixon_veteran':
    case 'century_streak':
      current = achievements.consecutiveReadDays || 0;
      break;
    case 'quote_hunter':
      current = achievements.quotesShared || 0;
      break;
    case 'master_curator':
      current = achievements.curatedListLikes || 0;
      break;
    case 'club_leader':
      current = achievements.maxClubMembers || (achievements.clubsOwned ? 1 : 0);
      break;
    case 'campfire_chat':
      current = achievements.clubMessagesSent || 0;
      break;
    case 'master_critic':
      current = achievements.reviewsGiven || 0;
      break;
    default:
      current = 0;
  }

  const cappedCurrent = Math.min(current, max);
  const percentage = Math.min(100, Math.max(0, Math.round((cappedCurrent / max) * 100)));

  return {
    current: cappedCurrent,
    max,
    percentage,
    label: `${cappedCurrent.toLocaleString()} / ${max.toLocaleString()} ${badge.progressMetric || ''}`.trim(),
  };
}
