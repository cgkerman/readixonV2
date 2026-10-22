import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  Universe, 
  UniverseLocation, 
  UniverseTimelineEvent, 
  UniverseGlossaryTerm, 
  UniverseLore,
  Character,
  CharacterRelationship,
  UniverseMap,
  UniverseMapMarker,
  UniverseOrganization,
  UniverseItem,
  UniversePowerSystem,
  UniverseRace,
  UniverseCreature,
  UniverseCulture,
  UniverseMedia,
  UniverseSoundtrack,
  UniverseCanonRule,
  UniversePlotThread,
  UniverseMember,
  UniverseMemberRole,
  UniverseDivinationSystem,
  UniverseProphecy,
  UniverseSpell,
  UniverseRitual
} from '../types';
import { generateUniverseSlug, extractUniverseIdFromSlug } from '../utils/slug';
import { getUserProfile } from './userService';

/**
 * Firestore'un 'undefined' değerleri reddetmesi nedeniyle,
 * nesnelerdeki undefined alanları temizleyen yardımcı fonksiyon.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        typeof (value as any).toMillis !== 'function' &&
        !(typeof (value as any).isEqual === 'function' && (value as any)._methodName)
      ) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// Evren (Universe) CRUD
// ─────────────────────────────────────────────────────────────────

/**
 * Yeni bir Evren oluşturur.
 */
