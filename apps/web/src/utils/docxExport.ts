'use client';

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  UnderlineType,
} from 'docx';
import type { Chapter, Story, ContentBlock, ColumnArticle, ChatStoryCharacter } from '@readixon/core';

/**
 * Dosya adı için güvenli karakter temizleyici
 */
function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100);
}

interface TextStyle {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  size?: number;
  color?: string;
}

type HeadingLevelValue = (typeof HeadingLevel)[keyof typeof HeadingLevel];

/**
 * Metin içindeki basit Markdown etiketlerini (**kalın**, *italik*) ayrıştırarak TextRun dizisine çevirir.
 */
function parseMarkdownTextRuns(text: string, style: TextStyle): TextRun[] {
  if (!text) return [];

  const runs: TextRun[] = [];
  const baseSize = style.size || 24;
  const baseColor = style.color || '1F2937';

  // Regex ile **bold** ve *italic* eşleşmelerini yakala
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = text.split(regex);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          font: 'Georgia',
          size: baseSize,
          bold: true,
          italics: style.italics || false,
          color: baseColor,
          underline: style.underline ? { type: UnderlineType.SINGLE } : undefined,
          strike: style.strike,
        })
      );
    } else if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: 'Georgia',
          size: baseSize,
          bold: style.bold || false,
          italics: true,
          color: baseColor,
          underline: style.underline ? { type: UnderlineType.SINGLE } : undefined,
          strike: style.strike,
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: part,
          font: 'Georgia',
          size: baseSize,
          bold: style.bold || false,
          italics: style.italics || false,
          color: baseColor,
          underline: style.underline ? { type: UnderlineType.SINGLE } : undefined,
          strike: style.strike,
        })
      );
    }
  }

  return runs;
}

/**
 * Bir DOM elementinin içindeki inline etiketleri (strong, em, u, s, span, text)
 * özyinelemeli (recursive) olarak dolaşarak TextRun dizisi üretir.
 */
function collectInlineNodes(node: Node, style: TextStyle): TextRun[] {
  const runs: TextRun[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      // TEXT NODE
      let rawText = child.nodeValue || '';
      // Non-breaking space (&nbsp;) ve temizlik
      rawText = rawText.replace(/\u00A0/g, ' ');
      if (!rawText) continue;

      runs.push(...parseMarkdownTextRuns(rawText, style));
    } else if (child.nodeType === 1) {
      // ELEMENT NODE
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'br') {
        runs.push(new TextRun({ break: 1 }));
        continue;
      }

      const nextStyle: TextStyle = { ...style };
      if (tag === 'strong' || tag === 'b') nextStyle.bold = true;
      if (tag === 'em' || tag === 'i') nextStyle.italics = true;
      if (tag === 'u') nextStyle.underline = true;
      if (tag === 's' || tag === 'strike' || tag === 'del') nextStyle.strike = true;

      // Inline style kontrolü
      if (el.style) {
        if (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight || '0', 10) >= 600) {
          nextStyle.bold = true;
        }
        if (el.style.fontStyle === 'italic') {
          nextStyle.italics = true;
        }
        if (el.style.textDecoration?.includes('underline')) {
          nextStyle.underline = true;
        }
        if (el.style.textDecoration?.includes('line-through')) {
          nextStyle.strike = true;
        }
      }

      runs.push(...collectInlineNodes(el, nextStyle));
    }
  }

  return runs;
}

/**
 * Belirli TextRun dizisini alıp uygun mizanpaj özellikleriyle Paragraph nesnesine sarar.
 */
