import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hikayeleri Keşfet | Readixon',
  description: 'Farklı türlerde binlerce orijinal kurguyu türüne veya etiketlerine göre filtreleyerek bulun.',
  keywords: ['hikaye keşfet', 'roman oku', 'kitap kategorileri', 'türüne göre kitaplar', 'orijinal kurgular'],
  openGraph: {
    title: 'Hikayeleri Keşfet | Readixon',
    description: 'En sevdiğin edebi türdeki hikayeleri bul, filtrele ve binlerce yeni esere yelken aç.',
    url: 'https://readixon.com/explore',
  },
  twitter: {
    title: 'Hikayeleri Keşfet | Readixon',
    description: 'Aradığın o mükemmel hikaye seni bekliyor. Hemen keşfet!',
    card: 'summary_large_image',
  }
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