export const createUniverse = async (authorId: string, data: Partial<Universe>): Promise<string> => {
  const universeRef = collection(db, 'universes');
  const newDocRef = doc(universeRef);
  const universeId = newDocRef.id;

  const author = await getUserProfile(authorId);
  const title = (data.title || 'İsimsiz Evren').trim();
  const slug = generateUniverseSlug(title, universeId);

  const newUniverse: Universe = {
    universeId,
    authorId,
    authorName: author?.displayName || data.authorName || '',
    authorUsername: author?.username || data.authorUsername || '',
    authorAvatarUrl: author?.avatarUrl || data.authorAvatarUrl || '',
    title,
    slug,
    description: data.description || '',
    coverImage: data.coverImage || '',
    bannerImage: data.bannerImage || '',
    genre: data.genre || 'fantasy',
    tags: data.tags || [],
    visibility: data.visibility || 'draft',
    connectedStoryIds: data.connectedStoryIds || [],
    connectedSeriesIds: data.connectedSeriesIds || [],
    stats: {
      characterCount: 0,
      locationCount: 0,
      eventCount: 0,
      storyCount: data.connectedStoryIds?.length || 0,
      seriesCount: data.connectedSeriesIds?.length || 0,
      views: 0,
      likes: 0,
    },
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const batch = writeBatch(db);
  batch.set(newDocRef, cleanFirestoreData(newUniverse));

  // Başlangıçta bağlanan hikayeler varsa universeId'lerini güncelle
  if (data.connectedStoryIds && data.connectedStoryIds.length > 0) {
    for (const storyId of data.connectedStoryIds) {
      batch.update(doc(db, 'stories', storyId), {
        universeId,
        universeTitle: title,
        updatedAt: serverTimestamp(),
      });
    }
  }

  // Başlangıçta bağlanan seriler varsa universeId'lerini güncelle
  if (data.connectedSeriesIds && data.connectedSeriesIds.length > 0) {
    for (const seriesId of data.connectedSeriesIds) {
      batch.update(doc(db, 'series', seriesId), {
        universeId,
        universeTitle: title,
        updatedAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();
  return universeId;
};

/**
 * Evren detayını günceller.
 */
export const updateUniverse = async (universeId: string, data: Partial<Universe>): Promise<void> => {
  const docRef = doc(db, 'universes', universeId);
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.title) {
    updateData.slug = generateUniverseSlug(data.title.trim(), universeId);
  }

  await updateDoc(docRef, cleanFirestoreData(updateData));

  // Başlık değiştiyse bağlı hikayelerde ve serilerde de universeTitle'ı güncelle
  if (data.title) {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const u = snap.data() as Universe;
      const batch = writeBatch(db);

      if (u.connectedStoryIds && u.connectedStoryIds.length > 0) {
        for (const storyId of u.connectedStoryIds) {
          batch.update(doc(db, 'stories', storyId), {
            universeTitle: data.title.trim(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      if (u.connectedSeriesIds && u.connectedSeriesIds.length > 0) {
        for (const seriesId of u.connectedSeriesIds) {
          batch.update(doc(db, 'series', seriesId), {
            universeTitle: data.title.trim(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      await batch.commit();
    }
  }
};

/**
 * Evreni siler (Bağlı eserleri silmez, sadece evren bağını kaldırır).
 */
export const deleteUniverse = async (universeId: string): Promise<void> => {
  const docRef = doc(db, 'universes', universeId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const u = snap.data() as Universe;

    // 1. Bağlı eserlerin evren bağını güvenle kaldır (Eserler ASLA silinmez, sadece evren referansı temizlenir)
    if (u.connectedStoryIds && u.connectedStoryIds.length > 0) {
      await Promise.allSettled(
        u.connectedStoryIds.map(async (storyId) => {
          try {
            const storyRef = doc(db, 'stories', storyId);
            const sSnap = await getDoc(storyRef);
            if (sSnap.exists()) {
              await updateDoc(storyRef, {
                universeId: null,
                universeTitle: null,
                updatedAt: serverTimestamp(),
              });
            }
          } catch (e) {
            console.warn(`Hikaye (${storyId}) evren bağı kaldırılırken hata:`, e);
          }
        })
      );
    }

    // 2. Bağlı serilerin evren bağını güvenle kaldır (Seriler ASLA silinmez, sadece evren referansı temizlenir)
    if (u.connectedSeriesIds && u.connectedSeriesIds.length > 0) {
      await Promise.allSettled(
        u.connectedSeriesIds.map(async (seriesId) => {
          try {
            const seriesRef = doc(db, 'series', seriesId);
            const serSnap = await getDoc(seriesRef);
            if (serSnap.exists()) {
              await updateDoc(seriesRef, {
                universeId: null,
                universeTitle: null,
                updatedAt: serverTimestamp(),
              });
            }
          } catch (e) {
            console.warn(`Seri (${seriesId}) evren bağı kaldırılırken hata:`, e);
          }
        })
      );
    }

    // 3. Evren ana dokümanını sil
    await deleteDoc(docRef);
  }
};

/**
 * ID ile evren getirir.
 */
export const getUniverseById = async (universeId: string): Promise<Universe | null> => {
  const docRef = doc(db, 'universes', universeId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as Universe;
  }
  return null;
};

/**
 * Slug ile evren getirir.
 */
export const getUniverseBySlug = async (slug: string): Promise<Universe | null> => {
  const universeId = extractUniverseIdFromSlug(slug);
  return getUniverseById(universeId);
};

/**
 * Bir yazarın oluşturduğu tüm evrenleri getirir.
 */
export const getUniversesByAuthorId = async (authorId: string): Promise<Universe[]> => {
  const universesRef = collection(db, 'universes');
  const q = query(universesRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const list: Universe[] = [];
  snapshot.forEach((docSnap) => {
    list.push(docSnap.data() as Universe);
  });
  return list;
};

/**
 * Kullanıcının ortak yazar veya ekip üyesi olduğu evrenleri getirir.
 */
export const getCollaboratingUniverses = async (userId: string): Promise<Universe[]> => {
  const universesRef = collection(db, 'universes');
  const q = query(
    universesRef,
    where('collaboratorIds', 'array-contains', userId)
  );
  const snapshot = await getDocs(q);

  const list: Universe[] = [];
  snapshot.forEach((docSnap) => {
    list.push(docSnap.data() as Universe);
  });
  return list;
};

/**
 * Evrene yeni bir ekip üyesi / ortak yazar ekler (PRD Bölüm 32, 66).
 */
export const addUniverseMember = async (
  universeId: string,
  member: Omit<UniverseMember, 'addedAt'>
): Promise<void> => {
  const docRef = doc(db, 'universes', universeId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Evren bulunamadı');

  const universe = snap.data() as Universe;
  const currentMembers = universe.members || [];
  const currentCollaborators = universe.collaboratorIds || [];

  // Kullanıcı zaten üye mi?
  if (currentMembers.some((m) => m.userId === member.userId)) {
    throw new Error('Bu kullanıcı zaten evren ekibinde yer alıyor.');
  }

  const newMember: UniverseMember = {
    ...member,
    addedAt: Timestamp.now(),
  };

  const updatedMembers = [...currentMembers, newMember];
  const updatedCollaboratorIds = Array.from(new Set([...currentCollaborators, member.userId]));

  await updateDoc(docRef, cleanFirestoreData({
    members: updatedMembers,
    collaboratorIds: updatedCollaboratorIds,
    updatedAt: serverTimestamp(),
  }));
};

/**
 * Evren üyesinin rolünü günceller (PRD Bölüm 32).
 */
export const updateUniverseMemberRole = async (
  universeId: string,
  targetUserId: string,
  newRole: UniverseMemberRole
): Promise<void> => {
  const docRef = doc(db, 'universes', universeId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Evren bulunamadı');

  const universe = snap.data() as Universe;
  const currentMembers = universe.members || [];

  const updatedMembers = currentMembers.map((m) => {
    if (m.userId === targetUserId) {
      return { ...m, role: newRole };
    }
    return m;
  });

  await updateDoc(docRef, cleanFirestoreData({
    members: updatedMembers,
    updatedAt: serverTimestamp(),
  }));
};

/**
 * Evrenden bir ekip üyesini çıkarır.
 */
export const removeUniverseMember = async (
  universeId: string,
  targetUserId: string
): Promise<void> => {
  const docRef = doc(db, 'universes', universeId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Evren bulunamadı');

  const universe = snap.data() as Universe;
  const currentMembers = universe.members || [];
  const currentCollaborators = universe.collaboratorIds || [];

  const updatedMembers = currentMembers.filter((m) => m.userId !== targetUserId);
  const updatedCollaborators = currentCollaborators.filter((id) => id !== targetUserId);

  await updateDoc(docRef, cleanFirestoreData({
    members: updatedMembers,
    collaboratorIds: updatedCollaborators,
    updatedAt: serverTimestamp(),
  }));
};

/**
 * Bir hikayenin bağlı olduğu evreni getirir.
 */
export const getUniverseByStoryId = async (storyId: string): Promise<Universe | null> => {
  const storySnap = await getDoc(doc(db, 'stories', storyId));
  if (!storySnap.exists()) return null;

  const storyData = storySnap.data();
  if (!storyData.universeId) return null;

  return getUniverseById(storyData.universeId);
};

/**
 * Keşfet / Evrene Gir için herkese açık evrenleri getirir.
 */
export const getPublicUniverses = async (limitCount: number = 20): Promise<Universe[]> => {
  const universesRef = collection(db, 'universes');
  try {
    const q = query(
      universesRef,
      where('visibility', 'in', ['public', 'partially_public']),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const list: Universe[] = [];
    snap.forEach((d) => list.push(d.data() as Universe));
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('getPublicUniverses fallback without compound index:', err);
  }

  try {
    const fallbackQ = query(universesRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(fallbackQ);
    const list: Universe[] = [];
    snap.forEach((d) => {
      const u = d.data() as Universe;
      if (u.visibility === 'public' || u.visibility === 'partially_public') {
        list.push(u);
      }
    });
    return list.slice(0, limitCount);
  } catch {
    return [];
  }
};

/**
 * Admin ve Editör paneli için platformdaki tüm evrenleri getirir.
 */
export const getAllUniverses = async (limitCount: number = 100): Promise<Universe[]> => {
  const universesRef = collection(db, 'universes');
  const q = query(universesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);

  const list: Universe[] = [];
  snap.forEach((d) => {
    list.push(d.data() as Universe);
  });
  return list;
};

/**
 * Bir eseri (hikayeyi) evrene bağlar.
 */
export const linkStoryToUniverse = async (universeId: string, storyId: string): Promise<void> => {
  const universeRef = doc(db, 'universes', universeId);
  const storyRef = doc(db, 'stories', storyId);

  const [uSnap, sSnap] = await Promise.all([getDoc(universeRef), getDoc(storyRef)]);
  if (!uSnap.exists() || !sSnap.exists()) {
    throw new Error('Evren veya Hikaye bulunamadı.');
  }

  const u = uSnap.data() as Universe;
  const currentStories = u.connectedStoryIds || [];
  if (currentStories.includes(storyId)) return;

  const updatedStories = [...currentStories, storyId];

  const batch = writeBatch(db);
  batch.update(universeRef, {
    connectedStoryIds: updatedStories,
    'stats.storyCount': updatedStories.length,
    updatedAt: serverTimestamp(),
  });

  batch.update(storyRef, {
    universeId,
    universeTitle: u.title,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * Bir eseri evrenden ayırır.
 */
export const unlinkStoryFromUniverse = async (universeId: string, storyId: string): Promise<void> => {
  const universeRef = doc(db, 'universes', universeId);
  const uSnap = await getDoc(universeRef);
  if (!uSnap.exists()) return;

  const u = uSnap.data() as Universe;
  const remaining = (u.connectedStoryIds || []).filter((id) => id !== storyId);

  const batch = writeBatch(db);
  batch.update(universeRef, {
    connectedStoryIds: remaining,
    'stats.storyCount': remaining.length,
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'stories', storyId), {
    universeId: null,
    universeTitle: null,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * Bir seriyi evrene bağlar.
 */
export const linkSeriesToUniverse = async (universeId: string, seriesId: string): Promise<void> => {
  const universeRef = doc(db, 'universes', universeId);
  const seriesRef = doc(db, 'series', seriesId);

  const [uSnap, sSnap] = await Promise.all([getDoc(universeRef), getDoc(seriesRef)]);
  if (!uSnap.exists() || !sSnap.exists()) {
    throw new Error('Evren veya Seri bulunamadı.');
  }

  const u = uSnap.data() as Universe;
  const currentSeries = u.connectedSeriesIds || [];
  if (currentSeries.includes(seriesId)) return;

  const updatedSeries = [...currentSeries, seriesId];

  const batch = writeBatch(db);
  batch.update(universeRef, {
    connectedSeriesIds: updatedSeries,
    'stats.seriesCount': updatedSeries.length,
    updatedAt: serverTimestamp(),
  });

  batch.update(seriesRef, {
    universeId,
    universeTitle: u.title,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * Bir seriyi evrenden ayırır.
 */
export const unlinkSeriesFromUniverse = async (universeId: string, seriesId: string): Promise<void> => {
  const universeRef = doc(db, 'universes', universeId);
  const uSnap = await getDoc(universeRef);
  if (!uSnap.exists()) return;

  const u = uSnap.data() as Universe;
  const remaining = (u.connectedSeriesIds || []).filter((id) => id !== seriesId);

  const batch = writeBatch(db);
  batch.update(universeRef, {
    connectedSeriesIds: remaining,
    'stats.seriesCount': remaining.length,
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'series', seriesId), {
    universeId: null,
    universeTitle: null,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

// ─────────────────────────────────────────────────────────────────
// Evren Mekânları (Universe Locations)
// ─────────────────────────────────────────────────────────────────

export const getUniverseLocations = async (universeId: string): Promise<UniverseLocation[]> => {
  const colRef = collection(db, 'universes', universeId, 'locations');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseLocation[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseLocation));
  return list;
};

export const createUniverseLocation = async (
  universeId: string,
  data: Partial<UniverseLocation>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'locations');
  const newRef = doc(colRef);
  const id = newRef.id;

  const location: Record<string, any> = {
    id,
    universeId,
    name: data.name || 'İsimsiz Mekân',
    type: data.type || 'city',
    description: data.description || '',
    detailedDescription: data.detailedDescription || '',
    climate: data.climate || '',
    geography: data.geography || '',
    atmosphere: data.atmosphere || '',
    population: data.population || '',
    languages: data.languages || '',
    culture: data.culture || '',
    governance: data.governance || '',
    economy: data.economy || '',
    security: data.security || '',
    history: data.history || '',
    specialRules: data.specialRules || '',
    dangers: data.dangers || '',
    importantCharacterIds: data.importantCharacterIds || [],
    relatedEventIds: data.relatedEventIds || [],
    relatedOrganizationIds: data.relatedOrganizationIds || [],
    imageUrl: data.imageUrl || '',
    authorNotes: data.authorNotes || '',
    readerNotes: data.readerNotes || '',
    secretLore: data.secretLore || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.parentLocationId) {
    location.parentLocationId = data.parentLocationId;
  }
  if (data.spoilerThresholdChapter !== undefined) {
    location.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(location));

  try {
    const locs = await getUniverseLocations(universeId);
    await updateDoc(doc(db, 'universes', universeId), {
      'stats.locationCount': locs.length,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Evren mekan istatistiği güncellenemedi:', err);
  }

  return id;
};

export const updateUniverseLocation = async (
  universeId: string,
  locationId: string,
  data: Partial<UniverseLocation>
): Promise<void> => {
  const docRef = doc(db, 'universes', universeId, 'locations', locationId);
  await updateDoc(docRef, cleanFirestoreData({
    ...data,
    updatedAt: serverTimestamp(),
  }));
};

export const deleteUniverseLocation = async (
  universeId: string,
  locationId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'locations', locationId));
  try {
    const locs = await getUniverseLocations(universeId);
    await updateDoc(doc(db, 'universes', universeId), {
      'stats.locationCount': locs.length,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Evren mekan silme sonrası istatistik güncellenemedi:', err);
  }
};

// ─────────────────────────────────────────────────────────────────
// Zaman Çizelgesi (Universe Timeline Events)
// ─────────────────────────────────────────────────────────────────

export const getUniverseTimelineEvents = async (universeId: string): Promise<UniverseTimelineEvent[]> => {
  const colRef = collection(db, 'universes', universeId, 'events');
  const q = query(colRef, orderBy('chronologicalOrder', 'asc'));
  const snap = await getDocs(q);

  const list: UniverseTimelineEvent[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseTimelineEvent));
  return list;
};

export const createUniverseTimelineEvent = async (
  universeId: string,
  data: Partial<UniverseTimelineEvent>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'events');
  const newRef = doc(colRef);
  const id = newRef.id;

  const event: Record<string, any> = {
    id,
    universeId,
    title: data.title || 'İsimsiz Olay',
    summary: data.summary || '',
    detailedDescription: data.detailedDescription || '',
    eventType: data.eventType || 'universe_history',
    era: data.era || '',
    customDate: data.customDate || '',
    chronologicalOrder: data.chronologicalOrder ?? Date.now(),
    relatedCharacterIds: data.relatedCharacterIds || [],
    relatedLocationIds: data.relatedLocationIds || [],
    relatedStoryIds: data.relatedStoryIds || [],
    relatedChapterIds: data.relatedChapterIds || [],
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    event.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(event));

  try {
    const events = await getUniverseTimelineEvents(universeId);
    await updateDoc(doc(db, 'universes', universeId), {
      'stats.eventCount': events.length,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Evren olay istatistiği güncellenemedi:', err);
  }

  return id;
};

export const updateUniverseTimelineEvent = async (
  universeId: string,
  eventId: string,
  data: Partial<UniverseTimelineEvent>
): Promise<void> => {
  const docRef = doc(db, 'universes', universeId, 'events', eventId);
  await updateDoc(docRef, cleanFirestoreData({
    ...data,
    updatedAt: serverTimestamp(),
  }));
};

export const deleteUniverseTimelineEvent = async (
  universeId: string,
  eventId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'events', eventId));
  try {
    const events = await getUniverseTimelineEvents(universeId);
    await updateDoc(doc(db, 'universes', universeId), {
      'stats.eventCount': events.length,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Evren olay silme sonrası istatistik güncellenemedi:', err);
  }
};

// ─────────────────────────────────────────────────────────────────
// Evren Sözlüğü (Universe Glossary)
// ─────────────────────────────────────────────────────────────────

export const getUniverseGlossary = async (universeId: string): Promise<UniverseGlossaryTerm[]> => {
  const colRef = collection(db, 'universes', universeId, 'glossary');
  const q = query(colRef, orderBy('term', 'asc'));
  const snap = await getDocs(q);

  const list: UniverseGlossaryTerm[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseGlossaryTerm));
  return list;
};

export const createUniverseGlossaryTerm = async (
  universeId: string,
  data: Partial<UniverseGlossaryTerm>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'glossary');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    term: data.term || 'Yeni Terim',
    pronunciation: data.pronunciation || '',
    meaning: data.meaning || '',
    category: data.category || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.firstAppearedChapterId) item.firstAppearedChapterId = data.firstAppearedChapterId;
  if (data.spoilerThresholdChapter !== undefined) item.spoilerThresholdChapter = data.spoilerThresholdChapter;

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseGlossaryTerm = async (
  universeId: string,
  termId: string,
  data: Partial<UniverseGlossaryTerm>
): Promise<void> => {
  await updateDoc(doc(db, 'universes', universeId, 'glossary', termId), cleanFirestoreData({
    ...data,
    updatedAt: serverTimestamp(),
  }));
};

export const deleteUniverseGlossaryTerm = async (
  universeId: string,
  termId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'glossary', termId));
};

// ─────────────────────────────────────────────────────────────────
// Lore / Dünya Bilgisi (Universe Lore)
// ─────────────────────────────────────────────────────────────────

export const getUniverseLoreList = async (universeId: string): Promise<UniverseLore[]> => {
  const colRef = collection(db, 'universes', universeId, 'lore');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseLore[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseLore));
  return list;
};

export const createUniverseLore = async (
  universeId: string,
  data: Partial<UniverseLore>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'lore');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    title: data.title || 'İsimsiz Lore',
    category: data.category || 'history',
    content: data.content || '',
    readerContent: data.readerContent || '',
    secretContent: data.secretContent || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) item.spoilerThresholdChapter = data.spoilerThresholdChapter;

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseLore = async (
  universeId: string,
  loreId: string,
  data: Partial<UniverseLore>
): Promise<void> => {
  await updateDoc(doc(db, 'universes', universeId, 'lore', loreId), cleanFirestoreData({
    ...data,
    updatedAt: serverTimestamp(),
  }));
};

export const deleteUniverseLore = async (
  universeId: string,
  loreId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'lore', loreId));
};

// ─────────────────────────────────────────────────────────────────
// Evren Karakterleri (Universe Characters - Karakter Defteri 2.0)
// ─────────────────────────────────────────────────────────────────

export const getUniverseCharacters = async (universeId: string): Promise<Character[]> => {
  const colRef = collection(db, 'universes', universeId, 'characters');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: Character[] = [];
  snap.forEach((d) => list.push(d.data() as Character));
  return list;
};

export const createUniverseCharacter = async (
  universeId: string,
  data: Partial<Character>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'characters');
  const newRef = doc(colRef);
  const id = newRef.id;

  const character: Record<string, any> = {
    ...data,
    id,
    universeId,
    storyId: data.storyId || '', // Geriye dönük uyumluluk
    name: data.name || 'İsimsiz Karakter',
    role: data.role || 'supporting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newRef, cleanFirestoreData(character));

  try {
    const chars = await getUniverseCharacters(universeId);
    await updateDoc(doc(db, 'universes', universeId), {
      'stats.characterCount': chars.length,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Evren karakter istatistiği güncellenemedi:', err);
  }

  return id;
};

export const updateUniverseCharacter = async (
  universeId: string,
  characterId: string,
  data: Partial<Character>
): Promise<void> => {
  await updateDoc(doc(db, 'universes', universeId, 'characters', characterId), cleanFirestoreData({
    ...data,
    updatedAt: serverTimestamp(),
  }));
};

export const deleteUniverseCharacter = async (
  universeId: string,
  characterId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'characters', characterId));
  try {
    const chars = await getUniverseCharacters(universeId);
    await updateDoc(doc(db, 'universes', universeId), {
      'stats.characterCount': chars.length,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Evren karakter silme sonrası istatistik güncellenemedi:', err);
  }
};

export const addUniverseCharacterRelationship = async (
  universeId: string,
  characterId: string,
  relationship: CharacterRelationship
): Promise<void> => {
  const chars = await getUniverseCharacters(universeId);
  const sourceChar = chars.find((c) => c.id === characterId);
  if (!sourceChar) return;

  const currentRels = sourceChar.relationships || [];
  const updatedRels = [
    ...currentRels.filter((r) => r.targetCharacterId !== relationship.targetCharacterId),
    relationship,
  ];

  await updateUniverseCharacter(universeId, characterId, {
    relationships: updatedRels,
  });

  if (relationship.isReciprocal) {
    const targetChar = chars.find((c) => c.id === relationship.targetCharacterId);
    if (targetChar) {
      const targetRels = targetChar.relationships || [];
      const updatedTargetRels = [
        ...targetRels.filter((r) => r.targetCharacterId !== characterId),
        {
          targetCharacterId: characterId,
          targetCharacterName: sourceChar.name,
          targetCharacterAvatar: sourceChar.avatarUrl,
          relationshipType: relationship.relationshipType,
          description: relationship.description,
          isReciprocal: true,
          isSecret: relationship.isSecret,
          spoilerThresholdChapter: relationship.spoilerThresholdChapter,
        },
      ];
      await updateUniverseCharacter(universeId, targetChar.id, {
        relationships: updatedTargetRels,
      });
    }
  }
};

export const deleteUniverseCharacterRelationship = async (
  universeId: string,
  characterId: string,
  targetCharacterId: string
): Promise<void> => {
  const chars = await getUniverseCharacters(universeId);
  const sourceChar = chars.find((c) => c.id === characterId);
  if (!sourceChar) return;

  const currentRels = sourceChar.relationships || [];
  const updatedRels = currentRels.filter((r) => r.targetCharacterId !== targetCharacterId);

  await updateUniverseCharacter(universeId, characterId, {
    relationships: updatedRels,
  });
};

// ─────────────────────────────────────────────────────────────────
// Dünya Haritaları (World Maps & Interactive Pins)
// ─────────────────────────────────────────────────────────────────

export const getUniverseMaps = async (universeId: string): Promise<UniverseMap[]> => {
  const colRef = collection(db, 'universes', universeId, 'maps');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseMap[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseMap));
  return list;
};

export const getUniverseMapById = async (
  universeId: string,
  mapId: string
): Promise<UniverseMap | null> => {
  const d = await getDoc(doc(db, 'universes', universeId, 'maps', mapId));
  if (!d.exists()) return null;
  return d.data() as UniverseMap;
};

export const createUniverseMap = async (
  universeId: string,
  data: Partial<UniverseMap>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'maps');
  const newRef = doc(colRef);
  const id = newRef.id;

  const mapData: Record<string, any> = {
    id,
    universeId,
    title: (data.title || 'İsimsiz Harita').trim(),
    description: data.description || '',
    mapType: data.mapType || 'world',
    imageUrl: data.imageUrl || '',
    markers: data.markers || [],
    routes: data.routes || [],
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    mapData.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(mapData));
  return id;
};

export const updateUniverseMap = async (
  universeId: string,
  mapId: string,
  data: Partial<UniverseMap>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'maps', mapId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseMap = async (
  universeId: string,
  mapId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'maps', mapId));
};

export const addMapMarker = async (
  universeId: string,
  mapId: string,
  marker: UniverseMapMarker
): Promise<void> => {
  const mapDoc = await getUniverseMapById(universeId, mapId);
  if (!mapDoc) return;
  const currentMarkers = mapDoc.markers || [];
  const updatedMarkers = [...currentMarkers, marker];
  await updateUniverseMap(universeId, mapId, { markers: updatedMarkers });
};

export const updateMapMarker = async (
  universeId: string,
  mapId: string,
  markerId: string,
  data: Partial<UniverseMapMarker>
): Promise<void> => {
  const mapDoc = await getUniverseMapById(universeId, mapId);
  if (!mapDoc) return;
  const updatedMarkers = (mapDoc.markers || []).map((m) =>
    m.id === markerId ? { ...m, ...data } : m
  );
  await updateUniverseMap(universeId, mapId, { markers: updatedMarkers });
};

export const deleteMapMarker = async (
  universeId: string,
  mapId: string,
  markerId: string
): Promise<void> => {
  const mapDoc = await getUniverseMapById(universeId, mapId);
  if (!mapDoc) return;
  const updatedMarkers = (mapDoc.markers || []).filter((m) => m.id !== markerId);
  await updateUniverseMap(universeId, mapId, { markers: updatedMarkers });
};

// ─────────────────────────────────────────────────────────────────
// Organizasyonlar & Hanedanlar (Organizations)
// ─────────────────────────────────────────────────────────────────

export const getUniverseOrganizations = async (universeId: string): Promise<UniverseOrganization[]> => {
  const colRef = collection(db, 'universes', universeId, 'organizations');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseOrganization[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseOrganization));
  return list;
};

export const createUniverseOrganization = async (
  universeId: string,
  data: Partial<UniverseOrganization>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'organizations');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Organizasyon').trim(),
    type: data.type || 'guild',
    description: data.description || '',
    symbolUrl: data.symbolUrl || '',
    leaderCharacterId: data.leaderCharacterId || '',
    memberCharacterIds: data.memberCharacterIds || [],
    headquarterLocationId: data.headquarterLocationId || '',
    ideology: data.ideology || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseOrganization = async (
  universeId: string,
  orgId: string,
  data: Partial<UniverseOrganization>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'organizations', orgId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseOrganization = async (
  universeId: string,
  orgId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'organizations', orgId));
};

// ─────────────────────────────────────────────────────────────────
// Eşyalar & Artefaktlar (Items & Artifacts)
// ─────────────────────────────────────────────────────────────────

export const getUniverseItems = async (universeId: string): Promise<UniverseItem[]> => {
  const colRef = collection(db, 'universes', universeId, 'items');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseItem[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseItem));
  return list;
};

export const createUniverseItem = async (
  universeId: string,
  data: Partial<UniverseItem>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'items');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Eşya').trim(),
    type: data.type || 'Silah',
    description: data.description || '',
    origin: data.origin || '',
    currentOwnerId: data.currentOwnerId || '',
    powerDescription: data.powerDescription || '',
    limitation: data.limitation || '',
    imageUrl: data.imageUrl || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseItem = async (
  universeId: string,
  itemId: string,
  data: Partial<UniverseItem>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'items', itemId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseItem = async (
  universeId: string,
  itemId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'items', itemId));
};

// ─────────────────────────────────────────────────────────────────
// Güç / Büyü / Teknoloji Sistemleri (Power Systems)
// ─────────────────────────────────────────────────────────────────

export const getUniversePowerSystems = async (universeId: string): Promise<UniversePowerSystem[]> => {
  const colRef = collection(db, 'universes', universeId, 'powerSystems');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniversePowerSystem[] = [];
  snap.forEach((d) => list.push(d.data() as UniversePowerSystem));
  return list;
};

export const createUniversePowerSystem = async (
  universeId: string,
  data: Partial<UniversePowerSystem>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'powerSystems');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Güç Sistemi').trim(),
    corePrinciples: data.corePrinciples || '',
    source: data.source || '',
    whoCanUse: data.whoCanUse || '',
    rulesAndLimits: data.rulesAndLimits || '',
    costAndRisks: data.costAndRisks || '',
    levelsOrTiers: data.levelsOrTiers || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniversePowerSystem = async (
  universeId: string,
  systemId: string,
  data: Partial<UniversePowerSystem>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'powerSystems', systemId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniversePowerSystem = async (
  universeId: string,
  systemId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'powerSystems', systemId));
};

// ─────────────────────────────────────────────────────────────────
// Irklar ve Türler (Races & Species)
// ─────────────────────────────────────────────────────────────────

export const getUniverseRaces = async (universeId: string): Promise<UniverseRace[]> => {
  const colRef = collection(db, 'universes', universeId, 'races');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseRace[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseRace));
  return list;
};

export const createUniverseRace = async (
  universeId: string,
  data: Partial<UniverseRace>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'races');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Irk / Tür').trim(),
    alternativeNames: data.alternativeNames || '',
    origin: data.origin || '',
    physicalTraits: data.physicalTraits || '',
    lifespan: data.lifespan || '',
    biology: data.biology || '',
    culture: data.culture || '',
    language: data.language || '',
    homelandRegionId: data.homelandRegionId || '',
    homelandRegionName: data.homelandRegionName || '',
    strengths: data.strengths || '',
    weaknesses: data.weaknesses || '',
    relationshipsWithOtherRaces: data.relationshipsWithOtherRaces || '',
    history: data.history || '',
    notableCharacterIds: data.notableCharacterIds || [],
    imageUrl: data.imageUrl || '',
    authorNotes: data.authorNotes || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseRace = async (
  universeId: string,
  raceId: string,
  data: Partial<UniverseRace>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'races', raceId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseRace = async (
  universeId: string,
  raceId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'races', raceId));
};

// ─────────────────────────────────────────────────────────────────
// Yaratıklar ve Canavarlar (Creatures & Bestiary)
// ─────────────────────────────────────────────────────────────────

export const getUniverseCreatures = async (universeId: string): Promise<UniverseCreature[]> => {
  const colRef = collection(db, 'universes', universeId, 'creatures');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseCreature[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseCreature));
  return list;
};

export const createUniverseCreature = async (
  universeId: string,
  data: Partial<UniverseCreature>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'creatures');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Yaratık').trim(),
    type: data.type || 'monster',
    dangerLevel: data.dangerLevel || 'medium',
    appearance: data.appearance || '',
    behavior: data.behavior || '',
    habitatLocationId: data.habitatLocationId || '',
    habitatLocationName: data.habitatLocationName || '',
    diet: data.diet || '',
    abilities: data.abilities || '',
    weaknesses: data.weaknesses || '',
    dropsOrMaterials: data.dropsOrMaterials || '',
    lore: data.lore || '',
    relatedEventIds: data.relatedEventIds || [],
    imageUrl: data.imageUrl || '',
    authorNotes: data.authorNotes || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseCreature = async (
  universeId: string,
  creatureId: string,
  data: Partial<UniverseCreature>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'creatures', creatureId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseCreature = async (
  universeId: string,
  creatureId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'creatures', creatureId));
};

// ─────────────────────────────────────────────────────────────────
// Kültür, İnanç, Mitoloji & Dünya Düzeni (Cultures & World Order)
// ─────────────────────────────────────────────────────────────────

export const getUniverseCultures = async (universeId: string): Promise<UniverseCulture[]> => {
  const colRef = collection(db, 'universes', universeId, 'cultures');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseCulture[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseCulture));
  return list;
};

export const createUniverseCulture = async (
  universeId: string,
  data: Partial<UniverseCulture>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'cultures');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Kültür / İnanç').trim(),
    category: data.category || 'culture',
    description: data.description || '',
    associatedRaces: data.associatedRaces || '',
    associatedRegions: data.associatedRegions || '',
    traditionsAndCustoms: data.traditionsAndCustoms || '',
    valuesAndTaboos: data.valuesAndTaboos || '',
    deitiesAndFigures: data.deitiesAndFigures || '',
    sacredPlacesAndTexts: data.sacredPlacesAndTexts || '',
    creationMythAndAfterlife: data.creationMythAndAfterlife || '',
    governmentSystem: data.governmentSystem || '',
    lawsAndSuccession: data.lawsAndSuccession || '',
    currencyAndTrade: data.currencyAndTrade || '',
    socialClasses: data.socialClasses || '',
    imageUrl: data.imageUrl || '',
    authorNotes: data.authorNotes || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseCulture = async (
  universeId: string,
  cultureId: string,
  data: Partial<UniverseCulture>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'cultures', cultureId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseCulture = async (
  universeId: string,
  cultureId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'cultures', cultureId));
};

// ─────────────────────────────────────────────────────────────────
// Görsel Arşiv, Galeri & Moodboard (PRD Bölüm 46)
// ─────────────────────────────────────────────────────────────────

export const getUniverseMedia = async (universeId: string): Promise<UniverseMedia[]> => {
  const coll = collection(db, 'universes', universeId, 'media');
  const snap = await getDocs(coll);
  const items = snap.docs.map((d) => ({
    id: d.id,
    universeId,
    ...d.data(),
  })) as UniverseMedia[];

  return items.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const createUniverseMedia = async (
  universeId: string,
  data: Partial<UniverseMedia>
): Promise<string> => {
  const newRef = doc(collection(db, 'universes', universeId, 'media'));
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    title: data.title?.trim() || 'İsimsiz Görsel',
    imageUrl: data.imageUrl || '',
    thumbnailUrl: data.thumbnailUrl || '',
    category: data.category || 'other',
    description: data.description || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    colorPalette: Array.isArray(data.colorPalette) ? data.colorPalette : [],
    isAuthorOnly: !!data.isAuthorOnly,
    isSpoiler: data.isSpoiler || false,
    authorNotes: data.authorNotes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseMedia = async (
  universeId: string,
  mediaId: string,
  data: Partial<UniverseMedia>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'media', mediaId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseMedia = async (
  universeId: string,
  mediaId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'media', mediaId));
};

// ─────────────────────────────────────────────────────────────────
// Evren Müzikleri, Soundtrack & Ambiyans (PRD Bölüm 29 & Audio Atmosphere)
// ─────────────────────────────────────────────────────────────────

export const getUniverseSoundtracks = async (universeId: string): Promise<UniverseSoundtrack[]> => {
  const coll = collection(db, 'universes', universeId, 'soundtracks');
  const snap = await getDocs(coll);
  const items = snap.docs.map((d) => ({
    id: d.id,
    universeId,
    ...d.data(),
  })) as UniverseSoundtrack[];

  return items.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const createUniverseSoundtrack = async (
  universeId: string,
  data: Partial<UniverseSoundtrack>
): Promise<string> => {
  const newRef = doc(collection(db, 'universes', universeId, 'soundtracks'));
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    title: data.title?.trim() || 'İsimsiz Parça',
    artist: data.artist || '',
    url: data.url || '',
    platform: data.platform || 'other',
    themeType: data.themeType || 'ambient',
    description: data.description || '',
    targetLocationName: data.targetLocationName || '',
    targetCharacterName: data.targetCharacterName || '',
    isSpoiler: data.isSpoiler || false,
    authorNotes: data.authorNotes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseSoundtrack = async (
  universeId: string,
  soundtrackId: string,
  data: Partial<UniverseSoundtrack>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'soundtracks', soundtrackId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseSoundtrack = async (
  universeId: string,
  soundtrackId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'soundtracks', soundtrackId));
};

// ─────────────────────────────────────────────────────────────────
// Seri Bible & Değişmez Evren Kuralları (PRD Bölüm 30)
// ─────────────────────────────────────────────────────────────────

export const getUniverseCanonRules = async (universeId: string): Promise<UniverseCanonRule[]> => {
  const coll = collection(db, 'universes', universeId, 'canonRules');
  const snap = await getDocs(coll);
  const items = snap.docs.map((d) => {
    const dData = d.data();
    return {
      id: d.id,
      universeId,
      ...dData,
      description: dData.description || dData.ruleDescription || '',
      spoilerChapterOrder: dData.spoilerChapterOrder ?? dData.spoilerThresholdChapter,
      spoilerThresholdChapter: dData.spoilerThresholdChapter ?? dData.spoilerChapterOrder,
    };
  }) as UniverseCanonRule[];

  return items.sort((a, b) => {
    if (a.isStrict !== b.isStrict) return a.isStrict ? -1 : 1;
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const createUniverseCanonRule = async (
  universeId: string,
  data: Partial<UniverseCanonRule>
): Promise<string> => {
  const newRef = doc(collection(db, 'universes', universeId, 'canonRules'));
  const id = newRef.id;
  const desc = data.description?.trim() || data.ruleDescription?.trim() || '';

  const item: Record<string, any> = {
    id,
    universeId,
    title: data.title?.trim() || 'İsimsiz Kural',
    category: data.category || 'magic_system',
    ruleDescription: desc,
    description: desc,
    consequences: data.consequences || '',
    exceptions: data.exceptions || '',
    affectedStories: data.affectedStories || [],
    isStrict: data.isStrict ?? true,
    isSpoiler: data.isSpoiler || false,
    isPublic: data.isPublic ?? true,
    authorNotes: data.authorNotes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const threshold = data.spoilerThresholdChapter ?? data.spoilerChapterOrder;
  if (threshold !== undefined) {
    item.spoilerThresholdChapter = threshold;
    item.spoilerChapterOrder = threshold;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseCanonRule = async (
  universeId: string,
  ruleId: string,
  data: Partial<UniverseCanonRule>
): Promise<void> => {
  const payload: any = { ...data };
  if (data.description || data.ruleDescription) {
    const desc = data.description || data.ruleDescription;
    payload.description = desc;
    payload.ruleDescription = desc;
  }
  if (data.spoilerChapterOrder !== undefined || data.spoilerThresholdChapter !== undefined) {
    const threshold = data.spoilerThresholdChapter ?? data.spoilerChapterOrder;
    payload.spoilerThresholdChapter = threshold;
    payload.spoilerChapterOrder = threshold;
  }
  await updateDoc(
    doc(db, 'universes', universeId, 'canonRules', ruleId),
    cleanFirestoreData({
      ...payload,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseCanonRule = async (
  universeId: string,
  ruleId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'canonRules', ruleId));
};

// ─────────────────────────────────────────────────────────────────
// Açık Kurgu Düğümleri, Gizemler & Çözülen Konular (PRD Bölüm 31)
// ─────────────────────────────────────────────────────────────────

export const getUniversePlotThreads = async (universeId: string): Promise<UniversePlotThread[]> => {
  const coll = collection(db, 'universes', universeId, 'plotThreads');
  const snap = await getDocs(coll);
  const items = snap.docs.map((d) => {
    const dData = d.data();
    return {
      id: d.id,
      universeId,
      ...dData,
      spoilerChapterOrder: dData.spoilerChapterOrder ?? dData.spoilerThresholdChapter,
      spoilerThresholdChapter: dData.spoilerThresholdChapter ?? dData.spoilerChapterOrder,
    };
  }) as UniversePlotThread[];

  return items.sort((a, b) => {
    const impOrder: Record<string, number> = { critical: 4, major: 3, minor: 2, side_mystery: 1 };
    const diff = (impOrder[b.importance] || 0) - (impOrder[a.importance] || 0);
    if (diff !== 0) return diff;
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const createUniversePlotThread = async (
  universeId: string,
  data: Partial<UniversePlotThread>
): Promise<string> => {
  const newRef = doc(collection(db, 'universes', universeId, 'plotThreads'));
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    title: data.title?.trim() || 'İsimsiz Kurgu Düğümü',
    description: data.description || '',
    status: data.status || 'open',
    importance: data.importance || 'major',
    introducedInStoryTitle: data.introducedInStoryTitle || '',
    introducedInChapterOrder: data.introducedInChapterOrder || null,
    resolvedInStoryTitle: data.resolvedInStoryTitle || '',
    resolvedInChapterOrder: data.resolvedInChapterOrder || null,
    resolutionSummary: data.resolutionSummary || '',
    clues: data.clues || [],
    relatedCharacterIds: data.relatedCharacterIds || [],
    relatedLocationIds: data.relatedLocationIds || [],
    isSpoiler: data.isSpoiler || false,
    isPublic: data.isPublic ?? false,
    authorNotes: data.authorNotes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const threshold = data.spoilerThresholdChapter ?? data.spoilerChapterOrder;
  if (threshold !== undefined) {
    item.spoilerThresholdChapter = threshold;
    item.spoilerChapterOrder = threshold;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniversePlotThread = async (
  universeId: string,
  threadId: string,
  data: Partial<UniversePlotThread>
): Promise<void> => {
  const payload: any = { ...data };
  if (data.spoilerChapterOrder !== undefined || data.spoilerThresholdChapter !== undefined) {
    const threshold = data.spoilerThresholdChapter ?? data.spoilerChapterOrder;
    payload.spoilerThresholdChapter = threshold;
    payload.spoilerChapterOrder = threshold;
  }
  await updateDoc(
    doc(db, 'universes', universeId, 'plotThreads', threadId),
    cleanFirestoreData({
      ...payload,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniversePlotThread = async (
  universeId: string,
  threadId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'plotThreads', threadId));
};

export const addPlotThreadClue = async (
  universeId: string,
  threadId: string,
  clue: { chapterOrder?: number; storyTitle?: string; note: string }
): Promise<void> => {
  const docRef = doc(db, 'universes', universeId, 'plotThreads', threadId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const current = (snap.data() as UniversePlotThread).clues || [];
  const newClue = {
    id: `clue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    chapterOrder: clue.chapterOrder || null,
    storyTitle: clue.storyTitle || '',
    note: clue.note.trim(),
    createdAt: Timestamp.now(),
  };

  await updateDoc(docRef, cleanFirestoreData({
    clues: [...current, newClue],
    status: 'clues_planted',
    updatedAt: serverTimestamp(),
  }));
};

// ─────────────────────────────────────────────────────────────────
// Mistik Sanatlar: Fal & Kehanet Sistemleri (Divination Systems)
// ─────────────────────────────────────────────────────────────────

export const getUniverseDivinations = async (universeId: string): Promise<UniverseDivinationSystem[]> => {
  const colRef = collection(db, 'universes', universeId, 'divinations');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseDivinationSystem[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseDivinationSystem));
  return list;
};

export const createUniverseDivination = async (
  universeId: string,
  data: Partial<UniverseDivinationSystem>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'divinations');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Fal / Kehanet Sistemi').trim(),
    type: data.type || 'tarot_cards',
    description: data.description || '',
    toolsAndMediums: data.toolsAndMediums || '',
    practitioners: data.practitioners || '',
    accuracyAndReliability: data.accuracyAndReliability || '',
    costsAndDangers: data.costsAndDangers || '',
    cardsOrSymbols: data.cardsOrSymbols || [],
    authorNotes: data.authorNotes || '',
    imageUrl: data.imageUrl || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseDivination = async (
  universeId: string,
  divinationId: string,
  data: Partial<UniverseDivinationSystem>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'divinations', divinationId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseDivination = async (
  universeId: string,
  divinationId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'divinations', divinationId));
};

// ─────────────────────────────────────────────────────────────────
// Mistik Sanatlar: Büyük Kehanetler (Prophecies)
// ─────────────────────────────────────────────────────────────────

export const getUniverseProphecies = async (universeId: string): Promise<UniverseProphecy[]> => {
  const colRef = collection(db, 'universes', universeId, 'prophecies');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseProphecy[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseProphecy));
  return list;
};

export const createUniverseProphecy = async (
  universeId: string,
  data: Partial<UniverseProphecy>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'prophecies');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    title: (data.title || 'İsimsiz Kehanet').trim(),
    prophecyText: data.prophecyText || '',
    divinationSystemId: data.divinationSystemId || '',
    divinationSystemName: data.divinationSystemName || '',
    seerName: data.seerName || '',
    targetSubject: data.targetSubject || '',
    status: data.status || 'pending',
    interpretation: data.interpretation || '',
    fulfillmentDetails: data.fulfillmentDetails || '',
    relatedCharacterIds: data.relatedCharacterIds || [],
    relatedLocationIds: data.relatedLocationIds || [],
    authorNotes: data.authorNotes || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseProphecy = async (
  universeId: string,
  prophecyId: string,
  data: Partial<UniverseProphecy>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'prophecies', prophecyId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseProphecy = async (
  universeId: string,
  prophecyId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'prophecies', prophecyId));
};

// ─────────────────────────────────────────────────────────────────
// Mistik Sanatlar: Büyü Kitabı (Grimoire / Spells)
// ─────────────────────────────────────────────────────────────────

export const getUniverseSpells = async (universeId: string): Promise<UniverseSpell[]> => {
  const colRef = collection(db, 'universes', universeId, 'spells');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseSpell[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseSpell));
  return list;
};

export const createUniverseSpell = async (
  universeId: string,
  data: Partial<UniverseSpell>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'spells');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Büyü').trim(),
    school: data.school || 'Elemental',
    tier: data.tier || 'novice',
    incantation: data.incantation || '',
    somaticGesture: data.somaticGesture || '',
    componentsAndMaterials: data.componentsAndMaterials || '',
    effects: data.effects || '',
    castingTime: data.castingTime || '',
    costsAndBackfire: data.costsAndBackfire || '',
    counterMagic: data.counterMagic || '',
    powerSystemId: data.powerSystemId || '',
    authorNotes: data.authorNotes || '',
    imageUrl: data.imageUrl || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseSpell = async (
  universeId: string,
  spellId: string,
  data: Partial<UniverseSpell>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'spells', spellId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseSpell = async (
  universeId: string,
  spellId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'spells', spellId));
};

// ─────────────────────────────────────────────────────────────────
// Mistik Sanatlar: Ritüeller, Ayinler & Lanetler (Rituals & Curses)
// ─────────────────────────────────────────────────────────────────

export const getUniverseRituals = async (universeId: string): Promise<UniverseRitual[]> => {
  const colRef = collection(db, 'universes', universeId, 'rituals');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const list: UniverseRitual[] = [];
  snap.forEach((d) => list.push(d.data() as UniverseRitual));
  return list;
};

export const createUniverseRitual = async (
  universeId: string,
  data: Partial<UniverseRitual>
): Promise<string> => {
  const colRef = collection(db, 'universes', universeId, 'rituals');
  const newRef = doc(colRef);
  const id = newRef.id;

  const item: Record<string, any> = {
    id,
    universeId,
    name: (data.name || 'İsimsiz Ritüel / Lanet').trim(),
    purpose: data.purpose || '',
    requiredConditions: data.requiredConditions || '',
    requiredSacrifices: data.requiredSacrifices || '',
    participants: data.participants || '',
    risksAndFailures: data.risksAndFailures || '',
    permanentEffects: data.permanentEffects || '',
    authorNotes: data.authorNotes || '',
    imageUrl: data.imageUrl || '',
    isSpoiler: data.isSpoiler || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.spoilerThresholdChapter !== undefined) {
    item.spoilerThresholdChapter = data.spoilerThresholdChapter;
  }

  await setDoc(newRef, cleanFirestoreData(item));
  return id;
};

export const updateUniverseRitual = async (
  universeId: string,
  ritualId: string,
  data: Partial<UniverseRitual>
): Promise<void> => {
  await updateDoc(
    doc(db, 'universes', universeId, 'rituals', ritualId),
    cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteUniverseRitual = async (
  universeId: string,
  ritualId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'universes', universeId, 'rituals', ritualId));
};




