'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import type { ContentBlock, ContentBlockType } from '@readixon/core/src/types';
import { SortableBlockItem } from './SortableBlockItem';
import { Button } from './Button';
import { PlusCircle, Type, Quote, Image as ImageIcon, Minus, Flag, FileText } from 'lucide-react';
// @ts-ignore
import mammoth from 'mammoth/mammoth.browser';

export interface BlockEditorProps {
  initialBlocks?: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export function BlockEditor({ initialBlocks = [], onChange, onUploadImage }: BlockEditorProps) {
  // We need unique IDs for sortable items, since ContentBlock doesn't have an ID
  const [items, setItems] = useState<{ id: string; block: ContentBlock }[]>(() => 
    initialBlocks.map((b, i) => ({ id: `block-${Date.now()}-${i}`, block: b }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateParent = (newItems: typeof items) => {
    setItems(newItems);
    onChange(newItems.map(item => item.block));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      updateParent(arrayMove(items, oldIndex, newIndex));
    }
  };

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = { type, text: '', url: '' };
    updateParent([...items, { id: `block-${Date.now()}`, block: newBlock }]);
  };

  const updateBlock = (id: string, updatedBlock: ContentBlock) => {
    updateParent(items.map(item => item.id === id ? { ...item, block: updatedBlock } : item));
  };

  const deleteBlock = (id: string) => {
    updateParent(items.filter(item => item.id !== id));
  };

  const parseHtmlToBlocks = (html: string, text: string): ContentBlock[] => {
    if (typeof document === 'undefined') return [];
    const newBlocks: ContentBlock[] = [];
    
    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const blockElements = doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
      
      if (blockElements.length > 0) {
        blockElements.forEach(el => {
          const tagName = el.tagName.toLowerCase();
          const content = el.innerHTML.trim();
          
          // Skip empty paragraphs
          if (!content || content === '<br>' || content === '<span></span>') return;
          
          if (tagName === 'blockquote') {
            newBlocks.push({ type: 'quote', text: el.textContent || '', url: '' });
          } else {
            let finalHtml = content;
            if (tagName.startsWith('h')) {
              finalHtml = `<b>${content}</b>`;
            } else if (tagName === 'li') {
              finalHtml = `• ${content}`;
            }
            newBlocks.push({ type: 'paragraph', text: finalHtml, url: '' });
          }
        });
      } else {
        // Fallback for simple HTML without standard block tags
        doc.body.childNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName.toLowerCase() === 'img') {
              const src = (el as HTMLImageElement).src;
              if (src) newBlocks.push({ type: 'image', text: '', url: src });
            } else if (el.innerHTML.trim() && el.innerHTML.trim() !== '<br>') {
              newBlocks.push({ type: 'paragraph', text: el.innerHTML.trim(), url: '' });
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            const content = node.textContent?.trim();
            if (content) {
              newBlocks.push({ type: 'paragraph', text: content, url: '' });
            }
          }
        });
      }
    } else if (text) {
      const paragraphs = text.split(/\r?\n/).filter(p => p.trim());
      paragraphs.forEach(p => {
        newBlocks.push({ type: 'paragraph', text: p.replace(/\n/g, '<br/>'), url: '' });
      });
    }

    return newBlocks;
  };

  const handlePasteMultiple = (targetId: string, html: string, text: string) => {
    const newBlocks = parseHtmlToBlocks(html, text);
    if (newBlocks.length === 0) return;

    const targetIndex = items.findIndex(item => item.id === targetId);
    if (targetIndex === -1) return;

    const newItems = newBlocks.map((block, i) => ({
      id: `block-${Date.now()}-${i}`,
      block
    }));

    const updatedItems = [...items];
    // Replace the current block with the first pasted block, and insert the rest after it
    if (newItems.length > 0) {
      updatedItems.splice(targetIndex, 1, ...newItems);
    }
    
    updateParent(updatedItems);
  };

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value; // The generated HTML
      
      const newBlocks = parseHtmlToBlocks(html, '');
      if (newBlocks.length > 0) {
        const newItems = newBlocks.map((block, i) => ({
          id: `block-${Date.now()}-${i}`,
          block
        }));
        
        // Append to the end
        updateParent([...items, ...newItems]);
      }
    } catch (error) {
      console.error("Word dosyası dönüştürülemedi:", error);
      alert("Word dosyası okunamadı. Lütfen geçerli bir .docx dosyası seçin.");
    }
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <SortableBlockItem
                key={item.id}
                id={item.id}
                block={item.block}
                onChange={(b) => updateBlock(item.id, b)}
                onDelete={() => deleteBlock(item.id)}
                onUploadImage={onUploadImage}
                onPasteMultiple={(html, text) => handlePasteMultiple(item.id, html, text)}
              />
            ))}
            {items.length === 0 && (
              <div 
                tabIndex={0}
                onPaste={(e) => {
                  const html = e.clipboardData.getData('text/html');
                  const text = e.clipboardData.getData('text/plain');
                  e.preventDefault();
                  
                  const newBlocks = parseHtmlToBlocks(html, text);
                  if (newBlocks.length > 0) {
                    const newItems = newBlocks.map((block, i) => ({
                      id: `block-${Date.now()}-${i}`,
                      block
                    }));
                    updateParent([...items, ...newItems]);
                  }
                }}
                className="text-center py-16 px-4 border-2 border-dashed border-primary/30 rounded-2xl text-muted bg-primary/5 cursor-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <div className="mb-4">
                  <Type size={32} className="mx-auto text-primary/70 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Yazmaya Başlayın</h3>
                <p className="max-w-md mx-auto text-sm opacity-90 mb-4 leading-relaxed">
                  Aşağıdaki butonları kullanarak yeni bloklar ekleyebilirsiniz. 
                  <br /><br />
                  <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold inline-block">
                    💡 İpucu: Dışarıdan kopyaladığınız metinleri buraya tıklayıp doğrudan yapıştırın (Ctrl+V). Metniniz otomatik olarak bloklara ayrılacaktır.
                  </span>
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Blok Ekleme Araç Çubuğu (Doğal Akışta, Blokların Altında) */}
      <div className="flex flex-row items-center gap-2 p-2.5 sm:p-3 bg-card/80 border border-border/40 rounded-2xl max-w-full overflow-x-auto no-scrollbar sm:flex-wrap justify-start sm:justify-center mx-auto mt-2 shadow-xs">
        
        {/* Docx Yükleme Butonu */}
        <Button size="sm" variant="primary" onPress={() => document.getElementById('docx-upload-input')?.click()} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <FileText size={15} /> Word Yükle
        </Button>
        <input 
          id="docx-upload-input"
          type="file" 
          accept=".docx" 
          className="hidden" 
          onChange={handleDocxUpload} 
        />
        
        <div className="w-[1px] h-6 bg-border/50 self-center mx-0.5 shrink-0" />

        <Button size="sm" variant="outline" onPress={() => addBlock('paragraph')} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Type size={15} /> Metin
        </Button>
        <Button size="sm" variant="outline" onPress={() => addBlock('image')} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <ImageIcon size={15} /> Görsel
        </Button>
        <Button size="sm" variant="outline" onPress={() => addBlock('quote')} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Quote size={15} /> Alıntı
        </Button>
        <Button size="sm" variant="outline" onPress={() => addBlock('divider')} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Minus size={15} /> Ayırıcı
        </Button>
        <Button size="sm" variant="outline" onPress={() => addBlock('end_of_chapter')} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Flag size={15} /> Bölüm Sonu
        </Button>
        <Button size="sm" variant="outline" onPress={() => addBlock('end_of_story')} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Flag size={15} className="text-primary" /> Hikaye Sonu
        </Button>
      </div>
    </div>
  );
}
