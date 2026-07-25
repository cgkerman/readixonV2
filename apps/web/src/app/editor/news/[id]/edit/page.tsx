"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import NewsForm from '../../_components/NewsForm';
import { getAnnouncementById, type Announcement } from '@readixon/core';

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const news = await getAnnouncementById(id);
      if (!news) {
        router.push('/editor/news');
        return;
      }
      setData(news);
      setLoading(false);
    };
    fetchNews();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/editor/news">
          <Button variant="ghost" className="p-2 rounded-full hover:bg-muted/10">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <Typography variant="h2" className="font-bold text-text mb-1">Haberi Düzenle</Typography>
          <Typography variant="body" className="text-muted">Gündem sayfasındaki haberi güncelleyin.</Typography>
        </div>
      </div>

      {data && <NewsForm initialData={data} />}
    </div>
  );
}
