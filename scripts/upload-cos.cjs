const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

// 检查环境变量
const { SECRET_ID, SECRET_KEY, BUCKET, REGION } = process.env;
if (!SECRET_ID || !SECRET_KEY || !BUCKET || !REGION) {
  console.error('Missing required environment variables: SECRET_ID, SECRET_KEY, BUCKET, REGION');
  process.exit(1);
}

// 初始化 COS 实例
const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
});

// 遍历目录获取所有文件
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// 简单的 MIME 类型映射
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.txt': 'text/plain',
    '.xml': 'text/xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 上传文件
async function uploadFiles() {
  const distPath = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distPath)) {
    console.error('Dist directory not found!');
    process.exit(1);
  }

  const files = getAllFiles(distPath);
  console.log(`Found ${files.length} files to upload...`);

  let successCount = 0;
  let failCount = 0;

  for (const filePath of files) {
    // 计算相对路径作为 Key
    const key = path.relative(distPath, filePath).replace(/\\/g, '/'); // Windows 路径兼容
    const mimeType = getMimeType(filePath);
    
    try {
      const putObjectParams = {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: mimeType,
      };

      // 强制让浏览器/微信在线显示 HTML，而不是下载
      if (mimeType === 'text/html') {
        putObjectParams.ContentDisposition = 'inline';
        putObjectParams.CacheControl = 'no-cache'; // 避免缓存导致测试不准
      }

      await new Promise((resolve, reject) => {
        cos.putObject(putObjectParams, function(err, data) {
          if (err) reject(err);
          else resolve(data);
        });
      });
      console.log(`✅ Uploaded: ${key} (${mimeType})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed: ${key}`, err);
      failCount++;
    }
  }

  console.log('-----------------------------------');
  console.log(`Upload finished. Success: ${successCount}, Failed: ${failCount}`);
  
  if (failCount > 0) process.exit(1);
}

uploadFiles();