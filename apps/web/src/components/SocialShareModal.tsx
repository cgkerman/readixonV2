'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { 
  Universe, 
  Character, 
  UniverseLocation, 
  UniversePlotThread, 
  Story 
} from '@readixon/core';
import { 
  X, 
  Sparkles, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Smartphone, 
  Square, 
  Tv, 
  Palette, 
  User, 
  Globe, 
  Compass, 
  Flame, 
  Brain, 
  Zap, 
  Heart,
  Loader2,
  Lock,
  Layers,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const XTwitterIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export type SocialCardType = 'character' | 'discovery' | 'universe';
export type SocialCardRatio = 'story' | 'square' | 'landscape'; // 9:16, 1:1, 16:9
export type SocialThemePreset = 'dark_gold' | 'cyber_neon' | 'crimson_dark' | 'emerald_mystic';

export interface SocialShareModalProps {
  universe: Universe;
  characters?: Character[];
  locations?: UniverseLocation[];
  plotThreads?: UniversePlotThread[];
  stories?: Story[];
  initialCardType?: SocialCardType;
  initialCharacter?: Character | null;
  initialLocation?: UniverseLocation | null;
  userChapterOrder?: number;
  onClose: () => void;
}

const THEME_CONFIGS: Record<SocialThemePreset, {
  name: string;
  bgGrad: string;
  accent: string;
  accentText: string;
  border: string;
  canvasBgStart: string;
  canvasBgEnd: string;
  canvasAccent: string;
}> = {
  dark_gold: {
    name: 'Altın & Asil',
    bgGrad: 'from-amber-950/40 via-card to-background',
    accent: 'bg-amber-500',
    accentText: 'text-amber-400',
    border: 'border-amber-500/40',
    canvasBgStart: '#1a140a',
    canvasBgEnd: '#0a0907',
    canvasAccent: '#f59e0b',
  },
  cyber_neon: {
    name: 'Siberpunk & Mor',
    bgGrad: 'from-purple-950/40 via-card to-background',
    accent: 'bg-purple-500',
    accentText: 'text-purple-400',
    border: 'border-purple-500/40',
    canvasBgStart: '#190a28',
    canvasBgEnd: '#090510',
    canvasAccent: '#a855f7',
  },
  crimson_dark: {
    name: 'Kızıl & Gotik',
    bgGrad: 'from-rose-950/40 via-card to-background',
    accent: 'bg-rose-500',
    accentText: 'text-rose-400',
    border: 'border-rose-500/40',
    canvasBgStart: '#25080e',
    canvasBgEnd: '#0b0305',
    canvasAccent: '#f43f5e',
  },
  emerald_mystic: {
    name: 'Zümrüt & Mistik',
    bgGrad: 'from-emerald-950/40 via-card to-background',
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-400',
    border: 'border-emerald-500/40',
    canvasBgStart: '#061c14',
    canvasBgEnd: '#030a07',
    canvasAccent: '#10b981',
  },
};

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  universe,
  characters = [],
  locations = [],
  plotThreads = [],
  stories = [],
  initialCardType = 'character',
  initialCharacter = null,
  initialLocation = null,
  userChapterOrder = 1,
  onClose,
}) => {
  const [cardType, setCardType] = useState<SocialCardType>(initialCardType);
  const [ratio, setRatio] = useState<SocialCardRatio>('story');
  const [theme, setTheme] = useState<SocialThemePreset>('dark_gold');
  
  // Seçili Karakter / Mekan
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(
    initialCharacter?.id || characters[0]?.id || ''
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    initialLocation?.id || locations[0]?.id || ''
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    plotThreads[0]?.id || ''
  );

  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId) || initialCharacter || characters[0];
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || initialLocation || locations[0];
  const selectedThread = plotThreads.find((t) => t.id === selectedThreadId) || plotThreads[0];

  const currentTheme = THEME_CONFIGS[theme];
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/universe/${universe.slug || universe.universeId}` : '';

  // Boyut oranları
  const getDimensions = useCallback(() => {
    switch (ratio) {
      case 'story':
        return { width: 1080, height: 1920, aspectClass: 'aspect-[9/16]' };
      case 'square':
        return { width: 1080, height: 1080, aspectClass: 'aspect-square' };
      case 'landscape':
        return { width: 1200, height: 675, aspectClass: 'aspect-[16/9]' };
    }
  }, [ratio]);

  // Canvas üzerinde kartı yüksek çözünürlükle çiz
  const generateCanvasImage = useCallback(async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Arka Plan Radyal Gradyan
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.35, 100,
      width / 2, height / 2, Math.max(width, height) * 0.8
    );
    bgGrad.addColorStop(0, currentTheme.canvasBgStart);
    bgGrad.addColorStop(1, currentTheme.canvasBgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // İnce Izgara / Partikül Efekti
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Üst & Alt Dekoratif Glow
    const topGlow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, width * 0.6);
    topGlow.addColorStop(0, `${currentTheme.canvasAccent}33`);
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height * 0.5);

    // 2. Çerçeve
    ctx.strokeStyle = `${currentTheme.canvasAccent}44`;
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Köşe Vurguları
    const cornerSize = 24;
    ctx.strokeStyle = currentTheme.canvasAccent;
    ctx.lineWidth = 6;
    // Sol Üst
    ctx.beginPath();
    ctx.moveTo(36, 36 + cornerSize); ctx.lineTo(36, 36); ctx.lineTo(36 + cornerSize, 36); ctx.stroke();
    // Sağ Üst
    ctx.beginPath();
    ctx.moveTo(width - 36 - cornerSize, 36); ctx.lineTo(width - 36, 36); ctx.lineTo(width - 36, 36 + cornerSize); ctx.stroke();
    // Sol Alt
    ctx.beginPath();
    ctx.moveTo(36, height - 36 - cornerSize); ctx.lineTo(36, height - 36); ctx.lineTo(36 + cornerSize, height - 36); ctx.stroke();
    // Sağ Alt
    ctx.beginPath();
    ctx.moveTo(width - 36 - cornerSize, height - 36); ctx.lineTo(width - 36, height - 36); ctx.lineTo(width - 36, height - 36 - cornerSize); ctx.stroke();

    // 3. Başlık Damgası (Header)
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = currentTheme.canvasAccent;
    ctx.textAlign = 'center';
    ctx.fillText('READIXON • KURGUSAL EVREN', width / 2, 90);

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(universe.title.toUpperCase(), width / 2, 145);

    // Kart Türüne Göre İçerik Çizimi
    if (cardType === 'character' && selectedCharacter) {
      // Rozet
      ctx.font = '900 28px sans-serif';
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.fillText(`[ ${selectedCharacter.role.toUpperCase()} ]`, width / 2, 210);

      // Karakter Resmi Çizimi (Varsa)
      const imageUrl =
        selectedCharacter.pngGallery?.transparentPngUrl ||
        selectedCharacter.pngGallery?.fullBodyUrl ||
        selectedCharacter.avatarUrl;

      let drawImgSuccess = false;
      if (imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imageUrl;
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            setTimeout(res, 2500); // 2.5s timeout
          });

          if (img.complete && img.naturalWidth > 0) {
            const maxImgH = ratio === 'story' ? height * 0.44 : height * 0.38;
            const scale = Math.min((width * 0.75) / img.width, maxImgH / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const imgY = ratio === 'story' ? 240 : 220;
            ctx.drawImage(img, (width - w) / 2, imgY, w, h);
            drawImgSuccess = true;
          }
        } catch (e) {
          console.warn('Canvas görseli yüklenemedi:', e);
        }
      }

      if (!drawImgSuccess) {
        // İsim Çemberi
        const cy = ratio === 'story' ? 420 : 340;
        ctx.beginPath();
        ctx.arc(width / 2, cy, 110, 0, Math.PI * 2);
        ctx.fillStyle = `${currentTheme.canvasAccent}22`;
        ctx.fill();
        ctx.strokeStyle = currentTheme.canvasAccent;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = '900 90px sans-serif';
        ctx.fillStyle = currentTheme.canvasAccent;
        ctx.fillText(selectedCharacter.name.charAt(0), width / 2, cy + 30);
      }

      // Karakter Adı
      const textStartY = ratio === 'story' ? height * 0.68 : height * 0.62;
      ctx.font = '900 64px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(selectedCharacter.name, width / 2, textStartY);

      if (selectedCharacter.occupation) {
        ctx.font = '600 32px sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(selectedCharacter.occupation, width / 2, textStartY + 50);
      }

      // Alıntı / Motto
      if (selectedCharacter.coreMotivation) {
        ctx.font = 'italic 30px serif';
        ctx.fillStyle = '#e4e4e7';
        const quoteText = `"${selectedCharacter.coreMotivation}"`;
        ctx.fillText(quoteText, width / 2, textStartY + 110);
      }

      // RPG Barları
      if (selectedCharacter.rpgStats) {
        const stats = selectedCharacter.rpgStats;
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = currentTheme.canvasAccent;
        const statsStr = `Zekâ: ${stats.intelligence}/10  •  Güç: ${stats.strength}/10  •  Çeviklik: ${stats.agility}/10  •  Karizma: ${stats.charisma}/10`;
        ctx.fillText(statsStr, width / 2, textStartY + 175);
      }
    } else if (cardType === 'discovery') {
      // Keşif Kartı
      ctx.font = '900 36px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('✨ YENİ BİR SIR KEŞFEDİLDİ! ✨', width / 2, 230);

      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(`Bölüm #${userChapterOrder} Kilidi Açıldı`, width / 2, 280);

      // Merkez Keşif İkonu & Çemberi
      const cy = ratio === 'story' ? height * 0.42 : height * 0.45;
      ctx.beginPath();
      ctx.arc(width / 2, cy, 140, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.font = '900 64px sans-serif';
      ctx.fillStyle = '#ffffff';
      const itemName = selectedCharacter?.name || selectedLocation?.name || selectedThread?.title || universe.title;
      ctx.fillText(itemName, width / 2, cy + 220);

      ctx.font = '500 32px sans-serif';
      ctx.fillStyle = '#d4d4d8';
      const desc =
        selectedCharacter?.readerNotes ||
        selectedLocation?.description ||
        selectedThread?.clues?.[0]?.note ||
        'Bu dünyanın gizemleri okuyucuların keşfiyle aydınlanıyor.';
      
      // 2 satır metin sarma
      ctx.fillText(desc.slice(0, 50), width / 2, cy + 290);
      if (desc.length > 50) {
        ctx.fillText(desc.slice(50, 100) + '...', width / 2, cy + 335);
      }
    } else {
      // Evren Tanıtım Afişi
      ctx.font = '900 32px sans-serif';
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.fillText(`TÜR: ${universe.genre.toUpperCase()}`, width / 2, 210);

      ctx.font = '900 72px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(universe.title, width / 2, height * 0.38);

      if (universe.authorName) {
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`Mimar: @${universe.authorName}`, width / 2, height * 0.44);
      }

      // Açıklama
      ctx.font = '400 32px sans-serif';
      ctx.fillStyle = '#d4d4d8';
      const desc = universe.description || 'Bu evrenin kuralları, mitolojisi ve epik hikâyeleri Readixon platformunda keşfedilmeyi bekliyor.';
      ctx.fillText(desc.slice(0, 55), width / 2, height * 0.52);
      if (desc.length > 55) {
        ctx.fillText(desc.slice(55, 110) + '...', width / 2, height * 0.57);
      }

      // İstatistik Rozet Kutusu
      const statsY = ratio === 'story' ? height * 0.68 : height * 0.68;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(width * 0.15, statsY, width * 0.7, 100);
      ctx.strokeStyle = `${currentTheme.canvasAccent}66`;
      ctx.strokeRect(width * 0.15, statsY, width * 0.7, 100);

      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        `${stories.length} Eser  •  ${characters.length} Karakter  •  ${locations.length} Mekân`,
        width / 2,
        statsY + 60
      );
    }

    // 4. Alt Alan (Footer CTA & Readixon URL)
    const footerY = height - 100;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = currentTheme.canvasAccent;
    ctx.fillText('readixon.com/universe', width / 2, footerY);

    ctx.font = '500 22px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText('Hikâye & Evren Keşif Platformu', width / 2, footerY + 35);

    return canvas.toDataURL('image/png');
  }, [getDimensions, currentTheme, cardType, selectedCharacter, selectedLocation, selectedThread, universe, ratio, userChapterOrder, stories.length, characters.length, locations.length]);

  // PNG İndirme
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateCanvasImage();
      if (!dataUrl) {
        toast.error('Görsel oluşturulamadı');
        return;
      }

      const link = document.createElement('a');
      link.download = `${universe.slug || 'readixon'}-${cardType}-kart.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Sosyal paylaşım kartı indirildi!');
    } catch (e) {
      console.error(e);
      toast.error('İndirme sırasında hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  // Doğrudan Paylaş (Web Share API)
  const handleNativeShare = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateCanvasImage();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${universe.title}-kart.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${universe.title} — Evren Paylaşım Kartı`,
          text: `🌌 ${universe.title} evrenini ve karakterlerini keşfet!`,
          files: [file],
          url: shareUrl,
        });
        toast.success('Paylaşıldı!');
      } else if (navigator.share) {
        await navigator.share({
          title: universe.title,
          text: `🌌 ${universe.title} evrenini keşfet!`,
          url: shareUrl,
        });
      } else {
        handleDownload();
      }
    } catch (e) {
      console.warn('Paylaşım iptal edildi veya desteklenmiyor', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Twitter / X Paylaşım Penceresi
  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `🌌 ${universe.title} evrenini ve karakterlerini keşfedin!\n\n#Readixon #Worldbuilding #Kurgu`
    );
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Bağlantı Kopyala
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Evren bağlantısı kopyalandı!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Gizli Canvas (Arka Plan Çizim Motoru) */}
      <canvas ref={canvasRef} className="hidden pointer-events-none" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[94vh] bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/50 flex items-center justify-between bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground">
                Sosyal Paylaşım & Tanıtım Vitrini
              </h3>
              <p className="text-xs text-muted">
                Instagram, Twitter (X) ve WhatsApp için yüksek çözünürlüklü kurgu kartları üretin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/20 text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gövde: Sol Kontroller & Sağ Canlı Önizleme */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7">
          
          {/* SOL: Konfigürasyon Paneli (5 Kolon) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Kart Türü Seçici */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                1. Kart Şablonu (PRD Bölüm 57)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCardType('character')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    cardType === 'character'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <User size={18} className="mx-auto mb-1" />
                  <span className="text-[11px] block">Karakter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('discovery')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    cardType === 'discovery'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <Sparkles size={18} className="mx-auto mb-1" />
                  <span className="text-[11px] block">Keşif Sırrı</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('universe')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    cardType === 'universe'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <Globe size={18} className="mx-auto mb-1" />
                  <span className="text-[11px] block">Evren Afişi</span>
                </button>
              </div>
            </div>

            {/* Karakter Seçici (Eğer Karakter Kartı ise) */}
            {cardType === 'character' && characters.length > 0 && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Öne Çıkarılacak Karakter
                </label>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Format Oranı (Aspect Ratio) */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                2. Boyut Formatı
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRatio('story')}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    ratio === 'story'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <Smartphone size={16} className="mx-auto mb-1" />
                  <span className="text-[10px] block font-bold">Story (9:16)</span>
                  <span className="text-[9px] text-muted block">Instagram/WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatio('square')}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    ratio === 'square'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <Square size={16} className="mx-auto mb-1" />
                  <span className="text-[10px] block font-bold">Post (1:1)</span>
                  <span className="text-[9px] text-muted block">Instagram Kare</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatio('landscape')}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    ratio === 'landscape'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <Tv size={16} className="mx-auto mb-1" />
                  <span className="text-[10px] block font-bold">Yatay (16:9)</span>
                  <span className="text-[9px] text-muted block">Twitter / X Afiş</span>
                </button>
              </div>
            </div>

            {/* 3. Renk Teması */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                3. Renk & Atmosfer Paleti
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(THEME_CONFIGS).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key as SocialThemePreset)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      theme === key
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/50 bg-background/60 hover:bg-background text-muted'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${cfg.accent} shrink-0`} />
                    <span className="text-xs font-bold text-foreground">{cfg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Dışa Aktarma Butonları */}
            <div className="pt-3 border-t border-border/40 space-y-2.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-2xl bg-primary text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>PNG Olarak İndir (Yüksek Kalite)</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all"
                  title="Paylaşım Menüsü"
                >
                  <Share2 size={14} className="text-primary" />
                  <span>Paylaş</span>
                </button>
                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all"
                  title="Twitter'da Paylaş"
                >
                  <XTwitterIcon size={13} className="text-foreground" />
                  <span>X / Tweet</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all"
                  title="Bağlantıyı Kopyala"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SAĞ: Canlı Kart Önizlemesi (7 Kolon) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-3xl bg-background/50 border border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1">
              <Sparkles size={11} className="text-primary" /> Canlı Kart Önizlemesi ({ratio})
            </span>

            {/* DOM Önizleme Çerçevesi */}
            <div
              ref={previewRef}
              className={`w-full max-w-[340px] rounded-3xl overflow-hidden border-2 shadow-2xl relative flex flex-col justify-between p-6 select-none bg-gradient-to-br ${currentTheme.bgGrad} ${currentTheme.border} ${
                ratio === 'story'
                  ? 'aspect-[9/16]'
                  : ratio === 'square'
                  ? 'aspect-square'
                  : 'aspect-[16/9]'
              }`}
            >
              {/* Arka Plan Atmosfer Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 text-center">
                <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${currentTheme.accentText}`}>
                  READIXON • EVREN
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">
                  {universe.title}
                </h4>
              </div>

              {/* Orta Gövde */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-3">
                {cardType === 'character' && selectedCharacter ? (
                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${currentTheme.border} ${currentTheme.accentText}`}>
                      {selectedCharacter.role}
                    </span>

                    {/* Resim veya Çember */}
                    <div className="w-24 h-24 rounded-2xl bg-card/80 border border-border/60 mx-auto overflow-hidden shadow-lg flex items-center justify-center">
                      {selectedCharacter.pngGallery?.transparentPngUrl || selectedCharacter.avatarUrl ? (
                        <img
                          src={selectedCharacter.pngGallery?.transparentPngUrl || selectedCharacter.avatarUrl}
                          alt={selectedCharacter.name}
                          className="w-full h-full object-contain filter drop-shadow-md"
                        />
                      ) : (
                        <span className={`text-3xl font-black ${currentTheme.accentText}`}>
                          {selectedCharacter.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-white leading-tight">
                      {selectedCharacter.name}
                    </h3>

                    {selectedCharacter.coreMotivation && (
                      <p className="text-[10px] text-zinc-300 italic line-clamp-2 px-2">
                        "{selectedCharacter.coreMotivation}"
                      </p>
                    )}
                  </div>
                ) : cardType === 'discovery' ? (
                  <div className="space-y-2.5 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Sparkles size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                      YENİ SIR KEŞFEDİLDİ
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      {selectedCharacter?.name || selectedLocation?.name || universe.title}
                    </h3>
                    <p className="text-[10px] text-zinc-300 line-clamp-2 px-2">
                      {selectedCharacter?.readerNotes || selectedLocation?.description || 'Okuma yolculuğunda yeni bir kurgu parçası aydınlandı.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center mx-auto">
                      <Globe size={26} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${currentTheme.accentText}`}>
                      {universe.genre}
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {universe.title}
                    </h3>
                    <p className="text-[10px] text-zinc-300 line-clamp-2 px-2">
                      {universe.description || 'Kurgusal evrenin tüm sırları ve karakterleri seni bekliyor.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="relative z-10 pt-2 border-t border-border/60 text-center">
                <span className={`text-[10px] font-black block tracking-wider ${currentTheme.accentText}`}>
                  readixon.com/universe
                </span>
                <span className="text-[8px] text-zinc-400 block mt-0.5">
                  Sen de Katıl & Dünyayı Keşfet
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
