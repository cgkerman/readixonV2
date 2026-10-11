'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  getSeriesBySlug, 
  getStoryById, 
  generateStorySlug, 
  type Series, 
  type Story 
} from '@readixon/core';
import { 
  Layers, 
  BookOpen, 
  Eye, 
  Heart, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  CheckCircle,
  Play
} from 'lucide-react';

export default function PublicSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [books, setBooks] = useState<{ story: Story; order: number; customLabel?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    loadSeriesData();
  }, [slug]);

  const loadSeriesData = async () => {
    setLoading(true);
    try {
      const data = await getSeriesBySlug(slug);
      if (!data) {
        setLoading(false);
        return;
      }
      setSeries(data);

      if (data.books && data.books.length > 0) {
        const sorted = [...data.books].sort((a, b) => a.order - b.order);
        const storyPromises = sorted.map(async (item) => {
          const s = await getStoryById(item.storyId);
          return {
            story: s || ({ storyId: item.storyId, title: 'Bilinmeyen Kitap' } as Story),
            order: item.order,
            customLabel: item.customLabel,
          };
        });
        const resolved = await Promise.all(storyPromises);
        setBooks(resolved);
      }
    } catch (error) {
      console.error('Seri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <Typography variant="body" className="text-muted text-sm">Kitap serisi yükleniyor...</Typography>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <Layers size={40} className="text-muted/40 mb-3" />
        <Typography variant="h2" className="text-xl font-bold mb-2">Seri Bulunamadı</Typography>
        <Typography variant="body" className="text-muted text-sm mb-6">
          Aradığınız kitap serisi yayından kaldırılmış veya bağlantı değişmiş olabilir.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/feed')} className="rounded-xl text-xs font-bold">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const firstBook = books.length > 0 ? books[0] : null;

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      {/* ── 1. Hero Afiş Alanı ── */}
      <div className="relative w-full overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/15 via-card/50 to-background pt-6 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Geri Dön */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Geri Dön</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
            {/* Seri Kapağı */}
            <div className="w-36 sm:w-48 aspect-[3/4] rounded-2xl bg-card border border-border/60 overflow-hidden shadow-2xl shrink-0 relative group flex items-center justify-center">
              {series.coverImage ? (
                <img src={series.coverImage} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="p-4 text-center text-primary/40">
                  <Layers size={44} strokeWidth={1.5} className="mx-auto mb-2" />
                  <span className="text-xs font-bold block">{series.title}</span>
                </div>
              )}
            </div>

            {/* Seri Bilgileri */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  Kitap Serisi
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    series.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  {series.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                </span>
                {series.universeTitle && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border/60 text-muted">
                    🌌 {series.universeTitle}
                  </span>
                )}
              </div>

              <Typography variant="h1" className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-2 leading-tight">
                {series.title}
              </Typography>

              {series.authorName && (
                <p className="text-xs sm:text-sm text-muted mb-4 font-medium">
                  Yazar: <span className="text-foreground font-bold">{series.authorName}</span>
                </p>
              )}

              <Typography variant="body" className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl mb-6">
                {series.description || 'Bu serinin konusu ve kurgusu hakkında henüz bir açıklama girilmedi.'}
              </Typography>

              {/* Hızlı Aksiyon & Metrikler */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                {firstBook && (
                  <Button
                    variant="primary"
                    onPress={() => {
                      const slugStr = (firstBook.story as any).slug || generateStorySlug(firstBook.story.title, firstBook.story.storyId);
                      router.push(`/story/${slugStr}`);
                    }}
                    className="flex items-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl shadow-primary/25 active:scale-95 transition-transform"
                  >
                    <Play size={16} className="fill-current" />
                    <span>Seriye Başla (1. Kitap)</span>
                  </Button>
                )}

                <div className="flex items-center gap-4 text-xs font-semibold bg-card/60 border border-border/60 px-4 py-2.5 rounded-2xl backdrop-blur-md">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <BookOpen size={14} className="text-primary" />
                    {books.length} Kitap
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-muted">
                    <Eye size={14} />
                    {series.stats?.totalViews || 0}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-muted">
                    <Heart size={14} />
                    {series.stats?.totalLikes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Okuma Sırası & Kitap Listesi ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="h2" className="text-lg sm:text-xl font-bold text-foreground">
              Okuma Sırası & Kitaplar
            </Typography>
            <Typography variant="body" className="text-muted text-xs sm:text-sm mt-0.5">
              Yazarın belirlediği kronolojik okuma sıralaması.
            </Typography>
          </div>
          <span className="text-xs font-bold text-muted bg-card px-3 py-1.5 rounded-xl border border-border/50">
            {books.length} Cilt
          </span>
        </div>

        <div className="space-y-4">
          {books.map((item, idx) => {
            const st = item.story;
            const storySlug = (st as any).slug || generateStorySlug(st.title, st.storyId);

            return (
              <div
                key={st.storyId}
                onClick={() => router.push(`/story/${storySlug}`)}
                className="p-4 sm:p-5 rounded-2xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 cursor-pointer group shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                  {/* Sıra Rozeti */}
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-base flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    #{idx + 1}
                  </div>

                  {/* Kitap Kapağı */}
                  <div className="w-14 sm:w-16 aspect-[2/3] rounded-xl bg-background border border-border/60 overflow-hidden shrink-0 shadow-sm">
                    {st.coverImage ? (
                      <img src={st.coverImage} alt={st.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <BookOpen size={18} />
                      </div>
                    )}
                  </div>

                  {/* Başlık & Bilgiler */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Typography variant="h3" className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {st.title}
                      </Typography>
                      {item.customLabel && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {item.customLabel}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-2">
                      {st.summary || 'Özet eklenmemiş...'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted font-medium">
                      <span>{st.stats?.chapterCount || 0} Bölüm</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {st.stats?.views || 0}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} /> {st.stats?.likes || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buton */}
                <div className="self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground text-xs font-bold transition-all shadow-xs">
                    <span>Kitaba Git</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
