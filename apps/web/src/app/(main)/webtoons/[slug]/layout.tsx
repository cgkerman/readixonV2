import type { Metadata } from 'next';
import { getStoryById, getUserProfile, extractStoryIdFromSlug } from '@readixon/core';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const storyId = extractStoryIdFromSlug(params.slug);
  
  if (!storyId) {
    return { title: 'Webtoon Bulunamadı' };
  }

  try {
    const story = await getStoryById(storyId);
    if (!story) {
      return { title: 'Webtoon Bulunamadı' };
    }

    const title = `${story.title} - Webtoon Oku`;
    const description = story.summary || `${story.title} renkli webtoon serisini Readixon'da yüksek kalitede, dikey kaydırma konforuyla okuyun.`;
    const canonicalUrl = `https://readixon.com/webtoons/${params.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${story.title} - Webtoon Oku | Readixon`,
        description,
        url: canonicalUrl,
        images: story.coverImage ? [{ url: story.coverImage, alt: story.title }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${story.title} - Webtoon Oku | Readixon`,
        description,
        images: story.coverImage ? [story.coverImage] : [],
      },
    };
  } catch (error) {
    return { title: 'Webtoon' };
  }
}

export default async function WebtoonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const storyId = extractStoryIdFromSlug(params.slug);
  let story = null;
  let author = null;

  if (storyId) {
    try {
      story = await getStoryById(storyId);
      if (story?.authorId) {
        author = await getUserProfile(story.authorId);
      }
    } catch (e) {
      console.error("WebtoonLayout error fetching details:", e);
    }
  }

  // 1. Comic / Book Schema (Google Rich Snippet)
  const comicJsonLd = story ? {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": story.title,
    "description": story.summary || `${story.title} renkli webtoon serisini Readixon'da okuyun.`,
    "url": `https://readixon.com/webtoons/${params.slug}`,
    ...(story.coverImage ? { "image": story.coverImage } : {}),
    "inLanguage": "tr-TR",
    ...(author ? {
      "author": {
        "@type": "Person",
        "name": author.displayName || author.username || 'Yazar / Çizer',
        "url": `https://readixon.com/profile/@${author.username || ''}`,
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
    "genre": ["Webtoon", ...(story.tags || [])],
    ...(story.stats?.rating && story.stats.rating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": story.stats.rating,
        "bestRating": "10",
        "worstRating": "1",
        "ratingCount": Math.max(1, story.stats.reviewCount || story.stats.likes || 1),
        "reviewCount": Math.max(1, story.stats.reviewCount || 1)
      }
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
        "name": "Webtoonlar",
        "item": "https://readixon.com/webtoons"
      },
      ...(story ? [{
        "@type": "ListItem",
        "position": 3,
        "name": story.title,
        "item": `https://readixon.com/webtoons/${params.slug}`
      }] : [])
    ]
  };

  return (
    <>
      {comicJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(comicJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
