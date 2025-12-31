#!/bin/bash

# 安装 PM2 并启动后端服务

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_BACKEND_DIR="/root/honeyai/server"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# SSH 执行命令
ssh_exec() {
    local command="$1"
    expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SERVER" "$command"
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

log_info "安装 PM2..."
ssh_exec "npm install -g pm2"

log_info "启动后端服务..."
ssh_exec "cd $SERVER_PROJECT_DIR && pm2 start ecosystem.config.cjs || (cd $SERVER_BACKEND_DIR && pm2 start index.js --name clingai-api && pm2 start workers/generateWorker.js --name clingai-worker)"

log_info "保存 PM2 配置..."
ssh_exec "pm2 save"

log_info "设置 PM2 开机自启..."
ssh_exec "pm2 startup"

log_info "检查服务状态..."
ssh_exec "pm2 list"

echo ""
log_info "✅ PM2 安装和服务启动完成！"
echo "查看日志: ssh $SERVER 'pm2 logs'"
echo "重启服务: ssh $SERVER 'pm2 restart all'"

