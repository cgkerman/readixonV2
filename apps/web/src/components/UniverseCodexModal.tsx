'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Search, 
  Scroll, 
  Users, 
  Compass, 
  Sword, 
  Zap, 
  HelpCircle, 
  FileText, 
  Globe, 
  Crown, 
  Dna, 
  Skull, 
  MapPin, 
  Flame, 
  Calendar,
  Volume2,
  VolumeX,
  ListOrdered
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type Universe,
  type Character,
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
  type CreatureType,
  type CreatureDangerLevel,
  type UniverseCulture,
  type UniverseCanonRule,
  type UniversePlotThread,
  type UniverseDivinationSystem,
  type UniverseDivinationCard,
  type UniverseSpell,
  type UniverseRitual,
  type Story,
  getUniverseSpells,
  getUniverseDivinations,
  getUniverseRituals,
  getCharacterRoleLabel,
  getUniverseGenreLabel,
  LOCATION_TYPE_LABELS,
  CANON_RULE_CATEGORY_LABELS,
  SPELL_TIER_LABELS,
  PLOT_THREAD_STATUS_LABELS
} from '@readixon/core';

export type CodexTheme = 'parchment' | 'grimoire' | 'ivory';

export interface UniverseCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe: Universe;
  characters?: Character[];
  locations?: UniverseLocation[];
  timelineEvents?: UniverseTimelineEvent[];
  glossaryTerms?: UniverseGlossaryTerm[];
  loreList?: UniverseLore[];
  maps?: UniverseMap[];
  organizations?: UniverseOrganization[];
  items?: UniverseItem[];
  powerSystems?: UniversePowerSystem[];
  races?: UniverseRace[];
  creatures?: UniverseCreature[];
  cultures?: UniverseCulture[];
  canonRules?: UniverseCanonRule[];
  plotThreads?: UniversePlotThread[];
  stories?: Story[];
  divinations?: UniverseDivinationSystem[];
  spells?: UniverseSpell[];
  rituals?: UniverseRitual[];
  onNavigateTab?: (tab: string) => void;
}

interface ChapterDefinition {
  id: string;
  spreadIndex: number;
  title: string;
  subtitle: string;
  icon: string;
  ribbonBg: string;
  countLabel: string;
}

export const CODEX_ORG_TYPE_LABELS: Record<string, string> = {
  kingdom: 'Krallık',
  empire: 'İmparatorluk',
  guild: 'Lonca',
  school: 'Akademi / Okul',
  cult: 'Tarikat / Kült',
  corporation: 'Şirket / Konsorsiyum',
  family: 'Hanedan / Soy / Aile',
  secret_society: 'Gizli Örgüt',
  army: 'Ordu / Birlik',
  other: 'Örgüt / Topluluk',
};
export const getCodexOrgTypeLabel = (type?: string): string => {
  if (!type) return 'Örgüt';
  const norm = type.toLowerCase().trim();
  return CODEX_ORG_TYPE_LABELS[norm] || type;
};

export const CODEX_ITEM_TYPE_LABELS: Record<string, string> = {
  weapon: 'Efsanevi Silah',
  armor: 'Zırh / Kıyafet',
  relic: 'Kutsal Emanet',
  artifact: 'Kadim Artefakt',
  book: 'Büyü Kitabı / Parşömen',
  tome: 'Kadim Kitap',
  potion: 'Simya / İksir',
  ring: 'Yüzük / Tılsım',
  amulet: 'Muska / Madalyon',
  tool: 'Alet / Ekipman',
  key: 'Kadim Anahtar',
  other: 'Kutsal Emanet',
  silah: 'Efsanevi Silah',
  zırh: 'Zırh / Kıyafet',
  emanet: 'Kutsal Emanet',
  artefakt: 'Kadim Artefakt',
  iksir: 'Simya / İksir',
};
export const getCodexItemTypeLabel = (type?: string): string => {
  if (!type) return 'Kutsal Emanet';
  const norm = type.toLowerCase().trim();
  return CODEX_ITEM_TYPE_LABELS[norm] || type;
};

export const CODEX_CREATURE_DANGER_LABELS: Record<string, string> = {
  harmless: 'Zararsız / Evcil',
  low: 'Düşük Tehlike',
  medium: 'Orta Tehlike',
  high: 'Yüksek Tehlike',
  deadly: 'Ölümcül',
  calamity: 'Felaket Seviyesi',
};
export const getCreatureDangerLabel = (level?: string): string => {
  if (!level) return 'Bilinmiyor';
  const norm = level.toLowerCase().trim();
  return CODEX_CREATURE_DANGER_LABELS[norm] || level;
};

export const getCodexVisibilityLabel = (vis?: string): string => {
  if (vis === 'public') return 'Herkese Açık Kanon';
  if (vis === 'unlisted') return 'Liste Dışı Kanon';
  return 'Yazarın Gizli Taslağı';
};

/**
 * Web Audio API ile sıfır harici dosya bağımlılığıyla gerçekçi sayfa çevirme (hışırtı) sesi sentezleyici
 */
function playPageFlipSound(isMuted: boolean) {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // 140ms organik kağıt hışırtı gürültüsü
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Pembe gürültü / yumuşak sönümleme
      const envelope = Math.exp(-i / (bufferSize * 0.32));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Alçak geçiren filtre (kağıdın tok sesini verir)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.14);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.14);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch {
    // Ses desteği yoksa sessizce devam et
  }
}

