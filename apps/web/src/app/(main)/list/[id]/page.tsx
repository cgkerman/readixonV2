'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Heart,
  Share2,
  Lock,
  Globe,
  Edit3,
  Trash2,
  BookOpen,
  Clock,
  Sparkles,
  ArrowLeft,
  Loader2,
  Eye,
  Star,
  X,
  ListMusic,
  Plus,
} from 'lucide-react';
import {
  getReadingListById,
  deleteReadingList,
  addStoryToReadingList,
  removeStoryFromReadingList,
  toggleLikeReadingList,
  checkIfReadingListLiked,
  getStoriesByIds,
  useAuthStore,
  Story,
  ReadingList,
  getUserProfile,
} from '@readixon/core';
import { StorySearchModal } from '@readixon/ui';
import { ReadingListCoverCollage } from '@/components/reading-list/ReadingListCoverCollage';
import { ShareReadingListModal } from '@/components/reading-list/ShareReadingListModal';
import { CreateReadingListModal } from '@/components/reading-list/CreateReadingListModal';
import { toast } from 'sonner';

export default function ReadingListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.id as string;

  const { firebaseUser } = useAuthStore();
  const [list, setList] = useState<ReadingList | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!listId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedList = await getReadingListById(listId);
        if (!fetchedList) {
          setList(null);
          setLoading(false);
          return;
        }

        setList(fetchedList);
        setLikeCount(fetchedList.likesCount || 0);

        // Hikayeleri getir ve sıralamayı koru
        if (fetchedList.storyIds && fetchedList.storyIds.length > 0) {
          const fetchedStories = await getStoriesByIds(fetchedList.storyIds);
          // Orijinal storyIds sırasına göre diz
          const storyMap = new Map(fetchedStories.map(s => [s.storyId, s]));
          const orderedStories = fetchedList.storyIds
            .map(id => storyMap.get(id))
            .filter(Boolean) as Story[];
          setStories(orderedStories);
        } else {
          setStories([]);
        }

        // Kullanıcı giriş yaptıysa beğeni durumunu kontrol et
        if (firebaseUser?.uid) {
          const liked = await checkIfReadingListLiked(firebaseUser.uid, listId);
          setIsLiked(liked);
        }
      } catch (err) {
        console.error('Liste yüklenirken hata:', err);
        toast.error('Okuma listesi yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [listId, firebaseUser?.uid]);

  const isOwner = Boolean(firebaseUser?.uid && list && firebaseUser.uid === list.userId);

  // Beğeni Butonu
  const handleToggleLike = async () => {
    if (!firebaseUser?.uid) {
      toast.info('Listeyi beğenmek için giriş yapmalısınız.');
      router.push('/login');
      return;
    }
    if (!list) return;

    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic Update
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const nowLiked = await toggleLikeReadingList(firebaseUser.uid, list.id);
      setIsLiked(nowLiked);
    } catch (err) {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error('Beğeni işlemi başarısız oldu.');
    }
  };

  // Listeye yeni hikaye ekleme
  const handleAddStory = async (selectedStory: Story) => {
    if (!list || !isOwner) return;
    if (list.storyIds?.includes(selectedStory.storyId)) {
      toast.info(`"${selectedStory.title}" zaten bu listede ekli.`);
      return;
    }

    try {
      await addStoryToReadingList(list.id, selectedStory.storyId);
      setStories(prev => [...prev, selectedStory]);
      setList(prev => (prev ? { ...prev, storyIds: [...(prev.storyIds || []), selectedStory.storyId] } : null));
      toast.success(`"${selectedStory.title}" listeye eklendi!`);
      setIsAddBookModalOpen(false);
    } catch (err) {
      toast.error('Kitap eklenemedi.');
    }
  };

  // Listeden tekil hikaye çıkarma (Sahibi için)
  const handleRemoveStory = async (storyId: string, storyTitle: string) => {
    if (!list || !isOwner) return;

    try {
      await removeStoryFromReadingList(list.id, storyId);
      setStories(prev => prev.filter(s => s.storyId !== storyId));
      setList(prev => (prev ? { ...prev, storyIds: prev.storyIds.filter(id => id !== storyId) } : null));
      toast.success(`"${storyTitle}" listeden çıkarıldı.`);
    } catch (err) {
      toast.error('Hikaye çıkarılamadı.');
    }
  };

  // Listeyi komple silme (Sahibi için)
  const handleDeleteList = async () => {
    if (!list || !isOwner || !firebaseUser) return;
    if (!window.confirm(`"${list.title}" listesini silmek istediğinize emin misiniz?`)) return;

    setDeleting(true);
    try {
      await deleteReadingList(list.id, firebaseUser.uid);
      toast.success('Okuma listesi silindi.');
      router.push('/library');
    } catch (err: any) {
      toast.error(err.message || 'Liste silinemedi.');
      setDeleting(false);
    }
  };

  // "Okumaya Başla" Butonu (Listenin ilk hikayesini başlatır)
  const handleStartReading = () => {
    if (stories.length === 0) {
      toast.info('Bu listede henüz okunacak hikaye yok.');
      return;
    }
    const firstStory = stories[0];
    const slug = (firstStory as any).slug || firstStory.storyId;
    router.push(firstStory.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Okuma listesi yükleniyor...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground">
          <ListMusic size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Okuma Listesi Bulunamadı</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Bu okuma listesi silinmiş olabilir ya da bağlantı geçersiz olabilir.
        </p>
        <button
          onClick={() => router.push('/explore')}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25"
        >
          Keşfet&apos;e Dön
        </button>
      </div>
    );
  }

  // Gizli liste kontrolü
  if (!list.isPublic && !isOwner) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Bu Liste Gizlidir</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Bu okuma listesi oluşturan kişi tarafından özel (gizli) olarak ayarlanmış.
        </p>
        <button
          onClick={() => router.push('/explore')}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25"
        >
          Keşfet&apos;e Dön
        </button>
      </div>
    );
  }

  const covers = stories.map(s => s.coverImage || (s as any).coverUrl).filter(Boolean) as string[];

  // Toplam tahmini okuma süresi hesaplama
  const totalChapters = stories.reduce((acc, s) => acc + (s.stats?.chapterCount || 0), 0);
  const estimatedHours = Math.max(1, Math.round((totalChapters * 12) / 60));

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      {/* ── 1. Hero Bölümü (Spotify Playlist Estetiği + Ambient Glow) ── */}
      <div className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-8 border-b border-border/20 bg-gradient-to-b from-indigo-950/30 via-background to-background">
        {/* Arkadaki Bulanık Işıma Efekti (Ambient Glow) */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Sol: 2x2 Mozaik Albüm Kapağı */}
          <div className="shrink-0 group relative">
            <ReadingListCoverCollage
              covers={covers}
              customCoverUrl={list.coverUrl}
              size="lg"
              className="shadow-2xl ring-1 ring-border/20"
            />
          </div>

          {/* Sağ: Liste Başlığı, Küratör ve İstatistikler */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {/* Rozet */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2.5">
              <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-widest border border-primary/30">
                OKUMA LİSTESİ
              </span>
              {!list.isPublic && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold flex items-center gap-1 border border-amber-500/25">
                  <Lock size={10} /> Gizli Liste
                </span>
              )}
            </div>

            {/* Büyük Başlık */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-3">
              {list.title}
            </h1>

            {/* Açıklama */}
            {list.description && (
              <p className="text-sm text-muted-foreground/90 max-w-2xl leading-relaxed mb-4">
                {list.description}
              </p>
            )}

            {/* Küratör Bilgisi & İstatistikler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-foreground/80 font-medium">
              <Link
                href={list.userUsername ? `/profile/@${list.userUsername}` : '#'}
                className="flex items-center gap-2 hover:text-primary transition-colors font-bold"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                  {list.userAvatar ? (
                    <img src={list.userAvatar} alt={list.userName} className="w-full h-full object-cover" />
                  ) : (
                    list.userName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span>{list.userName || 'Readixon Okuru'}</span>
              </Link>

              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen size={13} className="text-primary" /> {stories.length} Hikaye
              </span>

              {totalChapters > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-primary" /> ~{estimatedHours} Saat Okuma
                  </span>
                </>
              )}

              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart size={13} className="text-rose-500 fill-current" /> {likeCount} Beğeni
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Eylem Çubuğu (Spotify Play, Like, Share Butonları) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Büyük Spotify Tarzı Oynat / Oku Butonu */}
          <button
            onClick={handleStartReading}
            disabled={stories.length === 0}
            className="h-14 px-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-base flex items-center gap-2.5 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
          >
            <Play size={22} className="fill-current ml-0.5" />
            <span>Okumaya Başla</span>
          </button>

          {/* Beğen Butonu (Kalp) */}
          <button
            onClick={handleToggleLike}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
              isLiked
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 shadow-sm'
                : 'bg-card/70 border-border/40 text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
            title={isLiked ? 'Beğeniyi Kaldır' : 'Listeyi Beğen'}
          >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          </button>

          {/* Paylaş Butonu */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="w-12 h-12 rounded-full border border-border/40 bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-all shadow-sm"
            title="Listeyi Paylaş"
          >
            <Share2 size={19} />
          </button>

          {/* Sahip İçin: Kitap Ekle */}
          {isOwner && (
            <button
              onClick={() => setIsAddBookModalOpen(true)}
              className="h-12 px-5 rounded-full bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-xs sm:text-sm flex items-center gap-2 border border-primary/30 transition-all shadow-sm"
            >
              <Plus size={16} /> Kitap Ekle
            </button>
          )}
        </div>

        {/* Sahip İçin Eylemler: Düzenle & Sil */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-border/40 bg-card/70 hover:bg-card text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Edit3 size={15} /> Düzenle
            </button>
            <button
              onClick={handleDeleteList}
              disabled={deleting}
              className="px-3.5 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 size={15} /> {deleting ? 'Siliniyor...' : 'Sil'}
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Hikaye Parça Listesi (Spotify Tracklist Tablosu) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-4">
        {stories.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border/40 p-8 bg-card/20">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">
              Bu okuma listesinde henüz hikaye yok
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
              Hikaye detay sayfalarındaki &quot;Listeye Ekle&quot; butonuna basarak bu listeye hikayeler
              ekleyebilirsiniz.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isOwner && (
                <button
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  <Plus size={16} /> Kitap Ara ve Ekle
                </button>
              )}
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/40 hover:bg-card text-foreground font-bold text-xs transition-colors"
              >
                Hikayeleri Keşfet
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Tablo Başlığı (Masaüstünde) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Hikaye & Yazar</div>
              <div className="col-span-3">Tür & Format</div>
              <div className="col-span-2 text-right">Bölüm & İstatistik</div>
              <div className="col-span-1 text-right">İşlem</div>
            </div>

            {/* Parça / Hikaye Satırları */}
            {stories.map((story, index) => {
              const slug = (story as any).slug || story.storyId;
              const storyUrl = story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`;

              return (
                <div
                  key={story.storyId}
                  className="group relative flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 md:gap-4 p-3.5 md:px-4 md:py-3 rounded-2xl hover:bg-card/70 border border-transparent hover:border-border/30 transition-all duration-200"
                >
                  {/* # Sıra Numarası */}
                  <div className="hidden md:flex col-span-1 items-center justify-center font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    {index + 1}
                  </div>

                  {/* Kapak + Başlık + Yazar */}
                  <div className="col-span-5 flex items-center gap-3.5 min-w-0 w-full">
                    <Link
                      href={storyUrl}
                      className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-muted/20 shadow-md group-hover:shadow-primary/20 transition-all block"
                    >
                      <img
                        src={story.coverImage || (story as any).coverUrl || '/placeholder.png'}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={storyUrl}
                        className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate block"
                      >
                        {story.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {story.authorName || 'Bilinmeyen Yazar'}
                      </p>
                    </div>
                  </div>

                  {/* Format & Tür Etiketleri */}
                  <div className="col-span-3 flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    <span className="px-2 py-0.5 rounded-md bg-muted/30 border border-border/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {story.format === 'webtoon' ? '🎨 Webtoon' : '📖 Roman'}
                    </span>
                    {(story.tags?.[0] || (story as any).genre) && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                        {story.tags?.[0] || (story as any).genre}
                      </span>
                    )}
                  </div>

                  {/* Bölüm & İstatistikler */}
                  <div className="col-span-2 flex items-center justify-between md:justify-end gap-3 text-xs text-muted-foreground font-medium w-full md:w-auto">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} className="opacity-70" />
                      {story.stats?.chapterCount || 0} Bölüm
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={12} className="fill-current" />
                      {story.stats?.rating ? Number(story.stats.rating).toFixed(1) : '-'}
                    </span>
                  </div>

                  {/* Aksiyon: Oku Butonu & Listeden Çıkar */}
                  <div className="col-span-1 flex items-center justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/10">
                    <Link
                      href={storyUrl}
                      className="px-3.5 py-1.5 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-xs transition-colors shadow-sm"
                    >
                      Oku
                    </Link>

                    {isOwner && (
                      <button
                        onClick={() => handleRemoveStory(story.storyId, story.title)}
                        className="w-8 h-8 rounded-lg hover:bg-rose-500/15 text-muted-foreground hover:text-rose-500 flex items-center justify-center transition-colors"
                        title="Listeden Çıkar"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paylaş Modal */}
      <ShareReadingListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        list={list}
        stories={stories}
      />

      {/* Düzenle Modal */}
      {isOwner && firebaseUser && (
        <CreateReadingListModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={firebaseUser.uid}
          editingList={list}
          onSuccess={updated => setList(prev => (prev ? { ...prev, ...updated } : null))}
        />
      )}

      {/* Kitap Arama ve Listeye Ekleme Modalı */}
      {isOwner && (
        <StorySearchModal
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          onSelect={handleAddStory}
        />
      )}
    </div>
  );
}
