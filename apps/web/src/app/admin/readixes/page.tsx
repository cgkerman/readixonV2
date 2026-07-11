"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getAdminReadixes, Readix } from '@readixon/core';
import type { DocumentSnapshot } from 'firebase/firestore';
import { Hash, MessageSquare, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminReadixesPage() {
  const [readixes, setReadixes] = useState<(Readix & { authorName?: string; authorUsername?: string; authorAvatarUrl?: string; })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  useEffect(() => {
    loadInitialReadixes();
  }, []);

  const loadInitialReadixes = async () => {
    setLoading(true);
    const result = await getAdminReadixes(20);
    setReadixes(result.data as any);
    setLastDoc(result.lastDoc);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    const result = await getAdminReadixes(20, lastDoc);
    setReadixes((prev) => [...prev, ...result.data as any]);
    setLastDoc(result.lastDoc);
    setLoadingMore(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold">Readix'ler</Typography>
          <Typography variant="body" className="text-muted mt-1">Platformdaki tüm sosyal akış gönderileri.</Typography>
        </div>
      </div>

      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[40%]">Gönderi</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Yazar</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">İstatistikler</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Oluşturulma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && readixes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <Typography variant="body" className="text-muted">Yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : readixes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted">Kayıtlı Readix bulunamadı.</td>
                </tr>
              ) : (
                readixes.map((readix) => (
                  <tr key={readix.id} className="hover:bg-card/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <Link href={`/admin/readixes/${readix.id}`} className="shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Hash size={18} />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/admin/readixes/${readix.id}`}>
                            <Typography variant="body" className="text-text group-hover:text-primary transition-colors line-clamp-2">
                              {readix.content}
                            </Typography>
                          </Link>
                          {readix.mediaUrls && readix.mediaUrls.length > 0 && (
                            <span className="inline-block mt-1 text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                              {readix.mediaUrls.length} Görsel
                            </span>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {readix.tags?.map(tag => (
                              <span key={tag} className="text-[10px] bg-muted/10 text-muted px-1.5 py-0.5 rounded">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden shrink-0">
                           {readix.authorAvatarUrl ? (
                             <img src={readix.authorAvatarUrl} alt={readix.authorName} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-[10px] text-primary font-bold">
                               {readix.authorName?.charAt(0) || 'Y'}
                             </div>
                           )}
                        </div>
                        <div className="min-w-0">
                           <Typography variant="body" className="font-semibold text-sm truncate">{readix.authorName}</Typography>
                           {readix.authorUsername && (
                             <Typography variant="caption" className="text-muted truncate">@{readix.authorUsername}</Typography>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <div className="flex items-center gap-1" title="Beğeni">
                          <Heart size={14} className="text-red-500/70" />
                          <span className="font-medium text-text">{readix.stats?.likes?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Yorum">
                          <MessageSquare size={14} className="text-blue-500/70" />
                          <span className="font-medium text-text">{readix.stats?.comments?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Paylaşım">
                          <Share2 size={14} className="text-green-500/70" />
                          <span className="font-medium text-text">{readix.stats?.shares?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted font-medium">
                      {readix.createdAt ? new Date(readix.createdAt.seconds * 1000).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '-'}
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
