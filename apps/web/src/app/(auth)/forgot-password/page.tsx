"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Input, Button, Typography } from '@readixon/ui';
import { sendPasswordReset, getAuthErrorMessage } from '@readixon/core';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-8 animate-fade-in relative">
      <Link href="/login" className="absolute top-8 left-8 text-muted hover:text-primary transition-colors">
        <ArrowLeft size={20} />
      </Link>

      <div className="flex flex-col items-center text-center mt-6 mb-8">
        <Typography variant="h3" className="font-semibold mb-2">Şifremi Unuttum</Typography>
        <Typography variant="body" className="text-muted max-w-[280px]">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </Typography>
      </div>
      
      {success ? (
        <div className="flex flex-col items-center text-center py-6 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 size={48} className="text-green-500 mb-4" />
          <Typography variant="h3" className="font-medium mb-2">E-posta Gönderildi</Typography>
          <Typography variant="body" className="text-muted mb-6">
            <strong>{email}</strong> adresine şifre sıfırlama bağlantısı içeren bir e-posta gönderdik. Lütfen gelen kutunuzu (ve spam/gereksiz klasörünü) kontrol edin.
          </Typography>
          <Button variant="primary" className="w-full" onPress={() => router.push('/login')}>
            Giriş Sayfasına Dön
          </Button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
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
            Bağlantı Gönder
          </Button>
        </form>
      )}
    </Card>
  );
}
