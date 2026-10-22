'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  type LucideIcon,
  BookOpen, 
  Users, 
  Share2, 
  Dna, 
  Skull, 
  MapPin, 
  Map as MapIcon, 
  Building2, 
  Sword, 
  Zap, 
  Landmark, 
  Palette, 
  Music, 
  Scale, 
  HelpCircle, 
  Clock, 
  BookA, 
  Scroll, 
  Search,
  Sparkles,
  LayoutGrid,
  X
} from 'lucide-react';

export type ActiveUniverseTab = 
  | 'overview' 
  | 'characters' 
  | 'relationships' 
  | 'races'
  | 'creatures'
  | 'locations' 
  | 'maps' 
  | 'organizations' 
  | 'items' 
  | 'powers' 
  | 'mystic_arts'
  | 'cultures'
  | 'media'
  | 'soundtracks'
  | 'canon_rules'
  | 'plot_threads'
  | 'timeline' 
  | 'glossary' 
  | 'lore'
  | 'members';

export interface UniverseTabCounts {
  overview?: number;
  characters?: number;
  relationships?: number;
  races?: number;
  creatures?: number;
  locations?: number;
  maps?: number;
  organizations?: number;
  items?: number;
  powers?: number;
  mystic_arts?: number;
  cultures?: number;
  media?: number;
  soundtracks?: number;
  canon_rules?: number;
  plot_threads?: number;
  timeline?: number;
  glossary?: number;
  lore?: number;
  members?: number;
}

interface UniverseNavigationTabsProps {
  activeTab: ActiveUniverseTab;
  onSelectTab: (tab: ActiveUniverseTab) => void;
  counts: UniverseTabCounts;
  onOpenCodex?: () => void;
}

export type TabCategory = 'core' | 'entities' | 'world' | 'narrative' | 'media';

interface TabDefinition {
  id: ActiveUniverseTab;
  label: string;
  icon: LucideIcon;
  category: TabCategory;
  description: string;
}

export const ALL_TABS: TabDefinition[] = [
  // 🏛️ Temel & Eserler (3)
  { id: 'overview', label: 'Genel & Eserler', icon: BookOpen, category: 'core', description: 'Evren özeti ve bağlı hikayeler' },
  { id: 'canon_rules', label: 'Seri Bible & Canon', icon: Scale, category: 'core', description: 'Değiştirilemez temel kanunlar' },
  { id: 'members', label: 'Ekip & İzinler', icon: Users, category: 'core', description: 'Ortak yazarlar ve yetkiler' },

  // 👤 Karakter & Varlıklar (4)
  { id: 'characters', label: 'Karakterler', icon: Users, category: 'entities', description: 'Karakter arkları ve profiller' },
  { id: 'relationships', label: 'İlişki Ağı', icon: Share2, category: 'entities', description: 'Dostluk, düşmanlık ve bağlar grafiği' },
  { id: 'races', label: 'Irklar & Türler', icon: Dna, category: 'entities', description: 'Halklar, biyolojiler ve kökenler' },
  { id: 'creatures', label: 'Yaratıklar & Canavarlar', icon: Skull, category: 'entities', description: 'Fauna, canavarlar ve tehlike sınıfları' },

  // 🗺️ Dünya & Mekânlar (5)
  { id: 'locations', label: 'Mekânlar', icon: MapPin, category: 'world', description: 'Şehirler, kaleler ve diyarlar' },
  { id: 'maps', label: 'Dünya Haritası', icon: MapIcon, category: 'world', description: 'Etkileşimli harita ve pinler' },
  { id: 'organizations', label: 'Organizasyonlar', icon: Building2, category: 'world', description: 'Loncalar, tarikatlar ve fraksiyonlar' },
  { id: 'items', label: 'Eşyalar & Yadigârlar', icon: Sword, category: 'world', description: 'Efsanevi silahlar ve kadim nesneler' },
  { id: 'cultures', label: 'Kültür & İnanç', icon: Landmark, category: 'world', description: 'Gelenekler, dinler ve tabular' },

  // 📜 Kurallar & Hikaye (6)
  { id: 'powers', label: 'Güç Sistemleri', icon: Zap, category: 'narrative', description: 'Büyü okulları ve bedel kuralları' },
  { id: 'mystic_arts', label: 'Mistik Sanatlar', icon: Sparkles, category: 'narrative', description: 'Fal, kehanet, büyü kitabı ve ritüeller' },
  { id: 'timeline', label: 'Zaman Çizelgesi', icon: Clock, category: 'narrative', description: 'Çağlar, savaşlar ve kronoloji' },
  { id: 'plot_threads', label: 'Açık Düğümler & Gizemler', icon: HelpCircle, category: 'narrative', description: 'Sırlar ve çözülecek gizemler' },
  { id: 'glossary', label: 'Sözlük & Terimler', icon: BookA, category: 'narrative', description: 'Kurgusal kavramlar ve diller' },
  { id: 'lore', label: 'Lore & Kurallar', icon: Scroll, category: 'narrative', description: 'Derin dünya bilgisi ve tarih' },

  // 🎨 Sanat & Medya (2)
  { id: 'media', label: 'Sanat & Moodboard', icon: Palette, category: 'media', description: 'Görsel referanslar ve konsept çizimler' },
  { id: 'soundtracks', label: 'Müzik & Ambiyans', icon: Music, category: 'media', description: 'Atmosfer parçaları ve temalar' },
];

