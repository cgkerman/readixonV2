import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  serverTimestamp, 
  DocumentSnapshot,
  increment,
  writeBatch,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Readix, ReadixComment } from '../types';
import { createNotification } from './notificationService';
import { getUserProfile, getUserByUsername } from './userService';

const READIXES_COLLECTION = 'readixes';
const USERS_COLLECTION = 'users';

export async function createReadix(
  authorId: string,
  content: string,
  mediaUrls?: string[],
  linkedStoryId?: string,
  poll?: any,
  repostOfId?: string
): Promise<Readix> {
  const readixRef = doc(collection(db, READIXES_COLLECTION));
  
  // Extract tags (e.g. #book -> book)
  const tags = content.match(/#[\p{L}\d_]+/gu)?.map(tag => tag.slice(1).toLowerCase()) || [];
  
  // Extract mentions (e.g. @user -> user)
  const mentions = content.match(/@[\p{L}\d_]+/gu)?.map(mention => mention.slice(1)) || [];

  const newReadix = {
    id: readixRef.id,
    authorId,
    content,
    mediaUrls: mediaUrls || [],
    linkedStoryId: linkedStoryId || null,
    poll: poll || null,
    repostOfId: repostOfId || null,
    isPinned: false,
    tags,
    mentions,
    stats: {
      likes: 0,
      comments: 0,
      shares: 0,
      reposts: 0
    },
    createdAt: serverTimestamp()
  };

  const batch = writeBatch(db);
  batch.set(readixRef, newReadix);

  // Update tag counts in the 'tags' collection
  tags.forEach(tagId => {
    const tagRef = doc(db, 'tags', tagId);
    batch.set(tagRef, {
      id: tagId,
      count: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();

  // Send notifications to mentioned users (after batch commit, in background)
  if (mentions.length > 0) {
    const sender = await getUserProfile(authorId);
    if (sender) {
      Promise.all(mentions.map(async (username) => {
        const user = await getUserByUsername(username);
        if (user && user.uid !== authorId) {
          await createNotification({
            userId: user.uid,
            actorId: authorId,
            actorName: sender.displayName,
            type: 'readix_mention',
            entityId: readixRef.id,
            actorAvatar: sender.avatarUrl,
            actorUsername: sender.username
          });
        }
      })).catch(err => console.error("Mention notifications failed:", err));
    }
  }
  
  return {
    ...newReadix,
    createdAt: { toDate: () => new Date() } as any // Temporary mock timestamp for client
  } as Readix;
}

export async function searchTags(prefix: string): Promise<{id: string, count: number}[]> {
  const term = prefix.trim().toLowerCase();
  if (!term) return [];

  try {
    const q = query(
      collection(db, 'tags'),
      where('id', '>=', term),
      where('id', '<=', term + '\uf8ff'),
      limit(5)
    );
    const snap = await getDocs(q);
    const tags = snap.docs.map(doc => doc.data() as {id: string, count: number});
    // Sort by count descending since we can't orderBy count and filter by id simultaneously
    return tags.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Etiket arama hatası:", error);
    return [];
  }
}

export async function getReadixById(readixId: string): Promise<Readix | null> {
  try {
    const docRef = doc(db, READIXES_COLLECTION, readixId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...snap.data() } as Readix;
  } catch (error) {
    console.error("Readix detayı çekilirken hata:", error);
    return null;
  }
}

export async function populateReposts(readixes: Readix[]): Promise<Readix[]> {
  const repostIds = [...new Set(readixes.filter(r => r.repostOfId).map(r => r.repostOfId!))];
  if (repostIds.length === 0) return readixes;

  const originalMap: Record<string, Readix> = {};
  await Promise.all(repostIds.map(async (id) => {
    const original = await getReadixById(id);
    if (original) originalMap[id] = original;
  }));

  return readixes.map(r => {
    if (r.repostOfId && originalMap[r.repostOfId]) {
      return { ...r, originalReadix: originalMap[r.repostOfId] };
    }
    return r;
  });
}

export async function getMentionedReadixes(
  username: string,
  limitCount = 20,
  startAfterDoc?: DocumentSnapshot,
  blockedUsers?: string[]
): Promise<{ readixes: Readix[], lastVisible: DocumentSnapshot | null }> {
  try {
    let q = query(
      collection(db, READIXES_COLLECTION),
      where('mentions', 'array-contains', username),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snap = await getDocs(q);
    
    let readixes = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Readix));

    readixes = await populateReposts(readixes);

    // Filter blocked users
    const filteredReadixes = blockedUsers && blockedUsers.length > 0
      ? readixes.filter(r => !blockedUsers.includes(r.authorId))
      : readixes;

    const lastVisible = snap.docs.length === limitCount ? snap.docs[snap.docs.length - 1] : null;

    return { readixes: filteredReadixes, lastVisible };
  } catch (error) {
    console.error("Bahsedilen readix'ler çekilirken hata:", error);
    return { readixes: [], lastVisible: null };
  }
}


export async function getForYouReadixes(
  pageSize = 10,
  lastDoc?: DocumentSnapshot,
  blockedUsers?: string[]
) {
  let q = query(
    collection(db, READIXES_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  let readixes = snapshot.docs.map(doc => doc.data() as Readix);
  
  readixes = await populateReposts(readixes);
  
  if (blockedUsers && blockedUsers.length > 0) {
    readixes = readixes.filter(r => !blockedUsers.includes(r.authorId));
  }
  
  return {
    readixes,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize
  };
}

export async function getFollowingReadixes(
  currentUserId: string,
  pageSize = 10,
  lastDoc?: DocumentSnapshot,
  blockedUsers?: string[]
) {
  // 1. Get the list of users the current user follows
  const followingSnapshot = await getDocs(
    collection(db, `${USERS_COLLECTION}/${currentUserId}/following`)
  );
  
  const followingIds = followingSnapshot.docs.map(doc => doc.id);
  
  if (followingIds.length === 0) {
    return { readixes: [], lastDoc: null, hasMore: false };
  }

  // Firestore 'in' query allows max 30 elements
  const idsToQuery = followingIds.slice(0, 30);

  let q = query(
    collection(db, READIXES_COLLECTION),
    where('authorId', 'in', idsToQuery),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  let readixes = snapshot.docs.map(doc => doc.data() as Readix);

  readixes = await populateReposts(readixes);

  if (blockedUsers && blockedUsers.length > 0) {
    readixes = readixes.filter(r => !blockedUsers.includes(r.authorId));
  }

  return {
    readixes,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize
  };
}

export async function checkHasLikedReadix(userId: string, readixId: string): Promise<boolean> {
  const likeRef = doc(db, `${READIXES_COLLECTION}/${readixId}/likes`, userId);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

export async function toggleReadixLike(userId: string, readixId: string): Promise<boolean> {
  const likeRef = doc(db, `${READIXES_COLLECTION}/${readixId}/likes`, userId);
  const readixRef = doc(db, READIXES_COLLECTION, readixId);
  const snap = await getDoc(likeRef);
  
  const batch = writeBatch(db);

  if (snap.exists()) {
    // Unlike
    batch.delete(likeRef);
    batch.update(readixRef, {
      'stats.likes': increment(-1)
    });
    await batch.commit();
    return false;
  } else {
    // Like
    batch.set(likeRef, { createdAt: serverTimestamp() });
    batch.update(readixRef, {
      'stats.likes': increment(1)
    });
    await batch.commit();

    // Bildirim gönder
    try {
      const readixSnap = await getDoc(readixRef);
      const userProfile = await getUserProfile(userId);
      
      if (readixSnap.exists() && userProfile) {
        const readixData = readixSnap.data();
        await createNotification({
          userId: readixData.authorId,
          actorId: userId,
          actorName: userProfile.displayName,
          actorAvatar: userProfile.avatarUrl,
          actorUsername: userProfile.username,
          type: 'readix_like',
          entityId: readixId,
          entityTitle: readixData.content.substring(0, 30) + (readixData.content.length > 30 ? '...' : '')
        });
      }
    } catch (notifError) {
      console.error("Readix beğeni bildirimi gönderilirken hata:", notifError);
    }

    return true;
  }
}

export async function getReadixesByTag(
  tag: string,
  pageSize = 10,
  lastDoc?: DocumentSnapshot,
  blockedUsers?: string[]
) {
  let q = query(
    collection(db, READIXES_COLLECTION),
    where('tags', 'array-contains', tag.toLowerCase()),
    orderBy('stats.likes', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  let readixes = snapshot.docs.map(doc => doc.data() as Readix);

  readixes = await populateReposts(readixes);

  if (blockedUsers && blockedUsers.length > 0) {
    readixes = readixes.filter(r => !blockedUsers.includes(r.authorId));
  }

  return {
    readixes,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize
  };
}

export async function getUserReadixes(
  userId: string,
  pageSize = 10,
  lastDoc?: DocumentSnapshot
) {
  let q = query(
    collection(db, READIXES_COLLECTION),
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  let readixes = snapshot.docs.map(doc => doc.data() as Readix);

  readixes = await populateReposts(readixes);

  return {
    readixes,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize
  };
}

export async function addReadixComment(
  readixId: string,
  authorId: string,
  content: string,
  replyToId?: string
) {
  const readixRef = doc(db, READIXES_COLLECTION, readixId);
  const commentRef = doc(collection(db, `${READIXES_COLLECTION}/${readixId}/comments`));
  
  const newComment = {
    id: commentRef.id,
    readixId,
    authorId,
    content,
    likes: 0,
    replyToId: replyToId || null,
    createdAt: serverTimestamp()
  };

  const batch = writeBatch(db);
  batch.set(commentRef, newComment);
  batch.update(readixRef, {
    'stats.comments': increment(1)
  });

  await batch.commit();

  // Bildirim gönder
  try {
    const readixSnap = await getDoc(readixRef);
    const userProfile = await getUserProfile(authorId);
    
    if (readixSnap.exists() && userProfile) {
      const readixData = readixSnap.data();
      
      // Eğer bir yoruma yanıt ise o yorumun sahibini de bulabiliriz, ancak şimdilik gönderi sahibine bildirim gidiyor
      // veya hem gönderi hem yorum sahibine gidebilir. Biz şimdilik gönderi sahibine gönderelim.
      await createNotification({
        userId: readixData.authorId,
        actorId: authorId,
        actorName: userProfile.displayName,
        actorAvatar: userProfile.avatarUrl,
        actorUsername: userProfile.username,
        type: 'readix_comment',
        entityId: readixId,
        entityTitle: readixData.content.substring(0, 30) + (readixData.content.length > 30 ? '...' : '')
      });
    }
  } catch (notifError) {
    console.error("Readix yorum bildirimi gönderilirken hata:", notifError);
  }

  return {
    ...newComment,
    replyToId: newComment.replyToId || undefined,
    createdAt: { toDate: () => new Date() } as any
  } as unknown as ReadixComment;
}

export async function getReadixComments(
  readixId: string,
  pageSize = 20,
  lastDoc?: DocumentSnapshot
) {
  let q = query(
    collection(db, `${READIXES_COLLECTION}/${readixId}/comments`),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map(doc => doc.data() as ReadixComment);

  return {
    comments,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize
  };
}

export async function toggleReadixCommentLike(userId: string, readixId: string, commentId: string): Promise<boolean> {
  const likeRef = doc(db, `${READIXES_COLLECTION}/${readixId}/comments/${commentId}/likes`, userId);
  const commentRef = doc(db, `${READIXES_COLLECTION}/${readixId}/comments`, commentId);
  
  const likeDoc = await getDoc(likeRef);
  const batch = writeBatch(db);

  if (likeDoc.exists()) {
    // Unlike
    batch.delete(likeRef);
    batch.update(commentRef, {
      likes: increment(-1)
    });
    await batch.commit();
    return false; // Artık beğenmiyor
  } else {
    // Like
    batch.set(likeRef, {
      userId,
      createdAt: serverTimestamp()
    });
    batch.update(commentRef, {
      likes: increment(1)
    });
    await batch.commit();
    return true; // Beğenildi
  }
}

// ─────────────────────────────────────────────
// Düzenleme ve Silme
// ─────────────────────────────────────────────

export async function updateReadix(readixId: string, newContent: string, newMediaUrls?: string[]): Promise<void> {
  const readixRef = doc(db, READIXES_COLLECTION, readixId);
  
  const tags = newContent.match(/#[\p{L}\d_]+/gu)?.map(tag => tag.slice(1).toLowerCase()) || [];
  const mentions = newContent.match(/@[\p{L}\d_]+/gu)?.map(mention => mention.slice(1)) || [];
  
  const updateData: any = {
    content: newContent,
    tags,
    mentions
  };
  
  if (newMediaUrls) {
    updateData.mediaUrls = newMediaUrls;
  }
  
  await updateDoc(readixRef, updateData);
}

export async function deleteReadix(readixId: string): Promise<void> {
  const readixRef = doc(db, READIXES_COLLECTION, readixId);
  await deleteDoc(readixRef);
}

export async function toggleReadixPin(readixId: string, currentPinStatus: boolean): Promise<boolean> {
  const readixRef = doc(db, READIXES_COLLECTION, readixId);
  await updateDoc(readixRef, {
    isPinned: !currentPinStatus
  });
  return !currentPinStatus;
}
