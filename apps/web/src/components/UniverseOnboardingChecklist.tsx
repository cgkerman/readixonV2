'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { 
  Universe, 
  Character, 
  UniverseLocation, 
  UniverseTimelineEvent, 
  UniverseCanonRule, 
  UniversePowerSystem, 
  Story 
} from '@readixon/core';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  User, 
  MapPin, 
  Clock, 
  Scale, 
  Eye, 
  Globe, 
  ExternalLink,
  X,
  Trophy,
  Zap
} from 'lucide-react';
import { Button } from '@readixon/ui';

export interface OnboardingStep {
  id: string;
  number: number;
  title: string;
  description: string;
  isCompleted: boolean;
  actionLabel: string;
  icon: React.ElementType;
  onAction: () => void;
}

export interface UniverseOnboardingChecklistProps {
  universe: Universe;
  characters: Character[];
  locations: UniverseLocation[];
  timelineEvents: UniverseTimelineEvent[];
  canonRules: UniverseCanonRule[];
  powerSystems: UniversePowerSystem[];
  stories: Story[];
  onNavigateTab: (tab: string) => void;
  onOpenCreateModal: (modalType: 'link_story' | 'character' | 'location' | 'event' | 'canon_rule' | 'power') => void;
  onPreviewPublicPortal: () => void;
}

