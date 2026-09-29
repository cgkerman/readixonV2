import type { Metadata } from 'next';
import { getStoryById, getPublishedChapters, generateStorySlug } from '@readixon/core';

export async function generateMetadata({
  params,
}: {
  params: { storyId: string; chapterId: string };
}): Promise<Metadata> {
  try {
    const [story, chapters] = await Promise.all([
      getStoryById(params.storyId),
      getPublishedChapters(params.storyId),
    ]);

    if (!story) return { title: 'Bölüm Oku' };

    const currentChapter = chapters.find(c => c.chapterId === params.chapterId);
    const chapterTitle = currentChapter?.title ? currentChapter.title : 'Bölüm';
    const pageTitle = `${chapterTitle} - ${story.title}`;
    const description = `${story.title} adlı eserin "${chapterTitle}" bölümünü Readixon'da kesintisiz okuyun.`;
    const canonicalUrl = `https://readixon.com/read/${params.storyId}/${params.chapterId}`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${pageTitle} | Readixon`,
        description,
        url: canonicalUrl,
        images: story.coverImage ? [{ url: story.coverImage, alt: story.title }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} | Readixon`,
        description,
        images: story.coverImage ? [story.coverImage] : [],
      },
    };
  } catch {
    return { title: 'Bölüm Oku' };
  }
}

export default async function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storyId: string; chapterId: string };
}) {
  let story = null;
  let currentChapter = null;

  try {
    const [fetchedStory, chapters] = await Promise.all([
      getStoryById(params.storyId),
      getPublishedChapters(params.storyId),
    ]);
    story = fetchedStory;
    currentChapter = chapters.find(c => c.chapterId === params.chapterId);
  } catch (e) {
    console.error("ChapterLayout error:", e);
  }

  const chapterTitle = currentChapter?.title || 'Bölüm';

  // 1. Chapter Schema
  const chapterJsonLd = story ? {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "name": chapterTitle,
    "isPartOf": {
      "@type": "Book",
      "name": story.title,
      "url": `https://readixon.com/story/${generateStorySlug(story.title, params.storyId)}`,
    },
    "url": `https://readixon.com/read/${params.storyId}/${params.chapterId}`,
    ...(story.coverImage ? { "image": story.coverImage } : {}),
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
        "name": "Keşfet",
        "item": "https://readixon.com/feed"
      },
      ...(story ? [{
        "@type": "ListItem",
        "position": 3,
        "name": story.title,
        "item": `https://readixon.com/story/${generateStorySlug(story.title, params.storyId)}`
      }] : []),
      {
        "@type": "ListItem",
        "position": 4,
        "name": chapterTitle,
        "item": `https://readixon.com/read/${params.storyId}/${params.chapterId}`
      }
    ]
  };

  return (
    <>
      {chapterJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterJsonLd) }}
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
