'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  BookOpen,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Feather,
  Loader2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Button } from '@readixon/ui';
import {
  createClubJourney,
  getPublishedChapters,
  getAuthorPublishedStories,
  useAuthStore,
  type Club,
  type Story,
  type Chapter,
} from '@readixon/core';
import { toast } from 'sonner';

interface StartJourneyModalProps {
  clubId?: string;
  club?: Club;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StartJourneyModal({ clubId, club, isOpen, onClose, onSuccess }: StartJourneyModalProps) {
  const { firebaseUser, userProfile } = useAuthStore();
  const targetClubId = club?.id || clubId || '';

  // Yazar Kuralı: Resmi yazar kulübü ise o yazarın ID'si, normal kulüp ise seferi başlatan yazarın UID'si
  const targetAuthorId = club?.linkedAuthorId || firebaseUser?.uid || '';

  // Search & Story Picker State
  const [searchQuery, setSearchQuery] = useState('');
  const [allAuthorStories, setAllAuthorStories] = useState<Story[]>([]);
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Chapter Detection State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [actualChapterCount, setActualChapterCount] = useState<number>(1);
  const [targetChapters, setTargetChapters] = useState<number>(1);
  const [isSingleChapter, setIsSingleChapter] = useState(false);

  // Journey Config State
  const [journeyTitle, setJourneyTitle] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Load: SADECE yazarın kendi yayınlanmış eserlerini getir. Asla diğer hikayeleri getirme.
  useEffect(() => {
    if (!isOpen || !targetAuthorId) {
      setSelectedStory(null);
      setSearchQuery('');
      setChapters([]);
      setAllAuthorStories([]);
      setSearchResults([]);
      return;
    }

    const loadAuthorStories = async () => {
      setIsSearching(true);
      try {
        const stories = await getAuthorPublishedStories(targetAuthorId);
        setAllAuthorStories(stories);
        setSearchResults(stories);
      } catch (err) {
        console.error('Yazarın hikayeleri yüklenemedi:', err);
      } finally {
        setIsSearching(false);
      }
    };

    loadAuthorStories();
  }, [isOpen, targetAuthorId]);

  // Arama İşlemi: Yalnızca yazarın kendi eserleri içerisinde anında filtreleme yapar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(allAuthorStories);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = allAuthorStories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q)) ||
        s.mainGenre?.toLowerCase().includes(q) ||
        s.summary?.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery, allAuthorStories]);

  // Story Selection & Auto Chapter Detection
  const handleSelectStory = async (story: Story) => {
    // Güvenlik Kuralı: Yazar kendi hikayelerine sadece bunu yapabilmeli. Diğer hikayelere yapmamalı.
    const allowedAuthorId = club?.linkedAuthorId || firebaseUser?.uid;
    if (allowedAuthorId && story.authorId !== allowedAuthorId) {
      toast.error('Yalnızca kendi yayınlanmış hikayelerinizi seçebilirsiniz. Başka yazarların eserlerine sefer başlatılamaz.');
      return;
    }

    setSelectedStory(story);
    setIsLoadingChapters(true);

    try {
      const publishedChapters = await getPublishedChapters(story.storyId);
      setChapters(publishedChapters);

      const realCount = publishedChapters.length > 0
        ? publishedChapters.length
        : (story.stats?.chapterCount || 1);

      const single = story.format === 'short_story' || realCount === 1;

      setActualChapterCount(realCount);
      setIsSingleChapter(single);
      setTargetChapters(single ? 1 : realCount);
      setJourneyTitle(`${story.title} Okuma Seferi`);
      setDurationDays(single ? 3 : 7);
    } catch (err) {
      console.error('Bölüm analizi hatası:', err);
      const fallbackCount = story.stats?.chapterCount || 1;
      const single = story.format === 'short_story' || fallbackCount === 1;
      setActualChapterCount(fallbackCount);
      setIsSingleChapter(single);
      setTargetChapters(single ? 1 : fallbackCount);
      setJourneyTitle(`${story.title} Okuma Seferi`);
      setDurationDays(single ? 3 : 7);
    } finally {
      setIsLoadingChapters(false);
    }
  };

  if (!isOpen) return null;

  // Calculate Dynamic Milestones
  const calculateMilestones = () => {
    if (isSingleChapter || targetChapters === 1) {
      return [
        {
          dayNumber: 1,
          targetChapterIndex: 1,
          targetChapterTitle: 'Tek Solukta Okuma & Final Analizi',
          discussionTopic: 'Tüm eserin genel analizi, kurgusal ritim, temalar ve nihai son değerlendirmesi.',
          unlockDate: new Date().toISOString().split('T')[0],
        },
      ];
    }

    const chaptersTotal = Math.max(2, targetChapters);
    const q1 = Math.max(1, Math.round(chaptersTotal * 0.25));
    const q2 = Math.max(q1 + 1, Math.round(chaptersTotal * 0.5));
    const q3 = Math.max(q2 + 1, Math.round(chaptersTotal * 0.75));
    const q4 = chaptersTotal;

    const dayStep = Math.max(1, Math.floor(durationDays / 4));

    return [
      {
        dayNumber: 1,
        targetChapterIndex: q1,
        targetChapterTitle: `1-${q1}. Bölüm Tartışması`,
        discussionTopic: 'Giriş, karakterler ve evrenin ilk izlenimleri.',
        unlockDate: new Date().toISOString().split('T')[0],
      },
      {
        dayNumber: 1 + dayStep,
        targetChapterIndex: q2,
        targetChapterTitle: `${q1 + 1}-${q2}. Bölüm Tartışması`,
        discussionTopic: 'Kurgusal gerilim tırmanıyor! İlk büyük dönüm noktası.',
        unlockDate: new Date(Date.now() + dayStep * 86400000).toISOString().split('T')[0],
      },
      {
        dayNumber: 1 + dayStep * 2,
        targetChapterIndex: q3,
        targetChapterTitle: `${q2 + 1}-${q3}. Bölüm Tartışması`,
        discussionTopic: 'Büyük sırlar açığa çıkıyor, final öncesi teoriler.',
        unlockDate: new Date(Date.now() + dayStep * 2 * 86400000).toISOString().split('T')[0],
      },
      {
        dayNumber: durationDays,
        targetChapterIndex: q4,
        targetChapterTitle: `Büyük Final: ${q3 + 1}-${q4}. Bölüm`,
        discussionTopic: 'Kitabın sonu, final değerlendirmesi ve kulüp puanlaması!',
        unlockDate: new Date(Date.now() + (durationDays - 1) * 86400000).toISOString().split('T')[0],
      },
    ];
  };

  const milestones = calculateMilestones();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!selectedStory) {
      toast.error('Lütfen sefer için bir kitap seçin.');
      return;
    }

    // Güvenlik Kuralı: Yazar kendi hikayelerine sadece bunu yapabilmeli. Diğer hikayelere yapmamalı.
    const allowedAuthorId = club?.linkedAuthorId || firebaseUser.uid;
    if (allowedAuthorId && selectedStory.authorId !== allowedAuthorId) {
      toast.error('Yalnızca kendi yayınlanmış eserleriniz için okuma seferi başlatabilirsiniz. Başka yazarların eserlerine sefer başlatılamaz.');
      return;
    }

    try {
      setIsSubmitting(true);

      const title = journeyTitle.trim() || `${selectedStory.title} Okuma Seferi`;
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();

      await createClubJourney(targetClubId, firebaseUser.uid, {
        storyId: selectedStory.storyId,
        storyTitle: selectedStory.title,
        storyCoverUrl: selectedStory.coverImage || '',
        authorName: selectedStory.authorName || '',
        authorId: selectedStory.authorId || '',
        totalChapters: targetChapters,
        title,
        startDate,
        endDate,
        milestones,
      });

      toast.success(
        isSingleChapter
          ? `"${selectedStory.title}" için tek duraklı kısa hikaye seferi başlatıldı!`
          : `"${selectedStory.title}" için ${milestones.length} duraklı okuma seferi başlatıldı!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Sefer başlatma hatası:', err);
      toast.error(err.message || 'Sefer başlatılırken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-border/50 flex items-center justify-between shrink-0 bg-gradient-to-r from-primary/10 to-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Yeni Okuma Seferi Başlat</h3>
              <p className="text-xs text-muted">
                Kendi eserleriniz arasından seçim yapın; duraklar ve odalar otomatik oluşturulsun.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted/15 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* YAZAR KORUMA BİLGİ BANDI */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Feather size={16} />
            </div>
            <div className="text-xs leading-relaxed">
              <strong className="text-amber-400 block font-bold">Yazarın Kendi Eserleri Kuralı</strong>
              <span className="text-muted">
                Okuma seferleri yalnızca <strong>yazarın kendi yayınlanmış eserleri</strong> için başlatılabilir. Diğer yazarların eserlerine sefer başlatılamaz.
              </span>
            </div>
          </div>

          {/* STEP 1: STORY PICKER */}
          {!selectedStory ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                  1. Kendi Eserlerinizden Seçin
                </label>
                <span className="text-[11px] text-amber-500 font-semibold">
                  {allAuthorStories.length} Eseriniz Yayında
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kendi hikayeleriniz arasında arayın..."
                  className="w-full bg-background border border-border/80 focus:border-primary rounded-2xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-hidden transition-all placeholder:text-muted/60"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>

              {/* Story Search Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {searchResults.map((story) => {
                  const isStorySingle = story.format === 'short_story' || (story.stats?.chapterCount === 1);
                  return (
                    <button
                      key={story.storyId}
                      type="button"
                      onClick={() => handleSelectStory(story)}
                      className="text-left p-3 rounded-2xl bg-muted/10 hover:bg-primary/10 border border-border/60 hover:border-primary/50 transition-all flex items-center gap-3 group active:scale-98"
                    >
                      <div className="w-12 h-16 rounded-xl bg-muted/30 overflow-hidden shrink-0 border border-border/40">
                        {story.coverImage ? (
                          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <BookOpen size={18} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors block truncate">
                          {story.title}
                        </span>
                        <span className="text-[11px] text-muted block truncate mt-0.5">
                          {story.authorName || 'Yazar'}
                        </span>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          {isStorySingle ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                              <Feather size={9} /> Tek Bölüm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/20 text-primary border border-primary/30">
                              <Layers size={9} /> {story.stats?.chapterCount || 1} Bölüm
                            </span>
                          )}
                          {story.mainGenre && (
                            <span className="text-[9px] text-muted truncate">
                              • {story.mainGenre}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {searchResults.length === 0 && !isSearching && (
                <div className="text-center py-8 px-4 rounded-2xl bg-muted/10 border border-border/60 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Feather size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Yayında Olan Bir Hikayeniz Bulunamadı</h4>
                    <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
                      Okuma seferi kuralı gereğince yalnızca yazarın kendi yayınlanmış eserleri için sefer başlatılabilir. Diğer yazarların eserlerine sefer başlatılamaz.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/studio"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                      onClick={onClose}
                    >
                      <Sparkles size={14} />
                      <span>Yazar Stüdyosuna Git</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: SELECTED STORY & AUTOMATIC INTELLIGENCE */
            <div className="space-y-4">
              {/* Selected Story Showcase */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-20 rounded-xl bg-card overflow-hidden shrink-0 border border-border shadow-md">
                    {selectedStory.coverImage ? (
                      <img src={selectedStory.coverImage} alt={selectedStory.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <BookOpen size={20} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isSingleChapter ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-xs">
                          <Feather size={10} className="stroke-[2.5]" />
                          <span>Kısa Hikaye (Tek Bölüm)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-black shadow-xs">
                          <Layers size={10} />
                          <span>Çok Bölümlü Roman</span>
                        </span>
                      )}
                      <span className="text-[11px] text-muted">
                        {isLoadingChapters ? 'Bölümler inceleniyor...' : `${actualChapterCount} Bölüm Tespit Edildi`}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-foreground truncate">
                      {selectedStory.title}
                    </h4>
                    <p className="text-xs text-muted">
                      Yazar: {selectedStory.authorName || 'Siz'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="shrink-0 text-xs font-semibold text-muted hover:text-foreground px-3 py-1.5 rounded-xl border border-border hover:bg-muted/10 transition-colors"
                >
                  Değiştir
                </button>
              </div>

              {/* SINGLE CHAPTER INTELLIGENT BANNER */}
              {isSingleChapter && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="text-amber-400 block font-bold">Akıllı Tek Bölüm Algılaması Devrede</strong>
                    <span className="text-muted">
                      Bu eser tek bir bölümden oluştuğu için fazladan ara duraklar açılamaz. Otomatik olarak <strong>1 adet Tek Solukta Okuma & Final Analiz Odası</strong> kurgulandı.
                    </span>
                  </div>
                </div>
              )}

              {/* Form Config Inputs */}
              <div className="space-y-3 bg-card/60 border border-border/60 p-4 rounded-2xl">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">
                    Sefer Başlığı
                  </label>
                  <input
                    type="text"
                    value={journeyTitle}
                    onChange={(e) => setJourneyTitle(e.target.value)}
                    placeholder="Örn: Ruhun Sessizliği Canlı Okuma Maratonu"
                    className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2 text-sm text-foreground outline-hidden transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Chapter Count Target */}
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block flex items-center justify-between">
                      <span>Okunacak Bölüm Sayısı</span>
                      {isSingleChapter && (
                        <span className="text-amber-500 text-[10px] font-semibold flex items-center gap-1">
                          <Lock size={10} /> Otomatik Kilitli
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={actualChapterCount}
                        value={targetChapters}
                        disabled={isSingleChapter}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= actualChapterCount) {
                            setTargetChapters(val);
                          }
                        }}
                        className={`w-full bg-background border rounded-xl px-3.5 py-2 text-sm font-bold text-foreground outline-hidden transition-all ${
                          isSingleChapter
                            ? 'border-amber-500/40 text-amber-500 cursor-not-allowed bg-amber-500/5'
                            : 'border-border/80 focus:border-primary'
                        }`}
                      />
                      {isSingleChapter && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 uppercase">
                          Kilitli
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted block mt-1">
                      {isSingleChapter
                        ? 'Kısa hikayede bölüm sayısı sabittir.'
                        : `Kitabın toplam yayınlanan bölümü: ${actualChapterCount}`}
                    </span>
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">
                      Sefer Süresi
                    </label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2 text-sm font-medium text-foreground outline-hidden transition-all"
                    >
                      {isSingleChapter ? (
                        <>
                          <option value={2}>2 Gün (Hızlı Okuma)</option>
                          <option value={3}>3 Gün (İdeal Süre)</option>
                          <option value={5}>5 Gün (Derin İnceleme)</option>
                        </>
                      ) : (
                        <>
                          <option value={7}>7 Gün (1 Hafta)</option>
                          <option value={14}>14 Gün (2 Hafta)</option>
                          <option value={21}>21 Gün (3 Hafta)</option>
                          <option value={30}>30 Gün (1 Ay)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* LIVE MILESTONES PREVIEW */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block flex items-center justify-between">
                  <span>Otomatik Oluşturulacak Duraklar ({milestones.length} Oda)</span>
                  <span className="text-primary font-medium">{durationDays} Gün Boyunca</span>
                </span>

                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-background/60 border border-border/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-[11px] flex items-center justify-center shrink-0">
                          {m.dayNumber}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground block truncate">{m.targetChapterTitle}</span>
                          <span className="text-[11px] text-muted block truncate">{m.discussionTopic}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-muted/20 text-[10px] font-semibold text-muted shrink-0">
                        {m.targetChapterIndex}. Bölüm Eşiği
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-border/50 bg-background/40 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onPress={onClose}
            disabled={isSubmitting}
            className="text-xs font-medium"
          >
            Vazgeç
          </Button>

          <Button
            onPress={handleSubmit}
            disabled={!selectedStory || isSubmitting}
            className={`text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all ${
              !selectedStory || isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-background active:scale-95 shadow-primary/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Sefer Başlatılıyor...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Okuma Seferini Başlat
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
