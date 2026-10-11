'use client';

import React, { useState } from 'react';
import type { InlineUniverseEntity, UniversePlotThread } from '@readixon/core';
import type { ReaderUniverseTabType } from './ReaderUniverseDrawer';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  MapPin, 
  BookA, 
  Sword, 
  Skull, 
  ExternalLink,
  Lightbulb,
  Globe
} from 'lucide-react';

export interface ChapterUniverseRecapProps {
  universeTitle?: string;
  entities: InlineUniverseEntity[];
  plotThreads?: UniversePlotThread[];
  currentChapterOrder: number;
  onSelectEntity: (entity: InlineUniverseEntity, rect: DOMRect) => void;
  onOpenDrawer: (tab: ReaderUniverseTabType, search?: string) => void;
}

export function ChapterUniverseRecap({
  universeTitle,
  entities,
  plotThreads = [],
  currentChapterOrder,
  onSelectEntity,
  onOpenDrawer,
}: ChapterUniverseRecapProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Varlıkları tiplerine göre ayır
  const characters = entities.filter((e) => e.type === 'character');
  const locations = entities.filter((e) => e.type === 'location');
  const glossaryTerms = entities.filter((e) => e.type === 'glossary');
  const items = entities.filter((e) => e.type === 'item');
  const creatures = entities.filter((e) => e.type === 'creature');

  // Bu bölümde geçen ipuçları veya açılan düğümler
  const chapterClues: Array<{ threadTitle: string; note: string; threadId: string }> = [];
  for (const t of plotThreads) {
    if (t.clues && t.clues.length > 0) {
      for (const clue of t.clues) {
        if (clue.chapterOrder === currentChapterOrder) {
          chapterClues.push({
            threadTitle: t.title,
            note: clue.note,
            threadId: t.id,
          });
        }
      }
    }
  }

  const totalElements = entities.length + chapterClues.length;
  if (totalElements === 0) return null;

  return (
    <div className="my-8 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/60 hover:border-primary/40 transition-all shadow-md overflow-hidden no-zen-toggle">
      {/* Başlık / Açılır-Kapanır Başlık Çubuğu */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Bu Bölümün Evren Unsurları
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {totalElements} Unsur
              </span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">
              {universeTitle ? `${universeTitle} • ` : ''}Bu bölümde geçen karakterler, mekânlar ve keşifler
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-muted">
          <span className="text-xs font-semibold hidden sm:inline">
            {isExpanded ? 'Daralt' : 'İncele'}
          </span>
          <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Genişletilmiş Alan */}
      {isExpanded && (
        <div className="p-4 sm:p-6 pt-0 border-t border-border/40 space-y-6 animate-in fade-in duration-200">
          {/* 1. Karakterler */}
          {characters.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Users size={14} /> Karakterler ({characters.length})
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDrawer('characters')}
                  className="text-[11px] text-muted hover:text-primary transition-colors"
                >
                  Tümünü Gör
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectEntity(c, rect);
                    }}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-card border border-border/60 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all text-xs active:scale-95 shadow-sm"
                  >
                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {c.name.slice(0, 1)}
                      </div>
                    )}
                    <span className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                      {c.name}
                    </span>
                    {c.roleOrType && (
                      <span className="text-[10px] text-muted opacity-80">
                        • {c.roleOrType}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Mekânlar */}
          {locations.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <MapPin size={14} /> Mekânlar ({locations.length})
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDrawer('locations')}
                  className="text-[11px] text-muted hover:text-primary transition-colors"
                >
                  Tümünü Gör
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectEntity(loc, rect);
                    }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-card border border-border/60 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all text-xs active:scale-95 shadow-sm"
                  >
                    <MapPin size={13} className="text-emerald-400 shrink-0" />
                    <span className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                      {loc.name}
                    </span>
                    {loc.roleOrType && (
                      <span className="text-[10px] text-muted">
                        • {loc.roleOrType}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Sözlük Terimleri */}
          {glossaryTerms.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <BookA size={14} /> Sözlük Terimleri ({glossaryTerms.length})
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDrawer('glossary')}
                  className="text-[11px] text-muted hover:text-primary transition-colors"
                >
                  Sözlüğü Aç
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {glossaryTerms.map((term) => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectEntity(term, rect);
                    }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-card border border-border/60 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all text-xs active:scale-95 shadow-sm"
                  >
                    <BookA size={13} className="text-amber-400 shrink-0" />
                    <span className="font-semibold text-foreground group-hover:text-amber-400 transition-colors">
                      {term.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Eşyalar & Yaratıklar */}
          {(items.length > 0 || creatures.length > 0) && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Sword size={14} /> Eşyalar & Varlıklar ({items.length + creatures.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectEntity(it, rect);
                    }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-card border border-border/60 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all text-xs active:scale-95 shadow-sm"
                  >
                    <Sword size={13} className="text-purple-400 shrink-0" />
                    <span className="font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                      {it.name}
                    </span>
                  </button>
                ))}
                {creatures.map((cr) => (
                  <button
                    key={cr.id}
                    type="button"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectEntity(cr, rect);
                    }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-card border border-border/60 hover:border-orange-400/50 hover:bg-orange-500/10 transition-all text-xs active:scale-95 shadow-sm"
                  >
                    <Skull size={13} className="text-orange-400 shrink-0" />
                    <span className="font-semibold text-foreground group-hover:text-orange-400 transition-colors">
                      {cr.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Bu Bölümde Bırakılan İpuçları & Kurgu Düğümleri */}
          {chapterClues.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Lightbulb size={15} />
                <span>Bu Bölüme Bırakılan Gizem İpuçları ({chapterClues.length})</span>
              </div>
              <div className="space-y-1.5">
                {chapterClues.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-card/60 border border-amber-500/20 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-amber-300 block">
                        {item.threadTitle}
                      </span>
                      <p className="text-foreground/80 text-[11px] mt-0.5">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenDrawer('plot_threads', item.threadTitle)}
                      className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold shrink-0 transition-colors"
                    >
                      Düğümü İncele
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alt: Evren Rehberini Aç Butonu */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenDrawer('characters')}
              className="py-2.5 px-4 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Globe size={14} />
              <span>Evren Rehberini Genişlet</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
