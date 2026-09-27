"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getEditorialReviews, deleteEditorialReview, EditorialReview } from '@readixon/core';
import Link from 'next/link';
import { Plus, BookOpen, Edit, Trash2, Send, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function EditorReviewsPage() {
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const data = await getEditorialReviews(50);
    setReviews(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu değerlendirmeyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteEditorialReview(id);
      toast.success('Değerlendirme silindi.');
      loadReviews();
    } catch (err) {
      console.error(err);
      toast.error('Değerlendirme silinirken bir hata oluştu.');
    }
  };

  const handleNotifyAuthor = async (reviewId: string) => {
    setNotifyingId(reviewId);
    try {
      const res = await fetch('/api/editorial/notify-author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'İşlem gerçekleştirilemedi');
      }
      toast.success(data.message || 'Yazara bildirim ve e-posta iletildi!');
      loadReviews();
    } catch (err: any) {
      console.error(err);
      toast.error('Bildirim gönderilirken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setNotifyingId(null);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return '-';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold flex items-center gap-2">
            <Sparkles className="text-amber-500" size={24} /> Kitap Değerlendirmeleri
          </Typography>
          <Typography variant="body" className="text-muted mt-1">
            Readixon editör değerlendirmelerini ve yazar bildirimlerini buradan yönetin.
          </Typography>
        </div>
        <Link href="/editor/reviews/new">
          <Button variant="primary" className="w-full md:w-auto">
            <Plus size={18} className="mr-2" /> Yeni Değerlendirme
          </Button>
        </Link>
      </div>

      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[32%]">Eser</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Editör</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[16%]">Tarih</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[16%]">Yazar Bildirimi</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[16%] text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <Typography variant="body" className="text-muted">Yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted">Henüz değerlendirme bulunamadı.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-card/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-muted/20 rounded overflow-hidden shrink-0 border border-border/40">
                          {review.storyCover ? (
                            <img src={review.storyCover} alt={review.storyTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <Typography variant="body" className="font-semibold text-text group-hover:text-primary transition-colors">
                            {review.storyTitle || 'İsimsiz Eser'}
                          </Typography>
                          <Typography variant="caption" className="text-muted">
                            Yazar: {review.authorName || 'Bilinmiyor'}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Typography variant="body" className="font-medium text-text">{review.editorName}</Typography>
                    </td>
                    <td className="px-6 py-4">
                      <Typography variant="body" className="text-sm">
                        {formatTimestamp(review.createdAt)}
                      </Typography>
                    </td>
                    <td className="px-6 py-4">
                      {review.authorNotifiedAt ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" title={`Gönderildi: ${formatTimestamp(review.authorNotifiedAt)}`}>
                          <CheckCircle2 size={12} />
                          İletildi ({formatTimestamp(review.authorNotifiedAt)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/20 text-muted border border-border/40">
                          <Clock size={12} />
                          İletilmedi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Yazara Bildirim & Mail Butonu */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            review.authorNotifiedAt 
                              ? 'text-muted hover:text-amber-500 hover:bg-amber-500/10' 
                              : 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                          }`}
                          title="Yazara Bildirim & E-Posta Gönder"
                          onPress={() => handleNotifyAuthor(review.id)}
                          disabled={notifyingId === review.id}
                        >
                          {notifyingId === review.id ? (
                            <Loader2 size={14} className="animate-spin mr-1" />
                          ) : (
                            <Send size={14} className="mr-1" />
                          )}
                          {review.authorNotifiedAt ? 'Tekrar İlet' : 'Yazara İlet'}
                        </Button>

                        <Link href={`/reviews/${review.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-muted hover:text-primary px-2" title="Görüntüle">
                            <BookOpen size={16} />
                          </Button>
                        </Link>
                        <Link href={`/editor/reviews/${review.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-muted hover:text-blue-500 px-2" title="Düzenle">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted hover:text-red-500 px-2" 
                          title="Sil"
                          onPress={() => handleDelete(review.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
