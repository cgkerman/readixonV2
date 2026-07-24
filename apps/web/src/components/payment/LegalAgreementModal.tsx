import React from 'react';
import { X } from 'lucide-react';
import { Typography } from '@readixon/ui';

interface UserInfo {
  name: string;
  email: string;
}

interface ProductInfo {
  name: string;
  price: string;
  period?: string;
}

interface LegalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'mesafeli-satis' | 'on-bilgilendirme' | 'iptal-iade';
  userInfo?: UserInfo;
  productInfo?: ProductInfo;
}

export function LegalAgreementModal({
  isOpen,
  onClose,
  type,
  userInfo,
  productInfo
}: LegalAgreementModalProps) {
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleString('tr-TR');
  const userName = userInfo?.name || '[Alıcı Ad Soyad]';
  const userEmail = userInfo?.email || '[Alıcı E-posta]';
  const productName = productInfo?.name || '[Ürün/Paket Adı]';
  const productPrice = productInfo?.price || '[Fiyat]';
  const productPeriod = productInfo?.period || 'Tek Seferlik';

  const title = type === 'mesafeli-satis' ? 'Mesafeli Satış Sözleşmesi' : type === 'iptal-iade' ? 'İptal ve İade Politikası' : 'Ön Bilgilendirme Formu';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-card border border-border w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-border/50 shrink-0">
          <Typography variant="h3" className="text-xl font-bold">{title}</Typography>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="prose prose-invert max-w-none text-muted text-sm md:text-base">
            {type === 'mesafeli-satis' ? (
              <MesafeliSatisContent 
                userName={userName} 
                userEmail={userEmail} 
                productName={productName} 
                productPrice={productPrice}
                productPeriod={productPeriod}
                dateStr={dateStr}
              />
            ) : type === 'iptal-iade' ? (
              <IptalIadeContent dateStr={dateStr} />
            ) : (
              <OnBilgilendirmeContent 
                userName={userName} 
                userEmail={userEmail} 
                productName={productName} 
                productPrice={productPrice}
                productPeriod={productPeriod}
                dateStr={dateStr}
              />
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-border/50 shrink-0 bg-background/50 rounded-b-3xl">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Anladım ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

function MesafeliSatisContent({ userName, userEmail, productName, productPrice, productPeriod, dateStr }: any) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted">
      <div className="text-center border-b border-border/50 pb-4 mb-6">
        <h2 className="text-lg font-bold text-text mb-1">READİXON PLATFORMU MESAFELİ SATIŞ SÖZLEŞMESİ</h2>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text">MADDE 1 - TARAFLAR VE İLETİŞİM BİLGİLERİ</h3>
        <p>İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), aşağıda bilgileri yer alan Sağlayıcı ile https://readixon.com internet sitesi ve mobil uygulamaları ("Platform") üzerinden dijital içerik, gayri maddi mal (Rx Puanı) veya aylık dijital abonelik hizmeti satın alan Alıcı arasında, elektronik ortamda onaylanması suretiyle kurulmuştur.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border border-border/50 rounded-lg p-4">
            <h4 className="font-bold text-text mb-2 text-xs uppercase tracking-wider">1.1. Sağlayıcı (Satıcı) Bilgileri</h4>
            <div className="space-y-1 text-xs">
              <p><span className="text-muted/80 block">Ticari Unvan</span><span className="font-medium text-text">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</span></p>
              <p><span className="text-muted/80 block">E-posta</span><span className="font-medium text-text">support@readixon.com</span></p>
              <p><span className="text-muted/80 block">Adres</span><span className="font-medium text-text">[Şirket Adresi]</span></p>
              <p><span className="text-muted/80 block">MERSİS & V.D.</span><span className="font-medium text-text">[MERSİS] / [V.D ve No]</span></p>
            </div>
          </div>

          <div className="border border-border/50 rounded-lg p-4">
            <h4 className="font-bold text-text mb-2 text-xs uppercase tracking-wider">1.2. Alıcı (Tüketici) Bilgileri</h4>
            <div className="space-y-1 text-xs">
              <p><span className="text-muted/80 block">Adı / Soyadı / Unvanı</span><span className="font-medium text-text">{userName}</span></p>
              <p><span className="text-muted/80 block">E-posta Adresi</span><span className="font-medium text-text">{userEmail}</span></p>
              <p><span className="text-muted/80 block">T.C. Kimlik / VKN No</span><span className="font-medium text-text">Sistemde Kayıtlı Değil</span></p>
              <p><span className="text-muted/80 block">IP Adresi</span><span className="font-medium text-text">Sistem Tarafından Kayıt Altına Alınmıştır</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 2 - TANIMLAR</h3>
        <p>İşbu Sözleşme’nin uygulanmasında ve yorumlanmasında aşağıda yer alan terimler karşılarında yazılı açıklamaları ifade eder:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-text font-medium">Platform:</strong> Readixon’a ait web sitesini (https://readixon.com) ve mobil uygulamaları,</li>
          <li><strong className="text-text font-medium">Dijital İçerik:</strong> Fiziksel bir ortama aktarılmaksızın veri biçiminde sunulan, platformda erişilebilir her türlü içerik, metin, görsel ve yazılımı,</li>
          <li><strong className="text-text font-medium">Rx Puanı:</strong> Platform içi mikro işlemlerde, dijital içerik erişimlerinde ve etkileşimlerde kullanılan, Alıcı’ya elektronik ortamda anında teslim edilen gayri maddi hak ve dijital varlığı,</li>
          <li><strong className="text-text font-medium">Aylık Abonelik Planları:</strong> Premium veya Pro paketler kapsamında Alıcı’ya aylık periyotlarla tekrarlayan şekilde platform özelliklerine kesintisiz erişim imkanı sunan sürekli edimli hizmet modelini,</li>
          <li><strong className="text-text font-medium">Ödeme Kuruluşu:</strong> PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.’yi (PayTR) ifade eder.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 3 - SÖZLEŞMENİN KONUSU VE KAPSAMI</h3>
        <p>İşbu Sözleşme’nin konusu; Alıcı’nın, Sağlayıcı’ya ait Platform üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı belirtilen tek seferlik dijital gayri maddi malın (Rx Puanı) veya aylık yenilemeli dijital abonelik hizmetinin (Premium, Pro) satışı, teslimi, ödeme esasları, iptal koşulları ile tarafların hak ve yükümlülüklerinin ilgili kanun ve yönetmelikler uyarınca tespit edilmesidir.</p>
        <p>İşbu Sözleşme yalnızca elektronik ortamda sunulan ve tüketilen dijital varlık ve hizmetleri kapsamakta olup; fiziki ürün satışı, kargo, kurye, nakliye veya fiziksel teslimat unsurlarını kapsamaz.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 4 - ÜRÜN / HİZMET NİTELİKLERİ VE ÖDEME ESASLARI</h3>
        <div className="border border-border/50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted/80 block">Satın Alınan Dijital Ürün / Hizmet</span>
              <span className="font-bold text-text">{productName}</span>
            </div>
            <div>
              <span className="text-muted/80 block">Aylık Ücret Yapısı (Vergiler Dahil)</span>
              <span className="font-bold text-text">{productPrice}</span>
            </div>
            <div>
              <span className="text-muted/80 block">Abonelik Periyodu</span>
              <span className="font-medium text-text">{productPeriod}</span>
            </div>
            <div>
              <span className="text-muted/80 block">Ödeme Tipi</span>
              <span className="font-medium text-text">Kredi Kartı / Banka Kartı (PayTR)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 5 - ÖDEME, FATURA VE ÖDEME ALTYAPISI (PayTR) ESASLARI</h3>
        <p><strong>5.1. Ödeme Güvenliği ve PCI-DSS Standartları:</strong> Ödemeler, PayTR ödeme geçidi aracılığıyla gerçekleştirilir. Alıcı’ya ait hassas ödeme verileri hiçbir surette Sağlayıcı’nın sunucularında tutulmaz, işlenmez ve saklanmaz. Tüm kart işlemleri PCI-DSS Seviye 1 uyumlu PayTR altyapısı üzerinde güvenli tokenizasyon yöntemleri ile yürütülür.</p>
        <p><strong>5.2. Tek Çekim İşlemleri (Rx Puanı):</strong> Rx Puanı satın alımlarında ödeme, işlem anında tek seferde tahsil edilir.</p>
        <p><strong>5.3. Tekrarlayan Aylık Ödemeler (Abonelikler):</strong> Premium ve Pro abonelik paketlerinde ödeme, her aylık dönemin başında PayTR Abonelik API ve Kart Saklama altyapısı üzerinden otomatik olarak tahsil edilir.</p>
        <p><strong>5.4. Fatura Düzenlenmesi:</strong> Yapılan satışlara ilişkin e-fatura veya e-arşiv fatura, yasal süreler içerisinde düzenlenerek Alıcı’nın e-posta adresine iletilir.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 6 - DİJİTAL TESLİMAT VE İFA USULÜ</h3>
        <p><strong>6.1. Fiziksel Teslimatın Bulunmaması:</strong> İşbu Sözleşme’ye konu hizmet ve ürünler tamamen dijital ortamda sunulmaktadır. Kargo, teslimat adresi gibi fiziksel unsurlar kapsam dışındadır.</p>
        <p><strong>6.2. İfa Anı:</strong> Ödemenin onaylanmasını takip eden an itibarıyla ilgili hizmet veya puan Alıcı'nın hesabına elektronik ortamda otomatik olarak tanımlanır.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 7 - CAYMA HAKKI VE MEVZUAT KAPSAMINDAKİ İSTİSNALARI</h3>
        <p><strong>7.1. Rx Puanı Satın Alımlarında Cayma Hakkı:</strong> Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz. Satın alınan Rx Puanı anında tanımlanan gayri maddi bir mal niteliğindedir.</p>
        <p><strong>7.2. Aylık Abonelik Planlarında Cayma Hakkı:</strong> Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (h) bendi uyarınca "Cayma hakkı süresi sona ermeden önce, tüketicinin açık onayı ile ifasına başlanan hizmetlere ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz. Abonelik hizmetinin derhal başlatılmasını onaylayan Alıcı, aktif ödeme dönemi için 14 günlük yasal cayma hakkını kaybeder.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 8 - ABONELİK İPTALİ (FESİH) VE KULLANIM İLKELERİ</h3>
        <p><strong>8.1. Tek Tıkla İptal Kolaylığı:</strong> Alıcı, aylık tekrarlayan aboneliğini dilediği zaman hiçbir gerekçe göstermeksizin profil alanından iptal edebilir.</p>
        <p><strong>8.2. İptal İşleminin Sonuçları:</strong> Alıcı, iptal işleminden sonra, ücreti ödenmiş olan aktif abonelik ayının sonuna kadar özelliklerden kesintisiz olarak yararlanmaya devam eder. İçinde bulunulan aktif aylık dönem için ücret iadesi veya parçalı (kıst) iade yapılmaz. Bir sonraki faturalandırma döneminde karttan çekim yapılmaz.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 9 - MÜKERRER VE HATALI İŞLEMLERDE İADE USULÜ</h3>
        <p>Sistemsel hatalar veya PayTR altyapısı üzerinden gerçekleşen mükerrer (çift) kart çekimleri durumunda, fazla tahsil edilen tutar, hiçbir masraf yüklenmeksizin ödemenin yapıldığı orijinal kredi/banka kartına PayTR sistemi üzerinden iade edilir.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 10 - KİŞİSEL VERİLERİN KORUNMASI VE GİZLİLİK</h3>
        <p>Sağlayıcı, Alıcı’ya ait kişisel verileri 6698 sayılı KVKK'ya uygun olarak işlemektedir. Ödeme süreçlerinde kart verileri doğrudan PCI-DSS Level 1 sertifikalı PayTR altyapısına iletildiği için Sağlayıcı sunucularında hiçbir kart bilgisi saklanmaz.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 11 - UYUŞMAZLIKLARIN ÇÖZÜMÜ VE ZORUNLU ARABULUCULUK İKAZI</h3>
        <p>İşbu Sözleşme’den doğan uyuşmazlıklarda, Ticaret Bakanlığı tarafından her yıl ilan edilen parasal sınırlar dahilinde Alıcı’nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki İl veya İlçe Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.</p>
        <p><strong>Zorunlu Arabuluculuk Şartı:</strong> 6502 sayılı Kanun’un 73/A maddesi gereğince, Tüketici Mahkemesi’nin görev alanına giren uyuşmazlıklarda dava açılmadan önce dava şartı olarak arabuluculuğa başvurulması zorunludur.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">MADDE 12 - YÜRÜRLÜK VE KABUL</h3>
        <p>Alıcı, sipariş/abonelik adımlarını tamamlarken işbu Sözleşme'yi ve Ön Bilgilendirme Formu'nu okuyup anladığını, elektronik ortamda gerekli onay kutucuklarını işaretleyerek kabul ettiğini taahhüt eder. Sözleşme elektronik ortamda onaylandığı an itibarıyla yürürlüğe girer.</p>
      </div>

      <div className="mt-8 border border-border/50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div>
          <span className="block text-muted/80 uppercase tracking-wider mb-1">Elektronik Onay Tarihi</span>
          <span className="font-bold text-text">{dateStr}</span>
        </div>
        <div className="text-right">
          <span className="block text-muted/80 uppercase tracking-wider mb-1">Satıcı & Sağlayıcı</span>
          <span className="font-bold text-text">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</span>
        </div>
      </div>
    </div>
  );
}

