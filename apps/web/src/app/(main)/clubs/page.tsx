'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  Feather, 
  BookOpen, 
  Sparkles,
  Flame,
  Compass,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Button } from '@readixon/ui';
import { getClubs, useAuthStore, type Club } from '@readixon/core';
import { ClubCard } from '@/components/clubs/ClubCard';
import { CreateClubModal } from '@/components/clubs/CreateClubModal';

const GENRE_TAGS = [
  'Tümü',
  'Resmi Yazar Kulüpleri',
  'Bilim Kurgu',
  'Fantastik',
  'Polisiye & Gizem',
  'Korku / Gerilim',
  'Klasikler',
  'Distopya',
];

export default function ClubsExplorePage() {
  const { firebaseUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tümü');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: clubs = [], isLoading, refetch } = useQuery({
    queryKey: ['clubs', 'list'],
    queryFn: () => getClubs({ limitCount: 60 }),
  });

  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.creatorName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedTag === 'Tümü') return true;
      if (selectedTag === 'Resmi Yazar Kulüpleri') return c.isAuthorOfficial;
      return c.tags?.includes(selectedTag);
    });
  }, [clubs, searchQuery, selectedTag]);

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
                <Users size={14} />
                <span>Readixon Kitap Kulüpleri</span>
              </div>
              <Typography variant="h1" className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                Birlikte Oku, Keşfet, Yaşa.
              </Typography>
              <Typography variant="body" className="text-muted text-sm md:text-base mt-3 leading-relaxed">
                Kitaplar yalnız okunmak zorunda değil. Ortak okuma hedefleri belirleyin, spoiler korumalı odalarda teorilerinizi paylaşın ve doğrudan yazarlarla canlı soru-cevap oturumlarına katılın.
              </Typography>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Button
                variant="primary"
                onPress={() => setIsCreateModalOpen(true)}
                className="font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
              >
                <PlusCircle size={16} />
                <span>Kulüp Kur</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/40">
            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-muted block">Aktif Kulüpler</span>
              <span className="text-xl font-black text-foreground mt-0.5 block">{clubs.length} Topluluk</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-muted block">Resmi Yazar Odaları</span>
              <span className="text-xl font-black text-amber-500 mt-0.5 block">
                {clubs.filter((c) => c.isAuthorOfficial).length} Kulüp
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-muted block">Okuma Seferleri</span>
              <span className="text-xl font-black text-primary mt-0.5 block">Canlı & Zamanlı</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-muted block">Spoiler Koruması</span>
              <span className="text-xl font-black text-foreground mt-0.5 block">Bölüm Eşikli 🔒</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filter Section ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 pt-8 pb-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kulüp adı, yazar veya açıklama ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground text-xs focus:border-primary focus:outline-none transition-colors shadow-sm"
            />
            <Search size={15} className="absolute left-3.5 top-3 text-muted" />
          </div>

          {/* Genre & Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {GENRE_TAGS.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-black font-bold shadow-md shadow-primary/20'
                      : 'bg-card text-muted hover:text-foreground border border-border/60'
                  }`}
                >
                  {tag === 'Resmi Yazar Kulüpleri' && <Feather size={12} className="inline mr-1" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Clubs Grid ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <span className="text-xs font-medium text-muted">Kulüpler yükleniyor...</span>
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-card border border-border/80 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Henüz Kulüp Bulunamadı</h3>
              <p className="text-xs text-muted mt-1">
                Aramanıza uygun bir kulüp yok veya henüz bu kategoride bir kulüp kurulmadı.
              </p>
            </div>
            <Button
              variant="primary"
              onPress={() => setIsCreateModalOpen(true)}
              className="text-xs font-bold px-5 py-2.5 rounded-2xl shadow-md"
            >
              İlk Kulübü Sen Kur
            </Button>
          </div>
        )}
      </section>

      {/* ── Create Club Modal ── */}
      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
