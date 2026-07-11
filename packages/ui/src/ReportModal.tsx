'use client';

import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';

const REPORT_REASONS = [
  'Spam veya yanıltıcı',
  'Nefret söylemi veya sembolleri',
  'Şiddet veya tehlikeli örgütler',
  'Çıplaklık veya cinsellik',
  'Taciz veya zorbalık',
  'Telif hakkı ihlali',
  'Diğer'
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  title?: string;
}

export function ReportModal({ isOpen, onClose, onSubmit, title = "İçeriği Şikayet Et" }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, details);
      onClose();
      // Reset after close
      setTimeout(() => {
        setSelectedReason('');
        setDetails('');
      }, 300);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <Flag size={20} />
            </div>
            <Typography variant="h3">{title}</Typography>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {REPORT_REASONS.map((reason) => (
            <label 
              key={reason} 
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedReason === reason 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border hover:bg-muted/5'
              }`}
            >
              <input 
                type="radio" 
                name="report_reason" 
                value={reason} 
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-primary/50"
              />
              <span className="font-medium">{reason}</span>
            </label>
          ))}
        </div>

        {selectedReason === 'Diğer' && (
          <div className="mb-6 animate-in slide-in-from-top-2">
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Lütfen detay belirtin..."
              className="w-full bg-background border border-border rounded-xl p-3 text-text text-sm resize-none h-20 focus:outline-none focus:border-primary/50"
            />
          </div>
        )}
        
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" className="flex-1 rounded-full" onPress={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            className="flex-1 rounded-full bg-red-500 hover:bg-red-600 border-red-500 text-white" 
            onPress={handleSubmit} 
            disabled={isSubmitting || !selectedReason || (selectedReason === 'Diğer' && !details.trim())}
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Şikayet Et'}
          </Button>
        </div>
      </div>
    </div>
  );
}
