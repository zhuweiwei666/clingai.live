#!/bin/bash

# 从 GitHub 克隆并部署脚本
# 适用于在另一台电脑上从零开始部署

# 部署配置
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"
# 如果无法使用 SSH，可以使用 HTTPS：
# GITHUB_REPO="https://github.com/zhuweiwei666/clingai.live.git"

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
REMOTE_DIR="/var/www/honeyai"

# 项目目录（可以修改为你想要的位置）
PROJECT_DIR="${HOME}/HoneyAI"
# 或者使用当前目录：
# PROJECT_DIR="$(pwd)/HoneyAI"

echo "🚀 从 GitHub 部署 HoneyAI 项目"
echo "📦 GitHub 仓库: $GITHUB_REPO"
echo "📁 项目目录: $PROJECT_DIR"
echo ""

# 检查必要的工具
echo "🔍 检查必要的工具..."

MISSING_TOOLS=()

if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("git")
fi

if ! command -v node &> /dev/null; then
    MISSING_TOOLS+=("node")
fi

if ! command -v npm &> /dev/null; then
    MISSING_TOOLS+=("npm")
fi

if ! command -v expect &> /dev/null; then
    MISSING_TOOLS+=("expect")
fi

if ! command -v ssh &> /dev/null; then
    MISSING_TOOLS+=("ssh")
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo "❌ 错误: 缺少以下工具: ${MISSING_TOOLS[*]}"
    echo ""
    echo "请安装缺少的工具:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  macOS:"
        echo "    brew install git node expect"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  Ubuntu/Debian:"
        echo "    sudo apt-get update"
        echo "    sudo apt-get install git nodejs npm expect openssh-client"
        echo "  CentOS/RHEL:"
        echo "    sudo yum install git nodejs npm expect openssh-clients"
    fi
    exit 1
fi

echo "✅ 所有必要工具已安装"
echo ""

# 检查或克隆项目
if [ -d "$PROJECT_DIR" ]; then
    echo "📂 项目目录已存在，更新代码..."
    cd "$PROJECT_DIR" || {
        echo "❌ 错误: 无法进入项目目录"
        exit 1
    }
    
    # 检查是否是 git 仓库
    if [ -d ".git" ]; then
        echo "🔄 从 GitHub 拉取最新代码..."
        git pull origin main || git pull origin master || {
            echo "⚠️  警告: 拉取代码失败，尝试继续使用现有代码..."
        }
    else
        echo "❌ 错误: 目录存在但不是 git 仓库"
        echo "   请删除目录或选择其他位置: rm -rf $PROJECT_DIR"
        exit 1
    fi
else
    echo "📥 从 GitHub 克隆项目..."
    mkdir -p "$(dirname "$PROJECT_DIR")"
    git clone "$GITHUB_REPO" "$PROJECT_DIR" || {
        echo "❌ 错误: 克隆失败"
        echo ""
        echo "可能的原因:"
        echo "  1. 无法访问 GitHub"
        echo "  2. SSH 密钥未配置（如果使用 git@ 地址）"
        echo "  3. 仓库地址不正确"
        echo ""
        echo "💡 提示: 如果使用 SSH 地址失败，可以修改脚本使用 HTTPS 地址"
        exit 1
    }
    cd "$PROJECT_DIR" || {
        echo "❌ 错误: 无法进入项目目录"
        exit 1
    }
fi

echo "✅ 代码准备完成"
echo ""

# 安装依赖
echo "📦 安装项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "   首次安装，可能需要一些时间..."
fi

npm install || {
    echo "❌ 错误: 依赖安装失败"
    exit 1
}

echo "✅ 依赖安装完成"
echo ""

# 构建项目
echo "🔨 构建项目..."
npm run build || {
    echo "❌ 错误: 项目构建失败"
    echo ""
    echo "💡 提示: 如果构建失败，请检查："
    echo "   1. Node.js 版本是否兼容（建议 v16+）"
    echo "   2. 依赖是否完整安装"
    echo "   3. 查看上面的错误信息"
    exit 1
}

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ 错误: 构建失败，dist 目录为空"
    exit 1
