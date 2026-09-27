"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getAdminStories, Story } from '@readixon/core';
import type { DocumentSnapshot } from 'firebase/firestore';
import { BookOpen, Search, Filter, Award, ChevronRight, Eye, Star } from 'lucide-react';
import Link from 'next/link';

export default function EditorStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed' | 'draft'>('all');

  useEffect(() => {
    loadInitialStories();
  }, []);

  const loadInitialStories = async () => {
    setLoading(true);
    const result = await getAdminStories(30);
    setStories(result.data);
    setLastDoc(result.lastDoc);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    const result = await getAdminStories(30, lastDoc);
    setStories((prev) => [...prev, ...result.data]);
    setLastDoc(result.lastDoc);
    setLoadingMore(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Devam Ediyor</span>;
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Tamamlandı</span>;
      case 'draft':
        return <span className="bg-muted/10 text-muted border border-border/50 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Taslak</span>;
      default:
        return <span className="bg-muted/10 text-muted border border-border/50 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch = 
        !searchTerm.trim() ||
        story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || story.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stories, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold text-2xl md:text-3xl">Hikayeler</Typography>
          <Typography variant="body" className="text-muted mt-1 text-sm">
            Platformdaki hikayeleri inceleyin, bölümlerin içeriklerini okuyun ve editör değerlendirmesi yapın.
          </Typography>
        </div>

        <Link href="/editor/reviews">
          <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5 self-start md:self-auto text-xs py-2">
            <Award size={15} /> Değerlendirmelerime Git
          </Button>
        </Link>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card/40 border border-border/40 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Hikaye başlığı, yazar veya etiket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border/30 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {(['all', 'ongoing', 'completed', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background hover:bg-card text-muted hover:text-foreground border border-border/30'
              }`}
            >
              {status === 'all' ? 'Tümü' : status === 'ongoing' ? 'Devam Eden' : status === 'completed' ? 'Tamamlanan' : 'Taslak'}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo Görünümü */}
      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[36%]">Hikaye</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Yazar</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[12%]">Durum</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[14%]">İstatistikler</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[18%] text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <Typography variant="body" className="text-muted">Hikayeler yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : filteredStories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted">
                    {searchTerm ? 'Aramanıza uygun hikaye bulunamadı.' : 'Kayıtlı hikaye bulunamadı.'}
                  </td>
                </tr>
              ) : (
                filteredStories.map((story) => (
                  <tr key={story.storyId} className="hover:bg-card/40 transition-colors group">
                    {/* Hikaye Bilgisi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/editor/stories/${story.storyId}`} className="shrink-0 block">
                          <div className="w-12 h-16 rounded-lg bg-card overflow-hidden border border-border/50 group-hover:border-primary/50 transition-colors shadow-sm">
                            {story.coverImage ? (
                              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted bg-card">
                                <BookOpen size={20} />
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/editor/stories/${story.storyId}`}>
                            <Typography variant="body" className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                              {story.title}
                            </Typography>
                          </Link>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {story.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] bg-muted/10 text-muted px-1.5 py-0.5 rounded">#{tag}</span>
                            ))}
                            {story.tags && story.tags.length > 3 && (
                              <span className="text-[10px] bg-muted/10 text-muted px-1.5 py-0.5 rounded">+{story.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Yazar Bilgisi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 overflow-hidden shrink-0">
                          {story.authorAvatarUrl ? (
                            <img src={story.authorAvatarUrl} alt={story.authorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-primary font-bold">
                              {story.authorName?.charAt(0) || 'Y'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Typography variant="body" className="font-semibold text-sm truncate">{story.authorName || 'Bilinmeyen Yazar'}</Typography>
                          {story.authorUsername && (
                            <Typography variant="caption" className="text-muted text-xs truncate">@{story.authorUsername}</Typography>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Durum */}
                    <td className="px-6 py-4">
                      {getStatusBadge(story.status)}
                    </td>

                    {/* İstatistikler */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs text-muted">
                        <span><strong className="text-foreground">{story.stats?.chapterCount || 0}</strong> Bölüm</span>
                        <span><strong className="text-foreground">{story.stats?.views?.toLocaleString() || 0}</strong> Okunma</span>
                        <span><strong className="text-foreground">{story.stats?.likes?.toLocaleString() || 0}</strong> Beğeni</span>
                      </div>
                    </td>

                    {/* İşlem Butonları */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/editor/reviews/new?storyId=${story.storyId}`}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                            title="Bu Hikayeyi Değerlendir"
                          >
                            <Award size={13} />
                            <span>Değerlendir</span>
                          </button>
                        </Link>

                        <Link href={`/editor/stories/${story.storyId}`}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card hover:bg-background border border-border/40 text-foreground transition-colors"
                            title="Bölümleri ve Detayları İncele"
                          >
                            <Eye size={13} />
                            <span>İncele</span>
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {lastDoc && (
          <div className="p-4 border-t border-border/50 flex justify-center bg-card/20">
            <Button variant="outline" onPress={loadMore} className="min-w-[200px] border-primary/20 text-primary hover:bg-primary/10">
              {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
