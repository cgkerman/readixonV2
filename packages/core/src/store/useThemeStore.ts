import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4' | 'theme-5' | 'theme-6' | 'theme-7' | 'custom';

export interface CustomColors {
  background: string;
  card: string;
  text: string;
  primary: string;
  muted: string;
  border: string;
}

interface ThemeState {
  theme: Theme;
  customColors: CustomColors | null;
  setTheme: (theme: Theme) => void;
  setCustomColors: (colors: CustomColors) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'theme-2', // Ana tema olarak Theme 2 seçildi
      customColors: null,
      setTheme: (theme) => set({ theme }),
      setCustomColors: (colors) => set({ customColors: colors }),
    }),
    {
      name: 'readix-theme-storage',
    }
  )
);
