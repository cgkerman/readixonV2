/**
 * Client-side image compression utility using HTML5 Canvas.
 * Resize limits defaults to 800x1200px and JPEG format to reduce size heavily without visible quality loss for web viewing.
 */

export const compressImage = (file: File, maxWidth = 800, maxHeight = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    // Check if running in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(file); // If server-side, just return original file
    }

    // Only process images
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return resolve(file); // Fallback if canvas context fails
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas back to Blob/File
        canvas.toBlob((blob) => {
          if (blob) {
            // Keep original filename but change extension to .jpg since we force image/jpeg output
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const newFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file); // Fallback to original if blob creation fails
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => resolve(file); // Fallback to original on error
    };
    
    reader.onerror = () => resolve(file); // Fallback to original on error
  });
};
