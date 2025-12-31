#!/bin/bash

# 完整功能测试脚本
# 测试所有API端点和功能

BASE_URL="http://173.255.193.131:3001/api"
TEST_TOKEN=""
TEST_USER_ID=""
PASSED=0
FAILED=0
WARNINGS=0

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试函数
test_api() {
    local name="$1"
    local method="${2:-GET}"
    local endpoint="$3"
    local data="${4:-}"
    local expected_status="${5:-200}"
    
    echo -e "\n🧪 Testing: ${name}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}" \
            ${TEST_TOKEN:+-H "Authorization: Bearer ${TEST_TOKEN}"})
    else
        response=$(curl -s -w "\n%{http_code}" -X "${method}" \
            -H "Content-Type: application/json" \
            ${TEST_TOKEN:+-H "Authorization: Bearer ${TEST_TOKEN}"} \
            ${data:+-d "${data}"} \
            "${BASE_URL}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # 检查HTTP状态码
    if [ "$http_code" -eq "$expected_status" ]; then
        # 检查响应格式
        if echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if 'success' in data else 1)" 2>/dev/null; then
            echo -e "${GREEN}✅ PASS${NC}: ${name}"
            ((PASSED++))
            echo "$body" | python3 -m json.tool 2>/dev/null | head -10
            return 0
        else
            echo -e "${YELLOW}⚠️  WARN${NC}: ${name} - Response format may be incorrect"
            ((WARNINGS++))
            echo "$body" | head -5
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}: ${name} - HTTP ${http_code} (expected ${expected_status})"
        ((FAILED++))
        echo "$body" | head -5
        return 1
    fi
}

echo "=========================================="
echo "🚀 开始完整功能测试"
echo "=========================================="

# ========== 1. 基础健康检查 ==========
echo -e "\n${GREEN}=== 1. 基础健康检查 ===${NC}"
test_api "Health Check" "GET" "/health"
test_api "Storage Status" "GET" "/storage/status"

# ========== 2. 模板API测试 ==========
echo -e "\n${GREEN}=== 2. 模板API测试 ===${NC}"
test_api "Get Templates" "GET" "/templates"
test_api "Get Trending Templates" "GET" "/templates/trending"
test_api "Get New Templates" "GET" "/templates/new"
test_api "Get Template Categories" "GET" "/templates/categories"

# ========== 3. 认证API测试 ==========
echo -e "\n${GREEN}=== 3. 认证API测试 ===${NC}"

# 注册测试用户
TEST_EMAIL="test_$(date +%s)@test.com"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"test123456\",\"username\":\"testuser\"}")

if echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if data.get('success') and data.get('token') else 1)" 2>/dev/null; then
    TEST_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
    TEST_USER_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('user', {}).get('id', ''))" 2>/dev/null)
    echo -e "${GREEN}✅ PASS${NC}: User Registration"
    echo "Token obtained: ${TEST_TOKEN:0:20}..."
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: User Registration"
    echo "$REGISTER_RESPONSE" | head -5
    ((FAILED++))
fi

# 测试获取当前用户
if [ -n "$TEST_TOKEN" ]; then
    test_api "Get Current User (/auth/me)" "GET" "/auth/me"
fi

# ========== 4. 用户API测试 ==========
if [ -n "$TEST_TOKEN" ]; then
    echo -e "\n${GREEN}=== 4. 用户API测试 ===${NC}"
    test_api "Get User Profile" "GET" "/user/profile"
    test_api "Get User Coins" "GET" "/user/coins"
    test_api "Get User Works" "GET" "/user/works"
fi

# ========== 5. 订单API测试 ==========
echo -e "\n${GREEN}=== 5. 订单API测试 ===${NC}"
test_api "Get Coin Packages" "GET" "/order/packages"
test_api "Get Subscription Plans" "GET" "/order/plans"

# ========== 6. 错误处理测试 ==========
echo -e "\n${GREEN}=== 6. 错误处理测试 ===${NC}"
test_api "404 Not Found" "GET" "/nonexistent" "" "404"
test_api "Unauthorized Access" "GET" "/user/profile" "" "401"

# ========== 7. 响应格式验证 ==========
echo -e "\n${GREEN}=== 7. 响应格式验证 ===${NC}"
RESPONSE=$(curl -s "${BASE_URL}/templates")
if echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if 'success' in data and 'data' in data else 1)" 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}: Response Format (统一格式)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: Response Format"
    ((FAILED++))
fi

# ========== 8. 生成API端点测试 ==========
echo -e "\n${GREEN}=== 8. 生成API端点测试 ===${NC}"
echo "检查生成API端点是否存在..."
ENDPOINTS=(
    "/generate/photo2video"
    "/generate/faceswap"
    "/generate/faceswap-video"
    "/generate/dressup"
    "/generate/hd"
    "/generate/remove"
    "/generate/aiimage"
)

for endpoint in "${ENDPOINTS[@]}"; do
    # 测试端点是否存在（应该返回401未授权，而不是404）
    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${endpoint}" \
        -H "Content-Type: application/json" \
        -d '{"test":"data"}')
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 401 ] || [ "$http_code" -eq 400 ]; then
        echo -e "${GREEN}✅${NC} Endpoint exists: ${endpoint}"
        ((PASSED++))
    elif [ "$http_code" -eq 404 ]; then
        echo -e "${RED}❌${NC} Endpoint not found: ${endpoint}"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️${NC} Unexpected status ${http_code}: ${endpoint}"
        ((WARNINGS++))
    fi
done

# ========== 输出测试结果 ==========
echo -e "\n=========================================="
echo -e "📊 测试结果汇总"
echo -e "=========================================="
echo -e "${GREEN}✅ 通过: ${PASSED}${NC}"
echo -e "${RED}❌ 失败: ${FAILED}${NC}"
echo -e "${YELLOW}⚠️  警告: ${WARNINGS}${NC}"
echo -e "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  有测试失败，请检查上述输出${NC}"
    exit 1
fi

