// Tencent CDN sits between Cloudflare and COS. Refresh only release entrypoints, never artwork.
const crypto = require('node:crypto');
const https = require('node:https');
const {SECRET_ID, SECRET_KEY} = process.env;
if (!SECRET_ID || !SECRET_KEY) throw new Error('Tencent CDN purge needs the existing deployment credentials.');
const host='cdn.tencentcloudapi.com', service='cdn';
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const hmac=(key,value,encoding)=>crypto.createHmac('sha256',key).update(value).digest(encoding);
async function call(action,params) {
  const payload=JSON.stringify(params), timestamp=Math.floor(Date.now()/1000), date=new Date(timestamp*1000).toISOString().slice(0,10);
  const contentType='application/json; charset=utf-8';
  const canonicalHeaders=`content-type:${contentType}\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders='content-type;host;x-tc-action';
  const canonicalRequest=['POST','/','',canonicalHeaders,signedHeaders,sha(payload)].join('\n');
  const scope=`${date}/${service}/tc3_request`;
  const stringToSign=`TC3-HMAC-SHA256\n${timestamp}\n${scope}\n${sha(canonicalRequest)}`;
  const signingKey=hmac(hmac(hmac('TC3'+SECRET_KEY,date),service),'tc3_request');
  const signature=hmac(signingKey,stringToSign,'hex');
  const authorization=`TC3-HMAC-SHA256 Credential=${SECRET_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return new Promise((resolve,reject)=>{
    const request=https.request({host,path:'/',method:'POST',headers:{'Content-Type':contentType,'Content-Length':Buffer.byteLength(payload),'X-TC-Action':action,'X-TC-Timestamp':timestamp,'X-TC-Version':'2018-06-06',Authorization:authorization}},response=>{
      let raw='';response.setEncoding('utf8');response.on('data',part=>raw+=part);response.on('end',()=>{try{const data=JSON.parse(raw).Response;if(data.Error)reject(new Error(`Tencent CDN: ${data.Error.Code}`));else resolve(data);}catch{reject(new Error('Invalid Tencent CDN response'));}});
    });
    request.on('error',()=>reject(new Error('Tencent CDN connection failed')));
    request.setTimeout(25000,()=>request.destroy());request.end(payload);
  });
}
(async()=>{
  const paths=['/','/index.html','/sw.js','/sw-upgrade.js','/manifest.webmanifest','/registerSW.js','/content/works.json','/content/site.json','/admin/','/admin/index.html','/admin/config.yml','/admin/studio.js?v=20261101-1','/admin/studio.css?v=20261101-1','/admin/preview.css?v=20261101-1'];
  const result=await call('PurgeUrlsCache',{Urls:paths.map(path=>'https://www.koogdesign.top'+path)});
  console.log(`Tencent CDN purge submitted: ${paths.length} entrypoints. Task ${result.TaskId}`);
  for(let attempt=0;attempt<18;attempt++) {
    const status=await call('DescribePurgeTasks',{TaskId:result.TaskId,Limit:100});
    const logs=status.PurgeLogs||[];
    if(logs.some(log=>log.Status==='fail'))throw new Error('Tencent CDN purge reported a failed URL');
    if(logs.length && logs.every(log=>log.Status==='done')) {console.log('Tencent CDN entrypoint purge completed. Artwork caches retained.');return;}
    await new Promise(done=>setTimeout(done,5000));
  }
  throw new Error('Tencent CDN purge is still processing; check the task in the CDN console.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
