import { AcademyLesson, LearningPath, AcademyCategory, AcademyBadge } from './types';

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'starting',
    title: 'Yazarlığa Başlangıç',
    shortTitle: 'Başlangıç',
    tagline: 'Fikirden Hikâyeye İlk Adım',
    description: 'Yazmaya yeni başlıyorsan nereden başlayacağını, bir fikrin nasıl kurgusal hikâyeye dönüştürüleceğini ve temel yapı taşlarını öğren.',
    badge: 'Temel Seviye',
    iconName: 'Compass',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    lessonIds: ['story-foundations', 'idea-vs-story', 'logline-mastery', 'target-audience', 'premise-planning']
  },
  {
    id: 'novel',
    title: 'Roman Akademisi',
    shortTitle: 'Roman',
    tagline: 'Kurgu Mimarisi & Sürükleyici Bölümler',
    description: 'Büyük resmi gör. Üç perde yapısı, sahne mühendisliği, güçlü bölüm açılışları, tempo yönetimi ve tatmin edici finaller.',
    badge: 'Kapsamlı Program',
    iconName: 'BookOpen',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    lessonIds: ['three-act-structure', 'scene-anatomy', 'chapter-hooks', 'cliffhanger-art', 'plot-twist-engineering', 'final-resolution']
  },
  {
    id: 'webtoon',
    title: 'Webtoon Akademisi',
    shortTitle: 'Webtoon',
    tagline: 'Dikey Akış, Panel Dengesi ve Mobil Deneyim',
    description: 'Webtoon roman değildir; görsel tempo sanatıdır. Dikey kaydırma ergonomisi, panel boyutları, beyaz boşluk kullanımı ve balon yerleşimi.',
    badge: 'Görsel Anlatım',
    iconName: 'Layers',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    lessonIds: ['webtoon-vertical-flow', 'webtoon-pacing-whitespace', 'webtoon-speech-bubbles', 'webtoon-visual-cliffhanger']
  },
  {
    id: 'series',
    title: 'Seri & Evren Kuruculuğu',
    shortTitle: 'Seri & Evren',
    tagline: 'Çok Kitaplı Kurgu & Series Bible',
    description: 'Hikâyeni tek kitaba sığdıramayanlar için: Evren kuralları, Series Bible (seri defteri) tutma, devamlılık hatalarından kaçınma ve uzun vadeli gizemler.',
    badge: 'İleri Seviye',
    iconName: 'Sparkles',
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    lessonIds: ['series-bible-guide', 'character-continuity', 'long-term-payoffs']
  }
];

