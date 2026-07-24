import React from 'react';
import { Typography } from '@readixon/ui';
import { BackButton } from '@/components/BackButton';

export default function DistanceSellingContractPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mt-6">
        <Typography variant="h1" className="text-3xl font-bold mb-6">
          Mesafeli Satış Sözleşmesi
        </Typography>
        <div className="prose prose-invert max-w-none text-muted">
          <p>
            <strong>READİXON PLATFORMU MESAFELİ SATIŞ SÖZLEŞMESİ</strong>
          </p>

          <h3>MADDE 1 - TARAFLAR VE İLETİŞİM BİLGİLERİ</h3>
          <p>
            İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), aşağıda bilgileri yer alan Sağlayıcı ile https://readixon.com internet sitesi ve mobil uygulamaları ("Platform") üzerinden dijital içerik, gayri maddi mal (Rx Puanı) veya aylık dijital abonelik hizmeti satın alan Alıcı arasında, elektronik ortamda onaylanması suretiyle kurulmuştur.
          </p>

          <h4>1.1. SAĞLAYICI (SATICI) BİLGİLERİ</h4>
          <p>
            Ticari Unvan: Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi (Bundan böyle "Sağlayıcı" olarak anılacaktır)<br />
            Adres: [Şirket Adresi]<br />
            MERSİS Numarası: [MERSİS Numarası]<br />
            Vergi Dairesi ve No: [Vergi Dairesi] / [Vergi Numarası]<br />
            Telefon: [Telefon Numarası]<br />
            E-posta: support@readixon.com<br />
            KEP Adresi: [KEP Adresi]
          </p>

          <h4>1.2. ALICI (TÜKETİCİ) BİLGİLERİ</h4>
          <p>
            Adı / Soyadı / Unvanı: [Dinamik: Alıcı Ad Soyad] (Bundan böyle "Alıcı" veya "Tüketici" olarak anılacaktır)<br />
            T.C. Kimlik / VKN No: [Dinamik: T.C. / VKN]<br />
            Fatura / Yerleşim Yeri Adresi: [Dinamik: Alıcı Adresi]<br />
            E-posta Adresi: [Dinamik: Alıcı E-posta]<br />
            Telefon Numarası: [Dinamik: Alıcı Telefon]<br />
            IP Adresi: [Dinamik: İşlem Yapılan IP Adresi]
          </p>

          <h3>MADDE 2 - TANIMLAR</h3>
          <p>
            İşbu Sözleşme’nin uygulanmasında ve yorumlanmasında aşağıda yer alan terimler karşılarında yazılı açıklamaları ifade eder:
          </p>
          <ul>
            <li><strong>Platform:</strong> Readixon’a ait web sitesini (https://readixon.com) ve mobil uygulamaları,</li>
            <li><strong>Dijital İçerik:</strong> Fiziksel bir ortama aktarılmaksızın veri biçiminde sunulan, platformda erişilebilir her türlü içerik, metin, görsel ve yazılımı,</li>
            <li><strong>Rx Puanı:</strong> Platform içi mikro işlemlerde, dijital içerik erişimlerinde ve etkileşimlerde kullanılan, Alıcı’ya elektronik ortamda anında teslim edilen gayri maddi hak ve dijital varlığı,</li>
            <li><strong>Aylık Abonelik Planları:</strong> Premium veya Pro paketler kapsamında Alıcı’ya aylık periyotlarla tekrarlayan şekilde platform özelliklerine kesintisiz erişim imkanı sunan sürekli edimli hizmet modelini,</li>
            <li><strong>Kampanyalı / İndirimli Dönem:</strong> Belirli abonelik planlarında ilk $N$ ay (örneğin ilk 3 ay) için uygulanan indirimli aylık abonelik ücreti dönemini,</li>
            <li><strong>Ödeme Kuruluşu:</strong> PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.’yi (PayTR),</li>
            <li><strong>Kalıcı Veri Saklayıcısı:</strong> Alıcı’nın gönderdiği veya kendisine gönderilen bilgiyi kaydedilmesine ve değiştirilmeden kopyalanmasına imkan veren e-posta, kısa mesaj vb. araçları ifade eder.</li>
          </ul>

          <h3>MADDE 3 - SÖZLEŞMENİN KONUSU VE KAPSAMI</h3>
          <p>
            İşbu Sözleşme’nin konusu; Alıcı’nın, Sağlayıcı’ya ait Platform üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı belirtilen tek seferlik dijital gayri maddi malın (Rx Puanı) veya aylık yenilemeli dijital abonelik hizmetinin (Premium, Pro) satışı, teslimi, ödeme esasları, iptal koşulları ile tarafların hak ve yükümlülüklerinin 6502 sayılı Tüketicinin Korunması Hakkında Kanun (TKHK), Mesafeli Sözleşmeler Yönetmeliği ve Abonelik Sözleşmeleri Yönetmeliği hükümleri uyarınca tespit edilmesidir.
          </p>
          <p>
            İşbu Sözleşme yalnızca elektronik ortamda sunulan ve tüketilen dijital varlık ve hizmetleri kapsamakta olup; fiziki ürün satışı, kargo, kurye, nakliye veya fiziksel teslimat unsurlarını kapsamaz.
          </p>

          <h3>MADDE 4 - ÜRÜN / HİZMET NİTELİKLERİ VE ÖDEME ESASLARI</h3>
          <p>
            Alıcı tarafından satın alınan dijital ürün/hizmetin türü, miktarı, tüm vergiler dahil toplam satış bedeli ve ödeme şekli özet tablosunda ve ödeme ekranında belirtildiği gibidir:
          </p>
          <ul>
            <li><strong>Satın Alınan Dijital Ürün / Hizmet:</strong> [Dinamik: Ürün/Paket Adı - Örn: 500 Rx Puanı / Premium Abonelik]</li>
            <li><strong>Sipariş / İşlem Tarihi:</strong> [Dinamik: İşlem Tarihi]</li>
            <li><strong>Ödeme Tipi:</strong> [Dinamik: Kredi Kartı / Banka Kartı (PayTR Altyapısı)]</li>
            <li><strong>Abonelik Periyodu:</strong> Aylık Yenilemeli (Her ay otomatik tekrarlayan)</li>
            <li><strong>Aylık Ücret Yapısı:</strong> [Dinamik: Kampanyalı Fiyat (Örn: İlk 3 Ay X TL/Ay) - Sonraki Aylar Standart Fiyat (Y TL/Ay)]</li>
            <li><strong>Teslimat Yöntemi:</strong> Elektronik Ortamda Anında İfa / Kullanıcı Hesabına Tanımlama</li>
          </ul>

          <h3>MADDE 5 - ÖDEME, FATURA VE ÖDEME ALTYAPISI (PayTR) ESASLARI</h3>
          <p><strong>5.1. Ödeme Güvenliği ve PCI-DSS Standartları:</strong> Ödemeler, PayTR ödeme geçidi aracılığıyla gerçekleştirilir. Alıcı’ya ait hassas ödeme verileri (kredi kartı numarası, son kullanma tarihi, CVV/CVC kodu) hiçbir surette Sağlayıcı’nın sunucularında tutulmaz, işlenmez ve saklanmaz. Tüm kart işlemleri PCI-DSS Seviye 1 uyumlu PayTR altyapısı üzerinde güvenli tokenizasyon yöntemleri ile yürütülür.</p>
          <p><strong>5.2. Tek Çekim İşlemleri (Rx Puanı):</strong> Rx Puanı satın alımlarında ödeme, Alıcı’nın seçtiği karttan PayTR Sanal POS altyapısı kullanılarak tek seferde tahsil edilir.</p>
          <p><strong>5.3. Tekrarlayan Aylık Ödemeler (Abonelikler):</strong> Premium ve Pro abonelik paketlerinde ödeme, Alıcı’nın onay verdiği karttan her aylık dönemin başında PayTR Abonelik API ve Kart Saklama altyapısı üzerinden otomatik olarak tahsil edilir.</p>
          <p><strong>5.4. Fiyat Değişiklikleri ve Otomatik Yenileme Bilgilendirmesi:</strong> Kampanyalı dönemin bitiminde standart fiyata geçişlerde veya karttan yapılacak her aylık yenileme çekimi öncesinde Alıcı’ya kayıtlı e-posta adresi veya SMS vasıtasıyla bilgilendirme yapılır.</p>
          <p><strong>5.5. Fatura Düzenlenmesi:</strong> Yapılan satışlara ilişkin e-fatura veya e-arşiv fatura, ödemenin tamamlanmasını müteakip yasal süreler içerisinde düzenlenerek Alıcı’nın sistemde kayıtlı e-posta adresine elektronik ortamda iletilir.</p>

          <h3>MADDE 6 - DİJİTAL TESLİMAT VE İFA USULÜ</h3>
          <p><strong>6.1. Fiziksel Teslimatın Bulunmaması:</strong> İşbu Sözleşme’ye konu hizmet ve ürünler tamamen dijital ortamda üretilmekte ve sunulmaktadır. Alıcı’ya kargo, kurye, posta veya benzeri fiziksel yollarla hiçbir materyal gönderilmeyecektir. Kargo ücreti, teslimat adresi, kargo takip numarası gibi fiziksel unsurlar bu Sözleşme’nin ve platformun kapsamı dışındadır.</p>
          <p><strong>6.2. İfa Anı:</strong></p>
          <ul>
            <li><strong>Rx Puanı:</strong> Ödemenin PayTR tarafından onaylanmasını takip eden an itibarıyla Alıcı'nın Readixon kullanıcı hesabına elektronik ortamda otomatik olarak tanımlanır.</li>
            <li><strong>Aylık Abonelik Planları:</strong> Ödemenin tamamlanmasıyla birlikte Alıcı’nın hesabı ilgili abonelik planının (Premium veya Pro) yetkilerine anında erişim sağlayacak şekilde güncellenir.</li>
          </ul>
          <p><strong>6.3. Sistemsel Log Kayıtları:</strong> Dijital ürün veya hizmetin Alıcı hesabı üzerinde aktivasyonunun tamamlanması, Sağlayıcı’nın veri tabanı kayıtları (loglar) ile ispat olunur.</p>

          <h3>MADDE 7 - CAYMA HAKKI VE MEVZUAT KAPSAMINDAKİ İSTİSNALARI</h3>
          <p><strong>7.1. Rx Puanı Satın Alımlarında Cayma Hakkı</strong></p>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği’nin "Cayma Hakkının İstisnaları" başlıklı 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca: "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.
            <br />
            Alıcı; satın aldığı Rx Puanı'nın hesabına anında tanımlanan gayri maddi bir mal niteliğinde olduğunu ve cayma hakkının bulunmadığını kabul eder.
          </p>

          <p><strong>7.2. Aylık Abonelik Planlarında Cayma Hakkı ve Açık Onay</strong></p>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (h) bendi uyarınca: "Cayma hakkı süresi sona ermeden önce, tüketicinin açık onayı ile ifasına başlanan hizmetlere ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.
            <br />
            Alıcı, abonelik satın alma adımlarında "Hizmetin derhal başlatılmasını kabul ediyorum ve bu kapsamda cayma hakkımı kaybedeceğimi onaylıyorum" kutucuğunu işaretleyerek abonelik hizmetini anında başlattığı takdirde, satın alınan aktif ödeme dönemi (ay) için 14 günlük yasal cayma hakkı ortadan kalkar.
          </p>

          <h3>MADDE 8 - ABONELİK İPTALİ (FESİH) VE KULLANIM İLKELERİ</h3>
          <p><strong>8.1. Tek Tıkla İptal Kolaylığı:</strong> Alıcı, aylık tekrarlayan aboneliğini dilediği zaman hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sonlandırma hakkına sahiptir. Alıcı iptal talebini, Platform üzerindeki kullanıcı profil alanında yer alan "Aboneliği İptal Et" butonuna tıklayarak ("Tek Tıkla Fesih") kolayca gerçekleştirebilir.</p>
          <p><strong>8.2. İptal İşleminin Hüküm ve Sonuçları:</strong></p>
          <ul>
            <li>Alıcı aboneliğini iptal ettiğinde, içinde bulunulan ve ücreti ödenmiş olan aktif abonelik ayının sonuna kadar Premium veya Pro özelliklerden kesintisiz olarak yararlanmaya devam eder.</li>
            <li>İçinde bulunulan aktif aylık dönem için ücret iadesi veya parçalı (kıst) iade yapılmaz.</li>
            <li>Bir sonraki faturalandırma döneminde Alıcı'nın kartından hiçbir şekilde yeni bir çekim yapılmaz, abonelik yenilenmez ve dönem sonunda abonelik yetkileri otomatik olarak sona erer.</li>
          </ul>

          <h3>MADDE 9 - MÜKERRER VE HATALI İŞLEMLERDE İADE USULÜ</h3>
          <p><strong>9.1. İade Senaryoları:</strong> İade süreçleri yalnızca Alıcı kaynaklı olmayan teknik aksaklıklar, sistemsel hatalar veya PayTR altyapısı üzerinden gerçekleşen mükerrer (çift) kart çekimleri durumunda geçerlidir.</p>
          <p><strong>9.2. Geri Ödeme Yöntemi:</strong> Hatalı veya mükerrer çekimlerin tespiti halinde iadeler, Alıcı’ya herhangi bir masraf veya yükümlülük yüklenmeksizin, ödemenin yapıldığı orijinal kredi/banka kartına PayTR sistemi üzerinden tek seferde (blok halinde) gerçekleştirilir.</p>
          <p><strong>9.3. Yasal Süre:</strong> Sağlayıcı, iade onayının verilmesini müteakip 14 (on dört) gün içerisinde iade talimatını PayTR üzerinden bankaya iletmekle yükümlüdür. Tutarın Alıcı ekstrelerine yansıma süresi Alıcı'nın bankasının iç prosedürlerine bağlıdır.</p>

          <h3>MADDE 10 - KİŞİSEL VERİLERİN KORUNMASI VE GİZLİLİK</h3>
          <p><strong>10.1.</strong> Sağlayıcı, Alıcı’ya ait kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun olarak işlemektedir. Alıcı, Platform üzerinde yer alan Aydınlatma Metni ve Gizlilik Politikasını okuduğunu kabul eder.</p>
          <p><strong>10.2.</strong> Ödeme süreçlerinde kart verileri doğrudan PCI-DSS Level 1 sertifikalı PayTR altyapısına iletildiği için Sağlayıcı sunucularında hiçbir kart bilgisi saklanmaz.</p>

          <h3>MADDE 11 - UYUŞMAZLIKLARIN ÇÖZÜMÜ VE ZORUNLU ARABULUCULUK İKAZI</h3>
          <p><strong>11.1. Tüketici Hakem Heyetleri ve Mahkemeler:</strong> İşbu Sözleşme’den doğan uyuşmazlıklarda, Ticaret Bakanlığı tarafından her yıl ilan edilen parasal sınırlar dahilinde Alıcı’nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki İl veya İlçe Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.</p>
          <p><strong>11.2. ZORUNLU ARABULUCULUK ŞARTI BİLGİLENDİRMESİ:</strong><br />
          6502 sayılı Tüketicinin Korunması Hakkında Kanun’un 73/A maddesi gereğince, parasal sınırlar dâhilinde Tüketici Mahkemesi’nin görev alanına giren uyuşmazlıklarda DAVA AÇILMADAN ÖNCE DAVA ŞARTI OLARAK ARABULUCULUĞA BAŞVURULMASI ZORUNLUDUR. Arabuluculuk süreci işletilmeksizin doğrudan Tüketici Mahkemesi'nde açılan davalar, Hukuk Muhakemeleri Kanunu uyarınca dava şartı yokluğu sebebiyle usulden reddedilecektir.</p>

          <h3>MADDE 12 - YÜRÜRLÜK VE KABUL</h3>
          <p><strong>12.1.</strong> Alıcı, Platform üzerinden sipariş/abonelik adımlarını tamamlarken işbu Sözleşme'yi ve Ön Bilgilendirme Formu'nu okuyup anladığını, elektronik ortamda gerekli onay kutucuklarını (checkbox) işaretleyerek kabul ettiğini ve Sözleşme hükümlerinin yürürlüğe girdiğini kabul, beyan ve taahhüt eder.</p>
          <p><strong>12.2.</strong> İşbu Sözleşme, Alıcı tarafından elektronik ortamda onaylandığı an itibarıyla yürürlüğe girmiş olup abonelik devam ettiği sürece geçerliliğini korur.</p>

          <div className="mt-8 pt-4 border-t border-border">
            <p><strong>SAĞLAYICI:</strong> Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</p>
            <p><strong>ALICI:</strong> [Dinamik: Alıcı Ad Soyad]</p>
            <p><strong>TARİH:</strong> [Dinamik: Sistem Tarihi/Saati]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
