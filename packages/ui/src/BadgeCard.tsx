import React from 'react';
import { Typography } from './Typography';
import { Lock } from 'lucide-react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'special';

export interface BadgeCardProps {
  title: string;
  description: string;
  icon: any; // Lucide icon
  tier: BadgeTier;
  isUnlocked: boolean;
  conditionDescription?: string;
}

const getTierColors = (tier: BadgeTier, isUnlocked: boolean) => {
  if (!isUnlocked) {
    return {
      bg: 'bg-muted/10',
      border: 'border-border/50',
      text: 'text-muted',
      iconBg: 'bg-muted/20',
      iconColor: 'text-muted-foreground',
    };
  }

  switch (tier) {
    case 'bronze':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-500',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-500',
      };
    case 'silver':
      return {
        bg: 'bg-slate-300/10',
        border: 'border-slate-300/20',
        text: 'text-slate-300',
        iconBg: 'bg-slate-300/20',
        iconColor: 'text-slate-300',
      };
    case 'gold':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-500',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-500',
      };
    case 'diamond':
      return {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-500',
        iconBg: 'bg-cyan-500/20',
        iconColor: 'text-cyan-500',
      };
    case 'special':
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-500',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-500',
      };
    default:
      return {
        bg: 'bg-card',
        border: 'border-border',
        text: 'text-primary',
        iconBg: 'bg-primary/20',
        iconColor: 'text-primary',
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
}) => {
  const colors = getTierColors(tier, isUnlocked);

  return (
    <div className={`p-5 rounded-2xl border flex flex-col items-center text-center transition-all ${colors.bg} ${colors.border} ${isUnlocked ? 'hover:scale-105' : 'opacity-70 grayscale-[0.5]'}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colors.iconBg} relative`}>
        {isUnlocked ? (
          <Icon className={`w-8 h-8 ${colors.iconColor}`} />
        ) : (
          <Lock className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      
      <Typography variant="body" className={`font-bold mb-1 ${isUnlocked ? colors.text : 'text-muted'}`}>
        {title}
      </Typography>
      
      <Typography variant="caption" className="text-muted-foreground mb-2 line-clamp-2">
        {description}
      </Typography>
      
      {!isUnlocked && conditionDescription && (
        <Typography variant="caption" className="text-xs text-muted/80 mt-auto border-t border-border/50 pt-2 w-full">
          {conditionDescription}
        </Typography>
      )}
    </div>
  );
};
