'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Sparkles, Compass, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export function MobileAppOnboarding() {
  return (
    <div
      data-theme="light"
      className="light md:hidden flex flex-col justify-between min-h-[100dvh] w-full bg-background text-foreground px-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] relative overflow-hidden select-none"
    >
      {/* Login 11 Stili Minimal Üst Ambient Işık */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. ÜST: Marka & Karşılama (Login 11 Minimalizmi) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="pt-2 flex flex-col items-center text-center space-y-3 relative z-10"
      >
        {/* Minimal Logo Kartı */}
        <div className="w-20 h-20 rounded-2xl bg-card border border-border/80 shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden">
          <Image
            src="/brand-logo.png"
            alt="Readixon"
            width={84}
            height={84}
            className="object-contain scale-[1.65]"
            priority
          />
        </div>

        {/* Rozet */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold tracking-wide">
          <span>Sınırları Aşan Hikayeler</span>
        </div>

        {/* Başlık & Açıklama */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            readixon
          </h1>
          <p className="text-xs text-muted max-w-[280px] leading-relaxed mx-auto">
            Okurları ve yazarları buluşturan yeni nesil dijital edebiyat topluluğu.
          </p>
        </div>
      </motion.div>

      {/* 2. ORTA: Login 11 Stili Birleşik Sade Özellik Kartı */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="py-4 relative z-10 w-full max-w-sm mx-auto"
      >
        <div className="rounded-2xl bg-card/80 border border-border/70 p-4 shadow-sm space-y-3.5 backdrop-blur-xl">
          {/* Özellik 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-foreground">Özgün Eserler & Webtoon</h3>
              <p className="text-[11px] text-muted truncate">Yüzlerce yerli roman ve görsel hikaye arşivi</p>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Özellik 2 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageCircle size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-foreground">Satır Arası Etkileşim</h3>
              <p className="text-[11px] text-muted truncate">Cümleleri vurgula, satır satır düşüncelerini paylaş</p>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Özellik 3 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-foreground">Yazar Stüdyosu & Readix</h3>
              <p className="text-[11px] text-muted truncate">Kendi hikayeni yayınla, okurlarınla doğrudan bağ kur</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. ALT: Aksiyon Butonları (Login 11 Tarzı Minimal Segment) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3 relative z-10 w-full max-w-sm mx-auto"
      >
        {/* Ana Aksiyon: Misafir Olarak Keşfet */}
        <Link href="/feed" className="block w-full">
          <button
            type="button"
            className="w-full h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
          >
            <Compass size={17} />
            <span>Misafir Olarak Keşfet</span>
            <ArrowRight size={15} />
          </button>
        </Link>

        {/* Giriş & Kayıt Segmenti */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/70 shadow-xs">
          <Link href="/login" className="flex-1">
            <button
              type="button"
              className="w-full py-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/10 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <LogIn size={14} className="text-primary" />
              <span>Giriş Yap</span>
            </button>
          </Link>

          <div className="w-px h-4 bg-border/60" />

          <Link href="/register" className="flex-1">
            <button
              type="button"
              className="w-full py-2.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus size={14} />
              <span>Kayıt Ol</span>
            </button>
          </Link>
        </div>

        {/* Misafir Vurgusu & Açıklaması */}
        <div className="text-center pt-0.5">
          <Link
            href="/feed"
            className="text-[12px] font-medium text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Hesap oluşturmadan da tüm içerikleri okuyabilirsiniz</span>
            <span className="text-primary font-bold">→</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
