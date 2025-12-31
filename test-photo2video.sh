#!/bin/bash

# 测试图生视频API
echo "=== 测试图生视频API ==="
echo ""

# 1. 先注册/登录获取token
echo "1. 注册测试用户..."
REGISTER_RESPONSE=$(curl -s -X POST http://173.255.193.131:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_photo2video_'$(date +%s)'@test.com",
    "password": "test123456",
    "username": "testuser"
  }')

echo "注册响应: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 注册失败，尝试登录..."
  LOGIN_RESPONSE=$(curl -s -X POST http://173.255.193.131:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test_photo2video@test.com",
      "password": "test123456"
    }')
  TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ 无法获取token，退出"
  exit 1
fi

echo "✅ Token获取成功: ${TOKEN:0:50}..."
echo ""

# 2. 测试图生视频API
echo "2. 测试图生视频API..."
PHOTO2VIDEO_RESPONSE=$(curl -s -X POST http://173.255.193.131:3001/api/generate/photo2video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sourceImage": "https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev/images/test.jpg",
    "templateId": "1",
    "prompt": "test",
    "params": {}
  }')

echo "响应: $PHOTO2VIDEO_RESPONSE"
echo ""

# 检查响应
if echo "$PHOTO2VIDEO_RESPONSE" | grep -q "taskId"; then
  echo "✅ 图生视频API调用成功！"
  TASK_ID=$(echo $PHOTO2VIDEO_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('taskId', ''))" 2>/dev/null)
  echo "Task ID: $TASK_ID"
else
  echo "❌ 图生视频API调用失败"
  echo "$PHOTO2VIDEO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PHOTO2VIDEO_RESPONSE"
fi

