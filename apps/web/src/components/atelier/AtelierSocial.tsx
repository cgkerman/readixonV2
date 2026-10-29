'use client';

import React from 'react';
import { Mail, Music, ExternalLink, Globe } from 'lucide-react';
import type { AuthorSite } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierSocial({ site }: Props) {
  const { themeClasses, primaryColor, fontHeadingFamily } = useAtelierTheme();
  const social = site.socialConfig;

  if (!site.enabledBlocks?.social) return null;

  return (
    <section id="social" className={`py-12 border-t ${themeClasses.border}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Spotify Çalma Listesi (Varsa) */}
        {social?.spotifyPlaylistUrl && (
          <div className={`mb-10 p-6 rounded-3xl border ${themeClasses.border} bg-black/5 dark:bg-white/5 max-w-xl mx-auto`}>
            <div className="flex items-center justify-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-500">
              <Music className="w-4 h-4" />
              <span>Yazarın Çalışma Müzikleri</span>
            </div>
            <p className={`text-xs sm:text-sm mb-4 ${themeClasses.muted}`}>
              Kitaplarımı yazarken ve kurgularken dinlediğim resmi Spotify atmosfer listesi.
            </p>
            <a
              href={social.spotifyPlaylistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#1DB954] text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              <Music className="w-4 h-4" />
              <span>Spotify'da Dinle</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Sosyal Medya İkonları */}
        <div>
          <h3 
            className="text-base sm:text-lg font-bold mb-5"
            style={{ fontFamily: fontHeadingFamily }}
          >
            Sosyal Ağlarda Takip Edin
          </h3>
          <div className="flex items-center justify-center gap-3">
            {social?.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className={`p-3 rounded-full border transition-transform duration-200 hover:scale-110 active:scale-95 ${themeClasses.card} ${themeClasses.border}`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}

            {social?.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                title="X / Twitter"
                className={`p-3 rounded-full border transition-transform duration-200 hover:scale-110 active:scale-95 ${themeClasses.card} ${themeClasses.border}`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}

            {social?.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className={`p-3 rounded-full border transition-transform duration-200 hover:scale-110 active:scale-95 ${themeClasses.card} ${themeClasses.border}`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}

            {social?.contactEmail && (
              <a
                href={`mailto:${social.contactEmail}`}
                title="E-posta Gönder"
                className={`p-3 rounded-full border transition-transform duration-200 hover:scale-110 active:scale-95 ${themeClasses.card} ${themeClasses.border}`}
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
