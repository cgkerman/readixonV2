'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Compass, LogIn, ArrowRight, ShieldCheck, Flame, BookOpen } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';

export function MobileAppOnboarding() {
  const router = useRouter();

  return (
    <div className="md:hidden flex flex-col justify-between min-h-[100dvh] w-full bg-[#0a0a0c] text-white p-6 relative overflow-hidden select-none">
      {/* Arka Plan Glow Efektleri */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* 1. ÜST: Logo ve Karşılama */}
      <div className="pt-8 flex flex-col items-center text-center space-y-4 relative z-10">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-primary to-amber-400 opacity-60 blur-lg group-hover:opacity-100 transition duration-500" />
          <div className="relative w-20 h-20 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center p-3 shadow-2xl">
            <Image
              src="/icon.png"
              alt="Readixon"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-primary font-mono">
            MOBİL UYGULAMA
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            readixon
          </h1>
        </div>

        <p className="text-sm text-zinc-400 max-w-[280px] leading-relaxed">
          Sınırları aşan hikayeler, webtoonlar ve yazarlık evreni artık cebinizde.
        </p>
      </div>

      {/* 2. ORTA: Mini Özellik Kartları */}
      <div className="py-6 space-y-2.5 relative z-10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Akıcı Okuma Keyfi</h3>
            <p className="text-[11px] text-zinc-400">Webtoon ve romanlar tek tıkla elinin altında.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Haftalık Düellolar & Arena</h3>
            <p className="text-[11px] text-zinc-400">Yazarlar yarışıyor, okurlar karar veriyor.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Özgür Yaratıcılık</h3>
            <p className="text-[11px] text-zinc-400">Yazar Stüdyosu ile hemen kendi eserini üret.</p>
          </div>
        </div>
      </div>

      {/* 3. ALT: Aksiyon Butonları */}
      <div className="pb-6 space-y-3 relative z-10">
        <Link href="/feed" className="block w-full">
          <button
            type="button"
            className="w-full h-13 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
          >
            <Compass size={18} />
            <span>Keşfetmeye Başla</span>
            <ArrowRight size={16} />
          </button>
        </Link>

        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/login" className="block w-full">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <LogIn size={14} className="text-primary" />
              <span>Giriş Yap</span>
            </button>
          </Link>

          <Link href="/register" className="block w-full">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <span>Hesap Oluştur</span>
            </button>
          </Link>
        </div>

        <p className="text-[11px] text-center text-zinc-500 pt-1">
          Giriş yapmadan da tüm içerikleri keşfedebilirsiniz.
        </p>
      </div>
    </div>
  );
}
