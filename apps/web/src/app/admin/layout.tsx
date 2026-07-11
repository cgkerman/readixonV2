"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Feather, LogOut, Settings, Hash, Flag } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { useAuthStore, signOut } from '@readixon/core';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, isInitialized } = useAuthStore();

  useEffect(() => {
    // Sadece auth yüklendiyse ve admin değilse yönlendir
    if (isInitialized && userProfile && !userProfile.isAdmin) {
      router.push('/');
    } else if (isInitialized && !userProfile) {
      router.push('/login');
    }
  }, [userProfile, isInitialized, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Hikayeler', href: '/admin/stories', icon: BookOpen },
    { name: 'Düellolar', href: '/admin/duels', icon: Feather },
    { name: "Readix'ler", href: '/admin/readixes', icon: Hash },
    { name: 'Şikayetler', href: '/admin/reports', icon: Flag },
    { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
  ];

  if (!isInitialized || !userProfile?.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden selection:bg-primary/20 text-text">
      {/* ── Sidebar (Admin) ── */}
      <aside className="w-64 flex-col border-r border-border/50 bg-card/20 p-6 hidden md:flex shrink-0">
        <div className="mb-8">
          <Typography variant="h2" className="font-bold text-primary tracking-tighter">readixon</Typography>
          <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Admin Panel</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive ? 'bg-primary text-background font-bold' : 'text-muted hover:bg-card hover:text-text'
                }`}
              >
                <item.icon size={20} />
                <Typography variant="body" className={`flex-1 ${isActive ? 'font-bold text-background' : 'font-medium'}`}>{item.name}</Typography>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onPress={handleSignOut}>
            <LogOut size={18} className="mr-2" /> Çıkış Yap
          </Button>
          <Link href="/">
             <Button variant="outline" className="w-full justify-start border-primary/20 text-primary hover:bg-primary/10">
               Uygulamaya Dön
             </Button>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-y-auto relative bg-background">
        {/* Top bar for mobile and extra actions */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
          <Typography variant="h3" className="font-semibold text-text md:hidden">Admin Panel</Typography>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <Typography variant="body" className="font-semibold text-sm leading-none">{userProfile.displayName}</Typography>
               <Typography variant="caption" className="text-muted">Administrator</Typography>
             </div>
             <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden border border-primary/50">
               {userProfile.avatarUrl ? (
                 <img src={userProfile.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                   {userProfile.displayName?.charAt(0) || 'A'}
                 </div>
               )}
             </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
