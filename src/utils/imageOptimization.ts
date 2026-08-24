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

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeoutId);
            if (!blob) {
              return resolve(file); // Fallback
            }

            const resizedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          file.type || 'image/jpeg',
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

export const convertImageToWebp = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    // Si la imagen ya es webp o es un gif (no soporta animación por canvas fácilmente), se devuelve original
    if (file.type === 'image/webp' || file.type === 'image/gif') {
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
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(timeoutId);
          return resolve(file); // Fallback: si falla el canvas, sube la original
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            clearTimeout(timeoutId);
            if (!blob) {
              return resolve(file); // Fallback
            }
            
            // Extrae el nombre base sin extensión y añade .webp
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const fileName = `${baseName}.webp`;
            
            const webpFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
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
