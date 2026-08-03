'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from './Typography';
import { BookOpen, Edit3, MessageCircle, Flame, Activity } from 'lucide-react';

export interface LiveLiteratureCardProps {
  topStoryTitle?: string;
  topStoryAuthor?: string;
  className?: string;
}

export function LiveLiteratureCard({ topStoryTitle, topStoryAuthor, className = '' }: LiveLiteratureCardProps) {
  // Base numbers based roughly on time of day (fake baseline)
  const getBaseNumbers = () => {
    const hour = new Date().getHours();
    // Peak hours: 20-23
    const multiplier = (hour >= 19 && hour <= 23) ? 1.5 : (hour >= 2 && hour <= 7) ? 0.3 : 1.0;
    return {
      reading: Math.floor(150 * multiplier),
      writing: Math.floor(20 * multiplier),
      commenting: Math.floor(45 * multiplier),
      follows: Math.floor(12 * multiplier),
    };
  };

  const [stats, setStats] = useState(getBaseNumbers());

  useEffect(() => {
    // Pulse animation: fluctuate numbers slightly every 5-10 seconds
    const interval = setInterval(() => {
      setStats(prev => {
        // Random fluctuation between -3 and +5
        const fluctuate = (val: number, maxFuzz: number) => {
          const change = Math.floor(Math.random() * (maxFuzz * 2 + 1)) - maxFuzz;
          return Math.max(1, val + change); // Never go below 1
        };

        return {
          reading: fluctuate(prev.reading, 5),
          writing: fluctuate(prev.writing, 2),
          commenting: fluctuate(prev.commenting, 3),
          follows: fluctuate(prev.follows, 1),
        };
      });
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group ${className}`}>
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-primary/20"></div>
      
      <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
        <Typography variant="h3" className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
          Canlı Edebiyat
        </Typography>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <BookOpen size={16} className="text-green-500" />
            </div>
            <Typography variant="body" className="text-sm font-medium">okuyor</Typography>
          </div>
          <Typography variant="h4" className="font-bold font-mono text-green-500">{stats.reading}</Typography>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Edit3 size={16} className="text-purple-500" />
            </div>
            <Typography variant="body" className="text-sm font-medium">yazıyor</Typography>
          </div>
          <Typography variant="h4" className="font-bold font-mono text-purple-500">{stats.writing}</Typography>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageCircle size={16} className="text-blue-500" />
            </div>
            <Typography variant="body" className="text-sm font-medium">yorum yapıyor</Typography>
          </div>
          <Typography variant="h4" className="font-bold font-mono text-blue-500">{stats.commenting}</Typography>
        </div>

        {/* Real Data Integration */}
        <div className="mt-4 pt-4 border-t border-border/40 bg-background/30 rounded-xl p-3">
          <div className="flex items-start gap-3">
            <Flame size={18} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <Typography variant="caption" className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Şu An En Çok Okunan</Typography>
              <Typography variant="body" className="text-sm font-bold leading-tight">
                {topStoryTitle || 'Yükleniyor...'}
              </Typography>
              {topStoryAuthor && (
                <Typography variant="caption" className="text-xs text-muted mt-0.5">{topStoryAuthor}</Typography>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 text-xs text-muted">
          <Activity size={12} className="text-red-400" />
          <span>Son 10 dakikada {stats.follows} yeni etkileşim</span>
        </div>
      </div>
    </div>
  );
}
