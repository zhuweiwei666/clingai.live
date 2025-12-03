#!/bin/bash

###############################################################################
# 全自动部署脚本
# 功能：自动push代码到GitHub -> 服务器自动拉取 -> 自动构建 -> 自动部署 -> 自动重启服务
# 作者：Auto Deploy Script
# 日期：$(date +%Y-%m-%d)
###############################################################################

set -euo pipefail  # 严格模式：遇到错误立即退出，未定义变量报错

###############################################################################
# 配置区域
###############################################################################

# GitHub 配置
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"
GITHUB_BRANCH="main"  # 或 "master"

# 服务器配置
SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"
NGINX_SERVICE="nginx"

# 本地配置
LOCAL_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${LOCAL_PROJECT_DIR}/deploy.log"
ERROR_LOG_FILE="${LOCAL_PROJECT_DIR}/deploy-error.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

###############################################################################
# 工具函数
###############################################################################

# 日志函数
log_info() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[INFO]${NC} [${timestamp}] $message" | tee -a "$LOG_FILE"
}

log_warn() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[WARN]${NC} [${timestamp}] $message" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} [${timestamp}] $message" | tee -a "$LOG_FILE" | tee -a "$ERROR_LOG_FILE"
}

log_step() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}[STEP]${NC} [${timestamp}] $message" | tee -a "$LOG_FILE"
}

# 错误处理函数
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "脚本在第 $line_number 行执行失败，退出码: $exit_code"
    log_error "请查看日志文件获取详细信息: $LOG_FILE"
    log_error "错误日志: $ERROR_LOG_FILE"
    exit $exit_code
}

# 设置错误陷阱
trap 'handle_error $LINENO' ERR

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "命令 '$1' 未找到，请先安装"
        return 1
    fi
    return 0
}

# SSH 执行命令（使用 expect 处理密码）
ssh_exec() {
    local command="$1"
    local description="${2:-执行命令}"
    
    log_info "$description..."
    
    local temp_output=$(mktemp)
    local exit_code=0
    
    expect << EOF > "$temp_output" 2>&1
set timeout 120
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
    timeout {
        puts "连接超时"
        exit 1
    }
    eof {
        catch wait result
        set exit_code [lindex \$result 3]
        exit \$exit_code
    }
}
EOF
    
    exit_code=$?
    cat "$temp_output" | tee -a "$LOG_FILE"
    rm -f "$temp_output"
    
    if [ $exit_code -ne 0 ]; then
        log_error "SSH 执行失败: $description (退出码: $exit_code)"
        return $exit_code
    fi
    return 0
}

# SCP 上传文件（使用 expect 处理密码）
scp_upload() {
    local local_path="$1"
    local remote_path="$2"
    local description="${3:-上传文件}"
    
    log_info "$description..."
    
    local temp_output=$(mktemp)
    local exit_code=0
    
    expect << EOF > "$temp_output" 2>&1
set timeout 300
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
    timeout {
        puts "上传超时"
        exit 1
    }
    eof {
        catch wait result
        set exit_code [lindex \$result 3]
        exit \$exit_code
    }
}
EOF
    
    exit_code=$?
    cat "$temp_output" | tee -a "$LOG_FILE"
    rm -f "$temp_output"
    
    if [ $exit_code -ne 0 ]; then
        log_error "文件上传失败: $description (退出码: $exit_code)"
        return $exit_code
    fi
    return 0
}

###############################################################################
# 步骤1: 检查本地环境
###############################################################################

check_local_environment() {
    log_step "========== 步骤1: 检查本地环境 =========="
    
    # 检查必要的工具
    local missing_tools=()
    
    for tool in git node npm expect ssh scp; do
        if ! check_command "$tool"; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "缺少以下工具: ${missing_tools[*]}"
        log_info "请安装缺少的工具:"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            log_info "  macOS: brew install ${missing_tools[*]}"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            log_info "  Linux: sudo apt-get install ${missing_tools[*]}"
        fi
        exit 1
    fi
    
    # 检查是否在 git 仓库中
    if [ ! -d ".git" ]; then
        log_error "当前目录不是 git 仓库"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if ! git diff-index --quiet HEAD --; then
        log_warn "检测到未提交的更改"
        read -p "是否要提交这些更改? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "添加所有更改..."
            git add .
            read -p "请输入提交信息: " commit_message
            if [ -z "$commit_message" ]; then
                commit_message="Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
            fi
            git commit -m "$commit_message"
        fi
    fi
    
    log_info "本地环境检查完成"
}

###############################################################################
# 步骤2: 推送代码到 GitHub
###############################################################################

