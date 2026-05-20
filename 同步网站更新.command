#!/bin/bash

source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.nvm/versions/node/v*/bin

cd /Users/konglingzheng/koog-site

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🚀 KOOG DESIGN 网站同步部署                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🗜️  正在压缩图片..."
node scripts/compress-images.mjs
echo ""

git fetch origin --quiet 2>/dev/null

if [ -n "$(git status --porcelain)" ]; then
  echo "📦 检测到本地修改，正在提交..."
  git add .
  git commit -m "Update content via CMS ($(date '+%Y-%m-%d %H:%M'))"
fi

CHANGES=$(git log origin/main..main --oneline 2>/dev/null)

if [ -z "$CHANGES" ] && [ -z "$(git status --porcelain)" ]; then
  echo "✅ 没有检测到新修改，网站已是最新状态。"
  echo ""
  echo "按任意键退出..."
  read -n 1
  exit 0
fi

echo ""
echo "📋 待同步的更改："
echo "$CHANGES" | head -5
echo ""
echo "🌍 正在推送到 GitHub..."
echo ""

MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  git push origin main 2>&1
  if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  🎉 同步成功！                                               ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║  ✅ 代码已推送到 GitHub                                      ║"
    echo "║  ⏳ 腾讯云 COS 将在 2-3 分钟内自动更新                       ║"
    echo "║  🌐 刷新网站查看效果                                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "按任意键退出..."
    read -n 1
    exit 0
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo ""
    echo "⚠️  网络连接不稳定，正在重试 ($RETRY_COUNT/$MAX_RETRIES)..."
    sleep 3
  fi
done

echo ""
echo "❌ 同步失败，请检查网络连接后重试。"
echo "   你的修改已安全保存在本地。"
echo ""
echo "按任意键退出..."
read -n 1
exit 1
