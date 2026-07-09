"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, Typography } from '@readixon/ui';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { auth } from '@readixon/core';
import { applyActionCode, checkActionCode } from 'firebase/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (!code) {
      setError('Geçersiz veya eksik doğrulama kodu.');
      setLoading(false);
      return;
    }
    setOobCode(code);

    // E-posta adresini koddan öğren (bu işlem kodun geçerli olduğunu da teyit eder)
    checkActionCode(auth, code)
      .then((info) => {
        if (info.data.email) {
          setEmail(info.data.email);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Geçersiz kod:", err);
        setError('Doğrulama kodunun süresi dolmuş veya zaten kullanılmış.');
        setLoading(false);
      });
  }, [searchParams]);

  const handleVerify = async () => {
    if (!oobCode || !accepted) return;
    
    setVerifying(true);
    setError('');

    try {
      // 1. Firebase Email Verification işlemini tamamla
      await applyActionCode(auth, oobCode);
      
      // 2. Yasal Onay Kaydını veritabanına işle
      const res = await fetch('/api/auth/verify-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        throw new Error('Onay kaydedilirken hata oluştu.');
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card variant="glass" className="p-8 text-center animate-fade-in">
          <Typography variant="body">Doğrulama bilgileri yükleniyor...</Typography>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card variant="glass" className="p-8 text-center animate-fade-in max-w-md w-full">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <Typography variant="h3" className="font-semibold mb-2">Doğrulama Başarısız</Typography>
          <Typography variant="body" className="text-muted mb-6">{error}</Typography>
          <Button variant="outline" onPress={() => router.push('/')} className="w-full">
            Ana Sayfaya Dön
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card variant="glass" className="p-8 text-center animate-fade-in max-w-md w-full">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <Typography variant="h2" className="font-semibold mb-3">Tebrikler!</Typography>
          <Typography variant="body" className="text-muted mb-8 text-lg">
            E-posta adresiniz doğrulandı ve yasal taahhüdünüz başarıyla kaydedildi. Artık hikayelerinizi milyonlarla paylaşabilirsiniz.
          </Typography>
          <Button variant="primary" className="w-full h-12 text-lg" onPress={() => router.push('/')}>
            Keşfetmeye Başla
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <Card variant="glass" className="p-6 md:p-10 max-w-2xl w-full animate-fade-in relative border border-primary/10 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <Typography variant="h2" className="font-semibold mb-4 text-text">Yasal Taahhüt & Onay</Typography>
          <Typography variant="body" className="text-muted text-lg max-w-md">
            Lütfen hesabınızı doğrulamak ve içerik yayınlamaya başlamak için aşağıdaki taahhüdü okuyup onaylayın.
          </Typography>
        </div>

        <div className="bg-background/50 border border-border p-6 rounded-2xl mb-8 flex items-start gap-4 hover:border-primary/50 transition-colors duration-300">
          <div className="pt-1 shrink-0">
            <input 
              type="checkbox" 
              id="legalConsent" 
              className="w-6 h-6 rounded accent-primary cursor-pointer border-border"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
          </div>
          <label htmlFor="legalConsent" className="text-base cursor-pointer select-none leading-relaxed text-text">
            <strong>"Yayınlayacağım tüm içeriklerin tamamen şahsıma ait olduğunu, intihal (çalıntı) barındırmadığını ve Readixon Telif Hakkı Politikası ile Topluluk Kuralları'na uygun olduğunu taahhüt ediyorum."</strong>
          </label>
        </div>

        <Button 
          variant="primary" 
          className="w-full h-14 text-lg font-medium" 
          onPress={handleVerify}
          disabled={!accepted || verifying}
        >
          {verifying ? 'İşleminiz Yapılıyor...' : 'Taahhüt Ediyor ve Doğruluyorum'}
        </Button>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12">Yükleniyor...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
