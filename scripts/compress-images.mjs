import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

const PUBLIC_DIR = join(process.cwd(), 'public');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const COMPRESS_DIRECTORIES = ['works', 'hero', 'qrcode'];
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 85;

async function* walkDirectory(dir) {
  if (!existsSync(dir)) return;
  const files = await readdir(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      yield* walkDirectory(filePath);
    } else if (stats.isFile() && IMAGE_EXTENSIONS.includes(extname(file).toLowerCase())) {
      yield filePath;
    }
  }
}

async function compressImage(inputPath) {
  const originalStats = await stat(inputPath);
  const originalSize = originalStats.size;
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  let width = metadata.width;
  let height = metadata.height;
  
  if (width && width > MAX_WIDTH) {
    height = height ? Math.round((height * MAX_WIDTH) / width) : undefined;
    width = MAX_WIDTH;
  }
  if (height && height > MAX_HEIGHT) {
    width = width ? Math.round((width * MAX_HEIGHT) / height) : undefined;
    height = MAX_HEIGHT;
  }
  
  const format = metadata.format;
  let compressed;
  
  if (format === 'png') {
    compressed = await sharp(inputPath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: QUALITY })
      .toBuffer();
  } else if (format === 'webp') {
    compressed = await sharp(inputPath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
  } else {
    compressed = await sharp(inputPath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
  }
  
  const saved = originalSize - compressed.length;
  
  if (compressed.length < originalSize) {
    await sharp(compressed).toFile(inputPath);
    return { original: originalSize, compressed: compressed.length, saved };
  }
  
  return { original: originalSize, compressed: originalSize, saved: 0 };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🗜️  KOOG 图片压缩工具                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  let totalOriginal = 0;
  let totalCompressed = 0;
  let totalSaved = 0;
  let fileCount = 0;
  
  for (const dir of COMPRESS_DIRECTORIES) {
    const fullPath = join(PUBLIC_DIR, dir);
    if (!existsSync(fullPath)) continue;
    
    console.log(`📁 扫描: public/${dir}/`);
    
    for await (const filePath of walkDirectory(fullPath)) {
      const relativePath = filePath.replace(PUBLIC_DIR, 'public');
      
      try {
        const result = await compressImage(filePath);
        
        if (result.saved > 0) {
          fileCount++;
          totalOriginal += result.original;
          totalCompressed += result.compressed;
          totalSaved += result.saved;
          
          const savedPercent = ((result.saved / result.original) * 100).toFixed(1);
          console.log(`  ✅ ${relativePath}`);
          console.log(`     ${formatBytes(result.original)} → ${formatBytes(result.compressed)} (节省 ${savedPercent}%)`);
        }
      } catch (error) {
        console.log(`  ⚠️  跳过: ${relativePath}`);
      }
    }
  }
  
  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`📊 压缩统计：`);
  console.log(`   文件数量: ${fileCount} 个`);
  console.log(`   原始大小: ${formatBytes(totalOriginal)}`);
  console.log(`   压缩后:   ${formatBytes(totalCompressed)}`);
  console.log(`   节省空间: ${formatBytes(totalSaved)} (${((totalSaved / totalOriginal) * 100).toFixed(1)}%)`);
  console.log('────────────────────────────────────────────────────────────────');
  console.log('');
}

main().catch(console.error);
