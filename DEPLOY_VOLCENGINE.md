# 部署到火山引擎 veWeb 指南

## 1. 简介
本指南将帮助您将 KOOG 网站部署到火山引擎 (Volcano Engine) 的 veWeb 平台，并启用内容管理系统 (CMS)。

## 2. 部署步骤

### 第一步：创建项目
1. 登录 [火山引擎 veWeb 控制台](https://console.volcengine.com/veweb)。
2. 点击 **"新建项目"**。
3. 关联您的 GitHub 账号，并选择 `koog-site` 仓库。

### 第二步：配置构建
veWeb 会自动检测项目，请确认以下配置：
*   **框架预设**: `Vite`
*   **构建命令**: `npm run build`
*   **输出目录**: `dist`
*   **Node 版本**: 选择 `18` 或更高。

### 第三步：部署
点击 **"立即部署"**。等待构建完成后，您将获得一个访问域名。

---

## 3. 使用 CMS 管理内容

我们已经为您集成了 **Decap CMS**，您可以直接在浏览器中管理作品集，无需修改代码。

### 如何进入后台？
访问您的网站域名，并在后面加上 `/admin`。
例如：`https://您的域名.com/admin`

### 如何配置 CMS 登录 (重要)
由于 CMS 需要写入 GitHub 仓库，它需要权限验证。
推荐使用 **Git Gateway** 方式（最简单，但在国内可能需要配置代理或使用 Netlify Identity）。

**最简单的本地调试方法：**
1. 在本地启动项目：`npm run dev`
2. 打开终端，运行代理服务（需要 Node.js）：
   ```bash
   npx netlify-cms-proxy-server
   ```
3. 访问 `http://localhost:5173/admin` 即可进入后台。

### 线上环境配置
如果要在线上环境使用 CMS，您需要在火山引擎或 Netlify 上配置 OAuth App，或者使用 GitHub Personal Access Token。
最简单的线上方案是部署到 **Netlify**，它自带 Identity 服务，可以一键开启 CMS 登录。

如果必须部署在火山引擎且需要 CMS，建议将 `config.yml` 中的 `backend` 改为使用 `git-gateway` 并配合外部认证服务，这稍微复杂一些。
