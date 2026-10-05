'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { ReadingListCoverCollage } from './ReadingListCoverCollage';
import type { ReadingList, Story } from '@readixon/core';
import { toast } from 'sonner';

const XTwitterIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareReadingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ReadingList;
  stories: Story[];
}

/**
 * Görseli crossOrigin destekli yükler, hata durumunda null döner
 */
const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
};

/**
 * Canvas üzerinde görseli en-boy oranını bozmadan (object-fit: cover) çizer
 */
const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  const imgRatio = imgW / imgH;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;

  if (imgRatio > targetRatio) {
    sWidth = imgH * targetRatio;
    sx = (imgW - sWidth) / 2;
  } else {
    sHeight = imgW / targetRatio;
    sy = (imgH - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
};

export const ShareReadingListModal: React.FC<ShareReadingListModalProps> = ({
  isOpen,
  onClose,
  list,
  stories = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [previewStoryImage, setPreviewStoryImage] = useState<{
    url: string;
    file: File;
    fileName: string;
    dataUrl: string;
  } | null>(null);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const storyCardRef = useRef<HTMLDivElement>(null);

  // ESC tuşu ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewStoryImage) {
          setPreviewStoryImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, previewStoryImage]);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/list/${list.id}` : '';
  const covers = stories.map((s) => s.coverImage || (s as any).coverUrl).filter(Boolean) as string[];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Bağlantı panoya kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Bağlantı kopyalanamadı.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${list.title} | Readixon Okuma Listesi`,
          text: list.description || `${list.userName} tarafından hazırlanan "${list.title}" okuma listesini keşfet!`,
          url: shareUrl,
        });
      } catch (e) {
        // Kullanıcı iptal etti
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectDownload = (imageItem?: { url: string; file: File; fileName: string; dataUrl: string } | null) => {
    const item = imageItem || previewStoryImage;
    if (!item) return;

    try {
      // 1. Data URL (Base64) öncelikli olarak görünmez bir link oluşturup tıkla (Mobil webview'lerde Blob URL'e göre çok daha kararlı)
      const downloadTarget = item.dataUrl || item.url;
      const link = document.createElement('a');
      link.href = downloadTarget;
      link.download = item.fileName;
      link.setAttribute('download', item.fileName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 300);

      toast.success('Story kartı indirme işlemi başlatıldı!');
    } catch (err) {
      console.error('Doğrudan indirme hatası:', err);
      // Fallback: Yeni sekmede veya pencerede aç
      if (item.dataUrl || item.url) {
        window.open(item.dataUrl || item.url, '_blank');
      }
      toast.info('Görsel açıldı. Üzerine basılı tutarak galerinize kaydedebilirsiniz.');
    }
  };

  const handleCopyStoryImageToClipboard = async () => {
    if (!previewStoryImage) return;
    try {
      if (typeof window !== 'undefined' && 'ClipboardItem' in window && navigator.clipboard?.write) {
        const item = new ClipboardItem({ 'image/png': previewStoryImage.file });
        await navigator.clipboard.write([item]);
        setIsImageCopied(true);
        toast.success('Story kartı panoya kopyalandı! Instagram hikayesine yapıştırabilirsiniz.');
        setTimeout(() => setIsImageCopied(false), 2500);
      } else {
        toast.error('Cihazınız panoya görsel kopyalamayı desteklemiyor.');
      }
    } catch (clipErr) {
      console.warn('Görsel panoya kopyalanamadı:', clipErr);
      toast.error('Görsel panoya kopyalanamadı.');
    }
  };

  const handleOpenImageInNewTab = () => {
    if (!previewStoryImage) return;
    const targetUrl = previewStoryImage.dataUrl || previewStoryImage.url;
    window.open(targetUrl, '_blank');
  };

  /**
   * Instagram Story (9:16 - 1080x1920) formatında yüksek çözünürlüklü görsel oluşturur
   * Mobilde / Webview'de indirme ve yerel paylaşımı sorunsuz destekler
   */
  const handleDownloadStoryImage = async () => {
    setIsGeneratingStory(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context oluşturulamadı.');

      // 1. Arka plan degrade (Modern Dark Aesthetic)
      const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGradient.addColorStop(0, '#0a0a10');
      bgGradient.addColorStop(0.25, '#121124');
      bgGradient.addColorStop(0.65, '#19122c');
      bgGradient.addColorStop(1, '#07070b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Ambient Parlama Efekti
      const glowGradient = ctx.createRadialGradient(540, 520, 60, 540, 520, 580);
      glowGradient.addColorStop(0, 'rgba(129, 140, 248, 0.32)');
      glowGradient.addColorStop(0.55, 'rgba(168, 85, 247, 0.12)');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 60, 1080, 950);

      // Gerekli görselleri paralel olarak yükle
      const coverToLoad =
        list.coverUrl && list.coverUrl !== '/images/default-reading-list.jpg'
          ? list.coverUrl
          : covers.length > 0
          ? covers[0]
          : '/images/default-reading-list.jpg';

      const displayStories = stories.slice(0, 5);

      const [logoImg, mascotImg, mainCoverImg, ...storyCoverImgs] = await Promise.all([
        loadImage('/white-Readixon.png'),
        loadImage('/cekirix.png'),
        loadImage(coverToLoad),
        ...displayStories.map((s) => loadImage(s.coverImage || (s as any).coverUrl || '')),
      ]);

      // 3. Üst Logo (Sadece white-Readixon.png)
      if (logoImg) {
        const logoW = 380;
        const logoH = Math.round(
          logoW * ((logoImg.naturalHeight || 1592) / (logoImg.naturalWidth || 6118))
        );
        const logoX = (1080 - logoW) / 2;
        const logoY = 90;
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      }

      // 4. Liste Kapağı (Kare 420x420, Yuvarlatılmış Köşeler & Derin Gölge)
      // Basık görünmemesi için drawImageCover kullanılır!
      const coverSize = 420;
      const coverX = (1080 - coverSize) / 2;
      const coverY = 225;
      const radius = 32;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 22;

      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
      ctx.fillStyle = '#1c1b29';
      ctx.fill();
      ctx.clip();

      if (mainCoverImg) {
        drawImageCover(ctx, mainCoverImg, coverX, coverY, coverSize, coverSize);
      } else {
        const fallbackGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
        fallbackGrad.addColorStop(0, '#4f46e5');
        fallbackGrad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = fallbackGrad;
        ctx.fillRect(coverX, coverY, coverSize, coverSize);
      }
      ctx.restore();

      // 5. Liste Başlığı
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';

      const words = list.title.split(' ');
      let line = '';
      let textY = 695;
      const maxLineWidth = 880;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
          ctx.fillText(line.trim(), 540, textY);
          line = words[n] + ' ';
          textY += 54;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 540, textY);

      // Küratör Bilgisi
      textY += 44;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 24px sans-serif';
      ctx.fillText(`Küratör: ${list.userName || 'Readixon Okuru'}`, 540, textY);

      // 6. LİSTEDE YER ALAN KİTAPLAR KUTUSU (Tracklist Box)
      const boxY = Math.max(textY + 40, 835);
      const boxX = 85;
      const boxWidth = 910;
      const boxHeight = 720;
      const boxRadius = 32;

      ctx.save();
      // Kutu Arka Planı (Glassmorphism)
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, boxRadius);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Kutu Başlığı (Emojisiz)
      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('LİSTEDE YER ALAN KİTAPLAR', boxX + 40, boxY + 52);

      // Sağ üstte hikaye sayısı
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${list.storyIds?.length || stories.length} Hikaye`, boxX + boxWidth - 40, boxY + 52);

      // İnce ayırıcı çizgi
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + 40, boxY + 74);
      ctx.lineTo(boxX + boxWidth - 40, boxY + 74);
      ctx.stroke();

      if (displayStories.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'italic 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bu okuma listesi henüz yeni oluşturuldu.', 540, boxY + 260);
      } else {
        let rowY = boxY + 135;

        displayStories.forEach((story, idx) => {
          const sCoverImg = storyCoverImgs[idx];

          // 1. Sıra Numarası Çemberi
          ctx.beginPath();
          ctx.arc(boxX + 55, rowY - 5, 20, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(129, 140, 248, 0.22)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#e0e7ff';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${idx + 1}`, boxX + 55, rowY + 2);

          // 2. Kitap Kapağı Görseli (Basık görünmemesi için drawImageCover)
          const thumbX = boxX + 92;
          const thumbY = rowY - 38;
          const thumbW = 50;
          const thumbH = 68;
          const thumbR = 8;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(thumbX, thumbY, thumbW, thumbH, thumbR);
          ctx.fillStyle = '#222233';
          ctx.fill();
          ctx.clip();

          if (sCoverImg) {
            drawImageCover(ctx, sCoverImg, thumbX, thumbY, thumbW, thumbH);
          } else {
            const thGrad = ctx.createLinearGradient(thumbX, thumbY, thumbX + thumbW, thumbY + thumbH);
            thGrad.addColorStop(0, '#312e81');
            thGrad.addColorStop(1, '#4338ca');
            ctx.fillStyle = thGrad;
            ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
          }
          ctx.restore();

          // Thumbnail Border
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(thumbX, thumbY, thumbW, thumbH, thumbR);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // 3. Kitap Başlığı
          const textStartX = thumbX + thumbW + 20;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'left';

          let titleText = story.title;
          const maxTextW = 480;
          if (ctx.measureText(titleText).width > maxTextW) {
            while (ctx.measureText(titleText + '...').width > maxTextW && titleText.length > 0) {
              titleText = titleText.slice(0, -1);
            }
            titleText += '...';
          }
          ctx.fillText(titleText, textStartX, rowY - 10);

          // 4. Yazar Adı
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '500 19px sans-serif';
          ctx.fillText(story.authorName || 'Bilinmeyen Yazar', textStartX, rowY + 18);

          // 5. Sağ Taraf Rozeti (Emojisiz temiz tasarım)
          ctx.fillStyle = '#818cf8';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'right';
          const infoText =
            story.format === 'webtoon' ? 'Webtoon' : `${story.stats?.chapterCount || 0} Bölüm`;
          ctx.fillText(infoText, boxX + boxWidth - 40, rowY - 2);

          // Satır arası ayırıcı çizgi
          if (idx < displayStories.length - 1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(boxX + 40, rowY + 45);
            ctx.lineTo(boxX + boxWidth - 40, rowY + 45);
            ctx.stroke();
          }

          rowY += 105;
        });

        if (stories.length > 5) {
          ctx.fillStyle = 'rgba(165, 180, 252, 0.9)';
          ctx.font = 'italic 19px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`+ ${stories.length - 5} diğer kitap daha bu listede...`, 540, boxY + boxHeight - 22);
        }
      }
      ctx.restore();

      // 7. Alt Alan (Maskot Çekirix & Çağrı - Emojisiz Doğal Tasarım)
      const footerY = 1600;

      // Sol Taraf: Metinler & Çağrı
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('readixon.com\'da hemen oku', 110, footerY + 95);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '400 20px sans-serif';
      ctx.fillText('Kitap, Webtoon ve Çevrimiçi Edebiyat', 110, footerY + 135);

      // Rozet (Emojisiz profesyonel görünüm)
      ctx.save();
      const badgeW = 210;
      const badgeH = 46;
      ctx.beginPath();
      ctx.roundRect(110, footerY + 18, badgeW, badgeH, 23);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READIXON SEÇKİSİ', 110 + badgeW / 2, footerY + 47);
      ctx.restore();

      // Sağ Taraf: Sevimli Çekirix Maskotumuz
      if (mascotImg) {
        ctx.save();
        const mascotW = 250;
        const mascotH = 250;
        const mascotX = 750;
        const mascotY = 1585;

        const mascotGlow = ctx.createRadialGradient(
          mascotX + 125,
          mascotY + 125,
          20,
          mascotX + 125,
          mascotY + 125,
          150
        );
        mascotGlow.addColorStop(0, 'rgba(132, 204, 22, 0.25)');
        mascotGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mascotGlow;
        ctx.fillRect(mascotX - 40, mascotY - 40, mascotW + 80, mascotH + 80);

        ctx.drawImage(mascotImg, mascotX, mascotY, mascotW, mascotH);
        ctx.restore();
      }

      // 8. İndirme ve Mobil Uyumluluk Tetikleme (Blob / Web Share API / File)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Görsel dosyası oluşturulamadı.');
      const dataUrl = canvas.toDataURL('image/png');

      const cleanTitle = list.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      const fileName = `readixon-liste-${cleanTitle || 'paylasim'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      // Mobil Tarayıcı veya Capacitor Webview Kontrolü
      const isMobileDevice =
        typeof window !== 'undefined' &&
        (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);

      // Eğer mobil veya dosya paylaşımı destekleniyorsa doğrudan sistem paylaşımını aç
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `${list.title} | Readixon`,
            text: `"${list.title}" okuma listesi`,
          });
          toast.success('Story kartı paylaşıldı!');
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            return;
          }
          console.warn('Doğrudan dosya paylaşımı başarısız, önizleme açılıyor:', shareErr);
        }
      }

      if (!isMobileDevice) {
        // Masaüstü tarayıcılarda doğrudan indirme
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Instagram Story kartı başarıyla indirildi!');
      } else {
        // Mobil / APK WebView: Hem indirmeyi tetiklemeyi dene hem de kullanıcıya kart önizleme & kaydetme penceresini aç
        try {
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            if (document.body.contains(link)) document.body.removeChild(link);
          }, 300);
        } catch {
          // sessizce geç
        }
        setPreviewStoryImage({ url: blobUrl, file, fileName, dataUrl });
      }
    } catch (err) {
      console.error(err);
      toast.error('Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-4 sm:p-6 max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted/30 hover:bg-muted/60 text-foreground flex items-center justify-center transition-colors z-30 cursor-pointer shadow-sm"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>

          {/* Başlık */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 pr-8">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
              <Share2 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">Listeyi Paylaş</h2>
              <p className="text-xs text-muted-foreground truncate">
                Hikayelerini sosyal medyada ve arkadaşlarınla paylaş.
              </p>
            </div>
          </div>

          {/* Canlı Önizleme Kartı (Modal İçi Görsel Kart - Tam Responsive) */}
          <div
            ref={storyCardRef}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/40 via-card to-background border border-indigo-500/25 p-3.5 sm:p-4 mb-4 shadow-inner"
          >
            {/* Üst Kısım: Kapak & Bilgiler (Responsive Flex) */}
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <ReadingListCoverCollage
                covers={covers}
                customCoverUrl={list.coverUrl}
                size="md"
                className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 shadow-lg"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                    Okuma Listesi
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 border border-primary/30 shrink-0">
                    <img src="/white-Readixon.png" alt="Readixon" className="h-3 w-auto object-contain" />
                  </div>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{list.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {list.userName || 'Readixon Okuru'} • {list.storyIds?.length || stories.length} Hikaye
                </p>
              </div>
            </div>

            {/* Listelenen Kitaplar (Emojisiz, Tam Responsive) */}
            {stories.length > 0 ? (
              <div className="pt-2.5 border-t border-border/25 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 flex items-center justify-between">
                  <span>Listede Yer Alan Kitaplar</span>
                  <span className="text-[10px] text-primary/75">{stories.length} Kitap</span>
                </div>
                {stories.slice(0, 4).map((story, idx) => {
                  const cover = story.coverImage || (story as any).coverUrl;
                  return (
                    <div
                      key={story.storyId}
                      className="flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded-xl hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Sıra No */}
                        <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Kitap Kapağı */}
                        <div className="relative w-6 h-8 sm:w-7 sm:h-9 rounded-md overflow-hidden bg-muted/40 shrink-0 border border-border/40 shadow-sm">
                          {cover ? (
                            <img
                              src={cover}
                              alt={story.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-950/40 text-indigo-400">
                              <BookOpen size={11} />
                            </div>
                          )}
                        </div>

                        {/* Kitap Başlığı ve Yazar */}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate text-xs">{story.title}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {story.authorName || 'Yazar'}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-medium text-primary/80 shrink-0">
                        {story.format === 'webtoon' ? 'Webtoon' : `${story.stats?.chapterCount || 0} Bölüm`}
                      </span>
                    </div>
                  );
                })}
                {stories.length > 4 && (
                  <p className="text-[10px] text-primary/80 italic pt-1 pl-2">
                    + {stories.length - 4} diğer kitap daha bu listede
                  </p>
                )}
              </div>
            ) : (
              <div className="pt-3 border-t border-border/20 text-center text-xs text-muted-foreground">
                Henüz bu listeye kitap eklenmemiş.
              </div>
            )}
          </div>

          {/* 1. Aksiyon: Instagram Story Kartı İndir */}
          <button
            onClick={handleDownloadStoryImage}
            disabled={isGeneratingStory}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all mb-3.5 disabled:opacity-50"
          >
            {isGeneratingStory ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Görsel Kart Hazırlanıyor...</span>
              </div>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Instagram Story Kartı İndir (9:16)</span>
              </>
            )}
          </button>

          {/* 2. Aksiyon: Bağlantıyı Kopyala */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-background border border-border/40 mb-3.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-1.5 bg-transparent text-xs text-foreground/80 focus:outline-none truncate select-all font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} className="stroke-[3]" /> Kopyalandı
                </>
              ) : (
                <>
                  <Copy size={14} /> Kopyala
                </>
              )}
            </button>
          </div>

          {/* 3. Aksiyon: Hızlı Sosyal Medya Paylaşımı (Emojisiz Temiz Metin) */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/15">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `"${list.title}" okuma listesini keşfet:\n${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] sm:text-xs font-semibold transition-colors truncate"
            >
              <MessageCircle size={14} className="shrink-0" />
              <span className="truncate">WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `"${list.title}" okuma listesini Readixon'da keşfet!`
              )}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[11px] sm:text-xs font-semibold transition-colors truncate"
            >
              <XTwitterIcon size={13} className="shrink-0" />
              <span className="truncate">X (Twitter)</span>
            </a>

            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                `"${list.title}" okuma listesini Readixon'da keşfet!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] sm:text-xs font-semibold transition-colors truncate"
            >
              <Send size={13} className="shrink-0" />
              <span className="truncate">Telegram</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Mobil / Uygulama İçin Story Kartı Önizleme ve Kolay Kaydetme Modalı ── */}
      {previewStoryImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewStoryImage(null);
            }
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-card border border-border/40 shadow-2xl p-4 sm:p-5 flex flex-col items-center max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setPreviewStoryImage(null)}
              className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-muted/40 hover:bg-muted/70 text-foreground flex items-center justify-center transition-colors z-30 cursor-pointer shadow-sm"
              aria-label="Kapat"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-sm text-foreground mb-1">Story Kartınız Hazır!</h3>
            <p className="text-[11px] text-muted-foreground text-center mb-3">
              Görseli indirebilir veya doğrudan Instagram ve diğer uygulamalarda paylaşabilirsiniz.
            </p>

            {/* Görsel Kart Önizlemesi */}
            <div 
              onClick={handleOpenImageInNewTab}
              className="relative w-full aspect-[9/16] max-h-[48vh] rounded-2xl overflow-hidden border border-border/40 shadow-2xl bg-black/60 mb-3 cursor-pointer group"
              title="Tam boyutta görüntülemek için tıklayın"
            >
              <img
                src={previewStoryImage.dataUrl || previewStoryImage.url}
                alt="Story Kartı"
                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-white/90 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={11} />
                <span>Büyüt</span>
              </div>
            </div>

            {/* Mobil Kullanıcı İpucu */}
            <div className="w-full p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center mb-3">
              <p className="text-[11px] text-foreground/90 font-medium leading-relaxed">
                💡 <strong>İpucu:</strong> Görselin üzerine basılı tutup <em>&quot;Resmi İndir&quot;</em> veya <em>&quot;Galeriye Kaydet&quot;</em> seçeneğini kullanabilirsiniz.
              </p>
            </div>

            {/* Aksiyon Butonları */}
            <div className="w-full space-y-2">
              {/* 1. Doğrudan İndirme Butonu */}
              <button
                type="button"
                onClick={() => handleDirectDownload(previewStoryImage)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>Doğrudan Cihaza İndir</span>
              </button>

              {/* 2. Sistem Paylaşımı / Galeriye Aktar */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (
                        navigator.canShare &&
                        navigator.canShare({ files: [previewStoryImage.file] })
                      ) {
                        await navigator.share({
                          files: [previewStoryImage.file],
                          title: `${list.title} | Readixon`,
                          text: `"${list.title}" okuma listesi`,
                        });
                      } else {
                        await navigator.share({
                          title: list.title,
                          url: shareUrl,
                        });
                      }
                    } catch (e) {
                      // Kullanıcı iptal etti
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 size={15} />
                  <span>Sistemde Paylaş / Galeriye Aktar</span>
                </button>
              )}

              {/* 3. Panoya Kopyala (Instagram Hikayesine Yapıştırmak İçin) */}
              <button
                type="button"
                onClick={handleCopyStoryImageToClipboard}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 text-foreground font-semibold text-xs active:scale-95 transition-colors cursor-pointer"
              >
                {isImageCopied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                <span>{isImageCopied ? 'Görsel Panoya Kopyalandı!' : 'Görseli Kopyala (Instagram İçin)'}</span>
              </button>

              {/* 4. Yeni Sekmede Aç */}
              <button
                type="button"
                onClick={handleOpenImageInNewTab}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground text-[11px] transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Görseli Tam Boyutta Aç</span>
              </button>

              {/* Kapat */}
              <button
                type="button"
                onClick={() => setPreviewStoryImage(null)}
                className="w-full py-2 rounded-xl text-muted-foreground hover:text-foreground font-medium text-xs transition-colors cursor-pointer"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

