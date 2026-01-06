#!/bin/bash

# Install Cloudflare Origin Certificate Script
# This script installs the SSL certificate and updates Nginx configuration

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
    "yes/no" {
        send "yes\r"
        exp_continue
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
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF
}

log_info "开始安装 Cloudflare Origin Certificate..."

# Step 1: Create SSL directory on server
log_info "创建 SSL 证书目录..."
ssh_exec "sudo mkdir -p /etc/nginx/ssl && sudo chmod 700 /etc/nginx/ssl"

# Step 2: Upload certificate files
log_info "上传 SSL 证书文件..."
scp_file "cloudflare-origin.crt" "/tmp/clingai.live.crt"
scp_file "cloudflare-origin.key" "/tmp/clingai.live.key"

# Step 3: Move certificate files to SSL directory
log_info "安装 SSL 证书..."
ssh_exec "sudo mv /tmp/clingai.live.crt /etc/nginx/ssl/ && sudo mv /tmp/clingai.live.key /etc/nginx/ssl/ && sudo chmod 600 /etc/nginx/ssl/clingai.live.key && sudo chmod 644 /etc/nginx/ssl/clingai.live.crt && sudo chown root:root /etc/nginx/ssl/clingai.live.*"

# Step 4: Upload updated Nginx configuration
log_info "更新 Nginx 配置..."
scp_file "nginx-ssl-full.conf" "/tmp/nginx-honeyai-ssl.conf"

# Step 5: Backup old config and install new config
log_info "备份并安装新的 Nginx 配置..."
ssh_exec "sudo cp /etc/nginx/sites-available/honeyai /etc/nginx/sites-available/honeyai.backup.\$(date +%Y%m%d_%H%M%S) && sudo cp /tmp/nginx-honeyai-ssl.conf /etc/nginx/sites-available/honeyai && sudo rm /tmp/nginx-honeyai-ssl.conf"

# Step 6: Test Nginx configuration
log_info "测试 Nginx 配置..."
ssh_exec "sudo nginx -t"

# Step 7: Reload Nginx
log_info "重新加载 Nginx..."
ssh_exec "sudo systemctl reload nginx"

# Step 8: Verify SSL certificate
log_info "验证 SSL 证书..."
ssh_exec "sudo openssl x509 -in /etc/nginx/ssl/clingai.live.crt -text -noout | grep -E 'Subject:|Issuer:|Not Before|Not After'"

# Step 9: Test HTTPS connection
log_info "测试 HTTPS 连接..."
ssh_exec "curl -I https://localhost 2>&1 | head -5 || echo 'HTTPS test completed'"

log_info ""
log_info "✅ SSL 证书安装完成！"
log_info ""
log_warn "重要提示："
log_warn "1. 请在 Cloudflare 控制台将 SSL/TLS 模式设置为 'Full (strict)'"
log_warn "2. 这样 Cloudflare 到源站使用 HTTPS，并且验证证书有效性"
log_warn "3. 访问 https://clingai.live 应该可以正常访问"
log_info ""
log_info "证书信息："
log_info "  - 证书文件: /etc/nginx/ssl/clingai.live.crt"
log_info "  - 私钥文件: /etc/nginx/ssl/clingai.live.key"
log_info "  - 配置备份: /etc/nginx/sites-available/honeyai.backup.*"

