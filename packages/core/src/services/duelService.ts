import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  addDoc,
  increment,
  deleteDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import { Duel, DuelTurn, DuelStatus, DuelAuthor } from '../types';
import { createNotification } from './notificationService';

export const createDuelChallenge = async (
  title: string,
  prompt: string,
  authorA: DuelAuthor,
  authorB: DuelAuthor,
  turnTimeLimitMinutes?: number
): Promise<string> => {
  const duelsRef = collection(db, 'duels');
  const newDuelRef = doc(duelsRef);
  
  const duel: Omit<Duel, 'id'> = {
    title,
    prompt,
    authorA,
    authorB,
    status: 'pending',
    currentTurnUid: '', // Henüz kabul edilmedi
    turnCount: 0,
    turnTimeLimitMinutes: turnTimeLimitMinutes || 15,
    embargoedWords: [],
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(newDuelRef, duel);
  
  // Bildirim gönder (B'ye)
  await createNotification({
    userId: authorB.uid,
    actorId: authorA.uid,
    actorName: authorA.displayName,
    actorAvatar: authorA.avatarUrl,
    actorUsername: authorA.username,
    type: 'duel_challenge',
    entityId: newDuelRef.id
  });

  return newDuelRef.id;
};

export const acceptDuelChallenge = async (duelId: string, currentTurnUid: string) => {
  const duelRef = doc(db, 'duels', duelId);
  await updateDoc(duelRef, {
    status: 'active',
    currentTurnUid,
    updatedAt: serverTimestamp()
  });
  
  // Düelloyu getirelim (A'ya bildirim atmak için)
  const snap = await getDoc(duelRef);
  if (snap.exists()) {
    const duelData = snap.data() as Duel;
    await createNotification({
      userId: duelData.authorA.uid,
      actorId: duelData.authorB.uid,
      actorName: duelData.authorB.displayName,
      actorAvatar: duelData.authorB.avatarUrl,
      actorUsername: duelData.authorB.username,
      type: 'duel_accepted',
      entityId: duelId
    });
  }
};

export const submitDuelTurn = async (
  duelId: string,
  authorUid: string,
  content: string,
  nextTurnUid: string,
  embargoWordsSet: string[]
) => {
  const turnsRef = collection(db, 'duels', duelId, 'turns');
  
  const turn: Omit<DuelTurn, 'id'> = {
    duelId,
    authorUid,
    content,
    wordCount: content.trim().split(/\s+/).length,
    embargoWordsSet,
    createdAt: serverTimestamp() as Timestamp,
  };

  await addDoc(turnsRef, turn);

  // Düelloyu güncelle
  const duelRef = doc(db, 'duels', duelId);
  await updateDoc(duelRef, {
    currentTurnUid: nextTurnUid,
    embargoedWords: embargoWordsSet,
    turnCount: increment(1),
    updatedAt: serverTimestamp()
  });
};

export const finishDuel = async (duelId: string, authorAUid: string, authorBUid: string) => {
  const duelRef = doc(db, 'duels', duelId);
  
  // 24 saat sonrası
  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + 24);
  
  await updateDoc(duelRef, {
    status: 'voting',
    votingEndsAt: endsAt,
    voters: [],
    scores: {
      [authorAUid]: { totalScore: 0, voteCount: 0, average: 0 },
      [authorBUid]: { totalScore: 0, voteCount: 0, average: 0 }
    },
    updatedAt: serverTimestamp()
  });
};

