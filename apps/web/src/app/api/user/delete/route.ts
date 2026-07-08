import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export async function DELETE(request: Request) {
  try {
    // 1. Yetkilendirme kontrolü
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Token bulunamadı.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // 2. Token'ı doğrula ve UID'yi al
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!uid) {
      return NextResponse.json({ error: 'Geçersiz token.' }, { status: 401 });
    }

    const batch = adminDb.batch();

    // 3. Kullanıcının Readix'lerini bul ve sil
    const readixesQuery = await adminDb.collection('readixes').where('authorId', '==', uid).get();
    readixesQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // 4. Kullanıcının Hikayelerini ve Bölümlerini bul ve sil
    const storiesQuery = await adminDb.collection('stories').where('authorId', '==', uid).get();
    for (const storyDoc of storiesQuery.docs) {
      batch.delete(storyDoc.ref);
      
      // Hikayenin bölümlerini de sil
      const chaptersQuery = await adminDb.collection('stories').doc(storyDoc.id).collection('chapters').get();
      chaptersQuery.docs.forEach(chapterDoc => {
        batch.delete(chapterDoc.ref);
      });
    }

    // 5. Kullanıcının Profil Dokümanını Sil
    const userRef = adminDb.collection('users').doc(uid);
    batch.delete(userRef);

    // Tüm Firestore silme işlemlerini uygula
    await batch.commit();

    // 6. Firebase Auth'dan kullanıcıyı sil
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true, message: 'Hesap başarıyla silindi.' });

  } catch (error) {
    console.error('Hesap silme işlemi başarısız (API):', error);
    return NextResponse.json({ 
      error: 'Hesap silinirken bir hata oluştu.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