push_to_github() {
    log_step "========== 步骤2: 推送代码到 GitHub =========="
    
    # 检查远程仓库配置
    if ! git remote get-url origin &> /dev/null; then
        log_info "添加远程仓库..."
        git remote add origin "$GITHUB_REPO" || true
    fi
    
    # 获取当前分支
    local current_branch=$(git branch --show-current)
    log_info "当前分支: $current_branch"
    
    # 拉取最新代码（避免冲突）
    log_info "拉取远程最新代码..."
    if git pull origin "$current_branch" --rebase 2>&1 | tee -a "$LOG_FILE"; then
        log_info "代码拉取成功"
    else
        log_warn "代码拉取失败，尝试继续推送..."
    fi
    
    # 推送到 GitHub
    log_info "推送到 GitHub ($GITHUB_REPO)..."
    if git push origin "$current_branch" 2>&1 | tee -a "$LOG_FILE"; then
        log_info "✅ 代码推送成功"
    else
        log_error "❌ 代码推送失败"
        log_error "可能的原因："
        log_error "  1. GitHub 认证失败（需要配置 SSH 密钥或使用 HTTPS）"
        log_error "  2. 网络连接问题"
        log_error "  3. 权限不足"
        exit 1
    fi
}

###############################################################################
# 步骤3: 服务器拉取最新代码
###############################################################################

server_pull_code() {
    log_step "========== 步骤3: 服务器拉取最新代码 =========="
    
    # 检查服务器连接
    log_info "测试服务器连接..."
    if ! ssh_exec "echo '连接成功'" "测试服务器连接"; then
        log_error "无法连接到服务器"
        exit 1
    fi
    
    # 检查服务器上的项目目录
    local check_dir_cmd="
        if [ ! -d '$SERVER_PROJECT_DIR' ]; then
            echo '目录不存在，创建目录...'
            mkdir -p '$SERVER_PROJECT_DIR'
            cd '$SERVER_PROJECT_DIR'
            git clone '$GITHUB_REPO' .
        else
            echo '目录已存在'
            cd '$SERVER_PROJECT_DIR'
            if [ ! -d '.git' ]; then
                echo '不是 git 仓库，重新克隆...'
                cd /
                rm -rf '$SERVER_PROJECT_DIR'
                mkdir -p '$SERVER_PROJECT_DIR'
                git clone '$GITHUB_REPO' '$SERVER_PROJECT_DIR'
            else
                echo '拉取最新代码...'
                git fetch origin
                git reset --hard origin/$GITHUB_BRANCH || git reset --hard origin/master
            fi
        fi
    "
    
    ssh_exec "$check_dir_cmd" "服务器拉取/克隆代码"
    log_info "✅ 服务器代码更新完成"
}

###############################################################################
# 步骤4: 服务器安装依赖
###############################################################################

