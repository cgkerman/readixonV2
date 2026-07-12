"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { toast } from 'sonner';
import { 
  getLobbyRooms, 
  createLobbyRoom, 
  startVotingPhase, 
  completeLobbyRoom, 
  LobbyRoom,
  useAuthStore
} from '@readixon/core';
import { Users, Plus, Star, Trophy, Clock, AlertCircle } from 'lucide-react';

export default function AdminLobbyPage() {
  const { firebaseUser } = useAuthStore();
  const [lobbies, setLobbies] = useState<LobbyRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [minParticipants, setMinParticipants] = useState('2');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [entryFee, setEntryFee] = useState('5');
  const [winnerPrize, setWinnerPrize] = useState('100');
  const [wordLimit, setWordLimit] = useState('1000');
  const [durationMinutes, setDurationMinutes] = useState('120');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLobbies();
  }, []);

  const loadLobbies = async () => {
    setIsLoading(true);
    try {
      const data = await getLobbyRooms();
      setLobbies(data);
    } catch (error) {
      toast.error('Odalar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    setIsSubmitting(true);
    try {
      await createLobbyRoom({
        title,
        theme,
        status: 'waiting',
        minParticipants: parseInt(minParticipants),
        maxParticipants: parseInt(maxParticipants),
        entryFee: parseInt(entryFee),
        winnerPrize: parseInt(winnerPrize),
        wordLimit: parseInt(wordLimit),
        durationMinutes: parseInt(durationMinutes),
        createdBy: firebaseUser.uid
      });
      toast.success('Lobi odası başarıyla oluşturuldu!');
      
      // Reset Form
      setTitle('');
      setTheme('');
      
      loadLobbies();
    } catch (error: any) {
      toast.error(error.message || 'Oda oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartVoting = async (roomId: string) => {
    if (confirm('Bu odanın yazım aşamasını bitirip oylamaya geçmek istediğinize emin misiniz?')) {
      try {
        await startVotingPhase(roomId);
        toast.success('Oylama başlatıldı!');
        loadLobbies();
      } catch (error) {
        toast.error('İşlem başarısız.');
      }
    }
  };

  const handleCompleteLobby = async (roomId: string) => {
    if (confirm('Bu odanın oylamasını bitirip kazananı ilan etmek istediğinize emin misiniz? Ödüller dağıtılacaktır.')) {
      try {
        await completeLobbyRoom(roomId);
        toast.success('Lobi tamamlandı ve ödüller dağıtıldı!');
        loadLobbies();
      } catch (error) {
        toast.error('İşlem başarısız.');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Users size={32} className="text-primary" />
        <Typography variant="h1" className="font-bold">Yazar Lobisi (Edebi Arena) Yönetimi</Typography>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CREATE FORM */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-8">
            <Typography variant="h3" className="font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-primary" /> Yeni Oda Kur
            </Typography>
            
            <form onSubmit={handleCreateLobby} className="space-y-4">
              <div>
                <Typography variant="caption" className="text-muted block mb-1">Oda Adı</Typography>
                <Input value={title} onChangeText={setTitle} placeholder="Örn: Gece Yarısı Sırları" required />
              </div>
              
              <div>
                <Typography variant="caption" className="text-muted block mb-1">Tema / Konu</Typography>
                <textarea 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Yazarların işleyeceği konu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Min Kişi</Typography>
                  <Input type="number" value={minParticipants} onChangeText={setMinParticipants} required />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Max Kişi</Typography>
                  <Input type="number" value={maxParticipants} onChangeText={setMaxParticipants} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Katılım Ücreti</Typography>
                  <Input type="number" value={entryFee} onChangeText={setEntryFee} required />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Büyük Ödül</Typography>
                  <Input type="number" value={winnerPrize} onChangeText={setWinnerPrize} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Kelime Sınırı</Typography>
                  <Input type="number" value={wordLimit} onChangeText={setWordLimit} required />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Süre (Dk)</Typography>
                  <Input type="number" value={durationMinutes} onChangeText={setDurationMinutes} required />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-primary text-white border-0">
                {isSubmitting ? 'Kuruluyor...' : 'Odayı Aç'}
              </Button>
            </form>
          </div>
        </div>

        {/* LOBBY LIST */}
        <div className="lg:col-span-2 space-y-4">
          <Typography variant="h3" className="font-bold mb-4">Aktif ve Geçmiş Odalar</Typography>
          
          {isLoading ? (
            <div className="text-center p-10"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" /></div>
          ) : lobbies.length === 0 ? (
            <div className="bg-card/50 border border-dashed border-border p-10 text-center rounded-3xl">
              <Typography variant="body" className="text-muted">Henüz hiç oda kurulmamış.</Typography>
            </div>
          ) : (
            lobbies.map(lobby => (
              <div key={lobby.id} className="bg-card border border-border p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      lobby.status === 'waiting' ? 'bg-primary/20 text-primary' :
                      lobby.status === 'active' ? 'bg-amber-500/20 text-amber-500' :
                      lobby.status === 'voting' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {lobby.status}
                    </span>
                    <Typography variant="h4" className="font-bold">{lobby.title}</Typography>
                  </div>
                  <Typography variant="caption" className="text-muted line-clamp-1 mb-3">{lobby.theme}</Typography>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
                    <span className="flex items-center gap-1"><Users size={14}/> {lobby.participantIds.length} / {lobby.maxParticipants}</span>
                    <span className="flex items-center gap-1 text-primary border border-primary/20 px-2 py-0.5 rounded-full"><Trophy size={12}/> Ödül: {lobby.winnerPrize}</span>
                    <span className="flex items-center gap-1 border border-border px-2 py-0.5 rounded-full">Giriş: {lobby.entryFee}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {lobby.status === 'active' && (
                    <Button onPress={() => handleStartVoting(lobby.id)} className="bg-purple-500 hover:bg-purple-600 text-white border-0 text-sm py-2">
                      <Star size={16} className="mr-2" /> Oylamaya Geçir
                    </Button>
                  )}
                  {lobby.status === 'voting' && (
                    <Button onPress={() => handleCompleteLobby(lobby.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-sm py-2">
                      <Trophy size={16} className="mr-2" /> Oylamayı Bitir & Ödül Dağıt
                    </Button>
                  )}
                  {lobby.status === 'completed' && (
                    <Typography variant="caption" className="text-emerald-500 font-bold px-4 py-2 border border-emerald-500/20 rounded-xl bg-emerald-500/10 text-center">
                      Tamamlandı
                    </Typography>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
