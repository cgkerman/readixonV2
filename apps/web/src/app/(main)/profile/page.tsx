'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@readixon/core';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { userProfile, isLoading, isInitialized, firebaseUser } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!firebaseUser) {
      router.replace('/login');
      return;
    }

    if (userProfile?.username) {
      router.replace(`/profile/@${userProfile.username}`);
    } else if (isInitialized && firebaseUser && !userProfile) {
      // Eğer profil dokümanı veritabanında yoksa (eski veya bozuk kayıt)
      toast.error("Profil bilgileriniz bulunamadı. Lütfen tekrar giriş yapın veya yeni bir hesap oluşturun.");
      router.replace('/');
    }
  }, [isInitialized, firebaseUser, userProfile, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-12 h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );
}
