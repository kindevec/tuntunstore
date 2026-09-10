import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'public', 'icons');

async function optimizeIcons() {
  const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

  console.log('--- Optimizing PNG Icons with Sharp ---');
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const filePath = path.join(iconsDir, file);
    const beforeStats = fs.statSync(filePath);
    totalBefore += beforeStats.size;

    const inputBuffer = fs.readFileSync(filePath);

    const optimizedBuffer = await sharp(inputBuffer)
      .png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 80,
      })
      .toBuffer();

    // Solo sobreescribir si es menor
    if (optimizedBuffer.length < beforeStats.size) {
      fs.writeFileSync(filePath, optimizedBuffer);
      totalAfter += optimizedBuffer.length;
      const savings = ((1 - optimizedBuffer.length / beforeStats.size) * 100).toFixed(1);
      console.log(`✓ ${file}: ${(beforeStats.size / 1024).toFixed(1)} KB -> ${(optimizedBuffer.length / 1024).toFixed(1)} KB (-${savings}%)`);
    } else {
      totalAfter += beforeStats.size;
      console.log(`= ${file}: ya optimizado (${(beforeStats.size / 1024).toFixed(1)} KB)`);
    }
  }

  const totalSavings = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log('---------------------------------------');
  console.log(`Total inicial: ${(totalBefore / 1024).toFixed(1)} KB`);
  console.log(`Total final:   ${(totalAfter / 1024).toFixed(1)} KB`);
  console.log(`Ahorro total:  ${((totalBefore - totalAfter) / 1024).toFixed(1)} KB (-${totalSavings}%)`);
}

optimizeIcons();
