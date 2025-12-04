#!/bin/bash
SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

echo "=== 检查并修复 Nginx 代理配置 ==="

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
send "cat /etc/nginx/sites-available/honeyai | grep -A 20 'location /api/'\r"
expect "# "

# 修复 Nginx 配置 - 确保使用正确的代理设置
send "cat > /etc/nginx/sites-available/honeyai << 'NGINX_CONF'
server {
    listen 80;
    server_name clingai.live www.clingai.live;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clingai.live www.clingai.live;

    ssl_certificate /etc/letsencrypt/live/clingai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clingai.live/privkey.pem;

    root /var/www/honeyai;
    index index.html;

    # API 反向代理
    location /api/ {
        proxy_pass http://139.162.62.115/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
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

send "echo '=== 修复完成 ==='\r"
expect "# "

send "exit\r"
expect eof
EXPECT_SCRIPT

echo "=== Nginx 配置已更新 ==="
