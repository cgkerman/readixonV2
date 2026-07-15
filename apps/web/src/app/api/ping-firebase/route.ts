import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    return NextResponse.json({ 
      ping: 'firebase_pong',
      hasDb: !!adminDb,
      hasAuth: !!adminAuth 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Firebase init failed', 
      message: error.message 
    }, { status: 500 });
  }
}
