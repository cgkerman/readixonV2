import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gündem | Readixon',
  description: 'Günün sözü, popüler kitaplar, trend etiketler ve kültür sanat haberlerini takip edin.',
};

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
