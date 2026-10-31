# 2026-10-31 精选项目更新

本次新增两个项目：烫头鸭 IP 形象设计、博物馆的显眼包馆藏 IP 系列。包括独立文案、2 张 1200×1600 封面及 8 张 1600px 宽详情图（九宫格为 1600×1800，其余 1600×1400）。旧项目和首页轮播保留原有内容与顺序，新项目排在精选项目和作品列表前两位。

原稿来源清单：`scripts/ip-artwork-sources.json`。使用 `node scripts/build-ip-artwork.mjs <原稿根目录>` 可重建展示图；不修改原始素材。CMS 继续通过 `public/content/works.json` 管理所有项目，详情图新增可选 alt 描述。

根据追加要求，精选项目及作品页改为桌面四列、平板三列、移动两列，并限制内容最大宽度 1280px。保留详情页响应式布局。Hero 改为层叠式轮播，加入新项目、左右切换、位置指示、暂停、触摸滑动和键盘支持；悬停、焦点进入、后台标签页与减少动态效果偏好都会暂停自动切换。卡片增加键盘操作、焦点和按压反馈；详情页增加轻入场动效；遵循系统减少动态效果偏好。首页内容改为稳定的 JSX，避免滚动或轮播时重新挂载、重启动效。PWA 配置、身份、启动方式、图标与缓存策略保持原样。

## 回退

更新前的完整版本：`backup/portfolio-before-ip-20261031`，指向 `be135213cbeec6e3c0b05cec0c2ebb8b7ff60af2`。

发布版本标签：`release/portfolio-ip-20261031`。

需要撤销本次更新时，在干净工作区运行：

```sh
git fetch origin --tags
git switch main
git pull --ff-only origin main
git revert --no-edit release/portfolio-ip-20261031
git push origin main
```

这会创建新的回退提交，保留 GitHub 历史，并触发现有腾讯云 COS / GitHub Pages 自动部署。若之后已修改相同文件，需要先处理 revert 冲突。不要 force push 或 reset 远端 main。

COS 上传不会删除旧文件，因此回退后新增图片可能仍留在存储中，但旧页面不会引用它们。PWA 自动更新须待浏览器接收到新版 Service Worker；上线或回退后可刷新再次确认。

## 本地验收

- `npm run lint`、`npm run build`。
- 12 个项目 ID 唯一，全部封面和图集路径存在。
- Playwright：1440px 桌面四列、390px 手机两列，无横向溢出；两项目详情分别 4 / 6 张图片均加载成功；深链接、键盘进入和减少动态效果通过。
- Manifest 的 standalone、start_url、id、图标保持原值，Service Worker 激活。
- 本地截图保存在 `output/playwright/`，不提交浏览器临时产物。

博物馆图片标题、说明与藏品名称采用本机 `汇文明朝体.TTF`（HWMCT Regular）栅格渲染，字体文件不随网站分发；藏品名称与馆名分成两级文字，九宫格增加纵向间距。
