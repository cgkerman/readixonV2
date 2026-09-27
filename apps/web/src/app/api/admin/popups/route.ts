import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { adminDb } = await import('@/lib/firebaseAdmin');
    const snapshot = await adminDb.collection('site_popups').orderBy('createdAt', 'desc').get();
    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : doc.data().updatedAt,
      expireAt: doc.data().expireAt?.toDate ? doc.data().expireAt.toDate().toISOString() : doc.data().expireAt,
    }));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API /api/admin/popups GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminDb } = await import('@/lib/firebaseAdmin');
    const { FieldValue } = await import('firebase-admin/firestore');

    const newDocRef = adminDb.collection('site_popups').doc();
    const payload = {
      ...body,
      id: newDocRef.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.expireAt) {
      payload.expireAt = new Date(body.expireAt);
    }

    await newDocRef.set(payload);

    return NextResponse.json({ success: true, id: newDocRef.id });
  } catch (error: any) {
    console.error('API /api/admin/popups POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur' }, { status: 400 });
    }

    const { adminDb } = await import('@/lib/firebaseAdmin');
    const { FieldValue } = await import('firebase-admin/firestore');

    const payload: any = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.expireAt) {
      payload.expireAt = new Date(data.expireAt);
    }

    await adminDb.collection('site_popups').doc(id).update(payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /api/admin/popups PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur' }, { status: 400 });
    }

    const { adminDb } = await import('@/lib/firebaseAdmin');
    const { FieldValue } = await import('firebase-admin/firestore');

    await adminDb.collection('site_popups').doc(id).update({
      isActive: Boolean(isActive),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /api/admin/popups PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur' }, { status: 400 });
    }

    const { adminDb } = await import('@/lib/firebaseAdmin');
    await adminDb.collection('site_popups').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /api/admin/popups DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
