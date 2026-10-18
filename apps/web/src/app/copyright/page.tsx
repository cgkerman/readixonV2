import { Metadata } from 'next';
import { BackButton } from '@/components/BackButton';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { DEFAULT_LEGAL_DOCS } from '@readixon/core';

export const metadata: Metadata = {
  title: 'Telif Hakkı Politikası & DMCA',
  description: 'Readixon Telif Hakkı Politikası, Fikri Mülkiyet Hakları ve DMCA İhlal Bildirim Süreçleri.',
};

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <LegalDocumentView documentType="copyright" initialData={DEFAULT_LEGAL_DOCS.copyright} />
      </div>
    </div>
  );
}
