'use client';

import React, { useEffect, useState } from 'react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle2, Circle, Loader2, BookOpen, Feather, XCircle, Award } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { 
  useAuthStore, 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  generateStorySlug,
  type AppNotification 
} from '@readixon/core';

export default function NotificationsPage() {
  const router = useRouter();
  const { firebaseUser, unreadNotificationCount } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const notifs = await getNotifications(firebaseUser.uid, 50);
        setNotifications(notifs);
      } catch (error) {
        console.error("Bildirimler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [firebaseUser]);

  const handleMarkAllAsRead = async () => {
    if (!firebaseUser) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    await markAllAsRead(firebaseUser.uid);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!firebaseUser) return;

    if (!notif.isRead) {
      // Optimistic
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      await markAsRead(firebaseUser.uid, notif.id);
    }

    // Navigate
    switch (notif.type) {
      case 'follow':
        if (notif.actorUsername) {
          router.push(`/profile/@${notif.actorUsername}`);
        } else {
          // Fallback if no username
          toast('Bu kullanıcının profili henüz görüntülenemiyor.');
        }
        break;
      case 'story_like':
      case 'story_comment':
      case 'paragraph_comment':
      case 'new_chapter':
        if (notif.entityTitle && notif.entityId) {
          if (notif.subEntityId) {
            router.push(`/read/${notif.entityId}/${notif.subEntityId}`);
          } else {
            router.push(`/story/${generateStorySlug(notif.entityTitle, notif.entityId)}`);
          }
        }
        break;
      case 'readix_like':
      case 'readix_comment':
      case 'readix_mention':
        router.push(notif.entityId ? `/readix?id=${notif.entityId}` : '/readix');
        break;
      case 'duel_challenge':
      case 'duel_rejected':
        router.push('/arena');
        break;
      case 'duel_accepted':
        if (notif.entityId) {
          router.push(`/arena/${notif.entityId}`);
        }
        break;
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Az önce';
    
    // Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0"><UserPlus size={20} /></div>;
      case 'story_like':
      case 'readix_like':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0"><Heart size={20} /></div>;
      case 'story_comment':
      case 'paragraph_comment':
      case 'readix_comment':
      case 'readix_mention':
        return <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0"><MessageCircle size={20} /></div>;
      case 'new_chapter':
        return <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0"><BookOpen size={20} /></div>;
      case 'duel_challenge':
      case 'duel_accepted':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0"><Feather size={20} /></div>;
      case 'duel_rejected':
        return <div className="w-10 h-10 rounded-full bg-red-950/20 text-red-700 flex items-center justify-center shrink-0"><XCircle size={20} /></div>;
      case 'system_message':
        return <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0"><Bell size={20} /></div>;
      case 'badge_earned':
        return <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0"><Award size={20} /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-muted/20 text-muted flex items-center justify-center shrink-0"><Bell size={20} /></div>;
    }
  };

  const renderNotificationText = (notif: AppNotification) => {
    const actor = <span className="font-semibold text-text">{notif.actorName}</span>;
    const entity = notif.entityTitle ? <span className="font-medium text-text">"{notif.entityTitle}"</span> : null;

    switch (notif.type) {
      case 'follow':
        return <>{actor} seni takip etmeye başladı.</>;
      case 'story_like':
        return <>{actor}, {entity} hikayeni beğendi.</>;
      case 'story_comment':
        return <>{actor}, {entity} hikayene yorum yaptı.</>;
      case 'paragraph_comment':
        return <>{actor}, {entity} kitabının {notif.subEntityTitle ? `"${notif.subEntityTitle}" bölümünde` : 'bir bölümünde'} satır arası yorum yaptı.</>;
      case 'readix_like':
        return <>{actor}, {entity} gönderini beğendi.</>;
      case 'readix_comment':
        return <>{actor}, {entity} gönderine yanıt verdi.</>;
      case 'readix_mention':
        return <>{actor} bir Readix gönderisinde senden bahsetti.</>;
      case 'new_chapter':
        const chapter = notif.subEntityTitle ? <span className="font-medium text-primary">"{notif.subEntityTitle}"</span> : null;
        return <>{actor}, {entity} kitabında yeni bir bölüm yayınladı: {chapter}</>;
      case 'duel_challenge':
        return <>{actor} sana düello için meydan okudu!</>;
      case 'duel_accepted':
        return <>{actor} meydan okumanı kabul etti. Düello başladı!</>;
      case 'duel_rejected':
        return <>{actor} meydan okumanı reddetti.</>;
      case 'system_message':
        return <span>{notif.message || 'Sistemden yeni bir mesajınız var.'}</span>;
      case 'badge_earned':
        return <span>Tebrikler! <span className="font-semibold text-yellow-500">"{notif.entityTitle}"</span> rozetini kazandın.</span>;
      default:
        console.warn('Bilinmeyen bildirim tipi:', notif.type, notif);
        return <span>Yeni bir bildiriminiz var.</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-[60vh] text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Bell size={40} />
        </div>
        <Typography variant="h2" className="mb-4">Giriş Yapmalısınız</Typography>
        <Typography variant="body" className="text-muted mb-8 max-w-sm">
          Bildirimlerinizi görebilmek için lütfen giriş yapın veya kayıt olun.
        </Typography>
        <Button onPress={() => router.push('/login')}>Giriş Yap</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-border/50">
        <Typography variant="h1" className="text-3xl font-bold flex items-center gap-3">
          Bildirimler
          {unreadNotificationCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadNotificationCount} Yeni
            </span>
          )}
        </Typography>
        
        {unreadNotificationCount > 0 && (
          <Button variant="ghost" className="text-sm font-medium" onPress={handleMarkAllAsRead}>
            <CheckCircle2 size={16} className="mr-2" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
          <Bell size={48} className="text-muted/50 mb-6" />
          <Typography variant="h3" className="mb-2">Henüz Bildirim Yok</Typography>
          <Typography variant="body" className="text-muted max-w-sm">
            İnsanlarla etkileşime geçtikçe bildirimleriniz burada görünmeye başlayacak.
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-4 p-4 rounded-2xl transition-all border text-left ${
                notif.isRead 
                  ? 'bg-card/30 border-transparent hover:bg-card/80' 
                  : 'bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-sm'
              }`}
            >
              {/* Sol Taraf: İkon ve Avatar */}
              <div className="relative shrink-0 pt-1">
                {renderNotificationIcon(notif.type)}
                {notif.actorAvatar && (
                  <img 
                    src={notif.actorAvatar} 
                    alt={notif.actorName} 
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background object-cover"
                  />
                )}
              </div>
              
              {/* Orta: İçerik */}
              <div className="flex-1 pt-1 min-w-0">
                <Typography variant="body" className={`text-[15px] leading-snug ${notif.isRead ? 'text-muted-foreground' : 'text-text font-medium'}`}>
                  {renderNotificationText(notif)}
                </Typography>
                <Typography variant="caption" className="text-muted mt-2 block font-medium">
                  {formatTimeAgo(notif.createdAt)}
                </Typography>
              </div>

              {/* Sağ: Okunmamış Noktası */}
              {!notif.isRead && (
                <div className="shrink-0 pt-3 pr-2">
                  <Circle size={10} className="fill-primary text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
