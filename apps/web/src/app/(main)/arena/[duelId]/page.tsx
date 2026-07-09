"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { Feather, Star, Send, ShieldAlert, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';
import { useAuthStore, getDuelById, subscribeToDuel, subscribeToDuelTurns, submitDuelTurn, finishDuel, submitDuelVote, Duel, DuelTurn } from '@readixon/core';
import { toast } from 'sonner';

export default function ArenaDuelPage() {
  const { duelId } = useParams() as { duelId: string };
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  
  const [duel, setDuel] = useState<Duel | null>(null);
  const [turns, setTurns] = useState<DuelTurn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Turn input state
  const [turnContent, setTurnContent] = useState('');
  const [embargoWords, setEmbargoWords] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voting state
  const [scoreA, setScoreA] = useState(5);
  const [scoreB, setScoreB] = useState(5);
  const [isVoting, setIsVoting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubDuel: (() => void) | undefined;
    let unsubTurns: (() => void) | undefined;

    const load = async () => {
      try {
        const d = await getDuelById(duelId);
        if (!d) {
          toast.error("Düello bulunamadı");
          router.push('/arena');
          return;
        }
        
        unsubDuel = subscribeToDuel(duelId, (data) => {
          if (data) setDuel(data);
        });
        
        unsubTurns = subscribeToDuelTurns(duelId, (data) => {
          setTurns(data);
          // Scroll to bottom
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 100);
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();

    return () => {
      if (unsubDuel) unsubDuel();
      if (unsubTurns) unsubTurns();
    };
  }, [duelId, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!duel) return null;

  const isMyTurn = firebaseUser?.uid === duel.currentTurnUid;
  const isParticipant = firebaseUser?.uid === duel.authorA.uid || firebaseUser?.uid === duel.authorB.uid;
  const opponent = firebaseUser?.uid === duel.authorA.uid ? duel.authorB : duel.authorA;
  const me = firebaseUser?.uid === duel.authorA.uid ? duel.authorA : duel.authorB;

  // Wildcard Validation
  const validateEmbargo = (text: string) => {
    if (!duel.embargoedWords || duel.embargoedWords.length === 0) return true;
    
    const words = (text.toLowerCase().match(/\b(\w+)\b/g) || []) as string[];
    const usedEmbargoes = duel.embargoedWords.filter(w => words.indexOf(w.toLowerCase()) !== -1);
    
    if (usedEmbargoes.length > 0) {
      toast.error(`Kelime Ambargosu İhlali! Şu kelimeleri kullanamazsınız: ${usedEmbargoes.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmitTurn = async () => {
    if (!firebaseUser || !isMyTurn) return;
    if (turnContent.trim().length < 10) {
      toast.error('Çok kısa! Biraz daha edebiyat lütfen.');
      return;
    }
    
    if (!validateEmbargo(turnContent)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const nextUid = opponent.uid;
      const embargoArray = embargoWords.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
      if (embargoArray.length > 3) {
        toast.error('En fazla 3 kelime yasaklayabilirsiniz.');
        setIsSubmitting(false);
        return;
      }
      
      await submitDuelTurn(duelId, firebaseUser.uid, turnContent, nextUid, embargoArray);
      setTurnContent('');
      setEmbargoWords('');
    } catch (error) {
      toast.error('Gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async () => {
    if (!firebaseUser) return;
    setIsVoting(true);
    try {
      await submitDuelVote(duelId, firebaseUser.uid, duel.authorA.uid, scoreA, duel.authorB.uid, scoreB);
      toast.success("Oylarınız kaydedildi!");
    } catch (error: any) {
      toast.error(error.message || "Oy verilirken hata oluştu");
    } finally {
      setIsVoting(false);
    }
  };

  const handleFinishDuel = async () => {
    if (confirm("Düelloyu bitirip halk oylamasına sunmak istediğinize emin misiniz?")) {
      try {
      await finishDuel(duelId, duel.authorA.uid, duel.authorB.uid);
      toast.success("Düello bitti, oylama başladı!");
      } catch (error) {
        toast.error("Hata oluştu");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Düello Başlığı */}
      <div className="shrink-0 p-4 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/arena')} className="p-2 hover:bg-white/5 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div>
            <Typography variant="caption" className="text-primary font-bold uppercase tracking-widest flex items-center gap-2">
              <Feather size={14} /> 
              {duel.status === 'active' ? 'CANLI DÜELLO' : duel.status === 'voting' ? 'OYLAMADA' : 'BİTTİ'}
            </Typography>
            <Typography variant="body" className="font-semibold">Konu: {duel.prompt}</Typography>
            {duel.turnTimeLimitMinutes && (
              <Typography variant="caption" className="text-muted flex items-center gap-1 mt-1">
                Tur Süresi: {duel.turnTimeLimitMinutes >= 60 ? `${duel.turnTimeLimitMinutes / 60} Saat` : `${duel.turnTimeLimitMinutes} Dk`}
              </Typography>
            )}
          </div>
        </div>
        
        {/* Yazarlar */}
        <div className="hidden sm:flex items-center gap-4 bg-background px-4 py-2 rounded-full border border-border">
          <div className="flex items-center gap-2">
            <Typography variant="caption" className={`font-medium ${duel.currentTurnUid === duel.authorA.uid ? 'text-primary' : 'text-muted'}`}>
              {duel.authorA.displayName}
            </Typography>
            <img src={duel.authorA.avatarUrl || ''} className={`w-6 h-6 rounded-full ${duel.currentTurnUid === duel.authorA.uid ? 'ring-2 ring-primary' : ''}`} />
          </div>
          <Typography variant="caption" className="font-bold italic text-muted">VS</Typography>
          <div className="flex items-center gap-2">
            <img src={duel.authorB.avatarUrl || ''} className={`w-6 h-6 rounded-full ${duel.currentTurnUid === duel.authorB.uid ? 'ring-2 ring-primary' : ''}`} />
            <Typography variant="caption" className={`font-medium ${duel.currentTurnUid === duel.authorB.uid ? 'text-primary' : 'text-muted'}`}>
              {duel.authorB.displayName}
            </Typography>
          </div>
        </div>

        {isParticipant && duel.status === 'active' && (
          <Button variant="outline" onPress={handleFinishDuel} className="border-destructive/30 text-primary hover:bg-destructive/10">
            Düelloyu Bitir
          </Button>
        )}
      </div>

      {/* Hikaye Akışı */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6">
        {turns.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <Feather size={48} className="mb-4" />
            <Typography variant="body">Henüz kimse hamle yapmadı.</Typography>
          </div>
        ) : duel.status === 'active' ? (
          // AKTİF DÜELLO GÖRÜNÜMÜ (MESAJLAŞMA)
          turns.map((turn, index) => {
            const isRightSide = isParticipant 
              ? turn.authorUid === firebaseUser?.uid 
              : turn.authorUid === duel.authorB.uid;
            const author = turn.authorUid === duel.authorA.uid ? duel.authorA : duel.authorB;
            
            return (
              <div key={turn.id} className={`flex flex-col max-w-3xl w-full ${isRightSide ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {!isRightSide && <img src={author.avatarUrl} className="w-5 h-5 rounded-full object-cover" />}
                  <Typography variant="caption" className="text-muted font-medium">{author.displayName}</Typography>
                  {isRightSide && <img src={author.avatarUrl} className="w-5 h-5 rounded-full object-cover" />}
                </div>
                
                <div className={`p-4 sm:p-5 rounded-2xl ${isRightSide ? 'bg-primary/10 border border-primary/20 text-text' : 'bg-card border border-border/50 text-text'} shadow-sm`}>
                  <Typography variant="body" className="whitespace-pre-wrap leading-relaxed">
                    {turn.content}
                  </Typography>
                </div>

                {turn.embargoWordsSet && turn.embargoWordsSet.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <ShieldAlert size={12} />
                    Rakibe Yasaklandı: {turn.embargoWordsSet.join(', ')}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // OYLAMA / TAMAMLANMIŞ GÖRÜNÜM (BÜTÜNLEŞİK HİKAYE)
          <div className="max-w-3xl mx-auto w-full bg-card border border-border/50 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <Typography variant="h2" className="text-center font-bold mb-2 text-primary">
              {duel.title || "İsimsiz Düello"}
            </Typography>
            <Typography variant="body" className="text-center text-muted italic mb-8">
              {duel.prompt}
            </Typography>
            <div className="space-y-4">
              {turns.map((turn) => {
                const isAuthorA = turn.authorUid === duel.authorA.uid;
                const author = isAuthorA ? duel.authorA : duel.authorB;
                
                return (
                  <div key={turn.id} className="flex gap-4 group">
                    <div className="mt-2 opacity-20 group-hover:opacity-100 transition-opacity shrink-0">
                      <img src={author.avatarUrl} className="w-8 h-8 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-border" />
                    </div>
                    <Typography variant="body" className="leading-loose text-lg flex-1 text-text/90">
                      {turn.content}
                    </Typography>
                  </div>
                );
              })}
            </div>

            {/* OYLAMA PANELİ */}
            {duel.status === 'voting' && (
              <div className="mt-16 pt-8 border-t border-border/50">
                <Typography variant="h3" className="text-center font-bold mb-6">Yazarları Oyla</Typography>
                
                {duel.voters?.includes(firebaseUser?.uid || '') ? (
                  <div className="text-center p-8 bg-card/50 backdrop-blur-md rounded-3xl border border-border shadow-inner">
                    <CheckCircle2 size={48} className="mx-auto text-primary mb-4" />
                    <Typography variant="h3" className="font-bold text-text mb-2">Oyunuzu kullandınız!</Typography>
                    <Typography variant="body" className="text-muted mb-6">İşte güncel durum:</Typography>
                    
                    <div className="flex items-center justify-center gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <img src={duel.authorA.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                        <Typography variant="caption" className="font-bold">{duel.authorA.displayName}</Typography>
                        <span className="text-lg font-bold text-primary flex items-center gap-1"><Star size={18} className="fill-primary" /> {duel.scores?.[duel.authorA.uid]?.average || 0}</span>
                      </div>
                      <Typography variant="h3" className="text-muted font-bold italic opacity-50">VS</Typography>
                      <div className="flex flex-col items-center gap-2">
                        <img src={duel.authorB.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20" />
                        <Typography variant="caption" className="font-bold">{duel.authorB.displayName}</Typography>
                        <span className="text-lg font-bold text-amber-500 flex items-center gap-1"><Star size={18} className="fill-amber-500" /> {duel.scores?.[duel.authorB.uid]?.average || 0}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 justify-center items-center bg-card/40 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 left-0 h-32 bg-primary/5 -z-10 blur-3xl pointer-events-none" />
                    
                    {/* Yazar A Oylama */}
                    <div className="flex flex-col items-center gap-4 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <img src={duel.authorA.avatarUrl} className="w-16 h-16 rounded-full object-cover border-4 border-background shadow-md" />
                        <Typography variant="body" className="font-bold text-lg">{duel.authorA.displayName}</Typography>
                      </div>
                      <div className="flex items-center gap-1 bg-background/50 p-2 rounded-full border border-border">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} onClick={() => setScoreA(s)} className="p-1.5 hover:scale-125 transition-transform">
                            <Star size={24} className={s <= scoreA ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-muted/30"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Typography variant="h2" className="text-muted font-black italic opacity-20 z-10">VS</Typography>
                    
                    {/* Yazar B Oylama */}
                    <div className="flex flex-col items-center gap-4 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <img src={duel.authorB.avatarUrl} className="w-16 h-16 rounded-full object-cover border-4 border-background shadow-md" />
                        <Typography variant="body" className="font-bold text-lg">{duel.authorB.displayName}</Typography>
                      </div>
                      <div className="flex items-center gap-1 bg-background/50 p-2 rounded-full border border-border">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} onClick={() => setScoreB(s)} className="p-1.5 hover:scale-125 transition-transform">
                            <Star size={24} className={s <= scoreB ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-muted/30"} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {!duel.voters?.includes(firebaseUser?.uid || '') && (
                  <div className="flex justify-center mt-6">
                    <Button onPress={handleVote} disabled={isVoting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 rounded-full text-lg font-bold shadow-xl shadow-primary/20">
                      {isVoting ? 'Gönderiliyor...' : 'Oyları Gönder'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Yazma Alanı (Sadece Aktif Yazar İçin) */}
      {duel.status === 'active' && isParticipant && (
        <div className="shrink-0 p-4 border-t border-border/50 bg-card/80 backdrop-blur-xl">
          {isMyTurn ? (
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {duel.embargoedWords && duel.embargoedWords.length > 0 && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/50 text-primary px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
                  <ShieldAlert size={16} />
                  DİKKAT! Bu turda şu kelimeleri kullanamazsın: {duel.embargoedWords.join(', ')}
                </div>
              )}
              
              <textarea
                value={turnContent}
                onChange={(e) => setTurnContent(e.target.value)}
                placeholder="Hikayeyi devral ve devam ettir..."
                className="w-full h-32 bg-background border border-border focus:border-destructive/50 rounded-xl p-4 resize-none outline-none transition-colors text-text"
              />
              
              <div className="flex items-center gap-4 justify-between">
                <div className="flex-1 max-w-sm">
                  <Input 
                    placeholder="Bir sonraki tur için 3 yasak kelime (Virgülle ayır)"
                    value={embargoWords}
                    onChangeText={(val) => setEmbargoWords(val)}
                  />
                </div>
                <Button 
                  onPress={handleSubmitTurn}
                  disabled={isSubmitting || turnContent.trim().length === 0}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                >
                  {isSubmitting ? 'Gönderiliyor...' : (
                    <>Hamleni Yap <ArrowRight size={18} className="ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center py-4 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
              <Typography variant="body" className="text-muted font-medium">
                Rakibinin ({opponent?.displayName}) yazması bekleniyor...
              </Typography>
            </div>
          )}
        </div>
      )}

      {/* İzleyici Modu Alt Bilgisi */}
      {duel.status === 'active' && !isParticipant && (
        <div className="shrink-0 p-4 border-t border-border/50 bg-card/80 backdrop-blur-xl flex justify-center items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Typography variant="body" className="text-muted font-medium flex items-center gap-2">
            Canlı izliyorsunuz... Sıra <span className="text-primary font-bold">{duel.currentTurnUid === duel.authorA.uid ? duel.authorA.displayName : duel.authorB.displayName}</span> yazarında.
          </Typography>
        </div>
      )}
      
      
    </div>
  );
}
