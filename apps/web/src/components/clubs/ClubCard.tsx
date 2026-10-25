'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, MessageSquare, Feather, BookOpen, Sparkles, Lock } from 'lucide-react';
import type { Club } from '@readixon/core';

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  const defaultCover = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80';

  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group relative flex flex-col rounded-3xl bg-card border border-border/60 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
    >
      {/* Cover / Header Banner */}
      <div className="relative h-44 w-full bg-muted/20 overflow-hidden">
        <img
          src={club.coverUrl || defaultCover}
          alt={club.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {club.isAuthorOfficial ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-black backdrop-blur-md shadow-md">
              <Feather size={12} className="stroke-[2.5]" />
              <span>Resmi Yazar Kulübü</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-background/80 text-foreground/80 backdrop-blur-md border border-border/40">
              <Sparkles size={11} className="text-primary" />
              <span>Okur Topluluğu</span>
            </span>
          )}

          {club.isPrivate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white/90 backdrop-blur-md">
              <Lock size={11} />
              <span>Özel</span>
            </span>
          )}
        </div>

        {/* Club Avatar */}
        <div className="absolute -bottom-3 left-5">
          <div className="w-14 h-14 rounded-2xl bg-card border-2 border-border shadow-lg overflow-hidden flex items-center justify-center">
            {club.avatarUrl ? (
              <img src={club.avatarUrl} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-amber-500/20 flex items-center justify-center font-black text-xl text-primary">
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 pt-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {club.name}
            </h3>
          </div>

          <p className="text-xs text-muted font-normal mt-1.5 line-clamp-2 leading-relaxed">
            {club.description || 'Bu kulüp henüz bir açıklama eklemedi.'}
          </p>

          {/* Tags */}
          {club.tags && club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {club.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-muted/15 text-muted hover:text-foreground transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Active Book Journey Preview */}
        {club.activeBook && (
          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3">
            <div className="w-9 h-12 rounded-lg bg-muted/30 overflow-hidden shrink-0 shadow-sm">
              {club.activeBook.coverUrl ? (
                <img
                  src={club.activeBook.coverUrl}
                  alt={club.activeBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/40">
                  <BookOpen size={16} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary block">
                Şu An Okunuyor
              </span>
              <p className="font-bold text-xs text-foreground truncate">
                {club.activeBook.title}
              </p>
              <span className="text-[10px] text-muted block truncate">
                {club.activeBook.totalChapters} Bölümlük Sefer
              </span>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-primary/70" />
              <strong className="text-foreground">{club.stats?.membersCount || 1}</strong> Üye
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-primary/70" />
              <strong className="text-foreground">{club.stats?.discussionsCount || 0}</strong> Tartışma
            </span>
          </div>

          <span className="text-[11px] font-bold text-primary group-hover:underline">
            Katıl ↗
          </span>
        </div>
      </div>
    </Link>
  );
}
