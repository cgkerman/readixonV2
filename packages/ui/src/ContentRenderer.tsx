'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ContentBlock } from '@readixon/core/src/types';
import { Typography } from './Typography';
import { MessageSquare, Bookmark, Share2, Sparkles, X } from 'lucide-react';
import { sanitizeHtml } from '@readixon/core';

export interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize?: number;
  fontFamily?: 'sans' | 'serif' | 'mono';
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  textAlign?: 'left' | 'justify';
  textColor?: string;
  onParagraphCommentClick?: (paragraphIndex: number, text: string) => void;
  paragraphCommentCounts?: Record<number, number>;
  onQuoteSave?: (text: string) => void;
  onQuoteShare?: (text: string) => void;
  isWebtoon?: boolean;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  blocks, 
  fontSize = 16, 
  fontFamily = 'sans',
  lineHeight = 'normal',
  textAlign = 'left',
  textColor, 
  onParagraphCommentClick, 
  paragraphCommentCounts = {},
  onQuoteSave,
  onQuoteShare,
  isWebtoon = false
}) => {
  let globalParagraphIndex = 0;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selection, setSelection] = useState<{text: string; top: number; left: number} | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      
      const text = sel.toString().trim();
      if (!text || text.length < 5) {
        setSelection(null);
        return;
      }

      // Check if selection is inside container
      const range = sel.getRangeAt(0);
      let node = range.commonAncestorContainer;
      let isInside = false;
      while (node) {
        if (node === containerRef.current) {
          isInside = true;
          break;
        }
        node = node.parentNode as Node;
      }

      if (!isInside) {
        setSelection(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      // Position toolbar above the selection
      setSelection({
        text,
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX + rect.width / 2
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    // Hide on scroll to avoid floating toolbar detachment
    document.addEventListener('scroll', () => setSelection(null), { passive: true });
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('scroll', () => setSelection(null));
    };
  }, []);

  const handleSave = () => {
    if (selection && onQuoteSave) {
      onQuoteSave(selection.text);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleShare = () => {
    if (selection && onQuoteShare) {
      onQuoteShare(selection.text);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const computedLineHeight = lineHeight === 'tight' ? 1.45 : lineHeight === 'relaxed' ? 2.05 : 1.75;
  const textAlignClass = textAlign === 'justify' ? 'text-justify [text-align-last:left] [hyphens:auto]' : 'text-left';

  return (
    <div className={`readixon-content flex flex-col relative ${isWebtoon ? 'gap-0' : 'gap-6'} ${fontClass}`} ref={containerRef}>
      <style dangerouslySetInnerHTML={{ __html: `
        .readixon-content p, 
        .readixon-content span {
           color: inherit !important;
           background-color: transparent !important;
        }
      ` }} />
      
      {/* ── Masaüstü Yüzen Alıntı Menüsü ── */}
      {selection && (onQuoteSave || onQuoteShare) && (
        <div 
          className="absolute z-50 hidden sm:flex items-center bg-card shadow-xl border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 select-none"
          style={{
            top: `${selection.top - (containerRef.current?.getBoundingClientRect().top || 0) - window.scrollY}px`,
            left: `${selection.left - (containerRef.current?.getBoundingClientRect().left || 0) - window.scrollX}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {onQuoteSave && (
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold hover:bg-muted/15 transition-colors flex items-center gap-1.5 border-r border-border text-foreground"
            >
              <Bookmark size={14} className="text-primary" /> Kaydet
            </button>
          )}
          {onQuoteShare && (
            <button 
              onClick={handleShare}
              className="px-4 py-2 text-xs font-semibold hover:bg-muted/15 transition-colors flex items-center gap-1.5 text-primary"
            >
              <Share2 size={14} /> Paylaş
            </button>
          )}
        </div>
      )}

      {/* ── Mobilde Altta Sabit Alıntı Kartı (Parmakla seçimi engellemez, ekran altına zarifçe yerleşir) ── */}
      {selection && (onQuoteSave || onQuoteShare) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl flex flex-col gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] animate-in slide-in-from-bottom duration-200 sm:hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Sparkles size={14} /> Seçilen Alıntı
            </span>
            <button
              onClick={() => {
                setSelection(null);
                window.getSelection()?.removeAllRanges();
              }}
              className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-muted hover:text-foreground"
              aria-label="Kapat"
            >
              <X size={13} />
            </button>
          </div>
          <p className="text-xs text-foreground/80 line-clamp-2 italic border-l-2 border-primary/50 pl-2 leading-relaxed">
            &ldquo;{selection.text}&rdquo;
          </p>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {onQuoteSave && (
              <button
                onClick={handleSave}
                className="py-2.5 px-3 rounded-xl bg-muted/20 hover:bg-muted/30 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 border border-border active:scale-95 transition-all shadow-sm"
              >
                <Bookmark size={14} className="text-primary" />
                <span>Kütüphaneye Kaydet</span>
              </button>
            )}
            {onQuoteShare && (
              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl bg-primary text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Share2 size={14} />
                <span>Readix'te Paylaş</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'paragraph': {
            const rawHtml = (block.text || '\u00A0')
              .replace(/\n/g, '<br/>')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*(.*?)\*/g, '<i>$1</i>');

            const htmlContent = sanitizeHtml(rawHtml, {
              ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'u', 's', 'sub', 'sup', 'mark'],
              ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
            });

            // Paragraf içindeki <p> etiketlerini bul
            // Eğer <p> etiketleri varsa her birini ayrı bir yorum yapılabilir satır olarak ayır
            const pMatches = Array.from(htmlContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g));
            
            if (pMatches.length > 0) {
              return (
                <div key={blockIndex} className="flex flex-col gap-2">
                  {pMatches.map((match, i) => {
                    const innerHtml = match[0];
                    const rawText = match[1];
                    const currentIndex = globalParagraphIndex++;
                    const commentCount = paragraphCommentCounts[currentIndex] || 0;
                    
                    return (
                      <div key={currentIndex} className="relative group pr-9 sm:pr-0">
                        <Typography 
                          variant="body" 
                          className={textAlignClass}
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            lineHeight: computedLineHeight, 
                            color: textColor
                          }}
                          dangerouslySetInnerHTML={{ __html: innerHtml }}
                        />
                        
                        {onParagraphCommentClick && (
                          <div className="absolute top-0 right-0 sm:-right-9 flex items-center">
                            <button 
                              type="button"
                              onClick={() => onParagraphCommentClick(currentIndex, rawText)}
                              className={`transition-all flex items-center justify-center active:scale-90 ${
                                commentCount > 0
                                  ? 'h-7 px-2.5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 shadow-sm gap-1.5 opacity-100'
                                  : 'w-7 h-7 rounded-full bg-muted/25 hover:bg-primary/20 text-muted-foreground/80 hover:text-primary border border-border/50 opacity-45 sm:opacity-0 group-hover:opacity-100'
                              }`}
                              title="Satır arası yorum"
                            >
                              <MessageSquare size={16} className={commentCount > 0 ? "fill-primary/30" : ""} />
                              {commentCount > 0 && <span className="text-xs font-extrabold leading-none">{commentCount}</span>}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Fallback: Eğer <p> etiketi yoksa tüm bloğu tek bir paragraf say
            const currentIndex = globalParagraphIndex++;
            const commentCount = paragraphCommentCounts[currentIndex] || 0;
            return (
              <div key={blockIndex} className="relative group pr-9 sm:pr-0">
                <Typography 
                  variant="body" 
                  className={textAlignClass}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    lineHeight: computedLineHeight, 
                    color: textColor
                  }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
                
                {onParagraphCommentClick && (
                  <div className="absolute top-0 right-0 sm:-right-9 flex items-center">
                    <button 
                      type="button"
                      onClick={() => onParagraphCommentClick(currentIndex, block.text || '')}
                      className={`transition-all flex items-center justify-center active:scale-90 ${
                        commentCount > 0
                          ? 'h-7 px-2.5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 shadow-sm gap-1.5 opacity-100'
                          : 'w-7 h-7 rounded-full bg-muted/25 hover:bg-primary/20 text-muted-foreground/80 hover:text-primary border border-border/50 opacity-45 sm:opacity-0 group-hover:opacity-100'
                      }`}
                      title="Satır arası yorum"
                    >
                      <MessageSquare size={16} className={commentCount > 0 ? "fill-primary/30" : ""} />
                      {commentCount > 0 && <span className="text-xs font-extrabold leading-none">{commentCount}</span>}
                    </button>
                  </div>
                )}
              </div>
            );
          }
          case 'quote':
            return (
              <blockquote 
                key={blockIndex} 
                className="pl-4 border-l-4 italic"
                style={{ borderColor: textColor, opacity: 0.8 }}
              >
                <Typography 
                  variant="body" 
                  style={{ fontSize: `${fontSize * 1.1}px`, lineHeight: 1.6, color: textColor }}
                >
                  "{block.text}"
                </Typography>
              </blockquote>
            );
          case 'image':
            if (isWebtoon) {
              return (
                <div key={blockIndex} className="w-full">
                  <img 
                    src={block.url} 
                    alt="Webtoon Slice" 
                    className="w-full h-auto object-cover block" 
                    loading="lazy"
                  />
                </div>
              );
            }
            return (
              <div key={blockIndex} className="w-full rounded-xl overflow-hidden my-4">
                <img 
                  src={block.url} 
                  alt="Story Image" 
                  className="w-full h-auto object-cover" 
                  loading="lazy"
                />
              </div>
            );
          case 'divider':
            return (
              <div key={blockIndex} className="flex justify-center my-6 w-full">
                <div className="w-full h-[1px]" style={{ backgroundColor: textColor || 'currentColor', opacity: 0.2 }} />
              </div>
            );
          case 'end_of_chapter':
            return (
              <div key={blockIndex} className="flex justify-center my-12 w-full">
                <Typography 
                  variant="body" 
                  style={{ fontSize: `${fontSize}px`, color: textColor, fontWeight: 'bold' }}
                  className="text-center tracking-widest uppercase opacity-80"
                >
                  • • • Bölüm Sonu • • •
                </Typography>
              </div>
            );
          case 'end_of_story':
            return (
              <div key={blockIndex} className="flex justify-center my-16 w-full">
                <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-primary/20 bg-primary/5">
                  <Typography 
                    variant="h3" 
                    style={{ color: textColor, fontWeight: 'bold' }}
                    className="text-center text-primary uppercase tracking-widest"
                  >
                    • • • Hikaye Sonu • • •
                  </Typography>
                  <Typography 
                    variant="body" 
                    style={{ fontSize: `${fontSize * 0.9}px`, color: textColor }}
                    className="text-center opacity-80 max-w-md italic"
                  >
                    Yazar bu hikayeyi tamamladı. Okuduğunuz için teşekkürler!
                  </Typography>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
