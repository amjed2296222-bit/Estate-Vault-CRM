/**
 * Image upload & compression helper for Property Media Gallery.
 * Reads device image files and compresses them to optimized Data URLs
 * for reliable local storage persistence and fast preview loading.
 */

export async function processImageFile(file: File, maxDimension: number = 1280, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`File "${file.name}" is not a valid image.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}".`));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error(`Empty image data for "${file.name}".`));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to raw dataUrl if Image element cannot decode
        resolve(dataUrl);
      };
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export async function processMultipleImageFiles(files: FileList | File[]): Promise<{
  urls: string[];
  errors: string[];
}> {
  const fileArray = Array.from(files);
  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of fileArray) {
    try {
      const processedUrl = await processImageFile(file);
      urls.push(processedUrl);
    } catch (err: any) {
      errors.push(err?.message || `Could not process ${file.name}`);
    }
  }

  return { urls, errors };
}
