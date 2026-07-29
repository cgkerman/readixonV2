"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { createHeroBanner, updateHeroBanner, type HeroBanner, uploadFile, getCroppedImg } from '@readixon/core';
import { toast } from 'sonner';
import { Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';

interface HeroBannerFormProps {
  initialData?: HeroBanner;
}

export default function HeroBannerForm({ initialData }: HeroBannerFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    badge: initialData?.badge || '',
    link: initialData?.primaryLink || '',
    label: initialData?.primaryLabel || '',
    imageUrl: initialData?.imageUrl || '',
    isActive: initialData !== undefined ? initialData.isActive : true,
    order: initialData?.order || 0
  });

  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
          setFormData({ ...formData, imageUrl: URL.createObjectURL(croppedFile) });
        }
      } catch (e) {
        console.error("Kırpma hatası", e);
        toast.error("Görsel kırpılamadı.");
      }
    }
    setCropImageSrc(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.summary) {
      toast.error('Başlık ve özet zorunludur.');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const path = `hero_banners/images/${Date.now()}_${imageFile.name}`;
        finalImageUrl = await uploadFile(imageFile, path);
      }

      let processedLink = formData.link ? formData.link.trim() : null;
      if (processedLink && !processedLink.startsWith('http') && !processedLink.startsWith('/')) {
        processedLink = '/' + processedLink; // Default to relative route if it's not http
      }

      const payload: any = {
        title: formData.title,
        summary: formData.summary,
        badge: formData.badge,
        primaryLabel: formData.label,
        primaryLink: processedLink,
        isActive: formData.isActive,
        order: Number(formData.order),
      };
      
      if (finalImageUrl && (finalImageUrl.startsWith('http') || finalImageUrl.startsWith('/'))) {
        payload.imageUrl = finalImageUrl;
      } else if (!finalImageUrl) {
        payload.imageUrl = null;
      }

      if (initialData?.id) {
        await updateHeroBanner(initialData.id, payload);
        toast.success('Manşet başarıyla güncellendi!');
      } else {
        await createHeroBanner(payload);
        toast.success('Manşet başarıyla oluşturuldu!');
      }
      
      router.push('/editor/hero');
    } catch (error) {
      toast.error('Kayıt sırasında hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card w-full rounded-2xl border border-border/50 shadow-xl overflow-hidden relative">
      <div className="p-6 md:p-8 flex flex-col gap-10">
        
        {/* Üst Alan: Görsel */}
        <div className="w-full flex flex-col gap-3 shrink-0">
          <label className="text-sm font-semibold text-text">Manşet Görseli (1:1 Kare görsel önerilir, Örn: 1080x1080)</label>
          <div className="relative w-full aspect-square md:w-72 bg-background border-2 border-dashed border-border/50 rounded-2xl overflow-hidden hover:bg-muted/5 transition-colors flex items-center justify-center group cursor-pointer shadow-inner mx-auto md:mx-0">
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
                <span className="text-sm font-medium">Kapak Yükle</span>
              </div>
            )}
            {formData.imageUrl && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold backdrop-blur-sm">
                Değiştirmek için tıkla
              </div>
            )}
          </div>
        </div>

        {/* Alt Alan: Form */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Başlık *"
            placeholder="Örn: Readixon V1.6 Yayında!"
            value={formData.title}
            onChangeText={(val) => setFormData({ ...formData, title: val })}
          />
          <Input
            label="Özet / Alt Başlık *"
            placeholder="Örn: Yepyeni özelliklerle karşınızdayız..."
            value={formData.summary}
            onChangeText={(val) => setFormData({ ...formData, summary: val })}
          />
          <Input
            label="Rozet (Badge)"
            placeholder="Örn: DEV GÜNCELLEME"
            value={formData.badge}
            onChangeText={(val) => setFormData({ ...formData, badge: val })}
          />
          <Input
            label="Sıralama Değeri"
            placeholder="Örn: 1 (Küçük sayı önce çıkar)"
            type="number"
            value={formData.order.toString()}
            onChangeText={(val) => setFormData({ ...formData, order: parseInt(val) || 0 })}
          />
          <Input
            label="Buton Yazısı"
            placeholder="Örn: Hemen Keşfet"
            value={formData.label}
            onChangeText={(val) => setFormData({ ...formData, label: val })}
          />
          <Input
            label="Buton Linki"
            placeholder="Örn: /agenda veya https://..."
            value={formData.link}
            onChangeText={(val) => setFormData({ ...formData, link: val })}
          />
        </div>
      </div>

      <div className="p-6 md:px-8 border-t border-border/50 bg-muted/5 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox"
            className="w-5 h-5 rounded border-border/50 text-primary focus:ring-primary/20 accent-primary"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            disabled={isUploading}
          />
          <span className="font-semibold select-none text-text">Yayında (Aktif)</span>
        </label>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="px-6 rounded-full" onPress={() => router.back()} disabled={isUploading}>
            İptal
          </Button>
          <Button variant="primary" className="px-8 rounded-full" onPress={handleSave} disabled={isUploading}>
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Kaydediliyor...
              </span>
            ) : initialData ? 'Değişiklikleri Kaydet' : 'Manşeti Yayınla'}
          </Button>
        </div>
      </div>

      {cropImageSrc && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card">
            <Typography variant="h3" className="font-bold">Görseli Kırp</Typography>
            <div className="flex gap-2">
              <Button variant="outline" onPress={() => setCropImageSrc(null)}>İptal</Button>
              <Button variant="primary" onPress={handleCropSave}>Kaydet</Button>
            </div>
          </div>
          <div className="relative flex-1">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        </div>
      )}
    </div>
  );
}
