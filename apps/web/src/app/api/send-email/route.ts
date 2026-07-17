import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Gerekli alanlar (to, subject, html) eksik.' },
        { status: 400 }
      );
    }

    // Dynamically import to prevent top-level Next.js/Vercel crashes
    const nodemailer = (await import('nodemailer')).default;

    // Nodemailer SMTP taşıyıcısını oluştur
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // SSL için 465, TLS için 587
      secure: true, 
      auth: {
        user: process.env.SMTP_EMAIL, // Örn: noreply@readixon.com
        pass: process.env.SMTP_PASSWORD, // Google'dan alınan Uygulama Şifresi (16 haneli)
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    // E-postayı gönder
    const info = await transporter.sendMail({
      from: `"Readixon" <${process.env.SMTP_EMAIL}>`,
      replyTo: process.env.SMTP_EMAIL, // noreply@readixon.com adresine yönlendir (cevapları kabul etmemek için)
      to,
      subject,
      html,
    });

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Mail gönderilirken sunucu hatası oluştu.', 
        details: error instanceof Error ? error.message : String(error),
        debug: {
          hasEmail: !!process.env.SMTP_EMAIL,
          hasPassword: !!process.env.SMTP_PASSWORD,
          emailValue: process.env.SMTP_EMAIL ? "Mevcut" : "Yok",
          passLength: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0
        }
      },
      { status: 500 }
    );
  }
}
