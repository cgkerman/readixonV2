import { NextRequest, NextResponse } from 'next/server';

// Geçici indirme önbelleği (5 dakika süreli)
const downloadCache = new Map<string, { buffer: Buffer; fileName: string; expires: number }>();

// Periyodik temizleme
function cleanExpired() {
  const now = Date.now();
  for (const [key, item] of downloadCache.entries()) {
    if (item.expires < now) {
      downloadCache.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanExpired();
    const formData = await req.formData();
    const base64Data = formData.get('image') as string;
    const rawFileName = (formData.get('fileName') as string) || 'readixon-story.png';
    const fileName = rawFileName.endsWith('.png') ? rawFileName : `${rawFileName}.png`;
    const format = req.nextUrl.searchParams.get('format') || formData.get('format') as string;

    if (!base64Data) {
      return new NextResponse('Görsel verisi eksik', { status: 400 });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Eğer istemci JSON formatında indirme bağlantısı istiyorsa (Mobil tarayıcı / WebView için)
    if (format === 'json') {
      const id = Math.random().toString(36).substring(2, 10);
      downloadCache.set(id, {
        buffer,
        fileName,
        expires: Date.now() + 5 * 60 * 1000,
      });

      const host = req.headers.get('host') || 'www.readixon.com';
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const downloadUrl = `${protocol}://${host}/api/download?id=${id}`;

      return NextResponse.json({
        success: true,
        id,
        downloadUrl,
      });
    }

    // Doğrudan ikili dosya akışı
    return new NextResponse(new Uint8Array(buffer), {
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

export async function GET(req: NextRequest) {
  try {
    cleanExpired();
    const id = req.nextUrl.searchParams.get('id');
    if (!id || !downloadCache.has(id)) {
      return new NextResponse('İndirme bağlantısının süresi dolmuş veya dosya bulunamadı.', { status: 404 });
    }

    const item = downloadCache.get(id)!;
    return new NextResponse(new Uint8Array(item.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${item.fileName}"; filename*=UTF-8''${encodeURIComponent(item.fileName)}`,
        'Content-Length': item.buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download API GET error:', error);
    return new NextResponse('İndirme hatası', { status: 500 });
  }
}
