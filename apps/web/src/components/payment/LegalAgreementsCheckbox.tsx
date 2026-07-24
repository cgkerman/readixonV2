import React from 'react';

export type AgreementType = 'mesafeli-satis' | 'on-bilgilendirme' | 'iptal-iade';

interface LegalAgreementsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onOpenTerms: (type: AgreementType) => void;
  className?: string;
}

export function LegalAgreementsCheckbox({ 
  checked, 
  onChange, 
  onOpenTerms,
  className = '' 
}: LegalAgreementsCheckboxProps) {
  return (
    <div className={`flex items-start gap-3 mt-4 mb-2 ${className}`}>
      <div className="flex h-5 items-center">
        <input
          id="legal-agreements"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 mt-0.5 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
        />
      </div>
      <div className="text-sm text-muted">
        <label htmlFor="legal-agreements" className="font-medium cursor-pointer">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onOpenTerms('on-bilgilendirme'); }} 
            className="text-primary hover:underline font-semibold"
          >
            Ön Bilgilendirme Formu
          </button>
          'nu,{' '}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onOpenTerms('mesafeli-satis'); }} 
            className="text-primary hover:underline font-semibold"
          >
            Mesafeli Satış Sözleşmesi
          </button>
          'ni ve{' '}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onOpenTerms('iptal-iade'); }} 
            className="text-primary hover:underline font-semibold"
          >
            İptal ve İade Politikası
          </button>
          'nı okudum ve onaylıyorum.
        </label>
      </div>
    </div>
  );
}
