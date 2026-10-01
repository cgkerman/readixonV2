'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function useIsNativeApp() {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    try {
      // 1. Check if running inside native Capacitor shell
      const isNative = Capacitor.isNativePlatform();
      
      // 2. Allow previewing in browser with ?app=true or localhost check
      const isParam = typeof window !== 'undefined' && (
        window.location.search.includes('app=true') ||
        window.localStorage.getItem('readixon_preview_app') === 'true'
      );

      setIsApp(isNative || isParam);
    } catch {
      setIsApp(false);
    }
  }, []);

  return isApp;
}
