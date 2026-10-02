'use client';

import { useEffect, useRef } from 'react';

export type BackHandler = () => boolean | void;

// LIFO yığın: En son açılan modal veya çekmece ilk olarak geri tuşunu yakalar
const backHandlers: BackHandler[] = [];

/**
 * Geri tuşuna basıldığında çalışacak bir handler kaydeder.
 * Eğer handler true (veya void) dönerse, olay tüketilmiş kabul edilir ve sayfa geçişi durdurulur.
 */
export function registerBackHandler(handler: BackHandler): () => void {
  backHandlers.push(handler);
  return () => {
    const idx = backHandlers.lastIndexOf(handler);
    if (idx !== -1) {
      backHandlers.splice(idx, 1);
    }
  };
}

/**
 * Kayıtlı geri tuşu handler'larını en son kaydedilenden geriye doğru çalıştırır.
 * Herhangi biri olayı ele alırsa true döner.
 */
export function executeBackHandlers(): boolean {
  for (let i = backHandlers.length - 1; i >= 0; i--) {
    try {
      const res = backHandlers[i]();
      // Eğer false açıkça dönülmediyse, olayı ele alınmış say
      if (res !== false) {
        return true;
      }
    } catch (e) {
      console.error('Back handler execution error:', e);
    }
  }
  return false;
}

/**
 * Modal, Bottom Sheet veya Çekmece açıkken geri tuşunu yakalamak için React hook'u.
 * @param onBack Geri tuşuna basıldığında modalı kapatan fonksiyon.
 * @param active Modalın açık olup olmadığını belirten boolean (varsayılan: true).
 */
export function useBackButton(onBack: () => boolean | void, active: boolean = true) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!active) return;

    return registerBackHandler(() => {
      return onBackRef.current();
    });
  }, [active]);
}
