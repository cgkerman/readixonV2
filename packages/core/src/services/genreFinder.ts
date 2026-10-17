import { MAIN_GENRES, getMainGenreById, type MainGenreItem } from '../constants/genres';

export interface GenreOption {
  id: string;
  label: string;
  description?: string;
  // Ana tür puanları
  mainGenreScores: Record<string, number>;
  // Belirli alt türlere bonus puanlar
  subGenreScores?: Record<string, number>;
}

export interface GenreQuestion {
  id: string;
  title: string;
  subtitle: string;
  multiSelect?: boolean;
  options: GenreOption[];
}

export interface GenreFinderMatch {
  mainGenre: MainGenreItem;
  percentage: number;
  score: number;
  recommendedSubGenres: {
    id: string;
    name: string;
    percentage: number;
  }[];
}

export interface GenreFinderResult {
  topMatch: GenreFinderMatch;
  alternatives: GenreFinderMatch[];
}

/**
 * 30 Ana Tür ve 393 Alt Türün tamamını kapsayan 6 Adımlı Edebi Soru Seti
 */
export const GENRE_FINDER_QUESTIONS: GenreQuestion[] = [
  // 1. SORU: EVREN VE MEKÂN
  {
    id: 'setting',
    title: 'Hikâyenizin geçtiği dünya nasıl bir yer?',
    subtitle: 'Olayların vuku bulduğu evrenin gerçeklik düzlemini seçin.',
    options: [
      {
        id: 'secondary_fantasy',
        label: 'Tamamen Kurgusal / İkincil Fantezi Dünyası',
        description: 'Kendine ait haritaları, krallıkları, tarihi ve doğası olan özgün bir fantezi evreni.',
        mainGenreScores: {
          'fantastik': 30,
          'mitolojik-kurgu': 20,
          'dogu-ve-asya-kurgu': 15,
          'macera-fantastigi-ve-oyunlasmis-kurgu': 15,
        },
        subGenreScores: {
          'yuksek-fantastik': 25,
          'epik-fantastik': 20,
        }
      },
      {
        id: 'real_modern',
        label: 'Gerçek Dünya (Modern Çağ / Günümüz)',
        description: 'Gerçek şehirler, tanıdık sokaklar ve modern yaşamın dinamikleri.',
        mainGenreScores: {
          'gizem-ve-polisiye': 25,
          'gerilim': 20,
          'romantik': 25,
          'dram': 25,
          'psikolojik-kurgu': 25,
          'genc-kurgu': 25,
          'gunluk-yasam': 30,
          'komedi-ve-mizah': 20,
          'spor-kurgusu': 30,
          'toplumsal-ve-politik-kurgu': 25,
        }
      },
      {
        id: 'real_historical',
        label: 'Tarihsel Dönemler (Geçmiş Çağlar)',
        description: 'Antik çağ, Orta Çağ, Osmanlı, 19. yüzyıl veya belirli bir tarihsel kesit.',
        mainGenreScores: {
          'tarihi-kurgu': 40,
          'western': 30,
          'savas-ve-askeri-kurgu': 25,
          'gizli-tarih-ve-akademik-kurgu': 25,
        },
        subGenreScores: {
          'donem-kurgusu': 25,
          'orta-cag-kurgusu': 25,
        }
      },
      {
        id: 'future_tech',
        label: 'Gelecek, Uzay veya İleri Teknoloji Dünyası',
        description: 'Yıldızlararası yolculuklar, yapay zekâ, megakentler veya felaket sonrası gelecek.',
        mainGenreScores: {
          'bilim-kurgu': 35,
          'distopya-ve-spekulatif-kurgu': 30,
        },
        subGenreScores: {
          'siberpunk': 25,
          'uzay-operasi': 25,
          'kiyamet-sonrasi-distopya': 25,
        }
      },
      {
        id: 'hidden_urban',
        label: 'Gerçek Dünyanın İçine Gizlenmiş Doğaüstü Boyut',
        description: 'Modern şehirlerin gölgelerinde yaşayan yaratıklar, gizli akademiler veya kadim tarikatlar.',
        mainGenreScores: {
          'paranormal-ve-dogaustu': 30,
          'korku': 20,
          'gizli-tarih-ve-akademik-kurgu': 25,
          'karanlik-kurgu': 20,
        },
        subGenreScores: {
          'sehir-fantastigi': 25,
          'modern-paranormal': 25,
          'dark-academia': 25,
        }
      },
      {
        id: 'virtual_system',
        label: 'Sanal Gerçeklik, Oyun Simülasyonu veya Zindan Evreni',
        description: 'Oyun dinamikleri, kule tırmanışı, zindanlar veya sisteme bağlı alternatif evrenler.',
        mainGenreScores: {
          'macera-fantastigi-ve-oyunlasmis-kurgu': 40,
          'bilim-kurgu': 15,
        },
        subGenreScores: {
          'litrpg': 30,
          'zindan-ve-kule-kurgusu': 30,
          'sanal-gerceklik-vr': 25,
        }
      }
    ]
  },

  // 2. SORU: DOĞAÜSTÜ & TEKNOLOJİ GÜÇ SEVİYESİ
  {
    id: 'supernatural_level',
    title: 'Hikâyenizdeki olağanüstülük seviyesi nedir?',
    subtitle: 'Büyü, teknoloji veya doğaüstü kuralların hikâyedeki ağırlığını belirleyin.',
    options: [
      {
        id: 'magic_powers',
        label: 'Büyü Sistemleri, Tanrılar ve Kadim Güçler',
        description: 'Büyücüler, kutsal/karanlık güçler, tanrılar veya efsanevi yaratıklar.',
        mainGenreScores: {
          'fantastik': 30,
          'mitolojik-kurgu': 30,
          'dogu-ve-asya-kurgu': 25,
        },
        subGenreScores: {
          'sert-buyu-sistemi': 25,
          'tanrilar-ve-panteon': 25,
        }
      },
      {
        id: 'scifi_advancement',
        label: 'İleri Bilim, Sibernetik ve Teknolojik Harikalar',
        description: 'Yapay zekâlar, sibernetik protezler, zaman makineleri, biyomühendislik.',
        mainGenreScores: {
          'bilim-kurgu': 35,
          'distopya-ve-spekulatif-kurgu': 25,
        },
        subGenreScores: {
          'yapay-zeka-kurgusu': 25,
          'sert-bilim-kurgu': 25,
          'zamanda-yolculuk': 25,
        }
      },
      {
        id: 'paranormal_entities',
        label: 'Doğaüstü Varlıklar (Hayaletler, Vampirler, Lanetler)',
        description: 'Gözle görülmeyen ruhlar, kan emiciler, lanetli objeler veya ölüm ötesi güçler.',
        mainGenreScores: {
          'paranormal-ve-dogaustu': 35,
          'korku': 25,
        },
        subGenreScores: {
          'vampir-kurgusu': 30,
          'kurtadam-ve-sekil-degistirenler': 30,
          'hayalet-ve-ruhlar': 25,
        }
      },
      {
        id: 'system_stats',
        label: 'Sistem Arayüzü, Seviye Atlama ve Stat Puanları',
        description: 'Karakterin gördüğü durum penceresi (status window), görevler ve yetenek puanları.',
        mainGenreScores: {
          'macera-fantastigi-ve-oyunlasmis-kurgu': 40,
        },
        subGenreScores: {
          'sistem-kurgusu': 30,
          'ilerleme-fantastigi': 30,
        }
      },
      {
        id: 'spiritual_metaphysical',
        label: 'Manevi Sırlar, Ruhsal Uyanış ve Metafizik',
        description: 'Tasavvufi yolculuk, içsel hakikat, varoluşsal sırlar veya metafizik aydınlanma.',
        mainGenreScores: {
          'manevi-ve-metafizik-kurgu': 45,
          'edebi-kurgu': 15,
        },
        subGenreScores: {
          'tasavvufi-kurgu': 30,
          'ruhsal-yolculuk': 30,
        }
      },
      {
        id: 'pure_realistic',
        label: 'Sıfır Doğaüstülük (Tamamen Gerçekçi Kurallar)',
        description: 'Doğa kanunları geçerli; büyü veya olağanüstü teknoloji yok.',
        mainGenreScores: {
          'edebi-kurgu': 30,
          'dram': 30,
          'gizem-ve-polisiye': 25,
          'romantik': 20,
          'psikolojik-kurgu': 25,
          'gunluk-yasam': 25,
          'savas-ve-askeri-kurgu': 25,
          'western': 25,
          'spor-kurgusu': 25,
          'toplumsal-ve-politik-kurgu': 25,
        }
      }
    ]
  },

  // 3. SORU: TEMEL ÇATIŞMA VE İTİCİ GÜÇ
  {
    id: 'conflict',
    title: 'Karakterleri ve hikâyeyi ileriye taşıyan ana itici güç nedir?',
    subtitle: 'Eserin kalbindeki temel mücadeleyi ve merak unsurunu seçin.',
    options: [
      {
        id: 'war_conquest',
        label: 'Büyük Savaşlar, Krallık Mücadeleleri ve Taht Kavgaları',
        description: 'Dev ordular, siyasi entrikalar, strateji veya dünyayı kurtarma/fethetme arzusu.',
        mainGenreScores: {
          'fantastik': 25,
          'savas-ve-askeri-kurgu': 35,
          'tarihi-kurgu': 20,
        },
        subGenreScores: {
          'epik-fantastik': 25,
          'askeri-fantastik': 25,
          'strateji-ve-cephe-kurgusu': 25,
        }
      },
      {
        id: 'crime_mystery',
        label: 'Çözülmesi Gereken Bir Cinayet, Gizem veya Suç Ağı',
        description: 'İpuçları, şüpheliler, ters köşeler, dedektiflik ve adalet arayışı.',
        mainGenreScores: {
          'gizem-ve-polisiye': 40,
          'gerilim': 25,
        },
        subGenreScores: {
          'dedektiflik-ve-sorusturma': 30,
          'cinayet-ve-seri-katil': 25,
          'kapali-oda-gizemi': 25,
        }
      },
      {
        id: 'survival_thriller',
        label: 'Ölümcül Bir Tehlikeden Kaçış ve Hayatta Kalma',
        description: 'Yüksek adrenalin, kedi-fare oyunu, tekinsiz bir takipçi veya tuzaklarla dolu ortam.',
        mainGenreScores: {
          'gerilim': 35,
          'korku': 25,
          'distopya-ve-spekulatif-kurgu': 20,
        },
        subGenreScores: {
          'psikolojik-gerilim': 25,
          'hayatta-kalma-gerilimi': 25,
        }
      },
      {
        id: 'romance_connection',
        label: 'İki İnsanın Birbirini Bulması, Aşk ve Duygusal Bağ',
        description: 'Aşk, tutku, engeller, kıskançlık veya duygusal yakınlaşma.',
        mainGenreScores: {
          'romantik': 40,
          'dram': 20,
        },
        subGenreScores: {
          'yavas-yanan-romantik': 25,
          'dusmandan-asiga': 25,
        }
      },
      {
        id: 'cultivation_martial',
        label: 'Dövüş Sanatlarında Ustalaşma ve Güçlenme Arzusu',
        description: 'Xiulian, qi enerjisi, mezhepler, usta-çırak ilişkisi ve mutlak zirveye ulaşma.',
        mainGenreScores: {
          'dogu-ve-asya-kurgu': 45,
          'aksiyon-ve-macera': 20,
        },
        subGenreScores: {
          'xianxia': 30,
          'wuxia': 30,
          'murim': 30,
        }
      },
      {
        id: 'internal_psychology',
        label: 'İçsel Hesaplaşma, Akıl Oyunları ve Travmalar',
        description: 'Karakterin kendi zihniyle, geçmişiyle veya ahlaki sınırlarıyla yüzleşmesi.',
        mainGenreScores: {
          'psikolojik-kurgu': 40,
          'edebi-kurgu': 25,
          'dram': 20,
        },
        subGenreScores: {
          'travma-ve-iyilesme': 25,
          'akil-oyunlari-ve-manipulasyon': 25,
        }
      },
      {
        id: 'sports_tournament',
        label: 'Turnuva, Şampiyonluk veya Takım Zaferi',
        description: 'Ter, antrenman, disiplin, rekabet ve sahada kazanılan zaferler.',
        mainGenreScores: {
          'spor-kurgusu': 45,
        },
        subGenreScores: {
          'futbol-kurgusu': 25,
          'e-spor-kurgusu': 30,
          'dovus-sporlari': 25,
        }
      },
      {
        id: 'daily_routine',
        label: 'Gündelik Yaşam, İş Yeri, Arkadaşlık ve Aile',
        description: 'Büyüme hikâyeleri, sıcacık ilişkiler, kafe/iş ortamı veya mizahi durumlar.',
        mainGenreScores: {
          'gunluk-yasam': 35,
          'genc-kurgu': 25,
          'komedi-ve-mizah': 25,
          'dram': 20,
        },
        subGenreScores: {
          'is-ve-meslek-hayati': 25,
          'okul-ve-arkadaslik': 25,
        }
      }
    ]
  },

  // 4. SORU: ATMOSFER VE TON
  {
    id: 'tone',
    title: 'Okuyucunun hissedeceği ana atmosfer ve ton nasıl olmalı?',
    subtitle: 'Hikâyenizin baskın duygusal iklimini belirleyin.',
    options: [
      {
        id: 'dark_grim',
        label: 'Karanlık, Sert, Ölümcül ve Acımasız (Grimdark / Korku)',
        description: 'Ahlaki gri karakterler, acımasız sonuçlar, kan, dehşet veya çaresizlik.',
        mainGenreScores: {
          'karanlik-kurgu': 40,
          'korku': 35,
          'fantastik': 15,
        },
        subGenreScores: {
          'grimdark': 30,
          'karanlik-fantastik': 25,
          'psikolojik-korku': 25,
          'gotik-korku': 25,
        }
      },
      {
        id: 'heroic_adventurous',
        label: 'Görkemli, Macera Dolu ve Umut Vadeden',
        description: 'Uçsuz bucaksız diyarlar, dostluk bağları, cesaret ve kahramanlık hissi.',
        mainGenreScores: {
          'aksiyon-ve-macera': 35,
          'fantastik': 25,
          'macera-fantastigi-ve-oyunlasmis-kurgu': 20,
        },
        subGenreScores: {
          'kahramansi-fantastik': 25,
          'kesif-ve-kesfedilmemis-diyarlar': 25,
        }
      },
      {
        id: 'mysterious_tense',
        label: 'Puslu, Şüphe Dolu ve Merak Uyandırıcı',
        description: 'Her köşede bir soru işareti, kimseye güvenilemeyen gergin ve soğuk bir hava.',
        mainGenreScores: {
          'gizem-ve-polisiye': 30,
          'gerilim': 30,
          'gizli-tarih-ve-akademik-kurgu': 20,
        },
        subGenreScores: {
          'noir-kara-roman': 25,
          'komplo-ve-politika-gerilimi': 25,
        }
      },
      {
        id: 'heartfelt_emotional',
        label: 'Yoğun Duygusal, Dramatik ve Kalbe Dokunan',
        description: 'Ağlatan sahneler, derin sevgi, kayıplar veya fedakârlıklar.',
        mainGenreScores: {
          'dram': 35,
          'romantik': 25,
          'edebi-kurgu': 20,
        },
        subGenreScores: {
          'aile-drami': 25,
          'trajik-romantik': 25,
        }
      },
      {
        id: 'light_humorous',
        label: 'Hafif, Eğlenceli, Esprili ve Sıcak',
        description: 'Gülümseten diyaloglar, durum komedisi, parodi veya neşeli anlar.',
        mainGenreScores: {
          'komedi-ve-mizah': 45,
          'gunluk-yasam': 20,
        },
        subGenreScores: {
          'romantik-komedi': 30,
          'parodi-ve-hiciv': 30,
          'absurt-mizah': 25,
        }
      },
      {
        id: 'philosophical_poetic',
        label: 'Felsefi, Şiirsel, Düşündürücü ve Sanatsal',
        description: 'Varoluş sorgulamaları, zengin imgeler, editoryal derinlik.',
        mainGenreScores: {
          'edebi-kurgu': 40,
          'siir': 40,
          'deneysel-ve-hibrit-kurgu': 25,
          'manevi-ve-metafizik-kurgu': 20,
        },
        subGenreScores: {
          'felsefi-kurgu': 30,
          'buyulu-gercekcilik': 30,
          'lirik-siir': 30,
        }
      },
      {
        id: 'innocent_youthful',
        label: 'Masum, Keşif Dolu ve Çocuksu',
        description: 'Temiz bir hayal gücü, dost canlısı hayvanlar veya okul çağının heyecanı.',
        mainGenreScores: {
          'cocuk-ve-orta-yas-grubu-kurgu': 45,
          'hayvan-kurgusu': 30,
          'genc-kurgu': 20,
        },
        subGenreScores: {
          'cocuk-fantastigi': 30,
          'hayvan-macerasi': 30,
        }
      }
    ]
  },

  // 5. SORU: ROMANTİZMİN HİKÂYEDEKİ ROLÜ
  {
    id: 'romance_role',
    title: 'Romantizm bu hikâyenin neresinde duruyor?',
    subtitle: 'Aşk ilişkisinin hikâye kurgusundaki ağırlığını belirtin.',
    options: [
      {
        id: 'romance_core',
        label: 'Hikâyenin Kalbinde (Merkez Odak)',
        description: 'Romantizm ve iki karakterin bağı çıkarsa hikâyenin ana çatışması çöker.',
        mainGenreScores: {
          'romantik': 60,
        },
        subGenreScores: {
          'cagdas-romantik': 25,
          'tarihsel-romantik': 25,
        }
      },
      {
        id: 'romance_strong_sub',
        label: 'Güçlü Bir Yan Akış (Subplot)',
        description: 'Ana macera/gizem sürerken çok güçlü ve tatmin edici bir aşk hikâyesi eşlik eder.',
        mainGenreScores: {
          'romantik': 15,
        },
        subGenreScores: {
          'romantik-fantastik': 30,
          'romantik-gerilim': 30,
          'romantik-komedi': 25,
        }
      },
      {
        id: 'romance_minimal_none',
        label: 'Yok veya Çok Az (Önemsiz)',
        description: 'Odak tamamen macera, aksiyon, gizem veya felsefedir; aşk bağı yok denecek kadar azdır.',
        mainGenreScores: {
          'romantik': -40,
        }
      }
    ]
  },

  // 6. SORU: ÖZEL MOTİF VEYA TÜR RENGİ (ÇOKLU SEÇİLEBİLİR YA DA ATLANABİLİR)
  {
    id: 'special_motifs',
    title: 'Hikâyenizde öne çıkan özel bir motif veya lezzet var mı?',
    subtitle: 'Varsa eserinize en çok uyanları seçin, yoksa doğrudan sonuçları görebilirsiniz.',
    multiSelect: true,
    options: [
      {
        id: 'motif_academy',
        label: 'Büyü Akademisi / Okul Kurgusu',
        description: 'Dersler, sınavlar, okul içi rekabet ve dostluklar.',
        mainGenreScores: {
          'fantastik': 15,
          'genc-kurgu': 15,
        },
        subGenreScores: {
          'buyu-akademisi': 40,
          'lise-ve-akademi': 35,
        }
      },
      {
        id: 'motif_xianxia',
        label: 'Ölümsüzlük, Dao ve Kadim Asya',
        description: 'Xianxia, Wuxia, mezhepler, qi enerjisi ve dao arayışı.',
        mainGenreScores: {
          'dogu-ve-asya-kurgu': 40,
        },
        subGenreScores: {
          'xianxia': 40,
          'wuxia': 40,
        }
      },
      {
        id: 'motif_litrpg',
        label: 'Kule Tırmanışı / LitRPG / Zindan',
        description: 'Seviye atlama, canavar dalgaları, yetenek kartları.',
        mainGenreScores: {
          'macera-fantastigi-ve-oyunlasmis-kurgu': 40,
        },
        subGenreScores: {
          'litrpg': 40,
          'zindan-ve-kule-kurgusu': 40,
        }
      },
      {
        id: 'motif_cyberpunk',
        label: 'Siberpunk / Yüksek Teknoloji - Düşük Yaşam',
        description: 'Neon ışıklar, mega holdingler, hackerlar, sibernetik protezler.',
        mainGenreScores: {
          'bilim-kurgu': 20,
          'distopya-ve-spekulatif-kurgu': 20,
        },
        subGenreScores: {
          'siberpunk': 45,
        }
      },
      {
        id: 'motif_western',
        label: 'Vahşi Batı, Kovboylar ve Kanun Kaçakları',
        description: 'Tozlu kasabalar, revolverler, altın avı, kanunsuz sınırlar.',
        mainGenreScores: {
          'western': 50,
        },
        subGenreScores: {
          'klasik-vahsi-bati': 40,
          'kanun-kacagi-ve-odul-avcisi': 40,
        }
      },
      {
        id: 'motif_animals',
        label: 'Konuşan Hayvanlar veya Vahşi Doğa',
        description: 'Hayvanların bakış açısından dünya veya hayvan dostlukları.',
        mainGenreScores: {
          'hayvan-kurgusu': 50,
        },
        subGenreScores: {
          'hayvan-macerasi': 40,
          'insanbicimci-antropomorfik-hayvanlar': 40,
        }
      },
      {
        id: 'motif_politics',
        label: 'Siyasi Entrika, Hukuk ve Mahkeme',
        description: 'Bürokrasi, davalar, siyasi manipülasyonlar, meclis kavgaları.',
        mainGenreScores: {
          'toplumsal-ve-politik-kurgu': 45,
        },
        subGenreScores: {
          'mahkeme-ve-hukuk-drami': 40,
          'politik-entrika': 40,
        }
      },
      {
        id: 'motif_experimental',
        label: 'Üstkurgu, Çoklu Bakış Açısı ve Deneysel Biçim',
        description: 'Alışılmadık anlatım teknikleri, mektuplar, günlükler, parça parça kurgu.',
        mainGenreScores: {
          'deneysel-ve-hibrit-kurgu': 50,
        },
        subGenreScores: {
          'ustkurgu-metafiction': 40,
          'hibrit-ve-cok-lu-anlati': 40,
        }
      }
    ]
  }
];

