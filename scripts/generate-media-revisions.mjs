// Stable content versions let infrequently updated artwork stay cached between releases.
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const revisions = {};
async function walk(dir) {
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) {if(entry.name!=='admin') await walk(file);}
    else if(/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(file)) {
      revisions[path.relative('public',file).split(path.sep).join('/')]=createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12);
    }
  }
}
await walk('public');
await mkdir('src/generated',{recursive:true});
await writeFile('src/generated/media-revisions.json',JSON.stringify(revisions,null,2)+'\n');
console.log(`Versioned ${Object.keys(revisions).length} artwork and icon files.`);
