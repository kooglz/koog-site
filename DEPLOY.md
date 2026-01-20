# 部署到腾讯云指南 (Deploy to Tencent Cloud)

本项目是一个基于 Vite + React 的静态网站。以下是几种常见的部署到腾讯云的方式：

## 方式一：使用腾讯云 Webify (推荐)

Webify 是腾讯云提供的云开发静态网站托管服务，支持自动化部署。

1. **登录腾讯云控制台**，搜索并进入 "Webify"。
2. 点击 **"新建应用"**。
3. 如果你的代码在 Git 仓库 (GitHub/GitLab/Gitee)：
   - 选择 **"从 Git 仓库导入"**。
   - 授权并选择你的仓库。
   - 配置构建命令：
     - 构建命令：`npm run build`
     - 输出目录：`dist`
4. 如果是本地代码：
   - 在本地运行 `npm run build` 生成 `dist` 目录。
   - 选择 **"本地上传"** (或通过 CLI 工具)。
5. 等待部署完成，Webify 会提供一个访问域名。

## 方式二：使用云服务器 (CVM) 或 轻量应用服务器

如果你有一台腾讯云服务器，可以使用 Docker 或 Nginx 直接部署。

### 1. 使用 Docker (已提供 Dockerfile)

本项目已包含 `Dockerfile` 和 `nginx.conf`。

1. **构建镜像** (在本地或服务器上)：
   ```bash
   docker build -t koog-site .
   ```

2. **运行容器**：
   ```bash
   docker run -d -p 80:80 --name koog-site-container koog-site
   ```

3. 访问服务器的公网 IP 即可看到网站。

### 2. 手动部署 Nginx

1. 在服务器上安装 Nginx (例如 `yum install nginx` 或 `apt install nginx`)。
2. 在本地运行 `npm run build`。
3. 将 `dist` 目录下的所有文件上传到服务器的 Nginx 根目录 (通常是 `/usr/share/nginx/html` 或 `/var/www/html`)。
4. 确保 Nginx 配置正确指向该目录 (参考项目中的 `nginx.conf`)。
5. 重启 Nginx: `systemctl restart nginx`。

## 方式三：使用对象存储 (COS) 静态网站托管

1. **创建存储桶 (Bucket)**：在腾讯云 COS 控制台创建一个新的 Bucket，访问权限选择 "公有读私有写"。
2. **开启静态网站**：在 Bucket 的 "基础配置" -> "静态网站" 中开启，索引文档设为 `index.html`，错误文档设为 `index.html` (为了支持 React Router)。
3. **上传文件**：
   - 本地运行 `npm run build`。
   - 将 `dist` 文件夹内的**所有内容**上传到 Bucket 根目录。
4. 访问 COS 提供的静态网站域名。

---

## 常用命令

- **安装依赖**: `npm install`
- **本地开发**: `npm run dev`
- **构建生产版本**: `npm run build`
