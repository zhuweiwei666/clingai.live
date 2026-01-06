# 526 错误故障排除指南

## 已完成的检查

✅ SSL 证书已正确安装
✅ 证书和私钥匹配
✅ Nginx 配置正确
✅ 端口 443 正在监听
✅ 防火墙未阻止

## 可能的原因和解决方案

### 1. Cloudflare 缓存问题

Cloudflare 可能需要时间更新 SSL 连接。尝试：

1. **清除 Cloudflare 缓存**
   - 登录 Cloudflare 控制台
   - 进入 "缓存" (Caching) → "清除缓存" (Purge Everything)
   - 等待 1-2 分钟

2. **等待传播**
   - SSL 设置更改可能需要 5-15 分钟才能完全生效
   - 请耐心等待

### 2. 检查 Cloudflare 源服务器证书设置

在 Cloudflare 控制台：

1. 进入 **SSL/TLS** → **源服务器** (Origin Server)
2. 确保 **"源服务器证书"** 部分显示：
   - ✅ "已安装源服务器证书"
   - 或者选择 "使用 Cloudflare Origin CA 证书"

### 3. 验证证书在 Cloudflare 中正确配置

1. 进入 **SSL/TLS** → **源服务器** (Origin Server)
2. 检查证书是否已上传到 Cloudflare
3. 如果没有，需要：
   - 下载证书文件内容
   - 上传到 Cloudflare 的 "源服务器证书" 部分

### 4. 测试直接连接

从你的电脑测试：

```bash
# 测试 HTTPS 连接（忽略证书验证）
curl -k -I https://clingai.live

# 查看 SSL 证书信息
openssl s_client -connect clingai.live:443 -servername clingai.live < /dev/null 2>&1 | grep -A 5 "Certificate chain"
```

### 5. 检查 Cloudflare SSL 模式

确保设置正确：

- ✅ **Full (strict)** - 需要有效的源服务器证书
- ⚠️ 如果证书未在 Cloudflare 中配置，使用 **Full** 模式（不严格验证）

### 6. 临时解决方案：使用 Full 模式

如果 "Full (strict)" 不工作，可以临时使用 "Full" 模式：

1. Cloudflare 控制台 → SSL/TLS
2. 设置为 **"完全 (Full)"** 而不是 "完全 (严格)"
3. 保存并等待 2-5 分钟

### 7. 检查 DNS 设置

确保 DNS 记录正确：

1. 进入 Cloudflare **DNS** 设置
2. 检查 A 记录：
   - 名称：`@` 或 `clingai.live`
   - 内容：`173.255.193.131`
   - 代理状态：已代理（橙色云朵）

### 8. 查看 Cloudflare 日志

1. 进入 **Analytics** → **Web Traffic**
2. 查看是否有 SSL/TLS 错误
3. 检查错误详情

## 快速检查清单

- [ ] Cloudflare SSL 模式设置为 "Full (strict)" 或 "Full"
- [ ] 等待 5-15 分钟让设置生效
- [ ] 清除浏览器缓存和 Cloudflare 缓存
- [ ] 检查 DNS 记录是否正确
- [ ] 验证源服务器证书已在 Cloudflare 中配置
- [ ] 检查服务器 SSL 证书是否有效（已确认 ✅）

## 如果仍然不工作

1. **临时切换到 Full 模式**（不严格验证）
2. **检查 Cloudflare 的 "源服务器" 设置**，确保证书已上传
3. **联系 Cloudflare 支持**，提供错误详情

## 服务器端状态

✅ Nginx 配置正确
✅ SSL 证书已安装
✅ 端口 443 正在监听
✅ 证书和私钥匹配
✅ HTTPS 服务正常运行

问题很可能在 Cloudflare 端配置，请检查上述 Cloudflare 设置。

