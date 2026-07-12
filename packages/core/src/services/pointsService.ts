import { db } from '../firebase';
import { doc, runTransaction, getDoc } from 'firebase/firestore';

export const POINTS_NEW_USER = 50;
export const POINTS_AUTHOR = 50;

/**
 * Kullanıcıya puan ekler veya düşer. (Transaction kullanılarak güvenli bir şekilde yapılır)
 * @param uid Kullanıcı ID
 * @param amount Eklenecek miktar (düşmek için negatif verin)
 * @param reason İşlem açıklaması (loglama için kullanılabilir)
 */
export async function updateReadixPoints(uid: string, amount: number, reason?: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error('User does not exist');
      }

      const currentPoints = userDoc.data()?.readixPoints || 0;
      const newPoints = currentPoints + amount;

      if (newPoints < 0) {
        throw new Error('Yetersiz bakiye (Readix Puanı)');
      }

      transaction.update(userRef, {
        readixPoints: newPoints
      });
      
      // Not: İleride 'point_transactions' gibi bir koleksiyon oluşturup 'reason' loglanabilir.
    });
  } catch (error) {
    console.error(`Error updating points for ${uid}:`, error);
    throw error;
  }
}

/**
 * Kullanıcı sisteme girdiğinde readixPoints alanı yoksa başlangıç puanını tanımlar.
 */
export async function initializeUserPoints(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.readixPoints === undefined) {
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(userRef);
        if (docSnap.exists() && docSnap.data().readixPoints === undefined) {
          transaction.update(userRef, {
            readixPoints: POINTS_NEW_USER
          });
        }
      });
      return true;
    }
  }
  return false;
}
