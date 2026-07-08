import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Telif Hakkı ve Fikri Mülkiyet Politikası | Readixon',
  description: 'Readixon Telif Hakkı ve Fikri Mülkiyet Politikası',
};

export default function CopyrightPolicyPage() {
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
            READIXON TELİF HAKKI VE FİKRİ MÜLKİYET POLİTİKASI
          </h1>
          <p className="text-muted-foreground mb-10">Yürürlük Tarihi: 08.07.2026</p>

          <div className="space-y-8 text-foreground/80 leading-relaxed">
            
            <p>
              Readixon platformu, yaratıcı yazarlığı, özgün edebi içerik üretimini ve fikirlerin özgürce paylaşımını destekleyen bir topluluktur. Bu doğrultuda, kullanıcılarımızın fikri mülkiyet haklarına ve telif haklarına azami düzeyde saygı gösteriyoruz.
            </p>
            <p>
              Bu Telif Hakkı ve Fikri Mülkiyet Politikası ("Politika"), Denizli/Türkiye adresinde mukim platform sahibi Turixon San. ve Tic. Ltd. Şti. ("Şirket") tarafından işletilen Readixon mobil uygulaması, web sitesi (readixon.com) ve tüm ilişkili hizmetler ("Platform") üzerinde paylaşılan içeriklerin telif haklarına ve bu hakların korunmasına ilişkin kuralları, lisanslama şartlarını ve ihlal durumunda uygulanacak "Uyar-Kaldır" prosedürünü düzenlemektedir.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. ESER SAHİPLİĞİ VE TELİF HAKLARININ KORUNMASI</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Hakların Saklı Tutulması:</strong> Kullanıcılar tarafından Platform üzerinde oluşturulan, yazılan, paylaşılan veya yüklenen tüm orijinal edebi eserler (şiir, hikaye, roman, deneme, eleştiri, makale vb.), görsel tasarımlar, kapak resimleri ve diğer tüm içeriklerin (topluca "Eser") mülkiyeti ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) ile ilgili uluslararası anlaşmalar kapsamındaki tüm fikri ve sınai mülkiyet hakları münhasıran ilgili Kullanıcıya (Yazara) aittir.</p>
                <p><strong className="text-foreground">Şirket Hak Talebi Sınırı:</strong> Şirket, Kullanıcılar tarafından üretilen ve Platforma yüklenen hiçbir Eser üzerinde mülkiyet hakkı iddia etmez. Readixon, eserlerin telif hakkını üzerine almaz ve üçüncü şahıslara yazardan izinsiz satamaz.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. PLATFORMA TANINAN KULLANIM LİSANSI (LİSANS ŞARTLARI)</h2>
              <p className="mb-4">Kullanıcı, ürettiği Eseri Platform üzerinde yayınlayarak, Şirket’e bu Eserin teknik olarak topluluğa sunulabilmesi ve Platformun işletilebilmesi için gerekli olan aşağıdaki hakları ve kullanım lisansını verdiğini kabul eder:</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">Lisansın Kapsamı:</strong> Kullanıcı, Platformda paylaştığı her türlü içerik için Şirket’e; bu içeriği saklama, barındırma (hosting), sunucularda kopyalama, teknik süreçlerin gerektirdiği şekilde formatlama, diğer kullanıcılara görüntüleme, arama motorlarında indekslenmesini sağlama, dağıtma, dijital mecralarda yayınlama ve Readixon'ın tanıtımı amacıyla (sosyal medya kanalları, bültenler vb.) kullanmak üzere; dünya çapında, telifsiz (ücretsiz), münhasır olmayan (non-exclusive), devredilebilir ve alt lisanslanabilir bir kullanım hakkı (lisans) vermiş olur.</p>
                <p><strong className="text-foreground">Lisansın Amacı:</strong> Bu lisans, tamamen Platformun işlevlerini yerine getirebilmesi, kullanıcı deneyiminin sağlanması ve Readixon markasının tanıtılması amacıyla sınırlıdır.</p>
                <p><strong className="text-foreground">Lisansın Süresi ve Sona Ermesi:</strong> Bu kullanım lisansı, Kullanıcı ilgili Eseri Platformdan sildiği veya hesabını tamamen kapattığı andan itibaren sona erer. Ancak;</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Veritabanı yedeklemelerinde (backup) yer alan teknik kayıtların silinmesi makul bir süre (teknik gereklilikler çerçevesinde) alabilir.</li>
                  <li>Diğer kullanıcıların kendi profillerine "paylaşma", "alıntılama" veya "kaydetme" özellikleri aracılığıyla dahil ettiği içerikler, orijinal içerik silinse dahi teknik sınırlar dahilinde saklanabilir.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. İNTİHAL VE TELİF HAKKI İHLALİ YASAĞI</h2>
              <p className="mb-4">Readixon, edebi hırsızlığa (intihal) karşı sıfır tolerans politikası uygulamaktadır.</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">Özgünlük Beyanı:</strong> Kullanıcı, Platformda yayınladığı tüm Eserlerin tamamen kendisine ait olduğunu veya bu eserleri yayınlamak için gerekli olan tüm yasal izinleri, lisansları ve yetkileri elinde bulundurduğunu taahhüt eder.</p>
                <p><strong className="text-foreground">Yasaklı Eylemler:</strong> Başka bir yazara, kitaba, web sitesine veya platforma ait olan şiir, hikaye, roman bölümü, çeviri eser veya diğer fikri mülkiyet unsurlarının, hak sahibinin yazılı izni olmaksızın kısmen veya tamamen kendisininmiş gibi ("intihal") ya da kaynak gösterilmeden paylaşılması kesinlikle yasaktır.</p>
                <p><strong className="text-foreground">Sorumluluk:</strong> Bu kuralın ihlal edilmesi halinde doğacak tüm hukuki, cezai ve mali sorumluluk tamamen ihlali gerçekleştiren Kullanıcıya aittir. Şirket'in bu ihlal sebebiyle ödemek zorunda kalabileceği her türlü tazminat veya idari para cezası rücuen Kullanıcıdan tahsil edilir.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. UYAR-KALDIR PROSEDÜRÜ (TELİF İHLALİ BİLDİRİMİ)</h2>
              <p className="mb-4">Telif haklarının ihlal edildiğini düşünen eser sahipleri veya yasal temsilcileri, 5651 sayılı Kanun ve FSEK Ek Madde 4 hükümleri uyarınca Şirketimize başvurarak ihlale konu içeriğin kaldırılmasını talep edebilirler.</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">A. İhbar Başvurusunda Bulunma Şartları</h3>
                  <p className="mb-3">Telif hakkı ihlali bildiriminin yasal olarak işleme konulabilmesi için aşağıdaki bilgileri içermesi zorunludur:</p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li><strong className="text-foreground">İmza:</strong> Hak sahibinin veya onun adına hareket etmeye yetkili kılınmış temsilcisinin ıslak imzası veya güvenli elektronik imzası (bildirim e-posta ile yapılıyorsa taranmış ıslak imzalı dilekçe veya resmi e-imza belgesi).</li>
                    <li><strong className="text-foreground">Hak Sahipliği Kanıtı:</strong> İhlal edildiği iddia edilen telif hakkı konusu eserin tescil belgesi, yayınlandığı basılı kitap/dergi bilgileri veya hak sahipliğini gösteren diğer inandırıcı deliller.</li>
                    <li><strong className="text-foreground">İhlal Eden İçeriğin Konumu:</strong> Platformda telif hakkını ihlal ettiği iddia edilen içeriğin tam internet adresi (URL linki) veya mobil uygulama üzerindeki tam konumu/ekran görüntüsü.</li>
                    <li><strong className="text-foreground">İletişim Bilgileri:</strong> Bildirimi yapan kişinin adı, soyadı, T.C. kimlik numarası (veya yabancı uyruklular için pasaport numarası), açık adresi, telefon numarası ve e-posta adresi.</li>
                    <li><strong className="text-foreground">Doğruluk Beyanı:</strong> Bildirimde yer alan bilgilerin doğru olduğunu ve yalan beyanda bulunulması halinde hukuki sorumluluğun kabul edildiğini belirten açık bir beyan yazısı.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">B. Bildirim Kanalları</h3>
                  <p className="mb-3">Yukarıdaki şartları taşıyan ihbar dilekçeleri aşağıdaki kanallardan birisi aracılığıyla Şirketimize ulaştırılmalıdır:</p>
                  <address className="not-italic space-y-2 border-l-4 border-primary/20 pl-4 py-2 ml-4">
                    <p><strong className="text-foreground">E-Posta:</strong> <a href="mailto:copyright@readixon.com" className="text-primary hover:underline">copyright@readixon.com</a> (Konu başlığına "Telif Hakkı İhlali Bildirimi" yazılmalıdır)</p>
                    <p><strong className="text-foreground">Posta Adresi:</strong> Turixon San. ve Tic. Ltd. Şti., Denizli, Türkiye</p>
                  </address>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">C. Şirket Tarafından Yapılacak İşlemler</h3>
                  <p className="mb-3">Eksiksiz ve usulüne uygun olarak iletilen telif ihlali ihbarları alındıktan sonra Şirket:</p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>İhlale konu içeriği en geç 24 ila 48 saat içerisinde geçici veya kalıcı olarak yayından kaldırır (erişimi engeller).</li>
                    <li>İçeriği yükleyen Kullanıcıya, içeriğin kaldırıldığını ve kaldırılma gerekçesini (ihbar sahibinin iddialarını) bildiren bir e-posta gönderir.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. KARŞI BİLDİRİM SÜRECİ</h2>
              <p className="mb-4">İçeriğinin haksız yere veya bir hata sonucu kaldırıldığını düşünen Kullanıcı, Şirketimize karşı bildirimde bulunarak içeriğin yeniden yayına alınmasını talep edebilir.</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">Karşı Bildirim Şartları:</strong> Karşı bildirim; Kullanıcının kimlik bilgilerini, kaldırılan içeriğin tam URL adresini, içeriğin kaldırılmasının hatalı veya yanlış teşhis sonucu olduğunu belirten yasal gerekçelerini ve imzasını içermelidir.</p>
                <p><strong className="text-foreground">Değerlendirme:</strong> Şirket, karşı bildirimi ihbarı yapan tarafa iletir. Hak sahibi taraf, karşı bildirimin kendisine iletilmesinden itibaren 10 iş günü içerisinde içeriği yükleyen Kullanıcıya karşı dava açtığını veya mahkemeden ihtiyati tedbir kararı aldığını Şirkete belgelemezse, Şirket kaldırılan içeriği tekrar yayına alabilir.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. TEKRARLAYAN İHLALCİLER POLİTİKASI (MÜKERRER İHLAL)</h2>
              <p className="mb-4">Readixon topluluğunun kalitesini ve yasal güvenliğini korumak amacıyla Şirket, telif haklarını tekrarlayan şekilde ihlal eden kullanıcılara karşı şu yaptırımları uygular:</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">Üç İhtar Kuralı (Three-Strikes):</strong> Platformda paylaştığı içeriklerden dolayı hakkında 3 (üç) kez haklı telif ihlali ihbarı alınan ve içerikleri kaldırılan Kullanıcının hesabı, başkaca bir uyarıya gerek kalmaksızın kalıcı olarak kapatılır ve Platforma yeniden üye olması engellenir.</p>
                <p><strong className="text-foreground">Mali Hakların Askıya Alınması:</strong> İleride devreye alınacak premium üyelik ve yazar gelir modelleri kapsamında, telif ihlali yaptığı kesinleşen yazarların platformdaki tüm gelir hakları iptal edilebilir, haksız kazanç sağlandığı tespit edilirse bu tutarlar hak sahibine iade edilmek üzere bloke edilebilir.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. YAPAY ZEKA VE VERİ MADENCİLİĞİ (AI KORUMASI)</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Yasaklama:</strong> Üçüncü taraf şahısların veya yapay zeka şirketlerinin, Readixon yazarlarının eserlerini yapay zeka modellerini (LLM) eğitmek amacıyla web scraping, veri madenciliği veya botlar aracılığıyla otomatik olarak çekmesi, kopyalaması ve işlemesi kesinlikle yasaktır.</p>
                <p><strong className="text-foreground">Teknik Koruma:</strong> Şirket, bu tür yetkisiz veri çekme işlemlerini engellemek için teknik altyapısında gerekli önlemleri (robots.txt sınırlamaları, IP engellemeleri vb.) almayı taahhüt eder.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. YÜRÜRLÜK VE DEĞİŞİKLİKLER</h2>
              <p>Bu Telif Hakkı Politikası, 08.07.2026 tarihinde yürürlüğe girmiştir. Şirket, bu politikayı dilediği zaman tek taraflı olarak güncelleme hakkına sahiptir. Yapılan güncellemeler Platform üzerinden yayınlandığı andan itibaren geçerlilik kazanır.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
