"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HeroBannerForm from '../../_components/HeroBannerForm';
import { Typography } from '@readixon/ui';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getHeroBannerById, type HeroBanner } from '@readixon/core';
import { toast } from 'sonner';

export default function EditHeroBannerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const banner = await getHeroBannerById(id);
        if (banner) {
          setData(banner);
        } else {
          toast.error("Manşet bulunamadı.");
          router.push('/editor/hero');
        }
      } catch (error) {
        toast.error("Veri yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/editor/hero">
          <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <Typography variant="h2" className="font-bold text-text mb-1">Manşeti Düzenle</Typography>
          <Typography variant="body" className="text-muted text-sm">Mevcut manşeti güncelleyin.</Typography>
        </div>
      </div>
      
      {data && <HeroBannerForm initialData={data} />}
    </div>
  );
}
