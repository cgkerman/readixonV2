import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import { LegalAgreementsCheckbox, AgreementType } from './LegalAgreementsCheckbox';
import { LegalAgreementModal } from './LegalAgreementModal';

function calculateTax(priceStr: string) {
  try {
    const rawNum = parseFloat(priceStr.replace(',', '.').replace(/[^\d.-]/g, ''));
    if (isNaN(rawNum)) return null;
    
    const basePrice = rawNum / 1.20;
    const taxAmount = rawNum - basePrice;
    
    return {
      base: basePrice.toFixed(2).replace('.', ',') + ' TL',
      tax: taxAmount.toFixed(2).replace('.', ',') + ' TL'
    };
  } catch (e) {
    return null;
  }
}

interface CheckoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageInfo: {
    id: string;
    name: string;
    price: string;
    period?: string;
  } | null;
  userInfo: {
    name: string;
    email: string;
  };
  isLoading?: boolean;
}

export function CheckoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  packageInfo,
  userInfo,
  isLoading
}: CheckoutConfirmationModalProps) {
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);
  const [activeAgreementType, setActiveAgreementType] = useState<AgreementType | null>(null);

  if (!isOpen || !packageInfo) return null;

  const handleConfirm = () => {
    if (!agreementsAccepted) {
      alert('Lütfen işleme devam etmek için sözleşmeleri onaylayın.');
      return;
    }
    onConfirm();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div 
          className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h3" className="text-xl font-bold">Satın Alma Onayı</Typography>
            <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted">
              <X size={20} />
            </button>
          </div>
          
          {/* Order Summary */}
          <div className="bg-muted/5 rounded-2xl p-5 mb-6 border border-border/50">
            <Typography variant="caption" className="text-muted font-semibold uppercase tracking-wider mb-3 block">
              Sipariş Özeti
            </Typography>
            
            {(() => {
              const taxDetails = calculateTax(packageInfo.price);
              
              return (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body" className="font-medium text-text">{packageInfo.name}</Typography>
                    <Typography variant="body" className="font-medium text-text">{taxDetails ? taxDetails.base : packageInfo.price}</Typography>
                  </div>
                  
                  {taxDetails && (
                    <div className="flex justify-between items-center mb-2">
                      <Typography variant="caption" className="text-muted font-medium">KDV (%20)</Typography>
                      <Typography variant="caption" className="text-muted font-medium">{taxDetails.tax}</Typography>
                    </div>
                  )}
                </>
              );
            })()}
            {packageInfo.period && (
              <Typography variant="caption" className="text-muted">
                Yenileme: {packageInfo.period}
              </Typography>
            )}
            
            <div className="h-px bg-border my-4" />
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <Typography variant="body" className="font-bold text-text">Toplam</Typography>
                <Typography variant="caption" className="text-muted text-[10px] uppercase tracking-wide">KDV Dahil</Typography>
              </div>
              <Typography variant="h3" className="text-xl font-black text-primary">{packageInfo.price}</Typography>
            </div>
          </div>
          
          <LegalAgreementsCheckbox 
            checked={agreementsAccepted} 
            onChange={setAgreementsAccepted} 
            onOpenTerms={(type) => setActiveAgreementType(type)}
            className="mb-8"
          />
          
          <Button 
            variant="primary" 
            className="w-full py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            onPress={handleConfirm} 
            disabled={isLoading || !agreementsAccepted}
          >
            <CreditCard size={20} />
            {isLoading ? 'Ödeme Ekranı Yükleniyor...' : 'Güvenli Ödemeye Geç'}
          </Button>
        </div>
      </div>

      {/* Dynamic Legal Agreements Modal */}
      <LegalAgreementModal 
        isOpen={activeAgreementType !== null}
        onClose={() => setActiveAgreementType(null)}
        type={activeAgreementType || 'on-bilgilendirme'}
        userInfo={userInfo}
        productInfo={{
          name: packageInfo.name,
          price: packageInfo.price,
          period: packageInfo.period
        }}
      />
    </>
  );
}
