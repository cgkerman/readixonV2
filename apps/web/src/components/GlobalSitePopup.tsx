"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { getActiveSitePopup, type SitePopup } from '@readixon/core';
import { X, ArrowRight, Sparkles } from 'lucide-react';

const STORAGE_PREFIX = 'readixon_popup_seen_';

export default function GlobalSitePopup() {
  const router = useRouter();
  const [popup, setPopup] = useState<SitePopup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkPopup = async () => {
      try {
        const activePopup = await getActiveSitePopup();
        if (!activePopup) return;

        // Check if user has already seen this specific popup
        const hasSeen = localStorage.getItem(`${STORAGE_PREFIX}${activePopup.id}`);
        if (hasSeen === 'true') {
          return;
        }

        // Show popup after a soft 1.2s delay for a premium, non-blocking feel
        timeoutId = setTimeout(() => {
          setPopup(activePopup);
          setIsOpen(true);
        }, 1200);
      } catch (error) {
        console.error("GlobalSitePopup check error:", error);
      }
    };

    checkPopup();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleClose = () => {
    if (popup) {
      // By default or if checked, mark this specific popup as seen
      if (dontShowAgain) {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, 'true');
        } catch (e) {
          console.warn("localStorage write error:", e);
        }
      }
    }
    setIsOpen(false);
  };

  const handleActionClick = () => {
    if (!popup) return;

    // Mark as seen
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, 'true');
    } catch (e) {
      console.warn("localStorage write error:", e);
    }
    setIsOpen(false);

    if (popup.buttonLink) {
      if (popup.buttonLink.startsWith('http://') || popup.buttonLink.startsWith('https://')) {
        window.open(popup.buttonLink, '_blank', 'noopener,noreferrer');
      } else {
        router.push(popup.buttonLink);
      }
    }
  };

  if (!isOpen || !popup) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300 select-none"
      onClick={(e) => {
        // Close if backdrop clicked
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-card border border-primary/30 rounded-[2.2rem] overflow-hidden max-w-lg w-full shadow-2xl shadow-black/80 relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close (X) Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>

        {/* Popup Image (WebP Optimized) */}
        {popup.imageUrl && (
          <div className="relative w-full max-h-72 sm:max-h-80 overflow-hidden bg-muted/20">
            <img 
              src={popup.imageUrl} 
              alt={popup.title} 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30 pointer-events-none" />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 sm:p-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles size={12} className="animate-pulse" /> Readixon Duyuru
          </div>

          <Typography variant="h2" className="text-2xl sm:text-3xl font-black text-text mb-3 leading-tight">
            {popup.title}
          </Typography>

          {popup.description && (
            <Typography variant="body" className="text-muted leading-relaxed text-sm sm:text-base mb-6 whitespace-pre-line">
              {popup.description}
            </Typography>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {popup.buttonText && (
              <Button 
                variant="primary" 
                className="flex-1 justify-center shadow-lg shadow-primary/25 text-base py-3.5 font-bold"
                onPress={handleActionClick}
              >
                <span>{popup.buttonText}</span>
                <ArrowRight size={18} className="ml-2" />
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-muted hover:text-text border-border/60 hover:bg-card/80 py-3.5"
              onPress={handleClose}
            >
              Kapat
            </Button>
          </div>

          {/* "Bir daha gösterme" Checkbox */}
          <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
            <label className="flex items-center gap-2 cursor-pointer hover:text-text transition-colors">
              <input 
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
              />
              <span>Bu duyuruyu bir daha gösterme</span>
            </label>

            <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
              Readixon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