function createParagraphForRuns(
  runs: TextRun[],
  opts?: {
    heading?: HeadingLevelValue;
    isQuote?: boolean;
    spacing?: { before?: number; after?: number; line?: number };
  }
): Paragraph {
  if (opts?.isQuote) {
    return new Paragraph({
      indent: { left: 720, right: 360 }, // 0.5 inç sol girinti
      spacing: opts.spacing || { before: 200, after: 200, line: 300 },
      border: {
        left: {
          color: '6366F1', // Indigo sol dikey çizgi
          space: 14,
          style: BorderStyle.SINGLE,
          size: 24, // 3pt
        },
      },
      children: runs,
    });
  }

  return new Paragraph({
    heading: opts?.heading,
    spacing: opts?.spacing || { after: 180, line: 320 },
    children: runs,
  });
}

/**
 * DOMParser desteklenmeyen ortamlarda regex ile HTML temizleyip paragraflara bölen yedek motor.
 */
function parseFallbackHtml(rawHtml: string, style: TextStyle, isQuote?: boolean): Paragraph[] {
  let clean = rawHtml
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<[^>]+>/g, '');

  const lines = clean.split(/\r?\n/).map((l) => l.trim());
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    if (!line) {
      paragraphs.push(new Paragraph({ spacing: { after: 180 } }));
      continue;
    }
    const runs = parseMarkdownTextRuns(line, style);
    paragraphs.push(createParagraphForRuns(runs, { isQuote }));
  }

  return paragraphs.length > 0 ? paragraphs : [new Paragraph({ spacing: { after: 180 } })];
}

/**
 * HTML metnini veya düz metni çözümleyerek Microsoft Word OpenXML paragraf ve TextRun dizisine dönüştürür.
 * HTML etiketlerini (<p>, <strong>, <em>, <u>, <s>, <br>, <h1>-<h3>, <blockquote>, <ul>, <ol> vb.) Word nesnelerine çevirir.
 */
