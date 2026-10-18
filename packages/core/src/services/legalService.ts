import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { LegalDocument, LegalDocType } from '../types';

export const LEGAL_COLLECTION = 'legal_documents';

/**
 * Platformun yerleşik varsayılan yasal sözleşmeleri ve kuralları.
 * Firestore'da henüz kayıt yoksa veya varsayılana sıfırlandığında kullanılır.
 */
export const DEFAULT_LEGAL_DOCS: Record<LegalDocType, LegalDocument> = {
  terms: {
    id: 'terms',
    title: 'READIXON KULLANIM KOŞULLARI SÖZLEŞMESİ',
    description: 'Readixon Kullanım Şartları, Kullanıcı Sözleşmesi ve Yasal Haklar.',
    effectiveDate: '08.07.2026',
    version: 'v2.0',
    leadText: `Bu Kullanım Koşulları Sözleşmesi ("Sözleşme"), Denizli/Türkiye adresinde mukim ve platformun sahibi olan Turixon San. ve Tic. Ltd. Şti. ("Şirket") ile Readixon mobil uygulaması, web sitesi (readixon.com ve ilişkili tüm alt alan adları) ve platformun sunduğu tüm dijital hizmetler ("Platform") üzerinden hesap oluşturan, içerik paylaşan veya Platformu ziyaretçi sıfatıyla kullanan tüm gerçek kişiler ("Kullanıcı") arasında akdedilmiştir.

Platforma kayıt olarak, giriş yaparak veya Platform servislerini herhangi bir şekilde kullanarak, bu Sözleşme’nin tüm maddelerini okuduğunuzu, içeriğini tamamen anladığınızı ve Sözleşme’de yer alan tüm şartlara kayıtsız şartsız bağlı kalacağınızı beyan ve taahhüt edersiniz.`,
    sections: [
      {
        id: 'terms-1',
        title: '1. TARAFLAR VE SÖZLEŞMENİN KABULÜ',
        content: `<p>Bu Kullanım Koşulları Sözleşmesi ("Sözleşme"), Denizli/Türkiye adresinde mukim ve platformun sahibi olan Turixon San. ve Tic. Ltd. Şti. ("Şirket") ile Readixon mobil uygulaması, web sitesi (readixon.com ve ilişkili tüm alt alan adları) ve platformun sunduğu tüm dijital hizmetler ("Platform") üzerinden hesap oluşturan, içerik paylaşan veya Platformu ziyaretçi sıfatıyla kullanan tüm gerçek kişiler ("Kullanıcı") arasında akdedilmiştir.</p>
<p>Platforma kayıt olarak, giriş yaparak veya Platform servislerini herhangi bir şekilde kullanarak, bu Sözleşme’nin tüm maddelerini okuduğunuzu, içeriğini tamamen anladığınızı ve Sözleşme’de yer alan tüm şartlara kayıtsız şartsız bağlı kalacağınızı beyan ve taahhüt edersiniz.</p>`
      },
      {
        id: 'terms-2',
        title: '2. TANIMLAR',
        content: `<ul class="space-y-3 list-disc list-inside">
  <li><strong>Şirket:</strong> Turixon San. ve Tic. Ltd. Şti.'yi ifade eder.</li>
  <li><strong>Platform:</strong> Readixon isimli mobil uygulamayı, web sitesini, sosyal ağ özelliklerini ve bunlara bağlı tüm hizmetleri ifade eder.</li>
  <li><strong>Kullanıcı / Üye:</strong> Platform üzerinde hesap açmış veya hesabı olmaksızın Platformu kullanan tüm gerçek kişileri ifade eder.</li>
  <li><strong>İçerik:</strong> Kullanıcılar tarafından Platformda yayınlanan, paylaşılan veya iletilen her türlü yazı, şiir, hikaye, deneme, eleştiri, yorum, profil resmi, görsel, ses kaydı ve diğer materyalleri ifade eder.</li>
  <li><strong>Yer Sağlayıcı:</strong> 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun uyarınca, kullanıcıların ürettiği içerikleri barındıran sistemi sağlayan kişiyi ifade eder.</li>
</ul>`
      },
      {
        id: 'terms-3',
        title: '3. KULLANICI UYGUNLUĞU VE YAŞ SINIRI',
        content: `<div class="space-y-4">
  <p><strong>Asgari Yaş Sınırı:</strong> Platformu kullanabilmek ve üyelik hesabı oluşturabilmek için en az 13 yaşında olmanız gerekmektedir.</p>
  <p><strong>Velayet/Vesayet Onayı:</strong> 13 yaşını doldurmuş ancak 18 yaşından küçük (reşit olmayan) Kullanıcılar, Platforma üye olmadan ve içerik paylaşmadan önce ebeveynlerinin veya yasal vasilerinin bu Sözleşme’yi okuyup onayladığını taahhüt ederler. Ebeveyn veya vasi onayı olmaksızın yapılan üyeliklerin sorumluluğu Kullanıcıya ve velisine aittir.</p>
  <p><strong>Yasal Ehliyet:</strong> Kullanıcı, kendi ülkesinin yasalarına göre sözleşme imzalama ve yasal olarak bağlanma ehliyetine sahip olduğunu kabul ve beyan eder.</p>
</div>`
      },
      {
        id: 'terms-4',
        title: '4. HESAP GÜVENLİĞİ VE KULLANICI YÜKÜMLÜLÜKLERİ',
        content: `<div class="space-y-4">
  <p><strong>Doğru Bilgi Beyanı:</strong> Hesap oluştururken verilen e-posta adresi, kullanıcı adı ve diğer profil bilgilerinin doğru, güncel ve eksiksiz olması zorunludur. Yanıltıcı veya başkasına ait bilgilerle hesap açılması yasaktır.</p>
  <p><strong>Hesap Güvenliği ve Şifre:</strong> Kullanıcı, hesap şifresinin gizliliğini korumakla yükümlüdür. Şifrenin yetkisiz üçüncü şahıslar tarafından ele geçirilmesi veya hesaba izinsiz erişim sağlanması şüphesi halinde Kullanıcı, durumu derhal <a href="mailto:support@readixon.com" class="text-primary hover:underline">support@readixon.com</a> adresinden Şirket’e bildirmek zorundadır.</p>
  <p><strong>Hesap Devri Yasağı:</strong> Üyelik hesapları kişiseldir; üçüncü şahıslara devredilemez, satılamaz veya kiraya verilemez. Hesaptan gerçekleştirilen tüm işlemler doğrudan ilgili Kullanıcıya atfedilir ve hukuki sorumluluk Kullanıcıya aittir.</p>
</div>`
      },
      {
        id: 'terms-5',
        title: '5. YER SAĞLAYICI SIFATI VE SORUMLULUK SINIRLARI',
        content: `<div class="space-y-4">
  <p><strong>Yer Sağlayıcı Beyanı:</strong> Şirket, 5651 sayılı Kanun uyarınca "Yer Sağlayıcı" konumundadır. Platformda Kullanıcılar tarafından oluşturulan, paylaşılan veya iletilen edebi eserlerin, yazıların, yorumların ve hiçbir içeriğin doğruluğunu, hukuka uygunluğunu, telif haklarına uygunluğunu veya ahlaki niteliğini önceden denetleme yükümlülüğü bulunmamaktadır.</p>
  <p><strong>İçerik Sorumluluğu:</strong> Platformda yayınlanan her türlü içeriğin hukuki, cezai ve mali sorumluluğu tamamen ilgili içeriği üreten ve paylaşan Kullanıcıya aittir. Şirket, Kullanıcıların yasalara aykırı eylemlerinden veya paylaşımlarından ötürü üçüncü şahıslara karşı doğrudan veya dolaylı olarak sorumlu tutulamaz.</p>
  <p><strong>Uyar-Kaldır Prensibi:</strong> Hak ihlali, telif ihlali veya yasadışı içerik bildirimleri alındığında, Şirket yasal mevzuata uygun olarak "Uyar-Kaldır" mekanizmasını işletir ve ihlal oluşturan içeriği makul bir sürede yayından kaldırır.</p>
</div>`
      },
      {
        id: 'terms-6',
        title: '6. FİKRİ MÜLKİYET VE İÇERİK LİSANS KOŞULLARI',
        content: `<div class="space-y-4">
  <p><strong>Eser Sahipliği ve Telif Hakları:</strong> Kullanıcı tarafından Platformda yayınlanan tüm orijinal yazı, şiir, hikaye ve diğer edebi eserlerin mülkiyeti ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) kapsamındaki tüm telif hakları münhasıran yazar olan Kullanıcıya ait kalmaya devam eder. Şirket, eserlerin telif haklarını üzerine almaz.</p>
  <p><strong>Platforma Tanınan Lisans Hakkı:</strong> Kullanıcı, Platformda içerik yayınlayarak; Şirket’e bu içeriği Platformun işleyişini sağlamak, sunucularda saklamak, veri tabanlarında işlemek, diğer kullanıcılara görüntülemek, arama motorlarında indekslemek, sosyal medya hesaplarında Readixon'ın tanıtımı amacıyla paylaşmak ve teknik süreçlerin gerektirdiği şekilde kopyalamak üzere; dünya çapında, telifsiz (ücretsiz), münhasır olmayan, devredilebilir ve alt lisanslanabilir bir kullanım hakkı (lisans) vermiş olur. Bu lisans, Kullanıcı içeriği silene veya hesabını kapatana kadar geçerlidir.</p>
  <p><strong>İntihal (Çalıntı Eser) ve Telif İhlali Yasağı:</strong> Kullanıcı, kendisinin üretmediği veya üzerinde yasal olarak paylaşım hakkına (lisansına/yetkisine) sahip olmadığı hiçbir eseri Platformda paylaşamaz. İntihal yaptığı tespit edilen veya telif hakkı ihlali ihbarı doğrulanarak hak sahibinin haklarını çiğneyen Kullanıcının ilgili içeriği derhal silinir, mükerrer ihlallerde hesabı tamamen kapatılır. Şirket'in bu durumdan dolayı uğrayabileceği her türlü zararı rücu etme hakkı saklıdır.</p>
</div>`
      },
      {
        id: 'terms-7',
        title: '7. TOPLULUK KURALLARI VE YASAKLI EYLEMLER',
        content: `<div class="space-y-4">
  <p>Kullanıcı, Platformu kullanırken aşağıdaki kurallara ve yasalara uymayı taahhüt eder. Aşağıdaki eylemlerin gerçekleştirilmesi Sözleşme'nin ağır ihlali sayılır:</p>
  <p><strong>Hukuka Aykırı ve Zararlı İçerik:</strong> Türkiye Cumhuriyeti yasalarına aykırı, nefret söylemi barındıran, ırkçı, ayrımcı, şiddeti teşvik eden, tehdit, taciz, hakaret içeren veya pornografik/müstehcen içeriklerin paylaşılması kesinlikle yasaktır.</p>
  <p><strong>Kişisel Verilerin İhlali:</strong> Diğer kullanıcıların veya üçüncü şahısların izni olmaksızın kişisel verilerini (T.C. Kimlik No, telefon, adres vb.) paylaşmak ve özel hayatın gizliliğini ihlal etmek yasaktır.</p>
  <p><strong>Siber Güvenlik İhlalleri:</strong> Platformun teknik altyapısına zarar verecek virüs, truva atı vb. zararlı yazılımlar yaymak; Platform verilerini web scraping, bot veya otomatik veri madenciliği araçlarıyla izinsiz toplamak; Platforma aşırı yük bindirecek (DDoS) saldırılar düzenlemek yasaktır.</p>
  <p><strong>Spam ve Reklam:</strong> Platformun edebi ve sosyal yapısını bozacak şekilde tekrarlayan, alakasız içerikler (spam) üretmek ve Şirket'in yazılı izni olmaksızın ticari reklam, promosyon veya satış ortaklığı linkleri paylaşmak yasaktır.</p>
</div>`
      },
      {
        id: 'terms-8',
        title: '8. GELECEKTEKİ HİZMETLER VE ABONELİK MODELLERİ (RESERVASYON)',
        content: `<div class="space-y-4">
  <p><strong>Hizmet Değişiklikleri:</strong> Şirket, tamamen kendi takdirine bağlı olarak, Platformu geliştirmek amacıyla gelecekte ücretli üyelik modelleri, aylık/yıllık premium abonelikler, yazar destek/bahşiş sistemleri, ücretli hikaye erişimleri veya benzeri finansal mekanizmalar ekleme hakkını saklı tutar.</p>
  <p><strong>Özel Şartlar:</strong> Bu tür ücretli/premium özellikler devreye alındığında, söz konusu finansal işlemler, gelir paylaşımları ve abonelik kuralları için ek sözleşmeler veya özel şartlar (Örn: Yazar Gelir Sözleşmesi, Ödeme Koşulları) yayınlanacaktır. Kullanıcılar bu hizmetlerden faydalanmak istediklerinde söz konusu yeni şartları ayrıca onaylamakla yükümlü olacaklardır.</p>
</div>`
      },
      {
        id: 'terms-9',
        title: '9. HESAP KISITLAMA VE FESİH',
        content: `<div class="space-y-4">
  <p><strong>Şirket Tarafından Fesih:</strong> Kullanıcı’nın bu Sözleşme’deki veya topluluk kurallarındaki herhangi bir maddeyi ihlal etmesi halinde Şirket; önceden bildirimde bulunmaksızın Kullanıcı'nın içeriğini kaldırma, hesabını geçici olarak askıya alma veya hesabı tamamen ve kalıcı olarak kapatma (fesih) hakkına sahiptir.</p>
  <p><strong>Kullanıcı Tarafından Fesih:</strong> Kullanıcı, dilediği zaman Platform üzerindeki ayarlar bölümünden hesabını kapatarak veya <a href="mailto:support@readixon.com" class="text-primary hover:underline">support@readixon.com</a> adresine yazılı talepte bulunarak üyelik ilişkisini sonlandırabilir. Hesap kapatıldığında, Kullanıcı'nın profil bilgileri ve paylaştığı içerikler sistemden silinir (yasal saklama yükümlülükleri hariç).</p>
</div>`
      },
      {
        id: 'terms-10',
        title: '10. SORUMLULUK SINIRLANDIRILMASI (LIMITATION OF LIABILITY)',
        content: `<div class="space-y-4">
  <p><strong>Hizmetin Mevcudiyeti:</strong> Platform, Kullanıcıya "olduğu gibi" (as-is) ve "mevcut olduğu sürece" (as-available) esasıyla sunulmaktadır. Şirket, Platformun kesintisiz, hatasız, virüssüz veya her an erişilebilir olacağına dair açık veya zımni hiçbir garanti vermemektedir.</p>
  <p><strong>Veri Kaybı:</strong> Şirket, teknik aksaklıklar, siber saldırılar veya mücbir sebepler dolayısıyla meydana gelebilecek veri kayıplarından veya içeriklerin silinmesinden doğrudan sorumlu tutulamaz. Kullanıcıların kendi eserlerini ayrıca yedeklemeleri tavsiye edilir.</p>
  <p><strong>Dolaylı Zararlar:</strong> Şirket, Platformun kullanımından veya kullanılamamasından doğan kar kaybı, prestij kaybı veya diğer dolaylı zararlardan hiçbir koşulda sorumlu değildir.</p>
</div>`
      },
      {
        id: 'terms-11',
        title: '11. SÖZLEŞME DEĞİŞİKLİKLERİ',
        content: `<p>Şirket, yasal mevzuata uyum sağlamak veya Platform modelini güncellemek amacıyla bu Sözleşme’yi dilediği zaman tek taraflı olarak revize edebilir. Sözleşme’nin güncel versiyonu Platform üzerinden yayınlandığı andan itibaren geçerlilik kazanır. Önemli değişiklikler Kullanıcıya e-posta veya Platform içi bildirim yoluyla duyurulacaktır. Değişikliklerin yürürlüğe girmesinden sonra Platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.</p>`
      },
      {
        id: 'terms-12',
        title: '12. YÜRÜRLÜKTEKİ HUKUK VE YETKİLİ MAHKEME',
        content: `<p>Bu Sözleşme’nin yorumlanmasında, uygulanmasında ve taraflar arasında çıkabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti Kanunları uygulanacaktır. Sözleşme'den kaynaklanan veya bu Sözleşme ile ilişkili olan tüm uyuşmazlıkların çözümünde Denizli Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.</p>`
      },
      {
        id: 'terms-13',
        title: '13. İLETİŞİM BİLGİLERİ',
        content: `<p class="mb-4">Bu Kullanım Koşulları ile ilgili sorularınız, geri bildirimleriniz veya telif hakkı ihlali bildirimleriniz için bizimle aşağıdaki kanallar üzerinden iletişime geçebilirsiniz:</p>
<address class="not-italic space-y-2 border-l-4 border-primary/20 pl-4 py-2">
  <p><strong>Şirket Unvanı:</strong> Turixon San. ve Tic. Ltd. Şti.</p>
  <p><strong>Adres:</strong> Denizli, Türkiye</p>
  <p><strong>E-posta:</strong> <a href="mailto:support@readixon.com" class="text-primary hover:underline">support@readixon.com</a></p>
</address>`
      }
    ]
  },

  privacy: {
    id: 'privacy',
    title: 'READIXON GİZLİLİK POLİTİKASI VE KVKK AYDINLATMA METNİ',
    description: 'Readixon Gizlilik Politikası, KVKK Aydınlatma Metni ve Veri Güvenliği Standartları.',
    effectiveDate: '08.07.2026',
    version: 'v2.0',
    leadText: `Denizli/Türkiye adresinde mukim veri sorumlusu Turixon San. ve Tic. Ltd. Şti. ("Şirket" veya "Readixon") olarak; Readixon mobil uygulaması, web sitesi (readixon.com) ve tüm ilişkili hizmetler ("Platform") üzerinden bizimle paylaştığınız kişisel verilerinizin güvenliğine ve gizliliğine büyük önem veriyoruz.

Bu Gizlilik Politikası ve KVKK Aydınlatma Metni ("Politika"); 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK"), 5651 sayılı Kanun ve ilgili yasal mevzuata uygun olarak, platformumuzu kullanan yazar, okur ve ziyaretçilerin ("Kullanıcı") kişisel verilerinin toplanma yöntemlerini, işlenme amaçlarını, hukuki sebeplerini, üçüncü kişilere aktarılma şartlarını ve veri sahiplerinin haklarını açıklamaktadır.`,
    sections: [
      {
        id: 'privacy-1',
        title: '1. VERİ SORUMLUSUNUN KİMLİĞİ',
        content: `<ul class="space-y-2 list-disc list-inside ml-4">
  <li><strong>Veri Sorumlusu:</strong> Turixon San. ve Tic. Ltd. Şti.</li>
  <li><strong>Adres:</strong> Denizli, Türkiye</li>
  <li><strong>E-Posta Adresi:</strong> <a href="mailto:kvkk@readixon.com" class="text-primary hover:underline">kvkk@readixon.com</a></li>
</ul>`
      },
      {
        id: 'privacy-2',
        title: '2. İŞLENEN KİŞİSEL VERİ KATEGORİLERİ',
        content: `<p class="mb-4">Readixon’a üye olurken, içerik üretirken, okuma yaparken veya platformu ziyaret ederken doğrudan veya dolaylı olarak aşağıdaki kişisel verileriniz işlenmektedir:</p>
<ul class="space-y-3 list-disc list-inside ml-4">
  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı, profil ismi, (gelecekte yazar ödemeleri için kimlik doğrulaması gerektiği takdirde T.C. kimlik numarası veya pasaport bilgileri).</li>
  <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası (varsa).</li>
  <li><strong>Kullanıcı İşlem Bilgileri:</strong> Paylaşılan hikayeler, şiirler, yorumlar, beğeni (oy) tercihleri, takip edilen yazarlar, okuma listeleri, okuma süreleri, platform içi mesajlaşmalar ve profil resmi.</li>
  <li><strong>İşlem Güvenliği Bilgileri (Log Bilgileri):</strong> IP adresi, port bilgileri, cihaza ait benzersiz tanımlayıcılar (UUID), işletim sistemi, tarayıcı tipi, platforma giriş-çıkış tarih ve saatleri, trafik verileri (5651 sayılı Kanun kapsamındaki sistem günlükleri/loglar).</li>
  <li><strong>Finansal Bilgiler:</strong> İleride devreye alınacak premium üyelikler veya yazar hakediş ödemeleri kapsamında; banka IBAN bilgisi, fatura adresi, ödeme geçmişi ve işlem referans numaraları.</li>
  <li><strong>Pazarlama ve İletişim Tercihleri:</strong> Bülten abonelik tercihleri, push bildirim izinleri, anket ve geribildirim yanıtları.</li>
</ul>`
      },
      {
        id: 'privacy-3',
        title: '3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI VE HUKUKİ SEBEPLERİ',
        content: `<p class="mb-4">Kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen yasal şartlar çerçevesinde aşağıdaki amaçlarla ve hukuki sebeplerle işlenmektedir:</p>
<div class="space-y-6">
  <div>
    <h3 class="font-medium text-foreground mb-2">A. Bir Sözleşmenin Kurulması veya İfasıyla Doğrudan Doğruya İlgili Olması Sebebiyle:</h3>
    <ul class="space-y-2 list-disc list-inside ml-4">
      <li>Kullanıcı hesabının oluşturulması, doğrulanması ve yönetilmesi,</li>
      <li>Kullanıcıya platform özelliklerinin sunulması,</li>
      <li>Destek taleplerinin ve şikayetlerin çözümlenmesi.</li>
    </ul>
  </div>
  <div>
    <h3 class="font-medium text-foreground mb-2">B. Veri Sorumlusunun Hukuki Yükümlülüğünü Yerine Getirebilmesi Sebebiyle:</h3>
    <ul class="space-y-2 list-disc list-inside ml-4">
      <li>5651 sayılı Kanun uyarınca trafik verilerinin en az 2 yıl boyunca saklanması zorunluluğu,</li>
      <li>Bilgi güvenliği süreçlerinin yürütülmesi ve siber saldırıların tespiti/önlenmesi.</li>
    </ul>
  </div>
  <div>
    <h3 class="font-medium text-foreground mb-2">C. Veri Sorumlusunun Meşru Menfaatleri Sebebiyle:</h3>
    <ul class="space-y-2 list-disc list-inside ml-4">
      <li>Readixon algoritmalarının iyileştirilerek kişiselleştirilmiş içerik sunulması,</li>
      <li>Telif hakkı ihlali (intihal) ve topluluk kuralları ihlallerinin moderasyonu.</li>
    </ul>
  </div>
</div>`
      },
      {
        id: 'privacy-4',
        title: '4. KİŞİSEL VERİLERİN AKTARILMASI (KİMLERLE PAYLAŞILIR?)',
        content: `<p class="mb-4">Readixon, kişisel verilerinizi üçüncü kişilere satmaz veya ticaretini yapmaz. Ancak platformun teknik olarak işleyebilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla verileriniz aşağıdaki taraflara aktarılabilmektedir:</p>
<ul class="space-y-3 list-disc list-inside ml-4">
  <li><strong>Altyapı ve Bulut Hizmet Sağlayıcıları:</strong> Platformun barındırılması ve veritabanı yönetimi için Google Firebase, AWS vb. güvenilir altyapı iş ortaklarına aktarılmaktadır.</li>
  <li><strong>Ödeme Hizmet Sağlayıcıları:</strong> Premium işlemler için lisanslı ödeme kuruluşlarına gerekli veriler iletilir.</li>
  <li><strong>Yetkili Kamu Kurum ve Kuruluşları:</strong> Yasal bir yükümlülük kapsamında yetkili adli/idari makamlar ile kanuni sınırlar çerçevesinde paylaşılır.</li>
</ul>`
      },
      {
        id: 'privacy-5',
        title: '5. KİŞİSEL VERİ TOPLAMA YÖNTEMLERİ',
        content: `<p class="mb-4">Kişisel verileriniz, tamamen dijital ortamda:</p>
<ul class="space-y-2 list-disc list-inside ml-4">
  <li>Platforma kayıt olurken doldurduğunuz formlar,</li>
  <li>Profilinizi güncellerken eklediğiniz bilgiler,</li>
  <li>Platformu kullanırken gerçekleştirdiğiniz otomatik işlemler,</li>
  <li>Çerezler (cookies) ve benzeri takip teknolojileri vasıtasıyla toplanmaktadır.</li>
</ul>`
      },
      {
        id: 'privacy-6',
        title: '6. VERİ GÜVENLİĞİ VE SAKLAMA SÜRELERİ',
        content: `<div class="space-y-4">
  <p><strong>Veri Güvenliği:</strong> Verileriniz, yetkisiz erişimlerin, veri kayıplarının veya hırsızlığın önlenmesi amacıyla modern endüstri standartlarında (SSL/TLS şifreleme, güvenlik duvarları, veri maskeleme ve erişim kısıtlamaları) korunmaktadır.</p>
  <div>
    <strong>Saklama Süreleri:</strong>
    <ul class="space-y-2 list-disc list-inside ml-4 mt-2">
      <li>Üyelik verileriniz ve içerikleriniz hesap kapatılana kadar saklanır.</li>
      <li>Sistem günlükleri (IP logları) 5651 sayılı Kanun uyarınca 2 yıl boyunca saklanır.</li>
      <li>Fatura ve mali kayıtlar kanuni süreler boyunca (10 yıl) saklanır.</li>
    </ul>
  </div>
</div>`
      },
      {
        id: 'privacy-7',
        title: '7. VERİ SAHİBİNİN (KULLANICININ) KVKK MADDE 11 KAPSAMINDAKİ HAKLARI',
        content: `<p class="mb-4">Kişisel veri sahibi olarak, KVKK’nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
<ul class="space-y-2 list-disc list-inside ml-4">
  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
  <li>Kişisel verilerinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
  <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini isteme,</li>
  <li>Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
</ul>`
      },
      {
        id: 'privacy-8',
        title: '8. BAŞVURU YÖNTEMİ VE İLETİŞİM',
        content: `<p class="mb-4">KVKK kapsamındaki haklarınızı kullanmak ve kişisel verilerinize ilişkin taleplerinizi iletmek için başvurularınızı:</p>
<ul class="space-y-2 list-disc list-inside ml-4 mb-4">
  <li><strong>E-Posta Yoluyla:</strong> Sistemimizde kayıtlı e-posta adresinizden <a href="mailto:kvkk@readixon.com" class="text-primary hover:underline">kvkk@readixon.com</a> adresine,</li>
  <li><strong>Yazılı Olarak:</strong> "Turixon San. ve Tic. Ltd. Şti. - Denizli/Türkiye" adresine fiziki posta yoluyla ulaştırabilirsiniz.</li>
</ul>
<p>Talebiniz niteliğine göre en kısa sürede ve en geç 30 (otuz) gün içinde sonuçlandırılacaktır.</p>`
      },
      {
        id: 'privacy-9',
        title: '9. ÇEREZLER (COOKIES) HAKKINDA BİLGİLENDİRME',
        content: `<p>Readixon, oturumunuzu açık tutmak, platform güvenliğini sağlamak ve tercihlerinizi hatırlamak için zorunlu ve işlevsel çerezler kullanmaktadır. Platformu kullanmaya devam ederek bu çerezlerin cihazınıza yerleştirilmesini kabul etmiş olursunuz. Çerez tercihlerinizi tarayıcınızın veya cihazınızın ayarlarından dilediğiniz zaman değiştirebilirsiniz.</p>`
      },
      {
        id: 'privacy-10',
        title: '10. DEĞİŞİKLİKLER VE GÜNCELLEMELER',
        content: `<p>Bu Politika, mevzuat değişikliklerine ve platformumuza eklenecek yeni özelliklere uyum sağlamak amacıyla Turixon San. ve Tic. Ltd. Şti. tarafından güncellenebilir. Güncel metin platformda yayınlandığı andan itibaren geçerli olacaktır.</p>`
      }
    ]
  },

  copyright: {
    id: 'copyright',
    title: 'READIXON TELİF HAKKI VE FİKRİ MÜLKİYET POLİTİKASI',
    description: 'Readixon Telif Hakkı Politikası, Fikri Mülkiyet Hakları ve DMCA İhlal Bildirim Süreçleri.',
    effectiveDate: '08.07.2026',
    version: 'v2.0',
    leadText: `Readixon platformu, yaratıcı yazarlığı, özgün edebi içerik üretimini ve fikirlerin özgürce paylaşımını destekleyen bir topluluktur. Bu doğrultuda, kullanıcılarımızın fikri mülkiyet haklarına ve telif haklarına azami düzeyde saygı gösteriyoruz.

Bu Telif Hakkı ve Fikri Mülkiyet Politikası ("Politika"), Denizli/Türkiye adresinde mukim platform sahibi Turixon San. ve Tic. Ltd. Şti. ("Şirket") tarafından işletilen Readixon mobil uygulaması, web sitesi (readixon.com) ve tüm ilişkili hizmetler ("Platform") üzerinde paylaşılan içeriklerin telif haklarına ve bu hakların korunmasına ilişkin kuralları, lisanslama şartlarını ve ihlal durumunda uygulanacak "Uyar-Kaldır" prosedürünü düzenlemektedir.`,
    sections: [
      {
        id: 'copy-1',
        title: '1. ESER SAHİPLİĞİ VE TELİF HAKLARININ KORUNMASI',
        content: `<div class="space-y-4">
  <p><strong>Hakların Saklı Tutulması:</strong> Kullanıcılar tarafından Platform üzerinde oluşturulan, yazılan, paylaşılan veya yüklenen tüm orijinal edebi eserler (şiir, hikaye, roman, deneme, eleştiri, makale vb.), görsel tasarımlar, kapak resimleri ve diğer tüm içeriklerin mülkiyeti ve 5846 sayılı FSEK ile ilgili uluslararası anlaşmalar kapsamındaki tüm fikri ve sınai mülkiyet hakları münhasıran ilgili Yazara aittir.</p>
  <p><strong>Şirket Hak Talebi Sınırı:</strong> Şirket, Kullanıcılar tarafından üretilen ve Platforma yüklenen hiçbir Eser üzerinde mülkiyet hakkı iddia etmez. Readixon, eserlerin telif hakkını üzerine almaz ve üçüncü şahıslara yazardan izinsiz satamaz.</p>
</div>`
      },
      {
        id: 'copy-2',
        title: '2. PLATFORMA TANINAN KULLANIM LİSANSI (LİSANS ŞARTLARI)',
        content: `<div class="space-y-4">
  <p><strong>Lisansın Kapsamı:</strong> Kullanıcı, Platformda paylaştığı her türlü içerik için Şirket’e; bu içeriği saklama, barındırma, sunucularda kopyalama, diğer kullanıcılara görüntüleme, arama motorlarında indekslenmesini sağlama ve Readixon'ın tanıtımı amacıyla kullanmak üzere telifsiz, münhasır olmayan bir kullanım hakkı vermiş olur.</p>
  <p><strong>Lisansın Amacı:</strong> Bu lisans, tamamen Platformun işlevlerini yerine getirebilmesi, kullanıcı deneyiminin sağlanması ve Readixon markasının tanıtılması amacıyla sınırlıdır.</p>
  <p><strong>Lisansın Süresi:</strong> Kullanıcı ilgili Eseri sildiğinde veya hesabını kapattığında bu kullanım lisansı sona erer.</p>
</div>`
      },
      {
        id: 'copy-3',
        title: '3. İNTİHAL VE TELİF HAKKI İHLALİ YASAĞI',
        content: `<div class="space-y-4">
  <p>Readixon, edebi hırsızlığa (intihal) karşı sıfır tolerans politikası uygulamaktadır.</p>
  <p><strong>Özgünlük Beyanı:</strong> Kullanıcı, Platformda yayınladığı tüm Eserlerin tamamen kendisine ait olduğunu veya bu eserleri yayınlamak için gerekli olan tüm yasal izinleri elinde bulundurduğunu taahhüt eder.</p>
  <p><strong>Yasaklı Eylemler:</strong> Başka bir yazara, kitaba veya web sitesine ait olan eserlerin izinsiz paylaşılması veya kendisininmiş gibi gösterilmesi kesinlikle yasaktır.</p>
</div>`
      },
      {
        id: 'copy-4',
        title: '4. UYAR-KALDIR PROSEDÜRÜ (TELİF İHLALİ BİLDİRİMİ)',
        content: `<p class="mb-4">Telif haklarının ihlal edildiğini düşünen hak sahipleri, 5651 sayılı Kanun ve FSEK Ek Madde 4 hükümleri uyarınca Şirketimize başvurarak içeriğin kaldırılmasını talep edebilirler.</p>
<div class="space-y-4">
  <p><strong>Bildirim Kanalları:</strong> Hak sahipleri <a href="mailto:copyright@readixon.com" class="text-primary hover:underline">copyright@readixon.com</a> adresine e-posta yoluyla veya posta adresimize ıslak imzalı dilekçe ile başvurabilirler.</p>
  <p><strong>İşlem Süresi:</strong> Usulüne uygun yapılan bildirimler en geç 24 ila 48 saat içerisinde incelenir ve ihlale konu içerik erişime engellenir.</p>
</div>`
      },
      {
        id: 'copy-5',
        title: '5. KARŞI BİLDİRİM SÜRECİ',
        content: `<p>İçeriğinin haksız yere veya bir hata sonucu kaldırıldığını düşünen Kullanıcı, Şirketimize karşı bildirimde bulunarak içeriğin yeniden yayına alınmasını talep edebilir. Karşı bildirim yasal sürelere uygun şekilde incelenir.</p>`
      },
      {
        id: 'copy-6',
        title: '6. TEKRARLAYAN İHLALCİLER POLİTİKASI (MÜKERRER İHLAL)',
        content: `<div class="space-y-4">
  <p><strong>Üç İhtar Kuralı (Three-Strikes):</strong> Platformda paylaştığı içeriklerden dolayı hakkında 3 kez haklı telif ihlali ihbarı alınan Kullanıcının hesabı kalıcı olarak kapatılır.</p>
  <p><strong>Mali Hakların İptali:</strong> Telif ihlali yaptığı kesinleşen hesapların platform içi gelir hakları iptal edilir.</p>
</div>`
      },
      {
        id: 'copy-7',
        title: '7. YAPAY ZEKA VE VERİ MADENCİLİĞİ (AI KORUMASI)',
        content: `<p>Üçüncü taraf şahısların veya yapay zeka şirketlerinin, Readixon yazarlarının eserlerini yapay zeka modellerini eğitmek amacıyla web scraping, veri madenciliği veya botlar aracılığıyla otomatik olarak çekmesi, kopyalaması ve işlemesi kesinlikle yasaktır.</p>`
      },
      {
        id: 'copy-8',
        title: '8. YÜRÜRLÜK VE DEĞİŞİKLİKLER',
        content: `<p>Bu Telif Hakkı Politikası, 08.07.2026 tarihinde yürürlüğe girmiştir. Şirket, bu politikayı dilediği zaman tek taraflı olarak güncelleme hakkına sahiptir.</p>`
      }
    ]
  },

  guidelines: {
    id: 'guidelines',
    title: 'READIXON TOPLULUK KURALLARI VE ETİK REHBERİ',
    description: 'Readixon Topluluk Kuralları, Saygı Çerçevesi ve Güvenli Edebiyat Yönergeleri.',
    effectiveDate: '08.07.2026',
    version: 'v2.0',
    leadText: `Readixon; kelimelerin gücüne inanan, özgün hikayeleri, şiirleri ve edebi fikirleri paylaşmak isteyen her seviyeden yazar ve okuru bir araya getiren canlı, dinamik ve saygılı bir topluluktur.

Bu topluluğun bir parçası olan her kullanıcımız (yazar, okur veya sadece ziyaretçi), platformda yer aldığı süre boyunca bu kurallara uymayı taahhüt eder. Amacımız, herkesin yaratıcılığını özgürce ve güvenle sergileyebileceği, yapıcı eleştirilerle gelişebileceği dijital bir sığınak yaratmaktır.`,
    sections: [
      {
        id: 'guide-1',
        title: '1. TEMEL DEĞERLERİMİZ',
        content: `<ul class="space-y-3 list-disc list-inside ml-4">
  <li><strong>Saygı ve Nezaket:</strong> Her yazarın emeğine, her okurun fikrine ve her bireyin kimliğine saygı duyarız.</li>
  <li><strong>Özgünlük:</strong> Kendi sesimizi ve hikayelerimizi yaratırız. Başkalarının emeğini çalmaz veya taklit etmeyiz.</li>
  <li><strong>Gelişim ve Destek:</strong> Birbirimizi aşağı çekmek için değil, edebi anlamda daha ileriye taşımak için eleştirir ve destekleriz.</li>
</ul>`
      },
      {
        id: 'guide-2',
        title: '2. KABUL EDİLEMEZ DAVRANIŞLAR (SIFIR TOLERANS)',
        content: `<div class="space-y-4">
  <p><strong>A. Nefret Söylemi ve Ayrımcılık:</strong> Irk, etnik köken, din, mezhep, cinsiyet, cinsel yönelim veya yaş temelinde nefret uyandıran hiçbir içeriğe izin verilmez.</p>
  <p><strong>B. Taciz ve Zorbalık (Bullying):</strong> Başka bir kullanıcıyı sistematik hedef almak, tehdit etmek, aşağılamak veya zorbalık yapmak kesinlikle yasaktır.</p>
  <p><strong>C. Kişisel Verilerin İfşası (Doxxing):</strong> Diğer kullanıcıların kişisel bilgilerini izinsiz paylaşmak yasaktır.</p>
  <p><strong>D. Şiddet ve Zarar Teşviki:</strong> Şiddet eylemlerini yücelten, kendine zarar vermeyi veya intiharı özendiren içerikler barındırılamaz.</p>
</div>`
      },
      {
        id: 'guide-3',
        title: '3. İÇERİK STANDARTLARI VE KATEGORİZASYON',
        content: `<div class="space-y-4">
  <p><strong>+18 ve Hassas İçerik Politikası:</strong> Aşırı müstehcenlik ve pornografi kesinlikle yasaktır. Kurgusal hikaye gereği şiddet veya tetikleyici unsurlar içeren eserler yazar tarafından mutlaka "+18 / Hassas İçerik" olarak işaretlenmelidir.</p>
  <p><strong>Telif ve İntihal:</strong> Başka platformlardan kopyalanan içeriklerin izinsiz paylaşımı yasaktır.</p>
</div>`
      },
      {
        id: 'guide-4',
        title: '4. TOPLULUK ETKİLEŞİMİ VE ELEŞTİRİ ETİĞİ',
        content: `<div class="space-y-4">
  <p><strong>Yapıcı Eleştiri:</strong> Eleştiriler yapıcı, geliştirici ve edebi üsluba uygun olmalıdır.</p>
  <p><strong>Yıkıcı Yorumlar:</strong> Yazarlarla alay eden, heves kıran, kaba veya saldırgan yorumlar doğrudan silinir.</p>
</div>`
      },
      {
        id: 'guide-5',
        title: '5. SPAM VE REKLAM POLİTİKASI',
        content: `<ul class="space-y-3 list-disc list-inside ml-4">
  <li>Sırf popülarite kazanmak amacıyla aynı yorumu tekrarlamak (spam) yasaktır.</li>
  <li>Yazılı izin olmaksızın ticari reklam veya promosyon yapmak yasaktır.</li>
  <li>Sahte hesaplarla etkileşim manipülasyonu yapmak yasaktır.</li>
</ul>`
      },
      {
        id: 'guide-6',
        title: '6. MODERASYON VE YAPTIRIMLAR',
        content: `<div class="space-y-4">
  <p><strong>İçerik Kaldırma ve Uyarı (Strike 1):</strong> İhlal yapan içerik kaldırılır ve kullanıcı uyarılır.</p>
  <p><strong>Geçici Askıya Alma (Strike 2):</strong> Tekrarında hesap 7 ila 30 gün askıya alınır.</p>
  <p><strong>Kalıcı Uzaklaştırma (Strike 3):</strong> Üçüncü ihlalde hesap tamamen ve kalıcı olarak kapatılır.</p>
</div>`
      },
      {
        id: 'guide-7',
        title: '7. İHLAL BİLDİRİMİ (NASIL RAPORLANIR?)',
        content: `<p class="mb-4">Kurallara aykırı bir durum gördüğünüzde her içerikteki "Rapor Et" butonunu kullanabilir veya <a href="mailto:abuse@readixon.com" class="text-primary hover:underline">abuse@readixon.com</a> adresine e-posta gönderebilirsiniz.</p>`
      }
    ]
  }
};

