/**
 * Mobil Uygulama İçi Bildirim Efektleri (Ses & Titreşim)
 * Harici dosya yüklemesi gerektirmeyen anlık Web Audio sentezleyicisi ve Haptik titreşim.
 */

/**
 * Yumuşak, modern iOS/Android tarzı bildirim sesi çalar (harici mp3 gerektirmez, 0ms gecikme).
 */
export function playNotificationSound(type: 'message' | 'notification' = 'notification') {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Kullanıcı henüz sayfayla etkileşime geçmediyse tarayıcı engelleyebilir, sessizce geç
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    if (type === 'message') {
      // Mesaj Sesi: Sıcak iki tonlu tını (F5 -> A5)
      osc1.frequency.setValueAtTime(698.46, now);
      osc2.frequency.setValueAtTime(880.0, now + 0.08);
    } else {
      // Genel Bildirim: Yükselen parlak tını (G5 -> C6)
      osc1.frequency.setValueAtTime(783.99, now);
      osc2.frequency.setValueAtTime(1046.5, now + 0.07);
    }

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);

    osc2.start(now + 0.07);
    osc2.stop(now + 0.32);
  } catch (err) {
    // Ses çalma hatası sessizce yoksayılır
  }
}

/**
 * Mobil cihazda titreşim motorunu (Haptic) tetikler.
 */
export function triggerNotificationHaptic(type: 'message' | 'notification' = 'notification') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      if (type === 'message') {
        // Çift kısa titreşim (mesaj için)
        navigator.vibrate([70, 40, 70]);
      } else {
        // Tek dokunsal titreşim (bildirim için)
        navigator.vibrate(90);
      }
    }
  } catch (err) {
    // Titreşim hatası sessizce yoksayılır
  }
}
