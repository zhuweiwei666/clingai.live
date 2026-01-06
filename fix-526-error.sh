#!/bin/bash

# Fix Cloudflare 526 Error Script
# This script updates Nginx configuration to work with Cloudflare

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

# Colors
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

# Check expect
if ! command -v expect &> /dev/null; then
    log_error "expect 未安装，正在安装..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install expect
    else
        sudo apt-get update && sudo apt-get install -y expect
    fi
fi

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
    "Permission denied" {
        log_error "SSH authentication failed"
        exit 1
    }
    eof
}
EOF
}

# SCP with password
scp_file() {
    expect <<EOF
set timeout 60
spawn scp -r -o StrictHostKeyChecking=no "$1" $SERVER:"$2"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF
}

log_info "开始修复 Cloudflare 526 错误..."

# Step 1: Update Nginx configuration
log_info "更新 Nginx 配置..."
scp_file "nginx.conf" "/tmp/nginx-honeyai.conf"

ssh_exec "sudo cp /tmp/nginx-honeyai.conf /etc/nginx/sites-available/honeyai && sudo rm /tmp/nginx-honeyai.conf"

# Step 2: Test Nginx configuration
log_info "测试 Nginx 配置..."
ssh_exec "sudo nginx -t"

# Step 3: Reload Nginx
log_info "重新加载 Nginx..."
ssh_exec "sudo systemctl reload nginx"

# Step 4: Verify Nginx is running
log_info "验证 Nginx 状态..."
ssh_exec "sudo systemctl status nginx --no-pager | head -10"

# Step 5: Test HTTP connection
log_info "测试 HTTP 连接..."
ssh_exec "curl -I http://localhost 2>&1 | head -5"

log_info "✅ Nginx 配置已更新"
log_info ""
log_warn "重要提示："
log_warn "1. 请在 Cloudflare 控制台将 SSL/TLS 模式设置为 'Flexible'（灵活模式）"
log_warn "2. 这样 Cloudflare 到源站使用 HTTP，不需要 SSL 证书"
log_warn "3. 或者配置 SSL 证书后使用 'Full' 模式"
log_info ""
log_info "访问地址："
log_info "  - http://clingai.live"
log_info "  - http://173.255.193.131"

