import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Topluluk Kuralları ve Etik Rehberi | Readixon',
  description: 'Readixon Topluluk Kuralları ve Etik Rehberi',
};

export default function CommunityGuidelinesPage() {
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
            READIXON TOPLULUK KURALLARI VE ETİK REHBERİ
          </h1>
          <p className="text-muted-foreground mb-10">Yürürlük Tarihi: 08.07.2026</p>

          <div className="space-y-8 text-foreground/80 leading-relaxed">
            
            <p>
              Readixon; kelimelerin gücüne inanan, özgün hikayeleri, şiirleri ve edebi fikirleri paylaşmak isteyen her seviyeden yazar ve okuru bir araya getiren canlı, dinamik ve saygılı bir topluluktur.
            </p>
            <p>
              Bu topluluğun bir parçası olan her kullanıcımız (yazar, okur veya sadece ziyaretçi), platformda yer aldığı süre boyunca bu kurallara uymayı taahhüt eder. Amacımız, herkesin yaratıcılığını özgürce ve güvenle sergileyebileceği, yapıcı eleştirilerle gelişebileceği dijital bir sığınak yaratmaktır.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. TEMEL DEĞERLERİMİZ</h2>
              <p className="mb-4">Readixon topluluğu üç temel sütun üzerine kuruludur:</p>
              <ul className="space-y-3 list-disc list-inside ml-4">
                <li><strong className="text-foreground">Saygı ve Nezaket:</strong> Her yazarın emeğine, her okurun fikrine ve her bireyin kimliğine saygı duyarız.</li>
                <li><strong className="text-foreground">Özgünlük:</strong> Kendi sesimizi ve hikayelerimizi yaratırız. Başkalarının emeğini çalmaz veya taklit etmeyiz.</li>
                <li><strong className="text-foreground">Gelişim ve Destek:</strong> Birbirimizi aşağı çekmek için değil, edebi anlamda daha ileriye taşımak için eleştirir ve destekleriz.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. KABUL EDİLEMEZ DAVRANIŞLAR (SIFIR TOLERANS)</h2>
              <p className="mb-4">Aşağıdaki davranışlardan herhangi birinin tespiti durumunda, Readixon moderasyon ekibi içeriği silme, hesabı askıya alma veya platformdan kalıcı olarak uzaklaştırma yetkisine sahiptir:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">A. Nefret Söylemi ve Ayrımcılık</h3>
                  <p>Irk, etnik köken, din, mezhep, cinsiyet, cinsel yönelim, yaş, engellilik durumu veya sosyo-ekonomik durum temelinde bireyleri veya grupları hedef gösteren, aşağılayan, düşmanlığa sevk eden veya nefret uyandıran hiçbir içeriğe (hikaye, şiir, yorum, profil resmi vb.) izin verilmez.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">B. Taciz ve Zorbalık (Bullying)</h3>
                  <p>Bir başka kullanıcıyı sistematik olarak hedef almak, tehdit etmek, aşağılamak, rızası dışında takip etmek (stalking) veya özel hayatının gizliliğini ihlal etmek kesinlikle yasaktır. Eleştiri edebi eser sınırları içinde kalmalıdır; yazarın şahsına yapılan saldırılar doğrudan zorbalık kapsamında değerlendirilir.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">C. Kişisel Verilerin İfşası (Doxxing)</h3>
                  <p>Diğer kullanıcıların veya üçüncü şahısların gerçek adını, soyadını, adresini, telefon numarasını, T.C. kimlik numarasını, özel fotoğraflarını veya diğer kişisel verilerini izinsiz olarak paylaşmak kesinlikle yasaktır.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">D. Şiddet, Kendine Zarar Verme ve İntiharın Teşviki</h3>
                  <p>Şiddet eylemlerini yücelten, kendine zarar vermeyi (kesme, yeme bozuklukları vb.) veya intiharı özendiren, detaylı şekilde yöntem gösteren içerikler platformda barındırılamaz. Kurgusal eserlerde bu temalar işleniyorsa, mutlaka "Hassas İçerik" uyarısı eklenmeli ve asla özendirici bir dil kullanılmamalıdır.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. İÇERİK STANDARTLARI VE KATEGORİZASYON</h2>
              <p className="mb-4">Readixon, 13 yaş ve üzeri her yaştan kullanıcıya açık bir platformdur. Bu nedenle içeriklerin sınıflandırılması ve sunumu konusunda hassas davranılması gerekmektedir:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">A. +18 ve Hassas İçerik Politikası</h3>
                  <ul className="space-y-3 list-disc list-inside ml-4">
                    <li><strong className="text-foreground">Aşırı Müstehcenlik ve Pornografi:</strong> Doğrudan pornografik amaçlı, cinsel eylemleri aşırı detaylı ve kaba şekilde tasvir eden içerikler kesinlikle yasaktır. Readixon bir yetişkin sitesi değildir.</li>
                    <li><strong className="text-foreground">Hassas Temalar:</strong> Kurgusal hikaye gereği şiddet, cinsellik, istismar, ağır dil veya tetikleyici unsurlar (tetikleyici uyarılar - trigger warnings) barındıran eserler, yazar tarafından mutlaka "+18 / Hassas İçerik" olarak işaretlenmelidir. Bu işaretleme, reşit olmayan okurları korumak için zorunludur.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">B. İntihal ve Telif Hakkı İhlali</h3>
                  <ul className="space-y-3 list-disc list-inside ml-4">
                    <li>Başka bir platformdan, kitaptan veya yazardan kopyalanan içeriklerin izin alınmadan paylaşılması yasaktır.</li>
                    <li>"Fan-fiction" (Hayran Kurgu) yazarken, orijinal telif haklarına ve karakter sahiplerine saygı gösterilmeli, eserin ticari olmayan bir hayran çalışması olduğu açıkça belirtilmelidir.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. TOPLULUK ETKİLEŞİMİ VE ELEŞTİRİ ETİĞİ</h2>
              <p className="mb-4">Readixon’ı değerli kılan en büyük unsur, yazarların okurlardan aldığı geri bildirimlerdir. Bu etkileşimi sağlıklı tutmak için:</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">Yapıcı Eleştiri:</strong> Bir eseri beğenmeyebilirsiniz. Bunu dile getirirken "Bu hikaye çok kötü, yazmayı bırakmalısın" yerine "Karakter analizini biraz daha derinleştirebilirsin, olay örgüsünde bazı mantık hataları var" şeklinde yapıcı, geliştirici ve edebi üsluba uygun geri bildirimler verin.</p>
                <p><strong className="text-foreground">Yıkıcı ve Alaycı Yorumlar:</strong> Yazarlarla alay eden, heves kıran, kaba, küfürlü veya saldırgan yorumlar doğrudan silinir ve tekrarlanması halinde yorum yazma yetkisi sınırlandırılır.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. SPAM VE REKLAM POLİTİKASI</h2>
              <p className="mb-4">Topluluk akışının kalitesini korumak amacıyla:</p>
              <ul className="space-y-3 list-disc list-inside ml-4">
                <li>Sırf popülarite kazanmak amacıyla aynı yorumu onlarca yazarın profiline veya hikayesine kopyalayıp yapıştırmak (spam) yasaktır.</li>
                <li>Şirketimizin yazılı izni olmaksızın, platform dışında yer alan ticari ürünlerin, markaların veya para kazandıran sistemlerin doğrudan reklamını, satışını veya promosyonunu yapmak yasaktır. (Ancak yazarların kendi sosyal medya hesaplarını veya basılı kitaplarının linklerini profillerinde paylaşmalarına izin verilir).</li>
                <li>Sahte hesaplar açarak kendi hikayelerine yapay olarak oy (beğeni), yorum veya okunma sayısı kazandırmaya çalışmak (etkileşim manipülasyonu) yasaktır.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. MODERASYON VE YAPTIRIMLAR</h2>
              <p className="mb-4">Kuralların ihlal edilmesi durumunda, Readixon moderasyon ekibi ihlalin büyüklüğüne ve kullanıcının geçmişine göre aşağıdaki adımları uygular:</p>
              <div className="space-y-4">
                <p><strong className="text-foreground">İçerik Kaldırma ve Uyarı (Strike 1):</strong> Kural ihlali yapan içerik (yorum veya hikaye) yayından kaldırılır ve kullanıcı sistem üzerinden resmi olarak uyarılır.</p>
                <p><strong className="text-foreground">Geçici Askıya Alma (Strike 2):</strong> İhlalin tekrarı durumunda kullanıcının hesabı 7 ila 30 gün boyunca askıya alınır. Bu sürede kullanıcı içerik paylaşamaz veya yorum yapamaz.</p>
                <p><strong className="text-foreground">Kalıcı Uzaklaştırma (Strike 3):</strong> Üçüncü ihlalde (veya ilk ihlal dahi olsa çok ağır suç unsuru barındıran durumlarda) kullanıcının hesabı tamamen ve kalıcı olarak kapatılır. Aynı kişinin yeni bir hesap açması engellenir.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. İHLAL BİLDİRİMİ (NASIL RAPORLANIR?)</h2>
              <p className="mb-4">Topluluğumuzu temiz tutmak hepimizin görevidir. Kurallara aykırı bir durum gördüğünüzde:</p>
              <ul className="space-y-3 list-disc list-inside ml-4 mb-4">
                <li>Her hikaye, bölüm ve yorumun yanında bulunan "Rapor Et" butonunu kullanabilirsiniz.</li>
                <li>Daha detaylı şikayetleriniz veya kanıtlarınız için <a href="mailto:abuse@readixon.com" className="text-primary hover:underline">abuse@readixon.com</a> adresine e-posta gönderebilirsiniz.</li>
              </ul>
              <p className="font-medium text-foreground">Unutmayın, Readixon hepimizin ortak edebi evidir. Evimizi temiz, saygın ve ilham verici tutalım.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
