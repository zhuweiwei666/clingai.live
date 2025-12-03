#!/bin/bash

# 服务器端自动部署脚本
# 在服务器上运行此脚本，自动拉取代码、构建、部署

set -e  # 遇到错误立即退出

# 配置
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"
# 如果无法使用 SSH，可以使用 HTTPS：
# GITHUB_REPO="https://github.com/zhuweiwei666/clingai.live.git"

PROJECT_DIR="/root/honeyai"
DEPLOY_DIR="/var/www/honeyai"
NGINX_SERVICE="nginx"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的工具
check_requirements() {
    log_info "检查必要的工具..."
    
    local missing_tools=()
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "缺少以下工具: ${missing_tools[*]}"
        log_info "正在安装..."
        apt-get update
        apt-get install -y git nodejs npm
    fi
    
    log_info "所有必要工具已安装"
}

# 克隆或更新代码
update_code() {
    log_info "更新代码..."
    
    if [ -d "$PROJECT_DIR" ]; then
        log_info "项目目录已存在，拉取最新代码..."
        cd "$PROJECT_DIR"
        
        if [ -d ".git" ]; then
            # 保存当前更改（如果有）
            git stash || true
            
            # 拉取最新代码
            git fetch origin
            git reset --hard origin/main || git reset --hard origin/master
            
            log_info "代码更新完成"
        else
            log_error "目录存在但不是 git 仓库，删除后重新克隆..."
            cd /
            rm -rf "$PROJECT_DIR"
            clone_code
        fi
    else
        clone_code
    fi
}

# 克隆代码
clone_code() {
    log_info "从 GitHub 克隆项目..."
    mkdir -p "$(dirname "$PROJECT_DIR")"
    git clone "$GITHUB_REPO" "$PROJECT_DIR"
    log_info "代码克隆完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    cd "$PROJECT_DIR"
    
    # 检查是否需要安装依赖
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log_info "安装/更新依赖..."
        npm install
        log_info "依赖安装完成"
    else
        log_info "依赖已是最新，跳过安装"
    fi
}

# 构建项目
build_project() {
    log_info "构建项目..."
    cd "$PROJECT_DIR"
    
    # 清理旧的构建
    rm -rf dist
    
    # 构建
    npm run build
    
    # 检查构建结果
    if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
        log_error "构建失败，dist 目录为空"
        exit 1
    fi
    
    log_info "项目构建完成"
}

# 部署文件
deploy_files() {
    log_info "部署文件到 $DEPLOY_DIR..."
    
    # 创建部署目录
    mkdir -p "$DEPLOY_DIR"
    
    # 备份旧文件（可选）
    if [ -d "$DEPLOY_DIR" ] && [ -n "$(ls -A $DEPLOY_DIR 2>/dev/null)" ]; then
        log_info "备份旧文件..."
        BACKUP_DIR="${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
        log_info "备份完成: $BACKUP_DIR"
    fi
    
    # 复制新文件
    cp -r "$PROJECT_DIR/dist"/* "$DEPLOY_DIR"/
    
    # 设置权限
    chown -R www-data:www-data "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"
    
    log_info "文件部署完成"
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/honeyai << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root /var/www/honeyai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/
    
    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    log_info "Nginx 配置完成"
}

# 重启服务
restart_services() {
    log_info "重启 Nginx 服务..."
    
    # 测试 Nginx 配置
    if nginx -t; then
        # 重载 Nginx（不中断服务）
        systemctl reload "$NGINX_SERVICE" || systemctl restart "$NGINX_SERVICE"
        log_info "Nginx 服务已重启"
    else
        log_error "Nginx 配置测试失败，请检查配置"
        exit 1
    fi
    
    # 检查服务状态
    if systemctl is-active --quiet "$NGINX_SERVICE"; then
        log_info "Nginx 服务运行正常"
    else
        log_error "Nginx 服务未运行，尝试启动..."
        systemctl start "$NGINX_SERVICE"
    fi
}

# 清理旧备份（保留最近5个）
cleanup_backups() {
    log_info "清理旧备份..."
    cd "$(dirname "$DEPLOY_DIR")"
    
    # 删除超过5个的旧备份
    ls -dt ${DEPLOY_DIR}.backup.* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    log_info "备份清理完成"
}

# 主函数
main() {
    echo "=========================================="
    echo "🚀 开始自动部署"
    echo "=========================================="
    echo "项目目录: $PROJECT_DIR"
    echo "部署目录: $DEPLOY_DIR"
    echo "GitHub 仓库: $GITHUB_REPO"
    echo "=========================================="
    echo ""
    
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本"
        exit 1
    fi
    
    # 执行部署步骤
    check_requirements
    update_code
    install_dependencies
    build_project
    deploy_files
    configure_nginx
    restart_services
    cleanup_backups
    
    echo ""
    echo "=========================================="
    log_info "✅ 部署完成！"
    echo "=========================================="
    echo "网站地址: http://$(hostname -I | awk '{print $1}')"
    echo "或访问: http://173.255.193.131"
    echo "=========================================="
}

# 运行主函数
main

