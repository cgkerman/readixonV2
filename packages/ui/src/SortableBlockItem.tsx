'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { ContentBlock } from '@readixon/core';

export interface SortableBlockItemProps {
  id: string;
  block: ContentBlock;
  onChange: (updatedBlock: ContentBlock) => void;
  onDelete: () => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export function SortableBlockItem({ id, block, onChange, onDelete, onUploadImage }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const paragraphRef = React.useRef<HTMLTextAreaElement>(null);
  const quoteRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const resizeTextarea = (element: HTMLTextAreaElement | null) => {
      if (element) {
        const oldHeight = element.offsetHeight;
        element.style.height = 'auto';
        const newHeight = element.scrollHeight;
        element.style.height = `${newHeight}px`;
        
        // Eğer kullanıcı bu alanda yazıyorsa ve kutu büyüdüyse, 
        // sayfayı (veya kaydırma alanını) da o kadar aşağı kaydır.
        if (document.activeElement === element && newHeight > oldHeight) {
          const scrollContainer = element.closest('.overflow-y-auto') || window;
          scrollContainer.scrollBy(0, newHeight - oldHeight);
        }
      }
    };
    resizeTextarea(paragraphRef.current);
    resizeTextarea(quoteRef.current);
  }, [block.text]);

  const renderEditor = () => {
    switch (block.type) {
      case 'paragraph':
        return (
          <textarea
            ref={paragraphRef}
            className="w-full bg-background border border-border/50 rounded-lg p-3 min-h-[100px] text-text focus:outline-none focus:border-primary resize-none overflow-hidden transition-all"
            style={{ scrollMarginBottom: '150px' }}
            placeholder="Metninizi yazın (Satır atlamak için Enter'a basın)..."
            value={block.text || ''}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        );
      case 'quote':
        return (
          <textarea
            ref={quoteRef}
            className="w-full bg-background border-l-4 border-l-primary border-t border-b border-r border-border/50 rounded-r-lg p-3 min-h-[80px] text-text italic focus:outline-none focus:border-primary resize-none overflow-hidden transition-all"
            style={{ scrollMarginBottom: '150px' }}
            placeholder="Alıntı metnini yazın..."
            value={block.text || ''}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        );
      case 'image':
        return (
          <div className="flex flex-col gap-2">
            {block.url ? (
              <img src={block.url} alt="Uploaded" className="w-full h-auto max-h-64 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-32 bg-muted/20 border-2 border-dashed border-border flex items-center justify-center rounded-lg">
                <span className="text-muted text-sm mb-2">Resim yüklemek için seçin</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0] && onUploadImage) {
                      try {
                        const url = await onUploadImage(e.target.files[0]);
                        onChange({ ...block, url });
                      } catch (error) {
                        console.error("Resim yüklenemedi", error);
                      }
                    }
                  }}
                  className="block w-full max-w-xs text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                />
              </div>
            )}
            {block.url && (
              <input
                type="text"
                className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm text-text focus:outline-none focus:border-primary"
                placeholder="Görsel URL'si (Değiştirebilirsiniz)"
                value={block.url || ''}
                onChange={(e) => onChange({ ...block, url: e.target.value })}
              />
            )}
          </div>
        );
      case 'divider':
        return (
          <div className="flex justify-center py-4">
            <div className="w-32 h-1 rounded-full bg-border/50" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-row items-start gap-2 bg-card p-4 rounded-xl border border-border/30 relative group">
      <div 
        {...attributes} 
        {...listeners} 
        className="mt-2 p-1 cursor-grab active:cursor-grabbing hover:bg-muted/20 rounded"
      >
        <GripVertical size={20} className="text-muted" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
          {block.type}
        </div>
        {renderEditor()}
      </div>

      <button 
        onClick={onDelete}
        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
