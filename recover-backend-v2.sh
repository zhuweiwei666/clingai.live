#!/bin/bash

# Backend Recovery Script V2 - Force Restart

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

ssh_exec() {
    expect <<EOF
set timeout 60
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

echo "1. Checking MongoDB..."
ssh_exec "systemctl status mongod || systemctl start mongod"

echo "2. Stopping existing PM2 processes..."
ssh_exec "pm2 delete clingai-api || true"
ssh_exec "pm2 delete clingai-worker || true"

echo "3. Starting Backend (API + Worker)..."
# Use --update-env to ensure environment variables are fresh
ssh_exec "cd /root/honeyai/server && pm2 start index.js --name clingai-api --update-env"
ssh_exec "cd /root/honeyai/server && pm2 start workers/generateWorker.js --name clingai-worker --update-env"

echo "4. Checking Ports..."
# Using lsof as netstat might be missing, or just rely on PM2 logs
ssh_exec "lsof -i :3001 || ss -lntp | grep 3001 || echo 'Cannot check port'"

echo "5. Verifying Local Health..."
ssh_exec "curl -v http://127.0.0.1:3001/api/health"

echo "Done."

