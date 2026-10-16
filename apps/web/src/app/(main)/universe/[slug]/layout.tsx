import type { Metadata } from 'next';
import { getUniverseById, extractUniverseIdFromSlug, generateUniverseSlug, getUserProfile } from '@readixon/core';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const universeId = extractUniverseIdFromSlug(params.slug);

  if (!universeId) {
    return { title: 'Evren Detayı' };
  }

  try {
    const universe = await getUniverseById(universeId);
    if (!universe) {
      return { title: 'Evren Bulunamadı' };
    }

    const title = `${universe.title} - Kurgusal Evren | Readixon`;
    const description = universe.description 
      ? (universe.description.length > 160 ? `${universe.description.slice(0, 157)}...` : universe.description)
      : `${universe.title} kurgusal evreni, karakterleri, haritaları, kronolojisi ve hikayeleri Readixon'da.`;
    const canonicalSlug = generateUniverseSlug(universe.title, universe.universeId);
    const canonicalUrl = `https://readixon.com/universe/${canonicalSlug}`;
    const previewImage = universe.coverImage || universe.bannerImage;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${universe.title} | Readixon Evrenler`,
        description,
        url: canonicalUrl,
        images: previewImage ? [{ url: previewImage, alt: universe.title }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${universe.title} | Readixon Evrenler`,
        description,
        images: previewImage ? [previewImage] : [],
      },
    };
  } catch (error) {
    return { title: 'Evren Detayı' };
  }
}

export default async function UniverseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const universeId = extractUniverseIdFromSlug(params.slug);
  let universe = null;
  let author = null;

  if (universeId) {
    try {
      universe = await getUniverseById(universeId);
      if (universe?.authorId) {
        author = await getUserProfile(universe.authorId).catch(() => null);
      }
    } catch (e) {
      console.error("UniverseLayout error fetching details:", e);
    }
  }

  const canonicalSlug = universe ? generateUniverseSlug(universe.title, universe.universeId) : params.slug;
  const authorName = author?.displayName || author?.username || universe?.authorName || 'Yazar';
  const authorUsername = author?.username || universe?.authorUsername || '';

  // 1. CollectionPage / CreativeWorkSeries Schema
  const universeJsonLd = universe ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": universe.title,
    "description": universe.description || `${universe.title} evreni.`,
    "url": `https://readixon.com/universe/${canonicalSlug}`,
    "inLanguage": "tr-TR",
    ...(universe.coverImage || universe.bannerImage ? { "image": universe.coverImage || universe.bannerImage } : {}),
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
    ...(universe.genre ? { "genre": universe.genre } : {}),
    ...(universe.tags && universe.tags.length > 0 ? { "keywords": universe.tags.join(', ') } : {}),
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
        "name": "Evrenler",
        "item": "https://readixon.com/explore/all"
      },
      ...(universe ? [{
        "@type": "ListItem",
        "position": 3,
        "name": universe.title,
        "item": `https://readixon.com/universe/${canonicalSlug}`
      }] : [])
    ]
  };

  return (
    <>
      {universeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(universeJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* SSR Semantic SEO Content for Web Crawlers */}
      {universe && (
        <article className="sr-only" aria-label="Evren Detayları ve Bilgileri">
          <h1>{universe.title}</h1>
          <p>{universe.description}</p>
          <p>
            Yaratıcı: <a href={`https://readixon.com/profile/@${authorUsername}`}>{authorName}</a>
          </p>
          {universe.genre && <p>Tür: {universe.genre}</p>}
          {universe.tags && universe.tags.length > 0 && (
            <p>Etiketler: {universe.tags.join(', ')}</p>
          )}
          {universe.connectedStoryIds && universe.connectedStoryIds.length > 0 && (
            <p>Bağlantılı Eser Sayısı: {universe.connectedStoryIds.length}</p>
          )}
        </article>
      )}
      {children}
    </>
  );
}
