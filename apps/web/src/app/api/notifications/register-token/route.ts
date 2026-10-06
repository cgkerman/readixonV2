import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'userId and token (string) are required' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const adminDb = getAdminDb();

    // 1. Cihaz Token'ını Tekilleştir:
    // Eğer bu telefon daha önce başka bir hesapla (örneğin test hesabı) kullanıldıysa,
    // o hesabın bildirimleri bu telefona düşmesin diye token'ı diğer tüm kullanıcılardan sil!
    try {
      const conflictingUsersSnap = await adminDb
        .collection('users')
        .where('fcmTokens', 'array-contains', cleanToken)
        .get();

      if (!conflictingUsersSnap.empty) {
        const batch = adminDb.batch();
        let cleanedCount = 0;

        conflictingUsersSnap.forEach((docSnap) => {
          if (docSnap.id !== userId) {
            batch.update(docSnap.ref, {
              fcmTokens: FieldValue.arrayRemove(cleanToken),
            });
            cleanedCount++;
          }
        });

        if (cleanedCount > 0) {
          await batch.commit();
          console.log(`[FCM API] Token ${cleanedCount} eski hesaptan temizlendi.`);
        }
      }
    } catch (cleanupErr) {
      console.warn('[FCM API] Eski hesap token temizleme uyarısı:', cleanupErr);
    }

    // 2. Token'ı yalnızca mevcut kullanıcının fcmTokens dizisine ekle
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.set(
      {
        fcmTokens: FieldValue.arrayUnion(cleanToken),
        lastFcmRegisteredAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`[FCM API] Token başarıyla kaydedildi. Kullanıcı: ${userId}`);
    return NextResponse.json({ success: true, message: 'FCM token registered successfully' });
  } catch (error: any) {
    console.error('[FCM API] Register token error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register FCM token' },
      { status: 500 }
    );
  }
}
