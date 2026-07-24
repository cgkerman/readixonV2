import React from 'react';
import { Typography } from '@readixon/ui';
import { BackButton } from '@/components/BackButton';

export default function CancellationAndRefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mt-6">
        <Typography variant="h1" className="text-3xl font-bold mb-6">
          İptal ve İade Politikası
        </Typography>
        <div className="prose prose-invert max-w-none text-muted">
          <p><strong>READİXON PLATFORMU İPTAL VE İADE POLİTİKASI</strong></p>
          <p>İşbu İptal ve İade Politikası, https://readixon.com internet sitesi ve mobil uygulamaları ("Platform") üzerinden sunulan tek seferlik gayri maddi mal (Rx Puanı) satışları ve aylık tekrarlayan dijital abonelik hizmetlerine (Premium / Pro) ilişkin iptal, fesih ve iade süreçlerini düzenlemek amacıyla hazırlanmıştır.</p>
          <p>Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi ("Sağlayıcı"), Tüketici Mevzuatı (6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği ve Abonelik Sözleşmeleri Yönetmeliği) hükümlerine tam uyum içerisinde hareket eder.</p>

          <h3>1. GENEL PRENSİPLER VE DİJİTAL HİZMET KAPSAMI</h3>
          <p><strong>1.1. Tamamen Dijital İçerik:</strong> Readixon platformunda sunulan tüm Rx Puanları ve abonelik yetkileri elektronik ortamda üretilen, sunulan ve tüketilen dijital varlık ve hizmetlerdir.</p>
          <p><strong>1.2. Fiziksel Teslimat ve Kargo Muafiyeti:</strong> Platform üzerinde hiçbir fiziki ürün satışı yapılmamaktadır. Bu doğrultuda; kargo gönderimi, kurye adresi, iade kargo ücreti, kargo hasar tutanağı veya fiziksel ürün iade süreçleri Readixon politikaları ve hizmet kapsamı dışındadır.</p>
          <p><strong>1.3. Anında İfa:</strong> Tüm hak tanımlamaları ve yetkilendirmeler, ödeme onayının PayTR ödeme geçidinden alınmasını müteakip kullanıcı hesabına elektronik ortamda anında aktarılır.</p>

          <h3>2. Rx PUANI SATIN ALIMLARI İPTAL VE İADE ŞARTLARI</h3>
          <p><strong>2.1. Cayma Hakkı İstisnası:</strong> Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca; "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.</p>
          <p><strong>2.2. İade Edilemezlik Rule:</strong> Satın alınan Rx Puanları, ödeme tamamlandığı an Alıcı'nın hesabına otomatik olarak yüklendiğinden ve anında ifa edildiğinden iptal edilemez, iade edilemez ve nakde dönüştürülemez.</p>

          <h3>3. AYLIK ABONELİK PLANLARI (PREMIUM / PRO) İPTAL VE İADE ŞARTLARI</h3>
          <p>Abonelik planları, kullanıcıya aylık periyotlarla tekrarlayan şekilde Premium veya Pro özelliklere erişim sağlayan sürekli edimli hizmetlerdir.</p>
          
          <p><strong>3.1. Cayma Hakkı İstisnası ve Derhal Başlatma Onayı</strong></p>
          <p>Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (h) bendi uyarınca; "Cayma hakkı süresi sona ermeden önce, tüketicinin açık onayı ile ifasına başlanan hizmetlere ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.</p>
          <p>Alıcı, ödeme adımlarında dijital hizmetin derhal başlatılmasına onay vererek hesabına Premium/Pro yetkilerini anında tanımlattığı için, satın alınan aktif ödeme dönemi (ay) için 14 günlük yasal cayma hakkı ve ücret iadesi ortadan kalkar.</p>
          
          <p><strong>3.2. Tek Tıkla Abonelik İptali (Gelecek Dönem Yenilemesini Durdurma)</strong></p>
          <p>Alıcı, tekrarlayan aylık aboneliğini dilediği zaman hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sonlandırabilir.</p>
          <p>İptal işlemi, Platform üzerindeki kullanıcı profili alanında yer alan "Aboneliği İptal Et" butonuna tıklanarak kolayca gerçekleştirilir.</p>
          
          <p><strong>3.3. İptal İşleminin Hüküm ve Sonuçları</strong></p>
          <ul>
            <li>Abonelik iptal edildiğinde, Alıcı ücreti ödenmiş olan aktif aylık dönemin sonuna kadar Premium veya Pro özelliklerden kesintisiz yararlanmaya devam eder.</li>
            <li>İçinde bulunulan ve kullanımı devam eden aktif ay için parçalı (kıst) iade veya ücret iadesi yapılmaz.</li>
            <li>Bir sonraki faturalandırma döneminde PayTR kanalıyla Alıcı'nın kartından hiçbir çekim yapılmaz, abonelik yenilenmez ve dönem sonunda Premium/Pro yetkileri otomatik olarak sona erer.</li>
          </ul>

          <h3>4. MÜKERRER VEYA HATALI İŞLEMLERDE İADE PROSEDÜRÜ</h3>
          <p><strong>4.1. Sistemsel Hata ve Mükerrer Çekim:</strong> Alıcı kaynaklı olmayan teknik aksaklıklar, sistemsel sunucu hataları veya PayTR ödeme geçidi kaynaklı mükerrer (çift) kart çekimleri tespiti halinde iade hakkı doğar.</p>
          <p><strong>4.2. İade Yöntemi:</strong> Fazla veya hatalı tahsil edilen tutar, Alıcı’ya herhangi bir masraf, kesinti veya yükümlülük yansıtılmaksızın, ödemenin yapıldığı orijinal kredi/banka kartına PayTR sistemi üzerinden tek seferde (blok halinde) geri ödenir.</p>
          <p><strong>4.3. Yasal İade Süresi:</strong> Sağlayıcı, hatalı işlemin tespitinden itibaren 14 (on dört) gün içerisinde iade talimatını PayTR üzerinden Alıcı'nın bankasına iletmekle yükümlüdür. Tutarın Alıcı ekstresine yansıma süresi Alıcı'nın çalıştığı bankanın iç prosedürlerine bağlıdır.</p>

          <h3>5. ÖDEME ALTYAPISI VE GÜVENLİK (PayTR)</h3>
          <p><strong>5.1.</strong> Tüm ödeme ve olası iade işlemleri PCI-DSS Seviye 1 sertifikalı PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. altyapısı üzerinden yürütülür.</p>
          <p><strong>5.2.</strong> Alıcı'ya ait kart bilgileri Sağlayıcı sunucularında saklanmaz. İadeler doğrudan PayTR API sistemleri üzerinden işlem referans numarası ile kart sahibinin hesabına yönlendirilir.</p>

          <h3>6. İLETİŞİM VE DESTEK</h3>
          <p>İptal, abonelik yönetimi veya hatalı çekim bildirimlerinize ilişkin her türlü soru ve talepleriniz için bizimle iletişime geçebilirsiniz:</p>
          <p>
            <strong>Unvan:</strong> Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi<br/>
            <strong>E-posta:</strong> support@readixon.com<br/>
            <strong>Platform:</strong> https://readixon.com
          </p>
        </div>
      </div>
    </div>
  );
}