function parseHtmlToDocxParagraphs(
  rawInput: string,
  options?: {
    isQuote?: boolean;
    defaultStyle?: { bold?: boolean; italics?: boolean; color?: string; size?: number };
  }
): Paragraph[] {
  if (!rawInput || !rawInput.trim()) {
    return [new Paragraph({ spacing: { after: 180 } })];
  }

  const baseSize = options?.defaultStyle?.size || (options?.isQuote ? 23 : 24);
  const baseColor = options?.defaultStyle?.color || (options?.isQuote ? '4B5563' : '1F2937');
  const baseBold = options?.defaultStyle?.bold || false;
  const baseItalics = options?.defaultStyle?.italics || Boolean(options?.isQuote);

  const defaultTextStyle: TextStyle = {
    bold: baseBold,
    italics: baseItalics,
    underline: false,
    strike: false,
    size: baseSize,
    color: baseColor,
  };

  // 1. Tarayıcı DOMParser ile tam DOM ağacına ayrıştır
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawInput, 'text/html');
      const body = doc.body;

      const paragraphs: Paragraph[] = [];
      const blockTags = new Set([
        'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'li', 'hr', 'ul', 'ol', 'section', 'article'
      ]);

      // Body içinde blok etiketleri var mı kontrol et
      const childElements = Array.from(body.children);
      const hasBlockChildren = childElements.some((el) => blockTags.has(el.tagName.toLowerCase()));

      if (!hasBlockChildren) {
        // Üst düzey blok etiketi yoksa (örneğin sadece metin veya inline <strong> vs.)
        const runs = collectInlineNodes(body, defaultTextStyle);
        if (runs.length > 0) {
          paragraphs.push(
            createParagraphForRuns(runs, {
              isQuote: options?.isQuote,
              spacing: { after: 180, line: 320 },
            })
          );
        }
        return paragraphs.length > 0 ? paragraphs : [new Paragraph({ spacing: { after: 180 } })];
      }

      // Blok etiketlerini sırayla Word paragraflarına dönüştür
      for (const node of Array.from(body.childNodes)) {
        if (node.nodeType === 3) {
          // Metin düğümü (blokların arasında kalmış serbest metin)
          const text = (node.nodeValue || '').replace(/\u00A0/g, ' ').trim();
          if (text) {
            const runs = parseMarkdownTextRuns(text, defaultTextStyle);
            if (runs.length > 0) {
              paragraphs.push(
                createParagraphForRuns(runs, {
                  isQuote: options?.isQuote,
                  spacing: { after: 180, line: 320 },
                })
              );
            }
          }
          continue;
        }

        if (node.nodeType !== 1) continue;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // Bölücü (Divider / HR)
        if (tag === 'hr') {
          paragraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 320, after: 320 },
              children: [
                new TextRun({
                  text: '•   •   •',
                  font: 'Georgia',
                  size: 28,
                  bold: true,
                  color: '9CA3AF',
                }),
              ],
            })
          );
          continue;
        }

        // Alıntı (Blockquote)
        if (tag === 'blockquote') {
          const runs = collectInlineNodes(el, {
            ...defaultTextStyle,
            italics: true,
            color: '4B5563',
            size: 23,
          });
          if (runs.length > 0) {
            paragraphs.push(createParagraphForRuns(runs, { isQuote: true }));
          }
          continue;
        }

        // Liste (UL / OL)
        if (tag === 'ul' || tag === 'ol') {
          const lis = Array.from(el.querySelectorAll('li'));
          lis.forEach((li, idx) => {
            const prefix = tag === 'ol' ? `${idx + 1}. ` : '• ';
            const runs = [
              new TextRun({
                text: prefix,
                font: 'Georgia',
                size: defaultTextStyle.size,
                bold: true,
                color: '6366F1',
              }),
              ...collectInlineNodes(li, defaultTextStyle),
            ];
            paragraphs.push(
              new Paragraph({
                indent: { left: 360 },
                spacing: { after: 120, line: 300 },
                children: runs,
              })
            );
          });
          continue;
        }

        // Başlıklar (H1, H2, H3...)
        let heading: HeadingLevelValue | undefined;
        let headingSize = defaultTextStyle.size;
        let headingColor = '111827';

        if (tag === 'h1') {
          heading = HeadingLevel.HEADING_1;
          headingSize = 34; // 17pt
          headingColor = '111827';
        } else if (tag === 'h2') {
          heading = HeadingLevel.HEADING_2;
          headingSize = 28; // 14pt
          headingColor = '1F2937';
        } else if (tag === 'h3') {
          heading = HeadingLevel.HEADING_3;
          headingSize = 26; // 13pt
          headingColor = '374151';
        }

        const runs = collectInlineNodes(el, {
          ...defaultTextStyle,
          size: headingSize,
          bold: heading ? true : defaultTextStyle.bold,
          color: headingColor,
        });

        const textContent = el.textContent?.trim() || '';
        if (!textContent && runs.length === 0) {
          // Boş satır (satır arası boşluk)
          paragraphs.push(new Paragraph({ spacing: { after: 180 } }));
          continue;
        }

        paragraphs.push(
          createParagraphForRuns(runs, {
            heading,
            isQuote: options?.isQuote,
            spacing: {
              before: heading ? 240 : (options?.isQuote ? 200 : 0),
              after: options?.isQuote ? 200 : 180,
              line: 320,
            },
          })
        );
      }

      return paragraphs.length > 0 ? paragraphs : [new Paragraph({ spacing: { after: 180 } })];
    } catch (e) {
      console.warn('DOMParser failed, falling back to regex parser:', e);
    }
  }

  // 2. Fallback: DOMParser bulunamayan ortamlarda temiz regex ayrıştırıcı
  return parseFallbackHtml(rawInput, defaultTextStyle, options?.isQuote);
}

/**
 * Hikaye Bölümünü profesyonel, yapısı bozulmayan Word (.docx) belgesine dönüştürür ve indirir.
 */
