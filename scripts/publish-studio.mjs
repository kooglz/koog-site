import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
// Git does not automatically read macOS's active system proxy; mirror it per command.
// No global Git or operating-system setting is changed.
const gitOptions=[];
if (process.platform==='darwin' && !process.env.HTTPS_PROXY && !process.env.https_proxy) {
  try {
    const settings=execFileSync('scutil',['--proxy'],{encoding:'utf8'});
    const enabled=/HTTPSEnable\s*:\s*1/.test(settings);
    const host=settings.match(/HTTPSProxy\s*:\s*(\S+)/)?.[1];
    const port=settings.match(/HTTPSPort\s*:\s*(\d+)/)?.[1];
    if(enabled && host && port) gitOptions.push('-c',`http.proxy=http://${host}:${port}`);
  } catch { /* Use Git's own configuration when no system proxy is available. */ }
}
const read = args => execFileSync('git', [...gitOptions,...args], {encoding:'utf8'}).trim();
const run = (command,args) => execFileSync(command,command==='git' ? [...gitOptions,...args] : args,{stdio:'inherit'});
try {
  if(read(['branch','--show-current'])!=='main') throw Error('请先切换到 main 分支，再同步网站。');
  run('npm',['run','lint']);
  run('npm',['run','build']);
  run('git',['diff','--check']);
  run('git',['fetch','origin','main']);
  run('git',['merge-base','--is-ancestor','origin/main','HEAD']);
  const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replace(/\D/g,'');
  const backup=`backup/studio-before-${stamp}`, release=`release/studio-${stamp}`;
  if(read(['status','--porcelain'])) {
    run('git',['tag',backup,'HEAD']);
    run('git',['add','.']);
    run('git',['commit','-m','content: update portfolio via local studio']);
    run('git',['tag',release,'HEAD']);
    run('git',['push','--atomic','origin','main',backup,release]);
    console.log(`回退点：${backup}\n本次发布：${release}`);
  } else if(Number(read(['rev-list','--count','origin/main..HEAD']))>0) {
    // A prior network failure may have left a valid local commit waiting to be pushed.
    const tags=read(['tag','--list','release/studio-*','backup/studio-before-*']).split('\n').filter(Boolean);
    run('git',['push','--atomic','origin','main',...tags]);
  } else { console.log('本地与 GitHub 一致，无需重复部署。'); process.exit(0); }
  console.log('已提交 GitHub，腾讯云自动部署已触发。\n部署进度：https://github.com/kooglz/koog-site/actions/workflows/deploy-cos.yml\n网站：https://www.koogdesign.top/');
} catch(error) { console.error(`同步未完成，本地文件已保留：${error.message}`); process.exitCode=1; }
