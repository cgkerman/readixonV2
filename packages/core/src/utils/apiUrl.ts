/**
 * Platform ve ortama göre temel API URL'sini döner.
 * - Standart Web Tarayıcısı (localhost:3000, readixon.com, vercel vb.): window.location.origin
 * - Capacitor / Android / iOS Yerel Mobil Uygulama: https://www.readixon.com
 * - Sunucu Ortamı (SSR / Node): https://www.readixon.com
 */
export function getBaseApiUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://www.readixon.com';
  }

  // Capacitor yerel platform kontrolü (Android / iOS WebView)
  const isNativeCapacitor = Boolean(
    (window as any).Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && (window as any).Capacitor)
  );

  if (isNativeCapacitor) {
    return 'https://www.readixon.com';
  }

  // Web tarayıcısı (aynı origin üzerinden çağrı yapılmalı, böylece CORS engeline takılmaz)
  if (window.location?.origin?.startsWith('http')) {
    return window.location.origin;
  }

  return 'https://www.readixon.com';
}

