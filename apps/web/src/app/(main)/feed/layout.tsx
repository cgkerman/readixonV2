import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keşfet | Readixon',
  description: 'Farklı dünyalara yelken açmak ve yeni serüvenlere atılmak için binlerce orijinal hikayeyi keşfedin. Günün trendleri, sana özel öneriler ve en çok okunanlar.',
  keywords: ['kitap oku', 'yeni hikayeler', 'roman keşfet', 'ücretsiz kitap', 'readixon keşfet'],
  openGraph: {
    title: 'Keşfet | Readixon - Sınırları Aşan Hikayeler',
    description: 'En popüler seriler, günün trendleri ve sana özel önerilerle dolu geniş hikaye kütüphanesini keşfet.',
    url: 'https://readixon.com/feed',
  },
  twitter: {
    title: 'Keşfet | Readixon',
    description: 'Binlerce orijinal hikayeyi keşfet ve yepyeni maceralara atıl.',
    card: 'summary_large_image',
  }
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
