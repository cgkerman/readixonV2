"use client";

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden select-none">
      {/* Sade & Minimal Arka Plan - Dikkat dağıtmayan zarif zemin */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30 pointer-events-none" />
      
      {/* Kartın arkasında çok hafif, yumuşak bir merkez ışıltısı */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary/[0.03] dark:bg-primary/[0.06] blur-[150px] rounded-full pointer-events-none" />

      {/* Merkezi İçerik */}
      <main className="w-full flex items-center justify-center relative z-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
