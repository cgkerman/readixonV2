"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Swords,
  Shield,
  LayoutDashboard,
  Award,
  Zap,
  Volume2,
  VolumeX,
  Palette,
  MessageCircle,
  Quote,
  FileText,
  AlertCircle,
  Building2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Layers,
  Wand2,
  Feather,
  Flame,
  Star,
  Compass,
  ArrowRight,
  Users,
  Sliders,
  Sparkle,
  LifeBuoy,
  HelpCircle,
  Clock,
  TrendingUp,
  GitCommit,
  GraduationCap,
  DollarSign,
  Globe,
  Lock,
  Headphones,
  FileCheck,
  Send,
  EyeOff,
  Gamepad2,
  Scale,
  PenTool
} from 'lucide-react';
import { Typography } from '@readixon/ui';
import { toast } from 'sonner';
import './AboutPage.css';

// ── Interactive Lab Tab Definitions ──
type LabTabId = 'reader' | 'universe' | 'arena' | 'rpg' | 'studio' | 'editorial' | 'webtoon';

interface LabTab {
  id: LabTabId;
  label: string;
  tag: string;
  icon: React.ElementType;
  badge: string;
  heroTitle: string;
  heroDesc: string;
}

const LAB_TABS: LabTab[] = [
  {
    id: 'universe',
    label: 'Universe & Lorebook 2.0',
    tag: 'Öncü Mimari',
    icon: Compass,
    badge: 'Spoiler-Safe Evren Defteri',
    heroTitle: 'Yaşayan Dünyalar',
    heroDesc: 'Karakterler, mekanlar, fraksiyonlar ve zaman çizelgeleri; okurun bulunduğu bölüme göre spoiler kontrollü açılır.',
  },
  {
    id: 'reader',
    label: 'Akıllı Okuyucu & Ambiyans',
    tag: 'Ses & Atmosfer',
    icon: Volume2,
    badge: 'Atmosferik Okuma Motoru',
    heroTitle: 'Kelimelerin Müziği',
    heroDesc: 'Hikayeye ve sahneye özel fon müzikleri ve 7 farklı göz dostu temayla kitapların içine adım atın.',
  },
  {
    id: 'arena',
    label: 'Edebi Arena & Curveball',
    tag: 'Oyunlaştırılmış',
    icon: Swords,
    badge: 'Canlı Edebi Rekabet',
    heroTitle: 'Kelimelerin Meydanı',
    heroDesc: 'Zaman kısıtlı odalarda kör oylamayla yarışın, sürpriz kırılma kurallarıyla sınırları zorlayın.',
  },
  {
    id: 'rpg',
    label: 'RPG Karakter Motoru',
    tag: 'Özgün İnovasyon',
    icon: Shield,
    badge: 'Sayısal Karakter Derinliği',
    heroTitle: 'Yaşayan Karakterler',
    heroDesc: 'Karakterler sadece isim değil; Zeka, Güç ve Çeviklik gibi RPG statlarıyla evrilen figürlerdir.',
  },
  {
    id: 'studio',
    label: 'Yazarlık OS & Kurgu Sihirbazı',
    tag: 'Yazar Odaklı',
    icon: Wand2,
    badge: 'Profesyonel Yazarlık Stüdyosu',
    heroTitle: 'Kurgunun Mimarisi',
    heroDesc: 'Word/Docs aktarımı, bölünmüş ekran kurgu notları ve yapay zeka ilham asistanı tek çatı altında.',
  },
  {
    id: 'editorial',
    label: 'Editoryal İnceleme & Skor',
    tag: 'Kalite Güvencesi',
    icon: Award,
    badge: 'Edebi Kalite Değerlendirmesi',
    heroTitle: 'Kusursuz Başyapıtlar',
    heroDesc: 'Editör kurulu tarafından 10 üzerinden analitik puanlama ve yazara özel editoryal geri bildirim.',
  },
  {
    id: 'webtoon',
    label: 'Highlights & Readix Akışı',
    tag: 'Topluluk & Görsel',
    icon: Layers,
    badge: 'Sosyal Edebiyat & Hikaye Kesitleri',
    heroTitle: 'Görsel ve Sosyal Edebiyat',
    heroDesc: 'Instagram tarzı hikaye kesitleri (Highlights), şık alıntı üretici ve dikey Webtoon okuma desteği.',
  },
];

