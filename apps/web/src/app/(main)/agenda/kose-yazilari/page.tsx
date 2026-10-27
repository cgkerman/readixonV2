'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from '@readixon/ui';
import {
  getPublishedColumns,
  ColumnArticle,
  ColumnCategory,
  COLUMN_CATEGORIES,
} from '@readixon/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Feather,
  Clock,
  Eye,
  Heart,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Filter,
  Loader2,
  Sparkles,
} from 'lucide-react';

function formatColumnDate(createdAt: any): string {
  if (!createdAt) return 'Yeni';
  try {
    const date = createdAt.toDate
      ? createdAt.toDate()
      : (createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt));
    if (isNaN(date.getTime())) return 'Yeni';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Yeni';
  }
}

export default function AllColumnsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedCategory]);

  const { data: articles = [], isLoading } = useQuery<ColumnArticle[]>({
    queryKey: ['all_columns', selectedCategory],
    queryFn: () => getPublishedColumns({
      category: selectedCategory === 'all' ? undefined : (selectedCategory as ColumnCategory),
      limitCount: 30,
    }),
  });

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/20">
      {/* ── Hero Banner ── */}
      <div className="relative pt-12 pb-16 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-foreground mb-6 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Gündem'e Dön</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
                <Feather size={13} />
                <span>Edebi Köşe Yazıları Arşivi</span>
              </div>
              <Typography variant="h1" className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
                Gündem Kalemleri
              </Typography>
              <p className="text-muted text-sm sm:text-base max-w-xl mt-2 leading-relaxed">
                Kültür, sanat, felsefe ve edebiyat üzerine kaleme alınmış seçkin denemeler ve eleştiriler.
              </p>
            </div>

            <Link
              href="/studio/columns"
              className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
            >
              <Feather size={15} />
              <span>Köşe Yazarı Ol</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* Kategori Filtre Butonları */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card/60 text-muted hover:text-foreground hover:bg-card border border-border/40'
            }`}
          >
            Tüm Yazılar
          </button>
          {COLUMN_CATEGORIES.map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card/60 text-muted hover:text-foreground hover:bg-card border border-border/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Yazı Listesi */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-xs">Yazılar yükleniyor...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center bg-card/20 border border-border/40 rounded-3xl p-8 max-w-md mx-auto">
            <BookOpen className="mx-auto text-muted mb-3 opacity-40" size={36} />
            <Typography variant="h4" className="font-bold text-foreground mb-1">
              Bu kategoride henüz köşe yazısı bulunmuyor
            </Typography>
            <p className="text-xs text-muted mb-6">
              İlk köşe yazısını siz kaleme alabilir ve Gündem sayfasında yerinizi alabilirsiniz.
            </p>
            <Link
              href="/studio/columns"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              <Feather size={14} />
              <span>Köşe Yazarlığına Başvur</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((art) => {
              const catName = COLUMN_CATEGORIES.find((c: any) => c.id === art.category)?.name || 'Edebiyat';

              return (
                <Link
                  key={art.id}
                  href={`/agenda/kose-yazilari/${art.slug || art.id}`}
                  className="group bg-card/50 hover:bg-card/90 backdrop-blur-md border border-border/50 hover:border-primary/40 rounded-3xl p-6 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Yazar Bilgisi */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                          {art.authorAvatar ? (
                            <img src={art.authorAvatar} alt={art.authorName} className="w-full h-full object-cover" />
                          ) : (
                            art.authorName.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block leading-tight">
                            {art.authorName}
                          </span>
                          <span className="text-[10px] text-muted leading-tight">
                            {art.authorTitle || 'Köşe Yazarı'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                        {catName}
                      </span>
                    </div>

                    {/* Kapak Varsa */}
                    {art.coverImage && (
                      <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden mb-4 shadow-xs">
                        <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <Typography
                      variant="h3"
                      className="font-extrabold text-foreground group-hover:text-primary transition-colors text-lg sm:text-xl line-clamp-2 leading-snug mb-2"
                    >
                      {art.title}
                    </Typography>

                    {art.subtitle && (
                      <p className="text-xs text-muted font-serif italic line-clamp-2 leading-relaxed">
                        "{art.subtitle}"
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-foreground/80 font-medium">
                        <Clock size={12} className="text-primary" />
                        {art.readingTime || 2} dk
                      </span>
                      <span>•</span>
                      <span>{formatColumnDate(art.publishedAt || art.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-rose-500 font-semibold">
                        <Heart size={12} fill="currentColor" />
                        {art.stats?.likes || 0}
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <Eye size={12} />
                        {(art.stats?.views || 0).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
