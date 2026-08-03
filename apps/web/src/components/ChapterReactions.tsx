"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@readixon/core/src/store/useAuthStore';
import { getUserChapterReactions, toggleChapterReaction } from '@readixon/core/src/services/storyService';
import Image from 'next/image';
import { Typography } from '@readixon/ui';

interface ChapterReactionsProps {
  storyId: string;
  chapterId: string;
  initialCounts?: Record<string, number>;
}

const AVAILABLE_REACTIONS = [
  // Pozitif / Eğlenceli
  'legendary', 'admired', 'like', 'excited', 'laughing',
  // Duygusal / Sevimli
  'touched', 'hug', 'blushed',
  // Şaşırtıcı / Düşündürücü
  'thoughtful', 'twisted', 'shocked', 'confused',
  // Nötr / Sıkıcı
  'average', 'cliche', 'bored',
  // Negatif / Üzücü
  'sad', 'failed', 'annoyed', 'dislike', 'angry'
];

const REACTION_LABELS: Record<string, string> = {
  admired: 'Hayran',
  angry: 'Kızgın',
  annoyed: 'Bıkkın',
  average: 'Sıradan',
  blushed: 'Utanmış',
  bored: 'Sıkıcı',
  cliche: 'Klişe',
  confused: 'Şaşkın',
  dislike: 'Peh',
  excited: 'Heyecanlı',
  failed: 'Hüsran',
  hug: 'Sarıl',
  laughing: 'Koptum',
  legendary: 'Efsane',
  like: 'Güzel',
  sad: 'Üzgün',
  shocked: 'Şokta',
  thoughtful: 'Düşündürücü',
  touched: 'Duygulandım',
  twisted: 'Ters Köşe'
};

