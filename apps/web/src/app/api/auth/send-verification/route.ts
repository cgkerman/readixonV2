import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli.' },
        { status: 400 }
      );
    }

    // Dynamically import to prevent top-level Next.js/Vercel crashes
    const { adminAuth } = await import('@/lib/firebaseAdmin');
    const nodemailer = (await import('nodemailer')).default;

    // Generate Verification Link using Firebase Admin
    let verificationLink: string;
    try {
      verificationLink = await adminAuth.generateEmailVerificationLink(email);
    } catch (error: any) {
      console.error('Link oluşturma hatası:', error);
      return NextResponse.json(
        { error: 'Doğrulama linki oluşturulurken bir hata meydana geldi.' },
        { status: 400 }
      );
    }

    // Parse the oobCode from the Firebase generated link
    const url = new URL(verificationLink);
    const oobCode = url.searchParams.get('oobCode');
    
    if (!oobCode) {
      throw new Error('Firebase linkinde oobCode bulunamadı.');
    }

    // Determine host to create our custom link
    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const appUrl = `${protocol}://${host}`;
    
    // Create the custom verification link
    const customLink = `${appUrl}/verify-email?oobCode=${oobCode}`;

    // Setup Nodemailer Transporter with explicit timeouts to prevent Vercel 10s limit crash
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // SSL
      secure: true, 
      auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    // Email Template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>E-posta Doğrulama</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            text-decoration: none;
            margin-bottom: 24px;
            display: inline-block;
          }
          .title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }
          .text {
            font-size: 16px;
            line-height: 1.5;
            color: #4b5563;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background-color: #111827;
            color: #ffffff !important;
            font-weight: 500;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin-bottom: 24px;
          }
          .footer {
            font-size: 14px;
            color: #6b7280;
            margin-top: 32px;
          }
          .footer-text {
            margin-top: 8px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">Readixon</div>
            <h1 class="title">E-postanızı Doğrulayın</h1>
            <p class="text">
              Merhaba, <br><br>
              Readixon'a katıldığınız için teşekkürler! Devam edebilmek ve yazar yetkilerine sahip olabilmek için e-posta adresinizi doğrulamanız ve topluluk kurallarımızı kabul etmeniz gerekmektedir.
            </p>
            <a href="${customLink}" class="button">Doğrulama ve Onay Ekranına Git</a>
            <p class="text" style="font-size: 14px;">
              Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.
            </p>
            <div class="footer">
              <p>Saygılarımızla,<br>Readixon Ekibi</p>
              <p class="footer-text">Bu otomatik bir e-postadır, lütfen cevaplamayın.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Email
    const info = await transporter.sendMail({
      from: '"Readixon" <' + process.env.SMTP_EMAIL + '>',
      replyTo: 'noreply@readixon.com', // Prevent direct replies
      to: email,
      subject: 'Readixon - E-posta Doğrulama',
      html: htmlTemplate,
    });

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Doğrulama e-postası gönderme hatası:', error);
    return NextResponse.json(
      { error: 'E-posta gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
