# 图片缓存与上传压缩修复 · 2026-11-01

## 原因与修复

之前的图片已由 Workbox 预缓存。上一版给图片加上稳定的 `?v=内容哈希` 后，预缓存没有忽略该参数；运行时图片规则又要求整个 URL 以 `.jpg` 等扩展名结尾，带参数的图片因此同时错过两层缓存。实测旧版请求的 `fromServiceWorker` 为 false。

恢复原来的预缓存优先机制：预缓存匹配忽略 `v`，保留现有 cacheId，让原有图片缓存继续复用；图片字节变化仍由 Workbox revision 更新。运行时按 `url.pathname` 识别图片，使用 CacheFirst，完整版本链接仍作为缓存键。新增 WebP、GIF 纳入预缓存。保留页面与更新入口的及时刷新策略，无需清空作品图片缓存。

参照 [Workbox 预缓存与参数匹配](https://developer.chrome.com/docs/workbox/modules/workbox-precaching)。

## 后台上传

Decap 在浏览器内把新上传的 JPG、PNG、WebP 编码为质量 86 的 WebP，再提交本地后台；同步命令将已经压缩的文件上传腾讯云。保留原尺寸、比例与透明通道，无强制裁切或放大。GIF 不参与转换，保留动画。Logo 和二维码字段覆盖默认转换配置，保留原格式。

`npm run deploy-site` 与“同步网站更新.command”统一使用同一发布脚本，包含检查、构建、GitHub 备份与发布标签。移除旧入口在每次发布时重复有损压缩整库图片的步骤。

参照 [Decap 上传前媒体处理](https://decapcms.org/docs/configuration-options/#media-processing)。

## 实际验收

- `npm run lint`、`npm run build` 及 12 个双语项目/轮播的图片路径检查通过。
- 生产构建中，56 个真实图片/图标的版本链接断网读取全部通过，56/56；图片响应 `fromServiceWorker: true`。
- 未列入预缓存的新 WebP 也进入运行时缓存；同名图片换版本后读取新字节，旧、新版本分别可断网读取。
- 实际通过后台上传并保存：PNG 1,542,147 B → WebP 574,882 B，节省约 63%，仍为 1440 × 1920。
- 透明测试图 15,229 B → 9,496 B，600 × 800 不变；480,000 个像素的 alpha 值全部一致。
- 两帧 GIF 保存前后字节完全相同，动画保留。
- 测试仅使用临时上传文件；验收后清理测试文件，并恢复作品 JSON，未将测试图片发布到线上。

## GitHub 回退

更新前：`backup/before-image-cache-20261101`（6900f36）。
本次发布：`release/image-cache-20261101`。

需要撤回本次修复时，在干净 main 工作区执行以下命令；提交历史保留，正常触发腾讯云部署：

```sh
git fetch origin --tags
git pull --ff-only origin main
git revert --no-commit backup/before-image-cache-20261101..release/image-cache-20261101
git commit -m "revert: undo image cache and upload compression update"
git push origin main
```
