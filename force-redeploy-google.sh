#!/bin/bash

###############################################################################
# 强制重新部署 Google 登录功能
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🚀 强制重新部署 Google 登录功能${NC}"
echo "=========================================="

cat > /tmp/force-redeploy-server.sh << 'FORCE_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 拉取最新代码 ==="
git pull origin main

echo ""
echo "=== 2. 加载 nvm ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo ""
echo "=== 3. 清理所有旧文件 ==="
rm -rf dist
rm -rf node_modules/.vite
rm -rf /var/www/honeyai/*

echo ""
echo "=== 4. 重新安装依赖（如果需要）==="
npm install

echo ""
echo "=== 5. 重新构建 ==="
npm run build

echo ""
echo "=== 6. 验证构建结果 ==="
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ 构建失败：dist 目录为空"
    exit 1
fi

JS_FILE=$(ls dist/assets/index-*.js | head -1)
echo "构建文件: $JS_FILE"
echo "文件大小: $(ls -lh $JS_FILE | awk '{print $5}')"

# 检查是否包含调试信息
if grep -q "✅✅✅" "$JS_FILE" 2>/dev/null; then
    echo "✅ 包含新的调试信息"
else
    echo "⚠️ 未找到新的调试信息（可能被压缩）"
fi

echo ""
echo "=== 7. 部署文件 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo ""
echo "=== 8. 验证部署 ==="
ls -lh /var/www/honeyai/assets/*.js

echo ""
echo "✅ 部署完成！"
FORCE_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/force-redeploy-server.sh $SERVER:/tmp/force-redeploy-server.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/force-redeploy-server.sh && bash /tmp/force-redeploy-server.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/force-redeploy-server.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/force-redeploy-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 强制重新部署完成！${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  重要：请执行以下步骤${NC}"
echo ""
echo "1. ${GREEN}完全关闭浏览器${NC}（不要只是关闭标签页）"
echo "2. ${GREEN}重新打开浏览器${NC}"
echo "3. ${GREEN}访问：https://clingai.live/login${NC}"
echo "4. ${GREEN}打开开发者工具（F12）${NC}"
echo "5. ${GREEN}查看 Console 标签页${NC}"
echo ""
echo "应该能看到："
echo "  - ✅✅✅ Google Client ID 已配置: 1031646438202-..."
echo "  - ✅✅✅ Google Enabled: true"
echo ""
echo "如果还是看到旧警告，请："
echo "  - 按 Ctrl+Shift+Delete 清除缓存"
echo "  - 或者在浏览器设置中清除网站数据"
echo "=========================================="