fi

echo "✅ 项目构建完成"
echo ""

# 测试服务器连接
echo "🔍 测试服务器连接..."
SERVER_IP="173.255.193.131"
if [[ "$OSTYPE" == "darwin"* ]]; then
    ping -c 2 -W 3000 "$SERVER_IP" &> /dev/null || echo "⚠️  警告: 无法 ping 通服务器，但继续尝试 SSH 连接..."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    ping -c 2 -w 3 "$SERVER_IP" &> /dev/null || echo "⚠️  警告: 无法 ping 通服务器，但继续尝试 SSH 连接..."
else
    echo "⚠️  跳过 ping 测试（不支持的平台）"
fi

# 创建远程目录
echo "📁 在服务器上创建目录..."
expect << EOF
set timeout 60
spawn bash -c "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER 'mkdir -p $REMOTE_DIR && echo Directory created'"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "Directory created" {
        puts "目录创建成功"
    }
    timeout {
        puts "连接超时，请检查服务器是否可达"
        exit 1
    }
    eof
}
EOF

SSH_EXIT_CODE=$?
if [ $SSH_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ SSH 连接失败 (退出码: $SSH_EXIT_CODE)"
    echo ""
    echo "请检查以下项目："
    echo "   1. 服务器 IP 是否正确: 173.255.193.131"
    echo "   2. 服务器是否正在运行"
    echo "   3. 服务器是否允许 SSH 连接"
    echo "   4. 防火墙是否开放 22 端口"
    echo "   5. 网络连接是否正常"
    echo ""
    echo "💡 提示: 可以尝试手动连接测试："
    echo "   ssh $SERVER"
    echo ""
    exit 1
fi

# 上传文件
echo "📤 上传文件到服务器..."
cd "$PROJECT_DIR/dist" || {
    echo "❌ 错误: 无法切换到 dist 目录"
    exit 1
}

expect << EOF
set timeout 300
spawn scp -r -o StrictHostKeyChecking=no * $SERVER:$REMOTE_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
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
    eof
}
EOF

UPLOAD_EXIT_CODE=$?
cd "$PROJECT_DIR"

if [ $UPLOAD_EXIT_CODE -eq 0 ]; then
    echo "✅ 文件上传完成！"
else
    echo "❌ 文件上传失败 (退出码: $UPLOAD_EXIT_CODE)"
    exit 1
fi

# 配置 nginx
echo "⚙️  配置 Nginx..."
expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no $SERVER

expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "# " {
        # 安装 nginx（如果未安装）
        send "if ! command -v nginx &> /dev/null; then echo '安装 Nginx...'; apt-get update && apt-get install -y nginx; fi\r"
        expect "# "
        
        # 创建 nginx 配置
        send "cat > /etc/nginx/sites-available/honeyai << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root $REMOTE_DIR;
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
\r"
        expect "# "
        
        # 启用站点
        send "ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/\r"
        expect "# "
        
        # 删除默认站点
        send "rm -f /etc/nginx/sites-enabled/default\r"
        expect "# "
        
        # 测试并重载 nginx
        send "nginx -t && systemctl reload nginx && echo 'Nginx 配置成功！'\r"
        expect "# "
        
        send "exit\r"
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    timeout {
        puts "配置超时"
        exit 1
    }
}
EOF

echo ""
echo "🎉 部署完成！"
echo "🌐 网站地址: http://173.255.193.131"
echo "📁 项目目录: $PROJECT_DIR"
echo ""
echo "如果无法访问，请检查："
echo "   1. 服务器防火墙是否开放 80 端口"
echo "   2. Nginx 服务是否正常运行: systemctl status nginx"
echo "   3. 查看 Nginx 日志: tail -f /var/log/nginx/error.log"
echo ""
echo "💡 下次更新部署，只需运行:"
echo "   cd $PROJECT_DIR && ./Clingai-deploy-from-github.sh"

