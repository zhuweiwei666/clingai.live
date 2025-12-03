#!/bin/bash

###############################################################################
# 文件监控自动部署脚本
# 监控文件变化，自动触发部署
###############################################################################

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPT="${PROJECT_DIR}/auto-deploy.sh"
WATCH_DIRS="${PROJECT_DIR}/src ${PROJECT_DIR}/public"

# 检查必要的工具
if ! command -v fswatch &> /dev/null; then
    echo "❌ 需要安装 fswatch"
    echo ""
    echo "macOS:"
    echo "  brew install fswatch"
    echo ""
    echo "Linux:"
    echo "  sudo apt-get install inotify-tools"
    echo "  或使用: sudo yum install inotify-tools"
    exit 1
fi

# 检查部署脚本
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo "❌ 部署脚本不存在: $DEPLOY_SCRIPT"
    exit 1
fi

if [ ! -x "$DEPLOY_SCRIPT" ]; then
    chmod +x "$DEPLOY_SCRIPT"
fi

echo "=========================================="
echo "👀 文件监控自动部署已启动"
echo "=========================================="
echo "监控目录: $WATCH_DIRS"
echo "部署脚本: $DEPLOY_SCRIPT"
echo ""
echo "按 Ctrl+C 停止监控"
echo "=========================================="
echo ""

# 部署锁，防止并发部署
DEPLOY_LOCK="${PROJECT_DIR}/.deploy.lock"
DEPLOY_IN_PROGRESS=false

# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止文件监控..."
    rm -f "$DEPLOY_LOCK"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 部署函数
run_deploy() {
    # 检查是否正在部署
    if [ -f "$DEPLOY_LOCK" ]; then
        echo "⏳ 部署正在进行中，跳过此次触发..."
        return
    fi
    
    # 创建锁文件
    touch "$DEPLOY_LOCK"
    
    echo ""
    echo "📝 检测到文件变化，开始部署..."
    echo "   时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # 运行部署脚本
    bash "$DEPLOY_SCRIPT"
    
    local exit_code=$?
    
    # 删除锁文件
    rm -f "$DEPLOY_LOCK"
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "✅ 部署完成！"
        echo ""
    else
        echo ""
        echo "❌ 部署失败，退出码: $exit_code"
        echo ""
    fi
}

# 使用 fswatch 监控文件变化（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    fswatch -o $WATCH_DIRS | while read f; do
        # 延迟1秒，避免频繁触发
        sleep 1
        run_deploy
    done
# 使用 inotifywait 监控文件变化（Linux）
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    while true; do
        inotifywait -r -e modify,create,delete $WATCH_DIRS 2>/dev/null
        sleep 1
        run_deploy
    done
else
    echo "❌ 不支持的操作系统: $OSTYPE"
    exit 1
fi

