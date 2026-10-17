'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search as SearchIcon, Loader2, Compass, Hash, X, BookOpen, Users,
  Sparkles, TrendingUp, ChevronRight, ChevronDown, GalleryVertical, Wand2, Rocket, Swords,
  Heart, RotateCcw, Cpu, Flame, Zap, Eye, Ghost, ShieldAlert, Smile, Feather,
  Theater, Laugh, Moon, Skull, Brain, PenTool, Hourglass, GraduationCap,
  Coffee, Crown, Fingerprint, FileText, Check
} from 'lucide-react';
import { Typography, Button, StoryCard, AuthorCard } from '@readixon/ui';
import {
  searchStories, searchUsers, POPULAR_TAGS, generateStorySlug,
  followUser, unfollowUser, toggleStoryLike, useAuthStore,
  MAIN_GENRES, getMainGenreById, getMainGenreName,
  type Story, type User, type MainGenreItem
} from '@readixon/core';
import { getGenreIcon } from '@/components/story/genreIcons';
import { toast } from "sonner";

// Tür ikonları eşleştirmesi
const TAG_ICONS: Record<string, React.ElementType> = {
  'webtoon': GalleryVertical,
  'fantasy': Wand2,
  'sci-fi': Rocket,
  'action': Swords,
  'romance': Heart,
  'isekai': RotateCcw,
  'system': Cpu,
  'martial-arts': Flame,
  'thriller': Zap,
  'mystery': Eye,
  'adventure': Compass,
  'supernatural': Moon,
  'dark-fantasy': Skull,
  'horror': Ghost,
  'dystopian': ShieldAlert,
  'cyberpunk': Cpu,
  'post-apocalyptic': ShieldAlert,
  'mythology': Crown,
  'crime': Fingerprint,
  'drama': Theater,
  'comedy': Laugh,
  'young-adult': Smile,
  'school': GraduationCap,
  'slice-of-life': Coffee,
  'psychological': Brain,
  'historical': Hourglass,
  'literary-fiction': Feather,
  'fanfiction': FileText,
  'paranormal': Sparkles,
  'vampire': Skull,
  'short-story': BookOpen,
  'poetry': PenTool,
  'adult': Flame,
};

