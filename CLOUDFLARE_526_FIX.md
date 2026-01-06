# Cloudflare 526 错误修复指南

## 问题说明

526 错误表示 Cloudflare 无法与源站建立 SSL 连接。这通常发生在：
- Cloudflare SSL/TLS 模式设置为 "Full" 或 "Full (strict)"
- 但源站（服务器）没有有效的 SSL 证书

## 解决方案

### 方案 1：使用 Cloudflare Flexible SSL 模式（推荐，最简单）

1. 登录 Cloudflare 控制台
2. 选择域名 `clingai.live`
3. 进入 **SSL/TLS** 设置
4. 将 **SSL/TLS 加密模式** 设置为 **"Flexible"**
5. 保存设置

这样配置后：
- 用户到 Cloudflare：HTTPS（加密）
- Cloudflare 到源站：HTTP（不需要 SSL 证书）

### 方案 2：配置 SSL 证书并使用 Full 模式（更安全）

如果需要端到端加密，需要为源站配置 SSL 证书：

#### 2.1 安装 Certbot（Let's Encrypt）

```bash
ssh root@173.255.193.131
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y
```

#### 2.2 获取 SSL 证书

```bash
sudo certbot --nginx -d clingai.live -d www.clingai.live
```

#### 2.3 更新 Nginx 配置

证书安装后，Certbot 会自动更新 Nginx 配置。或者手动更新：

```nginx
server {
    listen 443 ssl http2;
    server_name clingai.live www.clingai.live;
    
    ssl_certificate /etc/letsencrypt/live/clingai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clingai.live/privkey.pem;
    
    # ... 其他配置
}
```

#### 2.4 设置 Cloudflare SSL 模式为 "Full"

1. 登录 Cloudflare 控制台
2. 将 SSL/TLS 模式设置为 **"Full"**
3. 保存设置

### 方案 3：使用 Cloudflare Origin Certificate（推荐用于生产环境）

1. 在 Cloudflare 控制台生成 Origin Certificate
2. 将证书安装到服务器
3. 更新 Nginx 配置使用 Origin Certificate
4. 设置 SSL 模式为 "Full (strict)"

## 当前状态

- ✅ Nginx 配置已更新，支持 Cloudflare 代理头
- ✅ 服务器 HTTP 服务正常运行（端口 80）
- ⚠️ 需要在 Cloudflare 控制台设置 SSL 模式

## 验证步骤

1. **检查服务器 HTTP 响应**：
   ```bash
   curl -I http://173.255.193.131
   ```
   应该返回 200 OK

2. **检查 Cloudflare SSL 模式**：
   - 登录 Cloudflare 控制台
   - 查看 SSL/TLS 设置
   - 确保设置为 "Flexible"（如果使用方案 1）

3. **访问网站**：
   - https://clingai.live（应该可以正常访问）

## 常见问题

### Q: 为什么会出现 526 错误？
A: Cloudflare 尝试使用 HTTPS 连接到源站，但源站没有有效的 SSL 证书。

### Q: Flexible 模式安全吗？
A: Flexible 模式在用户和 Cloudflare 之间使用 HTTPS，但 Cloudflare 到源站使用 HTTP。对于大多数应用来说已经足够安全。

### Q: 如何实现端到端加密？
A: 使用方案 2 或方案 3，为源站配置 SSL 证书，然后设置 Cloudflare 为 "Full" 或 "Full (strict)" 模式。

## 下一步

1. **立即操作**：在 Cloudflare 控制台将 SSL 模式设置为 "Flexible"
2. **长期优化**：考虑配置 SSL 证书使用 "Full" 模式

