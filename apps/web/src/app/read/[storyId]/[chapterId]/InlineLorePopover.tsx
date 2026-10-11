'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { InlineUniverseEntity } from '@readixon/core';
import type { ReaderUniverseTabType } from './ReaderUniverseDrawer';
import { 
  Users, 
  MapPin, 
  BookA, 
  Sword, 
  Skull, 
  Landmark, 
  Building2, 
  X, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

export interface InlineLorePopoverProps {
  entity: InlineUniverseEntity | null;
  anchorRect: DOMRect | null;
  currentChapterOrder: number;
  onClose: () => void;
  onOpenInUniverseDrawer: (tab: ReaderUniverseTabType, search: string) => void;
}

const ENTITY_CONFIG: Record<
  string, 
  { label: string; icon: React.ComponentType<any>; tab: ReaderUniverseTabType; color: string; bg: string; border: string }
> = {
  character: {
    label: 'Karakter',
    icon: Users,
    tab: 'characters',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
  },
  location: {
    label: 'Mekân',
    icon: MapPin,
    tab: 'locations',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  glossary: {
    label: 'Sözlük Terimi',
    icon: BookA,
    tab: 'glossary',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
  item: {
    label: 'Eşya / Artefakt',
    icon: Sword,
    tab: 'items',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
  },
  creature: {
    label: 'Yaratık',
    icon: Skull,
    tab: 'creatures',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
  },
  culture: {
    label: 'Kültür & Din',
    icon: Landmark,
    tab: 'cultures',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
  },
  organization: {
    label: 'Organizasyon',
    icon: Building2,
    tab: 'organizations',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
};

export function InlineLorePopover({
  entity,
  anchorRect,
  currentChapterOrder,
  onClose,
  onOpenInUniverseDrawer,
}: InlineLorePopoverProps) {
  const [forceUnlock, setForceUnlock] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);

  // Varlık değiştiğinde manuel kilidi sıfırla
  useEffect(() => {
    setForceUnlock(false);
  }, [entity?.id]);

  // Escape tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Dışarı tıklama ile kapatma
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Konum hesaplama
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) {
        setPositionStyle({});
        return;
      }

      if (!anchorRect) return;

      const popoverWidth = 340;
      const popoverHeight = 240;
      const gap = 10;

      // Yatay ortalama ve ekran sınır kontrolü
      let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
      if (left < 16) left = 16;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      // Dikey konum: altta yer varsa alta, yoksa üste
      let top = anchorRect.bottom + gap;
      if (top + popoverHeight > window.innerHeight - 16) {
        top = anchorRect.top - popoverHeight - gap;
        if (top < 16) top = 16;
      }

      setPositionStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        zIndex: 60,
      });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [anchorRect]);

  if (!entity) return null;

  const config = ENTITY_CONFIG[entity.type] || ENTITY_CONFIG.character;
  const IconComponent = config.icon;

  const isSpoiler = Boolean(
    entity.isSpoiler &&
    currentChapterOrder < (entity.spoilerChapterOrder || 9999)
  );

  const isLocked = isSpoiler && !forceUnlock;

  const handleOpenDrawer = () => {
    onClose();
    onOpenInUniverseDrawer(config.tab, entity.name);
  };

  return (
    <>
      {/* Mobilde arkada hafif karartma */}
      {isMobile && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <div
        ref={popoverRef}
        style={isMobile ? {} : positionStyle}
        className={
          isMobile
            ? 'fixed bottom-0 left-0 right-0 z-50 p-5 bg-card/95 backdrop-blur-2xl border-t border-border/80 shadow-2xl rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-in slide-in-from-bottom duration-200 no-zen-toggle'
            : 'bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-3xl p-5 animate-in zoom-in-95 duration-150 no-zen-toggle'
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobilde çekmece çizgisi */}
        {isMobile && (
          <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-3" />
        )}

        {/* Üst Bar: Kategori & Kapat */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${config.bg} ${config.color} ${config.border}`}
            >
              <IconComponent size={12} />
              <span>{config.label}</span>
            </span>
            {entity.roleOrType && (
              <span className="text-[11px] font-medium text-muted truncate max-w-[140px]">
                • {entity.roleOrType}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted/15 hover:bg-muted/30 text-muted hover:text-foreground flex items-center justify-center transition-colors"
            aria-label="Kapat"
          >
            <X size={14} />
          </button>
        </div>

        {/* Varlık Başlığı & Avatar */}
        <div className="flex items-start gap-3 mb-3">
          {entity.avatarUrl ? (
            <img
              src={entity.avatarUrl}
              alt={entity.name}
              className="w-12 h-12 rounded-2xl object-cover border border-border/50 shrink-0 shadow-sm"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${config.bg} ${config.color} ${config.border}`}
            >
              <IconComponent size={22} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-base font-extrabold text-foreground truncate leading-tight">
              {entity.name}
            </h4>
            {entity.roleOrType ? (
              <p className="text-xs text-primary font-semibold truncate mt-0.5">
                {entity.roleOrType}
              </p>
            ) : (
              <p className="text-xs text-muted truncate mt-0.5">
                Evren Öğesi
              </p>
            )}
          </div>
        </div>

        {/* İçerik / Tanım / Spoiler */}
        {isLocked ? (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 mb-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <ShieldAlert size={15} className="shrink-0" />
              <span>Spoiler Korumalı Bilgi</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Bu karakter veya bilginin detayları {entity.spoilerChapterOrder ? `Bölüm ${entity.spoilerChapterOrder}` : 'ilerleyen bölümlerde'} açığa çıkmaktadır.
            </p>
            <button
              type="button"
              onClick={() => setForceUnlock(true)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 pt-0.5 transition-colors"
            >
              <Unlock size={11} />
              <span>Yine de Oku (Spoiler'ı Aç)</span>
            </button>
          </div>
        ) : (
          <div className="mb-4">
            {entity.shortDescription ? (
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {entity.shortDescription}
              </p>
            ) : (
              <p className="text-xs text-muted italic">
                Bu evren öğesi için kısa tanım bulunmuyor. Detayları evren rehberinde keşfedebilirsiniz.
              </p>
            )}
          </div>
        )}

        {/* Alt Eylemler */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleOpenDrawer}
            className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Evren Rehberinde Aç</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </>
  );
}
