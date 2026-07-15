import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import { Map, BookOpen, MessageCircle, Swords, Users, Sparkles, LayoutDashboard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Site Haritası | Readixon',
  description: 'Readixon platformundaki tüm sayfalara ve özelliklere bu harita üzerinden hızlıca erişin.',
};

export default function SitemapPage() {
  return (
    <div className="flex flex-col w-full pb-24 md:pb-10 bg-background overflow-x-hidden min-h-screen">
      <div className="relative w-full max-w-5xl mx-auto px-6 py-16 md:py-24">
        
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Map size={32} />
          </div>
          <Typography variant="h1" className="text-3xl md:text-5xl font-black text-text mb-4">Site Haritası</Typography>
          <Typography variant="body" className="text-muted text-lg max-w-2xl">
            Aradığınız her şey burada! Readixon'un tüm özelliklerine, sayfalarına ve keşif noktalarına buradan kolayca ulaşabilirsiniz.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Ana Sayfalar */}
          <div className="bg-card border border-border p-8 rounded-2xl">
            <Typography variant="h3" className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Sparkles size={20} /> Keşif ve Sosyal
            </Typography>
            <ul className="space-y-6">
              <li>
                <Link href="/feed" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Keşfet (Feed)</Typography>
                  <Typography variant="body" className="text-sm text-muted">Platformdaki en popüler hikayeleri, yeni çıkanları ve size özel önerileri keşfedin.</Typography>
                </Link>
              </li>
              <li>
                <Link href="/readix" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Readix Akışı</Typography>
                  <Typography variant="body" className="text-sm text-muted">Okurların kısa düşüncelerini (Readix), alıntılarını ve kitap sohbetlerini paylaştığı canlı sosyal ağımız.</Typography>
                </Link>
              </li>
              <li>
                <Link href="/about" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Readixon Hakkında</Typography>
                  <Typography variant="body" className="text-sm text-muted">Bizi diğerlerinden ayıran devrimsel mekanikleri (Curveball, Lobiler, RPG) detaylıca inceleyin.</Typography>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kütüphane & Okuma */}
          <div className="bg-card border border-border p-8 rounded-2xl">
            <Typography variant="h3" className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <BookOpen size={20} /> Kütüphane ve Okuma
            </Typography>
            <ul className="space-y-6">
              <li>
                <Link href="/library" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Kütüphanem</Typography>
                  <Typography variant="body" className="text-sm text-muted">Şu an okuduğunuz kitaplar, kaydettiğiniz listeler ve favori yazar koleksiyonlarınız.</Typography>
                </Link>
              </li>
              <li>
                <Link href="/explore/all" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Tüm Hikayeler</Typography>
                  <Typography variant="body" className="text-sm text-muted">Farklı türlerde binlerce orijinal kurguyu türüne veya etiketlerine göre filtreleyerek bulun.</Typography>
                </Link>
              </li>
            </ul>
          </div>

          {/* Edebi Arena */}
          <div className="bg-card border border-border p-8 rounded-2xl">
            <Typography variant="h3" className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Swords size={20} /> Edebi Arena
            </Typography>
            <ul className="space-y-6">
              <li>
                <Link href="/arena" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Arena Merkezi</Typography>
                  <Typography variant="body" className="text-sm text-muted">Aktif Yazar Lobileri'ne katılın, Sürpriz Kırılma (Curveball) modlarını deneyimleyin ve kör oylamalarla kazananları belirleyin.</Typography>
                </Link>
              </li>
            </ul>
          </div>

          {/* Yazar Stüdyosu */}
          <div className="bg-card border border-border p-8 rounded-2xl">
            <Typography variant="h3" className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <LayoutDashboard size={20} /> Yazar Stüdyosu
            </Typography>
            <ul className="space-y-6">
              <li>
                <Link href="/studio" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Stüdyo Yönetimi</Typography>
                  <Typography variant="body" className="text-sm text-muted">Gelişmiş blok tabanlı editörümüzü kullanarak kendi eserlerinizi oluşturun ve karakter RPG istatistiklerini ayarlayın.</Typography>
                </Link>
              </li>
              <li>
                <Link href="/studio/stats" className="block group">
                  <Typography variant="h4" className="font-bold text-text group-hover:text-primary transition-colors mb-1">Analizler ve İstatistikler</Typography>
                  <Typography variant="body" className="text-sm text-muted">Eserlerinizin okunma sayılarını, etkileşim raporlarını ve okur demografisini anlık olarak takip edin.</Typography>
                </Link>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
