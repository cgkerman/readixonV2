'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sun, 
  Moon, 
  Coffee, 
  Menu, 
  X, 
  BookOpen, 
  Sparkles, 
  User, 
  Calendar, 
  Mail, 
  ExternalLink 
} from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
  isStandalone?: boolean;
}

export function AtelierHeader({ site, isStandalone = true }: Props) {
  const { mode, toggleMode, themeClasses, primaryColor, fontHeadingFamily } = useAtelierTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authorName = site.hero?.authorName || site.username || 'Yazar';
  const monogram = authorName.charAt(0).toUpperCase();

  const navLinks = [
    { name: 'Eserler', href: '#books', show: site.enabledBlocks?.books },
    { name: 'Evren & Dünya', href: '#universe', show: site.enabledBlocks?.universe && site.universeConfig?.enabled },
    { name: 'Biyografi', href: '#about', show: site.enabledBlocks?.about },
    { name: 'Etkinlikler', href: '#events', show: site.enabledBlocks?.events && site.eventsConfig?.enabled },
    { name: 'Bülten', href: '#newsletter', show: site.enabledBlocks?.newsletter },
  ].filter((item) => item.show !== false);

  const renderModeIcon = () => {
    if (mode === 'light') {
      return <Sun className="w-4 h-4 text-amber-500" />;
    }
    if (mode === 'sepia') {
      return <Coffee className="w-4 h-4 text-[#A87948]" />;
    }
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  const getModeLabel = () => {
    if (mode === 'light') return 'Açık Mod';
    if (mode === 'sepia') return 'Sepya Mod';
    if (mode === 'oled') return 'OLED Mod';
    return 'Gece Modu';
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors border-b ${themeClasses.border} ${themeClasses.bg}/85`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Sol: Yazar Monogramı & İsmi */}
        <a 
          href="#top" 
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div 
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            {site.hero?.avatarUrl ? (
              <img 
                src={site.hero.avatarUrl} 
                alt={authorName} 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <span className="text-sm sm:text-base tracking-wider">{monogram}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span 
              className="text-base sm:text-lg font-bold tracking-tight transition-colors group-hover:opacity-80"
              style={{ fontFamily: fontHeadingFamily }}
            >
              {authorName}
            </span>
            {site.hero?.authorTitle && (
              <span className={`text-[10px] sm:text-xs tracking-wider uppercase ${themeClasses.muted}`}>
                {site.hero.authorTitle}
              </span>
            )}
          </div>
        </a>

        {/* Masaüstü Navigasyon */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-white ${themeClasses.muted} hover:opacity-100`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Sağ: Tema Anahtarı & Readixon Bağlantısı */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gündüz / Gece / Sepya Modu Geçiş Butonu */}
          <button
            onClick={toggleMode}
            type="button"
            title={`Tema: ${getModeLabel()} (Değiştirmek için tıkla)`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${themeClasses.card} ${themeClasses.border} hover:scale-105 active:scale-95`}
          >
            {renderModeIcon()}
            <span className="hidden sm:inline text-xs font-medium">{getModeLabel()}</span>
          </button>

          {/* Readixon Profiline Git Butonu */}
          <Link
            href={`/profile/${site.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-transform hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Readixon Profili</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className={`md:hidden p-2 rounded-lg border transition-colors ${themeClasses.card} ${themeClasses.border}`}
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobil Açılır Menü Çekmecesi */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 py-5 space-y-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 ${themeClasses.card} ${themeClasses.border}`}>
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between text-base font-medium py-2 px-3 rounded-lg transition-colors ${themeClasses.muted} hover:bg-black/5 dark:hover:bg-white/5`}
              >
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Platform:</span>
            <Link
              href={`/profile/${site.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Readixon Profilini Ziyaret Et</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

