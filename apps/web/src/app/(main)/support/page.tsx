"use client";

import React from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { LifeBuoy, Send, Shield, Book, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Destek ekibine mail gönder (Kullanıcının mesajı)
      const adminMailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'noreply@readixon.com', // Gelen destek mesajlarının düşeceği adres
          subject: `Yeni Destek Talebi: ${name}`,
          html: `
            <h3>Yeni Destek Talebi</h3>
            <p><strong>İsim:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Mesaj:</strong></p>
            <blockquote style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6366f1;">
              ${message.replace(/\n/g, '<br/>')}
            </blockquote>
          `
        })
      });

      // 2. Kullanıcıya otomatik onay maili gönder
      const userMailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Destek Talebiniz Alındı - Readixon',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Merhaba ${name},</h2>
              <p>Destek talebiniz başarıyla bize ulaşmıştır. Ekibimiz mesajınızı inceliyor ve en kısa sürede size (bu e-posta adresi üzerinden) dönüş yapacaktır.</p>
              <p><strong>Gönderdiğiniz Mesaj:</strong></p>
              <blockquote style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6366f1;">
                ${message.replace(/\n/g, '<br/>')}
              </blockquote>
              <p>Teşekkürler,<br>Readixon Ekibi</p>
            </div>
          `
        })
      });

      if (!adminMailRes.ok || !userMailRes.ok) {
        throw new Error('Mail gönderimi sırasında bir hata oluştu.');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Mail gönderim hatası:', error);
      alert('Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = [
    { title: 'Kullanım Koşulları', href: '/terms', icon: FileText },
    { title: 'Gizlilik Politikası', href: '/privacy', icon: Shield },
    { title: 'Topluluk Kuralları', href: '/guidelines', icon: Book },
    { title: 'Telif Hakkı', href: '/copyright', icon: AlertCircle },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:px-8 md:py-12 flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
            <LifeBuoy size={40} strokeWidth={1.5} />
          </div>
          <Typography variant="h1" className="font-bold tracking-tight">Size Nasıl Yardımcı Olabiliriz?</Typography>
          <Typography variant="body" className="text-muted max-w-lg">
            Bir sorun mu yaşıyorsunuz veya bir öneriniz mi var? Aşağıdaki formu doldurarak bize ulaşabilirsiniz. Ekibimiz en kısa sürede size dönüş yapacaktır.
          </Typography>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl w-full mx-auto bg-card border border-border/50 p-6 md:p-8 rounded-3xl shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-12 gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <Typography variant="h3" className="font-bold">Mesajınız Alındı</Typography>
              <Typography variant="body" className="text-muted">En kısa sürede size dönüş yapacağız. Teşekkür ederiz!</Typography>
              <Button className="mt-6" onPress={() => setSubmitted(false)}>
                Yeni Mesaj Gönder
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="İsim"
                  placeholder="Adınız ve Soyadınız"
                  value={name}
                  onChangeText={setName}
                  required
                />
                <Input
                  label="E-posta"
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChangeText={setEmail}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text ml-1">
                  Mesaj <span className="text-primary ml-1" aria-hidden="true">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Size nasıl yardımcı olabiliriz?"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-text transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>
              <Button type="submit" className="w-full h-12 flex items-center justify-center gap-2 mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Send size={18} />
                    Gönder
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Policies / Links Footer */}
        <div className="mt-auto pt-16 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-card/50 hover:bg-card border border-transparent hover:border-border/50 transition-all text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <link.icon size={24} />
                </div>
                <Typography variant="body" className="font-medium group-hover:text-primary transition-colors">{link.title}</Typography>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
