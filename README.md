# HoneyAI - AI女友网站

基于React的现代化AI伴侣平台

## 🚀 快速部署

### 在另一台电脑上从零开始部署

#### 1. 下载部署脚本

```bash
# 方法一：直接下载脚本
curl -O https://raw.githubusercontent.com/zhuweiwei666/clingai.live/main/Clingai-deploy-from-github.sh
chmod +x Clingai-deploy-from-github.sh

# 方法二：克隆仓库
git clone git@github.com:zhuweiwei666/clingai.live.git
cd clingai.live
chmod +x Clingai-deploy-from-github.sh
```

#### 2. 安装必要工具

**macOS:**
```bash
brew install git node expect
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install git nodejs npm expect openssh-client
```

**Linux (CentOS/RHEL):**
```bash
sudo yum install git nodejs npm expect openssh-clients
```

#### 3. 运行部署脚本

```bash
./Clingai-deploy-from-github.sh
```

脚本会自动完成：
- ✅ 从 GitHub 克隆代码
- ✅ 安装依赖
- ✅ 构建项目
- ✅ 部署到服务器

## 📋 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 🛠️ 技术栈

- **React 18** - UI框架
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **Axios** - HTTP客户端
- **Framer Motion** - 动画库

## 📁 项目结构

```
HoneyAI/
├── src/
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── services/       # API服务
│   ├── store/          # 状态管理
│   ├── utils/          # 工具函数
│   └── config/         # 配置文件
├── public/             # 静态资源
├── dist/               # 构建输出
└── Clingai-deploy-from-github.sh  # 部署脚本
```

## 🔧 配置

### 服务器配置

编辑 `Clingai-deploy-from-github.sh` 修改服务器信息：

```bash
SERVER="root@your-server-ip"
PASSWORD="your-password"
REMOTE_DIR="/var/www/honeyai"
```

### API 配置

编辑 `src/config/api.js` 修改 API 地址。

## 📝 部署说明

### 自动部署

使用 `Clingai-deploy-from-github.sh` 脚本，支持：
- 自动克隆代码
- 自动安装依赖
- 自动构建
- 自动部署到服务器

### 手动部署

1. 构建项目：`npm run build`
2. 上传 `dist` 目录到服务器
3. 配置 Nginx

## 🌐 访问

部署成功后访问：http://173.255.193.131

## 📄 许可证

MIT

