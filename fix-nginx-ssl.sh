#!/bin/bash

###############################################################################
# 修复 Nginx SSL 证书问题
###############################################################################

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

echo "=========================================="
echo "🔧 修复 Nginx SSL 证书"
echo "=========================================="

cat > /tmp/fix-ssl.sh << 'SERVER_SCRIPT'
#!/bin/bash
set -e

echo "=== 1. 创建自签名证书目录 ==="
mkdir -p /etc/nginx/ssl

echo ""
echo "=== 2. 生成自签名证书 ==="
if [ ! -f /etc/nginx/ssl/self-signed.crt ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/self-signed.key \
        -out /etc/nginx/ssl/self-signed.crt \
        -subj "/CN=173.255.193.131"
    echo "✅ 自签名证书已创建"
else
    echo "自签名证书已存在"
fi

echo ""
echo "=== 3. 测试 Nginx 配置 ==="
nginx -t

echo ""
echo "=== 4. 重启 Nginx ==="
systemctl reload nginx || systemctl restart nginx

echo ""
echo "✅ Nginx 修复完成！"
SERVER_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/fix-ssl.sh $SERVER:/tmp/fix-ssl.sh
expect {
    "password:" { send "$PASSWORD\r"; exp_continue }
    eof
}
EOF

expect << EOF
set timeout 120
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/fix-ssl.sh && bash /tmp/fix-ssl.sh"
expect {
    "password:" { send "$PASSWORD\r"; exp_continue }
    timeout { puts "超时"; exit 1 }
    eof
}
EOF

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/fix-ssl.sh"
expect {
    "password:" { send "$PASSWORD\r"; exp_continue }
    eof
}
EOF

rm -f /tmp/fix-ssl.sh

echo ""
echo "=========================================="
echo "✅ 修复完成！请刷新页面测试"
echo "=========================================="

