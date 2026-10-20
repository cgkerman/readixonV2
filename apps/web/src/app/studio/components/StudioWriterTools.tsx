'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Dices, 
  PenTool, 
  BookOpen, 
  Gamepad2, 
  Feather, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Copy, 
  Check, 
  Trash2,
  Lightbulb,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface StudioWriterToolsProps {
  storiesCount: number;
  onOpenCreateStory: (initialTitle?: string, initialFormat?: 'novel' | 'interactive' | 'short_story' | 'chat') => void;
}

// Yaratıcı "Saksı Zamanı" Fikir Tohumları
const CREATIVE_SPARKS = [
  {
    title: 'Bilinmeyen Numara: 03:14',
    genre: 'Korku / Gerilim',
    format: 'chat' as const,
    pitch: 'Gece yarısı gelen "Işıkları kapat ve arkana bakma" mesajı ve odanın içinde çalan ikinci bir gizli telefon.',
  },
  {
    title: 'Son Hatıra Satıcısı',
    genre: 'Bilim Kurgu',
    format: 'novel' as const,
    pitch: 'İnsanların acı verici anılarını satın alıp şişeleyen bir tüccar, bir gün kendi çocukluğuna ait mühürlü bir hatırayla karşılaşır.',
  },
  {
    title: 'Kayıp Haritanın Gardiyanı',
    genre: 'Fantastik',
    format: 'novel' as const,
    pitch: 'Gök adalarında yaşayan bir haritacı, çizdiği yeni adaların ertesi gün gökyüzünde gerçekten belirdiğini fark eder.',
  },
  {
    title: 'Geceyarısı Kararları',
    genre: 'Gizem & Gerilim',
    format: 'interactive' as const,
    pitch: 'Terk edilmiş bir tren garında mahsur kalan 5 yabancı. Her vagon farklı bir sır ve ölümcül bir seçim saklıyor. Seçim senin!',
  },
  {
    title: 'Kahve Kokulu Son Mektup',
    genre: 'Dram / Romantik',
    format: 'short_story' as const,
    pitch: 'İstanbul\'un eski bir sahafında kitabın arasından çıkan 40 yıllık imzasız bir mektup ve onu sahibine ulaştırmaya çalışan bir genç.',
  },
  {
    title: 'Yankı Duvarı',
    genre: 'Distopya',
    format: 'novel' as const,
    pitch: 'Yalan söylemenin fiziksel olarak taşlaşmaya neden olduğu bir dünyada, konuşamayan bir kız gerçeğin fısıltılarını duyar.',
  },
  {
    title: 'Lanetli Satranç Maçı',
    genre: 'Korku / Gerilim',
    format: 'interactive' as const,
    pitch: 'Kaybettiğin her taş gerçek hayatta bir şeyini eksiltiyor. Son hamleyi kim yapacak?',
  },
  {
    title: 'Yağmur Bekçisi',
    genre: 'Büyülü Gerçekçilik',
    format: 'short_story' as const,
    pitch: 'Kasabada yalnızca belirli insanların gözyaşı döktüğü günlerde yağmur yağar. Yağmur bekçisinin görevi ise kimseyi ağlatmamaktır.',
  },
  {
    title: 'Zaman Hırsızının Çırağı',
    genre: 'Fantastik / Macera',
    format: 'novel' as const,
    pitch: 'İnsanların boşa harcadığı dakikaları çalıp zenginlere satan bir lonca ve zamanını geri isteyen genç bir saat tamircisi.',
  },
];

