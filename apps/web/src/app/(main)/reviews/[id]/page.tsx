"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Button } from '@readixon/ui';
import {
  getEditorialReviewById,
  getStoryById,
  generateStorySlug,
  EditorialReview,
  Story
} from '@readixon/core';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Share2,
  Copy,
  ExternalLink,
  Quote,
  Compass,
  Feather,
  Heart,
  ShieldCheck,
  Users,
  Zap,
  Layers,
  Award,
  Check,
  Bookmark,
  MessageSquare,
  PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// 8 Boyutlu Kriter Tanımları
const SCORE_CRITERIA = [
  { key: 'storyStructure', label: 'Hikâye Yapısı & Kurgu', icon: BookOpen, desc: 'Olay örgüsü, çatışma ve dramatik denge' },
  { key: 'characters', label: 'Karakterler & Derinlik', icon: Users, desc: 'Karakter arkları, motivasyon ve özgünlük' },
  { key: 'languageAndStyle', label: 'Dil, Üslup & Anlatım', icon: Feather, desc: 'Kelime işçiliği, akıcılık ve edebi tat' },
  { key: 'pacing', label: 'Tempo & Sürükleyicilik', icon: Zap, desc: 'Bölümler arası dinamizm ve merak unsuru' },
  { key: 'worldBuilding', label: 'Dünya Tasarımı & Atmosfer', icon: Compass, desc: 'Mekân tasvirleri, evren kuralları ve his' },
  { key: 'originality', label: 'Özgünlük & Yaratıcılık', icon: Sparkles, desc: 'Yenilikçi fikirler ve klişelerden uzaklık' },
  { key: 'emotionalImpact', label: 'Duygusal Etki & Katarsis', icon: Heart, desc: 'Okurda uyandırdığı hisler ve kalıcı etki' },
  { key: 'technicalConsistency', label: 'Teknik Tutarlılık & Mantık', icon: ShieldCheck, desc: 'Zaman çizgisi, mantık ve kurgusal bütünlük' },
] as const;

function calculateOverallScore(scores?: EditorialReview['scores']): number | null {
  if (!scores) return null;
  const values = Object.values(scores).map(v => Number(v) || 0).filter(v => v > 0);
  if (values.length === 0) return null;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / values.length).toFixed(1));
}

function getScoreEvaluation(score: number | null) {
  if (score === null) return { title: 'Değerlendirildi', desc: 'Readixon Editör İncelemesi', color: 'text-primary' };
  if (score >= 9.5) return { title: 'Zirve Başyapıt (Magnum Opus)', desc: 'Edebiyat ve kurgu alanında çığır açan kusursuz bir eser.', color: 'text-amber-400' };
  if (score >= 9.0) return { title: 'Kusursuz Başyapıt', desc: 'Her kütüphanede mutlaka yer alması gereken olağanüstü bir anlatı.', color: 'text-amber-400' };
  if (score >= 8.5) return { title: 'Şiddetle Tavsiye Edilir', desc: 'Yüksek edebi kaliteye ve nefes kesici bir akıcılığa sahip.', color: 'text-emerald-400' };
  if (score >= 8.0) return { title: 'Üstün Nitelikli Eser', desc: 'Karakter ve kurgusuyla okuru içine çeken başarılı bir başyapıt adayı.', color: 'text-emerald-400' };
  if (score >= 7.0) return { title: 'Güçlü & Sürükleyici Anlatı', desc: 'Keyifle okunan, ufak pürüzlere rağmen çok tatmin edici bir eser.', color: 'text-blue-400' };
  return { title: 'Gelişime Açık & Dikkat Çekici', desc: 'Önemli potansiyele sahip, geliştirilmeye açık yönleri bulunan bir kurgu.', color: 'text-purple-400' };
}

