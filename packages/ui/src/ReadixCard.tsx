import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';

export interface ReadixCardProps {
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  mediaUrls?: string[];
  createdAtStr: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onAuthorPress?: () => void;
  onPress?: () => void;
  className?: string;
}

export const ReadixCard: React.FC<ReadixCardProps> = ({
  authorName,
  authorUsername,
  authorAvatarUrl,
  content,
  mediaUrls = [],
  createdAtStr,
  likesCount,
  commentsCount,
  isLiked = false,
  onLikePress,
  onCommentPress,
  onSharePress,
  onAuthorPress,
  onPress,
  className = '',
}) => {
  return (
    <div 
      className={`p-5 bg-card border border-border rounded-3xl hover:bg-text/5 transition-all duration-300 ${onPress ? 'cursor-pointer' : ''} ${className}`}
      onClick={onPress}
    >
      {/* Üst Kısım: Yazar Bilgisi */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={(e) => {
            if (onAuthorPress) {
              e.stopPropagation();
              onAuthorPress();
            }
          }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 border border-border group-hover:border-primary/50 transition-colors">
            {authorAvatarUrl ? (
              <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="body" className="font-bold text-text/90 group-hover:text-primary transition-colors">
                {authorName}
              </Typography>
              <Typography variant="caption" className="text-muted/60">
                • {createdAtStr}
              </Typography>
            </div>
            <Typography variant="caption" className="text-muted/80">
              @{authorUsername}
            </Typography>
          </div>
        </div>

        <button className="text-muted hover:text-text transition-colors p-2 rounded-full hover:bg-text/10">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Metin İçeriği */}
      <div className="mb-4 text-text/80 whitespace-pre-wrap text-[15px] leading-relaxed">
        {content.split(/(#[\p{L}\d_]+|@[\p{L}\d_]+)/gu).map((part, index) => {
          if (part.startsWith('#')) {
            return (
              <a 
                key={index} 
                href={`/readix?hashtag=${part.slice(1)}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          } else if (part.startsWith('@')) {
            return (
              <a 
                key={index} 
                href={`/profile/${part}`}
                className="text-blue-400 font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </div>

      {/* Medya (Varsa) */}
      {mediaUrls.length > 0 && (
        <div className={`mb-4 grid gap-2 ${mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {mediaUrls.map((url, index) => (
            <div key={index} className="rounded-2xl overflow-hidden border border-border bg-background/50 aspect-[4/3]">
              <img src={url} alt="Readix Media" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Alt Kısım: Etkileşim Butonları */}
      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-border">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLikePress?.();
          }}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isLiked ? 'text-pink-500' : 'text-muted hover:text-pink-500'
          }`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span>{likesCount > 0 ? likesCount : 'Beğen'}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCommentPress?.();
          }}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-blue-400 transition-colors"
        >
          <MessageCircle size={20} />
          <span>{commentsCount > 0 ? commentsCount : 'Yorum'}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSharePress?.();
          }}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-green-400 transition-colors ml-auto"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};
