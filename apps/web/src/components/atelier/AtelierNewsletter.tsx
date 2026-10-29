'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { AuthorSite } from '@readixon/core';
import { subscribeToAuthorNewsletter } from '@readixon/core';
import { useAtelierTheme } from './AtelierThemeContext';

interface Props {
  site: AuthorSite;
}

export function AtelierNewsletter({ site }: Props) {
  const { 
    themeClasses, 
    primaryColor, 
    fontHeadingFamily, 
    cardRadiusClass,
    template 
  } = useAtelierTheme();

  const config = site.newsletterConfig;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!site.enabledBlocks?.newsletter || !config?.enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await subscribeToAuthorNewsletter(site.id, email, 'site_footer');
      if (res.success) {
        setIsSubscribed(true);
        toast.success(res.message);
        setEmail('');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error('Abonelik işlemi tamamlanamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className={`py-16 sm:py-24 border-b transition-colors ${themeClasses.border}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`relative ${cardRadiusClass} border p-8 sm:p-12 text-center overflow-hidden shadow-2xl ${themeClasses.card} ${themeClasses.border}`}
        >
          {/* Arka Plan Ambient Glow */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-25"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <div 
              className={`w-12 h-12 flex items-center justify-center text-white mb-6 shadow-md ${
                template === 'webtoon' ? 'rounded-2xl' : 'rounded-xl'
              }`}
              style={{ backgroundColor: primaryColor }}
            >
              <Mail className="w-6 h-6" />
            </div>

            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
              style={{ 
                fontFamily: fontHeadingFamily,
                letterSpacing: template === 'worldbuilder' ? '0.04em' : '-0.02em'
              }}
            >
              {config.title || 'Yazarın Edebi Bültenine Abone Ol'}
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed mb-8 ${themeClasses.muted}`}>
              {config.description || 'Yeni kitaplar, gizli bölümler, kamera arkası notları ve imza günlerinden ilk siz haberdar olun.'}
            </p>

            {isSubscribed ? (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center gap-2.5 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">
                  {config.successMessage || 'Bültene başarıyla abone oldunuz! Teşekkürler.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi girin..."
                  className={`flex-1 px-5 py-3.5 rounded-full border text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${themeClasses.card} ${themeClasses.border}`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3.5 rounded-full font-bold text-sm sm:text-base text-white shadow-lg transition-transform hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{config.buttonText || 'Abone Ol'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
