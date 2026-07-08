import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | Readixon',
  description: 'Readixon Gizlilik Politikası ve KVKK Aydınlatma Metni',
};

export default function PrivacyPolicyPage() {
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
            READIXON GİZLİLİK POLİTİKASI VE KVKK AYDINLATMA METNİ
          </h1>
          <p className="text-muted-foreground mb-10">Yürürlük Tarihi: 08.07.2026</p>

          <div className="space-y-8 text-foreground/80 leading-relaxed">
            
            <p>
              Denizli/Türkiye adresinde mukim veri sorumlusu Turixon San. ve Tic. Ltd. Şti. ("Şirket" veya "Readixon") olarak; Readixon mobil uygulaması, web sitesi (readixon.com) ve tüm ilişkili hizmetler ("Platform") üzerinden bizimle paylaştığınız kişisel verilerinizin güvenliğine ve gizliliğine büyük önem veriyoruz.
            </p>
            <p>
              Bu Gizlilik Politikası ve KVKK Aydınlatma Metni ("Politika"); 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK"), 5651 sayılı Kanun ve ilgili yasal mevzuata uygun olarak, platformumuzu kullanan yazar, okur ve ziyaretçilerin ("Kullanıcı") kişisel verilerinin toplanma yöntemlerini, işlenme amaçlarını, hukuki sebeplerini, üçüncü kişilere aktarılma şartlarını ve veri sahiplerinin haklarını açıklamaktadır.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. VERİ SORUMLUSUNUN KİMLİĞİ</h2>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-foreground">Veri Sorumlusu:</strong> Turixon San. ve Tic. Ltd. Şti.</li>
                <li><strong className="text-foreground">Adres:</strong> Denizli, Türkiye</li>
                <li><strong className="text-foreground">E-Posta Adresi:</strong> <a href="mailto:kvkk@readixon.com" className="text-primary hover:underline">kvkk@readixon.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. İŞLENEN KİŞİSEL VERİ KATEGORİLERİ</h2>
              <p className="mb-4">Readixon’a üye olurken, içerik üretirken, okuma yaparken veya platformu ziyaret ederken doğrudan veya dolaylı olarak aşağıdaki kişisel verileriniz işlenmektedir:</p>
              <ul className="space-y-3 list-disc list-inside ml-4">
                <li><strong className="text-foreground">Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı, profil ismi, (gelecekte yazar ödemeleri için kimlik doğrulaması gerektiği takdirde T.C. kimlik numarası veya pasaport bilgileri).</li>
                <li><strong className="text-foreground">İletişim Bilgileri:</strong> E-posta adresi, telefon numarası (varsa).</li>
                <li><strong className="text-foreground">Kullanıcı İşlem Bilgileri:</strong> Paylaşılan hikayeler, şiirler, yorumlar, beğeni (oy) tercihleri, takip edilen yazarlar, okuma listeleri, okuma süreleri, platform içi mesajlaşmalar ve profil resmi.</li>
                <li><strong className="text-foreground">İşlem Güvenliği Bilgileri (Log Bilgileri):</strong> IP adresi, port bilgileri, cihaza ait benzersiz tanımlayıcılar (UUID), işletim sistemi, tarayıcı tipi, platforma giriş-çıkış tarih ve saatleri, trafik verileri (5651 sayılı Kanun kapsamındaki sistem günlükleri/loglar).</li>
                <li><strong className="text-foreground">Finansal Bilgiler (Gelecekteki Premium Model Altyapısı):</strong> İleride devreye alınacak premium üyelikler veya yazar hakediş ödemeleri kapsamında; banka IBAN bilgisi, fatura adresi, ödeme geçmişi ve işlem referans numaraları. (Not: Kredi kartı şifresi veya tam kart numarası gibi kritik finansal verileriniz doğrudan lisanslı ödeme kuruluşu tarafından işlenir, Readixon sunucularında saklanmaz).</li>
                <li><strong className="text-foreground">Pazarlama ve İletişim Tercihleri:</strong> Bülten abonelik tercihleri, push bildirim (bildirim) izinleri, anket ve geribildirim yanıtları.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI VE HUKUKİ SEBEPLERİ</h2>
              <p className="mb-4">Kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen yasal şartlar çerçevesinde aşağıdaki amaçlarla ve hukuki sebeplerle işlenmektedir:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">A. Bir Sözleşmenin Kurulması veya İfasıyla Doğrudan Doğruya İlgili Olması Hukuki Sebebine Dayalı Olarak:</h3>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Kullanıcı hesabının oluşturulması, doğrulanması ve yönetilmesi,</li>
                    <li>Kullanıcıya platform özelliklerinin (yazma, okuma, yorum yapma, etkileşim) sunulması,</li>
                    <li>Platform içi abonelik, premium üyelik ve yazar gelir modelleri (gelecekteki finansal süreçler) kapsamındaki işlemlerin yürütülmesi,</li>
                    <li>Kullanıcıların destek taleplerinin, şikayetlerinin ve soru işaretlerinin çözümlenmesi.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">B. Veri Sorumlusunun Hukuki Yükümlülüğünü Yerine Getirebilmesi Hukuki Sebebine Dayalı Olarak:</h3>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Kanunu uyarınca trafik verilerinin (log kayıtlarının) en az 2 yıl boyunca saklanması zorunluluğu,</li>
                    <li>Bilgi güvenliği süreçlerinin yürütülmesi ve siber saldırıların tespiti/önlenmesi,</li>
                    <li>Resmi kurum ve kuruluşlardan (mahkemeler, savcılıklar, emniyet birimleri vb.) gelen yasal bilgi-belge taleplerinin karşılanması.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">C. Veri Sorumlusunun Meşru Menfaatleri İçin Veri İşlemenin Zorunlu Olması Hukuki Sebebine Dayalı Olarak:</h3>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Readixon algoritmalarının iyileştirilerek kullanıcılara ilgi duyabilecekleri edebi türler ve yazarların önerilmesi (kişiselleştirme),</li>
                    <li>Platformun performans analizleri, hata tespitleri (crash logs) ve kullanıcı deneyiminin (UX) geliştirilmesi,</li>
                    <li>Hak ihlali, telif hakkı ihlali (intihal) ve topluluk kuralları ihlallerinin tespiti ve moderasyon süreçlerinin işletilmesi.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">D. Açık Rızanızın Bulunması Hukuki Sebebine Dayalı Olarak:</h3>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Yeni özellikler, haftalık edebi bültenler, yazarlık etkinlikleri ve kişiselleştirilmiş pazarlama kampanyaları hakkında bilgilendirme e-postaları gönderilmesi,</li>
                    <li>İsteğe bağlı olarak katıldığınız anketler ve pazar analizlerinin yürütülmesi.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. KİŞİSEL VERİLERİN AKTARILMASI (KİMLERLE PAYLAŞILIR?)</h2>
              <p className="mb-4">Readixon, kişisel verilerinizi üçüncü kişilere satmaz veya ticaretini yapmaz. Ancak platformun teknik olarak işleyebilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla verileriniz aşağıdaki taraflara aktarılabilmektedir:</p>
              <ul className="space-y-3 list-disc list-inside ml-4">
                <li><strong className="text-foreground">Altyapı ve Bulut Hizmet Sağlayıcıları:</strong> Platformun barındırılması (hosting), veritabanı yönetimi ve bulut operasyonları için çalışılan güvenilir iş ortaklarına (Örn: Google Firebase, AWS vb.) aktarılmaktadır. Bu hizmetlerin sunucuları yurt dışında bulunabileceğinden, aktarım işlemi KVKK'nın güncel yurtdışına veri aktarım kurallarına (standart sözleşme hükümleri veya açık rıza) uygun olarak gerçekleştirilir.</li>
                <li><strong className="text-foreground">Ödeme Hizmet Sağlayıcıları (Gelecekte):</strong> Premium abonelik ödemeleri veya yazarlara yapılacak para transferleri için BDDK lisanslı ödeme kuruluşlarına (Örn: iyzico, PayTR vb.) gerekli finansal işlem verileri aktarılır.</li>
                <li><strong className="text-foreground">Yetkili Kamu Kurum ve Kuruluşları:</strong> Yasal bir yükümlülük kapsamında veya adli/idari soruşturmalar doğrultusunda talep edilmesi halinde mahkemeler, savcılıklar, emniyet müdürlükleri ve Bilgi Teknolojileri ve İletişim Kurumu (BTK) ile kanuni sınırlar çerçevesinde paylaşılır.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. KİŞİSEL VERİ TOPLAMA YÖNTEMLERİ</h2>
              <p className="mb-4">Kişisel verileriniz, tamamen dijital ortamda:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Platforma kayıt olurken doldurduğunuz formlar,</li>
                <li>Profilinizi güncellerken eklediğiniz bilgiler,</li>
                <li>Platformu kullanırken (hikaye paylaşırken, yorum yaparken, okurken) gerçekleştirdiğiniz otomatik işlemler,</li>
                <li>Çerezler (cookies) ve benzeri takip teknolojileri vasıtasıyla otomatik veya kısmen otomatik yöntemlerle toplanmaktadır.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. VERİ GÜVENLİĞİ VE SAKLAMA SÜRELERİ</h2>
              <div className="space-y-4">
                <p><strong className="text-foreground">Veri Güvenliği:</strong> Verileriniz, yetkisiz erişimlerin, veri kayıplarının veya hırsızlığın önlenmesi amacıyla modern endüstri standartlarında (SSL/TLS şifreleme, güvenlik duvarları, veri maskeleme ve erişim kısıtlamaları) korunmaktadır.</p>
                <div>
                  <strong className="text-foreground">Saklama Süreleri:</strong>
                  <ul className="space-y-2 list-disc list-inside ml-4 mt-2">
                    <li>Üyelik verileriniz ve ürettiğiniz içerikler, siz hesabınızı kapatana veya silene kadar platform üzerinde saklanır.</li>
                    <li>Sistem günlükleri (IP logları) 5651 sayılı Kanun uyarınca yasal olarak 2 yıl boyunca saklanmak zorundadır ve bu sürenin sonunda sistemden otomatik olarak temizlenir.</li>
                    <li>Mali ve fatura kayıtları (ilerideki abonelik işlemlerinde) Türk Ticaret Kanunu ve Vergi Usul Kanunu uyarınca 10 yıl boyunca saklanır.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. VERİ SAHİBİNİN (KULLANICININ) KVKK MADDE 11 KAPSAMINDAKİ HAKLARI</h2>
              <p className="mb-4">Kişisel veri sahibi olarak, KVKK’nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme,</li>
                <li>Düzeltme, silme ve yok edilme işlemlerinin, verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
                <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. BAŞVURU YÖNTEMİ VE İLETİŞİM</h2>
              <p className="mb-4">KVKK kapsamındaki haklarınızı kullanmak ve kişisel verilerinize ilişkin taleplerinizi iletmek için başvurularınızı:</p>
              <ul className="space-y-2 list-disc list-inside ml-4 mb-4">
                <li><strong className="text-foreground">E-Posta Yoluyla:</strong> Sistemimizde kayıtlı e-posta adresinizi kullanarak doğrudan <a href="mailto:kvkk@readixon.com" className="text-primary hover:underline">kvkk@readixon.com</a> adresine yazılı beyan göndererek,</li>
                <li><strong className="text-foreground">Yazılı Olarak:</strong> "Turixon San. ve Tic. Ltd. Şti. - Denizli/Türkiye" adresine ıslak imzalı bir dilekçe ile fiziki posta yoluyla ulaştırabilirsiniz.</li>
              </ul>
              <p>Başvurunuzda adınızın, soyadınızın, T.C. kimlik numaranızın (yabancılar için pasaport numarasının), tebligata esas yerleşim yeri veya iş yeri adresinizin ve talebinizin açıkça yer alması yasal zorunluluktur. Talebiniz niteliğine göre en kısa sürede ve en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılacaktır.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. ÇEREZLER (COOKIES) HAKKINDA KISA BİLGİLENDİRME</h2>
              <p>Readixon, oturumunuzu açık tutmak, platform güvenliğini sağlamak ve tercihlerinizi hatırlamak için zorunlu ve işlevsel çerezler kullanmaktadır. Platformu kullanmaya devam ederek bu çerezlerin cihazınıza yerleştirilmesini kabul etmiş olursunuz. Çerez tercihlerinizi tarayıcınızın veya cihazınızın ayarlarından dilediğiniz zaman değiştirebilirsiniz.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. DEĞİŞİKLİKLER VE GÜNCELLEMELER</h2>
              <p>Bu Politika, mevzuat değişikliklerine ve platformumuza eklenecek yeni özelliklere (örneğin premium abonelik altyapısının aktif edilmesi) uyum sağlamak amacıyla Turixon San. ve Tic. Ltd. Şti. tarafından dilediği zaman güncellenebilir. Güncel metin platformda yayınlandığı andan itibaren geçerli olacaktır.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
