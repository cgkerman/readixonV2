"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, Flag, ShieldBan, Repeat, Bookmark, BadgeCheck, ArrowRight, BookOpen } from 'lucide-react';
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
  bookmarksCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isVerified?: boolean;
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
  linkedStory?: {
    storyId: string;
    title: string;
    coverUrl?: string;
    authorName?: string;
  };
  hasReposted?: boolean;
  currentUserId?: string;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onRepostPress?: () => void;
  onBookmarkPress?: () => void;
  onPinPress?: () => void;
  onAuthorPress?: () => void;
  onPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onReportPress?: () => void;
  onBlockPress?: () => void;
  onPollVote?: (optionId: string) => void;
  readOnlyStats?: boolean;
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
  bookmarksCount = 0,
  isLiked = false,
  isBookmarked = false,
  isVerified = false,
  isOwner = false,
  isPinned = false,
  repostOfAuthorName,
  poll,
  hasVotedInPoll = false,
  linkedStory,
  hasReposted = false,
  currentUserId,
  onLikePress,
  onCommentPress,
  onSharePress,
  onRepostPress,
  onBookmarkPress,
  onPinPress,
  onAuthorPress,
  onPress,
  onEditPress,
  onDeletePress,
  onReportPress,
  onBlockPress,
  onPollVote,
  readOnlyStats = false,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
              <div className="flex items-center gap-1">
                <Typography variant="body" className="font-bold text-text/90 group-hover:text-primary transition-colors">
                  {authorName}
                </Typography>
                {isVerified && <BadgeCheck size={16} className="text-blue-500 fill-blue-50" />}
              </div>
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

      <div className="mb-4 text-text/80 whitespace-pre-wrap text-[15px] leading-relaxed break-words">
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

      {/* Medya (Varsa) - Instagram Style Carousel */}
      {mediaUrls.length > 0 && (
        <div className="mb-4 relative rounded-2xl overflow-hidden border border-border bg-background/50 group">
          <div 
            ref={scrollContainerRef}
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.offsetWidth;
              setActiveMediaIndex(Math.round(scrollLeft / width));
            }}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mediaUrls.map((url, index) => (
              <div key={index} className="w-full flex-shrink-0 snap-center relative aspect-square sm:aspect-[4/3] bg-black/5">
                <img src={url} alt={`Readix Media ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {mediaUrls.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                    idx === activeMediaIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows (Desktop overlay) */}
          {mediaUrls.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.offsetWidth, behavior: 'smooth' });
                  }
                }}
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity ${activeMediaIndex === 0 ? 'hidden' : ''}`}
              >
                <span className="text-sm font-bold leading-none -ml-0.5">‹</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.offsetWidth, behavior: 'smooth' });
                  }
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity ${activeMediaIndex === mediaUrls.length - 1 ? 'hidden' : ''}`}
              >
                <span className="text-sm font-bold leading-none -mr-0.5">›</span>
              </button>
            </>
          )}
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

      {/* Eklenen Kitap (Varsa) */}
      {linkedStory && (
        <a 
          href={`/story/${linkedStory.storyId}`}
          onClick={(e) => e.stopPropagation()}
          className="mb-4 block relative group"
        >
          {/* Ambient Glow from the cover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" />
          
          <div className="flex items-stretch gap-4 p-4 sm:p-5 bg-card/80 backdrop-blur-xl border border-border/60 group-hover:border-primary/30 transition-all duration-500 rounded-3xl relative overflow-hidden shadow-sm group-hover:shadow-md">
            
            {/* Book Cover (3D Physical Look) */}
            <div className="w-24 sm:w-28 flex-shrink-0 relative rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.3)] transition-shadow duration-500 aspect-[2/3]">
              {/* Kitap Sırtı Gölgesi (Spine Shadow) */}
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent w-6 z-10 pointer-events-none" />
              <img 
                src={linkedStory.coverUrl || ''} 
                alt={linkedStory.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              {/* Parlama Efekti */}
              <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none z-10" />
            </div>
            
            {/* Details */}
            <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="bg-primary/10 text-primary p-1 rounded-md">
                    <BookOpen size={12} strokeWidth={2.5} />
                  </div>
                  <Typography variant="caption" className="text-primary font-bold tracking-widest text-[10px] uppercase">
                    Önerilen Kitap
                  </Typography>
                </div>
                <Typography variant="h3" className="font-extrabold text-text text-lg sm:text-xl truncate leading-tight group-hover:text-primary transition-colors">
                  {linkedStory.title}
                </Typography>
                <Typography variant="body" className="text-muted truncate mt-1 text-sm font-medium">
                  {linkedStory.authorName || 'Bilinmiyor'}
                </Typography>
              </div>
              
              {/* Tags & Action */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-border/50 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Romantik</span>
                  <span className="px-2.5 py-1 rounded-full bg-border/50 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Gençlik</span>
                </div>
                
                <div className="flex items-center gap-2 bg-text text-background font-bold px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:scale-105 shadow-sm">
                  <span className="text-xs">İncele</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      )}

      {/* Alt Kısım: Etkileşim Butonları */}
      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-border/50 text-muted">
        {readOnlyStats ? (
          <>
            <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${isLiked ? 'text-pink-500' : ''}`}>
              <Heart size={18} strokeWidth={isLiked ? 2 : 1.5} className={isLiked ? 'fill-current' : ''} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              <MessageCircle size={18} strokeWidth={1.5} />
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </div>
            <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${hasReposted ? 'text-green-500' : ''}`}>
              <Repeat size={18} strokeWidth={hasReposted ? 2 : 1.5} className={hasReposted ? 'fill-current' : ''} />
              {repostsCount > 0 && <span>{repostsCount}</span>}
            </div>
            <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${isBookmarked ? 'text-primary' : ''}`}>
              <Bookmark size={18} strokeWidth={isBookmarked ? 2 : 1.5} className={isBookmarked ? 'fill-current' : ''} />
              {bookmarksCount > 0 && <span>{bookmarksCount}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold ml-auto">
              <Share2 size={18} strokeWidth={1.5} />
            </div>
          </>
        ) : (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLikePress?.();
              }}
              className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
                isLiked ? 'text-pink-500' : 'hover:text-pink-500'
              }`}
            >
              <Heart size={18} strokeWidth={isLiked ? 2 : 1.5} className={isLiked ? 'fill-current' : ''} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCommentPress?.();
              }}
              className="flex items-center gap-1.5 text-[13px] font-semibold hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={18} strokeWidth={1.5} />
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRepostPress?.();
              }}
              className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
                hasReposted ? 'text-green-500' : 'hover:text-green-500'
              }`}
            >
              <Repeat size={18} strokeWidth={hasReposted ? 2 : 1.5} className={hasReposted ? 'fill-current' : ''} />
              {repostsCount > 0 && <span>{repostsCount}</span>}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkPress?.();
              }}
              className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
                isBookmarked ? 'text-primary' : 'hover:text-primary'
              }`}
            >
              <Bookmark size={18} strokeWidth={isBookmarked ? 2 : 1.5} className={isBookmarked ? 'fill-current' : ''} />
              {bookmarksCount > 0 && <span>{bookmarksCount}</span>}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSharePress?.();
              }}
              className="flex items-center gap-1.5 text-[13px] font-semibold hover:text-blue-500 transition-colors ml-auto"
            >
              <Share2 size={18} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
