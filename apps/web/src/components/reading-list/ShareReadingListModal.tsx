'use client';

import React, { useState, useRef } from 'react';
import { X, Copy, Check, Share2, Download, MessageCircle, Send, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { ReadingListCoverCollage } from './ReadingListCoverCollage';
import type { ReadingList, Story } from '@readixon/core';
import { toast } from 'sonner';

const XTwitterIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
      bgGradient.addColorStop(0, '#0a0a0f');
      bgGradient.addColorStop(0.25, '#12121d');
      bgGradient.addColorStop(0.65, '#171126');
      bgGradient.addColorStop(1, '#07070b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Ambient Işıma Efekti (Arka Plan Işıltısı)
      const glowGradient = ctx.createRadialGradient(540, 600, 50, 540, 600, 550);
      glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      glowGradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.12)');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 100, 1080, 1000);

      // 3. Üst Başlık & Logo
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('R E A D I X O N', 540, 160);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('OKUMA LİSTESİ', 540, 200);

      // 4. Albüm Kapağı Alanı (Kare 420x420, Yuvarlatılmış Köşeler & Gölge)
      const coverSize = 420;
      const coverX = (1080 - coverSize) / 2;
      const coverY = 240;
      const radius = 36;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;

      // Yuvarlatılmış dikdörtgen kırpma maskesi
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
      ctx.fillStyle = '#1c1c24';
      ctx.fill();
      ctx.clip();

      // Kapak görselini yükle (Varsayılan veya ilk kitap kapağı)
      let coverImg: HTMLImageElement | null = null;
      try {
        const coverToLoad = (list.coverUrl && list.coverUrl !== '/images/default-reading-list.jpg')
          ? list.coverUrl
          : (covers.length > 0 ? covers[0] : '/images/default-reading-list.jpg');

        coverImg = await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => {
            const fallback = new Image();
            fallback.onload = () => resolve(fallback);
            fallback.onerror = () => resolve(null);
            fallback.src = '/images/default-reading-list.jpg';
          };
          img.src = coverToLoad;
        });
      } catch (e) {
        console.error('Kapak resmi yüklenemedi:', e);
      }

      if (coverImg && coverImg.width > 0) {
        ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
      } else {
        ctx.fillStyle = '#232332';
        ctx.fillRect(coverX, coverY, coverSize, coverSize);
      }
      ctx.restore();

      // 5. Liste Başlığı
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 46px sans-serif';
      ctx.textAlign = 'center';
      
      const words = list.title.split(' ');
      let line = '';
      let textY = 720;
      const maxLineWidth = 880;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
          ctx.fillText(line.trim(), 540, textY);
          line = words[n] + ' ';
          textY += 56;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 540, textY);

      // 6. Küratör Bilgisi
      textY += 46;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 24px sans-serif';
      ctx.fillText(`Küratör: ${list.userName || 'Readixon Okuru'}`, 540, textY);

      // 7. LİSTEDE YER ALAN KİTAPLAR KUTUSU (Tracklist Box)
      const boxY = Math.max(textY + 45, 870);
      const boxX = 90;
      const boxWidth = 900;
      const boxHeight = 730;
      const boxRadius = 32;

      ctx.save();
      // Kutu Arka Planı (Glassmorphism)
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, boxRadius);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Kutu Başlığı
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('LİSTEDE YER ALAN KİTAPLAR', boxX + 45, boxY + 55);

      // İnce ayırıcı çizgi
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + 45, boxY + 80);
      ctx.lineTo(boxX + boxWidth - 45, boxY + 80);
      ctx.stroke();

      if (stories.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'italic 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bu okuma listesi henüz yeni oluşturuldu.', 540, boxY + 240);
      } else {
        // En fazla 5 kitap listele
        const displayStories = stories.slice(0, 5);
        let rowY = boxY + 145;

        displayStories.forEach((story, idx) => {
          // Sıra Numarası Çemberi (#1, #2...)
          ctx.beginPath();
          ctx.arc(boxX + 65, rowY - 8, 22, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#c7d2fe';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${idx + 1}`, boxX + 65, rowY);

          // Kitap Başlığı
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'left';
          
          let titleText = story.title;
          if (ctx.measureText(titleText).width > 480) {
            while (ctx.measureText(titleText + '...').width > 480 && titleText.length > 0) {
              titleText = titleText.slice(0, -1);
            }
            titleText += '...';
          }
          ctx.fillText(titleText, boxX + 105, rowY - 12);

          // Yazar Adı
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.font = '500 20px sans-serif';
          ctx.fillText(story.authorName || 'Bilinmeyen Yazar', boxX + 105, rowY + 18);

          // Sağ Taraf Rozeti (Format / Bölüm)
          ctx.fillStyle = '#818cf8';
          ctx.font = 'bold 19px sans-serif';
          ctx.textAlign = 'right';
          const infoText = story.format === 'webtoon' ? '🎨 Webtoon' : `${story.stats?.chapterCount || 0} Bölüm`;
          ctx.fillText(infoText, boxX + boxWidth - 50, rowY);

          // Satır arası ayırıcı çizgi (sonuncu hariç)
          if (idx < displayStories.length - 1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(boxX + 45, rowY + 42);
            ctx.lineTo(boxX + boxWidth - 45, rowY + 42);
            ctx.stroke();
          }

          rowY += 105;
        });

        // 5'ten fazla kitap varsa not düş
        if (stories.length > 5) {
          ctx.fillStyle = 'rgba(165, 180, 252, 0.85)';
          ctx.font = 'italic 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`+ ${stories.length - 5} diğer kitap daha bu listede...`, 540, boxY + boxHeight - 25);
        }
      }
      ctx.restore();

      // 8. Alt Alan Çağrısı (Call to action)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('readixon.com\'da hemen oku', 540, 1750);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '400 22px sans-serif';
      ctx.fillText('Kitap, Webtoon ve Çevrimiçi Edebiyat Platformu', 540, 1795);

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
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-5">
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
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/40 via-card to-background border border-indigo-500/20 p-4 sm:p-5 mb-5 shadow-inner"
        >
          <div className="flex items-center gap-4">
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
                {list.userName || 'Readixon Okuru'} • {list.storyIds?.length || 0} Hikaye
              </p>
            </div>
          </div>

          {/* Listelenen Kitaplar (Spotify Parça Listesi Gibi) */}
          {stories.length > 0 ? (
            <div className="mt-3.5 pt-3 border-t border-border/20 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Listede Yer Alan Kitaplar
              </div>
              {stories.slice(0, 4).map((story, idx) => (
                <div key={story.storyId} className="flex items-center justify-between gap-2 text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-foreground truncate">{story.title}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate shrink-0 max-w-[120px]">
                    {story.authorName || 'Yazar'}
                  </span>
                </div>
              ))}
              {stories.length > 4 && (
                <p className="text-[10px] text-primary/80 italic pt-1">
                  + {stories.length - 4} diğer kitap daha bu listede
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-border/20 text-center text-xs text-muted-foreground">
              Henüz bu listeye kitap eklenmemiş.
            </div>
          )}
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
