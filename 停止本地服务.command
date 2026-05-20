#!/bin/bash

source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.nvm/versions/node/v*/bin

cd /Users/konglingzheng/koog-site

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🛑 停止 KOOG DESIGN 本地服务                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "⏳ 正在停止所有本地服务..."

# 停止 Vite 开发服务器
if lsof -ti:5173 > /dev/null 2>&1; then
  lsof -ti:5173 | xargs kill -9 2>/dev/null
  echo "✅ 已停止 Vite 开发服务器 (端口 5173)"
else
  echo "ℹ️  Vite 开发服务器未运行"
fi

# 停止 CMS 服务器
if lsof -ti:8081 > /dev/null 2>&1; then
  lsof -ti:8081 | xargs kill -9 2>/dev/null
  echo "✅ 已停止 CMS 服务器 (端口 8081)"
else
  echo "ℹ️  CMS 服务器未运行"
fi

# 停止其他可能的端口
lsof -ti:5174,5175,3000,4000 | xargs kill -9 2>/dev/null

echo ""
echo "✨ 所有本地服务已停止"
echo ""

echo "按任意键关闭此窗口..."
read -n 1
