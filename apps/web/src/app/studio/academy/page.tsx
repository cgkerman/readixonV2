'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Typography } from '@readixon/ui';
import { 
  BookOpen, Clock, Sparkles, Filter, CheckCircle2, Bookmark, 
  Search, ChevronRight, X, AlertCircle, Compass, Layers, Target, Wand2
} from 'lucide-react';

import { AcademyLesson, UserAcademyProgress } from './types';
import { 
  LEARNING_PATHS, 
  ACADEMY_CATEGORIES, 
  ACADEMY_LESSONS, 
  ACADEMY_BADGES 
} from './academyData';

import AcademyHero from './components/AcademyHero';
import ContinueCard from './components/ContinueCard';
import LearningPathsSection from './components/LearningPathsSection';
import QuickLessonsSection from './components/QuickLessonsSection';
import CategoriesSection from './components/CategoriesSection';
import LessonReaderModal from './components/LessonReaderModal';
import AchievementsSection from './components/AchievementsSection';

const STORAGE_KEY = 'readixon_academy_progress_v2';

export default function WriterAcademyPage() {
  // State: Aktif Sekme & Filtreler
  const [activeTab, setActiveTab] = useState<'overview' | 'paths' | 'lessons' | 'badges'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathFilter, setSelectedPathFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'uncompleted' | 'bookmarked'>('all');

  // State: Aktif Okunan Ders & İlerleme
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [lastTouchedLessonId, setLastTouchedLessonId] = useState<string>('story-foundations');
  const [progress, setProgress] = useState<UserAcademyProgress>({
    completedLessonIds: [],
    bookmarkedLessonIds: [],
    solvedQuizIds: [],
    totalXp: 0,
    streakDays: 1,
    lastStudyDate: new Date().toISOString().split('T')[0]
  });

  // LocalStorage'dan İlerlemeyi Yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
        if (parsed.lastTouchedLessonId) {
          setLastTouchedLessonId(parsed.lastTouchedLessonId);
        }
      }
    } catch (e) {
      console.warn('Academy progress yüklenemedi:', e);
    }
  }, []);

  // İlerlemeyi Kaydet
  const saveProgress = (newProgress: UserAcademyProgress, lastLessonId?: string) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...newProgress,
          lastTouchedLessonId: lastLessonId || lastTouchedLessonId
        })
      );
    } catch (e) {
      console.warn('Academy progress kaydedilemedi:', e);
    }
  };

  // Bir Dersi Aç
  const handleOpenLesson = (lesson: AcademyLesson) => {
    setActiveLesson(lesson);
    setLastTouchedLessonId(lesson.id);
    saveProgress(progress, lesson.id);
  };

  // Dersi Tamamla / Geri Al
  const handleToggleComplete = (lessonId: string) => {
    const isAlreadyDone = progress.completedLessonIds.includes(lessonId);
    const targetLesson = ACADEMY_LESSONS.find((l) => l.id === lessonId);
    const lessonXp = targetLesson?.xp || 50;

    let updatedCompleted = [...progress.completedLessonIds];
    let updatedXp = progress.totalXp;

    if (isAlreadyDone) {
      updatedCompleted = updatedCompleted.filter((id) => id !== lessonId);
      updatedXp = Math.max(0, updatedXp - lessonXp);
    } else {
      updatedCompleted.push(lessonId);
      updatedXp += lessonXp;
    }

    const newProgress = {
      ...progress,
      completedLessonIds: updatedCompleted,
      totalXp: updatedXp
    };

    saveProgress(newProgress);
  };

  // Favoriye Ekle / Çıkar
  const handleToggleBookmark = (lessonId: string) => {
    const isBookmarked = progress.bookmarkedLessonIds.includes(lessonId);
    const updated = isBookmarked
      ? progress.bookmarkedLessonIds.filter((id) => id !== lessonId)
      : [...progress.bookmarkedLessonIds, lessonId];

    const newProgress = {
      ...progress,
      bookmarkedLessonIds: updated
    };

    saveProgress(newProgress);
  };

  // Kategori Tıklandığında Dersler Sekmesine Geç
  const handleSelectCategory = (categoryTitle: string) => {
    setSelectedCategoryFilter(categoryTitle);
    setActiveTab('lessons');
  };

  // Filtrelenmiş Dersler Listesi
  const filteredLessons = useMemo(() => {
    return ACADEMY_LESSONS.filter((lesson) => {
      // Arama filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = lesson.title.toLowerCase().includes(query);
        const matchesSummary = lesson.summary.toLowerCase().includes(query);
        const matchesCategory = lesson.category.toLowerCase().includes(query);
        const matchesConcepts = lesson.coreConcepts.some(
          (c) => c.heading.toLowerCase().includes(query) || c.body.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSummary && !matchesCategory && !matchesConcepts) {
          return false;
        }
      }

      // Yol (Path) filtresi
      if (selectedPathFilter !== 'all' && lesson.pathId !== selectedPathFilter) {
        return false;
      }

      // Seviye filtresi
      if (selectedLevelFilter !== 'all' && lesson.level !== selectedLevelFilter) {
        return false;
      }

      // Kategori filtresi
      if (selectedCategoryFilter !== 'all' && !lesson.category.includes(selectedCategoryFilter.split('&')[0].trim())) {
        return false;
      }

      // Durum filtresi (Tamamlanan / Favoriler vb.)
      if (statusFilter === 'completed' && !progress.completedLessonIds.includes(lesson.id)) {
        return false;
      }
      if (statusFilter === 'uncompleted' && progress.completedLessonIds.includes(lesson.id)) {
        return false;
      }
      if (statusFilter === 'bookmarked' && !progress.bookmarkedLessonIds.includes(lesson.id)) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedPathFilter,
    selectedLevelFilter,
    selectedCategoryFilter,
    statusFilter,
    progress.completedLessonIds,
    progress.bookmarkedLessonIds
  ]);

  // Son dokunulan ders nesnesi
  const resumeLesson = useMemo(() => {
    return (
      ACADEMY_LESSONS.find((l) => l.id === lastTouchedLessonId) ||
      ACADEMY_LESSONS[0]
    );
  }, [lastTouchedLessonId]);

  // Modal içindeki sonraki/önceki ders indeksleri
  const currentLessonIndex = activeLesson 
    ? ACADEMY_LESSONS.findIndex((l) => l.id === activeLesson.id) 
    : -1;
  const hasNextLesson = currentLessonIndex !== -1 && currentLessonIndex < ACADEMY_LESSONS.length - 1;
  const hasPrevLesson = currentLessonIndex > 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* ── 1. Hero & Seviye Paneli ── */}
      <AcademyHero
        totalXp={progress.totalXp}
        completedCount={progress.completedLessonIds.length}
        totalLessons={ACADEMY_LESSONS.length}
        streakDays={progress.streakDays}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && activeTab !== 'lessons') {
            setActiveTab('lessons');
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── 2. Sekme İçerikleri ── */}

      {/* A) GENEL BAKIŞ (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Kaldığın Yerden Devam Et Kartı */}
          <ContinueCard
            lesson={resumeLesson}
            isCompleted={progress.completedLessonIds.includes(resumeLesson.id)}
            onOpenLesson={handleOpenLesson}
          />

          {/* Ana Öğrenme Yolları */}
          <LearningPathsSection
            paths={LEARNING_PATHS}
            lessons={ACADEMY_LESSONS}
            completedLessonIds={progress.completedLessonIds}
            onOpenLesson={handleOpenLesson}
          />

          {/* Bugün 10 Dakikada Öğren (Mikro Dersler) */}
          <QuickLessonsSection
            lessons={ACADEMY_LESSONS}
            completedLessonIds={progress.completedLessonIds}
            onOpenLesson={handleOpenLesson}
          />

          {/* Uzmanlık Alanları */}
          <CategoriesSection
            categories={ACADEMY_CATEGORIES}
            lessons={ACADEMY_LESSONS}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      )}

      {/* B) ÖĞRENME YOLLARI (PATHS) */}
      {activeTab === 'paths' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <LearningPathsSection
            paths={LEARNING_PATHS}
            lessons={ACADEMY_LESSONS}
            completedLessonIds={progress.completedLessonIds}
            onOpenLesson={handleOpenLesson}
          />
        </div>
      )}

      {/* C) TÜM DERSLER KATALOĞU (LESSONS) */}
      {activeTab === 'lessons' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filtre Barı */}
          <div className="p-4 sm:p-5 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-text">
                <Filter size={16} className="text-primary" />
                <span>Dersleri Filtrele</span>
                <span className="text-xs text-muted font-normal">
                  ({filteredLessons.length} ders listeleniyor)
                </span>
              </div>

              {(selectedPathFilter !== 'all' || 
                selectedLevelFilter !== 'all' || 
                selectedCategoryFilter !== 'all' || 
                statusFilter !== 'all' || 
                searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedPathFilter('all');
                    setSelectedLevelFilter('all');
                    setSelectedCategoryFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Yol Filtresi */}
              <select
                value={selectedPathFilter}
                onChange={(e) => setSelectedPathFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border/80 text-text focus:outline-hidden focus:border-primary"
              >
                <option value="all">Tüm Yollar</option>
                <option value="starting">Yazarlığa Başlangıç</option>
                <option value="novel">Roman Akademisi</option>
                <option value="webtoon">Webtoon Akademisi</option>
                <option value="series">Seri & Evren</option>
              </select>

              {/* Seviye Filtresi */}
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border/80 text-text focus:outline-hidden focus:border-primary"
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="Başlangıç">Başlangıç</option>
                <option value="Orta">Orta</option>
                <option value="İleri">İleri</option>
              </select>

              {/* Kategori Filtresi */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border/80 text-text focus:outline-hidden focus:border-primary"
              >
                <option value="all">Tüm Kategoriler</option>
                {ACADEMY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Durum Filtresi */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border/80 text-text focus:outline-hidden focus:border-primary"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="completed">Tamamlananlar</option>
                <option value="uncompleted">Tamamlanmayanlar</option>
                <option value="bookmarked">Daha Sonra Öğren</option>
              </select>
            </div>
          </div>

          {/* Ders Kartları Izgarası */}
          {filteredLessons.length === 0 ? (
            <div className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-border/60 p-8 space-y-3">
              <AlertCircle size={32} className="text-muted mx-auto" />
              <h3 className="font-bold text-text text-lg">Aramanıza Uygun Ders Bulunamadı</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Filtreleri sıfırlayarak veya arama teriminizi değiştirerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map((lesson) => {
                const isDone = progress.completedLessonIds.includes(lesson.id);
                const isMarked = progress.bookmarkedLessonIds.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleOpenLesson(lesson)}
                    className="p-5 rounded-3xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md hover:-translate-y-1 relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {lesson.level}
                        </span>

                        <div className="flex items-center gap-2 text-xs font-medium text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {lesson.durationMinutes} dk
                          </span>
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">
                            <Sparkles size={11} /> +{lesson.xp}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-text text-base group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>

                      <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                        {lesson.summary}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <span className="text-emerald-500 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={14} /> Okundu
                          </span>
                        ) : (
                          <span className="text-primary font-semibold flex items-center gap-1">
                            Rehberi Oku <ChevronRight size={14} />
                          </span>
                        )}
                        {isMarked && (
                          <span className="text-amber-500 font-semibold flex items-center gap-1">
                            <Bookmark size={13} className="fill-amber-500" />
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-muted truncate max-w-[120px]">
                        {lesson.category.split('&')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* D) BAŞARILAR & ROZETLER (BADGES) */}
      {activeTab === 'badges' && (
        <AchievementsSection
          totalXp={progress.totalXp}
          completedLessonCount={progress.completedLessonIds.length}
          streakDays={progress.streakDays}
          badges={ACADEMY_BADGES}
        />
      )}

      {/* ── 3. Tam Ekran İnteraktif Ders Okuyucu Modalı ── */}
      {activeLesson && (
        <LessonReaderModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          isCompleted={progress.completedLessonIds.includes(activeLesson.id)}
          isBookmarked={progress.bookmarkedLessonIds.includes(activeLesson.id)}
          onToggleComplete={handleToggleComplete}
          onToggleBookmark={handleToggleBookmark}
          hasNext={hasNextLesson}
          hasPrev={hasPrevLesson}
          onSelectNextLesson={() => {
            if (hasNextLesson) {
              handleOpenLesson(ACADEMY_LESSONS[currentLessonIndex + 1]);
            }
          }}
          onSelectPrevLesson={() => {
            if (hasPrevLesson) {
              handleOpenLesson(ACADEMY_LESSONS[currentLessonIndex - 1]);
            }
          }}
        />
      )}
    </div>
  );
}
