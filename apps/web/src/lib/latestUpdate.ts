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
  version: 'v2.9',
  badge: 'En Son Güncelleme',
  date: '29 Ekim 2026',
  title: 'Kapsamlı Ayarlar Merkezi, Mobil Stüdyo Kapsül Dock, Rozetler 2.0 & Uçtan Uca Kullanıcı Engelleme',
  desc: 'Readixon deneyimini baştan aşağı güçlendiren büyük v2.9 sürümü yayında! 7 kategorili interaktif Ayarlar Merkezi, mobil ve tabletler için iOS tarzı yüzen alt kapsül bar ve hızlı işlem çekmecesi, baştan yazılan Rozet & Başarım 2.0 ekosistemi, yetişkin içerik filtresi, uçtan uca kullanıcı engelleme güvenliği ve okuma listesi performans iyileştirmeleri Yazar Stüdyosu ve Web platformunda.',
  highlights: [
    'Kapsamlı Ayarlar Merkezi (Settings v2.0): 7 tam fonksiyonel kategoriyle (Hesap, Okuma Tercihleri, Görünüm, Bildirimler, Gizlilik, Yazar Tercihleri ve Tehlikeli Bölge) tüm kullanıcı ve yazar ayarlarının tek merkezden yönetimi',
    'Canlı Okuma Tercihleri Önizlemesi: Yazı boyutu, satır yüksekliği, font ailesi (Serif, Sans, Mono) ve sayfa genişliği değişikliklerinin anlık canlı kitap önizleme kartında test edilebilmesi',
    'Mobil & Tablet Stüdyo Kapsül Dock: Mobil ve tablet ekranlarındaki sıkışık alt çubuğun yerini alan 5 yuvalı yüzen cam efektli dock ve başparmak dostu Framer Motion hızlı araçlar çekmecesi (Quick Tools Sheet)',
    'Rozet & Başarım Sistemi 2.0: Mantıksal hataları giderilmiş ve yeni eklenen rozetler (Gece Kuşu, Kelime Ustası, Usta Eleştirmen, Düello Fatihi, Seri Katili vb.) ile dinamik ilerleme çubuklu başarımlar vitrini',
    'Uçtan Uca Kullanıcı Engelleme & Güvenlik: Profil menüsünden tek tıkla engelleme; engellenen kullanıcıların sohbet başlatmasının, yorumlarının ve hikayelerinin ana akış, keşfet ve bölümlerde otomatik filtrelenmesi',
    'Engellenen Kullanıcılar Yönetimi: Ayarlar > Gizlilik sekmesinde engellenen kişilerin anlık listesi ve tek dokunuşla engeli kaldırma aksiyonu',
    'Yazar Stüdyosu Varsayılanları: Otomatik kaydetme süresi belirleme ve yeni bölümlere otomatik eklenen varsayılan bölüm sonu yazar notu yapılandırması',
    'Okuma Listeleri & Profil Güvenlik İyileştirmeleri: Profilde okuma listelerinin kesintisiz yüklenmesi ve gizlilik uyumlu Firestore optimizasyonları',
  ],
};
