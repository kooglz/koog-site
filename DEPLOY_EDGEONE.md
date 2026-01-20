# 部署到腾讯云 EdgeOne Pages (推荐 - Webify 升级版)

由于 **Webify** 已停止新建应用，腾讯云推出了更强大的 **EdgeOne Pages** 作为替代。它和 Webify 一样，支持连接 GitHub 自动部署，且拥有更快的全球加速节点。

## 第一步：准备代码

确认你的代码已经推送到 GitHub (你刚才已经成功完成了这一步)。

## 第二步：在腾讯云创建 EdgeOne Pages

1.  登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone/pages)。
    *   *如果提示开通服务，请点击立即开通（通常有免费额度）。*
2.  点击 **"新建项目"** (或 "创建 Pages")。
3.  **连接代码仓库**：
    *   选择 **GitHub**。
    *   授权 EdgeOne 访问你的仓库。
    *   选择 **`koog-site`** 仓库。

## 第三步：配置构建参数

EdgeOne Pages 通常会自动检测 Vite 项目，但请核对：

*   **框架预设**：选择 `Vite` (或 `React`)
*   **构建命令**：`npm run build`
*   **构建输出目录**：`dist`
*   **Node.js 版本**：建议选择 `18` 或 `20` (默认即可)。

## 第四步：部署与访问

1.  点击 **"部署"**。
2.  等待构建完成（约 1-2 分钟）。
3.  部署成功后，你会获得一个 `*.pages.woa.com` 或类似的免费访问域名。

---

## 常见问题

*   **部署失败？**
    *   检查构建日志。如果是依赖安装失败，尝试在根目录创建 `.npmrc` 文件并写入 `registry=https://registry.npmjs.org/`。
*   **自定义域名**
    *   部署成功后，你可以在 "自定义域名" 选项卡中绑定你自己的域名（需要备案）。
