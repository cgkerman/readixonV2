'use client';

import { useEffect, useRef, useCallback } from 'react';
import { recordChapterReadingSession } from '@readixon/core';

interface UseReadingAnalyticsProps {
  storyId?: string;
  chapterId?: string;
  isCompleted?: boolean;
}

/**
 * İstemci tarafında aktif okuma süresini ve tamamlama durumunu takip eden akıllı kanca.
 * - Kullanıcı sekmeyi değiştirdiğinde (`visibilitychange`) sayaç otomatik durur.
 * - 45 saniyeden uzun hareketsizlikte (idle) süre durdurulur (açık unutulan sekmeleri engeller).
 * - Belirli aralıklarla (30 sn) veya bölümden çıkarken/bölüm bittiğinde Firestore'a hafif veri gönderir.
 */
export function useReadingAnalytics({
  storyId,
  chapterId,
  isCompleted = false
}: UseReadingAnalyticsProps) {
  const activeSecondsAccumulatedRef = useRef<number>(0);
  const isFirstFlushRef = useRef<boolean>(true);
  const hasMarkedCompletedRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);
  const lastActivityTimeRef = useRef<number>(Date.now());

  // Güncel değerleri referanslarda tut
  const storyIdRef = useRef(storyId);
  storyIdRef.current = storyId;

  const chapterIdRef = useRef(chapterId);
  chapterIdRef.current = chapterId;

  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;

  // Veriyi Firestore'a gönderme fonksiyonu (Flush)
  const flush = useCallback((forceCompleted = false) => {
    const sId = storyIdRef.current;
    const cId = chapterIdRef.current;
    if (!sId || !cId) return;

    const delta = activeSecondsAccumulatedRef.current;
    const shouldMarkComplete = (forceCompleted || isCompletedRef.current) && !hasMarkedCompletedRef.current;

    // Gönderilecek bir süre yoksa ve tamamlama durumu değişmediyse istek atma
    if (delta <= 0 && !shouldMarkComplete && !isFirstFlushRef.current) {
      return;
    }

    if (shouldMarkComplete) {
      hasMarkedCompletedRef.current = true;
    }

    // Biriken süreyi sıfırla
    activeSecondsAccumulatedRef.current = 0;
    const isFirst = isFirstFlushRef.current;
    isFirstFlushRef.current = false;

    // Arka planda sessizce kaydet
    recordChapterReadingSession({
      storyId: sId,
      chapterId: cId,
      activeSecondsDelta: delta,
      isCompleted: shouldMarkComplete,
      isFirstFlushForSession: isFirst
    }).catch(() => {
      // Sessiz hata yakalama
    });
  }, []);

  // Kullanıcı etkileşimi (Scroll, fare, dokunma, tuş)
  useEffect(() => {
    const updateActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      isVisibleRef.current = isVisible;
      if (!isVisible) {
        // Sekme arka plana düştüğünde biriken aktif süreyi hemen kaydet
        flush();
      } else {
        lastActivityTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Sayfa kapanırken veya yenilenirken flush
    const handleBeforeUnload = () => {
      flush();
    };
    window.addEventListener('pagehide', handleBeforeUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleBeforeUnload);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flush]);

  // Saniye sayacı ve periyodik heartbeat
  useEffect(() => {
    if (!storyId || !chapterId) return;

    // Yeni bölüm açıldığında oturum değişkenlerini sıfırla
    activeSecondsAccumulatedRef.current = 0;
    isFirstFlushRef.current = true;
    hasMarkedCompletedRef.current = false;
    lastActivityTimeRef.current = Date.now();

    let secondTickCounter = 0;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const isIdle = now - lastActivityTimeRef.current > 45000; // 45 sn hareketsizlik

      // Yalnızca sekme aktifse ve kullanıcı boşta değilse süreyi artır
      if (isVisibleRef.current && !isIdle) {
        activeSecondsAccumulatedRef.current += 1;
      }

      secondTickCounter += 1;
      // Her 30 saniyede bir, eğer en az 10 saniye aktif okuma birikmişse flush et
      if (secondTickCounter % 30 === 0) {
        if (activeSecondsAccumulatedRef.current >= 10) {
          flush();
        }
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      // Bölümden ayrılırken son durumu kaydet
      flush();
    };
  }, [storyId, chapterId, flush]);

  // isCompleted değiştiğinde (örn. %90 scroll'a ulaşıldığında) hemen ilet
  useEffect(() => {
    if (isCompleted && !hasMarkedCompletedRef.current) {
      flush(true);
    }
  }, [isCompleted, flush]);

  return {
    flush
  };
}
