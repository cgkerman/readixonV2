'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Sparkles, 
  Palette, 
  BookOpen, 
  Compass, 
  User, 
  Calendar, 
  Mail, 
  Settings, 
  Save, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sun, 
  Moon, 
  Coffee, 
  CheckCircle2, 
  Copy, 
  Eye, 
  Plus, 
  Trash2, 
  ArrowRight,
  Layers,
  Feather,
  Type,
  Square,
  BarChart3,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useAuthStore, 
  getAuthorSiteByUserId, 
  saveAuthorSite, 
  setAuthorSitePublishedStatus,
  createDefaultAuthorSite,
  getAuthorStories,
  getUniversesByAuthorId,
  type AuthorSite,
  type Story,
  type AtelierTemplate,
  type AtelierThemeMode,
  type Universe
} from '@readixon/core';
import { AtelierSiteRenderer } from '@/components/atelier/AtelierSiteRenderer';

type StudioTab = 'template' | 'hero' | 'books' | 'universe' | 'about' | 'events' | 'newsletter' | 'settings';
type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

const PRESET_TEMPLATES: {
  id: AtelierTemplate;
  name: string;
  badge: string;
  description: string;
  color: string;
  font: string;
  cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}[] = [
  {
    id: 'novelist',
    name: 'The Novelist',
    badge: 'Zarif Edebi Klasik',
    description: 'Haruki Murakami, Orhan Pamuk tarzı; sıcak keten kağıdı, antika mürekkep, altın varak ve zamansız kütüphane felsefesi.',
    color: '#D97706',
    font: 'Playfair Display',
    cardRadius: 'md',
  },
  {
    id: 'worldbuilder',
    name: 'The Worldbuilder',
    badge: 'Sinematik & Epik Fantezi',
    description: 'Brandon Sanderson, Tolkien çizgisi; kadim rünik başlıklar, obsidyen gecesi, aether moru parıltıları ve dünya haritası.',
    color: '#8B5CF6',
    font: 'Cinzel',
    cardRadius: 'sm',
  },
  {
    id: 'webtoon',
    name: 'The Webtoon & Pop',
    badge: 'Modern & Dinamik',
    description: 'Renkli görsel kurgu, dikey paneller, genç yetişkin (YA), yuvarlak neon rozetler ve modern sosyal medya estetiği.',
    color: '#EC4899',
    font: 'Outfit',
    cardRadius: 'lg',
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    badge: 'Sade Tipografik',
    description: 'Apple ve Substack tarzı saf ve temiz tasarım, cömert beyaz boşluklar ve güçlü tipografi.',
    color: '#FF9900',
    font: 'Plus Jakarta Sans',
    cardRadius: 'sm',
  },
];

const PRESET_FONTS = [
  { id: 'Playfair Display', name: 'Playfair Display', label: 'Edebi Klasik Serif (Novelist)' },
  { id: 'Cinzel', name: 'Cinzel', label: 'Epik Kadim Rünik (Worldbuilder)' },
  { id: 'Outfit', name: 'Outfit', label: 'Modern Geometrik Sans (Webtoon)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', label: 'Modern Platform Standartı' },
  { id: 'Lora', name: 'Lora', label: 'Sıcak Edebi Kitap Fontu' },
  { id: 'Merriweather', name: 'Merriweather', label: 'Zarif Gazete & Dergi Serif' },
];

const PRESET_RADII: { id: 'none' | 'sm' | 'md' | 'lg' | 'full'; label: string }[] = [
  { id: 'none', label: 'Keskin (0px)' },
  { id: 'sm', label: 'Kompakt (8px)' },
  { id: 'md', label: 'Klasik (16px)' },
  { id: 'lg', label: 'Yumuşak (24px)' },
  { id: 'full', label: 'Ultra Yuvarlak (32px)' },
];

