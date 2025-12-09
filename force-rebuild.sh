#!/bin/bash
SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"

echo "=== 强制重新构建并部署 ==="

expect << 'EXPECT_SCRIPT'
set timeout 300
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

# 进入项目目录
send "cd /var/www/honeyai-source\r"
expect "# "

# 拉取最新代码
send "git pull origin main\r"
expect "# "

# 加载 nvm
send "export NVM_DIR=\"/root/.nvm\"\r"
expect "# "
send ". /root/.nvm/nvm.sh\r"
expect "# "
send "nvm use 18\r"
expect "# "

# 安装依赖
send "npm install\r"
expect "# "

# 重新构建（清除缓存）
send "rm -rf dist\r"
expect "# "
send "npm run build\r"
expect "# "

# 部署到 web 目录（清除旧文件）
send "rm -rf /var/www/honeyai/*\r"
expect "# "
send "cp -r dist/* /var/www/honeyai/\r"
expect "# "

# 验证部署
send "head -20 /var/www/honeyai/index.html\r"
expect "# "

send "echo '=== 构建完成 ==='\r"
expect "# "

send "exit\r"
expect eof
EXPECT_SCRIPT

echo "=== 部署完成 ==="
