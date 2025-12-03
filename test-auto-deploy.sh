#!/bin/bash

###############################################################################
# 测试自动部署配置
###############################################################################

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "🧪 测试自动部署配置"
echo "=========================================="
echo ""

# 检查部署脚本
echo "1. 检查部署脚本..."
if [ -f "${PROJECT_DIR}/auto-deploy.sh" ]; then
    echo "   ✅ auto-deploy.sh 存在"
    if [ -x "${PROJECT_DIR}/auto-deploy.sh" ]; then
        echo "   ✅ auto-deploy.sh 有执行权限"
    else
        echo "   ⚠️  auto-deploy.sh 没有执行权限，正在修复..."
        chmod +x "${PROJECT_DIR}/auto-deploy.sh"
    fi
else
    echo "   ❌ auto-deploy.sh 不存在"
    exit 1
fi
echo ""

# 检查 Git hook
echo "2. 检查 Git post-commit hook..."
if [ -f "${PROJECT_DIR}/.git/hooks/post-commit" ]; then
    echo "   ✅ post-commit hook 存在"
    if [ -x "${PROJECT_DIR}/.git/hooks/post-commit" ]; then
        echo "   ✅ post-commit hook 有执行权限"
    else
        echo "   ⚠️  post-commit hook 没有执行权限，正在修复..."
        chmod +x "${PROJECT_DIR}/.git/hooks/post-commit"
    fi
    echo "   📝 Hook 内容预览:"
    head -5 "${PROJECT_DIR}/.git/hooks/post-commit" | sed 's/^/      /'
else
    echo "   ❌ post-commit hook 不存在"
    exit 1
fi
echo ""

# 检查必要工具
echo "3. 检查必要工具..."
MISSING_TOOLS=()
for tool in git node npm expect ssh scp; do
    if command -v "$tool" &> /dev/null; then
        echo "   ✅ $tool 已安装"
    else
        echo "   ❌ $tool 未安装"
        MISSING_TOOLS+=("$tool")
    fi
done
echo ""

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo "⚠️  缺少以下工具: ${MISSING_TOOLS[*]}"
    echo ""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "安装命令:"
        echo "  brew install ${MISSING_TOOLS[*]}"
    fi
    echo ""
fi

# 检查文件监控脚本
echo "4. 检查文件监控脚本..."
if [ -f "${PROJECT_DIR}/watch-and-deploy.sh" ]; then
    echo "   ✅ watch-and-deploy.sh 存在"
    if [ -x "${PROJECT_DIR}/watch-and-deploy.sh" ]; then
        echo "   ✅ watch-and-deploy.sh 有执行权限"
    else
        chmod +x "${PROJECT_DIR}/watch-and-deploy.sh"
    fi
else
    echo "   ⚠️  watch-and-deploy.sh 不存在"
fi
echo ""

echo "=========================================="
echo "✅ 配置检查完成"
echo "=========================================="
echo ""
echo "📋 使用说明:"
echo ""
echo "1. Git 提交后自动部署（已配置）:"
echo "   git add ."
echo "   git commit -m '更新代码'"
echo "   # 提交后会自动运行部署"
echo ""
echo "2. 手动运行部署:"
echo "   ./auto-deploy.sh"
echo ""
echo "3. 文件监控自动部署:"
echo "   ./watch-and-deploy.sh"
echo ""
echo "4. 查看部署日志:"
echo "   tail -f deploy.log"
echo ""

