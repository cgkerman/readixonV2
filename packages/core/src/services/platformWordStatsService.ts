import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { Story, Chapter } from '../types';
import { getMainGenreName } from '../constants/genres';
import { countWordsInBlocks } from './readingAnalyticsService';

export interface TierInfo {
  tierLevel: number;
  tierName: string;
  prevMilestone: number;
  nextMilestone: number;
  progressPercent: number;
  wordsRemaining: number;
}

export interface PlatformWordStats {
  totalWords: number;
  totalPublishedStories: number;
  totalChapters: number;
  totalReadingMinutes: number;
  totalReadingHours: number;
  tier: TierInfo;
  literaryComparison: {
    title: string;
    description: string;
  };
  topGenres: {
    genreId: string;
    name: string;
    wordCount: number;
    percentage: number;
    storyCount: number;
  }[];
  longestStories: {
    storyId: string;
    title: string;
    wordCount: number;
    authorName?: string;
    coverImage?: string;
    genreName?: string;
  }[];
}

/**
 * Kademeli eşik basamakları (Graduated Milestones)
 * Platformdaki kelime sayısı arttıkça otomatik olarak bir sonraki aşamaya geçer.
 */
export const MILESTONES_CONFIG: { threshold: number; name: string }[] = [
  { threshold: 1000, name: 'İlk Satırlar' },
  { threshold: 5000, name: 'Kıvılcım' },
  { threshold: 10000, name: 'Çıraklık' },
  { threshold: 25000, name: 'Öykü Dünyası' },
  { threshold: 50000, name: 'Novella Hacmi' },
  { threshold: 100000, name: 'Roman Boyutu' },
  { threshold: 250000, name: 'Büyük Kütüphane' },
  { threshold: 500000, name: 'Edebi Külliyat' },
  { threshold: 1000000, name: 'Milyoner Kalemler' },
  { threshold: 2500000, name: 'Kozmik Arşiv' },
  { threshold: 5000000, name: 'Sonsuz Evren' },
  { threshold: 10000000, name: 'Efsanevi Miras' },
  { threshold: 25000000, name: 'Galaktik Kütüphane' },
  { threshold: 50000000, name: 'Ölümsüz Hafıza' },
];

/**
 * Verilen toplam kelime sayısına göre mevcut aşama, hedef ve ilerleme yüzdesini hesaplar.
 */
export function calculateMilestoneTier(totalWords: number): TierInfo {
  const currentIndex = MILESTONES_CONFIG.findIndex(m => m.threshold > totalWords);

  if (currentIndex === -1) {
    const lastConfig = MILESTONES_CONFIG[MILESTONES_CONFIG.length - 1];
    const step = 25000000;
    const additionalSteps = Math.floor((totalWords - lastConfig.threshold) / step) + 1;
    const nextMilestone = lastConfig.threshold + additionalSteps * step;
    const prevMilestone = nextMilestone - step;
    const progressPercent = Math.min(100, Math.max(0, Math.round(((totalWords - prevMilestone) / (nextMilestone - prevMilestone)) * 100)));
    return {
      tierLevel: MILESTONES_CONFIG.length + additionalSteps,
      tierName: 'Evrenin Zirvesi',
      prevMilestone,
      nextMilestone,
      progressPercent,
      wordsRemaining: Math.max(0, nextMilestone - totalWords),
    };
  }

  const currentMilestone = MILESTONES_CONFIG[currentIndex];
  const prevMilestone = currentIndex > 0 ? MILESTONES_CONFIG[currentIndex - 1].threshold : 0;
  const nextMilestone = currentMilestone.threshold;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalWords - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
  );

  return {
    tierLevel: currentIndex + 1,
    tierName: currentMilestone.name,
    prevMilestone,
    nextMilestone,
    progressPercent,
    wordsRemaining: Math.max(0, nextMilestone - totalWords),
  };
}

/**
 * Kelime hacmine göre dinamik ve ölçeklenebilir edebi kıyaslama üretir.
 */
export function getLiteraryComparison(totalWords: number): { title: string; description: string } {
  if (totalWords >= 560000) {
    const ratio = (totalWords / 560000).toFixed(1);
    return {
      title: `${ratio}x Savaş ve Barış`,
      description: `Tolstoy'un 560.000 kelimelik dev başyapıtının ${ratio} katı edebiyat üretildi.`,
    };
  }
  if (totalWords >= 480000) {
    const ratio = (totalWords / 480000).toFixed(1);
    return {
      title: `${ratio}x LOTR Üçlemesi`,
      description: `Tolkien'in 480.000 kelimelik Orta Dünya üçlemesinin ${ratio} katı büyüklükte.`,
    };
  }
  if (totalWords >= 100000) {
    const percent = Math.round((totalWords / 560000) * 100);
    return {
      title: `Savaş ve Barış'ın %${percent}'i`,
      description: `Tolstoy'un dev romanının (560.000 kelime) %${percent}'ine ulaşıldı.`,
    };
  }
  if (totalWords >= 50000) {
    const percent = Math.round((totalWords / 480000) * 100);
    return {
      title: `LOTR Külliyatı'nın %${percent}'i`,
      description: `Yüzüklerin Efendisi külliyatının (480.000 kelime) %${percent}'i kadar satır yazıldı.`,
    };
  }
  if (totalWords >= 17000) {
    const ratio = (totalWords / 17000).toFixed(1);
    return {
      title: `${ratio}x Küçük Prens`,
      description: `Küçük Prens klasiğinin (17.000 kelime) ${ratio} katı büyüklükte.`,
    };
  }
  if (totalWords > 0) {
    const percent = Math.min(100, Math.round((totalWords / 17000) * 100));
    return {
      title: `Küçük Prens'in %${percent}'i`,
      description: `Küçük Prens (17.000 kelime) edebi hedefine doğru ilerleniyor.`,
    };
  }
  return {
    title: 'Yeni Başlayan Bir Evren',
    description: 'İlk kelimelerin yazılmasıyla edebi yolculuk başlayacak.',
  };
}

