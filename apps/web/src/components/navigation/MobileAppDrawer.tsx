'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LucideIcon,
  X,
  User,
  Crown,
  PenTool,
  BookOpen,
  Swords,
  Settings,
  Info,
  LifeBuoy,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  Hash,
  Compass,
  GalleryVertical,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore, signOut, useThemeStore, isDarkTheme } from '@readixon/core';
import { useBackButton } from '@/hooks/useBackButton';
import { toast } from 'sonner';

interface MobileAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBecomeAuthor?: () => void;
}

interface DrawerLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClose: () => void;
  customClass?: string;
  customChevronClass?: string;
}

function DrawerLink({ href, label, icon: Icon, active = false, onClose, customClass, customChevronClass }: DrawerLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all ${
        customClass
          ? customClass
          : active
          ? 'bg-primary/15 text-primary font-bold shadow-sm'
          : 'text-foreground/80 hover:text-foreground hover:bg-muted/10 active:scale-[0.99]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-primary' : 'text-foreground/70'} />
        <span>{label}</span>
      </div>
      <ChevronRight size={14} className={customChevronClass || (active ? 'text-primary' : 'text-muted/50')} />
    </Link>
  );
}

export function MobileAppDrawer({ isOpen, onClose, onBecomeAuthor }: MobileAppDrawerProps) {
  const pathname = usePathname();
  const { firebaseUser, userProfile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const isDark = isDarkTheme(theme);

  // Telefonun fiziksel geri tuşuna basıldığında çekmeceyi kapat
  useBackButton(() => {
    onClose();
    return true;
  }, isOpen);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      toast.success('Oturum başarıyla kapatıldı.');
    } catch {
      toast.error('Çıkış yapılırken bir hata oluştu.');
    }
  };

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/feed') {
      return pathname === '/feed' || pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="xl:hidden fixed inset-0 z-[100] flex justify-end select-none">
      {/* ── Karartma / Backdrop (Arkadaki sayfayı net şekilde karartıp ayırır) ── */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* ── Slide-over Drawer Paneli (Opak ve net arka plan, arkadaki yazıların yansımasını önler) ── */}
      <div className="relative w-[85%] max-w-[350px] h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Üst Dekoratif Arka Plan Işıltısı (Hafif ve kontrastı bozmayacak seviyede) */}
        <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

        {/* ── 1. Üst Kısım: Readixon Logo Rozeti & Kapat Butonu ── */}
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between shrink-0 bg-card">
          {/* Logo & Marka (Navbar ile birebir aynı rozet) */}
          <Link
            href="/feed"
            onClick={onClose}
            className="flex items-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-amber-400 p-[1px] shadow-sm shadow-primary/20">
              <div className="w-full h-full rounded-[11px] bg-card flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="Readixon"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground font-sans">
              readixon
            </span>
          </Link>

          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted/10 hover:bg-muted/20 border border-border flex items-center justify-center text-foreground active:scale-90 transition-all shadow-sm"
            aria-label="Kapat"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── 2. Orta Kısım: Kaydırılabilir İçerik ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-hide">

          {/* ── Kullanıcı Kartı veya Giriş Teşviki ── */}
          {firebaseUser ? (
            <div className="rounded-2xl p-4 bg-muted/10 border border-border/80 shadow-sm space-y-3 relative overflow-hidden group">
              {/* Profil Linki: Avatar veya isme tıklandığında profile gider */}
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 active:scale-[0.98] transition-transform group/user cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/40 group-hover/user:border-primary flex items-center justify-center flex-shrink-0 relative shadow-inner transition-colors">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-base font-bold text-primary uppercase select-none">
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-foreground group-hover/user:text-primary transition-colors truncate">
                      {userProfile?.displayName || 'İsimsiz Okur'}
                    </p>
                    {userProfile?.status === 'pro' && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-bold border border-amber-500/30">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted font-medium truncate group-hover/user:text-foreground/70 transition-colors">
                    @{userProfile?.username || 'kullanici'}
                  </p>
                </div>

                <ChevronRight size={16} className="text-muted/40 group-hover/user:text-primary transition-colors shrink-0" />
              </Link>

              {/* RX Puanı Bakiyesi */}
              <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-xs">
                <span className="text-foreground/80 flex items-center gap-1.5 font-medium">
                  <Sparkles size={14} className="text-amber-500" />
                  RX Puanı
                </span>
                <span className="font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {userProfile?.rxPoints || 0} RX
                </span>
              </div>

              {/* Pro Değilse: Premium'a Geç Promosyonu */}
              {userProfile?.status !== 'pro' && (
                <Link
                  href="/premium"
                  onClick={onClose}
                  className="mt-1 flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-transparent border border-amber-500/30 text-amber-500 hover:border-amber-500/50 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Crown size={15} />
                    <span>Premium'a Yükselt</span>
                  </div>
                  <ChevronRight size={14} className="text-amber-500/70" />
                </Link>
              )}
            </div>
          ) : (
            /* Giriş Yapılmamışsa Ziyaretçi Kartı */
            <div className="rounded-2xl p-4 bg-muted/10 border border-border/80 text-center space-y-3 shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Readixon'a Hoş Geldin</p>
                <p className="text-xs text-muted mt-0.5">Hikayeleri keşfet, kütüphaneni yönet ve topluluğa katıl.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl bg-primary text-black font-bold text-xs text-center hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-xs text-center hover:bg-muted/10 active:scale-95 transition-all"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          )}

          {/* ── Hızlı Aksiyon Kartları (Yazar Stüdyosu & Arena) ── */}
          {firebaseUser ? (
            <div className="grid grid-cols-2 gap-2">
              {userProfile?.isAuthor ? (
                <Link
                  href="/studio"
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-muted/10 hover:bg-primary/10 border border-border/80 hover:border-primary/40 flex flex-col gap-1 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PenTool size={15} />
                  </div>
                  <span className="font-bold text-xs text-foreground mt-0.5">Yazar Stüdyosu</span>
                  <span className="text-[10px] text-muted font-medium">Bölüm Yaz & Yönet</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onBecomeAuthor) onBecomeAuthor();
                  }}
                  className="p-3 rounded-2xl bg-muted/10 hover:bg-primary/10 border border-border/80 hover:border-primary/40 flex flex-col text-left gap-1 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PenTool size={15} />
                  </div>
                  <span className="font-bold text-xs text-foreground mt-0.5">Yazar Ol</span>
                  <span className="text-[10px] text-muted font-medium">Hikayeni Paylaş</span>
                </button>
              )}

              <Link
                href="/arena"
                onClick={onClose}
                className="p-3 rounded-2xl bg-muted/10 hover:bg-amber-500/10 border border-border/80 hover:border-amber-500/40 flex flex-col gap-1 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Swords size={15} />
                </div>
                <span className="font-bold text-xs text-foreground mt-0.5">Arena Düellosu</span>
                <span className="text-[10px] text-muted font-medium">Haftalık Yarışma</span>
              </Link>
            </div>
          ) : null}

          {/* ── 1. Grup: Ana Gezinti (Yüksek Kontrast & Net Tipografi) ── */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-muted uppercase px-3 block mb-1">
              Ana Gezinti
            </span>

            <DrawerLink href="/feed" label="Keşfet" icon={Compass} active={isLinkActive('/feed')} onClose={onClose} />
            <DrawerLink href="/webtoons" label="Webtoon" icon={GalleryVertical} active={isLinkActive('/webtoons')} onClose={onClose} />
            <DrawerLink href="/readix" label="Readix" icon={Hash} active={isLinkActive('/readix')} onClose={onClose} />
            <DrawerLink href="/library" label="Kütüphanem" icon={BookOpen} active={isLinkActive('/library')} onClose={onClose} />
          </div>

          {/* ── 2. Grup: Topluluk & Gündem ── */}
          <div className="space-y-1 pt-2 border-t border-border/60">
            <span className="text-[11px] font-bold tracking-wider text-muted uppercase px-3 block mb-1">
              Topluluk & Gündem
            </span>

            <DrawerLink href="/agenda" label="Gündem & Trendler" icon={Flame} active={isLinkActive('/agenda')} onClose={onClose} />
            <DrawerLink href="/reviews" label="Editöryel İncelemeler" icon={Award} active={isLinkActive('/reviews')} onClose={onClose} />
          </div>

          {/* ── Görünüm & Tema Modu (Açık / Koyu) ── */}
          <div className="p-3 rounded-2xl bg-muted/10 border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold px-0.5">
              <span className="text-foreground flex items-center gap-2 font-bold">
                {isDark ? <Moon size={15} className="text-primary" /> : <Sun size={15} className="text-amber-500" />}
                Görünüm Modu
              </span>
              <span className="text-muted text-[11px] font-medium">
                {isDark ? 'Koyu Tema' : 'Açık Tema'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-card border border-border/60">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  !isDark
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Sun size={14} className={!isDark ? 'text-amber-500' : ''} />
                <span>Açık</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Moon size={14} className={isDark ? 'text-primary' : ''} />
                <span>Koyu</span>
              </button>
            </div>
          </div>

          {/* ── 3. Grup: Hesap & Ayarlar ── */}
          <div className="space-y-1 pt-2 border-t border-border/60">
            <span className="text-[11px] font-bold tracking-wider text-muted uppercase px-3 block mb-1">
              Ayarlar & Destek
            </span>

            {firebaseUser ? (
              <DrawerLink href="/profile" label="Profilim" icon={User} active={isLinkActive('/profile')} onClose={onClose} />
            ) : null}

            <DrawerLink href="/settings" label="Hesap & Tercihler" icon={Settings} active={isLinkActive('/settings')} onClose={onClose} />
            <DrawerLink href="/support" label="Yardım & Destek" icon={LifeBuoy} active={isLinkActive('/support')} onClose={onClose} />
            <DrawerLink href="/about" label="Hakkımızda" icon={Info} active={isLinkActive('/about')} onClose={onClose} />

            {/* Yetkili Panelleri */}
            {Boolean(userProfile?.isAdmin) ? (
              <DrawerLink
                href="/admin"
                label="Admin Kontrol Paneli"
                icon={ShieldAlert}
                onClose={onClose}
                customClass="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold text-amber-500 hover:bg-amber-500/10 transition-colors"
                customChevronClass="text-amber-500/60"
              />
            ) : null}

            {Boolean(userProfile?.isEditor || userProfile?.isAdmin) ? (
              <DrawerLink
                href="/editor"
                label="Editör Paneli"
                icon={ShieldCheck}
                onClose={onClose}
                customClass="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                customChevronClass="text-emerald-500/60"
              />
            ) : null}
          </div>
        </div>

        {/* ── 3. Alt Kısım: Çıkış Butonu & Sürüm Bilgisi ── */}
        <div className="p-4 border-t border-border/60 bg-card space-y-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shrink-0">
          {firebaseUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-500 font-semibold text-xs border border-red-500/20 active:scale-95 transition-all"
            >
              <LogOut size={15} />
              <span>Oturumu Kapat</span>
            </button>
          ) : null}

          <div className="text-center">
            <span className="text-[10px] text-muted/60 font-mono tracking-tight">
              Readixon App • v1.0.0
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
