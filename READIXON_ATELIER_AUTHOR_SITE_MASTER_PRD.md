# Readixon Atelier — Kişisel Yazar Web Sitesi Motoru Master PRD

**Ürün Kodu:** `READIXON-ATELIER`  
**Sürüm:** `1.0.0`  
**Durum:** `Onay Bekliyor / Uygulama Öncesi Master Tasarım`  
**Hedef Kitle:** Readixon Platformundaki Tüm Yazarlar, Bağımsız Edebiyatçılar, Webtoon Çizerleri ve Ziyaretçiler  
**Mühendislik Kapsamı:** Web Uygulaması (`apps/web`), Yazar Stüdyosu Paneli (`/studio/atelier`), Kamu Vitrin Motoru (`/atelier/[username]`), Firestore Veri Modelleri  

---

## 📌 İçindekiler
1. [Yönetici Özeti & Vizyon](#1-yönetici-özeti--vizyon)
2. [Problem Tanımı & Çözüm Formülü](#2-problem-tanımı--çözüm-formülü)
3. [Kullanıcı Profilleri & Senaryolar (Personas)](#3-kullanıcı-profilleri--senaryolar)
4. [Mimari Tasarım & "Bağımsızlık İllüzyonu"](#4-mimari-tasarım--bağımsızlık-illüzyonu)
5. [Detaylı Veri Modelleri & Firestore Şeması](#5-detaylı-veri-modelleri--firestore-şeması)
6. [3 Hazır Prestij Tasarım Şablonu (Presets)](#6-3-hazır-prestij-tasarım-şablonu-presets)
7. [Modüler Blok Mimarisi (Lego Sistemi)](#7-modüler-blok-mimarisi-lego-sistemi)
8. [Yazar Stüdyosu: Atelier Builder (`/studio/atelier`)](#8-yazar-stüdyosu-atelier-builder-studioatelier)
9. [Kamuya Açık Vitrin Deneyimi (`/atelier/[username]`)](#9-kamuya-açık-vitrin-deneyimi-atelierusername)
10. [Yazar Blogu & Bülten (Newsletter) Alt Sistemi](#10-yazar-blogu--bülten-newsletter-alt-sistemi)
11. [SEO, Performans & Paylaşım Mimarisi](#11-seo-performans--paylaşım-mimarisi)
12. [Aşama Aşama Uygulama Yol Haritası (Fazlar)](#12-aşama-aşama-uygulama-yol-haritası-fazlar)

---

## 1. Yönetici Özeti & Vizyon

**Readixon Atelier**, yazarların hiçbir kodlama veya web tasarım bilgisine ihtiyaç duymadan, yalnızca 2-3 dakika içinde **kendi adlarına bağımsız görünen, lüks ve modern bir kişisel web sitesi** kurmalarını sağlayan yeni nesil bir portfolyo ve vitrin motorudur.

### Temel Felsefe:
> *"Bir yazarın dijital dünyadaki evi çirkin bir Linktree veya karmaşık bir WordPress sitesi olmamalıdır. Bir yazarın evi; kendi kitaplarını, kurduğu fantastik evrenleri, edebi güncesini ve hayran bültenini tek bir dokunuşla sergileyen büyüleyici bir atölye olmalıdır."*

Platformdan tamamen bağımsızmış gibi duran ama arka planda Readixon veritabanına bağlı olan bu siteler, yazar her yeni bölüm yayınladığında sıfır çabayla kendi kendini günceller.

---

## 2. Problem Tanımı & Çözüm Formülü

### Yazarların Mevcut Çilesi:
1. **Linktree ve Benzerleri Çok Çirkin:** Yazarın prestijini zedeliyor, edebi derinlikten yoksun, sadece basit link listelerinden ibaret.
2. **WordPress / Wix Çok Zor ve Pahalı:** Yıllık hosting, domain masrafı, tema karmaşası ve teknik bakım zorluğu yazarları pes ettiriyor.
3. **Manuel Güncelleme İşkencesi:** Yazar yeni bir kitap veya bölüm yayınladığında bağımsız sitesini manuel güncellemek zorunda kalıyor; çoğu zaman siteler güncellenmeyip atıl kalıyor.
4. **Evren ve Lore Sergileyecek Bir Yer Yok:** Yazarların kurduğu kurgusal evrenler, haritalar ve karakter ağları hiçbir standart web sitesinde interaktif sunulamıyor.

### Readixon Çözümü (Atelier Formülü):
| Problem | Readixon Atelier Çözümü |
| :--- | :--- |
| **Teknik Zorluk** | Sıfır kod. Yazar hazır şablonunu seçer, 3 tıkla yayınlar. |
| **Maliyet** | Sıfır hosting masrafı. Readixon altyapısında ücretsiz ve sınırsız barındırılır. |
| **Güncellik** | Otomatik senkronizasyon. Readixon'da yeni bölüm/kitap yayınlandığı an kişisel sitedeki vitrin kendiliğinden güncellenir. |
| **Bağımsızlık İllüzyonu** | Readixon'ın genel karmaşık arayüzünden (sidebar, keşfet, genel bildirimler) arındırılmış, yazarın logosu ve özel navigasyonu olan izole lüks web sitesi. |
| **Evren Entegrasyonu** | Evren Stüdyosu'nda çizilen interaktif haritalar, karakter ilişkileri ve sözlük doğrudan yazarın sitesine gömülebilir! |
| **Edebi Blog & Bülten** | Kitap dışı denemeler, yazarlık notları ve okurların e-posta ile abone olduğu hayran bülteni. |

---

## 3. Kullanıcı Profilleri & Senaryolar

### 1. "Genç Çıkış Yapan Yazar" (Debut Author)
* **İhtiyaç:** Sosyal medyada (Instagram/TikTok bio'su) paylaşabileceği prestijli bir adres.
* **Deneyim:** 1 kitap, kısa bir yazar biyografisi, Spotify yazma çalma listesi ve "Beni Oku" butonu. 2 dakikada yayına alır.

### 2. "Epik Seri ve Evren Mimarı" (Worldbuilder Author)
* **İhtiyaç:** 3 ciltlik serisini, karmaşık karakter soy ağaçlarını ve dünya haritasını bir arada sergilemek.
* **Deneyim:** Sinematik koyu şablonu seçer. Sayfanın ortasında interaktif harita pini, karakter galerisi ve Cilt 1-2-3 kartları yer alır. Ziyaretçi büyülenir.

### 3. "Webtoon Çizeri & Sanatçı"
* **İhtiyaç:** Görsel ağırlıklı panel vitrini, karakter konsept çizimleri galerisi, Instagram/Patreon linkleri.
* **Deneyim:** Pop-Modern şablonu seçer. Dikey renkli webtoon bölümleri ve canlı karakter kartları öne çıkar.

### 4. "Dış Ziyaretçi / Yayınevi Editörü"
* **Deneyim:** Yazarın bio'sundaki linke tıklar. Karşısına tam teşekküllü profesyonel bir yazar sitesi çıkar. "Kitabı Oku" dediğinde pürüzsüzce Readixon Reader'a akar. Yazarın ciddiyetine ve profesyonelliğine hayran kalır.

---

## 4. Mimari Tasarım & "Bağımsızlık İllüzyonu"

Yazarın kişisel sitesi, Readixon'ın genel platform arayüzünden tamamen yalıtılmış olarak render edilir.

```
                    ┌──────────────────────────────────────────┐
                    │        readixon.com/atelier/@ahmet       │
                    │         veya ahmet.readixon.com          │
                    └─────────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴──────────────────────┐
                  ▼                                              ▼
    [İzole Yazar Arayüzü (Standalone)]             [Genel Platformdan Arındırma]
    - Özel Yazar Başlığı (Header)                  - Genel sol sidebar YOK
    - Özel Renk Paleti & Tipografi                 - Genel keşfet/arama barları YOK
    - Yazarın Menüsü: Eserler/Evren/Blog           - Genel bildirim zilleri YOK
    - Seçilen Şablon (Novelist/Worldbuilder)       - Yazarın tam kontrolü
                  │
                  ▼
    [Readixon Çekirdeği ile Canlı Bağlantı]
    - Kitap tıklandığında ➔ Readixon Reader'a akıcı geçiş
    - Yeni bölüm yayınlandığında ➔ Anında vitrinde görünür
    - En altta zarif imza: "Designed with Readixon Atelier" (Viral büyüme)
```

### URL Hiyerarşisi:
1. **Varsayılan Rota (Faz 1):** `readixon.com/atelier/[username]` veya `readixon.com/@username/site`
2. **Kısa Alt Alan Adı (Faz 2):** `[username].readixon.com` (Subdomain middleware yönlendirmesi)
3. **Özel Alan Adı (Faz 3):** `www.ahmetkaraca.com` (CNAME DNS eşlemesi - Premium özellik)

---

## 5. Detaylı Veri Modelleri & Firestore Şeması

Yazar web sitesi verileri, Firestore'da bağımsız ve performans odaklı bir yapıda tutulur:

### Koleksiyon: `author_sites`
**Belge ID:** `siteId` (Kullanıcının `userId` değeri ile 1-e-1 eşleşir)

```typescript
export interface AuthorSite {
  id: string;                          // userId ile aynı
  userId: string;                      // Eser sahibinin uid'si
  username: string;                    // @username (URL için)
  slug: string;                        // Özel URL slug (örn: 'ahmet-karaca')
  isPublished: boolean;                // Sitenin yayında olup olmadığı
  publishedAt?: any;                   // İlk yayınlanma tarihi
  updatedAt?: any;                     // Son güncelleme tarihi

  // Alan Adı Konfigürasyonu
  domainConfig: {
    subdomain?: string;                // örn: 'ahmet' -> ahmet.readixon.com
    customDomain?: string;             // örn: 'www.ahmetkaraca.com'
    isDomainVerified?: boolean;
    dnsVerificationToken?: string;
  };

  // Tema & Tipografi Konfigürasyonu
  themeConfig: {
    template: 'novelist' | 'worldbuilder' | 'webtoon' | 'minimalist';
    mode: 'light' | 'sepia' | 'dark' | 'oled';
    primaryColor: string;              // Vurgu rengi (HEX / HSL)
    fontHeading: string;               // Başlık fontu (Playfair, Cinzel, Montserrat, Outfit vb.)
    fontBody: string;                  // Gövde fontu (Inter, Merriweather, Lora vb.)
    cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };

  // SEO & Sosyal Paylaşım
  seo: {
    siteTitle: string;                 // Örn: "Ahmet Karaca | Resmi Yazar Web Sitesi"
    tagline: string;                   // Örn: "Karanlık Fantezi ve Epik Serüvenler"
    description: string;               // Meta açıklama
    ogImageUrl?: string;               // Sosyal medya kart görseli
    faviconUrl?: string;               // Özel site ikonu
  };

  // 1. Hero / Karşılama Bloğu
  hero: {
    enabled: boolean;
    authorName: string;
    authorTitle: string;               // Örn: "Fantastik Kurgu Yazarı & Dünya Mimarı"
    bioShort: string;                  // Karşılama mottosu
    avatarUrl?: string;                // Yazarın portresi
    bannerUrl?: string;                // Geniş arka plan bannerı
    currentStatus?: string;            // Örn: "Şu an 'Gölge Çağı Cilt 2' üzerinde çalışıyor..."
    ctaButton: {
      enabled: boolean;
      text: string;                    // Örn: "Son Kitabı Oku"
      linkType: 'featured_story' | 'custom_url' | 'blog';
      targetId?: string;
    };
  };

  // 2. Blok Yönetimi & Sıralaması
  blocksOrder: string[];               // ['hero', 'featured_books', 'universe_showcase', 'blog', 'about', 'events', 'newsletter', 'social']
  enabledBlocks: Record<string, boolean>;

  // 3. Eserler Vitrini (Bookshelf) Bloğu
  booksConfig: {
    title: string;                     // "Eserlerim & Romanlarım"
    description?: string;
    displayMode: 'grid' | 'carousel' | 'curated_shelf';
    selectedStoryIds: string[];        // Öne çıkarılacak Readixon kitapları (boşsa tümü)
    showRatings: boolean;
    showEditorialBadge: boolean;
    showChapterCount: boolean;
  };

  // 4. Evren & Lore Vitrini Bloğu
  universeConfig: {
    enabled: boolean;
    universeId?: string;               // Evren Stüdyosu'ndan bağlanan evren
    title: string;                     // "Aetheria Evreni & Kurgusal Dünya"
    showInteractiveMap: boolean;
    showCharacterCards: boolean;
    showGlossaryPreview: boolean;
    showTimeline: boolean;
  };

  // 5. Yazarın Hakkında & Basın Bloğu
  aboutConfig: {
    title: string;                     // "Yazar Hakkında"
    richBioMarkdown: string;           // Detaylı edebi özgeçmiş
    pressQuotes: {
      quote: string;
      source: string;                  // Örn: "Hürriyet Kitap Sanat"
      year?: string;
    }[];
    awards: {
      title: string;
      year: string;
      institution: string;             // Örn: "TBD Bilimkurgu Öykü Ödülü"
    }[];
  };

  // 6. Etkinlikler & İmza Günleri Bloğu
  eventsConfig: {
    enabled: boolean;
    title: string;                     // "Gelecek Etkinlikler & İmza Günleri"
    events: {
      id: string;
      title: string;
      dateStr: string;
      location: string;                // "Tüyap Kitap Fuarı, Salon 3"
      type: 'signing' | 'panel' | 'online_interview';
      linkUrl?: string;
    }[];
  };

  // 7. Hayran Bülteni (Newsletter) Bloğu
  newsletterConfig: {
    enabled: boolean;
    title: string;                     // "Yazarın Edebi Bültenine Abone Ol"
    description: string;               // "Yeni kitaplar, gizli bölümler ve kamera arkası yazılarından ilk sen haberdar ol."
    buttonText: string;                // "Bültene Katıl"
    successMessage: string;
  };

  // 8. Sosyal Ağlar & Müzik
  socialConfig: {
    instagram?: string;
    twitter?: string;
    goodreads?: string;
    youtube?: string;
    tiktok?: string;
    spotifyPlaylistUrl?: string;       // "Yazarken Dinlediğim Parçalar"
    contactEmail?: string;
  };

  // İstatistikler (Analytics)
  analytics: {
    totalViews: number;
    uniqueVisitors: number;
    bookClicks: number;
    subscribersCount: number;
  };
}
```

---

### Alt Koleksiyon: `author_sites/{siteId}/blog_posts`
Yazarın kendi sitesinde yayınladığı edebi denemeler ve kamera arkası notları:

```typescript
export interface AuthorBlogPost {
  id: string;
  siteId: string;
  authorId: string;
  title: string;
  slug: string;                        // URL dostu
  excerpt: string;                     // Kısa özet
  contentMarkdown: string;             // Zengin blog metni
  coverImageUrl?: string;
  tags: string[];
  publishedAt: any;
  isPublished: boolean;
  viewsCount: number;
  likesCount: number;
}
```

---

### Alt Koleksiyon: `author_sites/{siteId}/subscribers`
Yazarın bültenine abone olan okur kitlesi (Yazar bu listeyi CSV olarak indirebilir):

```typescript
export interface AuthorSubscriber {
  id: string;
  email: string;
  createdAt: any;
  status: 'active' | 'unsubscribed';
  source: 'site_footer' | 'hero_cta' | 'blog_post';
}
```

---

## 6. 3 Hazır Prestij Tasarım Şablonu (Presets)

Her şablon, CSS değişkenleri ve tipografi hiyerarşisiyle baştan aşağı farklı bir edebi ruh yaşatır:

### 1. The Novelist (Zarif Edebi Klasik)
* **Karakter:** Haruki Murakami, Orhan Pamuk, Kazuo Ishiguro çizgisi.
* **Tipografi:** Başlıklarda `Playfair Display` veya `Lora`, gövdede `Merriweather`.
* **Renk Paleti:** Sıcak keten kağıdı (#FBF8F3), antika mürekkep siyahı (#1A1918), zarif bordo veya zeytin yeşili vurgular.
* **Öne Çıkan His:** Kahve kokulu, sakin, felsefi ve zamansız bir kütüphane havası.

### 2. The Worldbuilder (Sinematik Koyu & Epik Fantezi)
* **Karakter:** Brandon Sanderson, J.R.R. Tolkien, Patrick Rothfuss çizgisi.
* **Tipografi:** Başlıklarda `Cinzel` veya `Medieval / Trajan`, gövdede `Inter`.
* **Renk Paleti:** Gece yarısı obsidyeni (#0A0A0E), mistik aether moru (#7C3AED) veya antik altın varak (#F59E0B) parıltıları.
* **Öne Çıkan His:** Kadim bir büyülü dünyaya adım atma hissi, interaktif haritalar ve gizemli atmosfer.

### 3. The Webtoon & Pop (Modern & Dinamik)
* **Karakter:** Webtoon çizerleri, genç yetişkin (YA) ve manga yaratıcıları.
* **Tipografi:** Başlıklarda `Outfit` veya `Plus Jakarta Sans`, gövdede `DM Sans`.
* **Renk Paleti:** Canlı neon mercan (#FF4B72), siber mavi (#00E5FF), temiz kartlar, yuvarlatılmış köşeler.
* **Öne Çıkan His:** Enerjik, renkli, modern sosyal medya estetiği ve görsel zenginlik.

---

## 7. Modüler Blok Mimarisi (Lego Sistemi)

Yazar kendi sitesini lego blokları gibi oluşturur. Her blok tek bir anahtarla (toggle) açılıp kapatılabilir ve sürükle-bırak yöntemiyle sırası değiştirilebilir:

1. **`HeroBlock`:** Portre, yazar unvanı, motto, "Şu an Yazıyor..." anlık rozeti, ana eylem butonu.
2. **`BookshelfBlock`:** 3D gölgeli kitap kapakları, puanlar, özetler ve doğrudan "Readixon'da Oku" köprüsü.
3. **`UniverseBlock`:** Evren Stüdyosu'ndan çekilen canlı interaktif harita, ana ırklar ve karakter galerisi.
4. **`AboutBlock`:** Yazarın hayatı, edebi yolculuğu, kazandığı ödüller ve basında çıkan övgüler.
5. **`BlogBlock`:** Yazarın edebi denemeleri, yazarlık serüvenleri ve sahne arkası notları.
6. **`EventsBlock`:** İmza günleri, fuar takvimi, online söyleşiler.
7. **`NewsletterBlock`:** Okurlardan e-posta toplayan zarif bülten kutusu.
8. **`SocialAndSpotifyBlock`:** Sosyal medya ikonları ve Spotify atmosfer çalma listesi çaları.
9. **`FooterBlock`:** Telif hakkı bildirimi ve prestijli *"Designed with Readixon Atelier"* bağlantısı.

---

## 8. Yazar Stüdyosu: Atelier Builder (`/studio/atelier`)

Yazarın sitesini düzenlediği stüdyo ekranı **bölünmüş ekran (split-screen)** mantığıyla çalışır:

```
┌───────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ SOL PANEL: ATELIER KONTROL MERKEZİ           │ SAĞ PANEL: CANLI ÖNİZLEME (LIVE PREVIEW)               │
├───────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ [ Sekmeler ]                                  │ [ Cihaz Toggle: 📱 Mobil | 💻 Masaüstü ]              │
│ • Şablon & Tema (Novelist, Worldbuilder...)   │                                                        │
│ • Bloklar (Sürükle - Bırak - Aç / Kapa)       │ ┌────────────────────────────────────────────────────┐ │
│ • Eser Vitrini Seçimi                         │ │ AHMET KARACA                                       │ │
│ • Evren Entegrasyonu                          │ │ Fantastik Kurgu Yazarı                             │ │
│ • Blog Yazıları                               │ │                                                    │ │
│ • Ayarlar & Alan Adı                          │ │ [ 3D Kitap Vitrini ]                              │ │
│                                               │ │ [ İnteraktif Dünya Haritası ]                     │ │
│ [ Kaydet ]   [ Siteyi Yayınla (Canlıya Al) ]  │ └────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

* **Sıfır Yenileme:** Sol tarafta renk, başlık veya blok açılıp kapatıldığında sağdaki canlı önizleme milisaniyeler içinde reaktif olarak güncellenir.
* **Mobil Önizleme Desteği:** Yazar tek tıkla sitenin telefon ekranında nasıl göründüğünü denetler.

---

## 9. Kamuya Açık Vitrin Deneyimi (`/atelier/[username]`)

Dışarıdan gelen bir ziyaretçi siteye girdiğinde karşılaştığı kusursuz akış:

1. **Hızlı Açılış (Ultra Fast):** Sıfır gereksiz JS yükü, Next.js App Router ile optimize edilmiş statik & dinamik render.
2. **Kişisel Menü:**
   `[Yazar İsmi] ────────── [Eserler] ── [Evren] ── [Günce] ── [Biyografi] ── [İletişim]`
3. **Pürüzsüz Okuma Geçişi:**
   Ziyaretçi bir kitaba tıkladığında:
   * Şık bir mini modal açılır: Kitabın özeti, bölüm sayısı, editör puanı.
   * **"1. Bölümü Oku"** butonuna basıldığı an, doğrudan Readixon'ın lüks okuma motoruna geçer. Ziyaretçi artık Readixon okuruna dönüşmüştür!
4. **Ziyaretçiyi Abone Yapma:**
   Bülten kutusuna e-posta girildiğinde tek tıkla başarı animasyonu çıkar; yazarın abone listesine eklenir.

---

## 10. Yazar Blogu & Bülten (Newsletter) Alt Sistemi

Yazarlar sadece kitap yazmaz; edebi denemeler, karakter analizleri veya günlük düşüncelerini de paylaşmak ister.

* **Substack / Medium Tarzı Temiz Tipografi:** Başlık, kapak görseli, akıcı okuma metni.
* **Okur Etkileşimi:** Blog yazılarına beğeni bırakma ve düşünce paylaşma.
* **Bülten Entegrasyonu:** Yazar her yeni blog yazısı veya yeni kitap yayınladığında, stüdyodan tek tıkla *"Tüm bülten abonelerime e-posta gönder"* diyebilir (Sendgrid / Resend altyapısı ile).

---

## 11. SEO, Performans & Paylaşım Mimarisi

* **Dinamik OpenGraph (OG) Kartları:** Yazar sitesinin linki WhatsApp, Twitter veya Instagram'da paylaşıldığında:
  * Başlık: `Ahmet Karaca — Resmi Yazar Web Sitesi`
  * Açıklama: Yazarın mottosu ve kitap sayısı.
  * Görsel: Yazar portresi ve son kitabının birleştiği özel kapak.
* **Google SEO İndekslemesi:** `JSON-LD Schema` (Person, Author, Book formatında) otomatik enjekte edilir. Google'da yazarın adı aratıldığında ilk sırada bu site çıkar.

---

## 12. Aşama Aşama Uygulama Yol Haritası (Fazlar)

Projeyi risksiz, test edilebilir ve adım adım inşa edeceğimiz plan:

### 🚀 FAZ 1: Veri Modeli, Servis Katmanı ve Stüdyo Builder Paneli
* [ ] `AuthorSite`, `AuthorBlogPost`, `AuthorSubscriber` TypeScript tiplerinin tanımlanması.
* [ ] Firestore CRUD servislerinin yazılması (`getAuthorSite`, `saveAuthorSite`, `publishAuthorSite`).
* [ ] Yazar Stüdyosu'nda `/studio/atelier` sayfasının oluşturulması (Tema seçici, Hero düzenleyici, Blok aç/kapa mantığı).
* [ ] Canlı önizleme (Live Preview) bileşeni.

### 🎨 FAZ 2: Kamuya Açık Vitrin Motoru & 3 Prestij Şablonu
* [ ] Bağımsız layout (`apps/web/src/app/(atelier)/atelier/[username]/page.tsx`).
* [ ] 3 Şablonun CSS ve UI sisteminin kurulması (*The Novelist*, *The Worldbuilder*, *The Webtoon & Pop*).
* [ ] Eserler Vitrini (`BookshelfBlock`) ve Readixon Reader bağlantısı.
* [ ] Evren Stüdyosu entegrasyonu (`UniverseBlock` - Harita ve Karakterler).

### ✍️ FAZ 3: Yazar Blogu & Hayran Bülteni (Newsletter)
* [ ] Blog yazı editörü ve kamu blog detay sayfası (`/atelier/[username]/blog/[slug]`).
* [ ] Bülten e-posta toplama formu ve stüdyoda abone listesi paneli (CSV indirme).
* [ ] Hakkımda, Ödüller, Etkinlik Takvimi ve Spotify çalma listesi blokları.

### 🌐 FAZ 4: Subdomain & Viral Büyüme Cilası
* [ ] `[username].readixon.com` alt alan adı desteği için Next.js middleware yönlendirmesi.
* [ ] Dinamik OG Image ve SEO schema zenginleştirmesi.
* [ ] *"Designed with Readixon Atelier"* yönlendirme ve davet motoru.

---
*Hazırlayan: Readixon Core Engineering & Product Architecture*
