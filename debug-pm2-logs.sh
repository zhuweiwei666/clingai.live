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

echo "Checking PM2 Error Logs..."
ssh_exec "ls -la /root/.pm2/logs/"
ssh_exec "tail -n 50 /root/.pm2/logs/clingai-api-error.log"
ssh_exec "tail -n 50 /root/.pm2/logs/clingai-api-out.log"

