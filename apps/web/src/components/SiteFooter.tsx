import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Typography } from '@readixon/ui';
import { Mail, ArrowRight } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/50 bg-card/20 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-xl h-40 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/feed" className="inline-block">
              <img src="/brand-logo.png" alt="Readixon Logo" className="h-10 w-auto object-contain" />
            </Link>
            <Typography variant="body" className="text-muted leading-relaxed">
              Sınırları aşan hikayeler, özgür kalemler ve yeni nesil edebiyatın dijital kalbi. 
              Sözcüklere hayat ver, kendi evrenini yarat.
            </Typography>
          </div>

          {/* Kurumsal & Politikalar */}
          <div>
            <Typography variant="h4" className="font-bold text-text mb-6">Kurumsal</Typography>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-muted hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span> Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span> Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span> Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span> Topluluk Kuralları
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-muted hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span> Telif Hakkı & DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim / Reklam */}
          <div className="lg:col-span-1">
            <Typography variant="h4" className="font-bold text-text mb-6">İletişim</Typography>
            <div className="space-y-4">
              <a href="mailto:support@readixon.com" className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <Typography variant="body" className="font-semibold text-sm">Bize Ulaşın</Typography>
                  <Typography variant="caption" className="text-muted">support@readixon.com</Typography>
                </div>
              </a>

              <a href="mailto:ads@readixon.com" className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors group cursor-pointer">
                <div className="flex-1">
                  <Typography variant="body" className="font-semibold text-sm text-primary">Reklam Verin</Typography>
                  <Typography variant="caption" className="text-muted">Geniş kitlelere ulaşın</Typography>
                </div>
                <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* Alt Bilgi */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <Typography variant="caption" className="text-muted">
            &copy; {new Date().getFullYear()} Readixon. Tüm hakları saklıdır.
          </Typography>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/readixonofficial" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors text-sm font-medium flex items-center gap-2">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
