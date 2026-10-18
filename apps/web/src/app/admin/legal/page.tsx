"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Scale, ShieldCheck, FileText, CheckCircle2, ExternalLink, 
  Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, 
  Eye, Edit3, Columns, AlertCircle, Check, Sparkles, Clock, Globe
} from 'lucide-react';
import { Button, Typography, Input } from '@readixon/ui';
import { 
  useAuthStore, 
  getLegalDocument, 
  saveLegalDocument, 
  getDefaultLegalDocument, 
  DEFAULT_LEGAL_DOCS,
  type LegalDocument, 
  type LegalDocType, 
  type LegalSection 
} from '@readixon/core';
import { toast } from 'sonner';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

interface TabConfig {
  id: LegalDocType;
  name: string;
  shortName: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'terms',
    name: 'Kullanım Koşulları',
    shortName: 'Koşullar',
    path: '/terms',
    icon: FileText,
    color: 'text-primary',
    description: 'Kullanıcı sözleşmesi, yer sağlayıcı hakları ve yasal sorumluluklar.',
  },
  {
    id: 'privacy',
    name: 'Gizlilik & KVKK',
    shortName: 'Gizlilik',
    path: '/privacy',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    description: 'KVKK aydınlatma metni, veri işleme politikası ve saklama süreleri.',
  },
  {
    id: 'copyright',
    name: 'Telif Hakkı & DMCA',
    shortName: 'Telif',
    path: '/copyright',
    icon: Scale,
    color: 'text-amber-500',
    description: 'FSEK, DMCA uyar-kaldır süreci, intihal politikası ve yapay zeka koruması.',
  },
  {
    id: 'guidelines',
    name: 'Topluluk Kuralları',
    shortName: 'Kurallar',
    path: '/guidelines',
    icon: CheckCircle2,
    color: 'text-indigo-400',
    description: 'Platform etik standartları, nezaket, yapıcı eleştiri ve moderasyon ilkeleri.',
  },
];

type ViewMode = 'edit' | 'split' | 'preview';