/**
 * Platform genelindeki aktif yayında olan hikayelerin kelime istatistiklerini hesaplar.
 * Yalnızca Firestore'daki gerçek yayınlanmış hikayeleri ve bölümleri kullanır. Sahte veri içermez.
 */
export async function getPlatformWordStats(): Promise<PlatformWordStats> {
  try {
    const q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed']),
      limit(100)
    );
    const snap = await getDocs(q);

    let calculatedTotalWords = 0;
    let totalChapters = 0;
    const storiesWithWords: {
      story: Story;
      wordCount: number;
    }[] = [];

    const genreWordMap: Record<string, { wordCount: number; storyCount: number }> = {};

    // Her hikaye için gerçek kelime ve bölüm sayısını topla
    await Promise.all(
      snap.docs.map(async (docSnap) => {
        const data = docSnap.data() as Story;
        let storyWords = 0;
        let storyChapters = 0;

        const storyId = data.storyId || docSnap.id;

        // 1. Hikaye dokümanında önceden hesaplanmış totalWords varsa onu al
        if (typeof data.stats?.totalWords === 'number' && data.stats.totalWords > 0) {
          storyWords = data.stats.totalWords;
          storyChapters = data.stats.chapterCount || 1;
        } else {
          // 2. Yoksa altındaki gerçek bölümlerden kelimeleri say
          try {
            const chSnap = await getDocs(collection(db, 'stories', storyId, 'chapters'));
            chSnap.forEach((chDoc) => {
              const ch = chDoc.data() as Chapter;
              if (ch.status === 'draft') return;
              if (ch.status === 'scheduled' && ch.publishDate) {
                const pubDate = ch.publishDate.toDate ? ch.publishDate.toDate() : new Date(ch.publishDate as any);
                if (pubDate > new Date()) return;
              }
              storyChapters++;

              let chWords = 0;
              if (ch.contentBlocks && Array.isArray(ch.contentBlocks)) {
                chWords += countWordsInBlocks(ch.contentBlocks);
              }
              if (typeof (ch as any).content === 'string') {
                const clean = (ch as any).content.replace(/<[^>]*>/g, ' ').trim();
                if (clean) chWords += clean.split(/\s+/).filter(Boolean).length;
              }
              if (typeof (ch as any).text === 'string') {
                const clean = (ch as any).text.replace(/<[^>]*>/g, ' ').trim();
                if (clean) chWords += clean.split(/\s+/).filter(Boolean).length;
              }
              if (Array.isArray(ch.chatMessages)) {
                for (const msg of ch.chatMessages) {
                  if (msg && typeof msg.text === 'string') {
                    const words = msg.text.trim().split(/\s+/).filter(Boolean);
                    chWords += words.length;
                  }
                }
              }
              storyWords += chWords;
            });
          } catch (chErr) {
            console.warn(`[getPlatformWordStats] ${storyId} bölümleri okunamadı:`, chErr);
            storyChapters = data.stats?.chapterCount || 0;
          }
        }

        calculatedTotalWords += storyWords;
        totalChapters += storyChapters;

        storiesWithWords.push({ story: data, wordCount: storyWords });

        const genreId = data.mainGenre || 'other';
        if (!genreWordMap[genreId]) {
          genreWordMap[genreId] = { wordCount: 0, storyCount: 0 };
        }
        genreWordMap[genreId].wordCount += storyWords;
        genreWordMap[genreId].storyCount += 1;
      })
    );

    const totalPublishedStories = snap.docs.length;
    const tier = calculateMilestoneTier(calculatedTotalWords);
    const literaryComparison = getLiteraryComparison(calculatedTotalWords);

    const totalReadingMinutes = Math.round(calculatedTotalWords / 200);
    const totalReadingHours = Number((totalReadingMinutes / 60).toFixed(1));

    // Tür listesi (Yalnızca veritabanındaki gerçek veriler)
    const topGenres = Object.entries(genreWordMap)
      .filter(([_, info]) => info.wordCount > 0 || info.storyCount > 0)
      .map(([genreId, info]) => ({
        genreId,
        name: getMainGenreName(genreId) || genreId,
        wordCount: info.wordCount,
        percentage: calculatedTotalWords > 0 ? Math.round((info.wordCount / calculatedTotalWords) * 100) : 0,
        storyCount: info.storyCount,
      }))
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5);

    const longestStories = storiesWithWords
      .filter(s => s.wordCount > 0)
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 4)
      .map(({ story, wordCount }) => ({
        storyId: story.storyId,
        title: story.title,
        wordCount,
        authorName: story.authorName || 'Yazar',
        coverImage: story.coverImage,
        genreName: getMainGenreName(story.mainGenre),
      }));

    return {
      totalWords: calculatedTotalWords,
      totalPublishedStories,
      totalChapters,
      totalReadingMinutes,
      totalReadingHours,
      tier,
      literaryComparison,
      topGenres,
      longestStories,
    };
  } catch (error) {
    console.error('getPlatformWordStats hatası:', error);
    const zeroTier = calculateMilestoneTier(0);
    return {
      totalWords: 0,
      totalPublishedStories: 0,
      totalChapters: 0,
      totalReadingMinutes: 0,
      totalReadingHours: 0,
      tier: zeroTier,
      literaryComparison: getLiteraryComparison(0),
      topGenres: [],
      longestStories: [],
    };
  }
}
