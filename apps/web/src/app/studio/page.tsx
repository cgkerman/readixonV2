'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input, PaywallModal } from '@readixon/ui';
import { PlusCircle, FileText, Image as ImageIcon, X, BookOpen, Sparkles, Wand2, Users, Compass, ChevronRight, Info } from 'lucide-react';
import { subscribeToAuthorStories, createStory, useAuthStore, POPULAR_TAGS, type Story } from '@readixon/core';
import { toast } from "sonner";

export default function StudioDashboard() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);



  useEffect(() => {
    if (!firebaseUser) return;
    
    setLoading(true);
    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      setStories(updatedStories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const toggleTag = (tagId: string) => {
    setNewTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateNew = async (useWizard: boolean) => {
    if (!firebaseUser || !newTitle.trim()) return;
    
    const userProfile = useAuthStore.getState().userProfile;
    
    // Paywall check
    if (useWizard) {
      if (userProfile?.status !== 'premium' && userProfile?.hasUsedFreeWizard) {
        setIsPaywallOpen(true);
        return;
      }
    }

    setIsCreating(true);
    try {
      const newStoryId = await createStory(firebaseUser.uid, {
        title: newTitle.trim(),
        summary: '',
        coverImage: '',
        tags: newTags,
        isAdultContent,
        status: 'draft'
      });

      if (useWizard && !userProfile?.hasUsedFreeWizard) {
        try {
          const { consumeFreeWizard } = await import('@readixon/core');
          await consumeFreeWizard(firebaseUser.uid);
        } catch (wizardErr) {
          console.error("consumeFreeWizard failed:", wizardErr);
          // Hata olsa bile hikaye oluştuğu için akışı kesmiyoruz.
        }
      }

      setIsModalOpen(false);
      setNewTitle('');
      setNewTags([]);
      
      if (useWizard) {
        router.push(`/studio/story/${newStoryId}/planner`);
      } else {
        router.push(`/studio/story/${newStoryId}`);
      }
    } catch (error) {
      console.error("handleCreateNew failed:", error);
      toast.error("Hikaye oluşturulamadı.");
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex flex-row justify-between items-center mb-10">
        <div>
          <Typography variant="h1">Hikayelerim</Typography>
          <Typography variant="body" className="text-muted mt-2">Taslaklarınızı düzenleyin ve yayınlayın.</Typography>
        </div>
        <Button variant="primary" onPress={() => setIsModalOpen(true)} className="flex flex-row items-center gap-2">
          <PlusCircle size={20} />
          Yeni Hikaye
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/20 rounded-2xl bg-card/20">
          <FileText size={48} className="mx-auto text-muted/50 mb-4" />
          <Typography variant="h3" className="mb-2">Henüz hikayeniz yok</Typography>
          <Typography variant="body" className="text-muted mb-6">İlk başyapıtınızı yazmaya hemen başlayın.</Typography>
          <div className="flex justify-center">
            <Button variant="outline" onPress={() => setIsModalOpen(true)}>Hemen Başla</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <div 
              key={story.storyId} 
              onClick={() => router.push(`/studio/story/${story.storyId}`)}
              className="bg-card border border-border/40 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group flex flex-col"
            >
              {story.coverImage ? (
                <img src={story.coverImage} alt={story.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-muted/10 flex items-center justify-center">
                  <ImageIcon className="text-muted/30" size={32} />
                </div>
              )}
              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-start">
                  <Typography variant="h3" className="font-bold line-clamp-1 flex-1 pr-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </Typography>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${story.status === 'ongoing' || story.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {story.status === 'draft' ? 'Taslak' : 'Yayında'}
                  </span>
                </div>
                <Typography variant="caption" className="text-muted line-clamp-2">
                  {story.summary || 'Özet eklenmemiş...'}
                </Typography>
                
                <div className="mt-auto pt-4 flex items-center justify-between text-muted border-t border-border/10">
                  <Typography variant="caption">{story.stats.chapterCount} Bölüm</Typography>
                  <Typography variant="caption">{story.stats.views} Okunma</Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Hikaye Oluşturma Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <Typography variant="h2">Yeni Hikaye Oluştur</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-text transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Bilgilendirme Alanı */}
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 text-primary">
                <Info size={24} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="block mb-1 text-base">Hangi seçeneği seçmeliyim?</strong>
                  <ul className="list-disc ml-4 space-y-2 opacity-90 mt-2">
                    <li><strong className="font-semibold">Düz Metin İle Başla:</strong> Klasik yöntem. Karakterlerinizi ve evreninizi sıfırdan, kendi hayal gücünüzle özgürce yazarak inşa edersiniz.</li>
                    <li><strong className="font-semibold">Sihirbazla Başla:</strong> Yapay zeka asistanı size yönlendirici sorular sorar. RPG yeteneklerini ve kurguyu dakikalar içinde birlikte tasarlarsınız. <span className="font-medium text-orange-500">(Premium - Önerilen)</span></li>
                  </ul>
                </div>
              </div>
              <Input
                label="Hikaye Adı"
                placeholder="Örn: Yüzüklerin Efendisi"
                value={newTitle}
                onChangeText={setNewTitle}
                className="mb-6"
              />
              
              <div>
                <Typography variant="body" className="font-medium text-text ml-1 mb-2">Türler (En fazla 3 adet seçin)</Typography>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => {
                    const isSelected = newTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        disabled={!isSelected && newTags.length >= 3}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-transparent' 
                            : 'bg-card text-muted hover:text-text border border-border hover:border-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
                {newTags.length >= 3 && (
                  <Typography variant="caption" className="text-orange-400 mt-2 block ml-1">
                    En fazla 3 tür seçebilirsiniz.
                  </Typography>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id="isAdultContent" 
                      className="w-5 h-5 rounded accent-primary cursor-pointer border-border"
                      checked={isAdultContent}
                      onChange={(e) => setIsAdultContent(e.target.checked)}
                    />
                  </div>
                  <div>
                    <label htmlFor="isAdultContent" className="font-semibold text-text cursor-pointer select-none block">
                      Yetişkin İçerik (+18)
                    </label>
                    <Typography variant="caption" className="text-muted block mt-1">
                      Bu hikaye yoğun argo, şiddet veya yetişkinlere yönelik edebi temalar içeriyor mu?
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-muted/5 flex flex-col sm:flex-row justify-end gap-3 mt-auto">
              <Button variant="ghost" onPress={() => setIsModalOpen(false)}>İptal</Button>
              <Button 
                variant="outline" 
                onPress={() => handleCreateNew(false)} 
                disabled={!newTitle.trim() || isCreating}
              >
                Düz Metin İle Başla
              </Button>
              <Button 
                variant="primary" 
                onPress={() => handleCreateNew(true)} 
                disabled={!newTitle.trim() || isCreating}
                className="flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Wand2 size={18} />
                {isCreating ? 'Oluşturuluyor...' : 'Sihirbazla Başla (Önerilen)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isPaywallOpen && (
        <PaywallModal 
          onClose={() => setIsPaywallOpen(false)}
          onUpgrade={() => {
            setIsPaywallOpen(false);
            router.push('/premium');
          }}
        />
      )}


    </div>
  );
}
