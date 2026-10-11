# READIXON EVREN STÜDYOSU
## Ürün Gereksinim Dokümanı (PRD) — Master Plan

**Belge amacı:** Bu doküman Readixon için geliştirilecek **Evren Stüdyosu / Evren Defteri** ürününün ürün mantığını, kullanıcı deneyimini, ekranlarını, modüllerini, davranış kurallarını, görünürlük–spoiler sistemini, mevcut Readixon araçlarıyla entegrasyonunu ve kabul kriterlerini tanımlar.

**Hedef kitle:** Ürün ekibi, tasarımcı, yazılımcı ve Antigravity gibi kodlama/uygulama ajanları.

**Kapsam dışı:** Backend mimarisi, veri tabanı tasarımı, API seçimi, framework içi teknik implementasyon, deployment, cache, depolama sağlayıcısı, güvenlik kuralı kodu ve benzeri altyapı kararları. Bunlar mevcut Readixon mimarisine göre uygulama ekibi tarafından belirlenmelidir.

---

# 1. ÜRÜN VİZYONU

Readixon yalnızca kitapların yayınlandığı bir platform olmayacaktır.

Yeni hedef:

> **Yazarın eserini planladığı, evrenini kurduğu, karakterlerini yönettiği, bölüm kurgusunu geliştirdiği, yapay zekâdan editoryal ve tutarlılık desteği aldığı, eserini yayınladığı ve okuyucunun hikâyenin evrenini keşfedebildiği bütünsel yaratım platformu.**

Evren Stüdyosu, klasik “not alma” veya “worldbuilding formu” olmamalıdır. Sistem, eser içindeki bütün unsurları birbirine bağlayan yaşayan bir **hikâye bilgi ağı** gibi davranmalıdır.

Örnek:

- Bir karakter yalnızca karakter kartı değildir.
- Karakter bir mekâna bağlıdır.
- Bir aileye veya organizasyona bağlıdır.
- Belirli olaylara katılmıştır.
- Belirli bölümlerde görünür.
- Belirli eşyalara sahiptir.
- Bir güç sisteminin kurallarına tabidir.
- Bir zaman çizelgesinde yaşar.
- Başka karakterlerle ilişkilidir.
- Okuyucuya gösterilen bilgiler, okuyucunun geldiği bölüme göre değişebilir.

Bu bağlantılar Readixon'un temel farklılaştırıcılarından biri olmalıdır.

---

# 2. ÜRÜNÜN TEMEL FELSEFESİ

Evren Stüdyosu aşağıdaki beş ilkeye dayanmalıdır.

## 2.1 Yazarın yerine yazma, yazarı güçlendir

Readixon Yapay Zekâ Asistanı kitabı veya bölümü yazarın yerine üretmeye odaklanmamalıdır.

Asistanın temel görevi:

- hatırlatmak,
- analiz etmek,
- tutarlılık kontrolü yapmak,
- boşlukları bulmak,
- olası problemleri göstermek,
- planlamaya yardım etmek,
- sorular sormak,
- alternatifler önermek,
- yazarın kendi kararlarını yönetmesini kolaylaştırmak.

Temel ilke:

> **“Senin yerine yazmıyorum; senin kurduğun dünyayı senden daha düzenli hatırlamana yardım ediyorum.”**

---

## 2.2 Her şey birbiriyle bağlantılı olmalı

Karakter, mekân, olay, eşya, organizasyon ve diğer evren unsurları birbirinden kopuk notlar halinde tutulmamalıdır.

Her unsur diğer unsurlarla ilişkilendirilebilmelidir.

Örneğin:

**Boris**
- Aeryon ile ilişkili
- Mavi Enerji güç sistemini kullanıyor
- Kuzey Krallığı ile bağlantılı
- Büyük Mühür olayına katıldı
- Bölüm 4, 7, 9 ve 14'te görünüyor
- Kristal ile bağlantılı
- üç yüz yıllık tarihsel olaydan etkileniyor

Bu yapı özellikle uzun fantastik eserlerde, bilimkurguda, seri romanlarda ve çok zaman çizgili eserlerde yazarın kontrolünü ciddi şekilde artırmalıdır.

---

## 2.3 Evren yazar için çalışma alanı, okuyucu için keşif alanı olmalı

Aynı bilgi iki farklı deneyime dönüşmelidir:

### Yazar görünümü
Detaylı, tam, spoiler içeren, planlama odaklı.

### Okuyucu görünümü
Şık, keşif odaklı, spoiler kontrollü, görsel ağırlıklı.

Yazarın özel notları hiçbir koşulda okuyucu görünümünde kendiliğinden açılmamalıdır.

---

## 2.4 Evren bir kitaba mahkûm olmamalı

Daha önce gündeme gelen yazar talebinin önemli noktalarından biri korunmalıdır:

Bir evren yalnızca tek romana bağlı olmak zorunda değildir.

Bir evrene şunlar bağlanabilmelidir:

- Roman
- Seri roman
- Webtoon
- Yan hikâye
- Prequel
- Sequel
- Spin-off
- Karakter hikâyesi
- Özel bölüm
- Gelecekte desteklenecek diğer anlatı türleri

Örnek:

**Kızıl Pelerin Evreni**
- Roman 1
- Roman 2
- Webtoon
- 3 yan hikâye
- 8 ana karakter
- 21 mekân
- 4 organizasyon
- 38 önemli olay

Bu yapı Readixon'un “aynı evrende farklı formatlarda içerik” avantajını desteklemelidir.

---

## 2.5 Karmaşık veri, sade deneyim

Evren çok genişleyebilir fakat arayüz karmaşık görünmemelidir.

Kullanıcı ilk açılışta yüzlerce alanla karşılaşmamalıdır.

Detaylar gerektiğinde açılmalıdır.

Bu nedenle tüm deneyimde:

- kartlar,
- sekmeler,
- akıllı açılır paneller,
- hızlı önizlemeler,
- filtreler,
- ilişki görünümleri,
- durum göstergeleri,
- bağlamsal işlemler

kullanılmalıdır.

---

# 3. MEVCUT READIXON YAPISIYLA UYUMLULUK

Evren Stüdyosu sıfırdan bağımsız bir ürün gibi davranmamalıdır. Mevcut Readixon Studio'nun doğal devamı olmalıdır.

Korunacak ve entegre edilecek mevcut güçlü alanlar:

- Gelişmiş blok tabanlı bölüm editörü
- Metin, görsel, müzik ve diğer blokların birlikte kullanılabilmesi
- Kurgu Sihirbazı A / B / C / D yapısı
- B modülünün bölüm bazlı planlama mantığı
- A, C ve D modüllerinin genel kitap ve kurgu planlaması
- Karakter Defteri
- Temel Dosya
- Fiziksel Profil
- Psikolojik Analiz
- Karakter Eğrisi
- Yetkinlik Puanları
- Yazar Asistanı
- Roman
- Webtoon
- Kitap tanıtım videosu
- Kitap listeleri
- İstatistikler
- Yazar Akademisi
- Editoryal değerlendirme sistemi

Yeni ürün mevcut özellikleri tekrar etmemeli; onları birbirine bağlamalıdır.

---

# 4. ÜRÜN ADLANDIRMA MİMARİSİ

Önerilen ana ürün adı:

# **Evren Stüdyosu**

Studio içindeki bilgi yönetim bölümünün adı:

# **Evren Defteri**

Okuyuculara açık taraf:

# **Evrene Gir**

Bu üç isim aynı sistemin farklı yüzleridir:

- **Evren Stüdyosu:** Ürünün genel adı
- **Evren Defteri:** Yazarın çalışma alanı
- **Evrene Gir:** Okuyucu çağrısı

---

# 5. KULLANICI ROLLERİ

## 5.1 Yazar
Evreni oluşturur ve yönetir.

## 5.2 Ortak Yazar
İzin verilmiş evren öğelerini düzenleyebilir.

## 5.3 Editör
Evreni inceleyebilir, tutarsızlık ve editoryal not bırakabilir.

## 5.4 Okuyucu
Yazarın açtığı bilgileri keşfeder.

