import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Öne Çıkan Yazarlar & Topluluk',
  description: 'Readixon\'un yetenekli kalemlerini, en popüler yazarlarını ve yeni nesil hikaye anlatıcılarını keşfedin. Yazarları takip edin ve yeni bölümlerden ilk siz haberdar olun.',
  keywords: ['yazarlar', 'popüler yazarlar', 'kitap yazarları', 'yazar topluluğu', 'readixon yazarlar'],
  alternates: {
    canonical: 'https://readixon.com/explore/authors',
  },
  openGraph: {
    title: 'Öne Çıkan Yazarlar & Edebi Topluluk | Readixon',
    description: 'Readixon\'un en popüler yazarlarını keşfedin ve takip edin.',
    url: 'https://readixon.com/explore/authors',
    type: 'website',
  },
  twitter: {
    title: 'Öne Çıkan Yazarlar | Readixon',
    description: 'Readixon\'un yetenekli kalemlerini keşfet!',
    card: 'summary_large_image',
  },
};

export default function AuthorsExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
