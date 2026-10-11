'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  Sparkles, 
  PlusCircle, 
  Globe, 
  BookOpen, 
  Layers, 
  Users, 
  MapPin, 
  ChevronRight, 
  Search, 
  X, 
  Loader2,
  Lock,
  Eye,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { 
  useAuthStore, 
  getUniversesByAuthorId, 
  getCollaboratingUniverses,
  createUniverse, 
  createUniverseLocation,
  createUniversePowerSystem,
  createUniverseCanonRule,
  createUniverseOrganization,
  type Universe, 
  type UniverseGenre, 
  type UniverseVisibility,
  UNIVERSE_MEMBER_ROLE_CONFIG,
  getUserUniverseRole
} from '@readixon/core';
import { UNIVERSE_TEMPLATES, type UniverseTemplate } from '@/components/UniverseTemplates';
import { toast } from 'sonner';

const GENRE_LABELS: Record<UniverseGenre, string> = {
  fantasy: 'Fantastik',
  'sci-fi': 'Bilimkurgu',
  real_world: 'Gerçek Dünya',
  alternate_history: 'Alternatif Tarih',
  dystopia: 'Distopya',
  utopia: 'Ütopya',
  contemporary: 'Çağdaş',
  historical: 'Tarihi Kurgu',
  mythological: 'Mitolojik',
  post_apocalyptic: 'Kıyamet Sonrası',
  hybrid: 'Hibrit',
  custom: 'Özel Kurgu',
};

