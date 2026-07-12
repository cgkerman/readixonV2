import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  runTransaction,
  Timestamp,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import type { CurveballRoom, CurveballParticipant, CurveballSubmission, CurveballVote } from '../types';
import { createNotification } from './notificationService';

const CURVEBALL_COLLECTION = 'lobbies';

/**
 * Curveball odalarını listeler.
 */
export async function getCurveballRooms(): Promise<CurveballRoom[]> {
  const roomsRef = collection(db, CURVEBALL_COLLECTION);
  const q = query(roomsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  
  return snap.docs
    .map(doc => ({ ...doc.data(), id: doc.id }))
    .filter(data => (data as any).curveball !== undefined) as CurveballRoom[];
}

/**
 * Belirli bir Curveball Odasını getirir.
 */
export async function getCurveballRoomById(roomId: string): Promise<CurveballRoom | null> {
  const roomRef = doc(db, CURVEBALL_COLLECTION, roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as CurveballRoom;
}

/**
 * Yeni bir Curveball Odası oluşturur. (Admin yetkisi gerektirir)
 */
export async function createCurveballRoom(data: Omit<CurveballRoom, 'id' | 'createdAt' | 'participantIds'>): Promise<string> {
  const roomsRef = collection(db, CURVEBALL_COLLECTION);
  const newRoomRef = doc(roomsRef);
  
  const room: CurveballRoom = {
    ...data,
    id: newRoomRef.id,
    participantIds: [],
    createdAt: Timestamp.now(),
  };

  await setDoc(newRoomRef, room as any);
  return newRoomRef.id;
}

/**
 * Kullanıcının odaya katılmasını sağlar. (Katılım ücretini keser)
 */
export async function joinCurveballRoom(roomId: string, uid: string): Promise<void> {
  const roomRef = doc(db, CURVEBALL_COLLECTION, roomId);
  const participantRef = doc(db, `${CURVEBALL_COLLECTION}/${roomId}/participants`, uid);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) {
      throw new Error('Oda bulunamadı');
    }

    const roomData = roomDoc.data() as CurveballRoom;

    if (roomData.status !== 'waiting') {
      throw new Error('Oda şu an katılıma açık değil');
    }

    if (roomData.participantIds.includes(uid)) {
      throw new Error('Bu odaya zaten katıldınız');
    }

    if (roomData.participantIds.length >= roomData.maxParticipants) {
      throw new Error('Oda dolu');
    }

    const updatedParticipantIds = [...roomData.participantIds, uid];

    const userRef = doc(db, 'users', uid);
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('Kullanıcı bulunamadı');
    
    if (!userDoc.data()?.isAuthor) {
      throw new Error('Sadece yazarlar Curveball odalarına katılabilir.');
    }
    
    const currentPoints = userDoc.data()?.readixPoints || 0;
    const newPoints = currentPoints - roomData.entryFee;
    
    if (newPoints < 0) {
      throw new Error('Yetersiz RX!');
    }

    const participantData: CurveballParticipant = {
      roomId,
      uid,
      joinedAt: Timestamp.now(),
      hasSubmitted: false
    };
    
    transaction.set(participantRef, participantData as any);
    transaction.update(roomRef, { participantIds: updatedParticipantIds });
    transaction.update(userRef, { readixPoints: newPoints });

    if (updatedParticipantIds.length === roomData.maxParticipants) {
       transaction.update(roomRef, { 
         status: 'active',
         startedAt: serverTimestamp() 
       });
    }
  });
}

/**
 * Kullanıcı yazısını gönderir. (Başarılı gönderimde katılım ücreti iade edilir)
 */
