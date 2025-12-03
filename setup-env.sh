#!/bin/bash

###############################################################################
# 在服务器上创建 .env 文件并配置 Google Client ID
###############################################################################

set -e

# 配置
SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
GOOGLE_CLIENT_ID="1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 配置服务器环境变量${NC}"
echo "=========================================="
echo "服务器: $SERVER"
echo "项目目录: $SERVER_PROJECT_DIR"
echo "Google Client ID: $GOOGLE_CLIENT_ID"
echo "=========================================="
echo ""

# 检查expect
if ! command -v expect &> /dev/null; then
    echo -e "${RED}❌ 需要安装 expect${NC}"
    echo "macOS: brew install expect"
    exit 1
fi

# 创建服务器端脚本
cat > /tmp/setup-env-server.sh << 'ENV_SCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="/root/honeyai"
CLIENT_ID="$1"

echo "=== 创建 .env 文件 ==="
cd "$PROJECT_DIR"

# 创建 .env 文件
cat > .env << EOF
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=$CLIENT_ID
EOF

echo "✅ .env 文件已创建"
echo ""
echo "文件内容："
cat .env
echo ""

# 验证文件
if [ -f ".env" ] && grep -q "VITE_GOOGLE_CLIENT_ID" .env; then
    echo "✅ 验证成功：.env 文件存在且包含 Client ID"
else
    echo "❌ 验证失败：.env 文件创建有问题"
    exit 1
fi
ENV_SCRIPT

echo -e "${GREEN}[1/3]${NC} 上传脚本到服务器..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/setup-env-server.sh $SERVER:/tmp/setup-env-server.sh
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
        puts "上传超时"
        exit 1
    }
    eof
}
EOF

echo -e "${GREEN}[2/3]${NC} 在服务器上执行脚本..."
expect << EOF
set timeout 60
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/setup-env-server.sh && bash /tmp/setup-env-server.sh '$GOOGLE_CLIENT_ID'"
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
        puts "执行超时"
        exit 1
    }
    eof
}
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}[3/3]${NC} 清理临时文件..."
    expect << EOF
    set timeout 30
    spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/setup-env-server.sh"
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
    rm -f /tmp/setup-env-server.sh

    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ 环境变量配置完成！${NC}"
    echo "=========================================="
    echo ""
    echo "下一步："
    echo "1. 重新构建项目（.env 文件会在构建时使用）"
    echo "2. 运行部署脚本："
    echo "   ./auto-deploy.sh"
    echo ""
    echo "或者手动在服务器上重新构建："
    echo "   ssh $SERVER"
    echo "   cd $SERVER_PROJECT_DIR"
    echo "   npm run build"
    echo "=========================================="
else
    echo ""
    echo -e "${RED}❌ 配置失败${NC}"
    exit 1
fi