// ── Timeline Changelog Entries ──
interface TimelineItem {
  version: string;
  badge: string;
  date: string;
  title: string;
  desc: string;
  highlights: string[];
  icon: React.ElementType;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    version: 'v2.3.2',
    badge: 'En Son Güncelleme',
    date: '18 Ekim 2026',
    title: 'Word Serbest Yazı Modu & Yasal Sözleşme Yönetim Merkezi',
    desc: 'Bölüm editörüne kesintisiz roman yazımını sağlayan Word / Wattpad Serbest Yazı Modu, akıllı çift yönlü blok dönüştürücüsü ve platform geneli yasal sözleşmelerin canlı yönetildiği Admin Hukuk Merkezi tamamlandı.',
    highlights: [
      'Word / Wattpad Serbest Yazı Modu: Yazarların bloklarla uğraşmadan tek parça akıcı sayfada roman yazabileceği dikkat dağıtmayan serbest yazım ortamı',
      'Akıllı Blok Dönüştürücüsü (Word ↔ Blok): Serbest yazılan metinlerin tek tıkla paragraflara, başlıklara ve alıntılara ayrıştırılması veya mevcut blokların akıcı metne geri birleştirilmesi',
      'Word (.docx) Doğrudan İçe Aktarma: Bilgisayardaki Word belgelerinin biçimlendirmeleriyle birlikte tek tıkla editöre aktarılması',
      'Tam Ekran Zen / Odak Modu: Yazarların dış etkenlerden arınıp yalnızca kelimelerine odaklanabileceği daktilo odak ortamı',
      'Admin Yasal & Sözleşme Yönetim Merkezi (/admin/legal): Kullanım Koşulları, Gizlilik & KVKK, Telif Hakları ve Topluluk Kurallarını tek panelden yönetme',
      'Canlı Eşzamanlı Önizleme (Split View): Yasal sözleşmeleri düzenlerken sağ ekranda okuyucunun göreceği canlı sözleşme kartını anlık takip etme',
      'Sıfır Kesintili Hukuki Entegrasyon: /terms, /privacy, /copyright ve /guidelines sayfalarının Firestore veritabanıyla dinamik ve güvenli senkronizasyonu',
    ],
    icon: Scale,
  },
  {
    version: 'v2.3.1',
    badge: 'İnteraktif Hikayeler',
    date: '18 Ekim 2026',
    title: 'Kaderini Sen Seç: İnteraktif Hikayeler (CYOA) & Bölüm Revizyon Şeffaflığı',
    desc: 'Readixon çok kollu dallanan kurgu (Bandersnatch / CYOA) motoruna kavuştu! Okuyucu kararlarıyla şekillenen alternatif yollar, çoklu sonlar, son karara geri dönme (rewind) mekaniği, bölüm revizyon şeffaflığı ve satır arası yorum koruma mimarisi tamamlandı.',
    highlights: [
      'İnteraktif Hikayeler ("Kaderini Sen Seç"): Bölüm sonlarında okuyucunun kaderini belirleyen dallanma noktaları ve çoklu sonlar',
      'Bandersnatch Okuma Deneyimi & Rewind: Karar kartları, tematik son ekranları (Zafer, Trajik, Gizli, Nötr) ve "Son Karara Geri Dön" akışı',
      'Keşfedilen Sonlar Takibi: Kitap detay sayfasında kaç sonun keşfedildiğini gösteren koleksiyon ve ilerleme motoru',
      'Stüdyo Hızlı Dal Oluşturma: Yazarın bölüm düzenlerken sayfadan ayrılmadan tek tıkla yeni dal bölümleri üretip bağlayabilmesi',
      'Bölüm Revizyon & Şeffaflık Sistemi: Yazar güncellemelerinde "Düzenlendi" rozetleri, yazar revizyon notu ve okuyuculara anlık bildirimler',
      'Satır Arası Yorum Koruma: Bölüm güncellendiğinde kayan paragraflara ve eski metinlere ait yorumların "[ Önceki sürüme ait ]" şeklinde korunması',
      'Keşfet & Akış Vitrini: Ana sayfada "Kaderini Sen Seç: İnteraktif Hikayeler" özel vitrin bloğu',
    ],
    icon: Gamepad2,
  },
  {
    version: 'v2.3',
    badge: 'Tür & Tasarım Devrimi',
    date: '17 Ekim 2026',
    title: '30 Edebi Ana Tür, Akıllı Tür Keşif Motoru & Organik Koyu Mod',
    desc: 'Readixon Kurgu & Edebiyat Taksonomisi 30 ana türe ve alt tür ağacına genişletildi. Yazarlar için interaktif Akıllı Tür Keşif Motoru, mobil pull-to-refresh yenileme mekaniği ve platform genelinde sert beyaz çerçevelerden arındırılmış organik koyu mod mimarisi tamamlandı.',
    highlights: [
      '30 Edebi Ana Tür & Alt Türler: Keşfet, arama filtreleri ve hikaye stüdyosuna tam entegre zengin taksonomi',
      'Akıllı Tür Keşif Motoru (Genre Finder): 7 soruyla hikaye atmosferini analiz edip en uygun türleri yüzdelik oranla öneren yazar asistanı',
      'Eser Kartı Rozet Optimizasyonu: Kitap kapaklarını kapatmayan hover rozetler ve mobil uyumlu kompakt görünüm',
      'Mobil Pull-to-Refresh: Mobil web ve uygulamada akıcı dokunmatik ekran yenileme ve anlık veri senkronizasyonu',
      'Organik Koyu Mod Yüzey Mimarisi: Platform genelindeki yapay beyaz tel çerçevelerin kaldırılması ve gözü yormayan derinlikli arduvaz kenarlıklar',
    ],
    icon: Sliders,
  },
  {
    version: 'v2.2',
    badge: 'Hikâye & Mekan Devrimi',
    date: 'Ekim 2026',
    title: 'Story Highlights & Mekan Defteri 2.0',
    desc: 'Yazarların eserlerini Instagram Story tarzı müzikli kesitlerle tanıtmasını sağlayan Story Highlights sistemi, gelişmiş Mekan Defteri 2.0 ve 3D evren kartları yayına alındı.',
    highlights: [
      'Story Highlights: Bölüme müzikli görsel kesit ekleme & tam ekran oynatıcı',
      'Mekan Defteri 2.0: Görsel boyut rehberleri, 3D interaktif harita kartları',
      'Mobil Pull-to-refresh ve akıcı stüdyo dokunmatik kontrolleri',
    ],
    icon: Sparkles,
  },
  {
    version: 'v2.1',
    badge: 'Evren Devrimi',
    date: 'Eylül 2026',
    title: 'Evren Stüdyosu, Seri Kitaplar & Spoiler Drawer',
    desc: 'Okurların hikaye içinde karşılaştığı karakter ve mekanları spoiler yemeden keşfetmesini sağlayan Reader Universe Drawer ve Seri Kitaplar mimarisi tamamlandı.',
    highlights: [
      'Reader Universe Drawer: Bölüm sırasına duyarlı spoiler-safe yan panel',
      'Lore Annotation: Metin içi evren öğelerini tek tıkla vurgulama ve bağlama',
      'Seri Kitaplar & Evren Haritalama: Çoklu kitapları tek çatı evrende toplama',
    ],
    icon: Compass,
  },
  {
    version: 'v2.0',
    badge: 'Büyük Kilometre Taşı',
    date: 'Ağustos 2026',
    title: 'Yazar Akademisi & Co-Authoring (Ortak Üretim)',
    desc: 'Yazarlık yolculuğuna başlayanlar için Readixon Academy yayına girdi. Birden fazla yazarın aynı evrende ortaklaşa hikaye üretebilmesinin altyapısı kuruldu.',
    highlights: [
      'Readixon Academy (/studio/academy): Adım adım kurgu, diyalog ve evren dersleri',
      'Co-Authoring: Ortak yazar davet etme ve eş zamanlı evren geliştirme',
      'Mobil v1.9 Entegrasyonu ve uygulama içi doğrudan APK güncelleme mekanizması',
    ],
    icon: GraduationCap,
  },
  {
    version: 'v1.8',
    badge: 'Stüdyo Yenilemesi',
    date: 'Haziran 2026',
    title: 'Blok Editör 2.0, Word İçe Aktarma & Kurgu Sihirbazı',
    desc: 'Geleneksel kelime işlemcilerden sıkılan yazarlar için Word (.docx) aktarımlı, split-screen kurgu notları içeren gelişmiş blok editör hayata geçirildi.',
    highlights: [
      'Word (.docx) otomatik ayrıştırma: Başlık, paragraf ve diyalog blokları',
      'Bölünmüş Ekran (Split Screen): Kurgu notlarını yazarken aynı ekranda görme',
      'Otomatik bulut senkronizasyonu ve revizyon geçmişi',
    ],
    icon: Wand2,
  },
  {
    version: 'v1.5',
    badge: 'Oyunlaştırma',
    date: 'Nisan 2026',
    title: 'Edebi Arena, Kör Oylama & Curveball Mekaniği',
    desc: 'Yazar isimlerinin gizlendiği, yalnızca edebi yeteneğin yarıştığı canlı düellolar ve son 15 dakikada gelen sürpriz kural (Curveball) sistemi başlatıldı.',
    highlights: [
      'Kör Oylama: Yazar kimliği gizli, tamamen objektif okur puanlaması',
      'Curveball: Aniden beliren sürpriz kısıtlamalarla yaratıcılığı test etme',
      'RX Puanı ve dinamik edebi ödül havuzları',
    ],
    icon: Swords,
  },
  {
    version: 'v1.2',
    badge: 'Atmosfer & Karakter',
    date: 'Şubat 2026',
    title: 'Ambiyans Müzik Motoru & RPG Karakter İstatistikleri',
    desc: 'Kitap okuma deneyimi statik sayfalardan kurtarıldı; sahneye özel yağmur, şömine, fırtına sesleri ve karakterler için sayısal RPG statları eklendi.',
    highlights: [
      'Atmosferik Fon Müzikleri: Sahneye göre değişen 432Hz ambient sesler',
      'RPG Karakter Motoru: Zeka, Çeviklik, Güç ve Karizma değerleri',
      '7 Göz Dostu Okuma Teması (Yazar Moru, Siber Gece, Sıcak Toprak vb.)',
    ],
    icon: Volume2,
  },
  {
    version: 'v1.0',
    badge: 'Ekosistemin Doğuşu',
    date: 'Ocak 2026',
    title: 'Readixon Ekosisteminin Lansmanı & BTK Tescili',
    desc: 'Turixon Ltd. Şti. tüzel kişiliği altında resmi BTK yer sağlayıcı tescili ile Readixon dijital yayıncılık platformu hayata geçirildi.',
    highlights: [
      'T.C. BTK onaylı Yer Sağlayıcı tescili ve tam KVKK uyumluluğu',
      'Modern Next.js mimarisiyle ultra hızlı sayfa geçişleri',
      'İlk yazar ve okur topluluğunun buluşması',
    ],
    icon: Building2,
  },
];

