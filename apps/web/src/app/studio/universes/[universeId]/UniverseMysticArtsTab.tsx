'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Button } from '@readixon/ui';
import {
  type UniverseDivinationSystem,
  type UniverseDivinationCard,
  type UniverseProphecy,
  type UniverseSpell,
  type UniverseRitual,
  type DivinationType,
  type ProphecyStatus,
  type SpellTier,
  DIVINATION_TYPE_LABELS,
  PROPHECY_STATUS_LABELS,
  SPELL_TIER_LABELS,
  getUniverseDivinations,
  createUniverseDivination,
  updateUniverseDivination,
  deleteUniverseDivination,
  getUniverseProphecies,
  createUniverseProphecy,
  updateUniverseProphecy,
  deleteUniverseProphecy,
  getUniverseSpells,
  createUniverseSpell,
  updateUniverseSpell,
  deleteUniverseSpell,
  getUniverseRituals,
  createUniverseRitual,
  updateUniverseRitual,
  deleteUniverseRitual,
} from '@readixon/core';
import {
  Sparkles,
  Eye,
  Scroll,
  Flame,
  Plus,
  Edit3,
  Trash2,
  X,
  Layers,
  Wand2,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Shield,
  BookOpen,
  Compass,
  Moon,
  Search,
  Filter,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface UniverseMysticArtsTabProps {
  universeId: string;
  isAuthorized?: boolean;
  onCountChange?: (count: number) => void;
}

type MysticSubTab = 'divinations' | 'spells' | 'rituals';

export function UniverseMysticArtsTab({
  universeId,
  isAuthorized = true,
  onCountChange,
}: UniverseMysticArtsTabProps) {
  const [subTab, setSubTab] = useState<MysticSubTab>('divinations');
  const [loading, setLoading] = useState(true);

  // Veri Listeleri
  const [divinations, setDivinations] = useState<UniverseDivinationSystem[]>([]);
  const [prophecies, setProphecies] = useState<UniverseProphecy[]>([]);
  const [spells, setSpells] = useState<UniverseSpell[]>([]);
  const [rituals, setRituals] = useState<UniverseRitual[]>([]);

  // Filtreler & Arama
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpellTier, setSelectedSpellTier] = useState<string>('all');
  const [selectedDivType, setSelectedDivType] = useState<string>('all');

  // Modallar
  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  const [editingDiv, setEditingDiv] = useState<UniverseDivinationSystem | null>(null);

  const [isProphecyModalOpen, setIsProphecyModalOpen] = useState(false);
  const [editingProphecy, setEditingProphecy] = useState<UniverseProphecy | null>(null);

  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState<UniverseSpell | null>(null);

  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [editingRitual, setEditingRitual] = useState<UniverseRitual | null>(null);

  // Form State: Divination
  const [divName, setDivName] = useState('');
  const [divType, setDivType] = useState<DivinationType>('tarot_cards');
  const [divDescription, setDivDescription] = useState('');
  const [divTools, setDivTools] = useState('');
  const [divPractitioners, setDivPractitioners] = useState('');
  const [divAccuracy, setDivAccuracy] = useState('');
  const [divCosts, setDivCosts] = useState('');
  const [divCards, setDivCards] = useState<UniverseDivinationCard[]>([]);
  const [divIsSpoiler, setDivIsSpoiler] = useState(false);
  const [divSpoilerChapter, setDivSpoilerChapter] = useState<number | ''>('');

  // Kart Ekleme Alt State (Deste Editörü)
  const [cardName, setCardName] = useState('');
  const [cardMeaning, setCardMeaning] = useState('');
  const [cardReversed, setCardReversed] = useState('');
  const [cardProphecy, setCardProphecy] = useState('');
  const [cardIcon, setCardIcon] = useState('🎴');
  const [cardElement, setCardElement] = useState('');

  // Form State: Prophecy
  const [prophecyTitle, setProphecyTitle] = useState('');
  const [prophecyText, setProphecyText] = useState('');
  const [prophecySeer, setProphecySeer] = useState('');
  const [prophecyTarget, setProphecyTarget] = useState('');
  const [prophecyStatus, setProphecyStatus] = useState<ProphecyStatus>('pending');
  const [prophecyInterpretation, setProphecyInterpretation] = useState('');
  const [prophecyFulfillment, setProphecyFulfillment] = useState('');
  const [prophecyDivSystemId, setProphecyDivSystemId] = useState('');
  const [prophecyIsSpoiler, setProphecyIsSpoiler] = useState(false);

  // Form State: Spell
  const [spellName, setSpellName] = useState('');
  const [spellSchool, setSpellSchool] = useState('');
  const [spellTier, setSpellTier] = useState<SpellTier>('novice');
  const [spellIncantation, setSpellIncantation] = useState('');
  const [spellSomatic, setSpellSomatic] = useState('');
  const [spellComponents, setSpellComponents] = useState('');
  const [spellEffects, setSpellEffects] = useState('');
  const [spellCastingTime, setSpellCastingTime] = useState('');
  const [spellCosts, setSpellCosts] = useState('');
  const [spellCounter, setSpellCounter] = useState('');
  const [spellIsSpoiler, setSpellIsSpoiler] = useState(false);

  // Form State: Ritual
  const [ritualName, setRitualName] = useState('');
  const [ritualPurpose, setRitualPurpose] = useState('');
  const [ritualConditions, setRitualConditions] = useState('');
  const [ritualSacrifices, setRitualSacrifices] = useState('');
  const [ritualParticipants, setRitualParticipants] = useState('');
  const [ritualRisks, setRitualRisks] = useState('');
  const [ritualPermanent, setRitualPermanent] = useState('');
  const [ritualIsSpoiler, setRitualIsSpoiler] = useState(false);

  const [saving, setSaving] = useState(false);

  // Verileri Yükle
  const loadAll = async () => {
    try {
      setLoading(true);
      const [divs, props, spls, rits] = await Promise.all([
        getUniverseDivinations(universeId),
        getUniverseProphecies(universeId),
        getUniverseSpells(universeId),
        getUniverseRituals(universeId),
      ]);
      setDivinations(divs);
      setProphecies(props);
      setSpells(spls);
      setRituals(rits);
      onCountChange?.(divs.length + spls.length + rits.length);
    } catch (err) {
      console.error('Mistik sanatlar verisi yüklenirken hata:', err);
      toast.error('Mistik sanatlar verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (universeId) {
      loadAll();
    }
  }, [universeId]);

  // Toplam sayaç
  const totalCount = useMemo(() => {
    return divinations.length + spells.length + rituals.length;
  }, [divinations, spells, rituals]);

  // ─────────────────────────────────────────────────────────────────
  // Divination Handlers
  // ─────────────────────────────────────────────────────────────────
  const openCreateDivModal = () => {
    setEditingDiv(null);
    setDivName('');
    setDivType('tarot_cards');
    setDivDescription('');
    setDivTools('');
    setDivPractitioners('');
    setDivAccuracy('');
    setDivCosts('');
    setDivCards([]);
    setDivIsSpoiler(false);
    setDivSpoilerChapter('');
    setIsDivModalOpen(true);
  };

  const openEditDivModal = (item: UniverseDivinationSystem) => {
    setEditingDiv(item);
    setDivName(item.name || '');
    setDivType(item.type || 'tarot_cards');
    setDivDescription(item.description || '');
    setDivTools(item.toolsAndMediums || '');
    setDivPractitioners(item.practitioners || '');
    setDivAccuracy(item.accuracyAndReliability || '');
    setDivCosts(item.costsAndDangers || '');
    setDivCards(item.cardsOrSymbols || []);
    setDivIsSpoiler(item.isSpoiler || false);
    setDivSpoilerChapter(item.spoilerThresholdChapter ?? '');
    setIsDivModalOpen(true);
  };

  const handleAddCardToDeck = () => {
    if (!cardName.trim()) {
      toast.error('Lütfen bir kart / sembol adı girin.');
      return;
    }
    const newCard: UniverseDivinationCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cardName.trim(),
      meaning: cardMeaning.trim(),
      reversedMeaning: cardReversed.trim() || undefined,
      prophecyText: cardProphecy.trim() || undefined,
      symbolIcon: cardIcon.trim() || '🎴',
      elementOrSuit: cardElement.trim() || undefined,
    };
    setDivCards((prev) => [...prev, newCard]);
    setCardName('');
    setCardMeaning('');
    setCardReversed('');
    setCardProphecy('');
    toast.success(`"${newCard.name}" desteye eklendi!`);
  };

  const handleRemoveCard = (cardId: string) => {
    setDivCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleSaveDivination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divName.trim()) {
      toast.error('Lütfen sistem adını girin.');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<UniverseDivinationSystem> = {
        name: divName.trim(),
        type: divType,
        description: divDescription.trim(),
        toolsAndMediums: divTools.trim(),
        practitioners: divPractitioners.trim(),
        accuracyAndReliability: divAccuracy.trim(),
        costsAndDangers: divCosts.trim(),
        cardsOrSymbols: divCards,
        isSpoiler: divIsSpoiler,
        spoilerThresholdChapter: divSpoilerChapter === '' ? undefined : Number(divSpoilerChapter),
      };

      if (editingDiv) {
        await updateUniverseDivination(universeId, editingDiv.id, payload);
        toast.success('Fal / Kehanet sistemi güncellendi.');
      } else {
        await createUniverseDivination(universeId, payload);
        toast.success('Yeni Fal / Kehanet sistemi oluşturuldu.');
      }

      setIsDivModalOpen(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDivination = async (id: string) => {
    if (!confirm('Bu fal sistemini ve bağlı kartları silmek istediğine emin misin?')) return;
    try {
      await deleteUniverseDivination(universeId, id);
      toast.success('Fal sistemi silindi.');
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Silinemedi.');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Prophecy Handlers
  // ─────────────────────────────────────────────────────────────────
  const openCreateProphecyModal = () => {
    setEditingProphecy(null);
    setProphecyTitle('');
    setProphecyText('');
    setProphecySeer('');
    setProphecyTarget('');
    setProphecyStatus('pending');
    setProphecyInterpretation('');
    setProphecyFulfillment('');
    setProphecyDivSystemId('');
    setProphecyIsSpoiler(false);
    setIsProphecyModalOpen(true);
  };

  const openEditProphecyModal = (p: UniverseProphecy) => {
    setEditingProphecy(p);
    setProphecyTitle(p.title || '');
    setProphecyText(p.prophecyText || '');
    setProphecySeer(p.seerName || '');
    setProphecyTarget(p.targetSubject || '');
    setProphecyStatus(p.status || 'pending');
    setProphecyInterpretation(p.interpretation || '');
    setProphecyFulfillment(p.fulfillmentDetails || '');
    setProphecyDivSystemId(p.divinationSystemId || '');
    setProphecyIsSpoiler(p.isSpoiler || false);
    setIsProphecyModalOpen(true);
  };

  const handleSaveProphecy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prophecyTitle.trim() || !prophecyText.trim()) {
      toast.error('Lütfen kehanet başlığı ve kehanet metnini girin.');
      return;
    }

    try {
      setSaving(true);
      const selectedSys = divinations.find((d) => d.id === prophecyDivSystemId);
      const payload: Partial<UniverseProphecy> = {
        title: prophecyTitle.trim(),
        prophecyText: prophecyText.trim(),
        seerName: prophecySeer.trim(),
        targetSubject: prophecyTarget.trim(),
        status: prophecyStatus,
        interpretation: prophecyInterpretation.trim(),
        fulfillmentDetails: prophecyFulfillment.trim(),
        divinationSystemId: prophecyDivSystemId || undefined,
        divinationSystemName: selectedSys?.name || undefined,
        isSpoiler: prophecyIsSpoiler,
      };

      if (editingProphecy) {
        await updateUniverseProphecy(universeId, editingProphecy.id, payload);
        toast.success('Kehanet güncellendi.');
      } else {
        await createUniverseProphecy(universeId, payload);
        toast.success('Yeni büyük kehanet kaydedildi.');
      }

      setIsProphecyModalOpen(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProphecy = async (id: string) => {
    if (!confirm('Bu kehaneti silmek istediğine emin misin?')) return;
    try {
      await deleteUniverseProphecy(universeId, id);
      toast.success('Kehanet silindi.');
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Silinemedi.');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Spell Handlers
  // ─────────────────────────────────────────────────────────────────
  const openCreateSpellModal = () => {
    setEditingSpell(null);
    setSpellName('');
    setSpellSchool('Elemental');
    setSpellTier('novice');
    setSpellIncantation('');
    setSpellSomatic('');
    setSpellComponents('');
    setSpellEffects('');
    setSpellCastingTime('');
    setSpellCosts('');
    setSpellCounter('');
    setSpellIsSpoiler(false);
    setIsSpellModalOpen(true);
  };

  const openEditSpellModal = (s: UniverseSpell) => {
    setEditingSpell(s);
    setSpellName(s.name || '');
    setSpellSchool(s.school || 'Elemental');
    setSpellTier(s.tier || 'novice');
    setSpellIncantation(s.incantation || '');
    setSpellSomatic(s.somaticGesture || '');
    setSpellComponents(s.componentsAndMaterials || '');
    setSpellEffects(s.effects || '');
    setSpellCastingTime(s.castingTime || '');
    setSpellCosts(s.costsAndBackfire || '');
    setSpellCounter(s.counterMagic || '');
    setSpellIsSpoiler(s.isSpoiler || false);
    setIsSpellModalOpen(true);
  };

  const handleSaveSpell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spellName.trim() || !spellEffects.trim()) {
      toast.error('Lütfen büyü adını ve etkisini belirtin.');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<UniverseSpell> = {
        name: spellName.trim(),
        school: spellSchool.trim() || 'Genel',
        tier: spellTier,
        incantation: spellIncantation.trim(),
        somaticGesture: spellSomatic.trim(),
        componentsAndMaterials: spellComponents.trim(),
        effects: spellEffects.trim(),
        castingTime: spellCastingTime.trim(),
        costsAndBackfire: spellCosts.trim(),
        counterMagic: spellCounter.trim(),
        isSpoiler: spellIsSpoiler,
      };

      if (editingSpell) {
        await updateUniverseSpell(universeId, editingSpell.id, payload);
        toast.success('Büyü güncellendi.');
      } else {
        await createUniverseSpell(universeId, payload);
        toast.success('Yeni büyü kitaba işlendi.');
      }

      setIsSpellModalOpen(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpell = async (id: string) => {
    if (!confirm('Bu büyüyü silmek istediğine emin misin?')) return;
    try {
      await deleteUniverseSpell(universeId, id);
      toast.success('Büyü silindi.');
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Silinemedi.');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Ritual Handlers
  // ─────────────────────────────────────────────────────────────────
  const openCreateRitualModal = () => {
    setEditingRitual(null);
    setRitualName('');
    setRitualPurpose('');
    setRitualConditions('');
    setRitualSacrifices('');
    setRitualParticipants('');
    setRitualRisks('');
    setRitualPermanent('');
    setRitualIsSpoiler(false);
    setIsRitualModalOpen(true);
  };

  const openEditRitualModal = (r: UniverseRitual) => {
    setEditingRitual(r);
    setRitualName(r.name || '');
    setRitualPurpose(r.purpose || '');
    setRitualConditions(r.requiredConditions || '');
    setRitualSacrifices(r.requiredSacrifices || '');
    setRitualParticipants(r.participants || '');
    setRitualRisks(r.risksAndFailures || '');
    setRitualPermanent(r.permanentEffects || '');
    setRitualIsSpoiler(r.isSpoiler || false);
    setIsRitualModalOpen(true);
  };

  const handleSaveRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ritualName.trim() || !ritualPurpose.trim()) {
      toast.error('Lütfen ritüel adını ve amacını girin.');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<UniverseRitual> = {
        name: ritualName.trim(),
        purpose: ritualPurpose.trim(),
        requiredConditions: ritualConditions.trim(),
        requiredSacrifices: ritualSacrifices.trim(),
        participants: ritualParticipants.trim(),
        risksAndFailures: ritualRisks.trim(),
        permanentEffects: ritualPermanent.trim(),
        isSpoiler: ritualIsSpoiler,
      };

      if (editingRitual) {
        await updateUniverseRitual(universeId, editingRitual.id, payload);
        toast.success('Ritüel güncellendi.');
      } else {
        await createUniverseRitual(universeId, payload);
        toast.success('Yeni ayin / ritüel kaydedildi.');
      }

      setIsRitualModalOpen(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRitual = async (id: string) => {
    if (!confirm('Bu ritüeli silmek istediğine emin misin?')) return;
    try {
      await deleteUniverseRitual(universeId, id);
      toast.success('Ritüel silindi.');
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Silinemedi.');
    }
  };

  // Filtrelenmiş listeler
  const filteredDivinations = useMemo(() => {
    return divinations.filter((d) => {
      const matchQuery = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedDivType === 'all' || d.type === selectedDivType;
      return matchQuery && matchType;
    });
  }, [divinations, searchQuery, selectedDivType]);

  const filteredSpells = useMemo(() => {
    return spells.filter((s) => {
      const matchQuery = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.school.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = selectedSpellTier === 'all' || s.tier === selectedSpellTier;
      return matchQuery && matchTier;
    });
  }, [spells, searchQuery, selectedSpellTier]);

  const filteredRituals = useMemo(() => {
    return rituals.filter((r) => {
      return !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [rituals, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ── Üst Başlık & Mistik Banner ── */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-card to-card dark:from-purple-950/40 dark:via-card/70 dark:to-card/90 border border-purple-500/20 backdrop-blur-md shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <Sparkles size={13} className="text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>Okültizm, Büyücülük & Kadim Sırlar</span>
            </div>
            <Typography variant="h2" className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Mistik Sanatlar & Kehanet Stüdyosu
            </Typography>
            <p className="text-xs sm:text-sm text-foreground/80 dark:text-muted leading-relaxed">
              Evrenindeki kart & rün fallarını, kadim büyü sözlerini, tehlikeli ayinleri ve gerçekleşmeyi bekleyen büyük kehanetleri tasarla. Burada oluşturduğun kart desteleri, okuyucular için <strong className="font-semibold text-purple-700 dark:text-purple-300">interaktif fal çekme deneyimine</strong> dönüşür.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {isAuthorized && (
              <>
                {subTab === 'divinations' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onPress={openCreateDivModal}
                      className="text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                    >
                      <Plus size={14} /> Yeni Fal / Deste Ekle
                    </Button>
                    <Button
                      variant="outline"
                      onPress={openCreateProphecyModal}
                      className="text-xs font-bold py-2.5 px-3 rounded-2xl border-purple-500/30 hover:border-purple-500/60 text-purple-700 dark:text-purple-300 flex items-center gap-1.5"
                    >
                      <Eye size={14} /> Kehanet Ekle
                    </Button>
                  </div>
                )}
                {subTab === 'spells' && (
                  <Button
                    variant="primary"
                    onPress={openCreateSpellModal}
                    className="text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white"
                  >
                    <Plus size={14} /> Büyü Kitabına Ekle
                  </Button>
                )}
                {subTab === 'rituals' && (
                  <Button
                    variant="primary"
                    onPress={openCreateRitualModal}
                    className="text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg flex items-center gap-1.5 bg-gradient-to-r from-rose-700 to-purple-700 hover:from-rose-600 hover:to-purple-600 text-white"
                  >
                    <Plus size={14} /> Yeni Ritüel / Lanet Ekle
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Alt Sekme Seçici (Sub-Tabs) ── */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <button
            onClick={() => setSubTab('divinations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'divinations'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 scale-[1.02]'
                : 'bg-card/60 hover:bg-card text-foreground/70 hover:text-foreground border border-border/60'
            }`}
          >
            <Compass size={14} />
            <span>Fal & Kehanet Sistemleri</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted/20 dark:bg-background/40 font-black">
              {divinations.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('spells')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'spells'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 scale-[1.02]'
                : 'bg-card/60 hover:bg-card text-foreground/70 hover:text-foreground border border-border/60'
            }`}
          >
            <Wand2 size={14} />
            <span>Büyü Kitabı (Grimoire)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted/20 dark:bg-background/40 font-black">
              {spells.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('rituals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'rituals'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 scale-[1.02]'
                : 'bg-card/60 hover:bg-card text-foreground/70 hover:text-foreground border border-border/60'
            }`}
          >
            <Flame size={14} />
            <span>Ritüeller, Ayinler & Lanetler</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted/20 dark:bg-background/40 font-black">
              {rituals.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Arama ve Filtre Çubuğu ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              subTab === 'divinations'
                ? 'Fal sistemlerinde veya kehanetlerde ara...'
                : subTab === 'spells'
                ? 'Büyü adı veya okuluna göre ara...'
                : 'Ritüel veya lanetlerde ara...'
            }
            className="w-full bg-card/60 border border-border/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {subTab === 'spells' && (
          <select
            value={selectedSpellTier}
            onChange={(e) => setSelectedSpellTier(e.target.value)}
            className="bg-card/60 border border-border/50 rounded-2xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-purple-500/50 w-full sm:w-auto"
          >
            <option value="all">Tüm Kademeler</option>
            <option value="novice">Çırak / Temel</option>
            <option value="adept">Kıdemli / İleri</option>
            <option value="master">Usta / Yüksek Büyü</option>
            <option value="ancient">Kadim / Kayıp Sanat</option>
            <option value="forbidden">Yasaklı / Tabu</option>
          </select>
        )}

        {subTab === 'divinations' && (
          <select
            value={selectedDivType}
            onChange={(e) => setSelectedDivType(e.target.value)}
            className="bg-card/60 border border-border/50 rounded-2xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-purple-500/50 w-full sm:w-auto"
          >
            <option value="all">Tüm Yöntemler</option>
            <option value="tarot_cards">Tarot & Kadim Deste</option>
            <option value="runes">Rün & Kemik Atma</option>
            <option value="astrology">Yıldızname & Astroloji</option>
            <option value="elemental">Elementel (Su/Ayna/Ateş)</option>
            <option value="dreams_visions">Durugörü & Rüyalar</option>
            <option value="omens_portents">Alametler & Göksel İşaretler</option>
          </select>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. ALT SEKME: FAL & KEHANET SİSTEMLERİ
      ───────────────────────────────────────────────────────────── */}
      {subTab === 'divinations' && (
        <div className="space-y-8">
          {/* Sistem Listesi */}
          {filteredDivinations.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/60 border border-border/60 text-center space-y-4 max-w-lg mx-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                <Compass size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir fal veya kehanet sistemi eklenmedi
                </h4>
                <p className="text-xs text-foreground/75 dark:text-muted leading-relaxed">
                  Evreninde geleceğe bakanların kullandığı Tarot kartlarını, kadim rünleri, kemik fallarını veya kahin rüyalarını tanımla.
                </p>
              </div>
              {isAuthorized && (
                <div className="flex justify-center items-center w-full pt-2">
                  <Button
                    variant="primary"
                    onPress={openCreateDivModal}
                    className="text-xs font-bold py-2.5 px-6 rounded-2xl shadow-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Plus size={14} className="mr-1.5" /> İlk Fal Sistemini Oluştur
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDivinations.map((div) => {
                const typeConfig = DIVINATION_TYPE_LABELS[div.type] || { label: 'Diğer', icon: '🕯️' };
                const cardCount = div.cardsOrSymbols?.length || 0;

                return (
                  <div
                    key={div.id}
                    className="p-6 rounded-3xl bg-card border border-border/70 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md space-y-4"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl border border-purple-500/20 shrink-0 shadow-sm">
                            {typeConfig.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {div.name}
                              </h4>
                              {div.isSpoiler && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 font-semibold">
                                  <EyeOff size={10} /> Spoiler
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>

                        {isAuthorized && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditDivModal(div)}
                              className="p-1.5 rounded-xl hover:bg-muted/50 text-foreground/60 hover:text-foreground transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDivination(div.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-foreground/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {div.description && (
                        <p className="text-xs text-foreground/80 dark:text-muted leading-relaxed line-clamp-3">
                          {div.description}
                        </p>
                      )}

                      {/* Araçlar ve Bedeller Bilgi Çipleri */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/30 text-[11px]">
                        {div.toolsAndMediums && (
                          <div className="text-foreground/80 dark:text-muted">
                            <span className="font-bold text-foreground">Gereken Araç: </span>
                            {div.toolsAndMediums}
                          </div>
                        )}
                        {div.accuracyAndReliability && (
                          <div className="text-foreground/80 dark:text-muted">
                            <span className="font-bold text-foreground">Güvenilirlik: </span>
                            {div.accuracyAndReliability}
                          </div>
                        )}
                        {div.practitioners && (
                          <div className="text-foreground/80 dark:text-muted">
                            <span className="font-bold text-foreground">Kahinler: </span>
                            {div.practitioners}
                          </div>
                        )}
                        {div.costsAndDangers && (
                          <div className="text-rose-700 dark:text-rose-300">
                            <span className="font-bold text-rose-600 dark:text-rose-400">Bedeli / Risk: </span>
                            {div.costsAndDangers}
                          </div>
                        )}
                      </div>

                      {/* Kart Destesi / Rün Vitrini */}
                      {cardCount > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Layers size={13} className="text-purple-600 dark:text-purple-400" />
                              Tanımlı Deste / Semboller ({cardCount})
                            </span>
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                              Okuyucu Falı İçin Aktif
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                            {div.cardsOrSymbols?.map((c) => (
                              <div
                                key={c.id}
                                className="px-2.5 py-1 rounded-lg bg-muted/40 dark:bg-background/60 border border-purple-500/20 text-xs flex items-center gap-1.5 text-foreground hover:border-purple-500/40"
                              >
                                <span>{c.symbolIcon || '🎴'}</span>
                                <span className="font-semibold">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-foreground/75 dark:text-muted">
                      <span>{cardCount > 0 ? `${cardCount} kart/sembol hazır` : 'Henüz kart tanımlanmadı'}</span>
                      <button
                        onClick={() => openEditDivModal(div)}
                        className="text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-bold flex items-center gap-1"
                      >
                        Desteyi Yönet &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Kayıtlı Büyük Kehanetler Kütüphanesi ── */}
          <div className="p-6 rounded-3xl bg-card border border-border/70 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Typography variant="h3" className="font-bold text-base flex items-center gap-2">
                  <Eye size={18} className="text-purple-600 dark:text-purple-400" />
                  <span>Kayıtlı Büyük Kehanetler & Alametler</span>
                </Typography>
                <p className="text-xs text-foreground/80 dark:text-muted mt-0.5">
                  Evrende söylenmiş meşhur kehanetler, bağlı karakterler ve kaderin gerçekleşme durumu.
                </p>
              </div>

              {isAuthorized && (
                <Button
                  variant="outline"
                  onPress={openCreateProphecyModal}
                  className="text-xs font-bold py-2 px-3 rounded-xl border-purple-500/30 hover:border-purple-500/60 text-purple-700 dark:text-purple-300 flex items-center gap-1"
                >
                  <Plus size={13} /> Kehanet Kaydet
                </Button>
              )}
            </div>

            {prophecies.length === 0 ? (
              <p className="text-xs text-foreground/60 dark:text-muted py-4 text-center italic">
                Henüz kayıtlı bir kehanet bulunmuyor. Hikayendeki gizemli mısraları buraya ekleyebilirsin.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prophecies.map((p) => {
                  const statusConfig = PROPHECY_STATUS_LABELS[p.status] || {
                    label: 'Bekleniyor',
                    color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
                  };

                  return (
                    <div
                      key={p.id}
                      className="p-5 rounded-2xl bg-card border border-border/70 hover:border-purple-500/40 transition-all space-y-3 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              {p.title}
                            </h5>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                          {p.seerName && (
                            <span className="text-[11px] text-foreground/80 dark:text-muted block mt-0.5">
                              Söyleyen: <strong className="text-foreground">{p.seerName}</strong>
                              {p.targetSubject && ` • Hedef: ${p.targetSubject}`}
                            </span>
                          )}
                        </div>

                        {isAuthorized && (
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                            <button
                              onClick={() => openEditProphecyModal(p)}
                              className="p-1 hover:text-foreground text-foreground/60"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProphecy(p.id)}
                              className="p-1 hover:text-rose-600 dark:hover:text-rose-400 text-foreground/60"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Kehanet Sözleri (Antik Blok) */}
                      <blockquote className="p-3.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border-l-4 border-purple-500 text-xs italic text-purple-950 dark:text-purple-200 leading-relaxed font-serif shadow-sm">
                        &ldquo;{p.prophecyText}&rdquo;
                      </blockquote>

                      {p.interpretation && (
                        <p className="text-xs text-foreground/85 dark:text-muted">
                          <strong className="text-foreground">Yorum: </strong>
                          {p.interpretation}
                        </p>
                      )}

                      {p.fulfillmentDetails && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          <strong className="text-emerald-800 dark:text-emerald-300">Gerçekleşme: </strong>
                          {p.fulfillmentDetails}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. ALT SEKME: BÜYÜ KİTABI (GRIMOIRE)
      ───────────────────────────────────────────────────────────── */}
      {subTab === 'spells' && (
        <div className="space-y-6">
          {filteredSpells.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/60 border border-border/60 text-center space-y-4 max-w-lg mx-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Wand2 size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Büyü kitabında henüz büyü kayıtlı değil
                </h4>
                <p className="text-xs text-foreground/75 dark:text-muted leading-relaxed">
                  Evrenindeki büyüleri, antik dildeki sözlerini (incantation), döküm hareketlerini ve tehlikeli bedellerini kaydet.
                </p>
              </div>
              {isAuthorized && (
                <div className="flex justify-center items-center w-full pt-2">
                  <Button
                    variant="primary"
                    onPress={openCreateSpellModal}
                    className="text-xs font-bold py-2.5 px-6 rounded-2xl shadow-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Plus size={14} className="mr-1.5" /> İlk Büyüyü Yaz
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSpells.map((spell) => {
                const tierConfig = SPELL_TIER_LABELS[spell.tier] || {
                  label: 'Temel',
                  color: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
                };

                return (
                  <div
                    key={spell.id}
                    className="p-5 rounded-3xl bg-card border border-border/70 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {spell.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-foreground/75 dark:text-muted font-medium">
                              {spell.school}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierConfig.color}`}
                            >
                              {tierConfig.label}
                            </span>
                          </div>
                        </div>

                        {isAuthorized && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => openEditSpellModal(spell)}
                              className="p-1.5 rounded-xl hover:bg-muted/50 text-foreground/60 hover:text-foreground"
                              title="Düzenle"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSpell(spell.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-foreground/60 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Büyü Sözü (Incantation) */}
                      {spell.incantation && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs italic text-amber-900 dark:text-amber-200 font-serif">
                          &ldquo;{spell.incantation}&rdquo;
                        </div>
                      )}

                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {spell.effects}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-border/30 text-[11px]">
                        {spell.castingTime && (
                          <div className="text-foreground/80 dark:text-muted">
                            <span className="font-bold text-foreground">Süre: </span>
                            {spell.castingTime}
                          </div>
                        )}
                        {spell.somaticGesture && (
                          <div className="text-foreground/80 dark:text-muted">
                            <span className="font-bold text-foreground">El/Jest: </span>
                            {spell.somaticGesture}
                          </div>
                        )}
                        {spell.componentsAndMaterials && (
                          <div className="text-foreground/80 dark:text-muted">
                            <span className="font-bold text-foreground">Bileşenler: </span>
                            {spell.componentsAndMaterials}
                          </div>
                        )}
                        {spell.costsAndBackfire && (
                          <div className="text-rose-700 dark:text-rose-300">
                            <span className="font-bold text-rose-600 dark:text-rose-400">Bedel & Geri Tepme: </span>
                            {spell.costsAndBackfire}
                          </div>
                        )}
                        {spell.counterMagic && (
                          <div className="text-cyan-800 dark:text-cyan-300">
                            <span className="font-bold text-cyan-700 dark:text-cyan-400">Karşı Büyü: </span>
                            {spell.counterMagic}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ALT SEKME: RİTÜELLER, AYİNLER & LANETLER
      ───────────────────────────────────────────────────────────── */}
      {subTab === 'rituals' && (
        <div className="space-y-6">
          {filteredRituals.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card/60 border border-border/60 text-center space-y-4 max-w-lg mx-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Flame size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Henüz bir ritüel veya ayin tanımlanmadı
                </h4>
                <p className="text-xs text-foreground/75 dark:text-muted leading-relaxed">
                  Kan bağı lanetlerini, güneş tutulması ayinlerini, sunak adaklarını ve geri dönülmez mühürleri kaydet.
                </p>
              </div>
              {isAuthorized && (
                <div className="flex justify-center items-center w-full pt-2">
                  <Button
                    variant="primary"
                    onPress={openCreateRitualModal}
                    className="text-xs font-bold py-2.5 px-6 rounded-2xl shadow-lg bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Plus size={14} className="mr-1.5" /> İlk Ritüeli Kaydet
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRituals.map((ritual) => (
                <div
                  key={ritual.id}
                  className="p-6 rounded-3xl bg-card border border-border/70 hover:border-rose-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg border border-rose-500/20 shrink-0 shadow-sm">
                          <Flame size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {ritual.name}
                          </h4>
                          <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                            Kadim Ayin / Lanet
                          </span>
                        </div>
                      </div>

                      {isAuthorized && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => openEditRitualModal(ritual)}
                            className="p-1.5 rounded-xl hover:bg-muted/50 text-foreground/60 hover:text-foreground"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRitual(ritual.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-500/10 text-foreground/60 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/30 dark:bg-background/50 border border-border/60 text-xs">
                      <strong className="text-foreground block mb-0.5">Amacı:</strong>
                      <p className="text-foreground/80 dark:text-muted leading-relaxed">{ritual.purpose}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      {ritual.requiredConditions && (
                        <div>
                          <span className="font-bold text-foreground">Gereken Koşullar: </span>
                          <span className="text-foreground/80 dark:text-muted">{ritual.requiredConditions}</span>
                        </div>
                      )}
                      {ritual.requiredSacrifices && (
                        <div>
                          <span className="font-bold text-foreground">Gerekli Adaklar: </span>
                          <span className="text-rose-700 dark:text-rose-300 font-medium">{ritual.requiredSacrifices}</span>
                        </div>
                      )}
                      {ritual.participants && (
                        <div>
                          <span className="font-bold text-foreground">Katılımcılar: </span>
                          <span className="text-foreground/80 dark:text-muted">{ritual.participants}</span>
                        </div>
                      )}
                      {ritual.risksAndFailures && (
                        <div>
                          <span className="font-bold text-rose-600 dark:text-rose-400">Risk & Başarısızlık: </span>
                          <span className="text-rose-800 dark:text-rose-300 font-medium">{ritual.risksAndFailures}</span>
                        </div>
                      )}
                      {ritual.permanentEffects && (
                        <div>
                          <span className="font-bold text-purple-700 dark:text-purple-400">Kalıcı İz / Mühür: </span>
                          <span className="text-purple-800 dark:text-purple-300 font-medium">{ritual.permanentEffects}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FAL & KEHANET SİSTEMİ OLUŞTUR / DÜZENLE
      ───────────────────────────────────────────────────────────── */}
      {isDivModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Compass size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingDiv ? 'Fal & Kehanet Sistemini Düzenle' : 'Yeni Fal & Kehanet Sistemi Oluştur'}
                  </h3>
                  <p className="text-xs text-muted">
                    Geleceğe bakış yöntemleri ve okuyucu için interaktif kart destesi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDivModalOpen(false)}
                className="p-2 rounded-xl hover:bg-background/80 text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDivination} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Sistem Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={divName}
                    onChange={(e) => setDivName(e.target.value)}
                    placeholder="Örn: Yüksek Divan Tarotu, Kuzey Kemik Falı"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Yöntem Türü *
                  </label>
                  <select
                    value={divType}
                    onChange={(e) => setDivType(e.target.value as DivinationType)}
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="tarot_cards">🎴 Tarot & Kadim Deste</option>
                    <option value="runes">ᚱ Rün & Kemik / Taş Atma</option>
                    <option value="astrology">✨ Yıldızname & Astroloji</option>
                    <option value="elemental">🔮 Elementel (Su/Ateş/Duman/Ayna)</option>
                    <option value="dreams_visions">👁️ Durugörü & Rüyalar</option>
                    <option value="omens_portents">☄️ Alametler & Göksel İşaretler</option>
                    <option value="other">🕯️ Diğer Mistik Yöntem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Açıklama & Felsefe
                </label>
                <textarea
                  rows={2}
                  value={divDescription}
                  onChange={(e) => setDivDescription(e.target.value)}
                  placeholder="Bu kehanet sanatının kökeni, tarihi ve evrendeki yeri..."
                  className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Kullanılan Araçlar & Medyumlar
                  </label>
                  <input
                    type="text"
                    value={divTools}
                    onChange={(e) => setDivTools(e.target.value)}
                    placeholder="Örn: 78 kemik kart, gümüş su kasesi"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Kimler Bakabilir?
                  </label>
                  <input
                    type="text"
                    value={divPractitioners}
                    onChange={(e) => setDivPractitioners(e.target.value)}
                    placeholder="Örn: Sadece doğuştan gözleri kör olanlar"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Doğruluk & Kaderin Değişebilirliği
                  </label>
                  <input
                    type="text"
                    value={divAccuracy}
                    onChange={(e) => setDivAccuracy(e.target.value)}
                    placeholder="Örn: Kesin kaderdir, değiştirilemez"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Bedeli, Tehlikeleri & Riskleri
                  </label>
                  <input
                    type="text"
                    value={divCosts}
                    onChange={(e) => setDivCosts(e.target.value)}
                    placeholder="Örn: Her bakışta 1 yıllık ömür tükenir"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* ── İNTERAKTİF DESTE / KART EDİTÖRÜ ── */}
              <div className="p-4 rounded-2xl bg-purple-500/10 dark:bg-purple-950/25 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Layers size={14} />
                    Kartlar & Rünler Destesi ({divCards.length} kart)
                  </h4>
                  <span className="text-[10px] text-foreground/70 dark:text-muted">
                    Okuyucu fal aracı için kart ekle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Kart/Sembol Adı *"
                    className="bg-background border border-border/80 rounded-xl px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={cardMeaning}
                    onChange={(e) => setCardMeaning(e.target.value)}
                    placeholder="Düz Anlamı (Kader mesajı)"
                    className="bg-background border border-border/80 rounded-xl px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cardIcon}
                      onChange={(e) => setCardIcon(e.target.value)}
                      placeholder="İkon (🎴/🌙/💀)"
                      className="w-16 bg-background border border-border/80 rounded-xl px-2 py-1.5 text-xs text-center text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCardToDeck}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Plus size={13} /> Ekle
                    </button>
                  </div>
                </div>

                {/* Eklenen Kartlar */}
                {divCards.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 max-h-32 overflow-y-auto pr-1">
                    {divCards.map((c) => (
                      <div
                        key={c.id}
                        className="px-2.5 py-1 rounded-xl bg-card border border-purple-500/30 text-xs flex items-center gap-2 shadow-sm"
                      >
                        <span>{c.symbolIcon}</span>
                        <span className="font-semibold text-foreground">{c.name}</span>
                        {c.meaning && <span className="text-[10px] text-foreground/70 dark:text-muted">({c.meaning})</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(c.id)}
                          className="text-foreground/50 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Spoiler Ayarı */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="divSpoiler"
                  checked={divIsSpoiler}
                  onChange={(e) => setDivIsSpoiler(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="divSpoiler" className="text-xs text-muted cursor-pointer">
                  Bu fal sistemi hikayede sonradan açığa çıkan bir sırdır (Spoiler Koruması).
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => setIsDivModalOpen(false)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-500"
                >
                  {saving ? 'Kaydediliyor...' : editingDiv ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: BÜYÜK KEHANET KAYDET / DÜZENLE
      ───────────────────────────────────────────────────────────── */}
      {isProphecyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full my-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingProphecy ? 'Kehaneti Düzenle' : 'Büyük Kehanet Kaydet'}
              </h3>
              <button
                onClick={() => setIsProphecyModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-background/80 text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProphecy} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Kehanet Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={prophecyTitle}
                  onChange={(e) => setProphecyTitle(e.target.value)}
                  placeholder="Örn: Kızıl Ay Çöküşü, İkiz Hükümdarların Sonu"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Kehanet Sözleri (Manzum / Şiir / Mısralar) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={prophecyText}
                  onChange={(e) => setProphecyText(e.target.value)}
                  placeholder="Karanlık sular yükseldiğinde, kan bağıyla mühürlenen taht devrilecektir..."
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted italic font-serif focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Söyleyen Kahin / Kişi
                  </label>
                  <input
                    type="text"
                    value={prophecySeer}
                    onChange={(e) => setProphecySeer(e.target.value)}
                    placeholder="Örn: Kör Kahin Vane"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Durum
                  </label>
                  <select
                    value={prophecyStatus}
                    onChange={(e) => setProphecyStatus(e.target.value as ProphecyStatus)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="pending">Bekleniyor</option>
                    <option value="fulfilled">Gerçekleşti</option>
                    <option value="in_progress">Süreçte</option>
                    <option value="misinterpreted">Yanlış Yorumlandı</option>
                    <option value="broken">Kader Kırıldı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Kime / Neye Dair (Hedef)
                </label>
                <input
                  type="text"
                  value={prophecyTarget}
                  onChange={(e) => setProphecyTarget(e.target.value)}
                  placeholder="Örn: Veliaht Prens, Gölge Krallığı"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Yorum ve Hikayedeki Yeri
                </label>
                <textarea
                  rows={2}
                  value={prophecyInterpretation}
                  onChange={(e) => setProphecyInterpretation(e.target.value)}
                  placeholder="İnsanlar bunu nasıl yorumladı? Gizli anlamı nedir?"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => setIsProphecyModalOpen(false)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-500"
                >
                  {saving ? 'Kaydediliyor...' : editingProphecy ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: BÜYÜ EKLE / DÜZENLE
      ───────────────────────────────────────────────────────────── */}
      {isSpellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingSpell ? 'Büyüyü Düzenle' : 'Büyü Kitabına Yeni Büyü Yaz'}
              </h3>
              <button
                onClick={() => setIsSpellModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-background/80 text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSpell} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Büyü Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={spellName}
                    onChange={(e) => setSpellName(e.target.value)}
                    placeholder="Örn: Gölge Boğması, Ruh Yangını"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Kademe
                  </label>
                  <select
                    value={spellTier}
                    onChange={(e) => setSpellTier(e.target.value as SpellTier)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  >
                    <option value="novice">Çırak</option>
                    <option value="adept">Kıdemli</option>
                    <option value="master">Usta</option>
                    <option value="ancient">Kadim</option>
                    <option value="forbidden">Yasaklı</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Büyü Okulu / Element
                  </label>
                  <input
                    type="text"
                    value={spellSchool}
                    onChange={(e) => setSpellSchool(e.target.value)}
                    placeholder="Örn: Nekromansi, Ateş, İllüzyon"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Döküm Süresi
                  </label>
                  <input
                    type="text"
                    value={spellCastingTime}
                    onChange={(e) => setSpellCastingTime(e.target.value)}
                    placeholder="Örn: Anlık, 1 nefes, ayinle"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Sözsel Büyü Sözleri (Incantation)
                </label>
                <input
                  type="text"
                  value={spellIncantation}
                  onChange={(e) => setSpellIncantation(e.target.value)}
                  placeholder="Örn: Ignis ex profundis, anima devora..."
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted italic font-serif focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Etkisi, Menzili ve Hedefi *
                </label>
                <textarea
                  rows={2}
                  required
                  value={spellEffects}
                  onChange={(e) => setSpellEffects(e.target.value)}
                  placeholder="Büyünün hedefte oluşturduğu tesir, menzili ve süresi..."
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Gereken Bileşenler / Materyaller
                  </label>
                  <input
                    type="text"
                    value={spellComponents}
                    onChange={(e) => setSpellComponents(e.target.value)}
                    placeholder="Örn: 1 damla ejderha kanı, obsidyen"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Bedel & Geri Tepme Riski
                  </label>
                  <input
                    type="text"
                    value={spellCosts}
                    onChange={(e) => setSpellCosts(e.target.value)}
                    placeholder="Örn: Kullanıcının parmakları kararır"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => setIsSpellModalOpen(false)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-500"
                >
                  {saving ? 'Kaydediliyor...' : editingSpell ? 'Güncelle' : 'Büyüyü Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RİTÜEL EKLE / DÜZENLE
      ───────────────────────────────────────────────────────────── */}
      {isRitualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingRitual ? 'Ritüeli Düzenle' : 'Yeni Ritüel / Lanet Kaydet'}
              </h3>
              <button
                onClick={() => setIsRitualModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-background/80 text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRitual} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Ritüel / Lanet Adı *
                </label>
                <input
                  type="text"
                  required
                  value={ritualName}
                  onChange={(e) => setRitualName(e.target.value)}
                  placeholder="Örn: Kan Bağı Mührü, Dolunay Diriltme Ayini"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Amacı & Hedefi *
                </label>
                <textarea
                  rows={2}
                  required
                  value={ritualPurpose}
                  onChange={(e) => setRitualPurpose(e.target.value)}
                  placeholder="Bu ayin neyi amaçlar? Hangi varlık veya kudret çağrılır?"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Gereken Koşullar / Zamanlama
                  </label>
                  <input
                    type="text"
                    value={ritualConditions}
                    onChange={(e) => setRitualConditions(e.target.value)}
                    placeholder="Örn: Kış dönencesi, güneş tutulması"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Gereken Adaklar & Kurbanlar
                  </label>
                  <input
                    type="text"
                    value={ritualSacrifices}
                    onChange={(e) => setRitualSacrifices(e.target.value)}
                    placeholder="Örn: Saf gümüş, akraba kanı"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Riskler ve Başarısızlık Felaketi
                </label>
                <textarea
                  rows={2}
                  value={ritualRisks}
                  onChange={(e) => setRitualRisks(e.target.value)}
                  placeholder="Ayin bozulursa veya yarım kalırsa ne gibi felaketler yaşanır?"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Geride Bıraktığı Kalıcı Mühür veya İz
                </label>
                <input
                  type="text"
                  value={ritualPermanent}
                  onChange={(e) => setRitualPermanent(e.target.value)}
                  placeholder="Örn: Toprak 100 yıl çorak kalır, tende yara izi kalır"
                  className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => setIsRitualModalOpen(false)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs font-bold bg-rose-700 hover:bg-rose-600"
                >
                  {saving ? 'Kaydediliyor...' : editingRitual ? 'Güncelle' : 'Ritüeli Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