## 5.5 Takipçi
Kitabı/evreni takip eden kullanıcı. Yazar isterse bazı evren içeriklerini yalnızca takipçilere açabilir.

## 5.6 Premium erişimli okuyucu
Yazar veya Readixon ürün kurgusu uygun olduğunda özel evren içerikleri görebilir.

---

# 6. ANA BİLGİ MİMARİSİ

Evren Stüdyosu aşağıdaki ana alanlardan oluşmalıdır.

1. Evren Ana Sayfası
2. Eserler
3. Karakterler
4. Mekânlar
5. Dünya Haritası
6. Olaylar ve Zaman Çizelgesi
7. Organizasyonlar
8. Aileler ve Hanedanlar
9. Eşyalar ve Artefaktlar
10. Irklar / Türler
11. Yaratıklar
12. Güç / Büyü / Teknoloji Sistemleri
13. Kültürler
14. İnançlar ve Mitoloji
15. Siyaset ve Yönetim
16. Ekonomi ve Toplumsal Yapı
17. Diller ve Sözlük
18. Lore / Dünya Bilgisi
19. İlişki Haritası
20. Seri Bible / Süreklilik Merkezi
21. Görsel Arşiv
22. Okuyucu Görünümü
23. Gizlilik ve Spoiler Yönetimi
24. Yapay Zekâ Evren Asistanı

Bu modüllerin hepsinin her eser için zorunlu olması gerekmez.

Yazar yalnızca ihtiyacı olanları kullanabilmelidir.

---

# 7. EVREN OLUŞTURMA AKIŞI

Yeni evren oluşturma deneyimi kısa ve motive edici olmalıdır.

## Adım 1 — Evren Kimliği

Alanlar:

- Evren adı
- Kısa açıklama
- Kapak / banner
- Tür
- Ana ton
- Evren türü

Evren türü örnekleri:

- Gerçek dünya
- Alternatif tarih
- Fantastik
- Bilimkurgu
- Distopya
- Ütopya
- Çağdaş
- Tarihi
- Mitolojik
- Post-apokaliptik
- Hibrit
- Özel

---

## Adım 2 — Eser Bağlantısı

Yazar:

- mevcut bir romanı,
- mevcut bir Webtoon'u,
- bir seriyi,
- birden fazla eseri

evrene bağlayabilir.

Ayrıca eser bağlamadan da evren oluşturabilmelidir.

Bu özellikle önce dünyasını kurup sonra kitap yazmak isteyen kullanıcılar için önemlidir.

---

## Adım 3 — Görünürlük

Yazar başlangıçta seçebilir:

- Sadece Ben
- Ekip
- Taslak
- Kısmen Açık
- Herkese Açık

Bu ayar daha sonra değiştirilebilir.

---

## Adım 4 — Başlangıç Şablonu

Yazar isterse şablon seçer:

- Basit Roman
- Fantastik Dünya
- Bilimkurgu Evreni
- Tarihi Kurgu
- Polisiye / Gizem
- Romantik Kurgu
- Webtoon Evreni
- Seri Bible
- Boş Evren

Şablon yalnızca başlangıç düzeni sağlar; kullanıcıyı sınırlamaz.

---

# 8. EVREN ANA SAYFASI — YAZAR DASHBOARD

Ana sayfa “kontrol merkezi” gibi davranmalıdır.

## Üst alan

- Evren adı
- kapak
- kısa tanım
- bağlı eserler
- görünürlük
- okuyucu önizleme
- Evrene Gir bağlantısının önizlemesi

## Özet kartları

- karakter sayısı
- mekân sayısı
- olay sayısı
- bağlı eser sayısı
- açık spoiler sayısı
- son düzenlenen içerik
- eksik bağlantılar
- AI uyarıları

## Hızlı oluştur

- + Karakter
- + Mekân
- + Olay
- + Organizasyon
- + Eşya
- + Lore
- + Harita Noktası

## Devam Et bölümü

Son çalışılan öğeler gösterilir.

## Evren Sağlığı

Basit bir gösterge:

- Tutarlılık
- Bağlantı yoğunluğu
- Eksik bilgiler
- Zaman çizelgesi sorunları
- Spoiler ayarları
- Okuyucuya açık içerik oranı

Bu puan yazarın eserinin “kalitesini” yargılayan bir puan olmamalıdır.

Amaç yalnızca organizasyon durumunu göstermektir.

---

# 9. KARAKTER DEFTERİ 2.0

Mevcut Karakter Defteri korunacak ve Evren Stüdyosu içine genişletilecektir.

## 9.1 Temel Dosya

- Karakter adı
- Soyadı
- Lakap
- Kod adı
- Rol
- Ana karakter
- Yan karakter
- Karşıt karakter
- Mentor
- Destek karakter
- Diğer
- Yaş
- Doğum tarihi
- Doğum yeri
- Meslek
- Statü
- Irk / tür
- Bağlı eser
- İlk görüldüğü bölüm
- Durum
- kısa karakter özeti

---

## 9.2 Fiziksel Profil

- boy
- kilo
- vücut yapısı
- saç
- göz
- ten
- ses
- belirgin işaret
- yara / dövme
- giyim tarzı
- kullandığı aksesuarlar
- hareket biçimi
- fiziksel kusur / özellik
- görsel referans

---

## 9.3 Psikolojik Analiz

- temel kişilik
- dışarıdan nasıl görünür
- gerçekte nasıldır
- temel motivasyon
- en büyük arzu
- en büyük korku
- zaaf
- travma
- savunma mekanizmaları
- suçluluk
- sırlar
- ahlaki sınırlar
- tetikleyiciler
- ilişki kurma biçimi
- karar verme biçimi
- stres altındaki davranışı
- değişmesi gereken yönü
- asla değişmeyecek yönü

---

## 9.4 Karakter Eğrisi

Aşamalar:

1. Başlangıç Durumu
2. Eksiklik
3. Tetikleyici Olay
4. İlk Değişim
5. Büyük Kırılma
6. Kriz
7. Son Karar
8. Final Durumu

Karakter eğrisi bölüm veya olaylarla bağlanabilmelidir.

---

## 9.5 Yetkinlik Puanları

Yazar kendi yetkinliklerini oluşturabilmelidir.

Örnek:

- güç
- hız
- dayanıklılık
- liderlik
- ikna
- strateji
- zekâ
- teknik bilgi
- büyü
- empati
- cesaret
- sadakat

Puan sistemi isteğe bağlı olmalıdır.

Her kitap oyunlaştırılmış sistem kullanmak zorunda değildir.

---

## 9.6 İlişkiler

Her ilişki iki karakter arasında gerçek bağlantı olmalıdır.

İlişki türleri:

- anne
- baba
- çocuk
- kardeş
- eş
- sevgili
- eski sevgili
- dost
- yakın dost
- rakip
- düşman
- mentor
- öğrenci
- lider
- takipçi
- iş ortağı
- müttefik
- ihanet
- gizli ilişki
- özel ilişki

Yazar özel ilişki türü oluşturabilmelidir.

Ek alanlar:

- ilişkinin başlangıcı
- ilişkinin mevcut durumu
- ilişkinin gücü
- karşılıklı mı?
- gizli mi?
- ilişki nasıl değişti?
- bağlı olaylar
- okuyucuya gösterilecek açıklama
- spoiler seviyesi

---

## 9.7 Bölüm Geçmişi

Karakter için otomatik/bağlı görünüm:

- göründüğü bölümler
- adı geçen bölümler
- önemli sahneler
- karakter eğrisi olayları
- ilk görünüm
- son görünüm
- kritik değişimler

---

## 9.8 Karakter Görsel Galerisi

Desteklenmesi gereken içerik mantıkları:

- ana portre
- şeffaf PNG karakter
- tam vücut
- alternatif kıyafet
- dönemsel görünüm
- genç / yetişkin / yaşlı hali
- önemli sahne görselleri
- yazar referans görselleri

Yazar hangi görsellerin okuyucuya açık olduğunu belirlemelidir.

---

# 10. KARAKTER PNG VE 3D VİTRİN DENEYİMİ

Amaç ağır 3D teknolojisini zorunlu tutmak değil, modern görsel sunum sağlamaktır.

