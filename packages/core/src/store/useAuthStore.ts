"use client";

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User as ReadixonUser } from '../types';

export interface AuthState {
  firebaseUser: FirebaseUser | null;
  userProfile: ReadixonUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  followingIds: string[];
  unreadNotificationCount: number;
  
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: ReadixonUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setFollowingIds: (ids: string[]) => void;
  toggleFollowingId: (id: string) => void;
  setUnreadNotificationCount: (count: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  isLoading: true,
  isInitialized: false,
  followingIds: [],
  unreadNotificationCount: 0,
  
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setFollowingIds: (ids) => set({ followingIds: ids }),
  toggleFollowingId: (id) => set((state) => {
    const isFollowing = state.followingIds.includes(id);
    if (isFollowing) {
      return { followingIds: state.followingIds.filter(fId => fId !== id) };
    } else {
      return { followingIds: [...state.followingIds, id] };
    }
  }),
  setUnreadNotificationCount: (count) => set({ unreadNotificationCount: count }),
  clearAuth: () => set({ firebaseUser: null, userProfile: null, isLoading: false, followingIds: [], unreadNotificationCount: 0 }),
}));
