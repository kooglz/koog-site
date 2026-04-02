#!/bin/bash

# 获取脚本所在的目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "------------------------------------------"
echo "正在启动 KOOG 网站后台管理系统..."
echo "项目目录: $DIR"
echo "------------------------------------------"

# 清理可能占用的端口 (5173 是 Vite, 8081 是 CMS 代理)
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

# 启动开发服务器和 CMS 代理
# 使用 nohup 确保关闭终端窗口后服务继续运行
nohup npm run dev > /dev/null 2>&1 &
nohup npm run cms > /dev/null 2>&1 &

echo "服务启动中，请稍候..."
sleep 5

# 自动在浏览器打开后台地址
open "http://localhost:5173/admin/index.html"

echo "------------------------------------------"
echo "后台已启动！"
echo "你可以直接关闭这个窗口。"
echo "------------------------------------------"
