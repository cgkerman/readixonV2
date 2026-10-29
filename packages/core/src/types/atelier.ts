import type { Timestamp } from 'firebase/firestore';

export type AtelierTemplate = 'novelist' | 'worldbuilder' | 'webtoon' | 'minimalist';
export type AtelierThemeMode = 'system' | 'light' | 'dark' | 'sepia' | 'oled';

export interface AuthorPressQuote {
  quote: string;
  source: string;
  year?: string;
}

export interface AuthorAward {
  title: string;
  year: string;
  institution: string;
}

export interface AuthorEvent {
  id: string;
  title: string;
  dateStr: string;
  location: string;
  type: 'signing' | 'panel' | 'online_interview';
  linkUrl?: string;
}

export interface AuthorSiteThemeConfig {
  template: AtelierTemplate;
  mode: AtelierThemeMode;
  primaryColor: string;
  fontHeading: string;
  fontBody: string;
  cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface AuthorSiteSEO {
  siteTitle: string;
  tagline: string;
  description: string;
  ogImageUrl?: string;
  faviconUrl?: string;
}

export interface AuthorSiteHero {
  enabled: boolean;
  authorName: string;
  authorTitle: string;
  bioShort: string;
  avatarUrl?: string;
  bannerUrl?: string;
  currentStatus?: string;
  ctaButton: {
    enabled: boolean;
    text: string;
    linkType: 'featured_story' | 'custom_url' | 'blog' | 'newsletter';
    targetId?: string;
    customUrl?: string;
  };
}

export interface AuthorSiteBooksConfig {
  title: string;
  description?: string;
  displayMode: 'grid' | 'carousel' | 'curated_shelf';
  selectedStoryIds: string[];
  showRatings: boolean;
  showEditorialBadge: boolean;
  showChapterCount: boolean;
}

export interface AuthorSiteUniverseConfig {
  enabled: boolean;
  universeId?: string;
  title: string;
  description?: string;
  showInteractiveMap: boolean;
  showCharacterCards: boolean;
  showGlossaryPreview: boolean;
  showTimeline: boolean;
}

export interface AuthorSiteAboutConfig {
  title: string;
  richBioMarkdown: string;
  pressQuotes: AuthorPressQuote[];
  awards: AuthorAward[];
}

export interface AuthorSiteEventsConfig {
  enabled: boolean;
  title: string;
  events: AuthorEvent[];
}

export interface AuthorSiteNewsletterConfig {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
  successMessage: string;
}

export interface AuthorSiteSocialConfig {
  instagram?: string;
  twitter?: string;
  goodreads?: string;
  youtube?: string;
  tiktok?: string;
  spotifyPlaylistUrl?: string;
  contactEmail?: string;
}

export interface AuthorSiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  bookClicks: number;
  subscribersCount: number;
}

export interface AuthorSite {
  id: string; // userId ile 1-e-1 eşleşir
  userId: string;
  username: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: any;
  updatedAt?: any;

  domainConfig: {
    subdomain?: string;
    customDomain?: string;
    isDomainVerified?: boolean;
    dnsVerificationToken?: string;
  };

  themeConfig: AuthorSiteThemeConfig;
  seo: AuthorSiteSEO;
  hero: AuthorSiteHero;
  blocksOrder: string[];
  enabledBlocks: Record<string, boolean>;
  booksConfig: AuthorSiteBooksConfig;
  universeConfig: AuthorSiteUniverseConfig;
  aboutConfig: AuthorSiteAboutConfig;
  eventsConfig: AuthorSiteEventsConfig;
  newsletterConfig: AuthorSiteNewsletterConfig;
  socialConfig: AuthorSiteSocialConfig;
  analytics: AuthorSiteAnalytics;
}

export interface AuthorBlogPost {
  id: string;
  siteId: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  tags: string[];
  publishedAt: any;
  isPublished: boolean;
  viewsCount: number;
  likesCount: number;
}

export interface AuthorSubscriber {
  id: string;
  email: string;
  createdAt: any;
  status: 'active' | 'unsubscribed';
  source: 'site_footer' | 'hero_cta' | 'blog_post' | 'direct';
}

/**
 * Yeni açılan veya henüz sitesi olmayan bir yazar için varsayılan prestij site konfigürasyonu üretir.
 */
