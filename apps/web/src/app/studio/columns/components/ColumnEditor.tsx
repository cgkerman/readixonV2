'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from '@readixon/ui';
import {
  useAuthStore,
  createColumnArticle,
  updateColumnArticle,
  uploadFile,
  ColumnArticle,
  ColumnCategory,
  COLUMN_CATEGORIES,
} from '@readixon/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Feather,
  Save,
  Send,
  Eye,
  Edit3,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Loader2,
  Quote,
  Bold,
  Italic,
  Heading2,
  List,
} from 'lucide-react';
import Link from 'next/link';

interface ColumnEditorProps {
  initialArticle?: ColumnArticle;
  isEditing?: boolean;
}

export function ColumnEditor({ initialArticle, isEditing = false }: ColumnEditorProps) {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const userId = userProfile?.uid;

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || '');
  const [category, setCategory] = useState<ColumnCategory>(initialArticle?.category || 'culture');
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const [tagsInput, setTagsInput] = useState(initialArticle?.tags?.join(', ') || '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // İstatistikler (Kelime & Okuma Süresi)
  const plainText = content.replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Metin formatlama yardımcı fonksiyonu
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('column-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || 'vurgulanacak metin';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Görsel Yükleme
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel boyutu en fazla 5MB olabilir.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const path = `columns/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const url = await uploadFile(file, path);
      setCoverImage(url);
      toast.success('Kapak görseli yüklendi!');
    } catch (err: any) {
      toast.error(err.message || 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Kaydetme İşlemi (Draft veya Pending)
  const handleSave = async (status: 'draft' | 'pending') => {
    if (!userId) {
      toast.error('Oturum açmanız gerekiyor.');
      return;
    }

    if (!title.trim()) {
      toast.error('Lütfen bir başlık girin.');
      return;
    }

    if (status === 'pending' && content.trim().length < 200) {
      toast.error('Köşe yazınızı onaya göndermek için en az 200 karakter yazmalısınız.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t: string) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    if (status === 'draft') setIsSavingDraft(true);
    if (status === 'pending') setIsSubmittingReview(true);

    try {
      if (isEditing && initialArticle?.id) {
        await updateColumnArticle(initialArticle.id, userId, {
          title,
          subtitle,
          content,
          coverImage,
          category,
          tags,
          status,
        });
        toast.success(status === 'pending' ? 'Yazınız editör onayına gönderildi!' : 'Taslak güncellendi.');
      } else {
        await createColumnArticle(userId, {
          title,
          subtitle,
          content,
          coverImage,
          category,
          tags,
          status,
        });
        toast.success(status === 'pending' ? 'Köşe yazınız oluşturuldu ve editör onayına gönderildi!' : 'Taslak kaydedildi.');
      }

      router.push('/studio/columns');
    } catch (err: any) {
      toast.error(err.message || 'Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSavingDraft(false);
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Link
            href="/studio/columns"
            className="w-10 h-10 rounded-2xl bg-card border border-border/60 hover:border-primary/40 text-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="Geri Dön"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <Typography variant="h3" className="font-extrabold text-foreground text-lg sm:text-xl">
              {isEditing ? 'Köşe Yazısını Düzenle' : 'Yeni Köşe Yazısı Yaz'}
            </Typography>
            <div className="flex items-center gap-3 text-xs text-muted font-medium mt-0.5">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                {estimatedMinutes} dk okuma
              </span>
              <span>•</span>
              <span>{wordCount} kelime</span>
            </div>
          </div>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/15 border border-border/40 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Edit3 size={14} />
              <span>Düzenle</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Eye size={14} />
              <span>Önizle</span>
            </button>
          </div>

          {/* Taslak Kaydet */}
          <button
            type="button"
            disabled={isSavingDraft || isSubmittingReview}
            onClick={() => handleSave('draft')}
            className="px-4 py-2 rounded-xl bg-card hover:bg-card/80 border border-border/60 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSavingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Taslak Kaydet</span>
          </button>

          {/* Editör Onayına Gönder */}
          <button
            type="button"
            disabled={isSavingDraft || isSubmittingReview}
            onClick={() => handleSave('pending')}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSubmittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Onaya Gönder</span>
          </button>
        </div>
      </div>

      {/* Ana Form / Editör Modu */}
      {activeTab === 'edit' ? (
        <div className="space-y-6">
          {/* Metadata Grid (Kategori & Kapak & Etiketler) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card/40 border border-border/50 rounded-3xl p-5 sm:p-6">
            {/* Kategori Seçimi */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ColumnCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm font-medium text-foreground focus:border-primary focus:outline-hidden"
              >
                {COLUMN_CATEGORIES.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kapak Görseli */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Kapak Görseli
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... veya yükleyin"
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/60 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
                <label className="px-3 py-2 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/60 text-muted hover:text-foreground text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                  {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Etiketler */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Etiketler (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="edebiyat, roman, felsefe, kritik"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          {/* Kapak Önizleme Mini Şerit (varsa) */}
          {coverImage && (
            <div className="relative w-full h-44 sm:h-56 rounded-3xl overflow-hidden border border-border/50 shadow-md">
              <img src={coverImage} alt="Kapak" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black/90 text-xs font-bold px-3 py-1 rounded-xl backdrop-blur-md cursor-pointer"
              >
                Görseli Kaldır
              </button>
            </div>
          )}

          {/* Başlık Alanı (Büyük Tipografi) */}
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Köşe Yazısı Başlığı..."
              className="w-full text-2xl sm:text-4xl font-extrabold text-foreground placeholder:text-muted/40 bg-transparent border-b border-border/40 focus:border-primary pb-3 focus:outline-hidden tracking-tight transition-colors"
            />

            {/* Alt Başlık / Spot */}
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Yazının vurucu spotu veya özet cümlesi..."
              className="w-full text-base sm:text-lg text-muted/90 placeholder:text-muted/40 bg-transparent border-b border-border/20 focus:border-primary/60 pb-2 focus:outline-hidden font-medium transition-colors"
            />
          </div>

          {/* Formatlama Araç Çubuğu */}
          <div className="flex items-center gap-1 p-2 rounded-2xl bg-card/60 border border-border/50 text-muted">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors cursor-pointer"
              title="Kalın Metin"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors cursor-pointer"
              title="İtalik Metin"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n## ', '\n')}
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors cursor-pointer"
              title="Ara Başlık"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n> "', '"\n')}
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors cursor-pointer"
              title="Alıntı Bloğu"
            >
              <Quote size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n- ', '\n')}
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors cursor-pointer"
              title="Madde İşareti"
            >
              <List size={16} />
            </button>
            <span className="text-[11px] text-muted/60 ml-auto mr-2">
              Markdown & Paragraflar Desteklenir
            </span>
          </div>

          {/* İçerik Metin Alanı */}
          <div>
            <textarea
              id="column-content-textarea"
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Köşe yazınızı buraya kaleme alın. Edebi derinliğinizi ve düşüncelerinizi rahatça ifade edin..."
              className="w-full px-5 py-5 rounded-3xl bg-card/40 border border-border/50 focus:border-primary focus:outline-hidden text-base sm:text-lg text-foreground font-serif leading-relaxed placeholder:font-sans placeholder:text-muted/40 resize-y transition-colors shadow-xs"
            />
          </div>
        </div>
      ) : (
        /* Önizleme Modu (Gündem Okuma Görünümü) */
        <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-12 shadow-xl space-y-8 max-w-3xl mx-auto">
          {/* Header Strip */}
          <div className="flex items-center justify-between border-b border-border/40 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Feather size={20} />
                )}
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm sm:text-base">
                  {userProfile?.displayName || 'Yazar'}
                </span>
                <span className="text-xs text-primary font-medium">
                  {userProfile?.columnistTitle || 'Köşe Yazarı'}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-muted">
              <span className="block font-medium">{estimatedMinutes} dk okuma</span>
              <span className="text-[11px]">Önizleme Modu</span>
            </div>
          </div>

          {/* Cover */}
          {coverImage && (
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg">
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Başlık & Spot */}
          <div>
            <Typography variant="h1" className="text-2xl sm:text-4xl font-black text-foreground mb-3 tracking-tight leading-tight">
              {title || 'Yazı Başlığı'}
            </Typography>
            {subtitle && (
              <p className="text-base sm:text-xl text-muted font-serif italic border-l-2 border-primary pl-4 py-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* İçerik Gövdesi */}
          <div className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed space-y-4 whitespace-pre-wrap">
            {content || 'İçerik henüz girilmedi...'}
          </div>

          {/* Yazar Bio Kapanış Kartı */}
          <div className="mt-12 pt-8 border-t border-border/40 flex items-center gap-4 bg-muted/10 p-5 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden shrink-0">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Feather size={24} />
              )}
            </div>
            <div>
              <span className="font-bold text-foreground block text-sm">
                {userProfile?.displayName || 'Yazar'}
              </span>
              <p className="text-xs text-muted line-clamp-2 mt-0.5">
                {userProfile?.bio || 'Readixon Gündem yazarı.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
