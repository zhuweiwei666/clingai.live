#!/bin/bash

echo "=== 修复 Nginx 重定向循环问题 ==="

expect << 'EXPECT_SCRIPT'
set timeout 120
spawn ssh -o StrictHostKeyChecking=no root@173.255.193.131

expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "# " {
        # 连接成功
    }
}

# 检查当前 Nginx 配置
send "echo '=== 当前 Nginx 配置 ==='\r"
expect "# "
send "cat /etc/nginx/sites-available/honeyai\r"
expect "# "

# 测试后端API是否正常
send "echo '=== 测试后端 API ==='\r"
expect "# "
send "curl -I http://139.162.62.115/api/users/google-login 2>/dev/null | head -5\r"
expect "# "

# 重写 Nginx 配置 - 修复重定向循环
send "cat > /etc/nginx/sites-available/honeyai << 'NGINX_CONF'
server {
    listen 80;
    server_name clingai.live www.clingai.live;
    return 301 https://clingai.live\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clingai.live www.clingai.live;

    ssl_certificate /etc/letsencrypt/live/clingai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clingai.live/privkey.pem;

    root /var/www/honeyai;
    index index.html;

    # API 反向代理 - 修复重定向问题
    location /api/ {
        # 使用 HTTP 代理到后端
        proxy_pass http://139.162.62.115/api/;
        proxy_http_version 1.1;
        
        # 保持原始 Host 为后端地址
        proxy_set_header Host 139.162.62.115;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 禁止重定向跟随
        proxy_redirect off;
        
        # 连接超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 前端路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}
NGINX_CONF
\r"
expect "# "

# 测试配置
send "nginx -t\r"
expect "# "

# 重启 Nginx
send "systemctl reload nginx\r"
expect "# "

# 测试API代理
send "echo '=== 测试 API 代理 ==='\r"
expect "# "
send "curl -I https://clingai.live/api/users/google-login 2>/dev/null | head -10\r"
expect "# "

send "echo '=== 修复完成 ==='\r"
expect "# "

send "exit\r"
expect eof
EXPECT_SCRIPT

echo "=== 完成 ==="
