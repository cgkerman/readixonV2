# Readixon Çevrimdışı (Offline) Okuma Özelliği Stratejisi

Bu belge, Readixon platformuna ileride eklenecek olan "İnternetsiz Okuma" özelliği için teknik altyapı, kullanılacak teknolojiler ve adım adım uygulama planını içermektedir.

## 1. Temel Altyapı ve Kullanılacak Teknolojiler

Çevrimdışı bir web uygulaması (Offline Web App) yapmak üç temel teknoloji etrafında şekillenir:

### A. Progressive Web App (PWA) ve Service Worker'lar
Uygulamanın internet kesildiğinde çökmemesi ve arayüzün (HTML, CSS, JS, Logolar) yüklenebilmesi için PWA mimarisi kullanılacaktır.
*   **Paket:** `next-pwa` (Next.js için PWA desteği)
*   **Görev:** Uygulamanın iskeletini (App Shell) cihaz belleğinde (Cache API) saklamak.
*   **Ekstra Fayda:** Kullanıcılar mobil cihazlarda "Ana Ekrana Ekle" diyerek uygulamayı gerçek bir mobil uygulama (APK/IPA) gibi telefonlarına kurabilirler.

### B. Firebase Çevrimdışı Kalıcılık (Offline Persistence)
Firebase Firestore'un varsayılan olarak desteklediği çok güçlü bir yerel ön bellek sistemidir.
*   **Özellik:** `enableIndexedDbPersistence` (veya yeni SDK'da yapılandırma ayarı).
*   **Görev:** İnternet varken çekilen tüm verileri (readixler, hikaye listeleri, profiller) cihazın IndexedDB'sine otomatik kopyalar.
*   **Senaryo:** Kullanıcı internet koptuğunda daha önce girdiği sayfalara girerse, veriler anında yerel veritabanından getirilir. İnternet gelince sistem kendini tekrar eşitler.

### C. IndexedDB (Bilinçli İndirme Özelliği)
Kullanıcıya Netflix veya Spotify'daki gibi bilinçli bir "İndir ve Çevrimdışı Oku" butonu sunulacaksa gereklidir.
*   **Kütüphane Önerisi:** `localforage` (IndexedDB'yi kullanmayı çok kolaylaştıran bir araç) veya `idb`.
*   **Görev:** Kullanıcı "İndir" butonuna bastığında kitabın kapak resmini, bölüm metinlerini (JSON/HTML formatında) ve yazar bilgilerini IndexedDB'ye manuel olarak kaydetmek.

---

## 2. Adım Adım Uygulama Planı (Roadmap)

İleride bu özelliği devreye almak istediğimizde şu adımları izleyeceğiz:

### Adım 1: Firebase Offline Modunun Aktif Edilmesi
En kolay ve hızlı adımdır. Kod tabanında (muhtemelen `@readixon/core/src/firebase.ts` içinde) ufak bir değişiklikle başlarız.
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Çevrimdışı kalıcılığı aktif et
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Birden fazla sekme açık, sadece birinde offline destek çalışır.
    console.warn("Offline persistence only works in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    // Tarayıcı desteklemiyor
    console.warn("Browser doesn't support offline persistence.");
  }
});
```

### Adım 2: PWA ve Service Worker Kurulumu
`apps/web` klasörü altındaki `next.config.js` dosyamızı `next-pwa` ile saracağız (wrap edeceğiz). 
*   `public` klasörüne `manifest.json` (uygulama ikonları ve adı) eklenecek.
*   Bu sayede tarayıcı sayfaları önbelleğe (cache) alacak ve internet yokken de `/` veya `/library` sayfaları açılabilecek.

### Adım 3: İndirme (Download) Mantığının Geliştirilmesi
*   **İndir Butonu:** Hikaye detay (Story Detail) sayfasına bir indirme butonu koyulacak.
*   **Veri Çekme:** Butona basıldığında, hikayenin tüm yayımlanmış bölümlerinin (`chapters`) içeriği API üzerinden tek seferde çekilecek.
*   **Yerel Kayıt:** Çekilen veri `localforage.setItem('downloaded_story_123', storyData)` şeklinde cihaza kaydedilecek.
*   **Kapak Resimleri:** Resimler `fetch` ile Blob olarak indirilip yine IndexedDB'de saklanacak.

### Adım 4: Kütüphane (Library) Sayfasının Güncellenmesi
Kütüphane sayfasına **"İndirilenler (Çevrimdışı)"** adında yeni bir sekme eklenecek.
Bu sayfa, Firestore'a gitmek yerine direkt olarak IndexedDB'den (`localforage.getItem()`) verileri okuyup listeleyecek.

### Adım 5: Reader (Okuyucu) Ekranının Uyarlanması
Kullanıcı indirilen bir kitaba tıkladığında okuyucu (`Reader` veya `ContentRenderer`) Firebase yerine yerel veritabanındaki (IndexedDB) metni alıp render edecek şekilde modifiye edilecek.

---

## 3. Dikkat Edilmesi Gereken Gelişmiş Senaryolar (Edge Cases)

1. **İlerleme Senkronizasyonu:** Kullanıcı çevrimdışıyken kitabı okudu ve 5. bölüme geldi. İnternet bağlandığı an, bu ilerleme (Reading Progress) arka planda Firebase'e senkronize edilmelidir.
2. **Depolama Sınırı:** Telefon hafızaları sınırsız değildir. İndirilen kitapları silme veya cihazda ne kadar yer kapladığını gösterme gibi UI bileşenleri düşünülmelidir.
3. **Güncellemeler:** Yazar indirilmiş bir bölümü sonradan güncellerse, cihaz internete bağlandığında versiyon kontrolü yapıp bölümü arka planda güncellemek gerekir.

> [!TIP]
> **Önerilen Başlangıç Stratejisi:**
> İleride bu projeye başlarken doğrudan karmaşık "Manuel İndirme (Adım 3)" kısmından başlamak yerine, **Adım 1 (Firebase Offline Modu)** ve **Adım 2 (PWA Shell)** ile başlamak sistemi çok daha hızlı bir şekilde dirençli hale getirecektir. İndirme yönetimi daha sonra faz 2 olarak ele alınabilir.
