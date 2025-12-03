# 🚀 快速开始 - 在另一台电脑上部署

## ✅ 所有修复已完成并已推送到 GitHub！

### 📋 已修复的问题

1. ✅ **Tailwind CSS 配置** - 完整的颜色和边框配置
2. ✅ **CSS 变量** - 所有必要的 CSS 变量已定义
3. ✅ **构建错误** - 修复了 `border-border` 类不存在的错误
4. ✅ **部署脚本** - 创建了完整的一键部署脚本

## 🎯 在另一台电脑上使用（3步）

### 1️⃣ 下载并运行部署脚本

```bash
# 下载脚本
curl -O https://raw.githubusercontent.com/zhuweiwei666/clingai.live/main/Clingai-deploy-from-github.sh

# 添加执行权限
chmod +x Clingai-deploy-from-github.sh

# 运行脚本（会自动完成所有步骤）
./Clingai-deploy-from-github.sh
```

### 2️⃣ 或者克隆整个项目

```bash
# 克隆项目
git clone git@github.com:zhuweiwei666/clingai.live.git
cd clingai.live

# 运行部署脚本
chmod +x Clingai-deploy-from-github.sh
./Clingai-deploy-from-github.sh
```

### 3️⃣ 安装必要工具（如果还没有）

**macOS:**
```bash
brew install git node expect
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install git nodejs npm expect openssh-client
```

## ✨ 脚本会自动完成

- ✅ 从 GitHub 克隆/更新代码
- ✅ 安装 npm 依赖
- ✅ 构建项目（已修复，不会报错）
- ✅ 上传到服务器
- ✅ 配置 Nginx

## 🌐 部署成功后

访问：**http://173.255.193.131**

## 📝 下次更新

只需再次运行脚本，会自动拉取最新代码并重新部署：

```bash
cd ~/HoneyAI  # 或你的项目目录
./Clingai-deploy-from-github.sh
```

## ❓ 如果遇到问题

1. **无法克隆 GitHub** - 修改脚本使用 HTTPS 地址
2. **构建失败** - 检查 Node.js 版本（建议 v16+）
3. **SSH 连接失败** - 检查服务器状态和网络

查看详细文档：`README.md`

