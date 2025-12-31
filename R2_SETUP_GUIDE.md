# Cloudflare R2 存储配置指南

## 已配置信息

根据您提供的 Cloudflare R2 凭证，已配置以下信息：

- **Bucket 名称**: `clingailive`
- **公共 URL**: `https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev`
- **Account ID**: `18f292ca4a886046b6a8ad0b3fa316a0`
- **Endpoint**: `https://18f292ca4a886046b6a8ad0b3fa316a0.r2.cloudflarestorage.com`

## 环境变量配置

在 `server/.env` 文件中添加以下配置：

```env
# Cloudflare R2 Storage Configuration
R2_ACCOUNT_ID=18f292ca4a886046b6a8ad0b3fa316a0
R2_ACCESS_KEY_ID=a22464d3f1b4513b76081065e0aef973
R2_SECRET_ACCESS_KEY=0b78b662d3d9b8eddd6d49b147ca37cf9f0e86077a3245d29f4a8bd02fedaa57
R2_BUCKET_NAME=clingailive
R2_PUBLIC_URL=https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev
R2_ENDPOINT=https://18f292ca4a886046b6a8ad0b3fa316a0.r2.cloudflarestorage.com
```

## 已实现的功能

### 1. 文件上传到 R2
- ✅ 图片上传 (`/api/upload/image`) → 存储到 `images/` 文件夹
- ✅ 视频上传 (`/api/upload/video`) → 存储到 `videos/` 文件夹
- ✅ 自动生成唯一文件名
- ✅ 返回公共访问 URL

### 2. 文件删除
- ✅ 支持从 R2 删除文件
- ✅ 自动处理 URL 解析

### 3. 自动回退
- ✅ 如果 R2 未配置，自动回退到本地存储（开发环境）

## 文件路径结构

在 R2 存储桶中的文件组织方式：

```
clingailive/
├── images/
│   ├── img_1234567890_abc123.jpg
│   └── img_1234567890_def456.png
├── videos/
│   ├── vid_1234567890_abc123.mp4
│   └── vid_1234567890_def456.mov
└── general/
    └── ...
```

## 验证配置

### 1. 检查存储状态

启动服务器后，访问：
```
GET /api/storage/status
```

应该返回：
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "type": "R2",
    "bucket": "clingailive",
    "publicUrl": "https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev"
  }
}
```

### 2. 检查服务器日志

启动服务器时，应该看到：
```
[Storage] R2 storage enabled
```

如果看到警告：
```
[Storage] R2 not configured, using local storage
```

说明环境变量未正确配置。

## 测试上传

### 使用 curl 测试图片上传：

```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

成功响应：
```json
{
  "success": true,
  "data": {
    "url": "https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev/images/img_1234567890_abc123.jpg",
    "path": "https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev/images/img_1234567890_abc123.jpg",
    "filename": "img_1234567890_abc123.jpg",
    "size": 123456,
    "mimetype": "image/jpeg"
  }
}
```

## 公共访问配置

确保在 Cloudflare R2 控制台中：

1. **存储桶设置** → 启用公共访问
2. **自定义域名** → 已配置 `pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev`
3. **CORS 设置** → 允许来自您的前端域名的请求

## 注意事项

1. **安全性**: 确保 `.env` 文件不被提交到 Git
2. **文件大小限制**: 
   - 图片：最大 10MB
   - 视频：最大 50MB
3. **费用**: R2 存储和流量费用，请查看 Cloudflare 定价
4. **备份**: 建议定期备份重要文件

## 故障排除

### 问题：上传失败，返回 500 错误

**检查**:
1. 环境变量是否正确配置
2. R2 凭证是否有效
3. 存储桶是否存在且可访问
4. 网络连接是否正常

### 问题：文件上传成功但无法访问

**检查**:
1. R2 存储桶是否配置了公共访问
2. 自定义域名是否正确配置
3. CORS 设置是否允许您的域名

### 问题：显示 "R2 not configured"

**解决**:
1. 检查 `server/.env` 文件是否存在
2. 确认所有 R2 相关环境变量都已设置
3. 重启服务器

## 代码变更

已更新的文件：
- ✅ `server/services/storageService.js` - 实现 R2 存储
- ✅ `server/routes/upload.js` - 更新上传路由以使用 R2
- ✅ `server/index.js` - 添加存储状态检查端点
- ✅ `server/package.json` - 添加 `@aws-sdk/client-s3` 依赖

## 下一步

1. 在 `server/.env` 中添加 R2 配置
2. 重启服务器
3. 测试文件上传功能
4. 验证文件可以通过公共 URL 访问

