import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kütüphanem | Readixon',
  description: 'Şu an okuduğunuz kitaplar, kaydettiğiniz listeler ve favori yazar koleksiyonlarınız. Kütüphanenizi hemen keşfedin.',
  keywords: ['okuma listesi', 'favori kitaplar', 'dijital kütüphane', 'kaydedilen hikayeler'],
  openGraph: {
    title: 'Kütüphanem | Readixon',
    description: 'Şu an okuduğunuz kitaplar ve favori yazar koleksiyonlarınızı yönetin.',
    url: 'https://readixon.com/library',
  },
  twitter: {
    title: 'Kütüphanem | Readixon',
    description: 'Sana özel kütüphanende en sevdiğin eserleri sakla.',
    card: 'summary_large_image',
  }
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
