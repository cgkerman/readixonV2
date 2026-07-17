"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Compass, Search, User, LogOut, PenTool, Hash, Settings, Bell, MessageCircle, Menu, X, LifeBuoy, Feather, ShieldAlert, Crown, Info } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { useAuthStore, signOut, becomeAuthor, sendVerificationEmail, subscribeToChats } from '@readixon/core';
import { toast } from "sonner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, userProfile, setUserProfile, unreadNotificationCount } = useAuthStore();
  const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  const [isVerifyModalOpen, setIsVerifyModalOpen] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifySuccess, setVerifySuccess] = React.useState(false);

  const handleBecomeAuthor = async () => {
    if (!firebaseUser || !userProfile) return;
    
    if (!firebaseUser.emailVerified) {
      setIsVerifyModalOpen(true);
      return;
    }

    await upgradeToAuthor();
  };

  const sendEmailAndStartPolling = async () => {
    if (!firebaseUser) return;
    setIsVerifying(true);
    
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: firebaseUser.email }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Doğrulama maili gönderilemedi.');
      }

      toast('Doğrulama e-postası gönderildi. Lütfen gelen kutunuzu (ve gereksiz kutusunu) kontrol edin.');
      
      const pollInterval = setInterval(async () => {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          clearInterval(pollInterval);
          setVerifySuccess(true);
          
          setTimeout(async () => {
             await upgradeToAuthor();
             setIsVerifyModalOpen(false);
             setVerifySuccess(false);
             setIsVerifying(false);
          }, 3000); // Başarı mesajını 3 saniye göster
        }
      }, 3000);
      
    } catch (error) {
      console.error('Doğrulama e-postası gönderme hatası:', error);
      toast.error('E-posta gönderilirken bir hata oluştu. Daha sonra tekrar deneyin.');
      setIsVerifying(false);
    }
  };

  const upgradeToAuthor = async () => {
    if (!firebaseUser || !userProfile) return;
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
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                  .header { background-color: #6366f1; padding: 40px 20px; text-align: center; }
                  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                  .content { padding: 40px 30px; color: #374151; line-height: 1.6; font-size: 16px; }
                  .content h2 { color: #111827; font-size: 20px; margin-top: 0; }
                  .button-container { text-align: center; margin: 35px 0; }
                  .button { background-color: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; }
                  .footer { background-color: #f3f4f6; padding: 25px 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                  .footer a { color: #6366f1; text-decoration: none; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>readixon</h1>
                  </div>
                  <div class="content">
                    <h2>Tebrikler ${userProfile.displayName}, artık resmi bir yazarımızsınız! 🎉</h2>
                    <p>Yazar başvurunuz başarıyla onaylandı. Sizi aramızda görmekten inanılmaz heyecan duyuyoruz.</p>
                    <p>Yüz binlerce kelimelik hikayeler, benzersiz karakterler ve sonsuz dünyalar yaratacağınız bu yolculukta kaleminiz her zaman güçlü olsun.</p>
                    <p>Okurlarınızla buluşmaya hazırsanız, Yazar Stüdyosu sizi bekliyor.</p>
                    
                    <div class="button-container">
                      <a href="https://www.readixon.com/studio" class="button">Stüdyo'ya Git ve Yazmaya Başla</a>
                    </div>
                    
                    <p>Sevgilerimizle,<br><strong>Readixon Ekibi</strong></p>
                  </div>
                  <div class="footer">
                    <p>Bu e-posta sistem tarafından otomatik olarak gönderilmiştir. Lütfen bu mesaja yanıt vermeyin.</p>
                    <p>Herhangi bir sorunuz veya desteğe ihtiyacınız olursa bize her zaman <a href="mailto:support@readixon.com">support@readixon.com</a> adresinden ulaşabilirsiniz.</p>
                    <p>&copy; ${new Date().getFullYear()} Readixon. Tüm hakları saklıdır.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          })
        });
      } catch (emailError) {
        console.error('Karşılama e-postası gönderilemedi:', emailError);
      }

      router.push('/studio');
      toast.success("Tebrikler! Yazar Stüdyosuna yönlendiriliyorsunuz.");
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

  type NavItem = { name: string; href: string; icon: any; badge?: number };

  const topNavItems: NavItem[] = [
    { name: 'Keşfet', href: '/feed', icon: Compass },
    { name: 'Arena', href: '/arena', icon: Feather },
    { name: 'Readix', href: '/readix', icon: Hash },
    { name: 'Ara', href: '/search', icon: Search },
  ];

  const bottomNavItems: NavItem[] = [
    { name: 'Kütüphane', href: '/library', icon: BookOpen },
    { name: 'Mesajlar', href: '/messages', icon: MessageCircle, badge: unreadMessageCount },
    { name: 'Bildirimler', href: '/notifications', icon: Bell, badge: unreadNotificationCount },
    { name: 'Hakkımızda', href: '/about', icon: Info },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/20 p-6">
        <Typography variant="h2" className="font-bold text-primary tracking-tighter mb-10">readixon</Typography>
        
        <nav className="flex-1 flex flex-col gap-2">
          {topNavItems.map((item) => {
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
              </Link>
            );
          })}

          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/messages' && pathname.startsWith('/messages'));
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
              <Typography variant="caption" className="text-muted truncate block">
                {userProfile?.username ? `@${userProfile.username}` : `@${userProfile?.uid?.substring(0,6)}`}
              </Typography>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <Typography variant="caption" className="text-amber-500 font-bold text-[10px]">
                  {userProfile?.rxPoints || 0} RX
                </Typography>
              </div>
            </div>
          </Link>
          {userProfile?.status !== 'pro' && (
            <Link href="/premium">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary shadow-sm hover:bg-primary/20 transition-all cursor-pointer flex flex-col items-start gap-0.5 mb-3 group">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-primary group-hover:scale-110 transition-transform" />
                  <Typography variant="body" className="font-bold text-sm">
                    {userProfile?.status === 'premium' ? 'Pro\'ya Yükselt' : 'Premium Ol'}
                  </Typography>
                </div>
                <Typography variant="caption" className="text-primary/70 text-xs">
                  {userProfile?.status === 'premium' ? 'Sınırsız yaratıcılığa adım at' : 'Okuma deneyimini zirveye taşı'}
                </Typography>
              </div>
            </Link>
          )}
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
          {userProfile?.isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="w-full justify-start mb-2 border-primary/20 text-primary hover:bg-primary/10">
                <ShieldAlert size={18} className="mr-2" /> Yönetim Paneli
              </Button>
            </Link>
          )}
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onPress={handleSignOut}>
            <LogOut size={18} className="mr-2" /> Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        
        {/* ── Mobile Top Header ── */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border/50 shrink-0">
          <Typography variant="h3" className="font-bold text-primary tracking-tighter">readixon</Typography>
          <div className="flex items-center gap-5">
            <Link href="/messages" className="relative">
              <MessageCircle size={24} className={pathname.startsWith('/messages') ? 'text-primary' : 'text-muted'} />
              {unreadMessageCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-1 -right-1 border-2 border-background">
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </span>
              )}
            </Link>
            <Link href="/notifications" className="relative">
              <Bell size={24} className={pathname === '/notifications' ? 'text-primary' : 'text-muted'} />
              {unreadNotificationCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-1 -right-1 border-2 border-background">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-muted hover:text-text transition-colors">
              <Menu size={28} />
            </button>
          </div>
        </div>

        {children}
      </main>

      {/* ── Bottom Nav (Mobile) ── */}
      {!(pathname.startsWith('/messages/') && pathname.split('/').length > 2) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-2 z-50 pb-safe">
          {topNavItems.map((item) => {
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
      )}

      {/* ── Email Verification Modal ── */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal İçeriği */}
            {!isVerifying && !verifySuccess ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <PenTool size={40} />
                </div>
                <Typography variant="h3" className="mb-2">Yazar Ol</Typography>
                <Typography variant="body" className="text-muted mb-8">
                  Yazar olabilmek için e-posta adresinizi doğrulamanız gerekmektedir. E-mail doğrulama işleminizden sonra yazar olabilirsiniz.
                </Typography>
                
                <div className="flex flex-col w-full gap-3">
                  <Button variant="primary" onPress={sendEmailAndStartPolling} className="w-full">
                    Doğrulama E-postası Gönder
                  </Button>
                  <Button variant="ghost" onPress={() => setIsVerifyModalOpen(false)} className="w-full text-muted">
                    İptal
                  </Button>
                </div>
              </>
            ) : verifySuccess ? (
              <>
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 animate-in zoom-in duration-500">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <Typography variant="h3" className="mb-2 text-green-500">Doğrulama Başarılı!</Typography>
                <Typography variant="body" className="text-muted">
                  Harika! E-posta adresiniz doğrulandı. Yazar stüdyosuna yönlendiriliyorsunuz...
                </Typography>
              </>
            ) : (
              <>
                {/* Özgün Yükleme Animasyonu */}
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center mt-4">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-b-2 border-primary/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                  <PenTool size={32} className="text-primary animate-pulse" />
                </div>
                <Typography variant="h3" className="mb-2">Onay Bekleniyor...</Typography>
                <Typography variant="body" className="text-muted">
                  Gelen kutunuzu (veya spam klasörünü) kontrol edin ve onay linkine tıklayın. Siz onayladığınız an bu ekran otomatik olarak kapanacaktır.
                </Typography>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Slide-out Drawer ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-[80%] max-w-sm h-[100dvh] bg-card shadow-2xl flex flex-col border-l border-border/50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
              <Typography variant="h3" className="font-bold text-primary tracking-tighter">readixon</Typography>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-muted/10 rounded-full text-muted hover:text-text transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 pb-safe">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-transparent">
                  {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary uppercase">
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <Typography variant="body" className="font-bold truncate text-text">
                    {userProfile?.displayName || 'Yükleniyor...'}
                  </Typography>
                  <Typography variant="caption" className="text-muted truncate block mt-0.5">
                    {userProfile?.username ? `@${userProfile.username}` : `@${userProfile?.uid?.substring(0,6)}`}
                  </Typography>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <Typography variant="caption" className="text-amber-500 font-bold text-[11px]">
                      {userProfile?.rxPoints || 0} RX
                    </Typography>
                  </div>
                </div>
              </Link>
              
              {bottomNavItems.filter(item => ['/library', '/about', '/settings'].includes(item.href)).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-colors shrink-0 ${
                    pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-muted/10 hover:text-text'
                  }`}
                >
                  <item.icon size={22} />
                  <Typography variant="body" className="font-medium text-lg flex-1">{item.name}</Typography>
                </Link>
              ))}

              <div className="mt-8 mb-4 shrink-0">
                <div className="h-px w-full bg-border/50 mb-4" />
                {userProfile?.status !== 'pro' && (
                  <Link href="/premium" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-primary shadow-sm hover:bg-primary/20 transition-all mb-4 group">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown size={20} className="text-primary group-hover:scale-110 transition-transform" />
                        <Typography variant="body" className="font-bold text-base">
                          {userProfile?.status === 'premium' ? 'Pro\'ya Yükselt' : 'Premium Ol'}
                        </Typography>
                      </div>
                      <Typography variant="caption" className="text-primary/70 text-sm">
                        {userProfile?.status === 'premium' ? 'Sınırsız yaratıcılığa adım at' : 'Okuma deneyimini zirveye taşı'}
                      </Typography>
                    </div>
                  </Link>
                )}
                {userProfile?.isAuthor ? (
                  <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start border-primary/20 text-primary hover:bg-primary/10 py-6">
                      <PenTool size={20} className="mr-3" /> <span className="text-lg">Studio'ya Git</span>
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full justify-start border-primary/20 text-primary hover:bg-primary/10 py-6" onPress={() => { setIsMobileMenuOpen(false); handleBecomeAuthor(); }}>
                    <PenTool size={20} className="mr-3" /> <span className="text-lg">Yazar Ol</span>
                  </Button>
                )}
                {userProfile?.isAdmin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start border-primary/20 text-primary hover:bg-primary/10 py-6 mb-2">
                      <ShieldAlert size={20} className="mr-3" /> <span className="text-lg">Yönetim Paneli</span>
                    </Button>
                  </Link>
                )}
              </div>
              <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 py-6 shrink-0" onPress={() => { setIsMobileMenuOpen(false); handleSignOut(); }}>
                <LogOut size={20} className="mr-3" /> <span className="text-lg">Çıkış Yap</span>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
