'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Check,
  X,
  Filter
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
}

type TabCategory = 'all' | 'core' | 'entities' | 'world' | 'narrative' | 'media';

interface TabDefinition {
  id: ActiveUniverseTab;
  label: string;
  icon: LucideIcon;
  category: 'core' | 'entities' | 'world' | 'narrative' | 'media';
  description: string;
}

const ALL_TABS: TabDefinition[] = [
  // 🏛️ Temel & Eserler
  { id: 'overview', label: 'Genel & Eserler', icon: BookOpen, category: 'core', description: 'Evren özeti ve bağlı hikayeler' },
  { id: 'canon_rules', label: 'Seri Bible & Canon', icon: Scale, category: 'core', description: 'Değiştirilemez temel kanunlar' },
  { id: 'members', label: 'Ekip & İzinler', icon: Users, category: 'core', description: 'Ortak yazarlar ve yetkiler' },

  // 👤 Karakter & Varlıklar
  { id: 'characters', label: 'Karakterler', icon: Users, category: 'entities', description: 'Karakter arkları ve profiller' },
  { id: 'relationships', label: 'İlişki Ağı', icon: Share2, category: 'entities', description: 'Dostluk, düşmanlık ve bağlar grafiği' },
  { id: 'races', label: 'Irklar & Türler', icon: Dna, category: 'entities', description: 'Halklar, biyolojiler ve kökenler' },
  { id: 'creatures', label: 'Yaratıklar & Canavarlar', icon: Skull, category: 'entities', description: 'Fauna, canavarlar ve tehlike sınıfları' },

  // 🗺️ Dünya & Mekânlar
  { id: 'locations', label: 'Mekânlar', icon: MapPin, category: 'world', description: 'Şehirler, kaleler ve diyarlar' },
  { id: 'maps', label: 'Dünya Haritası', icon: MapIcon, category: 'world', description: 'Etkileşimli harita ve pinler' },
  { id: 'organizations', label: 'Organizasyonlar', icon: Building2, category: 'world', description: 'Loncalar, tarikatlar ve fraksiyonlar' },
  { id: 'items', label: 'Eşyalar & Yadigârlar', icon: Sword, category: 'world', description: 'Efsanevi silahlar ve kadim nesneler' },
  { id: 'cultures', label: 'Kültür & İnanç', icon: Landmark, category: 'world', description: 'Gelenekler, dinler ve tabular' },

  // 📜 Kurallar & Hikaye
  { id: 'powers', label: 'Güç Sistemleri', icon: Zap, category: 'narrative', description: 'Büyü okulları ve bedel kuralları' },
  { id: 'timeline', label: 'Zaman Çizelgesi', icon: Clock, category: 'narrative', description: 'Çağlar, savaşlar ve kronoloji' },
  { id: 'plot_threads', label: 'Açık Düğümler & Gizemler', icon: HelpCircle, category: 'narrative', description: 'Sırlar ve çözülecek gizemler' },
  { id: 'glossary', label: 'Sözlük & Terimler', icon: BookA, category: 'narrative', description: 'Kurgusal kavramlar ve diller' },
  { id: 'lore', label: 'Lore & Kurallar', icon: Scroll, category: 'narrative', description: 'Derin dünya bilgisi ve tarih' },

  // 🎨 Sanat & Medya
  { id: 'media', label: 'Sanat & Moodboard', icon: Palette, category: 'media', description: 'Görsel referanslar ve konsept çizimler' },
  { id: 'soundtracks', label: 'Müzik & Ambiyans', icon: Music, category: 'media', description: 'Atmosfer parçaları ve temalar' },
];

const CATEGORIES: { id: TabCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Tümü', icon: '🌟' },
  { id: 'core', label: 'Temel & Eserler', icon: '🏛️' },
  { id: 'entities', label: 'Karakterler & Irklar', icon: '👤' },
  { id: 'world', label: 'Dünya & Mekân', icon: '🗺️' },
  { id: 'narrative', label: 'Kurallar & Tarih', icon: '📜' },
  { id: 'media', label: 'Sanat & Müzik', icon: '🎨' },
];

