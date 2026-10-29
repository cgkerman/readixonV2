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
    latestVersion: '3.0.0',
    latestBuild: 3, // Mevcut derlenmiş Android APK'nın sürüm kodu 3 olduğu için 3 tutulur, sonsuz döngü önlenir
    minRequiredBuild: 1, // Build 1 (v1.0) ve üzeri çalışmaya devam edebilir
    apkUrl: 'https://www.readixon.com/downloads/readixon.apk',
    releaseDate: '2026-10-29',
    title: 'Readixon v3.0.0 Atelier Yayında!',
    description: 'Kişisel yazar web sitesi motoru Atelier, prestij şablonları, gündüz/gece modu ve yeni nesil yazar araçları Readixon v3.0 ile sizlerle.',
    releaseNotes: [
      'Readixon Atelier: Yazarlar için sıfır kodla 2 dakikada bağımsız kişisel web sitesi kurma motoru (/studio/atelier)',
      '4 Prestij Tasarım Şablonu: The Novelist, The Worldbuilder, The Webtoon & Pop ve The Minimalist',
      'Gündüz / Gece / Sepya / OLED Modu: Ziyaretçilerin ve yazarların tek dokunuşla geçiş yapabildiği edebi renk motoru',
      'Eserler Vitrini & 3D Kitap Kapakları: Otomatik kitap senkronizasyonu ve tek tıkla doğrudan okuma bağlantısı',
      'Evren Stüdyosu Canlı Entegrasyonu: İnteraktif dünya haritası ve karakter codex vitrini',
      'Edebi Bülten & Hayran Aboneliği ve Spotify atmosfer çalma listesi desteği'
    ],
    isMandatory: false,
  };

  return NextResponse.json(versionData, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
