#!/bin/bash

###############################################################################
# 更新 Nginx 配置，使用 HTTPS 反向代理到后端
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
echo -e "${BLUE}🔧 更新 Nginx 配置，使用 HTTPS 反向代理${NC}"
echo "=========================================="
echo "后端服务器: $BACKEND_SERVER (HTTPS)"
echo "=========================================="

cat > /tmp/update-nginx-https-proxy.sh << 'NGINX_SCRIPT'
#!/bin/bash
set -e

BACKEND_SERVER="$1"

echo "=== 更新 Nginx 配置（使用 HTTPS 代理）==="
# 我们直接修改 proxy_pass 行
sed -i "s|proxy_pass http://$BACKEND_SERVER;|proxy_pass https://$BACKEND_SERVER;|g" /etc/nginx/sites-available/honeyai

# 在 proxy_pass 后添加 SSL 相关配置
# 使用 sed 在 proxy_pass 行后插入新行
sed -i "/proxy_pass https:\/\/$BACKEND_SERVER;/a \        proxy_ssl_verify off;\n        proxy_ssl_server_name on;" /etc/nginx/sites-available/honeyai

echo "=== 检查更新后的配置 ==="
grep -A 5 "location /api/" /etc/nginx/sites-available/honeyai

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
spawn scp -o StrictHostKeyChecking=no /tmp/update-nginx-https-proxy.sh $SERVER:/tmp/update-nginx-https-proxy.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/update-nginx-https-proxy.sh && bash /tmp/update-nginx-https-proxy.sh '$BACKEND_SERVER'"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/update-nginx-https-proxy.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/update-nginx-https-proxy.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Nginx HTTPS 反向代理配置完成！${NC}"
echo "=========================================="
echo "现在 Nginx 会通过 HTTPS 连接到后端服务器"
echo "避免了后端重定向导致的 ERR_NETWORK 错误"
echo "=========================================="

