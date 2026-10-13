# Readixon V2 — Kapsamlı Sistem, Mimari ve Modül Rehberi

Bu belge; Readixon platformunda geliştirilen tüm ana modüllerin, kullanıcı deneyimi akışlarının, Evren Stüdyosu entegrasyonlarının ve okuma devriminin detaylı teknik ve edebi özetini içerir.

---

## 📌 İçindekiler
1. [Evren Stüdyosu (Universe Studio — Worldbuilding Engine)](#1-evren-stüdyosu-universe-studio)
2. [Yazar Akademisi (Writer Academy)](#2-yazar-akademisi-writer-academy)
3. [Seri Kitap Sistemi ve Bölüm Editörü](#3-seri-kitap-sistemi-ve-bölüm-editörü)
4. [Readix Sayfası (Edebi Mikroblog & Sosyal Ağ)](#4-readix-sayfası-edebi-mikroblog--sosyal-ağ)
5. [Gündem Sayfası (Kültür & Sanat Gazetesi)](#5-gündem-sayfası-kültür--sanat-gazetesi)
6. [Keşfet Sayfası (Çok Boyutlu İçerik Vitrini)](#6-keşfet-sayfası-çok-boyutlu-içerik-vitrini)
7. [Kitap Detay Sayfası (`/story/[slug]`)](#7-kitap-detay-sayfası-storyslug)
8. [Evren Stüdyosu ile Birleşen Okuma Deneyimi (`/read`)](#8-evren-stüdyosu-ile-birleşen-okuma-deneyimi-read)

---

## 1. Evren Stüdyosu (Universe Studio)

Evren Stüdyosu (`/studio/universes/[universeId]`), yazarların romanları için devasa, tutarlı kurgusal dünyalar (lore, coğrafya, tarih, kanon kuralları) inşa etmesini sağlayan 20+ alt sistemden oluşan bir dünya kurma motorudur.

### 🌟 Temel Modüller ve Yetenekler
* **Karakterler & Soy Ağaçları:** Fiziksel görünüm, psikoloji, güç seviyeleri, köken ve aile bağları.
* **Karakter İlişkileri Grafiği (Force-directed Graph):** Karakterler arasındaki dostluk, düşmanlık, aşk, akrabalık ve ittifak bağlarını interaktif bir ağ düğümünde görselleştirme.
* **Etkileşimli Dünya Haritası (Maps):** Özel harita görseli yükleme, üzerine sürükle-bırak pin'ler yerleştirme, krallıklar, tapınaklar ve tehlikeli bölgelerin koordinatlarını belirleme.
* **Zaman Çizelgesi (Timeline):** Çağlar, savaşlar, devrimler ve kurgusal takvim dönemleri.
* **Ansiklopedi & Sözlük (Glossary):** Kurgusal diller, terimler, büyüler ve felsefi kavramlar.
* **Nesneler & Yadigârlar (Items & Relics):** Efsanevi silahlar, kadim parşömenler ve güç gereksinimleri.
* **Yaratıklar & Canavarlar (Creatures):** Tehlike seviyesi, yaşam alanları, zayıflıkları ve davranış kalıpları.
* **Büyü & Güç Sistemleri (Powers):** Bedel kuralları, kaynak (mana/aether), sınırlar ve istisnalar.
* **Kanon Kuralları (Canon Rules):** Yazarın dünyasında asla çiğnenemeyecek mutlak fizik ve büyü yasaları.
* **Gizemler & Olay Örgüleri (Plot Threads):** Açık kalan sırlar, çözülmemiş cinayetler, ihanetler ve bunların hangi kitaplarda çözüleceği.

### 🛡️ Dinamik Spoiler Kalkanı Motoru (PRD Bölüm 37, 38)
* Her evren varlığına (karakter, nesne, terim, mekân) yazar tarafından bir `spoilerThresholdChapter` atanabilir.
* Okur eseri okurken o bölümün gerisindeyse, varlığın sırları ve gerçek kimliği otomatik olarak maskelenir.

---

## 2. Yazar Akademisi (Writer Academy)

Yazar Akademisi (`/academy`), okurları ve hevesli yazarları usta birer hikaye anlatıcısına dönüştüren interaktif eğitim merkezidir.

### 🎯 4 Uzmanlık Yolu (Learning Paths)
1. **Roman Yazarlığı:** Olay örgüsü mimarisi, karakter arkı, diyalog ritmi ve "Gösterme, Anlat" (Show, Don't Tell) prensibi.
2. **Seri & Evren Mimarlığı:** Çok ciltli hikaye yönetimi, kurgusal dünya kanunları ve retcon önleme teknikleri.
3. **Fantastik & Bilim Kurgu:** Sert/yumuşak büyü sistemleri, uzay çağı teknolojileri ve yaratık ekolojisi.
4. **Webtoon & Görsel Hikayecilik:** Panel akışı, dikey okuma ritmi, uçurum sahneleri (cliffhangers) ve görsel tempo.

### 📚 8 Kategori & 20 Usta Dersi
* **Kategoriler:** Karakter İnşası, Olay Örgüsü, Dünya Kurma, Diyalog & Üslup, Büyü Sistemleri, Görsel Anlatım, Revizyon & Düzenleme, Yayıncılık & Kariyer.
* **İnteraktif Ders Deneyimi:** 
  * Her derste doğrudan uygulanabilir **Pro-İpuçları (Pro-Tips)**.
  * Ders sonu **Puanlı Test / Quiz Motoru** (anlık geri bildirim ve analiz).
  * XP ve Başarım Rozetleri (Gamification) sistemi.

---

## 3. Seri Kitap Sistemi ve Bölüm Editörü

### 📖 Seri Kitap Sistemi (`/series`, `/studio/series`)
* **Cilt & Sıralama Yönetimi:** Birbirine bağlı kitapların "Cilt 1, Cilt 2, Cilt 3" şeklinde kronolojik veya yan hikaye (Spin-off) olarak bağlanması.
* **Seri Detay Sayfası:** Tüm ciltlerin durumunu, toplam bölüm sayısını ve seriye bağlı evreni tek bakışta sunan özel vitrin.

### ✍️ Bölüm Editörü (`/studio/stories/[storyId]/chapters/[chapterId]`)
* **BlockEditor:** Tipografik konfor, otomatik taslak kaydetme, paragraf odak modu.
* **PlannerSidebar:** Bölümün hedef kelime sayısı, sahne hedefleri, karakter gelişim notları.
* **UniverseSidebar (2.900+ satırlık akıllı panel):** Yazar metni yazarken editör arka planda yazılan isimleri analiz eder; evrendeki karakter veya mekânla eşleştiğinde sağ panelde o varlığın bilgilerini anında açar. Yazar pencere değiştirmeden dünya kurallarını hatırlar.

---

## 4. Readix Sayfası (Edebi Mikroblog & Sosyal Ağ)

Readix (`/readix`), kitap tutkunlarının ve yazarların Twitter/X dinamizmiyle etkileşime girdiği sosyal platformdur.

* **Edebi Mikro Paylaşımlar:** 280+ karakterlik düşünceler, görsel galerileri, kitap alıntıları.
* **Trend Hashtag'ler (`#GününTrendleri`):** En çok konuşulan kitaplar, karakterler ve tür tartışmaları.
* **Doğrudan Kitap Bağlantısı:** Paylaşılan bir Readix'e tek tıkla incelenen kitabı iliştirme (Linked Story Card).
* **Etkileşimler:** Beğeni, yorum, yeniden paylaşım (repost), alıntı paylaşımı ve interaktif anketler.

---

## 5. Gündem Sayfası (Kültür & Sanat Gazetesi)

Gündem (`/agenda`), edebiyat dünyasının nabzını tutan entelektüel kültür-sanat gazetesidir.

* **8.0+ Edebi Şaheserler Vitrini:** Platformda editör veya okur puanı 8.0 ve üzeri olan başyapıtların 3D kitap olarak sergilendiği altın vitrin.
* **Kültür & Sanat Haberleri:** Yazar röportajları, yarışma duyuruları, kitap fuarları ve edebi makaleler.
* **Günün Edebiyat Anketi:** Topluluğu tartışmaya çeken interaktif oylamalar.

---

## 6. Keşfet Sayfası (Çok Boyutlu İçerik Vitrini)

Keşfet (`/discover`), her okuma zevkine özel olarak tasarlanmış ana keşif merkezidir.

* **4 Ana Format Ayrımı:**
  1. *Romanlar:* Klasik ve çağdaş düz yazı eserleri.
  2. *Kitap Serileri:* Çok ciltli, destansı edebi serüvenler.
  3. *Fantastik Evrenler:* Zengin ansiklopedisi olan genişletilmiş evrenler.
  4. *Webtoonlar:* Dikey akışlı, tam renkli çizgi romanlar.
* **Filtreleme & Keşif:** Editörün Seçtikleri, Haftanın En Çok Okunanları, Yeni Başlayanlar İçin Evrenler, Türe Göre Keşif (Cyberpunk, Epik Fantezi, Romantizm vb.).

---

## 7. Kitap Detay Sayfası (`/story/[slug]`)

Bir eserin vitrini olan detay sayfası, sinematik bir yapım bülteni gibi çalışır:

### 🎨 Hero ve Kapak Alanı
* **3D Kapak & Blur Atmosfer:** Kapağın renk paletinden türetilen dinamik atmosferik arka plan.
* **Seri & Evren Rozetleri:** Eserin bağlı olduğu seri (`Seri Adı #1`) ve evren (`🌌 Evren Adı`) etiketleri.
* **Editör Puanı:** Edebiyat kurulunun verdiği puan (`Editör Puanı: 8.5/10`) ve bağımsız inceleme raporu linki.
* **Kaldığın Yerden Devam Et:** Okurun kaldığı bölümü hatırlayan (`Bölüm 4: Sisli Gece`) akıllı ana buton.
* **4'lü Eylem Barı:** Kitaplığa Ekle, Readixle (hashtag ile composer açar), Listeye Ekle (`AddToReadingListModal`), Paylaş.

### 🎬 Sekmeler (Tabs)
1. **Hakkında Sekmesi:**
   * **Hikaye Özeti:** Katlanabilir zengin metin özeti.
   * **Yazarın Önsözü:** İtalik font-serif ile yazarın kişisel mektubu (`story.foreword`).
   * **Arka Kapak Yazısı:** Neon dikey vurgulu dramatik arka kapak aforizması (`story.backCover`).
   * **Videolu Tanıtım (Fragman):** YouTube/MP4 kitap teaser oynatıcısı (`story.trailerVideoUrl`).
   * **Ekip & Katkıda Bulunanlar:** Editör, kapak tasarımcısı, illüstratör künyesi.
   * **Bunları Da Seveceksiniz:** Benzer eser önerileri şeridi.
2. **Bölümler Sekmesi:**
   * **Sıralama Toggle'ı:** Tek tıkla `1 → Son` (Eskiden Yeniye) veya `Son → 1` (Yeniden Eskiye) sıralama.
   * **Durum Rozetleri:** Tamamlananlarda yeşil onay (`Check`), aktif okunan bölümde neon çerçeve (`Bookmark`), kilitli bölümlerde kilit (`Lock`).
3. **Yorumlar & İncelemeler:**
   * 1-10 puanlı inceleme formu, topluluk yorumları.
   * **Sağ Kolonda Canlı Readix Akışı:** Bu kitaptan bahseden gerçek zamanlı kullanıcı gönderileri.
4. **Karakterler Sekmesi:**
   * Baş Karakter, Düşman, Yan Karakter rozetleri, yaş, meslek ve kişilik özellikleri.
   * Yazarın emeğini korumak adına Premium üyelere ve eser sahibine özel erişim.
5. **Yüzen Hızlı Okuma Çubuğu (Sticky Bar):** Mobilde kaydırma yapıldığında altta beliren kitap kapağı, kalınan bölüm adı ve "Devam Et" butonu.

---

## 8. Evren Stüdyosu ile Birleşen Okuma Deneyimi (`/read`)

Readixon okuma motoru, okuma akışını bozmadan derinleşmeyi sağlayan interaktif bir deneyim sunar:

### 📖 Kişiselleştirilmiş Okuma Motoru
* **4 Bağımsız Tema:** `Açık`, `Sepya` (kitap kağıdı sarısı), `Gece` (koyu), `OLED` (saf siyah #000000).
* **Tipografi:** Serif, Sans, Dyslexic fontları, satır yüksekliği, yazı boyutu ve kenar boşlukları.
* **Zen / Odak Modu:** Tek dokunuşla tüm menülerin gizlendiği pürüzsüz okuma.
* **Bölüm Fon Müziği (`ChapterMusicPlayer`):** Yazarın bölüme eklediği atmosferik parça (otomatik çalma opsiyonlu).
* **Satır Arası Yorumlar:** Her paragrafa dokunarak satıra özel yorum yapabilme ve topluluk tepkilerini görme.
* **Alıntı Paylaşımı:** Seçilen cümlenin kütüphaneye kaydedilmesi veya Readix'te paylaşılması.

---

### 🌌 Evren Stüdyosu Canlı Entegrasyonu (Dünya Çapında Benzersiz)

```
[Metin İçinde Geçen İsim] ──(Dokun)──> [İnteraktif Mini Lore Popover]
                                                  │
                 ┌────────────────────────────────┴──────────────────────────────┐
                 ▼                                                               ▼
   [Spoiler Kalkanı Denetimi]                                     [Evren Rehberi Çekmecesi]
   Bölüm Sırası < Eşik ?                                          Sayfadan Çıkmadan Sağdan Açılan
   ├── Evet ➔ "⚠️ Korumalı Bilgi (Bölüm 12'de açılır)"            Harita, Soy Ağacı & Sözlük
   └── Hayır ➔ Karakter Rolü, Gücü, Görseli
```

1. **Metin İçi Akıllı Lore Dipnotları (PRD Bölüm 40):**
   * Metinde geçen evren karakterleri, kaleler, yaratıklar veya büyülü terimler otomatik taranır ve altı hafif parıltıyla vurgulanır.
2. **İnteraktif Mini Lore Popover'ı (`InlineLorePopover`):**
   * Tıklandığında okuma bozulmadan minik bir kart açılır (mobilde alttan şık çekmece): Varlığın resmi, rolü (örn: *"Büyü Konseyi Baş Yargıcı"*), kökeni ve kısa özeti.
3. **Dinamik Spoiler Kalkanı (`spoilerThresholdChapter`):**
   * Eğer bir karakterin hain olduğu 12. bölümde öğreniliyorsa ve okur henüz 4. bölümdeyse:
     > *"⚠️ Spoiler Korumalı Bilgi: Bu karakterin sırrı Bölüm 12'de açığa çıkmaktadır."*
     uyarısı verilir ve metin kilitlenir. Okur dilerse *"Yine de Oku (Spoiler'ı Aç)"* butonuyla kilidi kaldırabilir.
4. **Evren Rehberi Çekmecesi (`ReaderUniverseDrawer`):**
   * Üst bardaki parıldayan `🌌 Evren` butonuna basıldığında okuma sayfası kapanmadan sağdan tam ekran evren ansiklopedisi kayar; haritaya veya sözlüğe bakıp kapatıldığında kalınan satıra dönülür.
5. **Bölüm Sonu Evren Özeti (`ChapterUniverseRecap` - PRD Bölüm 40.4):**
   * Bölüm bittiğinde *"Bu Bölümde Karşılaştığınız Evren Unsurları"* kartı çıkar. Bölümdeki karakterler, mekânlar ve açık kalan gizemler özetlenir.
6. **Seri Geçiş Köprüsü:**
   * Cildin son bölümü bittiğinde *"Tebrikler! 1. Cildi bitirdiniz. Serinin 2. Kitabına Başla"* geçiş kartı belirir.

---
*Hazırlayan: Readixon Core Engineering & Product Architecture*
