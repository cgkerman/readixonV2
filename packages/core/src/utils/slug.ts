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
