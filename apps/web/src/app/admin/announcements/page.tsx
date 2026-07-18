"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { getAllAnnouncementsAdmin, createAnnouncement, updateAnnouncement, deleteAnnouncement, type Announcement, uploadFile, getCroppedImg } from '@readixon/core';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { BellRing, Plus, Pencil, Trash2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    imageUrl: '',
    isActive: true,
    publishAt: '',
    expireAt: ''
  });

  // Image Crop & Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAllAnnouncementsAdmin();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Duyurular yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      
      // Convert Timestamps to YYYY-MM-DDThh:mm for datetime-local input
      const formatDate = (ts?: Timestamp) => {
        if (!ts) return '';
        const d = ts.toDate();
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };

      setFormData({
        title: announcement.title,
        content: announcement.content,
        link: announcement.link || '',
        imageUrl: announcement.imageUrl || '',
        isActive: announcement.isActive,
        publishAt: formatDate(announcement.publishAt),
        expireAt: formatDate(announcement.expireAt)
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        link: '',
        imageUrl: '',
        isActive: true,
        publishAt: '',
        expireAt: ''
      });
    }
    setImageFile(null);
    setCropImageSrc(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setCropImageSrc(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (cropImageSrc && croppedAreaPixels) {
      try {
        const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
        if (croppedFile) {
          setImageFile(croppedFile);
          setFormData({ ...formData, imageUrl: URL.createObjectURL(croppedFile) }); // temporary preview
        }
      } catch (e) {
        console.error("Kırpma hatası", e);
        toast.error("Görsel kırpılamadı.");
      }
    }
    setCropImageSrc(null); // close cropper
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Başlık ve içerik zorunludur.');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload image if a new file is cropped
      if (imageFile) {
        const path = `announcements/images/${Date.now()}_${imageFile.name}`;
        finalImageUrl = await uploadFile(imageFile, path);
      }

      let processedLink = formData.link ? formData.link.trim() : null;
      if (processedLink && !processedLink.startsWith('http')) {
        processedLink = 'https://' + processedLink;
      }

      const payload: any = {
        title: formData.title,
        content: formData.content,
        isActive: formData.isActive,
        link: processedLink,
        publishAt: formData.publishAt ? Timestamp.fromDate(new Date(formData.publishAt)) : null,
        expireAt: formData.expireAt ? Timestamp.fromDate(new Date(formData.expireAt)) : null,
      };
      
      if (finalImageUrl && finalImageUrl.startsWith('http')) {
        payload.imageUrl = finalImageUrl;
      } else if (!finalImageUrl) {
        payload.imageUrl = null; // Clear image if removed
      }

      if (editingId) {
        await updateAnnouncement(editingId, payload);
        toast.success('Duyuru güncellendi!');
      } else {
        await createAnnouncement(payload);
        toast.success('Duyuru başarıyla oluşturuldu!');
      }
      handleCloseModal();
      fetchAnnouncements();
    } catch (error) {
      toast.error('Kayıt sırasında hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteAnnouncement(id);
      toast.success('Duyuru silindi!');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Silinirken hata oluştu.');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateAnnouncement(id, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Duyuru yayından kaldırıldı.' : 'Duyuru yayına alındı.');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellRing size={28} className="text-primary" />
          <Typography variant="h1" className="text-3xl font-bold">Duyurular</Typography>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onPress={() => handleOpenModal()}>
          <Plus size={18} /> Yeni Duyuru
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6">
        {loading ? (
          <div className="flex justify-center p-10">
             <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center p-10 text-muted">Henüz hiç duyuru eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-muted text-sm uppercase">
                  <th className="pb-4 font-semibold">Başlık</th>
                  <th className="pb-4 font-semibold">Tarih</th>
                  <th className="pb-4 font-semibold">Durum</th>
                  <th className="pb-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((item) => (
                  <tr key={item.id} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted/20 shrink-0">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <BellRing size={16} />
                        </div>
                      )}
                      <div>
                        <Typography variant="h4" className="font-semibold text-sm line-clamp-1">{item.title}</Typography>
                        <Typography variant="body" className="text-xs text-muted line-clamp-1">{item.content}</Typography>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted">
                      {item.createdAt ? new Date((item.createdAt as any).seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="py-4">
                      {(() => {
                        const now = new Date();
                        const isScheduled = item.publishAt && item.publishAt.toDate() > now;
                        const isExpired = item.expireAt && item.expireAt.toDate() < now;
                        
                        let statusText = 'Yayında';
                        let statusStyle = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                        let Icon = CheckCircle;

                        if (!item.isActive) {
                          statusText = 'Pasif';
                          statusStyle = 'bg-red-500/10 text-red-500 border-red-500/20';
                          Icon = XCircle;
                        } else if (isExpired) {
                          statusText = 'Süresi Doldu';
                          statusStyle = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                          Icon = XCircle;
                        } else if (isScheduled) {
                          statusText = 'Zamanlandı';
                          statusStyle = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                          Icon = BellRing;
                        }

                        return (
                          <div className="flex flex-col gap-1 items-start">
                            <button 
                              onClick={() => toggleStatus(item.id, item.isActive)}
                              className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${statusStyle}`}
                            >
                              <Icon size={12} />
                              {statusText}
                            </button>
                            {item.publishAt && <span className="text-[10px] text-muted">Bşl: {item.publishAt.toDate().toLocaleDateString('tr-TR')}</span>}
                            {item.expireAt && <span className="text-[10px] text-muted">Bts: {item.expireAt.toDate().toLocaleDateString('tr-TR')}</span>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Duyuru Ekleme / Düzenleme Modalı ── */}
      {isModalOpen && !cropImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border/50 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <Typography variant="h3" className="font-bold">{editingId ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Ekle'}</Typography>
              <button onClick={handleCloseModal} className="text-muted hover:text-text" disabled={isUploading}><XCircle size={24} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              
              {/* Image Upload Area */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text">Duyuru Görseli (1080x1350)</label>
                <div className="relative w-full aspect-[4/5] bg-background border-2 border-dashed border-border/50 rounded-xl overflow-hidden hover:bg-muted/5 transition-colors flex items-center justify-center group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    disabled={isUploading}
                  />
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted">
                      <ImageIcon size={32} />
                      <span className="text-sm font-medium">Görsel Seç</span>
                    </div>
                  )}
                  {formData.imageUrl && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                      Değiştirmek için tıkla
                    </div>
                  )}
                </div>
              </div>

              <Input
                label="Başlık *"
                placeholder="Örn: Yeni Güncelleme Yayında!"
                value={formData.title}
                onChangeText={(val) => setFormData({ ...formData, title: val })}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text">İçerik *</label>
                <textarea
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
                  placeholder="Duyuru detaylarını buraya yazın..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <Input
                label="Link (İsteğe bağlı)"
                placeholder="Örn: https://readixon.com/..."
                value={formData.link}
                onChangeText={(val) => setFormData({ ...formData, link: val })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-text">Yayınlanma Zamanı (Opsiyonel)</label>
                  <input
                    type="datetime-local"
                    value={formData.publishAt}
                    onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-text outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <span className="text-xs text-muted">Boş bırakılırsa anında yayınlanır.</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-text">Kaldırılma Zamanı (Opsiyonel)</label>
                  <input
                    type="datetime-local"
                    value={formData.expireAt}
                    onChange={(e) => setFormData({ ...formData, expireAt: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-text outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <span className="text-xs text-muted">Süresiz ise boş bırakın.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Genel Durumu (Aktif/Pasif)</label>
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end gap-3">
              <Button variant="ghost" onPress={handleCloseModal} disabled={isUploading}>İptal</Button>
              <Button variant="primary" onPress={handleSave} disabled={isUploading}>
                {isUploading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kırpma Modalı ── */}
      {cropImageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border/50 flex flex-col overflow-hidden relative">
            <div className="relative w-full h-[60vh] bg-black">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1080 / 1350}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end gap-3">
              <Button variant="ghost" onPress={() => setCropImageSrc(null)}>İptal</Button>
              <Button variant="primary" onPress={handleCropSave}>Kırp ve Kullan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
