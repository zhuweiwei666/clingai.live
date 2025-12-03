#!/bin/bash

###############################################################################
# 修复部署脚本 - 使用更可靠的方法
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔧 修复部署脚本${NC}"
echo "=========================================="
echo ""

# 创建服务器端部署脚本
cat > /tmp/server-deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="/root/honeyai"
DEPLOY_DIR="/var/www/honeyai"
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"

echo "=== [1/6] 拉取代码 ==="
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git clone "$GITHUB_REPO" . || git clone "https://github.com/zhuweiwei666/clingai.live.git" .
else
    cd "$PROJECT_DIR"
    git fetch origin
    git reset --hard origin/main || git reset --hard origin/master
fi

echo "=== [2/6] 安装/升级Node.js和依赖 ==="
# 使用nvm安装Node.js 18（避免包冲突）
if [ ! -d "$HOME/.nvm" ]; then
    echo "安装nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# 加载nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装并使用Node.js 18
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "安装Node.js 18..."
    nvm install 18
    nvm use 18
    nvm alias default 18
fi

# 验证版本
node --version
npm --version
npm install

echo "=== [3/6] 构建项目 ==="
rm -rf dist
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "构建失败：dist目录为空"
    exit 1
fi

echo "=== [4/6] 部署文件 ==="
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR"/
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo "=== [5/6] 配置Nginx ==="
cat > /etc/nginx/sites-available/honeyai << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root /var/www/honeyai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "=== [6/6] 重启Nginx ==="
nginx -t
systemctl reload nginx || systemctl restart nginx

echo "=== 部署完成 ==="
ls -lh "$DEPLOY_DIR" | head -10
DEPLOY_SCRIPT

echo -e "${GREEN}[1/3]${NC} 上传部署脚本到服务器..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/server-deploy.sh $SERVER:/tmp/server-deploy.sh
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

echo -e "${GREEN}[2/3]${NC} 在服务器上执行部署脚本..."
expect << EOF
set timeout 600
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/server-deploy.sh && bash /tmp/server-deploy.sh"
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

echo ""
echo -e "${GREEN}[3/3]${NC} 清理临时文件..."
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/server-deploy.sh"
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

rm -f /tmp/server-deploy.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "=========================================="
echo "🌐 网站地址: http://173.255.193.131"
echo ""
echo "如果仍然显示默认页面："
echo "1. 清除浏览器缓存 (Ctrl+Shift+Delete)"
echo "2. 硬刷新页面 (Ctrl+Shift+R 或 Cmd+Shift+R)"
echo "3. 等待几秒后重试"
echo "=========================================="

