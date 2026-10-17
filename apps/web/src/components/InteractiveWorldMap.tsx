'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { 
  UniverseMap, 
  UniverseMapMarker, 
  MapMarkerIcon, 
  UniverseLocation, 
  UniverseTimelineEvent 
} from '@readixon/core';
import { 
  Building2, 
  Home, 
  Mountain, 
  Trees, 
  Anchor, 
  Landmark, 
  Swords, 
  EyeOff, 
  Compass, 
  Zap, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Plus, 
  X, 
  Trash2, 
  Edit3, 
  Lock, 
  ShieldAlert, 
  CloudFog, 
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { Button, Typography } from '@readixon/ui';
import { toast } from 'sonner';

interface InteractiveWorldMapProps {
  map: UniverseMap;
  locations?: UniverseLocation[];
  events?: UniverseTimelineEvent[];
  isEditable?: boolean; // Yazar düzenleme modu mu?
  currentChapterOrder?: number; // Okuyucu için spoiler eşiği kontrolü
  onAddMarker?: (marker: Omit<UniverseMapMarker, 'id'>) => Promise<void>;
  onUpdateMarker?: (markerId: string, marker: Partial<UniverseMapMarker>) => Promise<void>;
  onDeleteMarker?: (markerId: string) => Promise<void>;
  onMarkerClick?: (marker: UniverseMapMarker) => void;
}

const ICON_CONFIG: Record<MapMarkerIcon, { label: string; icon: React.ElementType; defaultColor: string }> = {
  city: { label: 'Şehir / Başkent', icon: Building2, defaultColor: '#3b82f6' },
  village: { label: 'Köy / Kasaba', icon: Home, defaultColor: '#10b981' },
  castle: { label: 'Kale / Hisar', icon: Landmark, defaultColor: '#8b5cf6' },
  mountain: { label: 'Dağ / Zirve', icon: Mountain, defaultColor: '#64748b' },
  forest: { label: 'Orman / Koru', icon: Trees, defaultColor: '#059669' },
  port: { label: 'Liman / Kıyı', icon: Anchor, defaultColor: '#0ea5e9' },
  ruins: { label: 'Harabeler / Kalıntı', icon: Landmark, defaultColor: '#d97706' },
  battlefield: { label: 'Savaş Meydanı', icon: Swords, defaultColor: '#ef4444' },
  secret: { label: 'Gizli Bölge', icon: EyeOff, defaultColor: '#ec4899' },
  temple: { label: 'Tapınak / Mabet', icon: Compass, defaultColor: '#f59e0b' },
  cave: { label: 'Mağara / Zindan', icon: Mountain, defaultColor: '#78716c' },
  portal: { label: 'Geçit / Portal', icon: Zap, defaultColor: '#a855f7' },
  other: { label: 'Diğer İşaret', icon: MapPin, defaultColor: '#6366f1' },
};

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#64748b', // Slate
];

