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
  version: 'v2.4',
  badge: 'En Son Güncelleme',
  date: '19 Ekim 2026',
  title: 'Tek Solukta Edebiyat: Kısa Hikayeler & Yeni Başarım Rozetleri',
  desc: 'Vakti kısıtlı okurlar ve tek oturuşta çarpıcı bir öykü anlatmak isteyen yazarlar için yepyeni bir deneyim: Kısa Hikayeler! Karmaşık hazırlıklara gerek kalmadan anında yazılabilen tek bölümlük öyküler, Keşfet vitrini ve yeni başarımlar Readixon\'da.',
  highlights: [
    'Kısa Hikaye Dünyası: Uzun soluklu romanların yanında, başı ve sonu tek bir bölümde hayat bulan kompakt bağımsız öyküler',
    'Yazarlar İçin Hızlı Başlangıç: Ön hazırlık ve kurgu planlama aşamalarıyla vakit kaybetmeden ilham geldiği an doğrudan yazmaya başlama özgürlüğü',
    'Tek Bölümde Eksiksiz Anlatı: Yalnızca tek bir bölümden oluşan, okurun başladığı yerde bitirebileceği odaklanmış hikaye akışı',
    'Keşfet "Tek Solukta Bitir" Vitrini: Molalarda, kahve eşliğinde ya da yolda hızlıca okunabilecek en taze kısa hikayeler için özel vitrin',
    'Yepyeni Başarım Rozetleri: Kısa hikaye yazan yazarlarımız ve bu öyküleri soluksuz bitiren okurlarımız için 4 yeni profil rozeti',
    'Keyifli & Sade Okuma: Eserin doğasına uygun tasarlanan "Hikayeyi Oku" deneyimi ve dikkati dağıtmayan sadeleştirilmiş okuyucu görünümü',
  ],
};
