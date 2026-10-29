import { NextRequest, NextResponse } from 'next/server';

// Ana platform için rezerve edilmiş alt alan adları (bu isimler yazar sitesi olarak algılanmaz)
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'admin',
  'studio',
  'feed',
  'mail',
  'dev',
  'staging',
  'status',
  'docs',
  'cdn',
]);

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Statik dosyaları, Next.js dahili bundle dosyalarını ve API çağrılarını atla
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/downloads') ||
    url.pathname.startsWith('/fonts') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.startsWith('/images') ||
    url.pathname.includes('.') // (.ico, .png, .jpg, .svg, .json vb.)
  ) {
    return NextResponse.next();
  }

  // 2. Hostname'den subdomain'i ayrıştır
  // Port temizliği (örn: "ahmet.localhost:3000" -> "ahmet.localhost")
  const currentHost = hostname.split(':')[0].toLowerCase();
  let subdomain = '';

  if (currentHost.endsWith('.readixon.com')) {
    subdomain = currentHost.replace('.readixon.com', '').trim();
  } else if (currentHost.endsWith('.localhost')) {
    subdomain = currentHost.replace('.localhost', '').trim();
  }

  // 3. Subdomain yoksa veya rezerve edilmiş bir platform adresi ise normal akışa devam et
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.next();
  }

  // 4. Eğer zaten /atelier yoluna gidiyorsa döngüyü engelle
  if (url.pathname.startsWith('/atelier')) {
    return NextResponse.next();
  }

  // 5. Yazar alt alan adı tespit edildi -> Arka planda /atelier/@subdomain sayfasına Rewrite et
  // Örn: ahmet.readixon.com -> /atelier/@ahmet
  // Örn: ahmet.readixon.com/books -> /atelier/@ahmet (veya alt yol)
  const targetPath = `/atelier/@${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
  const rewriteUrl = new URL(targetPath, req.url);

  // Orijinal subdomain bilgisini downstream bileşenlerin okuyabilmesi için header'a ekle
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-atelier-subdomain', subdomain);

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Bütün sayfa rotalarını yakalar, statik dosyaları hariç tutar.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

