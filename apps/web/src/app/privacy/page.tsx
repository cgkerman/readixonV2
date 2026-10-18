import { Metadata } from 'next';
import { BackButton } from '@/components/BackButton';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { DEFAULT_LEGAL_DOCS } from '@readixon/core';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası & KVKK',
  description: 'Readixon Gizlilik Politikası, KVKK Aydınlatma Metni ve Veri Güvenliği Standartları.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <LegalDocumentView documentType="privacy" initialData={DEFAULT_LEGAL_DOCS.privacy} />
      </div>
    </div>
  );
}
