import React from 'react';
import HeroBannerForm from '../_components/HeroBannerForm';
import { Typography } from '@readixon/ui';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CreateHeroBannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/editor/hero">
          <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <Typography variant="h2" className="font-bold text-text mb-1">Yeni Manşet Ekle</Typography>
          <Typography variant="body" className="text-muted text-sm">Ana sayfada görünecek yeni bir hero duyurusu oluşturun.</Typography>
        </div>
      </div>
      
      <HeroBannerForm />
    </div>
  );
}
