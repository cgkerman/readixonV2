'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AtelierTemplate, AtelierThemeMode, AuthorSite } from '@readixon/core';

interface AtelierThemeContextType {
  template: AtelierTemplate;
  mode: AtelierThemeMode;
  setMode: (mode: AtelierThemeMode) => void;
  toggleMode: () => void;
  primaryColor: string;
  fontHeadingFamily: string;
  fontBodyFamily: string;
  cardRadiusClass: string;
  isDark: boolean;
  themeClasses: {
    bg: string;
    text: string;
    card: string;
    cardHover: string;
    border: string;
    muted: string;
    accent: string;
    badge: string;
    ornament: string;
  };
}

const AtelierThemeContext = createContext<AtelierThemeContextType | null>(null);

export function useAtelierTheme() {
  const ctx = useContext(AtelierThemeContext);
  if (!ctx) {
    throw new Error('useAtelierTheme must be used within AtelierThemeProvider');
  }
  return ctx;
}

interface ProviderProps {
  site: AuthorSite;
  overrideMode?: AtelierThemeMode;
  children: React.ReactNode;
}

export function AtelierThemeProvider({ site, overrideMode, children }: ProviderProps) {
  const initialMode = overrideMode || site.themeConfig?.mode || 'dark';
  const [mode, setModeState] = useState<AtelierThemeMode>(initialMode);

  // overrideMode (stüdyo önizlemesinden) değiştiğinde senkronize et
  useEffect(() => {
    if (overrideMode) {
      setModeState(overrideMode);
    }
  }, [overrideMode]);

  const setMode = (newMode: AtelierThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(`atelier_theme_${site.id}`, newMode);
    } catch {}
  };

  const toggleMode = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('sepia');
    else if (mode === 'sepia') setMode('light');
    else setMode('dark');
  };

  const template = site.themeConfig?.template || 'novelist';
  const primaryColor = site.themeConfig?.primaryColor || (template === 'worldbuilder' ? '#8B5CF6' : template === 'webtoon' ? '#EC4899' : '#6366F1');

  // Yazı tipleri (Google Fonts eşleştirmeleri)
  const fontHeadingFamily = (() => {
    const custom = site.themeConfig?.fontHeading;
    if (custom === 'Cinzel') return "'Cinzel', 'Times New Roman', serif";
    if (custom === 'Playfair Display') return "'Playfair Display', Georgia, serif";
    if (custom === 'Outfit') return "'Outfit', sans-serif";
    if (custom === 'Lora') return "'Lora', Georgia, serif";
    if (custom === 'Merriweather') return "'Merriweather', serif";
    if (custom === 'Plus Jakarta Sans') return "'Plus Jakarta Sans', sans-serif";

    if (template === 'novelist') return "'Playfair Display', Georgia, serif";
    if (template === 'worldbuilder') return "'Cinzel', 'Times New Roman', serif";
    if (template === 'webtoon') return "'Outfit', sans-serif";
    return "'Plus Jakarta Sans', sans-serif";
  })();

  const fontBodyFamily = (() => {
    if (template === 'novelist') return "'Lora', 'Merriweather', Georgia, serif";
    return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  })();

  // Köşe yuvarlaklığı (Card Radius)
  const cardRadiusClass = (() => {
    const r = site.themeConfig?.cardRadius;
    if (r === 'none') return 'rounded-none';
    if (r === 'sm') return 'rounded-lg';
    if (r === 'lg') return 'rounded-3xl';
    if (r === 'full') return 'rounded-[32px]';
    // Default md
    if (template === 'webtoon') return 'rounded-3xl';
    if (template === 'worldbuilder') return 'rounded-xl';
    if (template === 'minimalist') return 'rounded-lg';
    return 'rounded-2xl';
  })();

  const isDark = mode === 'dark' || mode === 'oled';

  // Şablon ve Görünüm Moduna Göre Lüks Stil Sınıfları
  const getThemeClasses = () => {
    // ☀️ 1. AÇIK MOD (LIGHT MODE)
    if (mode === 'light') {
      if (template === 'novelist') {
        return {
          bg: 'bg-[#FBF8F3]', // Sıcak antika keten kağıdı
          text: 'text-[#1C1917]',
          card: 'bg-[#FFFFFF] shadow-sm',
          cardHover: 'hover:border-[#C4B59F] hover:shadow-md',
          border: 'border-[#E6DFD5]',
          muted: 'text-[#6D6257]',
          accent: primaryColor,
          badge: 'bg-[#F0EAE1] text-[#29221B] border border-[#DDD3C4]',
          ornament: 'text-[#9C8A74]',
        };
      }

      if (template === 'worldbuilder') {
        return {
          bg: 'bg-[#F4F6F9]', // Soğuk mithril / mermer zemin
          text: 'text-[#0B132B]',
          card: 'bg-[#FFFFFF] shadow-sm',
          cardHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10 hover:shadow-md',
          border: 'border-[#D9E2EC]',
          muted: 'text-[#486581]',
          accent: primaryColor,
          badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
          ornament: 'text-indigo-400',
        };
      }

      if (template === 'webtoon') {
        return {
          bg: 'bg-[#FAFCFF]', // Canlı enerjik beyaz zemin
          text: 'text-[#0F172A]',
          card: 'bg-[#FFFFFF] shadow-md shadow-pink-500/5',
          cardHover: 'hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/10',
          border: 'border-[#E2E8F0]',
          muted: 'text-[#64748B]',
          accent: primaryColor,
          badge: 'bg-pink-50 text-pink-600 border border-pink-200',
          ornament: 'text-pink-500',
        };
      }

      // Minimalist Light
      return {
        bg: 'bg-[#FFFFFF]',
        text: 'text-[#09090B]',
        card: 'bg-[#FAFAFA]',
        cardHover: 'hover:border-neutral-900 hover:shadow-sm',
        border: 'border-[#E4E4E7]',
        muted: 'text-[#71717A]',
        accent: primaryColor,
        badge: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
        ornament: 'text-neutral-400',
      };
    }

    // ☕ 2. SEPYA MOD (SEPIA / PARCHMENT)
    if (mode === 'sepia') {
      return {
        bg: 'bg-[#F4ECD8]',
        text: 'text-[#2D2118]',
        card: 'bg-[#EADEBE] shadow-sm',
        cardHover: 'hover:border-[#A89476] hover:shadow-md',
        border: 'border-[#DBC9A8]',
        muted: 'text-[#695340]',
        accent: primaryColor,
        badge: 'bg-[#E3D0AF] text-[#2E1E12] border border-[#C5AF88]',
        ornament: 'text-[#8A6D4B]',
      };
    }

    // 🖤 3. OLED SAF SİYAH MOD
    if (mode === 'oled') {
      return {
        bg: 'bg-[#000000]',
        text: 'text-[#FFFFFF]',
        card: 'bg-[#080808]',
        cardHover: 'hover:border-neutral-700 hover:shadow-glow',
        border: 'border-[#1C1C1C]',
        muted: 'text-[#A1A1AA]',
        accent: primaryColor,
        badge: 'bg-[#141414] text-white border border-[#262626]',
        ornament: 'text-neutral-500',
      };
    }

    // 🌙 4. GECE MODU (DARK MODE - DEFAULT)
    if (template === 'novelist') {
      return {
        bg: 'bg-[#141210]', // Derin espresso kütüphane gecesi
        text: 'text-[#F6F2EB]',
        card: 'bg-[#1C1916]',
        cardHover: 'hover:border-amber-600/50 hover:shadow-xl',
        border: 'border-[#2C2722]',
        muted: 'text-[#A89F91]',
        accent: primaryColor,
        badge: 'bg-[#26211C] text-amber-200 border border-[#3E352C]',
        ornament: 'text-amber-500/70',
      };
    }

    if (template === 'worldbuilder') {
      return {
        bg: 'bg-[#07080F]', // Obsidyen mistik uzay gecesi
        text: 'text-[#F1F3FB]',
        card: 'bg-[#0E101D]',
        cardHover: 'hover:border-indigo-500/60 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]',
        border: 'border-[#1B1E33]',
        muted: 'text-[#8C92B3]',
        accent: primaryColor,
        badge: 'bg-[#16182E] text-indigo-300 border border-indigo-500/30',
        ornament: 'text-indigo-400',
      };
    }

    if (template === 'webtoon') {
      return {
        bg: 'bg-[#0B0C15]', // Modern neon gece
        text: 'text-[#FFFFFF]',
        card: 'bg-[#131524]',
        cardHover: 'hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]',
        border: 'border-[#20233B]',
        muted: 'text-[#949AB8]',
        accent: primaryColor,
        badge: 'bg-pink-500/10 text-pink-300 border border-pink-500/30',
        ornament: 'text-pink-400',
      };
    }

    // Minimalist Dark
    return {
      bg: 'bg-[#09090B]',
      text: 'text-[#FAFAFA]',
      card: 'bg-[#121215]',
      cardHover: 'hover:border-neutral-500 hover:shadow-xl',
      border: 'border-[#222226]',
      muted: 'text-[#A1A1AA]',
      accent: primaryColor,
      badge: 'bg-[#18181B] text-neutral-200 border border-[#2E2E33]',
      ornament: 'text-neutral-500',
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <AtelierThemeContext.Provider
      value={{
        template,
        mode,
        setMode,
        toggleMode,
        primaryColor,
        fontHeadingFamily,
        fontBodyFamily,
        cardRadiusClass,
        isDark,
        themeClasses,
      }}
    >
      <div 
        className={`w-full min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}
        style={{
          fontFamily: fontBodyFamily,
        }}
      >
        {children}
      </div>
    </AtelierThemeContext.Provider>
  );
}
