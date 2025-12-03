#!/bin/bash

###############################################################################
# 检查Google登录配置
###############################################################################

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

expect << 'EOF'
set timeout 60
spawn ssh -o StrictHostKeyChecking=no root@173.255.193.131

expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "# " {
        send "cd /root/honeyai\r"
        expect "# "
        
        send "echo '=== 1. 检查.env文件 ==='\r"
        expect "# "
        send "cat .env\r"
        expect "# "
        
        send "echo ''\r"
        expect "# "
        send "echo '=== 2. 检查构建文件中的Client ID ==='\r"
        expect "# "
        send "grep -o '1031646438202[^\"'\'' ]*' dist/assets/*.js 2>/dev/null | head -1 || echo '未找到Client ID'\r"
        expect "# "
        
        send "echo ''\r"
        expect "# "
        send "echo '=== 3. 检查是否有默认值 ==='\r"
        expect "# "
        send "grep -c 'YOUR_GOOGLE_CLIENT_ID' dist/assets/*.js 2>/dev/null && echo '❌ 仍使用默认值' || echo '✅ 未使用默认值'\r"
        expect "# "
        
        send "echo ''\r"
        expect "# "
        send "echo '=== 4. 检查构建文件大小和时间 ==='\r"
        expect "# "
        send "ls -lh dist/assets/*.js\r"
        expect "# "
        
        send "echo ''\r"
        expect "# "
        send "echo '=== 5. 检查部署目录文件 ==='\r"
        expect "# "
        send "ls -lh /var/www/honeyai/assets/*.js 2>/dev/null | head -1\r"
        expect "# "
        
        send "echo ''\r"
        expect "# "
        send "echo '=== 6. 检查Nginx错误日志（最近5条）==='\r"
        expect "# "
        send "tail -5 /var/log/nginx/error.log 2>/dev/null || echo '无错误日志'\r"
        expect "# "
        
        send "exit\r"
    }
    timeout {
        puts "连接超时"
        exit 1
    }
}
expect eof
EOF

