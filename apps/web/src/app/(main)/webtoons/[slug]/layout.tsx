import type { Metadata } from 'next';
import { getStoryById, getUserProfile, getPublishedChapters, extractStoryIdFromSlug, generateStorySlug } from '@readixon/core';

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

    const title = `${story.title} - Webtoon Oku | Readixon`;
    const description = story.summary || `${story.title} renkli webtoon serisini Readixon'da yüksek kalitede, dikey kaydırma konforuyla okuyun.`;
    const canonicalSlug = generateStorySlug(story.title, story.storyId);
    const canonicalUrl = `https://readixon.com/webtoons/${canonicalSlug}`;

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
  let chapters: any[] = [];

  if (storyId) {
    try {
      const [fetchedStory, fetchedChapters] = await Promise.all([
        getStoryById(storyId),
        getPublishedChapters(storyId).catch(() => []),
      ]);
      story = fetchedStory;
      chapters = fetchedChapters || [];
      if (story?.authorId) {
        author = await getUserProfile(story.authorId).catch(() => null);
      }
    } catch (e) {
      console.error("WebtoonLayout error fetching details:", e);
    }
  }

  const canonicalSlug = story ? generateStorySlug(story.title, story.storyId) : params.slug;

  // 1. Comic / Book Schema (Google Rich Snippet)
  const comicJsonLd = story ? {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": story.title,
    "description": story.summary || `${story.title} renkli webtoon serisini Readixon'da okuyun.`,
    "url": `https://readixon.com/webtoons/${canonicalSlug}`,
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
    ...(chapters && chapters.length > 0 ? {
      "hasPart": chapters.map((c, idx) => ({
        "@type": "Chapter",
        "position": idx + 1,
        "name": c.title || `Bölüm ${idx + 1}`,
        "url": `https://readixon.com/read/${story!.storyId}/${c.chapterId}`
      }))
    } : {}),
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
        "item": `https://readixon.com/webtoons/${canonicalSlug}`
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
      {/* SSR Semantic SEO Content for Googlebot & Web Crawlers */}
      {story && (
        <article className="sr-only" aria-label="Webtoon Bilgileri ve Bölümler">
          <h1>{story.title}</h1>
          <p>{story.summary}</p>
          {author && (
            <p>
              Çizer/Yazar: <a href={`https://readixon.com/profile/@${author.username || ''}`}>{author.displayName || author.username}</a>
            </p>
          )}
          {story.tags && story.tags.length > 0 && (
            <p>Etiketler: {story.tags.join(', ')}</p>
          )}
          {chapters.length > 0 && (
            <nav aria-label="Webtoon Bölümleri Listesi">
              <h2>Bölümler</h2>
              <ul>
                {chapters.map((c, i) => (
                  <li key={c.chapterId}>
                    <a href={`https://readixon.com/read/${story!.storyId}/${c.chapterId}`}>
                      {c.title || `${i + 1}. Bölüm`}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </article>
      )}
      {children}
    </>
  );
}
