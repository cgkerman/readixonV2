'use client';

import React from 'react';
import { User, Quote, Trophy, Award, Sparkles } from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierAbout({ site }: Props) {
  const { 
    themeClasses, 
    primaryColor, 
    fontHeadingFamily, 
    cardRadiusClass,
    template 
  } = useAtelierTheme();

  const about = site.aboutConfig;
  if (!site.enabledBlocks?.about) return null;

  const bioMarkdown = about?.richBioMarkdown || site.hero?.bioShort || '';
  const pressQuotes = about?.pressQuotes || [];
  const awards = about?.awards || [];

  return (
    <section id="about" className={`py-16 sm:py-24 border-b transition-colors ${themeClasses.border}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <User className="w-3.5 h-3.5" />
            <span>Portre</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ 
              fontFamily: fontHeadingFamily,
              letterSpacing: template === 'worldbuilder' ? '0.06em' : '-0.02em'
            }}
          >
            {about?.title || 'Yazar Hakkında'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sol Kolon: Biyografi Metni */}
          <div className={`lg:col-span-7 p-6 sm:p-8 ${cardRadiusClass} border ${themeClasses.card} ${themeClasses.border}`}>
            <h3 
              className="text-xl sm:text-2xl font-bold mb-4"
              style={{ fontFamily: fontHeadingFamily }}
            >
              Edebi Yolculuk
            </h3>
            <div className={`text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line ${themeClasses.muted}`}>
              {bioMarkdown}
            </div>
          </div>

          {/* Sağ Kolon: Alıntılar ve Ödüller */}
          <div className="lg:col-span-5 space-y-6">
            {/* Basın Alıntıları (Press Quotes) */}
            {pressQuotes.length > 0 && (
              <div className={`p-6 ${cardRadiusClass} border ${themeClasses.card} ${themeClasses.border}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Basın & Eleştiriler
                  </span>
                </div>

                <div className="space-y-4">
                  {pressQuotes.map((item, index) => (
                    <div key={index} className="border-l-2 pl-4 border-amber-500/50">
                      <p className="italic text-xs sm:text-sm mb-1 leading-relaxed">
                        "{item.quote}"
                      </p>
                      <div className={`text-xs font-medium ${themeClasses.muted}`}>
                        — {item.source} {item.year ? `(${item.year})` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ödüller & Başarılar (Awards) */}
            {awards.length > 0 && (
              <div className={`p-6 ${cardRadiusClass} border ${themeClasses.card} ${themeClasses.border}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Ödüller & Onurlar
                  </span>
                </div>

                <div className="space-y-3">
                  {awards.map((award, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div 
                        className="p-1.5 rounded-lg text-white mt-0.5"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">{award.title}</div>
                        <div className={`text-xs ${themeClasses.muted}`}>
                          {award.institution} ({award.year})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