## Seviye 1 — PNG Vitrin

Şeffaf PNG:

- derinlik hissi
- hafif parallax
- arka plan katmanları
- hover / touch hareketleri
- yumuşak giriş animasyonu

ile sunulabilir.

## Seviye 2 — 3D Kart Hissi

Gerçek 3D model gerektirmeden:

- kart eğimi
- ışık tepkisi
- derinlik katmanları
- foreground/background ayrımı
- karakterin karttan taşması
- hareketli arka plan

kullanılabilir.

## Seviye 3 — Gerçek 3D Model

İleri kullanım için:

- yazar hazır model yükleyebilir
- ileride platform destekli model üretimi eklenebilir
- model döndürülebilir
- yakınlaştırılabilir
- farklı kostümler arasında geçilebilir

Bu seviye ürünün ilk kullanımını ağırlaştırmamalıdır.

---

# 11. MEKÂN DEFTERİ

Mekân bir hiyerarşi içinde yönetilebilmelidir.

Örnek:

Dünya  
→ Kıta  
→ Ülke  
→ Bölge  
→ Şehir  
→ Mahalle  
→ Bina  
→ Oda

Yazar bu hiyerarşiyi kendi eserine göre değiştirebilir.

## Mekân alanları

- isim
- tür
- görsel
- kısa tanım
- detay
- bağlı üst mekân
- bağlı alt mekânlar
- iklim
- coğrafya
- atmosfer
- nüfus
- kültür
- yönetim
- ekonomi
- güvenlik
- tarih
- önemli olaylar
- önemli karakterler
- organizasyonlar
- özel kurallar
- tehlikeler
- sırlar
- kullanılan dil
- okuyucu görünürlüğü
- spoiler seviyesi

---

# 12. DÜNYA HARİTASI

Dünya Haritası Evren Stüdyosu'nun en güçlü görsel alanlarından biri olmalıdır.

## 12.1 Harita türleri

- Dünya
- Kıta
- Ülke
- Bölge
- Şehir
- Bina
- Özel

## 12.2 Harita oluşturma yöntemleri

Yazar:

- hazır harita görseli yükleyebilir
- mevcut görsel üzerine interaktif noktalar ekleyebilir
- bölgeler belirleyebilir
- rotalar oluşturabilir
- farklı katmanlar ekleyebilir

Ürün, yazarın profesyonel harita tasarım programı kullanmasını zorunlu kılmamalıdır.

---

## 12.3 Harita öğeleri

- şehir
- köy
- kale
- okul
- orman
- dağ
- liman
- savaş alanı
- gizli bölge
- tapınak
- mağara
- ülke
- bölge
- portal
- özel işaret

Yazar kendi ikon tipini de tanımlayabilmelidir.

---

## 12.4 Harita bağlantıları

Haritadaki bir nokta:

- mekâna
- olaya
- karaktere
- organizasyona
- bölüme
- lore kaydına

bağlanabilmelidir.

---

## 12.5 Rotalar

Karakter veya grubun yolculuğu harita üzerinde gösterilebilir.

Örnek:

**Boris'in Yolculuğu**
1. Kuzey Limanı
2. Aeryon
3. Eski Mühür Tapınağı
4. Güney Geçidi

Rota bölüm bazında filtrelenebilir.

---

## 12.6 Okuyucu haritası

Okuyucu haritayı keşfedebilir.

Fakat spoiler sistemi geçerli olmalıdır.

Örneğin okuyucu Bölüm 8'deyse ve gizli şehir Bölüm 20'de ortaya çıkıyorsa:

- şehir hiç görünmeyebilir
- sis altında olabilir
- “Henüz Keşfedilmedi” biçiminde gösterilebilir

Yazar hangi modeli istediğini seçebilmelidir.

---

# 13. OLAYLAR VE ZAMAN ÇİZELGESİ

Zaman yönetimi iki ayrı düzeyde ele alınmalıdır.

## 13.1 Evren Tarihi

Dünyanın büyük tarihi.

Örnek:

- krallığın kuruluşu
- savaşlar
- hükümdarlar
- felaketler
- keşifler
- devrimler
- teknolojik gelişmeler
- mitolojik olaylar

## 13.2 Hikâye Zaman Çizelgesi

Kitapta yaşanan olayların kronolojik sırası.

Bu iki çizelge birbirine bağlanabilir.

---

## Olay kartı alanları

- olay adı
- tür
- başlangıç
- bitiş
- çağ
- özel tarih
- gerçek kronolojik sıra
- kısa özet
- detaylı açıklama
- sebep
- sonuç
- katılan karakterler
- organizasyonlar
- mekânlar
- eşyalar
- ilgili bölümler
- olayın önemi
- spoiler seviyesi
- okuyucu görünürlüğü

---

# 14. KURMACA TAKVİM SİSTEMİ

Yazar gerçek dünya takvimine bağlı olmak zorunda değildir.

Desteklenmesi gereken kullanım mantıkları:

- normal tarih
- yalnızca yıl
- çağ
- dönem
- hükümdarlık yılı
- savaş öncesi / sonrası
- özel takvim
- belirsiz kronoloji

Örnek:

- Mühürden Önce 48
- Mühürden Sonra 12
- Üçüncü Aeryon Çağı
- Büyük Savaş'tan 17 yıl sonra

Sistem yazarın kendi kronoloji adlandırmasını kullanmasına izin vermelidir.

---

# 15. ORGANİZASYONLAR

Organizasyon türleri:

- devlet
- krallık
- imparatorluk
- şirket
- okul
- tarikat
- lonca
- ordu
- mafya
- çete
- siyasi grup
- gizli örgüt
- kulüp
- ekip
- konsey
- özel

## Alanlar

- isim
- sembol
- logo
- renk / kimlik
- kuruluş
- kurucu
- lider
- üyeler
- hiyerarşi
- merkez
- amaç
- ideoloji
- kaynaklar
- müttefikler
- düşmanlar
- önemli olaylar
- bağlı mekânlar
- tarihçe
- okuyucu görünürlüğü

---

# 16. AİLELER VE HANEDANLAR

Soyağacı yalnızca fantastik roman için değil, dram ve tarihi roman için de değerlidir.

## Özellikler

- aile oluştur
- hanedan oluştur
- üyeleri bağla
- nesilleri göster
- evlilik
- ayrılık
- biyolojik ilişki
- evlatlık
- gizli ebeveyn
- miras
- taht sırası
- soy değişimi

Okuyucu görünümü spoiler kontrollü olmalıdır.

Örneğin gizli kardeşlik bilgisi erken açılmamalıdır.

---

# 17. EŞYALAR VE ARTEFAKTLAR

Türler:

- silah
- araç
- mücevher
- kitap
- anahtar
- belge
- teknoloji
- büyülü obje
- günlük
- kıyafet
- taşıt
- özel

## Alanlar

- isim
- görsel
- tür
- açıklama
- köken
- üretici / yaratan
- mevcut sahibi
- eski sahipleri
- güç / işlev
- sınır
- bedel
- kırılabilirlik
- önemli olaylar
- göründüğü bölümler
- bulunduğu mekân
- spoiler seviyesi

---

# 18. IRKLAR / TÜRLER

## Alanlar

- isim
- alternatif isimler
- köken
- fiziksel özellikler
- yaşam süresi
- biyoloji
- toplum
- kültür
- dil
- yaşadıkları bölgeler
- güçlü yönler
- zayıf yönler
- diğer türlerle ilişkiler
- tarih
- inanç
- önemli karakterler

---

# 19. YARATIKLAR

Irk ve yaratık birbirinden ayrılabilir.

Yaratık örnekleri:

- canavar
- mitolojik varlık
- hayvan
- yapay yaşam formu
- uzaylı organizma
- spiritüel varlık

Alanlar:

- görünüm
- davranış
- habitat
- tehlike seviyesi
- beslenme
- yetenek
- zayıflık
- lore
- bağlı olaylar
- bağlı mekânlar

---

# 20. GÜÇ / BÜYÜ / TEKNOLOJİ SİSTEMLERİ

Bu bölüm Readixon'un özellikle fantastik ve bilimkurgu yazarları için güçlü fark yaratacağı alanlardan biridir.

