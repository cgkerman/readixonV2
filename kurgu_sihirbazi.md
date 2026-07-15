# 📝 ÜRÜN GEREKSİNİM DOKÜMANI (PRD)
## Proje Adı: Kurgu Sihirbazı Entegrasyonu

---

## 1. Proje Vizyonu ve Özet
**Readixon** platformumuzda yazarların kurgu oluşturma süreçlerini kolaylaştırmak, yazma tıkanıklıklarını (Writer's Block) aşmalarını sağlamak ve platformda kalma sürelerini artırmak amacıyla interaktif bir **"Yazar Atölyesi"** modülü geliştiriyoruz. 

Bu modül; fiziksel kurgu planlama çalışma kartlarını dijitalleştirerek yazara **Açılış Sahnesi, Sahne Yazımı, Plot Twist** ve **Final** aşamalarında adım adım rehberlik edecektir.

---

## 2. İş Modeli ve Limit Yönetimi (Paywall Mantığı)
Bu özellik, platformun **Premium** üyelik dönüşümlerini artırmak için en önemli kozlarımızdan biri olacaktır.

* **"İlk Hikaye Ücretsiz" (Freemium) Modeli:**
  * Sisteme üye olan her yazar, oluşturduğu **ilk hikaye için** bu kurgu planlama sihirbazını sınırsız ve tamamen ücretsiz olarak kullanabilir.
  * Bu sayede yazar, özelliğin değerini bizzat deneyimler.
* **Premium Kısıtlaması (Paywall):**
  * Yazar, **ikinci** bir hikaye oluşturup kurgu sihirbazını aktif etmek istediğinde sistem Premium üyelik uyarısı (Paywall) tetikleyecektir.
  * Yazar Premium satın almazsa, yeni hikayelerini sadece "Standart Düz Metin Editörü" ile yazmaya devam edebilir; kurgu planlama modülüne erişemez.

### 🛡️ İstismar Önleme (Anti-Abuse) Kuralı:
Kullanıcıların sürekli hikaye silip "0 aktif hikaye" durumuna düşerek sistemi kandırmasını önlemek adına; kullanıcının profilinde tek seferlik bir `has_used_free_tier = true` bayrağı (flag) tutulacaktır. Bu bayrak bir kez aktif olduğunda, hikaye silinse dahi ikinci kez ücretsiz planlama başlatılamaz.

---

## 3. Kullanıcı Deneyimi (UX) ve Arayüz Akışı

1. **Giriş Noktası:** Yazar yeni bir hikaye oluştururken *"Kurgu Sihirbazı ile Başla"* (Önerilen) veya *"Düz Metin ile Başla"* seçeneklerini görür.
2. **Sihirbaz Arayüzü (Wizard):** Adım adım ilerleyen (Step-by-step), göz yormayan, her adımda tek bir kurgu aşamasına odaklanan form yapıları sunulur.
3. **Yazma Editörü Entegrasyonu (Split Screen):** Yazar ana hikayesini yazarken, ekranın sağ tarafında açılıp kapanabilir bir **"Planlama Notlarım"** paneli yer alır. Yazar burada sihirbaza verdiği yanıtları kılavuz olarak görür.

---

## 4. Modül Detayları ve Form Yapısı

Geliştirilecek 4 ana planlama şablonu ve içereceği veri alanları şu şekildedir:

### Modül A: Açılış Sahnesi
*Yazarın hikayeye güçlü bir başlangıç (Hook) yapmasını sağlar.*

| Soru / Alan | UI Bileşeni | Açıklama / İpucu |
| :--- | :--- | :--- |
| **Ana Karakterin Özellikleri** | Metin Alanı (Rich Text) | Karakterin en iyi özellikleri nedir? |
| **Gösterme Yolları** | Metin Alanı | Bu özellikleri okuyucuya hissettirmenin yolları nelerdir? |
| **Kanca (Hook)** | Metin Alanı | Karakter, okuyucunun ilgisini nasıl hızla çeker? |
| **Karakter Gelişimi** | Metin Alanı | Karakter hikayede nasıl bir gelişme gösterecek? |
| **İçsel Durum** | Metin Alanı | Karakterin baştaki içsel halini gösterme şekli nasıl olacak? |
| **Gizem** | Metin Alanı | Hangi gizem ortaya çıktı / çözüldü? |
| **Atmosfer / Enerji** | Çoklu Seçim + Metin | Sahnenin genel enerjisi ve atmosferi nasıl? |
| **Kapanış** | Metin Alanı | Sahne sonunda ortaya ne çıkacak? |

---

### Modül B: Sahne Yazımı
*Bölüm bazlı dinamik planlama aracı.*

* **Gerçekleşmesi Gereken Olaylar:** Yazarın ekleyip silebileceği bir "Yapılacaklar Listesi" (To-Do List) yapısı.
* **İçsel & Dışsal Durum Takibi:**
  * *Karakterin Baştaki İçsel Durumu* ➡️ *Karakterin Sondaki İçsel Durumu* (Karşılaştırmalı iki metin kutusu).
  * *Karakterin Baştaki Dış Dünyaya Karşı Durumu* ➡️ *Karakterin Sondaki Dış Dünyaya Karşı Durumu*.
* **Bölüm İçi Önemli Detaylar:** Semboller, ipuçları veya saklanan sırlar için geniş metin alanı.

---

### Modül C: Plot Twist (Kırılma Noktası)
*Hikayeyi ters köşeye yatırma rehberi.*

* **Algı Yanılsaması:** *"Birinin gerçek kimliği yanlış anlaşıldı"* veya *"Yanlış anlaşılan bir olay var"* seçimi.
* **Sırlar & Motivasyonlar:**
  * Birinin motivasyonu diğerlerinden neden farklı?
  * Henüz bilinmeyen önemli detay ne?
* **Hedef Analizi:**
  * Okuyucuyu şaşırtması beklenen olay nedir?
  * Karakteri şaşırtması gereken olay nedir?
* **Etki Analizi:** Bu twist karakterleri ve genel hikaye gidişatını ne şekilde değiştirecek?

---

### Modül D: Final Planlayıcı
*Hikayeyi zirve noktasında düğümleyip çözme aracı.*

* **İstenen Sonlar:**
  * *Ana karakter nasıl bir son istedi?*
  * *Antagonist (Düşman/Karşı Güç) nasıl bir son istedi?*
* **Dönüşüm Kontrolü:**
  * Hikaye nereden başladı, nerede bitmeli?
  * Değişimi sembolize eden şey (obje, eylem veya söz) nedir?
  * Karakterle kalanlar kimler ve neden kaldılar?
* **Duygusal Etki & Bedel:**
  * Okuyucuyu sonda nasıl bir duyguyla bırakmak istiyorsun?
  * Hikayenin sonunda gerçek bir bedel (kayıp, fedakarlık) ödendi mi?
  * Alternatif bir son olsaydı neleri değiştirirdin?

---

## 5. Yazılım ve Veritabanı Gereksinimleri (Backend / DB Notes)

* **DB Şeması:** Her hikaye (`Story`) veya bölüm (`Chapter`) için ilişkisel bir `StoryPlanner` tablosu oluşturulacak. Soruların cevapları esneklik açısından `JSON` veri tipinde saklanabilir.
* **Otomatik Kaydetme (Autosave):** Form alanlarındaki girdiler yazar yazmayı bıraktıktan 1.5 saniye sonra arka planda otomatik olarak kaydedilmelidir.
* **API Kontrolü (Paywall Logic):**
  ```javascript
  if (user.is_premium === false && user.has_used_free_tier === true) {
      showPaywallModal(); // Kurgu sihirbazını kilitle, Premium'a yönlendir.
  }