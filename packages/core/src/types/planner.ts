import { Timestamp } from 'firebase/firestore';

export interface ModuleA {
  characterTraits: string;
  showTraitsWays: string;
  hook: string;
  characterDevelopment: string;
  internalState: string;
  mystery: string;
  atmosphere: string[];
  atmosphereNotes: string;
  closure: string;
}

export interface ModuleC {
  perceptionIllusion: string;
  motivations: string;
  unknownDetails: string;
  surpriseEventForReader: string;
  surpriseEventForCharacter: string;
  impactAnalysis: string;
}

export interface ModuleD {
  protagonistEnding: string;
  antagonistEnding: string;
  startingPoint: string;
  endingPoint: string;
  symbolOfChange: string;
  whoRemained: string;
  emotionalImpact: string;
  pricePaid: string;
  alternativeEnding: string;
}

export interface StoryPlanner {
  storyId: string;
  moduleA?: Partial<ModuleA>;
  moduleC?: Partial<ModuleC>;
  moduleD?: Partial<ModuleD>;
  updatedAt: Timestamp;
}

export interface ActStageConfig {
  id: string;
  act: 1 | 2 | 3;
  actLabel: string;
  name: string;
  description: string;
  tip: string;
}

export const ACT_STAGE_CONFIGS: ActStageConfig[] = [
  // 1. Perde
  {
    id: 'act1_setup',
    act: 1,
    actLabel: '1. Perde: Giriş',
    name: '1. Giriş & Statüko (Opening Setup)',
    description: 'Karakterin sıradan dünyası, mevcut yaşam tarzı ve eksikliği tanıtılır.',
    tip: 'Karakterin temel kusurunu veya hayatındaki eksik parçayı ilk sahnede hissettirin.',
  },
  {
    id: 'act1_inciting',
    act: 1,
    actLabel: '1. Perde: Giriş',
    name: '2. Tetikleyici Olay (Inciting Incident)',
    description: 'Statükoyu bozan, karakteri harekete geçmeye zorlayan olay gerçekleşir.',
    tip: 'Karakterin eski konfor alanına dönmesini imkânsız kılacak bir kıvılcım yaratın.',
  },
  {
    id: 'act1_debate',
    act: 1,
    actLabel: '1. Perde: Giriş',
    name: '3. Tereddüt & Eşik (Debate / Refusal)',
    description: 'Karakter çağrıya direnmeye çalışır, korkuları ve riskler tartılır.',
    tip: 'Tereddüt ne kadar gerçekçi olursa, karakterin eşikten adımı o kadar güçlü yankı bulur.',
  },
  // 2. Perde (2A)
  {
    id: 'act2a_break',
    act: 2,
    actLabel: '2. Perde (A): Yeni Dünya',
    name: '4. İkinci Perdeye Geçiş (Break into Two)',
    description: 'Geri dönüşü olmayan eşik aşılır, karakter yeni kurallarla dolu bir dünyaya adım atar.',
    tip: 'Artık eski hayat geride kaldı; karakterin kendi iradesiyle aldığı bir kararla eşiği geçirin.',
  },
  {
    id: 'act2a_b_story',
    act: 2,
    actLabel: '2. Perde (A): Yeni Dünya',
    name: '5. B Hikâyesi (B-Story / Mentor Bağı)',
    description: 'Temayı taşıyacak yeni bir ilişki (aşk, mentor, rakip veya dost) sahneye girer.',
    tip: 'B hikâyesi, karakterin içsel zaafını aşmasına yardımcı olacak felsefi aynadır.',
  },
  {
    id: 'act2a_games',
    act: 2,
    actLabel: '2. Perde (A): Yeni Dünya',
    name: '6. Eğlence ve Sınavlar (Fun & Games)',
    description: 'Kurgunun vaat ettiği temel macera, yeni yetenekler ve ilk mikro çatışmalar.',
    tip: 'Okurun türden beklediği eğlenceli ve heyecanlı anları bu aşamada cömertçe sergileyin.',
  },
  {
    id: 'act2a_midpoint',
    act: 2,
    actLabel: '2. Perde (A): Yeni Dünya',
    name: '7. Dönüm Noktası (Midpoint Shift)',
    description: 'Sahte zafer veya sahte yenilgi; riskler iki katına çıkar, sırlar açığa çıkar.',
    tip: 'Karakter bu andan itibaren pasif tepki veren olmaktan çıkıp proaktif mücadeleye geçmeli.',
  },
  // 2. Perde (2B)
  {
    id: 'act2b_bad_guys',
    act: 2,
    actLabel: '2. Perde (B): Kriz',
    name: '8. Çember Daralıyor (Bad Guys Close In)',
    description: 'Düşman güçlenir, içeriden ihanet veya anlaşmazlık baş gösterir, planlar çöker.',
    tip: 'Dış baskı arttıkça karakterin eski zaafı yeniden nükseder ve onu hataya sürükler.',
  },
  {
    id: 'act2b_all_is_lost',
    act: 2,
    actLabel: '2. Perde (B): Kriz',
    name: '9. Her Şey Kaybedildi (All is Lost)',
    description: 'En büyük darbe; sembolik veya gerçek bir ölüm, umudun tamamen tükendiği an.',
    tip: 'Eski yöntemlerin kesin olarak öldüğünü ilan edin. Burası küllerin kaldığı yerdir.',
  },
  {
    id: 'act2b_dark_night',
    act: 2,
    actLabel: '2. Perde (B): Kriz',
    name: '10. Ruhun Karanlık Gecesi (Dark Night of the Soul)',
    description: 'Dibe vurma, öz-sorgulama; karakter nihayet kendi zaafıyla yüzleşir.',
    tip: 'En karanlık şafak öncesi sessizlik: Karakter asıl ihtiyacının ne olduğunu burada anlar.',
  },
  // 3. Perde
  {
    id: 'act3_break',
    act: 3,
    actLabel: '3. Perde: Çözüm & Doruk',
    name: '11. Üçüncü Perdeye Geçiş (Break into Three)',
    description: 'Yeni bir fikir, zaafı aşarak yeni benlikle son savaşa hazırlanma kararı.',
    tip: 'Eski kusurlu taktikler yerine yeni öğrenilen felsefe ve cesaret devreye girer.',
  },
  {
    id: 'act3_climax',
    act: 3,
    actLabel: '3. Perde: Çözüm & Doruk',
    name: '12. Doruk Çatışması (Finale / Climax)',
    description: 'Ana düşman veya temel engelle nihai hesaplaşma; yüksek tempo ve gerilim.',
    tip: 'Zafer fiziksel güçle değil, karakterin içsel zaafını aşmış olması sayesinde kazanılmalı.',
  },
  {
    id: 'act3_resolution',
    act: 3,
    actLabel: '3. Perde: Çözüm & Doruk',
    name: '13. Yeni Denge & Kapanış (Final Image)',
    description: 'Dönüşen karakter, yeni dünya düzeni ve okuyucuya kalan tatmin edici kapanış.',
    tip: 'Başlangıçtaki statüko ile bu anı karşılaştırın; karakterin ne kadar dönüştüğünü gösterin.',
  },
];

