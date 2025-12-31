# A2E API 配置示例

## ✅ 您的配置信息

根据您提供的 API Token，系统已自动提取以下信息：

- **User ID**: `69522aad24a43f00606e3e2c`
- **Name**: `18271840225`
- **Role**: `vip`

## 🔧 配置步骤

### 1. 在 `server/.env` 文件中添加以下配置：

```bash
# A2E API Token（必需）
A2E_API_TOKEN=sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTUyMmFhZDI0YTQzZjAwNjA2ZTNlMmMiLCJuYW1lIjoiMTgyNzE4NDAyMjUiLCJyb2xlIjoidmlwIiwiaWF0IjoxNzY3MTQ2NDY2fQ.n24n8XI0TLbysF9rLi3Kr-By5jDtC9CTCLJOMgMDguk

# 用户 ID（可选，系统会自动从 JWT token 中提取）
# 如果自动提取失败，可以手动设置：
# A2E_USER_ID=69522aad24a43f00606e3e2c

# API 接入点（可选，默认使用美国节点）
A2E_BASE_URL=https://video.a2e.ai

# 如果您在中国，可以使用中国节点以获得更低延迟：
# A2E_BASE_URL=https://video.a2e.com.cn
```

### 2. 重启后端服务

配置完成后，重启后端服务：

```bash
cd server
pm2 restart all
# 或
npm start
```

### 3. 验证配置

系统会自动检测 A2E 配置。如果配置正确，您会在日志中看到：

```
[A2E] A2E Service enabled
```

## 📝 注意事项

1. **Token 安全**: 请勿将 API Token 提交到代码仓库
2. **自动提取**: 系统会自动从 JWT token 中提取用户 ID，无需手动设置
3. **VIP 账户**: 您的账户是 VIP 角色，享有更多功能权限

## 🚀 开始使用

配置完成后，所有 AI 生成功能将自动使用 A2E API：

- ✅ 图片转视频
- ✅ 换脸功能
- ✅ 虚拟试穿
- ✅ 文生图
- ✅ 字幕移除

## 📖 更多信息

查看 [A2E_INTEGRATION.md](./A2E_INTEGRATION.md) 了解详细的使用说明和故障排查。

