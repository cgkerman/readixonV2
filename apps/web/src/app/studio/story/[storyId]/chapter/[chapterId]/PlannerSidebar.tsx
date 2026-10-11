import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Typography, Input } from '@readixon/ui';
import { 
  getStoryPlanner, 
  getChapterPlanner, 
  updateChapterPlanner, 
  getCharacters,
  getUniverseByStoryId,
  getUniverseCharacters,
  type StoryPlanner, 
  type ChapterPlanner,
  type Character,
  type Universe,
  ACT_STAGE_CONFIGS,
  CHARACTER_ARC_STEP_CONFIGS,
  PACING_CONFIGS,
  type ActStageConfig,
  type ArcStepConfig,
  type PacingConfig
} from '@readixon/core';
import { 
  BookOpen, 
  X, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Wand2, 
  User, 
  Compass, 
  Sparkles, 
  Target, 
  Flame, 
  ShieldAlert, 
  Heart, 
  ListTodo, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Zap,
  Info,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface PlannerSidebarProps {
  storyId: string;
  chapterId: string;
  chapterTitle?: string;
  chapterOrder?: number;
  onInsertText?: (text: string) => void;
  onOpenUniverse?: () => void;
  onClose: () => void;
}

type PlannerTab = 'beats' | 'arc' | 'scene' | 'checklist' | 'story';

export function PlannerSidebar({ 
  storyId, 
  chapterId, 
  chapterTitle,
  chapterOrder,
  onInsertText,
  onOpenUniverse,
  onClose 
}: PlannerSidebarProps) {
  const [storyPlanner, setStoryPlanner] = useState<StoryPlanner | null>(null);
  const [chapterPlanner, setChapterPlanner] = useState<ChapterPlanner | null>(null);
  const [universe, setUniverse] = useState<Universe | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlannerTab>('beats');
  
  const [newTodoText, setNewTodoText] = useState('');
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
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [storyP, chapterP, storyChars, universeObj] = await Promise.all([
          getStoryPlanner(storyId),
          getChapterPlanner(storyId, chapterId),
          getCharacters(storyId).catch(() => []),
          getUniverseByStoryId(storyId).catch(() => null),
        ]);

        if (!isMounted) return;

        setStoryPlanner(storyP);
        setUniverse(universeObj);

        if (chapterP) {
          setChapterPlanner(chapterP);
        } else {
          setChapterPlanner({
            storyId,
            chapterId,
            updatedAt: {} as any,
            moduleB: {
              todoList: [],
            },
          });
        }

        let allChars = [...(storyChars || [])];
        if (universeObj) {
          try {
            const uniChars = await getUniverseCharacters(universeObj.universeId);
            const charMap = new Map<string, Character>();
            for (const c of allChars) charMap.set(c.id, c);
            for (const c of uniChars) {
              if (!charMap.has(c.id)) charMap.set(c.id, c);
            }
            allChars = Array.from(charMap.values());
          } catch (e) {
            console.error("Evren karakterleri yüklenemedi:", e);
          }
        }

        if (isMounted) {
          setCharacters(allChars);
        }
      } catch (err) {
        console.error("Planner veri yükleme hatası:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [storyId, chapterId]);

  const handleUpdateModuleB = (field: string, value: any) => {
    if (!chapterPlanner) return;
    
    const newData: ChapterPlanner = {
      ...chapterPlanner,
      moduleB: {
        ...(chapterPlanner.moduleB || {}),
        [field]: value
      }
    };
    
    setChapterPlanner(newData);

    // Autosave Debounce (1.2s)
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
    }, 1200);
  };

  // Aktif Seçili Olay Örgüsü (3-Act Beat) Bilgisi
  const currentActStage = useMemo(() => {
    const stageId = chapterPlanner?.moduleB?.actStage;
    if (!stageId) return null;
    return ACT_STAGE_CONFIGS.find((s) => s.id === stageId) || null;
  }, [chapterPlanner?.moduleB?.actStage]);

  // Aktif Seçili Karakter ve Ark Bilgisi
  const focusedCharacter = useMemo(() => {
    const charId = chapterPlanner?.moduleB?.focusedCharacterId;
    if (!charId) return null;
    return characters.find((c) => c.id === charId) || null;
  }, [characters, chapterPlanner?.moduleB?.focusedCharacterId]);

  const currentArcStep = useMemo(() => {
    const stepId = chapterPlanner?.moduleB?.characterArcStep;
    if (!stepId) return null;
    return CHARACTER_ARC_STEP_CONFIGS.find((s) => s.id === stepId) || null;
  }, [chapterPlanner?.moduleB?.characterArcStep]);

  // Aktif Ritim Bilgisi
  const currentPacing = useMemo(() => {
    const pacingId = chapterPlanner?.moduleB?.pacing;
    if (!pacingId) return null;
    return PACING_CONFIGS.find((p) => p.id === pacingId) || null;
  }, [chapterPlanner?.moduleB?.pacing]);

  // To-Do Checklist Yönetimi
  const currentTodoList = chapterPlanner?.moduleB?.todoList || [];
  const completedTodoCount = currentTodoList.filter((t) => t.isCompleted).length;

  const handleToggleTodo = (todoId: string) => {
    const updated = currentTodoList.map((t) =>
      t.id === todoId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    handleUpdateModuleB('todoList', updated);
  };

  const handleDeleteTodo = (todoId: string) => {
    const updated = currentTodoList.filter((t) => t.id !== todoId);
    handleUpdateModuleB('todoList', updated);
  };

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    const newItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newTodoText.trim(),
      isCompleted: false,
    };
    const updated = [...currentTodoList, newItem];
    handleUpdateModuleB('todoList', updated);
    setNewTodoText('');
  };

  const handleLoadTemplateChecklist = () => {
    const templates = [
      'Sahne başı atmosfer ve duyusal detayları kur',
      'Karakterin anlık arzusunu ve zaafını hissettir',
      'Beklenmedik bir engel veya mikro çatışma yarat',
      'Bölüm zirvesinde dramatik veya fiziksel kırılma yaşat',
      'Sonraki bölüme merak uyandıran bir kanca (cliffhanger) bırak',
    ];

    const newItems = templates.map((text, idx) => ({
      id: `tpl_${Date.now()}_${idx}`,
      text,
      isCompleted: false,
    }));

    handleUpdateModuleB('todoList', [...currentTodoList, ...newItems]);
    toast.success('5 maddelik temel kurgu şablonu eklendi.');
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
        className="w-full sm:w-[480px] md:w-[520px] h-full bg-card border-l border-border/60 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border/50 flex flex-col gap-2.5 bg-muted/10 sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Wand2 size={16} />
              </div>
              <div className="min-w-0">
                <Typography variant="body" className="font-extrabold text-sm text-foreground truncate block">
                  Kurgu Sihirbazı & Planlayıcı
                </Typography>
                <span className="text-[10px] text-muted truncate block">
                  {chapterTitle ? `Bölüm: ${chapterTitle}` : 'Bölüm Kurgu & Ritim Rehberi'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isSaving ? (
                <span className="text-[11px] text-muted flex items-center gap-1 font-medium bg-background/60 px-2 py-0.5 rounded-md border border-border/40">
                  <Loader2 className="animate-spin text-primary" size={12} /> Kaydediliyor...
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Kaydedildi
                </span>
              )}

              {onOpenUniverse && (
                <button
                  type="button"
                  onClick={onOpenUniverse}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 flex items-center gap-1 transition-colors"
                  title="Evren Paneline Geç"
                >
                  <Layers size={13} />
                  <span className="hidden sm:inline">Evren</span>
                </button>
              )}

              <button 
                type="button"
                onClick={onClose} 
                className="text-muted hover:text-foreground transition-colors p-1.5 bg-background/80 hover:bg-muted/30 rounded-full cursor-pointer"
                title="Kapat (Esc)"
                aria-label="Kapat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="flex gap-1 bg-background p-1 rounded-xl border border-border/50 overflow-x-auto scrollbar-none">
            <button 
              type="button"
              onClick={() => setActiveTab('beats')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'beats' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <Compass size={13} /> 3 Perdeli Ritim
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('arc')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'arc' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <User size={13} /> Karakter Arkı
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('scene')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'scene' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <Target size={13} /> Sahne Çatışması
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'checklist' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <ListTodo size={13} /> Kontrol ({completedTodoCount}/{currentTodoList.length})
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('story')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'story' ? 'bg-primary/15 text-primary shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            >
              <BookOpen size={13} /> Genel Plan
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-card space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted gap-3">
              <Loader2 className="animate-spin text-primary" size={28} />
              <Typography variant="body" className="text-sm">Plan notları yükleniyor...</Typography>
            </div>
          ) : activeTab === 'beats' ? (
            /* ── 1. SEKME: 3 PERDELİ RİTİM (STORY BEATS) ── */
            <div className="space-y-4 animate-in fade-in duration-200 pb-16">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Compass size={15} className="text-indigo-400" />
                    3 Perdeli Yapı & Save the Cat Ritimleri
                  </span>
                  {currentActStage && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      {currentActStage.actLabel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Bu bölümün hikâyedeki yapısal konumunu seçin. Seçtiğiniz aşamaya göre kurgusal hedefler ve yazarlık ipuçları dinamik olarak sunulur.
                </p>
              </div>

              {/* Ritim / Aşama Seçici */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Bölümün Kurgusal Aşaması (Beat)
                </label>
                <select
                  value={chapterPlanner?.moduleB?.actStage || ''}
                  onChange={(e) => handleUpdateModuleB('actStage', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Aşama Seçin (Örn: Dönüm Noktası, Kriz, Tetikleyici Olay)...</option>
                  <optgroup label="1. Perde: Statüko & Maceraya Çağrı">
                    {ACT_STAGE_CONFIGS.filter(s => s.act === 1).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="2. Perde (A): Yeni Dünya & Vaatler">
                    {ACT_STAGE_CONFIGS.filter(s => s.id.startsWith('act2a')).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="2. Perde (B): Kriz & Düşman Baskısı">
                    {ACT_STAGE_CONFIGS.filter(s => s.id.startsWith('act2b')).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="3. Perde: Çözüm, Doruk & Yeni Denge">
                    {ACT_STAGE_CONFIGS.filter(s => s.act === 3).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Aktif Aşama Kurgu Rehberi Kartı */}
              {currentActStage && (
                <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/25 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      {currentActStage.name}
                    </span>
                    {onInsertText && (
                      <button
                        type="button"
                        onClick={() => onInsertText(`[Kurgu Hedefi: ${currentActStage.name}] ${currentActStage.description}`)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        title="Bölüme kurgu notu olarak ekle"
                      >
                        <Plus size={11} /> Metne Ekle
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground/90 leading-relaxed">
                    {currentActStage.description}
                  </p>
                  <div className="p-2.5 rounded-xl bg-background/80 border border-border/40 text-[11px] text-amber-300 space-y-1">
                    <strong className="block text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                      <Lightbulb size={12} /> Yazar İpucu:
                    </strong>
                    <p className="leading-relaxed text-foreground/80">{currentActStage.tip}</p>
                  </div>
                </div>
              )}

              {/* Ritim / Tempo (Pacing) Seçici */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-xs font-bold text-foreground block">
                  Bölümün Temposu (Pacing)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PACING_CONFIGS.map((p) => {
                    const isSelected = chapterPlanner?.moduleB?.pacing === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleUpdateModuleB('pacing', isSelected ? '' : p.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-xs'
                            : 'bg-background border-border/50 hover:border-border text-muted hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground">{p.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/15 text-muted'
                          }`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Önemli Sahne Detayları */}
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <label className="text-xs font-bold text-foreground block">
                  Genel Bölüm Notu & Önemli Detaylar
                </label>
                <textarea
                  value={chapterPlanner?.moduleB?.importantDetails || ''}
                  onChange={(e) => handleUpdateModuleB('importantDetails', e.target.value)}
                  rows={3}
                  placeholder="Bu sahnede unutulmaması gereken kritik detaylar, ipuçları veya hissettirilmek istenen tema..."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ) : activeTab === 'arc' ? (
            /* ── 2. SEKME: KARAKTER ARKI (CHARACTER ARC TRACKER) ── */
            <div className="space-y-4 animate-in fade-in duration-200 pb-16">
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User size={15} className="text-primary" />
                    Karakter Psikolojisi & Dönüşüm Cetveli
                  </span>
                  {focusedCharacter && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary">
                      {focusedCharacter.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Bu bölümün merkezindeki karakteri seçin; içsel zaafını, inanç kırılmasını ve bölüm başı/sonu duygusal makasını takip edin.
                </p>
              </div>

              {/* Odak Karakter Seçici */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Bu Bölümün Odak Karakteri
                </label>
                <select
                  value={chapterPlanner?.moduleB?.focusedCharacterId || ''}
                  onChange={(e) => {
                    const selected = characters.find(c => c.id === e.target.value);
                    handleUpdateModuleB('focusedCharacterId', e.target.value);
                    if (selected) {
                      handleUpdateModuleB('focusedCharacterName', selected.name);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Karakter Seçin...</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role === 'protagonist' ? 'Ana Karakter' : c.role === 'antagonist' ? 'Karşıt Karakter' : 'Yan Karakter'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seçilen Karakterin Kurgusal Bilgi Kartı */}
              {focusedCharacter && (
                <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    {focusedCharacter.avatarUrl ? (
                      <img src={focusedCharacter.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-border/50" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {focusedCharacter.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate">{focusedCharacter.name}</span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                          {focusedCharacter.role === 'protagonist' ? 'Başrol' : focusedCharacter.role === 'antagonist' ? 'Karşıt' : 'Destek'}
                        </span>
                      </div>
                      {focusedCharacter.occupation && (
                        <span className="text-[10px] text-muted truncate block">{focusedCharacter.occupation}</span>
                      )}
                    </div>
                  </div>

                  {focusedCharacter.characterArc?.flawOrLack && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-0.5">
                      <strong className="block text-[10px] uppercase font-bold text-amber-400">
                        ⚠️ Tanımlı Karakter Zaafı / Eksikliği:
                      </strong>
                      <p className="leading-relaxed">{focusedCharacter.characterArc.flawOrLack}</p>
                    </div>
                  )}

                  {focusedCharacter.coreMotivation && (
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] space-y-0.5">
                      <strong className="block text-[10px] uppercase font-bold text-blue-400">
                        🎯 Temel Motivasyon & İstek:
                      </strong>
                      <p className="leading-relaxed">{focusedCharacter.coreMotivation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Karakter Arkı Aşaması */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-foreground block">
                  Karakter Arkı Aşaması (Arc Stage)
                </label>
                <select
                  value={chapterPlanner?.moduleB?.characterArcStep || ''}
                  onChange={(e) => handleUpdateModuleB('characterArcStep', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Ark Aşaması Seçin...</option>
                  {CHARACTER_ARC_STEP_CONFIGS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {currentArcStep && (
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/25 space-y-1 text-[11px]">
                  <strong className="block font-bold text-purple-300">{currentArcStep.name}</strong>
                  <p className="text-foreground/90 leading-relaxed">{currentArcStep.description}</p>
                  <span className="text-[10px] text-purple-400 font-semibold block pt-0.5">
                    💡 İpucu: {currentArcStep.tip}
                  </span>
                </div>
              )}

              {/* Duygusal Makas (İçsel Durum Değişimi) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground block">
                    Bölüm Başı Ruh Hali & İnanç
                  </label>
                  <textarea
                    value={chapterPlanner?.moduleB?.internalStateStart || ''}
                    onChange={(e) => handleUpdateModuleB('internalStateStart', e.target.value)}
                    rows={2}
                    placeholder="Örn: Güvensiz, yalnız savaşabileceğine inanıyor..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground block">
                    Bölüm Sonu Ruh Hali & Karar
                  </label>
                  <textarea
                    value={chapterPlanner?.moduleB?.internalStateEnd || ''}
                    onChange={(e) => handleUpdateModuleB('internalStateEnd', e.target.value)}
                    rows={2}
                    placeholder="Örn: Müttefikinin fedakarlığı sonrası şüpheye düştü..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Zaaf Sınaması Notu */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-foreground block">
                  Zaaf Nasıl Test Edildi? (Sahne Kanıtı)
                </label>
                <textarea
                  value={chapterPlanner?.moduleB?.characterFlawNotes || ''}
                  onChange={(e) => handleUpdateModuleB('characterFlawNotes', e.target.value)}
                  rows={2}
                  placeholder="Karakter eski kusuruna yenik mi düştü yoksa ilk kez onu aşmak için bir adım mı attı?"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ) : activeTab === 'scene' ? (
            /* ── 3. SEKME: SAHNE ÇATIŞMASI (SCENE MICRO-STRUCTURE) ── */
            <div className="space-y-4 animate-in fade-in duration-200 pb-16">
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                <Typography variant="body" className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Target size={14} className="text-primary" />
                  Mikro Sahne Dinamiği (Hedef, Engel, Zirve & Kanca)
                </Typography>
                <p className="text-[11px] text-muted leading-relaxed">
                  Her güçlü sahne bir mikro-hikâyedir. Karakterin anlık arzusu, karşılaştığı somut engel, doruk noktası ve sonraki bölüme bağlayan kancayı planlayın.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      1. Sahne Hedefi (Karakter Ne İstiyor?)
                    </label>
                    {onInsertText && chapterPlanner?.moduleB?.sceneGoal && (
                      <button
                        type="button"
                        onClick={() => onInsertText(`[Sahne Hedefi] ${chapterPlanner?.moduleB?.sceneGoal}`)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Plus size={11} /> Metne Ekle
                      </button>
                    )}
                  </div>
                  <Input 
                    placeholder="Örn: Şifreli günlüğü kasadan kimse görmeden almak..." 
                    value={chapterPlanner?.moduleB?.sceneGoal || ''}
                    onChangeText={(v) => handleUpdateModuleB('sceneGoal', v)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      2. Çatışma & Engel (Önüne Ne Çıkıyor?)
                    </label>
                    {onInsertText && chapterPlanner?.moduleB?.mainConflict && (
                      <button
                        type="button"
                        onClick={() => onInsertText(`[Çatışma] ${chapterPlanner?.moduleB?.mainConflict}`)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Plus size={11} /> Metne Ekle
                      </button>
                    )}
                  </div>
                  <Input 
                    placeholder="Örn: Muhafız erken döndü veya şifre değiştirilmişti..." 
                    value={chapterPlanner?.moduleB?.mainConflict || ''}
                    onChangeText={(v) => handleUpdateModuleB('mainConflict', v)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    3. Yükselen Eylem (Gerilim Nasıl Tırmanıyor?)
                  </label>
                  <Input 
                    placeholder="Örn: Ayak sesleri yaklaşıyor, zaman daralıyor..." 
                    value={chapterPlanner?.moduleB?.risingAction || ''}
                    onChangeText={(v) => handleUpdateModuleB('risingAction', v)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      4. Bölüm Zirvesi (Climax / Kırılma Anı)
                    </label>
                    {onInsertText && chapterPlanner?.moduleB?.chapterClimax && (
                      <button
                        type="button"
                        onClick={() => onInsertText(`[Bölüm Zirvesi] ${chapterPlanner?.moduleB?.chapterClimax}`)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Plus size={11} /> Metne Ekle
                      </button>
                    )}
                  </div>
                  <Input 
                    placeholder="Örn: Günlüğü kaptı ama pencereden atlarken yakalandı!" 
                    value={chapterPlanner?.moduleB?.chapterClimax || ''}
                    onChangeText={(v) => handleUpdateModuleB('chapterClimax', v)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    5. Düşen Eylem / Hasar Tespiti
                  </label>
                  <Input 
                    placeholder="Örn: Yaralı kurtuldu ama günlüğün son sayfası yırtıktı..." 
                    value={chapterPlanner?.moduleB?.fallingAction || ''}
                    onChangeText={(v) => handleUpdateModuleB('fallingAction', v)}
                  />
                </div>

                <div className="space-y-1 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1 text-amber-400">
                      <Flame size={13} /> 6. Sonraki Bölüme Kanca (Cliffhanger / Hook)
                    </label>
                    {onInsertText && chapterPlanner?.moduleB?.hookForNext && (
                      <button
                        type="button"
                        onClick={() => onInsertText(`[Bölüm Sonu Kancası] ${chapterPlanner?.moduleB?.hookForNext}`)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Plus size={11} /> Metne Ekle
                      </button>
                    )}
                  </div>
                  <textarea 
                    rows={2}
                    placeholder="Okuyucunun bir sonraki bölüme hemen geçmesini sağlayacak merak unsuru, ani kapı çalınması veya şok edici keşif..." 
                    value={chapterPlanner?.moduleB?.hookForNext || ''}
                    onChange={(e) => handleUpdateModuleB('hookForNext', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-amber-500/30 text-xs text-foreground focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'checklist' ? (
            /* ── 4. SEKME: KURGU KONTROL LİSTESİ (CHECKLIST) ── */
            <div className="space-y-4 animate-in fade-in duration-200 pb-16">
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-2">
                <div>
                  <Typography variant="body" className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <ListTodo size={14} className="text-primary" />
                    Bölüm Kurgu Kontrol Listesi
                  </Typography>
                  <p className="text-[11px] text-muted mt-0.5">
                    {completedTodoCount} / {currentTodoList.length} Görev Tamamlandı
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadTemplateChecklist}
                  className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 text-xs font-bold transition-colors shrink-0"
                >
                  Hazır Şablon Ekle
                </button>
              </div>

              {/* Yeni Madde Ekleme Formu */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                  placeholder="Yeni kurgu maddesi yazın (Enter)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim()}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Ekle
                </button>
              </div>

              {/* Maddeler Listesi */}
              {currentTodoList.length === 0 ? (
                <div className="p-8 text-center bg-muted/5 rounded-2xl border border-dashed border-border/50 space-y-2">
                  <ListTodo size={24} className="mx-auto text-muted/60" />
                  <p className="text-xs text-muted">Bu bölüme ait kontrol maddesi bulunmuyor.</p>
                  <button
                    type="button"
                    onClick={handleLoadTemplateChecklist}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    5 Temel Kurgu Maddesi Yükle →
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {currentTodoList.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        item.isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-muted line-through'
                          : 'bg-background border-border/50 text-foreground'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleTodo(item.id)}
                        className="flex items-center gap-2.5 flex-1 cursor-pointer select-none min-w-0"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          item.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border/70 bg-background'
                        }`}>
                          {item.isCompleted && <Check size={11} className="stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium leading-relaxed truncate">{item.text}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(item.id)}
                        className="text-muted hover:text-rose-400 p-1 rounded-md transition-colors shrink-0"
                        title="Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── 5. SEKME: GENEL HİKAYE PLANI (MODÜL A, C, D) ── */
            <div className="animate-in fade-in duration-200 pb-16 space-y-4">
              {!storyPlanner?.moduleA && !storyPlanner?.moduleC && !storyPlanner?.moduleD ? (
                <div className="text-center py-12 px-4 opacity-70 space-y-2">
                  <BookOpen size={36} className="mx-auto text-primary/70" />
                  <Typography variant="body" className="font-semibold text-foreground text-sm">
                    Henüz genel hikâye planı oluşturulmamış.
                  </Typography>
                  <Typography variant="caption" className="block text-muted text-xs">
                    Hikâye stüdyosundaki Kurgu Rehberi üzerinden Modül A, C ve D planlamasını yapabilirsiniz.
                  </Typography>
                </div>
              ) : (
                <>
                  {renderReadOnlySection('Modül A: Açılış & Kanca', storyPlanner?.moduleA)}
                  {renderReadOnlySection('Modül C: Plot Twist & Beklenmedik Gelişmeler', storyPlanner?.moduleC)}
                  {renderReadOnlySection('Modül D: Büyük Final', storyPlanner?.moduleD)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
