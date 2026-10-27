import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface AppVersionResponse {
  latestVersion: string;
  latestBuild: number;
  minRequiredBuild: number;
  apkUrl: string;
  releaseDate: string;
  title: string;
  description: string;
  releaseNotes: string[];
  isMandatory: boolean;
}

export async function GET() {
  const versionData: AppVersionResponse = {
    latestVersion: '2.8',
    latestBuild: 4,
    minRequiredBuild: 1, // Build 1 (v1.0) can continue, but is strongly prompted to upgrade
    apkUrl: 'https://www.readixon.com/downloads/readixon.apk',
    releaseDate: '2026-10-27',
    title: 'Yeni Readixon Güncellemesi Mevcut (v2.8)!',
    description: 'Bölümleri Word (.docx) olarak indirme, Readixon Gündem köşe yazarlığı ve yeni yazar araçlarından faydalanmak için uygulamanızı güncelleyin.',
    releaseNotes: [
      'Yazar Stüdyosu: Bölümleri yapısı bozulmadan Word (.docx) olarak indirme ve paylaşma',
      'Readixon Gündem: Köşe Yazarlığı ekosistemi, 4 adımlı yazar başvurusu ve yayın yönetimi',
      'Mesaj Hikayeleri: 0.25x, 0.50x ve 0.75x erişilebilir yavaş okuma hızları',
      'Keşfet Vitrini ve sayfa geçişlerindeki scroll sıfırlama optimizasyonları'
    ],
    isMandatory: false,
  };

  return NextResponse.json(versionData, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
