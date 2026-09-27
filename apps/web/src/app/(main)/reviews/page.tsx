"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Button } from '@readixon/ui';
import {
  getEditorialReviews,
  getStoriesByIds,
  generateStorySlug,
  EditorialReview,
  Story
} from '@readixon/core';
import Link from 'next/link';
import {
  BookOpen,
  Star,
  Sparkles,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Award,
  ShieldCheck,
  Compass,
  Feather,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  X,
  PenTool,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 8 Boyutlu Puanlama için Ağırlık / Ortalama Hesaplayıcı
function calculateOverallScore(scores?: EditorialReview['scores']): number | null {
  if (!scores) return null;
  const values = Object.values(scores).map(v => Number(v) || 0).filter(v => v > 0);
  if (values.length === 0) return null;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / values.length).toFixed(1));
}

function getScoreBadgeInfo(score: number | null) {
  if (score === null) {
    return {
      text: 'İncelendi',
      bg: 'bg-primary/10 text-primary border-primary/20',
      badgeBg: 'from-primary/20 to-primary/5',
      starColor: 'text-primary'
    };
  }
  if (score >= 9.0) {
    return {
      text: 'Kusursuz Başyapıt',
      bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      badgeBg: 'from-amber-500 to-yellow-500 text-black',
      starColor: 'text-amber-500'
    };
  }
  if (score >= 8.0) {
    return {
      text: 'Şiddetle Tavsiye',
      bg: 'bg-primary/10 text-primary border-primary/30',
      badgeBg: 'from-primary/20 to-primary/10 text-primary',
      starColor: 'text-primary'
    };
  }
  return {
    text: 'Öne Çıkan Eser',
    bg: 'bg-card/80 text-muted border-border/50',
    badgeBg: 'from-muted/20 to-muted/10 text-muted',
    starColor: 'text-muted'
  };
}

