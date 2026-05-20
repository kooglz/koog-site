import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceImage = '/Users/konglingzheng/Downloads/新logo-koog/logoxinkoog.png';
const outputDir = join(__dirname, '..', 'public', 'icons');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon.ico', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'maskable-icon-512x512.png', size: 512, padding: true },
];

async function generateIcons() {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const { name, size, padding } of sizes) {
    const outputPath = join(outputDir, name);
    
    if (padding) {
      const paddingSize = Math.floor(size * 0.1);
      const innerSize = size - paddingSize * 2;
      
      await sharp(sourceImage)
        .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .extend({
          top: paddingSize,
          bottom: paddingSize,
          left: paddingSize,
          right: paddingSize,
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
    } else if (name.endsWith('.ico')) {
      const tempPath = join(outputDir, 'favicon-temp.png');
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .png()
        .toFile(tempPath);
      
      await sharp(tempPath)
        .resize(size, size)
        .toFile(outputPath);
    } else {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .png()
        .toFile(outputPath);
    }
    
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  console.log('\nAll icons generated successfully!');
  console.log(`Output directory: ${outputDir}`);
}

generateIcons().catch(console.error);
