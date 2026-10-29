'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Star, 
  Layers, 
  ExternalLink, 
  X, 
  Bookmark, 
  ChevronRight,
  Eye,
  Award,
  Sparkles
} from 'lucide-react';
import type { AuthorSite, Story } from '@readixon/core';
import { getAuthorPublishedStories, getStoriesByIds } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
  initialStories?: Story[];
}

export function AtelierBookshelf({ site, initialStories }: Props) {
  const { 
    themeClasses, 
    primaryColor, 
    fontHeadingFamily, 
    cardRadiusClass,
    isDark, 
    template 
  } = useAtelierTheme();

  const [stories, setStories] = useState<Story[]>(initialStories || []);
  const [isLoading, setIsLoading] = useState(!initialStories);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const booksConfig = site.booksConfig;

  useEffect(() => {
    if (initialStories && initialStories.length > 0) {
      setStories(initialStories);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        let fetched: Story[] = [];

        if (booksConfig?.selectedStoryIds && booksConfig.selectedStoryIds.length > 0) {
          fetched = await getStoriesByIds(booksConfig.selectedStoryIds);
        } else if (site.userId) {
          fetched = await getAuthorPublishedStories(site.userId);
        }

        if (isMounted) {
          setStories(fetched);
        }
      } catch (err) {
        console.error('[AtelierBookshelf] Kitapları getirme hatası:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, [site.userId, booksConfig?.selectedStoryIds, initialStories]);

  if (!site.enabledBlocks?.books) return null;

  return (
    <section id="books" className={`py-16 sm:py-24 border-t border-b transition-colors ${themeClasses.border}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kütüphane</span>
          </div>
          
          <h2 
            className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ 
              fontFamily: fontHeadingFamily,
              letterSpacing: template === 'worldbuilder' ? '0.06em' : '-0.02em'
            }}
          >
            {booksConfig?.title || 'Eserlerim & Romanlarım'}
          </h2>

          {template === 'novelist' && (
            <div className="flex items-center justify-center gap-2 mb-3 opacity-60 text-amber-600/70 text-xs">
              <span>───</span><span>✦</span><span>───</span>
            </div>
          )}

          {booksConfig?.description && (
            <p className={`text-sm sm:text-base ${themeClasses.muted}`}>
              {booksConfig.description}
            </p>
          )}
        </div>

        {/* Yükleniyor Durumu */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div 
              className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {/* Eser Bulunamadı Durumu */}
        {!isLoading && stories.length === 0 && (
          <div className={`text-center py-12 px-6 ${cardRadiusClass} border ${themeClasses.card} ${themeClasses.border}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-semibold mb-1">Henüz Yayınlanmış Kitap Bulunmuyor</h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto ${themeClasses.muted}`}>
              Yazar Stüdyosu'ndan yeni bir hikaye yayınladığınızda veya öne çıkarılan kitapları seçtiğinizde burada listelenecektir.
            </p>
          </div>
        )}

        {/* Kitap Kartları Izgarası (Grid) */}
        {!isLoading && stories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stories.map((story) => {
              const storyKey = story.storyId || (story as any).id;
              const primaryGenre = story.tags?.[0] || 'Edebiyat';
              return (
                <div
                  key={storyKey}
                  onClick={() => setSelectedStory(story)}
                  className={`group relative flex flex-col ${cardRadiusClass} border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${themeClasses.card} ${themeClasses.border} ${themeClasses.cardHover}`}
                >
                  {/* Kitap Kapağı Alanı */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}55, #101014)`,
                        }}
                      >
                        <BookOpen className="w-12 h-12 mb-3 opacity-60" />
                        <span 
                          className="font-bold text-lg line-clamp-2"
                          style={{ fontFamily: fontHeadingFamily }}
                        >
                          {story.title}
                        </span>
                      </div>
                    )}

                    {/* Sol Kitap Sırtı İllüzyonu (3D Cilt Efekti) */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />

                    {/* Kategori Rozeti */}
                    {primaryGenre && (
                      <div 
                        className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider backdrop-blur-md bg-black/60 shadow-md ${
                          template === 'webtoon' ? 'rounded-full' : 'rounded-md'
                        }`}
                      >
                        {primaryGenre}
                      </div>
                    )}

                    {/* Editör Rozeti */}
                    {booksConfig?.showEditorialBadge && (story.stats?.rating || 0) >= 8 && (
                      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-amber-500 text-white shadow-md">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Kitap Bilgileri */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        className="text-lg font-bold tracking-tight mb-2 group-hover:opacity-85 line-clamp-1"
                        style={{ 
                          fontFamily: fontHeadingFamily,
                          letterSpacing: template === 'worldbuilder' ? '0.04em' : 'normal'
                        }}
                      >
                        {story.title}
                      </h3>

                      {story.summary && (
                        <p className={`text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed ${themeClasses.muted}`}>
                          {story.summary}
                        </p>
                      )}
                    </div>

                    <div className={`pt-3 border-t ${themeClasses.border} flex items-center justify-between text-xs`}>
                      <div className="flex items-center gap-3">
                        {booksConfig?.showChapterCount && (
                          <span className={`flex items-center gap-1 font-medium ${themeClasses.muted}`}>
                            <Layers className="w-3.5 h-3.5" />
                            <span>{story.stats?.chapterCount || 0} Bölüm</span>
                          </span>
                        )}

                        {booksConfig?.showRatings && (
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{story.stats?.rating ? story.stats.rating.toFixed(1) : '5.0'}</span>
                          </span>
                        )}
                      </div>

                      <span 
                        className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: primaryColor }}
                      >
                        <span>İncele</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* İnteraktif Kitap Önizleme & Okuma Modalı */}
      {selectedStory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedStory(null)}
        >
          <div 
            className={`relative w-full max-w-2xl ${cardRadiusClass} border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] ${themeClasses.card} ${themeClasses.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sol: Kapak Görseli */}
            <div className="w-full md:w-5/12 bg-neutral-900 relative aspect-[3/4] md:aspect-auto">
              {selectedStory.coverImage ? (
                <img
                  src={selectedStory.coverImage}
                  alt={selectedStory.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <BookOpen className="w-16 h-16 opacity-50 mb-2" />
                  <span className="font-bold">{selectedStory.title}</span>
                </div>
              )}
            </div>

            {/* Sağ: Kitap Detayları & Butonlar */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {selectedStory.tags?.[0] || 'Edebiyat'}
                  </span>
                  {selectedStory.stats?.rating && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{selectedStory.stats.rating.toFixed(1)}</span>
                    </span>
                  )}
                </div>

                <h3 
                  className="text-xl sm:text-2xl font-bold tracking-tight mb-3"
                  style={{ fontFamily: fontHeadingFamily }}
                >
                  {selectedStory.title}
                </h3>

                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${themeClasses.muted}`}>
                  {selectedStory.summary || 'Bu kitap için henüz bir özet eklenmemiş.'}
                </p>

                <div className={`grid grid-cols-2 gap-3 mb-6 p-3 ${cardRadiusClass} border ${themeClasses.border} bg-black/5 dark:bg-white/5 text-xs`}>
                  <div>
                    <span className={`block ${themeClasses.muted}`}>Bölüm Sayısı</span>
                    <span className="font-bold">{selectedStory.stats?.chapterCount || 0} Bölüm</span>
                  </div>
                  <div>
                    <span className={`block ${themeClasses.muted}`}>Görüntülenme</span>
                    <span className="font-bold">{(selectedStory.stats?.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Okuma Bağlantısı */}
              <div className={`flex flex-col gap-2.5 pt-4 border-t ${themeClasses.border}`}>
                <Link
                  href={`/story/${selectedStory.storyId || (selectedStory as any).id}`}
                  className="w-full py-3 rounded-full font-bold text-center text-sm text-white shadow-lg transition-transform hover:opacity-95 active:scale-98 flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Readixon'da Okumaya Başla</span>
                </Link>

                <Link
                  href={`/story/${selectedStory.storyId || (selectedStory as any).id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 rounded-full font-medium text-center text-xs border transition-colors flex items-center justify-center gap-1.5 ${themeClasses.border} hover:bg-black/5 dark:hover:bg-white/5`}
                >
                  <span>Yeni Sekmede Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
