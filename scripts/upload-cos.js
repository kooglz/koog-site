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
    
    try {
      await new Promise((resolve, reject) => {
        cos.putObject({
          Bucket: BUCKET,
          Region: REGION,
          Key: key,
          Body: fs.createReadStream(filePath),
        }, function(err, data) {
          if (err) reject(err);
          else resolve(data);
        });
      });
      console.log(`✅ Uploaded: ${key}`);
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