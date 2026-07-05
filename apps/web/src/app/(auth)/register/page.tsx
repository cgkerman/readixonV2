"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Input, Button, Typography } from '@readixon/ui';
import { signUpWithEmail, signInWithGoogleWeb, getAuthErrorMessage, useAuthStore, getUserByUsername } from '@readixon/core';

export default function RegisterPage() {
  const router = useRouter();
  const { firebaseUser, isInitialized, userProfile, setUserProfile } = useAuthStore();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Başarılı girişte ana sayfaya yönlendir
  useEffect(() => {
    if (isInitialized && firebaseUser && userProfile) {
      router.push('/');
    }
  }, [firebaseUser, userProfile, isInitialized, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Tüm alanları doldurmanız gerekmektedir.');
      return;
    }
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setError('Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve sadece harf, rakam ve alt çizgi içerebilir.');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const cleanUsername = username.trim().toLowerCase();
      // Check if username is already taken
      const existingUser = await getUserByUsername(cleanUsername);
      if (existingUser) {
        setError('Bu kullanıcı adı daha önce alınmış. Lütfen farklı bir tane deneyin.');
        setLoading(false);
        return;
      }

      const { user } = await signUpWithEmail(email.trim(), password, displayName.trim(), cleanUsername);
      
      // Kayıt tamamlanıp doküman oluştuktan sonra profili çekip store'u güncelliyoruz
      const { getUserProfile } = await import('@readixon/core');
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
      
      // Yönlendirme useEffect tarafından yapılacak
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || ''));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { isNewUser, user } = await signInWithGoogleWeb();
      
      // Kayıt tamamlanıp profil oluştuktan sonra store'u güncelle
      const { getUserProfile } = await import('@readixon/core');
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
      
      // Yönlendirme useEffect tarafından yapılacak
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || ''));
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-8 animate-fade-in">
      <Typography variant="h3" className="mb-6 font-semibold">Hesap Oluştur</Typography>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <Input 
            label="Ad Soyad" 
            type="text" 
            placeholder="Okur Yazar"
            value={displayName}
            onChangeText={(val) => { setDisplayName(val); setError(''); }}
            disabled={loading}
            required
          />
        </div>

        <div>
          <Input 
            label="Kullanıcı Adı" 
            type="text" 
            placeholder="kitapkurdu"
            value={username}
            onChangeText={(val) => { setUsername(val); setError(''); }}
            disabled={loading}
            required
          />
        </div>

        <div>
          <Input 
            label="E-posta" 
            type="email" 
            placeholder="ornek@readixon.com"
            value={email}
            onChangeText={(val) => { setEmail(val); setError(''); }}
            disabled={loading}
            required
          />
        </div>
        
        <div>
          <Input 
            label="Şifre" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChangeText={(val) => { setPassword(val); setError(''); }}
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-2" 
          loading={loading}
          disabled={loading}
        >
          Kayıt Ol
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <hr className="w-full border-border" />
        <span className="px-3 text-muted text-sm whitespace-nowrap">veya</span>
        <hr className="w-full border-border" />
      </div>

      <Button 
        type="button" 
        variant="secondary" 
        className="w-full mt-6 flex items-center justify-center gap-2"
        disabled={loading}
        onPress={handleGoogleLogin}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ile Devam Et
      </Button>

      <div className="mt-8 text-center text-sm text-muted">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
          Giriş Yap
        </Link>
      </div>
    </Card>
  );
}
