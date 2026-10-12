'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  X, 
  Smartphone,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { AppVersionResponse } from '@/app/api/app-version/route';

const SNOOZE_DISMISS_HOURS = 24; // Hatırlatmayı erteleyen kullanıcıya 24 saat boyunca tekrar gösterme
const SNOOZE_DOWNLOAD_HOURS = 2;  // İndirmeyi başlatan kullanıcıya kurulum için 2 saat boyunca modalı tekrar açma

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
          // Zorunlu güncelleme ise erteleme kurallarını yok say
          if (data.isMandatory) {
            setUpdateInfo(data);
            setIsOpen(true);
            return;
          }

          // 1. Kullanıcı indirmeyi zaten başlattı mı? (Kurulum yapması için 2 saat süre tanı)
          const downloadedKey = `readixon_update_downloaded_${latestBuildNum}`;
          const downloadedAt = localStorage.getItem(downloadedKey);
          if (downloadedAt) {
            const timePassedHours = (Date.now() - parseInt(downloadedAt, 10)) / (1000 * 60 * 60);
            if (timePassedHours < SNOOZE_DOWNLOAD_HOURS) {
              return;
            }
          }

          // 2. Kullanıcı "Daha Sonra Hatırlat" dedi mi? (24 saat erteleme)
          const dismissedKey = `readixon_update_dismissed_${latestBuildNum}`;
          const dismissedAt = localStorage.getItem(dismissedKey);
          if (dismissedAt) {
            const timePassedHours = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
            if (timePassedHours < SNOOZE_DISMISS_HOURS) {
              return;
            }
          }

          setUpdateInfo(data);
          setIsOpen(true);
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
      // İndirme başlatıldığını kaydet (böylece kullanıcı uygulamaya döndüğünde modal hemen tekrar patlamaz)
      try {
        localStorage.setItem(`readixon_update_downloaded_${updateInfo.latestBuild}`, Date.now().toString());
      } catch {}

      // Android sistem tarayıcısında APK dosyasını aç (DownloadManager doğrudan indirir)
      window.open(updateInfo.apkUrl, '_system');

      toast.success('Güncelleme paketi indiriliyor! İndirme bitince bildirim çubuğundan APK dosyasına dokunarak kurulumu tamamlayabilirsiniz.', {
        duration: 8000,
      });

      // İndirme başlatıldıktan sonra modal kapatılır
      setTimeout(() => {
        setIsUpdating(false);
        if (!updateInfo.isMandatory) {
          setIsOpen(false);
        }
      }, 1500);
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
      localStorage.setItem(`readixon_update_dismissed_${updateInfo.latestBuild}`, Date.now().toString());
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen || !updateInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-[28px] bg-card text-text border border-border shadow-2xl p-5 sm:p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arka Plan Parlama Efektleri */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-[50px] pointer-events-none" />

          {/* Kapat Butonu (Zorunlu değilse) */}
          {!updateInfo.isMandatory && (
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background border border-border text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer z-10"
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
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-white shadow">
                <Sparkles size={12} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold tracking-wide">
                <span>Yeni Sürüm v{updateInfo.latestVersion}</span>
                {currentVersion && (
                  <span className="text-muted font-normal">
                    (Mevcut: v{currentVersion})
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-text leading-snug">
                {updateInfo.title}
              </h2>
              <p className="text-xs text-muted px-1 leading-relaxed">
                {updateInfo.description}
              </p>
            </div>
          </div>

          {/* Yenilikler Listesi */}
          <div className="my-4 p-3.5 rounded-2xl bg-background border border-border space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-text uppercase tracking-wider">
              <Sparkles size={13} className="text-primary" />
              <span>Neler Yeni?</span>
            </div>
            <ul className="space-y-2">
              {updateInfo.releaseNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-text leading-snug">
                  <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Güvenlik Bilgisi */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted mb-4">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Mevcut verileriniz ve hesabınız korunur.</span>
          </div>

          {/* Butonlar */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
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
                className="w-full py-2.5 rounded-xl border border-border bg-background hover:bg-card text-muted hover:text-text font-semibold text-xs transition-colors cursor-pointer"
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
