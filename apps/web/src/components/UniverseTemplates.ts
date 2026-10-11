import type { 
  UniverseGenre,
  UniverseVisibility,
  UniversePowerSystem,
  UniverseLocation,
  LocationType,
  UniverseCanonRule,
  UniverseOrganization
} from '@readixon/core';

export interface UniverseStarterData {
  powerSystem?: {
    name: string;
    corePrinciples: string;
    source: string;
    rulesAndLimits: string;
    costAndRisks: string;
  };
  location?: {
    name: string;
    type: LocationType;
    description: string;
    climate?: string;
  };
  canonRule?: {
    title: string;
    category: 'magic_system' | 'cosmology' | 'biological' | 'historical' | 'societal' | 'do_not_repeat';
    ruleDescription: string;
    isStrict: boolean;
    consequences?: string;
  };
  organization?: {
    name: string;
    type: 'kingdom' | 'empire' | 'guild' | 'school' | 'cult' | 'corporation' | 'family' | 'secret_society' | 'army' | 'other';
    description: string;
    ideology?: string;
  };
}

export interface UniverseTemplate {
  id: string;
  title: string;
  genre: UniverseGenre;
  tagline: string;
  suggestedTitle: string;
  description: string;
  icon: string; // Emoji or Lucide name
  color: string;
  bgGrad: string;
  border: string;
  starterData?: UniverseStarterData;
}

