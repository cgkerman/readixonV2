'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { 
  ArrowLeft, Save, Upload, User, Heart, Brain, 
  Activity, Sparkles, BookOpen, Fingerprint, Eye, X
} from 'lucide-react';
import { 
  getCharacter, 
  createCharacter, 
  updateCharacter,
  uploadFile,
  type Character, 
  type CharacterRole,
  type CharacterRPGStats
} from '@readixon/core';
import { toast } from 'sonner';

const TABS = [
  { id: 'basic', label: 'Temel Dosya', icon: <User size={16} /> },
  { id: 'physical', label: 'Fiziksel Profil', icon: <Fingerprint size={16} /> },
  { id: 'psychology', label: 'Psikolojik Analiz', icon: <Brain size={16} /> },
  { id: 'arc', label: 'Karakter Eğrisi', icon: <BookOpen size={16} /> },
  { id: 'stats', label: 'Yetkinlik Puanları', icon: <Activity size={16} /> },
];

export default function CharacterEditPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;
  const characterId = params.characterId as string;
  const isNew = characterId === 'new';

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Character>>({
    role: 'supporting',
    personalityTraits: [],
    rpgStats: {
      intelligence: 5,
      strength: 5,
      charisma: 5,
      agility: 5,
      empathy: 5
    }
  });
  
  const [newTrait, setNewTrait] = useState('');

  useEffect(() => {
    if (isNew) return;
    
    const fetchChar = async () => {
      try {
        const data = await getCharacter(storyId, characterId);
        if (data) {
          // Merge with default rpgStats if missing
          setFormData({
            ...data,
            rpgStats: data.rpgStats || { intelligence: 5, strength: 5, charisma: 5, agility: 5, empathy: 5 }
          });
        }
      } catch (error) {
        toast.error('Karakter bilgileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchChar();
  }, [storyId, characterId, isNew]);

  const handleChange = (field: keyof Character, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (stat: keyof CharacterRPGStats, value: number) => {
    setFormData(prev => ({
      ...prev,
      rpgStats: { ...prev.rpgStats, [stat]: value } as CharacterRPGStats
    }));
  };

  const addTrait = () => {
    if (newTrait.trim() && !formData.personalityTraits?.includes(newTrait.trim())) {
      setFormData(prev => ({
        ...prev,
        personalityTraits: [...(prev.personalityTraits || []), newTrait.trim()]
      }));
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits?.filter(t => t !== trait)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `stories/${storyId}/characters/${isNew ? 'temp' : characterId}_${Date.now()}`;
      const url = await uploadFile(path, file);
      handleChange('avatarUrl', url);
      toast.success('Karakter resmi yüklendi.');
    } catch (error) {
      toast.error('Resim yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Lütfen karaktere bir isim verin.');
      return;
    }
    
    setSaving(true);
    try {
      if (isNew) {
        const newId = await createCharacter(storyId, formData);
        toast.success('Karakter başarıyla oluşturuldu!');
        router.push(`/studio/characters/${storyId}/${newId}`);
      } else {
        await updateCharacter(storyId, characterId, formData);
        toast.success('Karakter güncellendi!');
      }
    } catch (error) {
      toast.error('Kaydetme başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-40"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const inputClass = "w-full bg-background/50 border border-border/60 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-border";
  const textareaClass = "w-full bg-background/50 border border-border/60 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-border min-h-[120px] resize-y custom-scrollbar font-medium leading-relaxed";
  const labelClass = "block text-sm font-bold text-muted mb-2 uppercase tracking-wider";

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full relative min-h-screen pb-32">
      <button 
        onClick={() => router.push(`/studio/characters/${storyId}`)} 
        className="flex items-center gap-2 mb-8 text-muted hover:text-text transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        <Typography variant="body" className="font-medium">Karakter Listesine Dön</Typography>
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sol Sütun: Profil Özeti (Sabit Kalır) */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-card border border-border/50 rounded-3xl p-6 sticky top-8 shadow-2xl shadow-primary/5">
            <div 
              className="w-full aspect-[3/4] bg-background rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center mb-6 relative overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.avatarUrl ? (
                <>
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Upload className="text-white mb-2" size={32} />
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="mx-auto text-muted mb-2" size={32} />
                  <Typography variant="caption" className="text-muted">Fotoğraf veya çizim yükle</Typography>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <Input 
              label="Karakter Adı" 
              placeholder="Örn: John Doe" 
              value={formData.name || ''} 
              onChangeText={(val) => handleChange('name', val)} 
              className="mb-4"
            />
            
            <div className="mb-4">
              <label className={labelClass}>Rol</label>
              <select 
                className={inputClass}
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
              >
                <option value="protagonist">Baş Karakter (Protagonist)</option>
                <option value="antagonist">Ana Kötü / Düşman (Antagonist)</option>
                <option value="supporting">Yan Karakter</option>
                <option value="minor">Figüran</option>
              </select>
            </div>

            <Button 
              variant="primary" 
              className="w-full py-4 mt-4 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              onPress={handleSave}
              disabled={saving}
            >
              <Save size={20} />
              {saving ? 'Kaydediliyor...' : 'Deftere Kaydet'}
            </Button>
          </div>
        </div>

        {/* Sağ Sütun: Defter Sekmeleri */}
        <div className="flex-1">
          {/* Sekme Menüsü */}
          <div className="flex flex-wrap gap-2 mb-8 bg-card p-2 rounded-2xl border border-border/30">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                    : 'text-muted hover:bg-muted/10 hover:text-text'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Defter Sayfası Görünümü */}
          <div className="bg-card border border-border/40 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            {/* Sayfa çizgileri efekti (Defterimsi görünüm) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
                 style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--border) 31px, var(--border) 32px)', backgroundPositionY: '40px' }} 
            />

            <div className="relative z-10">
              {/* Sekme İçerikleri */}
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/30">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><User size={24} /></div>
                    <Typography variant="h2" className="font-black">Kimlik Dosyası</Typography>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Yaş</label>
                      <input className={inputClass} value={formData.age || ''} onChange={e => handleChange('age', e.target.value)} placeholder="Örn: 24, Yüzlerce yıllık..." />
                    </div>
                    <div>
                      <label className={labelClass}>Cinsiyet</label>
                      <input className={inputClass} value={formData.gender || ''} onChange={e => handleChange('gender', e.target.value)} placeholder="Örn: Kadın, Erkek, Bilinmiyor" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Meslek / Unvan</label>
                    <input className={inputClass} value={formData.occupation || ''} onChange={e => handleChange('occupation', e.target.value)} placeholder="Örn: Uzay Korsanı, Lise Öğrencisi" />
                  </div>
                </div>
              )}

              {activeTab === 'physical' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/30">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Eye size={24} /></div>
                    <Typography variant="h2" className="font-black">Fiziksel Profil</Typography>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Göz Rengi</label>
                      <input className={inputClass} value={formData.eyeColor || ''} onChange={e => handleChange('eyeColor', e.target.value)} placeholder="Örn: Çimen yeşili" />
                    </div>
                    <div>
                      <label className={labelClass}>Saç Rengi ve Şekli</label>
                      <input className={inputClass} value={formData.hairColor || ''} onChange={e => handleChange('hairColor', e.target.value)} placeholder="Örn: Dağınık siyah saçlar" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Giyim Tarzı (Aura)</label>
                    <input className={inputClass} value={formData.clothingStyle || ''} onChange={e => handleChange('clothingStyle', e.target.value)} placeholder="Örn: Genelde koyu renk bol kıyafetler giyer." />
                  </div>
                  <div>
                    <label className={labelClass}>Belirgin Özellikler</label>
                    <textarea className={textareaClass} value={formData.distinguishingFeatures || ''} onChange={e => handleChange('distinguishingFeatures', e.target.value)} placeholder="Yara izleri, dövmeler, tikler veya dikkat çekici herhangi bir fiziksel detay..." />
                  </div>
                </div>
              )}

              {activeTab === 'psychology' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/30">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Heart size={24} /></div>
                    <Typography variant="h2" className="font-black">Psikolojik Profil</Typography>
                  </div>
                  
                  <div>
                    <label className={labelClass}>Karakter Özellikleri (Etiketler)</label>
                    <div className="flex flex-wrap gap-2 mb-3 bg-background p-4 rounded-xl border border-border/50 min-h-[60px]">
                      {formData.personalityTraits?.map((trait, i) => (
                        <span key={i} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                          {trait}
                          <button onClick={() => removeTrait(trait)} className="hover:text-red-500 transition-colors"><X size={14} /></button>
                        </span>
                      ))}
                      {(!formData.personalityTraits || formData.personalityTraits.length === 0) && (
                        <span className="text-muted text-sm italic py-1">Henüz özellik eklenmedi...</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        className={inputClass} 
                        value={newTrait} 
                        onChange={e => setNewTrait(e.target.value)} 
                        placeholder="Yeni özellik (Örn: Kıskanç, İçe dönük)"
                        onKeyDown={e => e.key === 'Enter' && addTrait()}
                      />
                      <Button variant="outline" onPress={addTrait}>Ekle</Button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>En Büyük Korkusu (Kabusları)</label>
                    <textarea className={textareaClass} value={formData.greatestFear || ''} onChange={e => handleChange('greatestFear', e.target.value)} placeholder="Onu geceleri uyutmayan şey ne?" />
                  </div>
                  <div>
                    <label className={labelClass}>Kusurları (Flaws)</label>
                    <textarea className={textareaClass} value={formData.flaws || ''} onChange={e => handleChange('flaws', e.target.value)} placeholder="Mükemmel karakterler sıkıcıdır. Onun en büyük hatası/zayıflığı ne?" />
                  </div>
                </div>
              )}

              {activeTab === 'arc' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/30">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Sparkles size={24} /></div>
                    <Typography variant="h2" className="font-black">Karakterin Yolculuğu</Typography>
                  </div>
                  <div>
                    <label className={labelClass}>Ana Motivasyon</label>
                    <textarea className={textareaClass} value={formData.coreMotivation || ''} onChange={e => handleChange('coreMotivation', e.target.value)} placeholder="Bu karakter ne istiyor ve neden istiyor?" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Hikaye Başındaki Durumu</label>
                      <textarea className={textareaClass} value={formData.startingState || ''} onChange={e => handleChange('startingState', e.target.value)} placeholder="Sayfa 1'de bu karakter nasıl biri?" />
                    </div>
                    <div>
                      <label className={labelClass}>Hikaye Sonundaki Değişimi</label>
                      <textarea className={textareaClass} value={formData.endingState || ''} onChange={e => handleChange('endingState', e.target.value)} placeholder="Olaylar onu nasıl değiştirecek?" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Activity size={24} /></div>
                    <div>
                      <Typography variant="h2" className="font-black">Yetkinlik Puanları</Typography>
                      <Typography variant="caption" className="text-muted">Karakterinizin temel RPG istatistiklerini 1 ile 10 arasında değerlendirin.</Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-6 max-w-xl">
                    {[
                      { key: 'intelligence', label: 'Zeka & Strateji' },
                      { key: 'strength', label: 'Fiziksel Güç' },
                      { key: 'charisma', label: 'Karizma & Liderlik' },
                      { key: 'agility', label: 'Çeviklik & Hız' },
                      { key: 'empathy', label: 'Empati & Duygusallık' },
                    ].map(stat => (
                      <div key={stat.key} className="bg-background p-5 rounded-2xl border border-border/40">
                        <div className="flex justify-between items-center mb-4">
                          <Typography variant="body" className="font-bold">{stat.label}</Typography>
                          <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-primary/30">
                            {(formData.rpgStats as any)?.[stat.key] || 5}
                          </div>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={(formData.rpgStats as any)?.[stat.key] || 5} 
                          onChange={e => handleStatChange(stat.key as any, parseInt(e.target.value))}
                          className="w-full accent-primary h-2 bg-muted/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
