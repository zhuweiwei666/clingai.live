#!/bin/bash

###############################################################################
# 更新 Nginx 配置，添加 API 反向代理
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
BACKEND_SERVER="139.162.62.115"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 更新 Nginx 配置，添加 API 反向代理${NC}"
echo "=========================================="
echo "后端服务器: $BACKEND_SERVER"
echo "=========================================="

cat > /tmp/update-nginx-api-proxy-server.sh << 'NGINX_SCRIPT'
#!/bin/bash
set -e

BACKEND_SERVER="$1"

echo "=== 备份当前配置 ==="
cp /etc/nginx/sites-available/honeyai /etc/nginx/sites-available/honeyai.backup.$(date +%Y%m%d_%H%M%S)

echo "=== 更新 Nginx 配置（添加 API 反向代理）==="
cat > /etc/nginx/sites-available/honeyai << NGINX_EOF
# HTTP 重定向到 HTTPS（域名）
server {
    listen 80;
    server_name clingai.live www.clingai.live;
    return 301 https://\$host\$request_uri;
}

# HTTP 重定向到 HTTPS（IP 地址）
server {
    listen 80 default_server;
    server_name 173.255.193.131;
    return 301 https://\$host\$request_uri;
}

# HTTPS 配置（域名 - 使用 Let's Encrypt 证书）
server {
    listen 443 ssl http2;
    server_name clingai.live www.clingai.live;

    # Let's Encrypt SSL 证书
    ssl_certificate /etc/letsencrypt/live/clingai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clingai.live/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 网站根目录
    root /var/www/honeyai;
    index index.html;

    # 日志
    access_log /var/log/nginx/honeyai-access.log;
    error_log /var/log/nginx/honeyai-error.log;

    # API 反向代理 - 将所有 /api 请求转发到后端服务器
    location /api/ {
        proxy_pass http://$BACKEND_SERVER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS 头（如果需要）
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # 处理 OPTIONS 请求
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # 主路由配置（前端路由）
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

# HTTPS 配置（IP 地址 - 使用自签名证书）
server {
    listen 443 ssl http2 default_server;
    server_name 173.255.193.131;

    # 自签名 SSL 证书
    ssl_certificate /etc/nginx/ssl/ip-cert.pem;
    ssl_certificate_key /etc/nginx/ssl/ip-key.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 网站根目录
    root /var/www/honeyai;
    index index.html;

    # 日志
    access_log /var/log/nginx/honeyai-ip-access.log;
    error_log /var/log/nginx/honeyai-ip-error.log;

    # API 反向代理
    location /api/ {
        proxy_pass http://$BACKEND_SERVER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # 主路由配置
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_EOF

echo "✅ Nginx 配置已更新"

echo ""
echo "=== 测试 Nginx 配置 ==="
nginx -t

echo ""
echo "=== 重启 Nginx ==="
systemctl reload nginx

echo ""
echo "✅ 配置完成！"
NGINX_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/update-nginx-api-proxy-server.sh $SERVER:/tmp/update-nginx-api-proxy-server.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/update-nginx-api-proxy-server.sh && bash /tmp/update-nginx-api-proxy-server.sh '$BACKEND_SERVER'"
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

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/update-nginx-api-proxy-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/update-nginx-api-proxy-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Nginx API 反向代理配置完成！${NC}"
echo "=========================================="
echo "现在所有 API 请求都会通过 HTTPS 转发到后端"
echo "解决了 Mixed Content 错误"
echo ""
echo "请清除浏览器缓存并刷新页面测试"
echo "=========================================="

