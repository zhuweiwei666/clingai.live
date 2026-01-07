#!/bin/bash

# Cloudflare Cache Purge Script
# 清除 clingai.live 的 Cloudflare CDN 缓存

set -e

ZONE_NAME="clingai.live"
DOMAIN="clingai.live"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "=========================================="
echo -e "${BLUE}🗑️  Cloudflare 缓存清除工具${NC}"
echo "=========================================="
echo "域名: $DOMAIN"
echo "=========================================="
echo ""

# 检查是否提供了 API 密钥
if [ -z "$CF_API_TOKEN" ] && [ -z "$CF_API_KEY" ]; then
    log_warn "未检测到 Cloudflare API 密钥"
    echo ""
    log_step "方法 1: 使用 API Token（推荐）"
    echo "  1. 登录 Cloudflare 控制台: https://dash.cloudflare.com"
    echo "  2. 进入: My Profile → API Tokens"
    echo "  3. 创建 Token，权限: Zone.Cache Purge:Edit"
    echo "  4. 运行: CF_API_TOKEN='your-token' ./purge-cloudflare-cache.sh"
    echo ""
    log_step "方法 2: 使用 API Key + Email（旧方法）"
    echo "  1. 登录 Cloudflare 控制台"
    echo "  2. 进入: My Profile → API Tokens → Global API Key"
    echo "  3. 运行: CF_API_KEY='your-key' CF_EMAIL='your-email' ./purge-cloudflare-cache.sh"
    echo ""
    log_step "方法 3: 手动清除（最简单）"
    echo "  1. 登录 Cloudflare 控制台: https://dash.cloudflare.com"
    echo "  2. 选择域名: $DOMAIN"
    echo "  3. 进入: 缓存 (Caching) → 清除缓存 (Purge Everything)"
    echo "  4. 点击: '清除所有内容' (Purge Everything)"
    echo "  5. 等待 1-2 分钟"
    echo ""
    read -p "是否继续使用 API 方式清除？(y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "请使用上述方法手动清除缓存"
        exit 0
    fi
    
    # 提示输入 API 信息
    if [ -z "$CF_API_TOKEN" ]; then
        if [ -z "$CF_API_KEY" ]; then
            read -p "请输入 Cloudflare API Token: " CF_API_TOKEN
            read -p "请输入 Zone ID (可选，脚本会自动获取): " CF_ZONE_ID
        else
            read -p "请输入 Cloudflare Email: " CF_EMAIL
        fi
    fi
fi

# 获取 Zone ID（如果未提供）
if [ -z "$CF_ZONE_ID" ]; then
    log_info "正在获取 Zone ID..."
    
    if [ -n "$CF_API_TOKEN" ]; then
        # 使用 API Token
        ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
            -H "Authorization: Bearer $CF_API_TOKEN" \
            -H "Content-Type: application/json")
    else
        # 使用 API Key + Email
        ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
            -H "X-Auth-Email: $CF_EMAIL" \
            -H "X-Auth-Key: $CF_API_KEY" \
            -H "Content-Type: application/json")
    fi
    
    # 提取 Zone ID
    CF_ZONE_ID=$(echo "$ZONE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ -z "$CF_ZONE_ID" ]; then
        log_error "无法获取 Zone ID"
        echo "响应: $ZONE_RESPONSE"
        exit 1
    fi
    
    log_info "Zone ID: $CF_ZONE_ID"
fi

# 清除所有缓存
log_info "正在清除 Cloudflare 缓存..."

if [ -n "$CF_API_TOKEN" ]; then
    # 使用 API Token
    PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}')
else
    # 使用 API Key + Email
    PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
        -H "X-Auth-Email: $CF_EMAIL" \
        -H "X-Auth-Key: $CF_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}')
fi

# 检查响应
if echo "$PURGE_RESPONSE" | grep -q '"success":true'; then
    log_info "✅ 缓存清除成功！"
    echo ""
    log_info "请等待 1-2 分钟让缓存完全清除"
    log_info "然后访问: https://$DOMAIN"
    echo ""
    log_info "验证命令:"
    echo "  curl -sI https://$DOMAIN | head -5"
else
    log_error "缓存清除失败"
    echo "响应: $PURGE_RESPONSE"
    exit 1
fi

