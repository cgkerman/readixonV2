'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ContentBlock } from '@readixon/core/src/types';
import { Typography } from './Typography';
import { MessageSquare, Bookmark, Share2 } from 'lucide-react';

export interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize?: number;
  textColor?: string;
  onParagraphCommentClick?: (paragraphIndex: number, text: string) => void;
  paragraphCommentCounts?: Record<number, number>;
  onQuoteSave?: (text: string) => void;
  onQuoteShare?: (text: string) => void;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  blocks, 
  fontSize = 16, 
  textColor, 
  onParagraphCommentClick, 
  paragraphCommentCounts = {},
  onQuoteSave,
  onQuoteShare
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

  return (
    <div className="flex flex-col gap-6 relative" ref={containerRef}>
      
      {selection && (onQuoteSave || onQuoteShare) && (
        <div 
          className="absolute z-50 flex items-center bg-card shadow-lg border border-border/50 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2"
          style={{
            top: `${selection.top - (containerRef.current?.getBoundingClientRect().top || 0) - window.scrollY}px`,
            left: `${selection.left - (containerRef.current?.getBoundingClientRect().left || 0) - window.scrollX}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {onQuoteSave && (
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium hover:bg-muted/10 transition-colors flex items-center gap-2 border-r border-border/50"
            >
              <Bookmark size={16} className="text-primary" /> Kaydet
            </button>
          )}
          {onQuoteShare && (
            <button 
              onClick={handleShare}
              className="px-4 py-2 text-sm font-medium hover:bg-muted/10 transition-colors flex items-center gap-2"
            >
              <Share2 size={16} className="text-primary" /> Paylaş
            </button>
          )}
        </div>
      )}
      
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'paragraph': {
            const htmlContent = (block.text || '\u00A0')
              .replace(/\n/g, '<br/>')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*(.*?)\*/g, '<i>$1</i>');

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
                      <div key={currentIndex} className="relative group">
                        <Typography 
                          variant="body" 
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            lineHeight: 1.6, 
                            color: textColor
                          }}
                          dangerouslySetInnerHTML={{ __html: innerHtml }}
                        />
                        
                        {onParagraphCommentClick && (
                          <div className="absolute top-0 -right-10 h-full flex items-start pt-1">
                            <button 
                              onClick={() => onParagraphCommentClick(currentIndex, rawText)}
                              className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 opacity-50 hover:opacity-100"
                              title="Satır arası yorum yap"
                            >
                              <MessageSquare size={16} />
                              {commentCount > 0 && <span className="text-[10px] font-semibold">{commentCount}</span>}
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
              <div key={blockIndex} className="relative group">
                <Typography 
                  variant="body" 
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    lineHeight: 1.6, 
                    color: textColor
                  }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
                
                {onParagraphCommentClick && (
                  <div className="absolute top-0 -right-10 h-full flex items-start pt-1">
                    <button 
                      onClick={() => onParagraphCommentClick(currentIndex, block.text || '')}
                      className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 opacity-50 hover:opacity-100"
                      title="Satır arası yorum yap"
                    >
                      <MessageSquare size={16} />
                      {commentCount > 0 && <span className="text-[10px] font-semibold">{commentCount}</span>}
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
            return (
              <div key={blockIndex} className="w-full rounded-xl overflow-hidden my-4">
                <img 
                  src={block.url} 
                  alt="Story Image" 
                  className="w-full h-auto object-cover" 
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
          default:
            return null;
        }
      })}
    </div>
  );
};
