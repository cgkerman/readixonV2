import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function GET(request: Request) {
  // 1. Cron Secret Kontrolü (Güvenlik için sadece Vercel veya yetkili kişiler çağırabilir)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = admin.firestore.Timestamp.now();
    
    // 2. Collection Group ile durumu 'scheduled' olan ve yayınlanma vakti gelmiş olan tüm chapter'ları bul
    const scheduledChaptersQuery = adminDb.collectionGroup('chapters')
      .where('status', '==', 'scheduled')
      .where('publishDate', '<=', now);
      
    const chaptersSnapshot = await scheduledChaptersQuery.get();

    if (chaptersSnapshot.empty) {
      return NextResponse.json({ message: 'Yayına alınacak planlı bölüm bulunamadı.' });
    }

    const batch = adminDb.batch();
    const notificationsToCreate: any[] = [];
    
    let publishedCount = 0;

    for (const chapterDoc of chaptersSnapshot.docs) {
      const chapterData = chapterDoc.data();
      const chapterRef = chapterDoc.ref;
      
      // chapterDoc.ref.path looks like: stories/storyId/chapters/chapterId
      const storyRef = chapterRef.parent.parent;
      if (!storyRef) continue;
      
      const storyId = storyRef.id;
      
      // Hikayeyi ve yazar bilgilerini al (bildirim için)
      const storySnap = await storyRef.get();
      if (!storySnap.exists) continue;
      const storyData = storySnap.data();
      
      if (!storyData?.authorId) continue;
      
      // Yazarın (author) bilgilerini al
      const authorSnap = await adminDb.collection('users').doc(storyData.authorId).get();
      if (!authorSnap.exists) continue;
      const authorData = authorSnap.data();

      // Durumu 'published' olarak güncelle
      batch.update(chapterRef, { status: 'published' });
      publishedCount++;

      // Takipçileri bulup bildirimlerini hazırla
      const followersQuery = await adminDb.collection('users').doc(storyData.authorId).collection('followers').get();
      const followerIds = followersQuery.docs.map(doc => doc.id);

      followerIds.forEach(followerId => {
        const notificationRef = adminDb.collection('notifications').doc();
        notificationsToCreate.push({
          ref: notificationRef,
          data: {
            notificationId: notificationRef.id,
            userId: followerId,
            actorId: storyData.authorId,
            actorName: authorData?.displayName || authorData?.username || 'Bir yazar',
            actorUsername: authorData?.username || '',
            actorAvatar: authorData?.avatarUrl || null,
            type: 'new_chapter',
            entityId: storyId,
            entityTitle: storyData.title,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }
        });
      });
    }

    // Bildirimleri batch'e ekle
    // Note: A Firestore batch can have up to 500 operations. If notificationsToCreate + publishedCount > 500,
    // this would need chunking. For MVP, we'll assume it's under 500 or just do it sequentially.
    
    // Chunking to 500 ops per batch
    let currentBatch = adminDb.batch();
    let opCount = 0;

    // We already added chapter updates to `batch` above, so let's just use regular promises for everything to avoid >500 batch limits easily.
    // Instead of using the first `batch`, let's just commit things safely.

    // Let's reset and do chunked batches:
    const allOperations = [];
    
    // Update chapters
    for (const chapterDoc of chaptersSnapshot.docs) {
      allOperations.push(() => chapterDoc.ref.update({ status: 'published' }));
    }
    
    // Create notifications
    for (const notif of notificationsToCreate) {
      allOperations.push(() => notif.ref.set(notif.data));
    }
    
    // Execute all operations (Firestore SDK handles multiple concurrent writes well)
    // We can do it in chunks of Promise.all
    const chunkSize = 100;
    for (let i = 0; i < allOperations.length; i += chunkSize) {
      const chunk = allOperations.slice(i, i + chunkSize);
      await Promise.all(chunk.map(op => op()));
    }

    return NextResponse.json({ 
      success: true, 
      publishedCount, 
      notificationsSent: notificationsToCreate.length 
    });

  } catch (error: any) {
    console.error('Error running publish cron:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
