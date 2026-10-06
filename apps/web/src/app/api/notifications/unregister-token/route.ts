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
    const userDocRef = adminDb.collection('users').doc(userId);

    await userDocRef.update({
      fcmTokens: FieldValue.arrayRemove(cleanToken),
    });

    console.log(`[FCM API] Token kullanıcıdan kaldırıldı: ${userId}`);
    return NextResponse.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error: any) {
    console.error('[FCM API] Unregister token error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unregister FCM token' },
      { status: 500 }
    );
  }
}
