'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  type Universe, 
  type Character, 
  type UniverseLocation, 
  type UniversePlotThread, 
  type Story,
  getUniverseGenreLabel
} from '@readixon/core';
import { 
  X, 
  Sparkles, 
  Download, 
  Share2, 
  Copy, 
  Check, 
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
  BookOpen,
  Image as ImageIcon
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
export type SocialCardRatio = 'post' | 'story' | 'square' | 'landscape'; // 4:5 (Post), 9:16 (Story), 1:1 (Kare), 16:9 (Yatay)
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
  glow: string;
  canvasBgStart: string;
  canvasBgEnd: string;
  canvasAccent: string;
}> = {
  dark_gold: {
    name: 'Altın & Asil',
    bgGrad: 'from-amber-950/50 via-card/90 to-background',
    accent: 'bg-amber-500',
    accentText: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'rgba(245, 158, 11, 0.25)',
    canvasBgStart: '#1e160a',
    canvasBgEnd: '#0a0907',
    canvasAccent: '#f59e0b',
  },
  cyber_neon: {
    name: 'Siberpunk & Mor',
    bgGrad: 'from-purple-950/50 via-card/90 to-background',
    accent: 'bg-purple-500',
    accentText: 'text-purple-400',
    border: 'border-purple-500/40',
    glow: 'rgba(168, 85, 247, 0.25)',
    canvasBgStart: '#1d0b30',
    canvasBgEnd: '#090510',
    canvasAccent: '#a855f7',
  },
  crimson_dark: {
    name: 'Kızıl & Gotik',
    bgGrad: 'from-rose-950/50 via-card/90 to-background',
    accent: 'bg-rose-500',
    accentText: 'text-rose-400',
    border: 'border-rose-500/40',
    glow: 'rgba(244, 63, 94, 0.25)',
    canvasBgStart: '#2d0811',
    canvasBgEnd: '#0b0305',
    canvasAccent: '#f43f5e',
  },
  emerald_mystic: {
    name: 'Zümrüt & Mistik',
    bgGrad: 'from-emerald-950/50 via-card/90 to-background',
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'rgba(16, 185, 129, 0.25)',
    canvasBgStart: '#072419',
    canvasBgEnd: '#030a07',
    canvasAccent: '#10b981',
  },
};

// Rol Rozetleri için Renk Haritası
const getRoleBadgeStyle = (rawRole?: string) => {
  const norm = (rawRole || '').trim().toLowerCase();
  if (norm.includes('baş') || norm.includes('protagonist')) {
    return { label: 'Baş Kahraman', bg: 'bg-amber-400 text-black border-amber-300', canvasColor: '#fbbf24', canvasText: '#000000' };
  }
  if (norm.includes('antagonist') || norm.includes('düşman') || norm.includes('kötü')) {
    return { label: 'Antagonist', bg: 'bg-rose-600 text-white border-rose-500', canvasColor: '#e11d48', canvasText: '#ffffff' };
  }
  if (norm.includes('aşk') || norm.includes('love')) {
    return { label: 'Aşk İlgisi', bg: 'bg-pink-600 text-white border-pink-500', canvasColor: '#db2777', canvasText: '#ffffff' };
  }
  if (norm.includes('mentor') || norm.includes('usta') || norm.includes('rehber')) {
    return { label: 'Usta / Mentor', bg: 'bg-emerald-600 text-white border-emerald-500', canvasColor: '#059669', canvasText: '#ffffff' };
  }
  if (norm.includes('ikincil') || norm.includes('deuteragonist')) {
    return { label: 'İkincil Kahraman', bg: 'bg-indigo-600 text-white border-indigo-500', canvasColor: '#4f46e5', canvasText: '#ffffff' };
  }
  return { label: rawRole || 'Yan Karakter', bg: 'bg-sky-600 text-white border-sky-500', canvasColor: '#0284c7', canvasText: '#ffffff' };
};

