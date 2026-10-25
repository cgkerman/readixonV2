'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@readixon/ui';
import { deleteClub } from '@readixon/core';

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  clubName: string;
  userId: string;
  onSuccess?: () => void;
}

export function DeleteClubModal({
  isOpen,
  onClose,
  clubId,
  clubName,
  userId,
  onSuccess,
}: DeleteClubModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isMatched = confirmName.trim().toLowerCase() === clubName.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isMatched) {
      toast.error('Lütfen kulüp adını tam olarak yazarak onaylayın.');
      return;
    }

    setSubmitting(true);
    try {
      await deleteClub(clubId, userId);
      toast.success(`"${clubName}" kulübü başarıyla silindi.`);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Kulüp silme hatası:', err);
      toast.error(err.message || 'Kulüp silinirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card border border-rose-500/30 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-rose-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Kulübü Sil</h2>
              <span className="text-xs text-rose-400 font-medium">Bu işlem geri alınamaz</span>
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
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-muted flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>"{clubName}"</strong> kulübünü ve buna bağlı tüm tartışma kanallarını, mesajları ve okuma seferini kalıcı olarak silmek üzeresiniz.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted">
              Onaylamak için kulüp adını (<span className="text-foreground font-bold">{clubName}</span>) yazın:
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={clubName}
              disabled={submitting}
              className="w-full bg-background border border-border/80 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted/50 focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 bg-muted/5 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            disabled={submitting}
            onPress={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Vazgeç
          </Button>
          <Button
            variant="primary"
            disabled={submitting || !isMatched}
            onPress={handleDelete}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Siliniyor...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Kulübü Kalıcı Olarak Sil</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
