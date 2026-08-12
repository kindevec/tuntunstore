export const convertImageToWebp = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Si la imagen ya es webp o es un gif (no soporta animación por canvas fácilmente), se devuelve original
    if (file.type === 'image/webp' || file.type === 'image/gif') {
      return resolve(file);
    }

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
          return resolve(file); // Fallback: si falla el canvas, sube la original
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
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
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};
