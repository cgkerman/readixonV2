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
import { PlusCircle, Type, Quote, Image as ImageIcon, Minus, Flag } from 'lucide-react';

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

  return (
    <div className="flex flex-col gap-6 pb-32">
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
              />
            ))}
            {items.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl text-muted">
                Henüz hiç blok eklenmemiş. Alttaki butonları kullanarak yazmaya başlayın.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Toolbar */}
      <div className="sticky bottom-6 z-40 flex flex-row flex-wrap gap-3 p-4 bg-background/90 backdrop-blur-md shadow-2xl rounded-2xl border border-border/20 justify-center mx-auto mt-4">
        <Button variant="outline" onPress={() => addBlock('paragraph')} className="flex flex-row items-center gap-2">
          <Type size={16} /> Metin
        </Button>
        <Button variant="outline" onPress={() => addBlock('image')} className="flex flex-row items-center gap-2">
          <ImageIcon size={16} /> Görsel
        </Button>
        <Button variant="outline" onPress={() => addBlock('quote')} className="flex flex-row items-center gap-2">
          <Quote size={16} /> Alıntı
        </Button>
        <Button variant="outline" onPress={() => addBlock('divider')} className="flex flex-row items-center gap-2">
          <Minus size={16} /> Ayırıcı
        </Button>
        <Button variant="outline" onPress={() => addBlock('end_of_chapter')} className="flex flex-row items-center gap-2">
          <Flag size={16} /> Bölüm Sonu
        </Button>
      </div>
    </div>
  );
}