const PRESET_COLORS = [
  { name: 'Readixon Turuncusu', hex: '#FF9900' },
  { name: 'Yazar İndigosu', hex: '#6366F1' },
  { name: 'Mistik Aether Moru', hex: '#8B5CF6' },
  { name: 'Antik Altın & Kehribar', hex: '#D97706' },
  { name: 'Zümrüt Yeşili', hex: '#10B981' },
  { name: 'Neon Gül Kurusu', hex: '#EC4899' },
  { name: 'Siber Cyan', hex: '#00E5FF' },
  { name: 'Kızıl Mercan', hex: '#EF4444' },
];

export default function StudioAtelierPage() {
  const { firebaseUser, userProfile } = useAuthStore();
  const [site, setSite] = useState<AuthorSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<StudioTab>('template');

  // Canlı Önizleme Ayarları
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [previewMode, setPreviewMode] = useState<AtelierThemeMode>('dark');
  const [mobileViewSegment, setMobileViewSegment] = useState<'editor' | 'preview'>('editor');

  // Yazarın diğer verileri
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [userUniverses, setUserUniverses] = useState<Universe[]>([]);

  // Site verilerini yükle
  useEffect(() => {
    if (!firebaseUser) return;

    let isMounted = true;
    const loadSiteData = async () => {
      try {
        setIsLoading(true);
        const existingSite = await getAuthorSiteByUserId(firebaseUser.uid);

        if (existingSite) {
          if (isMounted) {
            setSite(existingSite);
            setPreviewMode(existingSite.themeConfig?.mode || 'dark');
          }
        } else {
          // Henüz site yoksa varsayılan taslağı üret
          const defaultSite = createDefaultAuthorSite({
            uid: firebaseUser.uid,
            displayName: userProfile?.displayName || firebaseUser.displayName,
            username: userProfile?.username || firebaseUser.email?.split('@')[0],
            photoURL: userProfile?.avatarUrl || firebaseUser.photoURL,
            bio: userProfile?.bio,
          });
          if (isMounted) {
            setSite(defaultSite);
            setPreviewMode(defaultSite.themeConfig?.mode || 'dark');
          }
        }

        // Yazarın hikayelerini ve evrenlerini çek
        try {
          const stories = await getAuthorStories(firebaseUser.uid);
          if (isMounted) setUserStories(stories);
        } catch {}

        try {
          const universes = await getUniversesByAuthorId(firebaseUser.uid);
          if (isMounted) setUserUniverses(universes);
        } catch {}

      } catch (err) {
        console.error('[StudioAtelierPage] Yükleme hatası:', err);
        toast.error('Atelier verileri yüklenirken bir hata oluştu.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSiteData();

    return () => {
      isMounted = false;
    };
  }, [firebaseUser, userProfile]);

  // Siteyi Kaydet
  const handleSave = async (showNotification = true) => {
    if (!site || !firebaseUser || isSaving) return;

    setIsSaving(true);
    try {
      await saveAuthorSite({
        ...site,
        userId: firebaseUser.uid,
      });
      if (showNotification) {
        toast.success('Yazar web siteniz başarıyla kaydedildi!');
      }
    } catch (err: any) {
      console.error('Kaydetme hatası:', err);
      toast.error('Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Yayına Al / Yayından Kaldır
  const handleTogglePublish = async () => {
    if (!site || !firebaseUser) return;

    const newStatus = !site.isPublished;
    const updated = { ...site, isPublished: newStatus };
    setSite(updated);

    try {
      await setAuthorSitePublishedStatus(firebaseUser.uid, newStatus);
      if (newStatus) {
        toast.success('Tebrikler! Kişisel web siteniz başarıyla yayına alındı! 🎉');
      } else {
        toast.info('Siteniz taslak moduna alındı ve yayından kaldırıldı.');
      }
    } catch (err: any) {
      toast.error('Yayın durumu güncellenirken hata oluştu.');
      setSite({ ...site, isPublished: !newStatus });
    }
  };

  // Canlı Linki Kopyala
  const handleCopyLink = () => {
    if (!site) return;
    const domain = window.location.origin;
    const url = `${domain}/atelier/@${site.username || site.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Web sitesi bağlantısı panoya kopyalandı!');
  };

  if (isLoading || !site) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-neutral-400">Atelier Yazar Sitesi Hazırlanıyor...</p>
      </div>
    );
  }

  const liveUrl = `/atelier/@${site.username || site.slug}`;

  return (
    <div className="flex flex-col flex-1 h-full min-h-[calc(100vh-64px)] bg-[#090A0F] text-neutral-100">
      {/* 1. ÜST ARAÇ ÇUBUĞU (Sticky Action Bar) */}
      <header className="sticky top-0 z-30 bg-[#12141C]/95 backdrop-blur-md border-b border-[#1E2230] px-4 sm:px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Sol: Başlık & Durum Rozeti */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">Atelier Web Sitesi Motoru</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v3.0.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {site.isPublished ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Yayında (Canlı)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-neutral-500" />
                    Taslak Modunda
                  </span>
                )}
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400 hidden sm:inline">/{site.username || site.slug}</span>
              </div>
            </div>
          </div>

          {/* Mobil Switcher (Tasarla vs Önizle) */}
          <div className="lg:hidden flex items-center bg-[#181B26] p-1 rounded-xl border border-[#272B3C] w-full sm:w-auto">
            <button
              onClick={() => setMobileViewSegment('editor')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mobileViewSegment === 'editor' ? 'bg-primary text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tasarla (Editör)
            </button>
            <button
              onClick={() => setMobileViewSegment('preview')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mobileViewSegment === 'preview' ? 'bg-primary text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Canlı Önizleme
            </button>
          </div>

          {/* Sağ Aksiyon Butonları */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              title="Canlı site linkini kopyala"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#272B3C] bg-[#181B26] hover:bg-[#202433] text-xs font-medium text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Linki Kopyala</span>
            </button>

            <Link
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-semibold text-indigo-300 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Sekmede Aç</span>
            </Link>

            <button
              onClick={handleTogglePublish}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                site.isPublished 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {site.isPublished ? 'Yayından Kaldır' : 'Siteyi Yayına Al'}
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ANA İÇERİK: BÖLÜNMÜŞ EKRAN (SPLIT SCREEN) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        
        {/* ─── SOL KOLON: KONTROL PANELİ & AYARLAR ─── */}
        <div 
          className={`lg:col-span-5 flex flex-col bg-[#12141C] border border-[#1E2230] rounded-2xl overflow-hidden ${
            mobileViewSegment === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* İstatistik Mini Dashboard Özeti */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#181B26] border-b border-[#1E2230] text-center">
            <div className="p-2 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-neutral-400 block">Görüntülenme</span>
              <span className="text-sm font-extrabold text-white">{(site.analytics?.totalViews || 0).toLocaleString()}</span>
            </div>
            <div className="p-2 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-neutral-400 block">Kitap Tıklaması</span>
              <span className="text-sm font-extrabold text-amber-400">{(site.analytics?.bookClicks || 0).toLocaleString()}</span>
            </div>
            <div className="p-2 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-neutral-400 block">Bülten Abonesi</span>
              <span className="text-sm font-extrabold text-indigo-400">{(site.analytics?.subscribersCount || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Sekme Gezinme Çubuğu (Yatay Kaydırılabilir) */}
          <div className="flex items-center gap-1 p-2 bg-[#141622] border-b border-[#1E2230] overflow-x-auto scrollbar-none">
            {[
              { id: 'template', label: 'Şablon & Tema', icon: Palette },
              { id: 'hero', label: 'Karşılama', icon: Sparkles },
              { id: 'books', label: 'Eserler', icon: BookOpen },
              { id: 'universe', label: 'Evren', icon: Compass },
              { id: 'about', label: 'Hakkımda', icon: User },
              { id: 'events', label: 'Etkinlikler', icon: Calendar },
              { id: 'newsletter', label: 'Bülten & Sosyal', icon: Mail },
              { id: 'settings', label: 'SEO & Bloklar', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as StudioTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sekme İçerikleri (Scrollable) */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 max-h-[calc(100vh-230px)]">
            
            {/* ─── TAB 1: ŞABLON & TEMA ─── */}
            {activeTab === 'template' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Prestij Tasarım Şablonu
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4">
                    Edebi tarzınıza ve kurgunuza en uygun lüks web sitesi şablonunu seçin.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_TEMPLATES.map((tmpl) => {
                      const isSelected = site.themeConfig.template === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            setSite({
                              ...site,
                              themeConfig: {
                                ...site.themeConfig,
                                template: tmpl.id,
                                fontHeading: tmpl.font,
                                primaryColor: tmpl.color,
                                cardRadius: tmpl.cardRadius,
                              },
                            });
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-lg'
                              : 'bg-[#181B26] border-[#272B3C] hover:border-neutral-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white">{tmpl.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          </div>
                          <span className="text-[10px] font-semibold text-indigo-400 block mb-1">
                            {tmpl.badge}
                          </span>
                          <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                            {tmpl.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Varsayılan Tema Modu */}
                <div className="pt-4 border-t border-[#1E2230]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Varsayılan Görünüm Modu
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'dark', label: 'Gece', icon: Moon },
                      { id: 'light', label: 'Açık', icon: Sun },
                      { id: 'sepia', label: 'Sepya', icon: Coffee },
                      { id: 'oled', label: 'OLED', icon: Sparkles },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSite({
                            ...site,
                            themeConfig: {
                              ...site.themeConfig,
                              mode: m.id as AtelierThemeMode,
                            },
                          });
                          setPreviewMode(m.id as AtelierThemeMode);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                          site.themeConfig.mode === m.id
                            ? 'bg-primary text-white border-primary shadow'
                            : 'bg-[#181B26] border-[#272B3C] text-neutral-400 hover:text-white'
                        }`}
                      >
                        <m.icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Başlık Yazı Tipi (Font Heading) Seçici */}
                <div className="pt-4 border-t border-[#1E2230]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    <span>Başlık Tipografisi (Font)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_FONTS.map((f) => {
                      const isSelected = site.themeConfig.fontHeading === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSite({
                              ...site,
                              themeConfig: {
                                ...site.themeConfig,
                                fontHeading: f.id,
                              },
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white shadow'
                              : 'bg-[#181B26] border-[#272B3C] text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block">{f.name}</span>
                          <span className="text-[10px] text-neutral-500 block">{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kart Köşe Yuvarlaklığı Seçici */}
                <div className="pt-4 border-t border-[#1E2230]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
                    <Square className="w-4 h-4 text-primary" />
                    <span>Kart Köşe Stili (Radius)</span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {PRESET_RADII.map((r) => {
                      const isSelected = site.themeConfig.cardRadius === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSite({
                              ...site,
                              themeConfig: {
                                ...site.themeConfig,
                                cardRadius: r.id,
                              },
                            });
                          }}
                          className={`p-2 rounded-lg border text-center text-[11px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow'
                              : 'bg-[#181B26] border-[#272B3C] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vurgu Rengi Seçici */}
                <div className="pt-4 border-t border-[#1E2230]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Marka & Vurgu Rengi
                  </h3>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setSite({
                            ...site,
                            themeConfig: {
                              ...site.themeConfig,
                              primaryColor: c.hex,
                            },
                          });
                        }}
                        className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                          site.themeConfig.primaryColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {site.themeConfig.primaryColor === c.hex && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: HERO / KARŞILAMA ─── */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Yazar Adı / Mahlas
                  </label>
                  <input
                    type="text"
                    value={site.hero.authorName}
                    onChange={(e) => setSite({ ...site, hero: { ...site.hero, authorName: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="Adınız veya yazar mahlasınız"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Edebi Ünvan / Alt Başlık
                  </label>
                  <input
                    type="text"
                    value={site.hero.authorTitle}
                    onChange={(e) => setSite({ ...site, hero: { ...site.hero, authorTitle: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="Örn: Fantastik Kurgu Yazarı & Dünya Mimarı"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Karşılama Mottosu & Kısa Bio
                  </label>
                  <textarea
                    rows={3}
                    value={site.hero.bioShort}
                    onChange={(e) => setSite({ ...site, hero: { ...site.hero, bioShort: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="Ziyaretçiyi karşılayan edebi birkaç cümle..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Anlık Yazar Durumu (Live Writing Status)
                  </label>
                  <input
                    type="text"
                    value={site.hero.currentStatus || ''}
                    onChange={(e) => setSite({ ...site, hero: { ...site.hero, currentStatus: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="Örn: Şu an 'Gölge Çağı 3. Cilt' üzerinde çalışıyor..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Yazar Portre Görseli URL
                  </label>
                  <input
                    type="url"
                    value={site.hero.avatarUrl || ''}
                    onChange={(e) => setSite({ ...site, hero: { ...site.hero, avatarUrl: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Ana Eylem Butonu Metni (CTA)
                  </label>
                  <input
                    type="text"
                    value={site.hero.ctaButton?.text || 'Son Eseri Oku'}
                    onChange={(e) => setSite({
                      ...site,
                      hero: {
                        ...site.hero,
                        ctaButton: {
                          ...site.hero.ctaButton,
                          text: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 3: ESERLER VİTRİNİ ─── */}
            {activeTab === 'books' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Vitrin Başlığı
                  </label>
                  <input
                    type="text"
                    value={site.booksConfig.title}
                    onChange={(e) => setSite({ ...site, booksConfig: { ...site.booksConfig, title: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Vitrin Açıklaması
                  </label>
                  <input
                    type="text"
                    value={site.booksConfig.description || ''}
                    onChange={(e) => setSite({ ...site, booksConfig: { ...site.booksConfig, description: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 border-t border-[#1E2230]">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 mb-2">
                    Öne Çıkarılacak Kitaplar
                  </h4>
                  <p className="text-xs text-neutral-500 mb-3">
                    Hiçbirini seçmezseniz yayınlanmış tüm kitaplarınız vitrinde otomatik olarak listelenir.
                  </p>

                  {userStories.length === 0 ? (
                    <div className="p-4 rounded-xl border border-[#272B3C] bg-[#181B26] text-xs text-neutral-400 text-center">
                      Henüz stüdyonuzda kayıtlı roman bulunamadı.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {userStories.map((story) => {
                        const storyId = story.storyId || (story as any).id;
                        const isSelected = site.booksConfig.selectedStoryIds?.includes(storyId);
                        return (
                          <div
                            key={storyId}
                            onClick={() => {
                              const current = site.booksConfig.selectedStoryIds || [];
                              const updated = isSelected 
                                ? current.filter((id) => id !== storyId) 
                                : [...current, storyId];
                              setSite({
                                ...site,
                                booksConfig: {
                                  ...site.booksConfig,
                                  selectedStoryIds: updated,
                                },
                              });
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-primary/10 border-primary text-white' 
                                : 'bg-[#181B26] border-[#272B3C] text-neutral-400 hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-bold line-clamp-1">{story.title}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-neutral-500'}`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 4: EVREN & DÜNYA ─── */}
            {activeTab === 'universe' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#272B3C] bg-[#181B26]">
                  <div>
                    <span className="text-xs font-bold text-white block">Evren Bloğunu Aktif Et</span>
                    <span className="text-[11px] text-neutral-400">Kurgusal dünya, harita ve codex vitrinini göster</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.universeConfig?.enabled || false}
                    onChange={(e) => setSite({
                      ...site,
                      universeConfig: {
                        ...site.universeConfig,
                        enabled: e.target.checked,
                      },
                    })}
                    className="w-5 h-5 accent-primary rounded"
                  />
                </div>

                {site.universeConfig?.enabled && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                        Evren Stüdyosu'ndan Bağla
                      </label>
                      <select
                        value={site.universeConfig.universeId || ''}
                        onChange={(e) => {
                          const selectedUni = userUniverses.find((u) => (u.universeId || (u as any).id) === e.target.value);
                          setSite({
                            ...site,
                            universeConfig: {
                              ...site.universeConfig,
                              universeId: e.target.value,
                              title: selectedUni ? selectedUni.title : site.universeConfig.title,
                              description: selectedUni ? selectedUni.description : site.universeConfig.description,
                            },
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                      >
                        <option value="">Evren Seçiniz...</option>
                        {userUniverses.map((uni) => {
                          const uid = uni.universeId || (uni as any).id;
                          return (
                            <option key={uid} value={uid}>{uni.title}</option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                        Evren Başlığı
                      </label>
                      <input
                        type="text"
                        value={site.universeConfig.title}
                        onChange={(e) => setSite({
                          ...site,
                          universeConfig: { ...site.universeConfig, title: e.target.value },
                        })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                        Evren Tanıtımı
                      </label>
                      <textarea
                        rows={3}
                        value={site.universeConfig.description || ''}
                        onChange={(e) => setSite({
                          ...site,
                          universeConfig: { ...site.universeConfig, description: e.target.value },
                        })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── TAB 5: BİYOGRAFİ & ÖDÜLLER ─── */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Detaylı Edebi Biyografi
                  </label>
                  <textarea
                    rows={6}
                    value={site.aboutConfig.richBioMarkdown}
                    onChange={(e) => setSite({
                      ...site,
                      aboutConfig: { ...site.aboutConfig, richBioMarkdown: e.target.value },
                    })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-[#1E2230]">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 mb-2">
                    Basın Alıntıları & Eleştiriler
                  </h4>
                  {(site.aboutConfig.pressQuotes || []).map((quote, idx) => (
                    <div key={idx} className="p-3 mb-2 rounded-xl bg-[#181B26] border border-[#272B3C] space-y-2">
                      <input
                        type="text"
                        value={quote.quote}
                        onChange={(e) => {
                          const updated = [...site.aboutConfig.pressQuotes];
                          updated[idx].quote = e.target.value;
                          setSite({ ...site, aboutConfig: { ...site.aboutConfig, pressQuotes: updated } });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12141C] border border-[#272B3C] text-xs text-white"
                        placeholder="Alıntı metni..."
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={quote.source}
                          onChange={(e) => {
                            const updated = [...site.aboutConfig.pressQuotes];
                            updated[idx].source = e.target.value;
                            setSite({ ...site, aboutConfig: { ...site.aboutConfig, pressQuotes: updated } });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#12141C] border border-[#272B3C] text-xs text-white"
                          placeholder="Kaynak (örn: Gazete / Kurul)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = site.aboutConfig.pressQuotes.filter((_, i) => i !== idx);
                            setSite({ ...site, aboutConfig: { ...site.aboutConfig, pressQuotes: updated } });
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(site.aboutConfig.pressQuotes || []), { quote: '', source: '', year: '2026' }];
                      setSite({ ...site, aboutConfig: { ...site.aboutConfig, pressQuotes: updated } });
                    }}
                    className="w-full py-2 rounded-xl border border-dashed border-[#272B3C] text-xs font-bold text-neutral-400 hover:text-white hover:border-primary flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Alıntı Ekle</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 6: ETKİNLİKLER ─── */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#272B3C] bg-[#181B26]">
                  <div>
                    <span className="text-xs font-bold text-white block">Etkinlikler Bloğunu Göster</span>
                    <span className="text-[11px] text-neutral-400">İmza günleri, fuarlar ve panelleri listeler</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.eventsConfig?.enabled || false}
                    onChange={(e) => setSite({
                      ...site,
                      eventsConfig: {
                        ...site.eventsConfig,
                        enabled: e.target.checked,
                      },
                    })}
                    className="w-5 h-5 accent-primary rounded"
                  />
                </div>

                {site.eventsConfig?.enabled && (
                  <div>
                    {(site.eventsConfig.events || []).map((ev, idx) => (
                      <div key={ev.id || idx} className="p-3 mb-2 rounded-xl bg-[#181B26] border border-[#272B3C] space-y-2">
                        <input
                          type="text"
                          value={ev.title}
                          onChange={(e) => {
                            const updated = [...site.eventsConfig.events];
                            updated[idx].title = e.target.value;
                            setSite({ ...site, eventsConfig: { ...site.eventsConfig, events: updated } });
                          }}
                          placeholder="Etkinlik Başlığı"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#12141C] border border-[#272B3C] text-xs text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ev.dateStr}
                            onChange={(e) => {
                              const updated = [...site.eventsConfig.events];
                              updated[idx].dateStr = e.target.value;
                              setSite({ ...site, eventsConfig: { ...site.eventsConfig, events: updated } });
                            }}
                            placeholder="Tarih (örn: 14 Kasım 2026)"
                            className="px-3 py-1.5 rounded-lg bg-[#12141C] border border-[#272B3C] text-xs text-white"
                          />
                          <input
                            type="text"
                            value={ev.location}
                            onChange={(e) => {
                              const updated = [...site.eventsConfig.events];
                              updated[idx].location = e.target.value;
                              setSite({ ...site, eventsConfig: { ...site.eventsConfig, events: updated } });
                            }}
                            placeholder="Mekan (örn: Tüyap Salon 2)"
                            className="px-3 py-1.5 rounded-lg bg-[#12141C] border border-[#272B3C] text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [
                          ...(site.eventsConfig.events || []),
                          {
                            id: Date.now().toString(),
                            title: 'Yeni İmza Günü',
                            dateStr: 'Tarih Belirlenecek',
                            location: 'İstanbul',
                            type: 'signing',
                          },
                        ];
                        setSite({ ...site, eventsConfig: { ...site.eventsConfig, events: updated as any } });
                      }}
                      className="w-full py-2 rounded-xl border border-dashed border-[#272B3C] text-xs font-bold text-neutral-400 hover:text-white hover:border-primary flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Etkinlik Ekle</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 7: BÜLTEN & SOSYAL ─── */}
            {activeTab === 'newsletter' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Bülten Başlığı
                  </label>
                  <input
                    type="text"
                    value={site.newsletterConfig.title}
                    onChange={(e) => setSite({ ...site, newsletterConfig: { ...site.newsletterConfig, title: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Bülten Açıklaması
                  </label>
                  <textarea
                    rows={2}
                    value={site.newsletterConfig.description}
                    onChange={(e) => setSite({ ...site, newsletterConfig: { ...site.newsletterConfig, description: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-4 border-t border-[#1E2230] space-y-3">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 mb-1">
                    Spotify & Sosyal Medya
                  </h4>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Spotify Yazma Çalma Listesi URL
                    </label>
                    <input
                      type="url"
                      value={site.socialConfig.spotifyPlaylistUrl || ''}
                      onChange={(e) => setSite({ ...site, socialConfig: { ...site.socialConfig, spotifyPlaylistUrl: e.target.value } })}
                      placeholder="https://open.spotify.com/playlist/..."
                      className="w-full px-4 py-2 rounded-xl bg-[#181B26] border border-[#272B3C] text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Instagram URL</label>
                      <input
                        type="url"
                        value={site.socialConfig.instagram || ''}
                        onChange={(e) => setSite({ ...site, socialConfig: { ...site.socialConfig, instagram: e.target.value } })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-[#181B26] border border-[#272B3C] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">X / Twitter URL</label>
                      <input
                        type="url"
                        value={site.socialConfig.twitter || ''}
                        onChange={(e) => setSite({ ...site, socialConfig: { ...site.socialConfig, twitter: e.target.value } })}
                        placeholder="https://x.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-[#181B26] border border-[#272B3C] text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 8: SEO & BLOKLAR ─── */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Vitrin Blokları (Aç / Kapa)
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: 'hero', label: 'Karşılama & Hero Bloğu' },
                      { key: 'books', label: 'Eserler & Kitap Vitrini' },
                      { key: 'universe', label: 'Kurgusal Evren & Dünya' },
                      { key: 'about', label: 'Biyografi & Basın Alıntıları' },
                      { key: 'events', label: 'Etkinlikler & İmza Günleri' },
                      { key: 'newsletter', label: 'Edebi Bülten Formu' },
                      { key: 'social', label: 'Sosyal Medya & Spotify' },
                    ].map((b) => {
                      const isEnabled = site.enabledBlocks?.[b.key] !== false;
                      return (
                        <div key={b.key} className="flex items-center justify-between p-3 rounded-xl border border-[#272B3C] bg-[#181B26]">
                          <span className="text-xs font-semibold text-white">{b.label}</span>
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              setSite({
                                ...site,
                                enabledBlocks: {
                                  ...(site.enabledBlocks || {}),
                                  [b.key]: e.target.checked,
                                },
                              });
                            }}
                            className="w-4 h-4 accent-primary rounded"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1E2230] space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    SEO & Alan Adı
                  </h3>

                  <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Kişisel Web Sitesi Bağlantınız</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Canlı & Aktif
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-indigo-500/20 text-xs font-mono text-indigo-200">
                      <span>https://www.readixon.com/atelier/@{site.slug || site.username}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `https://www.readixon.com/atelier/@${site.slug || site.username}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Web sitesi bağlantısı panoya kopyalandı!');
                        }}
                        className="text-neutral-400 hover:text-white"
                        title="Kopyala"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Bu adresi Instagram, Twitter, TikTok profilinizde paylaşarak okurlarınızı doğrudan bağımsız web sitenize davet edebilirsiniz.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                      Özel URL Slug
                    </label>
                    <div className="flex items-center rounded-xl bg-[#181B26] border border-[#272B3C] px-3">
                      <span className="text-xs text-neutral-500">readixon.com/atelier/@</span>
                      <input
                        type="text"
                        value={site.slug}
                        onChange={(e) => setSite({ ...site, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                        className="flex-1 py-2.5 px-1 bg-transparent text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                      Google SEO Site Başlığı
                    </label>
                    <input
                      type="text"
                      value={site.seo.siteTitle}
                      onChange={(e) => setSite({ ...site, seo: { ...site.seo, siteTitle: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                      Meta Açıklama (Google Snippet)
                    </label>
                    <textarea
                      rows={3}
                      value={site.seo.description}
                      onChange={(e) => setSite({ ...site, seo: { ...site.seo, description: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#272B3C] text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── SAĞ KOLON: İNTERAKTİF CANLI ÖNİZLEME (DEVICE MOCKUP) ─── */}
        <div 
          className={`lg:col-span-7 flex flex-col bg-[#12141C] border border-[#1E2230] rounded-2xl overflow-hidden ${
            mobileViewSegment === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Önizleme Üst Çubuğu: Cihaz ve Tema Seçimi */}
          <div className="flex items-center justify-between p-3 bg-[#181B26] border-b border-[#1E2230]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-400 mr-1 hidden sm:inline">Önizleme Cihazı:</span>
              <button
                onClick={() => setPreviewDevice('desktop')}
                title="Masaüstü (100%)"
                className={`p-1.5 rounded-lg text-xs transition-colors ${previewDevice === 'desktop' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                title="Tablet (768px)"
                className={`p-1.5 rounded-lg text-xs transition-colors ${previewDevice === 'tablet' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                title="Mobil Telefon (375px)"
                className={`p-1.5 rounded-lg text-xs transition-colors ${previewDevice === 'mobile' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Önizleme Tema Geçişi (Açık, Gece, Sepya, OLED) */}
            <div className="flex items-center gap-1 bg-[#12141C] p-1 rounded-lg border border-[#272B3C]">
              {[
                { id: 'dark', icon: Moon, title: 'Gece Modu' },
                { id: 'light', icon: Sun, title: 'Açık Mod' },
                { id: 'sepia', icon: Coffee, title: 'Sepya Kağıt' },
                { id: 'oled', icon: Sparkles, title: 'OLED Siyah' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPreviewMode(m.id as AtelierThemeMode)}
                  title={m.title}
                  className={`p-1.5 rounded-md text-xs transition-colors ${previewMode === m.id ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  <m.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Cihaz Çerçevesi İçinde Canlı Site Render */}
          <div className="flex-1 bg-[#090A0F] p-2 sm:p-4 overflow-y-auto flex justify-center items-start min-h-[500px]">
            <div
              className={`transition-all duration-300 w-full rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden ${
                previewDevice === 'mobile' 
                  ? 'max-w-[375px]' 
                  : previewDevice === 'tablet' 
                  ? 'max-w-[768px]' 
                  : 'max-w-full'
              }`}
            >
              <AtelierSiteRenderer 
                site={site} 
                initialStories={userStories} 
                overrideMode={previewMode}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
