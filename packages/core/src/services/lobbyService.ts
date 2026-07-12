import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  runTransaction,
  Timestamp,
  serverTimestamp,
  addDoc,
  orderBy
} from 'firebase/firestore';
import type { LobbyRoom, LobbyParticipant, LobbySubmission, LobbyVote } from '../types';
import { updateReadixPoints } from './pointsService';
import { createNotification } from './notificationService';

const LOBBY_COLLECTION = 'lobbies';

/**
 * Lobi odalarını listeler.
 */
export async function getLobbyRooms(): Promise<LobbyRoom[]> {
  const lobbiesRef = collection(db, LOBBY_COLLECTION);
  // Status'a göre getirebiliriz ama şimdilik hepsini tarihe göre sıralayalım
  const q = query(lobbiesRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  
  return snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as LobbyRoom[];
}

/**
 * Belirli bir Lobi Odasını getirir.
 */
export async function getLobbyRoomById(roomId: string): Promise<LobbyRoom | null> {
  const roomRef = doc(db, LOBBY_COLLECTION, roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as LobbyRoom;
}

/**
 * Yeni bir Lobi Odası (Sistem Odası) oluşturur. (Admin yetkisi gerektirir)
 */
export async function createLobbyRoom(data: Omit<LobbyRoom, 'id' | 'createdAt' | 'participantIds'>): Promise<string> {
  const lobbiesRef = collection(db, LOBBY_COLLECTION);
  const newLobbyRef = doc(lobbiesRef);
  
  const lobby: LobbyRoom = {
    ...data,
    id: newLobbyRef.id,
    participantIds: [],
    createdAt: Timestamp.now(),
  };

  await setDoc(newLobbyRef, lobby as any); // Cast to any to handle Timestamp
  return newLobbyRef.id;
}

/**
 * Kullanıcının odaya katılmasını sağlar. (Katılım ücretini keser)
 */
export async function joinLobbyRoom(roomId: string, uid: string): Promise<void> {
  const roomRef = doc(db, LOBBY_COLLECTION, roomId);
  const participantRef = doc(db, `${LOBBY_COLLECTION}/${roomId}/participants`, uid);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) {
      throw new Error('Room not found');
    }

    const roomData = roomDoc.data() as LobbyRoom;

    if (roomData.status !== 'waiting') {
      throw new Error('Room is not accepting participants right now');
    }

    if (roomData.participantIds.includes(uid)) {
      throw new Error('You have already joined this room');
    }

    if (roomData.participantIds.length >= roomData.maxParticipants) {
      throw new Error('Room is full');
    }

    // Katılımcı ekleme işlemi
    const updatedParticipantIds = [...roomData.participantIds, uid];

    // Readix Puanını kes (bunu transaction içinde yapmalıyız)
    // PointsService ayrı transaction kullandığı için, bunu ayrı yapacağız veya
    // burada doğrudan 'users' dökümanına ulaşmalıyız.
    const userRef = doc(db, 'users', uid);
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    
    if (!userDoc.data()?.isAuthor) {
      throw new Error('Sadece yazarlar Edebi Arena odalarına katılabilir.');
    }
    
    const currentPoints = userDoc.data()?.readixPoints || 0;
    const newPoints = currentPoints - roomData.entryFee;
    
    if (newPoints < 0) {
      throw new Error('Yetersiz Readix Puanı!');
    }

    // Katılımcıyı yaz
    const participantData: LobbyParticipant = {
      roomId,
      uid,
      joinedAt: Timestamp.now(),
      hasSubmitted: false
    };
    
    transaction.set(participantRef, participantData as any);
    transaction.update(roomRef, { participantIds: updatedParticipantIds });
    transaction.update(userRef, { readixPoints: newPoints });

    // Eğer katılımcı sayısı maxParticipants'a ulaştıysa odayı başlatabiliriz (admin veya otomatik)
    // Otomatik başlayacaksa:
    if (updatedParticipantIds.length === roomData.maxParticipants) {
       transaction.update(roomRef, { 
         status: 'active',
         startedAt: serverTimestamp() 
       });
    }
  });
}

/**
 * Kullanıcı yazısını gönderir. (Başarılı gönderimde katılım ücreti iade edilebilir veya edilmeyebilir. 
 * Kullanıcı isteğine göre 5 puan teslim edince iade edilecekse bu mantığı ekleyebiliriz.
 * Şimdilik iade mantığını ekliyoruz.)
 */
export async function submitLobbyEntry(roomId: string, uid: string, content: string, wordCount: number): Promise<void> {
  const roomRef = doc(db, LOBBY_COLLECTION, roomId);
  const participantRef = doc(db, `${LOBBY_COLLECTION}/${roomId}/participants`, uid);
  const submissionsRef = collection(db, `${LOBBY_COLLECTION}/${roomId}/submissions`);

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error('Room not found');
    
    const roomData = roomDoc.data() as LobbyRoom;
    if (roomData.status !== 'active') throw new Error('Room is not active');
    
    const participantDoc = await transaction.get(participantRef);
    if (!participantDoc.exists()) throw new Error('You are not a participant in this room');
    
    if (participantDoc.data().hasSubmitted) {
      throw new Error('You have already submitted');
    }

    if (wordCount > roomData.wordLimit) {
      throw new Error(`Word limit exceeded! Max is ${roomData.wordLimit}`);
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await transaction.get(userRef);

    // Gönderiyi oluştur
    const newSubmissionRef = doc(submissionsRef);
    const submission: LobbySubmission = {
      id: newSubmissionRef.id,
      roomId,
      authorUid: uid,
      content,
      wordCount,
      createdAt: Timestamp.now()
    };

    transaction.set(newSubmissionRef, submission as any);
    transaction.update(participantRef, { hasSubmitted: true });

    // Katılım bedelini iade et
    if (userDoc.exists()) {
      const currentPoints = userDoc.data()?.readixPoints || 0;
      transaction.update(userRef, { readixPoints: currentPoints + roomData.entryFee });
    }
  });
}

