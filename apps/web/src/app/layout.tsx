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
  title: "Readixon — Yeni Nesil Okuma & Yazma Platformu",
  description:
    "Readixon, okurları ve yazarları tek bir ekosistemde buluşturan, dijital hikaye anlatıcılığını modern sosyal medya dinamikleriyle harmanlayan yeni nesil bir içerik ve topluluk platformudur.",
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
