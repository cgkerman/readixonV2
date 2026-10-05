'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Smartphone, 
  Apple, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Zap,
  BellRing,
  WifiOff,
  Layers,
  FileDown
} from 'lucide-react';
import { Typography } from '@readixon/ui';

type TabType = 'android' | 'ios' | 'guide';

export function AppDownloadBanner() {
  const [activeTab, setActiveTab] = useState<TabType>('android');

  return (
    <section className="relative my-12 w-full">
      {/* Arka Plan Atmosferik Işıklar */}
      <div className="absolute -top-16 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Login11 Tarzı Ana Kart (Desktop: 3 Bölmeli / Mobil: Dikey Akış) */}
      <div className="relative mx-auto w-full rounded-[28px] bg-card border border-border/70 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        <div className="flex flex-col lg:flex-row items-stretch min-h-[460px]">
          
          {/* 1. SOL TAB / NAVİGASYON ŞERİDİ (Login11 Tarzı Sol Menü) */}
          <div className="w-full lg:w-[100px] lg:flex-shrink-0 bg-background/50 border-b lg:border-b-0 lg:border-r border-border/60 p-3 lg:py-8 flex lg:flex-col justify-between items-center z-20">
            
            {/* Küçük Logo / İkon */}
            <div className="flex items-center gap-2 lg:flex-col">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                <Smartphone size={20} />
              </div>
              <span className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-muted mt-2">
                APP
              </span>
            </div>

            {/* Tab Butonları */}
            <div className="flex lg:flex-col gap-2 relative">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'android'
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-background/60'
                }`}
                title="Android APK"
              >
                <Smartphone size={18} />
                <span className="text-[11px]">Android</span>
                {activeTab === 'android' && (
                  <span className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'ios'
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-background/60'
                }`}
                title="iPhone / iOS"
              >
                <Apple size={18} />
                <span className="text-[11px]">iOS</span>
                {activeTab === 'ios' && (
                  <span className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'guide'
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-background/60'
                }`}
                title="Kurulum Rehberi"
              >
                <HelpCircle size={18} />
                <span className="text-[11px]">Rehber</span>
                {activeTab === 'guide' && (
                  <span className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
                )}
              </button>
            </div>

            {/* Sürüm Etiketi */}
            <div className="hidden lg:block text-center">
              <span className="text-[10px] text-muted font-mono bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
                v1.1
              </span>
            </div>
          </div>

          {/* 2. ORTA FLOATING HERO PANELİ (Login11 Hero Tasarımı) */}
          <div className="relative lg:w-[320px] lg:flex-shrink-0 m-4 lg:m-5 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end p-6 min-h-[260px] lg:min-h-auto">
            {/* Arka Plan Görseli & Gradyan */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: "url('/images/auth-hero.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            
            {/* Hero İçeriği */}
            <div className="relative z-10 space-y-3 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/20 w-fit">
                <Sparkles size={12} className="text-primary animate-pulse" />
                <span>Readixon Mobil Evreni</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                {activeTab === 'android' && 'Hikayeler Artık Cebinde!'}
                {activeTab === 'ios' && 'iPhone İçin Tam Ekran Keyfi'}
                {activeTab === 'guide' && 'Kolay ve Güvenli Kurulum'}
              </h3>

              <p className="text-xs text-white/80 leading-relaxed">
                {activeTab === 'android' && 'Webtoonlar, romanlar ve yazarların tek tıkla elinin altında.'}
                {activeTab === 'ios' && 'Safari üzerinden ana ekrana ekleyerek uygulama gibi kullan.'}
                {activeTab === 'guide' && 'Bilinmeyen kaynak iznini açarak saniyeler içinde yükle.'}
              </p>

              {/* Minik Özellik Kutusu */}
              <div className="pt-2 flex items-center gap-3 text-[11px] text-white/90">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" /> %100 Güvenli
                </span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1">
                  <Zap size={14} className="text-amber-400" /> Hızlı ve Akıcı
                </span>
              </div>
            </div>
          </div>

          {/* 3. SAĞ ETKİLEŞİM VE İÇERİK ALANI (Login11 Form Alanı Tasarımı) */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
            
            {/* SEKME 1: ANDROID İNDİRME */}
            {activeTab === 'android' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    Resmi Doğrudan İndirme
                  </div>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    Android APK İndir
                  </Typography>
                  <Typography variant="body" className="text-muted text-sm mt-1">
                    Google Play Store beklemeden en güncel Readixon mobil sürümünü doğrudan cihazına yükle.
                  </Typography>
                </div>

                {/* Mobil Özellik Kartları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Akıcı Okuyucu</h4>
                      <p className="text-[11px] text-muted">Webtoon ve romanlar için optimize</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <BellRing size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Anlık Bildirimler</h4>
                      <p className="text-[11px] text-muted">Yeni bölümleri kaçırma</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <WifiOff size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Düşük Veri Modu</h4>
                      <p className="text-[11px] text-muted">Kotalı interneti korur</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Kaldığın Yerden Devam</h4>
                      <p className="text-[11px] text-muted">Web ile senkronize ilerleme</p>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Barı */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href="/downloads/readixon.apk"
                    download="readixon.apk"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                  >
                    <Download size={18} />
                    <span>Android APK İndir (~15 MB)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-foreground/30 bg-background/80 hover:bg-muted text-foreground text-xs font-medium transition-colors"
                  >
                    <HelpCircle size={15} className="text-primary" />
                    <span>Nasıl Kurulur?</span>
                  </button>
                </div>

                {/* Store Bilgi Notu */}
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Google Play Store sürümü çok yakında mağazada yayınlanacaktır.</span>
                </div>
              </div>
            )}

            {/* SEKME 2: IOS / IPHONE REHBERİ */}
            {activeTab === 'ios' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    <Apple size={14} /> Apple iOS Cihazlar
                  </div>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    iPhone & iPad Deneyimi
                  </Typography>
                  <Typography variant="body" className="text-muted text-sm mt-1">
                    Apple politikaları gereği dışarıdan dosya indirilmez. Ancak saniyeler içinde ana ekranınıza ekleyip tam ekran uygulama yapabilirsiniz.
                  </Typography>
                </div>

                {/* PWA Adımları */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/60 border border-border/60">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Safari İle Açın</p>
                      <p className="text-[11px] text-muted">readixon.com adresini Safari tarayıcınızda açın.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/60 border border-border/60">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Paylaş Butonuna Basın</p>
                      <p className="text-[11px] text-muted">Safari'nin altındaki Paylaş (kare ve yukarı ok) simgesine dokunun.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/60 border border-border/60">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">"Ana Ekrana Ekle" Seçeneğini Seçin</p>
                      <p className="text-[11px] text-muted">Menüyü kaydırıp "Ana Ekrana Ekle" deyin. Readixon artık uygulama gibi açılır!</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
                  <Sparkles size={16} />
                  <span>Resmi App Store sürümümüz onay aşamasındadır, yakında yayında!</span>
                </div>
              </div>
            )}

            {/* SEKME 3: KURULUM REHBERİ (SSS) */}
            {activeTab === 'guide' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    <HelpCircle size={14} /> Yardım & Destek
                  </div>
                  <Typography variant="h2" className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    Android APK Nasıl Kurulur?
                  </Typography>
                  <Typography variant="body" className="text-muted text-sm mt-1">
                    Android telefonunuza APK kurarken karşılaşabileceğiniz adımlar:
                  </Typography>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/60">
                    <p className="text-xs font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary" />
                      "Dosya zararlı olabilir" uyarısı nedir?
                    </p>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">
                      Google Play dışındaki tüm indirmelerde Android standart olarak bu uyarıyı verir. Readixon APK'sı tamamen güvenlidir ve virüs içermez. "Yine de indir" diyerek devam edin.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/60">
                    <p className="text-xs font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary" />
                      "Bilinmeyen kaynaklara izin ver" adımı:
                    </p>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">
                      İndirilen dosyaya tıkladığınızda ayarlar açılırsa, kullandığınız tarayıcı için (Chrome vb.) "Bu kaynaktan izin ver" seçeneğini aktif edip "Yükle" butonuna dokunmanız yeterlidir.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('android')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors"
                  >
                    <Download size={14} />
                    <span>Şimdi İndirmeye Başla</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
