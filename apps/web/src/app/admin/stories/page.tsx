"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getAdminStories, Story } from '@readixon/core';
import type { DocumentSnapshot } from 'firebase/firestore';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  useEffect(() => {
    loadInitialStories();
  }, []);

  const loadInitialStories = async () => {
    setLoading(true);
    const result = await getAdminStories(20);
    setStories(result.data);
    setLastDoc(result.lastDoc);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    const result = await getAdminStories(20, lastDoc);
    setStories((prev) => [...prev, ...result.data]);
    setLastDoc(result.lastDoc);
    setLoadingMore(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Devam Ediyor</span>;
      case 'completed':
        return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Tamamlandı</span>;
      case 'draft':
        return <span className="bg-muted/10 text-muted border border-border/50 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Taslak</span>;
      default:
        return <span className="bg-muted/10 text-muted border border-border/50 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold">Hikayeler</Typography>
          <Typography variant="body" className="text-muted mt-1">Platformdaki tüm hikayelerin ve eserlerin listesi.</Typography>
        </div>
      </div>

      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[35%]">Hikaye</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Yazar</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Durum</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">İstatistikler</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Oluşturulma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <Typography variant="body" className="text-muted">Yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted">Kayıtlı hikaye bulunamadı.</td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr key={story.storyId} className="hover:bg-card/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/admin/stories/${story.storyId}`} className="shrink-0 block">
                          <div className="w-12 h-16 rounded bg-card overflow-hidden border border-border/50 group-hover:border-primary/50 transition-colors">
                            {story.coverImage ? (
                              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted bg-card">
                                <BookOpen size={20} />
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/admin/stories/${story.storyId}`}>
                            <Typography variant="body" className="font-semibold text-text group-hover:text-primary transition-colors truncate">{story.title}</Typography>
                          </Link>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {story.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] bg-muted/10 text-muted px-1.5 py-0.5 rounded">#{tag}</span>
                            ))}
                            {story.tags && story.tags.length > 3 && (
                              <span className="text-[10px] bg-muted/10 text-muted px-1.5 py-0.5 rounded">+{story.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden shrink-0">
                           {story.authorAvatarUrl ? (
                             <img src={story.authorAvatarUrl} alt={story.authorName} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-[10px] text-primary font-bold">
                               {story.authorName?.charAt(0) || 'Y'}
                             </div>
                           )}
                        </div>
                        <div className="min-w-0">
                           <Typography variant="body" className="font-semibold text-sm truncate">{story.authorName}</Typography>
                           {story.authorUsername && (
                             <Typography variant="caption" className="text-muted truncate">@{story.authorUsername}</Typography>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted"><strong className="text-text">{story.stats?.views?.toLocaleString() || 0}</strong> Okunma</span>
                        <span className="text-xs text-muted"><strong className="text-text">{story.stats?.likes?.toLocaleString() || 0}</strong> Beğeni</span>
                        <span className="text-xs text-muted"><strong className="text-text">{story.stats?.chapterCount || 0}</strong> Bölüm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted font-medium">
                      {story.createdAt ? new Date(story.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {lastDoc && (
          <div className="p-4 border-t border-border/50 flex justify-center bg-card/20">
            <Button variant="outline" onPress={loadMore} className="min-w-[200px] border-primary/20 text-primary hover:bg-primary/10">
              {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
