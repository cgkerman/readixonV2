'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  Layers, 
  Search, 
  Sparkles, 
  PlusCircle, 
  ArrowLeft,
  Crown,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicSeries, type Series } from '@readixon/core';
import { SeriesCard } from '@/components/SeriesCard';

const STATUS_FILTERS = [
  { id: 'all', label: 'Tüm Seriler', icon: '📚' },
  { id: 'ongoing', label: 'Devam Edenler', icon: '⏳' },
  { id: 'completed', label: 'Tamamlananlar', icon: '✅' },
];

export default function ExploreSeriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: seriesList = [], isLoading } = useQuery({
    queryKey: ['series', 'public', 'explore'],
    queryFn: () => getPublicSeries(50),
  });

  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.authorName && s.authorName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [seriesList, selectedStatus, searchQuery]);

  return (
    <div className="min-h-screen pb-24">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-950/20 via-card/50 to-background border-b border-border/50 py-12 md:py-16 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <Crown size={14} />
                <span>Binge-Read Kitap Serileri</span>
              </div>
              <Typography variant="h1" className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                Sürükleyici Kitap Serileri
              </Typography>
              <Typography variant="body" className="text-muted text-sm md:text-base mt-3 leading-relaxed">
                Birbirine bağlı ciltler, destansı kurgular ve tek solukta bitirilecek kitap serileri. Birinci kitaptan son savaşa kadar kesintisiz macera.
              </Typography>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link href="/studio/series">
                <Button variant="primary" className="font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-black">
                  <PlusCircle size={16} />
                  <span>Kendi Serini Oluştur</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Arama Çubuğu */}
          <div className="mt-8 max-w-xl relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Seri adı, yazar veya evren ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/80 border border-border/80 focus:border-amber-500/60 rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:outline-none transition-colors shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* ── Durum Filtreleri & Liste ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 mt-8">
        {/* Durum Çipleri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {STATUS_FILTERS.map((filter) => {
            const isSelected = selectedStatus === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedStatus(filter.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-card/60 hover:bg-card border border-border/60 text-muted hover:text-foreground'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Seriler Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 size={32} className="animate-spin text-amber-500 mb-3" />
              <p className="text-xs text-muted">Seriler yükleniyor...</p>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="py-24 text-center rounded-3xl bg-card/40 border border-border/40 p-8 max-w-md mx-auto">
              <Layers size={40} className="text-muted/40 mx-auto mb-3" />
              <Typography variant="h3" className="font-bold text-base">Seri Bulunamadı</Typography>
              <Typography variant="body" className="text-muted text-xs mt-1">
                Arama kriterlerinize uygun kitap serisi bulunamadı.
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeries.map((series) => (
                <SeriesCard key={series.seriesId} series={series} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
