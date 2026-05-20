#!/bin/bash

source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🛑 停止 KOOG 网站本地服务                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "正在停止服务..."

lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "  ✅ 已停止开发服务器 (端口 5173)"
lsof -ti:8081 | xargs kill -9 2>/dev/null && echo "  ✅ 已停止 CMS 代理 (端口 8081)"

echo ""
echo "✅ 所有本地服务已停止。"
echo ""
echo "按任意键退出..."
read -n 1
