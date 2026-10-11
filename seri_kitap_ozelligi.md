# Readixon — Seri Kitap Özelliği (Book Series / Saga) Tasarım ve Uygulama Planı

Bu belge, Readixon platformunda bağımsız eserleri (roman ve webtoon) kurgusal evrenler, ciltler veya devam kitapları altında birleştiren **Seri Kitap (Series / Saga)** özelliğinin mimari, UX ve yönetim planını içerir.

---

## 1. 🎯 Amaç ve Katma Değer

1. **Okuyucu Devamlılığı (Retention):** 1. Kitabı bitiren okurun doğal bir akışla 2. ve 3. Kitaba geçiş yapmasını sağlayarak platformdaki okuma süresini ve bağlılığı katlamak.
2. **Yazar Motivasyonu:** Yazarların triolojiler, çok ciltli seriler veya geniş kurgusal evrenler (Franchise/Universe) kurgulamasını teşvik etmek.
3. **Kürasyon ve Keşif:** Editörlerin sadece tekil kitapları değil, bütüncül "Efsane Serileri" vitrine taşımasını sağlamak.

---

## 2. 🏗️ Veri Modeli ve Firestore Mimarisi

Mevcut `Story` ve `Chapter` yapısını bozmadan, ilişkisel bir üst model (`Series`) tanımlanır.

### 2.1. Yeni Koleksiyon: `/series/{seriesId}`

