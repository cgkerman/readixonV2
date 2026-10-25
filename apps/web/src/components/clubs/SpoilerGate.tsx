'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, AlertTriangle, BookOpen, Eye, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@readixon/ui';

interface SpoilerGateProps {
  requiredChapterIndex: number;
  userChapterIndex: number;
  storyTitle?: string;
  storySlug?: string;
  onBypassUnlock?: () => void;
}

export function SpoilerGate({
  requiredChapterIndex,
  userChapterIndex,
  storyTitle = 'Kitap',
  storySlug,
  onBypassUnlock,
}: SpoilerGateProps) {
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const remaining = Math.max(0, requiredChapterIndex - userChapterIndex);
  const progressPercent = Math.min(100, Math.round((userChapterIndex / requiredChapterIndex) * 100));

  return (
    <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden min-h-[400px]">
      {/* Background Ambient Glow & Blurred Mock Messages */}
      <div className="absolute inset-0 select-none pointer-events-none opacity-20 filter blur-md p-8 space-y-4">
        <div className="h-10 bg-muted/40 rounded-2xl w-3/4 animate-pulse" />
        <div className="h-14 bg-muted/30 rounded-2xl w-1/2 ml-auto" />
        <div className="h-12 bg-muted/40 rounded-2xl w-2/3" />
        <div className="h-16 bg-muted/20 rounded-2xl w-4/5" />
      </div>

      {/* Foreground Glass Card */}
      <div className="relative z-10 max-w-lg w-full rounded-3xl bg-card/90 border border-border/80 backdrop-blur-xl p-8 shadow-2xl text-center space-y-6">
        {/* Lock Animation Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Lock size={32} className="stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <ShieldAlert size={13} />
            <span>Spoiler Koruması Aktif</span>
          </span>

          <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            Henüz Buraya Gelmediniz
          </h3>

          <p className="text-xs md:text-sm text-muted leading-relaxed">
            Bu odada <strong className="text-foreground">{storyTitle}</strong> eserinin{' '}
            <strong className="text-amber-500">{requiredChapterIndex}. Bölüm</strong> ve sonrasına dair
            önemli kurgusal sırlar, teoriler ve olaylar tartışılmaktadır.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-2xl bg-muted/10 border border-border/60 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted">Senin İlerlemen</span>
            <span className="text-foreground">
              Bölüm {userChapterIndex} / {requiredChapterIndex}{' '}
              <span className="text-primary font-bold">({remaining} bölüm kaldı)</span>
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-muted/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          {storySlug ? (
            <Link
              href={`/story/${storySlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <BookOpen size={16} />
              <span>Okumaya Devam Et</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <div className="text-xs text-muted">
              Okuyucuda {requiredChapterIndex}. bölüme ulaştığında bu oda otomatik açılacaktır.
            </div>
          )}

          {onBypassUnlock && (
            <button
              type="button"
              onClick={() => {
                if (!showOverrideWarning) {
                  setShowOverrideWarning(true);
                } else {
                  onBypassUnlock();
                }
              }}
              className="w-full sm:w-auto text-xs font-semibold text-muted hover:text-amber-500 py-2.5 px-4 rounded-2xl hover:bg-muted/10 transition-colors"
            >
              {showOverrideWarning ? 'Eminim, Spoilerı Göze Alıyorum' : 'Yine de Aç (Spoiler!)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
