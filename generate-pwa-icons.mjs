import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceImagePath = path.join(__dirname, 'imagenes', 'logo sin fondo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

async function generateIcons() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if source image exists
    if (!fs.existsSync(sourceImagePath)) {
      console.error(`Source image not found at ${sourceImagePath}`);
      process.exit(1);
    }

    console.log('Generating PWA icons...');

    // 192x192 Standard PWA icon
    await sharp(sourceImagePath)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, 'pwa-192x192.png'));
    console.log('Created pwa-192x192.png');

    // 512x512 HD PWA icon
    await sharp(sourceImagePath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, 'pwa-512x512.png'));
    console.log('Created pwa-512x512.png');

    // 512x512 Maskable icon (with ~20% padding)
    // 512 * 0.6 = 307.2 (approx 308) size of the logo to have ~20% padding on each side
    const maskableLogo = await sharp(sourceImagePath)
      .resize(308, 308, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: '#07090e'
      }
    })
      .composite([{ input: maskableLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(outputDir, 'pwa-maskable-512x512.png'));
    console.log('Created pwa-maskable-512x512.png');

    // 192x192 Maskable icon (with ~20% padding)
    // 192 * 0.6 = 115.2 (approx 115)
    const maskableLogo192 = await sharp(sourceImagePath)
      .resize(115, 115, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: 192,
        height: 192,
        channels: 4,
        background: '#07090e'
      }
    })
      .composite([{ input: maskableLogo192, gravity: 'center' }])
      .png()
      .toFile(path.join(outputDir, 'pwa-maskable-192x192.png'));
    console.log('Created pwa-maskable-192x192.png');

    // 180x180 Apple touch icon (with ~20% padding on #07090e background)
    const appleLogo = await sharp(sourceImagePath)
      .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: 180,
        height: 180,
        channels: 4,
        background: '#07090e'
      }
    })
      .composite([{ input: appleLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Created apple-touch-icon.png');

    // 32x32 Favicon
    await sharp(sourceImagePath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('Created favicon-32x32.png');

    // 16x16 Favicon
    await sharp(sourceImagePath)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('Created favicon-16x16.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