/**
 * Yazara verilen cevapları analiz edip normalize edilmiş yüzdelerle eşleşme çıkaran akıllı motor
 */
export function calculateGenreMatches(answers: Record<string, string | string[]>): GenreFinderResult {
  const mainScores: Record<string, number> = {};
  const subScores: Record<string, number> = {};

  // Tüm 30 ana türü 0 tabanıyla başlat
  MAIN_GENRES.forEach((g) => {
    mainScores[g.id] = 0;
  });

  // Cevapları dolaşıp puanları biriktir
  for (const question of GENRE_FINDER_QUESTIONS) {
    const rawAnswer = answers[question.id];
    if (!rawAnswer) continue;

    const selectedOptionIds = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];

    for (const optId of selectedOptionIds) {
      const option = question.options.find((o) => o.id === optId);
      if (!option) continue;

      // Ana tür puanları
      for (const [genreId, score] of Object.entries(option.mainGenreScores)) {
        if (mainScores[genreId] !== undefined) {
          mainScores[genreId] += score;
        }
      }

      // Alt tür puanları
      if (option.subGenreScores) {
        for (const [subId, score] of Object.entries(option.subGenreScores)) {
          subScores[subId] = (subScores[subId] || 0) + score;
        }
      }
    }
  }

  // En yüksek puanı bulup yüzdeleri normalize et
  let highestMainScore = 0;
  for (const score of Object.values(mainScores)) {
    if (score > highestMainScore) highestMainScore = score;
  }

  // Güvenlik: Eğer hiçbir şey seçilmediyse
  if (highestMainScore <= 0) highestMainScore = 1;

  // Sıralı ana tür sonuçları
  const sortedMainGenres = Object.entries(mainScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const matches: GenreFinderMatch[] = sortedMainGenres.map(([genreId, score]) => {
    const mainGenre = getMainGenreById(genreId)!;

    // Bu ana türün maksimum skoru 85–98 bandında olacak şekilde oranla
    const percentage = Math.min(98, Math.max(35, Math.round((score / highestMainScore) * 94)));

    // Bu ana türe ait alt türleri puanlarına göre sırala
    const candidateSubGenres = mainGenre.subGenres.map((sub) => {
      const subScore = subScores[sub.id] || 0;
      // Alt tür yüzdesi: eğer puanı varsa %70-96 bandında, yoksa temel ana tür yüzdesinden biraz düşür
      const subPercentage = subScore > 0 
        ? Math.min(96, Math.max(60, Math.round((subScore / 60) * 40 + percentage * 0.6)))
        : Math.max(40, Math.round(percentage * 0.7));

      return {
        id: sub.id,
        name: sub.name,
        percentage: subPercentage,
        score: subScore
      };
    });

    candidateSubGenres.sort((a, b) => b.percentage - a.percentage);

    return {
      mainGenre,
      score,
      percentage,
      recommendedSubGenres: candidateSubGenres.slice(0, 5) // En yüksek 5 alt tür önerisi
    };
  });

  const topMatch = matches[0] || {
    mainGenre: MAIN_GENRES[0],
    percentage: 85,
    score: 50,
    recommendedSubGenres: MAIN_GENRES[0].subGenres.slice(0, 3).map((s) => ({
      id: s.id,
      name: s.name,
      percentage: 80
    }))
  };

  const alternatives = matches.slice(1, 4);

  return {
    topMatch,
    alternatives
  };
}
