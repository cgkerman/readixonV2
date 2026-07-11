'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';

interface EditReadixModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  onSave: (newContent: string) => Promise<void>;
}

export function EditReadixModal({ isOpen, onClose, initialContent, onSave }: EditReadixModalProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!content.trim() || content === initialContent) {
      onClose();
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(content);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-4">
          <Typography variant="h3">Readix'i Düzenle</Typography>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 bg-background border border-border rounded-xl p-4 text-text resize-none focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Neler düşünüyorsun?"
            disabled={isSaving}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="secondary" className="rounded-full px-6" onPress={onClose} disabled={isSaving}>
            İptal
          </Button>
          <Button variant="primary" className="rounded-full px-6" onPress={handleSave} disabled={isSaving || !content.trim()}>
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
