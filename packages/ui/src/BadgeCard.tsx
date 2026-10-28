import React from 'react';
import { Typography } from './Typography';
import { Lock, CheckCircle2, Sparkles } from 'lucide-react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'special';

export interface BadgeProgress {
  current: number;
  max: number;
  percentage: number;
  label?: string;
}

export interface BadgeCardProps {
  title: string;
  description: string;
  icon: any; // Lucide icon
  tier: BadgeTier;
  isUnlocked: boolean;
  conditionDescription?: string;
  progress?: BadgeProgress;
  earnedAt?: string;
  categoryLabel?: string;
}

const TIER_META: Record<BadgeTier, { label: string; tagBg: string; text: string }> = {
  bronze: { label: 'Bronz', tagBg: 'bg-amber-500/15 text-amber-500 border-amber-500/30', text: 'text-amber-500' },
  silver: { label: 'Gümüş', tagBg: 'bg-slate-400/15 text-slate-300 border-slate-400/30', text: 'text-slate-300' },
  gold: { label: 'Altın', tagBg: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30', text: 'text-yellow-500' },
  diamond: { label: 'Elmas', tagBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', text: 'text-cyan-400' },
  special: { label: 'Özel', tagBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30', text: 'text-purple-400' },
};

const getTierStyles = (tier: BadgeTier, isUnlocked: boolean) => {
  if (!isUnlocked) {
    return {
      card: 'bg-card/40 border-border/40 opacity-75 hover:opacity-90',
      iconBox: 'bg-muted/10 border border-border/40 text-muted-foreground',
      title: 'text-foreground/80',
      barBg: 'bg-muted/20',
      barFill: 'bg-muted-foreground/40',
      glow: '',
    };
  }

  switch (tier) {
    case 'bronze':
      return {
        card: 'bg-gradient-to-b from-amber-500/10 via-card/90 to-card border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/5',
        iconBox: 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-500 shadow-inner',
        title: 'text-amber-500',
        barBg: 'bg-amber-500/10',
        barFill: 'bg-amber-500',
        glow: 'from-amber-500/20 to-transparent',
      };
    case 'silver':
      return {
        card: 'bg-gradient-to-b from-slate-400/10 via-card/90 to-card border-slate-400/30 hover:border-slate-300/60 shadow-lg shadow-slate-400/5',
        iconBox: 'bg-gradient-to-br from-slate-400/20 to-slate-500/30 border border-slate-400/40 text-slate-200 shadow-inner',
        title: 'text-slate-200',
        barBg: 'bg-slate-400/10',
        barFill: 'bg-slate-300',
        glow: 'from-slate-400/20 to-transparent',
      };
    case 'gold':
      return {
        card: 'bg-gradient-to-b from-yellow-500/15 via-card/90 to-card border-yellow-500/40 hover:border-yellow-400/70 shadow-lg shadow-yellow-500/10',
        iconBox: 'bg-gradient-to-br from-yellow-400/25 to-yellow-600/35 border border-yellow-500/50 text-yellow-400 shadow-inner',
        title: 'text-yellow-400',
        barBg: 'bg-yellow-500/10',
        barFill: 'bg-yellow-400',
        glow: 'from-yellow-500/25 to-transparent',
      };
    case 'diamond':
      return {
        card: 'bg-gradient-to-b from-cyan-500/15 via-card/90 to-card border-cyan-500/40 hover:border-cyan-400/70 shadow-lg shadow-cyan-500/10',
        iconBox: 'bg-gradient-to-br from-cyan-400/25 to-cyan-600/35 border border-cyan-500/50 text-cyan-300 shadow-inner',
        title: 'text-cyan-400',
        barBg: 'bg-cyan-500/10',
        barFill: 'bg-cyan-400',
        glow: 'from-cyan-500/25 to-transparent',
      };
    case 'special':
      return {
        card: 'bg-gradient-to-b from-purple-500/15 via-card/90 to-card border-purple-500/40 hover:border-purple-400/70 shadow-lg shadow-purple-500/10',
        iconBox: 'bg-gradient-to-br from-purple-400/25 to-purple-600/35 border border-purple-500/50 text-purple-400 shadow-inner',
        title: 'text-purple-400',
        barBg: 'bg-purple-500/10',
        barFill: 'bg-purple-400',
        glow: 'from-purple-500/25 to-transparent',
      };
  }
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  title,
  description,
  icon: Icon,
  tier,
  isUnlocked,
  conditionDescription,
  progress,
  earnedAt,
  categoryLabel,
}) => {
  const styles = getTierStyles(tier, isUnlocked);
  const tierInfo = TIER_META[tier] || TIER_META.bronze;

  // Kazanılma tarihini formatla
  const formattedDate = earnedAt ? new Date(earnedAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : null;

  return (
    <div
      className={`group relative p-5 rounded-3xl border flex flex-col items-center text-center transition-all duration-300 overflow-hidden ${styles.card} ${
        isUnlocked ? 'hover:-translate-y-1 hover:shadow-xl' : 'hover:border-border/80'
      }`}
    >
      {/* Arka plan ışık vurgusu (yalnızca kazanılan rozetler için) */}
      {isUnlocked && (
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-gradient-to-b ${styles.glow} opacity-60`} />
      )}

      {/* Üst Çip: Kademe & Kategori */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 z-10">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tierInfo.tagBg}`}>
          {tierInfo.label}
        </span>

        {categoryLabel && (
          <span className="text-[10px] font-semibold text-muted-foreground/80 bg-muted/20 px-2 py-0.5 rounded-md">
            {categoryLabel}
          </span>
        )}

        {isUnlocked && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
            <CheckCircle2 size={11} />
            <span>Kazanıldı</span>
          </span>
        )}
      </div>

      {/* İkon Çerçevesi */}
      <div className="relative my-2 z-10">
        <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-transform duration-300 ${styles.iconBox} ${isUnlocked ? 'group-hover:scale-110' : ''}`}>
          {isUnlocked ? (
            <Icon className="w-8 h-8 sm:w-9 sm:h-9" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 opacity-25" />
              <Lock className="w-4 h-4 text-muted-foreground absolute" />
            </div>
          )}
        </div>

        {/* Özel Rozet Işıltı Efekti */}
        {isUnlocked && tier === 'special' && (
          <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
        )}
      </div>

      {/* Rozet Başlığı */}
      <Typography variant="body" className={`font-black text-sm sm:text-base mt-2 mb-1 z-10 transition-colors ${styles.title}`}>
        {title}
      </Typography>

      {/* Rozet Açıklaması */}
      <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2 z-10">
        {description}
      </Typography>

      {/* ── İlerleme Çubuğu & Durum Bilgisi ── */}
      <div className="w-full mt-auto pt-3 border-t border-border/30 z-10 flex flex-col gap-2">
        {isUnlocked ? (
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Tamamlandı
            </span>
            {formattedDate && (
              <span className="opacity-80 text-[10px]">{formattedDate}</span>
            )}
          </div>
        ) : (
          <>
            {progress && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground/90">İlerleme:</span>
                  <span className="text-primary font-black">
                    {progress.label || `${progress.current} / ${progress.max}`}
                  </span>
                </div>

                <div className={`w-full h-1.5 rounded-full overflow-hidden ${styles.barBg}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${styles.barFill}`}
                    style={{ width: `${Math.max(4, Math.min(100, progress.percentage))}%` }}
                  />
                </div>
              </div>
            )}

            {conditionDescription && (
              <div className="text-[11px] text-muted-foreground/75 leading-tight text-left bg-muted/20 p-2 rounded-xl border border-border/30">
                <span className="font-semibold text-foreground/80">Koşul: </span>
                {conditionDescription}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
