'use client';

import React, { useState, useEffect } from 'react';
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
import { htmlToContentBlocks, contentBlocksToHtml, generateBlockId, ensureBlockId } from '@readixon/core/src/utils/blockParser';
import { SortableBlockItem } from './SortableBlockItem';
import { Button } from './Button';
import { FreeWritingEditor } from './FreeWritingEditor';
import {
  PlusCircle, Type, Quote, Image as ImageIcon, Minus, Flag,
  FileText, PenTool, Layers, ArrowRight, ArrowLeft
} from 'lucide-react';
// @ts-ignore
import mammoth from 'mammoth/mammoth.browser';

export interface BlockEditorProps {
  initialBlocks?: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onUploadImage?: (file: File) => Promise<string>;
  defaultMode?: 'blocks' | 'freewrite';
}

export function BlockEditor({
  initialBlocks = [],
  onChange,
  onUploadImage,
  defaultMode = 'blocks'
}: BlockEditorProps) {
  // Düzenleme Modu: 'freewrite' (Word / Wattpad Serbest Yazı) veya 'blocks' (Gelişmiş Blok Editörü)
  const [activeMode, setActiveMode] = useState<'blocks' | 'freewrite'>(() => {
    // Eğer bloklar tamamen boşsa yazara doğrudan serbest Word modunu sunalım
    if (initialBlocks.length === 0) return 'freewrite';
    return defaultMode;
  });

  // Ensure each ContentBlock has a persistent unique ID
  const [items, setItems] = useState<{ id: string; block: ContentBlock }[]>(() =>
    initialBlocks.map((b) => {
      const blockWithId = ensureBlockId(b);
      return { id: blockWithId.id!, block: blockWithId };
    })
  );

  // Serbest Yazı Modu için HTML içeriği
  const [manuscriptHtml, setManuscriptHtml] = useState<string>(() =>
    contentBlocksToHtml(initialBlocks)
  );

  // initialBlocks dışarıdan değiştiğinde senkronize et
  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      const formatted = initialBlocks.map(b => ({
        id: b.id || generateBlockId(),
        block: ensureBlockId(b)
      }));
      setItems(formatted);
      setManuscriptHtml(contentBlocksToHtml(initialBlocks));
    }
  }, [initialBlocks.length]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateParent = (newItems: typeof items) => {
    setItems(newItems);
    const rawBlocks = newItems.map(item => item.block);
    onChange(rawBlocks);
    setManuscriptHtml(contentBlocksToHtml(rawBlocks));
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
    const newBlock: ContentBlock = ensureBlockId({ type, text: '', url: '' });
    updateParent([...items, { id: newBlock.id!, block: newBlock }]);
  };

  const updateBlock = (id: string, updatedBlock: ContentBlock) => {
    const withId = updatedBlock.id ? updatedBlock : { ...updatedBlock, id };
    updateParent(items.map(item => item.id === id ? { ...item, block: withId } : item));
  };

  const deleteBlock = (id: string) => {
    updateParent(items.filter(item => item.id !== id));
  };

  const parseHtmlToBlocks = (html: string, text: string): ContentBlock[] => {
    return htmlToContentBlocks(html, text);
  };

  const handlePasteMultiple = (targetId: string, html: string, text: string) => {
    const newBlocks = parseHtmlToBlocks(html, text);
    if (newBlocks.length === 0) return;

    const targetIndex = items.findIndex(item => item.id === targetId);
    if (targetIndex === -1) return;

    const newItems = newBlocks.map((block) => ({
      id: block.id!,
      block
    }));

    const updatedItems = [...items];
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
      const html = result.value;

      const newBlocks = parseHtmlToBlocks(html, '');
      if (newBlocks.length > 0) {
        const newItems = newBlocks.map((block) => ({
          id: block.id || generateBlockId(),
          block
        }));

        updateParent([...items, ...newItems]);
      }
    } catch (error) {
      console.error("Word dosyası dönüştürülemedi:", error);
      alert("Word dosyası okunamadı. Lütfen geçerli bir .docx dosyası seçin.");
    }

    e.target.value = '';
  };

  // Word modundan gelen metni bloklara çevirip Blok Editörüne aktar
  const handleConvertFromFreeWriting = (blocks: ContentBlock[]) => {
    if (blocks.length === 0) {
      // Boşsa en az bir boş paragraf koy
      blocks = [{ id: generateBlockId(), type: 'paragraph', text: '', url: '' }];
    }
    const newItems = blocks.map(b => ({
      id: b.id || generateBlockId(),
      block: ensureBlockId(b)
    }));
    updateParent(newItems);
    setActiveMode('blocks');
  };

  // Blok editöründen serbest Word moduna geçiş yap
  const handleSwitchToFreeWriting = () => {
    const rawBlocks = items.map(i => i.block);
    const html = contentBlocksToHtml(rawBlocks);
    setManuscriptHtml(html);
    setActiveMode('freewrite');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Üst Mod Seçici (Wattpad/Word vs. Blok Editörü) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-card/60 border border-border/50 rounded-2xl backdrop-blur-sm">

        {/* Mod Anahtarı */}
        <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={handleSwitchToFreeWriting}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeMode === 'freewrite'
              ? 'bg-primary text-background shadow-sm'
              : 'text-muted hover:text-foreground'
              }`}
          >
            <PenTool size={15} />
            <span>Serbest Yazı (Word Modu)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeMode === 'freewrite') {
                const blocks = htmlToContentBlocks(manuscriptHtml);
                handleConvertFromFreeWriting(blocks);
              } else {
                setActiveMode('blocks');
              }
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeMode === 'blocks'
              ? 'bg-primary text-background shadow-sm'
              : 'text-muted hover:text-foreground'
              }`}
          >
            <Layers size={15} />
            <span>Blok Editörü</span>
            {items.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${activeMode === 'blocks' ? 'bg-black/25 text-background' : 'bg-muted/20 text-muted'
                }`}>
                {items.length}
              </span>
            )}
          </button>
        </div>

        {/* Hızlı Dönüştürme Aksiyonu */}
        <div className="flex items-center justify-end gap-2">
          {activeMode === 'blocks' ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8.5 border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
              onPress={handleSwitchToFreeWriting}
            >
              <PenTool size={13} />
              <span>Word Moduna Aktar</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              className="text-xs h-8.5 gap-1.5 font-bold shadow-xs"
              onPress={() => {
                const blocks = htmlToContentBlocks(manuscriptHtml);
                handleConvertFromFreeWriting(blocks);
              }}
            >
              <Layers size={13} />
              <span>Blok Editörüne Aktar</span>
              <ArrowRight size={13} className="opacity-70" />
            </Button>
          )}
        </div>
      </div>

      {/* ── 1. MOD: Serbest Yazı (Word / Wattpad Modu) ── */}
      {activeMode === 'freewrite' ? (
        <FreeWritingEditor
          initialHtml={manuscriptHtml}
          initialBlocks={items.map(i => i.block)}
          onChangeHtml={(html) => {
            setManuscriptHtml(html);
            // Canlı arka plan güncellemesi
            const raw = htmlToContentBlocks(html);
            onChange(raw);
          }}
          onConvertToBlocks={(blocks) => handleConvertFromFreeWriting(blocks)}
          onSwitchToBlocks={() => setActiveMode('blocks')}
        />
      ) : (
        /* ── 2. MOD: Blok Editörü (Gelişmiş Mod) ── */
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
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
                        const newItems = newBlocks.map((block) => ({
                          id: block.id || generateBlockId(),
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
                    <h3 className="text-lg font-bold text-text mb-2">Blok Editörü Boş</h3>
                    <p className="max-w-md mx-auto text-sm opacity-90 mb-4 leading-relaxed">
                      Aşağıdaki butonları kullanarak yeni bloklar ekleyebilir veya üst kısımdan{' '}
                      <strong className="text-primary cursor-pointer hover:underline" onClick={handleSwitchToFreeWriting}>
                        "Serbest Yazı (Word Modu)"
                      </strong>
                      na geçerek aralıksız yazabilirsiniz.
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={handleSwitchToFreeWriting}
                      className="font-semibold text-xs"
                    >
                      <PenTool size={14} className="mr-1.5" />
                      Word / Wattpad Moduna Geç
                    </Button>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Blok Ekleme Araç Çubuğu (Doğal Akışta, Blokların Altında) */}
          <div className="flex flex-row items-center gap-2 p-2.5 sm:p-3 bg-card/80 border border-border/40 rounded-2xl max-w-full overflow-x-auto no-scrollbar sm:flex-wrap justify-start sm:justify-center mx-auto mt-2 shadow-xs">

            {/* Word Moduna Dön */}
            <Button size="sm" variant="outline" onPress={handleSwitchToFreeWriting} className="flex flex-row items-center gap-1.5 shrink-0 whitespace-nowrap border-primary/30 text-primary hover:bg-primary/10">
              <PenTool size={14} /> Serbest Yazı Modu
            </Button>

            <div className="w-[1px] h-6 bg-border/50 self-center mx-0.5 shrink-0" />

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
      )}
    </div>
  );
}