function OnBilgilendirmeContent({ userName, userEmail, productName, productPrice, productPeriod, dateStr }: any) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted">
      <div className="text-center border-b border-border/50 pb-4 mb-6">
        <h2 className="text-lg font-bold text-text mb-1">READİXON PLATFORMU ÖN BİLGİLENDİRME FORMU</h2>
      </div>

      <p>İşbu Ön Bilgilendirme Formu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca, dijital ürün/hizmet satın alma işlemi öncesinde sizi bilgilendirmek amacıyla hazırlanmıştır.</p>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">1. SAĞLAYICI VE ALICI BİLGİLERİ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border border-border/50 rounded-lg p-4">
            <h4 className="font-bold text-text mb-2 text-xs uppercase tracking-wider">Sağlayıcı (Satıcı)</h4>
            <div className="space-y-1 text-xs">
              <p><span className="text-muted/80 block">Ticari Unvan</span><span className="font-medium text-text">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</span></p>
              <p><span className="text-muted/80 block">E-posta</span><span className="font-medium text-text">support@readixon.com</span></p>
              <p><span className="text-muted/80 block">Adres</span><span className="font-medium text-text">[Şirket Adresi]</span></p>
            </div>
          </div>

          <div className="border border-border/50 rounded-lg p-4">
            <h4 className="font-bold text-text mb-2 text-xs uppercase tracking-wider">Alıcı (Tüketici)</h4>
            <div className="space-y-1 text-xs">
              <p><span className="text-muted/80 block">Adı / Soyadı / Unvanı</span><span className="font-medium text-text">{userName}</span></p>
              <p><span className="text-muted/80 block">E-posta Adresi</span><span className="font-medium text-text">{userEmail}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">2. SÖZLEŞME KONUSU HİZMET VE FİYATLANDIRMA</h3>
        <div className="border border-border/50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted/80 block">Satın Alınan Paket</span>
              <span className="font-bold text-text">{productName}</span>
            </div>
            <div>
              <span className="text-muted/80 block">Satış Bedeli (Vergiler Dâhil)</span>
              <span className="font-bold text-text">{productPrice}</span>
            </div>
            <div>
              <span className="text-muted/80 block">Abonelik Periyodu</span>
              <span className="font-medium text-text">{productPeriod}</span>
            </div>
            <div>
              <span className="text-muted/80 block">Teslimat Şekli</span>
              <span className="font-medium text-text">Elektronik Ortamda Anında İfa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">3. ÖDEME, FATURA VE ÖDEME ALTYAPISI (PayTR) ESASLARI</h3>
        <p><strong>3.1. Ödeme Güvenliği ve Kart Saklama:</strong> Tüm ödemeler PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. ("PayTR") Sanal POS altyapısı üzerinden gerçekleştirilir. Kart saklama ve tekrarlayan ödemeler PCI-DSS Seviye 1 uyumlu PayTR altyapısında güvenli tokenizasyon ile yürütülür.</p>
        <p><strong>3.2. Aylık Tekrarlayan Çekimler (Abonelikler):</strong> Premium veya Pro paket satın alımlarında, bedel her aylık kullanım döneminin başında PayTR Abonelik altyapısı aracılığıyla otomatik tahsil edilir.</p>
        <p><strong>3.3. Fatura Gönderimi:</strong> Düzenlenen e-fatura veya e-arşiv fatura yasal süre içerisinde Alıcı’nın e-posta adresine iletilir.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">4. DİJİTAL TESLİMAT VEYA İFA USULÜ</h3>
        <p>İşbu Sözleşme’ye konu tüm içerik, puan ve abonelikler dijital ortamda sunulmakta olup, fiziksel teslimat yapılmayacaktır. Ödemenin onaylanması ile birlikte Rx Puanı veya abonelik yetkileri hesaba elektronik ortamda anında tanımlanır.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">5. CAYMA HAKKI VE MEVZUAT KAPSAMINDAKİ İSTİSNALARI</h3>
        <p><strong>5.1. Cayma Hakkının Bulunmaması:</strong> Mesafeli Sözleşmeler Yönetmeliği uyarınca; "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz. Satın alma işlemine onay vererek, dijital içeriğin ifasına anında başlanmasını talep ettiğinizi ve bu sebeple cayma hakkınızı kaybedeceğinizi kabul etmiş olursunuz.</p>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">6. ABONELİK İPTALİ (FESİH) VE İADE İLKELERİ</h3>
        <p>Aylık aboneliklerinizi dilediğiniz zaman profil alanından iptal edebilirsiniz. İptal durumunda mevcut haklarınız aktif ayın sonuna kadar devam eder, ancak ücret iadesi veya kıst iade yapılmaz. Takip eden faturalandırma döneminde karttan ödeme alınmaz.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">7. MÜKERRER VEYA HATALI İŞLEMLERDE İADE PROCEDÜRÜ</h3>
        <p>Sistemsel aksaklıklar veya PayTR kaynaklı mükerrer kart çekimleri tespiti halinde; fazla tahsil edilen tutar Alıcı’ya yansıtma yapılmaksızın PayTR aracılığıyla ödemenin yapıldığı kartına iade edilir.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">8. ŞİKAYET VE UYUŞMAZLIK ÇÖZÜMÜ (ZORUNLU ARABULUCULUK İKAZI)</h3>
        <p>Alıcı şikayetlerini support@readixon.com adresine iletebilir. Uyuşmazlık hallerinde parasal sınırlar dâhilinde Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir. Tüketici Mahkemesi’nin görev alanına giren uyuşmazlıklarda dava açılmadan önce dava şartı olarak arabuluculuğa başvurulması zorunludur.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">9. KABUL VE ONAY</h3>
        <p>Alıcı, sipariş adımlarını tamamlarken işbu Ön Bilgilendirme Formu'nu okuyup anladığını, elektronik ortamda onay kutucuğunu işaretleyerek onayladığını kabul ve beyan eder.</p>
      </div>

      <div className="mt-8 border border-border/50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div>
          <span className="block text-muted/80 uppercase tracking-wider mb-1">Elektronik Onay Tarihi</span>
          <span className="font-bold text-text">{dateStr}</span>
        </div>
        <div className="text-right">
          <span className="block text-muted/80 uppercase tracking-wider mb-1">Satıcı & Sağlayıcı</span>
          <span className="font-bold text-text">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</span>
        </div>
      </div>
    </div>
  );
}

