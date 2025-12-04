#!/bin/bash

###############################################################################
# 修复 Google 登录 - 完整修复脚本
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
BACKEND_SERVER="139.162.62.115"
PROJECT_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 修复 Google 登录 - 完整修复${NC}"
echo "=========================================="

# 创建服务器端修复脚本
cat > /tmp/server-fix.sh << 'SERVER_SCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="/var/www/honeyai"
BACKEND_SERVER="$1"

echo "=== 1. 拉取最新代码 ==="
cd $PROJECT_DIR
git fetch origin
git reset --hard origin/main
echo "✅ 代码更新完成"

echo ""
echo "=== 2. 安装依赖并构建 ==="
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18 || nvm install 18

npm install
npm run build
echo "✅ 构建完成"

echo ""
echo "=== 3. 更新 Nginx 配置 ==="
# 检查并修复 Nginx 配置
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
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    root /var/www/honeyai/dist;
    index index.html;

    # API 反向代理 - 转发到后端服务器
    location /api/ {
        proxy_pass https://139.162.62.115/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host 139.162.62.115;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS 头
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# IP 访问配置
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONFIG

echo "✅ Nginx 配置已更新"

echo ""
echo "=== 4. 测试并重启 Nginx ==="
nginx -t
systemctl reload nginx
echo "✅ Nginx 重启完成"

echo ""
echo "=== 5. 测试后端 API 连接 ==="
echo "测试 Google 登录 API..."
curl -s -o /dev/null -w "%{http_code}" -X POST "https://139.162.62.115/api/users/google-login" \
    -H "Content-Type: application/json" \
    -d '{"test": true}' --insecure || echo "API 测试完成"

echo ""
echo "=========================================="
echo "✅ 修复完成！"
echo "=========================================="
SERVER_SCRIPT

# 上传并执行脚本
echo ""
echo "上传修复脚本到服务器..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/server-fix.sh $SERVER:/tmp/server-fix.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

echo ""
echo "执行修复脚本..."
expect << EOF
set timeout 600
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/server-fix.sh && bash /tmp/server-fix.sh '$BACKEND_SERVER'"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/server-fix.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/server-fix.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 全部修复完成！${NC}"
echo "=========================================="
echo "请刷新页面测试 Google 登录"
echo "=========================================="
