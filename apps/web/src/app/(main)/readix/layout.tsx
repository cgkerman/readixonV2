import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Readix Akışı | Readixon',
  description: 'Okurların kısa düşüncelerini, alıntılarını ve kitap sohbetlerini paylaştığı canlı sosyal ağ. Fikirlerinizi özgürce paylaşın!',
  keywords: ['kitap sohbeti', 'okur ağı', 'kitap alıntıları', 'kısa düşünceler', 'readix', 'readixon sosyal'],
  openGraph: {
    title: 'Readix Akışı - Canlı Edebiyat Ağı',
    description: 'Kitap kurtlarının anlık düşüncelerini ve alıntılarını paylaştığı, edebiyat odaklı canlı sosyal ağımıza katılın.',
    url: 'https://readixon.com/readix',
  },
  twitter: {
    title: 'Readix Akışı | Readixon',
    description: 'Edebiyat dünyasının nabzını tut. Okuduklarını paylaş ve tartış.',
    card: 'summary_large_image',
  }
};

export default function ReadixLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
