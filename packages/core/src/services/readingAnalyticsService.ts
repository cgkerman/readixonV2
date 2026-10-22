import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  Story, 
  Chapter, 
  ChapterReadingMetric, 
  StoryReadingAnalytics 
} from '../types';

export interface RecordReadingSessionParams {
  storyId: string;
  chapterId: string;
  activeSecondsDelta: number; // Son gönderimden bu yana geçen aktif saniye
  isCompleted?: boolean;      // Okur bölümün sonuna ulaştı mı?
  isFirstFlushForSession?: boolean; // Bu okuma oturumu için ilk gönderim mi?
}

/**
 * Kullanıcının aktif okuma süresini ve tamamlama durumunu Firestore'a atomik olarak kaydeder.
 * Maliyet optimizasyonu: Saniyeler istemcide toplanır ve debounced aralıklarla tek bir increment ile yazılır.
 */
export const recordChapterReadingSession = async ({
  storyId,
  chapterId,
  activeSecondsDelta,
  isCompleted = false,
  isFirstFlushForSession = false
}: RecordReadingSessionParams): Promise<void> => {
  // Geçersiz veya 0 değerleri filtrele (tamamlanma yoksa ve süre 0 ise işlem yapma)
  if (activeSecondsDelta <= 0 && !isCompleted && !isFirstFlushForSession) {
    return;
  }

  // Aşırı uç değerleri sınırla (max tek seferde 30 dakika = 1800 sn)
  const safeSeconds = Math.min(Math.max(0, Math.round(activeSecondsDelta)), 1800);

  try {
    const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    const chapterUpdates: Record<string, any> = {};

    if (safeSeconds > 0) {
      chapterUpdates['stats.totalReadTimeSeconds'] = increment(safeSeconds);
    }
    if (isFirstFlushForSession) {
      chapterUpdates['stats.readingSessionsCount'] = increment(1);
    }
    if (isCompleted) {
      chapterUpdates['stats.completedReads'] = increment(1);
    }

    if (Object.keys(chapterUpdates).length > 0) {
      await updateDoc(chapterRef, chapterUpdates);
    }

    // Hikaye düzeyinde de toplam okuma süresini güncelle
    if (safeSeconds > 0) {
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        'stats.totalReadTimeSeconds': increment(safeSeconds)
      });
    }
  } catch (error: any) {
    // İzin hatası (örn. oturumsuz okuyucu veya kural kısıtlaması) durumunda akışı bozma
    if (error?.code !== 'permission-denied') {
      console.warn('[Analytics] Okuma oturumu kaydedilemedi:', error);
    }
  }
};

/**
 * Bir içerik bloğu listesindeki toplam kelime sayısını hesaplar.
 */
export const countWordsInBlocks = (blocks?: any[]): number => {
  if (!blocks || !Array.isArray(blocks)) return 0;
  let wordCount = 0;
  for (const block of blocks) {
    if (block) {
      const rawText = typeof block.text === 'string'
        ? block.text
        : (typeof block.content === 'string' ? block.content : '');
      if (rawText) {
        // HTML etiketlerini ve özel karakterleri temizle
        const plainText = rawText.replace(/<[^>]*>/g, ' ').trim();
        if (plainText) {
          const words = plainText.split(/\s+/).filter(Boolean);
          wordCount += words.length;
        }
      }
    }
  }
  return wordCount;
};

/**
 * Verilen hikaye ve bölümler üzerinden detaylı okuma analitiğini hesaplar.
 */
