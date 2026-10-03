import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4' | 'theme-5' | 'theme-6' | 'theme-7' | 'custom';

export interface CustomColors {
  background: string;
  card: string;
  text: string;
  primary: string;
  muted: string;
  border: string;
}

export const defaultCustomColors: CustomColors = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1E293B',
  primary: '#6366F1',
  muted: '#64748B',
  border: '#E2E8F0',
};

interface ThemeState {
  theme: Theme;
  customColors: CustomColors | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCustomColors: (colors: CustomColors) => void;
}

export const isColorDark = (hexColor: string): boolean => {
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return false;
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return false;
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 128;
};

export const isDarkTheme = (theme: string, customColors?: CustomColors | null): boolean => {
  if (theme === 'custom' && customColors?.background) {
    return isColorDark(customColors.background);
  }
  return theme === 'dark' || theme === 'theme-1' || theme === 'theme-3' || theme === 'theme-5';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      customColors: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: isDarkTheme(state.theme, state.customColors) ? 'light' : 'dark',
        })),
      setCustomColors: (colors) => set({ customColors: colors }),
    }),
    {
      name: 'readix-theme-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration: If previous storage was unversioned and had dark mode without customColors, reset to light
        if (version === 0 || !version) {
          if (persistedState && persistedState.theme === 'dark' && !persistedState.customColors) {
            return {
              ...persistedState,
              theme: 'light',
            };
          }
        }
        return persistedState as ThemeState;
      },
    }
  )
);

