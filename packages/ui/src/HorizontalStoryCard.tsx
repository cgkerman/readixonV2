"use client";

import React from 'react';
import { Eye, Heart, User, ChevronRight } from 'lucide-react';
import { Typography } from './Typography';

export interface HorizontalStoryCardProps {
  title: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  coverImage?: string;
  views: number;
  likes: number;
  latestChapterTitle?: string;
  latestChapterExcerpt?: string;
  badgeText?: string;
  onPress?: () => void;
  className?: string;
}

export const HorizontalStoryCard: React.FC<HorizontalStoryCardProps> = ({
  title,
  authorName,
  authorUsername,
  authorAvatarUrl,
  coverImage,
  views,
  likes,
  latestChapterTitle,
  latestChapterExcerpt,
  badgeText,
  onPress,
  className = '',
}) => {
  return (
    <div 
      onClick={onPress}
      className={`group flex bg-card border border-border/40 hover:border-border/80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 h-48 ${className}`}
    >
      {/* Sol: Kapak Resmi (Fixed Width) */}
      <div className="relative w-28 md:w-32 shrink-0 bg-muted/20 overflow-hidden">
        {badgeText && (
          <div className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg">
            {badgeText}
          </div>
        )}
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
            <Typography variant="h3" className="text-white/30 text-center px-2 font-black tracking-widest uppercase transform -rotate-12">
              {title ? title.substring(0, 2) : '??'}
            </Typography>
          </div>
        )}
      </div>

      {/* Sağ: İçerik */}
      <div className="flex flex-col flex-1 p-3 md:p-4 min-w-0">
        
        {/* Kitap & Yazar Bilgisi */}
        <div className="flex items-start justify-between mb-2 shrink-0">
          <div className="flex flex-col min-w-0">
            <Typography variant="h4" className="font-bold text-text truncate pr-2">
              {title}
            </Typography>
            <div className="flex items-center gap-1.5 mt-0.5">
              {authorAvatarUrl ? (
                <img src={authorAvatarUrl} alt={authorName} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <User size={14} className="text-muted" />
              )}
              <Typography variant="caption" className="text-muted truncate">
                {authorName}
              </Typography>
            </div>
          </div>
        </div>

        {/* Yeni Bölüm Kesiti (Excerpt) */}
        <div className="flex-1 min-h-0 bg-background/50 rounded-xl p-2 md:p-3 border border-border/30 overflow-hidden flex flex-col justify-center">
          <Typography variant="caption" className="text-primary font-bold mb-1 flex items-center gap-1 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {latestChapterTitle || 'Yeni Bölüm'}
          </Typography>
          <Typography variant="caption" className="text-muted/80 italic line-clamp-2 md:line-clamp-3 leading-snug">
            "{latestChapterExcerpt || 'Bu bölümün içeriğini okumak için hemen tıkla...'}"
          </Typography>
        </div>

        {/* Alt: İstatistikler & Buton */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30 shrink-0">
          <div className="flex items-center gap-3 text-muted">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <Typography variant="caption" className="font-medium text-xs">{views > 999 ? `${(views/1000).toFixed(1)}k` : views}</Typography>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} />
              <Typography variant="caption" className="font-medium text-xs">{likes > 999 ? `${(likes/1000).toFixed(1)}k` : likes}</Typography>
            </div>
          </div>
          
          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
            <ChevronRight size={18} />
          </div>
        </div>

      </div>
    </div>
  );
};
