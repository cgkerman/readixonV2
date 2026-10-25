'use client';

import React from 'react';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import { useQuery } from '@tanstack/react-query';
import { getClubs, type Club } from '@readixon/core';
import {
  Users,
  MessageSquare,
  Sparkles,
  Feather,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Compass,
  Radio,
} from 'lucide-react';

export const AgendaClubsSection: React.FC = () => {
  const { data: clubs = [], isLoading } = useQuery<Club[]>({
    queryKey: ['agenda', 'featured_clubs'],
    queryFn: async () => {
      const list = await getClubs({ limitCount: 6 });
      return list || [];
    },
    staleTime: 60 * 1000,
  });

  return (
    <section className="w-full">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300">
            <Compass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h3" className="font-bold text-text text-lg sm:text-2xl">
                Kitap Kulüpleri & Canlı Seferler
              </Typography>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/25">
                <Radio size={11} className="animate-pulse text-primary" />
                <span>Canlı Topluluk</span>
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Okurlarla aynı sayfalarda buluşun, Living Journey duraklarında teorileri tartışın ve yazarlarla bir araya gelin
            </p>
          </div>
        </div>

        <Link
          href="/clubs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors group self-start sm:self-center shrink-0"
        >
          <span>Tüm Kulüpleri Keşfet</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ── Loading Skeleton ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-card/60 border border-border/50 p-5 space-y-4 animate-pulse"
            >
              <div className="h-36 rounded-2xl bg-muted/20" />
              <div className="h-5 w-3/4 bg-muted/20 rounded-lg" />
              <div className="h-4 w-full bg-muted/15 rounded-lg" />
              <div className="h-8 w-full bg-muted/10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        /* ── Empty State CTA ── */
        <div className="p-10 sm:p-14 rounded-3xl bg-card/40 border border-border/60 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-foreground">Henüz Kulüp Bulunmuyor</h4>
            <p className="text-xs text-muted mt-1 max-w-md">
              Topluluğun ilk kitap kulübünü siz kurun! Sevdiğiniz bir eseri seçin ve okuma seferinizi başlatın.
            </p>
          </div>
          <Link
            href="/clubs"
            className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
          >
            + İlk Kulübü Oluştur
          </Link>
        </div>
      ) : (
        /* ── Club Cards Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const hasActiveBook = Boolean(club.activeBook);

            return (
              <Link
                key={club.id}
                href={`/clubs/${club.slug}`}
                className="group flex flex-col rounded-3xl bg-card/40 hover:bg-card/80 border border-border/50 hover:border-primary/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* ── Card Cover & Header ── */}
                <div className="relative h-36 w-full bg-muted/20 overflow-hidden">
                  <img
                    src={
                      club.coverUrl ||
                      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />

                  {/* Badges on Cover */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    {club.isAuthorOfficial ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md">
                        <Feather size={11} className="stroke-[2.5]" />
                        <span>Resmi Yazar Kulübü</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white/95 border border-white/20">
                        <Sparkles size={11} className="text-primary" />
                        <span>Okur Kulübü</span>
                      </span>
                    )}

                    {club.isPrivate && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white/80 border border-white/20">
                        Özel
                      </span>
                    )}
                  </div>

                  {/* Club Avatar */}
                  <div className="absolute bottom-3 left-4 flex items-end gap-3 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-card border-2 border-background shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                      {club.avatarUrl ? (
                        <img
                          src={club.avatarUrl}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-amber-500/20 flex items-center justify-center font-black text-base text-primary">
                          {club.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-white/80 font-medium drop-shadow-md">
                      Kurucu: <strong className="text-white font-semibold">{club.creatorName}</strong>
                    </span>
                  </div>
                </div>

                {/* ── Card Content ── */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {club.name}
                    </h4>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {club.description || 'Bu kulüpte henüz bir açıklama bulunmuyor.'}
                    </p>
                  </div>

                  {/* ── Living Journey / Active Book Info ── */}
                  {hasActiveBook ? (
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                      <div className="w-8 h-11 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {club.activeBook?.coverUrl ? (
                          <img
                            src={club.activeBook.coverUrl}
                            alt={club.activeBook.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            Aktif Sefer
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-foreground truncate mt-0.5">
                          {club.activeBook?.title}
                        </h5>
                        <p className="text-[10px] text-muted truncate">
                          {club.activeBook?.authorName}
                        </p>
                      </div>
                    </div>
                  ) : club.tags && club.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {club.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-muted/15 text-muted border border-border/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted italic">
                      Tartışmaya açık sohbet odaları
                    </div>
                  )}

                  {/* ── Footer Stats ── */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Users size={13} className="text-primary" />
                        <span>{club.stats?.membersCount || 1} Okur</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={13} className="text-muted/70" />
                        <span>{club.stats?.discussionsCount || 1} Oda</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                      <span>Kulübe Git</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
