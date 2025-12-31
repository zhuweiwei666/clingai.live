#!/bin/bash

# 完整部署脚本 - 包括前端、后端和环境变量配置
# 使用方法: ./deploy-full.sh

set -e

# 配置
SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"
SERVER_BACKEND_DIR="/root/honeyai/server"

# A2E API 配置
A2E_API_TOKEN="sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTUyMmFhZDI0YTQzZjAwNjA2ZTNlMmMiLCJuYW1lIjoiMTgyNzE4NDAyMjUiLCJyb2xlIjoidmlwIiwiaWF0IjoxNzY3MTQ2NDY2fQ.n24n8XI0TLbysF9rLi3Kr-By5jDtC9CTCLJOMgMDguk"
A2E_USER_ID="69522aad24a43f00606e3e2c"
A2E_BASE_URL="https://video.a2e.ai"

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

# 检查 expect 是否安装
check_expect() {
    if ! command -v expect &> /dev/null; then
        log_error "expect 未安装，正在安装..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install expect
        else
            sudo apt-get update && sudo apt-get install -y expect
        fi
    fi
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

# 1. 提交代码到 Git
commit_code() {
    log_info "提交代码到 Git..."
    
    cd /Users/zhuweiwei/ClingAI.live
    
    # 添加所有更改
    git add -A
    
    # 检查是否有更改
    if git diff --staged --quiet; then
        log_info "没有需要提交的更改"
        return 0
    fi
    
    # 提交
    git commit -m "feat: 集成 A2E API 和修复相关问题
    
    - 集成 A2E.ai API 服务
    - 添加 MyWorks 和 Settings 页面
    - 修复 Google OAuth Client ID 硬编码问题
    - 修复拼写错误和路由问题
    - 优化 Layout 组件用户体验" || true
    
    # 推送到远程
    log_info "推送到 GitHub..."
    git push origin main || log_warn "Git push 失败，继续部署..."
    
    log_info "代码提交完成"
}

# 2. 部署前端
deploy_frontend() {
    log_info "部署前端代码..."
    
    # 在服务器上拉取代码
    ssh_exec "cd $SERVER_PROJECT_DIR && git pull origin main || (cd /root && git clone https://github.com/zhuweiwei666/clingai.live.git honeyai 2>/dev/null || true)"
    
    # 创建前端 .env 文件（用于构建时注入环境变量）
    log_info "创建前端环境变量文件..."
    cat > /tmp/frontend.env << EOF
VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
EOF
    
    # 上传前端 .env 文件
    scp_file "/tmp/frontend.env" "$SERVER_PROJECT_DIR/.env"
    rm -f /tmp/frontend.env
    
    # 在服务器上构建前端
    log_info "在服务器上构建前端..."
    ssh_exec "cd $SERVER_PROJECT_DIR && npm install && npm run build"
    
    # 部署前端文件
    log_info "部署前端文件到 $SERVER_DEPLOY_DIR..."
    ssh_exec "mkdir -p $SERVER_DEPLOY_DIR && cp -r $SERVER_PROJECT_DIR/dist/* $SERVER_DEPLOY_DIR/ && chown -R www-data:www-data $SERVER_DEPLOY_DIR && chmod -R 755 $SERVER_DEPLOY_DIR"
    
    log_info "前端部署完成"
}

# 3. 部署后端
deploy_backend() {
    log_info "部署后端代码..."
    
    # 在服务器上安装后端依赖
    log_info "安装后端依赖..."
    ssh_exec "cd $SERVER_BACKEND_DIR && npm install"
    
    log_info "后端代码部署完成"
}

# 4. 配置环境变量
configure_env() {
    log_info "配置后端环境变量..."
    
    # 创建 .env 文件内容
    cat > /tmp/server.env << EOF
# ============================================
# ClingAI 后端环境变量配置
# ============================================

# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置（请根据实际情况修改）
MONGODB_URI=mongodb://localhost:27017/clingai

# Redis 配置（请根据实际情况修改）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 密钥（请修改为安全的密钥）
JWT_SECRET=clingai-jwt-secret-2024-production-change-this

# CORS 配置
CORS_ORIGIN=*

# 前端 URL
FRONTEND_URL=https://clingai.live

# ============================================
# A2E.ai API 配置
# ============================================
A2E_API_TOKEN=$A2E_API_TOKEN
A2E_USER_ID=$A2E_USER_ID
A2E_BASE_URL=$A2E_BASE_URL

# ============================================
# 支付配置（可选）
# ============================================
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# PAYPAL_CLIENT_ID=
# PAYPAL_CLIENT_SECRET=
# PAYPAL_MODE=sandbox

# ============================================
# Google OAuth 配置
# ============================================
GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# ============================================
# Cloudflare R2 Storage 配置
# ============================================
R2_ACCOUNT_ID=18f292ca4a886046b6a8ad0b3fa316a0
R2_ACCESS_KEY_ID=a22464d3f1b4513b76081065e0aef973
R2_SECRET_ACCESS_KEY=0b78b662d3d9b8eddd6d49b147ca37cf9f0e86077a3245d29f4a8bd02fedaa57
R2_BUCKET_NAME=clingailive
R2_PUBLIC_URL=https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev
R2_ENDPOINT=https://18f292ca4a886046b6a8ad0b3fa316a0.r2.cloudflarestorage.com
EOF

    # 上传 .env 文件
    log_info "上传 .env 文件到服务器..."
    scp_file "/tmp/server.env" "$SERVER_BACKEND_DIR/.env"
    
    # 清理临时文件
    rm -f /tmp/server.env
    
    log_info "环境变量配置完成"
}

# 5. 重启服务
restart_services() {
    log_info "重启后端服务..."
    
    # 使用 PM2 重启服务
    ssh_exec "cd $SERVER_PROJECT_DIR && pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs || (cd $SERVER_BACKEND_DIR && pm2 start index.js --name clingai-api && pm2 start workers/generateWorker.js --name clingai-worker)"
    
    # 重启 Nginx
    log_info "重启 Nginx..."
    ssh_exec "systemctl reload nginx || systemctl restart nginx"
    
    log_info "服务重启完成"
}

# 6. 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 检查 PM2 服务状态
    log_info "检查 PM2 服务状态..."
    ssh_exec "pm2 list"
    
    # 检查 Nginx 状态
    log_info "检查 Nginx 状态..."
    ssh_exec "systemctl status nginx --no-pager | head -10"
    
    log_info "部署验证完成"
}

# 主函数
main() {
    echo "=========================================="
    echo "🚀 开始完整部署"
    echo "=========================================="
    echo "服务器: $SERVER"
    echo "项目目录: $SERVER_PROJECT_DIR"
    echo "部署目录: $SERVER_DEPLOY_DIR"
    echo "=========================================="
    echo ""
    
    # 检查工具
    check_expect
    
    # 执行部署步骤
    commit_code
    deploy_frontend
    deploy_backend
    configure_env
    restart_services
    verify_deployment
    
    echo ""
    echo "=========================================="
    log_info "✅ 部署完成！"
    echo "=========================================="
    echo "🌐 前端地址: http://173.255.193.131"
    echo "🔌 后端 API: http://173.255.193.131:3001/api"
    echo "📝 查看日志: ssh $SERVER 'pm2 logs'"
    echo "=========================================="
}

# 运行主函数
main

