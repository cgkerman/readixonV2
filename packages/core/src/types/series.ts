import type { Timestamp } from 'firebase/firestore';

export type SeriesStatus = 'ongoing' | 'completed';

export interface SeriesBookItem {
  storyId: string;
  order: number;            // 1, 2, 3... (Sıralama)
  customLabel?: string;     // Örn: "1. Cilt", "Başlangıç Kitabı", "Prequel"
}

export interface SeriesStats {
  totalViews: number;       // Serideki tüm kitapların toplam okunması
  totalLikes: number;       // Serideki tüm kitapların toplam beğenisi
  bookCount: number;        // Serideki toplam kitap sayısı
}

export interface Series {
  seriesId: string;
  universeId?: string;      // Bağlı olduğu Evren ID'si (varsa)
  universeTitle?: string;   // Bağlı olduğu Evren Başlığı
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  
  title: string;             // Seri Adı (Örn: "Gölge Krallığı Serisi")
  slug: string;              // URL dostu benzersiz kimlik (golge-kralligi-serisi-xxxx)
  description: string;       // Evren / seri hakkında genel özet
  coverImage?: string;       // Seriye özel kapak afişi
  tags: string[];            // Tür etiketleri
  
  status: SeriesStatus;      // 'ongoing' | 'completed'
  books: SeriesBookItem[];   // Seriye dahil kitaplar ve sıralaması
  
  stats: SeriesStats;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
