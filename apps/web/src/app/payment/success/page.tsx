'use client';

import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Iframe içindeysek ana sayfaya (parent) başarılı mesajı gönder
    if (window.parent !== window) {
      window.parent.postMessage('paytr_success', '*');
    } else {
      // Doğrudan açıldıysa (Iframe değilse) ana sayfaya yönlendir
      window.location.href = '/premium';
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Ödeme Başarılı!</h1>
      <p className="text-muted-foreground">İşleminiz başarıyla tamamlandı. Yönlendiriliyorsunuz...</p>
    </div>
  );
}
