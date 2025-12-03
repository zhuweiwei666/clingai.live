# 全自动部署脚本使用说明

## 📋 功能说明

`auto-deploy.sh` 是一个全自动部署脚本，可以一键完成以下所有操作：

1. ✅ **自动推送代码到 GitHub** - 检查并提交本地更改，推送到远程仓库
2. ✅ **服务器自动拉取最新代码** - SSH 连接到服务器，从 GitHub 拉取最新代码
3. ✅ **自动安装依赖** - 在服务器上安装 Node.js 和项目依赖
4. ✅ **自动构建项目** - 在服务器上执行 `npm run build`
5. ✅ **自动部署文件** - 将构建好的文件部署到 Nginx 目录
6. ✅ **自动配置 Nginx** - 创建并配置 Nginx 虚拟主机
7. ✅ **自动重启服务** - 重启 Nginx 服务使配置生效
8. ✅ **错误处理和日志** - 完整的错误处理和日志记录

## 🚀 快速开始

### 1. 确保已安装必要工具

**macOS:**
```bash
brew install git node expect
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install git nodejs npm expect openssh-client
```

### 2. 配置 GitHub SSH 密钥（推荐）

如果使用 SSH 方式连接 GitHub，需要配置 SSH 密钥：

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 复制公钥内容，添加到 GitHub Settings > SSH and GPG keys
```

如果使用 HTTPS，脚本会自动处理。

### 3. 运行部署脚本

```bash
# 在项目根目录执行
./auto-deploy.sh
```

## 📝 脚本配置

编辑 `auto-deploy.sh` 可以修改以下配置：

```bash
# GitHub 配置
GITHUB_REPO="git@github.com:zhuweiwei666/clingai.live.git"
GITHUB_BRANCH="main"  # 或 "master"

# 服务器配置
SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"
NGINX_SERVICE="nginx"
```

## 📊 日志文件

脚本会生成两个日志文件：

- **`deploy.log`** - 完整的部署日志，包含所有操作记录
- **`deploy-error.log`** - 仅包含错误信息

查看日志：
```bash
# 查看完整日志
tail -f deploy.log

# 查看错误日志
cat deploy-error.log
```

## 🔧 脚本执行流程

1. **检查本地环境** - 验证必要的工具和 Git 仓库状态
2. **推送代码** - 自动提交并推送到 GitHub
3. **服务器连接** - SSH 连接到服务器
4. **拉取代码** - 从 GitHub 拉取最新代码到服务器
5. **安装依赖** - 安装 Node.js 和 npm 依赖
6. **构建项目** - 执行 `npm run build`
7. **部署文件** - 复制构建文件到部署目录
8. **配置 Nginx** - 创建 Nginx 配置文件
9. **重启服务** - 重启 Nginx 服务
10. **验证部署** - 检查部署状态

## ⚠️ 注意事项

1. **首次运行**：脚本会自动在服务器上克隆仓库，如果目录已存在会更新代码
2. **未提交的更改**：如果检测到未提交的更改，脚本会询问是否提交
3. **SSH 密钥**：建议配置 SSH 密钥以避免每次输入密码
4. **服务器权限**：确保服务器用户有足够的权限执行部署操作
5. **网络连接**：确保本地和服务器都能访问 GitHub

## 🐛 常见问题

### 问题1: GitHub 推送失败

**原因：** 未配置 SSH 密钥或认证失败

**解决方案：**
```bash
# 配置 SSH 密钥（见上方说明）
# 或使用 HTTPS 方式
git remote set-url origin https://github.com/zhuweiwei666/clingai.live.git
```

### 问题2: SSH 连接失败

**原因：** 服务器不可达或密码错误

**解决方案：**
```bash
# 手动测试连接
ssh root@173.255.193.131

# 检查服务器 IP 和密码是否正确
```

### 问题3: 构建失败

**原因：** Node.js 版本不兼容或依赖安装失败

**解决方案：**
```bash
# 在服务器上手动检查
ssh root@173.255.193.131
cd /root/honeyai
node --version
npm --version
npm install
npm run build
```

### 问题4: Nginx 服务无法启动

**原因：** 配置文件错误或端口被占用

**解决方案：**
```bash
# 在服务器上检查
ssh root@173.255.193.131
nginx -t  # 测试配置
systemctl status nginx  # 查看服务状态
tail -f /var/log/nginx/error.log  # 查看错误日志
```

## 📞 获取帮助

如果遇到问题，请：

1. 查看日志文件：`deploy.log` 和 `deploy-error.log`
2. 检查服务器日志：`/var/log/nginx/error.log`
3. 手动执行各个步骤以定位问题

## 🔄 自动化部署

### 使用 Cron 定时部署

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨2点自动部署）
0 2 * * * cd /path/to/project && ./auto-deploy.sh >> /path/to/deploy-cron.log 2>&1
```

### 使用 Git Hooks

在 `.git/hooks/post-commit` 中添加：

```bash
#!/bin/bash
/path/to/auto-deploy.sh
```

## ✅ 部署成功标志

部署成功后，你应该看到：

```
==========================================
✅ 部署完成！
==========================================
🌐 网站地址: http://173.255.193.131
⏱️  部署耗时: XX 秒
📝 日志文件: deploy.log
==========================================
```

访问 http://173.255.193.131 应该能看到你的网站。

