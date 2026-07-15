'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoryById, getPublishedChapters, getReadingProgress, type Story, type Chapter, type ReadingProgress } from '@readixon/core';
import { useAuthStore } from '@readixon/core/src/store/useAuthStore';
import { Typography, Button } from '@readixon/ui';
import { ArrowLeft, BookOpen, Clock, Heart, Eye, CheckCircle, Bookmark, MessageSquare } from 'lucide-react';
import { toast } from "sonner";

export default function StoryEntryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const { firebaseUser } = useAuthStore();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedStory, fetchedChapters] = await Promise.all([
          getStoryById(storyId),
          getPublishedChapters(storyId)
        ]);
        
        let progress = null;
        if (firebaseUser) {
          progress = await getReadingProgress(firebaseUser.uid, storyId);
          setReadingProgress(progress);
        }
        
        if (fetchedStory) {
          setStory(fetchedStory);
          setChapters(fetchedChapters);
        } else {
          toast.error('Hikaye bulunamadı!');
          router.push('/feed');
        }
      } catch (error) {
        console.error("Hikaye yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (storyId) {
      loadData();
    }
  }, [storyId, router, firebaseUser]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Typography variant="body">Yükleniyor...</Typography>
      </div>
    );
  }

  if (!story) return null;

  const firstChapter = chapters.length > 0 ? chapters[0] : null;
  const totalComments = Math.max(
    story.stats?.commentCount || 0,
    chapters.reduce((sum, chap) => sum + (chap.stats?.commentCount || 0), 0)
  );

  return (
    <div className="min-h-screen bg-background text-text pb-24">
      {/* Top Navbar */}
      <div className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-md border-b border-border/10">
        <Button variant="ghost" onPress={() => router.back()} className="rounded-full p-2 mr-4">
          <ArrowLeft size={24} />
        </Button>
        <Typography variant="h3">Hikaye Detayı</Typography>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover */}
          <div className="w-full md:w-1/3 aspect-[2/3] bg-card rounded-2xl overflow-hidden border border-border/20 flex-shrink-0 shadow-2xl">
            {story.coverImage ? (
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/10">
                <BookOpen size={48} className="text-muted/30" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div>
              <Typography variant="h1" className="mb-2">{story.title}</Typography>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${story.status === 'ongoing' || story.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {story.status === 'draft' ? 'Taslak' : story.status === 'ongoing' ? 'Devam Ediyor' : 'Tamamlandı'}
                </span>
                
                <div className="flex items-center gap-1 text-muted text-sm">
                  <Eye size={16} /> {story.stats?.views || 0}
                </div>
                <div className="flex items-center gap-1 text-muted text-sm">
                  <Heart size={16} /> {story.stats?.likes || 0}
                </div>
                <div className="flex items-center gap-1 text-muted text-sm">
                  <MessageSquare size={16} /> {totalComments}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {story.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <div className="bg-card/50 p-6 rounded-2xl border border-border/10">
              <Typography variant="h3" className="mb-3 text-lg">Özet</Typography>
              <Typography variant="body" className="text-muted leading-relaxed whitespace-pre-wrap">
                {story.summary || 'Bu hikaye için bir özet eklenmemiş.'}
              </Typography>
            </div>

            <div className="pt-4">
              <Button 
                variant="primary" 
                className="w-full md:w-auto py-4 px-8 text-lg flex items-center justify-center gap-2"
                disabled={!firstChapter}
                onPress={() => {
                  if (readingProgress?.currentChapterId) {
                    router.push(`/read/${story.storyId}/${readingProgress.currentChapterId}`);
                  } else if (firstChapter) {
                    router.push(`/read/${story.storyId}/${firstChapter.chapterId}`);
                  }
                }}
              >
                {readingProgress?.currentChapterId ? <Bookmark size={20} /> : <BookOpen size={20} />}
                {readingProgress?.currentChapterId 
                  ? 'Kaldığın Yerden Devam Et' 
                  : firstChapter 
                    ? 'Okumaya Başla' 
                    : 'Henüz Bölüm Yok'}
              </Button>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Typography variant="h2">Bölümler</Typography>
            <span className="bg-card px-3 py-1 rounded-full text-sm text-muted font-bold">
              {chapters.length}
            </span>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12 bg-card/20 rounded-3xl border border-border/10">
              <Typography variant="body" className="text-muted">Bu hikayenin henüz yayınlanmış bir bölümü bulunmuyor.</Typography>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {chapters.map((chap) => {
                const isCompleted = readingProgress?.completedChapters?.includes(chap.chapterId);
                const isCurrent = readingProgress?.currentChapterId === chap.chapterId;
                
                return (
                  <div 
                    key={chap.chapterId} 
                    onClick={() => router.push(`/read/${story.storyId}/${chap.chapterId}`)}
                    className="flex items-center justify-between p-5 bg-card hover:bg-card/80 transition-colors border border-border/20 rounded-2xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {isCompleted ? (
                        <CheckCircle size={24} className="text-green-500" />
                      ) : isCurrent ? (
                        <Bookmark size={24} className="text-primary" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-border/30 flex items-center justify-center">
                          <span className="text-[10px] text-muted font-bold">{chap.order}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1">
                        <Typography variant="body" className="font-bold group-hover:text-primary transition-colors">
                          {chap.title}
                        </Typography>
                        <Typography variant="caption" className={isCurrent ? 'text-primary font-medium' : 'text-muted'}>
                          {isCurrent ? 'Şu An Okunuyor' : isCompleted ? 'Okundu' : `Bölüm ${chap.order}`}
                        </Typography>
                      </div>
                    </div>
                    <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Oku &rarr;
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
