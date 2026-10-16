import type { Metadata } from 'next';
import { getSeriesBySlug, generateSeriesSlug, generateStorySlug, getUserProfile, getStoryById } from '@readixon/core';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const series = await getSeriesBySlug(params.slug);
    if (!series) {
      return { title: 'Seri Bulunamadı' };
    }

    const title = `${series.title} - Kitap Serisi | Readixon`;
    const description = series.description
      ? (series.description.length > 160 ? `${series.description.slice(0, 157)}...` : series.description)
      : `${series.title} serisi, tüm kitapları, okuma sırası ve bölümleriyle Readixon'da.`;
    const canonicalSlug = generateSeriesSlug(series.title, series.seriesId);
    const canonicalUrl = `https://readixon.com/series/${canonicalSlug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${series.title} | Readixon Seriler`,
        description,
        url: canonicalUrl,
        images: series.coverImage ? [{ url: series.coverImage, alt: series.title }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${series.title} | Readixon Seriler`,
        description,
        images: series.coverImage ? [series.coverImage] : [],
      },
    };
  } catch (error) {
    return { title: 'Seri Detayı' };
  }
}

export default async function SeriesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  let series = null;
  let author = null;
  let bookStories: any[] = [];

  try {
    series = await getSeriesBySlug(params.slug);
    if (series) {
      if (series.authorId) {
        author = await getUserProfile(series.authorId).catch(() => null);
      }
      if (series.books && series.books.length > 0) {
        const fetchedStories = await Promise.all(
          series.books.map(b => getStoryById(b.storyId).catch(() => null))
        );
        bookStories = fetchedStories.filter(Boolean);
      }
    }
  } catch (e) {
    console.error("SeriesLayout error fetching details:", e);
  }

  const canonicalSlug = series ? generateSeriesSlug(series.title, series.seriesId) : params.slug;
  const authorName = author?.displayName || author?.username || series?.authorName || 'Yazar';
  const authorUsername = author?.username || series?.authorUsername || '';

  // 1. CreativeWorkSeries Schema
  const seriesJsonLd = series ? {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    "name": series.title,
    "description": series.description || `${series.title} kitap serisi.`,
    "url": `https://readixon.com/series/${canonicalSlug}`,
    "inLanguage": "tr-TR",
    ...(series.coverImage ? { "image": series.coverImage } : {}),
    ...(authorName ? {
      "author": {
        "@type": "Person",
        "name": authorName,
        ...(authorUsername ? { "url": `https://readixon.com/profile/@${authorUsername}` } : {}),
      }
    } : {}),
    "publisher": {
      "@type": "Organization",
      "name": "Readixon",
      "url": "https://readixon.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://readixon.com/icon.png"
      }
    },
    ...(series.tags && series.tags.length > 0 ? { "keywords": series.tags.join(', ') } : {}),
    ...(bookStories.length > 0 ? {
      "hasPart": bookStories.map((b, idx) => ({
        "@type": "Book",
        "position": idx + 1,
        "name": b.title,
        "url": `https://readixon.com/story/${generateStorySlug(b.title, b.storyId)}`
      }))
    } : {}),
  } : null;

  // 2. BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://readixon.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Seriler",
        "item": "https://readixon.com/explore/all"
      },
      ...(series ? [{
        "@type": "ListItem",
        "position": 3,
        "name": series.title,
        "item": `https://readixon.com/series/${canonicalSlug}`
      }] : [])
    ]
  };

  return (
    <>
      {seriesJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* SSR Semantic SEO Content for Web Crawlers */}
      {series && (
        <article className="sr-only" aria-label="Kitap Serisi Detayları ve Kitaplar">
          <h1>{series.title}</h1>
          <p>{series.description}</p>
          <p>
            Yazar: <a href={`https://readixon.com/profile/@${authorUsername}`}>{authorName}</a>
          </p>
          {series.tags && series.tags.length > 0 && (
            <p>Tür: {series.tags.join(', ')}</p>
          )}
          {bookStories.length > 0 && (
            <nav aria-label="Serideki Kitaplar Listesi">
              <h2>Serideki Kitaplar</h2>
              <ol>
                {bookStories.map((book) => (
                  <li key={book.storyId}>
                    <a href={`https://readixon.com/story/${generateStorySlug(book.title, book.storyId)}`}>
                      {book.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </article>
      )}
      {children}
    </>
  );
}
