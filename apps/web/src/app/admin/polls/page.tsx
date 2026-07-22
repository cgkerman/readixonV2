"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { 
  AdminPoll, 
  getAllAdminPolls, 
  createAdminPoll, 
  toggleAdminPollStatus, 
  deleteAdminPoll 
} from '@readixon/core';
import { Loader2, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<AdminPoll[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const data = await getAllAdminPolls();
      setPolls(data);
    } catch (err) {
      toast.error('Anketler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length >= 6) {
      toast.error("Maksimum 6 seçenek eklenebilir.");
      return;
    }
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("En az 2 seçenek olmalıdır.");
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Lütfen bir soru girin');
      return;
    }
    const validOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    if (validOptions.length < 2) {
      toast.error('Lütfen en az 2 geçerli seçenek girin');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdminPoll(question, validOptions, true); // true = diğerlerini pasif yap
      toast.success('Günün anketi başarıyla oluşturuldu ve aktif edildi!');
      setQuestion('');
      setOptions(['', '']);
      setShowForm(false);
      loadPolls();
    } catch (err) {
      toast.error('Anket oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (pollId: string, currentStatus: boolean) => {
    try {
      await toggleAdminPollStatus(pollId, !currentStatus);
      toast.success('Anket statüsü güncellendi');
      loadPolls();
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  const handleDelete = async (pollId: string) => {
    if (confirm("Bu anketi tamamen silmek istediğinize emin misiniz?")) {
      try {
        await deleteAdminPoll(pollId);
        toast.success("Anket silindi");
        loadPolls();
      } catch (err) {
        toast.error("Silinemedi");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 h-full">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <Typography variant="h1" className="text-3xl font-bold mb-2">Okur Anketleri</Typography>
          <Typography variant="body" className="text-muted">Sağ panelde gösterilen "Günün Okur Anketi"ni buradan yönetin.</Typography>
        </div>
        <Button 
          variant="primary" 
          onPress={() => setShowForm(!showForm)}
          className="rounded-full"
        >
          {showForm ? 'İptal' : 'Yeni Anket Oluştur'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card/40 rounded-2xl p-6 border border-border shrink-0">
          <Typography variant="h3" className="font-bold mb-6">Yeni Anket Ekle</Typography>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Anket Sorusu</label>
              <Input
                placeholder="Örn: Kitap okurken müzik dinler misiniz?"
                value={question}
                onChangeText={(val) => setQuestion(val)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Seçenekler</label>
              <div className="flex flex-col gap-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Input
                      placeholder={`Seçenek ${idx + 1}`}
                      value={opt}
                      onChangeText={(val) => handleOptionChange(idx, val)}
                      containerClassName="flex-1"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeOption(idx)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
              {options.length < 6 && (
                <button 
                  type="button" 
                  onClick={addOption}
                  className="mt-4 flex items-center gap-2 text-primary hover:text-primary-light font-medium text-sm transition-colors"
                >
                  <Plus size={16} /> Yeni Seçenek Ekle
                </button>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button 
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Yayınla (Aktif Et)'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 bg-card/20 rounded-3xl border border-border p-6 flex flex-col gap-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : polls.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted">
            <p>Henüz hiçbir anket oluşturulmamış.</p>
          </div>
        ) : (
          polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            
            return (
              <div key={poll.id} className={`p-6 rounded-2xl border ${poll.isActive ? 'border-primary bg-primary/5' : 'border-border bg-card/40'} flex flex-col sm:flex-row gap-6 relative`}>
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {poll.isActive && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold uppercase">Aktif</span>}
                      <Typography variant="body" className="font-bold text-lg text-text leading-tight">{poll.question}</Typography>
                    </div>
                    <Typography variant="caption" className="text-muted">
                      {poll.createdAt?.toDate 
                        ? new Intl.DateTimeFormat('tr-TR', { 
                            day: 'numeric', month: 'long', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          }).format(poll.createdAt.toDate())
                        : 'Tarih Yok'} • Toplam {totalVotes} oy
                    </Typography>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-md">
                    {poll.options.map((opt, i) => {
                      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center justify-between gap-4 text-sm relative overflow-hidden rounded-lg bg-black/20 p-2">
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                          <span className="relative z-10 font-medium">{opt.text}</span>
                          <div className="relative z-10 flex gap-2 text-muted">
                            <span>{opt.votes} oy</span>
                            <span className="font-bold w-10 text-right">%{percent}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 sm:border-l sm:border-border/50 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <Button 
                    variant={poll.isActive ? "secondary" : "outline"} 
                    className="w-full sm:w-auto text-sm"
                    onPress={() => handleToggleStatus(poll.id, poll.isActive)}
                  >
                    {poll.isActive ? (
                      <><XCircle size={16} className="mr-2" /> Pasif Yap</>
                    ) : (
                      <><CheckCircle size={16} className="mr-2" /> Aktif Et</>
                    )}
                  </Button>
                  
                  <button 
                    onClick={() => handleDelete(poll.id)}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 size={16} /> Sil
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
