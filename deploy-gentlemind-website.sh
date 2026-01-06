#!/bin/bash
# 部署 GentleMind 网站到服务器

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"
WEBSITE_DIR="gentlemind-website"
SERVER_DIR="/var/www/gentlemind"

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

# 上传文件
scp_file() {
    expect << EOF
set timeout 60
spawn scp -r -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$1" $SERVER:"$2"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF
}

log_info "开始部署 GentleMind 网站..."

# 检查本地网站目录是否存在
if [ ! -d "$WEBSITE_DIR" ]; then
    log_error "网站目录 $WEBSITE_DIR 不存在！"
    exit 1
fi

# 1. 备份现有网站（如果存在）
log_info "备份现有网站..."
ssh_exec "if [ -d $SERVER_DIR ]; then cp -r $SERVER_DIR ${SERVER_DIR}.backup.\$(date +%Y%m%d_%H%M%S) && echo '备份完成'; fi" || true

# 2. 清空目标目录
log_info "清空目标目录..."
ssh_exec "rm -rf $SERVER_DIR/*"

# 3. 上传网站文件
log_info "上传网站文件..."
scp_file "$WEBSITE_DIR" "/tmp/gentlemind-website"

# 4. 移动文件到正确位置并设置权限
log_info "设置文件权限..."
ssh_exec "mv /tmp/gentlemind-website/* $SERVER_DIR/ && chown -R www-data:www-data $SERVER_DIR && chmod -R 755 $SERVER_DIR && echo '文件权限设置完成'"

# 5. 验证部署
log_info "验证部署..."
ssh_exec "ls -la $SERVER_DIR/ && echo '' && echo '文件数量:' && find $SERVER_DIR -type f | wc -l"

log_info "✅ 网站部署完成！"
log_info "🌐 网站地址: https://gentlemind.net"
log_info "📝 网站文件目录: $SERVER_DIR"

