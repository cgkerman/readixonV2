"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { useThemeStore, Theme, useAuthStore, deleteUserAccount } from '@readixon/core';
import { Settings, LogOut, AlertTriangle, Monitor, UserX, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";

const themes: { id: Theme; name: string; colors: string[] }[] = [
  { id: 'theme-1', name: 'Tema 1 (Siber Gece)', colors: ['#0D1117', '#161B22', '#00E5FF', '#C9D1D9'] },
  { id: 'theme-2', name: 'Tema 2 (Sıcak Toprak)', colors: ['#FAFAFA', '#F3F0EA', '#D97757', '#2D2824'] },
  { id: 'theme-3', name: 'Tema 3 (Premium Minimal)', colors: ['#000000', '#0A0A0A', '#FFFFFF', '#FAFAFA'] },
  { id: 'theme-4', name: 'Tema 4 (Pembe Altın)', colors: ['#FFF5F5', '#FFE4E6', '#E11D48', '#4C0519'] },
  { id: 'theme-5', name: 'Tema 5 (Gece Mavisi)', colors: ['#0A192F', '#112240', '#64FFDA', '#CCD6F6'] },
  { id: 'theme-6', name: 'Tema 6 (Adaçayı)', colors: ['#F4F5F0', '#E9EBE4', '#2D5A27', '#1E2920'] },
  { id: 'theme-7', name: 'Tema 7 (Yazar Moru)', colors: ['#FAFAFA', '#FFFFFF', '#6366F1', '#1E293B'] },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { userProfile, firebaseUser } = useAuthStore();
  
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Theme Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customColorsInput, setCustomColorsInput] = useState({
    background: '#1A1A24',
    card: '#242430',
    text: '#E0E0E0',
    primary: '#FF4500',
    muted: '#A0A0A0',
    border: 'rgba(255, 255, 255, 0.1)',
  });

  const handleSaveCustomTheme = () => {
    useThemeStore.getState().setCustomColors(customColorsInput);
    setTheme('custom');
    setIsCustomModalOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userProfile?.username && deleteConfirmation !== firebaseUser?.email) {
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

  return (
    <div className="max-w-4xl mx-auto w-full p-6 pb-24">
      <div className="mb-8">
        <Typography variant="h1" className="font-bold flex items-center gap-3">
          <Settings className="text-primary" size={32} /> Ayarlar
        </Typography>
        <Typography variant="body" className="text-muted mt-2">
          Görünüm ve hesap ayarlarınızı buradan yönetebilirsiniz.
        </Typography>
      </div>

      <div className="space-y-8">
        {/* Tema Seçimi */}
        <section className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="text-primary" size={24} />
            <Typography variant="h3" className="font-bold">Görünüm ve Tema</Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((t) => (
              <div 
                key={t.id} 
                onClick={() => setTheme(t.id)}
                className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all duration-300 ${
                  theme === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                {theme === t.id && (
                  <div className="absolute top-4 right-4 text-primary">
                    <CheckCircle2 size={24} className="fill-primary/20" />
                  </div>
                )}
                <Typography variant="body" className="font-semibold mb-3">{t.name}</Typography>
                <div className="flex gap-2">
                  {t.colors.map((color, idx) => (
                    <div 
                      key={idx} 
                      className="w-8 h-8 rounded-full shadow-sm border border-black/10" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {/* Özel Tema Butonu */}
            <div 
              onClick={() => setIsCustomModalOpen(true)}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-center ${
                theme === 'custom' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-muted hover:text-text'
              }`}
            >
              {theme === 'custom' && (
                <div className="absolute top-4 right-4 text-primary">
                  <CheckCircle2 size={24} className="fill-primary/20" />
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-3">
                <span className="text-xl">🎨</span>
              </div>
              <Typography variant="body" className="font-semibold">Kendi Temanı Yarat</Typography>
            </div>
          </div>
        </section>

        {/* Tehlikeli Bölge */}
        <section className="bg-red-950/10 border border-red-900/30 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <Typography variant="h3" className="font-bold text-red-500">Tehlikeli Bölge</Typography>
          </div>
          
          <div className="bg-background border border-red-900/20 rounded-2xl p-6">
            <Typography variant="h3" className="font-bold mb-2">Hesabı Kalıcı Olarak Sil</Typography>
            <Typography variant="body" className="text-muted mb-6">
              Hesabınızı sildiğinizde; profiliniz, kitaplarınız, readix paylaşımlarınız, yorumlarınız ve diğer tüm verileriniz <strong>kalıcı olarak</strong> silinir. Bu işlem geri alınamaz.
            </Typography>

            <div className="max-w-md">
              <label className="block text-sm font-medium mb-2 text-text/80">
                Onaylamak için <strong>{userProfile?.username || firebaseUser?.email}</strong> yazın:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Kullanıcı adınız veya e-posta"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-red-500 mb-4 transition-colors"
              />
              <Button 
                variant="primary" 
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                onPress={handleDeleteAccount}
                disabled={isDeleting || !deleteConfirmation}
                loading={isDeleting}
              >
                <UserX size={18} className="mr-2" /> Hesabımı Kalıcı Olarak Sil
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Özel Tema Modalı */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h3" className="font-bold">Özel Tema Oluştur</Typography>
              <button onClick={() => setIsCustomModalOpen(false)} className="text-muted hover:text-text p-2">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">Arka Plan Rengi</Typography>
                <input type="color" value={customColorsInput.background} onChange={e => setCustomColorsInput({...customColorsInput, background: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">Kart / Kutu Rengi</Typography>
                <input type="color" value={customColorsInput.card} onChange={e => setCustomColorsInput({...customColorsInput, card: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">Metin Rengi</Typography>
                <input type="color" value={customColorsInput.text} onChange={e => setCustomColorsInput({...customColorsInput, text: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">Ana Renk (Buton/İkon)</Typography>
                <input type="color" value={customColorsInput.primary} onChange={e => setCustomColorsInput({...customColorsInput, primary: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="secondary" className="flex-1" onPress={() => setIsCustomModalOpen(false)}>İptal</Button>
              <Button variant="primary" className="flex-1" onPress={handleSaveCustomTheme}>Uygula</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
