'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Card } from '@readixon/ui';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuthStore, getReadingProgress, acceptAdultContent, type Story } from '@readixon/core';
import { toast } from 'sonner';

interface AdultContentGateProps {
  story: Story | null;
  children: React.ReactNode;
}

export function AdultContentGate({ story, children }: AdultContentGateProps) {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // If the story hasn't loaded yet or it is not adult content, skip the check
    if (!story) return;
    
    if (!story.isAdultContent) {
      setNeedsConsent(false);
      setIsChecking(false);
      return;
    }

    // It is an adult story, verify consent
    const checkConsent = async () => {
      // 1. If not logged in, enforce login
      if (!firebaseUser) {
        setNeedsConsent(true);
        setIsChecking(false);
        return;
      }

      // 2. Logged in, check database
      try {
        const progress = await getReadingProgress(firebaseUser.uid, story.storyId);
        if (progress?.isAdultContentAccepted) {
          setNeedsConsent(false);
        } else {
          setNeedsConsent(true);
        }
      } catch (error) {
        console.error("Yetişkin içerik onayı kontrol edilirken hata:", error);
        setNeedsConsent(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkConsent();
  }, [story, firebaseUser]);

  const handleAccept = async () => {
    if (!firebaseUser) {
      toast.error('Onay vermek için lütfen giriş yapın veya kayıt olun.');
      router.push(`/login?redirect=/read/${story?.storyId}`);
      return;
    }
    
    if (!accepted || !story) return;

    setIsSaving(true);
    try {
      await acceptAdultContent(firebaseUser.uid, story.storyId);
      setNeedsConsent(false);
      toast.success('Onayınız kaydedildi. Keyifli okumalar!');
    } catch (error) {
      toast.error('Onay kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecline = () => {
    router.back();
  };

  // If still checking, we show the children but maybe hidden or a loader
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Typography variant="body">Erişim kontrol ediliyor...</Typography>
      </div>
    );
  }

  // If consent is needed, show the gate overlaying nothing or children hidden
  if (needsConsent) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4">
        <Card variant="glass" className="max-w-lg w-full p-8 border-red-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert size={40} className="text-red-500" />
            </div>
            <Typography variant="h2" className="font-bold text-text mb-4">
              Yetişkin İçerik Uyarısı
            </Typography>
            <Typography variant="body" className="text-muted text-lg">
              Bu hikaye yoğun argo, şiddet veya yetişkinlere yönelik edebi temalar içermektedir.
            </Typography>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-400 shrink-0 mt-1" size={24} />
              <Typography variant="caption" className="text-muted-foreground leading-relaxed text-sm">
                Devam ederek, 18 yaşından büyük olduğunuzu ve bu tür içerikleri okumayı kendi özgür iradenizle kabul ettiğinizi beyan edersiniz. Readixon Topluluk Kuralları gereği hukuki sorumluluk okuyucuya aittir.
              </Typography>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-muted/10 transition-colors border border-transparent hover:border-border">
              <input 
                type="checkbox" 
                className="w-6 h-6 mt-1 rounded border-border text-red-500 focus:ring-red-500 bg-background"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="text-base font-medium select-none text-text">
                Yukarıdaki uyarıyı okudum, anladım ve okumaya devam etmek istiyorum.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-14 text-lg" 
              onPress={handleDecline}
              disabled={isSaving}
            >
              Geri Dön
            </Button>
            {firebaseUser ? (
              <Button 
                variant="primary" 
                className="flex-1 h-14 text-lg bg-red-600 hover:bg-red-700 text-white border-none" 
                onPress={handleAccept}
                disabled={!accepted || isSaving}
              >
                {isSaving ? 'Kaydediliyor...' : 'Onayla ve Oku'}
              </Button>
            ) : (
              <Button 
                variant="primary" 
                className="flex-1 h-14 text-lg bg-red-600 hover:bg-red-700 text-white border-none" 
                onPress={handleAccept}
              >
                Giriş Yap ve Onayla
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // If no consent needed or already granted, render the actual content
  return <>{children}</>;
}
