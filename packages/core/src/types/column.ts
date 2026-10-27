import { Timestamp } from 'firebase/firestore';

export type ColumnCategory = 
  | 'literature'       // Edebiyat
  | 'culture'          // Kültür & Sanat
  | 'cinema-tv'        // Sinema & Televizyon
  | 'science-tech'     // Bilim & Teknoloji
  | 'history'          // Tarih
  | 'philosophy'       // Felsefe
  | 'society-life'     // Toplum & Yaşam
  | 'education'        // Eğitim
  | 'economy'          // Ekonomi
  | 'sports'           // Spor
  | 'general'          // Genel Görüş
  | 'critique'         // Geriye dönük uyumluluk
  | 'essay'            // Geriye dönük uyumluluk
  | 'cinema-art';      // Geriye dönük uyumluluk

export const COLUMN_CATEGORIES: { id: ColumnCategory; name: string; description: string }[] = [
  { id: 'literature', name: 'Edebiyat', description: 'Klasik ve çağdaş edebiyat, roman ve şiir tahlilleri' },
  { id: 'culture', name: 'Kültür & Sanat', description: 'Sergiler, tiyatro, plastik sanatlar ve kültürel miras' },
  { id: 'cinema-tv', name: 'Sinema & Televizyon', description: 'Film tahlilleri, dizi kritikleri ve görsel anlatı' },
  { id: 'science-tech', name: 'Bilim & Teknoloji', description: 'Yapay zeka, dijital gelecek, uzay ve bilimsel gelişmeler' },
  { id: 'history', name: 'Tarih', description: 'Tarihsel incelemeler, geçmişin edebi ve kültürel yansımaları' },
  { id: 'philosophy', name: 'Felsefe', description: 'Varlık, etik, mantık ve çağdaş düşünce akımları' },
  { id: 'society-life', name: 'Toplum & Yaşam', description: 'Gündelik hayat, sosyoloji ve insan ilişkileri' },
  { id: 'education', name: 'Eğitim', description: 'Pedagoji, öğrenme kültürü ve edebi eğitim' },
  { id: 'economy', name: 'Ekonomi', description: 'Kültür ekonomisi, yayıncılık dünyası ve küresel dinamikler' },
  { id: 'sports', name: 'Spor', description: 'Spor kültürü, rekabet felsefesi ve spor tarihi' },
  { id: 'general', name: 'Genel Görüş', description: 'Gündem analizleri, serbest düşünce ve genel edebi bakış' },
];

export type ColumnPublishingFrequency = 
  | 'weekly_multiple'  // Haftada 2 veya daha fazla
  | 'weekly_once'      // Haftada 1
  | 'biweekly'         // İki haftada 1
  | 'monthly';         // Ayda 1

export const PUBLISHING_FREQUENCY_OPTIONS: { id: ColumnPublishingFrequency; label: string; description: string }[] = [
  { id: 'weekly_multiple', label: 'Haftada 2 veya daha fazla', description: 'Yoğun edebi ve düşünsel üretim' },
  { id: 'weekly_once', label: 'Haftada 1', description: 'Düzenli haftalık köşe yazısı' },
  { id: 'biweekly', label: 'İki haftada 1', description: 'On beş günde bir derinlemesine tahlil' },
  { id: 'monthly', label: 'Ayda 1', description: 'Aylık kapsamlı dosya veya deneme' },
];

