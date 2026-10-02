'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { executeBackHandlers } from '@/hooks/useBackButton';

const ROOT_ROUTES = [
  '/',
  '/feed',
  '/explore',
  '/webtoons',
  '/readix',
  '/library',
  '/profile'
];

export function MobileAppBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');

        const listener = await App.addListener('backButton', ({ canGoBack }) => {
          // 1. ÖNCELİK: Açık olan herhangi bir modal, çekmece veya bottom sheet var mı?
          const handled = executeBackHandlers();
          if (handled) {
            return;
          }

          const currentPath = pathnameRef.current || '/';
          const isRoot = ROOT_ROUTES.includes(currentPath);

          // 2. ÖNCELİK: Ana sekmelerden birindeyse (Feed, Keşfet, Kitaplık, Profil vs.)
          // Tek basışta doğrudan uygulamadan çıkmaz, 2 saniye içinde tekrar basılırsa çıkar.
          if (isRoot) {
            const now = Date.now();
            if (now - lastBackPressRef.current < 2000) {
              App.exitApp();
            } else {
              lastBackPressRef.current = now;
              toast.info('Çıkmak için tekrar basın', {
                duration: 2000,
                id: 'exit-app-toast'
              });
            }
            return;
          }

          // 3. ÖNCELİK: Alt sayfalardaysa (Bölüm okuma, kitap detayı, ayarlar vb.)
          // Bir önceki sayfaya geri dön
          if (canGoBack || (typeof window !== 'undefined' && window.history.length > 1)) {
            router.back();
          } else {
            // Geçmiş yoksa ana akışa dön
            router.replace('/feed');
          }
        });

        removeListener = () => {
          listener.remove();
        };
      } catch (err) {
        console.warn('Capacitor App backButton listener setup skipped:', err);
      }
    };

    setupListener();

    return () => {
      if (removeListener) removeListener();
    };
  }, [router]);

  return null;
}
