#!/bin/bash

# Remove conflicting GentleMind site and ensure HoneyAI is default

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

# SSH execute with password
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

echo "Removing conflicting sites..."
ssh_exec "rm -f /etc/nginx/sites-enabled/gentlemind.net"
ssh_exec "rm -f /etc/nginx/sites-enabled/default"

echo "Reloading Nginx..."
ssh_exec "nginx -t && systemctl reload nginx"

echo "Checking enabled sites..."
ssh_exec "ls -la /etc/nginx/sites-enabled"

echo "Done."