// ── FAQ Items Categorized ──
interface FAQItem {
  id: string;
  category: 'author' | 'reader' | 'legal';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // Yazarlar
  {
    id: 'author-1',
    category: 'author',
    question: "Readixon'da yayınladığım hikayelerin telif hakkı kime aittir?",
    answer: "Eserlerin tüm telif ve fikri mülkiyet hakları %100 yazara aittir. 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında eserleriniz yasal koruma altındadır. Eserlerinizi dilediğiniz zaman silebilir, güncelleyebilir veya geleneksel yayınevlerine basılı olarak sunabilirsiniz. Readixon sadece eserinizi sergilediğiniz bağımsız ve güvenilir bir yayıncılık vitrinidir.",
  },
  {
    id: 'author-2',
    category: 'author',
    question: "Yazarlar Readixon üzerinden nasıl gelir elde edebilir?",
    answer: "Readixon çok kanallı ve adil bir monetizasyon modeli sunar: (1) Okur abonelikleri ile düzenli gelir, (2) Okurlardan doğrudan RX Puanı ile bahşiş/destek alma, (3) Özel bonus/erken erişim bölümleri oluşturma, (4) Edebi Arena yarışmalarında büyük ödül havuzlarından pay kazanma. Tüm kazançlar yasal sözleşmeler ve resmi banka transferi ile aktarılır.",
  },
  {
    id: 'author-3',
    category: 'author',
    question: "Universe (Evren & Lorebook) ve Spoiler Drawer sistemi nasıl çalışır?",
    answer: "Yazarlar hikayelerine ait karakterleri (statları, görselleri ve rolleriyle), mekanları, haritaları ve fraksiyonları Evren Defteri'ne ekler ve ilgili bölümlere etiketler. Reader Universe Drawer sayesinde bir okuyucu metindeki bir karaktere veya mekana dokunduğunda yalnızca o an okuduğu bölüme kadar olan bilgiler gösterilir. İleriki bölümlerdeki sırlar ve kurgusal kırılmalar asla açığa çıkmaz.",
  },
  {
    id: 'author-4',
    category: 'author',
    question: "Word veya Google Docs'taki taslaklarımı doğrudan aktarabilir miyim?",
    answer: "Evet! Gelişmiş Blok Editörümüz .docx formatındaki Word dosyalarını otomatik olarak tanır; başlıkları, diyalogları ve paragrafları blok formatına çevirir. Ayrıca bölünmüş ekran (split screen) özelliğiyle kurgu notlarınızı yazım esnasında yan panelde açık tutabilirsiniz.",
  },
  {
    id: 'author-5',
    category: 'author',
    question: "Co-authoring (Ortak Yazarlık) özelliği nasıl işler?",
    answer: "Bir evren veya hikaye oluşturduğunuzda diğer yazarları ortak üretici olarak davet edebilirsiniz. Ortak yazarlar evrene yeni mekanlar, karakterler ve bölümler ekleyebilir; yaratıcı süreç tek bir yazarın omzunda kalmaz, çok sesli ve genişleyen bir dünya haline gelir.",
  },
  // Okurlar
  {
    id: 'reader-1',
    category: 'reader',
    question: "Readixon'da hikaye okumak ücretli midir?",
    answer: "Hayır! Readixon'a kayıt olmak, binlerce orijinal hikayeyi okumak, ambiyans müziklerini dinlemek, Edebi Arena düellolarını takip edip oy vermek tamamen ücretsizdir. Yazarları doğrudan desteklemek isteyen okurlar için isteğe bağlı bahşiş ve abonelik seçenekleri mevcuttur.",
  },
  {
    id: 'reader-2',
    category: 'reader',
    question: "Spoiler koruması okurken bana nasıl bir avantaj sağlar?",
    answer: "Geleneksel platformlarda yorumlara baktığınızda veya karakteri araştırdığınızda anında ölüm veya ters köşe spoilerları yersiniz. Readixon'da okurken bir karakterin adına dokunduğunuzda açılan panel sadece bulunduğunuz bölüme kadarki kimliğini ve evrimini gösterir; henüz okumadığınız olaylar spoiler filtresiyle kilitli kalır.",
  },
  {
    id: 'reader-3',
    category: 'reader',
    question: "Ambiyans fon müziklerini ve okuma temasını değiştirebilir miyim?",
    answer: "Kesinlikle! Okuma motorunda fırtına, şömine, gece yağmuru ve dingin enstrümantal fon seslerinin seviyesini ayarlayabilir veya tek tıkla sessize alabilirsiniz. Ayrıca Yazar Moru, Siber Gece, Sıcak Toprak ve Minimal Siyah dahil 7 farklı tema ve dinamik yazı boyutu arasından dilediğinizi seçebilirsiniz.",
  },
  {
    id: 'reader-4',
    category: 'reader',
    question: "Edebi Arena'da oylamaya katılırsam ne kazanırım?",
    answer: "Okurlar Edebi Arena'da kör oylama düellolarına oy vererek kazananı belirler. Doğru analiz yapan ve aktif oy kullanan okurlar özel rozetler, platform içi profil unvanları ve RX Puanları kazanırlar.",
  },
  // Kurumsal & Yasal
  {
    id: 'legal-1',
    category: 'legal',
    question: "Readixon yasal ve resmi bir platform mudur?",
    answer: "Evet, Readixon platformu Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi tüzel kişiliği bünyesinde faaliyet göstermektedir. T.C. Bilgi Teknolojileri ve İletişim Kurumu (BTK) onaylı kayıtlı yer sağlayıcıdır (Mersis No: 0871128699600001, Pamukkale Vergi Dairesi No: 8711286996).",
  },
  {
    id: 'legal-2',
    category: 'legal',
    question: "Kişisel verilerim ve gizliliğim KVKK kapsamında nasıl korunuyor?",
    answer: "Readixon, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) harfiyen uygundur. Kullanıcı verileri en yüksek güvenlikli şifrelenmiş altyapılarda saklanır, üçüncü taraflarla kesinlikle ticari amaçla paylaşılmaz. Dilediğiniz an verilerinizi talep edebilir veya hesabınızı silebilirsiniz.",
  },
  {
    id: 'legal-3',
    category: 'legal',
    question: "Telif ihlali veya DMCA bildirimi durumunda süreç nasıl işler?",
    answer: "Readixon telif haklarına azami saygı gösterir. Platformda kendinize ait bir eserin izinsiz yayınlandığını düşünüyorsanız Telif Hakkı & DMCA sayfamızdaki prosedürü takip ederek veya support@readixon.com adresine yazarak 24 saat içinde içeriğin kaldırılmasını sağlayabilirsiniz.",
  },
];

