'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input, PaywallModal } from '@readixon/ui';
import { 
  PlusCircle, 
  FileText, 
  X, 
  BookOpen, 
  Sparkles, 
  Wand2, 
  ChevronRight, 
  Info, 
  Eye, 
  Heart, 
  Plus,
  Layers,
  Search,
  Check,
  PenTool
} from 'lucide-react';
import { subscribeToAuthorStories, createStory, useAuthStore, POPULAR_TAGS, type Story } from '@readixon/core';
import { toast } from "sonner";

export default function StudioDashboard() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationMode, setCreationMode] = useState<'wizard' | 'classic'>('wizard');

  useEffect(() => {
    if (!firebaseUser) return;
    
    setLoading(true);
    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      const novels = updatedStories.filter(s => s.format !== 'webtoon');
      setStories(novels);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  // Metrikler
  const { totalViews, totalChapters, totalLikes, publishedCount, draftCount } = useMemo(() => {
    let views = 0;
    let chapters = 0;
    let likes = 0;
    let pub = 0;
    let draft = 0;

    stories.forEach(s => {
      views += s.stats?.views || 0;
      chapters += s.stats?.chapterCount || 0;
      likes += s.stats?.likes || 0;
      if (s.status === 'ongoing' || s.status === 'completed') {
        pub++;
      } else {
        draft++;
      }
    });

    return {
      totalViews: views,
      totalChapters: chapters,
      totalLikes: likes,
      publishedCount: pub,
      draftCount: draft
    };
  }, [stories]);

  // Filtrelenmiş Hikayeler
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesFilter = 
        filterStatus === 'all' 
          ? true 
          : filterStatus === 'published' 
            ? (story.status === 'ongoing' || story.status === 'completed')
            : story.status === 'draft';

      const matchesSearch = searchQuery.trim() === '' || 
        story.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [stories, filterStatus, searchQuery]);

  const toggleTag = (tagId: string) => {
    setNewTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const availableTags = useMemo(() => {
    return POPULAR_TAGS.filter(t => t.id !== 'webtoon' && t.id !== 'adult');
  }, []);

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    const q = tagSearch.toLowerCase().trim();
    return availableTags.filter(t => t.label.toLowerCase().includes(q));
  }, [availableTags, tagSearch]);

  const handleCreateNew = async (useWizard: boolean) => {
    if (!firebaseUser) {
      toast.error("Lütfen önce giriş yapın.");
      return;
    }

    if (!newTitle.trim()) {
      toast.error("Lütfen hikayenize bir isim/başlık verin.");
      return;
    }
    
    const userProfile = useAuthStore.getState().userProfile;
    
    // Paywall check
    if (useWizard) {
      if (userProfile?.status !== 'premium' && userProfile?.hasUsedFreeWizard) {
        setIsPaywallOpen(true);
        return;
      }
    }

    setIsCreating(true);
    try {
      const newStoryId = await createStory(firebaseUser.uid, {
        title: newTitle.trim(),
        summary: '',
        coverImage: '',
        tags: newTags,
        isAdultContent,
        status: 'draft'
      });

      if (useWizard && !userProfile?.hasUsedFreeWizard) {
        try {
          const { consumeFreeWizard } = await import('@readixon/core');
          await consumeFreeWizard(firebaseUser.uid);
        } catch (wizardErr) {
          console.error("consumeFreeWizard failed:", wizardErr);
        }
      }

      setIsModalOpen(false);
      setNewTitle('');
      setNewTags([]);
      setTagSearch('');
      
      if (useWizard) {
        router.push(`/studio/story/${newStoryId}/planner`);
      } else {
        router.push(`/studio/story/${newStoryId}`);
      }
    } catch (error) {
      console.error("handleCreateNew failed:", error);
      toast.error("Hikaye oluşturulamadı.");
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full relative">
      
      {/* ── 1. Üst Başlık & Aksiyon Alanı ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Hikayelerim
            </Typography>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/25">
              {stories.length} Eser
            </span>
          </div>
          <Typography variant="body" className="text-muted text-xs sm:text-sm mt-1">
            Taslaklarınızı düzenleyin, bölümlerinizi planlayın ve okurlarla buluşturun.
          </Typography>
        </div>

        <Button 
          variant="primary" 
          onPress={() => setIsModalOpen(true)} 
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl shadow-lg shadow-primary/20 font-bold text-sm shrink-0 active:scale-95 transition-transform"
        >
          <PlusCircle size={18} />
          <span>Yeni Hikaye Oluştur</span>
        </Button>
      </div>

      {/* ── 2. Yazar Hızlı Gösterge Paneli (Quick Insights Strip) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        {/* Toplam Okunma */}
        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Eye size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Okunma</span>
            <span className="text-base sm:text-lg font-black text-foreground">
              {totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'B' : totalViews}
            </span>
          </div>
        </div>

        {/* Toplam Bölüm */}
        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Bölüm</span>
            <span className="text-base sm:text-lg font-black text-foreground">{totalChapters}</span>
          </div>
        </div>

        {/* Toplam Beğeni */}
        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
            <Heart size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Beğeni</span>
            <span className="text-base sm:text-lg font-black text-foreground">
              {totalLikes >= 1000 ? (totalLikes / 1000).toFixed(1) + 'B' : totalLikes}
            </span>
          </div>
        </div>

        {/* Yayında / Taslak */}
        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Yayında / Taslak</span>
            <span className="text-base sm:text-lg font-black text-foreground">
              {publishedCount} <span className="text-xs font-normal text-muted">/ {draftCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Filtreleme & Arama Sekmeleri ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'bg-card/70 hover:bg-card text-muted hover:text-foreground border border-border/40'
            }`}
          >
            Tümü ({stories.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('published')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterStatus === 'published'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'bg-card/70 hover:bg-card text-muted hover:text-foreground border border-border/40'
            }`}
          >
            Yayındakiler ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('draft')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterStatus === 'draft'
                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/25'
                : 'bg-card/70 hover:bg-card text-muted hover:text-foreground border border-border/40'
            }`}
          >
            Taslaklar ({draftCount})
          </button>
        </div>

        {stories.length > 3 && (
          <div className="relative w-full sm:w-60">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Hikaye ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/60 border border-border/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* ── 4. Hikaye Listesi / Kartlar ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-9 h-9 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <Typography variant="caption" className="text-muted text-xs uppercase tracking-wider">
            Hikayeler Yükleniyor...
          </Typography>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border-2 border-dashed border-border/30 rounded-3xl bg-card/30 p-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-4 shadow-sm">
            <FileText size={32} />
          </div>
          <Typography variant="h3" className="mb-2 text-lg sm:text-xl font-bold">
            Henüz Bir Hikayeniz Yok
          </Typography>
          <Typography variant="body" className="text-muted max-w-sm mx-auto mb-6 text-xs sm:text-sm">
            Readixon yazar topluluğuna ilk izinizi bırakın. Taslağınızı hemen oluşturun veya sihirbazla adım adım kurgulayın.
          </Typography>
          <div className="flex justify-center">
            <Button variant="primary" onPress={() => setIsModalOpen(true)} className="rounded-full px-6 py-2.5 font-bold shadow-md shadow-primary/20">
              <Plus size={18} className="mr-1.5" /> İlk Hikayeni Başlat
            </Button>
          </div>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-16 border border-border/30 rounded-3xl bg-card/20 p-6">
          <p className="text-muted text-sm mb-3">Bu filtreleme kriterine uygun hikaye bulunamadı.</p>
          <button
            type="button"
            onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}
            className="text-primary hover:underline text-xs font-bold"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <>
          {/* Mobil Görünüm: Şık Yatay Kitap Kartları */}
          <div className="sm:hidden space-y-3">
            {filteredStories.map(story => (
              <div 
                key={story.storyId} 
                onClick={() => router.push(`/studio/story/${story.storyId}`)}
                className="bg-card/85 hover:bg-card border border-border/50 rounded-2xl p-3 flex gap-3.5 cursor-pointer active:scale-[0.98] transition-all shadow-sm group select-none"
              >
                {/* 2:3 Dikey Kitap Kapağı (Sırt Gölgeli) */}
                <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-muted/20 border border-border/40 shrink-0 relative shadow-sm">
                  {story.coverImage ? (
                    <img 
                      src={story.coverImage} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-primary/10 to-card">
                      <BookOpen className="text-primary/50 mb-1" size={20} />
                      <span className="text-[9px] text-muted font-bold line-clamp-1">{story.title}</span>
                    </div>
                  )}
                  {/* Kitap Sırtı Efekti */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />
                </div>

                {/* Sağ Kolon: Başlık, Durum, İstatistikler */}
                <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {story.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        story.status === 'ongoing' || story.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {story.status === 'draft' ? 'Taslak' : 'Yayında'}
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mt-1 leading-snug">
                      {story.summary || 'Özet eklenmemiş...'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/20 flex items-center justify-between text-muted text-[11px] mt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen size={12} className="text-primary" /> {story.stats.chapterCount} Bölüm
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Eye size={12} /> {story.stats.views || 0}
                      </span>
                    </div>
                    <span className="text-primary font-bold flex items-center gap-0.5 text-xs group-hover:translate-x-0.5 transition-transform">
                      Yönet <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Masaüstü & Tablet Görünüm: Grid Kitap Kartları */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStories.map(story => (
              <div 
                key={story.storyId} 
                onClick={() => router.push(`/studio/story/${story.storyId}`)}
                className="bg-card border border-border/50 rounded-2xl p-4 gap-4 cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-row select-none"
              >
                {/* 2:3 Kitap Kapağı */}
                <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden bg-muted/20 border border-border/40 shrink-0 relative shadow-md">
                  {story.coverImage ? (
                    <img 
                      src={story.coverImage} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-primary/10 to-card">
                      <BookOpen className="text-primary/50 mb-1" size={24} />
                      <span className="text-[10px] text-muted font-bold line-clamp-2">{story.title}</span>
                    </div>
                  )}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />
                </div>

                {/* Sağ Kolon */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {story.title}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        story.status === 'ongoing' || story.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {story.status === 'draft' ? 'Taslak' : 'Yayında'}
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mt-1.5 leading-relaxed">
                      {story.summary || 'Özet eklenmemiş...'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/20 flex items-center justify-between text-muted text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen size={13} className="text-primary" /> {story.stats.chapterCount} Bölüm
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Eye size={13} /> {story.stats.views || 0}
                      </span>
                    </div>
                    <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Yönet <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Mobil Floating Action Button (FAB) ── */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-24 right-4 z-40 w-13 h-13 rounded-full bg-gradient-to-tr from-primary to-amber-400 text-black flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-transform cursor-pointer"
        aria-label="Yeni Hikaye Ekle"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* ── Hikaye Oluşturma Modalı (Mobil Uyumlu Bottom Sheet & Masaüstü Modal) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-xl h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
            {/* Mobil Çekme Tutacağı */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Modal Başlığı */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 sm:p-5 border-b border-border/50 bg-card">
              <div>
                <Typography variant="h3" className="font-bold text-text text-lg sm:text-xl">
                  Yeni Hikaye Oluştur
                </Typography>
                <p className="text-xs text-muted mt-0.5">
                  Hikayenizin ilk adımını belirleyin ve yazmaya başlayın.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-muted/10 hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal İçeriği (Kaydırılabilir Gövde) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
              
              {/* Başlangıç Yöntemi Seçici Kartlar */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
                  Başlangıç Yöntemi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sihirbaz Seçeneği */}
                  <div
                    onClick={() => setCreationMode('wizard')}
                    className={`relative p-3.5 sm:p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      creationMode === 'wizard'
                        ? 'border-primary/80 bg-primary/10 shadow-sm shadow-primary/20 ring-1 ring-primary/40'
                        : 'border-border/60 bg-muted/5 hover:border-border hover:bg-muted/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                        <Wand2 size={16} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wide">
                        Önerilen
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-text mb-1 flex items-center gap-1.5">
                      Kurgu Sihirbazı
                      {creationMode === 'wizard' && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Kanca, karakterler, çatışma ve final adımlarıyla kurgu iskeletinizi adım adım planlayın.
                    </p>
                  </div>

                  {/* Klasik Seçenek */}
                  <div
                    onClick={() => setCreationMode('classic')}
                    className={`relative p-3.5 sm:p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      creationMode === 'classic'
                        ? 'border-primary/80 bg-primary/10 shadow-sm shadow-primary/20 ring-1 ring-primary/40'
                        : 'border-border/60 bg-muted/5 hover:border-border hover:bg-muted/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-muted/20 text-muted-foreground flex items-center justify-center shrink-0">
                        <PenTool size={16} />
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/20 text-muted uppercase tracking-wide">
                        Hızlı
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-text mb-1 flex items-center gap-1.5">
                      Klasik Yazım
                      {creationMode === 'classic' && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Herhangi bir planlama şablonu olmadan doğrudan bölümlerinizi serbestçe yazmaya başlayın.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hikaye Adı */}
              <div>
                <Input
                  label="Hikaye Adı"
                  placeholder="Örn: Sisler Şehri, Gece Nöbeti..."
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </div>
              
              {/* Türler / Kategoriler (Yapılandırılmış, Aranabilir & Seçim Hapları) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Türler / Kategoriler
                  </label>
                  <span className={`text-xs font-semibold ${newTags.length >= 3 ? 'text-amber-400' : 'text-muted'}`}>
                    {newTags.length}/3 seçildi
                  </span>
                </div>

                {/* Seçilen Türler Çipleri */}
                {newTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <span className="text-[11px] font-medium text-muted mr-1">Seçilenler:</span>
                    {newTags.map(tagId => {
                      const tag = POPULAR_TAGS.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-black shadow-xs animate-in zoom-in-95 duration-150"
                        >
                          {tag.label}
                          <button
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                            aria-label={`${tag.label} kaldır`}
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Arama ve Düzenli Grid Kutusu */}
                <div className="rounded-xl border border-border/70 bg-card/50 overflow-hidden shadow-inner">
                  {/* Mini Tür Arama */}
                  <div className="relative border-b border-border/40 p-2 bg-muted/10">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tür ara (örn: Fantastik, Gerilim, Bilim Kurgu)..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="w-full bg-transparent pl-7 pr-7 py-0.5 text-xs text-text placeholder:text-muted focus:outline-none"
                    />
                    {tagSearch && (
                      <button
                        type="button"
                        onClick={() => setTagSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Kaydırılabilir Düzenli Grid */}
                  <div className="max-h-36 overflow-y-auto p-2 scrollbar-thin">
                    {filteredTags.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted">
                        Aradığınız tür bulunamadı.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {filteredTags.map(tag => {
                          const isSelected = newTags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleTag(tag.id)}
                              disabled={!isSelected && newTags.length >= 3}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left border cursor-pointer ${
                                isSelected 
                                  ? 'border-primary bg-primary/20 text-primary font-semibold shadow-xs' 
                                  : 'border-border/40 bg-card/60 text-muted hover:text-text hover:border-border hover:bg-muted/10 disabled:opacity-30 disabled:cursor-not-allowed'
                              }`}
                            >
                              <span className="truncate">{tag.label}</span>
                              {isSelected && <Check size={12} className="shrink-0 text-primary ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* +18 Yetişkin İçerik */}
              <div 
                onClick={() => setIsAdultContent(!isAdultContent)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isAdultContent 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-border/50 bg-muted/5 hover:border-border/80'
                }`}
              >
                <input 
                  type="checkbox" 
                  id="isAdultContent" 
                  className="w-4 h-4 rounded accent-primary cursor-pointer border-border mt-0.5 shrink-0"
                  checked={isAdultContent}
                  onChange={(e) => setIsAdultContent(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <label htmlFor="isAdultContent" className="font-semibold text-xs sm:text-sm text-text cursor-pointer block">
                    Yetişkin İçerik (+18)
                  </label>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    Bu hikaye yoğun argo, şiddet veya yetişkin temalar içeriyor mu?
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Alt Aksiyon Barı (Daima Sabit & Görünür) */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-border/60 bg-card/95 backdrop-blur-md flex items-center justify-between gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <Button 
                variant="ghost" 
                onPress={() => setIsModalOpen(false)}
                className="text-xs sm:text-sm text-muted hover:text-text cursor-pointer px-3"
              >
                Vazgeç
              </Button>
              <Button 
                variant="primary" 
                onPress={() => handleCreateNew(creationMode === 'wizard')} 
                disabled={isCreating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-primary/25 cursor-pointer"
              >
                {creationMode === 'wizard' ? <Wand2 size={16} /> : <PenTool size={16} />}
                <span>
                  {isCreating 
                    ? 'Oluşturuluyor...' 
                    : (creationMode === 'wizard' ? 'Sihirbazla Oluştur ve Başla' : 'Hikayeyi Oluştur ve Başla')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {isPaywallOpen && (
        <PaywallModal 
          onClose={() => setIsPaywallOpen(false)}
          onUpgrade={() => {
            setIsPaywallOpen(false);
            router.push('/premium');
          }}
        />
      )}
    </div>
  );
}
