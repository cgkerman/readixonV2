'use client';

import React, { useState, useRef } from 'react';
import { X, Copy, Check, Share2, Download, MessageCircle, Send, Sparkles, Loader2 } from 'lucide-react';
import { ReadingListCoverCollage } from './ReadingListCoverCollage';

const XTwitterIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import type { ReadingList, Story } from '@readixon/core';
import { toast } from 'sonner';

interface ShareReadingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ReadingList;
  stories: Story[];
}

export const ShareReadingListModal: React.FC<ShareReadingListModalProps> = ({
  isOpen,
  onClose,
  list,
  stories = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const storyCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/list/${list.id}` : '';
  const covers = stories.map(s => s.coverImage || (s as any).coverUrl).filter(Boolean) as string[];

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

  const shareText = encodeURIComponent(
    `"${list.title}" okuma listesini Readixon'da keşfet! 📚✨\n${shareUrl}`
  );

  /**
   * Instagram Story (9:16) formatında yüksek çözünürlüklü görsel oluşturup indirir
   */
  const handleDownloadStoryImage = async () => {
    setIsGeneratingStory(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context could not be created');

      // 1. Arka plan degrade (Sleek Dark Modern Aesthetic)
      const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGradient.addColorStop(0, '#0d0d12');
      bgGradient.addColorStop(0.3, '#141420');
      bgGradient.addColorStop(0.7, '#181226');
      bgGradient.addColorStop(1, '#08080c');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Ambient Işıma Efekti (Arka Plan Işıltısı)
      const glowGradient = ctx.createRadialGradient(540, 750, 100, 540, 750, 600);
      glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.28)');
      glowGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 200, 1080, 1200);

      // 3. Üst Logo & Başlık
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('R E A D I X O N', 540, 220);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '600 24px sans-serif';
      ctx.fillText('OKUMA LİSTESİ', 540, 265);

      // 4. Albüm Kapağı Alanı (Kare 600x600, Yuvarlatılmış Köşeler & Gölge)
      const coverSize = 600;
      const coverX = (1080 - coverSize) / 2;
      const coverY = 380;
      const radius = 40;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 25;

      // Yuvarlatılmış dikdörtgen kırpma maskesi
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
      ctx.fillStyle = '#1c1c24';
      ctx.fill();
      ctx.clip();

      // Kapak resimlerini yükle ve 2x2 veya tek resim olarak çiz
      const loadedImages: HTMLImageElement[] = [];
      const imagePromises = covers.slice(0, 4).map(
        url =>
          new Promise<HTMLImageElement>(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            img.src = url;
          })
      );

      const resolvedImages = await Promise.all(imagePromises);
      const validImages = resolvedImages.filter(img => img.width > 0);

      if (validImages.length >= 4) {
        // 2x2 Çiz
        const half = coverSize / 2;
        ctx.drawImage(validImages[0], coverX, coverY, half, half);
        ctx.drawImage(validImages[1], coverX + half, coverY, half, half);
        ctx.drawImage(validImages[2], coverX, coverY + half, half, half);
        ctx.drawImage(validImages[3], coverX + half, coverY + half, half, half);
      } else if (validImages.length > 0) {
        // İlk resmi tam çiz
        ctx.drawImage(validImages[0], coverX, coverY, coverSize, coverSize);
      } else {
        // Placeholder
        ctx.fillStyle = '#2d2d3a';
        ctx.fillRect(coverX, coverY, coverSize, coverSize);
      }
      ctx.restore();

      // 5. Liste Başlığı (Otomatik satır kaydırma ile)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      
      const words = list.title.split(' ');
      let line = '';
      let textY = 1100;
      const maxLineWidth = 850;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
          ctx.fillText(line.trim(), 540, textY);
          line = words[n] + ' ';
          textY += 70;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 540, textY);

      // 6. Küratör Bilgisi
      textY += 65;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 32px sans-serif';
      ctx.fillText(`Küratör: ${list.userName || 'Readixon Okuru'}`, 540, textY);

      // 7. İstatistik Hapı
      textY += 60;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      const pillWidth = 320;
      const pillHeight = 56;
      ctx.beginPath();
      ctx.roundRect(540 - pillWidth / 2, textY - 38, pillWidth, pillHeight, 28);
      ctx.fill();

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${list.storyIds?.length || 0} Hikaye • Readixon`, 540, textY);

      // 8. Alt Alan Çağrısı (Call to action)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('readixon.com\'da hemen oku', 540, 1720);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '400 24px sans-serif';
      ctx.fillText('Kitap, Webtoon ve Hikaye Platformu', 540, 1765);

      // 9. İndirme Tetikleme
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `readixon-liste-${list.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Instagram Story kartı başarıyla indirildi!');
    } catch (err) {
      console.error(err);
      toast.error('Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-6 sm:p-7">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
            <Share2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Listeyi Paylaş</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Spotify tarzı görsellikle takipçilerinle ve arkadaşlarınla paylaş.
            </p>
          </div>
        </div>

        {/* Spotify / Instagram Story Önizleme Kartı (Mini Canlı Önizleme) */}
        <div
          ref={storyCardRef}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/40 via-card to-background border border-indigo-500/20 p-5 mb-5 flex items-center gap-4 shadow-inner"
        >
          <ReadingListCoverCollage
            covers={covers}
            customCoverUrl={list.coverUrl}
            size="md"
            className="shrink-0 shadow-lg"
          />

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
              Readixon Çalma Listesi
            </span>
            <h3 className="font-bold text-base text-foreground truncate">{list.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {list.userName} • {list.storyIds?.length || 0} Hikaye
            </p>
          </div>
        </div>

        {/* 1. Aksiyon: Instagram Story Kartı İndir (Spotify Estetiği) */}
        <button
          onClick={handleDownloadStoryImage}
          disabled={isGeneratingStory}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all mb-4 disabled:opacity-50"
        >
          {isGeneratingStory ? (
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Görsel Hazırlanıyor...</span>
            </div>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Instagram Story Kartı İndir (9:16)</span>
            </>
          )}
        </button>

        {/* 2. Aksiyon: Bağlantıyı Kopyala */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-background border border-border/40 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-1.5 bg-transparent text-xs text-foreground/80 focus:outline-none truncate select-all font-mono"
          />
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

        {/* 3. Aksiyon: Hızlı Sosyal Medya Paylaşımı */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border/15">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors"
          >
            <XTwitterIcon size={14} /> X (Twitter)
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(list.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
          >
            <Send size={15} /> Telegram
          </a>
        </div>
      </div>
    </div>
  );
};
