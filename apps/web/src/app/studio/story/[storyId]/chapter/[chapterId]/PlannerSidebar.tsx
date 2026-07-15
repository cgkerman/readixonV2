import React, { useEffect, useState, useRef } from 'react';
import { Typography, Input } from '@readixon/ui';
import { getStoryPlanner, getChapterPlanner, updateChapterPlanner, type StoryPlanner, type ChapterPlanner } from '@readixon/core';
import { Wand2, X, Loader2, BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlannerSidebarProps {
  storyId: string;
  chapterId: string;
  onClose: () => void;
}

export function PlannerSidebar({ storyId, chapterId, onClose }: PlannerSidebarProps) {
  const [storyPlanner, setStoryPlanner] = useState<StoryPlanner | null>(null);
  const [chapterPlanner, setChapterPlanner] = useState<ChapterPlanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapter' | 'story'>('chapter');
  
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadPlanners = async () => {
      const [storyP, chapterP] = await Promise.all([
        getStoryPlanner(storyId),
        getChapterPlanner(storyId, chapterId)
      ]);
      setStoryPlanner(storyP);
      
      if (chapterP) {
        setChapterPlanner(chapterP);
      } else {
        setChapterPlanner({
          storyId,
          chapterId,
          updatedAt: {} as any,
          moduleB: {}
        });
      }
      setLoading(false);
    };
    loadPlanners();
  }, [storyId, chapterId]);

  const handleUpdateModuleB = (field: string, value: string) => {
    if (!chapterPlanner) return;
    
    const newData = {
      ...chapterPlanner,
      moduleB: {
        ...(chapterPlanner.moduleB || {}),
        [field]: value
      }
    };
    
    setChapterPlanner(newData);

    // Autosave Debounce (1.5s)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateChapterPlanner(storyId, chapterId, { moduleB: newData.moduleB });
        setIsSaving(false);
      } catch (err) {
        toast.error("Kaydedilirken hata oluştu. Yetkileri kontrol edin.");
        setIsSaving(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="w-80 md:w-96 h-full bg-card border-l border-border/50 flex flex-col items-center justify-center text-muted">
        <Loader2 className="animate-spin mb-4" size={32} />
        <Typography variant="body">Sihirbaz Yükleniyor...</Typography>
      </div>
    );
  }

  const renderReadOnlySection = (title: string, data: Record<string, any> | undefined) => {
    if (!data || Object.keys(data).length === 0) return null;
    return (
      <div className="mb-6 space-y-4">
        <Typography variant="h3" className="font-bold border-b border-border/50 pb-2 mb-3 text-primary">{title}</Typography>
        {Object.entries(data).map(([key, value]) => {
          if (!value || typeof value !== 'string') return null;
          return (
            <div key={key} className="bg-background rounded-xl p-3 border border-border/50 shadow-sm">
              <Typography variant="caption" className="text-muted uppercase font-bold text-[10px] tracking-wider mb-1 block">
                {key}
              </Typography>
              <Typography variant="body" className="text-sm">
                {value}
              </Typography>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-80 md:w-96 h-full bg-card border-l border-border/50 flex flex-col shadow-2xl relative animate-in slide-in-from-right-10 duration-300">
      
      <div className="p-4 border-b border-border/50 flex flex-col gap-3 bg-muted/5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Typography variant="body" className="font-bold flex items-center gap-2 text-primary">
            <Wand2 size={18} /> Kurgu Sihirbazı
          </Typography>
          <div className="flex items-center gap-2">
             {isSaving ? (
              <Loader2 className="animate-spin text-primary" size={14} />
            ) : (
              <CheckCircle2 size={14} className="text-green-500" />
            )}
            <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1 bg-background rounded-full ml-2">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-1 bg-background p-1 rounded-xl border border-border/50">
          <button 
            onClick={() => setActiveTab('chapter')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'chapter' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
          >
            <FileText size={14} /> Bölüm Kurgusu
          </button>
          <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'story' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
          >
            <BookOpen size={14} /> Genel Hikaye Planı
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-muted/5">
        
        {activeTab === 'chapter' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 pb-20">
            <Typography variant="body" className="text-muted text-sm mb-4">
              Bu bölüme özel çatışmaları ve gidişatı buradan planlayın. Değişiklikler otomatik kaydedilir.
            </Typography>

            <Input 
              label="Ana Çatışma (Kiminle/Neyle?)" 
              placeholder="Örn: Karakterin ormanda kurtlarla mücadelesi..." 
              value={chapterPlanner?.moduleB?.mainConflict || ''}
              onChangeText={(v) => handleUpdateModuleB('mainConflict', v)}
            />
            <Input 
              label="Yükselen Eylem" 
              placeholder="Gerilim nasıl artıyor?" 
              value={chapterPlanner?.moduleB?.risingAction || ''}
              onChangeText={(v) => handleUpdateModuleB('risingAction', v)}
            />
            <Input 
              label="Bölüm Zirvesi (Climax)" 
              placeholder="Bölümdeki en yüksek kırılma anı nedir?" 
              value={chapterPlanner?.moduleB?.chapterClimax || ''}
              onChangeText={(v) => handleUpdateModuleB('chapterClimax', v)}
            />
            <Input 
              label="Düşen Eylem / Sonuç" 
              placeholder="Zirveden sonraki rahatlama veya hasar tespiti?" 
              value={chapterPlanner?.moduleB?.fallingAction || ''}
              onChangeText={(v) => handleUpdateModuleB('fallingAction', v)}
            />
            <Input 
              label="Sonraki Bölüme Kanca (Hook)" 
              placeholder="Okuyucuyu sıradaki bölüme nasıl bağlayacaksınız?" 
              value={chapterPlanner?.moduleB?.hookForNext || ''}
              onChangeText={(v) => handleUpdateModuleB('hookForNext', v)}
            />
          </div>
        )}

        {activeTab === 'story' && (
          <div className="animate-in fade-in zoom-in-95 duration-200 pb-20">
            {!storyPlanner?.moduleA && !storyPlanner?.moduleC && !storyPlanner?.moduleD ? (
              <div className="text-center py-10 opacity-60">
                <Wand2 size={40} className="mx-auto mb-4 text-primary" />
                <Typography variant="body">Henüz genel hikaye planı oluşturulmamış.</Typography>
                <Typography variant="caption" className="block mt-2">Kurgu Sihirbazı menüsünden planlayabilirsiniz.</Typography>
              </div>
            ) : (
              <>
                {renderReadOnlySection('Modül A: Açılış', storyPlanner?.moduleA)}
                {renderReadOnlySection('Modül C: Plot Twist', storyPlanner?.moduleC)}
                {renderReadOnlySection('Modül D: Final', storyPlanner?.moduleD)}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
