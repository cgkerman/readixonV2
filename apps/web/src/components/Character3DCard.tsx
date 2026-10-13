'use client';

import React, { useRef, useState, useCallback } from 'react';
import type { Character } from '@readixon/core';
import { Sparkles, Lock, Zap, Brain, Flame, Heart, Eye, ChevronRight, Share2 } from 'lucide-react';

export interface Character3DCardProps {
  character: Character;
  isUnlocked: boolean;
  isDiscovered?: boolean;
  spoilerThresholdChapter?: number;
  onSelect: () => void;
  onShare?: (character: Character) => void;
  isAuthorView?: boolean;
}

interface RoleConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

const getRoleBadgeConfig = (rawRole?: string): RoleConfig => {
  const normalized = (rawRole || '').trim().toLowerCase();
  if (['protagonist', 'baş kahraman', 'ana karakter', 'baskahraman'].includes(normalized)) {
    return {
      label: 'Baş Kahraman',
      color: 'text-black font-black',
      bg: 'bg-amber-400 dark:bg-amber-400 shadow-xs',
      border: 'border-transparent',
      glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
    };
  }
  if (['antagonist', 'düşman', 'kötü karakter'].includes(normalized)) {
    return {
      label: 'Antagonist',
      color: 'text-white font-black',
      bg: 'bg-rose-600 dark:bg-rose-600 shadow-xs',
      border: 'border-transparent',
      glow: 'from-rose-500/20 via-red-900/10 to-transparent',
    };
  }
  if (['deuteragonist', 'ikincil', 'ikincil kahraman'].includes(normalized)) {
    return {
      label: 'İkincil Kahraman',
      color: 'text-white font-black',
      bg: 'bg-indigo-600 dark:bg-indigo-600 shadow-xs',
      border: 'border-transparent',
      glow: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    };
  }
  if (['love interest', 'love_interest', 'aşk ilgisi', 'ask ilgisi', 'romance'].includes(normalized)) {
    return {
      label: 'Aşk İlgisi',
      color: 'text-white font-black',
      bg: 'bg-pink-600 dark:bg-pink-600 shadow-xs',
      border: 'border-transparent',
      glow: 'from-pink-500/20 via-rose-500/10 to-transparent',
    };
  }
  if (['mentor', 'usta', 'rehber'].includes(normalized)) {
    return {
      label: 'Usta / Mentor',
      color: 'text-white font-black',
      bg: 'bg-emerald-600 dark:bg-emerald-600 shadow-xs',
      border: 'border-transparent',
      glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    };
  }
  if (['supporting', 'side character', 'side', 'yan karakter', 'destekleyici'].includes(normalized)) {
    return {
      label: 'Yan Karakter',
      color: 'text-white font-black',
      bg: 'bg-sky-600 dark:bg-sky-600 shadow-xs',
      border: 'border-transparent',
      glow: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    };
  }
  return {
    label: rawRole || 'Karakter',
    color: 'text-white font-black',
    bg: 'bg-slate-700 dark:bg-slate-700 shadow-xs',
    border: 'border-transparent',
    glow: 'from-violet-500/20 via-purple-500/10 to-transparent',
  };
};

