"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import { MessageCircle, Feather } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return; 
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="flex min-h-screen w-full bg-background flex-col md:flex-row overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Sol Taraf - Form Alanı (Auth İçeriği) */}
      <div className="w-full md:w-1/2 shrink-0 flex flex-col justify-center items-center p-8 md:p-12 relative z-10 bg-card/30">
        
        <div className="w-full max-w-md z-10 animate-slide-up">
          {children}
        </div>
        
      </div>

      {/* Sağ Taraf - Görsel Alan & Logo */}
      <div className="w-full md:w-1/2 shrink-0 relative flex flex-col items-center justify-center bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 p-8 md:p-12 overflow-hidden">
        
        {/* Ortadaki Geçiş Efekti (Sol tarafa doğru keskinliği yumuşatır) */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-24 md:w-32 lg:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-30 pointer-events-none" />

        {/* Arka Plan Süslemeleri */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Platformu Yansıtan Süslemeler - Parallax Etkili */}
        
        {/* Yorum / Etkileşim İkonu */}
        <div 
          className="absolute top-[20%] left-[20%] text-primary/20 dark:text-primary/30 transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) rotate(-12deg)` }}
        >
          <MessageCircle size={80} strokeWidth={1} />
        </div>

        {/* Yazarlık İkonu */}
        <div 
          className="absolute bottom-[25%] right-[15%] text-purple-500/20 dark:text-purple-500/30 transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) rotate(15deg)` }}
        >
          <Feather size={100} strokeWidth={1} />
        </div>

        {/* Minik Readix (Mikro Blog) Kartı Temsili */}
        <div 
          className="absolute top-[45%] left-[10%] w-48 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xl transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * -25}px) rotate(-5deg)` }}
        >
          <div className="flex gap-3 items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-2 w-16 bg-primary/30 rounded-full" />
              <div className="h-1.5 w-10 bg-primary/20 rounded-full" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-300/50 dark:bg-slate-700/50 rounded-full" />
            <div className="h-2 w-5/6 bg-slate-300/50 dark:bg-slate-700/50 rounded-full" />
            <div className="h-2 w-4/6 bg-slate-300/50 dark:bg-slate-700/50 rounded-full" />
          </div>
        </div>

        {/* Başka Bir Ufak Kart */}
        <div 
          className="absolute top-[15%] right-[25%] w-32 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-lg transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * 15}px) rotate(8deg)` }}
        >
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-purple-400/30 rounded-full" />
            <div className="h-1.5 w-full bg-purple-400/30 rounded-full" />
            <div className="h-1.5 w-2/3 bg-purple-400/30 rounded-full" />
          </div>
        </div>
        
        {/* Logo (Parallax Etkili) */}
        <div 
          className="relative z-20 flex flex-col items-center text-center animate-fade-in-up transition-transform duration-75"
          style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }}
        >
          <Link href="/" className="hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
            <Image src="/brand-logo.png" alt="Readixon Logo" width={160} height={160} className="object-contain" priority />
          </Link>
        </div>
        
      </div>
      
    </div>
  );
}