export const UniverseOnboardingChecklist: React.FC<UniverseOnboardingChecklistProps> = ({
  universe,
  characters,
  locations,
  timelineEvents,
  canonRules,
  powerSystems,
  stories,
  onNavigateTab,
  onOpenCreateModal,
  onPreviewPublicPortal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);

  const storageKey = `readixon_onboarding_${universe.universeId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dismissed) setIsDismissed(true);
        if (parsed.collapsed) setIsCollapsed(true);
        if (parsed.previewed) setHasPreviewed(true);
      }
    } catch {
      // Local storage disabled or error
    }
  }, [storageKey]);

  const saveState = (updates: { dismissed?: boolean; collapsed?: boolean; previewed?: boolean }) => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : {};
      const next = { ...parsed, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    saveState({ collapsed: next });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    saveState({ dismissed: true });
  };

  const handlePreviewAction = () => {
    setHasPreviewed(true);
    saveState({ previewed: true });
    onPreviewPublicPortal();
  };

  // 8 Adımlı Liste Tanımı (PRD Bölüm 61)
  const steps: OnboardingStep[] = useMemo(() => {
    return [
      {
        id: 'identity',
        number: 1,
        title: 'Evren Kimliğini Oluştur',
        description: 'Kapak görseli yükle, türünü ve özet açıklamasını kaydet.',
        isCompleted: Boolean(universe.coverImage && universe.description && universe.description.length > 20),
        actionLabel: 'Bilgileri Düzenle',
        icon: Globe,
        onAction: () => onNavigateTab('overview'),
      },
      {
        id: 'story',
        number: 2,
        title: 'İlk Eserini Evrene Bağla',
        description: 'Bu evrende geçen en az bir romanı veya webtoon\'u sisteme bağla.',
        isCompleted: Boolean(stories.length > 0 || (universe.connectedStoryIds && universe.connectedStoryIds.length > 0)),
        actionLabel: 'Eser Bağla',
        icon: BookOpen,
        onAction: () => onOpenCreateModal('link_story'),
      },
      {
        id: 'character',
        number: 3,
        title: 'Baş Kahramanı veya Antagonisti Ekle',
        description: 'Karakter Defteri 2.0\'a ana karakterini ve RPG statlarını kaydet.',
        isCompleted: characters.length > 0,
        actionLabel: 'Karakter Ekle',
        icon: User,
        onAction: () => onOpenCreateModal('character'),
      },
      {
        id: 'location',
        number: 4,
        title: 'Dünyanın Kalbi: İlk Mekânı Belirle',
        description: 'Olayların merkezindeki başkenti, krallığı veya şehri tanımla.',
        isCompleted: locations.length > 0,
        actionLabel: 'Mekân Ekle',
        icon: MapPin,
        onAction: () => onOpenCreateModal('location'),
      },
      {
        id: 'event',
        number: 5,
        title: 'Zaman Çizelgesine Dönüm Noktası Ekle',
        description: 'Büyük savaş, yıkım veya karakterin doğumu gibi tarihi bir olay.',
        isCompleted: timelineEvents.length > 0,
        actionLabel: 'Olay Ekle',
        icon: Clock,
        onAction: () => onOpenCreateModal('event'),
      },
      {
        id: 'canon',
        number: 6,
        title: 'Dünya Kuralı veya Güç Sistemi Belirle',
        description: 'Büyü/teknoloji kurallarını veya çiğnenemez bir Series Bible kanunu koy.',
        isCompleted: canonRules.length > 0 || powerSystems.length > 0,
        actionLabel: 'Kural / Güç Ekle',
        icon: Scale,
        onAction: () => onOpenCreateModal('canon_rule'),
      },
      {
        id: 'visibility',
        number: 7,
        title: 'Görünürlük & Yayın Durumunu Ayarla',
        description: 'Evrenini taslaktan Liste Dışı veya Herkese Açık duruma geçir.',
        isCompleted: universe.visibility !== 'draft',
        actionLabel: 'Görünürlüğü Seç',
        icon: Eye,
        onAction: () => onNavigateTab('overview'),
      },
      {
        id: 'preview',
        number: 8,
        title: 'Evrene Gir Sayfasını Önizle',
        description: 'Okurların gözünden interaktif 3D karakterleri ve haritayı test et.',
        isCompleted: hasPreviewed,
        actionLabel: 'Canlı Önizle',
        icon: ExternalLink,
        onAction: handlePreviewAction,
      },
    ];
  }, [
    universe,
    characters,
    locations,
    timelineEvents,
    canonRules,
    powerSystems,
    stories,
    hasPreviewed,
  ]);

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isAllCompleted = completedCount === steps.length;

  if (isDismissed) return null;

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-r from-card via-card/90 to-card border border-border/60 shadow-lg overflow-hidden animate-in fade-in duration-300">
      {/* ── Üst Bar / Header ── */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            {isAllCompleted ? <Trophy size={20} className="text-amber-400" /> : <Sparkles size={20} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-foreground truncate">
                {isAllCompleted ? '🎉 Evren Temeli Kusursuz Kuruldu!' : '🧭 Evren Onboarding Kontrol Listesi'}
              </h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                isAllCompleted 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-primary/20 text-primary border-primary/30'
              }`}>
                {completedCount} / {steps.length} Adım ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 line-clamp-1">
              {isAllCompleted 
                ? 'Tüm temel adımları tamamladınız. Artık yeni eserler yazabilir ve evreninizi genişletebilirsiniz.'
                : 'Kurgusal evreninizi sağlam temellere oturtmak için önerilen 8 adımlı rehber.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="p-2 rounded-xl hover:bg-muted/15 text-muted hover:text-foreground transition-colors"
            title={isCollapsed ? 'Genişlet' : 'Daralt'}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl hover:bg-muted/15 text-muted hover:text-foreground transition-colors"
            title="Rehberi Kapat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── İlerleme Çubuğu (Progress Bar) ── */}
      <div className="w-full h-1.5 bg-background/80 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-amber-400 transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── Genişletilmiş Adımlar Alanı ── */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    step.isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-background/60 hover:bg-background border-border/50 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {step.isCompleted ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted/50 flex items-center justify-center text-[10px] font-bold text-muted">
                          {step.number}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <StepIcon size={13} className={step.isCompleted ? 'text-emerald-400' : 'text-primary'} />
                        <h4 className={`text-xs font-black truncate ${
                          step.isCompleted ? 'text-foreground line-through opacity-80' : 'text-foreground'
                        }`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {step.isCompleted ? (
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10">
                        Hazır
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={step.onAction}
                        className="px-3 py-1.5 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs active:scale-95"
                      >
                        <span>{step.actionLabel}</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alt Özet / İpucu */}
          <div className="mt-4 pt-3 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" />
              <span>İpucu: Bu kontrol listesi zorunlu değildir; istediğiniz zaman yukarıdaki çarpıdan gizleyebilirsiniz.</span>
            </span>
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="text-xs font-bold text-primary hover:underline"
            >
              Paneli Daralt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
