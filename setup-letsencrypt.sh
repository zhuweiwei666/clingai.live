#!/bin/bash

###############################################################################
# 配置 Let's Encrypt SSL 证书
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
DOMAIN="clingai.live"
SERVER_DEPLOY_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔒 配置 Let's Encrypt SSL 证书${NC}"
echo "=========================================="
echo "域名: $DOMAIN"
echo "=========================================="
echo ""

cat > /tmp/setup-letsencrypt-server.sh << 'LETSENCRYPT_SCRIPT'
#!/bin/bash
set -e

DOMAIN="$1"
DEPLOY_DIR="$2"

echo "=== 1. 安装 Certbot ==="
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot 已安装"
fi
echo ""

echo "=== 2. 临时配置 Nginx（用于验证）==="
cat > /etc/nginx/sites-available/honeyai << 'NGINX_TEMP'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    root /var/www/honeyai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_TEMP

# 替换域名占位符
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/honeyai

ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
echo "✅ Nginx 临时配置完成"
echo ""

echo "=== 3. 获取 Let's Encrypt 证书 ==="
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
echo ""

echo "=== 4. 验证证书 ==="
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ 证书已成功获取"
    ls -lh /etc/letsencrypt/live/$DOMAIN/
else
    echo "❌ 证书获取失败"
    exit 1
fi
echo ""

echo "=== 5. 更新 Nginx 配置（使用 Let's Encrypt 证书）==="
cat > /etc/nginx/sites-available/honeyai << NGINX_EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt SSL 证书
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 网站根目录
    root $DEPLOY_DIR;
    index index.html;

    # 日志
    access_log /var/log/nginx/honeyai-access.log;
    error_log /var/log/nginx/honeyai-error.log;

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
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
NGINX_EOF

echo "✅ Nginx 配置已更新"
echo ""

echo "=== 6. 测试并重启 Nginx ==="
nginx -t
systemctl reload nginx

echo ""
echo "✅ Let's Encrypt 证书配置完成！"
LETSENCRYPT_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/setup-letsencrypt-server.sh $SERVER:/tmp/setup-letsencrypt-server.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/setup-letsencrypt-server.sh && bash /tmp/setup-letsencrypt-server.sh '$DOMAIN' '$SERVER_DEPLOY_DIR'"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/setup-letsencrypt-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/setup-letsencrypt-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Let's Encrypt 证书配置完成！${NC}"
echo "=========================================="
echo "🌐 HTTPS 地址: https://$DOMAIN"
echo "🌐 HTTPS 地址: https://www.$DOMAIN"
echo ""
echo "✅ 使用 Let's Encrypt 免费证书"
echo "✅ 证书会自动续期"
echo "✅ 解决域名高风险警告"
echo "=========================================="

