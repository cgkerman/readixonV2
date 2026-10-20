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
  version: 'v2.5',
  badge: 'En Son Güncelleme',
  date: '21 Ekim 2026',
  title: 'Sürükleyici Mesaj Hikayeleri (Chat Stories), Çerçevesiz Medya & İstemci Tarafı Görsel Optimizasyonu',
  desc: 'WhatsApp ve mesajlaşma hissiyatında ilerleyen, okurun her dokunuşunda (Tap-to-Reveal) yeni bir mesajın belirdiği yenilikçi "Mesaj Hikayeleri" formatı yayına alındı! Çerçevesiz doğal medya balonları, tam ekran görsel inceleme (Lightbox), sunucuyu yormayan istemci tarafı akıllı görsel sıkıştırma motoru, çoklu konuşmacı destekli dinamik üst bar ve yazar stüdyosu canlı telefon simülatörü Readixon\'da.',
  highlights: [
    'Mesaj Hikayeleri Formatı (Chat Story Mode): Ekrana her dokunulduğunda sıradaki mesajın belirdiği (Tap-to-Reveal), çift taraflı balonlar, otomatik oynatma (1x, 1.5x, 2x), ses efektleri ve haptik titreşimlerle WhatsApp gerçekçiliğinde sürükleyici okuma deneyimi',
    'Akıllı Çoklu Konuşmacı & Üst Bar Başlığı: Birebir konuşmalarda karşı tarafın ismi ve çevrimiçi durumu; grup sohbetlerinde ise konuşan tüm karakterlerin listesi ve sıra kime geldiyse dinamik olarak `${Karakter} yazıyor...` animasyonu',
    'Çerçevesiz & Doğal Görsel Baloncukları: Resim mesajlarının etrafındaki kaba arka plan ve çerçevelerin kaldırılarak, modern WhatsApp/Telegram standardında tam oturan çerçevesiz görsel kartları ve köşe saat rozetleri',
    'Tam Ekran Görsel Önizleme (Lightbox) & Kolay Geri Dönüş: Sohbet içindeki görsellere tıklandığında açılan tam ekran görsel inceleme modu, "Sohbete Dön" butonu, Esc tuşu ve Android fiziksel geri tuşu entegrasyonu',
    'Sunucu & Kota Dostu İstemci Tarafı Görsel Sıkıştırma: Yazarların yüklediği yüksek çözünürlüklü fotoğrafların istemcide (HTML5 Canvas) otomatik olarak optimize edilip (1280px Web JPEG / Karakter avatarları için 256px) Firebase Storage\'a yüklenmesi; böylece sunucu yükünün, veri kotasının ve okuyucu açılış sürelerinin korunması',
    'Yazar Stüdyosu Canlı Telefon Simülatörü & Otomatik Kaydırma: Yazarlar mesaj ekledikçe hem zaman çizelgesinde hem de canlı telefon simülatöründe son mesaja otomatik odaklanma, yukarı kaydırıldığında pratik "En Son Mesaja İn" hızlı erişim butonu',
    'Karakter & Konuşmacı Yönetimi: Yazar Stüdyosu\'nda hızlı konuşmacı tanımlama, düzenleme, özel balon renkleri atama ve cihaza gerek kalmadan doğrudan optimize profil fotoğrafı yükleme desteği',
    'Keşfet & Hikaye Detay Entegrasyonu: Keşfet vitrininde "Mesaj Hikayeleri" özel vitrin bloğu, hikaye detay sayfasında mesaj hikayesi rozeti ve formatına uygun okuma başlatma akışı',
    'Masaüstü & Mobil Tam Uyum: Masaüstünde bölünmüş çift ekran (Sol panel zaman çizelgesi, sağ panel telefon simülatörü), mobil cihazlarda ise tek dokunuşla geçiş yapılabilen ergonomik sekmeler',
  ],
};
