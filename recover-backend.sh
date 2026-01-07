#!/bin/bash

# Backend Recovery Script

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

echo "1. Checking/Starting MongoDB..."
ssh_exec "systemctl start mongod || systemctl start mongodb || /etc/init.d/mongodb start"

echo "2. Verifying MongoDB connection..."
ssh_exec "mongosh --eval 'db.runCommand({ ping: 1 })' || mongo --eval 'db.runCommand({ ping: 1 })'"

echo "3. Restarting Backend..."
ssh_exec "cd /root/honeyai/server && npm install && pm2 restart clingai-api || pm2 start index.js --name clingai-api"

echo "4. Checking PM2 status..."
ssh_exec "pm2 list"

echo "5. Checking Port 3001..."
ssh_exec "netstat -tulnp | grep 3001"

echo "Done."

