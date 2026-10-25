'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldAlert, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@readixon/ui';
import { adminDeleteClub } from '@readixon/core';

interface AdminDeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  clubName: string;
  creatorName: string;
  membersCount: number;
  adminId: string;
  adminName: string;
  onSuccess?: () => void;
}

export function AdminDeleteClubModal({
  isOpen,
  onClose,
  clubId,
  clubName,
  creatorName,
  membersCount,
  adminId,
  adminName,
  onSuccess,
}: AdminDeleteClubModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error('Lütfen kulübün kapatılma gerekçesini yazın.');
      return;
    }

    if (trimmedReason.length < 5) {
      toast.error('Kapatılma gerekçesi en az 5 karakter olmalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      await adminDeleteClub(clubId, adminId, adminName, trimmedReason);
      toast.success(`"${clubName}" kulübü kapatıldı. Kulüp sahibine ve tüm üyelere gerekçeli bildirim iletildi.`);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Kulüp kapatma hatası:', err);
      toast.error('Kulüp kapatılırken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card border border-rose-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-rose-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Kulübü Kapat (Admin)</h2>
              <span className="text-xs text-rose-400 font-medium">Yönetici Müdahalesi & Üye Bildirimi</span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-background/80 p-3.5 rounded-2xl border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Kapatılacak Kulüp:</span>
              <span className="font-bold text-foreground">"{clubName}"</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-muted">Kulüp Kurucusu:</span>
              <span className="text-foreground">{creatorName}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-muted">Bildirim Gönderilecek Üye:</span>
              <span className="font-semibold text-rose-400">{membersCount} kişi (Tüm üyeler)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Kapatılma Gerekçesi / Açıklama <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn: Topluluk kurallarına aykırı söylemler ve telif hakları ihlali nedeniyle kulüp yönetici tarafından kapatılmıştır."
              rows={4}
              disabled={submitting}
              className="w-full bg-background border border-border/80 focus:border-rose-500 rounded-xl p-3 text-sm text-foreground outline-hidden transition-all placeholder:text-muted/60 resize-none"
            />
            <span className="text-[11px] text-muted block mt-1">
              Bu açıklama kulüp sahibine ve tüm üyelere gönderilecek bildirimde ve bildirim tıklandığında gösterilecektir.
            </span>
          </div>

          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed">
              <strong>Önemli:</strong> Bu işlem geri alınamaz. Kulüp kalıcı olarak sistemden kaldırılır, odalar ve sohbet erişime kapanır.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/50 bg-background/40 flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            onPress={onClose}
            disabled={submitting}
            className="text-xs font-medium"
          >
            Vazgeç
          </Button>
          <Button
            onPress={handleDelete}
            disabled={submitting || !reason.trim()}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-950/40"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Kapatılıyor...
              </>
            ) : (
              <>
                <ShieldAlert size={14} /> Kulübü Kapat ve Üyeleri Bilgilendir
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
