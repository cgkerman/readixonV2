'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { collection, getDocs, limit, orderBy, query, where, onSnapshot } from 'firebase/firestore';
import { db, getTopStories, getActiveAdminPoll, voteAdminPoll, AdminPoll, getActiveQuote, AdminQuote, useAuthStore, slugify } from '@readixon/core';
import { toast } from 'sonner';
import { Loader2, TrendingUp, BookOpen, Newspaper, Quote as QuoteIcon, Vote, ChevronRight, Eye, Heart, Layers, Star } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

export default function AgendaPage() {
  const [trendingTags, setTrendingTags] = useState<{id: string, count: number}[]>([]);
  const [cultureNews, setCultureNews] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [adminPoll, setAdminPoll] = useState<AdminPoll | null>(null);
  const [adminQuote, setAdminQuote] = useState<AdminQuote | null>(null);
  const [votingOptionIndex, setVotingOptionIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { userProfile } = useAuthStore();

  useEffect(() => {
    const tagsQ = query(collection(db, 'tags'), orderBy('count', 'desc'), limit(10));
    const unsubscribeTags = onSnapshot(tagsQ, (snapshot) => {
      if (snapshot.empty) {
        setTrendingTags([
          { id: 'Edebiyat', count: 1245 },
          { id: 'Şiir', count: 892 },
          { id: 'Deneme', count: 534 },
          { id: 'Roman', count: 412 },
          { id: 'KitapÖnerisi', count: 328 },
          { id: 'Sanat', count: 210 },
          { id: 'Felsefe', count: 180 },
          { id: 'Tarih', count: 150 },
        ]);
      } else {
        setTrendingTags(snapshot.docs.map(d => ({ id: d.id, count: d.data().count })));
      }
    });

    const fetchData = async () => {
      try {
        const newsQ = query(collection(db, 'announcements'), where('category', '==', 'culture'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(10));
        const newsSnap = await getDocs(newsQ);
        if (newsSnap.empty) {
          setCultureNews([
            { id: '1', title: 'Yapay Zeka ve Sanat: Yeni Bir Dönem', content: 'Yapay zekanın sanat dünyasındaki yükselişi devam ediyor. Son sergilerde gördüğümüz AI eserleri...', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop' },
            { id: '2', title: 'İstanbul Kitap Fuarı Başlıyor', content: 'TÜYAP kitap fuarı bu hafta sonu kapılarını kitapseverlere açıyor. Yüzlerce yayınevi ve yazar...', imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop' },
            { id: '3', title: 'Yeni Bir Edebiyat Dergisi Yayın Hayatına Başlıyor', content: 'Genç yazarların ağırlıkta olduğu yeni bir dergi raflardaki yerini almaya hazırlanıyor...', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop' },
            { id: '4', title: 'Klasik Eserlerin Dijital Restorasyonu Tamamlandı', content: 'Türkiye\'nin en önemli klasik edebiyat eserleri dijital ortama aktarılarak ücretsiz erişime açıldı.', imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop' }
          ]);
        } else {
          setCultureNews(newsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        const topStories = await getTopStories(10);
        if (!topStories || topStories.length === 0) {
          setPopularBooks([
            { id: '1', title: 'Yüzyıllık Yalnızlık', authorName: 'Gabriel García Márquez', stats: { views: 4500 } },
            { id: '2', title: 'Saatleri Ayarlama Enstitüsü', authorName: 'Ahmet Hamdi Tanpınar', stats: { views: 3200 } },
            { id: '3', title: 'Suç ve Ceza', authorName: 'Fyodor Dostoyevski', stats: { views: 2800 } },
            { id: '4', title: '1984', authorName: 'George Orwell', stats: { views: 2500 } },
            { id: '5', title: 'Kürk Mantolu Madonna', authorName: 'Sabahattin Ali', stats: { views: 2100 } },
            { id: '6', title: 'Küçük Prens', authorName: 'Antoine de Saint-Exupéry', stats: { views: 1900 } },
            { id: '7', title: 'Simyacı', authorName: 'Paulo Coelho', stats: { views: 1800 } },
            { id: '8', title: 'Dönüşüm', authorName: 'Franz Kafka', stats: { views: 1700 } },
            { id: '9', title: 'Şeker Portakalı', authorName: 'José Mauro de Vasconcelos', stats: { views: 1600 } },
            { id: '10', title: 'Tutunamayanlar', authorName: 'Oğuz Atay', stats: { views: 1500 } }
          ]);
        } else {
          setPopularBooks(topStories);
        }

        const poll = await getActiveAdminPoll();
        setAdminPoll(poll);

        const quote = await getActiveQuote();
        setAdminQuote(quote);

      } catch (err) {
        console.error("Agenda page data fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => unsubscribeTags();
  }, []);

  const handleVote = async (optionIndex: number) => {
    if (!userProfile?.uid) {
      toast.error('Oy vermek için giriş yapmalısınız!');
      return;
    }
    if (!adminPoll) return;

    setVotingOptionIndex(optionIndex);
    try {
      await voteAdminPoll(adminPoll.id, optionIndex, userProfile.uid);
      const newPoll = { ...adminPoll };
      newPoll.options[optionIndex].votes += 1;
      newPoll.votedUsers = [...(newPoll.votedUsers || []), userProfile.uid];
      setAdminPoll(newPoll);
      toast.success('Oyunuz kaydedildi!');
    } catch (err: any) {
      toast.error(err.message || 'Oy verirken bir hata oluştu');
    } finally {
      setVotingOptionIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative pt-12 pb-20 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold text-text mb-4 tracking-tight">
              Gündem
            </Typography>
            <Typography variant="body" className="text-lg text-muted/80 max-w-xl leading-relaxed">
              Edebiyat dünyasındaki son gelişmeleri, günün öne çıkan sözünü, trend etiketleri ve okur anketlerini buradan takip edin.
            </Typography>
          </div>
          
          {/* Quote of the Day in Hero */}
          {adminQuote && (
            <div className="w-full md:w-2/5 shrink-0 bg-card/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
              <Typography variant="caption" className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Günün Alıntısı</Typography>
              <p className="text-text italic font-serif text-lg leading-relaxed relative z-10">
                "{adminQuote.text}"
              </p>
              <Typography variant="caption" className="text-muted/80 text-right mt-4 block font-medium">
                — {adminQuote.author}
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-12 flex flex-col gap-16">
        
        {/* Culture News Section */}
        {cultureNews.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                <Newspaper size={22} />
              </div>
              <Typography variant="h3" className="font-bold text-text">Kültür & Sanat Gündemi</Typography>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* İlk Haber (Hero - En Büyük) */}
              {cultureNews.length > 0 && (
                <Link 
                  href={`/news/${slugify(cultureNews[0].title)}-${cultureNews[0].id}`}
                  className="group cursor-pointer rounded-[2rem] overflow-hidden relative transition-all shadow-sm hover:shadow-xl w-full aspect-video md:aspect-[21/9]"
                >
                  {cultureNews[0].imageUrl ? (
                    <>
                      <img 
                        src={cultureNews[0].imageUrl} 
                        alt={cultureNews[0].title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600" />
                  )}
                  
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                    <div className="mb-4">
                      <span className="bg-primary text-white text-xs md:text-sm font-bold px-4 py-2 rounded-xl shadow-sm">
                        Günün Öne Çıkanı
                      </span>
                    </div>
                    <Typography 
                      variant="h2" 
                      className="font-extrabold text-white mb-4 group-hover:text-primary/90 transition-colors line-clamp-2 md:line-clamp-3 text-3xl md:text-5xl leading-tight"
                    >
                      {cultureNews[0].title}
                    </Typography>
                    
                    <div className="flex items-center gap-3 text-white/80 text-sm md:text-base font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <span className="text-xs text-white">R</span>
                        </div>
                        <span>Readix Kültür Sanat</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Diğer Haberler (3'lü Grid - Yatay 16:9) */}
              {cultureNews.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cultureNews.slice(1).map((news) => (
                    <Link 
                      href={`/news/${slugify(news.title)}-${news.id}`}
                      key={news.id} 
                      className="group cursor-pointer rounded-3xl overflow-hidden relative transition-all shadow-sm hover:shadow-xl aspect-video w-full"
                    >
                      {news.imageUrl ? (
                        <>
                          <img 
                            src={news.imageUrl} 
                            alt={news.title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-600/80" />
                      )}
                      
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <Typography 
                          variant="h4" 
                          className="font-bold text-white mb-3 group-hover:text-primary/90 transition-colors line-clamp-2 text-xl leading-snug"
                        >
                          {news.title}
                        </Typography>
                        
                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white">R</span>
                          </div>
                          <span>Readix</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Popular Books Section */}
        {popularBooks.length > 0 && (
          <section className="w-full overflow-hidden">
            <div className="flex items-center gap-4 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                <BookOpen size={22} />
              </div>
              <Typography variant="h3" className="font-bold text-text">Popüler Eserler</Typography>
            </div>
            
            <div className="relative overflow-hidden pb-6 -mx-6 md:-mx-12 lg:-mx-24 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 before:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-20 after:bg-gradient-to-l after:from-background after:to-transparent after:z-10 after:pointer-events-none">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                {[1, 2].map((setIndex) => (
                  <div key={setIndex} className="flex gap-6 pr-6">
                    {popularBooks.map((book: any, idx) => (
                      <Link href={`/story/${book.storyId || book.id}`} key={`${setIndex}-${book.storyId || book.id || idx}`} className="shrink-0 w-80 md:w-[26rem] group bg-card/30 hover:bg-card/80 border border-border/50 hover:border-primary/30 rounded-[2rem] p-5 transition-all duration-300 flex items-stretch gap-6 shadow-sm hover:shadow-xl">
                        
                        {/* 3D Book Mockup */}
                        <div className="relative shrink-0 w-28 md:w-32 h-40 md:h-48 rounded-r-xl rounded-l-sm shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-2 group-hover:shadow-primary/30 self-center">
                          <img 
                            src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop'} 
                            alt={book.title} 
                            className="w-full h-full object-cover rounded-r-xl rounded-l-sm" 
                          />
                          {/* Spine shadow */}
                          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/50 via-black/10 to-transparent mix-blend-multiply rounded-l-sm pointer-events-none" />
                          {/* Edge highlights */}
                          <div className="absolute inset-0 rounded-r-xl rounded-l-sm shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-2px_0_5px_rgba(0,0,0,0.3)] pointer-events-none" />
                          
                          {/* Rank Badge */}
                          <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center font-black text-lg border-4 border-background shadow-lg z-20 group-hover:scale-110 transition-transform">
                            {idx + 1}
                          </div>
                        </div>

                        {/* Right: Book Details & Stats */}
                        <div className="flex flex-col min-w-0 flex-1 py-1">
                          <Typography variant="body" className="font-extrabold text-lg md:text-xl text-text group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                            {book.title}
                          </Typography>
                          
                          <Typography variant="caption" className="text-muted/80 font-medium line-clamp-1 mb-4">
                            {book.authorName}
                          </Typography>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                              <Eye size={15} className="text-primary/70" />
                              <span>{book.stats?.views?.toLocaleString('tr-TR') || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                              <Heart size={15} className="text-rose-500/80" />
                              <span>{book.stats?.likes?.toLocaleString('tr-TR') || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                              <Layers size={15} className="text-purple-500/80" />
                              <span>{book.stats?.chapterCount || 0} Bölüm</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                              <Star size={15} className="text-yellow-500/80" />
                              <span>{book.stats?.rating ? book.stats.rating.toFixed(1) : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trending Tags Section (Marquee) */}
        {trendingTags.length > 0 && (
          <section className="w-full overflow-hidden">
            <div className="flex items-center gap-4 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                <TrendingUp size={22} />
              </div>
              <Typography variant="h3" className="font-bold text-text">Türkiye'de Trend</Typography>
            </div>
            
            <div className="relative overflow-hidden pb-6 -mx-6 md:-mx-12 lg:-mx-24 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 before:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-20 after:bg-gradient-to-l after:from-background after:to-transparent after:z-10 after:pointer-events-none">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                {[1, 2].map((setIndex) => (
                  <div key={setIndex} className="flex gap-6 pr-6">
                    {trendingTags.map((tag, idx) => (
                      <Link 
                        key={`${setIndex}-${tag.id}`} 
                        href={`/readix?hashtag=${tag.id}`}
                        className="shrink-0 w-80 group flex items-center gap-5 p-5 rounded-3xl bg-card/40 border border-border/50 hover:bg-muted/5 transition-colors shadow-sm hover:shadow-md"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-background transition-all">
                          <span className="text-xl font-black text-primary group-hover:text-background transition-colors">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex flex-col w-full">
                          <span className="text-[10px] font-bold text-muted mb-1 tracking-widest uppercase">
                            Gündemdekiler
                          </span>
                          <span className="font-bold text-text group-hover:text-primary transition-colors text-base break-words leading-tight">
                            #{tag.id}
                          </span>
                          <div className="mt-2 text-xs font-medium text-muted/70 flex items-center gap-1.5">
                            <span className="font-bold text-primary">
                              {tag.count.toLocaleString('tr-TR')}
                            </span>
                            <span>Gönderi</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Poll Section */}
        {adminPoll && (
          <section className="w-full flex justify-center mt-4">
            <div className="w-full max-w-2xl bg-card/40 backdrop-blur-sm border border-border rounded-3xl p-8 relative overflow-hidden group flex flex-col shadow-sm hover:shadow-lg transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <Vote size={22} />
                </div>
                <Typography variant="h3" className="font-bold text-text">Günün Okur Anketi</Typography>
              </div>
              
              <Typography variant="body" className="font-semibold text-xl md:text-2xl mb-8 leading-tight flex-1">{adminPoll.question}</Typography>
              
              <div className="flex flex-col gap-4">
                {(() => {
                  const hasVoted = userProfile?.uid && adminPoll.votedUsers?.includes(userProfile.uid);
                  const totalVotes = adminPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

                  return adminPoll.options.map((opt, idx) => {
                    if (hasVoted) {
                      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={idx} className="relative overflow-hidden rounded-2xl border border-border bg-black/20 p-5 text-base">
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                          />
                          <div className="relative z-10 flex justify-between items-center gap-4">
                            <span className="font-medium text-text line-clamp-2">{opt.text}</span>
                            <span className="font-bold text-xl shrink-0">%{percent}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button 
                        key={idx}
                        onClick={() => handleVote(idx)}
                        disabled={votingOptionIndex !== null}
                        className="w-full text-left p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group/btn text-base"
                      >
                        <span className="group-hover/btn:text-primary transition-colors font-medium">{opt.text}</span>
                        {votingOptionIndex === idx ? (
                          <Loader2 size={20} className="animate-spin text-primary shrink-0" />
                        ) : (
                          <ChevronRight size={20} className="text-muted group-hover/btn:text-primary transition-colors opacity-0 group-hover/btn:opacity-100 transform -translate-x-2 group-hover/btn:translate-x-0" />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </section>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}} />
    </div>
  );
}
