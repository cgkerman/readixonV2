'use client';

import React from 'react';
import { Typography } from '@readixon/ui';
import {
  getPublishedColumns,
  getFeaturedColumn,
  getActiveColumnists,
  ColumnArticle,
  COLUMN_CATEGORIES,
} from '@readixon/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Feather,
  Clock,
  Eye,
  Heart,
  ChevronRight,
  Star,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function formatColumnDate(createdAt: any): string {
  if (!createdAt) return 'Yeni';
  try {
    const date = createdAt.toDate
      ? createdAt.toDate()
      : (createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt));
    if (isNaN(date.getTime())) return 'Yeni';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Bugün';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} sa önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return 'Yeni';
  }
}

export function AgendaColumnsSection() {
  // 1. Öne Çıkan Günün Köşe Yazısı
  const { data: featuredColumn, isLoading: featuredLoading } = useQuery<ColumnArticle | null>({
    queryKey: ['agenda', 'featured_column'],
    queryFn: () => getFeaturedColumn(),
  });

  // 2. Yayındaki Son Köşe Yazıları
  const { data: recentColumns = [], isLoading: columnsLoading } = useQuery<ColumnArticle[]>({
    queryKey: ['agenda', 'published_columns'],
    queryFn: () => getPublishedColumns({ limitCount: 6 }),
  });

  // 3. Aktif Köşe Yazarları
  const { data: columnists = [] } = useQuery({
    queryKey: ['agenda', 'active_columnists'],
    queryFn: () => getActiveColumnists(10),
  });

  // Eğer henüz hiç köşe yazısı yoksa bu bölümü şimdilik sade bir davet kartıyla göster veya gizle
  if (!featuredLoading && !columnsLoading && recentColumns.length === 0 && !featuredColumn) {
    return null;
  }

  // Öne çıkan yazı hariç diğer yazıları filtrele (çifte görünümü engellemek için)
  const otherColumns = recentColumns.filter(c => c.id !== featuredColumn?.id).slice(0, 4);

  return (
    <section className="w-full space-y-8">
      {/* Bölüm Başlığı & Tümünü Gör */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-purple-500/20 to-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300 shadow-xs">
            <Feather size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h3" className="font-bold text-text text-lg sm:text-2xl">
                Gündem Kalemleri & Köşe Yazıları
              </Typography>
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                Onaylı Kalemler
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Edebiyat, kültür, sanat ve düşünce dünyasından seçkin denemeler
            </p>
          </div>
        </div>

        <Link
          href="/agenda/kose-yazilari"
          className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group/link"
        >
          <span>Tüm Yazılar</span>
          <ChevronRight size={16} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Aktif Köşe Yazarları Şeridi (varsa) */}
      {columnists.length > 0 && (
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {columnists.map((col) => (
            <Link
              key={col.uid}
              href={`/profile/${col.username || col.uid}`}
              className="group flex items-center gap-2.5 bg-card/40 hover:bg-card border border-border/50 hover:border-primary/40 rounded-full py-1.5 pl-1.5 pr-4 transition-all duration-200 shrink-0 shadow-xs hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                {col.avatarUrl ? (
                  <img src={col.avatarUrl} alt={col.displayName || 'Yazar'} className="w-full h-full object-cover" />
                ) : (
                  (col.displayName || 'Y').charAt(0)
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                  {col.displayName || 'Yazar'}
                </span>
                <span className="text-[10px] text-muted line-clamp-1 leading-tight">
                  {col.columnistTitle || 'Köşe Yazarı'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid: Sol Manşet (Günün Köşe Yazısı) + Sağ Yan Yazılar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sol Sütun: Günün Manşet Köşe Yazısı (7 Kolon) */}
        {featuredColumn && (
          <Link
            href={`/agenda/kose-yazilari/${featuredColumn.slug || featuredColumn.id}`}
            className="lg:col-span-7 group relative bg-card/50 hover:bg-card/85 backdrop-blur-xl border border-border/60 hover:border-primary/40 rounded-[2rem] p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Arka Plan Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/15 transition-all" />

            <div>
              {/* Üst Yazar Başlığı & Badge */}
              <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 p-[1px] shadow-sm shrink-0">
                    {featuredColumn.authorAvatar ? (
                      <img
                        src={featuredColumn.authorAvatar}
                        alt={featuredColumn.authorName}
                        className="w-full h-full object-cover rounded-[15px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center text-primary font-bold">
                        {featuredColumn.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors block">
                      {featuredColumn.authorName}
                    </span>
                    <span className="text-xs text-primary/90 font-medium">
                      {featuredColumn.authorTitle || 'Köşe Yazarı'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-black flex items-center gap-1 shadow-xs">
                    <Star size={11} fill="currentColor" />
                    Günün Yazısı
                  </span>
                </div>
              </div>

              {/* Manşet Başlığı */}
              <Typography
                variant="h2"
                className="font-extrabold text-foreground group-hover:text-primary transition-colors text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4 tracking-tight drop-shadow-xs"
              >
                {featuredColumn.title}
              </Typography>

              {/* Vurucu Spot / Alıntı */}
              {featuredColumn.subtitle && (
                <p className="font-serif italic text-sm sm:text-base text-muted/90 leading-relaxed border-l-2 border-primary/60 pl-4 py-1 mb-6">
                  "{featuredColumn.subtitle}"
                </p>
              )}
            </div>

            {/* Alt Şerit: Okuma Süresi, Tarih, İstatistikler */}
            <div className="pt-6 border-t border-border/40 flex items-center justify-between relative z-10 text-xs text-muted font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Clock size={13} className="text-primary" />
                  {featuredColumn.readingTime || 2} dk okuma
                </span>
                <span>•</span>
                <span>{formatColumnDate(featuredColumn.publishedAt || featuredColumn.createdAt)}</span>
              </div>

              <div className="flex items-center gap-3 text-primary font-bold group-hover:translate-x-1 transition-transform">
                <span>Okumaya Başla</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        )}

        {/* Sağ Sütun: Diğer Seçkin Köşe Yazıları (5 Kolon) */}
        <div className={`flex flex-col gap-4 ${featuredColumn ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {otherColumns.map((col) => {
            const categoryName = COLUMN_CATEGORIES.find((c: any) => c.id === col.category)?.name || 'Edebiyat';

            return (
              <Link
                key={col.id}
                href={`/agenda/kose-yazilari/${col.slug || col.id}`}
                className="group bg-card/40 hover:bg-card/80 border border-border/50 hover:border-primary/40 rounded-3xl p-5 transition-all duration-200 shadow-xs hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] overflow-hidden">
                        {col.authorAvatar ? (
                          <img src={col.authorAvatar} alt={col.authorName} className="w-full h-full object-cover" />
                        ) : (
                          col.authorName.charAt(0)
                        )}
                      </div>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {col.authorName}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium bg-muted/15 px-2 py-0.5 rounded-md">
                      {categoryName}
                    </span>
                  </div>

                  <Typography
                    variant="h4"
                    className="font-bold text-foreground group-hover:text-primary transition-colors text-base line-clamp-2 leading-snug mb-1"
                  >
                    {col.title}
                  </Typography>

                  {col.subtitle && (
                    <p className="text-xs text-muted line-clamp-1 font-serif italic">
                      {col.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[11px] text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-primary" />
                      {col.readingTime || 2} dk
                    </span>
                    <span>{formatColumnDate(col.publishedAt || col.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-500 font-semibold">
                    <Heart size={11} fill="currentColor" />
                    <span>{col.stats?.likes || 0}</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Köşe Yazarı Olma Çağrı Kartı */}
          <Link
            href="/studio/columns"
            className="group relative rounded-3xl p-5 border border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                <Feather size={18} />
              </span>
              <div>
                <span className="text-xs font-bold text-foreground block">Gündem Kalemi Olun</span>
                <span className="text-[11px] text-muted">Edebi denemelerinizi okurlarımızla buluşturun</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
