import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = 'http://localhost:5173';
const cms = 'http://127.0.0.1:8081/api/v1';
const check = async (url, options) => {
  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(1200) });
    return response.ok ? await response.text() : '';
  } catch { return ''; }
};
const start = (args, log, env = {}) => {
  const fd = openSync(log, 'a');
  const child = spawn('npm', args, { cwd: root, env: { ...process.env, ...env }, detached: true, stdio: ['ignore', fd, fd] });
  child.on('error', error => console.error(`服务启动失败：${error.message}`));
  child.unref();
};
const cmsOptions = {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'info'})};
const currentSite = await check(site);
if (currentSite && !currentSite.includes('KOOG')) throw Error('5173 端口已被其他服务使用，请先关闭该服务；未终止任何已有进程。');
const currentCms = await check(cms, cmsOptions);
if (currentCms && !currentCms.includes('koog-site')) throw Error('8081 端口属于其他项目，请先关闭该服务；未终止任何已有进程。');
if (!currentSite) start(['run','dev','--','--host','127.0.0.1','--strictPort'], '/tmp/koog-dev.log');
if (!currentCms) start(['run','cms'], '/tmp/koog-cms.log', {BIND_HOST:'127.0.0.1',ORIGIN:site});
let ready = false;
for (let attempt=0;attempt<60;attempt++) {
  const [siteResponse,cmsResponse] = await Promise.all([check(site),check(cms,cmsOptions)]);
  if (siteResponse.includes('KOOG') && cmsResponse.includes('koog-site')) {ready=true;break;}
  await new Promise(done=>setTimeout(done,300));
}
if (!ready) { console.error('启动尚未完成，请查看 /tmp/koog-dev.log 和 /tmp/koog-cms.log。'); process.exitCode=1; }
else {
  console.log(`KOOG 内容工作台已就绪：${site}/admin/\n编辑器内“发布”保存到本地。确认预览后，双击“同步网站更新.command”上线。`);
  if (!process.argv.includes('--no-open')) spawn('open',[`${site}/admin/`],{stdio:'ignore'}).unref();
}
