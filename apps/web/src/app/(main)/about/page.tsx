"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Swords,
  Shield,
  LayoutDashboard,
  Award,
  Zap,
  Volume2,
  VolumeX,
  Palette,
  MessageCircle,
  Quote,
  TrendingUp,
  FileText,
  AlertCircle,
  Building2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
  Wand2,
  Feather,
  Flame,
  Star,
  Compass,
  ArrowRight,
  Users,
  Eye,
  Sliders,
  Sparkle,
  LifeBuoy
} from 'lucide-react';
import { Typography } from '@readixon/ui';
import { toast } from 'sonner';
import './AboutPage.css';

// ── Interactive Lab Tab Definitions ──
type LabTabId = 'reader' | 'arena' | 'rpg' | 'studio' | 'editorial' | 'webtoon';

interface LabTab {
  id: LabTabId;
  label: string;
  tag: string;
  icon: React.ElementType;
  badge: string;
  heroTitle: string;
  heroDesc: string;
}

const LAB_TABS: LabTab[] = [
  {
    id: 'reader',
    label: 'Akıllı Okuyucu & Ambiyans',
    tag: 'Son Revize',
    icon: Volume2,
    badge: 'Atmosferik Okuma Motoru',
    heroTitle: 'Kelimelerin Müziği',
    heroDesc: 'Hikayeye özel fon müzikleri ve 7 farklı göz dostu temayla kitapların içine adım atın.',
  },
  {
    id: 'arena',
    label: 'Edebi Arena & Curveball',
    tag: 'Oyunlaştırılmış',
    icon: Swords,
    badge: 'Canlı Edebi Rekabet',
    heroTitle: 'Kelimelerin Meydanı',
    heroDesc: 'Zaman kısıtlı odalarda kör oylamayla yarışın, sürpriz kırılma kurallarıyla sınırları zorlayın.',
  },
  {
    id: 'rpg',
    label: 'RPG Karakter Motoru',
    tag: 'Özgün İnovasyon',
    icon: Shield,
    badge: 'Sayısal Karakter Derinliği',
    heroTitle: 'Yaşayan Karakterler',
    heroDesc: 'Karakterler sadece isim değil; Zeka, Güç ve Çeviklik gibi RPG statlarıyla evrilen figürlerdir.',
  },
  {
    id: 'studio',
    label: 'Blok Editör & Kurgu Sihirbazı',
    tag: 'Yazar Odaklı',
    icon: Wand2,
    badge: 'Profesyonel Yazarlık Stüdyosu',
    heroTitle: 'Kurgunun Mimarisi',
    heroDesc: 'Word/Docs aktarımı, bölünmüş ekran (split screen) kurgu notları ve yapay zeka ilham asistanı.',
  },
  {
    id: 'editorial',
    label: 'Editoryal İnceleme & Skor',
    tag: 'Son Revize',
    icon: Award,
    badge: 'Edebi Kalite Güvencesi',
    heroTitle: 'Kusursuz Başyapıtlar',
    heroDesc: 'Editör kurulu tarafından 10 üzerinden analitik puanlama ve yazara özel editoryal geri bildirim.',
  },
  {
    id: 'webtoon',
    label: 'Webtoon & Readix Akışı',
    tag: 'Topluluk & Görsel',
    icon: Layers,
    badge: 'Sosyal Edebiyat & Görsel Roman',
    heroTitle: 'Dikey Hikaye Dünyası',
    heroDesc: 'Webtoon görsel kurguları, tek tıkla şık alıntı üretici ve anlık edebiyat mikro blog akışı.',
  },
];

