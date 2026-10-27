'use client';

import React, { use } from 'react';
import { ColumnEditor } from '../components/ColumnEditor';
import { useQuery } from '@tanstack/react-query';
import { getColumnArticleById, ColumnArticle, useAuthStore } from '@readixon/core';
import { Loader2 } from 'lucide-react';
import { Typography } from '@readixon/ui';
import Link from 'next/link';

interface EditColumnPageProps {
  params: Promise<{ id: string }>;
}

export default function EditColumnPage({ params }: EditColumnPageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const { userProfile, isLoading: authLoading } = useAuthStore();

  const { data: article, isLoading: articleLoading } = useQuery<ColumnArticle | null>({
    queryKey: ['column_article', articleId],
    queryFn: () => getColumnArticleById(articleId),
    enabled: Boolean(articleId),
  });

  if (authLoading || articleLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <Typography variant="body" className="text-muted">Köşe yazısı yükleniyor...</Typography>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Typography variant="h3" className="font-bold text-foreground mb-3">
          Köşe Yazısı Bulunamadı
        </Typography>
        <p className="text-sm text-muted mb-6">
          Aradığınız yazı silinmiş veya mevcut olmayabilir.
        </p>
        <Link
          href="/studio/columns"
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
        >
          Köşe Yazılarıma Dön
        </Link>
      </div>
    );
  }

  if (article.authorId !== userProfile?.uid && !userProfile?.isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Typography variant="h3" className="font-bold text-rose-500 mb-3">
          Yetkisiz Erişim
        </Typography>
        <p className="text-sm text-muted mb-6">
          Bu köşe yazısını yalnızca yazarı veya yöneticiler düzenleyebilir.
        </p>
        <Link
          href="/studio/columns"
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
        >
          Köşe Yazılarıma Dön
        </Link>
      </div>
    );
  }

  return <ColumnEditor initialArticle={article} isEditing={true} />;
}
