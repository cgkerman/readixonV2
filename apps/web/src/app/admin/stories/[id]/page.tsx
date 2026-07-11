"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getStoryById, fetchChapters, getUserProfile, Story, Chapter, User } from '@readixon/core';
import { ArrowLeft, BookOpen, Clock, Heart, Eye, List, Hash } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminStoryDetailPage() {
  const { id } = useParams() as { id: string };
  const [story, setStory] = useState<Story | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Link href="/admin/stories">
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
        return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Tamamlandı</span>;
      case 'draft':
        return <span className="bg-muted/10 text-muted border border-border/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Taslak</span>;
      default:
        return <span className="bg-muted/10 text-muted border border-border/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Link href="/admin/stories">
        <Button variant="ghost" className="text-muted hover:text-text -ml-4">
          <ArrowLeft size={18} className="mr-2" /> Hikayelere Dön
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Temel Bilgiler */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-32 h-48 sm:w-48 sm:h-72 rounded-xl bg-card overflow-hidden shrink-0 border border-border/50 shadow-xl">
              {story.coverImage ? (
                <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted bg-card/40">
                  <BookOpen size={40} />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
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
                <Typography variant="h2" className="font-bold text-3xl">{story.title}</Typography>
              </div>

              <div className="flex flex-wrap gap-2">
                {story.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-card text-muted px-2.5 py-1 rounded-full border border-border/50">#{tag}</span>
                ))}
              </div>

              {author && (
                <div className="flex items-center gap-3 p-3 bg-card/40 rounded-xl border border-border/50 max-w-sm">
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
                    <Typography variant="body" className="font-semibold text-sm leading-tight">{author.displayName}</Typography>
                    <Typography variant="caption" className="text-muted">@{author.username}</Typography>
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-6">
                <div>
                  <Typography variant="h3" className="font-semibold mb-2">Özet</Typography>
                  <Typography variant="body" className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {story.summary || 'Özet eklenmemiş.'}
                  </Typography>
                </div>

                {story.foreword && (
                  <div>
                    <Typography variant="h3" className="font-semibold mb-2">Önsöz</Typography>
                    <Typography variant="body" className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                      {story.foreword}
                    </Typography>
                  </div>
                )}

                {story.backCover && (
                  <div>
                    <Typography variant="h3" className="font-semibold mb-2">Arka Kapak Yazısı</Typography>
                    <Typography variant="body" className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                      {story.backCover}
                    </Typography>
                  </div>
                )}

                {story.contributors && story.contributors.length > 0 && (
                  <div>
                    <Typography variant="h3" className="font-semibold mb-3">Ekip / Katkıda Bulunanlar</Typography>
                    <div className="flex flex-wrap gap-2">
                      {story.contributors.map((contrib, idx) => (
                        <div key={idx} className="flex flex-col bg-card/60 border border-border/50 rounded-lg px-3 py-2 min-w-[120px]">
                          <span className="text-[10px] text-muted uppercase font-bold tracking-wider">{contrib.role}</span>
                          <span className="text-sm font-semibold text-text">{contrib.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bölümler Listesi */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <List className="text-primary" size={24} />
              <Typography variant="h3" className="font-bold">Bölümler ({chapters.length})</Typography>
            </div>
            
            <div className="bg-card/40 border border-border/50 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                      <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[10%]">Sıra</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[50%]">Başlık</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Durum</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Yayın Tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {chapters.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-muted">Bölüm bulunamadı.</td>
                      </tr>
                    ) : (
                      chapters.map((chapter, index) => (
                        <tr key={chapter.chapterId} className="hover:bg-card/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-muted">#{chapter.order ?? index + 1}</td>
                          <td className="px-6 py-4 font-semibold">{chapter.title || `Bölüm ${index + 1}`}</td>
                          <td className="px-6 py-4">
                            {chapter.status === 'published' ? (
                              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded font-semibold uppercase">Yayında</span>
                            ) : chapter.status === 'draft' ? (
                              <span className="text-xs text-muted bg-muted/10 px-2 py-1 rounded font-semibold uppercase">Taslak</span>
                            ) : (
                              <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded font-semibold uppercase">{chapter.status || 'Bilinmiyor'}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted">
                            {chapter.publishDate ? new Date((chapter.publishDate as any).seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: İstatistikler */}
        <div className="space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-xl p-6 shadow-sm">
            <Typography variant="h3" className="font-bold mb-6">İstatistikler</Typography>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Eye size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Toplam Okunma</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{story.stats?.views?.toLocaleString() || 0}</Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Toplam Beğeni</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{story.stats?.likes?.toLocaleString() || 0}</Typography>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Hash size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Toplam Bölüm</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{story.stats?.chapterCount || chapters.length}</Typography>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card/40 border border-border/50 rounded-xl p-6 shadow-sm text-center">
            <Typography variant="body" className="text-sm text-muted">
              Hikaye ID: <span className="font-mono text-text">{story.storyId}</span>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
