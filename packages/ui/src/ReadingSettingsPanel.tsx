import React from 'react';
import { Typography } from './Typography';
import { Button } from './Button';

export type ThemeType = 'light' | 'dark' | 'sepia';

export interface ReadingSettingsPanelProps {
  theme: ThemeType;
  fontSize: number;
  onThemeChange: (theme: ThemeType) => void;
  onFontSizeChange: (size: number) => void;
  className?: string;
}

export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-card border border-border/40 rounded-2xl flex flex-col gap-6 ${className}`}>
      {/* Font Boyutu Ayarı */}
      <div className="flex flex-col gap-3">
        <Typography variant="body" className="font-semibold">
          Yazı Boyutu
        </Typography>
        <div className="flex flex-row items-center justify-between bg-muted/20 p-2 rounded-xl">
          <Button 
            variant="ghost" 
            onPress={() => onFontSizeChange(Math.max(12, fontSize - 2))}
          >
            A-
          </Button>
          <Typography variant="body" className="font-bold">
            {fontSize}
          </Typography>
          <Button 
            variant="ghost" 
            onPress={() => onFontSizeChange(Math.min(32, fontSize + 2))}
          >
            A+
          </Button>
        </div>
      </div>

      {/* Tema Ayarı */}
      <div className="flex flex-col gap-3">
        <Typography variant="body" className="font-semibold">
          Okuma Teması
        </Typography>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
              theme === 'light' ? 'border-primary' : 'border-transparent bg-muted/20'
            }`}
            style={{ backgroundColor: '#ffffff' }}
          >
            <Typography variant="caption" style={{ color: '#000000' }} className="font-semibold text-center">
              Aydınlık
            </Typography>
          </button>
          
          <button
            onClick={() => onThemeChange('sepia')}
            className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
              theme === 'sepia' ? 'border-primary' : 'border-transparent'
            }`}
            style={{ backgroundColor: '#f4ecd8' }}
          >
            <Typography variant="caption" style={{ color: '#5b4636' }} className="font-semibold text-center">
              Sepya
            </Typography>
          </button>
          
          <button
            onClick={() => onThemeChange('dark')}
            className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
              theme === 'dark' ? 'border-primary' : 'border-transparent'
            }`}
            style={{ backgroundColor: '#121212' }}
          >
            <Typography variant="caption" style={{ color: '#ffffff' }} className="font-semibold text-center">
              Karanlık
            </Typography>
          </button>
        </div>
      </div>
    </div>
  );
};