export const submitDuelVote = async (
  duelId: string, 
  voterUid: string, 
  authorAUid: string, 
  scoreA: number, 
  authorBUid: string, 
  scoreB: number
) => {
  const duelRef = doc(db, 'duels', duelId);
  const userARef = doc(db, 'users', authorAUid);
  const userBRef = doc(db, 'users', authorBUid);

  await runTransaction(db, async (transaction) => {
    const duelDoc = await transaction.get(duelRef);
    if (!duelDoc.exists()) throw new Error("Düello bulunamadı.");
    
    // READS
    const userADoc = await transaction.get(userARef);
    const userBDoc = await transaction.get(userBRef);
    
    // LOGIC & WRITES
    const duelData = duelDoc.data();
    
    // Check if already voted
    const voters = duelData.voters || [];
    if (voters.includes(voterUid)) {
      throw new Error("Bu düello için zaten oy kullanmışsınız.");
    }
    
    // Update duel scores
    const scores = duelData.scores || {
      [authorAUid]: { totalScore: 0, voteCount: 0, average: 0 },
      [authorBUid]: { totalScore: 0, voteCount: 0, average: 0 }
    };
    
    scores[authorAUid].totalScore += scoreA;
    scores[authorAUid].voteCount += 1;
    scores[authorAUid].average = Number((scores[authorAUid].totalScore / scores[authorAUid].voteCount).toFixed(1));

    scores[authorBUid].totalScore += scoreB;
    scores[authorBUid].voteCount += 1;
    scores[authorBUid].average = Number((scores[authorBUid].totalScore / scores[authorBUid].voteCount).toFixed(1));
    
    voters.push(voterUid);
    
    transaction.update(duelRef, {
      scores,
      voters
    });
    
    // Update users arenaScore
    if (userADoc.exists()) {
      const stats = userADoc.data().stats || {};
      const currentScore = stats.arenaScore || 0;
      // Basitçe kazanılan toplam puanı profil skoruna ekliyoruz (MVP)
      transaction.update(userARef, { 'stats.arenaScore': currentScore + scoreA });
    }
    
    if (userBDoc.exists()) {
      const stats = userBDoc.data().stats || {};
      const currentScore = stats.arenaScore || 0;
      transaction.update(userBRef, { 'stats.arenaScore': currentScore + scoreB });
    }
  });
};

export const getDuelById = async (duelId: string): Promise<Duel | null> => {
  const duelRef = doc(db, 'duels', duelId);
  const snap = await getDoc(duelRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Duel;
};

export const subscribeToDuel = (duelId: string, callback: (duel: Duel | null) => void) => {
  const duelRef = doc(db, 'duels', duelId);
  return onSnapshot(duelRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Duel);
    } else {
      callback(null);
    }
  });
};

export const subscribeToDuelTurns = (duelId: string, callback: (turns: DuelTurn[]) => void) => {
  const turnsRef = collection(db, 'duels', duelId, 'turns');
  const q = query(turnsRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snap) => {
    const turns = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DuelTurn[];
    callback(turns);
  });
};

export const getPublicDuels = async (): Promise<Duel[]> => {
  const duelsRef = collection(db, 'duels');
  const q = query(duelsRef, where('status', 'in', ['active', 'voting', 'completed']), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Duel));
};

export const getUserPendingChallenges = async (uid: string): Promise<Duel[]> => {
  const duelsRef = collection(db, 'duels');
  const q = query(duelsRef, where('authorB.uid', '==', uid), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Duel));
};

export const getUserSentChallenges = async (uid: string): Promise<Duel[]> => {
  const duelsRef = collection(db, 'duels');
  const q = query(duelsRef, where('authorA.uid', '==', uid), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Duel));
};

export const cancelDuelChallenge = async (duelId: string) => {
  const duelRef = doc(db, 'duels', duelId);
  await updateDoc(duelRef, { status: 'cancelled', updatedAt: serverTimestamp() });
};

export const rejectDuelChallenge = async (duelId: string) => {
  const duelRef = doc(db, 'duels', duelId);
  const snap = await getDoc(duelRef);
  if (snap.exists()) {
    const duelData = snap.data() as Duel;
    // Bildirim gönder (A'ya, B reddetti)
    await createNotification({
      userId: duelData.authorA.uid,
      actorId: duelData.authorB.uid,
      actorName: duelData.authorB.displayName,
      actorAvatar: duelData.authorB.avatarUrl,
      actorUsername: duelData.authorB.username,
      type: 'duel_rejected'
    });
    // Sonra statüyü güncelle
    await updateDoc(duelRef, { status: 'rejected', updatedAt: serverTimestamp() });
  }
};
