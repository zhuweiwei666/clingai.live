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

echo "1. Reading .env content (checking PORT)..."
ssh_exec "grep PORT /root/honeyai/server/.env || echo 'PORT not found in .env'"

echo "2. Stopping PM2..."
ssh_exec "pm2 stop clingai-api"

echo "3. Running manually..."
ssh_exec "cd /root/honeyai/server && node index.js & PID=\$! && sleep 5 && kill \$PID"

echo "Done."

