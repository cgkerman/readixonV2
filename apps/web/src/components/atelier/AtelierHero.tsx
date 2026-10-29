'use client';

import React from 'react';
import { Sparkles, ArrowDown, BookOpen, Feather, Shield, Compass } from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierHero({ site }: Props) {
  const { 
    themeClasses, 
    primaryColor, 
    fontHeadingFamily, 
    fontBodyFamily, 
    cardRadiusClass,
    isDark, 
    template 
  } = useAtelierTheme();
  
  const hero = site.hero;
  if (!hero?.enabled) return null;

  const authorName = hero.authorName || site.username || 'Yazar';
  const authorTitle = hero.authorTitle || 'Roman & Edebiyat Yazarı';
  const bio = hero.bioShort || 'Kelimelerin derinliğinde kaybolan dünyalar ve karakterler...';
  const status = hero.currentStatus;

  return (
    <section 
      id="top" 
      className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden"
    >
      {/* Arka Plan Atmosfer Parıltısı */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 sm:h-[650px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-opacity duration-700"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Şablona Özel Arka Plan Dokuları */}
      {template === 'worldbuilder' && (
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Yazar Durum Hapı (Live Status Pill) */}
        {status && (
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium mb-6 sm:mb-8 backdrop-blur-md shadow-sm transition-all ${themeClasses.card} ${themeClasses.border}`}>
            <span className="relative flex h-2 w-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: primaryColor }}
              />
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: primaryColor }}
              />
            </span>
            <span className={themeClasses.muted}>{status}</span>
          </div>
        )}

        {/* Yazar Portresi / Büyük Avatar */}
        <div className="relative mb-6 sm:mb-8 group">
          <div 
            className={`w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 p-1.5 border-2 shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
              template === 'novelist' ? 'rounded-full ring-4 ring-amber-500/20' :
              template === 'worldbuilder' ? 'rounded-2xl rotate-1 group-hover:rotate-0 ring-4 ring-indigo-500/20' :
              template === 'webtoon' ? 'rounded-3xl ring-4 ring-pink-500/30' :
              'rounded-xl'
            }`}
            style={{ borderColor: primaryColor }}
          >
            {hero.avatarUrl ? (
              <img
                src={hero.avatarUrl}
                alt={authorName}
                className={`w-full h-full object-cover ${
                  template === 'novelist' ? 'rounded-full' :
                  template === 'worldbuilder' ? 'rounded-xl' :
                  template === 'webtoon' ? 'rounded-2xl' :
                  'rounded-lg'
                }`}
              />
            ) : (
              <div 
                className={`w-full h-full flex items-center justify-center font-bold text-3xl sm:text-5xl text-white ${
                  template === 'novelist' ? 'rounded-full' :
                  template === 'worldbuilder' ? 'rounded-xl' :
                  template === 'webtoon' ? 'rounded-2xl' :
                  'rounded-lg'
                }`}
                style={{ backgroundColor: primaryColor }}
              >
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Şablona Uygun Rozet Simgesi */}
          <div 
            className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white dark:border-black"
            style={{ backgroundColor: primaryColor }}
          >
            {template === 'worldbuilder' ? (
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : template === 'novelist' ? (
              <Feather className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
        </div>

        {/* Yazar Ünvanı */}
        <div 
          className={`text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 ${themeClasses.muted}`}
          style={{ letterSpacing: template === 'worldbuilder' ? '0.25em' : '0.12em' }}
        >
          {authorTitle}
        </div>

        {/* Yazar Adı (Büyük Display Tipografi) */}
        <h1 
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 max-w-3xl leading-tight"
          style={{ 
            fontFamily: fontHeadingFamily,
            letterSpacing: template === 'worldbuilder' ? '0.08em' : '-0.02em'
          }}
        >
          {authorName}
        </h1>

        {/* Şablona Özel Edebi Süsleme Bölücü */}
        {template === 'novelist' && (
          <div className="flex items-center justify-center gap-3 my-4 opacity-70 text-amber-600/80 dark:text-amber-500/60 text-sm">
            <span className="h-[1px] w-12 bg-current" />
            <span>❦ &nbsp; ✧ &nbsp; ❦</span>
            <span className="h-[1px] w-12 bg-current" />
          </div>
        )}

        {template === 'worldbuilder' && (
          <div className="flex items-center justify-center gap-3 my-4 opacity-80 text-indigo-400 text-xs tracking-widest uppercase">
            <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-indigo-500" />
            <span>✦ &nbsp; ᛭ &nbsp; ✦</span>
            <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-indigo-500" />
          </div>
        )}

        {template === 'webtoon' && (
          <div className="flex items-center justify-center gap-2 my-4">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        )}

        {/* Biyografi / Karşılama Mottosu */}
        <p className={`text-base sm:text-lg md:text-xl max-w-2xl font-normal leading-relaxed mb-8 sm:mb-10 ${themeClasses.muted}`}>
          {bio}
        </p>

        {/* Eylem Butonları (Call To Actions) */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          {hero.ctaButton?.enabled && (
            <a
              href="#books"
              className={`w-full sm:w-auto px-8 py-3.5 font-bold text-sm sm:text-base text-white shadow-xl transition-all duration-300 hover:opacity-95 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${
                template === 'webtoon' ? 'rounded-full' :
                template === 'novelist' ? 'rounded-full' :
                'rounded-xl'
              }`}
              style={{ backgroundColor: primaryColor }}
            >
              <BookOpen className="w-4 h-4" />
              <span>{hero.ctaButton.text || 'Eserleri İncele'}</span>
            </a>
          )}

          {site.enabledBlocks?.newsletter && (
            <a
              href="#newsletter"
              className={`w-full sm:w-auto px-7 py-3.5 font-semibold text-sm sm:text-base border transition-all duration-300 ${themeClasses.card} ${themeClasses.border} hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                template === 'webtoon' ? 'rounded-full' :
                template === 'novelist' ? 'rounded-full' :
                'rounded-xl'
              }`}
            >
              <span>Edebi Bültene Katıl</span>
              <ArrowDown className="w-4 h-4 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
