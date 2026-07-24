import React from 'react';
import { Metadata } from 'next';
import { Sparkles, MessageCircle, Quote, TrendingUp, Users, Swords, Zap, Heart, Shield, BookOpen, LayoutDashboard, Wand2, Award, FileText, AlertCircle, Book, LifeBuoy, Building2, Briefcase, MapPin, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';

export const metadata: Metadata = {
  title: 'Hakkımızda - Readixon V1',
  description: 'Readixon: Okuma deneyimini yeniden tanımlayan, yazarlarla etkileşime geçebileceğiniz, hikayelere yön verebileceğiniz yeni nesil hikaye platformu.',
  keywords: ['readixon nedir', 'yeni nesil hikaye platformu', 'rpg kitap okuma', 'canlı okuma', 'yazar etkileşimi', 'edebi arena'],
  openGraph: {
    title: 'Hakkımızda - Readixon V1 Devrimi',
    description: 'Klasik wattpad alternatiflerini unutun. Readix, Arena ve RPG karakter sistemiyle okuma deneyimini oyunlaştıran yeni nesil edebiyat ekosistemi.',
    url: 'https://readixon.com/about',
  },
  twitter: {
    title: 'Readixon V1 - Okuma Deneyimi Yeniden Tanımlanıyor',
    description: 'Yazarlarla etkileşime geç, hikayeye yön ver, karakterlerin istatistiklerini takip et.',
    card: 'summary_large_image',
  }
};

export default function AboutPage() {
  const footerLinks = [
    { title: 'Kullanım Koşulları', href: '/terms', icon: FileText },
    { title: 'Gizlilik Politikası', href: '/privacy', icon: Shield },
    { title: 'Topluluk Kuralları', href: '/guidelines', icon: Book },
    { title: 'Telif Hakkı', href: '/copyright', icon: AlertCircle },
    { title: 'Mesafeli Satış', href: '/terms/mesafeli-satis', icon: FileText },
    { title: 'Ön Bilgilendirme', href: '/terms/on-bilgilendirme', icon: FileText },
    { title: 'İptal ve İade', href: '/terms/iptal-iade', icon: AlertCircle },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-background overflow-x-hidden pb-20">

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[70vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
            <Sparkles size={16} />
            <span className="text-sm font-bold tracking-widest uppercase">Readixon V1 Yayında</span>
          </div>

          <Typography variant="h1" className="text-5xl md:text-7xl font-black text-text leading-tight mb-6 tracking-tight">
            Okuma Deneyimi <br />
            <span className="text-primary">
              Yeniden Tanımlandı
            </span>
          </Typography>

          <Typography variant="body" className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed mb-10">
            Sadece bir okur olmayın. Kurgulara yön verin, karakterlerin istatistiklerini keşfedin, alıntılarla gündem yaratın ve yeni nesil hikaye ekosisteminin bir parçası olun.
          </Typography>

          <Link href="/library" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-primary-foreground bg-primary rounded-full transition-all hover:bg-primary/90">
            <BookOpen size={20} className="mr-2" />
            Kütüphanene Git
          </Link>
        </div>
      </section>

      {/* 2. THE ECOSYSTEM (Social Reading & Interaction) */}
      <section className="relative w-full py-24 px-6 md:px-12 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Typography variant="h2" className="text-3xl md:text-5xl font-black text-text mb-4">Etkileşimli Okuma</Typography>
            <Typography variant="body" className="text-muted text-lg max-w-2xl mx-auto">Okurken hissettiklerinizi anında paylaşın. Readixon'da okur ve yazar arasındaki duvarlar yıkılıyor.</Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MessageCircle size={28} />}
              title="Satır İçi Yorumlar"
              desc="Bölüm sonunu beklemeden, kalbinize dokunan o spesifik satıra anında yorum bırakın. Diğer okurların tepkilerini gerçek zamanlı görün."
            />
            <FeatureCard
              icon={<Quote size={28} />}
              title="Kolay Alıntı Paylaşımı"
              desc="Etkilendiğiniz bir cümleyi seçin ve saniyeler içinde şık bir alıntı kartı olarak kaydedin. Kendi koleksiyonunuzu oluşturun."
            />
            <FeatureCard
              icon={<TrendingUp size={28} />}
              title="Readix (Sosyal Ağ)"
              desc="Kendi mini blogunuz! Okuduğunuz kitapları etiketleyin, yazarından bahsedin (mention) ve platformdaki diğer kitapkurtlarıyla etkileşime geçin."
            />
          </div>
        </div>
      </section>

      {/* 3. EDEBİ ARENA (Lobbies & Curveballs) */}
      <section className="relative w-full py-24 px-6 md:px-12 bg-black/20 border-y border-border z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-3xl md:text-5xl font-black text-text mb-4">Edebi Arena</Typography>
            <Typography variant="body" className="text-muted text-lg max-w-2xl mx-auto">Sıradan hikaye yazma süreçlerini unutun. Readixon Arenası'nda yazarlar zamanla, kurallarla ve birbirleriyle yarışıyor.</Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Yazar Lobisi */}
            <FeatureCard
              icon={<Users size={28} />}
              title="Yazar Lobisi & Kör Oylama"
              desc="Belirli bir tema, kısıtlı süre (örn: 120 dk) ve kelime limitiyle açılan rekabetçi odalar. Hikayeler tamamlandığında yazar isimleri gizlenir (Kör Oylama) ve okurlar Konu, Dil ve Yaratıcılık üzerinden oylama yapar."
            />

            {/* Sürpriz Kırılma (Curveball) */}
            <FeatureCard
              icon={<Zap size={28} />}
              title="Sürpriz Kırılma (Curveball)"
              desc="Lobi heyecanını ikiye katlayan özel mod! Sürenin son %25'ine girildiğinde aniden bir kural ekranda belirir: Tabu Kelime, Zorunlu Enjeksiyon veya Noktalama Boykotu. Krizi fırsata çeviren kazanır."
            />

            {/* Meydan Okumalar (Duels) */}
            <FeatureCard
              icon={<Swords size={28} />}
              title="Yazar Düelloları (Meydan Okuma)"
              desc="Yazarlar arenaya çıkıyor! Belirli bir konu ve kurallarla yazılan hikayeler teke tek çarpışıyor. Kazananı belirlemek ve büyük ödül havuzunu kimin alacağına karar vermek tamamen okurların (sizin) elinizde!"
            />
          </div>
        </div>
      </section>

      {/* 4. GELİŞMİŞ EDİTÖR (Editor, RPG, AI) */}
      <section className="relative w-full py-24 px-6 md:px-12 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-3xl md:text-5xl font-black text-text mb-4">Gelişmiş Editör ve Yapay Zeka</Typography>
            <Typography variant="body" className="text-muted text-lg max-w-2xl mx-auto">Düz bir metin belgesinden çok daha fazlası. Yazarlığı bir üst seviyeye taşıyan, kurgu sürecinizi kolaylaştıran modern araçlar.</Typography>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Blok Tabanlı Editör */}
            <FeatureCard
              icon={<LayoutDashboard size={28} />}
              title="Blok Tabanlı Akıllı Editör"
              desc="Hikayenizi dinamik bloklar halinde inşa edin. Word (.docx) veya Google Docs üzerinden yapacağınız kopyala-yapıştır aktarımları saniyeler içinde otomatik olarak bloklara dönüştürülür. İşiniz bittiğinde bölümünüzü anında ön izleyin."
            />

            {/* Karakter İstatistikleri (RPG) */}
            <FeatureCard
              icon={<Shield size={28} />}
              title="Karakter İstatistikleri (RPG)"
              desc="Platform genelinde hikayelerdeki karakterler sadece isimden ibaret değildir. Zeka, Güç, Çeviklik gibi RPG statlarına, özel yeteneklere ve Protagonist/Antagonist gibi rollere sahiptirler. Okurlar karakter evrimini sayısal olarak takip edebilir."
            />

            {/* AI Eklentisi */}
            <FeatureCard
              icon={<Sparkles size={28} />}
              title="Yapay Zeka (AI) Desteği"
              desc="Tıkandığınız yerde ilham periniz hazır. Gelişmiş AI asistanımızla karakter betimlemeleri üretebilir, cümlelerinizi zenginleştirebilir ve dilbilgisi hatalarını saniyeler içinde düzeltebilirsiniz (Günlük kota limitiyle)."
            />
          </div>

          {/* Kurgu Sihirbazı - Geniş Kart */}
          <div className="mt-6 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 hover:border-primary/40 transition-colors group">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Wand2 size={40} />
            </div>
            <div>
              <Typography variant="h3" className="text-2xl md:text-3xl font-black text-text mb-3">Kurgu Sihirbazı (Story Wizard)</Typography>
              <Typography variant="body" className="text-muted text-lg leading-relaxed">
                İlhamın ne zaman geleceği belli olmaz ama profesyonel yazarlar plan yapar! Hikayenizi yazmaya başlamadan önce <strong className="text-primary font-bold">Kurgu Sihirbazı</strong> ile açılış sahnesini (Kanca), karakter çatışmalarını, ters köşeleri (Plot Twist) ve çarpıcı finali şablonlar üzerinden kurgulayın. Üstelik yazım ekranındaki bölünmüş panel sayesinde (Split Screen) yazdığınız bölüme odaklanırken bir yandan da kurgu notlarınıza anında göz atabilirsiniz.
              </Typography>
            </div>
          </div>

          {/* Yazar Akademisi - Geniş Kart */}
          <div className="mt-6 w-full bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border border-secondary/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 hover:border-secondary/40 transition-colors group">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-secondary/20">
              <BookOpen size={40} />
            </div>
            <div>
              <Typography variant="h3" className="text-2xl md:text-3xl font-black text-text mb-3">Yazar Akademisi (Writer Academy)</Typography>
              <Typography variant="body" className="text-muted text-lg leading-relaxed">
                Yazarlarımızın başarısı, bizim başarımızdır. Amacımız sadece bir yayın platformu olmak değil, yazarlarımızın edebi yeteneklerini geliştirmelerine yardımcı olmaktır. Yeni başlayanlar için bölüm kurgulama rehberlerinden, ustalar için tempo ayarlama ve karakter derinliği sağlama tekniklerine kadar özenle hazırlanmış <strong className="text-secondary font-bold">Yazar Akademisi</strong> notlarına stüdyonuzdan anında erişebilirsiniz.
              </Typography>
            </div>
          </div>
          {/* Başarımlar ve Rozetler - Geniş Kart */}
          <div className="mt-6 w-full bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 hover:border-yellow-500/40 transition-colors group">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
              <Award size={40} />
            </div>
            <div>
              <Typography variant="h3" className="text-2xl md:text-3xl font-black text-text mb-3">Başarımlar ve Rozetler</Typography>
              <Typography variant="body" className="text-muted text-lg leading-relaxed">
                Okudukça ve yazdıkça gelişmeye hazır mısın? Readixon'daki her etkileşimin bir değeri var! Binlerce kelime yazarak <strong className="text-yellow-500 font-bold">Klavye Aşındıran</strong> rozetini kapabilir veya her gün okuyarak sadık bir okur olduğunu kanıtlayabilirsin. Kazandığın yeni rozetler, özel animasyonlarıyla anında bildirim olarak gelir ve profilindeki rozet koleksiyonunda sergilenir. Edebi yolculuğunu eğlenceli bir oyuna dönüştür!
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="relative w-full py-32 px-6 flex flex-col items-center justify-center z-10 text-center">
        <Typography variant="h2" className="text-4xl md:text-5xl font-black text-text mb-6">Maceraya Başlamaya Hazır Mısın?</Typography>
        <Typography variant="body" className="text-muted text-lg max-w-xl mb-10">
          Binlerce hikaye, aktif bir topluluk ve senin kararlarınla değişecek sonlar seni bekliyor.
        </Typography>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/feed" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full transition-colors hover:bg-primary/90">
            Keşfetmeye Başla
          </Link>
          <Link href="/readix" className="px-8 py-4 bg-card border border-border text-text font-bold rounded-full transition-colors hover:bg-muted">
            Readix Akışına Git
          </Link>
        </div>
      </section>

      {/* 5.5. SUPPORT BLOCK */}
      <section className="relative w-full py-16 px-6 flex flex-col items-center justify-center z-10 text-center border-t border-border/50 bg-blue-500/5">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
          <LifeBuoy size={32} />
        </div>
        <Typography variant="h3" className="text-2xl md:text-3xl font-black text-text mb-4">Yardıma mı İhtiyacın Var?</Typography>
        <Typography variant="body" className="text-muted text-lg max-w-xl mb-8">
          Aklına takılan bir soru mu var veya bir sorunla mı karşılaştın? Readixon destek ekibi her zaman yanında.
        </Typography>
        <Link href="/support" className="px-6 py-3 bg-blue-500/10 text-blue-500 font-bold rounded-full transition-colors hover:bg-blue-500/20 flex items-center gap-2">
          Destek Sayfasına Git
        </Link>
      </section>

      {/* 5.75. COMPANY & CONTACT BLOCK */}
      <section className="relative w-full py-16 px-6 z-10 bg-card border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Building2 size={32} />
            </div>
            <Typography variant="h2" className="text-3xl md:text-4xl font-black text-text mb-4">Şirket ve İletişim Bilgileri</Typography>
            <Typography variant="body" className="text-muted text-lg max-w-2xl mx-auto">
              Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi bünyesinde faaliyet gösteren platformumuz, yasalara ve BTK Yer Sağlayıcı mevzuatlarına tam uyumlu olarak hizmet vermektedir.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background rounded-3xl p-8 border border-border/50 shadow-sm">
              <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                <Briefcase className="text-primary" size={24} />
                Kurumsal Bilgiler
              </h3>
              <div className="space-y-4">
                <div>
                  <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">Ticari Unvan</Typography>
                  <Typography variant="body" className="font-medium text-text">Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi</Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">Mersis Numarası</Typography>
                  <Typography variant="body" className="font-medium text-text">0871128699600001</Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">Vergi Dairesi ve No</Typography>
                  <Typography variant="body" className="font-medium text-text">Pamukkale VD / 8711286996</Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">Yer Sağlayıcı Bildirimi</Typography>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                    <Shield size={14} /> BTK Onaylı Yer Sağlayıcı
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-3xl p-8 border border-border/50 shadow-sm">
              <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                <MapPin className="text-primary" size={24} />
                İletişim Adresleri
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-muted mt-1 shrink-0" size={18} />
                  <div>
                    <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">Şirket Adresi</Typography>
                    <Typography variant="body" className="font-medium text-text">AKKONAK MAH. 1814 SK. NO: 87 İÇ KAPI NO: 2 MERKEZEFENDİ / DENİZLİ</Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-muted mt-1 shrink-0" size={18} />
                  <div>
                    <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">E-posta</Typography>
                    <Typography variant="body" className="font-medium text-text">
                      <a href="mailto:support@readixon.com" className="hover:text-primary transition-colors">support@readixon.com</a>
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-muted mt-1 shrink-0" size={18} />
                  <div>
                    <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">KEP Adresi</Typography>
                    <Typography variant="body" className="font-medium text-text">turixon.turizm@hs01.kep.tr</Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-muted mt-1 shrink-0" size={18} />
                  <div>
                    <Typography variant="caption" className="text-muted/80 uppercase tracking-wider block mb-1">Telefon</Typography>
                    <Typography variant="body" className="font-medium text-text">
                      <a href="tel:[+905524634140]" className="hover:text-primary transition-colors">+905524634140</a>
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. POLICIES & LINKS */}
      <section className="relative w-full py-16 px-6 max-w-5xl mx-auto z-10 border-t border-border/50">
        <div className="flex flex-wrap justify-center gap-4">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group flex flex-col items-center justify-center gap-3 p-6 w-[160px] rounded-3xl bg-card/50 hover:bg-card border border-transparent hover:border-border/50 transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <link.icon size={24} />
              </div>
              <Typography variant="body" className="font-medium text-sm group-hover:text-primary transition-colors">{link.title}</Typography>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

// Helper Component for Feature Cards
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        {icon}
      </div>
      <Typography variant="h3" className="text-xl font-bold text-text mb-3">{title}</Typography>
      <Typography variant="body" className="text-muted leading-relaxed">{desc}</Typography>
    </div>
  );
}
