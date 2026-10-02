'use client';

import React from 'react';
import { AlignLeft, AlignJustify, Sun, Moon, Minus, Plus, X } from 'lucide-react';

export type ThemeType = 'light' | 'dark' | 'sepia' | 'oled';
export type FontFamilyType = 'sans' | 'serif' | 'mono';
export type LineHeightType = 'tight' | 'normal' | 'relaxed';
export type TextAlignType = 'left' | 'justify';
export type PaddingXType = 'compact' | 'normal' | 'wide';

export interface ReadingSettingsPanelProps {
  theme: ThemeType;
  fontSize: number;
  fontFamily?: FontFamilyType;
  lineHeight?: LineHeightType;
  textAlign?: TextAlignType;
  paddingX?: PaddingXType;
  onThemeChange: (theme: ThemeType) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange?: (font: FontFamilyType) => void;
  onLineHeightChange?: (lineHeight: LineHeightType) => void;
  onTextAlignChange?: (textAlign: TextAlignType) => void;
  onPaddingXChange?: (paddingX: PaddingXType) => void;
  onClose?: () => void;
  className?: string;
}

export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({
  theme,
  fontSize,
  fontFamily = 'sans',
  lineHeight = 'normal',
  textAlign = 'left',
  paddingX = 'normal',
  onThemeChange,
  onFontSizeChange,
  onFontFamilyChange,
  onLineHeightChange,
  onTextAlignChange,
  onPaddingXChange,
  onClose,
  className = ''
}) => {
  const panelTheme = {
    light: {
      bg: '#ffffff',
      text: '#0f172a',
      card: '#f8fafc',
      subBg: 'rgba(0,0,0,0.05)',
      border: 'rgba(0,0,0,0.1)',
      muted: '#64748b'
    },
    sepia: {
      bg: '#ede3cb',
      text: '#433422',
      card: '#f4ecd8',
      subBg: 'rgba(91,70,54,0.1)',
      border: 'rgba(91,70,54,0.22)',
      muted: '#7d6653'
    },
    dark: {
      bg: '#18181b',
      text: '#f4f4f5',
      card: '#27272a',
      subBg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.1)',
      muted: '#a1a1aa'
    },
    oled: {
      bg: '#000000',
      text: '#ffffff',
      card: '#121214',
      subBg: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.15)',
      muted: '#71717a'
    }
  }[theme] || {
    bg: '#18181b',
    text: '#f4f4f5',
    card: '#27272a',
    subBg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
    muted: '#a1a1aa'
  };

  return (
    <div
      className={`p-5 rounded-3xl sm:rounded-2xl border shadow-2xl flex flex-col gap-5 select-none transition-colors duration-200 ${className}`}
      style={{
        backgroundColor: panelTheme.bg,
        color: panelTheme.text,
        borderColor: panelTheme.border
      }}
    >
      {/* Üst Tutamaç & Başlık (Mobilde Bottom Sheet hissi) */}
      <div>
        <div className="w-12 h-1.5 rounded-full bg-muted/40 mx-auto mb-3.5 sm:hidden" />
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2" style={{ color: panelTheme.text }}>
            Okuma Tercihleri
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted/15 hover:bg-muted/25 active:scale-90 flex items-center justify-center transition-all"
              style={{ color: panelTheme.muted }}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── 1. Tema Seçimi (Aydınlık, Sepya, Karanlık, OLED) ── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Okuma Teması
        </span>
        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'light' ? 'border-primary ring-2 ring-primary/20 scale-[1.02] shadow-sm' : 'border-border/60 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          >
            <Sun size={20} className="text-amber-500" />
            <span className="text-xs font-bold">Açık</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('sepia')}
            className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'sepia' ? 'border-primary ring-2 ring-primary/20 scale-[1.02] shadow-sm' : 'border-border/60 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#f4ecd8', color: '#5b4636' }}
          >
            <span className="text-base font-serif font-black leading-none">Aa</span>
            <span className="text-xs font-bold">Sepya</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'dark' ? 'border-primary ring-2 ring-primary/20 scale-[1.02] shadow-sm' : 'border-border/60 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#18181b', color: '#f4f4f5' }}
          >
            <Moon size={20} className="text-indigo-400" />
            <span className="text-xs font-bold">Koyu</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('oled')}
            className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'oled' ? 'border-primary ring-2 ring-primary/20 scale-[1.02] shadow-sm' : 'border-border/60 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
          >
            <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-xs font-bold">OLED</span>
          </button>
        </div>
      </div>

      {/* ── 2. Yazı Boyutu Ayarı ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Yazı Boyutu
          </span>
          <span className="text-sm font-mono font-extrabold text-primary">
            {fontSize}px
          </span>
        </div>
        <div
          className="flex items-center justify-between gap-3 p-2 rounded-2xl border transition-colors"
          style={{ backgroundColor: panelTheme.subBg, borderColor: panelTheme.border }}
        >
          <button
            type="button"
            onClick={() => onFontSizeChange(Math.max(13, fontSize - 1))}
            className="w-11 h-11 rounded-2xl border hover:opacity-80 active:scale-90 flex items-center justify-center transition-all shadow-sm"
            style={{ backgroundColor: panelTheme.card, borderColor: panelTheme.border, color: panelTheme.text }}
            aria-label="Küçült"
          >
            <Minus size={18} />
          </button>

          <div className="flex-1 px-3">
            <input
              type="range"
              min="13"
              max="28"
              step="1"
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-muted/40 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
            className="w-11 h-11 rounded-2xl border hover:opacity-80 active:scale-90 flex items-center justify-center transition-all shadow-sm"
            style={{ backgroundColor: panelTheme.card, borderColor: panelTheme.border, color: panelTheme.text }}
            aria-label="Büyüt"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* ── 3. Yazı Tipi Ailesi ── */}
      {onFontFamilyChange && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: panelTheme.muted }}>
            Yazı Tipi
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onFontFamilyChange('sans')}
              className={`py-2 px-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                fontFamily === 'sans' ? 'border-primary bg-primary/10 shadow-sm text-primary font-bold' : 'hover:opacity-100 opacity-80'
              }`}
              style={{
                borderColor: fontFamily === 'sans' ? undefined : panelTheme.border,
                backgroundColor: fontFamily === 'sans' ? undefined : panelTheme.subBg,
                color: fontFamily === 'sans' ? undefined : panelTheme.text
              }}
            >
              <span className="font-sans font-bold text-sm">Modern</span>
              <span className="text-[10px] font-normal opacity-70">Sans-serif</span>
            </button>

            <button
              type="button"
              onClick={() => onFontFamilyChange('serif')}
              className={`py-2 px-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                fontFamily === 'serif' ? 'border-primary bg-primary/10 shadow-sm text-primary font-bold' : 'hover:opacity-100 opacity-80'
              }`}
              style={{
                borderColor: fontFamily === 'serif' ? undefined : panelTheme.border,
                backgroundColor: fontFamily === 'serif' ? undefined : panelTheme.subBg,
                color: fontFamily === 'serif' ? undefined : panelTheme.text
              }}
            >
              <span className="font-serif font-bold text-sm">Kitap</span>
              <span className="text-[10px] font-normal opacity-70">Serif</span>
            </button>

            <button
              type="button"
              onClick={() => onFontFamilyChange('mono')}
              className={`py-2 px-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                fontFamily === 'mono' ? 'border-primary bg-primary/10 shadow-sm text-primary font-bold' : 'hover:opacity-100 opacity-80'
              }`}
              style={{
                borderColor: fontFamily === 'mono' ? undefined : panelTheme.border,
                backgroundColor: fontFamily === 'mono' ? undefined : panelTheme.subBg,
                color: fontFamily === 'mono' ? undefined : panelTheme.text
              }}
            >
              <span className="font-mono font-bold text-sm">Daktilo</span>
              <span className="text-[10px] font-normal opacity-70">Monospace</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 4. Satır Aralığı (Line Height) & Hizalama ── */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: panelTheme.border }}>
        {/* Satır Aralığı */}
        {onLineHeightChange && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: panelTheme.muted }}>
              Satır Aralığı
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border transition-colors" style={{ backgroundColor: panelTheme.subBg, borderColor: panelTheme.border }}>
              <button
                type="button"
                onClick={() => onLineHeightChange('tight')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lineHeight === 'tight' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: lineHeight === 'tight' ? undefined : panelTheme.text }}
                title="Sıkı (1.4)"
              >
                Sıkı
              </button>
              <button
                type="button"
                onClick={() => onLineHeightChange('normal')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lineHeight === 'normal' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: lineHeight === 'normal' ? undefined : panelTheme.text }}
                title="Normal (1.7)"
              >
                Norm
              </button>
              <button
                type="button"
                onClick={() => onLineHeightChange('relaxed')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lineHeight === 'relaxed' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: lineHeight === 'relaxed' ? undefined : panelTheme.text }}
                title="Geniş (2.0)"
              >
                Geniş
              </button>
            </div>
          </div>
        )}

        {/* Metin Hizalama */}
        {onTextAlignChange && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: panelTheme.muted }}>
              Hizalama
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl border transition-colors" style={{ backgroundColor: panelTheme.subBg, borderColor: panelTheme.border }}>
              <button
                type="button"
                onClick={() => onTextAlignChange('left')}
                className={`py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg transition-all ${
                  textAlign === 'left' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: textAlign === 'left' ? undefined : panelTheme.text }}
                title="Sola Yasla"
              >
                <AlignLeft size={14} />
                <span>Sol</span>
              </button>
              <button
                type="button"
                onClick={() => onTextAlignChange('justify')}
                className={`py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg transition-all ${
                  textAlign === 'justify' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: textAlign === 'justify' ? undefined : panelTheme.text }}
                title="İki Yana Yasla"
              >
                <AlignJustify size={14} />
                <span>Yasla</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Ekran Kenar Boşluğu (Padding) ── */}
      {onPaddingXChange && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider" style={{ color: panelTheme.muted }}>
            <span>Ekran Kenar Boşluğu</span>
            <span className="capitalize" style={{ color: panelTheme.text }}>{paddingX === 'compact' ? 'Kompakt (Dar)' : paddingX === 'wide' ? 'Geniş' : 'Dengeli'}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border transition-colors" style={{ backgroundColor: panelTheme.subBg, borderColor: panelTheme.border }}>
            <button
              type="button"
              onClick={() => onPaddingXChange('compact')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                paddingX === 'compact' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ color: paddingX === 'compact' ? undefined : panelTheme.text }}
            >
              Kompakt
            </button>
            <button
              type="button"
              onClick={() => onPaddingXChange('normal')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                paddingX === 'normal' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ color: paddingX === 'normal' ? undefined : panelTheme.text }}
            >
              Dengeli
            </button>
            <button
              type="button"
              onClick={() => onPaddingXChange('wide')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                paddingX === 'wide' ? 'bg-primary text-black shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ color: paddingX === 'wide' ? undefined : panelTheme.text }}
            >
              Geniş
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
