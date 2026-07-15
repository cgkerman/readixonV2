# RX Puanı Ekonomi ve Gelir Modeli Planı

Bu belge, Readixon platformundaki sanal para birimi olan **RX Puanları**'nın nasıl satılacağı, harcanacağı ve yazarlara nasıl dağıtılacağı (Revenue Share) ile ilgili finansal kurguyu içermektedir.

> [!NOTE]
> Bu kurgu, mikro ödemeleri teşvik etmek, kredi kartı komisyon masraflarını minimize etmek ve platform kârlılığını maksimize etmek üzere tasarlanmıştır.

## 1. Satış Kuru (Kullanıcının RX Satın Alması)

Kullanıcılar sisteme para yükleyerek RX Puanı satın alırlar. Satın alınan paket büyüdükçe birim fiyat düşer, böylece yüksek meblağlı alımlar teşvik edilir. Ortalama olarak **1 RX Puanı = 16-20 Kuruş (0,16 - 0,20 TL)** aralığına denk gelir.

| Paket Adı | RX Puanı | Fiyat (TL) | 1 RX Birim Maliyeti |
| :--- | :--- | :--- | :--- |
| **Başlangıç Paketi** | 100 RX | 19,90 TL | ~0,20 TL |
| **Macera Paketi (Popüler)** | 500 RX | 79,90 TL | ~0,16 TL |
| **Destansı Paket (Avantajlı)** | 2000 RX | 249,90 TL | ~0,12 TL |

## 2. Harcama Kuru (Platform İçi Tüketim)

Kullanıcıların bu puanları platform içerisinde kolayca ve düşünmeden harcayabilmeleri (mikro-ödemeler) için fiyatlandırmalar düşük tutulmalıdır.

- **Ücretli Bir Hikaye Bölümünün Kilidini Açmak:** 10 RX Puanı (Kullanıcıya maliyeti sadece 1.5 - 2 TL. Gözüne hiç batmaz.)
- **Profil için Özel Rozet Almak:** 50 RX Puanı
- **Arena'da Özel Odalara Girmek / Avantaj Sağlamak:** 20 - 100 RX Puanı

> [!TIP]
> Kullanıcı "Bölüme 2 TL veriyorum" demez, "10 RX veriyorum" der. Sanal para, harcama psikolojisini tamamen değiştirir ve tüketimi artırır. Ayrıca sistem içindeki "Rozet/Oyunlaştırma" harcamalarında para bir yazara gitmediği için **%100'ü doğrudan platformun net kârı olur.**

## 3. Hakediş Kuru ve Platform Kârı (Yazara Ödeme)

Kullanıcılar ücretli hikayeleri okuduklarında (bölüm başına RX harcadıklarında) bu puanlar yazarın "Dijital Cüzdan"ında birikir. Yazar bu puanları gerçek paraya çevirip banka hesabına çekmek istediğinde çok basit bir kur uygulanır.

**Yazar Hakediş Oranı:**
- **10 RX Puanı = 1 TL** (Yani yazarın hesabında 1 RX = 10 kuruş olarak değerlenir).
- Yazar cüzdanında 10.000 RX gördüğünde, bunun "1.000 TL" nakit değerinde olduğunu anında bilir. Hesaplama son derece şeffaf ve basittir.

**Platform Kâr Marjı:**
1. Kullanıcıdan 1 RX için ortalama **16 ile 20 kuruş** tahsil edilir.
2. Yazara 1 RX için **10 kuruş** ödenir.
3. Kalan **6 ile 10 kuruşluk fark**, platformun **Brüt Kârıdır (Oran: ~%40 ile %50 arası)**.
4. Bu kâr marjının içinden %2-3'lük sanal pos komisyonları rahatlıkla karşılanıp, operasyonel net kârlılık sağlanır.

> [!IMPORTANT]
> Bu ekonomi modeli sistemin her tarafını besler: Kullanıcılar küçük puanlarla çok iş yapabildiğini hisseder, yazarlar içerik üretmekten doğrudan (ve anlaşılır bir şekilde) para kazanır, Readixon platformu ise devasa bir mikro-ödeme hacminden %50'ye varan komisyon geliri elde eder.

## 4. Oyunlaştırma (Gamification) ve Arena Ödülleri Yönetimi

Kullanıcıların platform içinde (Arena'da yarışarak, günlük giriş yaparak vb.) bedava puan kazanabilmesi, etkileşimi devasa oranda artırır. Ancak bu durum, platformun yazarlara karşılıksız para ödemesine yol açıp zarar ettirmemelidir ("Lavabo - Musluk" Dengesi). 

Bunun için platformda **"Sıkı Kontrollü Ödül (Pazarlama Bütçesi)"** stratejisi uygulanacaktır:

- **Tek Para Birimi (RX Puanı):** Kullanıcıların kafasını karıştırmamak için Arena puanı ile satın alınan puan aynı (RX Puanı) olacaktır.
- **Kısıtlı Ödül Havuzu:** Kullanıcılar rastgele ve sınırsız RX kazanamaz. Puanlar sadece belirli haftalık turnuvaların şampiyonlarına veya ayın en aktif okurlarına bir ödül olarak verilir. 
- **Pazarlama Gideri Olarak Görme:** Örneğin, haftalık bir Arena turnuvasında toplam 1.000 RX Puanı dağıtılıyorsa, bu platform için **100 TL'lik bir promosyon/reklam gideridir**. Bu 100 TL sayesinde binlerce kullanıcı her hafta platforma gelip turnuvaya katılmış, saatlerce sitede vakit geçirmiş olur. 

> [!WARNING]
> Eğer ileride Arena o kadar büyür ve herkes her saniye puan kazanmaya başlarsa; platform sistemi anında **"Çift Para Birimine"** (Satın alınan Hard Currency [RX] vs. Sadece kozmetikte harcanan Soft Currency [AP/Arena Puanı]) geçirecek şekilde esnek tasarlanmalıdır. Ancak başlangıç için kısıtlı ödül dağıtımı en ideal olanıdır.
