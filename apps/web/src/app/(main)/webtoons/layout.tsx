import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webtoon Oku - Renkli Çizgi Hikayeler',
  description: 'En popüler dijital webtoonları, manga ve renkli çizgi roman serilerini Readixon farkıyla Türkçe okuyun. Dikey kaydırma (scroll) konforuyla yeni serüvenlere dalın.',
  keywords: ['webtoon oku', 'türkçe webtoon', 'renkli çizgi roman', 'dijital webtoon', 'manhwa oku', 'readixon webtoon'],
  alternates: {
    canonical: 'https://readixon.com/webtoons',
  },
  openGraph: {
    title: 'Webtoon Oku - Renkli Çizgi Hikayeler | Readixon',
    description: 'En popüler dijital webtoonları ve renkli serileri hemen keşfedin.',
    url: 'https://readixon.com/webtoons',
    type: 'website',
  },
  twitter: {
    title: 'Webtoon Oku | Readixon',
    description: 'En popüler dijital webtoon serileri Readixon\'da!',
    card: 'summary_large_image',
  },
};

export default function WebtoonsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
