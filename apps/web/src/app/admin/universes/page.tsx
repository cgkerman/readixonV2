"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Typography, Button, ConfirmationDialog } from '@readixon/ui';
import { getAllUniverses, deleteUniverse, generateUniverseSlug, type Universe } from '@readixon/core';
import { 
  Globe, Search, ExternalLink, Trash2, 
  BookOpen, Layers 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUniversesPage() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [universeToDelete, setUniverseToDelete] = useState<Universe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = async () => {
    setLoading(true);
    try {
      const data = await getAllUniverses(200);
      setUniverses(data);
    } catch (err) {
      console.error('Evrenler alınamadı:', err);
      toast.error('Evrenler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!universeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUniverse(universeToDelete.universeId);
      setUniverses((prev) => prev.filter((u) => u.universeId !== universeToDelete.universeId));
      toast.success(`"${universeToDelete.title}" evreni silindi. Bağlı eserlerin evren bağı kaldırıldı.`);
      setUniverseToDelete(null);
    } catch (err) {
      console.error('Evren silme hatası:', err);
      toast.error('Evren silinirken hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUniverses = useMemo(() => {
    return universes.filter((u) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        u.title.toLowerCase().includes(term) ||
        u.universeId.toLowerCase().includes(term) ||
        u.authorId?.toLowerCase().includes(term) ||
        u.authorName?.toLowerCase().includes(term) ||
        u.authorUsername?.toLowerCase().includes(term) ||
        u.genre?.toLowerCase().includes(term)
      );
    });
  }, [universes, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ── 1. Başlık ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-purple-500/15 text-purple-400">
              <Globe size={22} />
            </span>
            <Typography variant="h2" className="font-bold text-2xl md:text-3xl text-foreground">
              Kurgusal Evrenler Yönetimi
            </Typography>
          </div>
          <Typography variant="body" className="text-muted text-sm">
            Platformdaki tüm kurgusal evrenleri listeleyin, inceleyin veya kural ihlali durumunda sistemden kaldırın.
          </Typography>
        </div>

        <div className="px-4 py-2 rounded-xl bg-card border border-border/50 text-xs font-bold text-muted">
          Toplam: <span className="text-foreground">{universes.length}</span> Evren
        </div>
      </div>

      {/* ── 2. Arama Çubuğu ── */}
      <div className="flex items-center gap-3 bg-card/40 border border-border/40 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Evren adı, ID, yazar adı, kullanıcı adı veya janr ile ara..."
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
                <th className="px-6 py-4 w-[36%]">Evren / ID</th>
                <th className="px-6 py-4 w-[22%]">Yazar</th>
                <th className="px-6 py-4 w-[16%]">Bağlı Eser / Seri</th>
                <th className="px-6 py-4 w-[14%]">Görünürlük</th>
                <th className="px-6 py-4 w-[12%] text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && universes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <Typography variant="body" className="text-muted text-sm">Yükleniyor...</Typography>
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
                          <div className="w-11 h-15 rounded-lg bg-card overflow-hidden border border-border/50 shrink-0 shadow-xs flex items-center justify-center">
                            {u.coverImage ? (
                              <img src={u.coverImage} alt={u.title} className="w-full h-full object-cover" />
                            ) : (
                              <Globe size={18} className="text-purple-400/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-foreground block truncate">
                              {u.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted block truncate mt-0.5">
                              ID: {u.universeId}
                            </span>
                            {u.genre && (
                              <span className="text-[10px] text-purple-400 block truncate">
                                {u.genre}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {u.authorName || 'İsimsiz Yazar'}
                        </span>
                        <span className="text-[11px] text-muted block truncate">
                          @{u.authorUsername || u.authorId.substring(0, 8)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted font-medium">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <BookOpen size={12} className="text-primary" />
                            {storyCount} Eser
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers size={12} className="text-amber-400" />
                            {seriesCount} Seri
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border inline-block ${
                            u.visibility === 'public'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : u.visibility === 'draft'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-muted/10 text-muted border-border/50'
                          }`}
                        >
                          {u.visibility === 'public' ? 'Açık' : u.visibility === 'draft' ? 'Taslak' : 'Liste Dışı'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/universe/${uSlug}`}
                            target="_blank"
                            title="Evren Sayfasını İncele"
                            className="p-2 rounded-xl bg-card border border-border/50 hover:border-primary/50 text-muted hover:text-foreground transition-all shadow-xs"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => setUniverseToDelete(u)}
                            title="Evreni Sil"
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
      {universeToDelete && (
        <ConfirmationDialog
          isOpen={true}
          title="Evreni Silmek İstediğinize Emin Misiniz?"
          message={`"${universeToDelete.title}" evreni silinecektir. DİKKAT: Evrene bağlı eserler ve seriler silinmez, yalnızca evren bağlantıları kaldırılır.`}
          confirmText="Evet, Evreni Sil"
          cancelText="İptal"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setUniverseToDelete(null)}
        />
      )}
    </div>
  );
}
