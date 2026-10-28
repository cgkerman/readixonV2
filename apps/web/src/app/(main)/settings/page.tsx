"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { 
  useThemeStore, 
  Theme, 
  useAuthStore, 
  deleteUserAccount, 
  defaultCustomColors, 
  CustomColors, 
  isColorDark,
  useReaderStore,
  ReaderTheme,
  ReaderFontFamily,
  ReaderLineHeight,
  ReaderTextAlign,
  ReaderPaddingX,
  updateUserPreferences,
  sendVerificationEmail,
  sendPasswordReset,
  signOut,
  unblockUser,
  getUserProfile,
  type User,
  type NotificationPreferences,
  type PrivacyPreferences,
  type WriterPreferences,
} from '@readixon/core';
import { 
  Settings, 
  User as UserIcon, 
  BookOpen, 
  Palette, 
  Bell, 
  Shield, 
  PenTool, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Sun, 
  Moon, 
  LogOut, 
  Mail, 
  KeyRound, 
  Sliders, 
  Save, 
  UserX, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  AlignLeft, 
  AlignJustify, 
  Minus, 
  Plus, 
  RefreshCw,
  Eye,
  FileText,
  Layout,
  ExternalLink,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Sabitler & Temalar
// ─────────────────────────────────────────────

type SettingsTabId = 'account' | 'reader' | 'appearance' | 'notifications' | 'privacy' | 'writer' | 'danger';

interface SettingsTabConfig {
  id: SettingsTabId;
  name: string;
  shortName: string;
  icon: any;
  description: string;
  color?: string;
}

const SETTINGS_TABS: SettingsTabConfig[] = [
  { 
    id: 'account', 
    name: 'Hesap & Güvenlik', 
    shortName: 'Hesap', 
    icon: UserIcon, 
    description: 'Profil bilgileri, e-posta doğrulaması ve oturum yönetimi' 
  },
  { 
    id: 'reader', 
    name: 'Okuma Deneyimi', 
    shortName: 'Okuma', 
    icon: BookOpen, 
    description: 'Yazı tipi, punto, satır aralığı ve varsayılan okuma stili' 
  },
  { 
    id: 'appearance', 
    name: 'Görünüm & Tema', 
    shortName: 'Görünüm', 
    icon: Palette, 
    description: 'Koyu mod, açık mod ve özel renk paletleri' 
  },
  { 
    id: 'notifications', 
    name: 'Bildirim Tercihleri', 
    shortName: 'Bildirimler', 
    icon: Bell, 
    description: 'Yeni bölüm, etkileşim, kulüp ve başarım bildirimleri' 
  },
  { 
    id: 'privacy', 
    name: 'Gizlilik & İçerik', 
    shortName: 'Gizlilik', 
    icon: Shield, 
    description: '+18 filtresi, kütüphane görünürlüğü ve engellenenler' 
  },
  { 
    id: 'writer', 
    name: 'Yazar & Stüdyo', 
    shortName: 'Yazar', 
    icon: PenTool, 
    description: 'Varsayılan editör modu, otomatik kaydetme ve yazar notu' 
  },
  { 
    id: 'danger', 
    name: 'Tehlikeli Bölge', 
    shortName: 'Hesap Sil', 
    icon: AlertTriangle, 
    description: 'Kalıcı hesap ve veri silme işlemleri', 
    color: 'text-red-500' 
  },
];

const themes: { id: Theme; name: string; colors: string[] }[] = [
  { id: 'theme-1', name: 'Tema 1 (Siber Gece)', colors: ['#0D1117', '#161B22', '#00E5FF', '#C9D1D9'] },
  { id: 'theme-2', name: 'Tema 2 (Sıcak Toprak)', colors: ['#FAFAFA', '#F3F0EA', '#D97757', '#2D2824'] },
  { id: 'theme-3', name: 'Tema 3 (Premium Minimal)', colors: ['#000000', '#0A0A0A', '#FFFFFF', '#FAFAFA'] },
  { id: 'theme-4', name: 'Tema 4 (Pembe Altın)', colors: ['#FFF5F5', '#FFE4E6', '#E11D48', '#4C0519'] },
  { id: 'theme-5', name: 'Tema 5 (Gece Mavisi)', colors: ['#0A192F', '#112240', '#64FFDA', '#CCD6F6'] },
  { id: 'theme-6', name: 'Tema 6 (Adaçayı)', colors: ['#F4F5F0', '#E9EBE4', '#2D5A27', '#1E2920'] },
  { id: 'theme-7', name: 'Tema 7 (Yazar Moru)', colors: ['#FAFAFA', '#FFFFFF', '#6366F1', '#1E293B'] },
];

// ─────────────────────────────────────────────
// Yardımcı Bileşenler
// ─────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
  badge?: string;
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  badge
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/30 last:border-b-0 transition-colors">
      <div className="flex-1 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">{label}</span>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-primary' : 'bg-muted/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Ana Ayarlar Sayfası
// ─────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, customColors } = useThemeStore();
  const { userProfile, firebaseUser, isInitialized, setUserProfile, clearAuth } = useAuthStore();
  
  // Aktif Sekme Durumu
  const [activeTab, setActiveTab] = useState<SettingsTabId>('account');

  // Okuma Store Durumu
  const readerStore = useReaderStore();

  // Hesap Güvenliği Durumları
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Engellenen Kullanıcılar Listesi
  const [blockedUserProfiles, setBlockedUserProfiles] = useState<User[]>([]);
  const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(false);

  // Yazar Ayarları Formu
  const [writerForm, setWriterForm] = useState<WriterPreferences>({
    defaultEditor: userProfile?.preferences?.writer?.defaultEditor || 'free',
    autoSaveIntervalSeconds: userProfile?.preferences?.writer?.autoSaveIntervalSeconds || 60,
    defaultAuthorNote: userProfile?.preferences?.writer?.defaultAuthorNote || '',
  });
  const [isSavingWriterPrefs, setIsSavingWriterPrefs] = useState(false);

  // Tehlikeli Bölge (Hesap Silme)
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Özel Tema Modalı
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customColorsInput, setCustomColorsInput] = useState<CustomColors>(
    customColors || defaultCustomColors
  );

  const hasThemeAccess = Boolean(userProfile?.isAdmin || userProfile?.status === 'premium' || userProfile?.status === 'pro');

  // Oturum Kontrolü
  useEffect(() => {
    if (isInitialized && !firebaseUser) {
      router.replace('/login');
    }
  }, [firebaseUser, isInitialized, router]);

  // Profil değiştikçe Yazar Ayarları Formunu Senkronize Et
  useEffect(() => {
    if (userProfile?.preferences?.writer) {
      setWriterForm({
        defaultEditor: userProfile.preferences.writer.defaultEditor || 'free',
        autoSaveIntervalSeconds: userProfile.preferences.writer.autoSaveIntervalSeconds || 60,
        defaultAuthorNote: userProfile.preferences.writer.defaultAuthorNote || '',
      });
    }
  }, [userProfile?.preferences?.writer]);

  // Engellenen Kullanıcıları Çek
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      const blockedIds = userProfile?.blockedUsers || [];
      if (blockedIds.length === 0) {
        setBlockedUserProfiles([]);
        return;
      }

      setLoadingBlockedUsers(true);
      try {
        const profiles = await Promise.all(
          blockedIds.map(uid => getUserProfile(uid))
        );
        setBlockedUserProfiles(profiles.filter((p): p is User => p !== null));
      } catch (err) {
        console.error("Engellenen kullanıcılar getirilemedi:", err);
      } finally {
        setLoadingBlockedUsers(false);
      }
    };

    if (activeTab === 'privacy') {
      fetchBlockedUsers();
    }
  }, [activeTab, userProfile?.blockedUsers]);

  // ─────────────────────────────────────────────
  // Handler Fonksiyonları
  // ─────────────────────────────────────────────

  // E-posta Doğrulama Gönder
  const handleSendVerification = async () => {
    if (!firebaseUser) return;
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail(firebaseUser);
      toast.success("Doğrulama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Doğrulama e-postası gönderilemedi. Lütfen biraz sonra tekrar deneyin.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Şifre Sıfırlama Gönder
  const handleSendPasswordReset = async () => {
    if (!firebaseUser?.email) {
      toast.error("Hesabınıza tanımlı geçerli bir e-posta adresi bulunamadı.");
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordReset(firebaseUser.email);
      toast.success(`Şifre sıfırlama bağlantısı ${firebaseUser.email} adresine gönderildi.`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Şifre sıfırlama bağlantısı gönderilemedi.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Güvenli Çıkış Yap
  const handleSignOut = async () => {
    try {
      await signOut();
      clearAuth();
      toast.success("Oturumunuz güvenli bir şekilde kapatıldı.");
      router.replace('/login');
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };

  // Okuma Ayarı Değiştir ve Bulutla Senkronize Et
  const handleUpdateReaderPref = async (key: keyof typeof readerStore, value: any) => {
    if (!firebaseUser || !userProfile) return;

    // Bulut tercihlerine yaz
    const updatedReader = {
      ...(userProfile.preferences?.reader || {}),
      theme: readerStore.theme,
      fontSize: readerStore.fontSize,
      fontFamily: readerStore.fontFamily,
      lineHeight: readerStore.lineHeight,
      textAlign: readerStore.textAlign,
      paddingX: readerStore.paddingX,
      [key]: value
    };

    const updatedPreferences = {
      ...(userProfile.preferences || {}),
      reader: updatedReader
    };

    setUserProfile({ ...userProfile, preferences: updatedPreferences });

    try {
      await updateUserPreferences(firebaseUser.uid, { reader: updatedReader });
    } catch (e) {
      console.error("Okuma tercihleri kaydedilemedi:", e);
    }
  };

  // Bildirim Toggle
  const handleToggleNotification = async (key: keyof NotificationPreferences) => {
    if (!firebaseUser || !userProfile) return;

    const currentVal = userProfile.preferences?.notifications?.[key] ?? true;
    const nextVal = !currentVal;

    const updatedNotifications: Partial<NotificationPreferences> = {
      ...(userProfile.preferences?.notifications || {}),
      [key]: nextVal
    };

    const updatedPreferences = {
      ...(userProfile.preferences || {}),
      notifications: updatedNotifications
    };

    setUserProfile({ ...userProfile, preferences: updatedPreferences });

    try {
      await updateUserPreferences(firebaseUser.uid, { notifications: updatedNotifications });
      toast.success("Bildirim tercihi güncellendi");
    } catch (e) {
      toast.error("Ayar kaydedilemedi");
    }
  };

  // Gizlilik Toggle
  const handleTogglePrivacy = async (key: keyof PrivacyPreferences, defaultVal: boolean) => {
    if (!firebaseUser || !userProfile) return;

    const currentVal = userProfile.preferences?.privacy?.[key] ?? defaultVal;
    const nextVal = !currentVal;

    const updatedPrivacy: Partial<PrivacyPreferences> = {
      ...(userProfile.preferences?.privacy || {}),
      [key]: nextVal
    };

    const updatedPreferences = {
      ...(userProfile.preferences || {}),
      privacy: updatedPrivacy
    };

    setUserProfile({ ...userProfile, preferences: updatedPreferences });

    try {
      await updateUserPreferences(firebaseUser.uid, { privacy: updatedPrivacy });
      toast.success("Gizlilik ayarı güncellendi");
    } catch (e) {
      toast.error("Ayar kaydedilemedi");
    }
  };

  // Engeli Kaldır
  const handleUnblockUser = async (targetUid: string) => {
    if (!firebaseUser || !userProfile) return;

    try {
      await unblockUser(firebaseUser.uid, targetUid);
      const newBlockedList = (userProfile.blockedUsers || []).filter(id => id !== targetUid);
      setUserProfile({ ...userProfile, blockedUsers: newBlockedList });
      setBlockedUserProfiles(prev => prev.filter(p => p.uid !== targetUid));
      toast.success("Kullanıcının engeli kaldırıldı");
    } catch (error) {
      toast.error("Engel kaldırılırken bir hata oluştu");
    }
  };

  // Yazar Ayarlarını Kaydet
  const handleSaveWriterPrefs = async () => {
    if (!firebaseUser || !userProfile) return;

    setIsSavingWriterPrefs(true);
    const updatedPreferences = {
      ...(userProfile.preferences || {}),
      writer: writerForm
    };

    setUserProfile({ ...userProfile, preferences: updatedPreferences });

    try {
      await updateUserPreferences(firebaseUser.uid, { writer: writerForm });
      toast.success("Yazar ve stüdyo tercihleri kaydedildi");
    } catch (e) {
      toast.error("Yazar tercihleri kaydedilemedi");
    } finally {
      setIsSavingWriterPrefs(false);
    }
  };

  // Özel Tema Kaydet
  const handleSaveCustomTheme = () => {
    const isDarkBg = isColorDark(customColorsInput.background);
    const finalColors: CustomColors = {
      ...customColorsInput,
      border: customColorsInput.border || (isDarkBg ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
      muted: customColorsInput.muted || (isDarkBg ? '#94A3B8' : '#64748B'),
    };
    useThemeStore.getState().setCustomColors(finalColors);
    setTheme('custom');
    setIsCustomModalOpen(false);
    toast.success("Özel tema uygulandı");
  };

  // Kalıcı Hesap Silme
  const handleDeleteAccount = async () => {
    const confirmedText = deleteConfirmation.trim().toLowerCase();
    const expectedUsername = userProfile?.username?.toLowerCase();
    const expectedEmail = firebaseUser?.email?.toLowerCase();

    if (
      confirmedText !== expectedUsername && 
      confirmedText !== expectedEmail && 
      confirmedText !== `@${expectedUsername}`
    ) {
      toast.error("Lütfen onay için kullanıcı adınızı veya e-posta adresinizi doğru girin.");
      return;
    }

    if (confirm("Bu işlem geri alınamaz! Hesabınız, paylaşımlarınız, kitaplarınız ve tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?")) {
      setIsDeleting(true);
      const success = await deleteUserAccount();
      setIsDeleting(false);
      
      if (success) {
        toast.success("Hesabınız ve tüm verileriniz başarıyla silindi. Hoşça kalın!");
        router.push('/');
      } else {
        toast.error("Hesap silinirken bir hata oluştu. Lütfen tekrar giriş yapıp tekrar deneyin.");
      }
    }
  };

  // Okuma Önizleme Stilleri
  const readerPreviewClasses = useMemo(() => {
    const fontClass = 
      readerStore.fontFamily === 'serif' ? 'font-serif' :
      readerStore.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

    const leadingClass =
      readerStore.lineHeight === 'tight' ? 'leading-snug' :
      readerStore.lineHeight === 'relaxed' ? 'leading-loose' : 'leading-relaxed';

    const alignClass = readerStore.textAlign === 'justify' ? 'text-justify' : 'text-left';

    const themeClass =
      readerStore.theme === 'sepia' ? 'bg-[#fbf0d9] text-[#5f4b32] border-[#ecd8b0]' :
      readerStore.theme === 'dark' ? 'bg-[#18181b] text-[#f4f4f5] border-zinc-700' :
      readerStore.theme === 'oled' ? 'bg-black text-white border-zinc-800' :
      'bg-white text-zinc-900 border-zinc-200';

    return { fontClass, leadingClass, alignClass, themeClass };
  }, [readerStore.fontFamily, readerStore.lineHeight, readerStore.textAlign, readerStore.theme]);

  // Üyelik Durumu Etiketi
  const membershipBadge = useMemo(() => {
    if (userProfile?.isAdmin) return { label: 'Yönetici', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    if (userProfile?.status === 'pro') return { label: 'PRO Yazar', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    if (userProfile?.status === 'premium') return { label: 'Premium Üye', color: 'bg-primary/10 text-primary border-primary/20' };
    return { label: 'Standart Üye', color: 'bg-muted/30 text-muted-foreground border-border/40' };
  }, [userProfile?.isAdmin, userProfile?.status]);

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-32">
      {/* ── Üst Başlık & Açıklama ── */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <Settings size={22} />
          </div>
          <div>
            <Typography variant="h1" className="font-extrabold text-2xl sm:text-3xl tracking-tight text-foreground">
              Ayarlar
            </Typography>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Hesap, okuma deneyimi, görünüm ve gizlilik tercihlerinizi kişiselleştirin.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobil & Tablet Yatay Kaydırılabilir Sekmeler (Tabs) ── */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none flex items-center gap-2 pb-2">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }`}
            >
              <Icon size={15} className={tab.color || ''} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── İki Sütunlu Düzen: Sol Kenar Menüsü & Sağ İçerik Alanı ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sol Kenar Menüsü (Masaüstü) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-6">
          <div className="bg-card border border-border/60 rounded-3xl p-3 shadow-sm space-y-1">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left group ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-muted-foreground group-hover:text-foreground'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="text-sm block leading-tight">{tab.name}</span>
                      <span className="text-[11px] text-muted-foreground/80 line-clamp-1 block mt-0.5 font-normal">
                        {tab.shortName}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-primary translate-x-0.5' : 'text-muted-foreground/40 group-hover:text-foreground'}`} />
                </button>
              );
            })}
          </div>

          {/* Hızlı Çıkış Butonu */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-2xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer active:scale-98"
          >
            <LogOut size={16} />
            <span>Oturumu Kapat</span>
          </button>
        </aside>

        {/* Sağ İçerik Paneli */}
        <div className="lg:col-span-8 space-y-6">
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: HESAP & GÜVENLİK */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profil Kimlik Kartı */}
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/30">
                  <div className="flex items-center gap-4">
                    {userProfile?.avatarUrl ? (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.displayName} 
                        className="w-16 h-16 rounded-2xl object-cover border border-border/60 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-sm">
                        {userProfile?.displayName?.charAt(0) || userProfile?.username?.charAt(0) || 'R'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                          {userProfile?.displayName || 'İsimsiz Okur'}
                        </h2>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${membershipBadge.color}`}>
                          {membershipBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        @{userProfile?.username || 'kullanici'}
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        {firebaseUser?.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/profile/${userProfile?.username || ''}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/60 hover:bg-muted/15 text-xs font-bold text-foreground transition-all shrink-0 active:scale-95"
                  >
                    <span>Profili Gör</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

                {/* E-posta Doğrulama Durumu */}
                <div className="py-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      firebaseUser?.emailVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {firebaseUser?.emailVerified ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground block">
                        E-posta Doğrulaması
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {firebaseUser?.emailVerified 
                          ? 'E-posta adresiniz başarıyla doğrulandı ve hesabınız güvende.' 
                          : 'Yazarlık başvurusu ve hesap güvenliğiniz için e-postanızı doğrulamanız önerilir.'}
                      </p>
                    </div>
                  </div>

                  {!firebaseUser?.emailVerified && (
                    <Button
                      variant="secondary"
                      onPress={handleSendVerification}
                      disabled={isSendingVerification}
                      className="text-xs font-bold shrink-0"
                    >
                      {isSendingVerification ? 'Gönderiliyor...' : 'Doğrulama Gönder'}
                    </Button>
                  )}
                </div>

                {/* Şifre Sıfırlama */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground block">
                        Şifre Yönetimi
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Şifrenizi yenilemek için kayıtlı e-postanıza güvenli bir bağlantı isteyebilirsiniz.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    onPress={handleSendPasswordReset}
                    disabled={isSendingReset}
                    className="text-xs font-bold shrink-0"
                  >
                    {isSendingReset ? 'Gönderiliyor...' : 'Şifre Sıfırla'}
                  </Button>
                </div>
              </section>

              {/* Oturum Sonlandırma (Mobilde de erişilebilir) */}
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Oturumu Kapat</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bu cihazdaki aktif oturumunuzu güvenli bir biçimde sonlandırın.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onPress={handleSignOut}
                  className="text-xs font-bold text-red-500 border-red-500/20 hover:bg-red-500/10"
                >
                  <LogOut size={14} className="mr-1.5" /> Çıkış Yap
                </Button>
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: OKUMA DENEYİMİ */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'reader' && (
            <div className="space-y-6">
              {/* Canlı Okuma Önizleme Kutusu */}
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Canlı Önizleme</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Aşağıdaki ayarlar tüm kitaplarda geçerli olacaktır
                  </span>
                </div>

                {/* Simüle Edilen Okuma Sayfası */}
                <div 
                  className={`p-6 rounded-2xl border transition-all duration-300 shadow-inner ${readerPreviewClasses.themeClass} ${readerPreviewClasses.fontClass} ${readerPreviewClasses.leadingClass} ${readerPreviewClasses.alignClass}`}
                  style={{ fontSize: `${readerStore.fontSize}px` }}
                >
                  <p className="mb-3 font-semibold opacity-60 text-xs tracking-wider uppercase">
                    Bölüm 1: Yıldızların Sessizliği
                  </p>
                  <p>
                    Gecenin derin sessizliğini yalnızca eski daktilonun mekanik vuruşları bozuyordu. Mürekkebin sararmış sayfalarla buluştuğu o büyülü anda zaman sanki durmuş, dökülen her harf bilinmeyen yeni bir kurgusal evrenin kapılarını aralıyordu...
                  </p>
                </div>
              </section>

              {/* Okuma Tema ve Font Ayarları */}
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
                {/* 1. Okuma Teması */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                    Varsayılan Okuma Teması
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'light', name: 'Açık Kağıt', bg: 'bg-white', text: 'text-zinc-900', border: 'border-zinc-300' },
                      { id: 'sepia', name: 'Sepia (Sarı)', bg: 'bg-[#fbf0d9]', text: 'text-[#5f4b32]', border: 'border-[#ecd8b0]' },
                      { id: 'dark', name: 'Gece Modu', bg: 'bg-[#18181b]', text: 'text-[#f4f4f5]', border: 'border-zinc-700' },
                      { id: 'oled', name: 'OLED Siyah', bg: 'bg-black', text: 'text-white', border: 'border-zinc-800' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          readerStore.setTheme(t.id as ReaderTheme);
                          handleUpdateReaderPref('theme', t.id);
                        }}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${t.bg} ${t.text} ${
                          readerStore.theme === t.id ? 'border-primary shadow-md scale-102' : `${t.border} opacity-80 hover:opacity-100`
                        }`}
                      >
                        <span className="text-xs font-extrabold">{t.name}</span>
                        {readerStore.theme === t.id && (
                          <CheckCircle2 size={16} className="text-primary fill-primary/10" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Yazı Tipi (Font Family) */}
                <div className="pt-4 border-t border-border/30">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                    Yazı Tipi (Font)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'sans', name: 'Modern Sans', styleClass: 'font-sans' },
                      { id: 'serif', name: 'Edebi Serif', styleClass: 'font-serif' },
                      { id: 'mono', name: 'Daktilo Mono', styleClass: 'font-mono' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          readerStore.setFontFamily(f.id as ReaderFontFamily);
                          handleUpdateReaderPref('fontFamily', f.id);
                        }}
                        className={`p-3 rounded-2xl border transition-all text-center cursor-pointer active:scale-95 ${
                          readerStore.fontFamily === f.id
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                            : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/10'
                        }`}
                      >
                        <span className={`text-base block mb-0.5 ${f.styleClass}`}>Aa</span>
                        <span className="text-xs font-medium">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Yazı Boyutu (Punto) */}
                <div className="pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Yazı Boyutu (Punto)
                    </label>
                    <span className="text-sm font-black text-primary px-2.5 py-0.5 rounded-lg bg-primary/10">
                      {readerStore.fontSize} px
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(14, readerStore.fontSize - 1);
                        readerStore.setFontSize(next);
                        handleUpdateReaderPref('fontSize', next);
                      }}
                      className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center text-foreground hover:bg-muted/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Minus size={18} />
                    </button>

                    <input
                      type="range"
                      min={14}
                      max={26}
                      step={1}
                      value={readerStore.fontSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        readerStore.setFontSize(val);
                        handleUpdateReaderPref('fontSize', val);
                      }}
                      className="flex-1 accent-primary cursor-pointer h-2 bg-muted/40 rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(26, readerStore.fontSize + 1);
                        readerStore.setFontSize(next);
                        handleUpdateReaderPref('fontSize', next);
                      }}
                      className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center text-foreground hover:bg-muted/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* 4. Satır Aralığı ve Hizalama */}
                <div className="pt-4 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Satır Aralığı */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Satır Aralığı
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'tight', name: 'Sıkışık' },
                        { id: 'normal', name: 'Normal' },
                        { id: 'relaxed', name: 'Ferah' },
                      ].map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            readerStore.setLineHeight(l.id as ReaderLineHeight);
                            handleUpdateReaderPref('lineHeight', l.id);
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all active:scale-95 ${
                            readerStore.lineHeight === l.id
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metin Hizalama */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Hizalama
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'left', name: 'Sola Yaslı', icon: AlignLeft },
                        { id: 'justify', name: 'İki Yana', icon: AlignJustify },
                      ].map((a) => {
                        const Icon = a.icon;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              readerStore.setTextAlign(a.id as ReaderTextAlign);
                              handleUpdateReaderPref('textAlign', a.id);
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                              readerStore.textAlign === a.id
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Icon size={14} />
                            <span>{a.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: GÖRÜNÜM & TEMA */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-foreground">Standart Görünüm</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Platformun genel arayüz rengini belirleyin.
                  </p>
                </div>

                {/* Açık ve Koyu Mod Kartları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div
                    onClick={() => setTheme('light')}
                    className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 flex items-center gap-3.5 ${
                      theme === 'light' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/60 hover:border-primary/50 text-foreground'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme === 'light' ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                      <Sun size={20} />
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold">Açık Tema (Varsayılan)</Typography>
                      <Typography variant="caption" className="text-muted block text-xs">Aydınlık ve ferah görünüm</Typography>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute top-4 right-4 text-primary">
                        <CheckCircle2 size={20} className="fill-primary/20" />
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setTheme('dark')}
                    className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 flex items-center gap-3.5 ${
                      theme === 'dark' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/60 hover:border-primary/50 text-foreground'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                      <Moon size={20} />
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold">Koyu Tema</Typography>
                      <Typography variant="caption" className="text-muted block text-xs">Göz yormayan karanlık görünüm</Typography>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute top-4 right-4 text-primary">
                        <CheckCircle2 size={20} className="fill-primary/20" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Özel Renk Paletleri (Premium) */}
                <div className="pt-6 border-t border-border/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Özel Renk Paletleri</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Platformun her detayını sanatsal renk kombinasyonlarıyla süsleyin.
                      </p>
                    </div>
                    {!hasThemeAccess && (
                      <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-300 ${!hasThemeAccess ? 'opacity-30 pointer-events-none blur-[2px]' : ''}`}>
                      {themes.map((t) => (
                        <div 
                          key={t.id} 
                          onClick={() => setTheme(t.id)}
                          className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 ${
                            theme === t.id ? 'border-primary bg-primary/5 shadow-xs' : 'border-border/60 hover:border-primary/50'
                          }`}
                        >
                          {theme === t.id && (
                            <div className="absolute top-3 right-3 text-primary">
                              <CheckCircle2 size={18} className="fill-primary/20" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-foreground block mb-2">{t.name}</span>
                          <div className="flex gap-1.5">
                            {t.colors.map((color, idx) => (
                              <div 
                                key={idx} 
                                className="w-6 h-6 rounded-full shadow-xs border border-black/10" 
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Özel Tema Butonu */}
                      <div 
                        onClick={() => setIsCustomModalOpen(true)}
                        className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center ${
                          theme === 'custom' ? 'border-primary bg-primary/5 text-primary' : 'border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {theme === 'custom' && (
                          <div className="absolute top-3 right-3 text-primary">
                            <CheckCircle2 size={18} className="fill-primary/20" />
                          </div>
                        )}
                        <span className="text-xl mb-1">🎨</span>
                        <span className="text-xs font-bold">Kendi Temanı Yarat</span>
                      </div>
                    </div>

                    {!hasThemeAccess && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-card/60 backdrop-blur-xs rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-3 shadow-md shadow-amber-500/10">
                          <Lock size={24} />
                        </div>
                        <h4 className="font-extrabold text-base text-foreground mb-1">
                          Özel Renk Paletleri
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                          7 özel paleti kullanmak ve platformu istediğiniz renklere bürümek için Premium üyeliğe geçin.
                        </p>
                        <Button 
                          variant="primary" 
                          onPress={() => router.push('/premium')}
                          className="px-6 py-2 text-xs font-bold"
                        >
                          Premium'a Geç
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: BİLDİRİM TERCİHLERİ */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-foreground">Etkileşim ve Okuma Bildirimleri</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hangi durumlarda anlık veya e-posta bildirimleri almak istediğinizi yönetin.
                  </p>
                </div>

                <div className="space-y-1">
                  <ToggleSwitch
                    label="Yeni Bölüm Bildirimleri"
                    description="Kütüphanenizde yer alan veya takip ettiğiniz yazarlar yeni bir bölüm yayınladığında haber verilir."
                    checked={userProfile?.preferences?.notifications?.newChapters ?? true}
                    onChange={() => handleToggleNotification('newChapters')}
                  />

                  <ToggleSwitch
                    label="Yorum ve Beğeni Bildirimleri"
                    description="Hikayelerinize, bölümlerinize veya readix gönderilerinize yorum ya da beğeni geldiğinde haber verilir."
                    checked={userProfile?.preferences?.notifications?.commentsAndLikes ?? true}
                    onChange={() => handleToggleNotification('commentsAndLikes')}
                  />

                  <ToggleSwitch
                    label="Kulüp ve Tartışma Bildirimleri"
                    description="Üyesi olduğunuz edebi kulüplerde yeni bir etkinlik veya mesaj paylaşıldığında haber verilir."
                    checked={userProfile?.preferences?.notifications?.clubActivity ?? true}
                    onChange={() => handleToggleNotification('clubActivity')}
                  />

                  <ToggleSwitch
                    label="Başarım ve Rozet Bildirimleri"
                    description="Platformda yeni bir edebi rozet kazandığınızda veya seviye atladığınızda kutlama bildirimi alırsınız."
                    checked={userProfile?.preferences?.notifications?.badgesAndAchievements ?? true}
                    onChange={() => handleToggleNotification('badgesAndAchievements')}
                  />

                  <ToggleSwitch
                    label="Haftalık Edebi Bülten & E-posta Özeti"
                    description="Readixon editörlerinin haftalık seçtiği öne çıkan hikayeler ve size özel öneriler e-posta ile iletilir."
                    checked={userProfile?.preferences?.notifications?.emailDigest ?? false}
                    onChange={() => handleToggleNotification('emailDigest')}
                  />
                </div>
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: GİZLİLİK & İÇERİK */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* İçerik ve Profil Görünürlüğü */}
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-foreground">İçerik Filtreleri ve Profil Gizliliği</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Okuma tercihleriniz ve profilinizin topluluğa nasıl yansıyacağını belirleyin.
                  </p>
                </div>

                <div className="space-y-1">
                  <ToggleSwitch
                    label="+18 / Yetişkin İçerik Filtresi"
                    description="Açık olduğunda hassas temalı ve yetişkinlere yönelik kurgusal hikayeler Keşfet ve aramalarda listelenir."
                    checked={userProfile?.preferences?.privacy?.allowAdultContent ?? false}
                    onChange={() => handleTogglePrivacy('allowAdultContent', false)}
                    badge={userProfile?.preferences?.privacy?.allowAdultContent ? 'Filtre Kapalı (+18 Açık)' : 'Korumalı'}
                  />

                  <ToggleSwitch
                    label="Kütüphane Görünürlüğü"
                    description="Profilinizi ziyaret eden diğer okuyucular kütüphanenizdeki kitapları ve okuma listelerinizi görebilir."
                    checked={userProfile?.preferences?.privacy?.isLibraryPublic ?? true}
                    onChange={() => handleTogglePrivacy('isLibraryPublic', true)}
                  />

                  <ToggleSwitch
                    label="Okuma Aktiviteleri Paylaşımı"
                    description="Bitirdiğiniz bölümler ve edebi rozetler topluluk akışında arkadaşlarınızla paylaşılır."
                    checked={userProfile?.preferences?.privacy?.showReadingActivity ?? true}
                    onChange={() => handleTogglePrivacy('showReadingActivity', true)}
                  />
                </div>
              </section>

              {/* Engellenen Kullanıcılar Listesi */}
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Engellenen Kullanıcılar</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Engellediğiniz kullanıcılar sizinle etkileşime giremez ve paylaşımları akışınızda görünmez.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted/20 border border-border/40">
                    {userProfile?.blockedUsers?.length || 0} Kişi
                  </span>
                </div>

                {loadingBlockedUsers ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Yükleniyor...
                  </div>
                ) : blockedUserProfiles.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {blockedUserProfiles.map((bUser) => (
                      <div key={bUser.uid} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {bUser.avatarUrl ? (
                            <img src={bUser.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center font-bold text-xs text-muted-foreground">
                              {bUser.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-bold text-foreground block leading-none">
                              {bUser.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              @{bUser.username}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          onPress={() => handleUnblockUser(bUser.uid)}
                          className="text-xs font-bold text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                        >
                          Engeli Kaldır
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-muted/5 rounded-2xl border border-dashed border-border/40">
                    <ShieldCheck size={28} className="mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">
                      Engellediğiniz herhangi bir kullanıcı bulunmuyor.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 6: YAZAR & STÜDYO */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'writer' && (
            <div className="space-y-6">
              <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Yazar Stüdyosu Tercihleri</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bölüm yazma ve kurgu stüdyosundaki varsayılan çalışma ortamınızı yapılandırın.
                  </p>
                </div>

                {/* 1. Varsayılan Editör Tipi */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                    Varsayılan Yazım Editörü
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWriterForm(prev => ({ ...prev, defaultEditor: 'free' }))}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all active:scale-98 ${
                        writerForm.defaultEditor === 'free'
                          ? 'bg-primary/10 border-primary text-primary shadow-xs'
                          : 'bg-card border-border/60 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FileText size={20} className={writerForm.defaultEditor === 'free' ? 'text-primary' : 'text-muted-foreground'} />
                        {writerForm.defaultEditor === 'free' && (
                          <CheckCircle2 size={18} className="text-primary fill-primary/20" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground block">Serbest Yazım Editörü</span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Klasik Word/Docs tarzı, pürüzsüz ve minimalist odak modu. Uzun bölümler için ideal.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWriterForm(prev => ({ ...prev, defaultEditor: 'block' }))}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all active:scale-98 ${
                        writerForm.defaultEditor === 'block'
                          ? 'bg-primary/10 border-primary text-primary shadow-xs'
                          : 'bg-card border-border/60 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Layout size={20} className={writerForm.defaultEditor === 'block' ? 'text-primary' : 'text-muted-foreground'} />
                        {writerForm.defaultEditor === 'block' && (
                          <CheckCircle2 size={18} className="text-primary fill-primary/20" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground block">Blok Editör</span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Notion tarzı modüler bloklar, zengin kutular, alıntılar ve sürükle-bırak organizasyon.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Otomatik Kaydetme Sıklığı */}
                <div className="pt-4 border-t border-border/30">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                    Otomatik Kaydetme Sıklığı
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { seconds: 30, label: '30 Saniye', hint: 'Hızlı' },
                      { seconds: 60, label: '1 Dakika', hint: 'Önerilen' },
                      { seconds: 120, label: '2 Dakika', hint: 'Seyrek' },
                    ].map((item) => (
                      <button
                        key={item.seconds}
                        type="button"
                        onClick={() => setWriterForm(prev => ({ ...prev, autoSaveIntervalSeconds: item.seconds }))}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                          writerForm.autoSaveIntervalSeconds === item.seconds
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                            : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="text-sm block">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">{item.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Varsayılan Yazar Notu Şablonu */}
                <div className="pt-4 border-t border-border/30">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Bölüm Sonu Yazar Notu Şablonu
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Yeni bir bölüm oluşturduğunuzda yazar notu kutusuna otomatik doldurulacak standart metin.
                  </p>
                  <textarea
                    rows={3}
                    value={writerForm.defaultAuthorNote || ''}
                    onChange={(e) => setWriterForm(prev => ({ ...prev, defaultAuthorNote: e.target.value }))}
                    placeholder="Örnek: Bölümü okuduğunuz için teşekkür ederim! Düşüncelerinizi yorumlarda paylaşmayı ve oy vermeyi unutmayın..."
                    className="w-full bg-background border border-border/60 rounded-2xl p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Kaydet Butonu */}
                <div className="pt-4 border-t border-border/30 flex justify-end">
                  <Button
                    variant="primary"
                    onPress={handleSaveWriterPrefs}
                    disabled={isSavingWriterPrefs}
                    className="px-6 py-2.5 text-xs font-bold shadow-md shadow-primary/20"
                  >
                    <Save size={14} className="mr-2" />
                    {isSavingWriterPrefs ? 'Kaydediliyor...' : 'Yazar Tercihlerini Kaydet'}
                  </Button>
                </div>
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 7: TEHLİKELİ BÖLGE */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <section className="bg-red-950/10 border border-red-900/30 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-red-500" size={24} />
                  <Typography variant="h3" className="font-bold text-red-500">Tehlikeli Bölge</Typography>
                </div>
                
                <div className="bg-background border border-red-900/20 rounded-2xl p-5 sm:p-6">
                  <h4 className="text-base font-bold text-foreground mb-2">Hesabı Kalıcı Olarak Sil</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                    Hesabınızı sildiğinizde; profiliniz, kitaplarınız, bölümleriniz, readix paylaşımlarınız, rozetleriniz ve yorumlarınız <strong>kalıcı olarak</strong> silinir. Bu işlem hiçbir şekilde geri alınamaz.
                  </p>

                  <div className="max-w-md">
                    <label className="block text-xs font-medium mb-2 text-foreground/80">
                      Onaylamak için lütfen kullanıcı adınızı (<strong>{userProfile?.username || firebaseUser?.email}</strong>) yazın:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Kullanıcı adınız veya e-posta"
                      className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-red-500 mb-4 transition-colors"
                    />
                    <Button 
                      variant="primary" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 text-xs font-bold py-3"
                      onPress={handleDeleteAccount}
                      disabled={isDeleting || !deleteConfirmation}
                    >
                      <UserX size={16} className="mr-2" /> 
                      {isDeleting ? 'Siliniyor...' : 'Hesabımı ve Tüm Verilerimi Kalıcı Olarak Sil'}
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* ── Özel Tema Oluşturma Modalı ── */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-3xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h3" className="font-bold">Özel Tema Oluştur</Typography>
              <button 
                type="button"
                onClick={() => setIsCustomModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/10">
                <Typography variant="body" className="font-medium text-xs sm:text-sm">Arka Plan Rengi</Typography>
                <input type="color" value={customColorsInput.background} onChange={e => setCustomColorsInput({...customColorsInput, background: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/10">
                <Typography variant="body" className="font-medium text-xs sm:text-sm">Kart / Kutu Rengi</Typography>
                <input type="color" value={customColorsInput.card} onChange={e => setCustomColorsInput({...customColorsInput, card: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/10">
                <Typography variant="body" className="font-medium text-xs sm:text-sm">Metin Rengi</Typography>
                <input type="color" value={customColorsInput.text} onChange={e => setCustomColorsInput({...customColorsInput, text: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/10">
                <Typography variant="body" className="font-medium text-xs sm:text-sm">Ana Renk (Buton/İkon)</Typography>
                <input type="color" value={customColorsInput.primary} onChange={e => setCustomColorsInput({...customColorsInput, primary: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="secondary" className="px-4 text-xs font-bold" onPress={() => setCustomColorsInput(defaultCustomColors)}>Sıfırla</Button>
              <Button variant="secondary" className="flex-1 text-xs font-bold" onPress={() => setIsCustomModalOpen(false)}>İptal</Button>
              <Button variant="primary" className="flex-1 text-xs font-bold" onPress={handleSaveCustomTheme}>Uygula</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
