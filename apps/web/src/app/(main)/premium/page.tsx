import React from 'react';
import { Metadata } from 'next';
import { Crown, CheckCircle2, ShieldCheck, Palette, Users } from 'lucide-react';
import { Typography, Button } from '@readixon/ui';
import PricingSection from './PricingSection';
import RxPointsSection from './RxPointsSection';

export const metadata: Metadata = {
  title: 'Premium - Readixon',
  description: 'Readixon Premium ile hikaye deneyiminizi en üst seviyeye taşıyın. Sınırsız özellikler ve ayrıcalıklar sizi bekliyor.',
};

export default function PremiumPage() {
  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full pb-20">
      {/* Standard Header */}
      <div className="mb-12">
        <Typography variant="h1" className="font-bold tracking-tight mb-2 text-text flex items-center gap-2">
          <Crown className="text-yellow-500" size={32} />
          Premium
        </Typography>
        <Typography variant="body" className="text-muted">
          Hikaye deneyiminizi sınırların ötesine taşıyın
        </Typography>
      </div>

      {/* Hero Section */}
      <section className="relative w-full py-16 flex flex-col justify-center items-center text-center px-6 overflow-hidden rounded-3xl bg-card border border-border/50 mb-16 shadow-2xl shadow-primary/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Crown size={16} />
          <span className="text-sm font-bold tracking-wider uppercase">Premium Ayrıcalıkları</span>
        </div>

        <Typography variant="h1" className="text-4xl md:text-6xl font-extrabold max-w-4xl mb-6 text-text animate-in fade-in slide-in-from-bottom-6 duration-700">
          Hikaye Deneyiminizi Sınırların Ötesine Taşıyın
        </Typography>

        <Typography variant="body" className="text-muted text-lg md:text-xl max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Readixon Premium ile okuma ve yazma serüveninize yepyeni boyutlar katın. Özel temalar, derinlikli karakter profilleri ve çok daha fazlası.
        </Typography>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <FeatureCard 
          icon={<Users size={32} className="text-primary" />}
          title="Karakter Defteri"
          description="Sadece Premium kullanıcılara özel karakter profillerine erişin ve hikayenin gizli detaylarını keşfedin."
          gradient="from-primary/10 to-transparent"
        />
        <FeatureCard 
          icon={<Palette size={32} className="text-primary" />}
          title="Premium Temalar"
          description="Okuma deneyiminizi tamamen kişiselleştirebileceğiniz Premium Minimal ve diğer özel temalara sahip olun."
          gradient="from-primary/10 to-transparent"
        />
        <FeatureCard 
          icon={<ShieldCheck size={32} className="text-primary" />}
          title="Reklamsız Deneyim"
          description="Hiçbir kesinti olmadan, tamamen hikayeye odaklanacağınız, pürüzsüz ve reklamsız bir okuma keyfi."
          gradient="from-primary/10 to-transparent"
        />
      </section>

      <PricingSection />
      
      <RxPointsSection />

      {/* FAQ or Footer CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Typography variant="h3" className="text-2xl font-bold mb-4">Aklınıza Takılan Bir Şey mi Var?</Typography>
        <Typography variant="body" className="text-muted mb-8">Destek ekibimiz tüm sorularınız için 7/24 yanınızda.</Typography>
        <Button variant="outline" className="rounded-full px-8 py-2">
          İletişime Geç
        </Button>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode, title: string, description: string, gradient: string }) {
  return (
    <div className={`flex flex-col p-6 rounded-3xl bg-card border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="mb-4">
        {icon}
      </div>
      <Typography variant="h4" className="text-lg font-bold mb-2">{title}</Typography>
      <Typography variant="body" className="text-muted text-sm leading-relaxed">{description}</Typography>
    </div>
  );
}
