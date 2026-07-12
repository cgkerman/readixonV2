"use client";

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from '../auth/authService';
import { getUserProfile, getUserFollowingIds, onUserProfileSnapshot } from '../services/userService';
import { onUnreadNotificationsCount } from '../services/notificationService';
import { initializeUserPoints, POINTS_NEW_USER } from '../services/pointsService';
import { useAuthStore } from '../store/useAuthStore';

export function useAuthListener() {
  const { setFirebaseUser, setUserProfile, setLoading, setInitialized, setFollowingIds, setUnreadNotificationCount } = useAuthStore();
  const unsubscribeNotifRef = useRef<() => void>();
  const unsubscribeProfileRef = useRef<() => void>();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      
      // Clear previous notification listener if exists
      if (unsubscribeNotifRef.current) {
        unsubscribeNotifRef.current();
        unsubscribeNotifRef.current = undefined;
      }
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = undefined;
      }
      
      if (user) {
        try {
          unsubscribeProfileRef.current = onUserProfileSnapshot(user.uid, async (profile) => {
            if (profile && profile.readixPoints === undefined) {
              await initializeUserPoints(user.uid);
              // Belge güncelleneceği için snapshot tekrar tetiklenecektir, o yüzden burada setUserProfile yapmıyoruz (veya yaparsak da olur)
              return;
            }
            setUserProfile(profile);
          });
          
          const followingIds = await getUserFollowingIds(user.uid);
          setFollowingIds(followingIds);
          
          // Start listening to unread notifications
          unsubscribeNotifRef.current = onUnreadNotificationsCount(user.uid, (count) => {
            setUnreadNotificationCount(count);
          });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setUserProfile(null);
          setFollowingIds([]);
        }
      } else {
        setUserProfile(null);
        setFollowingIds([]);
        setUnreadNotificationCount(0);
      }
      
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      unsubscribe();
      if (unsubscribeNotifRef.current) {
        unsubscribeNotifRef.current();
      }
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
      }
    };
  }, [setFirebaseUser, setUserProfile, setLoading, setInitialized, setFollowingIds, setUnreadNotificationCount]);
}
