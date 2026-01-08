#!/bin/bash

# =============================================
# ClingAI 数据库安装脚本 - Ubuntu/Debian
# 安装 MongoDB 和 Redis
# =============================================

set -e

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

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本: sudo ./setup-database.sh"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt-get update -y
    apt-get upgrade -y
}

# =============================================
# 安装 MongoDB 7.0
# =============================================
install_mongodb() {
    log_info "安装 MongoDB 7.0..."
    
    # 检查是否已安装
    if command -v mongod &> /dev/null; then
        log_warn "MongoDB 已安装，跳过安装步骤"
        mongod --version
        return 0
    fi
    
    # 安装依赖
    apt-get install -y gnupg curl
    
    # 添加 MongoDB GPG 密钥
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # 添加 MongoDB 源
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # 更新并安装
    apt-get update -y
    apt-get install -y mongodb-org
    
    # 启动并设置开机自启
    systemctl start mongod
    systemctl enable mongod
    
    log_info "MongoDB 安装完成!"
    mongod --version
}

# =============================================
# 安装 Redis
# =============================================
install_redis() {
    log_info "安装 Redis..."
    
    # 检查是否已安装
    if command -v redis-server &> /dev/null; then
        log_warn "Redis 已安装，跳过安装步骤"
        redis-server --version
        return 0
    fi
    
    # 安装 Redis
    apt-get install -y redis-server
    
    # 配置 Redis（可选：绑定到本地，设置密码等）
    # 默认配置已经足够用于单机部署
    
    # 启动并设置开机自启
    systemctl start redis-server
    systemctl enable redis-server
    
    log_info "Redis 安装完成!"
    redis-server --version
}

# =============================================
# 安装 Node.js 20 LTS
# =============================================
install_nodejs() {
    log_info "安装 Node.js 20 LTS..."
    
    # 检查是否已安装
    if command -v node &> /dev/null; then
        log_warn "Node.js 已安装"
        node --version
        npm --version
        return 0
    fi
    
    # 使用 NodeSource 安装 Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # 安装 PM2
    npm install -g pm2
    
    log_info "Node.js 安装完成!"
    node --version
    npm --version
}

# =============================================
# 安装 Nginx
# =============================================
install_nginx() {
    log_info "安装 Nginx..."
    
    # 检查是否已安装
    if command -v nginx &> /dev/null; then
        log_warn "Nginx 已安装，跳过安装步骤"
        nginx -v
        return 0
    fi
    
    apt-get install -y nginx
    
    # 启动并设置开机自启
    systemctl start nginx
    systemctl enable nginx
    
    log_info "Nginx 安装完成!"
    nginx -v
}

# =============================================
# 验证安装
# =============================================
verify_installation() {
    log_info "验证安装..."
    echo ""
    
    # MongoDB
    if systemctl is-active --quiet mongod; then
        echo -e "${GREEN}✓${NC} MongoDB 运行中"
        echo "  连接: mongodb://127.0.0.1:27017"
    else
        echo -e "${RED}✗${NC} MongoDB 未运行"
    fi
    
    # Redis
    if systemctl is-active --quiet redis-server; then
        echo -e "${GREEN}✓${NC} Redis 运行中"
        echo "  连接: redis://127.0.0.1:6379"
    else
        echo -e "${RED}✗${NC} Redis 未运行"
    fi
    
    # Node.js
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✓${NC} Node.js $(node --version)"
    else
        echo -e "${RED}✗${NC} Node.js 未安装"
    fi
    
    # PM2
    if command -v pm2 &> /dev/null; then
        echo -e "${GREEN}✓${NC} PM2 $(pm2 --version)"
    else
        echo -e "${RED}✗${NC} PM2 未安装"
    fi
    
    # Nginx
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓${NC} Nginx 运行中"
    else
        echo -e "${RED}✗${NC} Nginx 未运行"
    fi
    
    echo ""
}

# =============================================
# 创建数据库和初始化
# =============================================
init_database() {
    log_info "初始化 ClingAI 数据库..."
    
    # 创建 MongoDB 数据库和用户（可选）
    # 默认情况下 MongoDB 不需要认证，开发环境可直接使用
    
    # 测试 MongoDB 连接
    if command -v mongosh &> /dev/null; then
        mongosh --eval "db.adminCommand('ping')" --quiet && \
            log_info "MongoDB 连接测试成功!" || \
            log_error "MongoDB 连接测试失败"
    fi
    
    # 测试 Redis 连接
    redis-cli ping && log_info "Redis 连接测试成功!" || log_error "Redis 连接测试失败"
}

# =============================================
# 显示后续步骤
# =============================================
show_next_steps() {
    echo ""
    echo "========================================"
    echo "  数据库安装完成！"
    echo "========================================"
    echo ""
    echo "后续步骤："
    echo ""
    echo "1. 配置后端环境变量 (server/.env):"
    echo "   MONGODB_URI=mongodb://127.0.0.1:27017/clingai"
    echo "   REDIS_URL=redis://127.0.0.1:6379"
    echo ""
    echo "2. 运行种子脚本初始化数据:"
    echo "   cd /root/honeyai/server"
    echo "   node scripts/seed_templates.js"
    echo ""
    echo "3. 启动后端服务:"
    echo "   pm2 start ecosystem.config.cjs"
    echo ""
    echo "4. 启动 Worker (处理 AI 任务):"
    echo "   pm2 start workers/generateWorker.js --name clingai-worker"
    echo ""
    echo "========================================"
}

# =============================================
# 主程序
# =============================================
main() {
    log_info "开始安装 ClingAI 数据库环境..."
    echo ""
    
    check_root
    update_system
    install_mongodb
    install_redis
    install_nodejs
    install_nginx
    verify_installation
    init_database
    show_next_steps
}

main "$@"
