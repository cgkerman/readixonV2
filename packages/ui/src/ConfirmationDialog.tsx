import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  isLoading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : variant === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle size={24} />
            </div>
            <Typography variant="h3">{title}</Typography>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted">
            <X size={20} />
          </button>
        </div>
        
        <Typography variant="body" className="text-muted mb-6">
          {message}
        </Typography>
        
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 rounded-full" onPress={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            className={`flex-1 rounded-full ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}`}
            onPress={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'İşleniyor...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
