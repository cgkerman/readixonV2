import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

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

    let userRecord;
    try {
      userRecord = await adminAuth.getUser(params.id);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        return NextResponse.json({ email: null });
      }
      throw e;
    }
    
    return NextResponse.json({ email: userRecord.email || null });
  } catch (error: any) {
    console.error('Error fetching user email:', error);
    
    // Add detailed diagnostics to the error response
    const diagnostics = {
      errorMessage: error.message,
      errorCode: error.code,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
    };
    
    return NextResponse.json({ error: error.message, diagnostics }, { status: 500 });
  }
}
