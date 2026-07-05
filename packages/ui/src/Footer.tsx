import React from 'react';
import { Typography } from './Typography';
import { Globe, Mail, MessageCircle, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-md py-12 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between gap-10">
        
        {/* Brand Area */}
        <div className="flex flex-col gap-4 max-w-sm">
          <Typography variant="h2" className="font-bold text-primary tracking-tighter">readixon</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed">
            Sınırları aşan hikayeler, derin etkileşimler ve yeni nesil yazarlık deneyimi. Okumayı ve yazmayı yeniden tanımlıyoruz.
          </Typography>
          <div className="flex gap-4 mt-2">
            <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors border border-border/50">
              <Globe size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors border border-border/50">
              <Mail size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors border border-border/50">
              <MessageCircle size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors border border-border/50">
              <Heart size={18} />
            </a>
          </div>
        </div>

        {/* Links Area */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
          <div className="flex flex-col gap-3">
            <Typography variant="caption" className="font-bold text-text mb-2 uppercase tracking-widest">Platform</Typography>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Keşfet</a>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Yazar Ol</a>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Readix</a>
          </div>
          <div className="flex flex-col gap-3">
            <Typography variant="caption" className="font-bold text-text mb-2 uppercase tracking-widest">Kurumsal</Typography>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Hakkımızda</a>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Kariyer</a>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Blog</a>
          </div>
          <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
            <Typography variant="caption" className="font-bold text-text mb-2 uppercase tracking-widest">Destek</Typography>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Yardım Merkezi</a>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Gizlilik Politikası</a>
            <a href="#" className="text-sm text-muted hover:text-primary transition-colors">Kullanım Koşulları</a>
          </div>
        </div>
        
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <Typography variant="caption" className="text-muted/60">
          © {new Date().getFullYear()} Readixon. Tüm Hakları Saklıdır.
        </Typography>
        <Typography variant="caption" className="text-muted/40">
          Designed with ❤️ for readers.
        </Typography>
      </div>
    </footer>
  );
};