Sistem yalnızca “büyü” adıyla sınırlandırılmamalıdır.

Örnek sistemler:

- büyü
- süper güç
- enerji sistemi
- savaş sanatı
- teknoloji
- yapay zekâ
- sınıf sistemi
- yetenek ağacı
- biyolojik güç
- spiritüel sistem

## Alanlar

- sistem adı
- temel prensip
- kaynak
- kim kullanabilir
- nasıl öğrenilir
- seviyeler
- sınırlar
- maliyet / bedel
- risk
- yasaklar
- istisnalar
- tarih
- kullanan karakterler
- ilgili eşyalar
- karşı sistemler

Temel dünya kurma ilkesi:

> Bir gücün yalnızca ne yapabildiği değil, ne yapamadığı ve kullanımının bedeli de tanımlanabilmelidir.

---

# 21. KÜLTÜR MODÜLÜ

Kültürler ayrı varlıklar olarak oluşturulabilir.

Alanlar:

- kültür adı
- halk
- bölge
- değerler
- aile anlayışı
- gelenekler
- yemek
- giyim
- sanat
- müzik
- mimari
- ölüm anlayışı
- evlilik
- eğitim
- toplumsal sınıflar
- tabular
- bayramlar
- ritüeller
- diğer kültürlerle ilişkiler

---

# 22. İNANÇ VE MİTOLOJİ

Alanlar:

- inanç adı
- tanrılar
- peygamber / rehber / figür
- kutsal kişiler
- kutsal yerler
- yaratılış anlatısı
- ölüm sonrası inanç
- ritüeller
- ibadet
- yasaklar
- mezhepler
- kutsal metinler
- örgütlenme
- politik etkisi
- çatışmalar

---

# 23. SİYASET VE YÖNETİM

Özellikle epik fantastik, tarihi ve politik kurgu için isteğe bağlı modül.

Alanlar:

- yönetim biçimi
- lider
- yönetim kurumları
- yasalar
- veraset sistemi
- seçim sistemi
- diplomasi
- savaş durumu
- iç çatışmalar
- siyasi gruplar
- toplumsal destek
- önemli krizler

---

# 24. EKONOMİ VE TOPLUM

Alanlar:

- para birimi
- ticaret
- ana üretim
- sınıflar
- zenginlik dağılımı
- işçilik
- kölelik / yasaklı sistemler
- loncalar
- vergiler
- ana ticaret yolları
- kıtlık
- ekonomik krizler

Bu modül zorunlu değildir.

---

# 25. DİLLER VE SÖZLÜK

## 25.1 Dil Kartları

- dil adı
- konuşan halk
- alfabe
- köken
- kullanım alanı
- resmi / gayriresmi
- lehçeler
- örnek kelimeler

## 25.2 Sözlük

Terim alanları:

- terim
- telaffuz
- anlam
- kategori
- ilk geçtiği bölüm
- ilişkili evren öğesi
- spoiler durumu

---

# 26. BÖLÜM İÇİ SÖZLÜK DENEYİMİ

Yazar isterse bir terimi bölüm içinde evren sözlüğüne bağlar.

Okuyucu:

- terime dokunur
- küçük bilgi kartı açılır
- okumayı bırakmadan açıklamayı görür
- “Evren Defterinde Gör” ile detay sayfasına geçebilir

Mobilde bu deneyim bottom sheet biçiminde olmalıdır.

Web'de popover / side peek kullanılabilir.

---

# 27. LORE / DÜNYA BİLGİSİ

Lore serbest ama düzenli bilgi alanıdır.

Kategoriler:

- tarih
- efsane
- mit
- sır
- kehanet
- bilim
- teknoloji
- savaş
- felaket
- dünya kuralı
- özel bilgi

Her lore kaydı diğer tüm varlıklarla bağlanabilmelidir.

---

# 28. ICEBERG DÜNYA KURMA MODELİ

Yazarın bütün dünya bilgisini okuyucuya göstermesi gerekmez.

Sistem şu yaklaşımı desteklemelidir:

### Görünen katman
Okuyucunun bildiği.

### Derin katman
Yazarın bildiği fakat henüz açıklamadığı.

### Gizli gerçek
Yalnızca yazarın planında yer alan.

Her evren kaydı için yazar isterse üç ayrı açıklama tutabilir:

1. Yazar Notu
2. Okuyucu Açıklaması
3. Gizli Gerçek

Bu, spoiler yönetimini ciddi biçimde güçlendirir.

---

# 29. İLİŞKİ HARİTASI

Evrenin tüm varlıkları görsel ağ üzerinde gösterilebilir.

## Düğüm türleri

- karakter
- mekân
- organizasyon
- aile
- olay
- eşya
- lore
- eser

## Bağlantı türleri

- aile
- dost
- düşman
- üye
- lider
- sahibi
- yaşadığı yer
- doğduğu yer
- olay katılımcısı
- üretici
- siyasi bağ
- ticari bağ
- gizli bağ
- bölüm bağlantısı

---

## Filtreler

- yalnızca karakterler
- aile ilişkileri
- politik ilişkiler
- organizasyonlar
- seçili bölüm
- seçili kitap
- seçili zaman aralığı
- okuyucuya açık bağlantılar

Okuyucu ve yazar aynı grafiği görmemelidir.

Okuyucu grafiği spoiler filtresinden geçmelidir.

---

# 30. SERİ BIBLE / SÜREKLİLİK MERKEZİ

Bu modül uzun seriler için kritik olmalıdır.

## Seri Bible alanları

- evren kuralları
- ana karakterler
- ilişkiler
- ana mekânlar
- kronoloji
- önemli olaylar
- ana gizemler
- çözülen gizemler
- açık kalan gizemler
- seri çapındaki karakter arkları
- kitaplar arası değişiklikler
- devamlılık kuralları
- tekrar kullanılmaması gereken olaylar
- ileri kitap notları

---

# 31. AÇIK KONULAR / ÇÖZÜLEN KONULAR

Yazar planlama sırasında takip edebilir:

### Açık
- kim katil?
- mühür neden kırıldı?
- Boris'in gerçek kökeni?
- Aeryon neden terk edildi?

### Çözüldü
- çözümün gerçekleştiği bölüm
- okuyucuya açıklandığı bölüm

Bu özellik AI tutarlılık kontrolüne de veri sağlar.

---

# 32. KURGU SİHİRBAZI ENTEGRASYONU

Mevcut A / B / C / D sistemi korunmalıdır.

## A Modülü — Temel Kurgu

Evren bağlantıları:

- ana dünya
- ana karakterler
- ana çatışma
- temel tema
- ana sistem
- ton
- dönem

A modülündeki çıktı Evren Defteri'ne dönüştürülebilir.

Ancak sistem otomatik değişiklik yapmadan önce yazardan onay istemelidir.

---

## B Modülü — Bölüm Kurgu Planı

B modülü evren sistemiyle en sıkı entegre modül olmalıdır.

Bölüm planı içinde:

- bölümdeki karakterler
- bölümdeki mekânlar
- olaylar
- eşyalar
- terimler
- karakter hedefleri
- çatışmalar
- bölümde açıklanan lore
- bölümde açılan sırlar
- bölümde kapanan sırlar
- timeline konumu
- spoiler eşikleri

bağlanabilmelidir.

---

## C Modülü — Dünya ve Derinlik

C modülü Evren Stüdyosu'nu besleyen planlama modülü olarak kullanılabilir.

Asistan sorabilir:

- Bu toplum neye inanıyor?
- Gücün sınırı ne?
- Bu savaş ekonomiyi nasıl etkiledi?
- Bu iki kültür neden çatışıyor?
- Bu şehrin varoluş nedeni ne?
- Bu dünya gerçek dünyadan hangi noktada ayrılıyor?

C modülü doğrudan “otomatik lorem üreticisi” olmamalı, yazarın düşünmesini sağlamalıdır.

---

## D Modülü — Uzun Vadeli Mimari

D modülü:

- kitaplar arası plan
- karakter arkları
- seri olay örgüsü
- büyük gizemler
- final
- prequel/sequel bağlantıları
- uzun zaman çizelgesi

