import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <Typography 
          variant="h1" 
          className="text-[120px] md:text-[180px] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/20 mb-4"
        >
          404
        </Typography>
        
        <Typography variant="h2" className="text-2xl md:text-4xl mb-4 text-white">
          Kayıp bir sayfaya ulaştınız.
        </Typography>
        
        <Typography variant="body" className="text-muted max-w-lg mb-10 text-lg">
          Aradığınız hikaye silinmiş, isim değiştirmiş veya yazar tarafından yayından kaldırılmış olabilir. Endişelenmeyin, kütüphanede okunacak daha binlerce hikaye var.
        </Typography>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" className="rounded-full px-8 py-6 w-full text-lg">
              <Home className="mr-2" size={20} /> Ana Sayfaya Dön
            </Button>
          </Link>
          <Link href="/feed" className="w-full sm:w-auto">
            <Button variant="outline" className="rounded-full px-8 py-6 w-full text-lg border-primary/30 text-primary hover:bg-primary/10">
              <Compass className="mr-2" size={20} /> Keşfet'e Git
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
