"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getStoryById, fetchChapters, getUserProfile, Story, Chapter, User, ContentBlock } from '@readixon/core';
import { ArrowLeft, BookOpen, Clock, Heart, Eye, List, Hash, Download, Award, Music, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChapterViewerModal } from '@/components/ChapterViewerModal';

export default function EditorStoryDetailPage() {
  const { id } = useParams() as { id: string };
  const [story, setStory] = useState<Story | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Chapter Content Viewer Modal State
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Resim indirilemedi", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedStory = await getStoryById(id);
        if (fetchedStory) {
          setStory(fetchedStory);
          
          if (fetchedStory.authorId) {
            const fetchedAuthor = await getUserProfile(fetchedStory.authorId);
            setAuthor(fetchedAuthor);
          }
          
          const fetchedChapters = await fetchChapters(id);
          setChapters(fetchedChapters);
        }
      } catch (error) {
        console.error("Hikaye detayı çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const calculateChapterWords = (blocks: ContentBlock[] = []) => {
    return blocks.reduce((acc, block) => {
      if (block.type === 'paragraph' || block.type === 'quote') {
        const text = (block.text || (block as any).content || '').replace(/<[^>]+>/g, ' ').trim();
        return acc + (text ? text.split(/\s+/).filter(Boolean).length : 0);
      }
      return acc;
    }, 0);
  };

  const openChapterViewer = (index: number) => {
    setSelectedChapterIndex(index);
    setIsViewerOpen(true);
  };

  const handleNextChapter = () => {
    if (selectedChapterIndex !== null && selectedChapterIndex < chapters.length - 1) {
      setSelectedChapterIndex(selectedChapterIndex + 1);
    }
  };

  const handlePrevChapter = () => {
    if (selectedChapterIndex !== null && selectedChapterIndex > 0) {
      setSelectedChapterIndex(selectedChapterIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="space-y-6">
        <Link href="/editor/stories">
          <Button variant="ghost" className="text-muted hover:text-text -ml-4">
            <ArrowLeft size={18} className="mr-2" /> Hikayelere Dön
          </Button>
        </Link>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-12 text-center">
          <Typography variant="h3" className="font-bold text-muted">Hikaye Bulunamadı</Typography>
          <Typography variant="body" className="text-muted mt-2">Bu hikaye silinmiş veya erişilemiyor olabilir.</Typography>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Devam Ediyor</span>;
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Tamamlandı</span>;
      case 'draft':
        return <span className="bg-muted/10 text-muted border border-border/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Taslak</span>;
      default:
        return <span className="bg-muted/10 text-muted border border-border/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{status}</span>;
    }
  };

  const currentViewingChapter = selectedChapterIndex !== null ? chapters[selectedChapterIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/editor/stories">
          <Button variant="ghost" className="text-muted hover:text-text -ml-4">
            <ArrowLeft size={18} className="mr-2" /> Hikayelere Dön
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/editor/reviews/new?storyId=${story.storyId}`}>
            <Button variant="primary" className="flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm">
              <Award size={15} /> Bu Kitabı Değerlendir
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Temel Bilgiler ve Bölümler */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 bg-card/30 border border-border/40 p-6 rounded-2xl">
            <div className="w-32 h-48 sm:w-48 sm:h-72 rounded-xl bg-card overflow-hidden shrink-0 border border-border/50 shadow-xl relative group">
              {story.coverImage ? (
                <>
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                  <button
                    onClick={() => handleDownload(story.coverImage!, `${story.title}-kapak.jpg`)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Kapağı İndir"
                  >
                    <div className="bg-background/80 p-3 rounded-full text-foreground hover:bg-background hover:scale-110 transition-all shadow-lg backdrop-blur-sm">
                      <Download size={24} />
                    </div>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted bg-card/40">
                  <BookOpen size={40} />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {getStatusBadge(story.status || 'draft')}
                  {story.createdAt && (
                    <span className="text-sm text-muted flex items-center gap-1">
                      <Clock size={14} /> {new Date((story.createdAt as any).seconds * 1000).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                  {story.isAdultContent && (
                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">+18 Yetişkin</span>
                  )}
                </div>
                <Typography variant="h2" className="font-bold text-2xl sm:text-3xl text-foreground">{story.title}</Typography>
              </div>

              <div className="flex flex-wrap gap-2">
                {story.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-card text-muted px-2.5 py-1 rounded-full border border-border/50">#{tag}</span>
                ))}
              </div>

              {author && (
                <div className="flex items-center gap-3 p-3 bg-card/60 rounded-xl border border-border/50 max-w-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden shrink-0 border border-primary/20">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        {author.displayName?.charAt(0) || 'Y'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Typography variant="body" className="font-semibold text-sm leading-tight text-foreground">{author.displayName}</Typography>
                    <Typography variant="caption" className="text-muted">@{author.username}</Typography>
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-4">
                <div>
                  <Typography variant="caption" className="text-muted uppercase font-bold text-xs tracking-wider block mb-1">Özet</Typography>
                  <Typography variant="body" className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {story.summary || 'Özet eklenmemiş.'}
                  </Typography>
                </div>

                {story.foreword && (
                  <div>
                    <Typography variant="caption" className="text-muted uppercase font-bold text-xs tracking-wider block mb-1">Önsöz</Typography>
                    <Typography variant="body" className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                      {story.foreword}
                    </Typography>
                  </div>
                )}

                {story.backCover && (
                  <div>
                    <Typography variant="caption" className="text-muted uppercase font-bold text-xs tracking-wider block mb-1">Arka Kapak Yazısı</Typography>
                    <Typography variant="body" className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                      {story.backCover}
                    </Typography>
                  </div>
                )}

                {story.contributors && story.contributors.length > 0 && (
                  <div>
                    <Typography variant="caption" className="text-muted uppercase font-bold text-xs tracking-wider block mb-2">Ekip & Katkıda Bulunanlar</Typography>
                    <div className="flex flex-wrap gap-2">
                      {story.contributors.map((contrib, idx) => (
                        <div key={idx} className="flex flex-col bg-card/60 border border-border/50 rounded-lg px-3 py-1.5 min-w-[120px]">
                          <span className="text-[10px] text-muted uppercase font-bold tracking-wider">{contrib.role}</span>
                          <span className="text-xs font-semibold text-foreground">{contrib.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bölümler Listesi ve İçerik Görüntüleme */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <List size={18} />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-xl">Bölümler ({chapters.length})</Typography>
                  <Typography variant="caption" className="text-muted text-xs">
                    Bölüm içeriklerini okumak ve incelemek için "İçeriği Oku" butonuna tıklayın.
                  </Typography>
                </div>
              </div>
            </div>
            
            <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                      <th className="px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider w-[10%]">Sıra</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider w-[36%]">Bölüm Başlığı</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider w-[18%]">İçerik Detayı</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider w-[14%]">Durum</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider w-[22%] text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {chapters.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                          Bu hikayeye henüz bölüm eklenmemiş.
                        </td>
                      </tr>
                    ) : (
                      chapters.map((chapter, index) => {
                        const words = calculateChapterWords(chapter.contentBlocks);
                        return (
                          <tr key={chapter.chapterId} className="hover:bg-card/40 transition-colors group">
                            <td className="px-5 py-4 font-semibold text-muted text-sm">#{chapter.order ?? index + 1}</td>
                            
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                  {chapter.title || `Bölüm ${index + 1}`}
                                </span>
                                {chapter.audioTrack?.url && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                                    <Music size={11} className="animate-pulse" />
                                    <span>{chapter.audioTrack.title || 'Fon Müziği Var'}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-xs text-muted">
                              <div className="flex flex-col gap-0.5">
                                <span><strong className="text-foreground">{words.toLocaleString()}</strong> Kelime</span>
                                <span>{chapter.contentBlocks?.length || 0} Blok</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              {getStatusBadge(chapter.status || 'draft')}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openChapterViewer(index)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                                  title="Bölüm İçeriğini Oku ve İncele"
                                >
                                  <BookOpen size={13} />
                                  <span>İçeriği Oku</span>
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
          </div>
        </div>

        {/* Sağ Kolon: İstatistikler & Hızlı Aksiyonlar */}
        <div className="space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-2xl p-6 space-y-4">
            <Typography variant="h3" className="font-bold text-lg">Hikaye Özeti</Typography>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-background/60 rounded-xl border border-border/30">
                <span className="text-xs text-muted block mb-1">Toplam Okunma</span>
                <span className="text-xl font-bold text-foreground">{story.stats?.views?.toLocaleString() || 0}</span>
              </div>
              
              <div className="p-3.5 bg-background/60 rounded-xl border border-border/30">
                <span className="text-xs text-muted block mb-1">Beğeni Sayısı</span>
                <span className="text-xl font-bold text-foreground">{story.stats?.likes?.toLocaleString() || 0}</span>
              </div>

              <div className="p-3.5 bg-background/60 rounded-xl border border-border/30">
                <span className="text-xs text-muted block mb-1">Bölüm Sayısı</span>
                <span className="text-xl font-bold text-foreground">{chapters.length}</span>
              </div>

              <div className="p-3.5 bg-background/60 rounded-xl border border-border/30">
                <span className="text-xs text-muted block mb-1">Format</span>
                <span className="text-sm font-bold text-foreground uppercase">{story.format || 'Roman'}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/story/${story.storyId}`} target="_blank">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border/40 hover:bg-background text-xs font-semibold transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Platformda Görüntüle</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bölüm İçerik Görüntüleyici Modal */}
      <ChapterViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        chapter={currentViewingChapter}
        storyTitle={story.title}
        storyId={story.storyId}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        hasPrev={selectedChapterIndex !== null && selectedChapterIndex > 0}
        hasNext={selectedChapterIndex !== null && selectedChapterIndex < chapters.length - 1}
      />
    </div>
  );
}
