/**
 * Resize an image file while preserving aspect ratio using Pica for high quality
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1), default 0.92
 * @returns {Promise<Blob>} - Resized image blob
 */
export async function resizeImageWithPica(file, maxWidth = 2048, maxHeight = 2048, quality = 0.92) {
  // Dynamically import Pica to avoid SSR issues
  const Pica = (await import('pica')).default;
  const pica = new Pica();

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions while preserving aspect ratio
      const { width: newWidth, height: newHeight } = calculateAspectRatioFit(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Create source canvas
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      const sourceCtx = sourceCanvas.getContext('2d');
      sourceCtx.drawImage(img, 0, 0);

      // Create destination canvas
      const destCanvas = document.createElement('canvas');
      destCanvas.width = newWidth;
      destCanvas.height = newHeight;

      try {
        // Use Pica for high-quality resize
        await pica.resize(sourceCanvas, destCanvas, {
          quality: 3, // 0 (fastest) to 3 (best quality)
          alpha: true,
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        });

        // Convert to blob
        const blob = await pica.toBlob(destCanvas, file.type || 'image/png', quality);
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Resize an image file while preserving aspect ratio (fallback without Pica)
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1), default 0.92
 * @returns {Promise<Blob>} - Resized image blob
 */
export async function resizeImage(file, maxWidth = 2048, maxHeight = 2048, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions while preserving aspect ratio
      const { width: newWidth, height: newHeight } = calculateAspectRatioFit(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      
      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        file.type || 'image/png',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculate dimensions that fit within max bounds while preserving aspect ratio
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {{width: number, height: number}} - New dimensions
 */
export function calculateAspectRatioFit(width, height, maxWidth, maxHeight) {
  const aspectRatio = width / height;
  
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  return { width: newWidth, height: newHeight };
}
