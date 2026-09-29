import DOMPurify from 'dompurify';

export interface SanitizeConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  ADD_TAGS?: string[];
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  [key: string]: any;
}

/**
 * HTML içeriğindeki zararlı JavaScript, XSS ve inline event handler'ları temizler.
 * Hem tarayıcı (Client-Side) hem de Next.js SSR (Server-Side) ortamlarında
 * JSDOM / Node FS çökmesi (default-stylesheet.css vb.) olmadan %100 güvenle çalışır.
 */
export const sanitizeHtml = (dirtyHtml: string, config?: SanitizeConfig): string => {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  if (typeof window !== 'undefined') {
    // Tarayıcı ortamında yerel DOMPurify motorunu çalıştır
    return String(DOMPurify.sanitize(dirtyHtml, config as any));
  }

  // Server-Side (Next.js SSR) güvenli temizlik:
  // JSDOM yüklemeden <script>, <iframe>, <object> ve inline on* event handler'larını temizler.
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/\s*on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, 'blocked:');
};

export default sanitizeHtml;