// Resim yükleyici yardımcı fonksiyonu
const loadImgAsync = (src?: string): Promise<HTMLImageElement | null> => {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // CORS fallback: resim yüklenemezse null dön
      resolve(null);
    };
    img.src = src;
    setTimeout(() => resolve(null), 4000); // 4 saniye zaman aşımı
  });
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
  const [ratio, setRatio] = useState<SocialCardRatio>('post'); // Varsayılan: Instagram 4:5 Dikey Post
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

  // Arka plan için kullanılacak en uygun kapak görseli
  const backgroundCoverUrl =
    universe.coverImage ||
    universe.bannerImage ||
    stories[0]?.coverImage ||
    '';

  // Karakter için kullanılacak görseller
  const characterPngUrl = selectedCharacter?.pngGallery?.transparentPngUrl || selectedCharacter?.pngGallery?.fullBodyUrl;
  const characterPortraitUrl = selectedCharacter?.pngGallery?.portraitUrl || selectedCharacter?.avatarUrl;

  // Evren ana eseri kapağı
  const universeFeaturedCover = stories[0]?.coverImage || universe.coverImage;

  // Boyut oranları (Instagram 4:5 Post, 9:16 Story, 1:1 Kare, 16:9 Yatay)
  const getDimensions = useCallback(() => {
    switch (ratio) {
      case 'post':
        return { width: 1080, height: 1350, aspectClass: 'aspect-[4/5]' };
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

    // 1. Temel Arka Plan Gradyanı
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.4, 80,
      width / 2, height / 2, Math.max(width, height) * 0.85
    );
    bgGrad.addColorStop(0, currentTheme.canvasBgStart);
    bgGrad.addColorStop(1, currentTheme.canvasBgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Arka Plan Kapak Görseli (Sinematik Atmosferik Katman)
    if (backgroundCoverUrl) {
      const bgImg = await loadImgAsync(backgroundCoverUrl);
      if (bgImg) {
        ctx.save();
        // Aspect Cover hesaplama
        const scale = Math.max(width / bgImg.width, height / bgImg.height);
        const w = bgImg.width * scale;
        const h = bgImg.height * scale;
        const x = (width - w) / 2;
        const y = (height - h) / 2;

        ctx.globalAlpha = 0.28; // Arka planın koyu ve atmosferik kalması için
        ctx.drawImage(bgImg, x, y, w, h);

        // Koyu sinematik degrade maske
        ctx.globalAlpha = 0.82;
        const darkOverlay = ctx.createLinearGradient(0, 0, 0, height);
        darkOverlay.addColorStop(0, 'rgba(10, 11, 16, 0.7)');
        darkOverlay.addColorStop(0.5, 'rgba(10, 11, 16, 0.85)');
        darkOverlay.addColorStop(1, 'rgba(8, 9, 14, 0.96)');
        ctx.fillStyle = darkOverlay;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }
    }

    // İnce Sinematik Işık & Partikül Izgarası
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 70) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Üst & Alt Atmosferik Glow
    const topGlow = ctx.createRadialGradient(width / 2, 0, 20, width / 2, 0, width * 0.7);
    topGlow.addColorStop(0, `${currentTheme.canvasAccent}35`);
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height * 0.5);
    ctx.restore();

    // 3. Zarif Dış Çerçeve ve Köşe Süslemeleri
    ctx.strokeStyle = `${currentTheme.canvasAccent}40`;
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Köşe Vurguları
    const cornerSize = 28;
    ctx.strokeStyle = currentTheme.canvasAccent;
    ctx.lineWidth = 5;
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

    // 4. Başlık Damgası (Header)
    const headerY = ratio === 'post' ? 85 : ratio === 'story' ? 95 : 75;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = currentTheme.canvasAccent;
    ctx.textAlign = 'center';
    ctx.fillText('READIXON • KURGUSAL EVREN', width / 2, headerY);

    ctx.font = '900 42px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(universe.title.toUpperCase(), width / 2, headerY + 50);

    // 5. Kart Türüne Göre İçerik Çizimi
    if (cardType === 'character' && selectedCharacter) {
      const roleBadge = getRoleBadgeStyle(selectedCharacter.role);

      // Rol Rozeti Kutusu
      const badgeY = headerY + 100;
      ctx.font = '900 24px sans-serif';
      const badgeText = `[ ${roleBadge.label.toUpperCase()} ]`;
      ctx.fillStyle = roleBadge.canvasColor;
      ctx.fillText(badgeText, width / 2, badgeY);

      // Karakter Görseli Çizimi (Şeffaf PNG veya Portre Kartı)
      const charImg = await loadImgAsync(characterPngUrl || characterPortraitUrl);
      
      const charCenterY = ratio === 'post' ? height * 0.44 : ratio === 'story' ? height * 0.43 : height * 0.45;
      const maxCharH = ratio === 'post' ? height * 0.40 : ratio === 'story' ? height * 0.44 : height * 0.38;

      if (charImg) {
        ctx.save();
        const scale = Math.min((width * 0.75) / charImg.width, maxCharH / charImg.height);
        const w = charImg.width * scale;
        const h = charImg.height * scale;
        const x = (width - w) / 2;
        const y = charCenterY - h / 2;

        // Karakterin arkasına hafif glow
        const charGlow = ctx.createRadialGradient(width / 2, charCenterY, 30, width / 2, charCenterY, w * 0.8);
        charGlow.addColorStop(0, `${currentTheme.canvasAccent}40`);
        charGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = charGlow;
        ctx.fillRect(width * 0.1, y - 40, width * 0.8, h + 80);

        // Eğer portre kartıysa şık çerçeve çiz
        if (!characterPngUrl) {
          ctx.strokeStyle = `${currentTheme.canvasAccent}88`;
          ctx.lineWidth = 4;
          ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
        }

        ctx.drawImage(charImg, x, y, w, h);
        ctx.restore();
      } else {
        // İsim Baş Harfi Monogram Çemberi
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, charCenterY, 110, 0, Math.PI * 2);
        ctx.fillStyle = `${currentTheme.canvasAccent}25`;
        ctx.fill();
        ctx.strokeStyle = currentTheme.canvasAccent;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.font = '900 96px sans-serif';
        ctx.fillStyle = currentTheme.canvasAccent;
        ctx.fillText(selectedCharacter.name.charAt(0), width / 2, charCenterY + 32);
        ctx.restore();
      }

      // Karakter Adı & Detayları
      const textStartY = ratio === 'post' ? height * 0.69 : ratio === 'story' ? height * 0.70 : height * 0.68;
      ctx.font = '900 58px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(selectedCharacter.name, width / 2, textStartY);

      if (selectedCharacter.occupation) {
        ctx.font = '600 28px sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(selectedCharacter.occupation, width / 2, textStartY + 45);
      }

      // Alıntı / Motto
      if (selectedCharacter.coreMotivation) {
        ctx.font = 'italic 26px serif';
        ctx.fillStyle = '#e4e4e7';
        const quoteText = `"${selectedCharacter.coreMotivation.slice(0, 60)}${selectedCharacter.coreMotivation.length > 60 ? '...' : ''}"`;
        ctx.fillText(quoteText, width / 2, textStartY + 95);
      }

      // RPG İstatistikleri
      if (selectedCharacter.rpgStats) {
        const stats = selectedCharacter.rpgStats;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = currentTheme.canvasAccent;
        const statsStr = `Zekâ: ${stats.intelligence}/10  •  Güç: ${stats.strength}/10  •  Çeviklik: ${stats.agility}/10  •  Karizma: ${stats.charisma}/10`;
        ctx.fillText(statsStr, width / 2, textStartY + 145);
      }
    } else if (cardType === 'universe') {
      // Evren Tanıtım Afişi (3D Kitap Kapağı + Karakter Kolajı)
      const badgeY = headerY + 95;
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = currentTheme.canvasAccent;
      const genreLabelTr = getUniverseGenreLabel(universe.genre);
      ctx.fillText(`[ TÜR: ${genreLabelTr.toUpperCase()} ]`, width / 2, badgeY);

      // 3D Kitap Kapağı Çizimi
      const bookImg = await loadImgAsync(universeFeaturedCover);
      const bookCenterY = ratio === 'post' ? height * 0.41 : ratio === 'story' ? height * 0.40 : height * 0.42;
      const bookH = ratio === 'post' ? height * 0.35 : ratio === 'story' ? height * 0.38 : height * 0.34;
      const bookW = bookH * 0.68; // Kitap en boy oranı

      if (bookImg) {
        ctx.save();
        const bookX = (width - bookW) / 2;
        const bookY = bookCenterY - bookH / 2;

        // Kitap arkası gölge ve glow
        const glow = ctx.createRadialGradient(width / 2, bookCenterY, 30, width / 2, bookCenterY, bookW);
        glow.addColorStop(0, `${currentTheme.canvasAccent}45`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(bookX - 50, bookY - 30, bookW + 100, bookH + 60);

        // 3D Kitap gölgesi
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 15;
        ctx.shadowOffsetY = 20;

        // Kitap Kapağı
        ctx.drawImage(bookImg, bookX, bookY, bookW, bookH);

        // Kitap sırtı / 3D efekti
        ctx.shadowColor = 'transparent';
        const spineGrad = ctx.createLinearGradient(bookX, 0, bookX + 16, 0);
        spineGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
        spineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        spineGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spineGrad;
        ctx.fillRect(bookX, bookY, 16, bookH);

        ctx.strokeStyle = `${currentTheme.canvasAccent}60`;
        ctx.lineWidth = 3;
        ctx.strokeRect(bookX, bookY, bookW, bookH);

        ctx.restore();
      }

      // Evren Bilgileri
      const infoY = ratio === 'post' ? height * 0.65 : ratio === 'story' ? height * 0.67 : height * 0.65;
      ctx.font = '900 54px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(universe.title, width / 2, infoY);

      if (universe.authorName) {
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`Evren Mimarı: @${universe.authorName}`, width / 2, infoY + 45);
      }

      // Açıklama
      ctx.font = '400 24px sans-serif';
      ctx.fillStyle = '#d4d4d8';
      const desc = universe.description || 'Bu evrenin kuralları, mitolojisi ve epik hikâyeleri Readixon platformunda keşfedilmeyi bekliyor.';
      ctx.fillText(desc.slice(0, 60), width / 2, infoY + 95);
      if (desc.length > 60) {
        ctx.fillText(desc.slice(60, 120) + (desc.length > 120 ? '...' : ''), width / 2, infoY + 130);
      }

      // İstatistik Kutusu
      const statsY = ratio === 'post' ? height * 0.81 : ratio === 'story' ? height * 0.82 : height * 0.80;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(width * 0.12, statsY, width * 0.76, 75);
      ctx.strokeStyle = `${currentTheme.canvasAccent}66`;
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.12, statsY, width * 0.76, 75);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        `${stories.length} Eser   •   ${characters.length} Karakter   •   ${locations.length} Mekân   •   ${plotThreads.length} Sır`,
        width / 2,
        statsY + 46
      );
    } else {
      // Keşif Sırrı Şablonu
      const badgeY = headerY + 100;
      ctx.font = '900 28px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('✨ YENİ BİR SIR KEŞFEDİLDİ! ✨', width / 2, badgeY);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(`Bölüm #${userChapterOrder} İtibarıyla Kilidi Açıldı`, width / 2, badgeY + 42);

      // Merkez Keşif İkonu & Çemberi
      const cy = ratio === 'post' ? height * 0.44 : ratio === 'story' ? height * 0.43 : height * 0.45;
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, cy, 120, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.font = '900 72px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('⚡', width / 2, cy + 26);
      ctx.restore();

      const textStartY = ratio === 'post' ? height * 0.65 : ratio === 'story' ? height * 0.66 : height * 0.64;
      ctx.font = '900 52px sans-serif';
      ctx.fillStyle = '#ffffff';
      const itemName = selectedCharacter?.name || selectedLocation?.name || selectedThread?.title || universe.title;
      ctx.fillText(itemName, width / 2, textStartY);

      ctx.font = '500 26px sans-serif';
      ctx.fillStyle = '#d4d4d8';
      const desc =
        selectedCharacter?.readerNotes ||
        selectedLocation?.description ||
        selectedThread?.clues?.[0]?.note ||
        'Bu dünyanın gizemleri okuyucuların keşfiyle aydınlanıyor.';
      ctx.fillText(desc.slice(0, 55), width / 2, textStartY + 60);
      if (desc.length > 55) {
        ctx.fillText(desc.slice(55, 110) + '...', width / 2, textStartY + 100);
      }
    }

    // 6. Alt Alan (Footer CTA & Readixon URL)
    const footerY = height - (ratio === 'post' ? 75 : ratio === 'story' ? 85 : 65);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = currentTheme.canvasAccent;
    ctx.fillText('readixon.com/universe', width / 2, footerY);

    ctx.font = '500 18px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText('Hikâye & Evren Keşif Platformu', width / 2, footerY + 28);

    return canvas.toDataURL('image/png');
  }, [
    getDimensions, 
    currentTheme, 
    cardType, 
    selectedCharacter, 
    selectedLocation, 
    selectedThread, 
    universe, 
    ratio, 
    userChapterOrder, 
    stories.length, 
    characters.length, 
    locations.length,
    plotThreads.length,
    backgroundCoverUrl,
    characterPngUrl,
    characterPortraitUrl,
    universeFeaturedCover
  ]);

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
      link.download = `${universe.slug || 'readixon'}-${cardType}-${ratio}-kart.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Sosyal paylaşım kartı yüksek kalitede indirildi!');
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
      const file = new File([blob], `${universe.title}-${cardType}-kart.png`, { type: 'image/png' });

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

  const selectedCharacterRoleBadge = selectedCharacter ? getRoleBadgeStyle(selectedCharacter.role) : null;

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
                Instagram (Dikey Post & Story), WhatsApp ve Twitter (X) için yüksek çözünürlüklü kurgu kartları üretin.
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
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

            {/* 2. Format Oranı (Aspect Ratio) - 4:5 Post, 9:16 Story, 1:1 Kare, 16:9 Yatay */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-foreground">
                  2. Boyut Formatı
                </label>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  4:5 Dikey Post Önerilen
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRatio('post')}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    ratio === 'post'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone size={16} className="shrink-0" />
                    <span className="text-[11px] block font-black">Post (4:5)</span>
                  </div>
                  <span className="text-[10px] text-muted block">Instagram Dikey Feed</span>
                  <span className="text-[9px] text-muted/70 block">1080 x 1350 px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('story')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratio === 'story'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone size={16} className="shrink-0" />
                    <span className="text-[11px] block font-black">Story (9:16)</span>
                  </div>
                  <span className="text-[10px] text-muted block">Instagram / Reels</span>
                  <span className="text-[9px] text-muted/70 block">1080 x 1920 px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('square')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratio === 'square'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Square size={16} className="shrink-0" />
                    <span className="text-[11px] block font-black">Kare (1:1)</span>
                  </div>
                  <span className="text-[10px] text-muted block">Klasik Gönderi</span>
                  <span className="text-[9px] text-muted/70 block">1080 x 1080 px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('landscape')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratio === 'landscape'
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-background/60 border-border/50 text-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tv size={16} className="shrink-0" />
                    <span className="text-[11px] block font-black">Yatay (16:9)</span>
                  </div>
                  <span className="text-[10px] text-muted block">Twitter / X Afiş</span>
                  <span className="text-[9px] text-muted/70 block">1200 x 675 px</span>
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
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
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
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>PNG Olarak İndir (1080p Yüksek Çözünürlük)</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Paylaşım Menüsü"
                >
                  <Share2 size={14} className="text-primary" />
                  <span>Paylaş</span>
                </button>
                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Twitter'da Paylaş"
                >
                  <XTwitterIcon size={13} className="text-foreground" />
                  <span>X / Tweet</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <Sparkles size={11} className="text-primary" /> Canlı Kart Önizlemesi ({ratio.toUpperCase()})
            </span>

            {/* DOM Önizleme Çerçevesi */}
            <div
              ref={previewRef}
              className={`w-full max-w-[340px] rounded-3xl overflow-hidden border-2 shadow-2xl relative flex flex-col justify-between p-5 select-none transition-all duration-300 bg-black ${currentTheme.border} ${
                ratio === 'post'
                  ? 'aspect-[4/5]'
                  : ratio === 'story'
                  ? 'aspect-[9/16]'
                  : ratio === 'square'
                  ? 'aspect-square'
                  : 'aspect-[16/9]'
              }`}
            >
              {/* 1. Arka Plan: Atmosferik Görsel (Net ve Canlı Blur) + Sinematik Degrade */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {backgroundCoverUrl ? (
                  <>
                    <img
                      src={backgroundCoverUrl}
                      alt={universe.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover filter blur-md scale-110 opacity-60"
                    />
                    {/* Dengeli Sinematik Karartma: Yazı kontrastını korurken kapağın renklerini ve karakterlerini canlı gösterir */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/55" />
                    {/* Tematik Ortam Işığı */}
                    <div 
                      className="absolute inset-0 opacity-45 mix-blend-screen"
                      style={{
                        background: `radial-gradient(circle at 50% 35%, ${currentTheme.glow} 0%, transparent 70%)`
                      }}
                    />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bgGrad}`} />
                )}
              </div>

              {/* İnce Izgara Efekti */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* 2. Header (Üst Damga) */}
              <div className="relative z-10 text-center shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${currentTheme.accentText}`}>
                  READIXON • EVREN
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight truncate drop-shadow-md">
                  {universe.title}
                </h4>
              </div>

              {/* 3. Orta Gövde (Zengin Görsel Vitrini) */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-2">
                {cardType === 'character' && selectedCharacter ? (
                  <div className="w-full flex flex-col items-center justify-center space-y-1.5">
                    {/* Rol Rozeti */}
                    {selectedCharacterRoleBadge && (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${selectedCharacterRoleBadge.bg}`}>
                        {selectedCharacterRoleBadge.label}
                      </span>
                    )}

                    {/* Karakter Görseli (Şeffaf PNG veya 3D Portre Kartı) */}
                    {characterPngUrl ? (
                      <div className="relative h-40 sm:h-44 w-full flex items-center justify-center my-1 group">
                        {/* Karakter Arkası Glow */}
                        <div className={`absolute w-32 h-32 rounded-full blur-2xl opacity-40 ${currentTheme.accent} pointer-events-none`} />
                        <img
                          src={characterPngUrl}
                          alt={selectedCharacter.name}
                          crossOrigin="anonymous"
                          className="h-full max-w-[85%] object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)] z-10 transition-transform duration-300"
                        />
                      </div>
                    ) : characterPortraitUrl ? (
                      <div className="relative my-1">
                        <div 
                          className={`w-28 h-36 rounded-2xl overflow-hidden border-2 shadow-2xl relative bg-card/90 ${currentTheme.border}`}
                          style={{
                            boxShadow: '0 15px 30px rgba(0,0,0,0.85)'
                          }}
                        >
                          <img 
                            src={characterPortraitUrl} 
                            alt={selectedCharacter.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center my-2 bg-card/60 ${currentTheme.border}`}>
                        <span className={`text-3xl font-black ${currentTheme.accentText}`}>
                          {selectedCharacter.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <h3 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md">
                      {selectedCharacter.name}
                    </h3>

                    {selectedCharacter.occupation && (
                      <span className="text-[10px] text-zinc-300 font-medium block">
                        {selectedCharacter.occupation}
                      </span>
                    )}

                    {selectedCharacter.coreMotivation && (
                      <p className="text-[10px] text-zinc-300 italic line-clamp-2 px-3 leading-snug">
                        "{selectedCharacter.coreMotivation}"
                      </p>
                    )}
                  </div>
                ) : cardType === 'universe' ? (
                  <div className="w-full flex flex-col items-center justify-center space-y-2">
                    {/* Tür Rozeti */}
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${currentTheme.border} ${currentTheme.accentText} bg-black/50`}>
                      {getUniverseGenreLabel(universe.genre)}
                    </span>

                    {/* 3D Kitap Kapağı Vitrini (Canlı Önizlemede Net ve Belirgin) */}
                    {universeFeaturedCover ? (
                      <div className="relative my-2 flex items-center justify-center">
                        {/* Kitap Glow */}
                        <div 
                          className="absolute w-32 h-44 rounded-2xl blur-2xl opacity-45 pointer-events-none"
                          style={{ background: currentTheme.canvasAccent }}
                        />
                        {/* 3D Fiziksel Kitap */}
                        <div 
                          className="w-28 sm:w-32 h-40 sm:h-44 rounded-r-xl rounded-l-xs overflow-hidden border-y border-r border-white/25 relative bg-zinc-950 transition-transform duration-300 hover:scale-105"
                          style={{
                            transform: 'perspective(700px) rotateY(-8deg)',
                            boxShadow: '12px 18px 35px rgba(0,0,0,0.85), inset -2px 0 6px rgba(255,255,255,0.15)'
                          }}
                        >
                          <img 
                            src={universeFeaturedCover} 
                            alt={universe.title}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover" 
                          />
                          {/* 3D Kitap Sırtı Işıltısı */}
                          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/80 via-white/20 to-transparent pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center mx-auto my-2">
                        <Globe size={28} />
                      </div>
                    )}

                    <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">
                      {universe.title}
                    </h3>

                    {universe.authorName && (
                      <span className="text-[10px] font-bold text-zinc-300 block -mt-1">
                        Evren Mimarı: @{universe.authorName}
                      </span>
                    )}

                    <p className="text-[10px] text-zinc-300 line-clamp-2 px-2 leading-relaxed">
                      {universe.description || 'Kurgusal evrenin tüm sırları, haritası ve epik karakterleri Readixon\'da keşfedilmeyi bekliyor.'}
                    </p>

                    {/* Karakter Avatarları Kolajı & İstatistik Hapı */}
                    <div className="pt-1 flex items-center justify-center gap-1.5 flex-wrap">
                      {characters.length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                          {characters.slice(0, 3).map((c) => (
                            <div key={c.id} className="inline-block h-5 w-5 rounded-full ring-1 ring-background overflow-hidden bg-card">
                              {c.avatarUrl || c.pngGallery?.portraitUrl ? (
                                <img src={c.avatarUrl || c.pngGallery?.portraitUrl} alt={c.name} crossOrigin="anonymous" className="h-full w-full object-cover" />
                              ) : (
                                <span className="h-full w-full flex items-center justify-center text-[8px] font-bold text-white bg-primary">
                                  {c.name.charAt(0)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <span className="text-[9px] font-bold text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {stories.length} Eser • {characters.length} Karakter • {locations.length} Mekân
                      </span>
                    </div>
                  </div>
                ) : (
                  // Keşif Sırrı
                  <div className="space-y-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Sparkles size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                      YENİ SIR KEŞFEDİLDİ
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">
                      {selectedCharacter?.name || selectedLocation?.name || universe.title}
                    </h3>
                    <p className="text-[10px] text-zinc-300 line-clamp-2 px-2">
                      {selectedCharacter?.readerNotes || selectedLocation?.description || 'Okuma yolculuğunda yeni bir kurgu parçası aydınlandı.'}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Footer (Alt İmzası) */}
              <div className="relative z-10 pt-2 border-t border-border/60 text-center shrink-0">
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
