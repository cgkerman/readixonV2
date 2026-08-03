'use client';

import React, { useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { submitPlatformFeedback, useAuthStore } from '@readixon/core';
import { toast } from 'sonner';
import { Star, MessageSquareHeart, CheckCircle2, Loader2 } from 'lucide-react';

export const PlatformFeedback = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { userProfile } = useAuthStore();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Lütfen bir puan seçin');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPlatformFeedback(rating, comment, userProfile?.uid);
      setIsSubmitted(true);
      toast.success('Değerlendirmeniz için teşekkür ederiz!');
    } catch (error) {
      toast.error('Değerlendirme gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="w-full mt-12 mb-8">
        <div className="w-full bg-card/60 backdrop-blur-md border border-primary/20 rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10 animate-scale-up">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <Typography variant="h2" className="font-bold text-text mb-4 relative z-10">
            Geri Bildiriminiz Alındı!
          </Typography>
          <Typography variant="body" className="text-muted text-lg max-w-lg relative z-10">
            Readixon'ı daha iyi bir yer haline getirmemize yardımcı olduğunuz için çok teşekkür ederiz. Görüşleriniz ekibimiz tarafından dikkatle incelenecektir.
          </Typography>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mt-12 mb-8">
      <div className="flex items-center gap-4 mb-6 group">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-300">
          <MessageSquareHeart size={20} />
        </div>
        <Typography variant="h3" className="font-bold text-text">Bizi Değerlendirin</Typography>
      </div>

      <div className="w-full bg-card/40 backdrop-blur-sm border border-border rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 z-0" />
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
          <Typography variant="h2" className="font-bold text-text mb-4">Readixon Deneyiminizi Puanlayın</Typography>
          <Typography variant="body" className="text-muted text-lg mb-10 max-w-xl">
            Platformumuzu geliştirmemize yardımcı olmak için görüşlerinizi bizimle paylaşın. Fikirleriniz bizim için çok değerli.
          </Typography>

          {/* Star Rating */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="group relative transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={48} 
                  strokeWidth={1.5}
                  className={`transition-all duration-300 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                      : 'fill-transparent text-muted/40 hover:text-muted/60'
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Comment Area */}
          <div className="w-full max-w-2xl mb-8">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Eklemek istediğiniz düşünceleriniz var mı? (İsteğe bağlı)"
              className="w-full min-h-[120px] bg-background/50 border border-border/50 rounded-2xl p-5 text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <Button 
            variant="primary" 
            onPress={handleSubmit} 
            disabled={isSubmitting || rating === 0}
            className="w-full max-w-xs rounded-full py-4 text-base font-bold flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              'Geri Bildirimi Gönder'
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};