export default function AdminLegalPage() {
  const { userProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LegalDocType>('terms');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  
  // Doküman verileri
  const [docs, setDocs] = useState<Record<LegalDocType, LegalDocument>>({
    terms: DEFAULT_LEGAL_DOCS.terms,
    privacy: DEFAULT_LEGAL_DOCS.privacy,
    copyright: DEFAULT_LEGAL_DOCS.copyright,
    guidelines: DEFAULT_LEGAL_DOCS.guidelines,
  });

  const [dirtyTabs, setDirtyTabs] = useState<Record<LegalDocType, boolean>>({
    terms: false,
    privacy: false,
    copyright: false,
    guidelines: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTimes, setLastSavedTimes] = useState<Record<LegalDocType, string | null>>({
    terms: null,
    privacy: null,
    copyright: null,
    guidelines: null,
  });

  // Başlangıçta Firestore'dan tüm dokümanları çek
  useEffect(() => {
    let isMounted = true;

    async function loadAllDocs() {
      setIsLoading(true);
      try {
        const [termsDoc, privacyDoc, copyDoc, guideDoc] = await Promise.all([
          getLegalDocument('terms'),
          getLegalDocument('privacy'),
          getLegalDocument('copyright'),
          getLegalDocument('guidelines'),
        ]);

        if (isMounted) {
          setDocs({
            terms: termsDoc,
            privacy: privacyDoc,
            copyright: copyDoc,
            guidelines: guideDoc,
          });
        }
      } catch (err) {
        console.error('Yasal sözleşmeler yüklenirken hata:', err);
        toast.error('Yasal sözleşmeler yüklenemedi, varsayılanlar gösteriliyor.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAllDocs();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeDoc = docs[activeTab];
  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  // Aktif dokümanı güncelle
  const updateActiveDoc = useCallback((updater: (prev: LegalDocument) => LegalDocument) => {
    setDocs((prev) => {
      const nextDoc = updater(prev[activeTab]);
      return {
        ...prev,
        [activeTab]: nextDoc,
      };
    });
    setDirtyTabs((prev) => ({
      ...prev,
      [activeTab]: true,
    }));
  }, [activeTab]);

  // Üst veri alanlarını güncelle
  const handleFieldChange = (field: keyof LegalDocument, value: any) => {
    updateActiveDoc((doc) => ({
      ...doc,
      [field]: value,
    }));
  };

  // Madde başlığı güncelle
  const handleSectionTitleChange = (index: number, newTitle: string) => {
    updateActiveDoc((doc) => {
      const sections = [...doc.sections];
      sections[index] = { ...sections[index], title: newTitle };
      return { ...doc, sections };
    });
  };

  // Madde içeriği güncelle
  const handleSectionContentChange = (index: number, newContent: string) => {
    updateActiveDoc((doc) => {
      const sections = [...doc.sections];
      sections[index] = { ...sections[index], content: newContent };
      return { ...doc, sections };
    });
  };

  // Maddeyi yukarı taşı
  const handleMoveSectionUp = (index: number) => {
    if (index === 0) return;
    updateActiveDoc((doc) => {
      const sections = [...doc.sections];
      const temp = sections[index - 1];
      sections[index - 1] = sections[index];
      sections[index] = temp;
      return { ...doc, sections };
    });
  };

  // Maddeyi aşağı taşı
  const handleMoveSectionDown = (index: number) => {
    updateActiveDoc((doc) => {
      if (index >= doc.sections.length - 1) return doc;
      const sections = [...doc.sections];
      const temp = sections[index + 1];
      sections[index + 1] = sections[index];
      sections[index] = temp;
      return { ...doc, sections };
    });
  };

  // Madde sil
  const handleDeleteSection = (index: number) => {
    if (confirm('Bu maddeyi silmek istediğinize emin misiniz?')) {
      updateActiveDoc((doc) => {
        const sections = doc.sections.filter((_, i) => i !== index);
        return { ...doc, sections };
      });
    }
  };

  // Yeni madde ekle
  const handleAddSection = () => {
    updateActiveDoc((doc) => {
      const newIndex = doc.sections.length + 1;
      const newSection: LegalSection = {
        id: `${doc.id}-${Date.now()}`,
        title: `${newIndex}. YENİ MADDE BAŞLIĞI`,
        content: '<p>Bu maddenin yasal açıklaması ve şartları buraya girilecektir.</p>',
      };
      return {
        ...doc,
        sections: [...doc.sections, newSection],
      };
    });
  };

  // Varsayılan şablona sıfırla
  const handleResetToDefault = () => {
    if (confirm(`"${activeTabConfig.name}" dokümanını fabrika çıkışı varsayılan şablona geri döndürmek istediğinize emin misiniz?`)) {
      const defaultDoc = getDefaultLegalDocument(activeTab);
      updateActiveDoc(() => defaultDoc);
      toast.info(`${activeTabConfig.name} varsayılan metnine sıfırlandı.`);
    }
  };

  // Firestore'a kaydet & yayınla
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      await saveLegalDocument(activeDoc, {
        uid: userProfile?.uid || 'admin',
        email: (userProfile as any)?.email || userProfile?.username || 'admin',
      });

      setDirtyTabs((prev) => ({
        ...prev,
        [activeTab]: false,
      }));

      const nowFormatted = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTimes((prev) => ({
        ...prev,
        [activeTab]: nowFormatted,
      }));

      toast.success(`${activeTabConfig.name} başarıyla kaydedildi ve yayına alındı!`, {
        description: `Canlı adres: ${activeTabConfig.path}`,
      });
    } catch (err: any) {
      console.error('Kaydetme hatası:', err);
      toast.error('Kaydedilirken bir hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Üst Bar / Başlık & Eylemler ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Scale size={20} />
            </span>
            <Typography variant="h2" className="font-bold text-foreground">
              Yasal & Sözleşme Yönetimi
            </Typography>
          </div>
          <Typography variant="body" className="text-muted-foreground text-sm">
            Readixon platformunun kullanım koşullarını, gizlilik protokollerini, telif haklarını ve topluluk kurallarını tek merkezden düzenleyin.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Canlı Sayfa Linki */}
          <Link href={activeTabConfig.path} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-border/60 hover:bg-card text-xs sm:text-sm h-10">
              <Globe size={15} className="mr-1.5 text-muted-foreground" />
              <span>Canlı Sayfayı Aç</span>
              <ExternalLink size={13} className="ml-1.5 opacity-60" />
            </Button>
          </Link>

          {/* Varsayılana Sıfırla */}
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-10"
            onPress={handleResetToDefault}
            disabled={isSaving || isLoading}
          >
            <RotateCcw size={15} className="mr-1.5" />
            <span>Şablonu Getir</span>
          </Button>

          {/* Kaydet ve Yayına Al */}
          <Button 
            variant="primary" 
            className="font-semibold text-xs sm:text-sm h-10 px-5 shadow-lg shadow-primary/20"
            onPress={handleSaveAndPublish}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                <span>Kaydet & Yayına Al</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Sekme Seçici ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const isDirty = dirtyTabs[tab.id];
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                isSelected 
                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-sm' 
                  : 'bg-card/40 border-border/50 hover:bg-card/70 hover:border-border'
              }`}
            >
              {isDirty && (
                <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary/10 ' + tab.color : 'bg-muted/10 text-muted-foreground'}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-mono text-muted-foreground/80">
                  {docs[tab.id]?.version || 'v2.0'}
                </span>
              </div>

              <span className={`font-bold text-sm mb-1 ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                {tab.name}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Durum & Görünüm Modu Çubuğu ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-card/60 border border-border/50 rounded-2xl">
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Canlıda Yayında
          </span>

          {dirtyTabs[activeTab] ? (
            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
              <AlertCircle size={14} />
              Kaydedilmemiş Değişiklikler Var
            </span>
          ) : lastSavedTimes[activeTab] ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={14} />
              Son Güncelleme: {lastSavedTimes[activeTab]}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Madde Sayısı: <strong className="text-foreground">{activeDoc.sections?.length || 0}</strong>
            </span>
          )}
        </div>

        {/* Görünüm Geçişi */}
        <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'edit' ? 'bg-primary text-background font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 size={13} />
            <span>Sadece Düzenle</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'split' ? 'bg-primary text-background font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns size={13} />
            <span>Yan Yana (Canlı)</span>
          </button>

          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'preview' ? 'bg-primary text-background font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye size={13} />
            <span>Önizleme</span>
          </button>
        </div>
      </div>

      {/* ── Ana İçerik Grid ── */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* ── Sol Taraf: Editör Formu ── */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`space-y-6 ${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-6' : 'max-w-4xl mx-auto w-full'}`}>
            
            {/* 1. Üst Metadata Kartı */}
            <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  Belge Genel Bilgileri
                </span>
                <span className="text-xs font-mono text-muted-foreground">ID: {activeDoc.id}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                  Resmi Belge Başlığı
                </label>
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-sm font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Örn: READIXON KULLANIM KOŞULLARI SÖZLEŞMESİ"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                    Yürürlük Tarihi
                  </label>
                  <input
                    type="text"
                    value={activeDoc.effectiveDate}
                    onChange={(e) => handleFieldChange('effectiveDate', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="Örn: 08.07.2026"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                    Sürüm / Versiyon Kodu
                  </label>
                  <input
                    type="text"
                    value={activeDoc.version}
                    onChange={(e) => handleFieldChange('version', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-border/60 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                    placeholder="Örn: v2.1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                  Kısa Açıklama / Alt Başlık (SEO ve Paylaşım)
                </label>
                <input
                  type="text"
                  value={activeDoc.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="Kullanıcı Sözleşmesi ve Yasal Haklar"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">
                  Giriş / Açılış Paragrafı (Lead Paragraph)
                </label>
                <textarea
                  rows={4}
                  value={activeDoc.leadText || ''}
                  onChange={(e) => handleFieldChange('leadText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary resize-y leading-relaxed font-sans"
                  placeholder="Sözleşmenin taraflarını ve giriş beyanını buraya yazın..."
                />
              </div>
            </div>

            {/* 2. Maddeler Listesi */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    Sözleşme Maddeleri ({activeDoc.sections?.length || 0})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Maddelerin sırasını değiştirebilir, HTML veya düz metin olarak güncelleyebilirsiniz.
                  </p>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/30 text-primary hover:bg-primary/10 text-xs h-9"
                  onPress={handleAddSection}
                >
                  <Plus size={15} className="mr-1" />
                  Yeni Madde Ekle
                </Button>
              </div>

              {activeDoc.sections?.map((section, idx) => (
                <div 
                  key={section.id || idx}
                  className="bg-card rounded-2xl border border-border/50 p-4 sm:p-5 space-y-3 transition-all hover:border-border/80"
                >
                  {/* Madde Başlığı & Taşıma Kontrolleri */}
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border/60 text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                      placeholder="Madde Başlığı"
                    />

                    {/* Sıralama & Silme */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveSectionUp(idx)}
                        disabled={idx === 0}
                        title="Yukarı Taşı"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => handleMoveSectionDown(idx)}
                        disabled={idx === activeDoc.sections.length - 1}
                        title="Aşağı Taşı"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(idx)}
                        title="Maddeyi Sil"
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Madde İçeriği */}
                  <div>
                    <textarea
                      rows={6}
                      value={section.content}
                      onChange={(e) => handleSectionContentChange(idx, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border/50 text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:border-primary resize-y leading-relaxed"
                      placeholder="<p>Madde içeriği HTML veya metin olarak...</p>"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1 px-1">
                      <span>HTML etiketleri desteklenir: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</span>
                      <span>Karakter: {section.content?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Alt Yeni Madde Ekle Butonu */}
              <button
                onClick={handleAddSection}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                <span>Bu Sözleşmeye Yeni Madde / Bölüm Ekle</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Sağ Taraf: Canlı Önizleme Kartı ── */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-6' : 'max-w-4xl mx-auto w-full'}`}>
            <div className="sticky top-20 space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <Eye size={14} />
                  Canlı Kullanıcı Görünümü (Önizleme)
                </span>
                <span className="font-mono">readixon.com{activeTabConfig.path}</span>
              </div>

              <div className="max-h-[calc(100vh-160px)] overflow-y-auto rounded-2xl border border-border/50 shadow-xl pr-1">
                <LegalDocumentView
                  documentType={activeTab}
                  initialData={activeDoc}
                  previewDoc={activeDoc}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