export const calculateStoryReadingAnalytics = (
  story: Story,
  chapters: Chapter[]
): StoryReadingAnalytics => {
  // Bölümleri sıraya göre sırala
  const sortedChapters = [...chapters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const firstChapterViews = sortedChapters[0]?.stats?.views || 0;
  let totalWordsAll = 0;
  let aggregatedTotalReadSeconds = 0;
  let totalViewsAll = 0;

  const chapterMetrics: ChapterReadingMetric[] = sortedChapters.map((chapter, idx) => {
    const wordCount = countWordsInBlocks(chapter.contentBlocks);
    totalWordsAll += wordCount;

    // Beklenen okuma süresi (ortalama 200 kelime/dk okuma hızı kabul edilir)
    // En az 45 saniye
    const estimatedReadTimeSeconds = Math.max(45, Math.round((wordCount / 200) * 60));

    const views = chapter.stats?.views || 0;
    totalViewsAll += views;

    const totalReadTimeSeconds = chapter.stats?.totalReadTimeSeconds || 0;
    aggregatedTotalReadSeconds += totalReadTimeSeconds;

    const sessions = chapter.stats?.readingSessionsCount || views || 0;
    const completedReads = chapter.stats?.completedReads || 0;

    // Gerçek ortalama süre (Kayıtlı veri varsa onu kullan, yoksa ve görüntülenme varsa tahmini ölçekle)
    let actualAvgReadTimeSeconds = 0;
    if (totalReadTimeSeconds > 0 && sessions > 0) {
      actualAvgReadTimeSeconds = Math.round(totalReadTimeSeconds / sessions);
    } else if (views > 0) {
      // Henüz telemetri birikmemiş eski bölümler için beklenen sürenin %80'i kabul edilir
      actualAvgReadTimeSeconds = Math.round(estimatedReadTimeSeconds * 0.85);
    }

    // Tamamlama Oranı
    let completionRate = 0;
    if (views > 0) {
      if (completedReads > 0) {
        completionRate = Math.min(100, Math.round((completedReads / views) * 100));
      } else {
        // Eski bölümler için varsayılan tamamlama tahmini
        completionRate = Math.max(40, Math.min(95, Math.round(85 - idx * 3)));
      }
    }

    // Tutunma Oranı (1. Bölüme göre oran)
    const retentionRate = firstChapterViews > 0 
      ? Math.min(100, Math.max(0, Math.round((views / firstChapterViews) * 100)))
      : (idx === 0 ? 100 : 0);

    // Kayıp / Düşüş Oranı (Bir önceki bölüme göre düşüş)
    let dropOffRate = 0;
    if (idx > 0) {
      const prevViews = sortedChapters[idx - 1]?.stats?.views || 0;
      if (prevViews > 0 && views < prevViews) {
        dropOffRate = Math.round(((prevViews - views) / prevViews) * 100);
      }
    }

    // Okuma Temposu (Derin okuma vs. Hızlı tarama)
    let readingPace: 'deep' | 'balanced' | 'skimming' = 'balanced';
    if (estimatedReadTimeSeconds > 0 && actualAvgReadTimeSeconds > 0) {
      const ratio = actualAvgReadTimeSeconds / estimatedReadTimeSeconds;
      if (ratio >= 1.25) readingPace = 'deep';
      else if (ratio <= 0.6) readingPace = 'skimming';
      else readingPace = 'balanced';
    }

    // İlgi Skoru (0 - 10)
    const likes = chapter.stats?.likes || 0;
    const comments = chapter.stats?.commentCount || 0;
    const likeRatio = views > 0 ? (likes / views) * 100 : 0;
    const completionBonus = (completionRate / 100) * 5;
    const engagementScore = Math.min(
      10, 
      Math.max(1, Number((completionBonus + Math.min(3, likeRatio / 3) + Math.min(2, comments * 0.5)).toFixed(1)))
    );

    return {
      chapterId: chapter.chapterId,
      title: chapter.title || `${idx + 1}. Bölüm`,
      order: chapter.order ?? idx + 1,
      wordCount,
      estimatedReadTimeSeconds,
      actualAvgReadTimeSeconds,
      views,
      completedReads: completedReads || Math.round(views * (completionRate / 100)),
      completionRate,
      retentionRate,
      dropOffRate,
      readingPace,
      engagementScore
    };
  });

  // Hikaye seviyesinde kümülatif süre (Eğer story.stats.totalReadTimeSeconds varsa öncelikli)
  const finalTotalReadSeconds = story.stats?.totalReadTimeSeconds 
    ? Math.max(story.stats.totalReadTimeSeconds, aggregatedTotalReadSeconds)
    : aggregatedTotalReadSeconds;

  // Genel bitiş oranı (Son bölüme tutunma)
  const lastChapterMetric = chapterMetrics[chapterMetrics.length - 1];
  const overallCompletionRate = lastChapterMetric ? lastChapterMetric.retentionRate : 0;

  // Bölüm başına ortalama okuma süresi
  const avgChapterReadTimeSeconds = chapterMetrics.length > 0
    ? Math.round(chapterMetrics.reduce((sum, c) => sum + c.actualAvgReadTimeSeconds, 0) / chapterMetrics.length)
    : 0;

  return {
    storyId: story.storyId,
    storyTitle: story.title,
    totalReadTimeSeconds: finalTotalReadSeconds,
    totalViews: story.stats?.views || totalViewsAll,
    overallCompletionRate,
    avgChapterReadTimeSeconds,
    totalWords: totalWordsAll,
    chapterMetrics
  };
};

/**
 * Saniyeyi "X Sa Y Dk" formatına çevirir.
 */
export const formatReadingHours = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return '0 Dk';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} Sa ${minutes > 0 ? `${minutes} Dk` : ''}`.trim();
  }
  return `${Math.max(1, minutes)} Dk`;
};

/**
 * Saniyeyi "X dk Y sn" formatına çevirir.
 */
export const formatReadingMinutes = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0 sn';
  const minutes = Math.floor(seconds / 60);
  const remSec = Math.round(seconds % 60);

  if (minutes > 0) {
    return `${minutes} dk ${remSec > 0 ? `${remSec} sn` : ''}`.trim();
  }
  return `${remSec} sn`;
};
