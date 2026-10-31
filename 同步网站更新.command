#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")" || exit 1
node scripts/publish-studio.mjs
echo "按任意键关闭窗口…"
read -r -n 1
