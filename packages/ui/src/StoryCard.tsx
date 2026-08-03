"use client";

import React from 'react';
import { Eye, Heart, User } from 'lucide-react';
import { Typography } from './Typography';

export interface StoryCardProps {
  title: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  coverImage?: string;
  views: number;
  likes: number;
  tags?: string[];
  progress?: number;
  onPress?: () => void;
  onLikePress?: (e: React.MouseEvent) => void;
  isLiked?: boolean;
  className?: string;
  badgeText?: string;
  isWebtoon?: boolean;
  status?: 'ongoing' | 'completed' | 'draft';
  chapterCount?: number;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  title,
  authorName,
  authorUsername,
  authorAvatarUrl,
  coverImage,
  views,
  likes,
  progress,
  onPress,
  onLikePress,
  isLiked = false,
  className = '',
  badgeText,
  isWebtoon = false,
  status,
  chapterCount,
}) => {
  if (isWebtoon) {
    return (
      <div 
        onClick={onPress}
        className={`group flex flex-col h-full cursor-pointer relative overflow-hidden rounded-xl shadow-md border border-border/20 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className} aspect-[2/3]`}
      >
        <img 
          src={coverImage || ''} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] uppercase font-black px-2 py-0.5 rounded shadow">
            {status === 'completed' ? 'Tamamlandı' : status === 'ongoing' ? 'Devam Ediyor' : 'Webtoon'}
          </div>
          {chapterCount !== undefined && chapterCount >= 0 && (
            <div className="bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2 py-0.5 rounded shadow w-max">
              {chapterCount} Bölüm
            </div>
          )}
          {badgeText && <div className="bg-background/90 backdrop-blur-sm text-text text-[10px] font-bold px-2 py-0.5 rounded shadow">{badgeText}</div>}
        </div>

        {/* Stats overlay top right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
            <div className="bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
              <Eye size={10} className="text-white" />
              <Typography variant="caption" className="text-white font-bold text-[10px]">{views >= 1000 ? (views / 1000).toFixed(1) + 'k' : views}</Typography>
            </div>
            <button 
              onClick={(e) => {
                if (onLikePress) {
                  e.stopPropagation();
                  onLikePress(e);
                }
              }}
              className="bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 hover:bg-primary/80 transition-colors shadow-sm"
            >
              <Heart size={10} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'} />
              <Typography variant="caption" className="text-white font-bold text-[10px]">{likes}</Typography>
            </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex flex-col justify-end">
          <Typography variant="h4" className="text-white font-black leading-tight line-clamp-2 drop-shadow-lg mb-1.5 group-hover:text-primary transition-colors">
            {title}
          </Typography>
          <div className="flex items-center gap-1.5 opacity-90">
             <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30 bg-muted flex items-center justify-center shrink-0">
               {authorAvatarUrl ? <img src={authorAvatarUrl} className="w-full h-full object-cover"/> : <User size={12} className="text-white"/>}
             </div>
             <Typography variant="caption" className="text-white/80 font-medium text-[11px] line-clamp-1 drop-shadow">
               {authorUsername ? `@${authorUsername}` : authorName}
             </Typography>
          </div>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onPress}
      className={`group flex flex-col h-full cursor-pointer ${className}`}
    >
      {/* Kapak Resmi Alanı */}
      <div className={`relative w-full ${isWebtoon ? 'aspect-[9/16] shadow-md border-primary/20' : 'aspect-[2/3] shadow-sm'} rounded-xl bg-muted/20 overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/40`}>
        
        {/* Badge (Opsiyonel) */}
        {badgeText && (
          <div className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 animate-in zoom-in duration-300">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
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
            <Typography variant="h2" className="text-white/30 text-center px-4 font-black tracking-widest uppercase transform -rotate-12">
              {title ? title.substring(0, 2) : '??'}
            </Typography>
          </div>
        )}

        {/* İstatistikler Overlay (Her zaman görünür) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-end">
          <div className="flex items-center gap-1.5 text-white/95">
            <Eye size={14} className="drop-shadow-md" />
            <Typography variant="caption" className="text-white font-semibold drop-shadow-md">
              {views >= 1000 ? (views / 1000).toFixed(1) + 'k' : views}
            </Typography>
          </div>
          <button 
            onClick={(e) => {
              if (onLikePress) {
                e.stopPropagation();
                onLikePress(e);
              }
            }}
            className="flex items-center gap-1.5 text-white/95 hover:scale-110 transition-transform cursor-pointer p-1 -m-1"
          >
            <Heart size={14} className={`drop-shadow-md ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <Typography variant="caption" className="text-white font-semibold drop-shadow-md">
              {likes}
            </Typography>
          </button>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Book Information */}
      <div className="pt-3 flex flex-col flex-1 justify-between">
        <Typography variant="h4" className="font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-2 tracking-tight mb-1">
          {title}
        </Typography>
        
        <div className="flex items-center gap-2 mt-auto">
          {authorAvatarUrl && authorAvatarUrl.trim() !== '' ? (
            <img 
              src={authorAvatarUrl} 
              alt={authorName} 
              className="w-5 h-5 rounded-full object-cover border border-border/50 bg-muted"
            />
          ) : (
            <div className="w-5 h-5 min-w-[20px] rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center border border-border/50 shadow-sm">
              <User size={12} color="white" strokeWidth={2.5} />
            </div>
          )}
          <Typography variant="caption" className="text-muted-foreground font-medium line-clamp-1">
            {authorUsername ? `@${authorUsername}` : authorName}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