/**
 * Odaya ait tüm gönderimleri getirir.
 */
export async function getLobbySubmissions(roomId: string): Promise<LobbySubmission[]> {
  const submissionsRef = collection(db, `${LOBBY_COLLECTION}/${roomId}/submissions`);
  const q = query(submissionsRef, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  
  return snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as LobbySubmission[];
}

/**
 * Odayı oylama aşamasına geçirir (Admin veya Cron tarafından)
 */
export async function startVotingPhase(roomId: string): Promise<void> {
  const roomRef = doc(db, LOBBY_COLLECTION, roomId);
  await updateDoc(roomRef, {
    status: 'voting',
    // Oylama örneğin 24 saat sürecekse
    votingEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
  });
}

/**
 * Oylama yapar.
 */
export async function voteLobbyEntry(roomId: string, submissionId: string, voterUid: string, scores: { topicScore: number, languageScore: number, creativityScore: number }): Promise<void> {
  const roomRef = doc(db, LOBBY_COLLECTION, roomId);
  const voteRef = doc(db, `${LOBBY_COLLECTION}/${roomId}/submissions/${submissionId}/votes`, voterUid);

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error('Room not found');
    if (roomDoc.data().status !== 'voting') throw new Error('Room is not in voting phase');

    // Kullanıcının kendisine oy vermesini engellemek için submission'ı kontrol et
    const submissionRef = doc(db, `${LOBBY_COLLECTION}/${roomId}/submissions`, submissionId);
    const submissionDoc = await transaction.get(submissionRef);
    
    if (submissionDoc.exists() && submissionDoc.data().authorUid === voterUid) {
      throw new Error('You cannot vote for your own submission');
    }

    const voteDoc = await transaction.get(voteRef);
    if (voteDoc.exists()) {
      throw new Error('You have already voted for this submission');
    }

    const totalScore = scores.topicScore + scores.languageScore + scores.creativityScore;

    const vote: LobbyVote = {
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
export async function hasUserVotedForSubmission(roomId: string, submissionId: string, userId: string): Promise<boolean> {
  const voteRef = doc(db, `${LOBBY_COLLECTION}/${roomId}/submissions/${submissionId}/votes`, userId);
  const snap = await getDoc(voteRef);
  return snap.exists();
}

/**
 * Odayı sonlandırır, kazananları belirler, puanları dağıtır ve bildirimi atar.
 */
export async function completeLobbyRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, LOBBY_COLLECTION, roomId);
  const submissionsRef = collection(db, `${LOBBY_COLLECTION}/${roomId}/submissions`);
  
  // Önce dışarıda tüm submissionları ve oyları okuyalım
  const submissionsSnap = await getDocs(submissionsRef);
  let submissionScores: { submissionId: string, authorUid: string, totalScore: number }[] = [];

  for (const subDoc of submissionsSnap.docs) {
    const data = subDoc.data() as LobbySubmission;
    const votesRef = collection(db, `${LOBBY_COLLECTION}/${roomId}/submissions/${data.id}/votes`);
    const votesSnap = await getDocs(votesRef);
    
    let total = 0;
    votesSnap.forEach(v => total += (v.data() as LobbyVote).totalScore);
    
    submissionScores.push({
      submissionId: data.id,
      authorUid: data.authorUid,
      totalScore: total
    });
  }

  // Kazananları belirle
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
    if (!roomDoc.exists()) throw new Error('Room not found');
    
    const roomData = roomDoc.data() as LobbyRoom;
    if (roomData.status === 'completed') throw new Error('Room is already completed');

    if (winners.length > 0) {
      const prizePerWinner = Math.floor(roomData.winnerPrize / winners.length);
      
      // Bütün okumaları önce yap
      const winnerDocs = [];
      for (const winnerUid of winners) {
        const userRef = doc(db, 'users', winnerUid);
        const userDoc = await transaction.get(userRef);
        winnerDocs.push({ ref: userRef, doc: userDoc });
      }

      // Okumalar bittikten sonra yazma işlemlerini yap
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

  // Transaction dışı: Bildirim Gönderimi (winners'a)
  // Bildirim gönderimi transaction içinde yapılamaz çünkü koleksiyon güncellemeleri karışabilir
  // Yeniden okuyalım ve atalım
  const updatedDoc = await getDoc(roomRef);
  const data = updatedDoc.data() as LobbyRoom;
  if (data.winners && data.winners.length > 0) {
     const prizePerWinner = Math.floor(data.winnerPrize / data.winners.length);
     for (const winnerUid of data.winners) {
       await createNotification({
         userId: winnerUid,
         actorId: 'system',
         actorName: 'Edebi Arena',
         type: 'system_message',
         message: `Tebrikler! ${data.title} lobi yarışmasını kazandınız ve ${prizePerWinner} Readix Puanı elde ettiniz.`,
         entityId: roomId
       });
     }
  }
}
