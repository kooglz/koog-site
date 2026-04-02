#!/bin/bash

# 确保加载用户的环境变量 (为了找到 npm 和 git 命令)
source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.nvm/versions/node/v*/bin

# 强制进入你的项目目录 (关键：这样无论脚本放哪都能执行)
cd /Users/konglingzheng/koog-site

echo "=========================================="
echo "🚀 正在同步 KOOG 网站更新到线上..."
echo "=========================================="
echo ""

# 检查是否有未提交的更改
if [ -z "$(git status --porcelain)" ]; then 
  echo "✅ 没有检测到新修改，网站已经是最新状态。"
  echo ""
  echo "按任意键退出..."
  read -n 1
  exit 0
fi

echo "📦 检测到内容更新，开始打包同步..."
echo ""

# 执行同步命令
npm run deploy-site

echo ""
if [ $? -eq 0 ]; then
  echo "🎉 同步成功！"
  echo "代码已推送到 GitHub，腾讯云服务器将在 2-3 分钟内自动更新。"
  echo "请稍后刷新官网查看效果。"
else
  echo "❌ 同步失败，请检查网络连接或终端提示。"
fi

echo ""
echo "=========================================="
echo "按任意键退出..."
read -n 1
exit 0
