#!/bin/bash

# 更新 Nginx HTTPS 配置，包含 API 代理

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
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

# SCP 传输文件
scp_file() {
    local local_path="$1"
    local remote_path="$2"
    expect << EOF
set timeout 60
spawn scp -r -o StrictHostKeyChecking=no "$local_path" "$SERVER:$remote_path"
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

log_info "更新 Nginx HTTPS 配置..."

# 备份现有配置
ssh_exec "cp /etc/nginx/sites-available/honeyai /etc/nginx/sites-available/honeyai.backup.`date +%Y%m%d_%H%M%S`"

# 上传新的 HTTPS 配置
scp_file "/Users/zhuweiwei/ClingAI.live/nginx-ssl-full.conf" "/tmp/honeyai-ssl.conf"

# 更新配置
ssh_exec "cp /tmp/honeyai-ssl.conf /etc/nginx/sites-available/honeyai && rm /tmp/honeyai-ssl.conf"

# 测试配置
log_info "测试 Nginx 配置..."
ssh_exec "nginx -t"

# 重新加载 Nginx
log_info "重新加载 Nginx..."
ssh_exec "systemctl reload nginx"

log_info "✅ Nginx HTTPS 配置已更新"