ile Evren Stüdyosu'nu beslemelidir.

---

# 33. BÖLÜM EDİTÖRÜ ENTEGRASYONU

Mevcut blok tabanlı editöre yeni bir “Evren” çalışma paneli eklenmelidir.

## Bölüm Evren Paneli

Yazar mevcut bölüm için görebilir:

- karakterler
- mekânlar
- olaylar
- eşyalar
- terimler
- bölüm planı
- timeline
- tutarlılık uyarıları

---

## Hızlı Bağlama

Yazar metinde isim seçerek:

- karaktere bağla
- mekâna bağla
- terime bağla
- yeni evren öğesi oluştur

işlemi yapabilmelidir.

---

## Akıllı öneri

Sistem metinde:

“Boris”

geçtiğinde:

> Boris karakter kartıyla ilişkilendirilsin mi?

gibi öneri sunabilir.

Bu hiçbir zaman otomatik ve kontrolsüz yapılmamalıdır.

---

# 34. YAPAY ZEKÂ EVREN ASİSTANI

AI'ın görevi romanı yazmak değil, evreni anlamaktır.

## Temel fonksiyonlar

### 34.1 Tutarlılık

Örnek:

> Karakter kartında Ayla'nın göz rengi mavi. Bölüm 18'de kahverengi olarak geçiyor.

---

### 34.2 Kronoloji

> Bölüm 12'deki olay 14 Mayıs tarihinde geçiyor. Ancak bağlantılı olayın başlangıcı 17 Mayıs olarak kayıtlı.

---

### 34.3 Yaş kontrolü

> Karakterin doğum tarihine göre bu olay sırasında 19 yaşında olması gerekiyor.

---

### 34.4 Konum kontrolü

> Karakter aynı tarih aralığında iki farklı şehirde görünüyor.

---

### 34.5 Güç sistemi kontrolü

> Mavi Enerji kurallarında bu yeteneğin yalnızca mühür taşıyan kişiler tarafından kullanılabileceği belirtilmiş.

---

### 34.6 Açık konu takibi

> Bu olay 6 bölüm önce açılmış ancak henüz çözülmemiş. Bilerek açık bırakıldıysa “uzun vadeli gizem” olarak işaretleyebilirsin.

---

### 34.7 Karakter davranışı

Kesin hüküm vermeden:

> Bu karar karakterin daha önce tanımladığın “riskten kaçınma” eğilimiyle çelişiyor olabilir. Bu değişim bilinçliyse karakter eğrisine kırılma noktası eklemek ister misin?

---

# 35. AI İÇİN YASAK DAVRANIŞLAR

AI:

- yazarı zorla yönlendirmemeli
- karakteri “böyle olmalı” diye dayatmamalı
- yaratıcı tercihi hata olarak göstermemeli
- özel evren bilgilerini okuyucuya sızdırmamalı
- spoiler filtresini aşmamalı
- yazarın özel notlarını herkese açık özetlerde kullanmamalı

---

# 36. GİZLİLİK VE YAYIN DURUMLARI

Her evren ve her evren öğesi için durum mantığı bulunmalıdır.

## Ana durumlar

1. **Özel**
2. **Ekip**
3. **Taslak**
4. **Kısmen Açık**
5. **Herkese Açık**

---

# 37. SPOILER MOTORU

Spoiler kontrolü sistemin temel özelliğidir.

Her bilgi için aşağıdaki seçeneklerden biri kullanılabilir:

- Herkese açık
- Bölüm X'ten sonra
- Kitap X tamamlandıktan sonra
- Belirli olay gerçekleşince
- Takipçilere özel
- Premium erişim
- Sadece yazar
- Özel olarak seçilen kullanıcılar

---

## 37.1 Okuma ilerlemesine göre evren

Okuyucunun geldiği bölüm biliniyorsa evren ona göre görünmelidir.

Örnek:

Okuyucu Bölüm 7'de.

Karakter kartında:

**Gerçek adı:** gizli  
**Kardeşi:** gizli  
**Meslek:** açık  
**Doğduğu şehir:** açık

Okuyucu Bölüm 20'ye geldiğinde yeni bilgiler açılabilir.

Bu deneyim evreni dinamik hale getirir.

---

# 38. “KEŞFEDİLDİ” MEKANİĞİ

Okuyucu yeni bilgiler açıldığında küçük bir keşif hissi yaşayabilir.

Örnek:

> **Yeni Evren Bilgisi Keşfedildi**
> Aeryon Şehri artık haritada açıldı.

Bu sistem aşırı oyunlaştırılmamalıdır.

Ama özellikle fantastik ve gizem eserlerinde güçlü olabilir.

---

# 39. OKUYUCU — EVRENE GİR ANA SAYFASI

Kitap sayfasında:

# **Evrene Gir**

çağrısı bulunmalıdır.

Ana sayfa:

- evren hero alanı
- kısa tanıtım
- aktif eserler
- öne çıkan karakterler
- dünya haritası
- timeline
- organizasyonlar
- lore
- bu hafta keşfedilen içerikler
- okuyucunun mevcut ilerlemesi

Yazar bütün bölümleri kullanmak zorunda değildir.

---

# 40. BÖLÜM OKURKEN EVREN

Okuma deneyimi asla bozulmamalıdır.

## 40.1 Mini karakter kartı

Karakter adına dokunulduğunda:

- görsel
- ad
- kısa tanım
- okuyucunun şu anda bilmesi gereken bilgiler
- “Karakteri Aç”

---

## 40.2 Mekân kartı

- görsel
- kısa açıklama
- haritadaki konum
- “Haritada Gör”

---

## 40.3 Terim kartı

- kısa sözlük tanımı
- “Evren Defterinde Aç”

---

## 40.4 Bölüm Sonu Evren Özeti

Bölüm sonunda:

### Bu Bölümde
- 4 karakter
- 2 mekân
- 1 yeni olay
- 3 sözlük terimi
- 1 yeni keşif

gibi bir alan bulunabilir.

Okuyucu isterse açar.

---

# 41. “BU BÖLÜMÜN EVRENİ” SAYFASI

Her bölümün isteğe bağlı mikro evren görünümü olabilir.

Gösterir:

- bölümdeki karakterler
- mekân
- kronoloji
- eşyalar
- ilgili lore
- harita
- bölümde açılan yeni bilgiler

Bu özellik özellikle karmaşık eserler için çok değerlidir.

---

# 42. OKUYUCU KARAKTER SAYFASI

Yazar ekranından farklıdır.

## Üst alan

- karakter PNG
- isim
- rol
- kısa tanım
- ilk görünüm
- okuyucunun bildiği durum

## Alt alan

- Hakkında
- İlişkiler
- Zaman Çizgisi
- Mekânlar
- Göründüğü Bölümler
- Galeri

Spoilerli sekmeler gizlenebilir.

---

# 43. OKUYUCU İLİŞKİ HARİTASI

Çok etkileyici bir keşif ekranı olabilir.

Örneğin:

**Boris**
→ Akira: Müttefik  
→ Talay: Belirsiz  
→ Dora: Dost

Bölüm ilerledikçe ilişkiler değişebilir.

Bu değişim geçmiş hâliyle de gösterilebilir:

> “Bölüm 1–8: Dost”
>
> “Bölüm 9 sonrası: Düşman”

---

# 44. OKUYUCU TIMELINE

İki seçenek:

### Kronolojik
Evren tarihini gösterir.

### Hikâye
Okuyucunun okuduğu hikâyeye göre gösterir.

Gelecek olaylar gizlenir.

---

# 45. READIXON WEBTOON ENTEGRASYONU

Evren sistemi yalnızca roman için yapılmamalıdır.

Webtoon:

- aynı karakter kartlarını
- aynı evreni
- aynı mekânları
- aynı timeline'ı

kullanabilir.

Bir roman ve Webtoon aynı evrende birleşebilir.

Örnek:

**Kızıl Pelerin Evreni**
- Roman: Kızıl Pelerin
- Webtoon: Kızıl Pelerin: Kuzey
- Yan Hikâye: Mira'nın Günlüğü

Bu Readixon'un güçlü özgün yanlarından biridir.

