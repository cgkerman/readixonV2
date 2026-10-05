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
    latestVersion: '1.1',
    latestBuild: 2,
    minRequiredBuild: 1, // Build 1 (v1.0) can continue, but is strongly prompted to upgrade
    apkUrl: 'https://www.readixon.com/downloads/readixon.apk',
    releaseDate: '2026-10-05',
    title: 'Yeni Readixon Güncellemesi Mevcut!',
    description: 'En son yeniliklerden ve performans geliştirmelerinden faydalanmak için uygulamanızı güncelleyin.',
    releaseNotes: [
      'Story ve okuma listesi kartlarını doğrudan cihaz galerisine kaydetme desteği',
      'Android 14+ yerleşik indirme yöneticisi entegrasyonu',
      'Akıcı paylaşım ve görsel oluşturma optimizasyonları',
      'Genel performans ve kararlılık geliştirmeleri'
    ],
    isMandatory: false,
  };

  return NextResponse.json(versionData, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
