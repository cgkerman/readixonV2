'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button, Input } from '@readixon/ui';
import { 
  Layers, 
  PlusCircle, 
  BookOpen, 
  Eye, 
  Heart, 
  ChevronRight, 
  Search, 
  X, 
  Check, 
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  useAuthStore, 
  getSeriesByAuthorId, 
  createSeries, 
  POPULAR_TAGS, 
  type Series, 
  type SeriesStatus 
} from '@readixon/core';
import { toast } from 'sonner';

export default function StudioSeriesPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<SeriesStatus>('ongoing');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    loadSeries();
  }, [firebaseUser]);

  const loadSeries = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const data = await getSeriesByAuthorId(firebaseUser.uid);
      setSeriesList(data);
    } catch (error) {
      console.error('Seriler yüklenirken hata:', error);
      toast.error('Serileriniz yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Metrikler
  const { totalBooks, totalViews, totalLikes } = useMemo(() => {
    let books = 0;
    let views = 0;
    let likes = 0;

    seriesList.forEach((s) => {
      books += s.stats?.bookCount || s.books?.length || 0;
      views += s.stats?.totalViews || 0;
      likes += s.stats?.totalLikes || 0;
    });

    return { totalBooks: books, totalViews: views, totalLikes: likes };
  }, [seriesList]);

  // Filtrelenmiş Seriler
  const filteredSeries = useMemo(() => {
    return seriesList.filter((series) => {
      const matchesFilter =
        filterStatus === 'all' ? true : series.status === filterStatus;
      const matchesSearch =
        searchQuery.trim() === '' ||
        series.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [seriesList, filterStatus, searchQuery]);

  const toggleTag = (tagId: string) => {
    setNewTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCreate = async () => {
    if (!firebaseUser) {
      toast.error('Lütfen önce giriş yapın.');
      return;
    }

    if (!newTitle.trim()) {
      toast.error('Lütfen serinize bir başlık verin.');
      return;
    }

    setIsCreating(true);
    try {
      const newSeriesId = await createSeries(firebaseUser.uid, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: newStatus,
        tags: newTags,
      });

      toast.success('Seri başarıyla oluşturuldu!');
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewTags([]);
      router.push(`/studio/series/${newSeriesId}`);
    } catch (error) {
      console.error('Seri oluşturma hatası:', error);
      toast.error('Seri oluşturulamadı.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full relative">
      {/* ── 1. Üst Başlık & Aksiyon ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Kitap Serilerim
            </Typography>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/25">
              {seriesList.length} Seri
            </span>
          </div>
          <Typography variant="body" className="text-muted text-xs sm:text-sm mt-1">
            Devam kitaplarınızı, üçlemelerinizi ve kurgusal serilerinizi tek çatı altında toplayın.
          </Typography>
        </div>

        <Button
          variant="primary"
          onPress={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl shadow-lg shadow-primary/20 font-bold text-sm shrink-0 active:scale-95 transition-transform"
        >
          <PlusCircle size={18} />
          <span>Yeni Seri Başlat</span>
        </Button>
      </div>

      {/* ── 2. Metrik Şeridi ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Seri</span>
            <span className="text-base sm:text-lg font-black text-foreground">{seriesList.length}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Serileşmiş Kitap</span>
            <span className="text-base sm:text-lg font-black text-foreground">{totalBooks}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Eye size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Okunma</span>
            <span className="text-base sm:text-lg font-black text-foreground">
              {totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'B' : totalViews}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <Heart size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Beğeni</span>
            <span className="text-base sm:text-lg font-black text-foreground">{totalLikes}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Arama & Filtreleme ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Seri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/60 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-card/60 border border-border/50 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterStatus('ongoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'ongoing'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Devam Eden
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'completed'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Tamamlanan
          </button>
        </div>
      </div>

      {/* ── 4. Seri Listesi ── */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <Typography variant="body" className="text-muted text-sm">Serileriniz yükleniyor...</Typography>
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-card/40 border border-border/50 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-inner">
            <Layers size={28} />
          </div>
          <Typography variant="h3" className="font-bold text-lg mb-2">
            {searchQuery ? 'Aramanıza uygun seri bulunamadı.' : 'Henüz bir kitap serisi oluşturmadınız.'}
          </Typography>
          <Typography variant="body" className="text-muted text-xs sm:text-sm max-w-md mb-6">
            Yazdığınız devam kitaplarını (Kitap 1, Kitap 2...) veya çok ciltli kurgularınızı serileştirerek okuyucu sadakatini katlayın.
          </Typography>
          {!searchQuery && (
            <Button variant="primary" onPress={() => setIsModalOpen(true)} className="rounded-xl font-bold text-sm">
              İlk Serinizi Başlatın
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSeries.map((series) => {
            const bookCount = series.books?.length || 0;
            return (
              <div
                key={series.seriesId}
                onClick={() => router.push(`/studio/series/${series.seriesId}`)}
                className="group relative rounded-2xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Üst Görsel / Afiş Şeridi */}
                <div className="h-28 w-full bg-gradient-to-tr from-primary/20 via-primary/5 to-card relative overflow-hidden flex items-center justify-center">
                  {series.coverImage ? (
                    <img
                      src={series.coverImage}
                      alt={series.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-primary/40">
                      <Layers size={36} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                  {/* Durum Rozeti */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md ${
                      series.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {series.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                  </span>
                </div>

                {/* İçerik */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Typography variant="h3" className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {series.title}
                    </Typography>
                    <Typography variant="body" className="text-muted text-xs line-clamp-2 mt-1.5 leading-relaxed">
                      {series.description || 'Henüz bir açıklama eklenmedi.'}
                    </Typography>
                  </div>

                  {/* İstatistikler & Buton */}
                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <BookOpen size={13} className="text-primary" />
                        {bookCount} Kitap
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={13} />
                        {series.stats?.totalViews || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-primary text-xs font-bold group-hover:translate-x-1 transition-transform">
                      <span>Yönet</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Yeni Seri Oluştur Modalı ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-muted hover:text-foreground p-1 rounded-full hover:bg-muted/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Layers size={20} />
              </div>
              <div>
                <Typography variant="h3" className="font-bold text-lg">Yeni Seri Başlat</Typography>
                <Typography variant="body" className="text-muted text-xs">Birden fazla kitabı birbirine bağlayacak kurgusal seriniz.</Typography>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1.5">Seri Başlığı *</label>
                <input
                  type="text"
                  placeholder="Örn: Gölge Krallığı Serisi, Kızıl Pelerin Üçlemesi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1.5">Seri Açıklaması / Evren Özeti</label>
                <textarea
                  rows={3}
                  placeholder="Bu serinin kurgusal konusu, okuma sırası veya ana teması hakkında kısa bir özet..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/60 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1.5">Seri Durumu</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('ongoing')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newStatus === 'ongoing'
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                        : 'border-border/60 text-muted hover:bg-muted/5'
                    }`}
                  >
                    Devam Ediyor
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('completed')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newStatus === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'border-border/60 text-muted hover:bg-muted/5'
                    }`}
                  >
                    Tamamlandı
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1.5">Tür Etiketleri</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-background/50 rounded-xl border border-border/40">
                  {POPULAR_TAGS.filter((t) => t.id !== 'webtoon' && t.id !== 'adult').slice(0, 15).map((t) => {
                    const isSelected = newTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'bg-card text-muted hover:text-foreground border border-border/50'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button variant="ghost" onPress={() => setIsModalOpen(false)} className="text-xs">
                  Vazgeç
                </Button>
                <Button
                  variant="primary"
                  onPress={handleCreate}
                  disabled={isCreating}
                  className="font-bold text-xs px-5 py-2.5"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" />
                      Oluşturuluyor...
                    </span>
                  ) : (
                    'Seriyi Oluştur'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