const VISIBILITY_BADGES: Record<UniverseVisibility, { label: string; color: string }> = {
  public: { label: 'Herkese Açık', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  partially_public: { label: 'Kısmen Açık', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  unlisted: { label: 'Liste Dışı', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  draft: { label: 'Taslak', color: 'bg-muted/15 text-muted border-border/40' },
  team: { label: 'Ekip', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  private: { label: 'Sadece Ben', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export default function StudioUniversesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTab = searchParams.get('targetTab');
  const targetAction = searchParams.get('targetAction');
  const subTab = searchParams.get('subTab');

  const { firebaseUser } = useAuthStore();
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'all' | 'mine' | 'collab'>('all');

  // Modal & Kurgu Şablonu State (PRD Bölüm 52, 61, 64)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('high_fantasy');
  const [newTitle, setNewTitle] = useState('Eldoria: Kadim Krallıklar & Ejder Sancağı');
  const [newDescription, setNewDescription] = useState('Kadim tanrıların göğe çekildiği, rün büyüsünün ve ejderha kanının soyları yönettiği, kılıç ve büyüyle örülü epik bir yüksek fantastik dünya.');
  const [newGenre, setNewGenre] = useState<UniverseGenre>('fantasy');
  const [newVisibility, setNewVisibility] = useState<UniverseVisibility>('draft');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectTemplate = (template: UniverseTemplate) => {
    setSelectedTemplateId(template.id);
    if (template.id !== 'blank') {
      setNewTitle(template.suggestedTitle);
      setNewDescription(template.description);
      setNewGenre(template.genre);
    } else {
      setNewTitle('');
      setNewDescription('');
      setNewGenre('fantasy');
    }
  };

  useEffect(() => {
    if (!firebaseUser) return;
    loadUniverses();
  }, [firebaseUser]);

  // Yazar Akademisi Köprüsü (PRD Bölüm 53): Tek evren varsa doğrudan o evrenin ilgili modülüne git
  useEffect(() => {
    if (loading || !firebaseUser || !targetTab) return;

    if (universes.length === 1) {
      const q = [`tab=${targetTab}`];
      if (targetAction) q.push(`action=${targetAction}`);
      if (subTab) q.push(`subTab=${subTab}`);
      router.push(`/studio/universes/${universes[0].universeId}?${q.join('&')}`);
    } else if (universes.length === 0) {
      setIsModalOpen(true);
      toast.info('Akademi görevinizi tamamlamak için ilk kurgusal evreninizi adlandırarak başlayın.');
    }
  }, [loading, firebaseUser, targetTab, universes]);

  const loadUniverses = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const [ownedList, collabList] = await Promise.all([
        getUniversesByAuthorId(firebaseUser.uid),
        getCollaboratingUniverses(firebaseUser.uid),
      ]);
      const map = new Map<string, Universe>();
      ownedList.forEach((u) => map.set(u.universeId, u));
      collabList.forEach((u) => map.set(u.universeId, u));
      setUniverses(Array.from(map.values()));
    } catch (error) {
      console.error('Evrenler yüklenirken hata:', error);
      toast.error('Evrenleriniz yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Metrikler
  const { totalConnectedStories, totalConnectedSeries, ownedCount, collabCount } = useMemo(() => {
    let storiesCount = 0;
    let seriesCount = 0;
    let owned = 0;
    let collab = 0;

    universes.forEach((u) => {
      storiesCount += u.connectedStoryIds?.length || 0;
      seriesCount += u.connectedSeriesIds?.length || 0;
      if (u.authorId === firebaseUser?.uid) {
        owned++;
      } else {
        collab++;
      }
    });

    return { 
      totalConnectedStories: storiesCount, 
      totalConnectedSeries: seriesCount,
      ownedCount: owned,
      collabCount: collab
    };
  }, [universes, firebaseUser]);

  // Filtrelenmiş Evrenler
  const filteredUniverses = useMemo(() => {
    return universes.filter((u) => {
      const isMine = u.authorId === firebaseUser?.uid;
      const matchesScope =
        filterScope === 'all' ? true : filterScope === 'mine' ? isMine : !isMine;
      const matchesGenre = filterGenre === 'all' ? true : u.genre === filterGenre;
      const matchesSearch =
        searchQuery.trim() === '' ||
        u.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesScope && matchesGenre && matchesSearch;
    });
  }, [universes, filterScope, filterGenre, searchQuery, firebaseUser]);

  const handleCreate = async () => {
    if (!firebaseUser) {
      toast.error('Lütfen önce giriş yapın.');
      return;
    }

    if (!newTitle.trim()) {
      toast.error('Lütfen evreninize bir isim verin.');
      return;
    }

    setIsCreating(true);
    try {
      const newUniverseId = await createUniverse(firebaseUser.uid, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        genre: newGenre,
        visibility: newVisibility,
      });

      // Hazır Evren Kurgu Şablonu Başlangıç Tohumlarını Ekle (PRD Bölüm 52, 61, 64)
      const chosenTemplate = UNIVERSE_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (chosenTemplate?.starterData) {
        const { powerSystem, location, canonRule, organization } = chosenTemplate.starterData;
        await Promise.allSettled([
          powerSystem ? createUniversePowerSystem(newUniverseId, powerSystem) : Promise.resolve(),
          location ? createUniverseLocation(newUniverseId, location) : Promise.resolve(),
          canonRule ? createUniverseCanonRule(newUniverseId, canonRule) : Promise.resolve(),
          organization ? createUniverseOrganization(newUniverseId, organization) : Promise.resolve(),
        ]);
      }

      toast.success('Evren başarıyla kuruldu!');
      setIsModalOpen(false);

      const queryParts: string[] = [];
      if (targetTab) queryParts.push(`tab=${targetTab}`);
      if (targetAction) queryParts.push(`action=${targetAction}`);
      if (subTab) queryParts.push(`subTab=${subTab}`);
      const dest = queryParts.length > 0 
        ? `/studio/universes/${newUniverseId}?${queryParts.join('&')}`
        : `/studio/universes/${newUniverseId}`;
      router.push(dest);
    } catch (error: any) {
      console.error('Evren oluşturma hatası:', error);
      toast.error(error?.message || 'Evren oluşturulamadı.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full relative">
      {/* ── Yazar Akademisi Köprü Bildirimi (PRD Bölüm 53) ── */}
      {targetTab && (
        <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-primary shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-black text-foreground">
                🎓 Yazar Akademisi Görevi: Hedef Evreninizi Seçin
              </h4>
              <p className="text-xs text-muted">
                {targetTab === 'powers' && 'Güç Sistemi modülü ilgili evrende otomatik olarak açılacaktır.'}
                {targetTab === 'canon_rules' && 'Canon Kuralları & Düğüm Takibi modülü ilgili evrende otomatik olarak açılacaktır.'}
                {targetTab === 'characters' && 'Karakter Defteri 2.0 Ark cetveli ilgili evrende otomatik olarak açılacaktır.'}
                {!['powers', 'canon_rules', 'characters'].includes(targetTab) && 'İlgili evren modülü otomatik olarak açılacaktır.'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onPress={() => router.push('/studio/universes')}
            className="text-xs text-muted hover:text-foreground shrink-0"
          >
            Filtreyi Temizle
          </Button>
        </div>
      )}

      {/* ── 1. Üst Başlık & Aksiyon ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Evren Stüdyosu
            </Typography>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/25">
              {universes.length} Evren
            </span>
          </div>
          <Typography variant="body" className="text-muted text-xs sm:text-sm mt-1">
            Hikayenizi sadece yazmayın, dünyasını kurun. Karakterler, mekânlar ve zaman çizelgeleri tek çatıda.
          </Typography>
        </div>

        <Button
          variant="primary"
          onPress={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl shadow-lg shadow-primary/20 font-bold text-sm shrink-0 active:scale-95 transition-transform"
        >
          <PlusCircle size={18} />
          <span>Yeni Evren Kur</span>
        </Button>
      </div>

      {/* ── 2. Metrik Şeridi ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Toplam Evren</span>
            <span className="text-base sm:text-lg font-black text-foreground">{universes.length}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Bağlı Eser</span>
            <span className="text-base sm:text-lg font-black text-foreground">{totalConnectedStories}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Layers size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Bağlı Seri</span>
            <span className="text-base sm:text-lg font-black text-foreground">{totalConnectedSeries}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Globe size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-muted block truncate font-medium">Aktif Dünya Ağı</span>
            <span className="text-base sm:text-lg font-black text-foreground">Canlı</span>
          </div>
        </div>
      </div>

      {/* ── 3. Arama & Filtreleme & Kapsam Sekmeleri ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-card/60 border border-border/50 rounded-xl self-start overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilterScope('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterScope === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Tümü ({universes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterScope('mine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterScope === 'mine'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Benim ({ownedCount})
          </button>
          {collabCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterScope('collab')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterScope === 'collab'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Users size={12} />
              <span>Ortak ({collabCount})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Evren ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/60 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="bg-card/60 border border-border/50 text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50 shrink-0"
          >
            <option value="all">Tüm Türler</option>
            {Object.entries(GENRE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4. Evren Listesi ── */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <Typography variant="body" className="text-muted text-sm">Evrenleriniz yükleniyor...</Typography>
        </div>
      ) : filteredUniverses.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-card/40 border border-border/50 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-inner">
            <Sparkles size={28} />
          </div>
          <Typography variant="h3" className="font-bold text-lg mb-2">
            {searchQuery ? 'Aramanıza uygun evren bulunamadı.' : 'Henüz bir kurgusal evren kurmadınız.'}
          </Typography>
          <Typography variant="body" className="text-muted text-xs sm:text-sm max-w-md mb-6">
            Birden fazla romanı, yan hikâyeyi ve webtoon'u ortak karakterler ve mekânlarla birbirine bağlayacak ilk evreninizi başlatın.
          </Typography>
          {!searchQuery && (
            <Button variant="primary" onPress={() => setIsModalOpen(true)} className="rounded-xl font-bold text-sm">
              İlk Evreninizi Kurun
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredUniverses.map((universe) => {
            const visibilityInfo = VISIBILITY_BADGES[universe.visibility] || VISIBILITY_BADGES.draft;
            const genreLabel = GENRE_LABELS[universe.genre] || universe.genre;
            const isOwner = universe.authorId === firebaseUser?.uid;
            const userRole = getUserUniverseRole(universe, firebaseUser?.uid);
            const roleConfig = UNIVERSE_MEMBER_ROLE_CONFIG[userRole];
            const memberCount = (universe.members?.length || 0) + 1;

            return (
              <div
                key={universe.universeId}
                onClick={() => {
                  const queryParts: string[] = [];
                  if (targetTab) queryParts.push(`tab=${targetTab}`);
                  if (targetAction) queryParts.push(`action=${targetAction}`);
                  if (subTab) queryParts.push(`subTab=${subTab}`);
                  const dest = queryParts.length > 0 
                    ? `/studio/universes/${universe.universeId}?${queryParts.join('&')}`
                    : `/studio/universes/${universe.universeId}`;
                  router.push(dest);
                }}
                className="group relative rounded-2xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Üst Görsel Şeridi */}
                <div className="h-28 w-full bg-gradient-to-tr from-primary/20 via-purple-500/10 to-card relative overflow-hidden flex items-center justify-center">
                  {universe.coverImage ? (
                    <img
                      src={universe.coverImage}
                      alt={universe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-primary/40">
                      <Globe size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                  {/* Tür & Görünürlük Rozetleri */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-background/80 border border-border/60 text-foreground backdrop-blur-md shadow-xs">
                      {genreLabel}
                    </span>
                    {!isOwner && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs backdrop-blur-md ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}>
                        {roleConfig.label}
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md ${visibilityInfo.color}`}
                  >
                    {visibilityInfo.label}
                  </span>
                </div>

                {/* İçerik */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Typography variant="h3" className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {universe.title}
                    </Typography>
                    <Typography variant="body" className="text-muted text-xs line-clamp-2 mt-1.5 leading-relaxed">
                      {universe.description || 'Henüz bir evren özeti eklenmedi.'}
                    </Typography>
                  </div>

                  {/* İstatistikler & Buton */}
                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <BookOpen size={13} className="text-primary" />
                        {universe.connectedStoryIds?.length || 0} Eser
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={13} />
                        {universe.connectedSeriesIds?.length || 0} Seri
                      </span>
                      {memberCount > 1 && (
                        <span className="flex items-center gap-1 text-indigo-400 font-medium">
                          <Users size={13} />
                          {memberCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-primary text-xs font-bold group-hover:translate-x-1 transition-transform">
                      <span>Evrene Gir</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Yeni Evren Oluştur Modalı & Kurgu Şablonları (PRD Bölüm 52, 61, 64) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative scrollbar-none">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-muted hover:text-foreground p-1.5 rounded-full hover:bg-muted/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <Typography variant="h3" className="font-bold text-lg">Yeni Evren Kur & Kurgu Şablonu</Typography>
                <Typography variant="body" className="text-muted text-xs">
                  Hazır kurgu şablonuyla anında güç sistemi, canon kuralı ve başkent mekânı oluşturun.
                </Typography>
              </div>
            </div>

            <div className="space-y-4">
              {/* Şablon Seçici Grid */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-2">
                  1. Kurgu Şablonu Seçin
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {UNIVERSE_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? `${tmpl.border} bg-gradient-to-br ${tmpl.bgGrad} ring-2 ring-primary/40 shadow-sm`
                            : 'border-border/50 bg-background/40 hover:bg-background hover:border-border'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-2xl">{tmpl.icon}</span>
                            {isSelected && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-black">
                                Seçildi
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-foreground line-clamp-1">
                            {tmpl.title}
                          </h4>
                          <p className="text-[10px] text-muted line-clamp-2 mt-1 leading-tight">
                            {tmpl.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seçilen Şablonun Otomatik Başlangıç Verileri Rozeti */}
              {(() => {
                const chosen = UNIVERSE_TEMPLATES.find((t) => t.id === selectedTemplateId);
                if (!chosen?.starterData) return null;
                return (
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2.5">
                    <Zap size={16} className="shrink-0 mt-0.5 text-primary" />
                    <div className="min-w-0">
                      <span className="font-bold block text-foreground">
                        Otomatik Hazırlanacak Başlangıç Paketi (Seed Data):
                      </span>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-muted">
                        {chosen.starterData.powerSystem && (
                          <li>• <strong className="text-foreground">Güç Sistemi:</strong> {chosen.starterData.powerSystem.name}</li>
                        )}
                        {chosen.starterData.location && (
                          <li>• <strong className="text-foreground">İlk Başkent / Mekân:</strong> {chosen.starterData.location.name}</li>
                        )}
                        {chosen.starterData.canonRule && (
                          <li>• <strong className="text-foreground">Series Bible Kanunu:</strong> {chosen.starterData.canonRule.title}</li>
                        )}
                        {chosen.starterData.organization && (
                          <li>• <strong className="text-foreground">Önemli Örgüt / Lonca:</strong> {chosen.starterData.organization.name}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-border/40 pt-4 space-y-3.5">
                <label className="text-xs font-bold text-foreground block">
                  2. Evren Detaylarını Özelleştirin
                </label>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1.5">Evren Adı *</label>
                  <input
                    type="text"
                    placeholder="Örn: Eldoria: Kadim Krallıklar, Kızıl Pelerin Evreni"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1.5">Evren Özeti / Lore Başlangıcı</label>
                  <textarea
                    rows={3}
                    placeholder="Bu evrenin ana çatışması, coğrafyası ve atmosferi hakkında özet..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/60 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1.5">Ana Tür</label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value as UniverseGenre)}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    >
                      {Object.entries(GENRE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1.5">Görünürlük</label>
                    <select
                      value={newVisibility}
                      onChange={(e) => setNewVisibility(e.target.value as UniverseVisibility)}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="draft">Taslak (Yalnızca siz)</option>
                      <option value="unlisted">Liste Dışı (Bağlantı ile)</option>
                      <option value="public">Herkese Açık (Keşfette)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2.5">
                <Button variant="ghost" onPress={() => setIsModalOpen(false)} className="text-xs">
                  Vazgeç
                </Button>
                <Button
                  variant="primary"
                  onPress={handleCreate}
                  disabled={isCreating}
                  className="font-bold text-xs px-6 py-2.5"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" />
                      Kuruluyor & Tohumlanıyor...
                    </span>
                  ) : (
                    'Evreni Kur'
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
