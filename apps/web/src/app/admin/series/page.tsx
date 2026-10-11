"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Button, ConfirmationDialog } from '@readixon/ui';
import { getAllSeries, deleteSeries, generateSeriesSlug, type Series } from '@readixon/core';
import { 
  Layers, Search, Eye, Heart, BookOpen, ExternalLink, 
  Trash2, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    setLoading(true);
    try {
      const data = await getAllSeries(200);
      setSeriesList(data);
    } catch (err) {
      console.error('Seriler alınamadı:', err);
      toast.error('Seriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!seriesToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSeries(seriesToDelete.seriesId);
      setSeriesList((prev) => prev.filter((s) => s.seriesId !== seriesToDelete.seriesId));
      toast.success(`"${seriesToDelete.title}" serisi silindi. Bağlı kitaplar seriden ayrıldı.`);
      setSeriesToDelete(null);
    } catch (err) {
      console.error('Seri silme hatası:', err);
      toast.error('Seri silinirken hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.title.toLowerCase().includes(term) ||
        s.seriesId.toLowerCase().includes(term) ||
        s.authorId?.toLowerCase().includes(term) ||
        s.authorName?.toLowerCase().includes(term) ||
        s.authorUsername?.toLowerCase().includes(term)
      );
    });
  }, [seriesList, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ── 1. Başlık ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500">
              <Layers size={22} />
            </span>
            <Typography variant="h2" className="font-bold text-2xl md:text-3xl text-foreground">
              Kitap Serileri Yönetimi
            </Typography>
          </div>
          <Typography variant="body" className="text-muted text-sm">
            Platformdaki tüm kitap serilerini listeleyin, inceleyin veya kural ihlali durumunda sistemden kaldırın.
          </Typography>
        </div>

        <div className="px-4 py-2 rounded-xl bg-card border border-border/50 text-xs font-bold text-muted">
          Toplam: <span className="text-foreground">{seriesList.length}</span> Seri
        </div>
      </div>

      {/* ── 2. Arama Çubuğu ── */}
      <div className="flex items-center gap-3 bg-card/40 border border-border/40 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Seri adı, seri ID, yazar adı veya ID ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border/30 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted/60"
          />
        </div>
      </div>

      {/* ── 3. Yönetim Tablosu ── */}
      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm text-xs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4 w-[36%]">Seri / ID</th>
                <th className="px-6 py-4 w-[22%]">Yazar</th>
                <th className="px-6 py-4 w-[14%]">Kitap Adedi</th>
                <th className="px-6 py-4 w-[16%]">İstatistikler</th>
                <th className="px-6 py-4 w-[12%] text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && seriesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <Typography variant="body" className="text-muted text-sm">Yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : filteredSeries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted text-sm">
                    Kayıtlı seri bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSeries.map((s) => {
                  const sSlug = s.slug || generateSeriesSlug(s.title, s.seriesId);
                  return (
                    <tr key={s.seriesId} className="hover:bg-card/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-15 rounded-lg bg-card overflow-hidden border border-border/50 shrink-0 shadow-xs flex items-center justify-center">
                            {s.coverImage ? (
                              <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
                            ) : (
                              <Layers size={18} className="text-muted/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-foreground block truncate">
                              {s.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted block truncate mt-0.5">
                              ID: {s.seriesId}
                            </span>
                            {s.universeTitle && (
                              <span className="text-[10px] text-muted block truncate">
                                🌌 {s.universeTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {s.authorName || 'İsimsiz Yazar'}
                        </span>
                        <span className="text-[11px] text-muted block truncate">
                          @{s.authorUsername || s.authorId.substring(0, 8)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/40 text-xs font-bold text-foreground">
                            {s.books?.length || 0} Kitap
                          </span>
                          <span className="text-[10px] font-bold text-muted">
                            ({s.status === 'completed' ? 'Bitti' : 'Sürüyor'})
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted font-medium">
                          <span className="flex items-center gap-1.5">
                            <Eye size={12} className="text-primary" />
                            {s.stats?.totalViews || 0}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Heart size={12} className="text-red-400" />
                            {s.stats?.totalLikes || 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/series/${sSlug}`}
                            target="_blank"
                            title="Seri Sayfasını İncele"
                            className="p-2 rounded-xl bg-card border border-border/50 hover:border-primary/50 text-muted hover:text-foreground transition-all shadow-xs"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => setSeriesToDelete(s)}
                            title="Seriyi Sil / Dağıt"
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-all shadow-xs cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* ── Silme Onay Modalı ── */}
      {seriesToDelete && (
        <ConfirmationDialog
          isOpen={true}
          title="Seriyi Silmek İstediğinize Emin Misiniz?"
          message={`"${seriesToDelete.title}" serisi silinecektir. DİKKAT: Serideki kitaplar ve bölümler silinmez, yalnızca seriden ayrılır.`}
          confirmText="Evet, Seriyi Sil"
          cancelText="İptal"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setSeriesToDelete(null)}
        />
      )}
    </div>
  );
}
