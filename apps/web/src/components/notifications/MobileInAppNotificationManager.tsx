'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bell, X, ChevronRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, useAuthStore } from '@readixon/core';
import type { Chat, AppNotification } from '@readixon/core';
import { playNotificationSound, triggerNotificationHaptic } from '@/utils/notificationEffects';

interface ActiveInAppAlert {
  id: string;
  title: string;
  body: string;
  avatarUrl?: string;
  type: 'message' | 'notification';
  route: string;
}

export function MobileInAppNotificationManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser } = useAuthStore();
  const [activeAlert, setActiveAlert] = useState<ActiveInAppAlert | null>(null);

  const mountedAtRef = useRef<number>(Date.now());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const lastAlertTimeRef = useRef<Map<string, number>>(new Map());
  const dismissTimerRef = useRef<NodeJS.Timeout>();
  const prevUserRef = useRef<string | null>(null);

  // Oturum kapandığında cihaz bildirim token'ını eski hesaptan kaldır
  useEffect(() => {
    const currentUid = firebaseUser?.uid || null;
    const prevUid = prevUserRef.current;

    if (prevUid && prevUid !== currentUid) {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('readixon_fcm_token') : null;
      if (savedToken) {
        const baseUrl = typeof window !== 'undefined' && window.location.origin.includes('http') && !window.location.origin.includes('localhost')
          ? window.location.origin
          : 'https://www.readixon.com';

        fetch(`${baseUrl}/api/notifications/unregister-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: prevUid, token: savedToken }),
        }).catch((err) => console.warn('[FCM] Çıkış token temizleme uyarısı:', err));
      }
    }

    prevUserRef.current = currentUid;
  }, [firebaseUser]);

  // 1. Android / Capacitor FCM Push Bildirim İzinleri ve Token Kaydı
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const uid = firebaseUser.uid;

    if (Capacitor.isNativePlatform()) {
      (async () => {
        try {
          // Android 8+ için yüksek öncelikli bildirim kanalı (Arka plandayken ses ve durum çubuğu için)
          try {
            await PushNotifications.createChannel({
              id: 'readixon_alerts',
              name: 'Readixon Bildirimleri',
              description: 'Gelen mesajlar ve etkileşim bildirimleri',
              importance: 5, // High importance (heads-up notification)
              visibility: 1, // Public
              vibration: true,
              sound: 'default',
            });
          } catch (chanErr) {
            console.warn('[FCM] Push kanalı oluşturma uyarısı:', chanErr);
          }

          // Önceki dinleyicileri temizle ve YENİ DİNLENİCİLERİ register()'dan ÖNCE ekle!
          await PushNotifications.removeAllListeners();

          PushNotifications.addListener('registration', async (token) => {
            console.log('[FCM] Push token başarıyla alındı:', token.value);
            if (!token?.value || !uid) return;

            if (typeof window !== 'undefined') {
              localStorage.setItem('readixon_fcm_token', token.value);
            }

            const baseUrl = typeof window !== 'undefined' && window.location.origin.includes('http') && !window.location.origin.includes('localhost')
              ? window.location.origin
              : 'https://www.readixon.com';

            // 1. Sunucu API üzerinden kaydet (Admin SDK tüm eski hesaplardan token'ı temizler)
            try {
              await fetch(`${baseUrl}/api/notifications/register-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: uid,
                  token: token.value,
                }),
              });
              console.log('[FCM] Token sunucu API ile başarıyla kaydedildi.');
            } catch (apiErr) {
              console.warn('[FCM] Sunucu API kayıt hatası:', apiErr);
            }
          });

          PushNotifications.addListener('registrationError', (err) => {
            console.error('[FCM] Kayıt hatası:', err);
          });

          // Uygulama ön plandayken gelen Push bildirimi
          // (Firestore canlı dinleyicisi zaten 0ms'de gösterdiyse mükerrer gösterme!)
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[FCM] Ön planda bildirim yakalandı:', notification);

            // GÜVENLİK KALKANI: Bu etkileşimi biz yaptıysak ASLA bildirim gösterme!
            const actorId = notification.data?.actorId || notification.data?.senderId;
            if (actorId && actorId === uid) {
              console.log('[FCM] Kendi aksiyonumuz olduğu için ön plan push bildirimi yoksayıldı.');
              return;
            }

            const chatId = notification.data?.chatId;
            if (chatId) {
              const lastTime = lastAlertTimeRef.current.get(chatId) || 0;
              if (Date.now() - lastTime < 4000) {
                return; // Firestore zaten gösterdi
              }
            }

            const notifId = notification.data?.notificationId;
            if (notifId) {
              const lastTime = lastAlertTimeRef.current.get(notifId) || 0;
              if (Date.now() - lastTime < 4000) {
                return; // Firestore zaten gösterdi
              }
            }

            const notifKey = notification.id || `push_${notifId || chatId || Date.now()}`;
            if (seenIdsRef.current.has(notifKey)) return;
            seenIdsRef.current.add(notifKey);

            if (chatId) lastAlertTimeRef.current.set(chatId, Date.now());
            if (notifId) lastAlertTimeRef.current.set(notifId, Date.now());

            const route = notification.data?.route || '/notifications';
            triggerAlert({
              id: notifKey,
              title: notification.title || 'Readixon',
              body: notification.body || '',
              type: notification.data?.type === 'message' ? 'message' : 'notification',
              route,
            });
          });

          // Kilit ekranı veya durum çubuğundaki bildirime tıklandığında ilgili sayfaya git
          PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('[FCM] Bildirime tıklandı:', action);
            const route = action.notification.data?.route;
            if (route) {
              router.push(route);
            }
          });

          // Dinleyiciler eklendikten SONRA izinleri kontrol et ve kaydol
          let pushPerm = await PushNotifications.checkPermissions();
          if (pushPerm.receive !== 'granted') {
            pushPerm = await PushNotifications.requestPermissions();
          }

          if (pushPerm.receive === 'granted') {
            await PushNotifications.register();
            console.log('[FCM] PushNotifications.register() çağrıldı.');
          }
        } catch (err) {
          console.warn('[FCM] Bildirim sistemi başlatılamadı:', err);
        }
      })();
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [firebaseUser, router]);

  // 2. Uygulama açıkken sadece şık ekran üstü Floating Banner + Ses + Titreşim (WhatsApp / Instagram tarzı)
  const triggerAlert = useCallback(async (alert: ActiveInAppAlert) => {
    // Ses ve Titreşim çal
    playNotificationSound(alert.type);
    triggerNotificationHaptic(alert.type);

    // Uygulama içi Floating Banner'ı göster (durum çubuğuna spam atmaz)
    setActiveAlert(alert);

    // 4.5 saniye sonra otomatik kapat
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, 4500);
  }, []);

  // 3. Gerçek Zamanlı Mesaj Bildirimleri Dinleyicisi (Chat Messages)
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', uid)
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified' || change.type === 'added') {
          const chat = { id: change.doc.id, ...change.doc.data() } as Chat;

          if (!chat.lastMessage || !chat.lastMessageAt) return;

          const msgTime = chat.lastMessageAt.toMillis
            ? chat.lastMessageAt.toMillis()
            : chat.lastMessageAt.seconds * 1000;

          // Sadece bileşen açıldıktan sonra gelen yeni mesajları bildir (15sn saat farkı toleransı)
          if (msgTime < mountedAtRef.current - 15000) return;

          // 1. Kendi attığımız mesajsa ASLA bildirim gösterme
          if (chat.lastMessageSenderId && chat.lastMessageSenderId === uid) return;

          const unreadForMe = chat.unreadCounts?.[uid] || 0;
          if (unreadForMe <= 0) return;

          // Diğer katılımcı (Gönderen)
          const senderId = chat.lastMessageSenderId || chat.participants.find((p) => p !== uid);
          if (!senderId || senderId === uid) return;

          // MÜKERRER BİLDİRİM ENGELLEYİCİ:
          // Aynı sohbet için 3 saniye içinde birden fazla snapshot (local vs serverTimestamp) gelirse engelle
          const lastTime = lastAlertTimeRef.current.get(chat.id) || 0;
          if (Date.now() - lastTime < 3500) return;
          lastAlertTimeRef.current.set(chat.id, Date.now());

          const msgKey = `msg_${chat.id}_${chat.lastMessage}`;
          if (seenIdsRef.current.has(msgKey)) return;
          seenIdsRef.current.add(msgKey);

          // Kullanıcı şu an o mesajlaşma sayfasının içindeyse bildirim fırlatma
          if (pathname === `/messages/${chat.id}`) return;

          const senderDetails = chat.participantDetails?.[senderId];
          const senderName = senderDetails?.displayName || senderDetails?.username || 'Yeni Mesaj';

          triggerAlert({
            id: msgKey,
            title: senderName,
            body: chat.lastMessage,
            avatarUrl: senderDetails?.avatarUrl,
            type: 'message',
            route: `/messages/${chat.id}`,
          });
        }
      });
    }, (err) => {
      console.warn("Mesaj dinleyicisi hatası:", err);
    });

    return () => unsubscribeChats();
  }, [firebaseUser, pathname, triggerAlert]);

  // 4. Gerçek Zamanlı Genel Bildirimler Dinleyicisi (Takip, Beğeni, Yorum, Düello)
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    const notifQuery = query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = { id: change.doc.id, ...change.doc.data() } as AppNotification;

          // Kendi tetiklediğimiz aksiyonsa ASLA bildirim gösterme
          if (notif.actorId === uid) {
            seenIdsRef.current.add(notif.id);
            return;
          }

          if (!notif.createdAt) return;

          const notifTime = notif.createdAt.toMillis
            ? notif.createdAt.toMillis()
            : notif.createdAt.seconds * 1000;

          // Sadece bileşen açıldıktan sonraki bildirimler (15sn saat farkı toleransı)
          if (notifTime < mountedAtRef.current - 15000) {
            seenIdsRef.current.add(notif.id);
            return;
          }

          const lastTime = lastAlertTimeRef.current.get(notif.id) || 0;
          if (Date.now() - lastTime < 3500) return;
          lastAlertTimeRef.current.set(notif.id, Date.now());

          if (seenIdsRef.current.has(notif.id)) return;
          seenIdsRef.current.add(notif.id);

          // Kullanıcı zaten bildirimler sayfasındaysa bildirim fırlatma
          if (pathname === '/notifications') return;

          const actor = notif.actorName || notif.actorUsername || 'Readixon';
          let body = 'Yeni bir bildirim aldınız.';
          let route = '/notifications';

          switch (notif.type) {
            case 'follow':
              body = `${actor} seni takip etmeye başladı.`;
              route = notif.actorUsername ? `/profile/${notif.actorUsername}` : '/notifications';
              break;
            case 'story_like':
              body = notif.entityTitle ? `${actor} "${notif.entityTitle}" hikayeni beğendi.` : `${actor} hikayeni beğendi.`;
              route = notif.entityId ? `/read/${notif.entityId}` : '/notifications';
              break;
            case 'chapter_like':
              body = notif.subEntityTitle ? `${actor} "${notif.subEntityTitle}" bölümünü beğendi.` : `${actor} bir bölümünü beğendi.`;
              route = notif.entityId && notif.subEntityId ? `/read/${notif.entityId}/${notif.subEntityId}` : '/notifications';
              break;
            case 'story_comment':
              body = notif.entityTitle ? `${actor} "${notif.entityTitle}" hikayene yorum yaptı.` : `${actor} hikayene yorum yaptı.`;
              route = notif.entityId ? `/read/${notif.entityId}` : '/notifications';
              break;
            case 'paragraph_comment':
              body = `${actor} bir cümlene yorum bıraktı.`;
              route = notif.entityId && notif.subEntityId ? `/read/${notif.entityId}/${notif.subEntityId}` : '/notifications';
              break;
            case 'readix_like':
              body = `${actor} Readix gönderini beğendi.`;
              route = '/readix';
              break;
            case 'readix_comment':
              body = `${actor} Readix gönderine yorum yaptı.`;
              route = '/readix';
              break;
            case 'readix_mention':
              body = `${actor} bir Readix gönderisinde senden bahsetti.`;
              route = '/readix';
              break;
            case 'new_chapter':
              body = notif.subEntityTitle ? `${actor} yeni bir bölüm yayınladı: "${notif.subEntityTitle}"` : `${actor} yeni bir bölüm yayınladı.`;
              route = notif.entityId && notif.subEntityId ? `/read/${notif.entityId}/${notif.subEntityId}` : '/notifications';
              break;
            case 'duel_challenge':
              body = `${actor} seni bir yazarlık düellosuna davet etti!`;
              route = '/duels';
              break;
            case 'duel_accepted':
              body = `${actor} düello davetini kabul etti.`;
              route = '/duels';
              break;
            case 'duel_rejected':
              body = `${actor} düello davetini reddetti.`;
              route = '/duels';
              break;
            case 'badge_earned':
              body = notif.entityTitle ? `Tebrikler! "${notif.entityTitle}" rozetini kazandın.` : 'Tebrikler! Yeni bir rozet kazandın.';
              route = '/profile';
              break;
            case 'system_message':
              body = notif.message || 'Sistemden yeni bir mesaj aldınız.';
              route = '/notifications';
              break;
            case 'editorial_review':
              body = `${actor} bir editör incelemesi tamamladı.`;
              route = notif.entityId ? `/read/${notif.entityId}` : '/notifications';
              break;
            default:
              body = notif.message || `${actor} seninle etkileşime geçti.`;
              break;
          }

          triggerAlert({
            id: notif.id,
            title: actor,
            body,
            avatarUrl: notif.actorAvatar,
            type: 'notification',
            route,
          });
        }
      });
    }, (err) => {
      console.warn("Bildirim dinleyicisi hatası:", err);
    });

    return () => unsubscribeNotifs();
  }, [firebaseUser, pathname, triggerAlert]);

  // Bildirime tıklandığında sayfaya git ve kapat
  const handleAlertClick = () => {
    if (!activeAlert) return;
    const targetRoute = activeAlert.route;
    setActiveAlert(null);
    router.push(targetRoute);
  };

  return (
    <aside aria-label="Uygulama İçi Bildirimler" className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none pt-[calc(0.75rem+env(safe-area-inset-top,0px))] px-3 sm:px-4">
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            key={activeAlert.id}
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="pointer-events-auto max-w-sm w-full mx-auto"
          >
            <div
              onClick={handleAlertClick}
              className="group rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/80 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.22)] flex items-center gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform"
            >
              {/* Sol: Avatar veya İkon */}
              <div className="relative shrink-0">
                {activeAlert.avatarUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border/60 bg-muted/20">
                    <Image
                      src={activeAlert.avatarUrl}
                      alt={activeAlert.title}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    {activeAlert.type === 'message' ? (
                      <MessageCircle size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>
                )}

                {/* Minik Rozet İkonu */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-black flex items-center justify-center shadow-xs">
                  {activeAlert.type === 'message' ? (
                    <MessageCircle size={9} />
                  ) : (
                    <Bell size={9} />
                  )}
                </div>
              </div>

              {/* Orta: İçerik */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {activeAlert.title}
                  </h4>
                  <span className="text-[10px] text-muted font-medium shrink-0">
                    Şimdi
                  </span>
                </div>
                <p className="text-[11px] text-muted truncate mt-0.5 leading-snug">
                  {activeAlert.body}
                </p>
              </div>

              {/* Sağ: Kapatma Butonu */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAlert(null);
                }}
                className="w-6 h-6 rounded-full hover:bg-muted/15 flex items-center justify-center text-muted hover:text-foreground transition-colors shrink-0"
                aria-label="Kapat"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
