'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  type UniverseDivinationSystem, 
  type UniverseDivinationCard, 
  type UniverseProphecy 
} from '@readixon/core';
import { 
  X, 
  Sparkles, 
  Compass, 
  RotateCw, 
  Share2, 
  Copy, 
  Check, 
  Layers, 
  Moon, 
  Eye, 
  Flame, 
  Zap, 
  Shield 
} from 'lucide-react';
import { toast } from 'sonner';

export interface UniverseDivinationCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  universeTitle: string;
  divinations: UniverseDivinationSystem[];
  prophecies?: UniverseProphecy[];
}

// Varsayılan Kadim Kartlar (Eğer yazar henüz özel kart destesi eklemediyse kullanılır)
const DEFAULT_MYSTIC_CARDS: UniverseDivinationCard[] = [
  {
    id: 'default_1',
    name: 'Gölge Kurdu',
    symbolIcon: '🐺',
    elementOrSuit: 'Karanlık / Ruh',
    meaning: 'Sadakat, içgüdüsel uyanış ve yaklaşan tehlikeye karşı uyanık olma çağrısı.',
    reversedMeaning: 'Yalnızlaşma, çevrendekilere duyulan asılsız şüphe ve yanlış müttefik seçimi.',
    prophecyText: 'Sessizlik içinde yürüyenler en derin izi bırakır. Ormanın fısıltısına kulak ver, dost bildiğin gölge sınanacak.',
  },
  {
    id: 'default_2',
    name: 'Kızıl Ay',
    symbolIcon: '🌙',
    elementOrSuit: 'Ateş / Gökyüzü',
    meaning: 'Büyük dönüşüm, gizli sırların açığa çıkışı ve kaderin dönüm noktası.',
    reversedMeaning: 'Bastırılmış öfke, aldatıcı yanılsamalar ve acele verilmiş yıkıcı kararlar.',
    prophecyText: 'Gökyüzü kızıla büründüğünde mühürler kırılır; kaçtığın gerçek kapını çalacaktır.',
  },
  {
    id: 'default_3',
    name: 'Kırık Kılıç',
    symbolIcon: '🗡️',
    elementOrSuit: 'Metal / Savaş',
    meaning: 'Eski bir savaşın sonu, onur ve yıkıntılardan yeni bir güç doğuşu.',
    reversedMeaning: 'Yenilgiyi kabullenememe, gurur yüzünden kaybedilen fırsatlar.',
    prophecyText: 'Kırılan çelik yeniden dövülebilir; fakat zayıf irade ateşten sağ çıkamaz.',
  },
  {
    id: 'default_4',
    name: 'Kadim Bilge',
    symbolIcon: '🧙‍♂️',
    elementOrSuit: 'Zaman / Bilgi',
    meaning: 'Sabır, unutulmuş kadim öğretilerin keşfi ve rehberlik.',
    reversedMeaning: 'Kibirli bilgiçlik, nasihatlere kulak tıkama ve içsel körlük.',
    prophecyText: 'Cevaplar rüzgarda değil, unuttuğun köklerinde saklıdır. Dinlemeyi bilene taşlar bile konuşur.',
  },
  {
    id: 'default_5',
    name: 'Uçurum Rünü',
    symbolIcon: 'ᚱ',
    elementOrSuit: 'Boşluk / Kader',
    meaning: 'Bilinmeyene doğru cesur bir adım, güven sıçraması ve köklü değişim.',
    reversedMeaning: 'Dikkatsizlik, uçurumun kenarında tereddüt ve gereksiz riskler.',
    prophecyText: 'Aşağıya baktığında uçurum da sana bakar. Kanatların yoksa bile düşüşten korkma.',
  },
  {
    id: 'default_6',
    name: 'Kader Çarkı',
    symbolIcon: '☸️',
    elementOrSuit: 'Kozmos / Döngü',
    meaning: 'Talihin yön değiştirmesi, yeni bir döngünün başlangıcı ve beklenmedik fırsatlar.',
    reversedMeaning: 'Şanssızlık dönemi, akıntıya karşı kürek çekmek ve gecikmeler.',
    prophecyText: 'Zirvede olan aşağı inecek, dipte olan göğe yükselecektir. Zamanın çarkı kimseyi beklemez.',
  },
  {
    id: 'default_7',
    name: 'Yanan Kadeh',
    symbolIcon: '🏆',
    elementOrSuit: 'Su & Ateş / Tutku',
    meaning: 'İlham, tutkulu bir aşk, fedakarlık ve arınma.',
    reversedMeaning: 'Aşırıya kaçma, zehirli bağlılıklar ve tükenmişlik.',
    prophecyText: 'Kadehteki alevi söndürmeden içebilenler ölümsüz bir amaca kavuşur.',
  },
  {
    id: 'default_8',
    name: 'Gözsüz Kahin',
    symbolIcon: '👁️',
    elementOrSuit: 'Durugörü / Işık',
    meaning: 'Görünmeyeni sezme, rüyaların gücü ve sezgisel netlik.',
    reversedMeaning: 'Aldatılma, yanlış vizyonlar ve gerçeklikten kopuş.',
    prophecyText: 'Gözlerini kapat ki hakikati görebilesin. En karanlık gecede bile yıldızların yolu bellidir.',
  },
];