export const StudioWriterTools: React.FC<StudioWriterToolsProps> = ({
  storiesCount,
  onOpenCreateStory,
}) => {
  // Saksı Zamanı Prompt Durumu
  const [promptIndex, setPromptIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  // Karalama Defteri (LocalStorage)
  const [scratchpad, setScratchpad] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Rastgele ilk ilham
    setPromptIndex(Math.floor(Math.random() * CREATIVE_SPARKS.length));

    // Kayıtlı notları yükle
    try {
      const savedNote = localStorage.getItem('readixon_studio_scratchpad');
      if (savedNote) setScratchpad(savedNote);
    } catch {
      // LocalStorage hatası yok say
    }
  }, []);

  const handleRollPrompt = () => {
    setIsRolling(true);
    setTimeout(() => {
      setPromptIndex((prev) => (prev + 1) % CREATIVE_SPARKS.length);
      setIsRolling(false);
    }, 250);
  };

  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setScratchpad(val);
    try {
      localStorage.setItem('readixon_studio_scratchpad', val);
    } catch {
      // ignore
    }
  };

  const handleCopyScratchpad = () => {
    if (!scratchpad) return;
    navigator.clipboard.writeText(scratchpad);
    setCopied(true);
    toast.success('Notunuz panoya kopyalandı.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearScratchpad = () => {
    if (confirm('Karalama notunuzu temizlemek istediğinize emin misiniz?')) {
      setScratchpad('');
      try {
        localStorage.removeItem('readixon_studio_scratchpad');
      } catch {
        // ignore
      }
      toast.info('Not temizlendi.');
    }
  };

  const currentSpark = CREATIVE_SPARKS[promptIndex];

  return (
    <div className="space-y-6 sm:space-y-8 mb-8">
      {/* ── DURUM 1: HENÜZ HİKAYESİ OLMAYAN YAZARLAR İÇİN HIZLI BAŞLANGIÇ YOL HARİTASI ── */}
      {storiesCount === 0 && (
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7 relative overflow-hidden shadow-lg shadow-primary/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles size={13} />
                <span>Yazarın Yol Haritası</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Readixon Stüdyo'ya Hoş Geldiniz!
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
                Boş sayfa korkusunu bir kenara bırakın. 3 farklı formatta dilediğiniz gibi eser üretebilir, karakterlerinizi kurgulayabilir ve hemen yazmaya başlayabilirsiniz.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenCreateStory()}
              className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all shrink-0 flex items-center gap-2"
            >
              <PenTool size={16} />
              <span>İlk Hikayeni Başlat</span>
            </button>
          </div>

          {/* 4 Yazım Formatı Seçeneği */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {/* Roman */}
            <div 
              onClick={() => onOpenCreateStory(undefined, 'novel')}
              className="p-4 rounded-2xl bg-card/80 border border-border/60 hover:border-primary/50 transition-all cursor-pointer group hover:-translate-y-0.5 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen size={20} />
              </div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Klasik Roman
              </h4>
              <p className="text-xs text-muted mt-1 leading-snug">
                Bölüm bölüm ilerleyen, serbest Word modu ve zengin blok editörüyle uzun soluklu kurgular.
              </p>
            </div>

            {/* Mesaj Hikayesi */}
            <div 
              onClick={() => onOpenCreateStory(undefined, 'chat')}
              className="p-4 rounded-2xl bg-card/80 border border-border/60 hover:border-emerald-500/50 transition-all cursor-pointer group hover:-translate-y-0.5 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MessageSquare size={20} />
              </div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                Mesaj Hikayesi
              </h4>
              <p className="text-xs text-muted mt-1 leading-snug">
                WhatsApp konuşması gibi akan, okuyucu dokundukça açılan bağımlılık yapıcı sohbet kurguları.
              </p>
            </div>

            {/* CYOA İnteraktif */}
            <div 
              onClick={() => onOpenCreateStory(undefined, 'interactive')}
              className="p-4 rounded-2xl bg-card/80 border border-border/60 hover:border-indigo-500/50 transition-all cursor-pointer group hover:-translate-y-0.5 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Gamepad2 size={20} />
              </div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors">
                Kaderini Sen Seç
              </h4>
              <p className="text-xs text-muted mt-1 leading-snug">
                Okuyucunun seçimleriyle dallanan yollar, çoklu sonlar ve Bandersnatch tarzı interaktif macera.
              </p>
            </div>

            {/* Kısa Hikaye */}
            <div 
              onClick={() => onOpenCreateStory(undefined, 'short_story')}
              className="p-4 rounded-2xl bg-card/80 border border-border/60 hover:border-amber-500/50 transition-all cursor-pointer group hover:-translate-y-0.5 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Feather size={20} />
              </div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                Kısa Hikaye (Tek Solukta)
              </h4>
              <p className="text-xs text-muted mt-1 leading-snug">
                Planlamaya boğulmadan tek bir bölümde hayat bulan, anında yazılıp okunan kompakt bağımsız öyküler.
              </p>
            </div>
          </div>

          {/* 4 Adımlı İlerleme Rehberi */}
          <div className="pt-4 border-t border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted font-medium">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">1</span>
              <span>Format Seçimi</span>
            </div>
            <div className="flex items-center gap-2 text-muted font-medium">
              <span className="w-5 h-5 rounded-full bg-muted/20 text-muted font-bold flex items-center justify-center text-[10px]">2</span>
              <span>Karakter & Evren</span>
            </div>
            <div className="flex items-center gap-2 text-muted font-medium">
              <span className="w-5 h-5 rounded-full bg-muted/20 text-muted font-bold flex items-center justify-center text-[10px]">3</span>
              <span>Bölüm Yazımı</span>
            </div>
            <div className="flex items-center gap-2 text-muted font-medium">
              <span className="w-5 h-5 rounded-full bg-muted/20 text-muted font-bold flex items-center justify-center text-[10px]">4</span>
              <span>Kapak & Yayın</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SAKSI ZAMANI & KARALAMA ALANI (İKİLİ GRID) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sol Kolon: Saksı Zamanı / Kurgu Kıvılcımı (7 Kolon) */}
        <div className="lg:col-span-7 rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block leading-none">
                    Saksı Zamanı
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground mt-0.5">
                    Günün Kurgu Kıvılcımı
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRollPrompt}
                className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted/20 border border-border/50 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="Yeni bir fikir tohumu fırlat"
              >
                <Dices size={15} className={`text-amber-500 ${isRolling ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yeni İlham</span>
              </button>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-background/50 border border-border/40 my-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {currentSpark.genre}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/20 text-muted">
                  {currentSpark.format === 'short_story' ? 'Kısa Hikaye' : currentSpark.format === 'chat' ? 'Mesaj Hikayesi' : currentSpark.format === 'interactive' ? 'İnteraktif' : 'Roman'}
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-1">
                "{currentSpark.title}"
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {currentSpark.pitch}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
            <span className="text-[11px] text-muted">
              İlham geldi mi? Hemen bu taslakla başla:
            </span>

            <button
              type="button"
              onClick={() => onOpenCreateStory(currentSpark.title, currentSpark.format)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              <span>Bu Fikirle Başlat</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Sağ Kolon: Hızlı Karalama Defteri / Scratchpad (5 Kolon) */}
        <div className="lg:col-span-5 rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <PenTool size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted block leading-none">
                    Hızlı Karalama
                  </span>
                  <h3 className="font-bold text-sm text-foreground mt-0.5">
                    Yazar Not Defteri
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {scratchpad && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyScratchpad}
                      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
                      title="Notu kopyala"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearScratchpad}
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Notu temizle"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative mt-2">
              <textarea
                value={scratchpad}
                onChange={handleScratchpadChange}
                placeholder="Aklına gelen o repliği, sahneyi veya karakter fikrini buraya karala... (Tarayıcında otomatik saklanır)"
                rows={4}
                className="w-full bg-background/50 border border-border/40 rounded-2xl p-3 text-xs text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/50 resize-none transition-colors leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-500" />
              <span>Otomatik kaydediliyor</span>
            </span>
            <Link
              href="/studio/academy"
              className="text-primary hover:underline font-bold inline-flex items-center gap-1"
            >
              <GraduationCap size={12} />
              <span>Yazar Akademisi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
