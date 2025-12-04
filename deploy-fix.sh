#!/bin/bash

###############################################################################
# 完整修复部署脚本
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
PROJECT_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🚀 完整修复部署${NC}"
echo "=========================================="

# 创建服务器端脚本
cat > /tmp/deploy-server.sh << 'SERVER_SCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="/var/www/honeyai"
GITHUB_REPO="https://github.com/zhuweiwei666/clingai.live.git"

echo "=== 1. 准备项目目录 ==="
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Git 仓库存在，拉取最新代码..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "Git 仓库不存在，重新克隆..."
    rm -rf $PROJECT_DIR
    mkdir -p $PROJECT_DIR
    git clone $GITHUB_REPO $PROJECT_DIR
    cd $PROJECT_DIR
fi
echo "✅ 代码准备完成"

echo ""
echo "=== 2. 安装 Node.js 18 ==="
export NVM_DIR="/root/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    echo "安装 nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
fi
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18 || true
nvm use 18
node -v
npm -v
echo "✅ Node.js 准备完成"

echo ""
echo "=== 3. 安装依赖并构建 ==="
cd $PROJECT_DIR
rm -rf node_modules package-lock.json
npm install
npm run build
echo "✅ 构建完成"

echo ""
echo "=== 4. 更新 Nginx 配置 ==="
cat > /etc/nginx/sites-available/honeyai << 'NGINX_CONFIG'
server {
    listen 80;
    server_name clingai.live www.clingai.live;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clingai.live www.clingai.live;

    ssl_certificate /etc/letsencrypt/live/clingai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clingai.live/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    root /var/www/honeyai/dist;
    index index.html;

    # API 反向代理
    location /api/ {
        proxy_pass https://139.162.62.115/api/;
        proxy_http_version 1.1;
        proxy_set_header Host 139.162.62.115;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# IP 访问
server {
    listen 443 ssl http2;
    server_name 173.255.193.131;

    ssl_certificate /etc/nginx/ssl/self-signed.crt;
    ssl_certificate_key /etc/nginx/ssl/self-signed.key;

    root /var/www/honeyai/dist;
    index index.html;

    location /api/ {
        proxy_pass https://139.162.62.115/api/;
        proxy_http_version 1.1;
        proxy_set_header Host 139.162.62.115;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONFIG

# 确保启用站点
ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/honeyai

echo "✅ Nginx 配置更新完成"

echo ""
echo "=== 5. 测试并重启 Nginx ==="
nginx -t && systemctl reload nginx
echo "✅ Nginx 重启完成"

echo ""
echo "=== 6. 验证部署 ==="
echo "检查 dist 目录..."
ls -la $PROJECT_DIR/dist/ | head -5
echo ""
echo "检查 API 配置..."
grep -r "google-login" $PROJECT_DIR/dist/assets/*.js | head -1 || echo "找不到配置"

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
SERVER_SCRIPT

# 上传脚本
echo "上传部署脚本..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/deploy-server.sh $SERVER:/tmp/deploy-server.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

# 执行脚本
echo ""
echo "执行部署脚本（可能需要几分钟）..."
expect << EOF
set timeout 900
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/deploy-server.sh && bash /tmp/deploy-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    timeout {
        puts "执行超时"
        exit 1
    }
    eof
}
EOF

# 清理
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/deploy-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/deploy-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 全部完成！${NC}"
echo "=========================================="

