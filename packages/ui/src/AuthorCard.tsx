import React from 'react';
import { User, UserPlus } from 'lucide-react';
import { Typography } from './Typography';

export interface AuthorCardProps {
  name: string;
  username: string;
  avatarUrl?: string;
  followers: number;
  isFollowing?: boolean;
  onPress?: () => void;
  onFollowPress?: (e: React.MouseEvent) => void;
  className?: string;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  name,
  username,
  avatarUrl,
  followers,
  isFollowing = false,
  onPress,
  onFollowPress,
  className = '',
}) => {
  return (
    <div 
      onClick={onPress}
      className={`relative group flex flex-col items-center p-6 bg-card border border-border rounded-3xl hover:bg-text/5 transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
    >
      {/* Arka Plan Işıması */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Avatar (Yuvarlak) */}
      <div className="relative mb-4 z-10">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors shadow-xl group-hover:shadow-primary/20">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={40} />
            </div>
          )}
        </div>
      </div>
      
      {/* Yazar Bilgileri */}
      <div className="text-center z-10 w-full mb-4">
        <Typography variant="h3" className="text-lg font-bold text-text/90 group-hover:text-primary transition-colors truncate w-full px-2">
          {name}
        </Typography>
        <Typography variant="caption" className="text-muted/80 block mb-2">
          @{username}
        </Typography>
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-text/5 inline-flex px-3 py-1 rounded-full border border-border">
          <UserPlus size={12} className="text-primary" />
          <span className="text-text/80">
            {followers >= 1000 ? (followers / 1000).toFixed(1) + 'k' : followers} Takipçi
          </span>
        </div>
      </div>

      {/* Takip Et Butonu */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (onFollowPress) onFollowPress(e);
        }}
        className={`relative z-10 w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
          isFollowing 
            ? 'bg-transparent border border-border text-muted hover:bg-border/50 hover:text-text' 
            : 'bg-primary/20 hover:bg-primary text-primary hover:text-background border border-primary/30 hover:border-primary shadow-[0_0_15px_rgba(255,255,255,0)] hover:shadow-primary/40'
        }`}
      >
        <UserPlus size={16} /> {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
      </button>
    </div>
  );
};