export const Character3DCard: React.FC<Character3DCardProps> = ({
  character,
  isUnlocked,
  isDiscovered = false,
  spoilerThresholdChapter,
  onSelect,
  onShare,
  isAuthorView = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt ve Glare hesaplaması
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Açı sınırları (-9 ile +9 derece)
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const roleConfig = getRoleBadgeConfig(character.role);

  // Karakter görseli önceliği: Şeffaf PNG > Tam Boy > Avatar Portre
  const characterImageUrl =
    character.pngGallery?.transparentPngUrl ||
    character.pngGallery?.fullBodyUrl ||
    character.avatarUrl ||
    character.pngGallery?.portraitUrl;

  const threshold = spoilerThresholdChapter || character.spoilerThresholdChapter;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={isUnlocked ? onSelect : undefined}
      style={{ perspective: '1100px' }}
      className={`relative select-none transition-all duration-300 ${
        isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'
      }`}
    >
      {/* 3D Hareketli Kart Gövdesi */}
      <div
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className={`relative h-[470px] rounded-3xl overflow-hidden border backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
          isUnlocked
            ? 'bg-card border-border/70 hover:border-primary/50 hover:shadow-primary/10'
            : 'bg-card/70 border-border/50 shadow-none'
        }`}
      >
        {/* 1. KATMAN: Arka Plan Atmosfer Glow & Grid */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${roleConfig.glow} pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-30'
          }`}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* Dinamik Işık Yansıması (Glare/Shine Efekti) */}
        <div
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 65%)`,
            transition: 'opacity 0.25s ease',
          }}
          className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay"
        />

        {/* 2. KATMAN: Üst Rozetler (Rol, Spoiler & Keşif) */}
        <div
          style={{ transform: 'translateZ(25px)' }}
          className="relative z-20 h-12 px-4 flex items-center justify-between gap-2 shrink-0"
        >
          {/* Karakter Rolü */}
          {isUnlocked ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm ${roleConfig.bg} ${roleConfig.color}`}
            >
              {roleConfig.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-muted text-foreground border border-border shadow-xs">
              <Lock size={11} /> Gizli Karakter
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {/* Keşfedildi / Kilitli / Yazar Rozeti */}
            {isDiscovered && isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs animate-in zoom-in-75 duration-300">
                <Sparkles size={11} className="animate-pulse" />
                <span>Keşfedildi! #{threshold}</span>
              </span>
            ) : !isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                <Lock size={11} />
                <span>Bölüm #{threshold}</span>
              </span>
            ) : isAuthorView && character.isSpoiler ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                <Eye size={11} /> Yazar Önizleme
              </span>
            ) : null}

            {/* Hızlı Sosyal Paylaşım Kartı Butonu */}
            {onShare && isUnlocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(character);
                }}
                className="p-1.5 rounded-xl bg-card hover:bg-muted/20 border border-border/70 hover:border-primary/50 text-foreground/70 hover:text-primary transition-all shadow-2xs active:scale-90 cursor-pointer"
                title="Karakter Tanıtım Kartı Üret"
              >
                <Share2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* 3. KATMAN: Karakter Portresi (Sabit 245px Alan - Asla Metinlerin Üzerine Taşmaz) */}
        <div
          style={{
            transform: isHovered ? 'translateZ(30px) scale(1.02)' : 'translateZ(10px) scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
          className="relative z-10 w-full h-[245px] shrink-0 flex items-center justify-center px-4 overflow-hidden"
        >
          {isUnlocked ? (
            characterImageUrl ? (
              <div className="relative flex items-center justify-center h-full max-h-[240px]">
                <img
                  src={characterImageUrl}
                  alt={character.name}
                  className="h-full max-h-[240px] w-auto max-w-full object-contain rounded-2xl shadow-[0_10px_24px_rgba(0,0,0,0.35)] select-none pointer-events-none"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-32 h-44 rounded-2xl bg-gradient-to-tr from-primary/10 via-purple-500/10 to-amber-500/10 border border-border/40 flex items-center justify-center text-4xl font-black text-primary/70 shadow-inner">
                {character.name.charAt(0)}
              </div>
            )
          ) : (
            /* Kilitli Karakter Vitrini (PRD Bölüm 38) */
            <div className="w-44 h-[230px] rounded-2xl bg-muted/20 border-2 border-dashed border-border/70 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden backdrop-blur-xs">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 relative group-hover:scale-110 transition-transform">
                <Lock size={24} className="animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md -z-10" />
              </div>
              <span className="text-xs font-black text-foreground block">
                Henüz Keşfedilmedi
              </span>
              <span className="text-[11px] text-muted-foreground block mt-1 max-w-[170px] leading-tight font-medium">
                {threshold
                  ? `Bu karakterin kimliği Bölüm ${threshold}'den sonra açılır.`
                  : 'Hikâyede ilerledikçe bu karakter keşfedilecek.'}
              </span>
            </div>
          )}
        </div>

        {/* 4. KATMAN: Karakter Alt Bilgi & Stat Barları (Görselden Tamamen İzole, %100 Okunaklı) */}
        <div
          style={{ transform: 'translateZ(25px)' }}
          className="relative z-20 px-4 py-3 flex flex-col justify-between shrink-0 bg-card/95 border-t border-border/40 min-h-[160px]"
        >
          {/* İsim ve Unvan */}
          <div className="mb-1">
            <h3 className="font-black text-base sm:text-lg text-foreground truncate leading-snug flex items-center justify-between">
              <span className="truncate">{isUnlocked ? character.name : 'Gizemli Karakter'}</span>
              {isUnlocked && (
                <ChevronRight
                  size={16}
                  className={`text-muted transition-transform duration-300 shrink-0 ml-1.5 ${
                    isHovered ? 'text-primary translate-x-1' : ''
                  }`}
                />
              )}
            </h3>
            {isUnlocked && (
              <p className="text-xs text-muted-foreground font-bold truncate mt-0.5">
                {character.occupation || character.role || 'Evren Karakteri'}
              </p>
            )}
          </div>

          {/* Mottosu / Alıntı (Varsa) */}
          <div className="min-h-[22px] flex items-center mb-1.5">
            {isUnlocked && character.coreMotivation ? (
              <p className="text-[11px] text-foreground/85 italic line-clamp-2 leading-relaxed">
                "{character.coreMotivation}"
              </p>
            ) : isUnlocked && character.personalityTraits && character.personalityTraits.length > 0 ? (
              <p className="text-[11px] text-muted-foreground truncate leading-tight font-medium">
                {character.personalityTraits.slice(0, 3).join(' • ')}
              </p>
            ) : null}
          </div>

          {/* Mini RPG Stat Barları */}
          {isUnlocked && character.rpgStats ? (
            <div className="pt-2 border-t border-border/50 grid grid-cols-4 gap-1.5 text-[10px] font-bold">
              <div
                className="flex items-center justify-center gap-1 bg-background hover:bg-muted/30 px-1.5 py-1 rounded-lg border border-border/70 text-foreground shadow-2xs transition-colors"
                title={`Zekâ: ${character.rpgStats.intelligence}/10`}
              >
                <Brain size={11} className="text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="tabular-nums font-black">{character.rpgStats.intelligence ?? '-'}</span>
              </div>
              <div
                className="flex items-center justify-center gap-1 bg-background hover:bg-muted/30 px-1.5 py-1 rounded-lg border border-border/70 text-foreground shadow-2xs transition-colors"
                title={`Güç: ${character.rpgStats.strength}/10`}
              >
                <Flame size={11} className="text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="tabular-nums font-black">{character.rpgStats.strength ?? '-'}</span>
              </div>
              <div
                className="flex items-center justify-center gap-1 bg-background hover:bg-muted/30 px-1.5 py-1 rounded-lg border border-border/70 text-foreground shadow-2xs transition-colors"
                title={`Çeviklik: ${character.rpgStats.agility}/10`}
              >
                <Zap size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="tabular-nums font-black">{character.rpgStats.agility ?? '-'}</span>
              </div>
              <div
                className="flex items-center justify-center gap-1 bg-background hover:bg-muted/30 px-1.5 py-1 rounded-lg border border-border/70 text-foreground shadow-2xs transition-colors"
                title={`Karizma: ${character.rpgStats.charisma}/10`}
              >
                <Heart size={11} className="text-pink-600 dark:text-pink-400 shrink-0" />
                <span className="tabular-nums font-black">{character.rpgStats.charisma ?? '-'}</span>
              </div>
            </div>
          ) : isUnlocked ? (
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>
                {character.gender || character.age
                  ? `${character.gender || ''} ${character.age ? `• ${character.age}` : ''}`
                  : 'Evren Karakteri'}
              </span>
              <span className="text-primary font-bold text-xs">Detayları Gör →</span>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/50 text-center">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                🔒 Okumaya devam ederek kilidi açın
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
