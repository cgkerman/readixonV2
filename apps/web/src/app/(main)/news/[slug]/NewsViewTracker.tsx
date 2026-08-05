'use client';

import { useEffect } from 'react';
import { incrementAnnouncementViews } from '@readixon/core';

export function NewsViewTracker({ id }: { id: string }) {
  useEffect(() => {
    if (id) {
      incrementAnnouncementViews(id);
    }
  }, [id]);

  return null;
}
