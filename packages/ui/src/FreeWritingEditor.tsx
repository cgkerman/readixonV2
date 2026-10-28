'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, 
  Quote, List, ListOrdered, Minus, Maximize2, Minimize2, 
  FileText, Sparkles, Layers, ArrowRight, RotateCcw
} from 'lucide-react';
import { Button } from './Button';
import type { ContentBlock } from '@readixon/core/src/types';
import { htmlToContentBlocks, countWordsInHtml } from '@readixon/core/src/utils/blockParser';
// @ts-ignore
import mammoth from 'mammoth/mammoth.browser';

export interface FreeWritingEditorProps {
  initialHtml?: string;
  initialBlocks?: ContentBlock[];
  onChangeHtml?: (html: string) => void;
  onConvertToBlocks: (blocks: ContentBlock[]) => void;
  onSwitchToBlocks?: () => void;
  onDocxImport?: () => void;
}

/**
 * Editör içeriğinin görsel olarak tamamen boş olup olmadığını denetler.
 */
function checkIsEmpty(html: string): boolean {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return stripped.length === 0 && !html.includes('<img');
}

export function FreeWritingEditor({
  initialHtml = '',
  initialBlocks = [],
  onChangeHtml,
  onConvertToBlocks,
  onSwitchToBlocks,
  onDocxImport,
}: FreeWritingEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const lastEmittedHtmlRef = useRef<string>(initialHtml || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isEmpty, setIsEmpty] = useState<boolean>(() => checkIsEmpty(initialHtml));
  const [wordCount, setWordCount] = useState<number>(() => countWordsInHtml(initialHtml || ''));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [estimatedBlocks, setEstimatedBlocks] = useState<number>(() => {
    if (!initialHtml) return 0;
    return htmlToContentBlocks(initialHtml).length;
  });

  // Başlangıç HTML'ini ayarla (Cursor / Caret korumalı)
  useEffect(() => {
    if (!editorRef.current) return;

    // 1. Kural: Eğer editör odaklanmışsa (kullanıcı yazıyor veya siliyorsa) ASLA DOM'u ezme!
    const isFocused =
      typeof document !== 'undefined' &&
      (editorRef.current === document.activeElement || editorRef.current.contains(document.activeElement));
    
    if (isFocused) {
      return;
    }

    // 2. Kural: Eğer dışarıdan gelen HTML, editörün en son yaydığı (emitted) HTML ile aynıysa tekrar atama yapma
    if (isInitializedRef.current && initialHtml === lastEmittedHtmlRef.current) {
      return;
    }

    // 3. Yalnızca ilk montajda veya editör odaklı değilken dışarıdan gelen gerçek veri değişiminde yükle
    if (!isInitializedRef.current || editorRef.current.innerHTML !== initialHtml) {
      const safeHtml = initialHtml || '';
      editorRef.current.innerHTML = safeHtml;
      lastEmittedHtmlRef.current = safeHtml;
      isInitializedRef.current = true;
      setIsEmpty(checkIsEmpty(safeHtml));
      const wc = countWordsInHtml(safeHtml);
      setWordCount(wc);
      const parsed = htmlToContentBlocks(safeHtml);
      setEstimatedBlocks(parsed.length);
    }
  }, [initialHtml]);

  // Temizleme (Unmount durumunda debounce zamanlayıcısını iptal et)
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fullscreen modunda Escape tuşu dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Yazım anında canlı girdi işleyicisi (Akıcı ve Cursor Korunmalı)
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastEmittedHtmlRef.current = html;

    // Placeholder durumunu anlık güncelle
    const empty = checkIsEmpty(html);
    setIsEmpty(empty);

    // Ağır işlemleri (kelime sayımı, blok parse ve parent state güncellemesi) debounce et
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const wc = countWordsInHtml(html);
      setWordCount(wc);
      onChangeHtml?.(html);

      const parsed = htmlToContentBlocks(html);
      setEstimatedBlocks(parsed.length);
    }, 120);
  }, [onChangeHtml]);

  // Klavye tuş yakalayıcı (Tab tuşu ile girinti desteği)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
      handleInput();
    }
  };

  // Format komutları yürütücüsü
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  // Word (.docx) dosyası yükleme
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const docxHtml = result.value;

      if (editorRef.current) {
        editorRef.current.innerHTML = docxHtml;
        lastEmittedHtmlRef.current = docxHtml;
        setIsEmpty(checkIsEmpty(docxHtml));
        const wc = countWordsInHtml(docxHtml);
        setWordCount(wc);
        onChangeHtml?.(docxHtml);
        const parsed = htmlToContentBlocks(docxHtml);
        setEstimatedBlocks(parsed.length);
        onDocxImport?.();
      }
    } catch (error) {
      console.error('Word dosyası yüklenirken hata oluştu:', error);
      alert('Word dosyası okunamadı. Lütfen geçerli bir .docx dosyası seçin.');
    }

    e.target.value = '';
  };

  // Bloklara Dönüştür ve Gönder
  const handleConvert = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const currentHtml = editorRef.current?.innerHTML || '';
    onChangeHtml?.(currentHtml);
    const blocks = htmlToContentBlocks(currentHtml);
    onConvertToBlocks(blocks);
  };

  // Tahmini okuma süresi (dakika)
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={`flex flex-col transition-all duration-200 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between overflow-hidden' 
        : 'w-full'
    }`}>
      {/* ── Üst Word Araç Şeridi (Ribbon Toolbar) ── */}
      <div className="bg-card/90 border border-border/50 rounded-2xl p-2 sm:p-2.5 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10 backdrop-blur-md">
        {/* Sol Format Butonları */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Kalın */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="Kalın (Ctrl+B)"
          >
            <Bold size={16} />
          </button>

          {/* İtalik */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="İtalik (Ctrl+I)"
          >
            <Italic size={16} />
          </button>

          {/* Altı Çizili */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="Altı Çizili (Ctrl+U)"
          >
            <Underline size={16} />
          </button>

          {/* Üstü Çizili */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors hidden sm:inline-flex"
            title="Üstü Çizili"
          >
            <Strikethrough size={16} />
          </button>

          <div className="w-[1px] h-5 bg-border/60 mx-1" />

          {/* Başlık 2 */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<h2>'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="Bölüm / Sahne Başlığı (H2)"
          >
            <Heading2 size={16} />
          </button>

          {/* Başlık 3 */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<h3>'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors hidden sm:inline-flex"
            title="Alt Başlık (H3)"
          >
            <Heading3 size={16} />
          </button>

          {/* Alıntı */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<blockquote>'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="Alıntı Bloğu"
          >
            <Quote size={16} />
          </button>

          <div className="w-[1px] h-5 bg-border/60 mx-1" />

          {/* Noktalı Liste */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="Madde İşaretli Liste"
          >
            <List size={16} />
          </button>

          {/* Numaralı Liste */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors hidden sm:inline-flex"
            title="Numaralı Liste"
          >
            <ListOrdered size={16} />
          </button>

          {/* Ayırıcı Çizgi */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertHorizontalRule'); }}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title="Sahne Ayırıcı Çizgi"
          >
            <Minus size={16} />
          </button>

          <div className="w-[1px] h-5 bg-border/60 mx-1" />

          {/* Word (.docx) Yükle */}
          <label 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/10 hover:bg-primary/10 text-muted hover:text-primary transition-colors text-xs font-semibold cursor-pointer"
            title="Bilgisayarınızdaki Word (.docx) dosyasını doğrudan bu alana aktarın"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Word İçe Aktar</span>
            <input
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleDocxUpload}
            />
          </label>
        </div>

        {/* Sağ Kontroller: Tam Ekran & Bloklara Dönüştür Butonu */}
        <div className="flex items-center gap-2">
          {/* Tam Ekran / Odak Modu */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran Odak Modu'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Ana Eylem: Blok Editörüne Aktar & Böl */}
          <Button
            size="sm"
            variant="primary"
            className="font-bold text-xs h-9 px-3.5 shadow-md shadow-primary/20 flex items-center gap-1.5"
            onPress={handleConvert}
          >
            <Layers size={15} />
            <span>Blok Editörüne Aktar</span>
            <ArrowRight size={14} className="opacity-70" />
          </Button>
        </div>
      </div>

      {/* ── Roman / Word Yazım Sayfası (Writing Canvas) ── */}
      <div className={`flex-1 relative transition-all ${
        isFullscreen ? 'max-w-4xl mx-auto w-full overflow-y-auto px-4 py-6' : 'w-full'
      }`}>
        <div className="bg-card rounded-2xl border border-border/40 shadow-inner p-6 sm:p-10 md:p-14 min-h-[500px] relative transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          
          {/* Boşken gösterilen Wattpad tarzı placeholder */}
          {isEmpty && (
            <div className="absolute top-10 sm:top-14 left-6 sm:left-10 md:left-14 text-muted/40 pointer-events-none select-none text-base sm:text-lg leading-relaxed font-serif max-w-xl">
              Bölümünüzü buraya bir roman gibi arka arkaya yazın veya dışarıdan kopyalayıp yapıştırın...
              <br /><br />
              <span className="text-xs font-sans text-primary/70 bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                💡 İpucu: İstediğiniz zaman yukarıdaki <strong>"Blok Editörüne Aktar"</strong> butonuyla paragraflarınızı otomatik bloklara bölebilirsiniz.
              </span>
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full h-full min-h-[420px] outline-none text-base sm:text-lg leading-relaxed sm:leading-loose text-foreground/90 font-serif selection:bg-primary/20 space-y-4 [&_p]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-foreground/80 [&_hr]:my-6 [&_hr]:border-border/50 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_b]:font-bold [&_strong]:font-bold"
          />
        </div>
      </div>

      {/* ── Alt Canlı İstatistik Çubuğu ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Word / Wattpad Serbest Modu
          </span>
          <span className="opacity-50">•</span>
          <span>Tahmini Okuma: <strong className="text-foreground">~{readingTimeMin} dk</strong></span>
          <span className="opacity-50 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Aktarıldığında: <strong className="text-primary">{estimatedBlocks} Blok</strong> oluşacak
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full text-xs">
            {wordCount} Kelime
          </span>
          {onSwitchToBlocks && (
            <button
              type="button"
              onClick={onSwitchToBlocks}
              className="text-primary hover:underline font-semibold"
            >
              Blok Görünümüne Geç
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
