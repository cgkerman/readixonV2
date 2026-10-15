'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check } from 'lucide-react';

const PULL_THRESHOLD = 68; // Yenilemenin tetikleneceği çekme mesafesi (px)
const MAX_PULL = 96; // Maksimum esneme mesafesi (px)

export function MobilePullToRefresh() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const hasTriggeredHapticRef = useRef<boolean>(false);

  // Okuma sayfasında veya modal açıkken devre dışı bırak
  const isReaderPage = pathname?.startsWith('/read/');

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setPullDistance(52); // Yenileme sırasında sabit duracağı yükseklik

    // Haptik titreşim
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {}
    }

    const startTime = Date.now();

    try {
      // 1. TanStack React Query önbelleğini tazele (aktif verileri yeniden çek)
      await queryClient.invalidateQueries();

      // 2. Next.js App Router sayfa sunucu bileşenlerini tazele
      router.refresh();

      // 3. Özel Readixon yenileme event'i fırlat (sayfalar özel state'lerini tazeleyebilir)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('readixon:refresh'));
      }
    } catch (err) {
      console.warn('Pull-to-refresh işlemi sırasında hata:', err);
    } finally {
      // Kullanıcıya tatmin edici bir görsel deneyim için en az 600ms bekle
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 650 - elapsedTime);

      setTimeout(() => {
        setIsCompleted(true);
        setTimeout(() => {
          setIsRefreshing(false);
          setIsCompleted(false);
          setPullDistance(0);
          isRefreshingRef.current = false;
        }, 350);
      }, remainingTime);
    }
  }, [queryClient, router]);

  useEffect(() => {
    if (isReaderPage) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Zaten yenileniyorsa, modal açıksa (body overflow hidden) veya sayfa en tepede değilse dinleme
      if (
        isRefreshingRef.current ||
        window.scrollY > 5 ||
        document.body.style.overflow === 'hidden'
      ) {
        return;
      }

      // Input, textarea veya içerik düzenleme alanında dokunulmuşsa es geç
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      isPullingRef.current = false;
      hasTriggeredHapticRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (
        isRefreshingRef.current ||
        window.scrollY > 5 ||
        document.body.style.overflow === 'hidden'
      ) {
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setIsPulling(false);
          setPullDistance(0);
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = currentX - startXRef.current;

      // Yalnızca aşağı doğru ve belirgin dikey kaydırmalarda tetikle (yatay kaydırmayı engelleme)
      if (!isPullingRef.current) {
        if (diffY > 8 && diffY > Math.abs(diffX) * 1.5 && window.scrollY <= 0) {
          isPullingRef.current = true;
          setIsPulling(true);
        } else {
          return;
        }
      }

      if (isPullingRef.current && diffY > 0) {
        // Esneme direnci formülü (diminishing return)
        const resistanceDistance = Math.min(
          MAX_PULL,
          diffY * 0.42
        );
        setPullDistance(resistanceDistance);

        // Eşik aşıldığında bir defalık hafif haptik dokunuş
        if (resistanceDistance >= PULL_THRESHOLD && !hasTriggeredHapticRef.current) {
          hasTriggeredHapticRef.current = true;
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(12);
            } catch (e) {}
          }
        } else if (resistanceDistance < PULL_THRESHOLD) {
          hasTriggeredHapticRef.current = false;
        }

        // Sayfanın garip zıplamasını önle
        if (e.cancelable && diffY > 15) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      setIsPulling(false);

      if (pullDistance >= PULL_THRESHOLD && !isRefreshingRef.current) {
        handleRefresh();
      } else {
        // Eşik aşılmadıysa tatlıca geri yaylan
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isReaderPage, pullDistance, handleRefresh]);

  if (isReaderPage) return null;

  // Görünürlük ve dönüş açıları
  const isReady = pullDistance >= PULL_THRESHOLD;
  const rotationDegrees = Math.min(360, (pullDistance / PULL_THRESHOLD) * 360);
  const opacity = Math.min(1, Math.max(0, (pullDistance - 10) / 35));

  // Eğer çekilmiyorsa ve yenilenmiyorsa render etme
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        transform: `translate3d(-50%, ${pullDistance}px, 0)`,
        opacity: isRefreshing ? 1 : opacity,
        transition: isPulling ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease'
      }}
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[80] pointer-events-none select-none"
    >
      <div
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          isCompleted
            ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20 scale-105'
            : isRefreshing
            ? 'bg-card/95 text-primary border-primary/40 shadow-primary/20 scale-100'
            : isReady
            ? 'bg-primary text-black border-primary shadow-primary/30 scale-105'
            : 'bg-card/90 text-text border-border/70 shadow-black/20'
        }`}
      >
        <div className="relative flex items-center justify-center w-5 h-5">
          {isCompleted ? (
            <Check size={16} className="text-white animate-in zoom-in-75 duration-150" />
          ) : (
            <RefreshCw
              size={15}
              style={{
                transform: isRefreshing ? undefined : `rotate(${rotationDegrees}deg)`
              }}
              className={`transition-transform duration-75 ${
                isRefreshing ? 'animate-spin text-primary' : ''
              }`}
            />
          )}
        </div>

        <span className="text-[11px] font-bold tracking-tight">
          {isCompleted
            ? 'Yenilendi'
            : isRefreshing
            ? 'Yenileniyor...'
            : isReady
            ? 'Bırak ve Yenile'
            : 'Aşağı Çekin'}
        </span>
      </div>
    </div>
  );
}
