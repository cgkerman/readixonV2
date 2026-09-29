import type { Metadata } from 'next';
import { POPULAR_TAGS } from '@readixon/core';

interface CategoryMetadataConfig {
  title: string;
  description: string;
}

const STATIC_CATEGORY_META: Record<string, CategoryMetadataConfig> = {
  'recent': {
    title: 'Yeni Çıkan Hikayeler & Kitaplar',
    description: 'Readixon\'da yazarların yeni paylaştığı en taze hikayeleri ve bölümleri ilk siz keşfedin.',
  },
  'recently-updated': {
    title: 'Taze Çıkanlar & Yeni Bölümler',
    description: 'Son günlerde yeni bölümleri eklenen ve güncellenen en popüler hikaye serilerini keşfedin.',
  },
  'top': {
    title: 'En Çok Okunan ve Popüler Hikayeler',
    description: 'Topluluğun en çok okuduğu, haftanın trendi olan popüler roman ve hikayeleri okuyun.',
  },
  'recommended': {
    title: 'Sana Özel & Günün Trend Hikayeleri',
    description: 'İlgi alanlarınıza ve en sevilen türlere göre seçilmiş özel hikaye önerileri.',
  },
  'completed': {
    title: 'Tamamlanmış Kitaplar & Biten Seriler',
    description: 'Yeni bölüm beklemeden başından sonuna kadar tek solukta bitirebileceğiniz tamamlanmış eserler.',
  },
  'most-liked': {
    title: 'En Çok Beğenilen Hikayeler',
    description: 'Okurlardan en yüksek beğeni ve övgü alan Readixon\'ın en gözde eserleri.',
  },
  'all': {
    title: 'Tüm Hikayeler & Kitap Kataloğu',
    description: 'Readixon\'daki binlerce orijinal kurguyu, romanı ve webtoonu filtreleyerek keşfedin.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const categoryKey = params.category.toLowerCase();
  const canonicalUrl = `https://readixon.com/explore/${params.category}`;

  // 1. Statik Kategori Kontrolü
  if (STATIC_CATEGORY_META[categoryKey]) {
    const meta = STATIC_CATEGORY_META[categoryKey];
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${meta.title} | Readixon`,
        description: meta.description,
        url: canonicalUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${meta.title} | Readixon`,
        description: meta.description,
      },
    };
  }

  // 2. Popüler Tür / Etiket Kontrolü
  const matchedTag = POPULAR_TAGS.find(t => t.id.toLowerCase() === categoryKey);
  if (matchedTag) {
    const title = `${matchedTag.label} Hikayeleri ve Kitapları`;
    const description = `Readixon'da en popüler ${matchedTag.label} türündeki orijinal hikayeleri, romanları ve serileri keşfedip okuyun.`;
    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${title} | Readixon`,
        description,
        url: canonicalUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Readixon`,
        description,
      },
    };
  }

  // 3. Genel Fallback
  const formattedCategory = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
  const fallbackTitle = `${formattedCategory} Hikayeleri`;
  const fallbackDesc = `Readixon'da ${formattedCategory} kategorisindeki en yeni ve popüler hikayeleri keşfedin.`;

  return {
    title: fallbackTitle,
    description: fallbackDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${fallbackTitle} | Readixon`,
      description: fallbackDesc,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default function CategoryExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
