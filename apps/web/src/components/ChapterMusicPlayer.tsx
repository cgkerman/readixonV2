'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChapterAudioTrack, parseAudioTrack, getAudioPlatformLabel } from '@readixon/core';
import { Music, Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface ChapterMusicPlayerProps {
  audioTrack?: ChapterAudioTrack | null;
  textColor?: string;
  autoPlay?: boolean;
}

export function ChapterMusicPlayer({
  audioTrack,
  textColor = 'currentColor',
  autoPlay = true
}: ChapterMusicPlayerProps) {
  if (!audioTrack?.url) return null;

  const parsed = parseAudioTrack(audioTrack.url);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAutoplayed, setHasAutoplayed] = useState(false);
  const [hasUserPaused, setHasUserPaused] = useState(false);

  // Send command to YouTube iframe via postMessage
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    if (ytIframeRef.current?.contentWindow) {
      ytIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  }, []);

  // Play audio
  const startPlayback = useCallback(() => {
    if (parsed.platform === 'youtube') {
      sendYtCommand('playVideo');
      setIsPlaying(true);
    } else if (parsed.platform === 'direct' && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('[MusicPlayer] Direct audio play prevented by browser:', err);
        });
    } else if (parsed.platform === 'spotify') {
      setIsPlaying(true);
    }
  }, [parsed.platform, sendYtCommand]);

  // Pause audio
  const pausePlayback = useCallback(() => {
    if (parsed.platform === 'youtube') {
      sendYtCommand('pauseVideo');
      setIsPlaying(false);
    } else if (parsed.platform === 'direct' && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (parsed.platform === 'spotify') {
      setIsPlaying(false);
    }
  }, [parsed.platform, sendYtCommand]);

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      setHasUserPaused(true);
      pausePlayback();
    } else {
      setHasUserPaused(false);
      startPlayback();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (parsed.platform === 'youtube') {
      sendYtCommand(nextMuted ? 'mute' : 'unMute');
    } else if (parsed.platform === 'direct' && audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  // Autoplay attempt + user gesture listener fallback
  useEffect(() => {
    if (!autoPlay || hasAutoplayed || hasUserPaused) return;

    let cleanupListeners: (() => void) | null = null;

    const attemptAutoplay = () => {
      if (parsed.platform === 'direct' && audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasAutoplayed(true);
          })
          .catch(() => {
            // Browser autoplay policy blocked. Listen to first interaction (scroll, tap, click)
            setupGestureListener();
          });
      } else if (parsed.platform === 'youtube') {
        // YouTube iframe handles autoplay via src query `autoplay=1`
        // We also trigger playVideo after a slight delay
        setTimeout(() => {
          sendYtCommand('playVideo');
          setIsPlaying(true);
          setHasAutoplayed(true);
        }, 800);
      } else if (parsed.platform === 'spotify') {
        // Spotify widgets handle playback internally
        setHasAutoplayed(true);
      }
    };

    const handleFirstGesture = () => {
      if (hasUserPaused) return;
      startPlayback();
      setHasAutoplayed(true);
      if (cleanupListeners) cleanupListeners();
    };

    const setupGestureListener = () => {
      const events = ['click', 'touchstart', 'scroll', 'keydown'];
      events.forEach((ev) => window.addEventListener(ev, handleFirstGesture, { once: true, passive: true }));
      cleanupListeners = () => {
        events.forEach((ev) => window.removeEventListener(ev, handleFirstGesture));
      };
    };

    // First attempt
    attemptAutoplay();

    return () => {
      if (cleanupListeners) cleanupListeners();
    };
  }, [autoPlay, hasAutoplayed, hasUserPaused, parsed.platform, startPlayback, sendYtCommand]);

  const displayTitle = audioTrack.title?.trim() || 'Bölüm Fon Müziği';
  const platformLabel = getAudioPlatformLabel(parsed.platform);

  return (
    <div className="relative inline-flex items-center">
      {/* Direct Audio Element */}
      {parsed.platform === 'direct' && (
        <audio
          ref={audioRef}
          src={audioTrack.url}
          loop
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Hidden YouTube Iframe for Audio Playback */}
      {parsed.platform === 'youtube' && parsed.id && (
        <div className="sr-only pointer-events-none" aria-hidden="true">
          <iframe
            ref={ytIframeRef}
            src={`https://www.youtube.com/embed/${parsed.id}?enablejsapi=1&autoplay=1&loop=1&playlist=${parsed.id}&playsinline=1`}
            title="Chapter Background Audio"
            allow="autoplay; encrypted-media"
            className="w-1 h-1"
          />
        </div>
      )}

      {/* Main Top Bar Player Pill */}
      <div
        className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md transition-all shadow-sm max-w-[180px] sm:max-w-[260px] md:max-w-[320px]"
        style={{ color: textColor }}
      >
        {/* Animated Equalizer Waves / Music Icon */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary/20 transition-colors"
          title={isPlaying ? 'Müziği Duraklat' : 'Müziği Başlat'}
          aria-label={isPlaying ? 'Müziği Duraklat' : 'Müziği Başlat'}
        >
          {isPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5 px-0.5">
              <span className="w-[2.5px] bg-primary rounded-full animate-[soundWave_0.8s_ease-in-out_infinite] h-full" />
              <span className="w-[2.5px] bg-primary rounded-full animate-[soundWave_1.1s_ease-in-out_infinite_0.2s] h-2/3" />
              <span className="w-[2.5px] bg-primary rounded-full animate-[soundWave_0.9s_ease-in-out_infinite_0.4s] h-4/5" />
            </div>
          ) : (
            <Music size={14} className="text-primary opacity-80" />
          )}
        </button>

        {/* Title & Platform */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer overflow-hidden flex flex-col justify-center min-w-0 flex-1 select-none"
          title={`${displayTitle} (${platformLabel})`}
        >
          <span className="text-xs font-semibold truncate leading-tight">
            {displayTitle}
          </span>
          <span className="text-[10px] opacity-70 truncate leading-tight">
            {platformLabel}
          </span>
        </div>

        {/* Play/Pause Control (for YouTube & Direct) */}
        {parsed.platform !== 'spotify' && (
          <button
            type="button"
            onClick={togglePlay}
            className="flex-shrink-0 p-1 hover:opacity-100 opacity-80 transition-opacity rounded-full hover:bg-white/10"
            title={isPlaying ? 'Durdur' : 'Çal'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
          </button>
        )}

        {/* Mute/Unmute Control (for YouTube & Direct) */}
        {parsed.platform !== 'spotify' && (
          <button
            type="button"
            onClick={toggleMute}
            className="flex-shrink-0 p-1 hover:opacity-100 opacity-80 transition-opacity rounded-full hover:bg-white/10"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        )}

        {/* Expand / Details Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 p-0.5 hover:opacity-100 opacity-70 transition-opacity"
          title={isExpanded ? 'Detayları Gizle' : 'Müzik Detayları'}
        >
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Floating Mini Player Dropdown / Panel */}
      {isExpanded && (
        <div
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-card border border-border/40 shadow-2xl backdrop-blur-xl z-50 text-foreground animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ color: textColor }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Music size={14} />
              </div>
              <div>
                <p className="text-xs font-bold truncate max-w-[170px]">{displayTitle}</p>
                <p className="text-[10px] text-muted">{platformLabel}</p>
              </div>
            </div>

            <a
              href={audioTrack.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg hover:bg-background/80 text-muted hover:text-primary transition-colors text-xs flex items-center gap-1"
              title="Bağlantıyı Yeni Sekmede Aç"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Spotify Interactive Embed */}
          {parsed.platform === 'spotify' && parsed.embedUrl && (
            <div className="rounded-xl overflow-hidden shadow-inner my-2">
              <iframe
                src={parsed.embedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full"
              />
            </div>
          )}

          {/* YouTube Video Mini Preview */}
          {parsed.platform === 'youtube' && parsed.id && (
            <div className="my-2 rounded-xl overflow-hidden aspect-video bg-black/80 border border-border/30">
              <iframe
                src={`https://www.youtube.com/embed/${parsed.id}?autoplay=0&playsinline=1`}
                title="YouTube Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Direct Audio Controls */}
          {parsed.platform === 'direct' && (
            <div className="my-2 flex items-center justify-between bg-background/50 p-2 rounded-xl border border-border/20">
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                {isPlaying ? 'Durdur' : 'Oynat'}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background text-xs text-muted hover:text-foreground transition-colors border border-border/30"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {isMuted ? 'Sessiz' : 'Ses Açık'}
              </button>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between text-[11px] text-muted">
            <span>Bölüm Fon Müziği</span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-primary hover:underline font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
