"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthListener, useThemeStore } from "@readixon/core";
import UsernameSetupModal from "../components/UsernameSetupModal";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAuthListener();
  const theme = useThemeStore((state) => state.theme);
  const customColors = useThemeStore((state) => state.customColors);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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
  }, [theme, customColors]);

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
      {children}
      <UsernameSetupModal />
      <Toaster 
        theme="system" 
        position="bottom-right" 
        toastOptions={{
          className: 'bg-card border-border text-text',
          descriptionClassName: 'text-muted',
        }} 
      />
    </QueryClientProvider>
  );
}
