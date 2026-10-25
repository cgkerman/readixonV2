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
  version: 'v2.7',
  badge: 'En Son Güncelleme',
  date: '25 Ekim 2026',
  title: 'Yeni Nesil Sosyal Okuma: Readixon Kitap Kulüpleri, Birlikte Okuma Seferleri & Spoiler Korumalı Odalar',
  desc: 'Kitaplar yalnız okunmak zorunda değil! Readixon\'un mevcut kütüphane ve evren özellikleriyle bütünleşen yeni nesil edebi sosyal topluluklar devri başladı. Web, Masaüstü ve Mobil (iOS / Android) platformlarında eşzamanlı çalışan Kitap Kulüpleri; yazar onaylı resmi odalar, bölüm eşikli spoiler korumalı tartışma kanalları, yaşayan birlikte okuma seferleri ve canlı yazar buluşmalarıyla (AMA) Readixon v2.7\'de.',
  highlights: [
    'Readixon Kitap Kulüpleri Alanı: Her kulübün kendine ait dinamik sayfası, üyeleri, yönetici kadrosu, özel veya açık katılım seçenekleri, kural listesi ve canlı topluluk istatistikleri',
    'Yaşayan Birlikte Okuma Seferleri (Living Journeys): Kulüp üyelerinin ortak bir kitap seçip okuma hedefi (başlangıç/bitiş tarihi, haftalık bölüm eşikleri) belirlediği, kilometre taşlarına göre otomatik ilerleyen yaşayan okuma yolculuğu çubuğu',
    'Bölüm Eşikli Spoiler Koruması (Spoiler-Gate): Henüz ilgili bölümü okumamış okuyuculara sohbeti sansürleyen veya kilitleyen, okur kitapta o bölüme geldiğinde kilidi otomatik açılan spoiler koruma motoru',
    'Okuyucu İlerleme Senkronizasyonu & Otomatik Kilit Açma: Okuyucu Web veya Mobil\'de bir bölümü bitirdiği an, kulüpteki o bölüme ait tartışma kanalının kilidini anında açan ve tebrik bildirimi (Toast) gösteren akıllı okuma senkronizasyonu',
    'Yazar Buluşmaları & Canlı Soru-Cevap (AMA): Yazarların kulüplere konuk olabilmesi, eserleri için resmi kulüp kurabilmesi, okuyucuların sorularını yanıtlayabilmesi ve en çok oy alan (Upvote) teorilerin öne çıktığı soru-cevap alanı',
    'Yazar Stüdyosu Hızlı Erişim Vitrini: Yazar Stüdyosu\'nda (/studio) eserlerin yanında resmi yazar kulüplerini ve soru-cevap oturumlarını tek tıkla yönetme entegrasyonu',
    'Bitirilen Kitap Arşivi: Kulübün geçmişte birlikte tamamladığı tüm eserlerin, topluluk ortalama puanlarının ve arşivlenmiş teorilerinin sergilendiği daimi kulüp arşivi',
    'Çoklu Platform Senkronizasyonu (Web, PC/Tauri & Mobil): Masaüstü (Tauri), Web (Next.js) ve Mobil (Expo/React Native) üzerinde kusursuz çalışan, alt gezinme çubuğuna entegre ergonomik kulüp deneyimi',
    'Canlı Firestore Güvenlik Kuralları: Kulüpler, üyeler, mesajlar, seferler ve arşivler için yetkilendirilmiş, prodüksiyona dağıtılmış güvenli veri mimarisi',
  ],
};
