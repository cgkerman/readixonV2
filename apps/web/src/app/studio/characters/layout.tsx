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
        <div className="text-center py-24 border-2 border-dashed border-border/20 rounded-3xl bg-card/20 mt-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-primary" />
          </div>
          <Typography variant="h2" className="mb-4">Premium Özellik</Typography>
          <Typography variant="body" className="text-muted mb-8 max-w-md mx-auto">
            Karakter defteri özelliği sadece Premium üyelere özeldir. Hikayenizi derinlikli karakter profilleriyle zenginleştirmek için Premium'a geçin.
          </Typography>
          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" onPress={() => router.push('/studio')} className="px-6 rounded-full">
              Stüdyoya Dön
            </Button>
            <Button variant="primary" className="px-8 rounded-full shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
              Premium'a Yükselt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