---

# 46. GÖRSEL ARŞİV / MOODBOARD

Evren içinde yazarın özel görsel alanı bulunabilir.

Kategoriler:

- karakter referansları
- mekânlar
- kostümler
- mimari
- atmosfer
- renk paleti
- araçlar
- objeler

Her görsel:

- sadece yazara
- ekibe
- okuyucuya

ayrı ayrı açılabilir.

---

# 47. 2026 TASARIM DİLİ — WEB

Amaç:

**Profesyonel yaratım aracı + premium eğlence platformu.**

Eski tip yönetim paneli görünmemelidir.

## Web davranışları

- geniş ekranlarda split-view
- seçili öğe için side panel
- sürükle bırak gereken yerlerde doğal kullanım
- hover önizleme
- hızlı komutlar
- bağlamsal menüler
- güçlü arama
- görsel filtreler
- responsive grid
- sticky çalışma araçları
- tam ekran harita / graph modları
- dikkat dağıtmayan yazım deneyimi

---

# 48. 2026 TASARIM DİLİ — MOBİL / REACT NATIVE

Mobil, web'in küçültülmüş kopyası olmamalıdır.

## Mobil ilkeleri

- bottom sheet
- swipe
- uzun basma
- hızlı ekleme
- floating action
- doğal kart geçişleri
- tam ekran harita
- tam ekran timeline
- tek elle kullanım
- klavye açıldığında form deneyiminin bozulmaması
- görsel yükleme için mobil kolaylık
- okuyucu tarafında akıcı geri dönüş

Karakter veya mekân bilgi kartı açıldığında okuyucu bölümden kopmuş hissetmemelidir.

---

# 49. MICRO-INTERACTION PRENSİPLERİ

Animasyon amaç değil, anlam taşımalıdır.

Kullanılabilir:

- kart genişlemesi
- bağlantı çizgilerinin akması
- haritada yumuşak zoom
- yeni keşfin hafif ortaya çıkması
- PNG parallax
- timeline geçişi
- ilişkilerin yumuşak yer değiştirmesi

Kullanılmamalı:

- aşırı neon
- sürekli animasyon
- gereksiz 3D
- yavaş açılış
- kullanıcıyı bekleten gösterişli geçişler

---

# 50. GLOBAL ARAMA

Evren büyüdüğünde arama kritik hale gelir.

Arama:

- karakter
- mekân
- olay
- eşya
- sözlük
- bölüm
- organizasyon
- lore

içinde çalışmalıdır.

Örnek:

“mühür”

arama sonucu:

- 2 karakter
- 1 eşya
- 4 olay
- 8 bölüm
- 3 lore kaydı

olarak gruplandırılabilir.

---

# 51. HIZLI EKLEME

Yazar not alırken akışının bozulmaması önemlidir.

Her ana alanda:

**+ Hızlı Ekle**

ile kısa kayıt oluşturulabilir.

Örnek:

> Yeni Mekân
> Ad: Eski Liman
> Not: Boris burada Talay ile karşılaşacak.

Sonra yazar isterse detaylandırır.

---

# 52. ŞABLONLAR

Evren öğeleri için şablon sistemine izin verilmelidir.

Örnek:

### Fantastik Karakter
daha fazla güç / ırk / lonca alanı

### Modern Karakter
meslek / eğitim / sosyal çevre

### Tarihi Karakter
hanedan / unvan / siyasi bağ

Yazar kendi şablonunu kaydedebilir.

---

# 53. YAZAR AKADEMİSİ ENTEGRASYONU

Akademi yalnızca statik eğitim alanı olmamalıdır.

Örnek ders:

**Güç Sistemi Nasıl Kurulur?**

Ders sonunda:

> “Şimdi kendi güç sistemini oluştur.”

butonu.

Kullanıcı Evren Stüdyosu'ndaki ilgili forma yönlenir.

Benzer bağlantılar:

- karakter eğrisi dersi → karakter eğrisi
- dünya kurma → evren
- diyalog → bölüm editörü
- timeline → olaylar
- seri yazımı → Seri Bible

Bu, eğitimi uygulamaya dönüştürür.

---

# 54. EDITORYAL DEĞERLENDİRME ENTEGRASYONU

Readixon editörü eser değerlendirirken yazar izin verirse Evren Stüdyosu'na bakabilir.

Özellikle:

- Dünya ve Atmosfer
- karakter tutarlılığı
- kurgu sürekliliği
- tarih
- sistem kuralları

değerlendirmelerinde faydalıdır.

Editör yazarın evrenini değiştirmez; öneri bırakabilir.

---

# 55. EVREN TANITIM SAYFASI

Yazar isterse yalnızca kitap değil, evren için de tanıtım sayfası oluşturabilmelidir.

İçerik:

- slogan
- teaser
- hero görsel
- evren tanıtımı
- karakter vitrinleri
- harita
- bağlı eserler
- video
- önemli yerler

Bu sayfa paylaşılabilir olmalıdır.

---

# 56. TANITIM VİDEOSU ENTEGRASYONU

Readixon'un mevcut kitap tanıtım videosu sistemi Evren Stüdyosu'ndan veri alabilir.

Yazar:

- hangi karakterler
- hangi mekânlar
- hangi görseller
- hangi slogan
- hangi bölüm

kullanılacağını seçebilir.

Bu, reklam çalışmalarını hızlandırır.

---

# 57. SOSYAL PAYLAŞIM KARTLARI

Evren içeriğinden otomatik görsel şablonlar üretilebilecek ürün alanları tasarlanmalıdır.

Örnek:

- Karakter Tanıtımı
- Yeni Mekân Keşfedildi
- Evren Haritası
- Bir Karakterin Sözü
- Organizasyon Tanıtımı
- “Evrene Gir”

Bu özellik yazarın pazarlamasını destekler.

---

# 58. KULLANICI HİKÂYELERİ

## Yazar

### US-01
Bir yazar olarak eserime bağlı bir evren oluşturabilmek istiyorum, böylece tüm dünya bilgilerimi tek yerde yönetebilirim.

### US-02
Birden fazla roman ve Webtoon'u aynı evrene bağlamak istiyorum.

### US-03
Karakterimin psikolojisini, fiziksel profilini, ilişkilerini ve gelişim eğrisini tek yerde görmek istiyorum.

### US-04
Karakterlerimin birbirleriyle nasıl bağlantılı olduğunu görsel ağda görmek istiyorum.

### US-05
Dünya haritamı yükleyip şehir ve olayları haritada işaretlemek istiyorum.

### US-06
Evren bilgilerimi okuyuculara tamamen veya kısmen açmak istiyorum.

### US-07
Spoilerli karakter bilgilerini okuyucu belirli bölüme ulaşana kadar gizlemek istiyorum.

### US-08
Bölüm yazarken karakter veya mekân kartını editörden çıkmadan görmek istiyorum.

### US-09
AI'ın önceki bilgilerle çelişen noktaları bana söylemesini istiyorum.

### US-10
Seri kitaplarımda yıllar sonra bile açık kalan gizemleri takip etmek istiyorum.

---

## Okuyucu

### US-11
Bir bölüm okurken karakter hakkında spoiler yemeden bilgi görmek istiyorum.

### US-12
Kitabın dünya haritasına bakmak istiyorum.

### US-13
Okuduğum bölüme kadar öğrendiğim olayları timeline üzerinde görmek istiyorum.

### US-14
Karakterler arasındaki ilişkiyi anlamak istiyorum.

### US-15
Yeni bir yer veya bilgi açıldığında evreni keşfetmek istiyorum.

### US-16
Roman ve Webtoon'un aynı evrende olduğunu tek sayfada görmek istiyorum.

---

# 59. ANA EKRANLAR

## Yazar

1. Evrenlerim
2. Evren Oluştur
3. Evren Dashboard
4. Eserler
5. Karakterler
6. Karakter Detay
7. Mekânlar
8. Mekân Detay
9. Dünya Haritası
10. Timeline
11. Olay Detay
12. Organizasyonlar
13. Organizasyon Detay
14. Aile / Hanedan
15. Soyağacı
16. Eşyalar
17. Irklar
18. Yaratıklar
19. Güç Sistemleri
20. Kültür
21. İnanç
22. Siyaset
23. Ekonomi
24. Diller
25. Sözlük
26. Lore
27. İlişki Haritası
28. Seri Bible
29. Açık Konular
30. Görsel Arşiv
31. Spoiler Ayarları
32. Okuyucu Önizleme
33. AI Evren Asistanı

