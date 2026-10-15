'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Play, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import type { StoryHighlight } from '@readixon/core';

interface StoryHighlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: StoryHighlight[];
  initialIndex?: number;
  storyTitle: string;
  authorName?: string;
  authorAvatar?: string;
  onReadStory?: () => void;
}

export function StoryHighlightsModal({
  isOpen,
  onClose,
  highlights,
  initialIndex = 0,
  storyTitle,
  authorName,
  authorAvatar,
  onReadStory
}: StoryHighlightsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  // Sync index when opened with a specific highlight
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, highlights.length - 1)));
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialIndex, highlights.length]);

  const currentHighlight = highlights[currentIndex];

  // Go to next highlight or close if last
  const handleNext = useCallback(() => {
    if (currentIndex < highlights.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setIsVideoLoading(true);
    } else {
      onClose();
    }
  }, [currentIndex, highlights.length, onClose]);

  // Go to previous highlight or restart current
  const handlePrev = useCallback(() => {
    if (videoRef.current && videoRef.current.currentTime > 2) {
      videoRef.current.currentTime = 0;
      setProgress(0);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setIsVideoLoading(true);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Manage video play/pause with state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: if sound autoplay fails, mute and play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isPaused, currentIndex]);

  // Time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || currentHighlight?.duration || 10;
    const cur = videoRef.current.currentTime;
    const p = Math.min(100, (cur / dur) * 100);
    setProgress(p);

    // Strict cap at 20 seconds
    if (cur >= 20.2) {
      handleNext();
    }
  };

  // Hold to pause logic (mouse & touch)
  const handlePointerDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsPaused(true);
    }, 180);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsPaused(false);
      return;
    }

    // If it was just a quick tap/click, check which side of the screen
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.32) {
      handlePrev();
    } else if (clickX > width * 0.68) {
      handleNext();
    } else {
      // Center tap toggles pause
      setIsPaused(prev => !prev);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  if (!isOpen || !currentHighlight) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 sm:backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      
      {/* Desktop Geri / İleri Yan Butonları */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        aria-label="Önceki Story"
        className={`hidden md:flex items-center justify-center absolute left-6 lg:left-16 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all backdrop-blur-md cursor-pointer ${
          currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === highlights.length - 1}
        aria-label="Sonraki Story"
        className={`hidden md:flex items-center justify-center absolute right-6 lg:right-16 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all backdrop-blur-md cursor-pointer ${
          currentIndex === highlights.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronRight size={28} />
      </button>

      {/* Ana 9:16 Story Kartı */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
          isHoldingRef.current = false;
          setIsPaused(false);
        }}
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:w-[420px] aspect-[9/16] bg-zinc-950 sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between"
      >
        {/* Arka Plan Video */}
        <video
          ref={videoRef}
          key={currentHighlight.id}
          src={currentHighlight.videoUrl}
          poster={currentHighlight.coverUrl}
          playsInline
          autoPlay
          muted={isMuted}
          onLoadedData={() => setIsVideoLoading(false)}
          onWaiting={() => setIsVideoLoading(true)}
          onPlaying={() => setIsVideoLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleNext}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Karartma Gradyanları (Üst & Alt) */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Loading Spinner */}
        {isVideoLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}

        {/* Duraklatıldı Bildirimi / Simgesi */}
        {isPaused && !isHoldingRef.current && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
              <Play size={28} className="translate-x-0.5" />
            </div>
          </div>
        )}

        {/* ── ÜST BAR: İlerleme Çubukları & Başlık ── */}
        <div className="relative z-20 p-3 sm:p-4 pt-4 sm:pt-5 space-y-3 pointer-events-auto">
          
          {/* Segmentli İlerleme Çubukları */}
          <div className="flex items-center gap-1.5 w-full">
            {highlights.map((h, idx) => {
              let fillPercent = 0;
              if (idx < currentIndex) fillPercent = 100;
              else if (idx === currentIndex) fillPercent = progress;
              else fillPercent = 0;

              return (
                <div 
                  key={h.id || idx}
                  className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-xs"
                >
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Yazar & Kitap Bilgisi & Kontroller */}
          <div className="flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              {authorAvatar ? (
                <img 
                  src={authorAvatar} 
                  alt={authorName || 'Yazar'} 
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary shrink-0 shadow-md"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {authorName?.charAt(0) || 'R'}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[150px]">
                    {storyTitle}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-primary/30 border border-primary/40 rounded-full font-semibold text-primary-foreground text-amber-300">
                    Öne Çıkan
                  </span>
                </div>
                <div className="text-[11px] text-white/75 truncate">
                  {authorName ? `yazar: @${authorName}` : ''}
                </div>
              </div>
            </div>

            {/* Sağ Kontroller: Ses & Kapat */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Kapat (ESC)"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ── ALT BAR: Highlight Başlığı & Kitap Aksiyonu (CTA) ── */}
        <div 
          className="relative z-20 p-4 sm:p-5 pb-6 sm:pb-6 space-y-3 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Highlight Başlığı / Notu */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-amber-400" />
              <h3 className="font-extrabold text-sm text-white line-clamp-1">
                {currentHighlight.title || 'Tanıtım Teaser'}
              </h3>
            </div>
            <p className="text-[11px] text-white/70">
              Dokunarak duraklatabilir, sağa/sola dokunarak diğer tanıtımlara geçebilirsiniz.
            </p>
          </div>

          {/* Oku / Bölümleri Gör CTA */}
          {onReadStory && (
            <button
              onClick={() => {
                onClose();
                onReadStory();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary via-fuchsia-600 to-amber-500 hover:opacity-95 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <BookOpen size={16} />
              <span>Kitaba Başla / Bölümleri Oku</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
