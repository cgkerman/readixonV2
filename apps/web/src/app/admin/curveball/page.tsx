"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { toast } from 'sonner';
import { 
  getCurveballRooms, 
  createCurveballRoom, 
  startCurveballVotingPhase, 
  completeCurveballRoom, 
  CurveballRoom,
  CurveballType,
  useAuthStore
} from '@readixon/core';
import { Zap, Plus, Star, Trophy, Users } from 'lucide-react';

export default function AdminCurveballPage() {
  const { firebaseUser } = useAuthStore();
  const [rooms, setRooms] = useState<CurveballRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [minParticipants, setMinParticipants] = useState('2');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [entryFee, setEntryFee] = useState('5');
  const [winnerPrize, setWinnerPrize] = useState('100');
  const [wordLimit, setWordLimit] = useState('1000');
  const [durationMinutes, setDurationMinutes] = useState('60');
  
  // Curveball Config
  const [curveballType, setCurveballType] = useState<CurveballType>('taboo_word');
  const [curveballPayload, setCurveballPayload] = useState(''); // comma/space separated
  const [triggerPercentage, setTriggerPercentage] = useState('20');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const data = await getCurveballRooms();
      setRooms(data);
    } catch (error) {
      toast.error('Odalar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    setIsSubmitting(true);
    try {
      // Parse payload
      let parsedPayload: string[] = [];
      if (curveballType === 'forced_injection') {
        parsedPayload = [curveballPayload.trim()];
      } else {
        // Taboo word or punctuation boycott (split by comma or space)
        parsedPayload = curveballPayload.split(/[, \n]+/).filter(w => w.trim().length > 0);
      }

      await createCurveballRoom({
        title,
        theme,
        status: 'waiting',
        minParticipants: parseInt(minParticipants),
        maxParticipants: parseInt(maxParticipants),
        entryFee: parseInt(entryFee),
        winnerPrize: parseInt(winnerPrize),
        wordLimit: parseInt(wordLimit),
        durationMinutes: parseInt(durationMinutes),
        curveball: {
          type: curveballType,
          payload: parsedPayload,
          triggerPercentage: parseInt(triggerPercentage)
        },
        createdBy: firebaseUser.uid
      });
      toast.success('Sürpriz Kırılma odası başarıyla oluşturuldu!');
      
      // Reset Form
      setTitle('');
      setTheme('');
      setCurveballPayload('');
      
      loadRooms();
    } catch (error: any) {
      toast.error(error.message || 'Oda oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartVoting = async (roomId: string) => {
    if (confirm('Bu odanın yazım aşamasını bitirip oylamaya geçmek istediğinize emin misiniz?')) {
      try {
        await startCurveballVotingPhase(roomId);
        toast.success('Oylama başlatıldı!');
        loadRooms();
      } catch (error) {
        toast.error('İşlem başarısız.');
      }
    }
  };

  const handleCompleteRoom = async (roomId: string) => {
    if (confirm('Bu odanın oylamasını bitirip kazananı ilan etmek istediğinize emin misiniz? Ödüller dağıtılacaktır.')) {
      try {
        await completeCurveballRoom(roomId);
        toast.success('Oda tamamlandı ve ödüller dağıtıldı!');
        loadRooms();
      } catch (error) {
        toast.error('İşlem başarısız.');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Zap size={32} className="text-red-500" />
        <Typography variant="h1" className="font-bold">Sürpriz Kırılma (Curveball) Yönetimi</Typography>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CREATE FORM */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-red-500/30 rounded-3xl p-6 sticky top-8 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Typography variant="h3" className="font-bold mb-6 flex items-center gap-2 text-red-500">
              <Plus size={20} /> Yeni Curveball Odası Kur
            </Typography>
            
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <Typography variant="caption" className="text-muted block mb-1">Oda Adı</Typography>
                <Input value={title} onChangeText={setTitle} placeholder="Örn: Ölümcül Sessizlik" required />
              </div>
              
              <div>
                <Typography variant="caption" className="text-muted block mb-1">Tema / Konu</Typography>
                <textarea 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-24"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Yazarların işleyeceği konu"
                  required
                />
              </div>

              {/* CURVEBALL CONFIG */}
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
                <Typography variant="h4" className="font-bold text-red-400">⚡ Kısıtlama Ayarları</Typography>
                
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Kısıtlama Tipi</Typography>
                  <select 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    value={curveballType}
                    onChange={(e) => setCurveballType(e.target.value as CurveballType)}
                  >
                    <option value="taboo_word">Tabu Kelime (Yasaklı Kelimeler)</option>
                    <option value="forced_injection">Zorunlu Enjeksiyon (Cümle Geçirme)</option>
                    <option value="punctuation_boycott">Noktalama Boykotu (Yasaklı İşaretler)</option>
                  </select>
                </div>

                <div>
                  <Typography variant="caption" className="text-muted block mb-1">
                    {curveballType === 'taboo_word' && "Yasaklı Kelimeler (Virgül/Boşluk ile ayırın)"}
                    {curveballType === 'forced_injection' && "Kullanılması Zorunlu Cümle"}
                    {curveballType === 'punctuation_boycott' && "Yasaklı Noktalama (Boşluk ile ayırın: ! ? . ,)"}
                  </Typography>
                  <Input 
                    value={curveballPayload} 
                    onChangeText={setCurveballPayload} 
                    placeholder={curveballType === 'forced_injection' ? "Örn: Kapı aniden açıldı ve..." : "Örn: zaman, mekan, aşk"} 
                    required 
                  />
                </div>

                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Tetiklenme Yüzdesi (Son %X)</Typography>
                  <Input type="number" value={triggerPercentage} onChangeText={setTriggerPercentage} placeholder="Örn: 20 (Son %20'de başlar)" required />
                </div>
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
                  <Typography variant="caption" className="text-muted block mb-1">Giriş Ücreti (RX)</Typography>
                  <Input type="number" value={entryFee} onChangeText={setEntryFee} required />
                </div>
                <div>
                  <Typography variant="caption" className="text-muted block mb-1">Büyük Ödül (RX)</Typography>
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

              <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/20">
                {isSubmitting ? 'Kuruluyor...' : 'Odası Aç'}
              </Button>
            </form>
          </div>
        </div>

        {/* LOBBY LIST */}
        <div className="lg:col-span-2 space-y-4">
          <Typography variant="h3" className="font-bold mb-4">Aktif ve Geçmiş Sürpriz Kırılma Odaları</Typography>
          
          {isLoading ? (
            <div className="text-center p-10"><div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto" /></div>
          ) : rooms.length === 0 ? (
            <div className="bg-card/50 border border-dashed border-border p-10 text-center rounded-3xl">
              <Typography variant="body" className="text-muted">Henüz hiç Curveball odası kurulmamış.</Typography>
            </div>
          ) : (
            rooms.map(room => (
              <div key={room.id} className="bg-card border border-border hover:border-red-500/30 transition-colors p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      room.status === 'waiting' ? 'bg-primary/20 text-primary' :
                      room.status === 'active' ? 'bg-amber-500/20 text-amber-500' :
                      room.status === 'voting' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {room.status}
                    </span>
                    <Typography variant="h4" className="font-bold">{room.title}</Typography>
                    <Zap size={16} className="text-red-500" />
                  </div>
                  <Typography variant="caption" className="text-muted line-clamp-1 mb-2">{room.theme}</Typography>
                  <Typography variant="caption" className="text-red-400 font-bold block mb-3">
                    Kısıtlama: {room.curveball.type} (Son %{room.curveball.triggerPercentage})
                  </Typography>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
                    <span className="flex items-center gap-1"><Users size={14}/> {room.participantIds.length} / {room.maxParticipants}</span>
                    <span className="flex items-center gap-1 text-primary border border-primary/20 px-2 py-0.5 rounded-full"><Trophy size={12}/> Ödül: {room.winnerPrize}</span>
                    <span className="flex items-center gap-1 border border-border px-2 py-0.5 rounded-full">Giriş: {room.entryFee}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {room.status === 'active' && (
                    <Button onPress={() => handleStartVoting(room.id)} className="bg-purple-500 hover:bg-purple-600 text-white border-0 text-sm py-2">
                      <Star size={16} className="mr-2" /> Oylamaya Geçir
                    </Button>
                  )}
                  {room.status === 'voting' && (
                    <Button onPress={() => handleCompleteRoom(room.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-sm py-2">
                      <Trophy size={16} className="mr-2" /> Oylamayı Bitir & Ödül Dağıt
                    </Button>
                  )}
                  {room.status === 'completed' && (
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