export default function EditorialReviewsPage() {
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [storiesMap, setStoriesMap] = useState<Record<string, Story>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'title'>('newest');

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const data = await getEditorialReviews(30);
        setReviews(data);

        // İlgili hikayelerin yazar ve detay bilgilerini çek
        const storyIds = Array.from(new Set(data.map(r => r.storyId).filter(Boolean)));
        if (storyIds.length > 0) {
          try {
            const stories = await getStoriesByIds(storyIds);
            const map: Record<string, Story> = {};
            stories.forEach(s => {
              if (s.storyId) map[s.storyId] = s;
            });
            setStoriesMap(map);
          } catch (storyErr) {
            console.error('Reviews stories fetch error:', storyErr);
          }
        }
      } catch (err) {
        console.error('Editorial reviews loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  // Filtreleme ve Sıralama
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => {
        const story = storiesMap[r.storyId];
        const author = r.authorName || story?.authorName || '';
        return (
          (r.storyTitle && r.storyTitle.toLowerCase().includes(q)) ||
          (author && author.toLowerCase().includes(q)) ||
          (r.editorName && r.editorName.toLowerCase().includes(q)) ||
          (r.about && r.about.toLowerCase().includes(q)) ||
          (r.themes && r.themes.toLowerCase().includes(q))
        );
      });
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } else if (sortBy === 'score') {
      result.sort((a, b) => (calculateOverallScore(b.scores) || 0) - (calculateOverallScore(a.scores) || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.storyTitle || '').localeCompare(b.storyTitle || '', 'tr'));
    }

    return result;
  }, [reviews, storiesMap, searchQuery, sortBy]);

  // Spotlight / Öne çıkan inceleme (Varsa en yüksek puanlı veya en yeni ilk inceleme)
  const spotlightReview = useMemo(() => {
    if (reviews.length === 0) return null;
    const sorted = [...reviews].sort((a, b) => (calculateOverallScore(b.scores) || 0) - (calculateOverallScore(a.scores) || 0));
    return sorted[0];
  }, [reviews]);

  const spotlightStory = spotlightReview ? storiesMap[spotlightReview.storyId] : null;
  const spotlightAuthor = spotlightReview?.authorName || spotlightStory?.authorName;
  const spotlightStorySlug = (spotlightStory as any)?.slug || generateStorySlug(spotlightReview?.storyTitle || 'kitap', spotlightReview?.storyId || '');

  return (
    <div className="relative w-full pb-28 md:pb-16 overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-amber-500/10 via-primary/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-10 w-96 h-96 bg-purple-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-black tracking-widest uppercase mb-4 shadow-sm backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Readıxon Gold Standart</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text mb-5 leading-tight"
          >
            Editör <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Değerlendirmeleri</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Readixon Yayın Kurulu ve edebiyat editörlerinin bağımsız, tarafsız ve 8 temel edebi kritere dayalı kapsamlı incelemeleri. Okuma listenize layık gerçek başyapıtları keşfedin.
          </motion.p>

          {/* 4 Pillars Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border/40 text-left"
          >
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Award size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-text">8 Temel Boyut</div>
                <div className="text-[11px] text-muted">Kurgu, dil ve karakter</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-text">%100 Bağımsız</div>
                <div className="text-[11px] text-muted">Sponsor ve baskısız</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Compass size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-text">Detaylı Puanlama</div>
                <div className="text-[11px] text-muted">10 üzerinden objektif</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Feather size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-text">Edebi Rehberlik</div>
                <div className="text-[11px] text-muted">Yazara yapıcı analiz</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Spotlight Showcase (Öne Çıkan Değerlendirme) */}
        {!loading && spotlightReview && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <span className="text-sm font-black tracking-wider uppercase text-text">Öne Çıkan Değerlendirme</span>
              </div>
              <span className="text-xs text-muted font-medium">Editörlerimizin Zirve Seçimi</span>
            </div>

            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-card/90 via-card/50 to-background border border-border/70 hover:border-amber-500/40 transition-all duration-500 shadow-xl hover:shadow-2xl">

              <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 p-6 sm:p-10">
                {/* Book Cover with 3D feel & Proper Aspect Ratio */}
                <div className="relative shrink-0 group-hover:-translate-y-1.5 transition-transform duration-300">
                  {/* Ambient cover glow directly behind cover */}
                  <div
                    className="absolute -inset-3 bg-gradient-to-tr from-amber-500/25 via-primary/20 to-purple-500/20 blur-2xl rounded-3xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                  />

                  <div className="w-48 sm:w-56 md:w-60 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-card border border-white/15 dark:border-white/10 relative">
                    {spotlightReview.storyCover ? (
                      <img
                        src={spotlightReview.storyCover}
                        alt={spotlightReview.storyTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <BookOpen size={48} />
                      </div>
                    )}
                    {/* Realistic book spine lighting */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
                    {/* Top edge glossy highlight */}
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Rating Ribbon on Cover */}
                  {calculateOverallScore(spotlightReview.scores) && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs shadow-lg flex items-center gap-1 z-20">
                      <Star size={12} className="fill-black" />
                      <span>{calculateOverallScore(spotlightReview.scores)} / 10</span>
                    </div>
                  )}
                </div>

                {/* Info & Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      ★ Editörün Başyapıtı
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(spotlightReview.createdAt.seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-text mb-2 leading-tight tracking-tight">
                    {spotlightReview.storyTitle || 'İsimsiz Eser'}
                  </h2>

                  {/* Author & Editor Details */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                    {spotlightAuthor && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/70 border border-border/50 text-xs font-semibold">
                        <PenTool size={13} className="text-primary shrink-0" />
                        <span className="text-muted">
                          Yazar: <strong className="text-text font-bold">{spotlightAuthor}</strong>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/70 border border-border/50 text-xs font-semibold">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-primary/20 shrink-0">
                        {spotlightReview.editorAvatar ? (
                          <img src={spotlightReview.editorAvatar} alt={spotlightReview.editorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-primary">
                            {spotlightReview.editorName?.charAt(0) || 'E'}
                          </div>
                        )}
                      </div>
                      <span className="text-muted">
                        İnceleyen: <strong className="text-primary font-bold">{spotlightReview.editorName}</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-muted text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 max-w-3xl">
                    "{spotlightReview.firstImpression || spotlightReview.about}"
                  </p>

                  {/* Highlights Mini Score Pills */}
                  {spotlightReview.scores && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                      {[
                        { label: 'Hikâye', val: spotlightReview.scores.storyStructure },
                        { label: 'Karakterler', val: spotlightReview.scores.characters },
                        { label: 'Dil & Üslup', val: spotlightReview.scores.languageAndStyle },
                        { label: 'Dünya Tasarımı', val: spotlightReview.scores.worldBuilding },
                      ].map((item, idx) => (
                        <div key={idx} className="px-3 py-1 rounded-lg bg-background/80 border border-border/50 text-xs font-medium flex items-center gap-1.5">
                          <span className="text-muted">{item.label}:</span>
                          <span className="text-primary font-bold">{item.val || 0}/10</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                    <Link href={`/reviews/${spotlightReview.id}`}>
                      <Button variant="primary" className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                        <span>Detaylı İncelemeyi Oku</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <Link href={`/story/${spotlightStorySlug}`}>
                      <Button variant="outline" className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>Kitap Sayfasına Git</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search, Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-card/30 p-3 sm:p-4 rounded-2xl border border-border/40 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Eser adı, yazar, editör veya tema ile ara..."
              className="w-full pl-10 pr-10 py-2.5 bg-background border border-border/60 rounded-xl text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted font-bold uppercase tracking-wider">
              <SlidersHorizontal size={14} />
              <span>Sırala:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="newest">En Yeniler</option>
              <option value="score">En Yüksek Puan</option>
              <option value="title">İsme Göre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-card/40 border border-border/40 rounded-3xl p-6 h-80 animate-pulse flex flex-col justify-between">
                <div className="flex gap-4">
                  <div className="w-24 aspect-[2/3] bg-muted/20 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted/20 rounded w-3/4" />
                    <div className="h-3 bg-muted/20 rounded w-1/2" />
                    <div className="h-3 bg-muted/20 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted/20 rounded w-full" />
                  <div className="h-3 bg-muted/20 rounded w-5/6" />
                </div>
                <div className="h-8 bg-muted/20 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="bg-card/30 border border-border/50 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">
              {searchQuery ? 'Aramanıza Uygun İnceleme Bulunamadı' : 'Henüz İnceleme Bulunmuyor'}
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              {searchQuery
                ? `"${searchQuery}" ifadesine uyan herhangi bir değerlendirme bulunamadı. Lütfen farklı anahtar kelimeler deneyin.`
                : 'Editörlerimiz harıl harıl yeni eserleri okuyup kapsamlı analizler hazırlıyor. Çok yakında yeni başyapıtlar eklenecek.'}
            </p>
            {searchQuery && (
              <Button variant="outline" onPress={() => setSearchQuery('')} className="px-5 py-2">
                Aramayı Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedReviews.map((review, i) => {
                const overallScore = calculateOverallScore(review.scores);
                const badgeInfo = getScoreBadgeInfo(overallScore);
                const cardStory = storiesMap[review.storyId];
                const cardAuthor = review.authorName || cardStory?.authorName;
                const cardStorySlug = (cardStory as any)?.slug || generateStorySlug(review.storyTitle || 'kitap', review.storyId);

                return (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="h-full"
                  >
                    <div className="h-full bg-card/40 hover:bg-card/80 border border-border/50 hover:border-amber-500/40 transition-all duration-300 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm group">

                      {/* Top Section: Cover & Book Meta */}
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          {/* Book Cover with proper 2:3 aspect ratio */}
                          <Link href={`/reviews/${review.id}`} className="shrink-0">
                            <div className="w-24 aspect-[2/3] bg-muted/20 rounded-xl overflow-hidden shadow-md relative group-hover:shadow-xl transition-all border border-border/30">
                              {review.storyCover ? (
                                <img
                                  src={review.storyCover}
                                  alt={review.storyTitle}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted">
                                  <BookOpen size={24} />
                                </div>
                              )}
                              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
                            </div>
                          </Link>

                          {/* Book Title & Author/Editor Info */}
                          <div className="flex-1 min-w-0">
                            {/* Overall Score Pill */}
                            {overallScore !== null && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black mb-2 shadow-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                                <Star size={11} className="fill-black" />
                                <span>{overallScore} / 10</span>
                              </div>
                            )}

                            <Link href={`/reviews/${review.id}`}>
                              <h3 className="font-extrabold text-lg text-text group-hover:text-primary transition-colors line-clamp-2 mb-1.5 leading-snug">
                                {review.storyTitle || 'İsimsiz Eser'}
                              </h3>
                            </Link>

                            {/* Author Name */}
                            {cardAuthor && (
                              <div className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
                                <PenTool size={11} className="text-primary shrink-0" />
                                <span className="truncate">Yazar: <strong className="text-text font-semibold">{cardAuthor}</strong></span>
                              </div>
                            )}

                            {/* Editor Byline */}
                            <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                              <div className="w-4 h-4 rounded-full overflow-hidden bg-primary/20 shrink-0">
                                {review.editorAvatar ? (
                                  <img src={review.editorAvatar} alt={review.editorName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-primary">
                                    {review.editorName?.charAt(0) || 'E'}
                                  </div>
                                )}
                              </div>
                              <span className="truncate">Editör: <strong className="text-primary font-semibold">{review.editorName}</strong></span>
                            </div>

                            <div className="text-[11px] text-muted flex items-center gap-1">
                              <Calendar size={12} />
                              <span>
                                {new Date(review.createdAt.seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-text/80 line-clamp-3 leading-relaxed mb-4">
                          {review.firstImpression || review.about}
                        </p>

                        {/* Mini Scores Highlights */}
                        {review.scores && (
                          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-border/40 mb-4">
                            <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                              <span className="text-muted">Hikâye:</span>
                              <span className="font-bold text-text">{review.scores.storyStructure || 0}/10</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                              <span className="text-muted">Karakter:</span>
                              <span className="font-bold text-text">{review.scores.characters || 0}/10</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                              <span className="text-muted">Dil:</span>
                              <span className="font-bold text-text">{review.scores.languageAndStyle || 0}/10</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] bg-background/50 px-2 py-1 rounded-md border border-border/30">
                              <span className="text-muted">Özgünlük:</span>
                              <span className="font-bold text-text">{review.scores.originality || 0}/10</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeInfo.bg} truncate max-w-[120px]`}>
                          {badgeInfo.text}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/story/${cardStorySlug}`}
                            title="Kitap Sayfasına Git"
                            className="p-1.5 rounded-lg bg-background hover:bg-muted/20 border border-border/50 text-muted hover:text-text transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          <Link
                            href={`/reviews/${review.id}`}
                            className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                          >
                            <span>İnceleme</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Readixon Gold Standart Info Section */}
        <div className="mt-20 pt-12 border-t border-border/50">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-text mb-3">
              Readixon Gold Standart Nedir?
            </h2>
            <p className="text-muted text-sm sm:text-base leading-relaxed">
              Platformumuzdaki bağımsız edebi değerlendirmelerin arkasındaki titiz ve objektif standartlar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-card/30 border border-border/40 hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                  <Award size={24} />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">8 Boyutlu Detaylı Puanlama</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Hikâye örgüsü, karakter derinliği, dil işçiliği, tempo, atmosfer, özgünlük, duygusal etki ve mantık tutarlılığı bağımsız olarak incelenip notlandırılır.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card/30 border border-border/40 hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Tarafsız & Bağımsız Eleştiri</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  İncelemeler hiçbir sponsorluk veya ticari kaygı gözetilmeksizin, tamamen edebi liyakat ve okuma deneyimi esas alınarak kaleme alınır.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card/30 border border-border/40 hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                  <Feather size={24} />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Yazar & Okur Köprüsü</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Okuyucular için kaliteli bir keşif pusulası, yazarlar içinse eserlerini sonraki seviyeye taşıyacak profesyonel ve yapıcı bir geri bildirim rehberi.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
