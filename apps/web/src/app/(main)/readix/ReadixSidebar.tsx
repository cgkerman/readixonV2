"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Typography, Button } from '@readixon/ui';
import { X } from 'lucide-react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db, getTopStories } from '@readixon/core';

export function ReadixSidebar() {
  const [trendingTags, setTrendingTags] = useState<{id: string, count: number}[]>([]);
  const [cultureNews, setCultureNews] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Fetch Top Tags
        const tagsQ = query(collection(db, 'tags'), orderBy('count', 'desc'), limit(5));
        const tagsSnap = await getDocs(tagsQ);
        if (tagsSnap.empty) {
          setTrendingTags([
            { id: 'Edebiyat', count: 1245 },
            { id: 'Şiir', count: 892 },
            { id: 'Deneme', count: 534 },
            { id: 'Roman', count: 412 },
            { id: 'KitapÖnerisi', count: 328 }
          ]);
        } else {
          setTrendingTags(tagsSnap.docs.map(d => ({ id: d.id, count: d.data().count })));
        }

        // Fetch Culture Announcements
        const newsQ = query(collection(db, 'announcements'), where('category', '==', 'culture'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(3));
        const newsSnap = await getDocs(newsQ);
        if (newsSnap.empty) {
          setCultureNews([
            { id: '1', title: 'Nobel Edebiyat Ödülü Sahibi Belli Oldu', content: 'Bu yılın kazananı Norveçli yazar Jon Fosse oldu.' },
            { id: '2', title: 'İstanbul Kitap Fuarı Başlıyor', content: 'TÜYAP kitap fuarı bu hafta sonu kapılarını kitapseverlere açıyor.' }
          ]);
        } else {
          setCultureNews(newsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        // Fetch Popular Books
        const topStories = await getTopStories(3);
        if (!topStories || topStories.length === 0) {
          setPopularBooks([
            { id: '1', title: 'Yüzyıllık Yalnızlık', authorName: 'Gabriel García Márquez', stats: { views: 4500 } },
            { id: '2', title: 'Saatleri Ayarlama Enstitüsü', authorName: 'Ahmet Hamdi Tanpınar', stats: { views: 3200 } },
            { id: '3', title: 'Suç ve Ceza', authorName: 'Fyodor Dostoyevski', stats: { views: 2800 } }
          ]);
        } else {
          setPopularBooks(topStories);
        }

      } catch (err) {
        console.error("Sidebar data fetch error", err);
      }
    };
    fetchSidebarData();
  }, []);

  return (
    <aside className="hidden lg:block w-80 pl-10 py-6 sticky top-0 h-screen overflow-y-auto scrollbar-hide pb-20">
      <Typography variant="h3" className="mb-6 text-text">Gündem</Typography>
      
      <div className="flex flex-col gap-6">
        
        {/* Trending Tags Widget */}
        <div className="bg-card/40 rounded-3xl p-6 border border-border flex flex-col gap-4 shadow-sm backdrop-blur-sm">
          <Typography variant="body" className="font-bold text-text border-b border-border pb-2">Türkiye'de Trend</Typography>
          {trendingTags.length > 0 ? trendingTags.map((tag, idx) => (
            <div key={tag.id} className="group">
              <Typography variant="caption" className="text-muted block text-[10px]">#{idx + 1} Trend</Typography>
              <Typography variant="body" className="font-bold text-text group-hover:text-primary cursor-pointer transition-colors">#{tag.id}</Typography>
              <Typography variant="caption" className="text-muted mt-0.5 block">{tag.count} Gönderi</Typography>
            </div>
          )) : (
            <div className="text-sm text-muted">Henüz trend yok.</div>
          )}
        </div>

        {/* Popular Books Widget */}
        {popularBooks.length > 0 && (
          <div className="bg-card/40 rounded-3xl p-6 border border-border flex flex-col gap-4 shadow-sm backdrop-blur-sm">
            <Typography variant="body" className="font-bold text-text border-b border-border pb-2">Popüler Kitaplar</Typography>
            {popularBooks.map((book) => (
              <div key={book.storyId} className="group">
                <Typography variant="body" className="font-bold text-text group-hover:text-primary cursor-pointer transition-colors line-clamp-1">
                  {book.title}
                </Typography>
                <Typography variant="caption" className="text-muted mt-0.5 block">
                  {book.stats?.views || 0} Okunma
                </Typography>
              </div>
            ))}
          </div>
        )}

        {/* Culture News Widget */}
        {cultureNews.length > 0 && (
          <div className="bg-card/40 rounded-3xl p-6 border border-border flex flex-col gap-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
            <Typography variant="body" className="font-bold text-text border-b border-border pb-2">Kültür & Sanat Gündemi</Typography>
            {cultureNews.map((news) => (
              <div key={news.id} className="group cursor-pointer" onClick={() => setSelectedAnnouncement(news)}>
                <Typography variant="body" className="font-semibold text-text group-hover:text-primary transition-colors text-sm">{news.title}</Typography>
                <div className="text-muted mt-1 text-xs line-clamp-2 [&>p]:inline [&>h1]:inline [&>h2]:inline [&>h3]:inline [&>div]:inline" dangerouslySetInnerHTML={{ __html: news.content }} />
              </div>
            ))}
          </div>
        )}

        {/* Quote of the Day Widget */}
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 flex flex-col gap-3 shadow-sm">
          <Typography variant="caption" className="text-primary font-bold tracking-widest uppercase text-[10px]">Günün Alıntısı</Typography>
          <p className="text-text italic font-serif text-sm leading-relaxed">
            "Yalnızca bir damla sudur insan, ama dalgaları okyanusları aşar."
          </p>
          <Typography variant="caption" className="text-muted text-right block">- @edebiyatci</Typography>
        </div>

        {/* Admin Poll Widget */}
        <div className="bg-card/40 rounded-3xl p-6 border border-border flex flex-col gap-3 shadow-sm backdrop-blur-sm">
          <Typography variant="body" className="font-bold text-text border-b border-border pb-2">Günün Okur Anketi</Typography>
          <Typography variant="body" className="font-semibold text-sm mb-2">Kitap okurken müzik dinler misiniz?</Typography>
          <button className="w-full text-left p-2 rounded-xl border border-border text-sm hover:bg-primary/10 transition-colors">🎵 Evet, hafif bir fon müziği</button>
          <button className="w-full text-left p-2 rounded-xl border border-border text-sm hover:bg-primary/10 transition-colors">🤫 Hayır, mutlak sessizlik isterim</button>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 pb-8">
          <Typography variant="caption" className="text-muted/60 hover:text-text cursor-pointer transition-colors text-xs">Hakkımızda</Typography>
          <Typography variant="caption" className="text-muted/60 hover:text-text cursor-pointer transition-colors text-xs">Yardım Merkezi</Typography>
          <Typography variant="caption" className="text-muted/60 hover:text-text cursor-pointer transition-colors text-xs">Gizlilik Politikası</Typography>
          <Typography variant="caption" className="text-muted/60 hover:text-text cursor-pointer transition-colors text-xs">Kullanım Şartları</Typography>
          <Typography variant="caption" className="text-muted/60 hover:text-text cursor-pointer transition-colors text-xs">İletişim</Typography>
          <div className="w-full mt-2">
            <Typography variant="caption" className="text-muted/40 text-[10px]">© 2026 Readixon. Tüm hakları saklıdır.</Typography>
          </div>
        </div>

      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-card w-full max-w-5xl rounded-2xl border border-border/50 shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">
            <div className="flex justify-between items-center p-4 border-b border-border/50 shrink-0">
              <Typography variant="h3" className="font-bold line-clamp-1 pr-4">{selectedAnnouncement.title}</Typography>
              <button onClick={() => setSelectedAnnouncement(null)} className="text-muted hover:text-text transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
              {selectedAnnouncement.imageUrl && (
                <div className="w-full md:w-1/2 bg-black/20 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-border/50 relative md:h-full">
                  <img src={selectedAnnouncement.imageUrl} alt={selectedAnnouncement.title} className="w-full h-auto max-h-[50vh] md:max-h-full object-contain" />
                </div>
              )}
              <div className={`p-6 w-full ${selectedAnnouncement.imageUrl ? 'md:w-1/2' : ''} flex flex-col overflow-visible md:overflow-y-auto`}>
                <div 
                  className="text-text text-sm md:text-base leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                />
              </div>
            </div>

            {(selectedAnnouncement.link) && (
              <div className="p-4 border-t border-border/50 flex justify-end gap-3 bg-card/50 shrink-0">
                <Button variant="primary" onPress={() => window.open(selectedAnnouncement.link, '_blank')}>
                  Detaylara Git
                </Button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
