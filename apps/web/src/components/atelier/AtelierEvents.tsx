'use client';

import React from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierEvents({ site }: Props) {
  const { 
    themeClasses, 
    primaryColor, 
    fontHeadingFamily, 
    cardRadiusClass,
    template 
  } = useAtelierTheme();

  const config = site.eventsConfig;

  if (!site.enabledBlocks?.events || !config?.enabled || !config.events || config.events.length === 0) {
    return null;
  }

  return (
    <section id="events" className={`py-16 sm:py-24 border-b transition-colors ${themeClasses.border}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Takvim</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ 
              fontFamily: fontHeadingFamily,
              letterSpacing: template === 'worldbuilder' ? '0.06em' : '-0.02em'
            }}
          >
            {config.title || 'Gelecek Etkinlikler & İmza Günleri'}
          </h2>
        </div>

        <div className="space-y-4">
          {config.events.map((event) => (
            <div
              key={event.id}
              className={`p-5 sm:p-6 ${cardRadiusClass} border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${themeClasses.card} ${themeClasses.border} ${themeClasses.cardHover}`}
            >
              <div className="flex items-start gap-4">
                <div 
                  className={`p-3 text-white flex flex-col items-center justify-center min-w-[56px] text-center shadow-md ${
                    template === 'webtoon' ? 'rounded-2xl' : 'rounded-xl'
                  }`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <Calendar className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Tarih</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-500">{event.dateStr}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/5 dark:bg-white/10 uppercase">
                      {event.type === 'signing' ? 'İmza Günü' : event.type === 'panel' ? 'Panel' : 'Söyleşi'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1">{event.title}</h3>
                  <div className={`flex items-center gap-1.5 text-xs ${themeClasses.muted}`}>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              {event.linkUrl && (
                <a
                  href={event.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span>Detayları Gör</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
