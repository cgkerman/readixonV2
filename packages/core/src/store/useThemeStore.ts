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

interface ThemeState {
  theme: Theme;
  customColors: CustomColors | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCustomColors: (colors: CustomColors) => void;
}

export const isDarkTheme = (theme: string): boolean => {
  return theme === 'dark' || theme === 'theme-1' || theme === 'theme-3' || theme === 'theme-5';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      customColors: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: isDarkTheme(state.theme) ? 'light' : 'dark',
        })),
      setCustomColors: (colors) => set({ customColors: colors }),
    }),
    {
      name: 'readix-theme-storage',
    }
  )
);
