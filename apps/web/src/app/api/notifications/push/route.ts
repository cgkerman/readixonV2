import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/pushSender';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, body: content, route, data } = body;

    if (!userId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields (userId, title, body)' }, { status: 400 });
    }

    const result = await sendPushNotification({
      userId,
      title,
      body: content,
      route,
      data,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('API /api/notifications/push error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
