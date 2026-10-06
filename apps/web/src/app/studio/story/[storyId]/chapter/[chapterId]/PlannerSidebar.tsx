import React, { useEffect, useState, useRef } from 'react';
import { Typography, Input } from '@readixon/ui';
import { getStoryPlanner, getChapterPlanner, updateChapterPlanner, type StoryPlanner, type ChapterPlanner } from '@readixon/core';
import { BookOpen, X, Loader2, FileText, CheckCircle2 } from 'lucide-react';
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const renderReadOnlySection = (title: string, data: Record<string, any> | undefined) => {
    if (!data || Object.keys(data).length === 0) return null;
    return (
      <div className="mb-6 space-y-3">
        <Typography variant="h4" className="font-bold border-b border-border/50 pb-2 mb-3 text-primary text-sm">
          {title}
        </Typography>
        {Object.entries(data).map(([key, value]) => {
          if (!value || typeof value !== 'string') return null;
          return (
            <div key={key} className="bg-background rounded-xl p-3 border border-border/50 shadow-xs">
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
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-[440px] md:w-[480px] h-full bg-card border-l border-border/60 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex flex-col gap-3 bg-muted/10 sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <Typography variant="body" className="font-bold flex items-center gap-2 text-primary">
              <BookOpen size={18} /> Plan Notlarım & Kurgu
            </Typography>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <span className="text-xs text-muted flex items-center gap-1 font-medium">
                  <Loader2 className="animate-spin text-primary" size={13} /> Kaydediliyor...
                </span>
              ) : (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} /> Kaydedildi
                </span>
              )}
              <button 
                type="button"
                onClick={onClose} 
                className="text-muted hover:text-foreground transition-colors p-1.5 bg-background/80 hover:bg-muted/30 rounded-full ml-1 cursor-pointer"
                title="Kapat (Esc)"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="flex gap-1 bg-background p-1 rounded-xl border border-border/50">
            <button 
              type="button"
              onClick={() => setActiveTab('chapter')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chapter' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <FileText size={14} /> Bölüm Kurgusu
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('story')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'story' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <BookOpen size={14} /> Genel Hikaye Planı
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-card">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted gap-3">
              <Loader2 className="animate-spin text-primary" size={28} />
              <Typography variant="body" className="text-sm">Plan notları yükleniyor...</Typography>
            </div>
          ) : activeTab === 'chapter' ? (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-20">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                <Typography variant="body" className="text-muted text-xs leading-relaxed">
                  💡 Bu bölüme özel çatışmaları, gerilimi ve kancayı buradan planlayabilirsiniz. Yazdıklarınız otomatik olarak kaydedilir.
                </Typography>
              </div>

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
          ) : (
            <div className="animate-in fade-in duration-200 pb-20">
              {!storyPlanner?.moduleA && !storyPlanner?.moduleC && !storyPlanner?.moduleD ? (
                <div className="text-center py-12 px-4 opacity-70">
                  <BookOpen size={40} className="mx-auto mb-3 text-primary/70" />
                  <Typography variant="body" className="font-semibold text-foreground">Henüz genel hikaye planı oluşturulmamış.</Typography>
                  <Typography variant="caption" className="block mt-1 text-muted text-xs">
                    Hikaye ana sayfasındaki Kurgu Rehberi üzerinden planlama yapabilirsiniz.
                  </Typography>
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
    </div>
  );
}
