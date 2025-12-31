# Cloudflare R2 配置说明

## 环境变量配置

在 `server/.env` 文件中添加以下配置：

```env
# Cloudflare R2 配置
R2_ACCOUNT_ID=18f292ca4a886046b6a8ad0b3fa316a0
R2_ACCESS_KEY_ID=a22464d3f1b4513b76081065e0aef973
R2_SECRET_ACCESS_KEY=0b78b662d3d9b8eddd6d49b147ca37cf9f0e86077a3245d29f4a8bd02fedaa57
R2_BUCKET_NAME=clingailive
R2_PUBLIC_URL=https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev
R2_ENDPOINT=https://18f292ca4a886046b6a8ad0b3fa316a0.r2.cloudflarestorage.com
```

## 配置说明

- **R2_ACCOUNT_ID**: Cloudflare 账户 ID
- **R2_ACCESS_KEY_ID**: R2 访问密钥 ID
- **R2_SECRET_ACCESS_KEY**: R2 密钥
- **R2_BUCKET_NAME**: R2 存储桶名称（clingailive）
- **R2_PUBLIC_URL**: R2 公共访问 URL
- **R2_ENDPOINT**: R2 S3 兼容端点

## 功能说明

配置完成后，所有文件上传将自动使用 R2 存储：

1. **图片上传** (`/api/upload/image`): 上传到 `images/` 文件夹
2. **视频上传** (`/api/upload/video`): 上传到 `videos/` 文件夹
3. **文件删除**: 支持从 R2 删除文件
4. **自动回退**: 如果 R2 未配置，将回退到本地存储

## 文件路径结构

在 R2 中的文件路径结构：
- `images/img_1234567890_abc123.jpg`
- `videos/vid_1234567890_abc123.mp4`
- `general/...` (其他文件)

## 公共访问

确保 R2 存储桶已配置公共访问，文件可以通过 `R2_PUBLIC_URL` 直接访问。

## 验证配置

启动服务器后，检查日志中是否显示：
```
[Storage] R2 storage enabled
```

如果显示警告，说明 R2 未正确配置，将使用本地存储。

