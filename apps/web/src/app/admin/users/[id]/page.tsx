"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getUserProfile, getAuthorStories, User, Story } from '@readixon/core';
import { ArrowLeft, User as UserIcon, Calendar, CheckCircle, ShieldAlert, PenTool, Users, Eye, Swords, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminUserDetailPage() {
  const { id } = useParams() as { id: string };
  const [user, setUser] = useState<User | null>(null);
  const [authorStories, setAuthorStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedUser = await getUserProfile(id);
        if (fetchedUser) {
          setUser(fetchedUser);
          
          if (fetchedUser.isAuthor) {
            const stories = await getAuthorStories(id);
            setAuthorStories(stories);
          }
        }
      } catch (error) {
        console.error("Kullanıcı detayı çekilirken hata:", error);
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

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/admin/users">
          <Button variant="ghost" className="text-muted hover:text-text -ml-4">
            <ArrowLeft size={18} className="mr-2" /> Kullanıcılara Dön
          </Button>
        </Link>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-12 text-center">
          <Typography variant="h3" className="font-bold text-muted">Kullanıcı Bulunamadı</Typography>
          <Typography variant="body" className="text-muted mt-2">Bu kullanıcı hesabı silinmiş veya bulunmuyor olabilir.</Typography>
        </div>
      </div>
    );
  }

  const getRoleBadge = (isAdmin?: boolean, isAuthor?: boolean) => {
    if (isAdmin) {
      return <span className="flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"><ShieldAlert size={12} /> Admin</span>;
    }
    if (isAuthor) {
      return <span className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"><PenTool size={12} /> Yazar</span>;
    }
    return <span className="bg-muted/10 text-muted border border-border/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Okur</span>;
  };

  const formatDate = (timestamp?: any) => {
    if (!timestamp) return 'Bilinmiyor';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Link href="/admin/users">
        <Button variant="ghost" className="text-muted hover:text-text -ml-4">
          <ArrowLeft size={18} className="mr-2" /> Kullanıcılara Dön
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Temel Profil ve Hikayeler */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profil Kartı */}
          <div className="bg-card/40 border border-border/50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-start shadow-sm">
            <div className="w-32 h-32 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-bold">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getRoleBadge(user.isAdmin, user.isAuthor)}
                  <span className="text-sm text-muted flex items-center gap-1">
                    <Calendar size={14} /> Katılım: {formatDate(user.createdAt)}
                  </span>
                </div>
                <Typography variant="h2" className="font-bold text-3xl">{user.displayName}</Typography>
                <Typography variant="body" className="text-muted font-medium mt-1">@{user.username || user.uid.substring(0, 8)}</Typography>
              </div>

              <div>
                <Typography variant="h4" className="font-semibold mb-1 text-sm text-muted">Biyografi</Typography>
                <Typography variant="body" className="text-text text-sm leading-relaxed whitespace-pre-wrap">
                  {user.bio || 'Kullanıcı henüz bir biyografi eklememiş.'}
                </Typography>
              </div>

              {user.preferredGenres && user.preferredGenres.length > 0 && (
                <div>
                  <Typography variant="h4" className="font-semibold mb-2 text-sm text-muted">Sevdiği Türler</Typography>
                  <div className="flex flex-wrap gap-2">
                    {user.preferredGenres.map(genre => (
                      <span key={genre} className="text-xs bg-card text-muted px-2.5 py-1 rounded-full border border-border/50">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Yazarın Hikayeleri */}
          {user.isAuthor && (
            <div>
              <div className="flex items-center gap-3 mb-4 mt-8">
                <BookOpen className="text-primary" size={24} />
                <Typography variant="h3" className="font-bold">Yazdığı Hikayeler ({authorStories.length})</Typography>
              </div>
              
              <div className="bg-card/40 border border-border/50 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                        <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[50%]">Hikaye Adı</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Durum</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Bölüm</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Okunma</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {authorStories.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-muted">Kayıtlı hikaye bulunamadı.</td>
                        </tr>
                      ) : (
                        authorStories.map((story) => (
                          <tr key={story.storyId} className="hover:bg-card/40 transition-colors">
                            <td className="px-6 py-4 font-semibold text-text">
                               <Link href={`/admin/stories/${story.storyId}`} className="hover:text-primary transition-colors">
                                 {story.title}
                               </Link>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs border border-border/50 px-2 py-1 rounded font-semibold uppercase">{story.status}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{story.stats?.chapterCount || 0}</td>
                            <td className="px-6 py-4 text-sm font-medium">{story.stats?.views?.toLocaleString() || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Kolon: İstatistikler ve Onaylar */}
        <div className="space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-xl p-6 shadow-sm">
            <Typography variant="h4" className="font-bold mb-6">Etkileşim İstatistikleri</Typography>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Eye size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Toplam Okuma (Eserleri)</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{user.stats?.totalReads?.toLocaleString() || 0}</Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Takipçi / Takip Edilen</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{user.stats?.followers?.toLocaleString() || 0} <span className="text-muted text-sm font-normal">/ {user.stats?.following?.toLocaleString() || 0}</span></Typography>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Swords size={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Arena Skoru</Typography>
                  <Typography variant="h3" className="font-bold text-xl">{user.stats?.arenaScore?.toLocaleString() || 0}</Typography>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card/40 border border-border/50 rounded-xl p-6 shadow-sm">
            <Typography variant="h4" className="font-bold mb-6">Sistem & Onaylar</Typography>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                 <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Hizmet Şartları Onayı</Typography>
                 <div className="flex items-center gap-2">
                   {user.termsAcceptedAt ? <CheckCircle size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted" />}
                   <Typography variant="body" className="text-sm font-medium">{formatDate(user.termsAcceptedAt)}</Typography>
                 </div>
              </div>
              
              <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                 <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Gizlilik Politikası Onayı</Typography>
                 <div className="flex items-center gap-2">
                   {user.privacyAcceptedAt ? <CheckCircle size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted" />}
                   <Typography variant="body" className="text-sm font-medium">{formatDate(user.privacyAcceptedAt)}</Typography>
                 </div>
              </div>

              {user.aiUsage && (
                <div className="flex flex-col gap-1">
                   <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider text-[10px]">Günlük AI Kullanımı ({user.aiUsage.date})</Typography>
                   <Typography variant="body" className="text-sm font-medium">{user.aiUsage.requestCount} istek atıldı</Typography>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card/40 border border-border/50 rounded-xl p-6 shadow-sm text-center">
            <Typography variant="body" className="text-sm text-muted">
              Kullanıcı ID: <span className="font-mono text-text">{user.uid}</span>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
