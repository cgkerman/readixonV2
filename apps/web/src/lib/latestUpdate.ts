export interface SystemUpdateInfo {
  version: string;
  badge: string;
  date: string;
  title: string;
  desc: string;
  highlights: string[];
}

/**
 * Readixon platformunun en son yayına alınan sistem güncelleme bilgisi.
 * Hem /about zaman çizelgesi hem de Yazar Stüdyosu ilk açılış ekranında kullanılır.
 */
export const LATEST_SYSTEM_UPDATE: SystemUpdateInfo = {
  version: 'v3.0.0',
  badge: 'Büyük Sürüm',
  date: '29 Ekim 2026',
  title: 'Readixon Atelier: Bağımsız Yazar Web Sitesi Motoru, Prestij Şablonları & Kişisel Portfolyo Mimarisi',
  desc: 'Readixon platformunun en büyük dönüm noktası olan v3.0.0 yayında! Yazarlarımızın sıfır kodlama ve sıfır hosting masrafıyla, 2 dakika içinde kendi adlarına bağımsız görünen lüks web sitelerini kurup yönetebildiği yeni nesil Readixon Atelier vitrin motoru.',
  highlights: [
    'Readixon Atelier Yazar Web Sitesi Motoru (/studio/atelier): PC, tablet ve mobil cihazlarda kusursuz çalışan split-screen canlı önizlemeli tasarım stüdyosu',
    '4 Prestij Tasarım Şablonu: The Novelist (Zarif Edebi Klasik), The Worldbuilder (Sinematik & Epik Fantezi), The Webtoon & Pop (Modern & Dinamik) ve The Minimalist (Sade Tipografik)',
    'Kusursuz 4\'lü Işık & Görünüm Motoru: Ziyaretçilerin ve yazarların tek dokunuşla geçiş yapabildiği Açık (Gündüz), Gece (Dark), Sepya (Kitap Parşömeni) ve OLED (Saf Siyah) modları',
    'Kamuya Açık İzole Yazar Vitrini (/atelier/@username): Readixon genel arayüzünden tamamen arındırılmış bağımsız kişisel web sitesi hissi ("Bağımsızlık İllüzyonu")',
    '3D Kitap Vitrini & Okuma Köprüsü: Yayınlanan romanların otomatik listelenmesi, zengin kapak ve detay modalı ile tek tıkla Readixon Reader geçişi',
    'Evren Stüdyosu Entegrasyonu: Yazarın kurgusal evrenini, interaktif dünya haritasını ve karakter codex galerisini doğrudan kendi sitesine gömebilmesi',
    'Edebi Bülten & Hayran Aboneliği: Okurların tek tıkla e-posta ile abone olabilmesi ve yazar için yerleşik abone yönetim paneli',
    'Yazar Spotify Çalma Listesi & Sosyal Ağlar: Yazarken dinlenen resmi atmosfer müziklerini ve sosyal kanalları doğrudan sitede sergileme',
    'Gelişmiş Tipografi Seçicisi: Playfair Display, Cinzel, Outfit, Lora, Merriweather ve Plus Jakarta Sans font desteği',
  ],
};
