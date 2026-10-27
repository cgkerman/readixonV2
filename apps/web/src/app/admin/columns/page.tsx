'use client';

import React, { useState } from 'react';
import { Typography } from '@readixon/ui';
import {
  useAuthStore,
  getAllColumnistApplicationsAdmin,
  approveColumnistApplicationAdmin,
  rejectColumnistApplicationAdmin,
  getAllColumnsAdmin,
  approveAndPublishColumnAdmin,
  rejectColumnAdmin,
  setFeaturedColumnAdmin,
  deleteColumnArticle,
  ColumnistApplication,
  ColumnArticle,
  ApplicationStatus,
  ColumnStatus,
  COLUMN_CATEGORIES,
  PUBLISHING_FREQUENCY_OPTIONS,
} from '@readixon/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Feather,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  Trash2,
  Loader2,
  FileText,
  UserCheck,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  User,
  Globe,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminColumnsPage() {
  const queryClient = useQueryClient();
  const { userProfile } = useAuthStore();
  const adminId = userProfile?.uid || 'admin';

  const [activeMainTab, setActiveMainTab] = useState<'applications' | 'articles'>('applications');

  // Başvuru Tab Filtresi
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | ApplicationStatus>('pending');
  // Yazı Tab Filtresi
  const [articleStatusFilter, setArticleStatusFilter] = useState<'all' | ColumnStatus>('pending');

  // Başvuru İnceleme Modalı State'leri
  const [selectedApp, setSelectedApp] = useState<ColumnistApplication | null>(null);
  const [assignedTitleInput, setAssignedTitleInput] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isRejectingApp, setIsRejectingApp] = useState(false);

  // Yazı İnceleme Modalı State'leri
  const [selectedArticle, setSelectedArticle] = useState<ColumnArticle | null>(null);
  const [articleRejectReason, setArticleRejectReason] = useState('');
  const [isRejectingArticle, setIsRejectingArticle] = useState(false);
  const [makeFeaturedOnPublish, setMakeFeaturedOnPublish] = useState(false);

  // 1. Başvurular Sorgusu
  const {
    data: applications = [],
    isLoading: appsLoading,
  } = useQuery<ColumnistApplication[]>({
    queryKey: ['admin_columnist_applications', appStatusFilter],
    queryFn: () => getAllColumnistApplicationsAdmin(appStatusFilter === 'all' ? undefined : appStatusFilter),
  });

  // 2. Yazılar Sorgusu
  const {
    data: articles = [],
    isLoading: articlesLoading,
  } = useQuery<ColumnArticle[]>({
    queryKey: ['admin_columns', articleStatusFilter],
    queryFn: () => getAllColumnsAdmin(articleStatusFilter === 'all' ? undefined : articleStatusFilter),
  });

  // Başvuru Onayla
  const approveAppMutation = useMutation({
    mutationFn: async ({ appId, title }: { appId: string; title: string }) => {
      await approveColumnistApplicationAdmin(appId, title, adminId);
    },
    onSuccess: () => {
      toast.success('Köşe yazarlığı başvurusu onaylandı ve yazara yetki verildi!');
      setSelectedApp(null);
      queryClient.invalidateQueries({ queryKey: ['admin_columnist_applications'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Onaylanamadı.');
    },
  });

  // Başvuru Reddet
  const rejectAppMutation = useMutation({
    mutationFn: async ({ appId, reason }: { appId: string; reason: string }) => {
      await rejectColumnistApplicationAdmin(appId, reason, adminId);
    },
    onSuccess: () => {
      toast.success('Başvuru reddedildi ve yazara bildirim gönderildi.');
      setSelectedApp(null);
      setIsRejectingApp(false);
      queryClient.invalidateQueries({ queryKey: ['admin_columnist_applications'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'İşlem başarısız.');
    },
  });

  // Yazı Onayla & Yayınla
  const publishArticleMutation = useMutation({
    mutationFn: async ({ articleId, isFeatured }: { articleId: string; isFeatured: boolean }) => {
      await approveAndPublishColumnAdmin(articleId, adminId, { isFeatured });
    },
    onSuccess: () => {
      toast.success('Köşe yazısı onaylandı ve Gündem sayfasında yayına alındı!');
      setSelectedArticle(null);
      queryClient.invalidateQueries({ queryKey: ['admin_columns'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Yayınlanamadı.');
    },
  });

  // Yazı Reddet
  const rejectArticleMutation = useMutation({
    mutationFn: async ({ articleId, reason }: { articleId: string; reason: string }) => {
      await rejectColumnAdmin(articleId, reason, adminId);
    },
    onSuccess: () => {
      toast.success('Yazı reddedildi ve yazara bildirim iletildi.');
      setSelectedArticle(null);
      setIsRejectingArticle(false);
      queryClient.invalidateQueries({ queryKey: ['admin_columns'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'İşlem başarısız.');
    },
  });

  // Featured Toggle
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ articleId, isFeatured }: { articleId: string; isFeatured: boolean }) => {
      await setFeaturedColumnAdmin(articleId, isFeatured);
    },
    onSuccess: () => {
      toast.success('Öne çıkan köşe yazısı güncellendi!');
      queryClient.invalidateQueries({ queryKey: ['admin_columns'] });
    },
  });

  // Yazı Sil
  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      if (!confirm('Bu köşe yazısını kalıcı olarak silmek istediğinize emin misiniz?')) return;
      await deleteColumnArticle(articleId, adminId, true);
    },
    onSuccess: () => {
      toast.success('Yazı silindi.');
      queryClient.invalidateQueries({ queryKey: ['admin_columns'] });
    },
  });

  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const pendingArticlesCount = articles.filter(a => a.status === 'pending').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Feather size={18} />
            </span>
            <Typography variant="h2" className="font-extrabold text-foreground text-2xl tracking-tight">
              Köşe Yazarlığı & Gündem Masası
            </Typography>
          </div>
          <p className="text-xs text-muted">
            4 aşamalı profesyonel yazar başvurularını onaylayın, gelen köşe yazılarını denetleyin ve Gündem sayfasında yayınlayın.
          </p>
        </div>

        {/* Ana Sekme Değiştirici */}
        <div className="flex items-center p-1 rounded-2xl bg-muted/20 border border-border/50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMainTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeMainTab === 'applications'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <UserCheck size={15} />
            <span>Yazarlık Başvuruları</span>
            {pendingAppsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-black rounded-full">
                {pendingAppsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('articles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeMainTab === 'articles'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <FileText size={15} />
            <span>Yazı Onay Havuzu</span>
            {pendingArticlesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-primary text-primary-foreground text-[10px] font-black rounded-full">
                {pendingArticlesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SEKME: KÖŞE YAZARLIĞI BAŞVURULARI                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'applications' && (
        <div className="space-y-6">
          {/* Durum Filtresi */}
          <div className="flex items-center gap-2">
            {[
              { id: 'pending', label: 'Bekleyenler' },
              { id: 'all', label: 'Tüm Başvurular' },
              { id: 'approved', label: 'Onaylananlar' },
              { id: 'rejected', label: 'Reddedilenler' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAppStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appStatusFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {appsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted">
              <Loader2 className="animate-spin text-primary mb-3" size={28} />
              <p className="text-xs">Başvurular yükleniyor...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center bg-card/20 border border-border/40 rounded-3xl p-8">
              <UserCheck className="mx-auto text-muted mb-3 opacity-40" size={36} />
              <Typography variant="h4" className="font-bold text-foreground mb-1">
                Bu sekmede başvuru bulunmuyor
              </Typography>
              <p className="text-xs text-muted">
                Yazarlar stüdyodan 4 aşamalı formu doldurup gönderdikçe buraya düşecektir.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const statusStyle = {
                  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                  rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                }[app.status as 'pending' | 'approved' | 'rejected'] || 'bg-muted/10 text-muted';

                const targetCats = app.targetCategories || [app.expertiseArea];
                const authorDisplay = app.fullName || app.userName;

                return (
                  <div
                    key={app.id}
                    className="bg-card/50 hover:bg-card/80 border border-border/50 rounded-3xl p-6 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Yazar Bilgisi */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden shrink-0">
                          {app.userAvatar ? (
                            <img src={app.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (authorDisplay || 'Y').charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground text-base">{authorDisplay}</span>
                            {app.penName && (
                              <span className="text-xs text-muted font-normal">(Mahlas: {app.penName})</span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle}`}>
                              {app.status === 'pending' ? 'Bekliyor' : app.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                            </span>
                          </div>
                          <span className="text-xs text-muted">
                            @{app.username || app.userUsername} • {app.email || 'E-posta'} • Unvan: <strong className="text-primary">{app.assignedTitle || app.preferredTitle}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setAssignedTitleInput(app.preferredTitle || 'Kültür & Sanat Yazarı');
                            setIsRejectingApp(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-card hover:bg-muted/10 border border-border/60 text-foreground font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye size={14} />
                          <span>Başvuruyu İncele</span>
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setAssignedTitleInput(app.preferredTitle || 'Kültür & Sanat Yazarı');
                                setIsRejectingApp(false);
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 size={14} />
                              <span>Onayla</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setRejectReasonInput('');
                                setIsRejectingApp(true);
                              }}
                              className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle size={14} />
                              <span>Reddet</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Hedef Kategoriler & Yayın Sıklığı */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted font-medium">Hedef Alanlar:</span>
                      {targetCats.map((catId: any) => {
                        const name = COLUMN_CATEGORIES.find((c: any) => c.id === catId)?.name || catId;
                        return (
                          <span key={catId} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[11px]">
                            {name}
                          </span>
                        );
                      })}
                      <span className="text-muted ml-2">Sıklık:</span>
                      <span className="font-semibold text-foreground">
                        {PUBLISHING_FREQUENCY_OPTIONS.find(p => p.id === app.publishingFrequency)?.label || 'Haftada 1'}
                      </span>
                    </div>

                    {/* Başvuru Yazısı Özeti */}
                    <div className="bg-muted/10 border border-border/40 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">
                          Örnek Yazı: "{app.sampleTitle}"
                        </span>
                        <span className="text-[11px] text-muted font-mono">
                          {app.sampleWordCount || 0} Kelime
                        </span>
                      </div>
                      <p className="text-xs text-muted/90 font-serif line-clamp-2 leading-relaxed">
                        {app.sampleContent}
                      </p>
                    </div>

                    {app.status === 'rejected' && app.rejectReason && (
                      <p className="text-xs text-rose-500 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        Ret Gerekçesi: {app.rejectReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SEKME: KÖŞE YAZILARI ONAY HAVUZU                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'articles' && (
        <div className="space-y-6">
          {/* Durum Filtresi */}
          <div className="flex items-center gap-2">
            {[
              { id: 'pending', label: 'Onay Bekleyenler' },
              { id: 'all', label: 'Tüm Yazılar' },
              { id: 'published', label: 'Yayındakiler' },
              { id: 'rejected', label: 'Reddedilenler' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setArticleStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  articleStatusFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card/60 text-muted hover:text-foreground border border-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {articlesLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted">
              <Loader2 className="animate-spin text-primary mb-3" size={28} />
              <p className="text-xs">Köşe yazıları yükleniyor...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center bg-card/20 border border-border/40 rounded-3xl p-8">
              <FileText className="mx-auto text-muted mb-3 opacity-40" size={36} />
              <Typography variant="h4" className="font-bold text-foreground mb-1">
                Bu sekmede köşe yazısı bulunmuyor
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {articles.map((art) => {
                const categoryName = COLUMN_CATEGORIES.find((c: any) => c.id === art.category)?.name || 'Kültür & Sanat';

                return (
                  <div
                    key={art.id}
                    className="bg-card/50 hover:bg-card/80 border border-border/50 rounded-3xl p-6 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {art.coverImage ? (
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Feather size={28} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            art.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : art.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {art.status === 'published' ? 'Yayında' : art.status === 'pending' ? 'Onay Bekliyor' : 'Reddedildi'}
                          </span>
                          {art.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black flex items-center gap-1">
                              <Star size={10} fill="currentColor" />
                              Günün Manşeti
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-muted bg-muted/10 px-2 py-0.5 rounded-md">
                            {categoryName}
                          </span>
                          <span className="text-[11px] text-muted">
                            Yazar: <strong className="text-foreground">{art.authorName}</strong> ({art.authorTitle})
                          </span>
                        </div>

                        <Typography variant="h4" className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base sm:text-lg line-clamp-1">
                          {art.title}
                        </Typography>

                        {art.subtitle && (
                          <p className="text-xs text-muted line-clamp-1 mt-0.5">
                            {art.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticle(art);
                          setIsRejectingArticle(false);
                          setMakeFeaturedOnPublish(Boolean(art.isFeatured));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-card hover:bg-muted/10 border border-border/50 text-foreground font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Yazıyı İncele</span>
                      </button>

                      {art.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => toggleFeaturedMutation.mutate({ articleId: art.id, isFeatured: !art.isFeatured })}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            art.isFeatured
                              ? 'bg-amber-400 text-black border-amber-400'
                              : 'bg-card text-muted hover:text-amber-400 border-border/50'
                          }`}
                          title={art.isFeatured ? 'Manşetten Kaldır' : 'Günün Manşeti Yap'}
                        >
                          <Star size={16} fill={art.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteArticleMutation.mutate(art.id)}
                        className="p-2 rounded-xl bg-card hover:bg-rose-500/10 border border-border/50 text-muted hover:text-rose-500 transition-all cursor-pointer"
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
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: KAPSAMLI 4 AŞAMALI BAŞVURU İNCELEME MODALI            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-10 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-xs font-bold text-primary block uppercase tracking-wider">
                  Köşe Yazarlığı Başvuru İncelemesi
                </span>
                <Typography variant="h3" className="font-extrabold text-foreground text-xl">
                  {selectedApp.fullName || selectedApp.userName}
                  {selectedApp.penName && ` (Mahlas: ${selectedApp.penName})`}
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-muted hover:text-foreground text-sm font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* 1. Kişisel Bilgiler */}
            <div className="bg-muted/10 border border-border/40 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                1. Kişisel ve İletişim Bilgileri
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted block">Kullanıcı Adı:</span>
                  <span className="font-bold text-foreground">@{selectedApp.username || selectedApp.userUsername}</span>
                </div>
                <div>
                  <span className="text-muted block">E-posta:</span>
                  <span className="font-bold text-foreground">{selectedApp.email || 'Kayıtlı E-posta'}</span>
                </div>
                {selectedApp.portfolioUrl && (
                  <div className="sm:col-span-2">
                    <span className="text-muted block">Portföy / Bağlantı:</span>
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <span>{selectedApp.portfolioUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-muted block">Kısa Biyografi:</span>
                  <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 p-3 rounded-xl border border-border/30 mt-1">
                    {selectedApp.bio || selectedApp.userBio}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Köşe Yazarlığı Tercihleri */}
            <div className="bg-muted/10 border border-border/40 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                2. Köşe Yazarlığı Bilgileri
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block mb-1">Talep Edilen Alanlar:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedApp.targetCategories || [selectedApp.expertiseArea]).map((catId: any) => {
                      const name = COLUMN_CATEGORIES.find((c: any) => c.id === catId)?.name || catId;
                      return (
                        <span key={catId} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px] border border-primary/20">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted block">Önceki İçerik Deneyimi:</span>
                    <span className="font-bold text-foreground">
                      {selectedApp.hasPriorExperience ? 'Evet, deneyimi var' : 'Hayır, ilk deneyimi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Yayın Sıklığı Planı:</span>
                    <span className="font-bold text-foreground">
                      {PUBLISHING_FREQUENCY_OPTIONS.find(p => p.id === selectedApp.publishingFrequency)?.label || 'Haftada 1'}
                    </span>
                  </div>
                </div>

                {selectedApp.priorWorkLinks && (
                  <div>
                    <span className="text-muted block">Önceki Yazıları / Yayınları:</span>
                    <span className="font-semibold text-foreground">{selectedApp.priorWorkLinks}</span>
                  </div>
                )}

                <div>
                  <span className="text-muted block">Neden Readixon'da Yazmak İstiyor? (Motivasyon):</span>
                  <p className="text-xs text-foreground/90 leading-relaxed italic bg-background/50 p-3 rounded-xl border border-border/30 mt-1">
                    "{selectedApp.motivation || 'Edebi üretim ve kültür-sanat yazıları'}"
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Örnek Köşe Yazısı */}
            <div className="bg-muted/10 border border-border/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  3. Değerlendirilecek Örnek Köşe Yazısı
                </span>
                <span className="text-xs font-mono font-bold text-muted bg-background px-2.5 py-1 rounded-md border border-border/40">
                  {selectedApp.sampleWordCount || 0} Kelime
                </span>
              </div>

              <div>
                <span className="text-xs text-muted block">Yazı Başlığı:</span>
                <span className="font-extrabold text-foreground text-base">"{selectedApp.sampleTitle}"</span>
              </div>

              {selectedApp.sampleSummary && (
                <div>
                  <span className="text-xs text-muted block">Spot / Kısa Açıklama:</span>
                  <span className="text-xs font-serif italic text-muted/90">{selectedApp.sampleSummary}</span>
                </div>
              )}

              <div>
                <span className="text-xs text-muted block mb-1">Yazı Metni:</span>
                <div className="font-serif text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/70 p-5 rounded-2xl border border-border/40 max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {selectedApp.sampleContent}
                </div>
              </div>
            </div>

            {/* 4. Beyan & Yasal Onay Durumu */}
            <div className="bg-muted/10 border border-border/40 rounded-2xl p-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
                4. Beyan & Yasal Onaylar
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted">
                <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <Check size={14} />
                  <span>Bilgilerin doğruluğu beyan edildi</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <Check size={14} />
                  <span>Özgünlük & telif hakkı beyan edildi</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <Check size={14} />
                  <span>Yayın İlkeleri kabul edildi</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <Check size={14} />
                  <span>KVKK Aydınlatma Metni onaylandı</span>
                </div>
              </div>
            </div>

            {/* Aksiyon Alanı (Onay / Ret Formu) */}
            <div className="space-y-4 pt-2">
              {!isRejectingApp ? (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                    Yazara Atanacak Köşe Unvanı *
                  </label>
                  <input
                    type="text"
                    value={assignedTitleInput}
                    onChange={(e) => setAssignedTitleInput(e.target.value)}
                    placeholder="Örn: Edebiyat Eleştirmeni, Kültür & Sanat Yazarı"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm font-semibold text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-rose-500 block mb-2">
                    Yazara İletilecek Ret Gerekçesi / Editör Notu *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    placeholder="Başvurunun ve örnek yazının neden uygun görülmediğini veya hangi konularda gelişmesi gerektiğini belirtin..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-xs text-foreground focus:outline-hidden resize-none"
                  />
                </div>
              )}
            </div>

            {/* Alt Butonlar */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-foreground cursor-pointer"
              >
                Kapat
              </button>

              <div className="flex items-center gap-2">
                {!isRejectingApp ? (
                  <>
                    {selectedApp.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => setIsRejectingApp(true)}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                      >
                        Reddet / Geri Çevir
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={approveAppMutation.isPending}
                      onClick={() => approveAppMutation.mutate({ appId: selectedApp.id, title: assignedTitleInput })}
                      className="px-6 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {approveAppMutation.isPending ? 'Onaylanıyor...' : 'Başvuruyu Onayla & Yetki Ver'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejectingApp(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-foreground cursor-pointer"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      disabled={rejectAppMutation.isPending}
                      onClick={() => rejectAppMutation.mutate({ appId: selectedApp.id, reason: rejectReasonInput })}
                      className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {rejectAppMutation.isPending ? 'İşleniyor...' : 'Reddi Tamamla ve Bildirim Gönder'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: Yazı İnceleme & Yayınlama Modalı                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-10 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-xs font-bold text-primary block uppercase tracking-wider">Köşe Yazısı İncelemesi</span>
                <Typography variant="h3" className="font-extrabold text-foreground text-xl">
                  {selectedArticle.title}
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="text-muted hover:text-foreground text-sm font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* Yazar & Meta Strip */}
            <div className="flex items-center justify-between bg-muted/10 p-4 rounded-2xl text-xs">
              <div>
                <span className="font-bold text-foreground block">{selectedArticle.authorName}</span>
                <span className="text-muted">{selectedArticle.authorTitle || 'Köşe Yazarı'}</span>
              </div>
              <div className="text-right text-muted">
                <span className="block font-semibold">{selectedArticle.readingTime || 2} dk okuma</span>
                <span>{selectedArticle.category}</span>
              </div>
            </div>

            {/* Kapak Varsa */}
            {selectedArticle.coverImage && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                <img src={selectedArticle.coverImage} alt="Kapak" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Spot */}
            {selectedArticle.subtitle && (
              <p className="text-base text-muted font-serif italic border-l-2 border-primary pl-4 py-1">
                {selectedArticle.subtitle}
              </p>
            )}

            {/* İçerik */}
            <div className="font-serif text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap bg-background/50 p-6 rounded-2xl border border-border/30 max-h-80 overflow-y-auto">
              {selectedArticle.content}
            </div>

            {/* Ret Modu */}
            {isRejectingArticle && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-rose-500 block">
                  Yazara İletilecek Ret Gerekçesi / Editör Düzeltme Notu:
                </label>
                <textarea
                  rows={3}
                  value={articleRejectReason}
                  onChange={(e) => setArticleRejectReason(e.target.value)}
                  placeholder="Yazının neden onaylanmadığını veya hangi kısımların düzeltilmesi gerektiğini belirtin..."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/60 text-xs text-foreground focus:outline-hidden"
                />
              </div>
            )}

            {/* Alt Yayınlama Aksiyonları */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={makeFeaturedOnPublish}
                  onChange={(e) => setMakeFeaturedOnPublish(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <Star size={14} className={makeFeaturedOnPublish ? 'text-amber-400 fill-amber-400' : 'text-muted'} />
                <span>Gündem'de Günün Manşet Köşe Yazısı Yap</span>
              </label>

              <div className="flex items-center gap-2 ml-auto">
                {!isRejectingArticle ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejectingArticle(true)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                    >
                      Düzeltme İste / Reddet
                    </button>
                    <button
                      type="button"
                      disabled={publishArticleMutation.isPending}
                      onClick={() => publishArticleMutation.mutate({ articleId: selectedArticle.id, isFeatured: makeFeaturedOnPublish })}
                      className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {publishArticleMutation.isPending ? 'Yayınlanıyor...' : 'Onayla & Yayına Al'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejectingArticle(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-foreground cursor-pointer"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      disabled={rejectArticleMutation.isPending}
                      onClick={() => rejectArticleMutation.mutate({ articleId: selectedArticle.id, reason: articleRejectReason })}
                      className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {rejectArticleMutation.isPending ? 'İşleniyor...' : 'Geri Bildirimi Gönder'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
