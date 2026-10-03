'use client';

import React from 'react';
import { BookOpen, ListMusic } from 'lucide-react';

interface ReadingListCoverCollageProps {
  covers?: string[];
  customCoverUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-16 h-16 min-w-[4rem] min-h-[4rem] rounded-xl',
  md: 'w-24 h-24 min-w-[6rem] min-h-[6rem] rounded-2xl',
  lg: 'w-44 h-44 sm:w-56 sm:h-56 min-w-[11rem] min-h-[11rem] rounded-2xl sm:rounded-3xl',
  xl: 'w-56 h-56 sm:w-72 sm:h-72 min-w-[14rem] min-h-[14rem] rounded-3xl',
};

export const ReadingListCoverCollage: React.FC<ReadingListCoverCollageProps> = ({
  covers = [],
  customCoverUrl,
  className = '',
  size = 'md',
}) => {
  const validCovers = (covers || []).filter(c => typeof c === 'string' && c.trim().length > 0);

  // 1. Özel kapak resmi varsa onu göster
  if (customCoverUrl) {
    return (
      <div
        className={`relative overflow-hidden shadow-2xl bg-card border border-border/20 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={customCoverUrl}
          alt="Liste Kapağı"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    );
  }

  // 2. En az 4 kapak varsa: Spotify 2x2 Mozaik Kolaj
  if (validCovers.length >= 4) {
    return (
      <div
        className={`relative overflow-hidden shadow-2xl bg-card border border-border/20 grid grid-cols-2 grid-rows-2 ${sizeClasses[size]} ${className}`}
      >
        {validCovers.slice(0, 4).map((cover, idx) => (
          <div key={idx} className="relative w-full h-full overflow-hidden bg-muted/20">
            <img
              src={cover}
              alt={`Cover ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  // 3. 1, 2 veya 3 kapak varsa
  if (validCovers.length > 0) {
    if (validCovers.length === 1) {
      return (
        <div
          className={`relative overflow-hidden shadow-2xl bg-card border border-border/20 ${sizeClasses[size]} ${className}`}
        >
          <img
            src={validCovers[0]}
            alt="Liste Kapağı"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (validCovers.length === 2) {
      return (
        <div
          className={`relative overflow-hidden shadow-2xl bg-card border border-border/20 grid grid-cols-2 ${sizeClasses[size]} ${className}`}
        >
          {validCovers.slice(0, 2).map((cover, idx) => (
            <div key={idx} className="relative w-full h-full overflow-hidden bg-muted/20">
              <img
                src={cover}
                alt={`Cover ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    }

    // 3 kapak: 1 sol büyük, 2 sağ dikey
    return (
      <div
        className={`relative overflow-hidden shadow-2xl bg-card border border-border/20 grid grid-cols-2 ${sizeClasses[size]} ${className}`}
      >
        <div className="relative w-full h-full overflow-hidden bg-muted/20">
          <img src={validCovers[0]} alt="Cover 1" className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-rows-2 w-full h-full overflow-hidden">
          <div className="relative w-full h-full overflow-hidden bg-muted/20">
            <img src={validCovers[1]} alt="Cover 2" className="w-full h-full object-cover" />
          </div>
          <div className="relative w-full h-full overflow-hidden bg-muted/20">
            <img src={validCovers[2]} alt="Cover 3" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }

  // 4. Hiç kapak yoksa: Readixon'ın şık varsayılan albüm kapağını göster
  return (
    <div
      className={`relative overflow-hidden shadow-2xl bg-card border border-border/20 ${sizeClasses[size]} ${className}`}
    >
      <img
        src="/images/default-reading-list.jpg"
        alt="Okuma Listesi Kapağı"
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
};
