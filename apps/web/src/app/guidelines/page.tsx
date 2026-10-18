import { Metadata } from 'next';
import { BackButton } from '@/components/BackButton';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { DEFAULT_LEGAL_DOCS } from '@readixon/core';

export const metadata: Metadata = {
  title: 'Topluluk Kuralları & İçerik İlkeleri',
  description: 'Readixon Topluluk Kuralları, Saygı Çerçevesi ve Güvenli Edebiyat Yönergeleri.',
};

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <LegalDocumentView documentType="guidelines" initialData={DEFAULT_LEGAL_DOCS.guidelines} />
      </div>
    </div>
  );
}
