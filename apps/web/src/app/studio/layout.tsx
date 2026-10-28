'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from '@readixon/ui';
import { 
  BookOpen, 
  PenTool, 
  BarChart3, 
  ArrowLeft, 
  Users, 
  GalleryVertical, 
  Layers, 
  Sparkles, 
  Newspaper,
  LayoutGrid,
  X,
  ChevronRight,
  PlusCircle,
  FilePlus2,
  Globe
} from 'lucide-react';
import { useAuthStore } from '@readixon/core';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { firebaseUser, userProfile, isLoading } = useAuthStore();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Masaüstü Üst Barında Yer Alan Tüm 8 Öğe
  const desktopNavItems = [
    { name: 'Romanlarım', href: '/studio', icon: BookOpen },
    { name: 'Köşe Yazısı', href: '/studio/columns', icon: Newspaper },
    { name: 'Serilerim', href: '/studio/series', icon: Layers },
    { name: 'Evrenlerim', href: '/studio/universes', icon: Sparkles },
    { name: 'Webtoon', href: '/studio/webtoons', icon: GalleryVertical },
    { name: 'Karakterler', href: '/studio/characters', icon: Users },
    { name: 'İstatistik', href: '/studio/stats', icon: BarChart3 },
    { name: 'Akademi', href: '/studio/academy', icon: PenTool },
  ];

  // Mobil & Tablet Alt Barında Daima Görünen 4 Temel Öğe
  const primaryDockLeft = [
    { name: 'Romanlarım', href: '/studio', icon: BookOpen },
    { name: 'Evrenlerim', href: '/studio/universes', icon: Sparkles },
  ];

  const primaryDockRight = [
    { name: 'İstatistik', href: '/studio/stats', icon: BarChart3 },
    { name: 'Akademi', href: '/studio/academy', icon: PenTool },
  ];

  // Alt Çekmecede (Drawer / Bottom Sheet) Yer Alan Zengin Stüdyo Araçları
  const secondaryStudioTools = [
    {
      name: 'Köşe Yazısı Masası',
      shortName: 'Köşe Yazısı',
      href: '/studio/columns',
      icon: Newspaper,
      description: 'Gündem için edebi köşe yazıları ve denemeler kaleme al',
      badge: 'Yazar Masası',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      name: 'Webtoon Stüdyosu',
      shortName: 'Webtoon',
      href: '/studio/webtoons',
      icon: GalleryVertical,
      description: 'Dikey panelli çizgi roman ve görsel kurgu yönetimi',
      badge: 'Görsel',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Kitap Serilerim',
      shortName: 'Serilerim',
      href: '/studio/series',
      icon: Layers,
      description: 'Ciltler, devam kitapları ve bağlantılı seriler oluştur',
      badge: 'Ciltli',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      name: 'Karakterler & Codex',
      shortName: 'Karakterler',
      href: '/studio/characters',
      icon: Users,
      description: 'Tüm evren ve hikaye karakterlerinin arşivi ve ilişki ağı',
      badge: 'Evren',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  // Aktif sayfa ikincil araçlardan biri mi?
  const activeSecondaryTool = secondaryStudioTools.find(
    (tool) => pathname === tool.href || pathname.startsWith(`${tool.href}/`)
  );

  // Sayfa değiştiğinde çekmeceyi otomatik kapat
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [pathname]);

  // ESC tuşuna basıldığında çekmeceyi kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreSheetOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derin editör veya bölüm yazma ekranlarında alt dock'u gizle
  const isDeepEditor = pathname.includes('/chapter/') || pathname.includes('/episodes/');

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-background text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <Typography variant="body" className="text-muted">Yükleniyor...</Typography>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-background text-center p-6">
        <Typography variant="h2" className="mb-4">Yazar Stüdyosuna Hoş Geldiniz</Typography>
        <Typography variant="body" className="text-muted">Hikaye yazmak ve yayınlamak için lütfen giriş yapın.</Typography>
        <Link href="/" className="mt-6 text-primary hover:underline">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  if (userProfile && !userProfile.isAuthor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-background text-center p-6">
        <Typography variant="h2" className="mb-4 text-red-500">Erişim Reddedildi</Typography>
        <Typography variant="body" className="text-muted max-w-md mx-auto">
          Yazar stüdyosuna erişmek için öncelikle "Yazar Ol" adımlarını (ve e-posta doğrulamasını) tamamlamanız gerekmektedir.
        </Typography>
        <Link href="/" className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors">
          Ana Sayfaya Dön ve Yazar Ol
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden relative">
      {/* ── Top Navbar (Desktop - Bölüm/Episod Yazma Ekranlarında Gizlenir) ── */}
      {!isDeepEditor && (
        <header className="hidden xl:flex items-center justify-between border-b border-border/10 bg-card/30 px-8 h-[76px] shrink-0 backdrop-blur-md z-50">
          {/* Left: Logo */}
          <Link href="/studio" className="shrink-0 flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-amber-400 p-[1px] shadow-sm shadow-primary/20">
              <div className="w-full h-full rounded-[11px] bg-background flex items-center justify-center">
                <PenTool className="text-primary group-hover:rotate-12 transition-transform duration-200" size={19} />
              </div>
            </div>
            <Typography variant="h3" className="font-bold text-text tracking-tight">Stüdyo</Typography>
          </Link>

          {/* Center: Main Navigation */}
          <nav className="flex items-center gap-1.5">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all relative ${
                    isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:bg-muted/10 hover:text-text font-medium'
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-primary" : ""} />
                  <span className="text-[14px]">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/feed"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted hover:text-text hover:bg-muted/10 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Okuyucuya Dön</span>
            </Link>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* ── Mobile & Tablet Top Header ── */}
        {!isDeepEditor && (
          <header className="xl:hidden sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-background/85 backdrop-blur-xl border-b border-border/40 shrink-0 select-none pt-[calc(0.75rem+env(safe-area-inset-top,0px))] transition-all">
            <Link href="/studio" className="flex items-center gap-2.5 active:scale-95 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-amber-400 p-[1px] shadow-sm shadow-primary/20">
                <div className="w-full h-full rounded-[11px] bg-background/90 flex items-center justify-center">
                  <PenTool className="text-primary" size={17} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-foreground leading-none">
                  stüdyo
                </span>
                <span className="text-[10px] text-muted font-medium mt-0.5">
                  Yazar Paneli
                </span>
              </div>
            </Link>

            <Link
              href="/feed"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 hover:bg-card border border-border/60 text-muted hover:text-foreground text-xs font-semibold active:scale-95 transition-all shadow-xs"
            >
              <ArrowLeft size={14} className="text-primary" />
              <span>Okuyucuya Dön</span>
            </Link>
          </header>
        )}

        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* ── Mobil & Tablet Yüzen Alt Menü İçin Güvenli Boşluk ── */}
        {!isDeepEditor && (
          <div className="h-28 sm:h-32 xl:hidden shrink-0 pointer-events-none" aria-hidden="true" />
        )}
      </main>

      {/* ── Akıllı Alt Çekmece (More Tools Bottom Sheet Drawer) ── */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <>
            {/* Arka Plan Karartması */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 xl:hidden"
            />

            {/* Çekmece İçerik Paneli */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-xl mx-auto bg-card/95 backdrop-blur-2xl border-t border-x border-border/60 rounded-t-[32px] p-5 sm:p-6 shadow-2xl xl:hidden pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Sürükleme / Dokunma Tutamağı */}
              <div 
                className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-4 cursor-pointer hover:bg-muted-foreground/50 transition-colors"
                onClick={() => setIsMoreSheetOpen(false)}
              />

              {/* Çekmece Başlığı */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
                <div>
                  <h3 className="font-black text-base sm:text-lg text-foreground flex items-center gap-2">
                    <LayoutGrid size={18} className="text-primary" />
                    <span>Tüm Stüdyo Araçları</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gelişmiş yayıncılık, evren ve kurgu yönetimi
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Hızlı Eylemler (Quick Actions Bar) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Link
                  href="/studio"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all text-center group active:scale-95"
                >
                  <FilePlus2 size={18} className="text-primary mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-primary">Yeni Hikaye</span>
                </Link>

                <Link
                  href="/studio/columns/new"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all text-center group active:scale-95"
                >
                  <Newspaper size={18} className="text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-amber-500">Köşe Yazısı</span>
                </Link>

                <Link
                  href="/studio/universes"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all text-center group active:scale-95"
                >
                  <Globe size={18} className="text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-cyan-400">Yeni Evren</span>
                </Link>
              </div>

              {/* İkincil Stüdyo Araçları Listesi */}
              <div className="space-y-2">
                {secondaryStudioTools.map((tool) => {
                  const isActive = pathname === tool.href || pathname.startsWith(`${tool.href}/`);
                  const Icon = tool.icon;

                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setIsMoreSheetOpen(false)}
                      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 group active:scale-98 ${
                        isActive
                          ? 'bg-primary/10 border-primary/40 shadow-sm'
                          : 'bg-card/40 border-border/40 hover:bg-muted/10 hover:border-border/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tool.color}`}>
                          <Icon size={20} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-muted/30 text-muted-foreground">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive && (
                          <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                        <ChevronRight size={16} className="text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Akıllı, Ferah Yüzen Alt Menü (Modern Dynamic Capsule Dock) ── */}
      {!isDeepEditor && (
        <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
          <div className="mx-auto px-4 pb-2.5 pt-1 max-w-md sm:max-w-lg md:max-w-xl w-full pointer-events-auto">
            <div className="relative rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/60 shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex items-center justify-between py-2 px-2 sm:px-4">
              
              {/* 1. Sol İki Buton (Romanlarım & Evrenlerim) */}
              {primaryDockLeft.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center justify-center flex-1 py-1 group select-none transition-transform active:scale-95"
                  >
                    {isActive && (
                      <span className="absolute -top-2 w-7 h-1 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)] transition-all" />
                    )}

                    <div
                      className={`relative p-1 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-primary scale-110'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span
                      className={`text-[10px] sm:text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                        isActive ? 'font-black text-primary' : 'font-medium text-muted-foreground'
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              {/* 2. Merkez Buton: Stüdyo Menüsü (Tüm Araçlar Çekmecesi) */}
              <button
                type="button"
                onClick={() => setIsMoreSheetOpen(prev => !prev)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 group select-none cursor-pointer transition-transform active:scale-95"
              >
                {/* Eğer ikincil bir araçtaysa veya çekmece açıksa aktif glow göster */}
                {(activeSecondaryTool || isMoreSheetOpen) && (
                  <span className="absolute -top-2 w-7 h-1 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)] transition-all" />
                )}

                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    activeSecondaryTool || isMoreSheetOpen
                      ? 'text-primary scale-110 bg-primary/10'
                      : 'text-muted-foreground group-hover:text-foreground bg-muted/10'
                  }`}
                >
                  {activeSecondaryTool ? (
                    <activeSecondaryTool.icon size={20} strokeWidth={2.5} />
                  ) : (
                    <LayoutGrid size={20} strokeWidth={isMoreSheetOpen ? 2.5 : 2} />
                  )}
                </div>

                <span
                  className={`text-[10px] sm:text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                    activeSecondaryTool || isMoreSheetOpen
                      ? 'font-black text-primary'
                      : 'font-medium text-muted-foreground'
                  }`}
                >
                  {activeSecondaryTool ? activeSecondaryTool.shortName : 'Araçlar'}
                </span>
              </button>

              {/* 3. Sağ İki Buton (İstatistik & Akademi) */}
              {primaryDockRight.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center justify-center flex-1 py-1 group select-none transition-transform active:scale-95"
                  >
                    {isActive && (
                      <span className="absolute -top-2 w-7 h-1 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)] transition-all" />
                    )}

                    <div
                      className={`relative p-1 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-primary scale-110'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span
                      className={`text-[10px] sm:text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                        isActive ? 'font-black text-primary' : 'font-medium text-muted-foreground'
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}

            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
