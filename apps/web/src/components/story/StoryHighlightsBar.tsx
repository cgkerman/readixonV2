'use client';

import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import type { StoryHighlight } from '@readixon/core';
import { StoryHighlightsModal } from './StoryHighlightsModal';

interface StoryHighlightsBarProps {
  highlights?: StoryHighlight[];
  storyTitle: string;
  authorName?: string;
  authorAvatar?: string;
  onReadStory?: () => void;
  className?: string;
}

export function StoryHighlightsBar({
  highlights,
  storyTitle,
  authorName,
  authorAvatar,
  onReadStory,
  className = ''
}: StoryHighlightsBarProps) {
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | null>(null);

  if (!highlights || highlights.length === 0) {
    return null;
  }

  // Sıralamaya göre diz
  const sortedHighlights = [...highlights].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`w-full ${className}`}>
      {/* Başlık Şeridi */}
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
        <Sparkles size={14} className="text-amber-500" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-text/80">
          Öne Çıkanlar & Tanıtımlar
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-1">
          {sortedHighlights.length}
        </span>
      </div>

      {/* Yatay Kaydırılabilir Daireler Listesi */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth">
        {sortedHighlights.map((highlight, idx) => (
          <button
            key={highlight.id || idx}
            type="button"
            onClick={() => setSelectedHighlightIndex(idx)}
            className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer active:scale-95 transition-transform"
          >
            {/* Dış Gradyan Çemberi (Instagram Story Ring) */}
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-primary via-fuchsia-500 to-amber-500 shadow-sm group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              
              {/* İç Görsel Konteyneri */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-zinc-900 border-2 border-background relative flex items-center justify-center">
                {highlight.coverUrl ? (
                  <img
                    src={highlight.coverUrl}
                    alt={highlight.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                    <Play size={18} className="text-white/60 translate-x-0.5" />
                  </div>
                )}

                {/* Minik Oynat & Süre Rozeti */}
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Play size={11} className="translate-x-0.5 fill-current" />
                  </div>
                </div>

                {/* Süre Etiketi */}
                {highlight.duration && (
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/75 rounded text-[9px] font-black text-amber-300 leading-none">
                    {Math.round(highlight.duration)}s
                  </span>
                )}
              </div>
            </div>

            {/* Daire Altı Başlık */}
            <span className="text-[11px] sm:text-xs font-medium text-text/90 group-hover:text-primary transition-colors text-center truncate max-w-[68px] sm:max-w-[80px] mt-1.5">
              {highlight.title || 'Teaser'}
            </span>
          </button>
        ))}
      </div>

      {/* 9:16 Video Story Modal */}
      {selectedHighlightIndex !== null && (
        <StoryHighlightsModal
          isOpen={selectedHighlightIndex !== null}
          onClose={() => setSelectedHighlightIndex(null)}
          highlights={sortedHighlights}
          initialIndex={selectedHighlightIndex}
          storyTitle={storyTitle}
          authorName={authorName}
          authorAvatar={authorAvatar}
          onReadStory={onReadStory}
        />
      )}
    </div>
  );
}
