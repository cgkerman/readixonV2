'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  X, 
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { AppVersionResponse } from '@/app/api/app-version/route';

export function AppUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<AppVersionResponse | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAppVersion = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        // Yalnızca Android / iOS yerel uygulama içinde çalışır
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');
        const info = await App.getInfo();
        if (!isMounted) return;

        setCurrentVersion(info.version || '1.0');

        // Canlı sunucudaki en son sürüm bilgisini çek
        const res = await fetch('/api/app-version', { cache: 'no-store' });
        if (!res.ok) return;

        const data: AppVersionResponse = await res.json();
        if (!isMounted) return;

        const currentBuildNum = parseInt(info.build || '1', 10);
        const latestBuildNum = data.latestBuild;

        // Eğer kurulu build numarası sunucudakinden küçükse güncelleme mevcuttur
        if (currentBuildNum < latestBuildNum) {
          const dismissedKey = `readixon_update_dismissed_${latestBuildNum}`;
          const isDismissed = sessionStorage.getItem(dismissedKey);

          if (!isDismissed || data.isMandatory) {
            setUpdateInfo(data);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn('[AppUpdateChecker] Sürüm kontrol hatası:', err);
      }
    };

    // Uygulama açılışında kısa bir süre sonra (ana sayfa oturduğunda) kontrol et
    const timer = setTimeout(() => {
      checkAppVersion();
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleUpdate = () => {
    if (!updateInfo) return;
    setIsUpdating(true);

    try {
      // Android sistem tarayıcısında APK dosyasını aç (DownloadManager doğrudan indirir)
      window.open(updateInfo.apkUrl, '_system');

      toast.success('Güncelleme paketi indiriliyor! Bildirim çubuğunu kontrol edebilirsiniz.', {
        duration: 6000,
      });

      // İndirme başlatıldıktan sonra modal kapatılabilir
      setTimeout(() => {
        setIsUpdating(false);
        if (!updateInfo.isMandatory) {
          setIsOpen(false);
        }
      }, 2000);
    } catch (e) {
      console.error('Güncelleme yönlendirme hatası:', e);
      window.location.href = updateInfo.apkUrl;
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    if (!updateInfo) return;
    if (updateInfo.isMandatory) {
      toast.warning('Bu güncelleme uygulamanın çalışması için zorunludur.');
      return;
    }

    try {
      sessionStorage.setItem(`readixon_update_dismissed_${updateInfo.latestBuild}`, 'true');
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen || !updateInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-[28px] bg-gradient-to-b from-card/95 via-card/90 to-background border border-border/80 shadow-2xl p-5 sm:p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arka Plan Parlama Efektleri */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/25 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />

          {/* Kapat Butonu (Zorunlu değilse) */}
          {!updateInfo.isMandatory && (
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          )}

          {/* Başlık ve Rozet */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-primary/30">
                <Smartphone size={32} />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-white shadow">
                <Sparkles size={12} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-bold tracking-wide mb-1.5">
                <span>Yeni Sürüm v{updateInfo.latestVersion}</span>
                {currentVersion && (
                  <span className="text-muted-foreground font-normal">
                    (Mevcut: v{currentVersion})
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-foreground">
                {updateInfo.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 px-2 leading-relaxed">
                {updateInfo.description}
              </p>
            </div>
          </div>

          {/* Yenilikler Listesi */}
          <div className="my-4 p-3.5 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wider">
              <Sparkles size={13} className="text-primary" />
              <span>Neler Yeni?</span>
            </div>
            <ul className="space-y-1.5">
              {updateInfo.releaseNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-foreground/85 leading-snug">
                  <CheckCircle2 size={14} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Güvenlik Bilgisi */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground mb-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Mevcut verileriniz ve hesabınız korunur.</span>
          </div>

          {/* Butonlar */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 hover:from-primary/90 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>İndirme Başlatılıyor...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Şimdi Güncelle (APK)</span>
                </>
              )}
            </button>

            {!updateInfo.isMandatory && (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/25 text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors cursor-pointer"
              >
                Daha Sonra Hatırlat
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
