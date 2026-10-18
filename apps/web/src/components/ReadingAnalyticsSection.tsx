'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  BookOpen, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  BarChart2, 
  ShieldCheck,
  Flame
} from 'lucide-react';
import { Typography } from '@readixon/ui';
import { 
  type Story, 
  type Chapter, 
  getPublishedChapters, 
  fetchChapters,
  calculateStoryReadingAnalytics, 
  formatReadingHours, 
  formatReadingMinutes,
  type StoryReadingAnalytics
} from '@readixon/core';

export interface ReadingAnalyticsSectionProps {
  stories?: Story[];
  initialStory?: Story | null;
  initialChapters?: Chapter[];
  showStorySelector?: boolean;
  variant?: 'studio' | 'admin';
  title?: string;
}

export function ReadingAnalyticsSection({ 
  stories = [], 
  initialStory = null,
  initialChapters,
  showStorySelector = true,
  variant = 'studio',
  title
}: ReadingAnalyticsSectionProps) {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    initialStory ? initialStory.storyId : (stories[0]?.storyId || '')
  );
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters || []);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<'retention' | 'duration'>('retention');

  // initialStory değişirse senkronize et
  useEffect(() => {
    if (initialStory) {
      setSelectedStoryId(initialStory.storyId);
    }
  }, [initialStory]);

  // initialChapters değişirse senkronize et
  useEffect(() => {
    if (initialChapters && initialChapters.length > 0) {
      setChapters(initialChapters);
    }
  }, [initialChapters]);

  // Varsayılan olarak en çok okunan hikayeyi seç
  useEffect(() => {
    if (!initialStory && stories.length > 0 && !selectedStoryId) {
      const topStory = [...stories].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0))[0];
      setSelectedStoryId(topStory.storyId);
    }
  }, [stories, selectedStoryId, initialStory]);

  // Seçilen hikayenin bölümlerini yükle (eğer initialChapters yoksa veya hikaye değiştiyse)
  useEffect(() => {
    if (!selectedStoryId) return;

    // Eğer initialChapters zaten bu hikayeye aitse ve yüklüyse tekrar çekme
    if (initialStory && initialStory.storyId === selectedStoryId && initialChapters && initialChapters.length > 0) {
      setChapters(initialChapters);
      return;
    }

    let isMounted = true;
    setLoadingChapters(true);

    // Admin panelinde taslaklar dahil tüm bölümleri çekebiliriz
    const fetchMethod = variant === 'admin' ? fetchChapters : getPublishedChapters;

    fetchMethod(selectedStoryId)
      .then((chaps) => {
        if (isMounted) {
          setChapters(chaps || []);
          setLoadingChapters(false);
        }
      })
      .catch((err) => {
        console.warn('Bölümler yüklenirken hata:', err);
        if (isMounted) setLoadingChapters(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedStoryId, initialStory, initialChapters, variant]);

  const selectedStory = useMemo(() => {
    if (initialStory && initialStory.storyId === selectedStoryId) return initialStory;
    return stories.find((s) => s.storyId === selectedStoryId) || initialStory || stories[0] || null;
  }, [stories, selectedStoryId, initialStory]);

  // Analitik verisini hesapla
  const analytics: StoryReadingAnalytics | null = useMemo(() => {
    if (!selectedStory || chapters.length === 0) return null;
    return calculateStoryReadingAnalytics(selectedStory, chapters);
  }, [selectedStory, chapters]);

  // Recharts için formatlanmış veri dizisi
  const chartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.chapterMetrics.map((m) => ({
      name: `B.${m.order}`,
      fullTitle: m.title,
      order: m.order,
      retentionRate: m.retentionRate,
      dropOffRate: m.dropOffRate,
      views: m.views,
      completedReads: m.completedReads,
      actualDurationMinutes: Number((m.actualAvgReadTimeSeconds / 60).toFixed(1)),
      estimatedDurationMinutes: Number((m.estimatedReadTimeSeconds / 60).toFixed(1)),
      completionRate: m.completionRate,
      readingPace: m.readingPace,
      wordCount: m.wordCount
    }));
  }, [analytics]);

  // Yazar ve Admin için kurgusal içgörü & analiz çıkarımı
  const editorialInsights = useMemo(() => {
    if (!analytics || analytics.chapterMetrics.length === 0) return null;

    const metrics = analytics.chapterMetrics;
    const worstDropOff = [...metrics.slice(1)].sort((a, b) => b.dropOffRate - a.dropOffRate)[0];
    const bestEngagement = [...metrics].sort((a, b) => b.engagementScore - a.engagementScore)[0];

    return {
      worstDropOff: worstDropOff && worstDropOff.dropOffRate > 15 ? worstDropOff : null,
      bestEngagement: bestEngagement || null
    };
  }, [analytics]);

  if (!selectedStory && stories.length === 0) {
    return null;
  }

  const isStorySelectorVisible = showStorySelector && stories.length > 1;

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col gap-6">
      
      {/* ── Üst Başlık & Hikaye Seçici ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'admin' 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                : 'bg-primary/10 border border-primary/20 text-primary'
            }`}>
              {variant === 'admin' ? <ShieldCheck size={18} /> : <Zap size={17} />}
            </div>
            <Typography variant="h2" className="text-lg sm:text-xl font-black text-foreground">
              {title || (variant === 'admin' ? 'Okuma Analitiği & Tutundurma Denetimi' : 'Gelişmiş Okuma Analitiği & Tutundurma')}
            </Typography>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              variant === 'admin'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              {variant === 'admin' ? 'YÖNETİM TELEMETRİSİ' : 'YENİ NESİL TELEMETRİ'}
            </span>
          </div>
          <p className="text-xs text-muted">
            {variant === 'admin' 
              ? 'Yönetim incelemesi: Okurların bölümlerde geçirdiği ortalama aktif süre, tamamlama ve terk oranlarını denetleyin.'
              : 'Okurların bölümlerde geçirdiği ortalama süre, tamamlama ve terk eğrilerini inceleyerek kurgu ritminizi optimize edin.'}
          </p>
        </div>

        {/* Hikaye Dropdown / Seçici */}
        {isStorySelectorVisible && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <BookOpen size={14} /> Eser:
            </span>
            <select
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className="bg-background/80 hover:bg-background border border-border/60 hover:border-primary/40 text-text font-bold text-xs rounded-xl px-3 py-2 outline-hidden transition-all cursor-pointer shadow-2xs max-w-[220px] truncate"
            >
              {stories.map((story) => (
                <option key={story.storyId} value={story.storyId}>
                  {story.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingChapters ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
          <span className="text-xs font-medium text-muted">Okuma telemetrisi hesaplanıyor...</span>
        </div>
      ) : !analytics || analytics.chapterMetrics.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-border/40 rounded-2xl bg-muted/5 text-muted text-xs sm:text-sm">
          Bu eser için henüz yayınlanmış bir bölüm veya yeterli okuma telemetrisi bulunmuyor.
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ── 1. Telemetri KPI Kartları ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Toplam Aktif Okuma Süresi */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Clock size={19} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted font-medium block truncate">Toplam Okunma Süresi</span>
                <span className="text-base sm:text-lg font-black text-foreground block truncate">
                  {formatReadingHours(analytics.totalReadTimeSeconds)}
                </span>
              </div>
            </div>

            {/* Bölüm Başına Ort. Süre */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <TrendingUp size={19} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted font-medium block truncate">Ort. Bölüm Süresi</span>
                <span className="text-base sm:text-lg font-black text-foreground block truncate">
                  {formatReadingMinutes(analytics.avgChapterReadTimeSeconds)}
                </span>
              </div>
            </div>

            {/* Genel Bitiş / Tutunma Oranı */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={19} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted font-medium block truncate">Kitap Bitiş Oranı</span>
                <span className="text-base sm:text-lg font-black text-foreground block truncate">
                  %{analytics.overallCompletionRate}
                </span>
              </div>
            </div>

            {/* Toplam Kelime Hacmi */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <BookOpen size={19} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted font-medium block truncate">Toplam Kelime Hacmi</span>
                <span className="text-base sm:text-lg font-black text-foreground block truncate">
                  {analytics.totalWords.toLocaleString('tr-TR')} kelime
                </span>
              </div>
            </div>

          </div>

          {/* ── 2. İnteraktif Grafik Alanı (Tutunma vs. Süre) ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background/50 border border-border/40">
            
            {/* Grafik Başlığı ve Sekme Butonları */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChart2 size={16} className={variant === 'admin' ? 'text-red-400' : 'text-primary'} />
                  {activeChartTab === 'retention' 
                    ? 'Okur Tutunma & Bölüm Terk Hunisi' 
                    : 'Bölüm Okuma Süresi & Tempo Karşılaştırması'}
                </h3>
                <p className="text-xs text-muted">
                  {activeChartTab === 'retention'
                    ? '1. Bölümden itibaren okuyucu kitlesinin bölümler arası akışı ve düşüş oranları.'
                    : 'Gerçekleşen ortalama okuma süresi ile kelime sayısına göre beklenen ideal süre (dk).'}
                </p>
              </div>

              {/* Sekmeler */}
              <div className="flex items-center gap-1.5 p-1 bg-card/80 border border-border/40 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('retention')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === 'retention'
                      ? 'bg-primary text-black shadow-xs'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Tutunma Hunisi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('duration')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === 'duration'
                      ? 'bg-primary text-black shadow-xs'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Süre & Tempo
                </button>
              </div>
            </div>

            {/* Recharts Görselleştirme */}
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'retention' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="retentionGradientShared" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={variant === 'admin' ? '#ef4444' : 'var(--color-primary, #6366f1)'} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={variant === 'admin' ? '#ef4444' : 'var(--color-primary, #6366f1)'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11} 
                      tickFormatter={(v) => `%${v}`} 
                      domain={[0, 100]} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                    />
                    <Tooltip content={<CustomRetentionTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="retentionRate" 
                      name="Tutunma Oranı (%)" 
                      stroke={variant === 'admin' ? '#ef4444' : 'var(--color-primary, #6366f1)'} 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#retentionGradientShared)" 
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11} 
                      tickFormatter={(v) => `${v} dk`} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                    />
                    <Tooltip content={<CustomDurationTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                      formatter={(val) => <span className="text-xs text-muted">{val}</span>} 
                    />
                    <Bar 
                      dataKey="actualDurationMinutes" 
                      name="Gerçekleşen Süre (dk)" 
                      fill={variant === 'admin' ? '#ef4444' : 'var(--color-primary, #6366f1)'} 
                      radius={[6, 6, 0, 0]} 
                    />
                    <Bar 
                      dataKey="estimatedDurationMinutes" 
                      name="Beklenen İdeal Süre (dk)" 
                      fill="#38bdf8" 
                      radius={[6, 6, 0, 0]} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

          </div>

          {/* ── 3. Akıllı Kurgusal İçgörü Kutucuğu ── */}
          {editorialInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {editorialInsights.bestEngagement && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Flame size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 mb-0.5">
                      En Sevilen Bölüm: {editorialInsights.bestEngagement.title}
                    </h4>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Bu bölüm %{editorialInsights.bestEngagement.completionRate} tamamlama ve yüksek ilgi skoruna sahip. Okurlar buradaki anlatım hızını ve sahne dinamizmini çok sevdi.
                    </p>
                  </div>
                </div>
              )}

              {editorialInsights.worstDropOff ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 mb-0.5">
                      Kritik Düşüş Noktası: {editorialInsights.worstDropOff.title}
                    </h4>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Bu bölümde %{editorialInsights.worstDropOff.dropOffRate} oranında bir terk gözlemlendi. Kurgusal tempo düşüşü veya sonundaki merak unsurunun (cliffhanger) incelenmesi önerilir.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary mb-0.5">
                      İstikrarlı Okur Tutunması
                    </h4>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Eser bölümler arasında ani bir kayıp yaşamıyor; kitle istikrarlı şekilde bölümleri tüketiyor.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── 4. Bölüm Bazlı Detaylı Telemetri Tablosu ── */}
          <div className="overflow-x-auto rounded-2xl border border-border/40 bg-background/40">
            <table className="w-full text-left text-xs text-text border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-card/60 text-muted font-semibold">
                  <th className="py-3 px-3.5">Bölüm</th>
                  <th className="py-3 px-3">Kelime</th>
                  <th className="py-3 px-3">Okunma</th>
                  <th className="py-3 px-3">Ortalama Süre</th>
                  <th className="py-3 px-3">Tamamlama</th>
                  <th className="py-3 px-3">Terk Oranı</th>
                  <th className="py-3 px-3">Tempo</th>
                  <th className="py-3 px-3.5 text-right">İlgi Skoru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {analytics.chapterMetrics.map((chap) => {
                  return (
                    <tr key={chap.chapterId} className="hover:bg-card/50 transition-colors">
                      <td className="py-3 px-3.5 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-muted/20 text-muted text-[10px] font-black flex items-center justify-center shrink-0">
                            {chap.order}
                          </span>
                          <span className="truncate max-w-[150px] sm:max-w-[220px]" title={chap.title}>
                            {chap.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {chap.wordCount.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <span className="flex items-center gap-1">
                          <Eye size={12} className="text-primary" />
                          {chap.views.toLocaleString('tr-TR')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {formatReadingMinutes(chap.actualAvgReadTimeSeconds)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-muted/20 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                chap.completionRate >= 75 ? 'bg-emerald-400' : chap.completionRate >= 50 ? 'bg-amber-400' : 'bg-red-400'
                              }`} 
                              style={{ width: `${chap.completionRate}%` }} 
                            />
                          </div>
                          <span className="font-bold text-[11px]">%{chap.completionRate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {chap.dropOffRate > 0 ? (
                          <span className="text-red-400 font-bold flex items-center gap-0.5 text-[11px]">
                            <TrendingDown size={12} /> %{chap.dropOffRate}
                          </span>
                        ) : (
                          <span className="text-muted text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          chap.readingPace === 'deep' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                            : chap.readingPace === 'skimming'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {chap.readingPace === 'deep' ? 'Derin Okuma' : chap.readingPace === 'skimming' ? 'Göz Gezdirme' : 'Dengeli'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-amber-400">
                        ⭐ {chap.engagementScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}

// ── Özel Recharts Tooltip Bileşenleri ──
function CustomRetentionTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-card/95 border border-border shadow-xl backdrop-blur-md text-xs">
        <p className="font-bold text-foreground mb-1">
          {data.order}. Bölüm: {data.fullTitle}
        </p>
        <div className="flex flex-col gap-1 text-[11px]">
          <span className="text-primary font-semibold">
            Tutunma Oranı: %{data.retentionRate}
          </span>
          <span className="text-muted">
            Okunma Sayısı: {data.views}
          </span>
          {data.dropOffRate > 0 && (
            <span className="text-red-400 font-semibold">
              Önceki Bölümden Düşüş: %{data.dropOffRate}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
}

function CustomDurationTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-card/95 border border-border shadow-xl backdrop-blur-md text-xs">
        <p className="font-bold text-foreground mb-1">
          {data.order}. Bölüm: {data.fullTitle}
        </p>
        <div className="flex flex-col gap-1 text-[11px]">
          <span className="text-primary font-semibold">
            Gerçekleşen Ortalama Süre: {data.actualDurationMinutes} dk
          </span>
          <span className="text-sky-400 font-semibold">
            Beklenen İdeal Süre: {data.estimatedDurationMinutes} dk
          </span>
          <span className="text-muted">
            Kelime Hacmi: {data.wordCount} kelime
          </span>
        </div>
      </div>
    );
  }
  return null;
}
