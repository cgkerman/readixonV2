'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from '@readixon/ui';
import { BookOpen, PenTool, BarChart3, ArrowLeft, Users, GalleryVertical, Menu } from 'lucide-react';
import { useAuthStore } from '@readixon/core';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { firebaseUser, userProfile, isLoading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const studioNavItems = [
    { name: 'Romanlarım', href: '/studio', icon: BookOpen },
    { name: 'Webtoon', href: '/studio/webtoons', icon: GalleryVertical },
    { name: 'İstatistik', href: '/studio/stats', icon: BarChart3 },
    { name: 'Karakterler', href: '/studio/characters', icon: Users },
    { name: 'Akademi', href: '/studio/academy', icon: PenTool },
  ];

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
        <Link href="/studio" className="shrink-0 flex items-center gap-2">
          <PenTool className="text-primary" size={24} />
          <Typography variant="h3" className="font-bold text-text tracking-tight">Stüdyo</Typography>
        </Link>

        {/* Center: Main Navigation */}
        <nav className="flex items-center gap-2">
          {studioNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/studio' && pathname.includes(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all relative ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:bg-muted/10 hover:text-text font-medium'
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
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* ── Mobile Top Header ── */}
        <div className="xl:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border/10 shrink-0">
          <div className="flex items-center gap-2">
            <PenTool className="text-primary" size={20} />
            <Typography variant="h3" className="font-bold text-primary tracking-tighter">stüdyo</Typography>
          </div>
          <Link href="/feed" className="text-muted hover:text-text transition-colors flex items-center gap-1">
            <Typography variant="caption" className="font-semibold">Okuyucuya Dön</Typography>
          </Link>
        </div>

        {children}
      </main>

      {/* ── Bottom Nav (Mobile/Tablet) ── */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-xl border-t border-border/10 flex items-center justify-around px-2 z-50 pb-safe">
        {studioNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/studio' && pathname.includes(item.href));
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-full relative">
              <item.icon size={22} className={isActive ? 'text-primary' : 'text-muted'} />
              <Typography variant="caption" className={`text-[9px] font-bold mt-1 ${isActive ? 'text-primary' : 'text-muted'}`}>
                {item.name}
              </Typography>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
