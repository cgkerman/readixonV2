import React from 'react';
import { X, Sparkles, Wand2, Star, CheckCircle2 } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function PaywallModal({ onClose, onUpgrade }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-primary/20 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Decor */}
        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent absolute top-0 left-0 right-0 pointer-events-none" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors z-50 bg-background/50 p-2 rounded-full backdrop-blur-sm cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8 relative z-10 pt-12 flex flex-col items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-6">
            <Wand2 size={40} className="text-primary" />
          </div>
          
          <Typography variant="h2" className="font-black mb-2 text-text">Kurgu Sihirbazı Limitine Ulaştınız</Typography>
          <Typography variant="body" className="text-muted mb-8 max-w-sm">
            Ücretsiz ilk hikaye planlama hakkınızı kullandınız. Kurgu Sihirbazı ile yeni hikayeler planlamaya devam etmek için Premium'a geçin.
          </Typography>

          <div className="w-full bg-muted/5 border border-border rounded-2xl p-5 mb-8 text-left space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <Typography variant="body" className="font-bold text-text">Sınırsız Sihirbaz Kullanımı</Typography>
                <Typography variant="caption" className="text-muted">İstediğiniz kadar hikayeyi profesyonel şablonlarla planlayın.</Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <Typography variant="body" className="font-bold text-text">RPG Karakter Gelişimi</Typography>
                <Typography variant="caption" className="text-muted">Karakter istatistiklerini sınırsız yönetin.</Typography>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <Button variant="primary" className="w-full h-12 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" onPress={onUpgrade}>
              <Star size={20} className="fill-current" />
              Premium'a Yükselt
            </Button>
            <Button variant="ghost" className="w-full text-muted" onPress={onClose}>
              Sadece Düz Metin İle Devam Et
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
