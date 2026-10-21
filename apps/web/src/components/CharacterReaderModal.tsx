'use client';

import React, { useState } from 'react';
import { 
  type Character, 
  type UniverseLocation, 
  type UniverseItem, 
  type Story,
  getCharacterRoleLabel
} from '@readixon/core';
import { 
  X, 
  Sparkles, 
  Lock, 
  Users, 
  Brain, 
  Flame, 
  Zap, 
  Heart, 
  Eye, 
  MapPin, 
  Sword, 
  BookOpen, 
  Image as ImageIcon, 
  GitCommit, 
  HelpCircle, 
  ChevronRight,
  Shield,
  Layers,
  Sparkle,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export interface CharacterReaderModalProps {
  character: Character;
  allCharacters: Character[];
  locations?: UniverseLocation[];
  items?: UniverseItem[];
  stories?: Story[];
  userMaxChapter?: number; // Okurun bu evrendeki en yüksek okuduğu bölüm
  isAuthorView?: boolean;
  onClose: () => void;
  onSelectOtherCharacter: (targetCharacterId: string) => void;
  onShareCharacter?: (char: Character) => void;
}

type CharacterModalTab = 'about' | 'arc' | 'relationships' | 'connections' | 'gallery';

const STAT_LABELS: Record<string, { label: string; icon: React.ElementType; color: string; barColor: string }> = {
  intelligence: { label: 'Zekâ', icon: Brain, color: 'text-sky-400', barColor: 'bg-sky-500' },
  strength: { label: 'Fiziksel Güç', icon: Flame, color: 'text-rose-400', barColor: 'bg-rose-500' },
  agility: { label: 'Çeviklik', icon: Zap, color: 'text-amber-400', barColor: 'bg-amber-500' },
  charisma: { label: 'Karizma', icon: Heart, color: 'text-pink-400', barColor: 'bg-pink-500' },
  empathy: { label: 'Empati', icon: Sparkles, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
};

const ARC_STEP_TITLES: { key: keyof NonNullable<Character['characterArc']>; label: string; order: number }[] = [
  { key: 'startingState', label: '1. Başlangıç Durumu & Statüko', order: 1 },
  { key: 'flawOrLack', label: '2. İçsel Eksiklik & Zaaf', order: 2 },
  { key: 'incitingIncident', label: '3. Tetikleyici Olay & Çağrı', order: 3 },
  { key: 'firstChange', label: '4. İlk Değişim & Sınanma', order: 4 },
  { key: 'majorShift', label: '5. Büyük Kırılma & İnanç Çatışması', order: 5 },
  { key: 'crisis', label: '6. Kriz & Ruhun Karanlık Gecesi', order: 6 },
  { key: 'climaxDecision', label: '7. Zirve Karar & Fedakarlık', order: 7 },
  { key: 'finalState', label: '8. Final Durumu & Yeni Benlik', order: 8 },
];

export const CharacterReaderModal: React.FC<CharacterReaderModalProps> = ({
  character,
  allCharacters,
  locations = [],
  items = [],
  stories = [],
  userMaxChapter = 0,
  isAuthorView = false,
  onClose,
  onSelectOtherCharacter,
  onShareCharacter,
}) => {
  const [activeTab, setActiveTab] = useState<CharacterModalTab>('about');
  const [selectedCostumeIndex, setSelectedCostumeIndex] = useState<number>(-1); // -1: Ana görsel
  const [activeGalleryPreview, setActiveGalleryPreview] = useState<string | null>(null);

  // Kostüm ve galeri görselleri
  const allImages: string[] = [
    character.pngGallery?.transparentPngUrl,
    character.pngGallery?.fullBodyUrl,
    character.avatarUrl,
    character.pngGallery?.portraitUrl,
    ...(character.pngGallery?.alternateCostumeUrls || []),
  ].filter(Boolean) as string[];

  // Benzersiz yap
  const uniqueImages = Array.from(new Set(allImages));

  const currentDisplayImage =
    selectedCostumeIndex >= 0 && character.pngGallery?.alternateCostumeUrls?.[selectedCostumeIndex]
      ? character.pngGallery.alternateCostumeUrls[selectedCostumeIndex]
      : character.pngGallery?.transparentPngUrl ||
        character.pngGallery?.fullBodyUrl ||
        character.avatarUrl ||
        character.pngGallery?.portraitUrl;

  // Spoiler Kontrolü
  const isSecretLoreUnlocked =
    isAuthorView ||
    !character.spoilerThresholdChapter ||
    userMaxChapter >= character.spoilerThresholdChapter;

  // İlişkili karakterleri bul
  const characterRelationships = (character.relationships || []).map((rel) => {
    const target = allCharacters.find((c) => c.id === rel.targetCharacterId);
    return {
      ...rel,
      target,
    };
  });

  // Karakterin sahip olduğu veya bağlı olduğu eşyalar
  const characterItems = items.filter((it) => it.currentOwnerId === character.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* ── ÜST HERO BÖLÜMÜ (3D Vitrin Portresi + Temel Profil) ── */}
        <div className="relative bg-gradient-to-b from-primary/15 via-card/70 to-card border-b border-border/50 p-5 sm:p-7 shrink-0">
          {/* Aksiyon Butonları (Paylaş & Kapat) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
            {onShareCharacter && (
              <button
                type="button"
                onClick={() => onShareCharacter(character)}
                className="px-3 py-1.5 rounded-full bg-card/90 hover:bg-card border border-border/60 hover:border-primary/50 text-xs font-bold text-foreground transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Sosyal Paylaşım Kartı Üret"
              >
                <Share2 size={13} className="text-primary" />
                <span className="hidden sm:inline">Paylaşım Kartı</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-card/80 hover:bg-card border border-border/50 text-muted hover:text-foreground transition-all cursor-pointer"
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-end">
            {/* Karakter Görseli & Kostüm Seçici */}
            <div className="relative w-36 sm:w-44 aspect-[3/4] rounded-2xl bg-gradient-to-t from-background/90 via-background/40 to-transparent border border-border/50 overflow-hidden shrink-0 shadow-xl flex items-center justify-center group">
              {currentDisplayImage ? (
                <img
                  src={currentDisplayImage}
                  alt={character.name}
                  onClick={() => setActiveGalleryPreview(currentDisplayImage)}
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-3xl font-black">
                  {character.name.charAt(0)}
                </div>
              )}

              {/* Kostüm Geçiş Hapları */}
              {character.pngGallery?.alternateCostumeUrls &&
                character.pngGallery.alternateCostumeUrls.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md">
                    <button
                      onClick={() => setSelectedCostumeIndex(-1)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${
                        selectedCostumeIndex === -1
                          ? 'bg-primary text-black font-black'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      Ana
                    </button>
                    {character.pngGallery.alternateCostumeUrls.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCostumeIndex(idx)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${
                          selectedCostumeIndex === idx
                            ? 'bg-primary text-black font-black'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        K#{idx + 1}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Temel Bilgiler */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-xl bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider">
                  {getCharacterRoleLabel(character.role) || 'Karakter'}
                </span>
                {character.gender && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-card/80 border border-border/50 text-muted text-[11px] font-bold">
                    {character.gender}
                  </span>
                )}
                {character.age && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-card/80 border border-border/50 text-muted text-[11px] font-bold">
                    {character.age} Yaşında
                  </span>
                )}
                {character.spoilerThresholdChapter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <Sparkles size={11} /> Keşfedildi (Bölüm #{character.spoilerThresholdChapter})
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-1 tracking-tight">
                {character.name}
              </h2>

              {character.occupation && (
                <p className="text-xs sm:text-sm text-primary/90 font-semibold mb-2">
                  {character.occupation}
                </p>
              )}

              {character.coreMotivation && (
                <p className="text-xs text-muted/90 italic line-clamp-2 max-w-xl mx-auto sm:mx-0">
                  "{character.coreMotivation}"
                </p>
              )}

              {/* RPG Yetkinlik Göstergeleri */}
              {character.rpgStats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 mt-3 border-t border-border/40 max-w-xl">
                  {Object.entries(character.rpgStats).map(([key, val]) => {
                    const cfg = STAT_LABELS[key];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className="bg-background/60 p-2 rounded-xl border border-border/40">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="flex items-center gap-1 text-muted font-bold truncate">
                            <Icon size={11} className={cfg.color} />
                            {cfg.label}
                          </span>
                          <span className="font-black text-foreground">{val}/10</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cfg.barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, (Number(val) || 0) * 10)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SEKMELER (PRD Bölüm 42) ── */}
        <div className="flex items-center gap-2 px-5 sm:px-7 border-b border-border/50 bg-card/40 overflow-x-auto scrollbar-none py-2 shrink-0">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'about'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            Hakkında & Profil
          </button>
          <button
            onClick={() => setActiveTab('arc')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'arc'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <GitCommit size={13} />
            Karakter Arkı (8 Aşama)
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'relationships'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <Users size={13} />
            İlişkiler Ağı ({characterRelationships.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'connections'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <Layers size={13} />
            Mekân & Eserler
          </button>
          {uniqueImages.length > 0 && (
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-muted/10'
              }`}
            >
              <ImageIcon size={13} />
              Galeri ({uniqueImages.length})
            </button>
          )}
        </div>

        {/* ── İÇERİK GÖVDESİ ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* 1. HAKKINDA & PROFİL SEKME */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Fiziksel Görünüm */}
              <div className="bg-card/60 p-4 sm:p-5 rounded-2xl border border-border/50 space-y-3">
                <h4 className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Shield size={14} /> Fiziksel Özellikler & Profil
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-background/50 p-2.5 rounded-xl border border-border/40">
                    <span className="text-muted block text-[10px]">Vücut Yapısı</span>
                    <span className="font-bold text-foreground">{character.bodyType || 'Belirtilmedi'}</span>
                  </div>
                  <div className="bg-background/50 p-2.5 rounded-xl border border-border/40">
                    <span className="text-muted block text-[10px]">Göz Rengi</span>
                    <span className="font-bold text-foreground">{character.eyeColor || 'Belirtilmedi'}</span>
                  </div>
                  <div className="bg-background/50 p-2.5 rounded-xl border border-border/40">
                    <span className="text-muted block text-[10px]">Saç Rengi / Tarzı</span>
                    <span className="font-bold text-foreground">{character.hairColor || 'Belirtilmedi'}</span>
                  </div>
                  <div className="bg-background/50 p-2.5 rounded-xl border border-border/40">
                    <span className="text-muted block text-[10px]">Giyim Tarzı</span>
                    <span className="font-bold text-foreground">{character.clothingStyle || 'Belirtilmedi'}</span>
                  </div>
                </div>

                {character.distinguishingFeatures && (
                  <div className="bg-background/50 p-3 rounded-xl border border-border/40 text-xs">
                    <span className="text-muted block text-[10px] mb-0.5">Ayırt Edici İzler & Özellikler</span>
                    <p className="text-foreground leading-relaxed">{character.distinguishingFeatures}</p>
                  </div>
                )}
              </div>

              {/* Psikolojik Profil */}
              <div className="bg-card/60 p-4 sm:p-5 rounded-2xl border border-border/50 space-y-3">
                <h4 className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Brain size={14} /> Psikolojik Derinlik
                </h4>

                {/* Kişilik Etiketleri */}
                {character.personalityTraits && character.personalityTraits.length > 0 && (
                  <div>
                    <span className="text-muted block text-[10px] mb-1.5 font-bold">Kişilik Özellikleri</span>
                    <div className="flex flex-wrap gap-1.5">
                      {character.personalityTraits.map((trait, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
                        >
                          #{trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {character.greatestFear && (
                    <div className="bg-background/50 p-3 rounded-xl border border-border/40">
                      <span className="text-rose-400 block text-[10px] font-bold mb-0.5">En Büyük Korkusu</span>
                      <p className="text-foreground leading-relaxed">{character.greatestFear}</p>
                    </div>
                  )}
                  {character.secretDesire && (
                    <div className="bg-background/50 p-3 rounded-xl border border-border/40">
                      <span className="text-amber-400 block text-[10px] font-bold mb-0.5">Gizli Arzusu / Tutkusu</span>
                      <p className="text-foreground leading-relaxed">{character.secretDesire}</p>
                    </div>
                  )}
                </div>

                {character.flaws && (
                  <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/20 text-xs">
                    <span className="text-rose-400 block text-[10px] font-bold mb-0.5">Zaaf & Kusurları</span>
                    <p className="text-foreground leading-relaxed">{character.flaws}</p>
                  </div>
                )}
              </div>

              {/* Okuyucu Notları (Reader Notes) */}
              {character.readerNotes && (
                <div className="bg-card/60 p-4 sm:p-5 rounded-2xl border border-border/50 space-y-1.5">
                  <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                    Evren Defteri Notu
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {character.readerNotes}
                  </p>
                </div>
              )}

              {/* Yazar Notları & Gizli Lore (Spoiler Koruma Mekaniği) */}
              {character.secretLore && (
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSecretLoreUnlocked
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-muted/10 border-border/40'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} /> Karakterin Gizli Sırrı (Secret Lore)
                    </h4>
                    {!isSecretLoreUnlocked && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Lock size={10} /> Bölüm #{character.spoilerThresholdChapter} Kilitli
                      </span>
                    )}
                  </div>

                  {isSecretLoreUnlocked ? (
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {character.secretLore}
                    </p>
                  ) : (
                    <div className="py-4 text-center space-y-1">
                      <p className="text-xs text-muted">
                        Bu karakterin gizli geçmişi ve sırları kurgusal spoiler koruması altındadır.
                      </p>
                      <p className="text-[11px] text-amber-400/90 font-bold">
                        Bölüm {character.spoilerThresholdChapter}'i okuduğunuzda bu mühür açılacaktır.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. KARAKTER ARKI SEKME (8 AŞAMA) */}
          {activeTab === 'arc' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-muted leading-relaxed">
                Bu karakterin hikâye boyunca yaşadığı içsel kırılmalar, inanç dönüşümleri ve nihai kader eğrisi aşağıda listelenmiştir.
              </div>

              {!character.characterArc ? (
                <div className="text-center py-12 text-muted text-xs">
                  Bu karakter için henüz 8 aşamalı ark detayları doldurulmamış.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
                  {ARC_STEP_TITLES.map((step) => {
                    const stepValue = character.characterArc?.[step.key];
                    if (!stepValue) return null;

                    // Final aşamaları (5+) için spoiler koruması: Eğer okur henüz o bölüme gelmediyse
                    const isStepSecret =
                      !isSecretLoreUnlocked && step.order >= 6 && character.spoilerThresholdChapter;

                    return (
                      <div key={step.key} className="relative pl-9 group">
                        {/* Nokta İkonu */}
                        <div className="absolute left-2 top-3 -translate-x-1/2 w-4 h-4 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all ${
                          isStepSecret
                            ? 'bg-muted/10 border-border/30 opacity-75'
                            : 'bg-card/70 border-border/50 hover:border-primary/40'
                        }`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-foreground">
                              {step.label}
                            </span>
                            {isStepSecret && (
                              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                                <Lock size={10} /> Spoiler Korumalı
                              </span>
                            )}
                          </div>

                          {isStepSecret ? (
                            <p className="text-xs text-muted italic">
                              Bu aşama hikâyenin zirve bölümlerini içerir. İlgili bölümleri okudukça açılacaktır.
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                              {stepValue}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. İLİŞKİLER AĞI SEKME */}
          {activeTab === 'relationships' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {characterRelationships.length === 0 ? (
                <div className="text-center py-12 text-muted text-xs">
                  Bu karaktere ait henüz tanımlı bir ilişki bağı bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {characterRelationships.map((rel, idx) => {
                    const isRelSecret = rel.isSecret && !isSecretLoreUnlocked;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (rel.targetCharacterId && !isRelSecret) {
                            onSelectOtherCharacter(rel.targetCharacterId);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          isRelSecret
                            ? 'bg-muted/10 border-border/30 opacity-75 cursor-not-allowed'
                            : 'bg-card/70 border-border/50 hover:border-primary/40 hover:bg-card cursor-pointer group shadow-xs'
                        }`}
                      >
                        {/* Hedef Karakter Avatarı */}
                        <div className="w-12 h-12 rounded-xl bg-background border border-border/50 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                          {rel.target?.avatarUrl || rel.targetCharacterAvatar ? (
                            <img
                              src={rel.target?.avatarUrl || rel.targetCharacterAvatar}
                              alt={rel.targetCharacterName || 'Hedef Karakter'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Users size={20} className="text-primary/70" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {isRelSecret ? 'Gizli Karakter' : rel.target?.name || rel.targetCharacterName || 'Bilinmeyen'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {rel.relationshipType}
                            </span>
                          </div>

                          {isRelSecret ? (
                            <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                              <Lock size={10} /> Gizli ilişki — İlerleyen bölümlerde keşfedilecek
                            </p>
                          ) : (
                            rel.description && (
                              <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                                {rel.description}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. MEKÂN & ESER BAĞLANTILARI SEKME */}
          {activeTab === 'connections' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Bağlı Olduğu Eşyalar & Teçhizat */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Sword size={14} /> Sahip Olduğu Eşyalar & Artefaktlar
                </h4>

                {characterItems.length === 0 ? (
                  <p className="text-xs text-muted">Bu karaktere atanmış özel bir eşya bulunmuyor.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {characterItems.map((it) => (
                      <div key={it.id} className="p-3.5 rounded-2xl bg-card/60 border border-border/50 flex items-center gap-3">
                        {it.imageUrl ? (
                          <img src={it.imageUrl} alt={it.name} className="w-11 h-11 rounded-xl object-cover border border-border/50 shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Sword size={18} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-foreground block truncate">{it.name}</span>
                          <span className="text-[10px] text-muted block capitalize">{it.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Göründüğü Eserler (Kitaplar) */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <h4 className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} /> Bu Karakterin Yer Aldığı Eserler
                </h4>

                {stories.length === 0 ? (
                  <p className="text-xs text-muted">Bu evrene bağlı yayınlanmış eser bulunmuyor.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stories.map((st) => (
                      <Link
                        key={st.storyId}
                        href={`/story/${st.storyId}`}
                        className="p-3.5 rounded-2xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-14 rounded-lg bg-background border border-border/50 overflow-hidden shrink-0">
                            {st.coverImage ? (
                              <img src={st.coverImage} alt={st.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted">
                                <BookOpen size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block truncate">
                              {st.title}
                            </span>
                            <span className="text-[10px] text-muted block">
                              {st.stats?.chapterCount || 0} Bölüm • {st.status === 'completed' ? 'Tamamlandı' : 'Yayında'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors shrink-0 ml-2" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. GALERİ SEKME */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {uniqueImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveGalleryPreview(imgUrl)}
                    className="aspect-[3/4] rounded-2xl bg-background/80 border border-border/50 overflow-hidden cursor-zoom-in group relative shadow-sm hover:border-primary/50 transition-all"
                  >
                    <img
                      src={imgUrl}
                      alt={`${character.name} Çizim ${idx + 1}`}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Büyüt
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── BÜYÜK GÖRSEL LIGHTBOX ── */}
        {activeGalleryPreview && (
          <div
            onClick={() => setActiveGalleryPreview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200"
          >
            <button
              onClick={() => setActiveGalleryPreview(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-card/80 text-white hover:bg-card transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <img
              src={activeGalleryPreview}
              alt={character.name}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl filter drop-shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};
