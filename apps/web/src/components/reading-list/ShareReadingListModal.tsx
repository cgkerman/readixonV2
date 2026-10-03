'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
  BookOpen,
} from 'lucide-react';
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
      // Hata durumunda (CORS vb.) null dön ki canvas patlamasın
      resolve(null);
    };
    img.src = src;
  });
};

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

  const shareText = encodeURIComponent(
    `"${list.title}" okuma listesini Readixon'da keşfet! 📚✨\n${shareUrl}`
  );

  /**
   * Instagram Story (9:16 - 1080x1920) formatında yüksek çözünürlüklü görsel oluşturup indirir
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
        loadImage('/brand-logo.png'),
        loadImage('/cekirix.png'),
        loadImage(coverToLoad),
        ...displayStories.map((s) => loadImage(s.coverImage || (s as any).coverUrl || '')),
      ]);

      // 3. Üst Logo Kapsülü (Readixon Branding)
      const capsuleWidth = 320;
      const capsuleHeight = 64;
      const capsuleX = (1080 - capsuleWidth) / 2;
      const capsuleY = 95;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(capsuleX, capsuleY, capsuleWidth, capsuleHeight, 32);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Logo Görseli (Eğer yüklendiyse çiz)
      if (logoImg) {
        ctx.drawImage(logoImg, capsuleX + 18, capsuleY + 12, 40, 40);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('READIXON', capsuleX + (logoImg ? 72 : 36), capsuleY + 41);

      ctx.restore();

      // "OKUMA LİSTESİ" Alt Rozeti
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ö Z E L   O K U M A   L İ S T E S İ', 540, 195);

      // 4. Liste Kapağı (Kare 420x420, Yuvarlatılmış Köşeler & Derin Gölge)
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
        ctx.drawImage(mainCoverImg, coverX, coverY, coverSize, coverSize);
      } else {
        // Fallback Kapak Gradients
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

      // Kutu Başlığı
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

          // 1. Sıra Numarası Çemberi (#1, #2...)
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

          // 2. Kitap Kapağı Görseli (Küçük Thumbnail)
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
            ctx.drawImage(sCoverImg, thumbX, thumbY, thumbW, thumbH);
          } else {
            // Placeholder degrade
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

          // 3. Kitap Başlığı (Kapağın sağına yerleşir)
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

          // 5. Sağ Taraf Rozeti (Format / Bölüm Sayısı)
          ctx.fillStyle = '#818cf8';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'right';
          const infoText =
            story.format === 'webtoon' ? '🎨 Webtoon' : `${story.stats?.chapterCount || 0} Bölüm`;
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

        // 5'ten fazla kitap varsa not
        if (stories.length > 5) {
          ctx.fillStyle = 'rgba(165, 180, 252, 0.9)';
          ctx.font = 'italic 19px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`+ ${stories.length - 5} diğer kitap daha bu listede...`, 540, boxY + boxHeight - 22);
        }
      }
      ctx.restore();

      // 7. Alt Alan (Maskot Çekirix & Platform Çağrısı)
      const footerY = 1600;

      // Sol Taraf: Metinler & Çağrı
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('readixon.com\'da hemen oku', 110, footerY + 95);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '400 20px sans-serif';
      ctx.fillText('Kitap, Webtoon & Çevrimiçi Edebiyat', 110, footerY + 135);

      // Konuşma Baloncuğu / Rozet
      ctx.save();
      const badgeW = 230;
      const badgeH = 46;
      ctx.beginPath();
      ctx.roundRect(110, footerY + 18, badgeW, badgeH, 23);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ İyi Okumalar!', 110 + badgeW / 2, footerY + 47);
      ctx.restore();

      // Sağ Taraf: Sevimli Çekirix Maskotumuz
      if (mascotImg) {
        ctx.save();
        const mascotW = 250;
        const mascotH = 250;
        const mascotX = 750;
        const mascotY = 1585;

        // Maskot arkasına hafif tatlı ışıma
        const mascotGlow = ctx.createRadialGradient(
          mascotX + 125,
          mascotY + 125,
          20,
          mascotX + 125,
          mascotY + 125,
          150
        );
        mascotGlow.addColorStop(0, 'rgba(132, 204, 22, 0.25)'); // Çekirix yeşili ışıltı
        mascotGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mascotGlow;
        ctx.fillRect(mascotX - 40, mascotY - 40, mascotW + 80, mascotH + 80);

        ctx.drawImage(mascotImg, mascotX, mascotY, mascotW, mascotH);
        ctx.restore();
      }

      // 8. İndirme Tetikleme
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
          aria-label="Kapat"
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

        {/* Canlı Önizleme Kartı (Modal İçi Görsel Kart) */}
        <div
          ref={storyCardRef}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/40 via-card to-background border border-indigo-500/25 p-4 sm:p-5 mb-5 shadow-inner"
        >
          {/* Sağ Üst Çekirix Maskot Rozeti */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 border border-primary/30 backdrop-blur-sm shadow-sm">
            <img src="/cekirix.png" alt="Çekirix" className="w-5 h-5 object-contain" />
            <span className="text-[10px] font-bold text-primary">Readixon</span>
          </div>

          <div className="flex items-center gap-4">
            <ReadingListCoverCollage
              covers={covers}
              customCoverUrl={list.coverUrl}
              size="md"
              className="shrink-0 shadow-lg"
            />

            <div className="min-w-0 flex-1 pr-14">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                Readixon Çalma Listesi
              </span>
              <h3 className="font-bold text-base text-foreground truncate">{list.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {list.userName || 'Readixon Okuru'} • {list.storyIds?.length || stories.length} Hikaye
              </p>
            </div>
          </div>

          {/* Listelenen Kitaplar (Kitap Kapak Görselleri Dahil) */}
          {stories.length > 0 ? (
            <div className="mt-4 pt-3.5 border-t border-border/25 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 flex items-center justify-between">
                <span>Listede Yer Alan Kitaplar</span>
                <span className="text-[10px] text-primary/75">{stories.length} Kitap</span>
              </div>
              {stories.slice(0, 4).map((story, idx) => {
                const cover = story.coverImage || (story as any).coverUrl;
                return (
                  <div
                    key={story.storyId}
                    className="flex items-center justify-between gap-3 text-xs py-1.5 px-2 rounded-xl hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Sıra No */}
                      <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Kitap Kapağı Görseli */}
                      <div className="relative w-7 h-10 rounded-md overflow-hidden bg-muted/40 shrink-0 border border-border/40 shadow-sm">
                        {cover ? (
                          <img
                            src={cover}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-950/40 text-indigo-400">
                            <BookOpen size={12} />
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
                      {story.format === 'webtoon' ? '🎨 Webtoon' : `${story.stats?.chapterCount || 0} Bölüm`}
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
            <div className="mt-3 pt-3 border-t border-border/20 text-center text-xs text-muted-foreground">
              Henüz bu listeye kitap eklenmemiş.
            </div>
          )}
        </div>

        {/* 1. Aksiyon: Instagram Story Kartı İndir (Spotify Estetiği + Logo + Çekirix Maskot) */}
        <button
          onClick={handleDownloadStoryImage}
          disabled={isGeneratingStory}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all mb-4 disabled:opacity-50"
        >
          {isGeneratingStory ? (
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Görsel Kart Hazırlanıyor...</span>
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

        {/* 3. Aksiyon: Hızlı Sosyal Medya Paylaşımı (WhatsApp, Twitter, Telegram) */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border/15">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `"${list.title}" okuma listesini keşfet! 📚✨\n${shareUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `"${list.title}" okuma listesini Readixon'da keşfet! 📚✨`
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors"
          >
            <XTwitterIcon size={14} /> X (Twitter)
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
              `"${list.title}" okuma listesini Readixon'da keşfet! 📚✨`
            )}`}
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
