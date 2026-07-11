"use client";

import React, { useRef, useState } from 'react';
import { X, Download, Share, Link2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Typography } from './Typography';
import { Button } from './Button';

export interface ShareReadixData {
  id: string;
  content: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  mediaUrls?: string[];
  createdAtStr: string;
}

export interface ReadixShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  readix: ShareReadixData | null;
  appUrl?: string;
}

export const ReadixShareModal: React.FC<ReadixShareModalProps> = ({
  isOpen,
  onClose,
  readix,
  appUrl = 'https://readixon.com'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !readix) return null;

  const readixUrl = `${appUrl}/readix?id=${readix.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(readixUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız', err);
    }
  };

  const generateImage = async () => {
    if (!cardRef.current) return null;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
      return dataUrl;
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `readix-${readix.id}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `readix-${readix.id}.png`, { type: blob.type });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Readixon\'da bir Readix',
          text: 'Bu muhteşem Readix\'e bir göz at!',
          url: readixUrl,
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Readixon\'da bir Readix',
          text: 'Bu muhteşem Readix\'e bir göz at!',
          url: readixUrl,
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Paylaşım hatası veya kullanıcı iptal etti', err);
    }
  };

  const cleanContent = readix.content.replace(/#[\wığüşöçİĞÜŞÖÇ]+/g, '').replace(/\s{2,}/g, ' ').trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-card border border-border/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-4 border-b border-border/30">
          <Typography variant="h3" className="font-bold">Paylaş</Typography>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-text hover:bg-muted/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 bg-muted/5 flex justify-center items-center overflow-hidden relative">
          <div 
            ref={cardRef}
            className="w-[300px] h-[533px] rounded-[2rem] p-6 flex flex-col relative overflow-hidden border border-white/10 shadow-xl bg-[#0a0a0a]"
          >
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex-1 flex flex-col relative z-10 shadow-inner">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/30 border-2 border-white/20 shrink-0">
                    {readix.authorAvatarUrl ? (
                      <img src={readix.authorAvatarUrl} alt={readix.authorName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {readix.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <Typography variant="body" className="font-bold text-white leading-tight">
                      {readix.authorName}
                    </Typography>
                    <Typography variant="caption" className="text-white/60">
                      @{readix.authorUsername}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="text-white/90 whitespace-pre-wrap text-[15px] leading-relaxed flex-1 overflow-hidden">
                <Typography variant="body" className="text-white">
                   {cleanContent.length > 280 ? cleanContent.substring(0, 280) + '...' : cleanContent}
                </Typography>
              </div>


            </div>
            
            <div className="mt-auto pt-6 text-center relative z-10">
              <Typography variant="caption" className="text-white font-medium tracking-wide">
                www.readixon.com
              </Typography>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-3 px-2 border-border/50 hover:bg-muted/10"
            onPress={copyToClipboard}
          >
            {isCopied ? <Check size={20} className="text-green-500" /> : <Link2 size={20} className="text-muted-foreground" />}
            <span className="text-xs">{isCopied ? 'Kopyalandı' : 'Bağlantı'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-3 px-2 border-border/50 hover:bg-muted/10"
            onPress={handleDownload}
            disabled={isGenerating}
          >
            <Download size={20} className="text-blue-500" />
            <span className="text-xs">Görsel İndir</span>
          </Button>

          <Button 
            variant="primary" 
            className="flex flex-col items-center gap-2 h-auto py-3 px-2 shadow-lg shadow-primary/20"
            onPress={handleShare}
            disabled={isGenerating}
          >
            <Share size={20} />
            <span className="text-xs font-semibold">{isGenerating ? 'Hazırlanıyor...' : 'Paylaş'}</span>
          </Button>
        </div>

      </div>
    </div>
  );
};
