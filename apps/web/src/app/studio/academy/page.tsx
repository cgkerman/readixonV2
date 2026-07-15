'use client';

import React, { useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { BookOpen, FileText, Sparkles, Users, Compass, ChevronRight, X, Wand2 } from 'lucide-react';

export default function WriterAcademyPage() {
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

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 shadow-lg shadow-primary/5">
          <Wand2 size={32} className="text-primary" />
        </div>
        <Typography variant="h1" className="font-black text-text mb-2">Yazar Akademisi</Typography>
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
