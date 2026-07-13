'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { Users, Plus, ArrowLeft, MoreVertical, Shield, Swords, Sparkles, Ghost, Info, X } from 'lucide-react';
import { getCharacters, type Character, type CharacterRole } from '@readixon/core';
import { toast } from 'sonner';

export default function StoryCharactersPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await getCharacters(storyId);
        setCharacters(data);
      } catch (error) {
        toast.error('Karakterler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, [storyId]);

  const getRoleIcon = (role: CharacterRole) => {
    switch (role) {
      case 'protagonist': return <Shield size={16} className="text-primary" />;
      case 'antagonist': return <Swords size={16} className="text-red-500" />;
      case 'supporting': return <Sparkles size={16} className="text-blue-400" />;
      case 'minor': return <Ghost size={16} className="text-muted" />;
      default: return <Users size={16} />;
    }
  };

  const getRoleLabel = (role: CharacterRole) => {
    switch (role) {
      case 'protagonist': return 'Baş Karakter';
      case 'antagonist': return 'Düşman';
      case 'supporting': return 'Yan Karakter';
      case 'minor': return 'Figüran';
      default: return 'Karakter';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <button 
        onClick={() => router.push('/studio/characters')} 
        className="flex items-center gap-2 mb-8 text-muted hover:text-text transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        <Typography variant="body" className="font-medium">Kitap Seçimine Dön</Typography>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <Typography variant="h1" className="font-black text-text flex items-center gap-3">
            Karakter Defteri
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="text-muted hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-primary/10"
              title="Bilgi"
            >
              <Info size={24} />
            </button>
          </Typography>
          <Typography variant="body" className="text-muted mt-2">
            Bu hikayedeki tüm karakterlerin detaylı analizi.
          </Typography>
        </div>
        <Button 
          variant="primary" 
          onPress={() => router.push(`/studio/characters/${storyId}/new`)}
          className="flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Yeni Karakter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border/20 rounded-3xl bg-card/20">
          <Users size={64} className="mx-auto text-muted/30 mb-6" />
          <Typography variant="h2" className="mb-2">Defter Bomboş</Typography>
          <Typography variant="body" className="text-muted mb-8 max-w-md mx-auto">
            Hikayenin ruhunu yansıtacak, kusurları ve hayalleri olan ilk karakterini yaratarak maceraya başla.
          </Typography>
          <div className="flex justify-center">
            <Button variant="primary" onPress={() => router.push(`/studio/characters/${storyId}/new`)}>
              İlk Karakteri Yarat
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map(char => (
            <div 
              key={char.id}
              onClick={() => router.push(`/studio/characters/${storyId}/${char.id}`)}
              className="bg-card border border-border/40 hover:border-primary/50 rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 group flex flex-col"
            >
              <div className="relative h-64 w-full bg-muted/10 overflow-hidden">
                {char.avatarUrl ? (
                  <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Users size={48} className="text-primary/20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-border/50">
                  {getRoleIcon(char.role)}
                  <span className="text-xs font-bold text-text">{getRoleLabel(char.role)}</span>
                </div>
              </div>

              <div className="p-6">
                <Typography variant="h3" className="font-black text-text mb-1 group-hover:text-primary transition-colors">
                  {char.name}
                </Typography>
                <Typography variant="caption" className="text-muted font-medium mb-4 block">
                  {char.occupation || 'Meslek Belirtilmedi'} • {char.age || '?'} Yaşında
                </Typography>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {char.personalityTraits?.slice(0, 3).map((trait, i) => (
                    <span key={i} className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                      {trait}
                    </span>
                  ))}
                  {(char.personalityTraits?.length || 0) > 3 && (
                    <span className="bg-muted/10 text-muted text-[10px] font-bold px-2 py-1 rounded-md">
                      +{(char.personalityTraits?.length || 0) - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bilgilendirme Modalı */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsInfoModalOpen(false)}
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
                Karakter defteri, hikayenizdeki her bir karakterin fiziksel, psikolojik ve hikaye içindeki gelişimini takip edebileceğiniz detaylı bir profil alanıdır.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-primary">Fiziksel Profil:</strong> Karakterin görünümü, tarzı ve ayırt edici özellikleri.</li>
                <li><strong className="text-primary">Psikolojik Analiz:</strong> Korkuları, kusurları ve karakteristik özellikleri.</li>
                <li><strong className="text-primary">Karakter Eğrisi:</strong> Hikayenin başından sonuna kadar geçirdiği evrim ve motivasyonu.</li>
                <li><strong className="text-primary">RPG İstatistikleri:</strong> Yeteneklerini sayısal olarak değerlendirme alanı.</li>
              </ul>
              <p className="mt-4 font-medium text-text">
                Karakterlerinizi ne kadar detaylı oluşturursanız, okuyucularınızın onlarla kuracağı bağ da o kadar güçlü olur.
              </p>
            </div>
            
            <Button 
              variant="primary" 
              className="w-full mt-8 py-3"
              onPress={() => setIsInfoModalOpen(false)}
            >
              Anladım
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
