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
  version: 'v2.6',
  badge: 'En Son Güncelleme',
  date: '23 Ekim 2026',
  title: 'Kelimelerin Gücü: Canlı Edebiyat Sayacı, Otomatik Kademeli Eşik Sistemi & 3D Evren Defteri (Grimoire)',
  desc: 'Readixon\'da yazılan her satırın kolektif bir anıta dönüştüğü "Kelimelerin Gücü" vitrini Gündem sayfasında yayında! Tamamen gerçek Firestore bölüm verilerinden beslenen canlı kelime sayacı, platform büyüdükçe otomatik seviye atlayan 14 basamaklı kademeli eşik sistemi, edebi ölçek kıyaslamaları ve okuyucuları büyüleyen 3D sayfa çevirmeli, PDF dışa aktarma destekli Evren Defteri (Grimoire/Codex) Readixon v2.6\'da.',
  highlights: [
    'Kelimelerin Gücü (Canlı Kolektif Arşiv): Gündem sayfasında Kültür & Sanat haberlerinin altına konumlandırılan, platformdaki tüm yayındaki hikaye ve bölümlerin kelimelerini anlık toplayarak odometre animasyonuyla sergileyen canlı edebiyat vitrini',
    'Otomatik Kademeli Eşik Sistemi (Graduated Milestone Ladder): 1.000 kelimeden 50M+ kelimeye kadar uzanan dinamik seviye basamakları; hedef aşıldığında bir sonraki seviyeye (Örn: Seviye 7 Büyük Kütüphane ➔ Seviye 8 Edebi Külliyat) otomatik geçiş ve anlık ilerleme yüzdesi takibi',
    'Yalnızca %100 Gerçek Veri Prensibi: Sentetik ve yapay tabanların tamamen kaldırılarak Firestore veritabanındaki gerçek yayınlanmış eser, bölüm, kelime ve okuma saati metriklerinin şeffaf hesaplanması',
    'Dinamik Edebi Kıyaslamalar: Kelime hacmine göre otomatik ölçeklenen Tolstoy\'un Savaş ve Barış, Tolkien\'in LOTR Üçlemesi ve Saint-Exupéry\'nin Küçük Prens eserleriyle anlık edebi hacim oranları',
    'Göz Dostu & Kompakt Tasarım: Hem Açık modda hem Koyu modda keskin kontrast sağlayan, sayfayı yormayan sade ve modern tasarım dili',
    '3D Evren Defteri (Grimoire / Codex): Okuyucu ve evren sayfalarında çalışan, gerçekçi sayfa çevirme (Page-flip) animasyonlu, 4 antika tema (Parşömen, Fildişi, Gece Gezgini, Kraliyet Kırmızısı) ve ses efektli interaktif evren el kitabı',
    'Yazar Evren Stüdyosu Tam Senkronizasyonu: Evren Defteri\'nin doğrudan yazarın stüdyoda tanımladığı Karakterler, Mekanlar, Fraksiyonlar, Zaman Çizelgesi ve Büyü/Teknoloji Mistik Sanatlar verileriyle gerçek zamanlı çalışması',
    'Tek Tıkla PDF İndirme (jsPDF): Yazarların ve okurların kurgusal evrenlerini şık antika bir e-kitap / defter formatında tek dokunuşla bilgisayarlarına veya telefonlarına PDF olarak kaydedebilmesi',
    'Kehanet Kartları (Tarot Tarzı Evren Keşfi): Evren varlıklarını gizemli kehanet kartları şeklinde sergileyen etkileşimli kart keşif deneyimi',
    'Tek Bölümlük Hikaye / Durum İyileştirmesi: Tek bölümlük bağımsız kısa hikayelerin durum mantığının (Taslak / Tamamlandı) optimize edilmesi',
  ],
};