export function UniverseCodexModal({
  isOpen,
  onClose,
  universe,
  characters = [],
  locations = [],
  timelineEvents = [],
  glossaryTerms = [],
  loreList = [],
  maps = [],
  organizations = [],
  items = [],
  powerSystems = [],
  races = [],
  creatures = [],
  cultures = [],
  canonRules = [],
  plotThreads = [],
  stories = [],
  divinations: initialDivinations,
  spells: initialSpells,
  rituals: initialRituals,
  onNavigateTab
}: UniverseCodexModalProps) {
  // Aktif İki Sayfalık Yaprak İndeksi (0..7)
  const [currentSpread, setCurrentSpread] = useState(0);
  
  // Mobil Tek Sayfa Modu: Sol Sayfa (0) veya Sağ Sayfa (1)
  const [mobilePageSide, setMobilePageSide] = useState<'left' | 'right'>('left');
  
  // Temalar
  const [theme, setTheme] = useState<CodexTheme>('parchment');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Sayfa Çevirme Animasyon Durumu
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // İçindekiler / Fihrist Popover
  const [showToc, setShowToc] = useState(false);
  
  // Dokunmatik Ekran Swipe Takibi
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Mistik Sanatlar verisi
  const [internalSpells, setInternalSpells] = useState<UniverseSpell[]>([]);
  const [internalDivinations, setInternalDivinations] = useState<UniverseDivinationSystem[]>([]);
  const [internalRituals, setInternalRituals] = useState<UniverseRitual[]>([]);

  useEffect(() => {
    if (!isOpen || !universe?.universeId) return;

    if (!initialSpells || !initialDivinations || !initialRituals) {
      Promise.all([
        getUniverseSpells(universe.universeId).catch(() => []),
        getUniverseDivinations(universe.universeId).catch(() => []),
        getUniverseRituals(universe.universeId).catch(() => []),
      ]).then(([s, d, r]) => {
        setInternalSpells(s);
        setInternalDivinations(d);
        setInternalRituals(r);
      });
    }
  }, [isOpen, universe?.universeId, initialSpells, initialDivinations, initialRituals]);

  const spells = initialSpells || internalSpells;
  const divinations = initialDivinations || internalDivinations;
  const rituals = initialRituals || internalRituals;

  // Bölüm Tanımları ve İçerik Sayıları
  const CHAPTERS: ChapterDefinition[] = useMemo(() => [
    { id: 'cover', spreadIndex: 0, title: 'Kapak & Mühür', subtitle: 'Kozmoloji & Yaratılış', icon: '⚜️', ribbonBg: 'from-amber-700 to-amber-900', countLabel: 'Kozmoloji' },
    { id: 'canon', spreadIndex: 1, title: 'Kanon & Çağlar', subtitle: 'Seri Bible & Tarihçe', icon: '📜', ribbonBg: 'from-emerald-700 to-emerald-950', countLabel: `${canonRules.length} Kanon, ${timelineEvents.length} Olay` },
    { id: 'characters', spreadIndex: 2, title: 'Kişiler', subtitle: 'Dramatis Personae', icon: '👤', ribbonBg: 'from-blue-700 to-blue-950', countLabel: `${characters.length} Karakter` },
    { id: 'races', spreadIndex: 3, title: 'Halklar & Bestiary', subtitle: 'Irklar & Yaratıklar', icon: '🐾', ribbonBg: 'from-orange-700 to-orange-950', countLabel: `${races.length} Irk, ${creatures.length} Yaratık` },
    { id: 'atlas', spreadIndex: 4, title: 'Atlas & Coğrafya', subtitle: 'Diyarlar & Haritalar', icon: '🗺️', ribbonBg: 'from-teal-700 to-teal-950', countLabel: `${locations.length} Mekân, ${maps.length} Harita` },
    { id: 'mystic', spreadIndex: 5, title: 'Mistik Grimoire', subtitle: 'Büyüler & Kehanetler', icon: '🔮', ribbonBg: 'from-purple-700 to-purple-950', countLabel: `${spells.length} Büyü, ${divinations.length} Deste` },
    { id: 'factions', spreadIndex: 6, title: 'Hanedan & Emanetler', subtitle: 'Örgütler & Güçler', icon: '👑', ribbonBg: 'from-rose-700 to-rose-950', countLabel: `${organizations.length} Örgüt, ${items.length} Eşya` },
    { id: 'lexicon', spreadIndex: 7, title: 'Sırlar & Sözlük', subtitle: 'Kurgu Düğümleri', icon: '🗝️', ribbonBg: 'from-slate-700 to-slate-950', countLabel: `${plotThreads.length} Sır, ${glossaryTerms.length} Terim` },
  ], [canonRules.length, timelineEvents.length, characters.length, races.length, creatures.length, locations.length, maps.length, spells.length, divinations.length, organizations.length, items.length, plotThreads.length, glossaryTerms.length]);

  const TOTAL_SPREADS = CHAPTERS.length;

  // Gerçekçi 3D Sayfa Çevirme Aksiyonu
  const flipToSpread = useCallback((newSpreadIndex: number, direction?: 'next' | 'prev') => {
    if (newSpreadIndex < 0 || newSpreadIndex >= TOTAL_SPREADS || isFlipping) return;
    
    const dir = direction || (newSpreadIndex > currentSpread ? 'next' : 'prev');
    setFlipDirection(dir);
    setIsFlipping(true);
    
    // Ses sentezle
    playPageFlipSound(isAudioMuted);
    
    // Sayfayı güncelle
    setTimeout(() => {
      setCurrentSpread(newSpreadIndex);
      setMobilePageSide('left'); // Mobilde sol sayfadan başla
    }, 180);

    // Animasyonu bitir
    setTimeout(() => {
      setIsFlipping(false);
      setFlipDirection(null);
    }, 420);
  }, [TOTAL_SPREADS, isFlipping, currentSpread, isAudioMuted]);

  // Mobilde sayfa ilerletme
  const handleMobileNext = () => {
    if (mobilePageSide === 'left') {
      playPageFlipSound(isAudioMuted);
      setMobilePageSide('right');
    } else {
      if (currentSpread < TOTAL_SPREADS - 1) {
        flipToSpread(currentSpread + 1, 'next');
      }
    }
  };

  const handleMobilePrev = () => {
    if (mobilePageSide === 'right') {
      playPageFlipSound(isAudioMuted);
      setMobilePageSide('left');
    } else {
      if (currentSpread > 0) {
        flipToSpread(currentSpread - 1, 'prev');
        setMobilePageSide('right');
      }
    }
  };

  // Klavye kısayolları (← / →, Esc, F)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        flipToSpread(currentSpread + 1, 'next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        flipToSpread(currentSpread - 1, 'prev');
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSpread, flipToSpread, onClose]);

  // Tam Ekran Aç / Kapa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Dokunmatik Swipe Olayları
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
    
    // Yatay swipe dikey kaydırmadan belirgin ise
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Sola kaydırma -> İleri
        handleMobileNext();
      } else {
        // Sağa kaydırma -> Geri
        handleMobilePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Boş durumdan ilgili sekmeye yönlendirme
  const handleGoToStudioTab = (tabId: string) => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab(tabId);
    }
  };

  // HTML Karakter Kaçış Yardımcısı
  const escapeHtml = (str?: string): string => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // ══════════════════════════════════════════════════════════════════
  // PDF İNDİRME & BASKI MOTORU (14 SAYFALIK TAM EVREN KİTABI)
  // ══════════════════════════════════════════════════════════════════
  const handleExportPdf = () => {
    toast.info('Evren Defteriniz PDF olarak hazırlanıyor... Lütfen bekleyin.');

    const printWindow = window.open('', '_blank', 'width=960,height=1000');

    const contentHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(universe.title)} - Evren Defteri (Readixon)</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
      color: #24160a;
      background: #ffffff;
      line-height: 1.6;
      font-size: 11pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-sheet {
      page-break-after: always;
      break-after: page;
      min-height: 92vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double #b8860b;
      padding: 32px 30px;
      margin-bottom: 24px;
      background: #fdfbf7;
    }
    .print-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
      margin-bottom: 0;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #d4af37;
      padding-bottom: 8px;
      margin-bottom: 18px;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #7d5232;
    }
    .sheet-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #d4af37;
      padding-top: 8px;
      margin-top: 18px;
      font-size: 9pt;
      color: #7d5232;
    }
    h1 { font-size: 26pt; font-weight: bold; margin-bottom: 8px; color: #1e0e04; }
    h2 { font-size: 16pt; font-weight: bold; margin-bottom: 12px; color: #2b1404; border-bottom: 1px solid #eedcba; padding-bottom: 6px; }
    h3 { font-size: 12pt; font-weight: bold; margin-bottom: 6px; color: #3d1d06; }
    p { margin-bottom: 10px; text-align: justify; }
    .drop-cap::first-letter {
      font-size: 42pt;
      float: left;
      line-height: 0.85;
      margin-right: 12px;
      color: #8b3a0f;
      font-weight: bold;
    }
    .card {
      background: #f6efe1;
      border: 1px solid #d8c6a5;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 12px;
      break-inside: avoid;
    }
    .badge {
      display: inline-block;
      font-size: 8pt;
      font-family: sans-serif;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 999px;
      background: #e6dac0;
      color: #3b220c;
      border: 1px solid #caa87c;
    }
    .quote {
      font-style: italic;
      color: #72421a;
      border-left: 3px solid #b8860b;
      padding-left: 10px;
      margin: 8px 0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
    }
    .seal-box {
      width: 130px;
      height: 130px;
      margin: 20px auto;
      border-radius: 50%;
      border: 4px solid #b8860b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-weight: bold;
      color: #8b4513;
      background: #fcf6e8;
    }
    .no-print-bar {
      background: #18181b;
      color: #f4f4f5;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: sans-serif;
      font-size: 13px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .print-btn {
      background: #d97706;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }
    @media print {
      .no-print-bar { display: none !important; }
      body { background: white !important; }
      .print-sheet { border: 2px solid #b8860b; margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>📖 <strong>${escapeHtml(universe.title)}</strong> - Evren Defteri Baskı &amp; PDF Önizlemesi</span>
    <button class="print-btn" onclick="window.print()">🖨️ PDF Olarak Kaydet / Yazdır</button>
  </div>

  <!-- SAYFA 1: KAPAK & RESMÎ MÜHÜR -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Readixon Kadim Arşivi</span>
      <span>Resmî Evren Sicili</span>
    </div>
    <div style="text-align: center; margin: auto 0;">
      <div class="seal-box">
        <span style="font-size: 26px;">⚜️</span>
        <span style="font-size: 10px; margin-top: 4px;">KANON MÜHÜRLÜ</span>
      </div>
      <span class="badge" style="margin-bottom: 12px;">${escapeHtml(getUniverseGenreLabel(universe.genre)).toUpperCase()} EVRENİ</span>
      <h1>${escapeHtml(universe.title)}</h1>
      <p style="text-align: center; font-style: italic; color: #7d5232; max-width: 500px; margin: 0 auto 20px auto;">
        Bu defter, yazar ${escapeHtml(universe.authorName || 'Bilinmeyen Vakayinüvis')} tarafından yaratılan evrenin resmî kanonik kayıtlarını barındırır.
      </p>
      <div class="grid-2" style="max-width: 480px; margin: 0 auto; text-align: left;">
        <div class="card">
          <strong style="font-size: 9pt; opacity: 0.7; display: block;">Yaratıcı:</strong>
          <span>${escapeHtml(universe.authorName || 'Vakayinüvis')}</span>
        </div>
        <div class="card">
          <strong style="font-size: 9pt; opacity: 0.7; display: block;">Kanon Durumu:</strong>
          <span>${escapeHtml(getCodexVisibilityLabel(universe.visibility))}</span>
        </div>
        <div class="card">
          <strong style="font-size: 9pt; opacity: 0.7; display: block;">Bağlı Eserler:</strong>
          <span>${stories.length} Eser</span>
        </div>
        <div class="card">
          <strong style="font-size: 9pt; opacity: 0.7; display: block;">Sicil Kodu:</strong>
          <span style="font-family: monospace;">#${escapeHtml((universe.universeId || '0000').slice(0, 8))}</span>
        </div>
      </div>
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 1</span>
    </div>
  </div>

  <!-- SAYFA 2: ÖNSÖZ & KOZMOLOJİ -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm I: Kozmoloji &amp; Yaratılış</span>
      <span>Vakayinüvisin Önsözü</span>
    </div>
    <div>
      <h2>Vakayinüvisin Önsözü</h2>
      <p class="drop-cap">
        ${escapeHtml(universe.description || 'Bu evrenin yaratılış efsanesi henüz kağıda dökülmedi. Yazar, bu toprakların kökenini, gök kubbenin altındaki ilk kıvılcımı ve medeniyetlerin doğuşunu burada fısıldayacak.')}
      </p>
      <div class="card" style="margin-top: 24px;">
        <h3>Bu Evrenin Ruhu</h3>
        <p style="margin: 0;">
          Burada bulunan her karakter, büyü ve diyar birbirine görünmez kader bağlarıyla bağlıdır. Yazarın zihnindeki tüm kurgusal elementler bu defterde kalıcı bir mirasa dönüşür.
        </p>
      </div>
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 2</span>
    </div>
  </div>

  <!-- SAYFA 3: DEĞİŞTİRİLEMEZ KANON KURALLARI (SERİ BIBLE) -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm II: Kanon &amp; Seri Bible</span>
      <span>Sarsılmaz Temel Yasalar</span>
    </div>
    <div>
      <h2>Değiştirilemez Temel Kanunlar (§ Seri Bible)</h2>
      <p style="font-size: 10pt; color: #664422; margin-bottom: 16px;">
        Evrenin fizik, doğaüstü ve ahlaki sınırlarını çizen değiştirilemez kanon kuralları.
      </p>
      ${canonRules.length === 0 ? `
        <div class="card" style="text-align: center; padding: 24px;">
          <em>Bu evren için henüz kayıtlı bir kanon kuralı bulunmamaktadır.</em>
        </div>
      ` : canonRules.map((rule, idx) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong>§ ${idx + 1}. ${escapeHtml(rule.title)}</strong>
            <span class="badge">${escapeHtml(CANON_RULE_CATEGORY_LABELS[rule.category] || rule.category)}</span>
          </div>
          <p style="margin: 0; font-size: 10pt;">${escapeHtml(rule.description || rule.ruleDescription || '')}</p>
          ${rule.exceptions ? `<div class="quote" style="font-size: 9.5pt; margin-top: 6px;">İstisna: ${escapeHtml(rule.exceptions)}</div>` : ''}
        </div>
      `).join('')}
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 3</span>
    </div>
  </div>

  <!-- SAYFA 4: VAKAYİNAME & ÇAĞLAR (ZAMAN ÇİZELGESİ) -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm III: Vakayiname &amp; Tarihçe</span>
      <span>Zamanın Kırılma Noktaları</span>
    </div>
    <div>
      <h2>Tarihçe, Çağlar &amp; Vakayiname</h2>
      <p style="font-size: 10pt; color: #664422; margin-bottom: 16px;">
        Zamanın akışında vuku bulan büyük kırılmalar, savaşlar, taç giymeler ve felaketler.
      </p>
      ${timelineEvents.length === 0 ? `
        <div class="card" style="text-align: center; padding: 24px;">
          <em>Zaman çizelgesine henüz bir tarihsel olay işlenmedi.</em>
        </div>
      ` : timelineEvents.map((evt, idx) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong>${escapeHtml(evt.title)}</strong>
            <span class="badge" style="font-family: monospace;">${escapeHtml(evt.customDate || evt.era || `Çağ ${idx + 1}`)}</span>
          </div>
          <p style="margin: 0; font-size: 10pt;">${escapeHtml(evt.summary)}</p>
        </div>
      `).join('')}
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 4</span>
    </div>
  </div>

  <!-- SAYFA 5: DRAMATIS PERSONAE (KARAKTERLER) -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm IV: Dramatis Personae</span>
      <span>Şahsiyetler &amp; Aktörler</span>
    </div>
    <div>
      <h2>Dramatis Personae: Karakterler</h2>
      <p style="font-size: 10pt; color: #664422; margin-bottom: 16px;">
        Evrenin kaderine yön veren önemli kahramanlar, yoldaşlar ve düşmanlar.
      </p>
      ${characters.length === 0 ? `
        <div class="card" style="text-align: center; padding: 24px;">
          <em>Kayıtlı karakter profili bulunmamaktadır.</em>
        </div>
      ` : `
        <div class="grid-2">
          ${characters.map((char) => `
            <div class="card" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="font-size: 11pt;">${escapeHtml(char.name)}</strong>
                <span class="badge">${escapeHtml(getCharacterRoleLabel(char.role))}</span>
              </div>
              <p style="font-size: 9.5pt; margin-bottom: 6px;">
                ${escapeHtml(char.coreMotivation || char.occupation || char.authorNotes || 'Karakter profili kaydı.')}
              </p>
              ${char.rpgStats ? `
                <div style="font-size: 8.5pt; font-family: monospace; color: #664422;">
                  Güç: ${char.rpgStats.strength || 10} | Zeka: ${char.rpgStats.intelligence || 10} | Çeviklik: ${char.rpgStats.agility || 10}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 5</span>
    </div>
  </div>

  <!-- SAYFA 6: HALKLAR, IRKLAR & BESTIARY -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm V: Halklar &amp; Bestiary</span>
      <span>Irklar ve Yaratıklar</span>
    </div>
    <div>
      <h2>Kadim Halklar &amp; Bestiary (Canavarlar Günlüğü)</h2>
      
      <h3 style="margin-top: 14px;">Irklar &amp; Türler</h3>
      ${races.length === 0 ? `
        <p style="font-style: italic; font-size: 10pt; color: #775533;">Henüz tanımlanmış bir ırk kaydı yok.</p>
      ` : races.map((race) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between;">
            <strong>${escapeHtml(race.name)}</strong>
            <span style="font-size: 9pt; font-family: monospace;">Ömür: ${escapeHtml(race.lifespan || 'Belirtilmedi')}</span>
          </div>
          <p style="font-size: 9.5pt; margin: 4px 0 0 0;">${escapeHtml(race.physicalTraits || race.origin || race.culture || '')}</p>
        </div>
      `).join('')}

      <h3 style="margin-top: 18px;">Bestiary: Efsanevi Varlıklar</h3>
      ${creatures.length === 0 ? `
        <p style="font-style: italic; font-size: 10pt; color: #775533;">Henüz kaydedilmiş bir canavar bulunmuyor.</p>
      ` : creatures.map((creature) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>✦ ${escapeHtml(creature.name)}</strong>
            <span class="badge">${escapeHtml(getCreatureDangerLabel(creature.dangerLevel)).toUpperCase()}</span>
          </div>
          <p style="font-size: 9.5pt; margin: 4px 0 0 0;">${escapeHtml(creature.appearance || creature.behavior || creature.lore || '')}</p>
        </div>
      `).join('')}
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 6</span>
    </div>
  </div>

  <!-- SAYFA 7: ATLAS & COĞRAFYA -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm VI: Coğrafi Atlas</span>
      <span>Diyarlar, Kaleler &amp; Mekânlar</span>
    </div>
    <div>
      <h2>Coğrafi Atlas &amp; Mekânlar</h2>
      <p style="font-size: 10pt; color: #664422; margin-bottom: 16px;">
        Sınırları çizilmiş topraklar, başkentler, tapınaklar ve kadim anıtlar.
      </p>
      ${locations.length === 0 ? `
        <div class="card" style="text-align: center; padding: 24px;">
          <em>Atlas henüz haritalanmadı; mekanlar boş.</em>
        </div>
      ` : `
        <div class="grid-2">
          ${locations.map((loc) => `
            <div class="card" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong>${escapeHtml(loc.name)}</strong>
                <span class="badge">${escapeHtml(LOCATION_TYPE_LABELS[loc.type] || loc.type)}</span>
              </div>
              <p style="font-size: 9.5pt; margin-bottom: 4px;">${escapeHtml(loc.description || 'Mekân tasviri belirtilmedi.')}</p>
              ${loc.climate ? `<span style="font-size: 8.5pt; color: #7d5232; display: block;">İklim: ${escapeHtml(loc.climate)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 7</span>
    </div>
  </div>

  <!-- SAYFA 8: MİSTİK SANATLAR, BÜYÜLER & KEHANETLER -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm VII: Mistik Sanatlar</span>
      <span>Grimoire &amp; Kehanetler</span>
    </div>
    <div>
      <h2>Kadim Grimoire, Büyüler &amp; Fal Desteleri</h2>
      
      <h3 style="margin-top: 14px;">Büyü Kitabı &amp; Efsunlar (Kadim Grimoire)</h3>
      ${spells.length === 0 ? `
        <p style="font-style: italic; font-size: 10pt; color: #775533;">Bu evren için henüz kayıtlı büyü bulunmuyor.</p>
      ` : spells.map((spell) => {
        const tier = SPELL_TIER_LABELS[spell.tier];
        return `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong>✦ ${escapeHtml(spell.name)}</strong>
              <span class="badge">${escapeHtml(tier?.label || spell.tier)}</span>
            </div>
            ${spell.incantation ? `<div class="quote">&ldquo;${escapeHtml(spell.incantation)}&rdquo;</div>` : ''}
            <p style="font-size: 9.5pt; margin: 4px 0 0 0;">${escapeHtml(spell.effects)}</p>
            ${spell.costsAndBackfire ? `<div style="font-size: 8.5pt; color: #881111; margin-top: 4px;">Bedel / Risk: ${escapeHtml(spell.costsAndBackfire)}</div>` : ''}
          </div>
        `;
      }).join('')}

      <h3 style="margin-top: 18px;">Kehanetler &amp; Fal Desteleri</h3>
      ${divinations.length === 0 ? `
        <p style="font-style: italic; font-size: 10pt; color: #775533;">Tanımlı kehanet veya fal destesi bulunmuyor.</p>
      ` : divinations.map((div) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>🔮 ${escapeHtml(div.name)}</strong>
            <span class="badge">${div.cardsOrSymbols?.length || 0} Kart</span>
          </div>
          <p style="font-size: 9.5pt; margin: 4px 0 0 0;">${escapeHtml(div.description)}</p>
        </div>
      `).join('')}
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 8</span>
    </div>
  </div>

  <!-- SAYFA 9: ÖRGÜTLER, EMANETLER & KURGUSAL SIRLAR -->
  <div class="print-sheet">
    <div class="sheet-header">
      <span>Bölüm VIII: Hanedanlar &amp; Sırlar</span>
      <span>Örgütler, Kutsal Eşyalar &amp; Terimler</span>
    </div>
    <div>
      <h2>Hanedanlar, Kutsal Emanetler &amp; Kadim Sözlük</h2>
      
      <h3 style="margin-top: 14px;">Hanedanlar &amp; Örgütler</h3>
      ${organizations.length === 0 ? `
        <p style="font-style: italic; font-size: 10pt; color: #775533;">Kayıtlı hanedan veya örgüt yok.</p>
      ` : organizations.map((org) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>${escapeHtml(org.name)}</strong>
            <span class="badge">${escapeHtml(getCodexOrgTypeLabel(org.type))}</span>
          </div>
          <p style="font-size: 9.5pt; margin: 4px 0 0 0;">${escapeHtml(org.description)}</p>
          ${org.motto ? `<div class="quote">Slogan: &ldquo;${escapeHtml(org.motto)}&rdquo;</div>` : ''}
        </div>
      `).join('')}

      <h3 style="margin-top: 18px;">Emanetler &amp; Güç Sistemleri</h3>
      ${items.length === 0 ? `
        <p style="font-style: italic; font-size: 10pt; color: #775533;">Kayıtlı efsanevi eşya yok.</p>
      ` : items.map((it) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>⚔️ ${escapeHtml(it.name)}</strong>
            <span class="badge">${escapeHtml(getCodexItemTypeLabel(it.type))}</span>
          </div>
          <p style="font-size: 9.5pt; margin: 4px 0 0 0;">${escapeHtml(it.description)}</p>
        </div>
      `).join('')}

      <div style="text-align: center; margin-top: 36px; padding-top: 20px; border-top: 2px dashed #b8860b;">
        <span style="font-size: 20px; color: #b8860b;">⚜️ ❖ ⚜️</span>
        <h4 style="font-size: 11pt; text-transform: uppercase; letter-spacing: 2px; color: #7d5232; margin-top: 8px;">
          Burada yazılanlar resmî evren kanonudur.
        </h4>
        <p style="text-align: center; font-size: 9pt; color: #997755; margin-top: 4px;">
          Readixon Yazarlık İşletim Sistemi • Kadim Kodeks Arşivi
        </p>
      </div>
    </div>
    <div class="sheet-footer">
      <span>❖ Readixon Evren Kodeksi</span>
      <span>Sayfa 9</span>
    </div>
  </div>
</body>
</html>
    `;

    if (!printWindow) {
      window.print();
      return;
    }

    try {
      printWindow.document.open();
      printWindow.document.write(contentHtml);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        toast.success('Yazdırma penceresi açıldı. "Hedef" kısmından "PDF Olarak Kaydet" seçeneğini seçebilirsiniz.', { duration: 5000 });
      }, 500);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    }
  };

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════════════
  // TEMALAR: Global Dark Modundan Asla Etkilenmeyen Kesin Yüksek Kontrast Renkleri
  // ══════════════════════════════════════════════════════════════════
  const themeTokens = {
    parchment: {
      overlayBg: 'bg-[#180f08]/85',
      coverLeather: 'bg-[#29150a] border-[#b08738]/80 text-[#29150a] shadow-[0_30px_90px_rgba(0,0,0,0.9)]',
      pageBg: 'bg-[#faf6eb] text-[#2c1808]',
      pageBorder: 'border-[#dfceb0]',
      spineShadow: 'from-black/25 via-black/8 to-transparent',
      spineReverse: 'from-transparent via-black/8 to-black/25',
      title: 'text-[#1d0e04] font-serif',
      subtitle: 'text-[#69421f]',
      textPrimary: 'text-[#2a1708]',
      textSecondary: 'text-[#57361a]',
      cardBg: 'bg-[#f0e7d5] border-[#d8c7a8]',
      cardHighlight: 'bg-[#e9dec7] border-[#ccb793]',
      accentGold: 'text-[#966b0a]',
      dropCap: 'text-[#873809]',
      badgeBg: 'bg-[#e4d6bf] text-[#2c1706] border-[#cbb797]',
      dangerHarmless: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      dangerLow: 'bg-blue-100 text-blue-950 border-blue-300',
      dangerMedium: 'bg-amber-100 text-amber-950 border-amber-300',
      dangerHigh: 'bg-orange-100 text-orange-950 border-orange-300',
      dangerDeadly: 'bg-rose-100 text-rose-950 border-rose-300',
      dangerCalamity: 'bg-purple-100 text-purple-950 border-purple-300',
    },
    grimoire: {
      overlayBg: 'bg-[#090511]/90',
      coverLeather: 'bg-[#110c1c] border-purple-500/80 text-purple-100 shadow-[0_30px_90px_rgba(20,5,40,0.95)]',
      pageBg: 'bg-[#161224] text-[#f1e8ff]',
      pageBorder: 'border-purple-900/80',
      spineShadow: 'from-black/45 via-purple-950/25 to-transparent',
      spineReverse: 'from-transparent via-purple-950/25 to-black/45',
      title: 'text-[#f5edff] font-serif',
      subtitle: 'text-[#c084fc]',
      textPrimary: 'text-[#ede2fe]',
      textSecondary: 'text-[#c4b5fd]',
      cardBg: 'bg-[#221b38] border-[#3f2f66]',
      cardHighlight: 'bg-[#2b2247] border-[#553c8a]',
      accentGold: 'text-amber-400',
      dropCap: 'text-[#d8b4fe]',
      badgeBg: 'bg-[#332454] text-[#f3e8ff] border-[#5c4096]',
      dangerHarmless: 'bg-emerald-950 text-emerald-200 border-emerald-700',
      dangerLow: 'bg-blue-950 text-blue-200 border-blue-700',
      dangerMedium: 'bg-amber-950 text-amber-200 border-amber-700',
      dangerHigh: 'bg-orange-950 text-orange-200 border-orange-700',
      dangerDeadly: 'bg-rose-950 text-rose-200 border-rose-700',
      dangerCalamity: 'bg-purple-950 text-purple-200 border-purple-600',
    },
    ivory: {
      overlayBg: 'bg-[#0b1220]/85',
      coverLeather: 'bg-[#111927] border-amber-400/80 text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.9)]',
      pageBg: 'bg-[#ffffff] text-[#0f172a]',
      pageBorder: 'border-slate-200',
      spineShadow: 'from-black/18 via-black/5 to-transparent',
      spineReverse: 'from-transparent via-black/5 to-black/18',
      title: 'text-[#0f172a] font-serif',
      subtitle: 'text-[#475569]',
      textPrimary: 'text-[#1e293b]',
      textSecondary: 'text-[#334155]',
      cardBg: 'bg-[#f8fafc] border-[#cbd5e1]',
      cardHighlight: 'bg-[#f1f5f9] border-[#94a3b8]',
      accentGold: 'text-[#b45309]',
      dropCap: 'text-[#1e3a8a]',
      badgeBg: 'bg-[#e2e8f0] text-[#0f172a] border-[#cbd5e1]',
      dangerHarmless: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      dangerLow: 'bg-blue-100 text-blue-950 border-blue-300',
      dangerMedium: 'bg-amber-100 text-amber-950 border-amber-300',
      dangerHigh: 'bg-orange-100 text-orange-950 border-orange-300',
      dangerDeadly: 'bg-rose-100 text-rose-950 border-rose-300',
      dangerCalamity: 'bg-purple-100 text-purple-950 border-purple-300',
    }
  }[theme];

  const getCreatureDangerClass = (level: CreatureDangerLevel) => {
    switch (level) {
      case 'harmless': return themeTokens.dangerHarmless;
      case 'low': return themeTokens.dangerLow;
      case 'medium': return themeTokens.dangerMedium;
      case 'high': return themeTokens.dangerHigh;
      case 'deadly': return themeTokens.dangerDeadly;
      case 'calamity': return themeTokens.dangerCalamity;
      default: return themeTokens.badgeBg;
    }
  };

  // Arama filtresi
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const hits: { title: string; spreadIndex: number; type: string }[] = [];

    characters.forEach(c => {
      const roleLabel = getCharacterRoleLabel(c.role);
      if (
        c.name.toLowerCase().includes(q) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        roleLabel.toLowerCase().includes(q)
      ) {
        hits.push({ title: c.name, spreadIndex: 2, type: 'Karakter' });
      }
    });

    locations.forEach(l => {
      if (l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q))) {
        hits.push({ title: l.name, spreadIndex: 4, type: 'Mekân' });
      }
    });

    spells.forEach(s => {
      if (s.name.toLowerCase().includes(q) || (s.incantation && s.incantation.toLowerCase().includes(q))) {
        hits.push({ title: s.name, spreadIndex: 5, type: 'Büyü' });
      }
    });

    organizations.forEach(o => {
      if (o.name.toLowerCase().includes(q)) {
        hits.push({ title: o.name, spreadIndex: 6, type: 'Örgüt/Hanedan' });
      }
    });

    timelineEvents.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        hits.push({ title: t.title, spreadIndex: 1, type: 'Tarihi Olay' });
      }
    });

    return hits.slice(0, 6);
  }, [searchQuery, characters, locations, spells, organizations, timelineEvents]);

  return (
    <div 
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 overflow-hidden ${themeTokens.overlayBg} backdrop-blur-md select-none animate-in fade-in duration-200`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* ── 1. ÜST KONTROL PANELİ (RESPONSIVE HEADER) ── */}
      <header className="w-full max-w-7xl flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-black/75 border border-white/15 text-white shadow-2xl z-30 shrink-0">
        
        {/* Sol: Başlık & Rozet */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md">
            <BookOpen size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-amber-200">
                Evren Defteri
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold">
                {getUniverseGenreLabel(universe.genre)}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 max-w-[120px] sm:max-w-xs">
              {universe.title}
            </p>
          </div>
        </div>

        {/* Orta: İçerik İçi Hızlı Arama (Masaüstü) */}
        <div className="relative flex-1 max-w-xs hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kişi, mekân veya büyü ara..."
            className="w-full bg-white/10 hover:bg-white/15 focus:bg-zinc-900 border border-white/15 focus:border-amber-400 rounded-xl pl-8 pr-7 py-1 text-xs text-white placeholder:text-zinc-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}

          {/* Arama Sonuçları Mini Dropdown */}
          {searchMatches.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900/98 border border-amber-500/40 rounded-xl shadow-2xl p-2 space-y-1 z-50">
              <span className="text-[10px] text-zinc-400 font-bold px-2 block">İlgili Yaprağa Git:</span>
              {searchMatches.map((hit, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    flipToSpread(hit.spreadIndex);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-amber-500/20 text-zinc-200 hover:text-amber-300 flex items-center justify-between"
                >
                  <span className="font-semibold truncate">{hit.title}</span>
                  <span className="text-[10px] text-zinc-400 shrink-0 font-mono">{hit.type} ➔</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Fihrist, Tema, Ses, Boyut, Tam Ekran, Kapat */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          
          {/* İçindekiler / Fihrist Popover Butonu */}
          <button
            onClick={() => setShowToc(!showToc)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
              showToc ? 'bg-amber-600 text-white border-amber-500' : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200'
            }`}
            title="İçindekiler Fihristi"
          >
            <ListOrdered size={13} />
            <span className="hidden sm:inline">İçindekiler</span>
          </button>

          {/* Tema Seçici */}
          <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setTheme('parchment')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all text-xs font-semibold ${
                theme === 'parchment' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-zinc-300 hover:text-white'
              }`}
              title="Kadim Parşömen"
            >
              📜 <span className="hidden lg:inline">Parşömen</span>
            </button>
            <button
              onClick={() => setTheme('grimoire')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all text-xs font-semibold ${
                theme === 'grimoire' ? 'bg-purple-700 text-white font-bold shadow-xs' : 'text-zinc-300 hover:text-white'
              }`}
              title="Gece Grimoire'ı"
            >
              🔮 <span className="hidden lg:inline">Grimoire</span>
            </button>
            <button
              onClick={() => setTheme('ivory')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all text-xs font-semibold ${
                theme === 'ivory' ? 'bg-slate-700 text-white font-bold shadow-xs' : 'text-zinc-300 hover:text-white'
              }`}
              title="Kraliyet Elyazması"
            >
              🏛️ <span className="hidden lg:inline">Fildişi</span>
            </button>
          </div>

          {/* Sayfa Sesi Aç / Kapa */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-1 sm:p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 transition-all"
            title={isAudioMuted ? 'Sayfa çevirme sesini aç' : 'Sesi kapat'}
          >
            {isAudioMuted ? <VolumeX size={14} className="text-zinc-400" /> : <Volume2 size={14} className="text-amber-400" />}
          </button>

          {/* Yazı Boyutu */}
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="p-1 sm:px-2 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-zinc-200 transition-all"
            title="Yazı Boyutu"
          >
            {fontSize === 'normal' ? 'A+' : 'A-'}
          </button>

          {/* Yazdır / PDF İndir (Masaüstü & Mobil) */}
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-xs font-semibold text-amber-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Tüm Evren Defterini PDF Olarak İndir / Yazdır"
          >
            <Printer size={13} className="text-amber-300" />
            <span className="font-bold">PDF</span>
          </button>

          {/* Tam Ekran */}
          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 transition-all"
            title="Tam Ekran (F)"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Kapat */}
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 transition-all cursor-pointer ml-0.5"
            title="Kapat (Esc)"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* ── İÇİNDEKİLER (FİHRİST) AÇILIR MENÜSÜ ── */}
      {showToc && (
        <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 max-h-[75vh] overflow-y-auto rounded-2xl bg-zinc-950/95 border-2 border-amber-500/50 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="font-serif font-black text-sm text-amber-300 flex items-center gap-2">
              <ListOrdered size={16} />
              <span>İçindekiler & Bölüm Fihristi</span>
            </span>
            <button onClick={() => setShowToc(false)} className="text-zinc-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            {CHAPTERS.map((chap) => (
              <button
                key={chap.id}
                onClick={() => {
                  flipToSpread(chap.spreadIndex);
                  setShowToc(false);
                }}
                className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between border ${
                  currentSpread === chap.spreadIndex
                    ? 'bg-amber-600/30 border-amber-500 text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{chap.icon}</span>
                  <div className="truncate">
                    <span className="text-xs block font-serif truncate">{chap.title}</span>
                    <span className="text-[10px] text-zinc-400 block">{chap.subtitle}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/40 border border-white/10 text-amber-200 font-mono block">
                    {chap.countLabel}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-serif">Sayfa {chap.spreadIndex * 2 + 1}-{chap.spreadIndex * 2 + 2}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Fihrist İçi PDF İndir Butonu */}
          <div className="pt-2.5 mt-2.5 border-t border-white/10">
            <button
              onClick={() => {
                setShowToc(false);
                handleExportPdf();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Tüm Defteri PDF Olarak İndir / Yazdır</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 2. İPEK AYRAÇLAR (RIBBON BOOKMARKS) ── */}
      <div className="w-full max-w-6xl flex items-center justify-center gap-1 sm:gap-2 px-1 overflow-x-auto no-scrollbar scrollbar-none py-1 z-10 shrink-0">
        {CHAPTERS.map((chap) => {
          const isActive = currentSpread === chap.spreadIndex;
          return (
            <button
              key={chap.id}
              onClick={() => flipToSpread(chap.spreadIndex)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-t-xl text-[11px] sm:text-xs font-serif font-bold transition-all whitespace-nowrap cursor-pointer shadow-md select-none border-t border-x ${
                isActive
                  ? `bg-gradient-to-b ${chap.ribbonBg} text-white scale-105 border-white/40 shadow-lg -translate-y-0.5`
                  : 'bg-black/50 hover:bg-black/70 text-zinc-300 border-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              <span>{chap.icon}</span>
              <span className="hidden sm:inline">{chap.title}</span>
              <span className="sm:hidden">{chap.title.split(' ')[0]}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* ── MOBİL SAYFA SEÇİCİ (SOL SAYFA / SAĞ SAYFA SEKMESİ) ── */}
      <div className="md:hidden w-full max-w-xs flex items-center justify-center bg-black/60 p-0.5 rounded-xl border border-white/15 my-1 z-10">
        <button
          onClick={() => {
            playPageFlipSound(isAudioMuted);
            setMobilePageSide('left');
          }}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
            mobilePageSide === 'left' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sol Sayfa (Sayfa {currentSpread * 2 + 1})
        </button>
        <button
          onClick={() => {
            playPageFlipSound(isAudioMuted);
            setMobilePageSide('right');
          }}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
            mobilePageSide === 'right' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sağ Sayfa (Sayfa {currentSpread * 2 + 2})
        </button>
      </div>

      {/* ── 3. ANA DEFTER GÖVDESİ (3D PERSPEKTİFLİ KİTAP) ── */}
      <main
        style={{ perspective: '1600px' }}
        className={`w-full max-w-6xl flex-1 rounded-3xl p-2 sm:p-4 md:p-6 border-4 relative overflow-hidden transition-all duration-300 flex flex-col ${themeTokens.coverLeather}`}
      >
        {/* Antika Pirinç Köşe Süslemeleri */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/80 pointer-events-none rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/80 pointer-events-none rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/80 pointer-events-none rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/80 pointer-events-none rounded-br-lg" />

        {/* 3D Sayfa Çevirme Katmanı (Page Flip Transition) */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 flex-1 relative rounded-2xl overflow-hidden border shadow-inner transition-transform duration-300 ${
            themeTokens.pageBg
          } ${themeTokens.pageBorder} ${
            isFlipping
              ? flipDirection === 'next'
                ? 'scale-[0.98] -rotate-y-2 opacity-90'
                : 'scale-[0.98] rotate-y-2 opacity-90'
              : 'scale-100 rotate-y-0 opacity-100'
          }`}
        >
          {/* Ortadaki Gerçekçi Kitap Cilt Gölgelendirmesi (Spine Crease) */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 pointer-events-none z-20 flex">
            <div className={`w-1/2 h-full bg-gradient-to-r ${themeTokens.spineShadow}`} />
            <div className={`w-1/2 h-full bg-gradient-to-r ${themeTokens.spineReverse}`} />
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-black/20" />
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── SOL SAYFA (LEFT PAGE) ── */}
          {/* ══════════════════════════════════════════════════════ */}
          <div 
            className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar scrollbar-none relative border-b md:border-b-0 md:border-r ${
              themeTokens.pageBorder
            } ${themeTokens.textPrimary} ${fontSize === 'large' ? 'text-base' : 'text-sm'} ${
              mobilePageSide === 'right' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div>
              {/* Sayfa Üst Başlığı */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10">
                <span className={`text-[10px] sm:text-[11px] font-serif uppercase tracking-widest font-black ${themeTokens.subtitle}`}>
                  ❖ {CHAPTERS[currentSpread]?.title} • Sol
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  Kanon Arşivi
                </span>
              </div>

              {/* DİNAMİK SOL SAYFA İÇERİKLERİ */}
              {currentSpread === 0 && (
                /* KAPAK: SOL SAYFA (Mühür, Arma & Resmi Evren Künyesi) */
                <div className="space-y-4 text-center flex flex-col items-center justify-center min-h-[320px]">
                  <div className="w-32 h-44 sm:w-40 sm:h-52 rounded-2xl border-4 border-amber-600/60 overflow-hidden shadow-2xl relative bg-black/10 flex items-center justify-center">
                    {universe.coverImage ? (
                      <img src={universe.coverImage} alt={universe.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Globe size={44} className="text-amber-600/70 mb-2" />
                        <span className="text-xs font-serif font-bold text-amber-700">Kadim Evren Mührü</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-mono font-black tracking-widest px-3 py-1 rounded-full border border-amber-600/40 bg-amber-500/10 text-amber-800 uppercase">
                      Resmî Evren Sicili #{(universe.universeId || '0000').slice(0, 8)}
                    </span>
                    <h3 className={`text-xs font-serif italic ${themeTokens.textSecondary}`}>
                      Bu defter, yazarın zihnindeki evrenin kanonik kayıtlarını barındırır.
                    </h3>
                  </div>

                  <div className={`w-full max-w-sm grid grid-cols-2 gap-2 text-left p-3 rounded-xl border ${themeTokens.cardBg} text-xs`}>
                    <div>
                      <span className="text-[10px] block font-bold opacity-60">Yaratıcı & Yazar:</span>
                      <span className="font-bold truncate">{universe.authorName || 'Bilinmeyen Vakayinüvis'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block font-bold opacity-60">Evren Türü:</span>
                      <span className="font-bold">{getUniverseGenreLabel(universe.genre)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block font-bold opacity-60">Kanon Durumu:</span>
                      <span className="font-bold">{getCodexVisibilityLabel(universe.visibility)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block font-bold opacity-60">Bağlı Eserler:</span>
                      <span className="font-bold">{stories.length} Eser Kayıtlı</span>
                    </div>
                  </div>
                </div>
              )}

              {currentSpread === 1 && (
                /* KANON: SOL SAYFA (Seri Bible & Temel Kanunlar) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Değiştirilemez Temel Kanunlar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Evrenin fizik, doğaüstü ve ahlaki sınırlarını çizen sarsılmaz kanon kuralları.
                    </p>
                  </div>

                  {canonRules.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Scroll size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Bu evren için henüz bir Seri Bible veya kanon kuralı kaydedilmedi.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('canon_rules')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Kanon Kuralını Yaz ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {canonRules.map((rule, idx) => (
                        <div key={rule.id || idx} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              § {idx + 1}. {rule.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                              {CANON_RULE_CATEGORY_LABELS[rule.category] || rule.category}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed ${themeTokens.textPrimary}`}>
                            {rule.description || rule.ruleDescription || 'Kural açıklaması belirtilmedi.'}
                          </p>
                          {rule.exceptions && (
                            <p className="text-[11px] italic text-rose-700 border-l-2 border-rose-500/60 pl-2">
                              İstisna: {rule.exceptions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 2 && (
                /* KİŞİLER: SOL SAYFA (Kahramanlar) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Dramatis Personae: Kahramanlar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Evrenin kaderine yön veren önemli şahsiyetler ve kilit aktörler.
                    </p>
                  </div>

                  {characters.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Users size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Defterde henüz yaşayan bir karakter profili yok.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('characters')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        Karakter Ekle ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {characters.slice(0, 3).map((char) => (
                        <div key={char.id} className={`p-3 rounded-2xl border ${themeTokens.cardBg} flex gap-3 items-start`}>
                          <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-black/10 border border-black/15 flex items-center justify-center">
                            {char.avatarUrl ? (
                              <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users size={18} className="opacity-40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-serif font-black text-sm truncate">{char.name}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                                {getCharacterRoleLabel(char.role)}
                              </span>
                            </div>
                            <p className={`text-xs line-clamp-2 ${themeTokens.textSecondary}`}>
                              {char.coreMotivation || char.occupation || char.authorNotes || 'Karakter profili kaydı.'}
                            </p>
                            {char.rpgStats && (
                              <div className="flex gap-2 text-[10px] font-mono opacity-80 pt-0.5">
                                <span>Güç: {char.rpgStats.strength || 10}</span>
                                <span>Zeka: {char.rpgStats.intelligence || 10}</span>
                                <span>Çeviklik: {char.rpgStats.agility || 10}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {characters.length > 3 && (
                        <p className={`text-[11px] text-center italic ${themeTokens.textSecondary}`}>
                          ...ve diğer {characters.length - 3} şahsiyet sağ sayfada kayıtlı.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 3 && (
                /* HALKLAR: SOL SAYFA (Irklar & Kültürler) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Kadim Halklar & Irklar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Bu toprakları yurt edinen soy, kültür ve türlerin kaydı.
                    </p>
                  </div>

                  {races.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Dna size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Henüz tanımlanmış bir ırk veya tür bulunamadı.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('races')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Irkı Oluştur ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {races.map((race) => (
                        <div key={race.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              {race.name}
                            </span>
                            <span className="text-[10px] font-mono opacity-75">
                              Ömür: {race.lifespan || 'Belirtilmedi'}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>
                            {race.physicalTraits || race.origin || race.culture || 'Fiziksel ve kültürel özellikleri henüz belgelenmedi.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 4 && (
                /* ATLAS: SOL SAYFA (Coğrafi Bölgeler) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Coğrafi Atlas & Diyarlar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Sınırları çizilmiş topraklar, başkentler ve doğal anıtlar.
                    </p>
                  </div>

                  {locations.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Compass size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Atlas henüz haritalanmadı; mekanlar boş.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('locations')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Mekânı Ekle ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {locations.slice(0, 4).map((loc) => (
                        <div key={loc.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800 flex items-center gap-1.5">
                              <MapPin size={12} className="text-amber-600 shrink-0" />
                              <span>{loc.name}</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                              {LOCATION_TYPE_LABELS[loc.type] || loc.type}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>
                            {loc.description || 'Mekân tasviri henüz yapılmadı.'}
                          </p>
                          {loc.climate && (
                            <span className={`text-[10px] block ${themeTokens.textSecondary}`}>İklim / Ortam: {loc.climate}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 5 && (
                /* MİSTİK: SOL SAYFA (Grimoire: Büyü Kitabı) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Kadim Grimoire: Büyü Kitabı
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Efsunlar, fısıldanan sözler ve büyülü manipülasyonlar.
                    </p>
                  </div>

                  {spells.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Sparkles size={30} className="mx-auto opacity-40 text-purple-500" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Bu grimoire henüz hiçbir büyü formülüyle mühürlenmedi.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('mystic_arts')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 text-white shadow-xs hover:bg-purple-800 cursor-pointer"
                      >
                        İlk Büyüyü Yaz ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {spells.slice(0, 3).map((spell) => {
                        const tierInfo = SPELL_TIER_LABELS[spell.tier];
                        return (
                          <div key={spell.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1.5`}>
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-black text-xs text-purple-900">
                                ✦ {spell.name}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierInfo?.color || ''}`}>
                                {tierInfo?.label || spell.tier}
                              </span>
                            </div>
                            {spell.incantation && (
                              <blockquote className="text-[11px] font-serif italic text-amber-800 border-l-2 border-amber-600 pl-2">
                                &ldquo;{spell.incantation}&rdquo;
                              </blockquote>
                            )}
                            <p className={`text-xs ${themeTokens.textPrimary}`}>
                              {spell.effects}
                            </p>
                            {spell.costsAndBackfire && (
                              <div className="text-[10px] text-rose-800 font-mono">
                                Bedel / Risk: {spell.costsAndBackfire}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 6 && (
                /* HANEDANLAR: SOL SAYFA (Örgütler & Krallıklar) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Hanedanlar & Örgütler
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Dünyanın siyasi ve mistik güç dengesini elinde tutan yapılar.
                    </p>
                  </div>

                  {organizations.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Crown size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Kayıtlı hiçbir hanedan, tarikat veya krallık yok.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('organizations')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Örgütü Kur ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {organizations.slice(0, 3).map((org) => (
                        <div key={org.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              {org.name}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                              {getCodexOrgTypeLabel(org.type)}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>
                            {org.description || 'Örgüt manifestosu henüz yazılmadı.'}
                          </p>
                          {org.motto && (
                            <p className="text-[11px] font-serif italic text-amber-800">
                              Slogan: &ldquo;{org.motto}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 7 && (
                /* SIRLAR: SOL SAYFA (Kurgu Düğümleri) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Kurgu Düğümleri & Gizemler
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Yazarın kurguladığı henüz çözülmemiş sırlar ve ipuçları.
                    </p>
                  </div>

                  {plotThreads.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <HelpCircle size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Kayıtlı bir kurgu düğümü veya çözülmemiş gizem yok.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('plot_threads')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Gizemi Tanımla ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {plotThreads.map((pt) => (
                        <div key={pt.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              🗝️ {pt.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                              {PLOT_THREAD_STATUS_LABELS[pt.status] || (pt.status === 'resolved' ? 'Çözüldü' : 'Gizem Sürüyor')}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>
                            {pt.description || 'Gizem özeti belirtilmedi.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sol Sayfa Numarası */}
            <div className="pt-3 mt-4 border-t border-black/10 flex items-center justify-between text-[11px] font-serif opacity-75">
              <span>❖ Readixon Kodeksi</span>
              <span className="font-bold tracking-widest">Sayfa {currentSpread * 2 + 1}</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── SAĞ SAYFA (RIGHT PAGE) ── */}
          {/* ══════════════════════════════════════════════════════ */}
          <div 
            className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar scrollbar-none relative ${
              themeTokens.textPrimary
            } ${fontSize === 'large' ? 'text-base' : 'text-sm'} ${
              mobilePageSide === 'left' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div>
              {/* Sayfa Üst Başlığı */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10">
                <span className="text-[10px] font-mono opacity-60">
                  Resmî Dünya Kaydı
                </span>
                <span className={`text-[10px] sm:text-[11px] font-serif uppercase tracking-widest font-black ${themeTokens.subtitle}`}>
                  ❖ {CHAPTERS[currentSpread]?.subtitle} • Sağ
                </span>
              </div>

              {/* DİNAMİK SAĞ SAYFA İÇERİKLERİ */}
              {currentSpread === 0 && (
                /* KAPAK: SAĞ SAYFA (Yazarın Önsözü & Drop Cap) */
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <span className="text-xs font-serif font-black uppercase tracking-widest text-amber-600 block mb-0.5">
                      Kozmoloji & Yaratılış
                    </span>
                    <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black font-serif tracking-tight ${themeTokens.title}`}>
                      {universe.title}
                    </h1>
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-xs font-serif font-bold uppercase tracking-wider ${themeTokens.subtitle}`}>
                      Vakayinüvisin Önsözü
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed text-justify ${themeTokens.textPrimary} first-letter:text-4xl first-letter:font-serif first-letter:font-black first-letter:float-left first-letter:mr-2.5 ${themeTokens.dropCap}`}>
                      {universe.description || 'Bu evrenin yaratılış efsanesi henüz kağıda dökülmedi. Yazar, bu toprakların kökenini, gök kubbenin altındaki ilk kıvılcımı ve medeniyetlerin doğuşunu burada fısıldayacak.'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${themeTokens.cardBg} space-y-1.5`}>
                    <h4 className="font-serif font-black text-xs text-amber-800 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Bu Evrenin Ruhu</span>
                    </h4>
                    <p className={`text-xs leading-relaxed ${themeTokens.textPrimary}`}>
                      Burada bulunan her karakter, büyü ve diyar birbirine görünmez bağlarla bağlıdır. Evren stüdyosunda yaptığınız her ekleme, bu defterin sayfalarında canlı bir destana dönüşür.
                    </p>
                  </div>
                </div>
              )}

              {currentSpread === 1 && (
                /* KANON: SAĞ SAYFA (Vakayiname & Zaman Çizelgesi) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Vakayiname & Çağlar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Zamanın akışında vuku bulan büyük kırılmalar, savaşlar ve fetihler.
                    </p>
                  </div>

                  {timelineEvents.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Calendar size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Zaman çizelgesine henüz bir vakayiname olayı işlenmedi.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('timeline')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Olayı Kaydet ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {timelineEvents.slice(0, 4).map((evt, idx) => (
                        <div key={evt.id || idx} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              {evt.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 border font-bold">
                              {evt.customDate || evt.era || `Çağ ${idx + 1}`}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>
                            {evt.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 2 && (
                /* KİŞİLER: SAĞ SAYFA (Diğer Karakterler) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Karakterler & İttifak Bağları
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Karakterler arasındaki dostluklar, husumetler ve derin bağlar.
                    </p>
                  </div>

                  {characters.length <= 3 ? (
                    <div className={`p-4 rounded-2xl border ${themeTokens.cardBg} space-y-2.5`}>
                      <h4 className="font-serif font-bold text-xs text-amber-800">
                        Karakter Arşiv Notu
                      </h4>
                      <p className={`text-xs leading-relaxed ${themeTokens.textPrimary}`}>
                        Daha fazla karakter ekleyerek defterinizin sayfalarını zenginleştirebilirsiniz. İlişki ağı grafiği karakterlerin çatışmalarını ve ortak kaderlerini bu defterde sergiler.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('relationships')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlişki Ağını Gör ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {characters.slice(3, 7).map((char) => (
                        <div key={char.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              {char.name}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                              {getCharacterRoleLabel(char.role)}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>{char.coreMotivation || char.occupation || 'Karakter profili kaydı.'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 3 && (
                /* HALKLAR: SAĞ SAYFA (Bestiary) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Bestiary: Efsanevi Varlıklar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Yaban topraklarda yaşayan canavarlar, kutsal yaratıklar ve tehditler.
                    </p>
                  </div>

                  {creatures.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Skull size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Bestiary günlüğü henüz boş; hiçbir yaratık kaydedilmedi.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('creatures')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        İlk Canavarı Kaydet ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {creatures.map((creature) => {
                        const dangerClass = getCreatureDangerClass(creature.dangerLevel);
                        return (
                          <div key={creature.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-black text-xs text-amber-800 flex items-center gap-1.5">
                                <Flame size={12} className="text-amber-600" />
                                <span>{creature.name}</span>
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dangerClass}`}>
                                {getCreatureDangerLabel(creature.dangerLevel)}
                              </span>
                            </div>
                            <p className={`text-xs ${themeTokens.textPrimary}`}>
                              {creature.appearance || creature.behavior || creature.lore || 'Yaratığın davranışları henüz belgelenmedi.'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 4 && (
                /* ATLAS: SAĞ SAYFA (Haritalar) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Dünya Haritaları & Rotalar
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Gezginlerin ve orduların takip ettiği güzergahlar ve çizilmiş haritalar.
                    </p>
                  </div>

                  {maps.length === 0 ? (
                    <div className={`p-4 rounded-2xl border ${themeTokens.cardBg} space-y-2.5 text-center py-6`}>
                      <Globe size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Görsel bir dünya haritası henüz yüklenmedi.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('maps')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        Harita Ekle & İşaretle ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {maps.map((m) => (
                        <div key={m.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800">
                              {m.title}
                            </span>
                            <span className="text-[10px] opacity-75 font-mono">
                              {m.markers?.length || 0} İşaretçi
                            </span>
                          </div>
                          {m.imageUrl && (
                            <div className="w-full h-28 rounded-lg overflow-hidden border border-black/10">
                              <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className={`text-xs ${themeTokens.textPrimary}`}>{m.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 5 && (
                /* MİSTİK: SAĞ SAYFA (Kehanetler & Fal Destesi) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Kehanetler & Fal Destesi
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Yıldızların fısıltıları, tarot kartları ve kaçınılmaz kehanetler.
                    </p>
                  </div>

                  {divinations.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Sparkles size={30} className="mx-auto opacity-40 text-purple-500" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Bu evren için henüz bir kehanet veya fal destesi tanımlanmadı.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('mystic_arts')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 text-white shadow-xs hover:bg-purple-800 cursor-pointer"
                      >
                        Fal & Kehanet Sistemi Kur ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {divinations.map((div) => (
                        <div key={div.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-purple-900">
                              🔮 {div.name}
                            </span>
                            <span className="text-[10px] opacity-75 font-mono">
                              {div.cardsOrSymbols?.length || 0} Kart / Sembol
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>{div.description}</p>
                          {div.cardsOrSymbols && div.cardsOrSymbols.length > 0 && (
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              {div.cardsOrSymbols.slice(0, 2).map((c: UniverseDivinationCard, idx: number) => (
                                <div key={c.id || idx} className={`p-2 rounded-lg border text-xs ${themeTokens.cardHighlight}`}>
                                  <span className="font-bold text-[11px] block">{c.name}</span>
                                  <span className="text-[10px] opacity-80 line-clamp-1">{c.meaning}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 6 && (
                /* HANEDANLAR: SAĞ SAYFA (Emanetler & Güç Sistemleri) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Emanetler & Güç Sistemleri
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Kutsal silahlar, büyülü eserler ve fizik ötesi enerji kuralları.
                    </p>
                  </div>

                  {items.length === 0 && powerSystems.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Sword size={30} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Kayıtlı kutsal bir emanet veya güç sistemi bulunamadı.
                      </p>
                      <button
                        onClick={() => handleGoToStudioTab('items')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                      >
                        Efsanevi Eşya Ekle ➔
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {items.slice(0, 2).map((item) => (
                        <div key={item.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800 flex items-center gap-1.5">
                              <Sword size={12} className="text-amber-600" />
                              <span>{item.name}</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeTokens.badgeBg}`}>
                              {getCodexItemTypeLabel(item.type)}
                            </span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>{item.description}</p>
                        </div>
                      ))}

                      {powerSystems.slice(0, 2).map((power) => (
                        <div key={power.id} className={`p-3 rounded-xl border ${themeTokens.cardBg} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-xs text-amber-800 flex items-center gap-1.5">
                              <Zap size={12} className="text-amber-600" />
                              <span>{power.name}</span>
                            </span>
                            <span className="text-[10px] opacity-75 font-mono">Güç Sistemi</span>
                          </div>
                          <p className={`text-xs ${themeTokens.textPrimary}`}>{power.corePrinciples}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSpread === 7 && (
                /* SIRLAR: SAĞ SAYFA (Kadim Sözlük & Kapanış Mührü) */
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h2 className={`text-lg sm:text-xl font-bold font-serif ${themeTokens.title}`}>
                      Kadim Sözlük & Terimler
                    </h2>
                    <p className={`text-xs ${themeTokens.subtitle}`}>
                      Bu evrene has kavramlar, yabancı diller ve argo terimler.
                    </p>
                  </div>

                  {glossaryTerms.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <FileText size={28} className="mx-auto opacity-40 text-amber-600" />
                      <p className={`text-xs italic ${themeTokens.textSecondary}`}>
                        Sözlük henüz boş; yeni kavramlar ekleyebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar scrollbar-none pr-1">
                      {glossaryTerms.slice(0, 6).map((term) => (
                        <div key={term.id} className="border-b pb-1 last:border-b-0">
                          <span className="font-serif font-bold text-xs text-amber-800 block">
                            {term.term}
                          </span>
                          <span className={`text-xs ${themeTokens.textPrimary}`}>{term.meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 mt-2 border-t text-center space-y-1">
                    <span className="text-base opacity-75">⚜️ ❖ ⚜️</span>
                    <p className={`text-[10px] font-serif uppercase tracking-widest font-black ${themeTokens.subtitle}`}>
                      Burada yazılanlar evrenin resmî kanonudur.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Sayfa Numarası */}
            <div className="pt-3 mt-4 border-t border-black/10 flex items-center justify-between text-[11px] font-serif opacity-75">
              <span className="font-bold tracking-widest">Sayfa {currentSpread * 2 + 2}</span>
              <span>❖ Readixon Kodeksi</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── 4. ALT GEZİNTİ ÇUBUĞU (FOOTER CONTROLS) ── */}
      <footer className="w-full max-w-xl flex items-center justify-between gap-2 px-3 sm:px-5 py-2 rounded-2xl bg-black/75 border border-white/15 text-white shadow-2xl z-30 shrink-0 mt-2">
        
        {/* Önceki Sayfa */}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              handleMobilePrev();
            } else {
              flipToSpread(currentSpread - 1, 'prev');
            }
          }}
          disabled={currentSpread === 0 && (window.innerWidth >= 768 || mobilePageSide === 'left')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-25 disabled:pointer-events-none text-xs font-semibold transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Önceki</span>
        </button>

        {/* Orta: Yaprak & Sayfa Göstergesi */}
        <div className="text-center font-serif text-xs">
          <span className="text-amber-200 font-bold block sm:inline">
            Yaprak {currentSpread + 1} / {TOTAL_SPREADS}
          </span>
          <span className="text-[10px] text-zinc-400 font-sans block">
            {window.innerWidth < 768 ? (
              mobilePageSide === 'left' ? `(Sayfa ${currentSpread * 2 + 1})` : `(Sayfa ${currentSpread * 2 + 2})`
            ) : (
              `(Sayfa ${currentSpread * 2 + 1} - ${currentSpread * 2 + 2})`
            )}
          </span>
        </div>

        {/* Sonraki Sayfa */}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              handleMobileNext();
            } else {
              flipToSpread(currentSpread + 1, 'next');
            }
          }}
          disabled={currentSpread === TOTAL_SPREADS - 1 && (window.innerWidth >= 768 || mobilePageSide === 'right')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 disabled:opacity-25 disabled:pointer-events-none text-xs font-bold text-white transition-all shadow-md cursor-pointer"
        >
          <span>Sonraki</span>
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
