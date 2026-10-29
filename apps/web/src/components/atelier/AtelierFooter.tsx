'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierFooter({ site }: Props) {
  const { themeClasses, primaryColor } = useAtelierTheme();
  const currentYear = new Date().getFullYear();
  const authorName = site.hero?.authorName || site.username || 'Yazar';

  return (
    <footer className={`py-12 border-t ${themeClasses.border} ${themeClasses.bg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <p className="text-xs sm:text-sm font-medium">
            © {currentYear} {authorName}. Tüm hakları saklıdır.
          </p>
          <p className={`text-[11px] mt-1 ${themeClasses.muted}`}>
            Eserler ve edebi içerikler telif hakkı ile korunmaktadır.
          </p>
        </div>

        {/* Prestijli Readixon Atelier İmzası */}
        <div>
          <Link
            href="/"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all hover:scale-105 ${themeClasses.card} ${themeClasses.border}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Designed with <strong className="font-bold">Readixon Atelier</strong></span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

