import type { Metadata } from 'next';
import { getReadingListById, getStoryById } from '@readixon/core';

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

const DEFAULT_COVER_URL = 'https://readixon.com/images/default-reading-list.jpg';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listId = params.id;

  try {
    const list = await getReadingListById(listId);

    if (!list) {
      return {
        title: 'Okuma Listesi Bulunamadı | Readixon',
        description: 'Aradığınız okuma listesi bulunamadı veya silinmiş olabilir.',
      };
    }

    const title = `${list.title} | Readixon Okuma Listesi`;
    const description =
      list.description?.trim() ||
      `${list.userName || 'Readixon Okuru'} tarafından hazırlanan "${list.title}" okuma listesini keşfet ve hemen oku!`;
    const canonicalUrl = `https://readixon.com/list/${listId}`;

    // Görsel URL'sini mutlak (absolute) URL'ye çevir
    let imageUrl = DEFAULT_COVER_URL;

    if (list.coverUrl && list.coverUrl !== '/images/default-reading-list.jpg') {
      if (list.coverUrl.startsWith('http')) {
        imageUrl = list.coverUrl;
      } else {
        imageUrl = `https://readixon.com${list.coverUrl.startsWith('/') ? '' : '/'}${list.coverUrl}`;
      }
    } else if (list.storyIds && list.storyIds.length > 0) {
      // Eğer listenin kendi kapağı yoksa ilk kitabın kapağını almayı dene
      try {
        const firstStory = await getStoryById(list.storyIds[0]);
        if (firstStory?.coverImage) {
          imageUrl = firstStory.coverImage;
        }
      } catch (e) {
        // Fallback to default cover
      }
    }

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Readixon',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: list.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    return {
      title: 'Okuma Listesi | Readixon',
      description: 'En sevilen hikayeler ve özel okuma listeleri Readixon\'da.',
    };
  }
}

export default function ReadingListLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
