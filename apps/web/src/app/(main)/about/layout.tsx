import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda | Readixon - Yeni Nesil Edebiyat ve Hikaye Ekosistemi',
  description: 'Readixon: Okuma deneyimini ambiyans müzikleri, RPG karakter sistemleri, Edebi Arena düelloları ve yapay zeka destekli stüdyoyla dönüştüren yeni nesil edebiyat platformu.',
  keywords: [
    'readixon nedir',
    'yeni nesil hikaye platformu',
    'edebi arena',
    'kör oylama hikaye',
    'curveball sürpriz kırılma',
    'rpg karakter istatistikleri',
    'ambiyans fon müzikleri okuma',
    'editoryal inceleme',
    'webtoon oku',
    'readix sosyal edebiyat',
    'yazar stüdyosu kurgu sihirbazı',
    'turixon limited şirketi'
  ],
  openGraph: {
    title: 'Hakkımızda | Readixon - Sınırları Aşan Hikayeler',
    description: 'Klasik hikaye sitelerini unutun. Ambiyans sesleri, Edebi Arena, RPG karakter dinamikleri ve satır içi etkileşimle yaşayan edebiyat evreni.',
    url: 'https://readixon.com/about',
    siteName: 'Readixon',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readixon - Okuma ve Yazma Deneyimi Yeniden Tanımlandı',
    description: 'Canlı hikaye düelloları, ambiyans müzikleri, kurgu sihirbazı ve RPG karakter istatistikleriyle edebiyatı keşfet.',
  },
  alternates: {
    canonical: 'https://readixon.com/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Schema.org Organization Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Readixon',
            legalName: 'Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi',
            url: 'https://readixon.com',
            logo: 'https://readixon.com/brand-logo.png',
            description: 'Yeni nesil etkileşimli hikaye, edebiyat ve yazarlık platformu.',
            email: 'support@readixon.com',
            telephone: '+905524634140',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Akkonak Mah. 1814 Sk. No: 87 İç Kapı No: 2',
              addressLocality: 'Merkezefendi',
              addressRegion: 'Denizli',
              addressCountry: 'TR',
            },
            sameAs: [
              'https://twitter.com/readixon',
              'https://instagram.com/readixon',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
