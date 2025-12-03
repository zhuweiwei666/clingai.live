#!/bin/bash

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

cat > /tmp/test-env-build.sh << 'TEST_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 加载 nvm ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "=== 2. 检查 .env 文件 ==="
cat .env

echo ""
echo "=== 3. 清理旧构建 ==="
rm -rf dist

echo "=== 4. 使用环境变量构建 ==="
# 显式设置环境变量
export VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
npm run build

echo ""
echo "=== 5. 检查构建结果 ==="
JS_FILE=$(ls dist/assets/index-*.js | head -1)
echo "构建文件: $JS_FILE"

# 检查是否包含 Client ID（使用更宽松的搜索）
if grep -q "1031646438202" "$JS_FILE"; then
    echo "✅ 找到 Client ID"
    grep -o "1031646438202[^\"' ]*" "$JS_FILE" | head -1
else
    echo "❌ 未找到 Client ID"
    echo "检查是否有 import.meta.env:"
    grep -c "import.meta.env" "$JS_FILE" || echo "未找到 import.meta.env"
fi

echo ""
echo "=== 6. 部署 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 完成"
TEST_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/test-env-build.sh $SERVER:/tmp/test-env-build.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/test-env-build.sh && bash /tmp/test-env-build.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/test-env-build.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/test-env-build.sh

echo ""
echo "=========================================="
echo "✅ 测试完成！"
echo "=========================================="
echo "请清除浏览器缓存并刷新页面"
echo "打开开发者工具（F12）查看 Console 输出"
echo "=========================================="

