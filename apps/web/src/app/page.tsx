"use client";

import Link from "next/link";
import { Typography, Button, Card, Footer } from "@readixon/ui";
import { useAuthStore } from "@readixon/core";
import { Sparkles, Users, BookOpen, TrendingUp } from "lucide-react";

export default function Home() {
  const { firebaseUser, isInitialized, userProfile } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background items-center justify-center relative overflow-hidden">
      {/* Arka Plan Süslemeleri */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center gap-10 animate-fade-in-up">
        
        {/* Başlık Alanı */}
        <div className="space-y-4">
          <Typography variant="h1" className="text-text font-bold tracking-tight text-5xl md:text-6xl">
            {firebaseUser && userProfile ? (
              <>Hoşgeldin, <span className="text-primary">{userProfile.username}</span>!</>
            ) : (
              <>readixon'a <span className="text-primary">Hoş Geldiniz</span></>
            )}
          </Typography>
          
          <Typography variant="body" className="text-muted text-lg md:text-xl max-w-2xl mx-auto">
            Sınırları aşan hikayeler, derin etkileşimler ve yeni nesil yazarlık deneyimi.
          </Typography>
        </div>

        {/* Benzersiz Özellikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-6">
          <Card className="bg-card/40 backdrop-blur-md border-border/40 p-6 flex gap-4 items-start hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="h3" className="font-semibold">Özgür Yaratıcılık</Typography>
              <Typography variant="caption" className="text-muted/90 text-sm">Gelişmiş stüdyo araçlarıyla hikayeni sınır tanımadan yaz ve anında binlerce okurla paylaş.</Typography>
            </div>
          </Card>
          
          <Card className="bg-card/40 backdrop-blur-md border-border/40 p-6 flex gap-4 items-start hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Users size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="h3" className="font-semibold">Derin Etkileşim</Typography>
              <Typography variant="caption" className="text-muted/90 text-sm">Paragraf bazlı satır içi yorumlar ve tartışmalarla yazar-okur arasındaki duvarları tamamen kaldırın.</Typography>
            </div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/40 p-6 flex gap-4 items-start hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="h3" className="font-semibold">Readix Formatı</Typography>
              <Typography variant="caption" className="text-muted/90 text-sm">Sadece kitap değil, anlık duygu ve düşüncelerinizi mikro blog tarzında paylaşarak kitlenizle bağ kurun.</Typography>
            </div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/40 p-6 flex gap-4 items-start hover:border-green-500/30 transition-colors">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500">
              <TrendingUp size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Typography variant="h3" className="font-semibold">Sınırsız Keşif</Typography>
              <Typography variant="caption" className="text-muted/90 text-sm">Sana özel akıllı öneriler, trendler ve en çok okunan başyapıtlarla dolu zengin kütüphanede kaybol.</Typography>
            </div>
          </Card>
        </div>

        {/* Aksiyon Alanı */}
        <div className="mt-8 w-full max-w-sm flex flex-col gap-4">
          {firebaseUser ? (
            <Link href="/feed" className="w-full">
              <Button variant="primary" className="w-full h-14 text-lg font-bold shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-1 rounded-2xl">
                Keşfetmeye Başla
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <Link href="/register" className="w-full">
                <Button variant="primary" className="w-full h-14 text-lg font-bold shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-1 rounded-2xl">
                  Kayıt Ol & Keşfet
                </Button>
              </Link>
              <Link href="/login" className="w-full text-center group">
                <Typography variant="caption" className="text-muted group-hover:text-primary transition-colors cursor-pointer text-sm font-medium">
                  Zaten hesabın var mı? Giriş yap.
                </Typography>
              </Link>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}