/**
 * Belirtilen yasal sözleşmeyi Firestore'dan getirir.
 * Eğer Firestore'da henüz kayıt yoksa varsayılan hazır şablonu döner.
 */
export async function getLegalDocument(type: LegalDocType): Promise<LegalDocument> {
  try {
    const docRef = doc(db, LEGAL_COLLECTION, type);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_LEGAL_DOCS[type],
        ...data,
        id: type,
      } as LegalDocument;
    }
  } catch (error) {
    console.warn(`[getLegalDocument] Firestore'dan çekilemedi (${type}), varsayılan kullanılıyor:`, error);
  }

  return DEFAULT_LEGAL_DOCS[type];
}

/**
 * Tüm yasal sözleşmeleri paralel olarak çeker.
 */
export async function getAllLegalDocuments(): Promise<Record<LegalDocType, LegalDocument>> {
  const types: LegalDocType[] = ['terms', 'privacy', 'copyright', 'guidelines'];
  const results = await Promise.all(types.map((t) => getLegalDocument(t)));

  return {
    terms: results[0],
    privacy: results[1],
    copyright: results[2],
    guidelines: results[3],
  };
}

/**
 * Yasal sözleşmeyi Firestore'a kaydeder / günceller.
 */
export async function saveLegalDocument(
  docData: LegalDocument,
  adminUser?: { uid: string; email?: string }
): Promise<void> {
  const docRef = doc(db, LEGAL_COLLECTION, docData.id);

  const payload: any = {
    id: docData.id,
    title: docData.title || '',
    description: docData.description || '',
    effectiveDate: docData.effectiveDate || '',
    version: docData.version || 'v1.0',
    leadText: docData.leadText || '',
    sections: (docData.sections || []).map((sec, idx) => ({
      id: sec.id || `${docData.id}-${idx + 1}`,
      title: sec.title || '',
      content: sec.content || '',
    })),
    rawContent: docData.rawContent || '',
    isActive: docData.isActive ?? true,
    updatedAt: serverTimestamp(),
    updatedBy: adminUser?.uid || 'admin',
    updatedByEmail: adminUser?.email || '',
  };

  await setDoc(docRef, payload, { merge: true });
}

/**
 * İlgili sözleşmenin varsayılan fabrika ayarlarındaki orijinal kopyasını döndürür.
 */
export function getDefaultLegalDocument(type: LegalDocType): LegalDocument {
  return JSON.parse(JSON.stringify(DEFAULT_LEGAL_DOCS[type]));
}
