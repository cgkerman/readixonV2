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

/**
 * Client-side image compression specifically for Webtoon slices.
 * Webtoons can be very tall, so we only restrict width (e.g. 1080px) and convert to WebP for better compression.
 */
export const compressWebtoonImage = (file: File, maxWidth = 1080, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(file);
    }
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

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return resolve(file);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const newFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

/**
 * Client-side image slicing and compression specifically for Webtoon slices.
 * Webtoons can be very tall, so we restrict width (e.g. 1080px),
 * cut them vertically if they exceed maxSliceHeight (e.g. 1600px),
 * and convert each slice to WebP for better compression.
 * Returns an array of sliced File objects.
 */
export const sliceAndCompressWebtoonImage = (
  file: File, 
  maxWidth = 1080, 
  maxSliceHeight = 1600,
  quality = 0.85
): Promise<File[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve([file]);
    }
    if (!file.type.startsWith('image/')) {
      return resolve([file]);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = async () => {
        let width = img.width;
        let height = img.height;

        // Calculate target dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // If the image is shorter than max slice height, just return it as a single compressed slice
        if (height <= maxSliceHeight) {
          try {
            const singleFile = await compressWebtoonImage(file, maxWidth, quality);
            return resolve([singleFile]);
          } catch (e) {
            return resolve([file]);
          }
        }

        // Calculate how many slices we need
        const numSlices = Math.ceil(height / maxSliceHeight);
        const slicedFiles: File[] = [];

        for (let i = 0; i < numSlices; i++) {
          // Calculate slice height in scaled space
          const sliceHeight = (i === numSlices - 1) ? (height - (i * maxSliceHeight)) : maxSliceHeight;
          
          // Map scaled coordinates back to source coordinates for drawImage
          const sourceSliceY = (i * maxSliceHeight) * (img.height / height);
          const sourceSliceHeight = sliceHeight * (img.height / height);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = sliceHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(
              img, 
              0, sourceSliceY, img.width, sourceSliceHeight, // Source mapping
              0, 0, width, sliceHeight                       // Destination drawing
            );
            
            const sliceFile = await new Promise<File | null>((res) => {
              canvas.toBlob((blob) => {
                if (blob) {
                  const newName = file.name.replace(/\.[^/.]+$/, "") + `_part${i + 1}.webp`;
                  res(new File([blob], newName, {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  }));
                } else {
                  res(null);
                }
              }, 'image/webp', quality);
            });

            if (sliceFile) {
              slicedFiles.push(sliceFile);
            }
          }
        }

        if (slicedFiles.length > 0) {
          resolve(slicedFiles);
        } else {
          resolve([file]); // fallback
        }
      };
      img.onerror = () => resolve([file]);
    };
    reader.onerror = () => resolve([file]);
  });
};