export default function AboutPage() {
  // ── 3D Tilt Parallax State for Hero Showcase ──
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, lift: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current || window.innerWidth < 1024) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ rotateX, rotateY, lift: 15 });
  };

  const handleHeroMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, lift: 0 });
  };

  // ── Interactive Lab State ──
  const [activeTab, setActiveTab] = useState<LabTabId>('reader');

  // Reader Simulator State
  const [readerTheme, setReaderTheme] = useState<'cyber' | 'earth' | 'author' | 'minimal'>('author');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);
  const [isAmbientSoundActive, setIsAmbientSoundActive] = useState<boolean>(true);

  // Arena Simulator State
  const [isCurveballActive, setIsCurveballActive] = useState<boolean>(true);
  const [userVoted, setUserVoted] = useState<boolean>(false);

  // Copy-to-Clipboard Helper with Toast Feedback
  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} panoya kopyalandı!`);
    }
  };

  // Legal Footer Links
  const footerLinks = [
    { title: 'Kullanım Koşulları', href: '/terms', icon: FileText, desc: 'Hizmet ve kullanım şartları' },
    { title: 'Gizlilik ve KVKK', href: '/privacy', icon: Shield, desc: 'Veri güvenliği ve çerezler' },
    { title: 'Topluluk Kuralları', href: '/guidelines', icon: BookOpen, desc: 'Saygılı ve üretken etkileşim' },
    { title: 'Telif Hakkı', href: '/copyright', icon: AlertCircle, desc: 'Fikri mülkiyet ve DMCA bildirimi' },
    { title: 'Mesafeli Satış', href: '/terms/mesafeli-satis', icon: FileText, desc: 'Abonelik ve dijital ürünler' },
    { title: 'Ön Bilgilendirme', href: '/terms/on-bilgilendirme', icon: FileText, desc: 'Yasal satın alma hakları' },
    { title: 'İptal ve İade', href: '/terms/iptal-iade', icon: AlertCircle, desc: 'Cayma hakkı prosedürleri' },
  ];

  return (
    <div className="w-full bg-background text-text select-none pb-24">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION: 3D PARALLAX SHOWCASE & LOGIN11 HERITAGE
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 pt-16 sm:pt-20 md:pt-24 pb-20 overflow-hidden">
        {/* Soft Ambient Radial Lights (Login11 Style) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-primary/[0.08] dark:bg-primary/[0.12] rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-2/3 left-1/4 w-[500px] h-[500px] bg-purple-500/[0.06] rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Ambient Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(var(--color-text) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center z-10">

          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs md:text-sm font-semibold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-md"
          >
            <Sparkles size={16} className="text-primary animate-pulse" />
            <span>Readixon V1 Devrimi • Yeni Nesil Edebiyat Ekosistemi</span>
          </motion.div>

          {/* Hero Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.12] mb-6 max-w-4xl"
          >
            Okuma Deneyimi <br />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Yeniden Tanımlandı
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Sadece satırları takip eden pasif bir okur olmayın. Hikayelere fon müzikleriyle hayat verin,
            karakterlerin RPG statlarını keşfedin, edebi arenada canlı düellolara katılın ve yaşayan bir edebiyat ekosisteminin parçası olun.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/library"
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 flex items-center gap-2.5"
            >
              <BookOpen size={20} />
              <span>Kütüphaneyi Keşfet</span>
            </Link>

            <Link
              href="/arena"
              className="px-8 py-4 bg-card/80 hover:bg-card border border-border/80 text-text font-bold rounded-2xl transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 flex items-center gap-2.5 backdrop-blur-md"
            >
              <Swords size={20} className="text-primary" />
              <span>Edebi Arenaya Gir</span>
            </Link>

            <Link
              href="/feed"
              className="px-6 py-4 text-muted hover:text-text font-semibold rounded-2xl transition-colors flex items-center gap-1.5"
            >
              <span>Readix Akışı</span>
              <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              3D PARALLAX SHOWCASE CARD (Login11 Heritage Centerpiece)
             ───────────────────────────────────────────────────────────── */}
          <div
            className="about-perspective w-full max-w-4xl relative mt-4 cursor-pointer"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            ref={heroCardRef}
          >
            {/* Floating Parallax Satellite Badges */}
            <div className="hidden lg:block absolute -top-6 -left-8 z-30 about-floating-element pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-primary/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Volume2 size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">Ambiyans Müziği</p>
                  <p className="text-[10px] text-muted">Gece Yağmuru • 432Hz</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -top-8 -right-6 z-30 about-floating-delayed pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-amber-500/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">Editoryal İnceleme</p>
                  <p className="text-[10px] text-amber-500 font-semibold">9.8 • Kusursuz Başyapıt</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-6 -left-6 z-30 about-floating-delayed pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-purple-500/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">RPG Karakter Statı</p>
                  <p className="text-[10px] text-purple-400 font-semibold">Zeka 94 • Karizma 89</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-8 -right-8 z-30 about-floating-element pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 border border-red-500/30 shadow-xl backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Zap size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text">Sürpriz Kırılma (Curveball)</p>
                  <p className="text-[10px] text-red-400 font-semibold">Son 15 Dk • Tabu Kuralı</p>
                </div>
              </div>
            </div>

            {/* Main Centerpiece 3D Card with Login11 Aesthetics */}
            <motion.div
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.lift}px)`,
              }}
              className="about-card-3d w-full rounded-3xl border border-border/70 bg-card/90 p-3 sm:p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-hidden text-left"
            >
              {/* Card Header Ribbon */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[11px] font-mono text-muted/70 ml-2">readixon.com/ecosystem</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkle size={12} />
                  <span>İnteraktif Sahne</span>
                </div>
              </div>

              {/* Login11 Two-Column Showcase Frame */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch rounded-2xl overflow-hidden bg-background/50 border border-border/40 p-4">
                {/* Left Mini Hero Poster (Login11 style) */}
                <div className="md:col-span-5 relative min-h-[220px] rounded-xl overflow-hidden shadow-inner flex flex-col justify-end p-5 text-white">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('/images/auth-hero.jpg')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-2">
                      <BookOpen size={10} />
                      Canlı Deneyim
                    </span>
                    <h3 className="text-xl font-bold leading-tight mb-1 text-white">Sonsuz Kurgular</h3>
                    <p className="text-xs text-white/80 line-clamp-2">
                      Kelimenin gücünü ses, tasarım ve rekabetle harmanlayan ilk edebi platform.
                    </p>
                  </div>
                </div>

                {/* Right Interactive Highlights */}
                <div className="md:col-span-7 flex flex-col justify-center space-y-3 p-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Volume2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Atmosferik Bölüm Fon Müzikleri</p>
                        <p className="text-[11px] text-muted">Okurken sahneye göre değişen fon sesleri</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Yeni</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Swords size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Edebi Arena & Kör Oylama</p>
                        <p className="text-[11px] text-muted">Yazar isimleri gizlenir, sadece edebi yetenek yarışır</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">Rekabet</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">RPG Karakter İstatistikleri</p>
                        <p className="text-[11px] text-muted">Zeka, Güç ve Çeviklik gibi RPG statlarıyla kurgu</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Oyunlaştırma</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. PLATFORM METRICS & HIGHLIGHTS RIBBON
         ───────────────────────────────────────────────────────────── */}

      {/* ─────────────────────────────────────────────────────────────
          3. LOGIN11-INSPIRED INTERACTIVE LAB (CANLI DENEYİM PANELİ)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Sliders size={14} />
              <span>İnteraktif Deneyim Laboratuvarı</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-black text-text mb-4 tracking-tight">
              Özellikleri Canlı Test Edin
            </Typography>
            <Typography variant="body" className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Readixon yalnızca bir metin arşivi değil; okuma ve yazma sanatını oyun mekanikleriyle zenginleştiren yaşayan bir stüdyodur.
            </Typography>
          </div>

          {/* Login11 Multi-Panel Container */}
          <div className="about-lab-container">
            {/* 3.1. Left Navigation Menu (Login11 Style) */}
            <div className="about-lab-nav" role="tablist">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider px-3 mb-3">
                  Sistem Modülleri
                </div>
                {LAB_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`about-lab-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <div className="flex-1 truncate">
                        <span className="block leading-tight truncate">{tab.label}</span>
                        <span className={`text-[10px] block opacity-75 ${isActive ? 'text-white' : 'text-muted'}`}>
                          {tab.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:flex flex-col gap-1 p-3 rounded-2xl bg-card border border-border/40 mt-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Sparkles size={14} />
                  <span>Sürekli Gelişen Ekosistem</span>
                </div>
                <p className="text-[11px] text-muted leading-tight">
                  Tüm özellikler okur ve yazar geri bildirimleriyle haftalık olarak güncellenir.
                </p>
              </div>
            </div>

            {/* 3.2. Center 3D Hero Poster (Login11 Style) */}
            <div className="about-lab-hero">
              <div className="about-lab-hero-bg" />
              <div className="about-lab-hero-overlay" />
              <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end text-white">
                {(() => {
                  const current = LAB_TABS.find(t => t.id === activeTab) || LAB_TABS[0];
                  return (
                    <div className="animate-in fade-in duration-300">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-2">
                        <span>{current.badge}</span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight mb-2 text-white">{current.heroTitle}</h3>
                      <p className="text-xs text-white/80 leading-relaxed mb-4">{current.heroDesc}</p>
                      <div className="w-12 h-1 rounded-full bg-primary" />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 3.3. Right Interactive Playground Panel */}
            <div className="about-lab-preview">
              <AnimatePresence mode="wait">
                {/* ── TAB 1: AKILLI OKUYUCU & AMBİYANS SESLERİ ── */}
                {activeTab === 'reader' && (
                  <motion.div
                    key="tab-reader"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Okuma ve Ambiyans Motoru</h4>
                        <p className="text-xs text-muted">Aşağıdaki kontrollerle canlı simülasyonu test edin.</p>
                      </div>
                      {/* Ambient Audio Bar */}
                      <button
                        type="button"
                        onClick={() => setIsAmbientSoundActive(!isAmbientSoundActive)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${isAmbientSoundActive
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-card border-border text-muted hover:text-text'
                          }`}
                      >
                        {isAmbientSoundActive ? (
                          <>
                            <div className="flex items-end gap-1 h-4">
                              <span className="sound-bar" />
                              <span className="sound-bar" />
                              <span className="sound-bar" />
                              <span className="sound-bar" />
                            </div>
                            <span>Ortam Fon Müziği: Yağmur (Çalıyor)</span>
                          </>
                        ) : (
                          <>
                            <VolumeX size={16} />
                            <span>Fon Müziği: Sessiz (Açmak İçin Tıkla)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Interactive Controls Ribbon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Theme Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                          <Palette size={14} className="text-primary" />
                          <span>Görsel Tema Seçimi</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'author', name: 'Yazar Moru', bg: 'bg-[#6366F1]' },
                            { id: 'cyber', name: 'Siber Gece', bg: 'bg-[#0D1117] border border-cyan-400' },
                            { id: 'earth', name: 'Sıcak Toprak', bg: 'bg-[#F3F0EA] border border-amber-600' },
                            { id: 'minimal', name: 'Minimal Siyah', bg: 'bg-[#000000] border border-zinc-700' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setReaderTheme(t.id as any)}
                              className={`p-2 rounded-xl text-center text-[11px] font-medium border transition-all ${readerTheme === t.id
                                  ? 'border-primary ring-2 ring-primary/30 font-bold'
                                  : 'border-border/60 hover:border-border'
                                }`}
                            >
                              <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${t.bg}`} />
                              <span className="truncate block">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size Adjuster */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted flex items-center justify-between">
                          <span>Yazı Boyutu: <strong className="text-text">{readerFontSize}px</strong></span>
                          <span className="text-[10px] text-primary">Dinamik Ölçekleme</span>
                        </label>
                        <div className="flex items-center gap-3 bg-background/80 p-2 rounded-xl border border-border/50">
                          <button
                            type="button"
                            onClick={() => setReaderFontSize(Math.max(14, readerFontSize - 2))}
                            className="px-3 py-1.5 rounded-lg bg-card text-xs font-bold hover:bg-primary hover:text-white transition-colors border border-border"
                          >
                            A-
                          </button>
                          <div className="flex-1 bg-border/40 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all duration-200"
                              style={{ width: `${((readerFontSize - 14) / 10) * 100}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setReaderFontSize(Math.min(24, readerFontSize + 2))}
                            className="px-3 py-1.5 rounded-lg bg-card text-xs font-bold hover:bg-primary hover:text-white transition-colors border border-border"
                          >
                            A+
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Live Reading Canvas Preview */}
                    <div
                      className={`p-6 rounded-2xl border transition-all duration-300 relative shadow-sm ${readerTheme === 'cyber'
                          ? 'bg-[#0D1117] text-[#C9D1D9] border-cyan-500/30'
                          : readerTheme === 'earth'
                            ? 'bg-[#F3F0EA] text-[#2D2824] border-[#E3DED8]'
                            : readerTheme === 'minimal'
                              ? 'bg-[#0A0A0A] text-[#FAFAFA] border-zinc-800'
                              : 'bg-card text-text border-primary/30'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-current/10">
                        <span className="text-xs font-bold opacity-75 uppercase tracking-wider">
                          Bölüm 4: Sisler Arasındaki Yankı
                        </span>
                        <span className="text-[10px] opacity-60">Readixon Reader v2</span>
                      </div>

                      <p
                        className="leading-relaxed transition-all duration-200"
                        style={{ fontSize: `${readerFontSize}px` }}
                      >
                        "Zaman, taş binaların arasından bir gölge gibi süzülürken rüzgarın fısıltısı eski bir melodiyi taşıyordu.
                        <mark className="bg-primary/20 text-inherit px-1.5 py-0.5 rounded mx-1 font-medium border-b-2 border-primary">
                          Kelimeler sadece kağıt üzerinde durmaz; onları duyan bir ruh varsa dünyayı baştan inşa ederler.
                        </mark>
                        O gece kapı çalındığında her şeyin değişeceğini biliyordum."
                      </p>

                      {/* Interactive Line Comment Overlay */}
                      <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                          <MessageCircle size={15} />
                          <span>Bu satıra 18 okur yorum bıraktı</span>
                        </div>
                        <span className="text-[11px] opacity-70 italic">"Bu cümle kalbime dokundu..." - @denizokur</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 2: EDEBİ ARENA, KÖR OYLAMA & CURVEBALL ── */}
                {activeTab === 'arena' && (
                  <motion.div
                    key="tab-arena"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Edebi Arena ve Kör Oylama Simülatörü</h4>
                        <p className="text-xs text-muted">Yazarlar eşit şartlarda yarışır, isimler gizlenir, okurlar karar verir.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-xs border border-red-500/20">
                          <Flame size={14} /> Canlı Oda: 120 Dk Kısıt
                        </span>
                      </div>
                    </div>

                    {/* Curveball Toggle Banner */}
                    <div
                      onClick={() => setIsCurveballActive(!isCurveballActive)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isCurveballActive
                          ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-sm'
                          : 'bg-card border-border/60 text-muted'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCurveballActive ? 'bg-red-500/20 text-red-500' : 'bg-muted/10 text-muted'
                          }`}>
                          <Zap size={22} className={isCurveballActive ? 'animate-bounce' : ''} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text">Sürpriz Kırılma (Curveball Modu): {isCurveballActive ? 'AKTİF' : 'DEVRE DIŞI'}</p>
                          <p className="text-[11px] text-muted">
                            {isCurveballActive
                              ? 'Son %25 sürede aniden beliren kural: "GÖLGE" kelimesini kullanmak yasaklandı!'
                              : 'Kuralı aktifleştirmek ve heyecanı katlamak için tıklayın.'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold underline">Durumu Değiştir</span>
                    </div>

                    {/* Anonymous Blind Duel Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Story A */}
                      <div className="p-5 rounded-2xl bg-card border border-border/70 relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                            Yazar #A (İsim Gizli)
                          </span>
                          <span className="text-[11px] text-muted">1.420 Kelime</span>
                        </div>
                        <h5 className="font-bold text-sm text-text mb-2">"Gecenin Ardındaki Şafak"</h5>
                        <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                          Sessizlik bir zırh gibi kuşanılmıştı. Kırılan saat çarkları geri sarılamazdı; fakat adımları tereddütsüzdü...
                        </p>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-muted">
                            <span>Konu ve Özgünlük:</span>
                            <strong className="text-text font-bold">9.4 / 10</strong>
                          </div>
                          <div className="flex justify-between text-muted">
                            <span>Dil ve Akıcılık:</span>
                            <strong className="text-text font-bold">9.1 / 10</strong>
                          </div>
                        </div>
                      </div>

                      {/* Story B */}
                      <div className="p-5 rounded-2xl bg-card border border-border/70 relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-md">
                            Yazar #B (İsim Gizli)
                          </span>
                          <span className="text-[11px] text-muted">1.380 Kelime</span>
                        </div>
                        <h5 className="font-bold text-sm text-text mb-2">"Kül ve Katedral"</h5>
                        <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                          Alevlerin terk ettiği kentin sokaklarında sadece yağmur konuşuyordu. Küller toprağa karıştığında sır çözüldü...
                        </p>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-muted">
                            <span>Konu ve Özgünlük:</span>
                            <strong className="text-text font-bold">9.6 / 10</strong>
                          </div>
                          <div className="flex justify-between text-muted">
                            <span>Dil ve Akıcılık:</span>
                            <strong className="text-text font-bold">8.8 / 10</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reader Voting Action */}
                    <div className="p-4 rounded-xl bg-background/80 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-muted text-center sm:text-left">
                        {userVoted
                          ? '🎉 Oyunuz kaydedildi! Kazanan açıklandığında rozet ve RX Puanı kazanacaksınız.'
                          : 'Okur olarak oy verin, kazananı belirleyin ve büyük ödül havuzunun dağıtılmasına yön verin.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setUserVoted(!userVoted)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${userVoted
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md'
                          }`}
                      >
                        {userVoted ? 'Oy Verildi (Geri Al)' : 'Oylamaya Katıl (Yazar B)'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 3: RPG KARAKTER MOTORU & EVRİMİ ── */}
                {activeTab === 'rpg' && (
                  <motion.div
                    key="tab-rpg"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">RPG Karakter Sistemi</h4>
                        <p className="text-xs text-muted">Hikaye karakterleri sadece isim değil; seviye atlayan ve statları olan yaşayan figürlerdir.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-bold text-xs border border-purple-500/20">
                        Seviye 7 Protagonist
                      </span>
                    </div>

                    {/* Character Card Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-6 rounded-2xl bg-card border border-border/70 shadow-sm">
                      {/* Character Avatar & Identity */}
                      <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-4">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-primary/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-md">
                          <Shield size={44} />
                        </div>
                        <h5 className="font-bold text-base text-text">Valeria Thorne</h5>
                        <p className="text-xs text-muted mb-3">Gölgelerin Muhafızı • Protagonist</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">Gölge Yürüyüşü</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">Edebi Sezgi</span>
                        </div>
                      </div>

                      {/* Character Stats Bars */}
                      <div className="md:col-span-8 flex flex-col justify-center space-y-3.5">
                        {/* Zeka */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Zeka (Intelligence):</span>
                            <span className="text-purple-400 font-bold">92 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2.5 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: '92%' }} />
                          </div>
                        </div>

                        {/* Çeviklik */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Çeviklik (Agility):</span>
                            <span className="text-cyan-400 font-bold">88 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2.5 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: '88%' }} />
                          </div>
                        </div>

                        {/* Karizma */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Karizma (Charisma):</span>
                            <span className="text-amber-400 font-bold">78 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2.5 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
                          </div>
                        </div>

                        {/* Güç */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-muted">Fiziksel Güç (Strength):</span>
                            <span className="text-red-400 font-bold">65 / 100</span>
                          </div>
                          <div className="w-full bg-background h-2.5 rounded-full overflow-hidden border border-border/40">
                            <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: '65%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted italic text-center">
                      * Okurlar hikaye boyunca karakterin çatışmalarını sayısal gelişim grafiği üzerinden canlı izleyebilir.
                    </p>
                  </motion.div>
                )}

                {/* ── TAB 4: BLOK EDİTÖR & KURGU SİHİRBAZI ── */}
                {activeTab === 'studio' && (
                  <motion.div
                    key="tab-studio"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Yazar Stüdyosu & Kurgu Sihirbazı</h4>
                        <p className="text-xs text-muted">Word/Docs uyumlu blok editör, bölünmüş ekran (split screen) kurgu notları.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                        Bölünmüş Ekran (Split View)
                      </span>
                    </div>

                    {/* Split View Simulation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Block Editor */}
                      <div className="p-4 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <LayoutDashboard size={14} className="text-primary" />
                              Blok Tabanlı Metin Alanı
                            </span>
                            <span className="text-[10px] text-muted">Word (.docx) Otomatik Algılandı</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-background border border-border/40 text-text">
                              [Paragraf Bloğu] Ay ışığı karanlık ormanın dallarından süzülürken tek bir çıtırtı duyuldu.
                            </div>
                            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-primary font-medium">
                              [Diyalog Bloğu] "Burada yalnız olmadığımızı biliyorsun, değil mi?"
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                          <span>Kelime Sayacı: 842</span>
                          <span className="text-green-500 font-semibold">● Otomatik Kaydedildi</span>
                        </div>
                      </div>

                      {/* Right: Story Wizard Notes */}
                      <div className="p-4 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Wand2 size={14} className="text-amber-500" />
                              Kurgu Sihirbazı Notları
                            </span>
                            <span className="text-[10px] text-amber-500 font-semibold">Şablon: Ters Köşe</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-text">
                              <span className="text-[10px] font-bold text-amber-500 uppercase block mb-0.5">Açılış Kancası (Hook):</span>
                              Okur ilk 3 cümlede karakterin sakladığı sırla tanışmalı.
                            </div>
                            <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20 text-text">
                              <span className="text-[10px] font-bold text-purple-400 uppercase block mb-0.5">Yapay Zeka (AI) Önerisi:</span>
                              "Karakterin ses tonundaki güvensizliği betimlemek için nefes alışını öne çıkarabilirsin."
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                          <span>AI Kotası: 18 / 25 Kalan</span>
                          <span className="text-primary font-semibold">Kurgu Notları Senkronize</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 5: EDİTORYAL İNCELEME & BAŞYAPIT NİŞANI ── */}
                {activeTab === 'editorial' && (
                  <motion.div
                    key="tab-editorial"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Editoryal İnceleme & Puanlama Sistemi</h4>
                        <p className="text-xs text-muted">Platformdaki eserler bağımsız editör kurulu tarafından analiz edilir.</p>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-xs border border-amber-500/30 flex items-center gap-1.5">
                        <Star size={14} className="fill-amber-500" /> 9.8 / 10 • Kusursuz Başyapıt
                      </span>
                    </div>

                    {/* Editorial Scorecard Breakdown */}
                    <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                        <div>
                          <h5 className="font-bold text-base text-text">"Kızıl Nehir'in Muhafızları"</h5>
                          <p className="text-xs text-muted">Editör: Edebi Değerlendirme Kurulu Kurulu</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                          Yazara Bildirim İletildi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-background border border-border/40 text-center">
                          <span className="text-[11px] text-muted block mb-1">Kurgu Bütünlüğü</span>
                          <span className="text-lg font-black text-amber-500">10 / 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border/40 text-center">
                          <span className="text-[11px] text-muted block mb-1">Dil & Üslup Zenginliği</span>
                          <span className="text-lg font-black text-primary">9.8 / 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border/40 text-center">
                          <span className="text-[11px] text-muted block mb-1">Karakter Derinliği</span>
                          <span className="text-lg font-black text-purple-400">9.6 / 10</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-xs text-text leading-relaxed">
                        <strong className="text-primary font-bold block mb-1">Editör Masası Kararı:</strong>
                        "Eserdeki atmosferik derinlik ve karakter çatışmaları çağdaş Türk edebiyatında az rastlanan bir olgunlukta.
                        Bölüm sonundaki tempo ayarlaması okuru sonraki sayfaya bağlamakta kusursuz bir başarı yakalamış."
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 6: WEBTOON & READİX SOSYAL AKIŞI ── */}
                {activeTab === 'webtoon' && (
                  <motion.div
                    key="tab-webtoon"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-lg font-bold text-text">Webtoon Desteği & Readix Sosyal Ağı</h4>
                        <p className="text-xs text-muted">Dikey kaydırmalı çizgi roman formatı ve anlık alıntı kartı paylaşımı.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs border border-cyan-500/20">
                        Mikro Blog & Görsel Hikaye
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Webtoon Preview Card */}
                      <div className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Layers size={14} className="text-cyan-400" />
                              Webtoon Formatı (Dikey Kaydırma)
                            </span>
                            <span className="text-[10px] text-muted">Görsel Panel</span>
                          </div>
                          <div className="w-full h-32 rounded-xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-border/50 flex flex-col items-center justify-center text-center p-4">
                            <span className="text-xs font-bold text-white mb-1">Dikey Sahne Geçişleri</span>
                            <p className="text-[10px] text-white/70 max-w-xs">
                              Çizim ve metin uyumuyla akıllı cihazlarda kesintisiz, yüksek çözünürlüklü webtoon okuma deneyimi.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-[11px] text-muted flex items-center justify-between">
                          <span>Otomatik Sayfa Yükleme</span>
                          <span className="text-cyan-400 font-semibold">Webtoon V1 Aktif</span>
                        </div>
                      </div>

                      {/* Readix Quote Generator Card */}
                      <div className="p-5 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                            <span className="text-xs font-bold text-text flex items-center gap-1.5">
                              <Quote size={14} className="text-primary" />
                              Readix Şık Alıntı Kartı
                            </span>
                            <span className="text-[10px] text-primary font-semibold">Sosyal Paylaşım</span>
                          </div>
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs italic text-text leading-relaxed relative">
                            <Quote size={20} className="text-primary/30 absolute top-2 right-2" />
                            "Bazı hikayeler sadece okunmaz; insanın içine bir fırtına gibi düşer ve hiç dinmez."
                            <div className="mt-3 text-[10px] not-italic font-bold text-muted flex items-center justify-between">
                              <span>@cagrikerman</span>
                              <span className="text-primary font-semibold">#ReadixonDevrimi</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-[11px] text-muted flex items-center justify-between">
                          <span>240 Karakter Mikro Blog</span>
                          <span className="text-primary font-semibold">Anında Gündeme Düşer</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE 6 ECOSYSTEM PILLARS (GENİŞLETİLMİŞ ÖZELLİK MİMARİSİ)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-12 bg-card/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-black text-text mb-4 tracking-tight">
              Edebiyatın 6 Büyük Sütunu
            </Typography>
            <Typography variant="body" className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Readixon, geleneksel okuma sitelerinin ötesine geçerek edebiyatı müzik, oyun ve toplulukla birleştirir.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Ambiyans Fon Müzikleri */}
            <div className="p-8 rounded-3xl bg-card border border-border/70 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Volume2 size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-text">Ambiyans Fon Müzikleri</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Yeni</span>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Okuduğunuz sahneye eşlik eden fırtına, şömine çıtırtısı veya dingin piyano ezgileriyle hikayenin duygusal atmosferini birebir yaşayın.
                </p>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                Kişiselleştirilebilir Ses Seviyesi <ChevronRight size={14} />
              </span>
            </div>

            {/* 2. Edebi Arena & Curveball */}
            <div className="p-8 rounded-3xl bg-card border border-border/70 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Swords size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-text">Edebi Arena & Kör Oylama</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Düello</span>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Zaman kısıtlı odalarda yazarlar yarışır. Yazar isimleri gizlenir (Kör Oylama). Son çeyrekte gelen Curveball kuralı krizi sanata dönüştürür.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                Büyük Ödül Havuzları <ChevronRight size={14} />
              </span>
            </div>

            {/* 3. RPG Karakter Dinamiği */}
            <div className="p-8 rounded-3xl bg-card border border-border/70 hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-text">RPG Karakter Motoru</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Statlar</span>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Karakterlerin Zeka, Güç, Çeviklik ve Karizma statlarını takip edin. Protagonist/Antagonist rolleriyle kurguyu oyun gibi yaşayın.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                Dinamik Karakter Sayfaları <ChevronRight size={14} />
              </span>
            </div>

            {/* 4. Blok Editör & Kurgu Sihirbazı */}
            <div className="p-8 rounded-3xl bg-card border border-border/70 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wand2 size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-text">Kurgu Sihirbazı & Stüdyo</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">Akıllı</span>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Word (.docx) aktarımı ile otomatik blok formatlama. Açılış kancası, çatışma ve ters köşe notlarını bölünmüş ekranda (split screen) izleyin.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
                Yapay Zeka (AI) Asistanı <ChevronRight size={14} />
              </span>
            </div>

            {/* 5. Editoryal İnceleme & Puanlama */}
            <div className="p-8 rounded-3xl bg-card border border-border/70 hover:border-yellow-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-text">Editoryal İncelemeler</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">10 Puan</span>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Profesyonel editör masası tarafından 10 üzerinden analitik puanlama. "Kusursuz Başyapıt" nişanı ve yazarlara özel editoryal geri bildirim.
                </p>
              </div>
              <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                Yazar Bildirim Döngüsü <ChevronRight size={14} />
              </span>
            </div>

            {/* 6. Webtoon & Readix Sosyal Edebiyat */}
            <div className="p-8 rounded-3xl bg-card border border-border/70 hover:border-green-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-text">Sosyal Edebiyat & Webtoon</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Topluluk</span>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Satır içi yorumlar, tek tıkla şık alıntı kartları, dikey kaydırmalı Webtoon desteği ve yazar-okur arası doğrudan mesajlaşma.
                </p>
              </div>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                Doğrudan Yazar Sohbeti <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FOUNDER'S VISION & MANIFESTO (KURUCU VİZYONU)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Watermark Quote Icon */}
            <Quote size={120} className="absolute -bottom-8 -right-8 text-primary/10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
              {/* Founder Avatar with Glowing Ring */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shrink-0 ring-4 ring-primary/25 shadow-2xl">
                <Image
                  src="/cagri.jpeg"
                  alt="Çağrı Kerman - Readixon Kurucusu"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
                  Kurucu Manifestosu
                </span>
                <p className="text-base sm:text-lg italic leading-relaxed text-text mb-6">
                  "Readixon’ı kurarken ki en büyük hayalim; kelimelerin gücüne inanan, hikayeleri derinlemesine paylaşan saf bir edebiyat topluluğu yaratmaktı.
                  Burası sadece bir metni okuyup geçtiğiniz bir yer değil; fon müziğiyle sahneyi hissettiğiniz, arenasında yarıştığınız ve satır aralarında gerçek bağlar kurduğunuz bir yuva.
                  Edebiyatı statik sayfalardan kurtarıp yaşayan bir evrene dönüştürmek için buradayız."
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/40">
                  <div>
                    <h4 className="font-extrabold text-base text-text">Çağrı Kerman</h4>
                    <p className="text-xs text-muted">Readixon Kurucusu & Tasarım Mimarı</p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    <CheckCircle2 size={16} />
                    <span>Turixon Ltd. Şti. Güvencesiyle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CORPORATE TRANSPARENCY & BTK COMPLIANCE (TURİXON GÜVENCESİ)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-12 bg-card border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield size={14} />
              <span>Resmi ve Yasal Güvence</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl font-black text-text mb-4 tracking-tight">
              Kurumsal ve İletişim Bilgileri
            </Typography>
            <Typography variant="body" className="text-muted text-base max-w-2xl mx-auto">
              Readixon platformu, <strong>Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</strong> tüzel kişiliği bünyesinde faaliyet göstermekte olup,
              T.C. kanunları ve BTK Yer Sağlayıcı mevzuatlarına tam uyumlulukla hizmet vermektedir.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Corporate Legal Credentials */}
            <div className="p-8 rounded-3xl bg-background border border-border/60 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2.5">
                  <Briefcase className="text-primary" size={22} />
                  <span>Şirket Kayıt Bilgileri</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-muted block uppercase tracking-wider text-[10px] mb-1">Resmi Ticari Unvan</span>
                    <p className="font-semibold text-text text-sm">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div>
                      <span className="text-muted block uppercase tracking-wider text-[10px]">Mersis Numarası</span>
                      <p className="font-mono font-bold text-text text-sm">0871128699600001</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('0871128699600001', 'Mersis numarası')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div>
                      <span className="text-muted block uppercase tracking-wider text-[10px]">Vergi Dairesi ve No</span>
                      <p className="font-mono font-bold text-text text-sm">Pamukkale VD / 8711286996</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('8711286996', 'Vergi numarası')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-500 font-bold text-xs">
                    <Shield size={16} />
                    <span>BTK Onaylı Resmi Yer Sağlayıcı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Direct Contact & Address */}
            <div className="p-8 rounded-3xl bg-background border border-border/60 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2.5">
                  <MapPin className="text-primary" size={22} />
                  <span>Resmi İletişim Kanalları</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-0.5 shrink-0" size={18} />
                    <div>
                      <span className="text-muted block uppercase tracking-wider text-[10px] mb-1">Şirket Merkez Adresi</span>
                      <p className="font-medium text-text leading-relaxed">
                        AKKONAK MAH. 1814 SK. NO: 87 İÇ KAPI NO: 2 MERKEZEFENDİ / DENİZLİ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary shrink-0" size={18} />
                      <div>
                        <span className="text-muted block uppercase tracking-wider text-[10px]">Resmi Destek E-Postası</span>
                        <a href="mailto:support@readixon.com" className="font-medium text-text hover:text-primary transition-colors">
                          support@readixon.com
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('support@readixon.com', 'Destek e-postası')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary shrink-0" size={18} />
                      <div>
                        <span className="text-muted block uppercase tracking-wider text-[10px]">KEP (Kayıtlı Elektronik Posta)</span>
                        <p className="font-mono font-medium text-text">turixon.turizm@hs01.kep.tr</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('turixon.turizm@hs01.kep.tr', 'KEP adresi')}
                      className="p-2 rounded-lg bg-background hover:bg-primary/10 text-muted hover:text-primary transition-colors border border-border/50"
                      title="Kopyala"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-3">
                      <Phone className="text-primary shrink-0" size={18} />
                      <div>
                        <span className="text-muted block uppercase tracking-wider text-[10px]">Doğrudan İletişim Hattı</span>
                        <a href="tel:+905524634140" className="font-medium text-text hover:text-primary transition-colors">
                          +90 552 463 41 40
                        </a>
                      </div>
                    </div>
                    <a
                      href="tel:+905524634140"
                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-colors text-[11px]"
                    >
                      Ara
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6.5. SUPPORT & HELP DESK (YARDIM VE DESTEK MERKEZİ)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-12 bg-blue-500/[0.03] border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <LifeBuoy size={14} />
              <span>7/24 Destek & Yardım Masası</span>
            </div>
            <Typography variant="h2" className="text-3xl sm:text-4xl font-black text-text mb-4 tracking-tight">
              Yardıma mı İhtiyacın Var?
            </Typography>
            <Typography variant="body" className="text-muted text-base max-w-2xl mx-auto">
              Aklına takılan bir soru mu var, bir sorunla mı karşılaştın veya platform için bir önerin mi var?
              Readixon destek ekibi ve moderatörlerimiz her zaman yanınızda.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option 1: Destek Sayfası */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LifeBuoy size={24} />
                </div>
                <h4 className="text-base font-bold text-text mb-1">Online Destek Talebi</h4>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Doğrudan destek formumuzu doldurarak bilet oluşturun; ekibimiz size en kısa sürede geri dönsün.
                </p>
              </div>
              <Link
                href="/support"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Destek Sayfasına Git</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Option 2: E-Posta */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <h4 className="text-base font-bold text-text mb-1">E-Posta ile Ulaşın</h4>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Her türlü teknik, telif veya kurumsal sorularınız için resmi e-posta adresimize yazabilirsiniz.
                </p>
              </div>
              <a
                href="mailto:support@readixon.com"
                className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>support@readixon.com</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Option 3: Hızlı Telefon Hattı */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-green-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <h4 className="text-base font-bold text-text mb-1">Doğrudan İletişim Hattı</h4>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Mesai saatleri içerisinde doğrudan şirketimiz kurumsal telefon numarasından bize ulaşabilirsiniz.
                </p>
              </div>
              <a
                href="tel:+905524634140"
                className="w-full py-2.5 px-4 rounded-xl bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>+90 552 463 41 40</span>
                <Phone size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. POLICIES & LEGAL CONTRACT LINKS
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 px-4 sm:px-6 md:px-12 border-t border-border/50 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-text mb-2">Yasal Sözleşmeler ve Kullanıcı Hakları</h3>
            <p className="text-xs text-muted">Platformumuzdaki tüm haklarınız yasal sözleşmelerle koruma altındadır.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {footerLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-text group-hover:text-primary transition-colors mb-1">
                    {link.title}
                  </h4>
                  <p className="text-[11px] text-muted line-clamp-2">{link.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CALL TO ACTION (CTA) HERO BANNER
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full shrink-0 py-16 sm:py-24 px-4 sm:px-6 md:px-12 mb-12">
        <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-purple-700 text-white p-8 sm:p-14 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 min-h-[380px]">
          {/* Subtle Ambient Shapes Inside Banner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white mb-4">
              <Sparkles size={14} />
              Yeni Bir Evrene Adım At
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 text-white">
              Kelimelerin Gücüyle Kendi Dünyanı İnşa Et
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-8">
              Binlerce interaktif hikaye, edebi arena düelloları ve senin kararlarınla şekillenecek kurgular seni bekliyor.
              Hemen ücretsiz kayıt ol ve ekosisteme katıl.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-primary font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                Hemen Ücretsiz Katıl
              </Link>
              <Link
                href="/feed"
                className="px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded-2xl transition-all duration-300 backdrop-blur-md"
              >
                Keşfetmeye Başla
              </Link>
            </div>
          </div>

          {/* Mascot or Interactive Badge */}
          <div className="relative z-10 flex flex-col items-center shrink-0">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 about-floating-element">
              <Image
                src="/cekirix.png"
                alt="Readixon Cekirix"
                fill
                sizes="208px"
                className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                priority
              />
            </div>
            <span className="text-xs font-bold text-white/80 mt-2">Çekirix • Edebi Yoldaşınız</span>
          </div>
        </div>
      </section>

    </div>
  );
}
