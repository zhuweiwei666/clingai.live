#!/bin/bash
SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

echo "=== 紧急修复：克隆代码并部署 ==="

expect << 'EXPECT_SCRIPT'
set timeout 600
spawn ssh -o StrictHostKeyChecking=no root@173.255.193.131

expect {
    "password:" {
        send "Zww199976.@1\r"
        exp_continue
    }
    "# " {
        # 连接成功
    }
}

# 创建源码目录
send "mkdir -p /var/www/honeyai-source\r"
expect "# "
send "cd /var/www/honeyai-source\r"
expect "# "

# 克隆仓库
send "git clone https://github.com/zhuweiwei666/clingai.live.git .\r"
expect {
    "Username" {
        send "\r"
        exp_continue
    }
    "Password" {
        send "\r"
        exp_continue
    }
    "already exists" {
        send "rm -rf * .git\r"
        expect "# "
        send "git clone https://github.com/zhuweiwei666/clingai.live.git .\r"
        exp_continue
    }
    "# " {
        # 成功
    }
}

# 加载 nvm
send "export NVM_DIR=\"/root/.nvm\"\r"
expect "# "
send ". /root/.nvm/nvm.sh\r"
expect "# "
send "nvm use 18\r"
expect "# "

# 创建 .env 文件
send "echo 'VITE_GOOGLE_CLIENT_ID=1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com' > .env\r"
expect "# "

# 安装依赖
send "npm install\r"
expect "# "

# 构建
send "npm run build\r"
expect "# "

# 部署
send "mkdir -p /var/www/honeyai\r"
expect "# "
send "cp -r dist/* /var/www/honeyai/\r"
expect "# "

# 验证
send "head -10 /var/www/honeyai/index.html\r"
expect "# "

send "echo '=== 部署完成 ==='\r"
expect "# "

send "exit\r"
expect eof
EXPECT_SCRIPT

echo "=== 完成 ==="