server_install_dependencies() {
    log_step "========== 步骤4: 服务器安装依赖 =========="
    
    local install_cmd="
        cd '$SERVER_PROJECT_DIR'
        echo '检查 Node.js 和 npm...'
        # 使用nvm安装Node.js（避免包冲突）
        if [ ! -d \"\$HOME/.nvm\" ]; then
            echo '安装nvm...'
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        fi
        export NVM_DIR=\"\$HOME/.nvm\"
        [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
        # 检查Node.js版本，如果不是18+则安装
        NODE_VERSION=\$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo '0')
        if [ \"\$NODE_VERSION\" -lt 18 ]; then
            echo '安装Node.js 18...'
            nvm install 18
            nvm use 18
            nvm alias default 18
        fi
        echo 'Node.js 版本:'
        node --version
        echo 'npm 版本:'
        npm --version
        echo '安装项目依赖...'
        npm install
    "
    
    ssh_exec "$install_cmd" "服务器安装依赖"
    log_info "✅ 依赖安装完成"
}

###############################################################################
# 步骤5: 服务器构建项目
###############################################################################

server_build_project() {
    log_step "========== 步骤5: 服务器构建项目 =========="
    
    local build_cmd="
        cd '$SERVER_PROJECT_DIR'
        echo '清理旧的构建文件...'
        rm -rf dist
        echo '开始构建项目...'
        npm run build
        if [ ! -d 'dist' ] || [ -z \"\$(ls -A dist 2>/dev/null)\" ]; then
            echo '构建失败：dist 目录为空'
            exit 1
        fi
        echo '构建成功'
        ls -lh dist/ | head -10
    "
    
    ssh_exec "$build_cmd" "服务器构建项目"
    log_info "✅ 项目构建完成"
}

###############################################################################
# 步骤6: 服务器部署文件
###############################################################################

server_deploy_files() {
    log_step "========== 步骤6: 服务器部署文件 =========="
    
    local deploy_cmd="
        echo '创建部署目录...'
        mkdir -p '$SERVER_DEPLOY_DIR'
        
        echo '备份旧文件...'
        if [ -d '$SERVER_DEPLOY_DIR' ] && [ -n \"\$(ls -A $SERVER_DEPLOY_DIR 2>/dev/null)\" ]; then
            BACKUP_DIR=\"${SERVER_DEPLOY_DIR}.backup.\$(date +%Y%m%d_%H%M%S)\"
            cp -r '$SERVER_DEPLOY_DIR' \"\$BACKUP_DIR\"
            echo \"备份完成: \$BACKUP_DIR\"
        fi
        
        echo '复制新文件...'
        cp -r '$SERVER_PROJECT_DIR/dist'/* '$SERVER_DEPLOY_DIR'/
        
        echo '设置文件权限...'
        chown -R www-data:www-data '$SERVER_DEPLOY_DIR'
        chmod -R 755 '$SERVER_DEPLOY_DIR'
        
        echo '部署完成'
    "
    
    ssh_exec "$deploy_cmd" "服务器部署文件"
    log_info "✅ 文件部署完成"
}

###############################################################################
# 步骤7: 配置 Nginx
###############################################################################

configure_nginx() {
    log_step "========== 步骤7: 配置 Nginx =========="
    
    local nginx_config_cmd="
        echo '创建 Nginx 配置...'
        cat > /etc/nginx/sites-available/honeyai << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root $SERVER_DEPLOY_DIR;
    index index.html;

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}
NGINX_EOF

        echo '启用站点...'
        ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        echo '测试 Nginx 配置...'
        nginx -t
    "
    
    ssh_exec "$nginx_config_cmd" "配置 Nginx"
    log_info "✅ Nginx 配置完成"
}

###############################################################################
# 步骤8: 重启服务
###############################################################################

restart_services() {
    log_step "========== 步骤8: 重启服务 =========="
    
    local restart_cmd="
        echo '重启 Nginx 服务...'
        if systemctl is-active --quiet '$NGINX_SERVICE'; then
            systemctl reload '$NGINX_SERVICE' || systemctl restart '$NGINX_SERVICE'
        else
            systemctl start '$NGINX_SERVICE'
        fi
        
        echo '检查服务状态...'
        systemctl status '$NGINX_SERVICE' --no-pager -l || true
        
        echo '服务重启完成'
    "
    
    ssh_exec "$restart_cmd" "重启服务"
    log_info "✅ 服务重启完成"
}

###############################################################################
# 步骤9: 验证部署
###############################################################################

verify_deployment() {
    log_step "========== 步骤9: 验证部署 =========="
    
    local verify_cmd="
        echo '检查部署目录...'
        ls -lh '$SERVER_DEPLOY_DIR' | head -10
        
        echo '检查 Nginx 状态...'
        systemctl is-active '$NGINX_SERVICE' && echo 'Nginx 运行中' || echo 'Nginx 未运行'
        
        echo '检查端口监听...'
        netstat -tlnp | grep ':80 ' || ss -tlnp | grep ':80 ' || echo '无法检查端口'
    "
    
    ssh_exec "$verify_cmd" "验证部署"
    log_info "✅ 部署验证完成"
}

###############################################################################
# 清理函数
###############################################################################

cleanup() {
    log_info "清理临时文件..."
    # 可以在这里添加清理逻辑
}

###############################################################################
# 主函数
###############################################################################

main() {
    # 初始化日志
    echo "==========================================" > "$LOG_FILE"
    echo "部署开始: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
    echo "==========================================" >> "$LOG_FILE"
    
    > "$ERROR_LOG_FILE"  # 清空错误日志
    
    echo ""
    echo "=========================================="
    echo -e "${CYAN}🚀 全自动部署脚本${NC}"
    echo "=========================================="
    echo "项目目录: $LOCAL_PROJECT_DIR"
    echo "GitHub 仓库: $GITHUB_REPO"
    echo "服务器: $SERVER"
    echo "部署目录: $SERVER_DEPLOY_DIR"
    echo "日志文件: $LOG_FILE"
    echo "=========================================="
    echo ""
    
    # 切换到项目目录
    cd "$LOCAL_PROJECT_DIR" || {
        log_error "无法进入项目目录"
        exit 1
    }
    
    # 执行部署步骤
    local start_time=$(date +%s)
    
    check_local_environment
    push_to_github
    server_pull_code
    server_install_dependencies
    server_build_project
    server_deploy_files
    configure_nginx
    restart_services
    verify_deployment
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "=========================================="
    log_info "✅ 部署完成！"
    echo "=========================================="
    echo "🌐 网站地址: http://173.255.193.131"
    echo "⏱️  部署耗时: ${duration} 秒"
    echo "📝 日志文件: $LOG_FILE"
    if [ -s "$ERROR_LOG_FILE" ]; then
        echo "⚠️  错误日志: $ERROR_LOG_FILE"
    fi
    echo "=========================================="
    echo ""
    
    # 清理
    cleanup
}

# 运行主函数
main "$@"

