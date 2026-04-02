#!/bin/bash

# 确保加载环境变量
source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.nvm/versions/node/v*/bin

# 强制进入你的项目目录
cd /Users/konglingzheng/koog-site

echo "------------------------------------------"
echo "正在启动 KOOG 网站后台管理系统..."
echo "项目目录: /Users/konglingzheng/koog-site"
echo "------------------------------------------"

# 清理可能占用的端口
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

# 启动开发服务器和 CMS 代理
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
