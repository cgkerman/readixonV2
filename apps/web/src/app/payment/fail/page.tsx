'use client';

import { useEffect } from 'react';

export default function PaymentFailPage() {
  useEffect(() => {
    // Iframe içindeysek ana sayfaya (parent) hata mesajı gönder
    if (window.parent !== window) {
      window.parent.postMessage('paytr_fail', '*');
    } else {
      // Doğrudan açıldıysa (Iframe değilse) ana sayfaya yönlendir
      window.location.href = '/premium';
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Ödeme Başarısız!</h1>
      <p className="text-muted-foreground">İşleminiz sırasında bir hata oluştu. Yönlendiriliyorsunuz...</p>
    </div>
  );
}
