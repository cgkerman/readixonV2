'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from '@readixon/ui';
import { BookOpen, PenTool, BarChart3, ArrowLeft, Users } from 'lucide-react';
import { useAuthStore } from '@readixon/core';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { firebaseUser, userProfile, isLoading } = useAuthStore();

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
    <div className="flex h-screen bg-background">
      {/* Studio Sidebar */}
      <aside className="w-64 border-r border-border/10 bg-card/30 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border/10">
          <Link href="/studio" className="flex items-center gap-2">
            <PenTool className="text-primary" size={24} />
            <Typography variant="h3" className="font-bold text-text tracking-tight">Stüdyo</Typography>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link 
            href="/studio" 
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname === '/studio' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-muted/10'}`}
          >
            <BookOpen size={20} />
            <span className="font-medium">Hikayelerim</span>
          </Link>
          <Link 
            href="/studio/stats" 
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname.includes('/stats') ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-muted/10'}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">İstatistikler</span>
          </Link>
          <Link 
            href="/studio/characters" 
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname.includes('/characters') ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-muted/10'}`}
          >
            <Users size={20} />
            <span className="font-medium">Karakter Defteri</span>
          </Link>
          <Link 
            href="/studio/academy" 
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname.includes('/academy') ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-muted/10'}`}
          >
            <PenTool size={20} />
            <span className="font-medium">Yazar Akademisi</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border/10">
          <Link 
            href="/feed" 
            className="flex items-center gap-3 p-3 rounded-xl transition-colors text-muted hover:text-text hover:bg-muted/10"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Okuyucuya Dön</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
