# 2026-10-31 双语、外观、动效与内容工作台

现有 12 个项目补齐英文标题、分类、客户、简介、Markdown 正文和图片描述；轮播、分享、元信息与页面语言同步。翻译保存在原有 works.json 的 `_en` 字段中，CMS 可直接编辑。新增构建检查会阻止遗漏英文或失效图片路径的内容上线。

外观默认跟随系统的 prefers-color-scheme，首次绘制前应用主题；顶部菜单提供跟随系统、浅色、深色。只有明确选择浅色或深色才覆盖系统，恢复“跟随系统”后继续响应系统变化。语言与主题偏好保存在本机；存储不可用时仍可使用。作品原图配色不变。

Logo 使用 24% 圆角遮罩，PWA 的身份、启动 URL、standalone 和图标文件保持原值。桌面 Hero 改为文字 5/12、轮播 7/12，标题约 44–64px、主图约 320–440px。项目卡片加入滚动入场、悬停/键盘“查看项目”提示和触屏常驻箭头。原生 View Transitions 可用时做短过渡，否则正常切换。减少动态效果偏好会关闭位移动画和自动轮播。

## 本地内容工作台

双击项目根目录的“启动网站后台.command”，进入 http://localhost:5173/admin/ 。后台保持 Decap 的本地文件保存机制，不引入新的云数据库或账号。

- 品牌化入口显示项目、双语完成与轮播数量。
- 项目与全局设置分入口；项目和轮播列表可折叠、排序。
- 预览支持中文/English、浅色/深色、手机/桌面，以及项目选择。
- 上传明确封面 3:4、详情图宽 1600px、12MB 单图限制；不强制裁切或改变尺寸。JPEG/WebP 采用 88 质量，支持格式重编码去元数据，PNG 保留透明；GIF/SVG 按 Decap 原样上传。
- 保存前校验唯一 ID、双语字段与轮播关联。编辑器“发布”保存到本地，保存后提示后续同步步骤。
- 启动器检查、复用已有服务，不再强杀端口进程。服务绑定本机环回地址。
- “同步网站更新.command”先检查与构建，再生成 `backup/studio-before-时间` 与 `release/studio-时间` 标签，提交并原子推送 GitHub。失败保留本地提交，可再次同步。

## 低频更新的缓存策略

平时保留图片和代码缓存；上传新作才随内容变化更新。

- 构建产物 assets/：内容哈希文件名，1 年 immutable。
- 图片等静态媒体：30 天。构建时根据图片字节生成稳定版本号；前台媒体链接携带该版本号，替换图片才产生新链接，不因每次构建而让所有图片失效。
- HTML、content JSON、Service Worker、Manifest、后台文件：no-cache, no-store, must-revalidate；体积较小，用于获取当前发布版本。
- PWA 接入官方 virtual:pwa-register 自动刷新机制，回到前台时检查更新，不设短周期轮询。
- 旧版 PWA 的一次性兼容桥接仅在升级时检查客户端；已有新更新机制的页面确认后不额外导航，旧页面自动切到新版。首次安装不触发强制重载，后台编辑页面不重载。
- 后台不进入 PWA 的离线页面回退和静态预缓存，避免编辑界面长期过期。
- 腾讯云按依赖资源 → 内容 → 页面 → Service Worker 顺序上传；资源上传失败不激活后续入口。
- Cloudflare 浏览器缓存 TTL 从 4 小时改为“遵循现有标头”。发布完成后清理 koogdesign.top 域名缓存。

## 验证

`npm run lint`、`npm run build`、内容与资源路径检查；浏览器遍历 12 个英文项目及分享菜单；320、390、768、1024、1440、1920px 布局；系统主题变化、手动覆盖与恢复跟随系统；预览切换；本地 CMS 临时图片上传和双语 JSON 保存后回读一致，测试文件已清理。

动效采用浏览器原生能力，并遵循减少动态效果偏好，参考 [View Transitions](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/same-document-transitions)；CMS 扩展按 [Decap 自定义预览](https://decapcms.org/docs/customization/) 与 [媒体处理配置](https://decapcms.org/docs/configuration-options/#media-processing) 接入。

## 本次版本与回退

更新前：`backup/before-i18n-dark-20261031`（6cc8510）。
发布标签：`release/studio-i18n-theme-20261031-final`。

撤销本次版本时，在 main 干净工作区运行：

```sh
git fetch origin --tags
git pull --ff-only origin main
git revert --no-commit backup/before-i18n-dark-20261031..release/studio-i18n-theme-20261031-final
git commit -m "revert: restore portfolio before studio update"
git push origin main
```

远端历史保留。Cloudflare 的“遵循现有标头”属于控制台设置，不受 git revert 控制，通常可保留；如需完全恢复旧策略，可在域名缓存配置将浏览器 TTL 改回 4 小时。

同步脚本会按当前 macOS 系统代理运行 Git，不修改全局 Git 或系统设置。

追加验收：实际 DNS 回源为腾讯云 CDN，Cloudflare 前方还有腾讯缓存层。部署流程在 COS 上传成功后刷新腾讯 CDN 的少量页面、清单与 SW URL，并等待完成；不清空作品图片。手机 Hero 标题按 30–40px 自适应，390px 宽时约 31px。
