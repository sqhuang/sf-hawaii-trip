#!/bin/bash
# 一键部署：提交 + 推送 GitHub + 部署 Netlify
set -e

cd "$(dirname "$0")"

# 1. Git commit & push
git add -A
if git diff --cached --quiet; then
  echo "没有新改动，跳过 git commit"
else
  echo "📦 提交改动..."
  git commit -m "${1:-update: 更新旅行页面}"
  echo "⬆️  推送到 GitHub..."
  git push
fi

# 2. Deploy to Netlify
echo "🚀 部署到 Netlify..."
npx netlify deploy --prod --dir=. --site=f22701df-c172-451a-a370-bdfc7f9cc833

echo ""
echo "✅ 部署完成！"
echo "🔗 https://sf-hawaii-trip-2026.netlify.app"
