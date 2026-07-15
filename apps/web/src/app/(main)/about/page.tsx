import React from 'react';
import { Metadata } from 'next';
import { Sparkles, MessageCircle, Quote, TrendingUp, Users, Swords, Zap, Heart, Shield, BookOpen, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';

export const metadata: Metadata = {
  title: 'Hakkımızda - Readixon V1',
  description: 'Readixon: Okuma deneyimini yeniden tanımlayan, yazarlarla etkileşime geçebileceğiniz, hikayelere yön verebileceğiniz yeni nesil hikaye platformu.',
};

export default function AboutPage() {
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
              title="Blok Tabanlı Yazım"
              desc="Hikayenizi tekdüze bir metin olarak değil; paragraflar, alıntı blokları, görseller ve ayraçlar (divider) gibi dinamik 'bloklar' halinde inşa edin. Bölüm sonlarına etkileşimli bloklar ekleyerek okurları yönlendirin."
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
