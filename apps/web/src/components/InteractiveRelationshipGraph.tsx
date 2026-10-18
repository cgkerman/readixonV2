'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Character, CharacterRelationship, UniverseLocation } from '@readixon/core';
import { 
  Users, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Lock, 
  ShieldAlert, 
  Sparkles, 
  Heart, 
  Swords, 
  Smile, 
  Compass, 
  Flame, 
  Check, 
  Share2,
  Filter,
  EyeOff,
  UserCheck,
  Save,
  Loader2
} from 'lucide-react';
import { Button, Typography } from '@readixon/ui';
import { toast } from 'sonner';

export interface GraphNode {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  isSpoiler?: boolean;
  spoilerThresholdChapter?: number;
  x: number;
  y: number;
  radius: number;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  relationshipType: string;
  description?: string;
  isReciprocal?: boolean;
  isSecret?: boolean;
  spoilerThresholdChapter?: number;
}

interface InteractiveRelationshipGraphProps {
  characters: Character[];
  locations?: UniverseLocation[];
  isEditable?: boolean;
  currentChapterOrder?: number;
  initialLayout?: Record<string, { x: number; y: number }>;
  onSaveLayout?: (positions: Record<string, { x: number; y: number }>) => Promise<void> | void;
  onAddRelationship?: (sourceId: string, rel: CharacterRelationship) => Promise<void>;
  onDeleteRelationship?: (sourceId: string, targetId: string) => Promise<void>;
  onSelectCharacter?: (char: Character) => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'dost', label: 'Dost / Arkadaş', color: '#10b981', category: 'positive' },
  { value: 'müttefik', label: 'Müttefik', color: '#0ea5e9', category: 'positive' },
  { value: 'düşman', label: 'Düşman', color: '#ef4444', category: 'negative' },
  { value: 'rakip', label: 'Rakip', color: '#f97316', category: 'negative' },
  { value: 'aile', label: 'Aile / Akraba', color: '#f59e0b', category: 'family' },
  { value: 'aşk', label: 'Aşk / Sevgili', color: '#ec4899', category: 'romance' },
  { value: 'mentor', label: 'Usta / Mentor', color: '#8b5cf6', category: 'mentor' },
  { value: 'çırak', label: 'Çırak / Öğrenci', color: '#6366f1', category: 'mentor' },
  { value: 'gizli_bağ', label: 'Gizli Bağ', color: '#a855f7', category: 'secret' },
  { value: 'diğer', label: 'Diğer Bağ', color: '#64748b', category: 'other' },
];

function getRelationshipColor(type: string, isSecret?: boolean): string {
  if (isSecret) return '#a855f7';
  const match = RELATIONSHIP_TYPES.find(
    (t) => t.value.toLowerCase() === type.toLowerCase() || t.label.toLowerCase().includes(type.toLowerCase())
  );
  return match ? match.color : '#6366f1';
}

