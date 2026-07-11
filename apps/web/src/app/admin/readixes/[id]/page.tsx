"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getReadixById, getUserProfile, getReadixComments, Readix, User, ReadixComment } from '@readixon/core';
import { ArrowLeft, Hash, Heart, MessageSquare, Share2, Clock, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminReadixDetailPage() {
  const { id } = useParams() as { id: string };
  const [readix, setReadix] = useState<Readix | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<ReadixComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedReadix = await getReadixById(id);
        if (fetchedReadix) {
          setReadix(fetchedReadix);
          
          if (fetchedReadix.authorId) {
            const fetchedAuthor = await getUserProfile(fetchedReadix.authorId);
            setAuthor(fetchedAuthor);
          }
          
          const fetchedComments = await getReadixComments(id, 50); // Get up to 50 comments
          setComments(fetchedComments.comments);
        }
      } catch (error) {
        console.error("Readix detayı çekilirken hata:", error);
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

  if (!readix) {
    return (
      <div className="space-y-6">
        <Link href="/admin/readixes">
          <Button variant="ghost" className="text-muted hover:text-text -ml-4">
            <ArrowLeft size={18} className="mr-2" /> Readix'lere Dön
          </Button>
        </Link>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-12 text-center">
          <Typography variant="h3" className="font-bold text-muted">Readix Bulunamadı</Typography>
          <Typography variant="body" className="text-muted mt-2">Bu gönderi silinmiş veya erişilemiyor olabilir.</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Link href="/admin/readixes">
        <Button variant="ghost" className="text-muted hover:text-text -ml-4">
          <ArrowLeft size={18} className="mr-2" /> Readix'lere Dön
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Ana İçerik */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
            {/* Gönderi Başlığı ve Yazar */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              {author ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden shrink-0 border border-primary/20">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                        {author.displayName?.charAt(0) || 'Y'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Typography variant="body" className="font-semibold">{author.displayName}</Typography>
                    <Typography variant="caption" className="text-muted">@{author.username}</Typography>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center shrink-0">
                    <span className="text-muted">?</span>
                  </div>
                  <div>
                    <Typography variant="body" className="font-semibold text-muted">Bilinmeyen Yazar</Typography>
                  </div>
                </div>
              )}

              {readix.createdAt && (
                <span className="text-sm text-muted flex items-center gap-1 shrink-0 bg-background px-3 py-1.5 rounded-full border border-border/50">
                  <Clock size={14} /> 
                  {new Date((readix.createdAt as any).seconds * 1000).toLocaleString('tr-TR', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              )}
            </div>

            {/* Gönderi Metni */}
            <div className="mb-6">
              <Typography variant="body" className="text-lg leading-relaxed whitespace-pre-wrap">
                {readix.content}
              </Typography>
            </div>

            {/* Etiketler */}
            {readix.tags && readix.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {readix.tags.map(tag => (
                  <span key={tag} className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-md font-medium">#{tag}</span>
                ))}
              </div>
            )}

            {/* Medyalar */}
            {readix.mediaUrls && readix.mediaUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {readix.mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-border/50 bg-background aspect-video sm:aspect-square flex items-center justify-center">
                     <img src={url} alt={`Media ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Alt İstatistikler (Satır İçi) */}
            <div className="flex items-center gap-6 pt-4 border-t border-border/50 text-muted">
               <div className="flex items-center gap-2">
                 <Heart size={18} />
                 <span className="font-semibold">{readix.stats?.likes?.toLocaleString() || 0}</span>
               </div>
               <div className="flex items-center gap-2">
                 <MessageSquare size={18} />
                 <span className="font-semibold">{readix.stats?.comments?.toLocaleString() || 0}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Share2 size={18} />
                 <span className="font-semibold">{readix.stats?.shares?.toLocaleString() || 0}</span>
               </div>
            </div>
          </div>

          {/* Yorumlar Alanı */}
          <div className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-primary" size={24} />
              <Typography variant="h3" className="font-bold">Yorumlar ({comments.length})</Typography>
            </div>
            
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted border border-dashed border-border/50 rounded-xl">
                  Henüz yorum yapılmamış.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-background border border-border/50 rounded-xl flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-primary">
                        Y
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <Typography variant="caption" className="font-semibold text-muted">Yazar ID: {comment.authorId.substring(0,8)}...</Typography>
                           <Typography variant="caption" className="text-muted text-[10px]">
                              {comment.createdAt ? new Date((comment.createdAt as any).seconds * 1000).toLocaleDateString('tr-TR') : ''}
                           </Typography>
                        </div>
                        <Typography variant="body" className="mt-1 text-sm">{comment.content}</Typography>
                        {(comment.likes ?? 0) > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-red-500/80">
                            <Heart size={12} />
                            <span className="text-xs">{comment.likes}</span>
                          </div>
                        )}
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Sistem Bilgileri */}
        <div className="space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-xl p-6 shadow-sm">
            <Typography variant="h3" className="font-bold mb-6">Metrikler & Detaylar</Typography>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Hash size={20} />
                </div>
                <div className="overflow-hidden">
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Readix ID</Typography>
                  <Typography variant="body" className="font-bold text-sm truncate">{readix.id}</Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Medya Sayısı</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{readix.mediaUrls?.length || 0}</Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <span className="font-bold">@</span>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Etiketlenen (Mention)</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{readix.mentions?.length || 0}</Typography>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
