'use client';

import React, { useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@readixon/core';
import { PayTRModal } from '@/components/payment/PayTRModal';

export default function PricingSection() {
  const { userProfile, firebaseUser } = useAuthStore();
  const currentPlan = userProfile?.status || 'free';
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: 'premium' | 'pro') => {
    if (!userProfile || !firebaseUser) {
      alert('Lütfen satın alma işlemi için önce giriş yapın.');
      return;
    }
    
    try {
      setIsLoading(planType);
      const response = await fetch('/api/payment/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userProfile.uid,
          email: firebaseUser.email || 'user@readixon.com',
          userName: userProfile.displayName,
          packageId: 'monthly', // Backend expects 'monthly' for both subscriptions
          type: planType === 'premium' ? 'premium_subscription' : 'pro_subscription',
        })
      });

      const data = await response.json();
      if (data.token) {
        setPaytrToken(data.token);
      } else {
        alert('Ödeme başlatılamadı: ' + data.error);
      }
    } catch (err) {
      alert('Bir hata oluştu.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 w-full flex flex-col items-center">
      <Typography variant="h2" className="text-3xl font-bold mb-12 text-center">
        Size Uygun Planı Seçin
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Ücretsiz Plan */}
        <div className={`relative flex flex-col p-6 lg:p-8 rounded-3xl bg-card border ${currentPlan === 'free' ? 'border-primary' : 'border-border/50'} hover:border-primary/50 transition-colors shadow-sm`}>
          {currentPlan === 'free' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Mevcut Plan
            </div>
          )}
          <Typography variant="h3" className="text-xl font-bold mb-2">Ücretsiz</Typography>
          <Typography variant="body" className="text-muted text-sm mb-6 min-h-[40px]">Okumaya ve yazmaya başlamak için temel özellikler.</Typography>
          
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">0</span>
              <span className="text-lg font-bold text-muted">TL</span>
              <span className="text-muted text-sm ml-1">/ay</span>
            </div>
            <Typography variant="caption" className="text-muted text-xs invisible">İlk 3 ay için</Typography>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <PricingFeature text="1 Hikaye için Karakter Defteri ve Kurgu Sihirbazı" />
            <PricingFeature text="Günlük 5 AI sorgu kullanımı" />
            <PricingFeature text="Tek seferlik 50 RX Puanı (Arena için)" />
            <PricingFeature text="Sadece varsayılan tema kullanımı" />
          </ul>

          <Button variant={currentPlan === 'free' ? 'outline' : 'secondary'} disabled={currentPlan === 'free'} className="w-full py-5 rounded-xl font-bold">
            {currentPlan === 'free' ? 'Mevcut Plan' : 'Ücretsiz Başla'}
          </Button>
        </div>

        {/* Premium Plan */}
        <div className={`relative flex flex-col p-6 lg:p-8 rounded-3xl bg-card border ${currentPlan === 'premium' ? 'border-primary shadow-lg shadow-primary/20' : 'border-primary/50'} hover:border-primary transition-colors`}>
          {currentPlan === 'premium' ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-10">
              Mevcut Plan
            </div>
          ) : (
            <div className="absolute top-0 right-0 bg-primary text-background text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Popüler
            </div>
          )}
          
          <Typography variant="h3" className="text-xl font-bold mb-2 text-primary">Premium</Typography>
          <Typography variant="body" className="text-muted text-sm mb-6 min-h-[40px]">Premium ayrıcalıklarıyla kesintisiz bir deneyim.</Typography>
          
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-text">49,90</span>
              <span className="text-lg font-bold text-muted">TL</span>
              <span className="text-muted text-sm ml-1">/ay</span>
            </div>
            <Typography variant="caption" className="text-muted text-xs">İlk 3 ay için, sonrasında 99,90 TL</Typography>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <PricingFeature text="Karakter Defteri ve Kurgu Sihirbazına tam erişim" highlight />
            <PricingFeature text="Aylık 250 RX Puanı hediyesi" highlight />
            <PricingFeature text="Günlük 10 AI sorgu hakkı" />
            <PricingFeature text="Premium Temalar" />
            <PricingFeature text="Reklamsız okuma deneyimi" />
            <PricingFeature text="Özel profil rozeti" />
          </ul>

          <Button 
            variant={currentPlan === 'premium' ? 'outline' : 'primary'} 
            disabled={true}
            className={`w-full py-5 rounded-xl font-bold ${currentPlan === 'premium' ? 'border-primary/50 text-primary' : 'shadow-md shadow-primary/20 hover:-translate-y-1 transition-all'}`}
          >
            Çok Yakında
          </Button>
        </div>

        {/* Pro Plan */}
        <div className={`relative flex flex-col p-6 lg:p-8 rounded-3xl bg-primary/5 border ${currentPlan === 'pro' ? 'border-primary shadow-lg shadow-primary/20' : 'border-primary/30'} hover:border-primary/70 transition-colors`}>
          {currentPlan === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Mevcut Plan
            </div>
          )}
          <Typography variant="h3" className="text-xl font-bold mb-2 text-text">Pro</Typography>
          <Typography variant="body" className="text-muted text-sm mb-6 min-h-[40px]">Yazarlar ve profesyoneller için tam donanımlı araçlar.</Typography>
          
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-text">109,90</span>
              <span className="text-lg font-bold text-muted">TL</span>
              <span className="text-muted text-sm ml-1">/ay</span>
            </div>
            <Typography variant="caption" className="text-muted text-xs">İlk 3 ay için, sonrasında 199,90 TL</Typography>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <PricingFeature text="Tüm Premium özellikler" />
            <PricingFeature text="Aylık 500 RX Puanı hediyesi" highlightBlue />
            <PricingFeature text="Sınırsız hikaye paylaşımı" highlightBlue />
            <PricingFeature text="Okuma kulüpleri oluşturma" highlightBlue />
            <PricingFeature text="Ücretli hikaye oluşturma" highlightBlue />
            <PricingFeature text="Gelişmiş okuyucu istatistikleri" />
            <PricingFeature text="Yapay zeka hikaye asistanı" />
            <PricingFeature text="Öncelikli destek hattı" />
          </ul>

          <Button 
            variant={currentPlan === 'pro' ? 'outline' : 'primary'} 
            disabled={true}
            className={`w-full py-5 rounded-xl font-bold ${currentPlan === 'pro' ? 'border-primary/50 text-primary' : 'shadow-md hover:-translate-y-1 transition-all'}`}
          >
            Çok Yakında
          </Button>
        </div>
      </div>
      
      {paytrToken && (
        <PayTRModal 
          token={paytrToken} 
          onClose={() => setPaytrToken(null)} 
        />
      )}
    </section>
  );
}

function PricingFeature({ text, highlight = false, highlightBlue = false }: { text: string, highlight?: boolean, highlightBlue?: boolean }) {
  const iconColor = highlight || highlightBlue ? "text-primary" : "text-primary/70";
  const textColor = highlight || highlightBlue ? "text-text font-medium" : "text-muted";
  
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={20} className={`${iconColor} shrink-0 mt-0.5`} />
      <span className={`text-sm leading-snug ${textColor}`}>{text}</span>
    </li>
  );
}
