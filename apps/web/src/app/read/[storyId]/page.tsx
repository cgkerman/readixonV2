'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getStoryById, generateStorySlug } from '@readixon/core';
import { Typography } from '@readixon/ui';
import { toast } from 'sonner';

/**
 * Ara Giriş Sayfası Redirector'ı
 * Kullanıcı bu rotaya (/read/[storyId]) geldiğinde, artık gereksiz olan ara sayfa yerine
 * doğrudan kitabın zengin detay sayfasına (/story/[slug] veya /webtoons/[slug])
 * ya da varsa ilgili bölüme (/read/[storyId]/[chapterId]) yönlendirilir.
 */
export default function StoryEntryRedirectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = params.storyId as string;
  const chapterIdParam = searchParams.get('chapterId');

  useEffect(() => {
    const handleRedirect = async () => {
      if (!storyId) return;

      // 1. Eğer URL'de doğrudan chapterId verilmişse direkt bölüm okuyucusuna git
      if (chapterIdParam) {
        router.replace(`/read/${storyId}/${chapterIdParam}`);
        return;
      }

      // 2. Aksi takdirde kitabın ana detay sayfasına yönlendir
      try {
        const fetchedStory = await getStoryById(storyId);
        if (fetchedStory) {
          const slug = (fetchedStory as any).slug || generateStorySlug(fetchedStory.title, fetchedStory.storyId);
          router.replace(fetchedStory.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
        } else {
          toast.error('Hikaye bulunamadı!');
          router.replace('/feed');
        }
      } catch (error) {
        console.error('Yönlendirme hatası:', error);
        router.replace('/feed');
      }
    };

    handleRedirect();
  }, [storyId, chapterIdParam, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <Typography variant="body" className="text-muted text-sm">Yönlendiriliyor...</Typography>
      </div>
    </div>
  );
}