export const ACADEMY_CATEGORIES: AcademyCategory[] = [
  {
    id: 'engineering',
    title: 'Hikâye Mühendisliği & Kurgu',
    description: 'Çatışma, stakes, dönüm noktaları ve kurgu sihirbazı teknikleri.',
    iconName: 'Target',
    color: 'text-amber-500'
  },
  {
    id: 'character',
    title: 'Karakter & Psikoloji',
    description: 'İstek vs ihtiyaç, kusurlar, inandırıcı antagonistler ve Karakter Defteri.',
    iconName: 'Users',
    color: 'text-blue-500'
  },
  {
    id: 'dialogue',
    title: 'Diyalog & Alt Metin',
    description: 'Doğal konuşmalar, alt metin, gerilim ve karaktere özgü sesler.',
    iconName: 'MessageSquare',
    color: 'text-emerald-500'
  },
  {
    id: 'worldbuilding',
    title: 'Dünya Kurma (Worldbuilding)',
    description: 'Iceberg yöntemi, büyü/teknoloji sınırları ve evren tutarlılığı.',
    iconName: 'Globe',
    color: 'text-cyan-500'
  },
  {
    id: 'style',
    title: 'Dil, Üslup & Show Don\'t Tell',
    description: 'Duyguları dikte etmeden yaşatma, cümle ritmi ve atmosfer yaratma.',
    iconName: 'PenLine',
    color: 'text-purple-500'
  },
  {
    id: 'webtoon',
    title: 'Webtoon & Görsel Ritim',
    description: 'Dikey kaydırma matematiği, panel boyutu ve mobil okunabilirlik.',
    iconName: 'Layers',
    color: 'text-teal-500'
  },
  {
    id: 'editing',
    title: 'Editörlük & Taslak Yönetimi',
    description: 'İlk taslak cesareti, ikinci taslak kontrolü ve 8 kriterli editör değerlendirmesi.',
    iconName: 'Scissors',
    color: 'text-rose-500'
  },
  {
    id: 'publishing',
    title: 'Dijital Yayınlama & Okur Kazanma',
    description: 'Kapak, önsöz/arka kapak, okuma devamlılığı ve Readix sosyal etkileşimi.',
    iconName: 'Rocket',
    color: 'text-violet-500'
  },
  {
    id: 'routine',
    title: 'Yazma Rutini & Edebi Arena',
    description: 'Tıkanıklığı aşmak, düzenli yazma alışkanlığı ve arenada düello pratikleri.',
    iconName: 'Swords',
    color: 'text-orange-500'
  },
  {
    id: 'tools',
    title: 'Readixon Studio Araçları',
    description: 'Kurgu Sihirbazı, Karakter Defteri, Bölüm Sonu Anketleri ve AI Asistanı.',
    iconName: 'Wand2',
    color: 'text-pink-500'
  }
];

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // ── 1. YAZARLIĞA BAŞLANGIÇ ──
  {
    id: 'story-foundations',
    title: 'Hikâye Nedir? Formülü Çözmek',
    summary: 'Bir hikâye yalnızca olayların peş peşe dizilmesi değildir. Temel 5\'li denklemi keşfet.',
    pathId: 'starting',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'Başlangıç',
    durationMinutes: 5,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Pek çok yeni yazar harika fikirlerle yola çıkar ancak sayfalar dolusu olay yazmasına rağmen okuyucu sürüklenmez. Çünkü olaylar silsilesi ile hikâye aynı şey değildir.',
    coreConcepts: [
      {
        heading: 'Hikâyenin Temel Formülü',
        body: 'Karakter + Amaç + Engel + Çatışma + Değişim/Sonuç = Hikâye. Bu bileşenlerden biri eksik olduğunda metin bir hikâye olmaktan çıkar, sadece bir durum raporuna veya günlüğe dönüşür.'
      },
      {
        heading: 'Olay vs. Hikâye Farkı',
        body: '"Ali sabah uyandı, kahvaltı etti, işe gitti ve akşam eve döndü" bir olaylar dizisidir. "Ali hayatının en önemli iş görüşmesine yetişmek zorundaydı fakat tek parasını kapıda bayılan bir yabancıya ilaç almak için harcadı" ise bir hikâyedir.'
      }
    ],
    comparison: {
      weakTitle: 'Sadece Olay Bildiren Başlangıç',
      weak: 'Selin üniversiteye gitmek istiyordu. Çok ders çalıştı ve sınav günü geldi çattı. Sınavdan yüksek puan aldı.',
      strongTitle: 'Çatışma ve Seçim İçeren Hikâye Başlangıcı',
      strong: 'Selin üniversite hayaliyle kasabadan ayrılmak zorundaydı; fakat arkasında bakıma muhtaç annesini bırakırsa ailesinin tek geçim kaynağı olan zeytinlik elden çıkacaktı.',
      reason: 'Güçlü örnekte karakter sadece bir şey istemiyor; amacının karşısında somut bir bedel ve vicdani çatışma bulunuyor.'
    },
    proTip: 'Karakterine bir şey istetiyorsan, bunu elde etmesini hayatının en zor kararı hâline getir.',
    studioTask: {
      title: 'Hikâyeni Tek Cümlede Tanımla',
      description: 'Studio\'da bir taslak hikaye aç veya var olan bir hikayenin özetine bu formülü (Karakter + Amaç + Engel) tek cümlede yaz.',
      actionLabel: 'Studio Hikayelerine Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Aşağıdakilerden hangisi bir hikâyeyi "sadece olay sıralaması" olmaktan çıkaran en temel unsurdur?',
      options: [
        'Karakterin fiziksel görünümünün çok detaylı anlatılması',
        'Karakterin amacına ulaşırken bir engelle ve seçimle karşılaşması',
        'Bölümün en az 3000 kelime olması',
        'Metinde çok fazla yan karakter bulunması'
      ],
      correctAnswerIndex: 1,
      explanation: 'Hikâyenin motoru, karakterin istediği şey ile arasına giren engel ve bu engeli aşarken ödemek zorunda kaldığı bedeldir.'
    },
    keyTakeaways: [
      'Olaylar zinciri hikâye değildir; çatışma hikâyedir.',
      'Karakterin amacı ne kadar netse, hikâyenin yönü o kadar belirgindir.',
      'Her hikaye bir değişim vaat eder.'
    ]
  },
  {
    id: 'idea-vs-story',
    title: 'Fikir ile Hikâye Arasındaki Fark',
    summary: 'Aklına gelen harika bir konsept neden tek başına hikâye sayılmaz? Fikri ete kemiğe büründür.',
    pathId: 'starting',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'Başlangıç',
    durationMinutes: 6,
    xp: 50,
    introduction: '"Rüyaların devlet tarafından kaydedildiği bir dünya!" Bu harika bir fikirdir. Fakat bu haliyle henüz bir hikâye değildir. Fikir bir tohumdur; hikâye ise o tohumdan büyüyen canlı organizmadır.',
    coreConcepts: [
      {
        heading: 'Fikir Bir Dünya Durumudur',
        body: 'Fikir çoğunlukla bir "Ne olurdu?" (What if?) sorusudur. Bir arka plan veya kural tanımlar. Fakat okuyucu bir dünya kuralına değil, o kuralın içinde acı çeken, sevinen, mücadele eden bir karaktere bağlanır.'
      },
      {
        heading: 'Fikri Hikâyeye Dönüştüren Özgüllük',
        body: 'Fikrin içine belirli bir karakter, o karakterin kişisel tehlikesi ve geri dönülmez bir karar soktuğun an hikâye başlar.'
      }
    ],
    comparison: {
      weakTitle: 'Sadece Fikir (Konsept)',
      weak: 'İnsanların yalan söylediğinde gözlerinin renginin değiştiği fantastik bir krallık.',
      strongTitle: 'Karakterize Edilmiş Hikâye',
      strong: 'Yalan söyleyince göz renginin değiştiği krallıkta, doğuştan kör olan kraliyet casusu, kraliçenin kendi kızını zehirlediğini tek başına kanıtlamak zorundadır.',
      reason: 'Fikir bir kuraldı; hikâye ise o kuralın en savunmasız kaldığı veya kuralı zorlayan karakterin kişisel mücadelesi oldu.'
    },
    proTip: 'Bulduğun havalı dünya kuralını düşün ve şu soruyu sor: "Bu kural bu dünyada en çok kime zarar verir?" Cevap senin ana karakterindir.',
    studioTask: {
      title: 'Kurgu Sihirbazında Başlangıç',
      description: 'Kurgu Sihirbazı Modül A\'ya git ve karakterinin içsel durumu ile başlangıç kancasını tanımla.',
      actionLabel: 'Kurgu Sihirbazına Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: '"Zaman yolculuğunun keşfedildiği bir gelecek" ifadesi neden tek başına bir hikâye değildir?',
      options: [
        'Zaman yolculuğu klişe bir tema olduğu için',
        'Belirli bir karakterin amacı, engeli ve kişisel çatışması henüz bulunmadığı için',
        'Bilimsel açıklaması yapılmadığı için',
        'Diyalog içermediği için'
      ],
      correctAnswerIndex: 1,
      explanation: 'Bu yalnızca bir ortam/konsept fikridir; karakter ve kişisel bir mücadele eklenmeden hikâye haline gelemez.'
    },
    keyTakeaways: [
      'Fikir ortamı kurar, karakter hikâyeyi taşır.',
      'Dünya kuralını en çok zorlayacak karakteri seç.',
      'Soyut konseptleri kişisel çıkmazlara dönüştür.'
    ]
  },
  {
    id: 'logline-mastery',
    title: 'Logline Yazmak: Eserini Tek Cümlede Sat',
    summary: 'Okuyucu ve editörün dikkatini 5 saniyede yakalayan kusursuz tek cümlelik hikâye özeti.',
    pathId: 'starting',
    category: 'Dijital Yayınlama & Okur Kazanma',
    level: 'Başlangıç',
    durationMinutes: 7,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Birisi sana "Kitabın ne hakkında?" diye sorduğunda 10 dakika boyunca olayları anlatıyorsan, hikâyenin omurgasını henüz netleştirememişsin demektir. Logline, hikâyenin DNA\'sıdır.',
    coreConcepts: [
      {
        heading: 'Altın Logline Formülü',
        body: '[Tetikleyici Olay] sonrasında [Kusurlu Baş Karakter], [Büyük Amaç]\'a ulaşmak zorundadır, aksi takdirde [Büyük Bedel/Stakes] gerçekleşecektir.'
      },
      {
        heading: 'Readixon Kapak & Arka Kapak Uyumu',
        body: 'Readixon\'da eserin arka kapak özetinin ilk cümlesi logline olmalıdır. Keşfet sayfasında dolaşan okur bu cümleye göre tıklama kararı verir.'
      }
    ],
    comparison: {
      weakTitle: 'Zayıf & Belirsiz Açıklama',
      weak: 'Murat\'ın dramatik hayatı, aşkları ve başına gelen gizemli olayları anlatan soluksuz bir roman.',
      strongTitle: 'Çarpıcı Logline',
      strong: 'Babasının ölümünden sonra terk ettiği sahil kasabasına dönen bir adli tabip, babasının otopsisinde kendi çocukluk anılarını yalanlayan bir kanıt bulunca cinayeti tek başına çözmek zorundadır.',
      reason: 'Güçlü logline kim olduğunu, ne aradığını ve neden şimdi harekete geçtiğini net gösterir.'
    },
    proTip: 'Logline yazarken karakter isimlerini (Ali, Ayşe) kullanmak yerine onların meslek veya belirleyici sıfatlarını ("şüpheci dedektif", "hafızasını kaybeden suikastçı") kullan.',
    studioTask: {
      title: 'Arka Kapak Yazını Güncelle',
      description: 'Studio > Kitap Düzenle ekranına git ve Arka Kapak (Back Cover) alanının ilk satırına logline\'ını yerleştir.',
      actionLabel: 'Kitaplarımı Yönet',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'İyi bir logline\'da kesinlikle bulunması gereken hayati bileşen hangisidir?',
      options: [
        'Kitabın kaç bölüm süreceği',
        'Karakterin neyi riske attığı (Büyük bedel / Stakes)',
        'Hikâyenin sürpriz finali (Plot twist)',
        'Bütün yan karakterlerin isimleri'
      ],
      correctAnswerIndex: 1,
      explanation: 'Stakes (risk/bedel) olmazsa okur karakterin amaca ulaşıp ulaşmamasını umursamaz.'
    },
    keyTakeaways: [
      'Logline hikayenin omurgasını tek cümlede özetler.',
      'Karakter + Tetikleyici + Amaç + Bedel formülünü uygula.',
      'Readixon özetlerinde ilk satırda merak uyandır.'
    ]
  },
  {
    id: 'target-audience',
    title: 'Hedef Okur Kimdir? Kime Yazıyorsun?',
    summary: 'Herkese yazılan bir kitap hiç kimseye hitap etmez. Tür ve okur beklentilerini doğru yönet.',
    pathId: 'starting',
    category: 'Dijital Yayınlama & Okur Kazanma',
    level: 'Başlangıç',
    durationMinutes: 5,
    xp: 50,
    introduction: 'Korku okuru tedirginlik ve tekinsizlik arar. Romantik okuru iki karakter arasındaki elektrik ve yakınlaşma temposunu ister. Tür yalnızca bir etiket değil, okurla arandaki sözleşmedir.',
    coreConcepts: [
      {
        heading: 'Tür Vaadi (Genre Promise)',
        body: 'Eğer kitabını "Gizem/Polisiye" olarak etiketlediysen okuyucuya bir suç ve adil ipuçları vaat edersin. Ortada suç yoksa veya suç gökten inen bir büyüyle çözülürse okur kandırılmış hisseder.'
      },
      {
        heading: 'Readixon Etiketleri (Tags) Stratejisi',
        body: 'Readixon\'da 20 tane alakasız etiket girmek yerine eserin gerçek ruhunu yansıtan 3-5 odaklı etiket seçmek doğru kitleye ulaşmanın anahtarıdır.'
      }
    ],
    comparison: {
      weakTitle: 'Dağınık Tür Karmaşası',
      weak: 'Kitapta hem uzay savaşları var, hem vampir aşkı, hem tarihi Osmanlı savaşı, hem de çocuk masalı.',
      strongTitle: 'Odaklı Tür Bileşimi',
      strong: 'Bilimkurgu zemininde geçen psikolojik gerilim: Uzay istasyonunda sıkışan 3 astronot arasındaki güven çatışması.',
      reason: 'Belirli bir türün dinamiklerine odaklanarak o türün tutkulu okurunu doğrudan yakalar.'
    },
    proTip: 'Okurunun yaş grubunu, okuma hızını ve hangi türdeki duyguyu aradığını önceden hayal et.',
    studioTask: {
      title: 'Etiket ve Kategori İncelemesi',
      description: 'Studio\'daki eserine girip tür ve etiketlerini gözden geçir; +18 içerik filtresinin doğruluğunu teyit et.',
      actionLabel: 'Eserlerimi İncele',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Yazarlıkta "Tür Vaadi" (Genre Promise) ne anlama gelir?',
      options: [
        'Kitabın kapak resminin mutlaka o türe özel çizilmesi',
        'Okurun belirli bir türe başlarken beklediği temel duygu ve kuralların yazar tarafından karşılanması',
        'Yazarın asla başka bir türde yazamayacağı kuralı',
        'Kitabın her gün yeni bölüm yayınlayacağı garantisi'
      ],
      correctAnswerIndex: 1,
      explanation: 'Tür vaadi, okuyucunun o kategoriyi seçerken yaşamak istediği duygusal deneyim taahhüdüdür.'
    },
    keyTakeaways: [
      'Her türe hitap etmeye çalışan eser kimseye ulaşamaz.',
      'Tür beklentilerine saygı duy, klişeleri ise yenile.',
      'Doğru etiketleme sadık okuyucu kazandırır.'
    ]
  },
  {
    id: 'premise-planning',
    title: 'İlk Eserini Planlamak: Haritayı Çiz',
    summary: 'Planlı yazarlık (Plotter) ve keşfederek yazarlık (Pantser). Sen hangi yoldasın?',
    pathId: 'starting',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'Başlangıç',
    durationMinutes: 8,
    xp: 50,
    introduction: 'Kimi yazar her sahneyi baştan mimar gibi çizer (Plotter), kimi ise karakteri sahneye bırakıp nereye gideceğini keşfeder (Pantser). Ancak en özgür yazar bile gideceği yönü bilmelidir.',
    coreConcepts: [
      {
        heading: 'Asgari Planlama İlkeleri',
        body: 'Yazmaya başlamak için 500 sayfalık notlara ihtiyacın yok. Sadece 4 şeyi bilmelisin: 1) Başlangıç nerede? 2) İlk büyük kriz ne? 3) Karakter nerede dibe vuracak? 4) Hikaye nasıl bir zafer veya trajediyle bitecek?'
      },
      {
        heading: 'Orta Bölüm Tıkanıklığının Önüne Geçmek',
        body: 'Yazarların %80\'i 5. veya 10. bölümde tıkanır. Çünkü başlangıç ve final belliyken oraya nasıl gidileceğine dair hiçbir basamak düşünülmemiştir.'
      }
    ],
    comparison: {
      weakTitle: 'Plansız & Tıkanmaya Mahkum Başlangıç',
      weak: '"Harika bir fikir aklıma geldi, hemen birinci bölümü yazayım, devamına sonra bakarız!"',
      strongTitle: 'Esnek Ama Rotası Olan Başlangıç',
      strong: '"Başlangıçta karakterin ailesi rehin alınıyor, orta noktada en yakın dostunun hain olduğunu öğrenecek, sonda ise intikam almak ile affetmek arasında seçim yapacak."',
      reason: 'Yazar yol boyunca detayları özgürce keşfetse bile asla yön duygusunu kaybetmez.'
    },
    proTip: 'Final sahnesini bilmeden yola çıkma. Finali bilmek, hikayedeki tüm sahnelerin oraya doğru akmasını sağlar.',
    studioTask: {
      title: 'Kurgu Sihirbazı Modül D: Final',
      description: 'Hikayen için Kurgu Sihirbazı Modül D (Final Planlayıcı) alanına git ve karakterinin sonda ödeyeceği bedeli yaz.',
      actionLabel: 'Final Planlayıcıya Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Yazarların genellikle romanın ortasında (5-10. bölümlerde) tıkanmasının en yaygın sebebi nedir?',
      options: [
        'Kelimelerin tükenmesi',
        'Karakterin başlangıçtan finale giderken aşması gereken ara dönüm noktalarının ve engellerin planlanmamış olması',
        'Editörün yazı fontunu beğenmemesi',
        'Bölümün çok kısa olması'
      ],
      correctAnswerIndex: 1,
      explanation: 'Orta bölüm krizinin sebebi, başlangıç heyecanının sönmesi ve finale bağlayacak ara basamakların belirsiz olmasıdır.'
    },
    keyTakeaways: [
      'Finali bilmek pusulaya sahip olmaktır.',
      'Aşırı plan boğabilir, sıfır plan ise tıkar.',
      'Hedefe giden 3-4 kilit istasyon belirle.'
    ]
  },

  // ── 2. ROMAN AKADEMİSİ ──
  {
    id: 'three-act-structure',
    title: 'Üç Perde Yapısı: Edebi Omurga',
    summary: 'Aristoteles\'ten modern çok satanlara: Giriş, Gelişme ve Sonuç perdesinin gizli mekaniği.',
    pathId: 'novel',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'Orta',
    durationMinutes: 10,
    xp: 60,
    introduction: 'Üç perde yapısı bir şablon değil, insan beyninin bir çatışmayı ve değişimi anlama biçimidir. Dünya kurulur, düzen bozulur, mücadele verilir ve yeni bir düzen kurulur.',
    coreConcepts: [
      {
        heading: 'Perde 1: Kurulum & Tetikleyici Olay (%0 - %25)',
        body: 'Karakterin normal dünyası gösterilir. Ardından "Tetikleyici Olay" (Inciting Incident) gelir ve eski düzeni imkansız kılar. Karakter geri dönülmez kapıdan geçer.'
      },
      {
        heading: 'Perde 2: Yükselen Çatışma & Ruhun Karanlık Gecesi (%25 - %75)',
        body: 'En uzun bölümdür. Karakter engelleri aşmaya çalışırken durumu daha da berbat eder. Orta noktada büyük bir gerçek öğrenilir. Perde sonunda karakter her şeyi kaybettiğini hisseder (All is lost).'
      },
      {
        heading: 'Perde 3: Zirve Noktası (Climax) & Çözüm (%75 - %100)',
        body: 'Büyük yüzleşme. Karakter artık eski haliyle bu savaşı kazanamayacağını anlar; içsel kusurunu yener ve son bir hamleyle nihai bedeli ödeyerek hedefe ulaşır (veya trajedide yok olur).'
      }
    ],
    comparison: {
      weakTitle: 'Monoton Akış (Tetikleyicisiz)',
      weak: 'Karakter 10 bölüm boyunca ofisinde oturur, arkadaşlarıyla kahve içer ve canı sıkılır.',
      strongTitle: 'Tetikleyici ile Bozulan Düzen',
      strong: 'Karakter her zamanki gibi kahvesini yudumlarken, masasına 10 yıl önce öldüğü sanılan eşinin kanlı alyansı bırakılır.',
      reason: 'Eski hayat bir saniyede bitti; karakter artık eski konfor alanında kalamaz.'
    },
    proTip: 'Perde 1\'in sonunda karakterin kendi iradesiyle bir "seçim" yapmasını sağla; olayların kurbanı olarak sürüklenmesin.',
    studioTask: {
      title: 'Kurgu Sihirbazında Yapıyı İncele',
      description: 'Hikayen için Kurgu Sihirbazı Modül A ve B\'yi açarak birinci perdenin tetikleyicisini not et.',
      actionLabel: 'Kurgu Sihirbazına Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: '"Ruhun Karanlık Gecesi" (Dark Night of the Soul) hikâyenin hangi evresinde gerçekleşir?',
      options: [
        'İlk bölümün hemen başında',
        'İkinci perdenin sonunda, zirve yüzleşmeden hemen önce karakterin tüm umutlarını yitirdiği anda',
        'Kitabın teşekkür yazısında',
        'Üçüncü perdenin tam ortasında'
      ],
      correctAnswerIndex: 1,
      explanation: 'Bu an, karakterin eski yöntemlerinin tükendiği ve değişmek zorunda kaldığı en karanlık kırılma noktasıdır.'
    },
    keyTakeaways: [
      'Perde 1 düzeni bozar, Perde 2 bedeli büyütür, Perde 3 hesabı kapatır.',
      'Karakter seçimi olmadan hikâye ilerlemez.',
      'En büyük zafer, en karanlık yenilgiden sonra gelir.'
    ]
  },
  {
    id: 'scene-anatomy',
    title: 'Sahne Anatomisi: Amaç, Engel, Felaket',
    summary: 'Her sahne küçük bir hikâyedir. Sahneye geç girip erken çıkmanın dinamik gücü.',
    pathId: 'novel',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'Orta',
    durationMinutes: 7,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Okuyucu bir sahneyi okurken sıkılıyorsa sebebi tasvirlerin uzunluğu değil, sahnede "hiçbir şeyin tehlikede olmamasıdır". Sahnenin amacı nedir?',
    coreConcepts: [
      {
        heading: 'Altın Sahne Formülü: Amaç → Engel → Felaket / Yeni Durum',
        body: 'Karakter sahneye belirli bir hedefle girer ("şifreyi öğrenmek"). Karşısına bir engel çıkar ("kasa nöbetçisi"). Sahne sonunda hedefi elde etse bile yeni bir felaket patlar ("şifreyi bulur ama alarm çalar ve koridor kilitlenir").'
      },
      {
        heading: 'Sahneye Geç Gir, Erken Çık',
        body: 'Karakterin arabaya binip emniyet kemerini takmasını, trafiği beklemesini anlatma. Kapıyı tekmeyle açtığı anda sahneye gir; istediği cevabı aldığı an sahneyi kes.'
      }
    ],
    comparison: {
      weakTitle: 'Gereksiz Giriş ve Çıkışlar',
      weak: 'Ahmet sabah alarmı çaldığında uyandı. Terliklerini giyip lavaboya gitti. Aynaya baktı, dişlerini fırçaladı. Sonra kahve koydu. Kapı çaldı.',
      strongTitle: 'Geç Giriş (Hemen Eylemde)',
      strong: 'Kapıdaki üçüncü şiddetli yumrukta Ahmet kahve fincanını tezgaha fırlattı. Silahı çekmecesinden alıp kapı dürbününe yanaştı.',
      reason: 'Gereksiz rutinler atıldı, okur doğrudan merak ve tehlike anına dahil edildi.'
    },
    proTip: 'Sahnenin sonunda karakterin durumu ya daha iyi ya da daha kötüye gitmelidir. Sahne öncesiyle sonrası tamamen aynıysa o sahneyi sil.',
    studioTask: {
      title: 'Kurgu Sihirbazı Modül B: Sahne Yazımı',
      description: 'Studio Kurgu Sihirbazı Modül B\'ye git; karakterin başlangıçtaki içsel durumu ile sahne sonundaki içsel durumu farkını gir.',
      actionLabel: 'Sahne Planlayıcıyı Aç',
      actionUrl: '/studio'
    },
    quiz: {
      question: '"Sahneye geç gir, erken çık" (Enter late, leave early) prensibi neyi hedefler?',
      options: [
        'Bölümlerin 500 kelimeden az olmasını sağlamayı',
        'Gereksiz hazırlık ve vedalaşma detaylarını atarak okuru doğrudan çatışmanın göbeğine sokmayı',
        'Sadece akşam vakti geçen sahneler yazmayı',
        'Karakterin sahneden kaçmasını'
      ],
      correctAnswerIndex: 1,
      explanation: 'Bu kural temposu yüksek, gereksiz gündelik rutinlerden arındırılmış dinamik sahneler üretir.'
    },
    keyTakeaways: [
      'Her sahnede karakterin mikro bir amacı olmalıdır.',
      'Durum değişmiyorsa sahne gereksizdir.',
      'Girişi ve çıkışı kırp, çatışmaya odaklan.'
    ]
  },
  {
    id: 'chapter-hooks',
    title: 'İlk Cümle ve Bölüm Açılışları (Hooks)',
    summary: 'Okuyucuyu ilk satırdan rehin almanın edebi teknikleri. Sıradan açılışlardan kaçın.',
    pathId: 'novel',
    category: 'Dil, Üslup & Show Don\'t Tell',
    level: 'Başlangıç',
    durationMinutes: 6,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Dijital dünyada okuyucunun dikkat süresi saniyelerle ölçülür. Birinci bölümün ilk paragrafı okura ya "bu kitabı sabahlayarak bitireceğim" dedirtir ya da sekmeyi kapattırır.',
    coreConcepts: [
      {
        heading: 'Sıradan Açılış Tuzakları',
        body: '1) Karakterin aynaya bakıp saçını/gözünü tarif etmesi. 2) Çalan alarmla uyanması. 3) Sayfalar dolusu hava durumu tasviri. Bu açılışlar okura hiçbir merak unsuru vermez.'
      },
      {
        heading: 'Kanca (Hook) Çeşitleri',
        body: 'a) Paradoks Kancası: İmkansız bir durumu duyurmak. b) Tehlike Kancası: Karakterin anlık bir tehditle başlaması. c) Çarpıcı İtiraf Kancası: Karakterin gizli bir günahını açık etmesi.'
      }
    ],
    comparison: {
      weakTitle: 'Klasik Ayna Tuzağı',
      weak: 'Sabah güneşi odama sızıyordu. Yataktan kalkıp aynaya baktım. Mavi gözlerim ve dalgalı kumral saçlarım her zamanki gibi dağınıktı.',
      strongTitle: 'Paradoks ve Merak Kancası',
      strong: 'Telefon üçüncü kez çaldığında açmamam gerekirdi; çünkü arayan numara üç yıldır mezarlıkta yatan abime aitti.',
      reason: 'Okur hemen zihninde onlarca soru sormaya başlar: Nasıl arıyor? Kim bu? Ne olacak?'
    },
    proTip: 'İlk cümlende okura bir cevap değil, acil bir soru armağan et.',
    studioTask: {
      title: 'Bölüm Editöründe İlk Cümleni Yenile',
      description: 'Studio > Bölüm Editörü\'ne git ve ilk bölümünün ilk cümlesini merak uyandıracak şekilde yeniden yaz.',
      actionLabel: 'Bölüm Editörüne Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Aşağıdaki ilk cümlelerden hangisi en güçlü "kanca" (hook) etkisine sahiptir?',
      options: [
        'Bugün hava oldukça soğuk ve yağmurluydu.',
        'Kardeşimi öldürdüğüm gün hava pırıl pırıldı, kimse kanın güllerin arasında bu kadar parlak duracağını tahmin edemezdi.',
        'Adım Kerem, yirmi iki yaşındayım ve mühendislik okuyorum.',
        'Sabah saat tam sekizde kahvemi hazırlamak için mutfağa geçtim.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Çarpıcı itiraf, tezatlık ve anında merak duygusu yarattığı için okuru hikâyenin içine kilitler.'
    },
    keyTakeaways: [
      'Aynaya bakma klişesini çöpe at.',
      'İlk cümlede zihinde bir soru işareti ateşle.',
      'Hareketi ve duyguyu beklemeden başlat.'
    ]
  },
  {
    id: 'cliffhanger-art',
    title: 'Cliffhanger Sanatı: "Bir Bölüm Daha!" Dedirtmek',
    summary: 'Okuyucuyu ekran başında sabahlatan 5 farklı bölüm sonu tekniği ve aşırı kullanım riskleri.',
    pathId: 'novel',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'Orta',
    durationMinutes: 7,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Cliffhanger (uçurum kenarında bırakma), dijital tefrika ve serileştirilmiş edebiyatın en büyük silahıdır. Okur bölümü bitirdiğinde "Sonraki Bölüm" butonuna refleks olarak basmalıdır.',
    coreConcepts: [
      {
        heading: '5 Kilit Cliffhanger Türü',
        body: '1. Bilgi Bomba: Beklenmedik bir sırrın açığa çıkması. 2. Fiziksel Tehlike: Karakterin yaşamının pamuk ipliğine bağlı kalması. 3. Duygusal Kırılma: Beklenmedik bir ihanet veya itiraf. 4. İmkansız Karar: Karakterin iki felaket arasında seçim yapma anı. 5. Gizemli Ziyaretçi: Kapıyı çalan kişinin kimliği.'
      },
      {
        heading: 'Readixon Editöründe Bölüm Sonu Etkinliği',
        body: 'Bölüm sonu cliffhanger ile bittiğinde, Readixon editöründeki Bölüm Sonu Anketi (End Activity) ile okuyuculara "Sizce katil kim?" veya "Deniz bu teklifi kabul etmeli mi?" diye sorarak satır arası etkileşimi patlatabilirsin.'
      }
    ],
    comparison: {
      weakTitle: 'Sönük & Kapanış Hissi Veren Son',
      weak: 'Bütün işlerini bitirdi, bilgisayarını kapattı ve uyumak üzere yatağına uzandı. Yarın zor bir gün olacaktı.',
      strongTitle: 'Bilgi Bombası Cliffhanger\'ı',
      strong: 'Doktor dosyayı masaya bıraktı, yüzündeki ter damlasını sildi. "Bu kan testleri sana ait değil... Ve kan sahibi bu sabah morgda teşhis ettiğimiz ceset."',
      reason: 'Okur uyuyamaz; cevabı öğrenmek için bir sonraki bölüme geçmek zorundadır.'
    },
    proTip: 'Her bölüm cliffhanger olmak zorunda değildir; bazen huzurlu bir duygusal nefes aralığı (afterglow) tempoyu dengeler.',
    studioTask: {
      title: 'Bölüm Sonu Anketi Ekle',
      description: 'Studio > Bölüm Editörü\'ne git ve son bölümünün altına okurların teorilerini toplayacak bir anket ekle.',
      actionLabel: 'Editöre Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Bir bölümün sonunda okuyucuyu bir sonraki bölüme geçmeye zorlayan en etkili teknik nedir?',
      options: [
        'Bütün soruları o bölümde tamamen cevaplayıp huzurla kapatmak',
        'Bölümün tam sonunda yeni ve hayati bir bilgi veya tehlike patlatarak soruyu havada bırakmak',
        'Bölümün sonuna yazarın özgeçmişini yazmak',
        'Bölümü 10.000 kelimeye uzatmak'
      ],
      correctAnswerIndex: 1,
      explanation: 'Cliffhanger merak duygusunu zirveye çıkarıp cevabı bir sonraki bölüme saklayarak okuma devamlılığını sağlar.'
    },
    keyTakeaways: [
      'Son cümle sonraki bölümün biletidir.',
      'Bilgi, tehlike veya duygu kırılması kullan.',
      'Bölüm sonu anketleriyle okuyucu topluluğunu ateşle.'
    ]
  },
  {
    id: 'plot-twist-engineering',
    title: 'Plot Twist Mühendisliği: Ters Köşe Yapmak',
    summary: 'Sürpriz ile tesadüf arasındaki fark. Mantıklı, önceden hazırlanmış ve sarsıcı kırılmalar.',
    pathId: 'novel',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'İleri',
    durationMinutes: 9,
    xp: 60,
    introduction: 'Kötü bir twist okuyucuyu kandırılmış ve öfkeli hissettirir ("Meğer hepsi bir rüyaymış!"). İyi bir twist ise okuyucuya "Nasıl göremedim, her şey gözümün önündeymiş!" dedirtir.',
    coreConcepts: [
      {
        heading: 'Altın Kural: Şaşırtıcı + Mantıklı + Önceden Hazırlanmış',
        body: 'Twist gökten zembille inemez. İpuçları (Foreshadowing) baştan beri oradadır ancak okuyucu yanlış yönlendirmelerle (Red Herring) başka tarafa baktırılmıştır.'
      },
      {
        heading: 'Kurgu Sihirbazı Modül C (Plot Twist)',
        body: 'Readixon Kurgu Sihirbazı Modül C; Algı Yanılsaması, Bilinmeyen Sırlar, Karakteri Şaşırtan Olay ve Etki Analizi sorularıyla twistini adım adım inşa eder.'
      }
    ],
    comparison: {
      weakTitle: 'Tesadüfi & Ucuz Twist',
      weak: 'Son anda gökyüzünden daha önce hiç adı geçmeyen bir uzay gemisi indi ve düşmanı yok etti.',
      strongTitle: 'Hazırlanmış & Sarsıcı Twist',
      strong: 'Dedektif katilin solak olduğunu anladığında, hikaye boyunca kendisine her kahve uzatışında fincanı sol eliyle tutan ortağına baktı.',
      reason: 'İpucu en baştan beri oradaydı; gerçek ortaya çıktığında okur geriye dönüp tüm ipuçlarını hayranlıkla hatırlar.'
    },
    proTip: 'İpucunu gizlemenin en iyi yolu, o ipucunu başka ve çok daha acil bir olayın içine saklamaktır.',
    studioTask: {
      title: 'Kurgu Sihirbazı Modül C\'yi Doldur',
      description: 'Studio > Kurgu Sihirbazı Modül C (Plot Twist) formunu aç ve hikayendeki algı yanılsamasını planla.',
      actionLabel: 'Modül C: Plot Twist',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Başarılı bir plot twist\'i ucuz bir sürprizden ayıran en önemli fark nedir?',
      options: [
        'Twist\'in sadece son sayfada ortaya çıkması',
        'Önceden ince ipuçlarıyla hazırlanmış olması ve geriye dönüp bakıldığında tamamen mantıklı gelmesi',
        'Bütün ana karakterlerin ölmesi',
        'Hikayenin rüya olduğunun söylenmesi'
      ],
      correctAnswerIndex: 1,
      explanation: 'Adil kurgu (fair-play), okuyucunun tüm ipuçlarına sahip olduğu halde ters köşeye yatması prensibidir.'
    },
    keyTakeaways: [
      'Gökten inen mucizeler twist değildir.',
      'İpuçlarını göz önünde ama başka bir duygunun gölgesinde sakla.',
      'Kurgu Sihirbazı Modül C ile etki analizini yap.'
    ]
  },
  {
    id: 'final-resolution',
    title: 'Final Tasarımı: Katarsis ve Kapanış',
    summary: 'Okurun boğazında düğüm bırakan veya derin bir tatmin veren finaller nasıl yazılır?',
    pathId: 'novel',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'İleri',
    durationMinutes: 8,
    xp: 60,
    introduction: 'İlk bölüm kitabı satar; son bölüm ise bir sonraki kitabını satar. Kötü bir final, yüzlerce sayfalık harika bir yolculuğu bir saniyede çöpe atabilir.',
    coreConcepts: [
      {
        heading: 'Bedel Ödenmeden Zafer Olmaz',
        body: 'Karakter hiçbir kayıp yaşamadan, hiçbir fedakarlık yapmadan düşmanı yenerse okur tatmin olmaz. Katarsis (duygusal arınma), ödenen bedelin ağırlığıyla doğru orantılıdır.'
      },
      {
        heading: 'Kurgu Sihirbazı Modül D (Final Planlayıcı)',
        body: 'Readixon Kurgu Sihirbazı Modül D\'de şu sorular yer alır: "Hikaye nereden başladı, nerede bitmeli?", "Değişimi sembolize eden obje/eylem nedir?", "Karakterle kimler kaldı ve ödenen bedel ne?"'
      }
    ],
    comparison: {
      weakTitle: 'Bedelsiz Kolay Zafer',
      weak: 'Kahraman kılıcını savurdu, kötü büyücü bir anda toza dönüştü ve herkes mutlu bir şekilde evlerine dağıldı.',
      strongTitle: 'Bedelli & Dönüştürücü Zafer',
      strong: 'Krallık kurtulmuştu; fakat kahraman tacı takarken sol kolunu ve en yakın dostunun mezarını sarayın kapısında bırakmıştı. Artık savaşa giren o naif genç değildi.',
      reason: 'Zafer gerçek bir maliyetle geldi; karakter geri dönüşü olmayan bir biçimde olgunlaştı.'
    },
    proTip: 'Hikayenin ilk sahnesindeki bir sembolü, eşyayı veya cümleyi final sahnesinde bambaşka bir anlamla yeniden kullan (döngüsel kapanış).',
    studioTask: {
      title: 'Kurgu Sihirbazı Modül D: Final',
      description: 'Studio > Kurgu Sihirbazı Modül D\'ye giderek finalde ödenen bedeli ve değişim sembolünü tanımla.',
      actionLabel: 'Modül D: Final Planlayıcı',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Edebi bir finalde "Katarsis" (duygusal doyum/arınma) hissini en çok güçlendiren unsur nedir?',
      options: [
        'Karakterin hiç yara almadan zafer kazanması',
        'Karakterin içsel dönüşüm geçirmesi ve amacına ulaşırken gerçek bir fedakarlık/bedel ödemesi',
        'Bölümün çok kısa tutulması',
        'Tüm soruların cevapsız bırakılması'
      ],
      correctAnswerIndex: 1,
      explanation: 'Gerçek zaferler fedakarlıkla kazanılır; bu bedel okuyucuda derin bir duygusal katarsis yaratır.'
    },
    keyTakeaways: [
      'İlk sayfa merak uyandırır, son sayfa efsaneleştirir.',
      'Bedelsiz zafer inandırıcı değildir.',
      'Başlangıç ile bitiş arasındaki karakter farkını hissettir.'
    ]
  },

  // ── 3. WEBTOON AKADEMİSİ ──
  {
    id: 'webtoon-vertical-flow',
    title: 'Dikey Akış Matematiği: Telefon Ekranı Sanatı',
    summary: 'Klasik çizgi roman sayfasından dikey kaydırmaya geçiş. Göz hareketleri ve ritim.',
    pathId: 'webtoon',
    category: 'Webtoon & Görsel Ritim',
    level: 'Başlangıç',
    durationMinutes: 7,
    xp: 50,
    introduction: 'Webtoon sayfa çevrilerek değil, baş parmakla yukarı kaydırılarak okunur. Bu format bir kısıtlama değil; zamanı, gerilimi ve sürprizi kontrol etmek için devasa bir avantajdır.',
    coreConcepts: [
      {
        heading: 'Gözün Doğal Dikey Hareketi',
        body: 'Okuyucu dikeyde aşağı doğru kaydırırken, ekranın üst kısmı geçmiş, orta kısmı şimdiki an, alt kısmı ise gelecektir. Paneller arasındaki boşluk zamanın geçiş hızını belirler.'
      },
      {
        heading: 'Mobil Ekran Ölçüsü',
        body: 'Readixon Webtoon stüdyosuna görsel yüklerken panellerin mobil dikey en-boy oranına uygun olduğundan ve metinlerin küçük ekranlarda bile okunabilir olduğundan emin ol.'
      }
    ],
    comparison: {
      weakTitle: 'Klasik Sayfa Kopyası',
      weak: 'Bir ekrana sıkıştırılmış 8 küçük panel, yan yana konuşma balonları, mobilde okunması imkansız küçük yazılar.',
      strongTitle: 'Akıcı Dikey Akış',
      strong: 'Tek sütunda nefes alan büyük paneller, aşağı kaydırdıkça yavaşça beliren tehlike figürü, tek parmakla akıp giden okuma zevki.',
      reason: 'Mobil okur parmağını yormadan ve zoom yapmak zorunda kalmadan sahnenin içine çekilir.'
    },
    proTip: 'Paneller arasındaki mesafeyi gerilim anlarında kasıtlı olarak uzat; okur parmağını kaydırdıkça gerilim tırmansın.',
    studioTask: {
      title: 'Webtoon Stüdyosunu İncele',
      description: 'Studio > Webtoon alanına git ve yeni bir webtoon taslağı açarak panel yükleme önizlemesini test et.',
      actionLabel: 'Webtoon Stüdyosuna Git',
      actionUrl: '/studio/webtoons'
    },
    quiz: {
      question: 'Webtoon formatında paneller arasındaki dikey boşluğun (whitespace) en önemli işlevi nedir?',
      options: [
        'Dosya boyutunu düşürmek',
        'Zaman algısını, gerilimi, duraklamayı ve duygusal nefes aralığını yönetmek',
        'Reklam bannerı koymak',
        'Sadece çizim yapmaktan kaçınmak'
      ],
      correctAnswerIndex: 1,
      explanation: 'Dikey boşluk webtoon\'un sessizlik notasıdır; boşluk uzadıkça okurun beklentisi ve gerilimi artar.'
    },
    keyTakeaways: [
      'Webtoon dikey kaydırma ritmidir.',
      'Küçük fontlar ve kalabalık paneller mobilde okunmaz.',
      'Zamanı yönetmek için boşlukları kullan.'
    ]
  },
  {
    id: 'webtoon-pacing-whitespace',
    title: 'Boşluk Sanatı: Zamanı Parmakla Yönetmek',
    summary: 'Ne zaman paneller birbirine yapışmalı, ne zaman uzun bir sessizlik boşluğu bırakılmalı?',
    pathId: 'webtoon',
    category: 'Webtoon & Görsel Ritim',
    level: 'Orta',
    durationMinutes: 6,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Müzikte suskunluklar en az notalar kadar önemlidir. Webtoon\'da da çizilmeyen beyaz veya siyah boşluklar en az paneller kadar güçlü bir anlatım aracıdır.',
    coreConcepts: [
      {
        heading: 'Hızlı Aksiyon vs. Ağır Melankoli',
        body: 'Aksiyon sahnelerinde paneller birbirine yakın, çapraz veya keskin açılıdır; okur hızlı kaydırır. Duygusal bir ölüm veya ayrılık sahnesinde ise iki panel arasına devasa bir siyah boşluk bırakılır; parmak kayar kayar ve düşüş hissi yaşanır.'
      },
      {
        heading: 'Sürpriz Kırılmalar (Jump-Scroll)',
        body: 'Canavarın aniden ortaya çıkışını veya karakterin dehşet dolu yüzünü göstermeden önce tam bir ekran boyu boşluk bırakmak görsel bir "jump-scare" yaratır.'
      }
    ],
    comparison: {
      weakTitle: 'Boşluksuz Tıkış Tıkış Paneller',
      weak: 'Dramatik bir ayrılık sahnesinde karakterin "Seni terk ediyorum" balonu ile ağlama yüzü birbirine yapışık.',
      strongTitle: 'Zaman Kazandıran Boşluk',
      strong: '"Seni terk ediyorum" sözü... Uzun bir gri boşluk... Yağmur damlaları... Ve ardından yere düşen yüzük ve ağlayan gözler.',
      reason: 'Okur boşluğu kaydırırken kelimenin ağırlığını ve acısını hisseder.'
    },
    proTip: 'Siyah boşluk korku, gece ve klostrofobi yaratır; beyaz boşluk ise yalnızlık, şok ve boşluk hissi verir.',
    studioTask: {
      title: 'Webtoon Bölümlerini Düzenle',
      description: 'Studio > Webtoon bölüm yükleme ekranında panel sıralamanı ve dikey aralıklarını gözden geçir.',
      actionLabel: 'Webtoon Bölümlerine Git',
      actionUrl: '/studio/webtoons'
    },
    quiz: {
      question: 'Bir webtoon sahnesinde iki panel arasına uzun bir boşluk bırakmak okuyucuda hangi hissi güçlendirir?',
      options: [
        'Hızlı ve kaotik bir aksiyon hissi',
        'Duraklama, şok, beklenti ve duygusal ağırlık hissi',
        'Sayfanın yüklenemediği hissi',
        'Bölümün bittiği hissi'
      ],
      correctAnswerIndex: 1,
      explanation: 'Uzun boşluk okuyucuya sahnenin ağırlığını sindirmesi için gereken süreyi ve merakı tanır.'
    },
    keyTakeaways: [
      'Boşluk sessizliğin ve sürenin sembolüdür.',
      'Aksiyonda sıkı, duyguda geniş aralıklar bırak.',
      'Renk tonuyla (siyah/beyaz) atmosferi destekle.'
    ]
  },
  {
    id: 'webtoon-speech-bubbles',
    title: 'Konuşma Balonları & Tipografi Kuralları',
    summary: 'Çizimi kapatmayan, gözü yönlendiren ve mobil ekranda zahmetsiz okunan balon matematiği.',
    pathId: 'webtoon',
    category: 'Webtoon & Görsel Ritim',
    level: 'Başlangıç',
    durationMinutes: 5,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Çizimlerin ne kadar muhteşem olursa olsun, eğer konuşma balonları karakterin yüzünü kapatıyorsa veya hangi sırayla okunacağı anlaşılmıyorsa okur yorulur ve bırakır.',
    coreConcepts: [
      {
        heading: 'Z-Kuralı ve Dikey Sıralama',
        body: 'İlk konuşan karakterin balonu daima daha yukarıda ve solda olmalıdır. Okuyucunun gözü soldan sağa, yukarıdan aşağıya iner. Asla alttaki balonu önce okutacak yerleşim yapma.'
      },
      {
        heading: 'Metin Yoğunluğu Limiti',
        body: 'Webtoon bir roman değildir. Bir balona 40 kelime sığdırmaya çalışma. Balon başına maksimum 10-15 kelime kullan. Uzun monologları birden fazla küçük balona böl.'
      }
    ],
    comparison: {
      weakTitle: 'Çizimi Boğan Balon',
      weak: 'Tek bir dev kare balon karakterin tüm vücudunu kapatmış, içinde duvar gibi 5 cümlelik açıklama metni.',
      strongTitle: 'Karakterle Dans Eden Balonlar',
      strong: 'Karakterin omzunun üstünde kısa bir cümle... Karakterin bakışına doğru ikinci küçük bir fısıltı balonu.',
      reason: 'Göz çizimle metin arasında rahatça gezinir, karakterin jest ve mimikleri görünür kalır.'
    },
    proTip: 'Bağırma balonlarında sivri köşeli kenarlıklar, düşünce balonlarında bulutsu yumuşak çizgiler kullanarak duyguyu tipografiyle destekle.',
    studioTask: {
      title: 'Önizleme Kontrolü Yap',
      description: 'Webtoon stüdyosunda yüklediğin bir bölümün mobil önizleme modunu açarak balon okunabilirliğini test et.',
      actionLabel: 'Webtoon Paneline Git',
      actionUrl: '/studio/webtoons'
    },
    quiz: {
      question: 'İki karakterin karşılıklı konuştuğu bir webtoon panelinde balon sırası nasıl belirlenmelidir?',
      options: [
        'Önce konuşanın balonu daha yukarıda ve sol tarafta konumlandırılmalıdır',
        'Bütün balonlar karakterlerin ayaklarının altına dizilmelidir',
        'Önce konuşanın balonu en aşağıda olmalıdır',
        'Balonlar rastgele yerleştirilebilir'
      ],
      correctAnswerIndex: 0,
      explanation: 'Dikey okuma alışkanlığında göz daima yukarıdan aşağıya ve soldan sağa doğru tarama yapar.'
    },
    keyTakeaways: [
      'Balon sırası okuma yönünü yönetir.',
      'Metinleri parçala, duvar gibi blok yapma.',
      'Çizimin kilit noktalarını asla balonla kapatma.'
    ]
  },
  {
    id: 'webtoon-visual-cliffhanger',
    title: 'Görsel Cliffhanger: Son Panele Kitlemek',
    summary: 'Metinle değil, çizimle nefes kesmek. Webtoon finallerinde okuru çıldırtan kareler.',
    pathId: 'webtoon',
    category: 'Webtoon & Görsel Ritim',
    level: 'Orta',
    durationMinutes: 6,
    xp: 50,
    isQuickLesson: true,
    introduction: 'Roman cliffhanger\'ı bir diyalog veya cümleyle biterken, webtoon cliffhanger\'ı göz bebeklerinin büyüdüğü şok edici bir görsel detayla biter.',
    coreConcepts: [
      {
        heading: 'Göz Bebekleri, Gölgeler ve Yarım Kalan Hamleler',
        body: '1. Kapının ardından uzanan kanlı el. 2. Karakterin aynada gördüğü şey karşısındaki dehşet ifadesi (ama aynada ne olduğu gösterilmez). 3. Kılıcın inme anı, tam çarpışmadan bir milimetre önce kesilen siyah ekran.'
      },
      {
        heading: 'Yorumlar Bölümünü Ateşlemek',
        body: 'Webtoon okurları bölüm sonlarında teorilerini çizimdeki küçük detaylar üzerinden tartışmayı sever. Son karede arka planda beliren gizemli bir gölge veya dövme yüzlerce yorum çeker.'
      }
    ],
    comparison: {
      weakTitle: 'Sıradan Statik Kapanış',
      weak: 'İki karakter bir masada çay içip gülümserken bölüm aniden biter.',
      strongTitle: 'Görsel Kanca Kapanışı',
      strong: 'Gülümseyen karakter arkasını döndüğünde cebinden zehir şişesini çıkarır; yüzünün yarısı gölgede kalır ve bölüm kararır.',
      reason: 'Okur hemen bir sonraki bölümü ve karakterin niyetini görmek için yanıp tutuşur.'
    },
    proTip: 'Son panelin boyutunu diğer panellerden daha büyük yap; bölümün görsel zirvesi olduğunu hissettir.',
    studioTask: {
      title: 'Webtoon Bölümünü Gözden Geçir',
      description: 'Webtoon Stüdyosu\'nda hazırladığın son bölümün bitiş panelini bu ilkeler ışığında incele.',
      actionLabel: 'Webtoon Listeme Git',
      actionUrl: '/studio/webtoons'
    },
    quiz: {
      question: 'Bir webtoon bölümünün son panelinde aşağıdaki tercihlerden hangisi en yüksek merakı uyandırır?',
      options: [
        'Karakterin uykuya dalıp gözlerini kapatması',
        'Karakterin beklemediği bir tehdidi veya şok edici bir objeyi fark ettiği anın yarım bırakılması',
        'Havanın karardığını gösteren jenerik bir gökyüzü resmi',
        'Bölümün teşekkür yazısıyla bitmesi'
      ],
      correctAnswerIndex: 1,
      explanation: 'Yarım kalan hareket veya şok edici görsel keşif okuru anında bir sonraki bölüme yönlendirir.'
    },
    keyTakeaways: [
      'Görsel cliffhanger kelimelerden daha hızlı çarpar.',
      'Gölge, yarım hamle ve yüz ifadelerini kullan.',
      'Son paneli görsel olarak vurgula.'
    ]
  },

  // ── 4. SERİ & EVREN KURUCULUĞU ──
  {
    id: 'series-bible-guide',
    title: 'Series Bible: Evren Defteri Nasıl Tutulur?',
    summary: 'Çok kitaplı serilerde mantık hatalarına düşmemek için yazarın kişisel ansiklopedisi.',
    pathId: 'series',
    category: 'Dünya Kurma (Worldbuilding)',
    level: 'İleri',
    durationMinutes: 9,
    xp: 60,
    introduction: 'Game of Thrones veya Harry Potter gibi devasa evrenler yazarın sadece aklında tuttuğu şeylerle yazılamaz. Series Bible, evreninin anayasasıdır.',
    coreConcepts: [
      {
        heading: 'Series Bible\'da Neler Olmalı?',
        body: '1. Zaman Çizelgesi (Timeline): Kim ne zaman doğdu, savaş ne zaman bitti? 2. Kurallar & Büyü/Teknoloji: Güçlerin sınırları ve bedelleri. 3. Mekanlar & Coğrafya: Şehirler arası mesafeler. 4. Karakter Kütükleri: Karakterlerin göz rengi, doğum günü, gizli geçmişi.'
      },
      {
        heading: 'Readixon Karakter Defteri Entegrasyonu',
        body: 'Readixon Studio > Karakterler alanı dijital Series Bible\'ının karakter ayağıdır. Karakterlerin RPG statları, geçmişleri ve ilişkileri burada güvendedir.'
      }
    ],
    comparison: {
      weakTitle: 'Hafızaya Güvenen Yazar',
      weak: '1. kitapta kahramanın yeşil gözlü olduğu yazılmışken, 3. kitapta unutulup "kara gözleriyle baktı" yazılması.',
      strongTitle: 'Kayıtlı ve Tutarlı Evren',
      strong: 'Series Bible\'ında karakterin tüm fiziksel özellikleri, travmaları ve yara izleri kayıtlı; 5 kitap boyunca kusursuz tutarlılık.',
      reason: 'Okurlar detay avcısıdır; devamlılık hatası görmediklerinde yazara ve evrene saygıları katlanır.'
    },
    proTip: 'Daha sonra kullanmak istediğin küçük bir gizem veya ipucu aklına geldiğinde Series Bible\'ına "Açık Kalan Sorular" başlığı altında hemen kaydet.',
    studioTask: {
      title: 'Karakter Defterine Yeni Karakter Ekle',
      description: 'Studio > Karakterler alanına git ve serindeki ana karakterin tüm geçmişini ve RPG statlarını doldur.',
      actionLabel: 'Karakter Defterini Aç',
      actionUrl: '/studio/characters'
    },
    quiz: {
      question: 'Bir seri yazarının "Series Bible" (Evren Defteri) tutmasının en hayati faydası nedir?',
      options: [
        'Kitabın sayfa sayısını artırmak',
        'Kitaplar arasında ortaya çıkabilecek devamlılık (continuity) ve kural çelişkilerini sıfıra indirmek',
        'Yayınevine fazladan para ödemek',
        'Sosyal medyada paylaşmak'
      ],
      correctAnswerIndex: 1,
      explanation: 'Series Bible, çok kitaplı serilerde zaman, mekan, kural ve karakter çelişkilerini önleyen referans rehberidir.'
    },
    keyTakeaways: [
      'Hafızana güvenme, evren defterine kaydet.',
      'Kurallarını, zaman çizelgeni ve mesafeleri sabitle.',
      'Karakter Defteri\'ni aktif tut.'
    ]
  },
  {
    id: 'character-continuity',
    title: 'Karakter Devamlılığı ve Uzun Vadeli Arklar',
    summary: 'Kitap 1\'den Kitap 3\'e karakter nasıl büyür? Değişim ile tutarlılık arasındaki hassas denge.',
    pathId: 'series',
    category: 'Karakter & Psikoloji',
    level: 'İleri',
    durationMinutes: 8,
    xp: 60,
    introduction: 'Bir seride okuyucu en çok karakterin büyümesine aşık olur. Ancak 1. kitaptaki toy genç, 2. kitapta birdenbire hiçbir sebep yokken acımasız bir generale dönüşemez.',
    coreConcepts: [
      {
        heading: 'İnandırıcı Gelişim Merdiveni',
        body: 'Karakterin değişimi yaşadığı travmaların, ödediği bedellerin ve aldığı yaraların doğal sonucu olmalıdır. Karakter her kitapta bir inancını sorgulamalı ve yeni bir felsefe edinmelidir.'
      },
      {
        heading: 'Temel Özün Korunması',
        body: 'Karakter ne kadar değişirse değişsin, onun özünü tanımlayan bir kıvılcım (örneğin adalete olan saplantısı veya mizah anlayışı) daima tanınabilir kalmalıdır.'
      }
    ],
    comparison: {
      weakTitle: 'Kişilik Sıfırlaması',
      weak: '1. kitabın sonunda affetmeyi öğrenen kahraman, 2. kitabın başında hiçbir açıklama olmadan yine kin dolu birine dönüşür.',
      strongTitle: 'Kademeli & İz Bırakan Gelişim',
      strong: '1. kitapta affetmeyi öğrenmiştir; fakat 2. kitapta affettiği kişinin yeni bir felakete yol açmasıyla "merhamet ile zayıflık arasındaki farkı" sorgulamaya başlar.',
      reason: 'Gelişim sıfırlanmadı; bir önceki kitabın dersi yeni bir zorlukla sınandı.'
    },
    proTip: 'Karakter Defterinde "Başlangıç Hali" ve "Bitiş Hali" alanlarını her kitap için ayrı ayrı güncelle.',
    studioTask: {
      title: 'Karakter Psikolojisini Güncelle',
      description: 'Studio > Karakterler sayfasına git ve karakterinin en büyük korkusunun hikaye boyunca nasıl evrildiğini not et.',
      actionLabel: 'Karakterlerime Git',
      actionUrl: '/studio/characters'
    },
    quiz: {
      question: 'Çok kitaplı bir seride karakter gelişiminde kaçınılması gereken en büyük hata nedir?',
      options: [
        'Karakterin yeni arkadaşlar edinmesi',
        'Önceki kitapta kazanılan olgunluğun yeni kitabın başında sebepsizce sıfırlanıp karakterin aynı hataları baştan yapması',
        'Karakterin yaşlanması',
        'Karakterin yeni bir şehre taşınması'
      ],
      correctAnswerIndex: 1,
      explanation: 'Karakterin gelişiminin sebepsiz yere resetlenmesi okuyucunun önceki kitaba yaptığı duygusal yatırımı değersizleştirir.'
    },
    keyTakeaways: [
      'Gelişimi sıfırlama, yeni sınavlarla derinleştir.',
      'Değişim travmanın ve bedelin eseri olmalıdır.',
      'Karakterin öz kıvılcımını koru.'
    ]
  },
  {
    id: 'long-term-payoffs',
    title: 'Uzun Vadeli Foreshadowing & Payoff',
    summary: '1. kitapta ekilen minik bir tohumun 3. kitapta devasa bir ormana dönüşmesi.',
    pathId: 'series',
    category: 'Hikâye Mühendisliği & Kurgu',
    level: 'İleri',
    durationMinutes: 8,
    xp: 60,
    introduction: 'Bir seriyi sıradanlıktan çıkarıp kült mertebesine yükselten şey, 1. kitaptaki önemsiz gibi görünen bir cümlenin veya eşyanın, 3. kitabın finalinde dünyayı kurtaran kilit olmasıdır.',
    coreConcepts: [
      {
        heading: 'Setup (Kurulum) ve Payoff (Ödül) Döngüsü',
        body: 'Setup: 1. kitapta karakter dedesinden kalan kırık saati cebine atar. Payoff: 3. kitabın sonunda o saatin içine gizlenmiş şifre kasanın kapısını açar.'
      },
      {
        heading: 'Okuyucu Sadakati Yaratmak',
        body: 'Okur böyle bir detayla karşılaştığında "Yazar bunu 3 yıldır planlıyormuş!" hayranlığına kapılır ve serinin tüm teorilerini topluluklarda (Readix akışında) tartışmaya başlar.'
      }
    ],
    comparison: {
      weakTitle: 'Günübirlik Çözümler',
      weak: 'Finalde ihtiyaç duyulan sihirli anahtar, kütüphanede tesadüfen raftan düşen bir kitapta bulunur.',
      strongTitle: 'Yıllar Öncesinden Ekilen Tohum',
      strong: 'Finaldeki anahtar, karakterin 1. kitabın 2. bölümünde nehir kenarında bulup uğur taşı sandığı o yosunlu taştır.',
      reason: 'Çözüm tesadüfle değil, en baştan beri var olan ve unutulmuş bir değerle sağlandı.'
    },
    proTip: '1. kitabı yazarken henüz ne işe yarayacağını tam bilmesen bile arka plana 2-3 tuhaf, gizemli obje veya yan karakter ekle; ilerleyen kitaplarda bunları mükemmel bir silaha dönüştürebilirsin.',
    studioTask: {
      title: 'Gizem ve Tohumları Not Et',
      description: 'Studio Kurgu Sihirbazı Modül C veya hikaye notlarına serinin ilerisinde patlatacağın bir gizemi kaydet.',
      actionLabel: 'Kurgu Sihirbazına Git',
      actionUrl: '/studio'
    },
    quiz: {
      question: 'Edebi bir seride "Setup ve Payoff" dengesi neden bu kadar güçlüdür?',
      options: [
        'Kitabın fiyatını artırdığı için',
        'Okura tutarlı, özenli ve baştan sona planlanmış bir evrende yolculuk ettiği hissini ve keşif zevkini verdiği için',
        'Yazarın daha az kelime yazmasını sağladığı için',
        'Sadece fantastik türde çalıştığı için'
      ],
      correctAnswerIndex: 1,
      explanation: 'Tohumun meyve vermesi okurda büyük bir zihinsel tatmin ve hayranlık uyandırır.'
    },
    keyTakeaways: [
      'Erken ekilen tohumlar en tatlı meyveyi verir.',
      'Tesadüfleri değil, unutulmuş detayları ödüllendir.',
      'Readix\'te okur teorilerini takip et.'
    ]
  }
];

export const ACADEMY_BADGES: AcademyBadge[] = [
  {
    id: 'first-step',
    title: 'İlk Adım',
    description: 'İlk Akademi dersini başarıyla tamamla.',
    icon: 'Sparkles',
    requiredLessonCount: 1
  },
  {
    id: 'story-engineer',
    title: 'Hikâye Mimarı',
    description: 'Hikâye Mühendisliği ve Kurgu alanında 3 ders tamamla.',
    icon: 'Target',
    requiredLessonCount: 3
  },
  {
    id: 'character-master',
    title: 'Karakter Ustası',
    description: 'Karakter ve psikoloji eğitimlerini tamamla.',
    icon: 'Users',
    requiredLessonCount: 2
  },
  {
    id: 'webtoon-pioneer',
    title: 'Webtoon Öncüsü',
    description: 'Webtoon Akademisi derslerini tamamla.',
    icon: 'Layers',
    requiredPathId: 'webtoon'
  },
  {
    id: 'scholar-100',
    title: 'Kalem Ustası (500 XP)',
    description: 'Akademi eğitimlerinde 500 XP barajına ulaş.',
    icon: 'Award',
    requiredXp: 500
  }
];
