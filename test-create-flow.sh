#!/bin/bash

echo "=== 测试创建流程 ==="
echo ""

BASE_URL="http://173.255.193.131:3001/api"

# 1. 注册测试用户
echo "1. 注册测试用户..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test_'$(date +%s)'@test.com","password":"test123456","username":"testuser"}')

TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', '') or data.get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 注册失败"
    echo "$REGISTER_RESPONSE" | python3 -m json.tool
    exit 1
fi

echo "✅ 注册成功，Token: ${TOKEN:0:30}..."
echo ""

# 2. 创建测试图片
echo "2. 创建测试图片..."
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png
echo "✅ 测试图片已创建"
echo ""

# 3. 上传图片
echo "3. 上传图片到R2..."
UPLOAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/upload/image" \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "file=@/tmp/test_image.png")

IMAGE_URL=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('url', '') or data.get('url', ''))" 2>/dev/null)

if [ -z "$IMAGE_URL" ]; then
    echo "❌ 上传失败"
    echo "$UPLOAD_RESPONSE" | python3 -m json.tool
    exit 1
fi

echo "✅ 上传成功，图片URL: $IMAGE_URL"
echo ""

# 4. 创建生成任务
echo "4. 创建图生视频任务..."
GENERATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/generate/photo2video" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"sourceImage\":\"${IMAGE_URL}\",\"templateId\":\"1\",\"prompt\":\"test prompt\"}")

TASK_ID=$(echo "$GENERATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('taskId', '') or data.get('taskId', ''))" 2>/dev/null)

if [ -z "$TASK_ID" ]; then
    echo "❌ 创建任务失败"
    echo "$GENERATE_RESPONSE" | python3 -m json.tool
    exit 1
fi

echo "✅ 任务创建成功，Task ID: $TASK_ID"
echo ""

# 5. 查询任务状态
echo "5. 查询任务状态..."
STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/generate/task/${TASK_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

echo "任务状态:"
echo "$STATUS_RESPONSE" | python3 -m json.tool | head -30
echo ""

echo "=== 测试完成 ==="
echo "如果看到任务ID和状态，说明API调用正常工作！"
