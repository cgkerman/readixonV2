import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda - Yazarlık İşletim Sistemi ve İnteraktif Dijital Yayıncılık Ekosistemi | Readixon',
  description: 'Readixon; yazarların fikir aşamasından evren oluşturmaya, ortak üretimden gelire kadar tüm süreci yönettiği, okuyucuların ise spoiler kontrollü harita ve karakterleri keşfettiği yeni nesil Yazarlık İşletim Sistemi ve yayıncılık ekosistemidir.',
  keywords: [
    'readixon nedir',
    'yazarlık işletim sistemi',
    'interaktif dijital yayıncılık',
    'yeni nesil edebiyat ekosistemi',
    'wattpad alternatifi türkçe',
    'hikaye yazarak para kazanma',
    'evren oluşturma lorebook',
    'spoiler korumalı okuma',
    'edebi arena kör oylama',
    'curveball sürpriz kırılma',
    'rpg karakter motoru',
    'ambiyans fon müzikleri okuma',
    'yazar stüdyosu ve kurgu sihirbazı',
    'co-authoring ortak yazarlık',
    'turixon limited şirketi',
    'btk yer sağlayıcı'
  ],
  openGraph: {
    title: 'Hakkımızda | Readixon - Yeni Nesil Yazarlık İşletim Sistemi',
    description: 'Yazarlar için fikir, kurgu, ortak üretim ve gelir modeli; okurlar için spoiler korumalı evren keşfi ve atmosferik okuma motoru. Readixon ile tanışın.',
    url: 'https://readixon.com/about',
    siteName: 'Readixon',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: 'https://readixon.com/images/auth-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Readixon - Yazarlık İşletim Sistemi ve Dijital Yayıncılık Ekosistemi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readixon | Yazarlık İşletim Sistemi ve Edebiyat Ekosistemi',
    description: 'Yazarlık ve okuma deneyimini evren mimarisi, RPG statları, atmosferik sesler ve adil gelir modeliyle baştan inşa ediyoruz.',
    images: ['https://readixon.com/images/auth-hero.jpg'],
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
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Readixon nedir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Readixon; yazarların fikir aşamasından kurgu ve evren oluşturmaya, yazımdan ortak üretime, yayınlamadan gelir elde etmeye kadar tüm yaratıcı süreci yönetebildiği; okuyucuların ise hikâyeleri yalnızca okumakla kalmayıp karakterleri, haritaları ve evrenleri spoiler kontrollü biçimde keşfedebildiği yeni nesil bir Yazarlık İşletim Sistemi ve interaktif dijital yayıncılık ekosistemidir.',
        },
      },
      {
        '@type': 'Question',
        name: 'Readixon\'da yayınladığım hikayelerin telif hakkı kime aittir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Eserlerin tüm fikri mülkiyet ve telif hakları %100 yazara aittir. 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında eserleriniz yasal güvence altındadır; dilediğiniz zaman eserinizi silebilir, güncelleyebilir veya geleneksel yayınevlerine basılı olarak sunabilirsiniz.',
        },
      },
      {
        '@type': 'Question',
        name: 'Yazarlar Readixon üzerinden nasıl gelir elde edebilir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yazarlar; okur abonelikleri, doğrudan bahşiş/destek sistemi (RX Puanı), özel bölümler ve Edebi Arena ödül havuzları üzerinden şeffaf ve düzenli gelir elde edebilirler. Tüm kazançlar yasal faturalandırma ve resmi banka transferi ile aktarılır.',
        },
      },
      {
        '@type': 'Question',
        name: 'Spoiler korumalı Evren ve Lorebook sistemi nasıl çalışır?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yazarlar hikayelerine ait karakterleri, mekanları ve fraksiyonları Evren Defteri\'ne ekler ve bölümlere bağlar. Reader Universe Drawer sayesinde bir okuyucu metindeki bir karaktere tıkladığında yalnızca o an okuduğu bölüme kadar olan bilgiler gösterilir; ileriki bölümlerdeki sürprizler asla açığa çıkmaz.',
        },
      },
      {
        '@type': 'Question',
        name: 'Readixon ücretsiz mi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Evet, Readixon\'a kaydolmak, binlerce hikayeyi okumak, temel yazarlık stüdyosunu kullanmak ve topluluk etkinliklerine katılmak tamamen ücretsizdir. İleri düzey stüdyo modülleri ve yazarları destekleme opsiyonları isteğe bağlıdır.',
        },
      },
      {
        '@type': 'Question',
        name: 'Readixon yasal ve resmi bir platform mudur?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Evet, Readixon resmi olarak Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi bünyesinde faaliyet göstermekte olup, T.C. Bilgi Teknolojileri ve İletişim Kurumu (BTK) onaylı kayıtlı yer sağlayıcıdır. 6698 sayılı KVKK ve ilgili tüm tüketici mevzuatlarına tam uyumludur.',
        },
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Readixon',
    operatingSystem: 'Web, Android',
    applicationCategory: 'MultimediaApplication, ProductivityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
    },
    description: 'Yazarlık İşletim Sistemi, Lorebook evren mimarisi, spoiler korumalı okuma motoru, atmosferik müzik ve interaktif dijital yayıncılık platformu.',
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Readixon',
    legalName: 'Turixon Turizm Danışmanlık Sanayi ve Ticaret Limited Şirketi',
    url: 'https://readixon.com',
    logo: 'https://readixon.com/brand-logo.png',
    description: 'Yeni nesil Yazarlık İşletim Sistemi ve interaktif dijital yayıncılık ekosistemi.',
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
  };

  return (
    <>
      {/* Schema.org Organization, SoftwareApplication & FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

