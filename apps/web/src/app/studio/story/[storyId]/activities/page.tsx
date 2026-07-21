'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { ArrowLeft, MessageSquare, HelpCircle, BarChart2, Users } from 'lucide-react';
import { fetchChapters, getChapterActivityAnswers, Chapter, ActivityAnswer } from '@readixon/core';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StoryActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, ActivityAnswer[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [storyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const chaps = await fetchChapters(storyId);
      // Sadece aktivitesi olan bölümleri filtreleyelim
      const activityChaps = chaps.filter(c => c.endActivity);
      setChapters(activityChaps.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error(e);
      toast.error('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnswersForChapter = async (chapterId: string) => {
    if (answersMap[chapterId]) {
      // Toggle
      setExpandedChapterId(expandedChapterId === chapterId ? null : chapterId);
      return;
    }
    
    try {
      const answers = await getChapterActivityAnswers(storyId, chapterId);
      setAnswersMap(prev => ({ ...prev, [chapterId]: answers }));
      setExpandedChapterId(chapterId);
    } catch (e) {
      console.error(e);
      toast.error('Yanıtlar yüklenemedi.');
    }
  };

  const renderPollStats = (chapter: Chapter, answers: ActivityAnswer[]) => {
    if (!chapter.endActivity?.options) return null;
    const totalVotes = answers.length;
    
    const stats = new Array(chapter.endActivity.options.length).fill(0);
    answers.forEach(ans => {
      if (ans.selectedOptionIndex !== undefined) {
        stats[ans.selectedOptionIndex]++;
      }
    });

    return (
      <div className="flex flex-col gap-4 mt-6">
        <Typography variant="body" className="font-bold text-muted mb-2">Anket Sonuçları ({totalVotes} Oy)</Typography>
        {chapter.endActivity.options.map((opt, idx) => {
          const votes = stats[idx];
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          return (
            <div key={idx} className="relative w-full bg-background rounded-xl p-4 overflow-hidden border border-border/50">
              <div 
                className="absolute top-0 left-0 h-full bg-primary/20 transition-all"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative z-10 flex justify-between items-center gap-4">
                <Typography variant="body" className="font-medium">{opt}</Typography>
                <Typography variant="body" className="font-bold text-primary">% {percentage}</Typography>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuestionAnswers = (answers: ActivityAnswer[]) => {
    if (answers.length === 0) {
      return <Typography variant="caption" className="text-muted mt-4 block">Henüz hiç yanıt yok.</Typography>;
    }

    return (
      <div className="flex flex-col gap-4 mt-6">
        <Typography variant="body" className="font-bold text-muted mb-2">Okuyucu Yanıtları ({answers.length})</Typography>
        <div className="grid gap-4">
          {answers.map(ans => (
            <div key={ans.id} className="bg-background rounded-xl p-4 border border-border/50 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {ans.userAvatarUrl ? (
                  <img src={ans.userAvatarUrl} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {ans.userDisplayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <Typography variant="caption" className="font-bold block">{ans.userDisplayName}</Typography>
                  <Link href={`/profile/${ans.userUsername}`} className="text-xs text-muted hover:text-primary">
                    @{ans.userUsername}
                  </Link>
                </div>
              </div>
              <Typography variant="body" className="bg-card p-3 rounded-lg border border-border/30 text-sm">
                {ans.answer}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <Button variant="ghost" onPress={() => router.back()} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2" /> Hikayeye Dön
      </Button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
          <MessageSquare size={24} />
        </div>
        <div>
          <Typography variant="h1">Bölüm Aktiviteleri</Typography>
          <Typography variant="caption" className="text-muted">Bölüm sonlarına eklediğiniz soru ve anketlerin sonuçlarını inceleyin.</Typography>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
          <HelpCircle size={48} className="text-muted/30 mb-4" />
          <Typography variant="h3" className="mb-2">Aktivite Bulunamadı</Typography>
          <Typography variant="body" className="text-muted max-w-md mx-auto">
            Bu hikayedeki hiçbir bölüme soru veya anket eklenmemiş. Bölüm editörüne gidip bölüm sonlarına aktivite ekleyebilirsiniz.
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {chapters.map(chapter => {
            const isExpanded = expandedChapterId === chapter.chapterId;
            const activity = chapter.endActivity!;
            const answers = answersMap[chapter.chapterId];

            return (
              <div key={chapter.chapterId} className="bg-card rounded-2xl border border-border/20 overflow-hidden shadow-sm transition-all">
                <div 
                  className={`p-6 cursor-pointer hover:bg-muted/5 flex items-center justify-between ${isExpanded ? 'border-b border-border/20 bg-muted/5' : ''}`}
                  onClick={() => loadAnswersForChapter(chapter.chapterId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {activity.type === 'question' ? <HelpCircle size={20} /> : <BarChart2 size={20} />}
                    </div>
                    <div>
                      <Typography variant="caption" className="font-bold text-primary uppercase tracking-wider mb-1 block">
                        Bölüm {chapter.order}
                      </Typography>
                      <Typography variant="body" className="font-bold text-lg mb-1">{chapter.title}</Typography>
                      <Typography variant="caption" className="text-muted line-clamp-1">{activity.question}</Typography>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0 pointer-events-none">
                    {isExpanded ? 'Kapat' : 'Yanıtları Gör'}
                  </Button>
                </div>

                {isExpanded && answers && (
                  <div className="p-6 bg-card/50">
                    {activity.type === 'poll' ? renderPollStats(chapter, answers) : renderQuestionAnswers(answers)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
