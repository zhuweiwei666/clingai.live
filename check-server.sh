#!/bin/bash

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

# 创建服务器端检查脚本
cat > /tmp/server-check.sh << 'CHECK_SCRIPT'
#!/bin/bash
cd /root/honeyai

echo "=== 1. 检查.env文件 ==="
cat .env
echo ""

echo "=== 2. 检查构建文件中的Client ID ==="
if grep -q "1031646438202" dist/assets/*.js 2>/dev/null; then
    echo "✅ 找到Client ID"
    grep -o "1031646438202[^\"]*" dist/assets/*.js 2>/dev/null | head -1
else
    echo "❌ 未找到Client ID"
fi
echo ""

echo "=== 3. 检查是否有默认值YOUR_GOOGLE_CLIENT_ID ==="
if grep -q "YOUR_GOOGLE_CLIENT_ID" dist/assets/*.js 2>/dev/null; then
    echo "❌ 仍使用默认值"
    grep -c "YOUR_GOOGLE_CLIENT_ID" dist/assets/*.js 2>/dev/null
else
    echo "✅ 未使用默认值"
fi
echo ""

echo "=== 4. 检查构建文件 ==="
ls -lh dist/assets/*.js
echo ""

echo "=== 5. 检查部署目录 ==="
ls -lh /var/www/honeyai/assets/*.js 2>/dev/null | head -1
echo ""

echo "=== 6. 检查Nginx错误日志（最近10条）==="
tail -10 /var/log/nginx/error.log 2>/dev/null | grep -i "error\|warn" || echo "无错误"
echo ""

echo "=== 7. 检查package.json中的依赖 ==="
grep -A 5 "dependencies" package.json | grep google || echo "未找到google相关依赖"
CHECK_SCRIPT

expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/server-check.sh $SERVER:/tmp/server-check.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

expect << EOF
set timeout 60
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/server-check.sh && bash /tmp/server-check.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/server-check.sh

