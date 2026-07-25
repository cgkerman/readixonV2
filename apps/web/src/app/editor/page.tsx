"use client";

import React from 'react';
import { Typography } from '@readixon/ui';
import { useAuthStore } from '@readixon/core';

export default function EditorDashboardPage() {
  const { userProfile } = useAuthStore();

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-card/40 border border-border/50 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <Typography variant="h1" className="text-3xl md:text-5xl font-extrabold mb-4">
            Hoş Geldiniz, <span className="text-primary">{userProfile?.displayName}</span>
          </Typography>
          <Typography variant="body" className="text-lg text-muted max-w-2xl">
            Readixon editör paneline giriş yaptınız. Sol menüyü kullanarak kültür sanat haberlerini yönetebilir, günün alıntısını seçebilir veya günün anketlerini oluşturabilirsiniz.
          </Typography>
        </div>
      </div>
    </div>
  );
}
