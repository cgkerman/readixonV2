'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2, ListMusic, Lock, Globe } from 'lucide-react';
import {
  getUserReadingLists,
  addStoryToReadingList,
  removeStoryFromReadingList,
  ReadingList,
} from '@readixon/core';
import { CreateReadingListModal } from './CreateReadingListModal';
import { toast } from 'sonner';

interface AddToReadingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  storyId: string;
  storyTitle?: string;
}

export const AddToReadingListModal: React.FC<AddToReadingListModalProps> = ({
  isOpen,
  onClose,
  userId,
  storyId,
  storyTitle = 'Bu Hikaye',
}) => {
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingListId, setUpdatingListId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchLists = async () => {
      setLoading(true);
      try {
        const userLists = await getUserReadingLists(userId);
        setLists(userLists);
      } catch (err) {
        console.error(err);
        toast.error('Okuma listeleri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleToggle = async (list: ReadingList) => {
    const isCurrentlyIn = list.storyIds?.includes(storyId);
    setUpdatingListId(list.id);

    try {
      if (isCurrentlyIn) {
        await removeStoryFromReadingList(list.id, storyId);
        setLists(prev =>
          prev.map(l =>
            l.id === list.id ? { ...l, storyIds: l.storyIds.filter(id => id !== storyId) } : l
          )
        );
        toast.success(`"${list.title}" listesinden çıkarıldı.`);
      } else {
        await addStoryToReadingList(list.id, storyId);
        setLists(prev =>
          prev.map(l =>
            l.id === list.id ? { ...l, storyIds: [...(l.storyIds || []), storyId] } : l
          )
        );
        toast.success(`"${list.title}" listesine eklendi.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('İşlem başarısız oldu.');
    } finally {
      setUpdatingListId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-sm rounded-3xl bg-card border border-border/40 shadow-2xl overflow-hidden p-6">
          {/* Kapat Butonu */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          {/* Başlık */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <ListMusic size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground truncate">
                Okuma Listesine Ekle
              </h2>
              <p className="text-xs text-muted-foreground truncate">{storyTitle}</p>
            </div>
          </div>

          {/* Listeler Alanı */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 my-3 scrollbar-thin">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={24} className="animate-spin text-primary" />
                <span className="text-xs font-medium">Listeler yükleniyor...</span>
              </div>
            ) : lists.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs space-y-2">
                <p>Henüz bir okuma listeniz yok.</p>
                <p className="text-[11px] opacity-75">
                  Aşağıdaki butona basarak ilk okuma listenizi hemen oluşturabilirsiniz!
                </p>
              </div>
            ) : (
              lists.map(list => {
                const isSelected = list.storyIds?.includes(storyId);
                const isUpdating = updatingListId === list.id;

                return (
                  <button
                    key={list.id}
                    onClick={() => handleToggle(list)}
                    disabled={isUpdating}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-primary/10 border-primary/40 text-foreground'
                        : 'bg-background/60 hover:bg-background border-border/20 text-foreground/80'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">{list.title}</span>
                        {!list.isPublic && (
                          <Lock size={11} className="text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {list.storyIds?.length || 0} hikaye
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                          : 'border-border/60 bg-muted/20'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 size={13} className="animate-spin text-primary-foreground" />
                      ) : isSelected ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Yeni Liste Oluştur Butonu */}
          <div className="pt-4 border-t border-border/15 mt-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/10 transition-colors text-xs font-bold"
            >
              <Plus size={16} /> Yeni Okuma Listesi Oluştur
            </button>
          </div>
        </div>
      </div>

      {/* İç İçe Yeni Liste Modal */}
      <CreateReadingListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={userId}
        initialStoryId={storyId}
        onSuccess={created => {
          setLists(prev => [created, ...prev]);
          toast.success(`"${created.title}" oluşturuldu ve bu hikaye eklendi!`);
        }}
      />
    </>
  );
};
