#!/bin/bash
# ClingAI Backend Deployment Script

set -e

echo "🚀 Starting ClingAI Backend Deployment..."

# 更新代码
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/main

# 安装依赖
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# 安装 admin 依赖并构建
echo "📦 Building admin panel..."
cd admin
npm install
npm run build
cd ..

# 构建前端
echo "🔨 Building frontend..."
npm run build

# 复制文件到 web 目录
echo "📂 Deploying static files..."
sudo cp -r dist/* /var/www/honeyai/
sudo mkdir -p /var/www/admin
sudo cp -r admin/dist/* /var/www/admin/
sudo chown -R www-data:www-data /var/www/honeyai
sudo chown -R www-data:www-data /var/www/admin

# 启动/重启后端服务
echo "🔄 Restarting backend services..."
pm2 delete clingai-api clingai-worker 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

# 重载 Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo ""
echo "Services status:"
pm2 status
