import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export interface ReaderState {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
  setFontSize: (size: number) => void;
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
      theme: 'light',
      fontSize: 16,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'readixon-reader-storage',
      storage: createJSONStorage(() => universalStorage),
    }
  )
);