export default function EditorialReviewDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [review, setReview] = useState<EditorialReview | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadReviewAndStory = async () => {
      setLoading(true);
      try {
        const reviewData = await getEditorialReviewById(id);
        setReview(reviewData);

        if (reviewData?.storyId) {
          try {
            const storyData = await getStoryById(reviewData.storyId);
            setStory(storyData);
          } catch (storyErr) {
            console.error('Story load error:', storyErr);
          }
        }
      } catch (err) {
        console.error('Editorial review load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadReviewAndStory();
    }
  }, [id]);

  const overallScore = useMemo(() => {
    return calculateOverallScore(review?.scores);
  }, [review?.scores]);

  const scoreEvaluation = useMemo(() => {
    return getScoreEvaluation(overallScore);
  }, [overallScore]);

  const storySlug = useMemo(() => {
    if (!review) return '';
    return (story as any)?.slug || generateStorySlug(review.storyTitle || 'kitap', review.storyId);
  }, [story, review]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${review?.storyTitle || 'Eser'} - Readixon Editör Değerlendirmesi`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Readixon Gold Standart İncelemesi: ${review?.storyTitle}`,
          url
        });
        return;
      } catch (err) {
        // Share cancelled or not supported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('İnceleme bağlantısı panoya kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Bağlantı kopyalanamadı.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted text-sm font-medium animate-pulse">Editör incelemesi yükleniyor...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/20 text-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Değerlendirme Bulunamadı</h2>
        <p className="text-muted text-sm mb-6">Aradığınız editör incelemesi silinmiş veya yayından kaldırılmış olabilir.</p>
        <Link href="/reviews">
          <Button variant="primary" className="rounded-xl px-6">
            <ArrowLeft size={16} className="mr-2" /> Değerlendirmelere Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full pb-28 md:pb-16">
      {/* Ambient Backdrop Cover Glow */}
      {review.storyCover && (
        <div
          className="fixed inset-0 pointer-events-none -z-10 opacity-15 dark:opacity-20 blur-3xl scale-125 object-cover"
          style={{
            backgroundImage: `url(${review.storyCover})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
      )}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">

        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link href="/reviews" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text transition-colors group">
            <div className="w-8 h-8 rounded-full bg-card/60 border border-border/50 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={16} />
            </div>
            <span>Tüm İncelemeler</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/60 hover:bg-card border border-border/50 text-xs font-semibold text-text transition-all hover:shadow-sm"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            <span>{copied ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>
        </div>

        {/* Hero Section Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-card/40 border border-border/60 p-6 sm:p-10 lg:p-12 mb-12 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">

            {/* 3D Book Cover Visual & Proper 2:3 Ratio */}
            <div className="relative shrink-0 group">
              {/* Ambient Glow */}
              <div
                className="absolute -inset-3 bg-gradient-to-tr from-amber-500/25 via-primary/20 to-purple-500/20 blur-2xl rounded-3xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity"
              />

              <div className="w-48 sm:w-56 md:w-64 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-card border border-white/15 dark:border-white/10 relative transition-transform duration-500 group-hover:scale-105">
                {review.storyCover ? (
                  <img
                    src={review.storyCover}
                    alt={review.storyTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <BookOpen size={48} />
                  </div>
                )}
                {/* Book spine realistic lighting */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              </div>

              {/* Gold Ribbon / Wax Seal */}
              <div className="absolute -top-3 -left-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black font-black text-[11px] shadow-xl uppercase tracking-wider flex items-center gap-1 z-20">
                <Sparkles size={12} className="fill-black" />
                <span>Gold Standart</span>
              </div>
            </div>

            {/* Story Details & Header Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-4">
                <Award size={14} />
                <span>Readixon Edebiyat Kurulu Resmi İncelemesi</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text leading-tight tracking-tight mb-4">
                {review.storyTitle || 'İsimsiz Eser'}
              </h1>

              {/* Author and Genres */}
              {(story?.authorName || review.authorName) && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/60 border border-border/50 text-sm font-semibold text-text">
                    <PenTool size={14} className="text-primary" />
                    <span>Yazar: <strong className="text-primary font-bold">{story?.authorName || review.authorName}</strong></span>
                  </div>
                  {story?.tags && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {story.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-background/60 border border-border/50 text-muted">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Editor & Date Bar */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl bg-background/40 border border-border/40 mb-8 max-w-2xl">
                {/* Editor Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 ring-2 ring-primary/30 shrink-0">
                    {review.editorAvatar ? (
                      <img src={review.editorAvatar} alt={review.editorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">
                        {review.editorName?.charAt(0) || 'E'}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-muted uppercase tracking-wider">İnceleyen Editör</div>
                    <div className="text-sm font-bold text-text">{review.editorName}</div>
                  </div>
                </div>

                <div className="h-8 w-px bg-border/50 hidden sm:block" />

                {/* Date */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center text-muted shrink-0">
                    <Calendar size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Yayın Tarihi</div>
                    <div className="text-xs font-semibold text-text">
                      {new Date(review.createdAt.seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-border/50 hidden sm:block" />

                {/* Status verified */}
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Tamamı Okundu</span>
                </div>
              </div>

              {/* Master Score Showcase Box */}
              {overallScore !== null && (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 mb-8 max-w-2xl">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1.5">
                        <Award size={14} />
                        <span>Genel Editör Puanı</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-text mb-1">
                        {scoreEvaluation.title}
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        {scoreEvaluation.desc}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-black shadow-lg shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight">{overallScore}</span>
                        <span className="text-sm font-bold opacity-80">/ 10</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            className={overallScore >= star * 2 ? "fill-black text-black" : "text-black/40"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link href={`/read/${review.storyId}`}>
                  <Button variant="primary" className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 text-base">
                    <BookOpen size={18} />
                    <span>Eseri Hemen Oku</span>
                  </Button>
                </Link>

                <Link href={`/story/${storySlug}`}>
                  <Button variant="outline" className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                    <ExternalLink size={16} />
                    <span>Kitap Sayfasına Git</span>
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* 8-Dimension Detailed Score Matrix */}
        {review.scores && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  <h2 className="text-2xl font-black text-text">8 Boyutlu Detaylı Puanlama Kriterleri</h2>
                </div>
                <p className="text-sm text-muted mt-1">
                  Eserin edebi, kurgusal ve teknik kalitesini ölçen 8 temel parametrenin detaylı analizi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SCORE_CRITERIA.map((criterion) => {
                const scoreValue = (review.scores as any)[criterion.key] || 0;
                const percentage = Math.min(Math.max((scoreValue / 10) * 100, 0), 100);
                const Icon = criterion.icon;

                // Tutarlı ve dengeli renk paleti
                const isTopScore = scoreValue >= 9.0;
                const barColor = isTopScore ? 'from-primary to-amber-500' : 'from-primary/80 to-primary';
                const textColor = isTopScore ? 'text-amber-500' : 'text-primary';
                const badgeBg = isTopScore ? 'bg-amber-500/10 border-amber-500/30' : 'bg-primary/10 border-primary/20';

                return (
                  <div
                    key={criterion.key}
                    className="p-5 rounded-2xl bg-card/30 border border-border/50 flex flex-col justify-between hover:border-primary/40 transition-all hover:bg-card/50 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Icon size={18} />
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black border ${badgeBg} ${textColor}`}>
                          {scoreValue} / 10
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-text mb-1">
                        {criterion.label}
                      </h3>
                      <p className="text-[11px] text-muted leading-tight mb-4">
                        {criterion.desc}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="w-full h-2 rounded-full bg-background border border-border/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Editorial Content Breakdown: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Editörün İlk İzlenimi (Pull Quote Style) */}
            {review.firstImpression && (
              <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-card/50 to-background border border-primary/20 shadow-md">
                <Quote size={40} className="text-primary/30 absolute top-4 right-4" />
                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-3">
                  <Sparkles size={14} />
                  <span>Editörün İlk İzlenimi</span>
                </div>
                <blockquote className="text-base sm:text-lg font-medium text-text/95 leading-relaxed italic">
                  "{review.firstImpression}"
                </blockquote>
              </div>
            )}

            {/* Eser Hakkında */}
            {review.about && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Eser Hakkında & Genel Bakış</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.about}
                </div>
              </div>
            )}

            {/* Hikâye ve Kurgu Yapısı */}
            {review.storyAndStructure && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Hikâye ve Kurgu Yapısı</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.storyAndStructure}
                </div>
              </div>
            )}

            {/* Karakterler */}
            {review.characters && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Karakterler ve Ark Gelişimleri</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.characters}
                </div>
              </div>
            )}

            {/* Dünya ve Atmosfer */}
            {review.worldAndAtmosphere && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <Compass size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Dünya Tasarımı ve Atmosfer</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.worldAndAtmosphere}
                </div>
              </div>
            )}

            {/* Dil ve Üslup */}
            {review.languageAndStyle && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <Feather size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Dil, Üslup ve Edebi İşçilik</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.languageAndStyle}
                </div>
              </div>
            )}

            {/* Temalar */}
            {review.themes && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Tematik Derinlik ve Alt Metinler</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.themes}
                </div>
              </div>
            )}

            {/* Güçlü Yönler vs Geliştirilebilecek Alanlar */}
            {(review.strengths || review.areasForImprovement) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Güçlü Yönler */}
                {review.strengths && (
                  <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                        <CheckCircle2 size={20} />
                        <span>Öne Çıkan Güçlü Yönler</span>
                      </div>
                      <div className="text-text/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                        {review.strengths}
                      </div>
                    </div>
                  </div>
                )}

                {/* Geliştirilebilecek Alanlar */}
                {review.areasForImprovement && (
                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-3">
                        <Sparkles size={20} />
                        <span>Geliştirilebilecek Alanlar</span>
                      </div>
                      <div className="text-text/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                        {review.areasForImprovement}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Okuyucu Deneyimi */}
            {review.readerExperience && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Heart size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-text">Okuyucu Deneyimi & Hedef Kitle</h3>
                </div>
                <div className="text-muted text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {review.readerExperience}
                </div>
              </div>
            )}

            {/* Editörün Son Sözü (Definitive Verdict) */}
            {review.finalWord && (
              <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-card/70 to-background border border-amber-500/30 shadow-xl">
                <Award size={36} className="text-amber-500/40 absolute top-4 right-4" />
                <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wider mb-3">
                  <Award size={15} />
                  <span>Editörün Son Sözü</span>
                </div>
                <div className="text-text/95 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-medium mb-6">
                  {review.finalWord}
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {review.editorName?.charAt(0) || 'E'}
                    </div>
                    <span className="text-xs font-bold text-text">{review.editorName}</span>
                  </div>
                  <span className="text-[11px] text-muted font-medium">Readixon Yayın Kurulu İmzası</span>
                </div>
              </div>
            )}

            {/* Spoilerli Editör Notları (Interactive Reveal) */}
            {review.spoilerNotes && (
              <div className="rounded-3xl border border-orange-500/30 bg-orange-500/5 overflow-hidden transition-all">
                <button
                  onClick={() => setShowSpoilers(!showSpoilers)}
                  className="w-full flex items-center justify-between p-6 hover:bg-orange-500/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div className="text-base font-bold text-orange-400 flex items-center gap-2">
                        <span>Spoilerli Editör Notları</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                          Kritik Detaylar
                        </span>
                      </div>
                      <p className="text-xs text-orange-400/80 mt-0.5">
                        Eserin finali, sürprizleri ve kilit olayları hakkında analizler içerir.
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    {showSpoilers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                <AnimatePresence>
                  {showSpoilers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-orange-500/20"
                    >
                      <div className="text-text/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal pt-2">
                        {review.spoilerNotes}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* Sticky Sidebar on Desktop (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* Quick Story & Score Card */}
            <div className="p-6 rounded-3xl bg-card/40 border border-border/50 shadow-md backdrop-blur-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-20 rounded-xl overflow-hidden bg-muted/20 shrink-0 shadow-md">
                  {review.storyCover ? (
                    <img src={review.storyCover} alt={review.storyTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><BookOpen size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text truncate mb-1">{review.storyTitle || 'İsimsiz Eser'}</h4>
                  {overallScore !== null && (
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                      <Star size={13} className="fill-amber-400" />
                      <span>{overallScore} / 10 Puan</span>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/read/${review.storyId}`} className="block mb-3">
                <Button variant="primary" className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <BookOpen size={16} />
                  <span>Hemen Oku</span>
                </Button>
              </Link>

              <Link href={`/story/${storySlug}`} className="block">
                <Button variant="outline" className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2">
                  <ExternalLink size={14} />
                  <span>Kitap Detay Sayfası</span>
                </Button>
              </Link>
            </div>

            {/* Share & Socials Card */}
            <div className="p-6 rounded-3xl bg-card/30 border border-border/50">
              <h4 className="font-bold text-sm text-text mb-2">Bu İncelemeyi Paylaş</h4>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Edebiyatsever dostlarınızla veya sosyal medya takipçilerinizle paylaşın.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-background border border-border/50 text-xs font-bold text-text hover:border-primary/40 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>

                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Readixon Editör Değerlendirmesi: "${review.storyTitle}" - ${overallScore ? `${overallScore}/10` : ''}`);
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-background border border-border/50 text-xs font-bold text-text hover:border-primary/40 transition-colors"
                >
                  <Share2 size={14} />
                  <span>Twitter / X</span>
                </button>
              </div>
            </div>

            {/* Readixon Editorial Disclaimer */}
            <div className="p-5 rounded-2xl bg-card/20 border border-border/30 text-[11px] text-muted leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-text mb-1">
                <ShieldCheck size={14} className="text-primary" />
                <span>Readixon Yayın Politikası</span>
              </div>
              Bu inceleme, Readixon Yayın Kurulu bağımsız editörleri tarafından tarafsızlık ilkesiyle hazırlanmıştır. Eser değerlendirmeleri yazar ve platform bağımsızdır.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
