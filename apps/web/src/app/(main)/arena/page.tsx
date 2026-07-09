"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input } from '@readixon/ui';
import { Feather, Plus, X, Users, AlertCircle, Radio, Star, BookOpen } from 'lucide-react';
import { useAuthStore, getPublicDuels, getUserPendingChallenges, getUserSentChallenges, createDuelChallenge, acceptDuelChallenge, rejectDuelChallenge, cancelDuelChallenge, Duel, DuelAuthor, getUserByUsername, searchUsers, User } from '@readixon/core';
import { toast } from 'sonner';

export default function ArenaPage() {
  const router = useRouter();
  const { firebaseUser, userProfile } = useAuthStore();

  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
  const [sentDuels, setSentDuels] = useState<Duel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'voting' | 'completed'>('active');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [opponentUsername, setOpponentUsername] = useState('');
  const [duelTitle, setDuelTitle] = useState('');
  const [duelPrompt, setDuelPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(15);

  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!opponentUsername.trim()) {
      setSearchResults([]);
      return;
    }

    // Zaten listeden biri seçildiyse tekrar arama
    if (selectedUser && opponentUsername === selectedUser.username) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(opponentUsername);
        // Kendimizi hariç tut
        const filtered = results.filter(u => u.uid !== firebaseUser?.uid);
        setSearchResults(filtered);
      } catch (err) {
        console.error("Arama hatası", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [opponentUsername, selectedUser, firebaseUser?.uid]);

  useEffect(() => {
    if (firebaseUser) {
      loadDuels();
    }
  }, [firebaseUser]);

  const loadDuels = async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      const [active, pending, sent] = await Promise.all([
        getPublicDuels(),
        getUserPendingChallenges(firebaseUser.uid),
        getUserSentChallenges(firebaseUser.uid)
      ]);
      setActiveDuels(active);
      setPendingDuels(pending);
      setSentDuels(sent);
    } catch (error) {
      console.error('Error loading duels:', error);
      toast.error('Düellolar yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !firebaseUser || !opponentUsername || !duelPrompt || !duelTitle) return;

    setIsCreating(true);
    try {
      let opponentData = selectedUser;

      if (!opponentData) {
        // Fallback: Kullanıcı listeden seçmediyse zorla isimle bul (Gereksiz @ ve boşlukları temizle)
        const cleanUsername = opponentUsername.replace('@', '').trim().toLowerCase();
        opponentData = await getUserByUsername(cleanUsername);
      }

      if (!opponentData) {
        toast.error('Bu kullanıcı adıyla bir yazar bulunamadı.');
        setIsCreating(false);
        return;
      }

      const opponentUid = opponentData.uid;

      if (opponentUid === firebaseUser.uid) {
        toast.error('Kendinize meydan okuyamazsınız!');
        setIsCreating(false);
        return;
      }

      const authorA: DuelAuthor = {
        uid: firebaseUser.uid,
        displayName: userProfile.displayName,
        username: userProfile.username || '',
        avatarUrl: userProfile.avatarUrl || ''
      };

      const authorB: DuelAuthor = {
        uid: opponentUid,
        displayName: opponentData.displayName,
        username: opponentData.username || '',
        avatarUrl: opponentData.avatarUrl || ''
      };

      await createDuelChallenge(duelTitle, duelPrompt, authorA, authorB, turnTimeLimit);
      toast.success('Meydan okuma başarıyla gönderildi!');
      setIsCreateModalOpen(false);
      setOpponentUsername('');
      setDuelTitle('');
      setDuelPrompt('');
      setTurnTimeLimit(15);
      loadDuels();
    } catch (error) {
      console.error('Meydan okuma hatası:', error);
      toast.error('Meydan okuma gönderilemedi.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptChallenge = async (duelId: string) => {
    if (!firebaseUser) return;
    try {
      await acceptDuelChallenge(duelId, firebaseUser.uid);
      toast.success('Düello kabul edildi! Arenaya geçiliyor...');
      router.push(`/arena/${duelId}`);
    } catch (error) {
      toast.error('Düello kabul edilemedi.');
    }
  };

  const handleRejectChallenge = async (duelId: string) => {
    try {
      await rejectDuelChallenge(duelId);
      toast.success('Düello reddedildi.');
      loadDuels();
    } catch (error) {
      toast.error('Düello reddedilirken hata oluştu.');
    }
  };

  const handleCancelChallenge = async (duelId: string) => {
    try {
      await cancelDuelChallenge(duelId);
      toast.success('Meydan okuma iptal edildi.');
      loadDuels();
    } catch (error) {
      toast.error('İptal işlemi sırasında hata oluştu.');
    }
  };


  const renderDuelCard = (duel: Duel) => (
    <div
      key={duel.id}
      onClick={() => router.push(`/arena/${duel.id}`)}
      className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 group"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase flex items-center gap-1">
          {duel.status === 'active' ? (
            <><Radio size={12} className="animate-pulse" /> CANLI</>
          ) : duel.status === 'voting' ? (
            <><Star size={12} /> OYLAMADA</>
          ) : (
            <><BookOpen size={12} /> YAYINLANDI</>
          )}
        </span>
        <span className="text-xs text-muted font-medium">{duel.turnCount} Tur</span>
      </div>

      <Typography variant="body" className="font-bold text-text mb-1 line-clamp-1">
        {duel.title || "İsimsiz Düello"}
      </Typography>
      <Typography variant="caption" className="text-muted mb-4 line-clamp-2">
        {duel.prompt}
      </Typography>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <img src={duel.authorA.avatarUrl || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full bg-card object-cover" />
            <Typography variant="caption" className="font-medium">{duel.authorA.displayName}</Typography>
          </div>
          {(duel.status === 'voting' || duel.status === 'completed') && duel.scores && duel.scores[duel.authorA.uid] && (
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><Star size={10} className="fill-amber-500" /> {duel.scores[duel.authorA.uid].average}</span>
          )}
        </div>
        <Typography variant="caption" className="text-muted font-bold italic px-2 text-primary">VS</Typography>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 flex-row-reverse">
            <img src={duel.authorB.avatarUrl || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full bg-card object-cover" />
            <Typography variant="caption" className="font-medium text-right">{duel.authorB.displayName}</Typography>
          </div>
          {(duel.status === 'voting' || duel.status === 'completed') && duel.scores && duel.scores[duel.authorB.uid] && (
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><Star size={10} className="fill-amber-500" /> {duel.scores[duel.authorB.uid].average}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="absolute top-0 right-0 left-0 h-96 bg-primary/5 -z-10 blur-3xl pointer-events-none" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 pt-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Feather size={24} />
                </div>
                <Typography variant="h1" className="font-bold tracking-tight">Edebi Arena</Typography>
              </div>
              <Typography variant="body" className="text-muted max-w-xl">
                Zihninizin sınırlarını zorlamaya hazır mısınız? Kelimelerin savaştığı, sadece en güçlü kalemlerin ayakta kaldığı edebi tiyatroya adım atın.
              </Typography>
            </div>
            <Button onPress={() => setIsCreateModalOpen(true)} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
              <Plus size={18} className="mr-2" /> Meydan Oku
            </Button>
          </div>

          {/* Bekleyen Meydan Okumalar */}
          {pendingDuels.length > 0 && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <AlertCircle size={20} />
                <Typography variant="h3" className="font-bold">Gelen Meydan Okumalar</Typography>
              </div>
              <div className="grid gap-4">
                {pendingDuels.map(duel => (
                  <div key={duel.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-primary/5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={duel.authorA.avatarUrl || 'https://via.placeholder.com/60'} className="w-12 h-12 rounded-full object-cover bg-background" />
                      <div>
                        <Typography variant="body" className="font-semibold text-text mb-1">
                          <span className="text-primary">@{duel.authorA.username}</span> sizi bir düelloya davet ediyor!
                        </Typography>
                        <Typography variant="caption" className="text-muted">Konu: "{duel.prompt}"</Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="outline" onPress={() => handleRejectChallenge(duel.id)} className="flex-1 sm:flex-none border-destructive/20 text-destructive hover:bg-destructive/10">
                        Reddet
                      </Button>
                      <Button onPress={() => handleAcceptChallenge(duel.id)} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white shrink-0">
                        Kabul Et
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gönderilen Bekleyen İstekler */}
          {sentDuels.length > 0 && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 text-muted">
                <AlertCircle size={20} />
                <Typography variant="h3" className="font-bold text-text">Gönderdiğin İstekler (Bekliyor)</Typography>
              </div>
              <div className="grid gap-4">
                {sentDuels.map(duel => (
                  <div key={duel.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-border/80 transition-colors opacity-80 hover:opacity-100">
                    <div className="flex items-center gap-4">
                      <img src={duel.authorB.avatarUrl || 'https://via.placeholder.com/60'} className="w-10 h-10 rounded-full object-cover bg-background opacity-50 grayscale" />
                      <div>
                        <Typography variant="body" className="font-semibold text-text mb-1">
                          <span className="text-muted-foreground">@{duel.authorB.username}</span> adlı yazara davet gönderildi.
                        </Typography>
                        <Typography variant="caption" className="text-muted">Cevap bekleniyor...</Typography>
                      </div>
                    </div>
                    <Button variant="ghost" onPress={() => handleCancelChallenge(duel.id)} className="w-full sm:w-auto text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0">
                      İptal Et
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sekmeler */}
          <div className="flex border-b border-border mb-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 pb-4 text-center font-semibold transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'active' ? 'text-primary' : 'text-muted hover:text-white'}`}
            >
              <Radio size={18} className={activeTab === 'active' ? 'animate-pulse' : ''} />
              Canlı Akış
              {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>

            <button
              onClick={() => setActiveTab('voting')}
              className={`flex-1 pb-4 text-center font-semibold transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'voting' ? 'text-primary' : 'text-muted hover:text-white'}`}
            >
              <Star size={18} />
              Halk Oylaması
              {activeTab === 'voting' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 pb-4 text-center font-semibold transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'completed' ? 'text-primary' : 'text-muted hover:text-white'}`}
            >
              <BookOpen size={18} />
              Yayınlananlar
              {activeTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'active' && (
                activeDuels.filter(d => d.status === 'active').length === 0 ? (
                  <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                    <Feather size={48} className="mx-auto text-muted mb-4 opacity-50" />
                    <Typography variant="h3" className="text-muted mb-2">Kalemler sustu, yeni bir meydan okuma bekleniyor.</Typography>
                    <Typography variant="body" className="text-muted opacity-70">
                      Sessizliği yırtacak o ilk kelimeyi siz yazın. Bir arkadaşınızı edebi bir düelloya davet edin.
                    </Typography>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeDuels.filter(d => d.status === 'active').map(renderDuelCard)}
                  </div>
                )
              )}

              {activeTab === 'voting' && (
                activeDuels.filter(d => d.status === 'voting').length === 0 ? (
                  <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                    <Typography variant="h3" className="text-muted mb-2">Oylamada hikaye yok</Typography>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeDuels.filter(d => d.status === 'voting').map(renderDuelCard)}
                  </div>
                )
              )}

              {activeTab === 'completed' && (
                activeDuels.filter(d => d.status === 'completed').length === 0 ? (
                  <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                    <Typography variant="h3" className="text-muted mb-2">Henüz tamamlanan düello yok</Typography>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeDuels.filter(d => d.status === 'completed').map(renderDuelCard)}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Meydan Okuma Modalı */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-text rounded-full hover:bg-background transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Feather size={20} />
              </div>
              <Typography variant="h3" className="font-bold">Meydan Oku</Typography>
            </div>

            <form onSubmit={handleCreateChallenge} className="flex flex-col gap-4">
              <div className="relative z-20">
                <Typography variant="caption" className="text-muted mb-1 block ml-1">Rakip (Kullanıcı Adı veya İsim)</Typography>
                <Input
                  placeholder="Örn: orhanpamuk"
                  value={opponentUsername}
                  onChangeText={(val) => {
                    setOpponentUsername(val);
                    if (selectedUser && val !== selectedUser.username) {
                      setSelectedUser(null);
                    }
                  }}
                />

                {isSearching && (
                  <div className="absolute right-3 top-[32px] w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                )}

                {searchResults.length > 0 && !selectedUser && (
                  <div className="absolute left-0 right-0 top-[105%] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100] max-h-52 overflow-y-auto">
                    {searchResults.map(user => (
                      <button
                        key={user.uid}
                        type="button"
                        className="w-full flex items-center gap-3 p-3 hover:bg-background/50 transition-colors text-left border-b border-border/50 last:border-0"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpponentUsername(user.username);
                          setSearchResults([]);
                        }}
                      >
                        <img src={user.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover bg-background shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <Typography variant="body" className="font-medium truncate">{user.displayName}</Typography>
                          <Typography variant="caption" className="text-muted truncate">@{user.username}</Typography>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <Typography variant="caption" className="text-muted mb-1 block ml-1">Hikaye Adı</Typography>
                <Input
                  placeholder="Örn: Mars'ta Son Dans"
                  value={duelTitle}
                  onChangeText={setDuelTitle}
                  required
                />
              </div>

              <div className="relative z-10">
                <Typography variant="caption" className="text-muted mb-1 block ml-1">Düello Konusu (Prompt)</Typography>
                <textarea
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                  placeholder="Düellonun temel konusu ne olacak? (Örn: Mars'ta geçen yalnız bir dedektifin son 24 saati...)"
                  value={duelPrompt}
                  onChange={(e) => setDuelPrompt(e.target.value)}
                  required
                />
              </div>

              <div className="relative z-10">
                <Typography variant="caption" className="text-muted mb-1 block ml-1">Tur Süresi</Typography>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '5 dk', value: 5 },
                    { label: '15 dk', value: 15 },
                    { label: '30 dk', value: 30 },
                    { label: '1 saat', value: 60 },
                    { label: '24 saat', value: 1440 },
                    { label: '48 saat', value: 2880 },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTurnTimeLimit(option.value)}
                      className={`py-2 rounded-xl border text-sm font-medium transition-colors ${turnTimeLimit === option.value
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-card border-border text-muted hover:border-primary/50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-2">
                <Typography variant="caption" className="text-primary font-medium flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  Meydan okumanız rakibinize bildirilecek. O kabul edene kadar düello başlamaz.
                </Typography>
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                disabled={isCreating || !opponentUsername.trim() || !duelPrompt.trim() || !duelTitle.trim()}
              >
                {isCreating ? 'Kalemler Bileniyor...' : 'Daveti Gönder'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
