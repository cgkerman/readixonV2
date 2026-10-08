export type LessonLevel = 'Başlangıç' | 'Orta' | 'İleri';

export type LessonFormat = 'all' | 'novel' | 'webtoon' | 'series';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExampleComparison {
  weakTitle?: string;
  weak: string;
  strongTitle?: string;
  strong: string;
  reason: string;
}

export interface StudioTask {
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  summary: string;
  pathId: 'starting' | 'novel' | 'webtoon' | 'series' | 'tools';
  category: string; // e.g. 'Hikâye Mühendisliği', 'Karakter', 'Webtoon', etc.
  level: LessonLevel;
  durationMinutes: number;
  xp: number;
  isQuickLesson?: boolean; // 10 dakikada öğren
  
  // Detaylı Eğitim İçeriği
  introduction: string;
  coreConcepts: {
    heading: string;
    body: string;
  }[];
  comparison?: ExampleComparison;
  proTip: string;
  studioTask?: StudioTask;
  quiz?: QuizQuestion;
  keyTakeaways: string[];
}

export interface LearningPath {
  id: 'starting' | 'novel' | 'webtoon' | 'series';
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
  gradient: string;
  lessonIds: string[];
}

export interface AcademyCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
}

export interface UserAcademyProgress {
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
  solvedQuizIds: string[];
  totalXp: number;
  streakDays: number;
  lastStudyDate?: string;
}

export interface AcademyBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
  requiredLessonCount?: number;
  requiredPathId?: string;
}
