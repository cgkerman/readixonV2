import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { HelpCircle, BarChart2, CheckCircle } from 'lucide-react';
import { ChapterActivity, ActivityAnswer, submitActivityAnswer, getUserActivityAnswer, getChapterActivityAnswers } from '@readixon/core';
import { toast } from 'sonner';

interface ChapterEndActivityProps {
  activity: ChapterActivity;
  storyId: string;
  chapterId: string;
  authorId: string;
  userId?: string;
  textColor: string;
}

export function ChapterEndActivity({ activity, storyId, chapterId, authorId, userId, textColor }: ChapterEndActivityProps) {
  const [userAnswer, setUserAnswer] = useState<ActivityAnswer | null>(null);
  const [pollStats, setPollStats] = useState<number[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [storyId, chapterId, userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (userId) {
        const answer = await getUserActivityAnswer(storyId, chapterId, userId);
        if (answer) {
          setUserAnswer(answer);
        }
      }

      if (activity.type === 'poll') {
        const allAnswers = await getChapterActivityAnswers(storyId, chapterId);
        setTotalVotes(allAnswers.length);
        
        const stats = new Array(activity.options?.length || 0).fill(0);
        allAnswers.forEach(ans => {
          if (ans.selectedOptionIndex !== undefined) {
            stats[ans.selectedOptionIndex]++;
          }
        });
        setPollStats(stats);
      }
    } catch (e) {
      console.error("Error loading activity data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitText = async () => {
    if (!userId) {
      toast.error('Cevap vermek için giriş yapmalısınız.');
      return;
    }
    if (!textAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      await submitActivityAnswer(storyId, chapterId, authorId, userId, 'question', { answer: textAnswer.trim() });
      toast.success('Cevabınız yazara iletildi. Teşekkürler!');
      // Optimistic update
      setUserAnswer({
        userId,
        type: 'question',
        answer: textAnswer.trim(),
        createdAt: new Date() as any
      });
    } catch (e) {
      toast.error('Cevabınız gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVotePoll = async (index: number) => {
    if (!userId) {
      toast.error('Oy vermek için giriş yapmalısınız.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitActivityAnswer(storyId, chapterId, authorId, userId, 'poll', { selectedOptionIndex: index });
      
      // Optimistic update
      setUserAnswer({
        userId,
        type: 'poll',
        selectedOptionIndex: index,
        createdAt: new Date() as any
      });
      
      const newStats = [...pollStats];
      newStats[index]++;
      setPollStats(newStats);
      setTotalVotes(prev => prev + 1);

      toast.success('Oyunuz kaydedildi!');
    } catch (e) {
      toast.error('Oyunuz kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-16 p-8 border-t border-border/20 flex justify-center opacity-50">
        <div className="animate-pulse flex items-center gap-2" style={{ color: textColor }}>
          <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t border-border/20">
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6" style={{ color: textColor }}>
          {activity.type === 'question' ? <HelpCircle size={24} className="text-primary" /> : <BarChart2 size={24} className="text-primary" />}
          <Typography variant="h3" className="font-bold">
            {activity.type === 'question' ? 'Yazarın Sorusu' : 'Bölüm Anketi'}
          </Typography>
        </div>

        <Typography variant="body" className="text-lg mb-6 font-medium" style={{ color: textColor }}>
          {activity.question}
        </Typography>

        {activity.type === 'question' ? (
          <div>
            {userAnswer ? (
              <div className="bg-background/50 rounded-2xl p-4 border border-border/50">
                <Typography variant="caption" className="text-primary font-bold mb-2 flex items-center gap-2">
                  <CheckCircle size={16} /> Yanıtınız
                </Typography>
                <Typography variant="body" style={{ color: textColor }}>{userAnswer.answer}</Typography>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea 
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value.slice(0, 300))}
                  placeholder="Cevabınızı buraya yazın... (Maksimum 300 karakter)"
                  className="w-full bg-background/50 border border-border/50 rounded-xl p-4 focus:outline-none focus:border-primary resize-y min-h-[100px]"
                  style={{ color: textColor }}
                />
                <div className="flex items-center justify-between">
                  <Typography variant="caption" className="opacity-60" style={{ color: textColor }}>
                    {textAnswer.length} / 300
                  </Typography>
                  <Button 
                    variant="primary" 
                    onPress={handleSubmitText} 
                    disabled={isSubmitting || !textAnswer.trim()}
                    className="rounded-full px-6"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activity.options?.map((opt: string, idx: number) => {
              const hasVoted = userAnswer !== null;
              const isSelected = userAnswer?.selectedOptionIndex === idx;
              const votes = pollStats[idx] || 0;
              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              return (
                <div key={idx} className="relative group">
                  <button
                    onClick={() => !hasVoted && handleVotePoll(idx)}
                    disabled={hasVoted || isSubmitting}
                    className={`w-full text-left p-4 rounded-xl border transition-all overflow-hidden relative ${
                      hasVoted
                        ? isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border/50 bg-background/30'
                        : 'border-border/50 bg-background/50 hover:border-primary/50 hover:bg-background/80'
                    }`}
                  >
                    {hasVoted && (
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${isSelected ? 'bg-primary/20' : 'bg-muted/10'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <Typography 
                        variant="body" 
                        className={`font-medium ${hasVoted && isSelected ? 'text-primary font-bold' : ''}`}
                        style={{ color: hasVoted && !isSelected ? textColor : undefined }}
                      >
                        {opt}
                      </Typography>
                      {hasVoted && (
                        <Typography variant="caption" className={`font-bold ${isSelected ? 'text-primary' : 'opacity-70'}`} style={{ color: !isSelected ? textColor : undefined }}>
                          %{percentage}
                        </Typography>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
            {userAnswer && (
              <Typography variant="caption" className="text-right opacity-60 mt-2 block" style={{ color: textColor }}>
                Toplam {totalVotes} oy
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
