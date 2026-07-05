import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Dosya (File/Blob) alıp Firebase Storage'a yükler ve indirme URL'sini (Download URL) döndürür.
 * 
 * @param file Yüklenecek dosya nesnesi (Web'de File veya Blob)
 * @param path Yüklenecek dizin ve dosya adı (Örn: 'stories/covers/cover_123.jpg')
 * @param onProgress Yükleme yüzdesini (%0 - %100) bildiren opsiyonel callback
 * @returns Başarılı olursa dosyanın public indirme URL'si
 */
export const uploadFile = async (
  file: File | Blob, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
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
