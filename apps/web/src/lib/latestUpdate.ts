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
  version: 'v2.8',
  badge: 'En Son Güncelleme',
  date: '27 Ekim 2026',
  title: 'Gelişmiş Yazar Araçları: Word (.docx) Dışa Aktarma, Readixon Gündem Köşe Yazarlığı & Erişilebilir Mesaj Okuma Hızları',
  desc: 'Yazarlarımızın edebi üretkenliğini ve stüdyo deneyimini zenginleştiren dev bir güncelleme! Yazdığınız bölümlerin yapısı, alıntıları ve tipografisi bozulmadan tek dokunuşla Word (.docx) belgesi olarak indirilmesi ve paylaşılması, Readixon Gündem Köşe Yazarlığı ekosistemi, 4 adımlı yazar başvuru paneli, mesaj hikayeleri için 0.25x - 0.75x yavaş okuma hızları ve Keşfet vitrini optimizasyonları Readixon v2.8 ile Yazar Stüdyosu\'nda yayında.',
  highlights: [
    'Bölümleri Word (.docx) Olarak İndirme: Yazar Stüdyosu\'nda yazılan bölümlerin başlık, yazar bilgisi, dinamik sayfa numaraları (Sayfa X / Y), alıntı şeritleri, ortalanmış sahne ayırıcıları ve diyaloglarıyla temiz bir Microsoft Word belgesi olarak tek dokunuşla indirilmesi',
    'HTML Temizleme & Doğal Tipografi Motoru: Zengin metin editöründen gelen tüm HTML etiketlerini ve varlıklarını (&nbsp;, <p>, <strong>, <em>, <u>) çözümleyerek saf Word OpenXML nesnelerine dönüştüren istemci taraflı dönüştürme mimarisi',
    'Mobil & Masaüstü Çift Yönlü İndirme / Paylaşım Deneyimi: Mobil cihazlarda (iOS / Android) yerel Web Share API ile doğrudan Microsoft Word, Google Docs veya WhatsApp üzerinden paylaşma; PC / Mac masaüstünde ise doğrudan dosya indirme desteği',
    'Çok Noktalı Hızlı Erişim: Bölüm Editörü araç çubuğunda, Sohbet Hikayesi Editöründe ve Hikaye Yönetim Paneli bölüm listesinde anlık Word dışa aktarma butonları',
    'Readixon Gündem: Köşe Yazarlığı Ekosistemi: Gündem sayfasında bağımsız köşe yazıları vitrini (/gundem/kose-yazilari) ve yetkilendirilmiş yazarlar için özel Köşe Yazısı Stüdyosu (/studio/columns)',
    '4 Aşamalı Profesyonel Yazar Başvuru Sistemi: Kişisel Bilgiler, Köşe Yazarlığı Alanları & Motivasyon, Edebi Geçmiş & Referans Yazılar ile Readixon Yayın İlkeleri & Yazar Sözleşmesi onayını içeren kapsamlı başvuru ve editoryal onay paneli (/admin/columns)',
    'Mesaj Hikayelerinde Erişilebilir Yavaş Okuma Hızları: Otomatik oynatma paneline eklenen 0.25x, 0.50x, 0.75x yavaş okuma hız seçenekleri ile her yaş ve okuma temposuna uygun erişilebilir deneyim',
    'Keşfet Vitrini & Sayfa Geçiş Düzeltmeleri: Keşfet sayfalarında "Tümünü Gör" rotalarındaki içerik yükleme optimizasyonları ve sayfa geçişlerinde otomatik scroll sıfırlama iyileştirmesi',
  ],
};
