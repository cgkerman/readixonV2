import { Metadata } from 'next';
import { db } from '@readixon/core';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Typography, Button } from '@readixon/ui';
import Link from 'next/link';
import { NewsViewTracker } from './NewsViewTracker';

// Type representing the params object
type Props = {
  params: { slug: string };
};

// Helper function to extract ID from our slug format: "my-title-12345"
function extractIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  const parts = slug.split('-');
  return parts.length > 0 ? parts[parts.length - 1] : slug;
}

// 1. Generate Metadata dynamically for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = extractIdFromSlug(params.slug);
  if (!id) return {};

  const docRef = doc(db, 'announcements', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { title: 'Haber Bulunamadı - Readixon' };
  }

  const data = docSnap.data();

  // Basic markdown removal just for description preview
  const plainTextDescription = data.content
    ? data.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...'
    : 'Readixon haber ve duyuruları.';

  return {
    title: `${data.title} - Readixon Haberler`,
    description: plainTextDescription,
    openGraph: {
      title: data.title,
      description: plainTextDescription,
      type: 'article',
      images: data.imageUrl ? [{ url: data.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: plainTextDescription,
      images: data.imageUrl ? [data.imageUrl] : [],
    },
  };
}

// 2. The Server Component Page
export default async function NewsDetailPage({ params }: Props) {
  const id = extractIdFromSlug(params.slug);
  if (!id) notFound();

  const docRef = doc(db, 'announcements', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const news = { id: docSnap.id, ...docSnap.data() } as any;

  return (
    <main className="min-h-screen bg-background">
      <NewsViewTracker id={news.id} />
      {/* Header Section */}
      <section className="pt-24 pb-8 max-w-4xl mx-auto px-6 md:px-12">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="bg-primary/10 text-primary text-xs md:text-sm font-bold px-4 py-2 rounded-lg border border-primary/20">
            Kültür & Sanat Gündemi
          </span>
          <div className="flex items-center gap-2 text-muted/80 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span>{news.createdAt?.toDate ? new Date(news.createdAt.toDate()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Bugün'}</span>
          </div>
        </div>
        
        <Typography variant="h1" className="font-extrabold text-3xl md:text-4xl lg:text-5xl text-text leading-tight mb-8">
          {news.title}
        </Typography>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text text-sm">Readix Editör</span>
            <span className="text-muted text-xs">Platform Duyuruları</span>
          </div>
        </div>
      </section>

      {/* Featured Image Section */}
      {news.imageUrl && (
        <section className="max-w-5xl mx-auto px-4 md:px-12 mb-4">
          <div className="w-full bg-card/30 rounded-[2rem] border border-border/50 overflow-hidden flex items-center justify-center relative">
             <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="w-full h-auto max-h-[600px] object-cover md:object-contain backdrop-blur-3xl" 
            />
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div 
          className="prose prose-invert prose-lg max-w-none text-text/90 leading-relaxed
            [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:mb-6 [&>h1]:text-text
            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:text-text
            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:text-text
            [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-6 
            [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-6
            [&_img]:rounded-2xl [&_img]:my-8 [&_img]:max-w-full [&_img]:border [&_img]:border-white/10 [&_img]:shadow-xl
            [&_a]:text-primary [&_a]:hover:underline"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
        
        {news.link && (
          <div className="mt-12 p-8 bg-card/40 border border-border rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <Typography variant="h3" className="font-bold text-text mb-2">Daha Fazla Bilgi</Typography>
              <Typography variant="body" className="text-muted">Bu konu hakkında daha detaylı bilgiye ulaşmak için kaynağa gidebilirsiniz.</Typography>
            </div>
            <a href={news.link} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="px-8 py-3 rounded-full font-bold whitespace-nowrap">
                Kaynağa Git
              </Button>
            </a>
          </div>
        )}
        
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <Link href="/agenda" className="flex items-center gap-2 text-muted hover:text-primary transition-colors font-medium">
            &larr; Gündem'e Dön
          </Link>
        </div>
      </section>
    </main>
  );
}
