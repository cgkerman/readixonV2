import type { Metadata } from 'next';
import { getUserByUsername } from '@readixon/core';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const rawUsernameParam = typeof params.username === 'string' ? params.username : '';
  const decodedParam = decodeURIComponent(rawUsernameParam);
  const targetUsername = decodedParam.startsWith('@') ? decodedParam.slice(1) : decodedParam;
  
  if (!targetUsername) {
    return { title: 'Profil Bulunamadı' };
  }

  try {
    const user = await getUserByUsername(targetUsername);
    if (!user) {
      return { title: 'Profil Bulunamadı' };
    }

    const title = `${user.displayName} (@${user.username})`;
    const description = user.bio || `${user.displayName} adlı yazarın profilini, yayınladığı hikayeleri ve edebi başarılarını Readixon'da keşfedin.`;
    const canonicalUrl = `https://readixon.com/profile/@${user.username}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${user.displayName} (@${user.username}) | Readixon`,
        description,
        url: canonicalUrl,
        images: user.avatarUrl ? [{ url: user.avatarUrl, alt: user.displayName }] : [],
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `${user.displayName} (@${user.username}) | Readixon`,
        description,
        images: user.avatarUrl ? [user.avatarUrl] : [],
      },
    };
  } catch (error) {
    return { title: 'Yazar Profili' };
  }
}

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const rawUsernameParam = typeof params.username === 'string' ? params.username : '';
  const decodedParam = decodeURIComponent(rawUsernameParam);
  const targetUsername = decodedParam.startsWith('@') ? decodedParam.slice(1) : decodedParam;

  let user = null;
  if (targetUsername) {
    try {
      user = await getUserByUsername(targetUsername);
    } catch (e) {
      console.error("ProfileLayout error fetching user:", e);
    }
  }

  // 1. Person & ProfilePage Schema
  const profileJsonLd = user ? {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": user.displayName,
      "alternateName": `@${user.username}`,
      ...(user.bio ? { "description": user.bio } : {}),
      ...(user.avatarUrl ? { "image": user.avatarUrl } : {}),
      "url": `https://readixon.com/profile/@${user.username}`,
      ...(user.socials ? {
        "sameAs": Object.values(user.socials).filter(Boolean)
      } : {})
    }
  } : null;

  // 2. BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://readixon.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Yazarlar",
        "item": "https://readixon.com/explore/authors"
      },
      ...(user ? [{
        "@type": "ListItem",
        "position": 3,
        "name": user.displayName,
        "item": `https://readixon.com/profile/@${user.username}`
      }] : [])
    ]
  };

  return (
    <>
      {profileJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
