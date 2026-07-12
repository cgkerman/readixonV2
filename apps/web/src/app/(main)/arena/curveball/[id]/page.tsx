"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import { ArrowLeft, Users, AlertCircle, Clock, Star, BookOpen, Send, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
   useAuthStore,
   getCurveballRoomById,
   joinCurveballRoom,
   submitCurveballEntry,
   getCurveballSubmissions,
   voteCurveballEntry,
   hasUserVotedForCurveballSubmission,
   getUserProfile,
   CurveballRoom,
   CurveballSubmission,
   User
} from '@readixon/core';
import { ArenaEditor } from '../../../../../components/lobby/ArenaEditor';

export default function CurveballRoomPage() {
   const { id } = useParams() as { id: string };
   const router = useRouter();
   const { firebaseUser, userProfile } = useAuthStore();

   const [room, setRoom] = useState<CurveballRoom | null>(null);
   const [submissions, setSubmissions] = useState<CurveballSubmission[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // Editor State
   const [content, setContent] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [hasSubmitted, setHasSubmitted] = useState(false);

   // Voting State
   const [votingScores, setVotingScores] = useState<Record<string, { topic: number, language: number, creativity: number }>>({});
   const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
   const [hasVotedFor, setHasVotedFor] = useState<Record<string, boolean>>({});
   const [authorProfiles, setAuthorProfiles] = useState<Record<string, User>>({});

   // Curveball State
   const [isCurveballActive, setIsCurveballActive] = useState(false);
   const [remainingTimeText, setRemainingTimeText] = useState('');

   useEffect(() => {
      if (firebaseUser) {
         loadData();
      }
   }, [firebaseUser, id]);

   const loadData = async () => {
      setIsLoading(true);
      try {
         const roomData = await getCurveballRoomById(id);
         setRoom(roomData);

         if (roomData && (roomData.status === 'voting' || roomData.status === 'completed')) {
            const subs = await getCurveballSubmissions(id);
            setSubmissions(subs);

            if (firebaseUser) {
               const votedMap: Record<string, boolean> = {};
               await Promise.all(subs.map(async (sub) => {
                  const voted = await hasUserVotedForCurveballSubmission(id, sub.id, firebaseUser.uid);
                  votedMap[sub.id] = voted;
               }));
               setHasVotedFor(votedMap);
            }

            if (roomData.status === 'completed') {
               const profilesMap: Record<string, User> = {};
               await Promise.all(subs.map(async (sub) => {
                  const p = await getUserProfile(sub.authorUid);
                  if (p) profilesMap[sub.authorUid] = p;
               }));
               setAuthorProfiles(profilesMap);
            }
         }

         if (roomData && roomData.status === 'active') {
            const subs = await getCurveballSubmissions(id);
            if (subs.find(s => s.authorUid === firebaseUser?.uid)) {
               setHasSubmitted(true);
            }
         }
      } catch (error) {
         toast.error('Oda bilgileri alınamadı.');
      } finally {
         setIsLoading(false);
      }
   };

   // Curveball Timer Logic
   useEffect(() => {
      if (!room || room.status !== 'active' || !room.startedAt) return;

      const totalDurationMs = room.durationMinutes * 60 * 1000;
      const startedTimeMs = room.startedAt.toMillis();
      const triggerThresholdRatio = 1 - (room.curveball.triggerPercentage / 100);

      const interval = setInterval(() => {
         const elapsedMs = Date.now() - startedTimeMs;
         const remainingMs = Math.max(0, totalDurationMs - elapsedMs);

         // Update remaining time text
         const minutes = Math.floor(remainingMs / 60000);
         const seconds = Math.floor((remainingMs % 60000) / 1000);
         setRemainingTimeText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

         // Check if curveball should trigger
         if (elapsedMs >= totalDurationMs * triggerThresholdRatio) {
            if (!isCurveballActive) {
               setIsCurveballActive(true);
               // Sadece bir kere ses/şok için eklenebilir, şu an state yeterli
            }
         }
      }, 1000);

      return () => clearInterval(interval);
   }, [room, isCurveballActive]);

   const handleJoin = async () => {
      if (!firebaseUser) return;
      if (!userProfile?.isAuthor) {
         toast.error('Sadece yazarlar Sürpriz Kırılma odalarına katılabilir!');
         return;
      }
      try {
         await joinCurveballRoom(id, firebaseUser.uid);
         toast.success('Odaya başarıyla katıldınız!');
         loadData();
      } catch (error: any) {
         toast.error(error.message || 'Katılım sağlanamadı.');
      }
   };

   const validateContent = (text: string): { isValid: boolean, error?: string } => {
      if (!room || !isCurveballActive) return { isValid: true };

      const config = room.curveball;
      const lowerText = text.toLowerCase();

      if (config.type === 'taboo_word') {
         for (const word of config.payload) {
            if (lowerText.includes(word.toLowerCase())) {
               return { isValid: false, error: `Yasaklı kelime kullandınız: "${word}"` };
            }
         }
      } 
      else if (config.type === 'forced_injection') {
         const forcedSentence = config.payload[0].toLowerCase();
         if (!lowerText.includes(forcedSentence)) {
            return { isValid: false, error: `Zorunlu cümleyi tam olarak geçirmediniz: "${config.payload[0]}"` };
         }
      }
      else if (config.type === 'punctuation_boycott') {
         for (const punct of config.payload) {
            if (text.includes(punct)) {
               return { isValid: false, error: `Yasaklı noktalama işareti kullandınız: "${punct}"` };
            }
         }
      }

      return { isValid: true };
   };

   const handleSubmit = async () => {
      if (!firebaseUser || !room) return;
      
      const validation = validateContent(content);
      if (!validation.isValid) {
         toast.error(`Sürpriz Kırılma Kuralı İhlali: ${validation.error}`);
         return;
      }

      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

      setIsSubmitting(true);
      try {
         await submitCurveballEntry(id, firebaseUser.uid, content, wordCount);
         toast.success('Kurgunuz arenaya teslim edildi!');
         setHasSubmitted(true);
      } catch (error: any) {
         toast.error(error.message || 'Gönderim başarısız.');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleVote = async (submissionId: string) => {
      if (!firebaseUser) return;
      const scores = votingScores[submissionId];
      if (!scores || !scores.topic || !scores.language || !scores.creativity) {
         toast.error('Lütfen tüm kriterleri (Konu, Dil, Yaratıcılık) oylayın.');
         return;
      }

      setIsVoting(prev => ({ ...prev, [submissionId]: true }));
      try {
         await voteCurveballEntry(id, submissionId, firebaseUser.uid, {
            topicScore: scores.topic,
            languageScore: scores.language,
            creativityScore: scores.creativity
         });
         toast.success('Oyunuz kaydedildi!');
         setHasVotedFor(prev => ({ ...prev, [submissionId]: true }));
      } catch (error: any) {
         toast.error(error.message || 'Oy verme işlemi başarısız.');
      } finally {
         setIsVoting(prev => ({ ...prev, [submissionId]: false }));
      }
   };

   const updateVote = (submissionId: string, category: 'topic' | 'language' | 'creativity', score: number) => {
      setVotingScores(prev => ({
         ...prev,
         [submissionId]: {
            ...(prev[submissionId] || { topic: 0, language: 0, creativity: 0 }),
            [category]: score
         }
      }));
   };

   if (isLoading) {
      return <div className="p-10 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
   }

   if (!room) {
      return <div className="p-10 text-center"><Typography>Oda bulunamadı.</Typography></div>;
   }

   const isParticipant = room.participantIds.includes(firebaseUser?.uid || '');

   // Görsel şok için stil sınıfları
   const containerBg = isCurveballActive ? "bg-black" : "bg-background";
   const editorRing = isCurveballActive ? "ring-4 ring-primary shadow-primary/30 transition-all duration-700" : "";

   return (
      <div className={`flex-1 flex flex-col h-full overflow-y-auto transition-colors duration-1000 ${containerBg}`}>
         <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 pt-8 relative">

            <button onClick={() => router.push('/arena')} className={`flex items-center gap-2 mb-6 transition-colors w-fit ${isCurveballActive ? 'text-white/50 hover:text-white' : 'text-muted hover:text-text'}`}>
               <ArrowLeft size={16} />
               <Typography variant="body" className="font-medium">Arenaya Dön</Typography>
            </button>

            <div className={`bg-gradient-to-br from-primary/10 to-background border ${isCurveballActive ? 'border-primary' : 'border-primary/20'} p-8 rounded-3xl mb-8 relative overflow-hidden transition-colors duration-700`}>
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Zap size={160} />
               </div>

               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10 gap-4">
                  <div>
                     <Typography variant="h1" className={`font-black mb-2 tracking-tight ${isCurveballActive ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'text-text'}`}>
                        {room.title}
                     </Typography>
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center gap-1 uppercase">
                           {room.status === 'waiting' && <><Clock size={14} /> Bekliyor</>}
                           {room.status === 'active' && <><AlertCircle size={14} className="animate-pulse" /> Yazılıyor</>}
                           {room.status === 'voting' && <><Star size={14} /> Oylama Aşamasında</>}
                           {room.status === 'completed' && <><BookOpen size={14} /> Tamamlandı</>}
                        </span>
                        <span className={`${isCurveballActive ? 'text-white/70' : 'text-muted'} text-sm font-medium flex items-center gap-1`}>
                           <Users size={14} /> {room.participantIds.length} / {room.maxParticipants} Katılımcı
                        </span>
                     </div>
                  </div>

                  <div className={`border p-4 rounded-2xl text-center min-w-[120px] ${isCurveballActive ? 'bg-primary/20 border-primary shadow-primary/20' : 'bg-primary/5 border-primary/30'}`}>
                     <Typography variant="caption" className="text-primary font-bold uppercase tracking-wider block mb-1">ÖDÜL</Typography>
                     <Typography variant="h2" className="font-black text-primary flex items-center justify-center gap-1">
                        <Trophy size={20} />
                        {room.winnerPrize} RX
                     </Typography>
                  </div>
               </div>

               {(room.status === 'active' || room.status === 'completed') && (
                  <div className={`bg-background/80 backdrop-blur-sm border ${isCurveballActive ? 'border-primary/50' : 'border-border'} p-5 rounded-2xl relative z-10 mt-6 inline-block`}>
                     <Typography variant="caption" className={`${isCurveballActive ? 'text-primary' : 'text-muted'} font-semibold uppercase tracking-wider mb-1 block`}>TEMA</Typography>
                     <Typography variant="h3" className="font-bold text-text">"{room.theme}"</Typography>
                  </div>
               )}
            </div>

            {/* WAITING STATE */}
            {room.status === 'waiting' && (
               <div className="text-center py-20 bg-card/50 rounded-3xl border border-border border-dashed">
                  <Zap size={64} className="mx-auto text-primary/40 mb-6" />
                  <Typography variant="h2" className="mb-2 font-bold">Kayıtlar Devam Ediyor</Typography>
                  <Typography variant="body" className="text-muted max-w-lg mx-auto mb-8">
                     Bu bir Sürpriz Kırılma odasıdır. Oyun başladıktan sonra, sürenin son kısımlarında aniden gizli bir kural ortaya çıkar ve tüm hikayeyi o kurala göre yazmak veya değiştirmek zorunda kalırsınız.
                  </Typography>

                  {!isParticipant ? (
                     <div className="flex justify-center">
                        <Button onPress={handleJoin} className="bg-primary hover:bg-primary text-white rounded-full px-8 py-3 text-lg font-bold hover:scale-105 transition-transform border-0 shadow-primary/30">
                           Korkusuzca Katıl (-{room.entryFee} RX)
                        </Button>
                     </div>
                  ) : (
                     <div className="bg-primary/20 text-primary border border-primary/30 px-6 py-4 rounded-2xl inline-flex items-center gap-2 font-bold shadow-lg">
                        <AlertCircle size={20} className="animate-pulse" />
                        Katıldınız! Tema ve kırılma anı için beklemedeyiz...
                     </div>
                  )}
               </div>
            )}

            {/* ACTIVE STATE */}
            {room.status === 'active' && (
               <div className="space-y-6">
                  {!isParticipant ? (
                     <div className="text-center py-20 bg-card/50 rounded-3xl border border-border">
                        <Typography variant="h3" className="text-muted">Seyirci Modu</Typography>
                        <Typography variant="body" className="text-muted/70 mt-2">Bu odaya katılmadığınız için yazamazsınız. Oylama başladığında geri dönebilirsiniz.</Typography>
                     </div>
                  ) : hasSubmitted ? (
                     <div className="text-center py-20 bg-primary/10 rounded-3xl border border-primary/20">
                        <Send size={48} className="mx-auto text-primary mb-4" />
                        <Typography variant="h2" className="font-bold text-primary mb-2">Başarıyla Teslim Edildi</Typography>
                        <Typography variant="body" className="text-text">Kurgunuz oylamaya eklenecek. Süre bitimini bekleyiniz.</Typography>
                     </div>
                  ) : (
                     <div className="animate-in slide-in-from-bottom-4 duration-700">
                        
                        {/* Time indicator */}
                        <div className="flex justify-between items-end mb-4">
                           <div>
                              {isCurveballActive && (
                                 <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 border border-primary/50 px-4 py-2 rounded-xl mb-4 animate-in slide-in-from-top-4 duration-500">
                                    <AlertTriangle className="animate-pulse" />
                                    <span>SÜRPRİZ KISITLAMA GELDİ! Kural: </span>
                                    <span className="text-white bg-primary px-2 py-0.5 rounded">
                                       {room.curveball.type === 'taboo_word' && `YASAKLI KELİMELER: ${room.curveball.payload.join(', ')}`}
                                       {room.curveball.type === 'forced_injection' && `ŞU CÜMLEYİ GEÇİR: "${room.curveball.payload[0]}"`}
                                       {room.curveball.type === 'punctuation_boycott' && `YASAKLI İŞARETLER: ${room.curveball.payload.join('  ')}`}
                                    </span>
                                 </div>
                              )}
                           </div>
                           <div className={`text-4xl font-black tabular-nums transition-colors ${isCurveballActive ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'text-text'}`}>
                              {remainingTimeText || "00:00"}
                           </div>
                        </div>

                        <div className={`rounded-xl overflow-hidden ${editorRing}`}>
                           <ArenaEditor
                              value={content}
                              onChange={setContent}
                              wordLimit={room.wordLimit}
                              disabled={isSubmitting}
                           />
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                           <div className="text-sm text-muted">
                              {isCurveballActive && (
                                 <span className="text-primary font-bold">⚠️ Sistem kısıtlamayı otomatik kontrol eder. Kurala uymayan kurgular teslim edilemez.</span>
                              )}
                           </div>
                           <Button
                              onPress={handleSubmit}
                              disabled={isSubmitting || content.length < 50}
                              className={`rounded-full px-8 py-3 text-lg font-bold border-0 hover:scale-105 transition-transform ${isCurveballActive ? 'bg-primary hover:bg-primary text-white shadow-primary/40' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'}`}
                           >
                              {isSubmitting ? 'Gönderiliyor...' : 'Teslim Et'}
                           </Button>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* VOTING STATE */}
            {room.status === 'voting' && (
               <div className="space-y-8">
                  <div className="bg-card p-6 rounded-3xl border border-border flex items-center justify-between">
                     <div>
                        <Typography variant="h3" className="font-bold flex items-center gap-2">
                           <Star className="text-amber-500" /> Halk Oylaması Başladı
                        </Typography>
                        <Typography variant="body" className="text-muted mt-1">Kimlerin yazdığını bilmeden en iyi hikayeyi seçin. <strong className="text-primary">Yaratıcılık puanını verirken, yazarın sürpriz kısıtlamayı ne kadar doğal yedirdiğine dikkat edin!</strong></Typography>
                     </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex flex-col">
                     <Typography variant="caption" className="text-primary font-bold uppercase tracking-wider mb-1">UYGULANAN KISITLAMA KURALI</Typography>
                     <Typography variant="body" className="font-medium text-text">
                        {room.curveball.type === 'taboo_word' && `Kullanılmaması gereken kelimeler: ${room.curveball.payload.join(', ')}`}
                        {room.curveball.type === 'forced_injection' && `Hikayede mutlaka geçmesi gereken cümle: "${room.curveball.payload[0]}"`}
                        {room.curveball.type === 'punctuation_boycott' && `Kullanılmaması gereken noktalama işaretleri: ${room.curveball.payload.join(' ')}`}
                     </Typography>
                  </div>

                  <div className="grid gap-6">
                     {submissions.map((sub, index) => (
                        <div key={sub.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                           <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                              <Typography variant="h3" className="font-black text-primary">Yazar {index + 1}</Typography>
                              <Typography variant="caption" className="text-muted bg-background px-3 py-1 rounded-full">{sub.wordCount} Kelime</Typography>
                           </div>

                           <div className="prose prose-invert max-w-none text-text mb-8 leading-relaxed">
                              {sub.content.split('\n').map((paragraph, i) => (
                                 <p key={i} className="mb-4">{paragraph}</p>
                              ))}
                           </div>

                           {/* Voting Interface */}
                           {firebaseUser && sub.authorUid !== firebaseUser.uid ? (
                              hasVotedFor[sub.id] ? (
                                 <div className="bg-green-500/10 p-4 rounded-xl text-center text-green-500 font-medium">
                                    Bu yazıya oyunuzu verdiniz.
                                 </div>
                              ) : (
                                 <div className="bg-background rounded-2xl p-6 border border-border/50">
                                    <Typography variant="h4" className="font-bold mb-4">Puan Ver</Typography>

                                    <div className="grid sm:grid-cols-3 gap-6 mb-6">
                                       {(['topic', 'language', 'creativity'] as const).map((category) => (
                                          <div key={category} className="space-y-2">
                                             <Typography variant="caption" className="font-medium text-muted uppercase tracking-wider block">
                                                {category === 'topic' ? 'Konuya Uygunluk' : category === 'language' ? 'Dil ve Anlatım' : 'Yaratıcılık / Kurala Uyum'}
                                             </Typography>
                                             <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                   <button
                                                      key={star}
                                                      onClick={() => updateVote(sub.id, category, star)}
                                                      className={`transition-colors ${(votingScores[sub.id]?.[category] || 0) >= star ? 'text-amber-500' : 'text-muted/30 hover:text-amber-500/50'}`}
                                                   >
                                                      <Star size={24} className={(votingScores[sub.id]?.[category] || 0) >= star ? 'fill-amber-500' : ''} />
                                                   </button>
                                                ))}
                                             </div>
                                          </div>
                                       ))}
                                    </div>

                                    <Button
                                       variant="outline"
                                       onPress={() => handleVote(sub.id)}
                                       disabled={isVoting[sub.id]}
                                       className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                    >
                                       {isVoting[sub.id] ? 'Kaydediliyor...' : 'Oyu Kaydet'}
                                    </Button>
                                 </div>
                              )
                           ) : (
                              <div className="bg-primary/10 p-4 rounded-xl text-center text-primary font-medium">
                                 Kendi yazınıza oy veremezsiniz.
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* COMPLETED STATE */}
            {room.status === 'completed' && (
               <div className="space-y-8">
                  <div className="bg-gradient-to-r from-primary/20 via-primary/5 to-background p-8 rounded-3xl border-l-4 border-l-primary border border-border shadow-primary/10">
                     <Typography variant="h2" className="font-black text-primary mb-2 flex items-center gap-2">
                        <Trophy size={28} className="animate-bounce" /> Kazananlar Belli Oldu!
                     </Typography>
                     <Typography variant="body" className="text-muted font-medium">Kazanılan Ödül: <span className="text-primary font-bold">{room.winnerPrize} RX</span></Typography>
                  </div>

                  <div className="grid gap-6">
                     {submissions.map((sub) => {
                        const isWinner = room.winners?.includes(sub.authorUid);

                        return (
                           <div key={sub.id} className={`bg-card border ${isWinner ? 'border-primary shadow-primary/20 bg-primary/5 ring-1 ring-primary/20 transform hover:-translate-y-1 transition-all duration-300' : 'border-border hover:border-border/80 transition-colors'} rounded-3xl p-6 relative overflow-hidden`}>
                              {isWinner && (
                                 <div className="absolute top-0 right-0 bg-primary text-white font-bold text-xs px-5 py-1.5 rounded-bl-2xl shadow-lg shadow-primary/30 flex items-center gap-1 uppercase tracking-wider">
                                    <Star size={12} className="fill-white" /> Kazanan
                                 </div>
                              )}

                              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border/50">
                                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                                    {authorProfiles[sub.authorUid]?.avatarUrl ? (
                                       <img src={authorProfiles[sub.authorUid].avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                       <span className="font-bold text-primary text-xl">{authorProfiles[sub.authorUid]?.displayName?.charAt(0) || <Users size={20} className="text-muted" />}</span>
                                    )}
                                 </div>
                                 <div>
                                    <Typography variant="h3" className="font-bold text-text">
                                       {authorProfiles[sub.authorUid]?.displayName || 'Yazar'}
                                    </Typography>
                                    {authorProfiles[sub.authorUid]?.username && (
                                       <Typography variant="caption" className="text-muted block mt-0.5">
                                          @{authorProfiles[sub.authorUid].username}
                                       </Typography>
                                    )}
                                 </div>
                              </div>

                              <div className="prose prose-invert max-w-none text-muted mb-8 leading-relaxed opacity-70">
                                 {sub.content.substring(0, 300)}...
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}

         </div>
      </div>
   );
}
