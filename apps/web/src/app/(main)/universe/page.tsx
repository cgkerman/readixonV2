'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  Globe, 
  Search, 
  Sparkles, 
  PlusCircle, 
  ArrowLeft,
  Filter,
  Compass,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicUniverses, type Universe, type UniverseGenre } from '@readixon/core';
import { UniverseCard } from '@/components/UniverseCard';

const GENRE_FILTERS: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'Tüm Evrenler', icon: '🌌' },
  { id: 'fantasy', label: 'Fantastik', icon: '🏰' },
  { id: 'sci-fi', label: 'Bilimkurgu', icon: '🚀' },
  { id: 'historical', label: 'Tarihi Kurgu', icon: '⚔️' },
  { id: 'dystopia', label: 'Distopya', icon: '🏙️' },
  { id: 'mythological', label: 'Mitolojik', icon: '⚡' },
  { id: 'hybrid', label: 'Hibrit', icon: '🔮' },
];

export default function ExploreUniversesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['universes', 'public', 'explore'],
    queryFn: () => getPublicUniverses(50),
  });

  const filteredUniverses = useMemo(() => {
    return universes.filter((u) => {
      const matchesGenre = selectedGenre === 'all' || u.genre === selectedGenre;
      const matchesSearch =
        searchQuery.trim() === '' ||
        u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.authorName && u.authorName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesGenre && matchesSearch;
    });
  }, [universes, selectedGenre, searchQuery]);

  return (
    <div className="min-h-screen pb-24">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-card/50 to-background border-b border-border/50 py-12 md:py-16 px-6 md:px-16">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-3">
                <Globe size={14} />
                <span>Kurgusal Evrenler Atlası</span>
              </div>
              <Typography variant="h1" className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                Sınırları Aşan Dünyalar
              </Typography>
              <Typography variant="body" className="text-muted text-sm md:text-base mt-3 leading-relaxed">
                Tek bir kitapla yetinmeyin. Karakter defterleri, interaktif dünya haritaları, soy ağaçları ve değişmez kanunlarıyla yaşayan kurgusal evrenleri keşfedin.
              </Typography>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link href="/studio/universes">
                <Button variant="primary" className="font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20">
                  <PlusCircle size={16} />
                  <span>Kendi Evrenini Kur</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Arama Çubuğu */}
          <div className="mt-8 max-w-xl relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Evren adı, yazar veya tema ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/80 border border-border/80 focus:border-primary/60 rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:outline-none transition-colors shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* ── Kategori / Tür Filtreleri & Liste ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 mt-8">
        {/* Tür Çipleri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {GENRE_FILTERS.map((filter) => {
            const isSelected = selectedGenre === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedGenre(filter.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-black shadow-sm'
                    : 'bg-card/60 hover:bg-card border border-border/60 text-muted hover:text-foreground'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Evrenler Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 size={32} className="animate-spin text-primary mb-3" />
              <p className="text-xs text-muted">Evrenler yükleniyor...</p>
            </div>
          ) : filteredUniverses.length === 0 ? (
            <div className="py-24 text-center rounded-3xl bg-card/40 border border-border/40 p-8 max-w-md mx-auto">
              <Globe size={40} className="text-muted/40 mx-auto mb-3" />
              <Typography variant="h3" className="font-bold text-base">Evren Bulunamadı</Typography>
              <Typography variant="body" className="text-muted text-xs mt-1">
                Arama kriterlerinize uygun açık bir kurgusal evren bulunamadı.
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniverses.map((universe) => (
                <UniverseCard key={universe.universeId} universe={universe} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
