"use client";

import React, { useState } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { createEditorialReview, searchStories, getStoryById, useAuthStore, EditorialReview } from '@readixon/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Search, BookOpen, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewEditorReviewPage() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [notifyAuthorOnSave, setNotifyAuthorOnSave] = useState(true);
  const [storyIdInput, setStoryIdInput] = useState('');
  const [storySearchLoading, setStorySearchLoading] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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

  const handleSearchStory = async () => {
    if (!storyIdInput.trim()) return;
    setStorySearchLoading(true);
    setSearchResults([]);
    try {
      const term = storyIdInput.trim();
      let foundStories = await searchStories(term);

      // Eğer isimle bulunamadıysa ve ID'ye benziyorsa (min 15 karakter) ID ile de şansımızı deneyelim
      if (foundStories.length === 0 && term.length >= 15) {
        const foundById = await getStoryById(term);
        if (foundById) {
          foundStories = [foundById as any];
        }
      }

      if (foundStories && foundStories.length > 0) {
        setSearchResults(foundStories);
        toast.success(`${foundStories.length} eser bulundu!`);
      } else {
        toast.error("Bu arama ile eser bulunamadı.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Arama sırasında hata oluştu: " + e.message);
    } finally {
      setStorySearchLoading(false);
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
    if (!story) {
      toast.error("Lütfen önce bir eser seçin.");
      return;
    }
    if (!userProfile) return;

    setLoading(true);
    try {
      const reviewData: Omit<EditorialReview, 'id' | 'createdAt' | 'updatedAt'> = {
        storyId: story.storyId,
        storyTitle: story.title,
        storyCover: story.coverImage,
        authorName: story.authorName || '',
        authorAvatar: story.authorAvatarUrl || '',
        editorId: userProfile.uid,
        editorName: userProfile.displayName,
        editorAvatar: userProfile.avatarUrl,
        ...formData
      };

      const newReviewId = await createEditorialReview(reviewData);

      if (notifyAuthorOnSave) {
        try {
          const res = await fetch('/api/editorial/notify-author', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId: newReviewId })
          });
          const resData = await res.json();
          if (res.ok) {
            toast.success(resData.message || "Editoryal değerlendirme yayınlandı ve yazara bildirim/e-posta iletildi!");
          } else {
            toast.success("Editoryal değerlendirme yayınlandı! (Yazara bildirim daha sonra iletilebilir)");
          }
        } catch (notifErr) {
          console.warn("Otomatik bildirim hatası:", notifErr);
          toast.success("Editoryal değerlendirme yayınlandı!");
        }
      } else {
        toast.success("Editoryal değerlendirme yayınlandı!");
      }

      router.push('/editor/reviews');
    } catch (error) {
      console.error(error);
      toast.error("Değerlendirme kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/editor/reviews">
          <Button variant="ghost" size="sm" className="text-muted hover:text-text rounded-full shrink-0 w-10 h-10 p-0">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <Typography variant="h2" className="font-bold">Yeni Editoryal Değerlendirme</Typography>
          <Typography variant="body" className="text-muted mt-1">Readixon Standartlarına (Gold Standart) uygun inceleme yazın.</Typography>
        </div>
      </div>

      {/* 1. ESER SEÇİMİ */}
      <div className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm">
        <Typography variant="h3" className="font-bold mb-4 flex items-center gap-2"><BookOpen className="text-primary" size={20} /> 1. Eser Seçimi</Typography>

        {!story ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted mb-1 block uppercase tracking-wider">Eser Adı</label>
                <Input
                  value={storyIdInput}
                  onChangeText={(val) => setStoryIdInput(val)}
                  placeholder="Örn: Karanlık Orman..."
                  className="w-full bg-background"
                />
              </div>
              <Button onPress={handleSearchStory} disabled={storySearchLoading || !storyIdInput} variant="secondary">
                {storySearchLoading ? 'Aranıyor...' : <><Search size={16} className="mr-2" /> Bul</>}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-background border border-border/50 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map((s) => (
                  <button
                    key={s.storyId}
                    onClick={() => {
                      setStory(s);
                      setSearchResults([]);
                      setStoryIdInput('');
                    }}
                    className="w-full text-left p-3 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-14 bg-muted/20 rounded overflow-hidden shrink-0">
                      {s.coverImage ? (
                        <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted"><BookOpen size={16} /></div>
                      )}
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold">{s.title}</Typography>
                      <Typography variant="caption" className="text-muted">Yazar: {s.authorName || 'Bilinmiyor'}</Typography>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-background border border-border/50 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-16 bg-muted/20 rounded overflow-hidden shrink-0">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted"><BookOpen size={20} /></div>
                )}
              </div>
              <div>
                <Typography variant="h3" className="font-bold">{story.title}</Typography>
                <Typography variant="caption" className="text-muted">Yazar: {story.authorName || 'Bilinmiyor'}</Typography>
              </div>
            </div>
            <Button variant="ghost" size="sm" onPress={() => setStory(null)} className="text-red-500 hover:bg-red-500/10">Değiştir</Button>
          </div>
        )}
      </div>

      {story && (
        <>
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
            <label className="flex items-center gap-3 cursor-pointer select-none bg-card/60 border border-border/50 px-4 py-3 rounded-xl hover:border-amber-500/40 transition-colors">
              <input
                type="checkbox"
                checked={notifyAuthorOnSave}
                onChange={(e) => setNotifyAuthorOnSave(e.target.checked)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-text flex items-center gap-1.5">
                <Send size={15} className="text-amber-500" />
                Kaydedildiğinde yazara bildirim ve e-posta gönder
              </span>
            </label>

            <Button onPress={handleSubmit} disabled={loading} className="px-8 py-6 text-lg">
              {loading ? 'Yayınlanıyor...' : <><Save size={20} className="mr-2" /> İncelemeyi Yayınla</>}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
