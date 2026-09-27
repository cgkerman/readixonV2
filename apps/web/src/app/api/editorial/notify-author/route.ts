import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId parametresi zorunludur.' },
        { status: 400 }
      );
    }

    // Dynamically import Firebase Admin and Nodemailer
    const { adminDb, adminAuth } = await import('@/lib/firebaseAdmin');
    const nodemailer = (await import('nodemailer')).default;

    // 1. Fetch Review from Firestore
    const reviewSnap = await adminDb.collection('editorialReviews').doc(reviewId).get();
    if (!reviewSnap.exists) {
      return NextResponse.json(
        { error: 'Belirtilen ID ile editoryal değerlendirme bulunamadı.' },
        { status: 404 }
      );
    }

    const review = { id: reviewSnap.id, ...reviewSnap.data() };

    // 2. Fetch Story to find the Author
    if (!review.storyId) {
      return NextResponse.json(
        { error: 'Değerlendirmeye ait geçerli bir eser (storyId) bulunamadı.' },
        { status: 400 }
      );
    }

    const storySnap = await adminDb.collection('stories').doc(review.storyId).get();
    if (!storySnap.exists) {
      return NextResponse.json(
        { error: 'İlgili eser sistemde bulunamadı.' },
        { status: 404 }
      );
    }

    const story = { id: storySnap.id, ...storySnap.data() };
    const authorId = story.authorId;

    if (!authorId) {
      return NextResponse.json(
        { error: 'Eserin yazar ID bilgisi bulunamadı.' },
        { status: 400 }
      );
    }

    // 3. Fetch Author Profile & Email
    let authorEmail: string | null = null;
    let authorDisplayName: string = review.authorName || story.authorName || 'Değerli Yazarımız';

    try {
      const authorDoc = await adminDb.collection('users').doc(authorId).get();
      if (authorDoc.exists) {
        const authorData = authorDoc.data();
        if (authorData?.displayName) authorDisplayName = authorData.displayName;
        if (authorData?.email) authorEmail = authorData.email;
      }
    } catch (e) {
      console.warn('Yazar Firestore belgesi okunurken uyarı:', e);
    }

    // If email not found in user doc, lookup via Firebase Auth
    if (!authorEmail) {
      try {
        const userAuth = await adminAuth.getUser(authorId);
        if (userAuth?.email) {
          authorEmail = userAuth.email;
        }
        if (userAuth?.displayName && !authorDisplayName) {
          authorDisplayName = userAuth.displayName;
        }
      } catch (e) {
        console.warn('Firebase Auth kullanıcı sorgusu uyarısı:', e);
      }
    }

    // 4. Calculate Average Score
    const scores = review.scores || {};
    const scoreValues = Object.values(scores).filter((v): v is number => typeof v === 'number');
    const averageScore = scoreValues.length > 0
      ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
      : '9.0';

    const now = new Date();

    // 5. Create In-App Notification
    let notificationCreated = false;
    try {
      const notifRef = adminDb.collection('users').doc(authorId).collection('notifications').doc();
      await notifRef.set({
        id: notifRef.id,
        userId: authorId,
        actorId: review.editorId || 'system',
        actorName: review.editorName || 'Readixon Editörü',
        actorAvatar: review.editorAvatar || '',
        type: 'editorial_review',
        entityId: review.storyId,
        entityTitle: review.storyTitle || story.title || 'Kitabınız',
        subEntityId: review.id,
        subEntityTitle: 'Editör Değerlendirmesi',
        message: `"${review.storyTitle || story.title}" adlı eseriniz için editör değerlendirmesi yayınlandı!`,
        isRead: false,
        createdAt: now,
      });
      notificationCreated = true;
    } catch (e) {
      console.error('Uygulama içi bildirim oluşturma hatası:', e);
    }

    // 6. Send Email if Author Email is available and SMTP is configured
    let emailSent = false;
    let emailError: string | null = null;

    if (authorEmail && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      try {
        const host = request.headers.get('host') || 'readixon.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const appUrl = `${protocol}://${host}`;
        const reviewUrl = `${appUrl}/reviews/${review.id}`;
        const storyTitle = review.storyTitle || story.title || 'Eseriniz';
        const storyCover = review.storyCover || story.coverImage || '';
        const editorName = review.editorName || 'Readixon Editörü';
        const excerpt = review.firstImpression || review.finalWord || review.about || 'Eseriniz detaylı kriterler eşliğinde incelendi ve editör notları eklendi.';

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
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

        const htmlTemplate = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Readixon Editör Değerlendirmesi</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0d0f14;
                color: #e2e8f0;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
              }
              .wrapper {
                max-width: 620px;
                margin: 0 auto;
                padding: 32px 16px;
              }
              .card {
                background: linear-gradient(180deg, #151921 0%, #11141a 100%);
                border-radius: 20px;
                padding: 36px 28px;
                border: 1px solid rgba(245, 158, 11, 0.25);
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                text-align: center;
              }
              .brand-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(245, 158, 11, 0.12);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #f59e0b;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                padding: 6px 14px;
                border-radius: 9999px;
                margin-bottom: 20px;
              }
              .logo {
                font-size: 26px;
                font-weight: 900;
                letter-spacing: -0.5px;
                color: #ffffff;
                text-decoration: none;
                margin-bottom: 6px;
                display: block;
              }
              .logo span {
                color: #f59e0b;
              }
              .main-title {
                font-size: 22px;
                font-weight: 800;
                color: #ffffff;
                margin: 12px 0 8px 0;
                line-height: 1.3;
              }
              .subtitle {
                font-size: 15px;
                color: #94a3b8;
                line-height: 1.6;
                margin: 0 0 24px 0;
              }
              .story-box {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 26px;
                display: table;
                width: 100%;
                box-sizing: border-box;
                text-align: left;
              }
              .story-cover-cell {
                display: table-cell;
                width: 80px;
                vertical-align: middle;
              }
              .story-cover {
                width: 70px;
                height: 105px;
                object-fit: cover;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                display: block;
              }
              .story-info-cell {
                display: table-cell;
                vertical-align: middle;
                padding-left: 16px;
              }
              .story-title {
                font-size: 18px;
                font-weight: 800;
                color: #ffffff;
                margin: 0 0 6px 0;
              }
              .score-pill {
                display: inline-block;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: #ffffff;
                font-size: 13px;
                font-weight: 800;
                padding: 4px 12px;
                border-radius: 9999px;
                margin-bottom: 8px;
              }
              .editor-meta {
                font-size: 13px;
                color: #94a3b8;
                margin: 0;
              }
              .quote-box {
                background: rgba(245, 158, 11, 0.05);
                border-left: 3px solid #f59e0b;
                border-radius: 0 12px 12px 0;
                padding: 16px;
                margin: 0 0 28px 0;
                text-align: left;
                font-style: italic;
                color: #cbd5e1;
                font-size: 14px;
                line-height: 1.6;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: #000000 !important;
                font-weight: 800;
                font-size: 15px;
                padding: 14px 32px;
                border-radius: 12px;
                text-decoration: none;
                box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4);
                transition: transform 0.2s;
              }
              .footer {
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                font-size: 12px;
                color: #64748b;
                line-height: 1.6;
              }
              .footer a {
                color: #f59e0b;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="card">
                <div class="brand-badge">✦ READIXON GOLD STANDART</div>
                <div class="logo">READIX<span>ON</span></div>
                
                <h1 class="main-title">Tebrikler ${authorDisplayName}!</h1>
                <p class="subtitle">
                  Editörümüz eserinizi detaylı kriterler eşliğinde inceledi ve platformda yayınlanan resmi editoryal değerlendirmesini tamamladı.
                </p>

                <div class="story-box">
                  ${storyCover ? `
                    <div class="story-cover-cell">
                      <img src="${storyCover}" alt="${storyTitle}" class="story-cover" />
                    </div>
                  ` : ''}
                  <div class="story-info-cell">
                    <h2 class="story-title">${storyTitle}</h2>
                    <div>
                      <span class="score-pill">★ ${averageScore} / 10</span>
                    </div>
                    <p class="editor-meta">İnceleyen: <strong>${editorName}</strong></p>
                  </div>
                </div>

                <div class="quote-box">
                  "${excerpt.length > 240 ? excerpt.slice(0, 240) + '...' : excerpt}"
                </div>

                <div>
                  <a href="${reviewUrl}" class="button">Değerlendirmeyi Oku & İncele</a>
                </div>

                <div class="footer">
                  <p>Bu değerlendirme Readixon editoryal ekibi tarafından 8 boyutlu analiz matrisi kullanılarak objektif kriterlerle hazırlanmıştır.</p>
                  <p>Eserinizi geliştirmek veya okuyucularınızla paylaşmak için değerlendirme bağlantısını kullanabilirsiniz.</p>
                  <p style="margin-top: 12px;">© ${new Date().getFullYear()} Readixon. Tüm hakları saklıdır.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"Readixon Editör Masası" <${process.env.SMTP_EMAIL}>`,
          replyTo: 'noreply@readixon.com',
          to: authorEmail,
          subject: `✦ Readixon Editör Değerlendirmesi: "${storyTitle}"`,
          html: htmlTemplate,
        });

        emailSent = true;
      } catch (err: any) {
        console.error('Mail gönderimi sırasında hata:', err);
        emailError = err?.message || String(err);
      }
    }

    // 7. Update Review with authorNotifiedAt
    try {
      await adminDb.collection('editorialReviews').doc(reviewId).update({
        authorNotifiedAt: now,
      });
    } catch (e) {
      console.warn('authorNotifiedAt güncellenirken uyarı:', e);
    }

    return NextResponse.json({
      success: true,
      notificationCreated,
      emailSent,
      authorEmail: authorEmail || null,
      emailError,
      notifiedAt: now.toISOString(),
      message: emailSent
        ? 'Yazara hem uygulama içi bildirim hem de e-posta başarıyla iletildi.'
        : notificationCreated
          ? 'Uygulama içi bildirim gönderildi (Yazarın e-posta adresi bulunamadı veya SMTP yapılandırılmamış).'
          : 'İşlem tamamlandı.'
    });

  } catch (error: any) {
    console.error('notify-author route genel hatası:', error);
    return NextResponse.json(
      {
        error: 'Yazara bildirim gönderilirken sunucu hatası oluştu.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
