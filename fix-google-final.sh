#!/bin/bash

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

cat > /tmp/fix-final.sh << 'FINAL_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

# 加载nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

# 确保.env文件存在
if [ ! -f ".env" ]; then
    echo "创建.env文件..."
    cat > .env << 'ENV_EOF'
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
ENV_EOF
fi

# 确保package.json有Google依赖
if ! grep -q "@react-oauth/google" package.json; then
    echo "更新package.json..."
    npm install @react-oauth/google --save
fi

# 确保安装依赖
echo "安装/更新依赖..."
npm install

# 导出环境变量并构建
echo "导出环境变量..."
export $(grep -v '^#' .env | xargs)
echo "VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID"

# 清理并重新构建
echo "清理旧构建..."
rm -rf dist

echo "开始构建..."
npm run build

# 验证
echo ""
echo "验证构建结果..."
if [ -f "dist/assets/index-*.js" ]; then
    JS_FILE=$(ls dist/assets/index-*.js | head -1)
    if grep -q "1031646438202" "$JS_FILE" 2>/dev/null; then
        echo "✅ Client ID已包含在构建文件中"
    else
        echo "⚠️  Client ID未找到，但文件已构建"
    fi
else
    echo "❌ 构建文件不存在"
    exit 1
fi

# 部署
echo ""
echo "部署文件..."
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 完成"
FINAL_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/fix-final.sh $SERVER:/tmp/fix-final.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/fix-final.sh && bash /tmp/fix-final.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/fix-final.sh && systemctl reload nginx && echo 'Nginx已重启'"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/fix-final.sh

echo ""
echo "=========================================="
echo "✅ 修复完成！"
echo "=========================================="
echo "请清除浏览器缓存（Ctrl+Shift+Delete）"
echo "然后硬刷新页面（Ctrl+Shift+R）"
echo "=========================================="

