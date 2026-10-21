'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check } from 'lucide-react';

const PULL_THRESHOLD = 75; // Yenilemenin tetikleneceği çekme mesafesi (px) - doğal ve dengeli
const MAX_PULL = 112; // Maksimum esneme mesafesi (px)

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
  const pullDistanceRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const canPullRef = useRef<boolean>(false); // SADECE en tepeden başlayan jestlere izin veren kritik kilit
  const hasTriggeredHapticRef = useRef<boolean>(false);

  // Okuma sayfasında veya stüdyo editöründe kullanıcı yazarken devre dışı bırak
  const isReaderPage = pathname?.startsWith('/read/');
  const isEditorPage = pathname?.startsWith('/editor') || pathname?.includes('/chapters/');
  const isDisabledPage = isReaderPage || isEditorPage;

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    pullDistanceRef.current = 52;
    setPullDistance(52); // Yenileme sırasında sabit duracağı yükseklik

    // Haptik titreşim
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }

    const startTime = Date.now();

    try {
      // 1. TanStack React Query önbelleğini zorla tazele (tüm aktif verileri ve listeleri yenile)
      await Promise.allSettled([
        queryClient.invalidateQueries({ refetchType: 'all' }),
        queryClient.refetchQueries({ type: 'active' }),
        queryClient.resetQueries(),
      ]);

      // 2. Next.js App Router sayfa sunucu bileşenlerini tazele
      router.refresh();

      // 3. Özel Readixon yenileme event'i fırlat (React Query kullanmayan sayfalar anında yenilensin)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('readixon:refresh'));
      }
    } catch (err) {
      console.warn('Pull-to-refresh işlemi sırasında hata:', err);
    } finally {
      // Kullanıcıya tatmin edici bir görsel deneyim için en az 600ms bekle
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 600 - elapsedTime);

      setTimeout(() => {
        setIsCompleted(true);
        setTimeout(() => {
          setIsRefreshing(false);
          setIsCompleted(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
          isRefreshingRef.current = false;
        }, 300);
      }, remainingTime);
    }
  }, [queryClient, router]);

  useEffect(() => {
    if (isDisabledPage) return;

    const getScrollY = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // İç kaydırılabilir bir kapta (çekmece, modal, mini liste) mıyız denetimi
    const isInsideScrollable = (target: HTMLElement | null): boolean => {
      let el = target;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight + 4) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') {
            if (el.scrollTop > 1) return true;
          }
        }
        el = el.parentElement;
      }
      return false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Başlangıçta kilidi kesinlikle kapalı tut
      canPullRef.current = false;
      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      hasTriggeredHapticRef.current = false;

      // Zaten yenileniyorsa veya modal açıksa (body overflow hidden) dinleme
      if (
        isRefreshingRef.current ||
        document.body.style.overflow === 'hidden'
      ) {
        return;
      }

      // Sayfa en tepede DEĞİLSE (kullanıcı aşağı kaydırmışsa):
      // Bu dokunuş normal bir yukarı kaydırma hareketidir; ASLA pull-to-refresh'e dönüşemez!
      const currentScrollY = getScrollY();
      if (currentScrollY > 1) {
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

      // İç kaydırılabilir bir konteynerdeyse (örn: açık modal veya çekmece içi liste)
      if (isInsideScrollable(target)) {
        return;
      }

      // Tüm koşullar sağlandı: Kullanıcı tam olarak sayfanın en tepesinde ve geçerli bir alana dokundu
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      canPullRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Eğer dokunuş en tepeden başlamadıysa (örneğin aşağıdan yukarı kaydırılıyorsa),
      // BROWSER'IN NATIVE SCROLL'UNA ASLA MÜDAHALE ETME!
      if (!canPullRef.current || isRefreshingRef.current) {
        return;
      }

      const currentScrollY = getScrollY();
      // Eğer hareket sırasında sayfa bir şekilde aşağı kaymışsa iptal et
      if (currentScrollY > 1) {
        canPullRef.current = false;
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setIsPulling(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = currentX - startXRef.current;

      // Kullanıcı yukarı itiyorsa (diffY <= 0)
      if (diffY <= 0) {
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setIsPulling(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        return;
      }

      // Yalnızca aşağı doğru ve belirgin dikey kaydırmalarda tetikle (yatay kaydırma ve titreşimleri ele)
      if (!isPullingRef.current) {
        // En az 16px dikey çekilmeli ve dikey hareket yatayın en az 1.8 katı olmalı
        if (diffY > 16 && diffY > Math.abs(diffX) * 1.8) {
          isPullingRef.current = true;
          setIsPulling(true);
        } else {
          return;
        }
      }

      if (isPullingRef.current && diffY > 0) {
        // Doğal yaylanma direnci (rubber-band)
        const friction = 0.42;
        const rawDistance = diffY * friction;
        const resistanceDistance = Math.min(
          MAX_PULL,
          rawDistance <= PULL_THRESHOLD
            ? rawDistance
            : PULL_THRESHOLD + (rawDistance - PULL_THRESHOLD) * 0.4
        );

        pullDistanceRef.current = resistanceDistance;
        setPullDistance(resistanceDistance);

        // Eşik aşıldığında bir defalık hafif haptik dokunuş
        if (resistanceDistance >= PULL_THRESHOLD && !hasTriggeredHapticRef.current) {
          hasTriggeredHapticRef.current = true;
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(15);
            } catch (err) {}
          }
        } else if (resistanceDistance < PULL_THRESHOLD) {
          hasTriggeredHapticRef.current = false;
        }

        // Sadece çekme eylemi kesinleştiğinde ve belirgin mesafe aşıldığında varsayılanı engelle
        if (e.cancelable && diffY > 20) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      canPullRef.current = false;

      if (!isPullingRef.current) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      isPullingRef.current = false;
      setIsPulling(false);

      // Doğrudan ref üzerinden kontrol edilerek React re-render gecikmesi ve race condition önlenir
      if (pullDistanceRef.current >= PULL_THRESHOLD && !isRefreshingRef.current) {
        handleRefresh();
      } else {
        // Eşik aşılmadıysa tatlıca geri yaylan
        pullDistanceRef.current = 0;
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
  }, [isDisabledPage, handleRefresh]);

  if (isDisabledPage) return null;

  // Görünürlük ve dönüş açıları
  const isReady = pullDistance >= PULL_THRESHOLD;
  const rotationDegrees = Math.min(360, (pullDistance / PULL_THRESHOLD) * 360);
  const opacity = Math.min(1, Math.max(0, (pullDistance - 15) / 35));

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
            ? 'bg-primary text-white border-primary shadow-primary/30 scale-105'
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

