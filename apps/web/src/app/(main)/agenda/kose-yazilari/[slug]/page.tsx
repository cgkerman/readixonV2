'use client';

import React, { use, useEffect, useState } from 'react';
import { Typography } from '@readixon/ui';
import {
  getColumnArticleBySlug,
  toggleColumnLike,
  incrementColumnViews,
  ColumnArticle,
  COLUMN_CATEGORIES,
  useAuthStore,
} from '@readixon/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Feather,
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Calendar,
  Check,
  BookOpen,
  Sparkles,
  Quote,
  Loader2,
} from 'lucide-react';

interface ColumnDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(timestamp: any): string {
  if (!timestamp) return 'Bugün';
  try {
    const d = timestamp.toDate ? timestamp.toDate() : (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Bugün';
  }
}

export default function ColumnDetailPage({ params }: ColumnDetailPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { userProfile } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCopied, setIsCopied] = useState(false);
  const [hasLikedLocal, setHasLikedLocal] = useState<boolean | null>(null);
  const [likesCountLocal, setLikesCountLocal] = useState<number | null>(null);

  // 1. Köşe Yazısını Çek
  const { data: article, isLoading, error } = useQuery<ColumnArticle | null>({
    queryKey: ['column_detail', slug],
    queryFn: () => getColumnArticleBySlug(slug),
    staleTime: 60 * 1000,
  });

  // 2. Sayfa açıldığında okunma sayısını 1 kez artır
  useEffect(() => {
    if (article?.id) {
      incrementColumnViews(article.id);
    }
  }, [article?.id]);

  // Sayfa açıldığında en üste kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  // Beğeni Durumu Senkronizasyonu
  const isLiked = hasLikedLocal !== null
    ? hasLikedLocal
    : Boolean(userProfile?.uid && article?.stats?.likedBy?.includes(userProfile.uid));

  const likesCount = likesCountLocal !== null
    ? likesCountLocal
    : (article?.stats?.likes || 0);

  // Beğeni Mutasyonu
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile?.uid) {
        throw new Error('Beğenmek için lütfen giriş yapın.');
      }
      if (!article?.id) return;
      return toggleColumnLike(article.id, userProfile.uid);
    },
    onMutate: () => {
      const nextLiked = !isLiked;
      setHasLikedLocal(nextLiked);
      setLikesCountLocal(nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1));
    },
    onError: (err: any) => {
      // Revert optimistic update
      setHasLikedLocal(isLiked);
      setLikesCountLocal(likesCount);
      toast.error(err.message || 'Beğenilirken bir hata oluştu.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column_detail', slug] });
    },
  });

  // Paylaş
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title || 'Köşe Yazısı',
          text: article?.subtitle || '',
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success('Yazı bağlantısı panoya kopyalandı!');
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="animate-spin text-primary mb-4" size={36} />
        <Typography variant="body" className="text-muted text-sm">Köşe yazısı yükleniyor...</Typography>
      </div>
    );
  }

  if (!article || article.status !== 'published') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-background text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-muted/15 flex items-center justify-center text-muted mb-4">
          <Feather size={32} />
        </div>
        <Typography variant="h3" className="font-extrabold text-foreground mb-2">
          Köşe Yazısı Bulunamadı
        </Typography>
        <p className="text-xs text-muted leading-relaxed mb-6">
          Aradığınız köşe yazısı henüz yayında olmayabilir veya yayından kaldırılmış olabilir.
        </p>
        <Link
          href="/agenda"
          className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md"
        >
          Gündem'e Dön
        </Link>
      </div>
    );
  }

  const categoryName = COLUMN_CATEGORIES.find((c: any) => c.id === article.category)?.name || 'Edebiyat & Kültür';

  return (
    <article className="min-h-screen bg-background pb-28 selection:bg-primary/20">
      {/* ── Üst Okuma Navigasyonu (Sticky Bar) ── */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/40 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/agenda"
            className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-foreground transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Gündem</span>
          </Link>

          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full line-clamp-1">
            {categoryName}
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-card hover:bg-muted/10 border border-border/50 text-muted hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            <span>{isCopied ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>
        </div>
      </header>

      {/* ── Yazı Başlık & Yazar Başlığı (Hero Container) ── */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 space-y-8">
        {/* Yazar Kimlik Kartı */}
        <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-6">
          <Link
            href={`/profile/${article.authorUsername || article.authorId}`}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 p-[1px] shadow-md shrink-0">
              {article.authorAvatar ? (
                <img
                  src={article.authorAvatar}
                  alt={article.authorName}
                  className="w-full h-full object-cover rounded-[15px]"
                />
              ) : (
                <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center text-primary font-bold text-lg">
                  {article.authorName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base sm:text-lg">
                  {article.authorName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-xs text-primary font-medium block">
                {article.authorTitle || 'Köşe Yazarı'}
              </span>
            </div>
          </Link>

          <div className="flex flex-col text-right text-xs text-muted font-medium">
            <span className="flex items-center gap-1 justify-end text-foreground/80">
              <Clock size={12} className="text-primary" />
              {article.readingTime || 2} dk okuma
            </span>
            <span className="text-[11px] mt-0.5">{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>

        {/* Başlık */}
        <Typography
          variant="h1"
          className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight sm:leading-tight"
        >
          {article.title}
        </Typography>

        {/* Spot Cümle (Alıntı Vurgusu) */}
        {article.subtitle && (
          <div className="relative pl-5 py-2 border-l-4 border-primary bg-primary/5 rounded-r-2xl pr-4">
            <p className="font-serif italic text-base sm:text-xl text-foreground/90 leading-relaxed">
              "{article.subtitle}"
            </p>
          </div>
        )}

        {/* Kapak Görseli (varsa) */}
        {article.coverImage && (
          <div className="w-full aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden shadow-xl border border-border/40">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ── Okuma Metni (Zengin Tipografi) ── */}
        <div className="font-serif text-lg sm:text-xl text-foreground/90 leading-[1.85] sm:leading-[1.9] space-y-6 pt-4 whitespace-pre-wrap selection:bg-primary/30">
          {article.content}
        </div>

        {/* Etiketler (varsa) */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-xl bg-card border border-border/50 text-xs font-semibold text-muted hover:text-foreground transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Etkileşim & Beğeni Şeridi ── */}
        <div className="pt-8 pb-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-95 ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/25'
                  : 'bg-card hover:bg-card/80 border border-border/50 text-foreground'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'scale-110 transition-transform' : ''} />
              <span>{likesCount} Beğeni</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card hover:bg-card/80 border border-border/50 font-bold text-sm text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Eye size={14} className="text-primary" />
            <span>{(article.stats?.views || 0).toLocaleString('tr-TR')} okunma</span>
          </div>
        </div>

        {/* ── Yazar Biyografisi Kapanış Kartı ── */}
        <div className="mt-10 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
            {article.authorAvatar ? (
              <img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
            ) : (
              article.authorName.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <Typography variant="h3" className="font-extrabold text-foreground text-lg">
                  {article.authorName}
                </Typography>
                <span className="text-xs text-primary font-semibold">
                  {article.authorTitle || 'Readixon Gündem Yazarı'}
                </span>
              </div>

              <Link
                href={`/profile/${article.authorUsername || article.authorId}`}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all self-center sm:self-auto shadow-xs"
              >
                Yazar Profilini İncele
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-muted/90 leading-relaxed font-sans">
              Readixon Gündem masasında düzenli olarak edebiyat, kültür, sanat ve düşünce üzerine köşe yazıları kaleme almaktadır.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
