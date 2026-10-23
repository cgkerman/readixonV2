'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Story,
  User,
  Chapter,
  getUniverseGenreLabel
} from '@readixon/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
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
  BookOpen,
  Heart,
  MessageCircle,
  Send,
  Loader2,
  Sliders,
  Type
} from 'lucide-react';
import { toast } from 'sonner';

interface NativeImageSaverPlugin {
  saveImage(options: { base64: string; fileName: string }): Promise<{ success: boolean; fileName?: string }>;
}

const NativeImageSaver = registerPlugin<NativeImageSaverPlugin>('NativeImageSaver');

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

export type AdminCardRatio = 'post' | 'story' | 'square' | 'landscape'; // 4:5, 9:16, 1:1, 16:9
export type AdminThemePreset = 'amethyst_purple' | 'obsidian_gold' | 'sapphire_cyan' | 'ruby_crimson';

export interface AdminStoryShareModalProps {
  story: Story;
  author?: User | null;
  chapters?: Chapter[];
  onClose: () => void;
}

const THEME_CONFIGS: Record<AdminThemePreset, {
  name: string;
  tagline: string;
  accent: string;
  glowColor: string;
  clothColor: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  canvasAccent: string;
  canvasGlow: string;
  canvasCloth: string;
  canvasPillBg: string;
  canvasPillBorder: string;
  canvasPillText: string;
}> = {
  amethyst_purple: {
    name: 'Ametist & Mor (Referans)',
    tagline: 'Orijinal Referans Görsel Tasarımı',
    accent: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    clothColor: '#3b0764',
    pillBg: 'bg-purple-500/10',
    pillBorder: 'border-purple-500/30',
    pillText: 'text-purple-300',
    iconBg: 'from-purple-500/30 to-purple-900/50',
    iconBorder: 'border-purple-400/30',
    iconText: 'text-purple-300',
    canvasAccent: '#a855f7',
    canvasGlow: 'rgba(168, 85, 247, 0.55)',
    canvasCloth: '#3b0764',
    canvasPillBg: 'rgba(168, 85, 247, 0.12)',
    canvasPillBorder: 'rgba(168, 85, 247, 0.35)',
    canvasPillText: '#d8b4fe',
  },
  obsidian_gold: {
    name: 'Altın & Asil',
    tagline: 'Readixon İmza Amber Tonları',
    accent: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    clothColor: '#78350f',
    pillBg: 'bg-amber-500/10',
    pillBorder: 'border-amber-500/30',
    pillText: 'text-amber-300',
    iconBg: 'from-amber-500/30 to-amber-900/50',
    iconBorder: 'border-amber-400/30',
    iconText: 'text-amber-300',
    canvasAccent: '#f59e0b',
    canvasGlow: 'rgba(245, 158, 11, 0.55)',
    canvasCloth: '#78350f',
    canvasPillBg: 'rgba(245, 158, 11, 0.12)',
    canvasPillBorder: 'rgba(245, 158, 11, 0.35)',
    canvasPillText: '#fcd34d',
  },
  sapphire_cyan: {
    name: 'Safir & Neon',
    tagline: 'Elektrik Mavisi & Siberpunk',
    accent: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    clothColor: '#164e63',
    pillBg: 'bg-cyan-500/10',
    pillBorder: 'border-cyan-500/30',
    pillText: 'text-cyan-300',
    iconBg: 'from-cyan-500/30 to-cyan-900/50',
    iconBorder: 'border-cyan-400/30',
    iconText: 'text-cyan-300',
    canvasAccent: '#06b6d4',
    canvasGlow: 'rgba(6, 182, 212, 0.55)',
    canvasCloth: '#164e63',
    canvasPillBg: 'rgba(6, 182, 212, 0.12)',
    canvasPillBorder: 'rgba(6, 182, 212, 0.35)',
    canvasPillText: '#67e8f9',
  },
  ruby_crimson: {
    name: 'Kızıl & Gotik',
    tagline: 'Yakut Kırmızısı & Derin Kurgu',
    accent: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    clothColor: '#881337',
    pillBg: 'bg-rose-500/10',
    pillBorder: 'border-rose-500/30',
    pillText: 'text-rose-300',
    iconBg: 'from-rose-500/30 to-rose-900/50',
    iconBorder: 'border-rose-400/30',
    iconText: 'text-rose-300',
    canvasAccent: '#f43f5e',
    canvasGlow: 'rgba(244, 63, 94, 0.55)',
    canvasCloth: '#881337',
    canvasPillBg: 'rgba(244, 63, 94, 0.12)',
    canvasPillBorder: 'rgba(244, 63, 94, 0.35)',
    canvasPillText: '#fda4af',
  },
};

