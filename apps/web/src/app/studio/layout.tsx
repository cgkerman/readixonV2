'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from '@readixon/ui';
import { BookOpen, PenTool, BarChart3, ArrowLeft, Users, GalleryVertical } from 'lucide-react';
import { useAuthStore } from '@readixon/core';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { firebaseUser, userProfile, isLoading } = useAuthStore();

  const studioNavItems = [
    { name: 'Romanlarım', href: '/studio', icon: BookOpen },
    { name: 'Webtoon', href: '/studio/webtoons', icon: GalleryVertical },
    { name: 'İstatistik', href: '/studio/stats', icon: BarChart3 },
    { name: 'Karakterler', href: '/studio/characters', icon: Users },
    { name: 'Akademi', href: '/studio/academy', icon: PenTool },
  ];

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
      {/* ── Top Navbar (Desktop) ── */}
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
        <nav className="flex items-center gap-2">
          {studioNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all relative ${
                  isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:bg-muted/10 hover:text-text font-medium'
                }`}
              >
                <item.icon size={20} className={isActive ? "text-primary" : ""} />
                <span className="text-[15px]">{item.name}</span>
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col pb-28 xl:pb-8">
        {/* ── Mobile Top Header (Çentik & Safe-Area Uyumlu) ── */}
        <header className="xl:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/85 backdrop-blur-xl border-b border-border/40 shrink-0 select-none pt-[calc(0.75rem+env(safe-area-inset-top,0px))] transition-all">
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

        {children}
      </main>

      {/* ── Floating Modern Bottom Dock (Mobile) ── */}
      {!isDeepEditor && (
        <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
          <div className="mx-auto px-4 pb-2 pt-1 max-w-md w-full pointer-events-auto">
            <div className="relative rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-around py-2 px-1">
              {studioNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center justify-center flex-1 py-1 group select-none"
                  >
                    {/* Aktif Glow Çizgisi */}
                    {isActive && (
                      <span className="absolute -top-2 w-7 h-1 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)] transition-all" />
                    )}

                    <div
                      className={`relative p-1 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-primary scale-110'
                          : 'text-muted group-hover:text-foreground group-active:scale-90'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span
                      className={`text-[9px] tracking-tight transition-colors duration-200 mt-0.5 ${
                        isActive ? 'font-bold text-primary' : 'font-medium text-muted'
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
