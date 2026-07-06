"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Compass, Search, User, LogOut, PenTool, Hash, Settings, Bell, MessageCircle } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { useAuthStore, signOut, becomeAuthor, sendVerificationEmail, subscribeToChats } from '@readixon/core';
import { toast } from "sonner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, userProfile, setUserProfile, unreadNotificationCount } = useAuthStore();
  const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);

  React.useEffect(() => {
    if (!firebaseUser) return;
    return subscribeToChats(firebaseUser.uid, (chats) => {
      let count = 0;
      chats.forEach(chat => {
        if (chat.status === 'accepted') {
           count += (chat.unreadCounts[firebaseUser.uid] || 0);
        } else if (chat.status === 'pending' && chat.requestedBy !== firebaseUser.uid) {
           count += 1;
        }
      });
      setUnreadMessageCount(count);
    });
  }, [firebaseUser]);

  const handleBecomeAuthor = async () => {
    if (!firebaseUser || !userProfile) return;
    
    if (!firebaseUser.emailVerified) {
      try {
        await sendVerificationEmail(firebaseUser);
        toast('Yazar olabilmek için e-posta adresinizi doğrulamanız gerekmektedir. E-posta kutunuza bir onay linki gönderdik.');
      } catch (error) {
        console.error('Doğrulama e-postası gönderme hatası:', error);
        toast.error('Doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      return;
    }

    try {
      await becomeAuthor(firebaseUser.uid);
      setUserProfile({ ...userProfile, isAuthor: true });
      
      // Tebrik e-postası gönder
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: firebaseUser.email,
            subject: 'Readixon Yazar Stüdyosuna Hoş Geldiniz! 🎉',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #6366f1;">Tebrikler, artık bir Readixon yazarısınız!</h1>
                <p>Merhaba ${userProfile.displayName},</p>
                <p>Yazar başvurunuz başarıyla onaylandı. Artık Yazar Stüdyosu üzerinden kendi hikayelerinizi yazmaya ve yayımlamaya başlayabilirsiniz.</p>
                <p>Milyonlarca okurun hikayelerinizle buluşması için sabırsızlanıyoruz.</p>
                <p>Sevgiler,<br>Readixon Ekibi</p>
              </div>
            `,
          })
        });
      } catch (emailError) {
        console.error('Karşılama e-postası gönderilemedi:', emailError);
      }

      router.push('/studio');
    } catch (error) {
      console.error('Yazar olma hatası:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
    }
  };

  const navItems = [
    { name: 'Keşfet', href: '/feed', icon: Compass },
    { name: 'Kütüphane', href: '/library', icon: BookOpen },
    { name: 'Mesajlar', href: '/messages', icon: MessageCircle, badge: unreadMessageCount },
    { name: 'Readix', href: '/readix', icon: Hash },
    { name: 'Ara', href: '/search', icon: Search },
    { name: 'Bildirimler', href: '/notifications', icon: Bell, badge: unreadNotificationCount },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/20 p-6">
        <Typography variant="h2" className="font-bold text-primary tracking-tighter mb-10">readixon</Typography>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-card hover:text-text'
                }`}
              >
                <item.icon size={20} />
                <Typography variant="body" className="font-medium flex-1">{item.name}</Typography>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full absolute right-4">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
          <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-card/50 transition-colors group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-primary/30 transition-colors">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary uppercase">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <Typography variant="body" className="font-semibold truncate group-hover:text-primary transition-colors">
                {userProfile?.displayName || 'Yükleniyor...'}
              </Typography>
              <Typography variant="caption" className="text-muted truncate">
                {userProfile?.username ? `@${userProfile.username}` : `@${userProfile?.uid?.substring(0,6)}`}
              </Typography>
            </div>
          </Link>
          {userProfile?.isAuthor ? (
            <Link href="/studio">
              <Button variant="outline" className="w-full justify-start mb-2 border-primary/20 text-primary hover:bg-primary/10">
                <PenTool size={18} className="mr-2" /> Studio'ya Git
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full justify-start mb-2 border-primary/20 text-primary hover:bg-primary/10" onPress={handleBecomeAuthor}>
              <PenTool size={18} className="mr-2" /> Yazar Ol
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onPress={handleSignOut}>
            <LogOut size={18} className="mr-2" /> Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        {children}
      </main>

      {/* ── Bottom Nav (Mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-2 z-50 pb-safe">
        {navItems.filter(item => ['/feed', '/search', '/readix', '/messages'].includes(item.href)).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-full relative">
              <item.icon size={24} className={isActive ? 'text-primary' : 'text-muted'} />
              {item.badge ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute top-2 right-2 border-2 border-background translate-x-1 -translate-y-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
              {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-1 absolute bottom-1" />}
            </Link>
          );
        })}
        {/* Profil Linki (En sağda) */}
        <Link href="/profile" className="flex flex-col items-center justify-center w-14 h-full">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center overflow-hidden">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-primary uppercase">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          {pathname === '/profile' && <div className="w-1 h-1 rounded-full bg-primary mt-1" />}
        </Link>
      </div>
    </div>
  );
}
