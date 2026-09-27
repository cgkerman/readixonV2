"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@readixon/ui';
import { updateEditorialReview, getEditorialReviewById, getStoryById, useAuthStore, EditorialReview } from '@readixon/core';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, BookOpen, AlertCircle, Send, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EditEditorReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { userProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [review, setReview] = useState<EditorialReview | null>(null);
  const [story, setStory] = useState<any>(null);

  const [formData, setFormData] = useState({
    about: '',
    firstImpression: '',
    storyAndStructure: '',
    characters: '',
    worldAndAtmosphere: '',
    languageAndStyle: '',
    themes: '',
    strengths: '',
    areasForImprovement: '',
    readerExperience: '',
    finalWord: '',
    spoilerNotes: '',
    scores: {
      storyStructure: 5,
      characters: 5,
      languageAndStyle: 5,
      pacing: 5,
      worldBuilding: 5,
      originality: 5,
      emotionalImpact: 5,
      technicalConsistency: 5,
    }
  });

  useEffect(() => {
    fetchReview();
  }, [id, router]);

  const fetchReview = async () => {
    try {
      const fetchedReview = await getEditorialReviewById(id);
      if (fetchedReview) {
        setReview(fetchedReview);
        setFormData({
          about: fetchedReview.about || '',
          firstImpression: fetchedReview.firstImpression || '',
          storyAndStructure: fetchedReview.storyAndStructure || '',
          characters: fetchedReview.characters || '',
          worldAndAtmosphere: fetchedReview.worldAndAtmosphere || '',
          languageAndStyle: fetchedReview.languageAndStyle || '',
          themes: fetchedReview.themes || '',
          strengths: fetchedReview.strengths || '',
          areasForImprovement: fetchedReview.areasForImprovement || '',
          readerExperience: fetchedReview.readerExperience || '',
          finalWord: fetchedReview.finalWord || '',
          spoilerNotes: fetchedReview.spoilerNotes || '',
          scores: fetchedReview.scores || {
            storyStructure: 5, characters: 5, languageAndStyle: 5, pacing: 5,
            worldBuilding: 5, originality: 5, emotionalImpact: 5, technicalConsistency: 5,
          }
        });

        if (fetchedReview.storyId) {
          const fetchedStory = await getStoryById(fetchedReview.storyId);
          setStory(fetchedStory);
        }
      } else {
        toast.error('İnceleme bulunamadı.');
        router.push('/editor/reviews');
      }
    } catch (err) {
      console.error(err);
      toast.error('İnceleme yüklenirken hata oluştu.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (field: keyof typeof formData.scores, value: number) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      await updateEditorialReview(id, formData);
      toast.success("Editoryal değerlendirme güncellendi!");
      router.push('/editor/reviews');
    } catch (error) {
      console.error(error);
      toast.error("Değerlendirme güncellenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyAuthor = async () => {
    setNotifying(true);
    try {
      const res = await fetch('/api/editorial/notify-author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'İşlem gerçekleştirilemedi');
      }
      toast.success(data.message || 'Yazara bildirim ve e-posta iletildi!');
      await fetchReview();
    } catch (err: any) {
      console.error(err);
      toast.error('Bildirim gönderilirken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setNotifying(false);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const textSections = [
    { key: 'about', label: 'Eser Hakkında', desc: 'Kısa, spoilersız genel değerlendirme.' },
    { key: 'firstImpression', label: 'Editörün İlk İzlenimi', desc: 'Okuyucunun esere giriş deneyimi.' },
    { key: 'storyAndStructure', label: 'Hikâye ve Yapı', desc: 'Olay örgüsü, tempo, çatışma ve final.' },
    { key: 'characters', label: 'Karakterler', desc: 'Ana karakterler ve gelişimleri.' },
    { key: 'worldAndAtmosphere', label: 'Dünya ve Atmosfer', desc: 'Mekân, dönem, dünya kurulumunun niteliği.' },
    { key: 'languageAndStyle', label: 'Dil ve Üslup', desc: 'Yazarlık, anlatım, diyalog ve stil.' },
    { key: 'themes', label: 'Temalar', desc: 'Eserin üzerinde durduğu fikirler ve temalar.' },
    { key: 'strengths', label: 'Öne Çıkan Güçlü Yönler', desc: '3–5 temel güçlü taraf.' },
    { key: 'areasForImprovement', label: 'Geliştirilebilecek Alanlar', desc: '3–5 temel geliştirme alanı.' },
    { key: 'readerExperience', label: 'Okuyucu Deneyimi', desc: 'Kimler için ilgi çekici olabilir?' },
    { key: 'finalWord', label: 'Editörün Son Sözü', desc: 'Kısa final değerlendirmesi.' },
  ];

  const scoreSections = [
    { key: 'storyStructure', label: 'Hikâye Yapısı' },
    { key: 'characters', label: 'Karakterler' },
    { key: 'languageAndStyle', label: 'Dil ve Üslup' },
    { key: 'pacing', label: 'Tempo' },
    { key: 'worldBuilding', label: 'Dünya Kurulumu' },
    { key: 'originality', label: 'Özgünlük' },
    { key: 'emotionalImpact', label: 'Duygusal Etki' },
    { key: 'technicalConsistency', label: 'Teknik Tutarlılık' },
  ];

  if (initialLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/editor/reviews">
            <Button variant="ghost" size="sm" className="text-muted hover:text-text rounded-full shrink-0 w-10 h-10 p-0">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <Typography variant="h2" className="font-bold">Değerlendirmeyi Düzenle</Typography>
            <Typography variant="body" className="text-muted mt-1">Mevcut incelemeyi güncelleyin.</Typography>
          </div>
        </div>

        {/* Yazara Bildirim & Mail Butonu */}
        <div className="flex items-center gap-3">
          <Button
            variant={review?.authorNotifiedAt ? "outline" : "primary"}
            onPress={handleNotifyAuthor}
            disabled={notifying}
            className="flex items-center gap-2 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 shadow-sm"
          >
            {notifying ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>
              {review?.authorNotifiedAt ? 'Yazara Tekrar İlet' : 'Yazara Bildirim & Mail Gönder'}
            </span>
          </Button>
        </div>
      </div>

      {story && (
        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-20 bg-muted/20 rounded-lg overflow-hidden shrink-0 border border-border/40">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted"><BookOpen size={20} /></div>
                )}
              </div>
              <div>
                <Typography variant="h3" className="font-bold text-lg">{story.title}</Typography>
                <Typography variant="caption" className="text-muted block mt-0.5">
                  Yazar: <span className="text-text font-medium">{story.authorName || 'Bilinmiyor'}</span>
                </Typography>
                <div className="mt-2 flex items-center gap-2">
                  {review?.authorNotifiedAt ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 size={12} />
                      Yazara bildirildi ({formatTimestamp(review.authorNotifiedAt)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted/20 text-muted border border-border/40">
                      <Clock size={12} />
                      Yazara henüz bildirilmedi
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Link href={`/reviews/${id}`} target="_blank">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                <BookOpen size={16} className="mr-1.5" /> Canlı İncelemeyi Gör
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2. PUANLAMA */}
      <div className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm">
        <Typography variant="h3" className="font-bold mb-2">2. Detaylı Puanlama</Typography>
        <Typography variant="body" className="text-muted text-sm mb-6">Bu puanlar okuyuculara eserin teknik ve sanatsal durumu hakkında detaylı bilgi verir. (1-10 arası)</Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scoreSections.map((sec) => (
            <div key={sec.key} className="space-y-2">
              <label className="text-xs font-semibold text-muted block uppercase tracking-wider">{sec.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.scores[sec.key as keyof typeof formData.scores]}
                  onChange={(e) => handleScoreChange(sec.key as keyof typeof formData.scores, parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="font-bold w-6 text-center text-primary">{formData.scores[sec.key as keyof typeof formData.scores]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. METİN BÖLÜMLERİ */}
      <div className="space-y-6">
        {textSections.map((sec) => (
          <div key={sec.key} className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm">
            <Typography variant="h3" className="font-bold mb-1">{sec.label}</Typography>
            <Typography variant="body" className="text-muted text-sm mb-4">{sec.desc}</Typography>
            <textarea
              value={(formData as any)[sec.key]}
              onChange={(e) => handleTextChange(sec.key, e.target.value)}
              className="w-full h-32 bg-background border border-border/50 rounded-xl p-4 text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              placeholder={`${sec.label} hakkında düşüncelerinizi yazın...`}
            />
          </div>
        ))}

        {/* Spoiler Notları */}
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 shadow-sm">
          <Typography variant="h3" className="font-bold mb-1 flex items-center gap-2 text-orange-500"><AlertCircle size={20} /> Spoilerli Editör Notları (İsteğe Bağlı)</Typography>
          <Typography variant="body" className="text-orange-500/70 text-sm mb-4">Final, büyük sürprizler ve önemli karakter kaderleri burada yer almalıdır. Okuyucudan gizlenecektir.</Typography>
          <textarea
            value={formData.spoilerNotes}
            onChange={(e) => handleTextChange('spoilerNotes', e.target.value)}
            className="w-full h-32 bg-background border border-orange-500/30 rounded-xl p-4 text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y"
            placeholder="Spoiler içeren analizler..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <Button onPress={handleSubmit} disabled={loading} className="px-8 py-6 text-lg">
          {loading ? 'Güncelleniyor...' : <><Save size={20} className="mr-2" /> Değişiklikleri Kaydet</>}
        </Button>
      </div>
    </div>
  );
}
