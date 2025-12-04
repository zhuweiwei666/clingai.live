#!/bin/bash

###############################################################################
# 修复 502 错误：将 Nginx 反向代理改回 HTTP
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
echo -e "${BLUE}🔧 修复 502 错误：切换回 HTTP 反向代理${NC}"
echo "=========================================="
echo "后端服务器: $BACKEND_SERVER (HTTP)"
echo "=========================================="

cat > /tmp/fix-502-proxy.sh << 'NGINX_SCRIPT'
#!/bin/bash
set -e

BACKEND_SERVER="$1"

echo "=== 更新 Nginx 配置（使用 HTTP 代理）==="
# 将 https:// 替换回 http://
sed -i "s|proxy_pass https://$BACKEND_SERVER;|proxy_pass http://$BACKEND_SERVER;|g" /etc/nginx/sites-available/honeyai

# 移除 SSL 相关配置 (如果存在)
sed -i "/proxy_ssl_verify off;/d" /etc/nginx/sites-available/honeyai
sed -i "/proxy_ssl_server_name on;/d" /etc/nginx/sites-available/honeyai

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
spawn scp -o StrictHostKeyChecking=no /tmp/fix-502-proxy.sh $SERVER:/tmp/fix-502-proxy.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/fix-502-proxy.sh && bash /tmp/fix-502-proxy.sh '$BACKEND_SERVER'"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/fix-502-proxy.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/fix-502-proxy.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 修复完成！${NC}"
echo "=========================================="
echo "请刷新页面再试一次"
echo "=========================================="

