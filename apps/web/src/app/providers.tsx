"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthListener, useThemeStore, isDarkTheme } from "@readixon/core";
import { usePathname } from "next/navigation";
import UsernameSetupModal from "../components/UsernameSetupModal";
import { MobileAppBackHandler } from "../components/navigation/MobileAppBackHandler";
import { MobileInAppNotificationManager } from "../components/notifications/MobileInAppNotificationManager";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAuthListener();
  const pathname = usePathname();
  const isReaderPage = pathname?.startsWith('/read/');
  const isLightOnlyPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname?.startsWith('/login/') ||
    pathname === '/register' ||
    pathname?.startsWith('/register/') ||
    pathname === '/forgot-password' ||
    pathname?.startsWith('/forgot-password/') ||
    pathname === '/verify-email' ||
    pathname?.startsWith('/verify-email/');

  const theme = useThemeStore((state) => state.theme);
  const customColors = useThemeStore((state) => state.customColors);

  // Apply theme to html element (isolated on reader pages, strictly light on splash/onboarding/auth)
  useEffect(() => {
    if (isReaderPage) return;

    if (isLightOnlyPage) {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--color-background');
      document.documentElement.style.removeProperty('--color-card');
      document.documentElement.style.removeProperty('--color-text');
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-muted');
      document.documentElement.style.removeProperty('--color-border');
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    const isDark = isDarkTheme(theme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (theme === 'custom' && customColors) {
      document.documentElement.style.setProperty('--color-background', customColors.background);
      document.documentElement.style.setProperty('--color-card', customColors.card);
      document.documentElement.style.setProperty('--color-text', customColors.text);
      document.documentElement.style.setProperty('--color-primary', customColors.primary);
      document.documentElement.style.setProperty('--color-muted', customColors.muted);
      document.documentElement.style.setProperty('--color-border', customColors.border);
    } else {
      document.documentElement.style.removeProperty('--color-background');
      document.documentElement.style.removeProperty('--color-card');
      document.documentElement.style.removeProperty('--color-text');
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-muted');
      document.documentElement.style.removeProperty('--color-border');
    }
  }, [theme, customColors, isReaderPage, isLightOnlyPage]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 minutes stale time default
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MobileAppBackHandler />
      <MobileInAppNotificationManager />
      {children}
      <UsernameSetupModal />
      <Toaster 
        theme={isDarkTheme(theme) ? "dark" : "light"} 
        position="bottom-right" 
        toastOptions={{
          className: 'bg-card border-border text-text',
          descriptionClassName: 'text-muted',
        }} 
      />
    </QueryClientProvider>
  );
}
