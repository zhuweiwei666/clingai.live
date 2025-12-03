#!/bin/bash

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

cat > /tmp/force-rebuild.sh << 'REBUILD_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 拉取最新代码 ==="
git fetch origin
git reset --hard origin/main
echo ""

echo "=== 2. 检查Login.jsx是否有Google登录代码 ==="
if grep -q "使用 Google 登录" src/pages/Login.jsx; then
    echo "✅ Login.jsx包含Google登录按钮"
else
    echo "❌ Login.jsx不包含Google登录按钮"
    cat src/pages/Login.jsx | grep -A 5 -B 5 "Google" || echo "未找到Google相关代码"
fi
echo ""

echo "=== 3. 检查App.jsx是否有GoogleOAuthProvider ==="
if grep -q "GoogleOAuthProvider" src/App.jsx; then
    echo "✅ App.jsx包含GoogleOAuthProvider"
else
    echo "❌ App.jsx不包含GoogleOAuthProvider"
fi
echo ""

echo "=== 4. 加载nvm并安装依赖 ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

# 确保安装所有依赖
npm install
echo ""

echo "=== 5. 检查.env文件 ==="
cat .env
echo ""

echo "=== 6. 导出环境变量并构建 ==="
export $(grep -v '^#' .env | xargs)
echo "环境变量: VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID"
echo ""

rm -rf dist
npm run build
echo ""

echo "=== 7. 检查构建文件大小 ==="
ls -lh dist/assets/*.js
echo ""

echo "=== 8. 检查构建文件中是否有Google相关字符串 ==="
# 搜索可能的关键词
if strings dist/assets/*.js | grep -i "google\|oauth\|登录" | head -3; then
    echo "✅ 找到相关字符串"
else
    echo "⚠️  未找到（可能被压缩）"
fi
echo ""

echo "=== 9. 部署 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 部署完成"
REBUILD_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/force-rebuild.sh $SERVER:/tmp/force-rebuild.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/force-rebuild.sh && bash /tmp/force-rebuild.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/force-rebuild.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/force-rebuild.sh

echo ""
echo "=========================================="
echo "✅ 强制重建完成！"
echo "=========================================="

