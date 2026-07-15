# PayTR Ödeme Altyapısı Entegrasyon Rehberi

Readixon platformunda kullanıcıların tek seferlik "RX Puanı" alabilmesi ve aylık "Premium/Pro Paket" aboneliklerini başlatabilmesi için PayTR sanal POS entegrasyonu kullanacağız. PayTR, Türkiye'deki en popüler ve güvenilir ödeme kuruluşlarından biridir.

Aşağıda bu sistemi nasıl kuracağımızı teknik terimlere boğmadan, adım adım anlattım.

## 1. PayTR Nasıl Çalışır? (Mantık)

PayTR'nin en büyük avantajı **kredi kartı bilgilerinin bizim sunucularımıza hiç uğramamasıdır**. Sistem kabaca şöyle işler:
1. Kullanıcı sitemizde "100 Readix Puanı Al (50 TL)" butonuna tıklar.
2. Bizim sunucumuz (Next.js API), arka planda gizlice PayTR'ye *“Bu kullanıcı 50 TL ödeyecek, bana güvenli bir ödeme ekranı ver”* der.
3. PayTR bize şifreli bir **Token (Bilet)** verir.
4. Biz bu bileti kullanarak kullanıcının ekranında **PayTR'nin güvenli ödeme formunu (Iframe)** açarız.
5. Kullanıcı kart bilgilerini PayTR'nin formuna girer ve ödemeyi yapar.
6. Ödeme başarılı olduğunda PayTR arka planda bizim sunucumuza (Webhook) gizli bir mesaj gönderir: *“Ödeme alındı, puanı yükleyebilirsin.”*
7. Biz de Firebase veritabanımızda kullanıcının puanını güncelleriz.

---

## 2. Aylık Otomatik Çekim (Abonelik) ve İframe Mantığı

Sorduğunuz **İframe (Pencere İçi Pencere)** teknolojisi hem tek çekimlerde hem de aboneliklerde bizim en büyük yardımcımızdır. PayTR'nin güvenlik (PCI-DSS) standartları gereği kredi kartı formu doğrudan bizim sitemizin kodlarıyla değil, PayTR'nin sağladığı güvenli bir iframe içinde gösterilir. 

Aylık abonelik süreci şöyle işler:
1. **İframe ile İlk Ödeme ve Onay:** Kullanıcı Premium paketi seçtiğinde, ekranda PayTR'nin iframe ödeme formu açılır. Kullanıcı burada "Aylık aboneliği ve kartımın saklanmasını kabul ediyorum" sözleşmesini onaylayarak ilk ödemesini yapar.
2. **Kontrolün PayTR'ye Geçmesi:** İlk çekim başarılı olduktan sonra, kart bilgileri PayTR'nin güvenli kasasında (Tokenization) saklanır.
3. **Otomatik Yenileme:** Tam 30 gün sonra, kullanıcı sitede olmasa bile PayTR arka planda o karttan parayı otomatik çeker.
4. **Webhook Bildirimi:** PayTR, parayı çeker çekmez bizim sunucumuza gizli bir sinyal (Webhook) yollar: *"2. ay ödemesi alındı"*.
5. **Otomatik Tanımlama:** Sistemimiz bu sinyali alır almaz, kullanıcının Premium süresini uzatır ve paketine dahil olan aylık RX puanını hesabına yükler.

---

## 3. Bizim (Yazılımsal Olarak) Yapacaklarımız

Sistemi kodlarken üç ana modül geliştireceğiz:

### Adım 1: Token Üretme Servisi (`/api/payment/get-token`)
Kullanıcı ödeme butonuna bastığında çalışacak arka uç servisimiz.
- Tek seferlik puan satışı ise **Standart PayTR API'sine**, aylık paket ise **PayTR Abonelik (Subscription) API'sine** istek atılır.
- Bize vereceğin PayTR gizli anahtarlarıyla (Merchant Key & Salt) bir şifreleme (HMAC-SHA256) oluşturulur.
- PayTR'den alınan `token` ön yüze gönderilir.

### Adım 2: Ön Yüz (Iframe Ekranı)
- Kullanıcıya kendi sitemizden ayrılıyormuş hissi vermeden, ekranın ortasında açılan bir pencere (Modal) içinde PayTR ödeme formunu (iframe) göstereceğiz.
- Ödeme başarılı olursa, kullanıcıyı anında "Ödeme Başarılı" sayfasına yönlendireceğiz.

### Adım 3: Webhook (Bildirim) Servisi (`/api/payment/webhook`)
- En kritik kısım burasıdır. Kullanıcı ödemeyi yaptıktan sonra PayTR bizim sitemize bir sonuç gönderir.
- Bu servis, gelen isteğin *gerçekten PayTR'den gelip gelmediğini* şifreleme anahtarlarıyla doğrular.
- Eğer ödeme başarılıysa Firebase Firestore veritabanına bağlanıp kullanıcının hesabına satın aldığı puanı (veya bileti) yükler.

---

## 3. Senin (İşletme Olarak) Yapman Gerekenler

Bizim kodlama tarafına başlamadan veya canlıya almadan önce senin PayTR tarafında halletmen gereken işler şunlar:

> [!IMPORTANT]
> PayTR'nin sana onay vermesi için sitenin belli standartları karşılaması gerekir.

1. **PayTR Başvurusu:** Bir şirket veya şahıs firması olarak PayTR Sanal POS başvurusu yapmalısın.
2. **Gerekli Sözleşmeler:** Sitede mutlak suretle şu sayfaların aktif ve eksiksiz olması gerekir (Şu an bir kısmını taslak olarak oluşturduk ama içlerini hukuki metinlerle doldurman gerekecek):
   - Mesafeli Satış Sözleşmesi
   - İptal ve İade Koşulları
   - Gizlilik Politikası ve KVKK Metni
   - Üyelik Sözleşmesi
3. **SSL Sertifikası:** Sitenin güvenli (HTTPS) olması şarttır (Vercel bunu bizim için otomatik sağlıyor, sorun yok).
4. **API Anahtarları:** PayTR başvurun onaylandıktan sonra panelinden bize 3 bilgi vereceksin:
   - `merchant_id` (Mağaza No)
   - `merchant_key` (Mağaza Parolası)
   - `merchant_salt` (Mağaza Gizli Anahtarı)

---

## 4. Geliştirme Yol Haritası

Entegrasyona başladığımızda şu sırayla gideceğiz:
1. Sen API anahtarlarını temin edene kadar, sistemi **PayTR Test Ortamı (Test Mode)** ile kurup sanal kredi kartlarıyla denemeler yapacağız.
2. `packages/core` içine `paymentService.ts` adında PayTR ile haberleşecek temel fonksiyonları ekleyeceğiz.
3. Webhook (Geri bildirim) rotasını yazıp Firebase bağlantılarını test edeceğiz.
4. Sen canlı anahtarları (Production keys) verdiğinde, sistemi test modundan çıkarıp gerçek ödeme almaya hazır hale getireceğiz.

Bu süreç veya mantık hakkında aklına takılan, sormak istediğin herhangi bir detay var mı?
