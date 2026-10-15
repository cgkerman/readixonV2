'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  Star, 
  Heart, 
  Reply, 
  Send, 
  Trash2, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  BookOpen,
  Images,
  ChevronDown,
  X
} from 'lucide-react';
import { Typography } from '@readixon/ui';
import { 
  useAuthStore,
  subscribeToAuthorStories,
  fetchChapters,
  getAllChapterComments,
  addChapterComment,
  toggleChapterCommentLike,
  checkChapterCommentLiked,
  deleteChapterComment,
  getReviews,
  replyToReview,
  deleteReviewReply,
  type Story,
  type Comment,
  type Review,
  type ReviewAuthorReply
} from '@readixon/core';

// ── Tipler ──
export interface AugmentedComment extends Comment {
  storyId: string;
  storyTitle: string;
  storyCover?: string;
  storyFormat: 'novel' | 'webtoon';
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
}

export interface AugmentedReview extends Review {
  storyId: string;
  storyTitle: string;
  storyCover?: string;
  storyFormat: 'novel' | 'webtoon';
}

type TabType = 'all' | 'comments' | 'reviews';
type StatusFilterType = 'all' | 'unanswered' | 'paragraph';
type SortType = 'newest' | 'oldest' | 'likes' | 'rating';

// Zaman biçimlendirici
const formatRelativeTime = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : (timestamp instanceof Date ? timestamp : new Date(timestamp));
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Az önce';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} gün önce`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} ay önce`;
  return `${Math.floor(diffInMonths / 12)} yıl önce`;
};

// Yazar Hızlı Yanıt Şablonları
const QUICK_TEMPLATES = [
  'Değerli yorumun için çok teşekkürler! ❤️',
  'Görüşlerin benim için çok kıymetli, takipte kal! ✨',
  'Sonraki bölümde seni çok heyecanlı gelişmeler bekliyor! 🚀',
  'Bu detayı fark etmene çok sevindim! 👏'
];

