'use client';

import React, { useEffect, useState } from 'react';
import { Typography } from '@readixon/ui';
import { getPlatformFeedbacks } from '@readixon/core';
import { Star, MessageSquareHeart, Loader2, Calendar } from 'lucide-react';

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      setIsLoading(true);
      try {
        const data = await getPlatformFeedbacks();
        setFeedbacks(data as any[]);
      } catch (error) {
        console.error("Geri bildirimler yüklenemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks > 0 
    ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / totalFeedbacks).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-full">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <Typography variant="h1" className="text-3xl font-bold mb-2">Değerlendirmeler</Typography>
          <Typography variant="body" className="text-muted">Okurların platform hakkındaki geri bildirimleri ve puanlamaları.</Typography>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/40 border border-border rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center shrink-0">
            <Star size={32} className="text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <Typography variant="caption" className="text-muted uppercase tracking-wider font-bold mb-1">Ortalama Puan</Typography>
            <Typography variant="h2" className="text-4xl font-black">{averageRating}</Typography>
          </div>
        </div>

        <div className="bg-card/40 border border-border rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquareHeart size={32} className="text-primary" />
          </div>
          <div>
            <Typography variant="caption" className="text-muted uppercase tracking-wider font-bold mb-1">Toplam Değerlendirme</Typography>
            <Typography variant="h2" className="text-4xl font-black">{totalFeedbacks}</Typography>
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="bg-card/40 border border-border rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
        <Typography variant="h3" className="font-bold mb-6">Son Geri Bildirimler</Typography>
        
        {feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <MessageSquareHeart size={48} className="mb-4 opacity-20" />
            <Typography variant="body" className="font-medium">Henüz bir geri bildirim bulunmuyor.</Typography>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
            {feedbacks.map((item) => (
              <div key={item.id} className="bg-background/50 border border-border/50 rounded-xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={star <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-muted/30"} 
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-muted text-xs font-medium">
                    <Calendar size={14} />
                    <span>
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
                
                {item.comment && (
                  <Typography variant="body" className="text-text mt-2 whitespace-pre-wrap">
                    "{item.comment}"
                  </Typography>
                )}
                
                <div className="text-xs font-semibold text-muted/60 mt-2">
                  Kullanıcı ID: {item.userId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
