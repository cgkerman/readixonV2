"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, LogOut, BellRing, HelpCircle, Quote, 
  LayoutTemplate, BookOpen, Award, Menu, X, ArrowLeft 
} from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { useAuthStore, signOut } from '@readixon/core';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, isInitialized } = useAuthStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sayfa değiştiğinde mobil çekmeceyi otomatik kapat
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Sadece auth yüklendiyse ve editor/admin değilse yönlendir
    if (isInitialized && userProfile && !userProfile.isEditor && !userProfile.isAdmin) {
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
    { name: 'Dashboard', href: '/editor', icon: LayoutDashboard },
    { name: 'Hikayeler', href: '/editor/stories', icon: BookOpen },
    { name: 'Kitap Değerlendirmeleri', href: '/editor/reviews', icon: Award },
    { name: 'Manşet Yönetimi', href: '/editor/hero', icon: LayoutTemplate },
    { name: 'Kültür Sanat Haberleri', href: '/editor/news', icon: BellRing },
    { name: 'Anketler', href: '/editor/polls', icon: HelpCircle },
    { name: 'Alıntılar', href: '/editor/quote', icon: Quote },
  ];

  if (!isInitialized || (!userProfile?.isEditor && !userProfile?.isAdmin)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden selection:bg-primary/20 text-text">
      {/* ── Sidebar (Editor - Desktop) ── */}
      <aside className="w-64 flex-col border-r border-border/50 bg-card/20 p-6 hidden md:flex shrink-0">
        <div className="mb-8">
          <Typography variant="h2" className="font-bold text-primary tracking-tighter">readixon</Typography>
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Editör Paneli
          </span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive ? 'bg-primary text-background font-bold shadow-sm' : 'text-muted hover:bg-card hover:text-text'
                }`}
              >
                <item.icon size={20} />
                <Typography variant="body" className={`flex-1 text-sm ${isActive ? 'font-bold text-background' : 'font-medium'}`}>{item.name}</Typography>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer" onPress={handleSignOut}>
            <LogOut size={18} className="mr-2" /> Çıkış Yap
          </Button>
          <Link href="/feed">
             <Button variant="outline" className="w-full justify-start border-primary/20 text-primary hover:bg-primary/10 cursor-pointer">
               <ArrowLeft size={16} className="mr-2" /> Uygulamaya Dön
             </Button>
          </Link>
        </div>
      </aside>

      {/* ── Mobile Drawer (Slide-Over) ── */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          
          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] bg-card border-r border-border/50 shadow-2xl flex flex-col h-full p-5 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div>
                <Typography variant="h3" className="font-bold text-primary tracking-tighter">readixon</Typography>
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Editör Paneli
                </span>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-muted hover:text-text hover:bg-muted/10 transition-colors cursor-pointer"
                aria-label="Menüyü Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 custom-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive ? 'bg-primary text-background font-bold shadow-sm' : 'text-muted hover:bg-muted/10 hover:text-text'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border/50 flex flex-col gap-2 mt-auto">
              <Link href="/feed" onClick={() => setIsMobileDrawerOpen(false)}>
                <Button variant="outline" className="w-full justify-start text-xs border-primary/20 text-primary hover:bg-primary/10 cursor-pointer">
                  <ArrowLeft size={16} className="mr-2" /> Uygulamaya Dön
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer" onPress={handleSignOut}>
                <LogOut size={16} className="mr-2" /> Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-y-auto relative bg-background">
        {/* Top bar for mobile and extra actions */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 -ml-1 rounded-xl text-muted hover:text-text hover:bg-muted/10 md:hidden transition-colors cursor-pointer"
              aria-label="Menüyü Aç"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <Typography variant="h3" className="font-semibold text-text text-base sm:text-lg">Editör Paneli</Typography>
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 md:hidden">
                Editör
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
             <div className="text-right hidden sm:block">
               <Typography variant="body" className="font-semibold text-sm leading-none">{userProfile.displayName}</Typography>
               <Typography variant="caption" className="text-muted">{userProfile.isAdmin ? 'Yönetici & Editör' : 'Editör'}</Typography>
             </div>
             <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden border border-primary/50 shrink-0">
               {userProfile.avatarUrl ? (
                 <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                   {userProfile.displayName?.charAt(0) || 'E'}
                 </div>
               )}
             </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