export function InteractiveRelationshipGraph({
  characters = [],
  locations = [],
  isEditable = false,
  currentChapterOrder = 9999,
  initialLayout,
  onSaveLayout,
  onAddRelationship,
  onDeleteRelationship,
  onSelectCharacter,
}: InteractiveRelationshipGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom ve Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node Dragging & Layout Persistence State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(initialLayout || {});
  const [hasUnsavedLayout, setHasUnsavedLayout] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>(initialLayout || {});

  // initialLayout prop'u yüklendiğinde veya değiştiğinde senkronize et
  useEffect(() => {
    if (initialLayout && Object.keys(initialLayout).length > 0) {
      setNodePositions(initialLayout);
      nodePositionsRef.current = initialLayout;
    }
  }, [initialLayout]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Filtreler & Arama
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Seçili Öğe (Detay Kartı)
  const [selectedNode, setSelectedNode] = useState<Character | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  // Yeni İlişki Ekleme Modalı
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSourceId, setModalSourceId] = useState('');
  const [modalTargetId, setModalTargetId] = useState('');
  const [modalType, setModalType] = useState('dost');
  const [modalDesc, setModalDesc] = useState('');
  const [modalIsReciprocal, setModalIsReciprocal] = useState(true);
  const [modalIsSecret, setModalIsSecret] = useState(false);
  const [modalSpoilerThreshold, setModalSpoilerThreshold] = useState('');
  const [isSavingRel, setIsSavingRel] = useState(false);

  // ── 1. Düğümleri ve Kenarları İnşa Et (Nodes & Edges) ──
  const { nodes, edges } = useMemo(() => {
    // Okuyucu modunda spoiler filtreleme
    const visibleChars = characters.filter((c) => {
      if (isEditable) return true;
      if (c.isSpoiler && (c.spoilerThresholdChapter || 0) > currentChapterOrder) return false;
      return true;
    });

    const edgeList: GraphEdge[] = [];
    const seenEdges = new Set<string>();

    visibleChars.forEach((sourceChar) => {
      (sourceChar.relationships || []).forEach((rel, idx) => {
        // Okuyucu modunda gizli veya spoiler olan ilişkileri gizle
        if (!isEditable) {
          if (rel.isSecret) return;
          if (rel.spoilerThresholdChapter && rel.spoilerThresholdChapter > currentChapterOrder) return;
        }

        const targetChar = visibleChars.find((c) => c.id === rel.targetCharacterId);
        if (!targetChar) return;

        // Çift yönlü aynı ilişkiyi tek çizgi olarak çizmek için kontrol
        const edgeKey = [sourceChar.id, targetChar.id].sort().join('___');
        if (rel.isReciprocal && seenEdges.has(edgeKey)) return;
        seenEdges.add(edgeKey);

        edgeList.push({
          id: `edge_${sourceChar.id}_${targetChar.id}_${idx}`,
          sourceId: sourceChar.id,
          targetId: targetChar.id,
          sourceName: sourceChar.name,
          targetName: targetChar.name,
          relationshipType: rel.relationshipType || 'dost',
          description: rel.description,
          isReciprocal: rel.isReciprocal,
          isSecret: rel.isSecret,
          spoilerThresholdChapter: rel.spoilerThresholdChapter,
        });
      });
    });

    // Otomatik Dairesel / Radial Yerleşim
    const centerX = 450;
    const centerY = 320;
    const radius = Math.min(260, Math.max(160, visibleChars.length * 28));

    const nodeList: GraphNode[] = visibleChars.map((char, index) => {
      // Eğer kullanıcı düğümü elle taşıdıysa o pozisyonu kullan
      const customPos = nodePositions[char.id];
      if (customPos) {
        return {
          id: char.id,
          name: char.name,
          avatarUrl: char.avatarUrl,
          role: char.role,
          isSpoiler: char.isSpoiler,
          spoilerThresholdChapter: char.spoilerThresholdChapter,
          x: customPos.x,
          y: customPos.y,
          radius: char.role === 'protagonist' ? 32 : 26,
        };
      }

      // Dairesel açı
      const angle = (index / Math.max(visibleChars.length, 1)) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        id: char.id,
        name: char.name,
        avatarUrl: char.avatarUrl,
        role: char.role,
        isSpoiler: char.isSpoiler,
        spoilerThresholdChapter: char.spoilerThresholdChapter,
        x,
        y,
        radius: char.role === 'protagonist' ? 32 : 26,
      };
    });

    return { nodes: nodeList, edges: edgeList };
  }, [characters, nodePositions, isEditable, currentChapterOrder]);

  // Filtrelenmiş Kenarlar (Relationship Type & Focus Filter)
  const filteredEdges = useMemo(() => {
    return edges.filter((edge) => {
      // Tür Filtresi
      if (selectedTypeFilter !== 'all') {
        const typeMatch = edge.relationshipType.toLowerCase().includes(selectedTypeFilter.toLowerCase());
        if (!typeMatch) return false;
      }

      // Odak (Focus) Modu: Eğer bir düğüme odaklanıldıysa sadece ona bağlı kenarları göster
      if (focusedNodeId) {
        if (edge.sourceId !== focusedNodeId && edge.targetId !== focusedNodeId) {
          return false;
        }
      }

      return true;
    });
  }, [edges, selectedTypeFilter, focusedNodeId]);

  // Düğüm Pozisyon Haritası (Hızlı erişim için)
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Zoom Kontrolleri
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFocusedNodeId(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Pan (Tuvali Sürükleme) Mantığı
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || draggingNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId && isEditable) {
      // Düğümü Tuvalde Taşıma
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      const newPos = { x: Math.round(mouseX), y: Math.round(mouseY) };
      setNodePositions((prev) => {
        const updated = {
          ...prev,
          [draggingNodeId]: newPos,
        };
        nodePositionsRef.current = updated;
        return updated;
      });
      setHasUnsavedLayout(true);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggingNodeId && isEditable && onSaveLayout) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          setIsSavingLayout(true);
          await onSaveLayout(nodePositionsRef.current);
          setHasUnsavedLayout(false);
        } catch (err) {
          console.error('İlişki ağı otomatik kaydedilemedi:', err);
        } finally {
          setIsSavingLayout(false);
        }
      }, 1200);
    }
    setDraggingNodeId(null);
  };

  // Düzeni Manuel Kaydet
  const handleManualSaveLayout = async () => {
    if (!onSaveLayout) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setIsSavingLayout(true);
    try {
      await onSaveLayout(nodePositionsRef.current);
      setHasUnsavedLayout(false);
      toast.success('İlişki ağı yerleşimi kaydedildi');
    } catch (err) {
      console.error('İlişki ağı yerleşimi kaydedilemedi:', err);
      toast.error('Yerleşim kaydedilemedi');
    } finally {
      setIsSavingLayout(false);
    }
  };

  // Dairesel Düzene Sıfırla
  const handleResetLayout = async () => {
    if (!isEditable) return;
    if (!window.confirm('Tüm karakter düğümlerini dairesel varsayılan yerleşime sıfırlamak istediğinize emin misiniz?')) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setNodePositions({});
    nodePositionsRef.current = {};
    setHasUnsavedLayout(false);
    if (onSaveLayout) {
      setIsSavingLayout(true);
      try {
        await onSaveLayout({});
        toast.success('Yerleşim varsayılan dairesel düzene sıfırlandı');
      } catch (err) {
        console.error('Yerleşim sıfırlanamadı:', err);
        toast.error('Yerleşim sıfırlanamadı');
      } finally {
        setIsSavingLayout(false);
      }
    }
  };

  // Düğüme Tıklama
  const handleNodeClick = (node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const char = characters.find((c) => c.id === node.id);
    if (!char) return;

    setSelectedEdge(null);
    if (focusedNodeId === node.id) {
      // Zaten odaklıysa odağı kaldır
      setFocusedNodeId(null);
      setSelectedNode(null);
    } else {
      setFocusedNodeId(node.id);
      setSelectedNode(char);
    }

    if (onSelectCharacter) onSelectCharacter(char);
  };

  // Kenara (İlişkiye) Tıklama
  const handleEdgeClick = (edge: GraphEdge, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(null);
    setSelectedEdge(edge);
  };

  // İlişki Ekleme
  const handleSaveRelationship = async () => {
    if (!modalSourceId || !modalTargetId) {
      toast.error('Lütfen kaynak ve hedef karakterleri seçin.');
      return;
    }
    if (modalSourceId === modalTargetId) {
      toast.error('Bir karakter kendisiyle ilişkilendirilemez.');
      return;
    }

    const targetChar = characters.find((c) => c.id === modalTargetId);

    const rel: CharacterRelationship = {
      targetCharacterId: modalTargetId,
      targetCharacterName: targetChar?.name || '',
      targetCharacterAvatar: targetChar?.avatarUrl,
      relationshipType: modalType,
      description: modalDesc.trim() || undefined,
      isReciprocal: modalIsReciprocal,
      isSecret: modalIsSecret,
      spoilerThresholdChapter: modalSpoilerThreshold ? Number(modalSpoilerThreshold) : undefined,
    };

    setIsSavingRel(true);
    try {
      if (onAddRelationship) {
        await onAddRelationship(modalSourceId, rel);
        toast.success('İlişki başarıyla eklendi.');
        setIsAddModalOpen(false);
        setModalDesc('');
        setModalSpoilerThreshold('');
      }
    } catch (err) {
      console.error(err);
      toast.error('İlişki kaydedilemedi.');
    } finally {
      setIsSavingRel(false);
    }
  };

  // İlişki Silme
  const handleDeleteRelationship = async (sourceId: string, targetId: string) => {
    if (!onDeleteRelationship) return;
    if (!confirm('Bu ilişki bağını kaldırmak istediğinize emin misiniz?')) return;

    try {
      await onDeleteRelationship(sourceId, targetId);
      toast.success('İlişki bağı silindi.');
      setSelectedEdge(null);
    } catch (err) {
      console.error(err);
      toast.error('İlişki silinemedi.');
    }
  };

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-border/40 select-none shadow-2xl flex flex-col">
      {/* ── Üst Araç Çubuğu (Toolbar) ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Başlık ve Filtreler */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-border/60 shadow-lg pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white hidden sm:inline">Karakter İlişki Ağı</span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Tür Filtresi */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-950 border border-border/60 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Tüm İlişkiler ({edges.length})</option>
            <option value="dost">Dost & Müttefik</option>
            <option value="düşman">Düşman & Rakip</option>
            <option value="aile">Aile</option>
            <option value="aşk">Aşk</option>
            <option value="mentor">Usta-Çırak</option>
            <option value="gizli_bağ">Gizli Bağlar</option>
          </select>

          {/* Odak Sıfırla (Eğer varsa) */}
          {focusedNodeId && (
            <button
              onClick={() => {
                setFocusedNodeId(null);
                setSelectedNode(null);
              }}
              className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-1"
            >
              <span>Filtreyi Temizle</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sağ Üst: Zoom & Ekleme Butonları */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-border/60 shadow-lg pointer-events-auto">
          {isEditable && (
            <button
              type="button"
              onClick={() => {
                setModalSourceId(characters[0]?.id || '');
                setModalTargetId(characters[1]?.id || '');
                setIsAddModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1 active:scale-95 mr-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>İlişki Ekle</span>
            </button>
          )}

          {isEditable && onSaveLayout && (
            <div className="flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={handleManualSaveLayout}
                disabled={isSavingLayout}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
                  hasUnsavedLayout
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-border/50'
                }`}
                title="Düğüm Konumlarını Kaydet"
              >
                {isSavingLayout ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span className="hidden sm:inline">Kaydediliyor...</span>
                  </>
                ) : hasUnsavedLayout ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Düzeni Kaydet</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 hidden sm:inline">Kaydedildi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetLayout}
                disabled={isSavingLayout}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                title="Dairesel Düzene Sıfırla"
              >
                <RotateCcw className="w-4 h-4 text-slate-400 hover:text-amber-400" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold text-slate-400 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-white/10 mx-0.5" />
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            title="Tuvali Merkeze Al"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alt Sol İpucu */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-900/80 backdrop-blur-md border border-border/60 text-slate-400 text-[11px] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Düğümleri sürükleyebilir, üzerlerine tıklayarak bağlarını öne çıkarabilirsiniz.</span>
        </div>
      </div>

      {/* ── SVG Tuval (Graph Canvas) ── */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        className={`w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab ${
          isPanning ? 'cursor-grabbing' : ''
        }`}
      >
        <svg
          className="w-full h-full absolute inset-0 pointer-events-auto"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        >
          {/* SVG Marker Defs (Ok Uçları & Filtreler) */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {RELATIONSHIP_TYPES.map((t) => (
              <marker
                key={t.value}
                id={`arrow-${t.value}`}
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={t.color} />
              </marker>
            ))}
          </defs>

          {/* Dönüştürülmüş İçerik Grubu (Transform / Pan / Zoom) */}
          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            style={{ transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out' }}
          >
            {/* ── 1. BAĞLANTI ÇİZGİLERİ (EDGES) ── */}
            {filteredEdges.map((edge) => {
              const sourceNode = nodeMap.get(edge.sourceId);
              const targetNode = nodeMap.get(edge.targetId);
              if (!sourceNode || !targetNode) return null;

              const edgeColor = getRelationshipColor(edge.relationshipType, edge.isSecret);
              const isSelected = selectedEdge?.id === edge.id;
              const isDimmed =
                focusedNodeId &&
                sourceNode.id !== focusedNodeId &&
                targetNode.id !== focusedNodeId;

              // Yay / Eğri (Curved Line) Hesabı
              const dx = targetNode.x - sourceNode.x;
              const dy = targetNode.y - sourceNode.y;
              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;
              // Hafif eğri için orta noktadan normal doğrultuda sapma
              const curveOffsetX = -dy * 0.12;
              const curveOffsetY = dx * 0.12;
              const controlX = midX + curveOffsetX;
              const controlY = midY + curveOffsetY;

              const pathD = `M ${sourceNode.x} ${sourceNode.y} Q ${controlX} ${controlY} ${targetNode.x} ${targetNode.y}`;

              return (
                <g
                  key={edge.id}
                  onClick={(e) => handleEdgeClick(edge, e)}
                  className="cursor-pointer transition-opacity duration-200"
                  opacity={isDimmed ? 0.15 : 1}
                >
                  {/* Tıklama Alanını Genişleten Görünmez Çizgi */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={18}
                  />

                  {/* Ana Görsel Çizgi */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edgeColor}
                    strokeWidth={isSelected ? 3.5 : 2}
                    strokeDasharray={edge.isSecret ? '5,4' : undefined}
                    strokeOpacity={isSelected ? 1 : 0.8}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Çizgi Üstü Etiket (Pill Badge) */}
                  <g transform={`translate(${controlX}, ${controlY})`}>
                    <rect
                      x={-34}
                      y={-10}
                      width={68}
                      height={20}
                      rx={10}
                      fill="#0f172a"
                      stroke={edgeColor}
                      strokeWidth={1}
                      fillOpacity={0.95}
                    />
                    <text
                      textAnchor="middle"
                      y={3.5}
                      fill="#f8fafc"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {edge.relationshipType}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* ── 2. KARAKTER DÜĞÜMLERİ (NODES) ── */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id || focusedNodeId === node.id;
              const isDimmed =
                focusedNodeId &&
                node.id !== focusedNodeId &&
                !edges.some(
                  (e) =>
                    (e.sourceId === focusedNodeId && e.targetId === node.id) ||
                    (e.targetId === focusedNodeId && e.sourceId === node.id)
                );

              const roleColor =
                node.role === 'protagonist'
                  ? '#6366f1' // Indigo
                  : node.role === 'antagonist'
                  ? '#ef4444' // Red
                  : '#10b981'; // Emerald

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => {
                    if (!isEditable) return;
                    e.stopPropagation();
                    setDraggingNodeId(node.id);
                  }}
                  onClick={(e) => handleNodeClick(node, e)}
                  opacity={isDimmed ? 0.2 : 1}
                  className={`${isEditable ? (draggingNodeId === node.id ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'} transition-all duration-150 group`}
                >
                  {/* Dış Halka & Glow */}
                  <circle
                    r={node.radius + (isSelected ? 6 : 3)}
                    fill="none"
                    stroke={roleColor}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeOpacity={isSelected ? 1 : 0.4}
                    className="transition-all"
                  />

                  {/* Düğüm Arka Planı */}
                  <circle
                    r={node.radius}
                    fill="#1e293b"
                    className="group-hover:fill-slate-800 transition-colors"
                  />

                  {/* Avatar Görseli veya İsim Baş Harfi */}
                  {node.avatarUrl ? (
                    <>
                      <clipPath id={`clip-${node.id}`}>
                        <circle r={node.radius - 2} />
                      </clipPath>
                      <image
                        href={node.avatarUrl}
                        x={-node.radius}
                        y={-node.radius}
                        width={node.radius * 2}
                        height={node.radius * 2}
                        clipPath={`url(#clip-${node.id})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </>
                  ) : (
                    <text
                      textAnchor="middle"
                      y={5}
                      fill="#e2e8f0"
                      fontSize={node.radius > 28 ? 16 : 13}
                      fontWeight="bold"
                    >
                      {node.name.slice(0, 2).toUpperCase()}
                    </text>
                  )}

                  {/* Alt İsim Etiketi */}
                  <g transform={`translate(0, ${node.radius + 14})`}>
                    <rect
                      x={-Math.max(node.name.length * 3.5, 30)}
                      y={-9}
                      width={Math.max(node.name.length * 7, 60)}
                      height={18}
                      rx={9}
                      fill="#020617"
                      fillOpacity={0.9}
                      stroke={isSelected ? roleColor : 'rgba(255,255,255,0.1)'}
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      y={3.5}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {node.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── Seçili Düğüm (Karakter) Detay Kartı ── */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {selectedNode.avatarUrl ? (
                <img
                  src={selectedNode.avatarUrl}
                  alt={selectedNode.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-border/60 shadow-md"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                  {selectedNode.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {selectedNode.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                    {selectedNode.role}
                  </span>
                  {selectedNode.occupation && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {selectedNode.occupation}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedNode(null);
                setFocusedNodeId(null);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* İlişkiler Özeti */}
          <div className="mt-3.5 space-y-2 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Bağlantıları</span>
              <span>{(selectedNode.relationships || []).length} ilişki</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {(selectedNode.relationships || []).length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">
                  Henüz tanımlanmış bir ilişkisi yok.
                </p>
              ) : (
                selectedNode.relationships?.map((r, i) => {
                  const target = characters.find((c) => c.id === r.targetCharacterId);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-border/40 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{ backgroundColor: getRelationshipColor(r.relationshipType, r.isSecret) }}
                          className="w-2 h-2 rounded-full shrink-0"
                        />
                        <span className="font-bold text-white truncate">
                          {target?.name || r.targetCharacterName || 'Bilinmeyen'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({r.relationshipType})
                        </span>
                      </div>

                      {isEditable && (
                        <button
                          onClick={() => handleDeleteRelationship(selectedNode.id, r.targetCharacterId)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="İlişkiyi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {isEditable && (
              <button
                type="button"
                onClick={() => {
                  setModalSourceId(selectedNode.id);
                  setModalTargetId(characters.find((c) => c.id !== selectedNode.id)?.id || '');
                  setIsAddModalOpen(true);
                }}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bu Karaktere İlişki Ekle</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Seçili Kenar (İlişki Bağı) Detay Kartı ── */}
      {selectedEdge && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: getRelationshipColor(selectedEdge.relationshipType, selectedEdge.isSecret) }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md font-bold text-xs"
              >
                🔗
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400">
                  {selectedEdge.sourceName} ➔ {selectedEdge.targetName}
                </h4>
                <span
                  style={{ color: getRelationshipColor(selectedEdge.relationshipType, selectedEdge.isSecret) }}
                  className="text-sm font-extrabold capitalize"
                >
                  {selectedEdge.relationshipType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isEditable && (
                <button
                  type="button"
                  onClick={() => handleDeleteRelationship(selectedEdge.sourceId, selectedEdge.targetId)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="İlişkiyi Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEdge(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedEdge.description && (
            <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-border/40">
              {selectedEdge.description}
            </p>
          )}

          {selectedEdge.isSecret && (
            <div className="mt-2.5 p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-1.5 font-semibold">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Gizli İlişki (Okuyucudan gizlenir)</span>
            </div>
          )}

          {Boolean(selectedEdge.spoilerThresholdChapter) && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Bölüm {selectedEdge.spoilerThresholdChapter}+ sonrasında açılır</span>
            </div>
          )}
        </div>
      )}

      {/* ── İlişki Ekleme Modalı ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-border/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <span>Karakterler Arası İlişki Kur</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kaynak & Hedef Karakter */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1. Karakter *
                </label>
                <select
                  value={modalSourceId}
                  onChange={(e) => setModalSourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  2. Karakter *
                </label>
                <select
                  value={modalTargetId}
                  onChange={(e) => setModalTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* İlişki Türü */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                İlişki Türü *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RELATIONSHIP_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setModalType(t.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center gap-1.5 ${
                      modalType === t.value
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-border/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span style={{ backgroundColor: t.color }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Açıklama / Hikaye Bağlamı
              </label>
              <textarea
                value={modalDesc}
                onChange={(e) => setModalDesc(e.target.value)}
                placeholder="Örn: Çocukluktan beri ayrılmaz iki dost; ancak mühür olayından sonra araları açıldı..."
                rows={2}
                className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Seçenekler: Karşılıklı mı, Gizli mi, Spoiler mı? */}
            <div className="bg-slate-950 p-3 rounded-xl border border-border/60 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={modalIsReciprocal}
                  onChange={(e) => setModalIsReciprocal(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-900 border-border/60"
                />
                <span>Çift Yönlü İlişki (Her iki karakter için de geçerli)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={modalIsSecret}
                  onChange={(e) => setModalIsSecret(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-900 border-border/60"
                />
                <span>Gizli İlişki (Okuyucu tarafında gösterilmez)</span>
              </label>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Spoiler Eşiği (Hangi bölümden sonra okuyucuya açılsın?)
                </label>
                <input
                  type="number"
                  min={1}
                  value={modalSpoilerThreshold}
                  onChange={(e) => setModalSpoilerThreshold(e.target.value)}
                  placeholder="İsteğe bağlı, örn: 8"
                  className="w-full bg-slate-900 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="secondary"
                onPress={() => setIsAddModalOpen(false)}
                className="text-xs py-2 px-4 rounded-xl"
              >
                İptal
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveRelationship}
                disabled={isSavingRel}
                className="text-xs font-bold py-2 px-5 rounded-xl shadow-lg"
              >
                {isSavingRel ? 'Kaydediliyor...' : 'İlişkiyi Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
