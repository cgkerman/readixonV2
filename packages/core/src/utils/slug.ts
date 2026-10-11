/**
 * Metni URL dostu bir slug'a çevirir (Türkçe karakterleri dönüştürür).
 */
export const slugify = (text: string): string => {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  
  let slug = text.replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match]);
  
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Alfasayısal olmayanları sil
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tireye çevir
    .replace(/^-+|-+$/g, ''); // Başta ve sondaki tireleri temizle
    
  return slug || 'hikaye';
};

/**
 * Story ID ve Başlıktan benzersiz bir URL slug'ı üretir.
 * Örn: Kızıl Sokak -> kizil-sokak-12345
 */
export const generateStorySlug = (title: string, storyId: string): string => {
  return `${slugify(title)}-${storyId}`;
};

/**
 * Slug içerisinden Story ID'yi ayıklar.
 * Son tireden (-) sonrasını ID olarak kabul eder.
 */
export const extractStoryIdFromSlug = (slug: string): string => {
  const parts = slug.split('-');
  return parts[parts.length - 1];
};

/**
 * Series ID ve Başlıktan benzersiz bir URL slug'ı üretir.
 * Örn: Gölge Krallığı -> golge-kralligi-serisi-12345
 */
export const generateSeriesSlug = (title: string, seriesId: string): string => {
  return `${slugify(title)}-${seriesId}`;
};

export const extractSeriesIdFromSlug = (slug: string): string => {
  const parts = slug.split('-');
  return parts[parts.length - 1];
};

/**
 * Universe ID ve Başlıktan benzersiz bir URL slug'ı üretir.
 * Örn: Kızıl Pelerin Evreni -> kizil-pelerin-evreni-12345
 */
export const generateUniverseSlug = (title: string, universeId: string): string => {
  return `${slugify(title)}-${universeId}`;
};

export const extractUniverseIdFromSlug = (slug: string): string => {
  const parts = slug.split('-');
  return parts[parts.length - 1];
};
