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

    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);

    // Token'ı kullanıcının fcmTokens dizisine tekil olarak ekle
    await userDocRef.set(
      {
        fcmTokens: FieldValue.arrayUnion(token.trim()),
        lastFcmRegisteredAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`[FCM API] Token successfully registered for user: ${userId}`);
    return NextResponse.json({ success: true, message: 'FCM token registered successfully' });
  } catch (error: any) {
    console.error('[FCM API] Register token error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register FCM token' },
      { status: 500 }
    );
  }
}