---

## Okuyucu

1. Evrene Gir
2. Evren Ana Sayfası
3. Karakterler
4. Karakter Detay
5. Mekânlar
6. Harita
7. Timeline
8. Organizasyon
9. Lore
10. Sözlük
11. İlişki Haritası
12. Eserler
13. Bu Bölümün Evreni

---

# 60. BOŞ DURUM TASARIMLARI

Boş sayfalar “Henüz içerik yok” demekle yetinmemelidir.

Örnek:

### Karakter yok

> Hikâyenin insanları burada yaşayacak.
> İlk karakterini oluştur.

### Harita yok

> Dünyanın sınırlarını çizmek zorunda değilsin.
> Elindeki haritayı yükleyerek başlayabilirsin.

### Timeline yok

> Hikâyendeki ilk önemli olayı ekle.

Bu metinler sıcak, profesyonel ve yaratıcı olmalıdır.

---

# 61. EVREN ONBOARDING CHECKLIST

Yeni evren için isteğe bağlı ilerleme:

- [ ] Evren kimliğini oluştur
- [ ] İlk eseri bağla
- [ ] Ana karakteri ekle
- [ ] İlk mekânı ekle
- [ ] İlk önemli olayı ekle
- [ ] Dünya kuralı ekle
- [ ] Okuyucu görünümünü ayarla
- [ ] Evrene Gir sayfasını önizle

Bu checklist kullanıcıyı zorlamamalıdır.

---

# 62. DURUM ETİKETLERİ

Evren öğeleri için görsel durumlar:

- Taslak
- Tamamlanıyor
- Aktif
- Gizli
- Spoiler
- Okuyucuya Açık
- Arşiv
- Öldü / Yok edildi / Kapandı gibi varlık türüne özel durumlar

---

# 63. SİLME VE BAĞLANTI GÜVENLİĞİ

Bir öğe başka öğelere bağlıysa kullanıcıya bağlantılar gösterilmelidir.

Örnek:

> “Aeryon Şehri 4 karakter, 8 olay ve 3 bölümle bağlantılı.”

Silme işleminden önce kullanıcı bunun etkisini görmelidir.

Bu ürün davranışıdır; teknik uygulama biçimi geliştiriciye bırakılır.

---

# 64. EVREN KOPYALAMA / ŞABLONLAMA

Yazar:

- bir evreni kopyalayabilir
- şablona dönüştürebilir
- özel çalışma kopyası oluşturabilir

Özellikle alternatif son veya farklı uyarlama hazırlayan yazarlar için yararlıdır.

---

# 65. EVREN İSTATİSTİKLERİ

Yazar tarafında anlamlı istatistikler:

- en çok görüntülenen karakter
- en çok açılan mekân
- en çok incelenen harita noktası
- Evrene Gir tıklamaları
- bölümden evrene geçiş oranı
- okuyucuların en çok keşfettiği öğeler
- spoiler açılma oranı
- evrenden kitaba dönüş oranı

Bu alan “süs istatistiği” olmamalı, yazara ve pazarlamaya anlamlı veri vermelidir.

---

# 66. PREMIUM KURGUSU

Temel evren deneyimi ücretsiz kullanıcının sistemi anlayabileceği kadar güçlü olmalıdır.

Premium için uygun özellikler:

- gelişmiş evren sayısı
- yüksek varlık limitleri
- gelişmiş ilişki haritası
- büyük haritalar
- çoklu harita
- gelişmiş AI tutarlılık analizi
- ileri seri Bible
- gelişmiş spoiler koşulları
- 3D karakter vitrini
- yüksek görsel kapasitesi
- gelişmiş okuyucu istatistikleri
- ekip çalışması
- özel tanıtım şablonları

Önemli ilke:

> Ücretsiz plan “deneme demosu” gibi işe yaramaz olmamalıdır.

---

# 67. ERİŞİLEBİLİRLİK

2026 kalitesinde tasarımın parçası olmalıdır.

- yeterli kontrast
- klavye kullanımı
- ekran okuyucu anlamlandırması
- animasyon azaltma tercihi
- görseller için açıklama alanı
- dokunma hedeflerinin yeterli büyüklüğü
- harita bilgileri için alternatif liste görünümü

---

# 68. PERFORMANS DENEYİMİ

Ürün davranışı açısından:

- evren ana sayfası ağır hissettirmemeli
- büyük graph varsayılan olarak her şeyi aynı anda göstermemeli
- büyük haritalarda gerekli alanlar kademeli açılmalı
- yüksek çözünürlüklü PNG ve görseller optimize edilmiş biçimde sunulmalı
- mobilde gereksiz ağır efekt kullanılmamalı

Uygulama yöntemi teknik ekip tarafından belirlenir.

---

# 69. MASTER GELİŞTİRME ÖNCELİĞİ

Bu doküman tek bir bütün ürün planıdır; ancak uygulamada aşağıdaki sıra takip edilmelidir.

## P0 — Omurga

- Evren
- birden çok eseri bağlama
- Karakter Defteri 2.0
- Mekân
- Olay
- Timeline
- Organizasyon
- Lore
- Sözlük
- görünürlük
- spoiler
- okuyucu Evrene Gir
- bölüm bağlantıları
- okuyucu mini kartları

P0 olmadan ürün yayınlanmamalıdır.

---

## P1 — Farklılaştırıcılar

- dünya haritası
- karakter ilişkileri
- ilişki haritası
- aile / soyağacı
- eşyalar
- güç sistemi
- ırklar
- yaratıklar
- kültür
- inanç
- Seri Bible
- açık konular
- Kurgu Sihirbazı entegrasyonu
- AI tutarlılık

---

## P2 — Premium Deneyim

- PNG vitrin
- gelişmiş 3D kart hissi
- gerçek 3D model desteğine hazır alan
- keşif mekanikleri
- gelişmiş harita rotaları
- evren tanıtım sayfası
- sosyal paylaşım kartları
- gelişmiş okuyucu istatistikleri
- ekip çalışma özellikleri

---

# 70. MVP DEĞİL — ÜRÜN OMURGASI YAKLAŞIMI

Bu proje “önce 3 form yapıp sonra bakarız” mantığıyla geliştirilmemelidir.

İlk kodlamadan önce şu bağlantılar ürün düzeyinde düşünülmelidir:

**Evren**
→ **Eser**
→ **Bölüm**
→ **Karakter**
→ **Mekân**
→ **Olay**
→ **Timeline**
→ **Organizasyon**
→ **Eşya**
→ **Lore**

Böylece ileride dünya haritası, AI ve ilişki haritası eklenirken sistem baştan yazılmak zorunda kalmaz.

Teknik veri modelini bu doküman tanımlamaz; fakat ürün davranışı bu ilişkiselliği varsayar.

---

# 71. KABUL KRİTERLERİ — EVREN

- Yazar yeni evren oluşturabiliyor.
- Evren eser olmadan oluşturulabiliyor.
- Bir evrene birden fazla eser bağlanabiliyor.
- Roman ve Webtoon aynı evrene bağlanabiliyor.
- Yazar evreni özel veya herkese açık yapabiliyor.
- Okuyucu açık evrene erişebiliyor.
- Yazar okuyucu görünümünü önizleyebiliyor.

---

# 72. KABUL KRİTERLERİ — KARAKTER

- Mevcut karakter alanları korunuyor.
- Yeni ilişki alanları kullanılabiliyor.
- Karakter başka karakterlere bağlanabiliyor.
- Karakter mekâna bağlanabiliyor.
- Karakter olaya bağlanabiliyor.
- Karakter bölüme bağlanabiliyor.
- PNG görsel tanımlanabiliyor.
- Yazar ve okuyucu görünümleri ayrışıyor.
- Spoilerli bilgi gizlenebiliyor.

