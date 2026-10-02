'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function BrandSplashScreen() {
  return (
    <div
      data-theme="light"
      className="light flex min-h-[100dvh] w-full bg-background text-foreground items-center justify-center relative overflow-hidden select-none px-6"
    >
      {/* Zarif, tek ton ambient vignette (saf derinlik, göz yormayan minimal ışık) */}
      <div className="absolute w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center relative z-10"
      >
        {/* Login 11 Stili Minimal Logo Kartı */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-3xl bg-card border border-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden transition-all">
            <Image
              src="/brand-logo.png"
              alt="Readixon"
              width={96}
              height={96}
              className="object-contain scale-[1.65]"
              priority
            />
          </div>
        </div>

        {/* Marka İsmi & Minimalist Slogan */}
        <div className="flex flex-col items-center text-center space-y-1">
          <span className="font-extrabold text-2xl tracking-tight text-foreground font-sans">
            readixon
          </span>
          <span className="text-[11px] text-muted font-medium tracking-wider uppercase opacity-80">
            Sınırları Aşan Hikayeler
          </span>
        </div>

        {/* Login 11 Stili Zarif Hairline İlerleme Çizgisi */}
        <div className="w-28 h-[2.5px] bg-muted/20 rounded-full overflow-hidden mt-6">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
