"use client";

import React from 'react';
import { Eye, Heart } from 'lucide-react';
import { Card } from './Card';
import { Typography } from './Typography';

export interface StoryCardProps {
  title: string;
  authorName: string;
  authorUsername?: string;
  coverImage?: string;
  views: number;
  likes: number;
  tags: string[];
  progress?: number;
  onPress?: () => void;
  onLikePress?: (e: React.MouseEvent) => void;
  isLiked?: boolean;
  className?: string;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  title,
  authorName,
  authorUsername,
  coverImage,
  views,
  likes,
  tags,
  progress,
  onPress,
  onLikePress,
  isLiked = false,
  className = '',
}) => {
  return (
    <Card 
      variant="interactive" 
      className={`group flex flex-col h-full overflow-hidden p-0 bg-card/40 border-border/40 hover:border-primary/50 transition-all duration-300 ${className}`}
      onPress={onPress}
    >
      {/* Kapak Resmi Alanı */}
      <div className="relative w-full aspect-[4/5] bg-muted/20 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-primary/20">
            <Typography variant="h2" className="text-text/30 text-center px-4 font-bold tracking-widest uppercase">
              {title ? title.substring(0, 2) : '??'}
            </Typography>
          </div>
        )}
        
        {/* İstatistikler Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 text-white/90">
            <Eye size={14} />
            <Typography variant="caption" className="text-white/90 font-medium">
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
            className="flex items-center gap-1.5 text-white/90 hover:scale-110 transition-transform cursor-pointer p-1 -m-1"
          >
            <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            <Typography variant="caption" className="text-white/90 font-medium">
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

      {/* İçerik Alanı */}
      <div className="p-4 pt-3 flex flex-col gap-1.5 flex-1">
        <Typography variant="h3" className="group-hover:text-primary transition-colors leading-snug">
          {title}
        </Typography>
        <Typography variant="caption" className="text-muted font-medium line-clamp-1">
          {authorUsername ? `@${authorUsername}` : authorName}
        </Typography>
        
        {/* Etiketler */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] uppercase font-bold tracking-wider">
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="px-1.5 py-0.5 rounded-md bg-muted/10 text-muted text-[9px] uppercase font-bold tracking-wider">
              +{tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StoryCard;
