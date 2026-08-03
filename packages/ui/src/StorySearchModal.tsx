"use client";

import React, { useState, useEffect } from 'react';
import { Story, searchStories } from '@readixon/core';
import { Search, X, BookOpen, Loader2 } from 'lucide-react';
import { Typography } from './Typography';

interface StorySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (story: Story) => void;
}

export function StorySearchModal({ isOpen, onClose, onSelect }: StorySearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchStories(searchTerm.trim());
        setResults(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <Typography variant="h3" className="font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Kitap Ara ve Ekle
          </Typography>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors p-2 -mr-2 rounded-full hover:bg-border/50">
            <X size={20} />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4 border-b border-border/50 bg-background/50">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text"
              placeholder="Eklemek istediğiniz kitabın adını veya yazarını yazın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted gap-3">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-sm">Aranıyor...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((story) => (
                <button
                  key={story.storyId}
                  onClick={() => { onSelect(story); onClose(); }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-colors text-left group"
                >
                  <img src={story.coverImage} alt={story.title} className="w-10 h-14 object-cover rounded-lg bg-background/50 border border-border/50 shadow-sm group-hover:border-primary/30 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <Typography variant="body" className="font-semibold text-text truncate leading-tight">{story.title}</Typography>
                    <Typography variant="body" className="text-[13px] text-muted truncate mt-0.5">{story.authorName || 'Bilinmiyor'}</Typography>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.trim().length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
              <BookOpen size={24} className="opacity-20" />
              <span className="text-sm">Sonuç bulunamadı.</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted/60 gap-2">
              <Search size={24} className="opacity-20" />
              <span className="text-sm">Kitap bulmak için yazmaya başlayın.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
