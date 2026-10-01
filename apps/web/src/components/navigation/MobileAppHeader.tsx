'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MessageCircle, Bell, Search, Menu } from 'lucide-react';
import { Typography } from '@readixon/ui';
import { useAuthStore } from '@readixon/core';

interface MobileAppHeaderProps {
  unreadMessageCount?: number;
  onOpenMenu: () => void;
}

export function MobileAppHeader({ unreadMessageCount = 0, onOpenMenu }: MobileAppHeaderProps) {
  const pathname = usePathname();
  const { unreadNotificationCount, userProfile } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between shrink-0 select-none pt-[calc(0.75rem+env(safe-area-inset-top,0px))] transition-all">
      {/* Sol: Readixon Logo + Marka */}
      <Link href="/feed" className="flex items-center gap-2.5 active:scale-95 transition-transform">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-amber-400 p-[1px] shadow-sm shadow-primary/20">
          <div className="w-full h-full rounded-[11px] bg-background/90 flex items-center justify-center overflow-hidden">
            <Image
              src="/icon.png"
              alt="Readixon"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-foreground font-sans">
          readixon
        </span>
      </Link>

      {/* Sağ: İkonlar (Arama, Mesaj, Bildirim, Hamburger Menü) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Arama Butonu */}
        <Link
          href="/search"
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-card/80 active:scale-90 transition-all"
          title="Ara"
        >
          <Search size={20} className={pathname === '/search' ? 'text-primary' : ''} />
        </Link>

        {/* Mesajlar Butonu */}
        <Link
          href="/messages"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-card/80 active:scale-90 transition-all"
          title="Mesajlar"
        >
          <MessageCircle size={20} className={pathname.startsWith('/messages') ? 'text-primary' : ''} />
          {unreadMessageCount > 0 && (
            <span className="absolute 1 top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm border border-background animate-pulse">
              {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
            </span>
          )}
        </Link>

        {/* Bildirimler Butonu */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-card/80 active:scale-90 transition-all"
          title="Bildirimler"
        >
          <Bell size={20} className={pathname === '/notifications' ? 'text-primary' : ''} />
          {unreadNotificationCount > 0 && (
            <span className="absolute 1 top-1 right-1 w-4 h-4 bg-primary text-black text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm border border-background">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </Link>

        {/* Hamburger Menü Butonu (Cam Efektli & Şık) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="w-9 h-9 ml-1 rounded-xl bg-card/60 hover:bg-card border border-border/60 flex items-center justify-center text-foreground active:scale-90 transition-all shadow-sm"
          aria-label="Menüyü Aç"
        >
          <Menu size={19} />
        </button>
      </div>
    </header>
  );
}
