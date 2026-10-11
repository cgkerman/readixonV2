'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  ArrowLeft, 
  Layers, 
  Save, 
  BookOpen, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  ExternalLink, 
  Check, 
  Loader2, 
  Sparkles, 
  X,
  Upload,
  AlertTriangle,
  Eye,
  Heart
} from 'lucide-react';
import { 
  useAuthStore, 
  getSeriesById, 
  updateSeries, 
  deleteSeries, 
  addStoryToSeries, 
  removeStoryFromSeries, 
  reorderStoriesInSeries,
  getStoryById,
  subscribeToAuthorStories,
  getUniversesByAuthorId,
  linkSeriesToUniverse,
  unlinkSeriesFromUniverse,
  type Series, 
  type SeriesStatus, 
  type Story,
  type Universe 
} from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { toast } from 'sonner';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;
  const { firebaseUser } = useAuthStore();

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form alanları
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<SeriesStatus>('ongoing');
  const [tags, setTags] = useState<string[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);

  // Serideki kitapların detaylı Story nesneleri
  const [linkedStories, setLinkedStories] = useState<{ story: Story; order: number; customLabel?: string }[]>([]);
  const [authorStories, setAuthorStories] = useState<Story[]>([]);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [selectedStoryToAdd, setSelectedStoryToAdd] = useState<string>('');
  const [addCustomLabel, setAddCustomLabel] = useState<string>('');

  // Evrenler
  const [authorUniverses, setAuthorUniverses] = useState<Universe[]>([]);
  const [selectedUniverseId, setSelectedUniverseId] = useState<string>('');

  useEffect(() => {
    if (!seriesId || !firebaseUser) return;
    loadData();
  }, [seriesId, firebaseUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await getSeriesById(seriesId);
      if (!s) {
        toast.error('Seri bulunamadı.');
        router.push('/studio/series');
        return;
      }

      setSeries(s);
      setTitle(s.title || '');
      setDescription(s.description || '');
      setCoverImage(s.coverImage || '');
      setStatus(s.status || 'ongoing');
      setTags(s.tags || []);
      setSelectedUniverseId(s.universeId || '');

      // Serideki kitapların detaylarını çek
      if (s.books && s.books.length > 0) {
        const sortedBooks = [...s.books].sort((a, b) => a.order - b.order);
        const storyPromises = sortedBooks.map(async (item) => {
          const storyData = await getStoryById(item.storyId);
          return {
            story: storyData || ({ storyId: item.storyId, title: 'Bilinmeyen Eser' } as Story),
            order: item.order,
            customLabel: item.customLabel,
          };
        });
        const resolved = await Promise.all(storyPromises);
        setLinkedStories(resolved);
      } else {
        setLinkedStories([]);
      }

      // Yazarın tüm hikayelerini ve evrenlerini çek
      if (firebaseUser) {
        const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (stories) => {
          setAuthorStories(stories.filter((st) => st.format !== 'webtoon'));
        });
        const universes = await getUniversesByAuthorId(firebaseUser.uid);
        setAuthorUniverses(universes);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Seri bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  // Seride henüz bulunmayan kitaplar
  const availableStoriesToAdd = useMemo(() => {
    const linkedIds = new Set(linkedStories.map((ls) => ls.story.storyId));
    return authorStories.filter((st) => !linkedIds.has(st.storyId));
  }, [authorStories, linkedStories]);

  // Bilgileri kaydet
  const handleSaveDetails = async () => {
    if (!title.trim()) {
      toast.error('Seri başlığı boş olamaz.');
      return;
    }

    setSaving(true);
    try {
      await updateSeries(seriesId, {
        title: title.trim(),
        description: description.trim(),
        coverImage,
        status,
        tags,
      });

      // Evren bağlantısı güncellendiyse
      if (series) {
        if (selectedUniverseId && selectedUniverseId !== series.universeId) {
          await linkSeriesToUniverse(selectedUniverseId, seriesId);
        } else if (!selectedUniverseId && series.universeId) {
          await unlinkSeriesFromUniverse(series.universeId, seriesId);
        }
      }

      toast.success('Seri bilgileri güncellendi.');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  // Kapak resmi yükle
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    setCoverUploading(true);
    try {
      const path = `series/${seriesId}/cover_${Date.now()}`;
      const downloadUrl = await uploadFile(file, path);
      setCoverImage(downloadUrl);
      await updateSeries(seriesId, { coverImage: downloadUrl });
      toast.success('Kapak görseli yüklendi.');
    } catch (error) {
      console.error('Kapak yükleme hatası:', error);
      toast.error('Kapak resmi yüklenemedi.');
    } finally {
      setCoverUploading(false);
    }
  };

  // Seriye kitap ekle
  const handleAddBook = async () => {
    if (!selectedStoryToAdd) {
      toast.error('Lütfen eklenecek bir kitap seçin.');
      return;
    }

    try {
      await addStoryToSeries(seriesId, selectedStoryToAdd, addCustomLabel.trim() || undefined);
      toast.success('Kitap seriye eklendi!');
      setIsAddBookModalOpen(false);
      setSelectedStoryToAdd('');
      setAddCustomLabel('');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Kitap seriye eklenemedi.');
    }
  };

  // Seriden kitap çıkar
  const handleRemoveBook = async (storyId: string, storyTitle: string) => {
    const confirmed = window.confirm(`"${storyTitle}" kitabını seriden çıkarmak istediğinize emin misiniz? (Kitap silinmez, yalnızca seriden ayrılır)`);
    if (!confirmed) return;

    try {
      await removeStoryFromSeries(seriesId, storyId);
      toast.success('Kitap seriden ayrıldı.');
      await loadData();
    } catch (error) {
      toast.error('Kitap seriden çıkarılamadı.');
    }
  };

  // Sıralama Değiştir (Yukarı / Aşağı)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === linkedStories.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...linkedStories];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setLinkedStories(newItems);

    const reorderedPayload = newItems.map((item) => ({
      storyId: item.story.storyId,
      customLabel: item.customLabel,
    }));

    try {
      await reorderStoriesInSeries(seriesId, reorderedPayload);
      toast.success('Sıralama güncellendi.');
    } catch (error) {
      toast.error('Sıralama kaydedilemedi.');
      await loadData();
    }
  };

  // Seriyi Sil
  const handleDeleteSeries = async () => {
    const confirmed = window.confirm(
      'Bu seriyi silmek istediğinize emin misiniz? Seriye bağlı kitaplar silinmez, yalnızca seriden ayrılır.'
    );
    if (!confirmed) return;

    try {
      await deleteSeries(seriesId);
      toast.success('Seri silindi.');
      router.push('/studio/series');
    } catch (error) {
      toast.error('Seri silinemedi.');
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <Typography variant="body" className="text-muted text-sm">Seri detayları yükleniyor...</Typography>
      </div>
    );
  }

  if (!series) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-20">
      {/* ── Üst Başlık & Geri Dön ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/studio/series"
          className="flex items-center gap-2 text-muted hover:text-foreground text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Serilerime Dön</span>
        </Link>

        <Button
          variant="primary"
          onPress={handleSaveDetails}
          disabled={saving}
          className="flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs shadow-md"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
        </Button>
      </div>

      {/* ── İki Sütunlu Düzen ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Sütun: Seri Bilgileri ve Kapak */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm space-y-5">
            {/* Kapak Yükleme */}
            <div>
              <label className="text-xs font-bold text-muted block mb-2">Seri Afişi / Kapağı</label>
              <div className="relative aspect-[3/4] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden bg-background/80 border border-border/60 group shadow-md flex items-center justify-center">
                {coverImage ? (
                  <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted p-4 text-center">
                    <Layers size={36} className="text-primary/40" />
                    <span className="text-[11px] leading-tight">Seriye özel bir ortak afiş veya kapak yükleyin</span>
                  </div>
                )}

                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-1.5 p-2 text-center">
                  <Upload size={22} />
                  <span className="text-xs font-bold">Kapağı Değiştir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={coverUploading}
                  />
                </label>

                {coverUploading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 size={24} className="text-primary animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Durum */}
            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Durum</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('ongoing')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    status === 'ongoing'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'border-border/60 text-muted hover:bg-muted/5'
                  }`}
                >
                  Devam Ediyor
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'border-border/60 text-muted hover:bg-muted/5'
                  }`}
                >
                  Tamamlandı
                </button>
              </div>
            </div>

            {/* Evren Bağlantısı */}
            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Bağlı Olduğu Evren</label>
              <select
                value={selectedUniverseId}
                onChange={(e) => setSelectedUniverseId(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              >
                <option value="">Evren Bağlantısı Yok (Bağımsız)</option>
                {authorUniverses.map((u) => (
                  <option key={u.universeId} value={u.universeId}>
                    🌌 {u.title}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-muted block mt-1">
                Bu seriyi kurgusal bir evrene bağlayarak karakter ve dünya kurallarını ortaklaştırabilirsiniz.
              </span>
            </div>
          </div>

          {/* Tehlike Bölgesi */}
          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-destructive block">Seriyi Sil</span>
              <span className="text-[10px] text-muted">Kitaplar silinmez, yalnızca seriden ayrılır.</span>
            </div>
            <button
              onClick={handleDeleteSeries}
              className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              title="Seriyi Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Sağ Sütun: Seri Başlığı, Açıklama ve Kitap Sıralaması */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seri Başlığı & Açıklaması */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Seri Başlığı *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Seri Açıklaması</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Serinin konusu, okuma sırası veya evren özeti..."
                className="w-full bg-background border border-border/60 rounded-xl p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Serinin Kitapları ve Okuma Sırası */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Typography variant="h3" className="font-bold text-base sm:text-lg">
                    Serinin Kitapları ve Okuma Sırası
                  </Typography>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {linkedStories.length} Kitap
                  </span>
                </div>
                <Typography variant="body" className="text-muted text-xs mt-0.5">
                  Okuyucunun seriyi hangi sırayla okuyacağını belirleyin.
                </Typography>
              </div>

              <Button
                variant="primary"
                onPress={() => setIsAddBookModalOpen(true)}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs"
              >
                <Plus size={15} />
                <span>Kitap Ekle</span>
              </Button>
            </div>

            {/* Kitap Sıralı Listesi */}
            {linkedStories.length === 0 ? (
              <div className="p-8 rounded-2xl bg-background/50 border border-border/40 text-center flex flex-col items-center justify-center">
                <BookOpen size={32} className="text-muted/40 mb-2" />
                <Typography variant="body" className="text-muted text-xs sm:text-sm max-w-sm mb-4">
                  Bu seride henüz kitap yok. Yazdığınız kitapları seriye bağlayarak sıralayın.
                </Typography>
                <Button
                  variant="primary"
                  onPress={() => setIsAddBookModalOpen(true)}
                  className="rounded-xl text-xs font-bold"
                >
                  İlk Kitabı Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {linkedStories.map((item, idx) => {
                  const st = item.story;
                  return (
                    <div
                      key={st.storyId}
                      className="p-3 sm:p-4 rounded-2xl bg-background/60 hover:bg-background border border-border/50 transition-all flex items-center justify-between gap-3 group"
                    >
                      {/* Sıra & Kapak */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Sıra Numarası Rozeti */}
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>

                        {/* Kapak Önizleme */}
                        <div className="w-10 h-14 rounded-lg bg-card border border-border/50 overflow-hidden shrink-0">
                          {st.coverImage ? (
                            <img src={st.coverImage} alt={st.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>

                        {/* Kitap Başlığı ve Etiket */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Typography variant="body" className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {st.title}
                            </Typography>
                            {item.customLabel && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                {item.customLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                            <span>{st.stats?.chapterCount || 0} Bölüm</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye size={11} /> {st.stats?.views || 0}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Heart size={11} /> {st.stats?.likes || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Aksiyonlar (Yukarı / Aşağı / Düzenle / Çıkar) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Sıralama Okları */}
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-muted hover:text-foreground disabled:opacity-20 hover:bg-muted/10 transition-colors"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'down')}
                          disabled={idx === linkedStories.length - 1}
                          className="p-1.5 rounded-lg text-muted hover:text-foreground disabled:opacity-20 hover:bg-muted/10 transition-colors"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown size={16} />
                        </button>

                        {/* Stüdyoda Aç */}
                        <Link
                          href={`/studio/story/${st.storyId}`}
                          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors ml-1"
                          title="Kitap Stüdyosunu Aç"
                        >
                          <ExternalLink size={16} />
                        </Link>

                        {/* Seriden Çıkar */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBook(st.storyId, st.title)}
                          className="p-1.5 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Seriden Çıkar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Seriye Kitap Ekle Modalı ── */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsAddBookModalOpen(false)}
              className="absolute top-5 right-5 text-muted hover:text-foreground p-1 rounded-full hover:bg-muted/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              <div>
                <Typography variant="h3" className="font-bold text-lg">Seriye Kitap Ekle</Typography>
                <Typography variant="body" className="text-muted text-xs">Mevcut kitaplarınızdan birini bu seriye bağlayın.</Typography>
              </div>
            </div>

            {availableStoriesToAdd.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-muted mb-4">
                  Seriye eklenebilecek uygun kitap bulunamadı. (Tüm kitaplarınız zaten seriye eklenmiş olabilir veya henüz başka kitabınız yok).
                </p>
                <Button variant="ghost" onPress={() => setIsAddBookModalOpen(false)} className="text-xs">
                  Kapat
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1.5">Kitap Seçin *</label>
                  <select
                    value={selectedStoryToAdd}
                    onChange={(e) => setSelectedStoryToAdd(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  >
                    <option value="">Bir kitap seçin...</option>
                    {availableStoriesToAdd.map((st) => (
                      <option key={st.storyId} value={st.storyId}>
                        📖 {st.title} ({st.stats?.chapterCount || 0} Bölüm)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1.5">Özel Sıra Etiketi (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: 1. Kitap, Başlangıç Cildi, Prequel"
                    value={addCustomLabel}
                    onChange={(e) => setAddCustomLabel(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  <span className="text-[10px] text-muted block mt-1">
                    Boş bırakırsanız otomatik olarak #{linkedStories.length + 1}. Kitap sayılacaktır.
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <Button variant="ghost" onPress={() => setIsAddBookModalOpen(false)} className="text-xs">
                    Vazgeç
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleAddBook}
                    className="font-bold text-xs px-5 py-2.5"
                  >
                    Seriye Ekle
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