export async function exportChapterToDocx(options: {
  story?: Story | null;
  chapter: Chapter;
  authorName?: string;
}): Promise<void> {
  const { story, chapter, authorName } = options;
  const storyTitle = story?.title || 'Readixon Hikayesi';
  const chapterTitle = chapter.title || `Bölüm ${chapter.order || 1}`;

  // Toplam kelime sayısı hesapla (HTML etiketlerini temizleyerek gerçek kelime sayısını bul)
  let totalWords = 0;
  if (chapter.contentBlocks && chapter.contentBlocks.length > 0) {
    for (const b of chapter.contentBlocks) {
      if (b.text) {
        const plain = b.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        totalWords += plain.split(/\s+/).filter(Boolean).length;
      }
    }
  }

  const paragraphs: Paragraph[] = [];

  // 1. Hikaye Üst Başlığı (Kategori / Seri Bilgisi)
  paragraphs.push(
    new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: storyTitle.toUpperCase(),
          font: 'Georgia',
          size: 20, // 10pt
          bold: true,
          color: '6366F1', // Primary accent
        }),
      ],
    })
  );

  // 2. Bölüm Başlığı (Büyük H1)
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: chapterTitle,
          font: 'Georgia',
          size: 44, // 22pt
          bold: true,
          color: '111827',
        }),
      ],
    })
  );

  // 3. Bölüm Üst Bilgi Şeridi (Yazar, Tarih, Kelime Sayısı, İnce Çizgi)
  const formattedDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  paragraphs.push(
    new Paragraph({
      spacing: { before: 0, after: 400 },
      border: {
        bottom: {
          color: 'E5E7EB',
          space: 12,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: `Yazar: ${authorName || story?.authorName || 'Bilinmiyor'}   •   Tarih: ${formattedDate}   •   ${totalWords} Kelime`,
          font: 'Georgia',
          size: 18, // 9pt
          italics: true,
          color: '6B7280',
        }),
      ],
    })
  );

  // 4. İçerik Bloklarını Yapısal Olarak Dönüştür
  if (chapter.contentBlocks && chapter.contentBlocks.length > 0) {
    for (const block of chapter.contentBlocks) {
      // Paragraf Bloğu (HTML veya düz metin)
      if (block.type === 'paragraph') {
        paragraphs.push(
          ...parseHtmlToDocxParagraphs(block.text || '', {
            defaultStyle: {
              bold: block.textStyle === 'bold',
              italics: block.textStyle === 'italic',
            },
          })
        );
      }

      // Alıntı (Quote) Bloğu (HTML veya düz metin)
      else if (block.type === 'quote') {
        paragraphs.push(
          ...parseHtmlToDocxParagraphs(block.text || '', {
            isQuote: true,
            defaultStyle: {
              italics: true,
              color: '4B5563',
              size: 23,
            },
          })
        );
      }

      // Bölüm / Sahne Ayırıcı (Divider)
      else if (block.type === 'divider') {
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 320, after: 320 },
            children: [
              new TextRun({
                text: '•   •   •',
                font: 'Georgia',
                size: 28,
                bold: true,
                color: '9CA3AF',
              }),
            ],
          })
        );
      }

      // Bölüm Sonu / Hikaye Sonu Bildirimi
      else if (block.type === 'end_of_chapter' || block.type === 'end_of_story') {
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
            children: [
              new TextRun({
                text: block.type === 'end_of_story' ? '— HİKAYENİN SONU —' : '— BÖLÜMÜN SONU —',
                font: 'Georgia',
                size: 22,
                bold: true,
                italics: true,
                color: '6B7280',
              }),
            ],
          })
        );
      }

      // Görsel Bloğu
      else if (block.type === 'image' && block.url) {
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: `[Görsel: ${block.url}]`,
                font: 'Georgia',
                size: 18,
                italics: true,
                color: '9CA3AF',
              }),
            ],
          })
        );
      }
    }
  }

  // 5. Mesaj Hikayesi (Chat Story) İçeriği Varsa
  if (chapter.chatMessages && chapter.chatMessages.length > 0) {
    const characterMap = new Map<string, ChatStoryCharacter>();
    if (story?.chatCharacters) {
      for (const char of story.chatCharacters) {
        characterMap.set(char.id, char);
      }
    }

    paragraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: 'SOHBET KAYITLARI',
            font: 'Georgia',
            size: 22,
            bold: true,
            color: '6366F1',
          }),
        ],
      })
    );

    for (const msg of chapter.chatMessages) {
      if (msg.type === 'system') {
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: `— ${msg.text || 'Sistem Bildirimi'} —`,
                font: 'Georgia',
                size: 20,
                italics: true,
                color: '9CA3AF',
              }),
            ],
          })
        );
        continue;
      }

      const char = msg.senderId ? characterMap.get(msg.senderId) : undefined;
      const charName = char?.name || (msg as any).characterName || 'Karakter';
      const isSelf = char?.isSelf ?? Boolean((msg as any).isMainCharacter);
      const timeStr = msg.time ? ` (${msg.time})` : '';

      paragraphs.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: `${charName}${timeStr}: `,
              font: 'Georgia',
              size: 22,
              bold: true,
              color: isSelf ? '4F46E5' : '111827',
            }),
            new TextRun({
              text: msg.type === 'image' ? `[Görsel: ${msg.mediaUrl || ''}]` : `"${msg.text || ''}"`,
              font: 'Georgia',
              size: 22,
              italics: msg.type === 'image',
              color: msg.type === 'image' ? '6B7280' : '374151',
            }),
          ],
        })
      );
    }
  }

  // 6. Bölüm Sonu Etkinliği / Okur Anketi Varsa
  if (chapter.endActivity) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 400, after: 140 },
        border: {
          top: {
            color: 'E5E7EB',
            space: 12,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: chapter.endActivity.type === 'poll' ? 'BÖLÜM ANKETİ' : 'OKURA SORU',
            font: 'Georgia',
            size: 20,
            bold: true,
            color: '6366F1',
          }),
        ],
      })
    );

    paragraphs.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: chapter.endActivity.question,
            font: 'Georgia',
            size: 22,
            italics: true,
            color: '1F2937',
          }),
        ],
      })
    );

    if (chapter.endActivity.options) {
      chapter.endActivity.options.forEach((opt, idx) => {
        paragraphs.push(
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${String.fromCharCode(65 + idx)}) ${opt}`,
                font: 'Georgia',
                size: 20,
                color: '4B5563',
              }),
            ],
          })
        );
      });
    }
  }

  // 7. İnteraktif Hikaye Seçenekleri (Seçimler)
  if (chapter.choices && chapter.choices.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 300, after: 140 },
        children: [
          new TextRun({
            text: 'BÖLÜM SEÇENEKLERİ',
            font: 'Georgia',
            size: 20,
            bold: true,
            color: '6366F1',
          }),
        ],
      })
    );

    chapter.choices.forEach((c, idx) => {
      paragraphs.push(
        new Paragraph({
          indent: { left: 360 },
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `${idx + 1}. Seçenek: `,
              font: 'Georgia',
              size: 20,
              bold: true,
              color: '1F2937',
            }),
            new TextRun({
              text: c.text,
              font: 'Georgia',
              size: 20,
              color: '4B5563',
            }),
          ],
        })
      );
    });
  }

  // ── DOCX Belgesini Oluştur ──
  const doc = new Document({
    title: `${storyTitle} - ${chapterTitle}`,
    description: `Readixon Yazar Stüdyosu'ndan dışa aktarılan bölüm.`,
    creator: authorName || 'Readixon Yazar Stüdyosu',
    styles: {
      default: {
        document: {
          run: {
            font: 'Georgia',
            size: 24, // 12pt
            color: '1F2937',
          },
          paragraph: {
            spacing: {
              line: 320,
              after: 180,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inç (2.54 cm)
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Readixon • ${storyTitle}`,
                    font: 'Georgia',
                    size: 18,
                    color: '9CA3AF',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Sayfa ',
                    font: 'Georgia',
                    size: 18,
                    color: '9CA3AF',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Georgia',
                    size: 18,
                    color: '9CA3AF',
                  }),
                  new TextRun({
                    text: ' / ',
                    font: 'Georgia',
                    size: 18,
                    color: '9CA3AF',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Georgia',
                    size: 18,
                    color: '9CA3AF',
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  // İkili (Binary) Blob Üret
  const blob = await Packer.toBlob(doc);
  const safeBase = sanitizeFileName(`${storyTitle}_Bolum_${chapter.order || 1}_${chapterTitle}`);
  const fileName = `${safeBase}.docx`;

  // Mobil & Web İndirme / Paylaşım Tetikle
  await triggerBlobDownloadOrShare(blob, fileName, `${storyTitle} - ${chapterTitle}`);
}

/**
 * Köşe Yazısını profesyonel Word (.docx) belgesi olarak dışa aktarır.
 */
export async function exportColumnToDocx(article: ColumnArticle): Promise<void> {
  const formattedDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const paragraphs: Paragraph[] = [
    // Kategori
    new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: `READİXON GÜNDEM • ${article.category.toUpperCase()}`,
          font: 'Georgia',
          size: 20,
          bold: true,
          color: '6366F1',
        }),
      ],
    }),

    // Başlık
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: article.title,
          font: 'Georgia',
          size: 44,
          bold: true,
          color: '111827',
        }),
      ],
    }),

    // Yazar & Bilgi
    new Paragraph({
      spacing: { before: 0, after: 300 },
      border: {
        bottom: {
          color: 'E5E7EB',
          space: 12,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: `Yazar: ${article.authorName} (${article.authorTitle || 'Köşe Yazarı'})   •   Tarih: ${formattedDate}   •   ${article.readingTime || 2} dk okuma`,
          font: 'Georgia',
          size: 18,
          italics: true,
          color: '6B7280',
        }),
      ],
    }),
  ];

  // Spot / Alıntı
  if (article.subtitle) {
    paragraphs.push(
      ...parseHtmlToDocxParagraphs(article.subtitle, {
        isQuote: true,
        defaultStyle: {
          italics: true,
          color: '374151',
          size: 24,
        },
      })
    );
  }

  // Gövde Metni (HTML veya düz metin)
  if (article.content) {
    paragraphs.push(...parseHtmlToDocxParagraphs(article.content));
  }

  const doc = new Document({
    title: article.title,
    description: article.subtitle || 'Readixon Gündem Köşe Yazısı',
    creator: article.authorName,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Readixon Gündem Kalemleri',
                    font: 'Georgia',
                    size: 18,
                    color: '9CA3AF',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${sanitizeFileName(article.title)}.docx`;
  await triggerBlobDownloadOrShare(blob, fileName, article.title);
}

/**
 * Hem mobil cihazlarda (iOS/Android/Tablet) hem de masaüstü PC tarayıcılarında
 * en iyi kullanıcı deneyimiyle indirme ve paylaşım sağlar.
 */
async function triggerBlobDownloadOrShare(blob: Blob, fileName: string, title: string): Promise<void> {
  const file = new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  // Mobil & Tablet Cihaz Kontrolü
  const isMobileOrTablet =
    typeof window !== 'undefined' &&
    (navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  // Mobil / Tablet cihazlarda Web Share API destekleniyorsa doğrudan Word açma / Paylaşma menüsü açılır
  if (isMobileOrTablet && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: `${title} - Word Belgesi (.docx)`,
      });
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Kullanıcı paylaşım menüsünü kapattıysa sessizce dön
    }
  }

  // PC / Masaüstü ve paylaşım desteklemeyen tarayıcılarda doğrudan dosya indirmesi
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}
