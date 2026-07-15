import { doc, collection, setDoc, deleteDoc, getDoc, updateDoc, increment, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Comment } from '../types';
import { createNotification } from './notificationService';
import { getUserProfile } from './userService';

/**
 * Hikayenin görüntülenme sayısını artırır.
 */
export const incrementStoryView = async (storyId: string) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      'stats.views': increment(1)
    });
  } catch (error) {
    console.error("Hikaye görüntülenme sayısı artırılamadı:", error);
  }
};

/**
 * Bölümün (ve dolaylı olarak hikayenin) görüntülenme sayısını artırır.
 */
export const incrementChapterView = async (storyId: string, chapterId: string) => {
  try {
    const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    await updateDoc(chapterRef, {
      'stats.views': increment(1)
    });
    // Hikaye view sayısını da artıralım
    await incrementStoryView(storyId);
  } catch (error) {
    console.error("Bölüm görüntülenme sayısı artırılamadı:", error);
  }
};

/**
 * Hikayeyi beğenip/beğenmekten vazgeçme (Toggle).
 * Kullanıcının like durumu `stories/{storyId}/likes/{userId}` altında tutulur.
 * Return: Yeni like durumu (true: beğenildi, false: geri alındı)
 */
export const toggleStoryLike = async (storyId: string, userId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'stories', storyId, 'likes', userId);
    const likeSnap = await getDoc(likeRef);
    const storyRef = doc(db, 'stories', storyId);

    if (likeSnap.exists()) {
      // Zaten beğenilmiş, geri al
      await deleteDoc(likeRef);
      await updateDoc(storyRef, {
        'stats.likes': increment(-1)
      });
      return false;
    } else {
      // Beğen
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(storyRef, {
        'stats.likes': increment(1)
      });
      
      // Bildirim gönder
      try {
        const storySnap = await getDoc(storyRef);
        const userProfile = await getUserProfile(userId);
        
        if (storySnap.exists() && userProfile) {
          const storyData = storySnap.data();
          await createNotification({
            userId: storyData.authorId,
            actorId: userId,
            actorName: userProfile.displayName,
            actorAvatar: userProfile.avatarUrl,
            actorUsername: userProfile.username,
            type: 'story_like',
            entityId: storyId,
            entityTitle: storyData.title
          });
        }
      } catch (notifError) {
        console.error("Beğeni bildirimi gönderilirken hata:", notifError);
      }

      return true;
    }
  } catch (error) {
    console.error("Hikaye beğeni işlemi başarısız:", error);
    throw error;
  }
};

/**
 * Kullanıcının hikayeyi beğenip beğenmediğini kontrol eder.
 */
export const checkStoryLiked = async (storyId: string, userId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'stories', storyId, 'likes', userId);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch (error) {
    return false;
  }
};

/**
 * Bölümü beğenip/beğenmekten vazgeçme (Toggle).
 * `stories/{storyId}/chapters/{chapterId}/likes/{userId}`
 * Bölüm beğenilince Hikayenin toplam beğenisini de artırıyoruz.
 */
export const toggleChapterLike = async (storyId: string, chapterId: string, userId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'stories', storyId, 'chapters', chapterId, 'likes', userId);
    const likeSnap = await getDoc(likeRef);
    const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    const storyRef = doc(db, 'stories', storyId);

    if (likeSnap.exists()) {
      // Geri al
      await deleteDoc(likeRef);
      await updateDoc(chapterRef, {
        'stats.likes': increment(-1)
      });
      await updateDoc(storyRef, {
        'stats.likes': increment(-1)
      });
      return false;
    } else {
      // Beğen
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(chapterRef, {
        'stats.likes': increment(1)
      });
      await updateDoc(storyRef, {
        'stats.likes': increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error("Bölüm beğeni işlemi başarısız:", error);
    throw error;
  }
};

/**
 * Kullanıcının bölümü beğenip beğenmediğini kontrol eder.
 */
export const checkChapterLiked = async (storyId: string, chapterId: string, userId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'stories', storyId, 'chapters', chapterId, 'likes', userId);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch (error) {
    return false;
  }
};

/**
 * Bölüm sonuna yorum (tartışma) ekler.
 */
export const addChapterComment = async (
  storyId: string, 
  chapterId: string, 
  userId: string, 
  text: string,
  type: 'chapter' | 'paragraph' = 'chapter',
  paragraphIndex: number = -1
): Promise<Comment> => {
  try {
    const userProfile = await getUserProfile(userId);
    const commentRef = doc(collection(db, 'stories', storyId, 'chapters', chapterId, 'comments'));
    const newComment: Comment = {
      commentId: commentRef.id,
      storyId,
      chapterId,
      userId,
      authorName: userProfile?.displayName,
      authorUsername: userProfile?.username,
      authorAvatarUrl: userProfile?.avatarUrl,
      text,
      type,
      paragraphIndex,
      createdAt: serverTimestamp() as any,
    };
    await setDoc(commentRef, newComment);
    
    // update chapter comment count
    const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    await updateDoc(chapterRef, {
      'stats.commentCount': increment(1)
    });

    // update story comment count
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      'stats.commentCount': increment(1)
    });

    // Bildirim gönder
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storySnap = await getDoc(storyRef);
      const chapterSnap = await getDoc(chapterRef); // Fetch chapter to get title
      const userProfile = await getUserProfile(userId);
      
      if (storySnap.exists() && userProfile) {
        const storyData = storySnap.data();
        const chapterData = chapterSnap.exists() ? chapterSnap.data() : null;
        
        await createNotification({
          userId: storyData.authorId,
          actorId: userId,
          actorName: userProfile.displayName,
          actorAvatar: userProfile.avatarUrl,
          actorUsername: userProfile.username,
          type: type === 'paragraph' ? 'paragraph_comment' : 'story_comment',
          entityId: storyId,
          entityTitle: storyData.title,
          subEntityId: chapterId,
          subEntityTitle: chapterData?.title || `Bölüm ${chapterData?.order || ''}`.trim()
        });
      }
    } catch (notifError) {
      console.error("Yorum bildirimi gönderilirken hata:", notifError);
    }

    return newComment;
  } catch (error) {
    console.error("Yorum ekleme başarısız:", error);
    throw error;
  }
};

/**
 * Bölüme ait tüm genel (chapter level) yorumları çeker.
 */
export const getChapterComments = async (storyId: string, chapterId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'stories', storyId, 'chapters', chapterId, 'comments'),
      where('type', '==', 'chapter'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const comments: Comment[] = [];
    snap.forEach((docSnap) => {
      comments.push({ ...docSnap.data(), commentId: docSnap.id } as Comment);
    });
    return comments;
  } catch (error) {
    console.error("Yorumları çekerken hata:", error);
    return [];
  }
};

/**
 * Bölüme ait tüm yorumları (genel ve paragraf) çeker.
 */
export const getAllChapterComments = async (storyId: string, chapterId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'stories', storyId, 'chapters', chapterId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const comments: Comment[] = [];
    snap.forEach((docSnap) => {
      comments.push({ ...docSnap.data(), commentId: docSnap.id } as Comment);
    });
    return comments;
  } catch (error) {
    console.error("Tüm yorumları çekerken hata:", error);
    return [];
  }
};
