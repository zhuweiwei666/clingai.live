#!/bin/bash

###############################################################################
# 修复Google登录问题 - 重新安装依赖并构建
###############################################################################

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 修复Google登录问题${NC}"
echo "=========================================="
echo ""

cat > /tmp/fix-google-login-server.sh << 'FIX_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 检查.env文件 ==="
cat .env
echo ""

echo "=== 2. 检查package.json ==="
grep "@react-oauth/google" package.json || echo "❌ 未找到Google依赖"
echo ""

echo "=== 3. 检查node_modules ==="
if [ -d "node_modules/@react-oauth" ]; then
    echo "✅ Google OAuth包已安装"
    ls -la node_modules/@react-oauth/
else
    echo "❌ Google OAuth包未安装"
fi
echo ""

echo "=== 4. 重新安装依赖 ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

# 确保安装Google OAuth包
npm install @react-oauth/google
echo ""

echo "=== 5. 验证安装 ==="
if [ -d "node_modules/@react-oauth/google" ]; then
    echo "✅ Google OAuth包安装成功"
else
    echo "❌ 安装失败"
    exit 1
fi
echo ""

echo "=== 6. 使用.env文件重新构建 ==="
# 导出环境变量
export $(grep -v '^#' .env | xargs)
echo "VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID"

# 清理旧构建
rm -rf dist

# 重新构建
npm run build

echo ""
echo "=== 7. 验证构建结果 ==="
if grep -q "1031646438202" dist/assets/*.js 2>/dev/null; then
    echo "✅ Client ID已包含在构建文件中"
else
    echo "⚠️  Client ID未找到，但继续部署"
fi
echo ""

echo "=== 8. 部署文件 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 部署完成"
FIX_SCRIPT

expect << EOF
set timeout 300
spawn scp -o StrictHostKeyChecking=no /tmp/fix-google-login-server.sh $SERVER:/tmp/fix-google-login-server.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/fix-google-login-server.sh && bash /tmp/fix-google-login-server.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/fix-google-login-server.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/fix-google-login-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 修复完成！${NC}"
echo "=========================================="
echo "请清除浏览器缓存并刷新页面测试"
echo "=========================================="

