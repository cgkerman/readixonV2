'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Globe, ArrowLeft, Sparkles, Feather } from 'lucide-react';
import { 
  getAuthorSiteByUsername, 
  getAuthorPublishedStories, 
  trackSiteEvent, 
  useAuthStore,
  type AuthorSite, 
  type Story 
} from '@readixon/core';
import { AtelierSiteRenderer } from '@/components/atelier/AtelierSiteRenderer';

export default function AtelierPublicPage() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const { firebaseUser } = useAuthStore();

  const [site, setSite] = useState<AuthorSite | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!rawUsername) return;

    let isMounted = true;
    const fetchSite = async () => {
      try {
        setIsLoading(true);
        // decodeURIComponent in case of @ or special characters in URL
        const decoded = decodeURIComponent(rawUsername);
        const fetchedSite = await getAuthorSiteByUsername(decoded);

        if (!fetchedSite) {
          if (isMounted) setIsNotFound(true);
          return;
        }

        if (isMounted) {
          setSite(fetchedSite);

          // Sayfa görüntülenme telemetrisi (sahibi değilse artır)
          if (firebaseUser?.uid !== fetchedSite.userId) {
            trackSiteEvent(fetchedSite.id, 'view');
          }
        }

        // Yazarın yayınlanmış kitaplarını getir
        if (fetchedSite.userId) {
          const authorStories = await getAuthorPublishedStories(fetchedSite.userId);
          if (isMounted) {
            setStories(authorStories);
          }
        }
      } catch (err) {
        console.error('[AtelierPublicPage] Yükleme hatası:', err);
        if (isMounted) setIsNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSite();

    return () => {
      isMounted = false;
    };
  }, [rawUsername, firebaseUser?.uid]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0E] text-white p-6">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-neutral-400">Yazar Atölyesi Yükleniyor...</p>
      </div>
    );
  }

  // Site bulunamadı veya henüz yayına alınmamış (ve bakan kişi sitenin sahibi değilse)
  const isOwner = firebaseUser && site && firebaseUser.uid === site.userId;
  if (isNotFound || !site || (!site.isPublished && !isOwner)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0E] text-white p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-xl">
          <Feather className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">Yazar Web Sitesi Henüz Yayında Değil</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
          Bu adrese ait kişisel yazar sitesi henüz yayına alınmamış veya hazırlanma aşamasında.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Readixon Ana Sayfasına Dön</span>
          </Link>

          {isOwner && (
            <Link
              href="/studio/atelier"
              className="px-6 py-3 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <span>Stüdyodan Yayına Al</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Eğer site yayında değilse ama sahibi önizliyorsa uyarı banner'ı */}
      {!site.isPublished && isOwner && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>Bu site şu an taslak modundadır ve yalnızca siz görebilirsiniz. Yayına almak için Stüdyo Atelier paneline gidebilirsiniz.</span>
          <Link href="/studio/atelier" className="underline font-bold ml-1">Yayına Al</Link>
        </div>
      )}

      <AtelierSiteRenderer 
        site={site} 
        initialStories={stories} 
      />
    </div>
  );
}

