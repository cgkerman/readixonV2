import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Readixon',
  description: 'Readixon Kullanım Koşulları Sözleşmesi',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>
        
        <div className="bg-card rounded-2xl border border-border/50 p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            READIXON KULLANIM KOŞULLARI SÖZLEŞMESİ
          </h1>
          <p className="text-muted-foreground mb-10">Yürürlük Tarihi: 08.07.2026</p>

          <div className="space-y-8 text-foreground/80 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. TARAFLAR VE SÖZLEŞMENİN KABULÜ</h2>
              <p className="mb-4">
                Bu Kullanım Koşulları Sözleşmesi ("Sözleşme"), Denizli/Türkiye adresinde mukim ve platformun sahibi olan Turixon San. ve Tic. Ltd. Şti. ("Şirket") ile Readixon mobil uygulaması, web sitesi (readixon.com ve ilişkili tüm alt alan adları) ve platformun sunduğu tüm dijital hizmetler ("Platform") üzerinden hesap oluşturan, içerik paylaşan veya Platformu ziyaretçi sıfatıyla kullanan tüm gerçek kişiler ("Kullanıcı") arasında akdedilmiştir.
              </p>
              <p>
                Platforma kayıt olarak, giriş yaparak veya Platform servislerini herhangi bir şekilde kullanarak, bu Sözleşme’nin tüm maddelerini okuduğunuzu, içeriğini tamamen anladığınızı ve Sözleşme’de yer alan tüm şartlara kayıtsız şartsız bağlı kalacağınızı beyan ve taahhüt edersiniz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. TANIMLAR</h2>
              <ul className="space-y-3 list-disc list-inside">
                <li><strong className="text-foreground">Şirket:</strong> Turixon San. ve Tic. Ltd. Şti.'yi ifade eder.</li>
                <li><strong className="text-foreground">Platform:</strong> Readixon isimli mobil uygulamayı, web sitesini, sosyal ağ özelliklerini ve bunlara bağlı tüm hizmetleri ifade eder.</li>
                <li><strong className="text-foreground">Kullanıcı / Üye:</strong> Platform üzerinde hesap açmış veya hesabı olmaksızın Platformu kullanan tüm gerçek kişileri ifade eder.</li>
                <li><strong className="text-foreground">İçerik:</strong> Kullanıcılar tarafından Platformda yayınlanan, paylaşılan veya iletilen her türlü yazı, şiir, hikaye, deneme, eleştiri, yorum, profil resmi, görsel, ses kaydı ve diğer materyalleri ifade eder.</li>
                <li><strong className="text-foreground">Yer Sağlayıcı:</strong> 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun uyarınca, kullanıcıların ürettiği içerikleri barındıran sistemi sağlayan kişiyi ifade eder.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. KULLANICI UYGUNLUĞU VE YAŞ SINIRI</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Asgari Yaş Sınırı:</strong> Platformu kullanabilmek ve üyelik hesabı oluşturabilmek için en az 13 yaşında olmanız gerekmektedir.</p>
                <p><strong className="text-foreground">Velayet/Vesayet Onayı:</strong> 13 yaşını doldurmuş ancak 18 yaşından küçük (reşit olmayan) Kullanıcılar, Platforma üye olmadan ve içerik paylaşmadan önce ebeveynlerinin veya yasal vasilerinin bu Sözleşme’yi okuyup onayladığını taahhüt ederler. Ebeveyn veya vasi onayı olmaksızın yapılan üyeliklerin sorumluluğu Kullanıcıya ve velisine aittir.</p>
                <p><strong className="text-foreground">Yasal Ehliyet:</strong> Kullanıcı, kendi ülkesinin yasalarına göre sözleşme imzalama ve yasal olarak bağlanma ehliyetine sahip olduğunu kabul ve beyan eder.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. HESAP GÜVENLİĞİ VE KULLANICI YÜKÜMLÜLÜKLERİ</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Doğru Bilgi Beyanı:</strong> Hesap oluştururken verilen e-posta adresi, kullanıcı adı ve diğer profil bilgilerinin doğru, güncel ve eksiksiz olması zorunludur. Yanıltıcı veya başkasına ait bilgilerle hesap açılması yasaktır.</p>
                <p><strong className="text-foreground">Hesap Güvenliği ve Şifre:</strong> Kullanıcı, hesap şifresinin gizliliğini korumakla yükümlüdür. Şifrenin yetkisiz üçüncü şahıslar tarafından ele geçirilmesi veya hesaba izinsiz erişim sağlanması şüphesi halinde Kullanıcı, durumu derhal <a href="mailto:destek@readixon.com" className="text-primary hover:underline">destek@readixon.com</a> adresinden Şirket’e bildirmek zorundadır.</p>
                <p><strong className="text-foreground">Hesap Devri Yasağı:</strong> Üyelik hesapları kişiseldir; üçüncü şahıslara devredilemez, satılamaz veya kiraya verilemez. Hesaptan gerçekleştirilen tüm işlemler doğrudan ilgili Kullanıcıya atfedilir ve hukuki sorumluluk Kullanıcıya aittir.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. YER SAĞLAYICI SIFATI VE SORUMLULUK SINIRLARI</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Yer Sağlayıcı Beyanı:</strong> Şirket, 5651 sayılı Kanun uyarınca "Yer Sağlayıcı" konumundadır. Platformda Kullanıcılar tarafından oluşturulan, paylaşılan veya iletilen edebi eserlerin, yazıların, yorumların ve hiçbir içeriğin doğruluğunu, hukuka uygunluğunu, telif haklarına uygunluğunu veya ahlaki niteliğini önceden denetleme yükümlülüğü bulunmamaktadır.</p>
                <p><strong className="text-foreground">İçerik Sorumluluğu:</strong> Platformda yayınlanan her türlü içeriğin hukuki, cezai ve mali sorumluluğu tamamen ilgili içeriği üreten ve paylaşan Kullanıcıya aittir. Şirket, Kullanıcıların yasalara aykırı eylemlerinden veya paylaşımlarından ötürü üçüncü şahıslara karşı doğrudan veya dolaylı olarak sorumlu tutulamaz.</p>
                <p><strong className="text-foreground">Uyar-Kaldır Prensibi:</strong> Hak ihlali, telif ihlali veya yasadışı içerik bildirimleri alındığında, Şirket yasal mevzuata uygun olarak "Uyar-Kaldır" mekanizmasını işletir ve ihlal oluşturan içeriği makul bir sürede yayından kaldırır.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. FİKRİ MÜLKİYET VE İÇERİK LİSANS KOŞULLARI</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Eser Sahipliği ve Telif Hakları:</strong> Kullanıcı tarafından Platformda yayınlanan tüm orijinal yazı, şiir, hikaye ve diğer edebi eserlerin mülkiyeti ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) kapsamındaki tüm telif hakları münhasıran yazar olan Kullanıcıya ait kalmaya devam eder. Şirket, eserlerin telif haklarını üzerine almaz.</p>
                <p><strong className="text-foreground">Platforma Tanınan Lisans Hakkı:</strong> Kullanıcı, Platformda içerik yayınlayarak; Şirket’e bu içeriği Platformun işleyişini sağlamak, sunucularda saklamak, veri tabanlarında işlemek, diğer kullanıcılara görüntülemek, arama motorlarında indekslemek, sosyal medya hesaplarında Readixon'ın tanıtımı amacıyla paylaşmak ve teknik süreçlerin gerektirdiği şekilde kopyalamak üzere; dünya çapında, telifsiz (ücretsiz), münhasır olmayan, devredilebilir ve alt lisanslanabilir bir kullanım hakkı (lisans) vermiş olur. Bu lisans, Kullanıcı içeriği silene veya hesabını kapatana kadar geçerlidir.</p>
                <p><strong className="text-foreground">İntihal (Çalıntı Eser) ve Telif İhlali Yasağı:</strong> Kullanıcı, kendisinin üretmediği veya üzerinde yasal olarak paylaşım hakkına (lisansına/yetkisine) sahip olmadığı hiçbir eseri Platformda paylaşamaz. İntihal yaptığı tespit edilen veya telif hakkı ihlali ihbarı doğrulanarak hak sahibinin haklarını çiğneyen Kullanıcının ilgili içeriği derhal silinir, mükerrer ihlallerde hesabı tamamen kapatılır. Şirket'in bu durumdan dolayı uğrayabileceği her türlü zararı rücu etme hakkı saklıdır.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. TOPLULUK KURALLARI VE YASAKLI EYLEMLER</h2>
              <p className="mb-4">Kullanıcı, Platformu kullanırken aşağıdaki kurallara ve yasalara uymayı taahhüt eder. Aşağıdaki eylemlerin gerçekleştirilmesi Sözleşme'nin ağır ihlali sayılır:</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">Hukuka Aykırı ve Zararlı İçerik:</strong> Türkiye Cumhuriyeti yasalarına aykırı, nefret söylemi barındıran, ırkçı, ayrımcı, şiddeti teşvik eden, tehdit, taciz, hakaret içeren veya pornografik/müstehcen içeriklerin paylaşılması kesinlikle yasaktır.</p>
                <p><strong className="text-foreground">Kişisel Verilerin İhlali:</strong> Diğer kullanıcıların veya üçüncü şahısların izni olmaksızın kişisel verilerini (T.C. Kimlik No, telefon, adres vb.) paylaşmak ve özel hayatın gizliliğini ihlal etmek yasaktır.</p>
                <p><strong className="text-foreground">Siber Güvenlik İhlalleri:</strong> Platformun teknik altyapısına zarar verecek virüs, truva atı vb. zararlı yazılımlar yaymak; Platform verilerini web scraping, bot veya otomatik veri madenciliği araçlarıyla izinsiz toplamak; Platforma aşırı yük bindirecek (DDoS) saldırılar düzenlemek yasaktır.</p>
                <p><strong className="text-foreground">Spam ve Reklam:</strong> Platformun edebi ve sosyal yapısını bozacak şekilde tekrarlayan, alakasız içerikler (spam) üretmek ve Şirket'in yazılı izni olmaksızın ticari reklam, promosyon veya satış ortaklığı linkleri paylaşmak yasaktır.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. GELECEKTEKİ HİZMETLER VE ABONELİK MODELLERİ (RESERVASYON)</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Hizmet Değişiklikleri:</strong> Şirket, tamamen kendi takdirine bağlı olarak, Platformu geliştirmek amacıyla gelecekte ücretli üyelik modelleri, aylık/yıllık premium abonelikler, yazar destek/bahşiş sistemleri, ücretli hikaye erişimleri veya benzeri finansal mekanizmalar ekleme hakkını saklı tutar.</p>
                <p><strong className="text-foreground">Özel Şartlar:</strong> Bu tür ücretli/premium özellikler devreye alındığında, söz konusu finansal işlemler, gelir paylaşımları ve abonelik kuralları için ek sözleşmeler veya özel şartlar (Örn: Yazar Gelir Sözleşmesi, Ödeme Koşulları) yayınlanacaktır. Kullanıcılar bu hizmetlerden faydalanmak istediklerinde söz konusu yeni şartları ayrıca onaylamakla yükümlü olacaklardır.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. HESAP KISITLAMA VE FESİH</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Şirket Tarafından Fesih:</strong> Kullanıcı’nın bu Sözleşme’deki veya topluluk kurallarındaki herhangi bir maddeyi ihlal etmesi halinde Şirket; önceden bildirimde bulunmaksızın Kullanıcı'nın içeriğini kaldırma, hesabını geçici olarak askıya alma veya hesabı tamamen ve kalıcı olarak kapatma (fesih) hakkına sahiptir.</p>
                <p><strong className="text-foreground">Kullanıcı Tarafından Fesih:</strong> Kullanıcı, dilediği zaman Platform üzerindeki ayarlar bölümünden hesabını kapatarak veya <a href="mailto:destek@readixon.com" className="text-primary hover:underline">destek@readixon.com</a> adresine yazılı talepte bulunarak üyelik ilişkisini sonlandırabilir. Hesap kapatıldığında, Kullanıcı'nın profil bilgileri ve paylaştığı içerikler sistemden silinir (yasal saklama yükümlülükleri hariç).</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. SORUMLULUK SINIRLANDIRILMASI (LIMITATION OF LIABILITY)</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Hizmetin Mevcudiyeti:</strong> Platform, Kullanıcıya "olduğu gibi" (as-is) ve "mevcut olduğu sürece" (as-available) esasıyla sunulmaktadır. Şirket, Platformun kesintisiz, hatasız, virüssüz veya her an erişilebilir olacağına dair açık veya zımni hiçbir garanti vermemektedir.</p>
                <p><strong className="text-foreground">Veri Kaybı:</strong> Şirket, teknik aksaklıklar, siber saldırılar veya mücbir sebepler dolayısıyla meydana gelebilecek veri kayıplarından veya içeriklerin silinmesinden doğrudan sorumlu tutulamaz. Kullanıcıların kendi eserlerini ayrıca yedeklemeleri tavsiye edilir.</p>
                <p><strong className="text-foreground">Dolaylı Zararlar:</strong> Şirket, Platformun kullanımından veya kullanılamamasından doğan kar kaybı, prestij kaybı veya diğer dolaylı zararlardan hiçbir koşulda sorumlu değildir.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">11. SÖZLEŞME DEĞİŞİKLİKLERİ</h2>
              <p>Şirket, yasal mevzuata uyum sağlamak veya Platform modelini güncellemek amacıyla bu Sözleşme’yi dilediği zaman tek taraflı olarak revize edebilir. Sözleşme’nin güncel versiyonu Platform üzerinden yayınlandığı andan itibaren geçerlilik kazanır. Önemli değişiklikler Kullanıcıya e-posta veya Platform içi bildirim yoluyla duyurulacaktır. Değişikliklerin yürürlüğe girmesinden sonra Platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">12. YÜRÜRLÜKTEKİ HUKUK VE YETKİLİ MAHKEME</h2>
              <p>Bu Sözleşme’nin yorumlanmasında, uygulanmasında ve taraflar arasında çıkabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti Kanunları uygulanacaktır. Sözleşme'den kaynaklanan veya bu Sözleşme ile ilişkili olan tüm uyuşmazlıkların çözümünde Denizli Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">13. İLETİŞİM BİLGİLERİ</h2>
              <p className="mb-4">Bu Kullanım Koşulları ile ilgili sorularınız, geri bildirimleriniz veya telif hakkı ihlali bildirimleriniz için bizimle aşağıdaki kanallar üzerinden iletişime geçebilirsiniz:</p>
              <address className="not-italic space-y-2 border-l-4 border-primary/20 pl-4 py-2">
                <p><strong className="text-foreground">Şirket Unvanı:</strong> Turixon San. ve Tic. Ltd. Şti.</p>
                <p><strong className="text-foreground">Adres:</strong> Denizli, Türkiye</p>
                <p><strong className="text-foreground">E-posta:</strong> <a href="mailto:support@readixon.com" className="text-primary hover:underline">support@readixon.com</a></p>
              </address>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
