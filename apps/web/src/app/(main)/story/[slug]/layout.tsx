import type { Metadata } from 'next';
import { getStoryById, extractStoryIdFromSlug } from '@readixon/core';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const storyId = extractStoryIdFromSlug(params.slug);
  
  if (!storyId) {
    return { title: 'Hikaye Bulunamadı - Readixon' };
  }

  try {
    const story = await getStoryById(storyId);
    if (!story) {
      return { title: 'Hikaye Bulunamadı - Readixon' };
    }

    return {
      title: `${story.title} | Readixon`,
      description: story.summary || 'Readixon\'da yeni nesil hikayeleri keşfedin.',
      openGraph: {
        title: `${story.title} | Readixon`,
        description: story.summary || 'Readixon\'da yeni nesil hikayeleri keşfedin.',
        images: story.coverImage ? [story.coverImage] : [],
        type: 'article',
      },
    };
  } catch (error) {
    return { title: 'Readixon' };
  }
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
