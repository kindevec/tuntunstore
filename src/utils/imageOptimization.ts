/**
 * Redimensiona imágenes grandes (fotos de cámara 4K+) a un tamaño manejable
 * para evitar que el navegador se quede sin memoria en celulares de gama baja.
 * Retorna un nuevo File con la imagen redimensionada, o el original si ya es pequeña.
 */
export const resizeImageForProcessing = (file: File, maxDimension = 1200): Promise<File> => {
  return new Promise((resolve) => {
    // Si el archivo es menor a 500KB, no vale la pena redimensionar
    if (file.size < 500 * 1024) {
      return resolve(file);
    }

    // Timeout de seguridad: si en 6 segundos no se redimensiona, continuar con el original
    const timeoutId = setTimeout(() => {
      console.warn('resizeImageForProcessing: Timeout alcanzado, usando imagen original.');
      resolve(file);
    }, 6000);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // Si la imagen ya es pequeña, devolver original
        if (img.width <= maxDimension && img.height <= maxDimension) {
          clearTimeout(timeoutId);
          return resolve(file);
        }

        // Calcular nuevas dimensiones manteniendo proporción
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > newHeight) {
          if (newWidth > maxDimension) {
            newHeight = Math.round((newHeight * maxDimension) / newWidth);
            newWidth = maxDimension;
          }
        } else {
          if (newHeight > maxDimension) {
            newWidth = Math.round((newWidth * maxDimension) / newHeight);
            newHeight = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(timeoutId);
          return resolve(file); // Fallback: devolver original
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        const targetFormat = isPng ? 'image/jpeg' : (file.type || 'image/jpeg');

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeoutId);
            if (!blob) {
              return resolve(file); // Fallback
            }

            const cleanName = isPng ? file.name.replace(/\.png$/i, '.jpg') : file.name;
            const resizedFile = new File([blob], cleanName, {
              type: targetFormat,
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          targetFormat,
          0.85
        );
      };

      // Si la imagen no se puede cargar (formato no soportado como HEIC), devolver original
      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(file);
      };
    };

    // Si el FileReader falla, devolver original
    reader.onerror = () => {
      clearTimeout(timeoutId);
      resolve(file);
    };
  });
};

export const convertImageToWebp = (
  file: File,
  quality = 0.78,
  maxSizeBytes = 120 * 1024,
  maxDimension = 1200
): Promise<File> => {
  return new Promise((resolve) => {
    // Solo omitir si ya es WebP y ya cumple el presupuesto estricto (< 120 KB), o si es GIF
    if ((file.type === 'image/webp' && file.size <= maxSizeBytes) || file.type === 'image/gif') {
      return resolve(file);
    }

    // Timeout de seguridad: si en 8 segundos no se convierte, subir la original
    const timeoutId = setTimeout(() => {
      console.warn('convertImageToWebp: Timeout alcanzado, subiendo imagen original.');
      resolve(file);
    }, 8000);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth > targetHeight && targetWidth > maxDimension) {
          targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
          targetWidth = maxDimension;
        } else if (targetHeight >= targetWidth && targetHeight > maxDimension) {
          targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
          targetHeight = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(timeoutId);
          return resolve(file); // Fallback: si falla el canvas, sube la original
        }
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        const attemptEncode = (currentQuality: number, targetMime: 'image/webp' | 'image/jpeg' = 'image/webp') => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                if (targetMime === 'image/webp') {
                  return attemptEncode(0.8, 'image/jpeg');
                }
                clearTimeout(timeoutId);
                return resolve(file);
              }

              // Si el navegador no soporta webp (retorna image/png sin comprimir), cambiar a jpeg
              if (targetMime === 'image/webp' && blob.type === 'image/png') {
                return attemptEncode(0.8, 'image/jpeg');
              }

              // Si supera el presupuesto estricto y podemos reducir calidad
              if (blob.size > maxSizeBytes && currentQuality > 0.45) {
                const nextQuality = Math.max(0.4, Number((currentQuality - 0.15).toFixed(2)));
                return attemptEncode(nextQuality, targetMime);
              }

              // Si en webp supera los 350 KB, fallback a JPEG que comprime eficientemente en Safari/iOS
              if (targetMime === 'image/webp' && blob.size > 350 * 1024) {
                return attemptEncode(0.75, 'image/jpeg');
              }

              clearTimeout(timeoutId);
              const ext = targetMime === 'image/webp' ? 'webp' : 'jpg';
              const fileName = `${baseName}.${ext}`;
              const optimizedFile = new File([blob], fileName, {
                type: targetMime,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            },
            targetMime,
            currentQuality
          );
        };

        attemptEncode(quality);
      };
      
      // Si la imagen no se puede cargar (HEIC, formatos raros), devolver original
      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(file);
      };
    };
    
    reader.onerror = () => {
      clearTimeout(timeoutId);
      resolve(file);
    };
  });
};
