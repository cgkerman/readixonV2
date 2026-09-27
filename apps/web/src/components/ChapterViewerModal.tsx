'use client';

import React, { useEffect } from 'react';
import { Chapter, ContentBlock } from '@readixon/core';
import { ContentRenderer, Typography, Button } from '@readixon/ui';
import { X, ChevronLeft, ChevronRight, BookOpen, Music, HelpCircle, ExternalLink, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

interface ChapterViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  storyTitle?: string;
  storyId?: string;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ChapterViewerModal({
  isOpen,
  onClose,
  chapter,
  storyTitle,
  storyId,
  onPrevChapter,
  onNextChapter,
  hasPrev = false,
  hasNext = false,
}: ChapterViewerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrevChapter) onPrevChapter();
      if (e.key === 'ArrowRight' && hasNext && onNextChapter) onNextChapter();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevChapter, onNextChapter, onClose]);

  if (!isOpen || !chapter) return null;

  const calculateWords = (blocks: ContentBlock[] = []) => {
    return blocks.reduce((acc, block) => {
      if (block.type === 'paragraph' || block.type === 'quote') {
        const text = (block.text || (block as any).content || '').replace(/<[^>]+>/g, ' ').trim();
        return acc + (text ? text.split(/\s+/).filter(Boolean).length : 0);
      }
      return acc;
    }, 0);
  };

  const wordCount = calculateWords(chapter.contentBlocks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border/50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-4 bg-card/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                  Bölüm {chapter.order}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  chapter.status === 'published' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : chapter.status === 'scheduled'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-muted/10 text-muted border border-border/40'
                }`}>
                  {chapter.status === 'published' ? 'Yayında' : chapter.status === 'scheduled' ? 'Planlandı' : 'Taslak'}
                </span>
              </div>
              <Typography variant="h3" className="font-bold text-lg sm:text-xl truncate text-foreground mt-0.5">
                {chapter.title}
              </Typography>
              {storyTitle && (
                <Typography variant="caption" className="text-muted text-xs truncate block">
                  {storyTitle}
                </Typography>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {storyId && chapter.chapterId && (
              <Link 
                href={`/read/${storyId}/${chapter.chapterId}`} 
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-background hover:bg-card border border-border/50 text-foreground transition-colors"
                title="Okuyucu Sayfasında Yeni Sekmede Aç"
              >
                <ExternalLink size={13} />
                <span>Okuyucu Görünümü</span>
              </Link>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:bg-background/80 transition-colors border border-border/20"
              title="Kapat (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Info & Badges Bar */}
        <div className="px-5 py-2.5 bg-background/50 border-b border-border/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileText size={13} className="text-primary" />
              <strong>{wordCount.toLocaleString()}</strong> Kelime
            </span>
            <span className="flex items-center gap-1.5">
              <strong>{chapter.contentBlocks?.length || 0}</strong> İçerik Bloğu
            </span>
            {chapter.publishDate && (
              <span className="hidden sm:flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date((chapter.publishDate as any).seconds ? (chapter.publishDate as any).seconds * 1000 : chapter.publishDate as any).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>

          {chapter.audioTrack?.url && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              <Music size={12} className="animate-pulse" />
              <span>Fon Müziği: {chapter.audioTrack.title || 'Müzik Eklendi'}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-background/30 selection:bg-primary/20">
          {(!chapter.contentBlocks || chapter.contentBlocks.length === 0) ? (
            <div className="text-center py-20 text-muted">
              <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
              <Typography variant="body">Bu bölümde henüz içerik bulunmuyor.</Typography>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto readixon-content">
              <ContentRenderer 
                blocks={chapter.contentBlocks} 
                fontSize={17}
              />
            </div>
          )}

          {/* End Activity Section (if any) */}
          {chapter.endActivity && (
            <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-card border border-primary/20 shadow-sm mt-8">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <HelpCircle size={18} />
                <Typography variant="body" className="font-bold text-sm">
                  Bölüm Sonu Aktivitesi ({chapter.endActivity.type === 'poll' ? 'Okur Anketi' : 'Okur Sorusu'})
                </Typography>
              </div>
              <Typography variant="body" className="font-semibold mb-3">
                {chapter.endActivity.question}
              </Typography>
              {chapter.endActivity.options && chapter.endActivity.options.length > 0 && (
                <div className="space-y-2">
                  {chapter.endActivity.options.map((opt, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-background border border-border/30 text-xs flex items-center justify-between">
                      <span className="font-medium text-foreground">{typeof opt === 'string' ? opt : (opt as any).text}</span>
                      <span className="text-[10px] text-muted font-medium bg-muted/10 px-2 py-0.5 rounded">Seçenek {i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="p-3.5 sm:p-4 border-t border-border/40 bg-card flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            onPress={onPrevChapter}
            disabled={!hasPrev}
            className={`text-xs px-3 py-1.5 flex items-center gap-1 ${!hasPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft size={16} /> Önceki Bölüm
          </Button>

          <span className="text-xs text-muted font-medium">
            Bölüm {chapter.order}
          </span>

          <Button
            variant="outline"
            onPress={onNextChapter}
            disabled={!hasNext}
            className={`text-xs px-3 py-1.5 flex items-center gap-1 ${!hasNext ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Sonraki Bölüm <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
