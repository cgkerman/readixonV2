import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Character } from '../types';

/**
 * Belirli bir hikayeye ait tüm karakterleri getirir
 */
export const getCharacters = async (storyId: string): Promise<Character[]> => {
  const charactersRef = collection(db, 'stories', storyId, 'characters');
  const q = query(charactersRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  const characters: Character[] = [];
  
  snapshot.forEach((docSnap) => {
    characters.push(docSnap.data() as Character);
  });
  
  return characters;
};

/**
 * Belirli bir karakterin detayını getirir
 */
export const getCharacter = async (storyId: string, characterId: string): Promise<Character | null> => {
  const docRef = doc(db, 'stories', storyId, 'characters', characterId);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return snapshot.data() as Character;
  }
  
  return null;
};

/**
 * Yeni bir karakter oluşturur
 */
export const createCharacter = async (storyId: string, data: Partial<Character>): Promise<string> => {
  const charactersRef = collection(db, 'stories', storyId, 'characters');
  const newDocRef = doc(charactersRef);
  
  const character: Character = {
    ...data,
    id: newDocRef.id,
    storyId,
    name: data.name || 'İsimsiz Karakter',
    role: data.role || 'supporting',
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  await setDoc(newDocRef, character);
  return newDocRef.id;
};

/**
 * Var olan bir karakteri günceller
 */
export const updateCharacter = async (storyId: string, characterId: string, data: Partial<Character>): Promise<void> => {
  const docRef = doc(db, 'stories', storyId, 'characters', characterId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp() as Timestamp,
  });
};

/**
 * Bir karakteri siler
 */
export const deleteCharacter = async (storyId: string, characterId: string): Promise<void> => {
  const docRef = doc(db, 'stories', storyId, 'characters', characterId);
  await deleteDoc(docRef);
};
