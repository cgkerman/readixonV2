'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Card } from '@readixon/ui';
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp, BookOpen, Star } from 'lucide-react';
import { subscribeToAuthorStories, useAuthStore, type Story } from '@readixon/core';

export default function StudioStats() {
  const { firebaseUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    
    setLoading(true);
    // Real-time subscription to author's stories
    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      setStories(updatedStories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  // Aggregated Stats
  const { totalViews, totalLikes, totalReviews, totalStories, avgRating } = useMemo(() => {
    let views = 0;
    let likes = 0;
    let reviews = 0;
    let totalRating = 0;
    let ratedStoriesCount = 0;

    stories.forEach(story => {
      views += story.stats.views || 0;
      likes += story.stats.likes || 0;
      reviews += story.stats.reviewCount || 0;
      
      if (story.stats.rating) {
        totalRating += story.stats.rating;
        ratedStoriesCount += 1;
      }
    });

    return {
      totalViews: views,
      totalLikes: likes,
      totalReviews: reviews,
      totalStories: stories.length,
      avgRating: ratedStoriesCount > 0 ? (totalRating / ratedStoriesCount).toFixed(1) : '0.0'
    };
  }, [stories]);

  // Top performing stories (sorted by views)
  const topStories = useMemo(() => {
    return [...stories].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0)).slice(0, 5);
  }, [stories]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative min-h-[calc(100vh-4rem)]">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mb-10 animate-fade-in-up">
        <Typography variant="h1" className="text-3xl font-black mb-2 flex items-center gap-3">
          <BarChart3 className="text-primary" size={32} />
          İstatistikler
        </Typography>
        <Typography variant="body" className="text-muted">
          Hikayelerinizin performansını anlık olarak takip edin.
        </Typography>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={<Eye size={24} className="text-primary" />} 
              label="Toplam Okunma" 
              value={totalViews.toLocaleString('tr-TR')} 
              bgColor="bg-primary/10"
              borderColor="border-primary/20"
            />
            <StatCard 
              icon={<Heart size={24} className="text-primary" />} 
              label="Toplam Beğeni" 
              value={totalLikes.toLocaleString('tr-TR')} 
              bgColor="bg-primary/10"
              borderColor="border-primary/20"
            />
            <StatCard 
              icon={<MessageSquare size={24} className="text-primary" />} 
              label="Toplam İnceleme" 
              value={totalReviews.toLocaleString('tr-TR')} 
              bgColor="bg-primary/10"
              borderColor="border-primary/20"
            />
            <StatCard 
              icon={<BookOpen size={24} className="text-primary" />} 
              label="Yayınlanan Hikaye" 
              value={totalStories.toString()} 
              bgColor="bg-primary/10"
              borderColor="border-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            
            {/* Top Stories Table */}
            <div className="lg:col-span-2">
              <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-primary" size={20} />
                  <Typography variant="h3" className="font-bold">En İyi Performans Gösterenler</Typography>
                </div>
                
                {topStories.length === 0 ? (
                  <div className="text-center py-10 text-muted">
                    Henüz hikayeniz bulunmuyor.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {topStories.map((story, idx) => (
                      <div key={story.storyId} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/20 hover:border-primary/30 transition-colors">
                        <div className="w-8 font-bold text-muted/50 text-xl">{idx + 1}</div>
                        {story.coverImage ? (
                          <img src={story.coverImage} alt={story.title} className="w-12 h-16 object-cover rounded-lg border border-border/20" />
                        ) : (
                          <div className="w-12 h-16 bg-muted/10 rounded-lg flex items-center justify-center border border-border/20">
                            <BookOpen size={16} className="text-muted/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Typography variant="body" className="font-bold truncate">{story.title}</Typography>
                          <Typography variant="caption" className="text-muted flex items-center gap-2 mt-1">
                            {story.status === 'ongoing' || story.status === 'completed' ? (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-muted" />
                            )}
                            {story.status === 'ongoing' || story.status === 'completed' ? 'Yayında' : 'Taslak'}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-medium pr-2">
                          <div className="flex items-center gap-1.5 min-w-[4rem]">
                            <Eye size={16} className="text-primary" />
                            {story.stats.views || 0}
                          </div>
                          <div className="flex items-center gap-1.5 min-w-[4rem]">
                            <Heart size={16} className="text-primary" />
                            {story.stats.likes || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overall Rating & Mini Stats */}
            <div className="flex flex-col gap-6">
              <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
                <Star size={32} className="text-primary mb-3" fill="currentColor" />
                <Typography variant="h2" className="text-4xl font-black mb-1">{avgRating}</Typography>
                <Typography variant="body" className="text-muted">Ortalama Hikaye Puanı</Typography>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm flex flex-col justify-center h-48 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                <Typography variant="h3" className="font-bold mb-2">Okuyucu Etkileşimi</Typography>
                <Typography variant="body" className="text-muted/80 text-sm leading-relaxed">
                  Gerçek zamanlı olarak okuyucularınızın tepkilerini takip ediyorsunuz. Yeni okumalar ve beğeniler anında buraya yansır.
                </Typography>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bgColor, borderColor }: { icon: React.ReactNode, label: string, value: string, bgColor: string, borderColor: string }) {
  return (
    <div className={`p-6 rounded-3xl border ${borderColor} bg-card/40 backdrop-blur-sm flex items-center gap-5 shadow-sm transition-transform hover:-translate-y-1`}>
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <Typography variant="caption" className="text-muted font-medium mb-1 block">{label}</Typography>
        <Typography variant="h3" className="text-2xl font-bold">{value}</Typography>
      </div>
    </div>
  );
}