export function UniverseNavigationTabs({
  activeTab,
  onSelectTab,
  counts
}: UniverseNavigationTabsProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');
  const [onlyFilled, setOnlyFilled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Toplam dolu modül sayısı
  const totalFilledCount = useMemo(() => {
    return ALL_TABS.filter((t) => (counts[t.id] || 0) > 0).length;
  }, [counts]);

  // Filtrelenmiş sekmeler
  const filteredTabs = useMemo(() => {
    return ALL_TABS.filter((tab) => {
      // 1. Kategori filtresi
      if (selectedCategory !== 'all' && tab.category !== selectedCategory) {
        // Eğer aktif sekme filtrenin dışındaysa yine de göster
        if (tab.id !== activeTab) return false;
      }

      // 2. Sadece dolu olanlar filtresi
      if (onlyFilled && (counts[tab.id] || 0) === 0 && tab.id !== activeTab) {
        return false;
      }

      // 3. Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLabel = tab.label.toLowerCase().includes(q);
        const matchesDesc = tab.description.toLowerCase().includes(q);
        if (!matchesLabel && !matchesDesc) return false;
      }

      return true;
    });
  }, [selectedCategory, onlyFilled, searchQuery, counts, activeTab]);

  // Kaydırma durumunu denetleme
  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [filteredTabs]);

  // Aktif sekme değiştiğinde veya sayfa açıldığında sekmeyi görünür alana ortala
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-6 space-y-2.5">
      {/* ── 1. ÜST KONTROL ÇUBUĞU (Kategori Hapları + Dolu Filtresi + Arama + Fihrist) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card/70 backdrop-blur-md p-2 rounded-2xl border border-border">
        
        {/* Sol: Kategori Hapları (Segmented Filter) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                  isCatActive
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted hover:text-text hover:bg-muted/15'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sağ: "Dolu Olanlar" Butonu + Arama + Fihrist Popover */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {/* Dolu Olanlar Filtresi Toggle */}
          <button
            onClick={() => setOnlyFilled(!onlyFilled)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer border ${
              onlyFilled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                : 'bg-muted/10 border-border text-muted hover:text-text hover:bg-muted/20'
            }`}
            title="Yalnızca içeriği olan modülleri göster"
          >
            <Sparkles size={12} className={onlyFilled ? 'text-emerald-400' : 'text-muted'} />
            <span className="hidden sm:inline">Dolu Olanlar</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              onlyFilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-muted/20 text-muted'
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
              className="w-24 sm:w-32 focus:w-44 transition-all duration-200 bg-muted/15 hover:bg-muted/25 focus:bg-background border border-border rounded-xl pl-8 pr-6 py-1.5 text-xs text-text focus:outline-none focus:border-primary placeholder:text-muted/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Fihrist (Tüm Modüller Grid Modalı) Butonu */}
          <button
            onClick={() => setShowDirectoryModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-muted/15 hover:bg-muted/25 border border-border text-text hover:text-primary transition-all cursor-pointer select-none"
            title="Tüm evren modülleri fihristini aç"
          >
            <LayoutGrid size={13} className="text-primary" />
            <span className="hidden md:inline font-bold">Fihrist</span>
          </button>
        </div>

      </div>

      {/* ── 2. ANA SEKME BAR (Yatay Kaydırılabilir & Ok Butonlu) ── */}
      <div className="relative group">
        
        {/* Sol Kaydırma Oku & Degrade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none">
            <button
              onClick={() => handleScroll('left')}
              className="pointer-events-auto w-7 h-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-text hover:bg-primary hover:text-white transition-all cursor-pointer -ml-1"
              aria-label="Sola Kaydır"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        )}

        {/* Sekmeler Konteyneri */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth select-none px-0.5"
        >
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.id] ?? 0;
            const isTabActive = activeTab === tab.id;
            const hasData = count > 0;

            return (
              <button
                key={tab.id}
                ref={isTabActive ? activeTabRef : null}
                onClick={() => onSelectTab(tab.id)}
                className={`group/btn flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                  isTabActive
                    ? 'bg-primary text-white border-primary shadow-sm font-bold scale-[1.01]'
                    : hasData
                    ? 'bg-card hover:bg-card/90 border-border text-text hover:border-primary/50 hover:shadow-xs'
                    : 'bg-card/40 hover:bg-card/80 border-border/40 text-muted hover:text-text'
                }`}
                title={tab.description}
              >
                <Icon 
                  size={15} 
                  className={
                    isTabActive 
                      ? 'text-white' 
                      : hasData 
                      ? 'text-primary' 
                      : 'text-muted group-hover/btn:text-text'
                  } 
                />
                
                <span className="font-semibold">{tab.label}</span>

                {/* Sayı Rozeti (Badge) */}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] transition-all font-bold ${
                  isTabActive
                    ? 'bg-white/20 text-white'
                    : hasData
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-2xs font-extrabold'
                    : 'bg-muted/15 text-muted/60'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sağ Kaydırma Oku & Degrade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none">
            <button
              onClick={() => handleScroll('right')}
              className="pointer-events-auto w-7 h-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-text hover:bg-primary hover:text-white transition-all cursor-pointer -mr-1"
              aria-label="Sağa Kaydır"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>

      {/* ── 3. FİHRİST MODALI / MEGA MENU (Yüksek Kontrastlı & Kristal Netliğinde) ── */}
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
                  <h3 className="text-base sm:text-lg font-black text-text tracking-tight">Evren Modülleri Fihristi</h3>
                  <p className="text-xs text-muted mt-0.5">Tüm kurgu araçlarına tek bir bakışla ulaşın ve doğrudan geçiş yapın.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="w-9 h-9 rounded-full bg-muted/15 hover:bg-muted/30 text-text hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Kategorilere Göre Gruplanmış Net Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                const catTabs = ALL_TABS.filter(t => t.category === cat.id);
                const filledCatCount = catTabs.filter(t => (counts[t.id] || 0) > 0).length;

                return (
                  <div key={cat.id} className="p-4 rounded-2xl bg-background/80 border border-border space-y-2.5 shadow-2xs">
                    
                    {/* Kategori Başlığı */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2 text-xs font-black text-text tracking-wide uppercase">
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
                              onSelectTab(tab.id);
                              setShowDirectoryModal(false);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all cursor-pointer border ${
                              isTabActive
                                ? 'bg-primary text-white font-bold border-primary shadow-xs'
                                : 'bg-card hover:bg-card/90 border-border/70 hover:border-primary/50 text-text'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isTabActive ? 'bg-white/20 text-white' : hasData ? 'bg-primary/15 text-primary' : 'bg-muted/15 text-muted'
                              }`}>
                                <Icon size={13} />
                              </div>
                              <div className="min-w-0">
                                <span className={`truncate block ${isTabActive ? 'font-black text-white' : 'font-bold text-text'}`}>
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
                Toplam <strong className="text-text font-bold">{totalFilledCount}</strong> modülde kurgu verisi bulunuyor.
              </span>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 text-xs font-bold text-text transition-colors cursor-pointer"
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