export function UniverseDivinationCardModal({
  isOpen,
  onClose,
  universeTitle,
  divinations,
  prophecies = [],
}: UniverseDivinationCardModalProps) {
  // Seçili deste / sistem
  const [selectedDivId, setSelectedDivId] = useState<string>('all');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentCard, setCurrentCard] = useState<UniverseDivinationCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mevcut sistemin kart havuzu
  const activeCards = useMemo(() => {
    if (selectedDivId === 'all') {
      const allCustomCards = divinations.flatMap((d) => d.cardsOrSymbols || []);
      return allCustomCards.length > 0 ? allCustomCards : DEFAULT_MYSTIC_CARDS;
    }
    const targetSys = divinations.find((d) => d.id === selectedDivId);
    if (targetSys?.cardsOrSymbols && targetSys.cardsOrSymbols.length > 0) {
      return targetSys.cardsOrSymbols;
    }
    return DEFAULT_MYSTIC_CARDS;
  }, [divinations, selectedDivId]);

  const hasAuthorCards = useMemo(() => {
    return divinations.some((d) => (d.cardsOrSymbols?.length || 0) > 0);
  }, [divinations]);

  // Rastgele Kart Çek
  const handleDrawCard = () => {
    setIsShuffling(true);
    setIsFlipped(false);

    setTimeout(() => {
      const pool = activeCards;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const picked = pool[randomIndex];
      // %25 ihtimalle ters açılma
      const reversed = Math.random() < 0.25;

      setCurrentCard(picked);
      setIsReversed(reversed);
      setIsShuffling(false);

      // Kartı çevir
      setTimeout(() => {
        setIsFlipped(true);
      }, 150);
    }, 450);
  };

  useEffect(() => {
    if (isOpen) {
      // Modal açıldığında ilk kartı otomatik çek
      handleDrawCard();
    } else {
      setIsFlipped(false);
      setCurrentCard(null);
    }
  }, [isOpen, selectedDivId]);

  const handleCopyProphecy = () => {
    if (!currentCard) return;
    const cardStateStr = isReversed ? 'Ters (Gölge)' : 'Düz (Işık)';
    const textToCopy = `🔮 ${universeTitle} Evreni — Günün Kehaneti\n\n🃏 Kart: ${currentCard.name} [${cardStateStr}]\n✨ Element: ${currentCard.elementOrSuit || 'Mistik'}\n📜 Kehanet: ${currentCard.prophecyText || currentCard.meaning}\n\nReadixon'da keşfet!`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Günün kehaneti panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-card/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full my-6 shadow-2xl space-y-6 overflow-hidden">
        {/* Arka plan parıltıları */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ── Üst Başlık ── */}
        <div className="relative z-10 flex items-start justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles size={11} className="text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Mistik Fal & Kehanet</span>
              </span>
              {hasAuthorCards && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Özel Evren Destesi
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-foreground tracking-tight">
              {universeTitle} Kehanet Çarkı
            </h3>
            <p className="text-xs text-muted">
              Evrenin kader dokusundan sana özel fısıldanan kadim mesaj.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-background/80 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Deste Seçici (Birden fazla fal sistemi varsa) ── */}
        {divinations.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-bold shrink-0">Deste:</span>
            <select
              value={selectedDivId}
              onChange={(e) => setSelectedDivId(e.target.value)}
              className="bg-background/60 border border-border/60 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tüm Kartlar & Semboller</option>
              {divinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.cardsOrSymbols?.length || 0} kart)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── 3D FLIP KART ALANI ── */}
        <div className="flex flex-col items-center justify-center py-4">
          <div
            onClick={!isShuffling ? handleDrawCard : undefined}
            className="relative w-64 h-96 cursor-pointer select-none group perspective-1000"
            title="Yeni kart çekmek için tıkla"
          >
            <div
              className={`w-full h-full duration-700 transition-transform transform-gpu preserve-3d rounded-3xl shadow-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              } ${isShuffling ? 'scale-95 blur-[1px]' : 'hover:scale-[1.02]'}`}
            >
              {/* KARTIN ARKASI (Back Face) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/50 p-4 flex flex-col items-center justify-between shadow-2xl overflow-hidden">
                <div className="w-full flex justify-between text-purple-400/40 text-xs font-serif">
                  <span>✦ ᚱ ✦</span>
                  <span>✦ ᛏ ✦</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-full border-2 border-purple-500/40 bg-purple-900/30 flex items-center justify-center text-3xl shadow-inner shadow-purple-500/20 animate-pulse">
                    🔮
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-black tracking-widest uppercase text-purple-300">
                      Kader Kapısı
                    </span>
                    <p className="text-[11px] text-purple-200/60 font-serif">
                      Dokun ve Kehaneti Çöz
                    </p>
                  </div>
                </div>

                <div className="w-full flex justify-between text-purple-400/40 text-xs font-serif">
                  <span>✦ ᚠ ✦</span>
                  <span>✦ ᛋ ✦</span>
                </div>
              </div>

              {/* KARTIN ÖNÜ (Front Face — Açılan Kehanet) */}
              <div
                className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-5 flex flex-col justify-between shadow-2xl border-2 ${
                  isReversed
                    ? 'bg-gradient-to-br from-rose-950/90 via-slate-900 to-slate-950 border-rose-500/50'
                    : 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950 border-purple-500/50'
                }`}
              >
                {/* Üst Bilgi: Başlık & Durum */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted text-[10px] tracking-wider uppercase">
                    {currentCard?.elementOrSuit || 'Mistik Güç'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      isReversed
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isReversed ? 'Ters (Gölge)' : 'Düz (Işık)'}
                  </span>
                </div>

                {/* Orta Sembol & Kart Adı */}
                <div className="flex flex-col items-center justify-center text-center space-y-2.5 my-auto">
                  <div
                    className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg border ${
                      isReversed
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 rotate-180'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    }`}
                  >
                    {currentCard?.symbolIcon || '🎴'}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-foreground">
                      {currentCard?.name}
                    </h4>
                    <p className="text-[11px] text-muted italic line-clamp-2 px-2 mt-0.5">
                      {isReversed && currentCard?.reversedMeaning
                        ? currentCard.reversedMeaning
                        : currentCard?.meaning}
                    </p>
                  </div>
                </div>

                {/* Alt: Kehanet Sözü */}
                <div
                  className={`p-2.5 rounded-xl text-center text-xs font-serif italic leading-relaxed border ${
                    isReversed
                      ? 'bg-rose-950/40 text-rose-200 border-rose-500/20'
                      : 'bg-purple-950/40 text-purple-200 border-purple-500/20'
                  }`}
                >
                  &ldquo;{currentCard?.prophecyText || currentCard?.meaning}&rdquo;
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted mt-3 flex items-center gap-1.5 animate-pulse">
            <Sparkles size={12} className="text-purple-400" />
            Kartın üzerine tıklayarak yeni bir kehanet çekebilirsin
          </p>
        </div>

        {/* ── Butonlar & Aksiyonlar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
          <button
            onClick={handleCopyProphecy}
            className="px-4 py-2 rounded-xl bg-card border border-border/60 hover:border-purple-500/40 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Kopyalandı' : 'Kehaneti Kopyala'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDrawCard}
              disabled={isShuffling}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
            >
              <RotateCw size={13} className={isShuffling ? 'animate-spin' : ''} />
              <span>Yeniden Fal Aç</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-card hover:bg-card/80 text-muted hover:text-foreground text-xs font-semibold"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
