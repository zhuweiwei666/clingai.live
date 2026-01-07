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

echo "1. Checking SSL Files..."
ssh_exec "ls -la /etc/nginx/ssl/clingai.live.*"

echo "2. Checking Nginx Config File on Server..."
ssh_exec "cat /etc/nginx/sites-enabled/honeyai | grep 443"

echo "3. Stopping Nginx..."
ssh_exec "systemctl stop nginx"

echo "4. Starting Nginx (Clean Start)..."
ssh_exec "systemctl start nginx"

echo "5. Checking Nginx Status..."
ssh_exec "systemctl status nginx --no-pager"

echo "6. Checking Ports again..."
ssh_exec "ss -lntp | grep nginx"

echo "7. Checking Error Log..."
ssh_exec "tail -n 20 /var/log/nginx/error.log"

echo "Done."

