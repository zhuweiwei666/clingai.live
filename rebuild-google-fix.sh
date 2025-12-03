#!/bin/bash

###############################################################################
# 重新构建并确保 Google Client ID 正确嵌入
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 重新构建并修复 Google 登录${NC}"
echo "=========================================="

cat > /tmp/rebuild-google-fix-server.sh << 'REBUILD_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 确保 .env 文件存在 ==="
cat > .env << 'ENV_EOF'
VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
ENV_EOF

echo "✅ .env 文件内容："
cat .env
echo ""

echo "=== 2. 加载 nvm ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
nvm use 18

echo "=== 3. 清理旧构建 ==="
rm -rf dist

echo "=== 4. 重新构建（确保读取 .env）==="
# 显式导出环境变量
export VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
npm run build

echo ""
echo "=== 5. 验证构建结果 ==="
if [ -f "dist/assets/index-*.js" ]; then
    JS_FILE=$(ls dist/assets/index-*.js | head -1)
    echo "构建文件: $JS_FILE"
    
    # 检查是否包含 Client ID
    if strings "$JS_FILE" | grep -q "1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg"; then
        echo "✅ Client ID 已正确嵌入"
    else
        echo "❌ Client ID 未找到"
    fi
    
    # 检查是否有占位符
    if strings "$JS_FILE" | grep -q "YOUR_GOOGLE_CLIENT_ID"; then
        echo "❌ 仍在使用占位符"
    else
        echo "✅ 未使用占位符"
    fi
else
    echo "❌ 构建文件不存在"
    exit 1
fi

echo ""
echo "=== 6. 部署文件 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 部署完成"
REBUILD_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/rebuild-google-fix-server.sh $SERVER:/tmp/rebuild-google-fix-server.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/rebuild-google-fix-server.sh && bash /tmp/rebuild-google-fix-server.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/rebuild-google-fix-server.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/rebuild-google-fix-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 重新构建完成！${NC}"
echo "=========================================="
echo "请："
echo "1. 清除浏览器缓存（Ctrl+Shift+Delete）"
echo "2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）"
echo "3. 打开浏览器开发者工具（F12）查看 Console"
echo "4. 应该能看到："
echo "   - Google Client ID: 1031646438202-..."
echo "   - Google Enabled: true"
echo "5. Google 登录按钮应该可以点击了"
echo "=========================================="

