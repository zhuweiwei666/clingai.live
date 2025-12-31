#!/bin/bash
# 查看服务器日志脚本

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

echo "=== 查看 A2E API 相关日志 ==="
echo ""

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "pm2 logs clingai-api --lines 100 --nostream | grep -E 'A2E|Generate|task|externalTaskId' | tail -50"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

echo ""
echo "=== 查看 Worker 日志 ==="
echo ""

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "pm2 logs clingai-worker --lines 100 --nostream | grep -E 'A2E|Worker|task|externalTaskId' | tail -50"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

echo ""
echo "=== 查看最近的错误日志 ==="
echo ""

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "pm2 logs --err --lines 50 --nostream | tail -30"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

