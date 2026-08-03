'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { PlusCircle, Image as ImageIcon, GalleryVertical } from 'lucide-react';
import { subscribeToAuthorStories, useAuthStore, type Story } from '@readixon/core';

export default function StudioWebtoonsDashboard() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [webtoons, setWebtoons] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    
    setLoading(true);
    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      // Sadece webtoonları filtrele
      const webtoonStories = updatedStories.filter(s => s.format === 'webtoon');
      setWebtoons(webtoonStories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex flex-row justify-between items-center mb-10">
        <div>
          <Typography variant="h1">Webtoonlarım</Typography>
          <Typography variant="body" className="text-muted mt-2">Çizgi roman ve mangalarınızı buradan yönetebilirsiniz.</Typography>
        </div>
        <Button variant="primary" onPress={() => router.push('/studio/webtoons/create')} className="flex flex-row items-center gap-2">
          <PlusCircle size={20} />
          Yeni Webtoon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : webtoons.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/20 rounded-2xl bg-card/20">
          <GalleryVertical size={48} className="mx-auto text-muted/50 mb-4" />
          <Typography variant="h3" className="mb-2">Henüz webtoonunuz yok</Typography>
          <Typography variant="body" className="text-muted mb-6">İlk serinize hemen başlayın ve dünyanızı çizin.</Typography>
          <div className="flex justify-center">
            <Button variant="outline" onPress={() => router.push('/studio/webtoons/create')}>Hemen Başla</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {webtoons.map(story => (
            <div 
              key={story.storyId} 
              onClick={() => router.push(`/studio/webtoons/${story.storyId}`)}
              className="group flex flex-col bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Cover Image Area */}
              <div className="relative w-full aspect-[2/3] overflow-hidden bg-muted/20">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/10">
                    <ImageIcon className="text-muted/30 mb-2" size={32} />
                    <Typography variant="caption" className="text-muted/50">Kapak Yok</Typography>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border ${story.status === 'ongoing' || story.status === 'completed' ? 'bg-green-500/80 text-white border-green-400/50' : 'bg-orange-500/80 text-white border-orange-400/50'}`}>
                    {story.status === 'draft' ? 'Taslak' : 'Yayında'}
                  </span>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-card/60">
                <div>
                  <Typography variant="h3" className="font-bold line-clamp-1 mb-1.5 group-hover:text-primary transition-colors text-lg">
                    {story.title}
                  </Typography>
                  <Typography variant="caption" className="text-muted line-clamp-2 leading-relaxed">
                    {story.summary || 'Özet eklenmemiş.'}
                  </Typography>
                </div>
                
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/40">
                  <div className="flex flex-col">
                    <Typography variant="caption" className="text-muted text-[10px] uppercase font-bold tracking-wider mb-0.5">Episod</Typography>
                    <Typography variant="body" className="font-black text-primary">{story.stats.chapterCount}</Typography>
                  </div>
                  <div className="w-px h-8 bg-border/40"></div>
                  <div className="flex flex-col items-end">
                    <Typography variant="caption" className="text-muted text-[10px] uppercase font-bold tracking-wider mb-0.5">Okunma</Typography>
                    <Typography variant="body" className="font-black text-text">{(story.stats.views || 0).toLocaleString('tr-TR')}</Typography>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
