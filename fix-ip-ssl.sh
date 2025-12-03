#!/bin/bash

###############################################################################
# 修复 IP 地址访问的 SSL 证书问题
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
DOMAIN="clingai.live"
IP="173.255.193.131"
SERVER_DEPLOY_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 修复 IP 地址访问的 SSL 证书问题${NC}"
echo "=========================================="
echo "域名: $DOMAIN"
echo "IP: $IP"
echo "=========================================="
echo ""

cat > /tmp/fix-ip-ssl-server.sh << 'FIX_IP_SCRIPT'
#!/bin/bash
set -e

DOMAIN="$1"
IP="$2"
DEPLOY_DIR="$3"

echo "=== 1. 为 IP 地址创建自签名证书 ==="
mkdir -p /etc/nginx/ssl

if [ ! -f "/etc/nginx/ssl/ip-cert.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/ip-key.pem \
        -out /etc/nginx/ssl/ip-cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$IP" \
        -addext "subjectAltName=IP:$IP"
    echo "✅ IP 证书已创建"
else
    echo "✅ IP 证书已存在"
fi
echo ""

echo "=== 2. 更新 Nginx 配置（支持 IP 和域名访问）==="
cat > /etc/nginx/sites-available/honeyai << NGINX_EOF
# HTTP 重定向到 HTTPS（域名）
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTP 重定向到 HTTPS（IP 地址）
server {
    listen 80 default_server;
    server_name $IP;
    return 301 https://\$host\$request_uri;
}

# HTTPS 配置（域名 - 使用 Let's Encrypt 证书）
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

# HTTPS 配置（IP 地址 - 使用自签名证书）
# 注意：浏览器仍会显示警告，但可以继续访问
server {
    listen 443 ssl http2 default_server;
    server_name $IP;

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
    root $DEPLOY_DIR;
    index index.html;

    # 日志
    access_log /var/log/nginx/honeyai-ip-access.log;
    error_log /var/log/nginx/honeyai-ip-error.log;

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

echo "=== 3. 测试并重启 Nginx ==="
nginx -t
systemctl reload nginx

echo ""
echo "✅ IP 地址 SSL 配置完成！"
echo ""
echo "⚠️  重要提示："
echo "   - 域名访问 ($DOMAIN): 使用 Let's Encrypt 证书，无警告 ✅"
echo "   - IP 访问 ($IP): 使用自签名证书，浏览器会显示警告 ⚠️"
echo "   - 建议：使用域名访问以获得最佳体验"
FIX_IP_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/fix-ip-ssl-server.sh $SERVER:/tmp/fix-ip-ssl-server.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/fix-ip-ssl-server.sh && bash /tmp/fix-ip-ssl-server.sh '$DOMAIN' '$IP' '$SERVER_DEPLOY_DIR'"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/fix-ip-ssl-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/fix-ip-ssl-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ IP 地址 SSL 配置完成！${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  重要提示：${NC}"
echo "   1. ${GREEN}推荐使用域名访问${NC}：https://$DOMAIN"
echo "      - 使用 Let's Encrypt 证书"
echo "      - 浏览器无警告 ✅"
echo ""
echo "   2. ${YELLOW}IP 地址访问${NC}：https://$IP"
echo "      - 使用自签名证书"
echo "      - 浏览器会显示警告（这是正常的）"
echo "      - 点击'高级' → '继续访问'即可"
echo ""
echo "   3. ${BLUE}为什么 IP 访问会有警告？${NC}"
echo "      - Let's Encrypt 不能为 IP 地址签发证书"
echo "      - 只能为域名签发证书"
echo "      - 自签名证书浏览器不信任，但可以正常使用"
echo "=========================================="

