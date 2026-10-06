"use client";

import React from 'react';
import Link from 'next/link';
import { Typography } from '@readixon/ui';
import { useAuthStore } from '@readixon/core';
import { 
  BookOpen, Award, LayoutTemplate, BellRing, HelpCircle, 
  Quote, ArrowRight, Sparkles, Compass, ShieldCheck 
} from 'lucide-react';

export default function EditorDashboardPage() {
  const { userProfile } = useAuthStore();

  const editorModules = [
    {
      title: 'Hikayeler & Eserler',
      description: 'Yazarların yayımladığı hikayeleri inceleyin, vitrin ve editoryal seçimler için filtreleyin.',
      href: '/editor/stories',
      icon: BookOpen,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'Kürasyon'
    },
    {
      title: 'Kitap Değerlendirmeleri',
      description: 'Eserlere derinlemesine editoryal kritik yazın, puanlama yapın ve rozet tanımlayın.',
      href: '/editor/reviews',
      icon: Award,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      badge: 'Kritik & Puan'
    },
    {
      title: 'Manşet Yönetimi',
      description: 'Ana sayfadaki döner vitrin afişlerini ve öne çıkan içerik afişlerini belirleyin.',
      href: '/editor/hero',
      icon: LayoutTemplate,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      badge: 'Ana Sayfa'
    },
    {
      title: 'Kültür & Sanat Haberleri',
      description: 'Gündem akışında yer alacak edebiyat, sanat ve kültür haberlerini ekleyin.',
      href: '/editor/news',
      icon: BellRing,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      badge: 'Gündem'
    },
    {
      title: 'Günün Anketleri',
      description: 'Okuyucu topluluğunun her gün yanıtlayabileceği interaktif anketleri yönetin.',
      href: '/editor/polls',
      icon: HelpCircle,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      badge: 'Etkileşim'
    },
    {
      title: 'Günün Alıntısı',
      description: 'Günün açılış alıntısını ve yazarlardan ilham veren edebi sözleri vitrine taşıyın.',
      href: '/editor/quote',
      icon: Quote,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      badge: 'İlham'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* ── Hoş Geldin Hero Banner ── */}
      <div className="bg-gradient-to-br from-card via-card/80 to-muted/20 border border-border/60 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <ShieldCheck size={13} />
              {userProfile?.isAdmin ? 'Yönetici & Editör' : 'Editör Masası'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/15 text-muted border border-border/40">
              <Sparkles size={12} className="text-primary" /> Kürasyon & Yayın Paneli
            </span>
          </div>

          <Typography variant="h1" className="text-2xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            Hoş Geldiniz, <span className="text-primary">{userProfile?.displayName || 'Editör'}</span>
          </Typography>
          
          <Typography variant="body" className="text-sm sm:text-base text-muted leading-relaxed">
            Readixon yayın ve içerik kürasyon masasına giriş yaptınız. Aşağıdaki modülleri kullanarak hikayeleri değerlendirebilir, manşetleri düzenleyebilir ve okur topluluğuna özel editoryal içerikler üretebilirsiniz.
          </Typography>
        </div>
      </div>

      {/* ── Modül Kartları Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="text-primary" size={20} />
            <h2 className="font-bold text-base sm:text-lg text-foreground">
              Yönetim & Kürasyon Modülleri
            </h2>
          </div>
          <span className="text-xs text-muted font-medium hidden sm:inline">
            6 Aktif Modül
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {editorModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className="group p-5 sm:p-6 bg-card/60 hover:bg-card border border-border/60 hover:border-primary/40 rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 ${item.bgColor} ${item.color}`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted bg-muted/15 px-2 py-0.5 rounded-full border border-border/40">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 flex items-center gap-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-muted group-hover:text-primary transition-colors">
                  <span>Modüle Git</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Editoryal İpuçları & Rehber ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card/30 border border-border/40">
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          Editoryal Çalışma İlkeleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted leading-relaxed">
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/30">
            <strong className="text-foreground font-semibold block mb-1">1. Yapıcı Değerlendirme</strong>
            Yazarların gelişimine katkıda bulunmak için editoryal kritiklerinizde teşvik edici ve derinlikli analizler sunun.
          </div>
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/30">
            <strong className="text-foreground font-semibold block mb-1">2. Kaliteli Görseller</strong>
            Manşet afişlerinde telifsiz, yüksek çözünürlüklü ve estetik açıdan hikayeyi temsil eden görseller seçin.
          </div>
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/30">
            <strong className="text-foreground font-semibold block mb-1">3. Canlı Topluluk Akışı</strong>
            Günün anketleri ve alıntılarıyla okurların her gün platformda yeni bir edebiyat deneyimi yaşamasını sağlayın.
          </div>
        </div>
      </div>

    </div>
  );
}
