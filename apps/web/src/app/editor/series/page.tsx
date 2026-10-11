"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { getAllSeries, generateSeriesSlug, type Series } from '@readixon/core';
import { 
  Layers, Search, Eye, Heart, BookOpen, ExternalLink, 
  LayoutTemplate, CheckCircle, Clock, Sparkles 
} from 'lucide-react';

export default function EditorSeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    setLoading(true);
    try {
      const data = await getAllSeries(100);
      setSeriesList(data);
    } catch (err) {
      console.error('Seriler yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      const matchesSearch =
        !searchTerm.trim() ||
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.universeTitle?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [seriesList, searchTerm, statusFilter]);

  const ongoingCount = seriesList.filter((s) => s.status === 'ongoing').length;
  const completedCount = seriesList.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ── 1. Başlık & Aksiyon ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500">
              <Layers size={22} />
            </span>
            <Typography variant="h2" className="font-bold text-2xl md:text-3xl text-foreground">
              Kitap Serileri
            </Typography>
          </div>
          <Typography variant="body" className="text-muted text-sm">
            Platformdaki tüm çok ciltli sagaları ve serileri inceleyin, editoryal değerlendirme yapın veya ana sayfa manşetine taşıyın.
          </Typography>
        </div>

        <Link href="/editor/hero/create">
          <Button variant="primary" className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold shadow-md shadow-primary/20">
            <LayoutTemplate size={16} /> Manşet Oluştur
          </Button>
        </Link>
      </div>

      {/* ── 2. Metrik Kartları ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs font-bold text-muted block mb-1">Toplam Seri</span>
          <span className="text-2xl sm:text-3xl font-black text-foreground">{seriesList.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs font-bold text-blue-400 block mb-1">Devam Eden Seriler</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-400">{ongoingCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs font-bold text-emerald-400 block mb-1">Tamamlanan Seriler</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{completedCount}</span>
        </div>
      </div>

      {/* ── 3. Arama ve Filtreler ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card/40 border border-border/40 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Seri başlığı, yazar, kullanıcı adı veya evren ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border/30 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {(['all', 'ongoing', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background hover:bg-card text-muted hover:text-foreground border border-border/30'
              }`}
            >
              {st === 'all' ? 'Tümü' : st === 'ongoing' ? 'Devam Eden' : 'Tamamlanan'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Seriler Tablosu ── */}
      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm text-xs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4 w-[38%]">Seri Bilgisi</th>
                <th className="px-6 py-4 w-[20%]">Yazar</th>
                <th className="px-6 py-4 w-[16%]">Kitaplar & Durum</th>
                <th className="px-6 py-4 w-[14%]">İstatistikler</th>
                <th className="px-6 py-4 w-[12%] text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && seriesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <Typography variant="body" className="text-muted text-sm">Seriler yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : filteredSeries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted text-sm">
                    Kayıtlı kitap serisi bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSeries.map((s) => {
                  const sSlug = s.slug || generateSeriesSlug(s.title, s.seriesId);
                  return (
                    <tr key={s.seriesId} className="hover:bg-card/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-16 rounded-xl bg-card overflow-hidden border border-border/50 group-hover:border-primary/50 transition-colors shrink-0 shadow-xs flex items-center justify-center">
                            {s.coverImage ? (
                              <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
                            ) : (
                              <Layers size={20} className="text-muted/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {s.title}
                              </span>
                            </div>
                            {s.universeTitle && (
                              <span className="text-[10px] font-bold text-muted bg-background px-2 py-0.5 rounded border border-border/40 inline-block mb-1">
                                🌌 {s.universeTitle}
                              </span>
                            )}
                            <p className="text-xs text-muted line-clamp-1">
                              {s.description || 'Açıklama girilmemiş.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0 overflow-hidden">
                            {s.authorAvatarUrl ? (
                              <img src={s.authorAvatarUrl} alt={s.authorName} className="w-full h-full object-cover" />
                            ) : (
                              (s.authorName || 'Y').substring(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">
                              {s.authorName || 'İsimsiz Yazar'}
                            </span>
                            {s.authorUsername && (
                              <span className="text-[11px] text-muted block truncate">
                                @{s.authorUsername}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs font-bold text-foreground">
                            {s.books?.length || 0} Cilt
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              s.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {s.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-muted font-medium">
                          <span className="flex items-center gap-1.5">
                            <Eye size={13} className="text-primary" />
                            {s.stats?.totalViews || 0} Okunma
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Heart size={13} className="text-red-400" />
                            {s.stats?.totalLikes || 0} Beğeni
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/series/${sSlug}`}
                            target="_blank"
                            title="Seri Sayfasını Gör"
                            className="p-2 rounded-xl bg-card border border-border/50 hover:border-primary/50 text-muted hover:text-foreground transition-all shadow-xs"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <Link
                            href={`/editor/hero/create?title=${encodeURIComponent(s.title)}&summary=${encodeURIComponent(s.description || '')}&badge=${encodeURIComponent('Editörün Seçimi Seri')}&link=${encodeURIComponent(`/series/${sSlug}`)}&imageUrl=${encodeURIComponent(s.coverImage || '')}`}
                            title="Ana Sayfa Manşetine Taşı"
                            className="p-2 rounded-xl bg-primary/10 border border-primary/25 hover:bg-primary text-primary hover:text-primary-foreground transition-all shadow-xs"
                          >
                            <Sparkles size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
