'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { BookOpen, Image as ImageIcon, ArrowRight, Info, X } from 'lucide-react';
import { subscribeToAuthorStories, useAuthStore, type Story } from '@readixon/core';

export default function CharacterNotebookSelectStory() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    
    setLoading(true);
    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      setStories(updatedStories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* Bilgilendirme Modalı */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-text transition-colors p-2 hover:bg-muted/10 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Info size={24} />
              </div>
              <Typography variant="h2" className="font-black">Karakter Defteri Nedir?</Typography>
            </div>
            
            <div className="space-y-4 text-text/80">
              <p>
                Karakter defteri, yazar olarak hikayenizdeki her bir karakterin fiziksel, psikolojik ve hikaye içindeki gelişimini takip edebileceğiniz detaylı bir profil alanıdır.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-primary">Fiziksel Profil:</strong> Karakterin görünümü, tarzı ve ayırt edici özellikleri.</li>
                <li><strong className="text-primary">Psikolojik Analiz:</strong> Korkuları, kusurları ve karakteristik özellikleri.</li>
                <li><strong className="text-primary">Karakter Eğrisi:</strong> Hikayenin başından sonuna kadar geçirdiği evrim.</li>
                <li><strong className="text-primary">RPG İstatistikleri:</strong> Yeteneklerini sayısal olarak değerlendirme alanı.</li>
              </ul>
              <p className="mt-4 font-medium text-text">
                Oluşturduğunuz karakter profilleri, <strong className="text-yellow-500">Premium</strong> üyeler tarafından okuma sayfasında görüntülenebilir. Bu sayede sadık okuyucularınıza karakterlerinizin bilinmeyen yönlerini sunarak daha derin bir bağ kurabilirsiniz.
              </p>
            </div>
            
            <Button 
              variant="primary" 
              className="w-full mt-8 py-3 rounded-full"
              onPress={() => setShowInfoModal(false)}
            >
              Anladım
            </Button>
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center gap-3">
          <Typography variant="h1" className="font-black text-text">Karakter Defteri</Typography>
          <button 
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Karakter Defteri Nedir?"
          >
            <Info size={24} />
          </button>
        </div>
        <Typography variant="body" className="text-muted mt-2">
          Karakterlerinizi derinlemesine analiz etmek, görsel ve psikolojik profillerini oluşturmak için bir hikaye seçin.
        </Typography>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/20 rounded-3xl bg-card/20">
          <BookOpen size={48} className="mx-auto text-muted/50 mb-4" />
          <Typography variant="h3" className="mb-2">Henüz hikayeniz yok</Typography>
          <Typography variant="body" className="text-muted mb-6">Karakter oluşturabilmek için önce bir hikaye taslağı oluşturmalısınız.</Typography>
          <Button variant="primary" onPress={() => router.push('/studio')}>Stüdyoya Dön</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <div 
              key={story.storyId} 
              onClick={() => router.push(`/studio/characters/${story.storyId}`)}
              className="bg-card border border-border/40 hover:border-primary/50 rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 group flex flex-col"
            >
              {story.coverImage ? (
                <img src={story.coverImage} alt={story.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-48 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ImageIcon className="text-primary/30" size={40} />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1 relative z-10 bg-card">
                <Typography variant="h3" className="font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                  {story.title}
                </Typography>
                <Typography variant="caption" className="text-muted line-clamp-2 mb-6">
                  {story.summary || 'Özet eklenmemiş...'}
                </Typography>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${story.status === 'ongoing' || story.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {story.status === 'draft' ? 'TASLAK' : 'YAYINDA'}
                  </span>
                  <div className="flex items-center gap-1 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    Defteri Aç <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
