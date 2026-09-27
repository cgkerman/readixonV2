"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import {
  getAllSitePopupsAdmin,
  createSitePopup,
  updateSitePopup,
  deleteSitePopup,
  toggleSitePopupActive,
  type SitePopup,
  uploadFile,
  compressToWebP
} from '@readixon/core';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Upload,
  Calendar,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  FileCheck2
} from 'lucide-react';

const formatDateString = (ts: any): string => {
  if (!ts) return '-';
  try {
    if (ts.toDate && typeof ts.toDate === 'function') {
      return ts.toDate().toLocaleDateString('tr-TR');
    }
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleDateString('tr-TR');
    }
    return new Date(ts).toLocaleDateString('tr-TR');
  } catch {
    return '-';
  }
};

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState<SitePopup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    expireAt: ''
  });

  // Image Upload & WebP Optimization State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ originalSize: string; compressedSize: string; savings: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Preview State (for Admin to test the popup modal)
  const [previewPopup, setPreviewPopup] = useState<SitePopup | null>(null);

  const fetchPopups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/popups');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setPopups(json.data);
          return;
        }
      }
      const data = await getAllSitePopupsAdmin();
      setPopups(data);
    } catch (error) {
      console.warn('API getirme uyarısı, client servisi deneniyor:', error);
      try {
        const data = await getAllSitePopupsAdmin();
        setPopups(data);
      } catch (err) {
        console.error(err);
        toast.error('Pop-up listesi yüklenirken hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleOpenModal = (popup?: SitePopup) => {
    setUploadStats(null);
    if (popup) {
      setEditingId(popup.id);
      const formatDate = (ts?: Timestamp) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date((ts as any).seconds * 1000);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };

      setFormData({
        title: popup.title || '',
        description: popup.description || '',
        imageUrl: popup.imageUrl || '',
        buttonText: popup.buttonText || '',
        buttonLink: popup.buttonLink || '',
        isActive: popup.isActive ?? true,
        expireAt: formatDate(popup.expireAt)
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        isActive: true,
        expireAt: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setUploadStats(null);
  };

  // Format bytes to KB / MB
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const originalSize = file.size;
      // Convert & Compress to WebP for maximum performance!
      const webpFile = await compressToWebP(file, 1200, 1200, 0.85);
      const compressedSize = webpFile.size;
      const savings = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

      setUploadStats({
        originalSize: formatBytes(originalSize),
        compressedSize: formatBytes(compressedSize),
        savings: `%${savings}`
      });

      // Upload to Firebase Storage
      const storagePath = `site_popups/${Date.now()}_${webpFile.name}`;
      const downloadUrl = await uploadFile(webpFile, storagePath);

      setFormData(prev => ({ ...prev, imageUrl: downloadUrl }));
      toast.success(`Görsel WebP formatında optimize edildi ve yüklendi (${formatBytes(compressedSize)})!`);
    } catch (err) {
      console.error('Görsel optimizasyon / yükleme hatası:', err);
      toast.error('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Lütfen bir başlık girin.');
      return;
    }

    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),
        isActive: formData.isActive,
        expireAt: formData.expireAt || null
      };

      if (editingId) {
        // Try API first
        const apiRes = await fetch('/api/admin/popups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
        if (!apiRes.ok) {
          // Fallback to client
          let expireAtTimestamp: Timestamp | undefined = undefined;
          if (formData.expireAt) {
            expireAtTimestamp = Timestamp.fromDate(new Date(formData.expireAt));
          }
          await updateSitePopup(editingId, { ...payload, expireAt: expireAtTimestamp });
        }
        toast.success('Pop-up başarıyla güncellendi.');
      } else {
        // Try API first
        const apiRes = await fetch('/api/admin/popups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!apiRes.ok) {
          // Fallback to client
          let expireAtTimestamp: Timestamp | undefined = undefined;
          if (formData.expireAt) {
            expireAtTimestamp = Timestamp.fromDate(new Date(formData.expireAt));
          }
          await createSitePopup({ ...payload, expireAt: expireAtTimestamp } as any);
        }
        toast.success('Yeni pop-up oluşturuldu ve kaydedildi.');
      }

      handleCloseModal();
      fetchPopups();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleToggleActive = async (popup: SitePopup) => {
    try {
      const nextState = !popup.isActive;
      const apiRes = await fetch('/api/admin/popups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: popup.id, isActive: nextState })
      });
      if (!apiRes.ok) {
        await toggleSitePopupActive(popup.id, nextState);
      }
      setPopups(prev => prev.map(p => p.id === popup.id ? { ...p, isActive: nextState } : p));
      toast.success(nextState ? 'Pop-up yayına alındı.' : 'Pop-up pasife alındı.');
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu pop-up duyurusunu silmek istediğinize emin misiniz?')) return;
    try {
      const apiRes = await fetch(`/api/admin/popups?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!apiRes.ok) {
        await deleteSitePopup(id);
      }
      setPopups(prev => prev.filter(p => p.id !== id));
      toast.success('Pop-up silindi.');
    } catch (error) {
      toast.error('Silinirken hata oluştu.');
    }
  };

  const activePopup = popups.find(p => p.isActive);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* ── Üst Başlık & Eylem ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold flex items-center gap-2">
            <Megaphone className="text-primary" size={24} /> Açılış Pop-up / Karşılama Bannerları
          </Typography>
          <Typography variant="body" className="text-muted mt-1">
            Kullanıcılar siteyi ziyaret ettiğinde bir kez görüntülenecek karşılama duyurularını ve optimize edilmiş WebP pop-up'larını yönetin.
          </Typography>
        </div>
        <Button variant="primary" onPress={() => handleOpenModal()} className="shadow-lg shadow-primary/20">
          <Plus size={18} className="mr-2" /> Yeni Pop-up Ekle
        </Button>
      </div>

      {/* ── Canlı Yayındaki Pop-up Vurgu Kartı ── */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/60 via-card/30 to-background p-6 shadow-md relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              activePopup ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-muted/10 border-border/40 text-muted'
            }`}>
              <Sparkles size={24} className={activePopup ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activePopup ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-muted/20 text-muted'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${activePopup ? 'bg-emerald-500 animate-ping' : 'bg-muted'}`} />
                  {activePopup ? 'Şu Anda Sitede Yayında' : 'Yayında Pop-up Yok'}
                </span>
              </div>
              <Typography variant="h3" className="font-bold text-lg text-text">
                {activePopup ? activePopup.title : 'Aktif Bir Karşılama Pop-up\'ı Bulunmuyor'}
              </Typography>
              <Typography variant="caption" className="text-muted mt-0.5 block max-w-xl">
                {activePopup 
                  ? (activePopup.description || 'Kullanıcılar siteyi ziyaret ettiğinde bu görsel pop-up ile karşılaşırlar.')
                  : 'Yeni bir duyuru ekleyip yayına alarak ziyaretçilerinize site açılışında görsel bildirim sunabilirsiniz.'}
              </Typography>
            </div>
          </div>

          {activePopup && (
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onPress={() => setPreviewPopup(activePopup)}
                className="border-primary/40 text-primary hover:bg-primary/10"
              >
                <Eye size={16} className="mr-1.5" /> Canlı Önizle
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onPress={() => handleToggleActive(activePopup)}
                className="text-amber-500 hover:bg-amber-500/10"
              >
                Yayından Kaldır
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onPress={() => handleOpenModal(activePopup)}
              >
                <Pencil size={16} className="mr-1.5" /> Düzenle
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Pop-up Listesi Tablosu ── */}
      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[35%]">Pop-up & Görsel</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Yönlendirme / Buton</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Tarih</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Durum</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%] text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <Typography variant="body" className="text-muted">Pop-up verileri yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : popups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted">
                    Henüz hiç pop-up veya karşılama bannerı eklenmemiş.
                  </td>
                </tr>
              ) : (
                popups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-card/40 transition-colors group">
                    {/* Görsel & Başlık */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-muted/20 rounded-xl overflow-hidden shrink-0 border border-border/40 relative">
                          {popup.imageUrl ? (
                            <img src={popup.imageUrl} alt={popup.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                              Görselsiz
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Typography variant="body" className="font-semibold text-text group-hover:text-primary transition-colors truncate max-w-sm">
                            {popup.title}
                          </Typography>
                          {popup.description && (
                            <Typography variant="caption" className="text-muted line-clamp-1 max-w-sm">
                              {popup.description}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Yönlendirme */}
                    <td className="px-6 py-4">
                      {popup.buttonText || popup.buttonLink ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text flex items-center gap-1">
                            {popup.buttonText || 'Link'}
                            <ExternalLink size={12} className="text-muted" />
                          </span>
                          <span className="text-[11px] text-muted truncate max-w-[180px]">
                            {popup.buttonLink || '-'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">Aksiyon butonu yok</span>
                      )}
                    </td>

                    {/* Tarih */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-muted">
                        <span>
                          {formatDateString(popup.createdAt)}
                        </span>
                        {popup.expireAt && (
                          <span className="text-[10px] text-amber-500/80">
                            Bitiş: {formatDateString(popup.expireAt)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Durum Toggle */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(popup)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          popup.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                            : 'bg-muted/15 border-border/40 text-muted hover:text-text'
                        }`}
                        title="Durumu değiştirmek için tıklayın"
                      >
                        {popup.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {popup.isActive ? 'Yayında' : 'Pasif'}
                      </button>
                    </td>

                    {/* İşlem Butonları */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted hover:text-primary px-2" 
                          title="Canlı Önizle"
                          onPress={() => setPreviewPopup(popup)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted hover:text-blue-500 px-2" 
                          title="Düzenle"
                          onPress={() => handleOpenModal(popup)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted hover:text-red-500 px-2" 
                          title="Sil"
                          onPress={() => handleDelete(popup.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pop-up Ekleme / Düzenleme Modalı ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted/20 text-muted transition-colors"
            >
              <X size={20} />
            </button>

            <Typography variant="h2" className="text-2xl font-black text-text mb-1">
              {editingId ? 'Pop-up\'ı Düzenle' : 'Yeni Karşılama Pop-up\'ı'}
            </Typography>
            <Typography variant="body" className="text-muted text-sm mb-6">
              Kullanıcıların siteyi ilk açtığında göreceği duyuruyu yapılandırın.
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Başlık */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                  Pop-up Başlığı *
                </label>
                <Input 
                  value={formData.title} 
                  onChangeText={(val) => setFormData(prev => ({ ...prev, title: val }))}
                  placeholder="Örn: Yeni Edebi Düellolar Başladı!"
                  className="w-full bg-background"
                  required
                />
              </div>

              {/* Açıklama / Mesaj */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                  Duyuru Metni / Mesaj (İsteğe Bağlı)
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kullanıcılara iletmek istediğiniz detaylı açıklama..."
                  className="w-full h-24 bg-background border border-border/50 rounded-xl p-3 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                />
              </div>

              {/* Görsel Yükleme (Otomatik WebP) */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                    Pop-up Görseli (Otomatik WebP)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    📐 Önerilen: 1200×675 px (16:9) veya 800×450 px
                  </span>
                </div>
                
                {formData.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-muted/10 group mb-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Pop-up Görseli" 
                      className="w-full max-h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onPress={() => fileInputRef.current?.click()}
                      >
                        Değiştir
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:bg-red-500/20"
                        onPress={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      >
                        Kaldır
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/5 hover:bg-muted/10"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 size={28} className="animate-spin text-primary mb-2" />
                        <span className="text-sm font-semibold text-text">WebP formatına dönüştürülüyor ve yükleniyor...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                          <Upload size={22} />
                        </div>
                        <span className="text-sm font-bold text-text">Görsel Seç veya Sürükle</span>
                        <span className="text-xs text-muted mt-1">PNG, JPG, JPEG veya WEBP (Maksimum 10MB)</span>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                          📐 En İyi Görünüm: 1200×675 px (16:9 En/Boy Oranı)
                        </div>
                        <span className="text-[11px] text-amber-500/90 font-medium mt-1.5">⚡ Görseliniz performans için otomatik olarak yüksek kaliteli WebP'ye sıkıştırılacaktır.</span>
                      </div>
                    )}
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect}
                  accept="image/*" 
                  className="hidden" 
                />

                {uploadStats && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                    <FileCheck2 size={16} className="shrink-0" />
                    <span>
                      WebP Optimizasyonu Tamamlandı: <strong>{uploadStats.originalSize}</strong> ➔ <strong>{uploadStats.compressedSize}</strong> ({uploadStats.savings} tasarruf)
                    </span>
                  </div>
                )}
              </div>

              {/* Aksiyon Butonu Ayarları (2 Kolon) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                    Buton Metni (İsteğe Bağlı)
                  </label>
                  <Input 
                    value={formData.buttonText} 
                    onChangeText={(val) => setFormData(prev => ({ ...prev, buttonText: val }))}
                    placeholder="Örn: Hemen Keşfet"
                    className="w-full bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                    Yönlendirme Linki (İsteğe Bağlı)
                  </label>
                  <Input 
                    value={formData.buttonLink} 
                    onChangeText={(val) => setFormData(prev => ({ ...prev, buttonLink: val }))}
                    placeholder="Örn: /reviews veya /story/123"
                    className="w-full bg-background"
                  />
                </div>
              </div>

              {/* Bitiş Tarihi */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                  Bitiş / Kaldırılma Tarihi (İsteğe Bağlı)
                </label>
                <input 
                  type="datetime-local" 
                  value={formData.expireAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expireAt: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              {/* Aktiflik Durumu */}
              <label className="flex items-center gap-3 cursor-pointer select-none bg-muted/10 border border-border/50 p-3.5 rounded-xl hover:bg-muted/20 transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-text block">Bu pop-up'ı hemen yayına al</span>
                  <span className="text-xs text-muted block">Aktif edildiğinde siteyi ziyaret eden kullanıcılara bir kez olmak şartıyla gösterilir.</span>
                </div>
              </label>

              {/* Kaydet / İptal Butonları */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="ghost" onPress={handleCloseModal}>
                  Vazgeç
                </Button>
                <Button type="submit" variant="primary" className="px-6">
                  {editingId ? 'Güncelle' : 'Yayınla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Canlı Pop-up Önizleme Modalı ── */}
      {previewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-primary/30 rounded-[2rem] overflow-hidden max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setPreviewPopup(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-transform hover:scale-105"
            >
              <X size={18} />
            </button>

            {/* Image (if exists) */}
            {previewPopup.imageUrl && (
              <div className="relative w-full aspect-video sm:aspect-[16/10] bg-muted/20 overflow-hidden">
                <img 
                  src={previewPopup.imageUrl} 
                  alt={previewPopup.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 sm:p-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} /> Readixon Duyuru
              </div>

              <Typography variant="h2" className="text-2xl font-black text-text mb-2 leading-tight">
                {previewPopup.title}
              </Typography>

              {previewPopup.description && (
                <Typography variant="body" className="text-muted leading-relaxed text-sm mb-6 whitespace-pre-line">
                  {previewPopup.description}
                </Typography>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {previewPopup.buttonText && (
                  <Button 
                    variant="primary" 
                    className="w-full justify-center shadow-lg shadow-primary/25 text-base py-3"
                    onPress={() => {
                      toast.info(`Tıklandı: ${previewPopup.buttonLink || 'Bağlantı belirtilmemiş'}`);
                      setPreviewPopup(null);
                    }}
                  >
                    <span>{previewPopup.buttonText}</span>
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full sm:w-auto text-muted hover:text-text"
                  onPress={() => setPreviewPopup(null)}
                >
                  Kapat
                </Button>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[11px] text-muted-foreground/70">
                  Bu bir canlı önizlemedir. Kullanıcılara siteyi ilk açtıklarında 1 kez gösterilir.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
