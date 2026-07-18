'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { ArrowLeft, PlusCircle, Save, GripVertical, CheckCircle, Wand2, Info } from 'lucide-react';
import {
  getStoryById,
  updateStory,
  createChapter,
  fetchChapters,
  updateChapter,
  createNotification,
  getUserFollowerIds,
  useAuthStore,
  compressImage,
  type Story,
  type Chapter,
  type StoryStatus,
  type Contributor
} from '@readixon/core';
import { uploadFile } from '@readixon/core/src/services/storageService';
import { toast } from "sonner";

export default function StoryDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isInitialLoad = React.useRef(true);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<StoryStatus>('draft');
  const [foreword, setForeword] = useState('');
  const [backCover, setBackCover] = useState('');
  const [contributors, setContributors] = useState<Contributor[]>([]);

  const { userProfile } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [storyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const realStory = await getStoryById(storyId);
      let chaps = await fetchChapters(storyId);

      setChapters(chaps);

      if (realStory) {
        setStory(realStory);
        setTitle(realStory.title || '');
        setSummary(realStory.summary || '');
        setCoverImage(realStory.coverImage || '');
        setStatus(realStory.status || 'draft');
        setForeword(realStory.foreword || '');
        setBackCover(realStory.backCover || '');

        // Geriye dönük uyumluluk: eski string dizisi (veya string) ise nesneye çevir
        const rawContributors = realStory.contributors || [];
        if (rawContributors.length > 0 && typeof rawContributors[0] === 'string') {
          setContributors((rawContributors as any[]).map(c => ({ role: 'Katkıda Bulunan', name: c })));
        } else {
          setContributors(rawContributors as Contributor[]);
        }
      } else {
        toast.error("Hikaye bulunamadı.");
        router.push('/studio');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Boş isimli katkıda bulunanları filtrele
      const validContributors = contributors.filter(c => c.name.trim().length > 0);
      await updateStory(storyId, {
        title,
        summary,
        coverImage,
        status,
        foreword,
        backCover,
        contributors: validContributors
      });
      toast.success('Kaydedildi');
    } catch (e) {
      toast.error('Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      const validContributors = contributors.filter(c => c.name.trim().length > 0);
      await updateStory(storyId, {
        title,
        summary,
        coverImage,
        status,
        foreword,
        backCover,
        contributors: validContributors
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setAutoSaveStatus('idle');
    }
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      if (!loading && story) {
        isInitialLoad.current = false;
      }
      return;
    }

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, summary, coverImage, status, foreword, backCover, contributors, loading, story]);

  const handleAddChapter = async () => {
    try {
      const newChapId = await createChapter(storyId, {
        title: `Bölüm ${chapters.length + 1}`,
        order: chapters.length + 1,
        contentBlocks: []
      });
      router.push(`/studio/story/${storyId}/chapter/${newChapId}`);
    } catch (e) {
      toast.error("Bölüm oluşturulamadı.");
    }
  };

  const handleDeleteStory = async () => {
    const isConfirmed = window.confirm(
      "DİKKAT: Bu hikayeyi, tüm bölümlerini, sihirbaz planlama notlarını ve yorumlarını kalıcı olarak silmek üzeresiniz!\n\nBu işlemin hiçbir geri dönüşü YOKTUR. Silmek istediğinize emin misiniz?"
    );
    if (!isConfirmed) return;

    setSaving(true);
    try {
      const { deleteStoryCompletely } = await import('@readixon/core');
      await deleteStoryCompletely(storyId);
      toast.success("Hikaye kalıcı olarak silindi.");
      router.push('/studio');
    } catch (e) {
      console.error(e);
      toast.error("Hikaye silinirken bir hata oluştu.");
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setSaving(true);
        const originalFile = e.target.files[0];
        // Sıkıştırma: Max 800x1200, %80 kalite
        const compressedFile = await compressImage(originalFile);

        const url = await uploadFile(compressedFile, `covers/${storyId}-${Date.now()}`);
        setCoverImage(url);
      } catch (err) {
        toast.error("Görsel yüklenemedi");
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return <div className="p-8"><Typography variant="body">Yükleniyor...</Typography></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <Button variant="ghost" onPress={() => router.back()} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2" /> Geri Dön
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <Typography variant="h1">{title || 'İsimsiz Hikaye'}</Typography>
          <Typography variant="caption" className="text-muted mt-2">Hikaye detaylarını ve bölümleri buradan yönetebilirsiniz.</Typography>
        </div>
        <div className="flex items-center gap-4">
          {autoSaveStatus === 'saving' && (
            <Typography variant="caption" className="text-muted flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin" />
              Kaydediliyor...
            </Typography>
          )}
          {autoSaveStatus === 'saved' && (
            <Typography variant="caption" className="text-green-500 font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
              <CheckCircle size={14} /> Kaydedildi
            </Typography>
          )}
          <Button variant="primary" onPress={handleSave} disabled={saving || autoSaveStatus === 'saving'}>
            <Save size={18} className="mr-2" /> Kaydet
          </Button>
        </div>
      </div>

      {/* Bilgilendirme Alanı */}
      <div className="mb-8 p-4 md:p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row gap-4 text-primary">
        <div className="shrink-0 pt-1">
          <Info size={28} />
        </div>
        <div className="text-sm">
          <strong className="block mb-2 text-base font-bold">Stüdyo Yönetim Paneline Hoş Geldiniz!</strong>
          <p className="mb-2 opacity-90">Bu sayfa hikayenizin kalbidir. Peki burada neler yapabilirsiniz?</p>
          <ul className="list-disc ml-4 space-y-2 opacity-90">
            <li><strong className="font-semibold">Kapak ve Detaylar:</strong> Hikayenizin vitrinidir. Okurların göreceği kapak görselini, özeti, önsözü, arka kapak sözünü, varsa ekibinizi ve hikayenin durumunu buradan ayarlarsınız. Yaptığınız değişiklikleri sağ üstteki "Kaydet" butonu ile kaydetmeyi unutmayın. (Otomatik kaydetme özelliği aktif.)</li>
            <li><strong className="font-semibold">Bölümler ve Planlama:</strong> Hikayenizin gidişatını buradan yönetirsiniz. "Yeni Bölüm Ekle" veya eklediğiniz bölümün üzerine tıklayarak gelişmiş içerik editörüne geçebilir ve hemen yazmaya başlayabilirsiniz. Ayrıca "Sihirbaz Planlamasına Git" butonuna tıklayarak (yapay zeka kullandıysanız) hikaye şemanızı, karakterlerinizi ve kurgunuzu detaylandırabilirsiniz.</li>
            <li><strong className="font-semibold">Tehlikeli Bölge:</strong> Sayfanın sol kolonunda, en altında hikayenizi tamamen silebilirsiniz. Ancak dikkatli olun, bu işlemin geri dönüşü yoktur!</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sol Kolon: Metadata */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border/20">
            <Typography variant="h3" className="mb-4">Kapak Görseli</Typography>
            <div className="w-full aspect-[2/3] bg-muted/10 rounded-xl overflow-hidden border-2 border-dashed border-border flex flex-col items-center justify-center relative mb-4">
              {coverImage ? (
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <Typography variant="caption" className="text-muted">Görsel Seç</Typography>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Görsel Yükle"
              />
            </div>
            {coverImage && (
              <Input
                value={coverImage}
                onChangeText={setCoverImage}
                placeholder="Görsel URL (Manuel değiştirebilirsiniz)"
              />
            )}
          </div>

          {/* Kurgu Sihirbazı Kısayolu */}
          <div
            onClick={() => router.push(`/studio/story/${storyId}/planner`)}
            className="bg-primary/5 p-6 rounded-2xl border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors group flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl text-primary">
                <Wand2 size={24} />
              </div>
              <Typography variant="h3" className="font-bold text-primary">Kurgu Sihirbazı</Typography>
            </div>
            <Typography variant="caption" className="text-muted">Hikayenizi baştan sona planlayın, plot twistler ve finaller kurgulayın.</Typography>
          </div>

          <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20">
            <Typography variant="h3" className="text-red-500 mb-2 font-bold">Tehlikeli Bölge</Typography>
            <Typography variant="caption" className="text-muted block mb-4 leading-relaxed">
              Bu hikayeyi ve altındaki tüm bölümleri, notları kalıcı olarak silmek istiyorsanız aşağıdaki butonu kullanabilirsiniz. Veritabanından tamamen silinecektir ve <strong>bu işlemin hiçbir geri dönüşü yoktur.</strong>
            </Typography>
            <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 w-full" onPress={handleDeleteStory}>
              Hikayeyi Kalıcı Olarak Sil
            </Button>
          </div>
        </div>

        {/* Sağ Kolon: Form ve Bölümler */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <div className="bg-card p-6 rounded-2xl border border-border/20 flex flex-col gap-4">
            <Typography variant="h3" className="mb-2">Hikaye Bilgileri</Typography>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Hikaye Başlığı"
            />
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Hikaye Özeti (Kitabın genel tanıtımı)"
              className="w-full bg-background border border-border/50 rounded-xl p-4 text-text focus:outline-none focus:border-primary resize-y min-h-[120px]"
            />

            <Typography variant="h3" className="mt-4 mb-2 text-lg">Yayın & Kitap Detayları</Typography>
            <textarea
              value={foreword}
              onChange={(e) => setForeword(e.target.value)}
              placeholder="Önsöz (İsteğe bağlı)"
              className="w-full bg-background border border-border/50 rounded-xl p-4 text-text focus:outline-none focus:border-primary resize-y min-h-[80px]"
            />
            <textarea
              value={backCover}
              onChange={(e) => setBackCover(e.target.value)}
              placeholder="Arka Kapak Yazısı (İsteğe bağlı)"
              className="w-full bg-background border border-border/50 rounded-xl p-4 text-text focus:outline-none focus:border-primary resize-y min-h-[80px]"
            />
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <Typography variant="caption" className="font-bold text-muted uppercase">Ekip & Katkıda Bulunanlar</Typography>
                <button
                  onClick={() => setContributors([...contributors, { role: 'Editör', name: '' }])}
                  className="text-primary text-sm flex items-center gap-1 hover:underline"
                >
                  <PlusCircle size={14} /> Kişi Ekle
                </button>
              </div>

              {contributors.length === 0 ? (
                <Typography variant="body" className="text-muted/50 text-sm italic">Henüz kimse eklenmedi.</Typography>
              ) : (
                <div className="space-y-3">
                  {contributors.map((contributor, idx) => (
                    <div key={idx} className="flex gap-3">
                      <select
                        value={contributor.role}
                        onChange={(e) => {
                          const newC = [...contributors];
                          newC[idx].role = e.target.value;
                          setContributors(newC);
                        }}
                        className="bg-background border border-border/50 rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                      >
                        <option value="Editör">Editör</option>
                        <option value="Çevirmen">Çevirmen</option>
                        <option value="Kapak Tasarımı">Kapak Tasarımı</option>
                        <option value="Çizer">Çizer</option>
                        <option value="Son Okuma">Son Okuma</option>
                        <option value="Katkıda Bulunan">Diğer</option>
                      </select>
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) => {
                          const newC = [...contributors];
                          newC[idx].name = e.target.value;
                          setContributors(newC);
                        }}
                        placeholder="İsim Soyisim"
                        className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => {
                          setContributors(contributors.filter((_, i) => i !== idx));
                        }}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Typography variant="caption" className="font-bold text-muted uppercase">Yayın Durumu</Typography>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-background border border-border/50 rounded-xl p-4 text-text focus:outline-none focus:border-primary appearance-none"
              >
                <option value="draft">Taslak (Sadece siz görebilirsiniz)</option>
                <option value="ongoing">Yayında (Devam Ediyor)</option>
                <option value="completed">Yayında (Tamamlandı)</option>
              </select>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border/20">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h3">Bölümler</Typography>
              <Button variant="outline" onPress={handleAddChapter} className="text-sm py-2">
                <PlusCircle size={16} className="mr-2" /> Yeni Ekle
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {chapters.length === 0 ? (
                <div className="text-center py-8 text-muted border-2 border-dashed border-border/20 rounded-xl">
                  Henüz bölüm eklenmemiş.
                </div>
              ) : (
                chapters.map(chap => (
                  <div key={chap.chapterId} className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border/10 group">
                    <GripVertical size={20} className="text-muted/50 cursor-grab" />
                    <div className="flex-1 cursor-pointer" onClick={() => router.push(`/studio/story/${storyId}/chapter/${chap.chapterId}`)}>
                      <Typography variant="body" className="font-bold group-hover:text-primary transition-colors">{chap.title}</Typography>
                      <Typography variant="caption" className="text-muted">Sıra: {chap.order}</Typography>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
