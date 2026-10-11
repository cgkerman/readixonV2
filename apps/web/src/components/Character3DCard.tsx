'use client';

import React, { useRef, useState, useCallback } from 'react';
import type { Character, CharacterRole } from '@readixon/core';
import { Sparkles, Lock, ShieldCheck, Zap, Brain, Flame, Heart, Eye, ChevronRight, Share2 } from 'lucide-react';

export interface Character3DCardProps {
  character: Character;
  isUnlocked: boolean;
  isDiscovered?: boolean;
  spoilerThresholdChapter?: number;
  onSelect: () => void;
  onShare?: (character: Character) => void;
  isAuthorView?: boolean;
}

const ROLE_BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  Protagonist: {
    label: 'Baş Kahraman',
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  Antagonist: {
    label: 'Antagonist / Düşman',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    glow: 'from-rose-500/20 via-red-900/10 to-transparent',
  },
  Deuteragonist: {
    label: 'İkincil Kahraman',
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/40',
    glow: 'from-indigo-500/20 via-blue-500/10 to-transparent',
  },
  'Love Interest': {
    label: 'Aşk İlgisi',
    color: 'text-pink-300',
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/40',
    glow: 'from-pink-500/20 via-rose-500/10 to-transparent',
  },
  Mentor: {
    label: 'Usta / Mentor',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
  'Side Character': {
    label: 'Yan Karakter',
    color: 'text-sky-300',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/40',
    glow: 'from-sky-500/20 via-cyan-500/10 to-transparent',
  },
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

    // Açı sınırları (-12 ile +12 derece)
    const rotateX = ((y - centerY) / centerY) * -11;
    const rotateY = ((x - centerX) / centerX) * 11;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  }, []);

  const roleConfig = ROLE_BADGE_CONFIG[character.role] || {
    label: character.role || 'Karakter',
    color: 'text-violet-300',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/40',
    glow: 'from-violet-500/20 via-purple-500/10 to-transparent',
  };

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
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className={`relative h-[430px] rounded-3xl overflow-hidden border backdrop-blur-md shadow-lg transition-shadow duration-300 flex flex-col justify-between ${
          isUnlocked
            ? 'bg-gradient-to-b from-card/85 via-card/95 to-card border-border/60 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15'
            : 'bg-card/40 border-border/30 shadow-none'
        }`}
      >
        {/* 1. KATMAN: Arka Plan Atmosfer Glow & Grid */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${roleConfig.glow} pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-40'
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
          style={{ transform: 'translateZ(30px)' }}
          className="relative z-20 p-4 pb-0 flex items-center justify-between gap-2"
        >
          {/* Karakter Rolü */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-xs ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}
          >
            {roleConfig.label}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Keşfedildi / Kilitli / Yazar Rozeti */}
            {isDiscovered && isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-xs animate-in zoom-in-75 duration-300">
                <Sparkles size={11} className="animate-pulse" />
                <span>Keşfedildi! #{threshold}</span>
              </span>
            ) : !isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-xs">
                <Lock size={11} />
                <span>Bölüm #{threshold}</span>
              </span>
            ) : isAuthorView && character.isSpoiler ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Eye size={10} /> Yazar Önizleme
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
                className="p-1.5 rounded-xl bg-card/90 hover:bg-card border border-border/60 hover:border-primary/50 text-muted hover:text-primary transition-all shadow-xs active:scale-90"
                title="Karakter Tanıtım Kartı Üret"
              >
                <Share2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* 3. KATMAN: Şeffaf PNG / Karakter Portresi (Karttan Taşan 3D Katman) */}
        <div
          style={{
            transform: isHovered ? 'translateZ(45px) scale(1.05)' : 'translateZ(20px) scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
          className="relative z-10 flex-1 flex items-center justify-center p-2 overflow-visible"
        >
          {isUnlocked ? (
            characterImageUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={characterImageUrl}
                  alt={character.name}
                  className="max-h-[260px] w-auto max-w-full object-contain filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.65)] transition-transform duration-500 select-none pointer-events-none"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-primary/20 via-purple-500/15 to-amber-500/20 border border-primary/30 flex items-center justify-center text-4xl font-black text-primary/80 shadow-inner">
                {character.name.charAt(0)}
              </div>
            )
          ) : (
            /* Kilitli Karakter Silueti (PRD Bölüm 38) */
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-24 h-24 rounded-full bg-background/80 border-2 border-dashed border-border/60 flex items-center justify-center text-muted shadow-inner relative group-hover:scale-105 transition-transform">
                <Lock size={32} className="text-amber-500/80 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl -z-10" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Henüz Keşfedilmedi
                </span>
                <span className="text-[11px] text-muted block mt-0.5 max-w-[200px]">
                  {threshold
                    ? `Bu karakterin kimliği ve sırları Bölüm ${threshold}'den sonra açılır.`
                    : 'Hikâyede ilerledikçe bu karakter keşfedilecek.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. KATMAN: Karakter Alt Bilgi & Stat Barları */}
        <div
          style={{ transform: 'translateZ(35px)' }}
          className="relative z-20 p-4 pt-2 bg-gradient-to-t from-background/95 via-background/80 to-transparent"
        >
          {/* İsim ve Takma Ad */}
          <div className="mb-1.5">
            <h3 className="font-black text-base sm:text-lg text-foreground truncate leading-tight flex items-center justify-between">
              <span>{isUnlocked ? character.name : 'Gizemli Karakter'}</span>
              {isUnlocked && (
                <ChevronRight
                  size={16}
                  className={`text-muted transition-transform duration-300 ${
                    isHovered ? 'text-primary translate-x-1' : ''
                  }`}
                />
              )}
            </h3>
            {isUnlocked && character.occupation && (
              <p className="text-xs text-muted font-medium truncate mt-0.5">
                {character.occupation}
              </p>
            )}
          </div>

          {/* Mottosu / Alıntı (Varsa) */}
          {isUnlocked && character.coreMotivation && (
            <p className="text-[11px] text-muted/90 italic line-clamp-1 mb-2.5">
              "{character.coreMotivation}"
            </p>
          )}

          {/* Mini RPG Stat Barları (PRD Bölüm 9) */}
          {isUnlocked && character.rpgStats ? (
            <div className="pt-2 border-t border-border/40 grid grid-cols-4 gap-1.5 text-[9px] font-bold">
              <div className="flex items-center gap-1 bg-muted/15 px-1.5 py-0.5 rounded-md border border-border/40 text-muted" title={`Zekâ: ${character.rpgStats.intelligence}/10`}>
                <Brain size={10} className="text-sky-400 shrink-0" />
                <span>{character.rpgStats.intelligence || '-'}</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/15 px-1.5 py-0.5 rounded-md border border-border/40 text-muted" title={`Güç: ${character.rpgStats.strength}/10`}>
                <Flame size={10} className="text-rose-400 shrink-0" />
                <span>{character.rpgStats.strength || '-'}</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/15 px-1.5 py-0.5 rounded-md border border-border/40 text-muted" title={`Çeviklik: ${character.rpgStats.agility}/10`}>
                <Zap size={10} className="text-amber-400 shrink-0" />
                <span>{character.rpgStats.agility || '-'}</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/15 px-1.5 py-0.5 rounded-md border border-border/40 text-muted" title={`Karizma: ${character.rpgStats.charisma}/10`}>
                <Heart size={10} className="text-pink-400 shrink-0" />
                <span>{character.rpgStats.charisma || '-'}</span>
              </div>
            </div>
          ) : isUnlocked ? (
            <div className="pt-1.5 flex items-center justify-between text-[10px] text-muted">
              <span>{character.gender || character.age ? `${character.gender || ''} ${character.age ? `• ${character.age}` : ''}` : 'Evren Karakteri'}</span>
              <span className="text-primary font-bold">Detayları Gör →</span>
            </div>
          ) : (
            <div className="pt-1 text-center">
              <span className="text-[10px] text-amber-400/90 font-bold">
                🔒 Okumaya devam ederek kilidi açın
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
