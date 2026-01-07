#!/bin/bash

set -e
SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

ssh_exec() {
    expect <<EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "$1"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF
}

echo "1. Disabling admin site (temp)..."
ssh_exec "rm -f /etc/nginx/sites-enabled/admin.clingai.live"

echo "2. Writing simplified Nginx config..."
# We write directly to a file on server to avoid transfer issues
cat > nginx-simple.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name clingai.live www.clingai.live 173.255.193.131;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name clingai.live www.clingai.live 173.255.193.131;

    ssl_certificate /etc/nginx/ssl/clingai.live.crt;
    ssl_certificate_key /etc/nginx/ssl/clingai.live.key;

    location / {
        root /var/www/honeyai;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINX_CONF

# Upload using scp
expect <<EOF
set timeout 30
spawn scp -o StrictHostKeyChecking=no nginx-simple.conf $SERVER:/etc/nginx/sites-available/honeyai
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

echo "3. Reloading Nginx..."
ssh_exec "ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/honeyai"
ssh_exec "nginx -t && systemctl restart nginx"

echo "4. Checking Ports..."
ssh_exec "ss -lntp | grep nginx"

echo "Done."