```typescript
export interface SeriesBookItem {
  storyId: string;
  order: number;            // 1, 2, 3... (Sıralama)
  customLabel?: string;     // Örn: "1. Cilt", "Başlangıç", "Prequel"
}

export interface SeriesStats {
  totalViews: number;       // Serideki tüm kitapların toplam okunması
  totalLikes: number;       // Serideki tüm kitapların toplam beğenisi
  bookCount: number;        // Serideki toplam kitap sayısı
}

export interface Series {
  seriesId: string;
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  
  title: string;             // Seri Adı (Örn: "Gölge Krallığı Serisi")
  slug: string;              // URL dostu benzersiz kimlik (golge-kralligi-serisi-xxxx)
  description: string;       // Evren / seri hakkında genel özet
  coverImage: string;        // Seriye özel kapak afişi
  tags: string[];            // Tür etiketleri (Fantastik, Macera vb.)
  
  status: 'ongoing' | 'completed'; // Seri devam ediyor mu, bitti mi?
  books: SeriesBookItem[];   // Seriye dahil kitaplar ve sıralaması
  
  stats: SeriesStats;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2. Mevcut `Story` Modeline Eklenecek Alanlar

Her `Story` dokümanında seriye ait hafif denormalize bilgiler tutulur (ekstra sorgu atmadan kartlarda gösterebilmek için):

```typescript
// Story arayüzüne eklenecek alanlar:
export interface Story {
  // ... mevcut alanlar ...
  seriesId?: string;         // Bağlı olduğu seri ID'si
  seriesTitle?: string;      // Serinin adı (Örn: "Gölge Krallığı")
  seriesOrder?: number;      // Kaçıncı kitap olduğu (Örn: 1, 2)
  seriesLabel?: string;      // Opsiyonel özel etiket (Örn: "1. Kitap")
}
```

---

## 3. 🔍 Keşfet & Okur Deneyimi (Explore & Reader)

### 3.1. Kitap Kartlarında Seri Rozeti (`StoryCard`)
* Kapak üzerinde veya başlığın hemen üstünde dinamik rozet:
  * `📚 Seri: 1. Kitap` veya `📚 3 Kitaplık Seri`
* Tıklandığında doğrudan serinin sayfasına veya kitabın detayına yönlendirme.

### 3.2. Keşfet ve Ana Sayfa Akışı (`/feed` ve `/search`)
* **"Sürükleyici Kitap Serileri"** yatay vitrin şeridi:
  * Serinin ortak kapağı, seri adı, kaç kitaptan oluştuğu ve toplam okunma sayısı.
* Filtreleme: Arama ve keşfet ekranında *"Sadece Seriler"* filtresi.

### 3.3. Kitap Detay Sayfası (`/story/[slug]`)
* **Breadcrumb:** Başlığın üstünde: `👑 Gölge Krallığı Serisi › 1. Kitap`.
* **"Serinin Diğer Kitapları" Bölümü:**
  * Kitap özetinin hemen altında yatay kartlar şeklinde serinin tüm kitapları listelenir:
    * `[1. Kitap (Şu anki)]` ➔ `[2. Kitap: İntikam]` ➔ `[3. Kitap: Son Savaş (Yakında)]`
  * Durumu tamamlanan/devam eden kitaplar için anında okuma başlatma butonu.

### 3.4. Bölüm Okuyucusu (Reader) Akışı
* Okur bir kitabın **Son Bölümünü** bitirdiğinde:
  * Bölüm sonu ekranında özel tebrik ve devam kartı:
    * *"Gölge Krallığı 1. Kitabı tamamladınız! Macera 2. Kitapta devam ediyor:"*
    * **[2. Kitaba Başla]** butonu ile tek tıkla sonraki kitaba pürüzsüz geçiş.

---

## 4. ✍️ Yazar & Stüdyo Deneyimi (`/studio`)

Yazarlara serileri yönetmek için zahmetsiz iki yönlü bir kontrol sağlanır:

1. **Stüdyo Ana Ekranında "Serilerim" Sekmesi:**
   * "Romanlarım" ve "Webtoonlarım" yanında **"Kitap Serilerim"** menüsü.
   * *"Yeni Seri Oluştur"* modalı (Seri Adı, Açıklaması, Kapak Resmi).
   * Yazarın mevcut kitaplarından seriye kitap ekleme ve sıralama:
     * Sıra 1: Kitap A
     * Sıra 2: Kitap B
   * Sürükle-bırak veya Yukarı/Aşağı okları ile kitap sırasını anında değiştirme.
2. **Tekil Kitap Düzenleme Ekranında (`/studio/story/[storyId]`):**
   * "Seri Bağlantısı" kartı:
     * Dropdown'dan mevcut serilerinden birini seçip sıra numarası belirleyebilme veya *"Yeni Seri Başlat"* butonuna basabilme.

---

## 5. 🎖️ Editör / Kürasyon Paneli (`/editor`)

1. **`/editor/series` Modülü:**
   * Editörlerin platformdaki tüm serileri listelemesi ve incelemesi.
2. **Manşet Vitrini Entegrasyonu (`/editor/hero`):**
   * Editör ana sayfa döner vitrinine tekil kitap yerine doğrudan bir **Seriyi** afişe edebilir.
3. **Editoryal Seri Rozetleri:**
   * *"Kusursuz Seri"*, *"Editörün Seçimi Seri"*, *"Binge-Read Tavsiyesi"*.

---

## 6. 🛡️ Admin Paneli (`/admin`)

1. **`/admin/series` Yönetim Tablosu:**
   * Seri Adı, Yazar, İçerdiği Kitap Sayısı, Toplam Okunma/Beğeni, Oluşturulma Tarihi.
2. **Yönetim Aksiyonları:**
   * Kural ihlali durumunda seriyi yayından kaldırma veya silme.
   * Seriyi dağıtma (kitaplar silinmez, yalnızca seriden ayrılır).

---

## 7. 🚀 Aşamalı Uygulama Planı

* **Faz 1:** `@readixon/core` veri tipleri, `seriesService.ts` (CRUD fonksiyonları) ve Firestore koleksiyonu.
* **Faz 2:** Stüdyo içinde yazarın seri oluşturabilmesi, kitaplarını ekleyip sıralayabilmesi.
* **Faz 3:** Kitap detay sayfasında (`/story/[slug]`) ve Reader son bölümünde seri şeridi ve sonraki kitaba geçiş kartı.
* **Faz 4:** StoryCard rozetleri, Feed/Keşfet seriler vitrini.
* **Faz 5:** Editor ve Admin panelleri.
