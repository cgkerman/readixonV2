"use client";

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../services/userService';

export function useUserProfile(uid: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', uid],
    queryFn: () => {
      if (!uid) throw new Error("No UID provided");
      return getUserProfile(uid);
    },
    enabled: !!uid,
  });
}
