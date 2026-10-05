import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const base64Data = formData.get('image') as string;
    const rawFileName = (formData.get('fileName') as string) || 'readixon-story.png';
    const fileName = rawFileName.endsWith('.png') ? rawFileName : `${rawFileName}.png`;

    if (!base64Data) {
      return new NextResponse('Görsel verisi eksik', { status: 400 });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return new NextResponse('İndirme hatası oluştu', { status: 500 });
  }
}