export const UNIVERSE_TEMPLATES: UniverseTemplate[] = [
  {
    id: 'high_fantasy',
    title: 'Yüksek Fantastik (High Fantasy)',
    genre: 'fantasy',
    tagline: 'Kadim Rünler, Ejderha Sancakları & Epik Krallıklar',
    suggestedTitle: 'Eldoria: Kadim Krallıklar & Ejder Sancağı',
    description: 'Kadim tanrıların göğe çekildiği, rün büyüsünün ve ejderha kanının soyları yönettiği, kılıç ve büyüyle örülü epik bir yüksek fantastik dünya.',
    icon: '🏰',
    color: 'text-amber-400',
    bgGrad: 'from-amber-950/30 via-card to-card',
    border: 'border-amber-500/30',
    starterData: {
      powerSystem: {
        name: 'Rünik Element Büyüsü',
        corePrinciples: 'Kelimeler ve antik rünler ham kozmik enerjiyi belirli element formlarına dönüştürür.',
        source: 'Yerkürenin altındaki leylihatları (Ley Lines) ve antik kristaller.',
        rulesAndLimits: 'Rün havaya doğru açıyla çizilmeden büyü odaklanamaz. Bir rün en fazla 3 dakika tutulabilir.',
        costAndRisks: 'Aşırı enerji çekimi büyücünün kan damarlarını yakar ve kalıcı rün izleri bırakır.',
      },
      location: {
        name: 'Ak Kule Başkenti (Valerion)',
        type: 'building',
        description: 'Uçurum kenarındaki beyaz mermer kuleleri ve gökyüzü limanıyla yedi krallığın kalbi.',
        climate: 'Ilıman, rüzgârlı ve dağ esintili.',
      },
      canonRule: {
        title: 'Ölüler Asla Diriltilemez',
        category: 'magic_system',
        ruleDescription: 'Hiçbir büyü veya ilahi müdahale yaşamını yitirmiş bir bilinci bedenine geri getiremez.',
        isStrict: true,
        consequences: 'Nekromansi denemesi yapan kişinin ruhu arafta parçalanır ve çevre 100 yıl boyunca çoraklaşır.',
      },
      organization: {
        name: 'Gümüş Muhafızlar Yüksek Loncası',
        type: 'guild',
        description: 'Büyücüler ile şövalyelerin ortak koruma yemini ettiği bağımsız adalet birliği.',
        ideology: 'Düzenin ve zayıfların korunması, kralın üzerinde tutulan adalet.',
      },
    },
  },
  {
    id: 'cyberpunk',
    title: 'Siberpunk & Distopya (Cyberpunk)',
    genre: 'sci-fi',
    tagline: 'Neon Işıklar, Megakorporasyonlar & Sentetik Bilinç',
    suggestedTitle: 'Neo-Konstantin: Neon & Çelik 2099',
    description: 'Gökyüzünün asit yağmurlarıyla yıkandığı, mega şirketlerin devletlerin yerini aldığı, sibernetik protezlerin ve yapay zekaların sokakları ele geçirdiği karanlık gelecek.',
    icon: '🏙️',
    color: 'text-purple-400',
    bgGrad: 'from-purple-950/30 via-card to-card',
    border: 'border-purple-500/30',
    starterData: {
      powerSystem: {
        name: 'Nöro-İmplant & Siber-Savaş Donanımı',
        corePrinciples: 'Omuriliğe entegre edilen nöro-çiplerle refleksleri aşırı hızlandırma ve kablosuz sistemleri hackleme.',
        source: 'Yüksek kapasiteli mikroyongalar ve sıvı lityum bataryalar.',
        rulesAndLimits: 'Saniyede kaldırabileceği maksimum veri akışı aşılırsa beyin omurilik sıvısı kaynar.',
        costAndRisks: 'Siber-Psikoz: Çok fazla makineleşen birey insan duygularını ve empatiyi tamamen kaybeder.',
      },
      location: {
        name: 'Alt Sektör: 9. Neon Çarşısı',
        type: 'city',
        description: 'Gökdelenlerin gölgesinde kalan, karaborsacıların ve korsan sibernetik cerrahların merkezi.',
        climate: 'Sürekli asit yağmuru, duman ve neon yansımaları.',
      },
      canonRule: {
        title: 'Bilinç Kopyalaması Ruh Çöküşüne Yol Açar',
        category: 'cosmology',
        ruleDescription: 'İnsan bilinci dijital ortama aktarılabilir ancak 30 günden fazla kopyada kalamaz; veri yozlaşması kaçınılmazdır.',
        isStrict: true,
        consequences: 'Kopya varlık bir süre sonra delilerek kendi sunucusunu yakar.',
      },
      organization: {
        name: 'Aegis Nöro-Teknoloji Konglomeratı',
        type: 'corporation',
        description: 'Şehrin tüm enerji, güvenlik ve sağlık altyapısını tekelinde tutan acımasız mega-şirket.',
        ideology: 'İnsanlık kusurludur; makinelerle optimize edilmelidir.',
      },
    },
  },
  {
    id: 'dark_academia',
    title: 'Karanlık Akademi & Gotik Gizem',
    genre: 'hybrid',
    tagline: 'Yasak Kütüphaneler, Lanetli Ayinler & Gotik Sırlar',
    suggestedTitle: 'Blackwood Akademisi & Lanetli Parşömenler',
    description: 'Sisli tepelerdeki yüzyıllık kütüphanelerde yasak ilimlerin fısıldandığı, antik tarikatların ve çözülememiş cinayetlerin kol gezdiği gotik gizem dünyası.',
    icon: '🕯️',
    color: 'text-indigo-400',
    bgGrad: 'from-indigo-950/30 via-card to-card',
    border: 'border-indigo-500/30',
    starterData: {
      powerSystem: {
        name: 'Yasak İlimler & Gölge Simyası',
        corePrinciples: 'Antik Yunanca ve Latince parşömenlerdeki yasak ritüelleri çözerek zihinsel illüzyonlar yaratma.',
        source: 'Unutulmuş arşivler ve astronomik tutulma döngüleri.',
        rulesAndLimits: 'Yalnızca gece vakti ve mum ışığında icra edilebilir.',
        costAndRisks: 'Hafıza yitimi: Büyüyü öğrenen kişi en değerli çocukluk anılarını birer birer unutur.',
      },
      location: {
        name: 'Kayıp Elyazmaları Kütüphanesi (13. Kat)',
        type: 'building',
        description: 'Mimari planlarda var olmayan, sadece gece yarısı beliren labirent kütüphane.',
        climate: 'Eski kâğıt kokusu, toz ve ölümcül sessizlik.',
      },
      canonRule: {
        title: 'Gece Yarısından Sonra Kütüphanenin Aynalarına Bakılamaz',
        category: 'magic_system',
        ruleDescription: 'Kütüphanedeki dev Venedik aynaları gece yarısı diğer taraftaki varlıkları yansıtır.',
        isStrict: true,
        consequences: 'Aynaya bakan kişinin gölgesi camın içine çekilir ve bedeni kuklaya döner.',
      },
      organization: {
        name: 'Kuzgun Kardeşliği Cemiyeti',
        type: 'secret_society',
        description: 'Akademinin en parlak 7 öğrencisi tarafından kurulan gizli okült cemiyet.',
        ideology: 'Hakikat halkın kaldıramayacağı kadar ağırdır; yalnızca seçkinler taşımalıdır.',
      },
    },
  },
  {
    id: 'dynasty_history',
    title: 'Tarihsel Kurmaca & Hanedanlık (Dynasty)',
    genre: 'historical',
    tagline: 'Taht Entrikaları, Feodal İttifaklar & Kan Davası',
    suggestedTitle: 'Kurtlar Hanedanı: Kan & Demir Çağı',
    description: 'Veraset krizinin imparatorluğu iç savaşa sürüklediği, feodal beylerin entrikalarla tahtı paylaştığı, kılıçların ve onurun çarpıştığı gerçekçi tarihsel kurgu.',
    icon: '⚔️',
    color: 'text-rose-400',
    bgGrad: 'from-rose-950/30 via-card to-card',
    border: 'border-rose-500/30',
    starterData: {
      powerSystem: {
        name: 'Hanedan Askeri Doktrini & Çelik Ustalığı',
        corePrinciples: 'Ağır süvari disiplini, istihbarat ağları ve kuşatma mühendisliği.',
        source: 'Demircilik gelenekleri ve hanedan vergileri.',
        rulesAndLimits: 'Lojistik hatları kesilirse ordu en fazla 15 gün dayanabilir.',
        costAndRisks: 'Savaşın maliyeti hazineyi tüketir ve köylü isyanlarını körükler.',
      },
      location: {
        name: 'Demir Hisar (Kraliyet Kalesi)',
        type: 'building',
        description: 'Üç büyük kuşatmadan sağ çıkmış, dev hendeklerle çevrili zaptedilemez taht merkezi.',
        climate: 'Kuzey rüzgârları, taş soğukluğu ve kış fırtınaları.',
      },
      canonRule: {
        title: 'Taht Veraseti Yalnızca Meşru Kan Bağıyla Sağlanır',
        category: 'societal',
        ruleDescription: 'Kral ölürse taht ilk doğan erkek evlada, yoksa sırasıyla hanedan konseyi kararıyla geçer.',
        isStrict: true,
        consequences: 'Gayrimeşru taht iddiası anında yedi bölgede iç savaşı başlatır.',
      },
      organization: {
        name: 'Demir Taç Yeminlileri',
        type: 'army',
        description: 'Doğumdan itibaren hükümdarı korumak için yetiştirilen seçkin muhafız birliği.',
        ideology: 'Kral kim olursa olsun taca mutlak sadakat.',
      },
    },
  },
  {
    id: 'blank',
    title: 'Boş Evren (Sıfırdan Başla)',
    genre: 'fantasy',
    tagline: 'Beyaz Tuval: Kendi Kurallarını Kendin Yaz',
    suggestedTitle: 'Yeni Bir Kurgusal Evren',
    description: 'Önceden doldurulmuş şablon istemeyen, tamamen özgürce kendi kurgusunu adım adım inşa etmek isteyen yazarlar için.',
    icon: '📝',
    color: 'text-muted',
    bgGrad: 'from-card via-card to-background',
    border: 'border-border/60',
  },
];
