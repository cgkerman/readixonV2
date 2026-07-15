'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PayTRModalProps {
  token: string;
  onClose: () => void;
}

export function PayTRModal({ token, onClose }: PayTRModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Listen for iframe navigation (PayTR handles success/fail redirects inside iframe)
  // To make it close automatically on success, our /payment/success page can postMessage to parent.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Assuming your success/fail page does: window.parent.postMessage('paytr_success', '*');
      if (event.data === 'paytr_success' || event.data === 'paytr_fail') {
        onClose();
        // Optional: you can trigger a page reload or toast notification here
        if (event.data === 'paytr_success') {
          window.location.reload();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl h-[80vh] bg-surface rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surface">
          <h3 className="font-semibold text-lg text-foreground">Güvenli Ödeme (PayTR)</h3>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Iframe Container */}
        <div className="w-full h-[calc(100%-65px)] bg-white">
          {token ? (
            <iframe
              ref={iframeRef}
              src={`https://www.paytr.com/odeme/guvenli/${token}`}
              id="paytriframe"
              frameBorder="0"
              scrolling="yes"
              style={{ width: '100%', height: '100%' }}
              title="PayTR Güvenli Ödeme Sayfası"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