---

# 73. KABUL KRİTERLERİ — HARİTA

- Yazar harita yükleyebiliyor.
- Harita üzerine nokta ekleyebiliyor.
- Noktayı mekâna bağlayabiliyor.
- Noktayı olaya bağlayabiliyor.
- Rota oluşturabiliyor.
- Okuyucu haritayı açabiliyor.
- Gizli bölge spoiler nedeniyle saklanabiliyor.
- Mobilde harita kullanılabilir durumda.

---

# 74. KABUL KRİTERLERİ — TIMELINE

- Olay oluşturulabiliyor.
- Gerçek veya kurmaca tarih kullanılabiliyor.
- Olay karaktere bağlanabiliyor.
- Olay mekâna bağlanabiliyor.
- Olay bölüme bağlanabiliyor.
- Okuyucu yalnızca izin verilen olayları görüyor.
- Evren ve hikâye timeline görünümleri ayrılabiliyor.

---

# 75. KABUL KRİTERLERİ — BÖLÜM OKUMA

- Okuyucu bölüm içinde evrene erişebiliyor.
- Karakter mini kartı açılabiliyor.
- Mekân mini kartı açılabiliyor.
- Sözlük terimi açılabiliyor.
- Okuyucu geri döndüğünde okuma konumunu kaybetmiyor.
- Spoilerli bilgi açılmıyor.
- “Bu Bölümün Evreni” alanı kullanılabiliyor.

---

# 76. KABUL KRİTERLERİ — AI

- AI evren verisini analiz edebiliyor.
- Tutarsızlık önerisi sunabiliyor.
- Öneri kesin hata gibi sunulmuyor.
- Yazar öneriyi reddedebiliyor.
- AI yazar adına sessizce evren verisi değiştirmiyor.
- Gizli bilgi okuyucu tarafına taşınmıyor.
- Bölüm ve timeline çelişkileri raporlanabiliyor.

---

# 77. KABUL KRİTERLERİ — TASARIM

- Masaüstünde geniş çalışma alanı verimli.
- Mobilde aynı ekran sıkıştırılmamış.
- Bilgi bottom sheet veya detay sayfasıyla düzgün açılıyor.
- Ana navigasyon sade.
- Harita ve graph tam ekran kullanılabiliyor.
- Formlar yüzlerce alanı aynı anda göstermiyor.
- Ana işlemler en fazla birkaç dokunuşla erişilebilir.
- Yeni kullanıcı boş ekranda ne yapacağını anlıyor.

---

# 78. KABUL KRİTERLERİ — SPOILER

- Her varlık için görünürlük ayarlanabiliyor.
- Alan düzeyinde hassas bilgi saklanabiliyor.
- Belirli bölümden sonra bilgi açılabiliyor.
- Yazar önizleme ile okuyucunun ne göreceğini test edebiliyor.
- Farklı okuma ilerlemelerine göre görünüm değişebiliyor.
- Gizli bilgi arama sonuçlarında görünmüyor.
- Gizli bilgi ilişki haritasında sızmıyor.
- Gizli bilgi AI okuyucu özetine sızmıyor.

---

# 79. ANTIGRAVITY / GELİŞTİRİCİ İÇİN UYGULAMA TALİMATI

Bu dokümanı uygularken:

1. Mevcut Readixon Studio yapısını bozma.
2. Karakter Defteri'nin mevcut güçlü alanlarını koru.
3. Evren Stüdyosu'nu bağımsız ve kopuk yeni panel gibi değil, Studio'nun genişlemesi olarak ele al.
4. Mevcut blok editörüyle bağlantı kur.
5. Mevcut Kurgu Sihirbazı A/B/C/D mantığını koru.
6. B modülünü bölüm–evren bağlantısının merkezlerinden biri yap.
7. AI'ı “otomatik roman yazarı” haline getirme.
8. Roman ve Webtoon'un aynı evrene bağlanabilmesini baştan tasarla.
9. Görünürlük ve spoiler mekanizmasını sonradan eklenecek özellik değil, ürünün temel davranışı olarak ele al.
10. Yazarın özel verisi ile okuyucuya açık veri kesin biçimde ayrışmalı.
11. Harita, relation graph ve timeline mobilde gerçekten kullanılabilir olmalı.
12. Tasarım 2026 seviyesinde sade, premium ve hareketli olmalı; eski tip admin paneli görünümü kullanılmamalı.
13. Gereksiz form kalabalığından kaçın.
14. Progressive disclosure kullan.
15. Okuyucu bölümden evrene geçtiğinde geri dönüş akışı kesintisiz olmalı.
16. Evren öğeleri birbirine bağlanabilir olmalı.
17. Bağlantılar yalnızca düz metin alanlarında tutuluyormuş gibi davranma.
18. Sistem uzun serileri kaldırabilecek ürün mantığıyla tasarlanmalı.
19. Yeni modüller eklendiğinde mevcut evrenler bozulmamalı.
20. Kullanıcı arayüzünde Readixon'un mevcut görsel dili korunmalı ve yükseltilmeli.

---

# 80. SON ÜRÜN TANIMI

Proje tamamlandığında Readixon'da bir yazar şu yolculuğu yaşayabilmelidir:

1. Yeni evren oluşturur.
2. Romanını ve Webtoon'unu bu evrene bağlar.
3. Ana karakterlerini detaylandırır.
4. Karakter PNG'lerini yükler.
5. Mekânlarını oluşturur.
6. Dünya haritasını yükler.
7. Şehirleri haritaya bağlar.
8. Organizasyonları ve aileleri kurar.
9. Tarihsel olayları timeline'a yerleştirir.
10. Güç sisteminin kurallarını oluşturur.
11. Lore ve sözlüğünü ekler.
12. Karakter ilişkilerini graph üzerinde görür.
13. Kurgu Sihirbazı ile kitap ve bölüm planını yapar.
14. Bölüm editöründe ilgili evren öğelerini görür.
15. AI tutarsızlıkları ve açık konuları hatırlatır.
16. Yazar istediği bilgileri okuyucuya açar.
17. Okuyucu bölüm okurken karakter kartına bakar.
18. “Evrene Gir” ile haritayı ve timeline'ı keşfeder.
19. Okuyucu ilerledikçe yeni dünya bilgileri spoiler güvenli biçimde açılır.
20. Yazar aynı evrende yeni roman, yan hikâye veya Webtoon yayınlar.

Bu gerçekleştiğinde Readixon yalnızca bir yayın platformu değildir.

# Readixon = Yazarlık İşletim Sistemi + Yayın Platformu + Yaşayan Hikâye Evreni

---

# 81. ÜRÜNÜN PAZARLAMA CÜMLESİ İÇİN ÇEKİRDEK MESAJLAR

Bunlar doğrudan reklam metni değildir; ürün konumlandırma notlarıdır.

### Ana fikir

**Hikâyeni sadece yazma. Dünyasını kur.**

### İkinci fikir

**Karakterlerinden haritana, zaman çizelgenden bölüm planına kadar tüm hikâyen tek yerde.**

### Okuyucu tarafı

**Okumakla kalma. Evrene gir.**

### Yapay zekâ tarafı

**Senin yerine yazmayan, hikâyeni seninle birlikte hatırlayan yapay zekâ.**

### Seri yazarları

**Bir evren. Birden fazla roman, Webtoon ve hikâye.**

---

# 82. SON NOT

Evren Stüdyosu geliştirilirken başarı kriteri “çok fazla form alanı ekledik” olmamalıdır.

Başarı:

> **Yazarın kafasındaki karmaşık dünyayı Readixon içinde yönetilebilir, görsel, bağlantılı ve yaşayan bir sisteme dönüştürmek; okuyucunun ise bu dünyayı spoiler yemeden keşfedebilmesini sağlamaktır.**

Bu nedenle her yeni özellik için şu iki soru sorulmalıdır:

1. Bu özellik yazarın hikâyesini daha iyi yönetmesini sağlıyor mu?
2. Bu özellik okuyucunun hikâyeye daha güçlü bağlanmasını sağlıyor mu?

İkisinden hiçbirini sağlamıyorsa ürün kapsamına alınmamalıdır.
