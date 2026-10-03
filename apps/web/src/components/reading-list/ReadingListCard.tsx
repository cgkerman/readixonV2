'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Heart, Lock, Globe, BookOpen } from 'lucide-react';
import type { ReadingList } from '@readixon/core';
import { ReadingListCoverCollage } from './ReadingListCoverCollage';

interface ReadingListCardProps {
  list: ReadingList;
  covers?: string[];
  isOwner?: boolean;
}

export const ReadingListCard: React.FC<ReadingListCardProps> = ({
  list,
  covers = [],
  isOwner = false,
}) => {
  return (
    <Link
      href={`/list/${list.id}`}
      className="group relative flex flex-col p-3.5 sm:p-4 rounded-2xl bg-card/60 hover:bg-card/95 border border-border/25 hover:border-border/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm overflow-hidden"
    >
      {/* Kapak Görseli Alanı + Spotify Tarzı Play Butonu */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3.5">
        <ReadingListCoverCollage
          covers={covers}
          customCoverUrl={list.coverUrl}
          className="w-full h-full rounded-xl"
        />

        {/* Hoverda Beliren Spotify Tarzı Yuvarlak Oynat/Oku Butonu */}
        <div className="absolute right-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-transform">
            <Play size={20} className="fill-current ml-0.5" />
          </div>
        </div>

        {/* Gizlilik Rozeti (Sadece sahip görüyorsa ve gizliyse) */}
        {!list.isPublic && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-bold flex items-center gap-1 border border-amber-500/20 shadow-sm">
            <Lock size={10} /> Gizli
          </div>
        )}
      </div>

      {/* Başlık & Açıklama */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
          {list.title}
        </h3>

        {list.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {list.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic mt-1">
            Açıklama belirtilmedi
          </p>
        )}
      </div>

      {/* Alt Bilgi: Küratör & İstatistikler */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/15 text-[11px] text-muted-foreground">
        <span className="font-medium truncate max-w-[130px]">
          {list.userName || 'Readixon Okuru'}
        </span>

        <div className="flex items-center gap-2.5 shrink-0 font-medium">
          <span className="flex items-center gap-1">
            <BookOpen size={12} className="opacity-70" />
            {list.storyIds?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} className="opacity-70 fill-current text-rose-500" />
            {list.likesCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
};
