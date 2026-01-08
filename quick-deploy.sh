#!/bin/bash
# 快速部署脚本 - 手动执行关键步骤

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

echo "=== 快速部署开始 ==="

# 1. 本地构建前端
echo "[1/5] 本地构建前端..."
cd /Users/zhuweiwei/ClingAI.live
npm run build

# 2. 本地构建 Admin
echo "[2/5] 本地构建 Admin..."
cd /Users/zhuweiwei/ClingAI.live/admin
npm run build

# 3. 上传前端到服务器
echo "[3/5] 上传前端到服务器..."
cd /Users/zhuweiwei/ClingAI.live
expect << 'EOF'
set timeout 120
spawn scp -r dist/* root@173.255.193.131:/var/www/honeyai/
expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

# 4. 上传 Admin 到服务器
echo "[4/5] 上传 Admin 到服务器..."
expect << 'EOF'
set timeout 120
spawn scp -r /Users/zhuweiwei/ClingAI.live/admin/dist/* root@173.255.193.131:/var/www/honeyai-admin/
expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

# 5. 更新服务器后端代码并重启 PM2
echo "[5/5] 更新服务器后端并重启..."
expect << 'EOF'
set timeout 180
spawn ssh root@173.255.193.131
expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "#" {
        send "cd /root/honeyai && git fetch --all && git reset --hard origin/main && git clean -fd\r"
        expect "#"
        send "cd /root/honeyai/server && npm install --legacy-peer-deps\r"
        expect "#"
        send "pm2 restart clingai-api clingai-worker --update-env\r"
        expect "#"
        send "pm2 list\r"
        expect "#"
        send "exit\r"
    }
}
expect eof
EOF

echo ""
echo "=== 部署完成！ ==="
echo "访问 https://clingai.live/ 查看效果"

