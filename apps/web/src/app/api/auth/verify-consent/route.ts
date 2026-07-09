import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli.' },
        { status: 400 }
      );
    }

    // E-posta adresinden kullanıcıyı bul
    const userRecord = await adminAuth.getUserByEmail(email);

    // Kullanıcının Firestore'daki dokümanını güncelle (legalConsentAcceptedAt ekle)
    const userRef = adminDb.collection('users').doc(userRecord.uid);
    await userRef.update({
      legalConsentAcceptedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Yasal onay kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Yasal onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
