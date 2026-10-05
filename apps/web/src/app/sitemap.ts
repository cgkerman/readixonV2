
import { MetadataRoute } from 'next';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, generateStorySlug, slugify, POPULAR_TAGS } from '@readixon/core';

export const revalidate = 3600; // Cache sitemap for 1 hour (ISR)

function toDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate();
    } catch {
      return new Date();
    }
  }
  if (typeof timestamp.toMillis === 'function') {
    try {
      return new Date(timestamp.toMillis());
    } catch {
      return new Date();
    }
  }
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://readixon.com';

  // 1. Statik & Ana Keşif Sayfaları
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/webtoons`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agenda`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/arena`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/readix`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/explore/all`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/explore/recent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore/top`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore/completed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore/authors`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sitemap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Yasal ve Bilgilendirme Sayfaları
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/copyright`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms/iptal-iade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms/mesafeli-satis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms/on-bilgilendirme`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Popüler Kategori / Tür Sayfaları
  const categoryPages: MetadataRoute.Sitemap = POPULAR_TAGS.map(tag => ({
    url: `${baseUrl}/explore/${tag.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const dynamicStoryPages: MetadataRoute.Sitemap = [];
  const dynamicUserPages: MetadataRoute.Sitemap = [];
  const dynamicNewsPages: MetadataRoute.Sitemap = [];
  const dynamicReviewPages: MetadataRoute.Sitemap = [];

  try {
    // 2. Yayınlanmış Hikayeler ve Webtoonlar
    const storiesRef = collection(db, 'stories');
    const storiesQuery = query(
      storiesRef,
      where('status', 'in', ['ongoing', 'completed', 'published']),
      limit(2000)
    );
    const storiesSnap = await getDocs(storiesQuery);

    storiesSnap.forEach(docSnap => {
      const data = docSnap.data();
      const storyId = docSnap.id;
      const title = data.title || 'hikaye';
      const slug = generateStorySlug(title, storyId);
      const isWebtoon = data.format === 'webtoon';
      const path = isWebtoon ? `/webtoons/${slug}` : `/story/${slug}`;

      dynamicStoryPages.push({
        url: `${baseUrl}${path}`,
        lastModified: toDate(data.updatedAt || data.createdAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error('Sitemap stories query error:', error);
  }

  try {
    // 3. Aktif Yazar / Kullanıcı Profilleri
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, limit(1000));
    const usersSnap = await getDocs(usersQuery);

    usersSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.username) {
        dynamicUserPages.push({
          url: `${baseUrl}/profile/@${data.username}`,
          lastModified: toDate(data.updatedAt || data.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch (error) {
    console.error('Sitemap users query error:', error);
  }

  try {
    // 4. Haberler ve Duyurular
    const newsRef = collection(db, 'announcements');
    const newsQuery = query(newsRef, limit(200));
    const newsSnap = await getDocs(newsQuery);

    newsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const slug = data.slug || `${slugify(data.title || 'haber')}-${docSnap.id}`;
      dynamicNewsPages.push({
        url: `${baseUrl}/news/${slug}`,
        lastModified: toDate(data.updatedAt || data.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error('Sitemap news query error:', error);
  }

  try {
    // 5. Editoryal İncelemeler
    const reviewsRef = collection(db, 'editorialReviews');
    const reviewsQuery = query(reviewsRef, limit(200));
    const reviewsSnap = await getDocs(reviewsQuery);

    reviewsSnap.forEach(docSnap => {
      const data = docSnap.data();
      dynamicReviewPages.push({
        url: `${baseUrl}/reviews/${docSnap.id}`,
        lastModified: toDate(data.updatedAt || data.createdAt),
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    });
  } catch (error) {
    console.error('Sitemap editorial reviews query error:', error);
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...dynamicStoryPages,
    ...dynamicUserPages,
    ...dynamicNewsPages,
    ...dynamicReviewPages,
  ];
}
