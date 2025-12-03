#!/bin/bash

###############################################################################
# 修复 Google Client ID 环境变量问题
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
echo -e "${BLUE}🔧 修复 Google Client ID 环境变量${NC}"
echo "=========================================="

cat > /tmp/fix-google-env-server.sh << 'FIX_SCRIPT'
#!/bin/bash
set -e

cd /root/honeyai

echo "=== 1. 确保 .env 文件存在且正确 ==="
cat > .env << 'ENV_EOF'
VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
ENV_EOF

echo "✅ .env 文件内容："
cat .env
echo ""

echo "=== 2. 加载 nvm ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "=== 3. 清理旧构建 ==="
rm -rf dist

echo "=== 4. 重新构建（Vite 会自动读取 .env 文件）==="
# Vite 会自动读取项目根目录的 .env 文件
# 不需要手动 export，Vite 会在构建时自动处理
npm run build

echo ""
echo "=== 5. 验证构建结果 ==="
JS_FILE=$(ls dist/assets/index-*.js | head -1)
echo "构建文件: $JS_FILE"

# 检查是否包含 Client ID（使用更宽松的搜索）
if grep -q "1031646438202" "$JS_FILE"; then
    echo "✅ 找到 Client ID"
    # 提取完整的 Client ID
    grep -o "1031646438202[^\"' ]*" "$JS_FILE" | head -1
else
    echo "❌ 未找到 Client ID"
    echo "检查文件内容（前1000字符）："
    head -c 1000 "$JS_FILE" | strings | head -5
fi

echo ""
echo "=== 6. 部署文件 ==="
mkdir -p /var/www/honeyai
cp -r dist/* /var/www/honeyai/
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai

echo "✅ 部署完成"
FIX_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/fix-google-env-server.sh $SERVER:/tmp/fix-google-env-server.sh
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/fix-google-env-server.sh && bash /tmp/fix-google-env-server.sh"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/fix-google-env-server.sh && systemctl reload nginx"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/fix-google-env-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 修复完成！${NC}"
echo "=========================================="
echo "请："
echo "1. 清除浏览器缓存（Ctrl+Shift+Delete）"
echo "2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）"
echo "3. 打开开发者工具（F12）查看 Console"
echo "4. 应该不再显示 'Google Client ID 未配置' 警告"
echo "5. Google 登录按钮应该可以点击了"
echo "=========================================="

