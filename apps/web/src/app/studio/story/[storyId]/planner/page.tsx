"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { getStoryPlanner, updateStoryPlanner, type StoryPlanner } from '@readixon/core';
import { Wand2, Compass, AlertTriangle, Target, Save, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function StoryPlannerPage({ params }: { params: { storyId: string } }) {
  const router = useRouter();
  const [plannerData, setPlannerData] = useState<StoryPlanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'A' | 'C' | 'D'>('A');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPlanner = async () => {
      const data = await getStoryPlanner(params.storyId);
      if (data) {
        setPlannerData(data);
      } else {
        setPlannerData({
          storyId: params.storyId,
          updatedAt: {} as any,
          moduleA: {},
          moduleC: {},
          moduleD: {},
        });
      }
      setLoading(false);
    };
    fetchPlanner();
  }, [params.storyId]);

  const handleUpdate = (module: 'moduleA' | 'moduleC' | 'moduleD', field: string, value: string) => {
    if (!plannerData) return;
    
    const newData = {
      ...plannerData,
      [module]: {
        ...(plannerData[module] || {}),
        [field]: value
      }
    };
    
    setPlannerData(newData);

    // Autosave Debounce (1.5s)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateStoryPlanner(params.storyId, { [module]: newData[module] });
        setIsSaving(false);
      } catch (err) {
        toast.error("Kaydedilirken hata oluştu");
        setIsSaving(false);
      }
    }, 1500);
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  const renderModuleA = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mb-8">
        <Typography variant="h3" className="font-bold flex items-center gap-2 text-primary">
          <Compass size={24} /> Açılış Sahnesi (Kanca)
        </Typography>
        <Typography variant="body" className="text-muted mt-2">Okuyucuyu ilk satırlarda yakalamak için ana karakterin ve dünyanın en çarpıcı özelliklerini buraya not edin.</Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Ana Karakterin Özellikleri" 
          placeholder="Karakterin en iyi özellikleri nedir?" 
          value={plannerData?.moduleA?.characterTraits || ''}
          onChangeText={(v) => handleUpdate('moduleA', 'characterTraits', v)}
        />
        <Input 
          label="Gösterme Yolları" 
          placeholder="Bu özellikleri okuyucuya nasıl hissettireceksiniz?" 
          value={plannerData?.moduleA?.showTraitsWays || ''}
          onChangeText={(v) => handleUpdate('moduleA', 'showTraitsWays', v)}
        />
        <Input 
          label="Kanca (Hook)" 
          placeholder="Karakter okuyucunun ilgisini nasıl hızla çeker?" 
          value={plannerData?.moduleA?.hook || ''}
          onChangeText={(v) => handleUpdate('moduleA', 'hook', v)}
        />
        <Input 
          label="Karakter Gelişimi" 
          placeholder="Hikaye boyunca karakter nasıl bir gelişme gösterecek?" 
          value={plannerData?.moduleA?.characterDevelopment || ''}
          onChangeText={(v) => handleUpdate('moduleA', 'characterDevelopment', v)}
        />
        <Input 
          label="İçsel Durum" 
          placeholder="Baştaki içsel halini gösterme şekli nasıl olacak?" 
          value={plannerData?.moduleA?.internalState || ''}
          onChangeText={(v) => handleUpdate('moduleA', 'internalState', v)}
        />
        <Input 
          label="Gizem / Sırlar" 
          placeholder="Hangi gizem ortaya çıktı veya çözüldü?" 
          value={plannerData?.moduleA?.mystery || ''}
          onChangeText={(v) => handleUpdate('moduleA', 'mystery', v)}
        />
      </div>
    </div>
  );

  const renderModuleC = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/20 mb-8">
        <Typography variant="h3" className="font-bold flex items-center gap-2 text-orange-500">
          <AlertTriangle size={24} /> Plot Twist (Kırılma Noktası)
        </Typography>
        <Typography variant="body" className="text-muted mt-2">Hikayeyi ters köşeye yatırma ve okuyucuyu şaşırtma planlarınızı buraya yazın.</Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Algı Yanılsaması" 
          placeholder="Hangi kimlik/olay yanlış anlaşıldı?" 
          value={plannerData?.moduleC?.perceptionIllusion || ''}
          onChangeText={(v) => handleUpdate('moduleC', 'perceptionIllusion', v)}
        />
        <Input 
          label="Saklanan Sırlar & Motivasyonlar" 
          placeholder="Henüz bilinmeyen önemli detay nedir?" 
          value={plannerData?.moduleC?.motivations || ''}
          onChangeText={(v) => handleUpdate('moduleC', 'motivations', v)}
        />
        <Input 
          label="Okuyucuyu Şaşırtacak Olay" 
          placeholder="Okuyucunun beklemediği sürpriz nedir?" 
          value={plannerData?.moduleC?.surpriseEventForReader || ''}
          onChangeText={(v) => handleUpdate('moduleC', 'surpriseEventForReader', v)}
        />
        <Input 
          label="Karakteri Şaşırtacak Olay" 
          placeholder="Ana karakterin beklemediği sürpriz nedir?" 
          value={plannerData?.moduleC?.surpriseEventForCharacter || ''}
          onChangeText={(v) => handleUpdate('moduleC', 'surpriseEventForCharacter', v)}
        />
        <div className="md:col-span-2">
          <Input 
            label="Etki Analizi" 
            placeholder="Bu twist genel hikaye gidişatını nasıl değiştirecek?" 
            value={plannerData?.moduleC?.impactAnalysis || ''}
            onChangeText={(v) => handleUpdate('moduleC', 'impactAnalysis', v)}
          />
        </div>
      </div>
    </div>
  );

  const renderModuleD = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/20 mb-8">
        <Typography variant="h3" className="font-bold flex items-center gap-2 text-green-500">
          <Target size={24} /> Final Planlayıcı
        </Typography>
        <Typography variant="body" className="text-muted mt-2">Hikayeyi zirve noktasında düğümleyip, okuyucuda kalıcı bir his bırakma rehberiniz.</Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Ana Karakterin İstenen Sonu" 
          placeholder="Ana karakter nasıl bir son istedi?" 
          value={plannerData?.moduleD?.protagonistEnding || ''}
          onChangeText={(v) => handleUpdate('moduleD', 'protagonistEnding', v)}
        />
        <Input 
          label="Karşı Gücün (Antagonist) İstenen Sonu" 
          placeholder="Düşman nasıl bir son istedi?" 
          value={plannerData?.moduleD?.antagonistEnding || ''}
          onChangeText={(v) => handleUpdate('moduleD', 'antagonistEnding', v)}
        />
        <Input 
          label="Başlangıç Noktası" 
          placeholder="Hikaye nereden başladı?" 
          value={plannerData?.moduleD?.startingPoint || ''}
          onChangeText={(v) => handleUpdate('moduleD', 'startingPoint', v)}
        />
        <Input 
          label="Bitiş Noktası" 
          placeholder="Nerede bitmeli?" 
          value={plannerData?.moduleD?.endingPoint || ''}
          onChangeText={(v) => handleUpdate('moduleD', 'endingPoint', v)}
        />
        <Input 
          label="Duygusal Etki" 
          placeholder="Okuyucuyu sonda nasıl bir duyguyla bırakmak istiyorsunuz?" 
          value={plannerData?.moduleD?.emotionalImpact || ''}
          onChangeText={(v) => handleUpdate('moduleD', 'emotionalImpact', v)}
        />
        <Input 
          label="Ödenen Bedel" 
          placeholder="Hikayenin sonunda ödenen gerçek bedel nedir?" 
          value={plannerData?.moduleD?.pricePaid || ''}
          onChangeText={(v) => handleUpdate('moduleD', 'pricePaid', v)}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto w-full p-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Button variant="ghost" className="mb-2 -ml-3 text-muted" onPress={() => router.push(`/studio/story/${params.storyId}`)}>
            <ChevronLeft size={16} className="mr-1" /> Hikayeye Dön
          </Button>
          <Typography variant="h1" className="flex items-center gap-3">
            <Wand2 className="text-primary" size={32} />
            Kurgu Sihirbazı
          </Typography>
          <Typography variant="body" className="text-muted mt-2">Hikayenizin yapıtaşlarını planlayın. Değişiklikler otomatik kaydedilir.</Typography>
        </div>
        <div className="flex items-center gap-2 bg-muted/10 px-4 py-2 rounded-full">
          {isSaving ? (
            <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /><Typography variant="caption" className="text-primary font-medium">Kaydediliyor...</Typography></>
          ) : (
            <><CheckCircle2 size={16} className="text-green-500" /><Typography variant="caption" className="text-green-500 font-medium">Kaydedildi</Typography></>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('A')}
          className={`px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap ${activeTab === 'A' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted hover:text-text hover:bg-muted/5'}`}
        >
          Modül A: Açılış
        </button>
        <button 
          onClick={() => setActiveTab('C')}
          className={`px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap ${activeTab === 'C' ? 'bg-orange-500/10 text-orange-500 border-b-2 border-orange-500' : 'text-muted hover:text-text hover:bg-muted/5'}`}
        >
          Modül C: Plot Twist
        </button>
        <button 
          onClick={() => setActiveTab('D')}
          className={`px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap ${activeTab === 'D' ? 'bg-green-500/10 text-green-500 border-b-2 border-green-500' : 'text-muted hover:text-text hover:bg-muted/5'}`}
        >
          Modül D: Final
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-2xl shadow-background/5">
        {activeTab === 'A' && renderModuleA()}
        {activeTab === 'C' && renderModuleC()}
        {activeTab === 'D' && renderModuleD()}
      </div>
    </div>
  );
}
