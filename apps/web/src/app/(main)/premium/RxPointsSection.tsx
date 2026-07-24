'use client';

import React, { useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { Zap, Coins, Loader2 } from 'lucide-react';
import { useAuthStore } from '@readixon/core';
import { PayTRModal } from '@/components/payment/PayTRModal';
import { CheckoutConfirmationModal } from '@/components/payment/CheckoutConfirmationModal';

export default function RxPointsSection() {
  const { userProfile, firebaseUser } = useAuthStore();
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const packagesInfo: Record<string, { id: string; name: string; price: string; period: string }> = {
    start: { id: 'start', name: 'Başlangıç Paketi', price: '19,90 TL', period: 'Tek Seferlik' },
    adventure: { id: 'adventure', name: 'Macera Paketi', price: '79,90 TL', period: 'Tek Seferlik' },
    epic: { id: 'epic', name: 'Destansı Paket', price: '249,90 TL', period: 'Tek Seferlik' },
  };

  const handleCheckoutClick = (packageId: string) => {
    if (!userProfile || !firebaseUser) {
      alert('Lütfen satın alma işlemi için önce giriş yapın.');
      return;
    }
    setSelectedPackageId(packageId);
  };

  const handleBuyPoints = async () => {
    if (!userProfile || !firebaseUser || !selectedPackageId) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userProfile.uid,
          email: firebaseUser.email || 'user@readixon.com',
          userName: userProfile.displayName,
          packageId: selectedPackageId,
          type: 'rx_points',
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
      setIsLoading(false);
      setSelectedPackageId(null);
    }
  };
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 w-full flex flex-col items-center">
      <Typography variant="h2" className="text-3xl font-bold mb-4 text-center">
        Ekstra RX Puanına mı İhtiyacınız Var?
      </Typography>
      <Typography variant="body" className="text-muted text-center max-w-2xl mb-12">
        Kurgu Sihirbazı'nda, karakter defterlerinde daha fazla etkileşim sağlamak veya favori yazarlarınızı desteklemek için tek seferlik RX puanı yükleyebilirsiniz.
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        
        {/* Paket 1 */}
        <div className="relative flex flex-col p-6 lg:p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-colors shadow-sm items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Coins size={32} className="text-primary" />
          </div>
          <Typography variant="h3" className="text-xl font-bold mb-2">Başlangıç Paketi</Typography>
          
          <div className="flex items-center gap-2 mb-6">
            <Zap size={20} className="text-yellow-500 fill-yellow-500" />
            <span className="text-3xl font-black text-text">100</span>
            <span className="font-bold text-muted">RX</span>
          </div>

          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-2xl font-black text-text">19,90</span>
            <span className="font-bold text-muted">TL</span>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-5 rounded-xl font-bold hover:bg-primary/5 hover:text-primary border-border"
            onPress={() => handleCheckoutClick('start')}
          >
            Hemen Al
          </Button>
        </div>

        {/* Paket 2 - Popüler */}
        <div className="relative flex flex-col p-6 lg:p-8 rounded-3xl bg-card border border-primary shadow-lg shadow-primary/10 hover:border-primary transition-colors items-center text-center">
          <div className="absolute top-0 right-0 bg-primary text-background text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            En Çok Tercih Edilen
          </div>

          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Coins size={32} className="text-primary" />
          </div>
          <Typography variant="h3" className="text-xl font-bold mb-2 text-primary">Macera Paketi</Typography>
          
          <div className="flex items-center gap-2 mb-6">
            <Zap size={24} className="text-yellow-500 fill-yellow-500" />
            <span className="text-4xl font-black text-text">500</span>
            <span className="font-bold text-muted">RX</span>
          </div>

          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-2xl font-black text-text">79,90</span>
            <span className="font-bold text-muted">TL</span>
          </div>

          <Button 
            variant="primary" 
            className="w-full py-5 rounded-xl font-bold shadow-md shadow-primary/20 hover:-translate-y-1 transition-all"
            onPress={() => handleCheckoutClick('adventure')}
          >
            Hemen Al
          </Button>
        </div>

        {/* Paket 3 */}
        <div className="relative flex flex-col p-6 lg:p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-colors shadow-sm items-center text-center">
          <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            Avantajlı
          </div>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Coins size={32} className="text-primary" />
          </div>
          <Typography variant="h3" className="text-xl font-bold mb-2">Destansı Paket</Typography>
          
          <div className="flex items-center gap-2 mb-6">
            <Zap size={24} className="text-yellow-500 fill-yellow-500" />
            <span className="text-4xl font-black text-text">2000</span>
            <span className="font-bold text-muted">RX</span>
          </div>

          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-2xl font-black text-text">249,90</span>
            <span className="font-bold text-muted">TL</span>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-5 rounded-xl font-bold hover:bg-primary/5 hover:text-primary border-border"
            onPress={() => handleCheckoutClick('epic')}
          >
            Hemen Al
          </Button>
        </div>

      </div>

      {paytrToken && (
        <PayTRModal 
          token={paytrToken} 
          onClose={() => setPaytrToken(null)} 
        />
      )}

      <CheckoutConfirmationModal
        isOpen={selectedPackageId !== null}
        onClose={() => setSelectedPackageId(null)}
        onConfirm={handleBuyPoints}
        isLoading={isLoading}
        packageInfo={selectedPackageId ? packagesInfo[selectedPackageId] : null}
        userInfo={{
          name: userProfile?.displayName || '',
          email: firebaseUser?.email || ''
        }}
      />
    </section>
  );
}
