import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = './public';

// Define optimization config per image
const imageConfigs = [
  // Product catalog images - displayed at max 200px, resize to 400px for retina
  { file: 'cofresito.png',    output: 'cofresito.webp',    width: 400, quality: 80 },
  { file: 'cofresito2.png',   output: 'cofresito2.webp',   width: 400, quality: 80 },
  { file: 'coofre.png',       output: 'coofre.webp',       width: 400, quality: 80 },
  { file: 'coofre2.png',      output: 'coofre2.webp',      width: 400, quality: 80 },
  { file: 'diamante.png',     output: 'diamante.webp',     width: 400, quality: 80 },
  { file: 'diamante-2.png',   output: 'diamante-2.webp',   width: 400, quality: 80 },
  // Logo - displayed at max 380px, resize to 500px for retina
  { file: 'logo-transparent.png', output: 'logo-transparent.webp', width: 500, quality: 85 },
  // Slides - displayed full width, resize to 1200px
  { file: 'slide1.png',       output: 'slide1.webp',       width: 1200, quality: 80 },
  { file: 'slide2.png',       output: 'slide2.webp',       width: 1200, quality: 80 },
  // Logo jpeg - used as backgrounds & small displays, resize to 600px
  { file: 'logo.jpeg',        output: 'logo.webp',         width: 600, quality: 80 },
  // Community logo - small display
  { file: 'logo-comunidad.jfif', output: 'logo-comunidad.webp', width: 400, quality: 80 },
];

async function optimizeImages() {
  console.log('🔄 Starting image optimization...\n');
  
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const config of imageConfigs) {
    const inputPath = path.join(publicDir, config.file);
    const outputPath = path.join(publicDir, config.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${config.file} (not found)`);
      continue;
    }

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;

    try {
      await sharp(inputPath)
        .resize(config.width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: config.quality })
        .toFile(outputPath);

      const newSize = fs.statSync(outputPath).size;
      totalOptimized += newSize;
      
      const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`✅ ${config.file.padEnd(25)} ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024).toFixed(0)} KB  (${reduction}% smaller)`);
    } catch (err) {
      console.error(`❌ Error processing ${config.file}:`, err.message);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 TOTAL: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB → ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🎯 Reduction: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(70)}`);
}

optimizeImages().catch(console.error);
