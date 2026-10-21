"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { getAllUniverses, generateUniverseSlug, getUniverseGenreLabel, type Universe } from '@readixon/core';
import { 
  Globe, Search, ExternalLink, LayoutTemplate, 
  BookOpen, Sparkles, Layers, ShieldCheck, Eye 
} from 'lucide-react';

export default function EditorUniversesPage() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'draft' | 'unlisted'>('all');

  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = async () => {
    setLoading(true);
    try {
      const data = await getAllUniverses(100);
      setUniverses(data);
    } catch (err) {
      console.error('Evrenler yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniverses = useMemo(() => {
    return universes.filter((u) => {
      const matchesSearch =
        !searchTerm.trim() ||
        u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.genre?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVisibility = visibilityFilter === 'all' || u.visibility === visibilityFilter;

      return matchesSearch && matchesVisibility;
    });
  }, [universes, searchTerm, visibilityFilter]);

  const publicCount = universes.filter((u) => u.visibility === 'public').length;
  const draftCount = universes.filter((u) => u.visibility === 'draft').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ── 1. Başlık & Aksiyon ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-purple-500/15 text-purple-400">
              <Globe size={22} />
            </span>
            <Typography variant="h2" className="font-bold text-2xl md:text-3xl text-foreground">
              Kurgusal Evrenler
            </Typography>
          </div>
          <Typography variant="body" className="text-muted text-sm">
            Yazarların inşa ettiği çoklu eser evrenlerini, ansiklopedi kayıtlarını inceleyin ve platform vitrinine taşıyın.
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
          <span className="text-xs font-bold text-muted block mb-1">Toplam Evren</span>
          <span className="text-2xl sm:text-3xl font-black text-foreground">{universes.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs font-bold text-emerald-400 block mb-1">Herkese Açık Evrenler</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{publicCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs font-bold text-amber-400 block mb-1">Taslak / Özel Evrenler</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">{draftCount}</span>
        </div>
      </div>

      {/* ── 3. Arama ve Filtreler ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card/40 border border-border/40 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Evren başlığı, yazar, kullanıcı adı veya janr ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border/30 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {(['all', 'public', 'draft', 'unlisted'] as const).map((vb) => (
            <button
              key={vb}
              onClick={() => setVisibilityFilter(vb)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                visibilityFilter === vb
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background hover:bg-card text-muted hover:text-foreground border border-border/30'
              }`}
            >
              {vb === 'all' ? 'Tümü' : vb === 'public' ? 'Herkese Açık' : vb === 'draft' ? 'Taslak' : 'Liste Dışı'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Evrenler Tablosu ── */}
      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm text-xs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4 w-[38%]">Evren Bilgisi</th>
                <th className="px-6 py-4 w-[20%]">Yazar</th>
                <th className="px-6 py-4 w-[16%]">Bağlı Eser & Seri</th>
                <th className="px-6 py-4 w-[14%]">Görünürlük</th>
                <th className="px-6 py-4 w-[12%] text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && universes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <Typography variant="body" className="text-muted text-sm">Evrenler yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : filteredUniverses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted text-sm">
                    Kayıtlı evren bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUniverses.map((u) => {
                  const uSlug = u.slug || generateUniverseSlug(u.title, u.universeId);
                  const storyCount = u.connectedStoryIds?.length || 0;
                  const seriesCount = u.connectedSeriesIds?.length || 0;

                  return (
                    <tr key={u.universeId} className="hover:bg-card/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-16 rounded-xl bg-card overflow-hidden border border-border/50 group-hover:border-primary/50 transition-colors shrink-0 shadow-xs flex items-center justify-center">
                            {u.coverImage ? (
                              <img src={u.coverImage} alt={u.title} className="w-full h-full object-cover" />
                            ) : (
                              <Globe size={22} className="text-purple-400/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {u.title}
                              </span>
                            </div>
                            {u.genre && (
                              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded inline-block mb-1">
                                {getUniverseGenreLabel(u.genre)}
                              </span>
                            )}
                            <p className="text-xs text-muted line-clamp-1">
                              {u.description || 'Kurgusal açıklama girilmemiş.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-400 shrink-0 overflow-hidden">
                            {u.authorAvatarUrl ? (
                              <img src={u.authorAvatarUrl} alt={u.authorName} className="w-full h-full object-cover" />
                            ) : (
                              (u.authorName || 'Y').substring(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">
                              {u.authorName || 'İsimsiz Yazar'}
                            </span>
                            {u.authorUsername && (
                              <span className="text-[11px] text-muted block truncate">
                                @{u.authorUsername}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs font-semibold text-muted">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <BookOpen size={13} className="text-primary" />
                            {storyCount} Eser
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers size={13} className="text-amber-400" />
                            {seriesCount} Seri
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border inline-block ${
                            u.visibility === 'public'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : u.visibility === 'draft'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-muted/10 text-muted border-border/50'
                          }`}
                        >
                          {u.visibility === 'public' ? 'Herkese Açık' : u.visibility === 'draft' ? 'Taslak' : 'Liste Dışı'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/universe/${uSlug}`}
                            target="_blank"
                            title="Evren Sayfasını Gör"
                            className="p-2 rounded-xl bg-card border border-border/50 hover:border-primary/50 text-muted hover:text-foreground transition-all shadow-xs"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <Link
                            href={`/editor/hero/create?title=${encodeURIComponent(u.title)}&summary=${encodeURIComponent(u.description || '')}&badge=${encodeURIComponent('Büyük Kurgusal Evren')}&link=${encodeURIComponent(`/universe/${uSlug}`)}&imageUrl=${encodeURIComponent(u.coverImage || '')}`}
                            title="Ana Sayfa Manşetine Taşı"
                            className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500 text-purple-400 hover:text-white transition-all shadow-xs"
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
