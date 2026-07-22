"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, Flag, ShieldBan, Repeat } from 'lucide-react';
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
  repostsCount?: number;
  isLiked?: boolean;
  isOwner?: boolean;
  isPinned?: boolean;
  repostOfAuthorName?: string;
  poll?: {
    question: string;
    options: { id: string; text: string; votes: number }[];
    expiresAt: any;
    voterIds: string[];
  };
  hasVotedInPoll?: boolean;
  hasReposted?: boolean;
  currentUserId?: string;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onRepostPress?: () => void;
  onPinPress?: () => void;
  onAuthorPress?: () => void;
  onPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onReportPress?: () => void;
  onBlockPress?: () => void;
  onPollVote?: (optionId: string) => void;
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
  repostsCount = 0,
  isLiked = false,
  isOwner = false,
  isPinned = false,
  repostOfAuthorName,
  poll,
  hasVotedInPoll = false,
  hasReposted = false,
  currentUserId,
  onLikePress,
  onCommentPress,
  onSharePress,
  onRepostPress,
  onPinPress,
  onAuthorPress,
  onPress,
  onEditPress,
  onDeletePress,
  onReportPress,
  onBlockPress,
  onPollVote,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div 
      className={`p-5 bg-card border border-border rounded-3xl hover:bg-text/5 transition-all duration-300 ${onPress ? 'cursor-pointer' : ''} ${className}`}
      onClick={onPress}
    >
      {isPinned && (
        <div className="flex items-center gap-2 text-primary font-bold text-xs mb-3 ml-2">
          <span className="text-sm">📌</span> Sabitlenmiş Gönderi
        </div>
      )}
      {repostOfAuthorName && (
        <div className="flex items-center gap-2 text-muted font-bold text-xs mb-3 ml-2">
          <Repeat size={14} /> {repostOfAuthorName} alıntıladı
        </div>
      )}
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

        <div className="relative" ref={menuRef}>
          <button 
            className="text-muted hover:text-text transition-colors p-2 rounded-full hover:bg-text/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              {isOwner ? (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onPinPress?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text/90 hover:bg-muted/10 transition-colors"
                  >
                    <span className="text-base leading-none">📌</span>
                    <span>{isPinned ? 'Sabitlemeyi Kaldır' : 'Profile Sabitle'}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEditPress?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text/90 hover:bg-muted/10 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Düzenle</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDeletePress?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Sil</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onReportPress?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text/90 hover:bg-muted/10 transition-colors"
                  >
                    <Flag size={16} />
                    <span>Şikayet Et</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onBlockPress?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <ShieldBan size={16} />
                    <span>Engelle</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 text-text/80 whitespace-pre-wrap text-[15px] leading-relaxed">
        {content.split(/(#[\p{L}\d_]+|@[\p{L}\d_]+|\*\*.*?\*\*|\*.*?\*)/gu).map((part, index) => {
          if (part.startsWith('#')) {
            return (
              <a 
                key={index} 
                href={`/readix?hashtag=${part.slice(1)}`}
                className="text-black font-bold hover:underline"
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
                className="text-black font-bold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          } else if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return <strong key={index} className="font-bold text-black">{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </div>

      {/* Medya (Varsa) - Carousel */}
      {mediaUrls.length > 0 && (
        <div className="mb-4 flex overflow-x-auto gap-2 snap-x pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {mediaUrls.map((url, index) => (
            <div key={index} className={`flex-shrink-0 ${mediaUrls.length === 1 ? 'w-full' : 'w-[85%]'} rounded-2xl overflow-hidden border border-border bg-background/50 snap-center aspect-square sm:aspect-[4/3] relative`}>
              <img src={url} alt="Readix Media" className="w-full h-full object-cover" />
              {mediaUrls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1} / {mediaUrls.length}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Anket (Varsa) */}
      {poll && (
        <div className="mb-4 border border-border rounded-xl p-4 bg-background/30">
          <Typography variant="body" className="font-bold mb-3">{poll.question}</Typography>
          <div className="flex flex-col gap-2">
            {poll.options.map((opt) => {
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
              const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isExpired = new Date(poll.expiresAt?.seconds ? poll.expiresAt.seconds * 1000 : poll.expiresAt) < new Date();
              const hasVoted = hasVotedInPoll || poll.voterIds?.includes(currentUserId || '');
              return (
                <button 
                  key={opt.id}
                  disabled={hasVoted || isExpired}
                  onClick={(e) => { e.stopPropagation(); onPollVote?.(opt.id); }}
                  className={`relative overflow-hidden border rounded-lg p-3 text-left transition-all ${
                    hasVoted || isExpired ? 'border-border/50 cursor-default' : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {(hasVoted || isExpired) && (
                    <div className="absolute top-0 left-0 bottom-0 bg-primary/20 transition-all" style={{ width: `${percentage}%` }} />
                  )}
                  <div className="relative flex justify-between items-center z-10">
                    <span className="font-medium text-text">{opt.text}</span>
                    {(hasVoted || isExpired) && <span className="text-xs text-muted">{percentage}%</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted flex justify-between">
            <span>{poll.options.reduce((sum, o) => sum + o.votes, 0)} oy</span>
            <span>{new Date(poll.expiresAt?.seconds ? poll.expiresAt.seconds * 1000 : poll.expiresAt) < new Date() ? 'Sona erdi' : 'Devam ediyor'}</span>
          </div>
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
            onRepostPress?.();
          }}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            hasReposted ? 'text-green-500' : 'text-muted hover:text-green-500'
          }`}
        >
          <Repeat size={20} className={hasReposted ? 'fill-current' : ''} />
          <span>{repostsCount > 0 ? repostsCount : 'Alıntıla'}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSharePress?.();
          }}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-blue-400 transition-colors ml-auto"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};
