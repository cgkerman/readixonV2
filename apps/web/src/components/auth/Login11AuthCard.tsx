"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ExternalLink,
  Loader2,
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogleWeb,
  getAuthErrorMessage,
  useAuthStore,
  getUserByUsername,
  getUserProfile
} from '@readixon/core';
import './Login11AuthCard.css';

interface Login11AuthCardProps {
  initialView?: 'signin' | 'signup';
}

export default function Login11AuthCard({ initialView = 'signin' }: Login11AuthCardProps) {
  const router = useRouter();
  const { firebaseUser, isInitialized, setUserProfile } = useAuthStore();

  const [view, setView] = useState<'signin' | 'signup'>(initialView);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign Up State
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Giriş / Kayıt Sonrası Şık Hoş Geldin Durumu
  const [welcomeState, setWelcomeState] = useState<{
    name: string;
    isNew: boolean;
  } | null>(null);

  // Kullanıcının form gönderiminde olup olmadığını takip eden ref
  // Bu sayede Firebase auth state değiştiğinde useEffect erken tetiklenip 3 saniyelik karşılama ekranını kesmez!
  const isAuthenticatingRef = useRef(false);

  // Sadece kullanıcı zaten önceden oturum açmış olarak sayfaya doğrudan geldiyse feed'e yönlendir
  useEffect(() => {
    if (isInitialized && firebaseUser && !isAuthenticatingRef.current && !welcomeState) {
      router.replace('/feed');
    }
  }, [firebaseUser, isInitialized, router, welcomeState]);

  // Sekme değiştiğinde URL'i güncelle
  const switchView = (targetView: 'signin' | 'signup') => {
    setView(targetView);
    setLoginError('');
    setRegError('');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', targetView === 'signin' ? '/login' : '/register');
    }
  };

  // E-posta & Şifre ile Giriş
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('E-posta ve şifre boş bırakılamaz.');
      return;
    }

    setLoginError('');
    setLoginLoading(true);
    isAuthenticatingRef.current = true;

    try {
      const { user } = await signInWithEmail(loginEmail.trim(), loginPassword);
      
      // Hoş geldin ekranını ANINDA tetikle
      const fallbackName = user.displayName || loginEmail.split('@')[0] || 'Okur';
      setWelcomeState({ name: fallbackName, isNew: false });

      // Profili arka planda çekip store'a ve isme yansıt
      getUserProfile(user.uid).then((profile) => {
        if (profile) {
          setUserProfile(profile);
          const finalName = profile.displayName || profile.username;
          if (finalName) {
            setWelcomeState({ name: finalName, isNew: false });
          }
        }
      }).catch(() => {});

      // Tam 3 saniye sonra feed'e yönlendir
      setTimeout(() => {
        router.push('/feed');
      }, 3000);
    } catch (err: any) {
      isAuthenticatingRef.current = false;
      setLoginError(getAuthErrorMessage(err.code || ''));
      setLoginLoading(false);
    }
  };

  // E-posta ile Kayıt Ol
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTermsAccepted || !isPrivacyAccepted) {
      setRegError('Lütfen kayıt olmadan önce yasal sözleşmeleri onaylayın.');
      return;
    }

    if (!regDisplayName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Tüm alanları doldurmanız gerekmektedir.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(regUsername.trim())) {
      setRegError('Kullanıcı adı 3-20 karakter uzunluğunda olmalı; sadece harf, rakam ve alt çizgi içerebilir.');
      return;
    }

    setRegError('');
    setRegLoading(true);
    isAuthenticatingRef.current = true;

    try {
      const cleanUsername = regUsername.trim().toLowerCase();
      const existingUser = await getUserByUsername(cleanUsername);
      if (existingUser) {
        isAuthenticatingRef.current = false;
        setRegError('Bu kullanıcı adı daha önce alınmış. Lütfen farklı bir kullanıcı adı seçin.');
        setRegLoading(false);
        return;
      }

      const { user } = await signUpWithEmail(
        regEmail.trim(),
        regPassword,
        regDisplayName.trim(),
        cleanUsername
      );

      // Hoş geldin ekranını ANINDA tetikle
      setWelcomeState({ name: regDisplayName.trim() || cleanUsername, isNew: true });

      // Profili arka planda store'a aktar
      getUserProfile(user.uid).then((profile) => {
        if (profile) setUserProfile(profile);
      }).catch(() => {});

      // Tam 3 saniye sonra feed'e yönlendir
      setTimeout(() => {
        router.push('/feed');
      }, 3000);
    } catch (err: any) {
      isAuthenticatingRef.current = false;
      setRegError(getAuthErrorMessage(err.code || ''));
      setRegLoading(false);
    }
  };

  // Google ile Giriş / Kayıt
  const handleGoogleAuth = async () => {
    setLoginError('');
    setRegError('');
    setLoginLoading(true);
    setRegLoading(true);
    isAuthenticatingRef.current = true;

    try {
      const { user, isNewUser } = await signInWithGoogleWeb();

      const fallbackName = user.displayName || 'Okur';
      setWelcomeState({ name: fallbackName, isNew: isNewUser });

      getUserProfile(user.uid).then((profile) => {
        if (profile) {
          setUserProfile(profile);
          const finalName = profile.displayName || profile.username;
          if (finalName) {
            setWelcomeState({ name: finalName, isNew: isNewUser });
          }
        }
      }).catch(() => {});

      setTimeout(() => {
        router.push('/feed');
      }, 3000);
    } catch (err: any) {
      isAuthenticatingRef.current = false;
      const msg = getAuthErrorMessage(err.code || '');
      setLoginError(msg);
      setRegError(msg);
      setLoginLoading(false);
      setRegLoading(false);
    }
  };

  return (
    <div className="login11-wrapper">
      <div className={`login11-card ${view}`}>

        {/* 1. SOL DİKEY MENÜ / ÜST MOBİL MENÜ */}
        <nav className="login11-nav" aria-label="Kimlik Doğrulama Menüsü">
          <div className="login11-logo-container">
            <Link href="/" title="Readixon Ana Sayfasına Dön" className="hover:opacity-85 transition-opacity">
              <Image
                src="/brand-logo.png"
                alt="Readixon Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          <ul className="login11-nav-list">
            <div className="login11-active-indicator" />

            <li>
              <button
                type="button"
                className={`login11-nav-btn ${view === 'signin' ? 'active' : ''}`}
                onClick={() => switchView('signin')}
              >
                <LogIn size={20} />
                <span>Giriş Yap</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`login11-nav-btn ${view === 'signup' ? 'active' : ''}`}
                onClick={() => switchView('signup')}
              >
                <UserPlus size={20} />
                <span>Kayıt Ol</span>
              </button>
            </li>
          </ul>

          <div className="hidden md:flex flex-col items-center">
            <span className="text-[10px] text-muted tracking-wider uppercase opacity-60">Readixon</span>
          </div>
        </nav>

        {/* 2. ORTA 3D TAŞAN KAHRAMAN ALANI (HERO) */}
        <div className="login11-hero">
          <div className="login11-hero-bg" />
          <div className="login11-hero-overlay" />

          <div className="login11-hero-inner">
            {/* Giriş Yap İçin Hero */}
            <div className="login11-hero-content signin">
              <div className="login11-hero-badge">
                <span>Sınırları Aşan Hikayeler</span>
              </div>
              <h2>Tekrar Hoş Geldin</h2>
              <p>Hikayelerin, okuma listelerin ve favori yazarların seni bekliyor.</p>

              <Link href="/terms" target="_blank" className="login11-hero-link">
                <span>Kullanım Koşulları</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Kayıt Ol İçin Hero */}
            <div className="login11-hero-content signup">
              <div className="login11-hero-badge">
                <BookOpen size={12} className="text-purple-300" />
                <span>Yazarlar ve Okurlar Platformu</span>
              </div>
              <h2>Aramıza Katıl</h2>
              <p>Kendi evrenini yarat, eserlerini binlerce edebiyat tutkunuyla buluştur.</p>

              <Link href="/guidelines" target="_blank" className="login11-hero-link">
                <span>Topluluk Kuralları</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. SAĞ FORM ALANI (KAYAN GEÇİŞ) */}
        <div className="login11-form-area">
          {/* Giriş / Kayıt Başarılı Hoş Geldin Görünümü (1.8s sonra otomatik feed'e geçer) */}
          {welcomeState && (
            <div className="login11-welcome-overlay">
              <div className="login11-welcome-icon-wrap">
                <CheckCircle2 size={36} className="text-primary" />
              </div>
              <h2 className="login11-welcome-title">
                {welcomeState.isNew ? 'Aramıza Hoş Geldin' : 'Tekrar Hoş Geldin'}
                <span className="login11-welcome-name">{welcomeState.name}!</span>
              </h2>
              <p className="login11-welcome-subtitle">
                {welcomeState.isNew
                  ? 'Readixon ailesine başarıyla katıldın. Akışına yönlendiriliyorsun...'
                  : 'Girişin başarıyla doğrulandı. Akışına yönlendiriliyorsun...'}
              </p>
              <div className="login11-welcome-progress">
                <div className="login11-welcome-progress-bar" />
              </div>
            </div>
          )}

          <div className="login11-forms-slider">

            {/* FORM A: GİRİŞ YAP */}
            <form onSubmit={handleLogin} className="login11-form signin" noValidate>
              <div className="login11-form-header">
                <div className="login11-form-switch-text">
                  Hesabın yok mu?
                  <button
                    type="button"
                    className="login11-form-switch-btn"
                    onClick={() => switchView('signup')}
                  >
                    Kayıt Ol
                  </button>
                </div>
                <h1 className="login11-form-title">Giriş Yap</h1>
              </div>

              {loginError && (
                <div className="login11-error-box">
                  {loginError}
                </div>
              )}

              <div className="login11-group">
                <label className="login11-label" htmlFor="login-email">E-posta</label>
                <div className="login11-control">
                  <input
                    id="login-email"
                    type="email"
                    placeholder="ornek@readixon.com"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                    disabled={loginLoading}
                    className="login11-input"
                    required
                  />
                  <Mail size={18} className="login11-icon-right" />
                </div>
              </div>

              <div className="login11-group">
                <label className="login11-label" htmlFor="login-password">Şifre</label>
                <div className="login11-control">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                    disabled={loginLoading}
                    className="login11-input"
                    required
                  />
                  <button
                    type="button"
                    className="login11-eye-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login11-row-options">
                <label className="login11-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login11-checkbox"
                  />
                  <span>Beni Hatırla</span>
                </label>
                <Link href="/forgot-password" className="login11-forgot-link">
                  Şifremi unuttum?
                </Link>
              </div>

              <button
                type="submit"
                className="login11-submit-btn"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <span>Giriş Yap</span>
                )}
              </button>

              <div className="login11-divider">
                <div className="login11-divider-line" />
                <span className="login11-divider-text">veya</span>
                <div className="login11-divider-line" />
              </div>

              <button
                type="button"
                className="login11-google-btn"
                onClick={handleGoogleAuth}
                disabled={loginLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google ile Devam Et</span>
              </button>
            </form>

            {/* FORM B: KAYIT OL */}
            <form onSubmit={handleRegister} className="login11-form signup" noValidate>
              <div className="login11-form-header">
                <div className="login11-form-switch-text">
                  Zaten hesabın var mı?
                  <button
                    type="button"
                    className="login11-form-switch-btn"
                    onClick={() => switchView('signin')}
                  >
                    Giriş Yap
                  </button>
                </div>
                <h1 className="login11-form-title">Hesap Oluştur</h1>
              </div>

              {regError && (
                <div className="login11-error-box">
                  {regError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="login11-group">
                  <label className="login11-label" htmlFor="reg-name">Ad Soyad</label>
                  <div className="login11-control">
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Ad Soyad"
                      value={regDisplayName}
                      onChange={(e) => { setRegDisplayName(e.target.value); setRegError(''); }}
                      disabled={regLoading}
                      className="login11-input"
                      required
                    />
                    <User size={16} className="login11-icon-right" />
                  </div>
                </div>

                <div className="login11-group">
                  <label className="login11-label" htmlFor="reg-username">Kullanıcı Adı</label>
                  <div className="login11-control">
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="kullanici_adi"
                      value={regUsername}
                      onChange={(e) => { setRegUsername(e.target.value); setRegError(''); }}
                      disabled={regLoading}
                      className="login11-input"
                      required
                    />
                    <AtSign size={16} className="login11-icon-right" />
                  </div>
                </div>
              </div>

              <div className="login11-group">
                <label className="login11-label" htmlFor="reg-email">E-posta</label>
                <div className="login11-control">
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="ornek@readixon.com"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => { setRegEmail(e.target.value); setRegError(''); }}
                    disabled={regLoading}
                    className="login11-input"
                    required
                  />
                  <Mail size={18} className="login11-icon-right" />
                </div>
              </div>

              <div className="login11-group">
                <label className="login11-label" htmlFor="reg-password">Şifre (Min. 6 Karakter)</label>
                <div className="login11-control">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); setRegError(''); }}
                    disabled={regLoading}
                    className="login11-input"
                    required
                  />
                  <button
                    type="button"
                    className="login11-eye-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Yasal Onaylar */}
              <div className="space-y-1.5 my-1">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-muted leading-tight select-none">
                  <input
                    type="checkbox"
                    checked={isTermsAccepted}
                    onChange={(e) => { setIsTermsAccepted(e.target.checked); setRegError(''); }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-border accent-primary cursor-pointer shrink-0"
                  />
                  <span>
                    <Link href="/terms" target="_blank" className="text-text font-semibold hover:text-primary transition-colors underline">
                      Kullanım Koşulları
                    </Link>
                    ,{' '}
                    <Link href="/copyright" target="_blank" className="text-text font-semibold hover:text-primary transition-colors underline">
                      Telif Hakkı
                    </Link>{' '}
                    ve{' '}
                    <Link href="/guidelines" target="_blank" className="text-text font-semibold hover:text-primary transition-colors underline">
                      Topluluk Kuralları
                    </Link>
                    'nı kabul ediyorum. <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-muted leading-tight select-none">
                  <input
                    type="checkbox"
                    checked={isPrivacyAccepted}
                    onChange={(e) => { setIsPrivacyAccepted(e.target.checked); setRegError(''); }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-border accent-primary cursor-pointer shrink-0"
                  />
                  <span>
                    <Link href="/privacy" target="_blank" className="text-text font-semibold hover:text-primary transition-colors underline">
                      Gizlilik Politikası ve KVKK Aydınlatma Metni
                    </Link>
                    'ni onaylıyorum. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="login11-submit-btn"
                disabled={regLoading}
              >
                {regLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>Hesap Oluştur</span>
                )}
              </button>

              <div className="login11-divider">
                <div className="login11-divider-line" />
                <span className="login11-divider-text">veya</span>
                <div className="login11-divider-line" />
              </div>

              <button
                type="button"
                className="login11-google-btn"
                onClick={handleGoogleAuth}
                disabled={regLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google ile Hızlı Kayıt</span>
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
