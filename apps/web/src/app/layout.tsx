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
  title: {
    default: "Readixon | Powered by Turixon",
    template: "%s | Readixon"
  },
  description:
    "Readixon, okurları ve yazarları tek bir ekosistemde buluşturan, dijital hikaye anlatıcılığını modern sosyal medya dinamikleriyle harmanlayan yeni nesil bir içerik ve topluluk platformudur.",
  keywords: ["kitap", "hikaye", "yazar", "okur", "readixon", "turixon", "sosyal medya", "e-kitap", "dijital yayıncılık"],
  openGraph: {
    title: "Readixon | Powered by Turixon",
    description: "Readixon, okurları ve yazarları tek bir ekosistemde buluşturan yeni nesil içerik ve topluluk platformudur.",
    url: "https://readixon.com",
    siteName: "Readixon",
    locale: "tr_TR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
