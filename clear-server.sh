#!/bin/bash
# 清空服务器文件脚本 - 用于重构

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"
SERVER_BACKEND_DIR="/root/honeyai/server"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH 执行命令
ssh_exec() {
    expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "$1"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF
}

log_warn "⚠️  警告：此操作将清空服务器上的所有项目文件！"
log_warn "包括："
log_warn "  - /root/honeyai/ (项目目录，约 812M)"
log_warn "  - /var/www/honeyai/ (前端部署目录)"
log_warn "  - /var/www/honeyai-admin/ (管理后台目录)"
log_warn "  - PM2 进程将被停止并删除"
log_warn "  - PM2 日志将被清空"
echo ""
read -p "确认要继续吗？(输入 'YES' 继续): " confirm

if [ "$confirm" != "YES" ]; then
    log_error "操作已取消"
    exit 1
fi

log_info "开始清空服务器文件..."

# 1. 停止并删除 PM2 进程
log_info "停止 PM2 进程..."
ssh_exec "pm2 stop all || true"
ssh_exec "pm2 delete all || true"
ssh_exec "pm2 kill || true"

# 2. 备份重要的 .env 文件（如果存在）
log_info "备份 .env 文件..."
ssh_exec "if [ -f $SERVER_BACKEND_DIR/.env ]; then mkdir -p /root/backup_\$(date +%Y%m%d_%H%M%S) && cp $SERVER_BACKEND_DIR/.env /root/backup_\$(date +%Y%m%d_%H%M%S)/.env.backup && echo '已备份 .env 文件'; fi" || true

# 3. 清空项目目录
log_info "清空项目目录: $SERVER_PROJECT_DIR"
ssh_exec "rm -rf $SERVER_PROJECT_DIR/* $SERVER_PROJECT_DIR/.* 2>/dev/null || true"
ssh_exec "rm -rf $SERVER_PROJECT_DIR || true"

# 4. 清空前端部署目录（如果存在）
log_info "清空前端部署目录: $SERVER_DEPLOY_DIR"
ssh_exec "rm -rf $SERVER_DEPLOY_DIR/* $SERVER_DEPLOY_DIR/.* 2>/dev/null || true"
ssh_exec "rm -rf $SERVER_DEPLOY_DIR || true"

# 4.1 清空管理后台目录
log_info "清空管理后台目录: /var/www/honeyai-admin"
ssh_exec "rm -rf /var/www/honeyai-admin/* /var/www/honeyai-admin/.* 2>/dev/null || true"
ssh_exec "rm -rf /var/www/honeyai-admin || true"

# 5. 清理 PM2 日志
log_info "清理 PM2 日志..."
ssh_exec "pm2 flush || true"

# 6. 验证清空结果
log_info "验证清空结果..."
ssh_exec "ls -la $SERVER_PROJECT_DIR 2>/dev/null || echo '项目目录已清空'"
ssh_exec "pm2 list"

log_info "✅ 服务器文件清空完成！"
log_info "📝 注意：.env 文件已备份到 /root/backup_* 目录（如果存在）"

