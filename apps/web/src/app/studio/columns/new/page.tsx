'use client';

import React from 'react';
import { ColumnEditor } from '../components/ColumnEditor';
import { useAuthStore } from '@readixon/core';
import { Typography } from '@readixon/ui';
import Link from 'next/link';

export default function NewColumnPage() {
  const { userProfile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
      </div>
    );
  }

  if (!userProfile?.isColumnist) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Typography variant="h3" className="font-bold text-foreground mb-3">
          Köşe Yazarlığı Yetkisi Gereklidir
        </Typography>
        <p className="text-sm text-muted mb-6">
          Köşe yazısı kaleme alabilmek için öncelikle Gündem masasına başvuruda bulunmanız gerekmektedir.
        </p>
        <Link
          href="/studio/columns"
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
        >
          Başvuru Ekranına Git
        </Link>
      </div>
    );
  }

  return <ColumnEditor isEditing={false} />;
}
