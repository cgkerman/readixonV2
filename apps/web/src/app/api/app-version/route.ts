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
    latestVersion: '1.9',
    latestBuild: 3,
    minRequiredBuild: 1, // Build 1 (v1.0) can continue, but is strongly prompted to upgrade
    apkUrl: 'https://www.readixon.com/downloads/readixon.apk',
    releaseDate: '2026-10-12',
    title: 'Yeni Readixon Güncellemesi Mevcut!',
    description: 'En son yeniliklerden ve performans geliştirmelerinden faydalanmak için uygulamanızı güncelleyin.',
    releaseNotes: [
      'Kurgusal Evrenler ve Seri Kitaplar oluşturma ve ana sayfa keşfet vitrini',
      'Evren içi global hızlı arama ve kategorize gezinme (Cmd+K)',
      'Yazar Akademisi evren entegrasyonu ve hazır kurgu şablonları',
      'Gelişmiş evren yayın/taslak yönetimi ve kararlılık iyileştirmeleri'
    ],
    isMandatory: false,
  };

  return NextResponse.json(versionData, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
