#!/bin/bash

###############################################################################
# 快速修复部署脚本
# 直接部署到服务器，修复Nginx显示默认页面的问题
###############################################################################

set -e

# 配置
SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "🔧 快速修复部署"
echo "=========================================="
echo ""

# 检查expect
if ! command -v expect &> /dev/null; then
    echo -e "${RED}❌ 需要安装 expect${NC}"
    echo "macOS: brew install expect"
    exit 1
fi

# 步骤1: 服务器拉取代码
echo -e "${GREEN}[1/6]${NC} 服务器拉取代码..."
expect << 'EXPECT_SCRIPT'
set timeout 300
spawn ssh -o StrictHostKeyChecking=no root@173.255.193.131

expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "# " {
        # 检查并克隆/更新代码
        send "if [ ! -d '/root/honeyai' ]; then mkdir -p /root/honeyai && cd /root/honeyai && git clone git@github.com:zhuweiwei666/clingai.live.git . || git clone https://github.com/zhuweiwei666/clingai.live.git .; else cd /root/honeyai && git fetch origin && git reset --hard origin/main || git reset --hard origin/master; fi\r"
        expect "# "
        
        # 步骤2: 安装依赖
        send "echo '=== [2/6] 安装依赖 ==='\r"
        expect "# "
        send "cd /root/honeyai && if ! command -v node &> /dev/null; then curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs; fi\r"
        expect "# "
        send "cd /root/honeyai && npm install\r"
        expect "# "
        
        # 步骤3: 构建项目
        send "echo '=== [3/6] 构建项目 ==='\r"
        expect "# "
        send "cd /root/honeyai && rm -rf dist && npm run build\r"
        expect "# "
        
        # 检查构建结果
        send "if [ ! -d '/root/honeyai/dist' ] || [ -z \"\$(ls -A /root/honeyai/dist 2>/dev/null)\" ]; then echo '构建失败'; exit 1; else echo '构建成功'; fi\r"
        expect "# "
        
        # 步骤4: 部署文件
        send "echo '=== [4/6] 部署文件 ==='\r"
        expect "# "
        send "mkdir -p /var/www/honeyai\r"
        expect "# "
        send "cp -r /root/honeyai/dist/* /var/www/honeyai/\r"
        expect "# "
        send "chown -R www-data:www-data /var/www/honeyai\r"
        expect "# "
        send "chmod -R 755 /var/www/honeyai\r"
        expect "# "
        
        # 步骤5: 配置Nginx
        send "echo '=== [5/6] 配置Nginx ==='\r"
        expect "# "
        send "cat > /etc/nginx/sites-available/honeyai << 'NGINX_EOF'\r"
        expect "# "
        send "server {\r"
        expect "# "
        send "    listen 80;\r"
        expect "# "
        send "    server_name _;\r"
        expect "# "
        send "    root /var/www/honeyai;\r"
        expect "# "
        send "    index index.html;\r"
        expect "# "
        send "\r"
        expect "# "
        send "    location / {\r"
        expect "# "
        send "        try_files \\\$uri \\\$uri/ /index.html;\r"
        expect "# "
        send "    }\r"
        expect "# "
        send "\r"
        expect "# "
        send "    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {\r"
        expect "# "
        send "        expires 1y;\r"
        expect "# "
        send "        add_header Cache-Control \"public, immutable\";\r"
        expect "# "
        send "    }\r"
        expect "# "
        send "}\r"
        expect "# "
        send "NGINX_EOF\r"
        expect "# "
        
        send "ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/\r"
        expect "# "
        send "rm -f /etc/nginx/sites-enabled/default\r"
        expect "# "
        
        # 步骤6: 重启Nginx
        send "echo '=== [6/6] 重启Nginx ==='\r"
        expect "# "
        send "nginx -t && systemctl reload nginx || systemctl restart nginx\r"
        expect "# "
        
        send "echo '=== 部署完成 ==='\r"
        expect "# "
        send "ls -lh /var/www/honeyai/ | head -10\r"
        expect "# "
        
        send "exit\r"
    }
    timeout {
        puts "连接超时"
        exit 1
    }
}
EXPECT_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo "=========================================="
    echo "🌐 网站地址: http://173.255.193.131"
    echo ""
    echo "如果仍然显示默认页面，请："
    echo "1. 清除浏览器缓存"
    echo "2. 等待几秒后刷新页面"
    echo "3. 检查: ssh root@173.255.193.131 'ls -la /var/www/honeyai'"
else
    echo ""
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi

