'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from '@readixon/ui';
import {
  useAuthStore,
  getMyColumnistApplication,
  submitColumnistApplication,
  getMyColumnArticles,
  submitColumnForReview,
  deleteColumnArticle,
  ColumnArticle,
  ColumnistApplication,
  COLUMN_CATEGORIES,
  PUBLISHING_FREQUENCY_OPTIONS,
  ColumnPublishingFrequency,
} from '@readixon/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Feather,
  Plus,
  Clock,
  Eye,
  Heart,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Edit3,
  Trash2,
  ExternalLink,
  Sparkles,
  BookOpen,
  HelpCircle,
  Loader2,
  User,
  ShieldCheck,
  CheckSquare,
  Square,
  FileCheck,
  Scale,
  Calendar,
  X,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';

export default function StudioColumnsPage() {
  const queryClient = useQueryClient();
  const { userProfile, firebaseUser } = useAuthStore();
  const userId = userProfile?.uid;
  const isColumnist = Boolean(userProfile?.isColumnist);

  // ── 1. Kişisel Bilgiler State'leri ──
  const [fullName, setFullName] = useState('');
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // ── 2. Köşe Yazarlığı Bilgileri State'leri ──
  const [targetCategories, setTargetCategories] = useState<string[]>(['literature', 'culture']);
  const [motivation, setMotivation] = useState('');
  const [hasPriorExperience, setHasPriorExperience] = useState<boolean>(false);
  const [priorWorkLinks, setPriorWorkLinks] = useState('');
  const [publishingFrequency, setPublishingFrequency] = useState<ColumnPublishingFrequency>('weekly_once');
  const [preferredTitle, setPreferredTitle] = useState('Kültür & Sanat Yazarı');

  // ── 3. Örnek Köşe Yazısı State'leri ──
  const [sampleTitle, setSampleTitle] = useState('');
  const [sampleCategory, setSampleCategory] = useState<string>('literature');
  const [sampleSummary, setSampleSummary] = useState('');
  const [sampleContent, setSampleContent] = useState('');

  // ── 4. Beyan ve Onaylar State'leri ──
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);
  const [originalityConfirmed, setOriginalityConfirmed] = useState(false);
  const [editorialGuidelinesAccepted, setEditorialGuidelinesAccepted] = useState(false);
  const [noGuaranteedAcceptanceAcknowledged, setNoGuaranteedAcceptanceAcknowledged] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // Modal State'leri (Yayın İlkeleri & KVKK)
  const [activeModal, setActiveModal] = useState<'guidelines' | 'kvkk' | null>(null);
  const [isReapplying, setIsReapplying] = useState(false);

  // Profil yüklendiğinde temel bilgileri doldur
  useEffect(() => {
    if (userProfile) {
      if (!fullName) setFullName(userProfile.displayName || '');
      if (!bio) setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  // Tab Filtresi (Köşe Yazarı Yönetim Paneli İçin)
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'draft' | 'rejected'>('all');

  // 1. Kullanıcının Başvuru Durumu
  const {
    data: application,
    isLoading: applicationLoading,
  } = useQuery<ColumnistApplication | null>({
    queryKey: ['columnist_application', userId],
    queryFn: () => (userId ? getMyColumnistApplication(userId) : Promise.resolve(null)),
    enabled: Boolean(userId) && !isColumnist,
  });

  // 2. Yazarın Kendi Köşe Yazıları
  const {
    data: articles = [],
    isLoading: articlesLoading,
  } = useQuery<ColumnArticle[]>({
    queryKey: ['my_columns', userId],
    queryFn: () => (userId ? getMyColumnArticles(userId) : Promise.resolve([])),
    enabled: Boolean(userId) && isColumnist,
  });

  // Örnek Metin Kelime Sayacı
  const plainSampleText = sampleContent.replace(/<[^>]+>/g, '').trim();
  const sampleWordCount = plainSampleText ? plainSampleText.split(/\s+/).filter(Boolean).length : 0;
  const isWordCountValid = sampleWordCount >= 300 && sampleWordCount <= 1000;

  // Kategori Seçimini Toggle Et
  const toggleCategory = (catId: string) => {
    setTargetCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  // Başvuru Gönderme Mutasyonu
  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Oturum açmanız gerekiyor.');

      // 1. Kişisel Bilgiler Kontrolü
      if (!fullName.trim()) throw new Error('Lütfen Ad ve Soyad alanını doldurun.');
      if (!bio.trim()) throw new Error('Lütfen kısa biyografinizi yazın.');

      // 2. Köşe Yazarlığı Bilgileri Kontrolü
      if (targetCategories.length === 0) throw new Error('Lütfen en az bir köşe yazarlığı alanı seçin.');
      if (motivation.trim().length < 30) throw new Error('Lütfen Readixon\'da köşe yazarı olma motivasyonunuzu açıklayın (en az 30 karakter).');

      // 3. Örnek Yazı Kontrolü
      if (!sampleTitle.trim()) throw new Error('Lütfen örnek köşe yazısı başlığını girin.');
      if (!sampleCategory) throw new Error('Lütfen örnek yazınızın kategorisini seçin.');
      if (sampleWordCount < 300) {
        throw new Error(`Örnek köşe yazısı en az 300 kelime olmalıdır. (Şu an: ${sampleWordCount} kelime)`);
      }
      if (sampleWordCount > 1000) {
        throw new Error(`Örnek köşe yazısı en fazla 1.000 kelime olabilir. (Şu an: ${sampleWordCount} kelime)`);
      }

      // 4. Beyan ve Onay Kontrolleri
      if (!accuracyConfirmed) throw new Error('Lütfen bilgilerin doğruluğuna ilişkin beyanı onaylayın.');
      if (!originalityConfirmed) throw new Error('Lütfen örnek yazının telif haklarına ve size ait olduğuna dair beyanı onaylayın.');
      if (!editorialGuidelinesAccepted) throw new Error('Lütfen Yayın İlkeleri\'ni okuyup onaylayın.');
      if (!noGuaranteedAcceptanceAcknowledged) throw new Error('Lütfen editoryal değerlendirme şartını onaylayın.');
      if (!kvkkAccepted) throw new Error('Lütfen KVKK Aydınlatma Metni\'ni onaylayın.');

      return submitColumnistApplication(userId, {
        fullName,
        penName,
        bio,
        portfolioUrl,
        targetCategories,
        motivation,
        hasPriorExperience,
        priorWorkLinks,
        publishingFrequency,
        preferredTitle,
        sampleTitle,
        sampleCategory,
        sampleSummary,
        sampleContent,
        accuracyConfirmed,
        originalityConfirmed,
        editorialGuidelinesAccepted,
        noGuaranteedAcceptanceAcknowledged,
        kvkkAccepted,
      });
    },
    onSuccess: () => {
      toast.success('Köşe yazarlığı başvurunuz başarıyla alındı! Editör masamız başvurunuzu titizlikle değerlendirecektir.');
      setIsReapplying(false);
      queryClient.invalidateQueries({ queryKey: ['columnist_application', userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Başvuru gönderilirken bir hata oluştu.');
    },
  });

  // Onaya Gönderme Mutasyonu
  const submitReviewMutation = useMutation({
    mutationFn: async (articleId: string) => {
      if (!userId) return;
      await submitColumnForReview(articleId, userId);
    },
    onSuccess: () => {
      toast.success('Yazınız editör onayına gönderildi!');
      queryClient.invalidateQueries({ queryKey: ['my_columns', userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Onaya gönderilemedi.');
    },
  });

  // Silme Mutasyonu
  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      if (!userId) return;
      if (!confirm('Bu köşe yazısını kalıcı olarak silmek istediğinize emin misiniz?')) return;
      await deleteColumnArticle(articleId, userId);
    },
    onSuccess: () => {
      toast.success('Köşe yazısı silindi.');
      queryClient.invalidateQueries({ queryKey: ['my_columns', userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Yazı silinirken bir hata oluştu.');
    },
  });

  // ─────────────────────────────────────────────────────────────
  // SENARYO 1: Yazar Henüz Köşe Yazarı Değilse (Başvuru Ekranı)
  // ─────────────────────────────────────────────────────────────
  if (!isColumnist) {
    if (applicationLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <Typography variant="body" className="text-muted">Başvuru durumu kontrol ediliyor...</Typography>
        </div>
      );
    }

    // A) Bekleyen Başvuru Varsa (Kapsamlı İnceleme Özeti)
    if (application && application.status === 'pending') {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
          <div className="bg-card/70 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">Değerlendirme Sürüyor</span>
                <Typography variant="h3" className="font-extrabold text-foreground text-xl sm:text-2xl">
                  Köşe Yazarlığı Başvurunuz İncelemede
                </Typography>
              </div>
            </div>

            <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
              Readixon Gündem masasına ilettiğiniz köşe yazarlığı başvurunuz ve 4 aşamalı değerlendirme dosyanız editörlerimizce incelenmektedir.
              Özgünlük, anlatım gücü ve editoryal ilkelere uygunluk değerlendirmesi tamamlandığında bildirim alacaksınız.
            </p>

            {/* 4 Bölümlü Başvuru Özeti */}
            <div className="space-y-4">
              {/* 1. Kişisel Bilgiler */}
              <div className="bg-background/60 border border-border/50 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">1. Kişisel Bilgiler</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted block">Ad ve Soyad:</span>
                    <span className="font-bold text-foreground">{application.fullName || application.userName}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Kullanıcı Adı:</span>
                    <span className="font-semibold text-foreground">@{application.username || application.userUsername}</span>
                  </div>
                  {application.penName && (
                    <div>
                      <span className="text-muted block">Mahlas / Yazar Adı:</span>
                      <span className="font-semibold text-primary">{application.penName}</span>
                    </div>
                  )}
                  {application.portfolioUrl && (
                    <div>
                      <span className="text-muted block">Portföy / Bağlantı:</span>
                      <span className="font-medium text-foreground truncate block">{application.portfolioUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Köşe Yazarlığı Bilgileri */}
              <div className="bg-background/60 border border-border/50 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">2. Köşe Yazarlığı Tercihleri</span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted block mb-1">Yazılacak Alanlar:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(application.targetCategories || [application.expertiseArea]).map((catId: any) => {
                        const name = COLUMN_CATEGORIES.find((c: any) => c.id === catId)?.name || catId;
                        return (
                          <span key={catId} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px] border border-primary/20">
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted block">Planlanan Yayın Sıklığı:</span>
                    <span className="font-semibold text-foreground">
                      {PUBLISHING_FREQUENCY_OPTIONS.find(p => p.id === application.publishingFrequency)?.label || 'Haftada 1'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Başvuru Motivasyonu:</span>
                    <p className="text-xs text-muted/90 italic bg-card/40 p-2.5 rounded-xl border border-border/30 mt-1">
                      "{application.motivation || 'Edebi üretim ve kültür-sanat yazıları'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Örnek Köşe Yazısı */}
              <div className="bg-background/60 border border-border/50 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">3. İncelenen Örnek Köşe Yazısı</span>
                  <span className="text-[11px] text-muted font-medium">
                    {application.sampleWordCount || 0} Kelime
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-extrabold text-foreground text-sm block">"{application.sampleTitle}"</span>
                  {application.sampleSummary && (
                    <span className="text-muted italic block">Spot: {application.sampleSummary}</span>
                  )}
                  <p className="text-xs text-muted/80 line-clamp-3 font-serif bg-card/40 p-3 rounded-xl border border-border/30 mt-2">
                    {application.sampleContent}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link href="/agenda" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
                <span>Gündem Sayfasına Dön</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // B) Reddedilmiş Başvuru Varsa
    if (application && application.status === 'rejected' && !isReapplying) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
          <div className="bg-card/70 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 block">Başvuru Sonucu</span>
                <Typography variant="h3" className="font-extrabold text-foreground text-xl sm:text-2xl">
                  Başvurunuz İncelendi ve Geri Bildirim Verildi
                </Typography>
              </div>
            </div>

            <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
              Köşe yazarlığı başvurunuz mevcut yayın kriterleri doğrultusunda şu aşamada onaylanamamıştır.
            </p>

            {application.rejectReason && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 mb-8">
                <span className="text-xs font-bold text-rose-500 block mb-1">Editörün Açıklaması:</span>
                <p className="text-sm text-foreground/90 leading-relaxed">{application.rejectReason}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setFullName(application.fullName || application.userName || '');
                  setPenName(application.penName || '');
                  setBio(application.bio || application.userBio || '');
                  setPortfolioUrl(application.portfolioUrl || '');
                  setTargetCategories(application.targetCategories || ['literature']);
                  setMotivation(application.motivation || '');
                  setHasPriorExperience(Boolean(application.hasPriorExperience));
                  setPriorWorkLinks(application.priorWorkLinks || '');
                  setPublishingFrequency(application.publishingFrequency || 'weekly_once');
                  setPreferredTitle(application.preferredTitle || 'Kültür & Sanat Yazarı');
                  setSampleTitle(application.sampleTitle || '');
                  setSampleCategory(application.sampleCategory || 'literature');
                  setSampleSummary(application.sampleSummary || '');
                  setSampleContent(application.sampleContent || '');
                  setIsReapplying(true);
                }}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Bilgileri Düzenle ve Yeniden Başvur
              </button>
              <Link href="/agenda" className="text-sm font-semibold text-muted hover:text-foreground">
                Gündem'e Dön
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // C) Profesyonel 4 Bölümlü Başvuru Formu
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-border/50 bg-gradient-to-br from-primary/10 via-purple-500/5 to-card shadow-xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
              <Feather size={14} />
              <span>Gündem Masası Başvurusu</span>
            </div>
            <Typography variant="h1" className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
              Readixon Gündem Kalemi Olun 🖋️
            </Typography>
            <p className="text-muted text-sm sm:text-base leading-relaxed">
              Edebiyat, kültür, sanat, düşünce ve yaşam üzerine yazdığınız köşe yazılarınızı
              Readixon'un en prestijli vitrininde on binlerce edebiyatsever okurla buluşturun.
            </p>
          </div>
        </div>

        {/* ── BÖLÜM 1: KİŞİSEL BİLGİLER ── */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center">
              1
            </span>
            <div>
              <Typography variant="h3" className="font-extrabold text-foreground text-lg sm:text-xl">
                Kişisel Bilgiler
              </Typography>
              <p className="text-xs text-muted">
                Temel iletişim ve profil bilgileriniz (T.C. kimlik veya açık adres talep edilmez).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ad ve Soyad (Zorunlu) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Ad ve Soyad *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors"
              />
            </div>

            {/* Yazar Adı / Mahlas (İsteğe Bağlı) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Yazar Adı / Mahlas <span className="text-[11px] font-normal text-muted/70">(İsteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                placeholder="Köşenizde mahlas kullanmak istiyorsanız"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors"
              />
            </div>

            {/* Kullanıcı Adı (Otomatik) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Kullanıcı Adı <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md ml-1">Otomatik</span>
              </label>
              <input
                type="text"
                value={`@${userProfile?.username || 'kullanici'}`}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-muted/15 border border-border/40 text-sm text-muted cursor-not-allowed"
              />
            </div>

            {/* E-posta (Otomatik) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                E-posta Adresi <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md ml-1">Otomatik</span>
              </label>
              <input
                type="text"
                value={(userProfile as any)?.email || firebaseUser?.email || 'kayitli-eposta@readixon.com'}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-muted/15 border border-border/40 text-sm text-muted cursor-not-allowed"
              />
            </div>
          </div>

          {/* Kısa Biyografi (Zorunlu) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Kısa Biyografi *
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Eğitim, ilgi alanlarınız ve edebi geçmişinizi özetleyen kısa bir tanıtım..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden resize-none transition-colors"
            />
          </div>

          {/* Sosyal Medya / Portföy (İsteğe Bağlı) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Sosyal Medya / Portföy Bağlantısı <span className="text-[11px] font-normal text-muted/70">(İsteğe bağlı)</span>
            </label>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3.5 top-3 text-muted" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://medium.com/@... veya web sitesi"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── BÖLÜM 2: KÖŞE YAZARLIĞI BİLGİLERİ ── */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center">
              2
            </span>
            <div>
              <Typography variant="h3" className="font-extrabold text-foreground text-lg sm:text-xl">
                Köşe Yazarlığı Bilgileri
              </Typography>
              <p className="text-xs text-muted">
                Yazmak istediğiniz alanlar, motivasyonunuz ve yayın planınız.
              </p>
            </div>
          </div>

          {/* Hangi alanlarda köşe yazmak istiyorsunuz? (Çoklu Seçim) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                Hangi Alanlarda Köşe Yazmak İstiyorsunuz? *
              </label>
              <span className="text-[11px] text-primary font-bold">
                {targetCategories.length} alan seçildi
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLUMN_CATEGORIES.map((cat: any) => {
                const isSelected = targetCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-card hover:bg-card/80 border-border/60 text-muted hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neden Readixon'da köşe yazarı olmak istiyorsunuz? (Uzun Metin) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Neden Readixon'da Köşe Yazarı Olmak İstiyorsunuz? *
            </label>
            <textarea
              rows={4}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Readixon'un edebi ekosistemine katmak istediğiniz değer, okurlarla kurmak istediğiniz fikir bağı ve motivasyonunuz..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Daha önce köşe yazarlığı veya içerik üreticiliği yaptınız mı? (Evet / Hayır) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Daha Önce Köşe Yazarlığı / İçerik Üreticiliği Yaptınız mı? *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasPriorExperience(true)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    hasPriorExperience
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border/60 text-muted hover:text-foreground'
                  }`}
                >
                  Evet, yaptım
                </button>
                <button
                  type="button"
                  onClick={() => setHasPriorExperience(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !hasPriorExperience
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border/60 text-muted hover:text-foreground'
                  }`}
                >
                  Hayır, ilk deneyimim
                </button>
              </div>
            </div>

            {/* Ne sıklıkla yazı yayımlamayı planlıyorsunuz? */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Ne Sıklıkla Yazı Yayımlamayı Planlıyorsunuz? *
              </label>
              <select
                value={publishingFrequency}
                onChange={(e) => setPublishingFrequency(e.target.value as ColumnPublishingFrequency)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm font-medium text-foreground focus:border-primary focus:outline-hidden"
              >
                {PUBLISHING_FREQUENCY_OPTIONS.map((freq) => (
                  <option key={freq.id} value={freq.id}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Daha önce yayımlanmış yazılarınız var mı? (Bağlantı) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Daha Önce Yayımlanmış Yazılarınız Var mı? <span className="text-[11px] font-normal text-muted/70">(İsteğe bağlı bağlantı veya yayın adı)</span>
            </label>
            <input
              type="text"
              value={priorWorkLinks}
              onChange={(e) => setPriorWorkLinks(e.target.value)}
              placeholder="Örn: https://gazete... veya 'Varlık Dergisi 2025 sayı 4'"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors"
            />
          </div>

          {/* Talep Edilen Unvan */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Talep Edilen Köşe Unvanı <span className="text-[11px] font-normal text-muted/70">(Örn: Edebiyat Eleştirmeni, Kültür & Sanat Yazarı)</span>
            </label>
            <input
              type="text"
              value={preferredTitle}
              onChange={(e) => setPreferredTitle(e.target.value)}
              placeholder="Kültür & Sanat Yazarı"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        {/* ── BÖLÜM 3: ÖRNEK KÖŞE YAZISI (300 - 1000 KELİME) ── */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center">
              3
            </span>
            <div>
              <Typography variant="h3" className="font-extrabold text-foreground text-lg sm:text-xl">
                Örnek Köşe Yazısı
              </Typography>
              <p className="text-xs text-muted">
                Başvurunun en kritik bölümü. Kendinize ait, daha önce yayımlanmamış özgün bir deneme metni.
              </p>
            </div>
          </div>

          {/* Bilgilendirme Kutusu */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed space-y-1">
              <span className="font-bold text-foreground block">
                Editoryal Değerlendirme Güvencesi:
              </span>
              <p>
                Bu yazı <strong>otomatik yayımlanmaz</strong>. Yalnızca Readixon editör masası tarafından değerlendirilir.
                Değerlendirmede özgünlük, anlatım gücü, tutarlılık, kaynak kullanımı ve platformun yayın ilkelerine uygunluk esas alınır.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Yazı Başlığı (Zorunlu) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Örnek Yazı Başlığı *
              </label>
              <input
                type="text"
                value={sampleTitle}
                onChange={(e) => setSampleTitle(e.target.value)}
                placeholder="Örn: Modern Zamanlarda Derin Okumanın Kaybı"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm font-semibold text-foreground focus:border-primary focus:outline-hidden transition-colors"
              />
            </div>

            {/* Yazı Kategorisi (Zorunlu) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Yazı Kategorisi *
              </label>
              <select
                value={sampleCategory}
                onChange={(e) => setSampleCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm font-medium text-foreground focus:border-primary focus:outline-hidden"
              >
                {COLUMN_CATEGORIES.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Yazının Kısa Açıklaması / Spotu (İsteğe Bağlı) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Yazının Kısa Açıklaması / Spotu <span className="text-[11px] font-normal text-muted/70">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              value={sampleSummary}
              onChange={(e) => setSampleSummary(e.target.value)}
              placeholder="Yazının ana fikrini özetleyen tek cümlelik edebi spot..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden transition-colors"
            />
          </div>

          {/* Örnek Köşe Yazısı Metni (300 - 1000 Kelime) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                Örnek Köşe Yazısı Metni * (300 – 1.000 Kelime)
              </label>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isWordCountValid
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {sampleWordCount} / 300-1000 Kelime
              </span>
            </div>
            <textarea
              rows={12}
              value={sampleContent}
              onChange={(e) => setSampleContent(e.target.value)}
              placeholder="Edebi üslubunuzu, fikir derinliğinizi ve anlatım tutarlılığınızı yansıtan özgün köşe yazınızı buraya yazın..."
              className="w-full px-5 py-4 rounded-2xl bg-background border border-border/60 focus:border-primary focus:outline-hidden text-sm sm:text-base text-foreground font-serif leading-relaxed placeholder:font-sans placeholder:text-muted/40 resize-y transition-colors"
            />
            {!isWordCountValid && (
              <p className="text-[11px] text-amber-500 mt-1 font-medium">
                {sampleWordCount < 300
                  ? `Yazınız şu anda ${sampleWordCount} kelimedir. Başvurunun değerlendirilmesi için en az 300 kelimeye ulaşmalıdır.`
                  : `Yazınız şu anda ${sampleWordCount} kelimedir. Lütfen en fazla 1.000 kelime olacak şekilde düzenleyin.`}
              </p>
            )}
          </div>
        </div>

        {/* ── BÖLÜM 4: BEYAN VE ONAYLAR ── */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center">
              4
            </span>
            <div>
              <Typography variant="h3" className="font-extrabold text-foreground text-lg sm:text-xl">
                Beyan ve Yasal Onaylar
              </Typography>
              <p className="text-xs text-muted">
                Başvurunuzun geçerli olabilmesi için aşağıdaki beyanları onaylamanız gerekmektedir.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Doğruluk Beyanı */}
            <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accuracyConfirmed}
                onChange={(e) => setAccuracyConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0"
              />
              <span>Başvuru kapsamında sunduğum bilgilerin doğru olduğunu beyan ederim.</span>
            </label>

            {/* 2. Özgünlük Beyanı */}
            <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={originalityConfirmed}
                onChange={(e) => setOriginalityConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0"
              />
              <span>Örnek yazının bana ait olduğunu ve üçüncü kişilerin haklarını ihlal etmediğini beyan ederim.</span>
            </label>

            {/* 3. Yayın İlkeleri Onayı */}
            <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editorialGuidelinesAccepted}
                onChange={(e) => setEditorialGuidelinesAccepted(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0"
              />
              <span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveModal('guidelines');
                  }}
                  className="text-primary font-bold underline mr-1 hover:text-primary/80"
                >
                  Readixon Köşe Yazarlığı Yayın İlkeleri
                </button>
                'ni okudum ve kabul ediyorum.
              </span>
            </label>

            {/* 4. Kabul Garantisi Olmadığı Beyanı */}
            <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noGuaranteedAcceptanceAcknowledged}
                onChange={(e) => setNoGuaranteedAcceptanceAcknowledged(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0"
              />
              <span>Başvurumun editoryal değerlendirmeye tabi olduğunu ve kabul garantisi bulunmadığını biliyorum.</span>
            </label>

            {/* 5. KVKK Aydınlatma Metni */}
            <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0"
              />
              <span>
                Köşe yazarlığı başvuru sürecine ilişkin{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveModal('kvkk');
                  }}
                  className="text-primary font-bold underline mx-1 hover:text-primary/80"
                >
                  KVKK Aydınlatma Metni
                </button>
                'ni okudum ve onaylıyorum.
              </span>
            </label>
          </div>

          {/* Form Altı Gönderme Butonu */}
          <div className="flex items-center justify-between pt-6 border-t border-border/40">
            {isReapplying && (
              <button
                type="button"
                onClick={() => setIsReapplying(false)}
                className="text-xs font-bold text-muted hover:text-foreground cursor-pointer"
              >
                Vazgeç
              </button>
            )}

            <button
              type="button"
              disabled={applyMutation.isPending || !isWordCountValid}
              onClick={() => applyMutation.mutate()}
              className="ml-auto px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Başvuru İletiliyor...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Başvuruyu Tamamla ve Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── YAYIN İLKELERİ VE KVKK MODALLARI ── */}
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <Typography variant="h3" className="font-extrabold text-foreground text-lg">
                  {activeModal === 'guidelines' ? 'Köşe Yazarlığı Yayın İlkeleri' : 'KVKK Aydınlatma Metni'}
                </Typography>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-muted hover:text-foreground p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {activeModal === 'guidelines' ? (
                <div className="text-xs sm:text-sm text-muted/90 leading-relaxed space-y-3 font-sans">
                  <p>
                    <strong>1. Özgünlük ve Telif:</strong> Köşe yazılarında intihal, izinsiz alıntı veya telif hakkı ihlali kabul edilemez. Alıntılar mutlaka kaynak gösterilerek yapılmalıdır.
                  </p>
                  <p>
                    <strong>2. Edebi ve Entelektüel Düzey:</strong> Yazılar edebi derinlik, fikir tutarlılığı ve saygılı bir dil taşımalıdır. Hakaret, nefret söylemi, ayrımcılık ve iftira içeren içerikler yayımlanmaz.
                  </p>
                  <p>
                    <strong>3. Editoryal İnceleme:</strong> Her köşe yazısı Gündem masası editörlerinin onayından geçerek yayımlanır. Editörler imla düzeltmeleri önerme veya yazıyı gerekçesiyle reddetme hakkını saklı tutar.
                  </p>
                  <p>
                    <strong>4. Sorumluluk:</strong> Yayımlanan yazıların düşünsel ve yasal sorumluluğu yazara aittir.
                  </p>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-muted/90 leading-relaxed space-y-3 font-sans">
                  <p>
                    <strong>Veri Sorumlusu:</strong> Readixon Platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca köşe yazarlığı başvurunuz kapsamında sağladığınız ad-soyad, mahlas, biyografi, portföy ve e-posta verileriniz, yalnızca başvuru değerlendirme, editoryal iletişim ve yazar profilinizin oluşturulması amacıyla işlenmektedir.
                  </p>
                  <p>
                    <strong>Veri Güvenliği:</strong> T.C. kimlik numarası, açık adres veya telefon gibi hassas veriler bu aşamada toplanmamaktadır. Verileriniz üçüncü taraflarla paylaşılmaz ve güvenli sunucularda saklanır.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                >
                  Anladım ve Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SENARYO 2: Kullanıcı Onaylı Köşe Yazarı İse (Yönetim Paneli)
  // ─────────────────────────────────────────────────────────────
  const filteredArticles = articles.filter((art) => {
    if (statusFilter === 'all') return true;
    return art.status === statusFilter;
  });

  const totalViews = articles.reduce((sum, a) => sum + (a.stats?.views || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.stats?.likes || 0), 0);
  const publishedCount = articles.filter(a => a.status === 'published').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      {/* Üst Yazar Başlığı & Aksiyon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 p-[1px] shadow-md shrink-0">
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.displayName || 'Yazar'}
                className="w-full h-full object-cover rounded-[15px]"
              />
            ) : (
              <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center text-primary">
                <Feather size={24} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h3" className="font-extrabold text-foreground text-xl sm:text-2xl">
                {userProfile?.displayName || 'Köşe Yazarı'}
              </Typography>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                Onaylı Kalem
              </span>
            </div>
            <p className="text-xs text-muted font-medium mt-0.5">
              {userProfile?.columnistTitle || 'Readixon Gündem Yazarı'}
            </p>
          </div>
        </div>

        <Link
          href="/studio/columns/new"
          className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Yeni Köşe Yazısı Yaz</span>
        </Link>
      </div>

      {/* İstatistik Özet Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card/40 border border-border/50 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-muted font-medium block">Toplam Yazı</span>
          <span className="text-2xl font-black text-foreground mt-1 block">{articles.length}</span>
        </div>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-muted font-medium block">Yayında</span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">{publishedCount}</span>
        </div>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-muted font-medium block">Toplam Okunma</span>
          <span className="text-2xl font-black text-primary mt-1 block">{totalViews.toLocaleString('tr-TR')}</span>
        </div>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-muted font-medium block">Toplam Beğeni</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">{totalLikes.toLocaleString('tr-TR')}</span>
        </div>
      </div>

      {/* Filtre Tabları */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'published', label: 'Yayındakiler' },
          { id: 'pending', label: 'Onay Bekleyenler' },
          { id: 'draft', label: 'Taslaklar' },
          { id: 'rejected', label: 'Düzeltme İstenenler' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card/60 text-muted hover:text-foreground hover:bg-card border border-border/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Yazı Listesi */}
      {articlesLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted">
          <Loader2 className="animate-spin text-primary mb-3" size={28} />
          <p className="text-sm">Yazılarınız yükleniyor...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-16 text-center bg-card/20 border border-border/40 rounded-3xl p-8">
          <FileText className="mx-auto text-muted mb-3 opacity-40" size={40} />
          <Typography variant="h4" className="font-bold text-foreground mb-1">
            Henüz bu sekmede köşe yazınız bulunmuyor
          </Typography>
          <p className="text-xs text-muted max-w-sm mx-auto mb-6">
            Edebi denemelerinizi ve kültür-sanat yazılarınızı Gündem sayfası için hemen kaleme alabilirsiniz.
          </p>
          <Link
            href="/studio/columns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>İlk Köşe Yazını Yaz</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredArticles.map((article) => {
            const statusConfig = {
              published: { label: 'Yayında', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
              pending: { label: 'Editör Onayında', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
              draft: { label: 'Taslak', color: 'bg-muted/20 text-muted border-border/40' },
              rejected: { label: 'Düzeltme Gerekli', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
            }[article.status as 'published' | 'pending' | 'draft' | 'rejected'] || { label: article.status, color: 'bg-muted text-muted' };

            const categoryName = COLUMN_CATEGORIES.find((c: any) => c.id === article.category)?.name || 'Kültür & Sanat';

            return (
              <div
                key={article.id}
                className="bg-card/50 hover:bg-card/80 border border-border/50 hover:border-border rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Feather size={28} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-[11px] font-semibold text-muted bg-muted/10 px-2 py-0.5 rounded-md">
                        {categoryName}
                      </span>
                      <span className="text-[11px] text-muted flex items-center gap-1">
                        <Clock size={11} />
                        {article.readingTime || 2} dk okuma
                      </span>
                    </div>

                    <Typography variant="h4" className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base sm:text-lg line-clamp-1">
                      {article.title}
                    </Typography>

                    {article.subtitle && (
                      <p className="text-xs text-muted line-clamp-1 mt-0.5">
                        {article.subtitle}
                      </p>
                    )}

                    {article.status === 'rejected' && article.rejectReason && (
                      <p className="text-xs text-rose-500 font-medium mt-2 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                        Editör Notu: {article.rejectReason}
                      </p>
                    )}

                    {/* Stats Strip */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted font-medium">
                      <div className="flex items-center gap-1">
                        <Eye size={13} className="text-primary" />
                        <span>{article.stats?.views?.toLocaleString('tr-TR') || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={13} className="text-rose-500" />
                        <span>{article.stats?.likes?.toLocaleString('tr-TR') || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {article.status === 'published' && (
                    <Link
                      href={`/agenda/kose-yazilari/${article.slug || article.id}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-card hover:bg-muted/10 border border-border/50 text-muted hover:text-foreground transition-all cursor-pointer"
                      title="Gündem'de Gör"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}

                  {(article.status === 'draft' || article.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={() => submitReviewMutation.mutate(article.id)}
                      disabled={submitReviewMutation.isPending}
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      title="Editör Onayına Gönder"
                    >
                      <Send size={13} />
                      <span>Onaya Gönder</span>
                    </button>
                  )}

                  <Link
                    href={`/studio/columns/${article.id}`}
                    className="p-2.5 rounded-xl bg-card hover:bg-muted/10 border border-border/50 text-muted hover:text-foreground transition-all cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit3 size={16} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(article.id)}
                    className="p-2.5 rounded-xl bg-card hover:bg-rose-500/10 border border-border/50 text-muted hover:text-rose-500 transition-all cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
