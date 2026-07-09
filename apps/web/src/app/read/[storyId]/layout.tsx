'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStoryById, type Story } from '@readixon/core';
import { AdultContentGate } from '@/components/AdultContentGate';
import { Typography } from '@readixon/ui';

export default function ReadStoryLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const storyId = params.storyId as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) return;
      try {
        const fetchedStory = await getStoryById(storyId);
        setStory(fetchedStory);
      } catch (error) {
        console.error("Layout hikaye yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Typography variant="body">Yükleniyor...</Typography>
      </div>
    );
  }

  return (
    <AdultContentGate story={story}>
      {children}
    </AdultContentGate>
  );
}