export const ChapterReactions = ({ storyId, chapterId, initialCounts = {} }: ChapterReactionsProps) => {
  const { firebaseUser: user } = useAuthStore();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCounts(prev => ({ ...initialCounts, ...prev }));
  }, [initialCounts]);

  useEffect(() => {
    const fetchUserReactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const reactions = await getUserChapterReactions(storyId, chapterId, user.uid);
        setUserReactions(reactions);
      } catch (e) {
        console.error("Error fetching user reactions:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReactions();
  }, [storyId, chapterId, user]);

  const handleReactionClick = async (reaction: string) => {
    if (!user) {
      toast.error('Tepki vermek için giriş yapmalısınız.');
      return;
    }

    const isSelected = userReactions.includes(reaction);
    
    if (!isSelected && userReactions.length >= 5) {
      toast.error('En fazla 5 tepki seçebilirsiniz.');
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);
    const newSelected = isSelected 
      ? userReactions.filter(r => r !== reaction) 
      : [...userReactions, reaction];
      
    setUserReactions(newSelected);
    
    setCounts(prev => ({
      ...prev,
      [reaction]: Math.max(0, (prev[reaction] || 0) + (isSelected ? -1 : 1))
    }));

    try {
      const result = await toggleChapterReaction(storyId, chapterId, user.uid, reaction);
      if (!result.success) {
        setUserReactions(userReactions);
        setCounts(counts);
        toast.error('Tepkiniz kaydedilemedi, tekrar deneyin.');
      } else if (result.newCounts) {
        setCounts(prev => ({ ...prev, ...result.newCounts }));
      }
    } catch (e) {
      setUserReactions(userReactions);
      setCounts(counts);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-10 px-4">
      <div className="flex flex-col items-center gap-2 mb-6" style={{ color: 'inherit' }}>
        <Typography variant="h4" className="font-bold" style={{ color: 'inherit' }}>Bölüme Tepki Ver</Typography>
        <Typography variant="caption" className="" style={{ color: 'inherit', opacity: 0.7 }}>En fazla 5 duygu seçebilirsiniz.</Typography>
      </div>

      <div className="w-full max-w-4xl flex flex-wrap items-end justify-center gap-4 px-2 mx-auto">
        {AVAILABLE_REACTIONS.map((reaction) => {
          const isSelected = userReactions.includes(reaction);
          const count = counts[reaction] || 0;
          const hasCount = count > 0;

          return (
            <motion.button
              key={reaction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: isSelected ? [0, -4, 0] : 0 
              }}
              transition={{
                y: isSelected ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 15 },
                opacity: { duration: 0.2 }
              }}
              whileHover={{ 
                scale: 1.25, 
                y: -10, 
                rotate: (Math.random() > 0.5 ? 1 : -1) * 3, // Hafif eğilme
                transition: { type: "spring", stiffness: 400, damping: 10 } 
              }}
              whileTap={{ 
                scale: 0.7, 
                rotate: -8,
                transition: { type: "spring", stiffness: 400, damping: 10 } 
              }}
              onClick={() => handleReactionClick(reaction)}
              className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-colors duration-300 ${
                isSelected 
                  ? 'bg-primary/15 shadow-[0_0_20px_rgba(var(--primary),0.5)]' 
                  : 'hover:bg-muted/10 grayscale-[60%] hover:grayscale-0 opacity-60 hover:opacity-100'
              } ${isSelected ? 'grayscale-0 opacity-100' : ''}`}
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16 z-10">
                <Image
                  src={`/images/reactions/mascot-${reaction}.png`}
                  alt={REACTION_LABELS[reaction]}
                  fill
                  quality={100}
                  className="object-contain drop-shadow-md"
                  sizes="128px"
                />
              </div>
              
              <span className={`text-[11px] font-bold mt-1.5 z-10 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/60'}`}>
                {REACTION_LABELS[reaction]}
              </span>

              <AnimatePresence>
                {hasCount && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full drop-shadow-md z-10 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-foreground'}`}
                  >
                    {count}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tıklama Anı (Burst) Efekti - DEVASA VE ETKİLEYİCİ */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  {/* Dev Şok Dalgası (Ring) */}
                  <motion.div
                    initial={{ scale: 0.2, opacity: 1, borderWidth: "12px" }}
                    animate={{ scale: 8, opacity: 0, borderWidth: "0px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute w-24 h-24 rounded-full border-primary"
                  />
                  
                  {/* İkinci iç şok dalgası */}
                  <motion.div
                    initial={{ scale: 0.2, opacity: 1, borderWidth: "6px" }}
                    animate={{ scale: 5, opacity: 0, borderWidth: "0px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="absolute w-20 h-20 rounded-full border-primary/60"
                  />

                  {/* Dev Patlayan Partiküller (Particles) */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180; // 12 particles
                    const distance = i % 2 === 0 ? 200 : 140; // Çok daha uzak
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    
                    return (
                      <motion.div
                        key={i}
                        className={`absolute rounded-full shadow-[0_0_15px_rgba(var(--primary),1)] ${i % 2 === 0 ? 'w-4 h-4 bg-primary' : 'w-3 h-3 bg-primary/80'}`}
                        initial={{ x: 0, y: 0, scale: 0 }}
                        animate={{ x, y, scale: [0, 2, 0] }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i % 2 === 0 ? 0 : 0.05 }}
                      />
                    );
                  })}
                  
                  {/* Yükselen Hayalet Maskot (Ghost Mascot) */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.9, y: 0, rotate: 0 }}
                    animate={{ scale: 6, opacity: 0, y: -160, rotate: 15 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute z-50 w-20 h-20"
                  >
                    <Image
                      src={`/images/reactions/mascot-${reaction}.png`}
                      alt=""
                      fill
                      className="object-contain drop-shadow-[0_0_20px_rgba(var(--primary),1)]"
                      sizes="128px"
                    />
                  </motion.div>
                </div>
              )}
            </motion.button>

          );
        })}
      </div>
    </div>
  );
};
