Readixon - Yeni Nesil Okuma & Yazma Platformu

Teknik Mimari ve Sistem Tasarımı Dokümanı

Bu doküman, Readixon projesinin sosyal etkileşim odaklı, minimalist ve yüksek performanslı yeni versiyonunun uçtan uca teknik mimarisini tanımlar. Platform, "mağaza" konseptinden çıkarak "keşfetme ve topluluk" odaklı (Wattpad, Medium, TikTok hibrit modeli) bir yapıya geçiş yapmaktadır.

1. Teknoloji Yığını (Tech Stack)

Sistem, maksimum kod paylaşımı, yüksek performans ve sunucusuz (serverless) ölçeklenebilirlik prensiplerine göre tasarlanmıştır.

Web İstemcisi: React.js (Next.js veya Vite)

Mobil İstemci: React Native (Expo)

Veritabanı & Backend: Firebase (Firestore NoSQL)

Kimlik Doğrulama: Firebase Auth (Email, Google, Apple Sign-in)

Dosya Depolama: Google Cloud Storage (GCS)

Sunucusuz İşlevler: Google Cloud Functions (Node.js)

Durum Yönetimi (State): Zustand (Global state) + TanStack React Query (Server state ve Caching)

Tasarım Sistemi: Tailwind CSS (Web) ve Restyle/NativeWind (Mobil)

2. Proje Mimarisi (Monorepo)

Web ve Mobil uygulamaların iş mantığını ortaklaştırmak için Turborepo tabanlı bir Monorepo mimarisi kullanılacaktır.

readixon-monorepo/
├── apps/
│   ├── web/               # React web uygulaması (Yazarlar için optimize edilmiş)
│   └── mobile/            # React Native mobil uygulaması (Okurlar için optimize edilmiş)
├── packages/
│   ├── core/              # Ortak iş mantığı, Firestore servisleri, Zustand store'ları
│   ├── ui/                # Ortak minimalist tasarım bileşenleri (Butonlar, typografiler)
│   └── config/            # ESLint, Prettier, TypeScript konfigürasyonları


3. Veritabanı Mimarisi (Firestore Şemaları)

NoSQL yapısında okuma işlemleri çok ucuz ve hızlı, yazma işlemleri nispeten daha maliyetlidir. Bu nedenle veri "denormalize" edilerek okuma performansına odaklanılmıştır.

3.1. Kullanıcılar (/users)

Kullanıcı profil bilgileri ve platform içi istatistikleri.

{
  "uid": "user123",
  "username": "kitapkurdu",
  "displayName": "Ayşe Yılmaz",
  "avatarUrl": "gs://...",
  "bio": "Bilim kurgu aşığı.",
  "preferredGenres": ["sci-fi", "dystopian"],
  "stats": {
    "followers": 1540,
    "following": 120,
    "totalReads": 50000
  },
  "createdAt": "TIMESTAMP"
}


3.2. Hikayeler (/stories)

Hikayenin ana kapağı, özeti ve meta verileri.

{
  "storyId": "story789",
  "authorId": "user123",
  "title": "Neon Sokaklar",
  "summary": "2084 yılında distopik bir İstanbul...",
  "coverImage": "gs://...",
  "tags": ["cyberpunk", "istanbul", "macera"],
  "stats": {
    "views": 15000,
    "likes": 3400,
    "chapterCount": 12
  },
  "status": "ongoing", // ongoing, completed, draft
  "createdAt": "TIMESTAMP",
  "updatedAt": "TIMESTAMP"
}


3.3. Bölümler (/stories/{storyId}/chapters/{chapterId})

Bölüm içerikleri. Kritik Mimari Karar: Metinler düz HTML yerine, React Native tarafında kolay render edilebilmesi için JSON Blokları (contentBlocks) halinde tutulur.

{
  "chapterId": "chap01",
  "title": "Bölüm 1: Uyanış",
  "order": 1,
  "contentBlocks": [
    { "type": "paragraph", "text": "Yağmur hiç durmuyordu." },
    { "type": "quote", "text": "Gökyüzü televizyon frekansındaydı." }
  ],
  "publishDate": "TIMESTAMP"
}


3.4. Yorumlar (/comments)

