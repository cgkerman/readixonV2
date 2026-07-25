"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { 
  getAllQuotes, 
  createQuote, 
  toggleQuoteStatus, 
  deleteQuote, 
  AdminQuote 
} from '@readixon/core';
import { Loader2, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminQuotePage() {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  const fetchQuotes = async () => {
    setLoading(true);
    const data = await getAllQuotes();
    setQuotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !author.trim()) {
      toast.error("Lütfen alıntı metni ve yazar kısmını doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createQuote(text.trim(), author.trim());
      toast.success("Alıntı başarıyla yayınlandı.");
      setText('');
      setAuthor('');
      setShowForm(false);
      fetchQuotes();
    } catch (error: any) {
      toast.error(error.message || "Alıntı oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (quoteId: string, currentStatus: boolean) => {
    try {
      await toggleQuoteStatus(quoteId, !currentStatus);
      toast.success(currentStatus ? "Alıntı pasife çekildi." : "Alıntı aktife alındı.");
      fetchQuotes();
    } catch (error: any) {
      toast.error("Durum güncellenirken hata oluştu.");
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!window.confirm("Bu alıntıyı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteQuote(quoteId);
      toast.success("Alıntı silindi.");
      fetchQuotes();
    } catch (error: any) {
      toast.error("Silinirken hata oluştu.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <Typography variant="h2" className="font-bold text-text mb-1">Günün Alıntısı</Typography>
          <Typography variant="body" className="text-muted">Readix anasayfasında (sağ sütun) görünen sözleri yönetin.</Typography>
        </div>
        <Button 
          variant={showForm ? 'outline' : 'primary'} 
          onPress={() => setShowForm(!showForm)}
          className="rounded-full"
        >
          {showForm ? 'İptal' : 'Yeni Alıntı Ekle'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card/40 rounded-2xl p-6 border border-border shrink-0">
          <Typography variant="h3" className="font-bold mb-6">Yeni Alıntı Ekle</Typography>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Alıntı Metni</label>
              <Input
                placeholder="Örn: Yalnızca bir damla sudur insan, ama dalgaları okyanusları aşar."
                value={text}
                onChangeText={(val) => setText(val)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Yazar/Söyleyen</label>
              <Input
                placeholder="Örn: @edebiyatci veya Dostoyevski"
                value={author}
                onChangeText={(val) => setAuthor(val)}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button 
                type="submit" 
                variant="primary" 
                className="px-8 rounded-full"
                disabled={isSubmitting || !text.trim() || !author.trim()}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                Yayınla
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card/20 rounded-2xl border border-border overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border/50 bg-card/40 font-semibold text-text flex items-center shrink-0">
          <div className="flex-1">Tüm Alıntılar</div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted">
            <Loader2 size={32} className="animate-spin mb-4" />
            <Typography>Alıntılar Yükleniyor...</Typography>
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted">
            <Typography>Henüz hiç alıntı oluşturulmamış.</Typography>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {quotes.map(quote => (
              <div key={quote.id} className="p-6 border-b border-border/50 hover:bg-card/40 transition-colors flex flex-col md:flex-row md:items-center gap-6">
                
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    {quote.isActive ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Yayında
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/20 text-muted text-xs font-bold uppercase tracking-wider">
                        Pasif
                      </span>
                    )}
                  </div>
                  <Typography variant="body" className="font-serif italic text-lg text-text leading-tight">"{quote.text}"</Typography>
                  <Typography variant="caption" className="text-muted font-medium">- {quote.author}</Typography>
                  <Typography variant="caption" className="text-muted/60 mt-2 block">
                    {quote.createdAt?.toDate 
                      ? new Intl.DateTimeFormat('tr-TR', { 
                          day: 'numeric', month: 'long', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        }).format(quote.createdAt.toDate())
                      : 'Tarih Yok'}
                  </Typography>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  {quote.isActive ? (
                    <Button 
                      variant="ghost" 
                      className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                      onPress={() => handleToggleStatus(quote.id, true)}
                      title="Pasife Çek"
                    >
                      <XCircle size={20} className="md:mr-2" /> <span className="hidden md:inline">Pasife Çek</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="text-primary hover:bg-primary/10"
                      onPress={() => handleToggleStatus(quote.id, false)}
                      title="Aktife Al"
                    >
                      <CheckCircle size={20} className="md:mr-2" /> <span className="hidden md:inline">Aktife Al</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onPress={() => handleDelete(quote.id)}
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
