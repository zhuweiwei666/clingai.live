# Google 登录配置说明

## 📋 功能说明

已集成 Google 登录功能，用户可以使用 Google 账户快速登录。

## 🔧 配置步骤

### 1. 创建 Google OAuth 客户端 ID

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Google+ API**：
   - 导航到 "APIs & Services" > "Library"
   - 搜索 "Google+ API" 并启用
4. 创建 OAuth 2.0 客户端 ID：
   - 导航到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "OAuth client ID"
   - 选择 "Web application"
   - **添加授权的 JavaScript 源**（Authorized JavaScript origins）：
     - `https://clingai.live` (生产环境 - HTTPS)
     - `https://www.clingai.live` (生产环境 - HTTPS)
     - `http://clingai.live` (生产环境 - HTTP，如果需要)
     - `http://www.clingai.live` (生产环境 - HTTP，如果需要)
     - `http://localhost:3000` (开发环境)
   - **添加授权的重定向 URI**（Authorized redirect URIs）：
     - `https://clingai.live` (生产环境 - HTTPS)
     - `https://www.clingai.live` (生产环境 - HTTPS)
     - `http://clingai.live` (生产环境 - HTTP，如果需要)
     - `http://www.clingai.live` (生产环境 - HTTP，如果需要)
     - `http://localhost:3000` (开发环境)
   - **注意**：如果同时使用IP地址访问，也需要添加：
     - JavaScript 源：`http://173.255.193.131`
     - 重定向 URI：`http://173.255.193.131`
   - 复制生成的 **Client ID**

### 2. 配置环境变量

在项目根目录创建 `.env` 文件（如果不存在）：

```bash
# .env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**注意：** 将 `your-google-client-id-here` 替换为你在步骤1中获取的实际 Client ID。

### 3. 后端 API 配置

确保后端实现了 Google 登录接口：

**端点：** `POST /api/user/google-login`

**请求体：**
```json
{
  "google_id": "用户Google ID",
  "email": "用户邮箱",
  "name": "用户名称",
  "picture": "用户头像URL"
}
```

**响应：**
```json
{
  "token": "JWT token",
  "user": {
    "id": 1,
    "username": "用户名称",
    "email": "用户邮箱",
    "avatar": "用户头像URL"
  }
}
```

## 🚀 使用说明

### 用户流程

1. **未登录用户**：
   - 可以访问主页和主播列表页
   - 可以浏览所有内容
   - 点击聊天、充值等功能时会提示登录

2. **登录方式**：
   - 传统用户名/密码登录
   - Google 一键登录（点击"使用 Google 登录"按钮）

3. **登录后**：
   - 可以正常使用所有功能
   - 聊天、充值、个人资料等功能可用

## 📝 代码说明

### 主要修改

1. **App.jsx**：
   - 添加了 `GoogleOAuthProvider` 包装
   - 修改路由，主页和主播列表页无需登录

2. **Login.jsx**：
   - 添加了 Google 登录按钮
   - 使用 `useGoogleLogin` hook 处理 Google 登录

3. **Layout.jsx**：
   - 未登录用户显示"登录"按钮
   - 已登录用户显示用户信息和退出按钮

4. **需要登录的页面**：
   - Chat.jsx - 聊天页面
   - Wallet.jsx - 钱包页面
   - Profile.jsx - 个人资料页面

## ⚠️ 注意事项

1. **开发环境**：确保在 `.env` 文件中配置了正确的 Client ID
2. **生产环境**：需要在 Google Cloud Console 中添加生产环境的域名
3. **后端支持**：确保后端实现了 Google 登录接口
4. **安全性**：不要将 Client ID 提交到公开仓库，使用环境变量管理

## 🔍 故障排查

### Google 登录不工作

1. 检查 `.env` 文件中的 `VITE_GOOGLE_CLIENT_ID` 是否正确
2. 检查 Google Cloud Console 中的授权域名是否正确
3. 检查浏览器控制台是否有错误信息
4. 确保后端 Google 登录接口正常工作

### 登录后无法访问功能

1. 检查后端返回的 token 是否正确
2. 检查 `userStore` 是否正确保存了用户信息
3. 检查路由配置是否正确