export type ColumnStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface ColumnArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string; // Spot / Kısa Özet
  content: string; // Zengin metin içeriği (HTML/Markdown)
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorUsername?: string;
  authorTitle?: string; // Örn: "Kültür-Sanat Yazarı", "Edebiyat Eleştirmeni"
  coverImage?: string;
  category: ColumnCategory;
  tags?: string[];
  status: ColumnStatus;
  rejectReason?: string;
  readingTime: number; // Dakika cinsinden tahmini okuma süresi
  isFeatured?: boolean; // Günün / Haftanın öne çıkan köşe yazısı
  stats: {
    views: number;
    likes: number;
    likedBy?: string[];
    commentCount?: number;
  };
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ColumnistApplication {
  id: string;
  userId: string;

  // 1. Kişisel Bilgiler
  fullName: string;                // Ad ve Soyad (Zorunlu)
  username: string;                // Otomatik (Readixon hesabından)
  email: string;                   // Otomatik
  penName?: string;                // Yazar adı / Mahlas (İsteğe bağlı)
  bio: string;                     // Kısa biyografi (Zorunlu)
  portfolioUrl?: string;           // Sosyal medya / Portföy bağlantısı (İsteğe bağlı)
  userAvatar?: string;

  // 2. Köşe Yazarlığı Bilgileri
  targetCategories: string[];      // Hangi alanlarda köşe yazmak istiyorsunuz? (Çoklu seçim)
  motivation: string;              // Neden Readixon'da köşe yazarı olmak istiyorsunuz? (Uzun metin)
  hasPriorExperience: boolean;     // Daha önce köşe yazarlığı veya içerik üreticiliği yaptınız mı? (Evet / Hayır)
  priorWorkLinks?: string;         // Daha önce yayımlanmış yazılarınız var mı? (Bağlantı)
  publishingFrequency: ColumnPublishingFrequency; // Ne sıklıkla yazı yayımlamayı planlıyorsunuz?
  preferredTitle?: string;         // Talep edilen unvan

  // 3. Örnek Köşe Yazısı
  sampleTitle: string;             // Yazı başlığı (Zorunlu)
  sampleCategory: string;          // Yazı kategorisi (Zorunlu)
  sampleSummary?: string;          // Yazının kısa açıklaması / spotu (İsteğe bağlı)
  sampleContent: string;           // Örnek köşe yazısı (300 - 1000 kelime)
  sampleWordCount: number;         // Kelime sayısı

  // 4. Beyan ve Onaylar
  accuracyConfirmed: boolean;      // Bilgilerin doğruluğu beyanı
  originalityConfirmed: boolean;   // Örnek yazının kendine ait olduğu ve hak ihlali yapmadığı beyanı
  editorialGuidelinesAccepted: boolean; // Readixon Köşe Yazarlığı Yayın İlkeleri onayı
  noGuaranteedAcceptanceAcknowledged: boolean; // Editoryal değerlendirmeye tabi ve kabul garantisi olmadığı
  kvkkAccepted: boolean;           // KVKK aydınlatma metni onayı

  // Geriye dönük alanlar (uyumluluk için)
  userName?: string;
  userUsername?: string;
  userBio?: string;
  expertiseArea?: string;

  // Admin İnceleme & Durum
  assignedTitle?: string;          // Admin tarafından verilen unvan
  status: ApplicationStatus;
  rejectReason?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

export interface CreateColumnInput {
  title: string;
  subtitle?: string;
  content: string;
  coverImage?: string;
  category: ColumnCategory;
  tags?: string[];
  status?: ColumnStatus;
}

export interface CreateApplicationInput {
  // 1. Kişisel Bilgiler
  fullName: string;
  penName?: string;
  bio: string;
  portfolioUrl?: string;

  // 2. Köşe Yazarlığı Bilgileri
  targetCategories: string[];
  motivation: string;
  hasPriorExperience: boolean;
  priorWorkLinks?: string;
  publishingFrequency: ColumnPublishingFrequency;
  preferredTitle?: string;

  // 3. Örnek Köşe Yazısı
  sampleTitle: string;
  sampleCategory: string;
  sampleSummary?: string;
  sampleContent: string;

  // 4. Beyan ve Onaylar
  accuracyConfirmed: boolean;
  originalityConfirmed: boolean;
  editorialGuidelinesAccepted: boolean;
  noGuaranteedAcceptanceAcknowledged: boolean;
  kvkkAccepted: boolean;

  // Geriye dönük opsiyonel alan
  expertiseArea?: string;
}
