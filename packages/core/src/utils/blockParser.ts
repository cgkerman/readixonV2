import type { ContentBlock, ContentBlockType } from '../types';

export const generateBlockId = (): string => 
  `blk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

export const ensureBlockId = (b: ContentBlock): ContentBlock => {
  if (b.id) return b;
  return { ...b, id: generateBlockId() };
};

/**
 * Word, Wattpad veya zengin metin editöründen gelen HTML / düz metin çıktısını
 * Readixon'un ContentBlock[] modüler yapısına ayrıştırır.
 */
export function htmlToContentBlocks(html: string, plainText?: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  if (typeof document !== 'undefined' && html && html.trim()) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Önce body içindeki blok etiketlerini toplayalım
    const childElements = Array.from(doc.body.children);

    if (childElements.length > 0) {
      childElements.forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        const innerHTML = el.innerHTML.trim();
        const textContent = el.textContent?.trim() || '';

        // Boş veya sadece br/boş span olan etiketleri atla
        if (!textContent && !el.querySelector('img') && tagName !== 'hr') {
          return;
        }

        if (tagName === 'blockquote') {
          blocks.push({
            id: generateBlockId(),
            type: 'quote',
            text: innerHTML || textContent,
            url: '',
          });
        } else if (tagName === 'hr') {
          blocks.push({
            id: generateBlockId(),
            type: 'divider',
            text: '',
            url: '',
          });
        } else if (tagName === 'img' || (tagName === 'figure' && el.querySelector('img'))) {
          const img = (tagName === 'img' ? el : el.querySelector('img')) as HTMLImageElement;
          const caption = el.querySelector('figcaption')?.textContent || '';
          if (img?.src) {
            blocks.push({
              id: generateBlockId(),
              type: 'image',
              text: caption,
              url: img.src,
            });
          }
        } else if (tagName === 'ul' || tagName === 'ol') {
          const items = Array.from(el.querySelectorAll('li'));
          items.forEach((li, idx) => {
            const prefix = tagName === 'ol' ? `${idx + 1}. ` : '• ';
            const liContent = li.innerHTML.trim();
            if (liContent) {
              blocks.push({
                id: generateBlockId(),
                type: 'paragraph',
                text: `${prefix}${liContent}`,
                url: '',
              });
            }
          });
        } else {
          // p, h1, h2, h3, div vb.
          let content = innerHTML;
          if (tagName.startsWith('h')) {
            content = `<b>${innerHTML}</b>`;
          }
          blocks.push({
            id: generateBlockId(),
            type: 'paragraph',
            text: content,
            url: '',
          });
        }
      });
    } else {
      // Body içinde doğrudan p etiketi yoksa, <br> veya text ile ayrılmış olabilir
      const rawHtml = doc.body.innerHTML;
      const parts = rawHtml.split(/<br\s*[\/]?>/gi);
      parts.forEach((p) => {
        const trimmed = p.trim();
        if (trimmed && trimmed !== '<div></div>') {
          blocks.push({
            id: generateBlockId(),
            type: 'paragraph',
            text: trimmed,
            url: '',
          });
        }
      });
    }
  } else if (plainText && plainText.trim()) {
    // Düz metin: çift satır boşluğu veya tek satır boşluklarına göre ayır
    const paragraphs = plainText.split(/\r?\n\s*\r?\n/).filter((p) => p.trim());
    if (paragraphs.length > 1) {
      paragraphs.forEach((p) => {
        blocks.push({
          id: generateBlockId(),
          type: 'paragraph',
          text: p.trim().replace(/\r?\n/g, '<br/>'),
          url: '',
        });
      });
    } else {
      const singleLines = plainText.split(/\r?\n/).filter((p) => p.trim());
      singleLines.forEach((p) => {
        blocks.push({
          id: generateBlockId(),
          type: 'paragraph',
          text: p.trim(),
          url: '',
        });
      });
    }
  }

  return blocks;
}

/**
 * Readixon ContentBlock[] dizisini, serbest metin (Word / Wattpad) editöründe
 * kesintisiz gösterilmek üzere akıcı HTML metnine dönüştürür.
 */
export function contentBlocksToHtml(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
          return `<p>${b.text || ''}</p>`;
        case 'quote':
          return `<blockquote><p>${b.text || ''}</p></blockquote>`;
        case 'divider':
          return `<hr/>`;
        case 'image':
          return `<figure><img src="${b.url || ''}" alt="${b.text || ''}"/><figcaption>${b.text || ''}</figcaption></figure>`;
        case 'end_of_chapter':
          return `<p style="text-align: center; color: var(--primary);"><strong>— BÖLÜM SONU —</strong></p>`;
        case 'end_of_story':
          return `<p style="text-align: center; color: var(--primary);"><strong>— HİKAYE SONU —</strong></p>`;
        default:
          return `<p>${b.text || ''}</p>`;
      }
    })
    .join('\n');
}

/**
 * HTML içindeki saf kelime sayısını hesaplar.
 */
export function countWordsInHtml(html: string): number {
  if (!html) return 0;
  const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanText) return 0;
  return cleanText.split(/\s+/).filter(Boolean).length;
}
