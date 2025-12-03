#!/bin/bash

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

cat > /tmp/final-fix.sh << 'FINAL_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 确保.env文件存在且正确 ==="
cat > .env << 'ENV_EOF'
VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
ENV_EOF

cat .env
echo ""

echo "=== 2. 加载nvm ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "=== 3. 确保依赖已安装 ==="
npm install

echo "=== 4. 清理旧构建 ==="
rm -rf dist

echo "=== 5. 使用Vite构建（会自动读取.env）==="
# Vite会自动读取项目根目录的.env文件
npm run build

echo ""
echo "=== 6. 验证构建结果 ==="
if [ -f "dist/assets/index-*.js" ]; then
    JS_FILE=$(ls dist/assets/index-*.js | head -1)
    echo "构建文件: $JS_FILE"
    echo "文件大小: $(ls -lh $JS_FILE | awk '{print $5}')"
    
    # 检查是否有Google相关代码
    if strings "$JS_FILE" | grep -q "accounts.google.com"; then
        echo "✅ 包含Google OAuth代码"
    else
        echo "❌ 未找到Google OAuth代码"
    fi
else
    echo "❌ 构建文件不存在"
    exit 1
fi

echo ""
echo "=== 7. 部署 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 部署完成"
FINAL_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/final-fix.sh $SERVER:/tmp/final-fix.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/final-fix.sh && bash /tmp/final-fix.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/final-fix.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/final-fix.sh

echo ""
echo "=========================================="
echo "✅ 最终修复完成！"
echo "=========================================="
echo "请："
echo "1. 清除浏览器缓存（Ctrl+Shift+Delete）"
echo "2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）"
echo "3. 打开浏览器开发者工具（F12）查看Console"
echo "4. 如果仍看不到，请告诉我Console中的错误信息"
echo "=========================================="

