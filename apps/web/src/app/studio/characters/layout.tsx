'use client';

import React from 'react';
import { useAuthStore } from '@readixon/core';
import { Typography, Button } from '@readixon/ui';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CharactersLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();

  // Auth'un yüklenmesini bekle
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isPremiumOrAdmin = userProfile?.status === 'premium' || userProfile?.isAdmin === true;

  if (!isPremiumOrAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="text-center py-20 bg-card/50 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center p-8">
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mb-8 border border-yellow-500/30">
              <Lock size={40} className="text-yellow-500" />
            </div>
            <Typography variant="h1" className="mb-4 text-text font-black text-4xl">Premium Özellik</Typography>
            <Typography variant="body" className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Karakter defteri özelliği sadece <strong className="text-yellow-500">Premium</strong> üyelere ve Adminlere özeldir. Karakterlerinizin fiziksel ve psikolojik derinliklerini yazıp okuyucularınızla paylaşmak için Premium'a geçin.
            </Typography>
            <div className="flex gap-4">
              <Button variant="ghost" onPress={() => router.push('/studio')} className="px-6 rounded-full border border-border/50 hover:bg-white/5">
                Stüdyoya Dön
              </Button>
              <Button variant="primary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none px-10 py-3 rounded-full font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all text-lg">
                Premium'a Yükselt
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
