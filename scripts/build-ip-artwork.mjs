// Rebuild portfolio boards from approved local originals; source files are never modified.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.argv[2] || '/Users/konglingzheng/Downloads/国风vibe';
const out = 'public/works/ip-20261031';
await fs.mkdir(out, { recursive: true });
const files = async dir => (await fs.readdir(path.join(root, dir))).filter(n => /^\d\d_.*\.png$/i.test(n)).sort().map(n => path.join(root, dir, n));
const duck = await files('烫头鸭续命篇_24款_2K透明PNG与Muse提示词_20261025/01_透明PNG_2048');
const hobby = await files('烫头鸭兴趣班_24款_2K透明PNG与微信静态全套_20261029/01_2K透明PNG_2048');
const life = await files('烫头鸭生活记_24款_2K透明PNG与微信动态全套_20261030/01_2K透明PNG_2048');
const china = await files('中国十大博物馆_显眼包IP_4K_PNG');
const china2 = await files('中国博物馆显眼包IP_第二辑16馆_修订版_多巴胺描边_4K');
const china3 = await files('博物馆的显眼包III_表情管理失败_九款_4K_PNG');
const world = await files('海外博物馆显眼包_第二辑12款_扁平多巴胺_4K_20261016');
const world3 = await files('海外博物馆显眼包_第三辑12款_异形多巴胺_4K_20261017');
const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const svg = (w,h,body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><style>text{font-family:Arial,'PingFang SC','Heiti SC',sans-serif;fill:#171717}</style>${body}</svg>`);
const manifest = [];
async function board(name,title,sub,images,bg='#F5F2E9',cover=false) {
 const museum = name.startsWith('museum');
 const family = museum ? 'HWMCT' : 'PingFang SC';
 const w=cover?1200:1600,h=cover?1600:images.length>6?1800:1400,cols=3,rows=Math.ceil(images.length/cols),pad=cover?65:80,top=cover?350:340;
 const cw=(w-2*pad)/cols,ch=(h-top-100)/rows;
 const layers=[{input:svg(w,h,`<rect x="${pad}" y="${pad}" width="56" height="6" fill="#E61919"/><text x="${pad}" y="${pad+57}" font-size="17" letter-spacing="5">KOOG DESIGN / CHARACTER STUDY</text><text x="${pad}" y="${pad+145}" font-family="${family}" style="font-family:${family}" font-size="${cover?76:82}" font-weight="${museum?400:700}">${esc(title)}</text><text x="${pad}" y="${pad+197}" style="font-family:${family};fill:#6a6058" font-size="${cover?28:32}">${esc(sub)}</text><text x="${pad}" y="${h-40}" font-size="16" letter-spacing="3">ORIGINAL IP COLLECTION · 2026</text>`),left:0,top:0}];
 for(let i=0;i<images.length;i++) {
  const size=Math.floor(Math.min(cw-25,ch-100));
  const input=await sharp(images[i]).trim({threshold:10}).resize(size,size,{fit:'contain',background:'#00000000'}).png().toBuffer();
  layers.push({input,left:Math.round(pad+(i%cols)*cw+(cw-size)/2),top:Math.round(top+Math.floor(i/cols)*ch)});
  if(!cover) {
   const label=path.basename(images[i],'.png').replace(/^\d+_/,'').replace(/_?IP.*$/,'').replace(/_4K$/,'');
   const parts=label.split('_'); const object=parts.at(-1); const institution=parts.length>1?parts.slice(0,-1).join(' · '):'';
   const x=pad+(i%cols)*cw+cw/2;
   const text=svg(w,88,`<text x="${x}" y="32" text-anchor="middle" style="font-family:${family}" font-size="32">${esc(object)}</text><text x="${x}" y="66" text-anchor="middle" style="font-family:${family};fill:#6a6058" font-size="22">${esc(institution)}</text>`);
   layers.push({input:text,top:Math.round(top+Math.floor(i/cols)*ch+size+10),left:0});
  }
 }
 await sharp({create:{width:w,height:h,channels:3,background:bg}}).composite(layers).jpeg({quality:88,mozjpeg:true}).toFile(`${out}/${name}.jpg`);
 manifest.push({output:`${out}/${name}.jpg`,sources:images.map(f=>path.relative(root,f))});
}
await board('tangtouya-cover','烫头鸭','把日常的小情绪，变成一只鸭的表情。',[duck[2],duck[20],duck[17],life[7],hobby[0],hobby[14],duck[0],life[4],duck[19]],'#FFF1CB',true);
await board('tangtouya-everyday','日常，有鸭陪你','续命篇 / 情绪表达与社交回应',[duck[0],duck[2],duck[9],duck[14],duck[19],duck[20]],'#FFF6DF');
await board('tangtouya-hobbies','给热爱一点时间','兴趣班 / 让爱好长成角色的性格',[hobby[0],hobby[1],hobby[2],hobby[3],hobby[8],hobby[14]],'#EFEDF8');
await board('tangtouya-life','一句话，一种表情','生活记 / 从问候到拥抱的日常陪伴',[life[0],life[2],life[4],life[7],life[8],life[9]],'#F4F0E6');
await board('museum-cover','博物馆的显眼包','让馆藏的轮廓，拥有今天的性格。',[china[1],china[3],china[5],china3[0],china3[5],china3[7],world3[0],world3[3],world3[11]],'#ECEAE1',true);
await board('museum-china','从器形，到性格','中国馆藏篇 / 以轮廓与纹样保留文物记忆',china.slice(0,6));
await board('museum-china-ii','古老纹样，鲜活表达','中国馆藏第二辑 / 多巴胺色彩与手绘描边',china2.slice(0,6),'#EFF1E8');
await board('museum-expressions','文物的表情管理','中国馆藏第三辑 / 九种当代情绪',china3,'#F4EBE5');
await board('museum-world-ii','世界馆藏的另一面','海外第二辑 / 扁平色块中的器物想象',world.slice(0,6),'#EFEDF6');
await board('museum-world-iii','奇妙器物，集体出场','海外第三辑 / 异形轮廓与多巴胺撞色',world3.slice(0,6),'#EDF1ED');
await fs.writeFile('scripts/ip-artwork-sources.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Built ${manifest.length} portfolio boards in ${out}`);