function IptalIadeContent({ dateStr }: { dateStr: string }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted">
      <div className="text-center border-b border-border/50 pb-4 mb-6">
        <h2 className="text-lg font-bold text-text mb-1">READİXON PLATFORMU İPTAL VE İADE POLİTİKASI</h2>
      </div>

      <p>İşbu İptal ve İade Politikası, https://readixon.com internet sitesi ve mobil uygulamaları ("Platform") üzerinden sunulan tek seferlik gayri maddi mal (Rx Puanı) satışları ve aylık tekrarlayan dijital abonelik hizmetlerine (Premium / Pro) ilişkin iptal, fesih ve iade süreçlerini düzenlemek amacıyla hazırlanmıştır.</p>
      <p>Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi ("Sağlayıcı"), Tüketici Mevzuatı (6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği ve Abonelik Sözleşmeleri Yönetmeliği) hükümlerine tam uyum içerisinde hareket eder.</p>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">1. GENEL PRENSİPLER VE DİJİTAL HİZMET KAPSAMI</h3>
        <p><strong>1.1. Tamamen Dijital İçerik:</strong> Readixon platformunda sunulan tüm Rx Puanları ve abonelik yetkileri elektronik ortamda üretilen, sunulan ve tüketilen dijital varlık ve hizmetlerdir.</p>
        <p><strong>1.2. Fiziksel Teslimat ve Kargo Muafiyeti:</strong> Platform üzerinde hiçbir fiziki ürün satışı yapılmamaktadır. Bu doğrultuda; kargo gönderimi, kurye adresi, iade kargo ücreti, kargo hasar tutanağı veya fiziksel ürün iade süreçleri Readixon politikaları ve hizmet kapsamı dışındadır.</p>
        <p><strong>1.3. Anında İfa:</strong> Tüm hak tanımlamaları ve yetkilendirmeler, ödeme onayının PayTR ödeme geçidinden alınmasını müteakip kullanıcı hesabına elektronik ortamda anında aktarılır.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">2. Rx PUANI SATIN ALIMLARI İPTAL VE İADE ŞARTLARI</h3>
        <p><strong>2.1. Cayma Hakkı İstisnası:</strong> Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca; "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.</p>
        <p><strong>2.2. İade Edilemezlik Kuralı:</strong> Satın alınan Rx Puanları, ödeme tamamlandığı an Alıcı'nın hesabına otomatik olarak yüklendiğinden ve anında ifa edildiğinden iptal edilemez, iade edilemez ve nakde dönüştürülemez.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">3. AYLIK ABONELİK PLANLARI (PREMIUM / PRO) İPTAL VE İADE ŞARTLARI</h3>
        <p>Abonelik planları, kullanıcıya aylık periyotlarla tekrarlayan şekilde Premium veya Pro özelliklere erişim sağlayan sürekli edimli hizmetlerdir.</p>
        <p><strong>3.1. Cayma Hakkı İstisnası ve Derhal Başlatma Onayı:</strong> Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (h) bendi uyarınca; "Cayma hakkı süresi sona ermeden önce, tüketicinin açık onayı ile ifasına başlanan hizmetlere ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz. Alıcı, ödeme adımlarında dijital hizmetin derhal başlatılmasına onay vererek hesabına Premium/Pro yetkilerini anında tanımlattığı için, satın alınan aktif ödeme dönemi (ay) için 14 günlük yasal cayma hakkı ve ücret iadesi ortadan kalkar.</p>
        <p><strong>3.2. Tek Tıkla Abonelik İptali:</strong> Alıcı, tekrarlayan aylık aboneliğini dilediği zaman hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sonlandırabilir. İptal işlemi, Platform üzerindeki kullanıcı profili alanında yer alan "Aboneliği İptal Et" butonuna tıklanarak kolayca gerçekleştirilir.</p>
        <p><strong>3.3. İptal İşleminin Hüküm ve Sonuçları:</strong> Abonelik iptal edildiğinde, Alıcı ücreti ödenmiş olan aktif aylık dönemin sonuna kadar Premium veya Pro özelliklerden kesintisiz yararlanmaya devam eder. İçinde bulunulan ve kullanımı devam eden aktif ay için parçalı (kıst) iade veya ücret iadesi yapılmaz. Bir sonraki faturalandırma döneminde PayTR kanalıyla Alıcı'nın kartından hiçbir çekim yapılmaz, abonelik yenilenmez ve dönem sonunda yetkiler otomatik olarak sona erer.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">4. MÜKERRER VEYA HATALI İŞLEMLERDE İADE PROSEDÜRÜ</h3>
        <p><strong>4.1. Sistemsel Hata ve Mükerrer Çekim:</strong> Alıcı kaynaklı olmayan teknik aksaklıklar, sistemsel sunucu hataları veya PayTR ödeme geçidi kaynaklı mükerrer (çift) kart çekimleri tespiti halinde iade hakkı doğar.</p>
        <p><strong>4.2. İade Yöntemi:</strong> Fazla veya hatalı tahsil edilen tutar, Alıcı’ya herhangi bir masraf, kesinti veya yükümlülük yansıtılmaksızın, ödemenin yapıldığı orijinal kredi/banka kartına PayTR sistemi üzerinden tek seferde (blok halinde) geri ödenir.</p>
        <p><strong>4.3. Yasal İade Süresi:</strong> Sağlayıcı, hatalı işlemin tespitinden itibaren 14 (on dört) gün içerisinde iade talimatını PayTR üzerinden Alıcı'nın bankasına iletmekle yükümlüdür. Tutarın Alıcı ekstresine yansıma süresi Alıcı'nın çalıştığı bankanın iç prosedürlerine bağlıdır.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-text mt-6">5. ÖDEME ALTYAPISI VE GÜVENLİK (PayTR)</h3>
        <p><strong>5.1.</strong> Tüm ödeme ve olası iade işlemleri PCI-DSS Seviye 1 sertifikalı PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. altyapısı üzerinden yürütülür.</p>
        <p><strong>5.2.</strong> Alıcı'ya ait kart bilgileri Sağlayıcı sunucularında saklanmaz. İadeler doğrudan PayTR API sistemleri üzerinden işlem referans numarası ile kart sahibinin hesabına yönlendirilir.</p>
      </div>

      <div className="mt-8 border border-border/50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div>
          <span className="block text-muted/80 uppercase tracking-wider mb-1">Okuma ve Onay Tarihi</span>
          <span className="font-bold text-text">{dateStr}</span>
        </div>
        <div className="text-right">
          <span className="block text-muted/80 uppercase tracking-wider mb-1">Satıcı & Sağlayıcı</span>
          <span className="font-bold text-text">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</span>
        </div>
      </div>
    </div>
  );
}
