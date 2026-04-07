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

# 检查是否有未提交的更改，有则提交
if [ -n "$(git status --porcelain)" ]; then 
  echo "📦 检测到内容更新，正在打包保存在本地..."
  git add .
  git commit -m "Update content via CMS"
fi

# 检查本地分支是否领先远程分支（即是否有内容需要 push）
NEED_PUSH=$(git log origin/main..main --oneline)

if [ -z "$NEED_PUSH" ] && [ -z "$(git status --porcelain)" ]; then
  echo "✅ 没有检测到新修改，网站已经是最新状态。"
  echo ""
  echo "按任意键退出..."
  read -n 1
  exit 0
fi

echo "🌍 正在连接服务器并推送，这可能需要几秒钟..."

# 尝试推送（由于国内访问 GitHub 可能会超时，增加自动重试机制）
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  git push
  if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 同步成功！"
    echo "代码已推送到 GitHub，腾讯云服务器将在 2-3 分钟内自动更新。"
    echo "请稍后刷新官网查看效果。"
    echo ""
    echo "=========================================="
    echo "按任意键退出..."
    read -n 1
    exit 0
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "⚠️ GitHub 网络连接不稳定 (正在自动重试 $RETRY_COUNT/$MAX_RETRIES)..."
    sleep 3
  fi
done

echo ""
echo "❌ 同步失败，已达到最大重试次数。"
echo "这通常是因为当前网络连接 GitHub 超时导致的。"
echo "你的修改已经安全保存在本地，请稍后重新双击本脚本重试即可。"
echo ""
echo "=========================================="
echo "按任意键退出..."
read -n 1
exit 1
