#!/bin/bash

source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.nvm/versions/node/v*/bin

cd /Users/konglingzheng/koog-site

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🎨 KOOG DESIGN 网站后台管理系统                    ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  📁 项目目录: /Users/konglingzheng/koog-site                ║"
echo "║  🌐 本地地址: http://localhost:5173                         ║"
echo "║  ⚙️  后台地址: http://localhost:5173/admin/                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

echo "⏳ 正在启动服务..."
nohup npm run dev > /tmp/koog-dev.log 2>&1 &
DEV_PID=$!
sleep 3
nohup npm run cms > /tmp/koog-cms.log 2>&1 &
CMS_PID=$!

echo "⏳ 等待服务就绪..."
sleep 6

if lsof -i:5173 > /dev/null 2>&1; then
  echo ""
  echo "✅ 服务启动成功！"
  echo ""
  echo "┌─────────────────────────────────────────────────────────────┐"
  echo "│  📝 使用说明：                                              │"
  echo "│                                                             │"
  echo "│  1. 浏览器会自动打开后台管理页面                            │"
  echo "│  2. 编辑内容后点击「发布」保存到本地                        │"
  echo "│  3. 双击「同步网站更新.command」推送到线上                  │"
  echo "│                                                             │"
  echo "│  💡 提示：                                                  │"
  echo "│  - 图片建议先用 TinyPNG 压缩                                │"
  echo "│  - 编辑完成后记得同步到线上                                 │"
  echo "└─────────────────────────────────────────────────────────────┘"
  echo ""
  open "http://localhost:5173/admin/"
else
  echo ""
  echo "❌ 启动失败，请检查日志："
  echo "   cat /tmp/koog-dev.log"
fi

echo ""
echo "按任意键关闭此窗口（服务会继续运行）..."
read -n 1
