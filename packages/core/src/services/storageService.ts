import { ref, uploadBytesResumable, getDownloadURL, type UploadMetadata } from 'firebase/storage';
import { storage } from '../firebase';

// ─────────────────────────────────────────────
// Güvenlik & Doğrulama Sabitleri
// ─────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
] as const;

export const FORBIDDEN_EXTENSIONS = [
  '.html',
  '.htm',
  '.svg',
  '.js',
  '.mjs',
  '.ts',
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.php',
  '.phtml',
  '.py',
  '.pl',
  '.vbs'
] as const;

export const DEFAULT_MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const DEFAULT_MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15 MB

export interface UploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: readonly string[] | string[];
  allowAudio?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Dosya yüklemesi öncesinde dosya boyutu, MIME türü, uzantı ve path güvenliğini doğrular.
 */
export const validateUpload = (
  file: File | Blob,
  path: string,
  options?: UploadOptions
): { valid: boolean; error?: string; mimeType: string } => {
  // 1. Path kontrolü ve Path Traversal koruması
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return { valid: false, error: 'Dosya yolu (path) boş olamaz.', mimeType: '' };
  }

  const normalizedPath = path.replace(/\\/g, '/');
  if (
    normalizedPath.includes('..') ||
    normalizedPath.includes('//') ||
    normalizedPath.startsWith('/') ||
    /[\x00-\x1f\x7f]/.test(normalizedPath)
  ) {
    return {
      valid: false,
      error: 'Güvenlik Uyarısı: Geçersiz veya riskli dosya yolu (Path traversal engellendi).',
      mimeType: ''
    };
  }

  // 2. Tehlikeli uzantı kontrolü (path ve varsa file.name üzerinden)
  const lowerPath = normalizedPath.toLowerCase();
  const fileName = (file instanceof File ? file.name : '').toLowerCase();
  for (const ext of FORBIDDEN_EXTENSIONS) {
    if (lowerPath.endsWith(ext) || (fileName && fileName.endsWith(ext))) {
      return {
        valid: false,
        error: `Güvenlik Uyarısı: "${ext}" uzantılı dosyaların yüklenmesi yasaktır (SVG, HTML veya çalıştırılabilir kod içeremez).`,
        mimeType: ''
      };
    }
  }

  // 3. MIME Türü kontrolü
  let mimeType = file.type ? file.type.toLowerCase().trim() : '';

  // Bazı tarayıcılarda Blob veya uzantıdan mime type fallback
  if (!mimeType) {
    if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (lowerPath.endsWith('.png')) mimeType = 'image/png';
    else if (lowerPath.endsWith('.webp')) mimeType = 'image/webp';
    else if (lowerPath.endsWith('.webm')) mimeType = 'audio/webm';
    else if (lowerPath.endsWith('.mp3')) mimeType = 'audio/mpeg';
    else {
      return {
        valid: false,
        error: 'Dosya türü (MIME) tespit edilemedi. Lütfen geçerli bir görsel veya ses dosyası seçin.',
        mimeType: ''
      };
    }
  }

  // SVG ve HTML doğrudan XSS riski taşıdığı için açıkça engellenir
  if (mimeType.includes('svg') || mimeType.includes('html') || mimeType.includes('xml')) {
    return {
      valid: false,
      error: 'Güvenlik Uyarısı: SVG ve web işaretleme dosyaları (XSS riski nedeniyle) kabul edilmez.',
      mimeType
    };
  }

  // İzin verilen tür listesini belirle
  const isAudioAllowed = options?.allowAudio ?? lowerPath.includes('/audio/');
  const allowedTypes: readonly string[] = options?.allowedTypes ?? (
    isAudioAllowed 
      ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES] 
      : ALLOWED_IMAGE_TYPES
  );

  const isTypeAllowed = allowedTypes.some(allowed => 
    mimeType === allowed || (allowed.endsWith('/*') && mimeType.startsWith(allowed.replace('/*', '/')))
  );

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: `Desteklenmeyen dosya türü (${mimeType}). İzin verilen formatlar: JPEG, PNG, WebP, GIF, AVIF${isAudioAllowed ? ', WEBM, MP3' : ''}.`,
      mimeType
    };
  }

  // 4. Dosya Boyut Sınırı kontrolü
  const maxLimit = options?.maxSizeBytes ?? (isAudioAllowed ? DEFAULT_MAX_AUDIO_SIZE : DEFAULT_MAX_IMAGE_SIZE);
  if (file.size > maxLimit) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    const limitInMb = (maxLimit / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Dosya boyutu çok yüksek (${sizeInMb} MB). İzin verilen maksimum boyut: ${limitInMb} MB.`,
      mimeType
    };
  }

  return { valid: true, mimeType };
};

/**
 * Dosya (File/Blob) alıp Firebase Storage'a yükler ve indirme URL'sini (Download URL) döndürür.
 * Yükleme öncesinde dosya boyutunu, MIME türünü ve güvenlik kurallarını doğrular.
 * 
 * @param file Yüklenecek dosya nesnesi (Web'de File veya Blob)
 * @param path Yüklenecek dizin ve dosya adı (Örn: 'stories/covers/cover_123.jpg')
 * @param onProgressOrOptions İlerleme callback fonksiyonu veya gelişmiş UploadOptions nesnesi
 * @returns Başarılı olursa dosyanın public indirme URL'si
 */
export const uploadFile = async (
  file: File | Blob, 
  path: string, 
  onProgressOrOptions?: ((progress: number) => void) | UploadOptions
): Promise<string> => {
  // Geriye dönük uyumluluk: onProgress fonksiyon mu yoksa options nesnesi mi?
  const options: UploadOptions = typeof onProgressOrOptions === 'function' 
    ? { onProgress: onProgressOrOptions } 
    : (onProgressOrOptions || {});

  // 1. Güvenlik ve Boyut Doğrulaması (Validation)
  const validation = validateUpload(file, path, options);
  if (!validation.valid) {
    console.error("[Upload Security Rejected]:", validation.error, { path, size: file.size, type: file.type });
    throw new Error(validation.error || 'Dosya yükleme güvenlik doğrulaması başarısız oldu.');
  }

  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);

    // Güvenli Content-Type ve önbellekleme meta verisi
    const metadata: UploadMetadata = {
      contentType: validation.mimeType,
      cacheControl: 'public, max-age=31536000',
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0 
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
          : 0;
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
      (error) => {
        console.error("Storage yükleme hatası:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