const resolveGenreText = (story: Story): string => {
  if (story.mainGenre) {
    return getUniverseGenreLabel(story.mainGenre);
  }
  if (story.tags && story.tags.length > 0) {
    return story.tags[0];
  }
  return 'Edebiyat & Kurgu';
};

const formatLikesCount = (count?: number): string => {
  if (!count || count <= 0) return '1.2K';
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}K`;
  }
  return count.toString();
};

export const AdminStoryShareModal: React.FC<AdminStoryShareModalProps> = ({
  story,
  author,
  chapters = [],
  onClose,
}) => {
  const [ratio, setRatio] = useState<AdminCardRatio>('post'); // default 4:5 as in the image
  const [theme, setTheme] = useState<AdminThemePreset>('amethyst_purple');
  const [tagline, setTagline] = useState('Books. Ideas. A calmer mind.');
  const [customGenre, setCustomGenre] = useState(resolveGenreText(story));
  const [customHook, setCustomHook] = useState(
    story.summary || story.foreword || story.backCover || 'Kurgunun büyüleyici dünyasını keşfedin.'
  );

  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEME_CONFIGS[theme];
  const authorDisplayName = author?.displayName || story.authorName || 'Readixon Yazarı';
  const likesDisplay = formatLikesCount(story.stats?.likes);
  const chapterCountDisplay = chapters.length > 0 ? chapters.length : 12;

  // Güvenli Görsel Yükleme
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = (e) => reject(e);
        fallback.src = src;
      };
      img.src = src;
    });
  }, []);

  // Metin sarmalama (Canvas için)
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 3
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        if (linesDrawn === maxLines - 1) {
          ctx.fillText(line.trim() + '...', x, currentY);
          return currentY + lineHeight;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  /**
   * Merkez Kitap Kapağı Çizimi (Sadece Kapak - 3D Mockup Olmadan)
   * - Zemin Ambiyans Glow'u (Theme Glow)
   * - Yumuşak Düşen Gölge (Elevation Drop Shadow)
   * - Yuvarlatılmış Köşeli Kapak Görseli
   * - İnce Parlak Kenarlık Çerçevesi
   */
  const drawBookCoverCard = (
    ctx: CanvasRenderingContext2D,
    bookImg: HTMLImageElement,
    centerX: number,
    centerY: number,
    coverW: number,
    coverH: number,
    cfg: typeof currentTheme
  ) => {
    ctx.save();

    const coverX = Math.round(centerX - coverW / 2);
    const coverY = Math.round(centerY - coverH / 2);
    const radius = 24;

    // 1. Zemin Ambiyans Glow'u
    ctx.save();
    const glowGrad = ctx.createRadialGradient(
      centerX, centerY + coverH * 0.1, 30,
      centerX, centerY + coverH * 0.1, coverW * 0.95
    );
    glowGrad.addColorStop(0, cfg.canvasGlow);
    glowGrad.addColorStop(0.5, cfg.canvasGlow.replace(/[\d.]+\)$/, '0.15)'));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + coverH * 0.1, coverW * 0.95, coverH * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Yumuşak Zemin Düşen Gölgesi (Deep Drop Shadow)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 45;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 24;

    // 3. Kapak Görseli (Yuvarlatılmış Köşeler)
    ctx.beginPath();
    ctx.moveTo(coverX + radius, coverY);
    ctx.lineTo(coverX + coverW - radius, coverY);
    ctx.arcTo(coverX + coverW, coverY, coverX + coverW, coverY + radius, radius);
    ctx.lineTo(coverX + coverW, coverY + coverH - radius);
    ctx.arcTo(coverX + coverW, coverY + coverH, coverX + coverW - radius, coverY + coverH, radius);
    ctx.lineTo(coverX + radius, coverY + coverH);
    ctx.arcTo(coverX, coverY + coverH, coverX, coverY + coverH - radius, radius);
    ctx.lineTo(coverX, coverY + radius);
    ctx.arcTo(coverX, coverY, coverX + radius, coverY, radius);
    ctx.closePath();
    ctx.fillStyle = '#18181b';
    ctx.fill();
    ctx.clip();

    ctx.drawImage(bookImg, coverX, coverY, coverW, coverH);
    ctx.restore();

    // 4. İnce Parlak Kenarlık Çerçevesi
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(coverX + radius, coverY);
    ctx.lineTo(coverX + coverW - radius, coverY);
    ctx.arcTo(coverX + coverW, coverY, coverX + coverW, coverY + radius, radius);
    ctx.lineTo(coverX + coverW, coverY + coverH - radius);
    ctx.arcTo(coverX + coverW, coverY + coverH, coverX + coverW - radius, coverY + coverH, radius);
    ctx.lineTo(coverX + radius, coverY + coverH);
    ctx.arcTo(coverX, coverY + coverH, coverX, coverY + coverH - radius, radius);
    ctx.lineTo(coverX, coverY + radius);
    ctx.arcTo(coverX, coverY, coverX + radius, coverY, radius);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  // Canvas Oluşturucu
  const generateCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    let width = 1080;
    let height = 1350; // Post 4:5

    if (ratio === 'story') {
      width = 1080;
      height = 1920;
    } else if (ratio === 'square') {
      width = 1080;
      height = 1080;
    } else if (ratio === 'landscape') {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context başlatılamadı');

    const cfg = currentTheme;

    // 1. Zemin: Derin Kozmik Siyah + Yumuşak Degrade
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.45, 100,
      width / 2, height / 2, width * 0.8
    );
    bgGrad.addColorStop(0, '#12131d');
    bgGrad.addColorStop(0.6, '#0b0c13');
    bgGrad.addColorStop(1, '#06060a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // İnce Dış Kenarlık (Card Border)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Güvenli Bölge / Margin Ayarları (Story için 9:16 safe-zone korumalı)
    const padX = Math.round(width * 0.08); // ~86px
    let topY = Math.round(height * 0.06); // ~80px (story için aşağı çekilecek)
    let bottomLimit = height - Math.round(height * 0.06);

    if (ratio === 'story') {
      topY = 280; // Instagram üst barı (~240px) altı
      bottomLimit = 1620; // Instagram alt yanıt barı (~1680px) üstü
    }

    // 2. ÜST BAR: READIXON İKONU + READIXON + SLOGAN + ÜÇ NOKTA
    const iconSize = 64;
    const iconX = padX;
    const iconY = topY;

    // Squircle Arka Plan
    ctx.save();
    const iconRadius = 18;
    ctx.beginPath();
    ctx.moveTo(iconX + iconRadius, iconY);
    ctx.lineTo(iconX + iconSize - iconRadius, iconY);
    ctx.arcTo(iconX + iconSize, iconY, iconX + iconSize, iconY + iconRadius, iconRadius);
    ctx.lineTo(iconX + iconSize, iconY + iconSize - iconRadius);
    ctx.arcTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - iconRadius, iconY + iconSize, iconRadius);
    ctx.lineTo(iconX + iconRadius, iconY + iconSize);
    ctx.arcTo(iconX, iconY + iconSize, iconX, iconY + iconSize - iconRadius, iconRadius);
    ctx.lineTo(iconX, iconY + iconRadius);
    ctx.arcTo(iconX, iconY, iconX + iconRadius, iconY, iconRadius);
    ctx.closePath();
    ctx.fillStyle = cfg.canvasPillBg;
    ctx.fill();
    ctx.strokeStyle = cfg.canvasPillBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Kitap İkonu
    ctx.fillStyle = cfg.canvasPillText;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📖', iconX + iconSize / 2, iconY + iconSize / 2);
    ctx.restore();

    // "Readixon" Marka Başlığı
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Inter", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Readixon', iconX + iconSize + 20, iconY + 4);

    // Slogan ("Books. Ideas. A calmer mind.")
    ctx.fillStyle = '#8e8ea0';
    ctx.font = '500 20px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillText(tagline, iconX + iconSize + 20, iconY + 42);

    // Üç Nokta (•••)
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('•••', width - padX, iconY + 14);

    // 3. MERKEZ KİTAP KAPAĞI (Sadece Kapak Görseli)
    let coverW = 380;
    let coverH = 570; // 2:3 standart kapak oranı
    let coverCenterY = Math.round(topY + (bottomLimit - topY) * 0.44);

    if (ratio === 'story') {
      coverW = 440;
      coverH = 660;
      coverCenterY = 900;
    } else if (ratio === 'square') {
      coverW = 320;
      coverH = 480;
      coverCenterY = height * 0.45;
    } else if (ratio === 'landscape') {
      coverW = 240;
      coverH = 360;
      coverCenterY = height * 0.46;
    }

    if (story.coverImage) {
      try {
        const coverImg = await loadImage(story.coverImage);
        drawBookCoverCard(ctx, coverImg, width / 2, coverCenterY, coverW, coverH, cfg);
      } catch (err) {
        console.warn('Kapak resmi yüklenemedi:', err);
      }
    }

    // 4. ALT BİLGİ ALANI: BAŞLIK + YAZAR + ÖZET + SAĞDA TÜR ROZETİ
    const infoY = Math.round(coverCenterY + coverH / 2 + 50);
    const rightPillWidth = 240;
    const titleMaxWidth = width - padX * 2 - rightPillWidth - 30;

    // Sağ Üstte Tür Rozeti (Örn: 📖 Personal Growth / Fantastik)
    ctx.save();
    const pillH = 44;
    const pillW = Math.min(260, Math.max(160, ctx.measureText(customGenre).width + 70));
    const pillX = width - padX - pillW;
    const pillY = infoY + 2;

    ctx.beginPath();
    const pillRad = 14;
    ctx.moveTo(pillX + pillRad, pillY);
    ctx.lineTo(pillX + pillW - pillRad, pillY);
    ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillRad, pillRad);
    ctx.lineTo(pillX + pillW, pillY + pillH - pillRad);
    ctx.arcTo(pillX + pillW, pillY + pillH, pillX + pillW - pillRad, pillY + pillH, pillRad);
    ctx.lineTo(pillX + pillRad, pillY + pillH);
    ctx.arcTo(pillX, pillY + pillH, pillX, pillY + pillH - pillRad, pillRad);
    ctx.lineTo(pillX, pillY + pillRad);
    ctx.arcTo(pillX, pillY, pillX + pillRad, pillY, pillRad);
    ctx.closePath();
    ctx.fillStyle = cfg.canvasPillBg;
    ctx.fill();
    ctx.strokeStyle = cfg.canvasPillBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = cfg.canvasPillText;
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📖 ${customGenre}`, pillX + pillW / 2, pillY + pillH / 2);
    ctx.restore();

    // Kitap Başlığı
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const nextY = wrapText(ctx, story.title, padX, infoY, titleMaxWidth, 48, 2);

    // Yazar Adı
    ctx.fillStyle = '#d4d4d8';
    ctx.font = '600 26px "Inter", system-ui, sans-serif';
    ctx.fillText(authorDisplayName, padX, nextY + 4);

    // Kısa Açıklama / Spot
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'normal 21px "Inter", system-ui, sans-serif';
    wrapText(ctx, customHook, padX, nextY + 46, width - padX * 2, 30, 2);

    // 5. EN ALT SOSYAL BAR: BEĞENİ + BÖLÜM + SHARE
    const footerY = bottomLimit - 40;

    // Ayırıcı İnce Çizgi
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, footerY - 24);
    ctx.lineTo(width - padX, footerY - 24);
    ctx.stroke();

    // Beğeni Sayısı (❤️ 1.2K)
    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`❤️  ${likesDisplay}`, padX, footerY);

    // Bölüm / Yorum Sayısı (💬 42)
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`💬  ${chapterCountDisplay}`, padX + 160, footerY);

    // Paylaşım Butonu / readixon.com (✈ Paylaş)
    ctx.textAlign = 'right';
    ctx.fillStyle = cfg.canvasPillText;
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText('✈  Paylaş', width - padX, footerY);

    return canvas;
  };

  // İndirme İşlemi
  const handleDownload = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Yüksek çözünürlüklü paylaşım kartı üretiliyor...');

    try {
      const canvas = await generateCanvas();
      const fileName = `Readixon-${story.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${ratio}.png`;

      // 1. Android Capacitor Native
      if (Capacitor.isNativePlatform()) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          const result = await NativeImageSaver.saveImage({ base64, fileName });
          if (result.success) {
            toast.success('Kart galerinize kaydedildi!', { id: toastId });
            setIsExporting(false);
            return;
          }
        } catch (nativeErr) {
          console.warn('NativeImageSaver başarısız, web fallback deneniyor:', nativeErr);
        }
      }

      // 2. Mobil WebView / Tarayıcı
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const ticketRes = await fetch('/api/download?format=json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: dataUrl, filename: fileName }),
          });
          if (ticketRes.ok) {
            const ticketData = await ticketRes.json();
            if (ticketData?.ticket) {
              window.location.href = `/api/download?ticket=${encodeURIComponent(ticketData.ticket)}`;
              toast.success('Paylaşım kartı indiriliyor!', { id: toastId });
              setIsExporting(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('/api/download başarısız:', apiErr);
        }
      }

      // 3. Desktop Standart Blob İndirme
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Görsel oluşturulamadı.', { id: toastId });
          setIsExporting(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('1080p Paylaşım Kartı İndirildi!', { id: toastId });
        setIsExporting(false);
      }, 'image/png');
    } catch (err: any) {
      console.error('İndirme hatası:', err);
      toast.error('Görsel üretilirken bir hata oluştu: ' + (err?.message || ''), { id: toastId });
      setIsExporting(false);
    }
  };

  // Web Share API Paylaşımı
  const handleNativeShare = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Paylaşım için hazırlanıyor...');

    try {
      const canvas = await generateCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Paylaşım dosyası oluşturulamadı', { id: toastId });
          setIsExporting(false);
          return;
        }

        const fileName = `${story.title}-readixon.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${story.title} - Readixon`,
              text: `${story.title} hikayesini Readixon'da okuyun!`,
              url: `https://readixon.com/story/${story.storyId || (story as any).id}`,
            });
            toast.success('Başarıyla paylaşıldı!', { id: toastId });
          } catch (shareErr: any) {
            if (shareErr.name !== 'AbortError') {
              toast.error('Paylaşım iptal edildi.', { id: toastId });
            }
          }
        } else {
          handleDownload();
          toast.info('Doğrudan dosya paylaşımı desteklenmiyor, görsel indirildi.', { id: toastId });
        }
        setIsExporting(false);
      }, 'image/png');
    } catch (err: any) {
      toast.error('Paylaşım hatası: ' + (err?.message || ''), { id: toastId });
      setIsExporting(false);
    }
  };

  // Twitter (X) Paylaşımı
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${story.title}" kurgu dünyasını Readixon'da keşfedin! 📖✨`);
    const url = encodeURIComponent(`https://readixon.com/story/${story.storyId || (story as any).id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  // Bağlantı Kopyalama
  const handleCopyLink = () => {
    const url = `https://readixon.com/story/${story.storyId || (story as any).id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Hikaye bağlantısı kopyalandı!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div
        className="w-full max-w-5xl bg-[#0b0c13] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL ÜST BAŞLIK */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Readixon Sosyal Paylaşım & Vitrin Stüdyosu</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Admin Özel
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Birebir referans tasarıma sahip 3D fiziksel kitap kartları ve sosyal afişler üretin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL GÖVDE: SOL KONTROLLER + SAĞ ÖNİZLEME */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-h-[85vh] overflow-y-auto">
          {/* SOL: AYARLAR VE DIŞA AKTARMA (5 Kolon) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Format Boyutu */}
            <div>
              <label className="text-xs font-bold text-zinc-200 block mb-2 flex items-center gap-1.5">
                <Sliders size={14} className="text-purple-400" /> 1. Format ve Boyut
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRatio('post')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${ratio === 'post'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-bold shadow-xs'
                      : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone size={15} className="text-purple-400" />
                    <span className="text-xs font-black">Post (4:5)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Instagram / Vitrin</span>
                  <span className="text-[9px] text-zinc-500 block">1080 x 1350 px (Referans)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('story')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${ratio === 'story'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-bold shadow-xs'
                      : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone size={15} className="text-purple-400" />
                    <span className="text-xs font-black">Story (9:16)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Hikaye & Reels</span>
                  <span className="text-[9px] text-zinc-500 block">1080 x 1920 px (Safe-Zone)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('square')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${ratio === 'square'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-bold shadow-xs'
                      : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Square size={15} className="text-purple-400" />
                    <span className="text-xs font-black">Kare (1:1)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Klasik Feed</span>
                  <span className="text-[9px] text-zinc-500 block">1080 x 1080 px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('landscape')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${ratio === 'landscape'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-bold shadow-xs'
                      : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tv size={15} className="text-purple-400" />
                    <span className="text-xs font-black">Yatay (16:9)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Twitter / X Afiş</span>
                  <span className="text-[9px] text-zinc-500 block">1200 x 675 px</span>
                </button>
              </div>
            </div>

            {/* 2. Ambiyans Işık & Renk Paleti */}
            <div>
              <label className="text-xs font-bold text-zinc-200 block mb-2 flex items-center gap-1.5">
                <Palette size={14} className="text-purple-400" /> 2. Zemin Işık & Atmosfer Paleti
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(THEME_CONFIGS).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key as AdminThemePreset)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${theme === key
                        ? 'border-purple-500 bg-purple-500/15 shadow-xs'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400'
                      }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ background: cfg.accent }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{cfg.name}</span>
                      <span className="text-[9px] text-zinc-500 block truncate">{cfg.tagline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Metin & İçerik Özelleştirme */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <label className="text-xs font-bold text-zinc-200 block flex items-center gap-1.5">
                <Type size={14} className="text-purple-400" /> 3. Kart İçeriği & Spot
              </label>

              <div>
                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">Üst Marka Sloganı</span>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Books. Ideas. A calmer mind."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">Tür Rozeti Metni</span>
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Kişisel Gelişim / Fantastik..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">Açıklama / Spot Metni (2 Satır)</span>
                <textarea
                  rows={2}
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  placeholder="Kısa çarpıcı özet veya alıntı..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>
            </div>

            {/* Dışa Aktarma Butonları */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
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
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Sistem Paylaşımı"
                >
                  <Share2 size={14} className="text-purple-400" />
                  <span>Paylaş</span>
                </button>
                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Twitter (X)"
                >
                  <XTwitterIcon size={13} className="text-white" />
                  <span>X / Tweet</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Bağlantıyı Kopyala"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SAĞ: CANLI BİREBİR KART ÖNİZLEMESİ (7 Kolon) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-[#07080d] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" /> Canlı Kurumsal Kart Önizlemesi ({ratio.toUpperCase()})
            </span>

            {/* DOM Canlı Önizleme Çerçevesi (Referans Görsel Tasarımı) */}
            <div
              ref={previewRef}
              className={`w-full max-w-[360px] rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative flex flex-col justify-between select-none transition-all duration-300 bg-[#0d0e15] ${ratio === 'story' ? 'p-6 py-12' : 'p-5'
                } ${ratio === 'post'
                  ? 'aspect-[4/5]'
                  : ratio === 'story'
                    ? 'aspect-[9/16]'
                    : ratio === 'square'
                      ? 'aspect-square'
                      : 'aspect-[16/9]'
                }`}
            >
              {/* 1. ÜST BAR: Squircle Logo + Readixon + Slogan + Üç Nokta */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentTheme.iconBg} border ${currentTheme.iconBorder} flex items-center justify-center shadow-xs`}>
                    <BookOpen size={15} className={currentTheme.iconText} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                      Readixon
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5 leading-none">
                      {tagline}
                    </p>
                  </div>
                </div>
                <div className="text-zinc-500 text-sm tracking-widest font-black select-none">
                  •••
                </div>
              </div>

              {/* 2. MERKEZ KİTAP KAPAĞI (Sadece Kapak - Mockup Olmadan) */}
              <div className="relative my-auto py-3 flex items-center justify-center select-none">
                {/* Zemin Ambiyans Işık Süzmesi */}
                <div
                  className="absolute inset-0 m-auto w-44 sm:w-56 h-48 sm:h-64 rounded-full blur-2xl pointer-events-none transition-all duration-300"
                  style={{ background: currentTheme.glowColor }}
                />

                {/* Kapak Kartı */}
                <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.85)] z-10 transition-transform duration-300 hover:scale-[1.02]">
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-3 text-center text-zinc-500">
                      <BookOpen size={36} className="mb-2" />
                      <span className="text-xs font-bold text-white line-clamp-2">{story.title}</span>
                    </div>
                  )}
                  {/* İnce Yüzey Yansıması */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>

              {/* 3. BİLGİ ALANI: BAŞLIK + YAZAR + SPOGAN + SAĞDA TÜR ROZETİ */}
              <div className="relative z-10 pt-2">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-zinc-300 font-semibold mt-0.5 line-clamp-1">
                      {authorDisplayName}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed mt-1 line-clamp-2">
                      {customHook}
                    </p>
                  </div>

                  {/* Tür Rozeti (Örn: 📖 Personal Growth) */}
                  <div className="shrink-0 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} ${currentTheme.pillText} text-[10px] font-bold shadow-2xs`}>
                      <BookOpen size={11} />
                      <span className="truncate max-w-[100px]">{customGenre}</span>
                    </span>
                  </div>
                </div>

                {/* 4. EN ALT SOSYAL BAR: Beğeni + Yorum + Share */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 mt-2.5 text-zinc-400 text-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300">
                      <Heart size={13} className="text-rose-400 fill-rose-400/20" />
                      <span>{likesDisplay}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300">
                      <MessageCircle size={13} className="text-zinc-400" />
                      <span>{chapterCountDisplay}</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 text-[11px] font-bold ${currentTheme.pillText}`}>
                    <Send size={12} />
                    <span>Paylaş</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
