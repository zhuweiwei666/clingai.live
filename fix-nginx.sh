#!/bin/bash

# 快速修复 Nginx 配置脚本
# 用于修复显示默认 Nginx 页面的问题

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
REMOTE_DIR="/var/www/honeyai"

echo "🔧 修复 Nginx 配置..."
echo "服务器: $SERVER"
echo "部署目录: $REMOTE_DIR"
echo ""

# 检查 expect 是否安装
if ! command -v expect &> /dev/null; then
    echo "❌ 错误: 未找到 expect 命令"
    echo "请安装: brew install expect (macOS) 或 sudo apt-get install expect (Linux)"
    exit 1
fi

expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no $SERVER

expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "# " {
        # 检查部署目录是否存在文件
        send "echo '检查部署目录...'\r"
        expect "# "
        send "ls -la $REMOTE_DIR\r"
        expect "# "
        
        # 如果目录不存在或为空，提示需要先运行部署脚本
        send "if [ ! -d \"$REMOTE_DIR\" ] || [ -z \"\$(ls -A $REMOTE_DIR 2>/dev/null)\" ]; then echo '⚠️  部署目录为空，需要先运行部署脚本上传文件'; else echo '✅ 部署目录有文件'; fi\r"
        expect "# "
        
        # 创建/更新 nginx 配置
        send "echo '创建 Nginx 配置...'\r"
        expect "# "
        send "cat > /etc/nginx/sites-available/honeyai << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root $REMOTE_DIR;
    index index.html;

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}
NGINX_EOF
\r"
        expect "# "
        
        # 启用站点
        send "echo '启用站点...'\r"
        expect "# "
        send "ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/\r"
        expect "# "
        
        # 删除默认站点
        send "rm -f /etc/nginx/sites-enabled/default\r"
        expect "# "
        
        # 测试配置
        send "echo '测试 Nginx 配置...'\r"
        expect "# "
        send "nginx -t\r"
        expect "# "
        
        # 重载 nginx
        send "echo '重载 Nginx...'\r"
        expect "# "
        send "systemctl reload nginx\r"
        expect "# "
        
        # 检查 nginx 状态
        send "echo '检查 Nginx 状态...'\r"
        expect "# "
        send "systemctl status nginx --no-pager | head -5\r"
        expect "# "
        
        # 显示部署目录内容
        send "echo '部署目录内容:'\r"
        expect "# "
        send "ls -la $REMOTE_DIR | head -10\r"
        expect "# "
        
        send "exit\r"
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    timeout {
        puts "连接超时"
        exit 1
    }
}
EOF

echo ""
echo "✅ Nginx 配置修复完成！"
echo ""
echo "如果仍然显示默认页面，可能的原因："
echo "   1. 网站文件未上传 - 需要先运行部署脚本: ./Clingai-deploy-from-github.sh"
echo "   2. 文件权限问题 - 检查: ls -la $REMOTE_DIR"
echo "   3. Nginx 缓存 - 尝试清除浏览器缓存或使用无痕模式"
echo ""
echo "💡 建议：运行完整的部署脚本以确保所有文件都已上传"
echo "   ./Clingai-deploy-from-github.sh"

