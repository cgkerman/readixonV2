import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type ReaderTheme = 'light' | 'dark' | 'sepia' | 'oled';
export type ReaderFontFamily = 'sans' | 'serif' | 'mono';
export type ReaderLineHeight = 'tight' | 'normal' | 'relaxed';
export type ReaderTextAlign = 'left' | 'justify';
export type ReaderPaddingX = 'compact' | 'normal' | 'wide';

export interface ReaderState {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: ReaderFontFamily;
  lineHeight: ReaderLineHeight;
  textAlign: ReaderTextAlign;
  paddingX: ReaderPaddingX;
  setTheme: (theme: ReaderTheme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (fontFamily: ReaderFontFamily) => void;
  setLineHeight: (lineHeight: ReaderLineHeight) => void;
  setTextAlign: (textAlign: ReaderTextAlign) => void;
  setPaddingX: (paddingX: ReaderPaddingX) => void;
}

// Cross-platform storage engine
let customStorage: StateStorage | undefined = undefined;

export const setReaderStorageEngine = (storage: StateStorage) => {
  customStorage = storage;
};

const universalStorage: StateStorage = {
  getItem: async (name) => {
    if (customStorage) return await customStorage.getItem(name);
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return null;
  },
  setItem: async (name, value) => {
    if (customStorage) {
      await customStorage.setItem(name, value);
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: async (name) => {
    if (customStorage) {
      await customStorage.removeItem(name);
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(name);
    }
  }
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      theme: 'dark',
      fontSize: 17,
      fontFamily: 'sans',
      lineHeight: 'normal',
      textAlign: 'left',
      paddingX: 'normal',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setTextAlign: (textAlign) => set({ textAlign }),
      setPaddingX: (paddingX) => set({ paddingX }),
    }),
    {
      name: 'readixon-reader-storage',
      storage: createJSONStorage(() => universalStorage),
    }
  )
);