const CATEGORIES: { id: TabCategory; label: string; icon: string }[] = [
  { id: 'core', label: 'Temel & Kanon', icon: '🏛️' },
  { id: 'entities', label: 'Karakter & Varlıklar', icon: '👤' },
  { id: 'world', label: 'Dünya & Mekân', icon: '🗺️' },
  { id: 'narrative', label: 'Kurgu & Kurallar', icon: '📜' },
  { id: 'media', label: 'Sanat & Medya', icon: '🎨' },
];

export function UniverseNavigationTabs({
  activeTab,
  onSelectTab,
  counts,
  onOpenCodex
}: UniverseNavigationTabsProps) {
  // Aktif sekmenin ait olduğu kategoriyi bul
  const activeTabDefinition = useMemo(() => {
    return ALL_TABS.find((t) => t.id === activeTab);
  }, [activeTab]);

  const [selectedCategory, setSelectedCategory] = useState<TabCategory>(
    activeTabDefinition ? activeTabDefinition.category : 'core'
  );
  const [onlyFilled, setOnlyFilled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);

  // activeTab dışarıdan değiştiğinde kategori senkronizasyonu
  useEffect(() => {
    const item = ALL_TABS.find((t) => t.id === activeTab);
    if (item && item.category !== selectedCategory) {
      setSelectedCategory(item.category);
    }
  }, [activeTab]);

  // Toplam dolu modül sayısı
  const totalFilledCount = useMemo(() => {
    return ALL_TABS.filter((t) => (counts[t.id] || 0) > 0).length;
  }, [counts]);

  // Kategori bazlı dolu sayıları
  const categoryFilledCounts = useMemo(() => {
    const result: Record<TabCategory, number> = {
      core: 0,
      entities: 0,
      world: 0,
      narrative: 0,
      media: 0,
    };
    ALL_TABS.forEach((t) => {
      if ((counts[t.id] || 0) > 0) {
        result[t.category] = (result[t.category] || 0) + 1;
      }
    });
    return result;
  }, [counts]);

  // Alt satırda gösterilecek sekmeler (Arama aktifse tümü içinde arar, değilse seçili kategorininkileri gösterir)
  const visibleTabs = useMemo(() => {
    // 1. Arama aktifse: Tüm modüller içinde ara
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return ALL_TABS.filter((tab) => {
        const matchesLabel = tab.label.toLowerCase().includes(q);
        const matchesDesc = tab.description.toLowerCase().includes(q);
        if (onlyFilled && (counts[tab.id] || 0) === 0) return false;
        return matchesLabel || matchesDesc;
      });
    }

    // 2. Normal mod: Seçili kategorinin sekmeleri
    return ALL_TABS.filter((tab) => {
      if (tab.category !== selectedCategory) return false;
      if (onlyFilled && (counts[tab.id] || 0) === 0 && tab.id !== activeTab) return false;
      return true;
    });
  }, [selectedCategory, searchQuery, onlyFilled, counts, activeTab]);

  // Kategori seçildiğinde
  const handleSelectCategory = (catId: TabCategory) => {
    setSelectedCategory(catId);
    setSearchQuery(''); // Kategoriye tıklanınca aramayı temizle
    // Eğer o anki aktif sekme bu kategoride değilse, bu kategorinin ilk sekmesini aç
    const catTabs = ALL_TABS.filter((t) => t.category === catId);
    if (catTabs.length > 0 && !catTabs.some((t) => t.id === activeTab)) {
      onSelectTab(catTabs[0].id);
    }
  };

  return (
    <div className="mb-6 rounded-3xl bg-card border border-border/80 shadow-sm p-3 space-y-3">
      {/* ── 1. ÜST SATIR: Ana Kategori Hapları & Sağ Araçlar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/60">
        
        {/* Sol: 5 Ana Kategori Sekmesi (Sıfır kaydırma, ferah hiyerarşi) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id && !searchQuery.trim();
            const filledCount = categoryFilledCounts[cat.id];
            const catTotal = ALL_TABS.filter(t => t.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                  isCatActive
                    ? 'bg-primary text-white border-primary shadow-xs font-bold'
                    : 'bg-muted/10 hover:bg-muted/20 border-transparent text-foreground/75 hover:text-foreground'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  isCatActive 
                    ? 'bg-white/20 text-white' 
                    : filledCount > 0 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                    : 'bg-muted/20 text-muted'
                }`}>
                  {filledCount > 0 ? filledCount : catTotal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sağ: "Dolu Olanlar" Filtresi + Hızlı Arama + Fihrist Popover */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {/* Dolu Olanlar Filtresi Toggle */}
          <button
            onClick={() => setOnlyFilled(!onlyFilled)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer border ${
              onlyFilled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'bg-muted/10 border-border/60 text-foreground/70 hover:text-foreground hover:bg-muted/20'
            }`}
            title="Yalnızca içeriği olan modülleri göster"
          >
            <Sparkles size={12} className={onlyFilled ? 'text-emerald-500' : 'text-muted'} />
            <span className="hidden sm:inline">Dolu Olanlar</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              onlyFilled ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-muted/20 text-muted'
            }`}>
              {totalFilledCount}/{ALL_TABS.length}
            </span>
          </button>

          {/* Arama Input'u */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Modül ara..."
              className="w-24 sm:w-32 focus:w-44 transition-all duration-200 bg-muted/15 hover:bg-muted/25 focus:bg-background border border-border/80 rounded-xl pl-8 pr-6 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary placeholder:text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Fihrist (Tüm Modüller Grid Modalı) Butonu */}
          <button
            onClick={() => setShowDirectoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary transition-all cursor-pointer select-none"
            title="Tüm 20 evren modülünün fihristini aç"
          >
            <LayoutGrid size={13} />
            <span className="hidden md:inline">Fihrist</span>
          </button>

          {/* Evren Defteri (Kadim Kodeks) Butonu */}
          {onOpenCodex && (
            <button
              type="button"
              onClick={onOpenCodex}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-700 dark:text-amber-300 transition-all cursor-pointer select-none"
              title="Yazdığınız evreni fantastik bir defter / kodeks gibi görüntüleyin"
            >
              <BookOpen size={13} className="text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Defter</span>
            </button>
          )}
        </div>

      </div>

      {/* ── 2. ALT SATIR: Seçili Kategorinin Modülleri (Sıfır Kaydırma, Tek Sırada Derli Toplu) ── */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5 animate-in fade-in-50 duration-150">
        {visibleTabs.length === 0 ? (
          <div className="py-2 px-3 text-xs text-muted italic flex items-center gap-2">
            <span>Arama kriterine uygun modül bulunamadı.</span>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-primary hover:underline font-bold not-italic"
              >
                Aramayı Temizle
              </button>
            )}
          </div>
        ) : (
          visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.id] ?? 0;
            const isTabActive = activeTab === tab.id;
            const hasData = count > 0;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  if (searchQuery.trim()) {
                    setSelectedCategory(tab.category);
                    setSearchQuery('');
                  }
                }}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs transition-all whitespace-nowrap border cursor-pointer ${
                  isTabActive
                    ? 'bg-primary text-white border-primary shadow-xs font-bold scale-[1.01]'
                    : hasData
                    ? 'bg-muted/15 hover:bg-card border-border/80 text-foreground hover:border-primary/50 hover:shadow-xs'
                    : 'bg-transparent hover:bg-muted/15 border-border/40 text-foreground/70 hover:text-foreground'
                }`}
                title={tab.description}
              >
                <Icon 
                  size={14} 
                  className={
                    isTabActive 
                      ? 'text-white' 
                      : hasData 
                      ? 'text-primary' 
                      : 'text-muted group-hover:text-foreground'
                  } 
                />
                
                <span className="font-semibold">{tab.label}</span>

                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isTabActive
                      ? 'bg-white/20 text-white'
                      : hasData
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted/20 text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* ── 3. FİHRİST MODALI / MEGA MENU ── */}
      {showDirectoryModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setShowDirectoryModal(false)}
        >
          <div 
            className="bg-card border border-border shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/30 shadow-xs">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">Evren Modülleri Fihristi</h3>
                  <p className="text-xs text-muted mt-0.5">Tüm kurgu araçlarına tek bir bakışla ulaşın ve doğrudan geçiş yapın.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="w-9 h-9 rounded-full bg-muted/15 hover:bg-muted/30 text-foreground hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Kategorilere Göre Gruplanmış Net Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => {
                const catTabs = ALL_TABS.filter(t => t.category === cat.id);
                const filledCatCount = catTabs.filter(t => (counts[t.id] || 0) > 0).length;

                return (
                  <div key={cat.id} className="p-4 rounded-2xl bg-background/80 border border-border space-y-2.5 shadow-2xs">
                    
                    {/* Kategori Başlığı */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2 text-xs font-black text-foreground tracking-wide uppercase">
                        <span className="text-sm">{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        filledCatCount > 0 ? 'bg-primary/15 text-primary' : 'bg-muted/15 text-muted'
                      }`}>
                        {filledCatCount}/{catTabs.length} dolu
                      </span>
                    </div>

                    {/* Modül Butonları Listesi */}
                    <div className="grid grid-cols-1 gap-1.5">
                      {catTabs.map((tab) => {
                        const Icon = tab.icon;
                        const count = counts[tab.id] ?? 0;
                        const isTabActive = activeTab === tab.id;
                        const hasData = count > 0;

                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setSelectedCategory(tab.category);
                              onSelectTab(tab.id);
                              setShowDirectoryModal(false);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all cursor-pointer border ${
                              isTabActive
                                ? 'bg-primary text-white font-bold border-primary shadow-xs'
                                : 'bg-card hover:bg-card/90 border-border/70 hover:border-primary/50 text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isTabActive ? 'bg-white/20 text-white' : hasData ? 'bg-primary/15 text-primary' : 'bg-muted/15 text-muted'
                              }`}>
                                <Icon size={13} />
                              </div>
                              <div className="min-w-0">
                                <span className={`truncate block ${isTabActive ? 'font-black text-white' : 'font-bold text-foreground'}`}>
                                  {tab.label}
                                </span>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] shrink-0 font-bold ${
                              isTabActive
                                ? 'bg-white/20 text-white'
                                : hasData
                                ? 'bg-primary/15 text-primary border border-primary/25 font-black'
                                : 'bg-muted/15 text-muted'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Alt Eylemler */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted font-medium">
                Toplam <strong className="text-foreground font-bold">{totalFilledCount}</strong> modülde kurgu verisi bulunuyor.
              </span>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
