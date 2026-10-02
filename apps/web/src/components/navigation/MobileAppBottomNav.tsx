'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, Hash, User, GalleryVertical } from 'lucide-react';
import { useAuthStore } from '@readixon/core';

export function MobileAppBottomNav() {
  const pathname = usePathname();
  const { firebaseUser, userProfile } = useAuthStore();

  // Gizlenecek sayfalar (Örn. derin okuyucu veya chat içi)
  const isReaderOrChat = pathname.startsWith('/read/') || (pathname.startsWith('/messages/') && pathname.split('/').length > 2);
  if (isReaderOrChat) return null;

  const navItems = [
    {
      label: 'Keşfet',
      href: '/feed',
      icon: Compass,
      isActive: pathname === '/feed' || pathname === '/',
    },
    {
      label: 'Webtoon',
      href: '/webtoons',
      icon: GalleryVertical,
      isActive: pathname.startsWith('/webtoons'),
    },
    {
      label: 'Readix',
      href: '/readix',
      icon: Hash,
      isActive: pathname.startsWith('/readix'),
    },
    {
      label: 'Kitaplık',
      href: '/library',
      icon: BookOpen,
      isActive: pathname === '/library',
    },
  ];

  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile/');

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto px-4 pb-2 pt-1 max-w-md w-full pointer-events-auto">
        {/* Floating Dock Container */}
        <div className="relative rounded-2xl bg-card/90 backdrop-blur-2xl border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 py-1 group select-none"
              >
                {/* Active Glow Pill */}
                {item.isActive && (
                  <span className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)] transition-all" />
                )}

                <div
                  className={`relative p-1 rounded-xl transition-all duration-200 ${
                    item.isActive
                      ? 'text-primary scale-110'
                      : 'text-muted group-hover:text-foreground group-active:scale-90'
                  }`}
                >
                  <Icon size={21} strokeWidth={item.isActive ? 2.5 : 2} />
                </div>

                <span
                  className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 ${
                    item.isActive ? 'font-bold text-primary' : 'font-medium text-muted'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Profil Sekmesi */}
          <Link
            href={firebaseUser ? '/profile' : '/login'}
            className="relative flex flex-col items-center justify-center flex-1 py-1 group select-none"
          >
            {isProfileActive && (
              <span className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)] transition-all" />
            )}

            <div
              className={`relative p-1 rounded-xl transition-all duration-200 ${
                isProfileActive
                  ? 'text-primary scale-110'
                  : 'text-muted group-hover:text-foreground group-active:scale-90'
              }`}
            >
              {firebaseUser ? (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-border/80 relative flex items-center justify-center bg-primary/20">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-primary uppercase">
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              ) : (
                <User size={21} strokeWidth={isProfileActive ? 2.5 : 2} />
              )}
            </div>

            <span
              className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 ${
                isProfileActive ? 'font-bold text-primary' : 'font-medium text-muted'
              }`}
            >
              {firebaseUser ? 'Profil' : 'Giriş'}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
