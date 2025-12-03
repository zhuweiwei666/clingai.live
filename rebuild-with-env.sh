#!/bin/bash

###############################################################################
# 在服务器上重新构建项目（使用 .env 文件）
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔨 重新构建项目（使用 .env）${NC}"
echo "=========================================="
echo ""

# 检查expect
if ! command -v expect &> /dev/null; then
    echo -e "${RED}❌ 需要安装 expect${NC}"
    exit 1
fi

# 创建服务器端构建脚本
cat > /tmp/rebuild-server.sh << 'REBUILD_SCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="/root/honeyai"
DEPLOY_DIR="/var/www/honeyai"

echo "=== 检查 .env 文件 ==="
cd "$PROJECT_DIR"
if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    echo "内容："
    cat .env
    echo ""
else
    echo "❌ .env 文件不存在"
    exit 1
fi

# 加载nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# 确保Node.js 18已安装
if ! nvm list | grep -q "v18"; then
    echo "安装 Node.js 18..."
    nvm install 18
fi
nvm use 18
nvm alias default 18

echo "=== 重新构建项目 ==="
# 确保 .env 文件存在
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在"
    exit 1
fi

# 显示环境变量（用于调试）
echo "环境变量检查："
echo "VITE_GOOGLE_CLIENT_ID=$(grep VITE_GOOGLE_CLIENT_ID .env | cut -d'=' -f2)"
echo ""

# 使用环境变量构建
export $(grep -v '^#' .env | xargs)
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ 构建失败：dist 目录为空"
    exit 1
fi

echo "✅ 构建成功"
echo ""

echo "=== 部署文件 ==="
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR"/
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo "✅ 文件部署完成"
echo ""

echo "=== 重启 Nginx ==="
nginx -t && systemctl reload nginx

echo "✅ 部署完成！"
REBUILD_SCRIPT

echo -e "${GREEN}[1/3]${NC} 上传构建脚本..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/rebuild-server.sh $SERVER:/tmp/rebuild-server.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

echo -e "${GREEN}[2/3]${NC} 在服务器上执行构建..."
expect << EOF
set timeout 600
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/rebuild-server.sh && bash /tmp/rebuild-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    timeout {
        puts "构建超时"
        exit 1
    }
    eof
}
EOF

echo -e "${GREEN}[3/3]${NC} 清理临时文件..."
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/rebuild-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/rebuild-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 重新构建和部署完成！${NC}"
echo "=========================================="
echo "🌐 网站地址: http://173.255.193.131"
echo "现在 Google 登录功能应该可以正常使用了！"
echo "=========================================="

