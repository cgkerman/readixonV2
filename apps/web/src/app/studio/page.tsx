'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { PlusCircle, FileText, Image as ImageIcon, X, BookOpen, Sparkles, Wand2, Users, Compass, ChevronRight } from 'lucide-react';
import { subscribeToAuthorStories, createStory, useAuthStore, POPULAR_TAGS, type Story } from '@readixon/core';
import { toast } from "sonner";

export default function StudioDashboard() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Yazar Akademisi State
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  const GUIDE_TOPICS = [
    {
      id: 'book-creation',
      title: 'İlk Adım: Kitap Nasıl Oluşturulur?',
      summary: 'Önsöz yazımı, arka kapak sözleri ve okuyucuyu ilk satırda yakalamanın sırları.',
      icon: <BookOpen className="text-primary" size={28} />,
      content: (
        <div className="space-y-4 text-text">
          <Typography variant="body" className="font-bold text-primary">Önsöz ve Arka Kapak Neden Önemlidir?</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Okuyucunun bir kitaba başlama kararını verdiği ilk yer kapak ve tanıtım (arka kapak) yazısıdır. Arka kapak yazınız hikayenin tamamını özetlememeli, aksine okuyucuda merak uyandırmalıdır. Kahramanın karşı karşıya olduğu en büyük çatışmayı tek bir çarpıcı cümleye sığdırmaya çalışın.
          </Typography>
          <Typography variant="body" className="font-bold text-primary mt-6">Kategori ve Etiket Seçimi</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Doğru okuyucu kitlesine ulaşmak için etiketleri (tags) özenle seçin. Hikayenizin ruhunu yansıtan en fazla 3 anahtar kelime belirleyin. Yetişkinlere yönelik içerik varsa (şiddet, cinsellik vb.) +18 seçeneğini işaretlemeyi unutmayın; bu, güvenli bir topluluk için çok önemlidir.
          </Typography>
        </div>
      )
    },
    {
      id: 'chapter-creation',
      title: 'Bölüm Oluşturma ve Editör',
      summary: 'İçerik editörünün nasıl kullanıldığı, formatlama ve bölümleri yapılandırma ipuçları.',
      icon: <FileText className="text-primary" size={28} />,
      content: (
        <div className="space-y-4 text-text">
          <Typography variant="body" className="font-bold text-primary">Bölüm Uzunluğu ve Tempo</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Dijital platformlarda okuma alışkanlıkları basılı kitaplardan farklıdır. Çok uzun bölümler okuyucuyu yorabilir, çok kısaları ise tatmin etmeyebilir. Ortalama 1000 - 2500 kelime arası ideal bir bölüm uzunluğudur. Her bölümün sonunda küçük bir merak unsuru (cliffhanger) bırakmak, okuyucunun bir sonraki bölüme heyecanla geçmesini sağlar.
          </Typography>
          <Typography variant="body" className="font-bold text-primary mt-6">Zengin Metin Editörü Kullanımı</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Editörümüzü kullanırken paragraflar arasına boşluk bırakmayı ihmal etmeyin. Duvar gibi duran blok metinler dijitalde göz yorar. Vurgulamak istediğiniz iç sesleri veya rüyaları <i>italik</i> kullanarak belirtebilirsiniz. Kalın (bold) harfleri sadece çok önemli kelimelerde kullanmaya özen gösterin.
          </Typography>
        </div>
      )
    },
    {
      id: 'ai-assistant',
      title: 'Yapay Zeka (AI) Asistanı',
      summary: 'Tıkandığınızda AI eklentisiyle nasıl beyin fırtınası yapılır, kurgu desteği nasıl alınır.',
      icon: <Sparkles className="text-primary" size={28} />,
      content: (
        <div className="space-y-4 text-text">
          <Typography variant="body" className="font-bold text-primary">Yazar Tıkanıklığına Son</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Hikayede bir noktada sıkıştınız mı? Karakteriniz o odadan nasıl çıkacak bilemiyor musunuz? Editörün içindeki yapay zeka asistanını açın ve durumu sohbet eder gibi anlatın. Asistan size yaratıcı kaçış yolları, alternatif sonlar veya ilginç diyalog fikirleri sunacaktır.
          </Typography>
          <Typography variant="body" className="font-bold text-primary mt-6">AI Sizin Yerinize Yazmaz, Size İlham Verir</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Readixon'daki AI araçları hikayenizi baştan sona yazmak için değil, sizin yaratıcılığınızı tetiklemek için tasarlandı. Detaylı mekan tasvirleri, fantastik dünya kuralları veya yan karakter isimleri isteyerek yazar kaslarınızı güçlendirin. Özgünlüğünüz her zaman korunmalıdır.
          </Typography>
        </div>
      )
    },
    {
      id: 'character-creation',
      title: 'Derinlikli Karakterler',
      summary: 'Gerçekçi ve empati kurulabilir karakter gelişiminin temelleri nelerdir?',
      icon: <Users className="text-primary" size={28} />,
      content: (
        <div className="space-y-4 text-text">
          <Typography variant="body" className="font-bold text-primary">Mükemmel Karakterler Sıkıcıdır</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Okuyucular kusursuz, her şeyi bilen, hiç yenilmeyen (Mary Sue/Gary Stu) karakterlerle bağ kurmakta zorlanır. Karakterinize zayıflıklar, mantıksız korkular, travmalar ve küçük kötü alışkanlıklar verin. Kusurlar karakteri "gerçek bir insan" yapar.
          </Typography>
          <Typography variant="body" className="font-bold text-primary mt-6">Karakterin Motivasyonu (Amacı)</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            "Karakterim ne istiyor ve onu bunu elde etmekten alıkoyan şey ne?" Bu iki sorunun cevabı hikayenizin motorudur. Ana karakterinizin yola çıkış amacı ne kadar net ve karşısındaki engeller ne kadar zorluysa, hikayeniz o kadar sürükleyici olur.
          </Typography>
        </div>
      )
    },
    {
      id: 'plot-pacing',
      title: 'Etkili Kurgu ve Tempo',
      summary: 'Olay örgüsünü canlı tutmak ve okuyucuyu başından sonuna hikayeye bağlamak.',
      icon: <Compass className="text-primary" size={28} />,
      content: (
        <div className="space-y-4 text-text">
          <Typography variant="body" className="font-bold text-primary">Gösterme, Yaşat (Show, Don't Tell)</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Edebiyatın altın kuralıdır. "Ayşe çok üzgündü" yazmak yerine, "Ayşe'nin gözleri doldu, titreyen elleriyle kahve fincanını masaya bıraktı" yazın. Okuyucuya duyguyu dikte etmeyin, o duyguyu hissetmelerini sağlayacak fiziksel tepkileri ve ortamı detaylıca tasvir edin.
          </Typography>
          <Typography variant="body" className="font-bold text-primary mt-6">Kurgusal Dalgalanmalar (Tempo)</Typography>
          <Typography variant="caption" className="text-muted leading-relaxed block text-[15px]">
            Sürekli heyecanlı aksiyon veya sürekli durgun melankoli okuyucuyu yorar. Heyecanlı ve gerilimli bir sahneden sonra, karakterlerin (ve dolayısıyla okuyucunun) nefes alabileceği, daha sakin diyalogların geçtiği huzurlu bölümler ekleyin. Tempo bir roller coaster (hız treni) gibi sürekli inip çıkmalıdır.
          </Typography>
        </div>
      )
    }
  ];

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

  const handleCreateNew = async () => {
    if (!firebaseUser || !newTitle.trim()) return;
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
      router.push(`/studio/story/${newStoryId}`);
    } catch (error) {
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

      {/* Yazar Akademisi (Rehberler) */}
      <div className="mt-20 border-t border-border/50 pt-16 mb-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 shadow-lg shadow-primary/5">
            <Wand2 size={32} className="text-primary" />
          </div>
          <Typography variant="h2" className="font-black text-text mb-2">Yazar Akademisi</Typography>
          <Typography variant="body" className="text-muted max-w-2xl mx-auto">
            İster ilk hikayeni yazıyor ol, ister usta bir yazar ol. İlham verici rehberlerimizle edebi yeteneklerini bir üst seviyeye taşı.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDE_TOPICS.map((topic) => (
            <div 
              key={topic.id}
              onClick={() => setSelectedGuide(topic)}
              className="bg-card border border-border/40 hover:border-primary/40 rounded-3xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 flex flex-col items-start group"
            >
              <div className="bg-primary/5 p-4 rounded-2xl mb-5 group-hover:scale-110 transition-transform">
                {topic.icon}
              </div>
              <Typography variant="h3" className="font-bold text-text mb-2 group-hover:text-primary transition-colors">
                {topic.title}
              </Typography>
              <Typography variant="caption" className="text-muted mb-6 line-clamp-3">
                {topic.summary}
              </Typography>
              <div className="mt-auto flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Rehberi Oku <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

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

            <div className="p-6 border-t border-border/50 bg-muted/5 flex justify-end gap-3 mt-auto">
              <Button variant="outline" onPress={() => setIsModalOpen(false)}>İptal</Button>
              <Button variant="primary" onPress={handleCreateNew} disabled={!newTitle.trim() || isCreating}>
                {isCreating ? 'Oluşturuluyor...' : 'Oluştur ve Düzenle'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Yazar Akademisi Bilgi Modalı */}
      {selectedGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 sm:p-8 pb-6 border-b border-border/30 flex justify-between items-start bg-muted/5">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl shrink-0 mt-1">
                  {selectedGuide.icon}
                </div>
                <div>
                  <Typography variant="caption" className="text-primary font-bold uppercase tracking-widest mb-1 block">YAZAR AKADEMİSİ</Typography>
                  <Typography variant="h2" className="font-black leading-tight text-text">{selectedGuide.title}</Typography>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-2 text-muted hover:text-text rounded-full hover:bg-background transition-colors shrink-0"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-card">
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl mb-8">
                <Typography variant="body" className="font-medium text-text italic">
                  "{selectedGuide.summary}"
                </Typography>
              </div>
              
              <div className="w-full">
                {selectedGuide.content}
              </div>
            </div>

            <div className="p-6 border-t border-border/30 bg-muted/5 flex justify-end">
              <Button variant="primary" onPress={() => setSelectedGuide(null)} className="rounded-full px-8">
                Anladım, Kapat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