Satır arası (inline) yorumları desteklemek için her yorumun hangi bölüme ve hangi paragrafa ait olduğu tutulur.

{
  "commentId": "com456",
  "storyId": "story789",
  "chapterId": "chap01",
  "paragraphIndex": 0,
  "userId": "user999",
  "text": "Bu betimleme harika!",
  "createdAt": "TIMESTAMP"
}


4. Ana Akış ve Keşfet Algoritması

Kullanıcının uygulamayı açtığı anda göreceği ana ekran iki ana sekmeden oluşur: Takip Edilenler ve Keşfet.

4.1. Takip Edilenler (Following Feed)

Fan-out on Write: Popüler bir yazar yeni bölüm yayınladığında, bu bölümün referansı, o yazarı takip eden kullanıcıların özel "feed" koleksiyonlarına arka planda (Cloud Functions) yazılır. İstemci sadece kendi feed'ini okur. Bu, milyonlarca kullanıcıda bile anında yüklenme sağlar.

4.2. Keşfet Algoritması (Discovery Feed)

Puanlama (Scoring): Hikayeler son 7 gündeki (Okunma sayısı * 0.3) + (Beğeni sayısı * 0.7) formülüyle puanlanır.

Kişiselleştirme: Kullanıcının preferredGenres (seçtiği türler) dizisi ile hikayenin tags dizisi eşleştirilir.

Ekranda sonsuz kaydırma (Infinite Scroll) FlashList (Mobil) ve IntersectionObserver (Web) ile sağlanır.

5. Okuma ve Yazma Deneyimi (Core UX)

5.1. Okuma Motoru (Reading Engine)

Offline-First: Kullanıcı bir hikayeye girdiğinde, tüm yayınlanmış bölümler arka planda React Query ile önbelleğe (cache) alınır. Metroda internet kopsa bile okuma kesintiye uğramaz.

Debounced İlerleme Senkronizasyonu: Kullanıcı okurken her kaydırmada (scroll) veritabanına istek atılmaz. Kullanıcı ekranı kaydırmayı bıraktığında 3 saniye bekler (Debounce) ve currentParagraph verisini Firebase'e kaydeder. Cihaz değiştirildiğinde (telefondan bilgisayara), kaldığı satırdan devam eder.

Tema Motoru: Minimalist yaklaşım gereği, okuma ekranında sadece metin odaklıdır. Tek dokunuşla (tap) menüler kaybolur (Immersive mode).

5.2. Yazar Stüdyosu (Creator Studio)

Editör: Web tarafında Lexical, mobil tarafta özelleştirilmiş TextInput altyapısı kullanılır.

Otomatik Kaydetme (Autosave): Yazılan her karakter AsyncStorage/IndexedDB'ye anlık yazılır. Her 15 saniyede bir Cloud'a draft (taslak) olarak senkronize edilir. Veri kaybı imkansız hale getirilir.

6. Arka Plan İşlemleri ve Güvenlik

6.1. Google Cloud Functions İşlevleri

OnUserCreate: Yeni kullanıcı kaydolduğunda varsayılan profil resmini ayarlar ve arama indeksine ekler.

OnChapterPublish: Yeni bölüm yayınlandığında yazarın tüm takipçilerine FCM (Firebase Cloud Messaging) ile anlık Push Bildirim gönderir.

ImageOptimizer: Storage'a yüklenen kapak resimlerini ve avatarları otomatik küçültür (thumbnail oluşturur) ve modern .webp formatına çevirir (bant genişliği tasarrufu).

6.2. Güvenlik Kuralları (Firestore Security Rules)

Kullanıcılar yalnızca kendi profil bilgilerini düzenleyebilir.

status: "draft" olan hikayeleri sadece authorId okuyabilir.

status: "published" olan hikayeleri herkes okuyabilir ancak kimse değiştiremez.

Yorum atma işlemi için email_verified: true şartı aranır (Spam kontrolü).

7. Dağıtım ve DevOps

Web: Vercel veya Firebase Hosting üzerinden küresel CDN ile dağıtım.

Mobil: Expo Application Services (EAS) ile bulutta derleme (Cloud Build) ve App Store/Play Store'a otomatik "Over The Air (OTA)" güncellemeleri. Bu sayede ufak hata düzeltmeleri için mağaza onayı beklenmez.