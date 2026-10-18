"use client";

import React, { useEffect, useState } from 'react';
import { type LegalDocument, type LegalDocType, getLegalDocument, sanitizeHtml } from '@readixon/core';
import { ShieldCheck, Scale, FileText, Calendar, CheckCircle2 } from 'lucide-react';

interface LegalDocumentViewProps {
  documentType: LegalDocType;
  initialData: LegalDocument;
  previewDoc?: LegalDocument;
}

export function LegalDocumentView({ documentType, initialData, previewDoc }: LegalDocumentViewProps) {
  const [docData, setDocData] = useState<LegalDocument>(previewDoc || initialData);
  const [isLoading, setIsLoading] = useState(!previewDoc);

  useEffect(() => {
    if (previewDoc) {
      setDocData(previewDoc);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchDoc() {
      try {
        const fetched = await getLegalDocument(documentType);
        if (isMounted && fetched) {
          setDocData(fetched);
        }
      } catch (err) {
        console.warn(`[LegalDocumentView] ${documentType} dokümanı çekilemedi, başlangıç verisi kullanılıyor:`, err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDoc();

    return () => {
      isMounted = false;
    };
  }, [documentType, previewDoc]);

  const currentDoc = previewDoc || docData;

  const getDocIcon = () => {
    switch (documentType) {
      case 'terms':
        return <FileText className="w-6 h-6 text-primary" />;
      case 'privacy':
        return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case 'copyright':
        return <Scale className="w-6 h-6 text-amber-500" />;
      case 'guidelines':
        return <CheckCircle2 className="w-6 h-6 text-indigo-400" />;
      default:
        return <FileText className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <article className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 md:p-12 shadow-sm transition-all duration-200">
      {/* Üst Bilgi Başlığı */}
      <header className="border-b border-border/40 pb-8 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-card border border-border/60 shadow-inner">
            {getDocIcon()}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Resmi Yasal Belge
            </span>
            {currentDoc.version && (
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted/20 text-muted-foreground border border-border/50">
                Sürüm {currentDoc.version}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3 leading-snug">
          {currentDoc.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground/70" />
            <span>Yürürlük Tarihi: <strong className="text-foreground">{currentDoc.effectiveDate || 'Belirtilmedi'}</strong></span>
          </div>
          {currentDoc.description && (
            <span className="hidden sm:inline text-muted-foreground/60">•</span>
          )}
          {currentDoc.description && (
            <span className="text-muted-foreground/90">{currentDoc.description}</span>
          )}
        </div>
      </header>

      {/* Giriş / Özet Paragrafı */}
      {currentDoc.leadText && (
        <div className="mb-8 p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/15 text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
          {currentDoc.leadText}
        </div>
      )}

      {/* Maddeler / İçerik */}
      {currentDoc.sections && currentDoc.sections.length > 0 ? (
        <div className="space-y-10 text-foreground/80 leading-relaxed text-sm sm:text-base">
          {currentDoc.sections.map((section, idx) => (
            <section 
              key={section.id || idx} 
              id={section.id || `section-${idx + 1}`}
              className="scroll-mt-24 pt-2 first:pt-0"
            >
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-primary inline-block"></span>
                <span>{section.title}</span>
              </h2>
              <div 
                className="space-y-4 text-foreground/85 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2.5 [&_ul]:ml-2 [&_li]:leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary [&_a]:font-medium [&_a]:hover:underline [&_address]:not-italic [&_address]:space-y-2 [&_address]:border-l-4 [&_address]:border-primary/30 [&_address]:pl-4 [&_address]:py-2 [&_address]:my-3 [&_address]:bg-muted/10 [&_address]:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
              />
            </section>
          ))}
        </div>
      ) : currentDoc.rawContent ? (
        <div 
          className="space-y-4 text-foreground/85 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_strong]:text-foreground [&_a]:text-primary [&_a]:hover:underline"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentDoc.rawContent) }}
        />
      ) : null}

      {/* Footer Bildirimi */}
      <footer className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Readixon • Turixon San. ve Tic. Ltd. Şti. Tüm hakları saklıdır.</p>
        <p className="italic">Son Hukuki İnceleme: {currentDoc.effectiveDate || '2026'}</p>
      </footer>
    </article>
  );
}