// Hızlı keşif için önerilen öne çıkan ana türler
const FEATURED_EXPLORE_GENRES = [
  'fantastik',
  'macera-fantastigi-ve-oyunlasmis-kurgu',
  'dogu-ve-asya-kurgu',
  'romantik',
  'bilim-kurgu',
  'aksiyon-ve-macera',
  'gizem-ve-polisiye',
  'korku',
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlGenre = searchParams.get('genre') || searchParams.get('tag');
  const urlSub = searchParams.get('sub');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(urlGenre);
  const [selectedSubGenre, setSelectedSubGenre] = useState<string | null>(urlSub);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Story[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState<'stories' | 'users'>('stories');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const { firebaseUser, userProfile, followingIds, toggleFollowingId } = useAuthStore();

  const handleLikePress = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    try {
      const nowLiked = await toggleStoryLike(storyId, firebaseUser.uid);
      const likeDelta = nowLiked ? 1 : -1;
      setResults(prev => prev.map(s =>
        s.storyId === storyId
          ? { ...s, stats: { ...s.stats, likes: Math.max(0, (s.stats?.likes || 0) + likeDelta) } }
          : s
      ));
    } catch (error) {
      console.error("Beğeni hatası:", error);
    }
  };

  // URL parametresi değiştiğinde tür ve alt türü senkronize et
  useEffect(() => {
    const g = searchParams.get('genre') || searchParams.get('tag');
    const s = searchParams.get('sub');
    if (g || s) {
      if (g) setSelectedGenre(g);
      if (s) setSelectedSubGenre(s);
      setSearchType('stories');
    }
  }, [searchParams]);

  // Debounced Arama
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() || selectedGenre || selectedSubGenre) {
        performSearch(searchTerm, selectedGenre, selectedSubGenre, searchType);
      } else {
        setResults([]);
        setUserResults([]);
        setHasSearched(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedGenre, selectedSubGenre, searchType]);

  const performSearch = async (
    term: string, 
    genre: string | null, 
    sub: string | null, 
    type: 'stories' | 'users'
  ) => {
    setLoading(true);
    setHasSearched(true);
    try {
      if (type === 'stories') {
        const tagsToSearch = sub ? [sub] : (genre ? [genre] : []);
        const stories = await searchStories(term, tagsToSearch, 60, genre || undefined);
        setResults(stories);
        setUserResults([]);
      } else {
        const users = await searchUsers(term);
        setUserResults(users);
        setResults([]);
      }
    } catch (error) {
      console.error("Arama yapılırken hata oluştu:", error);
      setResults([]);
      setUserResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh listener
  useEffect(() => {
    const handlePullRefresh = () => {
      if (searchTerm.trim() || selectedGenre || selectedSubGenre) {
        performSearch(searchTerm, selectedGenre, selectedSubGenre, searchType);
      }
    };
    window.addEventListener('readixon:refresh', handlePullRefresh);
    return () => window.removeEventListener('readixon:refresh', handlePullRefresh);
  }, [searchTerm, selectedGenre, selectedSubGenre, searchType]);

  const handleGenreToggle = (genreId: string) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      setSelectedSubGenre(null);
    } else {
      setSelectedGenre(genreId);
      setSelectedSubGenre(null);
      if (searchType !== 'stories') {
        setSearchType('stories');
      }
    }
  };

  const handleSubGenreToggle = (subId: string) => {
    if (selectedSubGenre === subId) {
      setSelectedSubGenre(null);
    } else {
      setSelectedSubGenre(subId);
    }
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedSubGenre(null);
    setHasSearched(false);
    setResults([]);
    setUserResults([]);
  };

  // Seçili Ana Tür Nesnesi
  const activeMainGenre = useMemo(() => {
    return getMainGenreById(selectedGenre);
  }, [selectedGenre]);

  // Seçili Alt Tür Nesnesi
  const activeSubGenreObj = useMemo(() => {
    if (!activeMainGenre || !selectedSubGenre) return undefined;
    return activeMainGenre.subGenres.find((s) => s.id === selectedSubGenre);
  }, [activeMainGenre, selectedSubGenre]);

  const renderContent = () => {
    // 1. Yükleniyor Durumu
    if (loading) {
      return (
        <div className="w-full py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
          <Typography variant="body" className="text-muted text-sm animate-pulse">
            {searchType === 'stories' ? 'Hikayeler taranıyor...' : 'Yazarlar aranıyor...'}
          </Typography>
        </div>
      );
    }

    // 2. Arama Yapıldı ve Sonuç Bulunamadı
    if (hasSearched && ((searchType === 'stories' && results.length === 0) || (searchType === 'users' && userResults.length === 0))) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-card border border-border/80 flex items-center justify-center mb-5 shadow-sm text-muted/50">
            <SearchIcon size={36} />
          </div>
          <Typography variant="h3" className="mb-2 text-text font-bold text-xl">Sonuç Bulunamadı</Typography>
          <Typography variant="body" className="text-muted text-sm max-w-md mx-auto mb-6 leading-relaxed">
            {searchTerm ? `"${searchTerm}" aramasına ve seçili filtrelere uygun bir ${searchType === 'stories' ? 'eser' : 'yazar'} bulunamadı.` : 'Seçtiğiniz kategoriye ait henüz bir eser bulunmuyor.'}
          </Typography>
          <Button
            variant="secondary"
            onPress={handleClearAll}
            className="rounded-full px-6 py-2.5 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
          >
            Filtreleri Temizle
          </Button>
        </div>
      );
    }

    // 3. Henüz Arama Yapılmadı (Keşif Başlangıç Ekranı)
    if (!hasSearched) {
      return (
        <div className="w-full py-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-md">
            <Compass size={32} />
          </div>
          <Typography variant="h2" className="text-xl md:text-2xl font-bold text-text mb-2">
            Nereden Başlamak İstersin?
          </Typography>
          <Typography variant="body" className="text-muted text-sm max-w-lg mb-8 leading-relaxed">
            Yukarıdaki arama çubuğunu kullanabilir veya en çok ilgi gören popüler türlerden birini seçerek hemen keşfetmeye başlayabilirsin.
          </Typography>

          {/* Hızlı Keşif Kartları Grid */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURED_EXPLORE_GENRES.map((genreId) => {
              const genre = getMainGenreById(genreId);
              if (!genre) return null;
              return (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-card/60 hover:bg-card border border-border/80 hover:border-primary/50 text-text transition-all duration-200 shadow-xs hover:shadow hover:-translate-y-0.5 text-left cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    {(() => {
                      const FeatIcon = getGenreIcon(genre.id);
                      return <FeatIcon size={15} strokeWidth={2} />;
                    })()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs md:text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                      {genre.name}
                    </span>
                    <span className="block text-[11px] text-muted truncate">
                      {genre.subGenres.length} alt tür
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 4. Hikaye Sonuçları
    if (searchType === 'stories') {
      return (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-base md:text-lg font-bold text-text">
                {results.length} Eser Bulundu
              </span>
              {activeMainGenre && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
                  {(() => {
                    const ActiveIcon = getGenreIcon(activeMainGenre.id);
                    return <ActiveIcon size={12} strokeWidth={2} className="shrink-0" />;
                  })()}
                  <span>{activeMainGenre.name}</span>
                  {activeSubGenreObj && (
                    <>
                      <span className="opacity-40">/</span>
                      <span>{activeSubGenreObj.name}</span>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (selectedSubGenre) {
                        setSelectedSubGenre(null);
                      } else {
                        setSelectedGenre(null);
                      }
                    }}
                    className="hover:opacity-75 transition-opacity cursor-pointer ml-0.5"
                    aria-label="Filtreyi kaldır"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-muted hover:text-primary transition-colors cursor-pointer"
            >
              Aramayı Sıfırla
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3.5 sm:gap-4 md:gap-5">
            {results.map((story) => (
              <div key={story.storyId} className="w-full min-w-0 max-w-full transition-transform duration-300 hover:-translate-y-1.5">
                <StoryCard
                  title={story.title}
                  authorName={story.authorName || `Yazar: ${story.authorId.substring(0, 6)}`}
                  authorUsername={story.authorUsername}
                  authorAvatarUrl={story.authorAvatarUrl}
                  coverImage={story.coverImage}
                  views={story.stats?.views || 0}
                  likes={story.stats?.likes || 0}
                  tags={story.tags || []}
                  badgeText={
                    story.mainGenre && getMainGenreById(story.mainGenre)
                      ? getMainGenreById(story.mainGenre)!.name
                      : story.tags?.find((t) => getMainGenreById(t))
                        ? getMainGenreById(story.tags.find((t) => getMainGenreById(t))!)?.name
                        : selectedGenre && getMainGenreById(selectedGenre)
                          ? getMainGenreById(selectedGenre)!.name
                          : undefined
                  }
                  isLiked={!!userProfile?.likedStoryIds?.includes(story.storyId)}
                  isWebtoon={story.format === 'webtoon'}
                  status={story.status}
                  chapterCount={story.stats?.chapterCount}
                  onPress={() => {
                    const slug = (story as any).slug || generateStorySlug(story.title, story.storyId);
                    router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                  }}
                  onLikePress={(e) => handleLikePress(e, story.storyId)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. Yazar Sonuçları
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-base md:text-lg font-bold text-text">
            {userResults.length} Yazar Bulundu
          </span>
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-muted hover:text-primary transition-colors"
          >
            Aramayı Sıfırla
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 md:gap-5">
          {userResults.map((author) => (
            <div key={author.uid} className="w-full transition-transform duration-300 hover:-translate-y-1">
              <AuthorCard
                name={author.displayName}
                username={author.username || 'bilinmiyor'}
                avatarUrl={author.avatarUrl}
                followers={author.stats?.followers || 0}
                isFollowing={followingIds.includes(author.uid)}
                isPremium={author.status === 'premium'}
                onPress={() => {
                  if (author.username) {
                    router.push(`/profile/@${author.username}`);
                  } else {
                    toast('Bu yazar henüz bir kullanıcı adı belirlememiş.');
                  }
                }}
                onFollowPress={async (e) => {
                  e.stopPropagation();
                  if (!firebaseUser) {
                    router.push('/login');
                    return;
                  }
                  const isCurrentlyFollowing = followingIds.includes(author.uid);
                  toggleFollowingId(author.uid);
                  try {
                    if (isCurrentlyFollowing) {
                      await unfollowUser(firebaseUser.uid, author.uid);
                    } else {
                      await followUser(firebaseUser.uid, author.uid);
                    }
                  } catch (error) {
                    console.error("Takip işlemi başarısız:", error);
                    toggleFollowingId(author.uid);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col w-full px-6 md:px-16 py-8 md:py-12 bg-background overflow-x-hidden min-h-[calc(100vh-80px)]">
      {/* Ambient Merkez Işık */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-primary/5 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* ── 1. Başlık & Arama Çubuğu Hub ── */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center mb-8">
        <Typography variant="h1" className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-3">
          Keşfet & Ara
        </Typography>
        <Typography variant="body" className="text-muted text-sm md:text-base max-w-xl mb-6">
          Binlerce hikaye, webtoon ve yetenekli yazar arasında dilediğini anında bul.
        </Typography>

        {/* Sekmeler (Hikayeler / Yazarlar Segmented Control) */}
        <div className="p-1 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-md inline-flex items-center gap-1 mb-6 shadow-sm">
          <button
            onClick={() => setSearchType('stories')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              searchType === 'stories'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-muted hover:text-text'
            }`}
          >
            <BookOpen size={15} className={searchType === 'stories' ? 'text-white' : 'text-muted'} />
            <span className={searchType === 'stories' ? 'text-white font-bold' : ''}>Hikayeler & Webtoonlar</span>
          </button>
          <button
            onClick={() => setSearchType('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              searchType === 'users'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-muted hover:text-text'
            }`}
          >
            <Users size={15} className={searchType === 'users' ? 'text-white' : 'text-muted'} />
            <span className={searchType === 'users' ? 'text-white font-bold' : ''}>Yazarlar</span>
          </button>
        </div>

        {/* Lüks Arama Kutusu */}
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none flex items-center justify-center">
            <SearchIcon size={22} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchTerm('');
            }}
            placeholder={
              searchType === 'stories'
                ? "Hikaye, webtoon adı veya anahtar kelime ara..."
                : "Yazar adı veya kullanıcı adı ara..."
            }
            className="w-full h-14 md:h-16 pl-12 pr-12 rounded-2xl bg-card/75 border border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm md:text-base font-medium text-text placeholder:text-muted/60 shadow-lg shadow-black/5 backdrop-blur-md transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/10 hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-all cursor-pointer z-10"
              aria-label="Aramayı temizle"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Kategori Çipleri (Readixon Tür Defteri: 30 Ana Tür & Alt Türler) ── */}
      {searchType === 'stories' && (
        <section className="relative w-full mb-10">
          {/* Başlık ve Gezinme Kontrolleri */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
                <Compass size={19} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Typography variant="h3" className="font-bold text-lg md:text-xl text-text leading-tight">
                    Neler Okumak İstersin?
                  </Typography>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {MAIN_GENRES.length} Ana Tür
                  </span>
                </div>
                <Typography variant="caption" className="text-xs text-muted">
                  İlgi alanına uygun ana türü seç, dilersen alt türlerle aramanı derinleştir
                </Typography>
              </div>
            </div>

            {(selectedGenre || selectedSubGenre) && (
              <button
                onClick={handleClearAll}
                className="text-xs md:text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 transition-all mr-1 cursor-pointer"
              >
                <span>Filtreyi Temizle</span>
                <X size={14} />
              </button>
            )}
          </div>

          {/* ── MOBİL GÖRÜNÜM: Kapalıyken 1 Sıra Yatay Kaydırma, Açıkken Grid (sm:hidden) ── */}
          <div className="sm:hidden">
            {!isCategoriesExpanded ? (
              <div className="overflow-x-auto pb-1 scrollbar-hide snap-x scroll-smooth -mx-6 px-6">
                <div className="flex items-center gap-2 w-max py-1">
                  {MAIN_GENRES.map((genre) => {
                    const isSelected = selectedGenre === genre.id;
                    const GenreIcon = getGenreIcon(genre.id);
                    return (
                      <button
                        key={`mob-${genre.id}`}
                        onClick={() => handleGenreToggle(genre.id)}
                        className={`group snap-start h-9 shrink-0 flex items-center gap-2 px-3 rounded-xl border transition-all duration-200 text-left cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-card/75 hover:bg-card border-border/80 hover:border-primary/50 text-text'
                        }`}
                        title={genre.description}
                      >
                        <GenreIcon
                          size={13}
                          strokeWidth={isSelected ? 2.2 : 1.8}
                          className={isSelected ? 'text-white' : 'text-primary/80'}
                        />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {genre.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 py-1">
                {MAIN_GENRES.map((genre) => {
                  const isSelected = selectedGenre === genre.id;
                  const GenreIcon = getGenreIcon(genre.id);
                  return (
                    <button
                      key={`mob-exp-${genre.id}`}
                      onClick={() => handleGenreToggle(genre.id)}
                      className={`group w-full h-10 flex items-center gap-2 px-2.5 rounded-xl border transition-all duration-200 text-left cursor-pointer select-none ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-card/75 hover:bg-card border-border/80 hover:border-primary/50 text-text'
                      }`}
                      title={genre.description}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        <GenreIcon size={12} strokeWidth={2} />
                      </span>
                      <span className={`text-xs truncate block flex-1 ${
                        isSelected ? 'font-bold text-white' : 'font-medium text-text'
                      }`}>
                        {genre.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── MASAÜSTÜ / TABLET GÖRÜNÜM: İlk Sıra / Genişletilebilir Grid (hidden sm:grid) ── */}
          <div
            className={`hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
              isCategoriesExpanded ? 'max-h-[900px] opacity-100' : 'max-h-[44px]'
            }`}
          >
            {MAIN_GENRES.map((genre) => {
              const isSelected = selectedGenre === genre.id;
              const GenreIcon = getGenreIcon(genre.id);
              return (
                <button
                  key={`desk-${genre.id}`}
                  onClick={() => handleGenreToggle(genre.id)}
                  className={`group w-full h-10 flex items-center gap-2.5 px-3 rounded-xl border transition-all duration-200 text-left shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs scale-[1.01]'
                      : 'bg-card/60 hover:bg-card border-border/70 hover:border-primary/40 text-text'
                  }`}
                  title={genre.description}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <GenreIcon size={13} strokeWidth={2} />
                  </span>
                  <span className={`text-xs truncate flex-1 ${
                    isSelected ? 'font-bold text-white' : 'font-medium text-text group-hover:text-primary transition-colors'
                  }`}>
                    {genre.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Şık Açılır / Kapanır Aşağı Oku Butonu */}
          <div className="flex justify-center mt-3.5">
            <button
              type="button"
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 hover:bg-card border border-border/80 hover:border-primary/40 text-muted hover:text-primary transition-all duration-200 shadow-xs text-xs font-semibold cursor-pointer select-none"
              aria-label={isCategoriesExpanded ? "Daha az göster" : "Tüm kategorileri göster"}
            >
              <span>{isCategoriesExpanded ? 'Daha Az Göster' : `Tüm Ana Türleri Göster (${MAIN_GENRES.length})`}</span>
              <span className={`w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 ${
                isCategoriesExpanded ? 'rotate-180 bg-primary text-white' : 'group-hover:translate-y-0.5'
              }`}>
                <ChevronDown size={13} />
              </span>
            </button>
          </div>

          {/* ── 2.B. Seçili Ana Türün Alt Türleri (Subgenres Filter Strip) ── */}
          {activeMainGenre && (
            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-card/90 border border-primary/30 shadow-md backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {(() => {
                      const ActiveIcon = getGenreIcon(activeMainGenre.id);
                      return <ActiveIcon size={16} strokeWidth={2} />;
                    })()}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>{activeMainGenre.name} Alt Türleri</span>
                      <span className="text-[11px] font-medium text-muted bg-muted/20 px-2 py-0.5 rounded-md">
                        {activeMainGenre.subGenres.length} adet
                      </span>
                    </h4>
                    <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                      {activeMainGenre.description}
                    </p>
                  </div>
                </div>

                {selectedSubGenre && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubGenre(null)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer self-start sm:self-center shrink-0"
                  >
                    Alt Tür Filtresini Kaldır
                  </button>
                )}
              </div>

              {/* Alt Tür Hapları */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-44 overflow-y-auto pr-1">
                {activeMainGenre.subGenres.map((sub) => {
                  const isSubSelected = selectedSubGenre === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubGenreToggle(sub.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSubSelected
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30 scale-[1.02]'
                          : 'bg-muted/15 hover:bg-muted/30 border border-border/50 text-foreground hover:border-primary/40'
                      }`}
                      title={sub.description}
                    >
                      {isSubSelected && <Check size={12} className="stroke-[3]" />}
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 3. Sonuçlar Alanı ── */}
      <div className="w-full flex-1">
        {renderContent()}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}>
      <SearchContent />
    </React.Suspense>
  );
}
