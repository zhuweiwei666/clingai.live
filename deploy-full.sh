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

# 4. 配置环境变量（智能合并，保留现有变量）
configure_env() {
    log_info "配置后端环境变量（智能合并模式）..."
    
    # 在服务器上备份现有 .env 文件
    ssh_exec "if [ -f $SERVER_BACKEND_DIR/.env ]; then cp $SERVER_BACKEND_DIR/.env $SERVER_BACKEND_DIR/.env.backup.\$(date +%Y%m%d_%H%M%S); fi" || true
    
    # 创建更新脚本，智能合并环境变量
    cat > /tmp/update_env.sh << 'ENVSCRIPT'
#!/bin/bash
ENV_FILE="$1"

# 如果 .env 文件不存在，创建新文件
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

# 定义需要更新的环境变量（格式：KEY=VALUE）
declare -A env_updates=(
    ["PORT"]="3001"
    ["NODE_ENV"]="production"
    ["MONGODB_URI"]="mongodb://localhost:27017/clingai"
    ["REDIS_HOST"]="localhost"
    ["REDIS_PORT"]="6379"
    ["REDIS_PASSWORD"]=""
    ["JWT_SECRET"]="clingai-jwt-secret-2024-production-change-this"
    ["CORS_ORIGIN"]="*"
    ["FRONTEND_URL"]="https://clingai.live"
    ["A2E_API_TOKEN"]="ENV_A2E_API_TOKEN"
    ["A2E_USER_ID"]="ENV_A2E_USER_ID"
    ["A2E_BASE_URL"]="ENV_A2E_BASE_URL"
    ["GOOGLE_CLIENT_ID"]="1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com"
    ["GOOGLE_CLIENT_SECRET"]="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"
    ["R2_ACCOUNT_ID"]="18f292ca4a886046b6a8ad0b3fa316a0"
    ["R2_ACCESS_KEY_ID"]="a22464d3f1b4513b76081065e0aef973"
    ["R2_SECRET_ACCESS_KEY"]="0b78b662d3d9b8eddd6d49b147ca37cf9f0e86077a3245d29f4a8bd02fedaa57"
    ["R2_BUCKET_NAME"]="clingailive"
    ["R2_PUBLIC_URL"]="https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev"
    ["R2_ENDPOINT"]="https://18f292ca4a886046b6a8ad0b3fa316a0.r2.cloudflarestorage.com"
)

# 创建临时文件
TMP_FILE=$(mktemp)

# 读取现有 .env 文件，保留注释和未定义的变量
while IFS= read -r line || [ -n "$line" ]; do
    # 跳过空行和注释
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        echo "$line" >> "$TMP_FILE"
        continue
    fi
    
    # 提取键名
    key=$(echo "$line" | cut -d'=' -f1 | xargs)
    
    # 如果这个键需要更新，跳过（后面会添加新值）
    if [[ -n "${env_updates[$key]}" ]]; then
        continue
    fi
    
    # 保留其他变量
    echo "$line" >> "$TMP_FILE"
done < "$ENV_FILE"

# 添加/更新需要的环境变量
echo "" >> "$TMP_FILE"
echo "# ============================================" >> "$TMP_FILE"
echo "# ClingAI 后端环境变量配置（自动更新于 $(date)）" >> "$TMP_FILE"
echo "# ============================================" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# 服务器配置" >> "$TMP_FILE"
echo "PORT=${env_updates[PORT]}" >> "$TMP_FILE"
echo "NODE_ENV=${env_updates[NODE_ENV]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# 数据库配置" >> "$TMP_FILE"
echo "MONGODB_URI=${env_updates[MONGODB_URI]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# Redis 配置" >> "$TMP_FILE"
echo "REDIS_HOST=${env_updates[REDIS_HOST]}" >> "$TMP_FILE"
echo "REDIS_PORT=${env_updates[REDIS_PORT]}" >> "$TMP_FILE"
echo "REDIS_PASSWORD=${env_updates[REDIS_PASSWORD]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# JWT 密钥" >> "$TMP_FILE"
echo "JWT_SECRET=${env_updates[JWT_SECRET]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# CORS 配置" >> "$TMP_FILE"
echo "CORS_ORIGIN=${env_updates[CORS_ORIGIN]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# 前端 URL" >> "$TMP_FILE"
echo "FRONTEND_URL=${env_updates[FRONTEND_URL]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# ============================================" >> "$TMP_FILE"
echo "# A2E.ai API 配置" >> "$TMP_FILE"
echo "# ============================================" >> "$TMP_FILE"
echo "A2E_API_TOKEN=${env_updates[A2E_API_TOKEN]}" >> "$TMP_FILE"
echo "A2E_USER_ID=${env_updates[A2E_USER_ID]}" >> "$TMP_FILE"
echo "A2E_BASE_URL=${env_updates[A2E_BASE_URL]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# ============================================" >> "$TMP_FILE"
echo "# Google OAuth 配置" >> "$TMP_FILE"
echo "# ============================================" >> "$TMP_FILE"
echo "GOOGLE_CLIENT_ID=${env_updates[GOOGLE_CLIENT_ID]}" >> "$TMP_FILE"
echo "GOOGLE_CLIENT_SECRET=${env_updates[GOOGLE_CLIENT_SECRET]}" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "# ============================================" >> "$TMP_FILE"
echo "# Cloudflare R2 Storage 配置" >> "$TMP_FILE"
echo "# ============================================" >> "$TMP_FILE"
echo "R2_ACCOUNT_ID=${env_updates[R2_ACCOUNT_ID]}" >> "$TMP_FILE"
echo "R2_ACCESS_KEY_ID=${env_updates[R2_ACCESS_KEY_ID]}" >> "$TMP_FILE"
echo "R2_SECRET_ACCESS_KEY=${env_updates[R2_SECRET_ACCESS_KEY]}" >> "$TMP_FILE"
echo "R2_BUCKET_NAME=${env_updates[R2_BUCKET_NAME]}" >> "$TMP_FILE"
echo "R2_PUBLIC_URL=${env_updates[R2_PUBLIC_URL]}" >> "$TMP_FILE"
echo "R2_ENDPOINT=${env_updates[R2_ENDPOINT]}" >> "$TMP_FILE"

# 替换占位符
sed -i "s|ENV_A2E_API_TOKEN|$2|g" "$TMP_FILE"
sed -i "s|ENV_A2E_USER_ID|$3|g" "$TMP_FILE"
sed -i "s|ENV_A2E_BASE_URL|$4|g" "$TMP_FILE"

# 移动临时文件到目标位置
mv "$TMP_FILE" "$ENV_FILE"
ENVSCRIPT

    # 上传更新脚本到服务器
    scp_file "/tmp/update_env.sh" "/tmp/update_env.sh"
    
    # 在服务器上执行更新脚本
    log_info "智能合并环境变量..."
    ssh_exec "chmod +x /tmp/update_env.sh && /tmp/update_env.sh $SERVER_BACKEND_DIR/.env '$A2E_API_TOKEN' '$A2E_USER_ID' '$A2E_BASE_URL'"
    
    # 清理临时文件
    rm -f /tmp/update_env.sh
    ssh_exec "rm -f /tmp/update_env.sh"
    
    log_info "环境变量配置完成（已保留现有变量）"
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

