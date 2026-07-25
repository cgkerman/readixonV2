"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { createAnnouncement, updateAnnouncement, type Announcement, uploadFile, getCroppedImg } from '@readixon/core';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Image as ImageIcon, Bold, Italic, List } from 'lucide-react';
import Cropper from 'react-easy-crop';

interface NewsFormProps {
  initialData?: Announcement;
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (ts?: Timestamp) => {
    if (!ts) return '';
    const d = ts.toDate();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    link: initialData?.link || '',
    imageUrl: initialData?.imageUrl || '',
    isActive: initialData !== undefined ? initialData.isActive : true,
    publishAt: formatDate(initialData?.publishAt),
    expireAt: formatDate(initialData?.expireAt),
    category: initialData?.category || 'culture'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Zengin metin içeriğini senkronize et
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== formData.content) {
      editorRef.current.innerHTML = formData.content;
    }
  }, [formData.content]);

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
    if (!formData.title || !formData.content) {
      toast.error('Başlık ve içerik zorunludur.');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;
      
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
        category: formData.category
      };
      
      if (finalImageUrl && finalImageUrl.startsWith('http')) {
        payload.imageUrl = finalImageUrl;
      } else if (!finalImageUrl) {
        payload.imageUrl = null;
      }

      if (initialData?.id) {
        await updateAnnouncement(initialData.id, payload);
        toast.success('Haber başarıyla güncellendi!');
      } else {
        await createAnnouncement(payload);
        toast.success('Haber başarıyla oluşturuldu!');
      }
      
      router.push('/editor/news');
    } catch (error) {
      toast.error('Kayıt sırasında hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card w-full rounded-2xl border border-border/50 shadow-xl overflow-hidden relative">
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-10">
        
        {/* Sol Kolon (Görsel) */}
        <div className="w-full md:w-1/3 flex flex-col gap-3 shrink-0">
          <label className="text-sm font-semibold text-text">Haber Kapağı (1920x1080)</label>
          <div className="relative w-full aspect-video bg-background border-2 border-dashed border-border/50 rounded-2xl overflow-hidden hover:bg-muted/5 transition-colors flex items-center justify-center group cursor-pointer shadow-inner">
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

        {/* Sağ Kolon (Form) */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <Input
            label="Başlık *"
            placeholder="Örn: Yapay Zeka Sanatı Nasıl Etkiliyor?"
            value={formData.title}
            onChangeText={(val) => setFormData({ ...formData, title: val })}
          />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text">Haber İçeriği *</label>
              <div className="flex gap-1 bg-muted/10 rounded-lg p-1 border border-border/50">
                <button 
                  onClick={() => { document.execCommand('bold', false); if (editorRef.current) setFormData({ ...formData, content: editorRef.current.innerHTML }); }}
                  className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Kalın"
                ><Bold size={16} /></button>
                <button 
                  onClick={() => { document.execCommand('italic', false); if (editorRef.current) setFormData({ ...formData, content: editorRef.current.innerHTML }); }}
                  className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="İtalik"
                ><Italic size={16} /></button>
                <button 
                  onClick={() => { document.execCommand('insertUnorderedList', false); if (editorRef.current) setFormData({ ...formData, content: editorRef.current.innerHTML }); }}
                  className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Liste"
                ><List size={16} /></button>
              </div>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="w-full bg-background border border-border/50 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 min-h-[300px] max-h-[600px] overflow-y-auto outline-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:mb-2 leading-relaxed"
              onInput={(e) => setFormData({ ...formData, content: e.currentTarget.innerHTML })}
            />
            <span className="text-xs text-muted font-medium">Rich text editör (Metni renklendirin ve paragraflandırın).</span>
          </div>

          <Input
            label="Kaynak Link (İsteğe bağlı)"
            placeholder="Örn: https://readixon.com/..."
            value={formData.link}
            onChangeText={(val) => setFormData({ ...formData, link: val })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text">Zamanla (Yayınlanma)</label>
              <input
                type="datetime-local"
                value={formData.publishAt}
                onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border/50 text-text outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text">Bitiş Zamanı (Kaldırılma)</label>
              <input
                type="datetime-local"
                value={formData.expireAt}
                onChange={(e) => setFormData({ ...formData, expireAt: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border/50 text-text outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-background border border-border/50 p-4 rounded-2xl">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-bold cursor-pointer">Yayında (Aktif)</label>
          </div>
        </div>
      </div>
      
      <div className="p-6 md:px-8 border-t border-border/50 flex justify-end gap-3 bg-background/50">
        <Button variant="ghost" onPress={() => router.push('/editor/news')} disabled={isUploading} className="px-6 rounded-full font-bold">İptal</Button>
        <Button variant="primary" onPress={handleSave} disabled={isUploading} className="px-8 rounded-full font-bold">
          {isUploading ? 'Kaydediliyor...' : 'Haberi Kaydet'}
        </Button>
      </div>

      {/* ── Kırpma Modalı ── */}
      {cropImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border/50 flex flex-col overflow-hidden relative shadow-2xl">
            <div className="relative w-full h-[60vh] bg-black">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-background">
              <Button variant="ghost" onPress={() => setCropImageSrc(null)} className="rounded-full">İptal</Button>
              <Button variant="primary" onPress={handleCropSave} className="rounded-full font-bold">Kırp ve Kullan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