export async function submitCurveballEntry(roomId: string, uid: string, content: string, wordCount: number): Promise<void> {
  const roomRef = doc(db, CURVEBALL_COLLECTION, roomId);
  const participantRef = doc(db, `${CURVEBALL_COLLECTION}/${roomId}/participants`, uid);
  const submissionsRef = collection(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions`);

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error('Oda bulunamadı');
    
    const roomData = roomDoc.data() as CurveballRoom;
    if (roomData.status !== 'active') throw new Error('Oda aktif değil');
    
    const participantDoc = await transaction.get(participantRef);
    if (!participantDoc.exists()) throw new Error('Bu odanın katılımcısı değilsiniz');
    
    if (participantDoc.data().hasSubmitted) {
      throw new Error('Zaten bir yazı gönderdiniz');
    }

    if (wordCount > roomData.wordLimit) {
      throw new Error(`Kelime sınırı aşıldı! Maksimum: ${roomData.wordLimit}`);
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await transaction.get(userRef);

    const newSubmissionRef = doc(submissionsRef);
    const submission: CurveballSubmission = {
      id: newSubmissionRef.id,
      roomId,
      authorUid: uid,
      content,
      wordCount,
      createdAt: Timestamp.now()
    };

    transaction.set(newSubmissionRef, submission as any);
    transaction.update(participantRef, { hasSubmitted: true });

    if (userDoc.exists()) {
      const currentPoints = userDoc.data()?.readixPoints || 0;
      transaction.update(userRef, { readixPoints: currentPoints + roomData.entryFee });
    }
  });
}

/**
 * Odaya ait tüm gönderimleri getirir.
 */
export async function getCurveballSubmissions(roomId: string): Promise<CurveballSubmission[]> {
  const submissionsRef = collection(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions`);
  const q = query(submissionsRef, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  
  return snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as CurveballSubmission[];
}

/**
 * Odayı oylama aşamasına geçirir (Admin veya Cron tarafından)
 */
export async function startCurveballVotingPhase(roomId: string): Promise<void> {
  const roomRef = doc(db, CURVEBALL_COLLECTION, roomId);
  await updateDoc(roomRef, {
    status: 'voting',
    votingEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
  });
}

/**
 * Oylama yapar.
 */
export async function voteCurveballEntry(roomId: string, submissionId: string, voterUid: string, scores: { topicScore: number, languageScore: number, creativityScore: number }): Promise<void> {
  const roomRef = doc(db, CURVEBALL_COLLECTION, roomId);
  const voteRef = doc(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions/${submissionId}/votes`, voterUid);

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error('Oda bulunamadı');
    if (roomDoc.data().status !== 'voting') throw new Error('Oda oylama aşamasında değil');

    const submissionRef = doc(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions`, submissionId);
    const submissionDoc = await transaction.get(submissionRef);
    
    if (submissionDoc.exists() && submissionDoc.data().authorUid === voterUid) {
      throw new Error('Kendi yazınıza oy veremezsiniz');
    }

    const voteDoc = await transaction.get(voteRef);
    if (voteDoc.exists()) {
      throw new Error('Bu yazıya zaten oy verdiniz');
    }

    const totalScore = scores.topicScore + scores.languageScore + scores.creativityScore;

    const vote: CurveballVote = {
      id: voteRef.id,
      roomId,
      submissionId,
      voterUid,
      ...scores,
      totalScore,
      createdAt: Timestamp.now()
    };

    transaction.set(voteRef, vote as any);
  });
}

/**
 * Kullanıcının belirli bir gönderiye oy verip vermediğini kontrol eder.
 */
export async function hasUserVotedForCurveballSubmission(roomId: string, submissionId: string, userId: string): Promise<boolean> {
  const voteRef = doc(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions/${submissionId}/votes`, userId);
  const snap = await getDoc(voteRef);
  return snap.exists();
}

/**
 * Odayı sonlandırır, kazananları belirler, puanları dağıtır ve bildirimi atar.
 */
export async function completeCurveballRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, CURVEBALL_COLLECTION, roomId);
  const submissionsRef = collection(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions`);
  
  const submissionsSnap = await getDocs(submissionsRef);
  let submissionScores: { submissionId: string, authorUid: string, totalScore: number }[] = [];

  for (const subDoc of submissionsSnap.docs) {
    const data = subDoc.data() as CurveballSubmission;
    const votesRef = collection(db, `${CURVEBALL_COLLECTION}/${roomId}/submissions/${data.id}/votes`);
    const votesSnap = await getDocs(votesRef);
    
    let total = 0;
    votesSnap.forEach(v => total += (v.data() as CurveballVote).totalScore);
    
    submissionScores.push({
      submissionId: data.id,
      authorUid: data.authorUid,
      totalScore: total
    });
  }

  let maxScore = -1;
  let winners: string[] = [];
  
  submissionScores.forEach(sub => {
    if (sub.totalScore > maxScore) {
      maxScore = sub.totalScore;
      winners = [sub.authorUid];
    } else if (sub.totalScore === maxScore) {
      winners.push(sub.authorUid);
    }
  });

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error('Oda bulunamadı');
    
    const roomData = roomDoc.data() as CurveballRoom;
    if (roomData.status === 'completed') throw new Error('Oda zaten tamamlanmış');

    if (winners.length > 0) {
      const prizePerWinner = Math.floor(roomData.winnerPrize / winners.length);
      
      const winnerDocs = [];
      for (const winnerUid of winners) {
        const userRef = doc(db, 'users', winnerUid);
        const userDoc = await transaction.get(userRef);
        winnerDocs.push({ ref: userRef, doc: userDoc });
      }

      for (const { ref, doc } of winnerDocs) {
        if (doc.exists()) {
          const currentPoints = doc.data()?.readixPoints || 0;
          transaction.update(ref, { readixPoints: currentPoints + prizePerWinner });
        }
      }
    }

    transaction.update(roomRef, { 
      status: 'completed',
      winners: winners 
    });
  });

  const updatedDoc = await getDoc(roomRef);
  const data = updatedDoc.data() as CurveballRoom;
  if (data.winners && data.winners.length > 0) {
     const prizePerWinner = Math.floor(data.winnerPrize / data.winners.length);
     for (const winnerUid of data.winners) {
       await createNotification({
         userId: winnerUid,
         actorId: 'system',
         actorName: 'Sürpriz Kırılma',
         type: 'system_message',
         message: `Tebrikler! ${data.title} sürpriz kırılma yarışmasını kazandınız ve ${prizePerWinner} RX kazandınız.`,
         entityId: roomId
       });
     }
  }
}
