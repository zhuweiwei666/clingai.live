#!/bin/bash

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

cat > /tmp/verify-google-id.sh << 'VERIFY_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 重新构建 ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

rm -rf dist
npm run build

echo ""
echo "=== 检查构建文件 ==="
JS_FILE=$(ls dist/assets/index-*.js | head -1)
echo "文件: $JS_FILE"

echo ""
echo "=== 搜索 Client ID（完整）==="
if grep -q "1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg" "$JS_FILE"; then
    echo "✅ 找到完整 Client ID"
    grep -o "1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg[^\"]*" "$JS_FILE" | head -1
else
    echo "❌ 未找到完整 Client ID"
fi

echo ""
echo "=== 搜索 Client ID（部分）==="
if grep -q "g9kg86khnp6tdh13b8e75f5p6r95jutg" "$JS_FILE"; then
    echo "✅ 找到 Client ID 部分"
else
    echo "❌ 未找到 Client ID 部分"
fi

echo ""
echo "=== 部署 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 完成"
VERIFY_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/verify-google-id.sh $SERVER:/tmp/verify-google-id.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

expect << EOF
set timeout 600
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/verify-google-id.sh && bash /tmp/verify-google-id.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/verify-google-id.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/verify-google-id.sh

echo ""
echo "=========================================="
echo "✅ 验证完成！"
echo "=========================================="
echo "请清除浏览器缓存并刷新页面"
echo "打开开发者工具（F12）查看 Console"
echo "应该能看到：✅ Google Client ID 已配置"
echo "=========================================="

