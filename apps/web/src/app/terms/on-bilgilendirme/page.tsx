import React from 'react';
import { Typography } from '@readixon/ui';
import { BackButton } from '@/components/BackButton';

export default function PreliminaryInfoFormPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mt-6">
        <Typography variant="h1" className="text-3xl font-bold mb-6">
          Ön Bilgilendirme Formu
        </Typography>
        <div className="prose prose-invert max-w-none text-muted">
          <p><strong>READİXON PLATFORMU ÖN BİLGİLENDİRME FORMU</strong></p>
          <p>İşbu Ön Bilgilendirme Formu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun (TKHK) ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca, Alıcı’nın (Tüketici) https://readixon.com internet sitesi ve mobil uygulamaları ("Platform") üzerinden dijital ürün/hizmet satın alma işlemi öncesinde bilgilendirilmesi amacıyla hazırlanmıştır.</p>

          <h3>1. SAĞLAYICI (SATICI) BİLGİLERİ</h3>
          <p>
            Ticari Unvan: Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi (Bundan böyle "Sağlayıcı" olarak anılacaktır)<br/>
            Adres: [Şirket Adresi]<br/>
            MERSİS Numarası: [MERSİS Numarası]<br/>
            Vergi Dairesi ve No: [Vergi Dairesi] / [Vergi Numarası]<br/>
            Telefon: [Telefon Numarası]<br/>
            E-posta: support@readixon.com<br/>
            KEP Adresi: [KEP Adresi]
          </p>

          <h3>2. ALICI (TÜKETİCİ) BİLGİLERİ</h3>
          <p>
            Adı / Soyadı / Unvanı: [Alıcı Adı Soyadı]<br/>
            T.C. Kimlik / VKN No: [T.C. / VKN]<br/>
            Fatura / Yerleşim Yeri Adresi: [Alıcı Adresi]<br/>
            E-posta Adresi: [Alıcı E-posta]<br/>
            Telefon Numarası: [Alıcı Telefon]
          </p>

          <h3>3. SÖZLEŞME KONUSU ÜRÜN / HİZMET NİTELİKLERİ VE FİYATLANDIRMA</h3>
          <p>Alıcı tarafından ödeme adımında seçilen gayri maddi mal (Rx Puanı) veya aylık dijital abonelik hizmetinin (Premium / Pro) temel özellikleri, tüm vergiler dâhil toplam satış fiyatı ve ödeme periyodu aşağıda belirtildiği gibidir:</p>
          <ul>
            <li><strong>Satın Alınan Dijital Ürün / Paket:</strong> [Satın Alınan Paket]</li>
            <li><strong>Ödeme Tipi:</strong> Kredi Kartı / Banka Kartı (PayTR Altyapısı)</li>
            <li><strong>Satış Bedeli (Vergiler Dâhil):</strong> [Satış Bedeli]</li>
            <li><strong>Abonelik Periyodu:</strong> [Abonelik Periyodu]</li>
            <li><strong>Teslimat Şekli:</strong> Elektronik Ortamda Anında İfa / Kullanıcı Hesabına Otomatik Tanımlama</li>
          </ul>

          <h3>4. ÖDEME, FATURA VE ÖDEME ALTYAPISI (PayTR) ESASLARI</h3>
          <p><strong>4.1. Ödeme Güvenliği ve Kart Saklama:</strong> Tüm ödemeler PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. ("PayTR") Sanal POS altyapısı üzerinden gerçekleştirilir. Alıcı’ya ait hassas ödeme verileri (kredi kartı numarası, son kullanma tarihi, CVV/CVC) Sağlayıcı sunucularında tutulmaz. Kart saklama ve tekrarlayan ödemeler PCI-DSS Seviye 1 uyumlu PayTR altyapısında güvenli tokenizasyon ile yürütülür.</p>
          <p><strong>4.2. Tek Çekim İşlemleri (Rx Puanı):</strong> Rx Puanı satın alımlarında ödeme, işlem anında karttan tek seferde tahsil edilir.</p>
          <p><strong>4.3. Aylık Tekrarlayan Çekimler (Abonelikler):</strong> Premium veya Pro paket satın alımlarında, seçilen abonelik planının bedeli her aylık kullanım döneminin başında Alıcı’nın onay verdiği karttan PayTR Abonelik altyapısı aracılığıyla otomatik olarak tahsil edilir.</p>
          <p><strong>4.4. Kampanyalı Fiyat Geçişleri:</strong> İlk $N$ ay indirimli sunulan aboneliklerde, indirimli dönemin sona ermesini müteakip standart aylık fiyata geçileceği ve karttan standart tutarın çekileceği Alıcı'ya önceden bildirilir.</p>
          <p><strong>4.5. Fatura Gönderimi:</strong> Ödemenin tamamlanmasını müteakip yasal süre içerisinde düzenlenen e-fatura veya e-arşiv fatura Alıcı’nın e-posta adresine iletilir.</p>

          <h3>5. DİJİTAL TESLİMAT VEYA İFA USULÜ</h3>
          <p><strong>5.1. Fiziksel Teslimat Bulunmamaktadır:</strong> İşbu Sözleşme’ye konu tüm içerik, puan ve abonelikler dijital ortamda sunulmakta olup; kargo, kurye, posta veya benzeri hiçbir fiziksel teslimat yapılmayacaktır. Kargo ücreti, teslimat adresi takip süreçleri vb. unsurlar sözleşme kapsamı dışındadır.</p>
          <p><strong>5.2. İfa Anı:</strong> Ödemenin PayTR tarafından onaylanması ile birlikte Rx Puanı veya abonelik yetkileri Alıcı’nın Readixon kullanıcı hesabına elektronik ortamda anında tanımlanır ve kullanıma açılır.</p>

          <h3>6. CAYMA HAKKI VE MEVZUAT KAPSAMINDAKİ İSTİSNALARI</h3>
          <p><strong>6.1. Rx Puanı Satın Alımlarında Cayma Hakkı</strong></p>
          <p>Mesafeli Sözleşmeler Yönetmeliği’nin 15/1-(ğ) maddesi uyarınca; "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz. Satın alınan Rx Puanı dijital bir gayri maddi varlık olarak hesaba anında yüklendiğinden cayma hakkı ve ücret iadesi bulunmamaktadır.</p>
          <p><strong>6.2. Aylık Abonelik Planlarında Cayma Hakkı</strong></p>
          <p>Mesafeli Sözleşmeler Yönetmeliği’nin 15/1-(h) maddesi uyarınca; "Cayma hakkı süresi sona ermeden önce, tüketicinin açık onayı ile ifasına başlanan hizmetlere ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.</p>
          <p>Alıcı, ödeme adımlarında "Abonelik hizmetimin derhal başlatılmasını onaylıyor ve bu kapsamda cayma hakkımı kaybedeceğimi kabul ediyorum" onay kutucuğunu işaretleyerek hizmeti anında başlattığından, satın alınan aktif ödeme dönemi (ay) için 14 günlük yasal cayma hakkı ve ücret iadesi ortadan kalkar.</p>

          <h3>7. ABONELİK İPTALİ (FESİH) VE İADE İLKELERİ</h3>
          <p><strong>7.1. Tek Tıkla İptal:</strong> Alıcı, tekrarlayan aylık aboneliğini dilediği zaman hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin Platform üzerindeki profili üzerinden "Aboneliği İptal Et" butonuna tıklayarak sonlandırabilir.</p>
          <p><strong>7.2. Kullanım ve Fesih Sonuçları:</strong></p>
          <ul>
            <li>İptal işlemi gerçekleştiğinde, Alıcı ücreti ödenmiş olan aktif ayın sonuna kadar Premium/Pro özelliklerden yararlanmaya devam eder.</li>
            <li>İçinde bulunulan aktif aylık dönem için ücret iadesi veya parçalı (kıst) iade yapılmaz.</li>
            <li>Takip eden faturalandırma döneminde Alıcı'nın kartından ödeme alınmaz, abonelik yenilenmez ve dönem sonunda yetkiler otomatik olarak sonlandırılır.</li>
          </ul>

          <h3>8. MÜKERRER VEYA HATALI İŞLEMLERDE İADE PROCEDÜRÜ</h3>
          <p>Sistemsel aksaklıklar veya PayTR ödeme geçidi kaynaklı mükerrer (çift) kart çekimleri tespiti halinde; fazla tahsil edilen tutar Alıcı’ya hiçbir masraf veya yansıtma yapılmaksızın PayTR aracılığıyla ödemenin yapıldığı kartına 14 (on dört) gün içerisinde tek seferde iade edilir.</p>

          <h3>9. ŞİKAYET VE UYUŞMAZLIK ÇÖZÜMÜ (ZORUNLU ARABULUCULUK İKAZI)</h3>
          <p><strong>9.1.</strong> Alıcı, satın aldığı hizmetlere ilişkin şikayet ve itirazlarını support@readixon.com e-posta adresi üzerinden Sağlayıcı'ya iletebilir.</p>
          <p><strong>9.2.</strong> Uyuşmazlık hallerinde, Ticaret Bakanlığı tarafından her yıl belirlenmiş olan parasal sınırlar dâhilinde Alıcı'nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki İl/İlçe Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.</p>
          <p><strong>9.3. ZORUNLU ARABULUCULUK ŞARTI İKAZI:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun’un 73/A maddesi uyarınca, Tüketici Mahkemesi’nin görev alanına giren uyuşmazlıklarda DAVA AÇILMADAN ÖNCE DAVA ŞARTI OLARAK ARABULUCULUĞA BAŞVURULMASI ZORUNLUDUR. Arabuluculuk süreci işletilmeden doğrudan Tüketici Mahkemesi'nde açılan davalar dava şartı yokluğu sebebiyle usulden reddedilecektir.</p>

          <h3>10. KABUL VE ONAY</h3>
          <p>Alıcı, Platform üzerinden sipariş adımlarını tamamlarken işbu Ön Bilgilendirme Formu'nu okuyup anladığını, elektronik ortamda onay kutucuğunu (checkbox) işaretleyerek onayladığını kabul ve beyan eder.</p>

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
