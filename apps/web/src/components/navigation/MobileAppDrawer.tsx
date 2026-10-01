'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
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
  LogOut, 
  LogIn, 
  Sparkles, 
  ChevronRight,
  Flame,
  Newspaper,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { useAuthStore, signOut } from '@readixon/core';
import { toast } from 'sonner';

interface MobileAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBecomeAuthor?: () => void;
}

export function MobileAppDrawer({ isOpen, onClose, onBecomeAuthor }: MobileAppDrawerProps) {
  const pathname = usePathname();
  const { firebaseUser, userProfile } = useAuthStore();

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

  return (
    <div className="xl:hidden fixed inset-0 z-[100] flex justify-end select-none">
      {/* Karartma / Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Paneli */}
      <div className="relative w-[85%] max-w-[340px] h-full bg-[#121214] border-l border-zinc-800/80 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Üst Kısım: Başlık & Kapat Butonu */}
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between shrink-0 bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              readixon
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Orta Kısım: Kaydırılabilir İçerik */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
          
          {/* Kullanıcı Kartı veya Giriş Teşviki */}
          {firebaseUser ? (
            <div className="rounded-2xl p-3.5 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 relative">
                  {userProfile?.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary uppercase">
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-white truncate">
                      {userProfile?.displayName || 'İsimsiz Okur'}
                    </p>
                    {userProfile?.status === 'pro' && (
                      <span className="flex-shrink-0 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    @{userProfile?.username || 'kullanici'}
                  </p>
                </div>
              </div>

              {/* Rx Puanı ve Seviye Barı */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <span className="text-zinc-400 flex items-center gap-1">
                  💎 Puan Bakiyesi
                </span>
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {userProfile?.rxPoints || 0} RX
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-primary/10 via-zinc-900 to-zinc-900 border border-primary/20 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Readixon'a Katılın</p>
                <p className="text-xs text-zinc-400 mt-0.5">Binlerce hikayeyi ücretsiz okuyun ve favorilerinizi kaydedin.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl bg-primary text-black font-bold text-xs text-center hover:bg-primary/90 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl bg-zinc-800 text-white font-medium text-xs text-center hover:bg-zinc-700 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          )}

          {/* Hızlı Aksiyon Kartları (Yazar Stüdyosu vb.) */}
          {firebaseUser && (
            <div className="grid grid-cols-2 gap-2">
              {userProfile?.isAuthor ? (
                <Link
                  href="/studio"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-primary/40 flex flex-col gap-1 transition-all"
                >
                  <PenTool size={18} className="text-primary" />
                  <span className="font-bold text-xs text-white">Yazar Stüdyosu</span>
                  <span className="text-[10px] text-zinc-400">Yeni Bölüm Yaz</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onBecomeAuthor) onBecomeAuthor();
                  }}
                  className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-primary/40 flex flex-col text-left gap-1 transition-all"
                >
                  <PenTool size={18} className="text-primary" />
                  <span className="font-bold text-xs text-white">Yazar Ol</span>
                  <span className="text-[10px] text-zinc-400">Hikayeni Paylaş</span>
                </button>
              )}

              <Link
                href="/arena"
                onClick={onClose}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 flex flex-col gap-1 transition-all"
              >
                <Swords size={18} className="text-amber-400" />
                <span className="font-bold text-xs text-white">Arena</span>
                <span className="text-[10px] text-zinc-400">Haftalık Düellolar</span>
              </Link>
            </div>
          )}

          {/* Menü Link Grupları */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 block mb-2">
              Keşif & Topluluk
            </span>

            <Link
              href="/agenda"
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === '/agenda' ? 'bg-primary/10 text-primary font-bold' : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame size={17} className="text-primary" />
                <span>Gündem & Trendler</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </Link>

            <Link
              href="/news"
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === '/news' ? 'bg-primary/10 text-primary font-bold' : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Newspaper size={17} className="text-primary" />
                <span>Duyurular & Haberler</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </Link>

            <Link
              href="/reviews"
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === '/reviews' ? 'bg-primary/10 text-primary font-bold' : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award size={17} className="text-primary" />
                <span>Editöryel İncelemeler</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 block mb-2">
              Genel & Ayarlar
            </span>

            <Link
              href="/settings"
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === '/settings' ? 'bg-primary/10 text-primary font-bold' : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={17} className="text-zinc-400" />
                <span>Hesap & Bildirim Ayarları</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </Link>

            <Link
              href="/support"
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === '/support' ? 'bg-primary/10 text-primary font-bold' : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LifeBuoy size={17} className="text-zinc-400" />
                <span>Yardım & Destek</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </Link>

            <Link
              href="/about"
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === '/about' ? 'bg-primary/10 text-primary font-bold' : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Info size={17} className="text-zinc-400" />
                <span>Hakkımızda</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </Link>

            {/* Yetkili Panelleri */}
            {userProfile?.isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={17} />
                  <span>Admin Kontrol Paneli</span>
                </div>
                <ChevronRight size={14} className="text-amber-500/50" />
              </Link>
            )}

            {(userProfile?.isEditor || userProfile?.isAdmin) && (
              <Link
                href="/editor"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={17} />
                  <span>Editör Paneli</span>
                </div>
                <ChevronRight size={14} className="text-emerald-500/50" />
              </Link>
            )}
          </div>
        </div>

        {/* Alt Kısım: Çıkış Butonu & Sürüm Bilgisi */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {firebaseUser && (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition-colors"
            >
              <LogOut size={15} />
              <span>Oturumu Kapat</span>
            </button>
          )}

          <div className="text-center">
            <span className="text-[10px] text-zinc-500 font-mono">
              Readixon App v1.0.0
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
