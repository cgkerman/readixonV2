'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Map, 
  Users, 
  ExternalLink, 
  Compass, 
  Shield, 
  BookMarked 
} from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierUniverse({ site }: Props) {
  const { 
    themeClasses, 
    primaryColor, 
    fontHeadingFamily, 
    cardRadiusClass,
    template 
  } = useAtelierTheme();
  
  const config = site.universeConfig;
  if (!site.enabledBlocks?.universe || !config?.enabled) return null;

  return (
    <section id="universe" className={`py-16 sm:py-24 relative overflow-hidden border-b ${themeClasses.border}`}>
      {/* Arka Plan Mistik Vurgu */}
      <div 
        className="absolute top-1/2 right-0 w-80 h-80 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Kurgusal Dünya & Lore</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ 
              fontFamily: fontHeadingFamily,
              letterSpacing: template === 'worldbuilder' ? '0.06em' : '-0.02em'
            }}
          >
            {config.title || 'Kurgusal Evren & Dünya'}
          </h2>
          {config.description && (
            <p className={`text-sm sm:text-base ${themeClasses.muted}`}>
              {config.description}
            </p>
          )}
        </div>

        {/* Ana Evren Tanıtım Kartı */}
        <div className={`${cardRadiusClass} border p-6 sm:p-10 relative overflow-hidden backdrop-blur-md shadow-xl ${themeClasses.card} ${themeClasses.border}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sol: Açıklama ve Özellikler */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 block">
                  Evren Mimarisi
                </span>
                <h3 
                  className="text-xl sm:text-3xl font-bold tracking-tight mb-4"
                  style={{ fontFamily: fontHeadingFamily }}
                >
                  {config.title}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed mb-6 ${themeClasses.muted}`}>
                  {config.description || 'Kitaplarımın içinde nefes aldığı, kadim krallıklar, büyülü ırklar ve zengin efsanelerle örülü interaktif dünya.'}
                </p>

                {/* Evren Özellik Rozetleri */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {config.showInteractiveMap && (
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${themeClasses.border} bg-black/5 dark:bg-white/5`}>
                      <Map className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold">Dünya Haritası</span>
                    </div>
                  )}

                  {config.showCharacterCards && (
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${themeClasses.border} bg-black/5 dark:bg-white/5`}>
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold">Karakter Codex</span>
                    </div>
                  )}

                  {config.showGlossaryPreview && (
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${themeClasses.border} bg-black/5 dark:bg-white/5`}>
                      <BookMarked className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold">Kadim Sözlük</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Readixon Evren Sayfasına Bağlantı */}
              <div>
                {config.universeId ? (
                  <Link
                    href={`/universe/${config.universeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg transition-transform hover:opacity-95 active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Evreni İnteraktif Keşfet</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className={`inline-flex items-center gap-2 text-xs ${themeClasses.muted}`}>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Evren Stüdyosu entegrasyonu aktif</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ: İllüstrasyon & Harita Önizleme Kutusu */}
            <div className="lg:col-span-5">
              <div 
                className={`relative ${cardRadiusClass} border aspect-video lg:aspect-square flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-2xl`}
                style={{
                  background: `radial-gradient(circle at center, ${primaryColor}30, #0a0a0f)`,
                  borderColor: `${primaryColor}40`,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <Map className="w-16 h-16 text-indigo-400 mb-4 animate-pulse" />
                <span className="text-base font-bold text-white mb-1">İnteraktif Evren Haritası</span>
                <span className="text-xs text-neutral-400 max-w-xs">
                  Readixon Evren Stüdyosu motoru ile çizilmiş canlı coğrafya, şehirler ve rotalar.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