export interface ArcStepConfig {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  tip: string;
}

export const CHARACTER_ARC_STEP_CONFIGS: ArcStepConfig[] = [
  {
    id: 'startingState',
    stepNumber: 1,
    name: '1. Başlangıç Durumu (Statüko)',
    description: 'Karakterin konfor alanı ve kendini kandırdığı sahte inanç.',
    tip: 'Karakter henüz değişmesi gerektiğinin farkında değildir.',
  },
  {
    id: 'flawOrLack',
    stepNumber: 2,
    name: '2. Zaafın Sınanması (Flaw Tested)',
    description: 'Karakterin temel kusuru (kibir, güvensizlik, bencillik vb.) zorlanır.',
    tip: 'Karakter zaafını savunmaya çalışırken durumu daha da karmaşıklaştırır.',
  },
  {
    id: 'incitingIncident',
    stepNumber: 3,
    name: '3. Tetikleyici Kırılma (Catalyst)',
    description: 'Eski hayatı imkansız kılan olay karşısında karakterin tepkisi.',
    tip: 'Karakter mecburen yeni bir adım atmak zorunda kalır.',
  },
  {
    id: 'firstChange',
    stepNumber: 4,
    name: '4. İlk Şüphe & Uyum (First Glimpse)',
    description: 'Karakter yeni yöntemleri dener ama hâlâ eski alışkanlıklarına tutunur.',
    tip: 'Değişimin mümkün olduğunu ilk kez sezer ama tam teslim olmaz.',
  },
  {
    id: 'majorShift',
    stepNumber: 5,
    name: '5. Büyük Kırılma (Major Shift)',
    description: 'Dönüm noktasında karakterin inançlarında köklü bir sarsıntı yaşanır.',
    tip: 'Artık eski düşünce tarzının onu kurtarmayacağını hisseder.',
  },
  {
    id: 'crisis',
    stepNumber: 6,
    name: '6. Kriz & Çaresizlik (Lowest Point)',
    description: 'Eski zaaf yüzünden yaşanan büyük kayıp veya başarısızlık.',
    tip: 'Karakter kendi kusurunun doğurduğu sonuçlarla yüzleşip dibe vurur.',
  },
  {
    id: 'climaxDecision',
    stepNumber: 7,
    name: '7. Dönüşüm Kararı (Climax Choice)',
    description: 'Zaafı terk edip gerçek ihtiyacını seçme anı.',
    tip: 'Karakter kendini değil, daha büyük bir ideali veya sevdiklerini seçer.',
  },
  {
    id: 'finalState',
    stepNumber: 8,
    name: '8. Final Benliği (Transformed State)',
    description: 'Yeni bilgelik, güç ve içsel dengeye kavuşmuş yeni karakter.',
    tip: 'Karakter başlangıçtaki zayıflığından arınmış olarak dünyayı kucaklar.',
  },
];

