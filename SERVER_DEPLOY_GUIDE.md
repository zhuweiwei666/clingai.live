# 服务器端自动部署指南

## 📋 简介

`server-auto-deploy.sh` 是一个在服务器上运行的自动部署脚本，可以：
- ✅ 自动从 GitHub 拉取最新代码
- ✅ 自动安装/更新依赖
- ✅ 自动构建项目
- ✅ 自动部署到 Nginx 目录
- ✅ 自动配置 Nginx
- ✅ 自动重启 Nginx 服务

## 🚀 快速开始

### 1. 将脚本上传到服务器

#### 方法一：直接下载到服务器

```bash
# SSH 连接到服务器
ssh root@173.255.193.131

# 下载脚本
curl -O https://raw.githubusercontent.com/zhuweiwei666/clingai.live/main/server-auto-deploy.sh

# 添加执行权限
chmod +x server-auto-deploy.sh
```

#### 方法二：从本地上传

```bash
# 在本地执行
scp server-auto-deploy.sh root@173.255.193.131:/root/

# SSH 连接到服务器
ssh root@173.255.193.131

# 添加执行权限
chmod +x /root/server-auto-deploy.sh
```

### 2. 配置 GitHub 访问

#### 如果使用 SSH 地址（推荐）

```bash
# 在服务器上生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "server@honeyai"

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 复制公钥内容，添加到 GitHub Settings > SSH and GPG keys
```

#### 如果使用 HTTPS 地址

编辑脚本，修改这一行：
```bash
GITHUB_REPO="https://github.com/zhuweiwei666/clingai.live.git"
```

### 3. 安装必要工具

脚本会自动检查并安装，但也可以手动安装：

```bash
apt-get update
apt-get install -y git nodejs npm nginx
```

### 4. 运行部署脚本

```bash
# 运行脚本
/root/server-auto-deploy.sh

# 或者如果脚本在当前目录
./server-auto-deploy.sh
```

## 📝 脚本配置

编辑脚本可以修改以下配置：

```bash
# GitHub 仓库地址
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"

# 项目克隆目录（代码存放位置）
PROJECT_DIR="/root/honeyai"

# 部署目录（Nginx 网站根目录）
DEPLOY_DIR="/var/www/honeyai"

# Nginx 服务名
NGINX_SERVICE="nginx"
```

## 🔄 自动化部署

### 方法一：使用 Cron 定时部署

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天凌晨2点自动部署）
0 2 * * * /root/server-auto-deploy.sh >> /var/log/honeyai-deploy.log 2>&1

# 或者每小时部署一次
0 * * * * /root/server-auto-deploy.sh >> /var/log/honeyai-deploy.log 2>&1
```

### 方法二：使用 GitHub Webhook（推荐）

1. **在服务器上创建 Webhook 接收脚本**

```bash
cat > /root/webhook-deploy.sh << 'EOF'
#!/bin/bash
# GitHub Webhook 接收脚本
cd /root && ./server-auto-deploy.sh
EOF

chmod +x /root/webhook-deploy.sh
```

2. **配置 Webhook 服务器**（使用 nodejs 或 python）

3. **在 GitHub 仓库设置 Webhook**
   - Settings > Webhooks > Add webhook
   - Payload URL: `http://your-server-ip:port/webhook`
   - Content type: `application/json`
   - Events: `Just the push event`

### 方法三：手动触发

```bash
# 随时运行脚本进行部署
/root/server-auto-deploy.sh
```

## 🔍 脚本功能详解

### 1. 检查工具
- 自动检查 git、node、npm 是否安装
- 如果缺少，自动安装

### 2. 更新代码
- 如果项目目录存在，拉取最新代码
- 如果不存在，从 GitHub 克隆

### 3. 安装依赖
- 检查 node_modules 是否存在
- 如果不存在或 package.json 更新，重新安装

### 4. 构建项目
- 清理旧的构建文件
- 运行 `npm run build`
- 验证构建结果

### 5. 部署文件
- 备份旧文件（带时间戳）
- 复制新文件到部署目录
- 设置正确的文件权限

### 6. 配置 Nginx
- 创建/更新 Nginx 配置
- 启用站点配置
- 删除默认站点

### 7. 重启服务
- 测试 Nginx 配置
- 重载 Nginx（不中断服务）
- 检查服务状态

### 8. 清理备份
- 自动清理旧备份（保留最近5个）

## 📊 日志和监控

### 查看部署日志

```bash
# 如果使用 cron，查看日志
tail -f /var/log/honeyai-deploy.log

# 或者直接运行脚本查看输出
/root/server-auto-deploy.sh
```

### 检查部署状态

```bash
# 检查项目目录
ls -la /root/honeyai

# 检查部署目录
ls -la /var/www/honeyai

# 检查 Nginx 状态
systemctl status nginx

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

## 🛠️ 故障排除

### 问题：Git 克隆失败

**解决方案：**
1. 检查网络连接
2. 检查 SSH 密钥配置
3. 或使用 HTTPS 地址

### 问题：npm install 失败

**解决方案：**
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf /root/honeyai/node_modules
/root/server-auto-deploy.sh
```

### 问题：构建失败

**解决方案：**
```bash
# 检查 Node.js 版本
node -v  # 应该是 v16+

# 检查错误信息
cd /root/honeyai
npm run build
```

### 问题：Nginx 配置错误

**解决方案：**
```bash
# 测试配置
nginx -t

# 查看错误
tail -20 /var/log/nginx/error.log
```

### 问题：文件权限问题

**解决方案：**
```bash
# 修复权限
chown -R www-data:www-data /var/www/honeyai
chmod -R 755 /var/www/honeyai
```

## 🔐 安全建议

1. **使用 SSH 密钥而不是密码**
   ```bash
   # 配置 SSH 密钥认证
   ssh-copy-id root@173.255.193.131
   ```

2. **限制脚本执行权限**
   ```bash
   chmod 700 /root/server-auto-deploy.sh
   ```

3. **使用非 root 用户**（如果可能）
   - 创建专用部署用户
   - 配置 sudo 权限

4. **定期备份**
   - 脚本自动备份，但建议额外备份重要数据

## 📝 示例：完整部署流程

```bash
# 1. SSH 连接到服务器
ssh root@173.255.193.131

# 2. 下载脚本
curl -O https://raw.githubusercontent.com/zhuweiwei666/clingai.live/main/server-auto-deploy.sh
chmod +x server-auto-deploy.sh

# 3. 配置 GitHub SSH 密钥（如果需要）
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub
# 复制到 GitHub

# 4. 运行部署
./server-auto-deploy.sh

# 5. 设置定时任务（可选）
crontab -e
# 添加: 0 2 * * * /root/server-auto-deploy.sh >> /var/log/honeyai-deploy.log 2>&1
```

## ✅ 验证部署

部署成功后：

1. **访问网站**: http://173.255.193.131
2. **检查服务状态**: `systemctl status nginx`
3. **查看部署目录**: `ls -la /var/www/honeyai`

## 🎯 总结

使用 `server-auto-deploy.sh` 可以：
- 一键完成所有部署步骤
- 自动处理错误和回滚
- 支持定时自动部署
- 自动备份和清理

只需在服务器上运行一次脚本，即可完成整个部署流程！