export function createDefaultAuthorSite(user: {
  uid: string;
  displayName?: string | null;
  username?: string | null;
  photoURL?: string | null;
  bio?: string | null;
}): AuthorSite {
  const name = user.displayName || user.username || 'Yazar';
  const uname = user.username || 'yazar';
  const cleanSlug = uname.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  return {
    id: user.uid,
    userId: user.uid,
    username: uname,
    slug: cleanSlug,
    isPublished: false,
    domainConfig: {
      subdomain: cleanSlug,
    },
    themeConfig: {
      template: 'novelist',
      mode: 'dark',
      primaryColor: '#6366F1',
      fontHeading: 'Playfair Display',
      fontBody: 'Plus Jakarta Sans',
      cardRadius: 'md',
    },
    seo: {
      siteTitle: `${name} | Resmi Yazar Web Sitesi`,
      tagline: 'Kelimeler, Evrenler ve Hikayeler',
      description: `${name} kişisel yazar vitrini, kitapları, kurgusal evreni ve edebi güncesi.`,
      faviconUrl: user.photoURL || undefined,
    },
    hero: {
      enabled: true,
      authorName: name,
      authorTitle: 'Roman Yazarı & Kurgu Mimarı',
      bioShort: user.bio || 'Kelimelerin ardındaki gizemli dünyalara kapı aralayan hikayeler üretiyorum.',
      avatarUrl: user.photoURL || undefined,
      currentStatus: 'Şu an yeni bölüm üzerinde çalışıyor...',
      ctaButton: {
        enabled: true,
        text: 'Son Eseri Oku',
        linkType: 'featured_story',
      },
    },
    blocksOrder: ['hero', 'books', 'universe', 'about', 'events', 'newsletter', 'social'],
    enabledBlocks: {
      hero: true,
      books: true,
      universe: true,
      about: true,
      events: true,
      newsletter: true,
      social: true,
    },
    booksConfig: {
      title: 'Eserlerim & Romanlarım',
      description: 'Readixon üzerinde yayınlanan tüm kitaplarım, serilerim ve güncel bölümlerim.',
      displayMode: 'grid',
      selectedStoryIds: [],
      showRatings: true,
      showEditorialBadge: true,
      showChapterCount: true,
    },
    universeConfig: {
      enabled: false,
      title: 'Kurgusal Evren & Dünya Haritası',
      description: 'Eserlerimin geçtiği kadim dünya, ırklar ve karakter codex arşivi.',
      showInteractiveMap: true,
      showCharacterCards: true,
      showGlossaryPreview: true,
      showTimeline: false,
    },
    aboutConfig: {
      title: 'Yazar Hakkında',
      richBioMarkdown: user.bio 
        ? `${user.bio}\n\nEdebiyat ve kurgu alanında özgün dünyalar kuruyor, karakterlerin izini sürüyorum.`
        : 'Edebiyat ve fantastik kurgu alanında özgün dünyalar kuruyor, kelimelerle yeni evrenler inşa ediyorum.',
      pressQuotes: [
        {
          quote: 'Kurgusundaki derinlik ve atmosfer yaratımı büyüleyici.',
          source: 'Readixon Edebi İnceleme Kurulu',
          year: '2026',
        },
      ],
      awards: [],
    },
    eventsConfig: {
      enabled: false,
      title: 'Gelecek Etkinlikler & İmza Günleri',
      events: [],
    },
    newsletterConfig: {
      enabled: true,
      title: 'Yazarın Edebi Bültenine Abone Olun',
      description: 'Yeni kitaplar, gizli bölümler, kamera arkası notları ve imza günlerinden ilk siz haberdar olun.',
      buttonText: 'Bültene Abone Ol',
      successMessage: 'Bültene başarıyla kaydoldunuz! Teşekkürler.',
    },
    socialConfig: {
      instagram: '',
      twitter: '',
      goodreads: '',
      youtube: '',
      tiktok: '',
      spotifyPlaylistUrl: '',
      contactEmail: '',
    },
    analytics: {
      totalViews: 0,
      uniqueVisitors: 0,
      bookClicks: 0,
      subscribersCount: 0,
    },
  };
}

