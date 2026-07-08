"use client";

import React, { useState } from 'react';
import { Typography, Input, Button } from '@readixon/ui';
import { useAuthStore, getUserByUsername, updateUserProfile, getUserProfile, uploadFile, compressImage } from '@readixon/core';
import { UserPlus, Upload, Image as ImageIcon } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';

export default function UsernameSetupModal() {
  const { firebaseUser, userProfile, setUserProfile } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Yasal onay state'leri
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

  // If user profile is fully loaded and has a username, do not render
  if (!firebaseUser || !userProfile || userProfile.username) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTermsAccepted || !isPrivacyAccepted) {
      setError("Lütfen devam etmeden önce yasal metinleri onaylayın.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    
    if (!cleanUsername) {
      setError("Kullanıcı adı boş bırakılamaz.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError("Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve sadece harf, rakam ve alt çizgi içerebilir.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Kullanıcı adı alınmış mı kontrol et
      const existingUser = await getUserByUsername(cleanUsername);
      if (existingUser) {
        setError("Bu kullanıcı adı daha önce alınmış. Lütfen farklı bir tane deneyin.");
        setLoading(false);
        return;
      }

      // Profili güncelle
      let avatarUrl = userProfile?.avatarUrl;
      
      if (avatarFile) {
        // Compress profile pictures to save space and bandwidth (e.g. 400x400)
        const compressedFile = await compressImage(avatarFile, 400, 400, 0.85);
        const path = `users/avatars/${firebaseUser.uid}_${Date.now()}`;
        avatarUrl = await uploadFile(compressedFile, path);
      }
      
      await updateUserProfile(firebaseUser.uid, { 
        username: cleanUsername, 
        ...(avatarUrl ? { avatarUrl } : {}),
        termsAcceptedAt: serverTimestamp() as any,
        privacyAcceptedAt: serverTimestamp() as any
      });

      // Store'u güncelle
      const updatedProfile = await getUserProfile(firebaseUser.uid);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (err) {
      console.error("Username update error:", err);
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Modal is strictly uncloseable via click outside */}
      <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-8" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="relative mb-4">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setAvatarFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
            <div className="w-24 h-24 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary overflow-hidden border-2 border-dashed border-primary/50 hover:bg-primary/20 transition-colors">
              {previewUrl || userProfile?.avatarUrl ? (
                <img src={previewUrl || userProfile?.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold uppercase mb-1">
                    {firebaseUser?.displayName?.charAt(0) || 'U'}
                  </span>
                  <span className="text-[9px] font-medium uppercase opacity-80 flex items-center gap-1">
                    <Upload size={10} /> Değiştir
                  </span>
                </div>
              )}
            </div>
            {/* Sadece dekoratif minik icon */}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-4 border-card shadow-lg pointer-events-none">
              <ImageIcon size={14} />
            </div>
          </div>
          
          <Typography variant="h3" className="font-bold mb-2">Hoş Geldin! 🎉</Typography>
          <Typography variant="body" className="text-muted text-sm">
            Readixon dünyasına adım atmak üzeresin. Lütfen seni tanıyabileceğimiz eşsiz bir <strong>kullanıcı adı</strong> ve profil resmi belirle.
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text/80 mb-1">
              Kullanıcı Adı (Benzersiz)
            </label>
            <Input 
              type="text" 
              placeholder="örn: kitapkurdu"
              value={username}
              onChangeText={(val) => { setUsername(val); setError(''); }}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-3 mt-6 mb-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer accent-primary" 
                  checked={isTermsAccepted}
                  onChange={(e) => { setIsTermsAccepted(e.target.checked); setError(''); }}
                />
              </div>
              <span className="text-xs text-muted leading-relaxed select-none">
                <a href="/terms" target="_blank" className="font-bold text-text hover:text-primary transition-colors">Kullanım Koşulları</a>, <a href="/copyright" target="_blank" className="font-bold text-text hover:text-primary transition-colors">Telif Hakkı Politikası</a> ve <a href="/guidelines" target="_blank" className="font-bold text-text hover:text-primary transition-colors">Topluluk Kuralları</a>'nı okudum, kabul ediyorum. <span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer accent-primary" 
                  checked={isPrivacyAccepted}
                  onChange={(e) => { setIsPrivacyAccepted(e.target.checked); setError(''); }}
                />
              </div>
              <span className="text-xs text-muted leading-relaxed select-none">
                Kişisel verilerimin işlenmesine ilişkin <a href="/privacy" target="_blank" className="font-bold text-text hover:text-primary transition-colors">Gizlilik Politikası ve KVKK Aydınlatma Metni</a>'ni onaylıyorum. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-200 text-sm mt-4">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-6" 
            loading={loading}
            disabled={loading}
          >
            Kaydet ve Başla
          </Button>
        </form>
      </div>
    </div>
  );
}
