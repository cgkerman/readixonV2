import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Token bulunamadı.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Admin yetki kontrolü
    const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!adminDoc.exists || !adminDoc.data()?.isAdmin) {
      return NextResponse.json({ error: 'Sadece adminler bu veriyi görebilir.' }, { status: 403 });
    }

    const userRecord = await adminAuth.getUser(params.id);
    
    return NextResponse.json({ email: userRecord.email || null });
  } catch (error: any) {
    console.error('Error fetching user email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