export default function AboutPage() {
  // ── 3D Tilt Parallax State for Hero Showcase ──
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, lift: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current || window.innerWidth < 1024) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ rotateX, rotateY, lift: 15 });
  };

  const handleHeroMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, lift: 0 });
  };

  // ── Interactive Lab State ──
  const [activeTab, setActiveTab] = useState<LabTabId>('universe');

  // Reader Simulator State
  const [readerTheme, setReaderTheme] = useState<'cyber' | 'earth' | 'author' | 'minimal'>('author');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);
  const [isAmbientSoundActive, setIsAmbientSoundActive] = useState<boolean>(true);

  // Universe Simulator State
  const [spoilerUnlocked, setSpoilerUnlocked] = useState<boolean>(false);

  // Arena Simulator State
  const [isCurveballActive, setIsCurveballActive] = useState<boolean>(true);
  const [userVoted, setUserVoted] = useState<boolean>(false);

  // FAQ Accordion State
  const [activeFaqCategory, setActiveFaqCategory] = useState<'all' | 'author' | 'reader' | 'legal'>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('author-1');

  // Copy-to-Clipboard Helper with Toast Feedback
  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} panoya kopyalandı!`);
    }
  };

  // Legal Footer Links
  const legalLinks = [
    { title: 'Kullanım Koşulları', href: '/terms', icon: FileText, desc: 'Hizmet ve kullanım kuralları, hak ve sorumluluklar' },
    { title: 'Gizlilik ve KVKK', href: '/privacy', icon: Shield, desc: '6698 sayılı KVKK uyarınca veri güvenliği ve çerezler' },
    { title: 'Telif Hakkı & DMCA', href: '/copyright', icon: AlertCircle, desc: 'Fikri mülkiyet, yazar hakları ve içerik kaldırma' },
    { title: 'Topluluk Kuralları', href: '/guidelines', icon: BookOpen, desc: 'Saygılı, üretken ve etik etkileşim standartları' },
    { title: 'Mesafeli Satış Sözleşmesi', href: '/terms/mesafeli-satis', icon: FileCheck, desc: 'Abonelik ve dijital ürün satın alma prosedürleri' },
    { title: 'Ön Bilgilendirme Formu', href: '/terms/on-bilgilendirme', icon: FileText, desc: 'Tüketici hakları ve yasal bilgilendirme şartları' },
    { title: 'İptal ve İade Prosedürleri', href: '/terms/iptal-iade', icon: AlertCircle, desc: 'Cayma hakkı, iade koşulları ve üyelik sonlandırma' },
  ];

  const filteredFaqs = activeFaqCategory === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(f => f.category === activeFaqCategory);

  return (
    <div className="w-full bg-background text-text select-none pb-24">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION: KURUMSAL VİTRİN & 3D PARALLAX SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 pt-16 sm:pt-20 md:pt-24 pb-16 overflow-hidden">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-primary/[0.09] dark:bg-primary/[0.14] rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute top-2/3 left-1/4 w-[500px] h-[500px] bg-purple-500/[0.07] rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-[480px] h-[480px] bg-cyan-500/[0.06] rounded-full blur-[110px] pointer-events-none -z-10" />

        {/* Ambient Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(var(--color-text) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center z-10">

          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs md:text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm backdrop-blur-md"
          >
            <Sparkles size={16} className="text-primary animate-pulse" />
            <span>Yeni Nesil Yazarlık İşletim Sistemi</span>
          </motion.div>

          {/* Hero Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.12] mb-6 max-w-5xl"
          >
            Yazarlık İşletim Sistemi ve <br />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              İnteraktif Yayıncılık Ekosistemi
            </span>
          </motion.h1>

          {/* Hero Subtitle / Core Definition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed mb-10"
          >
            <strong>Readixon</strong>; yazarların fikir aşamasından kurgu ve evren oluşturmaya, yazımdan ortak üretime, yayınlamadan gelir elde etmeye kadar tüm yaratıcı süreci yönetebildiği; okuyucuların ise hikâyeleri yalnızca okumakla kalmayıp karakterleri, haritaları ve evrenleri spoiler kontrollü biçimde keşfedebildiği yeni nesil bir ekosistemdir.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4 mb-14"
          >
            <Link
              href="/studio"
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 flex items-center gap-2.5"
            >
              <Feather size={20} />
              <span>Yazmaya Başla (Stüdyo)</span>
            </Link>

            <Link
              href="/library"
              className="px-8 py-4 bg-card/90 hover:bg-card border border-border/80 text-text font-bold rounded-2xl transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 flex items-center gap-2.5 backdrop-blur-md"
            >
              <BookOpen size={20} className="text-primary" />
              <span>Kütüphaneyi Keşfet</span>
            </Link>

            <a
              href="#deneyim-laboratuvari"
              className="px-6 py-4 text-muted hover:text-text font-semibold rounded-2xl transition-colors flex items-center gap-1.5"
            >
              <span>Özellikleri Canlı Dene</span>
              <ChevronDown size={16} />
            </a>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              3D PARALLAX SHOWCASE CARD
             ───────────────────────────────────────────────────────────── */}
          <div
            className="about-perspective w-full max-w-4xl relative mt-4 cursor-pointer"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            ref={heroCardRef}
          >
            {/* Floating Parallax Satellite Badges */}
            <div className="hidden lg:block absolute -top-6 -left-8 z-30 about-floating-element pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-primary/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Compass size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">Universe & Lorebook</p>
                  <p className="text-[10px] text-muted">Spoiler-Safe Çekmece</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -top-8 -right-6 z-30 about-floating-delayed pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-amber-500/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">Editoryal İnceleme</p>
                  <p className="text-[10px] text-amber-500 font-semibold">9.8 • Kusursuz Başyapıt</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-6 -left-6 z-30 about-floating-delayed pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-purple-500/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">RPG Karakter Statı</p>
                  <p className="text-[10px] text-purple-400 font-semibold">Zeka 94 • Karizma 89</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-8 -right-8 z-30 about-floating-element pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-red-500/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Zap size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">Sürpriz Kırılma (Curveball)</p>
                  <p className="text-[10px] text-red-400 font-semibold">Son 15 Dk • Tabu Kuralı</p>
                </div>
              </div>
            </div>

            {/* Main Centerpiece 3D Card */}
            <motion.div
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.lift}px)`,
              }}
              className="about-card-3d w-full rounded-3xl border border-border/70 bg-card/90 p-3 sm:p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-hidden text-left"
            >
              {/* Card Header Ribbon */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[11px] font-mono text-muted/70 ml-2">readixon.com/about</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkle size={12} />
                  <span>Kurumsal Vitrin</span>
                </div>
              </div>

              {/* Two-Column Showcase Frame */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch rounded-2xl overflow-hidden bg-background/50 border border-border/40 p-4">
                {/* Left Mini Hero Poster */}
                <div className="md:col-span-5 relative min-h-[220px] rounded-xl overflow-hidden shadow-inner flex flex-col justify-end p-5 text-white">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('/images/auth-hero.jpg')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-2">
                      <BookOpen size={10} />
                      Yazarlık İşletim Sistemi
                    </span>
                    <h3 className="text-xl font-bold leading-tight mb-1 text-white">Yaşayan Evrenler</h3>
                    <p className="text-xs text-white/80 line-clamp-2">
                      Kurgu, evren inşası, müzik, rekabet ve geliri tek ekosistemde buluşturan Türkiye'nin ilk edebi platformu.
                    </p>
                  </div>
                </div>

                {/* Right Interactive Highlights */}
                <div className="md:col-span-7 flex flex-col justify-center space-y-3 p-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Compass size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Universe & Spoiler-Safe Drawer</p>
                        <p className="text-[11px] text-muted">Okurken bölüme göre açılan spoiler korumalı bilgi paneli</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">V2.2</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Volume2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Atmosferik Fon Müzikleri</p>
                        <p className="text-[11px] text-muted">Okunan sahneye duyarlı 432Hz ambient fon sesleri</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">Ambiyans</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Şeffaf Telif & Yazar Gelir Modeli</p>
                        <p className="text-[11px] text-muted">%100 yazar mülkiyeti, abonelikler ve bahşiş gelirleri</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Güven</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          IN-PAGE ANCHOR SUB-NAVIGATION BAR (HIZLI GEÇİŞ ÇUBUĞU)
         ───────────────────────────────────────────────────────────── */}
      <nav className="about-sticky-nav w-full py-2.5 px-4 overflow-x-auto scrollbar-none" aria-label="Sayfa İçi Menü">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <a href="#vizyon" className="about-nav-pill">
              <Quote size={13} />
              <span>Vizyon & Kurucu</span>
            </a>
            <a href="#ozellikler" className="about-nav-pill">
              <Sparkles size={13} />
              <span>Tüm Özellikler</span>
            </a>
            <a href="#deneyim-laboratuvari" className="about-nav-pill">
              <Sliders size={13} />
              <span>Canlı Laboratuvar</span>
            </a>
            <a href="#timeline" className="about-nav-pill">
              <Clock size={13} />
              <span>Zaman Çizelgesi</span>
            </a>
            <a href="#faq" className="about-nav-pill">
              <HelpCircle size={13} />
              <span>S.S.S.</span>
            </a>
            <a href="#kurumsal" className="about-nav-pill">
              <Shield size={13} />
              <span>Kurumsal & Yasal</span>
            </a>
            <a href="#yardim" className="about-nav-pill">
              <LifeBuoy size={13} />
              <span>Yardım & Destek</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              Readixon'a Katıl
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. GERÇEKTEN HAKKIMIZDA: BİZ KİMİZ? KURUCU VİZYONU & SORUNLAR
         ───────────────────────────────────────────────────────────── */}
      <section id="vizyon" className="relative w-full py-24 px-4 sm:px-6 md:px-12 scroll-mt-28">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Quote size={14} />
              <span>Gerçekten Hakkımızda</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-black text-text mb-4 tracking-tight">
              Biz Kimiz ve Neden Buradayız?
            </Typography>
            <Typography variant="body" className="text-muted text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              Dijital edebiyat ve yazarlık araçları son 15 yıldır yerinde sayıyordu. Yazarlar beş farklı uygulama arasında kayboluyor, okurlar ise düz metinlere ve yorumlardaki acımasız spoilerlara mahkum ediliyordu. Readixon bu çıkmazı kökten değiştirmek için doğdu.
            </Typography>
          </div>

          {/* Kurucu Mektubu & Manifestosu */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-background border border-primary/25 shadow-xl relative overflow-hidden mb-16">
            <Quote size={140} className="absolute -bottom-8 -right-8 text-primary/10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
              {/* Founder Avatar with Glowing Ring */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shrink-0 ring-4 ring-primary/25 shadow-2xl">
                <Image
                  src="/cagri.jpeg"
                  alt="Çağrı Kerman - Readixon Kurucusu"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Kurucunun Mektubu
                  </span>
                  <span className="text-[11px] text-muted">• Denizli / Türkiye</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-text mb-4">
                  "Kelimeleri Statik Sayfalardan Kurtarıp Yaşayan Bir Evrene Dönüştürüyoruz"
                </h3>

                <div className="text-sm sm:text-base leading-relaxed text-muted space-y-4 mb-6">
                  <p>
                    "Yazarlar için fikir aşamasından bir evren inşa etmeye, ortak üretimden yayınlama ve gelir elde etmeye kadar uzanan yolculuk bugüne dek dağınık ve yalnızdı. Bir yazar kurgusunu Notion'da planlıyor, metnini Word'de yazıyor, ortaklarıyla Discord'da konuşuyor, Wattpad gibi sitelerde düz metin olarak yayınlıyor ve Patreon üzerinden destek arıyordu. Bu parçalanmışlık yaratıcılığı tüketiyordu."
                  </p>
                  <p>
                    "Okuyucular ise yalnızca düz satırları takip edebiliyor, 20 bölüm sonra bir yan karakteri hatırlamak istediklerinde Google'da veya yorumlarda arama yapıp hikayenin en can alıcı sürprizlerini (spoiler) öğrenmek zorunda kalıyordu. Fon müziği yoktu, mekanın haritası yoktu, karakterlerin gelişimi yoktu."
                  </p>
                  <p>
                    "Readixon’ı kurarken hedefimiz çok netti: <strong>Yazarlık İşletim Sistemi</strong> ile tüm bu yaratıcı araçları tek bir çatı altında birleştirmek; okuyucuya ise spoiler kontrollü evren çekmecesi (Reader Universe Drawer), sahneye özel ambiyans fon sesleri ve canlı rekabet arenasıyla daha önce hiç yaşamadığı bir edebiyat deneyimi sunmak."
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/40">
                  <div>
                    <h4 className="font-extrabold text-base text-text">Çağrı Kerman</h4>
                    <p className="text-xs text-muted">Readixon Kurucusu & Tasarım Mimarı</p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-semibold text-primary">
                    <CheckCircle2 size={16} />
                    <span>Turixon Ltd. Şti. Güvencesiyle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Problem vs. Readixon Solution Matrix */}
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-text mb-2">
                Eski Alışkanlıklar vs. Readixon Yaklaşımı
              </h3>
              <p className="text-xs sm:text-sm text-muted">
                Readixon, dijital yayıncılığın kemikleşmiş sorunlarını nasıl çözüyor?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem Side */}
              <div className="about-compare-item bg-red-500/[0.04] border border-red-500/20">
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-4">
                  <AlertCircle size={18} />
                  <span>Geleneksel / Statik Hikaye Siteleri</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-muted">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span><strong>Düz ve Cansız Metin:</strong> Ses, görsel atmosfer ve dinamik kurgu derinliğinden yoksun sayfalar.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span><strong>Sıfır Dünya İnşası (Worldbuilding):</strong> Karakterler, mekanlar ve soy ağaçları için entegre hiçbir araç yok.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span><strong>Yıkıcı Spoilerlar:</strong> Okur yorumlarında veya profillerde hikayenin tüm sürprizleri anında açığa çıkar.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span><strong>Dağınık 5 Farklı Uygulama:</strong> Yazarlar Notion, Docs, Discord, Patreon arasında tükenir.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span><strong>Sıfır veya Belirsiz Gelir:</strong> Yazarın emeği sömürülür, adil bir monetizasyon modeli sunulmaz.</span>
                  </li>
                </ul>
              </div>

              {/* Readixon Solution Side */}
              <div className="about-compare-item bg-primary/[0.06] border border-primary/30 shadow-sm">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4">
                  <CheckCircle2 size={18} />
                  <span>Readixon Yazarlık İşletim Sistemi</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-text">
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Atmosferik Okuma:</strong> Sahneye göre değişen 432Hz ambient fon müzikleri ve 7 özel tema.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Universe & Lorebook 2.0:</strong> Karakter kartları, RPG statları, mekan defteri ve interaktif haritalar.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Reader Universe Drawer:</strong> Okuduğunuz bölüme duyarlı, spoiler-safe bilgi keşfi.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Tek Çatı Altında Yazarlık OS:</strong> Blok editör, Word (.docx) import, split-screen kurgu ve co-authoring.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Şeffaf Telif & Çok Kanallı Gelir:</strong> %100 yazar hakları, okur abonelikleri ve doğrudan bahşişler.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. READIXON'UN TÜM ÖZELLİKLERİ (EKOSİSTEM HARİTASI)
         ───────────────────────────────────────────────────────────── */}
      <section id="ozellikler" className="relative w-full py-24 px-4 sm:px-6 md:px-12 bg-card/40 border-y border-border/50 scroll-mt-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} />
              <span>Eksiksiz Ekosistem Mimarisi</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-black text-text mb-4 tracking-tight">
              Readixon'un Tüm Gücü Tek Bakışta
            </Typography>
            <Typography variant="body" className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Fikir aşamasından yayınlamaya ve okuyucuyla buluşmaya kadar her adım için geliştirilmiş modüller.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Yazarlık OS & Blok Editör */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <LayoutDashboard size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Yazarlık OS & Blok Editör</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Stüdyo</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Word (.docx) aktarımıyla otomatik blok formatlama. Paragraf, diyalog ve sahne blokları. Bölünmüş ekranda kurgu notları ve yapay zeka ilham asistanı.
                </p>
              </div>
              <Link href="/studio" className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                Stüdyoya Göz At <ChevronRight size={14} />
              </Link>
            </div>

            {/* Feature 2: Universe & Lorebook 2.0 */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Compass size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Universe & Lorebook 2.0</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">Evren</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Kurgusal dünyanızın mimarisi: Karakter defteri, mekan defteri 2.0, fraksiyonlar, interaktif haritalar ve kitapları birbirine bağlayan evren ağı.
                </p>
              </div>
              <Link href="/universe" className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:underline">
                Evrenleri Keşfet <ChevronRight size={14} />
              </Link>
            </div>

            {/* Feature 3: Spoiler-Safe Reader Drawer */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Lock size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Spoiler-Safe Okuma Çekmecesi</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">Patentli</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Okuma esnasında karakter veya mekan adına dokunun; yalnızca o an okuduğunuz bölüme kadar olan bilgiler gösterilir. İleriki olaylar asla açığa çıkmaz.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                Bölüme Duyarlı Koruma <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 4: Co-Authoring & Yazar İş Birliği */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Co-Authoring (Ortak Üretim)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">İş Birliği</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Tek başına yazmak zorunda değilsiniz. Diğer yazarları evreninize davet edin, yan hikayeler ürettirin veya ortak bölümlerle genişleyen destanlar yaratın.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                Ortak Evren Yönetimi <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 5: Atmosferik Ambiyans Motoru */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Volume2 size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Atmosferik Ambiyans Motoru</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Ses</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Okunan sahneye özel yağmur, şömine, fırtına veya dingin piyano ezgileri. 7 farklı göz dostu okuma temasıyla kitapların duygusunu birebir hissedin.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                Kişiselleştirilebilir Ses <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 6: Edebi Arena & Curveball */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Swords size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Edebi Arena & Curveball</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Düello</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Zaman kısıtlı odalarda kör oylama ile yarışın. Yazar kimlikleri gizlenir, sadece yetenek konuşur. Son çeyrekte gelen Curveball kuralıyla rekabet zirveye çıkar.
                </p>
              </div>
              <Link href="/arena" className="text-xs font-bold text-amber-500 flex items-center gap-1 group-hover:underline">
                Arenaya Katıl <ChevronRight size={14} />
              </Link>
            </div>

            {/* Feature 7: RPG Karakter Motoru */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">RPG Karakter Motoru</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Statlar</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Karakterler sadece isim değildir; Zeka, Güç, Çeviklik ve Karizma statlarıyla seviye atlayan, rolleriyle kurguyu yönlendiren yaşayan figürlerdir.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                Sayısal Karakter Derinliği <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 8: Şeffaf Telif & Monetizasyon */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-green-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <DollarSign size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Şeffaf Telif & Gelir Modeli</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Monetizasyon</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Eserlerin tüm hakları %100 yazarındır. Okur abonelikleri, RX puanı ile bahşiş, özel bölümler ve arena ödülleriyle yazarlar emeklerinin karşılığını alır.
                </p>
              </div>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                Düzenli & Yasal Ödemeler <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 9: Story Highlights & Readix Akışı */}
            <div className="p-7 rounded-3xl bg-card border border-border/70 hover:border-pink-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-text">Story Highlights & Readix</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500">Sosyal</span>
                </div>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Instagram tarzı müzikli hikaye öne çıkanları, dikey Webtoon okuma modu, tek tıkla şık alıntı kartları ve yazar-okur arası doğrudan mesajlaşma.
                </p>
              </div>
              <Link href="/feed" className="text-xs font-bold text-pink-500 flex items-center gap-1 group-hover:underline">
                Readix Akışını Gör <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. İNTERAKTİF DENEYİM LABORATUVARI (CANLI SİMÜLATÖR)
         ───────────────────────────────────────────────────────────── */}
      <section id="deneyim-laboratuvari" className="relative w-full py-24 px-4 sm:px-6 md:px-12 scroll-mt-28">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Sliders size={14} />
              <span>Canlı Simülatör</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-black text-text mb-4 tracking-tight">
              Özellikleri Bizzat Test Edin
            </Typography>
            <Typography variant="body" className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Readixon yalnızca bir metin arşivi değil; edebiyatı müzik, evren tasarımı ve oyun mekanikleriyle yaşayan bir stüdyoya dönüştüren bir ekosistemdir.
            </Typography>
          </div>

          {/* Multi-Panel Container */}
          <div className="about-lab-container">
            {/* Left Navigation Menu */}
            <div className="about-lab-nav" role="tablist">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider px-3 mb-3">
                  Sistem Modülleri
                </div>
                {LAB_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`about-lab-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <div className="flex-1 truncate">
                        <span className="block leading-tight truncate">{tab.label}</span>
                        <span className={`text-[10px] block opacity-75 ${isActive ? 'text-white' : 'text-muted'}`}>
                          {tab.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:flex flex-col gap-1 p-3 rounded-2xl bg-card border border-border/40 mt-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Sparkles size={14} />
                  <span>Sürekli Canlı Güncellemeler</span>
                </div>
                <p className="text-[11px] text-muted leading-tight">
                  Her hafta okur ve yazar geri bildirimleriyle yeni modüller eklenir.
                </p>
              </div>
            </div>

            {/* Center 3D Hero Poster */}
            <div className="about-lab-hero">
              <div className="about-lab-hero-bg" />
              <div className="about-lab-hero-overlay" />
              <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end text-white">
                {(() => {
                  const current = LAB_TABS.find(t => t.id === activeTab) || LAB_TABS[0];
                  return (
                    <div className="animate-in fade-in duration-300">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-2">
                        <span>{current.badge}</span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight mb-2 text-white">{current.heroTitle}</h3>
                      <p className="text-xs text-white/80 leading-relaxed mb-4">{current.heroDesc}</p>
                      <div className="w-12 h-1 rounded-full bg-primary" />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Interactive Playground Panel */}
            <div className="about-lab-preview">
              <AnimatePresence mode="wait">
                {/* ── TAB: UNIVERSE & SPOILER DRAWER ── */}
                {activeTab === 'universe' && (
                  <motion.div
                    key="tab-universe"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Universe & Spoiler-Safe Drawer</h4>
                        <p className="text-xs text-muted">Aşağıdaki butona basarak spoiler filtresinin nasıl çalıştığını canlı test edin.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpoilerUnlocked(!spoilerUnlocked)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${spoilerUnlocked
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-primary/10 border-primary text-primary'
                          }`}
                      >
                        {spoilerUnlocked ? <Lock size={15} /> : <EyeOff size={15} />}
                        <span>{spoilerUnlocked ? 'Bölüm 8 Seviyesindesiniz (İleriyi Gizle)' : 'Bölüm 3 Seviyesi (Spoiler Güvenli)'}</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                            VT
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-text">Valeria Thorne</h5>
                            <p className="text-xs text-muted">Gölgeler Konseyi • Baş Kahraman</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Karakter Kartı
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-background border border-border/50 text-xs leading-relaxed">
                        <p className="text-text mb-2">
                          <strong>Bölüm 3 İtibarıyla Bilinenler:</strong> Valeria, kraliyet muhafızlarının genç bir komutanıdır ve gizemli bir kolyeyi korumakla görevlendirilmiştir.
                        </p>
                        {spoilerUnlocked ? (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 animate-in fade-in duration-200">
                            <strong>⚠️ Bölüm 8 Ters Köşesi:</strong> Valeria aslında düşman klanın kayıp varisi olduğunu ve kralın kolyeyle tüm halkı hipnotize ettiğini öğrenmiştir!
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-card border border-dashed border-border/70 text-muted flex items-center justify-between">
                            <span>🔒 İleriki bölümlerdeki sırlar kilitlidir (Spoiler Koruması Aktif)</span>
                            <span className="text-[10px] font-bold text-primary">Bölüm 8'de Açılacak</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB: AKILLI OKUYUCU & AMBİYANS ── */}
                {activeTab === 'reader' && (
                  <motion.div
                    key="tab-reader"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Okuma ve Ambiyans Motoru</h4>
                        <p className="text-xs text-muted">Aşağıdaki kontrollerle canlı simülasyonu test edin.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAmbientSoundActive(!isAmbientSoundActive)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${isAmbientSoundActive
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-card border-border text-muted hover:text-text'
                          }`}
                      >
                        {isAmbientSoundActive ? (
                          <>
                            <div className="flex items-end gap-1 h-4">
                              <span className="sound-bar" />
                              <span className="sound-bar" />
                              <span className="sound-bar" />
                              <span className="sound-bar" />
                            </div>
                            <span>Fon Müziği: Gece Yağmuru (Açık)</span>
                          </>
                        ) : (
                          <>
                            <VolumeX size={16} />
                            <span>Fon Müziği: Sessiz (Açmak İçin Tıkla)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Theme Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                          <Palette size={14} className="text-primary" />
                          <span>Görsel Tema Seçimi</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'author', name: 'Yazar Moru', bg: 'bg-[#6366F1]' },
                            { id: 'cyber', name: 'Siber Gece', bg: 'bg-[#0D1117] border border-cyan-400' },
                            { id: 'earth', name: 'Sıcak Toprak', bg: 'bg-[#F3F0EA] border border-amber-600' },
                            { id: 'minimal', name: 'Minimal Siyah', bg: 'bg-[#000000] border border-zinc-700' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setReaderTheme(t.id as any)}
                              className={`p-2 rounded-xl text-center text-[11px] font-medium border transition-all ${readerTheme === t.id
                                  ? 'border-primary ring-2 ring-primary/30 font-bold'
                                  : 'border-border/60 hover:border-border'
                                }`}
                            >
                              <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${t.bg}`} />
                              <span className="truncate block">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size Adjuster */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted flex items-center justify-between">
                          <span>Yazı Boyutu: <strong className="text-text">{readerFontSize}px</strong></span>
                          <span className="text-[10px] text-primary">Dinamik Ölçekleme</span>
                        </label>
                        <div className="flex items-center gap-3 bg-background/80 p-2 rounded-xl border border-border/50">
                          <button
                            type="button"
                            onClick={() => setReaderFontSize(Math.max(14, readerFontSize - 2))}
                            className="px-3 py-1.5 rounded-lg bg-card text-xs font-bold hover:bg-primary hover:text-white transition-colors border border-border"
                          >
                            A-
                          </button>
                          <div className="flex-1 bg-border/40 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all duration-200"
                              style={{ width: `${((readerFontSize - 14) / 10) * 100}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setReaderFontSize(Math.min(24, readerFontSize + 2))}
                            className="px-3 py-1.5 rounded-lg bg-card text-xs font-bold hover:bg-primary hover:text-white transition-colors border border-border"
                          >
                            A+
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-6 rounded-2xl border transition-all duration-300 relative shadow-sm ${readerTheme === 'cyber'
                          ? 'bg-[#0D1117] text-[#C9D1D9] border-cyan-500/30'
                          : readerTheme === 'earth'
                            ? 'bg-[#F3F0EA] text-[#2D2824] border-[#E3DED8]'
                            : readerTheme === 'minimal'
                              ? 'bg-[#0A0A0A] text-[#FAFAFA] border-zinc-800'
                              : 'bg-card text-text border-primary/30'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4 pb-2 border-current/10 border-b">
                        <span className="text-xs font-bold opacity-75 uppercase tracking-wider">
                          Bölüm 4: Sisler Arasındaki Yankı
                        </span>
                        <span className="text-[10px] opacity-60">Readixon Reader v2</span>
                      </div>

                      <p
                        className="leading-relaxed transition-all duration-200"
                        style={{ fontSize: `${readerFontSize}px` }}
                      >
                        "Zaman, taş binaların arasından bir gölge gibi süzülürken rüzgarın fısıltısı eski bir melodiyi taşıyordu.
                        <mark className="bg-primary/20 text-inherit px-1.5 py-0.5 rounded mx-1 font-medium border-b-2 border-primary">
                          Kelimeler sadece kağıt üzerinde durmaz; onları duyan bir ruh varsa dünyayı baştan inşa ederler.
                        </mark>
                        O gece kapı çalındığında her şeyin değişeceğini biliyordum."
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB: EDEBİ ARENA ── */}
                {activeTab === 'arena' && (
                  <motion.div
                    key="tab-arena"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Edebi Arena & Kör Oylama</h4>
                        <p className="text-xs text-muted">Yazarlar eşit şartlarda yarışır, isimler gizlenir, okurlar karar verir.</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-xs border border-red-500/20">
                        <Flame size={14} /> Canlı Oda: 120 Dk Kısıt
                      </span>
                    </div>

                    <div
                      onClick={() => setIsCurveballActive(!isCurveballActive)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isCurveballActive
                          ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-sm'
                          : 'bg-card border-border/60 text-muted'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCurveballActive ? 'bg-red-500/20 text-red-500' : 'bg-muted/10 text-muted'
                          }`}>
                          <Zap size={22} className={isCurveballActive ? 'animate-bounce' : ''} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text">Curveball Modu: {isCurveballActive ? 'AKTİF' : 'DEVRE DIŞI'}</p>
                          <p className="text-[11px] text-muted">
                            {isCurveballActive
                              ? 'Son %25 sürede aniden beliren kural: "GÖLGE" kelimesini kullanmak yasaklandı!'
                              : 'Kuralı aktifleştirmek ve heyecanı katlamak için tıklayın.'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold underline">Durumu Değiştir</span>
                    </div>

                    <div className="p-4 rounded-xl bg-background/80 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-muted text-center sm:text-left">
                        {userVoted
                          ? '🎉 Oyunuz kaydedildi! Kazanan açıklandığında rozet ve RX Puanı kazanacaksınız.'
                          : 'Okur olarak kör oylamaya katılın, sadece edebi yeteneği puanlayın.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setUserVoted(!userVoted)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${userVoted
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md'
                          }`}
                      >
                        {userVoted ? 'Oy Verildi (Geri Al)' : 'Oylamaya Katıl (Yazar B)'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB: RPG KARAKTER MOTORU ── */}
                {activeTab === 'rpg' && (
                  <motion.div
                    key="tab-rpg"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">RPG Karakter Sistemi</h4>
                        <p className="text-xs text-muted">Karakterler sadece isim değil; seviye atlayan ve statları olan figürlerdir.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-bold text-xs border border-purple-500/20">
                        Seviye 7 Protagonist
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-6 rounded-2xl bg-card border border-border/70 shadow-sm">
                      <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-primary/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-md">
                          <Shield size={36} />
                        </div>
                        <h5 className="font-bold text-base text-text">Valeria Thorne</h5>
                        <p className="text-xs text-muted mb-2">Gölgelerin Muhafızı</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">
                          Gölge Yürüyüşü
                        </span>
                      </div>

                      <div className="md:col-span-8 flex flex-col justify-center space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Zeka (Intelligence):</span>
                            <span className="text-purple-400 font-bold">92 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: '92%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Çeviklik (Agility):</span>
                            <span className="text-cyan-400 font-bold">88 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '88%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Karizma (Charisma):</span>
                            <span className="text-amber-400 font-bold">78 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB: STÜDYO ── */}
                {activeTab === 'studio' && (
                  <motion.div
                    key="tab-studio"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Yazar Stüdyosu & Kurgu Sihirbazı</h4>
                        <p className="text-xs text-muted">Word/Docs uyumlu blok editör, bölünmüş ekran kurgu notları.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                        Bölünmüş Ekran (Split View)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <LayoutDashboard size={14} className="text-primary" />
                              Blok Tabanlı Editör
                            </span>
                            <span className="text-[10px] text-muted">Word (.docx) Algılandı</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-background border border-border/40 text-text">
                              [Paragraf] Sisli ormanın dalları arasından tek bir ışık huzmesi süzüldü.
                            </div>
                            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-primary font-medium">
                              [Diyalog] "Burada yalnız olmadığımızı biliyorsun, değil mi?"
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                          <span>Kelime: 1.240</span>
                          <span className="text-green-500 font-semibold">● Otomatik Kaydedildi</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Wand2 size={14} className="text-amber-500" />
                              Kurgu Sihirbazı Notları
                            </span>
                            <span className="text-[10px] text-amber-500 font-semibold">Şablon: Ters Köşe</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-text">
                              <span className="text-[10px] font-bold text-amber-500 uppercase block mb-0.5">Açılış Kancası:</span>
                              Okur ilk 3 cümlede karakterin sakladığı sırla tanışmalı.
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                          <span>AI İlhamı: Hazır</span>
                          <span className="text-primary font-semibold">Evrenle Eşitlendi</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB: EDİTORYAL İNCELEME ── */}
                {activeTab === 'editorial' && (
                  <motion.div
                    key="tab-editorial"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Editoryal İnceleme & Puanlama</h4>
                        <p className="text-xs text-muted">Platformdaki eserler bağımsız editör kurulu tarafından analiz edilir.</p>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-xs border border-amber-500/30 flex items-center gap-1.5">
                        <Star size={14} className="fill-amber-500" /> 9.8 / 10 • Kusursuz Başyapıt
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-background border border-border/40 text-center">
                          <span className="text-[11px] text-muted block mb-1">Kurgu Bütünlüğü</span>
                          <span className="text-lg font-black text-amber-500">10 / 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border/40 text-center">
                          <span className="text-[11px] text-muted block mb-1">Dil & Üslup Zenginliği</span>
                          <span className="text-lg font-black text-primary">9.8 / 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border/40 text-center">
                          <span className="text-[11px] text-muted block mb-1">Karakter Derinliği</span>
                          <span className="text-lg font-black text-purple-400">9.6 / 10</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-xs text-text leading-relaxed">
                        <strong className="text-primary font-bold block mb-1">Editör Masası Kararı:</strong>
                        "Eserdeki atmosferik derinlik ve karakter çatışmaları çağdaş Türk edebiyatında az rastlanan bir olgunlukta."
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB: HIGHLIGHTS & WEBTOON ── */}
                {activeTab === 'webtoon' && (
                  <motion.div
                    key="tab-webtoon"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Story Highlights & Readix Akışı</h4>
                        <p className="text-xs text-muted">Instagram Story tarzı müzikli hikaye kesitleri ve alıntı kartları.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs border border-cyan-500/20">
                        V2.2 Özelliği
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Sparkles size={14} className="text-cyan-400" />
                              Müzikli Story Highlights
                            </span>
                            <span className="text-[10px] text-muted">Bölüm Kesiti</span>
                          </div>
                          <div className="w-full h-32 rounded-xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-border/50 flex flex-col items-center justify-center text-center p-4">
                            <span className="text-xs font-bold text-white mb-1">Görsel & Fon Müziğiyle Tanıtım</span>
                            <p className="text-[10px] text-white/70 max-w-xs">
                              Hikayenizin en vurucu anını Instagram Story tarzında müzikli kart olarak öne çıkarın.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Quote size={14} className="text-primary" />
                              Readix Şık Alıntı Kartı
                            </span>
                            <span className="text-[10px] text-primary font-semibold">Sosyal Paylaşım</span>
                          </div>
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs italic text-text leading-relaxed relative">
                            "Bazı hikayeler sadece okunmaz; insanın içine bir fırtına gibi düşer ve hiç dinmez."
                            <div className="mt-3 text-[10px] not-italic font-bold text-muted flex items-center justify-between">
                              <span>@cagrikerman</span>
                              <span className="text-primary font-semibold">#ReadixonDevrimi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ÜRÜN EVRİMİ & ZAMAN ÇİZELGESİ (CHANGELOG TIMELINE)
         ───────────────────────────────────────────────────────────── */}
      <section id="timeline" className="relative w-full py-24 px-4 sm:px-6 md:px-12 bg-card/20 border-t border-border/50 scroll-mt-28">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Clock size={14} />
              <span>Kesintisiz Ürün Evrimi</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-black text-text mb-4 tracking-tight">
              Her Gün Yeni Bir Güncelleme
            </Typography>
            <Typography variant="body" className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Readixon masa başında bekleyen statik bir proje değil; topluluğumuzla birlikte her hafta yeni özelliklerle evrilen yaşayan bir ekosistemdir.
            </Typography>
          </div>

          {/* Timeline Nodes */}
          <div className="about-timeline-track space-y-12 pl-12 md:pl-0">
            {TIMELINE_DATA.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.version}
                  className={`about-timeline-node flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''
                    }`}
                >
                  {/* Central Node Dot */}
                  <div className="absolute -left-12 md:left-1/2 -translate-x-1/2 top-4 z-20 flex items-center justify-center">
                    <div className="about-timeline-dot" />
                  </div>

                  {/* Empty Spacer on Desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="about-timeline-card p-6 sm:p-7 rounded-3xl bg-card border border-border/70 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs font-mono">
                            {item.version}
                          </span>
                          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-xs text-muted font-medium flex items-center gap-1">
                          <Clock size={12} />
                          {item.date}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                        <Icon size={18} className="text-primary shrink-0" />
                        <span>{item.title}</span>
                      </h4>

                      <p className="text-xs sm:text-sm text-muted leading-relaxed mb-4">
                        {item.desc}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-border/40">
                        {item.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-text">
                            <span className="text-primary font-bold mt-0.5">•</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SIKÇA SORULAN SORULAR (FAQ ACCORDION & SEO KANALI)
         ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative w-full py-24 px-4 sm:px-6 md:px-12 scroll-mt-28">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle size={14} />
              <span>Sıkça Sorulan Sorular</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl font-black text-text mb-4 tracking-tight">
              Aklınızdaki Tüm Soruların Cevapları
            </Typography>
            <Typography variant="body" className="text-muted text-base max-w-2xl mx-auto">
              Yazarlar, okuyucular ve kurumsal yapımız hakkında merak ettiğiniz her şeyi şeffaflıkla yanıtladık.
            </Typography>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: 'all', label: 'Tüm Sorular' },
              { id: 'author', label: '✍️ Yazarlar İçin' },
              { id: 'reader', label: '📖 Okuyucular İçin' },
              { id: 'legal', label: '🛡️ Kurumsal & Yasal' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFaqCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFaqCategory === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-card border border-border/70 text-muted hover:text-text'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`about-faq-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="about-faq-question"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-muted transition-transform duration-300 shrink-0 ml-4 ${isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="about-faq-answer">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. KURUMSAL BİLGİLER & YASAL SÖZLEŞMELER VİTRİNİ
         ───────────────────────────────────────────────────────────── */}
      <section id="kurumsal" className="relative w-full py-24 px-4 sm:px-6 md:px-12 bg-card/30 border-t border-border/50 scroll-mt-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield size={14} />
              <span>Resmi ve Yasal Güvence</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl font-black text-text mb-4 tracking-tight">
              Kurumsal Şeffaflık & Şirket Bilgileri
            </Typography>
            <Typography variant="body" className="text-muted text-base max-w-2xl mx-auto">
              Readixon, <strong>Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</strong> tüzel kişiliği bünyesinde faaliyet göstermekte olup, T.C. kanunları ve BTK Yer Sağlayıcı mevzuatlarına tam uyumlulukla hizmet verir.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Box 1: Corporate Legal Credentials */}
            <div className="p-8 rounded-3xl bg-background border border-border/60 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2.5">
                  <Briefcase className="text-primary" size={22} />
                  <span>Şirket Kayıt Bilgileri</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-muted block uppercase tracking-wider text-[10px] mb-1">Resmi Ticari Unvan</span>
                    <p className="font-semibold text-text text-sm">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div>
                      <span className="text-muted block uppercase tracking-wider text-[10px]">Mersis Numarası</span>
                      <p className="font-mono font-bold text-text text-sm">0871128699600001</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('0871128699600001', 'Mersis numarası')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div>
                      <span className="text-muted block uppercase tracking-wider text-[10px]">Vergi Dairesi ve No</span>
                      <p className="font-mono font-bold text-text text-sm">Pamukkale VD / 8711286996</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('8711286996', 'Vergi numarası')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-500 font-bold text-xs">
                    <Shield size={16} />
                    <span>T.C. BTK Onaylı Resmi Yer Sağlayıcı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Direct Contact & Address */}
            <div className="p-8 rounded-3xl bg-background border border-border/60 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2.5">
                  <MapPin className="text-primary" size={22} />
                  <span>Resmi İletişim & KEP</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-0.5 shrink-0" size={18} />
                    <div>
                      <span className="text-muted block uppercase tracking-wider text-[10px] mb-1">Şirket Merkez Adresi</span>
                      <p className="font-medium text-text leading-relaxed">
                        AKKONAK MAH. 1814 SK. NO: 87 İÇ KAPI NO: 2 MERKEZEFENDİ / DENİZLİ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary shrink-0" size={18} />
                      <div>
                        <span className="text-muted block uppercase tracking-wider text-[10px]">Resmi Destek E-Postası</span>
                        <a href="mailto:support@readixon.com" className="font-medium text-text hover:text-primary transition-colors">
                          support@readixon.com
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('support@readixon.com', 'Destek e-postası')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary shrink-0" size={18} />
                      <div>
                        <span className="text-muted block uppercase tracking-wider text-[10px]">KEP (Kayıtlı Elektronik Posta)</span>
                        <p className="font-mono font-medium text-text">turixon.turizm@hs01.kep.tr</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('turixon.turizm@hs01.kep.tr', 'KEP adresi')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-3">
                      <Phone className="text-primary shrink-0" size={18} />
                      <div>
                        <span className="text-muted block uppercase tracking-wider text-[10px]">Doğrudan Telefon Hattı</span>
                        <a href="tel:+905524634140" className="font-medium text-text hover:text-primary transition-colors">
                          +90 552 463 41 40
                        </a>
                      </div>
                    </div>
                    <a
                      href="tel:+905524634140"
                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-colors text-[11px]"
                    >
                      Ara
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Contracts Grid */}
          <div className="border-t border-border/50 pt-14">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-text mb-2">Yasal Sözleşmeler ve Kullanıcı Hakları</h3>
              <p className="text-xs sm:text-sm text-muted">
                Platformumuzdaki tüm kullanıcı hakları, telif korumaları ve satış şartları yasal metinlerle teminat altındadır.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {legalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-text group-hover:text-primary transition-colors mb-1 flex items-center justify-between">
                      <span>{link.title}</span>
                      <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h4>
                    <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">{link.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. YARDIM & DESTEK MERKEZİ (PROFESYONEL AYRI BÖLÜM)
         ───────────────────────────────────────────────────────────── */}
      <section id="yardim" className="relative w-full py-24 px-4 sm:px-6 md:px-12 bg-blue-500/[0.03] border-t border-border/50 scroll-mt-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <LifeBuoy size={14} />
              <span>Yardım & Destek Masası</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl font-black text-text mb-4 tracking-tight">
              Yardıma mı İhtiyacınız Var?
            </Typography>
            <Typography variant="body" className="text-muted text-base max-w-2xl mx-auto">
              Aklınıza takılan bir soru mu var, teknik bir sorunla mı karşılaştınız veya platformumuz için bir öneriniz mi var? Destek ekibimiz her zaman yanınızda.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Destek Sayfası */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LifeBuoy size={24} />
                </div>
                <h4 className="text-base font-bold text-text mb-1">Online Destek Talebi</h4>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Doğrudan destek bilet formumuzu doldurarak bize ulaşın; ekibimiz size e-posta üzerinden hızlıca geri dönsün.
                </p>
              </div>
              <Link
                href="/support"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Destek Formuna Git</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Yazar Akademisi */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap size={24} />
                </div>
                <h4 className="text-base font-bold text-text mb-1">Yazar Akademisi (Academy)</h4>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Kurgu oluşturma, evren mimarisi, bölüm kancaları ve Readixon stüdyo rehberlerini ücretsiz olarak inceleyin.
                </p>
              </div>
              <Link
                href="/studio/academy"
                className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Akademiye Göz At</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            {/* Doğrudan İletişim */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-green-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <h4 className="text-base font-bold text-text mb-1">Kurumsal İletişim Hattı</h4>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Mesai saatleri içerisinde resmi telefon hattımızdan veya e-posta yoluyla bize doğrudan ulaşabilirsiniz.
                </p>
              </div>
              <a
                href="tel:+905524634140"
                className="w-full py-2.5 px-4 rounded-xl bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>+90 552 463 41 40</span>
                <Phone size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. CALL TO ACTION (CTA) HERO BANNER
         ───────────────────────────────────────────────────────────── */}
      <section id="katil" className="relative w-full shrink-0 py-16 sm:py-24 px-4 sm:px-6 md:px-12 scroll-mt-28">
        <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-purple-700 text-white p-8 sm:p-14 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 min-h-[380px] overflow-hidden">
          {/* Subtle Ambient Shapes Inside Banner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white mb-4">
              <Sparkles size={14} />
              Kelimelerin Gücüyle Kendi Dünyanı İnşa Et
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 text-white">
              Edebiyatın Geleceğine <br />Bugün Katılın
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-8">
              İster bir yazar olarak kendi evreninizi ve kurgularınızı kurup kazanç elde edin, ister bir okuyucu olarak spoiler korumalı atmosferik hikayelerin tadını çıkarın.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-primary font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center gap-2"
              >
                <span>Hemen Ücretsiz Katıl</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/studio"
                className="px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded-2xl transition-all duration-300 backdrop-blur-md flex items-center gap-2"
              >
                <Feather size={18} />
                <span>Yazmaya Başla</span>
              </Link>
            </div>
          </div>

          {/* Mascot */}
          <div className="relative z-10 flex flex-col items-center shrink-0">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 about-floating-element">
              <Image
                src="/cekirix.png"
                alt="Readixon Cekirix"
                fill
                sizes="208px"
                className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                priority
              />
            </div>
            <span className="text-xs font-bold text-white/80 mt-2">Çekirix • Edebi Yoldaşınız</span>
          </div>
        </div>
      </section>

    </div>
  );
}
