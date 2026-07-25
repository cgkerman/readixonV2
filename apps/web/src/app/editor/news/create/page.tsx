"use client";

import React from 'react';
import { Typography, Button } from '@readixon/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NewsForm from '../_components/NewsForm';

export default function CreateNewsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/editor/news">
          <Button variant="ghost" className="p-2 rounded-full hover:bg-muted/10">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <Typography variant="h2" className="font-bold text-text mb-1">Yeni Haber Oluştur</Typography>
          <Typography variant="body" className="text-muted">Gündem sayfasına yeni bir kültür sanat haberi ekleyin.</Typography>
        </div>
      </div>

      <NewsForm />
    </div>
  );
}
