import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import Providers from "./providers";

import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://readixon.com'),
  title: {
    default: "Readixon - Sınırları Aşan Hikayeler",
    template: "%s | Readixon"
  },
  description:
    "Readixon, okurları ve yazarları tek bir ekosistemde buluşturan, dijital hikaye anlatıcılığını modern sosyal medya dinamikleriyle harmanlayan yeni nesil bir içerik ve topluluk platformudur. Kendi hikayeni yaz, paylaş ve oku.",
  keywords: ["kitap okuma uygulaması", "ücretsiz hikaye oku", "roman yaz", "yeni nesil edebiyat", "okur yazar topluluğu", "wattpad alternatifi", "readixon", "turixon", "e-kitap", "dijital yayıncılık", "sosyal medya", "kitap", "hikaye", "yazar", "okur"],
  authors: [{ name: 'Readixon Ekibi', url: 'https://readixon.com' }],
  creator: 'Readixon',
  publisher: 'Readixon',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Readixon - Sınırları Aşan Hikayeler",
    description: "Readixon, okurları ve yazarları tek bir ekosistemde buluşturan yeni nesil içerik ve topluluk platformudur.",
    url: "https://readixon.com",
    siteName: "Readixon",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: '/icon.png',
        width: 800,
        height: 600,
        alt: 'Readixon Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readixon - Sınırları Aşan Hikayeler',
    description: 'Yeni nesil içerik ve topluluk platformu Readixon ile kendi hikayeni yaz ve paylaş!',
    images: ['/icon.png'],
    creator: '@readixon',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here", // Change this when Google Search Console is set up
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Readixon",
  "url": "https://readixon.com",
  "description": "Readixon, okurları ve yazarları tek bir ekosistemde buluşturan yeni nesil içerik ve topluluk platformudur.",
  "publisher": {
    "@type": "Organization",
    "name": "Readixon",
    "logo": {
      "@type": "ImageObject",
      "url": "https://readixon.com/icon.png"
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth" style={{ scrollPaddingBottom: '150px' }}>
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
