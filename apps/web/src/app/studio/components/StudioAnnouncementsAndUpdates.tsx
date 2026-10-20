'use client';

import React, { useEffect, useState } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  ExternalLink, 
  X, 
  ChevronRight, 
  Clock, 
  Calendar,
  CheckCircle2,
  Bell,
  Feather,
  Info
} from 'lucide-react';
import { subscribeToActiveAnnouncements, sanitizeHtml, type Announcement } from '@readixon/core';
import { LATEST_SYSTEM_UPDATE } from '@/lib/latestUpdate';

export const StudioAnnouncementsAndUpdates: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'update' | 'announcements'>('update');
  
  // Modallar
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Realtime onSnapshot ile anlık canlı duyuru dinleyicisi
    const unsubscribe = subscribeToActiveAnnouncements((liveAnnouncements) => {
      setAnnouncements(liveAnnouncements);
      if (liveAnnouncements.length > 0) {
        setActiveTab('announcements');
      }
      setLoading(false);
    }, 5);

    return () => {
      unsubscribe();
    };
  }, []);

  const formatDate = (ts?: any) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const latestAnnouncement = announcements[0];

  return (
    <>
      <div className="w-full mb-6 sm:mb-8 rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-md p-4 sm:p-5 shadow-xs overflow-hidden">
        {/* Üst Başlık & Sekmeler */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-primary/15 text-primary border border-primary/25 shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-muted/10'
              }`}
            >
              <Megaphone size={14} className={activeTab === 'announcements' ? 'text-primary' : 'text-muted'} />
              <span>Duyurular</span>
              {announcements.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('update')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'update'
                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25 shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-muted/10'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'update' ? 'text-amber-500' : 'text-muted'} />
              <span>Son Güncelleme ({LATEST_SYSTEM_UPDATE.version})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted self-end sm:self-center">
            {activeTab === 'announcements' ? (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Anlık</span>
                </span>
                <span>• {announcements.length} Aktif Duyuru</span>
              </div>
            ) : (
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {LATEST_SYSTEM_UPDATE.date}
              </span>
            )}
          </div>
        </div>

        {/* Sekme 1: Admin Duyuruları */}
        {activeTab === 'announcements' && (
          <div className="pt-3.5">
            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Duyurular kontrol ediliyor...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-5 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-muted/10 flex items-center justify-center text-muted">
                  <Bell size={18} />
                </div>
                <p className="text-xs text-muted">Şu an için yeni bir platform duyurusu bulunmuyor.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('update')}
                  className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1 mt-1"
                >
                  Son Güncelleme Bilgisini İncele <ChevronRight size={13} />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* En Son Duyuru Öne Çıkarılan Kart */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-card/70 border border-border/40 hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {latestAnnouncement.imageUrl ? (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted/20 shrink-0 border border-border/40">
                        <img 
                          src={latestAnnouncement.imageUrl} 
                          alt={latestAnnouncement.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Megaphone size={19} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                          {latestAnnouncement.category === 'culture' ? 'Kültür & Sanat' : 'Platform Duyurusu'}
                        </span>
                        <span className="text-[11px] text-muted">
                          {formatDate(latestAnnouncement.createdAt || latestAnnouncement.publishAt)}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                        {latestAnnouncement.title}
                      </h3>
                      <p 
                        className="text-xs text-muted line-clamp-1 sm:line-clamp-2 mt-0.5"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHtml(latestAnnouncement.content?.replace(/<[^>]+>/g, ' ') || '') 
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedAnnouncement(latestAnnouncement)}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Duyuruyu Oku</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Diğer Duyurular Varsa Küçük Liste */}
                {announcements.length > 1 && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted">Önceki Duyurular:</span>
                    {announcements.slice(1).map((ann) => (
                      <button
                        key={ann.id}
                        type="button"
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-card/50 hover:bg-card border border-border/40 text-muted hover:text-foreground transition-all truncate max-w-[240px]"
                      >
                        {ann.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sekme 2: Son Yapılan Güncelleme Bilgisi (v2.4) */}
        {activeTab === 'update' && (
          <div className="pt-3.5">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-card/70 to-card/70 border border-amber-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                  <Feather size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      {LATEST_SYSTEM_UPDATE.version} • {LATEST_SYSTEM_UPDATE.badge}
                    </span>
                    <span className="text-[11px] text-muted">
                      {LATEST_SYSTEM_UPDATE.date}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-1">
                    {LATEST_SYSTEM_UPDATE.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-1 sm:line-clamp-2 mt-0.5">
                    {LATEST_SYSTEM_UPDATE.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-xs font-extrabold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Neler Yeni?</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DUYURU OKUMA MODALI ── */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Megaphone size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                    Platform Duyurusu
                  </span>
                  <span className="text-[11px] text-muted">
                    {formatDate(selectedAnnouncement.createdAt || selectedAnnouncement.publishAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="w-8 h-8 rounded-xl bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {selectedAnnouncement.imageUrl && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-muted/20 border border-border/40">
                  <img 
                    src={selectedAnnouncement.imageUrl} 
                    alt={selectedAnnouncement.title}
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              <h2 className="text-lg sm:text-xl font-black text-foreground">
                {selectedAnnouncement.title}
              </h2>

              <div 
                className="text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedAnnouncement.content || '') }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/40 flex items-center justify-between bg-card/60">
              {selectedAnnouncement.link ? (
                <a
                  href={selectedAnnouncement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Detaylı Bağlantıyı Aç</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-muted/20 hover:bg-muted/30 text-foreground text-xs font-bold transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SON GÜNCELLEME (v2.4) DETAY MODALI ── */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 to-card">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
                    {LATEST_SYSTEM_UPDATE.version} Sürüm Notları
                  </span>
                  <span className="text-[11px] text-muted">
                    {LATEST_SYSTEM_UPDATE.date}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <h2 className="text-lg font-black text-foreground mb-2">
                  {LATEST_SYSTEM_UPDATE.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {LATEST_SYSTEM_UPDATE.desc}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-foreground block">
                  Bu Güncellemede Neler Var?
                </span>
                {LATEST_SYSTEM_UPDATE.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-card/60 border border-border/40">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground/90 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/40 flex items-center justify-end bg-card/60">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-xs font-extrabold transition-all"
              >
                Anladım, Harika!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
