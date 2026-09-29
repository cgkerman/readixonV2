import type { Metadata } from 'next';
import { getStoryById } from '@readixon/core';
import { AdultContentGate } from '@/components/AdultContentGate';

export async function generateMetadata({ params }: { params: { storyId: string } }): Promise<Metadata> {
  const storyId = params.storyId;
  if (!storyId) return { title: 'Kitap Oku' };
  
  try {
    const story = await getStoryById(storyId);
    if (!story) return { title: 'Kitap Oku' };
    
    return {
      title: `${story.title} - Oku`,
      description: story.summary || `${story.title} hikayesini Readixon'da kesintisiz, akıcı okuma modunda deneyimleyin.`,
      openGraph: {
        title: `${story.title} | Readixon Okuyucu`,
        description: story.summary || `${story.title} hikayesini oku.`,
        images: story.coverImage ? [{ url: story.coverImage, alt: story.title }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${story.title} | Readixon`,
        description: story.summary || `${story.title} hikayesini oku.`,
        images: story.coverImage ? [story.coverImage] : [],
      },
    };
  } catch {
    return { title: 'Kitap Oku' };
  }
}

export default async function ReadStoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storyId: string };
}) {
  let story = null;
  try {
    story = await getStoryById(params.storyId);
  } catch (error) {
    console.error("ReadStoryLayout getStoryById error:", error);
  }

  return (
    <AdultContentGate story={story}>
      {children}
    </AdultContentGate>
  );
}