export default function StudioReviewsPage() {
  const router = useRouter();
  const { firebaseUser, userProfile } = useAuthStore();

  const [stories, setStories] = useState<Story[]>([]);
  const [comments, setComments] = useState<AugmentedComment[]>([]);
  const [reviews, setReviews] = useState<AugmentedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Beğenilen yorum ID'leri kümesi
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  // Filtreler & Sıralama
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedStoryId, setSelectedStoryId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Aktif Yanıt Kutusunu Tutma
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // İnceleme Yanıt Kutusunu Tutma
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [submittingReviewReply, setSubmittingReviewReply] = useState(false);

  // Silme Durumu
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── 1. Yazar Hikayelerini ve Verilerini Getir ──
  const loadAuthorData = useCallback(async (authorStories: Story[]) => {
    if (!firebaseUser) return;
    setLoading(true);

    try {
      const allComments: AugmentedComment[] = [];
      const allReviews: AugmentedReview[] = [];

      // Her hikaye için paralel olarak incelemeleri ve bölümleri çek
      await Promise.all(
        authorStories.map(async (story) => {
          // İncelemeleri çek
          try {
            const storyReviews = await getReviews(story.storyId);
            storyReviews.forEach((rev) => {
              allReviews.push({
                ...rev,
                storyId: story.storyId,
                storyTitle: story.title,
                storyCover: story.coverImage,
                storyFormat: story.format || 'novel'
              });
            });
          } catch (e) {
            console.error(`İncelemeler çekilemedi (${story.title}):`, e);
          }

          // Bölümleri çek
          try {
            const chapters = await fetchChapters(story.storyId);
            // Her bölümün yorumlarını çek
            await Promise.all(
              chapters.map(async (chap) => {
                try {
                  const chapComments = await getAllChapterComments(story.storyId, chap.chapterId);
                  chapComments.forEach((c) => {
                    allComments.push({
                      ...c,
                      storyId: story.storyId,
                      storyTitle: story.title,
                      storyCover: story.coverImage,
                      storyFormat: story.format || 'novel',
                      chapterId: chap.chapterId,
                      chapterTitle: chap.title,
                      chapterOrder: chap.order
                    });
                  });
                } catch (ce) {
                  console.error(`Bölüm yorumları çekilemedi (${chap.title}):`, ce);
                }
              })
            );
          } catch (chErr) {
            console.error(`Bölümler çekilemedi (${story.title}):`, chErr);
          }
        })
      );

      // Yazarın daha önce beğendiği yorumları tespit et (arka planda kontrol)
      allComments.slice(0, 50).forEach((c) => {
        checkChapterCommentLiked(firebaseUser.uid, c.storyId, c.chapterId, c.commentId).then((isLiked) => {
          if (isLiked) {
            setLikedCommentIds((prev) => new Set(prev).add(c.commentId));
          }
        });
      });

      setComments(allComments);
      setReviews(allReviews);
    } catch (err) {
      console.error("Yazar verileri yüklenirken hata:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToAuthorStories(firebaseUser.uid, (updatedStories) => {
      setStories(updatedStories);
      loadAuthorData(updatedStories);
    });

    return () => unsubscribe();
  }, [firebaseUser, loadAuthorData]);

  // Manuel Yenileme
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuthorData(stories);
  };

  // ── 2. Yorum Ağacı & Haritası ──
  const { rootComments, repliesMap, unansweredRootCount } = useMemo(() => {
    const roots: AugmentedComment[] = [];
    const repMap: Record<string, AugmentedComment[]> = {};

    comments.forEach((c) => {
      if (c.replyToId) {
        if (!repMap[c.replyToId]) repMap[c.replyToId] = [];
        repMap[c.replyToId].push(c);
      } else {
        roots.push(c);
      }
    });

    // Her yorumun altındaki yanıtları tarihe göre sırala
    Object.keys(repMap).forEach((id) => {
      repMap[id].sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
    });

    // Yazarın henüz yanıt vermediği ana yorum sayısı
    let unanswered = 0;
    roots.forEach((root) => {
      const replies = repMap[root.commentId] || [];
      const hasAuthorReply = replies.some((r) => r.userId === firebaseUser?.uid);
      if (!hasAuthorReply && root.userId !== firebaseUser?.uid) {
        unanswered++;
      }
    });

    return { rootComments: roots, repliesMap: repMap, unansweredRootCount: unanswered };
  }, [comments, firebaseUser]);

  // Yanıtsız İnceleme Sayısı
  const unansweredReviewsCount = useMemo(() => {
    return reviews.filter((r) => !r.authorReply && r.userId !== firebaseUser?.uid).length;
  }, [reviews, firebaseUser]);

  // Toplam Bekleyen Etkileşim
  const totalPendingActionCount = unansweredRootCount + unansweredReviewsCount;

  // ── 3. Filtreleme Mantığı ──
  const filteredComments = useMemo(() => {
    return rootComments.filter((comment) => {
      // Hikaye filtresi
      if (selectedStoryId !== 'all' && comment.storyId !== selectedStoryId) return false;

      // Durum filtresi
      if (statusFilter === 'unanswered') {
        const replies = repliesMap[comment.commentId] || [];
        const hasAuthorReply = replies.some((r) => r.userId === firebaseUser?.uid);
        if (hasAuthorReply || comment.userId === firebaseUser?.uid) return false;
      } else if (statusFilter === 'paragraph') {
        if (comment.type !== 'paragraph') return false;
      }

      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const authorMatch = (comment.authorName || '').toLowerCase().includes(q) || (comment.authorUsername || '').toLowerCase().includes(q);
        const textMatch = comment.text.toLowerCase().includes(q);
        const storyMatch = comment.storyTitle.toLowerCase().includes(q);
        const chapterMatch = comment.chapterTitle.toLowerCase().includes(q);
        if (!authorMatch && !textMatch && !storyMatch && !chapterMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
    });
  }, [rootComments, repliesMap, selectedStoryId, statusFilter, searchQuery, sortOrder, firebaseUser]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Hikaye filtresi
      if (selectedStoryId !== 'all' && review.storyId !== selectedStoryId) return false;

      // Durum filtresi
      if (statusFilter === 'unanswered') {
        if (review.authorReply || review.userId === firebaseUser?.uid) return false;
      }

      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const authorMatch = (review.authorName || '').toLowerCase().includes(q) || (review.authorUsername || '').toLowerCase().includes(q);
        const textMatch = review.text.toLowerCase().includes(q);
        const storyMatch = review.storyTitle.toLowerCase().includes(q);
        if (!authorMatch && !textMatch && !storyMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'rating') {
        return b.rating - a.rating;
      }
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
    });
  }, [reviews, selectedStoryId, statusFilter, searchQuery, sortOrder, firebaseUser]);

  // ── 4. Eylemler: Yorum Beğeni / Yanıt / Silme ──

  const handleToggleLike = async (comment: AugmentedComment) => {
    if (!firebaseUser) return;
    const isCurrentlyLiked = likedCommentIds.has(comment.commentId);

    // İyimser Güncelleme
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(comment.commentId);
      else next.add(comment.commentId);
      return next;
    });

    setComments((prev) =>
      prev.map((c) =>
        c.commentId === comment.commentId
          ? { ...c, likes: Math.max(0, (c.likes || 0) + (isCurrentlyLiked ? -1 : 1)) }
          : c
      )
    );

    try {
      const liked = await toggleChapterCommentLike(
        firebaseUser.uid,
        comment.storyId,
        comment.chapterId,
        comment.commentId
      );
      if (liked !== !isCurrentlyLiked) {
        setLikedCommentIds((prev) => {
          const next = new Set(prev);
          if (liked) next.add(comment.commentId);
          else next.delete(comment.commentId);
          return next;
        });
      }
    } catch (e) {
      console.error("Beğeni hatası:", e);
      setLikedCommentIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) next.add(comment.commentId);
        else next.delete(comment.commentId);
        return next;
      });
    }
  };

  const handleSendReply = async (parentComment: AugmentedComment) => {
    if (!firebaseUser || !replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const newComment = await addChapterComment(
        parentComment.storyId,
        parentComment.chapterId,
        firebaseUser.uid,
        replyText.trim(),
        'chapter',
        -1,
        parentComment.commentId
      );

      const augmentedReply: AugmentedComment = {
        ...newComment,
        storyId: parentComment.storyId,
        storyTitle: parentComment.storyTitle,
        storyCover: parentComment.storyCover,
        storyFormat: parentComment.storyFormat,
        chapterId: parentComment.chapterId,
        chapterTitle: parentComment.chapterTitle,
        chapterOrder: parentComment.chapterOrder
      };

      setComments((prev) => [augmentedReply, ...prev]);
      setReplyText('');
      setReplyingCommentId(null);
    } catch (err) {
      console.error("Yoruma yanıt verilemedi:", err);
      alert("Yanıt gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteComment = async (comment: AugmentedComment) => {
    if (!firebaseUser) return;
    const confirmDelete = window.confirm("Bu yorumu / yanıtı silmek istediğinizden emin misiniz?");
    if (!confirmDelete) return;

    setDeletingId(comment.commentId);
    try {
      await deleteChapterComment(comment.storyId, comment.chapterId, comment.commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== comment.commentId));
    } catch (e) {
      console.error("Yorum silinemedi:", e);
      alert("Yorum silinemedi. Lütfen tekrar deneyin.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── 5. Eylemler: İnceleme Yanıtı & Silme ──

  const handleSendReviewReply = async (review: AugmentedReview) => {
    if (!firebaseUser || !reviewReplyText.trim()) return;
    setSubmittingReviewReply(true);

    try {
      const replyData = await replyToReview(
        review.storyId,
        review.reviewId,
        firebaseUser.uid,
        reviewReplyText.trim()
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === review.reviewId ? { ...r, authorReply: replyData } : r
        )
      );

      setReviewReplyText('');
      setReplyingReviewId(null);
    } catch (err) {
      console.error("İncelemeye yanıt gönderilemedi:", err);
      alert("İncelemeye yanıt gönderilirken bir hata oluştu.");
    } finally {
      setSubmittingReviewReply(false);
    }
  };

  const handleDeleteReviewReply = async (review: AugmentedReview) => {
    if (!firebaseUser) return;
    const confirmDelete = window.confirm("İncelemeye verdiğiniz yazar yanıtını silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;

    try {
      await deleteReviewReply(review.storyId, review.reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === review.reviewId ? { ...r, authorReply: undefined } : r
        )
      );
    } catch (err) {
      console.error("İnceleme yanıtı silinemedi:", err);
      alert("Yanıt silinirken hata oluştu.");
    }
  };

  return (
    <div className="px-3.5 py-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full relative min-h-[calc(100vh-4rem)] pb-36 xl:pb-12 animate-fade-in">
      
      {/* Arka Plan Işık Efekti */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-sky-500/5 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* ── Üst Başlık & Geri Dönüş ── */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/studio/stats"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors mb-3 sm:mb-4 px-2.5 py-1 rounded-lg bg-card/40 border border-border/30 hover:border-primary/40 active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>İstatistiklere Dön</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                <MessageSquare size={20} />
              </div>
              <div>
                <Typography variant="h1" className="text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-2">
                  Yorum & İnceleme Yönetimi
                </Typography>
                <p className="text-xs sm:text-sm text-muted">
                  Tüm eserlerinizdeki okuyucu geri bildirimlerini yanıtlayın ve okur bağınızı güçlendirin.
                </p>
              </div>
            </div>
          </div>

          {/* Yenile Butonu */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="h-10 px-3.5 rounded-xl border border-border/50 bg-card/60 hover:bg-card/90 text-text font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
              title="Verileri Yenile"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-sky-400' : ''} />
              <span>{refreshing ? 'Güncelleniyor...' : 'Yenile'}</span>
            </button>
          </div>
        </div>

        {/* ── Hızlı Metrik Rozetleri ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5">
          <div className="p-3 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <MessageSquare size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted font-medium block truncate">Bölüm Yorumları</span>
              <span className="text-sm sm:text-base font-black text-foreground">{comments.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Star size={15} className="fill-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted font-medium block truncate">Kitap İncelemeleri</span>
              <span className="text-sm sm:text-base font-black text-foreground">{reviews.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted font-medium block truncate">Yanıt Bekleyenler</span>
              <span className={`text-sm sm:text-base font-black ${totalPendingActionCount > 0 ? 'text-emerald-400' : 'text-foreground'}`}>
                {totalPendingActionCount}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
              <Heart size={15} className="fill-pink-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted font-medium block truncate">Beğendiğiniz</span>
              <span className="text-sm sm:text-base font-black text-foreground">{likedCommentIds.size}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sekmeler (Tümü / Yorumlar / İncelemeler) ── */}
      <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'bg-card/40 hover:bg-card/70 text-muted hover:text-text border border-border/30'
          }`}
        >
          <span>Tüm Etkileşimler</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            activeTab === 'all' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
          }`}>
            {comments.length + reviews.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
              : 'bg-card/40 hover:bg-card/70 text-muted hover:text-text border border-border/30'
          }`}
        >
          <MessageSquare size={14} />
          <span>Bölüm Yorumları</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            activeTab === 'comments' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
          }`}>
            {comments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-card/40 hover:bg-card/70 text-muted hover:text-text border border-border/30'
          }`}
        >
          <Star size={14} className={activeTab === 'reviews' ? 'fill-black' : 'fill-amber-400'} />
          <span>Kitap İncelemeleri</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            activeTab === 'reviews' ? 'bg-black/20 text-black' : 'bg-muted/20 text-muted'
          }`}>
            {reviews.length}
          </span>
        </button>
      </div>

      {/* ── Filtreler & Arama Barı (Profesyonel Kontrol Merkezi) ── */}
      <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Sol: Canlı Arama Inputu */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Okur adı, yorum veya bölüm ara..."
            className="w-full bg-background/60 border border-border/40 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text p-0.5 rounded-full cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sağ: Dropdown Filtreler */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Eser Filtresi */}
          <div className="relative">
            <select
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className="appearance-none bg-background/60 border border-border/40 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer transition-all"
            >
              <option value="all">Tüm Eserlerim ({stories.length})</option>
              {stories.map((s) => (
                <option key={s.storyId} value={s.storyId}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Durum Filtresi */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
              className="appearance-none bg-background/60 border border-border/40 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer transition-all"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="unanswered">Yanıtlanmamışlar ({totalPendingActionCount})</option>
              {activeTab !== 'reviews' && (
                <option value="paragraph">Satır İçi Yorumlar</option>
              )}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Sıralama */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortType)}
              className="appearance-none bg-background/60 border border-border/40 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer transition-all"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="likes">En Çok Beğenilen</option>
              {activeTab === 'reviews' && (
                <option value="rating">En Yüksek Puan</option>
              )}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>

      </div>

      {/* ── İçerik Listesi ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-4 sm:p-5 rounded-2xl border border-border/30 bg-card/30 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/20" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-3.5 bg-muted/20 rounded" />
                  <div className="w-20 h-2.5 bg-muted/20 rounded" />
                </div>
              </div>
              <div className="w-3/4 h-3 bg-muted/20 rounded" />
              <div className="w-1/2 h-3 bg-muted/20 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── 1. Bölüm Yorumları Listesi (activeTab === 'all' veya 'comments') ── */}
          {(activeTab === 'all' || activeTab === 'comments') && (
            <div>
              {activeTab === 'all' && filteredComments.length > 0 && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <MessageSquare size={16} className="text-sky-400" />
                  <Typography variant="h3" className="text-sm font-bold text-text">
                    Bölüm Yorumları ({filteredComments.length})
                  </Typography>
                </div>
              )}

              {filteredComments.length === 0 && activeTab === 'comments' ? (
                <div className="text-center py-16 px-4 bg-card/20 border border-dashed border-border/40 rounded-3xl">
                  <MessageSquare size={36} className="mx-auto text-muted/30 mb-2" />
                  <Typography variant="h3" className="font-bold text-sm text-text/80 mb-1">
                    Yorum Bulunamadı
                  </Typography>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'all' || selectedStoryId !== 'all'
                      ? 'Belirlediğiniz filtrelere uygun yorum bulunmuyor.'
                      : 'Eserleriniz henüz yorum almamış. Yeni bölümler yayınlayarak okurlarınızı teşvik edebilirsiniz.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredComments.map((comment) => {
                    const replies = repliesMap[comment.commentId] || [];
                    const isLikedByAuthor = likedCommentIds.has(comment.commentId);
                    const isReplying = replyingCommentId === comment.commentId;
                    const hasAuthorReply = replies.some((r) => r.userId === firebaseUser?.uid);

                    return (
                      <div 
                        key={comment.commentId}
                        className="bg-card/45 backdrop-blur-md border border-border/40 hover:border-border/70 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all shadow-2xs"
                      >
                        {/* Başlık: Okur Bilgisi & Eser/Bölüm Rozetleri */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center font-bold text-xs text-primary overflow-hidden">
                              {comment.authorAvatarUrl ? (
                                <img src={comment.authorAvatarUrl} alt={comment.authorName || 'Okur'} className="w-full h-full object-cover" />
                              ) : (
                                (comment.authorName ? comment.authorName.substring(0, 2) : 'OK').toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-text">
                                  {comment.authorName || 'Okuyucu'}
                                </span>
                                {comment.authorUsername && (
                                  <span className="text-[11px] text-muted">
                                    @{comment.authorUsername}
                                  </span>
                                )}
                                {!hasAuthorReply && comment.userId !== firebaseUser?.uid && (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
                                    Yanıt Bekliyor
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted">
                                {formatRelativeTime(comment.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Eser & Bölüm Rozetleri */}
                          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                            <span className="px-2 py-0.5 rounded-lg bg-muted/10 border border-border/40 text-[10px] font-semibold text-text flex items-center gap-1">
                              {comment.storyFormat === 'webtoon' ? <Images size={11} className="text-emerald-400" /> : <BookOpen size={11} className="text-indigo-400" />}
                              <span className="max-w-[120px] truncate">{comment.storyTitle}</span>
                            </span>

                            <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[10px] font-semibold text-sky-400 max-w-[140px] truncate">
                              Bölüm {comment.chapterOrder}: {comment.chapterTitle}
                            </span>

                            {comment.type === 'paragraph' && (
                              <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[10px] font-bold text-purple-400">
                                Satır İçi #{comment.paragraphIndex + 1}
                              </span>
                            )}

                            <Link
                              href={`/read/${comment.storyId}/${comment.chapterId}#chapter-comments-section`}
                              target="_blank"
                              className="w-7 h-7 rounded-lg bg-muted/10 hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-colors shrink-0"
                              title="Bölümü Oku ve Yorumu Gör"
                            >
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>

                        {/* Yorum Metni */}
                        <div className="py-3">
                          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                            {comment.text}
                          </p>
                        </div>

                        {/* Alt Eylemler Barı (Beğen, Yanıtla, Sil) */}
                        <div className="flex items-center gap-2 pt-2 text-xs">
                          {/* Beğen Butonu */}
                          <button
                            onClick={() => handleToggleLike(comment)}
                            className={`h-8 px-3 rounded-xl border flex items-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer ${
                              isLikedByAuthor
                                ? 'bg-pink-500/15 border-pink-500/30 text-pink-500'
                                : 'bg-muted/10 hover:bg-muted/20 border-border/30 text-muted hover:text-text'
                            }`}
                          >
                            <Heart size={13} className={isLikedByAuthor ? 'fill-pink-500' : ''} />
                            <span>{comment.likes || 0}</span>
                          </button>

                          {/* Yanıtla Butonu */}
                          <button
                            onClick={() => {
                              setReplyingCommentId(isReplying ? null : comment.commentId);
                              setReplyText('');
                            }}
                            className={`h-8 px-3 rounded-xl border flex items-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer ${
                              isReplying
                                ? 'bg-primary text-black border-primary'
                                : 'bg-muted/10 hover:bg-muted/20 border-border/30 text-muted hover:text-text'
                            }`}
                          >
                            <Reply size={13} />
                            <span>{isReplying ? 'Vazgeç' : 'Cevapla'}</span>
                          </button>

                          {/* Yanıt Sayısı Rozeti */}
                          {replies.length > 0 && (
                            <span className="text-[11px] font-semibold text-muted ml-1">
                              {replies.length} yanıt
                            </span>
                          )}

                          {/* Kendi yorumuysa silme seçeneği */}
                          {comment.userId === firebaseUser?.uid && (
                            <button
                              onClick={() => handleDeleteComment(comment)}
                              disabled={deletingId === comment.commentId}
                              className="ml-auto text-muted/60 hover:text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Yorumu Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* ── İçiçe Yanıt Editörü (Expandable Reply Box) ── */}
                        {isReplying && (
                          <div className="mt-3.5 pt-3.5 border-t border-border/20 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                👑 Yazar Yanıtı Oluşturun
                              </span>
                            </div>

                            {/* Hızlı Şablon Butonları */}
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {QUICK_TEMPLATES.map((tpl, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setReplyText(tpl)}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary/90 font-medium transition-all active:scale-95 cursor-pointer"
                                >
                                  {tpl}
                                </button>
                              ))}
                            </div>

                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Okuyucunuza samimi ve teşvik edici bir yanıt yazın..."
                              rows={3}
                              className="w-full bg-background/80 border border-primary/30 rounded-xl p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary resize-y transition-all placeholder:text-muted/60"
                              autoFocus
                            />

                            <div className="flex items-center justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingCommentId(null)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-text border border-border/30 hover:bg-card transition-all cursor-pointer"
                              >
                                İptal
                              </button>
                              <button
                                onClick={() => handleSendReply(comment)}
                                disabled={submittingReply || !replyText.trim()}
                                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                              >
                                {submittingReply ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Gönderiliyor...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={13} />
                                    <span>Yanıtı Gönder</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── İçiçe Yanıtlar Listesi (Threaded Replies) ── */}
                        {replies.length > 0 && (
                          <div className="mt-3.5 pt-3.5 border-t border-border/20 space-y-2.5 pl-3 sm:pl-6 border-l-2 border-primary/20">
                            {replies.map((reply) => {
                              const isAuthorReply = reply.userId === firebaseUser?.uid;
                              const isReplyLiked = likedCommentIds.has(reply.commentId);

                              return (
                                <div 
                                  key={reply.commentId}
                                  className={`p-3 rounded-xl border text-xs ${
                                    isAuthorReply
                                      ? 'bg-primary/5 border-primary/25 shadow-2xs'
                                      : 'bg-background/40 border-border/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-foreground">
                                        {reply.authorName || 'Kullanıcı'}
                                      </span>
                                      {isAuthorReply && (
                                        <span className="inline-flex items-center gap-1 text-[9px] bg-primary text-black font-black px-1.5 py-0.2 rounded uppercase">
                                          👑 Siz (Yazar)
                                        </span>
                                      )}
                                      <span className="text-[10px] text-muted">
                                        • {formatRelativeTime(reply.createdAt)}
                                      </span>
                                    </div>

                                    {/* Silme (Yazar kendi yanıtını silebilir) */}
                                    {isAuthorReply && (
                                      <button
                                        onClick={() => handleDeleteComment(reply)}
                                        disabled={deletingId === reply.commentId}
                                        className="text-muted/50 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                                        title="Yanıtı Sil"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    )}
                                  </div>

                                  <p className="text-foreground/90 whitespace-pre-line leading-relaxed mb-2">
                                    {reply.text}
                                  </p>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleToggleLike(reply)}
                                      className={`h-6 px-2 rounded-lg border flex items-center gap-1 font-bold text-[10px] transition-all active:scale-95 cursor-pointer ${
                                        isReplyLiked
                                          ? 'bg-pink-500/15 border-pink-500/30 text-pink-500'
                                          : 'bg-muted/10 hover:bg-muted/20 border-border/30 text-muted'
                                      }`}
                                    >
                                      <Heart size={10} className={isReplyLiked ? 'fill-pink-500' : ''} />
                                      <span>{reply.likes || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 2. Kitap İncelemeleri Listesi (activeTab === 'all' veya 'reviews') ── */}
          {(activeTab === 'all' || activeTab === 'reviews') && (
            <div className={activeTab === 'all' ? 'mt-8 pt-6 border-t border-border/30' : ''}>
              {activeTab === 'all' && filteredReviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <Typography variant="h3" className="text-sm font-bold text-text">
                    Kitap İncelemeleri & Değerlendirmeler ({filteredReviews.length})
                  </Typography>
                </div>
              )}

              {filteredReviews.length === 0 && activeTab === 'reviews' ? (
                <div className="text-center py-16 px-4 bg-card/20 border border-dashed border-border/40 rounded-3xl">
                  <Star size={36} className="mx-auto text-muted/30 mb-2" />
                  <Typography variant="h3" className="font-bold text-sm text-text/80 mb-1">
                    İnceleme Bulunamadı
                  </Typography>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'all' || selectedStoryId !== 'all'
                      ? 'Belirlediğiniz filtrelere uygun inceleme bulunmuyor.'
                      : 'Eserleriniz için henüz bir inceleme yazılmamış. Okuyucularınızı bölüm sonlarında değerlendirme yapmaya davet edebilirsiniz.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => {
                    const isReplyingReview = replyingReviewId === review.reviewId;
                    const hasReply = !!review.authorReply;

                    return (
                      <div 
                        key={review.reviewId}
                        className="bg-card/45 backdrop-blur-md border border-border/40 hover:border-border/70 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all shadow-2xs"
                      >
                        {/* Başlık: Okur, Puan & Eser */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center font-bold text-xs text-amber-500 overflow-hidden">
                              {review.authorAvatarUrl ? (
                                <img src={review.authorAvatarUrl} alt={review.authorName || 'Okur'} className="w-full h-full object-cover" />
                              ) : (
                                (review.authorName ? review.authorName.substring(0, 2) : 'OK').toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-text">
                                  {review.authorName || 'Okuyucu'}
                                </span>
                                <div className="flex items-center gap-1 text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-lg text-xs font-black">
                                  <Star size={11} className="fill-current" />
                                  <span>{review.rating}/10 Puan</span>
                                </div>
                                {!hasReply && (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
                                    Yanıt Bekliyor
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted">
                                {formatRelativeTime(review.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Eser Rozeti & Kitap Sayfasına Git */}
                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <span className="px-2 py-0.5 rounded-lg bg-muted/10 border border-border/40 text-[10px] font-semibold text-text flex items-center gap-1">
                              {review.storyFormat === 'webtoon' ? <Images size={11} className="text-emerald-400" /> : <BookOpen size={11} className="text-indigo-400" />}
                              <span className="max-w-[130px] truncate">{review.storyTitle}</span>
                            </span>

                            <Link
                              href={`/story/${review.storyId}#reviews`}
                              target="_blank"
                              className="w-7 h-7 rounded-lg bg-muted/10 hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-colors shrink-0"
                              title="Kitap İncelemelerinde Gör"
                            >
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>

                        {/* İnceleme Metni */}
                        <div className="py-3">
                          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                            {review.text}
                          </p>
                        </div>

                        {/* Mevcut Yazar Yanıtı Varsa */}
                        {review.authorReply && (
                          <div className="mt-2 p-3 sm:p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex gap-2.5 items-start">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              👑
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                  <span>{review.authorReply.authorName || 'Yazar Yanıtınız'}</span>
                                  <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.2 rounded font-extrabold uppercase">
                                    Yazar Yanıtı
                                  </span>
                                </span>
                                <button
                                  onClick={() => handleDeleteReviewReply(review)}
                                  className="text-muted/50 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                                  title="Yanıtı Sil"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                                {review.authorReply.text}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Yanıt Yoksa "Yanıtla / Teşekkür Et" Butonu */}
                        {!review.authorReply && !isReplyingReview && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setReplyingReviewId(review.reviewId);
                                setReviewReplyText('');
                              }}
                              className="h-8 px-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                            >
                              <Reply size={13} />
                              <span>İncelemeye Teşekkür Et / Yanıtla</span>
                            </button>
                          </div>
                        )}

                        {/* İnceleme Yanıt Editörü */}
                        {isReplyingReview && (
                          <div className="mt-3 pt-3 border-t border-border/20 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                👑 İncelemeye Yazar Yanıtı Yazın
                              </span>
                            </div>

                            {/* Hızlı Şablonlar */}
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {[
                                'Değerli incelemen ve yüksek puanın için çok teşekkür ederim! ❤️',
                                'Eleştirilerini dikkate alarak sonraki bölümleri daha da güzelleştireceğim! 🙏',
                                'Kitabımı böylesine derin analiz ettiğin için minnettarım! ✨'
                              ].map((tpl, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setReviewReplyText(tpl)}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary/90 font-medium transition-all active:scale-95 cursor-pointer"
                                >
                                  {tpl}
                                </button>
                              ))}
                            </div>

                            <textarea
                              value={reviewReplyText}
                              onChange={(e) => setReviewReplyText(e.target.value)}
                              placeholder="Okuyucunuzun incelemesine özel düşüncelerinizi yazın..."
                              rows={3}
                              className="w-full bg-background/80 border border-primary/30 rounded-xl p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary resize-y transition-all placeholder:text-muted/60"
                              autoFocus
                            />

                            <div className="flex items-center justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-text border border-border/30 hover:bg-card transition-all cursor-pointer"
                              >
                                İptal
                              </button>
                              <button
                                onClick={() => handleSendReviewReply(review)}
                                disabled={submittingReviewReply || !reviewReplyText.trim()}
                                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                              >
                                {submittingReviewReply ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Kaydediliyor...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={13} />
                                    <span>Yanıtı Yayınla</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
