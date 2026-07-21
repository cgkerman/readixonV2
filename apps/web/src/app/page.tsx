"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Typography, Button } from "@readixon/ui";
import { useAuthStore } from "@readixon/core";
import { Sparkles, Users, BookOpen, TrendingUp, MessageCircle, Feather, Compass } from "lucide-react";

export default function Home() {
  const { firebaseUser, isInitialized, userProfile } = useAuthStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Sadece desktop/tablet'te mouse hareketi olduğu için içerde hesaplama yapalım
    if (window.innerWidth < 768) return; 
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen w-full bg-background flex-col md:flex-row overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Sol Taraf - İçerik ve Aksiyon */}
      <div className="w-full md:w-1/2 shrink-0 flex flex-col justify-between px-8 md:px-12 lg:px-20 py-8 relative z-10 bg-card/30">

        {/* Üst Kısım: Marka Logosu */}
        <div className="flex items-center">
          <Image src="/brand-logo.png" alt="Readixon Logo" width={80} height={80} className="object-contain" />
        </div>

        {/* Orta Kısım: Karşılama ve Özellikler */}
        <div className="flex flex-col justify-center flex-1 my-8 md:my-0 max-w-lg mx-auto w-full">
          <div className="mb-10 text-center md:text-left animate-fade-in-up">
            <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              {firebaseUser && userProfile ? (
                <>Hoşgeldin,<br /><span className="text-primary">{userProfile.username}</span>!</>
              ) : (
                <>Sınırları Aşan <br /><span className="text-primary">Hikayeler</span></>
              )}
            </Typography>
            <Typography variant="body" className="text-muted text-lg">
              Derin etkileşimler ve yeni nesil yazarlık deneyimi ile hikayeni milyonlarla paylaş.
            </Typography>
          </div>

          {/* Özellikler veya Kurucu Mesajı */}
          {firebaseUser ? (
            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="relative p-6 md:p-8 rounded-3xl bg-primary/5 border border-primary/10">
                <p style={{ color: '#000' }} className="text-lg italic leading-relaxed mb-6">
                  "Readixon’ı kurarken ki hayalim; kelimelerin gücüne inanan, hikayeleri derinlemesine paylaşan saf bir edebiyat topluluğu yaratmaktı. Burası sadece yazıp geçtiğin değil, satır aralarında gerçek bağlar kurduğun bir yuva. Hikayen ve fikirlerinle burayı zenginleştirdiğin için teşekkürler. İlhamın bol olsun."
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/20">
                    <Image src="/cagri.jpeg" alt="Çağrı Kerman" fill sizes="56px" className="object-cover" />
                  </div>
                  <div>
                    <p style={{ color: '#000' }} className="font-medium">Çağrı Kerman - Kurucu</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Sparkles size={24} />
                </div>
                <div className="flex flex-col justify-center h-12">
                  <Typography variant="h3" className="font-semibold text-lg">Özgür Yaratıcılık</Typography>
                  <Typography variant="caption" className="text-muted text-sm">Gelişmiş araçlarla hikayeni yaz ve anında paylaş.</Typography>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Users size={24} />
                </div>
                <div className="flex flex-col justify-center h-12">
                  <Typography variant="h3" className="font-semibold text-lg">Derin Etkileşim</Typography>
                  <Typography variant="caption" className="text-muted text-sm">Satır içi yorumlarla okurlarınla duvarları kaldır.</Typography>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <BookOpen size={24} />
                </div>
                <div className="flex flex-col justify-center h-12">
                  <Typography variant="h3" className="font-semibold text-lg">Readix Formatı</Typography>
                  <Typography variant="caption" className="text-muted text-sm">Mikro blog tarzında anlık duygu ve düşüncelerini paylaş.</Typography>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <TrendingUp size={24} />
                </div>
                <div className="flex flex-col justify-center h-12">
                  <Typography variant="h3" className="font-semibold text-lg">Sınırsız Keşif</Typography>
                  <Typography variant="caption" className="text-muted text-sm">Akıllı önerilerle dolu zengin kütüphanede kaybol.</Typography>
                </div>
              </div>
            </div>
          )}

          {/* Aksiyon Alanı */}
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {firebaseUser ? (
              <Link href="/feed" className="w-full block">
                <Button variant="primary" className="w-full h-14 text-lg font-bold shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-1 rounded-2xl">
                  Keşfetmeye Başla
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-4">
                <Link href="/register" className="w-full block">
                  <Button variant="primary" className="w-full h-14 text-lg font-bold shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-1 rounded-2xl">
                    Kayıt Ol & Keşfet
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-2 text-sm mt-2">
                  <Typography variant="caption" className="text-muted text-base">
                    Zaten hesabın var mı?
                  </Typography>
                  <Link href="/login">
                    <Typography variant="caption" className="text-primary font-semibold text-base hover:underline">
                      Giriş Yap
                    </Typography>
                  </Link>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Link href="/feed">
                    <Typography variant="caption" className="text-muted font-medium hover:text-primary transition-colors text-base hover:underline flex items-center gap-2">
                      <Compass size={16} /> Misafir Olarak Göz At
                    </Typography>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="text-center md:text-left mt-8">
          <Typography variant="caption" className="text-muted/60 text-sm">
            © {new Date().getFullYear()} readixon. Tüm hakları saklıdır.
          </Typography>
        </div>
      </div>

      {/* Sağ Taraf - Görsel Alan */}
      <div className="hidden md:flex w-full md:w-1/2 shrink-0 relative items-center justify-center bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 overflow-hidden">
        
        {/* Orta Kısım Geçiş Efekti (Keskinliği Yumuşatmak İçin) */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-32 lg:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-30 pointer-events-none" />

        {/* Zarif Degrade Işıklar */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Platformu Yansıtan Süslemeler - Parallax Etkili */}
        
        {/* Yorum / Etkileşim İkonu */}
        <div 
          className="absolute top-[20%] left-[20%] text-primary/20 dark:text-primary/30 transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) rotate(-12deg)` }}
        >
          <MessageCircle size={80} strokeWidth={1} />
        </div>

        {/* Yazarlık İkonu */}
        <div 
          className="absolute bottom-[25%] right-[15%] text-purple-500/20 dark:text-purple-500/30 transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) rotate(15deg)` }}
        >
          <Feather size={100} strokeWidth={1} />
        </div>

        {/* Minik Readix (Mikro Blog) Kartı Temsili */}
        <div 
          className="absolute top-[45%] left-[10%] w-48 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xl transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * -25}px) rotate(-5deg)` }}
        >
          <div className="flex gap-3 items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-2 w-16 bg-primary/30 rounded-full" />
              <div className="h-1.5 w-10 bg-primary/20 rounded-full" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-300/50 dark:bg-slate-700/50 rounded-full" />
            <div className="h-2 w-5/6 bg-slate-300/50 dark:bg-slate-700/50 rounded-full" />
            <div className="h-2 w-4/6 bg-slate-300/50 dark:bg-slate-700/50 rounded-full" />
          </div>
        </div>

        {/* Başka Bir Ufak Kart */}
        <div 
          className="absolute top-[15%] right-[25%] w-32 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-lg transition-transform duration-75 pointer-events-none"
          style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * 15}px) rotate(8deg)` }}
        >
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-purple-400/30 rounded-full" />
            <div className="h-1.5 w-full bg-purple-400/30 rounded-full" />
            <div className="h-1.5 w-2/3 bg-purple-400/30 rounded-full" />
          </div>
        </div>
        
        {/* Maskot Zemin Gölgesi (Derinlik algısı için) */}
        <div 
          className="absolute top-[65%] left-1/2 w-64 h-12 bg-black/5 dark:bg-black/30 blur-2xl rounded-[100%] pointer-events-none transition-transform duration-75"
          style={{ transform: `translateX(calc(-50% + ${mousePos.x * -8}px))` }}
        />

        {/* Maskot - Parallax Etkili */}
        <div 
          className="relative z-10 w-4/5 max-w-[500px] aspect-square drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-transform duration-75"
          style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)` }}
        >
          <div className="relative w-full h-full transition-transform duration-700 hover:scale-105">
            <Image 
              src="/panda-mascot.png" 
              alt="Readixon Panda Mascot" 
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain"
              priority
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