export interface PacingConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
}

export const PACING_CONFIGS: PacingConfig[] = [
  {
    id: 'action',
    name: '⚡ Hızlı Aksiyon & Kaçış',
    badge: 'Yüksek Ritim',
    description: 'Kısa cümleler, fiziksel tehlike, kovalamaca ve yüksek adrenalin.',
  },
  {
    id: 'dialogue',
    name: '🗣️ Diyalog & Karakter Bağı',
    badge: 'Orta Ritim',
    description: 'Fikir çatışmaları, duygusal itiraflar ve karakter dinamikleri.',
  },
  {
    id: 'mystery',
    name: '🔍 Gizem & İpucu Keşfi',
    badge: 'Merak Temposu',
    description: 'Detayların incelenmesi, dedektiflik, gizli sırların açığa çıkışı.',
  },
  {
    id: 'climax',
    name: '💥 Kriz & Doruk Çatışması',
    badge: 'Zirve Gerilim',
    description: 'Dramatik dönüm noktası, büyük hesaplaşma ve duygusal patlama.',
  },
  {
    id: 'calm',
    name: '🌅 Fırtına Öncesi Sessizlik',
    badge: 'Durgun Ritim',
    description: 'Atmosferik dinginlik, stratejik planlama ve yaklaşan tehlikenin gölgesi.',
  },
];

export interface ModuleB {
  todoList?: { id: string; text: string; isCompleted: boolean }[];
  internalStateStart?: string;
  internalStateEnd?: string;
  externalStateStart?: string;
  externalStateEnd?: string;
  importantDetails?: string;
  mainConflict?: string;
  risingAction?: string;
  chapterClimax?: string;
  fallingAction?: string;
  hookForNext?: string;

  // 3 Perdeli Olay Örgüsü & Ritim
  actStage?: string;
  pacing?: string;
  sceneGoal?: string;
  sceneObstacle?: string;
  sceneOutcome?: string;

  // Karakter Arkı
  focusedCharacterId?: string;
  focusedCharacterName?: string;
  characterArcStep?: string;
  characterFlawNotes?: string;
}

export interface ChapterPlanner {
  chapterId: string;
  storyId: string;
  moduleB?: Partial<ModuleB>;
  updatedAt: Timestamp;
}