export function InteractiveWorldMap({
  map,
  locations = [],
  events = [],
  isEditable = false,
  currentChapterOrder = 9999,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker,
  onMarkerClick,
}: InteractiveWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Zoom ve Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Seçili Marker (Detay Kartı)
  const [activeMarker, setActiveMarker] = useState<UniverseMapMarker | null>(null);

  // Marker Ekleme / Düzenleme Modalı
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);
  const [editingMarker, setEditingMarker] = useState<UniverseMapMarker | null>(null);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ x: number; y: number } | null>(null);

  // Form State'leri
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState<MapMarkerIcon>('city');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formLocationId, setFormLocationId] = useState('');
  const [formEventId, setFormEventId] = useState('');
  const [formIsSpoiler, setFormIsSpoiler] = useState(false);
  const [formSpoilerThreshold, setFormSpoilerThreshold] = useState('');
  const [formFogOfWar, setFormFogOfWar] = useState(false);
  const [isSavingMarker, setIsSavingMarker] = useState(false);

  // Zoom kontrolleri
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Harita Pan (Sürükleme) Mantığı
  const handleMouseDown = (e: React.MouseEvent) => {
    // Sadece sol tıklamada ve modal kapalıyken sürükleme başlat
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Haritaya Tıklama (Yazar Modunda Pin Ekleme)
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEditable || !onAddMarker) return;
    
    // Eğer kullanıcı haritayı sürüklüyorsa pin ekleme modalını açma
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Yüzdesel koordinat hesaplama (0 - 100%)
    const pctX = Math.round((clickX / rect.width) * 1000) / 10;
    const pctY = Math.round((clickY / rect.height) * 1000) / 10;

    setEditingMarker(null);
    setNewMarkerCoords({ x: pctX, y: pctY });
    setFormTitle('');
    setFormDesc('');
    setFormIcon('city');
    setFormColor('#6366f1');
    setFormLocationId('');
    setFormEventId('');
    setFormIsSpoiler(false);
    setFormSpoilerThreshold('');
    setFormFogOfWar(false);
    setIsMarkerModalOpen(true);
  };

  // Marker Düzenleme Modalı Aç
  const openEditMarkerModal = (m: UniverseMapMarker, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMarker(m);
    setNewMarkerCoords({ x: m.x, y: m.y });
    setFormTitle(m.title);
    setFormDesc(m.description || '');
    setFormIcon(m.icon);
    setFormColor(m.color || '#6366f1');
    setFormLocationId(m.locationId || '');
    setFormEventId(m.eventId || '');
    setFormIsSpoiler(m.isSpoiler || false);
    setFormSpoilerThreshold(m.spoilerThresholdChapter ? String(m.spoilerThresholdChapter) : '');
    setFormFogOfWar(m.fogOfWar || false);
    setIsMarkerModalOpen(true);
  };

  // Marker Kaydet / Güncelle
  const handleSaveMarker = async () => {
    if (!formTitle.trim()) {
      toast.error('İşaretçi başlığı boş bırakılamaz.');
      return;
    }

    const locObj = locations.find((l) => l.id === formLocationId);
    const evObj = events.find((e) => e.id === formEventId);

    const markerData: Omit<UniverseMapMarker, 'id'> = {
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      icon: formIcon,
      color: formColor,
      x: newMarkerCoords?.x || 50,
      y: newMarkerCoords?.y || 50,
      locationId: formLocationId || undefined,
      locationName: locObj?.name || undefined,
      eventId: formEventId || undefined,
      eventName: evObj?.title || undefined,
      isSpoiler: formIsSpoiler,
      spoilerThresholdChapter: formSpoilerThreshold ? Number(formSpoilerThreshold) : undefined,
      fogOfWar: formFogOfWar,
    };

    setIsSavingMarker(true);
    try {
      if (editingMarker && onUpdateMarker) {
        await onUpdateMarker(editingMarker.id, markerData);
        toast.success('İşaretçi güncellendi.');
      } else if (onAddMarker) {
        await onAddMarker(markerData);
        toast.success('İşaretçi haritaya eklendi.');
      }
      setIsMarkerModalOpen(false);
      setEditingMarker(null);
      setNewMarkerCoords(null);
    } catch (err) {
      console.error(err);
      toast.error('İşaretçi kaydedilirken hata oluştu.');
    } finally {
      setIsSavingMarker(false);
    }
  };

  // Marker Sil
  const handleDeleteMarker = async (markerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteMarker) return;
    if (!confirm('Bu işaretçiyi haritadan kaldırmak istediğinize emin misiniz?')) return;

    try {
      await onDeleteMarker(markerId);
      toast.success('İşaretçi silindi.');
      if (activeMarker?.id === markerId) {
        setActiveMarker(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('İşaretçi silinemedi.');
    }
  };

  // Bağlı Mekân Detayı
  const activeLinkedLocation = useMemo(() => {
    if (!activeMarker?.locationId) return null;
    return locations.find((l) => l.id === activeMarker.locationId);
  }, [activeMarker, locations]);

  // Bağlı Olay Detayı
  const activeLinkedEvent = useMemo(() => {
    if (!activeMarker?.eventId) return null;
    return events.find((e) => e.id === activeMarker.eventId);
  }, [activeMarker, events]);

  const markers = map.markers || [];

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-border/40 select-none shadow-2xl flex flex-col">
      {/* ── Üst Araç Çubuğu (Toolbar) ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Harita Başlığı & Bilgisi */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-border/60 shadow-lg pointer-events-auto flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {map.title}
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {map.mapType}
              </span>
            </h3>
            {map.description && (
              <p className="text-xs text-slate-400 line-clamp-1">{map.description}</p>
            )}
          </div>
        </div>

        {/* Zoom & Görünüm Kontrolleri */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-border/60 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            title="Yakınlaştır (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold text-slate-400 px-1 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            title="Uzaklaştır (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-white/10 mx-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
            title="Görünümü Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Yazar Modu İpucu */}
      {isEditable && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-indigo-200 text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Haritada istediğiniz bir noktaya tıklayarak yeni işaretçi ekleyebilirsiniz.</span>
          </div>
        </div>
      )}

      {/* ── Harita Tuvali (Canvas / Pan Container) ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full flex items-center justify-center overflow-hidden relative cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative inline-block max-w-none shadow-2xl"
        >
          {/* Harita Resmi */}
          <img
            ref={imageRef}
            src={map.imageUrl}
            alt={map.title}
            onClick={handleImageClick}
            draggable={false}
            className="max-h-[850px] w-auto object-contain rounded-lg pointer-events-auto block"
          />

          {/* ── Harita İşaretçileri (Pins) ── */}
          {markers.map((marker) => {
            const isSpoilerLocked =
              !isEditable &&
              marker.isSpoiler &&
              (marker.spoilerThresholdChapter || 0) > currentChapterOrder;
            const isFog = !isEditable && marker.fogOfWar && isSpoilerLocked;

            const iconData = ICON_CONFIG[marker.icon] || ICON_CONFIG.other;
            const IconComp = iconData.icon;
            const pinColor = marker.color || iconData.defaultColor;

            return (
              <div
                key={marker.id}
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMarker(marker);
                  if (onMarkerClick) onMarkerClick(marker);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 transition-transform hover:scale-125 hover:z-30"
              >
                {/* Sis Perdesi Durumu (Fog of War) */}
                {isFog ? (
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center backdrop-blur-sm shadow-md text-slate-400">
                      <CloudFog className="w-4 h-4" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-50">
                      <div className="bg-slate-900/95 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-700 shadow-xl">
                        🌫️ Keşfedilmemiş Bölge
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing Glow Ring */}
                    <span
                      style={{ backgroundColor: pinColor }}
                      className="absolute w-6 h-6 rounded-full opacity-40 animate-ping pointer-events-none"
                    />

                    {/* Pin Gövdesi */}
                    <div
                      style={{
                        backgroundColor: pinColor,
                        boxShadow: `0 0 14px ${pinColor}80`,
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg transition-transform active:scale-90"
                    >
                      {isSpoilerLocked ? (
                        <Lock className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <IconComp className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-50 animate-in fade-in duration-150">
                      <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-border/60 shadow-2xl flex items-center gap-1.5">
                        <span style={{ color: pinColor }}>●</span>
                        <span>{isSpoilerLocked ? 'Gizli Konum' : marker.title}</span>
                        {isSpoilerLocked && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1 py-0.2 rounded font-normal">
                            Bölüm {marker.spoilerThresholdChapter}+
                          </span>
                        )}
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-border/60" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Seçili Marker Mini Kartı / Detay Paneli ── */}
      {activeMarker && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: activeMarker.color || '#6366f1' }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
              >
                {React.createElement(
                  (ICON_CONFIG[activeMarker.icon] || ICON_CONFIG.other).icon,
                  { className: 'w-5 h-5' }
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {activeMarker.title}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {(ICON_CONFIG[activeMarker.icon] || ICON_CONFIG.other).label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isEditable && (
                <>
                  <button
                    type="button"
                    onClick={(e) => openEditMarkerModal(activeMarker, e)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteMarker(activeMarker.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveMarker(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Açıklama */}
          {activeMarker.description && (
            <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-border/40">
              {activeMarker.description}
            </p>
          )}

          {/* Bağlı Mekân Detayı */}
          {activeLinkedLocation && (
            <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                Bağlı Mekân
              </span>
              <p className="font-semibold text-white">{activeLinkedLocation.name}</p>
              {activeLinkedLocation.description && (
                <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">
                  {activeLinkedLocation.description}
                </p>
              )}
            </div>
          )}

          {/* Bağlı Olay Detayı */}
          {activeLinkedEvent && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                Tarihsel Olay ({activeLinkedEvent.era || activeLinkedEvent.customDate || 'Zaman'})
              </span>
              <p className="font-semibold text-white">{activeLinkedEvent.title}</p>
              {activeLinkedEvent.summary && (
                <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">
                  {activeLinkedEvent.summary}
                </p>
              )}
            </div>
          )}

          {/* Spoiler Uyarısı */}
          {activeMarker.isSpoiler && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Bölüm {activeMarker.spoilerThresholdChapter || 1}+ sonrası için spoiler içerir</span>
            </div>
          )}
        </div>
      )}

      {/* ── Marker Ekleme / Düzenleme Modalı ── */}
      {isMarkerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-border/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                {editingMarker ? 'İşaretçiyi Düzenle' : 'Haritaya İşaretçi Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMarkerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Başlık */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                İşaretçi Adı *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Örn: Aeryon Başkenti, Kuzey Geçidi"
                className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Kısa Açıklama
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Bu bölge veya nokta hakkında kısa bilgi..."
                rows={2}
                className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* İkon Seçimi */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                İkon Türü
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(ICON_CONFIG) as MapMarkerIcon[]).map((key) => {
                  const item = ICON_CONFIG[key];
                  const Icon = item.icon;
                  const isSelected = formIcon === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormIcon(key)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Renk Seçimi */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                İşaretçi Rengi
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                      formColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                  >
                    {formColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bağlantılar (Mekân & Olay) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mekân Defterine Bağla
                </label>
                <select
                  value={formLocationId}
                  onChange={(e) => setFormLocationId(e.target.value)}
                  className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Bağlantı Yok</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tarihsel Olaya Bağla
                </label>
                <select
                  value={formEventId}
                  onChange={(e) => setFormEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-border/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Bağlantı Yok</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.era || ev.customDate || 'Zaman'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spoiler & Sis Perdesi (Fog of War) */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-border/60 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsSpoiler}
                  onChange={(e) => setFormIsSpoiler(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-border/60"
                />
                <span className="text-xs font-semibold text-white">Spoiler İçeriyor</span>
              </label>

              {formIsSpoiler && (
                <div className="grid grid-cols-2 gap-2 pt-1 pl-6">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Açılacağı Bölüm Sırası
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formSpoilerThreshold}
                      onChange={(e) => setFormSpoilerThreshold(e.target.value)}
                      placeholder="Örn: 5"
                      className="w-full bg-slate-900 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={formFogOfWar}
                        onChange={(e) => setFormFogOfWar(e.target.checked)}
                        className="rounded text-indigo-600 bg-slate-900 border-border/60"
                      />
                      <span>Sis Perdesi (Gizle)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="secondary"
                onPress={() => setIsMarkerModalOpen(false)}
                className="text-xs py-2 px-4 rounded-xl"
              >
                İptal
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveMarker}
                disabled={isSavingMarker}
                className="text-xs py-2 px-5 font-bold rounded-xl shadow-lg"
              >
                {isSavingMarker ? 'Kaydediliyor...' : editingMarker ? 'Güncelle' : 'Haritaya Ekle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
