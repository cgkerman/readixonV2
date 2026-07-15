import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ping: 'auth_pong', type: typeof getAuth });
}
