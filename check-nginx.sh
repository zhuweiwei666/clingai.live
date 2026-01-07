#!/bin/bash

# Nginx Health Check & Fix Script

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

echo "1. Checking Nginx Config..."
ssh_exec "nginx -t"

echo "2. Restarting Nginx..."
ssh_exec "systemctl restart nginx || service nginx restart"

echo "3. Checking Nginx Status..."
ssh_exec "systemctl status nginx --no-pager"

echo "4. Checking Ports (80/443)..."
ssh_exec "ss -lntp | grep nginx || netstat -lntp | grep nginx"

echo "5. Checking Firewall (UFW)..."
ssh_exec "ufw status || echo 'UFW not installed'"

echo "Done."

