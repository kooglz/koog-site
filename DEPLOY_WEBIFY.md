# 部署到腾讯云 Webify 指南 (推荐)

你选择了 **Webify** 方案，这是腾讯云提供的自动化部署服务，非常适合 Vite/React 项目。

## 第一步：准备代码仓库

Webify 需要连接你的 Git 仓库（GitHub, GitLab, 或 Gitee/码云）。

1.  **在代码托管平台创建新仓库**
    *   推荐使用 [GitHub](https://github.com/new) 或 [Gitee (码云)](https://gitee.com/projects/new)。
    *   创建一个空的仓库（不要勾选“初始化 README”或“.gitignore”）。

2.  **推送代码到远程仓库**
    在你的终端中执行以下命令（将 `<Your_Remote_URL>` 替换为你刚才创建的仓库地址）：

    ```bash
    # 如果是 HTTPS 地址
    git remote add origin https://github.com/your-username/koog-site.git
    # 或者如果是 SSH 地址
    # git remote add origin git@github.com:your-username/koog-site.git

    git branch -M main
    git push -u origin main
    ```

## 第二步：在腾讯云 Webify 创建应用

1.  访问 **[腾讯云 Webify 控制台](https://console.cloud.tencent.com/webify)**。
2.  点击 **"新建应用"** 按钮。
3.  **导入方式**：选择 **"从 Git 仓库导入"**。
    *   选择你使用的代码托管平台（如 GitHub、Gitee）。
    *   进行授权（如果尚未授权）。
    *   在列表中选择 `koog-site` 仓库。

## 第三步：配置构建参数

Webify 通常会自动检测到这是一个 Vite 项目，但请务必核对以下配置：

*   **应用名称**：任意填写（如 `koog-site`）
*   **分支**：`main`
*   **框架预设**：选择 `Vite` (如果没有 Vite 选项，选择 `React` 也可以，关键是下面的命令)
*   **构建命令 (Build Command)**：`npm run build`
*   **输出目录 (Output Directory)**：`dist`
*   **安装命令 (Install Command)**：`npm install` (默认即可)

## 第四步：部署与访问

1.  点击 **"开始部署"**。
2.  等待构建日志跑完（通常需要 1-2 分钟）。
3.  部署成功后，Webify 会分配一个默认域名（如 `app-xxxx.webify.app`）。
4.  点击该域名即可访问你的网站。

---

## 常见问题

*   **部署失败？**
    *   检查构建日志，确认 `npm install` 和 `npm run build` 是否报错。
    *   确认输出目录确实是 `dist`（Vite 默认是 dist，Create React App 默认是 build）。
*   **刷新页面 404？**
    *   Webify 通常会自动处理 SPA 路由。如果遇到此问题，可以在 Webify 应用设置中找到 "重定向配置"，添加一条规则：
        *   来源：`/.*` (或具体路径)
        *   目标：`/index.html`
        *   状态码：`200`
