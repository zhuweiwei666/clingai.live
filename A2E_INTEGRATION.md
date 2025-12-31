# A2E.ai API 集成指南

## 📋 概述

本项目已集成 [A2E.ai](https://api.a2e.ai/) API，这是一个经济实惠的 AI Avatar 解决方案提供商。

A2E (Avatars to Everyone) 提供以下功能：
- ✅ 图片转视频 (Image to Video)
- ✅ 换脸 (Face Swap) - 支持图片和视频
- ✅ 虚拟试穿 (Virtual Try-On)
- ✅ 文生图 (Text to Image)
- ✅ 字幕/水印移除 (Caption Removal)
- ✅ 视频转视频 (Video to Video) - 可用于高清放大

## 🔧 配置步骤

### 1. 注册 A2E 账号

访问 [https://video.a2e.ai/](https://video.a2e.ai/) 注册账号，新用户会自动获得免费积分。

### 2. 获取 API Token

1. 登录 A2E 平台
2. 在个人设置中获取 **API Token**
   - Token 格式通常是 `sk_xxxxx` 或 JWT token
   - 如果 token 是 JWT 格式，系统会自动从中提取用户 ID

### 3. 配置环境变量

在 `server/.env` 文件中添加以下配置：

```bash
# A2E API 配置（必需）
A2E_API_TOKEN=sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 用户 ID（可选，如果 token 是 JWT 格式会自动提取）
# 如果 token 不是 JWT 格式，需要手动设置
# A2E_USER_ID=your-user-id-here

# 选择接入点（可选，默认使用美国节点）
# 美国节点（全球用户）
A2E_BASE_URL=https://video.a2e.ai

# 中国节点（中国用户，延迟更低）
# A2E_BASE_URL=https://video.a2e.com.cn
```

**注意：**
- 如果您的 API Token 是 JWT 格式（以 `sk_` 开头），系统会自动从 token 中提取用户 ID
- 如果 token 不是 JWT 格式，需要手动设置 `A2E_USER_ID` 环境变量

### 4. 验证配置

重启后端服务后，系统会自动检测 A2E 配置。如果配置正确，AI 服务将优先使用 A2E API。

## 📚 API 端点映射

| 项目功能 | A2E API 端点 | 说明 |
|---------|-------------|------|
| 图生视频 | `/api/v1/image-to-video/start` | 图片生成视频 |
| 图片换脸 | `/api/v1/face-swap/start` | 图片换脸 |
| 视频换脸 | `/api/v1/face-swap/start` | 视频换脸 |
| AI 换装 | `/api/v1/virtual-try-on/start` | 虚拟试穿 |
| 文生图 | `/api/v1/text-to-image/start` | 文本生成图片 |
| 水印移除 | `/api/v1/caption-removal/start` | 字幕/水印移除 |
| 高清放大 | `/api/v1/video-to-video/start` | 视频转视频 |

## 🔄 服务优先级

系统按以下优先级选择 AI 服务：

1. **A2E.ai** - 如果配置了 `A2E_API_TOKEN` 和 `A2E_USER_ID`
2. **通用 AI API** - 如果配置了 `AI_API_KEY` 和 `AI_API_BASE`
3. **模拟模式** - 如果都未配置（仅用于开发测试）

## 💡 使用建议

### 中国用户

如果您在中国，建议使用中国节点以获得更低的延迟：

```bash
A2E_BASE_URL=https://video.a2e.com.cn
```

### 成本优化

- A2E 提供按分钟计费，成本行业最低
- 新用户注册即可获得免费积分用于测试
- 支持按使用量付费，无需预付大额费用

### 功能限制

- 某些功能可能需要特定的积分或订阅计划
- 建议查看 [A2E 官方文档](https://api.a2e.ai/) 了解详细的功能和限制

## 🐛 故障排查

### 问题：A2E 服务未启用

**检查项：**
1. 确认 `A2E_API_TOKEN` 和 `A2E_USER_ID` 已正确配置
2. 检查环境变量是否正确加载
3. 查看后端日志确认服务状态

### 问题：API 调用失败

**可能原因：**
1. API Token 无效或已过期
2. User ID 不正确
3. 积分不足
4. 网络连接问题

**解决方案：**
1. 重新生成 API Token
2. 检查 A2E 平台中的积分余额
3. 确认网络可以访问 A2E 服务器

### 问题：任务状态查询失败

**检查项：**
1. 确认任务 ID 正确
2. 检查任务类型映射是否正确
3. 查看 A2E API 文档确认端点格式

## 📖 相关资源

- [A2E API 官方文档](https://api.a2e.ai/)
- [A2E 平台](https://video.a2e.ai/)
- [Discord 社区支持](https://discord.gg/batesPBQUE)

## 🔐 安全提示

⚠️ **重要：** 请勿将 API Token 提交到代码仓库。始终使用环境变量管理敏感信息。

## 📝 更新日志

- **2025-01-XX**: 初始集成 A2E.ai API
  - 支持图片转视频
  - 支持换脸功能
  - 支持虚拟试穿
  - 支持文生图
  - 支持字幕移除

